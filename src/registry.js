// Extensible registry of frameworks, MCP tools, and skills.
// Add new items by appending to the appropriate array below.

export const FRAMEWORKS = [
  {
    id: "svelte",
    name: "Svelte 5 / SvelteKit",
    description: "@sveltejs/opencode + runes syntax",
    plugins: ["@sveltejs/opencode"],
    commands: [
      "svelte",
      "explicit-env-vars",
      "attach",
      "function-bindings",
      "parallel-loading",
      "error-handling",
      "loading-states",
      "reactive-classes",
      "hydratable-imperative",
      "images",
      "context-state",
      "motion-transitions",
      "template-styling",
      "typescript-svelte",
      "remote-fns-advanced",
      "platform",
      "async-svelte",
      "remote-functions",
      "testing",
      "custom-elements",
      "performance",
      "packaging",
      "adapters",
      "glossary",
      "debugging",
      "compiler-errors",
      "runtime-errors",
      "type-defs",
      "faq",
      "compiler-warnings",
      "svelte-5-migration",
      "browser-support",
      "svelte-events",
      "svelte-easing",
      "svelte-all",
    ],
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
      headers: { Authorization: "Bearer {file:tokens/sanity-token}" },
    },
    tokenFiles: ["tokens/sanity-token"],
  },
];

export const SKILLS = [
  {
    id: "purecommit",
    name: "Pure Commit",
    description: "Auto-group changes by topic, commit each group",
    command: "purecommit",
  },
  {
    id: "env",
    name: "Env Safety",
    description: "Rules to never expose secrets in terminal",
    command: "env",
  },
  {
    id: "docs",
    name: "Docs Conventions",
    description: "Writing documentation guidelines",
    command: "docs",
  },
];
