import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FRAMEWORKS, MCPS, SKILLS } from "../src/registry.js";

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMMANDS = path.join(REPO, "template", "commands");

function hasCommandFile(name) {
  const file = `${name}.md`;
  for (const entry of fs.readdirSync(COMMANDS, { recursive: true })) {
    if (entry === file || entry.endsWith(`/${file}`)) return true;
  }
  return false;
}

test("registry: svelte framework declares plugin and deps", () => {
  const svelte = FRAMEWORKS.find((f) => f.id === "svelte");
  assert.ok(svelte, "svelte framework is present");
  assert.ok(svelte.plugins.includes("@sveltejs/opencode"));
  assert.ok(svelte.deps?.["@sveltejs/opencode"]);
});

test("registry: framework command names are unique", () => {
  const names = FRAMEWORKS.flatMap((f) => f.commands);
  assert.equal(new Set(names).size, names.length, "duplicate command name");
});

test("registry: every framework command has a template file", () => {
  for (const fw of FRAMEWORKS) {
    for (const cmd of fw.commands) {
      assert.ok(hasCommandFile(cmd), `missing template for ${fw.id}/${cmd}`);
    }
  }
});

test("registry: every skill has a template file", () => {
  for (const skill of SKILLS) {
    assert.ok(
      hasCommandFile(skill.command),
      `missing template for skill ${skill.id}`,
    );
  }
});

test("registry: MCP token files live under tokens/", () => {
  for (const mcp of MCPS) {
    for (const tf of mcp.tokenFiles ?? []) {
      assert.ok(tf.startsWith("tokens/"), `${mcp.id} token file ${tf}`);
    }
  }
});

test("registry: sanity MCP is a remote server with a token auth header", () => {
  const sanity = MCPS.find((m) => m.id === "sanity");
  assert.ok(sanity, "sanity MCP present");
  assert.equal(sanity.name, "Sanity");
  assert.equal(sanity.config.type, "remote");
  assert.equal(sanity.config.url, "https://mcp.sanity.io");
  assert.match(sanity.config.headers.Authorization, /^Bearer \{file:tokens\//);
});
