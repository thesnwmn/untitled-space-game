import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import matter from 'gray-matter';
import { page } from './lib/html-template.ts';

interface SystemNode {
  id: string;
  name: string;
  zone: string;
  security: string;
  danger_level: string;
  destCount: number;
  x: number;
  y: number;
}

interface Route {
  from: string;
  to: string;
  stability?: string;
  security?: string;
}

const ROOT = resolve(import.meta.dir, '..');
const SYSTEMS_DIR = join(ROOT, 'docs/world/systems');
const ROUTES_FILE = join(ROOT, 'docs/world/navigation/jump-routes.md');
const OUT_DIR = join(ROOT, 'dist/map');

// Read systems
const systems: SystemNode[] = [];
for (const entry of readdirSync(SYSTEMS_DIR).sort()) {
  if (entry.startsWith('_') || !entry.endsWith('.md')) continue;
  const raw = readFileSync(join(SYSTEMS_DIR, entry), 'utf-8');
  const { data } = matter(raw);
  const pos = data.map_position as { x?: number; y?: number } | undefined;
  if (!pos || pos.x === undefined || pos.y === undefined) {
    console.warn(`  ⚠  ${entry}: no map_position, skipping`);
    continue;
  }
  systems.push({
    id: String(data.id ?? entry.replace(/\.md$/, '')),
    name: String(data.name ?? data.id ?? entry.replace(/\.md$/, '')),
    zone: String(data.zone ?? 'unknown'),
    security: String(data.security ?? 'unknown'),
    danger_level: String(data.danger_level ?? 'unknown'),
    destCount: Array.isArray(data.destinations) ? data.destinations.length : 0,
    x: Number(pos.x),
    y: Number(pos.y),
  });
}

// Read routes
const routesRaw = readFileSync(ROUTES_FILE, 'utf-8');
const { data: routesData } = matter(routesRaw);
const routes: Route[] = Array.isArray((routesData as Record<string, unknown>).routes)
  ? ((routesData as Record<string, unknown>).routes as Route[])
  : [];

// Normalize coordinates to fit within the 0–100 viewBox with padding
const xs = systems.map((s) => s.x);
const ys = systems.map((s) => s.y);
const minX = Math.min(...xs), maxX = Math.max(...xs);
const minY = Math.min(...ys), maxY = Math.max(...ys);
const PADDING = 8;

function norm(val: number, min: number, max: number): number {
  if (min === max) return 50;
  return PADDING + ((val - min) / (max - min)) * (100 - 2 * PADDING);
}

interface PlacedSystem extends SystemNode {
  nx: number;
  ny: number;
}

const sysMap = new Map<string, PlacedSystem>();
for (const s of systems) {
  sysMap.set(s.id, { ...s, nx: norm(s.x, minX, maxX), ny: norm(s.y, minY, maxY) });
}

// Color helpers
function zoneColor(zone: string): string {
  switch (zone) {
    case 'core':     return 'var(--bright-cyan)';
    case 'frontier': return 'var(--bright-yellow)';
    case 'outer':    return 'var(--bright-magenta)';
    default:         return 'var(--white)';
  }
}

function secColor(sec: string): string {
  switch (sec) {
    case 'high':   return 'var(--green)';
    case 'medium': return 'var(--yellow)';
    case 'low':    return 'var(--red)';
    case 'none':   return 'var(--bright-black)';
    default:       return 'var(--bright-black)';
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Build SVG route lines
const routeLines: string[] = [];
for (const r of routes) {
  const from = sysMap.get(r.from);
  const to = sysMap.get(r.to);
  if (!from || !to) {
    console.warn(`  ⚠  route ${r.from} → ${r.to}: system not found, skipping`);
    continue;
  }
  const dash = r.stability === 'unstable' ? ' stroke-dasharray="1 0.5"' : '';
  routeLines.push(
    `  <line x1="${from.nx.toFixed(2)}" y1="${from.ny.toFixed(2)}" x2="${to.nx.toFixed(2)}" y2="${to.ny.toFixed(2)}" stroke="${secColor(r.security ?? 'none')}" stroke-width="0.3"${dash}/>`
  );
}

// Build SVG system groups
const systemGroups: string[] = [];
for (const s of sysMap.values()) {
  const labelY = (s.ny + 2.5).toFixed(2);
  systemGroups.push(
    `  <g class="system" data-id="${s.id}" data-name="${esc(s.name)}" data-zone="${s.zone}" data-sec="${s.security}" data-danger="${s.danger_level}" data-dests="${s.destCount}" style="cursor:pointer">
    <title>${esc(s.name)} — ${s.zone} zone, ${s.security} security</title>
    <circle cx="${s.nx.toFixed(2)}" cy="${s.ny.toFixed(2)}" r="1.2" fill="${zoneColor(s.zone)}"/>
    <text x="${s.nx.toFixed(2)}" y="${labelY}" text-anchor="middle" font-size="2.5" fill="var(--white)" font-family="'Share Tech Mono',monospace">${esc(s.name)}</text>
  </g>`
  );
}

const svgEl = `<svg id="galaxy-map" viewBox="0 0 100 100" width="80vmin" height="80vmin" style="display:block" xmlns="http://www.w3.org/2000/svg">
${routeLines.join('\n')}
${systemGroups.join('\n')}
</svg>`;

// Legend HTML
const legendZones = [
  { color: 'var(--bright-cyan)',    label: 'Core' },
  { color: 'var(--bright-yellow)',  label: 'Frontier' },
  { color: 'var(--bright-magenta)', label: 'Outer' },
];
const legendSecs = [
  { color: 'var(--green)',        label: 'High security' },
  { color: 'var(--yellow)',       label: 'Medium security' },
  { color: 'var(--red)',          label: 'Low security' },
  { color: 'var(--bright-black)', label: 'No security' },
];

function legendRow(color: string, label: string): string {
  return `<div style="display:flex;align-items:center;gap:0.5rem;margin:0.2rem 0">
      <span style="display:inline-block;width:10px;height:10px;background:${color};flex-shrink:0"></span>
      <span>${label}</span>
    </div>`;
}

const legendHtml = `<div style="font-size:0.75rem;color:var(--white);line-height:1.4">
  <div style="color:var(--cyan);margin-bottom:0.4rem">ZONE</div>
  ${legendZones.map((z) => legendRow(z.color, z.label)).join('\n  ')}
  <div style="color:var(--cyan);margin-top:0.75rem;margin-bottom:0.4rem">ROUTE</div>
  ${legendSecs.map((z) => legendRow(z.color, z.label)).join('\n  ')}
  <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.4rem">
    <span style="display:inline-block;width:24px;height:2px;background:var(--bright-black);border-top:2px dashed var(--bright-black)"></span>
    <span>Unstable</span>
  </div>
</div>`;

const mapStyle = `<style>
  .map-wrapper { display:flex; justify-content:center; align-items:flex-start; gap:1.5rem; margin-top:1rem; flex-wrap:wrap; }
  .map-container { position:relative; flex-shrink:0; }
  .legend-panel {
    border:1px solid var(--bright-black);
    padding:0.75rem;
    font-family:'Share Tech Mono',monospace;
    align-self:flex-start;
    flex-shrink:0;
  }
  #galaxy-map { cursor:grab; display:block; user-select:none; }
  #galaxy-map.dragging { cursor:grabbing; }
  .map-controls {
    text-align:center;
    margin-top:0.5rem;
    font-size:0.75rem;
    color:var(--bright-black);
  }
  .map-controls button {
    background:none;
    border:1px solid var(--bright-black);
    color:var(--bright-black);
    font-family:'Share Tech Mono',monospace;
    font-size:0.75rem;
    padding:0.2rem 0.6rem;
    cursor:pointer;
    letter-spacing:0.05em;
  }
  .map-controls button:hover { border-color:var(--cyan); color:var(--cyan); }
  #tooltip {
    display:none;
    position:fixed;
    background:var(--black);
    border:1px solid var(--bright-black);
    color:var(--white);
    font-family:'Share Tech Mono',monospace;
    font-size:0.8rem;
    padding:0.5rem 0.75rem;
    pointer-events:none;
    white-space:pre;
    line-height:1.4;
    z-index:100;
  }
  .system:hover circle { opacity:0.85; }
</style>`;

const tooltipDiv = `<div id="tooltip"></div>`;

const script = `<script>
  (function() {
    var map     = document.getElementById('galaxy-map');
    var tooltip = document.getElementById('tooltip');

    // ViewBox state — matches initial viewBox="0 0 100 100"
    var vx = 0, vy = 0, vw = 100, vh = 100;
    var MIN_SIZE = 12, MAX_SIZE = 100, MARGIN = 8;

    function applyViewBox() {
      map.setAttribute('viewBox', vx.toFixed(2)+' '+vy.toFixed(2)+' '+vw.toFixed(2)+' '+vh.toFixed(2));
    }

    function clampViewBox() {
      vx = Math.max(-MARGIN, Math.min(100 + MARGIN - vw, vx));
      vy = Math.max(-MARGIN, Math.min(100 + MARGIN - vh, vy));
    }

    // Mouse-wheel zoom, centred on cursor
    map.addEventListener('wheel', function(e) {
      e.preventDefault();
      var factor = e.deltaY > 0 ? 1.15 : (1 / 1.15);
      var newVw = Math.max(MIN_SIZE, Math.min(MAX_SIZE, vw * factor));
      var newVh = Math.max(MIN_SIZE, Math.min(MAX_SIZE, vh * factor));
      var rect = map.getBoundingClientRect();
      var px = (e.clientX - rect.left)  / rect.width;
      var py = (e.clientY - rect.top)   / rect.height;
      vx += (vw - newVw) * px;
      vy += (vh - newVh) * py;
      vw = newVw; vh = newVh;
      clampViewBox();
      applyViewBox();
    }, { passive: false });

    // Drag-to-pan
    var dragging = false, dragMoved = false;
    var startX = 0, startY = 0, startVx = 0, startVy = 0;

    map.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      dragging  = true;
      dragMoved = false;
      startX = e.clientX; startY = e.clientY;
      startVx = vx;       startVy = vy;
      map.classList.add('dragging');
      tooltip.style.display = 'none';
      e.preventDefault();
    });

    window.addEventListener('mousemove', function(e) {
      if (!dragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
      var rect = map.getBoundingClientRect();
      vx = startVx - dx / rect.width  * vw;
      vy = startVy - dy / rect.height * vh;
      clampViewBox();
      applyViewBox();
    });

    window.addEventListener('mouseup', function() {
      dragging = false;
      map.classList.remove('dragging');
    });

    // Reset button
    document.getElementById('map-reset').addEventListener('click', function() {
      vx = 0; vy = 0; vw = 100; vh = 100;
      applyViewBox();
    });

    // System node interactivity
    document.querySelectorAll('.system').forEach(function(g) {
      g.addEventListener('click', function() {
        if (dragMoved) return;
        window.location.href = '/untitled-space-game/docs/systems/' + g.dataset.id + '.html';
      });
      g.addEventListener('mousemove', function(e) {
        if (dragging) return;
        var name   = g.dataset.name   || '';
        var zone   = g.dataset.zone   || '';
        var sec    = g.dataset.sec    || '';
        var danger = g.dataset.danger || '';
        var dests  = g.dataset.dests  || '0';
        var w = 23;
        function pad(label, value) {
          var line = label + value;
          return '\\u2551 ' + line + ' '.repeat(Math.max(0, w - line.length)) + ' \\u2551';
        }
        var bar = '\\u2550'.repeat(w + 2);
        var lines = [
          '\\u2554' + bar + '\\u2557',
          '\\u2551 ' + name.toUpperCase().substring(0, w).padEnd(w) + ' \\u2551',
          '\\u2551 ' + ' '.repeat(w) + ' \\u2551',
          pad('Zone:         ', zone),
          pad('Security:     ', sec),
          pad('Danger:       ', danger),
          pad('Destinations: ', dests),
          '\\u255a' + bar + '\\u255d',
        ];
        tooltip.textContent = lines.join('\\n');
        var x = Math.min(e.clientX + 14, window.innerWidth  - tooltip.offsetWidth  - 8);
        var y = Math.min(e.clientY + 14, window.innerHeight - tooltip.offsetHeight - 8);
        tooltip.style.left    = x + 'px';
        tooltip.style.top     = y + 'px';
        tooltip.style.display = 'block';
      });
      g.addEventListener('mouseleave', function() {
        tooltip.style.display = 'none';
      });
    });
  })();
</script>`;

const body = `${mapStyle}
<div class="map-wrapper">
  <div class="map-container">
    ${svgEl}
    <div class="map-controls">
      <button id="map-reset">[ RESET VIEW ]</button>
      &nbsp; scroll to zoom &middot; drag to pan
    </div>
  </div>
  <div class="legend-panel">${legendHtml}</div>
</div>
${tooltipDiv}
${script}`;

mkdirSync(OUT_DIR, { recursive: true });
const html = page(
  'Galaxy Map',
  [
    { label: 'HOME', href: '/untitled-space-game/' },
    { label: 'GALAXY MAP' },
  ],
  body
);
writeFileSync(join(OUT_DIR, 'index.html'), html, 'utf-8');
console.log(`  ✓ dist/map/index.html written (${sysMap.size} systems, ${routeLines.length} routes).`);
