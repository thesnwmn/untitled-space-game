import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/untitled-space-game/',
  test: {
    environment: 'jsdom',
    include: ['src/tests/**/*.test.ts'],
    setupFiles: ['src/tests/setup.ts'],
  },
});
