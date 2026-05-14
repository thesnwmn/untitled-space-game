import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

export interface WorldDoc {
  path: string;
  category: string;
  id: string;
  data: Record<string, unknown>;
  content: string;
}

function walkDir(dir: string, base: string, results: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkDir(full, base, results);
    } else if (entry.endsWith('.md')) {
      results.push(full);
    }
  }
}

export function parseWorld(worldDir: string): WorldDoc[] {
  const files: string[] = [];
  walkDir(worldDir, worldDir, files);

  return files.map((filePath) => {
    const rel = filePath.slice(worldDir.length + 1); // e.g. systems/sol.md
    const parts = rel.split('/');
    const category = parts.length > 1 ? parts[0] : 'root';
    const filename = parts[parts.length - 1];
    const id = filename.replace(/\.md$/, '');

    const raw = readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    return { path: filePath, category, id, data, content };
  });
}
