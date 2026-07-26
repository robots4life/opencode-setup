---
description: Handle secrets in .env, token files, CI/CD, and shell safely
---

# Secrets and Environment Variables

Never expose secrets in terminal output, chat, logs, git history, CI/CD
YAML, or code. Every rule below exists because a specific real-world
leak happened — follow them precisely.

---

## Before Writing Code

Verify your `.gitignore` contains these entries before any other work:

```
.env
.env.local
.env.*.local
*.token
*.pem
*.key
```

Provide a `.env.example` file listing every required variable with
documentation but zero real values. Check it into git:

```env
# .env.example — checked into git
PUBLIC_SITE_URL=https://example.com
# DATABASE_URL=postgres://user:password@host:port/db  ← example only
# SECRET_KEY=                                          ← add yours, never commit
```

The `.env.example` is the project's contract: developers know which
vars are needed, deployment knows what to inject, no secrets committed.

---

## Reading Secrets in Code

Always read from the runtime environment. Never read `.env` files in
application code — frameworks already load `.env` for you.

Correct per platform:

```ts
// Node.js / SvelteKit server-side
const key = process.env.SECRET_KEY;

// SvelteKit client-safe
const publicUrl = import.meta.env.PUBLIC_SITE_URL;

// Deno
const key = Deno.env.get("SECRET_KEY");

// Bun
const key = Bun.env.SECRET_KEY;
```

Never do this in application code:

```ts
// DANGEROUS — reads the file at runtime, bypasses platform injection
const key = fs.readFileSync(".env", "utf-8");
// DANGEROUS — dotenv in production, overrides platform-injected values
import "dotenv/config";
```

`dotenv` is a development tool. In production, the platform injects
environment variables. Loading `.env` at runtime in production can
override injected values or expose secrets.

---

## In CI/CD

Never paste secret values into workflow YAML. Use platform secret
stores only.

GitHub Actions — secrets via the UI (Settings → Secrets and variables)
and referenced by name:
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

Never:
```yaml
# DANGEROUS — secret value in YAML, committed to git
DATABASE_URL: postgres://user:realpassword@host/db
```

Vercel — set via `vercel env add` or the project dashboard.
Netlify — set via the UI or `netlify env:set`.
Docker — use `--env-file` or a secrets manager, never `ENV SECRET=val`
in Dockerfile (layers are inspectable with `docker history`).

In CI logs, any command that prints `$SECRET` is a leak. Wrap sensitive
commands or redirect output carefully.

---

## In Shell

Always use `set -o pipefail` (or `set -euo pipefail`) so a failed
command in a pipeline doesn't silently produce partial output that
includes secrets.

On some shells, `VAR=value command` stores the value in shell history
(`history | grep VAR`). Prefer `export` or pass via a file, not inline:

```sh
# Avoid — may leak to history on some shells
SANITY_TOKEN="sk..." some-command

# Safer — file reference, not value
some-command --token-file .opencode/sanity-token
```

Use `printenv VAR` to check if a variable is set (prints only the value).
Use `echo ${VAR+x}` to check existence without printing the value.

Clearing history after working with secrets:
```sh
history -d $((HISTCMD-1))  # remove last command from history
```

---

## In Git

Before any commit, run `git status` and verify `.env` or token files
are NOT staged. If one was accidentally committed:

```sh
# Remove from tracking, keep local file
git rm --cached .env
git commit -m "Remove .env from tracking"
```

For a secret already pushed to a remote: rotate the secret immediately.
Removing the commit is not enough — assume it was copied. Then contact
your team to rotate their copies, and consider using `git filter-branch`
or `BFG Repo-Cleaner` to rewrite history.

---

## In OpenCode

Use `{file:path}` syntax in `opencode.json` to reference secrets stored
in files rather than embedding values:

```json
{
  "mcp": {
    "Sanity": {
      "headers": {
        "Authorization": "Bearer {file:.opencode/sanity-token}"
      }
    }
  }
}
```

Token files in `.opencode/` (like `sanity-token`) are automatically
gitignored. Store only the token value in these files — no quotes, no
newlines, no extra characters.

When passing secrets to opencode or other tools, always pass the FILE
REFERENCE, never the value:

```sh
opencode run --token-file .opencode/sanity-token
# NOT:
opencode run --token "sk-real-token-value"
```

---

## Never

These actions leak secrets to terminal output, logs, git, or history.
Do not do any of them, ever:

- `cat`, `head`, `tail`, `less`, `more`, `bat`, or any pager on
  `.env`, `.env.local`, `.env.*`, token files, `.pem`, `.key`, or
  any path containing `token`, `secret`, `key`, `credential`
- `echo $(cat .env)` or any substitution that echoes secret file content
- `grep VALUE .env` — prints the matched line including the value.
  `grep '^[A-Z_]*=' .env` is ok: it prints only variable names
- `source .env && echo $SECRET` — expands secret to stdout
- Secret values in command arguments: `AWS_SECRET_KEY=abc123 cmd`
- Secrets in `Dockerfile` with `ENV`
- Secrets in CI/CD YAML files
- `fs.readFileSync('.env')` in application code
- Asking an AI to read, encrypt, or decrypt a file containing secrets
- Piping secret file content to any command that logs output

---

## Instead

When you need to verify, inspect, or work with files containing secrets,
use these safe alternatives:

```sh
# Verify a file exists
ls -la .opencode/sanity-token

# Check line count (single-line token = 1, multi-line = more)
wc -l .opencode/sanity-token

# Read only the first line (if it's a comment or key name)
head -1 .env

# List only variable names, no values
grep '^[A-Z_][A-Z0-9_]*=' .env

# Check a variable is set without printing its value
echo ${SECRET_KEY+x}
```

When a command needs a secret, pass a file reference or use a tool's
built-in file flag:

```sh
some-cli --token-file .opencode/sanity-token
curl -H "Authorization: Bearer $(<.opencode/sanity-token)" https://api.example.com
```

The `$(<file)` syntax reads the file directly without spawning a
subprocess — safer than `$(cat file)` but still avoid echoing it.

---

## Encrypted Secrets

For secrets that must live in the repo (e.g., shared configs), use
encryption tools:

- **git-crypt** — transparent encryption for specific files
- **SOPS** (Mozilla) — encrypts YAML/JSON/dotenv with cloud KMS
- **age** — simple file encryption with `age` CLI

Never ask an AI to encrypt or decrypt a secret. AI models log
conversation data. Reference the encrypted file path in documentation:
"Decrypt with `git-crypt unlock`" — never paste the decrypted value.

---

## Summary

1. Never expose a secret to stdout, chat, git, CI logs, or code.
2. Use `.env.example` for documentation, `.gitignore` for protection.
3. Read secrets from `process.env`, never from files in app code.
4. In CI/CD, use platform secrets — never paste values into YAML.
5. In shell, use file references, not inline values.
6. In OpenCode, use `{file:path}` syntax.
7. If a secret was exposed: rotate it immediately, then clean up.
8. If you are unsure whether a command might leak a secret, stop and
   ask the user to run it manually.

Confirm you have read and understood every rule in this file. You must
follow each rule for the rest of this session, in all modes, without
exception. If any action might violate these rules, stop immediately and
ask the user before proceeding. Your compliance is absolute.
