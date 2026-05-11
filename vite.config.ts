import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/untitled-space-game/',
  test: {
    include: ['src/tests/**/*.test.ts'],
  },
});
