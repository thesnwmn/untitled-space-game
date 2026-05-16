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

function buildGrid(pts: number[]): string {
  const cells = pts.map(cp => {
    const ch  = String.fromCodePoint(cp);
    const tip = esc(`${hex(cp)}  ${ch}`);
    return (
      `<pre title="${tip}">` +
      `<span class="fg-white bg-black">${esc(ch)}</span>` +
      `<span class="fg-black bg-green">${esc(ch)}</span>` +
      `</pre>`
    );
  });

  return `<div class="font-grid">\n${cells.join('\n')}\n</div>`;
}

const pts = codepoints();

const GRID_CSS = `
<style>
  .fg-white { color: var(--white); }
  .fg-black { color: var(--black); }
  .bg-black { background: var(--black); }
  .bg-green  { background: var(--green); }
  .font-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 4em);
    gap: 2px;
    margin: 1rem 0 2.5rem;
  }
  .font-grid pre {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2em;
    margin: 0;
    padding: 0;
    font-family: 'Share Tech Mono', monospace;
    font-size: 1.4em;
    line-height: 1;
    white-space: pre;
  }

  .font-grid pre:hover {
    outline: 1px solid #ffff00;
    z-index: 1;
  }
</style>`;

const body = `${GRID_CSS}
<h1>Font Character Reference — Share Tech Mono</h1>
<p>
  All ${pts.length} printable glyphs in Share Tech Mono (Google Fonts v16).
  Each cell shows the character white-on-black (game default) then black-on-green
  (highlighted / active-cell rendering). Hover any cell to see its code point.
  Characters not shown here fall back to the system monospace font in the game.
</p>
${buildGrid(pts)}
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  join(OUT_DIR, 'index.html'),
  page('Font Reference', [{ label: 'HOME', href: '../' }, { label: 'FONT REFERENCE' }], body),
);
console.log(`Built font report → ${OUT_DIR}/index.html`);
