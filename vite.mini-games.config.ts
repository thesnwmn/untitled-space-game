import { defineConfig } from 'vite';
import { resolve } from 'path';

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
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/' || req.url === '') req.url = '/mini-games.html';
          next();
        });
      },
    },
  ],
});
