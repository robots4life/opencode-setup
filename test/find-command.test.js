import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { findCommandFile } from "../src/find-command.js";

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "opcup-find-"));
}

test("findCommandFile: finds a flat command", () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, "flat.md"), "x", "utf-8");
    assert.equal(findCommandFile("flat", dir), path.join(dir, "flat.md"));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("findCommandFile: finds a nested command", () => {
  const dir = tmp();
  try {
    const nested = path.join(dir, "001-nested");
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, "nested.md"), "x", "utf-8");
    assert.equal(
      findCommandFile("nested", dir),
      path.join(nested, "nested.md"),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("findCommandFile: returns null when the command is missing", () => {
  const dir = tmp();
  try {
    fs.writeFileSync(path.join(dir, "present.md"), "x", "utf-8");
    assert.equal(findCommandFile("absent", dir), null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
