# 025 · Randomise Station Star Patterns — SUPERSEDED

This spec was superseded and replaced by the revised `025-overhaul-star-field-display.md`.

The original approach (passing a random seed from the orchestrator to `ShipScene`) was
dropped after feature 036 replaced `ShipScene` with `ShipCockpitScene`. The revised spec
derives the starfield pattern deterministically from the destination ID instead, removing
the need for orchestrator seed state entirely.
