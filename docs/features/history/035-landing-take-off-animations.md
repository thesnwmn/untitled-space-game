# 035 · Landing/Take-Off Animations and Terminology — DONE

## What it added

Replaced dock/undock terminology with land/take-off for surface and asteroid destinations,
added four distinct text-based animation scenes (surface landing, asteroid landing, surface
take-off, asteroid take-off), and unified all six animation scenes behind a shared
`BaseTransitionScene` that renders `ScreenChrome` with a context-aware empty footer.
`ChromeConfig` gained `systemLabel` and `destinationLabel` override fields used by jump
(system=`'IN TRANSIT'`, destination blank) and in-system travel (destination=`'IN TRANSIT'`).

## Key files

- `src/game/scenes/base-transition-scene.ts` — new abstract base class
- `src/game/ui/screen-chrome.ts` — `ChromeConfig` label override fields
- `src/game/scenes/jump-animation-scene.ts` — refactored to extend base
- `src/game/scenes/in-system-travel-animation-scene.ts` — refactored to extend base
- `src/game/scenes/surface-landing-animation-scene.ts` — new
- `src/game/scenes/asteroid-landing-animation-scene.ts` — new
- `src/game/scenes/surface-take-off-animation-scene.ts` — new
- `src/game/scenes/asteroid-take-off-animation-scene.ts` — new
- `src/game/scenes/ship-scene.ts` — LAND vs DOCK label by locationType
- `src/game/scenes/station-menu-scene.ts` — TAKE OFF vs UNDOCK label by locationType
- `src/game/game.ts` — `goToLandOrDock()` and `goToTakeOffOrUndock()` routing methods

## Architectural decisions embedded

`BaseTransitionScene` establishes the pattern for all transition animations: subclass owns
only the content-rendering logic in `renderContent()`; the base handles timing, chrome, and
buffer clearing. `getChromeConfig()` is overridable so subclasses can inject label overrides.
`ChromeConfig` label fields use `undefined`/`null`/`string` three-way semantics: absent means
default, `null` means blank, string is verbatim.
