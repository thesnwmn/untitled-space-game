# Decision Register

Quick-reference index. Read this file first. Only pull a detail file when you need the full rationale or exact API signatures for that area.

## Detail files

| File | Contents |
|---|---|
| `docs/decisions/rendering-architecture.md` | DOM + `<pre>` rendering rationale; platform abstraction layer diagram; file structure; naming conventions; core TypeScript types (`Color`, `Cell`, `CharBuffer`, `Renderer`, `InputHandler`, `Scene`, `GameAction`, `GameContext`) |
| `docs/decisions/scene-system.md` | Scene interface; `BaseMenuScene`; `ScreenChrome`; custom scenes (`TravelMenuScene`, animation scenes); `buffer-utils` helpers; `GameContext` fields |
| `docs/decisions/colour-input-context.md` | 16-colour named palette; input action table (keyboard / touch / terminal); `NAV_1`–`NAV_9`; `GameContext` construction and mutation |
| `docs/decisions/build-layout-deployment.md` | Vite + Bun + TypeScript build rationale; npm scripts; adaptive grid height (30–50 rows, 40 cols fixed); deployment via GitHub Pages |
| `docs/decisions/travel-system.md` | `TravelMenuScene` constructor and tab layout; in-space `ShipScene` state; `currentDestinationId` as single source of truth; animation scene durations |

---

## Decision Log

| Decision | Choice | Rationale |
|---|---|---|
| Renderer | DOM + `<pre>` | Natural character grid, easy ASCII art, CSS animation support |
| Language | TypeScript | Type safety, better agent-led development experience |
| Browser build tool | Vite | Simple config, fast dev loop, easy GitHub Pages deploy |
| Terminal build tool | Bun | Native TS support, single binary output, clean stdin handling |
| Game framework | None | No framework matches the DOM+pre rendering approach |
| Styling | CSS classes + monospace font | CRT/terminal effects achievable without Canvas; easy theming |
| Colour palette | 16 named ANSI colours | Authentic retro feel, works in both DOM and terminal |
| Input model | Semantic GameActions | Decouples game logic from platform-specific input events |
| Layout | Fixed 40 cols, adaptive 30–50 rows, font scales to fill viewport | Fixed width simplifies scene layout; scaling preserves crisp character grid |
| Menu scene pattern | `BaseMenuScene` abstract class + `ScreenChrome` | Centralises cursor nav, tap-to-item, input-silencing, and consistent header/footer chrome |
| Travel scene | Single `TravelMenuScene` with two tabs | Unifies in-system and inter-system travel; arrival mode reuses same scene without a separate SystemArrivalScene |
| In-space state | `currentDestinationId: string \| null` | Single nullable field drives ShipScene display, DOCK availability, TravelMenuScene greying, and FLY INTO SPACE selectability |
| Separate animation scenes | `JumpAnimationScene` + `InSystemTravelAnimationScene` | Distinct classes preserve the option to diverge visually without conditional branching |
| Nav actions | `NAV_1`–`NAV_9` + digit keys | Allows ScreenChrome footer buttons to be keyboard-accessible without overloading existing actions |
