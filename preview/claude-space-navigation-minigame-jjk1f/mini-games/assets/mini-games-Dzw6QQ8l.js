(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function i(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(t){if(t.ep)return;t.ep=!0;const o=i(t);fetch(t.href,o)}})();const ee=40,ce=30,Xn=50,ke=24;function Jn(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class Qn{constructor(){this.charW=0,this.charH=0,this.gridH=ce,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(ee),this.pre.dataset.gridRows=String(ce),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${ke}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${ke}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const i=n.getBoundingClientRect();document.body.removeChild(n),this.charW=i.width,this.charH=i.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(ee*this.charW),window.innerHeight/(ce*this.charH)),i=Math.max(ce,Math.min(Xn,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${ke*n}px`,this.pre.style.width=`${ee*this.charW*n}px`,i!==this.gridH){this.gridH=i,this.pre.dataset.gridRows=String(i);for(const r of this.resizeHandlers)r(ee,i)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const i=[];for(const r of n){let t="";for(const o of r){const a=o.fg!=="transparent"?`fg-${o.fg}`:"",s=o.bg!=="transparent"?`bg-${o.bg}`:"",l=a&&s?`${a} ${s}`:a||s,c=l?` class="${l}"`:"";t+=`<span${c}>${Jn(o.char)}</span>`}i.push(t)}this.pre.innerHTML=i.join(`
`)}getWidth(){return ee}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}destroy(){this.pre.remove()}}const Zn={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",m:"MENU",M:"MENU",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},ei=new Set(["0","1","2","3","4","5","6","7","8","9"]),ni=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class ii{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.touchTrackHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerMoveListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const i=document.createElement("div");i.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(i),this.debugEl=i}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}onTouchTrack(n){this.touchTrackHandlers.push(n)}connect(){this.keyListener=n=>{if(ni.has(n.key)&&n.preventDefault(),ei.has(n.key))for(const r of this.charInputHandlers.slice())r(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const r of this.charInputHandlers.slice())r("\b");return}const i=Zn[n.key];if(i)for(const r of this.actionHandlers.slice())r(i)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{if(n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`),this.touchTrackHandlers.length>0){const i=this.getGridCoordsForTrack(n.clientX,n.clientY);if(i)for(const r of this.touchTrackHandlers.slice())r.start(i.col,i.row,n.pointerId)}},this.pointerMoveListener=n=>{if(this.pointerStartMap.has(n.pointerId)&&this.touchTrackHandlers.length>0){const i=this.getGridCoordsForTrack(n.clientX,n.clientY);if(i)for(const r of this.touchTrackHandlers.slice())r.move(i.col,i.row,n.pointerId)}},this.pointerUpListener=n=>{const i=this.pointerStartMap.get(n.pointerId),r=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),this.touchTrackHandlers.length>0)for(const l of this.touchTrackHandlers.slice())l.end(n.pointerId);if(!i){this.logDebug(`UP id=${n.pointerId} NO START`);return}const t=n.clientX-i.startX,o=n.clientY-i.startY,a=Math.abs(t),s=Math.abs(o);if(a<20&&s<20)if(r>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(i.startX,i.startY);if(c){this.logDebug(`TAP (${Math.round(i.startX)},${Math.round(i.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const d of this.tapHandlers.slice())d(c.col,c.row)}else this.logDebug(`TAP (${Math.round(i.startX)},${Math.round(i.startY)}) rect=${l} -> OOB`)}else{if(this.touchTrackHandlers.length>0){this.logDebug(`DRAG-END (joystick) dx=${Math.round(t)} dy=${Math.round(o)} -> suppressed`);return}let l;a>=s?l=t>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(t)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=n=>{if(this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),this.touchTrackHandlers.length>0)for(const i of this.touchTrackHandlers.slice())i.end(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointermove",this.pointerMoveListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerMoveListener&&(window.removeEventListener("pointermove",this.pointerMoveListener),this.pointerMoveListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const i=n.getBoundingClientRect();return`L${Math.round(i.left)},T${Math.round(i.top)},R${Math.round(i.right)},B${Math.round(i.bottom)}`}getGridCoords(n,i){const r=document.querySelector(".game-screen");if(!r)return null;const t=r.getBoundingClientRect(),o=parseInt(r.dataset.gridCols??"1"),a=parseInt(r.dataset.gridRows??"1");if(!o||!a||!t.width||!t.height)return null;const s=Math.floor((n-t.left)/(t.width/o)),l=Math.floor((i-t.top)/(t.height/a));return s<0||s>=o||l<0||l>=a?null:{col:s,row:l}}getGridCoordsForTrack(n,i){const r=document.querySelector(".game-screen");if(!r)return null;const t=r.getBoundingClientRect(),o=parseInt(r.dataset.gridCols??"1"),a=parseInt(r.dataset.gridRows??"1");if(!o||!a||!t.width||!t.height)return null;const s=Math.floor((n-t.left)/(t.width/o)),l=Math.floor((i-t.top)/(t.height/a));return{col:s,row:l}}}let Me=null;function ti(e){Me=e}function D(){if(Me===null)throw new Error("World not initialised — call initWorld() before accessing world data");return Me}function ri(e){return D().systems.find(n=>n.id===e)}function oi(e){return D().destinations.find(n=>n.id===e)}function ai(){return D().settings}function ne(){return D().balance}function xe(e){return D().ships.find(n=>n.id===e)}function si(e){return D().commodities.find(n=>n.id===e)}function li(e){return e.reduce((n,i)=>{const r=si(i.commodityId);return n+i.qty*((r==null?void 0:r.weightKg)??0)},0)}const ci=`---
commodities:
  # Raw Materials — found near mining / frontier systems
  - id: iron-ore
    name: Iron Ore
    base_price: 80
    category: raw-material
    legal: true
    weight_kg: 40
    description: Unrefined iron extracted from asteroid fields and planetary crust.

  - id: rare-earth
    name: Rare Earth Elements
    base_price: 400
    category: raw-material
    legal: true
    weight_kg: 20
    description: High-value minerals essential for electronics and drive components.

  - id: deuterium
    name: Deuterium Crystals
    base_price: 200
    category: raw-material
    legal: true
    weight_kg: 12
    description: Refined hydrogen isotope used in jump drive fuel production.

  # Manufactured Goods — found near industrial / trade systems
  - id: refined-metals
    name: Refined Metals
    base_price: 220
    category: manufactured
    legal: true
    weight_kg: 32
    description: Processed alloys ready for ship construction and infrastructure work.

  - id: ship-components
    name: Ship Components
    base_price: 650
    category: manufactured
    legal: true
    weight_kg: 60
    description: Drive housings, hull panels, sensor arrays — standard replacement parts.

  - id: electronics
    name: Consumer Electronics
    base_price: 500
    category: manufactured
    legal: true
    weight_kg: 8
    description: Commercial-grade devices popular across populated stations.

  # Consumables — available at most stations
  - id: rations
    name: Ration Packs
    base_price: 60
    category: consumable
    legal: true
    weight_kg: 4
    description: Bulk-packaged food supplies for crew and colony populations.

  - id: medical-supplies
    name: Medical Supplies
    base_price: 350
    category: consumable
    legal: true
    weight_kg: 8
    description: Pharmaceuticals, surgical kits and diagnostic equipment.

  - id: fuel-cells
    name: Fuel Cells
    base_price: 180
    category: consumable
    legal: true
    weight_kg: 16
    description: Pre-charged energy cells for ship systems and surface equipment.

  # Contraband — found near lawless systems; illegal in Core Space
  - id: combat-stims
    name: Combat Stimulants
    base_price: 900
    category: contraband
    legal: false
    weight_kg: 2
    description: Performance-enhancing compounds banned under Union health codes.

  - id: black-box-data
    name: Black Box Data
    base_price: 1500
    category: contraband
    legal: false
    weight_kg: 1
    description: Encrypted nav logs and sensor recordings from destroyed vessels.

  - id: grey-market-tech
    name: Grey Market Tech
    base_price: 1200
    category: contraband
    legal: false
    weight_kg: 10
    description: Unlicensed ship modifications — transponder masks, reactor overrides.
---

# Commodities

The interstellar economy runs on the movement of goods between systems
that produce them and stations that need them.

Prices listed are base values — actual trading prices shift with system
supply, demand, and the goods_bias of the local station. Contraband
commands high prices in core systems but drawing attention to yourself
is a risk all its own.
`,di=`---
delivery_items:
  # Lightweight — data, documents, specimens (5–15 kg)
  - id: encrypted-data-core
    name: Encrypted Data Core
    weight_kg: 5

  - id: diplomatic-pouch
    name: Diplomatic Pouch
    weight_kg: 8

  - id: biological-specimen
    name: Biological Specimen (Sealed)
    weight_kg: 12

  - id: navigation-charts
    name: Navigation Charts (Classified)
    weight_kg: 6

  # Mid-weight — supplies, equipment, parts (20–80 kg)
  - id: medical-supplies-crate
    name: Medical Supplies Crate
    weight_kg: 35

  - id: replacement-drive-coil
    name: Replacement Drive Coil
    weight_kg: 48

  - id: survey-equipment
    name: Survey Equipment Package
    weight_kg: 60

  - id: sealed-ration-shipment
    name: Sealed Ration Shipment
    weight_kg: 28

  - id: engineering-toolkit
    name: Engineering Toolkit
    weight_kg: 22

  - id: pharmaceutical-batch
    name: Pharmaceutical Batch
    weight_kg: 18

  # Heavy — machinery, hardware, industrial (90–200 kg)
  - id: mining-drill-head
    name: Mining Drill Head
    weight_kg: 120

  - id: reactor-shielding-plate
    name: Reactor Shielding Plate
    weight_kg: 180

  - id: atmospheric-processor-unit
    name: Atmospheric Processor Unit
    weight_kg: 155

  - id: military-hardware-crate
    name: Military Hardware Crate
    weight_kg: 200
---
`,hi=`---
type: object
properties:
  id:
    type: string
    description: kebab-case identifier, matches filename
  name:
    type: string
  system:
    type: string
    description: system id — must resolve to a system doc
  location_type:
    enum:
      - orbital      # space station in orbit around a body
      - surface      # port on a planet or moon surface
      - asteroid     # installation inside or on an asteroid
      - deep-space   # remote installation, not orbiting a body
  type:
    enum:
      - civilian
      - military
      - black-market
      - research
  amenities:
    type: object
    properties:
      trader:
        type: boolean
        description: buy/sell commodities
      ship_repair:
        type: boolean
        description: repair hull damage
      fuel:
        type: boolean
        description: refuel jump drive
      ship_dealer:
        type: boolean
        description: buy or trade ships
    required:
      - trader
      - ship_repair
      - fuel
      - ship_dealer
  min_missions:
    type: number
    description: guaranteed minimum missions generated when docked
  mission_chance:
    type: number
    description: probability (0.0-1.0) of generating additional missions after minMissions
  npcs:
    type: object
    description: only include an entry if the corresponding amenity is true
    properties:
      trader:
        type: string
        description: display name of the trader NPC
      ship_dealer:
        type: string
        description: display name of the ship dealer NPC
  danger_level:
    enum:
      - none
      - low
      - medium
      - high
      - extreme
  tags:
    type: array
    items:
      type: string
required:
  - id
  - name
  - system
  - location_type
  - type
  - amenities
  - min_missions
  - mission_chance
---

# Destination Name

_One or two paragraphs describing the destination's atmosphere, layout and character._

_What does it feel like to dock or land here? Who hangs around?_
`,ui=`---
id: blackwake-yard
name: Blackwake Yard
system: wolf-359
location_type: orbital
type: black-market
owning_faction: grey-market-cartel

amenities:
  trader: false
  ship_repair: true
  fuel: true
  ship_dealer: false
min_missions: 0
mission_chance: 0.0

danger_level: high
tags:
  - illegal-mods
  - cartel-security
  - off-registry
---

# Blackwake Yard

_Illegal modification facility. Reactor tampering, military surplus
retrofits, hull transponder resets. Officially does not exist._
`,pi=`---
id: ceti-landfall
name: Ceti Landfall
system: tau-ceti
location_type: surface
type: civilian
owning_faction: eridani-colonial-council

amenities:
  trader: true
  ship_repair: false
  fuel: true
  ship_dealer: true
min_missions: 2
mission_chance: 0.75

npcs:
  trader: Broker Senne
  ship_dealer: Agent Oxa

danger_level: none
tags:
  - surface-port
  - agricultural
  - colonial
---

# Ceti Landfall

_Surface port on Ceti Prime's agricultural plateau. Practical haulers and surface-capable freighters. Ship repairs not available — Waypoint Ceti handles structural work._
`,mi=`---
id: drift-market
name: Drift Market
system: wolf-359
location_type: orbital
type: black-market
owning_faction: grey-market-cartel

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: true
min_missions: 0
mission_chance: 0.65

npcs:
  trader: The Quartermaster
  ship_dealer: The Fence

danger_level: high
tags:
  - lawless
  - no-questions-asked
  - contraband
---

# Drift Market

_Sprawling patchwork station assembled from salvaged hull sections.
Almost anything can be purchased here. No registry checks, no customs._
`,fi=`---
id: elysium-station
name: Elysium Station
system: sol
location_type: orbital
type: civilian
owning_faction: helios-directorate

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: false
min_missions: 2
mission_chance: 0.75

npcs:
  trader: Merchant Kess

danger_level: low
tags:
  - starter
  - mid-orbit
  - relaxed-docking
---

# Elysium Station

A mid-sized civilian port in Earth orbit, popular with independent pilots
for its relaxed docking procedures and accessible trader quarter.

Unlike the corporate efficiency of Galileo Transfer or the military
restrictions of Tycho Orbital, Elysium runs on a quiet confidence — it
isn't the biggest station in Sol, but its managers know how to keep
captains happy and coming back. Merchant Kess runs the only licensed
trading floor, stocking a dependable rotation of goods sourced from
across the Core Routes.
`,gi=`---
id: eridani-anchorage
name: Eridani Anchorage
system: epsilon-eridani
location_type: asteroid
type: civilian
owning_faction: eridani-colonial-council

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: false
min_missions: 2
mission_chance: 0.75

npcs:
  trader: Warden Fleck

danger_level: low
tags:
  - mining-support
  - belt-station
  - council-run
  - industrial
---

# Eridani Anchorage

_Independent belt station run by the Eridani Colonial Council. Mining support, honest repairs, and contracts that don't require Union paperwork._
`,yi=`---
id: foundries-platform
name: Foundries Platform
system: sirius
location_type: asteroid
type: civilian
owning_faction: helios-directorate

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: false
min_missions: 2
mission_chance: 0.75

npcs:
  trader: Steward Karras

danger_level: low
tags:
  - industrial
  - manufacturing
  - works-permit-required
---

# Foundries Platform

_Interlocked manufacturing chain in Sirius's inner asteroid belt. Industrial contracts and raw materials. Works permit required — processing office is on Meridian Station._
`,_i=`---
id: galileo-transfer
name: Galileo Transfer Hub
system: sol
location_type: orbital
type: civilian
owning_faction: terran-union

amenities:
  trader: true
  ship_repair: false
  fuel: true
  ship_dealer: false
min_missions: 2
mission_chance: 0.75

npcs:
  trader: Broker Valdis

danger_level: low
tags:
  - busy
  - corporate
  - high-traffic
---

# Galileo Transfer Hub

_Primary civilian transport interchange between Earth and the outer system._
`,wi=`---
id: hestia-ring
name: Hestia Ring
system: alpha-centauri
location_type: orbital
type: civilian
owning_faction: centauri-trade-league

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: false
min_missions: 2
mission_chance: 0.75

npcs:
  trader: Runner Cho

danger_level: low
tags:
  - fast-turnaround
  - volume-trade
---

# Hestia Ring

_Large-scale civilian docking structure known for rapid turnaround. Low
fees and high volume — a favourite of freight haulers on tight schedules._
`,bi=`---
id: keelhaul-station
name: Keelhaul Station
system: epsilon-eridani
location_type: orbital
type: military
owning_faction: eridani-colonial-council

amenities:
  trader: false
  ship_repair: true
  fuel: true
  ship_dealer: true
min_missions: 0
mission_chance: 0.65

npcs:
  ship_dealer: Fleet Liaison Brek

danger_level: low
tags:
  - restricted
  - military
  - shipyard
  - licensed-only
---

# Keelhaul Station

_The Terran Union's outer-core shipyard. Capital-class construction bays, military-specification vessels, and access strictly gated behind Union contractor permits._
`,vi=`---
id: kepler-yard
name: Kepler Yard
system: barnards-star
location_type: orbital
type: civilian
owning_faction: independent-miners-guild

amenities:
  trader: false
  ship_repair: true
  fuel: true
  ship_dealer: true
min_missions: 0
mission_chance: 0.65

npcs:
  ship_dealer: Dealer Mast

danger_level: medium
tags:
  - shipbreaking
  - salvage
  - cheap-repairs
  - questionable-standards
---

# Kepler Yard

_Shipbreaking and salvage facility. Cheap repairs and a used-ship market.
The warranty is verbal and the engineer always looks nervous._
`,ki=`---
id: mars-anchor
name: Mars Anchor
system: sol
location_type: orbital
type: civilian
owning_faction: helios-directorate

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: true
min_missions: 0
mission_chance: 0.0

npcs:
  trader: Factor Orin
  ship_dealer: Agent Farris

danger_level: low
tags:
  - heavy-industry
  - bulk-freight
  - ship-market
---

# Mars Anchor

_Heavy-lift platform anchored above the Martian equator. Handles bulk
ore and component transfers; one of the few Sol stations with a licensed
ship dealer floor._
`,xi=`---
id: meridian-station
name: Meridian Station
system: sirius
location_type: orbital
type: civilian
owning_faction: centauri-trade-league

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: true
min_missions: 2
mission_chance: 0.75

npcs:
  trader: Syndic Havel
  ship_dealer: Agent Vorrel

danger_level: low
tags:
  - trade-hub
  - high-volume
  - league-territory
---

# Meridian Station

_Large Centauri Trade League torus orbital in Sirius's outer system. High-volume trading, consistent market data, and efficient — if impersonal — docking._
`,Si=`---
id: new-horizon-port
name: New Horizon Port
system: alpha-centauri
location_type: orbital
type: civilian
owning_faction: centauri-trade-league

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: true
min_missions: 2
mission_chance: 0.75

npcs:
  trader: Syndic Marelle
  ship_dealer: Broker Cassel

danger_level: low
tags:
  - trade-hub
  - wealthy
  - finance-district
---

# New Horizon Port

_The system's primary trade and passenger hub. Finance houses, guild
offices and shipping brokers occupy every level of its commercial ring._
`,Ti=`---
id: orrery-anchorage
name: Orrery Anchorage
system: procyon
location_type: deep-space
type: civilian
owning_faction: procyon-institute

amenities:
  trader: false
  ship_repair: true
  fuel: true
  ship_dealer: false
min_missions: 0
mission_chance: 0.0

danger_level: none
tags:
  - waypoint
  - remote
  - technician-staffed
---

# Orrery Anchorage

A maintenance waypoint bolted to the edge of the Procyon Institute's Orrery Array
sensor network, at the outer limit of the system's navigable zone. It is staffed
by a rotation of Institute technicians who are here to maintain the array, not
to serve as a port. They are not unfriendly — they simply have other things to do.

Fuel and basic structural repairs are available. Nothing else. There is no mission
board, no trade floor, no ship dealer. The Anchorage has a common room with a
table, four chairs, and a beverages unit that technically still works. Pilots who
linger are not asked to leave; they are simply given nothing to do.

The one reliable advantage of Orrery Anchorage is its sensor coverage. Ships
docked here receive real-time Orrery Array data as a courtesy — the most accurate
positional readings available in this part of the core, useful for anyone planning
a jump to the outer systems. The technicians will, if asked politely, sometimes
point out anomalies in the data that haven't made it into the official chart update
yet.
`,Ci=`---
id: redline-station
name: Redline Station
system: barnards-star
location_type: orbital
type: civilian
owning_faction: free-captains

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: false
min_missions: 2
mission_chance: 0.75

npcs:
  trader: Smelter Haag

danger_level: medium
tags:
  - industrial
  - ore-market
  - three-shift
---

# Redline Station

_Massive rotating refinery and trade dock servicing mining traffic.
Runs three shifts continuously; the ore market here tracks Core System
spot prices with only hours of delay._
`,Mi=`---
id: tycho-orbital
name: Tycho Orbital
system: sol
location_type: orbital
type: military
owning_faction: terran-union

amenities:
  trader: false
  ship_repair: true
  fuel: true
  ship_dealer: false
min_missions: 0
mission_chance: 0.65

danger_level: low
tags:
  - restricted
  - military
  - licensed-only
---

# Tycho Orbital

_Military-aligned logistics and repair station in lunar orbit. Access is
restricted to licensed contractors and Terran Union vessels._
`,Ai=`---
id: veil-station
name: Veil Station
system: procyon
location_type: orbital
type: research
owning_faction: procyon-institute

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: false
min_missions: 0
mission_chance: 0.65

npcs:
  trader: Archivist Dain

danger_level: none
tags:
  - research
  - restricted
  - institute-access
---

# Veil Station

_The Procyon Institute's main orbital. Specialist research equipment and navigation data; inner campus access requires Institute credentials._
`,Ei=`---
id: waypoint-ceti
name: Waypoint Ceti
system: tau-ceti
location_type: orbital
type: civilian
owning_faction: eridani-colonial-council

amenities:
  trader: true
  ship_repair: true
  fuel: true
  ship_dealer: false
min_missions: 2
mission_chance: 0.75

npcs:
  trader: Factor Yeln

danger_level: low
tags:
  - transit-hub
  - colonial
  - council-run
---

# Waypoint Ceti

The main orbital station above Ceti Prime handles a mix of passenger liners and
bulk freight in proportions that shift dramatically with the agricultural harvest
cycle. During peak export season the docking queue stretches long enough to make
impatient captains seriously reconsider their career choices. In the quiet months
between harvests, Waypoint Ceti is a comfortable, unhurried stop with fast berth
availability and a population that visibly relaxes.

Factor Yeln's trading floor deals mainly in transit commodities — goods moving
through rather than goods destined for the system. The prices are fair and the
stock is mid-range, reflecting a port that serves volume rather than specialisation.
Captains looking for agricultural exports will find better pricing and selection
at Ceti Landfall; Waypoint is for everyone else.

The Eridani Colonial Council runs the mission board here, and the contracts
reflect it: agricultural logistics, colony supply runs between Ceti Prime and the
Granaries, and the occasional inter-system freight job negotiated directly with
the Council's trade office. The paperwork is colonial-style — direct, specific,
and mercifully short.
`,Ri=`---
economies:
  - id: mining
    summary: Raw ore extraction and heavy mineral processing
    commodities:
      - id: iron-ore
        factor: 0.5
      - id: rare-earth
        factor: 0.6
      - id: deuterium
        factor: 0.75
      - id: refined-metals
        factor: 1.2
      - id: ship-components
        factor: 1.3
      - id: rations
        factor: 1.15
  - id: industrial
    summary: Manufacturing and assembly of goods
    commodities:
      - id: refined-metals
        factor: 0.7
      - id: ship-components
        factor: 0.75
      - id: electronics
        factor: 0.8
      - id: fuel-cells
        factor: 0.8
      - id: iron-ore
        factor: 0.85
  - id: administrative
    summary: Government services and commerce regulation
    commodities:
      - id: electronics
        factor: 0.85
      - id: rations
        factor: 0.9
      - id: medical-supplies
        factor: 0.9
      - id: ship-components
        factor: 1.1
  - id: military
    summary: Armed forces and defense operations
    commodities:
      - id: ship-components
        factor: 0.85
      - id: fuel-cells
        factor: 0.85
      - id: rations
        factor: 0.85
      - id: medical-supplies
        factor: 0.85
  - id: salvage
    summary: Wreck recovery and recycling operations
    commodities:
      - id: iron-ore
        factor: 0.7
      - id: refined-metals
        factor: 0.75
      - id: ship-components
        factor: 0.7
      - id: electronics
        factor: 0.8
      - id: medical-supplies
        factor: 1.25
      - id: rations
        factor: 1.2
  - id: black-market
    summary: Illegal goods and underground commerce
    commodities:
      - id: combat-stims
        factor: 0.6
      - id: black-box-data
        factor: 0.7
      - id: grey-market-tech
        factor: 0.65
      - id: rations
        factor: 1.1
      - id: medical-supplies
        factor: 1.15
  - id: scavenging
    summary: Salvage gathering and waste recovery
    commodities:
      - id: iron-ore
        factor: 0.75
      - id: ship-components
        factor: 0.75
      - id: electronics
        factor: 0.85
      - id: rations
        factor: 1.3
      - id: medical-supplies
        factor: 1.3
  - id: trade
    summary: Import-export and commercial distribution
    commodities:
      - id: electronics
        factor: 0.85
      - id: rations
        factor: 0.85
      - id: refined-metals
        factor: 0.9
      - id: fuel-cells
        factor: 0.85
  - id: shipping
    summary: Freight and logistics operations
    commodities:
      - id: fuel-cells
        factor: 0.8
      - id: rations
        factor: 0.85
      - id: ship-components
        factor: 0.9
      - id: deuterium
        factor: 0.85
---

# Economies

Trading reflects local economic specialization. Each economy tag influences which commodities traders stock and at what prices.
`,Ii=`---
type: object
properties:
  id:
    type: string
    description: kebab-case identifier, matches filename
  name:
    type: string
  type:
    enum:
      - government
      - corporation
      - criminal
      - guild
      - independent
  home_system:
    type: string
    description: system id — must resolve to a system doc
  size:
    enum:
      - small
      - medium
      - large
  influence:
    type: array
    items:
      type: string
    description: system ids where this faction operates
  tags:
    type: array
    items:
      type: string
required:
  - id
  - name
  - type
  - home_system
  - size
---

# Faction Name

_Short summary paragraph. What does this faction do? Who does it serve?_

## Governance (optional)

_How decisions get made. One paragraph._

## Notable Events (optional)

_Things a pilot would know about — not deep history, just events relevant to
doing business with or around this faction._

## Reputation (optional)

_What independent pilots actually think. First-person flavour is fine here._
`,Fi=`---
id: centauri-trade-league
name: Centauri Trade League
type: corporation
home_system: alpha-centauri
size: large
influence:
  - alpha-centauri
  - sol
  - barnards-star
  - sirius
tags:
  - trade
  - finance
  - arbitration
  - neutral
rivals:
  - independent-miners-guild
allies:
  - procyon-institute
---

# Centauri Trade League

_The dominant commercial authority in Alpha Centauri. Sets commodity prices
across a dozen systems and provides arbitration services for contract disputes._
`,Li=`---
id: eridani-colonial-council
name: Eridani Colonial Council
type: government
home_system: epsilon-eridani
size: medium
influence:
  - epsilon-eridani
  - tau-ceti
tags:
  - colonial
  - self-governing
  - industrial
  - frontier-adjacent
rivals:
  - helios-directorate
allies:
  - terran-union
  - independent-miners-guild
---

# Eridani Colonial Council

Established by early colonial administrators of the outer core who found the
Terran Union's response time impractical at ten or more light years from Sol.
The Council holds genuine governing authority over Epsilon Eridani and Tau Ceti
through a body of elected colonial representatives, running its own trade
licensing, local defence contracts, and infrastructure programmes.

Relations with the Terran Union are formally cooperative and privately competitive.
The Council has no interest in breaking with the Union — the military protection
and trade access are too valuable — but it guards its administrative autonomy
carefully and has successfully resisted several Union expansion of oversight attempts.

## Governance

A council of twelve elected representatives — six from each system under its
authority. A rotating executive chair holds the casting vote on deadlocked
decisions. Sessions are held quarterly at Eridani Anchorage, with remote
participation from Tau Ceti's delegation.

## Notable Events

The Council recently negotiated a revised trade licensing agreement with the
Terran Union that reduces Union inspection frequency in exchange for guaranteed
ore supply contracts from the Eridani Belt. Supporters call it a practical
compromise; critics within the colonial population call it a concession.

## Reputation

Popular with independent pilots who operate in Epsilon Eridani and Tau Ceti.
The Council's mission boards offer reliable local contracts without Union paperwork.
It is viewed with mild suspicion by Union loyalists and with cautious sympathy by
frontier pilots who recognise a governing body trying to maintain genuine independence.
`,Di=`---
id: free-captains
name: Free Captains
type: independent
home_system: wolf-359
size: medium
influence:
  - wolf-359
  - barnards-star
tags:
  - piracy
  - salvage
  - democratic
  - frontier
rivals:
  - terran-union
allies:
  - grey-market-cartel
---

# Free Captains

_Loose democratic council of independent operators in Wolf 359. Theoretically
govern the system; in practice share power uneasily with the Grey Market Cartel._
`,Oi=`---
id: grey-market-cartel
name: Grey Market Cartel
type: criminal
home_system: wolf-359
size: medium
influence:
  - wolf-359
tags:
  - criminal
  - smuggling
  - contraband
  - violent
rivals:
  - terran-union
allies:
  - free-captains
---

# Grey Market Cartel

_De facto controllers of Wolf 359's two stations. Run protection rackets,
illegal modification services, and contraband distribution networks._
`,Pi=`---
id: helios-directorate
name: Helios Directorate
type: corporation
home_system: sol
size: large
influence:
  - sol
  - alpha-centauri
  - sirius
  - epsilon-eridani
tags:
  - energy
  - fuel-monopoly
  - political
  - corporate
rivals:
  - eridani-colonial-council
allies: []
---

# Helios Directorate

_Energy and fuel distribution conglomerate with deep roots in Sol's orbital
infrastructure. Controls the majority of fuel depot contracts system-wide._
`,Hi=`---
id: independent-miners-guild
name: Independent Miners Guild
type: guild
home_system: barnards-star
size: medium
influence:
  - barnards-star
tags:
  - mining
  - labour
  - self-governing
  - frontier
rivals:
  - centauri-trade-league
allies:
  - eridani-colonial-council
---

# Independent Miners Guild

_Self-governing labour organisation holding extraction rights across
Barnard's Belt. Tight-knit and suspicious of outsiders; loyal to members._
`,Ni=`---
id: procyon-institute
name: Procyon Institute
type: corporation
home_system: procyon
size: medium
influence:
  - procyon
  - sol
tags:
  - research
  - technology
  - licensing
  - academic
  - neutral
rivals: []
allies:
  - centauri-trade-league
---

# Procyon Institute

Founded under a Terran Union charter as an independent academic body, the Procyon
Institute has grown into the dominant research institution of core space. It controls
navigation chart licensing, ship technology certification, and applied physics
research across the core systems. Pilots who want the most accurate jump charts
buy them from the Institute; shipbuilders who want their designs certified for
Union registry need Institute approval.

## Governance

Run by a Board of Directors elected from the Institute's senior research faculty.
Decisions are slow, deliberate, and heavily documented. The Union holds one
non-voting observer seat on the Board as a condition of the founding charter.

## Notable Events

The Institute recently expanded its Orrery Array sensor network, increasing
navigation data resolution for the outer core systems. The resulting chart update
requires licence holders to re-register — a procedural headache that has generated
significant pilot frustration and a small boom in courier contracts to process the
paperwork.

## Reputation

Respected but remote. Pilots who complete Institute survey contracts reliably report
some of the best pay-per-risk ratios available in core space. The Institute does not
negotiate, does not rush, and does not respond well to pressure. Arrive credentialed
or arrive at Orrery Anchorage.
`,Bi=`---
id: terran-union
name: Terran Union
type: government
home_system: sol
size: large
influence:
  - sol
  - alpha-centauri
  - barnards-star
  - sirius
  - procyon
  - tau-ceti
  - epsilon-eridani
tags:
  - bureaucratic
  - military
  - regulated
  - law-enforcement
rivals:
  - grey-market-cartel
  - free-captains
allies:
  - eridani-colonial-council
---

# Terran Union

The dominant governing body of human space. Formed after the Consolidation
Wars, the Union maintains authority through a combination of military presence,
trade licensing, and diplomatic pressure.

## Governance

A council of elected ministers governs from Earth. Military operations are
delegated to the Union Admiralty, which operates independently in practice.

## Reputation

Seen as overbearing by frontier pilots, essential by Core System residents.
Offers steady legal contracts but heavy paperwork.
`,ji=`# Galaxy Map

# Core space

Humanity currently occupies a loose network of connected systems known as
the Core Routes. Most civilian traffic remains within 15 light years of Sol.

## Trade routes

Sol - Alpha Centurai - Sirius - Tau Ceti

# Frontier space

Beyond the established routes lie fragmented colonies and uncharted aystems abandoned systems ready to be exploited by the next wave kf colonists.

Security is low and the riaks higher but the money to be made increases in return.

# Outer space

Beyond the known frontier lie the further, minimally explored reaches of space, rarely ventured to by humans.

But as technology improves, humanity pushes ever further in a race for knowledge, wealth and power.

Adventure here is fraught with inconsistent communications and unreliable star charts.`,Ui=`---
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

  # Outer Reach — less-travelled routes beyond the frontier
  - from: alpha-centauri
    to: tau-ceti
    distance: 9.4
    stability: stable
    security: medium

  - from: barnards-star
    to: epsilon-eridani
    distance: 7.2
    stability: unstable
    security: low
---

# Jump Routes

Established navigation corridors recognised by civilian navigation systems.
All routes are bidirectional. Distances are in light years.

Route data lives entirely in the front matter above — the docs renderer and
game engine read from there. Add new routes as front matter entries only;
do not duplicate them here as tables or diagrams.

Only systems with a doc in \`docs/world/systems/\` may be referenced. No orphan
route entries.
`,Yi=`---
npc_names:
  special:
    - "The Fixer"
    - "The Handler"
    - "Dispatch"
    - "The Broker"
    - "The Middleman"
    - "Control"
    - "The Facilitator"
    - "Station Master"

  first_names:
    - Aria
    - Dax
    - Mira
    - Ryen
    - Sable
    - Cael
    - Voss
    - Nira
    - Tomas
    - Lena
    - Orin
    - Zara
    - Brek
    - Suki

  last_names:
    - Reyes
    - Okafor
    - Nakamura
    - Vasquez
    - Petrov
    - Singh
    - Oduya
    - Kovač
    - Larsen
    - Mbeki
    - Tanaka
    - Ferrão
    - Diallo
    - Brennan
---
`,Wi=`---
id: balance

npc:
  special_name_chance: 0.3

missions:
  board_max_count: 8
  mission_ttl_ms: 900000
  delivery_chance: 0.6
  delivery_base_reward: 200
  delivery_random_reward: 200
  supply_reward_multiplier_min: 1.15
  supply_reward_multiplier_max: 1.50
  supply_requirements_min: 1
  supply_requirements_max: 2
  supply_qty_min: 3
  supply_qty_max: 10
  delivery_deposit_fraction: 0.20

trading:
  stock_count_min: 4
  stock_count_max: 6
  stock_qty_min: 5
  stock_qty_max: 10
  stock_ttl_ms: 120000
  stock_rep_count_bonus_per_level: 1
  stock_rep_count_bonus_min: -2
  stock_rep_count_bonus_max: 3
  stock_rep_qty_bonus_per_level: 2
  stock_rep_qty_bonus_min: -4
  stock_rep_qty_bonus_max: 6

fuel:
  price_per_litre: 10
  consumption_per_ly: 5
  in_system_base_consumption_l: 4

reputation:
  level_unfriendly_min: -300
  level_neutral_min: -100
  level_friendly_min: 100
  level_liked_min: 300
  level_revered_min: 600
  points_min: -600
  points_max: 1000
  mission_delta_small: 25
  mission_delta_medium: 75
  mission_delta_large: 200
  mission_tier_medium_reward: 300
  mission_tier_large_reward: 600
  trade_modifier_hated: 1.20
  trade_modifier_unfriendly: 1.10
  trade_modifier_neutral: 1.00
  trade_modifier_friendly: 0.92
  trade_modifier_liked: 0.85
  trade_modifier_revered: 0.80
  rep_per_credit: 0.01
  max_rep_per_visit: 10

emergency_rescue:
  tow_fee: 500
  fuel_drop_fee: 800
  fuel_drop_litres: 15

mini_games:
  max_hull_damage_fraction: 0.05
  abandon_damage_fraction: 0.05
  no_damage_threshold: 90

navigation_minigame:
  ship:
    acceleration_impulse: 0.8
    max_speed_lateral: 4.0
    max_speed_forward: 6.0
    player_row_preference: 0.67
    top_buffer_rows: 4
  difficulties:
    easy:
      base_scroll_speed: 0.3
      min_scroll_speed: 0.2
      obstacle_density: 0.5
      edge_spawn_interval_frames: 120
      drift_speed_max: 0.2
      target_distance: 150
    normal:
      base_scroll_speed: 0.5
      min_scroll_speed: 0.35
      obstacle_density: 0.8
      edge_spawn_interval_frames: 80
      drift_speed_max: 0.4
      target_distance: 200
    hard:
      base_scroll_speed: 0.8
      min_scroll_speed: 0.55
      obstacle_density: 1.3
      edge_spawn_interval_frames: 50
      drift_speed_max: 0.7
      target_distance: 250
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
---
`,Ki=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,Gi=`---
type: object
properties:
  id:
    type: string
    description: kebab-case identifier, matches filename
  name:
    type: string
  class:
    enum:
      - freighter
      - scout
      - hauler
      - fighter
  cost:
    type: number
    description: credits
  cargo_capacity_kg:
    type: number
    description: maximum cargo in kilograms
  fuel_capacity_l:
    type: number
    description: fuel tank size in litres
  hull_points:
    type: number
    description: hit points before destruction
  default_jump_drive:
    type: string
    description: drive id — must resolve to an entry in jump-drives.md
  tags:
    type: array
    items:
      type: string
required:
  - id
  - name
  - class
  - cost
  - cargo_capacity_kg
  - fuel_capacity_l
  - hull_points
  - default_jump_drive
---

# Ship Name

_One paragraph describing the ship's character, strengths, and typical use._
`,$i=`---
drives:
  - id: civilian-mk1
    name: Civilian Mk1
    max_distance_ly: 4
    fuel_efficiency: 0.8
    cost: 10000
  - id: civilian-mk2
    name: Civilian Mk2
    max_distance_ly: 7
    fuel_efficiency: 0.6
    cost: 20000
  - id: hauler
    name: Hauler
    max_distance_ly: 12
    fuel_efficiency: 0.95
    cost: 50000
  - id: explorer
    name: Explorer
    max_distance_ly: 20
    fuel_efficiency: 0.85
    cost: 100000
---

# Jump drives

Long range engines for faster than light travel between systems.`,qi=`---
id: freighter
name: Standard Freighter
class: freighter
cost: 5000
cargo_capacity_kg: 2000
fuel_capacity_l: 100
hull_points: 60
default_jump_drive: civilian-mk1
fuel_efficiency: 0.85
tags:
  - starter
  - slow
  - reliable
---

# Standard Freighter

The workhorse of civilian space. Underpowered, overloaded, and still flying
after twenty years — the Standard Freighter is the ship most independent
pilots start with and many never replace. Slow to accelerate and vulnerable
in a fight, but the cargo hold earns its keep on the Core Routes.
`,Vi=`---
id: hauler
name: Deep Hauler
class: hauler
cost: 80000
cargo_capacity_kg: 8000
fuel_capacity_l: 200
hull_points: 100
default_jump_drive: hauler
fuel_efficiency: 0.95
tags:
  - high-cargo
  - durable
  - trade-optimised
---

# Deep Hauler

The serious trader's ship. Enormous cargo capacity and a long-range jump
drive make the Deep Hauler the preferred vessel for bulk runs between the
Core and frontier systems. Expensive and slow to manoeuvre, it pays for
itself on routes where volume is everything.
`,zi=`---
id: scout
name: Scout Runner
class: scout
cost: 25000
cargo_capacity_kg: 500
fuel_capacity_l: 80
hull_points: 40
default_jump_drive: civilian-mk2
fuel_efficiency: 0.7
tags:
  - fast
  - exploration
  - low-cargo
---

# Scout Runner

Built for speed and range, not cargo. The Scout Runner excels at charting
new routes, running courier jobs, and getting in and out of lawless systems
before anyone notices. Fragile in a fight and tight on cargo space, but
nothing accelerates like it on the standard market.
`,Xi=`---
type: object
properties:
  id:
    type: string
    description: kebab-case identifier, matches filename
  title:
    type: string
    description: internal label used in code (not shown to player)
  trigger:
    type: string
    description: >
      when this beat fires — e.g. "game-start", "first-dock:redline-station",
      "mission-complete:rescue-col7", "system-enter:wolf-359"
  type:
    enum:
      - intro
      - discovery
      - mission
      - system-enter
      - station-arrive
      - combat-end
      - trade-threshold
      - custom
  location:
    type: string
    description: >
      optional — station id or system id this beat is tied to.
      Used for context-sensitive beats.
  skippable:
    type: boolean
    description: whether the player can dismiss this without reading
  player_knowledge:
    enum:
      - public
      - private
    description: >
      public = shown in normal play; private = debug/lore-only, never triggered
      in a standard run
required:
  - id
  - title
  - trigger
  - type
  - skippable
---

# Beat Title (internal)

_This section is the story text shown to the player during this beat._

_It may span multiple paragraphs. Use blank lines to separate them._

_Keep each paragraph short — the game renders in a narrow terminal grid._
`,Ji=`---
id: enter-wolf-359
title: First Entry — Wolf 359
trigger: system-enter:wolf-359
type: system-enter
location: wolf-359
skippable: true
player_knowledge: public
---

Your nav system flags the system before you've cleared
the jump corridor.

SECURITY ADVISORY: WOLF 359
No patrol coverage. Travel at own risk.

The Drift Market beacon is already pinging you.
Someone always knows when a new ship arrives here.

Keep your hand near the controls.
`,Qi=`---
id: first-jump
title: First Jump — Leaving Sol
trigger: first-jump
type: discovery
skippable: true
player_knowledge: public
---

The jump drive spins up. The station shrinks.

Sol's light vanishes behind a wall of compressed space.

For a moment there is nothing — no sound, no direction,
no sense of being anywhere at all.

Then the stars snap back.

You are somewhere new.
`,Zi=`---
id: opening-arrival
title: Opening Arrival at Elysium Station
trigger: game-start
type: intro
location: elysium-station
skippable: true
player_knowledge: public
---

YEAR  2284

The war ended six years ago.

The corporations divided the wreckage between them
and called it peace.

You were a Union pilot once. Now you haul freight
between stations that barely remember your name.

Your ship drifted into Elysium Station an hour ago,
low on fuel and lower on credits.

The galaxy doesn't care.

Neither, you've decided, do you.

Time to find work.
`,et=`---
type: object
properties:
  id:
    type: string
    description: kebab-case identifier, matches filename
  name:
    type: string
  star_type:
    type: string
    description: spectral class e.g. "G2V"
  distance_from_sol:
    type: number
    description: light years
  zone:
    enum:
      - core
      - frontier
      - outer
  population:
    enum:
      - none
      - low
      - medium
      - high
      - massive
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
  economies:
    type: array
    items:
      type: string
    description: economy tags e.g. mining, trade, military
  major_factions:
    type: array
    items:
      type: string
    description: list of faction ids
  destinations:
    type: array
    items:
      type: string
    description: list of destination ids
  map_position:
    type: object
    description: >
      position on the galaxy map in light-year-scale coordinates, with Sol
      at the origin (0, 0). Positive x is rimward, positive y is spinward.
      Set when creating a system; the Writer role maintains these.
    properties:
      x:
        type: number
      y:
        type: number
    required:
      - x
      - y
  tags:
    type: array
    items:
      type: string
required:
  - id
  - name
  - distance_from_sol
  - zone
---

# System Name

_Short summary of the system. One or two paragraphs._

## Major Bodies

_Planets, moons and notable features (e.g. asteroid belts)._

### Body name

_One or two lines._

## Major Stations

_Stations, ports and other visitable locations in the system._

### Station name

_One or two lines._

## Governance (optional)

_Leadership of the system and the competing factions._

## History (optional)

_Background of the discovery and development of the system._

## Local Reputation (optional)

_What travellers and locals think of the system — influences player choices._
`,nt=`---
id: alpha-centauri
name: Alpha Centauri
star_type: G2V / K1V
distance_from_sol: 4.3
zone: core

security: high
population: high
danger_level: low
player_knowledge: public

map_position:
  x: -15
  y: -17

economies:
  - trade
  - shipping
  - industrial
major_factions:
  - centauri-trade-league
  - terran-union

destinations:
  - new-horizon-port
  - hestia-ring

tags:
  - trade-hub
  - wealthy
  - stable
---

# Alpha Centauri System

Alpha Centauri serves as the commercial crossroads of nearby human space.

Merchants, couriers and freight haulers pass through constantly, making
the system one of the busiest civilian trade regions outside Sol. The
three-star configuration creates complex gravitational corridors that
experienced pilots use to shave days off transit times.

## Major Bodies

### New Horizon

A dense orbital city built around commerce, finance and interstellar trade.
Headquarters of the Centauri Trade League, its markets set commodity prices
across a dozen systems.

### Proxima Centauri Region

Remote industrial stations surrounding Proxima Centauri handle fuel
processing and long-range supply operations. Less regulated than the
inner system, it attracts contractors the Trade League would rather not
see in the main port.

## Major Stations

### New Horizon Port

The system's primary trade and passenger hub. Berths for over four hundred
vessels simultaneously. Finance houses, guild offices and shipping brokers
occupy every level of its commercial ring.

### Hestia Ring

Large-scale civilian docking structure known for rapid turnaround services.
Prefers volume over margin — docking fees are low, but expect company at
every refuelling point.

## Governance

The Centauri Trade League controls commercial licensing across the system.
The Terran Union maintains a consular presence but cedes most day-to-day
authority to the League in exchange for preferential freight agreements.

## Local Reputation

Independent captains often prefer Alpha Centauri over Sol due to lighter
regulation and faster docking access. The Trade League's reputation for
fair arbitration makes it a reliable place to settle contract disputes.
`,it=`---
id: barnards-star
name: Barnard's Star
star_type: M4V
distance_from_sol: 5.9
zone: frontier

security: medium
population: medium
danger_level: medium
player_knowledge: public

map_position:
  x: -22
  y: 15

economies:
  - mining
  - military
major_factions:
  - independent-miners-guild

destinations:
  - redline-station
  - kepler-yard

tags:
  - mining
  - frontier-edge
  - working-class
---

# Barnard's Star

Barnard's Star grew from a collection of isolated extraction platforms
into one of the primary resource suppliers for the Core Systems.

Most traffic consists of ore haulers, fuel tankers and heavily worn
industrial vessels. The red dwarf's radiation hazard zones make the
outer belt rich in metals but costly to work — a calculation the
Independent Miners Guild has mastered over decades.

## Major Bodies

### Barnard's Belt

A dense asteroid field encircling the inner system. Extraordinarily
rich in iron, nickel and trace rare-earth deposits. The Guild holds
extraction rights to over sixty per cent of the charted belt.

### Station Platform Rho

A collection of linked habitation modules — the closest thing the
system has to a surface settlement. Houses off-duty miners and the
Guild's administrative offices.

## Major Stations

### Redline Station

A massive rotating refinery and trade dock servicing mining traffic.
Three shifts run continuously. The market here tracks ore spot prices
with a delay of only a few hours from Core System exchanges.

### Kepler Yard

Shipbreaking and salvage facility famous for cheap repairs and
questionable engineering standards. If you need your ship patched
quickly and cheaply, Kepler Yard will oblige — but read the warranty.

## Governance

The Independent Miners Guild self-governs the system under a charter
that predates Terran Union expansion to the frontier. The Union
recognises the charter in exchange for guaranteed ore supply contracts.

## History

First settled by automated survey drones in the 2030s, the system was
commercially exploited by the mid-2050s following the discovery of the
Belt's rare-earth concentrations.

## Local Reputation

Barnard's Star is known for hard labour, dangerous contracts and captains
willing to take risks for profit. Guild members are tight-knit and
suspicious of strangers, but generous to those who earn their respect.
`,tt=`---
id: epsilon-eridani
name: Epsilon Eridani
star_type: K2V
distance_from_sol: 10.5
zone: core

security: high
population: medium
danger_level: low
player_knowledge: public

map_position:
  x: 28
  y: -32

economies:
  - mining
major_factions:
  - terran-union
  - eridani-colonial-council
  - helios-directorate

destinations:
  - keelhaul-station
  - eridani-anchorage

tags:
  - core-world
  - military-presence
  - shipyard
  - industrial
---

# Epsilon Eridani System

A young, active star system — frequent stellar flares, a dense asteroid belt,
and a debris disk still settling from planetary formation. Exactly the kind of
environment where the Terran Union decided to build a major shipyard: distant
from population centres, rich in raw materials, and far enough from Sol that
military traffic doesn't clog civilian corridors.

Keelhaul Station is the Union's principal outer-core fleet facility. Civilian
pilots who aren't under Union contract will find access restricted and paperwork
dense. The Eridani Colonial Council maintains Eridani Anchorage as a civilian
counterweight — the part of the system that independent captains can actually use.

## Major Bodies

### Eridani Belt

A dense, active asteroid field rich in iron, nickel, and silicate deposits.
Active mining operations extract raw materials continuously for Keelhaul Station's
construction yards. Belt navigation requires careful plotting — debris density
and flare activity combine to make transit hazardous for the unprepared.

### Keelhaul Station

The Terran Union's main outer-core shipyard and fleet anchorage, positioned in
the inner system within rapid-response range of the belt's extraction operations.
Produces and repairs capital-class vessels as well as smaller fleet units. The
station is effectively a small city in military uniform.

### Eridani Colony

A sealed surface settlement on a rocky inner planet, housing the civilian support
population for the shipyard — logistics staff, families of military personnel,
and the contractors who keep the station's supply chains running. Not a tourist
destination.

## Major Stations

### Keelhaul Station

The system's dominant installation. Union vessels have priority docking. Civilian
access requires a valid contractor permit or a demonstrated operational reason.
The ship dealer here stocks military-specification vessels rarely available
elsewhere in core space.

### Eridani Anchorage

A civilian mining support station in the outer belt. Smaller and more worn than
Keelhaul, it serves as the primary port for independent miners, freight captains,
and anyone who would prefer not to deal with Union docking protocols. The Colonial
Council runs the mission board.

## Governance

Formally under Terran Union military jurisdiction. The Union Admiralty governs
Keelhaul and the inner system directly. The Eridani Colonial Council holds
administrative authority over Eridani Anchorage and the civilian colony, an
arrangement the Union tolerates because the Council handles civilian logistics
without requiring military resources.

## Local Reputation

Polarised. Union contractors find Epsilon Eridani a well-resourced, well-organised
system with reliable pay and clear command structures. Independent pilots find it
unwelcoming inside the inner perimeter and acceptable — if not comfortable — out
in the belt. Eridani Anchorage has a rough, practical warmth that Keelhaul lacks
entirely.
`,rt=`---
id: procyon
name: Procyon
star_type: F5IV
distance_from_sol: 11.4
zone: core

security: high
population: medium
danger_level: none
player_knowledge: public

map_position:
  x: -8
  y: 52

economies:
  - salvage
major_factions:
  - terran-union
  - procyon-institute

destinations:
  - veil-station
  - orrery-anchorage

tags:
  - core-world
  - research-hub
  - restricted
---

# Procyon System

Quieter than Sirius, more controlled than Sol. The Procyon Institute has shaped
the entire character of this system — access is managed, research is continuous,
and civilian traffic that cannot demonstrate a purpose tends to be redirected to
Orrery Anchorage and no further.

The Institute operates under a Terran Union charter but functions with near-complete
autonomy. It controls navigation chart licensing, ship technology certification,
and applied physics research across the core systems. Its formal, credential-heavy
culture makes it a trusted institution and an intimidating employer in equal measure.

## Major Bodies

### Procyon II

A temperate world with a thin but survivable atmosphere. Unsuitable for open
settlement, it hosts a network of sealed Institute research stations and field
sites spread across its wind-scoured surface. Orbital access is managed through
Veil Station.

### Veil Station

The Institute's primary orbital installation — a large ring station above Procyon II
housing its main campus, data archive, and staff quarters. The station is clean,
quiet, and thorough in its docking checks. Unauthorized access to the inner rings
requires credentials that take months to obtain.

### Orrery Array

A deep-space sensor network distributed across the outer system, maintained by
automated platforms and a small rotation of technicians. Produces the navigation
data sold to pilots across core and frontier space. Orrery Anchorage is the only
civilian-accessible point of contact.

## Major Stations

### Veil Station

The Institute's main hub. Pilots cleared for docking find a well-stocked trade
floor, a mission board heavy on survey and research contracts, and services that
are excellent but priced for institutional budgets. Access to the inner campus
requires Institute credentials.

### Orrery Anchorage

A sparse waypoint station bolted to the edge of the Orrery Array. Staffed by
technicians rather than merchants. Fuel and basic repairs available; not much else.
The favoured stop for captains who want a quiet berth without dealing with the
Institute's intake process.

## Governance

The Terran Union holds nominal authority over Procyon under the Institute's
founding charter. In practice the Institute governs the system day-to-day.
The Union maintains a small administrative delegation on Veil Station, mainly
to process the navigation licensing revenue that flows back to Sol.

## Local Reputation

Pilots with research contracts or survey skills find Procyon unusually rewarding.
The Institute's mission board pays well and tends to take pilot-provided data
seriously. Those without a clear purpose find the system politely impenetrable.
`,ot=`---
id: sirius
name: Sirius
star_type: A1V (binary — Sirius A + Sirius B white dwarf)
distance_from_sol: 8.6
zone: core

security: high
population: high
danger_level: low
player_knowledge: public

map_position:
  x: -38
  y: -28

economies:
  - industrial
  - trade
major_factions:
  - terran-union
  - centauri-trade-league
  - helios-directorate

destinations:
  - meridian-station
  - foundries-platform

tags:
  - core-world
  - trade-hub
  - industrial
  - high-traffic
---

# Sirius System

The brightest star in Earth's sky has always carried symbolic weight. In practice,
it earns its reputation — a vast A-type star whose solar output renders the inner
system uninhabitable and is instead harvested by close-orbit collection arrays to
power the Foundries. Ships come to Sirius to be built, repaired, broken down,
and made again.

The Centauri Trade League's dominance here is a natural extension of its Alpha
Centauri operations — the two systems sit close enough that the League's freight
routes bridge them easily. The Terran Union maintains administrative oversight of
military licensing. The Helios Directorate controls fuel supply. Three major factions
in quiet, profitable tension.

## Major Bodies

### Sirius A

The system's blazing blue-white primary. Solar collection arrays in close orbit
harvest its output, converting raw radiation into the power supply that runs the
Foundries. No vessel approaches within the inner exclusion zone without Union
clearance.

### The Foundries

A dense asteroid belt threaded with interlocked industrial platforms. Produces
ship components, structural alloys, and heavy machinery at scale. The platforms
operate continuously — quiet periods last hours, never days. The smell of hot
metal and ozone is present even in sealed docking bays.

### Meridian Station

A large torus orbital positioned in the cooler outer system. The main civilian
port of call for Sirius, handling trade, passenger traffic, and commercial freight.
Home to the League's regional offices and a dense tier of freight brokers.

## Major Stations

### Meridian Station

The principal civilian hub of the system. Accommodates several hundred vessels
simultaneously and runs a continuous commodity market linked directly to the
Alpha Centauri exchange. The Centauri Trade League's regional office handles all
significant contract arbitration.

### Foundries Platform

The industrial heart of Sirius, embedded in the asteroid belt. Access requires
a valid works permit issued by either the Union or the League. The platform's
docking facilities are built for freighters, not couriers — small ships feel
exposed and out of place.

## Governance

The Terran Union holds formal authority over Sirius, but in practice governance
is shared. The Centauri Trade League controls commercial licensing and market
operations. Helios Directorate fuel contracts give it quiet leverage over traffic
patterns. The Union enforces the outer limits and handles military licensing;
it rarely interferes in trade disputes.

## Local Reputation

Productive and impersonal. Pilots who keep their paperwork in order find Sirius
a reliable source of industrial freight contracts and repair services. Those
who don't find the League's arbitration process unexpectedly thorough.
`,at=`---
id: sol
name: Sol
star_type: G2V
distance_from_sol: 0.0
zone: core

security: high
population: massive
danger_level: low
player_knowledge: public

map_position:
  x: 0
  y: 0

economies:
  - industrial
  - administrative
  - military
major_factions:
  - terran-union
  - helios-directorate

destinations:
  - elysium-station
  - galileo-transfer
  - tycho-orbital
  - mars-anchor

tags:
  - core-world
  - restricted
  - high-traffic
---

# Sol System

The birthplace of humanity remains the political and logistical heart
of known space.

Civilian pilots know Sol as a maze of traffic control corridors,
customs inspections and orbital bureaucracy. Despite this, the system
offers some of the safest trade routes and highest-paying legal contracts
in human space.

## Major Bodies

### Earth

Administrative centre of the Terran Union. Orbital access is tightly
controlled and surface permissions are rare for independent pilots.

### Mars

The industrial backbone of the inner systems. Mars exports reactors,
ship components and military hardware throughout known space.

### Europa

Research colonies and deep ice extraction facilities operate beneath
the frozen crust. Rumours persist of classified scientific operations
hidden below the surface oceans.

## Major Stations

### Elysium Station

A mid-sized civilian port in Earth orbit, popular with independent
pilots for its relaxed docking procedures and accessible trader quarter.

### Galileo Transfer Hub

Primary civilian transport interchange between Earth and the outer system.
Processes thousands of docking requests daily.

### Tycho Orbital

Military-aligned logistics and repair station in lunar orbit.
Access is restricted to licensed contractors and Terran Union vessels.

### Mars Anchor

Heavy-lift platform anchored above the Martian equator for bulk ore
and component transfers between surface and orbit.

## Governance

The Terran Union maintains strict jurisdiction over all Sol orbital
infrastructure. The Helios Directorate holds significant influence over
energy and fuel distribution contracts.

## Local Reputation

Profitable but exhausting. Docking queues alone can delay a captain
for days. Pilots who navigate the bureaucracy well earn steady, safe income.
`,st=`---
id: tau-ceti
name: Tau Ceti
star_type: G8V
distance_from_sol: 11.9
zone: core

security: medium
population: high
danger_level: low
player_knowledge: public

map_position:
  x: 10
  y: -48

economies:
  - trade
major_factions:
  - terran-union
  - eridani-colonial-council

destinations:
  - waypoint-ceti
  - ceti-landfall

tags:
  - core-world
  - colonial
  - agricultural
---

# Tau Ceti System

Tau Ceti's primary inhabited world, Ceti Prime, was partially terraformed over
several generations and now supports large-scale agriculture across its temperate
latitudes. It is the closest thing to a farming world in core space — not the most
glamorous system, but one with steady contracts, decent food, and a population
that takes genuine pride in feeding the inner systems.

The Eridani Colonial Council holds real administrative authority here, a legacy of
the system's independent development before the Terran Union extended its reach
this far. The Union maintains nominal oversight but rarely pushes — the food supply
contracts are too important to disrupt with political friction.

## Major Bodies

### Ceti Prime

A partially terraformed world. Engineered microbial colonies transformed the
atmosphere over two centuries; the result is breathable but thin, requiring
adaptation time for visitors from higher-pressure environments. Vast agricultural
settlements cover the northern and equatorial continents. Surface transport links
connect the major harvest districts to Ceti Landfall.

### Waypoint Ceti

The main orbital transit station above Ceti Prime, handling both passenger liners
and bulk freight bound for core system markets. Crowded during harvest season;
quieter but never empty otherwise.

### The Granaries

A cluster of bulk orbital storage and processing platforms in the outer system.
Goods staged here await jump transport during high-volume export periods. No
civilian docking — strictly logistics infrastructure.

## Major Stations

### Waypoint Ceti

A busy mid-sized orbital with a mixed merchant and passenger population.
The Colonial Council runs the mission board here, which leans heavily toward
agricultural freight and colony supply contracts. Pilots comfortable with
low-glamour bulk runs find consistent work.

### Ceti Landfall

The main surface port on Ceti Prime's northern plateau. Handles agricultural
exports and incoming supply goods for the surface settlements. The ship dealer
here stocks reliable freighters and light haulers suited to planetary surface
operations.

## Governance

The Eridani Colonial Council governs Tau Ceti under a colonial charter that
predates the Union's extension into the outer core. The Union holds inspection
rights over export licensing but delegates day-to-day governance to the Council.
Pilots filing cargo manifests deal with Council paperwork, not Union forms.

## History

Ceti Prime's terraforming programme was initiated by a consortium of private
colonial interests before the Terran Union's administrative reach extended this
far. By the time Union representatives arrived to establish oversight, the colony
was already functional and politically organised. The Colonial Council formalised
from that existing colonial administration.

## Local Reputation

Honest work, reasonable pay, no drama. Pilots willing to haul agricultural cargo
and colony supplies find Tau Ceti predictable in the best sense. The locals are
hospitable but quietly proud of their independence from Sol's bureaucracy.
`,lt=`---
id: wolf-359
name: Wolf 359
star_type: M6V
distance_from_sol: 7.9
zone: frontier

security: low
population: low
danger_level: high
player_knowledge: public

map_position:
  x: -32
  y: 2

economies:
  - scavenging
major_factions:
  - free-captains
  - grey-market-cartel

destinations:
  - drift-market
  - blackwake-yard

tags:
  - lawless
  - salvage
  - pirate-activity
---

# Wolf 359

Wolf 359 sits on the edge of regulated space and attracts scavengers,
smugglers and opportunists from across nearby systems.

Many ships arriving here never appear on official registries. The Terran
Union ceased patrol operations in the system in 2068 after losing three
enforcement vessels in eighteen months — a fact that the Grey Market
Cartel has exploited ever since.

## Major Bodies

### The Scatter

A broad debris field — remnants of a failed colony ship that attempted
landfall in the 2040s. The wreckage is continuously picked over by
salvagers and occasionally yields valuable cargo containers still sealed
against vacuum.

## Major Stations

### Drift Market

A sprawling patchwork station assembled from salvaged hull sections,
docking clamps and repurposed orbital platforms. Almost anything can
be purchased here for the right price, no questions asked.

### Blackwake Yard

Illegal modification facility specialising in reactor tampering and
military surplus retrofits. Officially does not exist. The Grey Market
Cartel provides security in exchange for a cut of every transaction.

## Governance

The Free Captains maintain a loose democratic council that theoretically
governs the system. In practice, the Grey Market Cartel holds effective
control of both stations. The council exists mainly to negotiate with
external parties when needed.

## History

Wolf 359 became notable after the failed Proxima Colonisation Wave of
2041, when dozens of damaged ships sought shelter here and their crews
never left. A salvage economy grew around the wrecks and never stopped.

## Local Reputation

Most authorities officially discourage travel to Wolf 359, which only
increases its popularity among independent pilots. Profitable and
genuinely dangerous — insurance companies refuse to write policies
covering hull damage sustained here.
`;var S={},re={},R={};function ln(e){return typeof e>"u"||e===null}function ct(e){return typeof e=="object"&&e!==null}function dt(e){return Array.isArray(e)?e:ln(e)?[]:[e]}function ht(e,n){var i,r,t,o;if(n)for(o=Object.keys(n),i=0,r=o.length;i<r;i+=1)t=o[i],e[t]=n[t];return e}function ut(e,n){var i="",r;for(r=0;r<n;r+=1)i+=e;return i}function pt(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}R.isNothing=ln;R.isObject=ct;R.toArray=dt;R.repeat=ut;R.isNegativeZero=pt;R.extend=ht;function ie(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}ie.prototype=Object.create(Error.prototype);ie.prototype.constructor=ie;ie.prototype.toString=function(n){var i=this.name+": ";return i+=this.reason||"(unknown reason)",!n&&this.mark&&(i+=" "+this.mark.toString()),i};var oe=ie,Be=R;function Ie(e,n,i,r,t){this.name=e,this.buffer=n,this.position=i,this.line=r,this.column=t}Ie.prototype.getSnippet=function(n,i){var r,t,o,a,s;if(!this.buffer)return null;for(n=n||4,i=i||75,r="",t=this.position;t>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(t-1))===-1;)if(t-=1,this.position-t>i/2-1){r=" ... ",t+=5;break}for(o="",a=this.position;a<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(a))===-1;)if(a+=1,a-this.position>i/2-1){o=" ... ",a-=5;break}return s=this.buffer.slice(t,a),Be.repeat(" ",n)+r+s+o+`
`+Be.repeat(" ",n+this.position-t+r.length)+"^"};Ie.prototype.toString=function(n){var i,r="";return this.name&&(r+='in "'+this.name+'" '),r+="at line "+(this.line+1)+", column "+(this.column+1),n||(i=this.getSnippet(),i&&(r+=`:
`+i)),r};var mt=Ie,je=oe,ft=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],gt=["scalar","sequence","mapping"];function yt(e){var n={};return e!==null&&Object.keys(e).forEach(function(i){e[i].forEach(function(r){n[String(r)]=i})}),n}function _t(e,n){if(n=n||{},Object.keys(n).forEach(function(i){if(ft.indexOf(i)===-1)throw new je('Unknown option "'+i+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(i){return i},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=yt(n.styleAliases||null),gt.indexOf(this.kind)===-1)throw new je('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var C=_t,Ue=R,de=oe,wt=C;function Ae(e,n,i){var r=[];return e.include.forEach(function(t){i=Ae(t,n,i)}),e[n].forEach(function(t){i.forEach(function(o,a){o.tag===t.tag&&o.kind===t.kind&&r.push(a)}),i.push(t)}),i.filter(function(t,o){return r.indexOf(o)===-1})}function bt(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,i;function r(t){e[t.kind][t.tag]=e.fallback[t.tag]=t}for(n=0,i=arguments.length;n<i;n+=1)arguments[n].forEach(r);return e}function G(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new de("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=Ae(this,"implicit",[]),this.compiledExplicit=Ae(this,"explicit",[]),this.compiledTypeMap=bt(this.compiledImplicit,this.compiledExplicit)}G.DEFAULT=null;G.create=function(){var n,i;switch(arguments.length){case 1:n=G.DEFAULT,i=arguments[0];break;case 2:n=arguments[0],i=arguments[1];break;default:throw new de("Wrong number of arguments for Schema.create function")}if(n=Ue.toArray(n),i=Ue.toArray(i),!n.every(function(r){return r instanceof G}))throw new de("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!i.every(function(r){return r instanceof wt}))throw new de("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new G({include:n,explicit:i})};var Z=G,vt=C,kt=new vt("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),xt=C,St=new xt("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Tt=C,Ct=new Tt("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Mt=Z,Fe=new Mt({explicit:[kt,St,Ct]}),At=C;function Et(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function Rt(){return null}function It(e){return e===null}var Ft=new At("tag:yaml.org,2002:null",{kind:"scalar",resolve:Et,construct:Rt,predicate:It,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Lt=C;function Dt(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function Ot(e){return e==="true"||e==="True"||e==="TRUE"}function Pt(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var Ht=new Lt("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Dt,construct:Ot,predicate:Pt,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),Nt=R,Bt=C;function jt(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function Ut(e){return 48<=e&&e<=55}function Yt(e){return 48<=e&&e<=57}function Wt(e){if(e===null)return!1;var n=e.length,i=0,r=!1,t;if(!n)return!1;if(t=e[i],(t==="-"||t==="+")&&(t=e[++i]),t==="0"){if(i+1===n)return!0;if(t=e[++i],t==="b"){for(i++;i<n;i++)if(t=e[i],t!=="_"){if(t!=="0"&&t!=="1")return!1;r=!0}return r&&t!=="_"}if(t==="x"){for(i++;i<n;i++)if(t=e[i],t!=="_"){if(!jt(e.charCodeAt(i)))return!1;r=!0}return r&&t!=="_"}for(;i<n;i++)if(t=e[i],t!=="_"){if(!Ut(e.charCodeAt(i)))return!1;r=!0}return r&&t!=="_"}if(t==="_")return!1;for(;i<n;i++)if(t=e[i],t!=="_"){if(t===":")break;if(!Yt(e.charCodeAt(i)))return!1;r=!0}return!r||t==="_"?!1:t!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(i))}function Kt(e){var n=e,i=1,r,t,o=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),r=n[0],(r==="-"||r==="+")&&(r==="-"&&(i=-1),n=n.slice(1),r=n[0]),n==="0"?0:r==="0"?n[1]==="b"?i*parseInt(n.slice(2),2):n[1]==="x"?i*parseInt(n,16):i*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(a){o.unshift(parseInt(a,10))}),n=0,t=1,o.forEach(function(a){n+=a*t,t*=60}),i*n):i*parseInt(n,10)}function Gt(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!Nt.isNegativeZero(e)}var $t=new Bt("tag:yaml.org,2002:int",{kind:"scalar",resolve:Wt,construct:Kt,predicate:Gt,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),cn=R,qt=C,Vt=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function zt(e){return!(e===null||!Vt.test(e)||e[e.length-1]==="_")}function Xt(e){var n,i,r,t;return n=e.replace(/_/g,"").toLowerCase(),i=n[0]==="-"?-1:1,t=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?i===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(o){t.unshift(parseFloat(o,10))}),n=0,r=1,t.forEach(function(o){n+=o*r,r*=60}),i*n):i*parseFloat(n,10)}var Jt=/^[-+]?[0-9]+e/;function Qt(e,n){var i;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(cn.isNegativeZero(e))return"-0.0";return i=e.toString(10),Jt.test(i)?i.replace("e",".e"):i}function Zt(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||cn.isNegativeZero(e))}var er=new qt("tag:yaml.org,2002:float",{kind:"scalar",resolve:zt,construct:Xt,predicate:Zt,represent:Qt,defaultStyle:"lowercase"}),nr=Z,dn=new nr({include:[Fe],implicit:[Ft,Ht,$t,er]}),ir=Z,hn=new ir({include:[dn]}),tr=C,un=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),pn=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function rr(e){return e===null?!1:un.exec(e)!==null||pn.exec(e)!==null}function or(e){var n,i,r,t,o,a,s,l=0,c=null,d,u,p;if(n=un.exec(e),n===null&&(n=pn.exec(e)),n===null)throw new Error("Date resolve error");if(i=+n[1],r=+n[2]-1,t=+n[3],!n[4])return new Date(Date.UTC(i,r,t));if(o=+n[4],a=+n[5],s=+n[6],n[7]){for(l=n[7].slice(0,3);l.length<3;)l+="0";l=+l}return n[9]&&(d=+n[10],u=+(n[11]||0),c=(d*60+u)*6e4,n[9]==="-"&&(c=-c)),p=new Date(Date.UTC(i,r,t,o,a,s,l)),c&&p.setTime(p.getTime()-c),p}function ar(e){return e.toISOString()}var sr=new tr("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:rr,construct:or,instanceOf:Date,represent:ar}),lr=C;function cr(e){return e==="<<"||e===null}var dr=new lr("tag:yaml.org,2002:merge",{kind:"scalar",resolve:cr});function mn(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var U;try{var hr=mn;U=hr("buffer").Buffer}catch{}var ur=C,Le=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function pr(e){if(e===null)return!1;var n,i,r=0,t=e.length,o=Le;for(i=0;i<t;i++)if(n=o.indexOf(e.charAt(i)),!(n>64)){if(n<0)return!1;r+=6}return r%8===0}function mr(e){var n,i,r=e.replace(/[\r\n=]/g,""),t=r.length,o=Le,a=0,s=[];for(n=0;n<t;n++)n%4===0&&n&&(s.push(a>>16&255),s.push(a>>8&255),s.push(a&255)),a=a<<6|o.indexOf(r.charAt(n));return i=t%4*6,i===0?(s.push(a>>16&255),s.push(a>>8&255),s.push(a&255)):i===18?(s.push(a>>10&255),s.push(a>>2&255)):i===12&&s.push(a>>4&255),U?U.from?U.from(s):new U(s):s}function fr(e){var n="",i=0,r,t,o=e.length,a=Le;for(r=0;r<o;r++)r%3===0&&r&&(n+=a[i>>18&63],n+=a[i>>12&63],n+=a[i>>6&63],n+=a[i&63]),i=(i<<8)+e[r];return t=o%3,t===0?(n+=a[i>>18&63],n+=a[i>>12&63],n+=a[i>>6&63],n+=a[i&63]):t===2?(n+=a[i>>10&63],n+=a[i>>4&63],n+=a[i<<2&63],n+=a[64]):t===1&&(n+=a[i>>2&63],n+=a[i<<4&63],n+=a[64],n+=a[64]),n}function gr(e){return U&&U.isBuffer(e)}var yr=new ur("tag:yaml.org,2002:binary",{kind:"scalar",resolve:pr,construct:mr,predicate:gr,represent:fr}),_r=C,wr=Object.prototype.hasOwnProperty,br=Object.prototype.toString;function vr(e){if(e===null)return!0;var n=[],i,r,t,o,a,s=e;for(i=0,r=s.length;i<r;i+=1){if(t=s[i],a=!1,br.call(t)!=="[object Object]")return!1;for(o in t)if(wr.call(t,o))if(!a)a=!0;else return!1;if(!a)return!1;if(n.indexOf(o)===-1)n.push(o);else return!1}return!0}function kr(e){return e!==null?e:[]}var xr=new _r("tag:yaml.org,2002:omap",{kind:"sequence",resolve:vr,construct:kr}),Sr=C,Tr=Object.prototype.toString;function Cr(e){if(e===null)return!0;var n,i,r,t,o,a=e;for(o=new Array(a.length),n=0,i=a.length;n<i;n+=1){if(r=a[n],Tr.call(r)!=="[object Object]"||(t=Object.keys(r),t.length!==1))return!1;o[n]=[t[0],r[t[0]]]}return!0}function Mr(e){if(e===null)return[];var n,i,r,t,o,a=e;for(o=new Array(a.length),n=0,i=a.length;n<i;n+=1)r=a[n],t=Object.keys(r),o[n]=[t[0],r[t[0]]];return o}var Ar=new Sr("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Cr,construct:Mr}),Er=C,Rr=Object.prototype.hasOwnProperty;function Ir(e){if(e===null)return!0;var n,i=e;for(n in i)if(Rr.call(i,n)&&i[n]!==null)return!1;return!0}function Fr(e){return e!==null?e:{}}var Lr=new Er("tag:yaml.org,2002:set",{kind:"mapping",resolve:Ir,construct:Fr}),Dr=Z,ae=new Dr({include:[hn],implicit:[sr,dr],explicit:[yr,xr,Ar,Lr]}),Or=C;function Pr(){return!0}function Hr(){}function Nr(){return""}function Br(e){return typeof e>"u"}var jr=new Or("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:Pr,construct:Hr,predicate:Br,represent:Nr}),Ur=C;function Yr(e){if(e===null||e.length===0)return!1;var n=e,i=/\/([gim]*)$/.exec(e),r="";return!(n[0]==="/"&&(i&&(r=i[1]),r.length>3||n[n.length-r.length-1]!=="/"))}function Wr(e){var n=e,i=/\/([gim]*)$/.exec(e),r="";return n[0]==="/"&&(i&&(r=i[1]),n=n.slice(1,n.length-r.length-1)),new RegExp(n,r)}function Kr(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function Gr(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var $r=new Ur("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:Yr,construct:Wr,predicate:Gr,represent:Kr}),ue;try{var qr=mn;ue=qr("esprima")}catch{typeof window<"u"&&(ue=window.esprima)}var Vr=C;function zr(e){if(e===null)return!1;try{var n="("+e+")",i=ue.parse(n,{range:!0});return!(i.type!=="Program"||i.body.length!==1||i.body[0].type!=="ExpressionStatement"||i.body[0].expression.type!=="ArrowFunctionExpression"&&i.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function Xr(e){var n="("+e+")",i=ue.parse(n,{range:!0}),r=[],t;if(i.type!=="Program"||i.body.length!==1||i.body[0].type!=="ExpressionStatement"||i.body[0].expression.type!=="ArrowFunctionExpression"&&i.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return i.body[0].expression.params.forEach(function(o){r.push(o.name)}),t=i.body[0].expression.body.range,i.body[0].expression.body.type==="BlockStatement"?new Function(r,n.slice(t[0]+1,t[1]-1)):new Function(r,"return "+n.slice(t[0],t[1]))}function Jr(e){return e.toString()}function Qr(e){return Object.prototype.toString.call(e)==="[object Function]"}var Zr=new Vr("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:zr,construct:Xr,predicate:Qr,represent:Jr}),Ye=Z,ge=Ye.DEFAULT=new Ye({include:[ae],explicit:[jr,$r,Zr]}),L=R,fn=oe,eo=mt,gn=ae,no=ge,B=Object.prototype.hasOwnProperty,pe=1,yn=2,_n=3,me=4,Se=1,io=2,We=3,to=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,ro=/[\x85\u2028\u2029]/,oo=/[,\[\]\{\}]/,wn=/^(?:!|!!|![a-z\-]+!)$/i,bn=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function Ke(e){return Object.prototype.toString.call(e)}function F(e){return e===10||e===13}function Y(e){return e===9||e===32}function A(e){return e===9||e===32||e===10||e===13}function $(e){return e===44||e===91||e===93||e===123||e===125}function ao(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function so(e){return e===120?2:e===117?4:e===85?8:0}function lo(e){return 48<=e&&e<=57?e-48:-1}function Ge(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function co(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function vn(e,n,i){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:i}):e[n]=i}var kn=new Array(256),xn=new Array(256);for(var K=0;K<256;K++)kn[K]=Ge(K)?1:0,xn[K]=Ge(K);function ho(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||no,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function Sn(e,n){return new fn(n,new eo(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function y(e,n){throw Sn(e,n)}function fe(e,n){e.onWarning&&e.onWarning.call(null,Sn(e,n))}var $e={YAML:function(n,i,r){var t,o,a;n.version!==null&&y(n,"duplication of %YAML directive"),r.length!==1&&y(n,"YAML directive accepts exactly one argument"),t=/^([0-9]+)\.([0-9]+)$/.exec(r[0]),t===null&&y(n,"ill-formed argument of the YAML directive"),o=parseInt(t[1],10),a=parseInt(t[2],10),o!==1&&y(n,"unacceptable YAML version of the document"),n.version=r[0],n.checkLineBreaks=a<2,a!==1&&a!==2&&fe(n,"unsupported YAML version of the document")},TAG:function(n,i,r){var t,o;r.length!==2&&y(n,"TAG directive accepts exactly two arguments"),t=r[0],o=r[1],wn.test(t)||y(n,"ill-formed tag handle (first argument) of the TAG directive"),B.call(n.tagMap,t)&&y(n,'there is a previously declared suffix for "'+t+'" tag handle'),bn.test(o)||y(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[t]=o}};function N(e,n,i,r){var t,o,a,s;if(n<i){if(s=e.input.slice(n,i),r)for(t=0,o=s.length;t<o;t+=1)a=s.charCodeAt(t),a===9||32<=a&&a<=1114111||y(e,"expected valid JSON character");else to.test(s)&&y(e,"the stream contains non-printable characters");e.result+=s}}function qe(e,n,i,r){var t,o,a,s;for(L.isObject(i)||y(e,"cannot merge mappings; the provided source object is unacceptable"),t=Object.keys(i),a=0,s=t.length;a<s;a+=1)o=t[a],B.call(n,o)||(vn(n,o,i[o]),r[o]=!0)}function q(e,n,i,r,t,o,a,s){var l,c;if(Array.isArray(t))for(t=Array.prototype.slice.call(t),l=0,c=t.length;l<c;l+=1)Array.isArray(t[l])&&y(e,"nested arrays are not supported inside keys"),typeof t=="object"&&Ke(t[l])==="[object Object]"&&(t[l]="[object Object]");if(typeof t=="object"&&Ke(t)==="[object Object]"&&(t="[object Object]"),t=String(t),n===null&&(n={}),r==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)qe(e,n,o[l],i);else qe(e,n,o,i);else!e.json&&!B.call(i,t)&&B.call(n,t)&&(e.line=a||e.line,e.position=s||e.position,y(e,"duplicated mapping key")),vn(n,t,o),delete i[t];return n}function De(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):y(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function T(e,n,i){for(var r=0,t=e.input.charCodeAt(e.position);t!==0;){for(;Y(t);)t=e.input.charCodeAt(++e.position);if(n&&t===35)do t=e.input.charCodeAt(++e.position);while(t!==10&&t!==13&&t!==0);if(F(t))for(De(e),t=e.input.charCodeAt(e.position),r++,e.lineIndent=0;t===32;)e.lineIndent++,t=e.input.charCodeAt(++e.position);else break}return i!==-1&&r!==0&&e.lineIndent<i&&fe(e,"deficient indentation"),r}function ye(e){var n=e.position,i;return i=e.input.charCodeAt(n),!!((i===45||i===46)&&i===e.input.charCodeAt(n+1)&&i===e.input.charCodeAt(n+2)&&(n+=3,i=e.input.charCodeAt(n),i===0||A(i)))}function Oe(e,n){n===1?e.result+=" ":n>1&&(e.result+=L.repeat(`
`,n-1))}function uo(e,n,i){var r,t,o,a,s,l,c,d,u=e.kind,p=e.result,h;if(h=e.input.charCodeAt(e.position),A(h)||$(h)||h===35||h===38||h===42||h===33||h===124||h===62||h===39||h===34||h===37||h===64||h===96||(h===63||h===45)&&(t=e.input.charCodeAt(e.position+1),A(t)||i&&$(t)))return!1;for(e.kind="scalar",e.result="",o=a=e.position,s=!1;h!==0;){if(h===58){if(t=e.input.charCodeAt(e.position+1),A(t)||i&&$(t))break}else if(h===35){if(r=e.input.charCodeAt(e.position-1),A(r))break}else{if(e.position===e.lineStart&&ye(e)||i&&$(h))break;if(F(h))if(l=e.line,c=e.lineStart,d=e.lineIndent,T(e,!1,-1),e.lineIndent>=n){s=!0,h=e.input.charCodeAt(e.position);continue}else{e.position=a,e.line=l,e.lineStart=c,e.lineIndent=d;break}}s&&(N(e,o,a,!1),Oe(e,e.line-l),o=a=e.position,s=!1),Y(h)||(a=e.position+1),h=e.input.charCodeAt(++e.position)}return N(e,o,a,!1),e.result?!0:(e.kind=u,e.result=p,!1)}function po(e,n){var i,r,t;if(i=e.input.charCodeAt(e.position),i!==39)return!1;for(e.kind="scalar",e.result="",e.position++,r=t=e.position;(i=e.input.charCodeAt(e.position))!==0;)if(i===39)if(N(e,r,e.position,!0),i=e.input.charCodeAt(++e.position),i===39)r=e.position,e.position++,t=e.position;else return!0;else F(i)?(N(e,r,t,!0),Oe(e,T(e,!1,n)),r=t=e.position):e.position===e.lineStart&&ye(e)?y(e,"unexpected end of the document within a single quoted scalar"):(e.position++,t=e.position);y(e,"unexpected end of the stream within a single quoted scalar")}function mo(e,n){var i,r,t,o,a,s;if(s=e.input.charCodeAt(e.position),s!==34)return!1;for(e.kind="scalar",e.result="",e.position++,i=r=e.position;(s=e.input.charCodeAt(e.position))!==0;){if(s===34)return N(e,i,e.position,!0),e.position++,!0;if(s===92){if(N(e,i,e.position,!0),s=e.input.charCodeAt(++e.position),F(s))T(e,!1,n);else if(s<256&&kn[s])e.result+=xn[s],e.position++;else if((a=so(s))>0){for(t=a,o=0;t>0;t--)s=e.input.charCodeAt(++e.position),(a=ao(s))>=0?o=(o<<4)+a:y(e,"expected hexadecimal character");e.result+=co(o),e.position++}else y(e,"unknown escape sequence");i=r=e.position}else F(s)?(N(e,i,r,!0),Oe(e,T(e,!1,n)),i=r=e.position):e.position===e.lineStart&&ye(e)?y(e,"unexpected end of the document within a double quoted scalar"):(e.position++,r=e.position)}y(e,"unexpected end of the stream within a double quoted scalar")}function fo(e,n){var i=!0,r,t=e.tag,o,a=e.anchor,s,l,c,d,u,p={},h,m,f,g;if(g=e.input.charCodeAt(e.position),g===91)l=93,u=!1,o=[];else if(g===123)l=125,u=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),g=e.input.charCodeAt(++e.position);g!==0;){if(T(e,!0,n),g=e.input.charCodeAt(e.position),g===l)return e.position++,e.tag=t,e.anchor=a,e.kind=u?"mapping":"sequence",e.result=o,!0;i||y(e,"missed comma between flow collection entries"),m=h=f=null,c=d=!1,g===63&&(s=e.input.charCodeAt(e.position+1),A(s)&&(c=d=!0,e.position++,T(e,!0,n))),r=e.line,X(e,n,pe,!1,!0),m=e.tag,h=e.result,T(e,!0,n),g=e.input.charCodeAt(e.position),(d||e.line===r)&&g===58&&(c=!0,g=e.input.charCodeAt(++e.position),T(e,!0,n),X(e,n,pe,!1,!0),f=e.result),u?q(e,o,p,m,h,f):c?o.push(q(e,null,p,m,h,f)):o.push(h),T(e,!0,n),g=e.input.charCodeAt(e.position),g===44?(i=!0,g=e.input.charCodeAt(++e.position)):i=!1}y(e,"unexpected end of the stream within a flow collection")}function go(e,n){var i,r,t=Se,o=!1,a=!1,s=n,l=0,c=!1,d,u;if(u=e.input.charCodeAt(e.position),u===124)r=!1;else if(u===62)r=!0;else return!1;for(e.kind="scalar",e.result="";u!==0;)if(u=e.input.charCodeAt(++e.position),u===43||u===45)Se===t?t=u===43?We:io:y(e,"repeat of a chomping mode identifier");else if((d=lo(u))>=0)d===0?y(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):a?y(e,"repeat of an indentation width identifier"):(s=n+d-1,a=!0);else break;if(Y(u)){do u=e.input.charCodeAt(++e.position);while(Y(u));if(u===35)do u=e.input.charCodeAt(++e.position);while(!F(u)&&u!==0)}for(;u!==0;){for(De(e),e.lineIndent=0,u=e.input.charCodeAt(e.position);(!a||e.lineIndent<s)&&u===32;)e.lineIndent++,u=e.input.charCodeAt(++e.position);if(!a&&e.lineIndent>s&&(s=e.lineIndent),F(u)){l++;continue}if(e.lineIndent<s){t===We?e.result+=L.repeat(`
`,o?1+l:l):t===Se&&o&&(e.result+=`
`);break}for(r?Y(u)?(c=!0,e.result+=L.repeat(`
`,o?1+l:l)):c?(c=!1,e.result+=L.repeat(`
`,l+1)):l===0?o&&(e.result+=" "):e.result+=L.repeat(`
`,l):e.result+=L.repeat(`
`,o?1+l:l),o=!0,a=!0,l=0,i=e.position;!F(u)&&u!==0;)u=e.input.charCodeAt(++e.position);N(e,i,e.position,!1)}return!0}function Ve(e,n){var i,r=e.tag,t=e.anchor,o=[],a,s=!1,l;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),l=e.input.charCodeAt(e.position);l!==0&&!(l!==45||(a=e.input.charCodeAt(e.position+1),!A(a)));){if(s=!0,e.position++,T(e,!0,-1)&&e.lineIndent<=n){o.push(null),l=e.input.charCodeAt(e.position);continue}if(i=e.line,X(e,n,_n,!1,!0),o.push(e.result),T(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===i||e.lineIndent>n)&&l!==0)y(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return s?(e.tag=r,e.anchor=t,e.kind="sequence",e.result=o,!0):!1}function yo(e,n,i){var r,t,o,a,s=e.tag,l=e.anchor,c={},d={},u=null,p=null,h=null,m=!1,f=!1,g;for(e.anchor!==null&&(e.anchorMap[e.anchor]=c),g=e.input.charCodeAt(e.position);g!==0;){if(r=e.input.charCodeAt(e.position+1),o=e.line,a=e.position,(g===63||g===58)&&A(r))g===63?(m&&(q(e,c,d,u,p,null),u=p=h=null),f=!0,m=!0,t=!0):m?(m=!1,t=!0):y(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,g=r;else if(X(e,i,yn,!1,!0))if(e.line===o){for(g=e.input.charCodeAt(e.position);Y(g);)g=e.input.charCodeAt(++e.position);if(g===58)g=e.input.charCodeAt(++e.position),A(g)||y(e,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(q(e,c,d,u,p,null),u=p=h=null),f=!0,m=!1,t=!1,u=e.tag,p=e.result;else if(f)y(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=s,e.anchor=l,!0}else if(f)y(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=s,e.anchor=l,!0;else break;if((e.line===o||e.lineIndent>n)&&(X(e,n,me,!0,t)&&(m?p=e.result:h=e.result),m||(q(e,c,d,u,p,h,o,a),u=p=h=null),T(e,!0,-1),g=e.input.charCodeAt(e.position)),e.lineIndent>n&&g!==0)y(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return m&&q(e,c,d,u,p,null),f&&(e.tag=s,e.anchor=l,e.kind="mapping",e.result=c),f}function _o(e){var n,i=!1,r=!1,t,o,a;if(a=e.input.charCodeAt(e.position),a!==33)return!1;if(e.tag!==null&&y(e,"duplication of a tag property"),a=e.input.charCodeAt(++e.position),a===60?(i=!0,a=e.input.charCodeAt(++e.position)):a===33?(r=!0,t="!!",a=e.input.charCodeAt(++e.position)):t="!",n=e.position,i){do a=e.input.charCodeAt(++e.position);while(a!==0&&a!==62);e.position<e.length?(o=e.input.slice(n,e.position),a=e.input.charCodeAt(++e.position)):y(e,"unexpected end of the stream within a verbatim tag")}else{for(;a!==0&&!A(a);)a===33&&(r?y(e,"tag suffix cannot contain exclamation marks"):(t=e.input.slice(n-1,e.position+1),wn.test(t)||y(e,"named tag handle cannot contain such characters"),r=!0,n=e.position+1)),a=e.input.charCodeAt(++e.position);o=e.input.slice(n,e.position),oo.test(o)&&y(e,"tag suffix cannot contain flow indicator characters")}return o&&!bn.test(o)&&y(e,"tag name cannot contain such characters: "+o),i?e.tag=o:B.call(e.tagMap,t)?e.tag=e.tagMap[t]+o:t==="!"?e.tag="!"+o:t==="!!"?e.tag="tag:yaml.org,2002:"+o:y(e,'undeclared tag handle "'+t+'"'),!0}function wo(e){var n,i;if(i=e.input.charCodeAt(e.position),i!==38)return!1;for(e.anchor!==null&&y(e,"duplication of an anchor property"),i=e.input.charCodeAt(++e.position),n=e.position;i!==0&&!A(i)&&!$(i);)i=e.input.charCodeAt(++e.position);return e.position===n&&y(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function bo(e){var n,i,r;if(r=e.input.charCodeAt(e.position),r!==42)return!1;for(r=e.input.charCodeAt(++e.position),n=e.position;r!==0&&!A(r)&&!$(r);)r=e.input.charCodeAt(++e.position);return e.position===n&&y(e,"name of an alias node must contain at least one character"),i=e.input.slice(n,e.position),B.call(e.anchorMap,i)||y(e,'unidentified alias "'+i+'"'),e.result=e.anchorMap[i],T(e,!0,-1),!0}function X(e,n,i,r,t){var o,a,s,l=1,c=!1,d=!1,u,p,h,m,f;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=a=s=me===i||_n===i,r&&T(e,!0,-1)&&(c=!0,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)),l===1)for(;_o(e)||wo(e);)T(e,!0,-1)?(c=!0,s=o,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)):s=!1;if(s&&(s=c||t),(l===1||me===i)&&(pe===i||yn===i?m=n:m=n+1,f=e.position-e.lineStart,l===1?s&&(Ve(e,f)||yo(e,f,m))||fo(e,m)?d=!0:(a&&go(e,m)||po(e,m)||mo(e,m)?d=!0:bo(e)?(d=!0,(e.tag!==null||e.anchor!==null)&&y(e,"alias node should not have any properties")):uo(e,m,pe===i)&&(d=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(d=s&&Ve(e,f))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&y(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),u=0,p=e.implicitTypes.length;u<p;u+=1)if(h=e.implicitTypes[u],h.resolve(e.result)){e.result=h.construct(e.result),e.tag=h.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else B.call(e.typeMap[e.kind||"fallback"],e.tag)?(h=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&h.kind!==e.kind&&y(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+h.kind+'", not "'+e.kind+'"'),h.resolve(e.result)?(e.result=h.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):y(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):y(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||d}function vo(e){var n=e.position,i,r,t,o=!1,a;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(a=e.input.charCodeAt(e.position))!==0&&(T(e,!0,-1),a=e.input.charCodeAt(e.position),!(e.lineIndent>0||a!==37));){for(o=!0,a=e.input.charCodeAt(++e.position),i=e.position;a!==0&&!A(a);)a=e.input.charCodeAt(++e.position);for(r=e.input.slice(i,e.position),t=[],r.length<1&&y(e,"directive name must not be less than one character in length");a!==0;){for(;Y(a);)a=e.input.charCodeAt(++e.position);if(a===35){do a=e.input.charCodeAt(++e.position);while(a!==0&&!F(a));break}if(F(a))break;for(i=e.position;a!==0&&!A(a);)a=e.input.charCodeAt(++e.position);t.push(e.input.slice(i,e.position))}a!==0&&De(e),B.call($e,r)?$e[r](e,r,t):fe(e,'unknown document directive "'+r+'"')}if(T(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,T(e,!0,-1)):o&&y(e,"directives end mark is expected"),X(e,e.lineIndent-1,me,!1,!0),T(e,!0,-1),e.checkLineBreaks&&ro.test(e.input.slice(n,e.position))&&fe(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&ye(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,T(e,!0,-1));return}if(e.position<e.length-1)y(e,"end of the stream or a document separator is expected");else return}function Tn(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var i=new ho(e,n),r=e.indexOf("\0");for(r!==-1&&(i.position=r,y(i,"null byte is not allowed in input")),i.input+="\0";i.input.charCodeAt(i.position)===32;)i.lineIndent+=1,i.position+=1;for(;i.position<i.length-1;)vo(i);return i.documents}function Cn(e,n,i){n!==null&&typeof n=="object"&&typeof i>"u"&&(i=n,n=null);var r=Tn(e,i);if(typeof n!="function")return r;for(var t=0,o=r.length;t<o;t+=1)n(r[t])}function Mn(e,n){var i=Tn(e,n);if(i.length!==0){if(i.length===1)return i[0];throw new fn("expected a single document in the stream, but found more")}}function ko(e,n,i){return typeof n=="object"&&n!==null&&typeof i>"u"&&(i=n,n=null),Cn(e,n,L.extend({schema:gn},i))}function xo(e,n){return Mn(e,L.extend({schema:gn},n))}re.loadAll=Cn;re.load=Mn;re.safeLoadAll=ko;re.safeLoad=xo;var Pe={},se=R,le=oe,So=ge,To=ae,An=Object.prototype.toString,En=Object.prototype.hasOwnProperty,Co=9,te=10,Mo=13,Ao=32,Eo=33,Ro=34,Rn=35,Io=37,Fo=38,Lo=39,Do=42,In=44,Oo=45,Fn=58,Po=61,Ho=62,No=63,Bo=64,Ln=91,Dn=93,jo=96,On=123,Uo=124,Pn=125,M={};M[0]="\\0";M[7]="\\a";M[8]="\\b";M[9]="\\t";M[10]="\\n";M[11]="\\v";M[12]="\\f";M[13]="\\r";M[27]="\\e";M[34]='\\"';M[92]="\\\\";M[133]="\\N";M[160]="\\_";M[8232]="\\L";M[8233]="\\P";var Yo=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function Wo(e,n){var i,r,t,o,a,s,l;if(n===null)return{};for(i={},r=Object.keys(n),t=0,o=r.length;t<o;t+=1)a=r[t],s=String(n[a]),a.slice(0,2)==="!!"&&(a="tag:yaml.org,2002:"+a.slice(2)),l=e.compiledTypeMap.fallback[a],l&&En.call(l.styleAliases,s)&&(s=l.styleAliases[s]),i[a]=s;return i}function ze(e){var n,i,r;if(n=e.toString(16).toUpperCase(),e<=255)i="x",r=2;else if(e<=65535)i="u",r=4;else if(e<=4294967295)i="U",r=8;else throw new le("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+i+se.repeat("0",r-n.length)+n}function Ko(e){this.schema=e.schema||So,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=se.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=Wo(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function Xe(e,n){for(var i=se.repeat(" ",n),r=0,t=-1,o="",a,s=e.length;r<s;)t=e.indexOf(`
`,r),t===-1?(a=e.slice(r),r=s):(a=e.slice(r,t+1),r=t+1),a.length&&a!==`
`&&(o+=i),o+=a;return o}function Ee(e,n){return`
`+se.repeat(" ",e.indent*n)}function Go(e,n){var i,r,t;for(i=0,r=e.implicitTypes.length;i<r;i+=1)if(t=e.implicitTypes[i],t.resolve(n))return!0;return!1}function He(e){return e===Ao||e===Co}function J(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function $o(e){return J(e)&&!He(e)&&e!==65279&&e!==Mo&&e!==te}function Je(e,n){return J(e)&&e!==65279&&e!==In&&e!==Ln&&e!==Dn&&e!==On&&e!==Pn&&e!==Fn&&(e!==Rn||n&&$o(n))}function qo(e){return J(e)&&e!==65279&&!He(e)&&e!==Oo&&e!==No&&e!==Fn&&e!==In&&e!==Ln&&e!==Dn&&e!==On&&e!==Pn&&e!==Rn&&e!==Fo&&e!==Do&&e!==Eo&&e!==Uo&&e!==Po&&e!==Ho&&e!==Lo&&e!==Ro&&e!==Io&&e!==Bo&&e!==jo}function Hn(e){var n=/^\n* /;return n.test(e)}var Nn=1,Bn=2,jn=3,Un=4,he=5;function Vo(e,n,i,r,t){var o,a,s,l=!1,c=!1,d=r!==-1,u=-1,p=qo(e.charCodeAt(0))&&!He(e.charCodeAt(e.length-1));if(n)for(o=0;o<e.length;o++){if(a=e.charCodeAt(o),!J(a))return he;s=o>0?e.charCodeAt(o-1):null,p=p&&Je(a,s)}else{for(o=0;o<e.length;o++){if(a=e.charCodeAt(o),a===te)l=!0,d&&(c=c||o-u-1>r&&e[u+1]!==" ",u=o);else if(!J(a))return he;s=o>0?e.charCodeAt(o-1):null,p=p&&Je(a,s)}c=c||d&&o-u-1>r&&e[u+1]!==" "}return!l&&!c?p&&!t(e)?Nn:Bn:i>9&&Hn(e)?he:c?Un:jn}function zo(e,n,i,r){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&Yo.indexOf(n)!==-1)return"'"+n+"'";var t=e.indent*Math.max(1,i),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-t),a=r||e.flowLevel>-1&&i>=e.flowLevel;function s(l){return Go(e,l)}switch(Vo(n,a,e.indent,o,s)){case Nn:return n;case Bn:return"'"+n.replace(/'/g,"''")+"'";case jn:return"|"+Qe(n,e.indent)+Ze(Xe(n,t));case Un:return">"+Qe(n,e.indent)+Ze(Xe(Xo(n,o),t));case he:return'"'+Jo(n)+'"';default:throw new le("impossible error: invalid scalar style")}}()}function Qe(e,n){var i=Hn(e)?String(n):"",r=e[e.length-1]===`
`,t=r&&(e[e.length-2]===`
`||e===`
`),o=t?"+":r?"":"-";return i+o+`
`}function Ze(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function Xo(e,n){for(var i=/(\n+)([^\n]*)/g,r=function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,i.lastIndex=c,en(e.slice(0,c),n)}(),t=e[0]===`
`||e[0]===" ",o,a;a=i.exec(e);){var s=a[1],l=a[2];o=l[0]===" ",r+=s+(!t&&!o&&l!==""?`
`:"")+en(l,n),t=o}return r}function en(e,n){if(e===""||e[0]===" ")return e;for(var i=/ [^ ]/g,r,t=0,o,a=0,s=0,l="";r=i.exec(e);)s=r.index,s-t>n&&(o=a>t?a:s,l+=`
`+e.slice(t,o),t=o+1),a=s;return l+=`
`,e.length-t>n&&a>t?l+=e.slice(t,a)+`
`+e.slice(a+1):l+=e.slice(t),l.slice(1)}function Jo(e){for(var n="",i,r,t,o=0;o<e.length;o++){if(i=e.charCodeAt(o),i>=55296&&i<=56319&&(r=e.charCodeAt(o+1),r>=56320&&r<=57343)){n+=ze((i-55296)*1024+r-56320+65536),o++;continue}t=M[i],n+=!t&&J(i)?e[o]:t||ze(i)}return n}function Qo(e,n,i){var r="",t=e.tag,o,a;for(o=0,a=i.length;o<a;o+=1)W(e,n,i[o],!1,!1)&&(o!==0&&(r+=","+(e.condenseFlow?"":" ")),r+=e.dump);e.tag=t,e.dump="["+r+"]"}function Zo(e,n,i,r){var t="",o=e.tag,a,s;for(a=0,s=i.length;a<s;a+=1)W(e,n+1,i[a],!0,!0)&&((!r||a!==0)&&(t+=Ee(e,n)),e.dump&&te===e.dump.charCodeAt(0)?t+="-":t+="- ",t+=e.dump);e.tag=o,e.dump=t||"[]"}function ea(e,n,i){var r="",t=e.tag,o=Object.keys(i),a,s,l,c,d;for(a=0,s=o.length;a<s;a+=1)d="",a!==0&&(d+=", "),e.condenseFlow&&(d+='"'),l=o[a],c=i[l],W(e,n,l,!1,!1)&&(e.dump.length>1024&&(d+="? "),d+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),W(e,n,c,!1,!1)&&(d+=e.dump,r+=d));e.tag=t,e.dump="{"+r+"}"}function na(e,n,i,r){var t="",o=e.tag,a=Object.keys(i),s,l,c,d,u,p;if(e.sortKeys===!0)a.sort();else if(typeof e.sortKeys=="function")a.sort(e.sortKeys);else if(e.sortKeys)throw new le("sortKeys must be a boolean or a function");for(s=0,l=a.length;s<l;s+=1)p="",(!r||s!==0)&&(p+=Ee(e,n)),c=a[s],d=i[c],W(e,n+1,c,!0,!0,!0)&&(u=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,u&&(e.dump&&te===e.dump.charCodeAt(0)?p+="?":p+="? "),p+=e.dump,u&&(p+=Ee(e,n)),W(e,n+1,d,!0,u)&&(e.dump&&te===e.dump.charCodeAt(0)?p+=":":p+=": ",p+=e.dump,t+=p));e.tag=o,e.dump=t||"{}"}function nn(e,n,i){var r,t,o,a,s,l;for(t=i?e.explicitTypes:e.implicitTypes,o=0,a=t.length;o<a;o+=1)if(s=t[o],(s.instanceOf||s.predicate)&&(!s.instanceOf||typeof n=="object"&&n instanceof s.instanceOf)&&(!s.predicate||s.predicate(n))){if(e.tag=i?s.tag:"?",s.represent){if(l=e.styleMap[s.tag]||s.defaultStyle,An.call(s.represent)==="[object Function]")r=s.represent(n,l);else if(En.call(s.represent,l))r=s.represent[l](n,l);else throw new le("!<"+s.tag+'> tag resolver accepts not "'+l+'" style');e.dump=r}return!0}return!1}function W(e,n,i,r,t,o){e.tag=null,e.dump=i,nn(e,i,!1)||nn(e,i,!0);var a=An.call(e.dump);r&&(r=e.flowLevel<0||e.flowLevel>n);var s=a==="[object Object]"||a==="[object Array]",l,c;if(s&&(l=e.duplicates.indexOf(i),c=l!==-1),(e.tag!==null&&e.tag!=="?"||c||e.indent!==2&&n>0)&&(t=!1),c&&e.usedDuplicates[l])e.dump="*ref_"+l;else{if(s&&c&&!e.usedDuplicates[l]&&(e.usedDuplicates[l]=!0),a==="[object Object]")r&&Object.keys(e.dump).length!==0?(na(e,n,e.dump,t),c&&(e.dump="&ref_"+l+e.dump)):(ea(e,n,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump));else if(a==="[object Array]"){var d=e.noArrayIndent&&n>0?n-1:n;r&&e.dump.length!==0?(Zo(e,d,e.dump,t),c&&(e.dump="&ref_"+l+e.dump)):(Qo(e,d,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump))}else if(a==="[object String]")e.tag!=="?"&&zo(e,e.dump,n,o);else{if(e.skipInvalid)return!1;throw new le("unacceptable kind of an object to dump "+a)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function ia(e,n){var i=[],r=[],t,o;for(Re(e,i,r),t=0,o=r.length;t<o;t+=1)n.duplicates.push(i[r[t]]);n.usedDuplicates=new Array(o)}function Re(e,n,i){var r,t,o;if(e!==null&&typeof e=="object")if(t=n.indexOf(e),t!==-1)i.indexOf(t)===-1&&i.push(t);else if(n.push(e),Array.isArray(e))for(t=0,o=e.length;t<o;t+=1)Re(e[t],n,i);else for(r=Object.keys(e),t=0,o=r.length;t<o;t+=1)Re(e[r[t]],n,i)}function Yn(e,n){n=n||{};var i=new Ko(n);return i.noRefs||ia(e,i),W(i,0,e,!0,!0)?i.dump+`
`:""}function ta(e,n){return Yn(e,se.extend({schema:To},n))}Pe.dump=Yn;Pe.safeDump=ta;var _e=re,Wn=Pe;function we(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}S.Type=C;S.Schema=Z;S.FAILSAFE_SCHEMA=Fe;S.JSON_SCHEMA=dn;S.CORE_SCHEMA=hn;S.DEFAULT_SAFE_SCHEMA=ae;S.DEFAULT_FULL_SCHEMA=ge;S.load=_e.load;S.loadAll=_e.loadAll;S.safeLoad=_e.safeLoad;S.safeLoadAll=_e.safeLoadAll;S.dump=Wn.dump;S.safeDump=Wn.safeDump;S.YAMLException=oe;S.MINIMAL_SCHEMA=Fe;S.SAFE_SCHEMA=ae;S.DEFAULT_SCHEMA=ge;S.scan=we("scan");S.parse=we("parse");S.compose=we("compose");S.addConstructor=we("addConstructor");var ra=S,oa=ra;function aa(e){if(!e.startsWith(`---
`))return{data:{},content:e};const n=e.indexOf(`
---`,4);if(n===-1)return{data:{},content:e};const i=e.slice(4,n),r=e.slice(n+4),t=r.startsWith(`
`)?r.slice(1):r;return{data:oa.safeLoad(i)??{},content:t}}const Kn={npc:{specialNameChance:.3},missions:{boardMaxCount:8,missionTtlMs:9e5,deliveryChance:.6,deliveryBaseReward:200,deliveryRandomReward:200,supplyRewardMultiplierMin:1.15,supplyRewardMultiplierMax:1.5,supplyRequirementsMin:1,supplyRequirementsMax:2,supplyQtyMin:3,supplyQtyMax:10,deliveryDepositFraction:.2},trading:{stockCountMin:4,stockCountMax:6,stockQtyMin:5,stockQtyMax:10,stockTtlMs:12e4,stockRepCountBonusPerLevel:1,stockRepCountBonusMin:-2,stockRepCountBonusMax:3,stockRepQtyBonusPerLevel:2,stockRepQtyBonusMin:-4,stockRepQtyBonusMax:6},fuel:{pricePerLitre:10,consumptionPerLy:5,inSystemBaseConsumptionL:4},reputation:{levelUnfriendlyMin:-300,levelNeutralMin:-100,levelFriendlyMin:100,levelLikedMin:300,levelReveredMin:600,pointsMin:-600,pointsMax:1e3,missionDeltaSmall:25,missionDeltaMedium:75,missionDeltaLarge:200,missionTierMediumReward:300,missionTierLargeReward:600,tradeModifierHated:1.2,tradeModifierUnfriendly:1.1,tradeModifierNeutral:1,tradeModifierFriendly:.92,tradeModifierLiked:.85,tradeModifierRevered:.8,repPerCredit:.01,maxRepPerVisit:10},emergencyRescue:{towFee:500,fuelDropFee:800,fuelDropLitres:15},economies:{minFactor:.75,maxFactor:1.25},miniGames:{maxHullDamageFraction:.05,abandonDamageFraction:.05,noDamageThreshold:90,surface:{gravityAccel:3,airResistance:.5,thrustForce:8,maxSafeSpeed:3,crashSpeed:10,offPadScoreMultiplier:.5,padWidth:6,maxSpeed:15},asteroid:{thrustForce:8,maxSafeSpeed:4,crashSpeed:12,offPadScoreMultiplier:.5,padWidth:6,initialDownwardVelocity:2,maxSpeed:15},navigation:{ship:{accelerationImpulse:.8,maxSpeedLateral:4,maxSpeedForward:6,playerRowPreference:.67,topBufferRows:4},difficulties:{easy:{baseScrollSpeed:.3,minScrollSpeed:.2,obstacleDensity:.5,edgeSpawnIntervalFrames:120,driftSpeedMax:.2,targetDistance:150},normal:{baseScrollSpeed:.5,minScrollSpeed:.35,obstacleDensity:.8,edgeSpawnIntervalFrames:80,driftSpeedMax:.4,targetDistance:200},hard:{baseScrollSpeed:.8,minScrollSpeed:.55,obstacleDensity:1.3,edgeSpawnIntervalFrames:50,driftSpeedMax:.7,targetDistance:250}},eventTypes:{asteroid_belt:{largeRatio:.25,mediumRatio:.4,smallRatio:.35},space_debris:{largeRatio:.08,mediumRatio:.25,smallRatio:.67},space_storm:{largeRatio:0,mediumRatio:.1,smallRatio:.9}}}}};function sa(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},balance:{...Kn},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],economies:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[i,r]of Object.entries(e)){const t=i.split("/").pop()??"";if(t==="_template.md"||t===".gitkeep")continue;const{data:o,content:a}=aa(r);/^systems\/[^/]+\.md$/.test(i)?n.systems.push(la(o,a)):/^destinations\/[^/]+\.md$/.test(i)?n.destinations.push(ca(o,a)):/^factions\/[^/]+\.md$/.test(i)?n.factions.push(da(o,a)):/^ships\/[^/]+\.md$/.test(i)?n.ships.push(ha(o,a)):i==="ships/components/jump-drives.md"?n.drives=ua(o):i==="navigation/jump-routes.md"?n.routes=pa(o):i==="commodities.md"?n.commodities=ma(o):i==="economies.md"?n.economies=wa(o):/^story\/[^/]+\.md$/.test(i)?n.storyBeats.push(fa(o,a)):i==="settings/new-game.md"?n.settings=ga(o):i==="settings/balance.md"?n.balance=xa(o):i==="delivery-items.md"?n.deliveryItems=ya(o):i==="npc-names.md"&&(n.npcNames=_a(o))}return n}function be(e){const n=[];let i=!1;for(const r of e.split(`
`)){const t=r.trim();if(!t.startsWith("#"))if(t===""){if(i)break}else i=!0,n.push(t)}return n.join(" ")}function la(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economies:e.economies??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:be(n)}}function ca(e,n){const i=e.amenities??{},r={trader:i.trader??!1,shipRepair:i.ship_repair??!1,fuel:i.fuel??!1,shipDealer:i.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:r,npcs:e.npcs??{},minMissions:e.min_missions??0,missionChance:e.mission_chance??0,dangerLevel:e.danger_level,tags:e.tags??[],description:be(n),owningFactionId:e.owning_faction,difficultyMultiplier:e.difficulty_multiplier!==void 0?parseFloat(e.difficulty_multiplier):void 0}}function da(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:be(n),rivals:e.rivals??[],allies:e.allies??[]}}function ha(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,fuelEfficiency:e.fuel_efficiency,tags:e.tags??[],description:be(n)}}function ua(e){return(e.drives??[]).map(i=>({id:i.id,name:i.name,maxDistanceLy:i.max_distance_ly,fuelEfficiency:i.fuel_efficiency,cost:i.cost}))}function pa(e){return(e.routes??[]).map(i=>({from:i.from,to:i.to,distance:i.distance,stability:i.stability,security:i.security}))}function ma(e){return(e.commodities??[]).map(i=>({id:i.id,name:i.name,basePrice:i.base_price,category:i.category,legal:i.legal,weightKg:i.weight_kg,description:i.description??""}))}function fa(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function ga(e){var n,i,r,t;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((i=e.player)==null?void 0:i.starting_credits)??0},startingLocation:{system:((r=e.starting_location)==null?void 0:r.system)??"",destination:((t=e.starting_location)==null?void 0:t.destination)??""},startingShip:e.starting_ship??""}}function ya(e){return(e.delivery_items??[]).map(i=>({id:i.id,name:i.name,weightKg:i.weight_kg}))}function _a(e){const n=e.npc_names??{};return{special:n.special??[],firstNames:n.first_names??[],lastNames:n.last_names??[]}}function wa(e){return(e.economies??[]).map(i=>({id:i.id,summary:i.summary,commodities:(i.commodities??[]).map(r=>({id:r.id,factor:r.factor}))}))}function ba(e,n){return{gravityAccel:e.gravity_accel??n.gravityAccel,airResistance:e.air_resistance??n.airResistance,thrustForce:e.thrust_force??n.thrustForce,maxSafeSpeed:e.max_safe_speed??n.maxSafeSpeed,crashSpeed:e.crash_speed??n.crashSpeed,offPadScoreMultiplier:e.off_pad_score_multiplier??n.offPadScoreMultiplier,padWidth:e.pad_width??n.padWidth,maxSpeed:e.max_speed??n.maxSpeed}}function va(e,n){return{thrustForce:e.thrust_force??n.thrustForce,maxSafeSpeed:e.max_safe_speed??n.maxSafeSpeed,crashSpeed:e.crash_speed??n.crashSpeed,offPadScoreMultiplier:e.off_pad_score_multiplier??n.offPadScoreMultiplier,padWidth:e.pad_width??n.padWidth,initialDownwardVelocity:e.initial_downward_velocity??n.initialDownwardVelocity,maxSpeed:e.max_speed??n.maxSpeed}}function ka(e,n){var s,l,c,d,u,p,h,m,f,g,x;const i=e.ship??{},r=e.difficulties??{},t=e.event_types??{},o=(w,_)=>({baseScrollSpeed:w.base_scroll_speed??(_==null?void 0:_.baseScrollSpeed),minScrollSpeed:w.min_scroll_speed??(_==null?void 0:_.minScrollSpeed),obstacleDensity:w.obstacle_density??(_==null?void 0:_.obstacleDensity),edgeSpawnIntervalFrames:w.edge_spawn_interval_frames??(_==null?void 0:_.edgeSpawnIntervalFrames),driftSpeedMax:w.drift_speed_max??(_==null?void 0:_.driftSpeedMax),targetDistance:w.target_distance??(_==null?void 0:_.targetDistance)}),a=(w,_)=>({largeRatio:w.large_ratio??(_==null?void 0:_.largeRatio),mediumRatio:w.medium_ratio??(_==null?void 0:_.mediumRatio),smallRatio:w.small_ratio??(_==null?void 0:_.smallRatio)});return{ship:{accelerationImpulse:i.acceleration_impulse??((s=n==null?void 0:n.ship)==null?void 0:s.accelerationImpulse)??.4,maxSpeedLateral:i.max_speed_lateral??((l=n==null?void 0:n.ship)==null?void 0:l.maxSpeedLateral)??2,maxSpeedForward:i.max_speed_forward??((c=n==null?void 0:n.ship)==null?void 0:c.maxSpeedForward)??3,playerRowPreference:i.player_row_preference??((d=n==null?void 0:n.ship)==null?void 0:d.playerRowPreference)??.67,topBufferRows:i.top_buffer_rows??((u=n==null?void 0:n.ship)==null?void 0:u.topBufferRows)??4},difficulties:{easy:o(r.easy??{},(p=n==null?void 0:n.difficulties)==null?void 0:p.easy),normal:o(r.normal??{},(h=n==null?void 0:n.difficulties)==null?void 0:h.normal),hard:o(r.hard??{},(m=n==null?void 0:n.difficulties)==null?void 0:m.hard)},eventTypes:{asteroid_belt:a(t.asteroid_belt??{},(f=n==null?void 0:n.eventTypes)==null?void 0:f.asteroid_belt),space_debris:a(t.space_debris??{},(g=n==null?void 0:n.eventTypes)==null?void 0:g.space_debris),space_storm:a(t.space_storm??{},(x=n==null?void 0:n.eventTypes)==null?void 0:x.space_storm)}}}function xa(e){const n=Kn,i=e.npc??{},r=e.missions??{},t=e.trading??{},o=e.fuel??{},a=e.reputation??{},s=e.emergency_rescue??{},l=e.economies??{},c=e.mini_games??{};return{npc:{specialNameChance:i.special_name_chance??n.npc.specialNameChance},missions:{boardMaxCount:r.board_max_count??n.missions.boardMaxCount,missionTtlMs:r.mission_ttl_ms??n.missions.missionTtlMs,deliveryChance:r.delivery_chance??n.missions.deliveryChance,deliveryBaseReward:r.delivery_base_reward??n.missions.deliveryBaseReward,deliveryRandomReward:r.delivery_random_reward??n.missions.deliveryRandomReward,supplyRewardMultiplierMin:r.supply_reward_multiplier_min??n.missions.supplyRewardMultiplierMin,supplyRewardMultiplierMax:r.supply_reward_multiplier_max??n.missions.supplyRewardMultiplierMax,supplyRequirementsMin:r.supply_requirements_min??n.missions.supplyRequirementsMin,supplyRequirementsMax:r.supply_requirements_max??n.missions.supplyRequirementsMax,supplyQtyMin:r.supply_qty_min??n.missions.supplyQtyMin,supplyQtyMax:r.supply_qty_max??n.missions.supplyQtyMax,deliveryDepositFraction:r.delivery_deposit_fraction??n.missions.deliveryDepositFraction},trading:{stockCountMin:t.stock_count_min??n.trading.stockCountMin,stockCountMax:t.stock_count_max??n.trading.stockCountMax,stockQtyMin:t.stock_qty_min??n.trading.stockQtyMin,stockQtyMax:t.stock_qty_max??n.trading.stockQtyMax,stockTtlMs:t.stock_ttl_ms??n.trading.stockTtlMs,stockRepCountBonusPerLevel:t.stock_rep_count_bonus_per_level??n.trading.stockRepCountBonusPerLevel,stockRepCountBonusMin:t.stock_rep_count_bonus_min??n.trading.stockRepCountBonusMin,stockRepCountBonusMax:t.stock_rep_count_bonus_max??n.trading.stockRepCountBonusMax,stockRepQtyBonusPerLevel:t.stock_rep_qty_bonus_per_level??n.trading.stockRepQtyBonusPerLevel,stockRepQtyBonusMin:t.stock_rep_qty_bonus_min??n.trading.stockRepQtyBonusMin,stockRepQtyBonusMax:t.stock_rep_qty_bonus_max??n.trading.stockRepQtyBonusMax},fuel:{pricePerLitre:o.price_per_litre??n.fuel.pricePerLitre,consumptionPerLy:o.consumption_per_ly??n.fuel.consumptionPerLy,inSystemBaseConsumptionL:o.in_system_base_consumption_l??n.fuel.inSystemBaseConsumptionL},reputation:{levelUnfriendlyMin:a.level_unfriendly_min??n.reputation.levelUnfriendlyMin,levelNeutralMin:a.level_neutral_min??n.reputation.levelNeutralMin,levelFriendlyMin:a.level_friendly_min??n.reputation.levelFriendlyMin,levelLikedMin:a.level_liked_min??n.reputation.levelLikedMin,levelReveredMin:a.level_revered_min??n.reputation.levelReveredMin,pointsMin:a.points_min??n.reputation.pointsMin,pointsMax:a.points_max??n.reputation.pointsMax,missionDeltaSmall:a.mission_delta_small??n.reputation.missionDeltaSmall,missionDeltaMedium:a.mission_delta_medium??n.reputation.missionDeltaMedium,missionDeltaLarge:a.mission_delta_large??n.reputation.missionDeltaLarge,missionTierMediumReward:a.mission_tier_medium_reward??n.reputation.missionTierMediumReward,missionTierLargeReward:a.mission_tier_large_reward??n.reputation.missionTierLargeReward,tradeModifierHated:a.trade_modifier_hated??n.reputation.tradeModifierHated,tradeModifierUnfriendly:a.trade_modifier_unfriendly??n.reputation.tradeModifierUnfriendly,tradeModifierNeutral:a.trade_modifier_neutral??n.reputation.tradeModifierNeutral,tradeModifierFriendly:a.trade_modifier_friendly??n.reputation.tradeModifierFriendly,tradeModifierLiked:a.trade_modifier_liked??n.reputation.tradeModifierLiked,tradeModifierRevered:a.trade_modifier_revered??n.reputation.tradeModifierRevered,repPerCredit:a.rep_per_credit??n.reputation.repPerCredit,maxRepPerVisit:a.max_rep_per_visit??n.reputation.maxRepPerVisit},emergencyRescue:{towFee:s.tow_fee??n.emergencyRescue.towFee,fuelDropFee:s.fuel_drop_fee??n.emergencyRescue.fuelDropFee,fuelDropLitres:s.fuel_drop_litres??n.emergencyRescue.fuelDropLitres},economies:{minFactor:l.min_factor??n.economies.minFactor,maxFactor:l.max_factor??n.economies.maxFactor},miniGames:{maxHullDamageFraction:c.max_hull_damage_fraction??n.miniGames.maxHullDamageFraction,abandonDamageFraction:c.abandon_damage_fraction??n.miniGames.abandonDamageFraction,noDamageThreshold:c.no_damage_threshold??n.miniGames.noDamageThreshold,surface:ba(c.surface??{},n.miniGames.surface),asteroid:va(c.asteroid??{},n.miniGames.asteroid),navigation:ka(c.navigation_minigame??{},n.miniGames.navigation)}}}function Sa(){const e=Object.assign({"/docs/world/commodities.md":ci,"/docs/world/delivery-items.md":di,"/docs/world/destinations/_template.md":hi,"/docs/world/destinations/blackwake-yard.md":ui,"/docs/world/destinations/ceti-landfall.md":pi,"/docs/world/destinations/drift-market.md":mi,"/docs/world/destinations/elysium-station.md":fi,"/docs/world/destinations/eridani-anchorage.md":gi,"/docs/world/destinations/foundries-platform.md":yi,"/docs/world/destinations/galileo-transfer.md":_i,"/docs/world/destinations/hestia-ring.md":wi,"/docs/world/destinations/keelhaul-station.md":bi,"/docs/world/destinations/kepler-yard.md":vi,"/docs/world/destinations/mars-anchor.md":ki,"/docs/world/destinations/meridian-station.md":xi,"/docs/world/destinations/new-horizon-port.md":Si,"/docs/world/destinations/orrery-anchorage.md":Ti,"/docs/world/destinations/redline-station.md":Ci,"/docs/world/destinations/tycho-orbital.md":Mi,"/docs/world/destinations/veil-station.md":Ai,"/docs/world/destinations/waypoint-ceti.md":Ei,"/docs/world/economies.md":Ri,"/docs/world/factions/_template.md":Ii,"/docs/world/factions/centauri-trade-league.md":Fi,"/docs/world/factions/eridani-colonial-council.md":Li,"/docs/world/factions/free-captains.md":Di,"/docs/world/factions/grey-market-cartel.md":Oi,"/docs/world/factions/helios-directorate.md":Pi,"/docs/world/factions/independent-miners-guild.md":Hi,"/docs/world/factions/procyon-institute.md":Ni,"/docs/world/factions/terran-union.md":Bi,"/docs/world/galaxy-map.md":ji,"/docs/world/navigation/jump-routes.md":Ui,"/docs/world/npc-names.md":Yi,"/docs/world/settings/balance.md":Wi,"/docs/world/settings/new-game.md":Ki,"/docs/world/ships/_template.md":Gi,"/docs/world/ships/components/jump-drives.md":$i,"/docs/world/ships/freighter.md":qi,"/docs/world/ships/hauler.md":Vi,"/docs/world/ships/scout.md":zi,"/docs/world/story/_template.md":Xi,"/docs/world/story/enter-wolf-359.md":Ji,"/docs/world/story/first-jump.md":Qi,"/docs/world/story/opening-arrival.md":Zi,"/docs/world/systems/_template.md":et,"/docs/world/systems/alpha-centauri.md":nt,"/docs/world/systems/barnards-star.md":it,"/docs/world/systems/epsilon-eridani.md":tt,"/docs/world/systems/procyon.md":rt,"/docs/world/systems/sirius.md":ot,"/docs/world/systems/sol.md":at,"/docs/world/systems/tau-ceti.md":st,"/docs/world/systems/wolf-359.md":lt}),n={};for(const[i,r]of Object.entries(e)){const t=i.replace("/docs/world/","");n[t]=r}return sa(n)}function Ta(e){return e.size==="medium"||e.size==="large"}function Ca(e,n){return e.type==="delivery"?e.pickupComplete?n.destinationId===e.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":e.requirements.every(r=>{const t=n.cargoHold.find(o=>o.commodityId===r.commodityId);return t!==void 0&&t.qty>=r.qty})?"ready-to-deliver":"needs-supplies"}class Ne{constructor(n){const i=xe(n.shipId);if(!i)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=i.fuelCapacityL,this.cargoCapacity=i.cargoCapacityKg,this._fuelL=i.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[],this._hullIntegrity=1,this._factionReputation=new Map;for(const r of D().factions)Ta(r)&&this._factionReputation.set(r.id,0);this._destinationMissions=new Map}static createMock(){const n=ai(),i=xe(n.startingShip);if(!i)throw new Error(`Unknown starting ship: ${n.startingShip}`);return new Ne({shipId:n.startingShip,driveId:i.defaultJumpDrive,credits:n.player.startingCredits,systemId:n.startingLocation.system,destinationId:n.startingLocation.destination})}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}getInSystemHopCost(){const n=xe(this.shipId),i=D().balance;return Math.ceil(i.fuel.inSystemBaseConsumptionL*n.fuelEfficiency)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,i){const r=this._cargoHold.find(t=>t.commodityId===n);r?r.qty+=i:this._cargoHold.push({commodityId:n,qty:i})}removeCargo(n,i){const r=this._cargoHold.findIndex(t=>t.commodityId===n);r<0||(i!==void 0&&i<this._cargoHold[r].qty?this._cargoHold[r].qty-=i:this._cargoHold.splice(r,1))}get missionItemsWeightKg(){return this._missionItems.reduce((n,i)=>n+i.weightKg,0)}get cargoWeightKg(){return li(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(n,i){const r={...n,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(r),n.type==="delivery"&&(this._credits-=n.deposit,i&&(this._missionItems.push({missionId:n.id,itemName:n.itemName,weightKg:n.itemWeightKg}),r.pickupComplete=!0))}collectMissionItem(n){const i=this._activeMissions.find(r=>r.id===n);!i||i.type!=="delivery"||(i.pickupComplete=!0,this._missionItems.push({missionId:i.id,itemName:i.itemName,weightKg:i.itemWeightKg}))}completeMission(n){this._activeMissions=this._activeMissions.filter(i=>i.id!==n),this._missionItems=this._missionItems.filter(i=>i.missionId!==n)}cancelMission(n){this._activeMissions=this._activeMissions.filter(i=>i.id!==n),this._missionItems=this._missionItems.filter(i=>i.missionId!==n)}getMissionsForPickup(n){return this._activeMissions.filter(i=>i.type==="delivery"&&i.pickupDestinationId===n&&!i.pickupComplete)}getMissionsForDelivery(n){return this._activeMissions.filter(i=>i.deliveryDestinationId===n&&Ca(i,this)==="ready-to-deliver")}get hullIntegrity(){return this._hullIntegrity}applyHullDamage(n){this._hullIntegrity=Math.max(0,this._hullIntegrity-n)}getFactionReputation(n){return this._factionReputation.get(n)??0}modifyFactionReputation(n,i,r){const t=this.getFactionReputation(n),o=Math.min(r.reputation.pointsMax,Math.max(r.reputation.pointsMin,t+i));this._factionReputation.set(n,o)}getDestinationMissions(n){const i=this._destinationMissions.get(n);return i?Date.now()-i.generatedAt>D().balance.missions.missionTtlMs?[]:i.specs:[]}refreshDestinationMissions(n,i){this._destinationMissions.set(n,{specs:i,generatedAt:Date.now()})}}function v(e,n,i,r,t,o){if(n<0||n>=e.length)return;const a=e[n];for(let s=0;s<r.length;s++){const l=i+s;l>=0&&l<a.length&&(a[l]={char:r[s],fg:t,bg:o})}}const Q=3,tn=0;function Ma(e,n){return n?e-2:e}function Aa(e){return e.toLocaleString("en-US")}class Ea{constructor(n,i){this.buttonRanges=null,this.footerRow=-1,this.headerWidth=-1,this.context=n,this.player=i}render(n,i){const r=n.length,t=r>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,i.showHeader?(this.headerWidth=t,this.renderHeaderRow0(n,t,i.systemLabel),this.renderHeaderRow1(n,t,i.destinationLabel)):this.headerWidth=-1,i.showFooter&&(this.renderFooter(n,r,t,i.navOptions),this.footerRow=r-1)}renderHeaderRow0(n,i,r){const t=r!==void 0?r??"":(()=>{const c=ri(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),o="::";v(n,0,0,o,"bright-black","black"),v(n,0,o.length,t,"bright-cyan","black");const s=i-o.length-t.length-10;let l=o.length+t.length;for(let c=0;c<s;c++)n[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=s,v(n,0,l,"[M]","white","black"),l+=3,v(n,0,l," MENU","white","black"),l+=5,v(n,0,l,"::","bright-black","black")}renderHeaderRow1(n,i,r){const t=r!==void 0?r??"":(()=>{const d=this.player.destinationId?oi(this.player.destinationId):null;return d?d.name.toUpperCase():"IN SPACE"})(),o=Aa(this.player.credits),a=o.length+5,s="::";v(n,1,0,s,"bright-black","black"),v(n,1,s.length,t,"cyan","black");const l=i-s.length-t.length-a;let c=s.length+t.length;for(let d=0;d<l;d++)n[1][c+d]={char:":",fg:"bright-black",bg:"black"};c+=l,v(n,1,c,o,"green","black"),c+=o.length,v(n,1,c," CR","white","black"),c+=3,v(n,1,c,"::","bright-black","black")}renderFooter(n,i,r,t){const o=i-1,a=[];if(t.length===0){for(let l=0;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}v(n,o,0,"::","bright-black","black");let s=2;for(let l=0;l<t.length;l++){l>0&&(v(n,o,s,"::","bright-black","black"),s+=2);const c=t[l],d=`[${l+1}]`,u=` ${c.label}`,p=s;v(n,o,s,d,"white","black"),s+=d.length,v(n,o,s,u,"white","black"),s+=u.length,a.push({id:c.id,startCol:p,endCol:s})}for(let l=s;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=a}hitTestNav(n,i){if(this.footerRow<0||this.buttonRanges===null||i!==this.footerRow)return null;for(const r of this.buttonRanges)if(n>=r.startCol&&n<r.endCol)return r.id;return null}hitTestHeader(n,i){if(this.headerWidth<0||i!==0)return null;const r=this.headerWidth-10,t=this.headerWidth-2;return n>=r&&n<t?"menu":null}}class Ra{constructor(n,i,r,t){this.activeTabIdx=0,this.activated=!1,this.player=r,this.chrome=new Ea(i,r),this.opts=t,n.onCharInput&&n.onCharInput(o=>{this.activated||this.handleCharInput(o)}),n.onAction(o=>{if(!this.activated&&!this.preHandleAction(o)){if(o==="MENU"&&t.onMenu){t.onMenu();return}if(t.tabs){if(o==="LEFT"){const a=Math.max(0,this.activeTabIdx-1);a!==this.activeTabIdx&&(this.activeTabIdx=a,this.onTabChange(a));return}if(o==="RIGHT"){const a=Math.min(t.tabs.length-1,this.activeTabIdx+1);a!==this.activeTabIdx&&(this.activeTabIdx=a,this.onTabChange(a));return}}this.handleAction(o)}}),n.onTap&&n.onTap((o,a)=>{var l;if(this.activated||this.preHandleTap(o,a))return;const s=this.chrome.hitTestNav(o,a);if(s!==null){this.handleNavTap(s);return}if(this.chrome.hitTestHeader(o,a)==="menu"&&t.onMenu){t.onMenu();return}if(t.tabs&&t.title!==void 0){const c=t.showHeader??!0?Q:tn,d=((l=t.summary)==null?void 0:l.length)??0,u=c+3+d;if(a===u){let p=3;for(let h=0;h<t.tabs.length;h++){const m=t.tabs[h].length+2;if(o>=p&&o<p+m){h!==this.activeTabIdx&&(this.activeTabIdx=h,this.onTabChange(h));return}p+=m+1}return}}this.handleTap(o,a)})}preHandleAction(n){return!1}preHandleTap(n,i){return!1}handleAction(n){}handleTap(n,i){}handleNavTap(n){}handleCharInput(n){}onTabChange(n){}buildChromeConfig(){return{showHeader:this.opts.showHeader??!0,showFooter:this.opts.showFooter??!0,navOptions:this.opts.navOptions}}suspend(){this.activated=!0}resume(){this.activated=!1}update(n){}render(n){var p;const i=n.length,r=i>0?n[0].length:0,t=this.opts;for(let h=0;h<i;h++)for(let m=0;m<r;m++)n[h][m]={char:" ",fg:"black",bg:"black"};const o=this.buildChromeConfig();this.chrome.render(n,o);const a=t.showHeader??!0,s=t.showFooter??!0,l=a?Q:tn,c=((p=t.summary)==null?void 0:p.length)??0,d=Ma(i,s);let u;if(t.title!==void 0){v(n,l,2,t.title,"bright-white","black"),v(n,l+1,2,"'".repeat(t.title.length),"bright-black","black");for(let h=0;h<c;h++)v(n,l+2+h,2,t.summary[h],"bright-black","black");if(t.tabs){const h=l+3+c;let m=2;h<i&&(n[h][m]={char:"|",fg:"bright-black",bg:"black"}),m++;for(let f=0;f<t.tabs.length;f++){const g=f===this.activeTabIdx,x=` ${t.tabs[f]} `,w=g?"black":"white",_=g?"green":"black";for(const k of x)h<i&&m<r&&(n[h][m]={char:k,fg:w,bg:_}),m++;h<i&&m<r&&(n[h][m]={char:"|",fg:"bright-black",bg:"black"}),m++}u=l+5+c}else u=l+3+c}else u=l;this.renderContent(n,u,d)}}class ve extends Ra{constructor(n,i,r,t){super(n,i,r,{navOptions:t.navOptions,title:t.title}),this._completed=!1,this._onComplete=t.onComplete,this._canvasWidth=t.canvasWidth,this._canvasHeight=t.canvasHeight}renderContent(n,i,r){var h;const t=((h=n[0])==null?void 0:h.length)??0,o=n.length,a=r-i,s=this._canvasWidth??t,l=this._canvasHeight??a;let c=Math.floor((t-s)/2),d=i+Math.floor((a-l)/2);const u=Math.max(0,t-s),p=Math.max(0,o-l);c=Math.max(0,Math.min(c,u)),d=Math.max(0,Math.min(d,p)),this.renderGame(n,{top:d,left:c,width:s,height:l})}complete(n){var i;this._completed||(this._completed=!0,(i=this._onComplete)==null||i.call(this,n))}}function Ia(e){if(e.length===0)return 2166136261;let n=2166136261;for(let i=0;i<e.length;i++)n^=e.charCodeAt(i),n=Math.imul(n,16777619)>>>0;return n===0?1:n}function Fa(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}const O=1;class La extends ve{constructor(n,i,r,t){const o=r.destinationId??"";super(n,i,r,{navOptions:[],title:"DOCKING",canvasWidth:32,canvasHeight:18,onComplete:t}),this.heldKeys=new Set,this.lastActionTime=0,this.actionTimeoutMs=200,this.canvasWidth=32,this.canvasHeight=18,this.countdownSeconds=15,this.thrustForce=8,this.maxVelocity=6,this.driftIntervalMs=3e3,this.driftMaxDistanceChars=4,this.driftSpeedCharsPerSec=.8,this.perfectRadiusChars=5,this.airlockWidth=5,this.airlockHeight=3,this.lastViewport={top:0,left:0,width:32,height:18},this._joystick=null,this._primaryInput=i.primaryInput,this.rand=Fa(Ia(o));const a=(this.canvasWidth-1)/2,s=(this.canvasHeight-1)/2;this.state={shipX:a,shipY:s,shipVelX:0,shipVelY:0,airlockX:a,airlockY:s,driftTargetX:a,driftTargetY:s,driftTimer:this.driftIntervalMs*(.8+.4*this.rand()),timeRemaining:this.countdownSeconds,completed:!1},n.onTouchTrack&&n.onTouchTrack({start:(l,c,d)=>{c<Q||(this._joystick={centerCol:l,centerRow:c,currentCol:l,currentRow:c,id:d})},move:(l,c,d)=>{!this._joystick||this._joystick.id!==d||(this._joystick.currentCol=l,this._joystick.currentRow=c)},end:l=>{var c;((c=this._joystick)==null?void 0:c.id)===l&&(this._joystick=null,this.heldKeys.clear())}})}renderContent(n,i,r){var h;const t=((h=n[0])==null?void 0:h.length)??0,o=n.length,a=r-i,s=this.canvasWidth,l=this._primaryInput==="touch"?this.canvasHeight:this.canvasHeight+3;let c=Math.floor((t-s)/2),d=i+Math.floor((a-l)/2);const u=Math.max(0,t-this.canvasWidth),p=Math.max(0,o-this.canvasHeight);c=Math.max(0,Math.min(c,u)),d=Math.max(0,Math.min(d,p)),this.renderGame(n,{top:d,left:c,width:this.canvasWidth,height:this.canvasHeight})}handleAction(n){if(super.handleAction(n),n==="MENU"){this.state.completed||(this.state.completed=!0,this.complete({outcome:"skipped"}));return}(n==="UP"||n==="DOWN"||n==="LEFT"||n==="RIGHT")&&(this.heldKeys.add(n),this.lastActionTime=performance.now())}handleTap(n,i){if(this.state.completed){super.handleTap(n,i);return}if(this._primaryInput==="touch"){super.handleTap(n,i);return}const{top:r,left:t,width:o,height:a}=this.lastViewport,s=t+Math.floor(o/2),l=r+a,c=l+1,d=l+3,u=s-5,p=s+3,h=s;i===c&&n>=h-1&&n<=h+1?this.handleAction("UP"):i===d&&n>=h-1&&n<=h+1?this.handleAction("DOWN"):n>=u&&n<=u+2&&i===c+1?this.handleAction("LEFT"):n>=p&&n<=p+2&&i===c+1?this.handleAction("RIGHT"):super.handleTap(n,i)}update(n){super.update(n);const i=n/1e3;if(!this.state.completed){if(this._joystick){const r=this._joystick.currentCol-this._joystick.centerCol,t=this._joystick.currentRow-this._joystick.centerRow;this.heldKeys.clear(),t<-O&&this.heldKeys.add("UP"),t>O&&this.heldKeys.add("DOWN"),r<-O&&this.heldKeys.add("LEFT"),r>O&&this.heldKeys.add("RIGHT")}else this.clearExpiredActions();if(this.updateMovement(i),this.updateAirlockDrift(i),this.updateCountdown(i),this.state.timeRemaining<=0){const r=Math.hypot(this.state.shipX-this.state.airlockX,this.state.shipY-this.state.airlockY),t=1.5,o=r<=t?100:Math.round(Math.max(0,Math.min(1,1/(1+(r-t)/this.perfectRadiusChars)))*100);this.state.completed=!0,this.complete({outcome:"completed",result:{score:o}})}}}updateMovement(n){const i=this.state;this.heldKeys.has("UP")&&(i.shipVelY-=this.thrustForce*n),this.heldKeys.has("DOWN")&&(i.shipVelY+=this.thrustForce*n),this.heldKeys.has("LEFT")&&(i.shipVelX-=this.thrustForce*n),this.heldKeys.has("RIGHT")&&(i.shipVelX+=this.thrustForce*n),i.shipVelX=Math.max(-this.maxVelocity,Math.min(this.maxVelocity,i.shipVelX)),i.shipVelY=Math.max(-this.maxVelocity,Math.min(this.maxVelocity,i.shipVelY)),i.shipX+=i.shipVelX*n,i.shipY+=i.shipVelY*n;const r=.5;i.shipX=Math.max(r,Math.min(this.canvasWidth-1-r,i.shipX)),i.shipY=Math.max(r,Math.min(this.canvasHeight-1-r,i.shipY))}updateAirlockDrift(n){const i=this.state,r=i.driftTargetX-i.airlockX,t=i.driftTargetY-i.airlockY,o=Math.hypot(r,t);if(o<.1){const a=this.rand()*2*Math.PI,s=this.rand()*this.driftMaxDistanceChars,l=(this.canvasWidth-1)/2,c=(this.canvasHeight-1)/2;i.driftTargetX=l+Math.cos(a)*s,i.driftTargetY=c+Math.sin(a)*s,i.driftTimer=this.driftIntervalMs*(.8+.4*this.rand())}else{const a=this.driftSpeedCharsPerSec*n,s=Math.min(1,a/o);i.airlockX+=r*s,i.airlockY+=t*s}}updateCountdown(n){this.state.timeRemaining=Math.max(0,this.state.timeRemaining-n)}clearExpiredActions(){performance.now()-this.lastActionTime>this.actionTimeoutMs&&this.heldKeys.clear()}renderGame(n,i){const{top:r,left:t,width:o,height:a}=i;this.lastViewport={top:r,left:t,width:o,height:a},this.drawBorder(n,r,t,o,a),this.drawAirlock(n,r,t),this.drawShip(n,r,t),this.drawCountdown(n,r,t,o),this.drawDistance(n,r,t,a),this._primaryInput==="touch"?this._renderJoystick(n,i):this.drawControlButtons(n,r,t,o,a)}_renderJoystick(n,i){const{top:r,left:t,width:o,height:a}=i,s=(f,g,x,w)=>{var _;f<0||f>=n.length||g<0||g>=(((_=n[f])==null?void 0:_.length)??0)||(n[f][g]={char:x,fg:w,bg:"black"})};if(!this._joystick){const f="DRAG TO DOCK",g=r+a-2,x=t+Math.floor((o-f.length)/2);v(n,g,x,f,"bright-black","black");return}const{centerCol:l,centerRow:c,currentCol:d,currentRow:u}=this._joystick,p=d-l,h=u-c,m=this.heldKeys.size>0;s(c,l,"o",m?"bright-white":"white"),h<-O&&s(c-2,l,"^","bright-green"),h>O&&s(c+2,l,"v","bright-green"),p<-O&&s(c,l-2,"<","bright-green"),p>O&&s(c,l+2,">","bright-green")}drawBorder(n,i,r,t,o){const a=r+t-1,s=i+o-1;for(let l=r;l<=a;l++)i<n.length&&l<n[i].length&&(n[i][l]={char:"+",fg:"white",bg:"black"}),s<n.length&&l<n[s].length&&(n[s][l]={char:"+",fg:"white",bg:"black"});for(let l=i+1;l<s;l++)l<n.length&&(r<n[l].length&&(n[l][r]={char:"|",fg:"white",bg:"black"}),a<n[l].length&&(n[l][a]={char:"|",fg:"white",bg:"black"}))}drawAirlock(n,i,r){const t=r+1+Math.round(this.state.airlockX),o=i+1+Math.round(this.state.airlockY),a=t-Math.floor(this.airlockWidth/2),s=o-Math.floor(this.airlockHeight/2),l=[["+","-","+","-","+"],["|"," ","+"," ","|"],["+","-","+","-","+"]];for(let c=0;c<this.airlockHeight;c++)for(let d=0;d<this.airlockWidth;d++){const u=s+c,p=a+d;if(u>=i&&u<i+this.canvasHeight&&p>=r&&p<r+this.canvasWidth&&u<n.length&&p<n[u].length){const h=l[c][d];n[u][p]={char:h,fg:"bright-yellow",bg:"black"}}}}drawShip(n,i,r){const t=r+1+Math.round(this.state.shipX),o=i+1+Math.round(this.state.shipY);t>=r&&t<r+this.canvasWidth&&o>=i&&o<i+this.canvasHeight&&(o<n.length&&t<n[o].length&&(n[o][t]={char:"(",fg:"bright-green",bg:"black"}),t+1<r+this.canvasWidth&&o<n.length&&t+1<n[o].length&&(n[o][t+1]={char:"+",fg:"bright-green",bg:"black"}),t+2<r+this.canvasWidth&&o<n.length&&t+2<n[o].length&&(n[o][t+2]={char:")",fg:"bright-green",bg:"black"}))}drawCountdown(n,i,r,t){const o=`T: ${Math.ceil(this.state.timeRemaining)}`,a=r+t-1-o.length,s=i+1;v(n,s,a,o,"white","black")}drawDistance(n,i,r,t){const a=`DIST: ${Math.hypot(this.state.shipX-this.state.airlockX,this.state.shipY-this.state.airlockY).toFixed(1)}`,s=i+t-1;v(n,s,r+2,a,"white","black")}drawControlButtons(n,i,r,t,o){const a=n.length,s=a>0?n[0].length:0,l=i+o,c=r+Math.floor(t/2),d=this.heldKeys.has("UP"),u=this.heldKeys.has("DOWN"),p=this.heldKeys.has("LEFT"),h=this.heldKeys.has("RIGHT"),m="bright-green",f="bright-black",g=E=>`[${E}]`,x=l+1,w=l+2,_=l+3,k=c-5,j=c+3;if(x<a&&c-1>=0&&c+1<s){const E=g("^"),I=c-1;for(let b=0;b<E.length;b++)I+b>=0&&I+b<s&&(n[x][I+b]={char:E[b],fg:d?m:f,bg:"black"})}if(w<a){const E=g("<");for(let b=0;b<E.length;b++)k+b>=0&&k+b<s&&(n[w][k+b]={char:E[b],fg:p?m:f,bg:"black"});const I=g(">");for(let b=0;b<I.length;b++)j+b>=0&&j+b<s&&(n[w][j+b]={char:I[b],fg:h?m:f,bg:"black"})}if(_<a&&c-1>=0&&c+1<s){const E=g("v"),I=c-1;for(let b=0;b<E.length;b++)I+b>=0&&I+b<s&&(n[_][I+b]={char:E[b],fg:u?m:f,bg:"black"})}}}function Gn(e,n,i,r,t,o){let{x:a,y:s,vx:l,vy:c}=e;l*=i.airResistance**o,c+=i.gravity*o,n.up&&(c-=i.thrustForce*o),n.down&&(c+=i.thrustForce*o),n.left&&(l-=i.thrustForce*o),n.right&&(l+=i.thrustForce*o);const d=i.maxVerticalSpeed??i.thrustForce*3;return l=Math.max(-d,Math.min(d,l)),c=Math.max(-d,Math.min(d,c)),a+=l*o,s+=c*o,a=Math.max(0,Math.min(r-t,a)),{x:a,y:s,vx:l,vy:c}}function Da(e){if(e.length===0)return 2166136261;let n=2166136261;for(let i=0;i<e.length;i++)n^=e.charCodeAt(i),n=Math.imul(n,16777619)>>>0;return n===0?1:n}function Oa(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function $n(e,n,i,r,t){const o=Oa(Da(e)),a=3,s=Math.min(5,Math.floor(i/2)),l=a+Math.floor(o()*(s-a+1)),c=i-l,d=[];for(let h=0;h<n;h++){const m=Math.floor(o()*3)-1;d.push(Math.max(c-1,Math.min(c+1,c+m)))}const u=Math.max(0,n-r),p=Math.floor(o()*(u+1));for(let h=p;h<p+r&&h<n;h++)d[h]=c;return d.map((h,m)=>({surfaceRow:h,isPad:m>=p&&m<p+r}))}function qn(e,n,i){const r=Math.floor(e),t=r+2;for(let o=r;o<=t;o++)if(!(o<0||o>=i.length)&&n>=i[o].surfaceRow)return!0;return!1}function Vn(e,n,i,r,t,o){for(let a=0;a<n.length;a++){const s=n[a],l=r+a;if(l<0)continue;let c;if(s.isPad){const h=a>0&&n[a-1].isPad,m=a<n.length-1&&n[a+1].isPad;h?m?c="=":c="]":c="["}else o==="asteroid"?c="/":c="^";const d=o==="asteroid"?"*":"#",u=s.isPad?"bright-yellow":"white",p=i+s.surfaceRow;for(let h=p;h<i+t;h++){if(h<0||h>=e.length||l>=e[h].length)continue;const m=h===p;e[h][l]={char:m?c:d,fg:u,bg:"black"}}}}const Te=3,rn=2,Pa=1/60,P=1;class Ha extends ve{constructor(n,i,r,t){super(n,i,r,{navOptions:[],title:"LANDING",onComplete:t}),this._ship={x:0,y:0,vx:0,vy:1},this._heldKeys=new Set,this._lastActionTime=0,this._actionTimeoutMs=200,this._terrain=null,this._viewport=null,this._landed=!1,this._joystick=null,this._destId=r.destinationId??"",this._primaryInput=i.primaryInput;const{surface:o}=ne().miniGames;this._gravityAccel=o.gravityAccel,this._airResistance=o.airResistance,this._thrustForce=o.thrustForce,this._maxSafeSpeed=o.maxSafeSpeed,this._crashSpeed=o.crashSpeed,this._offPadScoreMultiplier=o.offPadScoreMultiplier,this._padWidth=o.padWidth,this._maxSpeed=o.maxSpeed,n.onTouchTrack&&n.onTouchTrack({start:(a,s,l)=>{s<Q||(this._joystick={centerCol:a,centerRow:s,currentCol:a,currentRow:s,id:l})},move:(a,s,l)=>{!this._joystick||this._joystick.id!==l||(this._joystick.currentCol=a,this._joystick.currentRow=s)},end:a=>{var s;((s=this._joystick)==null?void 0:s.id)===a&&(this._joystick=null,this._heldKeys.clear())}})}handleAction(n){if(super.handleAction(n),n==="MENU"){this._landed||(this._landed=!0,this.complete({outcome:"skipped"}));return}this._primaryInput!=="touch"&&(n==="UP"||n==="DOWN"||n==="LEFT"||n==="RIGHT")&&(this._heldKeys.add(n),this._lastActionTime=performance.now())}update(n){if(super.update(n),this._landed||!this._terrain||!this._viewport)return;if(this._joystick){const o=this._joystick.currentCol-this._joystick.centerCol,a=this._joystick.currentRow-this._joystick.centerRow;this._heldKeys.clear(),a<-P&&this._heldKeys.add("UP"),a>P&&this._heldKeys.add("DOWN"),o<-P&&this._heldKeys.add("LEFT"),o>P&&this._heldKeys.add("RIGHT")}else this._clearExpiredKeys();const i={gravity:this._gravityAccel,airResistance:this._airResistance,thrustForce:this._thrustForce,maxVerticalSpeed:this._maxSpeed},r={up:this._heldKeys.has("UP"),down:this._heldKeys.has("DOWN"),left:this._heldKeys.has("LEFT"),right:this._heldKeys.has("RIGHT")};let t=n/1e3;for(;t>0&&!this._landed;){const o=Math.min(t,Pa);t-=o,this._ship=Gn(this._ship,r,i,this._viewport.width,Te,o);const a=this._ship.y+(rn-1);if(qn(this._ship.x,a,this._terrain)){const s=Math.hypot(this._ship.vx,this._ship.vy);this._snapToSurface(),this._land(s);break}}}_snapToSurface(){if(!this._terrain)return;const n=Math.floor(this._ship.x),i=n+Te-1;let r=1/0;for(let t=n;t<=i;t++)t>=0&&t<this._terrain.length&&(r=Math.min(r,this._terrain[t].surfaceRow));r<1/0&&(this._ship={...this._ship,y:r-rn,vx:0,vy:0})}_land(n){if(this._landed)return;this._landed=!0;const i=n??Math.hypot(this._ship.vx,this._ship.vy),r=Math.max(0,Math.min(1,1-(i-this._maxSafeSpeed)/(this._crashSpeed-this._maxSafeSpeed))),t=Math.floor(this._ship.x)+1,o=this._terrain,a=t>=0&&t<o.length&&o[t].isPad,s=a?1:this._offPadScoreMultiplier,l=Math.round(r*s*100);this.complete({outcome:"completed",result:{score:l,speed:i,onPad:a}})}_clearExpiredKeys(){performance.now()-this._lastActionTime>this._actionTimeoutMs&&this._heldKeys.clear()}renderGame(n,i){this._terrain||(this._terrain=$n(this._destId,i.width,i.height,this._padWidth),this._ship={x:(i.width-Te)/2,y:1,vx:0,vy:1}),this._viewport=i,Vn(n,this._terrain,i.top,i.left,i.height,"planet"),this._renderShip(n,i),this._renderHUD(n,i),this._renderJoystick(n,i)}_renderShip(n,i){var a;const r=i.left+Math.round(this._ship.x),t=i.top+Math.round(this._ship.y),o=[["-","v","-"],["(","+",")"]];for(let s=0;s<o.length;s++)for(let l=0;l<o[s].length;l++){const c=t+s,d=r+l;c<0||c>=n.length||d<0||d>=(((a=n[c])==null?void 0:a.length)??0)||(n[c][d]={char:o[s][l],fg:"bright-green",bg:"black"})}}_renderHUD(n,i){const r=Math.hypot(this._ship.vx,this._ship.vy),t=`SPD:${r.toFixed(1)}`,o=i.left+i.width-t.length;if(v(n,i.top+1,o,t,"white","black"),r>this._maxSafeSpeed){const a="!! FAST",s=i.left+i.width-a.length;v(n,i.top+2,s,a,"bright-yellow","black")}}_renderJoystick(n,i){if(this._primaryInput!=="touch")return;if(!this._joystick){const u="HOLD & DRAG TO THRUST",p=this._terrain?Math.min(...this._terrain.map(f=>f.surfaceRow)):i.height-2,h=i.top+Math.max(0,p-2),m=i.left+Math.floor((i.width-u.length)/2);v(n,h,m,u,"bright-black","black");return}const{centerCol:r,centerRow:t,currentCol:o,currentRow:a}=this._joystick,s=o-r,l=a-t,c=this._heldKeys.size>0,d=(u,p,h,m)=>{var f;u<0||u>=n.length||p<0||p>=(((f=n[u])==null?void 0:f.length)??0)||(n[u][p]={char:h,fg:m,bg:"black"})};d(t,r,"o",c?"bright-white":"white"),l<-P&&d(t-2,r,"^","bright-green"),l>P&&d(t+2,r,"v","bright-green"),s<-P&&d(t,r-2,"<","bright-green"),s>P&&d(t,r+2,">","bright-green")}}const Ce=3,on=2,Na=1/60,H=1;class Ba extends ve{constructor(n,i,r,t){super(n,i,r,{navOptions:[],title:"LANDING",onComplete:t}),this._ship={x:0,y:0,vx:0,vy:1},this._heldKeys=new Set,this._lastActionTime=0,this._actionTimeoutMs=200,this._terrain=null,this._viewport=null,this._landed=!1,this._joystick=null,this._destId=r.destinationId??"",this._primaryInput=i.primaryInput;const{asteroid:o}=ne().miniGames;this._thrustForce=o.thrustForce,this._maxSafeSpeed=o.maxSafeSpeed,this._crashSpeed=o.crashSpeed,this._offPadScoreMultiplier=o.offPadScoreMultiplier,this._padWidth=o.padWidth,this._initialDownwardVelocity=o.initialDownwardVelocity,this._maxSpeed=o.maxSpeed,n.onTouchTrack&&n.onTouchTrack({start:(a,s,l)=>{s<Q||(this._joystick={centerCol:a,centerRow:s,currentCol:a,currentRow:s,id:l})},move:(a,s,l)=>{!this._joystick||this._joystick.id!==l||(this._joystick.currentCol=a,this._joystick.currentRow=s)},end:a=>{var s;((s=this._joystick)==null?void 0:s.id)===a&&(this._joystick=null,this._heldKeys.clear())}})}handleAction(n){if(super.handleAction(n),n==="MENU"){this._landed||(this._landed=!0,this.complete({outcome:"skipped"}));return}this._primaryInput!=="touch"&&(n==="UP"||n==="DOWN"||n==="LEFT"||n==="RIGHT")&&(this._heldKeys.add(n),this._lastActionTime=performance.now())}update(n){if(super.update(n),this._landed||!this._terrain||!this._viewport)return;if(this._joystick){const o=this._joystick.currentCol-this._joystick.centerCol,a=this._joystick.currentRow-this._joystick.centerRow;this._heldKeys.clear(),a<-H&&this._heldKeys.add("UP"),a>H&&this._heldKeys.add("DOWN"),o<-H&&this._heldKeys.add("LEFT"),o>H&&this._heldKeys.add("RIGHT")}else this._clearExpiredKeys();const i={gravity:0,airResistance:1,thrustForce:this._thrustForce,maxVerticalSpeed:this._maxSpeed},r={up:this._heldKeys.has("UP"),down:this._heldKeys.has("DOWN"),left:this._heldKeys.has("LEFT"),right:this._heldKeys.has("RIGHT")};let t=n/1e3;for(;t>0&&!this._landed;){const o=Math.min(t,Na);t-=o,this._ship=Gn(this._ship,r,i,this._viewport.width,Ce,o);const a=this._ship.y+(on-1);if(qn(this._ship.x,a,this._terrain)){const s=Math.hypot(this._ship.vx,this._ship.vy);this._snapToSurface(),this._land(s);break}}}_snapToSurface(){if(!this._terrain)return;const n=Math.floor(this._ship.x),i=n+Ce-1;let r=1/0;for(let t=n;t<=i;t++)t>=0&&t<this._terrain.length&&(r=Math.min(r,this._terrain[t].surfaceRow));r<1/0&&(this._ship={...this._ship,y:r-on,vx:0,vy:0})}_land(n){if(this._landed)return;this._landed=!0;const i=n??Math.hypot(this._ship.vx,this._ship.vy),r=Math.max(0,Math.min(1,1-(i-this._maxSafeSpeed)/(this._crashSpeed-this._maxSafeSpeed))),t=Math.floor(this._ship.x)+1,o=this._terrain,a=t>=0&&t<o.length&&o[t].isPad,s=a?1:this._offPadScoreMultiplier,l=Math.round(r*s*100);this.complete({outcome:"completed",result:{score:l,speed:i,onPad:a}})}_clearExpiredKeys(){performance.now()-this._lastActionTime>this._actionTimeoutMs&&this._heldKeys.clear()}renderGame(n,i){this._terrain||(this._terrain=$n(this._destId,i.width,i.height,this._padWidth),this._ship={x:(i.width-Ce)/2,y:1,vx:0,vy:this._initialDownwardVelocity}),this._viewport=i,Vn(n,this._terrain,i.top,i.left,i.height,"asteroid"),this._renderShip(n,i),this._renderHUD(n,i),this._renderJoystick(n,i)}_renderShip(n,i){var a;const r=i.left+Math.round(this._ship.x),t=i.top+Math.round(this._ship.y),o=[["-","v","-"],["(","+",")"]];for(let s=0;s<o.length;s++)for(let l=0;l<o[s].length;l++){const c=t+s,d=r+l;c<0||c>=n.length||d<0||d>=(((a=n[c])==null?void 0:a.length)??0)||(n[c][d]={char:o[s][l],fg:"bright-green",bg:"black"})}}_renderHUD(n,i){const r=Math.hypot(this._ship.vx,this._ship.vy),t=`SPD:${r.toFixed(1)}`,o=i.left+i.width-t.length;if(v(n,i.top+1,o,t,"white","black"),r>this._maxSafeSpeed){const a="!! FAST",s=i.left+i.width-a.length;v(n,i.top+2,s,a,"bright-yellow","black")}}_renderJoystick(n,i){if(this._primaryInput!=="touch")return;if(!this._joystick){const u="HOLD & DRAG TO THRUST",p=this._terrain?Math.min(...this._terrain.map(f=>f.surfaceRow)):i.height-2,h=i.top+Math.max(0,p-2),m=i.left+Math.floor((i.width-u.length)/2);v(n,h,m,u,"bright-black","black");return}const{centerCol:r,centerRow:t,currentCol:o,currentRow:a}=this._joystick,s=o-r,l=a-t,c=this._heldKeys.size>0,d=(u,p,h,m)=>{var f;u<0||u>=n.length||p<0||p>=(((f=n[u])==null?void 0:f.length)??0)||(n[u][p]={char:h,fg:m,bg:"black"})};d(t,r,"o",c?"bright-white":"white"),l<-H&&d(t-2,r,"^","bright-green"),l>H&&d(t+2,r,"v","bright-green"),s<-H&&d(t,r-2,"<","bright-green"),s>H&&d(t,r+2,">","bright-green")}}function ja(e){if(e.length===0)return 2166136261;let n=2166136261;for(let i=0;i<e.length;i++)n^=e.charCodeAt(i),n=Math.imul(n,16777619)>>>0;return n===0?1:n}function Ua(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class Ya extends ve{constructor(n,i,r,t,o){super(n,i,r,{navOptions:[],title:"NAVIGATION",onComplete:o}),this.heldKeys=new Set,this.lastViewport={top:0,left:0,width:80,height:24},this._joystick=null,this.initialized=!1,this._primaryInput=i.primaryInput;let a=null,s=null;t instanceof URLSearchParams?(a=t.get("type"),s=t.get("difficulty")):(a=t.type??null,s=t.difficulty??null),this.eventType=a??"asteroid_belt",this.difficulty=s??"normal";const l=ja(r.destinationId??"");this.rand=Ua(l),ne().miniGames.navigation.difficulties[this.difficulty].targetDistance,this.state={playerWorldX:0,playerWorldY:0,playerVelX:0,playerVelY:0,cameraScrollY:-8,obstacles:[],spawnFrontierY:0,lastEdgeSpawnFrame:0,frameCount:0,completed:!1,collisionFlashEndTime:0,outcome:"idle",lives:3,invincibilityEndTime:0},n.onTouchTrack&&n.onTouchTrack({start:(p,h,m)=>{h<Q||(this._joystick={centerCol:p,centerRow:h,currentCol:p,currentRow:h,id:m})},move:(p,h,m)=>{!this._joystick||this._joystick.id!==m||(this._joystick.currentCol=p,this._joystick.currentRow=h)},end:p=>{var h;((h=this._joystick)==null?void 0:h.id)===p&&(this._joystick=null,this.heldKeys.clear())}})}handleAction(n){if(super.handleAction(n),n==="MENU"){this.state.completed||(this.state.completed=!0,this.complete({outcome:"skipped"}));return}(n==="UP"||n==="DOWN"||n==="LEFT"||n==="RIGHT")&&this.heldKeys.add(n)}update(n){if(super.update(n),this.state.completed)return;const i=n/1e3,t=ne().miniGames.navigation,o=t.difficulties[this.difficulty],a=t.ship;if(this._joystick){const l=this._joystick.currentCol-this._joystick.centerCol,c=this._joystick.currentRow-this._joystick.centerRow;this.heldKeys.clear(),c<-1&&this.heldKeys.add("UP"),c>1&&this.heldKeys.add("DOWN"),l<-1&&this.heldKeys.add("LEFT"),l>1&&this.heldKeys.add("RIGHT")}this.updateInput(a),this.updatePosition(i,o),this.spawnObstacles(this.lastViewport,o,t),this.updateObstacles(i,o,this.lastViewport),this.checkCollisions(this.lastViewport),this.checkVictory(o),this.state.outcome==="collision"&&this.state.lives>0&&performance.now()>this.state.collisionFlashEndTime&&(this.state.outcome="idle"),this.state.frameCount++}updateInput(n){const i=n.accelerationImpulse,r=n.maxSpeedLateral,t=n.maxSpeedForward;this.heldKeys.has("LEFT")&&(this.state.playerVelX>0&&(this.state.playerVelX=0),this.state.playerVelX-=i),this.heldKeys.has("RIGHT")&&(this.state.playerVelX<0&&(this.state.playerVelX=0),this.state.playerVelX+=i),this.heldKeys.has("UP")&&(this.state.playerVelY<0&&(this.state.playerVelY=0),this.state.playerVelY+=i),this.heldKeys.has("DOWN")&&(this.state.playerVelY-=i);const o=.98;!this.heldKeys.has("LEFT")&&!this.heldKeys.has("RIGHT")&&(this.state.playerVelX*=o),this.state.playerVelX=Math.max(-r,Math.min(r,this.state.playerVelX)),this.state.playerVelY=Math.max(-t,Math.min(t,this.state.playerVelY)),this.heldKeys.clear()}updatePosition(n,i){const r=i.minScrollSpeed,t=Math.max(this.state.playerVelY,r),{width:o}=this.lastViewport;this.state.playerWorldX+=this.state.playerVelX*n,this.state.playerWorldX=Math.max(1,Math.min(o-2,this.state.playerWorldX)),this.state.playerWorldY+=t*n,this.state.cameraScrollY+=t*n}spawnObstacles(n,i,r){const{width:t,height:o}=n,a=i.obstacleDensity,s=i.edgeSpawnIntervalFrames,l=i.driftSpeedMax,c=r.eventTypes[this.eventType],d=o,u=this.state.spawnFrontierY,p=u+d,m=this.state.cameraScrollY+o;if(u<m){this.state.spawnFrontierY+=d;let f=0;for(const x of this.state.obstacles){const w=x.worldY+5;x.worldY<p&&w>u&&f++}const g=Math.ceil(a*d);for(;f<g;)this.spawnObstacleInBand(u,p,t,i,c,l),f++}if(this.state.frameCount-this.state.lastEdgeSpawnFrame>=s){this.state.lastEdgeSpawnFrame=this.state.frameCount;const f=this.rand()<.5?"left":"right",g=this.state.cameraScrollY+o+(this.rand()-.5)*20;this.spawnObstacleAtEdge(f,g,t,i,c,l)}}spawnObstacleInBand(n,i,r,t,o,a){const s=this.pickSize(o),l=this.createObstacle(s,t,a);l.worldY=n+this.rand()*(i-n),l.worldX=Math.max(0,Math.min(r-2,this.rand()*r)),this.state.obstacles.push(l)}spawnObstacleAtEdge(n,i,r,t,o,a){const s=this.pickSize(o),l=this.createObstacle(s,t,a);l.worldY=i,n==="left"?(l.worldX=-10,l.driftVx=a*(.3+.4*this.rand())):(l.worldX=r+5,l.driftVx=-a*(.3+.4*this.rand())),this.state.obstacles.push(l)}pickSize(n){const i=this.rand();return i<n.large_ratio?"large":i<n.large_ratio+n.medium_ratio?"medium":"small"}createObstacle(n,i,r){const t=this.getObstacleCells(n);return{worldX:0,worldY:0,driftVx:0,driftVy:-Math.max(.1,r*(.3+.7*this.rand())),cells:t,size:n}}getObstacleCells(n){if(n==="large")if(this.eventType==="asteroid_belt"){const i=Math.floor(this.rand()*4);return i===0?[{dcol:2,drow:0,char:"#",color:"white"},{dcol:3,drow:0,char:"@",color:"white"},{dcol:1,drow:1,char:"@",color:"white"},{dcol:2,drow:1,char:"O",color:"bright-white"},{dcol:3,drow:1,char:"#",color:"white"},{dcol:4,drow:1,char:"@",color:"white"},{dcol:0,drow:2,char:"#",color:"white"},{dcol:1,drow:2,char:"@",color:"white"},{dcol:2,drow:2,char:"O",color:"bright-white"},{dcol:3,drow:2,char:"#",color:"white"},{dcol:4,drow:2,char:"@",color:"white"},{dcol:1,drow:3,char:"#",color:"white"},{dcol:2,drow:3,char:"@",color:"white"},{dcol:3,drow:3,char:"O",color:"bright-white"},{dcol:4,drow:3,char:"#",color:"white"},{dcol:2,drow:4,char:"#",color:"white"},{dcol:3,drow:4,char:"@",color:"white"},{dcol:2,drow:5,char:"O",color:"bright-white"}]:i===1?[{dcol:1,drow:0,char:"O",color:"bright-white"},{dcol:2,drow:0,char:"@",color:"white"},{dcol:3,drow:0,char:"O",color:"bright-white"},{dcol:0,drow:1,char:"#",color:"white"},{dcol:1,drow:1,char:"O",color:"bright-white"},{dcol:2,drow:1,char:"O",color:"bright-white"},{dcol:3,drow:1,char:"O",color:"bright-white"},{dcol:4,drow:1,char:"@",color:"white"},{dcol:0,drow:2,char:"@",color:"white"},{dcol:1,drow:2,char:"O",color:"bright-white"},{dcol:2,drow:2,char:"#",color:"white"},{dcol:3,drow:2,char:"O",color:"bright-white"},{dcol:4,drow:2,char:"#",color:"white"},{dcol:1,drow:3,char:"@",color:"white"},{dcol:2,drow:3,char:"O",color:"bright-white"},{dcol:3,drow:3,char:"@",color:"white"},{dcol:2,drow:4,char:"#",color:"white"}]:i===2?[{dcol:0,drow:0,char:"#",color:"white"},{dcol:1,drow:0,char:"#",color:"white"},{dcol:2,drow:0,char:"#",color:"white"},{dcol:3,drow:0,char:"@",color:"white"},{dcol:0,drow:1,char:"#",color:"white"},{dcol:1,drow:1,char:"O",color:"bright-white"},{dcol:2,drow:1,char:"@",color:"white"},{dcol:3,drow:1,char:"#",color:"white"},{dcol:4,drow:1,char:"@",color:"white"},{dcol:0,drow:2,char:"@",color:"white"},{dcol:1,drow:2,char:"#",color:"white"},{dcol:2,drow:2,char:"@",color:"white"},{dcol:3,drow:2,char:"O",color:"bright-white"},{dcol:4,drow:2,char:"#",color:"white"},{dcol:1,drow:3,char:"#",color:"white"},{dcol:2,drow:3,char:"@",color:"white"},{dcol:3,drow:3,char:"#",color:"white"},{dcol:2,drow:4,char:"#",color:"white"},{dcol:3,drow:4,char:"@",color:"white"},{dcol:2,drow:5,char:"#",color:"white"}]:[{dcol:1,drow:0,char:"#",color:"white"},{dcol:2,drow:0,char:"#",color:"white"},{dcol:3,drow:0,char:"@",color:"white"},{dcol:4,drow:0,char:"#",color:"white"},{dcol:0,drow:1,char:"@",color:"white"},{dcol:1,drow:1,char:"O",color:"bright-white"},{dcol:2,drow:1,char:"O",color:"bright-white"},{dcol:3,drow:1,char:"O",color:"bright-white"},{dcol:4,drow:1,char:"#",color:"white"},{dcol:5,drow:1,char:"@",color:"white"},{dcol:0,drow:2,char:"#",color:"white"},{dcol:1,drow:2,char:"@",color:"white"},{dcol:2,drow:2,char:"#",color:"white"},{dcol:3,drow:2,char:"@",color:"white"},{dcol:4,drow:2,char:"O",color:"bright-white"},{dcol:5,drow:2,char:"#",color:"white"},{dcol:1,drow:3,char:"#",color:"white"},{dcol:2,drow:3,char:"@",color:"white"},{dcol:3,drow:3,char:"#",color:"white"},{dcol:4,drow:3,char:"@",color:"white"},{dcol:2,drow:4,char:"#",color:"white"},{dcol:3,drow:4,char:"#",color:"white"},{dcol:3,drow:5,char:"@",color:"white"}]}else if(this.eventType==="space_debris"){const i=Math.floor(this.rand()*3);return i===0?[{dcol:0,drow:0,char:"[",color:"bright-black"},{dcol:1,drow:0,char:"=",color:"bright-black"},{dcol:2,drow:0,char:"=",color:"bright-black"},{dcol:3,drow:0,char:"]",color:"bright-black"},{dcol:0,drow:1,char:"-",color:"bright-black"},{dcol:1,drow:1,char:"[",color:"bright-black"},{dcol:2,drow:1,char:"]",color:"bright-black"},{dcol:3,drow:1,char:"-",color:"bright-black"},{dcol:1,drow:2,char:"=",color:"bright-black"},{dcol:2,drow:2,char:"=",color:"bright-black"}]:i===1?[{dcol:1,drow:0,char:"/",color:"bright-black"},{dcol:3,drow:0,char:"\\",color:"bright-black"},{dcol:0,drow:1,char:"-",color:"bright-black"},{dcol:1,drow:1,char:"[",color:"bright-black"},{dcol:2,drow:1,char:"=",color:"bright-black"},{dcol:3,drow:1,char:"]",color:"bright-black"},{dcol:4,drow:1,char:"-",color:"bright-black"},{dcol:1,drow:2,char:"\\",color:"bright-black"},{dcol:3,drow:2,char:"/",color:"bright-black"}]:[{dcol:1,drow:0,char:"=",color:"bright-black"},{dcol:2,drow:0,char:"-",color:"bright-black"},{dcol:0,drow:1,char:"/",color:"bright-black"},{dcol:1,drow:1,char:"[",color:"bright-black"},{dcol:2,drow:1,char:"]",color:"bright-black"},{dcol:3,drow:1,char:"\\",color:"bright-black"},{dcol:1,drow:2,char:"-",color:"bright-black"},{dcol:2,drow:2,char:"=",color:"bright-black"}]}else return[{dcol:0,drow:0,char:".",color:"cyan"},{dcol:2,drow:0,char:"'",color:"cyan"},{dcol:4,drow:0,char:"`",color:"cyan"},{dcol:1,drow:1,char:"`",color:"cyan"},{dcol:3,drow:1,char:",",color:"cyan"},{dcol:0,drow:2,char:"'",color:"cyan"},{dcol:2,drow:2,char:".",color:"cyan"},{dcol:4,drow:2,char:",",color:"cyan"},{dcol:1,drow:3,char:"`",color:"bright-cyan"},{dcol:3,drow:3,char:"'",color:"cyan"}];else return n==="medium"?this.eventType==="asteroid_belt"?Math.floor(this.rand()*2)===0?[{dcol:0,drow:0,char:"@",color:"bright-white"},{dcol:1,drow:0,char:"O",color:"white"},{dcol:0,drow:1,char:"#",color:"bright-white"},{dcol:1,drow:1,char:"@",color:"white"},{dcol:1,drow:2,char:"#",color:"white"}]:[{dcol:0,drow:0,char:"#",color:"white"},{dcol:1,drow:0,char:"@",color:"bright-white"},{dcol:2,drow:0,char:"O",color:"white"},{dcol:0,drow:1,char:"O",color:"bright-white"},{dcol:1,drow:1,char:"@",color:"white"}]:this.eventType==="space_debris"?Math.floor(this.rand()*2)===0?[{dcol:0,drow:0,char:"[",color:"bright-black"},{dcol:1,drow:0,char:"=",color:"bright-black"},{dcol:2,drow:0,char:"=",color:"bright-black"},{dcol:0,drow:1,char:"-",color:"bright-black"},{dcol:2,drow:1,char:"]",color:"bright-black"}]:[{dcol:0,drow:0,char:"/",color:"bright-black"},{dcol:1,drow:0,char:"[",color:"bright-black"},{dcol:2,drow:0,char:"\\",color:"bright-black"},{dcol:1,drow:1,char:"=",color:"bright-black"}]:[{dcol:0,drow:0,char:".",color:"bright-cyan"},{dcol:1,drow:0,char:"'",color:"cyan"},{dcol:2,drow:0,char:".",color:"bright-cyan"},{dcol:0,drow:1,char:"`",color:"cyan"},{dcol:1,drow:1,char:",",color:"bright-cyan"}]:this.eventType==="asteroid_belt"?[{dcol:0,drow:0,char:"*",color:"bright-white"},{dcol:1,drow:0,char:"o",color:"white"}]:this.eventType==="space_debris"?[{dcol:0,drow:0,char:["+","=","-"][Math.floor(this.rand()*3)],color:"bright-black"},{dcol:1,drow:0,char:["-","=","/"][Math.floor(this.rand()*3)],color:"bright-black"}]:[{dcol:0,drow:0,char:".",color:"cyan"},{dcol:1,drow:0,char:"'",color:"bright-cyan"}]}updateObstacles(n,i,r){const{height:t}=r;for(const o of this.state.obstacles)o.worldX+=o.driftVx*n,o.worldY+=o.driftVy*n;this.state.obstacles=this.state.obstacles.filter(o=>o.worldY+5>this.state.cameraScrollY-5)}checkCollisions(n){if(this.state.completed||performance.now()<this.state.invincibilityEndTime||this.state.lives<=0&&this.state.outcome==="collision")return;const{width:i,height:r,top:t,left:o}=n,a=o+Math.round(this.state.playerWorldX)-1,s=a+1,l=t+r-1-Math.round(this.state.playerWorldY-this.state.cameraScrollY);if(!(l<=t))for(const c of this.state.obstacles)for(const d of c.cells){const u=o+Math.round(c.worldX+d.dcol),p=t+r-1-Math.round(c.worldY+d.drow-this.state.cameraScrollY);if(!(p<=t)&&(u===a||u===s)&&p===l){this.triggerCollision();return}}}triggerCollision(){this.state.completed||(this.state.lives--,this.state.invincibilityEndTime=performance.now()+2e3,this.state.lives<=0?(this.state.outcome="collision",this.state.collisionFlashEndTime=performance.now()+400):(this.state.outcome="collision",this.state.collisionFlashEndTime=performance.now()+200))}checkVictory(n){if(!this.state.completed)if(this.state.playerWorldY>=n.targetDistance&&this.state.lives>0){this.state.outcome="victory",this.state.completed=!0;const i=Math.max(1,Math.round(100*(this.state.lives/3)));setTimeout(()=>{this.complete({outcome:"completed",result:{score:i}})},500)}else this.state.outcome==="collision"&&this.state.lives<=0&&performance.now()>this.state.collisionFlashEndTime&&(this.state.completed=!0,this.complete({outcome:"completed",result:{score:0}}))}checkOutOfBounds(n){if(this.state.completed)return;const i=Math.round(this.state.playerWorldY-this.state.cameraScrollY),r=n.top+n.height-1;i>r&&this.triggerCollision()}renderGame(n,i){this.lastViewport=i;const{top:r,left:t,width:o,height:a}=i;this.initialized||(this.initialized=!0,this.state.playerWorldX=o/2,this.state.playerWorldY=a*2/3,this.state.cameraScrollY=this.state.playerWorldY-(a/3-1));for(let c=r;c<r+a;c++)if(c>=0&&c<n.length)for(let d=t;d<t+o;d++)d>=0&&d<n[c].length&&(n[c][d]={char:" ",fg:"white",bg:"black"});this.drawHud(n,i);for(const c of this.state.obstacles)for(const d of c.cells){const u=t+Math.round(c.worldX+d.dcol),p=r+a-1-Math.round(c.worldY+d.drow-this.state.cameraScrollY);p>r&&p>=r&&p<r+a&&u>=t&&u<t+o&&p<n.length&&u<n[p].length&&(n[p][u]={char:d.char,fg:d.color,bg:"black"})}const s=t+Math.round(this.state.playerWorldX)-1,l=r+a-1-Math.round(this.state.playerWorldY-this.state.cameraScrollY);if(l>=r&&l<r+a&&s>=t&&s<t+o-1){const c=this.state.outcome==="collision"&&Math.floor((performance.now()-(this.state.collisionFlashEndTime-400))/100)%2===0;if(performance.now()<this.state.invincibilityEndTime&&Math.floor(performance.now()/100)%2===0)return;const p=c?"bright-red":"bright-green";l<n.length&&s<n[l].length&&(n[l][s]={char:"/",fg:p,bg:"black"}),l<n.length&&s+1<n[l].length&&(n[l][s+1]={char:"\\",fg:p,bg:"black"})}this._primaryInput==="touch"&&this.renderJoystick(n,i)}renderJoystick(n,i){const{top:r,left:t,width:o,height:a}=i,s=(f,g,x,w)=>{var _;f<0||f>=n.length||g<0||g>=(((_=n[f])==null?void 0:_.length)??0)||(n[f][g]={char:x,fg:w,bg:"black"})};if(!this._joystick){const f="DRAG TO NAVIGATE",g=r+a-2,x=t+Math.floor((o-f.length)/2);for(let w=0;w<f.length&&x+w<t+o;w++)s(g,x+w,f[w],"bright-black");return}const{centerCol:l,centerRow:c,currentCol:d,currentRow:u}=this._joystick,p=d-l,h=u-c,m=1;s(c,l,"o","bright-white"),h<-m&&s(c-2,l,"^","bright-green"),h>m&&s(c+2,l,"v","bright-green"),p<-m&&s(c,l-2,"<","bright-green"),p>m&&s(c,l+2,">","bright-green")}drawHud(n,i){const{top:r,left:t,width:o}=i,c=ne().miniGames.navigation.difficulties[this.difficulty].targetDistance,d=this.state.playerWorldY,u=Math.min(1,Math.max(0,d/c)),p=15,h=Math.round(p*u);let m="";for(let k=0;k<h;k++)m+="█";for(let k=h;k<p;k++)m+="░";const f=Math.round(d).toString(),g=`[${m}] ${f}u`;if(r<n.length){let k=t;for(const j of g)k<t+o&&k<n[r].length&&(n[r][k]={char:j,fg:"bright-yellow",bg:"black"}),k++}const x=`L:${this.state.lives}`,_=t+o-x.length-5;if(r<n.length){let k=_;for(const j of x){if(k>=t&&k<t+o&&k>=0&&k<n[r].length){const E=this.state.lives===1?"bright-red":this.state.lives===2?"bright-yellow":"bright-green";n[r][k]={char:j,fg:E,bg:"black"}}k++}}}}const V=[{id:"docking",name:"Docking Mini-Game",description:"Align the ship crosshair with the airlock target before countdown expires",variants:[{id:"orbital",label:"Orbital Station",params:{locationType:"orbital"}},{id:"deep-space",label:"Deep Space",params:{locationType:"deep-space"}}]},{id:"surface-landing",name:"Planet Landing",description:"Counter gravity and air resistance to land gently on the marked pad",variants:[{id:"surface",label:"Planet Surface",params:{locationType:"surface"}}]},{id:"asteroid-landing",name:"Asteroid Landing",description:"Navigate freely with no gravity to land on the marked pad",variants:[{id:"asteroid",label:"Asteroid Surface",params:{locationType:"asteroid"}}]},{id:"navigation",name:"Space Navigation",description:"Pilot your ship through obstacles with momentum controls",variants:[{id:"asteroid_belt",label:"Asteroid Belt",params:{type:"asteroid_belt",difficulty:"normal"}},{id:"space_debris",label:"Space Debris",params:{type:"space_debris",difficulty:"normal"}},{id:"space_storm",label:"Space Storm",params:{type:"space_storm",difficulty:"normal"}}]}],Wa=[{meta:V[0],factory:(e,n,i,r,t)=>new La(e,n,i,t)},{meta:V[1],factory:(e,n,i,r,t)=>new Ha(e,n,i,t)},{meta:V[2],factory:(e,n,i,r,t)=>new Ba(e,n,i,t)},{meta:V[3],factory:(e,n,i,r,t)=>new Ya(e,n,i,r,t)}];ti(Sa());const Ka=navigator.maxTouchPoints>0?"touch":"keyboard",an={environment:"browser",primaryInput:Ka,debug:!1},zn=new URLSearchParams(window.location.search),sn=zn.get("game");sn?$a(sn,zn):Ga();function Ga(){const e=document.getElementById("root");if(!e)return;let n=`<div style="padding: 2em; font-family: 'Share Tech Mono', monospace; color: #aaa; background: #000; width: 100%;">`;if(n+='<h1 style="color: #0f0; margin-bottom: 1em;">Mini Games</h1>',V.length===0)n+="<p>No mini games registered yet.</p>";else{n+='<ul style="list-style: none; padding: 0;">';for(const i of V){if(n+='<li style="margin-bottom: 1.5em; padding: 1em; border: 1px solid #444;">',n+=`<div style="color: #0f0; font-weight: bold; margin-bottom: 0.5em;">${z(i.name)}</div>`,n+=`<div style="color: #888; margin-bottom: 0.5em;">${z(i.description)}</div>`,n+="<div>",!i.variants||i.variants.length===0)n+=`<a href="?game=${encodeURIComponent(i.id)}" style="color: #0f0; text-decoration: none; border: 1px solid #0f0; padding: 0.5em 1em; display: inline-block;">PLAY</a>`;else for(const r of i.variants){const t=new URLSearchParams({game:i.id});for(const[o,a]of Object.entries(r.params))t.set(o,a);n+=`<a href="?${t.toString()}" style="color: #0f0; text-decoration: none; border: 1px solid #0f0; padding: 0.5em 1em; display: inline-block; margin-right: 0.5em; margin-bottom: 0.5em;">${z(r.label)}</a>`}n+="</div></li>"}n+="</ul>"}n+="</div>",e.innerHTML=n}function $a(e,n){const i=Wa.find(p=>p.meta.id===e);if(!i){qa(`Mini game not found: ${z(e)}`);return}const r=document.getElementById("root");if(!r)return;r.style.display="none";const t=new Qn,o=new ii(an);o.connect();const a=Ne.createMock(),s=i.factory(o,an,a,n,d);let l=0,c=!1;function d(p){var h;c=!0,(h=o.disconnect)==null||h.call(o),t.destroy(),r.style.display="",Va(e,p)}function u(p){if(c||(l===0&&(l=p),s.update(p-l),l=p,c))return;const h=za(t.getWidth(),t.getHeight());s.render(h),t.drawBuffer(h),requestAnimationFrame(u)}requestAnimationFrame(u)}function qa(e){const n=document.getElementById("root");if(!n)return;let i=`<div style="padding: 2em; font-family: 'Share Tech Mono', monospace; color: #f00; background: #000; width: 100%;">`;i+='<h1 style="margin-bottom: 1em;">Error</h1>',i+=`<p style="margin-bottom: 1.5em;">${e}</p>`,i+='<a href="?" style="color: #0f0; text-decoration: none; border: 1px solid #0f0; padding: 0.5em 1em; display: inline-block;">Back to Index</a>',i+="</div>",n.innerHTML=i}function Va(e,n){const i=document.getElementById("root");if(!i)return;let r=`<div style="padding: 2em; font-family: 'Share Tech Mono', monospace; color: #aaa; background: #000; width: 100%;">`;r+='<h1 style="color: #0f0; margin-bottom: 1em;">Result</h1>',r+='<div style="margin-bottom: 1.5em; padding: 1em; border: 1px solid #444;">',r+=`<div style="color: #0f0; font-weight: bold; margin-bottom: 0.5em;">Outcome: ${z(n.outcome)}</div>`,n.outcome==="completed"&&n.result&&(r+='<pre style="background: #111; padding: 1em; overflow-x: auto; color: #888;">',r+=z(JSON.stringify(n.result,null,2)),r+="</pre>"),r+="</div>",r+='<a href="?" style="color: #0f0; text-decoration: none; border: 1px solid #0f0; padding: 0.5em 1em; display: inline-block;">Back to Index</a>',r+="</div>",i.innerHTML=r}function za(e,n){return Array.from({length:n},()=>Array.from({length:e},()=>({char:" ",fg:"black",bg:"black"})))}function z(e){const n=document.createElement("div");return n.textContent=e,n.innerHTML}
