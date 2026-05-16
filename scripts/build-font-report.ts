import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { page } from './lib/html-template.ts';

const ROOT    = resolve(import.meta.dir, '..');
const OUT_DIR = join(ROOT, 'dist/font-report');

// All printable code points in Share Tech Mono v16 (derived from font cmap).
// Update this list if the font version changes.
function codepoints(): number[] {
  const pts: number[] = [];
  for (let cp = 0x0020; cp <= 0x007E; cp++) pts.push(cp); // Basic Latin
  for (let cp = 0x00A0; cp <= 0x00FF; cp++) pts.push(cp); // Latin-1 Supplement
  for (const cp of [
    0x0131, 0x0152, 0x0153,                               // Latin Extended
    0x02C6, 0x02DA, 0x02DC,                               // Spacing Modifiers
    0x2013, 0x2014, 0x2018, 0x2019, 0x201A,               // General Punctuation
    0x201C, 0x201D, 0x201E, 0x2022, 0x2026,
    0x2039, 0x203A, 0x2044,
    0x20AC,                                               // Currency
    0x2122, 0x2212, 0x2215,                               // Mathematical/Technical
  ]) pts.push(cp);
  return pts;
}

const COLS = 16;

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hex(cp: number): string {
  return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
}

function buildGrid(pts: number[], bg: string, fg: string): string {
  const cells: string[] = [];
  let col = 0;

  for (const cp of pts) {
    if (col === 0) {
      cells.push(`<div class="row-label">${hex(cp)}</div>`);
    }
    const ch  = String.fromCodePoint(cp);
    const tip = esc(`${hex(cp)}  ${ch}`);
    cells.push(
      `<pre style="background:${bg};color:${fg}" title="${tip}">${esc(ch)}</pre>`
    );
    col = (col + 1) % COLS;
  }

  // Pad the last row to keep the grid even
  while (col !== 0) {
    cells.push(`<pre style="background:${bg};opacity:0.05"> </pre>`);
    col = (col + 1) % COLS;
  }

  return `<div class="font-grid">\n${cells.join('\n')}\n</div>`;
}

const pts   = codepoints();
const GAME_BG = '#000000';
const GAME_FG = '#ffffff';
const INV_BG  = '#00ff00';
const INV_FG  = '#000000';

const GRID_CSS = `
<style>
  .font-grid {
    display: grid;
    grid-template-columns: 6em repeat(${COLS}, 2em);
    gap: 2px;
    margin: 1rem 0 2.5rem;
  }
  .row-label {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.6em;
    font-size: 0.7em;
    color: #555;
    border: 1px solid transparent;
  }
  .font-grid pre {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2em;
    margin: 0;
    padding: 0;
    font-family: 'Share Tech Mono', monospace;
    font-size: 1em;
    white-space: pre;
    border: 1px solid #222;
  }
  .font-grid pre:hover {
    outline: 1px solid #ffff00;
    z-index: 1;
  }
</style>`;

const body = `${GRID_CSS}
<h1>Font Character Reference — Share Tech Mono</h1>
<p>
  All ${pts.length} printable glyphs in Share Tech Mono (Google Fonts v16),
  each in its own cell at single-column advance width.
  Hover any cell to see its code point. Characters not shown here fall back to
  the system monospace font in the game.
</p>

<h2>Game palette</h2>
<p>White text on black background — matches the game's default renderer output.</p>
${buildGrid(pts, GAME_BG, GAME_FG)}

<h2>Inverted palette</h2>
<p>Black text on green background — matches highlighted / active-cell rendering.</p>
${buildGrid(pts, INV_BG, INV_FG)}
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  join(OUT_DIR, 'index.html'),
  page('Font Reference', [{ label: 'HOME', href: '../' }, { label: 'FONT REFERENCE' }], body),
);
console.log(`Built font report → ${OUT_DIR}/index.html`);
