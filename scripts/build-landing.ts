import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dir, '..');
const OUT_DIR = join(ROOT, 'dist');

mkdirSync(OUT_DIR, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Untitled Space Game</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000;
      color: #fff;
      font-family: 'Share Tech Mono', 'VT323', monospace;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .title {
      text-align: center;
      margin-bottom: 0.5rem;
      letter-spacing: 0.3em;
    }
    .title h1 {
      font-size: clamp(2rem, 8vw, 4rem);
      color: #00ffff;
      line-height: 1.1;
    }
    .tagline {
      color: #555;
      font-size: 1rem;
      letter-spacing: 0.15em;
      margin-bottom: 3rem;
      text-align: center;
    }
    .tiles {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2px solid #00ffff;
      padding: 2rem 2.5rem;
      min-width: 160px;
      text-decoration: none;
      color: #00ffff;
      font-size: 1rem;
      letter-spacing: 0.1em;
      transition: background 0.1s;
    }
    .tile:hover {
      background: #001a1a;
    }
    .tile.disabled {
      border-color: #333;
      color: #333;
      cursor: default;
      pointer-events: none;
    }
    .tile .tile-label {
      font-size: 1.2rem;
      font-weight: bold;
    }
    .tile .tile-sub {
      font-size: 0.75rem;
      margin-top: 0.5rem;
      opacity: 0.7;
    }
    footer {
      position: fixed;
      bottom: 1rem;
      color: #333;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
    }
  </style>
</head>
<body>
  <div class="title">
    <h1>UNTITLED</h1>
    <h1>SPACE GAME</h1>
  </div>
  <p class="tagline">— An ASCII space adventure —</p>
  <div class="tiles">
    <a class="tile" href="game/index.html">
      <span class="tile-label">[ PLAY GAME ]</span>
    </a>
    <a class="tile" href="docs/index.html">
      <span class="tile-label">[ WORLD DOCS ]</span>
    </a>
    <a class="tile" href="map/index.html">
      <span class="tile-label">[ GALAXY MAP ]</span>
    </a>
  </div>
  <footer>UNTITLED SPACE GAME</footer>
</body>
</html>`;

writeFileSync(join(OUT_DIR, 'index.html'), html, 'utf-8');
console.log('  ✓ dist/index.html written.');
