import fs from "node:fs";
import path from "node:path";
import {
  intro,
  outro,
  note,
  spinner,
  select,
  cancel,
  isCancel,
} from "@clack/prompts";
import { promptSelections } from "./prompts.js";
import { generate } from "./generate.js";
import { merge } from "./merge.js";
import { MCPS } from "./registry.js";

export async function main() {
  intro("opcup — OpenCode setup");

  const targetDir = process.cwd();
  const opencodeDir = path.join(targetDir, ".opencode");
  const existing = fs.existsSync(opencodeDir);

  if (existing) {
    note(".opencode/ folder already exists", "Detected");
  }

  const selections = await promptSelections(existing);

  // Warn before overwrite if tokens exist
  if (existing && selections.action !== "merge") {
    const tokensDir = path.join(opencodeDir, "tokens");
    if (fs.existsSync(tokensDir)) {
      const ok = await select({
        message: "Token files will be deleted. Continue?",
        options: [
          {
            value: "yes",
            label: "Yes, delete them",
            hint: "tokens folder will be removed",
          },
          {
            value: "no",
            label: "No, cancel",
            hint: "process will be cancelled",
          },
        ],
      });
      if (isCancel(ok) || ok === "no") {
        cancel("Canceled.");
        process.exit(0);
      }
    }
  }

  const s = spinner();
  s.start("Generating .opencode/...");

  let resultDir;
  if (existing && selections.action === "merge") {
    resultDir = merge(targetDir, selections);
  } else {
    resultDir = generate(targetDir, selections);
  }

  s.stop("Done");

  outro(resultDir);

  const steps = [];
  const hasTokens = selections.mcpIds.some((id) => {
    const mcp = MCPS.find((m) => m.id === id);
    return mcp && mcp.tokenFiles && mcp.tokenFiles.length > 0;
  });
  if (hasTokens) {
    steps.push("Add API tokens to placeholder files in .opencode/tokens/");
  }
  steps.push("Launch with: opencode");

  if (steps.length > 0) {
    note(steps.join("\n"), "Next steps");
  }
}
