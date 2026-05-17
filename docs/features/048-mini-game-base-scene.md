# Feature 048 · Mini-Game Base Scene

## Goal

Introduce `BaseMiniGameScene` as the universal base for all mini games, providing standard
screen chrome, optional viewport centering, result reporting back to the calling scene, and a
registry of descriptors used by the dev harness.

---

## Acceptance criteria

- `MiniGameResult`, `MiniGameViewport`, `MiniGameVariant`,
  `MiniGameDescriptorMeta`, and `MiniGameOptions` types exist in `src/shared/types.ts`
- `BaseMiniGameScene` abstract class exists in `src/game/scenes/base-mini-game-scene.ts`,
  extending `BaseScene`
- `BaseMiniGameScene` receives `PlayerState` as a constructor argument; it is accessible to
  subclasses as `protected readonly player` (read-only reference — mini games must not mutate state)
- `BaseMiniGameScene` accepts optional `canvasWidth` and `canvasHeight` in `MiniGameOptions`;
  when provided, the declared canvas is centred within the chrome-bounded content area both
  horizontally and vertically
- When `canvasWidth`/`canvasHeight` are omitted, `viewport` covers the full available content area
- `BaseMiniGameScene` implements `renderContent` from `BaseScene`; subclasses implement
  `renderGame(buffer, viewport)` — `renderContent` is not further overridable
- `BaseMiniGameScene` constructor accepts an optional `onComplete: (result: MiniGameResult) => void`
- `BaseMiniGameScene.complete(result)` invokes `onComplete` exactly once (guarded against
  double-call); if no callback is registered the call is a no-op
- `src/game/mini-games/registry.ts` exists, exporting `miniGameDescriptors` (pure-data array,
  initially empty) and `miniGameRegistry` (includes factory functions, initially empty)
- `MiniGameEntry` type is exported from the registry file
- `npm test` passes; `npx tsc --noEmit` produces zero errors
- A test file `src/game/scenes/base-mini-game-scene.test.ts` covers: viewport equals full area
  when no canvas size given; viewport is correctly centred when canvas size is smaller than
  content area; `complete()` calls `onComplete` once; second call to `complete()` is a no-op;
  `complete()` with no callback does not throw

---

## Out of scope

- Any concrete mini game implementation
- The dev harness entry points and build pipeline (Feature 049)
- Mutation of `PlayerState` by any mini game

---

## Technical notes

### New types in `src/shared/types.ts`

```typescript
type MiniGameResult =
  | { outcome: 'completed'; result: Record<string, unknown> }
  | { outcome: 'skipped' };

interface MiniGameViewport {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface MiniGameVariant {
  id: string;
  label: string;
  params: Record<string, string>;
}

interface MiniGameDescriptorMeta {
  id: string;
  name: string;
  description: string;
  variants?: MiniGameVariant[];
}

interface MiniGameOptions {
  navOptions: ReadonlyArray<NavOption>;  // imported from screen-chrome.ts
  title?: string;
  canvasWidth?: number;   // must be ≤ 40 if provided
  canvasHeight?: number;
  onComplete?: (result: MiniGameResult) => void;
}
```

### `BaseMiniGameScene` public interface

```typescript
abstract class BaseMiniGameScene extends BaseScene {
  protected readonly player: PlayerState;

  constructor(
    input: InputHandler,
    context: GameContext,
    player: PlayerState,
    options: MiniGameOptions
  )

  protected abstract renderGame(buffer: CharBuffer, viewport: MiniGameViewport): void;
  protected complete(result: MiniGameResult): void;
}
```

`BaseMiniGameScene` passes `{ navOptions, title }` through to `BaseScene` and implements
`renderContent(buffer, top, bottom)`. That method computes `viewport` and delegates to
`renderGame` — subclasses do not override `renderContent`.

**Centering arithmetic:** `viewport.width = canvasWidth ?? (buffer width)`; `viewport.height =
canvasHeight ?? (bottom - top)`. `viewport.left = Math.floor((width - viewport.width) / 2)`;
`viewport.top = top + Math.floor((bottom - top - viewport.height) / 2)`. Clamp so the
viewport never extends past the buffer edges.

**`complete()` guard:** A private `_completed` boolean is set to `true` on the first call.
Subsequent calls return immediately without invoking `onComplete` again.

### Registry (`src/game/mini-games/registry.ts`)

```typescript
// Pure data — safe to import from Bun build scripts and terminal harness
export const miniGameDescriptors: MiniGameDescriptorMeta[] = [];

// Includes factory functions — import only from browser/terminal runners
export interface MiniGameEntry {
  meta: MiniGameDescriptorMeta;
  factory: (
    input: InputHandler,
    context: GameContext,
    player: PlayerState,
    params: URLSearchParams | Record<string, string>,
    onComplete?: (result: MiniGameResult) => void
  ) => BaseMiniGameScene;
}
export const miniGameRegistry: MiniGameEntry[] = [];
```

Both arrays are initially empty. When a mini game is added in a future feature, its Engineer
appends one entry to each array.

`miniGameDescriptors` and `miniGameRegistry` are parallel: entry `i` in the registry
corresponds to entry `i` in the descriptors list (same `id`). The runner looks up by `id`
using a linear find.

---

## Play-test instructions

No playable content is added by this feature. Verify via `npm test` and
`npx tsc --noEmit`.

---

## Dependencies

Feature 046 (Base Scene Architecture)
