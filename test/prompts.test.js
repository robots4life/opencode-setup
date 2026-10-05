import test from "node:test";
import assert from "node:assert/strict";
import { promptSelections } from "../src/prompts.js";

const CANCEL = Symbol("clack-cancel");

// Run `fn` with process.exit stubbed to throw, so we can assert cancellation
// branches without killing the test process.
async function run(fn) {
  const original = process.exit;
  let exitCode;
  process.exit = (code) => {
    exitCode = code;
    const err = new Error("__exit__");
    err.__exit = true;
    throw err;
  };
  try {
    const value = await fn();
    return { exited: false, value, exitCode };
  } catch (err) {
    if (err.__exit) return { exited: true, exitCode };
    throw err;
  } finally {
    process.exit = original;
  }
}

function sequence(values) {
  let i = 0;
  return async () => values[i++];
}

function fake(prompts = {}) {
  return {
    multiselect: async () => [],
    select: async () => undefined,
    confirm: async () => true,
    outro: () => {},
    cancel: () => {},
    isCancel: (value) => value === CANCEL,
    ...prompts,
  };
}

test("prompts: cancels when frameworks are cancelled", async () => {
  let cancelled = false;
  const prompts = fake({
    multiselect: async () => CANCEL,
    cancel: () => (cancelled = true),
  });
  const { exited, exitCode } = await run(() =>
    promptSelections(false, prompts),
  );
  assert.ok(exited);
  assert.equal(exitCode, 0);
  assert.ok(cancelled);
});

test("prompts: cancels when MCP tools are cancelled", async () => {
  const prompts = fake({ multiselect: sequence([["svelte"], CANCEL]) });
  const { exited, exitCode } = await run(() =>
    promptSelections(false, prompts),
  );
  assert.ok(exited);
  assert.equal(exitCode, 0);
});

test("prompts: cancels when skills are cancelled", async () => {
  const prompts = fake({
    multiselect: sequence([["svelte"], [], CANCEL]),
  });
  const { exited, exitCode } = await run(() =>
    promptSelections(false, prompts),
  );
  assert.ok(exited);
  assert.equal(exitCode, 0);
});

test("prompts: records the merge action for an existing project", async () => {
  const prompts = fake({
    multiselect: sequence([["svelte"], ["sanity"], ["docs"]]),
    select: sequence(["merge"]),
  });
  const { exited, value } = await run(() => promptSelections(true, prompts));
  assert.equal(exited, false);
  assert.deepEqual(value, {
    frameworkIds: ["svelte"],
    mcpIds: ["sanity"],
    skillIds: ["docs"],
    action: "merge",
  });
});

test("prompts: records the overwrite action for an existing project", async () => {
  const prompts = fake({
    multiselect: sequence([["svelte"], [], []]),
    select: sequence(["overwrite"]),
  });
  const { exited, value } = await run(() => promptSelections(true, prompts));
  assert.equal(exited, false);
  assert.equal(value.action, "overwrite");
});

test("prompts: cancels when the existing-project action is cancel", async () => {
  const prompts = fake({
    multiselect: sequence([["svelte"], [], []]),
    select: sequence(["cancel"]),
  });
  const { exited, exitCode } = await run(() => promptSelections(true, prompts));
  assert.ok(exited);
  assert.equal(exitCode, 0);
});

test("prompts: exits when nothing is selected", async () => {
  let outroMessage;
  const prompts = fake({
    multiselect: sequence([[], [], []]),
    outro: (message) => (outroMessage = message),
  });
  const { exited, exitCode } = await run(() =>
    promptSelections(false, prompts),
  );
  assert.ok(exited);
  assert.equal(exitCode, 0);
  assert.match(outroMessage, /Nothing selected/);
});

test("prompts: cancels when the confirmation is declined", async () => {
  let cancelled = false;
  const prompts = fake({
    multiselect: sequence([["svelte"], [], []]),
    confirm: async () => false,
    cancel: () => (cancelled = true),
  });
  const { exited, exitCode } = await run(() =>
    promptSelections(false, prompts),
  );
  assert.ok(exited);
  assert.equal(exitCode, 0);
  assert.ok(cancelled);
});

test("prompts: returns selections with no action on a fresh project", async () => {
  const prompts = fake({
    multiselect: sequence([["svelte"], ["sanity"], ["docs"]]),
    confirm: async () => true,
  });
  const { exited, value } = await run(() => promptSelections(false, prompts));
  assert.equal(exited, false);
  assert.deepEqual(value, {
    frameworkIds: ["svelte"],
    mcpIds: ["sanity"],
    skillIds: ["docs"],
  });
  assert.ok(!("action" in value));
});
