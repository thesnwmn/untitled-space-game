# 028 · Common Screen Layout — DONE

## What it added
Introduced `ScreenChrome` — a 2-row header (system name + `[M] MENU` on row 0; destination name + credits on row 1) and a 1-row footer nav (numbered buttons `[1] LABEL`) rendered into every scene's buffer. Deleted `NavBar` entirely. Added `systemId`, `destinationId`, and `credits` to `GameContext`. Wired `NAV_1`–`NAV_9` GameActions to digit keys in both input handlers. Also permanently removed all per-scene hint text. `BaseMenuScene` was rewritten with left-aligned titles, backtick underlines, optional `info` and `details` on `MenuItemDef`, and integrated pagination. `StoryScene` gained LEFT/RIGHT paging.

## Key files
- `src/game/ui/ScreenChrome.ts` — new chrome component; exports `CONTENT_TOP = 3`, `contentBottom(h, showFooter)`
- `src/shared/types.ts` — `NAV_1`–`NAV_9` added to `GameAction`; `systemId`, `destinationId`, `credits` added to `GameContext`
- `src/game/scenes/BaseMenuScene.ts` — rewritten; ScreenChrome integration; multi-style `MenuItemDef`; pager
- `src/game/scenes/ShipScene.ts` — header-only chrome; viewport/separator/button layout updated
- `src/game/ui/NavBar.ts`, `src/game/ui/NavBar.test.ts` — deleted

## Architectural decisions embedded
- `CONTENT_TOP = 3` is a named constant so changing chrome height updates all scenes automatically.
- `MainMenuScene` and `StoryScene` use `showHeader: false, showFooter: false` — full-screen, no chrome.
- Hint text is gone entirely; if it returns it will be part of `ScreenChrome` and togglable.
- Active tab style: `black` fg on `green` bg (inverted) rather than a colour change.
