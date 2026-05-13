---
routes:
  # Core Routes — stable, high-security corridors
  - from: sol
    to: alpha-centauri
    distance: 4.3
    stability: stable
    security: high

  # Sol to Frontier
  - from: sol
    to: barnards-star
    distance: 5.9
    stability: stable
    security: medium

  - from: sol
    to: wolf-359
    distance: 7.9
    stability: unstable
    security: low

  # Cross-Frontier
  - from: alpha-centauri
    to: barnards-star
    distance: 4.1
    stability: stable
    security: medium

  - from: barnards-star
    to: wolf-359
    distance: 3.1
    stability: unstable
    security: low
---

# Jump Routes

Established navigation corridors recognised by civilian navigation systems.

All routes are bidirectional — the game treats a listed route as traversable
in both directions. Distances are in light years. Stability affects jump
success chance and travel time variance; security indicates patrol coverage.

## Route Network (starting systems)

```
         SOL ——(4.3)—— ALPHA CENTAURI
          |  \              |
        (5.9) (7.9)       (4.1)
          |      \          |
     BARNARD'S   WOLF 359 ——+
      STAR  ——(3.1)——/
```

## Route Properties

| From | To | Distance (LY) | Stability | Security |
|---|---|---|---|---|
| Sol | Alpha Centauri | 4.3 | stable | high |
| Sol | Barnard's Star | 5.9 | stable | medium |
| Sol | Wolf 359 | 7.9 | unstable | low |
| Alpha Centauri | Barnard's Star | 4.1 | stable | medium |
| Barnard's Star | Wolf 359 | 3.1 | unstable | low |

## Notes

Routes to undiscovered systems will be added to this file as the game world
expands. Only systems with a doc in `docs/world/systems/` should be referenced
here — no orphan route entries.
