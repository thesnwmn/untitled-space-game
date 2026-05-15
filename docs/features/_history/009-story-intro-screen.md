# 009 · Story Intro Screen — DONE

## What it added
Implemented `StoryScene` showing a short narrative about protagonist Hugo arriving at Elysium Station. The screen renders story text in a fixed 40×30 grid, a `"YEAR 2284"` header in bright-yellow, and a footer hint that varies by input mode. SELECT or any tap triggers `onContinue`. Also introduced the `STATION_NAME` constant, extracted shared buffer utilities to `src/shared/buffer-utils.ts`, and wired the scene-transition chain from `MainMenuScene` → `StoryScene` → `StationMenuScene`.

## Key files
- `src/game/scenes/StoryScene.ts` — story scene implementation
- `src/shared/buffer-utils.ts` — `writeText`, `writeCentered`, `drawBorder` extracted from `MainMenuScene`
- `src/game/constants.ts` — `STATION_NAME = 'Elysium Station'`

## Architectural decisions embedded
- Story text is a pre-wrapped constant (no runtime word-wrapping algorithm).
- Each scene guards further input with an `activated` flag; listeners remain registered but become no-ops after first activation (no `offAction` / `clearListeners` needed at this stage).
- `onContinue` callback replaces the placeholder `console.log` in `MainMenuScene`'s NEW GAME action.
