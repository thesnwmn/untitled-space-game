# Feature 059 · Space Navigation Mini-Game

## Goal

A momentum-driven obstacle-avoidance mini-game where the player pilots a ship through a
field of drifting objects, covering a fixed distance without collision.

---

## Acceptance criteria

- Mini-game registered in `miniGameRegistry` with `id: 'navigation'`; corresponding entry
  in `miniGameDescriptors`
- Factory accepts params `type` (`'asteroid_belt' | 'space_debris' | 'space_storm'`,
  default `'asteroid_belt'`) and `difficulty` (`'easy' | 'normal' | 'hard'`, default
  `'normal'`)
- Registered with three variants: `asteroid_belt`, `space_debris`, `space_storm`; each
  variant's params set `type` and `difficulty: 'normal'`
- The mini-game uses the full content area viewport (no fixed `canvasWidth`/`canvasHeight`)
- On load, the player ship glyph is rendered horizontally centred in the lower third of the
  viewport
- Arrow key input uses the momentum model: each discrete key event applies a velocity
  impulse in the pressed direction, first zeroing any velocity in the opposite direction
  before adding the impulse; velocity is capped to per-axis maximums from balance settings
- The game world advances at a minimum base scroll speed (difficulty-parameterised);
  pressing DOWN reduces the player's forward velocity toward this floor but cannot stop
  it; pressing UP adds speed above the floor; the camera tracks the player's world Y,
  keeping them in approximately the lower third of the viewport
- The player cannot enter a top buffer zone (approximately 4 rows from the content area
  top); if the player drifts below the bottom edge of the content area the game ends in
  failure immediately
- Obstacles spawn ahead of the player and periodically at the left/right edges of the
  viewport; at least three visual styles are defined, one per event type (asteroids: round
  and chunky; debris: angular and thin; storm: sparse punctuation)
- Large obstacles span up to 20 chars wide and up to 5 rows tall; obstacle shapes are
  stored as arrays of relative cell offsets; obstacles drift laterally or backward
  (`driftVy ≤ 0` in world space) — obstacles may never drift in the player's forward
  direction
- Obstacles do not collide with each other
- Collision is detected per-character: when any rendered obstacle cell occupies the same
  integer `(col, row)` as the player ship cell, collision is triggered — the player ship
  flashes briefly (300–500 ms) then the game calls
  `complete({ outcome: 'completed', result: { score: 0 } })`
- When the player's world Y reaches `targetDistance`, the game calls
  `complete({ outcome: 'completed', result: { score: 100 } })` after a brief success
  display (≈500 ms)
- Pressing the MENU action during play calls
  `complete({ outcome: 'skipped' })` immediately
- A minimal HUD row at the top of the content area shows a progress bar and remaining
  distance (not a chrome header — rendered inside the game viewport); this row is excluded
  from the obstacle spawn and collision zones
- All balance parameters are read from `GameBalance.miniGames.navigation`
- `GameBalance.miniGames` sub-section `navigation` is added by this feature to the type
  in `src/game/world/types.ts` and to `docs/world/settings/balance.md`; the sub-section
  must not require changes to Feature 058's top-level keys or Features 055–057's
  sub-sections
- `npm test` passes; `npx tsc --noEmit` produces zero errors
- Tests cover: momentum model (opposite-direction cancellation, speed clamping); `driftVy
  ≤ 0` enforced on obstacle construction; collision detection (matching cell = hit,
  adjacent cell = no hit); HUD row excluded from collision zone; despawn when trailing off
  screen; `complete()` not called twice

---

## Out of scope

- Intermediate scores (near-miss penalty) — score is binary (100 for success, 0 for
  collision)
- Obstacle-to-obstacle collisions
- Applying game consequences to `PlayerState` — the caller handles that via
  `MiniGameResult`
- The main-game jump trigger (Feature 060)

---

## Technical notes

### Physics model

Two coordinate spaces are used:

**World space** — `playerWorldPos: { x: number, y: number }` where `y` increases in the
forward (upward) direction. All obstacles and the player share this space.

**Camera** — `cameraScrollY: number` tracks how far the world has scrolled. Each frame it
advances by at least `minScrollSpeed` (difficulty-derived); the player's effective forward
speed is `Math.max(playerVel.y, minScrollSpeed)`. The camera is computed as
`playerWorldPos.y − viewport.height × playerRowPreference`, clamped never to decrease.
The player's screen row = `viewport.top + round(playerWorldPos.y − cameraScrollY)`.

**Input impulse model**: on each discrete key event, for the affected axis — if current
velocity opposes the pressed direction, clamp that component to zero first; then add the
impulse; then clamp to the per-axis maximum.

**Forward floor**: after input, the effective Y used for position update is
`Math.max(playerVel.y, minScrollSpeed)`. `playerVel.y` itself can go negative (player
presses DOWN), but the position always advances.

**Victory**: `playerWorldPos.y >= targetDistance` (evaluated each frame after position
update).

**Failure**: player's screen row exceeds `viewport.top + viewport.height - 1`.

### Obstacle data structure

```typescript
interface ObstacleCell {
  dcol: number;
  drow: number;
  char: string;
  color: Color;
}

interface Obstacle {
  worldX: number;
  worldY: number;
  driftVx: number;
  driftVy: number;  // must be ≤ 0 — enforced on construction
  cells: ObstacleCell[];
  size: 'large' | 'medium' | 'small';
}
```

Screen position of cell: `screenCol = obstacle.worldX + cell.dcol`,
`screenRow = viewport.top + round(obstacle.worldY + cell.drow − cameraScrollY)`.

### Spawning strategy

**Lead spawn**: as `cameraScrollY` advances, maintain a `spawnFrontierY` just above the
visible area. When the frontier falls within the viewport, push it forward and seed new
obstacles into the revealed band until obstacle density in that band reaches the
difficulty target. `worldX` is sampled randomly within the viewport width minus obstacle
width.

**Edge spawn**: on a difficulty-parameterised interval, spawn one obstacle at
`worldX = −obstacleWidth` (drifting right) or `worldX = viewport.width` (drifting left),
at a `worldY` near or slightly ahead of the player.

**Despawn**: remove obstacles whose entire rendered extent falls below
`viewport.top + viewport.height + 2`.

### Collision check

Each frame, after position update: for each active obstacle, compute each cell's screen
position. If any cell matches the player's screen position (integer equality), trigger
failure. Cells that render onto the HUD row (`viewport.top`) are skipped for both
rendering and collision.

### Obstacle character sets

> suggestion  
**Asteroid large**: `#`, `@`, `O` in compact round shapes; `white`  
**Asteroid small/medium**: single chars `o`, `*`, `@`; `bright-white`  
**Debris large**: `=`, `-`, `[`, `]` in flat angular shapes; `bright-black`  
**Debris small/medium**: single chars `+`, `=`, `-`, `/`, `\`; `bright-black`  
**Storm**: single chars `.`, `'`, `` ` ``, `,`; `cyan`

Player ship: `^`; `bright-green`. Collision flash: `bright-red`.

### HUD

> suggestion  
Row `viewport.top`, rendered over the game world:
```
DIST [████████████░░░░░░░░] 512u
```
Progress bar fills proportionally to `playerWorldPos.y / targetDistance`.

### Balance — `GameBalance.miniGames.navigation`

Add to the `miniGames` object in `src/game/world/types.ts` (as an optional sub-object
so it can be omitted from existing tests) and to `docs/world/settings/balance.md`:

```typescript
navigation: {
  ship: {
    accelerationImpulse: number;   // velocity delta per key press
    maxSpeedLateral: number;       // max horizontal speed
    maxSpeedForward: number;       // max forward speed above base
    playerRowPreference: number;   // 0–1; preferred player row as fraction of viewport height
    topBufferRows: number;         // rows from viewport.top the player cannot enter
  };
  difficulties: {
    easy:   NavigationDifficulty;
    normal: NavigationDifficulty;
    hard:   NavigationDifficulty;
  };
  eventTypes: {
    asteroidBelt: NavigationEventType;
    spaceDebris:  NavigationEventType;
    spaceStorm:   NavigationEventType;
  };
};

interface NavigationDifficulty {
  baseScrollSpeed: number;
  minScrollSpeed: number;
  obstacleDensity: number;          // target obstacles per viewport-height band
  edgeSpawnIntervalFrames: number;
  driftSpeedMax: number;
  targetDistance: number;
}

interface NavigationEventType {
  largeRatio:  number;
  mediumRatio: number;
  smallRatio:  number;              // must sum to 1.0
}
```

Default values for `docs/world/settings/balance.md`:

```yaml
navigation_minigame:
  ship:
    acceleration_impulse: 0.4
    max_speed_lateral: 2.0
    max_speed_forward: 3.0
    player_row_preference: 0.67
    top_buffer_rows: 4
  difficulties:
    easy:
      base_scroll_speed: 0.3
      min_scroll_speed: 0.2
      obstacle_density: 0.5
      edge_spawn_interval_frames: 120
      drift_speed_max: 0.2
      target_distance: 300
    normal:
      base_scroll_speed: 0.5
      min_scroll_speed: 0.35
      obstacle_density: 0.8
      edge_spawn_interval_frames: 80
      drift_speed_max: 0.4
      target_distance: 400
    hard:
      base_scroll_speed: 0.8
      min_scroll_speed: 0.55
      obstacle_density: 1.3
      edge_spawn_interval_frames: 50
      drift_speed_max: 0.7
      target_distance: 500
  event_types:
    asteroid_belt:
      large_ratio: 0.25
      medium_ratio: 0.40
      small_ratio: 0.35
    space_debris:
      large_ratio: 0.08
      medium_ratio: 0.25
      small_ratio: 0.67
    space_storm:
      large_ratio: 0.00
      medium_ratio: 0.10
      small_ratio: 0.90
```

### Affected files

- `src/game/mini-games/navigation-mini-game.ts` — new, the mini-game scene
- `src/game/mini-games/navigation-mini-game.test.ts` — new, unit tests
- `src/game/mini-games/registry.ts` — three entries appended to both arrays
- `src/game/world/types.ts` — `NavigationDifficulty`, `NavigationEventType`, and
  `navigation` sub-section added to `GameBalance.miniGames`
- `docs/world/settings/balance.md` — `navigation_minigame` block added

---

## Play-test instructions

### Browser (`npm run dev:mini-games`)

1. Load the harness index — confirm `navigation` appears with three variant links.
2. Open `asteroid_belt` — confirm the player ship appears at bottom centre; obstacles
   appear above and scroll downward; the HUD progress bar is at the top.
3. Press UP several times — confirm forward acceleration; progress bar fills.
4. Press RIGHT then LEFT quickly — confirm lateral momentum cancels before reversing.
5. Press DOWN repeatedly — confirm forward speed reduces but the world still scrolls.
6. Allow the ship to drift off the bottom edge — confirm collision failure and
   `{ outcome: 'completed', result: { score: 0 } }` in the result overlay.
7. Replay and navigate the full distance — confirm
   `{ outcome: 'completed', result: { score: 100 } }` in the result overlay.
8. Press MENU mid-game — confirm `{ outcome: 'skipped' }` in the result overlay.
9. Repeat with `space_debris` and `space_storm` — confirm distinct obstacle character sets.

### Terminal (`bun run terminal-mini-games.ts navigation`)

Repeat all steps using keyboard arrows and MENU key.

---

## Dependencies

Feature 048 (Mini-Game Base Scene), Feature 049 (Mini-Game Dev Harness)
