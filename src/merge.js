import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FRAMEWORKS, MCPS, SKILLS } from "./registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = path.join(__dirname, "..", "template");
const STATIC_FILES = [".gitignore", ".npmrc"];

export function merge(targetDir, selections) {
  const opencodeDir = path.join(targetDir, ".opencode");
  const commandsDir = path.join(opencodeDir, "commands");

  // Merge opencode.json
  const opencodeJsonPath = path.join(opencodeDir, "opencode.json");
  let opencodeJson = {};
  if (fs.existsSync(opencodeJsonPath)) {
    opencodeJson = readJson(opencodeJsonPath);
  }

  // Merge plugins
  const newPlugins = [];
  for (const fid of selections.frameworkIds) {
    const fw = FRAMEWORKS.find((f) => f.id === fid);
    if (fw && fw.plugins) newPlugins.push(...fw.plugins);
  }
  if (newPlugins.length > 0) {
    opencodeJson.plugin = [
      ...new Set([...(opencodeJson.plugin || []), ...newPlugins]),
    ];
  }

  // Merge MCPs
  opencodeJson.mcp = opencodeJson.mcp || {};
  for (const mid of selections.mcpIds) {
    const mcp = MCPS.find((m) => m.id === mid);
    if (mcp && !opencodeJson.mcp[mcp.name]) {
      opencodeJson.mcp[mcp.name] = mcp.config;
    }
  }

  writeJson(opencodeJsonPath, opencodeJson);

  // Merge package.json
  const pkgJsonPath = path.join(opencodeDir, "package.json");
  let pkgJson = {};
  if (fs.existsSync(pkgJsonPath)) {
    pkgJson = readJson(pkgJsonPath);
  }
  pkgJson.dependencies = pkgJson.dependencies || {};
  for (const fid of selections.frameworkIds) {
    const fw = FRAMEWORKS.find((f) => f.id === fid);
    if (fw && fw.deps) Object.assign(pkgJson.dependencies, fw.deps);
  }
  writeJson(pkgJsonPath, pkgJson);

  // Copy static files if missing
  for (const f of STATIC_FILES) {
    const dest = path.join(opencodeDir, f);
    if (!fs.existsSync(dest)) {
      copy(path.join(TEMPLATE, f), dest);
    }
  }

  // Add command files (don't overwrite existing)
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
    const dest = path.join(commandsDir, `${cmd}.md`);
    if (!fs.existsSync(dest)) {
      const src = findCommandFile(cmd, commandsRoot);
      if (src) {
        fs.mkdirSync(commandsDir, { recursive: true });
        copy(src, dest);
      }
    }
  }

  // Create token files if missing
  if (selections.mcpIds.length > 0) {
    const tokensDir = path.join(opencodeDir, "tokens");
    fs.mkdirSync(tokensDir, { recursive: true });
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

  // Copy doc files if missing
  const docsDir = path.join(opencodeDir, "docs");
  const needsExampleDoc = selections.skillIds.includes("docs");
  const needsSvelteDocs = selections.frameworkIds.includes("svelte");

  const sourceDocsDir = path.join(__dirname, "..", "docs");

  if (needsExampleDoc || needsSvelteDocs) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  if (needsExampleDoc) {
    const exampleDoc = path.join(sourceDocsDir, "001-example-doc.md");
    const exampleDest = path.join(docsDir, "001-example-doc.md");
    if (fs.existsSync(exampleDoc) && !fs.existsSync(exampleDest)) {
      copy(exampleDoc, exampleDest);
    }
  }

  if (needsSvelteDocs) {
    const mediumDoc = path.join(sourceDocsDir, "002-svelte-medium.md");
    const fullDoc = path.join(sourceDocsDir, "003-svelte-full.md");
    const mediumDest = path.join(docsDir, "002-svelte-medium.md");
    const fullDest = path.join(docsDir, "003-svelte-full.md");
    if (fs.existsSync(mediumDoc) && !fs.existsSync(mediumDest))
      copy(mediumDoc, mediumDest);
    if (fs.existsSync(fullDoc) && !fs.existsSync(fullDest))
      copy(fullDoc, fullDest);
  }

  return opencodeDir;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJson(filePath, obj) {
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
