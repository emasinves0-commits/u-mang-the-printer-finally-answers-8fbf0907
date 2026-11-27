import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The entry: the office printer answers back. The human said "just one
// page" — the printer counted, and the count is the comeback. The last two
// sentences flip the blame with a parallel "make": the printer makes paper,
// the human makes promises. 92 characters, no trailing newline.
const ENTRY_TEXT =
  'You said "just one page." I fed 47. I do not make mistakes. I make paper. You make promises.';
const ENTRY_FILENAME = "entry.txt";
const MAX_CHARS = 240;

function validateEntry(text: string): void {
  if (text.length < 1 || text.length > MAX_CHARS) {
    throw new Error(
      `entry must be 1-${MAX_CHARS} characters, got ${text.length}`,
    );
  }
  if (text.trim() !== text) {
    throw new Error("entry must not start or end with whitespace");
  }
  // The entry is a single line the judge reads in one go: no newlines,
  // no control characters, no trailing newline in the file.
  if (/[\n\r\u0000-\u001f]/.test(text)) {
    throw new Error("entry must be a single line with no control characters");
  }
}

function selfTest(): void {
  if (ENTRY_TEXT.length !== 92) {
    throw new Error(
      `self-test failed: entry must be exactly 92 characters, got ${ENTRY_TEXT.length}`,
    );
  }
  validateEntry(ENTRY_TEXT);
  const dir = mkdtempSync(join(tmpdir(), "printer-selftest-"));
  try {
    const outPath = join(dir, ENTRY_FILENAME);
    writeFileSync(outPath, ENTRY_TEXT, "utf8");
    const back = readFileSync(outPath, "utf8");
    if (back !== ENTRY_TEXT) {
      throw new Error("self-test failed: round-trip bytes differ");
    }
    if (back.endsWith("\n")) {
      throw new Error("self-test failed: trailing newline");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log(
    "self-test: OK — entry is exactly 92 characters, no trailing newline, output-dir round-trip byte-identical",
  );
}

function main(): void {
  validateEntry(ENTRY_TEXT);
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outputDir, { recursive: true });
  const outPath = join(outputDir, ENTRY_FILENAME);
  writeFileSync(outPath, ENTRY_TEXT, "utf8");
  // Guard: never leave a file whose bytes differ from the entry.
  const written = readFileSync(outPath, "utf8");
  if (written !== ENTRY_TEXT) {
    throw new Error("round-trip check failed: written entry differs");
  }
}

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  main();
}
