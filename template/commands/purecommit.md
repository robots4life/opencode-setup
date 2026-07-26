---
description: Auto-group changes and commit all topics
---

Create git commits by automatically grouping changed files into logical
topics and committing each topic separately.

Default behavior: commit all detected groups in sequence in one run.

Use `$ARGUMENTS` as optional hints for grouping names, ordering, or
scope (examples: `docs first`, `only webhooks`, `skip tests`).

ABSOLUTE RULES — VIOLATION WILL CAUSE THE COMMIT TO FAIL:

- NEVER create, write, touch, or generate ANY new file or script.
  You are ONLY allowed to run git commands. Do NOT use the Write,
  Edit, or Bash tools to create files.
- NEVER create shell scripts, helper scripts, or temporary files.
- ONLY run these exact git commands: `git status`, `git diff`,
  `git diff --staged`, `git add`, `git commit`, and
  `git restore --staged .`.
- Do NOT research or fetch any URLs. Do NOT browse the web.
- If you are unsure about a grouping, just commit all files as
  one group with a descriptive message. Never create a file as
  a workaround.

Follow these commit message rules strictly:

1. Subject line is 50 characters or fewer
2. Subject starts with a capital letter
3. Subject uses imperative mood
4. Subject does not end with a period
5. Subject and body are separated by one blank line
6. Body lines are wrapped at 72 characters or fewer
7. Body explains what and why, not implementation detail

Workflow:

- Run `git status --short`, `git diff`, and `git diff --staged`.
- Build a complete grouping plan across all changed files (staged,
  unstaged, untracked).
- If there are no changed files, stop and reply exactly: `No changes found.`
- If `$ARGUMENTS` contains `only <topic>`, filter to that one group.
- Before first commit, normalize staging with `git restore --staged .`
  to avoid cross-topic bleed (do not discard worktree changes).
- For each target group, in planned order:
  - stage only that group's files using `git add <files...>`.
  - run `git diff --staged` and verify staged changes are one topic.
  - if staged diff is empty, skip that group and report it.
  - draft the best possible commit message from the staged diff.
  - self-check against all 7 rules; if any rule fails, rewrite and
    re-check until all rules pass.
  - run `git commit -m "<subject>" -m "<body>"`.
- Continue until every target group is committed or blocked.
- If a file belongs to multiple topics and cannot be safely separated,
  stop before committing it and report the file plus a split plan.

Return format:

- List every new commit hash and the exact message for each commit,
  in the order created.
- List any files intentionally left uncommitted and why.

Additional context from user: $ARGUMENTS
