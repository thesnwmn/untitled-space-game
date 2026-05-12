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
