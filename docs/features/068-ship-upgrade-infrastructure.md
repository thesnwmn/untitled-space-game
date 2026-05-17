# Feature 068 · Ship Upgrade Infrastructure & SHIP Screen

## Goal

Establish the world-data schema and PlayerState foundation for ship upgrades, and surface
installed upgrades as togglable rows in a new SHIP screen accessible from the global menu.

---

## Acceptance criteria

- `docs/world/ships/components/ship-upgrades.md` exists with the upgrade schema (id, name,
  description, cost); the `upgrades` list starts empty — the first entry is added by Feature 069
- `WorldData` gains an `upgrades: ShipUpgrade[]` field; `WorldParser` reads the file;
  `world-data.ts` gains a `getUpgrade(id)` lookup function
- `PlayerState` gains `installUpgrade`, `setUpgradeEnabled`, `isUpgradeInstalled`,
  `isUpgradeEnabled`, and `getInstalledUpgrades` methods (see Technical notes for signatures)
- The global menu gains a `SHIP` entry placed below `REPUTATION`; selecting it opens
  `ShipUpgradesScene`
- With no upgrades installed, `ShipUpgradesScene` shows a single non-selectable row
  `NO UPGRADES INSTALLED`
- With upgrades installed, each appears as a row showing the upgrade name and its `ON` or
  `OFF` state; selecting a row immediately toggles the enabled state and the label reflects
  the new value
- `[1] BACK` footer button and the BACK action return to the global menu
- Unit tests cover `installUpgrade`, `setUpgradeEnabled`, `isUpgradeEnabled`, and
  `getInstalledUpgrades` on `PlayerState`
- `npm test` passes; `npx tsc --noEmit` produces zero errors

---

## Out of scope

- Docking computer world-data entry (Feature 069)
- Ship dealer purchase scene (Feature 069)
- Any in-game effect driven by upgrade enabled/disabled state (Feature 069 and beyond)

---

## Technical notes

### World data — `docs/world/ships/components/ship-upgrades.md`

New list-format YAML file following the pattern of `jump-drives.md`. Schema:

```yaml
upgrades:
  - id: string
    name: string
    description: string   # one sentence
    cost: number          # credits
```

File starts with `upgrades: []`.

New TypeScript interface in `src/game/world/types.ts`:

```typescript
interface ShipUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
}
```

`WorldData` gains `upgrades: ShipUpgrade[]`. `WorldParser` gains a method to parse the file.
`world-data.ts` gains `getUpgrade(id: string): ShipUpgrade | undefined`.

### PlayerState changes

Add `private _installedUpgrades: Map<string, boolean>`, initialised to an empty map in the
constructor.

Public method signatures:

```typescript
installUpgrade(id: string): void
  // Adds an entry with enabled = true. No-op if already installed.

setUpgradeEnabled(id: string, enabled: boolean): void
  // Updates the enabled flag. No-op if not installed.

isUpgradeInstalled(id: string): boolean

isUpgradeEnabled(id: string): boolean
  // Returns false when the upgrade is not installed.

getInstalledUpgrades(): ReadonlyArray<{ id: string; enabled: boolean }>
```

### Global menu routing

`game.ts → buildMenuEntries()` gains a `SHIP` entry added after `REPUTATION`, pointing to a new
`goToShipUpgrades()` method. `ShipUpgradesScene` follows the same back-navigation and
return-to-game-scene pattern as `ReputationScene` and `MissionLogScene`: `onBack` returns to
the global menu; `onReturn` returns to the underlying game scene.

### ShipUpgradesScene

New file `src/game/scenes/ship-upgrades-scene.ts`, extending `BaseMenuScene`.

The displayed items must reflect the live state of `player.getInstalledUpgrades()` after each
toggle — label content (ON/OFF) changes on activation. `BaseMenuScene._staticItems` is private
and cannot be mutated by a subclass; the Engineer should override `get items()` to derive the
array on every access, or use the single-tab mechanism (one mutable tab whose items array is
updated on each toggle).

Each row action calls `player.setUpgradeEnabled(id, !currentlyEnabled)` then triggers a
re-render.

> suggestion: Row format — upgrade name left-aligned, state right-aligned to near column 38.
> Example: `DOCKING COMPUTER       [ON ]` / `DOCKING COMPUTER       [OFF]`

---

## Play-test instructions

### Browser (`npm run dev`)

1. Open the global menu — confirm `SHIP` appears below `REPUTATION`.
2. Select `SHIP` — confirm the SHIP screen opens and shows `NO UPGRADES INSTALLED`
   (no upgrades are purchasable until Feature 069).
3. Press `[1] BACK` — confirm return to the global menu.
4. From the global menu, select `[2] GAME` — confirm return to the underlying game scene.

Full toggle behaviour (ON ↔ OFF) is covered by unit tests and verified end-to-end in
Feature 069 once upgrades can be purchased.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

None
