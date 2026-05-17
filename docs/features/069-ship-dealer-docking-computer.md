# Feature 069 · Ship Dealer Upgrades & Docking Computer

## Goal

Add a purchasable docking computer at ship dealers; when installed and enabled it replaces
the docking sequence for orbital and deep-space destinations with a brief 1-second
`AUTOPILOT ENGAGED` screen before entering the station.

---

## Acceptance criteria

- `docs/world/ships/components/ship-upgrades.md` gains a `docking-computer` entry (id, name,
  description, cost)
- Destinations with `ship_dealer: true` now show a `SHIP UPGRADES` entry in the station hub;
  selecting it opens `ShipDealerScene`
- `ShipDealerScene` lists all upgrades from world data; upgrades already installed by the player
  appear as non-selectable `INSTALLED` rows; uninstalled upgrades show their name and credit cost
- Purchasing an upgrade the player can afford: shows a confirm dialog; on confirmation, credits
  are deducted and `player.installUpgrade(id)` is called; the player returns to the station hub
- Attempting to purchase an upgrade when credits are insufficient: shows an error modal; no state
  changes
- The NPC name from `destination.npcs.shipDealer` (if present) appears in the scene's summary area
- `[1] BACK` / BACK action returns to the station hub
- After purchasing the docking computer, the global menu SHIP screen shows
  `DOCKING COMPUTER   [ON ]`
- When the docking computer is installed and enabled, docking at an `orbital` or `deep-space`
  destination shows `AutopilotDockingScene` for 1 000 ms (or until any keypress), then
  transitions to the station — the normal docking animation does not play
- When the docking computer is installed but toggled to `OFF`, the docking animation plays as normal
- `npm test` passes; `npx tsc --noEmit` produces zero errors

---

## Out of scope

- Buying a new ship at the dealer (separate future feature)
- Removing or selling installed upgrades
- Bypassing surface-landing or asteroid-landing sequences (docking computer is orbital/deep-space only)
- Changes to the docking animation or mini-game themselves

---

## Technical notes

### World data — docking computer entry

Add to `docs/world/ships/components/ship-upgrades.md`:

```yaml
  - id: docking-computer
    name: Docking Computer
    description: Automated approach-and-lock system that handles station docking without pilot input.
    cost: 8000
```

Cost (8000 CR) is a balance starting point; adjust to taste.

### Destination.npcs — shipDealer field

The `Destination` interface currently has `npcs: { trader?: string }`. Add `shipDealer?: string`.
`WorldParser` reads `npcs.ship_dealer` into this field.

Several existing destination docs already contain `npcs: ship_dealer: <Name>` — these should
now populate `destination.npcs.shipDealer` correctly after the parser update.

### StationMenuScene changes

Add `onShipDealer: () => void` as a new constructor parameter (after the existing callbacks).
Add a `SHIP UPGRADES` item to the amenity list when `dest.amenities.shipDealer` is true.
Update all callers in `game.ts` to supply the new callback, pointing to a new
`goToShipDealer()` method.

### ShipDealerScene

New file `src/game/scenes/ship-dealer-scene.ts`, extending `BaseMenuScene`.

Constructor receives `player: PlayerState`, `destination: Destination`, and `onBack: () => void`.

Items are built from `getWorld().upgrades` at construction time:

- Installed upgrade → `{ label: '[name]   INSTALLED', disabled: true }`
- Uninstalled upgrade → `{ label: '[name]', info: '[cost]CR', action }`

On activation of a purchasable item:
- If `player.credits < upgrade.cost`: open a `ModalConfirmDialog` with title `INSUFFICIENT FUNDS`,
  a brief message, and a single `OKAY` button.
- Otherwise: open a `ModalConfirmDialog` asking the player to confirm the purchase at the shown
  cost. On confirm: `player.spendCredits(upgrade.cost)`, `player.installUpgrade(upgrade.id)`,
  then call `onBack()`. On cancel: dismiss modal, allow further navigation.

`destination.npcs.shipDealer` (if present) should appear in the summary/info area so the player
knows who they are dealing with.

### AutopilotDockingScene

New file `src/game/scenes/autopilot-docking-scene.ts`, extending `BaseTransitionScene`.
Duration: 1 000 ms; advances immediately on any keypress (standard `BaseTransitionScene`
behaviour). Receives a single `onComplete: () => void` callback that calls `goToStation()`.

> suggestion: Centred content — `AUTOPILOT ENGAGED` in bright-green, with the destination name
> on the line below in white.

### Docking bypass in game.ts

At the top of `goToLandOrDock()`, before the existing locationType routing, add:

```
if destination.locationType is 'orbital' or 'deep-space'
AND player.isUpgradeEnabled('docking-computer'):
    show AutopilotDockingScene → goToStation()
    return
```

This bypass has no dependency on mini-game features. When Features 055 and 058 are later
wired into `goToLandOrDock()`, this guard fires first and the mini-game is never reached.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Start a new game (Sol system, Elysium Station). Mars Anchor is also in Sol and has
   `ship_dealer: true` — dock there.
2. Station hub shows `SHIP UPGRADES` — open it; confirm `Docking Computer` is listed with its
   credit cost; credits (5000 CR starting) are insufficient to buy it.
3. Use a cheat or earn credits, then return; purchase the docking computer — confirm credits
   deducted and return to hub.
4. Open global menu → SHIP — confirm `DOCKING COMPUTER   [ON ]`.
5. Undock; select another orbital destination; choose DOCK — confirm `AUTOPILOT ENGAGED`
   appears briefly (~1 s) then the station opens; the normal docking animation does not play.
6. Open global menu → SHIP; toggle docking computer to `[OFF]`; re-dock — confirm the
   docking animation plays (no autopilot screen).

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 068 (Ship Upgrade Infrastructure & SHIP Screen)
