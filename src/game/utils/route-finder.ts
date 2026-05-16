import { getRoutesFrom } from '../world/world-data';

export function findRoute(from: string, to: string): string[] | null {
  if (from === to) return [from];
  const queue: string[][] = [[from]];
  const visited = new Set<string>([from]);
  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    for (const route of getRoutesFrom(current)) {
      const next = route.from === current ? route.to : route.from;
      if (next === to) return [...path, next];
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([...path, next]);
      }
    }
  }
  return null;
}
