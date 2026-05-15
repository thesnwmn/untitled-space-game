import { initWorld } from '../game/world/world-data';
import { loadWorldData } from '../game/world/world-loader-browser';

// Polyfill document.fonts for jsdom test environment
if (typeof document !== 'undefined' && !document.fonts) {
  Object.defineProperty(document, 'fonts', {
    value: {
      ready: Promise.resolve(),
      load: () => Promise.resolve([]),
      addEventListener: () => {},
    },
    writable: true,
  });
}

initWorld(loadWorldData());
