(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(o){if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();const Te=40,$e=30,Vi=50,pt=24;function qi(t){return t==="&"?"&amp;":t==="<"?"&lt;":t===">"?"&gt;":t}class Xi{constructor(){this.charW=0,this.charH=0,this.gridH=$e,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(Te),this.pre.dataset.gridRows=String($e),document.body.appendChild(this.pre);const e=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${pt}px "Share Tech Mono"`).catch(()=>null)]).then(e),document.fonts.addEventListener("loadingdone",e),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const e=document.createElement("span");e.style.fontFamily="'Share Tech Mono', monospace",e.style.fontSize=`${pt}px`,e.style.lineHeight="1em",e.style.position="absolute",e.style.visibility="hidden",e.textContent="M",document.body.appendChild(e);const n=e.getBoundingClientRect();document.body.removeChild(e),this.charW=n.width,this.charH=n.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const e=Math.min(window.innerWidth/(Te*this.charW),window.innerHeight/($e*this.charH)),n=Math.max($e,Math.min(Vi,Math.floor(window.innerHeight/(this.charH*e))));if(this.pre.style.fontSize=`${pt*e}px`,this.pre.style.width=`${Te*this.charW*e}px`,n!==this.gridH){this.gridH=n,this.pre.dataset.gridRows=String(n);for(const i of this.resizeHandlers)i(Te,n)}}onResize(e){this.resizeHandlers.push(e)}drawBuffer(e){const n=[];for(const i of e){let o="";for(const r of i){const s=r.fg!=="transparent"?`fg-${r.fg}`:"",a=r.bg!=="transparent"?`bg-${r.bg}`:"",c=s&&a?`${s} ${a}`:s||a,l=c?` class="${c}"`:"";o+=`<span${l}>${qi(r.char)}</span>`}n.push(o)}this.pre.innerHTML=n.join(`
`)}getWidth(){return Te}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}destroy(){this.pre.remove()}}const zi={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",m:"MENU",M:"MENU",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},Qi=new Set(["0","1","2","3","4","5","6","7","8","9"]),Ji=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class Zi{constructor(e){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.touchTrackHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerMoveListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=e.debug}logDebug(e){if(this.debugMode){if(this.debugLog.unshift(e),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const n=document.createElement("div");n.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(n),this.debugEl=n}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(e){this.actionHandlers.push(e)}onTap(e){this.tapHandlers.push(e)}onCharInput(e){this.charInputHandlers.push(e)}onTouchTrack(e){this.touchTrackHandlers.push(e)}connect(){this.keyListener=e=>{if(Ji.has(e.key)&&e.preventDefault(),Qi.has(e.key))for(const i of this.charInputHandlers.slice())i(e.key);if(e.key==="Backspace"||e.key==="Delete"){for(const i of this.charInputHandlers.slice())i("\b");return}const n=zi[e.key];if(n)for(const i of this.actionHandlers.slice())i(n)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=e=>{if(e.preventDefault(),this.pointerStartMap.set(e.pointerId,{startX:e.clientX,startY:e.clientY}),this.activePointers.add(e.pointerId),this.logDebug(`DOWN id=${e.pointerId} (${Math.round(e.clientX)},${Math.round(e.clientY)}) type=${e.pointerType} active=${this.activePointers.size}`),this.touchTrackHandlers.length>0){const n=this.getGridCoordsForTrack(e.clientX,e.clientY);if(n)for(const i of this.touchTrackHandlers.slice())i.start(n.col,n.row,e.pointerId)}},this.pointerMoveListener=e=>{if(this.pointerStartMap.has(e.pointerId)&&this.touchTrackHandlers.length>0){const n=this.getGridCoordsForTrack(e.clientX,e.clientY);if(n)for(const i of this.touchTrackHandlers.slice())i.move(n.col,n.row,e.pointerId)}},this.pointerUpListener=e=>{const n=this.pointerStartMap.get(e.pointerId),i=this.activePointers.size;if(this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId),this.touchTrackHandlers.length>0)for(const c of this.touchTrackHandlers.slice())c.end(e.pointerId);if(!n){this.logDebug(`UP id=${e.pointerId} NO START`);return}const o=e.clientX-n.startX,r=e.clientY-n.startY,s=Math.abs(o),a=Math.abs(r);if(s<20&&a<20)if(i>=2){this.logDebug(`UP id=${e.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const c of this.actionHandlers.slice())c("BACK")}else{const c=this.getRectInfo(),l=this.getGridCoords(n.startX,n.startY);if(l){this.logDebug(`TAP (${Math.round(n.startX)},${Math.round(n.startY)}) rect=${c} -> col=${l.col} row=${l.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(l.col,l.row)}else this.logDebug(`TAP (${Math.round(n.startX)},${Math.round(n.startY)}) rect=${c} -> OOB`)}else{if(this.touchTrackHandlers.length>0){this.logDebug(`DRAG-END (joystick) dx=${Math.round(o)} dy=${Math.round(r)} -> suppressed`);return}let c;s>=a?c=o>0?"RIGHT":"LEFT":c=r>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(o)} dy=${Math.round(r)} -> ${c}`);for(const l of this.actionHandlers.slice())l(c)}},this.pointerCancelListener=e=>{if(this.logDebug(`CANCEL id=${e.pointerId}`),this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId),this.touchTrackHandlers.length>0)for(const n of this.touchTrackHandlers.slice())n.end(e.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointermove",this.pointerMoveListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerMoveListener&&(window.removeEventListener("pointermove",this.pointerMoveListener),this.pointerMoveListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const e=document.querySelector(".game-screen");if(!e)return"NO PRE";const n=e.getBoundingClientRect();return`L${Math.round(n.left)},T${Math.round(n.top)},R${Math.round(n.right)},B${Math.round(n.bottom)}`}getGridCoords(e,n){const i=document.querySelector(".game-screen");if(!i)return null;const o=i.getBoundingClientRect(),r=parseInt(i.dataset.gridCols??"1"),s=parseInt(i.dataset.gridRows??"1");if(!r||!s||!o.width||!o.height)return null;const a=Math.floor((e-o.left)/(o.width/r)),c=Math.floor((n-o.top)/(o.height/s));return a<0||a>=r||c<0||c>=s?null:{col:a,row:c}}getGridCoordsForTrack(e,n){const i=document.querySelector(".game-screen");if(!i)return null;const o=i.getBoundingClientRect(),r=parseInt(i.dataset.gridCols??"1"),s=parseInt(i.dataset.gridRows??"1");if(!r||!s||!o.width||!o.height)return null;const a=Math.floor((e-o.left)/(o.width/r)),c=Math.floor((n-o.top)/(o.height/s));return{col:a,row:c}}}function g(t,e,n,i,o,r){if(e<0||e>=t.length)return;const s=t[e];for(let a=0;a<i.length;a++){const c=n+a;c>=0&&c<s.length&&(s[c]={char:i[a],fg:o,bg:r})}}function L(t,e,n,i,o){if(e<0||e>=t.length)return;const r=t[e].length,s=Math.max(0,Math.floor((r-n.length)/2));g(t,e,s,n,i,o)}function De(t,e){const n=t.split(/\s+/).filter(Boolean),i=[];let o="";for(const r of n)o.length===0?o=r:o.length+1+r.length<=e?o+=" "+r:(i.push(o),o=r);return o.length>0&&i.push(o),i}function ge(t,e,n,i="bright-black"){g(t,e,0,"-".repeat(n),i,"black")}function zn(t,e,n,i,o){const r=`${i+1}/${o}`;g(t,e,0,"|<|","white","black");const s=Math.floor((n-r.length)/2);g(t,e,s,r,"bright-black","black"),g(t,e,n-3,"|>|","white","black")}const Wt=["UNTITLED","SPACE GAME"],eo=4,to=3,no="- An ASCII space adventure -",io=11,Kt=16;class Yt{constructor(e,n,i,o){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,o()}}],n.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),e.onAction(r=>{this.activated||(r==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:r==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:r==="SELECT"&&this.items[this.cursorIdx].action())}),e.onTap&&e.onTap((r,s)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(s===Kt+a){this.cursorIdx=a,this.items[a].action();return}}})}update(e){}render(e){const n=e.length,i=n>0?e[0].length:0;for(let s=0;s<n;s++)for(let a=0;a<i;a++)e[s][a]={char:" ",fg:"black",bg:"black"};for(let s=0;s<Wt.length;s++)L(e,eo+s*to,Wt[s],"bright-cyan","black");L(e,io,no,"white","black");const o=this.items.reduce((s,a)=>Math.max(s,a.label.length+2),0),r=Math.max(0,Math.floor((i-o)/2));for(let s=0;s<this.items.length;s++){const a=Kt+s;if(a>=n)continue;const c=s===this.cursorIdx,l=c?"> ":"  ",h=c?"bright-green":"white";g(e,a,r,l+this.items[s].label,h,"black")}}}let kt=null;function oo(t){kt=t}function D(){if(kt===null)throw new Error("World not initialised — call initWorld() before accessing world data");return kt}function Q(t){return D().systems.find(e=>e.id===t)}function N(t){return D().destinations.find(e=>e.id===t)}function At(t){return D().routes.filter(e=>e.from===t||e.to===t)}function Qn(t){return D().drives.find(e=>e.id===t)}function ro(t){return D().storyBeats.filter(e=>e.trigger===t)}function Jn(){return D().settings}function F(){return D().balance}function ze(t){return D().ships.find(e=>e.id===t)}function Qe(t,e){return D().routes.find(n=>n.from===t&&n.to===e||n.from===e&&n.to===t)}function Zn(t){return D().factions.find(e=>e.id===t)}function de(t){return D().commodities.find(e=>e.id===t)}function so(){return D().commodities}function ao(){return D().systems.filter(t=>t.playerKnowledge==="public")}function co(t){return t.reduce((e,n)=>{const i=de(n.commodityId);return e+n.qty*((i==null?void 0:i.weightKg)??0)},0)}function lo(t){return D().economies.find(e=>e.id===t)}function et(t,e){const n=F(),i=[];for(const r of e.economies){const s=lo(r);if(s){for(const a of s.commodities)if(a.id===t){i.push(a.factor);break}}}const o=i.length===0?1:i.reduce((r,s)=>r+s,0)/i.length;return Math.max(n.economies.minFactor,Math.min(n.economies.maxFactor,o))}const X=3,jt=0;function Rt(t,e){return e?t-2:t}function ho(t){return t.toLocaleString("en-US")}class uo{constructor(e,n){this.buttonRanges=null,this.footerRow=-1,this.headerWidth=-1,this.context=e,this.player=n}render(e,n){const i=e.length,o=i>0?e[0].length:0;this.footerRow=-1,this.buttonRanges=null,n.showHeader?(this.headerWidth=o,this.renderHeaderRow0(e,o,n.systemLabel),this.renderHeaderRow1(e,o,n.destinationLabel)):this.headerWidth=-1,n.showFooter&&(this.renderFooter(e,i,o,n.navOptions),this.footerRow=i-1)}renderHeaderRow0(e,n,i){const o=i!==void 0?i??"":(()=>{const l=Q(this.player.systemId);return l?l.name.toUpperCase():this.player.systemId.toUpperCase()})(),r="::";g(e,0,0,r,"bright-black","black"),g(e,0,r.length,o,"bright-cyan","black");const a=n-r.length-o.length-10;let c=r.length+o.length;for(let l=0;l<a;l++)e[0][c+l]={char:":",fg:"bright-black",bg:"black"};c+=a,g(e,0,c,"[M]","white","black"),c+=3,g(e,0,c," MENU","white","black"),c+=5,g(e,0,c,"::","bright-black","black")}renderHeaderRow1(e,n,i){const o=i!==void 0?i??"":(()=>{const h=this.player.destinationId?N(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),r=ho(this.player.credits),s=r.length+5,a="::";g(e,1,0,a,"bright-black","black"),g(e,1,a.length,o,"cyan","black");const c=n-a.length-o.length-s;let l=a.length+o.length;for(let h=0;h<c;h++)e[1][l+h]={char:":",fg:"bright-black",bg:"black"};l+=c,g(e,1,l,r,"green","black"),l+=r.length,g(e,1,l," CR","white","black"),l+=3,g(e,1,l,"::","bright-black","black")}renderFooter(e,n,i,o){const r=n-1,s=[];if(o.length===0){for(let c=0;c<i;c++)e[r][c]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}g(e,r,0,"::","bright-black","black");let a=2;for(let c=0;c<o.length;c++){c>0&&(g(e,r,a,"::","bright-black","black"),a+=2);const l=o[c],h=`[${c+1}]`,d=` ${l.label}`,p=a;g(e,r,a,h,"white","black"),a+=h.length,g(e,r,a,d,"white","black"),a+=d.length,s.push({id:l.id,startCol:p,endCol:a})}for(let c=a;c<i;c++)e[r][c]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=s}hitTestNav(e,n){if(this.footerRow<0||this.buttonRanges===null||n!==this.footerRow)return null;for(const i of this.buttonRanges)if(e>=i.startCol&&e<i.endCol)return i.id;return null}hitTestHeader(e,n){if(this.headerWidth<0||n!==0)return null;const i=this.headerWidth-10,o=this.headerWidth-2;return e>=i&&e<o?"menu":null}}class J{constructor(e,n,i,o){this.activeTabIdx=0,this.activated=!1,this.player=i,this.chrome=new uo(n,i),this.opts=o,e.onCharInput&&e.onCharInput(r=>{this.activated||this.handleCharInput(r)}),e.onAction(r=>{if(!this.activated&&!this.preHandleAction(r)){if(r==="MENU"&&o.onMenu){o.onMenu();return}if(o.tabs){if(r==="LEFT"){const s=Math.max(0,this.activeTabIdx-1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}if(r==="RIGHT"){const s=Math.min(o.tabs.length-1,this.activeTabIdx+1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}}this.handleAction(r)}}),e.onTap&&e.onTap((r,s)=>{var c;if(this.activated||this.preHandleTap(r,s))return;const a=this.chrome.hitTestNav(r,s);if(a!==null){this.handleNavTap(a);return}if(this.chrome.hitTestHeader(r,s)==="menu"&&o.onMenu){o.onMenu();return}if(o.tabs&&o.title!==void 0){const l=o.showHeader??!0?X:jt,h=((c=o.summary)==null?void 0:c.length)??0,d=l+3+h;if(s===d){let p=3;for(let u=0;u<o.tabs.length;u++){const m=o.tabs[u].length+2;if(r>=p&&r<p+m){u!==this.activeTabIdx&&(this.activeTabIdx=u,this.onTabChange(u));return}p+=m+1}return}}this.handleTap(r,s)})}preHandleAction(e){return!1}preHandleTap(e,n){return!1}handleAction(e){}handleTap(e,n){}handleNavTap(e){}handleCharInput(e){}onTabChange(e){}buildChromeConfig(){return{showHeader:this.opts.showHeader??!0,showFooter:this.opts.showFooter??!0,navOptions:this.opts.navOptions}}suspend(){this.activated=!0}resume(){this.activated=!1}update(e){}render(e){var p;const n=e.length,i=n>0?e[0].length:0,o=this.opts;for(let u=0;u<n;u++)for(let m=0;m<i;m++)e[u][m]={char:" ",fg:"black",bg:"black"};const r=this.buildChromeConfig();this.chrome.render(e,r);const s=o.showHeader??!0,a=o.showFooter??!0,c=s?X:jt,l=((p=o.summary)==null?void 0:p.length)??0,h=Rt(n,a);let d;if(o.title!==void 0){g(e,c,2,o.title,"bright-white","black"),g(e,c+1,2,"'".repeat(o.title.length),"bright-black","black");for(let u=0;u<l;u++)g(e,c+2+u,2,o.summary[u],"bright-black","black");if(o.tabs){const u=c+3+l;let m=2;u<n&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++;for(let f=0;f<o.tabs.length;f++){const y=f===this.activeTabIdx,b=` ${o.tabs[f]} `,x=y?"black":"white",_=y?"green":"black";for(const k of b)u<n&&m<i&&(e[u][m]={char:k,fg:x,bg:_}),m++;u<n&&m<i&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++}d=c+5+l}else d=c+3+l}else d=c;this.renderContent(e,d,h)}}class pe extends J{constructor(e,n,i,o,r,s,a=[],c=null,l){super(o,r,s,{navOptions:i,title:e,summary:a,tabs:c!==null?c.map(d=>d.label):void 0,onMenu:l}),this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.modal=null,this.lastContentTop=0,this._staticItems=n,this.tabs=c,this.infoLines=a;const h=a.length;this.lastContentTop=c!==null?X+5+h:X+3+h,this.resetCursor()}get items(){var e;return this.tabs!==null?((e=this.tabs[this.activeTabIdx])==null?void 0:e.items)??[]:this._staticItems}preHandleAction(e){return this.modal!==null?(this.modal.handleAction(e),!0):!1}preHandleTap(e,n){return this.modal!==null?(this.modal.handleTap(e,n),!0):!1}handleCharInput(e){this.modal!==null&&this.modal.handleCharInput(e)}onTabChange(e){this.resetCursor()}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):e==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):e==="SELECT"?this.activateCurrent():this.handleNavAction(e)}handleTap(e,n){const i=this.rowToVisibleItemIndex(n);i!==null&&!this.items[i].disabled&&(this.cursorIdx=i,this.activateCurrent())}moveCursor(e){const n=this.items,i=n.length;if(i===0)return;const o=this.cursorIdx===-1?e>0?i-1:0:this.cursorIdx;for(let r=0;r<i;r++){const s=((o+e*(r+1))%i+i)%i;if(!n[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const e=this.items[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}rowToVisibleItemIndex(e){var o,r;let n=this.lastContentTop;const i=this.items;for(let s=0;s<i.length;s++){const a=1+(((o=i[s].details)==null?void 0:o.length)??0)+(((r=i[s].detailsColored)==null?void 0:r.length)??0);if(e>=n&&e<n+a)return s;n+=a}return null}resetCursor(){const e=this.items;for(let n=0;n<e.length;n++)if(!e[n].disabled){this.cursorIdx=n;return}this.cursorIdx=-1}handleNavAction(e){}openModal(e){this.modal=e,this.activated=!1}closeModal(){this.modal=null}renderContent(e,n,i){var x,_,k,v;this.lastContentTop=n;const r=e.length>0?e[0].length:0,s=i-1,a=s-n,c=this.items,l=c.map(C=>{var w,T;return 1+(((w=C.details)==null?void 0:w.length)??0)+(((T=C.detailsColored)==null?void 0:T.length)??0)}),d=l.reduce((C,w)=>C+w,0)>a,p=d?a-1:a,u=[];let m=[],f=0;for(let C=0;C<l.length;C++)f+l[C]>p?(m.length>0&&u.push(m),m=[C],f=l[C]):(m.push(C),f+=l[C]);m.length>0&&u.push(m),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const y=u[this.pageIndex]??[];let b=n;for(const C of y){const w=c[C],T=C===this.cursorIdx,O=w.disabled?"bright-black":T?"bright-green":w.accentFg??"white",K=w.infoFg??O,P=r-4;if(w.icon!==void 0){const S=w.icon.length;if(g(e,b,2,T?">":" ",O,"black"),g(e,b,3,w.icon,w.iconFg??O,"black"),w.info!==void 0){const E=w.info.length,A=Math.max(0,P-1-S-2-E-1),M=w.label.length>A?w.label.slice(0,A):w.label,Y=Math.max(1,P-1-S-M.length-2-E);g(e,b,3+S,M+" ",O,"black"),g(e,b,3+S+M.length+1,".".repeat(Y),"bright-black","black"),g(e,b,3+S+M.length+1+Y+1,w.info,K,"black")}else g(e,b,3+S,w.label.slice(0,P-1-S),O,"black");for(let E=0;E<(((x=w.details)==null?void 0:x.length)??0);E++)b+1+E<=s&&g(e,b+1+E,2,("  "+w.details[E]).slice(0,P),w.detailsFg??"bright-black","black")}else if(w.info!==void 0){const S=T?"> ":"  ",R=Math.max(1,P-2-w.label.length-2-w.info.length);g(e,b,2,S+w.label+" ",O,"black"),g(e,b,2+S.length+w.label.length+1,".".repeat(R),"bright-black","black"),g(e,b,2+S.length+w.label.length+1+R+1,w.info,K,"black")}else if(w.details!==void 0&&w.details.length>0){g(e,b,2,((T?"> ":"  ")+w.label).slice(0,P),O,"black");for(let R=0;R<w.details.length;R++)b+1+R<=s&&g(e,b+1+R,2,("  "+w.details[R]).slice(0,P),w.detailsFg??"bright-black","black")}else g(e,b,2,((T?"> ":"  ")+w.label).slice(0,P),O,"black");const G=((_=w.details)==null?void 0:_.length)??0;for(let S=0;S<(((k=w.detailsColored)==null?void 0:k.length)??0);S++){const R=b+1+G+S;if(R<=s){const E=w.detailsColored[S];let A=4;for(const M of E.left)g(e,R,A,M.text,M.fg,"black"),A+=M.text.length;if(E.right!==void 0){const M=P-4-E.right.text.length;g(e,R,M,E.right.text,E.right.fg,"black")}}}b+=1+G+(((v=w.detailsColored)==null?void 0:v.length)??0)}d&&zn(e,s,r,this.pageIndex,this.lastPageCount),this.modal!==null&&this.modal.render(e)}}class Vt extends pe{constructor(e,n,i,o,r){const s=o.length===0?[{label:"NO OPTIONS AVAILABLE",disabled:!0,action:()=>{}}]:o.map(a=>({label:a.label,action:a.action}));super("MENU",s,[{id:"game",label:"GAME"}],e,n,i,[],null,r),this.onClose=r}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onClose())}handleNavTap(e){e==="game"&&!this.activated&&(this.activated=!0,this.onClose())}}function me(t){return t.size==="medium"||t.size==="large"}function Ee(t,e){return t>=e.reputation.levelReveredMin?3:t>=e.reputation.levelLikedMin?2:t>=e.reputation.levelFriendlyMin?1:t<e.reputation.levelUnfriendlyMin?-2:t<e.reputation.levelNeutralMin?-1:0}function ei(t){switch(t){case-2:return"HATED";case-1:return"UNFRIENDLY";case 0:return"NEUTRAL";case 1:return"FRIENDLY";case 2:return"LIKED";case 3:return"REVERED";default:return"NEUTRAL"}}function qt(t,e){switch(t){case-2:return e.reputation.tradeModifierHated;case-1:return e.reputation.tradeModifierUnfriendly;case 1:return e.reputation.tradeModifierFriendly;case 2:return e.reputation.tradeModifierLiked;case 3:return e.reputation.tradeModifierRevered;default:return e.reputation.tradeModifierNeutral}}function Et(t){return`${t<0?"":"+"}${t}`}function Lt(t,e,n){const i=new Map;i.set(t.id,e);const o=Math.floor(e/2);for(const s of t.allies)i.set(s,o);const r=-Math.floor(e/2);for(const s of t.rivals)i.set(s,r);return i}function Ae(t,e){return t.type==="delivery"?t.pickupComplete?e.destinationId===t.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":t.requirements.every(i=>{const o=e.cargoHold.find(r=>r.commodityId===i.commodityId);return o!==void 0&&o.qty>=i.qty})?"ready-to-deliver":"needs-supplies"}function po(t,e){if(e.type==="delivery"){if(t.cargoCapacity-t.cargoWeightKg<e.itemWeightKg)return{ok:!1,reason:"Insufficient cargo space"};if(t.credits<e.deposit)return{ok:!1,reason:"Insufficient credits for deposit"}}return{ok:!0}}class Ft{constructor(e){const n=ze(e.shipId);if(!n)throw new Error(`Unknown ship: ${e.shipId}`);this.shipId=e.shipId,this.driveId=e.driveId,this.fuelCapacityL=n.fuelCapacityL,this.cargoCapacity=n.cargoCapacityKg,this._fuelL=n.fuelCapacityL,this._credits=e.credits,this._systemId=e.systemId,this._destinationId=e.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[],this._hullIntegrity=1,this._factionReputation=new Map;for(const i of D().factions)me(i)&&this._factionReputation.set(i.id,0);this._destinationMissions=new Map}static createMock(){const e=Jn(),n=ze(e.startingShip);if(!n)throw new Error(`Unknown starting ship: ${e.startingShip}`);return new Ft({shipId:e.startingShip,driveId:n.defaultJumpDrive,credits:e.player.startingCredits,systemId:e.startingLocation.system,destinationId:e.startingLocation.destination})}get fuelL(){return this._fuelL}addFuel(e){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+e)}consumeFuel(e){this._fuelL=Math.max(0,this._fuelL-e)}getInSystemHopCost(){const e=ze(this.shipId),n=D().balance;return Math.ceil(n.fuel.inSystemBaseConsumptionL*e.fuelEfficiency)}get credits(){return this._credits}addCredits(e){this._credits+=e}spendCredits(e){this._credits-=e}get cargoHold(){return this._cargoHold}addCargo(e,n){const i=this._cargoHold.find(o=>o.commodityId===e);i?i.qty+=n:this._cargoHold.push({commodityId:e,qty:n})}removeCargo(e,n){const i=this._cargoHold.findIndex(o=>o.commodityId===e);i<0||(n!==void 0&&n<this._cargoHold[i].qty?this._cargoHold[i].qty-=n:this._cargoHold.splice(i,1))}get missionItemsWeightKg(){return this._missionItems.reduce((e,n)=>e+n.weightKg,0)}get cargoWeightKg(){return co(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(e){this._destinationId=e}undock(){this._destinationId=null}jumpTo(e){this._systemId=e,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(e,n){const i={...e,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(i),e.type==="delivery"&&(this._credits-=e.deposit,n&&(this._missionItems.push({missionId:e.id,itemName:e.itemName,weightKg:e.itemWeightKg}),i.pickupComplete=!0))}collectMissionItem(e){const n=this._activeMissions.find(i=>i.id===e);!n||n.type!=="delivery"||(n.pickupComplete=!0,this._missionItems.push({missionId:n.id,itemName:n.itemName,weightKg:n.itemWeightKg}))}completeMission(e){this._activeMissions=this._activeMissions.filter(n=>n.id!==e),this._missionItems=this._missionItems.filter(n=>n.missionId!==e)}cancelMission(e){this._activeMissions=this._activeMissions.filter(n=>n.id!==e),this._missionItems=this._missionItems.filter(n=>n.missionId!==e)}getMissionsForPickup(e){return this._activeMissions.filter(n=>n.type==="delivery"&&n.pickupDestinationId===e&&!n.pickupComplete)}getMissionsForDelivery(e){return this._activeMissions.filter(n=>n.deliveryDestinationId===e&&Ae(n,this)==="ready-to-deliver")}get hullIntegrity(){return this._hullIntegrity}applyHullDamage(e){this._hullIntegrity=Math.max(0,this._hullIntegrity-e)}getFactionReputation(e){return this._factionReputation.get(e)??0}modifyFactionReputation(e,n,i){const o=this.getFactionReputation(e),r=Math.min(i.reputation.pointsMax,Math.max(i.reputation.pointsMin,o+n));this._factionReputation.set(e,r)}getDestinationMissions(e){const n=this._destinationMissions.get(e);return n?Date.now()-n.generatedAt>D().balance.missions.missionTtlMs?[]:n.specs:[]}refreshDestinationMissions(e,n){this._destinationMissions.set(e,{specs:n,generatedAt:Date.now()})}}const Xt=40;class xt{constructor(e){this.focus="confirm",this.confirmRect=null,this.cancelRect=null,this.opts=e}handleAction(e){var n,i;if(e==="BACK"){this.opts.onConfirm();return}if(e==="LEFT"||e==="RIGHT"||e==="TAB"){this.opts.cancelLabel!==void 0&&(this.focus=this.focus==="confirm"?"cancel":"confirm");return}e==="SELECT"&&(this.focus==="cancel"?(i=(n=this.opts).onCancel)==null||i.call(n):this.opts.onConfirm())}handleCharInput(e){}handleTap(e,n){var i,o;this.confirmRect&&n===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.opts.onConfirm():this.cancelRect&&n===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&((o=(i=this.opts).onCancel)==null||o.call(i))}render(e){const n=e.length,i=n>0?e[0].length:0,{title:o,body:r,confirmLabel:s,cancelLabel:a}=this.opts,c=Xt-2,l=De(r,c),h=l.length,d=4+h+1+1+1,p=Xt,u=Math.floor((i-p)/2),m=Math.floor((n-d)/2);for(let v=0;v<d;v++)for(let C=0;C<p;C++){const w=m+v,T=u+C;w>=0&&w<n&&T>=0&&T<i&&(e[w][T]={char:" ",fg:"white",bg:"black"})}const f=(v,C,w)=>{v>=0&&v<n&&C>=0&&C<i&&(e[v][C]={char:w,fg:"white",bg:"black"})};f(m,u,"+"),f(m,u+p-1,"+");for(let v=1;v<p-1;v++)f(m,u+v,"-");f(m+d-1,u,"+"),f(m+d-1,u+p-1,"+");for(let v=1;v<p-1;v++)f(m+d-1,u+v,"-");for(let v=1;v<d-1;v++)f(m+v,u,"|"),f(m+v,u+p-1,"|");const y=o.slice(0,c),b=m+1,x=u+1+Math.floor((c-y.length)/2);g(e,b,x,y,"bright-white","black"),g(e,m+2,x,"'".repeat(y.length),"bright-black","black");for(let v=0;v<l.length;v++)g(e,m+4+v,u+1,l[v],"white","black");const _=m+4+h+1,k=`[ ${s} ]`;if(a!==void 0){const v=`[ ${a} ]`,C=2,w=k.length+C+v.length,T=Math.floor((c-w)/2),O=u+1+T,K=O+k.length+C;this.confirmRect={col:O,row:_,width:k.length},this.cancelRect={col:K,row:_,width:v.length};const P=this.focus==="confirm",G=this.focus==="cancel";g(e,_,O,k,P?"black":"white",P?"green":"black"),g(e,_,K,v,G?"black":"white",G?"green":"black")}else{const v=Math.floor((c-k.length)/2),C=u+1+v;this.confirmRect={col:C,row:_,width:k.length},this.cancelRect=null,g(e,_,C,k,"black","green")}}}const mo={delivery:"[D] ",supply:"[S] "},fo={"pending-pickup":"PENDING PICKUP","needs-supplies":"NEEDS SUPPLIES","in-transit":"IN TRANSIT","ready-to-deliver":"READY TO DELIVER"},go={"pending-pickup":"yellow","needs-supplies":"yellow","in-transit":"bright-black","ready-to-deliver":"bright-green"};class yo extends pe{constructor(e,n,i,o,r){super("MISSIONS",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,n,i,[],null,r),this.onBack=o,this.onGame=r}get items(){const e=this.player.activeMissions;return e.length===0?[{label:"NO ACTIVE MISSIONS",disabled:!0,action:()=>{}}]:this.sortMissions(e).map(i=>this.buildMenuItem(i))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const n=e[this.cursorIdx];n.disabled||n.action()}getStatusPriority(e){return e==="ready-to-deliver"?0:e==="needs-supplies"||e==="pending-pickup"?1:e==="in-transit"?2:3}sortMissions(e){return[...e].sort((n,i)=>{var d,p;const o=((d=N(n.deliveryDestinationId))==null?void 0:d.name)??n.deliveryDestinationId,r=((p=N(i.deliveryDestinationId))==null?void 0:p.name)??i.deliveryDestinationId,s=o.localeCompare(r);if(s!==0)return s;const a=Ae(n,this.player),c=Ae(i,this.player),l=this.getStatusPriority(a)-this.getStatusPriority(c);if(l!==0)return l;const h={delivery:0,supply:1};return h[n.type]-h[i.type]})}buildMenuItem(e){const n=Ae(e,this.player),i=N(e.deliveryDestinationId),o=(i==null?void 0:i.name)??e.deliveryDestinationId,r=fo[n]??n,s=go[n]??"white",a=[`Status: ${r}`,`Dest: ${o}`];e.type!=="supply"&&a.push("");const c=e.type==="supply"?this.buildSupplyDetails(e):[];return{label:e.title,icon:mo[e.type],iconFg:"bright-yellow",info:`${e.reward} CR`,infoFg:"bright-green",details:a,detailsFg:s,detailsColored:c,action:()=>this.openMissionModal(e)}}buildSupplyDetails(e){if(e.type!=="supply")return[];const n=e.requirements.map(i=>{const o=D().commodities.find(l=>l.id===i.commodityId),r=(o==null?void 0:o.name)??i.commodityId,s=this.player.cargoHold.find(l=>l.commodityId===i.commodityId),a=(s==null?void 0:s.qty)??0,c=a>=i.qty;return{left:[{text:`${i.qty}x ${r} `,fg:"white"},{text:`(have: ${a})`,fg:c?"bright-green":"bright-black"}]}});return n.push({left:[]}),n}openMissionModal(e){let n=e.description;if(e.giverFactionId){const i=D(),o=i.factions.find(r=>r.id===e.giverFactionId);if(o){const r=F(),s=e.reward;let a;s>=r.reputation.missionTierLargeReward?a=r.reputation.missionDeltaLarge:s>=r.reputation.missionTierMediumReward?a=r.reputation.missionDeltaMedium:a=r.reputation.missionDeltaSmall;const c=Lt(o,a,i.factions),l=[];for(const[h,d]of c){const p=i.factions.find(u=>u.id===h);p&&l.push({id:h,name:p.name,delta:d})}l.sort((h,d)=>h.delta!==d.delta?d.delta-h.delta:h.name.localeCompare(d.name)),n+=`

REPUTATION IMPACT:
`;for(const h of l){const d=Et(h.delta);n+=`  ${h.name.padEnd(20)} ${d}
`}}}this.openModal(new xt({title:e.title,body:n,confirmLabel:"OKAY",cancelLabel:"CANCEL MISSION",onConfirm:()=>this.closeModal(),onCancel:()=>{this.player.cancelMission(e.id),this.closeModal();const i=this.player.activeMissions.length;i===0?this.cursorIdx=-1:this.cursorIdx>=i&&(this.cursorIdx=i-1)}}))}handleNavAction(e){e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):(e==="BACK"||e==="NAV_2")&&!this.activated&&(this.activated=!0,this.onBack())}handleNavTap(e){e==="game"&&!this.activated?(this.activated=!0,this.onGame()):e==="menu"&&!this.activated&&(this.activated=!0,this.onBack())}}const Ct=20,_o="█",bo="░";function wo(t,e,n){return t<=e?0:t>=n?Ct:Math.round((t-e)/(n-e)*Ct)}const vo={[-2]:"red",[-1]:"bright-red",0:"white",1:"bright-green",2:"bright-green",3:"bright-cyan"};class ko extends pe{constructor(e,n,i,o,r){super("REPUTATION",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,n,i,[],null,r),this.onBack=o,this.onGame=r}get items(){const e=F(),i=D().factions.filter(o=>me(o));return i.sort((o,r)=>{if(o.size!==r.size){if(o.size==="large")return-1;if(r.size==="large")return 1}return o.name.localeCompare(r.name)}),i.map(o=>{const r=this.player.getFactionReputation(o.id),s=Ee(r,e),a=ei(s),c=vo[s]??"white",l=wo(r,e.reputation.pointsMin,e.reputation.levelReveredMin),h=Ct-l;return{label:o.name,info:a,infoFg:c,detailsColored:[{left:[{text:_o.repeat(l),fg:c},{text:bo.repeat(h),fg:"bright-black"}],right:{text:String(r),fg:"white"}},{left:[]}],action:()=>{}}})}activateCurrent(){}handleNavAction(e){e==="BACK"&&!this.activated?(this.activated=!0,this.onBack()):e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):super.handleNavAction(e)}handleNavTap(e){e==="menu"&&!this.activated?(this.activated=!0,this.onBack()):e==="game"&&!this.activated&&(this.activated=!0,this.onGame())}}class xo extends J{constructor(e,n,i,o){super(e,n,i,{navOptions:[]}),this.pageIndex=0,this.onContinue=o;const s=ro("game-start")[0].text.split(`

`),a=s[0].trim();let c;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,c=s.slice(1)):(this.yearHeader="",c=s);const l=[];for(let h=0;h<c.length;h++){const d=c[h].replace(/\n/g," "),p=De(d,36);h>0&&l.push(""),l.push(...p)}this.bodyLines=l}handleAction(e){e==="SELECT"?(this.activated=!0,this.onContinue()):e==="LEFT"?this.pageIndex>0&&this.pageIndex--:e==="RIGHT"&&this.pageIndex++}handleTap(e,n){this.activated=!0,this.onContinue()}renderContent(e,n,i){const o=e.length>0?e[0].length:0;if(this.yearHeader){const m=Math.max(0,Math.floor((o-this.yearHeader.length)/2));g(e,n,m,this.yearHeader,"bright-yellow","black")}const r=n+2,s=i-1,a=s-r,c=Math.max(1,a),l=Math.max(1,Math.ceil(this.bodyLines.length/c));this.pageIndex>=l&&(this.pageIndex=l-1);const h=l>1,d=this.pageIndex*c,p=Math.min(d+c,this.bodyLines.length);let u=r;for(let m=d;m<p;m++){const f=this.bodyLines[m];f!==""&&g(e,u,2,f,"white","black"),u++}h&&zn(e,s,o,this.pageIndex,l)}}const Co=30;class Tt{constructor(e){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=e,this.value=Math.max(e.field.min,Math.min(e.field.max,e.field.initialValue))}handleAction(e){const{field:n}=this.formDef;if(e==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(e==="UP"){this.value=Math.min(n.max,this.value+1);return}if(e==="DOWN"){this.value=Math.max(n.min,this.value-1);return}if(e==="RIGHT"){this.value=Math.min(n.max,this.value+10);return}if(e==="LEFT"){this.value=Math.max(n.min,this.value-10);return}}if(e==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}e==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(e){if(this.focus!=="field")return;const{field:n}=this.formDef;if(e==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(e>="0"&&e<="9"){const i=parseInt(e,10);this.replaceNextDigit?(this.value=Math.max(n.min,Math.min(n.max,i)),this.replaceNextDigit=!1):this.value=Math.min(n.max,this.value*10+i)}}handleTap(e,n){this.confirmRect&&n===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&n===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(e){const n=e.length,i=n>0?e[0].length:0,{title:o,field:r,derivedRows:s,confirmLabel:a}=this.formDef,c=s.length,l=8+c,h=Co,d=Math.floor((i-h)/2),p=Math.floor((n-l)/2);for(let M=0;M<l;M++)for(let Y=0;Y<h;Y++){const W=p+M,Z=d+Y;W>=0&&W<n&&Z>=0&&Z<i&&(e[W][Z]={char:" ",fg:"white",bg:"black"})}const u=(M,Y,W)=>{M>=0&&M<n&&Y>=0&&Y<i&&(e[M][Y]={char:W,fg:"white",bg:"black"})};u(p,d,"+"),u(p,d+h-1,"+");for(let M=1;M<h-1;M++)u(p,d+M,"-");u(p+l-1,d,"+"),u(p+l-1,d+h-1,"+");for(let M=1;M<h-1;M++)u(p+l-1,d+M,"-");for(let M=1;M<l-1;M++)u(p+M,d,"|"),u(p+M,d+h-1,"|");const m=h-2,f=p+1,y=d+1+Math.floor((m-o.length)/2);g(e,f,y,o,"bright-white","black"),g(e,p+2,y,"'".repeat(o.length),"bright-black","black");const b=[r.label,...s.map(M=>M.label)],x=Math.max(...b.map(M=>M.length)),_=d+1+x+3,k=p+4,v=this.focus==="field";g(e,k,d+1,r.label.padEnd(x)+" : ","white","black");const C=this.value.toString().padStart(5);g(e,k,_,C,v?"black":"white",v?"green":"black");for(let M=0;M<c;M++){const Y=s[M],W=p+5+M,Z=Y.compute(this.value);g(e,W,d+1,Y.label.padEnd(x)+" : ","white","black"),g(e,W,_,Z,"white","black")}const w=p+4+c+2,T=`[ ${a} ]`,O="[ CANCEL ]",K=3,P=T.length+K+O.length,G=Math.floor((m-P)/2),S=d+1+G,R=S+T.length+K;this.confirmRect={col:S,row:w,width:T.length},this.cancelRect={col:R,row:w,width:O.length};const E=this.focus==="confirm",A=this.focus==="cancel";g(e,w,S,T,E?"black":"white",E?"green":"black"),g(e,w,R,O,A?"black":"white",A?"green":"black")}}class To extends pe{constructor(e,n,i,o,r,s,a,c,l,h){const d=N(o),p=i.getMissionsForPickup(o),u=i.getMissionsForDelivery(o),m=p.map(A=>({label:`COLLECT: ${A.type==="delivery"?A.itemName:""}`,accentFg:"bright-yellow",action:()=>{}})),f=u.map(A=>({label:`DELIVER: ${A.title} → ${A.reward} CR`,accentFg:"bright-yellow",action:()=>{}})),y=[...m,...f],b=[];d.amenities.trader&&b.push({label:"TRADER",action:s}),i.getDestinationMissions(o).length>0&&b.push({label:"MISSION BOARD",action:a});const x=F();let _=null;if(d.owningFactionId){const A=D().factions.find(M=>M.id===d.owningFactionId);A&&me(A)&&(_=d.owningFactionId)}const k=x.fuel.pricePerLitre,v=_?qt(Ee(i.getFactionReputation(_),x),x):1,C=Math.round(k*v),w=i.fuelCapacityL-i.fuelL,T=Math.floor(i.credits/C),O=Math.min(w,T);let K=null;if(d.amenities.fuel&&O>0){const A=O*C;K=y.length+(y.length>0?1:0)+b.length,b.push({label:`BUY FUEL  +${O}L  ${A}CR`,action:()=>{}})}const P=[];y.length>0&&(P.push(...y),P.push({label:"────────────────────",disabled:!0,action:()=>{}})),P.push(...b);const G=De(d.description,36).slice(0,3),S=`DANGER: ${d.dangerLevel.toUpperCase()}`,R=[...G,S];if(d.owningFactionId){const A=D().factions.find(M=>M.id===d.owningFactionId);A&&R.push(`OPERATED BY: ${A.name}`)}const E=d.locationType==="surface"||d.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",P,[{id:"undock",label:E}],e,n,i,R,null,h),this.onShip=l,this.onRefuel=r,this.onHub=c,this.fuelItemIdx=K,this.eligibleFactionId=_;for(let A=0;A<p.length;A++){const M=p[A];m[A].action=()=>{this.player.collectMissionItem(M.id),this.onHub()}}for(let A=0;A<u.length;A++){const M=u[A];f[A].action=()=>{if(Ae(M,this.player)!=="ready-to-deliver"){this.openModal(new xt({title:"CANNOT DELIVER",body:M.type==="delivery"?"Mission item is missing from your cargo.":"Required supplies are missing from your cargo.",confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.activated=!1}}));return}if(M.type==="supply")for(const Ce of M.requirements)this.player.removeCargo(Ce.commodityId,Ce.qty);const W=F(),Z=D();let dt="";if(M.giverFactionId){const Ce=Z.factions.find(Ue=>Ue.id===M.giverFactionId);if(Ce){const Ue=M.reward;let Ge;Ue>=W.reputation.missionTierLargeReward?Ge=W.reputation.missionDeltaLarge:Ue>=W.reputation.missionTierMediumReward?Ge=W.reputation.missionDeltaMedium:Ge=W.reputation.missionDeltaSmall;const Gt=Lt(Ce,Ge,Z.factions);for(const[q,ee]of Gt)this.player.modifyFactionReputation(q,ee,W);const ut=[];for(const[q,ee]of Gt){const $t=Z.factions.find(ji=>ji.id===q);$t&&ut.push({id:q,name:$t.name,delta:ee})}ut.sort((q,ee)=>q.delta!==ee.delta?ee.delta-q.delta:q.name.localeCompare(ee.name)),dt=`

REPUTATION:
`;for(const q of ut){const ee=Et(q.delta);dt+=`  ${q.name.padEnd(20)} ${ee}
`}}}this.player.completeMission(M.id),this.player.addCredits(M.reward),this.openModal(new xt({title:"MISSION COMPLETE",body:`Mission complete!

You received ${M.reward} CR.${dt}`,confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.onHub()}}))}}}effectiveFuelPrice(){const e=F(),n=e.fuel.pricePerLitre;if(!this.eligibleFactionId)return n;const i=Ee(this.player.getFactionReputation(this.eligibleFactionId),e);return Math.round(n*qt(i,e))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx===-1)return;const n=e[this.cursorIdx];if(!n.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const i=this.effectiveFuelPrice(),o=this.player.fuelCapacityL-this.player.fuelL,r=Math.floor(this.player.credits/i),s=Math.min(o,r);this.openModal(new Tt({title:"BUY FUEL",field:{label:"Litres",initialValue:s,min:0,max:s},derivedRows:[{label:"Cost",compute:a=>`${a*i} CR`}],confirmLabel:"BUY",onConfirm:a=>{this.closeModal(),a>0&&this.onRefuel(a*i,a)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,n.action()}}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class So extends pe{constructor(e,n,i,o,r,s,a,c,l,h){var f;const d=N(o),p=((f=d.npcs.trader)==null?void 0:f.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(p,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,n,i,[],u,h),this.repGainedThisVisit=0,this.traderStock=r,this.onBuy=s,this.onSell=a,this.onHub=c,this.onUndock=l;const m=d.owningFactionId;if(m){const y=Zn(m);this.eligibleFactionId=y&&me(y)?m:null}else this.eligibleFactionId=null;this.syncItems(),this.clampCursor()}buyPrice(e,n){return Math.round(e*n)}sellPrice(e,n){return Math.round(e*n)}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(e=>{const n=de(e.commodityId);if(!n)return[];const i=e.effectiveFactor??1,o=this.buyPrice(n.basePrice,i),r=this.player.credits>=o;return[{label:`${n.name} (x${e.qty})`,info:`${o} CR`,disabled:!r,action:()=>{const s=Math.floor(this.player.credits/o),a=Math.min(e.qty,s);this.openModal(new Tt({title:n.name.toUpperCase(),field:{label:"Quantity",initialValue:a,min:0,max:a},derivedRows:[{label:"Total",compute:c=>`${c*o} CR`}],confirmLabel:"BUY",onConfirm:c=>{c>0&&(this.onBuy(e.commodityId,c,o),this.accrueReputation(c*o)),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const e=this.player.cargoHold;return e.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...e].flatMap(n=>{const i=de(n.commodityId);if(!i)return[];const o=N(this.player.destinationId??""),r=Q(o.system),s=et(n.commodityId,r),a=this.sellPrice(i.basePrice,s);return[{label:`${i.name} (x${n.qty})`,info:`${a} CR`,action:()=>{this.openModal(new Tt({title:i.name.toUpperCase(),field:{label:"Quantity",initialValue:n.qty,min:0,max:n.qty},derivedRows:[{label:"Total",compute:c=>`${c*a} CR`}],confirmLabel:"SELL",onConfirm:c=>{c>0&&this.onSell(n.commodityId,c,a),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}accrueReputation(e){if(!this.eligibleFactionId)return;const n=F(),i=n.reputation.maxRepPerVisit-this.repGainedThisVisit;if(i<=0)return;const o=Math.min(i,e*n.reputation.repPerCredit);o<=0||(this.repGainedThisVisit+=o,this.player.modifyFactionReputation(this.eligibleFactionId,o,n))}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var n;const e=this.items;(this.cursorIdx<0||this.cursorIdx>=e.length||(n=e[this.cursorIdx])!=null&&n.disabled)&&(this.cursorIdx=e.findIndex(i=>!i.disabled))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const n=e[this.cursorIdx];n.disabled||n.action()}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(e){if(this.syncItems(),super.render(e),this.eligibleFactionId){const o=F(),r=this.player.getFactionReputation(this.eligibleFactionId),s=Ee(r,o),c=`STANDING: ${ei(s)}`;g(e,X+2,2,c,"bright-black","black")}const n=e.length,i=Rt(n,!0)-2;g(e,i,2,`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,"bright-black","black")}}const Mo={delivery:"[D] ",supply:"[S] "};class ye extends pe{constructor(e,n,i,o,r,s,a,c,l){N(o);let h;r.length===0?h=[{label:"NO MISSIONS AVAILABLE",disabled:!0,action:()=>{}}]:h=ye.sortMissions(r).map(p=>ye.buildMenuItem(p,i,s)),super("MISSION BOARD",h,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,n,i,[],null,l),this.onHub=a,this.onUndock=c}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}static sortMissions(e){return[...e].sort((n,i)=>{var c,l;const o=((c=N(n.deliveryDestinationId))==null?void 0:c.name)??n.deliveryDestinationId,r=((l=N(i.deliveryDestinationId))==null?void 0:l.name)??i.deliveryDestinationId,s=o.localeCompare(r);if(s!==0)return s;const a={delivery:0,supply:1};return a[n.type]-a[i.type]})}static destColor(e,n){if(e===n.destinationId)return"bright-green";const i=N(e);return i&&i.system===n.systemId?"bright-yellow":"white"}static buildMenuItem(e,n,i){const o=N(e.deliveryDestinationId),r=(o==null?void 0:o.name)??e.deliveryDestinationId,s=[];if(s.push(`Dest: ${r}`),e.giverFactionId){const c=D().factions.find(l=>l.id===e.giverFactionId);c&&s.push(`For: ${c.name}`)}e.type!=="supply"&&s.push("");const a=e.type==="supply"?ye.buildSupplyDetails(e,n):[];return{label:e.title,icon:Mo[e.type],iconFg:"bright-yellow",info:`${e.reward} CR`,infoFg:"bright-green",details:s,detailsFg:ye.destColor(e.deliveryDestinationId,n),detailsColored:a,action:()=>i(e)}}static buildSupplyDetails(e,n){if(e.type!=="supply")return[];const i=e.requirements.map(o=>{const r=D().commodities.find(h=>h.id===o.commodityId),s=(r==null?void 0:r.name)??o.commodityId,a=n.cargoHold.find(h=>h.commodityId===o.commodityId),c=(a==null?void 0:a.qty)??0,l=c>=o.qty;return{left:[{text:`${o.qty}x ${s} `,fg:"white"},{text:`(have: ${c})`,fg:l?"bright-green":"bright-black"}]}});return i.push({left:[]}),i}}class Io extends J{constructor(e,n,i,o,r,s,a){super(r,s,a,{navOptions:o,title:e}),this.cursorIdx=-1,this.lastChoicesStartRow=0,this._choices=n,this._onBack=i,this.resetCursor()}preHandleAction(e){return e==="BACK"?(this.activated=!0,this._onBack(),!0):!1}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="SELECT"&&this.activateCurrent()}handleTap(e,n){const i=this.rowToChoiceIndex(n);i!==null&&!this._choices[i].disabled&&(this.cursorIdx=i,this.activateCurrent())}moveCursor(e){const n=this._choices,i=n.length;if(i===0)return;const o=this.cursorIdx===-1?e>0?i-1:0:this.cursorIdx;for(let r=0;r<i;r++){const s=((o+e*(r+1))%i+i)%i;if(!n[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this._choices.length===0||this.cursorIdx===-1)return;const e=this._choices[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}resetCursor(){const e=this._choices;for(let n=0;n<e.length;n++)if(!e[n].disabled){this.cursorIdx=n;return}this.cursorIdx=-1}computeChoicesHeight(){var n;let e=0;for(const i of this._choices)e+=1+(((n=i.details)==null?void 0:n.length)??0);return e}rowToChoiceIndex(e){var i;if(e<this.lastChoicesStartRow)return null;let n=this.lastChoicesStartRow;for(let o=0;o<this._choices.length;o++){const r=1+(((i=this._choices[o].details)==null?void 0:i.length)??0);if(e>=n&&e<n+r)return o;n+=r}return null}render(e){const n=e.length,i=n>0?e[0].length:0;for(let m=0;m<n;m++)for(let f=0;f<i;f++)e[m][f]={char:" ",fg:"black",bg:"black"};const o=this.buildChromeConfig();this.chrome.render(e,o);const r=!0,s=X,a=Rt(n,r),c=this.opts.title;c!==void 0&&(g(e,s,2,c,"bright-white","black"),g(e,s+1,2,"'".repeat(c.length),"bright-black","black"));const l=s+2,h=this.computeChoicesHeight(),d=a-h-1,p=d-1;this.renderContent(e,l,p),d>=0&&d<n&&ge(e,d,i);let u=d+1;this.lastChoicesStartRow=u;for(let m=0;m<this._choices.length;m++){const f=this._choices[m],y=m===this.cursorIdx,b=y?">":" ",x=f.disabled?"bright-black":y?"bright-green":"white";if(u<n&&(g(e,u,2,b,x,"black"),g(e,u,3,f.label,x,"black")),u++,f.details)for(const _ of f.details)u<n&&g(e,u,4,_.slice(0,i-4),"bright-black","black"),u++}}}const Ao={delivery:"[D]",supply:"[S]"};class Ro extends Io{constructor(e,n,i,o,r,s,a,c){const l=po(i,o),h=o.type==="delivery"&&o.pickupDestinationId===o.issuingDestinationId,d=l.ok?{label:"ACCEPT MISSION",action:()=>r(h)}:{label:"ACCEPT MISSION",disabled:!0,details:l.reason?[l.reason]:[],action:()=>{}},p={label:"BACK",action:()=>s()};super("MISSION BOARD",[d,p],s,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,n,i),this.spec=o,this.onHub=a,this.onUndock=c}destColor(e){if(e===this.player.destinationId)return"bright-green";const n=N(e);return n&&n.system===this.player.systemId?"bright-yellow":"white"}writeDestRow(e,n,i,o,r,s){g(e,n,2,i,"white","black"),g(e,n,2+i.length,o.slice(0,s-i.length),this.destColor(r),"black")}handleAction(e){e==="NAV_1"?(this.activated=!0,this.onUndock()):e==="NAV_2"?(this.activated=!0,this.onHub()):super.handleAction(e)}handleNavTap(e){this.activated||(e==="undock"?(this.activated=!0,this.onUndock()):e==="hub"&&(this.activated=!0,this.onHub()))}renderContent(e,n,i){this.renderDetail(e,n,i)}renderDetail(e,n,i){const r=e.length>0?e[0].length:40,s=r-4;let a=n;const c=(u,m,f)=>{u<=i&&g(e,u,2,m.slice(0,s),f,"black")};c(a,`${Ao[this.spec.type]} ${this.spec.title}`,"bright-yellow"),a++;const l=D(),h=this.spec.giverFactionId?l.factions.find(u=>u.id===this.spec.giverFactionId):null,d=h?` [${h.name}]`:"";if(c(a,`    ${this.spec.giverName}${d}`,"bright-black"),a++,a++,this.spec.type==="delivery"){const u=N(this.spec.pickupDestinationId),m=N(this.spec.deliveryDestinationId);if(a<=i&&this.writeDestRow(e,a,"Pickup:  ",(u==null?void 0:u.name)??this.spec.pickupDestinationId,this.spec.pickupDestinationId,s),a++,a<=i&&this.writeDestRow(e,a,"Deliver: ",(m==null?void 0:m.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,s),a++,a<=i){const f=this.player.cargoCapacity-this.player.cargoWeightKg,y=this.spec.itemWeightKg,b=f>=y,x=`Weight:  ${y} kg  (Free: ${f} kg)`;g(e,a,2,x,"white","black");const _=b?"bright-green":"red",k=2+x.length+1;k<r&&g(e,a,k,b?"✓":"✗",_,"black")}a++}else{const u=N(this.spec.deliveryDestinationId);a<=i&&this.writeDestRow(e,a,"Deliver to: ",(u==null?void 0:u.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,s),a++;for(const m of this.spec.requirements){if(a>i)break;const f=de(m.commodityId);c(a,`  ${m.qty}x ${(f==null?void 0:f.name)??m.commodityId}`,"white"),a++}}a++;const p=De(this.spec.description,s);for(const u of p){if(a>i)break;c(a,u,"white"),a++}if(a++,!(a>i)&&(c(a,`REWARD: ${this.spec.reward} CR`,"bright-green"),a++,this.spec.type==="delivery"&&this.spec.deposit>0&&(a<=i&&c(a,`DEPOSIT: ${this.spec.deposit} CR`,"bright-yellow"),a++),this.spec.giverFactionId)){const u=l.factions.find(m=>m.id===this.spec.giverFactionId);if(u){const m=F(),f=this.spec.reward;let y;f>=m.reputation.missionTierLargeReward?y=m.reputation.missionDeltaLarge:f>=m.reputation.missionTierMediumReward?y=m.reputation.missionDeltaMedium:y=m.reputation.missionDeltaSmall;const b=Lt(u,y,l.factions),x=[];for(const[_,k]of b){const v=l.factions.find(C=>C.id===_);v&&x.push({id:_,name:v.name,delta:k})}if(x.sort((_,k)=>_.delta!==k.delta?k.delta-_.delta:_.name.localeCompare(k.name)),x.length>0){if(a++,a>i)return;const _=i-1;a<=_&&(c(a,"REPUTATION IMPACT","bright-cyan"),a++);for(const k of x){if(a>_)break;const v=Et(k.delta),C=k.delta>0?"bright-green":"red",w=s-v.length-2,T=k.name.slice(0,w),O=" ".repeat(Math.max(0,s-T.length-v.length-2));c(a,`  ${T}${O}${v}`,C),a++}}}}}}function Eo(t){if(t.length===0)return 2166136261;let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e=Math.imul(e,16777619)>>>0;return e===0?1:e}const Lo=[30,10,5],Fo=[".","*","+"],zt=[4e3,2e3,800],Do=[9e3,5e3,2500],Oo=[null,"bright-black","white"],No=["bright-black","white","bright-white"],Po=["white","bright-white","bright-cyan"],We=3,Qt=25,Ke=2,Jt=37,Zt=2*Math.PI;function Ho(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}class Bo{constructor(e=42){this.boundsSet=!1,this.rand=Ho(e),this.stars=[];for(let n=0;n<3;n++)for(let i=0;i<Lo[n];i++){const o=Ke+Math.floor(this.rand()*(Jt-Ke+1)),r=We+Math.floor(this.rand()*(Qt-We+1)),s=this.rand()*Zt,a=zt[n]+this.rand()*(Do[n]-zt[n]);this.stars.push({col:o,row:r,layer:n,twinklePhase:s,twinklePeriod:a})}}update(e){for(const n of this.stars)n.twinklePhase+=Zt/n.twinklePeriod*e}render(e,n,i,o,r){if(!this.boundsSet){this.boundsSet=!0;const s=Qt-We,a=Jt-Ke;{const c=(i-n)/s,l=(r-o)/a;for(const h of this.stars)h.row=Math.round(n+(h.row-We)*c),h.col=Math.round(o+(h.col-Ke)*l)}}for(const s of this.stars){const{row:a,col:c,layer:l}=s;if(a<n||a>i||c<o||c>r)continue;const h=Math.sin(s.twinklePhase);let d;h>=.5?d=Po[l]:h>=-.5?d=No[l]:d=Oo[l],d!==null&&(e[a][c]={char:Fo[l],fg:d,bg:"black"})}}getStars(){return this.stars}}const Uo=2,Go=3,$o=2*Math.PI/9e3,Wo=2*Math.PI/12e3,Ko=Math.PI/3;function en(t,e,n){return Math.max(e,Math.min(n,t))}class Yo{constructor(e,n,i,o,r,s=.5,a=.6){this.time=0,this.glyph=e,this.intRowStart=n,this.intRowEnd=i,this.intColStart=o,this.intColEnd=r,this.glyphHeight=e.rows.length,this.glyphWidth=Math.max(...e.rows.map(c=>c.length)),this.anchorRow=n+Math.floor((i-n)*s)-Math.floor(this.glyphHeight/2),this.anchorCol=o+Math.floor((r-o)*a)-Math.floor(this.glyphWidth/2)}update(e){this.time+=e}getDisplayPosition(){const e=Math.round(Uo*Math.sin(this.time*$o)),n=Math.round(Go*Math.sin(this.time*Wo+Ko)),i=en(this.anchorRow+e,this.intRowStart,this.intRowEnd-this.glyphHeight+1),o=en(this.anchorCol+n,this.intColStart,this.intColEnd-this.glyphWidth+1);return{row:i,col:o}}render(e){const{row:n,col:i}=this.getDisplayPosition(),o=this.glyph.fg;for(let r=0;r<this.glyph.rows.length;r++){const s=this.glyph.rows[r];let a=-1,c=-1;for(let l=0;l<s.length;l++)s[l]!==" "&&(a===-1&&(a=l),c=l);if(a!==-1)for(let l=a;l<=c;l++){const h=s[l],d=n+r,p=i+l;d>=0&&d<e.length&&p>=0&&p<e[d].length&&(e[d][p]=h===" "?{char:" ",fg:"black",bg:"black"}:{char:h,fg:o,bg:"black"})}}}}const tn=[{rows:[">---<"," |*| ","  |  "],fg:"bright-white"},{rows:["/-\\","|O|","\\-/"],fg:"cyan"},{rows:["  *  ","--+--"," [H] ","  |  ","  *  "],fg:"bright-white"}],nn=[{rows:[" /\\/\\","< ** >"," \\__/"],fg:"yellow"},{rows:["  ___"," /   \\","|  .  |"," \\___/"],fg:"yellow"},{rows:[" _/\\_","/  . \\","\\____/"],fg:"yellow"}],on=[{rows:["  .--."," / .. \\","| .... |"," \\ .. /","  `--'"],fg:"blue"},{rows:["  .--."," / ~~ \\","| ~~~~ |"," \\ ~~ /","  `--'"],fg:"bright-yellow"},{rows:["  .--."," /====\\","|======|"," \\====/","  `--'"],fg:"bright-cyan"}];function jo(t,e){return t==="orbital"||t==="deep-space"?tn[e%tn.length]:t==="asteroid"?nn[e%nn.length]:t==="surface"?on[e%on.length]:null}const Vo=6,mt=6,qo=23,Xo=23,ft=10,zo=0,Qo=4,Jo=18,Zo=21,er=35,tr=39,rn=12,nr=11,ce=13,Se=27,Ye=28,ir=12,gt=40,sn=200,yt=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],or="#",an=["green","cyan","white","yellow"],cn=["*",".","+","x"];function rr(t){return t>=.8?"bright-green":t>=.5?"yellow":"red"}function ln(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function sr(t,e,n){return{col:e,row:n,char:or,color:an[Math.floor(t()*an.length)],phase:t()*2e4,period:1e4+t()*1e4,active:t()>.2}}function Me(t,e,n,i){const o=[];for(const r of i)for(let s=e;s<=n;s++)o.push(sr(t,s,r));return o}class hn extends J{constructor(e,n,i,o,r,s,a){var u;super(e,n,i,{navOptions:[],onMenu:a}),this.cursorIdx=0,this.h=30,this.overlay=null,this.destObject=null,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.onTravel=o,this.onDock=r,this.onCargo=s;const c=Eo(i.destinationId??"");this.starfield=new Bo(c),this.inSpace=i.destinationId===null;const l=i.destinationId!=null?(u=N(i.destinationId))==null?void 0:u.locationType:void 0;this.destGlyph=jo(l,c),this.destRowFrac=.15+Math.random()*.7,this.destColFrac=.15+Math.random()*.7;const h=ln(99);this.gaugeBtns=[...Me(h,zo,Qo,[3,4]),...Me(h,Jo,Zo,[3,4]),...Me(h,er,tr,[3,4])],this.leftBtns=Me(h,0,nr,[0,1,2,3]),this.rightBtns=Me(h,Ye,39,[0,1,2,3]);const d=ln(77),p=3+Math.floor(d()*4);this.radarContacts=Array.from({length:p},()=>({x:d()*(Se-ce-1),y:d()*4,vx:(d()-.5)*2,vy:(d()-.5)*1.5,char:cn[Math.floor(d()*cn.length)]}))}navCount(){return this.inSpace?1:2}setOverlay(e){this.overlay=e}handleAction(e){if(this.overlay){this.overlay.handleAction(e);return}e==="CARGO"?(this.activated=!0,this.onCargo()):e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.navCount())%this.navCount():e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.navCount():e==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,this.onTravel()):this.inSpace||(this.activated=!0,this.onDock()))}handleTap(e,n){if(this.overlay){this.overlay.handleTap(e,n);return}const i=this.h;(n===3||n===4)&&e>=mt&&e<mt+1+ft?(this.activated=!0,this.onCargo()):n===i-3&&e<rn?(this.activated=!0,this.onTravel()):n===i-3&&e>=Ye&&!this.inSpace&&(this.activated=!0,this.onDock())}update(e){var o,r;(o=this.overlay)==null||o.update(e),this.starfield.update(e),(r=this.destObject)==null||r.update(e),this.blinkPhase=(this.blinkPhase+e)%1e3;for(const s of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])s.phase+=e,s.phase>=s.period&&(s.phase-=s.period,s.active=!s.active);const n=Se-ce,i=5;for(const s of this.radarContacts)s.x+=s.vx*e/1e3,s.y+=s.vy*e/1e3,s.x<0&&(s.x=-s.x,s.vx=-s.vx),s.x>n-1&&(s.x=2*(n-1)-s.x,s.vx=-s.vx),s.y<0&&(s.y=-s.y,s.vy=-s.vy),s.y>i-1&&(s.y=2*(i-1)-s.y,s.vy=-s.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-e);else for(this.tickerAccum+=e;this.tickerAccum>=sn;){this.tickerAccum-=sn,this.tickerScroll++;const s=yt[this.msgIdx];if(this.tickerScroll>=s.length+gt-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%yt.length,this.tickerPause=500,this.tickerAccum=0;break}}}renderContent(e,n,i){var d;const o=e.length,r=o>0?e[0].length:0;this.h=o;const s=n+2,a=o-8,c=o-7,l=o-3,h=o-2;this.renderGaugeStrip(e,n),this.starfield.render(e,s,a,0,39),!this.destObject&&this.destGlyph&&(this.destObject=new Yo(this.destGlyph,s+1,a-1,0,39,this.destRowFrac,this.destColFrac)),(d=this.destObject)==null||d.render(e);for(let p=0;p<r;p++)e[s][p]={char:"-",fg:"white",bg:"black"},e[a][p]={char:"-",fg:"white",bg:"black"};this.renderHUD(e,s+1),this.renderCrosshair(e,s+1,a-1),this.renderBottomPanels(e,c,l),this.renderTicker(e,h),this.overlay&&this.overlay.render(e,c,l,Ye,r-1)}renderGaugeStrip(e,n){for(const a of this.gaugeBtns){const c=n+a.row-3,l=a.active?a.color:"bright-black";c>=0&&c<e.length&&(e[c][a.col]={char:a.char,fg:l,bg:"black"})}const i=this.player.fuelL/this.player.fuelCapacityL,o=this.player.cargoWeightKg/this.player.cargoCapacity,r=this.blinkPhase<500,s=rr(this.player.hullIntegrity);this.renderGauge(e,n,Vo,"F",i,"yellow",r),this.renderGauge(e,n+1,mt,"C",o,"blue",r),this.renderGauge(e,n,qo,"S",1,"cyan",r),this.renderGauge(e,n+1,Xo,"H",this.player.hullIntegrity,s,r)}renderGauge(e,n,i,o,r,s,a){if(n<0||n>=e.length)return;e[n][i]={char:o,fg:s,bg:"black"};const c=Math.round(Math.min(1,Math.max(0,r))*ft),l=r<=.2;for(let h=0;h<ft;h++){const d=i+1+h;if(h<c){const p=l&&!a?"bright-black":s;e[n][d]={char:" ",fg:"black",bg:p}}else e[n][d]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(e,n){g(e,n,1,"VEL:----","bright-black","black"),g(e,n,16,"ATT:---°","bright-black","black"),g(e,n,30,"ROT:--°","bright-black","black")}renderCrosshair(e,n,i){var a;const o=Math.floor((n+i)/2),r=20;e[o][r]={char:"+",fg:"bright-green",bg:"black"};const s=[[o-3,r-5],[o-3,r+5],[o+3,r-5],[o+3,r+5]];for(const[c,l]of s){const h=((a=e[0])==null?void 0:a.length)??40;c>=n&&c<=i&&l>=0&&l<h&&(e[c][l]={char:"+",fg:"bright-green",bg:"black"})}}renderBottomPanels(e,n,i){for(let l=n;l<=i;l++)for(let h=ce;h<Se;h++)e[l][h]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(e,n,i-n+1);for(const l of this.leftBtns){const h=n+l.row;if(h<i){const d=l.active?l.color:"bright-black";e[h][l.col]={char:l.char,fg:d,bg:"black"}}}for(const l of this.rightBtns){const h=n+l.row;if(h<i){const d=l.active?l.color:"bright-black";e[h][l.col]={char:l.char,fg:d,bg:"black"}}}const o=this.cursorIdx===0?"bright-yellow":"yellow";g(e,i,0,this.centerPad("TRAVEL",rn),"black",o);let r,s;this.inSpace?(r="bright-black",s="bright-black"):(r=this.cursorIdx===1?"bright-cyan":"cyan",s="black"),g(e,i,Ye,this.centerPad("DOCK",ir),s,r);const a=Se-ce,c="<)) "+"-".repeat(a-4);g(e,i,ce,c,"white","bright-black")}renderRadar(e,n,i){for(const o of this.radarContacts){const r=Math.min(Se-ce-1,Math.max(0,Math.floor(o.x))),s=Math.min(i-1,Math.max(0,Math.floor(o.y)));e[n+s][ce+r]={char:o.char,fg:"white",bg:"bright-black"}}}renderTicker(e,n){const i=yt[this.msgIdx];for(let o=0;o<gt;o++){const r=this.tickerScroll-gt+1+o,s=r>=0&&r<i.length?i[r]:" ";e[n][o]={char:s,fg:"white",bg:"black"}}}centerPad(e,n){if(e.length>=n)return e.slice(0,n);const i=n-e.length,o=Math.floor(i/2);return" ".repeat(o)+e+" ".repeat(i-o)}}class ar extends J{constructor(e,n,i,o,r){super(e,n,i,{title:"CARGO HOLD",tabs:["COMMODITIES","MISSION GOODS"],navOptions:[{id:"back",label:"BACK"}],onMenu:r}),this.onBack=o}handleNavTap(e){e==="back"&&(this.activated=!0,this.onBack())}handleAction(e){(e==="BACK"||e==="CARGO")&&(this.activated=!0,this.onBack())}renderContent(e,n,i){const r=e.length>0?e[0].length:0,s=this.player.cargoHold,a=this.player.missionItems,c=this.player.cargoCapacity,l=this.player.cargoWeightKg,h=i-1;this.activeTabIdx===0?this.renderCommoditiesTab(e,n,h,r,s):this.renderMissionGoodsTab(e,n,h,r,a);const d=`CARGO: ${l}/${c}KG`,p=`FUEL: ${this.player.fuelL}/${this.player.fuelCapacityL}L`;g(e,h,2,d,"bright-black","black"),g(e,h,r-p.length-2,p,"bright-black","black")}renderCommoditiesTab(e,n,i,o,r){if(r.length===0){g(e,n,2,"NO COMMODITIES","bright-black","black");return}let s=n;for(const a of r){if(s>=i-1)break;const c=de(a.commodityId);if(!c)continue;const l=a.qty*c.weightKg,h=`  x${a.qty}  ${c.basePrice}CR  ${l}KG`,d=Math.max(6,o-4-h.length),p=c.name,u=p.length>d?p.slice(0,d):p;g(e,s,2,`${u}${h}`,"white","black"),s++}}renderMissionGoodsTab(e,n,i,o,r){if(r.length===0){g(e,n,2,"NO MISSION GOODS","bright-black","black");return}let s=n;for(const a of r){if(s>=i-1)break;const c=`  ${a.weightKg}KG`,l=Math.max(6,o-4-c.length),h=a.itemName.length>l?a.itemName.slice(0,l):a.itemName;g(e,s,2,`${h}${c}`,"white","black"),s++}}}class dn extends pe{constructor(e,n,i,o,r,s,a,c,l=()=>{},h){const d=Q(i.systemId),p=Qn(i.driveId),u=i.getInSystemHopCost(),m=i.fuelL<u,f=[...d.destinations.map(_=>({label:`${N(_).name.toUpperCase()}  [${u}L]`,disabled:_===i.destinationId||m,action:()=>o(_)})),{label:`FLY INTO SPACE  [${u}L]`,disabled:i.destinationId===null||m,action:s}];m&&h&&f.push({label:"[EMERGENCY]",disabled:!1,action:h});const b=[...At(i.systemId).map(_=>{const k=_.from===i.systemId?_.to:_.from,v=Q(k),C=Math.ceil(F().fuel.consumptionPerLy*_.distance*p.fuelEfficiency);return{label:`${v.name.toUpperCase()}  ${_.distance}LY  [${C}L]`,disabled:C>i.fuelL,action:()=>r(k)}}),{label:"GALAXY MAP...",action:c}],x=[{label:"DESTINATIONS",items:f},{label:"JUMPS",items:b}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],e,n,i,[],x,l),this.onShip=a}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}class cr extends J{constructor(e,n,i,o,r,s){super(e,n,i,{navOptions:[],title:"EMERGENCY RESCUE"}),this.cursorIdx=0,this.onBack=s;const a=Q(i.systemId),c=F();if(this.options=[],this.fuelDestId=a.destinations.find(l=>{var h;return((h=N(l))==null?void 0:h.amenities.fuel)===!0}),this.fuelDestId){const l=N(this.fuelDestId);this.options.push({label:`TOW TO ${l.name.toUpperCase()}`,fee:c.emergencyRescue.towFee,action:()=>o(this.fuelDestId)})}this.options.push({label:"EMERGENCY FUEL DROP",fee:c.emergencyRescue.fuelDropFee,action:r}),this.options.push({label:"BACK",fee:0,action:s})}preHandleAction(e){return e==="BACK"?(this.activated=!0,this.onBack(),!0):!1}handleAction(e){e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.options.length)%this.options.length:e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.options.length:e==="SELECT"&&this.cursorIdx>=0&&this.cursorIdx<this.options.length&&(this.activated=!0,this.options[this.cursorIdx].action())}handleTap(e,n){this.cursorIdx>=0&&this.cursorIdx<this.options.length&&(this.activated=!0,this.options[this.cursorIdx].action())}renderContent(e,n,i){const o=e.length,r=o>0?e[0].length:0,s=Q(this.player.systemId);let a;this.player.destinationId===null?a=`STRANDED IN SPACE NEAR ${s.name.toUpperCase()}`:a=`STRANDED AT ${N(this.player.destinationId).name.toUpperCase()}`,g(e,n,2,a,"bright-yellow","black");const c=n+2;ge(e,c,r);let l=c+1;for(let h=0;h<this.options.length;h++){const d=this.options[h],p=h===this.cursorIdx,u=p?">":" ",m=p?"bright-green":"white";if(l<o)if(g(e,l,2,u,m,"black"),d.fee===0)g(e,l,3,d.label,m,"black");else{g(e,l,3,d.label,m,"black");const f=this.player.credits-d.fee,y=`${d.fee} CR  (BALANCE: ${f>=0?"":"-"}${Math.abs(f)} CR)`,b=f<0?"bright-red":m;l+1<o&&g(e,l+1,4,y,b,"black"),l++}l++}}}function un(t,e){if(t===e)return[t];const n=[[t]],i=new Set([t]);for(;n.length>0;){const o=n.shift(),r=o[o.length-1];for(const s of At(r)){const a=s.from===r?s.to:s.from;if(a===e)return[...o,a];i.has(a)||(i.add(a),n.push([...o,a]))}}return null}const lr=0,hr=4,dr=8,ur=9,pn=10,mn=15,pr=16,mr=2,fr=10,gr=12,je=13,Ve=12,yr=25,_r=26,br=10,fn=18;function wr(t,e){return t.length>=e?t.slice(0,e):t+" ".repeat(e-t.length)}function Ie(t,e){return"["+wr(t.toUpperCase(),e-2)+"]"}class gn extends J{constructor(e,n,i,o,r=()=>{},s){const a=s?[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}]:[{id:"back",label:"BACK"}];super(e,n,i,{title:"GALAXY MAP",tabs:["MAP","ROUTE"],navOptions:a,onMenu:r}),this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.lastTop=X+5,this.onBack=o,this.onGame=s,this.publicSystems=ao().sort((c,l)=>c.distanceFromSol-l.distanceFromSol),this.otherSystems=this.publicSystems.filter(c=>c.id!==i.systemId),this.mapBrowsingSystemId=i.systemId}onTabChange(e){this.searchText=""}handleCharInput(e){if(this.activeTabIdx!==0)return;const n=e.charCodeAt(0);e==="\b"||e===""?this.searchText=this.searchText.slice(0,-1):n>=32&&n<127&&(this.searchText+=e.toUpperCase(),this.mapCursorIdx=0)}handleAction(e){if(e==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}if(e==="NAV_1"){this.onGame&&(this.activated=!0,this.onGame());return}if(e==="NAV_2"){this.onGame&&(this.searchText="",this.activated=!0,this.onBack());return}this.activeTabIdx===0?this.handleMapAction(e):this.handleRouteAction(e)}handleNavTap(e){e==="back"?(this.searchText="",this.activated=!0,this.onBack()):e==="game"&&this.onGame?(this.activated=!0,this.onGame()):e==="menu"&&(this.searchText="",this.activated=!0,this.onBack())}handleTap(e,n){const i=this.lastTop,o=i+pn,r=i+mn;if(this.activeTabIdx===0&&n>=o&&n<r){const s=this.getMapNeighbors(),a=n-o;a>=0&&a<s.length&&(this.mapBrowsingSystemId=s[a].id,this.mapCursorIdx=0,this.searchText="")}else if(this.activeTabIdx===1){const s=i+3,a=i+9;if(n>=s&&n<=a){const c=n-s;c>=0&&c<this.otherSystems.length&&(this.routeDestIdx=c)}}}getMapNeighbors(){const n=At(this.mapBrowsingSystemId).map(i=>{const o=i.from===this.mapBrowsingSystemId?i.to:i.from,r=this.publicSystems.find(a=>a.id===o),s=i.distance;return r?{sys:r,dist:s}:null}).filter(i=>i!==null).sort((i,o)=>i.dist-o.dist).map(i=>i.sys);return this.searchText.length===0?n:n.filter(i=>i.name.toUpperCase().includes(this.searchText))}handleMapAction(e){const n=this.getMapNeighbors(),i=Math.min(this.mapCursorIdx,Math.max(0,n.length-1));if(e==="UP")this.mapCursorIdx=Math.max(0,i-1);else if(e==="DOWN")this.mapCursorIdx=Math.min(n.length-1,i+1);else if(e==="SELECT"){const o=n[i];if(!o)return;this.mapBrowsingSystemId=o.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(e){e==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):e==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const e=this.otherSystems[this.routeDestIdx];return e?un(this.player.systemId,e.id):null}renderContent(e,n,i){this.lastTop=n;const o=e.length>0?e[0].length:0;this.activeTabIdx===0?this.renderMapTab(e,n,i,o):this.renderRouteTab(e,n,i,o)}renderMapTab(e,n,i,o){const r=this.publicSystems.find(p=>p.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!r)return;const s=n+ur,a=n+pn,c=n+mn,l=n+pr;this.renderChart(e,r,n),ge(e,s,o);const h=this.getMapNeighbors(),d=Math.min(this.mapCursorIdx,Math.max(0,h.length-1));this.renderNeighborList(e,o,r,h,d,a,c),ge(e,c,o),this.renderInfo(e,o,r,h[d]??null,l),this.searchText.length>0&&g(e,l+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(e,n,i){var h;const o=this.getMapNeighbors(),r=i+lr,s=i+hr,a=i+dr,c=n.id===this.player.systemId?"bright-yellow":"bright-cyan";if(g(e,s,je,Ie(n.name,Ve),c,"black"),n.id===this.player.systemId){const d=je+Ve,p=((h=e[0])==null?void 0:h.length)??40;d<p&&(e[s][d]={char:"*",fg:"bright-yellow",bg:"black"})}const l=["left","right","top","bottom"];for(let d=0;d<Math.min(o.length,4);d++){const p=o[d],u=l[d],m=p.id===this.player.systemId?"bright-yellow":"white";if(u==="left")g(e,s,mr,Ie(p.name,fr),m,"black"),e[s][gr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="right")g(e,s,_r,Ie(p.name,br),m,"black"),e[s][yr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="top"){g(e,r,je,Ie(p.name,Ve),m,"black");for(let f=r+1;f<s;f++)e[f][fn]={char:"|",fg:"bright-black",bg:"black"}}else{g(e,a,je,Ie(p.name,Ve),m,"black");for(let f=s+1;f<a;f++)e[f][fn]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(e,n,i,o,r,s,a){for(let c=0;c<o.length&&c<a-s;c++){const l=o[c],h=s+c,d=c===r,u=l.id===this.player.systemId?"bright-yellow":d?"bright-cyan":"white",m=d?"> ":"  ",f=Qe(i.id,l.id),y=f?`${f.distance}LY  ${f.stability}`:"",b=n-4-y.length;g(e,h,2,m+l.name.toUpperCase().slice(0,b-2),u,"black"),y&&g(e,h,n-2-y.length,y,"bright-black","black")}}renderInfo(e,n,i,o,r){const a=i.id===this.player.systemId?"* Current location":i.name.toUpperCase();if(g(e,r,2,`Zone: ${i.zone}  Sec: ${i.security}  ${a}`.slice(0,n-4),"bright-black","black"),!o)return;const c=Qe(i.id,o.id);if(!c)return;const l=un(this.player.systemId,o.id),h=l?l.length===1?"(your location)":`${l.length-1} hop${l.length-1!==1?"s":""} from you`:"(unreachable)";g(e,r+1,2,`${o.name.toUpperCase()}  ${c.distance}LY  ${h}`.slice(0,n-4),"bright-black","black")}renderRouteTab(e,n,i,o){var b,x;const r=n,s=n+2,a=n+3,c=7,l=a+c,h=l+1,d=h+6,p=this.publicSystems.find(_=>_.id===this.player.systemId);g(e,r,2,"FROM:","bright-black","black"),g(e,r,8,(p==null?void 0:p.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),g(e,s,2,"TO:","bright-black","black");const u=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-c));for(let _=0;_<c;_++){const k=u+_;if(k>=this.otherSystems.length)break;const v=this.otherSystems[k],C=k===this.routeDestIdx,w=C?"bright-cyan":"white",T=C?"> ":"  ";g(e,a+_,2,T+v.name.toUpperCase(),w,"black")}ge(e,l,o),ge(e,d,o);const m=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!m){g(e,h,2,"No route found","bright-red","black");return}const y=m.length-1;g(e,h,2,`Route: ${y} hop${y!==1?"s":""}`,"bright-white","black");for(let _=0;_<y;_++){const k=Qe(m[_],m[_+1]);if(!k)continue;const v=h+1+_;if(v>=d)break;const C=(((b=this.publicSystems.find(T=>T.id===m[_]))==null?void 0:b.name)??m[_]).toUpperCase().slice(0,9),w=(((x=this.publicSystems.find(T=>T.id===m[_+1]))==null?void 0:x.name)??m[_+1]).toUpperCase().slice(0,9);g(e,v,4,`${C} -> ${w}  ${k.distance}LY  ${k.stability}`.slice(0,o-6),"white","black")}}}class ae extends J{constructor(e,n,i,o){const r={onAction:()=>{}};super(r,n,e,{navOptions:[]}),this.elapsed=0,this.arrived=!1,this.duration=i,this.onComplete=o}update(e){this.arrived||(this.elapsed+=e,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const vr=["[. . .]","[: : :]","[* * *]"],yn=5e3;class kr extends ae{constructor(e,n,i){super(e,n,yn,i)}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(e,n,i){const o=e.length,r=Math.floor(o/2),s=Math.floor(this.elapsed/500)%3,a=Math.ceil((yn-this.elapsed)/1e3),c=Math.max(1,Math.min(5,a)),l=Q(this.player.systemId),h=l?l.name.toUpperCase():this.player.systemId.toUpperCase();L(e,r-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),L(e,r-1,"DESTINATION:","bright-black","black"),L(e,r,h,"bright-white","black"),L(e,r+2,vr[s],"bright-black","black"),L(e,r+4,`ARRIVING IN ${c}S`,"bright-black","black")}}const _n=2e3,xr=["[ —   ]","[  —  ]","[   — ]"];class _t extends ae{constructor(e,n,i,o){super(e,n,_n,i),this.targetLabel=o}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(e,n,i){const o=e.length,r=Math.floor(o/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((_n-this.elapsed)/1e3),c=Math.max(1,Math.min(2,a)),l=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const h=this.player.destinationId?N(this.player.destinationId):null;return h?h.name.toUpperCase():"UNKNOWN"})();L(e,r-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),L(e,r-1,"HEADING TO:","bright-black","black"),L(e,r,l,"bright-white","black"),L(e,r+2,xr[s],"bright-black","black"),L(e,r+4,`ARRIVING IN ${c}S`,"bright-black","black")}}const bn=2500,Cr=["v","vv","vvv"];class Tr extends ae{constructor(e,n,i){super(e,n,bn,i)}renderContent(e,n,i){const o=e.length,r=Math.floor(o/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((bn-this.elapsed)/1e3),c=Math.max(1,Math.min(3,a));L(e,r-3,"[ LANDING SEQUENCE ]","bright-green","black"),L(e,r+2,Cr[s],"bright-black","black"),L(e,r+4,`TOUCHDOWN IN ${c}S`,"bright-black","black")}}const wn=2500,Sr=[">",">>",">>>"];class Mr extends ae{constructor(e,n,i){super(e,n,wn,i)}renderContent(e,n,i){const o=e.length,r=Math.floor(o/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((wn-this.elapsed)/1e3),c=Math.max(1,Math.min(3,a));L(e,r-3,"[ APPROACH LOCKED ]","bright-yellow","black"),L(e,r+2,Sr[s],"bright-black","black"),L(e,r+4,`CLAMPING IN ${c}S`,"bright-black","black")}}const vn=1500,Ir=["^","^^","^^^"];class Ar extends ae{constructor(e,n,i){super(e,n,vn,i)}renderContent(e,n,i){const o=e.length,r=Math.floor(o/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((vn-this.elapsed)/1e3),c=Math.max(1,Math.min(2,a));L(e,r-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),L(e,r+2,Ir[s],"bright-black","black"),L(e,r+4,`CLEAR IN ${c}S`,"bright-black","black")}}const kn=1500,Rr=["<","<<","<<<"];class Er extends ae{constructor(e,n,i){super(e,n,kn,i)}renderContent(e,n,i){const o=e.length,r=Math.floor(o/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((kn-this.elapsed)/1e3),c=Math.max(1,Math.min(2,a));L(e,r-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),L(e,r+2,Rr[s],"bright-black","black"),L(e,r+4,`DEPARTING IN ${c}S`,"bright-black","black")}}const xn=1500,Lr=["→","→→","→→→"];class Fr extends ae{constructor(e,n,i){super(e,n,xn,i)}renderContent(e,n,i){const o=e.length,r=Math.floor(o/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((xn-this.elapsed)/1e3),c=Math.max(1,Math.min(2,a));L(e,r-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),L(e,r+2,Lr[s],"bright-black","black"),L(e,r+4,`DOCKING IN ${c}S`,"bright-black","black")}}const Cn=1500,Dr=["←","←←","←←←"];class Or extends ae{constructor(e,n,i){super(e,n,Cn,i)}renderContent(e,n,i){const o=e.length,r=Math.floor(o/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((Cn-this.elapsed)/1e3),c=Math.max(1,Math.min(2,a));L(e,r-3,"[ DEPARTING BERTH ]","bright-cyan","black"),L(e,r+2,Dr[s],"bright-black","black"),L(e,r+4,`CLEAR IN ${c}S`,"bright-black","black")}}const Nr=3e3;class Tn extends J{constructor(e,n,i,o,r,s,a){super(e,i,n,{navOptions:[]}),this.outcomeLabel=o,this.score=r,this.damageFraction=s,this.onComplete=a,this.elapsed=0,this.arrived=!1,this.duration=Nr,this.lastContentTop=4,this.lastContentBottom=26,this.buttonRow=0,this.buttonCol=0,e.onTap&&e.onTap((c,l)=>this.handleTapCustom(c,l)),e.onAction(c=>{!this.arrived&&c==="SELECT"&&(this.arrived=!0,this.onComplete())})}handleTapCustom(e,n){Math.abs(n-this.buttonRow)<=0&&e>=this.buttonCol&&e<this.buttonCol+"[continue]".length&&(this.arrived=!0,this.onComplete())}update(e){super.update(e),!this.arrived&&(this.elapsed+=e)}renderContent(e,n,i){var p;this.lastContentTop=n,this.lastContentBottom=i;const o=Math.floor((n+i)/2),r=((p=e[0])==null?void 0:p.length)??40,s=this.getOutcomeColor();L(e,o-2,this.outcomeLabel,s,"black"),this.score!==null&&L(e,o,`SCORE: ${this.score} / 100`,"white","black");const a=Math.round(this.damageFraction*100),c=a===0?"bright-green":"yellow";L(e,o+2,`HULL DAMAGE: ${a}%`,c,"black");const l="[continue]",h=o+5,d=Math.floor((r-l.length)/2);this.buttonRow=h,this.buttonCol=d,L(e,h,l,"bright-green","black")}getOutcomeColor(){return this.score===null||this.score<40?"red":this.score<70?"yellow":"bright-green"}}class Pr{constructor(e){this.onBegin=e.onBegin}isActive(){return!0}}const Sn=1200,Hr=40,Br=80,Ur={asteroid_belt:"ASTEROID BELT",space_debris:"DEBRIS FIELD",space_storm:"SPACE STORM"},Gr={asteroid_belt:"DENSE ROCK FIELD DETECTED ON JUMP EXIT. BRACE FOR IMPACT.",space_debris:"COLLISION ALERT — DEBRIS FIELD ON APPROACH. REDUCE SPEED.",space_storm:"ELECTROMAGNETIC STORM DETECTED. HOLD STEADY."},$r=["_","-","=","|"];class Wr extends Pr{constructor(e){super(e),this.phase="incoming",this.phaseAccum=0,this.charCount=0,this.wrappedText=[],this.encounterType=e.encounterType;const n=Gr[this.encounterType];this.wrappedText=De(n,20)}update(e){if(this.phaseAccum+=e,this.phase==="incoming"&&this.phaseAccum>=Sn&&(this.phase="typing"),this.phase==="typing"){const n=this.phaseAccum-Sn,i=Math.floor(n/Hr);this.charCount=Math.min(i,this.getTotalCharCount()),this.charCount>=this.getTotalCharCount()&&(this.phase="complete")}}handleAction(e){this.phase!=="incoming"&&(e==="SELECT"||e==="NAV_1")&&(this.phase==="typing"?(this.charCount=this.getTotalCharCount(),this.phase="complete"):this.phase==="complete"&&this.onBegin())}handleTap(e,n){this.phase==="typing"?(this.charCount=this.getTotalCharCount(),this.phase="complete"):this.phase==="complete"&&this.onBegin()}render(e,n,i,o,r){this.phase==="incoming"?this.renderSpeakerBar(e,n,i,o,r):(this.renderMessagePanel(e,n,i,o,r),this.renderSpeakerBar(e,n,i,o,r))}renderSpeakerBar(e,n,i,o,r){const s=i-1,a=o+2,c="<)) ";g(e,s,a,c,"cyan","black");const l=Math.floor(this.phaseAccum/Br),h=$r,d=Math.min(a+12,r);for(let p=a+c.length;p<d;p++){const u=(p-(a+c.length)+l)%h.length,m=h[u];g(e,s,p,m,"cyan","black")}}renderMessagePanel(e,n,i,o,r){const s=n+1,a=i-2,c=r-o,l=Ur[this.encounterType],h=Math.floor((c-l.length)/2)+o;g(e,s,h,l,"bright-yellow","black");let d=this.charCount,p=0,u=0;for(const m of this.wrappedText){const f=s+2+p;if(f>=a)break;const y=m.length,b=Math.min(y,Math.max(0,d-u)),x=m.substring(0,b),_=o+1;g(e,f,_,x,"white","black"),u+=y,p++}if(this.phase==="complete"){const m="[ CONTINUE ]",f=a-1,y=Math.floor((c-m.length)/2)+o;g(e,f,y,m,"bright-green","black")}}getTotalCharCount(){return this.wrappedText.reduce((e,n)=>e+n.length,0)}}class rt extends J{constructor(e,n,i,o){super(e,n,i,{navOptions:o.navOptions,title:o.title}),this._completed=!1,this._onComplete=o.onComplete,this._canvasWidth=o.canvasWidth,this._canvasHeight=o.canvasHeight}renderContent(e,n,i){var u;const o=((u=e[0])==null?void 0:u.length)??0,r=e.length,s=i-n,a=this._canvasWidth??o,c=this._canvasHeight??s;let l=Math.floor((o-a)/2),h=n+Math.floor((s-c)/2);const d=Math.max(0,o-a),p=Math.max(0,r-c);l=Math.max(0,Math.min(l,d)),h=Math.max(0,Math.min(h,p)),this.renderGame(e,{top:h,left:l,width:a,height:c})}complete(e){var n;this._completed||(this._completed=!0,(n=this._onComplete)==null||n.call(this,e))}}function Kr(t){if(t.length===0)return 2166136261;let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e=Math.imul(e,16777619)>>>0;return e===0?1:e}function Yr(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}const ne=1;class jr extends rt{constructor(e,n,i,o){const r=i.destinationId??"";super(e,n,i,{navOptions:[],title:"DOCKING",canvasWidth:32,canvasHeight:18,onComplete:o}),this.heldKeys=new Set,this.lastActionTime=0,this.actionTimeoutMs=200,this.canvasWidth=32,this.canvasHeight=18,this.countdownSeconds=15,this.thrustForce=8,this.maxVelocity=6,this.driftIntervalMs=3e3,this.driftMaxDistanceChars=4,this.driftSpeedCharsPerSec=.8,this.perfectRadiusChars=5,this.airlockWidth=5,this.airlockHeight=3,this.lastViewport={top:0,left:0,width:32,height:18},this._joystick=null,this._primaryInput=n.primaryInput,this.rand=Yr(Kr(r));const s=(this.canvasWidth-1)/2,a=(this.canvasHeight-1)/2;this.state={shipX:s,shipY:a,shipVelX:0,shipVelY:0,airlockX:s,airlockY:a,driftTargetX:s,driftTargetY:a,driftTimer:this.driftIntervalMs*(.8+.4*this.rand()),timeRemaining:this.countdownSeconds,completed:!1},e.onTouchTrack&&e.onTouchTrack({start:(c,l,h)=>{l<X||(this._joystick={centerCol:c,centerRow:l,currentCol:c,currentRow:l,id:h})},move:(c,l,h)=>{!this._joystick||this._joystick.id!==h||(this._joystick.currentCol=c,this._joystick.currentRow=l)},end:c=>{var l;((l=this._joystick)==null?void 0:l.id)===c&&(this._joystick=null,this.heldKeys.clear())}})}renderContent(e,n,i){var u;const o=((u=e[0])==null?void 0:u.length)??0,r=e.length,s=i-n,a=this.canvasWidth,c=this._primaryInput==="touch"?this.canvasHeight:this.canvasHeight+3;let l=Math.floor((o-a)/2),h=n+Math.floor((s-c)/2);const d=Math.max(0,o-this.canvasWidth),p=Math.max(0,r-this.canvasHeight);l=Math.max(0,Math.min(l,d)),h=Math.max(0,Math.min(h,p)),this.renderGame(e,{top:h,left:l,width:this.canvasWidth,height:this.canvasHeight})}handleAction(e){if(super.handleAction(e),e==="MENU"){this.state.completed||(this.state.completed=!0,this.complete({outcome:"skipped"}));return}(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&(this.heldKeys.add(e),this.lastActionTime=performance.now())}handleTap(e,n){if(this.state.completed){super.handleTap(e,n);return}if(this._primaryInput==="touch"){super.handleTap(e,n);return}const{top:i,left:o,width:r,height:s}=this.lastViewport,a=o+Math.floor(r/2),c=i+s,l=c+1,h=c+3,d=a-5,p=a+3,u=a;n===l&&e>=u-1&&e<=u+1?this.handleAction("UP"):n===h&&e>=u-1&&e<=u+1?this.handleAction("DOWN"):e>=d&&e<=d+2&&n===l+1?this.handleAction("LEFT"):e>=p&&e<=p+2&&n===l+1?this.handleAction("RIGHT"):super.handleTap(e,n)}update(e){super.update(e);const n=e/1e3;if(!this.state.completed){if(this._joystick){const i=this._joystick.currentCol-this._joystick.centerCol,o=this._joystick.currentRow-this._joystick.centerRow;this.heldKeys.clear(),o<-ne&&this.heldKeys.add("UP"),o>ne&&this.heldKeys.add("DOWN"),i<-ne&&this.heldKeys.add("LEFT"),i>ne&&this.heldKeys.add("RIGHT")}else this.clearExpiredActions();if(this.updateMovement(n),this.updateAirlockDrift(n),this.updateCountdown(n),this.state.timeRemaining<=0){const i=Math.hypot(this.state.shipX-this.state.airlockX,this.state.shipY-this.state.airlockY),o=1.5,r=i<=o?100:Math.round(Math.max(0,Math.min(1,1/(1+(i-o)/this.perfectRadiusChars)))*100);this.state.completed=!0,this.complete({outcome:"completed",result:{score:r}})}}}updateMovement(e){const n=this.state;this.heldKeys.has("UP")&&(n.shipVelY-=this.thrustForce*e),this.heldKeys.has("DOWN")&&(n.shipVelY+=this.thrustForce*e),this.heldKeys.has("LEFT")&&(n.shipVelX-=this.thrustForce*e),this.heldKeys.has("RIGHT")&&(n.shipVelX+=this.thrustForce*e),n.shipVelX=Math.max(-this.maxVelocity,Math.min(this.maxVelocity,n.shipVelX)),n.shipVelY=Math.max(-this.maxVelocity,Math.min(this.maxVelocity,n.shipVelY)),n.shipX+=n.shipVelX*e,n.shipY+=n.shipVelY*e;const i=.5;n.shipX=Math.max(i,Math.min(this.canvasWidth-1-i,n.shipX)),n.shipY=Math.max(i,Math.min(this.canvasHeight-1-i,n.shipY))}updateAirlockDrift(e){const n=this.state,i=n.driftTargetX-n.airlockX,o=n.driftTargetY-n.airlockY,r=Math.hypot(i,o);if(r<.1){const s=this.rand()*2*Math.PI,a=this.rand()*this.driftMaxDistanceChars,c=(this.canvasWidth-1)/2,l=(this.canvasHeight-1)/2;n.driftTargetX=c+Math.cos(s)*a,n.driftTargetY=l+Math.sin(s)*a,n.driftTimer=this.driftIntervalMs*(.8+.4*this.rand())}else{const s=this.driftSpeedCharsPerSec*e,a=Math.min(1,s/r);n.airlockX+=i*a,n.airlockY+=o*a}}updateCountdown(e){this.state.timeRemaining=Math.max(0,this.state.timeRemaining-e)}clearExpiredActions(){performance.now()-this.lastActionTime>this.actionTimeoutMs&&this.heldKeys.clear()}renderGame(e,n){const{top:i,left:o,width:r,height:s}=n;this.lastViewport={top:i,left:o,width:r,height:s},this.drawBorder(e,i,o,r,s),this.drawAirlock(e,i,o),this.drawShip(e,i,o),this.drawCountdown(e,i,o,r),this.drawDistance(e,i,o,s),this._primaryInput==="touch"?this._renderJoystick(e,n):this.drawControlButtons(e,i,o,r,s)}_renderJoystick(e,n){const{top:i,left:o,width:r,height:s}=n,a=(f,y,b,x)=>{var _;f<0||f>=e.length||y<0||y>=(((_=e[f])==null?void 0:_.length)??0)||(e[f][y]={char:b,fg:x,bg:"black"})};if(!this._joystick){const f="DRAG TO DOCK",y=i+s-2,b=o+Math.floor((r-f.length)/2);g(e,y,b,f,"bright-black","black");return}const{centerCol:c,centerRow:l,currentCol:h,currentRow:d}=this._joystick,p=h-c,u=d-l,m=this.heldKeys.size>0;a(l,c,"o",m?"bright-white":"white"),u<-ne&&a(l-2,c,"^","bright-green"),u>ne&&a(l+2,c,"v","bright-green"),p<-ne&&a(l,c-2,"<","bright-green"),p>ne&&a(l,c+2,">","bright-green")}drawBorder(e,n,i,o,r){const s=i+o-1,a=n+r-1;for(let c=i;c<=s;c++)n<e.length&&c<e[n].length&&(e[n][c]={char:"+",fg:"white",bg:"black"}),a<e.length&&c<e[a].length&&(e[a][c]={char:"+",fg:"white",bg:"black"});for(let c=n+1;c<a;c++)c<e.length&&(i<e[c].length&&(e[c][i]={char:"|",fg:"white",bg:"black"}),s<e[c].length&&(e[c][s]={char:"|",fg:"white",bg:"black"}))}drawAirlock(e,n,i){const o=i+1+Math.round(this.state.airlockX),r=n+1+Math.round(this.state.airlockY),s=o-Math.floor(this.airlockWidth/2),a=r-Math.floor(this.airlockHeight/2),c=[["+","-","+","-","+"],["|"," ","+"," ","|"],["+","-","+","-","+"]];for(let l=0;l<this.airlockHeight;l++)for(let h=0;h<this.airlockWidth;h++){const d=a+l,p=s+h;if(d>=n&&d<n+this.canvasHeight&&p>=i&&p<i+this.canvasWidth&&d<e.length&&p<e[d].length){const u=c[l][h];e[d][p]={char:u,fg:"bright-yellow",bg:"black"}}}}drawShip(e,n,i){const o=i+1+Math.round(this.state.shipX),r=n+1+Math.round(this.state.shipY);o>=i&&o<i+this.canvasWidth&&r>=n&&r<n+this.canvasHeight&&(r<e.length&&o<e[r].length&&(e[r][o]={char:"(",fg:"bright-green",bg:"black"}),o+1<i+this.canvasWidth&&r<e.length&&o+1<e[r].length&&(e[r][o+1]={char:"+",fg:"bright-green",bg:"black"}),o+2<i+this.canvasWidth&&r<e.length&&o+2<e[r].length&&(e[r][o+2]={char:")",fg:"bright-green",bg:"black"}))}drawCountdown(e,n,i,o){const r=`T: ${Math.ceil(this.state.timeRemaining)}`,s=i+o-1-r.length,a=n+1;g(e,a,s,r,"white","black")}drawDistance(e,n,i,o){const s=`DIST: ${Math.hypot(this.state.shipX-this.state.airlockX,this.state.shipY-this.state.airlockY).toFixed(1)}`,a=n+o-1;g(e,a,i+2,s,"white","black")}drawControlButtons(e,n,i,o,r){const s=e.length,a=s>0?e[0].length:0,c=n+r,l=i+Math.floor(o/2),h=this.heldKeys.has("UP"),d=this.heldKeys.has("DOWN"),p=this.heldKeys.has("LEFT"),u=this.heldKeys.has("RIGHT"),m="bright-green",f="bright-black",y=C=>`[${C}]`,b=c+1,x=c+2,_=c+3,k=l-5,v=l+3;if(b<s&&l-1>=0&&l+1<a){const C=y("^"),w=l-1;for(let T=0;T<C.length;T++)w+T>=0&&w+T<a&&(e[b][w+T]={char:C[T],fg:h?m:f,bg:"black"})}if(x<s){const C=y("<");for(let T=0;T<C.length;T++)k+T>=0&&k+T<a&&(e[x][k+T]={char:C[T],fg:p?m:f,bg:"black"});const w=y(">");for(let T=0;T<w.length;T++)v+T>=0&&v+T<a&&(e[x][v+T]={char:w[T],fg:u?m:f,bg:"black"})}if(_<s&&l-1>=0&&l+1<a){const C=y("v"),w=l-1;for(let T=0;T<C.length;T++)w+T>=0&&w+T<a&&(e[_][w+T]={char:C[T],fg:d?m:f,bg:"black"})}}}function ti(t,e,n,i,o,r){let{x:s,y:a,vx:c,vy:l}=t;c*=n.airResistance**r,l+=n.gravity*r,e.up&&(l-=n.thrustForce*r),e.down&&(l+=n.thrustForce*r),e.left&&(c-=n.thrustForce*r),e.right&&(c+=n.thrustForce*r);const h=n.maxVerticalSpeed??n.thrustForce*3;return c=Math.max(-h,Math.min(h,c)),l=Math.max(-h,Math.min(h,l)),s+=c*r,a+=l*r,s=Math.max(0,Math.min(i-o,s)),{x:s,y:a,vx:c,vy:l}}function Vr(t){if(t.length===0)return 2166136261;let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e=Math.imul(e,16777619)>>>0;return e===0?1:e}function qr(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function ni(t,e,n,i,o){const r=qr(Vr(t)),s=3,a=Math.min(5,Math.floor(n/2)),c=s+Math.floor(r()*(a-s+1)),l=n-c,h=[];for(let u=0;u<e;u++){const m=Math.floor(r()*3)-1;h.push(Math.max(l-1,Math.min(l+1,l+m)))}const d=Math.max(0,e-i),p=Math.floor(r()*(d+1));for(let u=p;u<p+i&&u<e;u++)h[u]=l;return h.map((u,m)=>({surfaceRow:u,isPad:m>=p&&m<p+i}))}function ii(t,e,n){const i=Math.floor(t),o=i+2;for(let r=i;r<=o;r++)if(!(r<0||r>=n.length)&&e>=n[r].surfaceRow)return!0;return!1}function oi(t,e,n,i,o,r){for(let s=0;s<e.length;s++){const a=e[s],c=i+s;if(c<0)continue;let l;if(a.isPad){const u=s>0&&e[s-1].isPad,m=s<e.length-1&&e[s+1].isPad;u?m?l="=":l="]":l="["}else r==="asteroid"?l="/":l="^";const h=r==="asteroid"?"*":"#",d=a.isPad?"bright-yellow":"white",p=n+a.surfaceRow;for(let u=p;u<n+o;u++){if(u<0||u>=t.length||c>=t[u].length)continue;const m=u===p;t[u][c]={char:m?l:h,fg:d,bg:"black"}}}}const bt=3,Mn=2,Xr=1/60,ie=1;class zr extends rt{constructor(e,n,i,o){super(e,n,i,{navOptions:[],title:"LANDING",onComplete:o}),this._ship={x:0,y:0,vx:0,vy:1},this._heldKeys=new Set,this._lastActionTime=0,this._actionTimeoutMs=200,this._terrain=null,this._viewport=null,this._landed=!1,this._joystick=null,this._destId=i.destinationId??"",this._primaryInput=n.primaryInput;const{surface:r}=F().miniGames;this._gravityAccel=r.gravityAccel,this._airResistance=r.airResistance,this._thrustForce=r.thrustForce,this._maxSafeSpeed=r.maxSafeSpeed,this._crashSpeed=r.crashSpeed,this._offPadScoreMultiplier=r.offPadScoreMultiplier,this._padWidth=r.padWidth,this._maxSpeed=r.maxSpeed,e.onTouchTrack&&e.onTouchTrack({start:(s,a,c)=>{a<X||(this._joystick={centerCol:s,centerRow:a,currentCol:s,currentRow:a,id:c})},move:(s,a,c)=>{!this._joystick||this._joystick.id!==c||(this._joystick.currentCol=s,this._joystick.currentRow=a)},end:s=>{var a;((a=this._joystick)==null?void 0:a.id)===s&&(this._joystick=null,this._heldKeys.clear())}})}handleAction(e){if(super.handleAction(e),e==="MENU"){this._landed||(this._landed=!0,this.complete({outcome:"skipped"}));return}this._primaryInput!=="touch"&&(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&(this._heldKeys.add(e),this._lastActionTime=performance.now())}update(e){if(super.update(e),this._landed||!this._terrain||!this._viewport)return;if(this._joystick){const r=this._joystick.currentCol-this._joystick.centerCol,s=this._joystick.currentRow-this._joystick.centerRow;this._heldKeys.clear(),s<-ie&&this._heldKeys.add("UP"),s>ie&&this._heldKeys.add("DOWN"),r<-ie&&this._heldKeys.add("LEFT"),r>ie&&this._heldKeys.add("RIGHT")}else this._clearExpiredKeys();const n={gravity:this._gravityAccel,airResistance:this._airResistance,thrustForce:this._thrustForce,maxVerticalSpeed:this._maxSpeed},i={up:this._heldKeys.has("UP"),down:this._heldKeys.has("DOWN"),left:this._heldKeys.has("LEFT"),right:this._heldKeys.has("RIGHT")};let o=e/1e3;for(;o>0&&!this._landed;){const r=Math.min(o,Xr);o-=r,this._ship=ti(this._ship,i,n,this._viewport.width,bt,r);const s=this._ship.y+(Mn-1);if(ii(this._ship.x,s,this._terrain)){const a=Math.hypot(this._ship.vx,this._ship.vy);this._snapToSurface(),this._land(a);break}}}_snapToSurface(){if(!this._terrain)return;const e=Math.floor(this._ship.x),n=e+bt-1;let i=1/0;for(let o=e;o<=n;o++)o>=0&&o<this._terrain.length&&(i=Math.min(i,this._terrain[o].surfaceRow));i<1/0&&(this._ship={...this._ship,y:i-Mn,vx:0,vy:0})}_land(e){if(this._landed)return;this._landed=!0;const n=e??Math.hypot(this._ship.vx,this._ship.vy),i=Math.max(0,Math.min(1,1-(n-this._maxSafeSpeed)/(this._crashSpeed-this._maxSafeSpeed))),o=Math.floor(this._ship.x)+1,r=this._terrain,s=o>=0&&o<r.length&&r[o].isPad,a=s?1:this._offPadScoreMultiplier,c=Math.round(i*a*100);this.complete({outcome:"completed",result:{score:c,speed:n,onPad:s}})}_clearExpiredKeys(){performance.now()-this._lastActionTime>this._actionTimeoutMs&&this._heldKeys.clear()}renderGame(e,n){this._terrain||(this._terrain=ni(this._destId,n.width,n.height,this._padWidth),this._ship={x:(n.width-bt)/2,y:1,vx:0,vy:1}),this._viewport=n,oi(e,this._terrain,n.top,n.left,n.height,"planet"),this._renderShip(e,n),this._renderHUD(e,n),this._renderJoystick(e,n)}_renderShip(e,n){var s;const i=n.left+Math.round(this._ship.x),o=n.top+Math.round(this._ship.y),r=[["-","v","-"],["(","+",")"]];for(let a=0;a<r.length;a++)for(let c=0;c<r[a].length;c++){const l=o+a,h=i+c;l<0||l>=e.length||h<0||h>=(((s=e[l])==null?void 0:s.length)??0)||(e[l][h]={char:r[a][c],fg:"bright-green",bg:"black"})}}_renderHUD(e,n){const i=Math.hypot(this._ship.vx,this._ship.vy),o=`SPD:${i.toFixed(1)}`,r=n.left+n.width-o.length;if(g(e,n.top+1,r,o,"white","black"),i>this._maxSafeSpeed){const s="!! FAST",a=n.left+n.width-s.length;g(e,n.top+2,a,s,"bright-yellow","black")}}_renderJoystick(e,n){if(this._primaryInput!=="touch")return;if(!this._joystick){const d="HOLD & DRAG TO THRUST",p=this._terrain?Math.min(...this._terrain.map(f=>f.surfaceRow)):n.height-2,u=n.top+Math.max(0,p-2),m=n.left+Math.floor((n.width-d.length)/2);g(e,u,m,d,"bright-black","black");return}const{centerCol:i,centerRow:o,currentCol:r,currentRow:s}=this._joystick,a=r-i,c=s-o,l=this._heldKeys.size>0,h=(d,p,u,m)=>{var f;d<0||d>=e.length||p<0||p>=(((f=e[d])==null?void 0:f.length)??0)||(e[d][p]={char:u,fg:m,bg:"black"})};h(o,i,"o",l?"bright-white":"white"),c<-ie&&h(o-2,i,"^","bright-green"),c>ie&&h(o+2,i,"v","bright-green"),a<-ie&&h(o,i-2,"<","bright-green"),a>ie&&h(o,i+2,">","bright-green")}}const wt=3,In=2,Qr=1/60,oe=1;class Jr extends rt{constructor(e,n,i,o){super(e,n,i,{navOptions:[],title:"LANDING",onComplete:o}),this._ship={x:0,y:0,vx:0,vy:1},this._heldKeys=new Set,this._lastActionTime=0,this._actionTimeoutMs=200,this._terrain=null,this._viewport=null,this._landed=!1,this._joystick=null,this._destId=i.destinationId??"",this._primaryInput=n.primaryInput;const{asteroid:r}=F().miniGames;this._thrustForce=r.thrustForce,this._maxSafeSpeed=r.maxSafeSpeed,this._crashSpeed=r.crashSpeed,this._offPadScoreMultiplier=r.offPadScoreMultiplier,this._padWidth=r.padWidth,this._initialDownwardVelocity=r.initialDownwardVelocity,this._maxSpeed=r.maxSpeed,e.onTouchTrack&&e.onTouchTrack({start:(s,a,c)=>{a<X||(this._joystick={centerCol:s,centerRow:a,currentCol:s,currentRow:a,id:c})},move:(s,a,c)=>{!this._joystick||this._joystick.id!==c||(this._joystick.currentCol=s,this._joystick.currentRow=a)},end:s=>{var a;((a=this._joystick)==null?void 0:a.id)===s&&(this._joystick=null,this._heldKeys.clear())}})}handleAction(e){if(super.handleAction(e),e==="MENU"){this._landed||(this._landed=!0,this.complete({outcome:"skipped"}));return}this._primaryInput!=="touch"&&(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&(this._heldKeys.add(e),this._lastActionTime=performance.now())}update(e){if(super.update(e),this._landed||!this._terrain||!this._viewport)return;if(this._joystick){const r=this._joystick.currentCol-this._joystick.centerCol,s=this._joystick.currentRow-this._joystick.centerRow;this._heldKeys.clear(),s<-oe&&this._heldKeys.add("UP"),s>oe&&this._heldKeys.add("DOWN"),r<-oe&&this._heldKeys.add("LEFT"),r>oe&&this._heldKeys.add("RIGHT")}else this._clearExpiredKeys();const n={gravity:0,airResistance:1,thrustForce:this._thrustForce,maxVerticalSpeed:this._maxSpeed},i={up:this._heldKeys.has("UP"),down:this._heldKeys.has("DOWN"),left:this._heldKeys.has("LEFT"),right:this._heldKeys.has("RIGHT")};let o=e/1e3;for(;o>0&&!this._landed;){const r=Math.min(o,Qr);o-=r,this._ship=ti(this._ship,i,n,this._viewport.width,wt,r);const s=this._ship.y+(In-1);if(ii(this._ship.x,s,this._terrain)){const a=Math.hypot(this._ship.vx,this._ship.vy);this._snapToSurface(),this._land(a);break}}}_snapToSurface(){if(!this._terrain)return;const e=Math.floor(this._ship.x),n=e+wt-1;let i=1/0;for(let o=e;o<=n;o++)o>=0&&o<this._terrain.length&&(i=Math.min(i,this._terrain[o].surfaceRow));i<1/0&&(this._ship={...this._ship,y:i-In,vx:0,vy:0})}_land(e){if(this._landed)return;this._landed=!0;const n=e??Math.hypot(this._ship.vx,this._ship.vy),i=Math.max(0,Math.min(1,1-(n-this._maxSafeSpeed)/(this._crashSpeed-this._maxSafeSpeed))),o=Math.floor(this._ship.x)+1,r=this._terrain,s=o>=0&&o<r.length&&r[o].isPad,a=s?1:this._offPadScoreMultiplier,c=Math.round(i*a*100);this.complete({outcome:"completed",result:{score:c,speed:n,onPad:s}})}_clearExpiredKeys(){performance.now()-this._lastActionTime>this._actionTimeoutMs&&this._heldKeys.clear()}renderGame(e,n){this._terrain||(this._terrain=ni(this._destId,n.width,n.height,this._padWidth),this._ship={x:(n.width-wt)/2,y:1,vx:0,vy:this._initialDownwardVelocity}),this._viewport=n,oi(e,this._terrain,n.top,n.left,n.height,"asteroid"),this._renderShip(e,n),this._renderHUD(e,n),this._renderJoystick(e,n)}_renderShip(e,n){var s;const i=n.left+Math.round(this._ship.x),o=n.top+Math.round(this._ship.y),r=[["-","v","-"],["(","+",")"]];for(let a=0;a<r.length;a++)for(let c=0;c<r[a].length;c++){const l=o+a,h=i+c;l<0||l>=e.length||h<0||h>=(((s=e[l])==null?void 0:s.length)??0)||(e[l][h]={char:r[a][c],fg:"bright-green",bg:"black"})}}_renderHUD(e,n){const i=Math.hypot(this._ship.vx,this._ship.vy),o=`SPD:${i.toFixed(1)}`,r=n.left+n.width-o.length;if(g(e,n.top+1,r,o,"white","black"),i>this._maxSafeSpeed){const s="!! FAST",a=n.left+n.width-s.length;g(e,n.top+2,a,s,"bright-yellow","black")}}_renderJoystick(e,n){if(this._primaryInput!=="touch")return;if(!this._joystick){const d="HOLD & DRAG TO THRUST",p=this._terrain?Math.min(...this._terrain.map(f=>f.surfaceRow)):n.height-2,u=n.top+Math.max(0,p-2),m=n.left+Math.floor((n.width-d.length)/2);g(e,u,m,d,"bright-black","black");return}const{centerCol:i,centerRow:o,currentCol:r,currentRow:s}=this._joystick,a=r-i,c=s-o,l=this._heldKeys.size>0,h=(d,p,u,m)=>{var f;d<0||d>=e.length||p<0||p>=(((f=e[d])==null?void 0:f.length)??0)||(e[d][p]={char:u,fg:m,bg:"black"})};h(o,i,"o",l?"bright-white":"white"),c<-oe&&h(o-2,i,"^","bright-green"),c>oe&&h(o+2,i,"v","bright-green"),a<-oe&&h(o,i-2,"<","bright-green"),a>oe&&h(o,i+2,">","bright-green")}}function Zr(t){if(t.length===0)return 2166136261;let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e=Math.imul(e,16777619)>>>0;return e===0?1:e}function es(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}class ts extends rt{constructor(e,n,i,o,r){super(e,n,i,{navOptions:[],title:"NAVIGATION",onComplete:r}),this.heldKeys=new Set,this.lastViewport={top:0,left:0,width:80,height:24},this._joystick=null,this.initialized=!1,this._primaryInput=n.primaryInput;let s=null,a=null;o instanceof URLSearchParams?(s=o.get("type"),a=o.get("difficulty")):(s=o.type??null,a=o.difficulty??null),this.eventType=s??"asteroid_belt",this.difficulty=a??"normal";const c=Zr(i.destinationId??"");this.rand=es(c),F().miniGames.navigation.difficulties[this.difficulty].targetDistance,this.state={playerWorldX:0,playerWorldY:0,playerVelX:0,playerVelY:0,cameraScrollY:-8,obstacles:[],spawnFrontierY:0,lastEdgeSpawnFrame:0,frameCount:0,completed:!1,collisionFlashEndTime:0,outcome:"idle",lives:3,invincibilityEndTime:0},e.onTouchTrack&&e.onTouchTrack({start:(p,u,m)=>{u<X||(this._joystick={centerCol:p,centerRow:u,currentCol:p,currentRow:u,id:m})},move:(p,u,m)=>{!this._joystick||this._joystick.id!==m||(this._joystick.currentCol=p,this._joystick.currentRow=u)},end:p=>{var u;((u=this._joystick)==null?void 0:u.id)===p&&(this._joystick=null,this.heldKeys.clear())}})}handleAction(e){if(super.handleAction(e),e==="MENU"){this.state.completed||(this.state.completed=!0,this.complete({outcome:"skipped"}));return}(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&this.heldKeys.add(e)}update(e){if(super.update(e),this.state.completed)return;const n=e/1e3,o=F().miniGames.navigation,r=o.difficulties[this.difficulty],s=o.ship;if(this._joystick){const c=this._joystick.currentCol-this._joystick.centerCol,l=this._joystick.currentRow-this._joystick.centerRow;this.heldKeys.clear(),l<-1&&this.heldKeys.add("UP"),l>1&&this.heldKeys.add("DOWN"),c<-1&&this.heldKeys.add("LEFT"),c>1&&this.heldKeys.add("RIGHT")}this.updateInput(s),this.updatePosition(n,r),this.spawnObstacles(this.lastViewport,r,o),this.updateObstacles(n,r,this.lastViewport),this.checkCollisions(this.lastViewport),this.checkVictory(r),this.state.outcome==="collision"&&this.state.lives>0&&performance.now()>this.state.collisionFlashEndTime&&(this.state.outcome="idle"),this.state.frameCount++}updateInput(e){const n=e.accelerationImpulse,i=e.maxSpeedLateral,o=e.maxSpeedForward;this.heldKeys.has("LEFT")&&(this.state.playerVelX>0&&(this.state.playerVelX=0),this.state.playerVelX-=n),this.heldKeys.has("RIGHT")&&(this.state.playerVelX<0&&(this.state.playerVelX=0),this.state.playerVelX+=n),this.heldKeys.has("UP")&&(this.state.playerVelY<0&&(this.state.playerVelY=0),this.state.playerVelY+=n),this.heldKeys.has("DOWN")&&(this.state.playerVelY-=n);const r=.98;!this.heldKeys.has("LEFT")&&!this.heldKeys.has("RIGHT")&&(this.state.playerVelX*=r),this.state.playerVelX=Math.max(-i,Math.min(i,this.state.playerVelX)),this.state.playerVelY=Math.max(-o,Math.min(o,this.state.playerVelY)),this.heldKeys.clear()}updatePosition(e,n){const i=n.minScrollSpeed,o=Math.max(this.state.playerVelY,i),{width:r}=this.lastViewport;this.state.playerWorldX+=this.state.playerVelX*e,this.state.playerWorldX=Math.max(1,Math.min(r-2,this.state.playerWorldX)),this.state.playerWorldY+=o*e,this.state.cameraScrollY+=o*e}spawnObstacles(e,n,i){const{width:o,height:r}=e,s=n.obstacleDensity,a=n.edgeSpawnIntervalFrames,c=n.driftSpeedMax,l=i.eventTypes[this.eventType],h=r,d=this.state.spawnFrontierY,p=d+h,m=this.state.cameraScrollY+r;if(d<m){this.state.spawnFrontierY+=h;let f=0;for(const b of this.state.obstacles){const x=b.worldY+5;b.worldY<p&&x>d&&f++}const y=Math.ceil(s*h);for(;f<y;)this.spawnObstacleInBand(d,p,o,n,l,c),f++}if(this.state.frameCount-this.state.lastEdgeSpawnFrame>=a){this.state.lastEdgeSpawnFrame=this.state.frameCount;const f=this.rand()<.5?"left":"right",y=this.state.cameraScrollY+r+(this.rand()-.5)*20;this.spawnObstacleAtEdge(f,y,o,n,l,c)}}spawnObstacleInBand(e,n,i,o,r,s){const a=this.pickSize(r),c=this.createObstacle(a,o,s);c.worldY=e+this.rand()*(n-e),c.worldX=Math.max(0,Math.min(i-2,this.rand()*i)),this.state.obstacles.push(c)}spawnObstacleAtEdge(e,n,i,o,r,s){const a=this.pickSize(r),c=this.createObstacle(a,o,s);c.worldY=n,e==="left"?(c.worldX=-10,c.driftVx=s*(.3+.4*this.rand())):(c.worldX=i+5,c.driftVx=-s*(.3+.4*this.rand())),this.state.obstacles.push(c)}pickSize(e){const n=this.rand();return n<e.large_ratio?"large":n<e.large_ratio+e.medium_ratio?"medium":"small"}createObstacle(e,n,i){const o=this.getObstacleCells(e);return{worldX:0,worldY:0,driftVx:0,driftVy:-Math.max(.1,i*(.3+.7*this.rand())),cells:o,size:e}}getObstacleCells(e){if(e==="large")if(this.eventType==="asteroid_belt"){const n=Math.floor(this.rand()*4);return n===0?[{dcol:2,drow:0,char:"#",color:"white"},{dcol:3,drow:0,char:"@",color:"white"},{dcol:1,drow:1,char:"@",color:"white"},{dcol:2,drow:1,char:"O",color:"bright-white"},{dcol:3,drow:1,char:"#",color:"white"},{dcol:4,drow:1,char:"@",color:"white"},{dcol:0,drow:2,char:"#",color:"white"},{dcol:1,drow:2,char:"@",color:"white"},{dcol:2,drow:2,char:"O",color:"bright-white"},{dcol:3,drow:2,char:"#",color:"white"},{dcol:4,drow:2,char:"@",color:"white"},{dcol:1,drow:3,char:"#",color:"white"},{dcol:2,drow:3,char:"@",color:"white"},{dcol:3,drow:3,char:"O",color:"bright-white"},{dcol:4,drow:3,char:"#",color:"white"},{dcol:2,drow:4,char:"#",color:"white"},{dcol:3,drow:4,char:"@",color:"white"},{dcol:2,drow:5,char:"O",color:"bright-white"}]:n===1?[{dcol:1,drow:0,char:"O",color:"bright-white"},{dcol:2,drow:0,char:"@",color:"white"},{dcol:3,drow:0,char:"O",color:"bright-white"},{dcol:0,drow:1,char:"#",color:"white"},{dcol:1,drow:1,char:"O",color:"bright-white"},{dcol:2,drow:1,char:"O",color:"bright-white"},{dcol:3,drow:1,char:"O",color:"bright-white"},{dcol:4,drow:1,char:"@",color:"white"},{dcol:0,drow:2,char:"@",color:"white"},{dcol:1,drow:2,char:"O",color:"bright-white"},{dcol:2,drow:2,char:"#",color:"white"},{dcol:3,drow:2,char:"O",color:"bright-white"},{dcol:4,drow:2,char:"#",color:"white"},{dcol:1,drow:3,char:"@",color:"white"},{dcol:2,drow:3,char:"O",color:"bright-white"},{dcol:3,drow:3,char:"@",color:"white"},{dcol:2,drow:4,char:"#",color:"white"}]:n===2?[{dcol:0,drow:0,char:"#",color:"white"},{dcol:1,drow:0,char:"#",color:"white"},{dcol:2,drow:0,char:"#",color:"white"},{dcol:3,drow:0,char:"@",color:"white"},{dcol:0,drow:1,char:"#",color:"white"},{dcol:1,drow:1,char:"O",color:"bright-white"},{dcol:2,drow:1,char:"@",color:"white"},{dcol:3,drow:1,char:"#",color:"white"},{dcol:4,drow:1,char:"@",color:"white"},{dcol:0,drow:2,char:"@",color:"white"},{dcol:1,drow:2,char:"#",color:"white"},{dcol:2,drow:2,char:"@",color:"white"},{dcol:3,drow:2,char:"O",color:"bright-white"},{dcol:4,drow:2,char:"#",color:"white"},{dcol:1,drow:3,char:"#",color:"white"},{dcol:2,drow:3,char:"@",color:"white"},{dcol:3,drow:3,char:"#",color:"white"},{dcol:2,drow:4,char:"#",color:"white"},{dcol:3,drow:4,char:"@",color:"white"},{dcol:2,drow:5,char:"#",color:"white"}]:[{dcol:1,drow:0,char:"#",color:"white"},{dcol:2,drow:0,char:"#",color:"white"},{dcol:3,drow:0,char:"@",color:"white"},{dcol:4,drow:0,char:"#",color:"white"},{dcol:0,drow:1,char:"@",color:"white"},{dcol:1,drow:1,char:"O",color:"bright-white"},{dcol:2,drow:1,char:"O",color:"bright-white"},{dcol:3,drow:1,char:"O",color:"bright-white"},{dcol:4,drow:1,char:"#",color:"white"},{dcol:5,drow:1,char:"@",color:"white"},{dcol:0,drow:2,char:"#",color:"white"},{dcol:1,drow:2,char:"@",color:"white"},{dcol:2,drow:2,char:"#",color:"white"},{dcol:3,drow:2,char:"@",color:"white"},{dcol:4,drow:2,char:"O",color:"bright-white"},{dcol:5,drow:2,char:"#",color:"white"},{dcol:1,drow:3,char:"#",color:"white"},{dcol:2,drow:3,char:"@",color:"white"},{dcol:3,drow:3,char:"#",color:"white"},{dcol:4,drow:3,char:"@",color:"white"},{dcol:2,drow:4,char:"#",color:"white"},{dcol:3,drow:4,char:"#",color:"white"},{dcol:3,drow:5,char:"@",color:"white"}]}else if(this.eventType==="space_debris"){const n=Math.floor(this.rand()*5);return n===0?[{dcol:0,drow:0,char:"[",color:"bright-black"},{dcol:1,drow:0,char:"=",color:"bright-black"},{dcol:2,drow:0,char:"=",color:"bright-black"},{dcol:3,drow:0,char:"]",color:"bright-black"},{dcol:0,drow:1,char:"-",color:"bright-black"},{dcol:1,drow:1,char:"[",color:"bright-black"},{dcol:2,drow:1,char:"]",color:"bright-black"},{dcol:3,drow:1,char:"-",color:"bright-black"},{dcol:1,drow:2,char:"=",color:"bright-black"},{dcol:2,drow:2,char:"=",color:"bright-black"}]:n===1?[{dcol:1,drow:0,char:"/",color:"bright-black"},{dcol:3,drow:0,char:"\\",color:"bright-black"},{dcol:0,drow:1,char:"-",color:"bright-black"},{dcol:1,drow:1,char:"[",color:"bright-black"},{dcol:2,drow:1,char:"=",color:"bright-black"},{dcol:3,drow:1,char:"]",color:"bright-black"},{dcol:4,drow:1,char:"-",color:"bright-black"},{dcol:1,drow:2,char:"\\",color:"bright-black"},{dcol:3,drow:2,char:"/",color:"bright-black"}]:n===2?[{dcol:1,drow:0,char:"=",color:"bright-black"},{dcol:2,drow:0,char:"-",color:"bright-black"},{dcol:0,drow:1,char:"/",color:"bright-black"},{dcol:1,drow:1,char:"[",color:"bright-black"},{dcol:2,drow:1,char:"]",color:"bright-black"},{dcol:3,drow:1,char:"\\",color:"bright-black"},{dcol:1,drow:2,char:"-",color:"bright-black"},{dcol:2,drow:2,char:"=",color:"bright-black"}]:n===3?[{dcol:0,drow:0,char:"\\",color:"bright-black"},{dcol:2,drow:0,char:"/",color:"bright-black"},{dcol:1,drow:1,char:"=",color:"bright-black"},{dcol:0,drow:2,char:"/",color:"bright-black"},{dcol:2,drow:2,char:"\\",color:"bright-black"},{dcol:3,drow:2,char:"=",color:"bright-black"}]:[{dcol:0,drow:0,char:"+",color:"bright-black"},{dcol:1,drow:0,char:"-",color:"bright-black"},{dcol:2,drow:0,char:"+",color:"bright-black"},{dcol:0,drow:1,char:"|",color:"bright-black"},{dcol:2,drow:1,char:"|",color:"bright-black"},{dcol:0,drow:2,char:"+",color:"bright-black"},{dcol:1,drow:2,char:"-",color:"bright-black"},{dcol:2,drow:2,char:"+",color:"bright-black"}]}else{const n=Math.floor(this.rand()*4);return n===0?[{dcol:0,drow:0,char:".",color:"cyan"},{dcol:2,drow:0,char:"'",color:"cyan"},{dcol:4,drow:0,char:"`",color:"cyan"},{dcol:1,drow:1,char:"`",color:"cyan"},{dcol:3,drow:1,char:",",color:"cyan"},{dcol:0,drow:2,char:"'",color:"cyan"},{dcol:2,drow:2,char:".",color:"cyan"},{dcol:4,drow:2,char:",",color:"cyan"},{dcol:1,drow:3,char:"`",color:"bright-cyan"},{dcol:3,drow:3,char:"'",color:"cyan"}]:n===1?[{dcol:1,drow:0,char:"*",color:"bright-cyan"},{dcol:3,drow:0,char:".",color:"cyan"},{dcol:0,drow:1,char:"'",color:"cyan"},{dcol:2,drow:1,char:",",color:"bright-cyan"},{dcol:4,drow:1,char:"`",color:"cyan"},{dcol:1,drow:2,char:".",color:"cyan"},{dcol:3,drow:2,char:"*",color:"bright-cyan"},{dcol:0,drow:3,char:"`",color:"cyan"},{dcol:4,drow:3,char:"'",color:"cyan"}]:n===2?[{dcol:2,drow:0,char:"*",color:"bright-cyan"},{dcol:0,drow:1,char:".",color:"cyan"},{dcol:1,drow:1,char:"'",color:"cyan"},{dcol:3,drow:1,char:",",color:"cyan"},{dcol:4,drow:1,char:"`",color:"bright-cyan"},{dcol:2,drow:2,char:"`",color:"cyan"},{dcol:1,drow:3,char:",",color:"bright-cyan"},{dcol:3,drow:3,char:".",color:"cyan"}]:[{dcol:1,drow:0,char:".",color:"bright-cyan"},{dcol:3,drow:0,char:"'",color:"cyan"},{dcol:0,drow:1,char:"`",color:"cyan"},{dcol:2,drow:1,char:"*",color:"bright-cyan"},{dcol:4,drow:1,char:",",color:"cyan"},{dcol:1,drow:2,char:"*",color:"cyan"},{dcol:3,drow:2,char:"`",color:"bright-cyan"},{dcol:2,drow:3,char:"'",color:"cyan"}]}else if(e==="medium"){if(this.eventType==="asteroid_belt")return Math.floor(this.rand()*2)===0?[{dcol:0,drow:0,char:"@",color:"bright-white"},{dcol:1,drow:0,char:"O",color:"white"},{dcol:0,drow:1,char:"#",color:"bright-white"},{dcol:1,drow:1,char:"@",color:"white"},{dcol:1,drow:2,char:"#",color:"white"}]:[{dcol:0,drow:0,char:"#",color:"white"},{dcol:1,drow:0,char:"@",color:"bright-white"},{dcol:2,drow:0,char:"O",color:"white"},{dcol:0,drow:1,char:"O",color:"bright-white"},{dcol:1,drow:1,char:"@",color:"white"}];if(this.eventType==="space_debris"){const n=Math.floor(this.rand()*4);return n===0?[{dcol:0,drow:0,char:"[",color:"bright-black"},{dcol:1,drow:0,char:"=",color:"bright-black"},{dcol:2,drow:0,char:"=",color:"bright-black"},{dcol:0,drow:1,char:"-",color:"bright-black"},{dcol:2,drow:1,char:"]",color:"bright-black"}]:n===1?[{dcol:0,drow:0,char:"/",color:"bright-black"},{dcol:1,drow:0,char:"[",color:"bright-black"},{dcol:2,drow:0,char:"\\",color:"bright-black"},{dcol:1,drow:1,char:"=",color:"bright-black"}]:n===2?[{dcol:0,drow:0,char:"\\",color:"bright-black"},{dcol:1,drow:0,char:"-",color:"bright-black"},{dcol:2,drow:0,char:"/",color:"bright-black"},{dcol:1,drow:1,char:"[",color:"bright-black"},{dcol:0,drow:1,char:"-",color:"bright-black"}]:[{dcol:0,drow:0,char:"(",color:"bright-black"},{dcol:1,drow:0,char:"=",color:"bright-black"},{dcol:2,drow:0,char:")",color:"bright-black"},{dcol:1,drow:1,char:"-",color:"bright-black"}]}else{const n=Math.floor(this.rand()*3);return n===0?[{dcol:0,drow:0,char:".",color:"bright-cyan"},{dcol:1,drow:0,char:"'",color:"cyan"},{dcol:2,drow:0,char:".",color:"bright-cyan"},{dcol:0,drow:1,char:"`",color:"cyan"},{dcol:1,drow:1,char:",",color:"bright-cyan"}]:n===1?[{dcol:0,drow:0,char:"'",color:"bright-cyan"},{dcol:1,drow:0,char:"*",color:"cyan"},{dcol:0,drow:1,char:",",color:"cyan"},{dcol:2,drow:1,char:"`",color:"bright-cyan"}]:[{dcol:0,drow:0,char:"`",color:"cyan"},{dcol:1,drow:0,char:".",color:"bright-cyan"},{dcol:2,drow:0,char:"'",color:"cyan"},{dcol:1,drow:1,char:"*",color:"bright-cyan"}]}}else if(this.eventType==="asteroid_belt"){const n=Math.floor(this.rand()*3);return n===0?[{dcol:0,drow:0,char:"*",color:"bright-white"},{dcol:1,drow:0,char:"o",color:"white"}]:n===1?[{dcol:0,drow:0,char:"o",color:"white"},{dcol:1,drow:0,char:"*",color:"bright-white"}]:[{dcol:0,drow:0,char:"@",color:"white"},{dcol:1,drow:0,char:"*",color:"bright-white"}]}else if(this.eventType==="space_debris"){const n=Math.floor(this.rand()*4);return n===0?[{dcol:0,drow:0,char:"+",color:"bright-black"},{dcol:1,drow:0,char:"=",color:"bright-black"}]:n===1?[{dcol:0,drow:0,char:"[",color:"bright-black"},{dcol:1,drow:0,char:"]",color:"bright-black"}]:n===2?[{dcol:0,drow:0,char:"/",color:"bright-black"},{dcol:1,drow:0,char:"\\",color:"bright-black"}]:[{dcol:0,drow:0,char:"-",color:"bright-black"},{dcol:1,drow:0,char:"=",color:"bright-black"}]}else{const n=Math.floor(this.rand()*4);return n===0?[{dcol:0,drow:0,char:".",color:"cyan"},{dcol:1,drow:0,char:"'",color:"bright-cyan"}]:n===1?[{dcol:0,drow:0,char:"`",color:"bright-cyan"},{dcol:1,drow:0,char:",",color:"cyan"}]:n===2?[{dcol:0,drow:0,char:"*",color:"bright-cyan"},{dcol:1,drow:0,char:".",color:"cyan"}]:[{dcol:0,drow:0,char:"'",color:"cyan"},{dcol:1,drow:0,char:"*",color:"bright-cyan"}]}}updateObstacles(e,n,i){const{height:o}=i;for(const r of this.state.obstacles)r.worldX+=r.driftVx*e,r.worldY+=r.driftVy*e;this.state.obstacles=this.state.obstacles.filter(r=>r.worldY+5>this.state.cameraScrollY-5)}checkCollisions(e){if(this.state.completed||performance.now()<this.state.invincibilityEndTime||this.state.lives<=0&&this.state.outcome==="collision")return;const{width:n,height:i,top:o,left:r}=e,s=r+Math.round(this.state.playerWorldX)-1,a=s+1,c=o+i-1-Math.round(this.state.playerWorldY-this.state.cameraScrollY);if(!(c<=o))for(const l of this.state.obstacles)for(const h of l.cells){const d=r+Math.round(l.worldX+h.dcol),p=o+i-1-Math.round(l.worldY+h.drow-this.state.cameraScrollY);if(!(p<=o)&&(d===s||d===a)&&p===c){this.triggerCollision();return}}}triggerCollision(){this.state.completed||(this.state.lives--,this.state.invincibilityEndTime=performance.now()+2e3,this.state.lives<=0?(this.state.outcome="collision",this.state.collisionFlashEndTime=performance.now()+400):(this.state.outcome="collision",this.state.collisionFlashEndTime=performance.now()+200))}checkVictory(e){if(!this.state.completed)if(this.state.playerWorldY>=e.targetDistance&&this.state.lives>0){this.state.outcome="victory",this.state.completed=!0;const n=Math.max(1,Math.round(100*(this.state.lives/3)));setTimeout(()=>{this.complete({outcome:"completed",result:{score:n}})},500)}else this.state.outcome==="collision"&&this.state.lives<=0&&performance.now()>this.state.collisionFlashEndTime&&(this.state.completed=!0,this.complete({outcome:"completed",result:{score:0}}))}checkOutOfBounds(e){if(this.state.completed)return;const n=Math.round(this.state.playerWorldY-this.state.cameraScrollY),i=e.top+e.height-1;n>i&&this.triggerCollision()}renderGame(e,n){this.lastViewport=n;const{top:i,left:o,width:r,height:s}=n;this.initialized||(this.initialized=!0,this.state.playerWorldX=r/2,this.state.playerWorldY=s*2/3,this.state.cameraScrollY=this.state.playerWorldY-(s/3-1));for(let l=i;l<i+s;l++)if(l>=0&&l<e.length)for(let h=o;h<o+r;h++)h>=0&&h<e[l].length&&(e[l][h]={char:" ",fg:"white",bg:"black"});this.drawHud(e,n);for(const l of this.state.obstacles)for(const h of l.cells){const d=o+Math.round(l.worldX+h.dcol),p=i+s-1-Math.round(l.worldY+h.drow-this.state.cameraScrollY);p>i&&p>=i&&p<i+s&&d>=o&&d<o+r&&p<e.length&&d<e[p].length&&(e[p][d]={char:h.char,fg:h.color,bg:"black"})}const a=o+Math.round(this.state.playerWorldX)-1,c=i+s-1-Math.round(this.state.playerWorldY-this.state.cameraScrollY);if(c>=i&&c<i+s&&a>=o&&a<o+r-1){const l=this.state.outcome==="collision"&&Math.floor((performance.now()-(this.state.collisionFlashEndTime-400))/100)%2===0;if(performance.now()<this.state.invincibilityEndTime&&Math.floor(performance.now()/100)%2===0)return;const p=l?"bright-red":"bright-green";c<e.length&&a<e[c].length&&(e[c][a]={char:"/",fg:p,bg:"black"}),c<e.length&&a+1<e[c].length&&(e[c][a+1]={char:"\\",fg:p,bg:"black"})}this._primaryInput==="touch"&&this.renderJoystick(e,n)}renderJoystick(e,n){const{top:i,left:o,width:r,height:s}=n,a=(f,y,b,x)=>{var _;f<0||f>=e.length||y<0||y>=(((_=e[f])==null?void 0:_.length)??0)||(e[f][y]={char:b,fg:x,bg:"black"})};if(!this._joystick){const f="DRAG TO NAVIGATE",y=i+s-2,b=o+Math.floor((r-f.length)/2);for(let x=0;x<f.length&&b+x<o+r;x++)a(y,b+x,f[x],"bright-black");return}const{centerCol:c,centerRow:l,currentCol:h,currentRow:d}=this._joystick,p=h-c,u=d-l,m=1;a(l,c,"o","bright-white"),u<-m&&a(l-2,c,"^","bright-green"),u>m&&a(l+2,c,"v","bright-green"),p<-m&&a(l,c-2,"<","bright-green"),p>m&&a(l,c+2,">","bright-green")}drawHud(e,n){const{top:i,left:o,width:r}=n,l=F().miniGames.navigation.difficulties[this.difficulty].targetDistance,h=this.state.playerWorldY,d=Math.min(1,Math.max(0,h/l)),p=15,u=Math.round(p*d);let m="";for(let k=0;k<u;k++)m+="█";for(let k=u;k<p;k++)m+="░";const f=Math.round(h).toString(),y=`[${m}] ${f}u`;if(i<e.length){let k=o;for(const v of y)k<o+r&&k<e[i].length&&(e[i][k]={char:v,fg:"bright-yellow",bg:"black"}),k++}const b=`L:${this.state.lives}`,_=o+r-b.length-5;if(i<e.length){let k=_;for(const v of b){if(k>=o&&k<o+r&&k>=0&&k<e[i].length){const C=this.state.lives===1?"bright-red":this.state.lives===2?"bright-yellow":"bright-green";e[i][k]={char:v,fg:C,bg:"black"}}k++}}}}const qe=[{id:"docking",name:"Docking Mini-Game",description:"Align the ship crosshair with the airlock target before countdown expires",variants:[{id:"orbital",label:"Orbital Station",params:{locationType:"orbital"}},{id:"deep-space",label:"Deep Space",params:{locationType:"deep-space"}}]},{id:"surface-landing",name:"Planet Landing",description:"Counter gravity and air resistance to land gently on the marked pad",variants:[{id:"surface",label:"Planet Surface",params:{locationType:"surface"}}]},{id:"asteroid-landing",name:"Asteroid Landing",description:"Navigate freely with no gravity to land on the marked pad",variants:[{id:"asteroid",label:"Asteroid Surface",params:{locationType:"asteroid"}}]},{id:"navigation",name:"Space Navigation",description:"Pilot your ship through obstacles with momentum controls",variants:[{id:"asteroid_belt",label:"Asteroid Belt",params:{type:"asteroid_belt",difficulty:"normal"}},{id:"space_debris",label:"Space Debris",params:{type:"space_debris",difficulty:"normal"}},{id:"space_storm",label:"Space Storm",params:{type:"space_storm",difficulty:"normal"}}]}],An=[{meta:qe[0],factory:(t,e,n,i,o)=>new jr(t,e,n,o)},{meta:qe[1],factory:(t,e,n,i,o)=>new zr(t,e,n,o)},{meta:qe[2],factory:(t,e,n,i,o)=>new Jr(t,e,n,o)},{meta:qe[3],factory:(t,e,n,i,o)=>new ts(t,e,n,i,o)}];function ns(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function is(t,e){return Math.floor(t()*e)}function Re(t,e){return e[is(t,e.length)]}function ri(t,e){const{special:n,firstNames:i,lastNames:o}=e.npcNames;if(t()<F().npc.specialNameChance&&n.length>0)return{giverName:Re(t,n)};const r=i.length>0?Re(t,i):"Unknown",s=o.length>0?Re(t,o):"Agent";return{giverName:`${r} ${s}`}}function os(t,e){return e.destinations.filter(n=>n.id!==t.id)}function rs(t){return t.commodities.filter(e=>e.legal)}function ss(t,e){const n=e.reduce((o,r)=>o+r.weightKg,0);if(n===0)return e[0];let i=t()*n;for(const o of e)if(i-=o.weightKg,i<0)return o;return e[e.length-1]}function Rn(t,e,n,i){var y;const o=n.deliveryItems;if(o.length===0)return null;const r=os(e,n);if(r.length===0)return null;const s=ss(t,o),a=Re(t,r),c=ri(t,n),{deliveryBaseReward:l,deliveryRandomReward:h,deliveryDepositFraction:d}=F().missions,p=Math.floor(s.weightKg*1.5),u=l+p+Math.floor(t()*h),m=Math.floor(u*d),f=e.owningFactionId?(y=D().factions.find(b=>b.id===e.owningFactionId&&me(b)))==null?void 0:y.id:void 0;return{...c,giverFactionId:f,id:i,type:"delivery",title:s.name,description:`A package needs transporting. Pick up the ${s.name} from ${e.name} and deliver it to ${a.name}. Handle with care.`,reward:u,issuingDestinationId:e.id,itemName:s.name,itemWeightKg:s.weightKg,pickupDestinationId:e.id,deliveryDestinationId:a.id,deposit:m}}function En(t,e,n,i){var G;const o=rs(n);if(o.length===0)return null;const r=Q(e.system),s=[],a=[];for(const S of o)(r?et(S.id,r):1)>1&&a.push(S),s.push(S);const c=a.length>0?a:o;for(const S of c)s.push(S);const{supplyRequirementsMin:l,supplyRequirementsMax:h,supplyQtyMin:d,supplyQtyMax:p}=F().missions,u=l+Math.floor(t()*(h-l+1)),m=[],f=new Set;for(let S=0;S<u;S++){let R=0;for(;R<10;){const E=Re(t,s);if(!f.has(E.id)){f.add(E.id);const A=d+Math.floor(t()*(p-d+1));m.push({commodityId:E.id,qty:A});break}R++}}if(m.length===0)return null;const y=m.reduce((S,R)=>{const E=n.commodities.find(A=>A.id===R.commodityId);return S+((E==null?void 0:E.basePrice)??100)*R.qty},0),b=m.reduce((S,R)=>{const E=n.commodities.find(A=>A.id===R.commodityId);return S+((E==null?void 0:E.weightKg)??1)*R.qty},0),{supplyRewardMultiplierMin:x,supplyRewardMultiplierMax:_}=F().missions,k=Math.min(1,b/500),v=t(),C=v+k*(1-v)*.15,w=x+C*(_-x),T=Math.floor(y*w),O=ri(t,n),K=m.map(S=>{const R=n.commodities.find(E=>E.id===S.commodityId);return`${S.qty}× ${(R==null?void 0:R.name)??S.commodityId}`}).join(", "),P=e.owningFactionId?(G=D().factions.find(S=>S.id===e.owningFactionId&&me(S)))==null?void 0:G.id:void 0;return{...O,giverFactionId:P,id:i,type:"supply",title:e.name,description:`${e.name} needs supplies. Deliver ${K} to fulfil the contract.`,reward:T,issuingDestinationId:e.id,requirements:m,deliveryDestinationId:e.id}}function as(t){let e=0;for(let n=0;n<t.length;n++)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}function cs(t,e,n){const i=F();let o;{const l=i.missions.missionTtlMs,h=Date.now(),d=Math.floor(h/l);o=as(t.id)^d}const r=ns(o),{boardMaxCount:s,deliveryChance:a}=i.missions,c=[];for(let l=0;l<t.minMissions&&c.length<s;l++){const h=`m-${(o>>>0).toString(16)}-${c.length}`,p=r()<a?Rn(r,t,e,h):En(r,t,e,h);p&&c.push(p)}for(;c.length<s&&r()<t.missionChance;){const l=`m-${(o>>>0).toString(16)}-${c.length}`,d=r()<a?Rn(r,t,e,l):En(r,t,e,l);d&&c.push(d)}return c}const ls=100,hs={orbital:"docking","deep-space":"docking",surface:"surface-landing",asteroid:"asteroid-landing"};function ds(t,e,n){if(t.outcome==="skipped")return{damageFraction:n.abandonDamageFraction*e,score:null};const i=t.result.score;return i>=n.noDamageThreshold?{damageFraction:0,score:i}:{damageFraction:n.maxHullDamageFraction*(1-i/n.noDamageThreshold)*e,score:i}}function us(t,e){const n=t==="docking";return e===null?"ABORTED":e<40?n?"COLLISION":"CRASH":e<70?n?"ROUGH DOCK":"HARD LANDING":e<90?n?"DOCKED":"LANDED":n?"PERFECT DOCK":"PERFECT LANDING"}function Xe(t,e,n){return Math.max(e,Math.min(n,t))}function ps(t,e,n,i){const{stockCountMin:o,stockCountMax:r,stockQtyMin:s,stockQtyMax:a,stockRepCountBonusPerLevel:c,stockRepCountBonusMin:l,stockRepCountBonusMax:h,stockRepQtyBonusPerLevel:d,stockRepQtyBonusMin:p,stockRepQtyBonusMax:u}=n.trading,m=Xe(e*c,l,h),f=Xe(e*d,p,u),y=t.length,b=Xe(o+m,1,y),x=Xe(r+m,1,y),_=b+Math.floor(Math.random()*(x-b+1)),k=[];if(i)for(const S of t){const E=1/et(S.id,i),A=Math.ceil(E*10);for(let M=0;M<A;M++)k.push(S)}else k.push(...t);const v=[...k];for(let S=v.length-1;S>0;S--){const R=Math.floor(Math.random()*(S+1));[v[S],v[R]]=[v[R],v[S]]}const C=s+f,w=a+f,T=t.map(S=>Math.log(S.basePrice*S.weightKg)),O=Math.min(...T),P=Math.max(...T)-O,G=new Map;for(const S of v.slice(0,_)){if(G.has(S.id))continue;const R=C+Math.floor(Math.random()*(w-C+1));let E=1;P>0&&(E=1.5-(Math.log(S.basePrice*S.weightKg)-O)/P);const A=i?et(S.id,i):1;G.set(S.id,{commodityId:S.id,qty:Math.max(1,Math.floor(R*E)),effectiveFactor:A})}return Array.from(G.values())}class ms{constructor(e,n,i){this.sceneBeforeMenu=null,this.traderStockCache=new Map,this.renderer=e,this.input=n,this.context=i;const o=Jn(),r=ze(o.startingShip);this.player=new Ft({shipId:o.startingShip,driveId:r.defaultJumpDrive,credits:o.player.startingCredits,systemId:o.startingLocation.system,destinationId:o.startingLocation.destination}),this.currentScene=new Yt(this.input,this.context,this.player,()=>this.goToStory())}tick(e){const n=Math.min(e,ls),i=this.makeBuffer();this.currentScene.update(n),this.currentScene.render(i),this.renderer.drawBuffer(i)}makeBuffer(){const e=this.renderer.getWidth(),n=this.renderer.getHeight();return Array.from({length:n},()=>Array.from({length:e},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(e,n){const i=Date.now(),o=this.traderStockCache.get(e),r=F();if(o&&o.repLevel===n&&i-o.generatedAt<r.trading.stockTtlMs)return o.entries;const s=N(e),a=s?Q(s.system):void 0,c=ps(so(),n,r,a);return this.traderStockCache.set(e,{entries:c,generatedAt:i,repLevel:n}),c}refreshDestinationMissions(e){const n=N(e),i=D(),o=cs(n,i);this.player.refreshDestinationMissions(e,o)}onBuy(e,n,i,o){if(n<=0)return;const r=o.findIndex(h=>h.commodityId===e);if(r<0)return;const s=o[r];if(n>s.qty)return;const a=de(e);if(!a)return;const c=n*i;this.player.credits<c||this.player.cargoWeightKg+n*a.weightKg>this.player.cargoCapacity||(this.player.spendCredits(c),this.player.addCargo(e,n),s.qty-=n,s.qty<=0&&o.splice(r,1))}onSell(e,n,i,o){if(n<=0)return;const r=this.player.cargoHold.find(l=>l.commodityId===e);if(!r||r.qty<n||!de(e))return;const a=n*i;this.player.addCredits(a),this.player.removeCargo(e,n);const c=o.find(l=>l.commodityId===e);c?c.qty+=n:o.push({commodityId:e,qty:n})}goToMainMenu(){this.currentScene=new Yt(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new xo(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){const e=this.player.destinationId;this.refreshDestinationMissions(e),this.currentScene=new To(this.input,this.context,this.player,e,(n,i)=>{this.player.spendCredits(n),this.player.addFuel(i),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToLandOrDock(){const e=N(this.player.destinationId),n=e==null?void 0:e.locationType,i=n?hs[n]:void 0,o=i?An.find(r=>r.meta.id===i):void 0;if(i&&o){const r=(e==null?void 0:e.difficultyMultiplier)??1,s=F();this.currentScene=o.factory(this.input,this.context,this.player,{},a=>{const{damageFraction:c,score:l}=ds(a,r,s.miniGames);c>0&&this.player.applyHullDamage(c);const h=us(i,l);this.currentScene=new Tn(this.input,this.player,this.context,h,l,c,()=>this.goToStation())})}else n==="surface"?this.currentScene=new Tr(this.player,this.context,()=>this.goToStation()):n==="asteroid"?this.currentScene=new Mr(this.player,this.context,()=>this.goToStation()):this.currentScene=new Fr(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var n;const e=(n=N(this.player.destinationId))==null?void 0:n.locationType;e==="surface"?this.currentScene=new Ar(this.player,this.context,()=>this.goToShip()):e==="asteroid"?this.currentScene=new Er(this.player,this.context,()=>this.goToShip()):this.currentScene=new Or(this.player,this.context,()=>this.goToShip())}goToTrader(){const e=this.player.destinationId,n=N(e);let i=0;if(n.owningFactionId){const r=Zn(n.owningFactionId);if(r&&me(r)){const s=F(),a=this.player.getFactionReputation(n.owningFactionId);i=Ee(a,s)}}const o=this.getOrCreateTraderStock(e,i);this.currentScene=new So(this.input,this.context,this.player,e,o,(r,s,a)=>this.onBuy(r,s,a,o),(r,s,a)=>this.onSell(r,s,a,o),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionBoard(){const e=this.player.destinationId,n=this.player.getDestinationMissions(e);this.currentScene=new ye(this.input,this.context,this.player,e,n,i=>this.goToMissionDetail(i,e),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionDetail(e,n){this.currentScene=new Ro(this.input,this.context,this.player,e,i=>this.onMissionAccepted(e,i,n),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock())}onMissionAccepted(e,n,i){const o=this.player.getDestinationMissions(i),r=o.findIndex(s=>s.id===e.id);r>=0&&(o.splice(r,1),this.player.refreshDestinationMissions(i,o)),this.player.acceptMission(e,n),this.goToMissionBoard()}goToShip(){this.currentScene=new hn(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo(),()=>this.goToGlobalMenu())}goToCargo(){this.currentScene=new ar(this.input,this.context,this.player,()=>this.goToShip(),()=>this.goToGlobalMenu())}buildMenuEntries(){return[{label:"MISSIONS",action:()=>this.goToMissionLog()},{label:"GALAXY MAP",action:()=>this.goToGalaxyMapFromMenu()},{label:"REPUTATION",action:()=>this.goToReputation()}]}goToMissionLog(){this.currentScene=new yo(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToReputation(){this.currentScene=new ko(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToGlobalMenuFromSubScene(){this.currentScene=new Vt(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}goToGlobalMenu(){this.sceneBeforeMenu=this.currentScene,"suspend"in this.currentScene&&this.currentScene.suspend(),this.currentScene=new Vt(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}returnFromMenu(){const e=this.sceneBeforeMenu;this.sceneBeforeMenu=null,e!==null?("resume"in e&&e.resume(),this.currentScene=e):this.goToShip()}goToTravelMenu(){this.currentScene=new dn(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu(),()=>this.goToEmergencyRescue())}goToArrival(){this.currentScene=new dn(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu(),()=>this.goToEmergencyRescue())}goToGalaxyMap(){this.currentScene=new gn(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToGlobalMenu())}goToGalaxyMapFromMenu(){this.currentScene=new gn(this.input,this.context,this.player,()=>this.goToGlobalMenu(),()=>this.goToGlobalMenu(),()=>this.returnFromMenu())}goToFlyIntoSpace(){const e=this.player.getInSystemHopCost();this.player.consumeFuel(e),this.player.undock(),this.currentScene=new _t(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(e){const n=this.player.getInSystemHopCost();this.player.consumeFuel(n),this.player.dock(e),this.currentScene=new _t(this.player,this.context,()=>this.goToShip())}onJumpSelected(e){const n=Qe(this.player.systemId,e),i=Qn(this.player.driveId),o=Math.ceil(F().fuel.consumptionPerLy*n.distance*i.fuelEfficiency);this.player.consumeFuel(o),this.player.jumpTo(e),this.currentScene=new kr(this.player,this.context,()=>this.maybeNavigationEncounter(()=>this.goToArrival()))}maybeNavigationEncounter(e){const i=F().navigationEncounter.encounterChanceOnJump;if(Math.random()>i){e();return}const o=["asteroid_belt","space_debris","space_storm"],r=o[Math.floor(Math.random()*o.length)],s=Q(this.player.systemId),a=this.getDifficultyFromDangerLevel(s.dangerLevel),c=new hn(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToShip(),()=>this.goToCargo(),()=>this.goToGlobalMenu()),l=new Wr({encounterType:r,onBegin:()=>this.playNavigationMiniGame(r,a,e)});c.setOverlay(l),this.currentScene=c}getDifficultyFromDangerLevel(e){switch(e){case"none":case"low":return"easy";case"medium":return"normal";case"high":case"extreme":return"hard";default:return"normal"}}playNavigationMiniGame(e,n,i){const o={type:e,difficulty:n},r=An.find(s=>s.meta.id==="navigation");if(!r){i();return}this.currentScene=r.factory(this.input,this.context,this.player,o,s=>{this.handleNavigationMiniGameResult(s,n,i)})}handleNavigationMiniGameResult(e,n,i){const o=F(),r=n==="hard"?1.25:1;let s,a,c;if(e.outcome==="skipped")s="ABORTED",a=o.miniGames.abandonDamageFraction*r,c=null;else{const l=e.result.score||0;c=l,l>=o.miniGames.noDamageThreshold?(s="CLEAR",a=0):(s="COLLISION",a=o.miniGames.maxHullDamageFraction*(1-l/o.miniGames.noDamageThreshold)*r)}a>0&&this.player.applyHullDamage(a),this.currentScene=new Tn(this.input,this.player,this.context,s,c,a,()=>i())}goToEmergencyRescue(){this.currentScene=new cr(this.input,this.context,this.player,e=>this.onEmergencyTow(e),()=>this.onEmergencyFuelDrop(),()=>this.goToTravelMenu())}onEmergencyTow(e){const n=F();this.player.spendCredits(n.emergencyRescue.towFee),this.player.dock(e),this.currentScene=new _t(this.player,this.context,()=>this.goToShip())}onEmergencyFuelDrop(){const e=F();this.player.spendCredits(e.emergencyRescue.fuelDropFee),this.player.addFuel(e.emergencyRescue.fuelDropLitres),this.goToTravelMenu()}}const fs=`---
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
`,gs=`---
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
`,ys=`---
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
`,_s=`---
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
`,bs=`---
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
`,ws=`---
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
`,vs=`---
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
`,ks=`---
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
`,xs=`---
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
`,Cs=`---
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
`,Ts=`---
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
`,Ss=`---
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
`,Ms=`---
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
`,Is=`---
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
`,As=`---
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
`,Rs=`---
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
`,Es=`---
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
`,Ls=`---
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
`,Fs=`---
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
`,Ds=`---
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
`,Os=`---
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
`,Ns=`---
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
`,Ps=`---
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
`,Hs=`---
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
`,Bs=`---
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
`,Us=`---
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
`,Gs=`---
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
`,$s=`---
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
`,Ws=`---
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
`,Ks=`---
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
`,Ys=`---
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
`,js=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,Vs=`---
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
`,qs=`---
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
`,Xs=`---
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

navigation_encounter:
  encounter_chance_on_jump: 0.30

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
`,zs=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,Qs=`---
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
`,Js=`---
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

Long range engines for faster than light travel between systems.`,Zs=`---
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
`,ea=`---
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
`,ta=`---
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
`,na=`---
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
`,ia=`---
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
`,oa=`---
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
`,ra=`---
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
`,sa=`---
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
`,aa=`---
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
`,ca=`---
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
`,la=`---
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
`,ha=`---
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
`,da=`---
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
`,ua=`---
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
`,pa=`---
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
`,ma=`---
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
`;var H={},Oe={},V={};function si(t){return typeof t>"u"||t===null}function fa(t){return typeof t=="object"&&t!==null}function ga(t){return Array.isArray(t)?t:si(t)?[]:[t]}function ya(t,e){var n,i,o,r;if(e)for(r=Object.keys(e),n=0,i=r.length;n<i;n+=1)o=r[n],t[o]=e[o];return t}function _a(t,e){var n="",i;for(i=0;i<e;i+=1)n+=t;return n}function ba(t){return t===0&&Number.NEGATIVE_INFINITY===1/t}V.isNothing=si;V.isObject=fa;V.toArray=ga;V.repeat=_a;V.isNegativeZero=ba;V.extend=ya;function Le(t,e){Error.call(this),this.name="YAMLException",this.reason=t,this.mark=e,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}Le.prototype=Object.create(Error.prototype);Le.prototype.constructor=Le;Le.prototype.toString=function(e){var n=this.name+": ";return n+=this.reason||"(unknown reason)",!e&&this.mark&&(n+=" "+this.mark.toString()),n};var Ne=Le,Ln=V;function Dt(t,e,n,i,o){this.name=t,this.buffer=e,this.position=n,this.line=i,this.column=o}Dt.prototype.getSnippet=function(e,n){var i,o,r,s,a;if(!this.buffer)return null;for(e=e||4,n=n||75,i="",o=this.position;o>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(o-1))===-1;)if(o-=1,this.position-o>n/2-1){i=" ... ",o+=5;break}for(r="",s=this.position;s<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s))===-1;)if(s+=1,s-this.position>n/2-1){r=" ... ",s-=5;break}return a=this.buffer.slice(o,s),Ln.repeat(" ",e)+i+a+r+`
`+Ln.repeat(" ",e+this.position-o+i.length)+"^"};Dt.prototype.toString=function(e){var n,i="";return this.name&&(i+='in "'+this.name+'" '),i+="at line "+(this.line+1)+", column "+(this.column+1),e||(n=this.getSnippet(),n&&(i+=`:
`+n)),i};var wa=Dt,Fn=Ne,va=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],ka=["scalar","sequence","mapping"];function xa(t){var e={};return t!==null&&Object.keys(t).forEach(function(n){t[n].forEach(function(i){e[String(i)]=n})}),e}function Ca(t,e){if(e=e||{},Object.keys(e).forEach(function(n){if(va.indexOf(n)===-1)throw new Fn('Unknown option "'+n+'" is met in definition of "'+t+'" YAML type.')}),this.tag=t,this.kind=e.kind||null,this.resolve=e.resolve||function(){return!0},this.construct=e.construct||function(n){return n},this.instanceOf=e.instanceOf||null,this.predicate=e.predicate||null,this.represent=e.represent||null,this.defaultStyle=e.defaultStyle||null,this.styleAliases=xa(e.styleAliases||null),ka.indexOf(this.kind)===-1)throw new Fn('Unknown kind "'+this.kind+'" is specified for "'+t+'" YAML type.')}var U=Ca,Dn=V,Je=Ne,Ta=U;function St(t,e,n){var i=[];return t.include.forEach(function(o){n=St(o,e,n)}),t[e].forEach(function(o){n.forEach(function(r,s){r.tag===o.tag&&r.kind===o.kind&&i.push(s)}),n.push(o)}),n.filter(function(o,r){return i.indexOf(r)===-1})}function Sa(){var t={scalar:{},sequence:{},mapping:{},fallback:{}},e,n;function i(o){t[o.kind][o.tag]=t.fallback[o.tag]=o}for(e=0,n=arguments.length;e<n;e+=1)arguments[e].forEach(i);return t}function _e(t){this.include=t.include||[],this.implicit=t.implicit||[],this.explicit=t.explicit||[],this.implicit.forEach(function(e){if(e.loadKind&&e.loadKind!=="scalar")throw new Je("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=St(this,"implicit",[]),this.compiledExplicit=St(this,"explicit",[]),this.compiledTypeMap=Sa(this.compiledImplicit,this.compiledExplicit)}_e.DEFAULT=null;_e.create=function(){var e,n;switch(arguments.length){case 1:e=_e.DEFAULT,n=arguments[0];break;case 2:e=arguments[0],n=arguments[1];break;default:throw new Je("Wrong number of arguments for Schema.create function")}if(e=Dn.toArray(e),n=Dn.toArray(n),!e.every(function(i){return i instanceof _e}))throw new Je("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!n.every(function(i){return i instanceof Ta}))throw new Je("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new _e({include:e,explicit:n})};var xe=_e,Ma=U,Ia=new Ma("tag:yaml.org,2002:str",{kind:"scalar",construct:function(t){return t!==null?t:""}}),Aa=U,Ra=new Aa("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(t){return t!==null?t:[]}}),Ea=U,La=new Ea("tag:yaml.org,2002:map",{kind:"mapping",construct:function(t){return t!==null?t:{}}}),Fa=xe,Ot=new Fa({explicit:[Ia,Ra,La]}),Da=U;function Oa(t){if(t===null)return!0;var e=t.length;return e===1&&t==="~"||e===4&&(t==="null"||t==="Null"||t==="NULL")}function Na(){return null}function Pa(t){return t===null}var Ha=new Da("tag:yaml.org,2002:null",{kind:"scalar",resolve:Oa,construct:Na,predicate:Pa,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Ba=U;function Ua(t){if(t===null)return!1;var e=t.length;return e===4&&(t==="true"||t==="True"||t==="TRUE")||e===5&&(t==="false"||t==="False"||t==="FALSE")}function Ga(t){return t==="true"||t==="True"||t==="TRUE"}function $a(t){return Object.prototype.toString.call(t)==="[object Boolean]"}var Wa=new Ba("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Ua,construct:Ga,predicate:$a,represent:{lowercase:function(t){return t?"true":"false"},uppercase:function(t){return t?"TRUE":"FALSE"},camelcase:function(t){return t?"True":"False"}},defaultStyle:"lowercase"}),Ka=V,Ya=U;function ja(t){return 48<=t&&t<=57||65<=t&&t<=70||97<=t&&t<=102}function Va(t){return 48<=t&&t<=55}function qa(t){return 48<=t&&t<=57}function Xa(t){if(t===null)return!1;var e=t.length,n=0,i=!1,o;if(!e)return!1;if(o=t[n],(o==="-"||o==="+")&&(o=t[++n]),o==="0"){if(n+1===e)return!0;if(o=t[++n],o==="b"){for(n++;n<e;n++)if(o=t[n],o!=="_"){if(o!=="0"&&o!=="1")return!1;i=!0}return i&&o!=="_"}if(o==="x"){for(n++;n<e;n++)if(o=t[n],o!=="_"){if(!ja(t.charCodeAt(n)))return!1;i=!0}return i&&o!=="_"}for(;n<e;n++)if(o=t[n],o!=="_"){if(!Va(t.charCodeAt(n)))return!1;i=!0}return i&&o!=="_"}if(o==="_")return!1;for(;n<e;n++)if(o=t[n],o!=="_"){if(o===":")break;if(!qa(t.charCodeAt(n)))return!1;i=!0}return!i||o==="_"?!1:o!==":"?!0:/^(:[0-5]?[0-9])+$/.test(t.slice(n))}function za(t){var e=t,n=1,i,o,r=[];return e.indexOf("_")!==-1&&(e=e.replace(/_/g,"")),i=e[0],(i==="-"||i==="+")&&(i==="-"&&(n=-1),e=e.slice(1),i=e[0]),e==="0"?0:i==="0"?e[1]==="b"?n*parseInt(e.slice(2),2):e[1]==="x"?n*parseInt(e,16):n*parseInt(e,8):e.indexOf(":")!==-1?(e.split(":").forEach(function(s){r.unshift(parseInt(s,10))}),e=0,o=1,r.forEach(function(s){e+=s*o,o*=60}),n*e):n*parseInt(e,10)}function Qa(t){return Object.prototype.toString.call(t)==="[object Number]"&&t%1===0&&!Ka.isNegativeZero(t)}var Ja=new Ya("tag:yaml.org,2002:int",{kind:"scalar",resolve:Xa,construct:za,predicate:Qa,represent:{binary:function(t){return t>=0?"0b"+t.toString(2):"-0b"+t.toString(2).slice(1)},octal:function(t){return t>=0?"0"+t.toString(8):"-0"+t.toString(8).slice(1)},decimal:function(t){return t.toString(10)},hexadecimal:function(t){return t>=0?"0x"+t.toString(16).toUpperCase():"-0x"+t.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),ai=V,Za=U,ec=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function tc(t){return!(t===null||!ec.test(t)||t[t.length-1]==="_")}function nc(t){var e,n,i,o;return e=t.replace(/_/g,"").toLowerCase(),n=e[0]==="-"?-1:1,o=[],"+-".indexOf(e[0])>=0&&(e=e.slice(1)),e===".inf"?n===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:e===".nan"?NaN:e.indexOf(":")>=0?(e.split(":").forEach(function(r){o.unshift(parseFloat(r,10))}),e=0,i=1,o.forEach(function(r){e+=r*i,i*=60}),n*e):n*parseFloat(e,10)}var ic=/^[-+]?[0-9]+e/;function oc(t,e){var n;if(isNaN(t))switch(e){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===t)switch(e){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===t)switch(e){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(ai.isNegativeZero(t))return"-0.0";return n=t.toString(10),ic.test(n)?n.replace("e",".e"):n}function rc(t){return Object.prototype.toString.call(t)==="[object Number]"&&(t%1!==0||ai.isNegativeZero(t))}var sc=new Za("tag:yaml.org,2002:float",{kind:"scalar",resolve:tc,construct:nc,predicate:rc,represent:oc,defaultStyle:"lowercase"}),ac=xe,ci=new ac({include:[Ot],implicit:[Ha,Wa,Ja,sc]}),cc=xe,li=new cc({include:[ci]}),lc=U,hi=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),di=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function hc(t){return t===null?!1:hi.exec(t)!==null||di.exec(t)!==null}function dc(t){var e,n,i,o,r,s,a,c=0,l=null,h,d,p;if(e=hi.exec(t),e===null&&(e=di.exec(t)),e===null)throw new Error("Date resolve error");if(n=+e[1],i=+e[2]-1,o=+e[3],!e[4])return new Date(Date.UTC(n,i,o));if(r=+e[4],s=+e[5],a=+e[6],e[7]){for(c=e[7].slice(0,3);c.length<3;)c+="0";c=+c}return e[9]&&(h=+e[10],d=+(e[11]||0),l=(h*60+d)*6e4,e[9]==="-"&&(l=-l)),p=new Date(Date.UTC(n,i,o,r,s,a,c)),l&&p.setTime(p.getTime()-l),p}function uc(t){return t.toISOString()}var pc=new lc("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:hc,construct:dc,instanceOf:Date,represent:uc}),mc=U;function fc(t){return t==="<<"||t===null}var gc=new mc("tag:yaml.org,2002:merge",{kind:"scalar",resolve:fc});function ui(t){throw new Error('Could not dynamically require "'+t+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var le;try{var yc=ui;le=yc("buffer").Buffer}catch{}var _c=U,Nt=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function bc(t){if(t===null)return!1;var e,n,i=0,o=t.length,r=Nt;for(n=0;n<o;n++)if(e=r.indexOf(t.charAt(n)),!(e>64)){if(e<0)return!1;i+=6}return i%8===0}function wc(t){var e,n,i=t.replace(/[\r\n=]/g,""),o=i.length,r=Nt,s=0,a=[];for(e=0;e<o;e++)e%4===0&&e&&(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)),s=s<<6|r.indexOf(i.charAt(e));return n=o%4*6,n===0?(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)):n===18?(a.push(s>>10&255),a.push(s>>2&255)):n===12&&a.push(s>>4&255),le?le.from?le.from(a):new le(a):a}function vc(t){var e="",n=0,i,o,r=t.length,s=Nt;for(i=0;i<r;i++)i%3===0&&i&&(e+=s[n>>18&63],e+=s[n>>12&63],e+=s[n>>6&63],e+=s[n&63]),n=(n<<8)+t[i];return o=r%3,o===0?(e+=s[n>>18&63],e+=s[n>>12&63],e+=s[n>>6&63],e+=s[n&63]):o===2?(e+=s[n>>10&63],e+=s[n>>4&63],e+=s[n<<2&63],e+=s[64]):o===1&&(e+=s[n>>2&63],e+=s[n<<4&63],e+=s[64],e+=s[64]),e}function kc(t){return le&&le.isBuffer(t)}var xc=new _c("tag:yaml.org,2002:binary",{kind:"scalar",resolve:bc,construct:wc,predicate:kc,represent:vc}),Cc=U,Tc=Object.prototype.hasOwnProperty,Sc=Object.prototype.toString;function Mc(t){if(t===null)return!0;var e=[],n,i,o,r,s,a=t;for(n=0,i=a.length;n<i;n+=1){if(o=a[n],s=!1,Sc.call(o)!=="[object Object]")return!1;for(r in o)if(Tc.call(o,r))if(!s)s=!0;else return!1;if(!s)return!1;if(e.indexOf(r)===-1)e.push(r);else return!1}return!0}function Ic(t){return t!==null?t:[]}var Ac=new Cc("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Mc,construct:Ic}),Rc=U,Ec=Object.prototype.toString;function Lc(t){if(t===null)return!0;var e,n,i,o,r,s=t;for(r=new Array(s.length),e=0,n=s.length;e<n;e+=1){if(i=s[e],Ec.call(i)!=="[object Object]"||(o=Object.keys(i),o.length!==1))return!1;r[e]=[o[0],i[o[0]]]}return!0}function Fc(t){if(t===null)return[];var e,n,i,o,r,s=t;for(r=new Array(s.length),e=0,n=s.length;e<n;e+=1)i=s[e],o=Object.keys(i),r[e]=[o[0],i[o[0]]];return r}var Dc=new Rc("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Lc,construct:Fc}),Oc=U,Nc=Object.prototype.hasOwnProperty;function Pc(t){if(t===null)return!0;var e,n=t;for(e in n)if(Nc.call(n,e)&&n[e]!==null)return!1;return!0}function Hc(t){return t!==null?t:{}}var Bc=new Oc("tag:yaml.org,2002:set",{kind:"mapping",resolve:Pc,construct:Hc}),Uc=xe,Pe=new Uc({include:[li],implicit:[pc,gc],explicit:[xc,Ac,Dc,Bc]}),Gc=U;function $c(){return!0}function Wc(){}function Kc(){return""}function Yc(t){return typeof t>"u"}var jc=new Gc("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:$c,construct:Wc,predicate:Yc,represent:Kc}),Vc=U;function qc(t){if(t===null||t.length===0)return!1;var e=t,n=/\/([gim]*)$/.exec(t),i="";return!(e[0]==="/"&&(n&&(i=n[1]),i.length>3||e[e.length-i.length-1]!=="/"))}function Xc(t){var e=t,n=/\/([gim]*)$/.exec(t),i="";return e[0]==="/"&&(n&&(i=n[1]),e=e.slice(1,e.length-i.length-1)),new RegExp(e,i)}function zc(t){var e="/"+t.source+"/";return t.global&&(e+="g"),t.multiline&&(e+="m"),t.ignoreCase&&(e+="i"),e}function Qc(t){return Object.prototype.toString.call(t)==="[object RegExp]"}var Jc=new Vc("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:qc,construct:Xc,predicate:Qc,represent:zc}),tt;try{var Zc=ui;tt=Zc("esprima")}catch{typeof window<"u"&&(tt=window.esprima)}var el=U;function tl(t){if(t===null)return!1;try{var e="("+t+")",n=tt.parse(e,{range:!0});return!(n.type!=="Program"||n.body.length!==1||n.body[0].type!=="ExpressionStatement"||n.body[0].expression.type!=="ArrowFunctionExpression"&&n.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function nl(t){var e="("+t+")",n=tt.parse(e,{range:!0}),i=[],o;if(n.type!=="Program"||n.body.length!==1||n.body[0].type!=="ExpressionStatement"||n.body[0].expression.type!=="ArrowFunctionExpression"&&n.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return n.body[0].expression.params.forEach(function(r){i.push(r.name)}),o=n.body[0].expression.body.range,n.body[0].expression.body.type==="BlockStatement"?new Function(i,e.slice(o[0]+1,o[1]-1)):new Function(i,"return "+e.slice(o[0],o[1]))}function il(t){return t.toString()}function ol(t){return Object.prototype.toString.call(t)==="[object Function]"}var rl=new el("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:tl,construct:nl,predicate:ol,represent:il}),On=xe,st=On.DEFAULT=new On({include:[Pe],explicit:[jc,Jc,rl]}),te=V,pi=Ne,sl=wa,mi=Pe,al=st,se=Object.prototype.hasOwnProperty,nt=1,fi=2,gi=3,it=4,vt=1,cl=2,Nn=3,ll=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,hl=/[\x85\u2028\u2029]/,dl=/[,\[\]\{\}]/,yi=/^(?:!|!!|![a-z\-]+!)$/i,_i=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function Pn(t){return Object.prototype.toString.call(t)}function z(t){return t===10||t===13}function he(t){return t===9||t===32}function j(t){return t===9||t===32||t===10||t===13}function be(t){return t===44||t===91||t===93||t===123||t===125}function ul(t){var e;return 48<=t&&t<=57?t-48:(e=t|32,97<=e&&e<=102?e-97+10:-1)}function pl(t){return t===120?2:t===117?4:t===85?8:0}function ml(t){return 48<=t&&t<=57?t-48:-1}function Hn(t){return t===48?"\0":t===97?"\x07":t===98?"\b":t===116||t===9?"	":t===110?`
`:t===118?"\v":t===102?"\f":t===114?"\r":t===101?"\x1B":t===32?" ":t===34?'"':t===47?"/":t===92?"\\":t===78?"":t===95?" ":t===76?"\u2028":t===80?"\u2029":""}function fl(t){return t<=65535?String.fromCharCode(t):String.fromCharCode((t-65536>>10)+55296,(t-65536&1023)+56320)}function bi(t,e,n){e==="__proto__"?Object.defineProperty(t,e,{configurable:!0,enumerable:!0,writable:!0,value:n}):t[e]=n}var wi=new Array(256),vi=new Array(256);for(var fe=0;fe<256;fe++)wi[fe]=Hn(fe)?1:0,vi[fe]=Hn(fe);function gl(t,e){this.input=t,this.filename=e.filename||null,this.schema=e.schema||al,this.onWarning=e.onWarning||null,this.legacy=e.legacy||!1,this.json=e.json||!1,this.listener=e.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=t.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function ki(t,e){return new pi(e,new sl(t.filename,t.input,t.position,t.line,t.position-t.lineStart))}function I(t,e){throw ki(t,e)}function ot(t,e){t.onWarning&&t.onWarning.call(null,ki(t,e))}var Bn={YAML:function(e,n,i){var o,r,s;e.version!==null&&I(e,"duplication of %YAML directive"),i.length!==1&&I(e,"YAML directive accepts exactly one argument"),o=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),o===null&&I(e,"ill-formed argument of the YAML directive"),r=parseInt(o[1],10),s=parseInt(o[2],10),r!==1&&I(e,"unacceptable YAML version of the document"),e.version=i[0],e.checkLineBreaks=s<2,s!==1&&s!==2&&ot(e,"unsupported YAML version of the document")},TAG:function(e,n,i){var o,r;i.length!==2&&I(e,"TAG directive accepts exactly two arguments"),o=i[0],r=i[1],yi.test(o)||I(e,"ill-formed tag handle (first argument) of the TAG directive"),se.call(e.tagMap,o)&&I(e,'there is a previously declared suffix for "'+o+'" tag handle'),_i.test(r)||I(e,"ill-formed tag prefix (second argument) of the TAG directive"),e.tagMap[o]=r}};function re(t,e,n,i){var o,r,s,a;if(e<n){if(a=t.input.slice(e,n),i)for(o=0,r=a.length;o<r;o+=1)s=a.charCodeAt(o),s===9||32<=s&&s<=1114111||I(t,"expected valid JSON character");else ll.test(a)&&I(t,"the stream contains non-printable characters");t.result+=a}}function Un(t,e,n,i){var o,r,s,a;for(te.isObject(n)||I(t,"cannot merge mappings; the provided source object is unacceptable"),o=Object.keys(n),s=0,a=o.length;s<a;s+=1)r=o[s],se.call(e,r)||(bi(e,r,n[r]),i[r]=!0)}function we(t,e,n,i,o,r,s,a){var c,l;if(Array.isArray(o))for(o=Array.prototype.slice.call(o),c=0,l=o.length;c<l;c+=1)Array.isArray(o[c])&&I(t,"nested arrays are not supported inside keys"),typeof o=="object"&&Pn(o[c])==="[object Object]"&&(o[c]="[object Object]");if(typeof o=="object"&&Pn(o)==="[object Object]"&&(o="[object Object]"),o=String(o),e===null&&(e={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(r))for(c=0,l=r.length;c<l;c+=1)Un(t,e,r[c],n);else Un(t,e,r,n);else!t.json&&!se.call(n,o)&&se.call(e,o)&&(t.line=s||t.line,t.position=a||t.position,I(t,"duplicated mapping key")),bi(e,o,r),delete n[o];return e}function Pt(t){var e;e=t.input.charCodeAt(t.position),e===10?t.position++:e===13?(t.position++,t.input.charCodeAt(t.position)===10&&t.position++):I(t,"a line break is expected"),t.line+=1,t.lineStart=t.position}function B(t,e,n){for(var i=0,o=t.input.charCodeAt(t.position);o!==0;){for(;he(o);)o=t.input.charCodeAt(++t.position);if(e&&o===35)do o=t.input.charCodeAt(++t.position);while(o!==10&&o!==13&&o!==0);if(z(o))for(Pt(t),o=t.input.charCodeAt(t.position),i++,t.lineIndent=0;o===32;)t.lineIndent++,o=t.input.charCodeAt(++t.position);else break}return n!==-1&&i!==0&&t.lineIndent<n&&ot(t,"deficient indentation"),i}function at(t){var e=t.position,n;return n=t.input.charCodeAt(e),!!((n===45||n===46)&&n===t.input.charCodeAt(e+1)&&n===t.input.charCodeAt(e+2)&&(e+=3,n=t.input.charCodeAt(e),n===0||j(n)))}function Ht(t,e){e===1?t.result+=" ":e>1&&(t.result+=te.repeat(`
`,e-1))}function yl(t,e,n){var i,o,r,s,a,c,l,h,d=t.kind,p=t.result,u;if(u=t.input.charCodeAt(t.position),j(u)||be(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(o=t.input.charCodeAt(t.position+1),j(o)||n&&be(o)))return!1;for(t.kind="scalar",t.result="",r=s=t.position,a=!1;u!==0;){if(u===58){if(o=t.input.charCodeAt(t.position+1),j(o)||n&&be(o))break}else if(u===35){if(i=t.input.charCodeAt(t.position-1),j(i))break}else{if(t.position===t.lineStart&&at(t)||n&&be(u))break;if(z(u))if(c=t.line,l=t.lineStart,h=t.lineIndent,B(t,!1,-1),t.lineIndent>=e){a=!0,u=t.input.charCodeAt(t.position);continue}else{t.position=s,t.line=c,t.lineStart=l,t.lineIndent=h;break}}a&&(re(t,r,s,!1),Ht(t,t.line-c),r=s=t.position,a=!1),he(u)||(s=t.position+1),u=t.input.charCodeAt(++t.position)}return re(t,r,s,!1),t.result?!0:(t.kind=d,t.result=p,!1)}function _l(t,e){var n,i,o;if(n=t.input.charCodeAt(t.position),n!==39)return!1;for(t.kind="scalar",t.result="",t.position++,i=o=t.position;(n=t.input.charCodeAt(t.position))!==0;)if(n===39)if(re(t,i,t.position,!0),n=t.input.charCodeAt(++t.position),n===39)i=t.position,t.position++,o=t.position;else return!0;else z(n)?(re(t,i,o,!0),Ht(t,B(t,!1,e)),i=o=t.position):t.position===t.lineStart&&at(t)?I(t,"unexpected end of the document within a single quoted scalar"):(t.position++,o=t.position);I(t,"unexpected end of the stream within a single quoted scalar")}function bl(t,e){var n,i,o,r,s,a;if(a=t.input.charCodeAt(t.position),a!==34)return!1;for(t.kind="scalar",t.result="",t.position++,n=i=t.position;(a=t.input.charCodeAt(t.position))!==0;){if(a===34)return re(t,n,t.position,!0),t.position++,!0;if(a===92){if(re(t,n,t.position,!0),a=t.input.charCodeAt(++t.position),z(a))B(t,!1,e);else if(a<256&&wi[a])t.result+=vi[a],t.position++;else if((s=pl(a))>0){for(o=s,r=0;o>0;o--)a=t.input.charCodeAt(++t.position),(s=ul(a))>=0?r=(r<<4)+s:I(t,"expected hexadecimal character");t.result+=fl(r),t.position++}else I(t,"unknown escape sequence");n=i=t.position}else z(a)?(re(t,n,i,!0),Ht(t,B(t,!1,e)),n=i=t.position):t.position===t.lineStart&&at(t)?I(t,"unexpected end of the document within a double quoted scalar"):(t.position++,i=t.position)}I(t,"unexpected end of the stream within a double quoted scalar")}function wl(t,e){var n=!0,i,o=t.tag,r,s=t.anchor,a,c,l,h,d,p={},u,m,f,y;if(y=t.input.charCodeAt(t.position),y===91)c=93,d=!1,r=[];else if(y===123)c=125,d=!0,r={};else return!1;for(t.anchor!==null&&(t.anchorMap[t.anchor]=r),y=t.input.charCodeAt(++t.position);y!==0;){if(B(t,!0,e),y=t.input.charCodeAt(t.position),y===c)return t.position++,t.tag=o,t.anchor=s,t.kind=d?"mapping":"sequence",t.result=r,!0;n||I(t,"missed comma between flow collection entries"),m=u=f=null,l=h=!1,y===63&&(a=t.input.charCodeAt(t.position+1),j(a)&&(l=h=!0,t.position++,B(t,!0,e))),i=t.line,ve(t,e,nt,!1,!0),m=t.tag,u=t.result,B(t,!0,e),y=t.input.charCodeAt(t.position),(h||t.line===i)&&y===58&&(l=!0,y=t.input.charCodeAt(++t.position),B(t,!0,e),ve(t,e,nt,!1,!0),f=t.result),d?we(t,r,p,m,u,f):l?r.push(we(t,null,p,m,u,f)):r.push(u),B(t,!0,e),y=t.input.charCodeAt(t.position),y===44?(n=!0,y=t.input.charCodeAt(++t.position)):n=!1}I(t,"unexpected end of the stream within a flow collection")}function vl(t,e){var n,i,o=vt,r=!1,s=!1,a=e,c=0,l=!1,h,d;if(d=t.input.charCodeAt(t.position),d===124)i=!1;else if(d===62)i=!0;else return!1;for(t.kind="scalar",t.result="";d!==0;)if(d=t.input.charCodeAt(++t.position),d===43||d===45)vt===o?o=d===43?Nn:cl:I(t,"repeat of a chomping mode identifier");else if((h=ml(d))>=0)h===0?I(t,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?I(t,"repeat of an indentation width identifier"):(a=e+h-1,s=!0);else break;if(he(d)){do d=t.input.charCodeAt(++t.position);while(he(d));if(d===35)do d=t.input.charCodeAt(++t.position);while(!z(d)&&d!==0)}for(;d!==0;){for(Pt(t),t.lineIndent=0,d=t.input.charCodeAt(t.position);(!s||t.lineIndent<a)&&d===32;)t.lineIndent++,d=t.input.charCodeAt(++t.position);if(!s&&t.lineIndent>a&&(a=t.lineIndent),z(d)){c++;continue}if(t.lineIndent<a){o===Nn?t.result+=te.repeat(`
`,r?1+c:c):o===vt&&r&&(t.result+=`
`);break}for(i?he(d)?(l=!0,t.result+=te.repeat(`
`,r?1+c:c)):l?(l=!1,t.result+=te.repeat(`
`,c+1)):c===0?r&&(t.result+=" "):t.result+=te.repeat(`
`,c):t.result+=te.repeat(`
`,r?1+c:c),r=!0,s=!0,c=0,n=t.position;!z(d)&&d!==0;)d=t.input.charCodeAt(++t.position);re(t,n,t.position,!1)}return!0}function Gn(t,e){var n,i=t.tag,o=t.anchor,r=[],s,a=!1,c;for(t.anchor!==null&&(t.anchorMap[t.anchor]=r),c=t.input.charCodeAt(t.position);c!==0&&!(c!==45||(s=t.input.charCodeAt(t.position+1),!j(s)));){if(a=!0,t.position++,B(t,!0,-1)&&t.lineIndent<=e){r.push(null),c=t.input.charCodeAt(t.position);continue}if(n=t.line,ve(t,e,gi,!1,!0),r.push(t.result),B(t,!0,-1),c=t.input.charCodeAt(t.position),(t.line===n||t.lineIndent>e)&&c!==0)I(t,"bad indentation of a sequence entry");else if(t.lineIndent<e)break}return a?(t.tag=i,t.anchor=o,t.kind="sequence",t.result=r,!0):!1}function kl(t,e,n){var i,o,r,s,a=t.tag,c=t.anchor,l={},h={},d=null,p=null,u=null,m=!1,f=!1,y;for(t.anchor!==null&&(t.anchorMap[t.anchor]=l),y=t.input.charCodeAt(t.position);y!==0;){if(i=t.input.charCodeAt(t.position+1),r=t.line,s=t.position,(y===63||y===58)&&j(i))y===63?(m&&(we(t,l,h,d,p,null),d=p=u=null),f=!0,m=!0,o=!0):m?(m=!1,o=!0):I(t,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),t.position+=1,y=i;else if(ve(t,n,fi,!1,!0))if(t.line===r){for(y=t.input.charCodeAt(t.position);he(y);)y=t.input.charCodeAt(++t.position);if(y===58)y=t.input.charCodeAt(++t.position),j(y)||I(t,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(we(t,l,h,d,p,null),d=p=u=null),f=!0,m=!1,o=!1,d=t.tag,p=t.result;else if(f)I(t,"can not read an implicit mapping pair; a colon is missed");else return t.tag=a,t.anchor=c,!0}else if(f)I(t,"can not read a block mapping entry; a multiline key may not be an implicit key");else return t.tag=a,t.anchor=c,!0;else break;if((t.line===r||t.lineIndent>e)&&(ve(t,e,it,!0,o)&&(m?p=t.result:u=t.result),m||(we(t,l,h,d,p,u,r,s),d=p=u=null),B(t,!0,-1),y=t.input.charCodeAt(t.position)),t.lineIndent>e&&y!==0)I(t,"bad indentation of a mapping entry");else if(t.lineIndent<e)break}return m&&we(t,l,h,d,p,null),f&&(t.tag=a,t.anchor=c,t.kind="mapping",t.result=l),f}function xl(t){var e,n=!1,i=!1,o,r,s;if(s=t.input.charCodeAt(t.position),s!==33)return!1;if(t.tag!==null&&I(t,"duplication of a tag property"),s=t.input.charCodeAt(++t.position),s===60?(n=!0,s=t.input.charCodeAt(++t.position)):s===33?(i=!0,o="!!",s=t.input.charCodeAt(++t.position)):o="!",e=t.position,n){do s=t.input.charCodeAt(++t.position);while(s!==0&&s!==62);t.position<t.length?(r=t.input.slice(e,t.position),s=t.input.charCodeAt(++t.position)):I(t,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!j(s);)s===33&&(i?I(t,"tag suffix cannot contain exclamation marks"):(o=t.input.slice(e-1,t.position+1),yi.test(o)||I(t,"named tag handle cannot contain such characters"),i=!0,e=t.position+1)),s=t.input.charCodeAt(++t.position);r=t.input.slice(e,t.position),dl.test(r)&&I(t,"tag suffix cannot contain flow indicator characters")}return r&&!_i.test(r)&&I(t,"tag name cannot contain such characters: "+r),n?t.tag=r:se.call(t.tagMap,o)?t.tag=t.tagMap[o]+r:o==="!"?t.tag="!"+r:o==="!!"?t.tag="tag:yaml.org,2002:"+r:I(t,'undeclared tag handle "'+o+'"'),!0}function Cl(t){var e,n;if(n=t.input.charCodeAt(t.position),n!==38)return!1;for(t.anchor!==null&&I(t,"duplication of an anchor property"),n=t.input.charCodeAt(++t.position),e=t.position;n!==0&&!j(n)&&!be(n);)n=t.input.charCodeAt(++t.position);return t.position===e&&I(t,"name of an anchor node must contain at least one character"),t.anchor=t.input.slice(e,t.position),!0}function Tl(t){var e,n,i;if(i=t.input.charCodeAt(t.position),i!==42)return!1;for(i=t.input.charCodeAt(++t.position),e=t.position;i!==0&&!j(i)&&!be(i);)i=t.input.charCodeAt(++t.position);return t.position===e&&I(t,"name of an alias node must contain at least one character"),n=t.input.slice(e,t.position),se.call(t.anchorMap,n)||I(t,'unidentified alias "'+n+'"'),t.result=t.anchorMap[n],B(t,!0,-1),!0}function ve(t,e,n,i,o){var r,s,a,c=1,l=!1,h=!1,d,p,u,m,f;if(t.listener!==null&&t.listener("open",t),t.tag=null,t.anchor=null,t.kind=null,t.result=null,r=s=a=it===n||gi===n,i&&B(t,!0,-1)&&(l=!0,t.lineIndent>e?c=1:t.lineIndent===e?c=0:t.lineIndent<e&&(c=-1)),c===1)for(;xl(t)||Cl(t);)B(t,!0,-1)?(l=!0,a=r,t.lineIndent>e?c=1:t.lineIndent===e?c=0:t.lineIndent<e&&(c=-1)):a=!1;if(a&&(a=l||o),(c===1||it===n)&&(nt===n||fi===n?m=e:m=e+1,f=t.position-t.lineStart,c===1?a&&(Gn(t,f)||kl(t,f,m))||wl(t,m)?h=!0:(s&&vl(t,m)||_l(t,m)||bl(t,m)?h=!0:Tl(t)?(h=!0,(t.tag!==null||t.anchor!==null)&&I(t,"alias node should not have any properties")):yl(t,m,nt===n)&&(h=!0,t.tag===null&&(t.tag="?")),t.anchor!==null&&(t.anchorMap[t.anchor]=t.result)):c===0&&(h=a&&Gn(t,f))),t.tag!==null&&t.tag!=="!")if(t.tag==="?"){for(t.result!==null&&t.kind!=="scalar"&&I(t,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+t.kind+'"'),d=0,p=t.implicitTypes.length;d<p;d+=1)if(u=t.implicitTypes[d],u.resolve(t.result)){t.result=u.construct(t.result),t.tag=u.tag,t.anchor!==null&&(t.anchorMap[t.anchor]=t.result);break}}else se.call(t.typeMap[t.kind||"fallback"],t.tag)?(u=t.typeMap[t.kind||"fallback"][t.tag],t.result!==null&&u.kind!==t.kind&&I(t,"unacceptable node kind for !<"+t.tag+'> tag; it should be "'+u.kind+'", not "'+t.kind+'"'),u.resolve(t.result)?(t.result=u.construct(t.result),t.anchor!==null&&(t.anchorMap[t.anchor]=t.result)):I(t,"cannot resolve a node with !<"+t.tag+"> explicit tag")):I(t,"unknown tag !<"+t.tag+">");return t.listener!==null&&t.listener("close",t),t.tag!==null||t.anchor!==null||h}function Sl(t){var e=t.position,n,i,o,r=!1,s;for(t.version=null,t.checkLineBreaks=t.legacy,t.tagMap={},t.anchorMap={};(s=t.input.charCodeAt(t.position))!==0&&(B(t,!0,-1),s=t.input.charCodeAt(t.position),!(t.lineIndent>0||s!==37));){for(r=!0,s=t.input.charCodeAt(++t.position),n=t.position;s!==0&&!j(s);)s=t.input.charCodeAt(++t.position);for(i=t.input.slice(n,t.position),o=[],i.length<1&&I(t,"directive name must not be less than one character in length");s!==0;){for(;he(s);)s=t.input.charCodeAt(++t.position);if(s===35){do s=t.input.charCodeAt(++t.position);while(s!==0&&!z(s));break}if(z(s))break;for(n=t.position;s!==0&&!j(s);)s=t.input.charCodeAt(++t.position);o.push(t.input.slice(n,t.position))}s!==0&&Pt(t),se.call(Bn,i)?Bn[i](t,i,o):ot(t,'unknown document directive "'+i+'"')}if(B(t,!0,-1),t.lineIndent===0&&t.input.charCodeAt(t.position)===45&&t.input.charCodeAt(t.position+1)===45&&t.input.charCodeAt(t.position+2)===45?(t.position+=3,B(t,!0,-1)):r&&I(t,"directives end mark is expected"),ve(t,t.lineIndent-1,it,!1,!0),B(t,!0,-1),t.checkLineBreaks&&hl.test(t.input.slice(e,t.position))&&ot(t,"non-ASCII line breaks are interpreted as content"),t.documents.push(t.result),t.position===t.lineStart&&at(t)){t.input.charCodeAt(t.position)===46&&(t.position+=3,B(t,!0,-1));return}if(t.position<t.length-1)I(t,"end of the stream or a document separator is expected");else return}function xi(t,e){t=String(t),e=e||{},t.length!==0&&(t.charCodeAt(t.length-1)!==10&&t.charCodeAt(t.length-1)!==13&&(t+=`
`),t.charCodeAt(0)===65279&&(t=t.slice(1)));var n=new gl(t,e),i=t.indexOf("\0");for(i!==-1&&(n.position=i,I(n,"null byte is not allowed in input")),n.input+="\0";n.input.charCodeAt(n.position)===32;)n.lineIndent+=1,n.position+=1;for(;n.position<n.length-1;)Sl(n);return n.documents}function Ci(t,e,n){e!==null&&typeof e=="object"&&typeof n>"u"&&(n=e,e=null);var i=xi(t,n);if(typeof e!="function")return i;for(var o=0,r=i.length;o<r;o+=1)e(i[o])}function Ti(t,e){var n=xi(t,e);if(n.length!==0){if(n.length===1)return n[0];throw new pi("expected a single document in the stream, but found more")}}function Ml(t,e,n){return typeof e=="object"&&e!==null&&typeof n>"u"&&(n=e,e=null),Ci(t,e,te.extend({schema:mi},n))}function Il(t,e){return Ti(t,te.extend({schema:mi},e))}Oe.loadAll=Ci;Oe.load=Ti;Oe.safeLoadAll=Ml;Oe.safeLoad=Il;var Bt={},He=V,Be=Ne,Al=st,Rl=Pe,Si=Object.prototype.toString,Mi=Object.prototype.hasOwnProperty,El=9,Fe=10,Ll=13,Fl=32,Dl=33,Ol=34,Ii=35,Nl=37,Pl=38,Hl=39,Bl=42,Ai=44,Ul=45,Ri=58,Gl=61,$l=62,Wl=63,Kl=64,Ei=91,Li=93,Yl=96,Fi=123,jl=124,Di=125,$={};$[0]="\\0";$[7]="\\a";$[8]="\\b";$[9]="\\t";$[10]="\\n";$[11]="\\v";$[12]="\\f";$[13]="\\r";$[27]="\\e";$[34]='\\"';$[92]="\\\\";$[133]="\\N";$[160]="\\_";$[8232]="\\L";$[8233]="\\P";var Vl=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function ql(t,e){var n,i,o,r,s,a,c;if(e===null)return{};for(n={},i=Object.keys(e),o=0,r=i.length;o<r;o+=1)s=i[o],a=String(e[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),c=t.compiledTypeMap.fallback[s],c&&Mi.call(c.styleAliases,a)&&(a=c.styleAliases[a]),n[s]=a;return n}function $n(t){var e,n,i;if(e=t.toString(16).toUpperCase(),t<=255)n="x",i=2;else if(t<=65535)n="u",i=4;else if(t<=4294967295)n="U",i=8;else throw new Be("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+n+He.repeat("0",i-e.length)+e}function Xl(t){this.schema=t.schema||Al,this.indent=Math.max(1,t.indent||2),this.noArrayIndent=t.noArrayIndent||!1,this.skipInvalid=t.skipInvalid||!1,this.flowLevel=He.isNothing(t.flowLevel)?-1:t.flowLevel,this.styleMap=ql(this.schema,t.styles||null),this.sortKeys=t.sortKeys||!1,this.lineWidth=t.lineWidth||80,this.noRefs=t.noRefs||!1,this.noCompatMode=t.noCompatMode||!1,this.condenseFlow=t.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function Wn(t,e){for(var n=He.repeat(" ",e),i=0,o=-1,r="",s,a=t.length;i<a;)o=t.indexOf(`
`,i),o===-1?(s=t.slice(i),i=a):(s=t.slice(i,o+1),i=o+1),s.length&&s!==`
`&&(r+=n),r+=s;return r}function Mt(t,e){return`
`+He.repeat(" ",t.indent*e)}function zl(t,e){var n,i,o;for(n=0,i=t.implicitTypes.length;n<i;n+=1)if(o=t.implicitTypes[n],o.resolve(e))return!0;return!1}function Ut(t){return t===Fl||t===El}function ke(t){return 32<=t&&t<=126||161<=t&&t<=55295&&t!==8232&&t!==8233||57344<=t&&t<=65533&&t!==65279||65536<=t&&t<=1114111}function Ql(t){return ke(t)&&!Ut(t)&&t!==65279&&t!==Ll&&t!==Fe}function Kn(t,e){return ke(t)&&t!==65279&&t!==Ai&&t!==Ei&&t!==Li&&t!==Fi&&t!==Di&&t!==Ri&&(t!==Ii||e&&Ql(e))}function Jl(t){return ke(t)&&t!==65279&&!Ut(t)&&t!==Ul&&t!==Wl&&t!==Ri&&t!==Ai&&t!==Ei&&t!==Li&&t!==Fi&&t!==Di&&t!==Ii&&t!==Pl&&t!==Bl&&t!==Dl&&t!==jl&&t!==Gl&&t!==$l&&t!==Hl&&t!==Ol&&t!==Nl&&t!==Kl&&t!==Yl}function Oi(t){var e=/^\n* /;return e.test(t)}var Ni=1,Pi=2,Hi=3,Bi=4,Ze=5;function Zl(t,e,n,i,o){var r,s,a,c=!1,l=!1,h=i!==-1,d=-1,p=Jl(t.charCodeAt(0))&&!Ut(t.charCodeAt(t.length-1));if(e)for(r=0;r<t.length;r++){if(s=t.charCodeAt(r),!ke(s))return Ze;a=r>0?t.charCodeAt(r-1):null,p=p&&Kn(s,a)}else{for(r=0;r<t.length;r++){if(s=t.charCodeAt(r),s===Fe)c=!0,h&&(l=l||r-d-1>i&&t[d+1]!==" ",d=r);else if(!ke(s))return Ze;a=r>0?t.charCodeAt(r-1):null,p=p&&Kn(s,a)}l=l||h&&r-d-1>i&&t[d+1]!==" "}return!c&&!l?p&&!o(t)?Ni:Pi:n>9&&Oi(t)?Ze:l?Bi:Hi}function eh(t,e,n,i){t.dump=function(){if(e.length===0)return"''";if(!t.noCompatMode&&Vl.indexOf(e)!==-1)return"'"+e+"'";var o=t.indent*Math.max(1,n),r=t.lineWidth===-1?-1:Math.max(Math.min(t.lineWidth,40),t.lineWidth-o),s=i||t.flowLevel>-1&&n>=t.flowLevel;function a(c){return zl(t,c)}switch(Zl(e,s,t.indent,r,a)){case Ni:return e;case Pi:return"'"+e.replace(/'/g,"''")+"'";case Hi:return"|"+Yn(e,t.indent)+jn(Wn(e,o));case Bi:return">"+Yn(e,t.indent)+jn(Wn(th(e,r),o));case Ze:return'"'+nh(e)+'"';default:throw new Be("impossible error: invalid scalar style")}}()}function Yn(t,e){var n=Oi(t)?String(e):"",i=t[t.length-1]===`
`,o=i&&(t[t.length-2]===`
`||t===`
`),r=o?"+":i?"":"-";return n+r+`
`}function jn(t){return t[t.length-1]===`
`?t.slice(0,-1):t}function th(t,e){for(var n=/(\n+)([^\n]*)/g,i=function(){var l=t.indexOf(`
`);return l=l!==-1?l:t.length,n.lastIndex=l,Vn(t.slice(0,l),e)}(),o=t[0]===`
`||t[0]===" ",r,s;s=n.exec(t);){var a=s[1],c=s[2];r=c[0]===" ",i+=a+(!o&&!r&&c!==""?`
`:"")+Vn(c,e),o=r}return i}function Vn(t,e){if(t===""||t[0]===" ")return t;for(var n=/ [^ ]/g,i,o=0,r,s=0,a=0,c="";i=n.exec(t);)a=i.index,a-o>e&&(r=s>o?s:a,c+=`
`+t.slice(o,r),o=r+1),s=a;return c+=`
`,t.length-o>e&&s>o?c+=t.slice(o,s)+`
`+t.slice(s+1):c+=t.slice(o),c.slice(1)}function nh(t){for(var e="",n,i,o,r=0;r<t.length;r++){if(n=t.charCodeAt(r),n>=55296&&n<=56319&&(i=t.charCodeAt(r+1),i>=56320&&i<=57343)){e+=$n((n-55296)*1024+i-56320+65536),r++;continue}o=$[n],e+=!o&&ke(n)?t[r]:o||$n(n)}return e}function ih(t,e,n){var i="",o=t.tag,r,s;for(r=0,s=n.length;r<s;r+=1)ue(t,e,n[r],!1,!1)&&(r!==0&&(i+=","+(t.condenseFlow?"":" ")),i+=t.dump);t.tag=o,t.dump="["+i+"]"}function oh(t,e,n,i){var o="",r=t.tag,s,a;for(s=0,a=n.length;s<a;s+=1)ue(t,e+1,n[s],!0,!0)&&((!i||s!==0)&&(o+=Mt(t,e)),t.dump&&Fe===t.dump.charCodeAt(0)?o+="-":o+="- ",o+=t.dump);t.tag=r,t.dump=o||"[]"}function rh(t,e,n){var i="",o=t.tag,r=Object.keys(n),s,a,c,l,h;for(s=0,a=r.length;s<a;s+=1)h="",s!==0&&(h+=", "),t.condenseFlow&&(h+='"'),c=r[s],l=n[c],ue(t,e,c,!1,!1)&&(t.dump.length>1024&&(h+="? "),h+=t.dump+(t.condenseFlow?'"':"")+":"+(t.condenseFlow?"":" "),ue(t,e,l,!1,!1)&&(h+=t.dump,i+=h));t.tag=o,t.dump="{"+i+"}"}function sh(t,e,n,i){var o="",r=t.tag,s=Object.keys(n),a,c,l,h,d,p;if(t.sortKeys===!0)s.sort();else if(typeof t.sortKeys=="function")s.sort(t.sortKeys);else if(t.sortKeys)throw new Be("sortKeys must be a boolean or a function");for(a=0,c=s.length;a<c;a+=1)p="",(!i||a!==0)&&(p+=Mt(t,e)),l=s[a],h=n[l],ue(t,e+1,l,!0,!0,!0)&&(d=t.tag!==null&&t.tag!=="?"||t.dump&&t.dump.length>1024,d&&(t.dump&&Fe===t.dump.charCodeAt(0)?p+="?":p+="? "),p+=t.dump,d&&(p+=Mt(t,e)),ue(t,e+1,h,!0,d)&&(t.dump&&Fe===t.dump.charCodeAt(0)?p+=":":p+=": ",p+=t.dump,o+=p));t.tag=r,t.dump=o||"{}"}function qn(t,e,n){var i,o,r,s,a,c;for(o=n?t.explicitTypes:t.implicitTypes,r=0,s=o.length;r<s;r+=1)if(a=o[r],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof e=="object"&&e instanceof a.instanceOf)&&(!a.predicate||a.predicate(e))){if(t.tag=n?a.tag:"?",a.represent){if(c=t.styleMap[a.tag]||a.defaultStyle,Si.call(a.represent)==="[object Function]")i=a.represent(e,c);else if(Mi.call(a.represent,c))i=a.represent[c](e,c);else throw new Be("!<"+a.tag+'> tag resolver accepts not "'+c+'" style');t.dump=i}return!0}return!1}function ue(t,e,n,i,o,r){t.tag=null,t.dump=n,qn(t,n,!1)||qn(t,n,!0);var s=Si.call(t.dump);i&&(i=t.flowLevel<0||t.flowLevel>e);var a=s==="[object Object]"||s==="[object Array]",c,l;if(a&&(c=t.duplicates.indexOf(n),l=c!==-1),(t.tag!==null&&t.tag!=="?"||l||t.indent!==2&&e>0)&&(o=!1),l&&t.usedDuplicates[c])t.dump="*ref_"+c;else{if(a&&l&&!t.usedDuplicates[c]&&(t.usedDuplicates[c]=!0),s==="[object Object]")i&&Object.keys(t.dump).length!==0?(sh(t,e,t.dump,o),l&&(t.dump="&ref_"+c+t.dump)):(rh(t,e,t.dump),l&&(t.dump="&ref_"+c+" "+t.dump));else if(s==="[object Array]"){var h=t.noArrayIndent&&e>0?e-1:e;i&&t.dump.length!==0?(oh(t,h,t.dump,o),l&&(t.dump="&ref_"+c+t.dump)):(ih(t,h,t.dump),l&&(t.dump="&ref_"+c+" "+t.dump))}else if(s==="[object String]")t.tag!=="?"&&eh(t,t.dump,e,r);else{if(t.skipInvalid)return!1;throw new Be("unacceptable kind of an object to dump "+s)}t.tag!==null&&t.tag!=="?"&&(t.dump="!<"+t.tag+"> "+t.dump)}return!0}function ah(t,e){var n=[],i=[],o,r;for(It(t,n,i),o=0,r=i.length;o<r;o+=1)e.duplicates.push(n[i[o]]);e.usedDuplicates=new Array(r)}function It(t,e,n){var i,o,r;if(t!==null&&typeof t=="object")if(o=e.indexOf(t),o!==-1)n.indexOf(o)===-1&&n.push(o);else if(e.push(t),Array.isArray(t))for(o=0,r=t.length;o<r;o+=1)It(t[o],e,n);else for(i=Object.keys(t),o=0,r=i.length;o<r;o+=1)It(t[i[o]],e,n)}function Ui(t,e){e=e||{};var n=new Xl(e);return n.noRefs||ah(t,n),ue(n,0,t,!0,!0)?n.dump+`
`:""}function ch(t,e){return Ui(t,He.extend({schema:Rl},e))}Bt.dump=Ui;Bt.safeDump=ch;var ct=Oe,Gi=Bt;function lt(t){return function(){throw new Error("Function "+t+" is deprecated and cannot be used.")}}H.Type=U;H.Schema=xe;H.FAILSAFE_SCHEMA=Ot;H.JSON_SCHEMA=ci;H.CORE_SCHEMA=li;H.DEFAULT_SAFE_SCHEMA=Pe;H.DEFAULT_FULL_SCHEMA=st;H.load=ct.load;H.loadAll=ct.loadAll;H.safeLoad=ct.safeLoad;H.safeLoadAll=ct.safeLoadAll;H.dump=Gi.dump;H.safeDump=Gi.safeDump;H.YAMLException=Ne;H.MINIMAL_SCHEMA=Ot;H.SAFE_SCHEMA=Pe;H.DEFAULT_SCHEMA=st;H.scan=lt("scan");H.parse=lt("parse");H.compose=lt("compose");H.addConstructor=lt("addConstructor");var lh=H,hh=lh;function dh(t){if(!t.startsWith(`---
`))return{data:{},content:t};const e=t.indexOf(`
---`,4);if(e===-1)return{data:{},content:t};const n=t.slice(4,e),i=t.slice(e+4),o=i.startsWith(`
`)?i.slice(1):i;return{data:hh.safeLoad(n)??{},content:o}}const $i={npc:{specialNameChance:.3},missions:{boardMaxCount:8,missionTtlMs:9e5,deliveryChance:.6,deliveryBaseReward:200,deliveryRandomReward:200,supplyRewardMultiplierMin:1.15,supplyRewardMultiplierMax:1.5,supplyRequirementsMin:1,supplyRequirementsMax:2,supplyQtyMin:3,supplyQtyMax:10,deliveryDepositFraction:.2},trading:{stockCountMin:4,stockCountMax:6,stockQtyMin:5,stockQtyMax:10,stockTtlMs:12e4,stockRepCountBonusPerLevel:1,stockRepCountBonusMin:-2,stockRepCountBonusMax:3,stockRepQtyBonusPerLevel:2,stockRepQtyBonusMin:-4,stockRepQtyBonusMax:6},fuel:{pricePerLitre:10,consumptionPerLy:5,inSystemBaseConsumptionL:4},reputation:{levelUnfriendlyMin:-300,levelNeutralMin:-100,levelFriendlyMin:100,levelLikedMin:300,levelReveredMin:600,pointsMin:-600,pointsMax:1e3,missionDeltaSmall:25,missionDeltaMedium:75,missionDeltaLarge:200,missionTierMediumReward:300,missionTierLargeReward:600,tradeModifierHated:1.2,tradeModifierUnfriendly:1.1,tradeModifierNeutral:1,tradeModifierFriendly:.92,tradeModifierLiked:.85,tradeModifierRevered:.8,repPerCredit:.01,maxRepPerVisit:10},emergencyRescue:{towFee:500,fuelDropFee:800,fuelDropLitres:15},economies:{minFactor:.75,maxFactor:1.25},miniGames:{maxHullDamageFraction:.05,abandonDamageFraction:.05,noDamageThreshold:90,surface:{gravityAccel:3,airResistance:.5,thrustForce:8,maxSafeSpeed:3,crashSpeed:10,offPadScoreMultiplier:.5,padWidth:6,maxSpeed:15},asteroid:{thrustForce:8,maxSafeSpeed:4,crashSpeed:12,offPadScoreMultiplier:.5,padWidth:6,initialDownwardVelocity:2,maxSpeed:15},navigation:{ship:{accelerationImpulse:.8,maxSpeedLateral:4,maxSpeedForward:6,playerRowPreference:.67,topBufferRows:4},difficulties:{easy:{baseScrollSpeed:.3,minScrollSpeed:.2,obstacleDensity:.5,edgeSpawnIntervalFrames:120,driftSpeedMax:.2,targetDistance:150},normal:{baseScrollSpeed:.5,minScrollSpeed:.35,obstacleDensity:.8,edgeSpawnIntervalFrames:80,driftSpeedMax:.4,targetDistance:200},hard:{baseScrollSpeed:.8,minScrollSpeed:.55,obstacleDensity:1.3,edgeSpawnIntervalFrames:50,driftSpeedMax:.7,targetDistance:250}},eventTypes:{asteroid_belt:{largeRatio:.25,mediumRatio:.4,smallRatio:.35},space_debris:{largeRatio:.08,mediumRatio:.25,smallRatio:.67},space_storm:{largeRatio:0,mediumRatio:.1,smallRatio:.9}}}},navigationEncounter:{encounterChanceOnJump:.3}};function uh(t){const e={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},balance:{...$i},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],economies:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[n,i]of Object.entries(t)){const o=n.split("/").pop()??"";if(o==="_template.md"||o===".gitkeep")continue;const{data:r,content:s}=dh(i);/^systems\/[^/]+\.md$/.test(n)?e.systems.push(ph(r,s)):/^destinations\/[^/]+\.md$/.test(n)?e.destinations.push(mh(r,s)):/^factions\/[^/]+\.md$/.test(n)?e.factions.push(fh(r,s)):/^ships\/[^/]+\.md$/.test(n)?e.ships.push(gh(r,s)):n==="ships/components/jump-drives.md"?e.drives=yh(r):n==="navigation/jump-routes.md"?e.routes=_h(r):n==="commodities.md"?e.commodities=bh(r):n==="economies.md"?e.economies=Ch(r):/^story\/[^/]+\.md$/.test(n)?e.storyBeats.push(wh(r,s)):n==="settings/new-game.md"?e.settings=vh(r):n==="settings/balance.md"?e.balance=Ih(r):n==="delivery-items.md"?e.deliveryItems=kh(r):n==="npc-names.md"&&(e.npcNames=xh(r))}return e}function ht(t){const e=[];let n=!1;for(const i of t.split(`
`)){const o=i.trim();if(!o.startsWith("#"))if(o===""){if(n)break}else n=!0,e.push(o)}return e.join(" ")}function ph(t,e){return{id:t.id,name:t.name,starType:t.star_type,distanceFromSol:t.distance_from_sol,zone:t.zone,security:t.security,population:t.population,dangerLevel:t.danger_level,playerKnowledge:t.player_knowledge,economies:t.economies??[],majorFactions:t.major_factions??[],destinations:t.destinations??[],tags:t.tags??[],description:ht(e)}}function mh(t,e){const n=t.amenities??{},i={trader:n.trader??!1,shipRepair:n.ship_repair??!1,fuel:n.fuel??!1,shipDealer:n.ship_dealer??!1};return{id:t.id,name:t.name,system:t.system,locationType:t.location_type,type:t.type,amenities:i,npcs:t.npcs??{},minMissions:t.min_missions??0,missionChance:t.mission_chance??0,dangerLevel:t.danger_level,tags:t.tags??[],description:ht(e),owningFactionId:t.owning_faction,difficultyMultiplier:t.difficulty_multiplier!==void 0?parseFloat(t.difficulty_multiplier):void 0}}function fh(t,e){return{id:t.id,name:t.name,type:t.type,homeSystem:t.home_system,size:t.size,influence:t.influence??[],tags:t.tags??[],description:ht(e),rivals:t.rivals??[],allies:t.allies??[]}}function gh(t,e){return{id:t.id,name:t.name,class:t.class,cost:t.cost,cargoCapacityKg:t.cargo_capacity_kg,fuelCapacityL:t.fuel_capacity_l,hullPoints:t.hull_points,defaultJumpDrive:t.default_jump_drive,fuelEfficiency:t.fuel_efficiency,tags:t.tags??[],description:ht(e)}}function yh(t){return(t.drives??[]).map(n=>({id:n.id,name:n.name,maxDistanceLy:n.max_distance_ly,fuelEfficiency:n.fuel_efficiency,cost:n.cost}))}function _h(t){return(t.routes??[]).map(n=>({from:n.from,to:n.to,distance:n.distance,stability:n.stability,security:n.security}))}function bh(t){return(t.commodities??[]).map(n=>({id:n.id,name:n.name,basePrice:n.base_price,category:n.category,legal:n.legal,weightKg:n.weight_kg,description:n.description??""}))}function wh(t,e){return{id:t.id,title:t.title,trigger:t.trigger,type:t.type,location:t.location,skippable:t.skippable,playerKnowledge:t.player_knowledge,text:e.trim()}}function vh(t){var e,n,i,o;return{player:{name:((e=t.player)==null?void 0:e.name)??"Captain",startingCredits:((n=t.player)==null?void 0:n.starting_credits)??0},startingLocation:{system:((i=t.starting_location)==null?void 0:i.system)??"",destination:((o=t.starting_location)==null?void 0:o.destination)??""},startingShip:t.starting_ship??""}}function kh(t){return(t.delivery_items??[]).map(n=>({id:n.id,name:n.name,weightKg:n.weight_kg}))}function xh(t){const e=t.npc_names??{};return{special:e.special??[],firstNames:e.first_names??[],lastNames:e.last_names??[]}}function Ch(t){return(t.economies??[]).map(n=>({id:n.id,summary:n.summary,commodities:(n.commodities??[]).map(i=>({id:i.id,factor:i.factor}))}))}function Th(t,e){return{gravityAccel:t.gravity_accel??e.gravityAccel,airResistance:t.air_resistance??e.airResistance,thrustForce:t.thrust_force??e.thrustForce,maxSafeSpeed:t.max_safe_speed??e.maxSafeSpeed,crashSpeed:t.crash_speed??e.crashSpeed,offPadScoreMultiplier:t.off_pad_score_multiplier??e.offPadScoreMultiplier,padWidth:t.pad_width??e.padWidth,maxSpeed:t.max_speed??e.maxSpeed}}function Sh(t,e){return{thrustForce:t.thrust_force??e.thrustForce,maxSafeSpeed:t.max_safe_speed??e.maxSafeSpeed,crashSpeed:t.crash_speed??e.crashSpeed,offPadScoreMultiplier:t.off_pad_score_multiplier??e.offPadScoreMultiplier,padWidth:t.pad_width??e.padWidth,initialDownwardVelocity:t.initial_downward_velocity??e.initialDownwardVelocity,maxSpeed:t.max_speed??e.maxSpeed}}function Mh(t,e){var a,c,l,h,d,p,u,m,f,y,b;const n=t.ship??{},i=t.difficulties??{},o=t.event_types??{},r=(x,_)=>({baseScrollSpeed:x.base_scroll_speed??(_==null?void 0:_.baseScrollSpeed),minScrollSpeed:x.min_scroll_speed??(_==null?void 0:_.minScrollSpeed),obstacleDensity:x.obstacle_density??(_==null?void 0:_.obstacleDensity),edgeSpawnIntervalFrames:x.edge_spawn_interval_frames??(_==null?void 0:_.edgeSpawnIntervalFrames),driftSpeedMax:x.drift_speed_max??(_==null?void 0:_.driftSpeedMax),targetDistance:x.target_distance??(_==null?void 0:_.targetDistance)}),s=(x,_)=>({largeRatio:x.large_ratio??(_==null?void 0:_.largeRatio),mediumRatio:x.medium_ratio??(_==null?void 0:_.mediumRatio),smallRatio:x.small_ratio??(_==null?void 0:_.smallRatio)});return{ship:{accelerationImpulse:n.acceleration_impulse??((a=e==null?void 0:e.ship)==null?void 0:a.accelerationImpulse)??.4,maxSpeedLateral:n.max_speed_lateral??((c=e==null?void 0:e.ship)==null?void 0:c.maxSpeedLateral)??2,maxSpeedForward:n.max_speed_forward??((l=e==null?void 0:e.ship)==null?void 0:l.maxSpeedForward)??3,playerRowPreference:n.player_row_preference??((h=e==null?void 0:e.ship)==null?void 0:h.playerRowPreference)??.67,topBufferRows:n.top_buffer_rows??((d=e==null?void 0:e.ship)==null?void 0:d.topBufferRows)??4},difficulties:{easy:r(i.easy??{},(p=e==null?void 0:e.difficulties)==null?void 0:p.easy),normal:r(i.normal??{},(u=e==null?void 0:e.difficulties)==null?void 0:u.normal),hard:r(i.hard??{},(m=e==null?void 0:e.difficulties)==null?void 0:m.hard)},eventTypes:{asteroid_belt:s(o.asteroid_belt??{},(f=e==null?void 0:e.eventTypes)==null?void 0:f.asteroid_belt),space_debris:s(o.space_debris??{},(y=e==null?void 0:e.eventTypes)==null?void 0:y.space_debris),space_storm:s(o.space_storm??{},(b=e==null?void 0:e.eventTypes)==null?void 0:b.space_storm)}}}function Ih(t){const e=$i,n=t.npc??{},i=t.missions??{},o=t.trading??{},r=t.fuel??{},s=t.reputation??{},a=t.emergency_rescue??{},c=t.economies??{},l=t.mini_games??{},h=t.navigation_encounter??{};return{npc:{specialNameChance:n.special_name_chance??e.npc.specialNameChance},missions:{boardMaxCount:i.board_max_count??e.missions.boardMaxCount,missionTtlMs:i.mission_ttl_ms??e.missions.missionTtlMs,deliveryChance:i.delivery_chance??e.missions.deliveryChance,deliveryBaseReward:i.delivery_base_reward??e.missions.deliveryBaseReward,deliveryRandomReward:i.delivery_random_reward??e.missions.deliveryRandomReward,supplyRewardMultiplierMin:i.supply_reward_multiplier_min??e.missions.supplyRewardMultiplierMin,supplyRewardMultiplierMax:i.supply_reward_multiplier_max??e.missions.supplyRewardMultiplierMax,supplyRequirementsMin:i.supply_requirements_min??e.missions.supplyRequirementsMin,supplyRequirementsMax:i.supply_requirements_max??e.missions.supplyRequirementsMax,supplyQtyMin:i.supply_qty_min??e.missions.supplyQtyMin,supplyQtyMax:i.supply_qty_max??e.missions.supplyQtyMax,deliveryDepositFraction:i.delivery_deposit_fraction??e.missions.deliveryDepositFraction},trading:{stockCountMin:o.stock_count_min??e.trading.stockCountMin,stockCountMax:o.stock_count_max??e.trading.stockCountMax,stockQtyMin:o.stock_qty_min??e.trading.stockQtyMin,stockQtyMax:o.stock_qty_max??e.trading.stockQtyMax,stockTtlMs:o.stock_ttl_ms??e.trading.stockTtlMs,stockRepCountBonusPerLevel:o.stock_rep_count_bonus_per_level??e.trading.stockRepCountBonusPerLevel,stockRepCountBonusMin:o.stock_rep_count_bonus_min??e.trading.stockRepCountBonusMin,stockRepCountBonusMax:o.stock_rep_count_bonus_max??e.trading.stockRepCountBonusMax,stockRepQtyBonusPerLevel:o.stock_rep_qty_bonus_per_level??e.trading.stockRepQtyBonusPerLevel,stockRepQtyBonusMin:o.stock_rep_qty_bonus_min??e.trading.stockRepQtyBonusMin,stockRepQtyBonusMax:o.stock_rep_qty_bonus_max??e.trading.stockRepQtyBonusMax},fuel:{pricePerLitre:r.price_per_litre??e.fuel.pricePerLitre,consumptionPerLy:r.consumption_per_ly??e.fuel.consumptionPerLy,inSystemBaseConsumptionL:r.in_system_base_consumption_l??e.fuel.inSystemBaseConsumptionL},reputation:{levelUnfriendlyMin:s.level_unfriendly_min??e.reputation.levelUnfriendlyMin,levelNeutralMin:s.level_neutral_min??e.reputation.levelNeutralMin,levelFriendlyMin:s.level_friendly_min??e.reputation.levelFriendlyMin,levelLikedMin:s.level_liked_min??e.reputation.levelLikedMin,levelReveredMin:s.level_revered_min??e.reputation.levelReveredMin,pointsMin:s.points_min??e.reputation.pointsMin,pointsMax:s.points_max??e.reputation.pointsMax,missionDeltaSmall:s.mission_delta_small??e.reputation.missionDeltaSmall,missionDeltaMedium:s.mission_delta_medium??e.reputation.missionDeltaMedium,missionDeltaLarge:s.mission_delta_large??e.reputation.missionDeltaLarge,missionTierMediumReward:s.mission_tier_medium_reward??e.reputation.missionTierMediumReward,missionTierLargeReward:s.mission_tier_large_reward??e.reputation.missionTierLargeReward,tradeModifierHated:s.trade_modifier_hated??e.reputation.tradeModifierHated,tradeModifierUnfriendly:s.trade_modifier_unfriendly??e.reputation.tradeModifierUnfriendly,tradeModifierNeutral:s.trade_modifier_neutral??e.reputation.tradeModifierNeutral,tradeModifierFriendly:s.trade_modifier_friendly??e.reputation.tradeModifierFriendly,tradeModifierLiked:s.trade_modifier_liked??e.reputation.tradeModifierLiked,tradeModifierRevered:s.trade_modifier_revered??e.reputation.tradeModifierRevered,repPerCredit:s.rep_per_credit??e.reputation.repPerCredit,maxRepPerVisit:s.max_rep_per_visit??e.reputation.maxRepPerVisit},emergencyRescue:{towFee:a.tow_fee??e.emergencyRescue.towFee,fuelDropFee:a.fuel_drop_fee??e.emergencyRescue.fuelDropFee,fuelDropLitres:a.fuel_drop_litres??e.emergencyRescue.fuelDropLitres},economies:{minFactor:c.min_factor??e.economies.minFactor,maxFactor:c.max_factor??e.economies.maxFactor},miniGames:{maxHullDamageFraction:l.max_hull_damage_fraction??e.miniGames.maxHullDamageFraction,abandonDamageFraction:l.abandon_damage_fraction??e.miniGames.abandonDamageFraction,noDamageThreshold:l.no_damage_threshold??e.miniGames.noDamageThreshold,surface:Th(l.surface??{},e.miniGames.surface),asteroid:Sh(l.asteroid??{},e.miniGames.asteroid),navigation:Mh(l.navigation_minigame??{},e.miniGames.navigation)},navigationEncounter:{encounterChanceOnJump:h.encounter_chance_on_jump??e.navigationEncounter.encounterChanceOnJump}}}function Ah(){const t=Object.assign({"/docs/world/commodities.md":fs,"/docs/world/delivery-items.md":gs,"/docs/world/destinations/_template.md":ys,"/docs/world/destinations/blackwake-yard.md":_s,"/docs/world/destinations/ceti-landfall.md":bs,"/docs/world/destinations/drift-market.md":ws,"/docs/world/destinations/elysium-station.md":vs,"/docs/world/destinations/eridani-anchorage.md":ks,"/docs/world/destinations/foundries-platform.md":xs,"/docs/world/destinations/galileo-transfer.md":Cs,"/docs/world/destinations/hestia-ring.md":Ts,"/docs/world/destinations/keelhaul-station.md":Ss,"/docs/world/destinations/kepler-yard.md":Ms,"/docs/world/destinations/mars-anchor.md":Is,"/docs/world/destinations/meridian-station.md":As,"/docs/world/destinations/new-horizon-port.md":Rs,"/docs/world/destinations/orrery-anchorage.md":Es,"/docs/world/destinations/redline-station.md":Ls,"/docs/world/destinations/tycho-orbital.md":Fs,"/docs/world/destinations/veil-station.md":Ds,"/docs/world/destinations/waypoint-ceti.md":Os,"/docs/world/economies.md":Ns,"/docs/world/factions/_template.md":Ps,"/docs/world/factions/centauri-trade-league.md":Hs,"/docs/world/factions/eridani-colonial-council.md":Bs,"/docs/world/factions/free-captains.md":Us,"/docs/world/factions/grey-market-cartel.md":Gs,"/docs/world/factions/helios-directorate.md":$s,"/docs/world/factions/independent-miners-guild.md":Ws,"/docs/world/factions/procyon-institute.md":Ks,"/docs/world/factions/terran-union.md":Ys,"/docs/world/galaxy-map.md":js,"/docs/world/navigation/jump-routes.md":Vs,"/docs/world/npc-names.md":qs,"/docs/world/settings/balance.md":Xs,"/docs/world/settings/new-game.md":zs,"/docs/world/ships/_template.md":Qs,"/docs/world/ships/components/jump-drives.md":Js,"/docs/world/ships/freighter.md":Zs,"/docs/world/ships/hauler.md":ea,"/docs/world/ships/scout.md":ta,"/docs/world/story/_template.md":na,"/docs/world/story/enter-wolf-359.md":ia,"/docs/world/story/first-jump.md":oa,"/docs/world/story/opening-arrival.md":ra,"/docs/world/systems/_template.md":sa,"/docs/world/systems/alpha-centauri.md":aa,"/docs/world/systems/barnards-star.md":ca,"/docs/world/systems/epsilon-eridani.md":la,"/docs/world/systems/procyon.md":ha,"/docs/world/systems/sirius.md":da,"/docs/world/systems/sol.md":ua,"/docs/world/systems/tau-ceti.md":pa,"/docs/world/systems/wolf-359.md":ma}),e={};for(const[n,i]of Object.entries(t)){const o=n.replace("/docs/world/","");e[o]=i}return uh(e)}oo(Ah());const Rh=navigator.maxTouchPoints>0?"touch":"keyboard",Eh=new URLSearchParams(window.location.search).has("debug"),Wi={environment:"browser",primaryInput:Rh,debug:Eh},Lh=new Xi,Ki=new Zi(Wi);Ki.connect();const Fh=new ms(Lh,Ki,Wi);let Xn=0;function Yi(t){Fh.tick(t-Xn),Xn=t,requestAnimationFrame(Yi)}requestAnimationFrame(Yi);
