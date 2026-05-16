# Backlog History

Completed items moved from BACKLOG.md to keep that file navigable.

---

## CANCELLED

### ~~016 · Hint Overlay~~ — CANCELLED

Superseded by 028. Hint text is removed entirely. If hints return they will be part of `ScreenChrome` and togglable.

---

## DONE

### 041 · Station Mission Actions — DONE

**Built:**
- `src/game/scenes/station-menu-scene.ts` — constructor queries `getMissionsForPickup` and `getMissionsForDelivery`; inserts `COLLECT: [itemName]` and `DELIVER: [title] → [reward] CR` items in `bright-yellow` above amenity items with a disabled dash separator; real actions are attached after `super()` via closure mutation; COLLECT calls `collectMissionItem` then `onHub`; DELIVER re-checks cargo at selection time (shows `ModalConfirmDialog` error on failure, or completes mission, awards credits, shows completion modal, then calls `onHub`); new `onHub: () => void` constructor parameter added
- `src/game/scenes/cargo-scene.ts` — added MISSION CARGO section rendered in `bright-yellow`; each item shown as `[MISSION] itemName  weightKg KG`; empty-hold guard now checks both `cargoHold` and `missionItems`
- `src/game/scenes/base-menu-scene.ts` — added `accentFg?: Color` to `MenuItemDef`; render uses `accentFg ?? 'white'` for non-cursor non-disabled items
- `src/game/game.ts` — `goToStation()` passes `() => this.goToStation()` as the new `onHub` argument
- Tests: 21 new tests across `station-menu-scene.test.ts`, `cargo-scene.test.ts`, and `trader-scene.test.ts`

**Evidence:**
- `tsc --noEmit`: zero errors
- `npm test`: 689 passed, 1 skipped (36 test files)
- `init.sh` (before and after): passes clean

**Play-test instructions:**
1. Accept a delivery mission from the Mission Board at a station (`MISSION BOARD` → find a delivery mission → accept).
2. Open the station hub (`HUB`). A `COLLECT: [itemName]` row appears above TRADER in `bright-yellow`. Press SELECT to collect the item.
3. The menu rebuilds. Travel to the delivery destination and dock.
4. Open the station hub at the delivery destination. A `DELIVER: [title] → [reward] CR` row appears. Press SELECT.
5. A `MISSION COMPLETE` modal appears confirming the reward. Press OKAY.
6. Open CARGO from the cockpit to verify the `[MISSION]` prefixed item disappears after delivery.
7. For CARGO view: while carrying a mission item, open `CARGO` from the cockpit. A `MISSION CARGO` header and item row appear in `bright-yellow`, below any regular commodities.

---

### 040 · Global Menu · Mission Log — DONE

**Built:**
- `src/game/ui/modal.ts` — `Modal` interface (`handleAction`, `handleCharInput`, `handleTap`, `render`) shared by both dialog types
- `src/game/ui/modal-confirm-dialog.ts` — `ModalConfirmDialog` implementing `Modal`; renders a centred box with title, word-wrapped body, and one or two footer buttons; LEFT/RIGHT/TAB cycles focus; BACK dismisses (calls `onConfirm`); accepts `ModalConfirmDialogOptions`
- `src/game/scenes/mission-log-scene.ts` — `MissionLogScene` extending `BaseMenuScene`; dynamically computes items from `player.activeMissions` via overridden `items` getter; shows `[D]`/`[S]` type icon, title, reward, and colour-coded status sub-line; selecting a mission opens `ModalConfirmDialog` with OKAY (dismiss) and CANCEL MISSION (destructive); footer: `[1] BACK` → `GlobalMenuScene`, `[2] GAME` → underlying game scene; overrides `activateCurrent` to avoid setting `activated`
- `src/game/scenes/base-menu-scene.ts` — adds `detailsFg?: Color` to `MenuItemDef`; changes `modal` field and `openModal` to use `Modal` interface; removes direct `ModalInputDialog` import
- `src/game/game.ts` — `buildMenuEntries()` returns `[{ label: 'MISSIONS', ... }]`; adds `goToMissionLog()` method
- `src/game/scenes/mission-log-scene.test.ts` — 19 tests covering: empty list, all four status colours, type icons, modal open/close, CANCEL MISSION flow, OKAY/BACK dismiss, and all navigation paths

**Evidence:**
- `tsc --noEmit`: zero errors
- `npm test`: 667 passed, 1 skipped (36 test files)
- `init.sh` (before and after): passes clean

**Play-test instructions:**
1. Start the game (`npm run dev`) and progress past the story to any scene
2. Press `M` — confirm the global menu opens with `MISSIONS` as an entry
3. Select `MISSIONS` — confirm `MissionLogScene` opens showing `NO ACTIVE MISSIONS`
4. Press `[1] BACK` — confirm return to global menu
5. Accept a mission from any station mission board; press `M`, select `MISSIONS`
6. Confirm the mission appears with its type icon, title, `XXX CR`, and a coloured status sub-line
7. Select the mission — confirm a modal opens with the mission title, description, `[ OKAY ]` and `[ CANCEL MISSION ]`
8. Press OKAY or BACK — confirm modal closes, mission remains in list
9. Select the mission again; press RIGHT to focus `CANCEL MISSION`; press SELECT — confirm mission disappears and `NO ACTIVE MISSIONS` appears
10. Press `[2] GAME` from the mission log — confirm return to the underlying game scene (not global menu)

---

### 039 · Global Menu Shell — DONE

**Built:**
- `src/game/scenes/global-menu-scene.ts` — new `GlobalMenuScene` extending `BaseMenuScene`; accepts `GlobalMenuEntry[]` and `onClose` callback; renders `NO OPTIONS AVAILABLE` (disabled) when entries is empty; footer shows `[1] GAME`; BACK, NAV_1, and a second M press all call `onClose`; sets `onMenuCallback = onClose` so the base MENU intercept also works
- `src/game/ui/screen-chrome.ts` — adds `hitTestHeader(col, row)` method: stores `headerWidth` during `render()` when header is shown; returns `'menu'` when row 0 and col falls in the `[M] MENU` right-zone range `[w-10, w-2)`
- `src/game/scenes/base-menu-scene.ts` — adds `protected onMenuCallback` field; intercepts `MENU` action before `handleNavAction`; calls `hitTestHeader` in the tap handler to support header taps
- `src/game/scenes/ship-cockpit-scene.ts` — adds `onMenu` constructor parameter; handles `MENU` action and header tap via `chrome.hitTestHeader`
- `src/game/scenes/station-menu-scene.ts`, `trader-scene.ts`, `mission-board-scene.ts` — each gains `onMenu` parameter and sets `this.onMenuCallback`
- `src/game/scenes/cargo-scene.ts` — gains `onMenu` parameter; handles `MENU` keyboard action
- `src/shared/types.ts` — adds `'MENU'` to `GameAction` union
- `src/platform/dom/dom-input-handler.ts` — maps `m`/`M` keys to `'MENU'`
- `src/platform/terminal/terminal-input-handler.ts` — maps `m`/`M` keys to `'MENU'`
- `src/game/game.ts` — adds `sceneBeforeMenu`, `buildMenuEntries()`, `goToGlobalMenu()`, `returnFromMenu()`; all 5 supported scenes receive `() => this.goToGlobalMenu()`
- `src/game/scenes/global-menu-scene.test.ts` — 13 tests covering: empty state placeholder, entry rendering, entry SELECT, close via BACK/MENU/NAV_1/footer tap, activated-once guard, header tap

**Evidence:**
- `tsc --noEmit`: zero errors
- `npm test`: 640 passed, 1 skipped (35 test files)
- `init.sh` (before and after): passes clean

**Play-test instructions:**
1. Start the game (`npm run dev`) and progress to the ship view
2. Press `M` — confirm the global menu opens with `NO OPTIONS AVAILABLE` and footer `[1] GAME`
3. Press `[1]` or `M` again — confirm you return to the ship view
4. Navigate to a station hub and press `M` — confirm the menu opens and closes back to the hub
5. Navigate to the trader, press `M` — confirm close returns to the trader
6. Navigate to the mission board, press `M` — confirm close returns to the mission board
7. Open cargo (`C`) and press `M` — confirm close returns to cargo (via ship, per fallback)
8. In browser, tap the `[M] MENU` text in the header — confirm the menu opens from any supported scene

---

### 038 · Mission Board Live — DONE

**Built:**
- `src/game/scenes/mission-board-scene.ts` — complete rewrite; now accepts `getMissions: () => MissionSpec[]` and `onMissionSelected` callbacks; renders `[D]`/`[S]` type icons in `bright-yellow`, reward in `bright-green`, giver name as details sub-line in `bright-black`; empty board shows "NO MISSIONS AVAILABLE" (disabled row)
- `src/game/scenes/mission-detail-scene.ts` — new `MissionDetailScene` extending `BaseMenuScene`; displays full mission info (type, giver + optional faction, pickup/deliver, weight cargo check, word-wrapped description, reward); ACCEPT/BACK nav computed from `canAcceptMission`; `giveItemNow` passed to `onAccept` callback
- `src/game/scenes/base-menu-scene.ts` — minor patch: icon items now also render `details` sub-lines (previously the `details` field was ignored when an `icon` was present)
- `src/game/game.ts` — adds `missionBoardCache` (15-minute TTL, keyed by destination ID); `getOrCreateMissionBoard()` generates via `MissionGenerator` on cache miss; `goToMissionBoard()` updated to pass live callbacks; new `goToMissionDetail()` and `onMissionAccepted()` methods (splice accepted spec from cache, call `player.acceptMission`, return to board)
- `src/game/scenes/mission-board-scene.test.ts` — complete rewrite: 26 tests covering empty board, populated board icon/reward/giver rendering, cursor navigation, SELECT → onMissionSelected, nav button wiring, touch hit-testing
- `src/game/scenes/mission-detail-scene.test.ts` — new: 24 tests covering delivery/supply rendering, cargo check colours, faction display, accept/reject paths, nav button wiring

**Evidence:**
- `tsc --noEmit`: zero errors
- `npm test`: 619 passed, 1 skipped (34 test files)
- `init.sh` (before and after): passes clean

**Play-test instructions:**
1. Start the game (`npm run dev`) and progress through story to a station with a mission board (e.g. Elysium Station)
2. Select MISSION BOARD from the hub — confirm a live list of 3–6 missions appears with `[D]`/`[S]` icons, titles, CR rewards, and giver names as sub-lines
3. Select a mission — confirm the detail scene shows type, giver (with faction if present), pickup/deliver locations, weight check in green/red, description, reward, and `[1] ACCEPT  [2] BACK` footer
4. Accept a mission — confirm returning to the board shows that mission removed from the list; confirm `player.activeMissions` has one entry
5. Fill cargo hold near capacity and view a heavy delivery mission — confirm weight shows `✗` in red, ACCEPT is absent from the footer, and reason `[!] Insufficient cargo space` appears in content

---

### 037 · Mission Foundation — DONE

**Built:**
- `src/game/world/types.ts` — new types: `MissionType`, `MissionStatus`, `DeliveryMissionSpec`, `SupplyMissionSpec`, `MissionBase`, `MissionSpec` (discriminated union), `ActiveMission`, `MissionItem`, `DeliveryItem`, `NpcNames`; `WorldData` gains `deliveryItems` and `npcNames` fields
- `docs/world/delivery-items.md` — 14 delivery items, 5–200 kg (data cores, medical supplies, machinery parts, etc.)
- `docs/world/npc-names.md` — 8 special names, 14 first names, 14 last names
- `src/game/world/world-parser.ts` — parses `delivery-items.md` and `npc-names.md` into `WorldData`
- `src/game/world/world-data.ts` — `getDeliveryItems()` and `getNpcNames()` getters
- `src/game/mission-generator.ts` — `generateMissions(destination, worldData, seed)`: seeded LCG (same pattern as Starfield), returns 3–6 `MissionSpec` objects deterministically; mixes delivery and supply missions; giver names are special ~30% of the time
- `src/game/player-state.ts` — `activeMissions`, `missionItems`, `missionItemsWeightKg`; `cargoWeightKg` includes mission items; `acceptMission`, `collectMissionItem`, `completeMission`, `cancelMission`, `getMissionsForPickup`, `getMissionsForDelivery`; pure exported functions `getMissionStatus` and `canAcceptMission`
- `src/game/mission-generator.test.ts` — 8 new tests covering structure, delivery/supply shapes, determinism, reward values
- `src/game/player-state.test.ts` — 41 new tests covering all mission methods, status transitions, capacity checks

**Evidence:**
- `tsc --noEmit`: zero errors
- `npm test`: 590 passed, 1 skipped (33 test files)
- `init.sh` (before and after): passes clean

**Play-test instructions:**

This feature adds no UI — it is backend data and logic only. Verify via unit tests:
1. `npm test` — confirm all tests pass, including `mission-generator.test.ts` and the mission sections of `player-state.test.ts`
2. Inspect `docs/world/delivery-items.md` and `docs/world/npc-names.md` to confirm seed world data is present
3. For manual inspection: open browser console after `npm run dev`, instantiate `generateMissions` via the module loader to confirm deterministic output for a given seed

---

### 036 · Cockpit Ship View — DONE

**Built:**
- `src/game/scenes/ship-cockpit-scene.ts` — new `ShipCockpitScene` class implementing `Scene`; replaces `ShipScene` entirely
- `src/game/game.ts` — import swapped from `ShipScene` to `ShipCockpitScene`; `goToShip()` updated accordingly
- `src/game/scenes/ship-scene.ts` — deleted
- `src/game/scenes/ship-scene.test.ts` — deleted; replaced by `ship-cockpit-scene.test.ts`
- `src/game/scenes/ship-cockpit-scene.test.ts` — 48 tests covering chrome, gauges, starfield, crosshair, HUD, bottom panels, radar, ticker, keyboard and tap navigation

**Evidence:**
- `tsc --noEmit`: zero errors
- Tests: 547 passed, 1 skipped (32 test files)
- `init.sh`: passed clean before and after

**Play-test instructions:**
1. Undock from a station — confirm four coloured gauges (F/yellow, C/blue, S/cyan, H/green) render in the gauge strip (rows 3–4)
2. Watch for ~10 s — button lights (●○▪◉) should flicker independently in the gauge strip and bottom panels
3. Confirm the starfield fills the full 40-column width with no border frame
4. Confirm HUD text (VEL/ATT/ROT) appears at the top of the starfield and the ╋ crosshair floats with clear space around it
5. Watch the radar for ~15 s — contacts drift; edge arrows (▴▾◂▸) appear/disappear as contacts approach edges
6. Press UP/DOWN — TRAVEL brightens (bright-yellow) or DOCK brightens (bright-cyan); pressing SELECT navigates away
7. Confirm DOCK is dimmed (bright-black) while in open space (undocked with no destination)
8. Watch the ticker row — messages scroll leftward and cycle
9. Resize browser to a tall aspect — viewport grows, TRAVEL/DOCK remain anchored at row h-3

---

### 035 · Landing/Take-Off Animations and Terminology — DONE

**Built:**
- `src/game/scenes/base-transition-scene.ts` — new abstract `BaseTransitionScene` class; owns `ScreenChrome`, elapsed timer, `arrived` guard; abstract `renderContent()` for subclasses
- `src/game/ui/screen-chrome.ts` — `ChromeConfig` gains `systemLabel?: string | null` and `destinationLabel?: string | null` override fields; `undefined` uses default, `null` renders blank, string is verbatim
- `src/game/scenes/jump-animation-scene.ts` — refactored to extend `BaseTransitionScene`; constructor now `(player, context, onArrival)`; overrides `getChromeConfig()` with `systemLabel: 'IN TRANSIT'` and `destinationLabel: null`
- `src/game/scenes/in-system-travel-animation-scene.ts` — refactored to extend `BaseTransitionScene`; constructor now `(player, context, onArrival, targetLabel?)`; overrides `getChromeConfig()` with `destinationLabel: 'IN TRANSIT'`
- `src/game/scenes/surface-landing-animation-scene.ts` — new; 2500 ms; title `[ LANDING SEQUENCE ]`, countdown `TOUCHDOWN IN Xs`
- `src/game/scenes/asteroid-landing-animation-scene.ts` — new; 2500 ms; title `[ APPROACH LOCKED ]`, countdown `CLAMPING IN Xs`
- `src/game/scenes/surface-take-off-animation-scene.ts` — new; 1500 ms; title `[ LIFTOFF SEQUENCE ]`, countdown `CLEAR IN Xs`
- `src/game/scenes/asteroid-take-off-animation-scene.ts` — new; 1500 ms; title `[ RELEASING CLAMPS ]`, countdown `DEPARTING IN Xs`
- `src/game/scenes/ship-scene.ts` — dock button shows `[L] LAND` for surface/asteroid destinations, `[D] DOCK` for orbital/deep-space, `[ - ] DOCK` when in space
- `src/game/scenes/station-menu-scene.ts` — nav label shows `TAKE OFF` for surface/asteroid destinations, `UNDOCK` for others; nav `id` unchanged
- `src/game/game.ts` — new `goToLandOrDock()` and `goToTakeOffOrUndock()` routing methods; updated `goToShip()`, `goToStation()`, `goToFlyIntoSpace()`, `onDestinationSelected()`, `onJumpSelected()` to use new constructors/routing
- 4 new test files for the new animation scenes; updated `jump-animation-scene.test.ts` and `in-system-travel-animation-scene.test.ts`; added label override tests to `screen-chrome.test.ts`; added LAND/DOCK and TAKE OFF/UNDOCK tests to `ship-scene.test.ts` and `station-menu-scene.test.ts`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 485 passed / 1 skipped across 28 test files
- `npm run build`: ✓ Vite build OK (145 kB JS)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. `npm run dev`, open the game in a browser
2. Start game, navigate to a destination with `locationType: orbital` (e.g. Elysium Station in Sol) — ship scene shows `[D] DOCK`; press it and confirm you go straight to the hub (no animation)
3. From the hub, press `UNDOCK` in the footer — confirm you go straight to the cockpit
4. Travel to `Ceti Landfall` (Tau Ceti, surface) — ship scene shows `[L] LAND`; press it and confirm `[ LANDING SEQUENCE ]` animation plays (~2.5 s) then hub appears
5. From the hub, press `TAKE OFF` in the footer — confirm `[ LIFTOFF SEQUENCE ]` animation plays (~1.5 s) then cockpit appears
6. Travel to `Eridani Anchorage` (Epsilon Eridani, asteroid) — ship scene shows `[L] LAND`; press it and confirm `[ APPROACH LOCKED ]` animation plays (~2.5 s) then hub appears
7. From the hub, press `TAKE OFF` — confirm `[ RELEASING CLAMPS ]` animation plays (~1.5 s) then cockpit appears
8. Execute a jump — chrome row 0 shows `IN TRANSIT`, row 1 destination slot is blank; credits still visible
9. Confirm in-system travel shows `IN TRANSIT` in the destination slot of the chrome

---

### 020 · World Data File Loader — DONE

**Built:**
- `src/game/world/world-parser.ts` — new; `parseWorldFiles(files)` maps `Record<string, string>` paths → `WorldData`; snake_case → camelCase field mapping; description extraction from first body paragraph; story beat text from full body; all entity types routed by path pattern; `_template.md` and `.gitkeep` skipped
- `src/game/world/world-loader-browser.ts` — new; `loadWorldData()` using `import.meta.glob` with `as: 'raw'` and `eager: true`; path prefix stripped to normalise keys; calls `parseWorldFiles`
- `src/game/world/world-loader-terminal.ts` — new; `loadWorldData()` using Node/Bun `fs` APIs; recursive directory walk; calls `parseWorldFiles`
- `src/game/world/world-data.ts` — removed static `WORLD` object and all hardcoded data; added `initWorld(data)` / `getWorld()` pair; all getters now delegate to `getWorld()`
- `src/main.ts` — calls `initWorld(loadWorldData())` before game construction
- `terminal.ts` — calls `initWorld(loadWorldData())` before game construction
- `src/tests/setup.ts` — calls `initWorld(loadWorldData())` so all Vitest tests have world data
- `src/ambient-node.d.ts` — new; minimal ambient declarations for `fs`, `path`, `process`, `import.meta.glob`
- `docs/world/game-settings.md` — corrected `starting_credits` to 5000
- `src/game/scenes/story-scene.ts` — fixed pre-existing import path (`PlayerState` → `player-state`)
- `src/game/world/world-parser.test.ts` — new; 14 unit tests for `parseWorldFiles` in isolation
- `src/game/world/world-data.test.ts` — removed `WORLD` import; replaced all `WORLD.*` with `getWorld().*`

**Evidence:**
- `npx tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 439 passed | 1 skipped (14 new parser tests)
- `npm run build` (via init.sh): ✓ browser build OK, terminal entry OK

**Play-test instructions:**
- Browser: `npm run dev`, open the game. The opening story beat should display, and all systems/destinations should be navigable via the Travel menu. `getSystem('sol')` and `getDestination('elysium-station')` return correctly typed objects.
- Terminal: `npm run terminal` — game starts with the same world data loaded from `docs/world/`.

### 032 · Modal Input Dialog — DONE

**Built:**
- `src/shared/types.ts` — added `'TAB'` to `GameAction` union; added optional `onCharInput` to `InputHandler`
- `src/game/ui/modal-input-dialog.ts` — new `ModalInputDialog` class; 30-col overlay centred in buffer; height `8+D` (D = derived rows); TAB/arrow/digit/backspace/SELECT/BACK action routing; first-character-clears; focus cycling (field → confirm → cancel → field)
- `src/game/scenes/base-menu-scene.ts` — added `modal` field; `openModal`/`closeModal` helpers; modal routing check before `activated` guard in all three handler paths (`onCharInput`, `onAction`, `onTap`); modal rendered last in `render()`
- `src/game/scenes/trader-scene.ts` — `onBuy`/`onSell` now take `(commodityId, qty)`; SELECT opens `ModalInputDialog` instead of calling callback directly; initial qty = min(stock, affordable); does not set `activated` on SELECT; `syncItems`/`clampCursor` called in `onConfirm`
- `src/game/scenes/station-menu-scene.ts` — `onRefuel` signature changed to `(cost, litres)`; BUY FUEL uses `fuelItemIdx` + `activateCurrent()` override to open modal; `activated` reset to `false` on cancel
- `src/game/PlayerState.ts` — `removeCargo` extended with optional `qty` param for partial removal
- `src/game/game.ts` — updated `onBuy`, `onSell`, `onRefuel` for new signatures; partial stock depletion/merge
- `src/platform/dom/dom-input-handler.ts` — added Tab → `'TAB'`; digits fire `onCharInput` then fall through to `NAV_N`; Backspace fires `onCharInput('\b')` only
- `src/platform/terminal/terminal-input-handler.ts` — same digit/backspace/tab behaviour as DOM handler
- `src/game/ui/modal-input-dialog.test.ts` — new (39 tests)
- `src/game/scenes/base-menu-scene.test.ts` — added modal routing describe block (6 new tests); updated `MockInputHandler` with `onCharInput`/`triggerCharInput`
- `src/game/scenes/trader-scene.test.ts` — updated for 2-step modal flow and `(commodityId, qty)` args
- `src/game/scenes/station-menu-scene.test.ts` — updated for 2-step fuel modal and `(cost, litres)` order
- `src/game/game.test.ts` — updated `onBuy`/`onSell` call sites; added partial buy/sell tests
- `src/platform/dom/dom-input-handler.test.ts` — 4 new tests for Tab/digit/backspace charInput
- `src/platform/terminal/terminal-input-handler.test.ts` — 3 new tests for tab/digit/DEL

**Evidence:**
- `npx tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 416 passed | 1 skipped (1 pre-existing; 61 new)
- `bash init.sh`: ✓ `=== Environment ready ===`

**Play-test instructions:**
1. `npm run dev` → dock at any station → TRADER → BUY tab: select any item → modal appears overlaying the list.
2. Dialog shows title, Quantity field (initial = min(stock, affordable)), Total value derived row, BUY / CANCEL buttons.
3. Arrow UP/DOWN changes quantity (step 1, clamped). TAB cycles focus field → BUY → CANCEL → field (green highlight).
4. Type `3` → quantity becomes 3 (first key replaces). Type `0` → becomes 30. Backspace → 3. Backspace → 0.
5. Enter on field or BUY button confirms; modal closes; credits decrease; item moves to SELL tab.
6. Escape cancels from any focus; no inventory change.
7. SELL tab: same flow; confirm reduces hold, increases credits.
8. STATION HUB → BUY FUEL (if tank not full) → modal; initial litres = min(missing, affordable); step 10. Confirm → fuel up; credits down.
9. `npm run terminal` → same flows using keyboard only.

---

### 031 · Cargo Trading — DONE

**Built:**
- `src/shared/types.ts` — added `'CARGO'` to `GameAction` union
- `src/game/world/types.ts` — added `TraderStockEntry` interface
- `src/game/world/world-data.ts` — added `getCommodity`, `getCommodities`, `computeCargoWeightKg` exports
- `src/game/PlayerState.ts` — replaced `cargoWeightKg` stub with real `computeCargoWeightKg` implementation
- `src/platform/dom/dom-input-handler.ts` — mapped `c`/`C` to `'CARGO'`
- `src/platform/terminal/terminal-input-handler.ts` — mapped `c`/`C` to `'CARGO'`
- `src/game/scenes/trader-scene.ts` — rewrote with live stock; constructor takes `traderStock`, `onBuy`, `onSell`; SELECT does not activate scene; hold-capacity footer on both tabs
- `src/game/scenes/ship-scene.ts` — added `onCargo` param; handles `CARGO` action and tap on right stat panel; `[C] CARGO` hint in viewport
- `src/game/scenes/cargo-scene.ts` — new read-only hold scene; `BACK`/`CARGO` return to ship; shows all hold entries with name/qty/weight and total/capacity
- `src/game/game.ts` — added trader stock cache with 2-minute TTL; `getOrCreateTraderStock`, `onBuy`, `onSell` methods; updated `goToTrader` and `goToShip`; added `goToCargo`
- `src/game/scenes/cargo-scene.test.ts` — new (11 tests)
- `src/game/scenes/trader-scene.test.ts` — rewritten for live-data API (28 tests)
- `src/game/scenes/ship-scene.test.ts` — updated for 6-arg constructor; 3 new tests (31 total)
- `src/game/world/world-data.test.ts` — 6 new tests for `getCommodity`, `getCommodities`, `computeCargoWeightKg`
- `src/game/player-state.test.ts` — updated `cargoWeightKg` test to verify real computation

**Evidence:**
- `npx tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 355 passed | 1 skipped (356 total; 25 new)
- `bash init.sh`: ✓ `=== Environment ready ===`

**Play-test instructions:**
1. `npm run dev` → open browser → NEW GAME → Ship screen shows `CARGO: 0/2Mg` in stat panel.
2. Press `C` → CargoScene opens, shows "CARGO HOLD EMPTY", closes with ESC.
3. Dock at any station → open Trader → BUY tab shows 4–6 randomly generated items.
4. Select an item on BUY tab → item disappears from BUY, credits decrease, HOLD line updates.
5. Switch to SELL tab → bought item appears with qty and price.
6. Select on SELL tab → item disappears, credits increase, HOLD line decreases.
7. Open CargoScene again → hold contents match expectation.
8. Fill hold to near capacity → buying a heavy item with insufficient space does nothing.
9. Leave station, return within 2 minutes → same (possibly depleted) stock on BUY tab.
10. Return after 2 minutes → fresh stock generated.
11. Sell at a different station → item leaves hold, appears in that station's BUY tab.

---

### 034 · Shared Game Orchestrator — DONE

**Built:**
- `src/game/game.ts` — new `Game` class with constructor `(renderer, input, context)`; creates `PlayerState` from `getGameSettings()` internally; initialises `currentScene` to `MainMenuScene`; owns all navigation methods (`goToMainMenu`, `goToStory`, `goToStation`, `goToTrader`, `goToMissionBoard`, `goToShip`, `goToTravelMenu`, `goToArrival`, `goToFlyIntoSpace`, `onDestinationSelected`, `onJumpSelected`) as private methods; `tick(dt)` clamps dt to 100 ms then runs update → render → draw pipeline; `makeBuffer()` is a private method
- `src/main.ts` — reduced to CSS import, `DOMRenderer`/`DOMInputHandler` construction, `GameContext` literal, `new Game(...)`, and `requestAnimationFrame` loop (25 lines)
- `terminal.ts` — reduced to `TerminalRenderer`/`TerminalInputHandler` construction, `GameContext` literal, `new Game(...)`, stdin close guard, `input.connect()`, and `setInterval` loop (19 lines)
- `src/game/game.test.ts` — 4 tests: `tick()` calls `drawBuffer` once per call, buffer matches renderer dimensions, dt clamped to 100 ms, multiple ticks work without error

**Evidence:**
- `npx tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 330 passed | 1 skipped (331 total; 4 new)
- `bash init.sh`: ✓ `=== Environment ready ===`

**Play-test instructions:**
1. `npm run dev` → open browser → NEW GAME → walk through the full game flow (story → station → ship → travel → jump)
2. Verify all navigation works identically to before (station, trader, mission board, ship, travel menu, jumps)
3. `npm run terminal` → repeat above in terminal mode
4. Confirm the game loop runs smoothly at ~30 fps in terminal and 60 fps in browser

---

### 033 · Centralise Player State — DONE

**Built:**
- `src/game/PlayerState.ts` — new `PlayerState` class with named getters and update methods
- `src/game/world/types.ts` — added `CargoEntry` interface
- `src/shared/types.ts` — removed `systemId`, `destinationId`, `credits` from `GameContext`
- `src/game/ui/screen-chrome.ts` — added `player: PlayerState` second constructor parameter; reads location and credits from `player`
- `src/game/scenes/base-menu-scene.ts` — added `player: PlayerState` constructor parameter; passes to `ScreenChrome`; stored as `protected readonly player`
- `src/game/scenes/station-menu-scene.ts` — removed `fuelL`, `fuelCapacityL`, `credits` params; reads from `this.player`
- `src/game/scenes/travel-menu-scene.ts` — removed `systemId`, `currentDestinationId`, `fuelL`, `fuelCapacityL`, `driveId` params; reads from `player`
- `src/game/scenes/ship-scene.ts` — removed `systemId`, `destinationId`, `PlayerStateView` spread; deleted `PlayerStateView` interface; reads from `player`
- `src/game/scenes/main-menu-scene.ts`, `story-scene.ts`, `trader-scene.ts`, `mission-board-scene.ts` — added `player` param, threaded through to `BaseMenuScene`
- `src/main.ts`, `terminal.ts` — construct single `PlayerState` at startup; all `context.X = ...` sync lines removed; player state mutations via `player.*` methods
- `src/game/player-state.test.ts` — 22 new tests covering all public methods
- `src/tests/makePlayer.ts` — shared test helper for constructing `PlayerState`
- All existing scene tests updated to use `makePlayer()` and stripped of removed `GameContext` fields

**Evidence:**
- `npx tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 326 passed | 1 skipped (327 total; 22 new)

**Play-test instructions:**
1. `npm run dev` → open browser → NEW GAME → walk through the opening story
2. Verify the chrome header shows system name, destination, and credit balance correctly
3. Go to SHIP → TRAVEL → confirm fuel gauge shows in stat panel
4. Buy fuel at a station; confirm credits decrease and fuel increases
5. Jump to another system; confirm system name updates in chrome header and fuel decreases
6. `npm run terminal` → repeat the above in terminal mode

### 034 · Standardise Kebab-Case File Names

**Built:**
- 25 files renamed via `git mv` from PascalCase to kebab-case (16 implementation files + 9 test files)
- Scenes: `BaseMenuScene`, `InSystemTravelAnimationScene`, `JumpAnimationScene`, `MainMenuScene`, `MissionBoardScene`, `ShipScene`, `SpaceStation`, `Starfield`, `StationMenuScene`, `StoryScene`, `TraderScene`, `TravelMenuScene`
- UI: `ScreenChrome`
- Platform DOM: `DOMInputHandler`, `DOMRenderer`
- Platform terminal: `TerminalInputHandler`, `TerminalRenderer`
- All import paths updated in `src/main.ts`, `terminal.ts`, and all affected scene/test files
- `CLAUDE.md` — added "Conventions" section: kebab-case file names, PascalCase identifiers
- `DECISION_REGISTER.md` — updated player-state row to reference `src/game/player-state.ts`

**Evidence:**
- `npx tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 304/305 tests passed (1 skipped, 19 test files)
- `bash init.sh`: ✓ `=== Environment ready ===`

**Play-test instructions:**
This is a pure refactor — no behaviour changes. Verify by running the game normally and confirming all scenes load without errors.

---

### 030 · Fuel Management

**Built:**
- `src/game/constants.ts` — added `FUEL_PER_LY = 5` and `FUEL_PRICE_PER_L = 10`
- `src/game/world/world-data.ts` — added `getRoute(fromId, toId)` helper
- `src/game/scenes/ShipScene.ts` — removed internal `PlayerState`; added `PlayerStateView` interface (exported); constructor now accepts `systemId`, `destinationId`, `playerState`; fuel stat updated from `FUEL: x%` to `FUEL:x/yL`
- `src/game/scenes/TravelMenuScene.ts` — constructor accepts `fuelL`, `fuelCapacityL`, `driveId`; each jump item has `disabled: true` when fuel needed exceeds current fuel; imports `getDrive` and `FUEL_PER_LY`
- `src/game/scenes/StationMenuScene.ts` — constructor accepts `fuelL`, `fuelCapacityL`, `credits`, `onRefuel`; conditionally inserts `BUY FUEL +xL yCR` item when `amenities.fuel && fuelL < fuelCapacityL`
- `src/main.ts` — module-level `playerState` initialised from world data; `onJumpSelected` deducts fuel; `goToShip`, `goToTravelMenu`, `goToArrival`, `goToStation` all thread fuel/credits through
- `terminal.ts` — identical changes to `src/main.ts`
- `src/game/scenes/ship-scene.test.ts` — updated constructor calls to pass `systemId`, `destinationId`, `playerState`; stat panel assertion updated to `FUEL:100/100L`
- `src/game/scenes/travel-menu-scene.test.ts` — updated constructor calls to include fuel params; added 2 new tests for greyed/selectable jump items
- `src/game/scenes/station-menu-scene.test.ts` — updated `makeScene` to accept fuel params; added 5 new BUY FUEL tests
- `src/game/world/world-data.test.ts` — added tests for `getShip` and `getRoute`

**Evidence:**
- `npx tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 302/302 tests passed (19 test files, +13 new tests)
- `bash init.sh`: ✓ `=== Environment ready ===`

**Play-test instructions:**
1. Start game → Ship screen shows `FUEL:100/100L` in the stat panel.
2. Open travel menu → JUMPS tab shows all routes (reachable from full tank).
3. Jump to another system → Ship screen shows reduced fuel (e.g. Sol → Alpha Centauri: 100 − 18 = 82 L).
4. Drain fuel by jumping repeatedly → unreachable routes appear in `bright-black` in the JUMPS tab; pressing SELECT on them does nothing.
5. Dock at Elysium Station (or any station with `amenities.fuel: true`) with a non-full tank → `BUY FUEL +xL yCR` item appears.
6. Select BUY FUEL → fuel returns to max; credits decrease by `fuelNeeded × 10`.
7. Dock when tank is already full → no BUY FUEL option shown.

---

### 029 · Freighter as Starting Ship

**Built:**
- `docs/world/game-settings.md` — added `starting_ship: freighter` field
- `src/game/world/types.ts` — added `startingShip: string` to `GameSettings`
- `src/game/world/world-data.ts` — added `startingShip: 'freighter'` to `WORLD.settings`; added `Ship` to imports; exported `getShip(id)` helper
- `src/game/scenes/ShipScene.ts` — removed `INITIAL_STATE`; added `credits` to `PlayerState`; constructor derives state from `getGameSettings()` + `getShip()`; cargo stat panel unit changed from `T` to `KG`
- `src/game/scenes/ship-scene.test.ts` — updated stat panel assertion from `CARGO: 0/50T` to `CARGO: 0/2000KG`

**Evidence:**
- `npx tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 289/289 tests passed (19 test files)
- `bash init.sh`: ✓ `=== Environment ready ===`

---

### 028 · Common Screen Layout

**Built:**
- `src/shared/types.ts` — added `NAV_1`–`NAV_9` to `GameAction`; added `systemId: string`, `destinationId: string | null`, `credits: number` to `GameContext`
- `src/game/ui/ScreenChrome.ts` — new component; 2-row header (system name row 0, destination/credits row 1) and 1-row footer nav (`:: [1] LABEL :: [2] LABEL ::::`); exports `CONTENT_TOP = 3`, `CONTENT_TOP_NO_HEADER`, `contentBottom(h, showFooter)`; `hitTestNav(col, row)` returns nav id or null
- `src/game/ui/ScreenChrome.test.ts` — 14 tests covering header rows, credits formatting, footer nav, hitTestNav
- `src/platform/dom/DOMInputHandler.ts` — added digit keys `1`–`9` → `NAV_1`–`NAV_9`; `[`/`]` → `PAGE_UP`/`PAGE_DOWN`
- `src/platform/terminal/TerminalInputHandler.ts` — same key mappings
- `src/game/scenes/BaseMenuScene.ts` — rewritten; `MenuItemDef` gains optional `info?` and `details?`; ScreenChrome integration; left-aligned title at CONTENT_TOP row 2 in white; backtick underline; `infoLines` parameter shifts item rows; pagination with `|<|` / `|>|` indicator
- `src/game/scenes/StationMenuScene.ts` — removed NavBar; passes infoLines (3 desc + danger) and `[{ id: 'undock', label: 'UNDOCK' }]` navOptions; BACK/NAV_1 → onShip
- `src/game/scenes/TraderScene.ts` — removed NavBar; ScreenChrome directly; `[ BUY | SELL ]` tab bar with bg-color highlight; NAV_1 → undock, NAV_2 → hub
- `src/game/scenes/MissionBoardScene.ts` — removed NavBar; ScreenChrome; NAV_1 → undock, NAV_2 → hub
- `src/game/scenes/TravelMenuScene.ts` — removed NavBar; ScreenChrome with empty navOptions; `[ DESTINATIONS | JUMPS ]` tab bar with bg-color highlight; BACK → onShip
- `src/game/scenes/MainMenuScene.ts` — removed hint text rendering
- `src/game/scenes/StoryScene.ts` — removed hint text; added LEFT/RIGHT paging; `< n/n >` indicator when multi-page
- `src/game/scenes/ShipScene.ts` — dropped `systemId`/`destinationId` constructor params (now from context); ScreenChrome header-only; fuel/cargo at CONTENT_TOP; viewport CONTENT_TOP+1 to h-4; separator h-3; buttons h-2; no window border; no footer hint
- `src/main.ts` / `terminal.ts` — context gains `systemId`, `destinationId`, `credits`; ShipScene constructor updated
- `src/game/ui/NavBar.ts`, `src/game/ui/NavBar.test.ts` — deleted
- All test files updated for new context shape, new row constants, removed hint assertions

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 280/280 tests passed (19 test files)
- `bash init.sh`: ✓ `=== Environment ready ===`

---

### 026 · Jump System

**Built:**
- `src/game/scenes/TravelMenuScene.ts` — unified two-tab scene (DESTINATIONS / JUMPS) for both in-system travel and inter-system jumps; NavBar with SHIP button; current destination greyed out (`bright-black`); FLY INTO SPACE as final DESTINATIONS item (greyed when already in space); arrival mode (no greyed destination) when `currentDestinationId === null`
- `src/game/scenes/JumpAnimationScene.ts` — 5-second auto-advancing jump animation; animated ellipsis and countdown; fires `onArrival` exactly once
- `src/game/scenes/InSystemTravelAnimationScene.ts` — 2-second auto-advancing in-system travel animation; fires callback on completion
- `src/game/scenes/ShipScene.ts` — added `systemId: string` param and `destinationId: string | null`; "in space" mode shows `IN SPACE · <SYSTEM>`, greys DOCK button, suppresses station glyph, constrains UP/DOWN to one item; `[ T ] TRAVEL` button replaces `[ J ] JUMP`
- `src/main.ts` / `terminal.ts` — `currentSystemId` and `currentDestinationId: string | null` state; `goToTravelMenu`, `goToArrival`, `goToFlyIntoSpace`, `onDestinationSelected`, `onJumpSelected` wired up
- `src/game/scenes/travel-menu-scene.test.ts` — 18 tests covering render, DESTINATIONS/JUMPS tab keyboard, NavBar SHIP tap, FLY INTO SPACE behaviour
- `src/game/scenes/ship-scene.test.ts` — updated for new signature; 5 new "in space" tests
- `src/game/scenes/jump-animation-scene.test.ts` — 3 tests; `src/game/scenes/in-system-travel-animation-scene.test.ts` — 3 tests

**Evidence:** 281 tests, 0 TypeScript errors. Branch: `claude/implement-jump-system-EYxJj`.

---

### 027 · World-Driven Story, Station, and System Display

**Built:**
- `src/shared/buffer-utils.ts` — added `wrapText(text, maxWidth): string[]` utility
- `src/shared/buffer-utils.test.ts` — 5 tests covering empty string, single word, over-length word, multi-word wrap, exact-fill
- `src/game/scenes/StoryScene.ts` — removed `STORY_LINES`, `YEAR_HEADER`, `STATION_NAME` import; reads `opening-arrival` beat via `getStoryBeatsByTrigger('game-start')[0]`; splits on `\n\n`, extracts year header, wraps body paragraphs at 36 chars with blank separators
- `src/game/scenes/StationMenuScene.ts` — added `destinationId: string` param; menu items built from `destination.amenities`; NavBar title from `dest.name`; description (3 lines) and `DANGER: <level>` rendered at rows 5+
- `src/game/scenes/ShipScene.ts` — added `destinationId: string` param; location row shows `<DEST>  ·  <SYSTEM>`; station glyph mapped from `destination.type` via `DESTINATION_TYPE_TO_STATION`
- `src/game/scenes/TraderScene.ts` — added `destinationId: string` param; trader name from `destination.npcs.trader`; NavBar title from `dest.name`
- `src/game/scenes/MissionBoardScene.ts` — added `destinationId: string` param; NavBar title from `dest.name`
- `src/game/constants.ts` — `STATION_NAME` export deleted
- `src/main.ts` / `terminal.ts` — added `STARTING_DESTINATION = 'elysium-station'`; passed to all scene constructors
- All 5 scene test files updated; `story-scene.test.ts` replaces Hugo-text paragraph checks with world-data assertions

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 238/238 tests passed (15 test files)
- `bash init.sh`: ✓ `=== Environment ready ===`

---

### 019 · World Data TypeScript Types

**Built:**
- `src/game/world/types.ts` — exports all type aliases and interfaces: `SecurityLevel`, `DangerLevel`, `PopulationLevel`, `KnowledgeLevel`, `Zone`, `LocationType`, `DestinationType`, `StoryBeatType`, `FactionType`, `FactionSize`, `CommodityCategory`, `ShipClass`, `RouteStability`, `StarSystem`, `DestinationAmenities`, `Destination`, `StoryBeat`, `JumpRoute`, `JumpDrive`, `Ship`, `Faction`, `Commodity`, `WorldData`
- `src/game/world/world-data.ts` — exports `WORLD: WorldData` with all seed data (4 systems, 10 destinations, 5 routes, 4 drives, 3 ships, 6 factions, 12 commodities, 3 story beats) plus helpers: `getSystem`, `getDestination`, `getRoutesFrom`, `getDrive`, `getStoryBeat`, `getStoryBeatsByTrigger`
- `src/game/world/world-data.test.ts` — 16 tests covering all acceptance criteria

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 230/230 tests passed (14 test files)
- `bash init.sh`: ✓ `=== Environment ready ===`

---

### 023 · Galaxy Map

**Built:**
- `scripts/build-map.ts` — replaces Feature 022 stub; reads all `docs/world/systems/*.md` (skipping `_template.md`) via `gray-matter`; normalises `map_position` light-year coordinates to a 0–100 SVG viewBox with 8-unit padding; reads `docs/world/navigation/jump-routes.md`; generates an inline SVG with `<line>` route elements (stroke-dasharray for unstable routes) and `<g class="system">` node elements (`<circle r="1.2">` + `<text dy="2.5">`) colour-coded by zone/security; wraps in `html-template.ts` `page()`; writes `dist/map/index.html`
- `scripts/lib/html-template.ts` — added `--bright-cyan: #55ffff`, `--bright-yellow: #ffff55`, `--bright-magenta: #ff55ff` to `:root` CSS variable block
- `scripts/build-landing.ts` — GALAXY MAP tile changed from disabled span to active `<a href="map/index.html">` link

**Colour coding:**
- Zones: core → `--bright-cyan`, frontier → `--bright-yellow`, outer → `--bright-magenta`
- Routes: high → `--green`, medium → `--yellow`, low → `--red`, none → `--bright-black`; unstable routes dashed

**Interactive features:**
- Hover tooltip (follows cursor, clamped to viewport) shows system name, zone, security, danger level, destination count in terminal box-drawing style
- Click any node navigates to `/untitled-space-game/docs/systems/<id>.html`
- Legend panel (zone colours + route security colours) rendered alongside the SVG

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 214/214 tests passed (13 test files)
- `npm run build:map`: ✓ `dist/map/index.html` written (8 systems, 5 routes)
- `npm run build:all`: ✓ game + docs + map + landing page all written

---

### 015 · Station Nav Bar

**Built:**
- `src/game/ui/NavBar.ts` — new `NavBar` class; constructor takes `(stationName, options)`; `render()` writes station name centered in `bright-cyan` on row 0 and `[LABEL]` buttons centered in `white` on row 1 with one-space gaps; caches button column ranges after each render; `hitTest(col, row)` returns option id for row 1 hits, `null` for row 0, misses, or pre-render calls
- `src/game/ui/NavBar.test.ts` — 14 tests covering: station name text/position/color, single-option centering, two-option layout and gap, button color, hitTest row 0 null, hitTest undock/hub ranges, hitTest gap and out-of-range null, single-option hitTest, pre-render null
- `src/game/scenes/BaseMenuScene.ts` — scene title color changed from `bright-cyan` to `white`
- `src/game/scenes/StationMenuScene.ts` — title changed to `'HUB'`; UNDOCK menu item removed; `navBar` field added (single `[UNDOCK]` option); `render()` overrides to call `super.render()` then `navBar.render()`; additional `onAction` handler: ESC sets `navActivated=true` and calls `onShip`; additional `onTap` handler: hitTest on `'undock'` → `onShip`
- `src/game/scenes/TraderScene.ts` — constructor signature changed from `onBack` to `(onHub, onUndock)`; `navBar` field added (two options `[UNDOCK] [HUB]`); `navBar.render()` called after clear; scene title color `bright-cyan` → `white`; `onTap` checks nav hit first; BACK action calls `onHub`
- `src/game/scenes/MissionBoardScene.ts` — identical changes to TraderScene
- `src/game/scenes/station-menu-scene.test.ts` — rewritten: updated layout tests (HUB title/white, === rule, no UNDOCK in items); replaced UNDOCK keyboard/tap tests with ESC→onShip and nav-button tap tests; added nav bar row 0/1 assertions
- `src/game/scenes/trader-scene.test.ts` — all constructors updated to two-callback form; trader name color updated to white; BACK test renamed onHub; added nav bar row 0/1 tests and [UNDOCK]/[HUB] tap tests
- `src/game/scenes/mission-board-scene.test.ts` — same updates as trader scene tests
- `src/main.ts` — `goToTrader` and `goToMissionBoard` now pass `goToShip` as second argument
- `terminal.ts` — same wiring update as `src/main.ts`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 214/214 tests passed (13 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 21.67 kB)

---

### 017 · Static Starfield with Twinkling — Ship Scene

**Built:**
- `src/game/scenes/Starfield.ts` — replaced scrolling parallax model with stationary stars; removed `y`, `twinkleTimer`, `twinkled` fields; added `row` (integer, fixed), `twinklePhase` (radians, LCG-seeded to `[0, 2π)`), `twinklePeriod` (LCG-assigned per-layer range: L0 4000–9000 ms, L1 2000–5000 ms, L2 800–2500 ms); `update()` advances phase via `(2π / period) * dt`; `render()` maps `sin(phase)` to dim / normal / bright colour states (L0 dim = not rendered; L1 dim = `bright-black`; L2 dim = `white`); layer counts corrected to 18/10/5; bounds remap on first `render()` still scales initial positions to actual screen size
- `src/game/scenes/Starfield.test.ts` — removed all scrolling and twinkle-timer tests; added tests for integer row, twinklePhase in `[0, 2π)`, twinklePeriod in layer range, LCG determinism for phases/periods, row/col unchanged after update, phase-advance formula, and all three brightness state → colour mappings (bright / normal / dim) for all three layers

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 190/190 tests passed (12 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 20.28 kB)

---

### 021 · Writer Role

**Built:**
- `docs/agent/roles/WRITER.md` — full role instructions: tone guide, doc type responsibilities, cross-reference checklist, narrative rules
- `CLAUDE.md` — updated to list seven roles (added Writer) and added `build:docs`, `build:map`, `build:all` commands (stub entries for 022/023)
- `docs/world/systems/` — all four system docs updated with `map_position` fields (required by Feature 023); `_template.md` updated with schema entry
- `docs/features/022-world-docs-publisher.md` — full spec (READY)
- `docs/features/023-galaxy-map.md` — full spec (READY, depends on 022)

**Evidence:** Documentation-only. No code changes; no tests required.

---

### 022 · World Docs HTML Publisher

**Built:**
- `scripts/lib/parse-world.ts` — walks `docs/world/**/*.md`, skips `_template.md` files, parses front matter + body via `gray-matter`; returns `WorldDoc[]` with `{ path, category, id, data, content }`
- `scripts/lib/html-template.ts` — `page(title, breadcrumbs, body)` helper; inline CSS with black background, Share Tech Mono / VT323 fonts, 16-colour palette matching `colors.css`; breadcrumb header in bright-cyan; footer in dim
- `scripts/build-docs.ts` — renders all world docs to `dist/docs/`: category index pages with sortable tables, detail pages with front-matter table + rendered markdown body, `dist/docs/index.html` listing all categories; cross-reference fields (`major_factions`, `destinations`, `system`, `home_system`, `influence`) rendered as hyperlinks; `dist/docs/commodities.html` as a table from front-matter list
- `scripts/build-landing.ts` — writes `dist/index.html` with game title, tagline, and three tiles: `[PLAY GAME]`, `[WORLD DOCS]`, `[GALAXY MAP]` (dimmed, "coming soon" until Feature 023)
- `scripts/build-map.ts` — stub; no-op until Feature 023
- `vite.config.ts` — `base` changed to `/untitled-space-game/game/`; `build.outDir` set to `dist/game`; game assets no longer overwrite landing page
- `package.json` — added `build:docs`, `build:map`, `build:landing`, `build:all` scripts
- `.github/workflows/deploy.yml` — added `oven-sh/setup-bun@v2` step; `npm run build` → `npm run build:all`; deploys entire `dist/` tree
- `gray-matter ^4.0.3` and `marked ^18.0.3` added as `devDependencies`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 214/214 tests passed (13 test files)
- `npm run build`: ✓ Vite build → `dist/game/` (21.66 kB JS)
- `npm run build:all`: ✓ game + 51 docs HTML pages + stub map + landing page; all cross-reference links resolve correctly

---

### 018 · World Data Schemas & Seed Content

**Built:**
- `docs/features/018-world-data-schemas.md` — full spec for all world document types
- `docs/features/019-world-data-types.md` — full spec for TypeScript types feature
- `docs/world/systems/` — four system docs (`sol`, `alpha-centauri`, `barnards-star`, `wolf-359`) updated with `zone`, `danger_level`, `destinations` fields; typo `alpha-centurai` corrected; `_template.md` updated
- `docs/world/destinations/` — new directory (renamed from `stations/`); `_template.md` with `location_type` field; ten destination docs with full amenities front matter
- `docs/world/story/` — new directory; `_template.md` for story beats; three seed beats (`opening-arrival`, `first-jump`, `enter-wolf-359`)
- `docs/world/factions/` — six faction docs (`terran-union`, `helios-directorate`, `centauri-trade-league`, `independent-miners-guild`, `free-captains`, `grey-market-cartel`)
- `docs/world/ships/` — three ship docs (`freighter`, `scout`, `hauler`); `_template.md` updated
- `docs/world/commodities.md` — twelve commodities across four categories
- `docs/world/navigation/jump-routes.md` — full five-route connected graph across all four systems; broken `epsilon-eridani` reference removed

**Evidence:**
- All destination ids in system `destinations` lists resolve to docs in `docs/world/destinations/`
- All faction ids in system `major_factions` lists resolve to docs in `docs/world/factions/`
- All route endpoints reference system ids that have docs in `docs/world/systems/`
- All ship `default_jump_drive` ids reference drives in `jump-drives.md`
- No code changes — documentation only

---

### 012 · Animated Starfield & Space Station View — Ship Scene

**Built:**
- `src/game/scenes/station-types.ts` — new file; four built-in `SpaceStationDef` constants: BEACON (2×3, bright-yellow), RELAY (3×5, bright-yellow), RING (3×3, cyan), HUB (5×5, white)
- `src/game/scenes/Starfield.ts` — new class; 33 stars across three layers (18 `.` bright-black/1.5 r/s, 10 `*` white/4.0 r/s, 5 `+` bright-white/9.0 r/s); LCG seed 42; per-star twinkle timer [800–3000 ms]; bounds cached from `render()` call and used in `update()` for wrap; `getStars()` test accessor
- `src/game/scenes/SpaceStation.ts` — new class; anchor placed at 50% vertical / 60% horizontal of interior; Lissajous drift (AMP_ROW=2, AMP_COL=3, periods 9 s and 12 s); clamps to interior bounds; `getDisplayPosition()` test accessor; space chars in glyph skipped during render
- `src/game/scenes/ShipScene.ts` — new cockpit window border (row 2: `\___/`, rows 3–25: `|` sides, row 26: `|_____|` sill, row 27: `/     \` corners); buttons moved to single row `h-2` side-by-side; lazy-init of `SpaceStation` on first `render()`; `update()` forwards to starfield and station; tap detection splits row at `w/2`
- `src/game/scenes/Starfield.test.ts` — 20 tests covering initialisation, layer distribution, LCG determinism, y/col bounds, speed advancement, wrap, twinkle timer, all three layer colours, twinkle colour overrides, draw-order overwrite
- `src/game/scenes/SpaceStation.test.ts` — 9 tests covering anchor row at t=0, interior bounds, drift change, quarter/full-period clamping, large-dt safety, glyph render, space-skip, overwrite
- `src/game/scenes/ship-scene.test.ts` — updated; removed old static starfield tests; added border row assertions, interior non-space check, animation forwarding tests; button tests updated to single BUTTONS_ROW; footer/touch rows updated to `h-1`/`h-2`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 190/190 tests passed (12 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 20.29 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 014 · Adaptive Height, Border Removal & Screen Centering Fix

**Built:**
- `src/shared/types.ts` — replaced `GRID_HEIGHT = 30` with `MIN_GRID_HEIGHT = 30` and `MAX_GRID_HEIGHT = 50`
- `src/platform/dom/DOMRenderer.ts` — fixed `measureChar()` font from `VT323` to `Share Tech Mono`; added `private gridH = MIN_GRID_HEIGHT`; updated `applyScale()` to compute adaptive row count clamped to 30–50, fire `onResize` handlers when height changes; `getHeight()` now returns `this.gridH`
- `src/platform/terminal/TerminalRenderer.ts` — `getHeight()` now reads `process.stdout.rows` clamped to `MIN_GRID_HEIGHT`/`MAX_GRID_HEIGHT`
- `src/game/scenes/MainMenuScene.ts` — removed `drawBorder` import and call
- `src/game/scenes/BaseMenuScene.ts` — removed `drawBorder` import and call
- `src/game/scenes/StoryScene.ts` — removed `drawBorder` import and call; removed `FOOTER_ROW = 27` constant; footer now uses `h - 3`
- `src/game/scenes/TraderScene.ts` — removed `drawBorder` import and call; `contentWidth` changed from `w - 3` to `w - 2`
- `src/game/scenes/MissionBoardScene.ts` — removed `drawBorder` import and call; `contentWidth` changed from `w - 3` to `w - 2`
- `src/platform/dom/DOMRenderer.test.ts` — updated import to `MIN_GRID_HEIGHT`; `getHeight()` assertion uses `MIN_GRID_HEIGHT`
- `src/platform/terminal/TerminalRenderer.test.ts` — same import and assertion update
- All 5 scene test files — replaced `'renders a border…'` tests with `'does not render a border'` negative assertions
- `src/game/scenes/story-scene.test.ts` — footer row assertions now use `h - 3`; retitled `tap on row 0 (border)` → `tap on row 0 (empty row)`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 156/156 tests passed (10 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 17.41 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 011 · Game Scenes — Trader, Mission Board, Ship

**Built:**
- `src/game/scenes/TraderScene.ts` — implements `Scene`; constructor takes `(inputHandler, context, onBack)`; data: `TRADERS` constant with one trader (MERCHANT KESS) with 6-item buy/sell lists; tab state (`BUY`/`SELL`), cursor navigation (UP/DOWN wrap, LEFT/RIGHT switches tab and resets cursor), SELECT logs item name placeholder, BACK fires `onBack()` with activated guard; `onTap` handles tab-column detection and item-row tap; `render()` clears to black, draws border, bright-cyan title, cyan rule, tab bar ([BUY]/[SELL] at cols 10/17), item list with left-aligned name + dots + right-aligned price, bright-black footer
- `src/game/scenes/MissionBoardScene.ts` — implements `Scene`; constructor takes `(inputHandler, context, onBack)`; data: `MISSIONS` constant (7 missions, types rescue/delivery/combat/salvage); cursor navigation (UP/DOWN wrap), SELECT logs mission title placeholder, BACK fires `onBack()` with activated guard; `onTap` detects mission row taps; `render()` clears to black, draws border, bright-cyan title, cyan rule, mission rows with bright-yellow type icon `[X]`, white title, bright-green reward, dotted fill; bright-black footer
- `src/game/scenes/ShipScene.ts` — implements `Scene`; constructor takes `(inputHandler, context, onBack)`; data: `INITIAL_STATE = { fuel:100, cargo:0, cargoCapacity:50, credits:5000 }`; deterministic LCG starfield (60 stars, seed 0xabcd1234, rows 1–24); two-button cursor (JUMP/DOCK, row 25/26) with UP/DOWN wrapping, SELECT logs `[Ship] Jumping…`/`[Ship] Docking…`, BACK fires `onBack()` with activated guard; `onTap` handles JUMP/DOCK rows; `render()` clears to black, bright-cyan status bar at row 0, starfield (bright-black `.`/`*`), centered button labels in bright-yellow with cursor prefix, footer at row 27
- `src/game/scenes/trader-scene.test.ts` — 18 tests covering layout, tab rendering, item list, cursor navigation, tab switching, SELECT/BACK, tap on tabs, tap on items
- `src/game/scenes/mission-board-scene.test.ts` — 17 tests covering layout, type icons, rewards, cursor navigation, SELECT/BACK, tap on missions
- `src/game/scenes/ship-scene.test.ts` — 19 tests covering no-border layout, status bar, starfield, button layout/colours, cursor navigation, SELECT/BACK, tap on buttons
- `src/game/scenes/StationMenuScene.ts` — updated constructor: takes `(inputHandler, context, onTrader, onMissionBoard, onShip)`; TRADER/MISSION BOARD/UNDOCK items now fire their respective callbacks instead of console.log placeholders
- `src/game/scenes/station-menu-scene.test.ts` — updated all 18 tests to pass three callbacks; assertions changed from `consoleSpy` to `expect(onTrader/onMissionBoard/onShip).toHaveBeenCalledTimes(1)`; added `makeScene` helper
- `src/main.ts` — added imports and `goToTrader`, `goToMissionBoard`, `goToShip` callbacks; `goToStation` now passes all three callbacks to `StationMenuScene`
- `terminal.ts` — same scene wiring as `src/main.ts`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 154/154 tests passed (10 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 17.44 kB)

---

### 010 · Space station menu screen

**Built:**
- `src/game/scenes/BaseMenuScene.ts` — new abstract base class; constructor takes `(title, items, inputHandler, context)`; handles cursor navigation (UP/DOWN wrap-around), `activated` guard (set on SELECT or tap before calling the item action), `onTap` mapping (row → item starting from row 14), and `render()` (clear to black, white border, bright-cyan title centred at row 2, cyan `=` rule at row 3 matching title width, bright-green/white items centred from row 14, bright-black footer hint at h-3); `update()` no-op
- `src/game/scenes/StationMenuScene.ts` — extends `BaseMenuScene`; constructor takes `(inputHandler, context, onUndock)`; passes `STATION_NAME.toUpperCase()` as title and three items: TRADER (logs placeholder), MISSION BOARD (logs placeholder), UNDOCK (calls `onUndock`)
- `src/game/scenes/station-menu-scene.test.ts` — 18 tests: border, title row/colour, rule row/colour, items at rows 14–16, cursor starts on TRADER, DOWN cycles through all three and wraps, UP from TRADER wraps to UNDOCK, SELECT on TRADER logs placeholder, SELECT on MISSION BOARD logs placeholder, SELECT on UNDOCK calls onUndock once then silences, tap rows 14/15/16 activate correct items, tap non-item row does nothing, input silenced after any selection, keyboard footer hint, touch footer hint, update no-throw
- `src/main.ts` — scene wiring updated: `goToStation` creates `StationMenuScene` with `goToMainMenu` as `onUndock`; `goToStory` now passes `goToStation` as `onContinue`; full chain: `MainMenuScene` → `StoryScene` → `StationMenuScene` → `MainMenuScene`
- `terminal.ts` — same scene wiring as `src/main.ts`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 100/100 tests passed (7 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 9.74 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 009 · Story intro screen

**Built:**
- `src/game/constants.ts` — new file; exports `STATION_NAME = 'Elysium Station'` as the single source of truth for the station name
- `src/shared/buffer-utils.ts` — new file; exports `writeText`, `writeCentered`, `drawBorder` extracted from `MainMenuScene` so all scenes share the same helpers
- `src/game/scenes/StoryScene.ts` — full implementation: constructor takes `(inputHandler, context, onContinue)`; registers `onAction` (SELECT fires `onContinue` once then sets `activated`) and `onTap` (any tap fires `onContinue` once); BACK is ignored; `render` clears buffer to black, draws white border, renders `YEAR  2284` centred in bright-yellow on row 2, all 11 story text lines in white at col 2, keyboard or touch footer hint in bright-black at row 27
- `src/game/scenes/story-scene.test.ts` — 17 tests: layout/clear, border, year header colour/position, all three story paragraphs at correct rows, closing line, keyboard footer, touch footer, line-length bound, SELECT fires once, second SELECT ignored, tap fires once, tap on any row fires, second tap ignored, BACK no effect, update no throw
- `src/game/scenes/MainMenuScene.ts` — updated to import helpers from `buffer-utils`; constructor signature changed from `(inputHandler, context)` to `(inputHandler, context, onNewGame: () => void)`; NEW GAME action now calls `onNewGame()` instead of logging
- `src/game/scenes/main-menu-scene.test.ts` — updated all 22 tests to pass `onNewGame` as `vi.fn()` or a named mock; assertions changed from `consoleSpy` to `expect(onNewGame).toHaveBeenCalledTimes(1)`
- `src/main.ts` — scene wiring: `currentScene` variable; `goToStory` callback creates `StoryScene` with placeholder `onContinue`; `MainMenuScene` constructed with `goToStory`; loop renders `currentScene`
- `terminal.ts` — same scene wiring as `src/main.ts` for the terminal entry point

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 82/82 tests passed (6 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 8.32 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 006 · Main menu screen

**Built:**
- `src/shared/types.ts` — added `Scene` interface (`update(dt: number): void; render(buffer: CharBuffer): void`)
- `src/game/scenes/MainMenuScene.ts` — full implementation: constructor takes `(inputHandler, context)`; registers `onAction` (UP/DOWN wrap cursor, SELECT activates) and `onTap` (direct row-to-item activation); `render` draws title block (bright-cyan, rows 4 & 7, 0-indexed), tagline (white, row 14), menu options (bright-green cursor + white unselected, starting row 21), and footer hint (bright-black, row 57 — only if grid ≥ 58 rows tall); QUIT only added in terminal context; `activated` flag silences further input after selection
- `src/game/scenes/main-menu-scene.test.ts` — 21 tests covering: layout/clear, title & tagline rendering, cursor colour, footer hint (keyboard/touch/absent), browser vs terminal item sets, DOWN/UP/SELECT/BACK keyboard nav, wrap-around, post-activation silence, touch tap on item row, touch tap on non-item row, QUIT via touch (process.exit mocked)
- `src/platform/terminal/process.d.ts` — extended `stdin.on` with `'close' | 'end'` overload
- `terminal.ts` — replaced test pattern with 30fps `setInterval` game loop (MainMenuScene + buffer allocation); added `process.stdin.on('close', ...)` so process exits cleanly when stdin is piped (init.sh check)
- `src/main.ts` — replaced test pattern with `requestAnimationFrame` game loop (MainMenuScene + buffer allocation per frame); `input.connect()` called before scene construction

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 65/65 tests passed (5 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 7.20 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 005 · Keyboard input handler (terminal)

**Built:**
- `src/platform/terminal/process.d.ts` — extended with `exit(code?: number): never` and `stdin` shape (`isTTY?`, `setRawMode?`, `resume`, `on`, `removeListener`)
- `src/platform/terminal/TerminalInputHandler.ts` — full implementation: `onAction(handler)` registers callbacks; `connect()` sets raw mode via optional `setRawMode?.()`, calls `resume()`, attaches `data` listener; `disconnect()` removes listener and restores cooked mode; key map covers arrow keys → UP/DOWN/LEFT/RIGHT, `\x1b[5~`/`\x1b[6~` → PAGE_UP/PAGE_DOWN, `\r`/`\n` → SELECT, bare `\x1b` → BACK, `p`/`P` → PAUSE; `q`, `Q`, `\x03` call `process.exit(0)`; constructor accepts optional `stdin` parameter for testability (defaults to `process.stdin`)
- `src/platform/terminal/TerminalInputHandler.test.ts` — 20 tests: connect/disconnect lifecycle, all 11 key mappings, multiple handlers, no events after disconnect, unmapped keys ignored, q/Q/Ctrl+C trigger exit
- `terminal.ts` — registers smoke-test `onAction` logger and calls `connect()`
- `init.sh` — terminal entry check changed from `bun --check terminal.ts` to `bun terminal.ts < /dev/null` (stdin EOF causes clean exit after connect)

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 44/44 tests passed (4 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 5.75 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 008 · Colocate unit tests with source modules

**Built:**
- `src/tests/scaffold.test.ts` — deleted; four describe blocks extracted into colocated files
- `src/tests/dom-input-handler.test.ts` — deleted; content merged into colocated file below
- `src/platform/dom/DOMRenderer.test.ts` — `describe('DOMRenderer')` block (4 tests)
- `src/platform/terminal/TerminalRenderer.test.ts` — `describe('TerminalRenderer')` block (3 tests)
- `src/platform/terminal/TerminalInputHandler.test.ts` — `describe('TerminalInputHandler')` block (1 test)
- `src/platform/dom/DOMInputHandler.test.ts` — scaffold smoke-test describe plus all 16 detailed keyboard/touch tests (17 tests)
- `vite.config.ts` — `include` pattern changed from `src/tests/**/*.test.ts` to `src/**/*.test.ts`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 25/25 tests passed (4 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 5.75 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 004 · Touch controls (browser)

**Built:**
- `src/platform/dom/DOMInputHandler.ts` — full touch implementation alongside keyboard: `onTap(handler)` registers tap callbacks; `connect()` attaches `touchstart`/`touchend` listeners to `document.body` with `{ passive: false }`; touch positions tracked per identifier; on `touchend`: single tap (delta < 20px) fires all `onTap` handlers with grid col/row; swipe (dominant axis, delta ≥ 20px) fires UP/DOWN/LEFT/RIGHT action; two-finger tap (both deltas < 20px) fires BACK; `disconnect()` removes all touch listeners and clears state; `getGridCoords()` derives cell size from `.game-screen` data attributes and `getBoundingClientRect()`
- `src/platform/dom/DOMRenderer.ts` — `applyResize()` now writes `data-grid-cols` and `data-grid-rows` attributes on the `<pre>` element for coordinate lookup
- `index.html` — viewport meta updated to `user-scalable=no` to suppress pinch-zoom
- `src/tests/dom-input-handler.test.ts` — 11 new tests: correct grid coords on tap, multiple handlers, tap fires no action, all 4 swipe directions, swipe fires no tap, two-finger tap fires BACK, no events after disconnect, preventDefault on touch events

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 25/25 tests passed (2 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 5.75 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 003 · Keyboard input handler (browser)

**Built:**
- `src/platform/dom/DOMInputHandler.ts` — full implementation: `onAction(handler)` registers callbacks; `connect()` attaches a `keydown` listener to `document`; `disconnect()` removes it; key map covers ArrowUp/Down/Left/Right → UP/DOWN/LEFT/RIGHT, PageUp/Down → PAGE_UP/PAGE_DOWN, Enter → SELECT, Escape → BACK, P/p → PAUSE; arrow and page keys call `event.preventDefault()`
- `src/main.ts` — instantiates `DOMInputHandler`, registers a smoke-test `console.log` callback, and calls `connect()`
- `src/tests/dom-input-handler.test.ts` — 5 tests: all key mappings, multiple handlers called independently, `preventDefault` behaviour, no events after `disconnect`, unmapped keys ignored

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 14/14 tests passed (2 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 3.87 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 007 · Responsive screen sizing

**Built:**
- `src/shared/types.ts` — replaced `GRID_WIDTH`/`GRID_HEIGHT` with `MIN_GRID_WIDTH = 20`, `MIN_GRID_HEIGHT = 30`, `MAX_GRID_WIDTH = 40`, `MAX_GRID_HEIGHT = 60`; added `onResize(handler)` to `Renderer` interface
- `src/platform/dom/DOMRenderer.ts` — measures char cell size once via `document.fonts.ready`; on construction and every debounced `window.resize` event (~100ms): clamps grid to min/max, scales font down if viewport smaller than min grid, sets explicit `<pre>` pixel width; fires all `onResize` handlers
- `src/platform/terminal/TerminalRenderer.ts` — reads `process.stdout.columns`/`process.stdout.rows` at construction, clamps to min/max, registers `SIGWINCH` listener (guarded by try/catch) to recompute and fire `onResize` handlers
- `src/platform/terminal/process.d.ts` — minimal ambient declaration for `process` global (avoids new package dependency)
- `src/main.ts` — uses `renderer.getWidth()`/`getHeight()` for test pattern, re-renders on resize
- `index.html` — added `html, body { overflow: hidden }`, changed `align-items` to `center`, `height: 100vh`, body background `#000000`
- `src/tests/setup.ts` — polyfills `document.fonts.ready` for jsdom test environment
- `vite.config.ts` — added `setupFiles: ['src/tests/setup.ts']`
- `src/tests/scaffold.test.ts` — updated dimension assertions to use `MAX_GRID_*` constants; added `onResize` callable tests for both renderers; added async resize handler test for DOMRenderer

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 9/9 tests passed
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 3.16 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 002 · CharBuffer and DOMRenderer

**Built:**
- `src/shared/types.ts` — added `GRID_WIDTH = 40` and `GRID_HEIGHT = 60` as the single source of truth for grid dimensions
- `src/platform/dom/DOMRenderer.ts` — full implementation: creates and owns a `<pre class="game-screen">` element, `drawBuffer` serialises each cell into `<span class="fg-X bg-Y">char</span>` with HTML escaping; `transparent` fg/bg omit the corresponding class; guarded for non-DOM environments
- `src/platform/dom/colors.css` — CSS custom properties on `:root` for all 16 named colours; `.fg-*` and `.bg-*` classes for each; swapping a theme requires only editing the `:root` block
- `index.html` — loads VT323 from Google Fonts; imports `colors.css`; body resets + centred layout; `.game-screen` styles (`white-space: pre`, VT323, `line-height: 1em`)
- `src/main.ts` — imports `colors.css`; renders a 40×60 test pattern of `#` characters cycling through all 16 foreground colours on a black background
- `src/platform/terminal/TerminalRenderer.ts` — updated to import `GRID_WIDTH`/`GRID_HEIGHT` from shared types

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 6/6 tests passed
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.css 1.94 kB; dist/assets/index-*.js 1.92 kB)
- `init.sh` (before and after): ✓ passes clean

---

### 001 · Scaffold: Vite + TypeScript + Bun project structure

**Built:**
- `package.json` with Vite + TypeScript + Vitest dev dependencies and all required scripts
- `tsconfig.json` — strict mode, `moduleResolution: "bundler"`, targets `src/**/*`
- `vite.config.ts` — base path `/untitled-space-game/` for GitHub Pages; Vitest config included
- `index.html` — browser entry (Vite)
- `src/main.ts` — browser bootstrap (detects touch vs keyboard, instantiates stubs)
- `src/shared/types.ts` — `Color`, `Cell`, `CharBuffer`, `Renderer`, `InputHandler`, `GameAction`, `GameContext`
- `src/platform/dom/DOMRenderer.ts` — no-op stub implementing `Renderer` (40×60 grid)
- `src/platform/dom/DOMInputHandler.ts` — no-op stub implementing `InputHandler`
- `src/platform/terminal/TerminalRenderer.ts` — no-op stub implementing `Renderer` (40×60 grid)
- `src/platform/terminal/TerminalInputHandler.ts` — no-op stub implementing `InputHandler`
- `terminal.ts` — Bun entry point
- `src/tests/scaffold.test.ts` — 6 tests verifying all stubs are instantiable and return correct dimensions
- `.github/workflows/deploy.yml` — builds on push to main, deploys `dist/` to `gh-pages` branch via peaceiris/actions-gh-pages
- `.gitignore`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 6/6 tests passed
- `npm run build`: ✓ Vite build OK (dist/index.html 0.32 kB)
- `bun --check terminal.ts`: ✓ exits 0
- `init.sh` (before and after): ✓ passes clean
