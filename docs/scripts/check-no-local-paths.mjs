#!/usr/bin/env node
/**
 * Scans the built Astro output (docs/dist) for references to local-machine
 * paths that must not appear in public docs. Exits non-zero if anything is
 * found, which fails the deploy workflow.
 *
 * Run after `astro build` has produced `dist/`.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const FILE_EXTENSIONS = ['.html', '.js', '.css', '.json', '.xml'];

// Patterns that must never appear in public docs.
// Tuned to avoid false positives on legitimate content (e.g. localhost in dev
// setup instructions is fine; Windows-style drive letters in paths are not).
const BLOCKED_PATTERNS = [
  { name: 'Windows user path', regex: /[A-Za-z]:[\\/]Users[\\/][^\s<>"'`,]+/ },
  { name: 'Unix home path with username', regex: /\/home\/(?!runner\b)[a-z0-9_-]+\/[^\s<>"'`,]+/ },
  { name: 'macOS user path', regex: /\/Users\/[a-z0-9_-]+\/[^\s<>"'`,]+/i },
];

// Files or paths that are allowed to contain matches (none currently).
const ALLOWLIST = [];

function* walk(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      yield* walk(full);
    } else if (FILE_EXTENSIONS.some((ext) => full.endsWith(ext))) {
      yield full;
    }
  }
}

let violationsFound = 0;

for (const file of walk(DIST)) {
  if (ALLOWLIST.some((allow) => file.includes(allow))) continue;

  const content = readFileSync(file, 'utf8');
  for (const { name, regex } of BLOCKED_PATTERNS) {
    const match = content.match(regex);
    if (match) {
      console.error(`BLOCKED (${name}) in ${file}:`);
      console.error(`  ${match[0]}`);
      violationsFound++;
    }
  }
}

if (violationsFound > 0) {
  console.error(`\nFAIL — ${violationsFound} local-path reference(s) found in public docs.`);
  console.error('Remove personal paths before merging. See issue #26.');
  process.exit(1);
}

console.log('OK — no local-machine paths in public docs.');
