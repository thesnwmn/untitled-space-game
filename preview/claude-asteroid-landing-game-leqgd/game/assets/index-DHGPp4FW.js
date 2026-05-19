(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const Te=40,Ge=30,Wi=50,dn=24;function Ki(n){return n==="&"?"&amp;":n==="<"?"&lt;":n===">"?"&gt;":n}class ji{constructor(){this.charW=0,this.charH=0,this.gridH=Ge,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(Te),this.pre.dataset.gridRows=String(Ge),document.body.appendChild(this.pre);const e=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${dn}px "Share Tech Mono"`).catch(()=>null)]).then(e),document.fonts.addEventListener("loadingdone",e),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const e=document.createElement("span");e.style.fontFamily="'Share Tech Mono', monospace",e.style.fontSize=`${dn}px`,e.style.lineHeight="1em",e.style.position="absolute",e.style.visibility="hidden",e.textContent="M",document.body.appendChild(e);const t=e.getBoundingClientRect();document.body.removeChild(e),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const e=Math.min(window.innerWidth/(Te*this.charW),window.innerHeight/(Ge*this.charH)),t=Math.max(Ge,Math.min(Wi,Math.floor(window.innerHeight/(this.charH*e))));if(this.pre.style.fontSize=`${dn*e}px`,this.pre.style.width=`${Te*this.charW*e}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const i of this.resizeHandlers)i(Te,t)}}onResize(e){this.resizeHandlers.push(e)}drawBuffer(e){const t=[];for(const i of e){let s="";for(const r of i){const o=r.fg!=="transparent"?`fg-${r.fg}`:"",a=r.bg!=="transparent"?`bg-${r.bg}`:"",l=o&&a?`${o} ${a}`:o||a,c=l?` class="${l}"`:"";s+=`<span${c}>${Ki(r.char)}</span>`}t.push(s)}this.pre.innerHTML=t.join(`
`)}getWidth(){return Te}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}destroy(){this.pre.remove()}}const Yi={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",m:"MENU",M:"MENU",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},qi=new Set(["0","1","2","3","4","5","6","7","8","9"]),Vi=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class zi{constructor(e){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.touchTrackHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerMoveListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=e.debug}logDebug(e){if(this.debugMode){if(this.debugLog.unshift(e),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(e){this.actionHandlers.push(e)}onTap(e){this.tapHandlers.push(e)}onCharInput(e){this.charInputHandlers.push(e)}onTouchTrack(e){this.touchTrackHandlers.push(e)}connect(){this.keyListener=e=>{if(Vi.has(e.key)&&e.preventDefault(),qi.has(e.key))for(const i of this.charInputHandlers.slice())i(e.key);if(e.key==="Backspace"||e.key==="Delete"){for(const i of this.charInputHandlers.slice())i("\b");return}const t=Yi[e.key];if(t)for(const i of this.actionHandlers.slice())i(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=e=>{if(e.preventDefault(),this.pointerStartMap.set(e.pointerId,{startX:e.clientX,startY:e.clientY}),this.activePointers.add(e.pointerId),this.logDebug(`DOWN id=${e.pointerId} (${Math.round(e.clientX)},${Math.round(e.clientY)}) type=${e.pointerType} active=${this.activePointers.size}`),this.touchTrackHandlers.length>0){const t=this.getGridCoordsForTrack(e.clientX,e.clientY);if(t)for(const i of this.touchTrackHandlers.slice())i.start(t.col,t.row,e.pointerId)}},this.pointerMoveListener=e=>{if(this.pointerStartMap.has(e.pointerId)&&this.touchTrackHandlers.length>0){const t=this.getGridCoordsForTrack(e.clientX,e.clientY);if(t)for(const i of this.touchTrackHandlers.slice())i.move(t.col,t.row,e.pointerId)}},this.pointerUpListener=e=>{const t=this.pointerStartMap.get(e.pointerId),i=this.activePointers.size;if(this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId),this.touchTrackHandlers.length>0)for(const l of this.touchTrackHandlers.slice())l.end(e.pointerId);if(!t){this.logDebug(`UP id=${e.pointerId} NO START`);return}const s=e.clientX-t.startX,r=e.clientY-t.startY,o=Math.abs(s),a=Math.abs(r);if(o<20&&a<20)if(i>=2){this.logDebug(`UP id=${e.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{if(this.touchTrackHandlers.length>0){this.logDebug(`DRAG-END (joystick) dx=${Math.round(s)} dy=${Math.round(r)} -> suppressed`);return}let l;o>=a?l=s>0?"RIGHT":"LEFT":l=r>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(s)} dy=${Math.round(r)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=e=>{if(this.logDebug(`CANCEL id=${e.pointerId}`),this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId),this.touchTrackHandlers.length>0)for(const t of this.touchTrackHandlers.slice())t.end(e.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointermove",this.pointerMoveListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerMoveListener&&(window.removeEventListener("pointermove",this.pointerMoveListener),this.pointerMoveListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const e=document.querySelector(".game-screen");if(!e)return"NO PRE";const t=e.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(e,t){const i=document.querySelector(".game-screen");if(!i)return null;const s=i.getBoundingClientRect(),r=parseInt(i.dataset.gridCols??"1"),o=parseInt(i.dataset.gridRows??"1");if(!r||!o||!s.width||!s.height)return null;const a=Math.floor((e-s.left)/(s.width/r)),l=Math.floor((t-s.top)/(s.height/o));return a<0||a>=r||l<0||l>=o?null:{col:a,row:l}}getGridCoordsForTrack(e,t){const i=document.querySelector(".game-screen");if(!i)return null;const s=i.getBoundingClientRect(),r=parseInt(i.dataset.gridCols??"1"),o=parseInt(i.dataset.gridRows??"1");if(!r||!o||!s.width||!s.height)return null;const a=Math.floor((e-s.left)/(s.width/r)),l=Math.floor((t-s.top)/(s.height/o));return{col:a,row:l}}}function g(n,e,t,i,s,r){if(e<0||e>=n.length)return;const o=n[e];for(let a=0;a<i.length;a++){const l=t+a;l>=0&&l<o.length&&(o[l]={char:i[a],fg:s,bg:r})}}function L(n,e,t,i,s){if(e<0||e>=n.length)return;const r=n[e].length,o=Math.max(0,Math.floor((r-t.length)/2));g(n,e,o,t,i,s)}function tn(n,e){const t=n.split(/\s+/).filter(Boolean),i=[];let s="";for(const r of t)s.length===0?s=r:s.length+1+r.length<=e?s+=" "+r:(i.push(s),s=r);return s.length>0&&i.push(s),i}function ge(n,e,t,i="bright-black"){g(n,e,0,"-".repeat(t),i,"black")}function Yt(n,e,t,i,s){const r=`${i+1}/${s}`;g(n,e,0,"|<|","white","black");const o=Math.floor((t-r.length)/2);g(n,e,o,r,"bright-black","black"),g(n,e,t-3,"|>|","white","black")}const Kn=["UNTITLED","SPACE GAME"],Xi=4,Qi=3,Ji="- An ASCII space adventure -",Zi=11,jn=16;class Yn{constructor(e,t,i,s){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,s()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),e.onAction(r=>{this.activated||(r==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:r==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:r==="SELECT"&&this.items[this.cursorIdx].action())}),e.onTap&&e.onTap((r,o)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(o===jn+a){this.cursorIdx=a,this.items[a].action();return}}})}update(e){}render(e){const t=e.length,i=t>0?e[0].length:0;for(let o=0;o<t;o++)for(let a=0;a<i;a++)e[o][a]={char:" ",fg:"black",bg:"black"};for(let o=0;o<Kn.length;o++)L(e,Xi+o*Qi,Kn[o],"bright-cyan","black");L(e,Zi,Ji,"white","black");const s=this.items.reduce((o,a)=>Math.max(o,a.label.length+2),0),r=Math.max(0,Math.floor((i-s)/2));for(let o=0;o<this.items.length;o++){const a=jn+o;if(a>=t)continue;const l=o===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";g(e,a,r,c+this.items[o].label,h,"black")}}}let kn=null;function es(n){kn=n}function F(){if(kn===null)throw new Error("World not initialised — call initWorld() before accessing world data");return kn}function ne(n){return F().systems.find(e=>e.id===n)}function N(n){return F().destinations.find(e=>e.id===n)}function An(n){return F().routes.filter(e=>e.from===n||e.to===n)}function qt(n){return F().drives.find(e=>e.id===n)}function ns(n){return F().storyBeats.filter(e=>e.trigger===n)}function Vt(){return F().settings}function P(){return F().balance}function qe(n){return F().ships.find(e=>e.id===n)}function Ve(n,e){return F().routes.find(t=>t.from===n&&t.to===e||t.from===e&&t.to===n)}function zt(n){return F().factions.find(e=>e.id===n)}function de(n){return F().commodities.find(e=>e.id===n)}function ts(){return F().commodities}function is(){return F().systems.filter(n=>n.playerKnowledge==="public")}function ss(n){return n.reduce((e,t)=>{const i=de(t.commodityId);return e+t.qty*((i==null?void 0:i.weightKg)??0)},0)}function rs(n){return F().economies.find(e=>e.id===n)}function Qe(n,e){const t=P(),i=[];for(const r of e.economies){const o=rs(r);if(o){for(const a of o.commodities)if(a.id===n){i.push(a.factor);break}}}const s=i.length===0?1:i.reduce((r,o)=>r+o,0)/i.length;return Math.max(t.economies.minFactor,Math.min(t.economies.maxFactor,s))}const X=3,qn=0;function Rn(n,e){return e?n-2:n}function os(n){return n.toLocaleString("en-US")}class as{constructor(e,t){this.buttonRanges=null,this.footerRow=-1,this.headerWidth=-1,this.context=e,this.player=t}render(e,t){const i=e.length,s=i>0?e[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader?(this.headerWidth=s,this.renderHeaderRow0(e,s,t.systemLabel),this.renderHeaderRow1(e,s,t.destinationLabel)):this.headerWidth=-1,t.showFooter&&(this.renderFooter(e,i,s,t.navOptions),this.footerRow=i-1)}renderHeaderRow0(e,t,i){const s=i!==void 0?i??"":(()=>{const c=ne(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),r="::";g(e,0,0,r,"bright-black","black"),g(e,0,r.length,s,"bright-cyan","black");const a=t-r.length-s.length-10;let l=r.length+s.length;for(let c=0;c<a;c++)e[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,g(e,0,l,"[M]","white","black"),l+=3,g(e,0,l," MENU","white","black"),l+=5,g(e,0,l,"::","bright-black","black")}renderHeaderRow1(e,t,i){const s=i!==void 0?i??"":(()=>{const h=this.player.destinationId?N(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),r=os(this.player.credits),o=r.length+5,a="::";g(e,1,0,a,"bright-black","black"),g(e,1,a.length,s,"cyan","black");const l=t-a.length-s.length-o;let c=a.length+s.length;for(let h=0;h<l;h++)e[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,g(e,1,c,r,"green","black"),c+=r.length,g(e,1,c," CR","white","black"),c+=3,g(e,1,c,"::","bright-black","black")}renderFooter(e,t,i,s){const r=t-1,o=[];if(s.length===0){for(let l=0;l<i;l++)e[r][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}g(e,r,0,"::","bright-black","black");let a=2;for(let l=0;l<s.length;l++){l>0&&(g(e,r,a,"::","bright-black","black"),a+=2);const c=s[l],h=`[${l+1}]`,d=` ${c.label}`,p=a;g(e,r,a,h,"white","black"),a+=h.length,g(e,r,a,d,"white","black"),a+=d.length,o.push({id:c.id,startCol:p,endCol:a})}for(let l=a;l<i;l++)e[r][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=o}hitTestNav(e,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const i of this.buttonRanges)if(e>=i.startCol&&e<i.endCol)return i.id;return null}hitTestHeader(e,t){if(this.headerWidth<0||t!==0)return null;const i=this.headerWidth-10,s=this.headerWidth-2;return e>=i&&e<s?"menu":null}}class Q{constructor(e,t,i,s){this.activeTabIdx=0,this.activated=!1,this.player=i,this.chrome=new as(t,i),this.opts=s,e.onCharInput&&e.onCharInput(r=>{this.activated||this.handleCharInput(r)}),e.onAction(r=>{if(!this.activated&&!this.preHandleAction(r)){if(r==="MENU"&&s.onMenu){s.onMenu();return}if(s.tabs){if(r==="LEFT"){const o=Math.max(0,this.activeTabIdx-1);o!==this.activeTabIdx&&(this.activeTabIdx=o,this.onTabChange(o));return}if(r==="RIGHT"){const o=Math.min(s.tabs.length-1,this.activeTabIdx+1);o!==this.activeTabIdx&&(this.activeTabIdx=o,this.onTabChange(o));return}}this.handleAction(r)}}),e.onTap&&e.onTap((r,o)=>{var l;if(this.activated||this.preHandleTap(r,o))return;const a=this.chrome.hitTestNav(r,o);if(a!==null){this.handleNavTap(a);return}if(this.chrome.hitTestHeader(r,o)==="menu"&&s.onMenu){s.onMenu();return}if(s.tabs&&s.title!==void 0){const c=s.showHeader??!0?X:qn,h=((l=s.summary)==null?void 0:l.length)??0,d=c+3+h;if(o===d){let p=3;for(let u=0;u<s.tabs.length;u++){const m=s.tabs[u].length+2;if(r>=p&&r<p+m){u!==this.activeTabIdx&&(this.activeTabIdx=u,this.onTabChange(u));return}p+=m+1}return}}this.handleTap(r,o)})}preHandleAction(e){return!1}preHandleTap(e,t){return!1}handleAction(e){}handleTap(e,t){}handleNavTap(e){}handleCharInput(e){}onTabChange(e){}buildChromeConfig(){return{showHeader:this.opts.showHeader??!0,showFooter:this.opts.showFooter??!0,navOptions:this.opts.navOptions}}suspend(){this.activated=!0}resume(){this.activated=!1}update(e){}render(e){var p;const t=e.length,i=t>0?e[0].length:0,s=this.opts;for(let u=0;u<t;u++)for(let m=0;m<i;m++)e[u][m]={char:" ",fg:"black",bg:"black"};const r=this.buildChromeConfig();this.chrome.render(e,r);const o=s.showHeader??!0,a=s.showFooter??!0,l=o?X:qn,c=((p=s.summary)==null?void 0:p.length)??0,h=Rn(t,a);let d;if(s.title!==void 0){g(e,l,2,s.title,"bright-white","black"),g(e,l+1,2,"'".repeat(s.title.length),"bright-black","black");for(let u=0;u<c;u++)g(e,l+2+u,2,s.summary[u],"bright-black","black");if(s.tabs){const u=l+3+c;let m=2;u<t&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++;for(let f=0;f<s.tabs.length;f++){const y=f===this.activeTabIdx,T=` ${s.tabs[f]} `,I=y?"black":"white",b=y?"green":"black";for(const M of T)u<t&&m<i&&(e[u][m]={char:M,fg:I,bg:b}),m++;u<t&&m<i&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++}d=l+5+c}else d=l+3+c}else d=l;this.renderContent(e,d,h)}}class pe extends Q{constructor(e,t,i,s,r,o,a=[],l=null,c){super(s,r,o,{navOptions:i,title:e,summary:a,tabs:l!==null?l.map(d=>d.label):void 0,onMenu:c}),this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.modal=null,this.lastContentTop=0,this._staticItems=t,this.tabs=l,this.infoLines=a;const h=a.length;this.lastContentTop=l!==null?X+5+h:X+3+h,this.resetCursor()}get items(){var e;return this.tabs!==null?((e=this.tabs[this.activeTabIdx])==null?void 0:e.items)??[]:this._staticItems}preHandleAction(e){return this.modal!==null?(this.modal.handleAction(e),!0):!1}preHandleTap(e,t){return this.modal!==null?(this.modal.handleTap(e,t),!0):!1}handleCharInput(e){this.modal!==null&&this.modal.handleCharInput(e)}onTabChange(e){this.resetCursor()}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):e==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):e==="SELECT"?this.activateCurrent():this.handleNavAction(e)}handleTap(e,t){const i=this.rowToVisibleItemIndex(t);i!==null&&!this.items[i].disabled&&(this.cursorIdx=i,this.activateCurrent())}moveCursor(e){const t=this.items,i=t.length;if(i===0)return;const s=this.cursorIdx===-1?e>0?i-1:0:this.cursorIdx;for(let r=0;r<i;r++){const o=((s+e*(r+1))%i+i)%i;if(!t[o].disabled){this.cursorIdx=o;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const e=this.items[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}rowToVisibleItemIndex(e){var s,r;let t=this.lastContentTop;const i=this.items;for(let o=0;o<i.length;o++){const a=1+(((s=i[o].details)==null?void 0:s.length)??0)+(((r=i[o].detailsColored)==null?void 0:r.length)??0);if(e>=t&&e<t+a)return o;t+=a}return null}resetCursor(){const e=this.items;for(let t=0;t<e.length;t++)if(!e[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(e){}openModal(e){this.modal=e,this.activated=!1}closeModal(){this.modal=null}renderContent(e,t,i){var I,b,M,v;this.lastContentTop=t;const r=e.length>0?e[0].length:0,o=i-1,a=o-t,l=this.items,c=l.map(x=>{var _,w;return 1+(((_=x.details)==null?void 0:_.length)??0)+(((w=x.detailsColored)==null?void 0:w.length)??0)}),d=c.reduce((x,_)=>x+_,0)>a,p=d?a-1:a,u=[];let m=[],f=0;for(let x=0;x<c.length;x++)f+c[x]>p?(m.length>0&&u.push(m),m=[x],f=c[x]):(m.push(x),f+=c[x]);m.length>0&&u.push(m),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const y=u[this.pageIndex]??[];let T=t;for(const x of y){const _=l[x],w=x===this.cursorIdx,D=_.disabled?"bright-black":w?"bright-green":_.accentFg??"white",K=_.infoFg??D,O=r-4;if(_.icon!==void 0){const k=_.icon.length;if(g(e,T,2,w?">":" ",D,"black"),g(e,T,3,_.icon,_.iconFg??D,"black"),_.info!==void 0){const E=_.info.length,A=Math.max(0,O-1-k-2-E-1),C=_.label.length>A?_.label.slice(0,A):_.label,j=Math.max(1,O-1-k-C.length-2-E);g(e,T,3+k,C+" ",D,"black"),g(e,T,3+k+C.length+1,".".repeat(j),"bright-black","black"),g(e,T,3+k+C.length+1+j+1,_.info,K,"black")}else g(e,T,3+k,_.label.slice(0,O-1-k),D,"black");for(let E=0;E<(((I=_.details)==null?void 0:I.length)??0);E++)T+1+E<=o&&g(e,T+1+E,2,("  "+_.details[E]).slice(0,O),_.detailsFg??"bright-black","black")}else if(_.info!==void 0){const k=w?"> ":"  ",R=Math.max(1,O-2-_.label.length-2-_.info.length);g(e,T,2,k+_.label+" ",D,"black"),g(e,T,2+k.length+_.label.length+1,".".repeat(R),"bright-black","black"),g(e,T,2+k.length+_.label.length+1+R+1,_.info,K,"black")}else if(_.details!==void 0&&_.details.length>0){g(e,T,2,((w?"> ":"  ")+_.label).slice(0,O),D,"black");for(let R=0;R<_.details.length;R++)T+1+R<=o&&g(e,T+1+R,2,("  "+_.details[R]).slice(0,O),_.detailsFg??"bright-black","black")}else g(e,T,2,((w?"> ":"  ")+_.label).slice(0,O),D,"black");const G=((b=_.details)==null?void 0:b.length)??0;for(let k=0;k<(((M=_.detailsColored)==null?void 0:M.length)??0);k++){const R=T+1+G+k;if(R<=o){const E=_.detailsColored[k];let A=4;for(const C of E.left)g(e,R,A,C.text,C.fg,"black"),A+=C.text.length;if(E.right!==void 0){const C=O-4-E.right.text.length;g(e,R,C,E.right.text,E.right.fg,"black")}}}T+=1+G+(((v=_.detailsColored)==null?void 0:v.length)??0)}d&&Yt(e,o,r,this.pageIndex,this.lastPageCount),this.modal!==null&&this.modal.render(e)}}class Vn extends pe{constructor(e,t,i,s,r){const o=s.length===0?[{label:"NO OPTIONS AVAILABLE",disabled:!0,action:()=>{}}]:s.map(a=>({label:a.label,action:a.action}));super("MENU",o,[{id:"game",label:"GAME"}],e,t,i,[],null,r),this.onClose=r}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onClose())}handleNavTap(e){e==="game"&&!this.activated&&(this.activated=!0,this.onClose())}}function me(n){return n.size==="medium"||n.size==="large"}function Ee(n,e){return n>=e.reputation.levelReveredMin?3:n>=e.reputation.levelLikedMin?2:n>=e.reputation.levelFriendlyMin?1:n<e.reputation.levelUnfriendlyMin?-2:n<e.reputation.levelNeutralMin?-1:0}function Xt(n){switch(n){case-2:return"HATED";case-1:return"UNFRIENDLY";case 0:return"NEUTRAL";case 1:return"FRIENDLY";case 2:return"LIKED";case 3:return"REVERED";default:return"NEUTRAL"}}function zn(n,e){switch(n){case-2:return e.reputation.tradeModifierHated;case-1:return e.reputation.tradeModifierUnfriendly;case 1:return e.reputation.tradeModifierFriendly;case 2:return e.reputation.tradeModifierLiked;case 3:return e.reputation.tradeModifierRevered;default:return e.reputation.tradeModifierNeutral}}function En(n){return`${n<0?"":"+"}${n}`}function Ln(n,e,t){const i=new Map;i.set(n.id,e);const s=Math.floor(e/2);for(const o of n.allies)i.set(o,s);const r=-Math.floor(e/2);for(const o of n.rivals)i.set(o,r);return i}function Ae(n,e){return n.type==="delivery"?n.pickupComplete?e.destinationId===n.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":n.requirements.every(i=>{const s=e.cargoHold.find(r=>r.commodityId===i.commodityId);return s!==void 0&&s.qty>=i.qty})?"ready-to-deliver":"needs-supplies"}function ls(n,e){if(e.type==="delivery"){if(n.cargoCapacity-n.cargoWeightKg<e.itemWeightKg)return{ok:!1,reason:"Insufficient cargo space"};if(n.credits<e.deposit)return{ok:!1,reason:"Insufficient credits for deposit"}}return{ok:!0}}class Fn{constructor(e){const t=qe(e.shipId);if(!t)throw new Error(`Unknown ship: ${e.shipId}`);this.shipId=e.shipId,this.driveId=e.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=e.credits,this._systemId=e.systemId,this._destinationId=e.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[],this._hullIntegrity=1,this._factionReputation=new Map;for(const i of F().factions)me(i)&&this._factionReputation.set(i.id,0);this._destinationMissions=new Map}static createMock(){const e=Vt(),t=qe(e.startingShip);if(!t)throw new Error(`Unknown starting ship: ${e.startingShip}`);return new Fn({shipId:e.startingShip,driveId:t.defaultJumpDrive,credits:e.player.startingCredits,systemId:e.startingLocation.system,destinationId:e.startingLocation.destination})}get fuelL(){return this._fuelL}addFuel(e){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+e)}consumeFuel(e){this._fuelL=Math.max(0,this._fuelL-e)}getInSystemHopCost(){const e=qe(this.shipId),t=F().balance;return Math.ceil(t.fuel.inSystemBaseConsumptionL*e.fuelEfficiency)}get credits(){return this._credits}addCredits(e){this._credits+=e}spendCredits(e){this._credits-=e}get cargoHold(){return this._cargoHold}addCargo(e,t){const i=this._cargoHold.find(s=>s.commodityId===e);i?i.qty+=t:this._cargoHold.push({commodityId:e,qty:t})}removeCargo(e,t){const i=this._cargoHold.findIndex(s=>s.commodityId===e);i<0||(t!==void 0&&t<this._cargoHold[i].qty?this._cargoHold[i].qty-=t:this._cargoHold.splice(i,1))}get missionItemsWeightKg(){return this._missionItems.reduce((e,t)=>e+t.weightKg,0)}get cargoWeightKg(){return ss(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(e){this._destinationId=e}undock(){this._destinationId=null}jumpTo(e){this._systemId=e,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(e,t){const i={...e,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(i),e.type==="delivery"&&(this._credits-=e.deposit,t&&(this._missionItems.push({missionId:e.id,itemName:e.itemName,weightKg:e.itemWeightKg}),i.pickupComplete=!0))}collectMissionItem(e){const t=this._activeMissions.find(i=>i.id===e);!t||t.type!=="delivery"||(t.pickupComplete=!0,this._missionItems.push({missionId:t.id,itemName:t.itemName,weightKg:t.itemWeightKg}))}completeMission(e){this._activeMissions=this._activeMissions.filter(t=>t.id!==e),this._missionItems=this._missionItems.filter(t=>t.missionId!==e)}cancelMission(e){this._activeMissions=this._activeMissions.filter(t=>t.id!==e),this._missionItems=this._missionItems.filter(t=>t.missionId!==e)}getMissionsForPickup(e){return this._activeMissions.filter(t=>t.type==="delivery"&&t.pickupDestinationId===e&&!t.pickupComplete)}getMissionsForDelivery(e){return this._activeMissions.filter(t=>t.deliveryDestinationId===e&&Ae(t,this)==="ready-to-deliver")}get hullIntegrity(){return this._hullIntegrity}applyHullDamage(e){this._hullIntegrity=Math.max(0,this._hullIntegrity-e)}getFactionReputation(e){return this._factionReputation.get(e)??0}modifyFactionReputation(e,t,i){const s=this.getFactionReputation(e),r=Math.min(i.reputation.pointsMax,Math.max(i.reputation.pointsMin,s+t));this._factionReputation.set(e,r)}getDestinationMissions(e){const t=this._destinationMissions.get(e);return t?Date.now()-t.generatedAt>F().balance.missions.missionTtlMs?[]:t.specs:[]}refreshDestinationMissions(e,t){this._destinationMissions.set(e,{specs:t,generatedAt:Date.now()})}}const Xn=40;class xn{constructor(e){this.focus="confirm",this.confirmRect=null,this.cancelRect=null,this.opts=e}handleAction(e){var t,i;if(e==="BACK"){this.opts.onConfirm();return}if(e==="LEFT"||e==="RIGHT"||e==="TAB"){this.opts.cancelLabel!==void 0&&(this.focus=this.focus==="confirm"?"cancel":"confirm");return}e==="SELECT"&&(this.focus==="cancel"?(i=(t=this.opts).onCancel)==null||i.call(t):this.opts.onConfirm())}handleCharInput(e){}handleTap(e,t){var i,s;this.confirmRect&&t===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.opts.onConfirm():this.cancelRect&&t===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&((s=(i=this.opts).onCancel)==null||s.call(i))}render(e){const t=e.length,i=t>0?e[0].length:0,{title:s,body:r,confirmLabel:o,cancelLabel:a}=this.opts,l=Xn-2,c=tn(r,l),h=c.length,d=4+h+1+1+1,p=Xn,u=Math.floor((i-p)/2),m=Math.floor((t-d)/2);for(let v=0;v<d;v++)for(let x=0;x<p;x++){const _=m+v,w=u+x;_>=0&&_<t&&w>=0&&w<i&&(e[_][w]={char:" ",fg:"white",bg:"black"})}const f=(v,x,_)=>{v>=0&&v<t&&x>=0&&x<i&&(e[v][x]={char:_,fg:"white",bg:"black"})};f(m,u,"+"),f(m,u+p-1,"+");for(let v=1;v<p-1;v++)f(m,u+v,"-");f(m+d-1,u,"+"),f(m+d-1,u+p-1,"+");for(let v=1;v<p-1;v++)f(m+d-1,u+v,"-");for(let v=1;v<d-1;v++)f(m+v,u,"|"),f(m+v,u+p-1,"|");const y=s.slice(0,l),T=m+1,I=u+1+Math.floor((l-y.length)/2);g(e,T,I,y,"bright-white","black"),g(e,m+2,I,"'".repeat(y.length),"bright-black","black");for(let v=0;v<c.length;v++)g(e,m+4+v,u+1,c[v],"white","black");const b=m+4+h+1,M=`[ ${o} ]`;if(a!==void 0){const v=`[ ${a} ]`,x=2,_=M.length+x+v.length,w=Math.floor((l-_)/2),D=u+1+w,K=D+M.length+x;this.confirmRect={col:D,row:b,width:M.length},this.cancelRect={col:K,row:b,width:v.length};const O=this.focus==="confirm",G=this.focus==="cancel";g(e,b,D,M,O?"black":"white",O?"green":"black"),g(e,b,K,v,G?"black":"white",G?"green":"black")}else{const v=Math.floor((l-M.length)/2),x=u+1+v;this.confirmRect={col:x,row:b,width:M.length},this.cancelRect=null,g(e,b,x,M,"black","green")}}}const cs={delivery:"[D] ",supply:"[S] "},hs={"pending-pickup":"PENDING PICKUP","needs-supplies":"NEEDS SUPPLIES","in-transit":"IN TRANSIT","ready-to-deliver":"READY TO DELIVER"},ds={"pending-pickup":"yellow","needs-supplies":"yellow","in-transit":"bright-black","ready-to-deliver":"bright-green"};class us extends pe{constructor(e,t,i,s,r){super("MISSIONS",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,t,i,[],null,r),this.onBack=s,this.onGame=r}get items(){const e=this.player.activeMissions;return e.length===0?[{label:"NO ACTIVE MISSIONS",disabled:!0,action:()=>{}}]:this.sortMissions(e).map(i=>this.buildMenuItem(i))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const t=e[this.cursorIdx];t.disabled||t.action()}getStatusPriority(e){return e==="ready-to-deliver"?0:e==="needs-supplies"||e==="pending-pickup"?1:e==="in-transit"?2:3}sortMissions(e){return[...e].sort((t,i)=>{var d,p;const s=((d=N(t.deliveryDestinationId))==null?void 0:d.name)??t.deliveryDestinationId,r=((p=N(i.deliveryDestinationId))==null?void 0:p.name)??i.deliveryDestinationId,o=s.localeCompare(r);if(o!==0)return o;const a=Ae(t,this.player),l=Ae(i,this.player),c=this.getStatusPriority(a)-this.getStatusPriority(l);if(c!==0)return c;const h={delivery:0,supply:1};return h[t.type]-h[i.type]})}buildMenuItem(e){const t=Ae(e,this.player),i=N(e.deliveryDestinationId),s=(i==null?void 0:i.name)??e.deliveryDestinationId,r=hs[t]??t,o=ds[t]??"white",a=[`Status: ${r}`,`Dest: ${s}`];e.type!=="supply"&&a.push("");const l=e.type==="supply"?this.buildSupplyDetails(e):[];return{label:e.title,icon:cs[e.type],iconFg:"bright-yellow",info:`${e.reward} CR`,infoFg:"bright-green",details:a,detailsFg:o,detailsColored:l,action:()=>this.openMissionModal(e)}}buildSupplyDetails(e){if(e.type!=="supply")return[];const t=e.requirements.map(i=>{const s=F().commodities.find(c=>c.id===i.commodityId),r=(s==null?void 0:s.name)??i.commodityId,o=this.player.cargoHold.find(c=>c.commodityId===i.commodityId),a=(o==null?void 0:o.qty)??0,l=a>=i.qty;return{left:[{text:`${i.qty}x ${r} `,fg:"white"},{text:`(have: ${a})`,fg:l?"bright-green":"bright-black"}]}});return t.push({left:[]}),t}openMissionModal(e){let t=e.description;if(e.giverFactionId){const i=F(),s=i.factions.find(r=>r.id===e.giverFactionId);if(s){const r=P(),o=e.reward;let a;o>=r.reputation.missionTierLargeReward?a=r.reputation.missionDeltaLarge:o>=r.reputation.missionTierMediumReward?a=r.reputation.missionDeltaMedium:a=r.reputation.missionDeltaSmall;const l=Ln(s,a,i.factions),c=[];for(const[h,d]of l){const p=i.factions.find(u=>u.id===h);p&&c.push({id:h,name:p.name,delta:d})}c.sort((h,d)=>h.delta!==d.delta?d.delta-h.delta:h.name.localeCompare(d.name)),t+=`

REPUTATION IMPACT:
`;for(const h of c){const d=En(h.delta);t+=`  ${h.name.padEnd(20)} ${d}
`}}}this.openModal(new xn({title:e.title,body:t,confirmLabel:"OKAY",cancelLabel:"CANCEL MISSION",onConfirm:()=>this.closeModal(),onCancel:()=>{this.player.cancelMission(e.id),this.closeModal();const i=this.player.activeMissions.length;i===0?this.cursorIdx=-1:this.cursorIdx>=i&&(this.cursorIdx=i-1)}}))}handleNavAction(e){e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):(e==="BACK"||e==="NAV_2")&&!this.activated&&(this.activated=!0,this.onBack())}handleNavTap(e){e==="game"&&!this.activated?(this.activated=!0,this.onGame()):e==="menu"&&!this.activated&&(this.activated=!0,this.onBack())}}const Cn=20,ps="█",ms="░";function fs(n,e,t){return n<=e?0:n>=t?Cn:Math.round((n-e)/(t-e)*Cn)}const gs={[-2]:"red",[-1]:"bright-red",0:"white",1:"bright-green",2:"bright-green",3:"bright-cyan"};class ys extends pe{constructor(e,t,i,s,r){super("REPUTATION",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,t,i,[],null,r),this.onBack=s,this.onGame=r}get items(){const e=P(),i=F().factions.filter(s=>me(s));return i.sort((s,r)=>{if(s.size!==r.size){if(s.size==="large")return-1;if(r.size==="large")return 1}return s.name.localeCompare(r.name)}),i.map(s=>{const r=this.player.getFactionReputation(s.id),o=Ee(r,e),a=Xt(o),l=gs[o]??"white",c=fs(r,e.reputation.pointsMin,e.reputation.levelReveredMin),h=Cn-c;return{label:s.name,info:a,infoFg:l,detailsColored:[{left:[{text:ps.repeat(c),fg:l},{text:ms.repeat(h),fg:"bright-black"}],right:{text:String(r),fg:"white"}},{left:[]}],action:()=>{}}})}activateCurrent(){}handleNavAction(e){e==="BACK"&&!this.activated?(this.activated=!0,this.onBack()):e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):super.handleNavAction(e)}handleNavTap(e){e==="menu"&&!this.activated?(this.activated=!0,this.onBack()):e==="game"&&!this.activated&&(this.activated=!0,this.onGame())}}class _s extends Q{constructor(e,t,i,s){super(e,t,i,{navOptions:[]}),this.pageIndex=0,this.onContinue=s;const o=ns("game-start")[0].text.split(`

`),a=o[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=o.slice(1)):(this.yearHeader="",l=o);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),p=tn(d,36);h>0&&c.push(""),c.push(...p)}this.bodyLines=c}handleAction(e){e==="SELECT"?(this.activated=!0,this.onContinue()):e==="LEFT"?this.pageIndex>0&&this.pageIndex--:e==="RIGHT"&&this.pageIndex++}handleTap(e,t){this.activated=!0,this.onContinue()}renderContent(e,t,i){const s=e.length>0?e[0].length:0;if(this.yearHeader){const m=Math.max(0,Math.floor((s-this.yearHeader.length)/2));g(e,t,m,this.yearHeader,"bright-yellow","black")}const r=t+2,o=i-1,a=o-r,l=Math.max(1,a),c=Math.max(1,Math.ceil(this.bodyLines.length/l));this.pageIndex>=c&&(this.pageIndex=c-1);const h=c>1,d=this.pageIndex*l,p=Math.min(d+l,this.bodyLines.length);let u=r;for(let m=d;m<p;m++){const f=this.bodyLines[m];f!==""&&g(e,u,2,f,"white","black"),u++}h&&Yt(e,o,s,this.pageIndex,c)}}const bs=30;class Tn{constructor(e){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=e,this.value=Math.max(e.field.min,Math.min(e.field.max,e.field.initialValue))}handleAction(e){const{field:t}=this.formDef;if(e==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(e==="UP"){this.value=Math.min(t.max,this.value+1);return}if(e==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(e==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(e==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(e==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}e==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(e){if(this.focus!=="field")return;const{field:t}=this.formDef;if(e==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(e>="0"&&e<="9"){const i=parseInt(e,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,i)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+i)}}handleTap(e,t){this.confirmRect&&t===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(e){const t=e.length,i=t>0?e[0].length:0,{title:s,field:r,derivedRows:o,confirmLabel:a}=this.formDef,l=o.length,c=8+l,h=bs,d=Math.floor((i-h)/2),p=Math.floor((t-c)/2);for(let C=0;C<c;C++)for(let j=0;j<h;j++){const W=p+C,J=d+j;W>=0&&W<t&&J>=0&&J<i&&(e[W][J]={char:" ",fg:"white",bg:"black"})}const u=(C,j,W)=>{C>=0&&C<t&&j>=0&&j<i&&(e[C][j]={char:W,fg:"white",bg:"black"})};u(p,d,"+"),u(p,d+h-1,"+");for(let C=1;C<h-1;C++)u(p,d+C,"-");u(p+c-1,d,"+"),u(p+c-1,d+h-1,"+");for(let C=1;C<h-1;C++)u(p+c-1,d+C,"-");for(let C=1;C<c-1;C++)u(p+C,d,"|"),u(p+C,d+h-1,"|");const m=h-2,f=p+1,y=d+1+Math.floor((m-s.length)/2);g(e,f,y,s,"bright-white","black"),g(e,p+2,y,"'".repeat(s.length),"bright-black","black");const T=[r.label,...o.map(C=>C.label)],I=Math.max(...T.map(C=>C.length)),b=d+1+I+3,M=p+4,v=this.focus==="field";g(e,M,d+1,r.label.padEnd(I)+" : ","white","black");const x=this.value.toString().padStart(5);g(e,M,b,x,v?"black":"white",v?"green":"black");for(let C=0;C<l;C++){const j=o[C],W=p+5+C,J=j.compute(this.value);g(e,W,d+1,j.label.padEnd(I)+" : ","white","black"),g(e,W,b,J,"white","black")}const _=p+4+l+2,w=`[ ${a} ]`,D="[ CANCEL ]",K=3,O=w.length+K+D.length,G=Math.floor((m-O)/2),k=d+1+G,R=k+w.length+K;this.confirmRect={col:k,row:_,width:w.length},this.cancelRect={col:R,row:_,width:D.length};const E=this.focus==="confirm",A=this.focus==="cancel";g(e,_,k,w,E?"black":"white",E?"green":"black"),g(e,_,R,D,A?"black":"white",A?"green":"black")}}class vs extends pe{constructor(e,t,i,s,r,o,a,l,c,h){const d=N(s),p=i.getMissionsForPickup(s),u=i.getMissionsForDelivery(s),m=p.map(A=>({label:`COLLECT: ${A.type==="delivery"?A.itemName:""}`,accentFg:"bright-yellow",action:()=>{}})),f=u.map(A=>({label:`DELIVER: ${A.title} → ${A.reward} CR`,accentFg:"bright-yellow",action:()=>{}})),y=[...m,...f],T=[];d.amenities.trader&&T.push({label:"TRADER",action:o}),i.getDestinationMissions(s).length>0&&T.push({label:"MISSION BOARD",action:a});const I=P();let b=null;if(d.owningFactionId){const A=F().factions.find(C=>C.id===d.owningFactionId);A&&me(A)&&(b=d.owningFactionId)}const M=I.fuel.pricePerLitre,v=b?zn(Ee(i.getFactionReputation(b),I),I):1,x=Math.round(M*v),_=i.fuelCapacityL-i.fuelL,w=Math.floor(i.credits/x),D=Math.min(_,w);let K=null;if(d.amenities.fuel&&D>0){const A=D*x;K=y.length+(y.length>0?1:0)+T.length,T.push({label:`BUY FUEL  +${D}L  ${A}CR`,action:()=>{}})}const O=[];y.length>0&&(O.push(...y),O.push({label:"────────────────────",disabled:!0,action:()=>{}})),O.push(...T);const G=tn(d.description,36).slice(0,3),k=`DANGER: ${d.dangerLevel.toUpperCase()}`,R=[...G,k];if(d.owningFactionId){const A=F().factions.find(C=>C.id===d.owningFactionId);A&&R.push(`OPERATED BY: ${A.name}`)}const E=d.locationType==="surface"||d.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",O,[{id:"undock",label:E}],e,t,i,R,null,h),this.onShip=c,this.onRefuel=r,this.onHub=l,this.fuelItemIdx=K,this.eligibleFactionId=b;for(let A=0;A<p.length;A++){const C=p[A];m[A].action=()=>{this.player.collectMissionItem(C.id),this.onHub()}}for(let A=0;A<u.length;A++){const C=u[A];f[A].action=()=>{if(Ae(C,this.player)!=="ready-to-deliver"){this.openModal(new xn({title:"CANNOT DELIVER",body:C.type==="delivery"?"Mission item is missing from your cargo.":"Required supplies are missing from your cargo.",confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.activated=!1}}));return}if(C.type==="supply")for(const Ce of C.requirements)this.player.removeCargo(Ce.commodityId,Ce.qty);const W=P(),J=F();let cn="";if(C.giverFactionId){const Ce=J.factions.find(Be=>Be.id===C.giverFactionId);if(Ce){const Be=C.reward;let Ue;Be>=W.reputation.missionTierLargeReward?Ue=W.reputation.missionDeltaLarge:Be>=W.reputation.missionTierMediumReward?Ue=W.reputation.missionDeltaMedium:Ue=W.reputation.missionDeltaSmall;const $n=Ln(Ce,Ue,J.factions);for(const[V,Z]of $n)this.player.modifyFactionReputation(V,Z,W);const hn=[];for(const[V,Z]of $n){const Wn=J.factions.find($i=>$i.id===V);Wn&&hn.push({id:V,name:Wn.name,delta:Z})}hn.sort((V,Z)=>V.delta!==Z.delta?Z.delta-V.delta:V.name.localeCompare(Z.name)),cn=`

REPUTATION:
`;for(const V of hn){const Z=En(V.delta);cn+=`  ${V.name.padEnd(20)} ${Z}
`}}}this.player.completeMission(C.id),this.player.addCredits(C.reward),this.openModal(new xn({title:"MISSION COMPLETE",body:`Mission complete!

You received ${C.reward} CR.${cn}`,confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.onHub()}}))}}}effectiveFuelPrice(){const e=P(),t=e.fuel.pricePerLitre;if(!this.eligibleFactionId)return t;const i=Ee(this.player.getFactionReputation(this.eligibleFactionId),e);return Math.round(t*zn(i,e))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx===-1)return;const t=e[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const i=this.effectiveFuelPrice(),s=this.player.fuelCapacityL-this.player.fuelL,r=Math.floor(this.player.credits/i),o=Math.min(s,r);this.openModal(new Tn({title:"BUY FUEL",field:{label:"Litres",initialValue:o,min:0,max:o},derivedRows:[{label:"Cost",compute:a=>`${a*i} CR`}],confirmLabel:"BUY",onConfirm:a=>{this.closeModal(),a>0&&this.onRefuel(a*i,a)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class ws extends pe{constructor(e,t,i,s,r,o,a,l,c,h){var f;const d=N(s),p=((f=d.npcs.trader)==null?void 0:f.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(p,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,i,[],u,h),this.repGainedThisVisit=0,this.traderStock=r,this.onBuy=o,this.onSell=a,this.onHub=l,this.onUndock=c;const m=d.owningFactionId;if(m){const y=zt(m);this.eligibleFactionId=y&&me(y)?m:null}else this.eligibleFactionId=null;this.syncItems(),this.clampCursor()}buyPrice(e,t){return Math.round(e*t)}sellPrice(e,t){return Math.round(e*t)}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(e=>{const t=de(e.commodityId);if(!t)return[];const i=e.effectiveFactor??1,s=this.buyPrice(t.basePrice,i),r=this.player.credits>=s;return[{label:`${t.name} (x${e.qty})`,info:`${s} CR`,disabled:!r,action:()=>{const o=Math.floor(this.player.credits/s),a=Math.min(e.qty,o);this.openModal(new Tn({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:a,min:0,max:a},derivedRows:[{label:"Total",compute:l=>`${l*s} CR`}],confirmLabel:"BUY",onConfirm:l=>{l>0&&(this.onBuy(e.commodityId,l,s),this.accrueReputation(l*s)),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const e=this.player.cargoHold;return e.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...e].flatMap(t=>{const i=de(t.commodityId);if(!i)return[];const s=N(this.player.destinationId??""),r=ne(s.system),o=Qe(t.commodityId,r),a=this.sellPrice(i.basePrice,o);return[{label:`${i.name} (x${t.qty})`,info:`${a} CR`,action:()=>{this.openModal(new Tn({title:i.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:l=>`${l*a} CR`}],confirmLabel:"SELL",onConfirm:l=>{l>0&&this.onSell(t.commodityId,l,a),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}accrueReputation(e){if(!this.eligibleFactionId)return;const t=P(),i=t.reputation.maxRepPerVisit-this.repGainedThisVisit;if(i<=0)return;const s=Math.min(i,e*t.reputation.repPerCredit);s<=0||(this.repGainedThisVisit+=s,this.player.modifyFactionReputation(this.eligibleFactionId,s,t))}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const e=this.items;(this.cursorIdx<0||this.cursorIdx>=e.length||(t=e[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=e.findIndex(i=>!i.disabled))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const t=e[this.cursorIdx];t.disabled||t.action()}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(e){if(this.syncItems(),super.render(e),this.eligibleFactionId){const s=P(),r=this.player.getFactionReputation(this.eligibleFactionId),o=Ee(r,s),l=`STANDING: ${Xt(o)}`;g(e,X+2,2,l,"bright-black","black")}const t=e.length,i=Rn(t,!0)-2;g(e,i,2,`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,"bright-black","black")}}const ks={delivery:"[D] ",supply:"[S] "};class ye extends pe{constructor(e,t,i,s,r,o,a,l,c){N(s);let h;r.length===0?h=[{label:"NO MISSIONS AVAILABLE",disabled:!0,action:()=>{}}]:h=ye.sortMissions(r).map(p=>ye.buildMenuItem(p,i,o)),super("MISSION BOARD",h,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,i,[],null,c),this.onHub=a,this.onUndock=l}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}static sortMissions(e){return[...e].sort((t,i)=>{var l,c;const s=((l=N(t.deliveryDestinationId))==null?void 0:l.name)??t.deliveryDestinationId,r=((c=N(i.deliveryDestinationId))==null?void 0:c.name)??i.deliveryDestinationId,o=s.localeCompare(r);if(o!==0)return o;const a={delivery:0,supply:1};return a[t.type]-a[i.type]})}static destColor(e,t){if(e===t.destinationId)return"bright-green";const i=N(e);return i&&i.system===t.systemId?"bright-yellow":"white"}static buildMenuItem(e,t,i){const s=N(e.deliveryDestinationId),r=(s==null?void 0:s.name)??e.deliveryDestinationId,o=[];if(o.push(`Dest: ${r}`),e.giverFactionId){const l=F().factions.find(c=>c.id===e.giverFactionId);l&&o.push(`For: ${l.name}`)}e.type!=="supply"&&o.push("");const a=e.type==="supply"?ye.buildSupplyDetails(e,t):[];return{label:e.title,icon:ks[e.type],iconFg:"bright-yellow",info:`${e.reward} CR`,infoFg:"bright-green",details:o,detailsFg:ye.destColor(e.deliveryDestinationId,t),detailsColored:a,action:()=>i(e)}}static buildSupplyDetails(e,t){if(e.type!=="supply")return[];const i=e.requirements.map(s=>{const r=F().commodities.find(h=>h.id===s.commodityId),o=(r==null?void 0:r.name)??s.commodityId,a=t.cargoHold.find(h=>h.commodityId===s.commodityId),l=(a==null?void 0:a.qty)??0,c=l>=s.qty;return{left:[{text:`${s.qty}x ${o} `,fg:"white"},{text:`(have: ${l})`,fg:c?"bright-green":"bright-black"}]}});return i.push({left:[]}),i}}class xs extends Q{constructor(e,t,i,s,r,o,a){super(r,o,a,{navOptions:s,title:e}),this.cursorIdx=-1,this.lastChoicesStartRow=0,this._choices=t,this._onBack=i,this.resetCursor()}preHandleAction(e){return e==="BACK"?(this.activated=!0,this._onBack(),!0):!1}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="SELECT"&&this.activateCurrent()}handleTap(e,t){const i=this.rowToChoiceIndex(t);i!==null&&!this._choices[i].disabled&&(this.cursorIdx=i,this.activateCurrent())}moveCursor(e){const t=this._choices,i=t.length;if(i===0)return;const s=this.cursorIdx===-1?e>0?i-1:0:this.cursorIdx;for(let r=0;r<i;r++){const o=((s+e*(r+1))%i+i)%i;if(!t[o].disabled){this.cursorIdx=o;return}}}activateCurrent(){if(this._choices.length===0||this.cursorIdx===-1)return;const e=this._choices[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}resetCursor(){const e=this._choices;for(let t=0;t<e.length;t++)if(!e[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}computeChoicesHeight(){var t;let e=0;for(const i of this._choices)e+=1+(((t=i.details)==null?void 0:t.length)??0);return e}rowToChoiceIndex(e){var i;if(e<this.lastChoicesStartRow)return null;let t=this.lastChoicesStartRow;for(let s=0;s<this._choices.length;s++){const r=1+(((i=this._choices[s].details)==null?void 0:i.length)??0);if(e>=t&&e<t+r)return s;t+=r}return null}render(e){const t=e.length,i=t>0?e[0].length:0;for(let m=0;m<t;m++)for(let f=0;f<i;f++)e[m][f]={char:" ",fg:"black",bg:"black"};const s=this.buildChromeConfig();this.chrome.render(e,s);const r=!0,o=X,a=Rn(t,r),l=this.opts.title;l!==void 0&&(g(e,o,2,l,"bright-white","black"),g(e,o+1,2,"'".repeat(l.length),"bright-black","black"));const c=o+2,h=this.computeChoicesHeight(),d=a-h-1,p=d-1;this.renderContent(e,c,p),d>=0&&d<t&&ge(e,d,i);let u=d+1;this.lastChoicesStartRow=u;for(let m=0;m<this._choices.length;m++){const f=this._choices[m],y=m===this.cursorIdx,T=y?">":" ",I=f.disabled?"bright-black":y?"bright-green":"white";if(u<t&&(g(e,u,2,T,I,"black"),g(e,u,3,f.label,I,"black")),u++,f.details)for(const b of f.details)u<t&&g(e,u,4,b.slice(0,i-4),"bright-black","black"),u++}}}const Cs={delivery:"[D]",supply:"[S]"};class Ts extends xs{constructor(e,t,i,s,r,o,a,l){const c=ls(i,s),h=s.type==="delivery"&&s.pickupDestinationId===s.issuingDestinationId,d=c.ok?{label:"ACCEPT MISSION",action:()=>r(h)}:{label:"ACCEPT MISSION",disabled:!0,details:c.reason?[c.reason]:[],action:()=>{}},p={label:"BACK",action:()=>o()};super("MISSION BOARD",[d,p],o,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,i),this.spec=s,this.onHub=a,this.onUndock=l}destColor(e){if(e===this.player.destinationId)return"bright-green";const t=N(e);return t&&t.system===this.player.systemId?"bright-yellow":"white"}writeDestRow(e,t,i,s,r,o){g(e,t,2,i,"white","black"),g(e,t,2+i.length,s.slice(0,o-i.length),this.destColor(r),"black")}handleAction(e){e==="NAV_1"?(this.activated=!0,this.onUndock()):e==="NAV_2"?(this.activated=!0,this.onHub()):super.handleAction(e)}handleNavTap(e){this.activated||(e==="undock"?(this.activated=!0,this.onUndock()):e==="hub"&&(this.activated=!0,this.onHub()))}renderContent(e,t,i){this.renderDetail(e,t,i)}renderDetail(e,t,i){const r=e.length>0?e[0].length:40,o=r-4;let a=t;const l=(u,m,f)=>{u<=i&&g(e,u,2,m.slice(0,o),f,"black")};l(a,`${Cs[this.spec.type]} ${this.spec.title}`,"bright-yellow"),a++;const c=F(),h=this.spec.giverFactionId?c.factions.find(u=>u.id===this.spec.giverFactionId):null,d=h?` [${h.name}]`:"";if(l(a,`    ${this.spec.giverName}${d}`,"bright-black"),a++,a++,this.spec.type==="delivery"){const u=N(this.spec.pickupDestinationId),m=N(this.spec.deliveryDestinationId);if(a<=i&&this.writeDestRow(e,a,"Pickup:  ",(u==null?void 0:u.name)??this.spec.pickupDestinationId,this.spec.pickupDestinationId,o),a++,a<=i&&this.writeDestRow(e,a,"Deliver: ",(m==null?void 0:m.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++,a<=i){const f=this.player.cargoCapacity-this.player.cargoWeightKg,y=this.spec.itemWeightKg,T=f>=y,I=`Weight:  ${y} kg  (Free: ${f} kg)`;g(e,a,2,I,"white","black");const b=T?"bright-green":"red",M=2+I.length+1;M<r&&g(e,a,M,T?"✓":"✗",b,"black")}a++}else{const u=N(this.spec.deliveryDestinationId);a<=i&&this.writeDestRow(e,a,"Deliver to: ",(u==null?void 0:u.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++;for(const m of this.spec.requirements){if(a>i)break;const f=de(m.commodityId);l(a,`  ${m.qty}x ${(f==null?void 0:f.name)??m.commodityId}`,"white"),a++}}a++;const p=tn(this.spec.description,o);for(const u of p){if(a>i)break;l(a,u,"white"),a++}if(a++,!(a>i)&&(l(a,`REWARD: ${this.spec.reward} CR`,"bright-green"),a++,this.spec.type==="delivery"&&this.spec.deposit>0&&(a<=i&&l(a,`DEPOSIT: ${this.spec.deposit} CR`,"bright-yellow"),a++),this.spec.giverFactionId)){const u=c.factions.find(m=>m.id===this.spec.giverFactionId);if(u){const m=P(),f=this.spec.reward;let y;f>=m.reputation.missionTierLargeReward?y=m.reputation.missionDeltaLarge:f>=m.reputation.missionTierMediumReward?y=m.reputation.missionDeltaMedium:y=m.reputation.missionDeltaSmall;const T=Ln(u,y,c.factions),I=[];for(const[b,M]of T){const v=c.factions.find(x=>x.id===b);v&&I.push({id:b,name:v.name,delta:M})}if(I.sort((b,M)=>b.delta!==M.delta?M.delta-b.delta:b.name.localeCompare(M.name)),I.length>0){if(a++,a>i)return;const b=i-1;a<=b&&(l(a,"REPUTATION IMPACT","bright-cyan"),a++);for(const M of I){if(a>b)break;const v=En(M.delta),x=M.delta>0?"bright-green":"red",_=o-v.length-2,w=M.name.slice(0,_),D=" ".repeat(Math.max(0,o-w.length-v.length-2));l(a,`  ${w}${D}${v}`,x),a++}}}}}}function Ms(n){if(n.length===0)return 2166136261;let e=2166136261;for(let t=0;t<n.length;t++)e^=n.charCodeAt(t),e=Math.imul(e,16777619)>>>0;return e===0?1:e}const Ss=[30,10,5],Is=[".","*","+"],Qn=[4e3,2e3,800],As=[9e3,5e3,2500],Rs=[null,"bright-black","white"],Es=["bright-black","white","bright-white"],Ls=["white","bright-white","bright-cyan"],$e=3,Jn=25,We=2,Zn=37,et=2*Math.PI;function Fs(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}class Ds{constructor(e=42){this.boundsSet=!1,this.rand=Fs(e),this.stars=[];for(let t=0;t<3;t++)for(let i=0;i<Ss[t];i++){const s=We+Math.floor(this.rand()*(Zn-We+1)),r=$e+Math.floor(this.rand()*(Jn-$e+1)),o=this.rand()*et,a=Qn[t]+this.rand()*(As[t]-Qn[t]);this.stars.push({col:s,row:r,layer:t,twinklePhase:o,twinklePeriod:a})}}update(e){for(const t of this.stars)t.twinklePhase+=et/t.twinklePeriod*e}render(e,t,i,s,r){if(!this.boundsSet){this.boundsSet=!0;const o=Jn-$e,a=Zn-We;{const l=(i-t)/o,c=(r-s)/a;for(const h of this.stars)h.row=Math.round(t+(h.row-$e)*l),h.col=Math.round(s+(h.col-We)*c)}}for(const o of this.stars){const{row:a,col:l,layer:c}=o;if(a<t||a>i||l<s||l>r)continue;const h=Math.sin(o.twinklePhase);let d;h>=.5?d=Ls[c]:h>=-.5?d=Es[c]:d=Rs[c],d!==null&&(e[a][l]={char:Is[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const Ns=2,Os=3,Ps=2*Math.PI/9e3,Hs=2*Math.PI/12e3,Bs=Math.PI/3;function nt(n,e,t){return Math.max(e,Math.min(t,n))}class Us{constructor(e,t,i,s,r,o=.5,a=.6){this.time=0,this.glyph=e,this.intRowStart=t,this.intRowEnd=i,this.intColStart=s,this.intColEnd=r,this.glyphHeight=e.rows.length,this.glyphWidth=Math.max(...e.rows.map(l=>l.length)),this.anchorRow=t+Math.floor((i-t)*o)-Math.floor(this.glyphHeight/2),this.anchorCol=s+Math.floor((r-s)*a)-Math.floor(this.glyphWidth/2)}update(e){this.time+=e}getDisplayPosition(){const e=Math.round(Ns*Math.sin(this.time*Ps)),t=Math.round(Os*Math.sin(this.time*Hs+Bs)),i=nt(this.anchorRow+e,this.intRowStart,this.intRowEnd-this.glyphHeight+1),s=nt(this.anchorCol+t,this.intColStart,this.intColEnd-this.glyphWidth+1);return{row:i,col:s}}render(e){const{row:t,col:i}=this.getDisplayPosition(),s=this.glyph.fg;for(let r=0;r<this.glyph.rows.length;r++){const o=this.glyph.rows[r];let a=-1,l=-1;for(let c=0;c<o.length;c++)o[c]!==" "&&(a===-1&&(a=c),l=c);if(a!==-1)for(let c=a;c<=l;c++){const h=o[c],d=t+r,p=i+c;d>=0&&d<e.length&&p>=0&&p<e[d].length&&(e[d][p]=h===" "?{char:" ",fg:"black",bg:"black"}:{char:h,fg:s,bg:"black"})}}}}const tt=[{rows:[">---<"," |*| ","  |  "],fg:"bright-white"},{rows:["/-\\","|O|","\\-/"],fg:"cyan"},{rows:["  *  ","--+--"," [H] ","  |  ","  *  "],fg:"bright-white"}],it=[{rows:[" /\\/\\","< ** >"," \\__/"],fg:"yellow"},{rows:["  ___"," /   \\","|  .  |"," \\___/"],fg:"yellow"},{rows:[" _/\\_","/  . \\","\\____/"],fg:"yellow"}],st=[{rows:["  .--."," / .. \\","| .... |"," \\ .. /","  `--'"],fg:"blue"},{rows:["  .--."," / ~~ \\","| ~~~~ |"," \\ ~~ /","  `--'"],fg:"bright-yellow"},{rows:["  .--."," /====\\","|======|"," \\====/","  `--'"],fg:"bright-cyan"}];function Gs(n,e){return n==="orbital"||n==="deep-space"?tt[e%tt.length]:n==="asteroid"?it[e%it.length]:n==="surface"?st[e%st.length]:null}const $s=6,un=6,Ws=23,Ks=23,pn=10,js=0,Ys=4,qs=18,Vs=21,zs=35,Xs=39,rt=12,Qs=11,le=13,Me=27,mn=28,Js=12,fn=40,ot=200,gn=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],Zs="#",at=["green","cyan","white","yellow"],lt=["*",".","+","x"];function er(n){return n>=.8?"bright-green":n>=.5?"yellow":"red"}function ct(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function nr(n,e,t){return{col:e,row:t,char:Zs,color:at[Math.floor(n()*at.length)],phase:n()*2e4,period:1e4+n()*1e4,active:n()>.2}}function Se(n,e,t,i){const s=[];for(const r of i)for(let o=e;o<=t;o++)s.push(nr(n,o,r));return s}class tr extends Q{constructor(e,t,i,s,r,o,a){var u;super(e,t,i,{navOptions:[],onMenu:a}),this.cursorIdx=0,this.h=30,this.destObject=null,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.onTravel=s,this.onDock=r,this.onCargo=o;const l=Ms(i.destinationId??"");this.starfield=new Ds(l),this.inSpace=i.destinationId===null;const c=i.destinationId!=null?(u=N(i.destinationId))==null?void 0:u.locationType:void 0;this.destGlyph=Gs(c,l),this.destRowFrac=.15+Math.random()*.7,this.destColFrac=.15+Math.random()*.7;const h=ct(99);this.gaugeBtns=[...Se(h,js,Ys,[3,4]),...Se(h,qs,Vs,[3,4]),...Se(h,zs,Xs,[3,4])],this.leftBtns=Se(h,0,Qs,[0,1,2,3]),this.rightBtns=Se(h,mn,39,[0,1,2,3]);const d=ct(77),p=3+Math.floor(d()*4);this.radarContacts=Array.from({length:p},()=>({x:d()*(Me-le-1),y:d()*4,vx:(d()-.5)*2,vy:(d()-.5)*1.5,char:lt[Math.floor(d()*lt.length)]}))}navCount(){return this.inSpace?1:2}handleAction(e){e==="CARGO"?(this.activated=!0,this.onCargo()):e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.navCount())%this.navCount():e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.navCount():e==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,this.onTravel()):this.inSpace||(this.activated=!0,this.onDock()))}handleTap(e,t){const i=this.h;(t===3||t===4)&&e>=un&&e<un+1+pn?(this.activated=!0,this.onCargo()):t===i-3&&e<rt?(this.activated=!0,this.onTravel()):t===i-3&&e>=mn&&!this.inSpace&&(this.activated=!0,this.onDock())}update(e){var s;this.starfield.update(e),(s=this.destObject)==null||s.update(e),this.blinkPhase=(this.blinkPhase+e)%1e3;for(const r of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])r.phase+=e,r.phase>=r.period&&(r.phase-=r.period,r.active=!r.active);const t=Me-le,i=5;for(const r of this.radarContacts)r.x+=r.vx*e/1e3,r.y+=r.vy*e/1e3,r.x<0&&(r.x=-r.x,r.vx=-r.vx),r.x>t-1&&(r.x=2*(t-1)-r.x,r.vx=-r.vx),r.y<0&&(r.y=-r.y,r.vy=-r.vy),r.y>i-1&&(r.y=2*(i-1)-r.y,r.vy=-r.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-e);else for(this.tickerAccum+=e;this.tickerAccum>=ot;){this.tickerAccum-=ot,this.tickerScroll++;const r=gn[this.msgIdx];if(this.tickerScroll>=r.length+fn-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%gn.length,this.tickerPause=500,this.tickerAccum=0;break}}}renderContent(e,t,i){var d;const s=e.length,r=s>0?e[0].length:0;this.h=s;const o=t+2,a=s-8,l=s-7,c=s-3,h=s-2;this.renderGaugeStrip(e,t),this.starfield.render(e,o,a,0,39),!this.destObject&&this.destGlyph&&(this.destObject=new Us(this.destGlyph,o+1,a-1,0,39,this.destRowFrac,this.destColFrac)),(d=this.destObject)==null||d.render(e);for(let p=0;p<r;p++)e[o][p]={char:"-",fg:"white",bg:"black"},e[a][p]={char:"-",fg:"white",bg:"black"};this.renderHUD(e,o+1),this.renderCrosshair(e,o+1,a-1),this.renderBottomPanels(e,l,c),this.renderTicker(e,h)}renderGaugeStrip(e,t){for(const a of this.gaugeBtns){const l=t+a.row-3,c=a.active?a.color:"bright-black";l>=0&&l<e.length&&(e[l][a.col]={char:a.char,fg:c,bg:"black"})}const i=this.player.fuelL/this.player.fuelCapacityL,s=this.player.cargoWeightKg/this.player.cargoCapacity,r=this.blinkPhase<500,o=er(this.player.hullIntegrity);this.renderGauge(e,t,$s,"F",i,"yellow",r),this.renderGauge(e,t+1,un,"C",s,"blue",r),this.renderGauge(e,t,Ws,"S",1,"cyan",r),this.renderGauge(e,t+1,Ks,"H",this.player.hullIntegrity,o,r)}renderGauge(e,t,i,s,r,o,a){if(t<0||t>=e.length)return;e[t][i]={char:s,fg:o,bg:"black"};const l=Math.round(Math.min(1,Math.max(0,r))*pn),c=r<=.2;for(let h=0;h<pn;h++){const d=i+1+h;if(h<l){const p=c&&!a?"bright-black":o;e[t][d]={char:" ",fg:"black",bg:p}}else e[t][d]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(e,t){g(e,t,1,"VEL:----","bright-black","black"),g(e,t,16,"ATT:---°","bright-black","black"),g(e,t,30,"ROT:--°","bright-black","black")}renderCrosshair(e,t,i){var a;const s=Math.floor((t+i)/2),r=20;e[s][r]={char:"+",fg:"bright-green",bg:"black"};const o=[[s-3,r-5],[s-3,r+5],[s+3,r-5],[s+3,r+5]];for(const[l,c]of o){const h=((a=e[0])==null?void 0:a.length)??40;l>=t&&l<=i&&c>=0&&c<h&&(e[l][c]={char:"+",fg:"bright-green",bg:"black"})}}renderBottomPanels(e,t,i){for(let c=t;c<=i;c++)for(let h=le;h<Me;h++)e[c][h]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(e,t,i-t+1);for(const c of this.leftBtns){const h=t+c.row;if(h<i){const d=c.active?c.color:"bright-black";e[h][c.col]={char:c.char,fg:d,bg:"black"}}}for(const c of this.rightBtns){const h=t+c.row;if(h<i){const d=c.active?c.color:"bright-black";e[h][c.col]={char:c.char,fg:d,bg:"black"}}}const s=this.cursorIdx===0?"bright-yellow":"yellow";g(e,i,0,this.centerPad("TRAVEL",rt),"black",s);let r,o;this.inSpace?(r="bright-black",o="bright-black"):(r=this.cursorIdx===1?"bright-cyan":"cyan",o="black"),g(e,i,mn,this.centerPad("DOCK",Js),o,r);const a=Me-le,l="<)) "+"-".repeat(a-4);g(e,i,le,l,"white","bright-black")}renderRadar(e,t,i){for(const s of this.radarContacts){const r=Math.min(Me-le-1,Math.max(0,Math.floor(s.x))),o=Math.min(i-1,Math.max(0,Math.floor(s.y)));e[t+o][le+r]={char:s.char,fg:"white",bg:"bright-black"}}}renderTicker(e,t){const i=gn[this.msgIdx];for(let s=0;s<fn;s++){const r=this.tickerScroll-fn+1+s,o=r>=0&&r<i.length?i[r]:" ";e[t][s]={char:o,fg:"white",bg:"black"}}}centerPad(e,t){if(e.length>=t)return e.slice(0,t);const i=t-e.length,s=Math.floor(i/2);return" ".repeat(s)+e+" ".repeat(i-s)}}class ir extends Q{constructor(e,t,i,s,r){super(e,t,i,{title:"CARGO HOLD",tabs:["COMMODITIES","MISSION GOODS"],navOptions:[{id:"back",label:"BACK"}],onMenu:r}),this.onBack=s}handleNavTap(e){e==="back"&&(this.activated=!0,this.onBack())}handleAction(e){(e==="BACK"||e==="CARGO")&&(this.activated=!0,this.onBack())}renderContent(e,t,i){const r=e.length>0?e[0].length:0,o=this.player.cargoHold,a=this.player.missionItems,l=this.player.cargoCapacity,c=this.player.cargoWeightKg,h=i-1;this.activeTabIdx===0?this.renderCommoditiesTab(e,t,h,r,o):this.renderMissionGoodsTab(e,t,h,r,a);const d=`CARGO: ${c}/${l}KG`,p=`FUEL: ${this.player.fuelL}/${this.player.fuelCapacityL}L`;g(e,h,2,d,"bright-black","black"),g(e,h,r-p.length-2,p,"bright-black","black")}renderCommoditiesTab(e,t,i,s,r){if(r.length===0){g(e,t,2,"NO COMMODITIES","bright-black","black");return}let o=t;for(const a of r){if(o>=i-1)break;const l=de(a.commodityId);if(!l)continue;const c=a.qty*l.weightKg,h=`  x${a.qty}  ${l.basePrice}CR  ${c}KG`,d=Math.max(6,s-4-h.length),p=l.name,u=p.length>d?p.slice(0,d):p;g(e,o,2,`${u}${h}`,"white","black"),o++}}renderMissionGoodsTab(e,t,i,s,r){if(r.length===0){g(e,t,2,"NO MISSION GOODS","bright-black","black");return}let o=t;for(const a of r){if(o>=i-1)break;const l=`  ${a.weightKg}KG`,c=Math.max(6,s-4-l.length),h=a.itemName.length>c?a.itemName.slice(0,c):a.itemName;g(e,o,2,`${h}${l}`,"white","black"),o++}}}class ht extends pe{constructor(e,t,i,s,r,o,a,l,c=()=>{},h){const d=ne(i.systemId),p=qt(i.driveId),u=i.getInSystemHopCost(),m=i.fuelL<u,f=[...d.destinations.map(b=>({label:`${N(b).name.toUpperCase()}  [${u}L]`,disabled:b===i.destinationId||m,action:()=>s(b)})),{label:`FLY INTO SPACE  [${u}L]`,disabled:i.destinationId===null||m,action:o}];m&&h&&f.push({label:"[EMERGENCY]",disabled:!1,action:h});const T=[...An(i.systemId).map(b=>{const M=b.from===i.systemId?b.to:b.from,v=ne(M),x=Math.ceil(P().fuel.consumptionPerLy*b.distance*p.fuelEfficiency);return{label:`${v.name.toUpperCase()}  ${b.distance}LY  [${x}L]`,disabled:x>i.fuelL,action:()=>r(M)}}),{label:"GALAXY MAP...",action:l}],I=[{label:"DESTINATIONS",items:f},{label:"JUMPS",items:T}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],e,t,i,[],I,c),this.onShip=a}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}class sr extends Q{constructor(e,t,i,s,r,o){super(e,t,i,{navOptions:[],title:"EMERGENCY RESCUE"}),this.cursorIdx=0,this.onBack=o;const a=ne(i.systemId),l=P();if(this.options=[],this.fuelDestId=a.destinations.find(c=>{var h;return((h=N(c))==null?void 0:h.amenities.fuel)===!0}),this.fuelDestId){const c=N(this.fuelDestId);this.options.push({label:`TOW TO ${c.name.toUpperCase()}`,fee:l.emergencyRescue.towFee,action:()=>s(this.fuelDestId)})}this.options.push({label:"EMERGENCY FUEL DROP",fee:l.emergencyRescue.fuelDropFee,action:r}),this.options.push({label:"BACK",fee:0,action:o})}preHandleAction(e){return e==="BACK"?(this.activated=!0,this.onBack(),!0):!1}handleAction(e){e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.options.length)%this.options.length:e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.options.length:e==="SELECT"&&this.cursorIdx>=0&&this.cursorIdx<this.options.length&&(this.activated=!0,this.options[this.cursorIdx].action())}handleTap(e,t){this.cursorIdx>=0&&this.cursorIdx<this.options.length&&(this.activated=!0,this.options[this.cursorIdx].action())}renderContent(e,t,i){const s=e.length,r=s>0?e[0].length:0,o=ne(this.player.systemId);let a;this.player.destinationId===null?a=`STRANDED IN SPACE NEAR ${o.name.toUpperCase()}`:a=`STRANDED AT ${N(this.player.destinationId).name.toUpperCase()}`,g(e,t,2,a,"bright-yellow","black");const l=t+2;ge(e,l,r);let c=l+1;for(let h=0;h<this.options.length;h++){const d=this.options[h],p=h===this.cursorIdx,u=p?">":" ",m=p?"bright-green":"white";if(c<s)if(g(e,c,2,u,m,"black"),d.fee===0)g(e,c,3,d.label,m,"black");else{g(e,c,3,d.label,m,"black");const f=this.player.credits-d.fee,y=`${d.fee} CR  (BALANCE: ${f>=0?"":"-"}${Math.abs(f)} CR)`,T=f<0?"bright-red":m;c+1<s&&g(e,c+1,4,y,T,"black"),c++}c++}}}function dt(n,e){if(n===e)return[n];const t=[[n]],i=new Set([n]);for(;t.length>0;){const s=t.shift(),r=s[s.length-1];for(const o of An(r)){const a=o.from===r?o.to:o.from;if(a===e)return[...s,a];i.has(a)||(i.add(a),t.push([...s,a]))}}return null}const rr=0,or=4,ar=8,lr=9,ut=10,pt=15,cr=16,hr=2,dr=10,ur=12,Ke=13,je=12,pr=25,mr=26,fr=10,mt=18;function gr(n,e){return n.length>=e?n.slice(0,e):n+" ".repeat(e-n.length)}function Ie(n,e){return"["+gr(n.toUpperCase(),e-2)+"]"}class ft extends Q{constructor(e,t,i,s,r=()=>{},o){const a=o?[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}]:[{id:"back",label:"BACK"}];super(e,t,i,{title:"GALAXY MAP",tabs:["MAP","ROUTE"],navOptions:a,onMenu:r}),this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.lastTop=X+5,this.onBack=s,this.onGame=o,this.publicSystems=is().sort((l,c)=>l.distanceFromSol-c.distanceFromSol),this.otherSystems=this.publicSystems.filter(l=>l.id!==i.systemId),this.mapBrowsingSystemId=i.systemId}onTabChange(e){this.searchText=""}handleCharInput(e){if(this.activeTabIdx!==0)return;const t=e.charCodeAt(0);e==="\b"||e===""?this.searchText=this.searchText.slice(0,-1):t>=32&&t<127&&(this.searchText+=e.toUpperCase(),this.mapCursorIdx=0)}handleAction(e){if(e==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}if(e==="NAV_1"){this.onGame&&(this.activated=!0,this.onGame());return}if(e==="NAV_2"){this.onGame&&(this.searchText="",this.activated=!0,this.onBack());return}this.activeTabIdx===0?this.handleMapAction(e):this.handleRouteAction(e)}handleNavTap(e){e==="back"?(this.searchText="",this.activated=!0,this.onBack()):e==="game"&&this.onGame?(this.activated=!0,this.onGame()):e==="menu"&&(this.searchText="",this.activated=!0,this.onBack())}handleTap(e,t){const i=this.lastTop,s=i+ut,r=i+pt;if(this.activeTabIdx===0&&t>=s&&t<r){const o=this.getMapNeighbors(),a=t-s;a>=0&&a<o.length&&(this.mapBrowsingSystemId=o[a].id,this.mapCursorIdx=0,this.searchText="")}else if(this.activeTabIdx===1){const o=i+3,a=i+9;if(t>=o&&t<=a){const l=t-o;l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}}}getMapNeighbors(){const t=An(this.mapBrowsingSystemId).map(i=>{const s=i.from===this.mapBrowsingSystemId?i.to:i.from,r=this.publicSystems.find(a=>a.id===s),o=i.distance;return r?{sys:r,dist:o}:null}).filter(i=>i!==null).sort((i,s)=>i.dist-s.dist).map(i=>i.sys);return this.searchText.length===0?t:t.filter(i=>i.name.toUpperCase().includes(this.searchText))}handleMapAction(e){const t=this.getMapNeighbors(),i=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(e==="UP")this.mapCursorIdx=Math.max(0,i-1);else if(e==="DOWN")this.mapCursorIdx=Math.min(t.length-1,i+1);else if(e==="SELECT"){const s=t[i];if(!s)return;this.mapBrowsingSystemId=s.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(e){e==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):e==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const e=this.otherSystems[this.routeDestIdx];return e?dt(this.player.systemId,e.id):null}renderContent(e,t,i){this.lastTop=t;const s=e.length>0?e[0].length:0;this.activeTabIdx===0?this.renderMapTab(e,t,i,s):this.renderRouteTab(e,t,i,s)}renderMapTab(e,t,i,s){const r=this.publicSystems.find(p=>p.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!r)return;const o=t+lr,a=t+ut,l=t+pt,c=t+cr;this.renderChart(e,r,t),ge(e,o,s);const h=this.getMapNeighbors(),d=Math.min(this.mapCursorIdx,Math.max(0,h.length-1));this.renderNeighborList(e,s,r,h,d,a,l),ge(e,l,s),this.renderInfo(e,s,r,h[d]??null,c),this.searchText.length>0&&g(e,c+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(e,t,i){var h;const s=this.getMapNeighbors(),r=i+rr,o=i+or,a=i+ar,l=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(g(e,o,Ke,Ie(t.name,je),l,"black"),t.id===this.player.systemId){const d=Ke+je,p=((h=e[0])==null?void 0:h.length)??40;d<p&&(e[o][d]={char:"*",fg:"bright-yellow",bg:"black"})}const c=["left","right","top","bottom"];for(let d=0;d<Math.min(s.length,4);d++){const p=s[d],u=c[d],m=p.id===this.player.systemId?"bright-yellow":"white";if(u==="left")g(e,o,hr,Ie(p.name,dr),m,"black"),e[o][ur]={char:"-",fg:"bright-black",bg:"black"};else if(u==="right")g(e,o,mr,Ie(p.name,fr),m,"black"),e[o][pr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="top"){g(e,r,Ke,Ie(p.name,je),m,"black");for(let f=r+1;f<o;f++)e[f][mt]={char:"|",fg:"bright-black",bg:"black"}}else{g(e,a,Ke,Ie(p.name,je),m,"black");for(let f=o+1;f<a;f++)e[f][mt]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(e,t,i,s,r,o,a){for(let l=0;l<s.length&&l<a-o;l++){const c=s[l],h=o+l,d=l===r,u=c.id===this.player.systemId?"bright-yellow":d?"bright-cyan":"white",m=d?"> ":"  ",f=Ve(i.id,c.id),y=f?`${f.distance}LY  ${f.stability}`:"",T=t-4-y.length;g(e,h,2,m+c.name.toUpperCase().slice(0,T-2),u,"black"),y&&g(e,h,t-2-y.length,y,"bright-black","black")}}renderInfo(e,t,i,s,r){const a=i.id===this.player.systemId?"* Current location":i.name.toUpperCase();if(g(e,r,2,`Zone: ${i.zone}  Sec: ${i.security}  ${a}`.slice(0,t-4),"bright-black","black"),!s)return;const l=Ve(i.id,s.id);if(!l)return;const c=dt(this.player.systemId,s.id),h=c?c.length===1?"(your location)":`${c.length-1} hop${c.length-1!==1?"s":""} from you`:"(unreachable)";g(e,r+1,2,`${s.name.toUpperCase()}  ${l.distance}LY  ${h}`.slice(0,t-4),"bright-black","black")}renderRouteTab(e,t,i,s){var T,I;const r=t,o=t+2,a=t+3,l=7,c=a+l,h=c+1,d=h+6,p=this.publicSystems.find(b=>b.id===this.player.systemId);g(e,r,2,"FROM:","bright-black","black"),g(e,r,8,(p==null?void 0:p.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),g(e,o,2,"TO:","bright-black","black");const u=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-l));for(let b=0;b<l;b++){const M=u+b;if(M>=this.otherSystems.length)break;const v=this.otherSystems[M],x=M===this.routeDestIdx,_=x?"bright-cyan":"white",w=x?"> ":"  ";g(e,a+b,2,w+v.name.toUpperCase(),_,"black")}ge(e,c,s),ge(e,d,s);const m=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!m){g(e,h,2,"No route found","bright-red","black");return}const y=m.length-1;g(e,h,2,`Route: ${y} hop${y!==1?"s":""}`,"bright-white","black");for(let b=0;b<y;b++){const M=Ve(m[b],m[b+1]);if(!M)continue;const v=h+1+b;if(v>=d)break;const x=(((T=this.publicSystems.find(w=>w.id===m[b]))==null?void 0:T.name)??m[b]).toUpperCase().slice(0,9),_=(((I=this.publicSystems.find(w=>w.id===m[b+1]))==null?void 0:I.name)??m[b+1]).toUpperCase().slice(0,9);g(e,v,4,`${x} -> ${_}  ${M.distance}LY  ${M.stability}`.slice(0,s-6),"white","black")}}}class ae extends Q{constructor(e,t,i,s){const r={onAction:()=>{}};super(r,t,e,{navOptions:[]}),this.elapsed=0,this.arrived=!1,this.duration=i,this.onComplete=s}update(e){this.arrived||(this.elapsed+=e,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const yr=["[. . .]","[: : :]","[* * *]"],gt=5e3;class _r extends ae{constructor(e,t,i){super(e,t,gt,i)}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(e,t,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/500)%3,a=Math.ceil((gt-this.elapsed)/1e3),l=Math.max(1,Math.min(5,a)),c=ne(this.player.systemId),h=c?c.name.toUpperCase():this.player.systemId.toUpperCase();L(e,r-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),L(e,r-1,"DESTINATION:","bright-black","black"),L(e,r,h,"bright-white","black"),L(e,r+2,yr[o],"bright-black","black"),L(e,r+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const yt=2e3,br=["[ —   ]","[  —  ]","[   — ]"];class yn extends ae{constructor(e,t,i,s){super(e,t,yt,i),this.targetLabel=s}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(e,t,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((yt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a)),c=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const h=this.player.destinationId?N(this.player.destinationId):null;return h?h.name.toUpperCase():"UNKNOWN"})();L(e,r-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),L(e,r-1,"HEADING TO:","bright-black","black"),L(e,r,c,"bright-white","black"),L(e,r+2,br[o],"bright-black","black"),L(e,r+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const _t=2500,vr=["v","vv","vvv"];class wr extends ae{constructor(e,t,i){super(e,t,_t,i)}renderContent(e,t,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/400)%3,a=Math.ceil((_t-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));L(e,r-3,"[ LANDING SEQUENCE ]","bright-green","black"),L(e,r+2,vr[o],"bright-black","black"),L(e,r+4,`TOUCHDOWN IN ${l}S`,"bright-black","black")}}const bt=2500,kr=[">",">>",">>>"];class xr extends ae{constructor(e,t,i){super(e,t,bt,i)}renderContent(e,t,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/400)%3,a=Math.ceil((bt-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));L(e,r-3,"[ APPROACH LOCKED ]","bright-yellow","black"),L(e,r+2,kr[o],"bright-black","black"),L(e,r+4,`CLAMPING IN ${l}S`,"bright-black","black")}}const vt=1500,Cr=["^","^^","^^^"];class Tr extends ae{constructor(e,t,i){super(e,t,vt,i)}renderContent(e,t,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((vt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));L(e,r-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),L(e,r+2,Cr[o],"bright-black","black"),L(e,r+4,`CLEAR IN ${l}S`,"bright-black","black")}}const wt=1500,Mr=["<","<<","<<<"];class Sr extends ae{constructor(e,t,i){super(e,t,wt,i)}renderContent(e,t,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((wt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));L(e,r-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),L(e,r+2,Mr[o],"bright-black","black"),L(e,r+4,`DEPARTING IN ${l}S`,"bright-black","black")}}const kt=1500,Ir=["→","→→","→→→"];class Ar extends ae{constructor(e,t,i){super(e,t,kt,i)}renderContent(e,t,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((kt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));L(e,r-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),L(e,r+2,Ir[o],"bright-black","black"),L(e,r+4,`DOCKING IN ${l}S`,"bright-black","black")}}const xt=1500,Rr=["←","←←","←←←"];class Er extends ae{constructor(e,t,i){super(e,t,xt,i)}renderContent(e,t,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((xt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));L(e,r-3,"[ DEPARTING BERTH ]","bright-cyan","black"),L(e,r+2,Rr[o],"bright-black","black"),L(e,r+4,`CLEAR IN ${l}S`,"bright-black","black")}}const Lr=3e3;class Fr extends Q{constructor(e,t,i,s,r,o,a){super(e,i,t,{navOptions:[]}),this.outcomeLabel=s,this.score=r,this.damageFraction=o,this.onComplete=a,this.elapsed=0,this.arrived=!1,this.duration=Lr,this.lastContentTop=4,this.lastContentBottom=26,this.buttonRow=0,this.buttonCol=0,e.onTap&&e.onTap((l,c)=>this.handleTapCustom(l,c)),e.onAction(l=>{!this.arrived&&l==="SELECT"&&(this.arrived=!0,this.onComplete())})}handleTapCustom(e,t){Math.abs(t-this.buttonRow)<=0&&e>=this.buttonCol&&e<this.buttonCol+"[continue]".length&&(this.arrived=!0,this.onComplete())}update(e){super.update(e),!this.arrived&&(this.elapsed+=e)}renderContent(e,t,i){var p;this.lastContentTop=t,this.lastContentBottom=i;const s=Math.floor((t+i)/2),r=((p=e[0])==null?void 0:p.length)??40,o=this.getOutcomeColor();L(e,s-2,this.outcomeLabel,o,"black"),this.score!==null&&L(e,s,`SCORE: ${this.score} / 100`,"white","black");const a=Math.round(this.damageFraction*100),l=a===0?"bright-green":"yellow";L(e,s+2,`HULL DAMAGE: ${a}%`,l,"black");const c="[continue]",h=s+5,d=Math.floor((r-c.length)/2);this.buttonRow=h,this.buttonCol=d,L(e,h,c,"bright-green","black")}getOutcomeColor(){return this.score===null||this.score<40?"red":this.score<70?"yellow":"bright-green"}}class Dn extends Q{constructor(e,t,i,s){super(e,t,i,{navOptions:s.navOptions,title:s.title}),this._completed=!1,this._onComplete=s.onComplete,this._canvasWidth=s.canvasWidth,this._canvasHeight=s.canvasHeight}renderContent(e,t,i){var u;const s=((u=e[0])==null?void 0:u.length)??0,r=e.length,o=i-t,a=this._canvasWidth??s,l=this._canvasHeight??o;let c=Math.floor((s-a)/2),h=t+Math.floor((o-l)/2);const d=Math.max(0,s-a),p=Math.max(0,r-l);c=Math.max(0,Math.min(c,d)),h=Math.max(0,Math.min(h,p)),this.renderGame(e,{top:h,left:c,width:a,height:l})}complete(e){var t;this._completed||(this._completed=!0,(t=this._onComplete)==null||t.call(this,e))}}function Dr(n){if(n.length===0)return 2166136261;let e=2166136261;for(let t=0;t<n.length;t++)e^=n.charCodeAt(t),e=Math.imul(e,16777619)>>>0;return e===0?1:e}function Nr(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}const te=1;class Or extends Dn{constructor(e,t,i,s){const r=i.destinationId??"";super(e,t,i,{navOptions:[],title:"DOCKING",canvasWidth:32,canvasHeight:18,onComplete:s}),this.heldKeys=new Set,this.lastActionTime=0,this.actionTimeoutMs=200,this.canvasWidth=32,this.canvasHeight=18,this.countdownSeconds=15,this.thrustForce=8,this.maxVelocity=6,this.driftIntervalMs=3e3,this.driftMaxDistanceChars=4,this.driftSpeedCharsPerSec=.8,this.perfectRadiusChars=5,this.airlockWidth=5,this.airlockHeight=3,this.lastViewport={top:0,left:0,width:32,height:18},this._joystick=null,this._primaryInput=t.primaryInput,this.rand=Nr(Dr(r));const o=(this.canvasWidth-1)/2,a=(this.canvasHeight-1)/2;this.state={shipX:o,shipY:a,shipVelX:0,shipVelY:0,airlockX:o,airlockY:a,driftTargetX:o,driftTargetY:a,driftTimer:this.driftIntervalMs*(.8+.4*this.rand()),timeRemaining:this.countdownSeconds,completed:!1},e.onTouchTrack&&e.onTouchTrack({start:(l,c,h)=>{c<X||(this._joystick={centerCol:l,centerRow:c,currentCol:l,currentRow:c,id:h})},move:(l,c,h)=>{!this._joystick||this._joystick.id!==h||(this._joystick.currentCol=l,this._joystick.currentRow=c)},end:l=>{var c;((c=this._joystick)==null?void 0:c.id)===l&&(this._joystick=null,this.heldKeys.clear())}})}renderContent(e,t,i){var u;const s=((u=e[0])==null?void 0:u.length)??0,r=e.length,o=i-t,a=this.canvasWidth,l=this._primaryInput==="touch"?this.canvasHeight:this.canvasHeight+3;let c=Math.floor((s-a)/2),h=t+Math.floor((o-l)/2);const d=Math.max(0,s-this.canvasWidth),p=Math.max(0,r-this.canvasHeight);c=Math.max(0,Math.min(c,d)),h=Math.max(0,Math.min(h,p)),this.renderGame(e,{top:h,left:c,width:this.canvasWidth,height:this.canvasHeight})}handleAction(e){if(super.handleAction(e),e==="MENU"){this.state.completed||(this.state.completed=!0,this.complete({outcome:"skipped"}));return}(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&(this.heldKeys.add(e),this.lastActionTime=performance.now())}handleTap(e,t){if(this.state.completed){super.handleTap(e,t);return}if(this._primaryInput==="touch"){super.handleTap(e,t);return}const{top:i,left:s,width:r,height:o}=this.lastViewport,a=s+Math.floor(r/2),l=i+o,c=l+1,h=l+3,d=a-5,p=a+3,u=a;t===c&&e>=u-1&&e<=u+1?this.handleAction("UP"):t===h&&e>=u-1&&e<=u+1?this.handleAction("DOWN"):e>=d&&e<=d+2&&t===c+1?this.handleAction("LEFT"):e>=p&&e<=p+2&&t===c+1?this.handleAction("RIGHT"):super.handleTap(e,t)}update(e){super.update(e);const t=e/1e3;if(!this.state.completed){if(this._joystick){const i=this._joystick.currentCol-this._joystick.centerCol,s=this._joystick.currentRow-this._joystick.centerRow;this.heldKeys.clear(),s<-te&&this.heldKeys.add("UP"),s>te&&this.heldKeys.add("DOWN"),i<-te&&this.heldKeys.add("LEFT"),i>te&&this.heldKeys.add("RIGHT")}else this.clearExpiredActions();if(this.updateMovement(t),this.updateAirlockDrift(t),this.updateCountdown(t),this.state.timeRemaining<=0){const i=Math.hypot(this.state.shipX-this.state.airlockX,this.state.shipY-this.state.airlockY),s=1.5,r=i<=s?100:Math.round(Math.max(0,Math.min(1,1/(1+(i-s)/this.perfectRadiusChars)))*100);this.state.completed=!0,this.complete({outcome:"completed",result:{score:r}})}}}updateMovement(e){const t=this.state;this.heldKeys.has("UP")&&(t.shipVelY-=this.thrustForce*e),this.heldKeys.has("DOWN")&&(t.shipVelY+=this.thrustForce*e),this.heldKeys.has("LEFT")&&(t.shipVelX-=this.thrustForce*e),this.heldKeys.has("RIGHT")&&(t.shipVelX+=this.thrustForce*e),t.shipVelX=Math.max(-this.maxVelocity,Math.min(this.maxVelocity,t.shipVelX)),t.shipVelY=Math.max(-this.maxVelocity,Math.min(this.maxVelocity,t.shipVelY)),t.shipX+=t.shipVelX*e,t.shipY+=t.shipVelY*e;const i=.5;t.shipX=Math.max(i,Math.min(this.canvasWidth-1-i,t.shipX)),t.shipY=Math.max(i,Math.min(this.canvasHeight-1-i,t.shipY))}updateAirlockDrift(e){const t=this.state,i=t.driftTargetX-t.airlockX,s=t.driftTargetY-t.airlockY,r=Math.hypot(i,s);if(r<.1){const o=this.rand()*2*Math.PI,a=this.rand()*this.driftMaxDistanceChars,l=(this.canvasWidth-1)/2,c=(this.canvasHeight-1)/2;t.driftTargetX=l+Math.cos(o)*a,t.driftTargetY=c+Math.sin(o)*a,t.driftTimer=this.driftIntervalMs*(.8+.4*this.rand())}else{const o=this.driftSpeedCharsPerSec*e,a=Math.min(1,o/r);t.airlockX+=i*a,t.airlockY+=s*a}}updateCountdown(e){this.state.timeRemaining=Math.max(0,this.state.timeRemaining-e)}clearExpiredActions(){performance.now()-this.lastActionTime>this.actionTimeoutMs&&this.heldKeys.clear()}renderGame(e,t){const{top:i,left:s,width:r,height:o}=t;this.lastViewport={top:i,left:s,width:r,height:o},this.drawBorder(e,i,s,r,o),this.drawAirlock(e,i,s),this.drawShip(e,i,s),this.drawCountdown(e,i,s,r),this.drawDistance(e,i,s,o),this._primaryInput==="touch"?this._renderJoystick(e,t):this.drawControlButtons(e,i,s,r,o)}_renderJoystick(e,t){const{top:i,left:s,width:r,height:o}=t,a=(f,y,T,I)=>{var b;f<0||f>=e.length||y<0||y>=(((b=e[f])==null?void 0:b.length)??0)||(e[f][y]={char:T,fg:I,bg:"black"})};if(!this._joystick){const f="DRAG TO DOCK",y=i+o-2,T=s+Math.floor((r-f.length)/2);g(e,y,T,f,"bright-black","black");return}const{centerCol:l,centerRow:c,currentCol:h,currentRow:d}=this._joystick,p=h-l,u=d-c,m=this.heldKeys.size>0;a(c,l,"o",m?"bright-white":"white"),u<-te&&a(c-2,l,"^","bright-green"),u>te&&a(c+2,l,"v","bright-green"),p<-te&&a(c,l-2,"<","bright-green"),p>te&&a(c,l+2,">","bright-green")}drawBorder(e,t,i,s,r){const o=i+s-1,a=t+r-1;for(let l=i;l<=o;l++)t<e.length&&l<e[t].length&&(e[t][l]={char:"+",fg:"white",bg:"black"}),a<e.length&&l<e[a].length&&(e[a][l]={char:"+",fg:"white",bg:"black"});for(let l=t+1;l<a;l++)l<e.length&&(i<e[l].length&&(e[l][i]={char:"|",fg:"white",bg:"black"}),o<e[l].length&&(e[l][o]={char:"|",fg:"white",bg:"black"}))}drawAirlock(e,t,i){const s=i+1+Math.round(this.state.airlockX),r=t+1+Math.round(this.state.airlockY),o=s-Math.floor(this.airlockWidth/2),a=r-Math.floor(this.airlockHeight/2),l=[["+","-","+","-","+"],["|"," ","+"," ","|"],["+","-","+","-","+"]];for(let c=0;c<this.airlockHeight;c++)for(let h=0;h<this.airlockWidth;h++){const d=a+c,p=o+h;if(d>=t&&d<t+this.canvasHeight&&p>=i&&p<i+this.canvasWidth&&d<e.length&&p<e[d].length){const u=l[c][h];e[d][p]={char:u,fg:"bright-yellow",bg:"black"}}}}drawShip(e,t,i){const s=i+1+Math.round(this.state.shipX),r=t+1+Math.round(this.state.shipY);s>=i&&s<i+this.canvasWidth&&r>=t&&r<t+this.canvasHeight&&(r<e.length&&s<e[r].length&&(e[r][s]={char:"(",fg:"bright-green",bg:"black"}),s+1<i+this.canvasWidth&&r<e.length&&s+1<e[r].length&&(e[r][s+1]={char:"+",fg:"bright-green",bg:"black"}),s+2<i+this.canvasWidth&&r<e.length&&s+2<e[r].length&&(e[r][s+2]={char:")",fg:"bright-green",bg:"black"}))}drawCountdown(e,t,i,s){const r=`T: ${Math.ceil(this.state.timeRemaining)}`,o=i+s-1-r.length,a=t+1;g(e,a,o,r,"white","black")}drawDistance(e,t,i,s){const o=`DIST: ${Math.hypot(this.state.shipX-this.state.airlockX,this.state.shipY-this.state.airlockY).toFixed(1)}`,a=t+s-1;g(e,a,i+2,o,"white","black")}drawControlButtons(e,t,i,s,r){const o=e.length,a=o>0?e[0].length:0,l=t+r,c=i+Math.floor(s/2),h=this.heldKeys.has("UP"),d=this.heldKeys.has("DOWN"),p=this.heldKeys.has("LEFT"),u=this.heldKeys.has("RIGHT"),m="bright-green",f="bright-black",y=x=>`[${x}]`,T=l+1,I=l+2,b=l+3,M=c-5,v=c+3;if(T<o&&c-1>=0&&c+1<a){const x=y("^"),_=c-1;for(let w=0;w<x.length;w++)_+w>=0&&_+w<a&&(e[T][_+w]={char:x[w],fg:h?m:f,bg:"black"})}if(I<o){const x=y("<");for(let w=0;w<x.length;w++)M+w>=0&&M+w<a&&(e[I][M+w]={char:x[w],fg:p?m:f,bg:"black"});const _=y(">");for(let w=0;w<_.length;w++)v+w>=0&&v+w<a&&(e[I][v+w]={char:_[w],fg:u?m:f,bg:"black"})}if(b<o&&c-1>=0&&c+1<a){const x=y("v"),_=c-1;for(let w=0;w<x.length;w++)_+w>=0&&_+w<a&&(e[b][_+w]={char:x[w],fg:d?m:f,bg:"black"})}}}function Qt(n,e,t,i,s,r){let{x:o,y:a,vx:l,vy:c}=n;l*=t.airResistance**r,c+=t.gravity*r,e.up&&(c-=t.thrustForce*r),e.down&&(c+=t.thrustForce*r),e.left&&(l-=t.thrustForce*r),e.right&&(l+=t.thrustForce*r);const h=t.maxVerticalSpeed??t.thrustForce*3;return l=Math.max(-h,Math.min(h,l)),c=Math.max(-h,Math.min(h,c)),o+=l*r,a+=c*r,o=Math.max(0,Math.min(i-s,o)),{x:o,y:a,vx:l,vy:c}}function Pr(n){if(n.length===0)return 2166136261;let e=2166136261;for(let t=0;t<n.length;t++)e^=n.charCodeAt(t),e=Math.imul(e,16777619)>>>0;return e===0?1:e}function Hr(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function Jt(n,e,t,i,s){const r=Hr(Pr(n)),o=3,a=Math.min(5,Math.floor(t/2)),l=o+Math.floor(r()*(a-o+1)),c=t-l,h=[];for(let u=0;u<e;u++){const m=Math.floor(r()*3)-1;h.push(Math.max(c-1,Math.min(c+1,c+m)))}const d=Math.max(0,e-i),p=Math.floor(r()*(d+1));for(let u=p;u<p+i&&u<e;u++)h[u]=c;return h.map((u,m)=>({surfaceRow:u,isPad:m>=p&&m<p+i}))}function Zt(n,e,t){const i=Math.floor(n),s=i+2;for(let r=i;r<=s;r++)if(!(r<0||r>=t.length)&&e>=t[r].surfaceRow)return!0;return!1}function ei(n,e,t,i,s,r){for(let o=0;o<e.length;o++){const a=e[o],l=i+o;if(l<0)continue;let c;if(a.isPad){const u=o>0&&e[o-1].isPad,m=o<e.length-1&&e[o+1].isPad;u?m?c="=":c="]":c="["}else r==="asteroid"?c="/":c="^";const h=r==="asteroid"?"*":"#",d=a.isPad?"bright-yellow":"white",p=t+a.surfaceRow;for(let u=p;u<t+s;u++){if(u<0||u>=n.length||l>=n[u].length)continue;const m=u===p;n[u][l]={char:m?c:h,fg:d,bg:"black"}}}}const _n=3,Ct=2,Br=1/60,ie=1;class Ur extends Dn{constructor(e,t,i,s){super(e,t,i,{navOptions:[],title:"LANDING",onComplete:s}),this._ship={x:0,y:0,vx:0,vy:1},this._heldKeys=new Set,this._lastActionTime=0,this._actionTimeoutMs=200,this._terrain=null,this._viewport=null,this._landed=!1,this._joystick=null,this._destId=i.destinationId??"",this._primaryInput=t.primaryInput;const{surface:r}=P().miniGames;this._gravityAccel=r.gravityAccel,this._airResistance=r.airResistance,this._thrustForce=r.thrustForce,this._maxSafeSpeed=r.maxSafeSpeed,this._crashSpeed=r.crashSpeed,this._offPadScoreMultiplier=r.offPadScoreMultiplier,this._padWidth=r.padWidth,this._maxSpeed=r.maxSpeed,e.onTouchTrack&&e.onTouchTrack({start:(o,a,l)=>{a<X||(this._joystick={centerCol:o,centerRow:a,currentCol:o,currentRow:a,id:l})},move:(o,a,l)=>{!this._joystick||this._joystick.id!==l||(this._joystick.currentCol=o,this._joystick.currentRow=a)},end:o=>{var a;((a=this._joystick)==null?void 0:a.id)===o&&(this._joystick=null,this._heldKeys.clear())}})}handleAction(e){if(super.handleAction(e),e==="MENU"){this._landed||(this._landed=!0,this.complete({outcome:"skipped"}));return}this._primaryInput!=="touch"&&(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&(this._heldKeys.add(e),this._lastActionTime=performance.now())}update(e){if(super.update(e),this._landed||!this._terrain||!this._viewport)return;if(this._joystick){const r=this._joystick.currentCol-this._joystick.centerCol,o=this._joystick.currentRow-this._joystick.centerRow;this._heldKeys.clear(),o<-ie&&this._heldKeys.add("UP"),o>ie&&this._heldKeys.add("DOWN"),r<-ie&&this._heldKeys.add("LEFT"),r>ie&&this._heldKeys.add("RIGHT")}else this._clearExpiredKeys();const t={gravity:this._gravityAccel,airResistance:this._airResistance,thrustForce:this._thrustForce,maxVerticalSpeed:this._maxSpeed},i={up:this._heldKeys.has("UP"),down:this._heldKeys.has("DOWN"),left:this._heldKeys.has("LEFT"),right:this._heldKeys.has("RIGHT")};let s=e/1e3;for(;s>0&&!this._landed;){const r=Math.min(s,Br);s-=r,this._ship=Qt(this._ship,i,t,this._viewport.width,_n,r);const o=this._ship.y+(Ct-1);if(Zt(this._ship.x,o,this._terrain)){const a=Math.hypot(this._ship.vx,this._ship.vy);this._snapToSurface(),this._land(a);break}}}_snapToSurface(){if(!this._terrain)return;const e=Math.floor(this._ship.x),t=e+_n-1;let i=1/0;for(let s=e;s<=t;s++)s>=0&&s<this._terrain.length&&(i=Math.min(i,this._terrain[s].surfaceRow));i<1/0&&(this._ship={...this._ship,y:i-Ct,vx:0,vy:0})}_land(e){if(this._landed)return;this._landed=!0;const t=e??Math.hypot(this._ship.vx,this._ship.vy),i=Math.max(0,Math.min(1,1-(t-this._maxSafeSpeed)/(this._crashSpeed-this._maxSafeSpeed))),s=Math.floor(this._ship.x)+1,r=this._terrain,o=s>=0&&s<r.length&&r[s].isPad,a=o?1:this._offPadScoreMultiplier,l=Math.round(i*a*100);this.complete({outcome:"completed",result:{score:l,speed:t,onPad:o}})}_clearExpiredKeys(){performance.now()-this._lastActionTime>this._actionTimeoutMs&&this._heldKeys.clear()}renderGame(e,t){this._terrain||(this._terrain=Jt(this._destId,t.width,t.height,this._padWidth),this._ship={x:(t.width-_n)/2,y:1,vx:0,vy:1}),this._viewport=t,ei(e,this._terrain,t.top,t.left,t.height,"planet"),this._renderShip(e,t),this._renderHUD(e,t),this._renderJoystick(e,t)}_renderShip(e,t){var o;const i=t.left+Math.round(this._ship.x),s=t.top+Math.round(this._ship.y),r=[["-","v","-"],["(","+",")"]];for(let a=0;a<r.length;a++)for(let l=0;l<r[a].length;l++){const c=s+a,h=i+l;c<0||c>=e.length||h<0||h>=(((o=e[c])==null?void 0:o.length)??0)||(e[c][h]={char:r[a][l],fg:"bright-green",bg:"black"})}}_renderHUD(e,t){const i=Math.hypot(this._ship.vx,this._ship.vy),s=`SPD:${i.toFixed(1)}`,r=t.left+t.width-s.length;if(g(e,t.top+1,r,s,"white","black"),i>this._maxSafeSpeed){const o="!! FAST",a=t.left+t.width-o.length;g(e,t.top+2,a,o,"bright-yellow","black")}}_renderJoystick(e,t){if(this._primaryInput!=="touch")return;if(!this._joystick){const d="HOLD & DRAG TO THRUST",p=this._terrain?Math.min(...this._terrain.map(f=>f.surfaceRow)):t.height-2,u=t.top+Math.max(0,p-2),m=t.left+Math.floor((t.width-d.length)/2);g(e,u,m,d,"bright-black","black");return}const{centerCol:i,centerRow:s,currentCol:r,currentRow:o}=this._joystick,a=r-i,l=o-s,c=this._heldKeys.size>0,h=(d,p,u,m)=>{var f;d<0||d>=e.length||p<0||p>=(((f=e[d])==null?void 0:f.length)??0)||(e[d][p]={char:u,fg:m,bg:"black"})};h(s,i,"o",c?"bright-white":"white"),l<-ie&&h(s-2,i,"^","bright-green"),l>ie&&h(s+2,i,"v","bright-green"),a<-ie&&h(s,i-2,"<","bright-green"),a>ie&&h(s,i+2,">","bright-green")}}const bn=3,Tt=2,Gr=1/60,se=1;class $r extends Dn{constructor(e,t,i,s){super(e,t,i,{navOptions:[],title:"LANDING",onComplete:s}),this._ship={x:0,y:0,vx:0,vy:1},this._heldKeys=new Set,this._lastActionTime=0,this._actionTimeoutMs=200,this._terrain=null,this._viewport=null,this._landed=!1,this._joystick=null,this._destId=i.destinationId??"",this._primaryInput=t.primaryInput;const{asteroid:r}=P().miniGames;this._thrustForce=r.thrustForce,this._maxSafeSpeed=r.maxSafeSpeed,this._crashSpeed=r.crashSpeed,this._offPadScoreMultiplier=r.offPadScoreMultiplier,this._padWidth=r.padWidth,this._initialDownwardVelocity=r.initialDownwardVelocity,this._maxSpeed=r.maxSpeed,e.onTouchTrack&&e.onTouchTrack({start:(o,a,l)=>{a<X||(this._joystick={centerCol:o,centerRow:a,currentCol:o,currentRow:a,id:l})},move:(o,a,l)=>{!this._joystick||this._joystick.id!==l||(this._joystick.currentCol=o,this._joystick.currentRow=a)},end:o=>{var a;((a=this._joystick)==null?void 0:a.id)===o&&(this._joystick=null,this._heldKeys.clear())}})}handleAction(e){if(super.handleAction(e),e==="MENU"){this._landed||(this._landed=!0,this.complete({outcome:"skipped"}));return}this._primaryInput!=="touch"&&(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&(this._heldKeys.add(e),this._lastActionTime=performance.now())}update(e){if(super.update(e),this._landed||!this._terrain||!this._viewport)return;if(this._joystick){const r=this._joystick.currentCol-this._joystick.centerCol,o=this._joystick.currentRow-this._joystick.centerRow;this._heldKeys.clear(),o<-se&&this._heldKeys.add("UP"),o>se&&this._heldKeys.add("DOWN"),r<-se&&this._heldKeys.add("LEFT"),r>se&&this._heldKeys.add("RIGHT")}else this._clearExpiredKeys();const t={gravity:0,airResistance:1,thrustForce:this._thrustForce,maxVerticalSpeed:this._maxSpeed},i={up:this._heldKeys.has("UP"),down:this._heldKeys.has("DOWN"),left:this._heldKeys.has("LEFT"),right:this._heldKeys.has("RIGHT")};let s=e/1e3;for(;s>0&&!this._landed;){const r=Math.min(s,Gr);s-=r,this._ship=Qt(this._ship,i,t,this._viewport.width,bn,r);const o=this._ship.y+(Tt-1);if(Zt(this._ship.x,o,this._terrain)){const a=Math.hypot(this._ship.vx,this._ship.vy);this._snapToSurface(),this._land(a);break}}}_snapToSurface(){if(!this._terrain)return;const e=Math.floor(this._ship.x),t=e+bn-1;let i=1/0;for(let s=e;s<=t;s++)s>=0&&s<this._terrain.length&&(i=Math.min(i,this._terrain[s].surfaceRow));i<1/0&&(this._ship={...this._ship,y:i-Tt,vx:0,vy:0})}_land(e){if(this._landed)return;this._landed=!0;const t=e??Math.hypot(this._ship.vx,this._ship.vy),i=Math.max(0,Math.min(1,1-(t-this._maxSafeSpeed)/(this._crashSpeed-this._maxSafeSpeed))),s=Math.floor(this._ship.x)+1,r=this._terrain,o=s>=0&&s<r.length&&r[s].isPad,a=o?1:this._offPadScoreMultiplier,l=Math.round(i*a*100);this.complete({outcome:"completed",result:{score:l,speed:t,onPad:o}})}_clearExpiredKeys(){performance.now()-this._lastActionTime>this._actionTimeoutMs&&this._heldKeys.clear()}renderGame(e,t){this._terrain||(this._terrain=Jt(this._destId,t.width,t.height,this._padWidth),this._ship={x:(t.width-bn)/2,y:1,vx:0,vy:this._initialDownwardVelocity}),this._viewport=t,ei(e,this._terrain,t.top,t.left,t.height,"asteroid"),this._renderShip(e,t),this._renderHUD(e,t),this._renderJoystick(e,t)}_renderShip(e,t){var o;const i=t.left+Math.round(this._ship.x),s=t.top+Math.round(this._ship.y),r=[["-","v","-"],["(","+",")"]];for(let a=0;a<r.length;a++)for(let l=0;l<r[a].length;l++){const c=s+a,h=i+l;c<0||c>=e.length||h<0||h>=(((o=e[c])==null?void 0:o.length)??0)||(e[c][h]={char:r[a][l],fg:"bright-green",bg:"black"})}}_renderHUD(e,t){const i=Math.hypot(this._ship.vx,this._ship.vy),s=`SPD:${i.toFixed(1)}`,r=t.left+t.width-s.length;if(g(e,t.top+1,r,s,"white","black"),i>this._maxSafeSpeed){const o="!! FAST",a=t.left+t.width-o.length;g(e,t.top+2,a,o,"bright-yellow","black")}}_renderJoystick(e,t){if(this._primaryInput!=="touch")return;if(!this._joystick){const d="HOLD & DRAG TO THRUST",p=this._terrain?Math.min(...this._terrain.map(f=>f.surfaceRow)):t.height-2,u=t.top+Math.max(0,p-2),m=t.left+Math.floor((t.width-d.length)/2);g(e,u,m,d,"bright-black","black");return}const{centerCol:i,centerRow:s,currentCol:r,currentRow:o}=this._joystick,a=r-i,l=o-s,c=this._heldKeys.size>0,h=(d,p,u,m)=>{var f;d<0||d>=e.length||p<0||p>=(((f=e[d])==null?void 0:f.length)??0)||(e[d][p]={char:u,fg:m,bg:"black"})};h(s,i,"o",c?"bright-white":"white"),l<-se&&h(s-2,i,"^","bright-green"),l>se&&h(s+2,i,"v","bright-green"),a<-se&&h(s,i-2,"<","bright-green"),a>se&&h(s,i+2,">","bright-green")}}const vn=[{id:"docking",name:"Docking Mini-Game",description:"Align the ship crosshair with the airlock target before countdown expires",variants:[{id:"orbital",label:"Orbital Station",params:{locationType:"orbital"}},{id:"deep-space",label:"Deep Space",params:{locationType:"deep-space"}}]},{id:"surface-landing",name:"Planet Landing",description:"Counter gravity and air resistance to land gently on the marked pad",variants:[{id:"surface",label:"Planet Surface",params:{locationType:"surface"}}]},{id:"asteroid-landing",name:"Asteroid Landing",description:"Navigate freely with no gravity to land on the marked pad",variants:[{id:"asteroid",label:"Asteroid Surface",params:{locationType:"asteroid"}}]}],Wr=[{meta:vn[0],factory:(n,e,t,i,s)=>new Or(n,e,t,s)},{meta:vn[1],factory:(n,e,t,i,s)=>new Ur(n,e,t,s)},{meta:vn[2],factory:(n,e,t,i,s)=>new $r(n,e,t,s)}];function Kr(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function jr(n,e){return Math.floor(n()*e)}function Re(n,e){return e[jr(n,e.length)]}function ni(n,e){const{special:t,firstNames:i,lastNames:s}=e.npcNames;if(n()<P().npc.specialNameChance&&t.length>0)return{giverName:Re(n,t)};const r=i.length>0?Re(n,i):"Unknown",o=s.length>0?Re(n,s):"Agent";return{giverName:`${r} ${o}`}}function Yr(n,e){return e.destinations.filter(t=>t.id!==n.id)}function qr(n){return n.commodities.filter(e=>e.legal)}function Vr(n,e){const t=e.reduce((s,r)=>s+r.weightKg,0);if(t===0)return e[0];let i=n()*t;for(const s of e)if(i-=s.weightKg,i<0)return s;return e[e.length-1]}function Mt(n,e,t,i){var y;const s=t.deliveryItems;if(s.length===0)return null;const r=Yr(e,t);if(r.length===0)return null;const o=Vr(n,s),a=Re(n,r),l=ni(n,t),{deliveryBaseReward:c,deliveryRandomReward:h,deliveryDepositFraction:d}=P().missions,p=Math.floor(o.weightKg*1.5),u=c+p+Math.floor(n()*h),m=Math.floor(u*d),f=e.owningFactionId?(y=F().factions.find(T=>T.id===e.owningFactionId&&me(T)))==null?void 0:y.id:void 0;return{...l,giverFactionId:f,id:i,type:"delivery",title:o.name,description:`A package needs transporting. Pick up the ${o.name} from ${e.name} and deliver it to ${a.name}. Handle with care.`,reward:u,issuingDestinationId:e.id,itemName:o.name,itemWeightKg:o.weightKg,pickupDestinationId:e.id,deliveryDestinationId:a.id,deposit:m}}function St(n,e,t,i){var G;const s=qr(t);if(s.length===0)return null;const r=ne(e.system),o=[],a=[];for(const k of s)(r?Qe(k.id,r):1)>1&&a.push(k),o.push(k);const l=a.length>0?a:s;for(const k of l)o.push(k);const{supplyRequirementsMin:c,supplyRequirementsMax:h,supplyQtyMin:d,supplyQtyMax:p}=P().missions,u=c+Math.floor(n()*(h-c+1)),m=[],f=new Set;for(let k=0;k<u;k++){let R=0;for(;R<10;){const E=Re(n,o);if(!f.has(E.id)){f.add(E.id);const A=d+Math.floor(n()*(p-d+1));m.push({commodityId:E.id,qty:A});break}R++}}if(m.length===0)return null;const y=m.reduce((k,R)=>{const E=t.commodities.find(A=>A.id===R.commodityId);return k+((E==null?void 0:E.basePrice)??100)*R.qty},0),T=m.reduce((k,R)=>{const E=t.commodities.find(A=>A.id===R.commodityId);return k+((E==null?void 0:E.weightKg)??1)*R.qty},0),{supplyRewardMultiplierMin:I,supplyRewardMultiplierMax:b}=P().missions,M=Math.min(1,T/500),v=n(),x=v+M*(1-v)*.15,_=I+x*(b-I),w=Math.floor(y*_),D=ni(n,t),K=m.map(k=>{const R=t.commodities.find(E=>E.id===k.commodityId);return`${k.qty}× ${(R==null?void 0:R.name)??k.commodityId}`}).join(", "),O=e.owningFactionId?(G=F().factions.find(k=>k.id===e.owningFactionId&&me(k)))==null?void 0:G.id:void 0;return{...D,giverFactionId:O,id:i,type:"supply",title:e.name,description:`${e.name} needs supplies. Deliver ${K} to fulfil the contract.`,reward:w,issuingDestinationId:e.id,requirements:m,deliveryDestinationId:e.id}}function zr(n){let e=0;for(let t=0;t<n.length;t++)e=(e<<5)-e^n.charCodeAt(t);return e>>>0}function Xr(n,e,t){const i=P();let s;{const c=i.missions.missionTtlMs,h=Date.now(),d=Math.floor(h/c);s=zr(n.id)^d}const r=Kr(s),{boardMaxCount:o,deliveryChance:a}=i.missions,l=[];for(let c=0;c<n.minMissions&&l.length<o;c++){const h=`m-${(s>>>0).toString(16)}-${l.length}`,p=r()<a?Mt(r,n,e,h):St(r,n,e,h);p&&l.push(p)}for(;l.length<o&&r()<n.missionChance;){const c=`m-${(s>>>0).toString(16)}-${l.length}`,d=r()<a?Mt(r,n,e,c):St(r,n,e,c);d&&l.push(d)}return l}const Qr=100,Jr={orbital:"docking","deep-space":"docking",surface:"surface-landing",asteroid:"asteroid-landing"};function Zr(n,e,t){if(n.outcome==="skipped")return{damageFraction:t.abandonDamageFraction*e,score:null};const i=n.result.score;return i>=t.noDamageThreshold?{damageFraction:0,score:i}:{damageFraction:t.maxHullDamageFraction*(1-i/t.noDamageThreshold)*e,score:i}}function eo(n,e){const t=n==="docking";return e===null?"ABORTED":e<40?t?"COLLISION":"CRASH":e<70?t?"ROUGH DOCK":"HARD LANDING":e<90?t?"DOCKED":"LANDED":t?"PERFECT DOCK":"PERFECT LANDING"}function Ye(n,e,t){return Math.max(e,Math.min(t,n))}function no(n,e,t,i){const{stockCountMin:s,stockCountMax:r,stockQtyMin:o,stockQtyMax:a,stockRepCountBonusPerLevel:l,stockRepCountBonusMin:c,stockRepCountBonusMax:h,stockRepQtyBonusPerLevel:d,stockRepQtyBonusMin:p,stockRepQtyBonusMax:u}=t.trading,m=Ye(e*l,c,h),f=Ye(e*d,p,u),y=n.length,T=Ye(s+m,1,y),I=Ye(r+m,1,y),b=T+Math.floor(Math.random()*(I-T+1)),M=[];if(i)for(const k of n){const E=1/Qe(k.id,i),A=Math.ceil(E*10);for(let C=0;C<A;C++)M.push(k)}else M.push(...n);const v=[...M];for(let k=v.length-1;k>0;k--){const R=Math.floor(Math.random()*(k+1));[v[k],v[R]]=[v[R],v[k]]}const x=o+f,_=a+f,w=n.map(k=>Math.log(k.basePrice*k.weightKg)),D=Math.min(...w),O=Math.max(...w)-D,G=new Map;for(const k of v.slice(0,b)){if(G.has(k.id))continue;const R=x+Math.floor(Math.random()*(_-x+1));let E=1;O>0&&(E=1.5-(Math.log(k.basePrice*k.weightKg)-D)/O);const A=i?Qe(k.id,i):1;G.set(k.id,{commodityId:k.id,qty:Math.max(1,Math.floor(R*E)),effectiveFactor:A})}return Array.from(G.values())}class to{constructor(e,t,i){this.sceneBeforeMenu=null,this.traderStockCache=new Map,this.renderer=e,this.input=t,this.context=i;const s=Vt(),r=qe(s.startingShip);this.player=new Fn({shipId:s.startingShip,driveId:r.defaultJumpDrive,credits:s.player.startingCredits,systemId:s.startingLocation.system,destinationId:s.startingLocation.destination}),this.currentScene=new Yn(this.input,this.context,this.player,()=>this.goToStory())}tick(e){const t=Math.min(e,Qr),i=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(i),this.renderer.drawBuffer(i)}makeBuffer(){const e=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:e},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(e,t){const i=Date.now(),s=this.traderStockCache.get(e),r=P();if(s&&s.repLevel===t&&i-s.generatedAt<r.trading.stockTtlMs)return s.entries;const o=N(e),a=o?ne(o.system):void 0,l=no(ts(),t,r,a);return this.traderStockCache.set(e,{entries:l,generatedAt:i,repLevel:t}),l}refreshDestinationMissions(e){const t=N(e),i=F(),s=Xr(t,i);this.player.refreshDestinationMissions(e,s)}onBuy(e,t,i,s){if(t<=0)return;const r=s.findIndex(h=>h.commodityId===e);if(r<0)return;const o=s[r];if(t>o.qty)return;const a=de(e);if(!a)return;const l=t*i;this.player.credits<l||this.player.cargoWeightKg+t*a.weightKg>this.player.cargoCapacity||(this.player.spendCredits(l),this.player.addCargo(e,t),o.qty-=t,o.qty<=0&&s.splice(r,1))}onSell(e,t,i,s){if(t<=0)return;const r=this.player.cargoHold.find(c=>c.commodityId===e);if(!r||r.qty<t||!de(e))return;const a=t*i;this.player.addCredits(a),this.player.removeCargo(e,t);const l=s.find(c=>c.commodityId===e);l?l.qty+=t:s.push({commodityId:e,qty:t})}goToMainMenu(){this.currentScene=new Yn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new _s(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){const e=this.player.destinationId;this.refreshDestinationMissions(e),this.currentScene=new vs(this.input,this.context,this.player,e,(t,i)=>{this.player.spendCredits(t),this.player.addFuel(i),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToLandOrDock(){const e=N(this.player.destinationId),t=e==null?void 0:e.locationType,i=t?Jr[t]:void 0,s=i?Wr.find(r=>r.meta.id===i):void 0;if(i&&s){const r=(e==null?void 0:e.difficultyMultiplier)??1,o=P();this.currentScene=s.factory(this.input,this.context,this.player,{},a=>{const{damageFraction:l,score:c}=Zr(a,r,o.miniGames);l>0&&this.player.applyHullDamage(l);const h=eo(i,c);this.currentScene=new Fr(this.input,this.player,this.context,h,c,l,()=>this.goToStation())})}else t==="surface"?this.currentScene=new wr(this.player,this.context,()=>this.goToStation()):t==="asteroid"?this.currentScene=new xr(this.player,this.context,()=>this.goToStation()):this.currentScene=new Ar(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const e=(t=N(this.player.destinationId))==null?void 0:t.locationType;e==="surface"?this.currentScene=new Tr(this.player,this.context,()=>this.goToShip()):e==="asteroid"?this.currentScene=new Sr(this.player,this.context,()=>this.goToShip()):this.currentScene=new Er(this.player,this.context,()=>this.goToShip())}goToTrader(){const e=this.player.destinationId,t=N(e);let i=0;if(t.owningFactionId){const r=zt(t.owningFactionId);if(r&&me(r)){const o=P(),a=this.player.getFactionReputation(t.owningFactionId);i=Ee(a,o)}}const s=this.getOrCreateTraderStock(e,i);this.currentScene=new ws(this.input,this.context,this.player,e,s,(r,o,a)=>this.onBuy(r,o,a,s),(r,o,a)=>this.onSell(r,o,a,s),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionBoard(){const e=this.player.destinationId,t=this.player.getDestinationMissions(e);this.currentScene=new ye(this.input,this.context,this.player,e,t,i=>this.goToMissionDetail(i,e),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionDetail(e,t){this.currentScene=new Ts(this.input,this.context,this.player,e,i=>this.onMissionAccepted(e,i,t),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock())}onMissionAccepted(e,t,i){const s=this.player.getDestinationMissions(i),r=s.findIndex(o=>o.id===e.id);r>=0&&(s.splice(r,1),this.player.refreshDestinationMissions(i,s)),this.player.acceptMission(e,t),this.goToMissionBoard()}goToShip(){this.currentScene=new tr(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo(),()=>this.goToGlobalMenu())}goToCargo(){this.currentScene=new ir(this.input,this.context,this.player,()=>this.goToShip(),()=>this.goToGlobalMenu())}buildMenuEntries(){return[{label:"MISSIONS",action:()=>this.goToMissionLog()},{label:"GALAXY MAP",action:()=>this.goToGalaxyMapFromMenu()},{label:"REPUTATION",action:()=>this.goToReputation()}]}goToMissionLog(){this.currentScene=new us(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToReputation(){this.currentScene=new ys(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToGlobalMenuFromSubScene(){this.currentScene=new Vn(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}goToGlobalMenu(){this.sceneBeforeMenu=this.currentScene,"suspend"in this.currentScene&&this.currentScene.suspend(),this.currentScene=new Vn(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}returnFromMenu(){const e=this.sceneBeforeMenu;this.sceneBeforeMenu=null,e!==null?("resume"in e&&e.resume(),this.currentScene=e):this.goToShip()}goToTravelMenu(){this.currentScene=new ht(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu(),()=>this.goToEmergencyRescue())}goToArrival(){this.currentScene=new ht(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu(),()=>this.goToEmergencyRescue())}goToGalaxyMap(){this.currentScene=new ft(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToGlobalMenu())}goToGalaxyMapFromMenu(){this.currentScene=new ft(this.input,this.context,this.player,()=>this.goToGlobalMenu(),()=>this.goToGlobalMenu(),()=>this.returnFromMenu())}goToFlyIntoSpace(){const e=this.player.getInSystemHopCost();this.player.consumeFuel(e),this.player.undock(),this.currentScene=new yn(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(e){const t=this.player.getInSystemHopCost();this.player.consumeFuel(t),this.player.dock(e),this.currentScene=new yn(this.player,this.context,()=>this.goToShip())}onJumpSelected(e){const t=Ve(this.player.systemId,e),i=qt(this.player.driveId),s=Math.ceil(P().fuel.consumptionPerLy*t.distance*i.fuelEfficiency);this.player.consumeFuel(s),this.player.jumpTo(e),this.currentScene=new _r(this.player,this.context,()=>this.goToArrival())}goToEmergencyRescue(){this.currentScene=new sr(this.input,this.context,this.player,e=>this.onEmergencyTow(e),()=>this.onEmergencyFuelDrop(),()=>this.goToTravelMenu())}onEmergencyTow(e){const t=P();this.player.spendCredits(t.emergencyRescue.towFee),this.player.dock(e),this.currentScene=new yn(this.player,this.context,()=>this.goToShip())}onEmergencyFuelDrop(){const e=P();this.player.spendCredits(e.emergencyRescue.fuelDropFee),this.player.addFuel(e.emergencyRescue.fuelDropLitres),this.goToTravelMenu()}}const io=`---
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
`,so=`---
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
`,ro=`---
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
`,oo=`---
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
`,ao=`---
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
`,lo=`---
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
`,co=`---
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
`,ho=`---
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
`,uo=`---
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
`,po=`---
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
`,mo=`---
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
`,fo=`---
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
`,go=`---
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
`,yo=`---
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
`,_o=`---
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
`,bo=`---
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
`,vo=`---
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
`,wo=`---
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
`,ko=`---
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
`,xo=`---
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
`,Co=`---
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
`,To=`---
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
`,Mo=`---
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
`,So=`---
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
`,Io=`---
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
`,Ao=`---
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
`,Ro=`---
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
`,Eo=`---
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
`,Lo=`---
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
`,Fo=`---
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
`,Do=`---
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
`,No=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,Oo=`---
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
`,Po=`---
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
`,Ho=`---
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
---
`,Bo=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,Uo=`---
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
`,Go=`---
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

Long range engines for faster than light travel between systems.`,$o=`---
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
`,Wo=`---
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
`,Ko=`---
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
`,jo=`---
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
`,Yo=`---
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
`,qo=`---
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
`,Vo=`---
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
`,zo=`---
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
`,Xo=`---
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
`,Qo=`---
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
`,Jo=`---
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
`,Zo=`---
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
`,ea=`---
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
`,na=`---
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
`,ta=`---
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
`,ia=`---
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
`;var H={},De={},q={};function ti(n){return typeof n>"u"||n===null}function sa(n){return typeof n=="object"&&n!==null}function ra(n){return Array.isArray(n)?n:ti(n)?[]:[n]}function oa(n,e){var t,i,s,r;if(e)for(r=Object.keys(e),t=0,i=r.length;t<i;t+=1)s=r[t],n[s]=e[s];return n}function aa(n,e){var t="",i;for(i=0;i<e;i+=1)t+=n;return t}function la(n){return n===0&&Number.NEGATIVE_INFINITY===1/n}q.isNothing=ti;q.isObject=sa;q.toArray=ra;q.repeat=aa;q.isNegativeZero=la;q.extend=oa;function Le(n,e){Error.call(this),this.name="YAMLException",this.reason=n,this.mark=e,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}Le.prototype=Object.create(Error.prototype);Le.prototype.constructor=Le;Le.prototype.toString=function(e){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!e&&this.mark&&(t+=" "+this.mark.toString()),t};var Ne=Le,It=q;function Nn(n,e,t,i,s){this.name=n,this.buffer=e,this.position=t,this.line=i,this.column=s}Nn.prototype.getSnippet=function(e,t){var i,s,r,o,a;if(!this.buffer)return null;for(e=e||4,t=t||75,i="",s=this.position;s>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s-1))===-1;)if(s-=1,this.position-s>t/2-1){i=" ... ",s+=5;break}for(r="",o=this.position;o<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(o))===-1;)if(o+=1,o-this.position>t/2-1){r=" ... ",o-=5;break}return a=this.buffer.slice(s,o),It.repeat(" ",e)+i+a+r+`
`+It.repeat(" ",e+this.position-s+i.length)+"^"};Nn.prototype.toString=function(e){var t,i="";return this.name&&(i+='in "'+this.name+'" '),i+="at line "+(this.line+1)+", column "+(this.column+1),e||(t=this.getSnippet(),t&&(i+=`:
`+t)),i};var ca=Nn,At=Ne,ha=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],da=["scalar","sequence","mapping"];function ua(n){var e={};return n!==null&&Object.keys(n).forEach(function(t){n[t].forEach(function(i){e[String(i)]=t})}),e}function pa(n,e){if(e=e||{},Object.keys(e).forEach(function(t){if(ha.indexOf(t)===-1)throw new At('Unknown option "'+t+'" is met in definition of "'+n+'" YAML type.')}),this.tag=n,this.kind=e.kind||null,this.resolve=e.resolve||function(){return!0},this.construct=e.construct||function(t){return t},this.instanceOf=e.instanceOf||null,this.predicate=e.predicate||null,this.represent=e.represent||null,this.defaultStyle=e.defaultStyle||null,this.styleAliases=ua(e.styleAliases||null),da.indexOf(this.kind)===-1)throw new At('Unknown kind "'+this.kind+'" is specified for "'+n+'" YAML type.')}var U=pa,Rt=q,ze=Ne,ma=U;function Mn(n,e,t){var i=[];return n.include.forEach(function(s){t=Mn(s,e,t)}),n[e].forEach(function(s){t.forEach(function(r,o){r.tag===s.tag&&r.kind===s.kind&&i.push(o)}),t.push(s)}),t.filter(function(s,r){return i.indexOf(r)===-1})}function fa(){var n={scalar:{},sequence:{},mapping:{},fallback:{}},e,t;function i(s){n[s.kind][s.tag]=n.fallback[s.tag]=s}for(e=0,t=arguments.length;e<t;e+=1)arguments[e].forEach(i);return n}function _e(n){this.include=n.include||[],this.implicit=n.implicit||[],this.explicit=n.explicit||[],this.implicit.forEach(function(e){if(e.loadKind&&e.loadKind!=="scalar")throw new ze("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=Mn(this,"implicit",[]),this.compiledExplicit=Mn(this,"explicit",[]),this.compiledTypeMap=fa(this.compiledImplicit,this.compiledExplicit)}_e.DEFAULT=null;_e.create=function(){var e,t;switch(arguments.length){case 1:e=_e.DEFAULT,t=arguments[0];break;case 2:e=arguments[0],t=arguments[1];break;default:throw new ze("Wrong number of arguments for Schema.create function")}if(e=Rt.toArray(e),t=Rt.toArray(t),!e.every(function(i){return i instanceof _e}))throw new ze("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(i){return i instanceof ma}))throw new ze("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new _e({include:e,explicit:t})};var xe=_e,ga=U,ya=new ga("tag:yaml.org,2002:str",{kind:"scalar",construct:function(n){return n!==null?n:""}}),_a=U,ba=new _a("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(n){return n!==null?n:[]}}),va=U,wa=new va("tag:yaml.org,2002:map",{kind:"mapping",construct:function(n){return n!==null?n:{}}}),ka=xe,On=new ka({explicit:[ya,ba,wa]}),xa=U;function Ca(n){if(n===null)return!0;var e=n.length;return e===1&&n==="~"||e===4&&(n==="null"||n==="Null"||n==="NULL")}function Ta(){return null}function Ma(n){return n===null}var Sa=new xa("tag:yaml.org,2002:null",{kind:"scalar",resolve:Ca,construct:Ta,predicate:Ma,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Ia=U;function Aa(n){if(n===null)return!1;var e=n.length;return e===4&&(n==="true"||n==="True"||n==="TRUE")||e===5&&(n==="false"||n==="False"||n==="FALSE")}function Ra(n){return n==="true"||n==="True"||n==="TRUE"}function Ea(n){return Object.prototype.toString.call(n)==="[object Boolean]"}var La=new Ia("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Aa,construct:Ra,predicate:Ea,represent:{lowercase:function(n){return n?"true":"false"},uppercase:function(n){return n?"TRUE":"FALSE"},camelcase:function(n){return n?"True":"False"}},defaultStyle:"lowercase"}),Fa=q,Da=U;function Na(n){return 48<=n&&n<=57||65<=n&&n<=70||97<=n&&n<=102}function Oa(n){return 48<=n&&n<=55}function Pa(n){return 48<=n&&n<=57}function Ha(n){if(n===null)return!1;var e=n.length,t=0,i=!1,s;if(!e)return!1;if(s=n[t],(s==="-"||s==="+")&&(s=n[++t]),s==="0"){if(t+1===e)return!0;if(s=n[++t],s==="b"){for(t++;t<e;t++)if(s=n[t],s!=="_"){if(s!=="0"&&s!=="1")return!1;i=!0}return i&&s!=="_"}if(s==="x"){for(t++;t<e;t++)if(s=n[t],s!=="_"){if(!Na(n.charCodeAt(t)))return!1;i=!0}return i&&s!=="_"}for(;t<e;t++)if(s=n[t],s!=="_"){if(!Oa(n.charCodeAt(t)))return!1;i=!0}return i&&s!=="_"}if(s==="_")return!1;for(;t<e;t++)if(s=n[t],s!=="_"){if(s===":")break;if(!Pa(n.charCodeAt(t)))return!1;i=!0}return!i||s==="_"?!1:s!==":"?!0:/^(:[0-5]?[0-9])+$/.test(n.slice(t))}function Ba(n){var e=n,t=1,i,s,r=[];return e.indexOf("_")!==-1&&(e=e.replace(/_/g,"")),i=e[0],(i==="-"||i==="+")&&(i==="-"&&(t=-1),e=e.slice(1),i=e[0]),e==="0"?0:i==="0"?e[1]==="b"?t*parseInt(e.slice(2),2):e[1]==="x"?t*parseInt(e,16):t*parseInt(e,8):e.indexOf(":")!==-1?(e.split(":").forEach(function(o){r.unshift(parseInt(o,10))}),e=0,s=1,r.forEach(function(o){e+=o*s,s*=60}),t*e):t*parseInt(e,10)}function Ua(n){return Object.prototype.toString.call(n)==="[object Number]"&&n%1===0&&!Fa.isNegativeZero(n)}var Ga=new Da("tag:yaml.org,2002:int",{kind:"scalar",resolve:Ha,construct:Ba,predicate:Ua,represent:{binary:function(n){return n>=0?"0b"+n.toString(2):"-0b"+n.toString(2).slice(1)},octal:function(n){return n>=0?"0"+n.toString(8):"-0"+n.toString(8).slice(1)},decimal:function(n){return n.toString(10)},hexadecimal:function(n){return n>=0?"0x"+n.toString(16).toUpperCase():"-0x"+n.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),ii=q,$a=U,Wa=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Ka(n){return!(n===null||!Wa.test(n)||n[n.length-1]==="_")}function ja(n){var e,t,i,s;return e=n.replace(/_/g,"").toLowerCase(),t=e[0]==="-"?-1:1,s=[],"+-".indexOf(e[0])>=0&&(e=e.slice(1)),e===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:e===".nan"?NaN:e.indexOf(":")>=0?(e.split(":").forEach(function(r){s.unshift(parseFloat(r,10))}),e=0,i=1,s.forEach(function(r){e+=r*i,i*=60}),t*e):t*parseFloat(e,10)}var Ya=/^[-+]?[0-9]+e/;function qa(n,e){var t;if(isNaN(n))switch(e){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===n)switch(e){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===n)switch(e){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(ii.isNegativeZero(n))return"-0.0";return t=n.toString(10),Ya.test(t)?t.replace("e",".e"):t}function Va(n){return Object.prototype.toString.call(n)==="[object Number]"&&(n%1!==0||ii.isNegativeZero(n))}var za=new $a("tag:yaml.org,2002:float",{kind:"scalar",resolve:Ka,construct:ja,predicate:Va,represent:qa,defaultStyle:"lowercase"}),Xa=xe,si=new Xa({include:[On],implicit:[Sa,La,Ga,za]}),Qa=xe,ri=new Qa({include:[si]}),Ja=U,oi=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),ai=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Za(n){return n===null?!1:oi.exec(n)!==null||ai.exec(n)!==null}function el(n){var e,t,i,s,r,o,a,l=0,c=null,h,d,p;if(e=oi.exec(n),e===null&&(e=ai.exec(n)),e===null)throw new Error("Date resolve error");if(t=+e[1],i=+e[2]-1,s=+e[3],!e[4])return new Date(Date.UTC(t,i,s));if(r=+e[4],o=+e[5],a=+e[6],e[7]){for(l=e[7].slice(0,3);l.length<3;)l+="0";l=+l}return e[9]&&(h=+e[10],d=+(e[11]||0),c=(h*60+d)*6e4,e[9]==="-"&&(c=-c)),p=new Date(Date.UTC(t,i,s,r,o,a,l)),c&&p.setTime(p.getTime()-c),p}function nl(n){return n.toISOString()}var tl=new Ja("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Za,construct:el,instanceOf:Date,represent:nl}),il=U;function sl(n){return n==="<<"||n===null}var rl=new il("tag:yaml.org,2002:merge",{kind:"scalar",resolve:sl});function li(n){throw new Error('Could not dynamically require "'+n+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var ce;try{var ol=li;ce=ol("buffer").Buffer}catch{}var al=U,Pn=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function ll(n){if(n===null)return!1;var e,t,i=0,s=n.length,r=Pn;for(t=0;t<s;t++)if(e=r.indexOf(n.charAt(t)),!(e>64)){if(e<0)return!1;i+=6}return i%8===0}function cl(n){var e,t,i=n.replace(/[\r\n=]/g,""),s=i.length,r=Pn,o=0,a=[];for(e=0;e<s;e++)e%4===0&&e&&(a.push(o>>16&255),a.push(o>>8&255),a.push(o&255)),o=o<<6|r.indexOf(i.charAt(e));return t=s%4*6,t===0?(a.push(o>>16&255),a.push(o>>8&255),a.push(o&255)):t===18?(a.push(o>>10&255),a.push(o>>2&255)):t===12&&a.push(o>>4&255),ce?ce.from?ce.from(a):new ce(a):a}function hl(n){var e="",t=0,i,s,r=n.length,o=Pn;for(i=0;i<r;i++)i%3===0&&i&&(e+=o[t>>18&63],e+=o[t>>12&63],e+=o[t>>6&63],e+=o[t&63]),t=(t<<8)+n[i];return s=r%3,s===0?(e+=o[t>>18&63],e+=o[t>>12&63],e+=o[t>>6&63],e+=o[t&63]):s===2?(e+=o[t>>10&63],e+=o[t>>4&63],e+=o[t<<2&63],e+=o[64]):s===1&&(e+=o[t>>2&63],e+=o[t<<4&63],e+=o[64],e+=o[64]),e}function dl(n){return ce&&ce.isBuffer(n)}var ul=new al("tag:yaml.org,2002:binary",{kind:"scalar",resolve:ll,construct:cl,predicate:dl,represent:hl}),pl=U,ml=Object.prototype.hasOwnProperty,fl=Object.prototype.toString;function gl(n){if(n===null)return!0;var e=[],t,i,s,r,o,a=n;for(t=0,i=a.length;t<i;t+=1){if(s=a[t],o=!1,fl.call(s)!=="[object Object]")return!1;for(r in s)if(ml.call(s,r))if(!o)o=!0;else return!1;if(!o)return!1;if(e.indexOf(r)===-1)e.push(r);else return!1}return!0}function yl(n){return n!==null?n:[]}var _l=new pl("tag:yaml.org,2002:omap",{kind:"sequence",resolve:gl,construct:yl}),bl=U,vl=Object.prototype.toString;function wl(n){if(n===null)return!0;var e,t,i,s,r,o=n;for(r=new Array(o.length),e=0,t=o.length;e<t;e+=1){if(i=o[e],vl.call(i)!=="[object Object]"||(s=Object.keys(i),s.length!==1))return!1;r[e]=[s[0],i[s[0]]]}return!0}function kl(n){if(n===null)return[];var e,t,i,s,r,o=n;for(r=new Array(o.length),e=0,t=o.length;e<t;e+=1)i=o[e],s=Object.keys(i),r[e]=[s[0],i[s[0]]];return r}var xl=new bl("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:wl,construct:kl}),Cl=U,Tl=Object.prototype.hasOwnProperty;function Ml(n){if(n===null)return!0;var e,t=n;for(e in t)if(Tl.call(t,e)&&t[e]!==null)return!1;return!0}function Sl(n){return n!==null?n:{}}var Il=new Cl("tag:yaml.org,2002:set",{kind:"mapping",resolve:Ml,construct:Sl}),Al=xe,Oe=new Al({include:[ri],implicit:[tl,rl],explicit:[ul,_l,xl,Il]}),Rl=U;function El(){return!0}function Ll(){}function Fl(){return""}function Dl(n){return typeof n>"u"}var Nl=new Rl("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:El,construct:Ll,predicate:Dl,represent:Fl}),Ol=U;function Pl(n){if(n===null||n.length===0)return!1;var e=n,t=/\/([gim]*)$/.exec(n),i="";return!(e[0]==="/"&&(t&&(i=t[1]),i.length>3||e[e.length-i.length-1]!=="/"))}function Hl(n){var e=n,t=/\/([gim]*)$/.exec(n),i="";return e[0]==="/"&&(t&&(i=t[1]),e=e.slice(1,e.length-i.length-1)),new RegExp(e,i)}function Bl(n){var e="/"+n.source+"/";return n.global&&(e+="g"),n.multiline&&(e+="m"),n.ignoreCase&&(e+="i"),e}function Ul(n){return Object.prototype.toString.call(n)==="[object RegExp]"}var Gl=new Ol("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:Pl,construct:Hl,predicate:Ul,represent:Bl}),Je;try{var $l=li;Je=$l("esprima")}catch{typeof window<"u"&&(Je=window.esprima)}var Wl=U;function Kl(n){if(n===null)return!1;try{var e="("+n+")",t=Je.parse(e,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function jl(n){var e="("+n+")",t=Je.parse(e,{range:!0}),i=[],s;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(r){i.push(r.name)}),s=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(i,e.slice(s[0]+1,s[1]-1)):new Function(i,"return "+e.slice(s[0],s[1]))}function Yl(n){return n.toString()}function ql(n){return Object.prototype.toString.call(n)==="[object Function]"}var Vl=new Wl("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:Kl,construct:jl,predicate:ql,represent:Yl}),Et=xe,sn=Et.DEFAULT=new Et({include:[Oe],explicit:[Nl,Gl,Vl]}),ee=q,ci=Ne,zl=ca,hi=Oe,Xl=sn,oe=Object.prototype.hasOwnProperty,Ze=1,di=2,ui=3,en=4,wn=1,Ql=2,Lt=3,Jl=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Zl=/[\x85\u2028\u2029]/,ec=/[,\[\]\{\}]/,pi=/^(?:!|!!|![a-z\-]+!)$/i,mi=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function Ft(n){return Object.prototype.toString.call(n)}function z(n){return n===10||n===13}function he(n){return n===9||n===32}function Y(n){return n===9||n===32||n===10||n===13}function be(n){return n===44||n===91||n===93||n===123||n===125}function nc(n){var e;return 48<=n&&n<=57?n-48:(e=n|32,97<=e&&e<=102?e-97+10:-1)}function tc(n){return n===120?2:n===117?4:n===85?8:0}function ic(n){return 48<=n&&n<=57?n-48:-1}function Dt(n){return n===48?"\0":n===97?"\x07":n===98?"\b":n===116||n===9?"	":n===110?`
`:n===118?"\v":n===102?"\f":n===114?"\r":n===101?"\x1B":n===32?" ":n===34?'"':n===47?"/":n===92?"\\":n===78?"":n===95?" ":n===76?"\u2028":n===80?"\u2029":""}function sc(n){return n<=65535?String.fromCharCode(n):String.fromCharCode((n-65536>>10)+55296,(n-65536&1023)+56320)}function fi(n,e,t){e==="__proto__"?Object.defineProperty(n,e,{configurable:!0,enumerable:!0,writable:!0,value:t}):n[e]=t}var gi=new Array(256),yi=new Array(256);for(var fe=0;fe<256;fe++)gi[fe]=Dt(fe)?1:0,yi[fe]=Dt(fe);function rc(n,e){this.input=n,this.filename=e.filename||null,this.schema=e.schema||Xl,this.onWarning=e.onWarning||null,this.legacy=e.legacy||!1,this.json=e.json||!1,this.listener=e.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=n.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function _i(n,e){return new ci(e,new zl(n.filename,n.input,n.position,n.line,n.position-n.lineStart))}function S(n,e){throw _i(n,e)}function nn(n,e){n.onWarning&&n.onWarning.call(null,_i(n,e))}var Nt={YAML:function(e,t,i){var s,r,o;e.version!==null&&S(e,"duplication of %YAML directive"),i.length!==1&&S(e,"YAML directive accepts exactly one argument"),s=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),s===null&&S(e,"ill-formed argument of the YAML directive"),r=parseInt(s[1],10),o=parseInt(s[2],10),r!==1&&S(e,"unacceptable YAML version of the document"),e.version=i[0],e.checkLineBreaks=o<2,o!==1&&o!==2&&nn(e,"unsupported YAML version of the document")},TAG:function(e,t,i){var s,r;i.length!==2&&S(e,"TAG directive accepts exactly two arguments"),s=i[0],r=i[1],pi.test(s)||S(e,"ill-formed tag handle (first argument) of the TAG directive"),oe.call(e.tagMap,s)&&S(e,'there is a previously declared suffix for "'+s+'" tag handle'),mi.test(r)||S(e,"ill-formed tag prefix (second argument) of the TAG directive"),e.tagMap[s]=r}};function re(n,e,t,i){var s,r,o,a;if(e<t){if(a=n.input.slice(e,t),i)for(s=0,r=a.length;s<r;s+=1)o=a.charCodeAt(s),o===9||32<=o&&o<=1114111||S(n,"expected valid JSON character");else Jl.test(a)&&S(n,"the stream contains non-printable characters");n.result+=a}}function Ot(n,e,t,i){var s,r,o,a;for(ee.isObject(t)||S(n,"cannot merge mappings; the provided source object is unacceptable"),s=Object.keys(t),o=0,a=s.length;o<a;o+=1)r=s[o],oe.call(e,r)||(fi(e,r,t[r]),i[r]=!0)}function ve(n,e,t,i,s,r,o,a){var l,c;if(Array.isArray(s))for(s=Array.prototype.slice.call(s),l=0,c=s.length;l<c;l+=1)Array.isArray(s[l])&&S(n,"nested arrays are not supported inside keys"),typeof s=="object"&&Ft(s[l])==="[object Object]"&&(s[l]="[object Object]");if(typeof s=="object"&&Ft(s)==="[object Object]"&&(s="[object Object]"),s=String(s),e===null&&(e={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(r))for(l=0,c=r.length;l<c;l+=1)Ot(n,e,r[l],t);else Ot(n,e,r,t);else!n.json&&!oe.call(t,s)&&oe.call(e,s)&&(n.line=o||n.line,n.position=a||n.position,S(n,"duplicated mapping key")),fi(e,s,r),delete t[s];return e}function Hn(n){var e;e=n.input.charCodeAt(n.position),e===10?n.position++:e===13?(n.position++,n.input.charCodeAt(n.position)===10&&n.position++):S(n,"a line break is expected"),n.line+=1,n.lineStart=n.position}function B(n,e,t){for(var i=0,s=n.input.charCodeAt(n.position);s!==0;){for(;he(s);)s=n.input.charCodeAt(++n.position);if(e&&s===35)do s=n.input.charCodeAt(++n.position);while(s!==10&&s!==13&&s!==0);if(z(s))for(Hn(n),s=n.input.charCodeAt(n.position),i++,n.lineIndent=0;s===32;)n.lineIndent++,s=n.input.charCodeAt(++n.position);else break}return t!==-1&&i!==0&&n.lineIndent<t&&nn(n,"deficient indentation"),i}function rn(n){var e=n.position,t;return t=n.input.charCodeAt(e),!!((t===45||t===46)&&t===n.input.charCodeAt(e+1)&&t===n.input.charCodeAt(e+2)&&(e+=3,t=n.input.charCodeAt(e),t===0||Y(t)))}function Bn(n,e){e===1?n.result+=" ":e>1&&(n.result+=ee.repeat(`
`,e-1))}function oc(n,e,t){var i,s,r,o,a,l,c,h,d=n.kind,p=n.result,u;if(u=n.input.charCodeAt(n.position),Y(u)||be(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(s=n.input.charCodeAt(n.position+1),Y(s)||t&&be(s)))return!1;for(n.kind="scalar",n.result="",r=o=n.position,a=!1;u!==0;){if(u===58){if(s=n.input.charCodeAt(n.position+1),Y(s)||t&&be(s))break}else if(u===35){if(i=n.input.charCodeAt(n.position-1),Y(i))break}else{if(n.position===n.lineStart&&rn(n)||t&&be(u))break;if(z(u))if(l=n.line,c=n.lineStart,h=n.lineIndent,B(n,!1,-1),n.lineIndent>=e){a=!0,u=n.input.charCodeAt(n.position);continue}else{n.position=o,n.line=l,n.lineStart=c,n.lineIndent=h;break}}a&&(re(n,r,o,!1),Bn(n,n.line-l),r=o=n.position,a=!1),he(u)||(o=n.position+1),u=n.input.charCodeAt(++n.position)}return re(n,r,o,!1),n.result?!0:(n.kind=d,n.result=p,!1)}function ac(n,e){var t,i,s;if(t=n.input.charCodeAt(n.position),t!==39)return!1;for(n.kind="scalar",n.result="",n.position++,i=s=n.position;(t=n.input.charCodeAt(n.position))!==0;)if(t===39)if(re(n,i,n.position,!0),t=n.input.charCodeAt(++n.position),t===39)i=n.position,n.position++,s=n.position;else return!0;else z(t)?(re(n,i,s,!0),Bn(n,B(n,!1,e)),i=s=n.position):n.position===n.lineStart&&rn(n)?S(n,"unexpected end of the document within a single quoted scalar"):(n.position++,s=n.position);S(n,"unexpected end of the stream within a single quoted scalar")}function lc(n,e){var t,i,s,r,o,a;if(a=n.input.charCodeAt(n.position),a!==34)return!1;for(n.kind="scalar",n.result="",n.position++,t=i=n.position;(a=n.input.charCodeAt(n.position))!==0;){if(a===34)return re(n,t,n.position,!0),n.position++,!0;if(a===92){if(re(n,t,n.position,!0),a=n.input.charCodeAt(++n.position),z(a))B(n,!1,e);else if(a<256&&gi[a])n.result+=yi[a],n.position++;else if((o=tc(a))>0){for(s=o,r=0;s>0;s--)a=n.input.charCodeAt(++n.position),(o=nc(a))>=0?r=(r<<4)+o:S(n,"expected hexadecimal character");n.result+=sc(r),n.position++}else S(n,"unknown escape sequence");t=i=n.position}else z(a)?(re(n,t,i,!0),Bn(n,B(n,!1,e)),t=i=n.position):n.position===n.lineStart&&rn(n)?S(n,"unexpected end of the document within a double quoted scalar"):(n.position++,i=n.position)}S(n,"unexpected end of the stream within a double quoted scalar")}function cc(n,e){var t=!0,i,s=n.tag,r,o=n.anchor,a,l,c,h,d,p={},u,m,f,y;if(y=n.input.charCodeAt(n.position),y===91)l=93,d=!1,r=[];else if(y===123)l=125,d=!0,r={};else return!1;for(n.anchor!==null&&(n.anchorMap[n.anchor]=r),y=n.input.charCodeAt(++n.position);y!==0;){if(B(n,!0,e),y=n.input.charCodeAt(n.position),y===l)return n.position++,n.tag=s,n.anchor=o,n.kind=d?"mapping":"sequence",n.result=r,!0;t||S(n,"missed comma between flow collection entries"),m=u=f=null,c=h=!1,y===63&&(a=n.input.charCodeAt(n.position+1),Y(a)&&(c=h=!0,n.position++,B(n,!0,e))),i=n.line,we(n,e,Ze,!1,!0),m=n.tag,u=n.result,B(n,!0,e),y=n.input.charCodeAt(n.position),(h||n.line===i)&&y===58&&(c=!0,y=n.input.charCodeAt(++n.position),B(n,!0,e),we(n,e,Ze,!1,!0),f=n.result),d?ve(n,r,p,m,u,f):c?r.push(ve(n,null,p,m,u,f)):r.push(u),B(n,!0,e),y=n.input.charCodeAt(n.position),y===44?(t=!0,y=n.input.charCodeAt(++n.position)):t=!1}S(n,"unexpected end of the stream within a flow collection")}function hc(n,e){var t,i,s=wn,r=!1,o=!1,a=e,l=0,c=!1,h,d;if(d=n.input.charCodeAt(n.position),d===124)i=!1;else if(d===62)i=!0;else return!1;for(n.kind="scalar",n.result="";d!==0;)if(d=n.input.charCodeAt(++n.position),d===43||d===45)wn===s?s=d===43?Lt:Ql:S(n,"repeat of a chomping mode identifier");else if((h=ic(d))>=0)h===0?S(n,"bad explicit indentation width of a block scalar; it cannot be less than one"):o?S(n,"repeat of an indentation width identifier"):(a=e+h-1,o=!0);else break;if(he(d)){do d=n.input.charCodeAt(++n.position);while(he(d));if(d===35)do d=n.input.charCodeAt(++n.position);while(!z(d)&&d!==0)}for(;d!==0;){for(Hn(n),n.lineIndent=0,d=n.input.charCodeAt(n.position);(!o||n.lineIndent<a)&&d===32;)n.lineIndent++,d=n.input.charCodeAt(++n.position);if(!o&&n.lineIndent>a&&(a=n.lineIndent),z(d)){l++;continue}if(n.lineIndent<a){s===Lt?n.result+=ee.repeat(`
`,r?1+l:l):s===wn&&r&&(n.result+=`
`);break}for(i?he(d)?(c=!0,n.result+=ee.repeat(`
`,r?1+l:l)):c?(c=!1,n.result+=ee.repeat(`
`,l+1)):l===0?r&&(n.result+=" "):n.result+=ee.repeat(`
`,l):n.result+=ee.repeat(`
`,r?1+l:l),r=!0,o=!0,l=0,t=n.position;!z(d)&&d!==0;)d=n.input.charCodeAt(++n.position);re(n,t,n.position,!1)}return!0}function Pt(n,e){var t,i=n.tag,s=n.anchor,r=[],o,a=!1,l;for(n.anchor!==null&&(n.anchorMap[n.anchor]=r),l=n.input.charCodeAt(n.position);l!==0&&!(l!==45||(o=n.input.charCodeAt(n.position+1),!Y(o)));){if(a=!0,n.position++,B(n,!0,-1)&&n.lineIndent<=e){r.push(null),l=n.input.charCodeAt(n.position);continue}if(t=n.line,we(n,e,ui,!1,!0),r.push(n.result),B(n,!0,-1),l=n.input.charCodeAt(n.position),(n.line===t||n.lineIndent>e)&&l!==0)S(n,"bad indentation of a sequence entry");else if(n.lineIndent<e)break}return a?(n.tag=i,n.anchor=s,n.kind="sequence",n.result=r,!0):!1}function dc(n,e,t){var i,s,r,o,a=n.tag,l=n.anchor,c={},h={},d=null,p=null,u=null,m=!1,f=!1,y;for(n.anchor!==null&&(n.anchorMap[n.anchor]=c),y=n.input.charCodeAt(n.position);y!==0;){if(i=n.input.charCodeAt(n.position+1),r=n.line,o=n.position,(y===63||y===58)&&Y(i))y===63?(m&&(ve(n,c,h,d,p,null),d=p=u=null),f=!0,m=!0,s=!0):m?(m=!1,s=!0):S(n,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),n.position+=1,y=i;else if(we(n,t,di,!1,!0))if(n.line===r){for(y=n.input.charCodeAt(n.position);he(y);)y=n.input.charCodeAt(++n.position);if(y===58)y=n.input.charCodeAt(++n.position),Y(y)||S(n,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(ve(n,c,h,d,p,null),d=p=u=null),f=!0,m=!1,s=!1,d=n.tag,p=n.result;else if(f)S(n,"can not read an implicit mapping pair; a colon is missed");else return n.tag=a,n.anchor=l,!0}else if(f)S(n,"can not read a block mapping entry; a multiline key may not be an implicit key");else return n.tag=a,n.anchor=l,!0;else break;if((n.line===r||n.lineIndent>e)&&(we(n,e,en,!0,s)&&(m?p=n.result:u=n.result),m||(ve(n,c,h,d,p,u,r,o),d=p=u=null),B(n,!0,-1),y=n.input.charCodeAt(n.position)),n.lineIndent>e&&y!==0)S(n,"bad indentation of a mapping entry");else if(n.lineIndent<e)break}return m&&ve(n,c,h,d,p,null),f&&(n.tag=a,n.anchor=l,n.kind="mapping",n.result=c),f}function uc(n){var e,t=!1,i=!1,s,r,o;if(o=n.input.charCodeAt(n.position),o!==33)return!1;if(n.tag!==null&&S(n,"duplication of a tag property"),o=n.input.charCodeAt(++n.position),o===60?(t=!0,o=n.input.charCodeAt(++n.position)):o===33?(i=!0,s="!!",o=n.input.charCodeAt(++n.position)):s="!",e=n.position,t){do o=n.input.charCodeAt(++n.position);while(o!==0&&o!==62);n.position<n.length?(r=n.input.slice(e,n.position),o=n.input.charCodeAt(++n.position)):S(n,"unexpected end of the stream within a verbatim tag")}else{for(;o!==0&&!Y(o);)o===33&&(i?S(n,"tag suffix cannot contain exclamation marks"):(s=n.input.slice(e-1,n.position+1),pi.test(s)||S(n,"named tag handle cannot contain such characters"),i=!0,e=n.position+1)),o=n.input.charCodeAt(++n.position);r=n.input.slice(e,n.position),ec.test(r)&&S(n,"tag suffix cannot contain flow indicator characters")}return r&&!mi.test(r)&&S(n,"tag name cannot contain such characters: "+r),t?n.tag=r:oe.call(n.tagMap,s)?n.tag=n.tagMap[s]+r:s==="!"?n.tag="!"+r:s==="!!"?n.tag="tag:yaml.org,2002:"+r:S(n,'undeclared tag handle "'+s+'"'),!0}function pc(n){var e,t;if(t=n.input.charCodeAt(n.position),t!==38)return!1;for(n.anchor!==null&&S(n,"duplication of an anchor property"),t=n.input.charCodeAt(++n.position),e=n.position;t!==0&&!Y(t)&&!be(t);)t=n.input.charCodeAt(++n.position);return n.position===e&&S(n,"name of an anchor node must contain at least one character"),n.anchor=n.input.slice(e,n.position),!0}function mc(n){var e,t,i;if(i=n.input.charCodeAt(n.position),i!==42)return!1;for(i=n.input.charCodeAt(++n.position),e=n.position;i!==0&&!Y(i)&&!be(i);)i=n.input.charCodeAt(++n.position);return n.position===e&&S(n,"name of an alias node must contain at least one character"),t=n.input.slice(e,n.position),oe.call(n.anchorMap,t)||S(n,'unidentified alias "'+t+'"'),n.result=n.anchorMap[t],B(n,!0,-1),!0}function we(n,e,t,i,s){var r,o,a,l=1,c=!1,h=!1,d,p,u,m,f;if(n.listener!==null&&n.listener("open",n),n.tag=null,n.anchor=null,n.kind=null,n.result=null,r=o=a=en===t||ui===t,i&&B(n,!0,-1)&&(c=!0,n.lineIndent>e?l=1:n.lineIndent===e?l=0:n.lineIndent<e&&(l=-1)),l===1)for(;uc(n)||pc(n);)B(n,!0,-1)?(c=!0,a=r,n.lineIndent>e?l=1:n.lineIndent===e?l=0:n.lineIndent<e&&(l=-1)):a=!1;if(a&&(a=c||s),(l===1||en===t)&&(Ze===t||di===t?m=e:m=e+1,f=n.position-n.lineStart,l===1?a&&(Pt(n,f)||dc(n,f,m))||cc(n,m)?h=!0:(o&&hc(n,m)||ac(n,m)||lc(n,m)?h=!0:mc(n)?(h=!0,(n.tag!==null||n.anchor!==null)&&S(n,"alias node should not have any properties")):oc(n,m,Ze===t)&&(h=!0,n.tag===null&&(n.tag="?")),n.anchor!==null&&(n.anchorMap[n.anchor]=n.result)):l===0&&(h=a&&Pt(n,f))),n.tag!==null&&n.tag!=="!")if(n.tag==="?"){for(n.result!==null&&n.kind!=="scalar"&&S(n,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+n.kind+'"'),d=0,p=n.implicitTypes.length;d<p;d+=1)if(u=n.implicitTypes[d],u.resolve(n.result)){n.result=u.construct(n.result),n.tag=u.tag,n.anchor!==null&&(n.anchorMap[n.anchor]=n.result);break}}else oe.call(n.typeMap[n.kind||"fallback"],n.tag)?(u=n.typeMap[n.kind||"fallback"][n.tag],n.result!==null&&u.kind!==n.kind&&S(n,"unacceptable node kind for !<"+n.tag+'> tag; it should be "'+u.kind+'", not "'+n.kind+'"'),u.resolve(n.result)?(n.result=u.construct(n.result),n.anchor!==null&&(n.anchorMap[n.anchor]=n.result)):S(n,"cannot resolve a node with !<"+n.tag+"> explicit tag")):S(n,"unknown tag !<"+n.tag+">");return n.listener!==null&&n.listener("close",n),n.tag!==null||n.anchor!==null||h}function fc(n){var e=n.position,t,i,s,r=!1,o;for(n.version=null,n.checkLineBreaks=n.legacy,n.tagMap={},n.anchorMap={};(o=n.input.charCodeAt(n.position))!==0&&(B(n,!0,-1),o=n.input.charCodeAt(n.position),!(n.lineIndent>0||o!==37));){for(r=!0,o=n.input.charCodeAt(++n.position),t=n.position;o!==0&&!Y(o);)o=n.input.charCodeAt(++n.position);for(i=n.input.slice(t,n.position),s=[],i.length<1&&S(n,"directive name must not be less than one character in length");o!==0;){for(;he(o);)o=n.input.charCodeAt(++n.position);if(o===35){do o=n.input.charCodeAt(++n.position);while(o!==0&&!z(o));break}if(z(o))break;for(t=n.position;o!==0&&!Y(o);)o=n.input.charCodeAt(++n.position);s.push(n.input.slice(t,n.position))}o!==0&&Hn(n),oe.call(Nt,i)?Nt[i](n,i,s):nn(n,'unknown document directive "'+i+'"')}if(B(n,!0,-1),n.lineIndent===0&&n.input.charCodeAt(n.position)===45&&n.input.charCodeAt(n.position+1)===45&&n.input.charCodeAt(n.position+2)===45?(n.position+=3,B(n,!0,-1)):r&&S(n,"directives end mark is expected"),we(n,n.lineIndent-1,en,!1,!0),B(n,!0,-1),n.checkLineBreaks&&Zl.test(n.input.slice(e,n.position))&&nn(n,"non-ASCII line breaks are interpreted as content"),n.documents.push(n.result),n.position===n.lineStart&&rn(n)){n.input.charCodeAt(n.position)===46&&(n.position+=3,B(n,!0,-1));return}if(n.position<n.length-1)S(n,"end of the stream or a document separator is expected");else return}function bi(n,e){n=String(n),e=e||{},n.length!==0&&(n.charCodeAt(n.length-1)!==10&&n.charCodeAt(n.length-1)!==13&&(n+=`
`),n.charCodeAt(0)===65279&&(n=n.slice(1)));var t=new rc(n,e),i=n.indexOf("\0");for(i!==-1&&(t.position=i,S(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)fc(t);return t.documents}function vi(n,e,t){e!==null&&typeof e=="object"&&typeof t>"u"&&(t=e,e=null);var i=bi(n,t);if(typeof e!="function")return i;for(var s=0,r=i.length;s<r;s+=1)e(i[s])}function wi(n,e){var t=bi(n,e);if(t.length!==0){if(t.length===1)return t[0];throw new ci("expected a single document in the stream, but found more")}}function gc(n,e,t){return typeof e=="object"&&e!==null&&typeof t>"u"&&(t=e,e=null),vi(n,e,ee.extend({schema:hi},t))}function yc(n,e){return wi(n,ee.extend({schema:hi},e))}De.loadAll=vi;De.load=wi;De.safeLoadAll=gc;De.safeLoad=yc;var Un={},Pe=q,He=Ne,_c=sn,bc=Oe,ki=Object.prototype.toString,xi=Object.prototype.hasOwnProperty,vc=9,Fe=10,wc=13,kc=32,xc=33,Cc=34,Ci=35,Tc=37,Mc=38,Sc=39,Ic=42,Ti=44,Ac=45,Mi=58,Rc=61,Ec=62,Lc=63,Fc=64,Si=91,Ii=93,Dc=96,Ai=123,Nc=124,Ri=125,$={};$[0]="\\0";$[7]="\\a";$[8]="\\b";$[9]="\\t";$[10]="\\n";$[11]="\\v";$[12]="\\f";$[13]="\\r";$[27]="\\e";$[34]='\\"';$[92]="\\\\";$[133]="\\N";$[160]="\\_";$[8232]="\\L";$[8233]="\\P";var Oc=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function Pc(n,e){var t,i,s,r,o,a,l;if(e===null)return{};for(t={},i=Object.keys(e),s=0,r=i.length;s<r;s+=1)o=i[s],a=String(e[o]),o.slice(0,2)==="!!"&&(o="tag:yaml.org,2002:"+o.slice(2)),l=n.compiledTypeMap.fallback[o],l&&xi.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[o]=a;return t}function Ht(n){var e,t,i;if(e=n.toString(16).toUpperCase(),n<=255)t="x",i=2;else if(n<=65535)t="u",i=4;else if(n<=4294967295)t="U",i=8;else throw new He("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+Pe.repeat("0",i-e.length)+e}function Hc(n){this.schema=n.schema||_c,this.indent=Math.max(1,n.indent||2),this.noArrayIndent=n.noArrayIndent||!1,this.skipInvalid=n.skipInvalid||!1,this.flowLevel=Pe.isNothing(n.flowLevel)?-1:n.flowLevel,this.styleMap=Pc(this.schema,n.styles||null),this.sortKeys=n.sortKeys||!1,this.lineWidth=n.lineWidth||80,this.noRefs=n.noRefs||!1,this.noCompatMode=n.noCompatMode||!1,this.condenseFlow=n.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function Bt(n,e){for(var t=Pe.repeat(" ",e),i=0,s=-1,r="",o,a=n.length;i<a;)s=n.indexOf(`
`,i),s===-1?(o=n.slice(i),i=a):(o=n.slice(i,s+1),i=s+1),o.length&&o!==`
`&&(r+=t),r+=o;return r}function Sn(n,e){return`
`+Pe.repeat(" ",n.indent*e)}function Bc(n,e){var t,i,s;for(t=0,i=n.implicitTypes.length;t<i;t+=1)if(s=n.implicitTypes[t],s.resolve(e))return!0;return!1}function Gn(n){return n===kc||n===vc}function ke(n){return 32<=n&&n<=126||161<=n&&n<=55295&&n!==8232&&n!==8233||57344<=n&&n<=65533&&n!==65279||65536<=n&&n<=1114111}function Uc(n){return ke(n)&&!Gn(n)&&n!==65279&&n!==wc&&n!==Fe}function Ut(n,e){return ke(n)&&n!==65279&&n!==Ti&&n!==Si&&n!==Ii&&n!==Ai&&n!==Ri&&n!==Mi&&(n!==Ci||e&&Uc(e))}function Gc(n){return ke(n)&&n!==65279&&!Gn(n)&&n!==Ac&&n!==Lc&&n!==Mi&&n!==Ti&&n!==Si&&n!==Ii&&n!==Ai&&n!==Ri&&n!==Ci&&n!==Mc&&n!==Ic&&n!==xc&&n!==Nc&&n!==Rc&&n!==Ec&&n!==Sc&&n!==Cc&&n!==Tc&&n!==Fc&&n!==Dc}function Ei(n){var e=/^\n* /;return e.test(n)}var Li=1,Fi=2,Di=3,Ni=4,Xe=5;function $c(n,e,t,i,s){var r,o,a,l=!1,c=!1,h=i!==-1,d=-1,p=Gc(n.charCodeAt(0))&&!Gn(n.charCodeAt(n.length-1));if(e)for(r=0;r<n.length;r++){if(o=n.charCodeAt(r),!ke(o))return Xe;a=r>0?n.charCodeAt(r-1):null,p=p&&Ut(o,a)}else{for(r=0;r<n.length;r++){if(o=n.charCodeAt(r),o===Fe)l=!0,h&&(c=c||r-d-1>i&&n[d+1]!==" ",d=r);else if(!ke(o))return Xe;a=r>0?n.charCodeAt(r-1):null,p=p&&Ut(o,a)}c=c||h&&r-d-1>i&&n[d+1]!==" "}return!l&&!c?p&&!s(n)?Li:Fi:t>9&&Ei(n)?Xe:c?Ni:Di}function Wc(n,e,t,i){n.dump=function(){if(e.length===0)return"''";if(!n.noCompatMode&&Oc.indexOf(e)!==-1)return"'"+e+"'";var s=n.indent*Math.max(1,t),r=n.lineWidth===-1?-1:Math.max(Math.min(n.lineWidth,40),n.lineWidth-s),o=i||n.flowLevel>-1&&t>=n.flowLevel;function a(l){return Bc(n,l)}switch($c(e,o,n.indent,r,a)){case Li:return e;case Fi:return"'"+e.replace(/'/g,"''")+"'";case Di:return"|"+Gt(e,n.indent)+$t(Bt(e,s));case Ni:return">"+Gt(e,n.indent)+$t(Bt(Kc(e,r),s));case Xe:return'"'+jc(e)+'"';default:throw new He("impossible error: invalid scalar style")}}()}function Gt(n,e){var t=Ei(n)?String(e):"",i=n[n.length-1]===`
`,s=i&&(n[n.length-2]===`
`||n===`
`),r=s?"+":i?"":"-";return t+r+`
`}function $t(n){return n[n.length-1]===`
`?n.slice(0,-1):n}function Kc(n,e){for(var t=/(\n+)([^\n]*)/g,i=function(){var c=n.indexOf(`
`);return c=c!==-1?c:n.length,t.lastIndex=c,Wt(n.slice(0,c),e)}(),s=n[0]===`
`||n[0]===" ",r,o;o=t.exec(n);){var a=o[1],l=o[2];r=l[0]===" ",i+=a+(!s&&!r&&l!==""?`
`:"")+Wt(l,e),s=r}return i}function Wt(n,e){if(n===""||n[0]===" ")return n;for(var t=/ [^ ]/g,i,s=0,r,o=0,a=0,l="";i=t.exec(n);)a=i.index,a-s>e&&(r=o>s?o:a,l+=`
`+n.slice(s,r),s=r+1),o=a;return l+=`
`,n.length-s>e&&o>s?l+=n.slice(s,o)+`
`+n.slice(o+1):l+=n.slice(s),l.slice(1)}function jc(n){for(var e="",t,i,s,r=0;r<n.length;r++){if(t=n.charCodeAt(r),t>=55296&&t<=56319&&(i=n.charCodeAt(r+1),i>=56320&&i<=57343)){e+=Ht((t-55296)*1024+i-56320+65536),r++;continue}s=$[t],e+=!s&&ke(t)?n[r]:s||Ht(t)}return e}function Yc(n,e,t){var i="",s=n.tag,r,o;for(r=0,o=t.length;r<o;r+=1)ue(n,e,t[r],!1,!1)&&(r!==0&&(i+=","+(n.condenseFlow?"":" ")),i+=n.dump);n.tag=s,n.dump="["+i+"]"}function qc(n,e,t,i){var s="",r=n.tag,o,a;for(o=0,a=t.length;o<a;o+=1)ue(n,e+1,t[o],!0,!0)&&((!i||o!==0)&&(s+=Sn(n,e)),n.dump&&Fe===n.dump.charCodeAt(0)?s+="-":s+="- ",s+=n.dump);n.tag=r,n.dump=s||"[]"}function Vc(n,e,t){var i="",s=n.tag,r=Object.keys(t),o,a,l,c,h;for(o=0,a=r.length;o<a;o+=1)h="",o!==0&&(h+=", "),n.condenseFlow&&(h+='"'),l=r[o],c=t[l],ue(n,e,l,!1,!1)&&(n.dump.length>1024&&(h+="? "),h+=n.dump+(n.condenseFlow?'"':"")+":"+(n.condenseFlow?"":" "),ue(n,e,c,!1,!1)&&(h+=n.dump,i+=h));n.tag=s,n.dump="{"+i+"}"}function zc(n,e,t,i){var s="",r=n.tag,o=Object.keys(t),a,l,c,h,d,p;if(n.sortKeys===!0)o.sort();else if(typeof n.sortKeys=="function")o.sort(n.sortKeys);else if(n.sortKeys)throw new He("sortKeys must be a boolean or a function");for(a=0,l=o.length;a<l;a+=1)p="",(!i||a!==0)&&(p+=Sn(n,e)),c=o[a],h=t[c],ue(n,e+1,c,!0,!0,!0)&&(d=n.tag!==null&&n.tag!=="?"||n.dump&&n.dump.length>1024,d&&(n.dump&&Fe===n.dump.charCodeAt(0)?p+="?":p+="? "),p+=n.dump,d&&(p+=Sn(n,e)),ue(n,e+1,h,!0,d)&&(n.dump&&Fe===n.dump.charCodeAt(0)?p+=":":p+=": ",p+=n.dump,s+=p));n.tag=r,n.dump=s||"{}"}function Kt(n,e,t){var i,s,r,o,a,l;for(s=t?n.explicitTypes:n.implicitTypes,r=0,o=s.length;r<o;r+=1)if(a=s[r],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof e=="object"&&e instanceof a.instanceOf)&&(!a.predicate||a.predicate(e))){if(n.tag=t?a.tag:"?",a.represent){if(l=n.styleMap[a.tag]||a.defaultStyle,ki.call(a.represent)==="[object Function]")i=a.represent(e,l);else if(xi.call(a.represent,l))i=a.represent[l](e,l);else throw new He("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');n.dump=i}return!0}return!1}function ue(n,e,t,i,s,r){n.tag=null,n.dump=t,Kt(n,t,!1)||Kt(n,t,!0);var o=ki.call(n.dump);i&&(i=n.flowLevel<0||n.flowLevel>e);var a=o==="[object Object]"||o==="[object Array]",l,c;if(a&&(l=n.duplicates.indexOf(t),c=l!==-1),(n.tag!==null&&n.tag!=="?"||c||n.indent!==2&&e>0)&&(s=!1),c&&n.usedDuplicates[l])n.dump="*ref_"+l;else{if(a&&c&&!n.usedDuplicates[l]&&(n.usedDuplicates[l]=!0),o==="[object Object]")i&&Object.keys(n.dump).length!==0?(zc(n,e,n.dump,s),c&&(n.dump="&ref_"+l+n.dump)):(Vc(n,e,n.dump),c&&(n.dump="&ref_"+l+" "+n.dump));else if(o==="[object Array]"){var h=n.noArrayIndent&&e>0?e-1:e;i&&n.dump.length!==0?(qc(n,h,n.dump,s),c&&(n.dump="&ref_"+l+n.dump)):(Yc(n,h,n.dump),c&&(n.dump="&ref_"+l+" "+n.dump))}else if(o==="[object String]")n.tag!=="?"&&Wc(n,n.dump,e,r);else{if(n.skipInvalid)return!1;throw new He("unacceptable kind of an object to dump "+o)}n.tag!==null&&n.tag!=="?"&&(n.dump="!<"+n.tag+"> "+n.dump)}return!0}function Xc(n,e){var t=[],i=[],s,r;for(In(n,t,i),s=0,r=i.length;s<r;s+=1)e.duplicates.push(t[i[s]]);e.usedDuplicates=new Array(r)}function In(n,e,t){var i,s,r;if(n!==null&&typeof n=="object")if(s=e.indexOf(n),s!==-1)t.indexOf(s)===-1&&t.push(s);else if(e.push(n),Array.isArray(n))for(s=0,r=n.length;s<r;s+=1)In(n[s],e,t);else for(i=Object.keys(n),s=0,r=i.length;s<r;s+=1)In(n[i[s]],e,t)}function Oi(n,e){e=e||{};var t=new Hc(e);return t.noRefs||Xc(n,t),ue(t,0,n,!0,!0)?t.dump+`
`:""}function Qc(n,e){return Oi(n,Pe.extend({schema:bc},e))}Un.dump=Oi;Un.safeDump=Qc;var on=De,Pi=Un;function an(n){return function(){throw new Error("Function "+n+" is deprecated and cannot be used.")}}H.Type=U;H.Schema=xe;H.FAILSAFE_SCHEMA=On;H.JSON_SCHEMA=si;H.CORE_SCHEMA=ri;H.DEFAULT_SAFE_SCHEMA=Oe;H.DEFAULT_FULL_SCHEMA=sn;H.load=on.load;H.loadAll=on.loadAll;H.safeLoad=on.safeLoad;H.safeLoadAll=on.safeLoadAll;H.dump=Pi.dump;H.safeDump=Pi.safeDump;H.YAMLException=Ne;H.MINIMAL_SCHEMA=On;H.SAFE_SCHEMA=Oe;H.DEFAULT_SCHEMA=sn;H.scan=an("scan");H.parse=an("parse");H.compose=an("compose");H.addConstructor=an("addConstructor");var Jc=H,Zc=Jc;function eh(n){if(!n.startsWith(`---
`))return{data:{},content:n};const e=n.indexOf(`
---`,4);if(e===-1)return{data:{},content:n};const t=n.slice(4,e),i=n.slice(e+4),s=i.startsWith(`
`)?i.slice(1):i;return{data:Zc.safeLoad(t)??{},content:s}}const Hi={npc:{specialNameChance:.3},missions:{boardMaxCount:8,missionTtlMs:9e5,deliveryChance:.6,deliveryBaseReward:200,deliveryRandomReward:200,supplyRewardMultiplierMin:1.15,supplyRewardMultiplierMax:1.5,supplyRequirementsMin:1,supplyRequirementsMax:2,supplyQtyMin:3,supplyQtyMax:10,deliveryDepositFraction:.2},trading:{stockCountMin:4,stockCountMax:6,stockQtyMin:5,stockQtyMax:10,stockTtlMs:12e4,stockRepCountBonusPerLevel:1,stockRepCountBonusMin:-2,stockRepCountBonusMax:3,stockRepQtyBonusPerLevel:2,stockRepQtyBonusMin:-4,stockRepQtyBonusMax:6},fuel:{pricePerLitre:10,consumptionPerLy:5,inSystemBaseConsumptionL:4},reputation:{levelUnfriendlyMin:-300,levelNeutralMin:-100,levelFriendlyMin:100,levelLikedMin:300,levelReveredMin:600,pointsMin:-600,pointsMax:1e3,missionDeltaSmall:25,missionDeltaMedium:75,missionDeltaLarge:200,missionTierMediumReward:300,missionTierLargeReward:600,tradeModifierHated:1.2,tradeModifierUnfriendly:1.1,tradeModifierNeutral:1,tradeModifierFriendly:.92,tradeModifierLiked:.85,tradeModifierRevered:.8,repPerCredit:.01,maxRepPerVisit:10},emergencyRescue:{towFee:500,fuelDropFee:800,fuelDropLitres:15},economies:{minFactor:.75,maxFactor:1.25},miniGames:{maxHullDamageFraction:.05,abandonDamageFraction:.05,noDamageThreshold:90,surface:{gravityAccel:3,airResistance:.5,thrustForce:8,maxSafeSpeed:3,crashSpeed:10,offPadScoreMultiplier:.5,padWidth:6,maxSpeed:15},asteroid:{thrustForce:8,maxSafeSpeed:4,crashSpeed:12,offPadScoreMultiplier:.5,padWidth:6,initialDownwardVelocity:2,maxSpeed:15}}};function nh(n){const e={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},balance:{...Hi},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],economies:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[t,i]of Object.entries(n)){const s=t.split("/").pop()??"";if(s==="_template.md"||s===".gitkeep")continue;const{data:r,content:o}=eh(i);/^systems\/[^/]+\.md$/.test(t)?e.systems.push(th(r,o)):/^destinations\/[^/]+\.md$/.test(t)?e.destinations.push(ih(r,o)):/^factions\/[^/]+\.md$/.test(t)?e.factions.push(sh(r,o)):/^ships\/[^/]+\.md$/.test(t)?e.ships.push(rh(r,o)):t==="ships/components/jump-drives.md"?e.drives=oh(r):t==="navigation/jump-routes.md"?e.routes=ah(r):t==="commodities.md"?e.commodities=lh(r):t==="economies.md"?e.economies=ph(r):/^story\/[^/]+\.md$/.test(t)?e.storyBeats.push(ch(r,o)):t==="settings/new-game.md"?e.settings=hh(r):t==="settings/balance.md"?e.balance=gh(r):t==="delivery-items.md"?e.deliveryItems=dh(r):t==="npc-names.md"&&(e.npcNames=uh(r))}return e}function ln(n){const e=[];let t=!1;for(const i of n.split(`
`)){const s=i.trim();if(!s.startsWith("#"))if(s===""){if(t)break}else t=!0,e.push(s)}return e.join(" ")}function th(n,e){return{id:n.id,name:n.name,starType:n.star_type,distanceFromSol:n.distance_from_sol,zone:n.zone,security:n.security,population:n.population,dangerLevel:n.danger_level,playerKnowledge:n.player_knowledge,economies:n.economies??[],majorFactions:n.major_factions??[],destinations:n.destinations??[],tags:n.tags??[],description:ln(e)}}function ih(n,e){const t=n.amenities??{},i={trader:t.trader??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:n.id,name:n.name,system:n.system,locationType:n.location_type,type:n.type,amenities:i,npcs:n.npcs??{},minMissions:n.min_missions??0,missionChance:n.mission_chance??0,dangerLevel:n.danger_level,tags:n.tags??[],description:ln(e),owningFactionId:n.owning_faction,difficultyMultiplier:n.difficulty_multiplier!==void 0?parseFloat(n.difficulty_multiplier):void 0}}function sh(n,e){return{id:n.id,name:n.name,type:n.type,homeSystem:n.home_system,size:n.size,influence:n.influence??[],tags:n.tags??[],description:ln(e),rivals:n.rivals??[],allies:n.allies??[]}}function rh(n,e){return{id:n.id,name:n.name,class:n.class,cost:n.cost,cargoCapacityKg:n.cargo_capacity_kg,fuelCapacityL:n.fuel_capacity_l,hullPoints:n.hull_points,defaultJumpDrive:n.default_jump_drive,fuelEfficiency:n.fuel_efficiency,tags:n.tags??[],description:ln(e)}}function oh(n){return(n.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function ah(n){return(n.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function lh(n){return(n.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function ch(n,e){return{id:n.id,title:n.title,trigger:n.trigger,type:n.type,location:n.location,skippable:n.skippable,playerKnowledge:n.player_knowledge,text:e.trim()}}function hh(n){var e,t,i,s;return{player:{name:((e=n.player)==null?void 0:e.name)??"Captain",startingCredits:((t=n.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((i=n.starting_location)==null?void 0:i.system)??"",destination:((s=n.starting_location)==null?void 0:s.destination)??""},startingShip:n.starting_ship??""}}function dh(n){return(n.delivery_items??[]).map(t=>({id:t.id,name:t.name,weightKg:t.weight_kg}))}function uh(n){const e=n.npc_names??{};return{special:e.special??[],firstNames:e.first_names??[],lastNames:e.last_names??[]}}function ph(n){return(n.economies??[]).map(t=>({id:t.id,summary:t.summary,commodities:(t.commodities??[]).map(i=>({id:i.id,factor:i.factor}))}))}function mh(n,e){return{gravityAccel:n.gravity_accel??e.gravityAccel,airResistance:n.air_resistance??e.airResistance,thrustForce:n.thrust_force??e.thrustForce,maxSafeSpeed:n.max_safe_speed??e.maxSafeSpeed,crashSpeed:n.crash_speed??e.crashSpeed,offPadScoreMultiplier:n.off_pad_score_multiplier??e.offPadScoreMultiplier,padWidth:n.pad_width??e.padWidth,maxSpeed:n.max_speed??e.maxSpeed}}function fh(n,e){return{thrustForce:n.thrust_force??e.thrustForce,maxSafeSpeed:n.max_safe_speed??e.maxSafeSpeed,crashSpeed:n.crash_speed??e.crashSpeed,offPadScoreMultiplier:n.off_pad_score_multiplier??e.offPadScoreMultiplier,padWidth:n.pad_width??e.padWidth,initialDownwardVelocity:n.initial_downward_velocity??e.initialDownwardVelocity,maxSpeed:n.max_speed??e.maxSpeed}}function gh(n){const e=Hi,t=n.npc??{},i=n.missions??{},s=n.trading??{},r=n.fuel??{},o=n.reputation??{},a=n.emergency_rescue??{},l=n.economies??{},c=n.mini_games??{};return{npc:{specialNameChance:t.special_name_chance??e.npc.specialNameChance},missions:{boardMaxCount:i.board_max_count??e.missions.boardMaxCount,missionTtlMs:i.mission_ttl_ms??e.missions.missionTtlMs,deliveryChance:i.delivery_chance??e.missions.deliveryChance,deliveryBaseReward:i.delivery_base_reward??e.missions.deliveryBaseReward,deliveryRandomReward:i.delivery_random_reward??e.missions.deliveryRandomReward,supplyRewardMultiplierMin:i.supply_reward_multiplier_min??e.missions.supplyRewardMultiplierMin,supplyRewardMultiplierMax:i.supply_reward_multiplier_max??e.missions.supplyRewardMultiplierMax,supplyRequirementsMin:i.supply_requirements_min??e.missions.supplyRequirementsMin,supplyRequirementsMax:i.supply_requirements_max??e.missions.supplyRequirementsMax,supplyQtyMin:i.supply_qty_min??e.missions.supplyQtyMin,supplyQtyMax:i.supply_qty_max??e.missions.supplyQtyMax,deliveryDepositFraction:i.delivery_deposit_fraction??e.missions.deliveryDepositFraction},trading:{stockCountMin:s.stock_count_min??e.trading.stockCountMin,stockCountMax:s.stock_count_max??e.trading.stockCountMax,stockQtyMin:s.stock_qty_min??e.trading.stockQtyMin,stockQtyMax:s.stock_qty_max??e.trading.stockQtyMax,stockTtlMs:s.stock_ttl_ms??e.trading.stockTtlMs,stockRepCountBonusPerLevel:s.stock_rep_count_bonus_per_level??e.trading.stockRepCountBonusPerLevel,stockRepCountBonusMin:s.stock_rep_count_bonus_min??e.trading.stockRepCountBonusMin,stockRepCountBonusMax:s.stock_rep_count_bonus_max??e.trading.stockRepCountBonusMax,stockRepQtyBonusPerLevel:s.stock_rep_qty_bonus_per_level??e.trading.stockRepQtyBonusPerLevel,stockRepQtyBonusMin:s.stock_rep_qty_bonus_min??e.trading.stockRepQtyBonusMin,stockRepQtyBonusMax:s.stock_rep_qty_bonus_max??e.trading.stockRepQtyBonusMax},fuel:{pricePerLitre:r.price_per_litre??e.fuel.pricePerLitre,consumptionPerLy:r.consumption_per_ly??e.fuel.consumptionPerLy,inSystemBaseConsumptionL:r.in_system_base_consumption_l??e.fuel.inSystemBaseConsumptionL},reputation:{levelUnfriendlyMin:o.level_unfriendly_min??e.reputation.levelUnfriendlyMin,levelNeutralMin:o.level_neutral_min??e.reputation.levelNeutralMin,levelFriendlyMin:o.level_friendly_min??e.reputation.levelFriendlyMin,levelLikedMin:o.level_liked_min??e.reputation.levelLikedMin,levelReveredMin:o.level_revered_min??e.reputation.levelReveredMin,pointsMin:o.points_min??e.reputation.pointsMin,pointsMax:o.points_max??e.reputation.pointsMax,missionDeltaSmall:o.mission_delta_small??e.reputation.missionDeltaSmall,missionDeltaMedium:o.mission_delta_medium??e.reputation.missionDeltaMedium,missionDeltaLarge:o.mission_delta_large??e.reputation.missionDeltaLarge,missionTierMediumReward:o.mission_tier_medium_reward??e.reputation.missionTierMediumReward,missionTierLargeReward:o.mission_tier_large_reward??e.reputation.missionTierLargeReward,tradeModifierHated:o.trade_modifier_hated??e.reputation.tradeModifierHated,tradeModifierUnfriendly:o.trade_modifier_unfriendly??e.reputation.tradeModifierUnfriendly,tradeModifierNeutral:o.trade_modifier_neutral??e.reputation.tradeModifierNeutral,tradeModifierFriendly:o.trade_modifier_friendly??e.reputation.tradeModifierFriendly,tradeModifierLiked:o.trade_modifier_liked??e.reputation.tradeModifierLiked,tradeModifierRevered:o.trade_modifier_revered??e.reputation.tradeModifierRevered,repPerCredit:o.rep_per_credit??e.reputation.repPerCredit,maxRepPerVisit:o.max_rep_per_visit??e.reputation.maxRepPerVisit},emergencyRescue:{towFee:a.tow_fee??e.emergencyRescue.towFee,fuelDropFee:a.fuel_drop_fee??e.emergencyRescue.fuelDropFee,fuelDropLitres:a.fuel_drop_litres??e.emergencyRescue.fuelDropLitres},economies:{minFactor:l.min_factor??e.economies.minFactor,maxFactor:l.max_factor??e.economies.maxFactor},miniGames:{maxHullDamageFraction:c.max_hull_damage_fraction??e.miniGames.maxHullDamageFraction,abandonDamageFraction:c.abandon_damage_fraction??e.miniGames.abandonDamageFraction,noDamageThreshold:c.no_damage_threshold??e.miniGames.noDamageThreshold,surface:mh(c.surface??{},e.miniGames.surface),asteroid:fh(c.asteroid??{},e.miniGames.asteroid)}}}function yh(){const n=Object.assign({"/docs/world/commodities.md":io,"/docs/world/delivery-items.md":so,"/docs/world/destinations/_template.md":ro,"/docs/world/destinations/blackwake-yard.md":oo,"/docs/world/destinations/ceti-landfall.md":ao,"/docs/world/destinations/drift-market.md":lo,"/docs/world/destinations/elysium-station.md":co,"/docs/world/destinations/eridani-anchorage.md":ho,"/docs/world/destinations/foundries-platform.md":uo,"/docs/world/destinations/galileo-transfer.md":po,"/docs/world/destinations/hestia-ring.md":mo,"/docs/world/destinations/keelhaul-station.md":fo,"/docs/world/destinations/kepler-yard.md":go,"/docs/world/destinations/mars-anchor.md":yo,"/docs/world/destinations/meridian-station.md":_o,"/docs/world/destinations/new-horizon-port.md":bo,"/docs/world/destinations/orrery-anchorage.md":vo,"/docs/world/destinations/redline-station.md":wo,"/docs/world/destinations/tycho-orbital.md":ko,"/docs/world/destinations/veil-station.md":xo,"/docs/world/destinations/waypoint-ceti.md":Co,"/docs/world/economies.md":To,"/docs/world/factions/_template.md":Mo,"/docs/world/factions/centauri-trade-league.md":So,"/docs/world/factions/eridani-colonial-council.md":Io,"/docs/world/factions/free-captains.md":Ao,"/docs/world/factions/grey-market-cartel.md":Ro,"/docs/world/factions/helios-directorate.md":Eo,"/docs/world/factions/independent-miners-guild.md":Lo,"/docs/world/factions/procyon-institute.md":Fo,"/docs/world/factions/terran-union.md":Do,"/docs/world/galaxy-map.md":No,"/docs/world/navigation/jump-routes.md":Oo,"/docs/world/npc-names.md":Po,"/docs/world/settings/balance.md":Ho,"/docs/world/settings/new-game.md":Bo,"/docs/world/ships/_template.md":Uo,"/docs/world/ships/components/jump-drives.md":Go,"/docs/world/ships/freighter.md":$o,"/docs/world/ships/hauler.md":Wo,"/docs/world/ships/scout.md":Ko,"/docs/world/story/_template.md":jo,"/docs/world/story/enter-wolf-359.md":Yo,"/docs/world/story/first-jump.md":qo,"/docs/world/story/opening-arrival.md":Vo,"/docs/world/systems/_template.md":zo,"/docs/world/systems/alpha-centauri.md":Xo,"/docs/world/systems/barnards-star.md":Qo,"/docs/world/systems/epsilon-eridani.md":Jo,"/docs/world/systems/procyon.md":Zo,"/docs/world/systems/sirius.md":ea,"/docs/world/systems/sol.md":na,"/docs/world/systems/tau-ceti.md":ta,"/docs/world/systems/wolf-359.md":ia}),e={};for(const[t,i]of Object.entries(n)){const s=t.replace("/docs/world/","");e[s]=i}return nh(e)}es(yh());const _h=navigator.maxTouchPoints>0?"touch":"keyboard",bh=new URLSearchParams(window.location.search).has("debug"),Bi={environment:"browser",primaryInput:_h,debug:bh},vh=new ji,Ui=new zi(Bi);Ui.connect();const wh=new to(vh,Ui,Bi);let jt=0;function Gi(n){wh.tick(n-jt),jt=n,requestAnimationFrame(Gi)}requestAnimationFrame(Gi);
