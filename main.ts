import { mkdirSync, writeFileSync } from "node:fs";
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

function main(): void {
  validateEntry(ENTRY_TEXT);
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, ENTRY_FILENAME), ENTRY_TEXT, "utf8");
}

main();
