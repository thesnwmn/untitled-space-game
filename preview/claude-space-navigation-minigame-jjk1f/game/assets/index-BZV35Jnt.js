(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();const Te=40,Ge=30,Wi=50,ut=24;function Yi(t){return t==="&"?"&amp;":t==="<"?"&lt;":t===">"?"&gt;":t}class Ki{constructor(){this.charW=0,this.charH=0,this.gridH=Ge,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(Te),this.pre.dataset.gridRows=String(Ge),document.body.appendChild(this.pre);const e=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${ut}px "Share Tech Mono"`).catch(()=>null)]).then(e),document.fonts.addEventListener("loadingdone",e),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const e=document.createElement("span");e.style.fontFamily="'Share Tech Mono', monospace",e.style.fontSize=`${ut}px`,e.style.lineHeight="1em",e.style.position="absolute",e.style.visibility="hidden",e.textContent="M",document.body.appendChild(e);const n=e.getBoundingClientRect();document.body.removeChild(e),this.charW=n.width,this.charH=n.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const e=Math.min(window.innerWidth/(Te*this.charW),window.innerHeight/(Ge*this.charH)),n=Math.max(Ge,Math.min(Wi,Math.floor(window.innerHeight/(this.charH*e))));if(this.pre.style.fontSize=`${ut*e}px`,this.pre.style.width=`${Te*this.charW*e}px`,n!==this.gridH){this.gridH=n,this.pre.dataset.gridRows=String(n);for(const i of this.resizeHandlers)i(Te,n)}}onResize(e){this.resizeHandlers.push(e)}drawBuffer(e){const n=[];for(const i of e){let s="";for(const r of i){const o=r.fg!=="transparent"?`fg-${r.fg}`:"",a=r.bg!=="transparent"?`bg-${r.bg}`:"",l=o&&a?`${o} ${a}`:o||a,c=l?` class="${l}"`:"";s+=`<span${c}>${Yi(r.char)}</span>`}n.push(s)}this.pre.innerHTML=n.join(`
`)}getWidth(){return Te}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}destroy(){this.pre.remove()}}const ji={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",m:"MENU",M:"MENU",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},Vi=new Set(["0","1","2","3","4","5","6","7","8","9"]),qi=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class zi{constructor(e){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.touchTrackHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerMoveListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=e.debug}logDebug(e){if(this.debugMode){if(this.debugLog.unshift(e),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const n=document.createElement("div");n.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(n),this.debugEl=n}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(e){this.actionHandlers.push(e)}onTap(e){this.tapHandlers.push(e)}onCharInput(e){this.charInputHandlers.push(e)}onTouchTrack(e){this.touchTrackHandlers.push(e)}connect(){this.keyListener=e=>{if(qi.has(e.key)&&e.preventDefault(),Vi.has(e.key))for(const i of this.charInputHandlers.slice())i(e.key);if(e.key==="Backspace"||e.key==="Delete"){for(const i of this.charInputHandlers.slice())i("\b");return}const n=ji[e.key];if(n)for(const i of this.actionHandlers.slice())i(n)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=e=>{if(e.preventDefault(),this.pointerStartMap.set(e.pointerId,{startX:e.clientX,startY:e.clientY}),this.activePointers.add(e.pointerId),this.logDebug(`DOWN id=${e.pointerId} (${Math.round(e.clientX)},${Math.round(e.clientY)}) type=${e.pointerType} active=${this.activePointers.size}`),this.touchTrackHandlers.length>0){const n=this.getGridCoordsForTrack(e.clientX,e.clientY);if(n)for(const i of this.touchTrackHandlers.slice())i.start(n.col,n.row,e.pointerId)}},this.pointerMoveListener=e=>{if(this.pointerStartMap.has(e.pointerId)&&this.touchTrackHandlers.length>0){const n=this.getGridCoordsForTrack(e.clientX,e.clientY);if(n)for(const i of this.touchTrackHandlers.slice())i.move(n.col,n.row,e.pointerId)}},this.pointerUpListener=e=>{const n=this.pointerStartMap.get(e.pointerId),i=this.activePointers.size;if(this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId),this.touchTrackHandlers.length>0)for(const l of this.touchTrackHandlers.slice())l.end(e.pointerId);if(!n){this.logDebug(`UP id=${e.pointerId} NO START`);return}const s=e.clientX-n.startX,r=e.clientY-n.startY,o=Math.abs(s),a=Math.abs(r);if(o<20&&a<20)if(i>=2){this.logDebug(`UP id=${e.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(n.startX,n.startY);if(c){this.logDebug(`TAP (${Math.round(n.startX)},${Math.round(n.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(n.startX)},${Math.round(n.startY)}) rect=${l} -> OOB`)}else{if(this.touchTrackHandlers.length>0){this.logDebug(`DRAG-END (joystick) dx=${Math.round(s)} dy=${Math.round(r)} -> suppressed`);return}let l;o>=a?l=s>0?"RIGHT":"LEFT":l=r>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(s)} dy=${Math.round(r)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=e=>{if(this.logDebug(`CANCEL id=${e.pointerId}`),this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId),this.touchTrackHandlers.length>0)for(const n of this.touchTrackHandlers.slice())n.end(e.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointermove",this.pointerMoveListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerMoveListener&&(window.removeEventListener("pointermove",this.pointerMoveListener),this.pointerMoveListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const e=document.querySelector(".game-screen");if(!e)return"NO PRE";const n=e.getBoundingClientRect();return`L${Math.round(n.left)},T${Math.round(n.top)},R${Math.round(n.right)},B${Math.round(n.bottom)}`}getGridCoords(e,n){const i=document.querySelector(".game-screen");if(!i)return null;const s=i.getBoundingClientRect(),r=parseInt(i.dataset.gridCols??"1"),o=parseInt(i.dataset.gridRows??"1");if(!r||!o||!s.width||!s.height)return null;const a=Math.floor((e-s.left)/(s.width/r)),l=Math.floor((n-s.top)/(s.height/o));return a<0||a>=r||l<0||l>=o?null:{col:a,row:l}}getGridCoordsForTrack(e,n){const i=document.querySelector(".game-screen");if(!i)return null;const s=i.getBoundingClientRect(),r=parseInt(i.dataset.gridCols??"1"),o=parseInt(i.dataset.gridRows??"1");if(!r||!o||!s.width||!s.height)return null;const a=Math.floor((e-s.left)/(s.width/r)),l=Math.floor((n-s.top)/(s.height/o));return{col:a,row:l}}}function g(t,e,n,i,s,r){if(e<0||e>=t.length)return;const o=t[e];for(let a=0;a<i.length;a++){const l=n+a;l>=0&&l<o.length&&(o[l]={char:i[a],fg:s,bg:r})}}function F(t,e,n,i,s){if(e<0||e>=t.length)return;const r=t[e].length,o=Math.max(0,Math.floor((r-n.length)/2));g(t,e,o,n,i,s)}function it(t,e){const n=t.split(/\s+/).filter(Boolean),i=[];let s="";for(const r of n)s.length===0?s=r:s.length+1+r.length<=e?s+=" "+r:(i.push(s),s=r);return s.length>0&&i.push(s),i}function ge(t,e,n,i="bright-black"){g(t,e,0,"-".repeat(n),i,"black")}function jn(t,e,n,i,s){const r=`${i+1}/${s}`;g(t,e,0,"|<|","white","black");const o=Math.floor((n-r.length)/2);g(t,e,o,r,"bright-black","black"),g(t,e,n-3,"|>|","white","black")}const Wt=["UNTITLED","SPACE GAME"],Xi=4,Qi=3,Ji="- An ASCII space adventure -",Zi=11,Yt=16;class Kt{constructor(e,n,i,s){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,s()}}],n.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),e.onAction(r=>{this.activated||(r==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:r==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:r==="SELECT"&&this.items[this.cursorIdx].action())}),e.onTap&&e.onTap((r,o)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(o===Yt+a){this.cursorIdx=a,this.items[a].action();return}}})}update(e){}render(e){const n=e.length,i=n>0?e[0].length:0;for(let o=0;o<n;o++)for(let a=0;a<i;a++)e[o][a]={char:" ",fg:"black",bg:"black"};for(let o=0;o<Wt.length;o++)F(e,Xi+o*Qi,Wt[o],"bright-cyan","black");F(e,Zi,Ji,"white","black");const s=this.items.reduce((o,a)=>Math.max(o,a.label.length+2),0),r=Math.max(0,Math.floor((i-s)/2));for(let o=0;o<this.items.length;o++){const a=Yt+o;if(a>=n)continue;const l=o===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";g(e,a,r,c+this.items[o].label,h,"black")}}}let kt=null;function es(t){kt=t}function L(){if(kt===null)throw new Error("World not initialised — call initWorld() before accessing world data");return kt}function te(t){return L().systems.find(e=>e.id===t)}function N(t){return L().destinations.find(e=>e.id===t)}function At(t){return L().routes.filter(e=>e.from===t||e.to===t)}function Vn(t){return L().drives.find(e=>e.id===t)}function ts(t){return L().storyBeats.filter(e=>e.trigger===t)}function qn(){return L().settings}function D(){return L().balance}function qe(t){return L().ships.find(e=>e.id===t)}function ze(t,e){return L().routes.find(n=>n.from===t&&n.to===e||n.from===e&&n.to===t)}function zn(t){return L().factions.find(e=>e.id===t)}function de(t){return L().commodities.find(e=>e.id===t)}function ns(){return L().commodities}function is(){return L().systems.filter(t=>t.playerKnowledge==="public")}function ss(t){return t.reduce((e,n)=>{const i=de(n.commodityId);return e+n.qty*((i==null?void 0:i.weightKg)??0)},0)}function rs(t){return L().economies.find(e=>e.id===t)}function Je(t,e){const n=D(),i=[];for(const r of e.economies){const o=rs(r);if(o){for(const a of o.commodities)if(a.id===t){i.push(a.factor);break}}}const s=i.length===0?1:i.reduce((r,o)=>r+o,0)/i.length;return Math.max(n.economies.minFactor,Math.min(n.economies.maxFactor,s))}const X=3,jt=0;function Rt(t,e){return e?t-2:t}function os(t){return t.toLocaleString("en-US")}class as{constructor(e,n){this.buttonRanges=null,this.footerRow=-1,this.headerWidth=-1,this.context=e,this.player=n}render(e,n){const i=e.length,s=i>0?e[0].length:0;this.footerRow=-1,this.buttonRanges=null,n.showHeader?(this.headerWidth=s,this.renderHeaderRow0(e,s,n.systemLabel),this.renderHeaderRow1(e,s,n.destinationLabel)):this.headerWidth=-1,n.showFooter&&(this.renderFooter(e,i,s,n.navOptions),this.footerRow=i-1)}renderHeaderRow0(e,n,i){const s=i!==void 0?i??"":(()=>{const c=te(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),r="::";g(e,0,0,r,"bright-black","black"),g(e,0,r.length,s,"bright-cyan","black");const a=n-r.length-s.length-10;let l=r.length+s.length;for(let c=0;c<a;c++)e[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,g(e,0,l,"[M]","white","black"),l+=3,g(e,0,l," MENU","white","black"),l+=5,g(e,0,l,"::","bright-black","black")}renderHeaderRow1(e,n,i){const s=i!==void 0?i??"":(()=>{const h=this.player.destinationId?N(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),r=os(this.player.credits),o=r.length+5,a="::";g(e,1,0,a,"bright-black","black"),g(e,1,a.length,s,"cyan","black");const l=n-a.length-s.length-o;let c=a.length+s.length;for(let h=0;h<l;h++)e[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,g(e,1,c,r,"green","black"),c+=r.length,g(e,1,c," CR","white","black"),c+=3,g(e,1,c,"::","bright-black","black")}renderFooter(e,n,i,s){const r=n-1,o=[];if(s.length===0){for(let l=0;l<i;l++)e[r][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}g(e,r,0,"::","bright-black","black");let a=2;for(let l=0;l<s.length;l++){l>0&&(g(e,r,a,"::","bright-black","black"),a+=2);const c=s[l],h=`[${l+1}]`,d=` ${c.label}`,p=a;g(e,r,a,h,"white","black"),a+=h.length,g(e,r,a,d,"white","black"),a+=d.length,o.push({id:c.id,startCol:p,endCol:a})}for(let l=a;l<i;l++)e[r][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=o}hitTestNav(e,n){if(this.footerRow<0||this.buttonRanges===null||n!==this.footerRow)return null;for(const i of this.buttonRanges)if(e>=i.startCol&&e<i.endCol)return i.id;return null}hitTestHeader(e,n){if(this.headerWidth<0||n!==0)return null;const i=this.headerWidth-10,s=this.headerWidth-2;return e>=i&&e<s?"menu":null}}class Q{constructor(e,n,i,s){this.activeTabIdx=0,this.activated=!1,this.player=i,this.chrome=new as(n,i),this.opts=s,e.onCharInput&&e.onCharInput(r=>{this.activated||this.handleCharInput(r)}),e.onAction(r=>{if(!this.activated&&!this.preHandleAction(r)){if(r==="MENU"&&s.onMenu){s.onMenu();return}if(s.tabs){if(r==="LEFT"){const o=Math.max(0,this.activeTabIdx-1);o!==this.activeTabIdx&&(this.activeTabIdx=o,this.onTabChange(o));return}if(r==="RIGHT"){const o=Math.min(s.tabs.length-1,this.activeTabIdx+1);o!==this.activeTabIdx&&(this.activeTabIdx=o,this.onTabChange(o));return}}this.handleAction(r)}}),e.onTap&&e.onTap((r,o)=>{var l;if(this.activated||this.preHandleTap(r,o))return;const a=this.chrome.hitTestNav(r,o);if(a!==null){this.handleNavTap(a);return}if(this.chrome.hitTestHeader(r,o)==="menu"&&s.onMenu){s.onMenu();return}if(s.tabs&&s.title!==void 0){const c=s.showHeader??!0?X:jt,h=((l=s.summary)==null?void 0:l.length)??0,d=c+3+h;if(o===d){let p=3;for(let u=0;u<s.tabs.length;u++){const m=s.tabs[u].length+2;if(r>=p&&r<p+m){u!==this.activeTabIdx&&(this.activeTabIdx=u,this.onTabChange(u));return}p+=m+1}return}}this.handleTap(r,o)})}preHandleAction(e){return!1}preHandleTap(e,n){return!1}handleAction(e){}handleTap(e,n){}handleNavTap(e){}handleCharInput(e){}onTabChange(e){}buildChromeConfig(){return{showHeader:this.opts.showHeader??!0,showFooter:this.opts.showFooter??!0,navOptions:this.opts.navOptions}}suspend(){this.activated=!0}resume(){this.activated=!1}update(e){}render(e){var p;const n=e.length,i=n>0?e[0].length:0,s=this.opts;for(let u=0;u<n;u++)for(let m=0;m<i;m++)e[u][m]={char:" ",fg:"black",bg:"black"};const r=this.buildChromeConfig();this.chrome.render(e,r);const o=s.showHeader??!0,a=s.showFooter??!0,l=o?X:jt,c=((p=s.summary)==null?void 0:p.length)??0,h=Rt(n,a);let d;if(s.title!==void 0){g(e,l,2,s.title,"bright-white","black"),g(e,l+1,2,"'".repeat(s.title.length),"bright-black","black");for(let u=0;u<c;u++)g(e,l+2+u,2,s.summary[u],"bright-black","black");if(s.tabs){const u=l+3+c;let m=2;u<n&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++;for(let f=0;f<s.tabs.length;f++){const y=f===this.activeTabIdx,b=` ${s.tabs[f]} `,S=y?"black":"white",_=y?"green":"black";for(const M of b)u<n&&m<i&&(e[u][m]={char:M,fg:S,bg:_}),m++;u<n&&m<i&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++}d=l+5+c}else d=l+3+c}else d=l;this.renderContent(e,d,h)}}class pe extends Q{constructor(e,n,i,s,r,o,a=[],l=null,c){super(s,r,o,{navOptions:i,title:e,summary:a,tabs:l!==null?l.map(d=>d.label):void 0,onMenu:c}),this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.modal=null,this.lastContentTop=0,this._staticItems=n,this.tabs=l,this.infoLines=a;const h=a.length;this.lastContentTop=l!==null?X+5+h:X+3+h,this.resetCursor()}get items(){var e;return this.tabs!==null?((e=this.tabs[this.activeTabIdx])==null?void 0:e.items)??[]:this._staticItems}preHandleAction(e){return this.modal!==null?(this.modal.handleAction(e),!0):!1}preHandleTap(e,n){return this.modal!==null?(this.modal.handleTap(e,n),!0):!1}handleCharInput(e){this.modal!==null&&this.modal.handleCharInput(e)}onTabChange(e){this.resetCursor()}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):e==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):e==="SELECT"?this.activateCurrent():this.handleNavAction(e)}handleTap(e,n){const i=this.rowToVisibleItemIndex(n);i!==null&&!this.items[i].disabled&&(this.cursorIdx=i,this.activateCurrent())}moveCursor(e){const n=this.items,i=n.length;if(i===0)return;const s=this.cursorIdx===-1?e>0?i-1:0:this.cursorIdx;for(let r=0;r<i;r++){const o=((s+e*(r+1))%i+i)%i;if(!n[o].disabled){this.cursorIdx=o;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const e=this.items[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}rowToVisibleItemIndex(e){var s,r;let n=this.lastContentTop;const i=this.items;for(let o=0;o<i.length;o++){const a=1+(((s=i[o].details)==null?void 0:s.length)??0)+(((r=i[o].detailsColored)==null?void 0:r.length)??0);if(e>=n&&e<n+a)return o;n+=a}return null}resetCursor(){const e=this.items;for(let n=0;n<e.length;n++)if(!e[n].disabled){this.cursorIdx=n;return}this.cursorIdx=-1}handleNavAction(e){}openModal(e){this.modal=e,this.activated=!1}closeModal(){this.modal=null}renderContent(e,n,i){var S,_,M,w;this.lastContentTop=n;const r=e.length>0?e[0].length:0,o=i-1,a=o-n,l=this.items,c=l.map(C=>{var v,k;return 1+(((v=C.details)==null?void 0:v.length)??0)+(((k=C.detailsColored)==null?void 0:k.length)??0)}),d=c.reduce((C,v)=>C+v,0)>a,p=d?a-1:a,u=[];let m=[],f=0;for(let C=0;C<c.length;C++)f+c[C]>p?(m.length>0&&u.push(m),m=[C],f=c[C]):(m.push(C),f+=c[C]);m.length>0&&u.push(m),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const y=u[this.pageIndex]??[];let b=n;for(const C of y){const v=l[C],k=C===this.cursorIdx,O=v.disabled?"bright-black":k?"bright-green":v.accentFg??"white",Y=v.infoFg??O,P=r-4;if(v.icon!==void 0){const x=v.icon.length;if(g(e,b,2,k?">":" ",O,"black"),g(e,b,3,v.icon,v.iconFg??O,"black"),v.info!==void 0){const E=v.info.length,A=Math.max(0,P-1-x-2-E-1),T=v.label.length>A?v.label.slice(0,A):v.label,K=Math.max(1,P-1-x-T.length-2-E);g(e,b,3+x,T+" ",O,"black"),g(e,b,3+x+T.length+1,".".repeat(K),"bright-black","black"),g(e,b,3+x+T.length+1+K+1,v.info,Y,"black")}else g(e,b,3+x,v.label.slice(0,P-1-x),O,"black");for(let E=0;E<(((S=v.details)==null?void 0:S.length)??0);E++)b+1+E<=o&&g(e,b+1+E,2,("  "+v.details[E]).slice(0,P),v.detailsFg??"bright-black","black")}else if(v.info!==void 0){const x=k?"> ":"  ",R=Math.max(1,P-2-v.label.length-2-v.info.length);g(e,b,2,x+v.label+" ",O,"black"),g(e,b,2+x.length+v.label.length+1,".".repeat(R),"bright-black","black"),g(e,b,2+x.length+v.label.length+1+R+1,v.info,Y,"black")}else if(v.details!==void 0&&v.details.length>0){g(e,b,2,((k?"> ":"  ")+v.label).slice(0,P),O,"black");for(let R=0;R<v.details.length;R++)b+1+R<=o&&g(e,b+1+R,2,("  "+v.details[R]).slice(0,P),v.detailsFg??"bright-black","black")}else g(e,b,2,((k?"> ":"  ")+v.label).slice(0,P),O,"black");const G=((_=v.details)==null?void 0:_.length)??0;for(let x=0;x<(((M=v.detailsColored)==null?void 0:M.length)??0);x++){const R=b+1+G+x;if(R<=o){const E=v.detailsColored[x];let A=4;for(const T of E.left)g(e,R,A,T.text,T.fg,"black"),A+=T.text.length;if(E.right!==void 0){const T=P-4-E.right.text.length;g(e,R,T,E.right.text,E.right.fg,"black")}}}b+=1+G+(((w=v.detailsColored)==null?void 0:w.length)??0)}d&&jn(e,o,r,this.pageIndex,this.lastPageCount),this.modal!==null&&this.modal.render(e)}}class Vt extends pe{constructor(e,n,i,s,r){const o=s.length===0?[{label:"NO OPTIONS AVAILABLE",disabled:!0,action:()=>{}}]:s.map(a=>({label:a.label,action:a.action}));super("MENU",o,[{id:"game",label:"GAME"}],e,n,i,[],null,r),this.onClose=r}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onClose())}handleNavTap(e){e==="game"&&!this.activated&&(this.activated=!0,this.onClose())}}function me(t){return t.size==="medium"||t.size==="large"}function Ee(t,e){return t>=e.reputation.levelReveredMin?3:t>=e.reputation.levelLikedMin?2:t>=e.reputation.levelFriendlyMin?1:t<e.reputation.levelUnfriendlyMin?-2:t<e.reputation.levelNeutralMin?-1:0}function Xn(t){switch(t){case-2:return"HATED";case-1:return"UNFRIENDLY";case 0:return"NEUTRAL";case 1:return"FRIENDLY";case 2:return"LIKED";case 3:return"REVERED";default:return"NEUTRAL"}}function qt(t,e){switch(t){case-2:return e.reputation.tradeModifierHated;case-1:return e.reputation.tradeModifierUnfriendly;case 1:return e.reputation.tradeModifierFriendly;case 2:return e.reputation.tradeModifierLiked;case 3:return e.reputation.tradeModifierRevered;default:return e.reputation.tradeModifierNeutral}}function Et(t){return`${t<0?"":"+"}${t}`}function Ft(t,e,n){const i=new Map;i.set(t.id,e);const s=Math.floor(e/2);for(const o of t.allies)i.set(o,s);const r=-Math.floor(e/2);for(const o of t.rivals)i.set(o,r);return i}function Ae(t,e){return t.type==="delivery"?t.pickupComplete?e.destinationId===t.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":t.requirements.every(i=>{const s=e.cargoHold.find(r=>r.commodityId===i.commodityId);return s!==void 0&&s.qty>=i.qty})?"ready-to-deliver":"needs-supplies"}function ls(t,e){if(e.type==="delivery"){if(t.cargoCapacity-t.cargoWeightKg<e.itemWeightKg)return{ok:!1,reason:"Insufficient cargo space"};if(t.credits<e.deposit)return{ok:!1,reason:"Insufficient credits for deposit"}}return{ok:!0}}class Lt{constructor(e){const n=qe(e.shipId);if(!n)throw new Error(`Unknown ship: ${e.shipId}`);this.shipId=e.shipId,this.driveId=e.driveId,this.fuelCapacityL=n.fuelCapacityL,this.cargoCapacity=n.cargoCapacityKg,this._fuelL=n.fuelCapacityL,this._credits=e.credits,this._systemId=e.systemId,this._destinationId=e.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[],this._hullIntegrity=1,this._factionReputation=new Map;for(const i of L().factions)me(i)&&this._factionReputation.set(i.id,0);this._destinationMissions=new Map}static createMock(){const e=qn(),n=qe(e.startingShip);if(!n)throw new Error(`Unknown starting ship: ${e.startingShip}`);return new Lt({shipId:e.startingShip,driveId:n.defaultJumpDrive,credits:e.player.startingCredits,systemId:e.startingLocation.system,destinationId:e.startingLocation.destination})}get fuelL(){return this._fuelL}addFuel(e){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+e)}consumeFuel(e){this._fuelL=Math.max(0,this._fuelL-e)}getInSystemHopCost(){const e=qe(this.shipId),n=L().balance;return Math.ceil(n.fuel.inSystemBaseConsumptionL*e.fuelEfficiency)}get credits(){return this._credits}addCredits(e){this._credits+=e}spendCredits(e){this._credits-=e}get cargoHold(){return this._cargoHold}addCargo(e,n){const i=this._cargoHold.find(s=>s.commodityId===e);i?i.qty+=n:this._cargoHold.push({commodityId:e,qty:n})}removeCargo(e,n){const i=this._cargoHold.findIndex(s=>s.commodityId===e);i<0||(n!==void 0&&n<this._cargoHold[i].qty?this._cargoHold[i].qty-=n:this._cargoHold.splice(i,1))}get missionItemsWeightKg(){return this._missionItems.reduce((e,n)=>e+n.weightKg,0)}get cargoWeightKg(){return ss(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(e){this._destinationId=e}undock(){this._destinationId=null}jumpTo(e){this._systemId=e,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(e,n){const i={...e,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(i),e.type==="delivery"&&(this._credits-=e.deposit,n&&(this._missionItems.push({missionId:e.id,itemName:e.itemName,weightKg:e.itemWeightKg}),i.pickupComplete=!0))}collectMissionItem(e){const n=this._activeMissions.find(i=>i.id===e);!n||n.type!=="delivery"||(n.pickupComplete=!0,this._missionItems.push({missionId:n.id,itemName:n.itemName,weightKg:n.itemWeightKg}))}completeMission(e){this._activeMissions=this._activeMissions.filter(n=>n.id!==e),this._missionItems=this._missionItems.filter(n=>n.missionId!==e)}cancelMission(e){this._activeMissions=this._activeMissions.filter(n=>n.id!==e),this._missionItems=this._missionItems.filter(n=>n.missionId!==e)}getMissionsForPickup(e){return this._activeMissions.filter(n=>n.type==="delivery"&&n.pickupDestinationId===e&&!n.pickupComplete)}getMissionsForDelivery(e){return this._activeMissions.filter(n=>n.deliveryDestinationId===e&&Ae(n,this)==="ready-to-deliver")}get hullIntegrity(){return this._hullIntegrity}applyHullDamage(e){this._hullIntegrity=Math.max(0,this._hullIntegrity-e)}getFactionReputation(e){return this._factionReputation.get(e)??0}modifyFactionReputation(e,n,i){const s=this.getFactionReputation(e),r=Math.min(i.reputation.pointsMax,Math.max(i.reputation.pointsMin,s+n));this._factionReputation.set(e,r)}getDestinationMissions(e){const n=this._destinationMissions.get(e);return n?Date.now()-n.generatedAt>L().balance.missions.missionTtlMs?[]:n.specs:[]}refreshDestinationMissions(e,n){this._destinationMissions.set(e,{specs:n,generatedAt:Date.now()})}}const zt=40;class xt{constructor(e){this.focus="confirm",this.confirmRect=null,this.cancelRect=null,this.opts=e}handleAction(e){var n,i;if(e==="BACK"){this.opts.onConfirm();return}if(e==="LEFT"||e==="RIGHT"||e==="TAB"){this.opts.cancelLabel!==void 0&&(this.focus=this.focus==="confirm"?"cancel":"confirm");return}e==="SELECT"&&(this.focus==="cancel"?(i=(n=this.opts).onCancel)==null||i.call(n):this.opts.onConfirm())}handleCharInput(e){}handleTap(e,n){var i,s;this.confirmRect&&n===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.opts.onConfirm():this.cancelRect&&n===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&((s=(i=this.opts).onCancel)==null||s.call(i))}render(e){const n=e.length,i=n>0?e[0].length:0,{title:s,body:r,confirmLabel:o,cancelLabel:a}=this.opts,l=zt-2,c=it(r,l),h=c.length,d=4+h+1+1+1,p=zt,u=Math.floor((i-p)/2),m=Math.floor((n-d)/2);for(let w=0;w<d;w++)for(let C=0;C<p;C++){const v=m+w,k=u+C;v>=0&&v<n&&k>=0&&k<i&&(e[v][k]={char:" ",fg:"white",bg:"black"})}const f=(w,C,v)=>{w>=0&&w<n&&C>=0&&C<i&&(e[w][C]={char:v,fg:"white",bg:"black"})};f(m,u,"+"),f(m,u+p-1,"+");for(let w=1;w<p-1;w++)f(m,u+w,"-");f(m+d-1,u,"+"),f(m+d-1,u+p-1,"+");for(let w=1;w<p-1;w++)f(m+d-1,u+w,"-");for(let w=1;w<d-1;w++)f(m+w,u,"|"),f(m+w,u+p-1,"|");const y=s.slice(0,l),b=m+1,S=u+1+Math.floor((l-y.length)/2);g(e,b,S,y,"bright-white","black"),g(e,m+2,S,"'".repeat(y.length),"bright-black","black");for(let w=0;w<c.length;w++)g(e,m+4+w,u+1,c[w],"white","black");const _=m+4+h+1,M=`[ ${o} ]`;if(a!==void 0){const w=`[ ${a} ]`,C=2,v=M.length+C+w.length,k=Math.floor((l-v)/2),O=u+1+k,Y=O+M.length+C;this.confirmRect={col:O,row:_,width:M.length},this.cancelRect={col:Y,row:_,width:w.length};const P=this.focus==="confirm",G=this.focus==="cancel";g(e,_,O,M,P?"black":"white",P?"green":"black"),g(e,_,Y,w,G?"black":"white",G?"green":"black")}else{const w=Math.floor((l-M.length)/2),C=u+1+w;this.confirmRect={col:C,row:_,width:M.length},this.cancelRect=null,g(e,_,C,M,"black","green")}}}const cs={delivery:"[D] ",supply:"[S] "},hs={"pending-pickup":"PENDING PICKUP","needs-supplies":"NEEDS SUPPLIES","in-transit":"IN TRANSIT","ready-to-deliver":"READY TO DELIVER"},ds={"pending-pickup":"yellow","needs-supplies":"yellow","in-transit":"bright-black","ready-to-deliver":"bright-green"};class us extends pe{constructor(e,n,i,s,r){super("MISSIONS",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,n,i,[],null,r),this.onBack=s,this.onGame=r}get items(){const e=this.player.activeMissions;return e.length===0?[{label:"NO ACTIVE MISSIONS",disabled:!0,action:()=>{}}]:this.sortMissions(e).map(i=>this.buildMenuItem(i))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const n=e[this.cursorIdx];n.disabled||n.action()}getStatusPriority(e){return e==="ready-to-deliver"?0:e==="needs-supplies"||e==="pending-pickup"?1:e==="in-transit"?2:3}sortMissions(e){return[...e].sort((n,i)=>{var d,p;const s=((d=N(n.deliveryDestinationId))==null?void 0:d.name)??n.deliveryDestinationId,r=((p=N(i.deliveryDestinationId))==null?void 0:p.name)??i.deliveryDestinationId,o=s.localeCompare(r);if(o!==0)return o;const a=Ae(n,this.player),l=Ae(i,this.player),c=this.getStatusPriority(a)-this.getStatusPriority(l);if(c!==0)return c;const h={delivery:0,supply:1};return h[n.type]-h[i.type]})}buildMenuItem(e){const n=Ae(e,this.player),i=N(e.deliveryDestinationId),s=(i==null?void 0:i.name)??e.deliveryDestinationId,r=hs[n]??n,o=ds[n]??"white",a=[`Status: ${r}`,`Dest: ${s}`];e.type!=="supply"&&a.push("");const l=e.type==="supply"?this.buildSupplyDetails(e):[];return{label:e.title,icon:cs[e.type],iconFg:"bright-yellow",info:`${e.reward} CR`,infoFg:"bright-green",details:a,detailsFg:o,detailsColored:l,action:()=>this.openMissionModal(e)}}buildSupplyDetails(e){if(e.type!=="supply")return[];const n=e.requirements.map(i=>{const s=L().commodities.find(c=>c.id===i.commodityId),r=(s==null?void 0:s.name)??i.commodityId,o=this.player.cargoHold.find(c=>c.commodityId===i.commodityId),a=(o==null?void 0:o.qty)??0,l=a>=i.qty;return{left:[{text:`${i.qty}x ${r} `,fg:"white"},{text:`(have: ${a})`,fg:l?"bright-green":"bright-black"}]}});return n.push({left:[]}),n}openMissionModal(e){let n=e.description;if(e.giverFactionId){const i=L(),s=i.factions.find(r=>r.id===e.giverFactionId);if(s){const r=D(),o=e.reward;let a;o>=r.reputation.missionTierLargeReward?a=r.reputation.missionDeltaLarge:o>=r.reputation.missionTierMediumReward?a=r.reputation.missionDeltaMedium:a=r.reputation.missionDeltaSmall;const l=Ft(s,a,i.factions),c=[];for(const[h,d]of l){const p=i.factions.find(u=>u.id===h);p&&c.push({id:h,name:p.name,delta:d})}c.sort((h,d)=>h.delta!==d.delta?d.delta-h.delta:h.name.localeCompare(d.name)),n+=`

REPUTATION IMPACT:
`;for(const h of c){const d=Et(h.delta);n+=`  ${h.name.padEnd(20)} ${d}
`}}}this.openModal(new xt({title:e.title,body:n,confirmLabel:"OKAY",cancelLabel:"CANCEL MISSION",onConfirm:()=>this.closeModal(),onCancel:()=>{this.player.cancelMission(e.id),this.closeModal();const i=this.player.activeMissions.length;i===0?this.cursorIdx=-1:this.cursorIdx>=i&&(this.cursorIdx=i-1)}}))}handleNavAction(e){e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):(e==="BACK"||e==="NAV_2")&&!this.activated&&(this.activated=!0,this.onBack())}handleNavTap(e){e==="game"&&!this.activated?(this.activated=!0,this.onGame()):e==="menu"&&!this.activated&&(this.activated=!0,this.onBack())}}const Ct=20,ps="█",ms="░";function fs(t,e,n){return t<=e?0:t>=n?Ct:Math.round((t-e)/(n-e)*Ct)}const gs={[-2]:"red",[-1]:"bright-red",0:"white",1:"bright-green",2:"bright-green",3:"bright-cyan"};class ys extends pe{constructor(e,n,i,s,r){super("REPUTATION",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,n,i,[],null,r),this.onBack=s,this.onGame=r}get items(){const e=D(),i=L().factions.filter(s=>me(s));return i.sort((s,r)=>{if(s.size!==r.size){if(s.size==="large")return-1;if(r.size==="large")return 1}return s.name.localeCompare(r.name)}),i.map(s=>{const r=this.player.getFactionReputation(s.id),o=Ee(r,e),a=Xn(o),l=gs[o]??"white",c=fs(r,e.reputation.pointsMin,e.reputation.levelReveredMin),h=Ct-c;return{label:s.name,info:a,infoFg:l,detailsColored:[{left:[{text:ps.repeat(c),fg:l},{text:ms.repeat(h),fg:"bright-black"}],right:{text:String(r),fg:"white"}},{left:[]}],action:()=>{}}})}activateCurrent(){}handleNavAction(e){e==="BACK"&&!this.activated?(this.activated=!0,this.onBack()):e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):super.handleNavAction(e)}handleNavTap(e){e==="menu"&&!this.activated?(this.activated=!0,this.onBack()):e==="game"&&!this.activated&&(this.activated=!0,this.onGame())}}class _s extends Q{constructor(e,n,i,s){super(e,n,i,{navOptions:[]}),this.pageIndex=0,this.onContinue=s;const o=ts("game-start")[0].text.split(`

`),a=o[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=o.slice(1)):(this.yearHeader="",l=o);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),p=it(d,36);h>0&&c.push(""),c.push(...p)}this.bodyLines=c}handleAction(e){e==="SELECT"?(this.activated=!0,this.onContinue()):e==="LEFT"?this.pageIndex>0&&this.pageIndex--:e==="RIGHT"&&this.pageIndex++}handleTap(e,n){this.activated=!0,this.onContinue()}renderContent(e,n,i){const s=e.length>0?e[0].length:0;if(this.yearHeader){const m=Math.max(0,Math.floor((s-this.yearHeader.length)/2));g(e,n,m,this.yearHeader,"bright-yellow","black")}const r=n+2,o=i-1,a=o-r,l=Math.max(1,a),c=Math.max(1,Math.ceil(this.bodyLines.length/l));this.pageIndex>=c&&(this.pageIndex=c-1);const h=c>1,d=this.pageIndex*l,p=Math.min(d+l,this.bodyLines.length);let u=r;for(let m=d;m<p;m++){const f=this.bodyLines[m];f!==""&&g(e,u,2,f,"white","black"),u++}h&&jn(e,o,s,this.pageIndex,c)}}const bs=30;class Tt{constructor(e){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=e,this.value=Math.max(e.field.min,Math.min(e.field.max,e.field.initialValue))}handleAction(e){const{field:n}=this.formDef;if(e==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(e==="UP"){this.value=Math.min(n.max,this.value+1);return}if(e==="DOWN"){this.value=Math.max(n.min,this.value-1);return}if(e==="RIGHT"){this.value=Math.min(n.max,this.value+10);return}if(e==="LEFT"){this.value=Math.max(n.min,this.value-10);return}}if(e==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}e==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(e){if(this.focus!=="field")return;const{field:n}=this.formDef;if(e==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(e>="0"&&e<="9"){const i=parseInt(e,10);this.replaceNextDigit?(this.value=Math.max(n.min,Math.min(n.max,i)),this.replaceNextDigit=!1):this.value=Math.min(n.max,this.value*10+i)}}handleTap(e,n){this.confirmRect&&n===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&n===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(e){const n=e.length,i=n>0?e[0].length:0,{title:s,field:r,derivedRows:o,confirmLabel:a}=this.formDef,l=o.length,c=8+l,h=bs,d=Math.floor((i-h)/2),p=Math.floor((n-c)/2);for(let T=0;T<c;T++)for(let K=0;K<h;K++){const W=p+T,J=d+K;W>=0&&W<n&&J>=0&&J<i&&(e[W][J]={char:" ",fg:"white",bg:"black"})}const u=(T,K,W)=>{T>=0&&T<n&&K>=0&&K<i&&(e[T][K]={char:W,fg:"white",bg:"black"})};u(p,d,"+"),u(p,d+h-1,"+");for(let T=1;T<h-1;T++)u(p,d+T,"-");u(p+c-1,d,"+"),u(p+c-1,d+h-1,"+");for(let T=1;T<h-1;T++)u(p+c-1,d+T,"-");for(let T=1;T<c-1;T++)u(p+T,d,"|"),u(p+T,d+h-1,"|");const m=h-2,f=p+1,y=d+1+Math.floor((m-s.length)/2);g(e,f,y,s,"bright-white","black"),g(e,p+2,y,"'".repeat(s.length),"bright-black","black");const b=[r.label,...o.map(T=>T.label)],S=Math.max(...b.map(T=>T.length)),_=d+1+S+3,M=p+4,w=this.focus==="field";g(e,M,d+1,r.label.padEnd(S)+" : ","white","black");const C=this.value.toString().padStart(5);g(e,M,_,C,w?"black":"white",w?"green":"black");for(let T=0;T<l;T++){const K=o[T],W=p+5+T,J=K.compute(this.value);g(e,W,d+1,K.label.padEnd(S)+" : ","white","black"),g(e,W,_,J,"white","black")}const v=p+4+l+2,k=`[ ${a} ]`,O="[ CANCEL ]",Y=3,P=k.length+Y+O.length,G=Math.floor((m-P)/2),x=d+1+G,R=x+k.length+Y;this.confirmRect={col:x,row:v,width:k.length},this.cancelRect={col:R,row:v,width:O.length};const E=this.focus==="confirm",A=this.focus==="cancel";g(e,v,x,k,E?"black":"white",E?"green":"black"),g(e,v,R,O,A?"black":"white",A?"green":"black")}}class vs extends pe{constructor(e,n,i,s,r,o,a,l,c,h){const d=N(s),p=i.getMissionsForPickup(s),u=i.getMissionsForDelivery(s),m=p.map(A=>({label:`COLLECT: ${A.type==="delivery"?A.itemName:""}`,accentFg:"bright-yellow",action:()=>{}})),f=u.map(A=>({label:`DELIVER: ${A.title} → ${A.reward} CR`,accentFg:"bright-yellow",action:()=>{}})),y=[...m,...f],b=[];d.amenities.trader&&b.push({label:"TRADER",action:o}),i.getDestinationMissions(s).length>0&&b.push({label:"MISSION BOARD",action:a});const S=D();let _=null;if(d.owningFactionId){const A=L().factions.find(T=>T.id===d.owningFactionId);A&&me(A)&&(_=d.owningFactionId)}const M=S.fuel.pricePerLitre,w=_?qt(Ee(i.getFactionReputation(_),S),S):1,C=Math.round(M*w),v=i.fuelCapacityL-i.fuelL,k=Math.floor(i.credits/C),O=Math.min(v,k);let Y=null;if(d.amenities.fuel&&O>0){const A=O*C;Y=y.length+(y.length>0?1:0)+b.length,b.push({label:`BUY FUEL  +${O}L  ${A}CR`,action:()=>{}})}const P=[];y.length>0&&(P.push(...y),P.push({label:"────────────────────",disabled:!0,action:()=>{}})),P.push(...b);const G=it(d.description,36).slice(0,3),x=`DANGER: ${d.dangerLevel.toUpperCase()}`,R=[...G,x];if(d.owningFactionId){const A=L().factions.find(T=>T.id===d.owningFactionId);A&&R.push(`OPERATED BY: ${A.name}`)}const E=d.locationType==="surface"||d.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",P,[{id:"undock",label:E}],e,n,i,R,null,h),this.onShip=c,this.onRefuel=r,this.onHub=l,this.fuelItemIdx=Y,this.eligibleFactionId=_;for(let A=0;A<p.length;A++){const T=p[A];m[A].action=()=>{this.player.collectMissionItem(T.id),this.onHub()}}for(let A=0;A<u.length;A++){const T=u[A];f[A].action=()=>{if(Ae(T,this.player)!=="ready-to-deliver"){this.openModal(new xt({title:"CANNOT DELIVER",body:T.type==="delivery"?"Mission item is missing from your cargo.":"Required supplies are missing from your cargo.",confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.activated=!1}}));return}if(T.type==="supply")for(const Ce of T.requirements)this.player.removeCargo(Ce.commodityId,Ce.qty);const W=D(),J=L();let ht="";if(T.giverFactionId){const Ce=J.factions.find(Be=>Be.id===T.giverFactionId);if(Ce){const Be=T.reward;let Ue;Be>=W.reputation.missionTierLargeReward?Ue=W.reputation.missionDeltaLarge:Be>=W.reputation.missionTierMediumReward?Ue=W.reputation.missionDeltaMedium:Ue=W.reputation.missionDeltaSmall;const Gt=Ft(Ce,Ue,J.factions);for(const[q,Z]of Gt)this.player.modifyFactionReputation(q,Z,W);const dt=[];for(const[q,Z]of Gt){const $t=J.factions.find($i=>$i.id===q);$t&&dt.push({id:q,name:$t.name,delta:Z})}dt.sort((q,Z)=>q.delta!==Z.delta?Z.delta-q.delta:q.name.localeCompare(Z.name)),ht=`

REPUTATION:
`;for(const q of dt){const Z=Et(q.delta);ht+=`  ${q.name.padEnd(20)} ${Z}
`}}}this.player.completeMission(T.id),this.player.addCredits(T.reward),this.openModal(new xt({title:"MISSION COMPLETE",body:`Mission complete!

You received ${T.reward} CR.${ht}`,confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.onHub()}}))}}}effectiveFuelPrice(){const e=D(),n=e.fuel.pricePerLitre;if(!this.eligibleFactionId)return n;const i=Ee(this.player.getFactionReputation(this.eligibleFactionId),e);return Math.round(n*qt(i,e))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx===-1)return;const n=e[this.cursorIdx];if(!n.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const i=this.effectiveFuelPrice(),s=this.player.fuelCapacityL-this.player.fuelL,r=Math.floor(this.player.credits/i),o=Math.min(s,r);this.openModal(new Tt({title:"BUY FUEL",field:{label:"Litres",initialValue:o,min:0,max:o},derivedRows:[{label:"Cost",compute:a=>`${a*i} CR`}],confirmLabel:"BUY",onConfirm:a=>{this.closeModal(),a>0&&this.onRefuel(a*i,a)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,n.action()}}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class ws extends pe{constructor(e,n,i,s,r,o,a,l,c,h){var f;const d=N(s),p=((f=d.npcs.trader)==null?void 0:f.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(p,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,n,i,[],u,h),this.repGainedThisVisit=0,this.traderStock=r,this.onBuy=o,this.onSell=a,this.onHub=l,this.onUndock=c;const m=d.owningFactionId;if(m){const y=zn(m);this.eligibleFactionId=y&&me(y)?m:null}else this.eligibleFactionId=null;this.syncItems(),this.clampCursor()}buyPrice(e,n){return Math.round(e*n)}sellPrice(e,n){return Math.round(e*n)}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(e=>{const n=de(e.commodityId);if(!n)return[];const i=e.effectiveFactor??1,s=this.buyPrice(n.basePrice,i),r=this.player.credits>=s;return[{label:`${n.name} (x${e.qty})`,info:`${s} CR`,disabled:!r,action:()=>{const o=Math.floor(this.player.credits/s),a=Math.min(e.qty,o);this.openModal(new Tt({title:n.name.toUpperCase(),field:{label:"Quantity",initialValue:a,min:0,max:a},derivedRows:[{label:"Total",compute:l=>`${l*s} CR`}],confirmLabel:"BUY",onConfirm:l=>{l>0&&(this.onBuy(e.commodityId,l,s),this.accrueReputation(l*s)),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const e=this.player.cargoHold;return e.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...e].flatMap(n=>{const i=de(n.commodityId);if(!i)return[];const s=N(this.player.destinationId??""),r=te(s.system),o=Je(n.commodityId,r),a=this.sellPrice(i.basePrice,o);return[{label:`${i.name} (x${n.qty})`,info:`${a} CR`,action:()=>{this.openModal(new Tt({title:i.name.toUpperCase(),field:{label:"Quantity",initialValue:n.qty,min:0,max:n.qty},derivedRows:[{label:"Total",compute:l=>`${l*a} CR`}],confirmLabel:"SELL",onConfirm:l=>{l>0&&this.onSell(n.commodityId,l,a),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}accrueReputation(e){if(!this.eligibleFactionId)return;const n=D(),i=n.reputation.maxRepPerVisit-this.repGainedThisVisit;if(i<=0)return;const s=Math.min(i,e*n.reputation.repPerCredit);s<=0||(this.repGainedThisVisit+=s,this.player.modifyFactionReputation(this.eligibleFactionId,s,n))}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var n;const e=this.items;(this.cursorIdx<0||this.cursorIdx>=e.length||(n=e[this.cursorIdx])!=null&&n.disabled)&&(this.cursorIdx=e.findIndex(i=>!i.disabled))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const n=e[this.cursorIdx];n.disabled||n.action()}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(e){if(this.syncItems(),super.render(e),this.eligibleFactionId){const s=D(),r=this.player.getFactionReputation(this.eligibleFactionId),o=Ee(r,s),l=`STANDING: ${Xn(o)}`;g(e,X+2,2,l,"bright-black","black")}const n=e.length,i=Rt(n,!0)-2;g(e,i,2,`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,"bright-black","black")}}const ks={delivery:"[D] ",supply:"[S] "};class ye extends pe{constructor(e,n,i,s,r,o,a,l,c){N(s);let h;r.length===0?h=[{label:"NO MISSIONS AVAILABLE",disabled:!0,action:()=>{}}]:h=ye.sortMissions(r).map(p=>ye.buildMenuItem(p,i,o)),super("MISSION BOARD",h,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,n,i,[],null,c),this.onHub=a,this.onUndock=l}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}static sortMissions(e){return[...e].sort((n,i)=>{var l,c;const s=((l=N(n.deliveryDestinationId))==null?void 0:l.name)??n.deliveryDestinationId,r=((c=N(i.deliveryDestinationId))==null?void 0:c.name)??i.deliveryDestinationId,o=s.localeCompare(r);if(o!==0)return o;const a={delivery:0,supply:1};return a[n.type]-a[i.type]})}static destColor(e,n){if(e===n.destinationId)return"bright-green";const i=N(e);return i&&i.system===n.systemId?"bright-yellow":"white"}static buildMenuItem(e,n,i){const s=N(e.deliveryDestinationId),r=(s==null?void 0:s.name)??e.deliveryDestinationId,o=[];if(o.push(`Dest: ${r}`),e.giverFactionId){const l=L().factions.find(c=>c.id===e.giverFactionId);l&&o.push(`For: ${l.name}`)}e.type!=="supply"&&o.push("");const a=e.type==="supply"?ye.buildSupplyDetails(e,n):[];return{label:e.title,icon:ks[e.type],iconFg:"bright-yellow",info:`${e.reward} CR`,infoFg:"bright-green",details:o,detailsFg:ye.destColor(e.deliveryDestinationId,n),detailsColored:a,action:()=>i(e)}}static buildSupplyDetails(e,n){if(e.type!=="supply")return[];const i=e.requirements.map(s=>{const r=L().commodities.find(h=>h.id===s.commodityId),o=(r==null?void 0:r.name)??s.commodityId,a=n.cargoHold.find(h=>h.commodityId===s.commodityId),l=(a==null?void 0:a.qty)??0,c=l>=s.qty;return{left:[{text:`${s.qty}x ${o} `,fg:"white"},{text:`(have: ${l})`,fg:c?"bright-green":"bright-black"}]}});return i.push({left:[]}),i}}class xs extends Q{constructor(e,n,i,s,r,o,a){super(r,o,a,{navOptions:s,title:e}),this.cursorIdx=-1,this.lastChoicesStartRow=0,this._choices=n,this._onBack=i,this.resetCursor()}preHandleAction(e){return e==="BACK"?(this.activated=!0,this._onBack(),!0):!1}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="SELECT"&&this.activateCurrent()}handleTap(e,n){const i=this.rowToChoiceIndex(n);i!==null&&!this._choices[i].disabled&&(this.cursorIdx=i,this.activateCurrent())}moveCursor(e){const n=this._choices,i=n.length;if(i===0)return;const s=this.cursorIdx===-1?e>0?i-1:0:this.cursorIdx;for(let r=0;r<i;r++){const o=((s+e*(r+1))%i+i)%i;if(!n[o].disabled){this.cursorIdx=o;return}}}activateCurrent(){if(this._choices.length===0||this.cursorIdx===-1)return;const e=this._choices[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}resetCursor(){const e=this._choices;for(let n=0;n<e.length;n++)if(!e[n].disabled){this.cursorIdx=n;return}this.cursorIdx=-1}computeChoicesHeight(){var n;let e=0;for(const i of this._choices)e+=1+(((n=i.details)==null?void 0:n.length)??0);return e}rowToChoiceIndex(e){var i;if(e<this.lastChoicesStartRow)return null;let n=this.lastChoicesStartRow;for(let s=0;s<this._choices.length;s++){const r=1+(((i=this._choices[s].details)==null?void 0:i.length)??0);if(e>=n&&e<n+r)return s;n+=r}return null}render(e){const n=e.length,i=n>0?e[0].length:0;for(let m=0;m<n;m++)for(let f=0;f<i;f++)e[m][f]={char:" ",fg:"black",bg:"black"};const s=this.buildChromeConfig();this.chrome.render(e,s);const r=!0,o=X,a=Rt(n,r),l=this.opts.title;l!==void 0&&(g(e,o,2,l,"bright-white","black"),g(e,o+1,2,"'".repeat(l.length),"bright-black","black"));const c=o+2,h=this.computeChoicesHeight(),d=a-h-1,p=d-1;this.renderContent(e,c,p),d>=0&&d<n&&ge(e,d,i);let u=d+1;this.lastChoicesStartRow=u;for(let m=0;m<this._choices.length;m++){const f=this._choices[m],y=m===this.cursorIdx,b=y?">":" ",S=f.disabled?"bright-black":y?"bright-green":"white";if(u<n&&(g(e,u,2,b,S,"black"),g(e,u,3,f.label,S,"black")),u++,f.details)for(const _ of f.details)u<n&&g(e,u,4,_.slice(0,i-4),"bright-black","black"),u++}}}const Cs={delivery:"[D]",supply:"[S]"};class Ts extends xs{constructor(e,n,i,s,r,o,a,l){const c=ls(i,s),h=s.type==="delivery"&&s.pickupDestinationId===s.issuingDestinationId,d=c.ok?{label:"ACCEPT MISSION",action:()=>r(h)}:{label:"ACCEPT MISSION",disabled:!0,details:c.reason?[c.reason]:[],action:()=>{}},p={label:"BACK",action:()=>o()};super("MISSION BOARD",[d,p],o,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,n,i),this.spec=s,this.onHub=a,this.onUndock=l}destColor(e){if(e===this.player.destinationId)return"bright-green";const n=N(e);return n&&n.system===this.player.systemId?"bright-yellow":"white"}writeDestRow(e,n,i,s,r,o){g(e,n,2,i,"white","black"),g(e,n,2+i.length,s.slice(0,o-i.length),this.destColor(r),"black")}handleAction(e){e==="NAV_1"?(this.activated=!0,this.onUndock()):e==="NAV_2"?(this.activated=!0,this.onHub()):super.handleAction(e)}handleNavTap(e){this.activated||(e==="undock"?(this.activated=!0,this.onUndock()):e==="hub"&&(this.activated=!0,this.onHub()))}renderContent(e,n,i){this.renderDetail(e,n,i)}renderDetail(e,n,i){const r=e.length>0?e[0].length:40,o=r-4;let a=n;const l=(u,m,f)=>{u<=i&&g(e,u,2,m.slice(0,o),f,"black")};l(a,`${Cs[this.spec.type]} ${this.spec.title}`,"bright-yellow"),a++;const c=L(),h=this.spec.giverFactionId?c.factions.find(u=>u.id===this.spec.giverFactionId):null,d=h?` [${h.name}]`:"";if(l(a,`    ${this.spec.giverName}${d}`,"bright-black"),a++,a++,this.spec.type==="delivery"){const u=N(this.spec.pickupDestinationId),m=N(this.spec.deliveryDestinationId);if(a<=i&&this.writeDestRow(e,a,"Pickup:  ",(u==null?void 0:u.name)??this.spec.pickupDestinationId,this.spec.pickupDestinationId,o),a++,a<=i&&this.writeDestRow(e,a,"Deliver: ",(m==null?void 0:m.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++,a<=i){const f=this.player.cargoCapacity-this.player.cargoWeightKg,y=this.spec.itemWeightKg,b=f>=y,S=`Weight:  ${y} kg  (Free: ${f} kg)`;g(e,a,2,S,"white","black");const _=b?"bright-green":"red",M=2+S.length+1;M<r&&g(e,a,M,b?"✓":"✗",_,"black")}a++}else{const u=N(this.spec.deliveryDestinationId);a<=i&&this.writeDestRow(e,a,"Deliver to: ",(u==null?void 0:u.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++;for(const m of this.spec.requirements){if(a>i)break;const f=de(m.commodityId);l(a,`  ${m.qty}x ${(f==null?void 0:f.name)??m.commodityId}`,"white"),a++}}a++;const p=it(this.spec.description,o);for(const u of p){if(a>i)break;l(a,u,"white"),a++}if(a++,!(a>i)&&(l(a,`REWARD: ${this.spec.reward} CR`,"bright-green"),a++,this.spec.type==="delivery"&&this.spec.deposit>0&&(a<=i&&l(a,`DEPOSIT: ${this.spec.deposit} CR`,"bright-yellow"),a++),this.spec.giverFactionId)){const u=c.factions.find(m=>m.id===this.spec.giverFactionId);if(u){const m=D(),f=this.spec.reward;let y;f>=m.reputation.missionTierLargeReward?y=m.reputation.missionDeltaLarge:f>=m.reputation.missionTierMediumReward?y=m.reputation.missionDeltaMedium:y=m.reputation.missionDeltaSmall;const b=Ft(u,y,c.factions),S=[];for(const[_,M]of b){const w=c.factions.find(C=>C.id===_);w&&S.push({id:_,name:w.name,delta:M})}if(S.sort((_,M)=>_.delta!==M.delta?M.delta-_.delta:_.name.localeCompare(M.name)),S.length>0){if(a++,a>i)return;const _=i-1;a<=_&&(l(a,"REPUTATION IMPACT","bright-cyan"),a++);for(const M of S){if(a>_)break;const w=Et(M.delta),C=M.delta>0?"bright-green":"red",v=o-w.length-2,k=M.name.slice(0,v),O=" ".repeat(Math.max(0,o-k.length-w.length-2));l(a,`  ${k}${O}${w}`,C),a++}}}}}}function Ss(t){if(t.length===0)return 2166136261;let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e=Math.imul(e,16777619)>>>0;return e===0?1:e}const Ms=[30,10,5],Is=[".","*","+"],Xt=[4e3,2e3,800],As=[9e3,5e3,2500],Rs=[null,"bright-black","white"],Es=["bright-black","white","bright-white"],Fs=["white","bright-white","bright-cyan"],$e=3,Qt=25,We=2,Jt=37,Zt=2*Math.PI;function Ls(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}class Ds{constructor(e=42){this.boundsSet=!1,this.rand=Ls(e),this.stars=[];for(let n=0;n<3;n++)for(let i=0;i<Ms[n];i++){const s=We+Math.floor(this.rand()*(Jt-We+1)),r=$e+Math.floor(this.rand()*(Qt-$e+1)),o=this.rand()*Zt,a=Xt[n]+this.rand()*(As[n]-Xt[n]);this.stars.push({col:s,row:r,layer:n,twinklePhase:o,twinklePeriod:a})}}update(e){for(const n of this.stars)n.twinklePhase+=Zt/n.twinklePeriod*e}render(e,n,i,s,r){if(!this.boundsSet){this.boundsSet=!0;const o=Qt-$e,a=Jt-We;{const l=(i-n)/o,c=(r-s)/a;for(const h of this.stars)h.row=Math.round(n+(h.row-$e)*l),h.col=Math.round(s+(h.col-We)*c)}}for(const o of this.stars){const{row:a,col:l,layer:c}=o;if(a<n||a>i||l<s||l>r)continue;const h=Math.sin(o.twinklePhase);let d;h>=.5?d=Fs[c]:h>=-.5?d=Es[c]:d=Rs[c],d!==null&&(e[a][l]={char:Is[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const Os=2,Ns=3,Ps=2*Math.PI/9e3,Hs=2*Math.PI/12e3,Bs=Math.PI/3;function en(t,e,n){return Math.max(e,Math.min(n,t))}class Us{constructor(e,n,i,s,r,o=.5,a=.6){this.time=0,this.glyph=e,this.intRowStart=n,this.intRowEnd=i,this.intColStart=s,this.intColEnd=r,this.glyphHeight=e.rows.length,this.glyphWidth=Math.max(...e.rows.map(l=>l.length)),this.anchorRow=n+Math.floor((i-n)*o)-Math.floor(this.glyphHeight/2),this.anchorCol=s+Math.floor((r-s)*a)-Math.floor(this.glyphWidth/2)}update(e){this.time+=e}getDisplayPosition(){const e=Math.round(Os*Math.sin(this.time*Ps)),n=Math.round(Ns*Math.sin(this.time*Hs+Bs)),i=en(this.anchorRow+e,this.intRowStart,this.intRowEnd-this.glyphHeight+1),s=en(this.anchorCol+n,this.intColStart,this.intColEnd-this.glyphWidth+1);return{row:i,col:s}}render(e){const{row:n,col:i}=this.getDisplayPosition(),s=this.glyph.fg;for(let r=0;r<this.glyph.rows.length;r++){const o=this.glyph.rows[r];let a=-1,l=-1;for(let c=0;c<o.length;c++)o[c]!==" "&&(a===-1&&(a=c),l=c);if(a!==-1)for(let c=a;c<=l;c++){const h=o[c],d=n+r,p=i+c;d>=0&&d<e.length&&p>=0&&p<e[d].length&&(e[d][p]=h===" "?{char:" ",fg:"black",bg:"black"}:{char:h,fg:s,bg:"black"})}}}}const tn=[{rows:[">---<"," |*| ","  |  "],fg:"bright-white"},{rows:["/-\\","|O|","\\-/"],fg:"cyan"},{rows:["  *  ","--+--"," [H] ","  |  ","  *  "],fg:"bright-white"}],nn=[{rows:[" /\\/\\","< ** >"," \\__/"],fg:"yellow"},{rows:["  ___"," /   \\","|  .  |"," \\___/"],fg:"yellow"},{rows:[" _/\\_","/  . \\","\\____/"],fg:"yellow"}],sn=[{rows:["  .--."," / .. \\","| .... |"," \\ .. /","  `--'"],fg:"blue"},{rows:["  .--."," / ~~ \\","| ~~~~ |"," \\ ~~ /","  `--'"],fg:"bright-yellow"},{rows:["  .--."," /====\\","|======|"," \\====/","  `--'"],fg:"bright-cyan"}];function Gs(t,e){return t==="orbital"||t==="deep-space"?tn[e%tn.length]:t==="asteroid"?nn[e%nn.length]:t==="surface"?sn[e%sn.length]:null}const $s=6,pt=6,Ws=23,Ys=23,mt=10,Ks=0,js=4,Vs=18,qs=21,zs=35,Xs=39,rn=12,Qs=11,le=13,Se=27,ft=28,Js=12,gt=40,on=200,yt=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],Zs="#",an=["green","cyan","white","yellow"],ln=["*",".","+","x"];function er(t){return t>=.8?"bright-green":t>=.5?"yellow":"red"}function cn(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function tr(t,e,n){return{col:e,row:n,char:Zs,color:an[Math.floor(t()*an.length)],phase:t()*2e4,period:1e4+t()*1e4,active:t()>.2}}function Me(t,e,n,i){const s=[];for(const r of i)for(let o=e;o<=n;o++)s.push(tr(t,o,r));return s}class nr extends Q{constructor(e,n,i,s,r,o,a){var u;super(e,n,i,{navOptions:[],onMenu:a}),this.cursorIdx=0,this.h=30,this.destObject=null,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.onTravel=s,this.onDock=r,this.onCargo=o;const l=Ss(i.destinationId??"");this.starfield=new Ds(l),this.inSpace=i.destinationId===null;const c=i.destinationId!=null?(u=N(i.destinationId))==null?void 0:u.locationType:void 0;this.destGlyph=Gs(c,l),this.destRowFrac=.15+Math.random()*.7,this.destColFrac=.15+Math.random()*.7;const h=cn(99);this.gaugeBtns=[...Me(h,Ks,js,[3,4]),...Me(h,Vs,qs,[3,4]),...Me(h,zs,Xs,[3,4])],this.leftBtns=Me(h,0,Qs,[0,1,2,3]),this.rightBtns=Me(h,ft,39,[0,1,2,3]);const d=cn(77),p=3+Math.floor(d()*4);this.radarContacts=Array.from({length:p},()=>({x:d()*(Se-le-1),y:d()*4,vx:(d()-.5)*2,vy:(d()-.5)*1.5,char:ln[Math.floor(d()*ln.length)]}))}navCount(){return this.inSpace?1:2}handleAction(e){e==="CARGO"?(this.activated=!0,this.onCargo()):e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.navCount())%this.navCount():e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.navCount():e==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,this.onTravel()):this.inSpace||(this.activated=!0,this.onDock()))}handleTap(e,n){const i=this.h;(n===3||n===4)&&e>=pt&&e<pt+1+mt?(this.activated=!0,this.onCargo()):n===i-3&&e<rn?(this.activated=!0,this.onTravel()):n===i-3&&e>=ft&&!this.inSpace&&(this.activated=!0,this.onDock())}update(e){var s;this.starfield.update(e),(s=this.destObject)==null||s.update(e),this.blinkPhase=(this.blinkPhase+e)%1e3;for(const r of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])r.phase+=e,r.phase>=r.period&&(r.phase-=r.period,r.active=!r.active);const n=Se-le,i=5;for(const r of this.radarContacts)r.x+=r.vx*e/1e3,r.y+=r.vy*e/1e3,r.x<0&&(r.x=-r.x,r.vx=-r.vx),r.x>n-1&&(r.x=2*(n-1)-r.x,r.vx=-r.vx),r.y<0&&(r.y=-r.y,r.vy=-r.vy),r.y>i-1&&(r.y=2*(i-1)-r.y,r.vy=-r.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-e);else for(this.tickerAccum+=e;this.tickerAccum>=on;){this.tickerAccum-=on,this.tickerScroll++;const r=yt[this.msgIdx];if(this.tickerScroll>=r.length+gt-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%yt.length,this.tickerPause=500,this.tickerAccum=0;break}}}renderContent(e,n,i){var d;const s=e.length,r=s>0?e[0].length:0;this.h=s;const o=n+2,a=s-8,l=s-7,c=s-3,h=s-2;this.renderGaugeStrip(e,n),this.starfield.render(e,o,a,0,39),!this.destObject&&this.destGlyph&&(this.destObject=new Us(this.destGlyph,o+1,a-1,0,39,this.destRowFrac,this.destColFrac)),(d=this.destObject)==null||d.render(e);for(let p=0;p<r;p++)e[o][p]={char:"-",fg:"white",bg:"black"},e[a][p]={char:"-",fg:"white",bg:"black"};this.renderHUD(e,o+1),this.renderCrosshair(e,o+1,a-1),this.renderBottomPanels(e,l,c),this.renderTicker(e,h)}renderGaugeStrip(e,n){for(const a of this.gaugeBtns){const l=n+a.row-3,c=a.active?a.color:"bright-black";l>=0&&l<e.length&&(e[l][a.col]={char:a.char,fg:c,bg:"black"})}const i=this.player.fuelL/this.player.fuelCapacityL,s=this.player.cargoWeightKg/this.player.cargoCapacity,r=this.blinkPhase<500,o=er(this.player.hullIntegrity);this.renderGauge(e,n,$s,"F",i,"yellow",r),this.renderGauge(e,n+1,pt,"C",s,"blue",r),this.renderGauge(e,n,Ws,"S",1,"cyan",r),this.renderGauge(e,n+1,Ys,"H",this.player.hullIntegrity,o,r)}renderGauge(e,n,i,s,r,o,a){if(n<0||n>=e.length)return;e[n][i]={char:s,fg:o,bg:"black"};const l=Math.round(Math.min(1,Math.max(0,r))*mt),c=r<=.2;for(let h=0;h<mt;h++){const d=i+1+h;if(h<l){const p=c&&!a?"bright-black":o;e[n][d]={char:" ",fg:"black",bg:p}}else e[n][d]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(e,n){g(e,n,1,"VEL:----","bright-black","black"),g(e,n,16,"ATT:---°","bright-black","black"),g(e,n,30,"ROT:--°","bright-black","black")}renderCrosshair(e,n,i){var a;const s=Math.floor((n+i)/2),r=20;e[s][r]={char:"+",fg:"bright-green",bg:"black"};const o=[[s-3,r-5],[s-3,r+5],[s+3,r-5],[s+3,r+5]];for(const[l,c]of o){const h=((a=e[0])==null?void 0:a.length)??40;l>=n&&l<=i&&c>=0&&c<h&&(e[l][c]={char:"+",fg:"bright-green",bg:"black"})}}renderBottomPanels(e,n,i){for(let c=n;c<=i;c++)for(let h=le;h<Se;h++)e[c][h]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(e,n,i-n+1);for(const c of this.leftBtns){const h=n+c.row;if(h<i){const d=c.active?c.color:"bright-black";e[h][c.col]={char:c.char,fg:d,bg:"black"}}}for(const c of this.rightBtns){const h=n+c.row;if(h<i){const d=c.active?c.color:"bright-black";e[h][c.col]={char:c.char,fg:d,bg:"black"}}}const s=this.cursorIdx===0?"bright-yellow":"yellow";g(e,i,0,this.centerPad("TRAVEL",rn),"black",s);let r,o;this.inSpace?(r="bright-black",o="bright-black"):(r=this.cursorIdx===1?"bright-cyan":"cyan",o="black"),g(e,i,ft,this.centerPad("DOCK",Js),o,r);const a=Se-le,l="<)) "+"-".repeat(a-4);g(e,i,le,l,"white","bright-black")}renderRadar(e,n,i){for(const s of this.radarContacts){const r=Math.min(Se-le-1,Math.max(0,Math.floor(s.x))),o=Math.min(i-1,Math.max(0,Math.floor(s.y)));e[n+o][le+r]={char:s.char,fg:"white",bg:"bright-black"}}}renderTicker(e,n){const i=yt[this.msgIdx];for(let s=0;s<gt;s++){const r=this.tickerScroll-gt+1+s,o=r>=0&&r<i.length?i[r]:" ";e[n][s]={char:o,fg:"white",bg:"black"}}}centerPad(e,n){if(e.length>=n)return e.slice(0,n);const i=n-e.length,s=Math.floor(i/2);return" ".repeat(s)+e+" ".repeat(i-s)}}class ir extends Q{constructor(e,n,i,s,r){super(e,n,i,{title:"CARGO HOLD",tabs:["COMMODITIES","MISSION GOODS"],navOptions:[{id:"back",label:"BACK"}],onMenu:r}),this.onBack=s}handleNavTap(e){e==="back"&&(this.activated=!0,this.onBack())}handleAction(e){(e==="BACK"||e==="CARGO")&&(this.activated=!0,this.onBack())}renderContent(e,n,i){const r=e.length>0?e[0].length:0,o=this.player.cargoHold,a=this.player.missionItems,l=this.player.cargoCapacity,c=this.player.cargoWeightKg,h=i-1;this.activeTabIdx===0?this.renderCommoditiesTab(e,n,h,r,o):this.renderMissionGoodsTab(e,n,h,r,a);const d=`CARGO: ${c}/${l}KG`,p=`FUEL: ${this.player.fuelL}/${this.player.fuelCapacityL}L`;g(e,h,2,d,"bright-black","black"),g(e,h,r-p.length-2,p,"bright-black","black")}renderCommoditiesTab(e,n,i,s,r){if(r.length===0){g(e,n,2,"NO COMMODITIES","bright-black","black");return}let o=n;for(const a of r){if(o>=i-1)break;const l=de(a.commodityId);if(!l)continue;const c=a.qty*l.weightKg,h=`  x${a.qty}  ${l.basePrice}CR  ${c}KG`,d=Math.max(6,s-4-h.length),p=l.name,u=p.length>d?p.slice(0,d):p;g(e,o,2,`${u}${h}`,"white","black"),o++}}renderMissionGoodsTab(e,n,i,s,r){if(r.length===0){g(e,n,2,"NO MISSION GOODS","bright-black","black");return}let o=n;for(const a of r){if(o>=i-1)break;const l=`  ${a.weightKg}KG`,c=Math.max(6,s-4-l.length),h=a.itemName.length>c?a.itemName.slice(0,c):a.itemName;g(e,o,2,`${h}${l}`,"white","black"),o++}}}class hn extends pe{constructor(e,n,i,s,r,o,a,l,c=()=>{},h){const d=te(i.systemId),p=Vn(i.driveId),u=i.getInSystemHopCost(),m=i.fuelL<u,f=[...d.destinations.map(_=>({label:`${N(_).name.toUpperCase()}  [${u}L]`,disabled:_===i.destinationId||m,action:()=>s(_)})),{label:`FLY INTO SPACE  [${u}L]`,disabled:i.destinationId===null||m,action:o}];m&&h&&f.push({label:"[EMERGENCY]",disabled:!1,action:h});const b=[...At(i.systemId).map(_=>{const M=_.from===i.systemId?_.to:_.from,w=te(M),C=Math.ceil(D().fuel.consumptionPerLy*_.distance*p.fuelEfficiency);return{label:`${w.name.toUpperCase()}  ${_.distance}LY  [${C}L]`,disabled:C>i.fuelL,action:()=>r(M)}}),{label:"GALAXY MAP...",action:l}],S=[{label:"DESTINATIONS",items:f},{label:"JUMPS",items:b}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],e,n,i,[],S,c),this.onShip=a}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}class sr extends Q{constructor(e,n,i,s,r,o){super(e,n,i,{navOptions:[],title:"EMERGENCY RESCUE"}),this.cursorIdx=0,this.onBack=o;const a=te(i.systemId),l=D();if(this.options=[],this.fuelDestId=a.destinations.find(c=>{var h;return((h=N(c))==null?void 0:h.amenities.fuel)===!0}),this.fuelDestId){const c=N(this.fuelDestId);this.options.push({label:`TOW TO ${c.name.toUpperCase()}`,fee:l.emergencyRescue.towFee,action:()=>s(this.fuelDestId)})}this.options.push({label:"EMERGENCY FUEL DROP",fee:l.emergencyRescue.fuelDropFee,action:r}),this.options.push({label:"BACK",fee:0,action:o})}preHandleAction(e){return e==="BACK"?(this.activated=!0,this.onBack(),!0):!1}handleAction(e){e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.options.length)%this.options.length:e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.options.length:e==="SELECT"&&this.cursorIdx>=0&&this.cursorIdx<this.options.length&&(this.activated=!0,this.options[this.cursorIdx].action())}handleTap(e,n){this.cursorIdx>=0&&this.cursorIdx<this.options.length&&(this.activated=!0,this.options[this.cursorIdx].action())}renderContent(e,n,i){const s=e.length,r=s>0?e[0].length:0,o=te(this.player.systemId);let a;this.player.destinationId===null?a=`STRANDED IN SPACE NEAR ${o.name.toUpperCase()}`:a=`STRANDED AT ${N(this.player.destinationId).name.toUpperCase()}`,g(e,n,2,a,"bright-yellow","black");const l=n+2;ge(e,l,r);let c=l+1;for(let h=0;h<this.options.length;h++){const d=this.options[h],p=h===this.cursorIdx,u=p?">":" ",m=p?"bright-green":"white";if(c<s)if(g(e,c,2,u,m,"black"),d.fee===0)g(e,c,3,d.label,m,"black");else{g(e,c,3,d.label,m,"black");const f=this.player.credits-d.fee,y=`${d.fee} CR  (BALANCE: ${f>=0?"":"-"}${Math.abs(f)} CR)`,b=f<0?"bright-red":m;c+1<s&&g(e,c+1,4,y,b,"black"),c++}c++}}}function dn(t,e){if(t===e)return[t];const n=[[t]],i=new Set([t]);for(;n.length>0;){const s=n.shift(),r=s[s.length-1];for(const o of At(r)){const a=o.from===r?o.to:o.from;if(a===e)return[...s,a];i.has(a)||(i.add(a),n.push([...s,a]))}}return null}const rr=0,or=4,ar=8,lr=9,un=10,pn=15,cr=16,hr=2,dr=10,ur=12,Ye=13,Ke=12,pr=25,mr=26,fr=10,mn=18;function gr(t,e){return t.length>=e?t.slice(0,e):t+" ".repeat(e-t.length)}function Ie(t,e){return"["+gr(t.toUpperCase(),e-2)+"]"}class fn extends Q{constructor(e,n,i,s,r=()=>{},o){const a=o?[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}]:[{id:"back",label:"BACK"}];super(e,n,i,{title:"GALAXY MAP",tabs:["MAP","ROUTE"],navOptions:a,onMenu:r}),this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.lastTop=X+5,this.onBack=s,this.onGame=o,this.publicSystems=is().sort((l,c)=>l.distanceFromSol-c.distanceFromSol),this.otherSystems=this.publicSystems.filter(l=>l.id!==i.systemId),this.mapBrowsingSystemId=i.systemId}onTabChange(e){this.searchText=""}handleCharInput(e){if(this.activeTabIdx!==0)return;const n=e.charCodeAt(0);e==="\b"||e===""?this.searchText=this.searchText.slice(0,-1):n>=32&&n<127&&(this.searchText+=e.toUpperCase(),this.mapCursorIdx=0)}handleAction(e){if(e==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}if(e==="NAV_1"){this.onGame&&(this.activated=!0,this.onGame());return}if(e==="NAV_2"){this.onGame&&(this.searchText="",this.activated=!0,this.onBack());return}this.activeTabIdx===0?this.handleMapAction(e):this.handleRouteAction(e)}handleNavTap(e){e==="back"?(this.searchText="",this.activated=!0,this.onBack()):e==="game"&&this.onGame?(this.activated=!0,this.onGame()):e==="menu"&&(this.searchText="",this.activated=!0,this.onBack())}handleTap(e,n){const i=this.lastTop,s=i+un,r=i+pn;if(this.activeTabIdx===0&&n>=s&&n<r){const o=this.getMapNeighbors(),a=n-s;a>=0&&a<o.length&&(this.mapBrowsingSystemId=o[a].id,this.mapCursorIdx=0,this.searchText="")}else if(this.activeTabIdx===1){const o=i+3,a=i+9;if(n>=o&&n<=a){const l=n-o;l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}}}getMapNeighbors(){const n=At(this.mapBrowsingSystemId).map(i=>{const s=i.from===this.mapBrowsingSystemId?i.to:i.from,r=this.publicSystems.find(a=>a.id===s),o=i.distance;return r?{sys:r,dist:o}:null}).filter(i=>i!==null).sort((i,s)=>i.dist-s.dist).map(i=>i.sys);return this.searchText.length===0?n:n.filter(i=>i.name.toUpperCase().includes(this.searchText))}handleMapAction(e){const n=this.getMapNeighbors(),i=Math.min(this.mapCursorIdx,Math.max(0,n.length-1));if(e==="UP")this.mapCursorIdx=Math.max(0,i-1);else if(e==="DOWN")this.mapCursorIdx=Math.min(n.length-1,i+1);else if(e==="SELECT"){const s=n[i];if(!s)return;this.mapBrowsingSystemId=s.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(e){e==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):e==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const e=this.otherSystems[this.routeDestIdx];return e?dn(this.player.systemId,e.id):null}renderContent(e,n,i){this.lastTop=n;const s=e.length>0?e[0].length:0;this.activeTabIdx===0?this.renderMapTab(e,n,i,s):this.renderRouteTab(e,n,i,s)}renderMapTab(e,n,i,s){const r=this.publicSystems.find(p=>p.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!r)return;const o=n+lr,a=n+un,l=n+pn,c=n+cr;this.renderChart(e,r,n),ge(e,o,s);const h=this.getMapNeighbors(),d=Math.min(this.mapCursorIdx,Math.max(0,h.length-1));this.renderNeighborList(e,s,r,h,d,a,l),ge(e,l,s),this.renderInfo(e,s,r,h[d]??null,c),this.searchText.length>0&&g(e,c+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(e,n,i){var h;const s=this.getMapNeighbors(),r=i+rr,o=i+or,a=i+ar,l=n.id===this.player.systemId?"bright-yellow":"bright-cyan";if(g(e,o,Ye,Ie(n.name,Ke),l,"black"),n.id===this.player.systemId){const d=Ye+Ke,p=((h=e[0])==null?void 0:h.length)??40;d<p&&(e[o][d]={char:"*",fg:"bright-yellow",bg:"black"})}const c=["left","right","top","bottom"];for(let d=0;d<Math.min(s.length,4);d++){const p=s[d],u=c[d],m=p.id===this.player.systemId?"bright-yellow":"white";if(u==="left")g(e,o,hr,Ie(p.name,dr),m,"black"),e[o][ur]={char:"-",fg:"bright-black",bg:"black"};else if(u==="right")g(e,o,mr,Ie(p.name,fr),m,"black"),e[o][pr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="top"){g(e,r,Ye,Ie(p.name,Ke),m,"black");for(let f=r+1;f<o;f++)e[f][mn]={char:"|",fg:"bright-black",bg:"black"}}else{g(e,a,Ye,Ie(p.name,Ke),m,"black");for(let f=o+1;f<a;f++)e[f][mn]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(e,n,i,s,r,o,a){for(let l=0;l<s.length&&l<a-o;l++){const c=s[l],h=o+l,d=l===r,u=c.id===this.player.systemId?"bright-yellow":d?"bright-cyan":"white",m=d?"> ":"  ",f=ze(i.id,c.id),y=f?`${f.distance}LY  ${f.stability}`:"",b=n-4-y.length;g(e,h,2,m+c.name.toUpperCase().slice(0,b-2),u,"black"),y&&g(e,h,n-2-y.length,y,"bright-black","black")}}renderInfo(e,n,i,s,r){const a=i.id===this.player.systemId?"* Current location":i.name.toUpperCase();if(g(e,r,2,`Zone: ${i.zone}  Sec: ${i.security}  ${a}`.slice(0,n-4),"bright-black","black"),!s)return;const l=ze(i.id,s.id);if(!l)return;const c=dn(this.player.systemId,s.id),h=c?c.length===1?"(your location)":`${c.length-1} hop${c.length-1!==1?"s":""} from you`:"(unreachable)";g(e,r+1,2,`${s.name.toUpperCase()}  ${l.distance}LY  ${h}`.slice(0,n-4),"bright-black","black")}renderRouteTab(e,n,i,s){var b,S;const r=n,o=n+2,a=n+3,l=7,c=a+l,h=c+1,d=h+6,p=this.publicSystems.find(_=>_.id===this.player.systemId);g(e,r,2,"FROM:","bright-black","black"),g(e,r,8,(p==null?void 0:p.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),g(e,o,2,"TO:","bright-black","black");const u=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-l));for(let _=0;_<l;_++){const M=u+_;if(M>=this.otherSystems.length)break;const w=this.otherSystems[M],C=M===this.routeDestIdx,v=C?"bright-cyan":"white",k=C?"> ":"  ";g(e,a+_,2,k+w.name.toUpperCase(),v,"black")}ge(e,c,s),ge(e,d,s);const m=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!m){g(e,h,2,"No route found","bright-red","black");return}const y=m.length-1;g(e,h,2,`Route: ${y} hop${y!==1?"s":""}`,"bright-white","black");for(let _=0;_<y;_++){const M=ze(m[_],m[_+1]);if(!M)continue;const w=h+1+_;if(w>=d)break;const C=(((b=this.publicSystems.find(k=>k.id===m[_]))==null?void 0:b.name)??m[_]).toUpperCase().slice(0,9),v=(((S=this.publicSystems.find(k=>k.id===m[_+1]))==null?void 0:S.name)??m[_+1]).toUpperCase().slice(0,9);g(e,w,4,`${C} -> ${v}  ${M.distance}LY  ${M.stability}`.slice(0,s-6),"white","black")}}}class ae extends Q{constructor(e,n,i,s){const r={onAction:()=>{}};super(r,n,e,{navOptions:[]}),this.elapsed=0,this.arrived=!1,this.duration=i,this.onComplete=s}update(e){this.arrived||(this.elapsed+=e,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const yr=["[. . .]","[: : :]","[* * *]"],gn=5e3;class _r extends ae{constructor(e,n,i){super(e,n,gn,i)}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(e,n,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/500)%3,a=Math.ceil((gn-this.elapsed)/1e3),l=Math.max(1,Math.min(5,a)),c=te(this.player.systemId),h=c?c.name.toUpperCase():this.player.systemId.toUpperCase();F(e,r-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),F(e,r-1,"DESTINATION:","bright-black","black"),F(e,r,h,"bright-white","black"),F(e,r+2,yr[o],"bright-black","black"),F(e,r+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const yn=2e3,br=["[ —   ]","[  —  ]","[   — ]"];class _t extends ae{constructor(e,n,i,s){super(e,n,yn,i),this.targetLabel=s}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(e,n,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((yn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a)),c=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const h=this.player.destinationId?N(this.player.destinationId):null;return h?h.name.toUpperCase():"UNKNOWN"})();F(e,r-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),F(e,r-1,"HEADING TO:","bright-black","black"),F(e,r,c,"bright-white","black"),F(e,r+2,br[o],"bright-black","black"),F(e,r+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const _n=2500,vr=["v","vv","vvv"];class wr extends ae{constructor(e,n,i){super(e,n,_n,i)}renderContent(e,n,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/400)%3,a=Math.ceil((_n-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));F(e,r-3,"[ LANDING SEQUENCE ]","bright-green","black"),F(e,r+2,vr[o],"bright-black","black"),F(e,r+4,`TOUCHDOWN IN ${l}S`,"bright-black","black")}}const bn=2500,kr=[">",">>",">>>"];class xr extends ae{constructor(e,n,i){super(e,n,bn,i)}renderContent(e,n,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/400)%3,a=Math.ceil((bn-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));F(e,r-3,"[ APPROACH LOCKED ]","bright-yellow","black"),F(e,r+2,kr[o],"bright-black","black"),F(e,r+4,`CLAMPING IN ${l}S`,"bright-black","black")}}const vn=1500,Cr=["^","^^","^^^"];class Tr extends ae{constructor(e,n,i){super(e,n,vn,i)}renderContent(e,n,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((vn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));F(e,r-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),F(e,r+2,Cr[o],"bright-black","black"),F(e,r+4,`CLEAR IN ${l}S`,"bright-black","black")}}const wn=1500,Sr=["<","<<","<<<"];class Mr extends ae{constructor(e,n,i){super(e,n,wn,i)}renderContent(e,n,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((wn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));F(e,r-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),F(e,r+2,Sr[o],"bright-black","black"),F(e,r+4,`DEPARTING IN ${l}S`,"bright-black","black")}}const kn=1500,Ir=["→","→→","→→→"];class Ar extends ae{constructor(e,n,i){super(e,n,kn,i)}renderContent(e,n,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((kn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));F(e,r-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),F(e,r+2,Ir[o],"bright-black","black"),F(e,r+4,`DOCKING IN ${l}S`,"bright-black","black")}}const xn=1500,Rr=["←","←←","←←←"];class Er extends ae{constructor(e,n,i){super(e,n,xn,i)}renderContent(e,n,i){const s=e.length,r=Math.floor(s/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((xn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));F(e,r-3,"[ DEPARTING BERTH ]","bright-cyan","black"),F(e,r+2,Rr[o],"bright-black","black"),F(e,r+4,`CLEAR IN ${l}S`,"bright-black","black")}}const Fr=3e3;class Lr extends Q{constructor(e,n,i,s,r,o,a){super(e,i,n,{navOptions:[]}),this.outcomeLabel=s,this.score=r,this.damageFraction=o,this.onComplete=a,this.elapsed=0,this.arrived=!1,this.duration=Fr,this.lastContentTop=4,this.lastContentBottom=26,this.buttonRow=0,this.buttonCol=0,e.onTap&&e.onTap((l,c)=>this.handleTapCustom(l,c)),e.onAction(l=>{!this.arrived&&l==="SELECT"&&(this.arrived=!0,this.onComplete())})}handleTapCustom(e,n){Math.abs(n-this.buttonRow)<=0&&e>=this.buttonCol&&e<this.buttonCol+"[continue]".length&&(this.arrived=!0,this.onComplete())}update(e){super.update(e),!this.arrived&&(this.elapsed+=e)}renderContent(e,n,i){var p;this.lastContentTop=n,this.lastContentBottom=i;const s=Math.floor((n+i)/2),r=((p=e[0])==null?void 0:p.length)??40,o=this.getOutcomeColor();F(e,s-2,this.outcomeLabel,o,"black"),this.score!==null&&F(e,s,`SCORE: ${this.score} / 100`,"white","black");const a=Math.round(this.damageFraction*100),l=a===0?"bright-green":"yellow";F(e,s+2,`HULL DAMAGE: ${a}%`,l,"black");const c="[continue]",h=s+5,d=Math.floor((r-c.length)/2);this.buttonRow=h,this.buttonCol=d,F(e,h,c,"bright-green","black")}getOutcomeColor(){return this.score===null||this.score<40?"red":this.score<70?"yellow":"bright-green"}}class st extends Q{constructor(e,n,i,s){super(e,n,i,{navOptions:s.navOptions,title:s.title}),this._completed=!1,this._onComplete=s.onComplete,this._canvasWidth=s.canvasWidth,this._canvasHeight=s.canvasHeight}renderContent(e,n,i){var u;const s=((u=e[0])==null?void 0:u.length)??0,r=e.length,o=i-n,a=this._canvasWidth??s,l=this._canvasHeight??o;let c=Math.floor((s-a)/2),h=n+Math.floor((o-l)/2);const d=Math.max(0,s-a),p=Math.max(0,r-l);c=Math.max(0,Math.min(c,d)),h=Math.max(0,Math.min(h,p)),this.renderGame(e,{top:h,left:c,width:a,height:l})}complete(e){var n;this._completed||(this._completed=!0,(n=this._onComplete)==null||n.call(this,e))}}function Dr(t){if(t.length===0)return 2166136261;let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e=Math.imul(e,16777619)>>>0;return e===0?1:e}function Or(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}const ne=1;class Nr extends st{constructor(e,n,i,s){const r=i.destinationId??"";super(e,n,i,{navOptions:[],title:"DOCKING",canvasWidth:32,canvasHeight:18,onComplete:s}),this.heldKeys=new Set,this.lastActionTime=0,this.actionTimeoutMs=200,this.canvasWidth=32,this.canvasHeight=18,this.countdownSeconds=15,this.thrustForce=8,this.maxVelocity=6,this.driftIntervalMs=3e3,this.driftMaxDistanceChars=4,this.driftSpeedCharsPerSec=.8,this.perfectRadiusChars=5,this.airlockWidth=5,this.airlockHeight=3,this.lastViewport={top:0,left:0,width:32,height:18},this._joystick=null,this._primaryInput=n.primaryInput,this.rand=Or(Dr(r));const o=(this.canvasWidth-1)/2,a=(this.canvasHeight-1)/2;this.state={shipX:o,shipY:a,shipVelX:0,shipVelY:0,airlockX:o,airlockY:a,driftTargetX:o,driftTargetY:a,driftTimer:this.driftIntervalMs*(.8+.4*this.rand()),timeRemaining:this.countdownSeconds,completed:!1},e.onTouchTrack&&e.onTouchTrack({start:(l,c,h)=>{c<X||(this._joystick={centerCol:l,centerRow:c,currentCol:l,currentRow:c,id:h})},move:(l,c,h)=>{!this._joystick||this._joystick.id!==h||(this._joystick.currentCol=l,this._joystick.currentRow=c)},end:l=>{var c;((c=this._joystick)==null?void 0:c.id)===l&&(this._joystick=null,this.heldKeys.clear())}})}renderContent(e,n,i){var u;const s=((u=e[0])==null?void 0:u.length)??0,r=e.length,o=i-n,a=this.canvasWidth,l=this._primaryInput==="touch"?this.canvasHeight:this.canvasHeight+3;let c=Math.floor((s-a)/2),h=n+Math.floor((o-l)/2);const d=Math.max(0,s-this.canvasWidth),p=Math.max(0,r-this.canvasHeight);c=Math.max(0,Math.min(c,d)),h=Math.max(0,Math.min(h,p)),this.renderGame(e,{top:h,left:c,width:this.canvasWidth,height:this.canvasHeight})}handleAction(e){if(super.handleAction(e),e==="MENU"){this.state.completed||(this.state.completed=!0,this.complete({outcome:"skipped"}));return}(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&(this.heldKeys.add(e),this.lastActionTime=performance.now())}handleTap(e,n){if(this.state.completed){super.handleTap(e,n);return}if(this._primaryInput==="touch"){super.handleTap(e,n);return}const{top:i,left:s,width:r,height:o}=this.lastViewport,a=s+Math.floor(r/2),l=i+o,c=l+1,h=l+3,d=a-5,p=a+3,u=a;n===c&&e>=u-1&&e<=u+1?this.handleAction("UP"):n===h&&e>=u-1&&e<=u+1?this.handleAction("DOWN"):e>=d&&e<=d+2&&n===c+1?this.handleAction("LEFT"):e>=p&&e<=p+2&&n===c+1?this.handleAction("RIGHT"):super.handleTap(e,n)}update(e){super.update(e);const n=e/1e3;if(!this.state.completed){if(this._joystick){const i=this._joystick.currentCol-this._joystick.centerCol,s=this._joystick.currentRow-this._joystick.centerRow;this.heldKeys.clear(),s<-ne&&this.heldKeys.add("UP"),s>ne&&this.heldKeys.add("DOWN"),i<-ne&&this.heldKeys.add("LEFT"),i>ne&&this.heldKeys.add("RIGHT")}else this.clearExpiredActions();if(this.updateMovement(n),this.updateAirlockDrift(n),this.updateCountdown(n),this.state.timeRemaining<=0){const i=Math.hypot(this.state.shipX-this.state.airlockX,this.state.shipY-this.state.airlockY),s=1.5,r=i<=s?100:Math.round(Math.max(0,Math.min(1,1/(1+(i-s)/this.perfectRadiusChars)))*100);this.state.completed=!0,this.complete({outcome:"completed",result:{score:r}})}}}updateMovement(e){const n=this.state;this.heldKeys.has("UP")&&(n.shipVelY-=this.thrustForce*e),this.heldKeys.has("DOWN")&&(n.shipVelY+=this.thrustForce*e),this.heldKeys.has("LEFT")&&(n.shipVelX-=this.thrustForce*e),this.heldKeys.has("RIGHT")&&(n.shipVelX+=this.thrustForce*e),n.shipVelX=Math.max(-this.maxVelocity,Math.min(this.maxVelocity,n.shipVelX)),n.shipVelY=Math.max(-this.maxVelocity,Math.min(this.maxVelocity,n.shipVelY)),n.shipX+=n.shipVelX*e,n.shipY+=n.shipVelY*e;const i=.5;n.shipX=Math.max(i,Math.min(this.canvasWidth-1-i,n.shipX)),n.shipY=Math.max(i,Math.min(this.canvasHeight-1-i,n.shipY))}updateAirlockDrift(e){const n=this.state,i=n.driftTargetX-n.airlockX,s=n.driftTargetY-n.airlockY,r=Math.hypot(i,s);if(r<.1){const o=this.rand()*2*Math.PI,a=this.rand()*this.driftMaxDistanceChars,l=(this.canvasWidth-1)/2,c=(this.canvasHeight-1)/2;n.driftTargetX=l+Math.cos(o)*a,n.driftTargetY=c+Math.sin(o)*a,n.driftTimer=this.driftIntervalMs*(.8+.4*this.rand())}else{const o=this.driftSpeedCharsPerSec*e,a=Math.min(1,o/r);n.airlockX+=i*a,n.airlockY+=s*a}}updateCountdown(e){this.state.timeRemaining=Math.max(0,this.state.timeRemaining-e)}clearExpiredActions(){performance.now()-this.lastActionTime>this.actionTimeoutMs&&this.heldKeys.clear()}renderGame(e,n){const{top:i,left:s,width:r,height:o}=n;this.lastViewport={top:i,left:s,width:r,height:o},this.drawBorder(e,i,s,r,o),this.drawAirlock(e,i,s),this.drawShip(e,i,s),this.drawCountdown(e,i,s,r),this.drawDistance(e,i,s,o),this._primaryInput==="touch"?this._renderJoystick(e,n):this.drawControlButtons(e,i,s,r,o)}_renderJoystick(e,n){const{top:i,left:s,width:r,height:o}=n,a=(f,y,b,S)=>{var _;f<0||f>=e.length||y<0||y>=(((_=e[f])==null?void 0:_.length)??0)||(e[f][y]={char:b,fg:S,bg:"black"})};if(!this._joystick){const f="DRAG TO DOCK",y=i+o-2,b=s+Math.floor((r-f.length)/2);g(e,y,b,f,"bright-black","black");return}const{centerCol:l,centerRow:c,currentCol:h,currentRow:d}=this._joystick,p=h-l,u=d-c,m=this.heldKeys.size>0;a(c,l,"o",m?"bright-white":"white"),u<-ne&&a(c-2,l,"^","bright-green"),u>ne&&a(c+2,l,"v","bright-green"),p<-ne&&a(c,l-2,"<","bright-green"),p>ne&&a(c,l+2,">","bright-green")}drawBorder(e,n,i,s,r){const o=i+s-1,a=n+r-1;for(let l=i;l<=o;l++)n<e.length&&l<e[n].length&&(e[n][l]={char:"+",fg:"white",bg:"black"}),a<e.length&&l<e[a].length&&(e[a][l]={char:"+",fg:"white",bg:"black"});for(let l=n+1;l<a;l++)l<e.length&&(i<e[l].length&&(e[l][i]={char:"|",fg:"white",bg:"black"}),o<e[l].length&&(e[l][o]={char:"|",fg:"white",bg:"black"}))}drawAirlock(e,n,i){const s=i+1+Math.round(this.state.airlockX),r=n+1+Math.round(this.state.airlockY),o=s-Math.floor(this.airlockWidth/2),a=r-Math.floor(this.airlockHeight/2),l=[["+","-","+","-","+"],["|"," ","+"," ","|"],["+","-","+","-","+"]];for(let c=0;c<this.airlockHeight;c++)for(let h=0;h<this.airlockWidth;h++){const d=a+c,p=o+h;if(d>=n&&d<n+this.canvasHeight&&p>=i&&p<i+this.canvasWidth&&d<e.length&&p<e[d].length){const u=l[c][h];e[d][p]={char:u,fg:"bright-yellow",bg:"black"}}}}drawShip(e,n,i){const s=i+1+Math.round(this.state.shipX),r=n+1+Math.round(this.state.shipY);s>=i&&s<i+this.canvasWidth&&r>=n&&r<n+this.canvasHeight&&(r<e.length&&s<e[r].length&&(e[r][s]={char:"(",fg:"bright-green",bg:"black"}),s+1<i+this.canvasWidth&&r<e.length&&s+1<e[r].length&&(e[r][s+1]={char:"+",fg:"bright-green",bg:"black"}),s+2<i+this.canvasWidth&&r<e.length&&s+2<e[r].length&&(e[r][s+2]={char:")",fg:"bright-green",bg:"black"}))}drawCountdown(e,n,i,s){const r=`T: ${Math.ceil(this.state.timeRemaining)}`,o=i+s-1-r.length,a=n+1;g(e,a,o,r,"white","black")}drawDistance(e,n,i,s){const o=`DIST: ${Math.hypot(this.state.shipX-this.state.airlockX,this.state.shipY-this.state.airlockY).toFixed(1)}`,a=n+s-1;g(e,a,i+2,o,"white","black")}drawControlButtons(e,n,i,s,r){const o=e.length,a=o>0?e[0].length:0,l=n+r,c=i+Math.floor(s/2),h=this.heldKeys.has("UP"),d=this.heldKeys.has("DOWN"),p=this.heldKeys.has("LEFT"),u=this.heldKeys.has("RIGHT"),m="bright-green",f="bright-black",y=C=>`[${C}]`,b=l+1,S=l+2,_=l+3,M=c-5,w=c+3;if(b<o&&c-1>=0&&c+1<a){const C=y("^"),v=c-1;for(let k=0;k<C.length;k++)v+k>=0&&v+k<a&&(e[b][v+k]={char:C[k],fg:h?m:f,bg:"black"})}if(S<o){const C=y("<");for(let k=0;k<C.length;k++)M+k>=0&&M+k<a&&(e[S][M+k]={char:C[k],fg:p?m:f,bg:"black"});const v=y(">");for(let k=0;k<v.length;k++)w+k>=0&&w+k<a&&(e[S][w+k]={char:v[k],fg:u?m:f,bg:"black"})}if(_<o&&c-1>=0&&c+1<a){const C=y("v"),v=c-1;for(let k=0;k<C.length;k++)v+k>=0&&v+k<a&&(e[_][v+k]={char:C[k],fg:d?m:f,bg:"black"})}}}function Qn(t,e,n,i,s,r){let{x:o,y:a,vx:l,vy:c}=t;l*=n.airResistance**r,c+=n.gravity*r,e.up&&(c-=n.thrustForce*r),e.down&&(c+=n.thrustForce*r),e.left&&(l-=n.thrustForce*r),e.right&&(l+=n.thrustForce*r);const h=n.maxVerticalSpeed??n.thrustForce*3;return l=Math.max(-h,Math.min(h,l)),c=Math.max(-h,Math.min(h,c)),o+=l*r,a+=c*r,o=Math.max(0,Math.min(i-s,o)),{x:o,y:a,vx:l,vy:c}}function Pr(t){if(t.length===0)return 2166136261;let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e=Math.imul(e,16777619)>>>0;return e===0?1:e}function Hr(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function Jn(t,e,n,i,s){const r=Hr(Pr(t)),o=3,a=Math.min(5,Math.floor(n/2)),l=o+Math.floor(r()*(a-o+1)),c=n-l,h=[];for(let u=0;u<e;u++){const m=Math.floor(r()*3)-1;h.push(Math.max(c-1,Math.min(c+1,c+m)))}const d=Math.max(0,e-i),p=Math.floor(r()*(d+1));for(let u=p;u<p+i&&u<e;u++)h[u]=c;return h.map((u,m)=>({surfaceRow:u,isPad:m>=p&&m<p+i}))}function Zn(t,e,n){const i=Math.floor(t),s=i+2;for(let r=i;r<=s;r++)if(!(r<0||r>=n.length)&&e>=n[r].surfaceRow)return!0;return!1}function ei(t,e,n,i,s,r){for(let o=0;o<e.length;o++){const a=e[o],l=i+o;if(l<0)continue;let c;if(a.isPad){const u=o>0&&e[o-1].isPad,m=o<e.length-1&&e[o+1].isPad;u?m?c="=":c="]":c="["}else r==="asteroid"?c="/":c="^";const h=r==="asteroid"?"*":"#",d=a.isPad?"bright-yellow":"white",p=n+a.surfaceRow;for(let u=p;u<n+s;u++){if(u<0||u>=t.length||l>=t[u].length)continue;const m=u===p;t[u][l]={char:m?c:h,fg:d,bg:"black"}}}}const bt=3,Cn=2,Br=1/60,ie=1;class Ur extends st{constructor(e,n,i,s){super(e,n,i,{navOptions:[],title:"LANDING",onComplete:s}),this._ship={x:0,y:0,vx:0,vy:1},this._heldKeys=new Set,this._lastActionTime=0,this._actionTimeoutMs=200,this._terrain=null,this._viewport=null,this._landed=!1,this._joystick=null,this._destId=i.destinationId??"",this._primaryInput=n.primaryInput;const{surface:r}=D().miniGames;this._gravityAccel=r.gravityAccel,this._airResistance=r.airResistance,this._thrustForce=r.thrustForce,this._maxSafeSpeed=r.maxSafeSpeed,this._crashSpeed=r.crashSpeed,this._offPadScoreMultiplier=r.offPadScoreMultiplier,this._padWidth=r.padWidth,this._maxSpeed=r.maxSpeed,e.onTouchTrack&&e.onTouchTrack({start:(o,a,l)=>{a<X||(this._joystick={centerCol:o,centerRow:a,currentCol:o,currentRow:a,id:l})},move:(o,a,l)=>{!this._joystick||this._joystick.id!==l||(this._joystick.currentCol=o,this._joystick.currentRow=a)},end:o=>{var a;((a=this._joystick)==null?void 0:a.id)===o&&(this._joystick=null,this._heldKeys.clear())}})}handleAction(e){if(super.handleAction(e),e==="MENU"){this._landed||(this._landed=!0,this.complete({outcome:"skipped"}));return}this._primaryInput!=="touch"&&(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&(this._heldKeys.add(e),this._lastActionTime=performance.now())}update(e){if(super.update(e),this._landed||!this._terrain||!this._viewport)return;if(this._joystick){const r=this._joystick.currentCol-this._joystick.centerCol,o=this._joystick.currentRow-this._joystick.centerRow;this._heldKeys.clear(),o<-ie&&this._heldKeys.add("UP"),o>ie&&this._heldKeys.add("DOWN"),r<-ie&&this._heldKeys.add("LEFT"),r>ie&&this._heldKeys.add("RIGHT")}else this._clearExpiredKeys();const n={gravity:this._gravityAccel,airResistance:this._airResistance,thrustForce:this._thrustForce,maxVerticalSpeed:this._maxSpeed},i={up:this._heldKeys.has("UP"),down:this._heldKeys.has("DOWN"),left:this._heldKeys.has("LEFT"),right:this._heldKeys.has("RIGHT")};let s=e/1e3;for(;s>0&&!this._landed;){const r=Math.min(s,Br);s-=r,this._ship=Qn(this._ship,i,n,this._viewport.width,bt,r);const o=this._ship.y+(Cn-1);if(Zn(this._ship.x,o,this._terrain)){const a=Math.hypot(this._ship.vx,this._ship.vy);this._snapToSurface(),this._land(a);break}}}_snapToSurface(){if(!this._terrain)return;const e=Math.floor(this._ship.x),n=e+bt-1;let i=1/0;for(let s=e;s<=n;s++)s>=0&&s<this._terrain.length&&(i=Math.min(i,this._terrain[s].surfaceRow));i<1/0&&(this._ship={...this._ship,y:i-Cn,vx:0,vy:0})}_land(e){if(this._landed)return;this._landed=!0;const n=e??Math.hypot(this._ship.vx,this._ship.vy),i=Math.max(0,Math.min(1,1-(n-this._maxSafeSpeed)/(this._crashSpeed-this._maxSafeSpeed))),s=Math.floor(this._ship.x)+1,r=this._terrain,o=s>=0&&s<r.length&&r[s].isPad,a=o?1:this._offPadScoreMultiplier,l=Math.round(i*a*100);this.complete({outcome:"completed",result:{score:l,speed:n,onPad:o}})}_clearExpiredKeys(){performance.now()-this._lastActionTime>this._actionTimeoutMs&&this._heldKeys.clear()}renderGame(e,n){this._terrain||(this._terrain=Jn(this._destId,n.width,n.height,this._padWidth),this._ship={x:(n.width-bt)/2,y:1,vx:0,vy:1}),this._viewport=n,ei(e,this._terrain,n.top,n.left,n.height,"planet"),this._renderShip(e,n),this._renderHUD(e,n),this._renderJoystick(e,n)}_renderShip(e,n){var o;const i=n.left+Math.round(this._ship.x),s=n.top+Math.round(this._ship.y),r=[["-","v","-"],["(","+",")"]];for(let a=0;a<r.length;a++)for(let l=0;l<r[a].length;l++){const c=s+a,h=i+l;c<0||c>=e.length||h<0||h>=(((o=e[c])==null?void 0:o.length)??0)||(e[c][h]={char:r[a][l],fg:"bright-green",bg:"black"})}}_renderHUD(e,n){const i=Math.hypot(this._ship.vx,this._ship.vy),s=`SPD:${i.toFixed(1)}`,r=n.left+n.width-s.length;if(g(e,n.top+1,r,s,"white","black"),i>this._maxSafeSpeed){const o="!! FAST",a=n.left+n.width-o.length;g(e,n.top+2,a,o,"bright-yellow","black")}}_renderJoystick(e,n){if(this._primaryInput!=="touch")return;if(!this._joystick){const d="HOLD & DRAG TO THRUST",p=this._terrain?Math.min(...this._terrain.map(f=>f.surfaceRow)):n.height-2,u=n.top+Math.max(0,p-2),m=n.left+Math.floor((n.width-d.length)/2);g(e,u,m,d,"bright-black","black");return}const{centerCol:i,centerRow:s,currentCol:r,currentRow:o}=this._joystick,a=r-i,l=o-s,c=this._heldKeys.size>0,h=(d,p,u,m)=>{var f;d<0||d>=e.length||p<0||p>=(((f=e[d])==null?void 0:f.length)??0)||(e[d][p]={char:u,fg:m,bg:"black"})};h(s,i,"o",c?"bright-white":"white"),l<-ie&&h(s-2,i,"^","bright-green"),l>ie&&h(s+2,i,"v","bright-green"),a<-ie&&h(s,i-2,"<","bright-green"),a>ie&&h(s,i+2,">","bright-green")}}const vt=3,Tn=2,Gr=1/60,se=1;class $r extends st{constructor(e,n,i,s){super(e,n,i,{navOptions:[],title:"LANDING",onComplete:s}),this._ship={x:0,y:0,vx:0,vy:1},this._heldKeys=new Set,this._lastActionTime=0,this._actionTimeoutMs=200,this._terrain=null,this._viewport=null,this._landed=!1,this._joystick=null,this._destId=i.destinationId??"",this._primaryInput=n.primaryInput;const{asteroid:r}=D().miniGames;this._thrustForce=r.thrustForce,this._maxSafeSpeed=r.maxSafeSpeed,this._crashSpeed=r.crashSpeed,this._offPadScoreMultiplier=r.offPadScoreMultiplier,this._padWidth=r.padWidth,this._initialDownwardVelocity=r.initialDownwardVelocity,this._maxSpeed=r.maxSpeed,e.onTouchTrack&&e.onTouchTrack({start:(o,a,l)=>{a<X||(this._joystick={centerCol:o,centerRow:a,currentCol:o,currentRow:a,id:l})},move:(o,a,l)=>{!this._joystick||this._joystick.id!==l||(this._joystick.currentCol=o,this._joystick.currentRow=a)},end:o=>{var a;((a=this._joystick)==null?void 0:a.id)===o&&(this._joystick=null,this._heldKeys.clear())}})}handleAction(e){if(super.handleAction(e),e==="MENU"){this._landed||(this._landed=!0,this.complete({outcome:"skipped"}));return}this._primaryInput!=="touch"&&(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&(this._heldKeys.add(e),this._lastActionTime=performance.now())}update(e){if(super.update(e),this._landed||!this._terrain||!this._viewport)return;if(this._joystick){const r=this._joystick.currentCol-this._joystick.centerCol,o=this._joystick.currentRow-this._joystick.centerRow;this._heldKeys.clear(),o<-se&&this._heldKeys.add("UP"),o>se&&this._heldKeys.add("DOWN"),r<-se&&this._heldKeys.add("LEFT"),r>se&&this._heldKeys.add("RIGHT")}else this._clearExpiredKeys();const n={gravity:0,airResistance:1,thrustForce:this._thrustForce,maxVerticalSpeed:this._maxSpeed},i={up:this._heldKeys.has("UP"),down:this._heldKeys.has("DOWN"),left:this._heldKeys.has("LEFT"),right:this._heldKeys.has("RIGHT")};let s=e/1e3;for(;s>0&&!this._landed;){const r=Math.min(s,Gr);s-=r,this._ship=Qn(this._ship,i,n,this._viewport.width,vt,r);const o=this._ship.y+(Tn-1);if(Zn(this._ship.x,o,this._terrain)){const a=Math.hypot(this._ship.vx,this._ship.vy);this._snapToSurface(),this._land(a);break}}}_snapToSurface(){if(!this._terrain)return;const e=Math.floor(this._ship.x),n=e+vt-1;let i=1/0;for(let s=e;s<=n;s++)s>=0&&s<this._terrain.length&&(i=Math.min(i,this._terrain[s].surfaceRow));i<1/0&&(this._ship={...this._ship,y:i-Tn,vx:0,vy:0})}_land(e){if(this._landed)return;this._landed=!0;const n=e??Math.hypot(this._ship.vx,this._ship.vy),i=Math.max(0,Math.min(1,1-(n-this._maxSafeSpeed)/(this._crashSpeed-this._maxSafeSpeed))),s=Math.floor(this._ship.x)+1,r=this._terrain,o=s>=0&&s<r.length&&r[s].isPad,a=o?1:this._offPadScoreMultiplier,l=Math.round(i*a*100);this.complete({outcome:"completed",result:{score:l,speed:n,onPad:o}})}_clearExpiredKeys(){performance.now()-this._lastActionTime>this._actionTimeoutMs&&this._heldKeys.clear()}renderGame(e,n){this._terrain||(this._terrain=Jn(this._destId,n.width,n.height,this._padWidth),this._ship={x:(n.width-vt)/2,y:1,vx:0,vy:this._initialDownwardVelocity}),this._viewport=n,ei(e,this._terrain,n.top,n.left,n.height,"asteroid"),this._renderShip(e,n),this._renderHUD(e,n),this._renderJoystick(e,n)}_renderShip(e,n){var o;const i=n.left+Math.round(this._ship.x),s=n.top+Math.round(this._ship.y),r=[["-","v","-"],["(","+",")"]];for(let a=0;a<r.length;a++)for(let l=0;l<r[a].length;l++){const c=s+a,h=i+l;c<0||c>=e.length||h<0||h>=(((o=e[c])==null?void 0:o.length)??0)||(e[c][h]={char:r[a][l],fg:"bright-green",bg:"black"})}}_renderHUD(e,n){const i=Math.hypot(this._ship.vx,this._ship.vy),s=`SPD:${i.toFixed(1)}`,r=n.left+n.width-s.length;if(g(e,n.top+1,r,s,"white","black"),i>this._maxSafeSpeed){const o="!! FAST",a=n.left+n.width-o.length;g(e,n.top+2,a,o,"bright-yellow","black")}}_renderJoystick(e,n){if(this._primaryInput!=="touch")return;if(!this._joystick){const d="HOLD & DRAG TO THRUST",p=this._terrain?Math.min(...this._terrain.map(f=>f.surfaceRow)):n.height-2,u=n.top+Math.max(0,p-2),m=n.left+Math.floor((n.width-d.length)/2);g(e,u,m,d,"bright-black","black");return}const{centerCol:i,centerRow:s,currentCol:r,currentRow:o}=this._joystick,a=r-i,l=o-s,c=this._heldKeys.size>0,h=(d,p,u,m)=>{var f;d<0||d>=e.length||p<0||p>=(((f=e[d])==null?void 0:f.length)??0)||(e[d][p]={char:u,fg:m,bg:"black"})};h(s,i,"o",c?"bright-white":"white"),l<-se&&h(s-2,i,"^","bright-green"),l>se&&h(s+2,i,"v","bright-green"),a<-se&&h(s,i-2,"<","bright-green"),a>se&&h(s,i+2,">","bright-green")}}function Wr(t){if(t.length===0)return 2166136261;let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e=Math.imul(e,16777619)>>>0;return e===0?1:e}function Yr(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}class Kr extends st{constructor(e,n,i,s,r){super(e,n,i,{navOptions:[],title:"NAVIGATION",onComplete:r}),this.heldKeys=new Set,this.lastViewport={top:0,left:0,width:80,height:24};let o=null,a=null;s instanceof URLSearchParams?(o=s.get("type"),a=s.get("difficulty")):(o=s.type??null,a=s.difficulty??null),this.eventType=o??"asteroid_belt",this.difficulty=a??"normal";const l=Wr(i.destinationId??"");this.rand=Yr(l);const p=D().miniGames.navigation.difficulties[this.difficulty].targetDistance;this.state={playerWorldX:0,playerWorldY:0,playerVelX:0,playerVelY:0,cameraScrollY:0,obstacles:[],spawnFrontierY:p,lastEdgeSpawnFrame:0,frameCount:0,completed:!1,collisionFlashEndTime:0,outcome:"idle"}}handleAction(e){if(super.handleAction(e),e==="MENU"){this.state.completed||(this.state.completed=!0,this.complete({outcome:"skipped"}));return}(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&this.heldKeys.add(e)}update(e){if(super.update(e),this.state.completed)return;const n=e/1e3,s=D().miniGames.navigation,r=s.difficulties[this.difficulty],o=s.ship;this.updateInput(o),this.updatePosition(n,r),this.spawnObstacles(this.lastViewport,r,s),this.updateObstacles(n,r,this.lastViewport),this.checkCollisions(this.lastViewport),this.checkVictory(r),this.state.frameCount++}updateInput(e){const n=e.accelerationImpulse,i=e.maxSpeedLateral,s=e.maxSpeedForward;this.heldKeys.has("LEFT")&&(this.state.playerVelX>0&&(this.state.playerVelX=0),this.state.playerVelX-=n),this.heldKeys.has("RIGHT")&&(this.state.playerVelX<0&&(this.state.playerVelX=0),this.state.playerVelX+=n),this.heldKeys.has("UP")&&(this.state.playerVelY<0&&(this.state.playerVelY=0),this.state.playerVelY+=n),this.heldKeys.has("DOWN")&&(this.state.playerVelY-=n),this.state.playerVelX=Math.max(-i,Math.min(i,this.state.playerVelX)),this.state.playerVelY=Math.max(-s,Math.min(s,this.state.playerVelY)),this.heldKeys.clear()}updatePosition(e,n){const i=n.minScrollSpeed,r=D().miniGames.navigation.ship.playerRowPreference,o=Math.max(this.state.playerVelY,i);this.state.playerWorldX+=this.state.playerVelX*e,this.state.playerWorldY+=o*e;const{height:a}=this.lastViewport,l=this.state.playerWorldY-a*r;this.state.cameraScrollY=Math.max(this.state.cameraScrollY,l)}spawnObstacles(e,n,i){const{width:s,height:r}=e,o=n.obstacleDensity,a=n.edgeSpawnIntervalFrames,l=n.driftSpeedMax,c=i.eventTypes[this.eventType],h=r,d=this.state.spawnFrontierY,p=d+h,m=this.state.cameraScrollY+r;if(d<m){this.state.spawnFrontierY+=h;let f=0;for(const b of this.state.obstacles){const S=b.worldY+5;b.worldY<p&&S>d&&f++}const y=Math.ceil(o*h);for(;f<y;)this.spawnObstacleInBand(d,p,s,n,c,l),f++}if(this.state.frameCount-this.state.lastEdgeSpawnFrame>=a){this.state.lastEdgeSpawnFrame=this.state.frameCount;const f=this.rand()<.5?"left":"right",y=this.state.playerWorldY+(this.rand()-.5)*20;this.spawnObstacleAtEdge(f,y,s,n,c,l)}}spawnObstacleInBand(e,n,i,s,r,o){const a=this.pickSize(r),l=this.createObstacle(a,s,o);l.worldY=e+this.rand()*(n-e),l.worldX=Math.max(0,Math.min(i-2,this.rand()*i)),this.state.obstacles.push(l)}spawnObstacleAtEdge(e,n,i,s,r,o){const a=this.pickSize(r),l=this.createObstacle(a,s,o);l.worldY=n,e==="left"?(l.worldX=-10,l.driftVx=o*(.3+.4*this.rand())):(l.worldX=i+5,l.driftVx=-o*(.3+.4*this.rand())),this.state.obstacles.push(l)}pickSize(e){const n=this.rand();return n<e.large_ratio?"large":n<e.large_ratio+e.medium_ratio?"medium":"small"}createObstacle(e,n,i){const s=this.getObstacleCells(e);return{worldX:0,worldY:0,driftVx:0,driftVy:-Math.max(.1,i*(.3+.7*this.rand())),cells:s,size:e}}getObstacleCells(e){const n=this.getObstacleChars();if(e==="large")return this.eventType==="asteroid_belt"?[{dcol:0,drow:0,char:"#",color:"white"},{dcol:1,drow:0,char:"@",color:"white"},{dcol:2,drow:0,char:"O",color:"white"},{dcol:1,drow:1,char:"#",color:"white"},{dcol:0,drow:2,char:"@",color:"white"},{dcol:1,drow:2,char:"#",color:"white"},{dcol:2,drow:2,char:"O",color:"white"}]:this.eventType==="space_debris"?[{dcol:0,drow:0,char:"=",color:"bright-black"},{dcol:1,drow:0,char:"-",color:"bright-black"},{dcol:2,drow:0,char:"[",color:"bright-black"},{dcol:3,drow:0,char:"]",color:"bright-black"},{dcol:0,drow:1,char:"[",color:"bright-black"},{dcol:1,drow:1,char:"=",color:"bright-black"},{dcol:2,drow:1,char:"-",color:"bright-black"},{dcol:3,drow:1,char:"]",color:"bright-black"}]:[{dcol:0,drow:0,char:".",color:"cyan"},{dcol:2,drow:0,char:"'",color:"cyan"},{dcol:4,drow:0,char:"`",color:"cyan"},{dcol:1,drow:2,char:",",color:"cyan"},{dcol:3,drow:2,char:".",color:"cyan"}];if(e==="medium"){const i=n.medium;return[{dcol:0,drow:0,char:i[0],color:n.mediumColor},{dcol:1,drow:0,char:i[1],color:n.mediumColor},{dcol:0,drow:1,char:i[2],color:n.mediumColor},{dcol:1,drow:1,char:i[3],color:n.mediumColor}]}else return[{dcol:0,drow:0,char:n.small[0],color:n.smallColor}]}getObstacleChars(){return this.eventType==="asteroid_belt"?{medium:["o","*","@","o"],mediumColor:"bright-white",small:["o","*","@"],smallColor:"bright-white"}:this.eventType==="space_debris"?{medium:["+","=","-","/"],mediumColor:"bright-black",small:["+","=","-","/","\\"],smallColor:"bright-black"}:{medium:[".","'","`",","],mediumColor:"cyan",small:[".","'","`",","],smallColor:"cyan"}}updateObstacles(e,n,i){const{height:s}=i;for(const r of this.state.obstacles)r.worldX+=r.driftVx*e,r.worldY+=r.driftVy*e;this.state.obstacles=this.state.obstacles.filter(r=>r.worldY+5>this.state.cameraScrollY-5)}checkCollisions(e){if(this.state.outcome==="collision")return;const n=Math.round(this.state.playerWorldX),i=Math.round(this.state.playerWorldY-this.state.cameraScrollY);if(!(i<=e.top))for(const s of this.state.obstacles)for(const r of s.cells){const o=Math.round(s.worldX+r.dcol),a=Math.round(s.worldY+r.drow-this.state.cameraScrollY);if(!(a<=e.top)&&o===n&&a===i){this.triggerCollision();return}}}triggerCollision(){this.state.completed||(this.state.outcome="collision",this.state.collisionFlashEndTime=performance.now()+400)}checkVictory(e){if(!this.state.completed)if(this.state.playerWorldY>=e.targetDistance){if(this.state.outcome==="collision")return;this.state.outcome="victory",this.state.completed=!0,setTimeout(()=>{this.complete({outcome:"completed",result:{score:100}})},500)}else this.state.outcome==="collision"&&performance.now()>this.state.collisionFlashEndTime&&(this.state.completed=!0,this.complete({outcome:"completed",result:{score:0}}))}checkOutOfBounds(e){if(this.state.completed)return;const n=Math.round(this.state.playerWorldY-this.state.cameraScrollY),i=e.top+e.height-1;n>i&&this.triggerCollision()}renderGame(e,n){this.lastViewport=n;const{top:i,left:s,width:r,height:o}=n;for(let c=i;c<i+o;c++)if(c>=0&&c<e.length)for(let h=s;h<s+r;h++)h>=0&&h<e[c].length&&(e[c][h]={char:" ",fg:"white",bg:"black"});this.drawHud(e,n);for(const c of this.state.obstacles)for(const h of c.cells){const d=s+Math.round(c.worldX+h.dcol),p=i+Math.round(c.worldY+h.drow-this.state.cameraScrollY);p>i&&p>=i&&p<i+o&&d>=s&&d<s+r&&p<e.length&&d<e[p].length&&(e[p][d]={char:h.char,fg:h.color,bg:"black"})}const a=s+Math.round(this.state.playerWorldX),l=i+Math.round(this.state.playerWorldY-this.state.cameraScrollY);if(l>=i&&l<i+o&&a>=s&&a<s+r&&l<e.length&&a<e[l].length){const h=this.state.outcome==="collision"&&Math.floor((performance.now()-(this.state.collisionFlashEndTime-400))/100)%2===0?"bright-red":"bright-green";e[l][a]={char:"^",fg:h,bg:"black"}}}drawHud(e,n){const{top:i,left:s,width:r}=n,c=D().miniGames.navigation.difficulties[this.difficulty].targetDistance,h=this.state.playerWorldY,d=Math.min(1,Math.max(0,h/c)),p=20,u=Math.round(p*d);let m="";for(let b=0;b<u;b++)m+="█";for(let b=u;b<p;b++)m+="░";const f=Math.round(h).toString(),y=`DIST [${m}] ${f}u`;if(i<e.length){let b=s;for(const S of y)b<s+r&&b<e[i].length&&(e[i][b]={char:S,fg:"bright-yellow",bg:"black"}),b++}}}const je=[{id:"docking",name:"Docking Mini-Game",description:"Align the ship crosshair with the airlock target before countdown expires",variants:[{id:"orbital",label:"Orbital Station",params:{locationType:"orbital"}},{id:"deep-space",label:"Deep Space",params:{locationType:"deep-space"}}]},{id:"surface-landing",name:"Planet Landing",description:"Counter gravity and air resistance to land gently on the marked pad",variants:[{id:"surface",label:"Planet Surface",params:{locationType:"surface"}}]},{id:"asteroid-landing",name:"Asteroid Landing",description:"Navigate freely with no gravity to land on the marked pad",variants:[{id:"asteroid",label:"Asteroid Surface",params:{locationType:"asteroid"}}]},{id:"navigation",name:"Space Navigation",description:"Pilot your ship through obstacles with momentum controls",variants:[{id:"asteroid_belt",label:"Asteroid Belt",params:{type:"asteroid_belt",difficulty:"normal"}},{id:"space_debris",label:"Space Debris",params:{type:"space_debris",difficulty:"normal"}},{id:"space_storm",label:"Space Storm",params:{type:"space_storm",difficulty:"normal"}}]}],jr=[{meta:je[0],factory:(t,e,n,i,s)=>new Nr(t,e,n,s)},{meta:je[1],factory:(t,e,n,i,s)=>new Ur(t,e,n,s)},{meta:je[2],factory:(t,e,n,i,s)=>new $r(t,e,n,s)},{meta:je[3],factory:(t,e,n,i,s)=>new Kr(t,e,n,i,s)}];function Vr(t){let e=t>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function qr(t,e){return Math.floor(t()*e)}function Re(t,e){return e[qr(t,e.length)]}function ti(t,e){const{special:n,firstNames:i,lastNames:s}=e.npcNames;if(t()<D().npc.specialNameChance&&n.length>0)return{giverName:Re(t,n)};const r=i.length>0?Re(t,i):"Unknown",o=s.length>0?Re(t,s):"Agent";return{giverName:`${r} ${o}`}}function zr(t,e){return e.destinations.filter(n=>n.id!==t.id)}function Xr(t){return t.commodities.filter(e=>e.legal)}function Qr(t,e){const n=e.reduce((s,r)=>s+r.weightKg,0);if(n===0)return e[0];let i=t()*n;for(const s of e)if(i-=s.weightKg,i<0)return s;return e[e.length-1]}function Sn(t,e,n,i){var y;const s=n.deliveryItems;if(s.length===0)return null;const r=zr(e,n);if(r.length===0)return null;const o=Qr(t,s),a=Re(t,r),l=ti(t,n),{deliveryBaseReward:c,deliveryRandomReward:h,deliveryDepositFraction:d}=D().missions,p=Math.floor(o.weightKg*1.5),u=c+p+Math.floor(t()*h),m=Math.floor(u*d),f=e.owningFactionId?(y=L().factions.find(b=>b.id===e.owningFactionId&&me(b)))==null?void 0:y.id:void 0;return{...l,giverFactionId:f,id:i,type:"delivery",title:o.name,description:`A package needs transporting. Pick up the ${o.name} from ${e.name} and deliver it to ${a.name}. Handle with care.`,reward:u,issuingDestinationId:e.id,itemName:o.name,itemWeightKg:o.weightKg,pickupDestinationId:e.id,deliveryDestinationId:a.id,deposit:m}}function Mn(t,e,n,i){var G;const s=Xr(n);if(s.length===0)return null;const r=te(e.system),o=[],a=[];for(const x of s)(r?Je(x.id,r):1)>1&&a.push(x),o.push(x);const l=a.length>0?a:s;for(const x of l)o.push(x);const{supplyRequirementsMin:c,supplyRequirementsMax:h,supplyQtyMin:d,supplyQtyMax:p}=D().missions,u=c+Math.floor(t()*(h-c+1)),m=[],f=new Set;for(let x=0;x<u;x++){let R=0;for(;R<10;){const E=Re(t,o);if(!f.has(E.id)){f.add(E.id);const A=d+Math.floor(t()*(p-d+1));m.push({commodityId:E.id,qty:A});break}R++}}if(m.length===0)return null;const y=m.reduce((x,R)=>{const E=n.commodities.find(A=>A.id===R.commodityId);return x+((E==null?void 0:E.basePrice)??100)*R.qty},0),b=m.reduce((x,R)=>{const E=n.commodities.find(A=>A.id===R.commodityId);return x+((E==null?void 0:E.weightKg)??1)*R.qty},0),{supplyRewardMultiplierMin:S,supplyRewardMultiplierMax:_}=D().missions,M=Math.min(1,b/500),w=t(),C=w+M*(1-w)*.15,v=S+C*(_-S),k=Math.floor(y*v),O=ti(t,n),Y=m.map(x=>{const R=n.commodities.find(E=>E.id===x.commodityId);return`${x.qty}× ${(R==null?void 0:R.name)??x.commodityId}`}).join(", "),P=e.owningFactionId?(G=L().factions.find(x=>x.id===e.owningFactionId&&me(x)))==null?void 0:G.id:void 0;return{...O,giverFactionId:P,id:i,type:"supply",title:e.name,description:`${e.name} needs supplies. Deliver ${Y} to fulfil the contract.`,reward:k,issuingDestinationId:e.id,requirements:m,deliveryDestinationId:e.id}}function Jr(t){let e=0;for(let n=0;n<t.length;n++)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}function Zr(t,e,n){const i=D();let s;{const c=i.missions.missionTtlMs,h=Date.now(),d=Math.floor(h/c);s=Jr(t.id)^d}const r=Vr(s),{boardMaxCount:o,deliveryChance:a}=i.missions,l=[];for(let c=0;c<t.minMissions&&l.length<o;c++){const h=`m-${(s>>>0).toString(16)}-${l.length}`,p=r()<a?Sn(r,t,e,h):Mn(r,t,e,h);p&&l.push(p)}for(;l.length<o&&r()<t.missionChance;){const c=`m-${(s>>>0).toString(16)}-${l.length}`,d=r()<a?Sn(r,t,e,c):Mn(r,t,e,c);d&&l.push(d)}return l}const eo=100,to={orbital:"docking","deep-space":"docking",surface:"surface-landing",asteroid:"asteroid-landing"};function no(t,e,n){if(t.outcome==="skipped")return{damageFraction:n.abandonDamageFraction*e,score:null};const i=t.result.score;return i>=n.noDamageThreshold?{damageFraction:0,score:i}:{damageFraction:n.maxHullDamageFraction*(1-i/n.noDamageThreshold)*e,score:i}}function io(t,e){const n=t==="docking";return e===null?"ABORTED":e<40?n?"COLLISION":"CRASH":e<70?n?"ROUGH DOCK":"HARD LANDING":e<90?n?"DOCKED":"LANDED":n?"PERFECT DOCK":"PERFECT LANDING"}function Ve(t,e,n){return Math.max(e,Math.min(n,t))}function so(t,e,n,i){const{stockCountMin:s,stockCountMax:r,stockQtyMin:o,stockQtyMax:a,stockRepCountBonusPerLevel:l,stockRepCountBonusMin:c,stockRepCountBonusMax:h,stockRepQtyBonusPerLevel:d,stockRepQtyBonusMin:p,stockRepQtyBonusMax:u}=n.trading,m=Ve(e*l,c,h),f=Ve(e*d,p,u),y=t.length,b=Ve(s+m,1,y),S=Ve(r+m,1,y),_=b+Math.floor(Math.random()*(S-b+1)),M=[];if(i)for(const x of t){const E=1/Je(x.id,i),A=Math.ceil(E*10);for(let T=0;T<A;T++)M.push(x)}else M.push(...t);const w=[...M];for(let x=w.length-1;x>0;x--){const R=Math.floor(Math.random()*(x+1));[w[x],w[R]]=[w[R],w[x]]}const C=o+f,v=a+f,k=t.map(x=>Math.log(x.basePrice*x.weightKg)),O=Math.min(...k),P=Math.max(...k)-O,G=new Map;for(const x of w.slice(0,_)){if(G.has(x.id))continue;const R=C+Math.floor(Math.random()*(v-C+1));let E=1;P>0&&(E=1.5-(Math.log(x.basePrice*x.weightKg)-O)/P);const A=i?Je(x.id,i):1;G.set(x.id,{commodityId:x.id,qty:Math.max(1,Math.floor(R*E)),effectiveFactor:A})}return Array.from(G.values())}class ro{constructor(e,n,i){this.sceneBeforeMenu=null,this.traderStockCache=new Map,this.renderer=e,this.input=n,this.context=i;const s=qn(),r=qe(s.startingShip);this.player=new Lt({shipId:s.startingShip,driveId:r.defaultJumpDrive,credits:s.player.startingCredits,systemId:s.startingLocation.system,destinationId:s.startingLocation.destination}),this.currentScene=new Kt(this.input,this.context,this.player,()=>this.goToStory())}tick(e){const n=Math.min(e,eo),i=this.makeBuffer();this.currentScene.update(n),this.currentScene.render(i),this.renderer.drawBuffer(i)}makeBuffer(){const e=this.renderer.getWidth(),n=this.renderer.getHeight();return Array.from({length:n},()=>Array.from({length:e},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(e,n){const i=Date.now(),s=this.traderStockCache.get(e),r=D();if(s&&s.repLevel===n&&i-s.generatedAt<r.trading.stockTtlMs)return s.entries;const o=N(e),a=o?te(o.system):void 0,l=so(ns(),n,r,a);return this.traderStockCache.set(e,{entries:l,generatedAt:i,repLevel:n}),l}refreshDestinationMissions(e){const n=N(e),i=L(),s=Zr(n,i);this.player.refreshDestinationMissions(e,s)}onBuy(e,n,i,s){if(n<=0)return;const r=s.findIndex(h=>h.commodityId===e);if(r<0)return;const o=s[r];if(n>o.qty)return;const a=de(e);if(!a)return;const l=n*i;this.player.credits<l||this.player.cargoWeightKg+n*a.weightKg>this.player.cargoCapacity||(this.player.spendCredits(l),this.player.addCargo(e,n),o.qty-=n,o.qty<=0&&s.splice(r,1))}onSell(e,n,i,s){if(n<=0)return;const r=this.player.cargoHold.find(c=>c.commodityId===e);if(!r||r.qty<n||!de(e))return;const a=n*i;this.player.addCredits(a),this.player.removeCargo(e,n);const l=s.find(c=>c.commodityId===e);l?l.qty+=n:s.push({commodityId:e,qty:n})}goToMainMenu(){this.currentScene=new Kt(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new _s(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){const e=this.player.destinationId;this.refreshDestinationMissions(e),this.currentScene=new vs(this.input,this.context,this.player,e,(n,i)=>{this.player.spendCredits(n),this.player.addFuel(i),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToLandOrDock(){const e=N(this.player.destinationId),n=e==null?void 0:e.locationType,i=n?to[n]:void 0,s=i?jr.find(r=>r.meta.id===i):void 0;if(i&&s){const r=(e==null?void 0:e.difficultyMultiplier)??1,o=D();this.currentScene=s.factory(this.input,this.context,this.player,{},a=>{const{damageFraction:l,score:c}=no(a,r,o.miniGames);l>0&&this.player.applyHullDamage(l);const h=io(i,c);this.currentScene=new Lr(this.input,this.player,this.context,h,c,l,()=>this.goToStation())})}else n==="surface"?this.currentScene=new wr(this.player,this.context,()=>this.goToStation()):n==="asteroid"?this.currentScene=new xr(this.player,this.context,()=>this.goToStation()):this.currentScene=new Ar(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var n;const e=(n=N(this.player.destinationId))==null?void 0:n.locationType;e==="surface"?this.currentScene=new Tr(this.player,this.context,()=>this.goToShip()):e==="asteroid"?this.currentScene=new Mr(this.player,this.context,()=>this.goToShip()):this.currentScene=new Er(this.player,this.context,()=>this.goToShip())}goToTrader(){const e=this.player.destinationId,n=N(e);let i=0;if(n.owningFactionId){const r=zn(n.owningFactionId);if(r&&me(r)){const o=D(),a=this.player.getFactionReputation(n.owningFactionId);i=Ee(a,o)}}const s=this.getOrCreateTraderStock(e,i);this.currentScene=new ws(this.input,this.context,this.player,e,s,(r,o,a)=>this.onBuy(r,o,a,s),(r,o,a)=>this.onSell(r,o,a,s),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionBoard(){const e=this.player.destinationId,n=this.player.getDestinationMissions(e);this.currentScene=new ye(this.input,this.context,this.player,e,n,i=>this.goToMissionDetail(i,e),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionDetail(e,n){this.currentScene=new Ts(this.input,this.context,this.player,e,i=>this.onMissionAccepted(e,i,n),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock())}onMissionAccepted(e,n,i){const s=this.player.getDestinationMissions(i),r=s.findIndex(o=>o.id===e.id);r>=0&&(s.splice(r,1),this.player.refreshDestinationMissions(i,s)),this.player.acceptMission(e,n),this.goToMissionBoard()}goToShip(){this.currentScene=new nr(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo(),()=>this.goToGlobalMenu())}goToCargo(){this.currentScene=new ir(this.input,this.context,this.player,()=>this.goToShip(),()=>this.goToGlobalMenu())}buildMenuEntries(){return[{label:"MISSIONS",action:()=>this.goToMissionLog()},{label:"GALAXY MAP",action:()=>this.goToGalaxyMapFromMenu()},{label:"REPUTATION",action:()=>this.goToReputation()}]}goToMissionLog(){this.currentScene=new us(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToReputation(){this.currentScene=new ys(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToGlobalMenuFromSubScene(){this.currentScene=new Vt(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}goToGlobalMenu(){this.sceneBeforeMenu=this.currentScene,"suspend"in this.currentScene&&this.currentScene.suspend(),this.currentScene=new Vt(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}returnFromMenu(){const e=this.sceneBeforeMenu;this.sceneBeforeMenu=null,e!==null?("resume"in e&&e.resume(),this.currentScene=e):this.goToShip()}goToTravelMenu(){this.currentScene=new hn(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu(),()=>this.goToEmergencyRescue())}goToArrival(){this.currentScene=new hn(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu(),()=>this.goToEmergencyRescue())}goToGalaxyMap(){this.currentScene=new fn(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToGlobalMenu())}goToGalaxyMapFromMenu(){this.currentScene=new fn(this.input,this.context,this.player,()=>this.goToGlobalMenu(),()=>this.goToGlobalMenu(),()=>this.returnFromMenu())}goToFlyIntoSpace(){const e=this.player.getInSystemHopCost();this.player.consumeFuel(e),this.player.undock(),this.currentScene=new _t(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(e){const n=this.player.getInSystemHopCost();this.player.consumeFuel(n),this.player.dock(e),this.currentScene=new _t(this.player,this.context,()=>this.goToShip())}onJumpSelected(e){const n=ze(this.player.systemId,e),i=Vn(this.player.driveId),s=Math.ceil(D().fuel.consumptionPerLy*n.distance*i.fuelEfficiency);this.player.consumeFuel(s),this.player.jumpTo(e),this.currentScene=new _r(this.player,this.context,()=>this.goToArrival())}goToEmergencyRescue(){this.currentScene=new sr(this.input,this.context,this.player,e=>this.onEmergencyTow(e),()=>this.onEmergencyFuelDrop(),()=>this.goToTravelMenu())}onEmergencyTow(e){const n=D();this.player.spendCredits(n.emergencyRescue.towFee),this.player.dock(e),this.currentScene=new _t(this.player,this.context,()=>this.goToShip())}onEmergencyFuelDrop(){const e=D();this.player.spendCredits(e.emergencyRescue.fuelDropFee),this.player.addFuel(e.emergencyRescue.fuelDropLitres),this.goToTravelMenu()}}const oo=`---
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
`,ao=`---
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
`,lo=`---
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
`,co=`---
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
`,ho=`---
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
`,uo=`---
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
`,po=`---
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
`,mo=`---
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
`,fo=`---
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
`,go=`---
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
`,yo=`---
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
`,_o=`---
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
`,bo=`---
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
`,vo=`---
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
`,wo=`---
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
`,ko=`---
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
`,xo=`---
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
`,Co=`---
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
`,To=`---
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
`,So=`---
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
`,Mo=`---
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
`,Io=`---
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
`,Ao=`---
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
`,Ro=`---
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
`,Eo=`---
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
`,Fo=`---
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
`,Lo=`---
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
`,Do=`---
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
`,Oo=`---
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
`,No=`---
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
`,Po=`---
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
`,Ho=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,Bo=`---
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
`,Uo=`---
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
`,Go=`---
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
    acceleration_impulse: 0.4
    max_speed_lateral: 2.0
    max_speed_forward: 3.0
    player_row_preference: 0.67
    top_buffer_rows: 4
  difficulties:
    easy:
      base_scroll_speed: 0.3
      min_scroll_speed: 0.2
      obstacle_density: 0.5
      edge_spawn_interval_frames: 120
      drift_speed_max: 0.2
      target_distance: 300
    normal:
      base_scroll_speed: 0.5
      min_scroll_speed: 0.35
      obstacle_density: 0.8
      edge_spawn_interval_frames: 80
      drift_speed_max: 0.4
      target_distance: 400
    hard:
      base_scroll_speed: 0.8
      min_scroll_speed: 0.55
      obstacle_density: 1.3
      edge_spawn_interval_frames: 50
      drift_speed_max: 0.7
      target_distance: 500
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
`,$o=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,Wo=`---
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
`,Yo=`---
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

Long range engines for faster than light travel between systems.`,Ko=`---
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
`,jo=`---
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
`,Vo=`---
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
`,qo=`---
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
`,zo=`---
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
`,Xo=`---
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
`,Qo=`---
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
`,Jo=`---
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
`,Zo=`---
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
`,ea=`---
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
`,ta=`---
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
`,na=`---
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
`,ia=`---
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
`,sa=`---
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
`,ra=`---
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
`,oa=`---
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
`;var H={},De={},V={};function ni(t){return typeof t>"u"||t===null}function aa(t){return typeof t=="object"&&t!==null}function la(t){return Array.isArray(t)?t:ni(t)?[]:[t]}function ca(t,e){var n,i,s,r;if(e)for(r=Object.keys(e),n=0,i=r.length;n<i;n+=1)s=r[n],t[s]=e[s];return t}function ha(t,e){var n="",i;for(i=0;i<e;i+=1)n+=t;return n}function da(t){return t===0&&Number.NEGATIVE_INFINITY===1/t}V.isNothing=ni;V.isObject=aa;V.toArray=la;V.repeat=ha;V.isNegativeZero=da;V.extend=ca;function Fe(t,e){Error.call(this),this.name="YAMLException",this.reason=t,this.mark=e,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}Fe.prototype=Object.create(Error.prototype);Fe.prototype.constructor=Fe;Fe.prototype.toString=function(e){var n=this.name+": ";return n+=this.reason||"(unknown reason)",!e&&this.mark&&(n+=" "+this.mark.toString()),n};var Oe=Fe,In=V;function Dt(t,e,n,i,s){this.name=t,this.buffer=e,this.position=n,this.line=i,this.column=s}Dt.prototype.getSnippet=function(e,n){var i,s,r,o,a;if(!this.buffer)return null;for(e=e||4,n=n||75,i="",s=this.position;s>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s-1))===-1;)if(s-=1,this.position-s>n/2-1){i=" ... ",s+=5;break}for(r="",o=this.position;o<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(o))===-1;)if(o+=1,o-this.position>n/2-1){r=" ... ",o-=5;break}return a=this.buffer.slice(s,o),In.repeat(" ",e)+i+a+r+`
`+In.repeat(" ",e+this.position-s+i.length)+"^"};Dt.prototype.toString=function(e){var n,i="";return this.name&&(i+='in "'+this.name+'" '),i+="at line "+(this.line+1)+", column "+(this.column+1),e||(n=this.getSnippet(),n&&(i+=`:
`+n)),i};var ua=Dt,An=Oe,pa=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],ma=["scalar","sequence","mapping"];function fa(t){var e={};return t!==null&&Object.keys(t).forEach(function(n){t[n].forEach(function(i){e[String(i)]=n})}),e}function ga(t,e){if(e=e||{},Object.keys(e).forEach(function(n){if(pa.indexOf(n)===-1)throw new An('Unknown option "'+n+'" is met in definition of "'+t+'" YAML type.')}),this.tag=t,this.kind=e.kind||null,this.resolve=e.resolve||function(){return!0},this.construct=e.construct||function(n){return n},this.instanceOf=e.instanceOf||null,this.predicate=e.predicate||null,this.represent=e.represent||null,this.defaultStyle=e.defaultStyle||null,this.styleAliases=fa(e.styleAliases||null),ma.indexOf(this.kind)===-1)throw new An('Unknown kind "'+this.kind+'" is specified for "'+t+'" YAML type.')}var U=ga,Rn=V,Xe=Oe,ya=U;function St(t,e,n){var i=[];return t.include.forEach(function(s){n=St(s,e,n)}),t[e].forEach(function(s){n.forEach(function(r,o){r.tag===s.tag&&r.kind===s.kind&&i.push(o)}),n.push(s)}),n.filter(function(s,r){return i.indexOf(r)===-1})}function _a(){var t={scalar:{},sequence:{},mapping:{},fallback:{}},e,n;function i(s){t[s.kind][s.tag]=t.fallback[s.tag]=s}for(e=0,n=arguments.length;e<n;e+=1)arguments[e].forEach(i);return t}function _e(t){this.include=t.include||[],this.implicit=t.implicit||[],this.explicit=t.explicit||[],this.implicit.forEach(function(e){if(e.loadKind&&e.loadKind!=="scalar")throw new Xe("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=St(this,"implicit",[]),this.compiledExplicit=St(this,"explicit",[]),this.compiledTypeMap=_a(this.compiledImplicit,this.compiledExplicit)}_e.DEFAULT=null;_e.create=function(){var e,n;switch(arguments.length){case 1:e=_e.DEFAULT,n=arguments[0];break;case 2:e=arguments[0],n=arguments[1];break;default:throw new Xe("Wrong number of arguments for Schema.create function")}if(e=Rn.toArray(e),n=Rn.toArray(n),!e.every(function(i){return i instanceof _e}))throw new Xe("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!n.every(function(i){return i instanceof ya}))throw new Xe("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new _e({include:e,explicit:n})};var xe=_e,ba=U,va=new ba("tag:yaml.org,2002:str",{kind:"scalar",construct:function(t){return t!==null?t:""}}),wa=U,ka=new wa("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(t){return t!==null?t:[]}}),xa=U,Ca=new xa("tag:yaml.org,2002:map",{kind:"mapping",construct:function(t){return t!==null?t:{}}}),Ta=xe,Ot=new Ta({explicit:[va,ka,Ca]}),Sa=U;function Ma(t){if(t===null)return!0;var e=t.length;return e===1&&t==="~"||e===4&&(t==="null"||t==="Null"||t==="NULL")}function Ia(){return null}function Aa(t){return t===null}var Ra=new Sa("tag:yaml.org,2002:null",{kind:"scalar",resolve:Ma,construct:Ia,predicate:Aa,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Ea=U;function Fa(t){if(t===null)return!1;var e=t.length;return e===4&&(t==="true"||t==="True"||t==="TRUE")||e===5&&(t==="false"||t==="False"||t==="FALSE")}function La(t){return t==="true"||t==="True"||t==="TRUE"}function Da(t){return Object.prototype.toString.call(t)==="[object Boolean]"}var Oa=new Ea("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Fa,construct:La,predicate:Da,represent:{lowercase:function(t){return t?"true":"false"},uppercase:function(t){return t?"TRUE":"FALSE"},camelcase:function(t){return t?"True":"False"}},defaultStyle:"lowercase"}),Na=V,Pa=U;function Ha(t){return 48<=t&&t<=57||65<=t&&t<=70||97<=t&&t<=102}function Ba(t){return 48<=t&&t<=55}function Ua(t){return 48<=t&&t<=57}function Ga(t){if(t===null)return!1;var e=t.length,n=0,i=!1,s;if(!e)return!1;if(s=t[n],(s==="-"||s==="+")&&(s=t[++n]),s==="0"){if(n+1===e)return!0;if(s=t[++n],s==="b"){for(n++;n<e;n++)if(s=t[n],s!=="_"){if(s!=="0"&&s!=="1")return!1;i=!0}return i&&s!=="_"}if(s==="x"){for(n++;n<e;n++)if(s=t[n],s!=="_"){if(!Ha(t.charCodeAt(n)))return!1;i=!0}return i&&s!=="_"}for(;n<e;n++)if(s=t[n],s!=="_"){if(!Ba(t.charCodeAt(n)))return!1;i=!0}return i&&s!=="_"}if(s==="_")return!1;for(;n<e;n++)if(s=t[n],s!=="_"){if(s===":")break;if(!Ua(t.charCodeAt(n)))return!1;i=!0}return!i||s==="_"?!1:s!==":"?!0:/^(:[0-5]?[0-9])+$/.test(t.slice(n))}function $a(t){var e=t,n=1,i,s,r=[];return e.indexOf("_")!==-1&&(e=e.replace(/_/g,"")),i=e[0],(i==="-"||i==="+")&&(i==="-"&&(n=-1),e=e.slice(1),i=e[0]),e==="0"?0:i==="0"?e[1]==="b"?n*parseInt(e.slice(2),2):e[1]==="x"?n*parseInt(e,16):n*parseInt(e,8):e.indexOf(":")!==-1?(e.split(":").forEach(function(o){r.unshift(parseInt(o,10))}),e=0,s=1,r.forEach(function(o){e+=o*s,s*=60}),n*e):n*parseInt(e,10)}function Wa(t){return Object.prototype.toString.call(t)==="[object Number]"&&t%1===0&&!Na.isNegativeZero(t)}var Ya=new Pa("tag:yaml.org,2002:int",{kind:"scalar",resolve:Ga,construct:$a,predicate:Wa,represent:{binary:function(t){return t>=0?"0b"+t.toString(2):"-0b"+t.toString(2).slice(1)},octal:function(t){return t>=0?"0"+t.toString(8):"-0"+t.toString(8).slice(1)},decimal:function(t){return t.toString(10)},hexadecimal:function(t){return t>=0?"0x"+t.toString(16).toUpperCase():"-0x"+t.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),ii=V,Ka=U,ja=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Va(t){return!(t===null||!ja.test(t)||t[t.length-1]==="_")}function qa(t){var e,n,i,s;return e=t.replace(/_/g,"").toLowerCase(),n=e[0]==="-"?-1:1,s=[],"+-".indexOf(e[0])>=0&&(e=e.slice(1)),e===".inf"?n===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:e===".nan"?NaN:e.indexOf(":")>=0?(e.split(":").forEach(function(r){s.unshift(parseFloat(r,10))}),e=0,i=1,s.forEach(function(r){e+=r*i,i*=60}),n*e):n*parseFloat(e,10)}var za=/^[-+]?[0-9]+e/;function Xa(t,e){var n;if(isNaN(t))switch(e){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===t)switch(e){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===t)switch(e){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(ii.isNegativeZero(t))return"-0.0";return n=t.toString(10),za.test(n)?n.replace("e",".e"):n}function Qa(t){return Object.prototype.toString.call(t)==="[object Number]"&&(t%1!==0||ii.isNegativeZero(t))}var Ja=new Ka("tag:yaml.org,2002:float",{kind:"scalar",resolve:Va,construct:qa,predicate:Qa,represent:Xa,defaultStyle:"lowercase"}),Za=xe,si=new Za({include:[Ot],implicit:[Ra,Oa,Ya,Ja]}),el=xe,ri=new el({include:[si]}),tl=U,oi=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),ai=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function nl(t){return t===null?!1:oi.exec(t)!==null||ai.exec(t)!==null}function il(t){var e,n,i,s,r,o,a,l=0,c=null,h,d,p;if(e=oi.exec(t),e===null&&(e=ai.exec(t)),e===null)throw new Error("Date resolve error");if(n=+e[1],i=+e[2]-1,s=+e[3],!e[4])return new Date(Date.UTC(n,i,s));if(r=+e[4],o=+e[5],a=+e[6],e[7]){for(l=e[7].slice(0,3);l.length<3;)l+="0";l=+l}return e[9]&&(h=+e[10],d=+(e[11]||0),c=(h*60+d)*6e4,e[9]==="-"&&(c=-c)),p=new Date(Date.UTC(n,i,s,r,o,a,l)),c&&p.setTime(p.getTime()-c),p}function sl(t){return t.toISOString()}var rl=new tl("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:nl,construct:il,instanceOf:Date,represent:sl}),ol=U;function al(t){return t==="<<"||t===null}var ll=new ol("tag:yaml.org,2002:merge",{kind:"scalar",resolve:al});function li(t){throw new Error('Could not dynamically require "'+t+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var ce;try{var cl=li;ce=cl("buffer").Buffer}catch{}var hl=U,Nt=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function dl(t){if(t===null)return!1;var e,n,i=0,s=t.length,r=Nt;for(n=0;n<s;n++)if(e=r.indexOf(t.charAt(n)),!(e>64)){if(e<0)return!1;i+=6}return i%8===0}function ul(t){var e,n,i=t.replace(/[\r\n=]/g,""),s=i.length,r=Nt,o=0,a=[];for(e=0;e<s;e++)e%4===0&&e&&(a.push(o>>16&255),a.push(o>>8&255),a.push(o&255)),o=o<<6|r.indexOf(i.charAt(e));return n=s%4*6,n===0?(a.push(o>>16&255),a.push(o>>8&255),a.push(o&255)):n===18?(a.push(o>>10&255),a.push(o>>2&255)):n===12&&a.push(o>>4&255),ce?ce.from?ce.from(a):new ce(a):a}function pl(t){var e="",n=0,i,s,r=t.length,o=Nt;for(i=0;i<r;i++)i%3===0&&i&&(e+=o[n>>18&63],e+=o[n>>12&63],e+=o[n>>6&63],e+=o[n&63]),n=(n<<8)+t[i];return s=r%3,s===0?(e+=o[n>>18&63],e+=o[n>>12&63],e+=o[n>>6&63],e+=o[n&63]):s===2?(e+=o[n>>10&63],e+=o[n>>4&63],e+=o[n<<2&63],e+=o[64]):s===1&&(e+=o[n>>2&63],e+=o[n<<4&63],e+=o[64],e+=o[64]),e}function ml(t){return ce&&ce.isBuffer(t)}var fl=new hl("tag:yaml.org,2002:binary",{kind:"scalar",resolve:dl,construct:ul,predicate:ml,represent:pl}),gl=U,yl=Object.prototype.hasOwnProperty,_l=Object.prototype.toString;function bl(t){if(t===null)return!0;var e=[],n,i,s,r,o,a=t;for(n=0,i=a.length;n<i;n+=1){if(s=a[n],o=!1,_l.call(s)!=="[object Object]")return!1;for(r in s)if(yl.call(s,r))if(!o)o=!0;else return!1;if(!o)return!1;if(e.indexOf(r)===-1)e.push(r);else return!1}return!0}function vl(t){return t!==null?t:[]}var wl=new gl("tag:yaml.org,2002:omap",{kind:"sequence",resolve:bl,construct:vl}),kl=U,xl=Object.prototype.toString;function Cl(t){if(t===null)return!0;var e,n,i,s,r,o=t;for(r=new Array(o.length),e=0,n=o.length;e<n;e+=1){if(i=o[e],xl.call(i)!=="[object Object]"||(s=Object.keys(i),s.length!==1))return!1;r[e]=[s[0],i[s[0]]]}return!0}function Tl(t){if(t===null)return[];var e,n,i,s,r,o=t;for(r=new Array(o.length),e=0,n=o.length;e<n;e+=1)i=o[e],s=Object.keys(i),r[e]=[s[0],i[s[0]]];return r}var Sl=new kl("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Cl,construct:Tl}),Ml=U,Il=Object.prototype.hasOwnProperty;function Al(t){if(t===null)return!0;var e,n=t;for(e in n)if(Il.call(n,e)&&n[e]!==null)return!1;return!0}function Rl(t){return t!==null?t:{}}var El=new Ml("tag:yaml.org,2002:set",{kind:"mapping",resolve:Al,construct:Rl}),Fl=xe,Ne=new Fl({include:[ri],implicit:[rl,ll],explicit:[fl,wl,Sl,El]}),Ll=U;function Dl(){return!0}function Ol(){}function Nl(){return""}function Pl(t){return typeof t>"u"}var Hl=new Ll("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:Dl,construct:Ol,predicate:Pl,represent:Nl}),Bl=U;function Ul(t){if(t===null||t.length===0)return!1;var e=t,n=/\/([gim]*)$/.exec(t),i="";return!(e[0]==="/"&&(n&&(i=n[1]),i.length>3||e[e.length-i.length-1]!=="/"))}function Gl(t){var e=t,n=/\/([gim]*)$/.exec(t),i="";return e[0]==="/"&&(n&&(i=n[1]),e=e.slice(1,e.length-i.length-1)),new RegExp(e,i)}function $l(t){var e="/"+t.source+"/";return t.global&&(e+="g"),t.multiline&&(e+="m"),t.ignoreCase&&(e+="i"),e}function Wl(t){return Object.prototype.toString.call(t)==="[object RegExp]"}var Yl=new Bl("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:Ul,construct:Gl,predicate:Wl,represent:$l}),Ze;try{var Kl=li;Ze=Kl("esprima")}catch{typeof window<"u"&&(Ze=window.esprima)}var jl=U;function Vl(t){if(t===null)return!1;try{var e="("+t+")",n=Ze.parse(e,{range:!0});return!(n.type!=="Program"||n.body.length!==1||n.body[0].type!=="ExpressionStatement"||n.body[0].expression.type!=="ArrowFunctionExpression"&&n.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function ql(t){var e="("+t+")",n=Ze.parse(e,{range:!0}),i=[],s;if(n.type!=="Program"||n.body.length!==1||n.body[0].type!=="ExpressionStatement"||n.body[0].expression.type!=="ArrowFunctionExpression"&&n.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return n.body[0].expression.params.forEach(function(r){i.push(r.name)}),s=n.body[0].expression.body.range,n.body[0].expression.body.type==="BlockStatement"?new Function(i,e.slice(s[0]+1,s[1]-1)):new Function(i,"return "+e.slice(s[0],s[1]))}function zl(t){return t.toString()}function Xl(t){return Object.prototype.toString.call(t)==="[object Function]"}var Ql=new jl("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:Vl,construct:ql,predicate:Xl,represent:zl}),En=xe,rt=En.DEFAULT=new En({include:[Ne],explicit:[Hl,Yl,Ql]}),ee=V,ci=Oe,Jl=ua,hi=Ne,Zl=rt,oe=Object.prototype.hasOwnProperty,et=1,di=2,ui=3,tt=4,wt=1,ec=2,Fn=3,tc=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,nc=/[\x85\u2028\u2029]/,ic=/[,\[\]\{\}]/,pi=/^(?:!|!!|![a-z\-]+!)$/i,mi=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function Ln(t){return Object.prototype.toString.call(t)}function z(t){return t===10||t===13}function he(t){return t===9||t===32}function j(t){return t===9||t===32||t===10||t===13}function be(t){return t===44||t===91||t===93||t===123||t===125}function sc(t){var e;return 48<=t&&t<=57?t-48:(e=t|32,97<=e&&e<=102?e-97+10:-1)}function rc(t){return t===120?2:t===117?4:t===85?8:0}function oc(t){return 48<=t&&t<=57?t-48:-1}function Dn(t){return t===48?"\0":t===97?"\x07":t===98?"\b":t===116||t===9?"	":t===110?`
`:t===118?"\v":t===102?"\f":t===114?"\r":t===101?"\x1B":t===32?" ":t===34?'"':t===47?"/":t===92?"\\":t===78?"":t===95?" ":t===76?"\u2028":t===80?"\u2029":""}function ac(t){return t<=65535?String.fromCharCode(t):String.fromCharCode((t-65536>>10)+55296,(t-65536&1023)+56320)}function fi(t,e,n){e==="__proto__"?Object.defineProperty(t,e,{configurable:!0,enumerable:!0,writable:!0,value:n}):t[e]=n}var gi=new Array(256),yi=new Array(256);for(var fe=0;fe<256;fe++)gi[fe]=Dn(fe)?1:0,yi[fe]=Dn(fe);function lc(t,e){this.input=t,this.filename=e.filename||null,this.schema=e.schema||Zl,this.onWarning=e.onWarning||null,this.legacy=e.legacy||!1,this.json=e.json||!1,this.listener=e.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=t.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function _i(t,e){return new ci(e,new Jl(t.filename,t.input,t.position,t.line,t.position-t.lineStart))}function I(t,e){throw _i(t,e)}function nt(t,e){t.onWarning&&t.onWarning.call(null,_i(t,e))}var On={YAML:function(e,n,i){var s,r,o;e.version!==null&&I(e,"duplication of %YAML directive"),i.length!==1&&I(e,"YAML directive accepts exactly one argument"),s=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),s===null&&I(e,"ill-formed argument of the YAML directive"),r=parseInt(s[1],10),o=parseInt(s[2],10),r!==1&&I(e,"unacceptable YAML version of the document"),e.version=i[0],e.checkLineBreaks=o<2,o!==1&&o!==2&&nt(e,"unsupported YAML version of the document")},TAG:function(e,n,i){var s,r;i.length!==2&&I(e,"TAG directive accepts exactly two arguments"),s=i[0],r=i[1],pi.test(s)||I(e,"ill-formed tag handle (first argument) of the TAG directive"),oe.call(e.tagMap,s)&&I(e,'there is a previously declared suffix for "'+s+'" tag handle'),mi.test(r)||I(e,"ill-formed tag prefix (second argument) of the TAG directive"),e.tagMap[s]=r}};function re(t,e,n,i){var s,r,o,a;if(e<n){if(a=t.input.slice(e,n),i)for(s=0,r=a.length;s<r;s+=1)o=a.charCodeAt(s),o===9||32<=o&&o<=1114111||I(t,"expected valid JSON character");else tc.test(a)&&I(t,"the stream contains non-printable characters");t.result+=a}}function Nn(t,e,n,i){var s,r,o,a;for(ee.isObject(n)||I(t,"cannot merge mappings; the provided source object is unacceptable"),s=Object.keys(n),o=0,a=s.length;o<a;o+=1)r=s[o],oe.call(e,r)||(fi(e,r,n[r]),i[r]=!0)}function ve(t,e,n,i,s,r,o,a){var l,c;if(Array.isArray(s))for(s=Array.prototype.slice.call(s),l=0,c=s.length;l<c;l+=1)Array.isArray(s[l])&&I(t,"nested arrays are not supported inside keys"),typeof s=="object"&&Ln(s[l])==="[object Object]"&&(s[l]="[object Object]");if(typeof s=="object"&&Ln(s)==="[object Object]"&&(s="[object Object]"),s=String(s),e===null&&(e={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(r))for(l=0,c=r.length;l<c;l+=1)Nn(t,e,r[l],n);else Nn(t,e,r,n);else!t.json&&!oe.call(n,s)&&oe.call(e,s)&&(t.line=o||t.line,t.position=a||t.position,I(t,"duplicated mapping key")),fi(e,s,r),delete n[s];return e}function Pt(t){var e;e=t.input.charCodeAt(t.position),e===10?t.position++:e===13?(t.position++,t.input.charCodeAt(t.position)===10&&t.position++):I(t,"a line break is expected"),t.line+=1,t.lineStart=t.position}function B(t,e,n){for(var i=0,s=t.input.charCodeAt(t.position);s!==0;){for(;he(s);)s=t.input.charCodeAt(++t.position);if(e&&s===35)do s=t.input.charCodeAt(++t.position);while(s!==10&&s!==13&&s!==0);if(z(s))for(Pt(t),s=t.input.charCodeAt(t.position),i++,t.lineIndent=0;s===32;)t.lineIndent++,s=t.input.charCodeAt(++t.position);else break}return n!==-1&&i!==0&&t.lineIndent<n&&nt(t,"deficient indentation"),i}function ot(t){var e=t.position,n;return n=t.input.charCodeAt(e),!!((n===45||n===46)&&n===t.input.charCodeAt(e+1)&&n===t.input.charCodeAt(e+2)&&(e+=3,n=t.input.charCodeAt(e),n===0||j(n)))}function Ht(t,e){e===1?t.result+=" ":e>1&&(t.result+=ee.repeat(`
`,e-1))}function cc(t,e,n){var i,s,r,o,a,l,c,h,d=t.kind,p=t.result,u;if(u=t.input.charCodeAt(t.position),j(u)||be(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(s=t.input.charCodeAt(t.position+1),j(s)||n&&be(s)))return!1;for(t.kind="scalar",t.result="",r=o=t.position,a=!1;u!==0;){if(u===58){if(s=t.input.charCodeAt(t.position+1),j(s)||n&&be(s))break}else if(u===35){if(i=t.input.charCodeAt(t.position-1),j(i))break}else{if(t.position===t.lineStart&&ot(t)||n&&be(u))break;if(z(u))if(l=t.line,c=t.lineStart,h=t.lineIndent,B(t,!1,-1),t.lineIndent>=e){a=!0,u=t.input.charCodeAt(t.position);continue}else{t.position=o,t.line=l,t.lineStart=c,t.lineIndent=h;break}}a&&(re(t,r,o,!1),Ht(t,t.line-l),r=o=t.position,a=!1),he(u)||(o=t.position+1),u=t.input.charCodeAt(++t.position)}return re(t,r,o,!1),t.result?!0:(t.kind=d,t.result=p,!1)}function hc(t,e){var n,i,s;if(n=t.input.charCodeAt(t.position),n!==39)return!1;for(t.kind="scalar",t.result="",t.position++,i=s=t.position;(n=t.input.charCodeAt(t.position))!==0;)if(n===39)if(re(t,i,t.position,!0),n=t.input.charCodeAt(++t.position),n===39)i=t.position,t.position++,s=t.position;else return!0;else z(n)?(re(t,i,s,!0),Ht(t,B(t,!1,e)),i=s=t.position):t.position===t.lineStart&&ot(t)?I(t,"unexpected end of the document within a single quoted scalar"):(t.position++,s=t.position);I(t,"unexpected end of the stream within a single quoted scalar")}function dc(t,e){var n,i,s,r,o,a;if(a=t.input.charCodeAt(t.position),a!==34)return!1;for(t.kind="scalar",t.result="",t.position++,n=i=t.position;(a=t.input.charCodeAt(t.position))!==0;){if(a===34)return re(t,n,t.position,!0),t.position++,!0;if(a===92){if(re(t,n,t.position,!0),a=t.input.charCodeAt(++t.position),z(a))B(t,!1,e);else if(a<256&&gi[a])t.result+=yi[a],t.position++;else if((o=rc(a))>0){for(s=o,r=0;s>0;s--)a=t.input.charCodeAt(++t.position),(o=sc(a))>=0?r=(r<<4)+o:I(t,"expected hexadecimal character");t.result+=ac(r),t.position++}else I(t,"unknown escape sequence");n=i=t.position}else z(a)?(re(t,n,i,!0),Ht(t,B(t,!1,e)),n=i=t.position):t.position===t.lineStart&&ot(t)?I(t,"unexpected end of the document within a double quoted scalar"):(t.position++,i=t.position)}I(t,"unexpected end of the stream within a double quoted scalar")}function uc(t,e){var n=!0,i,s=t.tag,r,o=t.anchor,a,l,c,h,d,p={},u,m,f,y;if(y=t.input.charCodeAt(t.position),y===91)l=93,d=!1,r=[];else if(y===123)l=125,d=!0,r={};else return!1;for(t.anchor!==null&&(t.anchorMap[t.anchor]=r),y=t.input.charCodeAt(++t.position);y!==0;){if(B(t,!0,e),y=t.input.charCodeAt(t.position),y===l)return t.position++,t.tag=s,t.anchor=o,t.kind=d?"mapping":"sequence",t.result=r,!0;n||I(t,"missed comma between flow collection entries"),m=u=f=null,c=h=!1,y===63&&(a=t.input.charCodeAt(t.position+1),j(a)&&(c=h=!0,t.position++,B(t,!0,e))),i=t.line,we(t,e,et,!1,!0),m=t.tag,u=t.result,B(t,!0,e),y=t.input.charCodeAt(t.position),(h||t.line===i)&&y===58&&(c=!0,y=t.input.charCodeAt(++t.position),B(t,!0,e),we(t,e,et,!1,!0),f=t.result),d?ve(t,r,p,m,u,f):c?r.push(ve(t,null,p,m,u,f)):r.push(u),B(t,!0,e),y=t.input.charCodeAt(t.position),y===44?(n=!0,y=t.input.charCodeAt(++t.position)):n=!1}I(t,"unexpected end of the stream within a flow collection")}function pc(t,e){var n,i,s=wt,r=!1,o=!1,a=e,l=0,c=!1,h,d;if(d=t.input.charCodeAt(t.position),d===124)i=!1;else if(d===62)i=!0;else return!1;for(t.kind="scalar",t.result="";d!==0;)if(d=t.input.charCodeAt(++t.position),d===43||d===45)wt===s?s=d===43?Fn:ec:I(t,"repeat of a chomping mode identifier");else if((h=oc(d))>=0)h===0?I(t,"bad explicit indentation width of a block scalar; it cannot be less than one"):o?I(t,"repeat of an indentation width identifier"):(a=e+h-1,o=!0);else break;if(he(d)){do d=t.input.charCodeAt(++t.position);while(he(d));if(d===35)do d=t.input.charCodeAt(++t.position);while(!z(d)&&d!==0)}for(;d!==0;){for(Pt(t),t.lineIndent=0,d=t.input.charCodeAt(t.position);(!o||t.lineIndent<a)&&d===32;)t.lineIndent++,d=t.input.charCodeAt(++t.position);if(!o&&t.lineIndent>a&&(a=t.lineIndent),z(d)){l++;continue}if(t.lineIndent<a){s===Fn?t.result+=ee.repeat(`
`,r?1+l:l):s===wt&&r&&(t.result+=`
`);break}for(i?he(d)?(c=!0,t.result+=ee.repeat(`
`,r?1+l:l)):c?(c=!1,t.result+=ee.repeat(`
`,l+1)):l===0?r&&(t.result+=" "):t.result+=ee.repeat(`
`,l):t.result+=ee.repeat(`
`,r?1+l:l),r=!0,o=!0,l=0,n=t.position;!z(d)&&d!==0;)d=t.input.charCodeAt(++t.position);re(t,n,t.position,!1)}return!0}function Pn(t,e){var n,i=t.tag,s=t.anchor,r=[],o,a=!1,l;for(t.anchor!==null&&(t.anchorMap[t.anchor]=r),l=t.input.charCodeAt(t.position);l!==0&&!(l!==45||(o=t.input.charCodeAt(t.position+1),!j(o)));){if(a=!0,t.position++,B(t,!0,-1)&&t.lineIndent<=e){r.push(null),l=t.input.charCodeAt(t.position);continue}if(n=t.line,we(t,e,ui,!1,!0),r.push(t.result),B(t,!0,-1),l=t.input.charCodeAt(t.position),(t.line===n||t.lineIndent>e)&&l!==0)I(t,"bad indentation of a sequence entry");else if(t.lineIndent<e)break}return a?(t.tag=i,t.anchor=s,t.kind="sequence",t.result=r,!0):!1}function mc(t,e,n){var i,s,r,o,a=t.tag,l=t.anchor,c={},h={},d=null,p=null,u=null,m=!1,f=!1,y;for(t.anchor!==null&&(t.anchorMap[t.anchor]=c),y=t.input.charCodeAt(t.position);y!==0;){if(i=t.input.charCodeAt(t.position+1),r=t.line,o=t.position,(y===63||y===58)&&j(i))y===63?(m&&(ve(t,c,h,d,p,null),d=p=u=null),f=!0,m=!0,s=!0):m?(m=!1,s=!0):I(t,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),t.position+=1,y=i;else if(we(t,n,di,!1,!0))if(t.line===r){for(y=t.input.charCodeAt(t.position);he(y);)y=t.input.charCodeAt(++t.position);if(y===58)y=t.input.charCodeAt(++t.position),j(y)||I(t,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(ve(t,c,h,d,p,null),d=p=u=null),f=!0,m=!1,s=!1,d=t.tag,p=t.result;else if(f)I(t,"can not read an implicit mapping pair; a colon is missed");else return t.tag=a,t.anchor=l,!0}else if(f)I(t,"can not read a block mapping entry; a multiline key may not be an implicit key");else return t.tag=a,t.anchor=l,!0;else break;if((t.line===r||t.lineIndent>e)&&(we(t,e,tt,!0,s)&&(m?p=t.result:u=t.result),m||(ve(t,c,h,d,p,u,r,o),d=p=u=null),B(t,!0,-1),y=t.input.charCodeAt(t.position)),t.lineIndent>e&&y!==0)I(t,"bad indentation of a mapping entry");else if(t.lineIndent<e)break}return m&&ve(t,c,h,d,p,null),f&&(t.tag=a,t.anchor=l,t.kind="mapping",t.result=c),f}function fc(t){var e,n=!1,i=!1,s,r,o;if(o=t.input.charCodeAt(t.position),o!==33)return!1;if(t.tag!==null&&I(t,"duplication of a tag property"),o=t.input.charCodeAt(++t.position),o===60?(n=!0,o=t.input.charCodeAt(++t.position)):o===33?(i=!0,s="!!",o=t.input.charCodeAt(++t.position)):s="!",e=t.position,n){do o=t.input.charCodeAt(++t.position);while(o!==0&&o!==62);t.position<t.length?(r=t.input.slice(e,t.position),o=t.input.charCodeAt(++t.position)):I(t,"unexpected end of the stream within a verbatim tag")}else{for(;o!==0&&!j(o);)o===33&&(i?I(t,"tag suffix cannot contain exclamation marks"):(s=t.input.slice(e-1,t.position+1),pi.test(s)||I(t,"named tag handle cannot contain such characters"),i=!0,e=t.position+1)),o=t.input.charCodeAt(++t.position);r=t.input.slice(e,t.position),ic.test(r)&&I(t,"tag suffix cannot contain flow indicator characters")}return r&&!mi.test(r)&&I(t,"tag name cannot contain such characters: "+r),n?t.tag=r:oe.call(t.tagMap,s)?t.tag=t.tagMap[s]+r:s==="!"?t.tag="!"+r:s==="!!"?t.tag="tag:yaml.org,2002:"+r:I(t,'undeclared tag handle "'+s+'"'),!0}function gc(t){var e,n;if(n=t.input.charCodeAt(t.position),n!==38)return!1;for(t.anchor!==null&&I(t,"duplication of an anchor property"),n=t.input.charCodeAt(++t.position),e=t.position;n!==0&&!j(n)&&!be(n);)n=t.input.charCodeAt(++t.position);return t.position===e&&I(t,"name of an anchor node must contain at least one character"),t.anchor=t.input.slice(e,t.position),!0}function yc(t){var e,n,i;if(i=t.input.charCodeAt(t.position),i!==42)return!1;for(i=t.input.charCodeAt(++t.position),e=t.position;i!==0&&!j(i)&&!be(i);)i=t.input.charCodeAt(++t.position);return t.position===e&&I(t,"name of an alias node must contain at least one character"),n=t.input.slice(e,t.position),oe.call(t.anchorMap,n)||I(t,'unidentified alias "'+n+'"'),t.result=t.anchorMap[n],B(t,!0,-1),!0}function we(t,e,n,i,s){var r,o,a,l=1,c=!1,h=!1,d,p,u,m,f;if(t.listener!==null&&t.listener("open",t),t.tag=null,t.anchor=null,t.kind=null,t.result=null,r=o=a=tt===n||ui===n,i&&B(t,!0,-1)&&(c=!0,t.lineIndent>e?l=1:t.lineIndent===e?l=0:t.lineIndent<e&&(l=-1)),l===1)for(;fc(t)||gc(t);)B(t,!0,-1)?(c=!0,a=r,t.lineIndent>e?l=1:t.lineIndent===e?l=0:t.lineIndent<e&&(l=-1)):a=!1;if(a&&(a=c||s),(l===1||tt===n)&&(et===n||di===n?m=e:m=e+1,f=t.position-t.lineStart,l===1?a&&(Pn(t,f)||mc(t,f,m))||uc(t,m)?h=!0:(o&&pc(t,m)||hc(t,m)||dc(t,m)?h=!0:yc(t)?(h=!0,(t.tag!==null||t.anchor!==null)&&I(t,"alias node should not have any properties")):cc(t,m,et===n)&&(h=!0,t.tag===null&&(t.tag="?")),t.anchor!==null&&(t.anchorMap[t.anchor]=t.result)):l===0&&(h=a&&Pn(t,f))),t.tag!==null&&t.tag!=="!")if(t.tag==="?"){for(t.result!==null&&t.kind!=="scalar"&&I(t,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+t.kind+'"'),d=0,p=t.implicitTypes.length;d<p;d+=1)if(u=t.implicitTypes[d],u.resolve(t.result)){t.result=u.construct(t.result),t.tag=u.tag,t.anchor!==null&&(t.anchorMap[t.anchor]=t.result);break}}else oe.call(t.typeMap[t.kind||"fallback"],t.tag)?(u=t.typeMap[t.kind||"fallback"][t.tag],t.result!==null&&u.kind!==t.kind&&I(t,"unacceptable node kind for !<"+t.tag+'> tag; it should be "'+u.kind+'", not "'+t.kind+'"'),u.resolve(t.result)?(t.result=u.construct(t.result),t.anchor!==null&&(t.anchorMap[t.anchor]=t.result)):I(t,"cannot resolve a node with !<"+t.tag+"> explicit tag")):I(t,"unknown tag !<"+t.tag+">");return t.listener!==null&&t.listener("close",t),t.tag!==null||t.anchor!==null||h}function _c(t){var e=t.position,n,i,s,r=!1,o;for(t.version=null,t.checkLineBreaks=t.legacy,t.tagMap={},t.anchorMap={};(o=t.input.charCodeAt(t.position))!==0&&(B(t,!0,-1),o=t.input.charCodeAt(t.position),!(t.lineIndent>0||o!==37));){for(r=!0,o=t.input.charCodeAt(++t.position),n=t.position;o!==0&&!j(o);)o=t.input.charCodeAt(++t.position);for(i=t.input.slice(n,t.position),s=[],i.length<1&&I(t,"directive name must not be less than one character in length");o!==0;){for(;he(o);)o=t.input.charCodeAt(++t.position);if(o===35){do o=t.input.charCodeAt(++t.position);while(o!==0&&!z(o));break}if(z(o))break;for(n=t.position;o!==0&&!j(o);)o=t.input.charCodeAt(++t.position);s.push(t.input.slice(n,t.position))}o!==0&&Pt(t),oe.call(On,i)?On[i](t,i,s):nt(t,'unknown document directive "'+i+'"')}if(B(t,!0,-1),t.lineIndent===0&&t.input.charCodeAt(t.position)===45&&t.input.charCodeAt(t.position+1)===45&&t.input.charCodeAt(t.position+2)===45?(t.position+=3,B(t,!0,-1)):r&&I(t,"directives end mark is expected"),we(t,t.lineIndent-1,tt,!1,!0),B(t,!0,-1),t.checkLineBreaks&&nc.test(t.input.slice(e,t.position))&&nt(t,"non-ASCII line breaks are interpreted as content"),t.documents.push(t.result),t.position===t.lineStart&&ot(t)){t.input.charCodeAt(t.position)===46&&(t.position+=3,B(t,!0,-1));return}if(t.position<t.length-1)I(t,"end of the stream or a document separator is expected");else return}function bi(t,e){t=String(t),e=e||{},t.length!==0&&(t.charCodeAt(t.length-1)!==10&&t.charCodeAt(t.length-1)!==13&&(t+=`
`),t.charCodeAt(0)===65279&&(t=t.slice(1)));var n=new lc(t,e),i=t.indexOf("\0");for(i!==-1&&(n.position=i,I(n,"null byte is not allowed in input")),n.input+="\0";n.input.charCodeAt(n.position)===32;)n.lineIndent+=1,n.position+=1;for(;n.position<n.length-1;)_c(n);return n.documents}function vi(t,e,n){e!==null&&typeof e=="object"&&typeof n>"u"&&(n=e,e=null);var i=bi(t,n);if(typeof e!="function")return i;for(var s=0,r=i.length;s<r;s+=1)e(i[s])}function wi(t,e){var n=bi(t,e);if(n.length!==0){if(n.length===1)return n[0];throw new ci("expected a single document in the stream, but found more")}}function bc(t,e,n){return typeof e=="object"&&e!==null&&typeof n>"u"&&(n=e,e=null),vi(t,e,ee.extend({schema:hi},n))}function vc(t,e){return wi(t,ee.extend({schema:hi},e))}De.loadAll=vi;De.load=wi;De.safeLoadAll=bc;De.safeLoad=vc;var Bt={},Pe=V,He=Oe,wc=rt,kc=Ne,ki=Object.prototype.toString,xi=Object.prototype.hasOwnProperty,xc=9,Le=10,Cc=13,Tc=32,Sc=33,Mc=34,Ci=35,Ic=37,Ac=38,Rc=39,Ec=42,Ti=44,Fc=45,Si=58,Lc=61,Dc=62,Oc=63,Nc=64,Mi=91,Ii=93,Pc=96,Ai=123,Hc=124,Ri=125,$={};$[0]="\\0";$[7]="\\a";$[8]="\\b";$[9]="\\t";$[10]="\\n";$[11]="\\v";$[12]="\\f";$[13]="\\r";$[27]="\\e";$[34]='\\"';$[92]="\\\\";$[133]="\\N";$[160]="\\_";$[8232]="\\L";$[8233]="\\P";var Bc=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function Uc(t,e){var n,i,s,r,o,a,l;if(e===null)return{};for(n={},i=Object.keys(e),s=0,r=i.length;s<r;s+=1)o=i[s],a=String(e[o]),o.slice(0,2)==="!!"&&(o="tag:yaml.org,2002:"+o.slice(2)),l=t.compiledTypeMap.fallback[o],l&&xi.call(l.styleAliases,a)&&(a=l.styleAliases[a]),n[o]=a;return n}function Hn(t){var e,n,i;if(e=t.toString(16).toUpperCase(),t<=255)n="x",i=2;else if(t<=65535)n="u",i=4;else if(t<=4294967295)n="U",i=8;else throw new He("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+n+Pe.repeat("0",i-e.length)+e}function Gc(t){this.schema=t.schema||wc,this.indent=Math.max(1,t.indent||2),this.noArrayIndent=t.noArrayIndent||!1,this.skipInvalid=t.skipInvalid||!1,this.flowLevel=Pe.isNothing(t.flowLevel)?-1:t.flowLevel,this.styleMap=Uc(this.schema,t.styles||null),this.sortKeys=t.sortKeys||!1,this.lineWidth=t.lineWidth||80,this.noRefs=t.noRefs||!1,this.noCompatMode=t.noCompatMode||!1,this.condenseFlow=t.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function Bn(t,e){for(var n=Pe.repeat(" ",e),i=0,s=-1,r="",o,a=t.length;i<a;)s=t.indexOf(`
`,i),s===-1?(o=t.slice(i),i=a):(o=t.slice(i,s+1),i=s+1),o.length&&o!==`
`&&(r+=n),r+=o;return r}function Mt(t,e){return`
`+Pe.repeat(" ",t.indent*e)}function $c(t,e){var n,i,s;for(n=0,i=t.implicitTypes.length;n<i;n+=1)if(s=t.implicitTypes[n],s.resolve(e))return!0;return!1}function Ut(t){return t===Tc||t===xc}function ke(t){return 32<=t&&t<=126||161<=t&&t<=55295&&t!==8232&&t!==8233||57344<=t&&t<=65533&&t!==65279||65536<=t&&t<=1114111}function Wc(t){return ke(t)&&!Ut(t)&&t!==65279&&t!==Cc&&t!==Le}function Un(t,e){return ke(t)&&t!==65279&&t!==Ti&&t!==Mi&&t!==Ii&&t!==Ai&&t!==Ri&&t!==Si&&(t!==Ci||e&&Wc(e))}function Yc(t){return ke(t)&&t!==65279&&!Ut(t)&&t!==Fc&&t!==Oc&&t!==Si&&t!==Ti&&t!==Mi&&t!==Ii&&t!==Ai&&t!==Ri&&t!==Ci&&t!==Ac&&t!==Ec&&t!==Sc&&t!==Hc&&t!==Lc&&t!==Dc&&t!==Rc&&t!==Mc&&t!==Ic&&t!==Nc&&t!==Pc}function Ei(t){var e=/^\n* /;return e.test(t)}var Fi=1,Li=2,Di=3,Oi=4,Qe=5;function Kc(t,e,n,i,s){var r,o,a,l=!1,c=!1,h=i!==-1,d=-1,p=Yc(t.charCodeAt(0))&&!Ut(t.charCodeAt(t.length-1));if(e)for(r=0;r<t.length;r++){if(o=t.charCodeAt(r),!ke(o))return Qe;a=r>0?t.charCodeAt(r-1):null,p=p&&Un(o,a)}else{for(r=0;r<t.length;r++){if(o=t.charCodeAt(r),o===Le)l=!0,h&&(c=c||r-d-1>i&&t[d+1]!==" ",d=r);else if(!ke(o))return Qe;a=r>0?t.charCodeAt(r-1):null,p=p&&Un(o,a)}c=c||h&&r-d-1>i&&t[d+1]!==" "}return!l&&!c?p&&!s(t)?Fi:Li:n>9&&Ei(t)?Qe:c?Oi:Di}function jc(t,e,n,i){t.dump=function(){if(e.length===0)return"''";if(!t.noCompatMode&&Bc.indexOf(e)!==-1)return"'"+e+"'";var s=t.indent*Math.max(1,n),r=t.lineWidth===-1?-1:Math.max(Math.min(t.lineWidth,40),t.lineWidth-s),o=i||t.flowLevel>-1&&n>=t.flowLevel;function a(l){return $c(t,l)}switch(Kc(e,o,t.indent,r,a)){case Fi:return e;case Li:return"'"+e.replace(/'/g,"''")+"'";case Di:return"|"+Gn(e,t.indent)+$n(Bn(e,s));case Oi:return">"+Gn(e,t.indent)+$n(Bn(Vc(e,r),s));case Qe:return'"'+qc(e)+'"';default:throw new He("impossible error: invalid scalar style")}}()}function Gn(t,e){var n=Ei(t)?String(e):"",i=t[t.length-1]===`
`,s=i&&(t[t.length-2]===`
`||t===`
`),r=s?"+":i?"":"-";return n+r+`
`}function $n(t){return t[t.length-1]===`
`?t.slice(0,-1):t}function Vc(t,e){for(var n=/(\n+)([^\n]*)/g,i=function(){var c=t.indexOf(`
`);return c=c!==-1?c:t.length,n.lastIndex=c,Wn(t.slice(0,c),e)}(),s=t[0]===`
`||t[0]===" ",r,o;o=n.exec(t);){var a=o[1],l=o[2];r=l[0]===" ",i+=a+(!s&&!r&&l!==""?`
`:"")+Wn(l,e),s=r}return i}function Wn(t,e){if(t===""||t[0]===" ")return t;for(var n=/ [^ ]/g,i,s=0,r,o=0,a=0,l="";i=n.exec(t);)a=i.index,a-s>e&&(r=o>s?o:a,l+=`
`+t.slice(s,r),s=r+1),o=a;return l+=`
`,t.length-s>e&&o>s?l+=t.slice(s,o)+`
`+t.slice(o+1):l+=t.slice(s),l.slice(1)}function qc(t){for(var e="",n,i,s,r=0;r<t.length;r++){if(n=t.charCodeAt(r),n>=55296&&n<=56319&&(i=t.charCodeAt(r+1),i>=56320&&i<=57343)){e+=Hn((n-55296)*1024+i-56320+65536),r++;continue}s=$[n],e+=!s&&ke(n)?t[r]:s||Hn(n)}return e}function zc(t,e,n){var i="",s=t.tag,r,o;for(r=0,o=n.length;r<o;r+=1)ue(t,e,n[r],!1,!1)&&(r!==0&&(i+=","+(t.condenseFlow?"":" ")),i+=t.dump);t.tag=s,t.dump="["+i+"]"}function Xc(t,e,n,i){var s="",r=t.tag,o,a;for(o=0,a=n.length;o<a;o+=1)ue(t,e+1,n[o],!0,!0)&&((!i||o!==0)&&(s+=Mt(t,e)),t.dump&&Le===t.dump.charCodeAt(0)?s+="-":s+="- ",s+=t.dump);t.tag=r,t.dump=s||"[]"}function Qc(t,e,n){var i="",s=t.tag,r=Object.keys(n),o,a,l,c,h;for(o=0,a=r.length;o<a;o+=1)h="",o!==0&&(h+=", "),t.condenseFlow&&(h+='"'),l=r[o],c=n[l],ue(t,e,l,!1,!1)&&(t.dump.length>1024&&(h+="? "),h+=t.dump+(t.condenseFlow?'"':"")+":"+(t.condenseFlow?"":" "),ue(t,e,c,!1,!1)&&(h+=t.dump,i+=h));t.tag=s,t.dump="{"+i+"}"}function Jc(t,e,n,i){var s="",r=t.tag,o=Object.keys(n),a,l,c,h,d,p;if(t.sortKeys===!0)o.sort();else if(typeof t.sortKeys=="function")o.sort(t.sortKeys);else if(t.sortKeys)throw new He("sortKeys must be a boolean or a function");for(a=0,l=o.length;a<l;a+=1)p="",(!i||a!==0)&&(p+=Mt(t,e)),c=o[a],h=n[c],ue(t,e+1,c,!0,!0,!0)&&(d=t.tag!==null&&t.tag!=="?"||t.dump&&t.dump.length>1024,d&&(t.dump&&Le===t.dump.charCodeAt(0)?p+="?":p+="? "),p+=t.dump,d&&(p+=Mt(t,e)),ue(t,e+1,h,!0,d)&&(t.dump&&Le===t.dump.charCodeAt(0)?p+=":":p+=": ",p+=t.dump,s+=p));t.tag=r,t.dump=s||"{}"}function Yn(t,e,n){var i,s,r,o,a,l;for(s=n?t.explicitTypes:t.implicitTypes,r=0,o=s.length;r<o;r+=1)if(a=s[r],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof e=="object"&&e instanceof a.instanceOf)&&(!a.predicate||a.predicate(e))){if(t.tag=n?a.tag:"?",a.represent){if(l=t.styleMap[a.tag]||a.defaultStyle,ki.call(a.represent)==="[object Function]")i=a.represent(e,l);else if(xi.call(a.represent,l))i=a.represent[l](e,l);else throw new He("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');t.dump=i}return!0}return!1}function ue(t,e,n,i,s,r){t.tag=null,t.dump=n,Yn(t,n,!1)||Yn(t,n,!0);var o=ki.call(t.dump);i&&(i=t.flowLevel<0||t.flowLevel>e);var a=o==="[object Object]"||o==="[object Array]",l,c;if(a&&(l=t.duplicates.indexOf(n),c=l!==-1),(t.tag!==null&&t.tag!=="?"||c||t.indent!==2&&e>0)&&(s=!1),c&&t.usedDuplicates[l])t.dump="*ref_"+l;else{if(a&&c&&!t.usedDuplicates[l]&&(t.usedDuplicates[l]=!0),o==="[object Object]")i&&Object.keys(t.dump).length!==0?(Jc(t,e,t.dump,s),c&&(t.dump="&ref_"+l+t.dump)):(Qc(t,e,t.dump),c&&(t.dump="&ref_"+l+" "+t.dump));else if(o==="[object Array]"){var h=t.noArrayIndent&&e>0?e-1:e;i&&t.dump.length!==0?(Xc(t,h,t.dump,s),c&&(t.dump="&ref_"+l+t.dump)):(zc(t,h,t.dump),c&&(t.dump="&ref_"+l+" "+t.dump))}else if(o==="[object String]")t.tag!=="?"&&jc(t,t.dump,e,r);else{if(t.skipInvalid)return!1;throw new He("unacceptable kind of an object to dump "+o)}t.tag!==null&&t.tag!=="?"&&(t.dump="!<"+t.tag+"> "+t.dump)}return!0}function Zc(t,e){var n=[],i=[],s,r;for(It(t,n,i),s=0,r=i.length;s<r;s+=1)e.duplicates.push(n[i[s]]);e.usedDuplicates=new Array(r)}function It(t,e,n){var i,s,r;if(t!==null&&typeof t=="object")if(s=e.indexOf(t),s!==-1)n.indexOf(s)===-1&&n.push(s);else if(e.push(t),Array.isArray(t))for(s=0,r=t.length;s<r;s+=1)It(t[s],e,n);else for(i=Object.keys(t),s=0,r=i.length;s<r;s+=1)It(t[i[s]],e,n)}function Ni(t,e){e=e||{};var n=new Gc(e);return n.noRefs||Zc(t,n),ue(n,0,t,!0,!0)?n.dump+`
`:""}function eh(t,e){return Ni(t,Pe.extend({schema:kc},e))}Bt.dump=Ni;Bt.safeDump=eh;var at=De,Pi=Bt;function lt(t){return function(){throw new Error("Function "+t+" is deprecated and cannot be used.")}}H.Type=U;H.Schema=xe;H.FAILSAFE_SCHEMA=Ot;H.JSON_SCHEMA=si;H.CORE_SCHEMA=ri;H.DEFAULT_SAFE_SCHEMA=Ne;H.DEFAULT_FULL_SCHEMA=rt;H.load=at.load;H.loadAll=at.loadAll;H.safeLoad=at.safeLoad;H.safeLoadAll=at.safeLoadAll;H.dump=Pi.dump;H.safeDump=Pi.safeDump;H.YAMLException=Oe;H.MINIMAL_SCHEMA=Ot;H.SAFE_SCHEMA=Ne;H.DEFAULT_SCHEMA=rt;H.scan=lt("scan");H.parse=lt("parse");H.compose=lt("compose");H.addConstructor=lt("addConstructor");var th=H,nh=th;function ih(t){if(!t.startsWith(`---
`))return{data:{},content:t};const e=t.indexOf(`
---`,4);if(e===-1)return{data:{},content:t};const n=t.slice(4,e),i=t.slice(e+4),s=i.startsWith(`
`)?i.slice(1):i;return{data:nh.safeLoad(n)??{},content:s}}const Hi={npc:{specialNameChance:.3},missions:{boardMaxCount:8,missionTtlMs:9e5,deliveryChance:.6,deliveryBaseReward:200,deliveryRandomReward:200,supplyRewardMultiplierMin:1.15,supplyRewardMultiplierMax:1.5,supplyRequirementsMin:1,supplyRequirementsMax:2,supplyQtyMin:3,supplyQtyMax:10,deliveryDepositFraction:.2},trading:{stockCountMin:4,stockCountMax:6,stockQtyMin:5,stockQtyMax:10,stockTtlMs:12e4,stockRepCountBonusPerLevel:1,stockRepCountBonusMin:-2,stockRepCountBonusMax:3,stockRepQtyBonusPerLevel:2,stockRepQtyBonusMin:-4,stockRepQtyBonusMax:6},fuel:{pricePerLitre:10,consumptionPerLy:5,inSystemBaseConsumptionL:4},reputation:{levelUnfriendlyMin:-300,levelNeutralMin:-100,levelFriendlyMin:100,levelLikedMin:300,levelReveredMin:600,pointsMin:-600,pointsMax:1e3,missionDeltaSmall:25,missionDeltaMedium:75,missionDeltaLarge:200,missionTierMediumReward:300,missionTierLargeReward:600,tradeModifierHated:1.2,tradeModifierUnfriendly:1.1,tradeModifierNeutral:1,tradeModifierFriendly:.92,tradeModifierLiked:.85,tradeModifierRevered:.8,repPerCredit:.01,maxRepPerVisit:10},emergencyRescue:{towFee:500,fuelDropFee:800,fuelDropLitres:15},economies:{minFactor:.75,maxFactor:1.25},miniGames:{maxHullDamageFraction:.05,abandonDamageFraction:.05,noDamageThreshold:90,surface:{gravityAccel:3,airResistance:.5,thrustForce:8,maxSafeSpeed:3,crashSpeed:10,offPadScoreMultiplier:.5,padWidth:6,maxSpeed:15},asteroid:{thrustForce:8,maxSafeSpeed:4,crashSpeed:12,offPadScoreMultiplier:.5,padWidth:6,initialDownwardVelocity:2,maxSpeed:15},navigation:{ship:{accelerationImpulse:.4,maxSpeedLateral:2,maxSpeedForward:3,playerRowPreference:.67,topBufferRows:4},difficulties:{easy:{baseScrollSpeed:.3,minScrollSpeed:.2,obstacleDensity:.5,edgeSpawnIntervalFrames:120,driftSpeedMax:.2,targetDistance:300},normal:{baseScrollSpeed:.5,minScrollSpeed:.35,obstacleDensity:.8,edgeSpawnIntervalFrames:80,driftSpeedMax:.4,targetDistance:400},hard:{baseScrollSpeed:.8,minScrollSpeed:.55,obstacleDensity:1.3,edgeSpawnIntervalFrames:50,driftSpeedMax:.7,targetDistance:500}},eventTypes:{asteroid_belt:{largeRatio:.25,mediumRatio:.4,smallRatio:.35},space_debris:{largeRatio:.08,mediumRatio:.25,smallRatio:.67},space_storm:{largeRatio:0,mediumRatio:.1,smallRatio:.9}}}}};function sh(t){const e={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},balance:{...Hi},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],economies:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[n,i]of Object.entries(t)){const s=n.split("/").pop()??"";if(s==="_template.md"||s===".gitkeep")continue;const{data:r,content:o}=ih(i);/^systems\/[^/]+\.md$/.test(n)?e.systems.push(rh(r,o)):/^destinations\/[^/]+\.md$/.test(n)?e.destinations.push(oh(r,o)):/^factions\/[^/]+\.md$/.test(n)?e.factions.push(ah(r,o)):/^ships\/[^/]+\.md$/.test(n)?e.ships.push(lh(r,o)):n==="ships/components/jump-drives.md"?e.drives=ch(r):n==="navigation/jump-routes.md"?e.routes=hh(r):n==="commodities.md"?e.commodities=dh(r):n==="economies.md"?e.economies=gh(r):/^story\/[^/]+\.md$/.test(n)?e.storyBeats.push(uh(r,o)):n==="settings/new-game.md"?e.settings=ph(r):n==="settings/balance.md"?e.balance=vh(r):n==="delivery-items.md"?e.deliveryItems=mh(r):n==="npc-names.md"&&(e.npcNames=fh(r))}return e}function ct(t){const e=[];let n=!1;for(const i of t.split(`
`)){const s=i.trim();if(!s.startsWith("#"))if(s===""){if(n)break}else n=!0,e.push(s)}return e.join(" ")}function rh(t,e){return{id:t.id,name:t.name,starType:t.star_type,distanceFromSol:t.distance_from_sol,zone:t.zone,security:t.security,population:t.population,dangerLevel:t.danger_level,playerKnowledge:t.player_knowledge,economies:t.economies??[],majorFactions:t.major_factions??[],destinations:t.destinations??[],tags:t.tags??[],description:ct(e)}}function oh(t,e){const n=t.amenities??{},i={trader:n.trader??!1,shipRepair:n.ship_repair??!1,fuel:n.fuel??!1,shipDealer:n.ship_dealer??!1};return{id:t.id,name:t.name,system:t.system,locationType:t.location_type,type:t.type,amenities:i,npcs:t.npcs??{},minMissions:t.min_missions??0,missionChance:t.mission_chance??0,dangerLevel:t.danger_level,tags:t.tags??[],description:ct(e),owningFactionId:t.owning_faction,difficultyMultiplier:t.difficulty_multiplier!==void 0?parseFloat(t.difficulty_multiplier):void 0}}function ah(t,e){return{id:t.id,name:t.name,type:t.type,homeSystem:t.home_system,size:t.size,influence:t.influence??[],tags:t.tags??[],description:ct(e),rivals:t.rivals??[],allies:t.allies??[]}}function lh(t,e){return{id:t.id,name:t.name,class:t.class,cost:t.cost,cargoCapacityKg:t.cargo_capacity_kg,fuelCapacityL:t.fuel_capacity_l,hullPoints:t.hull_points,defaultJumpDrive:t.default_jump_drive,fuelEfficiency:t.fuel_efficiency,tags:t.tags??[],description:ct(e)}}function ch(t){return(t.drives??[]).map(n=>({id:n.id,name:n.name,maxDistanceLy:n.max_distance_ly,fuelEfficiency:n.fuel_efficiency,cost:n.cost}))}function hh(t){return(t.routes??[]).map(n=>({from:n.from,to:n.to,distance:n.distance,stability:n.stability,security:n.security}))}function dh(t){return(t.commodities??[]).map(n=>({id:n.id,name:n.name,basePrice:n.base_price,category:n.category,legal:n.legal,weightKg:n.weight_kg,description:n.description??""}))}function uh(t,e){return{id:t.id,title:t.title,trigger:t.trigger,type:t.type,location:t.location,skippable:t.skippable,playerKnowledge:t.player_knowledge,text:e.trim()}}function ph(t){var e,n,i,s;return{player:{name:((e=t.player)==null?void 0:e.name)??"Captain",startingCredits:((n=t.player)==null?void 0:n.starting_credits)??0},startingLocation:{system:((i=t.starting_location)==null?void 0:i.system)??"",destination:((s=t.starting_location)==null?void 0:s.destination)??""},startingShip:t.starting_ship??""}}function mh(t){return(t.delivery_items??[]).map(n=>({id:n.id,name:n.name,weightKg:n.weight_kg}))}function fh(t){const e=t.npc_names??{};return{special:e.special??[],firstNames:e.first_names??[],lastNames:e.last_names??[]}}function gh(t){return(t.economies??[]).map(n=>({id:n.id,summary:n.summary,commodities:(n.commodities??[]).map(i=>({id:i.id,factor:i.factor}))}))}function yh(t,e){return{gravityAccel:t.gravity_accel??e.gravityAccel,airResistance:t.air_resistance??e.airResistance,thrustForce:t.thrust_force??e.thrustForce,maxSafeSpeed:t.max_safe_speed??e.maxSafeSpeed,crashSpeed:t.crash_speed??e.crashSpeed,offPadScoreMultiplier:t.off_pad_score_multiplier??e.offPadScoreMultiplier,padWidth:t.pad_width??e.padWidth,maxSpeed:t.max_speed??e.maxSpeed}}function _h(t,e){return{thrustForce:t.thrust_force??e.thrustForce,maxSafeSpeed:t.max_safe_speed??e.maxSafeSpeed,crashSpeed:t.crash_speed??e.crashSpeed,offPadScoreMultiplier:t.off_pad_score_multiplier??e.offPadScoreMultiplier,padWidth:t.pad_width??e.padWidth,initialDownwardVelocity:t.initial_downward_velocity??e.initialDownwardVelocity,maxSpeed:t.max_speed??e.maxSpeed}}function bh(t,e){var a,l,c,h,d,p,u,m,f,y,b;const n=t.ship??{},i=t.difficulties??{},s=t.event_types??{},r=(S,_)=>({baseScrollSpeed:S.base_scroll_speed??(_==null?void 0:_.baseScrollSpeed),minScrollSpeed:S.min_scroll_speed??(_==null?void 0:_.minScrollSpeed),obstacleDensity:S.obstacle_density??(_==null?void 0:_.obstacleDensity),edgeSpawnIntervalFrames:S.edge_spawn_interval_frames??(_==null?void 0:_.edgeSpawnIntervalFrames),driftSpeedMax:S.drift_speed_max??(_==null?void 0:_.driftSpeedMax),targetDistance:S.target_distance??(_==null?void 0:_.targetDistance)}),o=(S,_)=>({largeRatio:S.large_ratio??(_==null?void 0:_.largeRatio),mediumRatio:S.medium_ratio??(_==null?void 0:_.mediumRatio),smallRatio:S.small_ratio??(_==null?void 0:_.smallRatio)});return{ship:{accelerationImpulse:n.acceleration_impulse??((a=e==null?void 0:e.ship)==null?void 0:a.accelerationImpulse)??.4,maxSpeedLateral:n.max_speed_lateral??((l=e==null?void 0:e.ship)==null?void 0:l.maxSpeedLateral)??2,maxSpeedForward:n.max_speed_forward??((c=e==null?void 0:e.ship)==null?void 0:c.maxSpeedForward)??3,playerRowPreference:n.player_row_preference??((h=e==null?void 0:e.ship)==null?void 0:h.playerRowPreference)??.67,topBufferRows:n.top_buffer_rows??((d=e==null?void 0:e.ship)==null?void 0:d.topBufferRows)??4},difficulties:{easy:r(i.easy??{},(p=e==null?void 0:e.difficulties)==null?void 0:p.easy),normal:r(i.normal??{},(u=e==null?void 0:e.difficulties)==null?void 0:u.normal),hard:r(i.hard??{},(m=e==null?void 0:e.difficulties)==null?void 0:m.hard)},eventTypes:{asteroid_belt:o(s.asteroid_belt??{},(f=e==null?void 0:e.eventTypes)==null?void 0:f.asteroid_belt),space_debris:o(s.space_debris??{},(y=e==null?void 0:e.eventTypes)==null?void 0:y.space_debris),space_storm:o(s.space_storm??{},(b=e==null?void 0:e.eventTypes)==null?void 0:b.space_storm)}}}function vh(t){const e=Hi,n=t.npc??{},i=t.missions??{},s=t.trading??{},r=t.fuel??{},o=t.reputation??{},a=t.emergency_rescue??{},l=t.economies??{},c=t.mini_games??{};return{npc:{specialNameChance:n.special_name_chance??e.npc.specialNameChance},missions:{boardMaxCount:i.board_max_count??e.missions.boardMaxCount,missionTtlMs:i.mission_ttl_ms??e.missions.missionTtlMs,deliveryChance:i.delivery_chance??e.missions.deliveryChance,deliveryBaseReward:i.delivery_base_reward??e.missions.deliveryBaseReward,deliveryRandomReward:i.delivery_random_reward??e.missions.deliveryRandomReward,supplyRewardMultiplierMin:i.supply_reward_multiplier_min??e.missions.supplyRewardMultiplierMin,supplyRewardMultiplierMax:i.supply_reward_multiplier_max??e.missions.supplyRewardMultiplierMax,supplyRequirementsMin:i.supply_requirements_min??e.missions.supplyRequirementsMin,supplyRequirementsMax:i.supply_requirements_max??e.missions.supplyRequirementsMax,supplyQtyMin:i.supply_qty_min??e.missions.supplyQtyMin,supplyQtyMax:i.supply_qty_max??e.missions.supplyQtyMax,deliveryDepositFraction:i.delivery_deposit_fraction??e.missions.deliveryDepositFraction},trading:{stockCountMin:s.stock_count_min??e.trading.stockCountMin,stockCountMax:s.stock_count_max??e.trading.stockCountMax,stockQtyMin:s.stock_qty_min??e.trading.stockQtyMin,stockQtyMax:s.stock_qty_max??e.trading.stockQtyMax,stockTtlMs:s.stock_ttl_ms??e.trading.stockTtlMs,stockRepCountBonusPerLevel:s.stock_rep_count_bonus_per_level??e.trading.stockRepCountBonusPerLevel,stockRepCountBonusMin:s.stock_rep_count_bonus_min??e.trading.stockRepCountBonusMin,stockRepCountBonusMax:s.stock_rep_count_bonus_max??e.trading.stockRepCountBonusMax,stockRepQtyBonusPerLevel:s.stock_rep_qty_bonus_per_level??e.trading.stockRepQtyBonusPerLevel,stockRepQtyBonusMin:s.stock_rep_qty_bonus_min??e.trading.stockRepQtyBonusMin,stockRepQtyBonusMax:s.stock_rep_qty_bonus_max??e.trading.stockRepQtyBonusMax},fuel:{pricePerLitre:r.price_per_litre??e.fuel.pricePerLitre,consumptionPerLy:r.consumption_per_ly??e.fuel.consumptionPerLy,inSystemBaseConsumptionL:r.in_system_base_consumption_l??e.fuel.inSystemBaseConsumptionL},reputation:{levelUnfriendlyMin:o.level_unfriendly_min??e.reputation.levelUnfriendlyMin,levelNeutralMin:o.level_neutral_min??e.reputation.levelNeutralMin,levelFriendlyMin:o.level_friendly_min??e.reputation.levelFriendlyMin,levelLikedMin:o.level_liked_min??e.reputation.levelLikedMin,levelReveredMin:o.level_revered_min??e.reputation.levelReveredMin,pointsMin:o.points_min??e.reputation.pointsMin,pointsMax:o.points_max??e.reputation.pointsMax,missionDeltaSmall:o.mission_delta_small??e.reputation.missionDeltaSmall,missionDeltaMedium:o.mission_delta_medium??e.reputation.missionDeltaMedium,missionDeltaLarge:o.mission_delta_large??e.reputation.missionDeltaLarge,missionTierMediumReward:o.mission_tier_medium_reward??e.reputation.missionTierMediumReward,missionTierLargeReward:o.mission_tier_large_reward??e.reputation.missionTierLargeReward,tradeModifierHated:o.trade_modifier_hated??e.reputation.tradeModifierHated,tradeModifierUnfriendly:o.trade_modifier_unfriendly??e.reputation.tradeModifierUnfriendly,tradeModifierNeutral:o.trade_modifier_neutral??e.reputation.tradeModifierNeutral,tradeModifierFriendly:o.trade_modifier_friendly??e.reputation.tradeModifierFriendly,tradeModifierLiked:o.trade_modifier_liked??e.reputation.tradeModifierLiked,tradeModifierRevered:o.trade_modifier_revered??e.reputation.tradeModifierRevered,repPerCredit:o.rep_per_credit??e.reputation.repPerCredit,maxRepPerVisit:o.max_rep_per_visit??e.reputation.maxRepPerVisit},emergencyRescue:{towFee:a.tow_fee??e.emergencyRescue.towFee,fuelDropFee:a.fuel_drop_fee??e.emergencyRescue.fuelDropFee,fuelDropLitres:a.fuel_drop_litres??e.emergencyRescue.fuelDropLitres},economies:{minFactor:l.min_factor??e.economies.minFactor,maxFactor:l.max_factor??e.economies.maxFactor},miniGames:{maxHullDamageFraction:c.max_hull_damage_fraction??e.miniGames.maxHullDamageFraction,abandonDamageFraction:c.abandon_damage_fraction??e.miniGames.abandonDamageFraction,noDamageThreshold:c.no_damage_threshold??e.miniGames.noDamageThreshold,surface:yh(c.surface??{},e.miniGames.surface),asteroid:_h(c.asteroid??{},e.miniGames.asteroid),navigation:bh(c.navigation_minigame??{},e.miniGames.navigation)}}}function wh(){const t=Object.assign({"/docs/world/commodities.md":oo,"/docs/world/delivery-items.md":ao,"/docs/world/destinations/_template.md":lo,"/docs/world/destinations/blackwake-yard.md":co,"/docs/world/destinations/ceti-landfall.md":ho,"/docs/world/destinations/drift-market.md":uo,"/docs/world/destinations/elysium-station.md":po,"/docs/world/destinations/eridani-anchorage.md":mo,"/docs/world/destinations/foundries-platform.md":fo,"/docs/world/destinations/galileo-transfer.md":go,"/docs/world/destinations/hestia-ring.md":yo,"/docs/world/destinations/keelhaul-station.md":_o,"/docs/world/destinations/kepler-yard.md":bo,"/docs/world/destinations/mars-anchor.md":vo,"/docs/world/destinations/meridian-station.md":wo,"/docs/world/destinations/new-horizon-port.md":ko,"/docs/world/destinations/orrery-anchorage.md":xo,"/docs/world/destinations/redline-station.md":Co,"/docs/world/destinations/tycho-orbital.md":To,"/docs/world/destinations/veil-station.md":So,"/docs/world/destinations/waypoint-ceti.md":Mo,"/docs/world/economies.md":Io,"/docs/world/factions/_template.md":Ao,"/docs/world/factions/centauri-trade-league.md":Ro,"/docs/world/factions/eridani-colonial-council.md":Eo,"/docs/world/factions/free-captains.md":Fo,"/docs/world/factions/grey-market-cartel.md":Lo,"/docs/world/factions/helios-directorate.md":Do,"/docs/world/factions/independent-miners-guild.md":Oo,"/docs/world/factions/procyon-institute.md":No,"/docs/world/factions/terran-union.md":Po,"/docs/world/galaxy-map.md":Ho,"/docs/world/navigation/jump-routes.md":Bo,"/docs/world/npc-names.md":Uo,"/docs/world/settings/balance.md":Go,"/docs/world/settings/new-game.md":$o,"/docs/world/ships/_template.md":Wo,"/docs/world/ships/components/jump-drives.md":Yo,"/docs/world/ships/freighter.md":Ko,"/docs/world/ships/hauler.md":jo,"/docs/world/ships/scout.md":Vo,"/docs/world/story/_template.md":qo,"/docs/world/story/enter-wolf-359.md":zo,"/docs/world/story/first-jump.md":Xo,"/docs/world/story/opening-arrival.md":Qo,"/docs/world/systems/_template.md":Jo,"/docs/world/systems/alpha-centauri.md":Zo,"/docs/world/systems/barnards-star.md":ea,"/docs/world/systems/epsilon-eridani.md":ta,"/docs/world/systems/procyon.md":na,"/docs/world/systems/sirius.md":ia,"/docs/world/systems/sol.md":sa,"/docs/world/systems/tau-ceti.md":ra,"/docs/world/systems/wolf-359.md":oa}),e={};for(const[n,i]of Object.entries(t)){const s=n.replace("/docs/world/","");e[s]=i}return sh(e)}es(wh());const kh=navigator.maxTouchPoints>0?"touch":"keyboard",xh=new URLSearchParams(window.location.search).has("debug"),Bi={environment:"browser",primaryInput:kh,debug:xh},Ch=new Ki,Ui=new zi(Bi);Ui.connect();const Th=new ro(Ch,Ui,Bi);let Kn=0;function Gi(t){Th.tick(t-Kn),Kn=t,requestAnimationFrame(Gi)}requestAnimationFrame(Gi);
