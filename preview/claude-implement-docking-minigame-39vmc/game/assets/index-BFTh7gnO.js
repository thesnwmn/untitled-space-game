(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const ke=40,Be=30,Ei=50,ln=24;function Ri(n){return n==="&"?"&amp;":n==="<"?"&lt;":n===">"?"&gt;":n}class Li{constructor(){this.charW=0,this.charH=0,this.gridH=Be,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(ke),this.pre.dataset.gridRows=String(Be),document.body.appendChild(this.pre);const e=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${ln}px "Share Tech Mono"`).catch(()=>null)]).then(e),document.fonts.addEventListener("loadingdone",e),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const e=document.createElement("span");e.style.fontFamily="'Share Tech Mono', monospace",e.style.fontSize=`${ln}px`,e.style.lineHeight="1em",e.style.position="absolute",e.style.visibility="hidden",e.textContent="M",document.body.appendChild(e);const t=e.getBoundingClientRect();document.body.removeChild(e),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const e=Math.min(window.innerWidth/(ke*this.charW),window.innerHeight/(Be*this.charH)),t=Math.max(Be,Math.min(Ei,Math.floor(window.innerHeight/(this.charH*e))));if(this.pre.style.fontSize=`${ln*e}px`,this.pre.style.width=`${ke*this.charW*e}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const i of this.resizeHandlers)i(ke,t)}}onResize(e){this.resizeHandlers.push(e)}drawBuffer(e){const t=[];for(const i of e){let r="";for(const s of i){const o=s.fg!=="transparent"?`fg-${s.fg}`:"",a=s.bg!=="transparent"?`bg-${s.bg}`:"",l=o&&a?`${o} ${a}`:o||a,c=l?` class="${l}"`:"";r+=`<span${c}>${Ri(s.char)}</span>`}t.push(r)}this.pre.innerHTML=t.join(`
`)}getWidth(){return ke}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const Fi={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",m:"MENU",M:"MENU",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},Di=new Set(["0","1","2","3","4","5","6","7","8","9"]),Ni=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class Oi{constructor(e){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=e.debug}logDebug(e){if(this.debugMode){if(this.debugLog.unshift(e),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(e){this.actionHandlers.push(e)}onTap(e){this.tapHandlers.push(e)}onCharInput(e){this.charInputHandlers.push(e)}connect(){this.keyListener=e=>{if(Ni.has(e.key)&&e.preventDefault(),Di.has(e.key))for(const i of this.charInputHandlers.slice())i(e.key);if(e.key==="Backspace"||e.key==="Delete"){for(const i of this.charInputHandlers.slice())i("\b");return}const t=Fi[e.key];if(t)for(const i of this.actionHandlers.slice())i(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=e=>{e.preventDefault(),this.pointerStartMap.set(e.pointerId,{startX:e.clientX,startY:e.clientY}),this.activePointers.add(e.pointerId),this.logDebug(`DOWN id=${e.pointerId} (${Math.round(e.clientX)},${Math.round(e.clientY)}) type=${e.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=e=>{const t=this.pointerStartMap.get(e.pointerId),i=this.activePointers.size;if(this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId),!t){this.logDebug(`UP id=${e.pointerId} NO START`);return}const r=e.clientX-t.startX,s=e.clientY-t.startY,o=Math.abs(r),a=Math.abs(s);if(o<20&&a<20)if(i>=2){this.logDebug(`UP id=${e.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;o>=a?l=r>0?"RIGHT":"LEFT":l=s>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(r)} dy=${Math.round(s)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=e=>{this.logDebug(`CANCEL id=${e.pointerId}`),this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const e=document.querySelector(".game-screen");if(!e)return"NO PRE";const t=e.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(e,t){const i=document.querySelector(".game-screen");if(!i)return null;const r=i.getBoundingClientRect(),s=parseInt(i.dataset.gridCols??"1"),o=parseInt(i.dataset.gridRows??"1");if(!s||!o||!r.width||!r.height)return null;const a=Math.floor((e-r.left)/(r.width/s)),l=Math.floor((t-r.top)/(r.height/o));return a<0||a>=s||l<0||l>=o?null:{col:a,row:l}}}function g(n,e,t,i,r,s){if(e<0||e>=n.length)return;const o=n[e];for(let a=0;a<i.length;a++){const l=t+a;l>=0&&l<o.length&&(o[l]={char:i[a],fg:r,bg:s})}}function F(n,e,t,i,r){if(e<0||e>=n.length)return;const s=n[e].length,o=Math.max(0,Math.floor((s-t.length)/2));g(n,e,o,t,i,r)}function Ze(n,e){const t=n.split(/\s+/).filter(Boolean),i=[];let r="";for(const s of t)r.length===0?r=s:r.length+1+s.length<=e?r+=" "+s:(i.push(r),r=s);return r.length>0&&i.push(r),i}function pe(n,e,t,i="bright-black"){g(n,e,0,"-".repeat(t),i,"black")}function Pt(n,e,t,i,r){const s=`${i+1}/${r}`;g(n,e,0,"|<|","white","black");const o=Math.floor((t-s.length)/2);g(n,e,o,s,"bright-black","black"),g(n,e,t-3,"|>|","white","black")}const Pn=["UNTITLED","SPACE GAME"],Pi=4,Bi=3,Hi="- An ASCII space adventure -",Ui=11,Bn=16;class Hn{constructor(e,t,i,r){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,r()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),e.onAction(s=>{this.activated||(s==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:s==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:s==="SELECT"&&this.items[this.cursorIdx].action())}),e.onTap&&e.onTap((s,o)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(o===Bn+a){this.cursorIdx=a,this.items[a].action();return}}})}update(e){}render(e){const t=e.length,i=t>0?e[0].length:0;for(let o=0;o<t;o++)for(let a=0;a<i;a++)e[o][a]={char:" ",fg:"black",bg:"black"};for(let o=0;o<Pn.length;o++)F(e,Pi+o*Bi,Pn[o],"bright-cyan","black");F(e,Ui,Hi,"white","black");const r=this.items.reduce((o,a)=>Math.max(o,a.label.length+2),0),s=Math.max(0,Math.floor((i-r)/2));for(let o=0;o<this.items.length;o++){const a=Bn+o;if(a>=t)continue;const l=o===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";g(e,a,s,c+this.items[o].label,h,"black")}}}let gn=null;function $i(n){gn=n}function D(){if(gn===null)throw new Error("World not initialised — call initWorld() before accessing world data");return gn}function Z(n){return D().systems.find(e=>e.id===n)}function N(n){return D().destinations.find(e=>e.id===n)}function xn(n){return D().routes.filter(e=>e.from===n||e.to===n)}function Bt(n){return D().drives.find(e=>e.id===n)}function Gi(n){return D().storyBeats.filter(e=>e.trigger===n)}function Ht(){return D().settings}function P(){return D().balance}function Ye(n){return D().ships.find(e=>e.id===n)}function Ke(n,e){return D().routes.find(t=>t.from===n&&t.to===e||t.from===e&&t.to===n)}function Ut(n){return D().factions.find(e=>e.id===n)}function ae(n){return D().commodities.find(e=>e.id===n)}function Wi(){return D().commodities}function Yi(){return D().systems.filter(n=>n.playerKnowledge==="public")}function Ki(n){return n.reduce((e,t)=>{const i=ae(t.commodityId);return e+t.qty*((i==null?void 0:i.weightKg)??0)},0)}function ji(n){return D().economies.find(e=>e.id===n)}function Ve(n,e){const t=P(),i=[];for(const s of e.economies){const o=ji(s);if(o){for(const a of o.commodities)if(a.id===n){i.push(a.factor);break}}}const r=i.length===0?1:i.reduce((s,o)=>s+o,0)/i.length;return Math.max(t.economies.minFactor,Math.min(t.economies.maxFactor,r))}const le=3,Un=0;function Cn(n,e){return e?n-2:n}function qi(n){return n.toLocaleString("en-US")}class Vi{constructor(e,t){this.buttonRanges=null,this.footerRow=-1,this.headerWidth=-1,this.context=e,this.player=t}render(e,t){const i=e.length,r=i>0?e[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader?(this.headerWidth=r,this.renderHeaderRow0(e,r,t.systemLabel),this.renderHeaderRow1(e,r,t.destinationLabel)):this.headerWidth=-1,t.showFooter&&(this.renderFooter(e,i,r,t.navOptions),this.footerRow=i-1)}renderHeaderRow0(e,t,i){const r=i!==void 0?i??"":(()=>{const c=Z(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),s="::";g(e,0,0,s,"bright-black","black"),g(e,0,s.length,r,"bright-cyan","black");const a=t-s.length-r.length-10;let l=s.length+r.length;for(let c=0;c<a;c++)e[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,g(e,0,l,"[M]","white","black"),l+=3,g(e,0,l," MENU","white","black"),l+=5,g(e,0,l,"::","bright-black","black")}renderHeaderRow1(e,t,i){const r=i!==void 0?i??"":(()=>{const h=this.player.destinationId?N(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),s=qi(this.player.credits),o=s.length+5,a="::";g(e,1,0,a,"bright-black","black"),g(e,1,a.length,r,"cyan","black");const l=t-a.length-r.length-o;let c=a.length+r.length;for(let h=0;h<l;h++)e[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,g(e,1,c,s,"green","black"),c+=s.length,g(e,1,c," CR","white","black"),c+=3,g(e,1,c,"::","bright-black","black")}renderFooter(e,t,i,r){const s=t-1,o=[];if(r.length===0){for(let l=0;l<i;l++)e[s][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}g(e,s,0,"::","bright-black","black");let a=2;for(let l=0;l<r.length;l++){l>0&&(g(e,s,a,"::","bright-black","black"),a+=2);const c=r[l],h=`[${l+1}]`,d=` ${c.label}`,p=a;g(e,s,a,h,"white","black"),a+=h.length,g(e,s,a,d,"white","black"),a+=d.length,o.push({id:c.id,startCol:p,endCol:a})}for(let l=a;l<i;l++)e[s][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=o}hitTestNav(e,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const i of this.buttonRanges)if(e>=i.startCol&&e<i.endCol)return i.id;return null}hitTestHeader(e,t){if(this.headerWidth<0||t!==0)return null;const i=this.headerWidth-10,r=this.headerWidth-2;return e>=i&&e<r?"menu":null}}class ee{constructor(e,t,i,r){this.activeTabIdx=0,this.activated=!1,this.player=i,this.chrome=new Vi(t,i),this.opts=r,e.onCharInput&&e.onCharInput(s=>{this.activated||this.handleCharInput(s)}),e.onAction(s=>{if(!this.activated&&!this.preHandleAction(s)){if(s==="MENU"&&r.onMenu){r.onMenu();return}if(r.tabs){if(s==="LEFT"){const o=Math.max(0,this.activeTabIdx-1);o!==this.activeTabIdx&&(this.activeTabIdx=o,this.onTabChange(o));return}if(s==="RIGHT"){const o=Math.min(r.tabs.length-1,this.activeTabIdx+1);o!==this.activeTabIdx&&(this.activeTabIdx=o,this.onTabChange(o));return}}this.handleAction(s)}}),e.onTap&&e.onTap((s,o)=>{var l;if(this.activated||this.preHandleTap(s,o))return;const a=this.chrome.hitTestNav(s,o);if(a!==null){this.handleNavTap(a);return}if(this.chrome.hitTestHeader(s,o)==="menu"&&r.onMenu){r.onMenu();return}if(r.tabs&&r.title!==void 0){const c=r.showHeader??!0?le:Un,h=((l=r.summary)==null?void 0:l.length)??0,d=c+3+h;if(o===d){let p=3;for(let u=0;u<r.tabs.length;u++){const m=r.tabs[u].length+2;if(s>=p&&s<p+m){u!==this.activeTabIdx&&(this.activeTabIdx=u,this.onTabChange(u));return}p+=m+1}return}}this.handleTap(s,o)})}preHandleAction(e){return!1}preHandleTap(e,t){return!1}handleAction(e){}handleTap(e,t){}handleNavTap(e){}handleCharInput(e){}onTabChange(e){}buildChromeConfig(){return{showHeader:this.opts.showHeader??!0,showFooter:this.opts.showFooter??!0,navOptions:this.opts.navOptions}}suspend(){this.activated=!0}resume(){this.activated=!1}update(e){}render(e){var p;const t=e.length,i=t>0?e[0].length:0,r=this.opts;for(let u=0;u<t;u++)for(let m=0;m<i;m++)e[u][m]={char:" ",fg:"black",bg:"black"};const s=this.buildChromeConfig();this.chrome.render(e,s);const o=r.showHeader??!0,a=r.showFooter??!0,l=o?le:Un,c=((p=r.summary)==null?void 0:p.length)??0,h=Cn(t,a);let d;if(r.title!==void 0){g(e,l,2,r.title,"bright-white","black"),g(e,l+1,2,"'".repeat(r.title.length),"bright-black","black");for(let u=0;u<c;u++)g(e,l+2+u,2,r.summary[u],"bright-black","black");if(r.tabs){const u=l+3+c;let m=2;u<t&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++;for(let f=0;f<r.tabs.length;f++){const y=f===this.activeTabIdx,x=` ${r.tabs[f]} `,S=y?"black":"white",v=y?"green":"black";for(const M of x)u<t&&m<i&&(e[u][m]={char:M,fg:S,bg:v}),m++;u<t&&m<i&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++}d=l+5+c}else d=l+3+c}else d=l;this.renderContent(e,d,h)}}class he extends ee{constructor(e,t,i,r,s,o,a=[],l=null,c){super(r,s,o,{navOptions:i,title:e,summary:a,tabs:l!==null?l.map(d=>d.label):void 0,onMenu:c}),this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.modal=null,this.lastContentTop=0,this._staticItems=t,this.tabs=l,this.infoLines=a;const h=a.length;this.lastContentTop=l!==null?le+5+h:le+3+h,this.resetCursor()}get items(){var e;return this.tabs!==null?((e=this.tabs[this.activeTabIdx])==null?void 0:e.items)??[]:this._staticItems}preHandleAction(e){return this.modal!==null?(this.modal.handleAction(e),!0):!1}preHandleTap(e,t){return this.modal!==null?(this.modal.handleTap(e,t),!0):!1}handleCharInput(e){this.modal!==null&&this.modal.handleCharInput(e)}onTabChange(e){this.resetCursor()}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):e==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):e==="SELECT"?this.activateCurrent():this.handleNavAction(e)}handleTap(e,t){const i=this.rowToVisibleItemIndex(t);i!==null&&!this.items[i].disabled&&(this.cursorIdx=i,this.activateCurrent())}moveCursor(e){const t=this.items,i=t.length;if(i===0)return;const r=this.cursorIdx===-1?e>0?i-1:0:this.cursorIdx;for(let s=0;s<i;s++){const o=((r+e*(s+1))%i+i)%i;if(!t[o].disabled){this.cursorIdx=o;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const e=this.items[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}rowToVisibleItemIndex(e){var r,s;let t=this.lastContentTop;const i=this.items;for(let o=0;o<i.length;o++){const a=1+(((r=i[o].details)==null?void 0:r.length)??0)+(((s=i[o].detailsColored)==null?void 0:s.length)??0);if(e>=t&&e<t+a)return o;t+=a}return null}resetCursor(){const e=this.items;for(let t=0;t<e.length;t++)if(!e[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(e){}openModal(e){this.modal=e,this.activated=!1}closeModal(){this.modal=null}renderContent(e,t,i){var S,v,M,b;this.lastContentTop=t;const s=e.length>0?e[0].length:0,o=i-1,a=o-t,l=this.items,c=l.map(C=>{var _,T;return 1+(((_=C.details)==null?void 0:_.length)??0)+(((T=C.detailsColored)==null?void 0:T.length)??0)}),d=c.reduce((C,_)=>C+_,0)>a,p=d?a-1:a,u=[];let m=[],f=0;for(let C=0;C<c.length;C++)f+c[C]>p?(m.length>0&&u.push(m),m=[C],f=c[C]):(m.push(C),f+=c[C]);m.length>0&&u.push(m),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const y=u[this.pageIndex]??[];let x=t;for(const C of y){const _=l[C],T=C===this.cursorIdx,E=_.disabled?"bright-black":T?"bright-green":_.accentFg??"white",Y=_.infoFg??E,O=s-4;if(_.icon!==void 0){const w=_.icon.length;if(g(e,x,2,T?">":" ",E,"black"),g(e,x,3,_.icon,_.iconFg??E,"black"),_.info!==void 0){const L=_.info.length,A=Math.max(0,O-1-w-2-L-1),k=_.label.length>A?_.label.slice(0,A):_.label,K=Math.max(1,O-1-w-k.length-2-L);g(e,x,3+w,k+" ",E,"black"),g(e,x,3+w+k.length+1,".".repeat(K),"bright-black","black"),g(e,x,3+w+k.length+1+K+1,_.info,Y,"black")}else g(e,x,3+w,_.label.slice(0,O-1-w),E,"black");for(let L=0;L<(((S=_.details)==null?void 0:S.length)??0);L++)x+1+L<=o&&g(e,x+1+L,2,("  "+_.details[L]).slice(0,O),_.detailsFg??"bright-black","black")}else if(_.info!==void 0){const w=T?"> ":"  ",R=Math.max(1,O-2-_.label.length-2-_.info.length);g(e,x,2,w+_.label+" ",E,"black"),g(e,x,2+w.length+_.label.length+1,".".repeat(R),"bright-black","black"),g(e,x,2+w.length+_.label.length+1+R+1,_.info,Y,"black")}else if(_.details!==void 0&&_.details.length>0){g(e,x,2,((T?"> ":"  ")+_.label).slice(0,O),E,"black");for(let R=0;R<_.details.length;R++)x+1+R<=o&&g(e,x+1+R,2,("  "+_.details[R]).slice(0,O),_.detailsFg??"bright-black","black")}else g(e,x,2,((T?"> ":"  ")+_.label).slice(0,O),E,"black");const $=((v=_.details)==null?void 0:v.length)??0;for(let w=0;w<(((M=_.detailsColored)==null?void 0:M.length)??0);w++){const R=x+1+$+w;if(R<=o){const L=_.detailsColored[w];let A=4;for(const k of L.left)g(e,R,A,k.text,k.fg,"black"),A+=k.text.length;if(L.right!==void 0){const k=O-4-L.right.text.length;g(e,R,k,L.right.text,L.right.fg,"black")}}}x+=1+$+(((b=_.detailsColored)==null?void 0:b.length)??0)}d&&Pt(e,o,s,this.pageIndex,this.lastPageCount),this.modal!==null&&this.modal.render(e)}}class $n extends he{constructor(e,t,i,r,s){const o=r.length===0?[{label:"NO OPTIONS AVAILABLE",disabled:!0,action:()=>{}}]:r.map(a=>({label:a.label,action:a.action}));super("MENU",o,[{id:"game",label:"GAME"}],e,t,i,[],null,s),this.onClose=s}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onClose())}handleNavTap(e){e==="game"&&!this.activated&&(this.activated=!0,this.onClose())}}function de(n){return n.size==="medium"||n.size==="large"}function Ae(n,e){return n>=e.reputation.levelReveredMin?3:n>=e.reputation.levelLikedMin?2:n>=e.reputation.levelFriendlyMin?1:n<e.reputation.levelUnfriendlyMin?-2:n<e.reputation.levelNeutralMin?-1:0}function $t(n){switch(n){case-2:return"HATED";case-1:return"UNFRIENDLY";case 0:return"NEUTRAL";case 1:return"FRIENDLY";case 2:return"LIKED";case 3:return"REVERED";default:return"NEUTRAL"}}function Gn(n,e){switch(n){case-2:return e.reputation.tradeModifierHated;case-1:return e.reputation.tradeModifierUnfriendly;case 1:return e.reputation.tradeModifierFriendly;case 2:return e.reputation.tradeModifierLiked;case 3:return e.reputation.tradeModifierRevered;default:return e.reputation.tradeModifierNeutral}}function Tn(n){return`${n<0?"":"+"}${n}`}function Mn(n,e,t){const i=new Map;i.set(n.id,e);const r=Math.floor(e/2);for(const o of n.allies)i.set(o,r);const s=-Math.floor(e/2);for(const o of n.rivals)i.set(o,s);return i}function Me(n,e){return n.type==="delivery"?n.pickupComplete?e.destinationId===n.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":n.requirements.every(i=>{const r=e.cargoHold.find(s=>s.commodityId===i.commodityId);return r!==void 0&&r.qty>=i.qty})?"ready-to-deliver":"needs-supplies"}function zi(n,e){if(e.type==="delivery"){if(n.cargoCapacity-n.cargoWeightKg<e.itemWeightKg)return{ok:!1,reason:"Insufficient cargo space"};if(n.credits<e.deposit)return{ok:!1,reason:"Insufficient credits for deposit"}}return{ok:!0}}class In{constructor(e){const t=Ye(e.shipId);if(!t)throw new Error(`Unknown ship: ${e.shipId}`);this.shipId=e.shipId,this.driveId=e.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=e.credits,this._systemId=e.systemId,this._destinationId=e.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[],this._hullIntegrity=1,this._factionReputation=new Map;for(const i of D().factions)de(i)&&this._factionReputation.set(i.id,0);this._destinationMissions=new Map}static createMock(){const e=Ht(),t=Ye(e.startingShip);if(!t)throw new Error(`Unknown starting ship: ${e.startingShip}`);return new In({shipId:e.startingShip,driveId:t.defaultJumpDrive,credits:e.player.startingCredits,systemId:e.startingLocation.system,destinationId:e.startingLocation.destination})}get fuelL(){return this._fuelL}addFuel(e){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+e)}consumeFuel(e){this._fuelL=Math.max(0,this._fuelL-e)}getInSystemHopCost(){const e=Ye(this.shipId),t=D().balance;return Math.ceil(t.fuel.inSystemBaseConsumptionL*e.fuelEfficiency)}get credits(){return this._credits}addCredits(e){this._credits+=e}spendCredits(e){this._credits-=e}get cargoHold(){return this._cargoHold}addCargo(e,t){const i=this._cargoHold.find(r=>r.commodityId===e);i?i.qty+=t:this._cargoHold.push({commodityId:e,qty:t})}removeCargo(e,t){const i=this._cargoHold.findIndex(r=>r.commodityId===e);i<0||(t!==void 0&&t<this._cargoHold[i].qty?this._cargoHold[i].qty-=t:this._cargoHold.splice(i,1))}get missionItemsWeightKg(){return this._missionItems.reduce((e,t)=>e+t.weightKg,0)}get cargoWeightKg(){return Ki(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(e){this._destinationId=e}undock(){this._destinationId=null}jumpTo(e){this._systemId=e,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(e,t){const i={...e,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(i),e.type==="delivery"&&(this._credits-=e.deposit,t&&(this._missionItems.push({missionId:e.id,itemName:e.itemName,weightKg:e.itemWeightKg}),i.pickupComplete=!0))}collectMissionItem(e){const t=this._activeMissions.find(i=>i.id===e);!t||t.type!=="delivery"||(t.pickupComplete=!0,this._missionItems.push({missionId:t.id,itemName:t.itemName,weightKg:t.itemWeightKg}))}completeMission(e){this._activeMissions=this._activeMissions.filter(t=>t.id!==e),this._missionItems=this._missionItems.filter(t=>t.missionId!==e)}cancelMission(e){this._activeMissions=this._activeMissions.filter(t=>t.id!==e),this._missionItems=this._missionItems.filter(t=>t.missionId!==e)}getMissionsForPickup(e){return this._activeMissions.filter(t=>t.type==="delivery"&&t.pickupDestinationId===e&&!t.pickupComplete)}getMissionsForDelivery(e){return this._activeMissions.filter(t=>t.deliveryDestinationId===e&&Me(t,this)==="ready-to-deliver")}get hullIntegrity(){return this._hullIntegrity}applyHullDamage(e){this._hullIntegrity=Math.max(0,this._hullIntegrity-e)}getFactionReputation(e){return this._factionReputation.get(e)??0}modifyFactionReputation(e,t,i){const r=this.getFactionReputation(e),s=Math.min(i.reputation.pointsMax,Math.max(i.reputation.pointsMin,r+t));this._factionReputation.set(e,s)}getDestinationMissions(e){const t=this._destinationMissions.get(e);return t?Date.now()-t.generatedAt>D().balance.missions.missionTtlMs?[]:t.specs:[]}refreshDestinationMissions(e,t){this._destinationMissions.set(e,{specs:t,generatedAt:Date.now()})}}const Wn=40;class yn{constructor(e){this.focus="confirm",this.confirmRect=null,this.cancelRect=null,this.opts=e}handleAction(e){var t,i;if(e==="BACK"){this.opts.onConfirm();return}if(e==="LEFT"||e==="RIGHT"||e==="TAB"){this.opts.cancelLabel!==void 0&&(this.focus=this.focus==="confirm"?"cancel":"confirm");return}e==="SELECT"&&(this.focus==="cancel"?(i=(t=this.opts).onCancel)==null||i.call(t):this.opts.onConfirm())}handleCharInput(e){}handleTap(e,t){var i,r;this.confirmRect&&t===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.opts.onConfirm():this.cancelRect&&t===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&((r=(i=this.opts).onCancel)==null||r.call(i))}render(e){const t=e.length,i=t>0?e[0].length:0,{title:r,body:s,confirmLabel:o,cancelLabel:a}=this.opts,l=Wn-2,c=Ze(s,l),h=c.length,d=4+h+1+1+1,p=Wn,u=Math.floor((i-p)/2),m=Math.floor((t-d)/2);for(let b=0;b<d;b++)for(let C=0;C<p;C++){const _=m+b,T=u+C;_>=0&&_<t&&T>=0&&T<i&&(e[_][T]={char:" ",fg:"white",bg:"black"})}const f=(b,C,_)=>{b>=0&&b<t&&C>=0&&C<i&&(e[b][C]={char:_,fg:"white",bg:"black"})};f(m,u,"+"),f(m,u+p-1,"+");for(let b=1;b<p-1;b++)f(m,u+b,"-");f(m+d-1,u,"+"),f(m+d-1,u+p-1,"+");for(let b=1;b<p-1;b++)f(m+d-1,u+b,"-");for(let b=1;b<d-1;b++)f(m+b,u,"|"),f(m+b,u+p-1,"|");const y=r.slice(0,l),x=m+1,S=u+1+Math.floor((l-y.length)/2);g(e,x,S,y,"bright-white","black"),g(e,m+2,S,"'".repeat(y.length),"bright-black","black");for(let b=0;b<c.length;b++)g(e,m+4+b,u+1,c[b],"white","black");const v=m+4+h+1,M=`[ ${o} ]`;if(a!==void 0){const b=`[ ${a} ]`,C=2,_=M.length+C+b.length,T=Math.floor((l-_)/2),E=u+1+T,Y=E+M.length+C;this.confirmRect={col:E,row:v,width:M.length},this.cancelRect={col:Y,row:v,width:b.length};const O=this.focus==="confirm",$=this.focus==="cancel";g(e,v,E,M,O?"black":"white",O?"green":"black"),g(e,v,Y,b,$?"black":"white",$?"green":"black")}else{const b=Math.floor((l-M.length)/2),C=u+1+b;this.confirmRect={col:C,row:v,width:M.length},this.cancelRect=null,g(e,v,C,M,"black","green")}}}const Xi={delivery:"[D] ",supply:"[S] "},Qi={"pending-pickup":"PENDING PICKUP","needs-supplies":"NEEDS SUPPLIES","in-transit":"IN TRANSIT","ready-to-deliver":"READY TO DELIVER"},Ji={"pending-pickup":"yellow","needs-supplies":"yellow","in-transit":"bright-black","ready-to-deliver":"bright-green"};class Zi extends he{constructor(e,t,i,r,s){super("MISSIONS",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,t,i,[],null,s),this.onBack=r,this.onGame=s}get items(){const e=this.player.activeMissions;return e.length===0?[{label:"NO ACTIVE MISSIONS",disabled:!0,action:()=>{}}]:this.sortMissions(e).map(i=>this.buildMenuItem(i))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const t=e[this.cursorIdx];t.disabled||t.action()}getStatusPriority(e){return e==="ready-to-deliver"?0:e==="needs-supplies"||e==="pending-pickup"?1:e==="in-transit"?2:3}sortMissions(e){return[...e].sort((t,i)=>{var d,p;const r=((d=N(t.deliveryDestinationId))==null?void 0:d.name)??t.deliveryDestinationId,s=((p=N(i.deliveryDestinationId))==null?void 0:p.name)??i.deliveryDestinationId,o=r.localeCompare(s);if(o!==0)return o;const a=Me(t,this.player),l=Me(i,this.player),c=this.getStatusPriority(a)-this.getStatusPriority(l);if(c!==0)return c;const h={delivery:0,supply:1};return h[t.type]-h[i.type]})}buildMenuItem(e){const t=Me(e,this.player),i=N(e.deliveryDestinationId),r=(i==null?void 0:i.name)??e.deliveryDestinationId,s=Qi[t]??t,o=Ji[t]??"white",a=[`Status: ${s}`,`Dest: ${r}`];e.type!=="supply"&&a.push("");const l=e.type==="supply"?this.buildSupplyDetails(e):[];return{label:e.title,icon:Xi[e.type],iconFg:"bright-yellow",info:`${e.reward} CR`,infoFg:"bright-green",details:a,detailsFg:o,detailsColored:l,action:()=>this.openMissionModal(e)}}buildSupplyDetails(e){if(e.type!=="supply")return[];const t=e.requirements.map(i=>{const r=D().commodities.find(c=>c.id===i.commodityId),s=(r==null?void 0:r.name)??i.commodityId,o=this.player.cargoHold.find(c=>c.commodityId===i.commodityId),a=(o==null?void 0:o.qty)??0,l=a>=i.qty;return{left:[{text:`${i.qty}x ${s} `,fg:"white"},{text:`(have: ${a})`,fg:l?"bright-green":"bright-black"}]}});return t.push({left:[]}),t}openMissionModal(e){let t=e.description;if(e.giverFactionId){const i=D(),r=i.factions.find(s=>s.id===e.giverFactionId);if(r){const s=P(),o=e.reward;let a;o>=s.reputation.missionTierLargeReward?a=s.reputation.missionDeltaLarge:o>=s.reputation.missionTierMediumReward?a=s.reputation.missionDeltaMedium:a=s.reputation.missionDeltaSmall;const l=Mn(r,a,i.factions),c=[];for(const[h,d]of l){const p=i.factions.find(u=>u.id===h);p&&c.push({id:h,name:p.name,delta:d})}c.sort((h,d)=>h.delta!==d.delta?d.delta-h.delta:h.name.localeCompare(d.name)),t+=`

REPUTATION IMPACT:
`;for(const h of c){const d=Tn(h.delta);t+=`  ${h.name.padEnd(20)} ${d}
`}}}this.openModal(new yn({title:e.title,body:t,confirmLabel:"OKAY",cancelLabel:"CANCEL MISSION",onConfirm:()=>this.closeModal(),onCancel:()=>{this.player.cancelMission(e.id),this.closeModal();const i=this.player.activeMissions.length;i===0?this.cursorIdx=-1:this.cursorIdx>=i&&(this.cursorIdx=i-1)}}))}handleNavAction(e){e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):(e==="BACK"||e==="NAV_2")&&!this.activated&&(this.activated=!0,this.onBack())}handleNavTap(e){e==="game"&&!this.activated?(this.activated=!0,this.onGame()):e==="menu"&&!this.activated&&(this.activated=!0,this.onBack())}}const _n=20,er="█",nr="░";function tr(n,e,t){return n<=e?0:n>=t?_n:Math.round((n-e)/(t-e)*_n)}const ir={[-2]:"red",[-1]:"bright-red",0:"white",1:"bright-green",2:"bright-green",3:"bright-cyan"};class rr extends he{constructor(e,t,i,r,s){super("REPUTATION",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,t,i,[],null,s),this.onBack=r,this.onGame=s}get items(){const e=P(),i=D().factions.filter(r=>de(r));return i.sort((r,s)=>{if(r.size!==s.size){if(r.size==="large")return-1;if(s.size==="large")return 1}return r.name.localeCompare(s.name)}),i.map(r=>{const s=this.player.getFactionReputation(r.id),o=Ae(s,e),a=$t(o),l=ir[o]??"white",c=tr(s,e.reputation.pointsMin,e.reputation.levelReveredMin),h=_n-c;return{label:r.name,info:a,infoFg:l,detailsColored:[{left:[{text:er.repeat(c),fg:l},{text:nr.repeat(h),fg:"bright-black"}],right:{text:String(s),fg:"white"}},{left:[]}],action:()=>{}}})}activateCurrent(){}handleNavAction(e){e==="BACK"&&!this.activated?(this.activated=!0,this.onBack()):e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):super.handleNavAction(e)}handleNavTap(e){e==="menu"&&!this.activated?(this.activated=!0,this.onBack()):e==="game"&&!this.activated&&(this.activated=!0,this.onGame())}}class sr extends ee{constructor(e,t,i,r){super(e,t,i,{navOptions:[]}),this.pageIndex=0,this.onContinue=r;const o=Gi("game-start")[0].text.split(`

`),a=o[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=o.slice(1)):(this.yearHeader="",l=o);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),p=Ze(d,36);h>0&&c.push(""),c.push(...p)}this.bodyLines=c}handleAction(e){e==="SELECT"?(this.activated=!0,this.onContinue()):e==="LEFT"?this.pageIndex>0&&this.pageIndex--:e==="RIGHT"&&this.pageIndex++}handleTap(e,t){this.activated=!0,this.onContinue()}renderContent(e,t,i){const r=e.length>0?e[0].length:0;if(this.yearHeader){const m=Math.max(0,Math.floor((r-this.yearHeader.length)/2));g(e,t,m,this.yearHeader,"bright-yellow","black")}const s=t+2,o=i-1,a=o-s,l=Math.max(1,a),c=Math.max(1,Math.ceil(this.bodyLines.length/l));this.pageIndex>=c&&(this.pageIndex=c-1);const h=c>1,d=this.pageIndex*l,p=Math.min(d+l,this.bodyLines.length);let u=s;for(let m=d;m<p;m++){const f=this.bodyLines[m];f!==""&&g(e,u,2,f,"white","black"),u++}h&&Pt(e,o,r,this.pageIndex,c)}}const or=30;class bn{constructor(e){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=e,this.value=Math.max(e.field.min,Math.min(e.field.max,e.field.initialValue))}handleAction(e){const{field:t}=this.formDef;if(e==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(e==="UP"){this.value=Math.min(t.max,this.value+1);return}if(e==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(e==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(e==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(e==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}e==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(e){if(this.focus!=="field")return;const{field:t}=this.formDef;if(e==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(e>="0"&&e<="9"){const i=parseInt(e,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,i)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+i)}}handleTap(e,t){this.confirmRect&&t===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(e){const t=e.length,i=t>0?e[0].length:0,{title:r,field:s,derivedRows:o,confirmLabel:a}=this.formDef,l=o.length,c=8+l,h=or,d=Math.floor((i-h)/2),p=Math.floor((t-c)/2);for(let k=0;k<c;k++)for(let K=0;K<h;K++){const W=p+k,X=d+K;W>=0&&W<t&&X>=0&&X<i&&(e[W][X]={char:" ",fg:"white",bg:"black"})}const u=(k,K,W)=>{k>=0&&k<t&&K>=0&&K<i&&(e[k][K]={char:W,fg:"white",bg:"black"})};u(p,d,"+"),u(p,d+h-1,"+");for(let k=1;k<h-1;k++)u(p,d+k,"-");u(p+c-1,d,"+"),u(p+c-1,d+h-1,"+");for(let k=1;k<h-1;k++)u(p+c-1,d+k,"-");for(let k=1;k<c-1;k++)u(p+k,d,"|"),u(p+k,d+h-1,"|");const m=h-2,f=p+1,y=d+1+Math.floor((m-r.length)/2);g(e,f,y,r,"bright-white","black"),g(e,p+2,y,"'".repeat(r.length),"bright-black","black");const x=[s.label,...o.map(k=>k.label)],S=Math.max(...x.map(k=>k.length)),v=d+1+S+3,M=p+4,b=this.focus==="field";g(e,M,d+1,s.label.padEnd(S)+" : ","white","black");const C=this.value.toString().padStart(5);g(e,M,v,C,b?"black":"white",b?"green":"black");for(let k=0;k<l;k++){const K=o[k],W=p+5+k,X=K.compute(this.value);g(e,W,d+1,K.label.padEnd(S)+" : ","white","black"),g(e,W,v,X,"white","black")}const _=p+4+l+2,T=`[ ${a} ]`,E="[ CANCEL ]",Y=3,O=T.length+Y+E.length,$=Math.floor((m-O)/2),w=d+1+$,R=w+T.length+Y;this.confirmRect={col:w,row:_,width:T.length},this.cancelRect={col:R,row:_,width:E.length};const L=this.focus==="confirm",A=this.focus==="cancel";g(e,_,w,T,L?"black":"white",L?"green":"black"),g(e,_,R,E,A?"black":"white",A?"green":"black")}}class ar extends he{constructor(e,t,i,r,s,o,a,l,c,h){const d=N(r),p=i.getMissionsForPickup(r),u=i.getMissionsForDelivery(r),m=p.map(A=>({label:`COLLECT: ${A.type==="delivery"?A.itemName:""}`,accentFg:"bright-yellow",action:()=>{}})),f=u.map(A=>({label:`DELIVER: ${A.title} → ${A.reward} CR`,accentFg:"bright-yellow",action:()=>{}})),y=[...m,...f],x=[];d.amenities.trader&&x.push({label:"TRADER",action:o}),i.getDestinationMissions(r).length>0&&x.push({label:"MISSION BOARD",action:a});const S=P();let v=null;if(d.owningFactionId){const A=D().factions.find(k=>k.id===d.owningFactionId);A&&de(A)&&(v=d.owningFactionId)}const M=S.fuel.pricePerLitre,b=v?Gn(Ae(i.getFactionReputation(v),S),S):1,C=Math.round(M*b),_=i.fuelCapacityL-i.fuelL,T=Math.floor(i.credits/C),E=Math.min(_,T);let Y=null;if(d.amenities.fuel&&E>0){const A=E*C;Y=y.length+(y.length>0?1:0)+x.length,x.push({label:`BUY FUEL  +${E}L  ${A}CR`,action:()=>{}})}const O=[];y.length>0&&(O.push(...y),O.push({label:"────────────────────",disabled:!0,action:()=>{}})),O.push(...x);const $=Ze(d.description,36).slice(0,3),w=`DANGER: ${d.dangerLevel.toUpperCase()}`,R=[...$,w];if(d.owningFactionId){const A=D().factions.find(k=>k.id===d.owningFactionId);A&&R.push(`OPERATED BY: ${A.name}`)}const L=d.locationType==="surface"||d.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",O,[{id:"undock",label:L}],e,t,i,R,null,h),this.onShip=c,this.onRefuel=s,this.onHub=l,this.fuelItemIdx=Y,this.eligibleFactionId=v;for(let A=0;A<p.length;A++){const k=p[A];m[A].action=()=>{this.player.collectMissionItem(k.id),this.onHub()}}for(let A=0;A<u.length;A++){const k=u[A];f[A].action=()=>{if(Me(k,this.player)!=="ready-to-deliver"){this.openModal(new yn({title:"CANNOT DELIVER",body:k.type==="delivery"?"Mission item is missing from your cargo.":"Required supplies are missing from your cargo.",confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.activated=!1}}));return}if(k.type==="supply")for(const we of k.requirements)this.player.removeCargo(we.commodityId,we.qty);const W=P(),X=D();let on="";if(k.giverFactionId){const we=X.factions.find(Oe=>Oe.id===k.giverFactionId);if(we){const Oe=k.reward;let Pe;Oe>=W.reputation.missionTierLargeReward?Pe=W.reputation.missionDeltaLarge:Oe>=W.reputation.missionTierMediumReward?Pe=W.reputation.missionDeltaMedium:Pe=W.reputation.missionDeltaSmall;const Nn=Mn(we,Pe,X.factions);for(const[V,Q]of Nn)this.player.modifyFactionReputation(V,Q,W);const an=[];for(const[V,Q]of Nn){const On=X.factions.find(Si=>Si.id===V);On&&an.push({id:V,name:On.name,delta:Q})}an.sort((V,Q)=>V.delta!==Q.delta?Q.delta-V.delta:V.name.localeCompare(Q.name)),on=`

REPUTATION:
`;for(const V of an){const Q=Tn(V.delta);on+=`  ${V.name.padEnd(20)} ${Q}
`}}}this.player.completeMission(k.id),this.player.addCredits(k.reward),this.openModal(new yn({title:"MISSION COMPLETE",body:`Mission complete!

You received ${k.reward} CR.${on}`,confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.onHub()}}))}}}effectiveFuelPrice(){const e=P(),t=e.fuel.pricePerLitre;if(!this.eligibleFactionId)return t;const i=Ae(this.player.getFactionReputation(this.eligibleFactionId),e);return Math.round(t*Gn(i,e))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx===-1)return;const t=e[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const i=this.effectiveFuelPrice(),r=this.player.fuelCapacityL-this.player.fuelL,s=Math.floor(this.player.credits/i),o=Math.min(r,s);this.openModal(new bn({title:"BUY FUEL",field:{label:"Litres",initialValue:o,min:0,max:o},derivedRows:[{label:"Cost",compute:a=>`${a*i} CR`}],confirmLabel:"BUY",onConfirm:a=>{this.closeModal(),a>0&&this.onRefuel(a*i,a)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class lr extends he{constructor(e,t,i,r,s,o,a,l,c,h){var f;const d=N(r),p=((f=d.npcs.trader)==null?void 0:f.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(p,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,i,[],u,h),this.repGainedThisVisit=0,this.traderStock=s,this.onBuy=o,this.onSell=a,this.onHub=l,this.onUndock=c;const m=d.owningFactionId;if(m){const y=Ut(m);this.eligibleFactionId=y&&de(y)?m:null}else this.eligibleFactionId=null;this.syncItems(),this.clampCursor()}buyPrice(e,t){return Math.round(e*t)}sellPrice(e,t){return Math.round(e*t)}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(e=>{const t=ae(e.commodityId);if(!t)return[];const i=e.effectiveFactor??1,r=this.buyPrice(t.basePrice,i),s=this.player.credits>=r;return[{label:`${t.name} (x${e.qty})`,info:`${r} CR`,disabled:!s,action:()=>{const o=Math.floor(this.player.credits/r),a=Math.min(e.qty,o);this.openModal(new bn({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:a,min:0,max:a},derivedRows:[{label:"Total",compute:l=>`${l*r} CR`}],confirmLabel:"BUY",onConfirm:l=>{l>0&&(this.onBuy(e.commodityId,l,r),this.accrueReputation(l*r)),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const e=this.player.cargoHold;return e.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...e].flatMap(t=>{const i=ae(t.commodityId);if(!i)return[];const r=N(this.player.destinationId??""),s=Z(r.system),o=Ve(t.commodityId,s),a=this.sellPrice(i.basePrice,o);return[{label:`${i.name} (x${t.qty})`,info:`${a} CR`,action:()=>{this.openModal(new bn({title:i.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:l=>`${l*a} CR`}],confirmLabel:"SELL",onConfirm:l=>{l>0&&this.onSell(t.commodityId,l,a),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}accrueReputation(e){if(!this.eligibleFactionId)return;const t=P(),i=t.reputation.maxRepPerVisit-this.repGainedThisVisit;if(i<=0)return;const r=Math.min(i,e*t.reputation.repPerCredit);r<=0||(this.repGainedThisVisit+=r,this.player.modifyFactionReputation(this.eligibleFactionId,r,t))}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const e=this.items;(this.cursorIdx<0||this.cursorIdx>=e.length||(t=e[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=e.findIndex(i=>!i.disabled))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const t=e[this.cursorIdx];t.disabled||t.action()}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(e){if(this.syncItems(),super.render(e),this.eligibleFactionId){const r=P(),s=this.player.getFactionReputation(this.eligibleFactionId),o=Ae(s,r),l=`STANDING: ${$t(o)}`;g(e,le+2,2,l,"bright-black","black")}const t=e.length,i=Cn(t,!0)-2;g(e,i,2,`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,"bright-black","black")}}const cr={delivery:"[D] ",supply:"[S] "};class me extends he{constructor(e,t,i,r,s,o,a,l,c){N(r);let h;s.length===0?h=[{label:"NO MISSIONS AVAILABLE",disabled:!0,action:()=>{}}]:h=me.sortMissions(s).map(p=>me.buildMenuItem(p,i,o)),super("MISSION BOARD",h,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,i,[],null,c),this.onHub=a,this.onUndock=l}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}static sortMissions(e){return[...e].sort((t,i)=>{var l,c;const r=((l=N(t.deliveryDestinationId))==null?void 0:l.name)??t.deliveryDestinationId,s=((c=N(i.deliveryDestinationId))==null?void 0:c.name)??i.deliveryDestinationId,o=r.localeCompare(s);if(o!==0)return o;const a={delivery:0,supply:1};return a[t.type]-a[i.type]})}static destColor(e,t){if(e===t.destinationId)return"bright-green";const i=N(e);return i&&i.system===t.systemId?"bright-yellow":"white"}static buildMenuItem(e,t,i){const r=N(e.deliveryDestinationId),s=(r==null?void 0:r.name)??e.deliveryDestinationId,o=[];if(o.push(`Dest: ${s}`),e.giverFactionId){const l=D().factions.find(c=>c.id===e.giverFactionId);l&&o.push(`For: ${l.name}`)}e.type!=="supply"&&o.push("");const a=e.type==="supply"?me.buildSupplyDetails(e,t):[];return{label:e.title,icon:cr[e.type],iconFg:"bright-yellow",info:`${e.reward} CR`,infoFg:"bright-green",details:o,detailsFg:me.destColor(e.deliveryDestinationId,t),detailsColored:a,action:()=>i(e)}}static buildSupplyDetails(e,t){if(e.type!=="supply")return[];const i=e.requirements.map(r=>{const s=D().commodities.find(h=>h.id===r.commodityId),o=(s==null?void 0:s.name)??r.commodityId,a=t.cargoHold.find(h=>h.commodityId===r.commodityId),l=(a==null?void 0:a.qty)??0,c=l>=r.qty;return{left:[{text:`${r.qty}x ${o} `,fg:"white"},{text:`(have: ${l})`,fg:c?"bright-green":"bright-black"}]}});return i.push({left:[]}),i}}class hr extends ee{constructor(e,t,i,r,s,o,a){super(s,o,a,{navOptions:r,title:e}),this.cursorIdx=-1,this.lastChoicesStartRow=0,this._choices=t,this._onBack=i,this.resetCursor()}preHandleAction(e){return e==="BACK"?(this.activated=!0,this._onBack(),!0):!1}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="SELECT"&&this.activateCurrent()}handleTap(e,t){const i=this.rowToChoiceIndex(t);i!==null&&!this._choices[i].disabled&&(this.cursorIdx=i,this.activateCurrent())}moveCursor(e){const t=this._choices,i=t.length;if(i===0)return;const r=this.cursorIdx===-1?e>0?i-1:0:this.cursorIdx;for(let s=0;s<i;s++){const o=((r+e*(s+1))%i+i)%i;if(!t[o].disabled){this.cursorIdx=o;return}}}activateCurrent(){if(this._choices.length===0||this.cursorIdx===-1)return;const e=this._choices[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}resetCursor(){const e=this._choices;for(let t=0;t<e.length;t++)if(!e[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}computeChoicesHeight(){var t;let e=0;for(const i of this._choices)e+=1+(((t=i.details)==null?void 0:t.length)??0);return e}rowToChoiceIndex(e){var i;if(e<this.lastChoicesStartRow)return null;let t=this.lastChoicesStartRow;for(let r=0;r<this._choices.length;r++){const s=1+(((i=this._choices[r].details)==null?void 0:i.length)??0);if(e>=t&&e<t+s)return r;t+=s}return null}render(e){const t=e.length,i=t>0?e[0].length:0;for(let m=0;m<t;m++)for(let f=0;f<i;f++)e[m][f]={char:" ",fg:"black",bg:"black"};const r=this.buildChromeConfig();this.chrome.render(e,r);const s=!0,o=le,a=Cn(t,s),l=this.opts.title;l!==void 0&&(g(e,o,2,l,"bright-white","black"),g(e,o+1,2,"'".repeat(l.length),"bright-black","black"));const c=o+2,h=this.computeChoicesHeight(),d=a-h-1,p=d-1;this.renderContent(e,c,p),d>=0&&d<t&&pe(e,d,i);let u=d+1;this.lastChoicesStartRow=u;for(let m=0;m<this._choices.length;m++){const f=this._choices[m],y=m===this.cursorIdx,x=y?">":" ",S=f.disabled?"bright-black":y?"bright-green":"white";if(u<t&&(g(e,u,2,x,S,"black"),g(e,u,3,f.label,S,"black")),u++,f.details)for(const v of f.details)u<t&&g(e,u,4,v.slice(0,i-4),"bright-black","black"),u++}}}const dr={delivery:"[D]",supply:"[S]"};class ur extends hr{constructor(e,t,i,r,s,o,a,l){const c=zi(i,r),h=r.type==="delivery"&&r.pickupDestinationId===r.issuingDestinationId,d=c.ok?{label:"ACCEPT MISSION",action:()=>s(h)}:{label:"ACCEPT MISSION",disabled:!0,details:c.reason?[c.reason]:[],action:()=>{}},p={label:"BACK",action:()=>o()};super("MISSION BOARD",[d,p],o,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,i),this.spec=r,this.onHub=a,this.onUndock=l}destColor(e){if(e===this.player.destinationId)return"bright-green";const t=N(e);return t&&t.system===this.player.systemId?"bright-yellow":"white"}writeDestRow(e,t,i,r,s,o){g(e,t,2,i,"white","black"),g(e,t,2+i.length,r.slice(0,o-i.length),this.destColor(s),"black")}handleAction(e){e==="NAV_1"?(this.activated=!0,this.onUndock()):e==="NAV_2"?(this.activated=!0,this.onHub()):super.handleAction(e)}handleNavTap(e){this.activated||(e==="undock"?(this.activated=!0,this.onUndock()):e==="hub"&&(this.activated=!0,this.onHub()))}renderContent(e,t,i){this.renderDetail(e,t,i)}renderDetail(e,t,i){const s=e.length>0?e[0].length:40,o=s-4;let a=t;const l=(u,m,f)=>{u<=i&&g(e,u,2,m.slice(0,o),f,"black")};l(a,`${dr[this.spec.type]} ${this.spec.title}`,"bright-yellow"),a++;const c=D(),h=this.spec.giverFactionId?c.factions.find(u=>u.id===this.spec.giverFactionId):null,d=h?` [${h.name}]`:"";if(l(a,`    ${this.spec.giverName}${d}`,"bright-black"),a++,a++,this.spec.type==="delivery"){const u=N(this.spec.pickupDestinationId),m=N(this.spec.deliveryDestinationId);if(a<=i&&this.writeDestRow(e,a,"Pickup:  ",(u==null?void 0:u.name)??this.spec.pickupDestinationId,this.spec.pickupDestinationId,o),a++,a<=i&&this.writeDestRow(e,a,"Deliver: ",(m==null?void 0:m.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++,a<=i){const f=this.player.cargoCapacity-this.player.cargoWeightKg,y=this.spec.itemWeightKg,x=f>=y,S=`Weight:  ${y} kg  (Free: ${f} kg)`;g(e,a,2,S,"white","black");const v=x?"bright-green":"red",M=2+S.length+1;M<s&&g(e,a,M,x?"✓":"✗",v,"black")}a++}else{const u=N(this.spec.deliveryDestinationId);a<=i&&this.writeDestRow(e,a,"Deliver to: ",(u==null?void 0:u.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++;for(const m of this.spec.requirements){if(a>i)break;const f=ae(m.commodityId);l(a,`  ${m.qty}x ${(f==null?void 0:f.name)??m.commodityId}`,"white"),a++}}a++;const p=Ze(this.spec.description,o);for(const u of p){if(a>i)break;l(a,u,"white"),a++}if(a++,!(a>i)&&(l(a,`REWARD: ${this.spec.reward} CR`,"bright-green"),a++,this.spec.type==="delivery"&&this.spec.deposit>0&&(a<=i&&l(a,`DEPOSIT: ${this.spec.deposit} CR`,"bright-yellow"),a++),this.spec.giverFactionId)){const u=c.factions.find(m=>m.id===this.spec.giverFactionId);if(u){const m=P(),f=this.spec.reward;let y;f>=m.reputation.missionTierLargeReward?y=m.reputation.missionDeltaLarge:f>=m.reputation.missionTierMediumReward?y=m.reputation.missionDeltaMedium:y=m.reputation.missionDeltaSmall;const x=Mn(u,y,c.factions),S=[];for(const[v,M]of x){const b=c.factions.find(C=>C.id===v);b&&S.push({id:v,name:b.name,delta:M})}if(S.sort((v,M)=>v.delta!==M.delta?M.delta-v.delta:v.name.localeCompare(M.name)),S.length>0){if(a++,a>i)return;const v=i-1;a<=v&&(l(a,"REPUTATION IMPACT","bright-cyan"),a++);for(const M of S){if(a>v)break;const b=Tn(M.delta),C=M.delta>0?"bright-green":"red",_=o-b.length-2,T=M.name.slice(0,_),E=" ".repeat(Math.max(0,o-T.length-b.length-2));l(a,`  ${T}${E}${b}`,C),a++}}}}}}function pr(n){if(n.length===0)return 2166136261;let e=2166136261;for(let t=0;t<n.length;t++)e^=n.charCodeAt(t),e=Math.imul(e,16777619)>>>0;return e===0?1:e}const mr=[30,10,5],fr=[".","*","+"],Yn=[4e3,2e3,800],gr=[9e3,5e3,2500],yr=[null,"bright-black","white"],_r=["bright-black","white","bright-white"],br=["white","bright-white","bright-cyan"],He=3,Kn=25,Ue=2,jn=37,qn=2*Math.PI;function vr(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}class wr{constructor(e=42){this.boundsSet=!1,this.rand=vr(e),this.stars=[];for(let t=0;t<3;t++)for(let i=0;i<mr[t];i++){const r=Ue+Math.floor(this.rand()*(jn-Ue+1)),s=He+Math.floor(this.rand()*(Kn-He+1)),o=this.rand()*qn,a=Yn[t]+this.rand()*(gr[t]-Yn[t]);this.stars.push({col:r,row:s,layer:t,twinklePhase:o,twinklePeriod:a})}}update(e){for(const t of this.stars)t.twinklePhase+=qn/t.twinklePeriod*e}render(e,t,i,r,s){if(!this.boundsSet){this.boundsSet=!0;const o=Kn-He,a=jn-Ue;{const l=(i-t)/o,c=(s-r)/a;for(const h of this.stars)h.row=Math.round(t+(h.row-He)*l),h.col=Math.round(r+(h.col-Ue)*c)}}for(const o of this.stars){const{row:a,col:l,layer:c}=o;if(a<t||a>i||l<r||l>s)continue;const h=Math.sin(o.twinklePhase);let d;h>=.5?d=br[c]:h>=-.5?d=_r[c]:d=yr[c],d!==null&&(e[a][l]={char:fr[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const kr=2,xr=3,Cr=2*Math.PI/9e3,Tr=2*Math.PI/12e3,Mr=Math.PI/3;function Vn(n,e,t){return Math.max(e,Math.min(t,n))}class Ir{constructor(e,t,i,r,s,o=.5,a=.6){this.time=0,this.glyph=e,this.intRowStart=t,this.intRowEnd=i,this.intColStart=r,this.intColEnd=s,this.glyphHeight=e.rows.length,this.glyphWidth=Math.max(...e.rows.map(l=>l.length)),this.anchorRow=t+Math.floor((i-t)*o)-Math.floor(this.glyphHeight/2),this.anchorCol=r+Math.floor((s-r)*a)-Math.floor(this.glyphWidth/2)}update(e){this.time+=e}getDisplayPosition(){const e=Math.round(kr*Math.sin(this.time*Cr)),t=Math.round(xr*Math.sin(this.time*Tr+Mr)),i=Vn(this.anchorRow+e,this.intRowStart,this.intRowEnd-this.glyphHeight+1),r=Vn(this.anchorCol+t,this.intColStart,this.intColEnd-this.glyphWidth+1);return{row:i,col:r}}render(e){const{row:t,col:i}=this.getDisplayPosition(),r=this.glyph.fg;for(let s=0;s<this.glyph.rows.length;s++){const o=this.glyph.rows[s];let a=-1,l=-1;for(let c=0;c<o.length;c++)o[c]!==" "&&(a===-1&&(a=c),l=c);if(a!==-1)for(let c=a;c<=l;c++){const h=o[c],d=t+s,p=i+c;d>=0&&d<e.length&&p>=0&&p<e[d].length&&(e[d][p]=h===" "?{char:" ",fg:"black",bg:"black"}:{char:h,fg:r,bg:"black"})}}}}const zn=[{rows:[">---<"," |*| ","  |  "],fg:"bright-white"},{rows:["/-\\","|O|","\\-/"],fg:"cyan"},{rows:["  *  ","--+--"," [H] ","  |  ","  *  "],fg:"bright-white"}],Xn=[{rows:[" /\\/\\","< ** >"," \\__/"],fg:"yellow"},{rows:["  ___"," /   \\","|  .  |"," \\___/"],fg:"yellow"},{rows:[" _/\\_","/  . \\","\\____/"],fg:"yellow"}],Qn=[{rows:["  .--."," / .. \\","| .... |"," \\ .. /","  `--'"],fg:"blue"},{rows:["  .--."," / ~~ \\","| ~~~~ |"," \\ ~~ /","  `--'"],fg:"bright-yellow"},{rows:["  .--."," /====\\","|======|"," \\====/","  `--'"],fg:"bright-cyan"}];function Ar(n,e){return n==="orbital"||n==="deep-space"?zn[e%zn.length]:n==="asteroid"?Xn[e%Xn.length]:n==="surface"?Qn[e%Qn.length]:null}const Sr=6,cn=6,Er=23,Rr=23,hn=10,Lr=0,Fr=4,Dr=18,Nr=21,Or=35,Pr=39,Jn=12,Br=11,re=13,xe=27,dn=28,Hr=12,un=40,Zn=200,pn=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],Ur="#",et=["green","cyan","white","yellow"],nt=["*",".","+","x"];function $r(n){return n>=.8?"bright-green":n>=.5?"yellow":"red"}function tt(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function Gr(n,e,t){return{col:e,row:t,char:Ur,color:et[Math.floor(n()*et.length)],phase:n()*2e4,period:1e4+n()*1e4,active:n()>.2}}function Ce(n,e,t,i){const r=[];for(const s of i)for(let o=e;o<=t;o++)r.push(Gr(n,o,s));return r}class Wr extends ee{constructor(e,t,i,r,s,o,a){var u;super(e,t,i,{navOptions:[],onMenu:a}),this.cursorIdx=0,this.h=30,this.destObject=null,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.onTravel=r,this.onDock=s,this.onCargo=o;const l=pr(i.destinationId??"");this.starfield=new wr(l),this.inSpace=i.destinationId===null;const c=i.destinationId!=null?(u=N(i.destinationId))==null?void 0:u.locationType:void 0;this.destGlyph=Ar(c,l),this.destRowFrac=.15+Math.random()*.7,this.destColFrac=.15+Math.random()*.7;const h=tt(99);this.gaugeBtns=[...Ce(h,Lr,Fr,[3,4]),...Ce(h,Dr,Nr,[3,4]),...Ce(h,Or,Pr,[3,4])],this.leftBtns=Ce(h,0,Br,[0,1,2,3]),this.rightBtns=Ce(h,dn,39,[0,1,2,3]);const d=tt(77),p=3+Math.floor(d()*4);this.radarContacts=Array.from({length:p},()=>({x:d()*(xe-re-1),y:d()*4,vx:(d()-.5)*2,vy:(d()-.5)*1.5,char:nt[Math.floor(d()*nt.length)]}))}navCount(){return this.inSpace?1:2}handleAction(e){e==="CARGO"?(this.activated=!0,this.onCargo()):e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.navCount())%this.navCount():e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.navCount():e==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,this.onTravel()):this.inSpace||(this.activated=!0,this.onDock()))}handleTap(e,t){const i=this.h;(t===3||t===4)&&e>=cn&&e<cn+1+hn?(this.activated=!0,this.onCargo()):t===i-3&&e<Jn?(this.activated=!0,this.onTravel()):t===i-3&&e>=dn&&!this.inSpace&&(this.activated=!0,this.onDock())}update(e){var r;this.starfield.update(e),(r=this.destObject)==null||r.update(e),this.blinkPhase=(this.blinkPhase+e)%1e3;for(const s of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])s.phase+=e,s.phase>=s.period&&(s.phase-=s.period,s.active=!s.active);const t=xe-re,i=5;for(const s of this.radarContacts)s.x+=s.vx*e/1e3,s.y+=s.vy*e/1e3,s.x<0&&(s.x=-s.x,s.vx=-s.vx),s.x>t-1&&(s.x=2*(t-1)-s.x,s.vx=-s.vx),s.y<0&&(s.y=-s.y,s.vy=-s.vy),s.y>i-1&&(s.y=2*(i-1)-s.y,s.vy=-s.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-e);else for(this.tickerAccum+=e;this.tickerAccum>=Zn;){this.tickerAccum-=Zn,this.tickerScroll++;const s=pn[this.msgIdx];if(this.tickerScroll>=s.length+un-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%pn.length,this.tickerPause=500,this.tickerAccum=0;break}}}renderContent(e,t,i){var d;const r=e.length,s=r>0?e[0].length:0;this.h=r;const o=t+2,a=r-8,l=r-7,c=r-3,h=r-2;this.renderGaugeStrip(e,t),this.starfield.render(e,o,a,0,39),!this.destObject&&this.destGlyph&&(this.destObject=new Ir(this.destGlyph,o+1,a-1,0,39,this.destRowFrac,this.destColFrac)),(d=this.destObject)==null||d.render(e);for(let p=0;p<s;p++)e[o][p]={char:"-",fg:"white",bg:"black"},e[a][p]={char:"-",fg:"white",bg:"black"};this.renderHUD(e,o+1),this.renderCrosshair(e,o+1,a-1),this.renderBottomPanels(e,l,c),this.renderTicker(e,h)}renderGaugeStrip(e,t){for(const a of this.gaugeBtns){const l=t+a.row-3,c=a.active?a.color:"bright-black";l>=0&&l<e.length&&(e[l][a.col]={char:a.char,fg:c,bg:"black"})}const i=this.player.fuelL/this.player.fuelCapacityL,r=this.player.cargoWeightKg/this.player.cargoCapacity,s=this.blinkPhase<500,o=$r(this.player.hullIntegrity);this.renderGauge(e,t,Sr,"F",i,"yellow",s),this.renderGauge(e,t+1,cn,"C",r,"blue",s),this.renderGauge(e,t,Er,"S",1,"cyan",s),this.renderGauge(e,t+1,Rr,"H",this.player.hullIntegrity,o,s)}renderGauge(e,t,i,r,s,o,a){if(t<0||t>=e.length)return;e[t][i]={char:r,fg:o,bg:"black"};const l=Math.round(Math.min(1,Math.max(0,s))*hn),c=s<=.2;for(let h=0;h<hn;h++){const d=i+1+h;if(h<l){const p=c&&!a?"bright-black":o;e[t][d]={char:" ",fg:"black",bg:p}}else e[t][d]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(e,t){g(e,t,1,"VEL:----","bright-black","black"),g(e,t,16,"ATT:---°","bright-black","black"),g(e,t,30,"ROT:--°","bright-black","black")}renderCrosshair(e,t,i){var a;const r=Math.floor((t+i)/2),s=20;e[r][s]={char:"+",fg:"bright-green",bg:"black"};const o=[[r-3,s-5],[r-3,s+5],[r+3,s-5],[r+3,s+5]];for(const[l,c]of o){const h=((a=e[0])==null?void 0:a.length)??40;l>=t&&l<=i&&c>=0&&c<h&&(e[l][c]={char:"+",fg:"bright-green",bg:"black"})}}renderBottomPanels(e,t,i){for(let c=t;c<=i;c++)for(let h=re;h<xe;h++)e[c][h]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(e,t,i-t+1);for(const c of this.leftBtns){const h=t+c.row;if(h<i){const d=c.active?c.color:"bright-black";e[h][c.col]={char:c.char,fg:d,bg:"black"}}}for(const c of this.rightBtns){const h=t+c.row;if(h<i){const d=c.active?c.color:"bright-black";e[h][c.col]={char:c.char,fg:d,bg:"black"}}}const r=this.cursorIdx===0?"bright-yellow":"yellow";g(e,i,0,this.centerPad("TRAVEL",Jn),"black",r);let s,o;this.inSpace?(s="bright-black",o="bright-black"):(s=this.cursorIdx===1?"bright-cyan":"cyan",o="black"),g(e,i,dn,this.centerPad("DOCK",Hr),o,s);const a=xe-re,l="<)) "+"-".repeat(a-4);g(e,i,re,l,"white","bright-black")}renderRadar(e,t,i){for(const r of this.radarContacts){const s=Math.min(xe-re-1,Math.max(0,Math.floor(r.x))),o=Math.min(i-1,Math.max(0,Math.floor(r.y)));e[t+o][re+s]={char:r.char,fg:"white",bg:"bright-black"}}}renderTicker(e,t){const i=pn[this.msgIdx];for(let r=0;r<un;r++){const s=this.tickerScroll-un+1+r,o=s>=0&&s<i.length?i[s]:" ";e[t][r]={char:o,fg:"white",bg:"black"}}}centerPad(e,t){if(e.length>=t)return e.slice(0,t);const i=t-e.length,r=Math.floor(i/2);return" ".repeat(r)+e+" ".repeat(i-r)}}class Yr extends ee{constructor(e,t,i,r,s){super(e,t,i,{title:"CARGO HOLD",tabs:["COMMODITIES","MISSION GOODS"],navOptions:[{id:"back",label:"BACK"}],onMenu:s}),this.onBack=r}handleNavTap(e){e==="back"&&(this.activated=!0,this.onBack())}handleAction(e){(e==="BACK"||e==="CARGO")&&(this.activated=!0,this.onBack())}renderContent(e,t,i){const s=e.length>0?e[0].length:0,o=this.player.cargoHold,a=this.player.missionItems,l=this.player.cargoCapacity,c=this.player.cargoWeightKg,h=i-1;this.activeTabIdx===0?this.renderCommoditiesTab(e,t,h,s,o):this.renderMissionGoodsTab(e,t,h,s,a);const d=`CARGO: ${c}/${l}KG`,p=`FUEL: ${this.player.fuelL}/${this.player.fuelCapacityL}L`;g(e,h,2,d,"bright-black","black"),g(e,h,s-p.length-2,p,"bright-black","black")}renderCommoditiesTab(e,t,i,r,s){if(s.length===0){g(e,t,2,"NO COMMODITIES","bright-black","black");return}let o=t;for(const a of s){if(o>=i-1)break;const l=ae(a.commodityId);if(!l)continue;const c=a.qty*l.weightKg,h=`  x${a.qty}  ${l.basePrice}CR  ${c}KG`,d=Math.max(6,r-4-h.length),p=l.name,u=p.length>d?p.slice(0,d):p;g(e,o,2,`${u}${h}`,"white","black"),o++}}renderMissionGoodsTab(e,t,i,r,s){if(s.length===0){g(e,t,2,"NO MISSION GOODS","bright-black","black");return}let o=t;for(const a of s){if(o>=i-1)break;const l=`  ${a.weightKg}KG`,c=Math.max(6,r-4-l.length),h=a.itemName.length>c?a.itemName.slice(0,c):a.itemName;g(e,o,2,`${h}${l}`,"white","black"),o++}}}class it extends he{constructor(e,t,i,r,s,o,a,l,c=()=>{},h){const d=Z(i.systemId),p=Bt(i.driveId),u=i.getInSystemHopCost(),m=i.fuelL<u,f=[...d.destinations.map(v=>({label:`${N(v).name.toUpperCase()}  [${u}L]`,disabled:v===i.destinationId||m,action:()=>r(v)})),{label:`FLY INTO SPACE  [${u}L]`,disabled:i.destinationId===null||m,action:o}];m&&h&&f.push({label:"[EMERGENCY]",disabled:!1,action:h});const x=[...xn(i.systemId).map(v=>{const M=v.from===i.systemId?v.to:v.from,b=Z(M),C=Math.ceil(P().fuel.consumptionPerLy*v.distance*p.fuelEfficiency);return{label:`${b.name.toUpperCase()}  ${v.distance}LY  [${C}L]`,disabled:C>i.fuelL,action:()=>s(M)}}),{label:"GALAXY MAP...",action:l}],S=[{label:"DESTINATIONS",items:f},{label:"JUMPS",items:x}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],e,t,i,[],S,c),this.onShip=a}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}class Kr extends ee{constructor(e,t,i,r,s,o){super(e,t,i,{navOptions:[],title:"EMERGENCY RESCUE"}),this.cursorIdx=0,this.onBack=o;const a=Z(i.systemId),l=P();if(this.options=[],this.fuelDestId=a.destinations.find(c=>{var h;return((h=N(c))==null?void 0:h.amenities.fuel)===!0}),this.fuelDestId){const c=N(this.fuelDestId);this.options.push({label:`TOW TO ${c.name.toUpperCase()}`,fee:l.emergencyRescue.towFee,action:()=>r(this.fuelDestId)})}this.options.push({label:"EMERGENCY FUEL DROP",fee:l.emergencyRescue.fuelDropFee,action:s}),this.options.push({label:"BACK",fee:0,action:o})}preHandleAction(e){return e==="BACK"?(this.activated=!0,this.onBack(),!0):!1}handleAction(e){e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.options.length)%this.options.length:e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.options.length:e==="SELECT"&&this.cursorIdx>=0&&this.cursorIdx<this.options.length&&(this.activated=!0,this.options[this.cursorIdx].action())}handleTap(e,t){this.cursorIdx>=0&&this.cursorIdx<this.options.length&&(this.activated=!0,this.options[this.cursorIdx].action())}renderContent(e,t,i){const r=e.length,s=r>0?e[0].length:0,o=Z(this.player.systemId);let a;this.player.destinationId===null?a=`STRANDED IN SPACE NEAR ${o.name.toUpperCase()}`:a=`STRANDED AT ${N(this.player.destinationId).name.toUpperCase()}`,g(e,t,2,a,"bright-yellow","black");const l=t+2;pe(e,l,s);let c=l+1;for(let h=0;h<this.options.length;h++){const d=this.options[h],p=h===this.cursorIdx,u=p?">":" ",m=p?"bright-green":"white";if(c<r)if(g(e,c,2,u,m,"black"),d.fee===0)g(e,c,3,d.label,m,"black");else{g(e,c,3,d.label,m,"black");const f=this.player.credits-d.fee,y=`${d.fee} CR  (BALANCE: ${f>=0?"":"-"}${Math.abs(f)} CR)`,x=f<0?"bright-red":m;c+1<r&&g(e,c+1,4,y,x,"black"),c++}c++}}}function rt(n,e){if(n===e)return[n];const t=[[n]],i=new Set([n]);for(;t.length>0;){const r=t.shift(),s=r[r.length-1];for(const o of xn(s)){const a=o.from===s?o.to:o.from;if(a===e)return[...r,a];i.has(a)||(i.add(a),t.push([...r,a]))}}return null}const jr=0,qr=4,Vr=8,zr=9,st=10,ot=15,Xr=16,Qr=2,Jr=10,Zr=12,$e=13,Ge=12,es=25,ns=26,ts=10,at=18;function is(n,e){return n.length>=e?n.slice(0,e):n+" ".repeat(e-n.length)}function Te(n,e){return"["+is(n.toUpperCase(),e-2)+"]"}class lt extends ee{constructor(e,t,i,r,s=()=>{},o){const a=o?[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}]:[{id:"back",label:"BACK"}];super(e,t,i,{title:"GALAXY MAP",tabs:["MAP","ROUTE"],navOptions:a,onMenu:s}),this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.lastTop=le+5,this.onBack=r,this.onGame=o,this.publicSystems=Yi().sort((l,c)=>l.distanceFromSol-c.distanceFromSol),this.otherSystems=this.publicSystems.filter(l=>l.id!==i.systemId),this.mapBrowsingSystemId=i.systemId}onTabChange(e){this.searchText=""}handleCharInput(e){if(this.activeTabIdx!==0)return;const t=e.charCodeAt(0);e==="\b"||e===""?this.searchText=this.searchText.slice(0,-1):t>=32&&t<127&&(this.searchText+=e.toUpperCase(),this.mapCursorIdx=0)}handleAction(e){if(e==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}if(e==="NAV_1"){this.onGame&&(this.activated=!0,this.onGame());return}if(e==="NAV_2"){this.onGame&&(this.searchText="",this.activated=!0,this.onBack());return}this.activeTabIdx===0?this.handleMapAction(e):this.handleRouteAction(e)}handleNavTap(e){e==="back"?(this.searchText="",this.activated=!0,this.onBack()):e==="game"&&this.onGame?(this.activated=!0,this.onGame()):e==="menu"&&(this.searchText="",this.activated=!0,this.onBack())}handleTap(e,t){const i=this.lastTop,r=i+st,s=i+ot;if(this.activeTabIdx===0&&t>=r&&t<s){const o=this.getMapNeighbors(),a=t-r;a>=0&&a<o.length&&(this.mapBrowsingSystemId=o[a].id,this.mapCursorIdx=0,this.searchText="")}else if(this.activeTabIdx===1){const o=i+3,a=i+9;if(t>=o&&t<=a){const l=t-o;l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}}}getMapNeighbors(){const t=xn(this.mapBrowsingSystemId).map(i=>{const r=i.from===this.mapBrowsingSystemId?i.to:i.from,s=this.publicSystems.find(a=>a.id===r),o=i.distance;return s?{sys:s,dist:o}:null}).filter(i=>i!==null).sort((i,r)=>i.dist-r.dist).map(i=>i.sys);return this.searchText.length===0?t:t.filter(i=>i.name.toUpperCase().includes(this.searchText))}handleMapAction(e){const t=this.getMapNeighbors(),i=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(e==="UP")this.mapCursorIdx=Math.max(0,i-1);else if(e==="DOWN")this.mapCursorIdx=Math.min(t.length-1,i+1);else if(e==="SELECT"){const r=t[i];if(!r)return;this.mapBrowsingSystemId=r.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(e){e==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):e==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const e=this.otherSystems[this.routeDestIdx];return e?rt(this.player.systemId,e.id):null}renderContent(e,t,i){this.lastTop=t;const r=e.length>0?e[0].length:0;this.activeTabIdx===0?this.renderMapTab(e,t,i,r):this.renderRouteTab(e,t,i,r)}renderMapTab(e,t,i,r){const s=this.publicSystems.find(p=>p.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!s)return;const o=t+zr,a=t+st,l=t+ot,c=t+Xr;this.renderChart(e,s,t),pe(e,o,r);const h=this.getMapNeighbors(),d=Math.min(this.mapCursorIdx,Math.max(0,h.length-1));this.renderNeighborList(e,r,s,h,d,a,l),pe(e,l,r),this.renderInfo(e,r,s,h[d]??null,c),this.searchText.length>0&&g(e,c+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(e,t,i){var h;const r=this.getMapNeighbors(),s=i+jr,o=i+qr,a=i+Vr,l=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(g(e,o,$e,Te(t.name,Ge),l,"black"),t.id===this.player.systemId){const d=$e+Ge,p=((h=e[0])==null?void 0:h.length)??40;d<p&&(e[o][d]={char:"*",fg:"bright-yellow",bg:"black"})}const c=["left","right","top","bottom"];for(let d=0;d<Math.min(r.length,4);d++){const p=r[d],u=c[d],m=p.id===this.player.systemId?"bright-yellow":"white";if(u==="left")g(e,o,Qr,Te(p.name,Jr),m,"black"),e[o][Zr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="right")g(e,o,ns,Te(p.name,ts),m,"black"),e[o][es]={char:"-",fg:"bright-black",bg:"black"};else if(u==="top"){g(e,s,$e,Te(p.name,Ge),m,"black");for(let f=s+1;f<o;f++)e[f][at]={char:"|",fg:"bright-black",bg:"black"}}else{g(e,a,$e,Te(p.name,Ge),m,"black");for(let f=o+1;f<a;f++)e[f][at]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(e,t,i,r,s,o,a){for(let l=0;l<r.length&&l<a-o;l++){const c=r[l],h=o+l,d=l===s,u=c.id===this.player.systemId?"bright-yellow":d?"bright-cyan":"white",m=d?"> ":"  ",f=Ke(i.id,c.id),y=f?`${f.distance}LY  ${f.stability}`:"",x=t-4-y.length;g(e,h,2,m+c.name.toUpperCase().slice(0,x-2),u,"black"),y&&g(e,h,t-2-y.length,y,"bright-black","black")}}renderInfo(e,t,i,r,s){const a=i.id===this.player.systemId?"* Current location":i.name.toUpperCase();if(g(e,s,2,`Zone: ${i.zone}  Sec: ${i.security}  ${a}`.slice(0,t-4),"bright-black","black"),!r)return;const l=Ke(i.id,r.id);if(!l)return;const c=rt(this.player.systemId,r.id),h=c?c.length===1?"(your location)":`${c.length-1} hop${c.length-1!==1?"s":""} from you`:"(unreachable)";g(e,s+1,2,`${r.name.toUpperCase()}  ${l.distance}LY  ${h}`.slice(0,t-4),"bright-black","black")}renderRouteTab(e,t,i,r){var x,S;const s=t,o=t+2,a=t+3,l=7,c=a+l,h=c+1,d=h+6,p=this.publicSystems.find(v=>v.id===this.player.systemId);g(e,s,2,"FROM:","bright-black","black"),g(e,s,8,(p==null?void 0:p.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),g(e,o,2,"TO:","bright-black","black");const u=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-l));for(let v=0;v<l;v++){const M=u+v;if(M>=this.otherSystems.length)break;const b=this.otherSystems[M],C=M===this.routeDestIdx,_=C?"bright-cyan":"white",T=C?"> ":"  ";g(e,a+v,2,T+b.name.toUpperCase(),_,"black")}pe(e,c,r),pe(e,d,r);const m=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!m){g(e,h,2,"No route found","bright-red","black");return}const y=m.length-1;g(e,h,2,`Route: ${y} hop${y!==1?"s":""}`,"bright-white","black");for(let v=0;v<y;v++){const M=Ke(m[v],m[v+1]);if(!M)continue;const b=h+1+v;if(b>=d)break;const C=(((x=this.publicSystems.find(T=>T.id===m[v]))==null?void 0:x.name)??m[v]).toUpperCase().slice(0,9),_=(((S=this.publicSystems.find(T=>T.id===m[v+1]))==null?void 0:S.name)??m[v+1]).toUpperCase().slice(0,9);g(e,b,4,`${C} -> ${_}  ${M.distance}LY  ${M.stability}`.slice(0,r-6),"white","black")}}}class ne extends ee{constructor(e,t,i,r){const s={onAction:()=>{}};super(s,t,e,{navOptions:[]}),this.elapsed=0,this.arrived=!1,this.duration=i,this.onComplete=r}update(e){this.arrived||(this.elapsed+=e,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const rs=["[. . .]","[: : :]","[* * *]"],ct=5e3;class ss extends ne{constructor(e,t,i){super(e,t,ct,i)}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(e,t,i){const r=e.length,s=Math.floor(r/2),o=Math.floor(this.elapsed/500)%3,a=Math.ceil((ct-this.elapsed)/1e3),l=Math.max(1,Math.min(5,a)),c=Z(this.player.systemId),h=c?c.name.toUpperCase():this.player.systemId.toUpperCase();F(e,s-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),F(e,s-1,"DESTINATION:","bright-black","black"),F(e,s,h,"bright-white","black"),F(e,s+2,rs[o],"bright-black","black"),F(e,s+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const ht=2e3,os=["[ —   ]","[  —  ]","[   — ]"];class mn extends ne{constructor(e,t,i,r){super(e,t,ht,i),this.targetLabel=r}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(e,t,i){const r=e.length,s=Math.floor(r/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((ht-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a)),c=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const h=this.player.destinationId?N(this.player.destinationId):null;return h?h.name.toUpperCase():"UNKNOWN"})();F(e,s-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),F(e,s-1,"HEADING TO:","bright-black","black"),F(e,s,c,"bright-white","black"),F(e,s+2,os[o],"bright-black","black"),F(e,s+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const dt=2500,as=["v","vv","vvv"];class ls extends ne{constructor(e,t,i){super(e,t,dt,i)}renderContent(e,t,i){const r=e.length,s=Math.floor(r/2),o=Math.floor(this.elapsed/400)%3,a=Math.ceil((dt-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));F(e,s-3,"[ LANDING SEQUENCE ]","bright-green","black"),F(e,s+2,as[o],"bright-black","black"),F(e,s+4,`TOUCHDOWN IN ${l}S`,"bright-black","black")}}const ut=2500,cs=[">",">>",">>>"];class hs extends ne{constructor(e,t,i){super(e,t,ut,i)}renderContent(e,t,i){const r=e.length,s=Math.floor(r/2),o=Math.floor(this.elapsed/400)%3,a=Math.ceil((ut-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));F(e,s-3,"[ APPROACH LOCKED ]","bright-yellow","black"),F(e,s+2,cs[o],"bright-black","black"),F(e,s+4,`CLAMPING IN ${l}S`,"bright-black","black")}}const pt=1500,ds=["^","^^","^^^"];class us extends ne{constructor(e,t,i){super(e,t,pt,i)}renderContent(e,t,i){const r=e.length,s=Math.floor(r/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((pt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));F(e,s-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),F(e,s+2,ds[o],"bright-black","black"),F(e,s+4,`CLEAR IN ${l}S`,"bright-black","black")}}const mt=1500,ps=["<","<<","<<<"];class ms extends ne{constructor(e,t,i){super(e,t,mt,i)}renderContent(e,t,i){const r=e.length,s=Math.floor(r/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((mt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));F(e,s-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),F(e,s+2,ps[o],"bright-black","black"),F(e,s+4,`DEPARTING IN ${l}S`,"bright-black","black")}}const ft=1500,fs=["→","→→","→→→"];class gs extends ne{constructor(e,t,i){super(e,t,ft,i)}renderContent(e,t,i){const r=e.length,s=Math.floor(r/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((ft-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));F(e,s-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),F(e,s+2,fs[o],"bright-black","black"),F(e,s+4,`DOCKING IN ${l}S`,"bright-black","black")}}const gt=1500,ys=["←","←←","←←←"];class _s extends ne{constructor(e,t,i){super(e,t,gt,i)}renderContent(e,t,i){const r=e.length,s=Math.floor(r/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((gt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));F(e,s-3,"[ DEPARTING BERTH ]","bright-cyan","black"),F(e,s+2,ys[o],"bright-black","black"),F(e,s+4,`CLEAR IN ${l}S`,"bright-black","black")}}const bs=3e3;class vs extends ne{constructor(e,t,i,r,s,o,a){super(t,i,bs,a),this.input=e,this.outcomeLabel=r,this.score=s,this.damageFraction=o,this._skipRequested=!1,e.onAction(()=>{this._skipRequested=!0})}update(e){this._skipRequested&&(this.elapsed=1/0,this._skipRequested=!1),super.update(e)}renderContent(e,t,i){const r=Math.floor((t+i)/2),s=this.getOutcomeColor();F(e,r-2,this.outcomeLabel,s,"black"),this.score!==null&&F(e,r,`SCORE: ${this.score} / 100`,"white","black");const o=Math.round(this.damageFraction*100),a=o===0?"bright-green":"yellow";F(e,r+2,`HULL DAMAGE: ${o}%`,a,"black")}getOutcomeColor(){return this.score===null||this.score<40?"red":this.score<70?"yellow":"bright-green"}}class ws extends ee{constructor(e,t,i,r){super(e,t,i,{navOptions:r.navOptions,title:r.title}),this._completed=!1,this._onComplete=r.onComplete,this._canvasWidth=r.canvasWidth,this._canvasHeight=r.canvasHeight}renderContent(e,t,i){var u;const r=((u=e[0])==null?void 0:u.length)??0,s=e.length,o=i-t,a=this._canvasWidth??r,l=this._canvasHeight??o;let c=Math.floor((r-a)/2),h=t+Math.floor((o-l)/2);const d=Math.max(0,r-a),p=Math.max(0,s-l);c=Math.max(0,Math.min(c,d)),h=Math.max(0,Math.min(h,p)),this.renderGame(e,{top:h,left:c,width:a,height:l})}complete(e){var t;this._completed||(this._completed=!0,(t=this._onComplete)==null||t.call(this,e))}}function ks(n){if(n.length===0)return 2166136261;let e=2166136261;for(let t=0;t<n.length;t++)e^=n.charCodeAt(t),e=Math.imul(e,16777619)>>>0;return e===0?1:e}function xs(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}class Cs extends ws{constructor(e,t,i,r){const s=i.destinationId??"";super(e,t,i,{navOptions:[],title:"DOCKING",canvasWidth:32,canvasHeight:18,onComplete:r}),this.heldKeys=new Set,this.lastActionTime=0,this.actionTimeoutMs=200,this.canvasWidth=32,this.canvasHeight=18,this.countdownSeconds=30,this.thrustForce=8,this.maxVelocity=6,this.driftIntervalMs=3e3,this.driftMaxDistanceChars=8,this.driftSpeedCharsPerSec=1.2,this.perfectRadiusChars=5,this.airlockWidth=5,this.airlockHeight=3,this.rand=xs(ks(s));const o=(this.canvasWidth-1)/2,a=(this.canvasHeight-1)/2;this.state={shipX:o,shipY:a,shipVelX:0,shipVelY:0,airlockX:o,airlockY:a,driftTargetX:o,driftTargetY:a,driftTimer:this.driftIntervalMs*(.8+.4*this.rand()),timeRemaining:this.countdownSeconds,completed:!1}}handleAction(e){if(super.handleAction(e),e==="MENU"){this.state.completed||(this.state.completed=!0,this.complete({outcome:"skipped"}));return}(e==="UP"||e==="DOWN"||e==="LEFT"||e==="RIGHT")&&(this.heldKeys.add(e),this.lastActionTime=performance.now())}handleTap(e,t){if(super.handleTap(e,t),this.state.completed)return;const i=40,r=30,s=4,o=r-s-2,a=Math.floor((i-this.canvasWidth)/2),l=s+Math.floor((o-this.canvasHeight)/2),c=a+Math.floor(this.canvasWidth/2),h=l+Math.floor(this.canvasHeight/2),d=l-2,p=l+this.canvasHeight+1,u=a-3,m=a+this.canvasWidth+2,f=1;t===d&&Math.abs(e-c)<=f?this.handleAction("UP"):t===p&&Math.abs(e-c)<=f?this.handleAction("DOWN"):e===u&&Math.abs(t-h)<=f?this.handleAction("LEFT"):e===m&&Math.abs(t-h)<=f&&this.handleAction("RIGHT")}update(e){super.update(e);const t=e/1e3;if(!this.state.completed&&(this.clearExpiredActions(),this.updateMovement(t),this.updateAirlockDrift(t),this.updateCountdown(t),this.state.timeRemaining<=0)){const i=Math.hypot(this.state.shipX-this.state.airlockX,this.state.shipY-this.state.airlockY),r=Math.max(0,Math.min(1,1/(1+i/this.perfectRadiusChars))),s=Math.round(r*100);this.state.completed=!0,this.complete({outcome:"completed",result:{score:s}})}}updateMovement(e){const t=this.state;this.heldKeys.has("UP")&&(t.shipVelY-=this.thrustForce*e),this.heldKeys.has("DOWN")&&(t.shipVelY+=this.thrustForce*e),this.heldKeys.has("LEFT")&&(t.shipVelX-=this.thrustForce*e),this.heldKeys.has("RIGHT")&&(t.shipVelX+=this.thrustForce*e),t.shipVelX=Math.max(-this.maxVelocity,Math.min(this.maxVelocity,t.shipVelX)),t.shipVelY=Math.max(-this.maxVelocity,Math.min(this.maxVelocity,t.shipVelY)),t.shipX+=t.shipVelX*e,t.shipY+=t.shipVelY*e;const i=.5;t.shipX=Math.max(i,Math.min(this.canvasWidth-1-i,t.shipX)),t.shipY=Math.max(i,Math.min(this.canvasHeight-1-i,t.shipY))}updateAirlockDrift(e){const t=this.state,i=t.driftTargetX-t.airlockX,r=t.driftTargetY-t.airlockY,s=Math.hypot(i,r);if(s<.1){const o=this.rand()*2*Math.PI,a=this.rand()*this.driftMaxDistanceChars,l=(this.canvasWidth-1)/2,c=(this.canvasHeight-1)/2;t.driftTargetX=l+Math.cos(o)*a,t.driftTargetY=c+Math.sin(o)*a,t.driftTimer=this.driftIntervalMs*(.8+.4*this.rand())}else{const o=this.driftSpeedCharsPerSec*e,a=Math.min(1,o/s);t.airlockX+=i*a,t.airlockY+=r*a}}updateCountdown(e){this.state.timeRemaining=Math.max(0,this.state.timeRemaining-e)}clearExpiredActions(){performance.now()-this.lastActionTime>this.actionTimeoutMs&&this.heldKeys.clear()}renderGame(e,t){const{top:i,left:r,width:s,height:o}=t;this.drawBorder(e,i,r,s,o),this.drawAirlock(e,i,r),this.drawShip(e,i,r),this.drawCountdown(e,i,r,s),this.drawDistance(e,i,r,o),this.drawControlButtons(e,i,r,s,o)}drawBorder(e,t,i,r,s){const o=i+r-1,a=t+s-1;for(let l=i;l<=o;l++)t<e.length&&l<e[t].length&&(e[t][l]={char:"+",fg:"white",bg:"black"}),a<e.length&&l<e[a].length&&(e[a][l]={char:"+",fg:"white",bg:"black"});for(let l=t+1;l<a;l++)l<e.length&&(i<e[l].length&&(e[l][i]={char:"|",fg:"white",bg:"black"}),o<e[l].length&&(e[l][o]={char:"|",fg:"white",bg:"black"}))}drawAirlock(e,t,i){const r=i+1+Math.round(this.state.airlockX),s=t+1+Math.round(this.state.airlockY),o=r-Math.floor(this.airlockWidth/2),a=s-Math.floor(this.airlockHeight/2),l=[["+","-","+","-","+"],["|"," ","+"," ","|"],["+","-","+","-","+"]];for(let c=0;c<this.airlockHeight;c++)for(let h=0;h<this.airlockWidth;h++){const d=a+c,p=o+h;if(d>=t&&d<t+this.canvasHeight&&p>=i&&p<i+this.canvasWidth&&d<e.length&&p<e[d].length){const u=l[c][h];e[d][p]={char:u,fg:"bright-yellow",bg:"black"}}}}drawShip(e,t,i){const r=i+1+Math.round(this.state.shipX),s=t+1+Math.round(this.state.shipY);r>=i&&r<i+this.canvasWidth&&s>=t&&s<t+this.canvasHeight&&(s<e.length&&r<e[s].length&&(e[s][r]={char:"(",fg:"bright-green",bg:"black"}),r+1<i+this.canvasWidth&&s<e.length&&r+1<e[s].length&&(e[s][r+1]={char:"+",fg:"bright-green",bg:"black"}),r+2<i+this.canvasWidth&&s<e.length&&r+2<e[s].length&&(e[s][r+2]={char:")",fg:"bright-green",bg:"black"}))}drawCountdown(e,t,i,r){const s=`T: ${Math.ceil(this.state.timeRemaining)}`,o=i+r-1-s.length,a=t+1;g(e,a,o,s,"white","black")}drawDistance(e,t,i,r){const o=`DIST: ${Math.hypot(this.state.shipX-this.state.airlockX,this.state.shipY-this.state.airlockY).toFixed(1)}`,a=t+r-1;g(e,a,i+2,o,"white","black")}drawControlButtons(e,t,i,r,s){const o=e.length,a=o>0?e[0].length:0,l=i+r,c=t+s,h=this.heldKeys.has("UP"),d=this.heldKeys.has("DOWN"),p=this.heldKeys.has("LEFT"),u=this.heldKeys.has("RIGHT"),m="bright-green",f="bright-black",y=t+Math.floor(s/2),x=i+Math.floor(r/2),S=t-2,v=c+1,M=i-4,b=l+3,C=_=>`[${_}]`;if(S>=0&&x-1>=0&&x+1<a){const _=C("^"),T=x-1;for(let E=0;E<_.length;E++)T+E<a&&(e[S][T+E]={char:_[E],fg:h?m:f,bg:"black"})}if(v<o&&x-1>=0&&x+1<a){const _=C("v"),T=x-1;for(let E=0;E<_.length;E++)T+E<a&&(e[v][T+E]={char:_[E],fg:d?m:f,bg:"black"})}if(y>=0&&y<o&&M>=0&&M+2<a){const _=C("<");for(let T=0;T<_.length;T++)M+T>=0&&M+T<a&&(e[y][M+T]={char:_[T],fg:p?m:f,bg:"black"})}if(y>=0&&y<o&&b>=0&&b+2<a){const _=C(">");for(let T=0;T<_.length;T++)b+T<a&&(e[y][b+T]={char:_[T],fg:u?m:f,bg:"black"})}}}const Ts=[{id:"docking",name:"Docking Mini-Game",description:"Align the ship crosshair with the airlock target before countdown expires",variants:[{id:"orbital",label:"Orbital Station",params:{locationType:"orbital"}},{id:"deep-space",label:"Deep Space",params:{locationType:"deep-space"}}]}],Ms=[{meta:Ts[0],factory:(n,e,t,i,r)=>new Cs(n,e,t,r)}];function Is(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function As(n,e){return Math.floor(n()*e)}function Ie(n,e){return e[As(n,e.length)]}function Gt(n,e){const{special:t,firstNames:i,lastNames:r}=e.npcNames;if(n()<P().npc.specialNameChance&&t.length>0)return{giverName:Ie(n,t)};const s=i.length>0?Ie(n,i):"Unknown",o=r.length>0?Ie(n,r):"Agent";return{giverName:`${s} ${o}`}}function Ss(n,e){return e.destinations.filter(t=>t.id!==n.id)}function Es(n){return n.commodities.filter(e=>e.legal)}function Rs(n,e){const t=e.reduce((r,s)=>r+s.weightKg,0);if(t===0)return e[0];let i=n()*t;for(const r of e)if(i-=r.weightKg,i<0)return r;return e[e.length-1]}function yt(n,e,t,i){var y;const r=t.deliveryItems;if(r.length===0)return null;const s=Ss(e,t);if(s.length===0)return null;const o=Rs(n,r),a=Ie(n,s),l=Gt(n,t),{deliveryBaseReward:c,deliveryRandomReward:h,deliveryDepositFraction:d}=P().missions,p=Math.floor(o.weightKg*1.5),u=c+p+Math.floor(n()*h),m=Math.floor(u*d),f=e.owningFactionId?(y=D().factions.find(x=>x.id===e.owningFactionId&&de(x)))==null?void 0:y.id:void 0;return{...l,giverFactionId:f,id:i,type:"delivery",title:o.name,description:`A package needs transporting. Pick up the ${o.name} from ${e.name} and deliver it to ${a.name}. Handle with care.`,reward:u,issuingDestinationId:e.id,itemName:o.name,itemWeightKg:o.weightKg,pickupDestinationId:e.id,deliveryDestinationId:a.id,deposit:m}}function _t(n,e,t,i){var $;const r=Es(t);if(r.length===0)return null;const s=Z(e.system),o=[],a=[];for(const w of r)(s?Ve(w.id,s):1)>1&&a.push(w),o.push(w);const l=a.length>0?a:r;for(const w of l)o.push(w);const{supplyRequirementsMin:c,supplyRequirementsMax:h,supplyQtyMin:d,supplyQtyMax:p}=P().missions,u=c+Math.floor(n()*(h-c+1)),m=[],f=new Set;for(let w=0;w<u;w++){let R=0;for(;R<10;){const L=Ie(n,o);if(!f.has(L.id)){f.add(L.id);const A=d+Math.floor(n()*(p-d+1));m.push({commodityId:L.id,qty:A});break}R++}}if(m.length===0)return null;const y=m.reduce((w,R)=>{const L=t.commodities.find(A=>A.id===R.commodityId);return w+((L==null?void 0:L.basePrice)??100)*R.qty},0),x=m.reduce((w,R)=>{const L=t.commodities.find(A=>A.id===R.commodityId);return w+((L==null?void 0:L.weightKg)??1)*R.qty},0),{supplyRewardMultiplierMin:S,supplyRewardMultiplierMax:v}=P().missions,M=Math.min(1,x/500),b=n(),C=b+M*(1-b)*.15,_=S+C*(v-S),T=Math.floor(y*_),E=Gt(n,t),Y=m.map(w=>{const R=t.commodities.find(L=>L.id===w.commodityId);return`${w.qty}× ${(R==null?void 0:R.name)??w.commodityId}`}).join(", "),O=e.owningFactionId?($=D().factions.find(w=>w.id===e.owningFactionId&&de(w)))==null?void 0:$.id:void 0;return{...E,giverFactionId:O,id:i,type:"supply",title:e.name,description:`${e.name} needs supplies. Deliver ${Y} to fulfil the contract.`,reward:T,issuingDestinationId:e.id,requirements:m,deliveryDestinationId:e.id}}function Ls(n){let e=0;for(let t=0;t<n.length;t++)e=(e<<5)-e^n.charCodeAt(t);return e>>>0}function Fs(n,e,t){const i=P();let r;{const c=i.missions.missionTtlMs,h=Date.now(),d=Math.floor(h/c);r=Ls(n.id)^d}const s=Is(r),{boardMaxCount:o,deliveryChance:a}=i.missions,l=[];for(let c=0;c<n.minMissions&&l.length<o;c++){const h=`m-${(r>>>0).toString(16)}-${l.length}`,p=s()<a?yt(s,n,e,h):_t(s,n,e,h);p&&l.push(p)}for(;l.length<o&&s()<n.missionChance;){const c=`m-${(r>>>0).toString(16)}-${l.length}`,d=s()<a?yt(s,n,e,c):_t(s,n,e,c);d&&l.push(d)}return l}const Ds=100,Ns={orbital:"docking","deep-space":"docking",surface:"surface-landing",asteroid:"asteroid-landing"};function Os(n,e,t){if(n.outcome==="skipped")return{damageFraction:t.abandonDamageFraction*e,score:null};const i=n.result.score;return i>=t.noDamageThreshold?{damageFraction:0,score:i}:{damageFraction:t.maxHullDamageFraction*(1-i/t.noDamageThreshold)*e,score:i}}function Ps(n,e){const t=n==="docking";return e===null?"ABORTED":e<40?t?"COLLISION":"CRASH":e<70?t?"ROUGH DOCK":"HARD LANDING":e<90?t?"DOCKED":"LANDED":t?"PERFECT DOCK":"PERFECT LANDING"}function We(n,e,t){return Math.max(e,Math.min(t,n))}function Bs(n,e,t,i){const{stockCountMin:r,stockCountMax:s,stockQtyMin:o,stockQtyMax:a,stockRepCountBonusPerLevel:l,stockRepCountBonusMin:c,stockRepCountBonusMax:h,stockRepQtyBonusPerLevel:d,stockRepQtyBonusMin:p,stockRepQtyBonusMax:u}=t.trading,m=We(e*l,c,h),f=We(e*d,p,u),y=n.length,x=We(r+m,1,y),S=We(s+m,1,y),v=x+Math.floor(Math.random()*(S-x+1)),M=[];if(i)for(const w of n){const L=1/Ve(w.id,i),A=Math.ceil(L*10);for(let k=0;k<A;k++)M.push(w)}else M.push(...n);const b=[...M];for(let w=b.length-1;w>0;w--){const R=Math.floor(Math.random()*(w+1));[b[w],b[R]]=[b[R],b[w]]}const C=o+f,_=a+f,T=n.map(w=>Math.log(w.basePrice*w.weightKg)),E=Math.min(...T),O=Math.max(...T)-E,$=new Map;for(const w of b.slice(0,v)){if($.has(w.id))continue;const R=C+Math.floor(Math.random()*(_-C+1));let L=1;O>0&&(L=1.5-(Math.log(w.basePrice*w.weightKg)-E)/O);const A=i?Ve(w.id,i):1;$.set(w.id,{commodityId:w.id,qty:Math.max(1,Math.floor(R*L)),effectiveFactor:A})}return Array.from($.values())}class Hs{constructor(e,t,i){this.sceneBeforeMenu=null,this.traderStockCache=new Map,this.renderer=e,this.input=t,this.context=i;const r=Ht(),s=Ye(r.startingShip);this.player=new In({shipId:r.startingShip,driveId:s.defaultJumpDrive,credits:r.player.startingCredits,systemId:r.startingLocation.system,destinationId:r.startingLocation.destination}),this.currentScene=new Hn(this.input,this.context,this.player,()=>this.goToStory())}tick(e){const t=Math.min(e,Ds),i=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(i),this.renderer.drawBuffer(i)}makeBuffer(){const e=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:e},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(e,t){const i=Date.now(),r=this.traderStockCache.get(e),s=P();if(r&&r.repLevel===t&&i-r.generatedAt<s.trading.stockTtlMs)return r.entries;const o=N(e),a=o?Z(o.system):void 0,l=Bs(Wi(),t,s,a);return this.traderStockCache.set(e,{entries:l,generatedAt:i,repLevel:t}),l}refreshDestinationMissions(e){const t=N(e),i=D(),r=Fs(t,i);this.player.refreshDestinationMissions(e,r)}onBuy(e,t,i,r){if(t<=0)return;const s=r.findIndex(h=>h.commodityId===e);if(s<0)return;const o=r[s];if(t>o.qty)return;const a=ae(e);if(!a)return;const l=t*i;this.player.credits<l||this.player.cargoWeightKg+t*a.weightKg>this.player.cargoCapacity||(this.player.spendCredits(l),this.player.addCargo(e,t),o.qty-=t,o.qty<=0&&r.splice(s,1))}onSell(e,t,i,r){if(t<=0)return;const s=this.player.cargoHold.find(c=>c.commodityId===e);if(!s||s.qty<t||!ae(e))return;const a=t*i;this.player.addCredits(a),this.player.removeCargo(e,t);const l=r.find(c=>c.commodityId===e);l?l.qty+=t:r.push({commodityId:e,qty:t})}goToMainMenu(){this.currentScene=new Hn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new sr(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){const e=this.player.destinationId;this.refreshDestinationMissions(e),this.currentScene=new ar(this.input,this.context,this.player,e,(t,i)=>{this.player.spendCredits(t),this.player.addFuel(i),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToLandOrDock(){const e=N(this.player.destinationId),t=e==null?void 0:e.locationType,i=t?Ns[t]:void 0,r=i?Ms.find(s=>s.meta.id===i):void 0;if(i&&r){const s=(e==null?void 0:e.difficultyMultiplier)??1,o=P();this.currentScene=r.factory(this.input,this.context,this.player,{},a=>{const{damageFraction:l,score:c}=Os(a,s,o.miniGames);l>0&&this.player.applyHullDamage(l);const h=Ps(i,c);this.currentScene=new vs(this.input,this.player,this.context,h,c,l,()=>this.goToStation())})}else t==="surface"?this.currentScene=new ls(this.player,this.context,()=>this.goToStation()):t==="asteroid"?this.currentScene=new hs(this.player,this.context,()=>this.goToStation()):this.currentScene=new gs(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const e=(t=N(this.player.destinationId))==null?void 0:t.locationType;e==="surface"?this.currentScene=new us(this.player,this.context,()=>this.goToShip()):e==="asteroid"?this.currentScene=new ms(this.player,this.context,()=>this.goToShip()):this.currentScene=new _s(this.player,this.context,()=>this.goToShip())}goToTrader(){const e=this.player.destinationId,t=N(e);let i=0;if(t.owningFactionId){const s=Ut(t.owningFactionId);if(s&&de(s)){const o=P(),a=this.player.getFactionReputation(t.owningFactionId);i=Ae(a,o)}}const r=this.getOrCreateTraderStock(e,i);this.currentScene=new lr(this.input,this.context,this.player,e,r,(s,o,a)=>this.onBuy(s,o,a,r),(s,o,a)=>this.onSell(s,o,a,r),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionBoard(){const e=this.player.destinationId,t=this.player.getDestinationMissions(e);this.currentScene=new me(this.input,this.context,this.player,e,t,i=>this.goToMissionDetail(i,e),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionDetail(e,t){this.currentScene=new ur(this.input,this.context,this.player,e,i=>this.onMissionAccepted(e,i,t),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock())}onMissionAccepted(e,t,i){const r=this.player.getDestinationMissions(i),s=r.findIndex(o=>o.id===e.id);s>=0&&(r.splice(s,1),this.player.refreshDestinationMissions(i,r)),this.player.acceptMission(e,t),this.goToMissionBoard()}goToShip(){this.currentScene=new Wr(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo(),()=>this.goToGlobalMenu())}goToCargo(){this.currentScene=new Yr(this.input,this.context,this.player,()=>this.goToShip(),()=>this.goToGlobalMenu())}buildMenuEntries(){return[{label:"MISSIONS",action:()=>this.goToMissionLog()},{label:"GALAXY MAP",action:()=>this.goToGalaxyMapFromMenu()},{label:"REPUTATION",action:()=>this.goToReputation()}]}goToMissionLog(){this.currentScene=new Zi(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToReputation(){this.currentScene=new rr(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToGlobalMenuFromSubScene(){this.currentScene=new $n(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}goToGlobalMenu(){this.sceneBeforeMenu=this.currentScene,"suspend"in this.currentScene&&this.currentScene.suspend(),this.currentScene=new $n(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}returnFromMenu(){const e=this.sceneBeforeMenu;this.sceneBeforeMenu=null,e!==null?("resume"in e&&e.resume(),this.currentScene=e):this.goToShip()}goToTravelMenu(){this.currentScene=new it(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu(),()=>this.goToEmergencyRescue())}goToArrival(){this.currentScene=new it(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu(),()=>this.goToEmergencyRescue())}goToGalaxyMap(){this.currentScene=new lt(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToGlobalMenu())}goToGalaxyMapFromMenu(){this.currentScene=new lt(this.input,this.context,this.player,()=>this.goToGlobalMenu(),()=>this.goToGlobalMenu(),()=>this.returnFromMenu())}goToFlyIntoSpace(){const e=this.player.getInSystemHopCost();this.player.consumeFuel(e),this.player.undock(),this.currentScene=new mn(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(e){const t=this.player.getInSystemHopCost();this.player.consumeFuel(t),this.player.dock(e),this.currentScene=new mn(this.player,this.context,()=>this.goToShip())}onJumpSelected(e){const t=Ke(this.player.systemId,e),i=Bt(this.player.driveId),r=Math.ceil(P().fuel.consumptionPerLy*t.distance*i.fuelEfficiency);this.player.consumeFuel(r),this.player.jumpTo(e),this.currentScene=new ss(this.player,this.context,()=>this.goToArrival())}goToEmergencyRescue(){this.currentScene=new Kr(this.input,this.context,this.player,e=>this.onEmergencyTow(e),()=>this.onEmergencyFuelDrop(),()=>this.goToTravelMenu())}onEmergencyTow(e){const t=P();this.player.spendCredits(t.emergencyRescue.towFee),this.player.dock(e),this.currentScene=new mn(this.player,this.context,()=>this.goToShip())}onEmergencyFuelDrop(){const e=P();this.player.spendCredits(e.emergencyRescue.fuelDropFee),this.player.addFuel(e.emergencyRescue.fuelDropLitres),this.goToTravelMenu()}}const Us=`---
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
`,$s=`---
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
`,Gs=`---
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
`,Ws=`---
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
`,Ys=`---
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
`,Ks=`---
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
`,js=`---
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
`,qs=`---
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
`,Vs=`---
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
`,zs=`---
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
`,Xs=`---
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
`,Qs=`---
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
`,Js=`---
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
`,Zs=`---
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
`,eo=`---
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
`,no=`---
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
`,to=`---
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
`,io=`---
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
`,ro=`---
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
`,so=`---
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
`,oo=`---
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
`,ao=`---
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
`,lo=`---
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
`,co=`---
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
`,ho=`---
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
`,uo=`---
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
`,po=`---
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
`,mo=`---
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
`,fo=`---
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
`,go=`---
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
`,yo=`---
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
`,_o=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,bo=`---
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
`,vo=`---
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
`,wo=`---
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
  max_hull_damage_fraction: 0.10
  abandon_damage_fraction: 0.05
  no_damage_threshold: 90
---
`,ko=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,xo=`---
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
`,Co=`---
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

Long range engines for faster than light travel between systems.`,To=`---
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
`,Mo=`---
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
`,Io=`---
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
`,Ao=`---
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
`,So=`---
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
`,Eo=`---
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
`,Ro=`---
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
`,Lo=`---
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
`,Fo=`---
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
`,Do=`---
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
`,No=`---
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
`,Oo=`---
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
`,Po=`---
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
`,Bo=`---
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
`,Ho=`---
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
`,Uo=`---
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
`;var B={},Re={},q={};function Wt(n){return typeof n>"u"||n===null}function $o(n){return typeof n=="object"&&n!==null}function Go(n){return Array.isArray(n)?n:Wt(n)?[]:[n]}function Wo(n,e){var t,i,r,s;if(e)for(s=Object.keys(e),t=0,i=s.length;t<i;t+=1)r=s[t],n[r]=e[r];return n}function Yo(n,e){var t="",i;for(i=0;i<e;i+=1)t+=n;return t}function Ko(n){return n===0&&Number.NEGATIVE_INFINITY===1/n}q.isNothing=Wt;q.isObject=$o;q.toArray=Go;q.repeat=Yo;q.isNegativeZero=Ko;q.extend=Wo;function Se(n,e){Error.call(this),this.name="YAMLException",this.reason=n,this.mark=e,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}Se.prototype=Object.create(Error.prototype);Se.prototype.constructor=Se;Se.prototype.toString=function(e){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!e&&this.mark&&(t+=" "+this.mark.toString()),t};var Le=Se,bt=q;function An(n,e,t,i,r){this.name=n,this.buffer=e,this.position=t,this.line=i,this.column=r}An.prototype.getSnippet=function(e,t){var i,r,s,o,a;if(!this.buffer)return null;for(e=e||4,t=t||75,i="",r=this.position;r>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(r-1))===-1;)if(r-=1,this.position-r>t/2-1){i=" ... ",r+=5;break}for(s="",o=this.position;o<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(o))===-1;)if(o+=1,o-this.position>t/2-1){s=" ... ",o-=5;break}return a=this.buffer.slice(r,o),bt.repeat(" ",e)+i+a+s+`
`+bt.repeat(" ",e+this.position-r+i.length)+"^"};An.prototype.toString=function(e){var t,i="";return this.name&&(i+='in "'+this.name+'" '),i+="at line "+(this.line+1)+", column "+(this.column+1),e||(t=this.getSnippet(),t&&(i+=`:
`+t)),i};var jo=An,vt=Le,qo=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],Vo=["scalar","sequence","mapping"];function zo(n){var e={};return n!==null&&Object.keys(n).forEach(function(t){n[t].forEach(function(i){e[String(i)]=t})}),e}function Xo(n,e){if(e=e||{},Object.keys(e).forEach(function(t){if(qo.indexOf(t)===-1)throw new vt('Unknown option "'+t+'" is met in definition of "'+n+'" YAML type.')}),this.tag=n,this.kind=e.kind||null,this.resolve=e.resolve||function(){return!0},this.construct=e.construct||function(t){return t},this.instanceOf=e.instanceOf||null,this.predicate=e.predicate||null,this.represent=e.represent||null,this.defaultStyle=e.defaultStyle||null,this.styleAliases=zo(e.styleAliases||null),Vo.indexOf(this.kind)===-1)throw new vt('Unknown kind "'+this.kind+'" is specified for "'+n+'" YAML type.')}var U=Xo,wt=q,je=Le,Qo=U;function vn(n,e,t){var i=[];return n.include.forEach(function(r){t=vn(r,e,t)}),n[e].forEach(function(r){t.forEach(function(s,o){s.tag===r.tag&&s.kind===r.kind&&i.push(o)}),t.push(r)}),t.filter(function(r,s){return i.indexOf(s)===-1})}function Jo(){var n={scalar:{},sequence:{},mapping:{},fallback:{}},e,t;function i(r){n[r.kind][r.tag]=n.fallback[r.tag]=r}for(e=0,t=arguments.length;e<t;e+=1)arguments[e].forEach(i);return n}function fe(n){this.include=n.include||[],this.implicit=n.implicit||[],this.explicit=n.explicit||[],this.implicit.forEach(function(e){if(e.loadKind&&e.loadKind!=="scalar")throw new je("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=vn(this,"implicit",[]),this.compiledExplicit=vn(this,"explicit",[]),this.compiledTypeMap=Jo(this.compiledImplicit,this.compiledExplicit)}fe.DEFAULT=null;fe.create=function(){var e,t;switch(arguments.length){case 1:e=fe.DEFAULT,t=arguments[0];break;case 2:e=arguments[0],t=arguments[1];break;default:throw new je("Wrong number of arguments for Schema.create function")}if(e=wt.toArray(e),t=wt.toArray(t),!e.every(function(i){return i instanceof fe}))throw new je("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(i){return i instanceof Qo}))throw new je("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new fe({include:e,explicit:t})};var ve=fe,Zo=U,ea=new Zo("tag:yaml.org,2002:str",{kind:"scalar",construct:function(n){return n!==null?n:""}}),na=U,ta=new na("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(n){return n!==null?n:[]}}),ia=U,ra=new ia("tag:yaml.org,2002:map",{kind:"mapping",construct:function(n){return n!==null?n:{}}}),sa=ve,Sn=new sa({explicit:[ea,ta,ra]}),oa=U;function aa(n){if(n===null)return!0;var e=n.length;return e===1&&n==="~"||e===4&&(n==="null"||n==="Null"||n==="NULL")}function la(){return null}function ca(n){return n===null}var ha=new oa("tag:yaml.org,2002:null",{kind:"scalar",resolve:aa,construct:la,predicate:ca,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),da=U;function ua(n){if(n===null)return!1;var e=n.length;return e===4&&(n==="true"||n==="True"||n==="TRUE")||e===5&&(n==="false"||n==="False"||n==="FALSE")}function pa(n){return n==="true"||n==="True"||n==="TRUE"}function ma(n){return Object.prototype.toString.call(n)==="[object Boolean]"}var fa=new da("tag:yaml.org,2002:bool",{kind:"scalar",resolve:ua,construct:pa,predicate:ma,represent:{lowercase:function(n){return n?"true":"false"},uppercase:function(n){return n?"TRUE":"FALSE"},camelcase:function(n){return n?"True":"False"}},defaultStyle:"lowercase"}),ga=q,ya=U;function _a(n){return 48<=n&&n<=57||65<=n&&n<=70||97<=n&&n<=102}function ba(n){return 48<=n&&n<=55}function va(n){return 48<=n&&n<=57}function wa(n){if(n===null)return!1;var e=n.length,t=0,i=!1,r;if(!e)return!1;if(r=n[t],(r==="-"||r==="+")&&(r=n[++t]),r==="0"){if(t+1===e)return!0;if(r=n[++t],r==="b"){for(t++;t<e;t++)if(r=n[t],r!=="_"){if(r!=="0"&&r!=="1")return!1;i=!0}return i&&r!=="_"}if(r==="x"){for(t++;t<e;t++)if(r=n[t],r!=="_"){if(!_a(n.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}for(;t<e;t++)if(r=n[t],r!=="_"){if(!ba(n.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}if(r==="_")return!1;for(;t<e;t++)if(r=n[t],r!=="_"){if(r===":")break;if(!va(n.charCodeAt(t)))return!1;i=!0}return!i||r==="_"?!1:r!==":"?!0:/^(:[0-5]?[0-9])+$/.test(n.slice(t))}function ka(n){var e=n,t=1,i,r,s=[];return e.indexOf("_")!==-1&&(e=e.replace(/_/g,"")),i=e[0],(i==="-"||i==="+")&&(i==="-"&&(t=-1),e=e.slice(1),i=e[0]),e==="0"?0:i==="0"?e[1]==="b"?t*parseInt(e.slice(2),2):e[1]==="x"?t*parseInt(e,16):t*parseInt(e,8):e.indexOf(":")!==-1?(e.split(":").forEach(function(o){s.unshift(parseInt(o,10))}),e=0,r=1,s.forEach(function(o){e+=o*r,r*=60}),t*e):t*parseInt(e,10)}function xa(n){return Object.prototype.toString.call(n)==="[object Number]"&&n%1===0&&!ga.isNegativeZero(n)}var Ca=new ya("tag:yaml.org,2002:int",{kind:"scalar",resolve:wa,construct:ka,predicate:xa,represent:{binary:function(n){return n>=0?"0b"+n.toString(2):"-0b"+n.toString(2).slice(1)},octal:function(n){return n>=0?"0"+n.toString(8):"-0"+n.toString(8).slice(1)},decimal:function(n){return n.toString(10)},hexadecimal:function(n){return n>=0?"0x"+n.toString(16).toUpperCase():"-0x"+n.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),Yt=q,Ta=U,Ma=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Ia(n){return!(n===null||!Ma.test(n)||n[n.length-1]==="_")}function Aa(n){var e,t,i,r;return e=n.replace(/_/g,"").toLowerCase(),t=e[0]==="-"?-1:1,r=[],"+-".indexOf(e[0])>=0&&(e=e.slice(1)),e===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:e===".nan"?NaN:e.indexOf(":")>=0?(e.split(":").forEach(function(s){r.unshift(parseFloat(s,10))}),e=0,i=1,r.forEach(function(s){e+=s*i,i*=60}),t*e):t*parseFloat(e,10)}var Sa=/^[-+]?[0-9]+e/;function Ea(n,e){var t;if(isNaN(n))switch(e){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===n)switch(e){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===n)switch(e){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(Yt.isNegativeZero(n))return"-0.0";return t=n.toString(10),Sa.test(t)?t.replace("e",".e"):t}function Ra(n){return Object.prototype.toString.call(n)==="[object Number]"&&(n%1!==0||Yt.isNegativeZero(n))}var La=new Ta("tag:yaml.org,2002:float",{kind:"scalar",resolve:Ia,construct:Aa,predicate:Ra,represent:Ea,defaultStyle:"lowercase"}),Fa=ve,Kt=new Fa({include:[Sn],implicit:[ha,fa,Ca,La]}),Da=ve,jt=new Da({include:[Kt]}),Na=U,qt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Vt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Oa(n){return n===null?!1:qt.exec(n)!==null||Vt.exec(n)!==null}function Pa(n){var e,t,i,r,s,o,a,l=0,c=null,h,d,p;if(e=qt.exec(n),e===null&&(e=Vt.exec(n)),e===null)throw new Error("Date resolve error");if(t=+e[1],i=+e[2]-1,r=+e[3],!e[4])return new Date(Date.UTC(t,i,r));if(s=+e[4],o=+e[5],a=+e[6],e[7]){for(l=e[7].slice(0,3);l.length<3;)l+="0";l=+l}return e[9]&&(h=+e[10],d=+(e[11]||0),c=(h*60+d)*6e4,e[9]==="-"&&(c=-c)),p=new Date(Date.UTC(t,i,r,s,o,a,l)),c&&p.setTime(p.getTime()-c),p}function Ba(n){return n.toISOString()}var Ha=new Na("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Oa,construct:Pa,instanceOf:Date,represent:Ba}),Ua=U;function $a(n){return n==="<<"||n===null}var Ga=new Ua("tag:yaml.org,2002:merge",{kind:"scalar",resolve:$a});function zt(n){throw new Error('Could not dynamically require "'+n+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var se;try{var Wa=zt;se=Wa("buffer").Buffer}catch{}var Ya=U,En=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Ka(n){if(n===null)return!1;var e,t,i=0,r=n.length,s=En;for(t=0;t<r;t++)if(e=s.indexOf(n.charAt(t)),!(e>64)){if(e<0)return!1;i+=6}return i%8===0}function ja(n){var e,t,i=n.replace(/[\r\n=]/g,""),r=i.length,s=En,o=0,a=[];for(e=0;e<r;e++)e%4===0&&e&&(a.push(o>>16&255),a.push(o>>8&255),a.push(o&255)),o=o<<6|s.indexOf(i.charAt(e));return t=r%4*6,t===0?(a.push(o>>16&255),a.push(o>>8&255),a.push(o&255)):t===18?(a.push(o>>10&255),a.push(o>>2&255)):t===12&&a.push(o>>4&255),se?se.from?se.from(a):new se(a):a}function qa(n){var e="",t=0,i,r,s=n.length,o=En;for(i=0;i<s;i++)i%3===0&&i&&(e+=o[t>>18&63],e+=o[t>>12&63],e+=o[t>>6&63],e+=o[t&63]),t=(t<<8)+n[i];return r=s%3,r===0?(e+=o[t>>18&63],e+=o[t>>12&63],e+=o[t>>6&63],e+=o[t&63]):r===2?(e+=o[t>>10&63],e+=o[t>>4&63],e+=o[t<<2&63],e+=o[64]):r===1&&(e+=o[t>>2&63],e+=o[t<<4&63],e+=o[64],e+=o[64]),e}function Va(n){return se&&se.isBuffer(n)}var za=new Ya("tag:yaml.org,2002:binary",{kind:"scalar",resolve:Ka,construct:ja,predicate:Va,represent:qa}),Xa=U,Qa=Object.prototype.hasOwnProperty,Ja=Object.prototype.toString;function Za(n){if(n===null)return!0;var e=[],t,i,r,s,o,a=n;for(t=0,i=a.length;t<i;t+=1){if(r=a[t],o=!1,Ja.call(r)!=="[object Object]")return!1;for(s in r)if(Qa.call(r,s))if(!o)o=!0;else return!1;if(!o)return!1;if(e.indexOf(s)===-1)e.push(s);else return!1}return!0}function el(n){return n!==null?n:[]}var nl=new Xa("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Za,construct:el}),tl=U,il=Object.prototype.toString;function rl(n){if(n===null)return!0;var e,t,i,r,s,o=n;for(s=new Array(o.length),e=0,t=o.length;e<t;e+=1){if(i=o[e],il.call(i)!=="[object Object]"||(r=Object.keys(i),r.length!==1))return!1;s[e]=[r[0],i[r[0]]]}return!0}function sl(n){if(n===null)return[];var e,t,i,r,s,o=n;for(s=new Array(o.length),e=0,t=o.length;e<t;e+=1)i=o[e],r=Object.keys(i),s[e]=[r[0],i[r[0]]];return s}var ol=new tl("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:rl,construct:sl}),al=U,ll=Object.prototype.hasOwnProperty;function cl(n){if(n===null)return!0;var e,t=n;for(e in t)if(ll.call(t,e)&&t[e]!==null)return!1;return!0}function hl(n){return n!==null?n:{}}var dl=new al("tag:yaml.org,2002:set",{kind:"mapping",resolve:cl,construct:hl}),ul=ve,Fe=new ul({include:[jt],implicit:[Ha,Ga],explicit:[za,nl,ol,dl]}),pl=U;function ml(){return!0}function fl(){}function gl(){return""}function yl(n){return typeof n>"u"}var _l=new pl("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:ml,construct:fl,predicate:yl,represent:gl}),bl=U;function vl(n){if(n===null||n.length===0)return!1;var e=n,t=/\/([gim]*)$/.exec(n),i="";return!(e[0]==="/"&&(t&&(i=t[1]),i.length>3||e[e.length-i.length-1]!=="/"))}function wl(n){var e=n,t=/\/([gim]*)$/.exec(n),i="";return e[0]==="/"&&(t&&(i=t[1]),e=e.slice(1,e.length-i.length-1)),new RegExp(e,i)}function kl(n){var e="/"+n.source+"/";return n.global&&(e+="g"),n.multiline&&(e+="m"),n.ignoreCase&&(e+="i"),e}function xl(n){return Object.prototype.toString.call(n)==="[object RegExp]"}var Cl=new bl("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:vl,construct:wl,predicate:xl,represent:kl}),ze;try{var Tl=zt;ze=Tl("esprima")}catch{typeof window<"u"&&(ze=window.esprima)}var Ml=U;function Il(n){if(n===null)return!1;try{var e="("+n+")",t=ze.parse(e,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function Al(n){var e="("+n+")",t=ze.parse(e,{range:!0}),i=[],r;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(s){i.push(s.name)}),r=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(i,e.slice(r[0]+1,r[1]-1)):new Function(i,"return "+e.slice(r[0],r[1]))}function Sl(n){return n.toString()}function El(n){return Object.prototype.toString.call(n)==="[object Function]"}var Rl=new Ml("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:Il,construct:Al,predicate:El,represent:Sl}),kt=ve,en=kt.DEFAULT=new kt({include:[Fe],explicit:[_l,Cl,Rl]}),J=q,Xt=Le,Ll=jo,Qt=Fe,Fl=en,ie=Object.prototype.hasOwnProperty,Xe=1,Jt=2,Zt=3,Qe=4,fn=1,Dl=2,xt=3,Nl=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Ol=/[\x85\u2028\u2029]/,Pl=/[,\[\]\{\}]/,ei=/^(?:!|!!|![a-z\-]+!)$/i,ni=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function Ct(n){return Object.prototype.toString.call(n)}function z(n){return n===10||n===13}function oe(n){return n===9||n===32}function j(n){return n===9||n===32||n===10||n===13}function ge(n){return n===44||n===91||n===93||n===123||n===125}function Bl(n){var e;return 48<=n&&n<=57?n-48:(e=n|32,97<=e&&e<=102?e-97+10:-1)}function Hl(n){return n===120?2:n===117?4:n===85?8:0}function Ul(n){return 48<=n&&n<=57?n-48:-1}function Tt(n){return n===48?"\0":n===97?"\x07":n===98?"\b":n===116||n===9?"	":n===110?`
`:n===118?"\v":n===102?"\f":n===114?"\r":n===101?"\x1B":n===32?" ":n===34?'"':n===47?"/":n===92?"\\":n===78?"":n===95?" ":n===76?"\u2028":n===80?"\u2029":""}function $l(n){return n<=65535?String.fromCharCode(n):String.fromCharCode((n-65536>>10)+55296,(n-65536&1023)+56320)}function ti(n,e,t){e==="__proto__"?Object.defineProperty(n,e,{configurable:!0,enumerable:!0,writable:!0,value:t}):n[e]=t}var ii=new Array(256),ri=new Array(256);for(var ue=0;ue<256;ue++)ii[ue]=Tt(ue)?1:0,ri[ue]=Tt(ue);function Gl(n,e){this.input=n,this.filename=e.filename||null,this.schema=e.schema||Fl,this.onWarning=e.onWarning||null,this.legacy=e.legacy||!1,this.json=e.json||!1,this.listener=e.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=n.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function si(n,e){return new Xt(e,new Ll(n.filename,n.input,n.position,n.line,n.position-n.lineStart))}function I(n,e){throw si(n,e)}function Je(n,e){n.onWarning&&n.onWarning.call(null,si(n,e))}var Mt={YAML:function(e,t,i){var r,s,o;e.version!==null&&I(e,"duplication of %YAML directive"),i.length!==1&&I(e,"YAML directive accepts exactly one argument"),r=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),r===null&&I(e,"ill-formed argument of the YAML directive"),s=parseInt(r[1],10),o=parseInt(r[2],10),s!==1&&I(e,"unacceptable YAML version of the document"),e.version=i[0],e.checkLineBreaks=o<2,o!==1&&o!==2&&Je(e,"unsupported YAML version of the document")},TAG:function(e,t,i){var r,s;i.length!==2&&I(e,"TAG directive accepts exactly two arguments"),r=i[0],s=i[1],ei.test(r)||I(e,"ill-formed tag handle (first argument) of the TAG directive"),ie.call(e.tagMap,r)&&I(e,'there is a previously declared suffix for "'+r+'" tag handle'),ni.test(s)||I(e,"ill-formed tag prefix (second argument) of the TAG directive"),e.tagMap[r]=s}};function te(n,e,t,i){var r,s,o,a;if(e<t){if(a=n.input.slice(e,t),i)for(r=0,s=a.length;r<s;r+=1)o=a.charCodeAt(r),o===9||32<=o&&o<=1114111||I(n,"expected valid JSON character");else Nl.test(a)&&I(n,"the stream contains non-printable characters");n.result+=a}}function It(n,e,t,i){var r,s,o,a;for(J.isObject(t)||I(n,"cannot merge mappings; the provided source object is unacceptable"),r=Object.keys(t),o=0,a=r.length;o<a;o+=1)s=r[o],ie.call(e,s)||(ti(e,s,t[s]),i[s]=!0)}function ye(n,e,t,i,r,s,o,a){var l,c;if(Array.isArray(r))for(r=Array.prototype.slice.call(r),l=0,c=r.length;l<c;l+=1)Array.isArray(r[l])&&I(n,"nested arrays are not supported inside keys"),typeof r=="object"&&Ct(r[l])==="[object Object]"&&(r[l]="[object Object]");if(typeof r=="object"&&Ct(r)==="[object Object]"&&(r="[object Object]"),r=String(r),e===null&&(e={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(s))for(l=0,c=s.length;l<c;l+=1)It(n,e,s[l],t);else It(n,e,s,t);else!n.json&&!ie.call(t,r)&&ie.call(e,r)&&(n.line=o||n.line,n.position=a||n.position,I(n,"duplicated mapping key")),ti(e,r,s),delete t[r];return e}function Rn(n){var e;e=n.input.charCodeAt(n.position),e===10?n.position++:e===13?(n.position++,n.input.charCodeAt(n.position)===10&&n.position++):I(n,"a line break is expected"),n.line+=1,n.lineStart=n.position}function H(n,e,t){for(var i=0,r=n.input.charCodeAt(n.position);r!==0;){for(;oe(r);)r=n.input.charCodeAt(++n.position);if(e&&r===35)do r=n.input.charCodeAt(++n.position);while(r!==10&&r!==13&&r!==0);if(z(r))for(Rn(n),r=n.input.charCodeAt(n.position),i++,n.lineIndent=0;r===32;)n.lineIndent++,r=n.input.charCodeAt(++n.position);else break}return t!==-1&&i!==0&&n.lineIndent<t&&Je(n,"deficient indentation"),i}function nn(n){var e=n.position,t;return t=n.input.charCodeAt(e),!!((t===45||t===46)&&t===n.input.charCodeAt(e+1)&&t===n.input.charCodeAt(e+2)&&(e+=3,t=n.input.charCodeAt(e),t===0||j(t)))}function Ln(n,e){e===1?n.result+=" ":e>1&&(n.result+=J.repeat(`
`,e-1))}function Wl(n,e,t){var i,r,s,o,a,l,c,h,d=n.kind,p=n.result,u;if(u=n.input.charCodeAt(n.position),j(u)||ge(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(r=n.input.charCodeAt(n.position+1),j(r)||t&&ge(r)))return!1;for(n.kind="scalar",n.result="",s=o=n.position,a=!1;u!==0;){if(u===58){if(r=n.input.charCodeAt(n.position+1),j(r)||t&&ge(r))break}else if(u===35){if(i=n.input.charCodeAt(n.position-1),j(i))break}else{if(n.position===n.lineStart&&nn(n)||t&&ge(u))break;if(z(u))if(l=n.line,c=n.lineStart,h=n.lineIndent,H(n,!1,-1),n.lineIndent>=e){a=!0,u=n.input.charCodeAt(n.position);continue}else{n.position=o,n.line=l,n.lineStart=c,n.lineIndent=h;break}}a&&(te(n,s,o,!1),Ln(n,n.line-l),s=o=n.position,a=!1),oe(u)||(o=n.position+1),u=n.input.charCodeAt(++n.position)}return te(n,s,o,!1),n.result?!0:(n.kind=d,n.result=p,!1)}function Yl(n,e){var t,i,r;if(t=n.input.charCodeAt(n.position),t!==39)return!1;for(n.kind="scalar",n.result="",n.position++,i=r=n.position;(t=n.input.charCodeAt(n.position))!==0;)if(t===39)if(te(n,i,n.position,!0),t=n.input.charCodeAt(++n.position),t===39)i=n.position,n.position++,r=n.position;else return!0;else z(t)?(te(n,i,r,!0),Ln(n,H(n,!1,e)),i=r=n.position):n.position===n.lineStart&&nn(n)?I(n,"unexpected end of the document within a single quoted scalar"):(n.position++,r=n.position);I(n,"unexpected end of the stream within a single quoted scalar")}function Kl(n,e){var t,i,r,s,o,a;if(a=n.input.charCodeAt(n.position),a!==34)return!1;for(n.kind="scalar",n.result="",n.position++,t=i=n.position;(a=n.input.charCodeAt(n.position))!==0;){if(a===34)return te(n,t,n.position,!0),n.position++,!0;if(a===92){if(te(n,t,n.position,!0),a=n.input.charCodeAt(++n.position),z(a))H(n,!1,e);else if(a<256&&ii[a])n.result+=ri[a],n.position++;else if((o=Hl(a))>0){for(r=o,s=0;r>0;r--)a=n.input.charCodeAt(++n.position),(o=Bl(a))>=0?s=(s<<4)+o:I(n,"expected hexadecimal character");n.result+=$l(s),n.position++}else I(n,"unknown escape sequence");t=i=n.position}else z(a)?(te(n,t,i,!0),Ln(n,H(n,!1,e)),t=i=n.position):n.position===n.lineStart&&nn(n)?I(n,"unexpected end of the document within a double quoted scalar"):(n.position++,i=n.position)}I(n,"unexpected end of the stream within a double quoted scalar")}function jl(n,e){var t=!0,i,r=n.tag,s,o=n.anchor,a,l,c,h,d,p={},u,m,f,y;if(y=n.input.charCodeAt(n.position),y===91)l=93,d=!1,s=[];else if(y===123)l=125,d=!0,s={};else return!1;for(n.anchor!==null&&(n.anchorMap[n.anchor]=s),y=n.input.charCodeAt(++n.position);y!==0;){if(H(n,!0,e),y=n.input.charCodeAt(n.position),y===l)return n.position++,n.tag=r,n.anchor=o,n.kind=d?"mapping":"sequence",n.result=s,!0;t||I(n,"missed comma between flow collection entries"),m=u=f=null,c=h=!1,y===63&&(a=n.input.charCodeAt(n.position+1),j(a)&&(c=h=!0,n.position++,H(n,!0,e))),i=n.line,_e(n,e,Xe,!1,!0),m=n.tag,u=n.result,H(n,!0,e),y=n.input.charCodeAt(n.position),(h||n.line===i)&&y===58&&(c=!0,y=n.input.charCodeAt(++n.position),H(n,!0,e),_e(n,e,Xe,!1,!0),f=n.result),d?ye(n,s,p,m,u,f):c?s.push(ye(n,null,p,m,u,f)):s.push(u),H(n,!0,e),y=n.input.charCodeAt(n.position),y===44?(t=!0,y=n.input.charCodeAt(++n.position)):t=!1}I(n,"unexpected end of the stream within a flow collection")}function ql(n,e){var t,i,r=fn,s=!1,o=!1,a=e,l=0,c=!1,h,d;if(d=n.input.charCodeAt(n.position),d===124)i=!1;else if(d===62)i=!0;else return!1;for(n.kind="scalar",n.result="";d!==0;)if(d=n.input.charCodeAt(++n.position),d===43||d===45)fn===r?r=d===43?xt:Dl:I(n,"repeat of a chomping mode identifier");else if((h=Ul(d))>=0)h===0?I(n,"bad explicit indentation width of a block scalar; it cannot be less than one"):o?I(n,"repeat of an indentation width identifier"):(a=e+h-1,o=!0);else break;if(oe(d)){do d=n.input.charCodeAt(++n.position);while(oe(d));if(d===35)do d=n.input.charCodeAt(++n.position);while(!z(d)&&d!==0)}for(;d!==0;){for(Rn(n),n.lineIndent=0,d=n.input.charCodeAt(n.position);(!o||n.lineIndent<a)&&d===32;)n.lineIndent++,d=n.input.charCodeAt(++n.position);if(!o&&n.lineIndent>a&&(a=n.lineIndent),z(d)){l++;continue}if(n.lineIndent<a){r===xt?n.result+=J.repeat(`
`,s?1+l:l):r===fn&&s&&(n.result+=`
`);break}for(i?oe(d)?(c=!0,n.result+=J.repeat(`
`,s?1+l:l)):c?(c=!1,n.result+=J.repeat(`
`,l+1)):l===0?s&&(n.result+=" "):n.result+=J.repeat(`
`,l):n.result+=J.repeat(`
`,s?1+l:l),s=!0,o=!0,l=0,t=n.position;!z(d)&&d!==0;)d=n.input.charCodeAt(++n.position);te(n,t,n.position,!1)}return!0}function At(n,e){var t,i=n.tag,r=n.anchor,s=[],o,a=!1,l;for(n.anchor!==null&&(n.anchorMap[n.anchor]=s),l=n.input.charCodeAt(n.position);l!==0&&!(l!==45||(o=n.input.charCodeAt(n.position+1),!j(o)));){if(a=!0,n.position++,H(n,!0,-1)&&n.lineIndent<=e){s.push(null),l=n.input.charCodeAt(n.position);continue}if(t=n.line,_e(n,e,Zt,!1,!0),s.push(n.result),H(n,!0,-1),l=n.input.charCodeAt(n.position),(n.line===t||n.lineIndent>e)&&l!==0)I(n,"bad indentation of a sequence entry");else if(n.lineIndent<e)break}return a?(n.tag=i,n.anchor=r,n.kind="sequence",n.result=s,!0):!1}function Vl(n,e,t){var i,r,s,o,a=n.tag,l=n.anchor,c={},h={},d=null,p=null,u=null,m=!1,f=!1,y;for(n.anchor!==null&&(n.anchorMap[n.anchor]=c),y=n.input.charCodeAt(n.position);y!==0;){if(i=n.input.charCodeAt(n.position+1),s=n.line,o=n.position,(y===63||y===58)&&j(i))y===63?(m&&(ye(n,c,h,d,p,null),d=p=u=null),f=!0,m=!0,r=!0):m?(m=!1,r=!0):I(n,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),n.position+=1,y=i;else if(_e(n,t,Jt,!1,!0))if(n.line===s){for(y=n.input.charCodeAt(n.position);oe(y);)y=n.input.charCodeAt(++n.position);if(y===58)y=n.input.charCodeAt(++n.position),j(y)||I(n,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(ye(n,c,h,d,p,null),d=p=u=null),f=!0,m=!1,r=!1,d=n.tag,p=n.result;else if(f)I(n,"can not read an implicit mapping pair; a colon is missed");else return n.tag=a,n.anchor=l,!0}else if(f)I(n,"can not read a block mapping entry; a multiline key may not be an implicit key");else return n.tag=a,n.anchor=l,!0;else break;if((n.line===s||n.lineIndent>e)&&(_e(n,e,Qe,!0,r)&&(m?p=n.result:u=n.result),m||(ye(n,c,h,d,p,u,s,o),d=p=u=null),H(n,!0,-1),y=n.input.charCodeAt(n.position)),n.lineIndent>e&&y!==0)I(n,"bad indentation of a mapping entry");else if(n.lineIndent<e)break}return m&&ye(n,c,h,d,p,null),f&&(n.tag=a,n.anchor=l,n.kind="mapping",n.result=c),f}function zl(n){var e,t=!1,i=!1,r,s,o;if(o=n.input.charCodeAt(n.position),o!==33)return!1;if(n.tag!==null&&I(n,"duplication of a tag property"),o=n.input.charCodeAt(++n.position),o===60?(t=!0,o=n.input.charCodeAt(++n.position)):o===33?(i=!0,r="!!",o=n.input.charCodeAt(++n.position)):r="!",e=n.position,t){do o=n.input.charCodeAt(++n.position);while(o!==0&&o!==62);n.position<n.length?(s=n.input.slice(e,n.position),o=n.input.charCodeAt(++n.position)):I(n,"unexpected end of the stream within a verbatim tag")}else{for(;o!==0&&!j(o);)o===33&&(i?I(n,"tag suffix cannot contain exclamation marks"):(r=n.input.slice(e-1,n.position+1),ei.test(r)||I(n,"named tag handle cannot contain such characters"),i=!0,e=n.position+1)),o=n.input.charCodeAt(++n.position);s=n.input.slice(e,n.position),Pl.test(s)&&I(n,"tag suffix cannot contain flow indicator characters")}return s&&!ni.test(s)&&I(n,"tag name cannot contain such characters: "+s),t?n.tag=s:ie.call(n.tagMap,r)?n.tag=n.tagMap[r]+s:r==="!"?n.tag="!"+s:r==="!!"?n.tag="tag:yaml.org,2002:"+s:I(n,'undeclared tag handle "'+r+'"'),!0}function Xl(n){var e,t;if(t=n.input.charCodeAt(n.position),t!==38)return!1;for(n.anchor!==null&&I(n,"duplication of an anchor property"),t=n.input.charCodeAt(++n.position),e=n.position;t!==0&&!j(t)&&!ge(t);)t=n.input.charCodeAt(++n.position);return n.position===e&&I(n,"name of an anchor node must contain at least one character"),n.anchor=n.input.slice(e,n.position),!0}function Ql(n){var e,t,i;if(i=n.input.charCodeAt(n.position),i!==42)return!1;for(i=n.input.charCodeAt(++n.position),e=n.position;i!==0&&!j(i)&&!ge(i);)i=n.input.charCodeAt(++n.position);return n.position===e&&I(n,"name of an alias node must contain at least one character"),t=n.input.slice(e,n.position),ie.call(n.anchorMap,t)||I(n,'unidentified alias "'+t+'"'),n.result=n.anchorMap[t],H(n,!0,-1),!0}function _e(n,e,t,i,r){var s,o,a,l=1,c=!1,h=!1,d,p,u,m,f;if(n.listener!==null&&n.listener("open",n),n.tag=null,n.anchor=null,n.kind=null,n.result=null,s=o=a=Qe===t||Zt===t,i&&H(n,!0,-1)&&(c=!0,n.lineIndent>e?l=1:n.lineIndent===e?l=0:n.lineIndent<e&&(l=-1)),l===1)for(;zl(n)||Xl(n);)H(n,!0,-1)?(c=!0,a=s,n.lineIndent>e?l=1:n.lineIndent===e?l=0:n.lineIndent<e&&(l=-1)):a=!1;if(a&&(a=c||r),(l===1||Qe===t)&&(Xe===t||Jt===t?m=e:m=e+1,f=n.position-n.lineStart,l===1?a&&(At(n,f)||Vl(n,f,m))||jl(n,m)?h=!0:(o&&ql(n,m)||Yl(n,m)||Kl(n,m)?h=!0:Ql(n)?(h=!0,(n.tag!==null||n.anchor!==null)&&I(n,"alias node should not have any properties")):Wl(n,m,Xe===t)&&(h=!0,n.tag===null&&(n.tag="?")),n.anchor!==null&&(n.anchorMap[n.anchor]=n.result)):l===0&&(h=a&&At(n,f))),n.tag!==null&&n.tag!=="!")if(n.tag==="?"){for(n.result!==null&&n.kind!=="scalar"&&I(n,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+n.kind+'"'),d=0,p=n.implicitTypes.length;d<p;d+=1)if(u=n.implicitTypes[d],u.resolve(n.result)){n.result=u.construct(n.result),n.tag=u.tag,n.anchor!==null&&(n.anchorMap[n.anchor]=n.result);break}}else ie.call(n.typeMap[n.kind||"fallback"],n.tag)?(u=n.typeMap[n.kind||"fallback"][n.tag],n.result!==null&&u.kind!==n.kind&&I(n,"unacceptable node kind for !<"+n.tag+'> tag; it should be "'+u.kind+'", not "'+n.kind+'"'),u.resolve(n.result)?(n.result=u.construct(n.result),n.anchor!==null&&(n.anchorMap[n.anchor]=n.result)):I(n,"cannot resolve a node with !<"+n.tag+"> explicit tag")):I(n,"unknown tag !<"+n.tag+">");return n.listener!==null&&n.listener("close",n),n.tag!==null||n.anchor!==null||h}function Jl(n){var e=n.position,t,i,r,s=!1,o;for(n.version=null,n.checkLineBreaks=n.legacy,n.tagMap={},n.anchorMap={};(o=n.input.charCodeAt(n.position))!==0&&(H(n,!0,-1),o=n.input.charCodeAt(n.position),!(n.lineIndent>0||o!==37));){for(s=!0,o=n.input.charCodeAt(++n.position),t=n.position;o!==0&&!j(o);)o=n.input.charCodeAt(++n.position);for(i=n.input.slice(t,n.position),r=[],i.length<1&&I(n,"directive name must not be less than one character in length");o!==0;){for(;oe(o);)o=n.input.charCodeAt(++n.position);if(o===35){do o=n.input.charCodeAt(++n.position);while(o!==0&&!z(o));break}if(z(o))break;for(t=n.position;o!==0&&!j(o);)o=n.input.charCodeAt(++n.position);r.push(n.input.slice(t,n.position))}o!==0&&Rn(n),ie.call(Mt,i)?Mt[i](n,i,r):Je(n,'unknown document directive "'+i+'"')}if(H(n,!0,-1),n.lineIndent===0&&n.input.charCodeAt(n.position)===45&&n.input.charCodeAt(n.position+1)===45&&n.input.charCodeAt(n.position+2)===45?(n.position+=3,H(n,!0,-1)):s&&I(n,"directives end mark is expected"),_e(n,n.lineIndent-1,Qe,!1,!0),H(n,!0,-1),n.checkLineBreaks&&Ol.test(n.input.slice(e,n.position))&&Je(n,"non-ASCII line breaks are interpreted as content"),n.documents.push(n.result),n.position===n.lineStart&&nn(n)){n.input.charCodeAt(n.position)===46&&(n.position+=3,H(n,!0,-1));return}if(n.position<n.length-1)I(n,"end of the stream or a document separator is expected");else return}function oi(n,e){n=String(n),e=e||{},n.length!==0&&(n.charCodeAt(n.length-1)!==10&&n.charCodeAt(n.length-1)!==13&&(n+=`
`),n.charCodeAt(0)===65279&&(n=n.slice(1)));var t=new Gl(n,e),i=n.indexOf("\0");for(i!==-1&&(t.position=i,I(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)Jl(t);return t.documents}function ai(n,e,t){e!==null&&typeof e=="object"&&typeof t>"u"&&(t=e,e=null);var i=oi(n,t);if(typeof e!="function")return i;for(var r=0,s=i.length;r<s;r+=1)e(i[r])}function li(n,e){var t=oi(n,e);if(t.length!==0){if(t.length===1)return t[0];throw new Xt("expected a single document in the stream, but found more")}}function Zl(n,e,t){return typeof e=="object"&&e!==null&&typeof t>"u"&&(t=e,e=null),ai(n,e,J.extend({schema:Qt},t))}function ec(n,e){return li(n,J.extend({schema:Qt},e))}Re.loadAll=ai;Re.load=li;Re.safeLoadAll=Zl;Re.safeLoad=ec;var Fn={},De=q,Ne=Le,nc=en,tc=Fe,ci=Object.prototype.toString,hi=Object.prototype.hasOwnProperty,ic=9,Ee=10,rc=13,sc=32,oc=33,ac=34,di=35,lc=37,cc=38,hc=39,dc=42,ui=44,uc=45,pi=58,pc=61,mc=62,fc=63,gc=64,mi=91,fi=93,yc=96,gi=123,_c=124,yi=125,G={};G[0]="\\0";G[7]="\\a";G[8]="\\b";G[9]="\\t";G[10]="\\n";G[11]="\\v";G[12]="\\f";G[13]="\\r";G[27]="\\e";G[34]='\\"';G[92]="\\\\";G[133]="\\N";G[160]="\\_";G[8232]="\\L";G[8233]="\\P";var bc=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function vc(n,e){var t,i,r,s,o,a,l;if(e===null)return{};for(t={},i=Object.keys(e),r=0,s=i.length;r<s;r+=1)o=i[r],a=String(e[o]),o.slice(0,2)==="!!"&&(o="tag:yaml.org,2002:"+o.slice(2)),l=n.compiledTypeMap.fallback[o],l&&hi.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[o]=a;return t}function St(n){var e,t,i;if(e=n.toString(16).toUpperCase(),n<=255)t="x",i=2;else if(n<=65535)t="u",i=4;else if(n<=4294967295)t="U",i=8;else throw new Ne("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+De.repeat("0",i-e.length)+e}function wc(n){this.schema=n.schema||nc,this.indent=Math.max(1,n.indent||2),this.noArrayIndent=n.noArrayIndent||!1,this.skipInvalid=n.skipInvalid||!1,this.flowLevel=De.isNothing(n.flowLevel)?-1:n.flowLevel,this.styleMap=vc(this.schema,n.styles||null),this.sortKeys=n.sortKeys||!1,this.lineWidth=n.lineWidth||80,this.noRefs=n.noRefs||!1,this.noCompatMode=n.noCompatMode||!1,this.condenseFlow=n.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function Et(n,e){for(var t=De.repeat(" ",e),i=0,r=-1,s="",o,a=n.length;i<a;)r=n.indexOf(`
`,i),r===-1?(o=n.slice(i),i=a):(o=n.slice(i,r+1),i=r+1),o.length&&o!==`
`&&(s+=t),s+=o;return s}function wn(n,e){return`
`+De.repeat(" ",n.indent*e)}function kc(n,e){var t,i,r;for(t=0,i=n.implicitTypes.length;t<i;t+=1)if(r=n.implicitTypes[t],r.resolve(e))return!0;return!1}function Dn(n){return n===sc||n===ic}function be(n){return 32<=n&&n<=126||161<=n&&n<=55295&&n!==8232&&n!==8233||57344<=n&&n<=65533&&n!==65279||65536<=n&&n<=1114111}function xc(n){return be(n)&&!Dn(n)&&n!==65279&&n!==rc&&n!==Ee}function Rt(n,e){return be(n)&&n!==65279&&n!==ui&&n!==mi&&n!==fi&&n!==gi&&n!==yi&&n!==pi&&(n!==di||e&&xc(e))}function Cc(n){return be(n)&&n!==65279&&!Dn(n)&&n!==uc&&n!==fc&&n!==pi&&n!==ui&&n!==mi&&n!==fi&&n!==gi&&n!==yi&&n!==di&&n!==cc&&n!==dc&&n!==oc&&n!==_c&&n!==pc&&n!==mc&&n!==hc&&n!==ac&&n!==lc&&n!==gc&&n!==yc}function _i(n){var e=/^\n* /;return e.test(n)}var bi=1,vi=2,wi=3,ki=4,qe=5;function Tc(n,e,t,i,r){var s,o,a,l=!1,c=!1,h=i!==-1,d=-1,p=Cc(n.charCodeAt(0))&&!Dn(n.charCodeAt(n.length-1));if(e)for(s=0;s<n.length;s++){if(o=n.charCodeAt(s),!be(o))return qe;a=s>0?n.charCodeAt(s-1):null,p=p&&Rt(o,a)}else{for(s=0;s<n.length;s++){if(o=n.charCodeAt(s),o===Ee)l=!0,h&&(c=c||s-d-1>i&&n[d+1]!==" ",d=s);else if(!be(o))return qe;a=s>0?n.charCodeAt(s-1):null,p=p&&Rt(o,a)}c=c||h&&s-d-1>i&&n[d+1]!==" "}return!l&&!c?p&&!r(n)?bi:vi:t>9&&_i(n)?qe:c?ki:wi}function Mc(n,e,t,i){n.dump=function(){if(e.length===0)return"''";if(!n.noCompatMode&&bc.indexOf(e)!==-1)return"'"+e+"'";var r=n.indent*Math.max(1,t),s=n.lineWidth===-1?-1:Math.max(Math.min(n.lineWidth,40),n.lineWidth-r),o=i||n.flowLevel>-1&&t>=n.flowLevel;function a(l){return kc(n,l)}switch(Tc(e,o,n.indent,s,a)){case bi:return e;case vi:return"'"+e.replace(/'/g,"''")+"'";case wi:return"|"+Lt(e,n.indent)+Ft(Et(e,r));case ki:return">"+Lt(e,n.indent)+Ft(Et(Ic(e,s),r));case qe:return'"'+Ac(e)+'"';default:throw new Ne("impossible error: invalid scalar style")}}()}function Lt(n,e){var t=_i(n)?String(e):"",i=n[n.length-1]===`
`,r=i&&(n[n.length-2]===`
`||n===`
`),s=r?"+":i?"":"-";return t+s+`
`}function Ft(n){return n[n.length-1]===`
`?n.slice(0,-1):n}function Ic(n,e){for(var t=/(\n+)([^\n]*)/g,i=function(){var c=n.indexOf(`
`);return c=c!==-1?c:n.length,t.lastIndex=c,Dt(n.slice(0,c),e)}(),r=n[0]===`
`||n[0]===" ",s,o;o=t.exec(n);){var a=o[1],l=o[2];s=l[0]===" ",i+=a+(!r&&!s&&l!==""?`
`:"")+Dt(l,e),r=s}return i}function Dt(n,e){if(n===""||n[0]===" ")return n;for(var t=/ [^ ]/g,i,r=0,s,o=0,a=0,l="";i=t.exec(n);)a=i.index,a-r>e&&(s=o>r?o:a,l+=`
`+n.slice(r,s),r=s+1),o=a;return l+=`
`,n.length-r>e&&o>r?l+=n.slice(r,o)+`
`+n.slice(o+1):l+=n.slice(r),l.slice(1)}function Ac(n){for(var e="",t,i,r,s=0;s<n.length;s++){if(t=n.charCodeAt(s),t>=55296&&t<=56319&&(i=n.charCodeAt(s+1),i>=56320&&i<=57343)){e+=St((t-55296)*1024+i-56320+65536),s++;continue}r=G[t],e+=!r&&be(t)?n[s]:r||St(t)}return e}function Sc(n,e,t){var i="",r=n.tag,s,o;for(s=0,o=t.length;s<o;s+=1)ce(n,e,t[s],!1,!1)&&(s!==0&&(i+=","+(n.condenseFlow?"":" ")),i+=n.dump);n.tag=r,n.dump="["+i+"]"}function Ec(n,e,t,i){var r="",s=n.tag,o,a;for(o=0,a=t.length;o<a;o+=1)ce(n,e+1,t[o],!0,!0)&&((!i||o!==0)&&(r+=wn(n,e)),n.dump&&Ee===n.dump.charCodeAt(0)?r+="-":r+="- ",r+=n.dump);n.tag=s,n.dump=r||"[]"}function Rc(n,e,t){var i="",r=n.tag,s=Object.keys(t),o,a,l,c,h;for(o=0,a=s.length;o<a;o+=1)h="",o!==0&&(h+=", "),n.condenseFlow&&(h+='"'),l=s[o],c=t[l],ce(n,e,l,!1,!1)&&(n.dump.length>1024&&(h+="? "),h+=n.dump+(n.condenseFlow?'"':"")+":"+(n.condenseFlow?"":" "),ce(n,e,c,!1,!1)&&(h+=n.dump,i+=h));n.tag=r,n.dump="{"+i+"}"}function Lc(n,e,t,i){var r="",s=n.tag,o=Object.keys(t),a,l,c,h,d,p;if(n.sortKeys===!0)o.sort();else if(typeof n.sortKeys=="function")o.sort(n.sortKeys);else if(n.sortKeys)throw new Ne("sortKeys must be a boolean or a function");for(a=0,l=o.length;a<l;a+=1)p="",(!i||a!==0)&&(p+=wn(n,e)),c=o[a],h=t[c],ce(n,e+1,c,!0,!0,!0)&&(d=n.tag!==null&&n.tag!=="?"||n.dump&&n.dump.length>1024,d&&(n.dump&&Ee===n.dump.charCodeAt(0)?p+="?":p+="? "),p+=n.dump,d&&(p+=wn(n,e)),ce(n,e+1,h,!0,d)&&(n.dump&&Ee===n.dump.charCodeAt(0)?p+=":":p+=": ",p+=n.dump,r+=p));n.tag=s,n.dump=r||"{}"}function Nt(n,e,t){var i,r,s,o,a,l;for(r=t?n.explicitTypes:n.implicitTypes,s=0,o=r.length;s<o;s+=1)if(a=r[s],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof e=="object"&&e instanceof a.instanceOf)&&(!a.predicate||a.predicate(e))){if(n.tag=t?a.tag:"?",a.represent){if(l=n.styleMap[a.tag]||a.defaultStyle,ci.call(a.represent)==="[object Function]")i=a.represent(e,l);else if(hi.call(a.represent,l))i=a.represent[l](e,l);else throw new Ne("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');n.dump=i}return!0}return!1}function ce(n,e,t,i,r,s){n.tag=null,n.dump=t,Nt(n,t,!1)||Nt(n,t,!0);var o=ci.call(n.dump);i&&(i=n.flowLevel<0||n.flowLevel>e);var a=o==="[object Object]"||o==="[object Array]",l,c;if(a&&(l=n.duplicates.indexOf(t),c=l!==-1),(n.tag!==null&&n.tag!=="?"||c||n.indent!==2&&e>0)&&(r=!1),c&&n.usedDuplicates[l])n.dump="*ref_"+l;else{if(a&&c&&!n.usedDuplicates[l]&&(n.usedDuplicates[l]=!0),o==="[object Object]")i&&Object.keys(n.dump).length!==0?(Lc(n,e,n.dump,r),c&&(n.dump="&ref_"+l+n.dump)):(Rc(n,e,n.dump),c&&(n.dump="&ref_"+l+" "+n.dump));else if(o==="[object Array]"){var h=n.noArrayIndent&&e>0?e-1:e;i&&n.dump.length!==0?(Ec(n,h,n.dump,r),c&&(n.dump="&ref_"+l+n.dump)):(Sc(n,h,n.dump),c&&(n.dump="&ref_"+l+" "+n.dump))}else if(o==="[object String]")n.tag!=="?"&&Mc(n,n.dump,e,s);else{if(n.skipInvalid)return!1;throw new Ne("unacceptable kind of an object to dump "+o)}n.tag!==null&&n.tag!=="?"&&(n.dump="!<"+n.tag+"> "+n.dump)}return!0}function Fc(n,e){var t=[],i=[],r,s;for(kn(n,t,i),r=0,s=i.length;r<s;r+=1)e.duplicates.push(t[i[r]]);e.usedDuplicates=new Array(s)}function kn(n,e,t){var i,r,s;if(n!==null&&typeof n=="object")if(r=e.indexOf(n),r!==-1)t.indexOf(r)===-1&&t.push(r);else if(e.push(n),Array.isArray(n))for(r=0,s=n.length;r<s;r+=1)kn(n[r],e,t);else for(i=Object.keys(n),r=0,s=i.length;r<s;r+=1)kn(n[i[r]],e,t)}function xi(n,e){e=e||{};var t=new wc(e);return t.noRefs||Fc(n,t),ce(t,0,n,!0,!0)?t.dump+`
`:""}function Dc(n,e){return xi(n,De.extend({schema:tc},e))}Fn.dump=xi;Fn.safeDump=Dc;var tn=Re,Ci=Fn;function rn(n){return function(){throw new Error("Function "+n+" is deprecated and cannot be used.")}}B.Type=U;B.Schema=ve;B.FAILSAFE_SCHEMA=Sn;B.JSON_SCHEMA=Kt;B.CORE_SCHEMA=jt;B.DEFAULT_SAFE_SCHEMA=Fe;B.DEFAULT_FULL_SCHEMA=en;B.load=tn.load;B.loadAll=tn.loadAll;B.safeLoad=tn.safeLoad;B.safeLoadAll=tn.safeLoadAll;B.dump=Ci.dump;B.safeDump=Ci.safeDump;B.YAMLException=Le;B.MINIMAL_SCHEMA=Sn;B.SAFE_SCHEMA=Fe;B.DEFAULT_SCHEMA=en;B.scan=rn("scan");B.parse=rn("parse");B.compose=rn("compose");B.addConstructor=rn("addConstructor");var Nc=B,Oc=Nc;function Pc(n){if(!n.startsWith(`---
`))return{data:{},content:n};const e=n.indexOf(`
---`,4);if(e===-1)return{data:{},content:n};const t=n.slice(4,e),i=n.slice(e+4),r=i.startsWith(`
`)?i.slice(1):i;return{data:Oc.safeLoad(t)??{},content:r}}const Ti={npc:{specialNameChance:.3},missions:{boardMaxCount:8,missionTtlMs:9e5,deliveryChance:.6,deliveryBaseReward:200,deliveryRandomReward:200,supplyRewardMultiplierMin:1.15,supplyRewardMultiplierMax:1.5,supplyRequirementsMin:1,supplyRequirementsMax:2,supplyQtyMin:3,supplyQtyMax:10,deliveryDepositFraction:.2},trading:{stockCountMin:4,stockCountMax:6,stockQtyMin:5,stockQtyMax:10,stockTtlMs:12e4,stockRepCountBonusPerLevel:1,stockRepCountBonusMin:-2,stockRepCountBonusMax:3,stockRepQtyBonusPerLevel:2,stockRepQtyBonusMin:-4,stockRepQtyBonusMax:6},fuel:{pricePerLitre:10,consumptionPerLy:5,inSystemBaseConsumptionL:4},reputation:{levelUnfriendlyMin:-300,levelNeutralMin:-100,levelFriendlyMin:100,levelLikedMin:300,levelReveredMin:600,pointsMin:-600,pointsMax:1e3,missionDeltaSmall:25,missionDeltaMedium:75,missionDeltaLarge:200,missionTierMediumReward:300,missionTierLargeReward:600,tradeModifierHated:1.2,tradeModifierUnfriendly:1.1,tradeModifierNeutral:1,tradeModifierFriendly:.92,tradeModifierLiked:.85,tradeModifierRevered:.8,repPerCredit:.01,maxRepPerVisit:10},emergencyRescue:{towFee:500,fuelDropFee:800,fuelDropLitres:15},economies:{minFactor:.75,maxFactor:1.25},miniGames:{maxHullDamageFraction:.1,abandonDamageFraction:.05,noDamageThreshold:90}};function Bc(n){const e={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},balance:{...Ti},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],economies:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[t,i]of Object.entries(n)){const r=t.split("/").pop()??"";if(r==="_template.md"||r===".gitkeep")continue;const{data:s,content:o}=Pc(i);/^systems\/[^/]+\.md$/.test(t)?e.systems.push(Hc(s,o)):/^destinations\/[^/]+\.md$/.test(t)?e.destinations.push(Uc(s,o)):/^factions\/[^/]+\.md$/.test(t)?e.factions.push($c(s,o)):/^ships\/[^/]+\.md$/.test(t)?e.ships.push(Gc(s,o)):t==="ships/components/jump-drives.md"?e.drives=Wc(s):t==="navigation/jump-routes.md"?e.routes=Yc(s):t==="commodities.md"?e.commodities=Kc(s):t==="economies.md"?e.economies=Xc(s):/^story\/[^/]+\.md$/.test(t)?e.storyBeats.push(jc(s,o)):t==="settings/new-game.md"?e.settings=qc(s):t==="settings/balance.md"?e.balance=Qc(s):t==="delivery-items.md"?e.deliveryItems=Vc(s):t==="npc-names.md"&&(e.npcNames=zc(s))}return e}function sn(n){const e=[];let t=!1;for(const i of n.split(`
`)){const r=i.trim();if(!r.startsWith("#"))if(r===""){if(t)break}else t=!0,e.push(r)}return e.join(" ")}function Hc(n,e){return{id:n.id,name:n.name,starType:n.star_type,distanceFromSol:n.distance_from_sol,zone:n.zone,security:n.security,population:n.population,dangerLevel:n.danger_level,playerKnowledge:n.player_knowledge,economies:n.economies??[],majorFactions:n.major_factions??[],destinations:n.destinations??[],tags:n.tags??[],description:sn(e)}}function Uc(n,e){const t=n.amenities??{},i={trader:t.trader??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:n.id,name:n.name,system:n.system,locationType:n.location_type,type:n.type,amenities:i,npcs:n.npcs??{},minMissions:n.min_missions??0,missionChance:n.mission_chance??0,dangerLevel:n.danger_level,tags:n.tags??[],description:sn(e),owningFactionId:n.owning_faction,difficultyMultiplier:n.difficulty_multiplier!==void 0?parseFloat(n.difficulty_multiplier):void 0}}function $c(n,e){return{id:n.id,name:n.name,type:n.type,homeSystem:n.home_system,size:n.size,influence:n.influence??[],tags:n.tags??[],description:sn(e),rivals:n.rivals??[],allies:n.allies??[]}}function Gc(n,e){return{id:n.id,name:n.name,class:n.class,cost:n.cost,cargoCapacityKg:n.cargo_capacity_kg,fuelCapacityL:n.fuel_capacity_l,hullPoints:n.hull_points,defaultJumpDrive:n.default_jump_drive,fuelEfficiency:n.fuel_efficiency,tags:n.tags??[],description:sn(e)}}function Wc(n){return(n.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function Yc(n){return(n.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function Kc(n){return(n.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function jc(n,e){return{id:n.id,title:n.title,trigger:n.trigger,type:n.type,location:n.location,skippable:n.skippable,playerKnowledge:n.player_knowledge,text:e.trim()}}function qc(n){var e,t,i,r;return{player:{name:((e=n.player)==null?void 0:e.name)??"Captain",startingCredits:((t=n.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((i=n.starting_location)==null?void 0:i.system)??"",destination:((r=n.starting_location)==null?void 0:r.destination)??""},startingShip:n.starting_ship??""}}function Vc(n){return(n.delivery_items??[]).map(t=>({id:t.id,name:t.name,weightKg:t.weight_kg}))}function zc(n){const e=n.npc_names??{};return{special:e.special??[],firstNames:e.first_names??[],lastNames:e.last_names??[]}}function Xc(n){return(n.economies??[]).map(t=>({id:t.id,summary:t.summary,commodities:(t.commodities??[]).map(i=>({id:i.id,factor:i.factor}))}))}function Qc(n){const e=Ti,t=n.npc??{},i=n.missions??{},r=n.trading??{},s=n.fuel??{},o=n.reputation??{},a=n.emergency_rescue??{},l=n.economies??{},c=n.mini_games??{};return{npc:{specialNameChance:t.special_name_chance??e.npc.specialNameChance},missions:{boardMaxCount:i.board_max_count??e.missions.boardMaxCount,missionTtlMs:i.mission_ttl_ms??e.missions.missionTtlMs,deliveryChance:i.delivery_chance??e.missions.deliveryChance,deliveryBaseReward:i.delivery_base_reward??e.missions.deliveryBaseReward,deliveryRandomReward:i.delivery_random_reward??e.missions.deliveryRandomReward,supplyRewardMultiplierMin:i.supply_reward_multiplier_min??e.missions.supplyRewardMultiplierMin,supplyRewardMultiplierMax:i.supply_reward_multiplier_max??e.missions.supplyRewardMultiplierMax,supplyRequirementsMin:i.supply_requirements_min??e.missions.supplyRequirementsMin,supplyRequirementsMax:i.supply_requirements_max??e.missions.supplyRequirementsMax,supplyQtyMin:i.supply_qty_min??e.missions.supplyQtyMin,supplyQtyMax:i.supply_qty_max??e.missions.supplyQtyMax,deliveryDepositFraction:i.delivery_deposit_fraction??e.missions.deliveryDepositFraction},trading:{stockCountMin:r.stock_count_min??e.trading.stockCountMin,stockCountMax:r.stock_count_max??e.trading.stockCountMax,stockQtyMin:r.stock_qty_min??e.trading.stockQtyMin,stockQtyMax:r.stock_qty_max??e.trading.stockQtyMax,stockTtlMs:r.stock_ttl_ms??e.trading.stockTtlMs,stockRepCountBonusPerLevel:r.stock_rep_count_bonus_per_level??e.trading.stockRepCountBonusPerLevel,stockRepCountBonusMin:r.stock_rep_count_bonus_min??e.trading.stockRepCountBonusMin,stockRepCountBonusMax:r.stock_rep_count_bonus_max??e.trading.stockRepCountBonusMax,stockRepQtyBonusPerLevel:r.stock_rep_qty_bonus_per_level??e.trading.stockRepQtyBonusPerLevel,stockRepQtyBonusMin:r.stock_rep_qty_bonus_min??e.trading.stockRepQtyBonusMin,stockRepQtyBonusMax:r.stock_rep_qty_bonus_max??e.trading.stockRepQtyBonusMax},fuel:{pricePerLitre:s.price_per_litre??e.fuel.pricePerLitre,consumptionPerLy:s.consumption_per_ly??e.fuel.consumptionPerLy,inSystemBaseConsumptionL:s.in_system_base_consumption_l??e.fuel.inSystemBaseConsumptionL},reputation:{levelUnfriendlyMin:o.level_unfriendly_min??e.reputation.levelUnfriendlyMin,levelNeutralMin:o.level_neutral_min??e.reputation.levelNeutralMin,levelFriendlyMin:o.level_friendly_min??e.reputation.levelFriendlyMin,levelLikedMin:o.level_liked_min??e.reputation.levelLikedMin,levelReveredMin:o.level_revered_min??e.reputation.levelReveredMin,pointsMin:o.points_min??e.reputation.pointsMin,pointsMax:o.points_max??e.reputation.pointsMax,missionDeltaSmall:o.mission_delta_small??e.reputation.missionDeltaSmall,missionDeltaMedium:o.mission_delta_medium??e.reputation.missionDeltaMedium,missionDeltaLarge:o.mission_delta_large??e.reputation.missionDeltaLarge,missionTierMediumReward:o.mission_tier_medium_reward??e.reputation.missionTierMediumReward,missionTierLargeReward:o.mission_tier_large_reward??e.reputation.missionTierLargeReward,tradeModifierHated:o.trade_modifier_hated??e.reputation.tradeModifierHated,tradeModifierUnfriendly:o.trade_modifier_unfriendly??e.reputation.tradeModifierUnfriendly,tradeModifierNeutral:o.trade_modifier_neutral??e.reputation.tradeModifierNeutral,tradeModifierFriendly:o.trade_modifier_friendly??e.reputation.tradeModifierFriendly,tradeModifierLiked:o.trade_modifier_liked??e.reputation.tradeModifierLiked,tradeModifierRevered:o.trade_modifier_revered??e.reputation.tradeModifierRevered,repPerCredit:o.rep_per_credit??e.reputation.repPerCredit,maxRepPerVisit:o.max_rep_per_visit??e.reputation.maxRepPerVisit},emergencyRescue:{towFee:a.tow_fee??e.emergencyRescue.towFee,fuelDropFee:a.fuel_drop_fee??e.emergencyRescue.fuelDropFee,fuelDropLitres:a.fuel_drop_litres??e.emergencyRescue.fuelDropLitres},economies:{minFactor:l.min_factor??e.economies.minFactor,maxFactor:l.max_factor??e.economies.maxFactor},miniGames:{maxHullDamageFraction:c.max_hull_damage_fraction??e.miniGames.maxHullDamageFraction,abandonDamageFraction:c.abandon_damage_fraction??e.miniGames.abandonDamageFraction,noDamageThreshold:c.no_damage_threshold??e.miniGames.noDamageThreshold}}}function Jc(){const n=Object.assign({"/docs/world/commodities.md":Us,"/docs/world/delivery-items.md":$s,"/docs/world/destinations/_template.md":Gs,"/docs/world/destinations/blackwake-yard.md":Ws,"/docs/world/destinations/ceti-landfall.md":Ys,"/docs/world/destinations/drift-market.md":Ks,"/docs/world/destinations/elysium-station.md":js,"/docs/world/destinations/eridani-anchorage.md":qs,"/docs/world/destinations/foundries-platform.md":Vs,"/docs/world/destinations/galileo-transfer.md":zs,"/docs/world/destinations/hestia-ring.md":Xs,"/docs/world/destinations/keelhaul-station.md":Qs,"/docs/world/destinations/kepler-yard.md":Js,"/docs/world/destinations/mars-anchor.md":Zs,"/docs/world/destinations/meridian-station.md":eo,"/docs/world/destinations/new-horizon-port.md":no,"/docs/world/destinations/orrery-anchorage.md":to,"/docs/world/destinations/redline-station.md":io,"/docs/world/destinations/tycho-orbital.md":ro,"/docs/world/destinations/veil-station.md":so,"/docs/world/destinations/waypoint-ceti.md":oo,"/docs/world/economies.md":ao,"/docs/world/factions/_template.md":lo,"/docs/world/factions/centauri-trade-league.md":co,"/docs/world/factions/eridani-colonial-council.md":ho,"/docs/world/factions/free-captains.md":uo,"/docs/world/factions/grey-market-cartel.md":po,"/docs/world/factions/helios-directorate.md":mo,"/docs/world/factions/independent-miners-guild.md":fo,"/docs/world/factions/procyon-institute.md":go,"/docs/world/factions/terran-union.md":yo,"/docs/world/galaxy-map.md":_o,"/docs/world/navigation/jump-routes.md":bo,"/docs/world/npc-names.md":vo,"/docs/world/settings/balance.md":wo,"/docs/world/settings/new-game.md":ko,"/docs/world/ships/_template.md":xo,"/docs/world/ships/components/jump-drives.md":Co,"/docs/world/ships/freighter.md":To,"/docs/world/ships/hauler.md":Mo,"/docs/world/ships/scout.md":Io,"/docs/world/story/_template.md":Ao,"/docs/world/story/enter-wolf-359.md":So,"/docs/world/story/first-jump.md":Eo,"/docs/world/story/opening-arrival.md":Ro,"/docs/world/systems/_template.md":Lo,"/docs/world/systems/alpha-centauri.md":Fo,"/docs/world/systems/barnards-star.md":Do,"/docs/world/systems/epsilon-eridani.md":No,"/docs/world/systems/procyon.md":Oo,"/docs/world/systems/sirius.md":Po,"/docs/world/systems/sol.md":Bo,"/docs/world/systems/tau-ceti.md":Ho,"/docs/world/systems/wolf-359.md":Uo}),e={};for(const[t,i]of Object.entries(n)){const r=t.replace("/docs/world/","");e[r]=i}return Bc(e)}$i(Jc());const Zc=navigator.maxTouchPoints>0?"touch":"keyboard",eh=new URLSearchParams(window.location.search).has("debug"),Mi={environment:"browser",primaryInput:Zc,debug:eh},nh=new Li,Ii=new Oi(Mi);Ii.connect();const th=new Hs(nh,Ii,Mi);let Ot=0;function Ai(n){th.tick(n-Ot),Ot=n,requestAnimationFrame(Ai)}requestAnimationFrame(Ai);
