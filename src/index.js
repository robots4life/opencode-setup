import fs from "node:fs";
import path from "node:path";
import * as clack from "@clack/prompts";
import { promptSelections } from "./prompts.js";
import { generate } from "./generate.js";
import { merge } from "./merge.js";
import { MCPS } from "./registry.js";

// Whether the pre-overwrite confirmation should be shown. Token files are only
// actually deleted when no MCP (and therefore no token placeholder) is selected.
export function shouldWarnAboutTokens(existing, selections, tokensDirExists) {
  return (
    existing &&
    selections.action !== "merge" &&
    selections.mcpIds.length === 0 &&
    tokensDirExists
  );
}

// The list of post-scaffold instructions shown to the user.
export function computeNextSteps(selections) {
  const steps = [];
  const hasTokens = selections.mcpIds.some((id) => {
    const mcp = MCPS.find((m) => m.id === id);
    return mcp && mcp.tokenFiles && mcp.tokenFiles.length > 0;
  });
  if (hasTokens) {
    steps.push("Add API tokens to placeholder files in .opencode/tokens/");
  }
  steps.push("Launch with: opencode");
  return steps;
}

// Dispatch to merge (additive) or generate (fresh) based on the selection.
export function runScaffold(targetDir, selections, existing) {
  if (existing && selections.action === "merge") {
    return merge(targetDir, selections);
  }
  return generate(targetDir, selections);
}

export async function main(options = {}) {
  const {
    prompts = clack,
    cwd = () => process.cwd(),
    exit = (code) => process.exit(code),
  } = options;
  const { intro, outro, note, spinner, select, cancel, isCancel } = prompts;

  intro("opcup — OpenCode setup");

  const targetDir = cwd();
  const opencodeDir = path.join(targetDir, ".opencode");
  const existing = fs.existsSync(opencodeDir);

  if (existing) {
    note(".opencode/ folder already exists", "Detected");
  }

  const selections = await promptSelections(existing, prompts);

  // Warn before overwrite only if existing token files will actually be deleted
  // (generate keeps tokens/ when any MCP is selected)
  const tokensDir = path.join(opencodeDir, "tokens");
  if (shouldWarnAboutTokens(existing, selections, fs.existsSync(tokensDir))) {
    const ok = await select({
      message: "No MCP tool selected — token files will be deleted. Continue?",
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
      exit(0);
      return;
    }
  }

  const s = spinner();
  s.start("Generating .opencode/...");

  const resultDir = runScaffold(targetDir, selections, existing);

  s.stop("Done");

  outro(resultDir);

  const steps = computeNextSteps(selections);
  if (steps.length > 0) {
    note(steps.join("\n"), "Next steps");
  }
}
