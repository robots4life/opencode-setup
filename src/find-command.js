import fs from "node:fs";
import path from "node:path";

// Locate a command template by name, searching recursively under `root`.
// Returns the absolute path, or `null` when no matching file exists.
export function findCommandFile(name, root) {
  const fileName = `${name}.md`;
  for (const entry of fs.readdirSync(root, { recursive: true })) {
    if (entry === fileName || entry.endsWith(`/${fileName}`)) {
      return path.join(root, entry);
    }
  }
  return null;
}
