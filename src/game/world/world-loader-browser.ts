import { parseWorldFiles } from './world-parser';
import type { WorldData } from './types';

export function loadWorldData(): WorldData {
  const rawFiles = import.meta.glob('/docs/world/**/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>;

  const files: Record<string, string> = {};
  for (const [key, content] of Object.entries(rawFiles)) {
    const relPath = key.replace('/docs/world/', '');
    files[relPath] = content;
  }

  return parseWorldFiles(files);
}
