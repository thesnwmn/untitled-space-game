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
and placeholder renderer implementations. init.sh must pass on a clean checkout.
Also include a GitHub Actions workflow that builds the Vite output and deploys it
to the `gh-pages` branch on every merge to main. GitHub Pages should be configured
to serve from that branch, not from `/docs` on main.

### 002 · CharBuffer and DOMRenderer
Implement `CharBuffer`, `Cell`, and `Color` types from docs/TECH_STACK.md.
Implement `DOMRenderer` that renders a buffer to a `<pre>` element.
Browser should display a test pattern of coloured ASCII characters.

---

## NEEDS SPEC

### · Main menu screen
### · Keyboard input handler (browser)
### · Keyboard input handler (terminal)

---

## IN PROGRESS

_(none)_

---

## DONE

_(none yet)
