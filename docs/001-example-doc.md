# 1. Prompts Module

Handles interactive user prompts for selecting frameworks, MCP tools,
and skills during setup. Uses `@clack/prompts` for the terminal UI.

<a href="/src/prompts.js">/src/prompts.js</a>
<a href="/src/registry.js">/src/registry.js</a>

---

## 1.1 Overview

**WHAT**

The `promptSelections(existing)` function orchestrates all
interactive prompts sequentially. It asks the user to pick frameworks,
MCP tools, and skills via multiselect checkboxes, then offers
merge/overwrite/cancel if a `.opencode/` folder already exists. It
returns a selections object used by the generator.

**WHY**

Interactive prompts let the user choose exactly what they need
without editing JSON or reading documentation. Separating prompts from
generation keeps each module focused on one responsibility. Every
category is optional (`required: false`), so the user can pick any
combination.

**HOW**

An async function that awaits each `@clack/prompts` call in
sequence, checks for cancellation (`isCancel`) after every step, guards
against empty selections, builds a summary string from the registry, and
asks for final confirmation before returning.

<a href="/src/prompts.js">/src/prompts.js</a>

```ts
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
  // … three multiselect prompts, cancel guards, action prompt, confirm
  return selections;
}
```

---

## 1.2 Registry Data

**WHAT**

The registry module exports three arrays — `FRAMEWORKS`, `MCPS`,
and `SKILLS` — that define all available options for the setup tool.
Each entry has an `id`, `name`, `description`, and configuration
specific to its type.

**WHY**

A centralized registry makes the tool extensible. Adding a new
framework, MCP, or skill is one entry in the right array — no other
code changes needed. The prompts, generator, and merge logic all read
from the same source of truth.

**HOW**

Each array holds plain objects with string identifiers and typed
configuration. Frameworks declare `plugins`, `commands`, and `deps`.
MCPs declare a `type` (local or remote), a `url`, and optional
`tokenFiles`. Skills declare a `command` name matching a template file
in `template/commands/`.

<a href="/src/registry.js">/src/registry.js</a>

```ts
export const FRAMEWORKS = [
  {
    id: "svelte",
    name: "Svelte 5 / SvelteKit",
    description: "@sveltejs/opencode + runes syntax",
    plugins: ["@sveltejs/opencode"],
    commands: ["svelte", "explicit-env-vars" /* ... */],
    deps: { "@sveltejs/opencode": "^0.1.9" },
  },
];

export const MCPS = [
  {
    id: "sanity",
    name: "Sanity",
    description: "CMS operations — mcp.sanity.io",
    config: {
      type: "remote",
      url: "https://mcp.sanity.io",
      headers: { Authorization: "Bearer {file:sanity-token}" },
    },
    tokenFiles: ["sanity-token"],
  },
];

export const SKILLS = [
  {
    id: "purecommit",
    name: "Pure Commit",
    description: "Auto-group changes by topic, commit each group",
    command: "purecommit",
  },
];
```

---

## 1.3 Framework Selection

**WHAT**

A multiselect prompt displays all registered frameworks from the
registry. The user can pick zero or more. Each option shows the
framework name as label and a short description as hint.

**WHY**

Frameworks are optional — a project may need only skills, or
SvelteKit + MCP, or nothing. `required: false` makes the prompt
skippable. The hint gives enough context for a decision without
overwhelming the terminal.

**HOW**

`FRAMEWORKS` is mapped to clack's `{ value, label, hint }` option
format. The returned array of IDs is checked for cancellation
immediately after.

<a href="/src/prompts.js">/src/prompts.js</a>

```ts
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
```

---

## 1.4 MCP Tool Selection

**WHAT**

Same pattern as frameworks, reading from the `MCPS` registry
array. The user picks MCP servers to configure in `opencode.json`.

**WHY**

MCP tools are independent of frameworks — you can use Sanity
without any framework plugin, or skip MCPs entirely. The same
`required: false` and cancel-guard pattern ensures consistency.

**HOW**

Identical structure to 1.2, mapped from `MCPS` instead of
`FRAMEWORKS`.

<a href="/src/prompts.js">/src/prompts.js</a>

```ts
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
```

---

## 1.5 Skill Selection

**WHAT**

Same multiselect pattern, reading from the `SKILLS` registry
array. Selected skills are copied as `.md` command files into
`.opencode/commands/`.

**WHY**

Skills are independent — a project might want only Pure Commit
without any framework or MCP tool. The uniform pattern across all three
categories makes the code predictable and easy to extend.

**HOW**

Identical structure to 1.2 and 1.3, mapped from `SKILLS`.

<a href="/src/prompts.js">/src/prompts.js</a>

```ts
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
```

---

## 1.6 Cancel Handling

**WHAT**

After every interactive prompt, the return value is checked with
`isCancel()`. If the user pressed Escape or Ctrl+C, clack's `cancel()`
function is called to display a clean exit message, then the process
terminates with code 0.

**WHY**

Without explicit cancel handling, a user pressing Escape would
leave the terminal in a broken state — arrow keys stop working, the
prompt UI doesn't clean up. `isCancel` detects the escape, `cancel`
restores terminal behavior, and `process.exit(0)` stops execution
gracefully.

**HOW**

Every multiselect, select, and confirm prompt is followed by an
`if (isCancel(result))` block. The cancel call is always paired with
`process.exit(0)` to prevent the function from continuing with
undefined values.

<a href="/src/prompts.js">/src/prompts.js</a>

```ts
if (isCancel(frameworkIds)) {
  cancel("Canceled.");
  process.exit(0);
}
```

---

## 1.7 Existing Config Handling

**WHAT**

If the `existing` parameter is `true` (a `.opencode/` folder was
detected), a `select` prompt offers three choices: merge (add new items
without removing existing ones), overwrite (replace everything), or
cancel. The choice is stored as `selections.action`.

**WHY**

Overwriting an existing configuration without confirmation would
destroy user customizations. Merge mode lets the user add new skills
or MCP tools to an already-configured project.

**HOW**

A conditional block checks `existing`. The `select` prompt uses
the same `{ value, label, hint }` option format. Cancel exits, merge
and overwrite are passed back to the main flow via `selections.action`.

<a href="/src/prompts.js">/src/prompts.js</a>

```ts
if (existing) {
  const action = await select({
    message: ".opencode/ already exists. What should we do?",
    options: [
      { value: "merge", label: "Merge", hint: "add new items, keep existing" },
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
```

---

## 1.8 Empty Selection Guard

**WHAT**

After collecting all three category selections, the function
checks whether the user picked at least one item across all categories.
If all three arrays are empty, `outro()` displays a message and the
process exits.

**WHY**

Generating a `.opencode/` folder with no commands, no plugins, and
no MCP configuration would be an empty directory — useless to the user.
The guard catches this before generation starts.

**HOW**

A simple length check across all three arrays. If every array is
empty, `outro` prints the message and `process.exit(0)` stops execution
immediately, before any file system changes.

<a href="/src/prompts.js">/src/prompts.js</a>

```ts
if (frameworkIds.length === 0 && mcpIds.length === 0 && skillIds.length === 0) {
  outro("Nothing selected. Exiting.");
  process.exit(0);
}
```

---

## 1.9 Confirmation Summary

**WHAT**

Before returning, the function builds a summary of all selected
items by looking up names in the registry arrays, then displays a
`confirm` prompt. The user must explicitly approve the selection or the
process exits.

**WHY**

The user may have accidentally selected the wrong item or changed
their mind. A final confirmation before any file system changes
prevents unintended configuration.

**HOW**

Each ID array is mapped through the registry to extract the human
readable name. Names are joined with newlines into a single string
passed to the `confirm` message. If the user declines or cancels, the
process exits without touching the file system.

<a href="/src/prompts.js">/src/prompts.js</a>

```ts
const summary = [
  ...frameworkIds.map((id) => `  ${FRAMEWORKS.find((f) => f.id === id).name}`),
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
```
