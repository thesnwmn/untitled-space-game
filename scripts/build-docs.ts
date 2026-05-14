import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { marked } from 'marked';
import { parseWorld, WorldDoc } from './lib/parse-world.ts';
import { page, Breadcrumb } from './lib/html-template.ts';

const ROOT = resolve(import.meta.dir, '..');
const WORLD_DIR = join(ROOT, 'docs', 'world');
const OUT_DIR = join(ROOT, 'dist', 'docs');

const CATEGORIES = ['systems', 'destinations', 'factions', 'ships', 'story'] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  systems: 'Systems',
  destinations: 'Destinations',
  factions: 'Factions',
  ships: 'Ships',
  story: 'Story Beats',
};

const DOCS_BASE: Breadcrumb = { label: 'UNTITLED SPACE GAME', href: '../index.html' };
const DOCS_INDEX: Breadcrumb = { label: 'DOCS', href: 'index.html' };

// ── helpers ──────────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true });
}

function write(filePath: string, html: string) {
  ensureDir(join(filePath, '..'));
  writeFileSync(filePath, html, 'utf-8');
}

function esc(v: unknown): string {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtBoolean(v: unknown): string {
  if (v === true) return '<span class="legal-true">yes</span>';
  if (v === false) return '<span class="legal-false">no</span>';
  return esc(v);
}

function renderArray(items: unknown[], category?: string, targetCat?: string): string {
  if (!Array.isArray(items) || items.length === 0) return '—';
  return items
    .map((item) => {
      const s = String(item);
      if (category && targetCat) {
        const depth = category === 'root' ? '' : '../';
        return `<a href="${depth}${targetCat}/${s}.html">${s}</a>`;
      }
      return `<span class="tag">${esc(s)}</span>`;
    })
    .join(' ');
}

function frontMatterTable(data: Record<string, unknown>, category: string): string {
  const skip = new Set(['id', 'commodities']);
  const rows = Object.entries(data)
    .filter(([k]) => !skip.has(k))
    .map(([k, v]) => {
      let cell: string;
      if (k === 'major_factions' && Array.isArray(v)) {
        cell = renderArray(v, category, 'factions');
      } else if (k === 'destinations' && Array.isArray(v)) {
        cell = renderArray(v, category, 'destinations');
      } else if ((k === 'system' || k === 'home_system') && typeof v === 'string') {
        cell = `<a href="../systems/${v}.html">${v}</a>`;
      } else if (k === 'influence' && Array.isArray(v)) {
        cell = renderArray(v, category, 'systems');
      } else if (k === 'tags' && Array.isArray(v)) {
        cell = renderArray(v);
      } else if (typeof v === 'boolean') {
        cell = fmtBoolean(v);
      } else if (typeof v === 'object' && v !== null) {
        cell = `<pre>${esc(JSON.stringify(v, null, 2))}</pre>`;
      } else if (Array.isArray(v)) {
        cell = (v as unknown[]).map(esc).join(', ');
      } else {
        cell = esc(v);
      }
      return `<tr><th>${esc(k.replace(/_/g, ' '))}</th><td>${cell}</td></tr>`;
    })
    .join('\n');
  return `<table>${rows}</table>`;
}

// ── per-category index columns ────────────────────────────────────────────────

function systemRow(doc: WorldDoc): string {
  const { id, data } = doc;
  const name = esc(data.name ?? id);
  return `<tr>
    <td><a href="${id}.html">${name}</a></td>
    <td>${esc(data.zone)}</td>
    <td>${esc(data.security)}</td>
    <td>${esc(data.danger_level)}</td>
    <td>${esc(data.star_type)}</td>
  </tr>`;
}

function destinationRow(doc: WorldDoc): string {
  const { id, data } = doc;
  const name = esc(data.name ?? id);
  const system = typeof data.system === 'string'
    ? `<a href="../systems/${data.system}.html">${data.system}</a>`
    : '—';
  return `<tr>
    <td><a href="${id}.html">${name}</a></td>
    <td>${system}</td>
    <td>${esc(data.type)}</td>
    <td>${esc(data.danger_level)}</td>
  </tr>`;
}

function factionRow(doc: WorldDoc): string {
  const { id, data } = doc;
  const name = esc(data.name ?? id);
  return `<tr>
    <td><a href="${id}.html">${name}</a></td>
    <td>${esc(data.type)}</td>
    <td>${esc(data.home_system)}</td>
    <td>${esc(data.size)}</td>
  </tr>`;
}

function shipRow(doc: WorldDoc): string {
  const { id, data } = doc;
  const name = esc(data.name ?? id);
  return `<tr>
    <td><a href="${id}.html">${name}</a></td>
    <td>${esc(data.class)}</td>
    <td>${data.cost != null ? esc(data.cost) : '—'}</td>
    <td>${data.cargo_capacity_kg != null ? esc(data.cargo_capacity_kg) + ' kg' : '—'}</td>
  </tr>`;
}

function storyRow(doc: WorldDoc): string {
  const { id, data } = doc;
  const title = esc(data.title ?? data.id ?? id);
  return `<tr>
    <td><a href="${id}.html">${title}</a></td>
    <td>${esc(data.type)}</td>
    <td>${esc(data.trigger)}</td>
    <td>${fmtBoolean(data.skippable)}</td>
  </tr>`;
}

const CATEGORY_HEADER: Record<Category, string> = {
  systems: '<tr><th>Name</th><th>Zone</th><th>Security</th><th>Danger</th><th>Star Type</th></tr>',
  destinations: '<tr><th>Name</th><th>System</th><th>Type</th><th>Danger</th></tr>',
  factions: '<tr><th>Name</th><th>Type</th><th>Home System</th><th>Size</th></tr>',
  ships: '<tr><th>Name</th><th>Class</th><th>Cost</th><th>Cargo</th></tr>',
  story: '<tr><th>Title</th><th>Type</th><th>Trigger</th><th>Skippable</th></tr>',
};

function rowFn(cat: Category): (doc: WorldDoc) => string {
  switch (cat) {
    case 'systems': return systemRow;
    case 'destinations': return destinationRow;
    case 'factions': return factionRow;
    case 'ships': return shipRow;
    case 'story': return storyRow;
  }
}

// ── build ─────────────────────────────────────────────────────────────────────

const docs = parseWorld(WORLD_DIR);

const byCategory = new Map<string, WorldDoc[]>();
for (const doc of docs) {
  const list = byCategory.get(doc.category) ?? [];
  list.push(doc);
  byCategory.set(doc.category, list);
}

// Root-level docs (commodities.md, galaxy-map.md, etc.)
const rootDocs = byCategory.get('root') ?? [];
const commoditiesDoc = rootDocs.find((d) => d.id === 'commodities');

// ── commodities.html ──────────────────────────────────────────────────────────

if (commoditiesDoc) {
  const commodities = (commoditiesDoc.data.commodities ?? []) as Array<Record<string, unknown>>;
  const rows = commodities
    .map(
      (c) => `<tr>
        <td>${esc(c.name)}</td>
        <td>${esc(c.category)}</td>
        <td>${c.base_price != null ? esc(c.base_price) : '—'}</td>
        <td class="${c.legal ? 'legal-true' : 'legal-false'}">${c.legal ? 'legal' : 'illegal'}</td>
        <td>${c.weight_kg != null ? esc(c.weight_kg) + ' kg' : '—'}</td>
        <td class="dimmed">${esc(c.description)}</td>
      </tr>`
    )
    .join('\n');

  const body = `
    <h1>Commodities</h1>
    <table>
      <tr><th>Name</th><th>Category</th><th>Base Price</th><th>Legal</th><th>Weight</th><th>Description</th></tr>
      ${rows}
    </table>
    ${marked.parse(commoditiesDoc.content) as string}
  `;

  write(
    join(OUT_DIR, 'commodities.html'),
    page('Commodities', [
      { ...DOCS_BASE, href: '../index.html' },
      { ...DOCS_INDEX, href: 'index.html' },
      { label: 'COMMODITIES' },
    ], body)
  );
  console.log('  ✓ commodities.html');
}

// ── category index + detail pages ────────────────────────────────────────────

for (const cat of CATEGORIES) {
  const catDocs = (byCategory.get(cat) ?? []).filter((d) => d.id !== '_template');
  if (catDocs.length === 0) continue;

  const label = CATEGORY_LABELS[cat];
  const catDir = join(OUT_DIR, cat);
  ensureDir(catDir);

  // index.html
  const renderRow = rowFn(cat);
  const tableRows = catDocs.map(renderRow).join('\n');
  const indexBody = `
    <h1>${label}</h1>
    <table>${CATEGORY_HEADER[cat]}${tableRows}</table>
  `;
  write(
    join(catDir, 'index.html'),
    page(label, [
      { ...DOCS_BASE, href: '../../index.html' },
      { ...DOCS_INDEX, href: '../index.html' },
      { label: label.toUpperCase() },
    ], indexBody)
  );

  // detail pages
  for (const doc of catDocs) {
    const bodyHtml = marked.parse(doc.content) as string;
    const detailBody = `
      <h1>${esc(String(doc.data.name ?? doc.data.title ?? doc.id))}</h1>
      ${frontMatterTable(doc.data, cat)}
      ${bodyHtml}
    `;
    const docName = esc(String(doc.data.name ?? doc.data.title ?? doc.id));
    write(
      join(catDir, `${doc.id}.html`),
      page(docName, [
        { ...DOCS_BASE, href: '../../index.html' },
        { ...DOCS_INDEX, href: '../index.html' },
        { label: label.toUpperCase(), href: 'index.html' },
        { label: docName },
      ], detailBody)
    );
  }

  console.log(`  ✓ ${cat}/ (${catDocs.length} docs)`);
}

// ── dist/docs/index.html ──────────────────────────────────────────────────────

const catLinks = CATEGORIES.map((cat) => {
  const label = CATEGORY_LABELS[cat];
  return `<li><a href="${cat}/index.html">[ ${label.toUpperCase()} ]</a></li>`;
}).join('\n');

const hasCommodities = commoditiesDoc != null;
const commoditiesLink = hasCommodities
  ? `<li><a href="commodities.html">[ COMMODITIES ]</a></li>`
  : '';

const indexBody = `
  <h1>World Docs</h1>
  <p class="dimmed">Browse the factions, systems, destinations, ships, and story of Untitled Space Game.</p>
  <ul style="list-style:none;padding:0;margin-top:1.5rem;line-height:2.5">
    ${catLinks}
    ${commoditiesLink}
  </ul>
`;

write(
  join(OUT_DIR, 'index.html'),
  page('World Docs', [
    { label: 'UNTITLED SPACE GAME', href: '../index.html' },
    { label: 'DOCS' },
  ], indexBody)
);

console.log('  ✓ index.html');
console.log('Done — dist/docs/ written.');
