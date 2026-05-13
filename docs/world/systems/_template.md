---
type: object
properties:
  id:
    type: string
  name:
    type: string
  star_type:
    type: string
  distance_from_sol:
    type: number
  population:
    enum:
      - none
      - low
      - medium
      - high
  security:
    enum:
      - none
      - low
      - medium
      - high
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
  destinations:
    type: array
    items:
      type: string
  factions:
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
  - distance_from_sol
---

# System Name

_Short summary of the system. One paragraph._

## Notable bodies

_Planets and features (i.e. astroid belts) in the system_

### Body name

_One or two line summary of tbe body._

## Notable destinations

_Stations, ports and other visitable locations in the system._

### Destination name

_One or two line summary of the station._

## Governance (optional)

_Leadership of the system and the competing factions._

## History (optional)

_Background of the discovery and development of the system_

## Local reputation (optional)

_Summary of travellers and local residents opinion of the system and its people that might influence your choices._
