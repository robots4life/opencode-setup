import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generate } from "../src/generate.js";
import { FRAMEWORKS } from "../src/registry.js";

const SVELTE_COMMANDS = FRAMEWORKS.find((f) => f.id === "svelte").commands;
const svelte = {
  frameworkIds: ["svelte"],
  mcpIds: ["sanity"],
  skillIds: ["docs"],
};

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "opcup-generate-"));
}

function listMd(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

function read(file) {
  return fs.readFileSync(file, "utf-8");
}

test("generate: creates the full .opencode structure", () => {
  const dir = tmp();
  try {
    const opencodeDir = generate(dir, svelte);
    assert.equal(opencodeDir, path.join(dir, ".opencode"));

    const commands = listMd(path.join(opencodeDir, "commands"));
    assert.equal(
      commands.length,
      SVELTE_COMMANDS.length + 1,
      "36 svelte + docs",
    );
    for (const cmd of SVELTE_COMMANDS) {
      assert.ok(commands.includes(`${cmd}.md`), `missing ${cmd}.md`);
    }
    assert.ok(commands.includes("docs.md"), "missing generic docs skill");

    const docs = fs.readdirSync(path.join(opencodeDir, "docs")).sort();
    assert.deepEqual(docs, [
      "001-example-doc.md",
      "002-svelte-medium.md",
      "003-svelte-full.md",
    ]);

    const token = path.join(opencodeDir, "tokens", "sanity-token");
    assert.ok(fs.existsSync(token));
    assert.equal(read(token), "");

    const config = JSON.parse(read(path.join(opencodeDir, "opencode.json")));
    assert.ok(config.plugin.includes("@sveltejs/opencode"));
    assert.equal(config.mcp.Sanity.type, "remote");
    assert.equal(config.mcp.Sanity.url, "https://mcp.sanity.io");

    const pkg = JSON.parse(read(path.join(opencodeDir, "package.json")));
    assert.ok(pkg.dependencies["@sveltejs/opencode"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: copies static .gitignore and .npmrc", () => {
  const dir = tmp();
  try {
    const opencodeDir = generate(dir, svelte);
    assert.ok(read(path.join(opencodeDir, ".gitignore")).includes("tokens/"));
    assert.ok(
      read(path.join(opencodeDir, ".npmrc")).includes("package-lock=false"),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: empty selection clears commands/docs/tokens and writes empty config", () => {
  const dir = tmp();
  try {
    generate(dir, svelte);
    const opencodeDir = generate(dir, {
      frameworkIds: [],
      mcpIds: [],
      skillIds: [],
    });
    assert.equal(listMd(path.join(opencodeDir, "commands")).length, 0);
    assert.ok(!fs.existsSync(path.join(opencodeDir, "docs")));
    assert.ok(!fs.existsSync(path.join(opencodeDir, "tokens")));
    assert.deepEqual(
      JSON.parse(read(path.join(opencodeDir, "opencode.json"))),
      {},
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: fresh dir with empty selection writes no package.json", () => {
  const dir = tmp();
  try {
    const opencodeDir = generate(dir, {
      frameworkIds: [],
      mcpIds: [],
      skillIds: [],
    });
    assert.ok(!fs.existsSync(path.join(opencodeDir, "package.json")));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: docs-skill-only emits 001 but not the Svelte docs", () => {
  const dir = tmp();
  try {
    const opencodeDir = generate(dir, {
      frameworkIds: [],
      mcpIds: [],
      skillIds: ["docs"],
    });
    assert.deepEqual(fs.readdirSync(path.join(opencodeDir, "docs")), [
      "001-example-doc.md",
    ]);
    assert.deepEqual(listMd(path.join(opencodeDir, "commands")), ["docs.md"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: svelte-only emits 002/003 but not 001", () => {
  const dir = tmp();
  try {
    const opencodeDir = generate(dir, {
      frameworkIds: ["svelte"],
      mcpIds: [],
      skillIds: [],
    });
    const docs = fs.readdirSync(path.join(opencodeDir, "docs")).sort();
    assert.deepEqual(docs, ["002-svelte-medium.md", "003-svelte-full.md"]);
    assert.equal(
      listMd(path.join(opencodeDir, "commands")).length,
      SVELTE_COMMANDS.length,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: no docs directory when nothing needs it", () => {
  const dir = tmp();
  try {
    const opencodeDir = generate(dir, {
      frameworkIds: [],
      mcpIds: [],
      skillIds: [],
    });
    assert.ok(!fs.existsSync(path.join(opencodeDir, "docs")));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: MCP without a framework yields mcp but no plugin key", () => {
  const dir = tmp();
  try {
    const opencodeDir = generate(dir, {
      frameworkIds: [],
      mcpIds: ["sanity"],
      skillIds: [],
    });
    const config = JSON.parse(read(path.join(opencodeDir, "opencode.json")));
    assert.ok(!("plugin" in config));
    assert.ok(config.mcp.Sanity);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: overwrite regenerates config and deps, dropping stale entries", () => {
  const dir = tmp();
  try {
    generate(dir, svelte);
    const opencodeDir = path.join(dir, ".opencode");
    const configPath = path.join(opencodeDir, "opencode.json");
    const config = JSON.parse(read(configPath));
    config.plugin.push("@stale/plugin");
    config.mcp.Stale = { type: "remote", url: "https://stale" };
    fs.writeFileSync(
      configPath,
      JSON.stringify(config, null, 2) + "\n",
      "utf-8",
    );
    const pkgPath = path.join(opencodeDir, "package.json");
    const pkg = JSON.parse(read(pkgPath));
    pkg.dependencies["stale-dep"] = "^1.0.0";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");

    generate(dir, svelte);

    const nextConfig = JSON.parse(read(configPath));
    assert.deepEqual(nextConfig.plugin, ["@sveltejs/opencode"]);
    assert.ok(!nextConfig.mcp.Stale);
    assert.ok(nextConfig.mcp.Sanity);
    const nextPkg = JSON.parse(read(pkgPath));
    assert.ok(!nextPkg.dependencies["stale-dep"]);
    assert.ok(nextPkg.dependencies["@sveltejs/opencode"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: overwrite preserves existing token files when an MCP is selected", () => {
  const dir = tmp();
  try {
    generate(dir, svelte);
    const token = path.join(dir, ".opencode", "tokens", "sanity-token");
    fs.writeFileSync(token, "SECRET", "utf-8");
    generate(dir, svelte);
    assert.equal(read(token), "SECRET");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: overwrite removes tokens when no MCP is selected", () => {
  const dir = tmp();
  try {
    generate(dir, svelte);
    generate(dir, { ...svelte, mcpIds: [] });
    assert.ok(!fs.existsSync(path.join(dir, ".opencode", "tokens")));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: ignores unknown framework and skill ids", () => {
  const dir = tmp();
  try {
    const opencodeDir = generate(dir, {
      frameworkIds: ["nope"],
      mcpIds: [],
      skillIds: ["nope"],
    });
    assert.deepEqual(
      JSON.parse(read(path.join(opencodeDir, "opencode.json"))),
      {},
    );
    assert.equal(listMd(path.join(opencodeDir, "commands")).length, 0);
    assert.ok(!fs.existsSync(path.join(opencodeDir, "package.json")));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: unknown MCP id yields empty mcp config and empty tokens dir", () => {
  const dir = tmp();
  try {
    const opencodeDir = generate(dir, {
      frameworkIds: [],
      mcpIds: ["nope"],
      skillIds: [],
    });
    assert.deepEqual(
      JSON.parse(read(path.join(opencodeDir, "opencode.json"))),
      {
        mcp: {},
      },
    );
    assert.deepEqual(fs.readdirSync(path.join(opencodeDir, "tokens")), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("generate: skips a command that has no template file", () => {
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
    const opencodeDir = generate(dir, {
      frameworkIds: ["fake-framework"],
      mcpIds: [],
      skillIds: [],
    });
    assert.equal(listMd(path.join(opencodeDir, "commands")).length, 0);
  } finally {
    FRAMEWORKS.pop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
