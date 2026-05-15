# 021 · Writer Role — DONE

## What it added
Defined the Writer agent role with full instructions (tone guide, doc type responsibilities, cross-reference checklist, narrative rules) and added it to CLAUDE.md. Also updated all four system docs in `docs/world/systems/` with `map_position` fields required by feature 023, and produced the full specs for features 022 and 023.

## Key files
- `docs/agent/roles/WRITER.md` — Writer role instructions
- `CLAUDE.md` — updated to list seven roles; added `build:docs`, `build:map`, `build:all` commands
- `docs/world/systems/*.md` — `map_position` fields added to all four system docs
- `docs/features/022-world-docs-publisher.md` — produced as output of this session
- `docs/features/023-galaxy-map.md` — produced as output of this session

## Architectural decisions embedded
- Documentation-only feature; no code changes.
