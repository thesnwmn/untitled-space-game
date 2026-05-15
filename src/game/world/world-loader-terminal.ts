import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { parseWorldFiles } from './world-parser';
import type { WorldData } from './types';

function collectMarkdown(dir: string, prefix: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(result, collectMarkdown(full, rel));
    } else if (entry.name.endsWith('.md')) {
      result[rel] = readFileSync(full, 'utf-8');
    }
  }
  return result;
}

export function loadWorldData(): WorldData {
  const worldDir = join(process.cwd(), 'docs', 'world');
  return parseWorldFiles(collectMarkdown(worldDir, ''));
}
