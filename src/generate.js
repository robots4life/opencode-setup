import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FRAMEWORKS, MCPS, SKILLS } from "./registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = path.join(__dirname, "..", "template");
const STATIC_FILES = [".gitignore", ".npmrc"];

export function generate(targetDir, selections) {
  const opencodeDir = path.join(targetDir, ".opencode");
  const commandsDir = path.join(opencodeDir, "commands");

  // Create directories
  fs.mkdirSync(opencodeDir, { recursive: true });
  if (fs.existsSync(commandsDir)) {
    fs.rmSync(commandsDir, { recursive: true });
  }
  fs.mkdirSync(commandsDir, { recursive: true });

  // Build opencode.json
  const opencodeJson = buildOpencodeJson(selections);
  writeJson(path.join(opencodeDir, "opencode.json"), opencodeJson);

  // Build package.json
  const pkgJson = buildPackageJson(selections);
  writeJson(path.join(opencodeDir, "package.json"), pkgJson);

  // Copy static files
  for (const f of STATIC_FILES) {
    copy(path.join(TEMPLATE, f), path.join(opencodeDir, f));
  }

  // Collect commands from frameworks + skills
  const commandFiles = new Set();
  for (const fid of selections.frameworkIds) {
    const fw = FRAMEWORKS.find((f) => f.id === fid);
    if (fw) for (const cmd of fw.commands) commandFiles.add(cmd);
  }
  for (const sid of selections.skillIds) {
    const sk = SKILLS.find((s) => s.id === sid);
    if (sk) commandFiles.add(sk.command);
  }

  const commandsRoot = path.join(TEMPLATE, "commands");
  for (const cmd of commandFiles) {
    const src = findCommandFile(cmd, commandsRoot);
    const dest = path.join(commandsDir, `${cmd}.md`);
    if (src) {
      copy(src, dest);
    }
  }

  // Create token placeholder files
  const tokensDir = path.join(opencodeDir, "tokens");
  if (selections.mcpIds.length > 0) {
    fs.mkdirSync(tokensDir, { recursive: true });
  } else if (fs.existsSync(tokensDir)) {
    fs.rmSync(tokensDir, { recursive: true });
  }
  for (const mid of selections.mcpIds) {
    const mcp = MCPS.find((m) => m.id === mid);
    if (mcp && mcp.tokenFiles) {
      for (const tf of mcp.tokenFiles) {
        const tokenPath = path.join(opencodeDir, tf);
        if (!fs.existsSync(tokenPath)) {
          fs.writeFileSync(tokenPath, "", "utf-8");
        }
      }
    }
  }

  // Copy doc files
  const docsDir = path.join(opencodeDir, "docs");
  const needsExampleDoc = selections.skillIds.includes("docs");
  const needsSvelteDocs = selections.frameworkIds.includes("svelte");
  const hasAnyDocs = needsExampleDoc || needsSvelteDocs;

  const sourceDocsDir = path.join(__dirname, "..", "docs");

  if (hasAnyDocs) {
    if (fs.existsSync(docsDir)) {
      fs.rmSync(docsDir, { recursive: true });
    }
    fs.mkdirSync(docsDir, { recursive: true });

    if (needsExampleDoc) {
      const exampleDoc = path.join(sourceDocsDir, "001-example-doc.md");
      if (fs.existsSync(exampleDoc)) {
        copy(exampleDoc, path.join(docsDir, "001-example-doc.md"));
      }
    }

    if (needsSvelteDocs) {
      const mediumDoc = path.join(sourceDocsDir, "002-svelte-medium.md");
      const fullDoc = path.join(sourceDocsDir, "003-svelte-full.md");
      if (fs.existsSync(mediumDoc))
        copy(mediumDoc, path.join(docsDir, "002-svelte-medium.md"));
      if (fs.existsSync(fullDoc))
        copy(fullDoc, path.join(docsDir, "003-svelte-full.md"));
    }
  } else if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true });
  }

  return opencodeDir;
}

function buildOpencodeJson(selections) {
  const config = {};

  // Plugins
  const plugins = [];
  for (const fid of selections.frameworkIds) {
    const fw = FRAMEWORKS.find((f) => f.id === fid);
    if (fw && fw.plugins) plugins.push(...fw.plugins);
  }
  if (plugins.length > 0) config.plugin = plugins;

  // MCPs
  if (selections.mcpIds.length > 0) {
    config.mcp = {};
    for (const mid of selections.mcpIds) {
      const mcp = MCPS.find((m) => m.id === mid);
      if (mcp) {
        config.mcp[mcp.name] = mcp.config;
      }
    }
  }

  return config;
}

function buildPackageJson(selections) {
  const deps = {};
  for (const fid of selections.frameworkIds) {
    const fw = FRAMEWORKS.find((f) => f.id === fid);
    if (fw && fw.deps) Object.assign(deps, fw.deps);
  }

  const json = {};
  if (Object.keys(deps).length > 0) json.dependencies = deps;
  if (Object.keys(json).length === 0) return null;
  return json;
}

function writeJson(filePath, obj) {
  if (obj === null) return;
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + "\n", "utf-8");
}

function copy(src, dest) {
  fs.copyFileSync(src, dest);
}

function findCommandFile(name, root) {
  const fileName = `${name}.md`;
  for (const entry of fs.readdirSync(root, { recursive: true })) {
    if (entry === fileName || entry.endsWith(`/${fileName}`)) {
      return path.join(root, entry);
    }
  }
  return null;
}
