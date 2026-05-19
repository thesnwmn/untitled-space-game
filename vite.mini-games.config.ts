import { defineConfig } from 'vite';
import { resolve } from 'path';
import { renameSync } from 'fs';

export default defineConfig({
  base: '/untitled-space-game/mini-games/',
  build: {
    outDir: 'dist/mini-games',
    rollupOptions: {
      input: resolve(__dirname, 'mini-games.html'),
    },
  },
  plugins: [
    {
      name: 'mini-games-root',
      closeBundle() {
        const src = resolve(__dirname, 'dist/mini-games/mini-games.html');
        const dst = resolve(__dirname, 'dist/mini-games/index.html');
        try { renameSync(src, dst); } catch { /* already renamed or dev mode */ }
      },
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/' || req.url === '') req.url = '/mini-games.html';
          next();
        });
      },
    },
  ],
});
