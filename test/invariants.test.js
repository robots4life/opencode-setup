import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FRAMEWORKS, SKILLS } from "../src/registry.js";

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMMANDS = path.join(REPO, "template", "commands");
const SVELTE_DIR = path.join(COMMANDS, "svelte");
const SVELTE_COMMANDS = FRAMEWORKS.find((f) => f.id === "svelte").commands;

function commandFileMap() {
  const map = new Map();
  for (const entry of fs.readdirSync(COMMANDS, { recursive: true })) {
    const base = path.basename(entry);
    if (base.endsWith(".md")) {
      map.set(base.replace(/\.md$/, ""), path.join(COMMANDS, entry));
    }
  }
  return map;
}

test("svelte-all.md lists every Svelte command except itself, in registry order", () => {
  const content = fs.readFileSync(
    path.join(SVELTE_DIR, "svelte-all.md"),
    "utf-8",
  );
  const listed = content
    .split("\n")
    .map((line) => line.match(/^\d+\.\s+(\S+)\.md\s*$/))
    .filter(Boolean)
    .map((match) => match[1]);
  assert.deepEqual(
    listed,
    SVELTE_COMMANDS.filter((cmd) => cmd !== "svelte-all"),
  );
});

test("README counts match the registry", () => {
  const readme = fs.readFileSync(path.join(REPO, "README.md"), "utf-8");
  const n = SVELTE_COMMANDS.length;
  assert.ok(readme.includes(`${n} Svelte + 3 generic skills`), "tree count");
  assert.ok(readme.includes(`${n} command files are generated`), "prose count");
  assert.ok(readme.includes(`+ ${n} skills`), "frameworks count");
  const rows = readme
    .split("\n")
    .filter((line) => /template\/commands\/svelte\/[^)]*\.md\)/.test(line));
  assert.equal(rows.length, n, "README Svelte table row count");
});

test("all framework and skill commands have non-empty template files", () => {
  const files = commandFileMap();
  const commands = [
    ...FRAMEWORKS.flatMap((f) => f.commands),
    ...SKILLS.map((s) => s.command),
  ];
  for (const name of commands) {
    const file = files.get(name);
    assert.ok(file, `missing template for ${name}`);
    assert.ok(fs.statSync(file).size > 0, `empty template for ${name}`);
  }
});

test("migration command carries the auto-migrate instruction", () => {
  const file = path.join(
    SVELTE_DIR,
    "034-migrating-to-sveltekit-3",
    "migrating-to-sveltekit-3.md",
  );
  const content = fs.readFileSync(file, "utf-8");
  assert.ok(content.includes("npx sv migrate sveltekit-3"));
  assert.ok(content.includes("Migrating to SvelteKit v3"));
});

test("type-defs reflects the SvelteKit 3 module layout", () => {
  const content = fs.readFileSync(
    path.join(SVELTE_DIR, "027-type-defs", "type-defs.md"),
    "utf-8",
  );
  assert.ok(content.includes("@sveltejs/kit/params"));
  assert.ok(content.includes("$app/manifest"));
  assert.ok(!content.includes("# $app/stores"));
});

test("bundled docs are present and non-empty", () => {
  for (const name of [
    "001-example-doc.md",
    "002-svelte-medium.md",
    "003-svelte-full.md",
  ]) {
    const file = path.join(REPO, "docs", name);
    assert.ok(fs.existsSync(file), `missing docs/${name}`);
    assert.ok(fs.statSync(file).size > 0, `empty docs/${name}`);
  }
});

test("package metadata is publishable", () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(REPO, "package.json"), "utf-8"),
  );
  assert.ok(pkg.engines?.node, "engines.node declared");
  assert.ok(pkg.files.includes("bin/"));
  assert.ok(pkg.files.includes("template/"));
  assert.ok(pkg.files.includes("docs/"));
  assert.ok(
    !pkg.files.some((f) => f.startsWith("test")),
    "tests are not published",
  );
  const bin = path.join(REPO, pkg.bin.opcup);
  assert.ok(fs.existsSync(bin), "bin entry exists");
  assert.ok(fs.statSync(bin).mode & 0o111, "bin entry is executable");
});
