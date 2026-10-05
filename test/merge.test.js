import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generate } from "../src/generate.js";
import { merge } from "../src/merge.js";
import { FRAMEWORKS } from "../src/registry.js";

const selections = {
  frameworkIds: ["svelte"],
  mcpIds: ["sanity"],
  skillIds: ["docs"],
};

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "opcup-merge-"));
}

function read(file) {
  return fs.readFileSync(file, "utf-8");
}

test("merge: adds missing entries without overwriting existing ones", () => {
  const dir = tmp();
  try {
    generate(dir, selections);
    const opencodeDir = path.join(dir, ".opencode");
    const migration = path.join(
      opencodeDir,
      "commands",
      "migrating-to-sveltekit-3.md",
    );
    const custom = path.join(opencodeDir, "commands", "custom.md");

    fs.rmSync(migration);
    fs.rmSync(path.join(opencodeDir, "docs", "002-svelte-medium.md"));
    fs.writeFileSync(custom, "KEEP\n", "utf-8");

    const configPath = path.join(opencodeDir, "opencode.json");
    const config = JSON.parse(read(configPath));
    config.plugin.push("@acme/existing");
    delete config.mcp.Sanity;
    fs.writeFileSync(
      configPath,
      JSON.stringify(config, null, 2) + "\n",
      "utf-8",
    );

    merge(dir, selections);

    assert.ok(fs.existsSync(migration), "restored missing command");
    assert.equal(read(custom), "KEEP\n", "kept user command");
    assert.ok(
      fs.existsSync(path.join(opencodeDir, "docs", "002-svelte-medium.md")),
      "restored missing doc",
    );

    const merged = JSON.parse(read(configPath));
    assert.ok(merged.plugin.includes("@sveltejs/opencode"));
    assert.ok(merged.plugin.includes("@acme/existing"));
    assert.ok(merged.mcp.Sanity, "re-added missing MCP");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("merge: preserves an existing MCP config", () => {
  const dir = tmp();
  try {
    generate(dir, selections);
    const configPath = path.join(dir, ".opencode", "opencode.json");
    const config = JSON.parse(read(configPath));
    config.mcp.Sanity = { type: "remote", url: "https://custom.example" };
    fs.writeFileSync(
      configPath,
      JSON.stringify(config, null, 2) + "\n",
      "utf-8",
    );

    merge(dir, selections);

    assert.equal(
      JSON.parse(read(configPath)).mcp.Sanity.url,
      "https://custom.example",
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("merge: merges deps without dropping existing ones", () => {
  const dir = tmp();
  try {
    generate(dir, selections);
    const pkgPath = path.join(dir, ".opencode", "package.json");
    const pkg = JSON.parse(read(pkgPath));
    pkg.dependencies["custom-dep"] = "^1.0.0";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");

    merge(dir, selections);

    const merged = JSON.parse(read(pkgPath));
    assert.equal(merged.dependencies["custom-dep"], "^1.0.0");
    assert.ok(merged.dependencies["@sveltejs/opencode"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("merge: re-creates static files and token placeholders if missing", () => {
  const dir = tmp();
  try {
    generate(dir, selections);
    const opencodeDir = path.join(dir, ".opencode");
    fs.rmSync(path.join(opencodeDir, ".gitignore"));
    fs.rmSync(path.join(opencodeDir, ".npmrc"));
    fs.rmSync(path.join(opencodeDir, "tokens"), { recursive: true });

    merge(dir, selections);

    assert.ok(fs.existsSync(path.join(opencodeDir, ".gitignore")));
    assert.ok(fs.existsSync(path.join(opencodeDir, ".npmrc")));
    assert.ok(fs.existsSync(path.join(opencodeDir, "tokens", "sanity-token")));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("merge: does not overwrite an existing doc", () => {
  const dir = tmp();
  try {
    generate(dir, selections);
    const doc = path.join(dir, ".opencode", "docs", "003-svelte-full.md");
    fs.writeFileSync(doc, "CUSTOM DOC\n", "utf-8");

    merge(dir, selections);

    assert.equal(read(doc), "CUSTOM DOC\n");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("merge: restores the missing example doc", () => {
  const dir = tmp();
  try {
    generate(dir, selections);
    fs.rmSync(path.join(dir, ".opencode", "docs", "001-example-doc.md"));

    merge(dir, selections);

    assert.ok(
      fs.existsSync(path.join(dir, ".opencode", "docs", "001-example-doc.md")),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("merge: creates config files when only the .opencode directory exists", () => {
  const dir = tmp();
  try {
    fs.mkdirSync(path.join(dir, ".opencode"), { recursive: true });

    merge(dir, selections);

    assert.ok(fs.existsSync(path.join(dir, ".opencode", "opencode.json")));
    assert.ok(fs.existsSync(path.join(dir, ".opencode", "package.json")));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("merge: ignores unknown framework, MCP and skill ids", () => {
  const dir = tmp();
  try {
    generate(dir, selections);
    const configPath = path.join(dir, ".opencode", "opencode.json");
    const before = read(configPath);

    merge(dir, {
      frameworkIds: ["nope"],
      mcpIds: ["nope"],
      skillIds: ["nope"],
    });

    assert.equal(read(configPath), before);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("merge: empty selection leaves the project intact", () => {
  const dir = tmp();
  try {
    generate(dir, selections);
    merge(dir, { frameworkIds: [], mcpIds: [], skillIds: [] });
    assert.ok(
      fs.existsSync(path.join(dir, ".opencode", "commands", "svelte.md")),
    );
    assert.ok(
      !fs.existsSync(path.join(dir, ".opencode", "commands", "missing.md")),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("merge: skips a command that has no template file", () => {
  const dir = tmp();
  const fake = {
    id: "fake-framework",
    name: "Fake",
    plugins: [],
    commands: ["missing-command"],
    deps: {},
  };
  FRAMEWORKS.push(fake);
  try {
    generate(dir, selections);
    merge(dir, { frameworkIds: ["fake-framework"], mcpIds: [], skillIds: [] });
    assert.ok(
      !fs.existsSync(
        path.join(dir, ".opencode", "commands", "missing-command.md"),
      ),
    );
  } finally {
    FRAMEWORKS.pop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
