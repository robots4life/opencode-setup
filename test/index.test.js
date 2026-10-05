import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  main,
  shouldWarnAboutTokens,
  computeNextSteps,
  runScaffold,
} from "../src/index.js";
import { FRAMEWORKS } from "../src/registry.js";

const SVELTE_COMMANDS = FRAMEWORKS.find((f) => f.id === "svelte").commands;
const sel = (over = {}) => ({
  mcpIds: ["sanity"],
  action: "overwrite",
  ...over,
});

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "opcup-index-"));
}

function sequence(values) {
  let i = 0;
  return async () => values[i++];
}

function fakePrompts(overrides = {}) {
  const calls = { intro: [], note: [], outro: [] };
  return {
    intro: (m) => calls.intro.push(m),
    outro: (m) => calls.outro.push(m),
    note: (m, title) => calls.note.push([m, title]),
    spinner: () => ({ start: () => {}, stop: () => {} }),
    multiselect: async () => [],
    select: async () => "yes",
    confirm: async () => true,
    cancel: () => {},
    isCancel: () => false,
    ...overrides,
    __calls: calls,
  };
}

test("shouldWarnAboutTokens: only when overwriting, no MCP, tokens exist", () => {
  assert.equal(shouldWarnAboutTokens(true, sel({ mcpIds: [] }), true), true);
  assert.equal(shouldWarnAboutTokens(true, sel({ mcpIds: [] }), false), false);
  assert.equal(
    shouldWarnAboutTokens(true, sel({ mcpIds: ["sanity"] }), true),
    false,
  );
  assert.equal(
    shouldWarnAboutTokens(true, sel({ mcpIds: [], action: "merge" }), true),
    false,
  );
  assert.equal(shouldWarnAboutTokens(false, sel({ mcpIds: [] }), true), false);
});

test("computeNextSteps: mentions tokens only for token-bearing MCPs", () => {
  assert.deepEqual(computeNextSteps({ mcpIds: ["sanity"] }), [
    "Add API tokens to placeholder files in .opencode/tokens/",
    "Launch with: opencode",
  ]);
  assert.deepEqual(computeNextSteps({ mcpIds: [] }), ["Launch with: opencode"]);
});

test("runScaffold: generate on fresh dir, merge when existing + action merge", () => {
  const dir = tmp();
  try {
    const selections = { frameworkIds: ["svelte"], mcpIds: [], skillIds: [] };
    runScaffold(dir, selections, false);
    const custom = path.join(dir, ".opencode", "commands", "custom.md");
    fs.writeFileSync(custom, "KEEP\n", "utf-8");

    runScaffold(dir, { ...selections, action: "merge" }, true);
    assert.equal(
      fs.readFileSync(custom, "utf-8"),
      "KEEP\n",
      "merge keeps custom",
    );

    runScaffold(dir, { ...selections, action: "overwrite" }, true);
    assert.ok(!fs.existsSync(custom), "generate wipes custom");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("main: fresh project scaffolds and reports next steps", async () => {
  const dir = tmp();
  try {
    const prompts = fakePrompts({
      multiselect: sequence([["svelte"], [], []]),
    });
    await main({ prompts, cwd: () => dir });

    const commands = fs
      .readdirSync(path.join(dir, ".opencode", "commands"))
      .filter((f) => f.endsWith(".md"));
    assert.equal(commands.length, SVELTE_COMMANDS.length);
    assert.equal(prompts.__calls.outro[0], path.join(dir, ".opencode"));
    const nextSteps = prompts.__calls.note.find(
      ([, title]) => title === "Next steps",
    );
    assert.ok(nextSteps, "next steps note shown");
    assert.match(nextSteps[0], /Launch with: opencode/);
    assert.ok(!/tokens/.test(nextSteps[0]), "no token step without an MCP");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("main: existing project merges when selected", async () => {
  const dir = tmp();
  try {
    runScaffold(
      dir,
      { frameworkIds: ["svelte"], mcpIds: [], skillIds: [] },
      false,
    );
    const custom = path.join(dir, ".opencode", "commands", "custom.md");
    fs.writeFileSync(custom, "KEEP\n", "utf-8");

    const prompts = fakePrompts({
      multiselect: sequence([["svelte"], [], []]),
      select: sequence(["merge"]),
    });
    await main({ prompts, cwd: () => dir });

    assert.equal(fs.readFileSync(custom, "utf-8"), "KEEP\n");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("main: warns and preserves tokens when declined on overwrite", async () => {
  const dir = tmp();
  try {
    runScaffold(
      dir,
      { frameworkIds: ["svelte"], mcpIds: ["sanity"], skillIds: [] },
      false,
    );
    const token = path.join(dir, ".opencode", "tokens", "sanity-token");
    fs.writeFileSync(token, "SECRET", "utf-8");

    let cancelled = false;
    const prompts = fakePrompts({
      multiselect: sequence([["svelte"], [], []]),
      select: sequence(["overwrite", "no"]),
      cancel: () => (cancelled = true),
    });
    const exit = () => {
      const err = new Error("__exit__");
      err.__exit = true;
      throw err;
    };
    await assert.rejects(
      () => main({ prompts, cwd: () => dir, exit }),
      (err) => err.__exit === true,
    );

    assert.ok(cancelled);
    assert.equal(fs.readFileSync(token, "utf-8"), "SECRET", "tokens untouched");
    assert.equal(prompts.__calls.outro.length, 0, "did not scaffold");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("main: no warning when an MCP keeps the token directory", async () => {
  const dir = tmp();
  try {
    runScaffold(
      dir,
      { frameworkIds: ["svelte"], mcpIds: ["sanity"], skillIds: [] },
      false,
    );
    const token = path.join(dir, ".opencode", "tokens", "sanity-token");
    fs.writeFileSync(token, "SECRET", "utf-8");

    const prompts = fakePrompts({
      multiselect: sequence([["svelte"], ["sanity"], []]),
      select: sequence(["overwrite"]),
    });
    await main({ prompts, cwd: () => dir });

    assert.equal(fs.readFileSync(token, "utf-8"), "SECRET");
    const nextSteps = prompts.__calls.note.find(
      ([, title]) => title === "Next steps",
    );
    assert.match(nextSteps[0], /Add API tokens/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("main: uses the default cwd and exit on a fresh project", async () => {
  const dir = tmp();
  const originalCwd = process.cwd();
  const originalExit = process.exit;
  let exited = false;
  try {
    process.chdir(dir);
    process.exit = (code) => {
      exited = true;
      const err = new Error("__exit__");
      err.__exit = true;
      err.code = code;
      throw err;
    };
    const prompts = fakePrompts({
      multiselect: sequence([["svelte"], [], []]),
    });

    await main({ prompts });

    assert.ok(!exited);
    assert.ok(
      fs.existsSync(path.join(dir, ".opencode", "commands", "svelte.md")),
    );
  } finally {
    process.exit = originalExit;
    process.chdir(originalCwd);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("main: default exit stops on a declined overwrite warning", async () => {
  const dir = tmp();
  const originalCwd = process.cwd();
  const originalExit = process.exit;
  try {
    runScaffold(
      dir,
      { frameworkIds: ["svelte"], mcpIds: ["sanity"], skillIds: [] },
      false,
    );
    const token = path.join(dir, ".opencode", "tokens", "sanity-token");
    fs.writeFileSync(token, "SECRET", "utf-8");

    process.chdir(dir);
    process.exit = (code) => {
      const err = new Error("__exit__");
      err.__exit = true;
      err.code = code;
      throw err;
    };
    const prompts = fakePrompts({
      multiselect: sequence([["svelte"], [], []]),
      select: sequence(["overwrite", "no"]),
    });

    await assert.rejects(
      () => main({ prompts }),
      (err) => err.__exit === true,
    );
    assert.equal(fs.readFileSync(token, "utf-8"), "SECRET");
  } finally {
    process.exit = originalExit;
    process.chdir(originalCwd);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
