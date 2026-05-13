---
type: object
properties:
  id:
    type: string
  name:
    type: string
  leaders:
    type: array
    items:
      type: string
  home_system:
    type: string
  size:
    enum:
      - small
      - medium
      - large
  danger_level:
    enum:
      - none
      - low
      - medium
      - high
      - extreme
  player_knowledge:
    enum:
      - public
      - private
  economy:
    type: array
    items:
      type: string
  tags:
    type: array
    items:
      type: string
required:
  - id
  - name
---

# Faction Name

_Short summary of the faction. One paragraph._

## Notable events (optional)

_Major events in their history like wars, systems they took over, business deals, etc._

## Governance (optional)

_How the faction is run_

## Reputation (optional)

_Summary of what others think of them._
