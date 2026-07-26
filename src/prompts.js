import {
  multiselect,
  select,
  confirm,
  outro,
  cancel,
  isCancel,
} from "@clack/prompts";
import { FRAMEWORKS, MCPS, SKILLS } from "./registry.js";

export async function promptSelections(existing) {
  const frameworkIds = await multiselect({
    required: false,
    message: "Select frameworks:",
    options: FRAMEWORKS.map((f) => ({
      value: f.id,
      label: f.name,
      hint: f.description,
    })),
  });

  if (isCancel(frameworkIds)) {
    cancel("Canceled.");
    process.exit(0);
  }

  const mcpIds = await multiselect({
    required: false,
    message: "Select MCP tools:",
    options: MCPS.map((m) => ({
      value: m.id,
      label: m.name,
      hint: m.description,
    })),
  });

  if (isCancel(mcpIds)) {
    cancel("Canceled.");
    process.exit(0);
  }

  const skillIds = await multiselect({
    required: false,
    message: "Select skills:",
    options: SKILLS.map((s) => ({
      value: s.id,
      label: s.name,
      hint: s.description,
    })),
  });

  if (isCancel(skillIds)) {
    cancel("Canceled.");
    process.exit(0);
  }

  const selections = { frameworkIds, mcpIds, skillIds };

  if (existing) {
    const action = await select({
      message: ".opencode/ already exists. What should we do?",
      options: [
        {
          value: "merge",
          label: "Merge",
          hint: "add new items, keep existing",
        },
        { value: "overwrite", label: "Overwrite", hint: "replace everything" },
        { value: "cancel", label: "Cancel" },
      ],
    });

    if (isCancel(action) || action === "cancel") {
      cancel("Canceled.");
      process.exit(0);
    }

    selections.action = action;
  }

  if (
    frameworkIds.length === 0 &&
    mcpIds.length === 0 &&
    skillIds.length === 0
  ) {
    outro("Nothing selected. Exiting.");
    process.exit(0);
  }

  const summary = [
    ...frameworkIds.map(
      (id) => `  ${FRAMEWORKS.find((f) => f.id === id).name}`,
    ),
    ...mcpIds.map((id) => `  ${MCPS.find((m) => m.id === id).name}`),
    ...skillIds.map((id) => `  ${SKILLS.find((s) => s.id === id).name}`),
  ].join("\n");

  const ok = await confirm({
    message: `Proceed with these?\n${summary}`,
  });

  if (isCancel(ok) || !ok) {
    cancel("Canceled.");
    process.exit(0);
  }

  return selections;
}
