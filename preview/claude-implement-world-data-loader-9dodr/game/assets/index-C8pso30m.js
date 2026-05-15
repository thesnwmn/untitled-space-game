(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function t(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=t(r);fetch(r.href,a)}})();const GRID_WIDTH=40,MIN_GRID_HEIGHT=30,MAX_GRID_HEIGHT=50,BASE_FONT_SIZE=24;function escapeHtml(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class DOMRenderer{constructor(){this.charW=0,this.charH=0,this.gridH=MIN_GRID_HEIGHT,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(GRID_WIDTH),this.pre.dataset.gridRows=String(MIN_GRID_HEIGHT),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${BASE_FONT_SIZE}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${BASE_FONT_SIZE}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const t=n.getBoundingClientRect();document.body.removeChild(n),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(GRID_WIDTH*this.charW),window.innerHeight/(MIN_GRID_HEIGHT*this.charH)),t=Math.max(MIN_GRID_HEIGHT,Math.min(MAX_GRID_HEIGHT,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${BASE_FONT_SIZE*n}px`,this.pre.style.width=`${GRID_WIDTH*this.charW*n}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const o of this.resizeHandlers)o(GRID_WIDTH,t)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const t=[];for(const o of n){let r="";for(const a of o){const s=a.fg!=="transparent"?`fg-${a.fg}`:"",l=a.bg!=="transparent"?`bg-${a.bg}`:"",c=s&&l?`${s} ${l}`:s||l,d=c?` class="${c}"`:"";r+=`<span${d}>${escapeHtml(a.char)}</span>`}t.push(r)}this.pre.innerHTML=t.join(`
`)}getWidth(){return GRID_WIDTH}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const KEY_MAP={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},DIGIT_KEYS=new Set(["0","1","2","3","4","5","6","7","8","9"]),PREVENT_DEFAULT_KEYS=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class DOMInputHandler{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}connect(){this.keyListener=n=>{if(PREVENT_DEFAULT_KEYS.has(n.key)&&n.preventDefault(),DIGIT_KEYS.has(n.key))for(const o of this.charInputHandlers.slice())o(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const o of this.charInputHandlers.slice())o("\b");return}const t=KEY_MAP[n.key];if(t)for(const o of this.actionHandlers.slice())o(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=n=>{const t=this.pointerStartMap.get(n.pointerId),o=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),!t){this.logDebug(`UP id=${n.pointerId} NO START`);return}const r=n.clientX-t.startX,a=n.clientY-t.startY,s=Math.abs(r),l=Math.abs(a);if(s<20&&l<20)if(o>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const c of this.actionHandlers.slice())c("BACK")}else{const c=this.getRectInfo(),d=this.getGridCoords(t.startX,t.startY);if(d){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${c} -> col=${d.col} row=${d.row} h=${this.tapHandlers.length}`);for(const u of this.tapHandlers.slice())u(d.col,d.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${c} -> OOB`)}else{let c;s>=l?c=r>0?"RIGHT":"LEFT":c=a>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(r)} dy=${Math.round(a)} -> ${c}`);for(const d of this.actionHandlers.slice())d(c)}},this.pointerCancelListener=n=>{this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const t=n.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(n,t){const o=document.querySelector(".game-screen");if(!o)return null;const r=o.getBoundingClientRect(),a=parseInt(o.dataset.gridCols??"1"),s=parseInt(o.dataset.gridRows??"1");if(!a||!s||!r.width||!r.height)return null;const l=Math.floor((n-r.left)/(r.width/a)),c=Math.floor((t-r.top)/(r.height/s));return l<0||l>=a||c<0||c>=s?null:{col:l,row:c}}}function writeText(e,n,t,o,r,a){if(n<0||n>=e.length)return;const s=e[n];for(let l=0;l<o.length;l++){const c=t+l;c>=0&&c<s.length&&(s[c]={char:o[l],fg:r,bg:a})}}function writeCentered(e,n,t,o,r){if(n<0||n>=e.length)return;const a=e[n].length,s=Math.max(0,Math.floor((a-t.length)/2));writeText(e,n,s,t,o,r)}function wrapText(e,n){const t=e.split(/\s+/).filter(Boolean),o=[];let r="";for(const a of t)r.length===0?r=a:r.length+1+a.length<=n?r+=" "+a:(o.push(r),r=a);return r.length>0&&o.push(r),o}const TITLE_LINES=["UNTITLED","SPACE GAME"],TITLE_ROW_START=4,TITLE_ROW_STEP=3,TAGLINE="- An ASCII space adventure -",TAGLINE_ROW=11,MENU_ROW_START=16;class MainMenuScene{constructor(n,t,o,r){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,r()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),n.onAction(a=>{this.activated||(a==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:a==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:a==="SELECT"&&this.items[this.cursorIdx].action())}),n.onTap&&n.onTap((a,s)=>{if(!this.activated){for(let l=0;l<this.items.length;l++)if(s===MENU_ROW_START+l){this.cursorIdx=l,this.items[l].action();return}}})}update(n){}render(n){const t=n.length,o=t>0?n[0].length:0;for(let s=0;s<t;s++)for(let l=0;l<o;l++)n[s][l]={char:" ",fg:"black",bg:"black"};for(let s=0;s<TITLE_LINES.length;s++)writeCentered(n,TITLE_ROW_START+s*TITLE_ROW_STEP,TITLE_LINES[s],"bright-cyan","black");writeCentered(n,TAGLINE_ROW,TAGLINE,"white","black");const r=this.items.reduce((s,l)=>Math.max(s,l.label.length+2),0),a=Math.max(0,Math.floor((o-r)/2));for(let s=0;s<this.items.length;s++){const l=MENU_ROW_START+s;if(l>=t)continue;const c=s===this.cursorIdx,d=c?"> ":"  ",u=c?"bright-green":"white";writeText(n,l,a,d+this.items[s].label,u,"black")}}}let _world=null;function initWorld(e){_world=e}function getWorld(){if(_world===null)throw new Error("World not initialised — call initWorld() before accessing world data");return _world}function getSystem(e){return getWorld().systems.find(n=>n.id===e)}function getDestination(e){return getWorld().destinations.find(n=>n.id===e)}function getRoutesFrom(e){return getWorld().routes.filter(n=>n.from===e||n.to===e)}function getDrive(e){return getWorld().drives.find(n=>n.id===e)}function getStoryBeatsByTrigger(e){return getWorld().storyBeats.filter(n=>n.trigger===e)}function getGameSettings(){return getWorld().settings}function getShip(e){return getWorld().ships.find(n=>n.id===e)}function getRoute(e,n){return getWorld().routes.find(t=>t.from===e&&t.to===n||t.from===n&&t.to===e)}function getCommodity(e){return getWorld().commodities.find(n=>n.id===e)}function getCommodities(){return getWorld().commodities}function computeCargoWeightKg(e){return e.reduce((n,t)=>{const o=getCommodity(t.commodityId);return n+t.qty*((o==null?void 0:o.weightKg)??0)},0)}const CONTENT_TOP=3;function contentBottom(e,n){return n?e-2:e}function formatCredits(e){return e.toLocaleString("en-US")}class ScreenChrome{constructor(n,t){this.buttonRanges=null,this.footerRow=-1,this.context=n,this.player=t}render(n,t){const o=n.length,r=o>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader&&(this.renderHeaderRow0(n,r),this.renderHeaderRow1(n,r)),t.showFooter&&(this.renderFooter(n,o,r,t.navOptions),this.footerRow=o-1)}renderHeaderRow0(n,t){const o=getSystem(this.player.systemId),r=o?o.name.toUpperCase():this.player.systemId.toUpperCase(),a="::";writeText(n,0,0,a,"bright-black","black"),writeText(n,0,a.length,r,"bright-cyan","black");const l=t-a.length-r.length-10;let c=a.length+r.length;for(let d=0;d<l;d++)n[0][c+d]={char:":",fg:"bright-black",bg:"black"};c+=l,writeText(n,0,c,"[M]","white","black"),c+=3,writeText(n,0,c," MENU","white","black"),c+=5,writeText(n,0,c,"::","bright-black","black")}renderHeaderRow1(n,t){const o=this.player.destinationId?getDestination(this.player.destinationId):null,r=o?o.name.toUpperCase():"IN SPACE",a=formatCredits(this.player.credits),s=a.length+5,l="::";writeText(n,1,0,l,"bright-black","black"),writeText(n,1,l.length,r,"cyan","black");const c=t-l.length-r.length-s;let d=l.length+r.length;for(let u=0;u<c;u++)n[1][d+u]={char:":",fg:"bright-black",bg:"black"};d+=c,writeText(n,1,d,a,"green","black"),d+=a.length,writeText(n,1,d," CR","white","black"),d+=3,writeText(n,1,d,"::","bright-black","black")}renderFooter(n,t,o,r){const a=t-1,s=[];if(r.length===0){for(let c=0;c<o;c++)n[a][c]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}writeText(n,a,0,"::","bright-black","black");let l=2;for(let c=0;c<r.length;c++){c>0&&(writeText(n,a,l,"::","bright-black","black"),l+=2);const d=r[c],u=`[${c+1}]`,h=` ${d.label}`,f=l;writeText(n,a,l,u,"white","black"),l+=u.length,writeText(n,a,l,h,"white","black"),l+=h.length,s.push({id:d.id,startCol:f,endCol:l})}for(let c=l;c<o;c++)n[a][c]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=s}hitTestNav(n,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const o of this.buttonRanges)if(n>=o.startCol&&n<o.endCol)return o.id;return null}}const YEAR_ROW=3,BODY_START_ROW=5;class StoryScene{constructor(n,t,o,r){this.activated=!1,this.pageIndex=0,this.onContinue=r,this.chrome=new ScreenChrome(t,o);const s=getStoryBeatsByTrigger("game-start")[0].text.split(`

`),l=s[0].trim();let c;/^YEAR\s+\d{4}$/.test(l)?(this.yearHeader=l,c=s.slice(1)):(this.yearHeader="",c=s);const d=[];for(let u=0;u<c.length;u++){const h=c[u].replace(/\n/g," "),f=wrapText(h,36);u>0&&d.push(""),d.push(...f)}this.bodyLines=d,n.onAction(u=>{this.activated||(u==="SELECT"?(this.activated=!0,this.onContinue()):u==="LEFT"?this.pageIndex>0&&this.pageIndex--:u==="RIGHT"&&this.pageIndex++)}),n.onTap&&n.onTap((u,h)=>{this.activated||(this.activated=!0,this.onContinue())})}update(n){}render(n){const t=n.length,o=t>0?n[0].length:0;for(let h=0;h<t;h++)for(let f=0;f<o;f++)n[h][f]={char:" ",fg:"black",bg:"black"};if(this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:[]}),this.yearHeader){const h=Math.max(0,Math.floor((o-this.yearHeader.length)/2));writeText(n,YEAR_ROW,h,this.yearHeader,"bright-yellow","black")}const a=t-3-BODY_START_ROW,s=Math.max(1,Math.ceil(this.bodyLines.length/a));this.pageIndex>=s&&(this.pageIndex=s-1);const l=s>1,c=this.pageIndex*a,d=Math.min(c+a,this.bodyLines.length);let u=BODY_START_ROW;for(let h=c;h<d;h++){const f=this.bodyLines[h];f!==""&&writeText(n,u,2,f,"white","black"),u++}if(l){const h=`< ${this.pageIndex+1}/${s} >`,f=o-9;writeText(n,t-3,f,h,"bright-black","black")}}}const FUEL_PER_LY=5,FUEL_PRICE_PER_L=10;class BaseMenuScene{constructor(n,t,o,r,a,s,l=[],c=null){this.activeTabIdx=0,this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.activated=!1,this.modal=null,this.title=n,this._staticItems=t,this.tabs=c,this.context=a,this.player=s,this.chrome=new ScreenChrome(a,s),this.navOptions=o,this.infoLines=l,this.itemStartRow=c!==null?CONTENT_TOP+5:CONTENT_TOP+3+l.length,r.onCharInput&&r.onCharInput(d=>{this.modal!==null&&this.modal.handleCharInput(d)}),r.onAction(d=>{if(this.modal!==null){this.modal.handleAction(d);return}this.activated||(d==="UP"?this.moveCursor(-1):d==="DOWN"?this.moveCursor(1):d==="LEFT"&&this.tabs!==null?(this.activeTabIdx=Math.max(0,this.activeTabIdx-1),this.resetCursor()):d==="RIGHT"&&this.tabs!==null?(this.activeTabIdx=Math.min(this.tabs.length-1,this.activeTabIdx+1),this.resetCursor()):d==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):d==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):d==="SELECT"?this.activateCurrent():this.handleNavAction(d))}),this.resetCursor(),r.onTap&&r.onTap((d,u)=>{if(this.modal!==null){this.modal.handleTap(d,u);return}if(this.activated)return;const h=this.chrome.hitTestNav(d,u);if(h!==null){this.handleNavTap(h);return}if(this.tabs!==null&&u===CONTENT_TOP+3){let p=3;for(let m=0;m<this.tabs.length;m++){const b=this.tabs[m].label.length+2;if(d>=p&&d<p+b){this.activeTabIdx=m,this.resetCursor();return}p+=b+1}}const f=this.rowToVisibleItemIndex(u);f!==null&&!this.items[f].disabled&&(this.cursorIdx=f,this.activateCurrent())})}get items(){var n;return this.tabs!==null?((n=this.tabs[this.activeTabIdx])==null?void 0:n.items)??[]:this._staticItems}moveCursor(n){const t=this.items,o=t.length;if(o===0)return;const r=this.cursorIdx===-1?n>0?o-1:0:this.cursorIdx;for(let a=0;a<o;a++){const s=((r+n*(a+1))%o+o)%o;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const n=this.items[this.cursorIdx];n.disabled||(this.activated=!0,n.action())}rowToVisibleItemIndex(n){var r;let t=this.itemStartRow;const o=this.items;for(let a=0;a<o.length;a++){const s=1+(((r=o[a].details)==null?void 0:r.length)??0);if(n>=t&&n<t+s)return a;t+=s}return null}resetCursor(){const n=this.items;for(let t=0;t<n.length;t++)if(!n[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(n){}handleNavTap(n){}openModal(n){this.modal=n}closeModal(){this.modal=null}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:this.navOptions}}update(n){}render(n){var k;const t=n.length,o=t>0?n[0].length:0;for(let w=0;w<t;w++)for(let _=0;_<o;_++)n[w][_]={char:" ",fg:"black",bg:"black"};const r=this.buildChromeConfig();this.chrome.render(n,r),writeText(n,CONTENT_TOP,2,this.title,"bright-white","black"),writeText(n,CONTENT_TOP+1,2,"'".repeat(this.title.length),"bright-black","black");for(let w=0;w<this.infoLines.length;w++)writeText(n,CONTENT_TOP+2+w,2,this.infoLines[w],"bright-black","black");if(this.tabs!==null){const w=CONTENT_TOP+3;let _=2;n[w][_]={char:"|",fg:"bright-black",bg:"black"},_++;for(let S=0;S<this.tabs.length;S++){const x=S===this.activeTabIdx,g=` ${this.tabs[S].label} `,E=x?"black":"white",A=x?"green":"black";for(const C of g)_<o&&(n[w][_]={char:C,fg:E,bg:A}),_++;_<o&&(n[w][_]={char:"|",fg:"bright-black",bg:"black"}),_++}}const s=contentBottom(t,r.showFooter)-1,l=s-this.itemStartRow,c=this.items,d=c.map(w=>{var _;return 1+(((_=w.details)==null?void 0:_.length)??0)}),h=d.reduce((w,_)=>w+_,0)>l,f=h?l-1:l,p=[];let m=[],b=0;for(let w=0;w<d.length;w++)b+d[w]>f?(m.length>0&&p.push(m),m=[w],b=d[w]):(m.push(w),b+=d[w]);m.length>0&&p.push(m),this.lastPageCount=Math.max(1,p.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const y=p[this.pageIndex]??[];let v=this.itemStartRow;for(const w of y){const _=c[w],S=w===this.cursorIdx,x=_.disabled?"bright-black":S?"bright-green":"white",g=_.infoFg??x,E=o-4;if(_.icon!==void 0){const A=_.icon.length;if(writeText(n,v,2,S?">":" ",x,"black"),writeText(n,v,3,_.icon,_.iconFg??x,"black"),_.info!==void 0){const R=Math.max(1,E-1-A-_.label.length-2-_.info.length);writeText(n,v,3+A,_.label+" ",x,"black"),writeText(n,v,3+A+_.label.length+1,".".repeat(R),"bright-black","black"),writeText(n,v,3+A+_.label.length+1+R+1,_.info,g,"black")}else writeText(n,v,3+A,_.label.slice(0,E-1-A),x,"black")}else if(_.info!==void 0){const A=S?"> ":"  ",C=Math.max(1,E-2-_.label.length-2-_.info.length);writeText(n,v,2,A+_.label+" ",x,"black"),writeText(n,v,2+A.length+_.label.length+1,".".repeat(C),"bright-black","black"),writeText(n,v,2+A.length+_.label.length+1+C+1,_.info,g,"black")}else if(_.details!==void 0&&_.details.length>0){writeText(n,v,2,((S?"> ":"  ")+_.label).slice(0,E),x,"black");for(let C=0;C<_.details.length;C++)v+1+C<=s&&writeText(n,v+1+C,2,("  "+_.details[C]).slice(0,E),"bright-black","black")}else writeText(n,v,2,((S?"> ":"  ")+_.label).slice(0,E),x,"black");v+=1+(((k=_.details)==null?void 0:k.length)??0)}if(h){const w=`${this.pageIndex+1}/${this.lastPageCount}`,_=s;writeText(n,_,0,"|<|","white","black");const S=Math.floor((o-w.length)/2);writeText(n,_,S,w,"bright-black","black"),writeText(n,_,o-3,"|>|","white","black")}this.modal!==null&&this.modal.render(n)}}const DIALOG_WIDTH=30;class ModalInputDialog{constructor(n){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=n,this.value=Math.max(n.field.min,Math.min(n.field.max,n.field.initialValue))}handleAction(n){const{field:t}=this.formDef;if(n==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(n==="UP"){this.value=Math.min(t.max,this.value+1);return}if(n==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(n==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(n==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(n==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}n==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(n){if(this.focus!=="field")return;const{field:t}=this.formDef;if(n==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(n>="0"&&n<="9"){const o=parseInt(n,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,o)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+o)}}handleTap(n,t){this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(n){const t=n.length,o=t>0?n[0].length:0,{title:r,field:a,derivedRows:s,confirmLabel:l}=this.formDef,c=s.length,d=8+c,u=DIALOG_WIDTH,h=Math.floor((o-u)/2),f=Math.floor((t-d)/2);for(let T=0;T<d;T++)for(let I=0;I<u;I++){const L=f+T,O=h+I;L>=0&&L<t&&O>=0&&O<o&&(n[L][O]={char:" ",fg:"white",bg:"black"})}const p=(T,I,L)=>{T>=0&&T<t&&I>=0&&I<o&&(n[T][I]={char:L,fg:"white",bg:"black"})};p(f,h,"+"),p(f,h+u-1,"+");for(let T=1;T<u-1;T++)p(f,h+T,"-");p(f+d-1,h,"+"),p(f+d-1,h+u-1,"+");for(let T=1;T<u-1;T++)p(f+d-1,h+T,"-");for(let T=1;T<d-1;T++)p(f+T,h,"|"),p(f+T,h+u-1,"|");const m=u-2,b=f+1,y=h+1+Math.floor((m-r.length)/2);writeText(n,b,y,r,"bright-white","black"),writeText(n,f+2,y,"'".repeat(r.length),"bright-black","black");const v=[a.label,...s.map(T=>T.label)],k=Math.max(...v.map(T=>T.length)),w=h+1+k+3,_=f+4,S=this.focus==="field";writeText(n,_,h+1,a.label.padEnd(k)+" : ","white","black");const x=this.value.toString().padStart(5);writeText(n,_,w,x,S?"black":"white",S?"green":"black");for(let T=0;T<c;T++){const I=s[T],L=f+5+T,O=I.compute(this.value);writeText(n,L,h+1,I.label.padEnd(k)+" : ","white","black"),writeText(n,L,w,O,"white","black")}const g=f+4+c+2,E=`[ ${l} ]`,A="[ CANCEL ]",C=3,R=E.length+C+A.length,D=Math.floor((m-R)/2),M=h+1+D,N=M+E.length+C;this.confirmRect={col:M,row:g,width:E.length},this.cancelRect={col:N,row:g,width:A.length};const F=this.focus==="confirm",P=this.focus==="cancel";writeText(n,g,M,E,F?"black":"white",F?"green":"black"),writeText(n,g,N,A,P?"black":"white",P?"green":"black")}}class StationMenuScene extends BaseMenuScene{constructor(n,t,o,r,a,s,l,c){const d=getDestination(r),u=[];d.amenities.trader&&u.push({label:"TRADER",action:s}),d.amenities.missionBoard&&u.push({label:"MISSION BOARD",action:l});const h=o.fuelCapacityL-o.fuelL,f=Math.floor(o.credits/FUEL_PRICE_PER_L),p=Math.min(h,f);let m=null;if(d.amenities.fuel&&p>0){const k=p*FUEL_PRICE_PER_L;m=u.length,u.push({label:`BUY FUEL  +${p}L  ${k}CR`,action:()=>{}})}const b=wrapText(d.description,36).slice(0,3),y=`DANGER: ${d.dangerLevel.toUpperCase()}`,v=[...b,y];super("HUB",u,[{id:"undock",label:"UNDOCK"}],n,t,o,v),this.onShip=c,this.onRefuel=a,this.fuelItemIdx=m}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx===-1)return;const t=n[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const o=this.player.fuelCapacityL-this.player.fuelL,r=Math.floor(this.player.credits/FUEL_PRICE_PER_L),a=Math.min(o,r);this.openModal(new ModalInputDialog({title:"BUY FUEL",field:{label:"Litres",initialValue:a,min:0,max:a},derivedRows:[{label:"Cost",compute:s=>`${s*FUEL_PRICE_PER_L} CR`}],confirmLabel:"BUY",onConfirm:s=>{this.closeModal(),s>0&&this.onRefuel(s*FUEL_PRICE_PER_L,s)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class TraderScene extends BaseMenuScene{constructor(n,t,o,r,a,s,l,c,d){var p;const h=((p=getDestination(r).npcs.trader)==null?void 0:p.toUpperCase())??"TRADER",f=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(h,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,o,[],f),this.traderStock=a,this.onBuy=s,this.onSell=l,this.onHub=c,this.onUndock=d,this.syncItems(),this.clampCursor()}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(n=>{const t=getCommodity(n.commodityId);if(!t)return[];const o=this.player.credits>=t.basePrice;return[{label:`${t.name} (x${n.qty})`,info:`${t.basePrice} CR`,disabled:!o,action:()=>{const r=Math.floor(this.player.credits/t.basePrice),a=Math.min(n.qty,r);this.openModal(new ModalInputDialog({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:a,min:0,max:a},derivedRows:[{label:"Total",compute:s=>`${s*t.basePrice} CR`}],confirmLabel:"BUY",onConfirm:s=>{s>0&&this.onBuy(n.commodityId,s),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const n=this.player.cargoHold;return n.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...n].flatMap(t=>{const o=getCommodity(t.commodityId);return o?[{label:`${o.name} (x${t.qty})`,info:`${o.basePrice} CR`,action:()=>{this.openModal(new ModalInputDialog({title:o.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:r=>`${r*o.basePrice} CR`}],confirmLabel:"SELL",onConfirm:r=>{r>0&&this.onSell(t.commodityId,r),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]:[]})}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const n=this.items;(this.cursorIdx<0||this.cursorIdx>=n.length||(t=n[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=n.findIndex(o=>!o.disabled))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(n){this.syncItems(),super.render(n);const t=n.length,o=`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,r=contentBottom(t,!0)-2;writeText(n,r,2,o,"bright-black","black")}}const MISSIONS=[{id:"M001",type:"rescue",title:"Find the Lost Crew",reward:500},{id:"M002",type:"delivery",title:"Deliver Fuel Core",reward:300},{id:"M003",type:"combat",title:"Clear Pirate Outpost",reward:750},{id:"M004",type:"salvage",title:"Salvage Station Debris",reward:400},{id:"M005",type:"rescue",title:"Rescue Stranded Vessel",reward:600},{id:"M006",type:"delivery",title:"Transport Supplies",reward:250},{id:"M007",type:"combat",title:"Eliminate Smugglers",reward:800}],TYPE_ICONS={rescue:"[R] ",delivery:"[D] ",combat:"[C] ",salvage:"[S] "};class MissionBoardScene extends BaseMenuScene{constructor(n,t,o,r,a,s){getDestination(r);const l=MISSIONS.map(c=>({label:c.title,icon:TYPE_ICONS[c.type],iconFg:"bright-yellow",info:`${c.reward} CR`,infoFg:"bright-green",action:()=>console.log(`[MissionBoard] Selected: ${c.title}`)}));super("MISSION BOARD",l,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,o),this.onHub=a,this.onUndock=s}activateCurrent(){if(this.items.length===0)return;const n=this.items[this.cursorIdx];n.disabled||n.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}const LAYER_COUNT=[18,10,5],LAYER_CHAR=[".","*","+"],PERIOD_MIN=[4e3,2e3,800],PERIOD_MAX=[9e3,5e3,2500],LAYER_DIM_COLOR=[null,"bright-black","white"],LAYER_NORMAL_COLOR=["bright-black","white","bright-white"],LAYER_BRIGHT_COLOR=["white","bright-white","bright-cyan"],DEFAULT_INT_ROW_START=3,DEFAULT_INT_ROW_END=25,DEFAULT_INT_COL_START=2,DEFAULT_INT_COL_END=37,TWO_PI=2*Math.PI;function lcgRand(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class Starfield{constructor(n=42){this.boundsSet=!1,this.rand=lcgRand(n),this.stars=[];for(let t=0;t<3;t++)for(let o=0;o<LAYER_COUNT[t];o++){const r=DEFAULT_INT_COL_START+Math.floor(this.rand()*(DEFAULT_INT_COL_END-DEFAULT_INT_COL_START+1)),a=DEFAULT_INT_ROW_START+Math.floor(this.rand()*(DEFAULT_INT_ROW_END-DEFAULT_INT_ROW_START+1)),s=this.rand()*TWO_PI,l=PERIOD_MIN[t]+this.rand()*(PERIOD_MAX[t]-PERIOD_MIN[t]);this.stars.push({col:r,row:a,layer:t,twinklePhase:s,twinklePeriod:l})}}update(n){for(const t of this.stars)t.twinklePhase+=TWO_PI/t.twinklePeriod*n}render(n,t,o,r,a){if(!this.boundsSet){this.boundsSet=!0;const s=DEFAULT_INT_ROW_END-DEFAULT_INT_ROW_START,l=DEFAULT_INT_COL_END-DEFAULT_INT_COL_START;{const c=(o-t)/s,d=(a-r)/l;for(const u of this.stars)u.row=Math.round(t+(u.row-DEFAULT_INT_ROW_START)*c),u.col=Math.round(r+(u.col-DEFAULT_INT_COL_START)*d)}}for(const s of this.stars){const{row:l,col:c,layer:d}=s;if(l<t||l>o||c<r||c>a)continue;const u=Math.sin(s.twinklePhase);let h;u>=.5?h=LAYER_BRIGHT_COLOR[d]:u>=-.5?h=LAYER_NORMAL_COLOR[d]:h=LAYER_DIM_COLOR[d],h!==null&&(n[l][c]={char:LAYER_CHAR[d],fg:h,bg:"black"})}}getStars(){return this.stars}}const AMP_ROW=2,AMP_COL=3,OMEGA_ROW=2*Math.PI/9e3,OMEGA_COL=2*Math.PI/12e3,PHASE_COL=Math.PI/3;function clamp(e,n,t){return Math.max(n,Math.min(t,e))}class SpaceStation{constructor(n,t,o,r,a){this.time=0,this.def=n,this.intRowStart=t,this.intRowEnd=o,this.intColStart=r,this.intColEnd=a,this.glyphHeight=n.glyph.rows.length,this.glyphWidth=Math.max(...n.glyph.rows.map(s=>s.length)),this.anchorRow=t+Math.floor((o-t)/2)-Math.floor(this.glyphHeight/2),this.anchorCol=r+Math.floor((a-r)*.6)-Math.floor(this.glyphWidth/2)}update(n){this.time+=n}getDisplayPosition(){const n=Math.round(AMP_ROW*Math.sin(this.time*OMEGA_ROW)),t=Math.round(AMP_COL*Math.sin(this.time*OMEGA_COL+PHASE_COL)),o=clamp(this.anchorRow+n,this.intRowStart,this.intRowEnd-this.glyphHeight+1),r=clamp(this.anchorCol+t,this.intColStart,this.intColEnd-this.glyphWidth+1);return{row:o,col:r}}render(n){const{row:t,col:o}=this.getDisplayPosition(),r=this.def.glyph.fg;for(let a=0;a<this.def.glyph.rows.length;a++){const s=this.def.glyph.rows[a];for(let l=0;l<s.length;l++){const c=s[l];if(c===" ")continue;const d=t+a,u=o+l;d>=0&&d<n.length&&u>=0&&u<n[d].length&&(n[d][u]={char:c,fg:r,bg:"black"})}}}}const STATION_TYPES={BEACON:{name:"BEACON",glyph:{rows:["[*]"," | "],fg:"bright-yellow"}},RELAY:{name:"RELAY",glyph:{rows:[">---<"," |*|","  |"],fg:"bright-yellow"}},RING:{name:"RING",glyph:{rows:["/-\\","|O|","\\-/"],fg:"cyan"}},HUB:{name:"HUB",glyph:{rows:["  *  ","--+--"," [H] ","  |  ","  *  "],fg:"white"}}};function pad(e,n){if(e.length>=n)return e.slice(0,n);const t=n-e.length,o=Math.floor(t/2);return" ".repeat(o)+e+" ".repeat(t-o)}const DESTINATION_TYPE_TO_STATION={civilian:STATION_TYPES.HUB,military:STATION_TYPES.RELAY,research:STATION_TYPES.RING,"black-market":STATION_TYPES.BEACON};class ShipScene{constructor(n,t,o,r,a,s){if(this.cursorIdx=0,this.activated=!1,this.h=30,this.w=40,this.station=null,this.player=o,this.context=t,this.chrome=new ScreenChrome(t,o),this.starfield=new Starfield,this.inSpace=o.destinationId===null,o.destinationId!==null){const c=getDestination(o.destinationId);this.stationType=DESTINATION_TYPE_TO_STATION[c.type]??STATION_TYPES.RELAY}else this.stationType=null;const l=()=>this.inSpace?1:2;n.onAction(c=>{this.activated||(c==="CARGO"?(this.activated=!0,s()):c==="UP"?this.cursorIdx=(this.cursorIdx-1+l())%l():c==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%l():c==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,r()):this.inSpace||(this.activated=!0,a())))}),n.onTap&&n.onTap((c,d)=>{this.activated||(d===2?c>=this.w/2&&(this.activated=!0,s()):d===this.h-1&&(c<this.w/2?(this.activated=!0,r()):this.inSpace||(this.activated=!0,a())))})}update(n){this.starfield.update(n),this.station&&this.station.update(n)}render(n){const t=n.length,o=t>0?n[0].length:0;this.h=t,this.w=o;for(let g=0;g<t;g++)for(let E=0;E<o;E++)n[g][E]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,{showHeader:!0,showFooter:!1,navOptions:[]});const r=Math.floor(o/2),a=r-3,s=2,l=3,c=4,d=t-3,u=t-2,h=t-1,f=1,p=o-2;this.stationType&&!this.station&&(this.station=new SpaceStation(this.stationType,c,d,f,p));const m=g=>({char:g,fg:"bright-black",bg:"black"}),b=pad(`FUEL:${this.player.fuelL}/${this.player.fuelCapacityL}L`,a),y=Math.round(this.player.cargoWeightKg/1e3),v=Math.round(this.player.cargoCapacity/1e3),k=pad(`CARGO: ${y}/${v}Mg`,a);n[s][1]=m("\\");for(let g=0;g<a;g++)n[s][2+g]=m(b[g]);n[s][r-1]=m("/"),n[s][r]=m("\\");for(let g=0;g<a;g++)n[s][r+1+g]=m(k[g]);n[s][r+a+1]=m("/"),n[l][1]=m("/");for(let g=0;g<a;g++)n[l][2+g]=m("¯");for(let g=0;g<a;g++)n[l][r+1+g]=m("¯");n[l][r+a+1]=m("\\");for(let g=c;g<=d;g++)n[g][0]=m("|"),n[g][o-1]=m("|");this.starfield.render(n,c,d,f,p),this.station&&this.station.render(n),writeText(n,d,f+1,"[C] CARGO","bright-black","black"),n[u][1]=m("\\");for(let g=0;g<a;g++)n[u][2+g]=m("_");for(let g=0;g<a;g++)n[u][r+1+g]=m("_");n[u][r+a+1]=m("/");const w="[T] TRAVEL",_=this.inSpace?"[ - ] DOCK":"[D] DOCK";let S=pad(w,a),x=pad(_,a);this.cursorIdx===0?S=">"+S.slice(1):this.inSpace||(x=">"+x.slice(1)),n[h][1]=m("/");for(let g=0;g<a;g++){const E=S[g];n[h][2+g]={char:E,fg:E===">"?"bright-green":"bright-yellow",bg:"black"}}n[h][r-1]=m("\\"),n[h][r]=m("/");for(let g=0;g<a;g++){const E=x[g];n[h][r+1+g]={char:E,fg:E===">"?"bright-green":this.inSpace?"bright-black":"bright-yellow",bg:"black"}}n[h][r+a+1]=m("\\")}}const TITLE="CARGO HOLD";class CargoScene{constructor(n,t,o,r){this.activated=!1,this.player=o,n.onAction(a=>{this.activated||(a==="BACK"||a==="CARGO")&&(this.activated=!0,r())})}update(n){}render(n){const t=n.length,o=t>0?n[0].length:0;for(let u=0;u<t;u++)for(let h=0;h<o;h++)n[u][h]={char:" ",fg:"black",bg:"black"};writeCentered(n,1,TITLE,"bright-white","black");const r=Math.max(0,Math.floor((o-TITLE.length)/2));writeText(n,2,r,"'".repeat(TITLE.length),"bright-black","black");const a=this.player.cargoHold,s=this.player.cargoCapacity,l=this.player.cargoWeightKg;if(a.length===0)writeCentered(n,Math.floor(t/2),"CARGO HOLD EMPTY","bright-black","black");else{let u=4;for(const f of a){if(u>=t-3)break;const p=getCommodity(f.commodityId);if(!p)continue;const m=f.qty*p.weightKg,b=`  x${f.qty}  ${p.basePrice}CR  ${m}KG`,y=Math.max(6,o-4-b.length),v=p.name,w=`${v.length>y?v.slice(0,y):v}${b}`;writeText(n,u,2,w,"white","black"),u++}const h=t-4;h>3&&writeText(n,h,2,"-".repeat(o-4),"bright-black","black")}const c=t-3,d=`TOTAL: ${l}/${s}KG`;writeText(n,c,2,d,"bright-black","black"),writeText(n,t-1,2,"[ESC] BACK","bright-black","black")}}class TravelMenuScene extends BaseMenuScene{constructor(n,t,o,r,a,s,l){const c=getSystem(o.systemId),d=getDrive(o.driveId),u=[...c.destinations.map(p=>({label:getDestination(p).name.toUpperCase(),disabled:p===o.destinationId,action:()=>r(p)})),{label:"FLY INTO SPACE",disabled:o.destinationId===null,action:s}],h=getRoutesFrom(o.systemId).map(p=>{const m=p.from===o.systemId?p.to:p.from,b=getSystem(m),y=p.stability.toUpperCase(),v=Math.ceil(FUEL_PER_LY*p.distance*d.fuelEfficiency);return{label:`${b.name.toUpperCase()}  ${p.distance}LY  [${y}]`.slice(0,36),disabled:v>o.fuelL,action:()=>a(m)}}),f=[{label:"DESTINATIONS",items:u},{label:"JUMPS",items:h}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],n,t,o,[],f),this.onShip=l}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}const ELLIPSIS_FRAMES$1=["[. . .]","[: : :]","[* * *]"],JUMP_DURATION=5e3;class JumpAnimationScene{constructor(n,t){this.elapsed=0,this.arrived=!1,this.targetSystemName=n.toUpperCase(),this.onArrival=t}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=JUMP_DURATION&&(this.arrived=!0,this.onArrival()))}render(n){const t=n.length,o=t>0?n[0].length:0;for(let c=0;c<t;c++)for(let d=0;d<o;d++)n[c][d]={char:" ",fg:"black",bg:"black"};const r=Math.floor(t/2),a=Math.floor(this.elapsed/500)%3,s=Math.ceil((JUMP_DURATION-this.elapsed)/1e3),l=Math.max(1,Math.min(5,s));writeCentered(n,r-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),writeCentered(n,r-1,"DESTINATION:","bright-black","black"),writeCentered(n,r,this.targetSystemName,"bright-white","black"),writeCentered(n,r+2,ELLIPSIS_FRAMES$1[a],"bright-black","black"),writeCentered(n,r+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const TRAVEL_DURATION=2e3,ELLIPSIS_FRAMES=["[ —   ]","[  —  ]","[   — ]"];class InSystemTravelAnimationScene{constructor(n,t,o){this.elapsed=0,this.arrived=!1,this.destinationName=n.toUpperCase(),this.onArrival=t,this.footerText=o??null}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=TRAVEL_DURATION&&(this.arrived=!0,this.onArrival()))}render(n){const t=n.length,o=t>0?n[0].length:0;for(let d=0;d<t;d++)for(let u=0;u<o;u++)n[d][u]={char:" ",fg:"black",bg:"black"};const r=Math.floor(t/2),a=Math.floor(this.elapsed/300)%3,s=Math.ceil((TRAVEL_DURATION-this.elapsed)/1e3),l=Math.max(1,Math.min(2,s));writeCentered(n,r-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),writeCentered(n,r-1,"HEADING TO:","bright-black","black"),writeCentered(n,r,this.destinationName,"bright-white","black"),writeCentered(n,r+2,ELLIPSIS_FRAMES[a],"bright-black","black");const c=this.footerText??`ARRIVING IN ${l}S`;writeCentered(n,r+4,c,"bright-black","black")}}class PlayerState{constructor(n){const t=getShip(n.shipId);if(!t)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[]}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,t){const o=this._cargoHold.find(r=>r.commodityId===n);o?o.qty+=t:this._cargoHold.push({commodityId:n,qty:t})}removeCargo(n,t){const o=this._cargoHold.findIndex(r=>r.commodityId===n);o<0||(t!==void 0&&t<this._cargoHold[o].qty?this._cargoHold[o].qty-=t:this._cargoHold.splice(o,1))}get cargoWeightKg(){return computeCargoWeightKg(this._cargoHold)}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}}const MAX_DT=100,STOCK_TTL_MS=2*60*1e3;class Game{constructor(n,t,o){this.traderStockCache=new Map,this.renderer=n,this.input=t,this.context=o;const r=getGameSettings(),a=getShip(r.startingShip);this.player=new PlayerState({shipId:r.startingShip,driveId:a.defaultJumpDrive,credits:r.player.startingCredits,systemId:r.startingLocation.system,destinationId:r.startingLocation.destination}),this.currentScene=new MainMenuScene(this.input,this.context,this.player,()=>this.goToStory())}tick(n){const t=Math.min(n,MAX_DT),o=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(o),this.renderer.drawBuffer(o)}makeBuffer(){const n=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:n},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(n){const t=Date.now(),o=this.traderStockCache.get(n);if(o&&t-o.generatedAt<STOCK_TTL_MS)return o.entries;const r=getCommodities(),a=4+Math.floor(Math.random()*3),s=[...r];for(let c=s.length-1;c>0;c--){const d=Math.floor(Math.random()*(c+1));[s[c],s[d]]=[s[d],s[c]]}const l=s.slice(0,a).map(c=>({commodityId:c.id,qty:1+Math.floor(Math.random()*8)}));return this.traderStockCache.set(n,{entries:l,generatedAt:t}),l}onBuy(n,t,o){if(t<=0)return;const r=o.findIndex(d=>d.commodityId===n);if(r<0)return;const a=o[r];if(t>a.qty)return;const s=getCommodity(n);if(!s)return;const l=t*s.basePrice;this.player.credits<l||this.player.cargoWeightKg+t*s.weightKg>this.player.cargoCapacity||(this.player.spendCredits(l),this.player.addCargo(n,t),a.qty-=t,a.qty<=0&&o.splice(r,1))}onSell(n,t,o){if(t<=0)return;const r=this.player.cargoHold.find(c=>c.commodityId===n);if(!r||r.qty<t)return;const a=getCommodity(n);if(!a)return;const s=t*a.basePrice;this.player.addCredits(s),this.player.removeCargo(n,t);const l=o.find(c=>c.commodityId===n);l?l.qty+=t:o.push({commodityId:n,qty:t})}goToMainMenu(){this.currentScene=new MainMenuScene(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new StoryScene(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new StationMenuScene(this.input,this.context,this.player,this.player.destinationId,(n,t)=>{this.player.spendCredits(n),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToShip())}goToTrader(){const n=this.player.destinationId,t=this.getOrCreateTraderStock(n);this.currentScene=new TraderScene(this.input,this.context,this.player,n,t,(o,r)=>this.onBuy(o,r,t),(o,r)=>this.onSell(o,r,t),()=>this.goToStation(),()=>this.goToShip())}goToMissionBoard(){this.currentScene=new MissionBoardScene(this.input,this.context,this.player,this.player.destinationId,()=>this.goToStation(),()=>this.goToShip())}goToShip(){this.currentScene=new ShipScene(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToStation(),()=>this.goToCargo())}goToCargo(){this.currentScene=new CargoScene(this.input,this.context,this.player,()=>this.goToShip())}goToTravelMenu(){this.currentScene=new TravelMenuScene(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip())}goToArrival(){this.currentScene=new TravelMenuScene(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip())}goToFlyIntoSpace(){this.player.undock(),this.currentScene=new InSystemTravelAnimationScene("OPEN SPACE",()=>this.goToShip(),"LAUNCHING...")}onDestinationSelected(n){this.player.dock(n),this.currentScene=new InSystemTravelAnimationScene(getDestination(n).name,()=>this.goToShip())}onJumpSelected(n){const t=getRoute(this.player.systemId,n),o=getDrive(this.player.driveId),r=Math.ceil(FUEL_PER_LY*t.distance*o.fuelEfficiency);this.player.consumeFuel(r),this.player.jumpTo(n);const a=getSystem(n).name;this.currentScene=new JumpAnimationScene(a,()=>this.goToArrival())}}const __vite_glob_0_0=`---
commodities:
  # Raw Materials — found near mining / frontier systems
  - id: iron-ore
    name: Iron Ore
    base_price: 80
    category: raw-material
    legal: true
    weight_kg: 10
    description: Unrefined iron extracted from asteroid fields and planetary crust.

  - id: rare-earth
    name: Rare Earth Elements
    base_price: 400
    category: raw-material
    legal: true
    weight_kg: 5
    description: High-value minerals essential for electronics and drive components.

  - id: deuterium
    name: Deuterium Crystals
    base_price: 200
    category: raw-material
    legal: true
    weight_kg: 3
    description: Refined hydrogen isotope used in jump drive fuel production.

  # Manufactured Goods — found near industrial / trade systems
  - id: refined-metals
    name: Refined Metals
    base_price: 220
    category: manufactured
    legal: true
    weight_kg: 8
    description: Processed alloys ready for ship construction and infrastructure work.

  - id: ship-components
    name: Ship Components
    base_price: 650
    category: manufactured
    legal: true
    weight_kg: 15
    description: Drive housings, hull panels, sensor arrays — standard replacement parts.

  - id: electronics
    name: Consumer Electronics
    base_price: 500
    category: manufactured
    legal: true
    weight_kg: 2
    description: Commercial-grade devices popular across populated stations.

  # Consumables — available at most stations
  - id: rations
    name: Ration Packs
    base_price: 60
    category: consumable
    legal: true
    weight_kg: 1
    description: Bulk-packaged food supplies for crew and colony populations.

  - id: medical-supplies
    name: Medical Supplies
    base_price: 350
    category: consumable
    legal: true
    weight_kg: 2
    description: Pharmaceuticals, surgical kits and diagnostic equipment.

  - id: fuel-cells
    name: Fuel Cells
    base_price: 180
    category: consumable
    legal: true
    weight_kg: 4
    description: Pre-charged energy cells for ship systems and surface equipment.

  # Contraband — found near lawless systems; illegal in Core Space
  - id: combat-stims
    name: Combat Stimulants
    base_price: 900
    category: contraband
    legal: false
    weight_kg: 1
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
    weight_kg: 3
    description: Unlicensed ship modifications — transponder masks, reactor overrides.
---

# Commodities

The interstellar economy runs on the movement of goods between systems
that produce them and stations that need them.

Prices listed are base values — actual trading prices shift with system
supply, demand, and the goods_bias of the local station. Contraband
commands high prices in core systems but drawing attention to yourself
is a risk all its own.
`,__vite_glob_0_1=`---
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
      mission_board:
        type: boolean
        description: take and hand in missions
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
      - mission_board
      - ship_repair
      - fuel
      - ship_dealer
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
  goods_bias:
    type: array
    items:
      type: string
    description: >
      economy tags that influence commodity pricing at this destination.
      Values should match economy tags used on system docs.
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
---

# Destination Name

_One or two paragraphs describing the destination's atmosphere, layout and character._

_What does it feel like to dock or land here? Who hangs around?_
`,__vite_glob_0_2=`---
id: blackwake-yard
name: Blackwake Yard
system: wolf-359
location_type: orbital
type: black-market

amenities:
  trader: false
  mission_board: false
  ship_repair: true
  fuel: true
  ship_dealer: false

goods_bias:
  - salvage
  - black-market

danger_level: high
tags:
  - illegal-mods
  - cartel-security
  - off-registry
---

# Blackwake Yard

_Illegal modification facility. Reactor tampering, military surplus
retrofits, hull transponder resets. Officially does not exist._
`,__vite_glob_0_3=`---
id: ceti-landfall
name: Ceti Landfall
system: tau-ceti
location_type: surface
type: civilian

amenities:
  trader: true
  mission_board: true
  ship_repair: false
  fuel: true
  ship_dealer: true

npcs:
  trader: Broker Senne
  ship_dealer: Agent Oxa

goods_bias:
  - trade

danger_level: none
tags:
  - surface-port
  - agricultural
  - colonial
---

# Ceti Landfall

_Surface port on Ceti Prime's agricultural plateau. Practical haulers and surface-capable freighters. Ship repairs not available — Waypoint Ceti handles structural work._
`,__vite_glob_0_4=`---
id: drift-market
name: Drift Market
system: wolf-359
location_type: orbital
type: black-market

amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: true

npcs:
  trader: The Quartermaster
  ship_dealer: The Fence

goods_bias:
  - salvage
  - black-market
  - scavenging

danger_level: high
tags:
  - lawless
  - no-questions-asked
  - contraband
---

# Drift Market

_Sprawling patchwork station assembled from salvaged hull sections.
Almost anything can be purchased here. No registry checks, no customs._
`,__vite_glob_0_5=`---
id: elysium-station
name: Elysium Station
system: sol
location_type: orbital
type: civilian

amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: false

npcs:
  trader: Merchant Kess

goods_bias:
  - administrative
  - trade

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
`,__vite_glob_0_6=`---
id: eridani-anchorage
name: Eridani Anchorage
system: epsilon-eridani
location_type: asteroid
type: civilian

amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: false

npcs:
  trader: Warden Fleck

goods_bias:
  - mining
  - industrial

danger_level: low
tags:
  - mining-support
  - belt-station
  - council-run
  - industrial
---

# Eridani Anchorage

_Independent belt station run by the Eridani Colonial Council. Mining support, honest repairs, and contracts that don't require Union paperwork._
`,__vite_glob_0_7=`---
id: foundries-platform
name: Foundries Platform
system: sirius
location_type: asteroid
type: civilian

amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: false

npcs:
  trader: Steward Karras

goods_bias:
  - industrial
  - military

danger_level: low
tags:
  - industrial
  - manufacturing
  - works-permit-required
---

# Foundries Platform

_Interlocked manufacturing chain in Sirius's inner asteroid belt. Industrial contracts and raw materials. Works permit required — processing office is on Meridian Station._
`,__vite_glob_0_8=`---
id: galileo-transfer
name: Galileo Transfer Hub
system: sol
location_type: orbital
type: civilian

amenities:
  trader: true
  mission_board: true
  ship_repair: false
  fuel: true
  ship_dealer: false

npcs:
  trader: Broker Valdis

goods_bias:
  - industrial
  - administrative
  - military

danger_level: low
tags:
  - busy
  - corporate
  - high-traffic
---

# Galileo Transfer Hub

_Primary civilian transport interchange between Earth and the outer system._
`,__vite_glob_0_9=`---
id: hestia-ring
name: Hestia Ring
system: alpha-centauri
location_type: orbital
type: civilian

amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: false

npcs:
  trader: Runner Cho

goods_bias:
  - shipping
  - trade

danger_level: low
tags:
  - fast-turnaround
  - volume-trade
---

# Hestia Ring

_Large-scale civilian docking structure known for rapid turnaround. Low
fees and high volume — a favourite of freight haulers on tight schedules._
`,__vite_glob_0_10=`---
id: keelhaul-station
name: Keelhaul Station
system: epsilon-eridani
location_type: orbital
type: military

amenities:
  trader: false
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: true

npcs:
  ship_dealer: Fleet Liaison Brek

goods_bias:
  - military
  - industrial

danger_level: low
tags:
  - restricted
  - military
  - shipyard
  - licensed-only
---

# Keelhaul Station

_The Terran Union's outer-core shipyard. Capital-class construction bays, military-specification vessels, and access strictly gated behind Union contractor permits._
`,__vite_glob_0_11=`---
id: kepler-yard
name: Kepler Yard
system: barnards-star
location_type: orbital
type: civilian

amenities:
  trader: false
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: true

npcs:
  ship_dealer: Dealer Mast

goods_bias:
  - mining
  - salvage

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
`,__vite_glob_0_12=`---
id: mars-anchor
name: Mars Anchor
system: sol
location_type: orbital
type: civilian

amenities:
  trader: true
  mission_board: false
  ship_repair: true
  fuel: true
  ship_dealer: true

npcs:
  trader: Factor Orin
  ship_dealer: Agent Farris

goods_bias:
  - industrial
  - military

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
`,__vite_glob_0_13=`---
id: meridian-station
name: Meridian Station
system: sirius
location_type: orbital
type: civilian

amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: true

npcs:
  trader: Syndic Havel
  ship_dealer: Agent Vorrel

goods_bias:
  - trade
  - shipping
  - industrial

danger_level: low
tags:
  - trade-hub
  - high-volume
  - league-territory
---

# Meridian Station

_Large Centauri Trade League torus orbital in Sirius's outer system. High-volume trading, consistent market data, and efficient — if impersonal — docking._
`,__vite_glob_0_14=`---
id: new-horizon-port
name: New Horizon Port
system: alpha-centauri
location_type: orbital
type: civilian

amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: true

npcs:
  trader: Syndic Marelle
  ship_dealer: Broker Cassel

goods_bias:
  - trade
  - finance
  - shipping

danger_level: low
tags:
  - trade-hub
  - wealthy
  - finance-district
---

# New Horizon Port

_The system's primary trade and passenger hub. Finance houses, guild
offices and shipping brokers occupy every level of its commercial ring._
`,__vite_glob_0_15=`---
id: orrery-anchorage
name: Orrery Anchorage
system: procyon
location_type: deep-space
type: civilian

amenities:
  trader: false
  mission_board: false
  ship_repair: true
  fuel: true
  ship_dealer: false

goods_bias: []

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
`,__vite_glob_0_16=`---
id: redline-station
name: Redline Station
system: barnards-star
location_type: orbital
type: civilian

amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: false

npcs:
  trader: Smelter Haag

goods_bias:
  - mining
  - refining
  - fuel-production

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
`,__vite_glob_0_17=`---
id: tycho-orbital
name: Tycho Orbital
system: sol
location_type: orbital
type: military

amenities:
  trader: false
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: false

goods_bias:
  - military
  - industrial

danger_level: low
tags:
  - restricted
  - military
  - licensed-only
---

# Tycho Orbital

_Military-aligned logistics and repair station in lunar orbit. Access is
restricted to licensed contractors and Terran Union vessels._
`,__vite_glob_0_18=`---
id: veil-station
name: Veil Station
system: procyon
location_type: orbital
type: research

amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: false

npcs:
  trader: Archivist Dain

goods_bias:
  - industrial
  - administrative

danger_level: none
tags:
  - research
  - restricted
  - institute-access
---

# Veil Station

_The Procyon Institute's main orbital. Specialist research equipment and navigation data; inner campus access requires Institute credentials._
`,__vite_glob_0_19=`---
id: waypoint-ceti
name: Waypoint Ceti
system: tau-ceti
location_type: orbital
type: civilian

amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: false

npcs:
  trader: Factor Yeln

goods_bias:
  - trade
  - shipping

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
`,__vite_glob_0_20=`---
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
`,__vite_glob_0_21=`---
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
---

# Centauri Trade League

_The dominant commercial authority in Alpha Centauri. Sets commodity prices
across a dozen systems and provides arbitration services for contract disputes._
`,__vite_glob_0_22=`---
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
`,__vite_glob_0_23=`---
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
---

# Free Captains

_Loose democratic council of independent operators in Wolf 359. Theoretically
govern the system; in practice share power uneasily with the Grey Market Cartel._
`,__vite_glob_0_24=`---
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
---

# Grey Market Cartel

_De facto controllers of Wolf 359's two stations. Run protection rackets,
illegal modification services, and contraband distribution networks._
`,__vite_glob_0_25=`---
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
---

# Helios Directorate

_Energy and fuel distribution conglomerate with deep roots in Sol's orbital
infrastructure. Controls the majority of fuel depot contracts system-wide._
`,__vite_glob_0_26=`---
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
---

# Independent Miners Guild

_Self-governing labour organisation holding extraction rights across
Barnard's Belt. Tight-knit and suspicious of outsiders; loyal to members._
`,__vite_glob_0_27=`---
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
`,__vite_glob_0_28=`---
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
`,__vite_glob_0_29=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,__vite_glob_0_30=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,__vite_glob_0_31=`---
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
All routes are bidirectional. Distances are in light years.

Route data lives entirely in the front matter above — the docs renderer and
game engine read from there. Add new routes as front matter entries only;
do not duplicate them here as tables or diagrams.

Only systems with a doc in \`docs/world/systems/\` may be referenced. No orphan
route entries.
`,__vite_glob_0_32=`---
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
`,__vite_glob_0_33=`---
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

Long range engines for faster than light travel between systems.`,__vite_glob_0_34=`---
id: freighter
name: Standard Freighter
class: freighter
cost: 5000
cargo_capacity_kg: 2000
fuel_capacity_l: 100
hull_points: 60
default_jump_drive: civilian-mk1
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
`,__vite_glob_0_35=`---
id: hauler
name: Deep Hauler
class: hauler
cost: 80000
cargo_capacity_kg: 8000
fuel_capacity_l: 200
hull_points: 100
default_jump_drive: hauler
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
`,__vite_glob_0_36=`---
id: scout
name: Scout Runner
class: scout
cost: 25000
cargo_capacity_kg: 500
fuel_capacity_l: 80
hull_points: 40
default_jump_drive: civilian-mk2
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
`,__vite_glob_0_37=`---
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
`,__vite_glob_0_38=`---
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
`,__vite_glob_0_39=`---
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
`,__vite_glob_0_40=`---
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
`,__vite_glob_0_41=`---
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
  economy:
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
`,__vite_glob_0_42=`---
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

economy:
  - trade
  - shipping
  - finance

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
`,__vite_glob_0_43=`---
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

economy:
  - mining
  - refining
  - fuel-production

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
`,__vite_glob_0_44=`---
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

economy:
  - military
  - industrial
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
`,__vite_glob_0_45=`---
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

economy:
  - industrial
  - administrative

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
`,__vite_glob_0_46=`---
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

economy:
  - trade
  - shipping
  - industrial

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
`,__vite_glob_0_47=`---
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

economy:
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
`,__vite_glob_0_48=`---
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

economy:
  - trade
  - industrial
  - shipping

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
`,__vite_glob_0_49=`---
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

economy:
  - salvage
  - black-market
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
`;function getDefaultExportFromCjs(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function getAugmentedNamespace(e){if(e.__esModule)return e;var n=e.default;if(typeof n=="function"){var t=function o(){return this instanceof o?Reflect.construct(n,arguments,this.constructor):n.apply(this,arguments)};t.prototype=n.prototype}else t={};return Object.defineProperty(t,"__esModule",{value:!0}),Object.keys(e).forEach(function(o){var r=Object.getOwnPropertyDescriptor(e,o);Object.defineProperty(t,o,r.get?r:{enumerable:!0,get:function(){return e[o]}})}),t}const __viteBrowserExternal={},__viteBrowserExternal$1=Object.freeze(Object.defineProperty({__proto__:null,default:__viteBrowserExternal},Symbol.toStringTag,{value:"Module"})),require$$0=getAugmentedNamespace(__viteBrowserExternal$1);var toString=Object.prototype.toString,kindOf=function(n){if(n===void 0)return"undefined";if(n===null)return"null";var t=typeof n;if(t==="boolean")return"boolean";if(t==="string")return"string";if(t==="number")return"number";if(t==="symbol")return"symbol";if(t==="function")return isGeneratorFn(n)?"generatorfunction":"function";if(isArray(n))return"array";if(isBuffer$1(n))return"buffer";if(isArguments(n))return"arguments";if(isDate(n))return"date";if(isError(n))return"error";if(isRegexp(n))return"regexp";switch(ctorName(n)){case"Symbol":return"symbol";case"Promise":return"promise";case"WeakMap":return"weakmap";case"WeakSet":return"weakset";case"Map":return"map";case"Set":return"set";case"Int8Array":return"int8array";case"Uint8Array":return"uint8array";case"Uint8ClampedArray":return"uint8clampedarray";case"Int16Array":return"int16array";case"Uint16Array":return"uint16array";case"Int32Array":return"int32array";case"Uint32Array":return"uint32array";case"Float32Array":return"float32array";case"Float64Array":return"float64array"}if(isGeneratorObj(n))return"generator";switch(t=toString.call(n),t){case"[object Object]":return"object";case"[object Map Iterator]":return"mapiterator";case"[object Set Iterator]":return"setiterator";case"[object String Iterator]":return"stringiterator";case"[object Array Iterator]":return"arrayiterator"}return t.slice(8,-1).toLowerCase().replace(/\s/g,"")};function ctorName(e){return typeof e.constructor=="function"?e.constructor.name:null}function isArray(e){return Array.isArray?Array.isArray(e):e instanceof Array}function isError(e){return e instanceof Error||typeof e.message=="string"&&e.constructor&&typeof e.constructor.stackTraceLimit=="number"}function isDate(e){return e instanceof Date?!0:typeof e.toDateString=="function"&&typeof e.getDate=="function"&&typeof e.setDate=="function"}function isRegexp(e){return e instanceof RegExp?!0:typeof e.flags=="string"&&typeof e.ignoreCase=="boolean"&&typeof e.multiline=="boolean"&&typeof e.global=="boolean"}function isGeneratorFn(e,n){return ctorName(e)==="GeneratorFunction"}function isGeneratorObj(e){return typeof e.throw=="function"&&typeof e.return=="function"&&typeof e.next=="function"}function isArguments(e){try{if(typeof e.length=="number"&&typeof e.callee=="function")return!0}catch(n){if(n.message.indexOf("callee")!==-1)return!0}return!1}function isBuffer$1(e){return e.constructor&&typeof e.constructor.isBuffer=="function"?e.constructor.isBuffer(e):!1}/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */var isExtendable=function(n){return typeof n<"u"&&n!==null&&(typeof n=="object"||typeof n=="function")},isObject$1=isExtendable,extendShallow=function(n){isObject$1(n)||(n={});for(var t=arguments.length,o=1;o<t;o++){var r=arguments[o];isObject$1(r)&&assign(n,r)}return n};function assign(e,n){for(var t in n)hasOwn(n,t)&&(e[t]=n[t])}function hasOwn(e,n){return Object.prototype.hasOwnProperty.call(e,n)}var typeOf$2=kindOf,extend$1=extendShallow,sectionMatter=function(e,n){typeof n=="function"&&(n={parse:n});var t=toObject(e),o={section_delimiter:"---",parse:identity},r=extend$1({},o,n),a=r.section_delimiter,s=t.content.split(/\r?\n/),l=null,c=createSection(),d=[],u=[];function h(v){t.content=v,l=[],d=[]}function f(v){u.length&&(c.key=getKey(u[0],a),c.content=v,r.parse(c,l),l.push(c),c=createSection(),d=[],u=[])}for(var p=0;p<s.length;p++){var m=s[p],b=u.length,y=m.trim();if(isDelimiter(y,a)){if(y.length===3&&p!==0){if(b===0||b===2){d.push(m);continue}u.push(y),c.data=d.join(`
`),d=[];continue}l===null&&h(d.join(`
`)),b===2&&f(d.join(`
`)),u.push(y);continue}d.push(m)}return l===null?h(d.join(`
`)):f(d.join(`
`)),t.sections=l,t};function isDelimiter(e,n){return!(e.slice(0,n.length)!==n||e.charAt(n.length+1)===n.slice(-1))}function toObject(e){if(typeOf$2(e)!=="object"&&(e={content:e}),typeof e.content!="string"&&!isBuffer(e.content))throw new TypeError("expected a buffer or string");return e.content=e.content.toString(),e.sections=[],e}function getKey(e,n){return e?e.slice(n.length).trim():""}function createSection(){return{key:"",data:"",content:""}}function identity(e){return e}function isBuffer(e){return e&&e.constructor&&typeof e.constructor.isBuffer=="function"?e.constructor.isBuffer(e):!1}var engines$2={exports:{}},jsYaml$1={},loader$1={},common$6={};function isNothing(e){return typeof e>"u"||e===null}function isObject(e){return typeof e=="object"&&e!==null}function toArray(e){return Array.isArray(e)?e:isNothing(e)?[]:[e]}function extend(e,n){var t,o,r,a;if(n)for(a=Object.keys(n),t=0,o=a.length;t<o;t+=1)r=a[t],e[r]=n[r];return e}function repeat(e,n){var t="",o;for(o=0;o<n;o+=1)t+=e;return t}function isNegativeZero(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}common$6.isNothing=isNothing;common$6.isObject=isObject;common$6.toArray=toArray;common$6.repeat=repeat;common$6.isNegativeZero=isNegativeZero;common$6.extend=extend;function YAMLException$4(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}YAMLException$4.prototype=Object.create(Error.prototype);YAMLException$4.prototype.constructor=YAMLException$4;YAMLException$4.prototype.toString=function(n){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!n&&this.mark&&(t+=" "+this.mark.toString()),t};var exception=YAMLException$4,common$5=common$6;function Mark$1(e,n,t,o,r){this.name=e,this.buffer=n,this.position=t,this.line=o,this.column=r}Mark$1.prototype.getSnippet=function(n,t){var o,r,a,s,l;if(!this.buffer)return null;for(n=n||4,t=t||75,o="",r=this.position;r>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(r-1))===-1;)if(r-=1,this.position-r>t/2-1){o=" ... ",r+=5;break}for(a="",s=this.position;s<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s))===-1;)if(s+=1,s-this.position>t/2-1){a=" ... ",s-=5;break}return l=this.buffer.slice(r,s),common$5.repeat(" ",n)+o+l+a+`
`+common$5.repeat(" ",n+this.position-r+o.length)+"^"};Mark$1.prototype.toString=function(n){var t,o="";return this.name&&(o+='in "'+this.name+'" '),o+="at line "+(this.line+1)+", column "+(this.column+1),n||(t=this.getSnippet(),t&&(o+=`:
`+t)),o};var mark=Mark$1,YAMLException$3=exception,TYPE_CONSTRUCTOR_OPTIONS=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],YAML_NODE_KINDS=["scalar","sequence","mapping"];function compileStyleAliases(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(o){n[String(o)]=t})}),n}function Type$h(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(TYPE_CONSTRUCTOR_OPTIONS.indexOf(t)===-1)throw new YAMLException$3('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=compileStyleAliases(n.styleAliases||null),YAML_NODE_KINDS.indexOf(this.kind)===-1)throw new YAMLException$3('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var type=Type$h,common$4=common$6,YAMLException$2=exception,Type$g=type;function compileList(e,n,t){var o=[];return e.include.forEach(function(r){t=compileList(r,n,t)}),e[n].forEach(function(r){t.forEach(function(a,s){a.tag===r.tag&&a.kind===r.kind&&o.push(s)}),t.push(r)}),t.filter(function(r,a){return o.indexOf(a)===-1})}function compileMap(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,t;function o(r){e[r.kind][r.tag]=e.fallback[r.tag]=r}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(o);return e}function Schema$5(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new YAMLException$2("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=compileList(this,"implicit",[]),this.compiledExplicit=compileList(this,"explicit",[]),this.compiledTypeMap=compileMap(this.compiledImplicit,this.compiledExplicit)}Schema$5.DEFAULT=null;Schema$5.create=function(){var n,t;switch(arguments.length){case 1:n=Schema$5.DEFAULT,t=arguments[0];break;case 2:n=arguments[0],t=arguments[1];break;default:throw new YAMLException$2("Wrong number of arguments for Schema.create function")}if(n=common$4.toArray(n),t=common$4.toArray(t),!n.every(function(o){return o instanceof Schema$5}))throw new YAMLException$2("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(o){return o instanceof Type$g}))throw new YAMLException$2("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new Schema$5({include:n,explicit:t})};var schema=Schema$5,Type$f=type,str=new Type$f("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),Type$e=type,seq=new Type$e("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Type$d=type,map=new Type$d("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Schema$4=schema,failsafe=new Schema$4({explicit:[str,seq,map]}),Type$c=type;function resolveYamlNull(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function constructYamlNull(){return null}function isNull(e){return e===null}var _null=new Type$c("tag:yaml.org,2002:null",{kind:"scalar",resolve:resolveYamlNull,construct:constructYamlNull,predicate:isNull,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Type$b=type;function resolveYamlBoolean(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function constructYamlBoolean(e){return e==="true"||e==="True"||e==="TRUE"}function isBoolean(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var bool=new Type$b("tag:yaml.org,2002:bool",{kind:"scalar",resolve:resolveYamlBoolean,construct:constructYamlBoolean,predicate:isBoolean,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),common$3=common$6,Type$a=type;function isHexCode(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function isOctCode(e){return 48<=e&&e<=55}function isDecCode(e){return 48<=e&&e<=57}function resolveYamlInteger(e){if(e===null)return!1;var n=e.length,t=0,o=!1,r;if(!n)return!1;if(r=e[t],(r==="-"||r==="+")&&(r=e[++t]),r==="0"){if(t+1===n)return!0;if(r=e[++t],r==="b"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(r!=="0"&&r!=="1")return!1;o=!0}return o&&r!=="_"}if(r==="x"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(!isHexCode(e.charCodeAt(t)))return!1;o=!0}return o&&r!=="_"}for(;t<n;t++)if(r=e[t],r!=="_"){if(!isOctCode(e.charCodeAt(t)))return!1;o=!0}return o&&r!=="_"}if(r==="_")return!1;for(;t<n;t++)if(r=e[t],r!=="_"){if(r===":")break;if(!isDecCode(e.charCodeAt(t)))return!1;o=!0}return!o||r==="_"?!1:r!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function constructYamlInteger(e){var n=e,t=1,o,r,a=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),o=n[0],(o==="-"||o==="+")&&(o==="-"&&(t=-1),n=n.slice(1),o=n[0]),n==="0"?0:o==="0"?n[1]==="b"?t*parseInt(n.slice(2),2):n[1]==="x"?t*parseInt(n,16):t*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(s){a.unshift(parseInt(s,10))}),n=0,r=1,a.forEach(function(s){n+=s*r,r*=60}),t*n):t*parseInt(n,10)}function isInteger(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!common$3.isNegativeZero(e)}var int=new Type$a("tag:yaml.org,2002:int",{kind:"scalar",resolve:resolveYamlInteger,construct:constructYamlInteger,predicate:isInteger,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),common$2=common$6,Type$9=type,YAML_FLOAT_PATTERN=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function resolveYamlFloat(e){return!(e===null||!YAML_FLOAT_PATTERN.test(e)||e[e.length-1]==="_")}function constructYamlFloat(e){var n,t,o,r;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,r=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(a){r.unshift(parseFloat(a,10))}),n=0,o=1,r.forEach(function(a){n+=a*o,o*=60}),t*n):t*parseFloat(n,10)}var SCIENTIFIC_WITHOUT_DOT=/^[-+]?[0-9]+e/;function representYamlFloat(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(common$2.isNegativeZero(e))return"-0.0";return t=e.toString(10),SCIENTIFIC_WITHOUT_DOT.test(t)?t.replace("e",".e"):t}function isFloat(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||common$2.isNegativeZero(e))}var float=new Type$9("tag:yaml.org,2002:float",{kind:"scalar",resolve:resolveYamlFloat,construct:constructYamlFloat,predicate:isFloat,represent:representYamlFloat,defaultStyle:"lowercase"}),Schema$3=schema,json=new Schema$3({include:[failsafe],implicit:[_null,bool,int,float]}),Schema$2=schema,core=new Schema$2({include:[json]}),Type$8=type,YAML_DATE_REGEXP=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),YAML_TIMESTAMP_REGEXP=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function resolveYamlTimestamp(e){return e===null?!1:YAML_DATE_REGEXP.exec(e)!==null||YAML_TIMESTAMP_REGEXP.exec(e)!==null}function constructYamlTimestamp(e){var n,t,o,r,a,s,l,c=0,d=null,u,h,f;if(n=YAML_DATE_REGEXP.exec(e),n===null&&(n=YAML_TIMESTAMP_REGEXP.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],o=+n[2]-1,r=+n[3],!n[4])return new Date(Date.UTC(t,o,r));if(a=+n[4],s=+n[5],l=+n[6],n[7]){for(c=n[7].slice(0,3);c.length<3;)c+="0";c=+c}return n[9]&&(u=+n[10],h=+(n[11]||0),d=(u*60+h)*6e4,n[9]==="-"&&(d=-d)),f=new Date(Date.UTC(t,o,r,a,s,l,c)),d&&f.setTime(f.getTime()-d),f}function representYamlTimestamp(e){return e.toISOString()}var timestamp=new Type$8("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:resolveYamlTimestamp,construct:constructYamlTimestamp,instanceOf:Date,represent:representYamlTimestamp}),Type$7=type;function resolveYamlMerge(e){return e==="<<"||e===null}var merge=new Type$7("tag:yaml.org,2002:merge",{kind:"scalar",resolve:resolveYamlMerge});function commonjsRequire(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var NodeBuffer;try{var _require$1=commonjsRequire;NodeBuffer=_require$1("buffer").Buffer}catch{}var Type$6=type,BASE64_MAP=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function resolveYamlBinary(e){if(e===null)return!1;var n,t,o=0,r=e.length,a=BASE64_MAP;for(t=0;t<r;t++)if(n=a.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;o+=6}return o%8===0}function constructYamlBinary(e){var n,t,o=e.replace(/[\r\n=]/g,""),r=o.length,a=BASE64_MAP,s=0,l=[];for(n=0;n<r;n++)n%4===0&&n&&(l.push(s>>16&255),l.push(s>>8&255),l.push(s&255)),s=s<<6|a.indexOf(o.charAt(n));return t=r%4*6,t===0?(l.push(s>>16&255),l.push(s>>8&255),l.push(s&255)):t===18?(l.push(s>>10&255),l.push(s>>2&255)):t===12&&l.push(s>>4&255),NodeBuffer?NodeBuffer.from?NodeBuffer.from(l):new NodeBuffer(l):l}function representYamlBinary(e){var n="",t=0,o,r,a=e.length,s=BASE64_MAP;for(o=0;o<a;o++)o%3===0&&o&&(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]),t=(t<<8)+e[o];return r=a%3,r===0?(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]):r===2?(n+=s[t>>10&63],n+=s[t>>4&63],n+=s[t<<2&63],n+=s[64]):r===1&&(n+=s[t>>2&63],n+=s[t<<4&63],n+=s[64],n+=s[64]),n}function isBinary(e){return NodeBuffer&&NodeBuffer.isBuffer(e)}var binary=new Type$6("tag:yaml.org,2002:binary",{kind:"scalar",resolve:resolveYamlBinary,construct:constructYamlBinary,predicate:isBinary,represent:representYamlBinary}),Type$5=type,_hasOwnProperty$3=Object.prototype.hasOwnProperty,_toString$2=Object.prototype.toString;function resolveYamlOmap(e){if(e===null)return!0;var n=[],t,o,r,a,s,l=e;for(t=0,o=l.length;t<o;t+=1){if(r=l[t],s=!1,_toString$2.call(r)!=="[object Object]")return!1;for(a in r)if(_hasOwnProperty$3.call(r,a))if(!s)s=!0;else return!1;if(!s)return!1;if(n.indexOf(a)===-1)n.push(a);else return!1}return!0}function constructYamlOmap(e){return e!==null?e:[]}var omap=new Type$5("tag:yaml.org,2002:omap",{kind:"sequence",resolve:resolveYamlOmap,construct:constructYamlOmap}),Type$4=type,_toString$1=Object.prototype.toString;function resolveYamlPairs(e){if(e===null)return!0;var n,t,o,r,a,s=e;for(a=new Array(s.length),n=0,t=s.length;n<t;n+=1){if(o=s[n],_toString$1.call(o)!=="[object Object]"||(r=Object.keys(o),r.length!==1))return!1;a[n]=[r[0],o[r[0]]]}return!0}function constructYamlPairs(e){if(e===null)return[];var n,t,o,r,a,s=e;for(a=new Array(s.length),n=0,t=s.length;n<t;n+=1)o=s[n],r=Object.keys(o),a[n]=[r[0],o[r[0]]];return a}var pairs=new Type$4("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:resolveYamlPairs,construct:constructYamlPairs}),Type$3=type,_hasOwnProperty$2=Object.prototype.hasOwnProperty;function resolveYamlSet(e){if(e===null)return!0;var n,t=e;for(n in t)if(_hasOwnProperty$2.call(t,n)&&t[n]!==null)return!1;return!0}function constructYamlSet(e){return e!==null?e:{}}var set=new Type$3("tag:yaml.org,2002:set",{kind:"mapping",resolve:resolveYamlSet,construct:constructYamlSet}),Schema$1=schema,default_safe=new Schema$1({include:[core],implicit:[timestamp,merge],explicit:[binary,omap,pairs,set]}),Type$2=type;function resolveJavascriptUndefined(){return!0}function constructJavascriptUndefined(){}function representJavascriptUndefined(){return""}function isUndefined(e){return typeof e>"u"}var _undefined=new Type$2("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:resolveJavascriptUndefined,construct:constructJavascriptUndefined,predicate:isUndefined,represent:representJavascriptUndefined}),Type$1=type;function resolveJavascriptRegExp(e){if(e===null||e.length===0)return!1;var n=e,t=/\/([gim]*)$/.exec(e),o="";return!(n[0]==="/"&&(t&&(o=t[1]),o.length>3||n[n.length-o.length-1]!=="/"))}function constructJavascriptRegExp(e){var n=e,t=/\/([gim]*)$/.exec(e),o="";return n[0]==="/"&&(t&&(o=t[1]),n=n.slice(1,n.length-o.length-1)),new RegExp(n,o)}function representJavascriptRegExp(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function isRegExp(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var regexp=new Type$1("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:resolveJavascriptRegExp,construct:constructJavascriptRegExp,predicate:isRegExp,represent:representJavascriptRegExp}),esprima;try{var _require=commonjsRequire;esprima=_require("esprima")}catch{typeof window<"u"&&(esprima=window.esprima)}var Type=type;function resolveJavascriptFunction(e){if(e===null)return!1;try{var n="("+e+")",t=esprima.parse(n,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function constructJavascriptFunction(e){var n="("+e+")",t=esprima.parse(n,{range:!0}),o=[],r;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(a){o.push(a.name)}),r=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(o,n.slice(r[0]+1,r[1]-1)):new Function(o,"return "+n.slice(r[0],r[1]))}function representJavascriptFunction(e){return e.toString()}function isFunction(e){return Object.prototype.toString.call(e)==="[object Function]"}var _function=new Type("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:resolveJavascriptFunction,construct:constructJavascriptFunction,predicate:isFunction,represent:representJavascriptFunction}),Schema=schema,default_full=Schema.DEFAULT=new Schema({include:[default_safe],explicit:[_undefined,regexp,_function]}),common$1=common$6,YAMLException$1=exception,Mark=mark,DEFAULT_SAFE_SCHEMA$1=default_safe,DEFAULT_FULL_SCHEMA$1=default_full,_hasOwnProperty$1=Object.prototype.hasOwnProperty,CONTEXT_FLOW_IN=1,CONTEXT_FLOW_OUT=2,CONTEXT_BLOCK_IN=3,CONTEXT_BLOCK_OUT=4,CHOMPING_CLIP=1,CHOMPING_STRIP=2,CHOMPING_KEEP=3,PATTERN_NON_PRINTABLE=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,PATTERN_NON_ASCII_LINE_BREAKS=/[\x85\u2028\u2029]/,PATTERN_FLOW_INDICATORS=/[,\[\]\{\}]/,PATTERN_TAG_HANDLE=/^(?:!|!!|![a-z\-]+!)$/i,PATTERN_TAG_URI=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function _class(e){return Object.prototype.toString.call(e)}function is_EOL(e){return e===10||e===13}function is_WHITE_SPACE(e){return e===9||e===32}function is_WS_OR_EOL(e){return e===9||e===32||e===10||e===13}function is_FLOW_INDICATOR(e){return e===44||e===91||e===93||e===123||e===125}function fromHexCode(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function escapedHexLen(e){return e===120?2:e===117?4:e===85?8:0}function fromDecimalCode(e){return 48<=e&&e<=57?e-48:-1}function simpleEscapeSequence(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function charFromCodepoint(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function setProperty(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var simpleEscapeCheck=new Array(256),simpleEscapeMap=new Array(256);for(var i=0;i<256;i++)simpleEscapeCheck[i]=simpleEscapeSequence(i)?1:0,simpleEscapeMap[i]=simpleEscapeSequence(i);function State$1(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||DEFAULT_FULL_SCHEMA$1,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function generateError(e,n){return new YAMLException$1(n,new Mark(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function throwError(e,n){throw generateError(e,n)}function throwWarning(e,n){e.onWarning&&e.onWarning.call(null,generateError(e,n))}var directiveHandlers={YAML:function(n,t,o){var r,a,s;n.version!==null&&throwError(n,"duplication of %YAML directive"),o.length!==1&&throwError(n,"YAML directive accepts exactly one argument"),r=/^([0-9]+)\.([0-9]+)$/.exec(o[0]),r===null&&throwError(n,"ill-formed argument of the YAML directive"),a=parseInt(r[1],10),s=parseInt(r[2],10),a!==1&&throwError(n,"unacceptable YAML version of the document"),n.version=o[0],n.checkLineBreaks=s<2,s!==1&&s!==2&&throwWarning(n,"unsupported YAML version of the document")},TAG:function(n,t,o){var r,a;o.length!==2&&throwError(n,"TAG directive accepts exactly two arguments"),r=o[0],a=o[1],PATTERN_TAG_HANDLE.test(r)||throwError(n,"ill-formed tag handle (first argument) of the TAG directive"),_hasOwnProperty$1.call(n.tagMap,r)&&throwError(n,'there is a previously declared suffix for "'+r+'" tag handle'),PATTERN_TAG_URI.test(a)||throwError(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[r]=a}};function captureSegment(e,n,t,o){var r,a,s,l;if(n<t){if(l=e.input.slice(n,t),o)for(r=0,a=l.length;r<a;r+=1)s=l.charCodeAt(r),s===9||32<=s&&s<=1114111||throwError(e,"expected valid JSON character");else PATTERN_NON_PRINTABLE.test(l)&&throwError(e,"the stream contains non-printable characters");e.result+=l}}function mergeMappings(e,n,t,o){var r,a,s,l;for(common$1.isObject(t)||throwError(e,"cannot merge mappings; the provided source object is unacceptable"),r=Object.keys(t),s=0,l=r.length;s<l;s+=1)a=r[s],_hasOwnProperty$1.call(n,a)||(setProperty(n,a,t[a]),o[a]=!0)}function storeMappingPair(e,n,t,o,r,a,s,l){var c,d;if(Array.isArray(r))for(r=Array.prototype.slice.call(r),c=0,d=r.length;c<d;c+=1)Array.isArray(r[c])&&throwError(e,"nested arrays are not supported inside keys"),typeof r=="object"&&_class(r[c])==="[object Object]"&&(r[c]="[object Object]");if(typeof r=="object"&&_class(r)==="[object Object]"&&(r="[object Object]"),r=String(r),n===null&&(n={}),o==="tag:yaml.org,2002:merge")if(Array.isArray(a))for(c=0,d=a.length;c<d;c+=1)mergeMappings(e,n,a[c],t);else mergeMappings(e,n,a,t);else!e.json&&!_hasOwnProperty$1.call(t,r)&&_hasOwnProperty$1.call(n,r)&&(e.line=s||e.line,e.position=l||e.position,throwError(e,"duplicated mapping key")),setProperty(n,r,a),delete t[r];return n}function readLineBreak(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):throwError(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function skipSeparationSpace(e,n,t){for(var o=0,r=e.input.charCodeAt(e.position);r!==0;){for(;is_WHITE_SPACE(r);)r=e.input.charCodeAt(++e.position);if(n&&r===35)do r=e.input.charCodeAt(++e.position);while(r!==10&&r!==13&&r!==0);if(is_EOL(r))for(readLineBreak(e),r=e.input.charCodeAt(e.position),o++,e.lineIndent=0;r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position);else break}return t!==-1&&o!==0&&e.lineIndent<t&&throwWarning(e,"deficient indentation"),o}function testDocumentSeparator(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||is_WS_OR_EOL(t)))}function writeFoldedLines(e,n){n===1?e.result+=" ":n>1&&(e.result+=common$1.repeat(`
`,n-1))}function readPlainScalar(e,n,t){var o,r,a,s,l,c,d,u,h=e.kind,f=e.result,p;if(p=e.input.charCodeAt(e.position),is_WS_OR_EOL(p)||is_FLOW_INDICATOR(p)||p===35||p===38||p===42||p===33||p===124||p===62||p===39||p===34||p===37||p===64||p===96||(p===63||p===45)&&(r=e.input.charCodeAt(e.position+1),is_WS_OR_EOL(r)||t&&is_FLOW_INDICATOR(r)))return!1;for(e.kind="scalar",e.result="",a=s=e.position,l=!1;p!==0;){if(p===58){if(r=e.input.charCodeAt(e.position+1),is_WS_OR_EOL(r)||t&&is_FLOW_INDICATOR(r))break}else if(p===35){if(o=e.input.charCodeAt(e.position-1),is_WS_OR_EOL(o))break}else{if(e.position===e.lineStart&&testDocumentSeparator(e)||t&&is_FLOW_INDICATOR(p))break;if(is_EOL(p))if(c=e.line,d=e.lineStart,u=e.lineIndent,skipSeparationSpace(e,!1,-1),e.lineIndent>=n){l=!0,p=e.input.charCodeAt(e.position);continue}else{e.position=s,e.line=c,e.lineStart=d,e.lineIndent=u;break}}l&&(captureSegment(e,a,s,!1),writeFoldedLines(e,e.line-c),a=s=e.position,l=!1),is_WHITE_SPACE(p)||(s=e.position+1),p=e.input.charCodeAt(++e.position)}return captureSegment(e,a,s,!1),e.result?!0:(e.kind=h,e.result=f,!1)}function readSingleQuotedScalar(e,n){var t,o,r;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,o=r=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(captureSegment(e,o,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)o=e.position,e.position++,r=e.position;else return!0;else is_EOL(t)?(captureSegment(e,o,r,!0),writeFoldedLines(e,skipSeparationSpace(e,!1,n)),o=r=e.position):e.position===e.lineStart&&testDocumentSeparator(e)?throwError(e,"unexpected end of the document within a single quoted scalar"):(e.position++,r=e.position);throwError(e,"unexpected end of the stream within a single quoted scalar")}function readDoubleQuotedScalar(e,n){var t,o,r,a,s,l;if(l=e.input.charCodeAt(e.position),l!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=o=e.position;(l=e.input.charCodeAt(e.position))!==0;){if(l===34)return captureSegment(e,t,e.position,!0),e.position++,!0;if(l===92){if(captureSegment(e,t,e.position,!0),l=e.input.charCodeAt(++e.position),is_EOL(l))skipSeparationSpace(e,!1,n);else if(l<256&&simpleEscapeCheck[l])e.result+=simpleEscapeMap[l],e.position++;else if((s=escapedHexLen(l))>0){for(r=s,a=0;r>0;r--)l=e.input.charCodeAt(++e.position),(s=fromHexCode(l))>=0?a=(a<<4)+s:throwError(e,"expected hexadecimal character");e.result+=charFromCodepoint(a),e.position++}else throwError(e,"unknown escape sequence");t=o=e.position}else is_EOL(l)?(captureSegment(e,t,o,!0),writeFoldedLines(e,skipSeparationSpace(e,!1,n)),t=o=e.position):e.position===e.lineStart&&testDocumentSeparator(e)?throwError(e,"unexpected end of the document within a double quoted scalar"):(e.position++,o=e.position)}throwError(e,"unexpected end of the stream within a double quoted scalar")}function readFlowCollection(e,n){var t=!0,o,r=e.tag,a,s=e.anchor,l,c,d,u,h,f={},p,m,b,y;if(y=e.input.charCodeAt(e.position),y===91)c=93,h=!1,a=[];else if(y===123)c=125,h=!0,a={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),y=e.input.charCodeAt(++e.position);y!==0;){if(skipSeparationSpace(e,!0,n),y=e.input.charCodeAt(e.position),y===c)return e.position++,e.tag=r,e.anchor=s,e.kind=h?"mapping":"sequence",e.result=a,!0;t||throwError(e,"missed comma between flow collection entries"),m=p=b=null,d=u=!1,y===63&&(l=e.input.charCodeAt(e.position+1),is_WS_OR_EOL(l)&&(d=u=!0,e.position++,skipSeparationSpace(e,!0,n))),o=e.line,composeNode(e,n,CONTEXT_FLOW_IN,!1,!0),m=e.tag,p=e.result,skipSeparationSpace(e,!0,n),y=e.input.charCodeAt(e.position),(u||e.line===o)&&y===58&&(d=!0,y=e.input.charCodeAt(++e.position),skipSeparationSpace(e,!0,n),composeNode(e,n,CONTEXT_FLOW_IN,!1,!0),b=e.result),h?storeMappingPair(e,a,f,m,p,b):d?a.push(storeMappingPair(e,null,f,m,p,b)):a.push(p),skipSeparationSpace(e,!0,n),y=e.input.charCodeAt(e.position),y===44?(t=!0,y=e.input.charCodeAt(++e.position)):t=!1}throwError(e,"unexpected end of the stream within a flow collection")}function readBlockScalar(e,n){var t,o,r=CHOMPING_CLIP,a=!1,s=!1,l=n,c=0,d=!1,u,h;if(h=e.input.charCodeAt(e.position),h===124)o=!1;else if(h===62)o=!0;else return!1;for(e.kind="scalar",e.result="";h!==0;)if(h=e.input.charCodeAt(++e.position),h===43||h===45)CHOMPING_CLIP===r?r=h===43?CHOMPING_KEEP:CHOMPING_STRIP:throwError(e,"repeat of a chomping mode identifier");else if((u=fromDecimalCode(h))>=0)u===0?throwError(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?throwError(e,"repeat of an indentation width identifier"):(l=n+u-1,s=!0);else break;if(is_WHITE_SPACE(h)){do h=e.input.charCodeAt(++e.position);while(is_WHITE_SPACE(h));if(h===35)do h=e.input.charCodeAt(++e.position);while(!is_EOL(h)&&h!==0)}for(;h!==0;){for(readLineBreak(e),e.lineIndent=0,h=e.input.charCodeAt(e.position);(!s||e.lineIndent<l)&&h===32;)e.lineIndent++,h=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>l&&(l=e.lineIndent),is_EOL(h)){c++;continue}if(e.lineIndent<l){r===CHOMPING_KEEP?e.result+=common$1.repeat(`
`,a?1+c:c):r===CHOMPING_CLIP&&a&&(e.result+=`
`);break}for(o?is_WHITE_SPACE(h)?(d=!0,e.result+=common$1.repeat(`
`,a?1+c:c)):d?(d=!1,e.result+=common$1.repeat(`
`,c+1)):c===0?a&&(e.result+=" "):e.result+=common$1.repeat(`
`,c):e.result+=common$1.repeat(`
`,a?1+c:c),a=!0,s=!0,c=0,t=e.position;!is_EOL(h)&&h!==0;)h=e.input.charCodeAt(++e.position);captureSegment(e,t,e.position,!1)}return!0}function readBlockSequence(e,n){var t,o=e.tag,r=e.anchor,a=[],s,l=!1,c;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),c=e.input.charCodeAt(e.position);c!==0&&!(c!==45||(s=e.input.charCodeAt(e.position+1),!is_WS_OR_EOL(s)));){if(l=!0,e.position++,skipSeparationSpace(e,!0,-1)&&e.lineIndent<=n){a.push(null),c=e.input.charCodeAt(e.position);continue}if(t=e.line,composeNode(e,n,CONTEXT_BLOCK_IN,!1,!0),a.push(e.result),skipSeparationSpace(e,!0,-1),c=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&c!==0)throwError(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return l?(e.tag=o,e.anchor=r,e.kind="sequence",e.result=a,!0):!1}function readBlockMapping(e,n,t){var o,r,a,s,l=e.tag,c=e.anchor,d={},u={},h=null,f=null,p=null,m=!1,b=!1,y;for(e.anchor!==null&&(e.anchorMap[e.anchor]=d),y=e.input.charCodeAt(e.position);y!==0;){if(o=e.input.charCodeAt(e.position+1),a=e.line,s=e.position,(y===63||y===58)&&is_WS_OR_EOL(o))y===63?(m&&(storeMappingPair(e,d,u,h,f,null),h=f=p=null),b=!0,m=!0,r=!0):m?(m=!1,r=!0):throwError(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,y=o;else if(composeNode(e,t,CONTEXT_FLOW_OUT,!1,!0))if(e.line===a){for(y=e.input.charCodeAt(e.position);is_WHITE_SPACE(y);)y=e.input.charCodeAt(++e.position);if(y===58)y=e.input.charCodeAt(++e.position),is_WS_OR_EOL(y)||throwError(e,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(storeMappingPair(e,d,u,h,f,null),h=f=p=null),b=!0,m=!1,r=!1,h=e.tag,f=e.result;else if(b)throwError(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=l,e.anchor=c,!0}else if(b)throwError(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=l,e.anchor=c,!0;else break;if((e.line===a||e.lineIndent>n)&&(composeNode(e,n,CONTEXT_BLOCK_OUT,!0,r)&&(m?f=e.result:p=e.result),m||(storeMappingPair(e,d,u,h,f,p,a,s),h=f=p=null),skipSeparationSpace(e,!0,-1),y=e.input.charCodeAt(e.position)),e.lineIndent>n&&y!==0)throwError(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return m&&storeMappingPair(e,d,u,h,f,null),b&&(e.tag=l,e.anchor=c,e.kind="mapping",e.result=d),b}function readTagProperty(e){var n,t=!1,o=!1,r,a,s;if(s=e.input.charCodeAt(e.position),s!==33)return!1;if(e.tag!==null&&throwError(e,"duplication of a tag property"),s=e.input.charCodeAt(++e.position),s===60?(t=!0,s=e.input.charCodeAt(++e.position)):s===33?(o=!0,r="!!",s=e.input.charCodeAt(++e.position)):r="!",n=e.position,t){do s=e.input.charCodeAt(++e.position);while(s!==0&&s!==62);e.position<e.length?(a=e.input.slice(n,e.position),s=e.input.charCodeAt(++e.position)):throwError(e,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!is_WS_OR_EOL(s);)s===33&&(o?throwError(e,"tag suffix cannot contain exclamation marks"):(r=e.input.slice(n-1,e.position+1),PATTERN_TAG_HANDLE.test(r)||throwError(e,"named tag handle cannot contain such characters"),o=!0,n=e.position+1)),s=e.input.charCodeAt(++e.position);a=e.input.slice(n,e.position),PATTERN_FLOW_INDICATORS.test(a)&&throwError(e,"tag suffix cannot contain flow indicator characters")}return a&&!PATTERN_TAG_URI.test(a)&&throwError(e,"tag name cannot contain such characters: "+a),t?e.tag=a:_hasOwnProperty$1.call(e.tagMap,r)?e.tag=e.tagMap[r]+a:r==="!"?e.tag="!"+a:r==="!!"?e.tag="tag:yaml.org,2002:"+a:throwError(e,'undeclared tag handle "'+r+'"'),!0}function readAnchorProperty(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&throwError(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!is_WS_OR_EOL(t)&&!is_FLOW_INDICATOR(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&throwError(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function readAlias(e){var n,t,o;if(o=e.input.charCodeAt(e.position),o!==42)return!1;for(o=e.input.charCodeAt(++e.position),n=e.position;o!==0&&!is_WS_OR_EOL(o)&&!is_FLOW_INDICATOR(o);)o=e.input.charCodeAt(++e.position);return e.position===n&&throwError(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),_hasOwnProperty$1.call(e.anchorMap,t)||throwError(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],skipSeparationSpace(e,!0,-1),!0}function composeNode(e,n,t,o,r){var a,s,l,c=1,d=!1,u=!1,h,f,p,m,b;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,a=s=l=CONTEXT_BLOCK_OUT===t||CONTEXT_BLOCK_IN===t,o&&skipSeparationSpace(e,!0,-1)&&(d=!0,e.lineIndent>n?c=1:e.lineIndent===n?c=0:e.lineIndent<n&&(c=-1)),c===1)for(;readTagProperty(e)||readAnchorProperty(e);)skipSeparationSpace(e,!0,-1)?(d=!0,l=a,e.lineIndent>n?c=1:e.lineIndent===n?c=0:e.lineIndent<n&&(c=-1)):l=!1;if(l&&(l=d||r),(c===1||CONTEXT_BLOCK_OUT===t)&&(CONTEXT_FLOW_IN===t||CONTEXT_FLOW_OUT===t?m=n:m=n+1,b=e.position-e.lineStart,c===1?l&&(readBlockSequence(e,b)||readBlockMapping(e,b,m))||readFlowCollection(e,m)?u=!0:(s&&readBlockScalar(e,m)||readSingleQuotedScalar(e,m)||readDoubleQuotedScalar(e,m)?u=!0:readAlias(e)?(u=!0,(e.tag!==null||e.anchor!==null)&&throwError(e,"alias node should not have any properties")):readPlainScalar(e,m,CONTEXT_FLOW_IN===t)&&(u=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):c===0&&(u=l&&readBlockSequence(e,b))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&throwError(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),h=0,f=e.implicitTypes.length;h<f;h+=1)if(p=e.implicitTypes[h],p.resolve(e.result)){e.result=p.construct(e.result),e.tag=p.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else _hasOwnProperty$1.call(e.typeMap[e.kind||"fallback"],e.tag)?(p=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&p.kind!==e.kind&&throwError(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+p.kind+'", not "'+e.kind+'"'),p.resolve(e.result)?(e.result=p.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):throwError(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):throwError(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||u}function readDocument(e){var n=e.position,t,o,r,a=!1,s;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(s=e.input.charCodeAt(e.position))!==0&&(skipSeparationSpace(e,!0,-1),s=e.input.charCodeAt(e.position),!(e.lineIndent>0||s!==37));){for(a=!0,s=e.input.charCodeAt(++e.position),t=e.position;s!==0&&!is_WS_OR_EOL(s);)s=e.input.charCodeAt(++e.position);for(o=e.input.slice(t,e.position),r=[],o.length<1&&throwError(e,"directive name must not be less than one character in length");s!==0;){for(;is_WHITE_SPACE(s);)s=e.input.charCodeAt(++e.position);if(s===35){do s=e.input.charCodeAt(++e.position);while(s!==0&&!is_EOL(s));break}if(is_EOL(s))break;for(t=e.position;s!==0&&!is_WS_OR_EOL(s);)s=e.input.charCodeAt(++e.position);r.push(e.input.slice(t,e.position))}s!==0&&readLineBreak(e),_hasOwnProperty$1.call(directiveHandlers,o)?directiveHandlers[o](e,o,r):throwWarning(e,'unknown document directive "'+o+'"')}if(skipSeparationSpace(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,skipSeparationSpace(e,!0,-1)):a&&throwError(e,"directives end mark is expected"),composeNode(e,e.lineIndent-1,CONTEXT_BLOCK_OUT,!1,!0),skipSeparationSpace(e,!0,-1),e.checkLineBreaks&&PATTERN_NON_ASCII_LINE_BREAKS.test(e.input.slice(n,e.position))&&throwWarning(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&testDocumentSeparator(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,skipSeparationSpace(e,!0,-1));return}if(e.position<e.length-1)throwError(e,"end of the stream or a document separator is expected");else return}function loadDocuments(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new State$1(e,n),o=e.indexOf("\0");for(o!==-1&&(t.position=o,throwError(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)readDocument(t);return t.documents}function loadAll(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var o=loadDocuments(e,t);if(typeof n!="function")return o;for(var r=0,a=o.length;r<a;r+=1)n(o[r])}function load(e,n){var t=loadDocuments(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new YAMLException$1("expected a single document in the stream, but found more")}}function safeLoadAll(e,n,t){return typeof n=="object"&&n!==null&&typeof t>"u"&&(t=n,n=null),loadAll(e,n,common$1.extend({schema:DEFAULT_SAFE_SCHEMA$1},t))}function safeLoad(e,n){return load(e,common$1.extend({schema:DEFAULT_SAFE_SCHEMA$1},n))}loader$1.loadAll=loadAll;loader$1.load=load;loader$1.safeLoadAll=safeLoadAll;loader$1.safeLoad=safeLoad;var dumper$1={},common=common$6,YAMLException=exception,DEFAULT_FULL_SCHEMA=default_full,DEFAULT_SAFE_SCHEMA=default_safe,_toString=Object.prototype.toString,_hasOwnProperty=Object.prototype.hasOwnProperty,CHAR_TAB=9,CHAR_LINE_FEED=10,CHAR_CARRIAGE_RETURN=13,CHAR_SPACE=32,CHAR_EXCLAMATION=33,CHAR_DOUBLE_QUOTE=34,CHAR_SHARP=35,CHAR_PERCENT=37,CHAR_AMPERSAND=38,CHAR_SINGLE_QUOTE=39,CHAR_ASTERISK=42,CHAR_COMMA=44,CHAR_MINUS=45,CHAR_COLON=58,CHAR_EQUALS=61,CHAR_GREATER_THAN=62,CHAR_QUESTION=63,CHAR_COMMERCIAL_AT=64,CHAR_LEFT_SQUARE_BRACKET=91,CHAR_RIGHT_SQUARE_BRACKET=93,CHAR_GRAVE_ACCENT=96,CHAR_LEFT_CURLY_BRACKET=123,CHAR_VERTICAL_LINE=124,CHAR_RIGHT_CURLY_BRACKET=125,ESCAPE_SEQUENCES={};ESCAPE_SEQUENCES[0]="\\0";ESCAPE_SEQUENCES[7]="\\a";ESCAPE_SEQUENCES[8]="\\b";ESCAPE_SEQUENCES[9]="\\t";ESCAPE_SEQUENCES[10]="\\n";ESCAPE_SEQUENCES[11]="\\v";ESCAPE_SEQUENCES[12]="\\f";ESCAPE_SEQUENCES[13]="\\r";ESCAPE_SEQUENCES[27]="\\e";ESCAPE_SEQUENCES[34]='\\"';ESCAPE_SEQUENCES[92]="\\\\";ESCAPE_SEQUENCES[133]="\\N";ESCAPE_SEQUENCES[160]="\\_";ESCAPE_SEQUENCES[8232]="\\L";ESCAPE_SEQUENCES[8233]="\\P";var DEPRECATED_BOOLEANS_SYNTAX=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function compileStyleMap(e,n){var t,o,r,a,s,l,c;if(n===null)return{};for(t={},o=Object.keys(n),r=0,a=o.length;r<a;r+=1)s=o[r],l=String(n[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),c=e.compiledTypeMap.fallback[s],c&&_hasOwnProperty.call(c.styleAliases,l)&&(l=c.styleAliases[l]),t[s]=l;return t}function encodeHex(e){var n,t,o;if(n=e.toString(16).toUpperCase(),e<=255)t="x",o=2;else if(e<=65535)t="u",o=4;else if(e<=4294967295)t="U",o=8;else throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+common.repeat("0",o-n.length)+n}function State(e){this.schema=e.schema||DEFAULT_FULL_SCHEMA,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=common.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=compileStyleMap(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function indentString(e,n){for(var t=common.repeat(" ",n),o=0,r=-1,a="",s,l=e.length;o<l;)r=e.indexOf(`
`,o),r===-1?(s=e.slice(o),o=l):(s=e.slice(o,r+1),o=r+1),s.length&&s!==`
`&&(a+=t),a+=s;return a}function generateNextLine(e,n){return`
`+common.repeat(" ",e.indent*n)}function testImplicitResolving(e,n){var t,o,r;for(t=0,o=e.implicitTypes.length;t<o;t+=1)if(r=e.implicitTypes[t],r.resolve(n))return!0;return!1}function isWhitespace(e){return e===CHAR_SPACE||e===CHAR_TAB}function isPrintable(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function isNsChar(e){return isPrintable(e)&&!isWhitespace(e)&&e!==65279&&e!==CHAR_CARRIAGE_RETURN&&e!==CHAR_LINE_FEED}function isPlainSafe(e,n){return isPrintable(e)&&e!==65279&&e!==CHAR_COMMA&&e!==CHAR_LEFT_SQUARE_BRACKET&&e!==CHAR_RIGHT_SQUARE_BRACKET&&e!==CHAR_LEFT_CURLY_BRACKET&&e!==CHAR_RIGHT_CURLY_BRACKET&&e!==CHAR_COLON&&(e!==CHAR_SHARP||n&&isNsChar(n))}function isPlainSafeFirst(e){return isPrintable(e)&&e!==65279&&!isWhitespace(e)&&e!==CHAR_MINUS&&e!==CHAR_QUESTION&&e!==CHAR_COLON&&e!==CHAR_COMMA&&e!==CHAR_LEFT_SQUARE_BRACKET&&e!==CHAR_RIGHT_SQUARE_BRACKET&&e!==CHAR_LEFT_CURLY_BRACKET&&e!==CHAR_RIGHT_CURLY_BRACKET&&e!==CHAR_SHARP&&e!==CHAR_AMPERSAND&&e!==CHAR_ASTERISK&&e!==CHAR_EXCLAMATION&&e!==CHAR_VERTICAL_LINE&&e!==CHAR_EQUALS&&e!==CHAR_GREATER_THAN&&e!==CHAR_SINGLE_QUOTE&&e!==CHAR_DOUBLE_QUOTE&&e!==CHAR_PERCENT&&e!==CHAR_COMMERCIAL_AT&&e!==CHAR_GRAVE_ACCENT}function needIndentIndicator(e){var n=/^\n* /;return n.test(e)}var STYLE_PLAIN=1,STYLE_SINGLE=2,STYLE_LITERAL=3,STYLE_FOLDED=4,STYLE_DOUBLE=5;function chooseScalarStyle(e,n,t,o,r){var a,s,l,c=!1,d=!1,u=o!==-1,h=-1,f=isPlainSafeFirst(e.charCodeAt(0))&&!isWhitespace(e.charCodeAt(e.length-1));if(n)for(a=0;a<e.length;a++){if(s=e.charCodeAt(a),!isPrintable(s))return STYLE_DOUBLE;l=a>0?e.charCodeAt(a-1):null,f=f&&isPlainSafe(s,l)}else{for(a=0;a<e.length;a++){if(s=e.charCodeAt(a),s===CHAR_LINE_FEED)c=!0,u&&(d=d||a-h-1>o&&e[h+1]!==" ",h=a);else if(!isPrintable(s))return STYLE_DOUBLE;l=a>0?e.charCodeAt(a-1):null,f=f&&isPlainSafe(s,l)}d=d||u&&a-h-1>o&&e[h+1]!==" "}return!c&&!d?f&&!r(e)?STYLE_PLAIN:STYLE_SINGLE:t>9&&needIndentIndicator(e)?STYLE_DOUBLE:d?STYLE_FOLDED:STYLE_LITERAL}function writeScalar(e,n,t,o){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&DEPRECATED_BOOLEANS_SYNTAX.indexOf(n)!==-1)return"'"+n+"'";var r=e.indent*Math.max(1,t),a=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-r),s=o||e.flowLevel>-1&&t>=e.flowLevel;function l(c){return testImplicitResolving(e,c)}switch(chooseScalarStyle(n,s,e.indent,a,l)){case STYLE_PLAIN:return n;case STYLE_SINGLE:return"'"+n.replace(/'/g,"''")+"'";case STYLE_LITERAL:return"|"+blockHeader(n,e.indent)+dropEndingNewline(indentString(n,r));case STYLE_FOLDED:return">"+blockHeader(n,e.indent)+dropEndingNewline(indentString(foldString(n,a),r));case STYLE_DOUBLE:return'"'+escapeString(n)+'"';default:throw new YAMLException("impossible error: invalid scalar style")}}()}function blockHeader(e,n){var t=needIndentIndicator(e)?String(n):"",o=e[e.length-1]===`
`,r=o&&(e[e.length-2]===`
`||e===`
`),a=r?"+":o?"":"-";return t+a+`
`}function dropEndingNewline(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function foldString(e,n){for(var t=/(\n+)([^\n]*)/g,o=function(){var d=e.indexOf(`
`);return d=d!==-1?d:e.length,t.lastIndex=d,foldLine(e.slice(0,d),n)}(),r=e[0]===`
`||e[0]===" ",a,s;s=t.exec(e);){var l=s[1],c=s[2];a=c[0]===" ",o+=l+(!r&&!a&&c!==""?`
`:"")+foldLine(c,n),r=a}return o}function foldLine(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,o,r=0,a,s=0,l=0,c="";o=t.exec(e);)l=o.index,l-r>n&&(a=s>r?s:l,c+=`
`+e.slice(r,a),r=a+1),s=l;return c+=`
`,e.length-r>n&&s>r?c+=e.slice(r,s)+`
`+e.slice(s+1):c+=e.slice(r),c.slice(1)}function escapeString(e){for(var n="",t,o,r,a=0;a<e.length;a++){if(t=e.charCodeAt(a),t>=55296&&t<=56319&&(o=e.charCodeAt(a+1),o>=56320&&o<=57343)){n+=encodeHex((t-55296)*1024+o-56320+65536),a++;continue}r=ESCAPE_SEQUENCES[t],n+=!r&&isPrintable(t)?e[a]:r||encodeHex(t)}return n}function writeFlowSequence(e,n,t){var o="",r=e.tag,a,s;for(a=0,s=t.length;a<s;a+=1)writeNode(e,n,t[a],!1,!1)&&(a!==0&&(o+=","+(e.condenseFlow?"":" ")),o+=e.dump);e.tag=r,e.dump="["+o+"]"}function writeBlockSequence(e,n,t,o){var r="",a=e.tag,s,l;for(s=0,l=t.length;s<l;s+=1)writeNode(e,n+1,t[s],!0,!0)&&((!o||s!==0)&&(r+=generateNextLine(e,n)),e.dump&&CHAR_LINE_FEED===e.dump.charCodeAt(0)?r+="-":r+="- ",r+=e.dump);e.tag=a,e.dump=r||"[]"}function writeFlowMapping(e,n,t){var o="",r=e.tag,a=Object.keys(t),s,l,c,d,u;for(s=0,l=a.length;s<l;s+=1)u="",s!==0&&(u+=", "),e.condenseFlow&&(u+='"'),c=a[s],d=t[c],writeNode(e,n,c,!1,!1)&&(e.dump.length>1024&&(u+="? "),u+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),writeNode(e,n,d,!1,!1)&&(u+=e.dump,o+=u));e.tag=r,e.dump="{"+o+"}"}function writeBlockMapping(e,n,t,o){var r="",a=e.tag,s=Object.keys(t),l,c,d,u,h,f;if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys=="function")s.sort(e.sortKeys);else if(e.sortKeys)throw new YAMLException("sortKeys must be a boolean or a function");for(l=0,c=s.length;l<c;l+=1)f="",(!o||l!==0)&&(f+=generateNextLine(e,n)),d=s[l],u=t[d],writeNode(e,n+1,d,!0,!0,!0)&&(h=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,h&&(e.dump&&CHAR_LINE_FEED===e.dump.charCodeAt(0)?f+="?":f+="? "),f+=e.dump,h&&(f+=generateNextLine(e,n)),writeNode(e,n+1,u,!0,h)&&(e.dump&&CHAR_LINE_FEED===e.dump.charCodeAt(0)?f+=":":f+=": ",f+=e.dump,r+=f));e.tag=a,e.dump=r||"{}"}function detectType(e,n,t){var o,r,a,s,l,c;for(r=t?e.explicitTypes:e.implicitTypes,a=0,s=r.length;a<s;a+=1)if(l=r[a],(l.instanceOf||l.predicate)&&(!l.instanceOf||typeof n=="object"&&n instanceof l.instanceOf)&&(!l.predicate||l.predicate(n))){if(e.tag=t?l.tag:"?",l.represent){if(c=e.styleMap[l.tag]||l.defaultStyle,_toString.call(l.represent)==="[object Function]")o=l.represent(n,c);else if(_hasOwnProperty.call(l.represent,c))o=l.represent[c](n,c);else throw new YAMLException("!<"+l.tag+'> tag resolver accepts not "'+c+'" style');e.dump=o}return!0}return!1}function writeNode(e,n,t,o,r,a){e.tag=null,e.dump=t,detectType(e,t,!1)||detectType(e,t,!0);var s=_toString.call(e.dump);o&&(o=e.flowLevel<0||e.flowLevel>n);var l=s==="[object Object]"||s==="[object Array]",c,d;if(l&&(c=e.duplicates.indexOf(t),d=c!==-1),(e.tag!==null&&e.tag!=="?"||d||e.indent!==2&&n>0)&&(r=!1),d&&e.usedDuplicates[c])e.dump="*ref_"+c;else{if(l&&d&&!e.usedDuplicates[c]&&(e.usedDuplicates[c]=!0),s==="[object Object]")o&&Object.keys(e.dump).length!==0?(writeBlockMapping(e,n,e.dump,r),d&&(e.dump="&ref_"+c+e.dump)):(writeFlowMapping(e,n,e.dump),d&&(e.dump="&ref_"+c+" "+e.dump));else if(s==="[object Array]"){var u=e.noArrayIndent&&n>0?n-1:n;o&&e.dump.length!==0?(writeBlockSequence(e,u,e.dump,r),d&&(e.dump="&ref_"+c+e.dump)):(writeFlowSequence(e,u,e.dump),d&&(e.dump="&ref_"+c+" "+e.dump))}else if(s==="[object String]")e.tag!=="?"&&writeScalar(e,e.dump,n,a);else{if(e.skipInvalid)return!1;throw new YAMLException("unacceptable kind of an object to dump "+s)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function getDuplicateReferences(e,n){var t=[],o=[],r,a;for(inspectNode(e,t,o),r=0,a=o.length;r<a;r+=1)n.duplicates.push(t[o[r]]);n.usedDuplicates=new Array(a)}function inspectNode(e,n,t){var o,r,a;if(e!==null&&typeof e=="object")if(r=n.indexOf(e),r!==-1)t.indexOf(r)===-1&&t.push(r);else if(n.push(e),Array.isArray(e))for(r=0,a=e.length;r<a;r+=1)inspectNode(e[r],n,t);else for(o=Object.keys(e),r=0,a=o.length;r<a;r+=1)inspectNode(e[o[r]],n,t)}function dump(e,n){n=n||{};var t=new State(n);return t.noRefs||getDuplicateReferences(e,t),writeNode(t,0,e,!0,!0)?t.dump+`
`:""}function safeDump(e,n){return dump(e,common.extend({schema:DEFAULT_SAFE_SCHEMA},n))}dumper$1.dump=dump;dumper$1.safeDump=safeDump;var loader=loader$1,dumper=dumper$1;function deprecated(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}jsYaml$1.Type=type;jsYaml$1.Schema=schema;jsYaml$1.FAILSAFE_SCHEMA=failsafe;jsYaml$1.JSON_SCHEMA=json;jsYaml$1.CORE_SCHEMA=core;jsYaml$1.DEFAULT_SAFE_SCHEMA=default_safe;jsYaml$1.DEFAULT_FULL_SCHEMA=default_full;jsYaml$1.load=loader.load;jsYaml$1.loadAll=loader.loadAll;jsYaml$1.safeLoad=loader.safeLoad;jsYaml$1.safeLoadAll=loader.safeLoadAll;jsYaml$1.dump=dumper.dump;jsYaml$1.safeDump=dumper.safeDump;jsYaml$1.YAMLException=exception;jsYaml$1.MINIMAL_SCHEMA=failsafe;jsYaml$1.SAFE_SCHEMA=default_safe;jsYaml$1.DEFAULT_SCHEMA=default_full;jsYaml$1.scan=deprecated("scan");jsYaml$1.parse=deprecated("parse");jsYaml$1.compose=deprecated("compose");jsYaml$1.addConstructor=deprecated("addConstructor");var yaml=jsYaml$1,jsYaml=yaml;(function(module,exports){const yaml=jsYaml,engines=module.exports;engines.yaml={parse:yaml.safeLoad.bind(yaml),stringify:yaml.safeDump.bind(yaml)},engines.json={parse:JSON.parse.bind(JSON),stringify:function(e,n){const t=Object.assign({replacer:null,space:2},n);return JSON.stringify(e,t.replacer,t.space)}},engines.javascript={parse:function parse(str,options,wrap){try{return wrap!==!1&&(str=`(function() {
return `+str.trim()+`;
}());`),eval(str)||{}}catch(e){if(wrap!==!1&&/(unexpected|identifier)/i.test(e.message))return parse(str,options,!1);throw new SyntaxError(e)}},stringify:function(){throw new Error("stringifying JavaScript is not supported")}}})(engines$2);var enginesExports=engines$2.exports,utils$3={};/*!
 * strip-bom-string <https://github.com/jonschlinkert/strip-bom-string>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */var stripBomString=function(e){return typeof e=="string"&&e.charAt(0)==="\uFEFF"?e.slice(1):e};(function(e){const n=stripBomString,t=kindOf;e.define=function(o,r,a){Reflect.defineProperty(o,r,{enumerable:!1,configurable:!0,writable:!0,value:a})},e.isBuffer=function(o){return t(o)==="buffer"},e.isObject=function(o){return t(o)==="object"},e.toBuffer=function(o){return typeof o=="string"?Buffer.from(o):o},e.toString=function(o){if(e.isBuffer(o))return n(String(o));if(typeof o!="string")throw new TypeError("expected input to be a string or buffer");return n(o)},e.arrayify=function(o){return o?Array.isArray(o)?o:[o]:[]},e.startsWith=function(o,r,a){return typeof a!="number"&&(a=r.length),o.slice(0,a)===r}})(utils$3);const engines$1=enginesExports,utils$2=utils$3;var defaults$4=function(e){const n=Object.assign({},e);return n.delimiters=utils$2.arrayify(n.delims||n.delimiters||"---"),n.delimiters.length===1&&n.delimiters.push(n.delimiters[0]),n.language=(n.language||n.lang||"yaml").toLowerCase(),n.engines=Object.assign({},engines$1,n.parsers,n.engines),n},engine=function(e,n){let t=n.engines[e]||n.engines[aliase(e)];if(typeof t>"u")throw new Error('gray-matter engine "'+e+'" is not registered');return typeof t=="function"&&(t={parse:t}),t};function aliase(e){switch(e.toLowerCase()){case"js":case"javascript":return"javascript";case"coffee":case"coffeescript":case"cson":return"coffee";case"yaml":case"yml":return"yaml";default:return e}}const typeOf$1=kindOf,getEngine$1=engine,defaults$3=defaults$4;var stringify$2=function(e,n,t){if(n==null&&t==null)switch(typeOf$1(e)){case"object":n=e.data,t={};break;case"string":return e;default:throw new TypeError("expected file to be a string or object")}const o=e.content,r=defaults$3(t);if(n==null){if(!r.data)return e;n=r.data}const a=e.language||r.language,s=getEngine$1(a,r);if(typeof s.stringify!="function")throw new TypeError('expected "'+a+'.stringify" to be a function');n=Object.assign({},e.data,n);const l=r.delimiters[0],c=r.delimiters[1],d=s.stringify(n,t).trim();let u="";return d!=="{}"&&(u=newline(l)+newline(d)+newline(c)),typeof e.excerpt=="string"&&e.excerpt!==""&&o.indexOf(e.excerpt.trim())===-1&&(u+=newline(e.excerpt)+newline(c)),u+newline(o)};function newline(e){return e.slice(-1)!==`
`?e+`
`:e}const defaults$2=defaults$4;var excerpt$1=function(e,n){const t=defaults$2(n);if(e.data==null&&(e.data={}),typeof t.excerpt=="function")return t.excerpt(e,t);const o=e.data.excerpt_separator||t.excerpt_separator;if(o==null&&(t.excerpt===!1||t.excerpt==null))return e;const r=typeof t.excerpt=="string"?t.excerpt:o||t.delimiters[0],a=e.content.indexOf(r);return a!==-1&&(e.excerpt=e.content.slice(0,a)),e};const typeOf=kindOf,stringify$1=stringify$2,utils$1=utils$3;var toFile$1=function(e){return typeOf(e)!=="object"&&(e={content:e}),typeOf(e.data)!=="object"&&(e.data={}),e.contents&&e.content==null&&(e.content=e.contents),utils$1.define(e,"orig",utils$1.toBuffer(e.content)),utils$1.define(e,"language",e.language||""),utils$1.define(e,"matter",e.matter||""),utils$1.define(e,"stringify",function(n,t){return t&&t.language&&(e.language=t.language),stringify$1(e,n,t)}),e.content=utils$1.toString(e.content),e.isEmpty=!1,e.excerpt="",e};const getEngine=engine,defaults$1=defaults$4;var parse$1=function(e,n,t){const o=defaults$1(t),r=getEngine(e,o);if(typeof r.parse!="function")throw new TypeError('expected "'+e+'.parse" to be a function');return r.parse(n,o)};const fs=require$$0,sections=sectionMatter,defaults=defaults$4,stringify=stringify$2,excerpt=excerpt$1,engines=enginesExports,toFile=toFile$1,parse=parse$1,utils=utils$3;function matter(e,n){if(e==="")return{data:{},content:e,excerpt:"",orig:e};let t=toFile(e);const o=matter.cache[t.content];if(!n){if(o)return t=Object.assign({},o),t.orig=o.orig,t;matter.cache[t.content]=t}return parseMatter(t,n)}function parseMatter(e,n){const t=defaults(n),o=t.delimiters[0],r=`
`+t.delimiters[1];let a=e.content;t.language&&(e.language=t.language);const s=o.length;if(!utils.startsWith(a,o,s))return excerpt(e,t),e;if(a.charAt(s)===o.slice(-1))return e;a=a.slice(s);const l=a.length,c=matter.language(a,t);c.name&&(e.language=c.name,a=a.slice(c.raw.length));let d=a.indexOf(r);return d===-1&&(d=l),e.matter=a.slice(0,d),e.matter.replace(/^\s*#[^\n]+/gm,"").trim()===""?(e.isEmpty=!0,e.empty=e.content,e.data={}):e.data=parse(e.language,e.matter,t),d===l?e.content="":(e.content=a.slice(d+r.length),e.content[0]==="\r"&&(e.content=e.content.slice(1)),e.content[0]===`
`&&(e.content=e.content.slice(1))),excerpt(e,t),(t.sections===!0||typeof t.section=="function")&&sections(e,t.section),e}matter.engines=engines;matter.stringify=function(e,n,t){return typeof e=="string"&&(e=matter(e,t)),stringify(e,n,t)};matter.read=function(e,n){const t=fs.readFileSync(e,"utf8"),o=matter(t,n);return o.path=e,o};matter.test=function(e,n){return utils.startsWith(e,defaults(n).delimiters[0])};matter.language=function(e,n){const o=defaults(n).delimiters[0];matter.test(e)&&(e=e.slice(o.length));const r=e.slice(0,e.search(/\r?\n/));return{raw:r,name:r?r.trim():""}};matter.cache={};matter.clearCache=function(){matter.cache={}};var grayMatter=matter;const matter$1=getDefaultExportFromCjs(grayMatter);function parseWorldFiles(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[]};for(const[t,o]of Object.entries(e)){const r=t.split("/").pop()??"";if(r==="_template.md"||r===".gitkeep")continue;const{data:a,content:s}=matter$1(o);/^systems\/[^/]+\.md$/.test(t)?n.systems.push(parseSystem(a,s)):/^destinations\/[^/]+\.md$/.test(t)?n.destinations.push(parseDestination(a,s)):/^factions\/[^/]+\.md$/.test(t)?n.factions.push(parseFaction(a,s)):/^ships\/[^/]+\.md$/.test(t)?n.ships.push(parseShip(a,s)):t==="ships/components/jump-drives.md"?n.drives=parseDrives(a):t==="navigation/jump-routes.md"?n.routes=parseRoutes(a):t==="commodities.md"?n.commodities=parseCommodities(a):/^story\/[^/]+\.md$/.test(t)?n.storyBeats.push(parseStoryBeat(a,s)):t==="game-settings.md"&&(n.settings=parseSettings(a))}return n}function extractDescription(e){const n=[];let t=!1;for(const o of e.split(`
`)){const r=o.trim();if(!r.startsWith("#"))if(r===""){if(t)break}else t=!0,n.push(r)}return n.join(" ")}function parseSystem(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economy:e.economy??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:extractDescription(n)}}function parseDestination(e,n){const t=e.amenities??{},o={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:o,npcs:e.npcs??{},goodsBias:e.goods_bias??[],dangerLevel:e.danger_level,tags:e.tags??[],description:extractDescription(n)}}function parseFaction(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:extractDescription(n)}}function parseShip(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,tags:e.tags??[],description:extractDescription(n)}}function parseDrives(e){return(e.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function parseRoutes(e){return(e.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function parseCommodities(e){return(e.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function parseStoryBeat(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function parseSettings(e){var n,t,o,r;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((t=e.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((o=e.starting_location)==null?void 0:o.system)??"",destination:((r=e.starting_location)==null?void 0:r.destination)??""},startingShip:e.starting_ship??""}}function loadWorldData(){const e=Object.assign({"/docs/world/commodities.md":__vite_glob_0_0,"/docs/world/destinations/_template.md":__vite_glob_0_1,"/docs/world/destinations/blackwake-yard.md":__vite_glob_0_2,"/docs/world/destinations/ceti-landfall.md":__vite_glob_0_3,"/docs/world/destinations/drift-market.md":__vite_glob_0_4,"/docs/world/destinations/elysium-station.md":__vite_glob_0_5,"/docs/world/destinations/eridani-anchorage.md":__vite_glob_0_6,"/docs/world/destinations/foundries-platform.md":__vite_glob_0_7,"/docs/world/destinations/galileo-transfer.md":__vite_glob_0_8,"/docs/world/destinations/hestia-ring.md":__vite_glob_0_9,"/docs/world/destinations/keelhaul-station.md":__vite_glob_0_10,"/docs/world/destinations/kepler-yard.md":__vite_glob_0_11,"/docs/world/destinations/mars-anchor.md":__vite_glob_0_12,"/docs/world/destinations/meridian-station.md":__vite_glob_0_13,"/docs/world/destinations/new-horizon-port.md":__vite_glob_0_14,"/docs/world/destinations/orrery-anchorage.md":__vite_glob_0_15,"/docs/world/destinations/redline-station.md":__vite_glob_0_16,"/docs/world/destinations/tycho-orbital.md":__vite_glob_0_17,"/docs/world/destinations/veil-station.md":__vite_glob_0_18,"/docs/world/destinations/waypoint-ceti.md":__vite_glob_0_19,"/docs/world/factions/_template.md":__vite_glob_0_20,"/docs/world/factions/centauri-trade-league.md":__vite_glob_0_21,"/docs/world/factions/eridani-colonial-council.md":__vite_glob_0_22,"/docs/world/factions/free-captains.md":__vite_glob_0_23,"/docs/world/factions/grey-market-cartel.md":__vite_glob_0_24,"/docs/world/factions/helios-directorate.md":__vite_glob_0_25,"/docs/world/factions/independent-miners-guild.md":__vite_glob_0_26,"/docs/world/factions/procyon-institute.md":__vite_glob_0_27,"/docs/world/factions/terran-union.md":__vite_glob_0_28,"/docs/world/galaxy-map.md":__vite_glob_0_29,"/docs/world/game-settings.md":__vite_glob_0_30,"/docs/world/navigation/jump-routes.md":__vite_glob_0_31,"/docs/world/ships/_template.md":__vite_glob_0_32,"/docs/world/ships/components/jump-drives.md":__vite_glob_0_33,"/docs/world/ships/freighter.md":__vite_glob_0_34,"/docs/world/ships/hauler.md":__vite_glob_0_35,"/docs/world/ships/scout.md":__vite_glob_0_36,"/docs/world/story/_template.md":__vite_glob_0_37,"/docs/world/story/enter-wolf-359.md":__vite_glob_0_38,"/docs/world/story/first-jump.md":__vite_glob_0_39,"/docs/world/story/opening-arrival.md":__vite_glob_0_40,"/docs/world/systems/_template.md":__vite_glob_0_41,"/docs/world/systems/alpha-centauri.md":__vite_glob_0_42,"/docs/world/systems/barnards-star.md":__vite_glob_0_43,"/docs/world/systems/epsilon-eridani.md":__vite_glob_0_44,"/docs/world/systems/procyon.md":__vite_glob_0_45,"/docs/world/systems/sirius.md":__vite_glob_0_46,"/docs/world/systems/sol.md":__vite_glob_0_47,"/docs/world/systems/tau-ceti.md":__vite_glob_0_48,"/docs/world/systems/wolf-359.md":__vite_glob_0_49}),n={};for(const[t,o]of Object.entries(e)){const r=t.replace("/docs/world/","");n[r]=o}return parseWorldFiles(n)}initWorld(loadWorldData());const primaryInput=navigator.maxTouchPoints>0?"touch":"keyboard",debug=new URLSearchParams(window.location.search).has("debug"),context={environment:"browser",primaryInput,debug},renderer=new DOMRenderer,input=new DOMInputHandler(context);input.connect();const game=new Game(renderer,input,context);let lastTime=0;function loop(e){game.tick(e-lastTime),lastTime=e,requestAnimationFrame(loop)}requestAnimationFrame(loop);
