// Run with: bun test scripts/build-font-report.test.ts
// Verifies the font report HTML structure after a build.
import { expect, test, beforeAll } from 'bun:test';
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT    = resolve(import.meta.dir, '..');
const HTML    = join(ROOT, 'dist/font-report/index.html');

beforeAll(() => {
  const result = spawnSync('bun', ['run', 'scripts/build-font-report.ts'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(result.stderr);
});

function html(): string {
  return readFileSync(HTML, 'utf8');
}

test('no row-label column in output', () => {
  expect(html()).not.toContain('row-label');
});

test('uses responsive auto-fill grid, not fixed 16-column layout', () => {
  expect(html()).toContain('repeat(auto-fill,');
  expect(html()).not.toContain('repeat(16,');
});

test('single grid element', () => {
  const matches = html().match(/class="font-grid"/g) ?? [];
  expect(matches.length).toBe(1);
});

test('each cell has white-on-black span', () => {
  const count = (html().match(/class="fg-white bg-black"/g) ?? []).length;
  expect(count).toBeGreaterThan(0);
});

test('each cell has black-on-green span', () => {
  const count = (html().match(/class="fg-black bg-green"/g) ?? []).length;
  expect(count).toBeGreaterThan(0);
});

test('both colour spans appear the same number of times', () => {
  const w = (html().match(/class="fg-white bg-black"/g) ?? []).length;
  const g = (html().match(/class="fg-black bg-green"/g) ?? []).length;
  expect(w).toBe(g);
  expect(w).toBeGreaterThan(200);
});
