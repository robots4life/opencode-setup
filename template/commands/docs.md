---
description: Writing documentation guidelines for the session
---

# Documentation Conventions

Every documentation page in this project must follow these rules.
Consistency makes docs scannable, maintainable, and useful.

---

## When to Document

The AI does not write documentation automatically — you decide when
docs are needed. When you ask the AI to write or update docs, it uses
this file as the authoritative reference pattern.

Create or update documentation when:

- You add a new feature or change existing behavior
- You introduce a breaking change
- You add new environment variables, configuration options, or CLI flags
- You set up a new service, database, or integration
- A setup or onboarding step changes

Skip documentation for:

- Trivial code comments explaining what a single line does
- Repeating what the code already says clearly
- Standard `npm install` / `npm run dev` instructions (unless project has
  unusual setup)

---

## File Conventions

All docs live in `docs/` at the project root. Use numbered filename
prefixes to enforce reading order:

```
docs/
  001-getting-started.md
  002-environment-variables.md
  003-database-setup.md
  004-api-endpoints.md
  005-deployment.md
```

- Filenames are kebab-case: `database-setup.md`, not `Database Setup.md`
- Every doc page has exactly one `1.` top-level heading (the page title)
- Cross-reference other doc pages in the project when relevant

---

## Heading Structure

Use numbered headings throughout every page:

```markdown
# 1. Page Title

## 1.1 First Section

### 1.1.1 Subsection Details

## 1.2 Second Section
```

Rules:

- Only one `1.` heading per page (the title)
- Subheadings increment: `1.1`, `1.1.1`, `1.1.2`, `1.2`, etc.
- Every heading has text after the number: `1.1 Setup` not just `1.1`
- Don't skip levels: never go from `1.` directly to `1.1.1`

---

## Linking

Use root-relative paths inside HTML anchor tags:

```markdown
<a href="/docs/003-database-setup.md">/docs/003-database-setup.md</a>
```

Rules:

- Always link to the `.md` file, not a rendered URL
- Root-relative means starting from the project root (`/docs/...`,
  `/src/...`)
- When documenting a feature or module, link to the source file:
  `<a href="/src/db.ts">/src/db.ts</a>`. Docs should connect readers to
  the implementation, not describe it in isolation
- If linking within the same page, reference the heading:
  `<a href="#14-deployment">Deployment</a>` works with numbered headings
- Cross-reference freely — good docs form a web, not isolated pages

---

## Code Blocks

Before every code block, write three labeled paragraphs in this exact
order. Each label appears on its own line in bold, followed by the
explanation on the next line:

```markdown
**WHAT**

The first sentence describes what the code does at a high level.

**WHY**

The first sentence explains why the code is needed — what problem it
solves and the motivation for this approach.

**HOW**

The first sentence describes how the code works — key functions,
libraries, and patterns used in the implementation.
```

All three paragraphs must appear above the code block. The bold label
is followed by a blank line, then the explanation text. After the **HOW**
paragraph, include a source file link showing where the code lives:

```markdown
<a href="/src/db.ts">/src/db.ts</a>
```

The code block follows after a blank line.

Supported language tags: `ts`, `js`, `svelte`, `sh`, `bash`, `json`,
`yaml`, `md`, `html`, `css`, `sql`, `env`, `dockerfile`, `diff`, `text`.

Don't omit the tag — syntax highlighting is the difference between
readable and unreadable code in documentation.

---

## Example

For a complete documentation page following all these conventions, see
<a href="/docs/001-example-doc.md">/docs/001-example-doc.md</a>. It
documents the `src/prompts.js` module using What → Why → How, numbered
headings, root-relative source links, and tagged code blocks.

---

## Tone

- Present tense, imperative mood: "Create a file" not "You will create a file"
- Address the reader as "you", the project as "the project"
- Technical but direct — no filler, no marketing language
- Write for someone who understands the domain but is new to this project

---

## Updating Docs

When you change code that affects existing documentation:

- Update every page that references the changed behavior
- Don't leave stale examples, outdated commands, or deprecated API usage
- If the change is significant, add a note at the top:
  `> Updated for v2.0 — connection pooling now uses `pg` v9`

---

## Avoid Duplication

Every piece of information should have one canonical location. Link to
it from everywhere else — never copy-paste documentation blocks across
pages. If you find yourself writing the same thing twice, extract it to
a shared page and link to it.

---

Do not re-read this file if already loaded this session.
Confirm these rules and use them in either Plan mode or Build mode.
Your compliance is absolute for the rest of this session.
