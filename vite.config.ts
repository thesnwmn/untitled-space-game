import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/untitled-space-game/game/',
  build: {
    outDir: 'dist/game',
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/tests/setup.ts'],
  },
});
