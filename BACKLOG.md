# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)
- DONE — built, verified, play-tested

---

## READY

### 001 · Scaffold: Vite + TypeScript + Bun project structure
Set up the base repo with Vite browser entry, Bun terminal entry, shared types,
and placeholder renderer implementations. Placeholders are type-correct stubs that
implement the `Renderer` interface; `drawBuffer` and all other methods are no-ops.
`init.sh` must pass on a clean checkout; it should run `npm install`, `tsc --noEmit`,
and `npm run build` in sequence.
Also include a GitHub Actions workflow that builds the Vite output and deploys it
to the `gh-pages` branch on every merge to main. GitHub Pages should be configured
to serve from that branch, not from `/docs` on main.

### 002 · CharBuffer and DOMRenderer
See docs/features/002-char-buffer-dom-renderer.md.

### 003 · Keyboard input handler (browser)
See docs/features/003-keyboard-input-browser.md.

### 004 · Touch controls (browser)
See docs/features/004-touch-controls-browser.md.

### 005 · Keyboard input handler (terminal)
See docs/features/005-keyboard-input-terminal.md.

### 006 · Main menu screen
See docs/features/006-main-menu-screen.md.

---

## NEEDS SPEC

_(none)_

---

## IN PROGRESS

_(none)_

---

## DONE

_(none yet)
