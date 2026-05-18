(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const ke=40,Be=30,Mi=50,an=24;function Si(n){return n==="&"?"&amp;":n==="<"?"&lt;":n===">"?"&gt;":n}class Ai{constructor(){this.charW=0,this.charH=0,this.gridH=Be,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(ke),this.pre.dataset.gridRows=String(Be),document.body.appendChild(this.pre);const e=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${an}px "Share Tech Mono"`).catch(()=>null)]).then(e),document.fonts.addEventListener("loadingdone",e),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const e=document.createElement("span");e.style.fontFamily="'Share Tech Mono', monospace",e.style.fontSize=`${an}px`,e.style.lineHeight="1em",e.style.position="absolute",e.style.visibility="hidden",e.textContent="M",document.body.appendChild(e);const t=e.getBoundingClientRect();document.body.removeChild(e),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const e=Math.min(window.innerWidth/(ke*this.charW),window.innerHeight/(Be*this.charH)),t=Math.max(Be,Math.min(Mi,Math.floor(window.innerHeight/(this.charH*e))));if(this.pre.style.fontSize=`${an*e}px`,this.pre.style.width=`${ke*this.charW*e}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const i of this.resizeHandlers)i(ke,t)}}onResize(e){this.resizeHandlers.push(e)}drawBuffer(e){const t=[];for(const i of e){let r="";for(const o of i){const s=o.fg!=="transparent"?`fg-${o.fg}`:"",a=o.bg!=="transparent"?`bg-${o.bg}`:"",l=s&&a?`${s} ${a}`:s||a,c=l?` class="${l}"`:"";r+=`<span${c}>${Si(o.char)}</span>`}t.push(r)}this.pre.innerHTML=t.join(`
`)}getWidth(){return ke}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const Ei={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",m:"MENU",M:"MENU",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},Ri=new Set(["0","1","2","3","4","5","6","7","8","9"]),Li=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class Fi{constructor(e){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=e.debug}logDebug(e){if(this.debugMode){if(this.debugLog.unshift(e),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(e){this.actionHandlers.push(e)}onTap(e){this.tapHandlers.push(e)}onCharInput(e){this.charInputHandlers.push(e)}connect(){this.keyListener=e=>{if(Li.has(e.key)&&e.preventDefault(),Ri.has(e.key))for(const i of this.charInputHandlers.slice())i(e.key);if(e.key==="Backspace"||e.key==="Delete"){for(const i of this.charInputHandlers.slice())i("\b");return}const t=Ei[e.key];if(t)for(const i of this.actionHandlers.slice())i(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=e=>{e.preventDefault(),this.pointerStartMap.set(e.pointerId,{startX:e.clientX,startY:e.clientY}),this.activePointers.add(e.pointerId),this.logDebug(`DOWN id=${e.pointerId} (${Math.round(e.clientX)},${Math.round(e.clientY)}) type=${e.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=e=>{const t=this.pointerStartMap.get(e.pointerId),i=this.activePointers.size;if(this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId),!t){this.logDebug(`UP id=${e.pointerId} NO START`);return}const r=e.clientX-t.startX,o=e.clientY-t.startY,s=Math.abs(r),a=Math.abs(o);if(s<20&&a<20)if(i>=2){this.logDebug(`UP id=${e.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const d of this.tapHandlers.slice())d(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;s>=a?l=r>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(r)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=e=>{this.logDebug(`CANCEL id=${e.pointerId}`),this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const e=document.querySelector(".game-screen");if(!e)return"NO PRE";const t=e.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(e,t){const i=document.querySelector(".game-screen");if(!i)return null;const r=i.getBoundingClientRect(),o=parseInt(i.dataset.gridCols??"1"),s=parseInt(i.dataset.gridRows??"1");if(!o||!s||!r.width||!r.height)return null;const a=Math.floor((e-r.left)/(r.width/o)),l=Math.floor((t-r.top)/(r.height/s));return a<0||a>=o||l<0||l>=s?null:{col:a,row:l}}}function f(n,e,t,i,r,o){if(e<0||e>=n.length)return;const s=n[e];for(let a=0;a<i.length;a++){const l=t+a;l>=0&&l<s.length&&(s[l]={char:i[a],fg:r,bg:o})}}function L(n,e,t,i,r){if(e<0||e>=n.length)return;const o=n[e].length,s=Math.max(0,Math.floor((o-t.length)/2));f(n,e,s,t,i,r)}function Je(n,e){const t=n.split(/\s+/).filter(Boolean),i=[];let r="";for(const o of t)r.length===0?r=o:r.length+1+o.length<=e?r+=" "+o:(i.push(r),r=o);return r.length>0&&i.push(r),i}function pe(n,e,t,i="bright-black"){f(n,e,0,"-".repeat(t),i,"black")}function Nt(n,e,t,i,r){const o=`${i+1}/${r}`;f(n,e,0,"|<|","white","black");const s=Math.floor((t-o.length)/2);f(n,e,s,o,"bright-black","black"),f(n,e,t-3,"|>|","white","black")}const On=["UNTITLED","SPACE GAME"],Di=4,Ni=3,Oi="- An ASCII space adventure -",Pi=11,Pn=16;class Bn{constructor(e,t,i,r){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,r()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),e.onAction(o=>{this.activated||(o==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:o==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:o==="SELECT"&&this.items[this.cursorIdx].action())}),e.onTap&&e.onTap((o,s)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(s===Pn+a){this.cursorIdx=a,this.items[a].action();return}}})}update(e){}render(e){const t=e.length,i=t>0?e[0].length:0;for(let s=0;s<t;s++)for(let a=0;a<i;a++)e[s][a]={char:" ",fg:"black",bg:"black"};for(let s=0;s<On.length;s++)L(e,Di+s*Ni,On[s],"bright-cyan","black");L(e,Pi,Oi,"white","black");const r=this.items.reduce((s,a)=>Math.max(s,a.label.length+2),0),o=Math.max(0,Math.floor((i-r)/2));for(let s=0;s<this.items.length;s++){const a=Pn+s;if(a>=t)continue;const l=s===this.cursorIdx,c=l?"> ":"  ",d=l?"bright-green":"white";f(e,a,o,c+this.items[s].label,d,"black")}}}let fn=null;function Bi(n){fn=n}function F(){if(fn===null)throw new Error("World not initialised — call initWorld() before accessing world data");return fn}function Z(n){return F().systems.find(e=>e.id===n)}function N(n){return F().destinations.find(e=>e.id===n)}function xn(n){return F().routes.filter(e=>e.from===n||e.to===n)}function Ot(n){return F().drives.find(e=>e.id===n)}function Ui(n){return F().storyBeats.filter(e=>e.trigger===n)}function Hi(){return F().settings}function B(){return F().balance}function gn(n){return F().ships.find(e=>e.id===n)}function je(n,e){return F().routes.find(t=>t.from===n&&t.to===e||t.from===e&&t.to===n)}function Pt(n){return F().factions.find(e=>e.id===n)}function ae(n){return F().commodities.find(e=>e.id===n)}function $i(){return F().commodities}function Gi(){return F().systems.filter(n=>n.playerKnowledge==="public")}function Wi(n){return n.reduce((e,t)=>{const i=ae(t.commodityId);return e+t.qty*((i==null?void 0:i.weightKg)??0)},0)}function ji(n){return F().economies.find(e=>e.id===n)}function Ye(n,e){const t=B(),i=[];for(const o of e.economies){const s=ji(o);if(s){for(const a of s.commodities)if(a.id===n){i.push(a.factor);break}}}const r=i.length===0?1:i.reduce((o,s)=>o+s,0)/i.length;return Math.max(t.economies.minFactor,Math.min(t.economies.maxFactor,r))}const le=3,Un=0;function Cn(n,e){return e?n-2:n}function Ki(n){return n.toLocaleString("en-US")}class qi{constructor(e,t){this.buttonRanges=null,this.footerRow=-1,this.headerWidth=-1,this.context=e,this.player=t}render(e,t){const i=e.length,r=i>0?e[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader?(this.headerWidth=r,this.renderHeaderRow0(e,r,t.systemLabel),this.renderHeaderRow1(e,r,t.destinationLabel)):this.headerWidth=-1,t.showFooter&&(this.renderFooter(e,i,r,t.navOptions),this.footerRow=i-1)}renderHeaderRow0(e,t,i){const r=i!==void 0?i??"":(()=>{const c=Z(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),o="::";f(e,0,0,o,"bright-black","black"),f(e,0,o.length,r,"bright-cyan","black");const a=t-o.length-r.length-10;let l=o.length+r.length;for(let c=0;c<a;c++)e[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,f(e,0,l,"[M]","white","black"),l+=3,f(e,0,l," MENU","white","black"),l+=5,f(e,0,l,"::","bright-black","black")}renderHeaderRow1(e,t,i){const r=i!==void 0?i??"":(()=>{const d=this.player.destinationId?N(this.player.destinationId):null;return d?d.name.toUpperCase():"IN SPACE"})(),o=Ki(this.player.credits),s=o.length+5,a="::";f(e,1,0,a,"bright-black","black"),f(e,1,a.length,r,"cyan","black");const l=t-a.length-r.length-s;let c=a.length+r.length;for(let d=0;d<l;d++)e[1][c+d]={char:":",fg:"bright-black",bg:"black"};c+=l,f(e,1,c,o,"green","black"),c+=o.length,f(e,1,c," CR","white","black"),c+=3,f(e,1,c,"::","bright-black","black")}renderFooter(e,t,i,r){const o=t-1,s=[];if(r.length===0){for(let l=0;l<i;l++)e[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}f(e,o,0,"::","bright-black","black");let a=2;for(let l=0;l<r.length;l++){l>0&&(f(e,o,a,"::","bright-black","black"),a+=2);const c=r[l],d=`[${l+1}]`,h=` ${c.label}`,p=a;f(e,o,a,d,"white","black"),a+=d.length,f(e,o,a,h,"white","black"),a+=h.length,s.push({id:c.id,startCol:p,endCol:a})}for(let l=a;l<i;l++)e[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=s}hitTestNav(e,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const i of this.buttonRanges)if(e>=i.startCol&&e<i.endCol)return i.id;return null}hitTestHeader(e,t){if(this.headerWidth<0||t!==0)return null;const i=this.headerWidth-10,r=this.headerWidth-2;return e>=i&&e<r?"menu":null}}class te{constructor(e,t,i,r){this.activeTabIdx=0,this.activated=!1,this.player=i,this.chrome=new qi(t,i),this.opts=r,e.onCharInput&&e.onCharInput(o=>{this.activated||this.handleCharInput(o)}),e.onAction(o=>{if(!this.activated&&!this.preHandleAction(o)){if(o==="MENU"&&r.onMenu){r.onMenu();return}if(r.tabs){if(o==="LEFT"){const s=Math.max(0,this.activeTabIdx-1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}if(o==="RIGHT"){const s=Math.min(r.tabs.length-1,this.activeTabIdx+1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}}this.handleAction(o)}}),e.onTap&&e.onTap((o,s)=>{var l;if(this.activated||this.preHandleTap(o,s))return;const a=this.chrome.hitTestNav(o,s);if(a!==null){this.handleNavTap(a);return}if(this.chrome.hitTestHeader(o,s)==="menu"&&r.onMenu){r.onMenu();return}if(r.tabs&&r.title!==void 0){const c=r.showHeader??!0?le:Un,d=((l=r.summary)==null?void 0:l.length)??0,h=c+3+d;if(s===h){let p=3;for(let u=0;u<r.tabs.length;u++){const m=r.tabs[u].length+2;if(o>=p&&o<p+m){u!==this.activeTabIdx&&(this.activeTabIdx=u,this.onTabChange(u));return}p+=m+1}return}}this.handleTap(o,s)})}preHandleAction(e){return!1}preHandleTap(e,t){return!1}handleAction(e){}handleTap(e,t){}handleNavTap(e){}handleCharInput(e){}onTabChange(e){}buildChromeConfig(){return{showHeader:this.opts.showHeader??!0,showFooter:this.opts.showFooter??!0,navOptions:this.opts.navOptions}}suspend(){this.activated=!0}resume(){this.activated=!1}update(e){}render(e){var p;const t=e.length,i=t>0?e[0].length:0,r=this.opts;for(let u=0;u<t;u++)for(let m=0;m<i;m++)e[u][m]={char:" ",fg:"black",bg:"black"};const o=this.buildChromeConfig();this.chrome.render(e,o);const s=r.showHeader??!0,a=r.showFooter??!0,l=s?le:Un,c=((p=r.summary)==null?void 0:p.length)??0,d=Cn(t,a);let h;if(r.title!==void 0){f(e,l,2,r.title,"bright-white","black"),f(e,l+1,2,"'".repeat(r.title.length),"bright-black","black");for(let u=0;u<c;u++)f(e,l+2+u,2,r.summary[u],"bright-black","black");if(r.tabs){const u=l+3+c;let m=2;u<t&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++;for(let g=0;g<r.tabs.length;g++){const y=g===this.activeTabIdx,x=` ${r.tabs[g]} `,E=y?"black":"white",b=y?"green":"black";for(const I of x)u<t&&m<i&&(e[u][m]={char:I,fg:E,bg:b}),m++;u<t&&m<i&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++}h=l+5+c}else h=l+3+c}else h=l;this.renderContent(e,h,d)}}class de extends te{constructor(e,t,i,r,o,s,a=[],l=null,c){super(r,o,s,{navOptions:i,title:e,summary:a,tabs:l!==null?l.map(h=>h.label):void 0,onMenu:c}),this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.modal=null,this.lastContentTop=0,this._staticItems=t,this.tabs=l,this.infoLines=a;const d=a.length;this.lastContentTop=l!==null?le+5+d:le+3+d,this.resetCursor()}get items(){var e;return this.tabs!==null?((e=this.tabs[this.activeTabIdx])==null?void 0:e.items)??[]:this._staticItems}preHandleAction(e){return this.modal!==null?(this.modal.handleAction(e),!0):!1}preHandleTap(e,t){return this.modal!==null?(this.modal.handleTap(e,t),!0):!1}handleCharInput(e){this.modal!==null&&this.modal.handleCharInput(e)}onTabChange(e){this.resetCursor()}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):e==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):e==="SELECT"?this.activateCurrent():this.handleNavAction(e)}handleTap(e,t){const i=this.rowToVisibleItemIndex(t);i!==null&&!this.items[i].disabled&&(this.cursorIdx=i,this.activateCurrent())}moveCursor(e){const t=this.items,i=t.length;if(i===0)return;const r=this.cursorIdx===-1?e>0?i-1:0:this.cursorIdx;for(let o=0;o<i;o++){const s=((r+e*(o+1))%i+i)%i;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const e=this.items[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}rowToVisibleItemIndex(e){var r,o;let t=this.lastContentTop;const i=this.items;for(let s=0;s<i.length;s++){const a=1+(((r=i[s].details)==null?void 0:r.length)??0)+(((o=i[s].detailsColored)==null?void 0:o.length)??0);if(e>=t&&e<t+a)return s;t+=a}return null}resetCursor(){const e=this.items;for(let t=0;t<e.length;t++)if(!e[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(e){}openModal(e){this.modal=e,this.activated=!1}closeModal(){this.modal=null}renderContent(e,t,i){var E,b,I,v;this.lastContentTop=t;const o=e.length>0?e[0].length:0,s=i-1,a=s-t,l=this.items,c=l.map(C=>{var _,R;return 1+(((_=C.details)==null?void 0:_.length)??0)+(((R=C.detailsColored)==null?void 0:R.length)??0)}),h=c.reduce((C,_)=>C+_,0)>a,p=h?a-1:a,u=[];let m=[],g=0;for(let C=0;C<c.length;C++)g+c[C]>p?(m.length>0&&u.push(m),m=[C],g=c[C]):(m.push(C),g+=c[C]);m.length>0&&u.push(m),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const y=u[this.pageIndex]??[];let x=t;for(const C of y){const _=l[C],R=C===this.cursorIdx,D=_.disabled?"bright-black":R?"bright-green":_.accentFg??"white",j=_.infoFg??D,O=o-4;if(_.icon!==void 0){const w=_.icon.length;if(f(e,x,2,R?">":" ",D,"black"),f(e,x,3,_.icon,_.iconFg??D,"black"),_.info!==void 0){const A=_.info.length,M=Math.max(0,O-1-w-2-A-1),k=_.label.length>M?_.label.slice(0,M):_.label,K=Math.max(1,O-1-w-k.length-2-A);f(e,x,3+w,k+" ",D,"black"),f(e,x,3+w+k.length+1,".".repeat(K),"bright-black","black"),f(e,x,3+w+k.length+1+K+1,_.info,j,"black")}else f(e,x,3+w,_.label.slice(0,O-1-w),D,"black");for(let A=0;A<(((E=_.details)==null?void 0:E.length)??0);A++)x+1+A<=s&&f(e,x+1+A,2,("  "+_.details[A]).slice(0,O),_.detailsFg??"bright-black","black")}else if(_.info!==void 0){const w=R?"> ":"  ",S=Math.max(1,O-2-_.label.length-2-_.info.length);f(e,x,2,w+_.label+" ",D,"black"),f(e,x,2+w.length+_.label.length+1,".".repeat(S),"bright-black","black"),f(e,x,2+w.length+_.label.length+1+S+1,_.info,j,"black")}else if(_.details!==void 0&&_.details.length>0){f(e,x,2,((R?"> ":"  ")+_.label).slice(0,O),D,"black");for(let S=0;S<_.details.length;S++)x+1+S<=s&&f(e,x+1+S,2,("  "+_.details[S]).slice(0,O),_.detailsFg??"bright-black","black")}else f(e,x,2,((R?"> ":"  ")+_.label).slice(0,O),D,"black");const $=((b=_.details)==null?void 0:b.length)??0;for(let w=0;w<(((I=_.detailsColored)==null?void 0:I.length)??0);w++){const S=x+1+$+w;if(S<=s){const A=_.detailsColored[w];let M=4;for(const k of A.left)f(e,S,M,k.text,k.fg,"black"),M+=k.text.length;if(A.right!==void 0){const k=O-4-A.right.text.length;f(e,S,k,A.right.text,A.right.fg,"black")}}}x+=1+$+(((v=_.detailsColored)==null?void 0:v.length)??0)}h&&Nt(e,s,o,this.pageIndex,this.lastPageCount),this.modal!==null&&this.modal.render(e)}}class Hn extends de{constructor(e,t,i,r,o){const s=r.length===0?[{label:"NO OPTIONS AVAILABLE",disabled:!0,action:()=>{}}]:r.map(a=>({label:a.label,action:a.action}));super("MENU",s,[{id:"game",label:"GAME"}],e,t,i,[],null,o),this.onClose=o}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onClose())}handleNavTap(e){e==="game"&&!this.activated&&(this.activated=!0,this.onClose())}}function he(n){return n.size==="medium"||n.size==="large"}function Se(n,e){return n>=e.reputation.levelReveredMin?3:n>=e.reputation.levelLikedMin?2:n>=e.reputation.levelFriendlyMin?1:n<e.reputation.levelUnfriendlyMin?-2:n<e.reputation.levelNeutralMin?-1:0}function Bt(n){switch(n){case-2:return"HATED";case-1:return"UNFRIENDLY";case 0:return"NEUTRAL";case 1:return"FRIENDLY";case 2:return"LIKED";case 3:return"REVERED";default:return"NEUTRAL"}}function $n(n,e){switch(n){case-2:return e.reputation.tradeModifierHated;case-1:return e.reputation.tradeModifierUnfriendly;case 1:return e.reputation.tradeModifierFriendly;case 2:return e.reputation.tradeModifierLiked;case 3:return e.reputation.tradeModifierRevered;default:return e.reputation.tradeModifierNeutral}}function Tn(n){return`${n<0?"":"+"}${n}`}function In(n,e,t){const i=new Map;i.set(n.id,e);const r=Math.floor(e/2);for(const s of n.allies)i.set(s,r);const o=-Math.floor(e/2);for(const s of n.rivals)i.set(s,o);return i}function Ie(n,e){return n.type==="delivery"?n.pickupComplete?e.destinationId===n.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":n.requirements.every(i=>{const r=e.cargoHold.find(o=>o.commodityId===i.commodityId);return r!==void 0&&r.qty>=i.qty})?"ready-to-deliver":"needs-supplies"}function Yi(n,e){if(e.type==="delivery"){if(n.cargoCapacity-n.cargoWeightKg<e.itemWeightKg)return{ok:!1,reason:"Insufficient cargo space"};if(n.credits<e.deposit)return{ok:!1,reason:"Insufficient credits for deposit"}}return{ok:!0}}class Vi{constructor(e){const t=gn(e.shipId);if(!t)throw new Error(`Unknown ship: ${e.shipId}`);this.shipId=e.shipId,this.driveId=e.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=e.credits,this._systemId=e.systemId,this._destinationId=e.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[],this._factionReputation=new Map;for(const i of F().factions)he(i)&&this._factionReputation.set(i.id,0);this._destinationMissions=new Map}get fuelL(){return this._fuelL}addFuel(e){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+e)}consumeFuel(e){this._fuelL=Math.max(0,this._fuelL-e)}getInSystemHopCost(){const e=gn(this.shipId),t=F().balance;return Math.ceil(t.fuel.inSystemBaseConsumptionL*e.fuelEfficiency)}get credits(){return this._credits}addCredits(e){this._credits+=e}spendCredits(e){this._credits-=e}get cargoHold(){return this._cargoHold}addCargo(e,t){const i=this._cargoHold.find(r=>r.commodityId===e);i?i.qty+=t:this._cargoHold.push({commodityId:e,qty:t})}removeCargo(e,t){const i=this._cargoHold.findIndex(r=>r.commodityId===e);i<0||(t!==void 0&&t<this._cargoHold[i].qty?this._cargoHold[i].qty-=t:this._cargoHold.splice(i,1))}get missionItemsWeightKg(){return this._missionItems.reduce((e,t)=>e+t.weightKg,0)}get cargoWeightKg(){return Wi(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(e){this._destinationId=e}undock(){this._destinationId=null}jumpTo(e){this._systemId=e,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(e,t){const i={...e,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(i),e.type==="delivery"&&(this._credits-=e.deposit,t&&(this._missionItems.push({missionId:e.id,itemName:e.itemName,weightKg:e.itemWeightKg}),i.pickupComplete=!0))}collectMissionItem(e){const t=this._activeMissions.find(i=>i.id===e);!t||t.type!=="delivery"||(t.pickupComplete=!0,this._missionItems.push({missionId:t.id,itemName:t.itemName,weightKg:t.itemWeightKg}))}completeMission(e){this._activeMissions=this._activeMissions.filter(t=>t.id!==e),this._missionItems=this._missionItems.filter(t=>t.missionId!==e)}cancelMission(e){this._activeMissions=this._activeMissions.filter(t=>t.id!==e),this._missionItems=this._missionItems.filter(t=>t.missionId!==e)}getMissionsForPickup(e){return this._activeMissions.filter(t=>t.type==="delivery"&&t.pickupDestinationId===e&&!t.pickupComplete)}getMissionsForDelivery(e){return this._activeMissions.filter(t=>t.deliveryDestinationId===e&&Ie(t,this)==="ready-to-deliver")}getFactionReputation(e){return this._factionReputation.get(e)??0}modifyFactionReputation(e,t,i){const r=this.getFactionReputation(e),o=Math.min(i.reputation.pointsMax,Math.max(i.reputation.pointsMin,r+t));this._factionReputation.set(e,o)}getDestinationMissions(e){const t=this._destinationMissions.get(e);return t?Date.now()-t.generatedAt>F().balance.missions.missionTtlMs?[]:t.specs:[]}refreshDestinationMissions(e,t){this._destinationMissions.set(e,{specs:t,generatedAt:Date.now()})}}const Gn=40;class yn{constructor(e){this.focus="confirm",this.confirmRect=null,this.cancelRect=null,this.opts=e}handleAction(e){var t,i;if(e==="BACK"){this.opts.onConfirm();return}if(e==="LEFT"||e==="RIGHT"||e==="TAB"){this.opts.cancelLabel!==void 0&&(this.focus=this.focus==="confirm"?"cancel":"confirm");return}e==="SELECT"&&(this.focus==="cancel"?(i=(t=this.opts).onCancel)==null||i.call(t):this.opts.onConfirm())}handleCharInput(e){}handleTap(e,t){var i,r;this.confirmRect&&t===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.opts.onConfirm():this.cancelRect&&t===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&((r=(i=this.opts).onCancel)==null||r.call(i))}render(e){const t=e.length,i=t>0?e[0].length:0,{title:r,body:o,confirmLabel:s,cancelLabel:a}=this.opts,l=Gn-2,c=Je(o,l),d=c.length,h=4+d+1+1+1,p=Gn,u=Math.floor((i-p)/2),m=Math.floor((t-h)/2);for(let v=0;v<h;v++)for(let C=0;C<p;C++){const _=m+v,R=u+C;_>=0&&_<t&&R>=0&&R<i&&(e[_][R]={char:" ",fg:"white",bg:"black"})}const g=(v,C,_)=>{v>=0&&v<t&&C>=0&&C<i&&(e[v][C]={char:_,fg:"white",bg:"black"})};g(m,u,"+"),g(m,u+p-1,"+");for(let v=1;v<p-1;v++)g(m,u+v,"-");g(m+h-1,u,"+"),g(m+h-1,u+p-1,"+");for(let v=1;v<p-1;v++)g(m+h-1,u+v,"-");for(let v=1;v<h-1;v++)g(m+v,u,"|"),g(m+v,u+p-1,"|");const y=r.slice(0,l),x=m+1,E=u+1+Math.floor((l-y.length)/2);f(e,x,E,y,"bright-white","black"),f(e,m+2,E,"'".repeat(y.length),"bright-black","black");for(let v=0;v<c.length;v++)f(e,m+4+v,u+1,c[v],"white","black");const b=m+4+d+1,I=`[ ${s} ]`;if(a!==void 0){const v=`[ ${a} ]`,C=2,_=I.length+C+v.length,R=Math.floor((l-_)/2),D=u+1+R,j=D+I.length+C;this.confirmRect={col:D,row:b,width:I.length},this.cancelRect={col:j,row:b,width:v.length};const O=this.focus==="confirm",$=this.focus==="cancel";f(e,b,D,I,O?"black":"white",O?"green":"black"),f(e,b,j,v,$?"black":"white",$?"green":"black")}else{const v=Math.floor((l-I.length)/2),C=u+1+v;this.confirmRect={col:C,row:b,width:I.length},this.cancelRect=null,f(e,b,C,I,"black","green")}}}const zi={delivery:"[D] ",supply:"[S] "},Qi={"pending-pickup":"PENDING PICKUP","needs-supplies":"NEEDS SUPPLIES","in-transit":"IN TRANSIT","ready-to-deliver":"READY TO DELIVER"},Xi={"pending-pickup":"yellow","needs-supplies":"yellow","in-transit":"bright-black","ready-to-deliver":"bright-green"};class Ji extends de{constructor(e,t,i,r,o){super("MISSIONS",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,t,i,[],null,o),this.onBack=r,this.onGame=o}get items(){const e=this.player.activeMissions;return e.length===0?[{label:"NO ACTIVE MISSIONS",disabled:!0,action:()=>{}}]:this.sortMissions(e).map(i=>this.buildMenuItem(i))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const t=e[this.cursorIdx];t.disabled||t.action()}getStatusPriority(e){return e==="ready-to-deliver"?0:e==="needs-supplies"||e==="pending-pickup"?1:e==="in-transit"?2:3}sortMissions(e){return[...e].sort((t,i)=>{var h,p;const r=((h=N(t.deliveryDestinationId))==null?void 0:h.name)??t.deliveryDestinationId,o=((p=N(i.deliveryDestinationId))==null?void 0:p.name)??i.deliveryDestinationId,s=r.localeCompare(o);if(s!==0)return s;const a=Ie(t,this.player),l=Ie(i,this.player),c=this.getStatusPriority(a)-this.getStatusPriority(l);if(c!==0)return c;const d={delivery:0,supply:1};return d[t.type]-d[i.type]})}buildMenuItem(e){const t=Ie(e,this.player),i=N(e.deliveryDestinationId),r=(i==null?void 0:i.name)??e.deliveryDestinationId,o=Qi[t]??t,s=Xi[t]??"white",a=[`Status: ${o}`,`Dest: ${r}`];e.type!=="supply"&&a.push("");const l=e.type==="supply"?this.buildSupplyDetails(e):[];return{label:e.title,icon:zi[e.type],iconFg:"bright-yellow",info:`${e.reward} CR`,infoFg:"bright-green",details:a,detailsFg:s,detailsColored:l,action:()=>this.openMissionModal(e)}}buildSupplyDetails(e){if(e.type!=="supply")return[];const t=e.requirements.map(i=>{const r=F().commodities.find(c=>c.id===i.commodityId),o=(r==null?void 0:r.name)??i.commodityId,s=this.player.cargoHold.find(c=>c.commodityId===i.commodityId),a=(s==null?void 0:s.qty)??0,l=a>=i.qty;return{left:[{text:`${i.qty}x ${o} `,fg:"white"},{text:`(have: ${a})`,fg:l?"bright-green":"bright-black"}]}});return t.push({left:[]}),t}openMissionModal(e){let t=e.description;if(e.giverFactionId){const i=F(),r=i.factions.find(o=>o.id===e.giverFactionId);if(r){const o=B(),s=e.reward;let a;s>=o.reputation.missionTierLargeReward?a=o.reputation.missionDeltaLarge:s>=o.reputation.missionTierMediumReward?a=o.reputation.missionDeltaMedium:a=o.reputation.missionDeltaSmall;const l=In(r,a,i.factions),c=[];for(const[d,h]of l){const p=i.factions.find(u=>u.id===d);p&&c.push({id:d,name:p.name,delta:h})}c.sort((d,h)=>d.delta!==h.delta?h.delta-d.delta:d.name.localeCompare(h.name)),t+=`

REPUTATION IMPACT:
`;for(const d of c){const h=Tn(d.delta);t+=`  ${d.name.padEnd(20)} ${h}
`}}}this.openModal(new yn({title:e.title,body:t,confirmLabel:"OKAY",cancelLabel:"CANCEL MISSION",onConfirm:()=>this.closeModal(),onCancel:()=>{this.player.cancelMission(e.id),this.closeModal();const i=this.player.activeMissions.length;i===0?this.cursorIdx=-1:this.cursorIdx>=i&&(this.cursorIdx=i-1)}}))}handleNavAction(e){e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):(e==="BACK"||e==="NAV_2")&&!this.activated&&(this.activated=!0,this.onBack())}handleNavTap(e){e==="game"&&!this.activated?(this.activated=!0,this.onGame()):e==="menu"&&!this.activated&&(this.activated=!0,this.onBack())}}const _n=20,Zi="█",er="░";function nr(n,e,t){return n<=e?0:n>=t?_n:Math.round((n-e)/(t-e)*_n)}const tr={[-2]:"red",[-1]:"bright-red",0:"white",1:"bright-green",2:"bright-green",3:"bright-cyan"};class ir extends de{constructor(e,t,i,r,o){super("REPUTATION",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,t,i,[],null,o),this.onBack=r,this.onGame=o}get items(){const e=B(),i=F().factions.filter(r=>he(r));return i.sort((r,o)=>{if(r.size!==o.size){if(r.size==="large")return-1;if(o.size==="large")return 1}return r.name.localeCompare(o.name)}),i.map(r=>{const o=this.player.getFactionReputation(r.id),s=Se(o,e),a=Bt(s),l=tr[s]??"white",c=nr(o,e.reputation.pointsMin,e.reputation.levelReveredMin),d=_n-c;return{label:r.name,info:a,infoFg:l,detailsColored:[{left:[{text:Zi.repeat(c),fg:l},{text:er.repeat(d),fg:"bright-black"}],right:{text:String(o),fg:"white"}},{left:[]}],action:()=>{}}})}activateCurrent(){}handleNavAction(e){e==="BACK"&&!this.activated?(this.activated=!0,this.onBack()):e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):super.handleNavAction(e)}handleNavTap(e){e==="menu"&&!this.activated?(this.activated=!0,this.onBack()):e==="game"&&!this.activated&&(this.activated=!0,this.onGame())}}class rr extends te{constructor(e,t,i,r){super(e,t,i,{navOptions:[]}),this.pageIndex=0,this.onContinue=r;const s=Ui("game-start")[0].text.split(`

`),a=s[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=s.slice(1)):(this.yearHeader="",l=s);const c=[];for(let d=0;d<l.length;d++){const h=l[d].replace(/\n/g," "),p=Je(h,36);d>0&&c.push(""),c.push(...p)}this.bodyLines=c}handleAction(e){e==="SELECT"?(this.activated=!0,this.onContinue()):e==="LEFT"?this.pageIndex>0&&this.pageIndex--:e==="RIGHT"&&this.pageIndex++}handleTap(e,t){this.activated=!0,this.onContinue()}renderContent(e,t,i){const r=e.length>0?e[0].length:0;if(this.yearHeader){const m=Math.max(0,Math.floor((r-this.yearHeader.length)/2));f(e,t,m,this.yearHeader,"bright-yellow","black")}const o=t+2,s=i-1,a=s-o,l=Math.max(1,a),c=Math.max(1,Math.ceil(this.bodyLines.length/l));this.pageIndex>=c&&(this.pageIndex=c-1);const d=c>1,h=this.pageIndex*l,p=Math.min(h+l,this.bodyLines.length);let u=o;for(let m=h;m<p;m++){const g=this.bodyLines[m];g!==""&&f(e,u,2,g,"white","black"),u++}d&&Nt(e,s,r,this.pageIndex,c)}}const or=30;class bn{constructor(e){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=e,this.value=Math.max(e.field.min,Math.min(e.field.max,e.field.initialValue))}handleAction(e){const{field:t}=this.formDef;if(e==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(e==="UP"){this.value=Math.min(t.max,this.value+1);return}if(e==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(e==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(e==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(e==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}e==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(e){if(this.focus!=="field")return;const{field:t}=this.formDef;if(e==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(e>="0"&&e<="9"){const i=parseInt(e,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,i)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+i)}}handleTap(e,t){this.confirmRect&&t===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(e){const t=e.length,i=t>0?e[0].length:0,{title:r,field:o,derivedRows:s,confirmLabel:a}=this.formDef,l=s.length,c=8+l,d=or,h=Math.floor((i-d)/2),p=Math.floor((t-c)/2);for(let k=0;k<c;k++)for(let K=0;K<d;K++){const W=p+k,Q=h+K;W>=0&&W<t&&Q>=0&&Q<i&&(e[W][Q]={char:" ",fg:"white",bg:"black"})}const u=(k,K,W)=>{k>=0&&k<t&&K>=0&&K<i&&(e[k][K]={char:W,fg:"white",bg:"black"})};u(p,h,"+"),u(p,h+d-1,"+");for(let k=1;k<d-1;k++)u(p,h+k,"-");u(p+c-1,h,"+"),u(p+c-1,h+d-1,"+");for(let k=1;k<d-1;k++)u(p+c-1,h+k,"-");for(let k=1;k<c-1;k++)u(p+k,h,"|"),u(p+k,h+d-1,"|");const m=d-2,g=p+1,y=h+1+Math.floor((m-r.length)/2);f(e,g,y,r,"bright-white","black"),f(e,p+2,y,"'".repeat(r.length),"bright-black","black");const x=[o.label,...s.map(k=>k.label)],E=Math.max(...x.map(k=>k.length)),b=h+1+E+3,I=p+4,v=this.focus==="field";f(e,I,h+1,o.label.padEnd(E)+" : ","white","black");const C=this.value.toString().padStart(5);f(e,I,b,C,v?"black":"white",v?"green":"black");for(let k=0;k<l;k++){const K=s[k],W=p+5+k,Q=K.compute(this.value);f(e,W,h+1,K.label.padEnd(E)+" : ","white","black"),f(e,W,b,Q,"white","black")}const _=p+4+l+2,R=`[ ${a} ]`,D="[ CANCEL ]",j=3,O=R.length+j+D.length,$=Math.floor((m-O)/2),w=h+1+$,S=w+R.length+j;this.confirmRect={col:w,row:_,width:R.length},this.cancelRect={col:S,row:_,width:D.length};const A=this.focus==="confirm",M=this.focus==="cancel";f(e,_,w,R,A?"black":"white",A?"green":"black"),f(e,_,S,D,M?"black":"white",M?"green":"black")}}class sr extends de{constructor(e,t,i,r,o,s,a,l,c,d){const h=N(r),p=i.getMissionsForPickup(r),u=i.getMissionsForDelivery(r),m=p.map(M=>({label:`COLLECT: ${M.type==="delivery"?M.itemName:""}`,accentFg:"bright-yellow",action:()=>{}})),g=u.map(M=>({label:`DELIVER: ${M.title} → ${M.reward} CR`,accentFg:"bright-yellow",action:()=>{}})),y=[...m,...g],x=[];h.amenities.trader&&x.push({label:"TRADER",action:s}),i.getDestinationMissions(r).length>0&&x.push({label:"MISSION BOARD",action:a});const E=B();let b=null;if(h.owningFactionId){const M=F().factions.find(k=>k.id===h.owningFactionId);M&&he(M)&&(b=h.owningFactionId)}const I=E.fuel.pricePerLitre,v=b?$n(Se(i.getFactionReputation(b),E),E):1,C=Math.round(I*v),_=i.fuelCapacityL-i.fuelL,R=Math.floor(i.credits/C),D=Math.min(_,R);let j=null;if(h.amenities.fuel&&D>0){const M=D*C;j=y.length+(y.length>0?1:0)+x.length,x.push({label:`BUY FUEL  +${D}L  ${M}CR`,action:()=>{}})}const O=[];y.length>0&&(O.push(...y),O.push({label:"────────────────────",disabled:!0,action:()=>{}})),O.push(...x);const $=Je(h.description,36).slice(0,3),w=`DANGER: ${h.dangerLevel.toUpperCase()}`,S=[...$,w];if(h.owningFactionId){const M=F().factions.find(k=>k.id===h.owningFactionId);M&&S.push(`OPERATED BY: ${M.name}`)}const A=h.locationType==="surface"||h.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",O,[{id:"undock",label:A}],e,t,i,S,null,d),this.onShip=c,this.onRefuel=o,this.onHub=l,this.fuelItemIdx=j,this.eligibleFactionId=b;for(let M=0;M<p.length;M++){const k=p[M];m[M].action=()=>{this.player.collectMissionItem(k.id),this.onHub()}}for(let M=0;M<u.length;M++){const k=u[M];g[M].action=()=>{if(Ie(k,this.player)!=="ready-to-deliver"){this.openModal(new yn({title:"CANNOT DELIVER",body:k.type==="delivery"?"Mission item is missing from your cargo.":"Required supplies are missing from your cargo.",confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.activated=!1}}));return}if(k.type==="supply")for(const we of k.requirements)this.player.removeCargo(we.commodityId,we.qty);const W=B(),Q=F();let on="";if(k.giverFactionId){const we=Q.factions.find(Oe=>Oe.id===k.giverFactionId);if(we){const Oe=k.reward;let Pe;Oe>=W.reputation.missionTierLargeReward?Pe=W.reputation.missionDeltaLarge:Oe>=W.reputation.missionTierMediumReward?Pe=W.reputation.missionDeltaMedium:Pe=W.reputation.missionDeltaSmall;const Dn=In(we,Pe,Q.factions);for(const[V,X]of Dn)this.player.modifyFactionReputation(V,X,W);const sn=[];for(const[V,X]of Dn){const Nn=Q.factions.find(Ii=>Ii.id===V);Nn&&sn.push({id:V,name:Nn.name,delta:X})}sn.sort((V,X)=>V.delta!==X.delta?X.delta-V.delta:V.name.localeCompare(X.name)),on=`

REPUTATION:
`;for(const V of sn){const X=Tn(V.delta);on+=`  ${V.name.padEnd(20)} ${X}
`}}}this.player.completeMission(k.id),this.player.addCredits(k.reward),this.openModal(new yn({title:"MISSION COMPLETE",body:`Mission complete!

You received ${k.reward} CR.${on}`,confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.onHub()}}))}}}effectiveFuelPrice(){const e=B(),t=e.fuel.pricePerLitre;if(!this.eligibleFactionId)return t;const i=Se(this.player.getFactionReputation(this.eligibleFactionId),e);return Math.round(t*$n(i,e))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx===-1)return;const t=e[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const i=this.effectiveFuelPrice(),r=this.player.fuelCapacityL-this.player.fuelL,o=Math.floor(this.player.credits/i),s=Math.min(r,o);this.openModal(new bn({title:"BUY FUEL",field:{label:"Litres",initialValue:s,min:0,max:s},derivedRows:[{label:"Cost",compute:a=>`${a*i} CR`}],confirmLabel:"BUY",onConfirm:a=>{this.closeModal(),a>0&&this.onRefuel(a*i,a)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class ar extends de{constructor(e,t,i,r,o,s,a,l,c,d){var g;const h=N(r),p=((g=h.npcs.trader)==null?void 0:g.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(p,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,i,[],u,d),this.repGainedThisVisit=0,this.traderStock=o,this.onBuy=s,this.onSell=a,this.onHub=l,this.onUndock=c;const m=h.owningFactionId;if(m){const y=Pt(m);this.eligibleFactionId=y&&he(y)?m:null}else this.eligibleFactionId=null;this.syncItems(),this.clampCursor()}buyPrice(e,t){return Math.round(e*t)}sellPrice(e,t){return Math.round(e*t)}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(e=>{const t=ae(e.commodityId);if(!t)return[];const i=e.effectiveFactor??1,r=this.buyPrice(t.basePrice,i),o=this.player.credits>=r;return[{label:`${t.name} (x${e.qty})`,info:`${r} CR`,disabled:!o,action:()=>{const s=Math.floor(this.player.credits/r),a=Math.min(e.qty,s);this.openModal(new bn({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:a,min:0,max:a},derivedRows:[{label:"Total",compute:l=>`${l*r} CR`}],confirmLabel:"BUY",onConfirm:l=>{l>0&&(this.onBuy(e.commodityId,l,r),this.accrueReputation(l*r)),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const e=this.player.cargoHold;return e.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...e].flatMap(t=>{const i=ae(t.commodityId);if(!i)return[];const r=N(this.player.destinationId??""),o=Z(r.system),s=Ye(t.commodityId,o),a=this.sellPrice(i.basePrice,s);return[{label:`${i.name} (x${t.qty})`,info:`${a} CR`,action:()=>{this.openModal(new bn({title:i.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:l=>`${l*a} CR`}],confirmLabel:"SELL",onConfirm:l=>{l>0&&this.onSell(t.commodityId,l,a),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}accrueReputation(e){if(!this.eligibleFactionId)return;const t=B(),i=t.reputation.maxRepPerVisit-this.repGainedThisVisit;if(i<=0)return;const r=Math.min(i,e*t.reputation.repPerCredit);r<=0||(this.repGainedThisVisit+=r,this.player.modifyFactionReputation(this.eligibleFactionId,r,t))}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const e=this.items;(this.cursorIdx<0||this.cursorIdx>=e.length||(t=e[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=e.findIndex(i=>!i.disabled))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const t=e[this.cursorIdx];t.disabled||t.action()}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(e){if(this.syncItems(),super.render(e),this.eligibleFactionId){const r=B(),o=this.player.getFactionReputation(this.eligibleFactionId),s=Se(o,r),l=`STANDING: ${Bt(s)}`;f(e,le+2,2,l,"bright-black","black")}const t=e.length,i=Cn(t,!0)-2;f(e,i,2,`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,"bright-black","black")}}const lr={delivery:"[D] ",supply:"[S] "};class me extends de{constructor(e,t,i,r,o,s,a,l,c){N(r);let d;o.length===0?d=[{label:"NO MISSIONS AVAILABLE",disabled:!0,action:()=>{}}]:d=me.sortMissions(o).map(p=>me.buildMenuItem(p,i,s)),super("MISSION BOARD",d,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,i,[],null,c),this.onHub=a,this.onUndock=l}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}static sortMissions(e){return[...e].sort((t,i)=>{var l,c;const r=((l=N(t.deliveryDestinationId))==null?void 0:l.name)??t.deliveryDestinationId,o=((c=N(i.deliveryDestinationId))==null?void 0:c.name)??i.deliveryDestinationId,s=r.localeCompare(o);if(s!==0)return s;const a={delivery:0,supply:1};return a[t.type]-a[i.type]})}static destColor(e,t){if(e===t.destinationId)return"bright-green";const i=N(e);return i&&i.system===t.systemId?"bright-yellow":"white"}static buildMenuItem(e,t,i){const r=N(e.deliveryDestinationId),o=(r==null?void 0:r.name)??e.deliveryDestinationId,s=[];if(s.push(`Dest: ${o}`),e.giverFactionId){const l=F().factions.find(c=>c.id===e.giverFactionId);l&&s.push(`For: ${l.name}`)}e.type!=="supply"&&s.push("");const a=e.type==="supply"?me.buildSupplyDetails(e,t):[];return{label:e.title,icon:lr[e.type],iconFg:"bright-yellow",info:`${e.reward} CR`,infoFg:"bright-green",details:s,detailsFg:me.destColor(e.deliveryDestinationId,t),detailsColored:a,action:()=>i(e)}}static buildSupplyDetails(e,t){if(e.type!=="supply")return[];const i=e.requirements.map(r=>{const o=F().commodities.find(d=>d.id===r.commodityId),s=(o==null?void 0:o.name)??r.commodityId,a=t.cargoHold.find(d=>d.commodityId===r.commodityId),l=(a==null?void 0:a.qty)??0,c=l>=r.qty;return{left:[{text:`${r.qty}x ${s} `,fg:"white"},{text:`(have: ${l})`,fg:c?"bright-green":"bright-black"}]}});return i.push({left:[]}),i}}class cr extends te{constructor(e,t,i,r,o,s,a){super(o,s,a,{navOptions:r,title:e}),this.cursorIdx=-1,this.lastChoicesStartRow=0,this._choices=t,this._onBack=i,this.resetCursor()}preHandleAction(e){return e==="BACK"?(this.activated=!0,this._onBack(),!0):!1}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="SELECT"&&this.activateCurrent()}handleTap(e,t){const i=this.rowToChoiceIndex(t);i!==null&&!this._choices[i].disabled&&(this.cursorIdx=i,this.activateCurrent())}moveCursor(e){const t=this._choices,i=t.length;if(i===0)return;const r=this.cursorIdx===-1?e>0?i-1:0:this.cursorIdx;for(let o=0;o<i;o++){const s=((r+e*(o+1))%i+i)%i;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this._choices.length===0||this.cursorIdx===-1)return;const e=this._choices[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}resetCursor(){const e=this._choices;for(let t=0;t<e.length;t++)if(!e[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}computeChoicesHeight(){var t;let e=0;for(const i of this._choices)e+=1+(((t=i.details)==null?void 0:t.length)??0);return e}rowToChoiceIndex(e){var i;if(e<this.lastChoicesStartRow)return null;let t=this.lastChoicesStartRow;for(let r=0;r<this._choices.length;r++){const o=1+(((i=this._choices[r].details)==null?void 0:i.length)??0);if(e>=t&&e<t+o)return r;t+=o}return null}render(e){const t=e.length,i=t>0?e[0].length:0;for(let m=0;m<t;m++)for(let g=0;g<i;g++)e[m][g]={char:" ",fg:"black",bg:"black"};const r=this.buildChromeConfig();this.chrome.render(e,r);const o=!0,s=le,a=Cn(t,o),l=this.opts.title;l!==void 0&&(f(e,s,2,l,"bright-white","black"),f(e,s+1,2,"'".repeat(l.length),"bright-black","black"));const c=s+2,d=this.computeChoicesHeight(),h=a-d-1,p=h-1;this.renderContent(e,c,p),h>=0&&h<t&&pe(e,h,i);let u=h+1;this.lastChoicesStartRow=u;for(let m=0;m<this._choices.length;m++){const g=this._choices[m],y=m===this.cursorIdx,x=y?">":" ",E=g.disabled?"bright-black":y?"bright-green":"white";if(u<t&&(f(e,u,2,x,E,"black"),f(e,u,3,g.label,E,"black")),u++,g.details)for(const b of g.details)u<t&&f(e,u,4,b.slice(0,i-4),"bright-black","black"),u++}}}const dr={delivery:"[D]",supply:"[S]"};class hr extends cr{constructor(e,t,i,r,o,s,a,l){const c=Yi(i,r),d=r.type==="delivery"&&r.pickupDestinationId===r.issuingDestinationId,h=c.ok?{label:"ACCEPT MISSION",action:()=>o(d)}:{label:"ACCEPT MISSION",disabled:!0,details:c.reason?[c.reason]:[],action:()=>{}},p={label:"BACK",action:()=>s()};super("MISSION BOARD",[h,p],s,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,i),this.spec=r,this.onHub=a,this.onUndock=l}destColor(e){if(e===this.player.destinationId)return"bright-green";const t=N(e);return t&&t.system===this.player.systemId?"bright-yellow":"white"}writeDestRow(e,t,i,r,o,s){f(e,t,2,i,"white","black"),f(e,t,2+i.length,r.slice(0,s-i.length),this.destColor(o),"black")}handleAction(e){e==="NAV_1"?(this.activated=!0,this.onUndock()):e==="NAV_2"?(this.activated=!0,this.onHub()):super.handleAction(e)}handleNavTap(e){this.activated||(e==="undock"?(this.activated=!0,this.onUndock()):e==="hub"&&(this.activated=!0,this.onHub()))}renderContent(e,t,i){this.renderDetail(e,t,i)}renderDetail(e,t,i){const o=e.length>0?e[0].length:40,s=o-4;let a=t;const l=(u,m,g)=>{u<=i&&f(e,u,2,m.slice(0,s),g,"black")};l(a,`${dr[this.spec.type]} ${this.spec.title}`,"bright-yellow"),a++;const c=F(),d=this.spec.giverFactionId?c.factions.find(u=>u.id===this.spec.giverFactionId):null,h=d?` [${d.name}]`:"";if(l(a,`    ${this.spec.giverName}${h}`,"bright-black"),a++,a++,this.spec.type==="delivery"){const u=N(this.spec.pickupDestinationId),m=N(this.spec.deliveryDestinationId);if(a<=i&&this.writeDestRow(e,a,"Pickup:  ",(u==null?void 0:u.name)??this.spec.pickupDestinationId,this.spec.pickupDestinationId,s),a++,a<=i&&this.writeDestRow(e,a,"Deliver: ",(m==null?void 0:m.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,s),a++,a<=i){const g=this.player.cargoCapacity-this.player.cargoWeightKg,y=this.spec.itemWeightKg,x=g>=y,E=`Weight:  ${y} kg  (Free: ${g} kg)`;f(e,a,2,E,"white","black");const b=x?"bright-green":"red",I=2+E.length+1;I<o&&f(e,a,I,x?"✓":"✗",b,"black")}a++}else{const u=N(this.spec.deliveryDestinationId);a<=i&&this.writeDestRow(e,a,"Deliver to: ",(u==null?void 0:u.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,s),a++;for(const m of this.spec.requirements){if(a>i)break;const g=ae(m.commodityId);l(a,`  ${m.qty}x ${(g==null?void 0:g.name)??m.commodityId}`,"white"),a++}}a++;const p=Je(this.spec.description,s);for(const u of p){if(a>i)break;l(a,u,"white"),a++}if(a++,!(a>i)&&(l(a,`REWARD: ${this.spec.reward} CR`,"bright-green"),a++,this.spec.type==="delivery"&&this.spec.deposit>0&&(a<=i&&l(a,`DEPOSIT: ${this.spec.deposit} CR`,"bright-yellow"),a++),this.spec.giverFactionId)){const u=c.factions.find(m=>m.id===this.spec.giverFactionId);if(u){const m=B(),g=this.spec.reward;let y;g>=m.reputation.missionTierLargeReward?y=m.reputation.missionDeltaLarge:g>=m.reputation.missionTierMediumReward?y=m.reputation.missionDeltaMedium:y=m.reputation.missionDeltaSmall;const x=In(u,y,c.factions),E=[];for(const[b,I]of x){const v=c.factions.find(C=>C.id===b);v&&E.push({id:b,name:v.name,delta:I})}if(E.sort((b,I)=>b.delta!==I.delta?I.delta-b.delta:b.name.localeCompare(I.name)),E.length>0){if(a++,a>i)return;const b=i-1;a<=b&&(l(a,"REPUTATION IMPACT","bright-cyan"),a++);for(const I of E){if(a>b)break;const v=Tn(I.delta),C=I.delta>0?"bright-green":"red",_=s-v.length-2,R=I.name.slice(0,_),D=" ".repeat(Math.max(0,s-R.length-v.length-2));l(a,`  ${R}${D}${v}`,C),a++}}}}}}function ur(n){if(n.length===0)return 2166136261;let e=2166136261;for(let t=0;t<n.length;t++)e^=n.charCodeAt(t),e=Math.imul(e,16777619)>>>0;return e===0?1:e}const pr=[30,10,5],mr=[".","*","+"],Wn=[4e3,2e3,800],fr=[9e3,5e3,2500],gr=[null,"bright-black","white"],yr=["bright-black","white","bright-white"],_r=["white","bright-white","bright-cyan"],Ue=3,jn=25,He=2,Kn=37,qn=2*Math.PI;function br(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}class vr{constructor(e=42){this.boundsSet=!1,this.rand=br(e),this.stars=[];for(let t=0;t<3;t++)for(let i=0;i<pr[t];i++){const r=He+Math.floor(this.rand()*(Kn-He+1)),o=Ue+Math.floor(this.rand()*(jn-Ue+1)),s=this.rand()*qn,a=Wn[t]+this.rand()*(fr[t]-Wn[t]);this.stars.push({col:r,row:o,layer:t,twinklePhase:s,twinklePeriod:a})}}update(e){for(const t of this.stars)t.twinklePhase+=qn/t.twinklePeriod*e}render(e,t,i,r,o){if(!this.boundsSet){this.boundsSet=!0;const s=jn-Ue,a=Kn-He;{const l=(i-t)/s,c=(o-r)/a;for(const d of this.stars)d.row=Math.round(t+(d.row-Ue)*l),d.col=Math.round(r+(d.col-He)*c)}}for(const s of this.stars){const{row:a,col:l,layer:c}=s;if(a<t||a>i||l<r||l>o)continue;const d=Math.sin(s.twinklePhase);let h;d>=.5?h=_r[c]:d>=-.5?h=yr[c]:h=gr[c],h!==null&&(e[a][l]={char:mr[c],fg:h,bg:"black"})}}getStars(){return this.stars}}const wr=2,kr=3,xr=2*Math.PI/9e3,Cr=2*Math.PI/12e3,Tr=Math.PI/3;function Yn(n,e,t){return Math.max(e,Math.min(t,n))}class Ir{constructor(e,t,i,r,o,s=.5,a=.6){this.time=0,this.glyph=e,this.intRowStart=t,this.intRowEnd=i,this.intColStart=r,this.intColEnd=o,this.glyphHeight=e.rows.length,this.glyphWidth=Math.max(...e.rows.map(l=>l.length)),this.anchorRow=t+Math.floor((i-t)*s)-Math.floor(this.glyphHeight/2),this.anchorCol=r+Math.floor((o-r)*a)-Math.floor(this.glyphWidth/2)}update(e){this.time+=e}getDisplayPosition(){const e=Math.round(wr*Math.sin(this.time*xr)),t=Math.round(kr*Math.sin(this.time*Cr+Tr)),i=Yn(this.anchorRow+e,this.intRowStart,this.intRowEnd-this.glyphHeight+1),r=Yn(this.anchorCol+t,this.intColStart,this.intColEnd-this.glyphWidth+1);return{row:i,col:r}}render(e){const{row:t,col:i}=this.getDisplayPosition(),r=this.glyph.fg;for(let o=0;o<this.glyph.rows.length;o++){const s=this.glyph.rows[o];let a=-1,l=-1;for(let c=0;c<s.length;c++)s[c]!==" "&&(a===-1&&(a=c),l=c);if(a!==-1)for(let c=a;c<=l;c++){const d=s[c],h=t+o,p=i+c;h>=0&&h<e.length&&p>=0&&p<e[h].length&&(e[h][p]=d===" "?{char:" ",fg:"black",bg:"black"}:{char:d,fg:r,bg:"black"})}}}}const Vn=[{rows:[">---<"," |*| ","  |  "],fg:"bright-white"},{rows:["/-\\","|O|","\\-/"],fg:"cyan"},{rows:["  *  ","--+--"," [H] ","  |  ","  *  "],fg:"bright-white"}],zn=[{rows:[" /\\/\\","< ** >"," \\__/"],fg:"yellow"},{rows:["  ___"," /   \\","|  .  |"," \\___/"],fg:"yellow"},{rows:[" _/\\_","/  . \\","\\____/"],fg:"yellow"}],Qn=[{rows:["  .--."," / .. \\","| .... |"," \\ .. /","  `--'"],fg:"blue"},{rows:["  .--."," / ~~ \\","| ~~~~ |"," \\ ~~ /","  `--'"],fg:"bright-yellow"},{rows:["  .--."," /====\\","|======|"," \\====/","  `--'"],fg:"bright-cyan"}];function Mr(n,e){return n==="orbital"||n==="deep-space"?Vn[e%Vn.length]:n==="asteroid"?zn[e%zn.length]:n==="surface"?Qn[e%Qn.length]:null}const Sr=6,ln=6,Ar=23,Er=23,cn=10,Rr=0,Lr=4,Fr=18,Dr=21,Nr=35,Or=39,Xn=12,Pr=11,re=13,xe=27,dn=28,Br=12,hn=40,Jn=200,un=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],Ur="#",Zn=["green","cyan","white","yellow"],et=["*",".","+","x"];function nt(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function Hr(n,e,t){return{col:e,row:t,char:Ur,color:Zn[Math.floor(n()*Zn.length)],phase:n()*2e4,period:1e4+n()*1e4,active:n()>.2}}function Ce(n,e,t,i){const r=[];for(const o of i)for(let s=e;s<=t;s++)r.push(Hr(n,s,o));return r}class $r extends te{constructor(e,t,i,r,o,s,a){var g;super(e,t,i,{navOptions:[],onMenu:a}),this.cursorIdx=0,this.h=30,this.destObject=null,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.onTravel=r,this.onDock=o,this.onCargo=s;const l=ur(i.destinationId??"");this.starfield=new vr(l),this.inSpace=i.destinationId===null;const c=i.destinationId!=null?(g=N(i.destinationId))==null?void 0:g.locationType:void 0;this.destGlyph=Mr(c,l);const d=Math.imul(l,1664525)+1013904223>>>0,h=Math.imul(d,1664525)+1013904223>>>0;this.destRowFrac=.15+d/4294967296*.7,this.destColFrac=.15+h/4294967296*.7;const p=nt(99);this.gaugeBtns=[...Ce(p,Rr,Lr,[3,4]),...Ce(p,Fr,Dr,[3,4]),...Ce(p,Nr,Or,[3,4])],this.leftBtns=Ce(p,0,Pr,[0,1,2,3]),this.rightBtns=Ce(p,dn,39,[0,1,2,3]);const u=nt(77),m=3+Math.floor(u()*4);this.radarContacts=Array.from({length:m},()=>({x:u()*(xe-re-1),y:u()*4,vx:(u()-.5)*2,vy:(u()-.5)*1.5,char:et[Math.floor(u()*et.length)]}))}navCount(){return this.inSpace?1:2}handleAction(e){e==="CARGO"?(this.activated=!0,this.onCargo()):e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.navCount())%this.navCount():e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.navCount():e==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,this.onTravel()):this.inSpace||(this.activated=!0,this.onDock()))}handleTap(e,t){const i=this.h;(t===3||t===4)&&e>=ln&&e<ln+1+cn?(this.activated=!0,this.onCargo()):t===i-3&&e<Xn?(this.activated=!0,this.onTravel()):t===i-3&&e>=dn&&!this.inSpace&&(this.activated=!0,this.onDock())}update(e){var r;this.starfield.update(e),(r=this.destObject)==null||r.update(e),this.blinkPhase=(this.blinkPhase+e)%1e3;for(const o of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])o.phase+=e,o.phase>=o.period&&(o.phase-=o.period,o.active=!o.active);const t=xe-re,i=5;for(const o of this.radarContacts)o.x+=o.vx*e/1e3,o.y+=o.vy*e/1e3,o.x<0&&(o.x=-o.x,o.vx=-o.vx),o.x>t-1&&(o.x=2*(t-1)-o.x,o.vx=-o.vx),o.y<0&&(o.y=-o.y,o.vy=-o.vy),o.y>i-1&&(o.y=2*(i-1)-o.y,o.vy=-o.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-e);else for(this.tickerAccum+=e;this.tickerAccum>=Jn;){this.tickerAccum-=Jn,this.tickerScroll++;const o=un[this.msgIdx];if(this.tickerScroll>=o.length+hn-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%un.length,this.tickerPause=500,this.tickerAccum=0;break}}}renderContent(e,t,i){var h;const r=e.length,o=r>0?e[0].length:0;this.h=r;const s=t+2,a=r-8,l=r-7,c=r-3,d=r-2;this.renderGaugeStrip(e,t),this.starfield.render(e,s,a,0,39),!this.destObject&&this.destGlyph&&(this.destObject=new Ir(this.destGlyph,s+1,a-1,0,39,this.destRowFrac,this.destColFrac)),(h=this.destObject)==null||h.render(e);for(let p=0;p<o;p++)e[s][p]={char:"-",fg:"white",bg:"black"},e[a][p]={char:"-",fg:"white",bg:"black"};this.renderHUD(e,s+1),this.renderCrosshair(e,s+1,a-1),this.renderBottomPanels(e,l,c),this.renderTicker(e,d)}renderGaugeStrip(e,t){for(const s of this.gaugeBtns){const a=t+s.row-3,l=s.active?s.color:"bright-black";a>=0&&a<e.length&&(e[a][s.col]={char:s.char,fg:l,bg:"black"})}const i=this.player.fuelL/this.player.fuelCapacityL,r=this.player.cargoWeightKg/this.player.cargoCapacity,o=this.blinkPhase<500;this.renderGauge(e,t,Sr,"F",i,"yellow",o),this.renderGauge(e,t+1,ln,"C",r,"blue",o),this.renderGauge(e,t,Ar,"S",1,"cyan",o),this.renderGauge(e,t+1,Er,"H",1,"green",o)}renderGauge(e,t,i,r,o,s,a){if(t<0||t>=e.length)return;e[t][i]={char:r,fg:s,bg:"black"};const l=Math.round(Math.min(1,Math.max(0,o))*cn),c=o<=.2;for(let d=0;d<cn;d++){const h=i+1+d;if(d<l){const p=c&&!a?"bright-black":s;e[t][h]={char:" ",fg:"black",bg:p}}else e[t][h]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(e,t){f(e,t,1,"VEL:----","bright-black","black"),f(e,t,16,"ATT:---°","bright-black","black"),f(e,t,30,"ROT:--°","bright-black","black")}renderCrosshair(e,t,i){var a;const r=Math.floor((t+i)/2),o=20;e[r][o]={char:"+",fg:"bright-green",bg:"black"};const s=[[r-3,o-5],[r-3,o+5],[r+3,o-5],[r+3,o+5]];for(const[l,c]of s){const d=((a=e[0])==null?void 0:a.length)??40;l>=t&&l<=i&&c>=0&&c<d&&(e[l][c]={char:"+",fg:"bright-green",bg:"black"})}}renderBottomPanels(e,t,i){for(let c=t;c<=i;c++)for(let d=re;d<xe;d++)e[c][d]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(e,t,i-t+1);for(const c of this.leftBtns){const d=t+c.row;if(d<i){const h=c.active?c.color:"bright-black";e[d][c.col]={char:c.char,fg:h,bg:"black"}}}for(const c of this.rightBtns){const d=t+c.row;if(d<i){const h=c.active?c.color:"bright-black";e[d][c.col]={char:c.char,fg:h,bg:"black"}}}const r=this.cursorIdx===0?"bright-yellow":"yellow";f(e,i,0,this.centerPad("TRAVEL",Xn),"black",r);let o,s;this.inSpace?(o="bright-black",s="bright-black"):(o=this.cursorIdx===1?"bright-cyan":"cyan",s="black"),f(e,i,dn,this.centerPad("DOCK",Br),s,o);const a=xe-re,l="<)) "+"-".repeat(a-4);f(e,i,re,l,"white","bright-black")}renderRadar(e,t,i){for(const r of this.radarContacts){const o=Math.min(xe-re-1,Math.max(0,Math.floor(r.x))),s=Math.min(i-1,Math.max(0,Math.floor(r.y)));e[t+s][re+o]={char:r.char,fg:"white",bg:"bright-black"}}}renderTicker(e,t){const i=un[this.msgIdx];for(let r=0;r<hn;r++){const o=this.tickerScroll-hn+1+r,s=o>=0&&o<i.length?i[o]:" ";e[t][r]={char:s,fg:"white",bg:"black"}}}centerPad(e,t){if(e.length>=t)return e.slice(0,t);const i=t-e.length,r=Math.floor(i/2);return" ".repeat(r)+e+" ".repeat(i-r)}}class Gr extends te{constructor(e,t,i,r,o){super(e,t,i,{title:"CARGO HOLD",tabs:["COMMODITIES","MISSION GOODS"],navOptions:[{id:"back",label:"BACK"}],onMenu:o}),this.onBack=r}handleNavTap(e){e==="back"&&(this.activated=!0,this.onBack())}handleAction(e){(e==="BACK"||e==="CARGO")&&(this.activated=!0,this.onBack())}renderContent(e,t,i){const o=e.length>0?e[0].length:0,s=this.player.cargoHold,a=this.player.missionItems,l=this.player.cargoCapacity,c=this.player.cargoWeightKg,d=i-1;this.activeTabIdx===0?this.renderCommoditiesTab(e,t,d,o,s):this.renderMissionGoodsTab(e,t,d,o,a);const h=`CARGO: ${c}/${l}KG`,p=`FUEL: ${this.player.fuelL}/${this.player.fuelCapacityL}L`;f(e,d,2,h,"bright-black","black"),f(e,d,o-p.length-2,p,"bright-black","black")}renderCommoditiesTab(e,t,i,r,o){if(o.length===0){f(e,t,2,"NO COMMODITIES","bright-black","black");return}let s=t;for(const a of o){if(s>=i-1)break;const l=ae(a.commodityId);if(!l)continue;const c=a.qty*l.weightKg,d=`  x${a.qty}  ${l.basePrice}CR  ${c}KG`,h=Math.max(6,r-4-d.length),p=l.name,u=p.length>h?p.slice(0,h):p;f(e,s,2,`${u}${d}`,"white","black"),s++}}renderMissionGoodsTab(e,t,i,r,o){if(o.length===0){f(e,t,2,"NO MISSION GOODS","bright-black","black");return}let s=t;for(const a of o){if(s>=i-1)break;const l=`  ${a.weightKg}KG`,c=Math.max(6,r-4-l.length),d=a.itemName.length>c?a.itemName.slice(0,c):a.itemName;f(e,s,2,`${d}${l}`,"white","black"),s++}}}class tt extends de{constructor(e,t,i,r,o,s,a,l,c=()=>{},d){const h=Z(i.systemId),p=Ot(i.driveId),u=i.getInSystemHopCost(),m=i.fuelL<u,g=[...h.destinations.map(b=>({label:`${N(b).name.toUpperCase()}  [${u}L]`,disabled:b===i.destinationId||m,action:()=>r(b)})),{label:`FLY INTO SPACE  [${u}L]`,disabled:i.destinationId===null||m,action:s}];m&&d&&g.push({label:"[EMERGENCY]",disabled:!1,action:d});const x=[...xn(i.systemId).map(b=>{const I=b.from===i.systemId?b.to:b.from,v=Z(I),C=Math.ceil(B().fuel.consumptionPerLy*b.distance*p.fuelEfficiency);return{label:`${v.name.toUpperCase()}  ${b.distance}LY  [${C}L]`,disabled:C>i.fuelL,action:()=>o(I)}}),{label:"GALAXY MAP...",action:l}],E=[{label:"DESTINATIONS",items:g},{label:"JUMPS",items:x}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],e,t,i,[],E,c),this.onShip=a}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}class Wr extends te{constructor(e,t,i,r,o,s){super(e,t,i,{navOptions:[],title:"EMERGENCY RESCUE"}),this.cursorIdx=0,this.onBack=s;const a=Z(i.systemId),l=B();if(this.options=[],this.fuelDestId=a.destinations.find(c=>{var d;return((d=N(c))==null?void 0:d.amenities.fuel)===!0}),this.fuelDestId){const c=N(this.fuelDestId);this.options.push({label:`TOW TO ${c.name.toUpperCase()}`,fee:l.emergencyRescue.towFee,action:()=>r(this.fuelDestId)})}this.options.push({label:"EMERGENCY FUEL DROP",fee:l.emergencyRescue.fuelDropFee,action:o}),this.options.push({label:"BACK",fee:0,action:s})}preHandleAction(e){return e==="BACK"?(this.activated=!0,this.onBack(),!0):!1}handleAction(e){e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.options.length)%this.options.length:e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.options.length:e==="SELECT"&&this.cursorIdx>=0&&this.cursorIdx<this.options.length&&(this.activated=!0,this.options[this.cursorIdx].action())}handleTap(e,t){this.cursorIdx>=0&&this.cursorIdx<this.options.length&&(this.activated=!0,this.options[this.cursorIdx].action())}renderContent(e,t,i){const r=e.length,o=r>0?e[0].length:0,s=Z(this.player.systemId);let a;this.player.destinationId===null?a=`STRANDED IN SPACE NEAR ${s.name.toUpperCase()}`:a=`STRANDED AT ${N(this.player.destinationId).name.toUpperCase()}`,f(e,t,2,a,"bright-yellow","black");const l=t+2;pe(e,l,o);let c=l+1;for(let d=0;d<this.options.length;d++){const h=this.options[d],p=d===this.cursorIdx,u=p?">":" ",m=p?"bright-green":"white";if(c<r)if(f(e,c,2,u,m,"black"),h.fee===0)f(e,c,3,h.label,m,"black");else{f(e,c,3,h.label,m,"black");const g=this.player.credits-h.fee,y=`${h.fee} CR  (BALANCE: ${g>=0?"":"-"}${Math.abs(g)} CR)`,x=g<0?"bright-red":m;c+1<r&&f(e,c+1,4,y,x,"black"),c++}c++}}}function it(n,e){if(n===e)return[n];const t=[[n]],i=new Set([n]);for(;t.length>0;){const r=t.shift(),o=r[r.length-1];for(const s of xn(o)){const a=s.from===o?s.to:s.from;if(a===e)return[...r,a];i.has(a)||(i.add(a),t.push([...r,a]))}}return null}const jr=0,Kr=4,qr=8,Yr=9,rt=10,ot=15,Vr=16,zr=2,Qr=10,Xr=12,$e=13,Ge=12,Jr=25,Zr=26,eo=10,st=18;function no(n,e){return n.length>=e?n.slice(0,e):n+" ".repeat(e-n.length)}function Te(n,e){return"["+no(n.toUpperCase(),e-2)+"]"}class to extends te{constructor(e,t,i,r,o=()=>{}){super(e,t,i,{title:"GALAXY MAP",tabs:["MAP","ROUTE"],navOptions:[{id:"back",label:"BACK"}],onMenu:o}),this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.lastTop=le+5,this.onBack=r,this.publicSystems=Gi().sort((s,a)=>s.distanceFromSol-a.distanceFromSol),this.otherSystems=this.publicSystems.filter(s=>s.id!==i.systemId),this.mapBrowsingSystemId=i.systemId}onTabChange(e){this.searchText=""}handleCharInput(e){if(this.activeTabIdx!==0)return;const t=e.charCodeAt(0);e==="\b"||e===""?this.searchText=this.searchText.slice(0,-1):t>=32&&t<127&&(this.searchText+=e.toUpperCase(),this.mapCursorIdx=0)}handleAction(e){if(e==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}this.activeTabIdx===0?this.handleMapAction(e):this.handleRouteAction(e)}handleNavTap(e){e==="back"&&(this.searchText="",this.activated=!0,this.onBack())}handleTap(e,t){const i=this.lastTop,r=i+rt,o=i+ot;if(this.activeTabIdx===0&&t>=r&&t<o){const s=this.getMapNeighbors(),a=t-r;a>=0&&a<s.length&&(this.mapBrowsingSystemId=s[a].id,this.mapCursorIdx=0,this.searchText="")}else if(this.activeTabIdx===1){const s=i+3,a=i+9;if(t>=s&&t<=a){const l=t-s;l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}}}getMapNeighbors(){const t=xn(this.mapBrowsingSystemId).map(i=>{const r=i.from===this.mapBrowsingSystemId?i.to:i.from,o=this.publicSystems.find(a=>a.id===r),s=i.distance;return o?{sys:o,dist:s}:null}).filter(i=>i!==null).sort((i,r)=>i.dist-r.dist).map(i=>i.sys);return this.searchText.length===0?t:t.filter(i=>i.name.toUpperCase().includes(this.searchText))}handleMapAction(e){const t=this.getMapNeighbors(),i=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(e==="UP")this.mapCursorIdx=Math.max(0,i-1);else if(e==="DOWN")this.mapCursorIdx=Math.min(t.length-1,i+1);else if(e==="SELECT"){const r=t[i];if(!r)return;this.mapBrowsingSystemId=r.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(e){e==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):e==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const e=this.otherSystems[this.routeDestIdx];return e?it(this.player.systemId,e.id):null}renderContent(e,t,i){this.lastTop=t;const r=e.length>0?e[0].length:0;this.activeTabIdx===0?this.renderMapTab(e,t,i,r):this.renderRouteTab(e,t,i,r)}renderMapTab(e,t,i,r){const o=this.publicSystems.find(p=>p.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!o)return;const s=t+Yr,a=t+rt,l=t+ot,c=t+Vr;this.renderChart(e,o,t),pe(e,s,r);const d=this.getMapNeighbors(),h=Math.min(this.mapCursorIdx,Math.max(0,d.length-1));this.renderNeighborList(e,r,o,d,h,a,l),pe(e,l,r),this.renderInfo(e,r,o,d[h]??null,c),this.searchText.length>0&&f(e,c+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(e,t,i){var d;const r=this.getMapNeighbors(),o=i+jr,s=i+Kr,a=i+qr,l=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(f(e,s,$e,Te(t.name,Ge),l,"black"),t.id===this.player.systemId){const h=$e+Ge,p=((d=e[0])==null?void 0:d.length)??40;h<p&&(e[s][h]={char:"*",fg:"bright-yellow",bg:"black"})}const c=["left","right","top","bottom"];for(let h=0;h<Math.min(r.length,4);h++){const p=r[h],u=c[h],m=p.id===this.player.systemId?"bright-yellow":"white";if(u==="left")f(e,s,zr,Te(p.name,Qr),m,"black"),e[s][Xr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="right")f(e,s,Zr,Te(p.name,eo),m,"black"),e[s][Jr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="top"){f(e,o,$e,Te(p.name,Ge),m,"black");for(let g=o+1;g<s;g++)e[g][st]={char:"|",fg:"bright-black",bg:"black"}}else{f(e,a,$e,Te(p.name,Ge),m,"black");for(let g=s+1;g<a;g++)e[g][st]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(e,t,i,r,o,s,a){for(let l=0;l<r.length&&l<a-s;l++){const c=r[l],d=s+l,h=l===o,u=c.id===this.player.systemId?"bright-yellow":h?"bright-cyan":"white",m=h?"> ":"  ",g=je(i.id,c.id),y=g?`${g.distance}LY  ${g.stability}`:"",x=t-4-y.length;f(e,d,2,m+c.name.toUpperCase().slice(0,x-2),u,"black"),y&&f(e,d,t-2-y.length,y,"bright-black","black")}}renderInfo(e,t,i,r,o){const a=i.id===this.player.systemId?"* Current location":i.name.toUpperCase();if(f(e,o,2,`Zone: ${i.zone}  Sec: ${i.security}  ${a}`.slice(0,t-4),"bright-black","black"),!r)return;const l=je(i.id,r.id);if(!l)return;const c=it(this.player.systemId,r.id),d=c?c.length===1?"(your location)":`${c.length-1} hop${c.length-1!==1?"s":""} from you`:"(unreachable)";f(e,o+1,2,`${r.name.toUpperCase()}  ${l.distance}LY  ${d}`.slice(0,t-4),"bright-black","black")}renderRouteTab(e,t,i,r){var x,E;const o=t,s=t+2,a=t+3,l=7,c=a+l,d=c+1,h=d+6,p=this.publicSystems.find(b=>b.id===this.player.systemId);f(e,o,2,"FROM:","bright-black","black"),f(e,o,8,(p==null?void 0:p.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),f(e,s,2,"TO:","bright-black","black");const u=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-l));for(let b=0;b<l;b++){const I=u+b;if(I>=this.otherSystems.length)break;const v=this.otherSystems[I],C=I===this.routeDestIdx,_=C?"bright-cyan":"white",R=C?"> ":"  ";f(e,a+b,2,R+v.name.toUpperCase(),_,"black")}pe(e,c,r),pe(e,h,r);const m=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!m){f(e,d,2,"No route found","bright-red","black");return}const y=m.length-1;f(e,d,2,`Route: ${y} hop${y!==1?"s":""}`,"bright-white","black");for(let b=0;b<y;b++){const I=je(m[b],m[b+1]);if(!I)continue;const v=d+1+b;if(v>=h)break;const C=(((x=this.publicSystems.find(R=>R.id===m[b]))==null?void 0:x.name)??m[b]).toUpperCase().slice(0,9),_=(((E=this.publicSystems.find(R=>R.id===m[b+1]))==null?void 0:E.name)??m[b+1]).toUpperCase().slice(0,9);f(e,v,4,`${C} -> ${_}  ${I.distance}LY  ${I.stability}`.slice(0,r-6),"white","black")}}}class ie extends te{constructor(e,t,i,r){const o={onAction:()=>{}};super(o,t,e,{navOptions:[]}),this.elapsed=0,this.arrived=!1,this.duration=i,this.onComplete=r}update(e){this.arrived||(this.elapsed+=e,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const io=["[. . .]","[: : :]","[* * *]"],at=5e3;class ro extends ie{constructor(e,t,i){super(e,t,at,i)}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(e,t,i){const r=e.length,o=Math.floor(r/2),s=Math.floor(this.elapsed/500)%3,a=Math.ceil((at-this.elapsed)/1e3),l=Math.max(1,Math.min(5,a)),c=Z(this.player.systemId),d=c?c.name.toUpperCase():this.player.systemId.toUpperCase();L(e,o-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),L(e,o-1,"DESTINATION:","bright-black","black"),L(e,o,d,"bright-white","black"),L(e,o+2,io[s],"bright-black","black"),L(e,o+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const lt=2e3,oo=["[ —   ]","[  —  ]","[   — ]"];class pn extends ie{constructor(e,t,i,r){super(e,t,lt,i),this.targetLabel=r}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(e,t,i){const r=e.length,o=Math.floor(r/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((lt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a)),c=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const d=this.player.destinationId?N(this.player.destinationId):null;return d?d.name.toUpperCase():"UNKNOWN"})();L(e,o-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),L(e,o-1,"HEADING TO:","bright-black","black"),L(e,o,c,"bright-white","black"),L(e,o+2,oo[s],"bright-black","black"),L(e,o+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const ct=2500,so=["v","vv","vvv"];class ao extends ie{constructor(e,t,i){super(e,t,ct,i)}renderContent(e,t,i){const r=e.length,o=Math.floor(r/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((ct-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));L(e,o-3,"[ LANDING SEQUENCE ]","bright-green","black"),L(e,o+2,so[s],"bright-black","black"),L(e,o+4,`TOUCHDOWN IN ${l}S`,"bright-black","black")}}const dt=2500,lo=[">",">>",">>>"];class co extends ie{constructor(e,t,i){super(e,t,dt,i)}renderContent(e,t,i){const r=e.length,o=Math.floor(r/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((dt-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));L(e,o-3,"[ APPROACH LOCKED ]","bright-yellow","black"),L(e,o+2,lo[s],"bright-black","black"),L(e,o+4,`CLAMPING IN ${l}S`,"bright-black","black")}}const ht=1500,ho=["^","^^","^^^"];class uo extends ie{constructor(e,t,i){super(e,t,ht,i)}renderContent(e,t,i){const r=e.length,o=Math.floor(r/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((ht-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));L(e,o-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),L(e,o+2,ho[s],"bright-black","black"),L(e,o+4,`CLEAR IN ${l}S`,"bright-black","black")}}const ut=1500,po=["<","<<","<<<"];class mo extends ie{constructor(e,t,i){super(e,t,ut,i)}renderContent(e,t,i){const r=e.length,o=Math.floor(r/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((ut-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));L(e,o-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),L(e,o+2,po[s],"bright-black","black"),L(e,o+4,`DEPARTING IN ${l}S`,"bright-black","black")}}const pt=1500,fo=["→","→→","→→→"];class go extends ie{constructor(e,t,i){super(e,t,pt,i)}renderContent(e,t,i){const r=e.length,o=Math.floor(r/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((pt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));L(e,o-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),L(e,o+2,fo[s],"bright-black","black"),L(e,o+4,`DOCKING IN ${l}S`,"bright-black","black")}}const mt=1500,yo=["←","←←","←←←"];class _o extends ie{constructor(e,t,i){super(e,t,mt,i)}renderContent(e,t,i){const r=e.length,o=Math.floor(r/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((mt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));L(e,o-3,"[ DEPARTING BERTH ]","bright-cyan","black"),L(e,o+2,yo[s],"bright-black","black"),L(e,o+4,`CLEAR IN ${l}S`,"bright-black","black")}}function bo(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function vo(n,e){return Math.floor(n()*e)}function Me(n,e){return e[vo(n,e.length)]}function Ut(n,e){const{special:t,firstNames:i,lastNames:r}=e.npcNames;if(n()<B().npc.specialNameChance&&t.length>0)return{giverName:Me(n,t)};const o=i.length>0?Me(n,i):"Unknown",s=r.length>0?Me(n,r):"Agent";return{giverName:`${o} ${s}`}}function wo(n,e){return e.destinations.filter(t=>t.id!==n.id)}function ko(n){return n.commodities.filter(e=>e.legal)}function xo(n,e){const t=e.reduce((r,o)=>r+o.weightKg,0);if(t===0)return e[0];let i=n()*t;for(const r of e)if(i-=r.weightKg,i<0)return r;return e[e.length-1]}function ft(n,e,t,i){var y;const r=t.deliveryItems;if(r.length===0)return null;const o=wo(e,t);if(o.length===0)return null;const s=xo(n,r),a=Me(n,o),l=Ut(n,t),{deliveryBaseReward:c,deliveryRandomReward:d,deliveryDepositFraction:h}=B().missions,p=Math.floor(s.weightKg*1.5),u=c+p+Math.floor(n()*d),m=Math.floor(u*h),g=e.owningFactionId?(y=F().factions.find(x=>x.id===e.owningFactionId&&he(x)))==null?void 0:y.id:void 0;return{...l,giverFactionId:g,id:i,type:"delivery",title:s.name,description:`A package needs transporting. Pick up the ${s.name} from ${e.name} and deliver it to ${a.name}. Handle with care.`,reward:u,issuingDestinationId:e.id,itemName:s.name,itemWeightKg:s.weightKg,pickupDestinationId:e.id,deliveryDestinationId:a.id,deposit:m}}function gt(n,e,t,i){var $;const r=ko(t);if(r.length===0)return null;const o=Z(e.system),s=[],a=[];for(const w of r)(o?Ye(w.id,o):1)>1&&a.push(w),s.push(w);const l=a.length>0?a:r;for(const w of l)s.push(w);const{supplyRequirementsMin:c,supplyRequirementsMax:d,supplyQtyMin:h,supplyQtyMax:p}=B().missions,u=c+Math.floor(n()*(d-c+1)),m=[],g=new Set;for(let w=0;w<u;w++){let S=0;for(;S<10;){const A=Me(n,s);if(!g.has(A.id)){g.add(A.id);const M=h+Math.floor(n()*(p-h+1));m.push({commodityId:A.id,qty:M});break}S++}}if(m.length===0)return null;const y=m.reduce((w,S)=>{const A=t.commodities.find(M=>M.id===S.commodityId);return w+((A==null?void 0:A.basePrice)??100)*S.qty},0),x=m.reduce((w,S)=>{const A=t.commodities.find(M=>M.id===S.commodityId);return w+((A==null?void 0:A.weightKg)??1)*S.qty},0),{supplyRewardMultiplierMin:E,supplyRewardMultiplierMax:b}=B().missions,I=Math.min(1,x/500),v=n(),C=v+I*(1-v)*.15,_=E+C*(b-E),R=Math.floor(y*_),D=Ut(n,t),j=m.map(w=>{const S=t.commodities.find(A=>A.id===w.commodityId);return`${w.qty}× ${(S==null?void 0:S.name)??w.commodityId}`}).join(", "),O=e.owningFactionId?($=F().factions.find(w=>w.id===e.owningFactionId&&he(w)))==null?void 0:$.id:void 0;return{...D,giverFactionId:O,id:i,type:"supply",title:e.name,description:`${e.name} needs supplies. Deliver ${j} to fulfil the contract.`,reward:R,issuingDestinationId:e.id,requirements:m,deliveryDestinationId:e.id}}function Co(n){let e=0;for(let t=0;t<n.length;t++)e=(e<<5)-e^n.charCodeAt(t);return e>>>0}function To(n,e,t){const i=B();let r;{const c=i.missions.missionTtlMs,d=Date.now(),h=Math.floor(d/c);r=Co(n.id)^h}const o=bo(r),{boardMaxCount:s,deliveryChance:a}=i.missions,l=[];for(let c=0;c<n.minMissions&&l.length<s;c++){const d=`m-${(r>>>0).toString(16)}-${l.length}`,p=o()<a?ft(o,n,e,d):gt(o,n,e,d);p&&l.push(p)}for(;l.length<s&&o()<n.missionChance;){const c=`m-${(r>>>0).toString(16)}-${l.length}`,h=o()<a?ft(o,n,e,c):gt(o,n,e,c);h&&l.push(h)}return l}const Io=100;function We(n,e,t){return Math.max(e,Math.min(t,n))}function Mo(n,e,t,i){const{stockCountMin:r,stockCountMax:o,stockQtyMin:s,stockQtyMax:a,stockRepCountBonusPerLevel:l,stockRepCountBonusMin:c,stockRepCountBonusMax:d,stockRepQtyBonusPerLevel:h,stockRepQtyBonusMin:p,stockRepQtyBonusMax:u}=t.trading,m=We(e*l,c,d),g=We(e*h,p,u),y=n.length,x=We(r+m,1,y),E=We(o+m,1,y),b=x+Math.floor(Math.random()*(E-x+1)),I=[];if(i)for(const w of n){const A=1/Ye(w.id,i),M=Math.ceil(A*10);for(let k=0;k<M;k++)I.push(w)}else I.push(...n);const v=[...I];for(let w=v.length-1;w>0;w--){const S=Math.floor(Math.random()*(w+1));[v[w],v[S]]=[v[S],v[w]]}const C=s+g,_=a+g,R=n.map(w=>Math.log(w.basePrice*w.weightKg)),D=Math.min(...R),O=Math.max(...R)-D,$=new Map;for(const w of v.slice(0,b)){if($.has(w.id))continue;const S=C+Math.floor(Math.random()*(_-C+1));let A=1;O>0&&(A=1.5-(Math.log(w.basePrice*w.weightKg)-D)/O);const M=i?Ye(w.id,i):1;$.set(w.id,{commodityId:w.id,qty:Math.max(1,Math.floor(S*A)),effectiveFactor:M})}return Array.from($.values())}class So{constructor(e,t,i){this.sceneBeforeMenu=null,this.traderStockCache=new Map,this.renderer=e,this.input=t,this.context=i;const r=Hi(),o=gn(r.startingShip);this.player=new Vi({shipId:r.startingShip,driveId:o.defaultJumpDrive,credits:r.player.startingCredits,systemId:r.startingLocation.system,destinationId:r.startingLocation.destination}),this.currentScene=new Bn(this.input,this.context,this.player,()=>this.goToStory())}tick(e){const t=Math.min(e,Io),i=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(i),this.renderer.drawBuffer(i)}makeBuffer(){const e=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:e},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(e,t){const i=Date.now(),r=this.traderStockCache.get(e),o=B();if(r&&r.repLevel===t&&i-r.generatedAt<o.trading.stockTtlMs)return r.entries;const s=N(e),a=s?Z(s.system):void 0,l=Mo($i(),t,o,a);return this.traderStockCache.set(e,{entries:l,generatedAt:i,repLevel:t}),l}refreshDestinationMissions(e){const t=N(e),i=F(),r=To(t,i);this.player.refreshDestinationMissions(e,r)}onBuy(e,t,i,r){if(t<=0)return;const o=r.findIndex(d=>d.commodityId===e);if(o<0)return;const s=r[o];if(t>s.qty)return;const a=ae(e);if(!a)return;const l=t*i;this.player.credits<l||this.player.cargoWeightKg+t*a.weightKg>this.player.cargoCapacity||(this.player.spendCredits(l),this.player.addCargo(e,t),s.qty-=t,s.qty<=0&&r.splice(o,1))}onSell(e,t,i,r){if(t<=0)return;const o=this.player.cargoHold.find(c=>c.commodityId===e);if(!o||o.qty<t||!ae(e))return;const a=t*i;this.player.addCredits(a),this.player.removeCargo(e,t);const l=r.find(c=>c.commodityId===e);l?l.qty+=t:r.push({commodityId:e,qty:t})}goToMainMenu(){this.currentScene=new Bn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new rr(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){const e=this.player.destinationId;this.refreshDestinationMissions(e),this.currentScene=new sr(this.input,this.context,this.player,e,(t,i)=>{this.player.spendCredits(t),this.player.addFuel(i),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToLandOrDock(){var t;const e=(t=N(this.player.destinationId))==null?void 0:t.locationType;e==="surface"?this.currentScene=new ao(this.player,this.context,()=>this.goToStation()):e==="asteroid"?this.currentScene=new co(this.player,this.context,()=>this.goToStation()):this.currentScene=new go(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const e=(t=N(this.player.destinationId))==null?void 0:t.locationType;e==="surface"?this.currentScene=new uo(this.player,this.context,()=>this.goToShip()):e==="asteroid"?this.currentScene=new mo(this.player,this.context,()=>this.goToShip()):this.currentScene=new _o(this.player,this.context,()=>this.goToShip())}goToTrader(){const e=this.player.destinationId,t=N(e);let i=0;if(t.owningFactionId){const o=Pt(t.owningFactionId);if(o&&he(o)){const s=B(),a=this.player.getFactionReputation(t.owningFactionId);i=Se(a,s)}}const r=this.getOrCreateTraderStock(e,i);this.currentScene=new ar(this.input,this.context,this.player,e,r,(o,s,a)=>this.onBuy(o,s,a,r),(o,s,a)=>this.onSell(o,s,a,r),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionBoard(){const e=this.player.destinationId,t=this.player.getDestinationMissions(e);this.currentScene=new me(this.input,this.context,this.player,e,t,i=>this.goToMissionDetail(i,e),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionDetail(e,t){this.currentScene=new hr(this.input,this.context,this.player,e,i=>this.onMissionAccepted(e,i,t),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock())}onMissionAccepted(e,t,i){const r=this.player.getDestinationMissions(i),o=r.findIndex(s=>s.id===e.id);o>=0&&(r.splice(o,1),this.player.refreshDestinationMissions(i,r)),this.player.acceptMission(e,t),this.goToMissionBoard()}goToShip(){this.currentScene=new $r(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo(),()=>this.goToGlobalMenu())}goToCargo(){this.currentScene=new Gr(this.input,this.context,this.player,()=>this.goToShip(),()=>this.goToGlobalMenu())}buildMenuEntries(){return[{label:"MISSIONS",action:()=>this.goToMissionLog()},{label:"REPUTATION",action:()=>this.goToReputation()}]}goToMissionLog(){this.currentScene=new Ji(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToReputation(){this.currentScene=new ir(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToGlobalMenuFromSubScene(){this.currentScene=new Hn(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}goToGlobalMenu(){this.sceneBeforeMenu=this.currentScene,"suspend"in this.currentScene&&this.currentScene.suspend(),this.currentScene=new Hn(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}returnFromMenu(){const e=this.sceneBeforeMenu;this.sceneBeforeMenu=null,e!==null?("resume"in e&&e.resume(),this.currentScene=e):this.goToShip()}goToTravelMenu(){this.currentScene=new tt(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu(),()=>this.goToEmergencyRescue())}goToArrival(){this.currentScene=new tt(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu(),()=>this.goToEmergencyRescue())}goToGalaxyMap(){this.currentScene=new to(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToGlobalMenu())}goToFlyIntoSpace(){const e=this.player.getInSystemHopCost();this.player.consumeFuel(e),this.player.undock(),this.currentScene=new pn(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(e){const t=this.player.getInSystemHopCost();this.player.consumeFuel(t),this.player.dock(e),this.currentScene=new pn(this.player,this.context,()=>this.goToShip())}onJumpSelected(e){const t=je(this.player.systemId,e),i=Ot(this.player.driveId),r=Math.ceil(B().fuel.consumptionPerLy*t.distance*i.fuelEfficiency);this.player.consumeFuel(r),this.player.jumpTo(e),this.currentScene=new ro(this.player,this.context,()=>this.goToArrival())}goToEmergencyRescue(){this.currentScene=new Wr(this.input,this.context,this.player,e=>this.onEmergencyTow(e),()=>this.onEmergencyFuelDrop(),()=>this.goToTravelMenu())}onEmergencyTow(e){const t=B();this.player.spendCredits(t.emergencyRescue.towFee),this.player.dock(e),this.currentScene=new pn(this.player,this.context,()=>this.goToShip())}onEmergencyFuelDrop(){const e=B();this.player.spendCredits(e.emergencyRescue.fuelDropFee),this.player.addFuel(e.emergencyRescue.fuelDropLitres),this.goToTravelMenu()}}const Ao=`---
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
`,Eo=`---
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
`,Ro=`---
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
`,Lo=`---
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
`,Fo=`---
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
`,Do=`---
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
`,No=`---
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
`,Oo=`---
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
`,Po=`---
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
`,Bo=`---
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
`,Uo=`---
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
`,Ho=`---
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
`,$o=`---
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
`,Go=`---
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
`,Wo=`---
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
`,jo=`---
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
`,Ko=`---
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
`,qo=`---
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
`,Yo=`---
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
`,Vo=`---
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
`,zo=`---
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
`,Qo=`---
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
`,Xo=`---
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
`,Jo=`---
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
`,Zo=`---
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
`,es=`---
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
`,ns=`---
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
`,ts=`---
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
`,is=`---
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
`,rs=`---
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
`,os=`---
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
`,ss=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,as=`---
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
`,ls=`---
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
`,cs=`---
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
---
`,ds=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,hs=`---
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
`,us=`---
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

Long range engines for faster than light travel between systems.`,ps=`---
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
`,ms=`---
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
`,fs=`---
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
`,gs=`---
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
`,ys=`---
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
`,_s=`---
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
`,bs=`---
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
`,vs=`---
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
`,ws=`---
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
`,ks=`---
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
`,xs=`---
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
`,Cs=`---
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
`,Ts=`---
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
`,Is=`---
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
`,Ms=`---
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
`,Ss=`---
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
`;var P={},Re={},Y={};function Ht(n){return typeof n>"u"||n===null}function As(n){return typeof n=="object"&&n!==null}function Es(n){return Array.isArray(n)?n:Ht(n)?[]:[n]}function Rs(n,e){var t,i,r,o;if(e)for(o=Object.keys(e),t=0,i=o.length;t<i;t+=1)r=o[t],n[r]=e[r];return n}function Ls(n,e){var t="",i;for(i=0;i<e;i+=1)t+=n;return t}function Fs(n){return n===0&&Number.NEGATIVE_INFINITY===1/n}Y.isNothing=Ht;Y.isObject=As;Y.toArray=Es;Y.repeat=Ls;Y.isNegativeZero=Fs;Y.extend=Rs;function Ae(n,e){Error.call(this),this.name="YAMLException",this.reason=n,this.mark=e,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}Ae.prototype=Object.create(Error.prototype);Ae.prototype.constructor=Ae;Ae.prototype.toString=function(e){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!e&&this.mark&&(t+=" "+this.mark.toString()),t};var Le=Ae,yt=Y;function Mn(n,e,t,i,r){this.name=n,this.buffer=e,this.position=t,this.line=i,this.column=r}Mn.prototype.getSnippet=function(e,t){var i,r,o,s,a;if(!this.buffer)return null;for(e=e||4,t=t||75,i="",r=this.position;r>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(r-1))===-1;)if(r-=1,this.position-r>t/2-1){i=" ... ",r+=5;break}for(o="",s=this.position;s<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s))===-1;)if(s+=1,s-this.position>t/2-1){o=" ... ",s-=5;break}return a=this.buffer.slice(r,s),yt.repeat(" ",e)+i+a+o+`
`+yt.repeat(" ",e+this.position-r+i.length)+"^"};Mn.prototype.toString=function(e){var t,i="";return this.name&&(i+='in "'+this.name+'" '),i+="at line "+(this.line+1)+", column "+(this.column+1),e||(t=this.getSnippet(),t&&(i+=`:
`+t)),i};var Ds=Mn,_t=Le,Ns=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],Os=["scalar","sequence","mapping"];function Ps(n){var e={};return n!==null&&Object.keys(n).forEach(function(t){n[t].forEach(function(i){e[String(i)]=t})}),e}function Bs(n,e){if(e=e||{},Object.keys(e).forEach(function(t){if(Ns.indexOf(t)===-1)throw new _t('Unknown option "'+t+'" is met in definition of "'+n+'" YAML type.')}),this.tag=n,this.kind=e.kind||null,this.resolve=e.resolve||function(){return!0},this.construct=e.construct||function(t){return t},this.instanceOf=e.instanceOf||null,this.predicate=e.predicate||null,this.represent=e.represent||null,this.defaultStyle=e.defaultStyle||null,this.styleAliases=Ps(e.styleAliases||null),Os.indexOf(this.kind)===-1)throw new _t('Unknown kind "'+this.kind+'" is specified for "'+n+'" YAML type.')}var H=Bs,bt=Y,Ke=Le,Us=H;function vn(n,e,t){var i=[];return n.include.forEach(function(r){t=vn(r,e,t)}),n[e].forEach(function(r){t.forEach(function(o,s){o.tag===r.tag&&o.kind===r.kind&&i.push(s)}),t.push(r)}),t.filter(function(r,o){return i.indexOf(o)===-1})}function Hs(){var n={scalar:{},sequence:{},mapping:{},fallback:{}},e,t;function i(r){n[r.kind][r.tag]=n.fallback[r.tag]=r}for(e=0,t=arguments.length;e<t;e+=1)arguments[e].forEach(i);return n}function fe(n){this.include=n.include||[],this.implicit=n.implicit||[],this.explicit=n.explicit||[],this.implicit.forEach(function(e){if(e.loadKind&&e.loadKind!=="scalar")throw new Ke("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=vn(this,"implicit",[]),this.compiledExplicit=vn(this,"explicit",[]),this.compiledTypeMap=Hs(this.compiledImplicit,this.compiledExplicit)}fe.DEFAULT=null;fe.create=function(){var e,t;switch(arguments.length){case 1:e=fe.DEFAULT,t=arguments[0];break;case 2:e=arguments[0],t=arguments[1];break;default:throw new Ke("Wrong number of arguments for Schema.create function")}if(e=bt.toArray(e),t=bt.toArray(t),!e.every(function(i){return i instanceof fe}))throw new Ke("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(i){return i instanceof Us}))throw new Ke("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new fe({include:e,explicit:t})};var ve=fe,$s=H,Gs=new $s("tag:yaml.org,2002:str",{kind:"scalar",construct:function(n){return n!==null?n:""}}),Ws=H,js=new Ws("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(n){return n!==null?n:[]}}),Ks=H,qs=new Ks("tag:yaml.org,2002:map",{kind:"mapping",construct:function(n){return n!==null?n:{}}}),Ys=ve,Sn=new Ys({explicit:[Gs,js,qs]}),Vs=H;function zs(n){if(n===null)return!0;var e=n.length;return e===1&&n==="~"||e===4&&(n==="null"||n==="Null"||n==="NULL")}function Qs(){return null}function Xs(n){return n===null}var Js=new Vs("tag:yaml.org,2002:null",{kind:"scalar",resolve:zs,construct:Qs,predicate:Xs,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Zs=H;function ea(n){if(n===null)return!1;var e=n.length;return e===4&&(n==="true"||n==="True"||n==="TRUE")||e===5&&(n==="false"||n==="False"||n==="FALSE")}function na(n){return n==="true"||n==="True"||n==="TRUE"}function ta(n){return Object.prototype.toString.call(n)==="[object Boolean]"}var ia=new Zs("tag:yaml.org,2002:bool",{kind:"scalar",resolve:ea,construct:na,predicate:ta,represent:{lowercase:function(n){return n?"true":"false"},uppercase:function(n){return n?"TRUE":"FALSE"},camelcase:function(n){return n?"True":"False"}},defaultStyle:"lowercase"}),ra=Y,oa=H;function sa(n){return 48<=n&&n<=57||65<=n&&n<=70||97<=n&&n<=102}function aa(n){return 48<=n&&n<=55}function la(n){return 48<=n&&n<=57}function ca(n){if(n===null)return!1;var e=n.length,t=0,i=!1,r;if(!e)return!1;if(r=n[t],(r==="-"||r==="+")&&(r=n[++t]),r==="0"){if(t+1===e)return!0;if(r=n[++t],r==="b"){for(t++;t<e;t++)if(r=n[t],r!=="_"){if(r!=="0"&&r!=="1")return!1;i=!0}return i&&r!=="_"}if(r==="x"){for(t++;t<e;t++)if(r=n[t],r!=="_"){if(!sa(n.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}for(;t<e;t++)if(r=n[t],r!=="_"){if(!aa(n.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}if(r==="_")return!1;for(;t<e;t++)if(r=n[t],r!=="_"){if(r===":")break;if(!la(n.charCodeAt(t)))return!1;i=!0}return!i||r==="_"?!1:r!==":"?!0:/^(:[0-5]?[0-9])+$/.test(n.slice(t))}function da(n){var e=n,t=1,i,r,o=[];return e.indexOf("_")!==-1&&(e=e.replace(/_/g,"")),i=e[0],(i==="-"||i==="+")&&(i==="-"&&(t=-1),e=e.slice(1),i=e[0]),e==="0"?0:i==="0"?e[1]==="b"?t*parseInt(e.slice(2),2):e[1]==="x"?t*parseInt(e,16):t*parseInt(e,8):e.indexOf(":")!==-1?(e.split(":").forEach(function(s){o.unshift(parseInt(s,10))}),e=0,r=1,o.forEach(function(s){e+=s*r,r*=60}),t*e):t*parseInt(e,10)}function ha(n){return Object.prototype.toString.call(n)==="[object Number]"&&n%1===0&&!ra.isNegativeZero(n)}var ua=new oa("tag:yaml.org,2002:int",{kind:"scalar",resolve:ca,construct:da,predicate:ha,represent:{binary:function(n){return n>=0?"0b"+n.toString(2):"-0b"+n.toString(2).slice(1)},octal:function(n){return n>=0?"0"+n.toString(8):"-0"+n.toString(8).slice(1)},decimal:function(n){return n.toString(10)},hexadecimal:function(n){return n>=0?"0x"+n.toString(16).toUpperCase():"-0x"+n.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),$t=Y,pa=H,ma=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function fa(n){return!(n===null||!ma.test(n)||n[n.length-1]==="_")}function ga(n){var e,t,i,r;return e=n.replace(/_/g,"").toLowerCase(),t=e[0]==="-"?-1:1,r=[],"+-".indexOf(e[0])>=0&&(e=e.slice(1)),e===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:e===".nan"?NaN:e.indexOf(":")>=0?(e.split(":").forEach(function(o){r.unshift(parseFloat(o,10))}),e=0,i=1,r.forEach(function(o){e+=o*i,i*=60}),t*e):t*parseFloat(e,10)}var ya=/^[-+]?[0-9]+e/;function _a(n,e){var t;if(isNaN(n))switch(e){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===n)switch(e){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===n)switch(e){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if($t.isNegativeZero(n))return"-0.0";return t=n.toString(10),ya.test(t)?t.replace("e",".e"):t}function ba(n){return Object.prototype.toString.call(n)==="[object Number]"&&(n%1!==0||$t.isNegativeZero(n))}var va=new pa("tag:yaml.org,2002:float",{kind:"scalar",resolve:fa,construct:ga,predicate:ba,represent:_a,defaultStyle:"lowercase"}),wa=ve,Gt=new wa({include:[Sn],implicit:[Js,ia,ua,va]}),ka=ve,Wt=new ka({include:[Gt]}),xa=H,jt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Kt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Ca(n){return n===null?!1:jt.exec(n)!==null||Kt.exec(n)!==null}function Ta(n){var e,t,i,r,o,s,a,l=0,c=null,d,h,p;if(e=jt.exec(n),e===null&&(e=Kt.exec(n)),e===null)throw new Error("Date resolve error");if(t=+e[1],i=+e[2]-1,r=+e[3],!e[4])return new Date(Date.UTC(t,i,r));if(o=+e[4],s=+e[5],a=+e[6],e[7]){for(l=e[7].slice(0,3);l.length<3;)l+="0";l=+l}return e[9]&&(d=+e[10],h=+(e[11]||0),c=(d*60+h)*6e4,e[9]==="-"&&(c=-c)),p=new Date(Date.UTC(t,i,r,o,s,a,l)),c&&p.setTime(p.getTime()-c),p}function Ia(n){return n.toISOString()}var Ma=new xa("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Ca,construct:Ta,instanceOf:Date,represent:Ia}),Sa=H;function Aa(n){return n==="<<"||n===null}var Ea=new Sa("tag:yaml.org,2002:merge",{kind:"scalar",resolve:Aa});function qt(n){throw new Error('Could not dynamically require "'+n+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var oe;try{var Ra=qt;oe=Ra("buffer").Buffer}catch{}var La=H,An=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Fa(n){if(n===null)return!1;var e,t,i=0,r=n.length,o=An;for(t=0;t<r;t++)if(e=o.indexOf(n.charAt(t)),!(e>64)){if(e<0)return!1;i+=6}return i%8===0}function Da(n){var e,t,i=n.replace(/[\r\n=]/g,""),r=i.length,o=An,s=0,a=[];for(e=0;e<r;e++)e%4===0&&e&&(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)),s=s<<6|o.indexOf(i.charAt(e));return t=r%4*6,t===0?(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)):t===18?(a.push(s>>10&255),a.push(s>>2&255)):t===12&&a.push(s>>4&255),oe?oe.from?oe.from(a):new oe(a):a}function Na(n){var e="",t=0,i,r,o=n.length,s=An;for(i=0;i<o;i++)i%3===0&&i&&(e+=s[t>>18&63],e+=s[t>>12&63],e+=s[t>>6&63],e+=s[t&63]),t=(t<<8)+n[i];return r=o%3,r===0?(e+=s[t>>18&63],e+=s[t>>12&63],e+=s[t>>6&63],e+=s[t&63]):r===2?(e+=s[t>>10&63],e+=s[t>>4&63],e+=s[t<<2&63],e+=s[64]):r===1&&(e+=s[t>>2&63],e+=s[t<<4&63],e+=s[64],e+=s[64]),e}function Oa(n){return oe&&oe.isBuffer(n)}var Pa=new La("tag:yaml.org,2002:binary",{kind:"scalar",resolve:Fa,construct:Da,predicate:Oa,represent:Na}),Ba=H,Ua=Object.prototype.hasOwnProperty,Ha=Object.prototype.toString;function $a(n){if(n===null)return!0;var e=[],t,i,r,o,s,a=n;for(t=0,i=a.length;t<i;t+=1){if(r=a[t],s=!1,Ha.call(r)!=="[object Object]")return!1;for(o in r)if(Ua.call(r,o))if(!s)s=!0;else return!1;if(!s)return!1;if(e.indexOf(o)===-1)e.push(o);else return!1}return!0}function Ga(n){return n!==null?n:[]}var Wa=new Ba("tag:yaml.org,2002:omap",{kind:"sequence",resolve:$a,construct:Ga}),ja=H,Ka=Object.prototype.toString;function qa(n){if(n===null)return!0;var e,t,i,r,o,s=n;for(o=new Array(s.length),e=0,t=s.length;e<t;e+=1){if(i=s[e],Ka.call(i)!=="[object Object]"||(r=Object.keys(i),r.length!==1))return!1;o[e]=[r[0],i[r[0]]]}return!0}function Ya(n){if(n===null)return[];var e,t,i,r,o,s=n;for(o=new Array(s.length),e=0,t=s.length;e<t;e+=1)i=s[e],r=Object.keys(i),o[e]=[r[0],i[r[0]]];return o}var Va=new ja("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:qa,construct:Ya}),za=H,Qa=Object.prototype.hasOwnProperty;function Xa(n){if(n===null)return!0;var e,t=n;for(e in t)if(Qa.call(t,e)&&t[e]!==null)return!1;return!0}function Ja(n){return n!==null?n:{}}var Za=new za("tag:yaml.org,2002:set",{kind:"mapping",resolve:Xa,construct:Ja}),el=ve,Fe=new el({include:[Wt],implicit:[Ma,Ea],explicit:[Pa,Wa,Va,Za]}),nl=H;function tl(){return!0}function il(){}function rl(){return""}function ol(n){return typeof n>"u"}var sl=new nl("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:tl,construct:il,predicate:ol,represent:rl}),al=H;function ll(n){if(n===null||n.length===0)return!1;var e=n,t=/\/([gim]*)$/.exec(n),i="";return!(e[0]==="/"&&(t&&(i=t[1]),i.length>3||e[e.length-i.length-1]!=="/"))}function cl(n){var e=n,t=/\/([gim]*)$/.exec(n),i="";return e[0]==="/"&&(t&&(i=t[1]),e=e.slice(1,e.length-i.length-1)),new RegExp(e,i)}function dl(n){var e="/"+n.source+"/";return n.global&&(e+="g"),n.multiline&&(e+="m"),n.ignoreCase&&(e+="i"),e}function hl(n){return Object.prototype.toString.call(n)==="[object RegExp]"}var ul=new al("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:ll,construct:cl,predicate:hl,represent:dl}),Ve;try{var pl=qt;Ve=pl("esprima")}catch{typeof window<"u"&&(Ve=window.esprima)}var ml=H;function fl(n){if(n===null)return!1;try{var e="("+n+")",t=Ve.parse(e,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function gl(n){var e="("+n+")",t=Ve.parse(e,{range:!0}),i=[],r;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(o){i.push(o.name)}),r=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(i,e.slice(r[0]+1,r[1]-1)):new Function(i,"return "+e.slice(r[0],r[1]))}function yl(n){return n.toString()}function _l(n){return Object.prototype.toString.call(n)==="[object Function]"}var bl=new ml("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:fl,construct:gl,predicate:_l,represent:yl}),vt=ve,Ze=vt.DEFAULT=new vt({include:[Fe],explicit:[sl,ul,bl]}),J=Y,Yt=Le,vl=Ds,Vt=Fe,wl=Ze,ne=Object.prototype.hasOwnProperty,ze=1,zt=2,Qt=3,Qe=4,mn=1,kl=2,wt=3,xl=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Cl=/[\x85\u2028\u2029]/,Tl=/[,\[\]\{\}]/,Xt=/^(?:!|!!|![a-z\-]+!)$/i,Jt=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function kt(n){return Object.prototype.toString.call(n)}function z(n){return n===10||n===13}function se(n){return n===9||n===32}function q(n){return n===9||n===32||n===10||n===13}function ge(n){return n===44||n===91||n===93||n===123||n===125}function Il(n){var e;return 48<=n&&n<=57?n-48:(e=n|32,97<=e&&e<=102?e-97+10:-1)}function Ml(n){return n===120?2:n===117?4:n===85?8:0}function Sl(n){return 48<=n&&n<=57?n-48:-1}function xt(n){return n===48?"\0":n===97?"\x07":n===98?"\b":n===116||n===9?"	":n===110?`
`:n===118?"\v":n===102?"\f":n===114?"\r":n===101?"\x1B":n===32?" ":n===34?'"':n===47?"/":n===92?"\\":n===78?"":n===95?" ":n===76?"\u2028":n===80?"\u2029":""}function Al(n){return n<=65535?String.fromCharCode(n):String.fromCharCode((n-65536>>10)+55296,(n-65536&1023)+56320)}function Zt(n,e,t){e==="__proto__"?Object.defineProperty(n,e,{configurable:!0,enumerable:!0,writable:!0,value:t}):n[e]=t}var ei=new Array(256),ni=new Array(256);for(var ue=0;ue<256;ue++)ei[ue]=xt(ue)?1:0,ni[ue]=xt(ue);function El(n,e){this.input=n,this.filename=e.filename||null,this.schema=e.schema||wl,this.onWarning=e.onWarning||null,this.legacy=e.legacy||!1,this.json=e.json||!1,this.listener=e.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=n.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function ti(n,e){return new Yt(e,new vl(n.filename,n.input,n.position,n.line,n.position-n.lineStart))}function T(n,e){throw ti(n,e)}function Xe(n,e){n.onWarning&&n.onWarning.call(null,ti(n,e))}var Ct={YAML:function(e,t,i){var r,o,s;e.version!==null&&T(e,"duplication of %YAML directive"),i.length!==1&&T(e,"YAML directive accepts exactly one argument"),r=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),r===null&&T(e,"ill-formed argument of the YAML directive"),o=parseInt(r[1],10),s=parseInt(r[2],10),o!==1&&T(e,"unacceptable YAML version of the document"),e.version=i[0],e.checkLineBreaks=s<2,s!==1&&s!==2&&Xe(e,"unsupported YAML version of the document")},TAG:function(e,t,i){var r,o;i.length!==2&&T(e,"TAG directive accepts exactly two arguments"),r=i[0],o=i[1],Xt.test(r)||T(e,"ill-formed tag handle (first argument) of the TAG directive"),ne.call(e.tagMap,r)&&T(e,'there is a previously declared suffix for "'+r+'" tag handle'),Jt.test(o)||T(e,"ill-formed tag prefix (second argument) of the TAG directive"),e.tagMap[r]=o}};function ee(n,e,t,i){var r,o,s,a;if(e<t){if(a=n.input.slice(e,t),i)for(r=0,o=a.length;r<o;r+=1)s=a.charCodeAt(r),s===9||32<=s&&s<=1114111||T(n,"expected valid JSON character");else xl.test(a)&&T(n,"the stream contains non-printable characters");n.result+=a}}function Tt(n,e,t,i){var r,o,s,a;for(J.isObject(t)||T(n,"cannot merge mappings; the provided source object is unacceptable"),r=Object.keys(t),s=0,a=r.length;s<a;s+=1)o=r[s],ne.call(e,o)||(Zt(e,o,t[o]),i[o]=!0)}function ye(n,e,t,i,r,o,s,a){var l,c;if(Array.isArray(r))for(r=Array.prototype.slice.call(r),l=0,c=r.length;l<c;l+=1)Array.isArray(r[l])&&T(n,"nested arrays are not supported inside keys"),typeof r=="object"&&kt(r[l])==="[object Object]"&&(r[l]="[object Object]");if(typeof r=="object"&&kt(r)==="[object Object]"&&(r="[object Object]"),r=String(r),e===null&&(e={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)Tt(n,e,o[l],t);else Tt(n,e,o,t);else!n.json&&!ne.call(t,r)&&ne.call(e,r)&&(n.line=s||n.line,n.position=a||n.position,T(n,"duplicated mapping key")),Zt(e,r,o),delete t[r];return e}function En(n){var e;e=n.input.charCodeAt(n.position),e===10?n.position++:e===13?(n.position++,n.input.charCodeAt(n.position)===10&&n.position++):T(n,"a line break is expected"),n.line+=1,n.lineStart=n.position}function U(n,e,t){for(var i=0,r=n.input.charCodeAt(n.position);r!==0;){for(;se(r);)r=n.input.charCodeAt(++n.position);if(e&&r===35)do r=n.input.charCodeAt(++n.position);while(r!==10&&r!==13&&r!==0);if(z(r))for(En(n),r=n.input.charCodeAt(n.position),i++,n.lineIndent=0;r===32;)n.lineIndent++,r=n.input.charCodeAt(++n.position);else break}return t!==-1&&i!==0&&n.lineIndent<t&&Xe(n,"deficient indentation"),i}function en(n){var e=n.position,t;return t=n.input.charCodeAt(e),!!((t===45||t===46)&&t===n.input.charCodeAt(e+1)&&t===n.input.charCodeAt(e+2)&&(e+=3,t=n.input.charCodeAt(e),t===0||q(t)))}function Rn(n,e){e===1?n.result+=" ":e>1&&(n.result+=J.repeat(`
`,e-1))}function Rl(n,e,t){var i,r,o,s,a,l,c,d,h=n.kind,p=n.result,u;if(u=n.input.charCodeAt(n.position),q(u)||ge(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(r=n.input.charCodeAt(n.position+1),q(r)||t&&ge(r)))return!1;for(n.kind="scalar",n.result="",o=s=n.position,a=!1;u!==0;){if(u===58){if(r=n.input.charCodeAt(n.position+1),q(r)||t&&ge(r))break}else if(u===35){if(i=n.input.charCodeAt(n.position-1),q(i))break}else{if(n.position===n.lineStart&&en(n)||t&&ge(u))break;if(z(u))if(l=n.line,c=n.lineStart,d=n.lineIndent,U(n,!1,-1),n.lineIndent>=e){a=!0,u=n.input.charCodeAt(n.position);continue}else{n.position=s,n.line=l,n.lineStart=c,n.lineIndent=d;break}}a&&(ee(n,o,s,!1),Rn(n,n.line-l),o=s=n.position,a=!1),se(u)||(s=n.position+1),u=n.input.charCodeAt(++n.position)}return ee(n,o,s,!1),n.result?!0:(n.kind=h,n.result=p,!1)}function Ll(n,e){var t,i,r;if(t=n.input.charCodeAt(n.position),t!==39)return!1;for(n.kind="scalar",n.result="",n.position++,i=r=n.position;(t=n.input.charCodeAt(n.position))!==0;)if(t===39)if(ee(n,i,n.position,!0),t=n.input.charCodeAt(++n.position),t===39)i=n.position,n.position++,r=n.position;else return!0;else z(t)?(ee(n,i,r,!0),Rn(n,U(n,!1,e)),i=r=n.position):n.position===n.lineStart&&en(n)?T(n,"unexpected end of the document within a single quoted scalar"):(n.position++,r=n.position);T(n,"unexpected end of the stream within a single quoted scalar")}function Fl(n,e){var t,i,r,o,s,a;if(a=n.input.charCodeAt(n.position),a!==34)return!1;for(n.kind="scalar",n.result="",n.position++,t=i=n.position;(a=n.input.charCodeAt(n.position))!==0;){if(a===34)return ee(n,t,n.position,!0),n.position++,!0;if(a===92){if(ee(n,t,n.position,!0),a=n.input.charCodeAt(++n.position),z(a))U(n,!1,e);else if(a<256&&ei[a])n.result+=ni[a],n.position++;else if((s=Ml(a))>0){for(r=s,o=0;r>0;r--)a=n.input.charCodeAt(++n.position),(s=Il(a))>=0?o=(o<<4)+s:T(n,"expected hexadecimal character");n.result+=Al(o),n.position++}else T(n,"unknown escape sequence");t=i=n.position}else z(a)?(ee(n,t,i,!0),Rn(n,U(n,!1,e)),t=i=n.position):n.position===n.lineStart&&en(n)?T(n,"unexpected end of the document within a double quoted scalar"):(n.position++,i=n.position)}T(n,"unexpected end of the stream within a double quoted scalar")}function Dl(n,e){var t=!0,i,r=n.tag,o,s=n.anchor,a,l,c,d,h,p={},u,m,g,y;if(y=n.input.charCodeAt(n.position),y===91)l=93,h=!1,o=[];else if(y===123)l=125,h=!0,o={};else return!1;for(n.anchor!==null&&(n.anchorMap[n.anchor]=o),y=n.input.charCodeAt(++n.position);y!==0;){if(U(n,!0,e),y=n.input.charCodeAt(n.position),y===l)return n.position++,n.tag=r,n.anchor=s,n.kind=h?"mapping":"sequence",n.result=o,!0;t||T(n,"missed comma between flow collection entries"),m=u=g=null,c=d=!1,y===63&&(a=n.input.charCodeAt(n.position+1),q(a)&&(c=d=!0,n.position++,U(n,!0,e))),i=n.line,_e(n,e,ze,!1,!0),m=n.tag,u=n.result,U(n,!0,e),y=n.input.charCodeAt(n.position),(d||n.line===i)&&y===58&&(c=!0,y=n.input.charCodeAt(++n.position),U(n,!0,e),_e(n,e,ze,!1,!0),g=n.result),h?ye(n,o,p,m,u,g):c?o.push(ye(n,null,p,m,u,g)):o.push(u),U(n,!0,e),y=n.input.charCodeAt(n.position),y===44?(t=!0,y=n.input.charCodeAt(++n.position)):t=!1}T(n,"unexpected end of the stream within a flow collection")}function Nl(n,e){var t,i,r=mn,o=!1,s=!1,a=e,l=0,c=!1,d,h;if(h=n.input.charCodeAt(n.position),h===124)i=!1;else if(h===62)i=!0;else return!1;for(n.kind="scalar",n.result="";h!==0;)if(h=n.input.charCodeAt(++n.position),h===43||h===45)mn===r?r=h===43?wt:kl:T(n,"repeat of a chomping mode identifier");else if((d=Sl(h))>=0)d===0?T(n,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?T(n,"repeat of an indentation width identifier"):(a=e+d-1,s=!0);else break;if(se(h)){do h=n.input.charCodeAt(++n.position);while(se(h));if(h===35)do h=n.input.charCodeAt(++n.position);while(!z(h)&&h!==0)}for(;h!==0;){for(En(n),n.lineIndent=0,h=n.input.charCodeAt(n.position);(!s||n.lineIndent<a)&&h===32;)n.lineIndent++,h=n.input.charCodeAt(++n.position);if(!s&&n.lineIndent>a&&(a=n.lineIndent),z(h)){l++;continue}if(n.lineIndent<a){r===wt?n.result+=J.repeat(`
`,o?1+l:l):r===mn&&o&&(n.result+=`
`);break}for(i?se(h)?(c=!0,n.result+=J.repeat(`
`,o?1+l:l)):c?(c=!1,n.result+=J.repeat(`
`,l+1)):l===0?o&&(n.result+=" "):n.result+=J.repeat(`
`,l):n.result+=J.repeat(`
`,o?1+l:l),o=!0,s=!0,l=0,t=n.position;!z(h)&&h!==0;)h=n.input.charCodeAt(++n.position);ee(n,t,n.position,!1)}return!0}function It(n,e){var t,i=n.tag,r=n.anchor,o=[],s,a=!1,l;for(n.anchor!==null&&(n.anchorMap[n.anchor]=o),l=n.input.charCodeAt(n.position);l!==0&&!(l!==45||(s=n.input.charCodeAt(n.position+1),!q(s)));){if(a=!0,n.position++,U(n,!0,-1)&&n.lineIndent<=e){o.push(null),l=n.input.charCodeAt(n.position);continue}if(t=n.line,_e(n,e,Qt,!1,!0),o.push(n.result),U(n,!0,-1),l=n.input.charCodeAt(n.position),(n.line===t||n.lineIndent>e)&&l!==0)T(n,"bad indentation of a sequence entry");else if(n.lineIndent<e)break}return a?(n.tag=i,n.anchor=r,n.kind="sequence",n.result=o,!0):!1}function Ol(n,e,t){var i,r,o,s,a=n.tag,l=n.anchor,c={},d={},h=null,p=null,u=null,m=!1,g=!1,y;for(n.anchor!==null&&(n.anchorMap[n.anchor]=c),y=n.input.charCodeAt(n.position);y!==0;){if(i=n.input.charCodeAt(n.position+1),o=n.line,s=n.position,(y===63||y===58)&&q(i))y===63?(m&&(ye(n,c,d,h,p,null),h=p=u=null),g=!0,m=!0,r=!0):m?(m=!1,r=!0):T(n,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),n.position+=1,y=i;else if(_e(n,t,zt,!1,!0))if(n.line===o){for(y=n.input.charCodeAt(n.position);se(y);)y=n.input.charCodeAt(++n.position);if(y===58)y=n.input.charCodeAt(++n.position),q(y)||T(n,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(ye(n,c,d,h,p,null),h=p=u=null),g=!0,m=!1,r=!1,h=n.tag,p=n.result;else if(g)T(n,"can not read an implicit mapping pair; a colon is missed");else return n.tag=a,n.anchor=l,!0}else if(g)T(n,"can not read a block mapping entry; a multiline key may not be an implicit key");else return n.tag=a,n.anchor=l,!0;else break;if((n.line===o||n.lineIndent>e)&&(_e(n,e,Qe,!0,r)&&(m?p=n.result:u=n.result),m||(ye(n,c,d,h,p,u,o,s),h=p=u=null),U(n,!0,-1),y=n.input.charCodeAt(n.position)),n.lineIndent>e&&y!==0)T(n,"bad indentation of a mapping entry");else if(n.lineIndent<e)break}return m&&ye(n,c,d,h,p,null),g&&(n.tag=a,n.anchor=l,n.kind="mapping",n.result=c),g}function Pl(n){var e,t=!1,i=!1,r,o,s;if(s=n.input.charCodeAt(n.position),s!==33)return!1;if(n.tag!==null&&T(n,"duplication of a tag property"),s=n.input.charCodeAt(++n.position),s===60?(t=!0,s=n.input.charCodeAt(++n.position)):s===33?(i=!0,r="!!",s=n.input.charCodeAt(++n.position)):r="!",e=n.position,t){do s=n.input.charCodeAt(++n.position);while(s!==0&&s!==62);n.position<n.length?(o=n.input.slice(e,n.position),s=n.input.charCodeAt(++n.position)):T(n,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!q(s);)s===33&&(i?T(n,"tag suffix cannot contain exclamation marks"):(r=n.input.slice(e-1,n.position+1),Xt.test(r)||T(n,"named tag handle cannot contain such characters"),i=!0,e=n.position+1)),s=n.input.charCodeAt(++n.position);o=n.input.slice(e,n.position),Tl.test(o)&&T(n,"tag suffix cannot contain flow indicator characters")}return o&&!Jt.test(o)&&T(n,"tag name cannot contain such characters: "+o),t?n.tag=o:ne.call(n.tagMap,r)?n.tag=n.tagMap[r]+o:r==="!"?n.tag="!"+o:r==="!!"?n.tag="tag:yaml.org,2002:"+o:T(n,'undeclared tag handle "'+r+'"'),!0}function Bl(n){var e,t;if(t=n.input.charCodeAt(n.position),t!==38)return!1;for(n.anchor!==null&&T(n,"duplication of an anchor property"),t=n.input.charCodeAt(++n.position),e=n.position;t!==0&&!q(t)&&!ge(t);)t=n.input.charCodeAt(++n.position);return n.position===e&&T(n,"name of an anchor node must contain at least one character"),n.anchor=n.input.slice(e,n.position),!0}function Ul(n){var e,t,i;if(i=n.input.charCodeAt(n.position),i!==42)return!1;for(i=n.input.charCodeAt(++n.position),e=n.position;i!==0&&!q(i)&&!ge(i);)i=n.input.charCodeAt(++n.position);return n.position===e&&T(n,"name of an alias node must contain at least one character"),t=n.input.slice(e,n.position),ne.call(n.anchorMap,t)||T(n,'unidentified alias "'+t+'"'),n.result=n.anchorMap[t],U(n,!0,-1),!0}function _e(n,e,t,i,r){var o,s,a,l=1,c=!1,d=!1,h,p,u,m,g;if(n.listener!==null&&n.listener("open",n),n.tag=null,n.anchor=null,n.kind=null,n.result=null,o=s=a=Qe===t||Qt===t,i&&U(n,!0,-1)&&(c=!0,n.lineIndent>e?l=1:n.lineIndent===e?l=0:n.lineIndent<e&&(l=-1)),l===1)for(;Pl(n)||Bl(n);)U(n,!0,-1)?(c=!0,a=o,n.lineIndent>e?l=1:n.lineIndent===e?l=0:n.lineIndent<e&&(l=-1)):a=!1;if(a&&(a=c||r),(l===1||Qe===t)&&(ze===t||zt===t?m=e:m=e+1,g=n.position-n.lineStart,l===1?a&&(It(n,g)||Ol(n,g,m))||Dl(n,m)?d=!0:(s&&Nl(n,m)||Ll(n,m)||Fl(n,m)?d=!0:Ul(n)?(d=!0,(n.tag!==null||n.anchor!==null)&&T(n,"alias node should not have any properties")):Rl(n,m,ze===t)&&(d=!0,n.tag===null&&(n.tag="?")),n.anchor!==null&&(n.anchorMap[n.anchor]=n.result)):l===0&&(d=a&&It(n,g))),n.tag!==null&&n.tag!=="!")if(n.tag==="?"){for(n.result!==null&&n.kind!=="scalar"&&T(n,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+n.kind+'"'),h=0,p=n.implicitTypes.length;h<p;h+=1)if(u=n.implicitTypes[h],u.resolve(n.result)){n.result=u.construct(n.result),n.tag=u.tag,n.anchor!==null&&(n.anchorMap[n.anchor]=n.result);break}}else ne.call(n.typeMap[n.kind||"fallback"],n.tag)?(u=n.typeMap[n.kind||"fallback"][n.tag],n.result!==null&&u.kind!==n.kind&&T(n,"unacceptable node kind for !<"+n.tag+'> tag; it should be "'+u.kind+'", not "'+n.kind+'"'),u.resolve(n.result)?(n.result=u.construct(n.result),n.anchor!==null&&(n.anchorMap[n.anchor]=n.result)):T(n,"cannot resolve a node with !<"+n.tag+"> explicit tag")):T(n,"unknown tag !<"+n.tag+">");return n.listener!==null&&n.listener("close",n),n.tag!==null||n.anchor!==null||d}function Hl(n){var e=n.position,t,i,r,o=!1,s;for(n.version=null,n.checkLineBreaks=n.legacy,n.tagMap={},n.anchorMap={};(s=n.input.charCodeAt(n.position))!==0&&(U(n,!0,-1),s=n.input.charCodeAt(n.position),!(n.lineIndent>0||s!==37));){for(o=!0,s=n.input.charCodeAt(++n.position),t=n.position;s!==0&&!q(s);)s=n.input.charCodeAt(++n.position);for(i=n.input.slice(t,n.position),r=[],i.length<1&&T(n,"directive name must not be less than one character in length");s!==0;){for(;se(s);)s=n.input.charCodeAt(++n.position);if(s===35){do s=n.input.charCodeAt(++n.position);while(s!==0&&!z(s));break}if(z(s))break;for(t=n.position;s!==0&&!q(s);)s=n.input.charCodeAt(++n.position);r.push(n.input.slice(t,n.position))}s!==0&&En(n),ne.call(Ct,i)?Ct[i](n,i,r):Xe(n,'unknown document directive "'+i+'"')}if(U(n,!0,-1),n.lineIndent===0&&n.input.charCodeAt(n.position)===45&&n.input.charCodeAt(n.position+1)===45&&n.input.charCodeAt(n.position+2)===45?(n.position+=3,U(n,!0,-1)):o&&T(n,"directives end mark is expected"),_e(n,n.lineIndent-1,Qe,!1,!0),U(n,!0,-1),n.checkLineBreaks&&Cl.test(n.input.slice(e,n.position))&&Xe(n,"non-ASCII line breaks are interpreted as content"),n.documents.push(n.result),n.position===n.lineStart&&en(n)){n.input.charCodeAt(n.position)===46&&(n.position+=3,U(n,!0,-1));return}if(n.position<n.length-1)T(n,"end of the stream or a document separator is expected");else return}function ii(n,e){n=String(n),e=e||{},n.length!==0&&(n.charCodeAt(n.length-1)!==10&&n.charCodeAt(n.length-1)!==13&&(n+=`
`),n.charCodeAt(0)===65279&&(n=n.slice(1)));var t=new El(n,e),i=n.indexOf("\0");for(i!==-1&&(t.position=i,T(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)Hl(t);return t.documents}function ri(n,e,t){e!==null&&typeof e=="object"&&typeof t>"u"&&(t=e,e=null);var i=ii(n,t);if(typeof e!="function")return i;for(var r=0,o=i.length;r<o;r+=1)e(i[r])}function oi(n,e){var t=ii(n,e);if(t.length!==0){if(t.length===1)return t[0];throw new Yt("expected a single document in the stream, but found more")}}function $l(n,e,t){return typeof e=="object"&&e!==null&&typeof t>"u"&&(t=e,e=null),ri(n,e,J.extend({schema:Vt},t))}function Gl(n,e){return oi(n,J.extend({schema:Vt},e))}Re.loadAll=ri;Re.load=oi;Re.safeLoadAll=$l;Re.safeLoad=Gl;var Ln={},De=Y,Ne=Le,Wl=Ze,jl=Fe,si=Object.prototype.toString,ai=Object.prototype.hasOwnProperty,Kl=9,Ee=10,ql=13,Yl=32,Vl=33,zl=34,li=35,Ql=37,Xl=38,Jl=39,Zl=42,ci=44,ec=45,di=58,nc=61,tc=62,ic=63,rc=64,hi=91,ui=93,oc=96,pi=123,sc=124,mi=125,G={};G[0]="\\0";G[7]="\\a";G[8]="\\b";G[9]="\\t";G[10]="\\n";G[11]="\\v";G[12]="\\f";G[13]="\\r";G[27]="\\e";G[34]='\\"';G[92]="\\\\";G[133]="\\N";G[160]="\\_";G[8232]="\\L";G[8233]="\\P";var ac=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function lc(n,e){var t,i,r,o,s,a,l;if(e===null)return{};for(t={},i=Object.keys(e),r=0,o=i.length;r<o;r+=1)s=i[r],a=String(e[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),l=n.compiledTypeMap.fallback[s],l&&ai.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[s]=a;return t}function Mt(n){var e,t,i;if(e=n.toString(16).toUpperCase(),n<=255)t="x",i=2;else if(n<=65535)t="u",i=4;else if(n<=4294967295)t="U",i=8;else throw new Ne("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+De.repeat("0",i-e.length)+e}function cc(n){this.schema=n.schema||Wl,this.indent=Math.max(1,n.indent||2),this.noArrayIndent=n.noArrayIndent||!1,this.skipInvalid=n.skipInvalid||!1,this.flowLevel=De.isNothing(n.flowLevel)?-1:n.flowLevel,this.styleMap=lc(this.schema,n.styles||null),this.sortKeys=n.sortKeys||!1,this.lineWidth=n.lineWidth||80,this.noRefs=n.noRefs||!1,this.noCompatMode=n.noCompatMode||!1,this.condenseFlow=n.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function St(n,e){for(var t=De.repeat(" ",e),i=0,r=-1,o="",s,a=n.length;i<a;)r=n.indexOf(`
`,i),r===-1?(s=n.slice(i),i=a):(s=n.slice(i,r+1),i=r+1),s.length&&s!==`
`&&(o+=t),o+=s;return o}function wn(n,e){return`
`+De.repeat(" ",n.indent*e)}function dc(n,e){var t,i,r;for(t=0,i=n.implicitTypes.length;t<i;t+=1)if(r=n.implicitTypes[t],r.resolve(e))return!0;return!1}function Fn(n){return n===Yl||n===Kl}function be(n){return 32<=n&&n<=126||161<=n&&n<=55295&&n!==8232&&n!==8233||57344<=n&&n<=65533&&n!==65279||65536<=n&&n<=1114111}function hc(n){return be(n)&&!Fn(n)&&n!==65279&&n!==ql&&n!==Ee}function At(n,e){return be(n)&&n!==65279&&n!==ci&&n!==hi&&n!==ui&&n!==pi&&n!==mi&&n!==di&&(n!==li||e&&hc(e))}function uc(n){return be(n)&&n!==65279&&!Fn(n)&&n!==ec&&n!==ic&&n!==di&&n!==ci&&n!==hi&&n!==ui&&n!==pi&&n!==mi&&n!==li&&n!==Xl&&n!==Zl&&n!==Vl&&n!==sc&&n!==nc&&n!==tc&&n!==Jl&&n!==zl&&n!==Ql&&n!==rc&&n!==oc}function fi(n){var e=/^\n* /;return e.test(n)}var gi=1,yi=2,_i=3,bi=4,qe=5;function pc(n,e,t,i,r){var o,s,a,l=!1,c=!1,d=i!==-1,h=-1,p=uc(n.charCodeAt(0))&&!Fn(n.charCodeAt(n.length-1));if(e)for(o=0;o<n.length;o++){if(s=n.charCodeAt(o),!be(s))return qe;a=o>0?n.charCodeAt(o-1):null,p=p&&At(s,a)}else{for(o=0;o<n.length;o++){if(s=n.charCodeAt(o),s===Ee)l=!0,d&&(c=c||o-h-1>i&&n[h+1]!==" ",h=o);else if(!be(s))return qe;a=o>0?n.charCodeAt(o-1):null,p=p&&At(s,a)}c=c||d&&o-h-1>i&&n[h+1]!==" "}return!l&&!c?p&&!r(n)?gi:yi:t>9&&fi(n)?qe:c?bi:_i}function mc(n,e,t,i){n.dump=function(){if(e.length===0)return"''";if(!n.noCompatMode&&ac.indexOf(e)!==-1)return"'"+e+"'";var r=n.indent*Math.max(1,t),o=n.lineWidth===-1?-1:Math.max(Math.min(n.lineWidth,40),n.lineWidth-r),s=i||n.flowLevel>-1&&t>=n.flowLevel;function a(l){return dc(n,l)}switch(pc(e,s,n.indent,o,a)){case gi:return e;case yi:return"'"+e.replace(/'/g,"''")+"'";case _i:return"|"+Et(e,n.indent)+Rt(St(e,r));case bi:return">"+Et(e,n.indent)+Rt(St(fc(e,o),r));case qe:return'"'+gc(e)+'"';default:throw new Ne("impossible error: invalid scalar style")}}()}function Et(n,e){var t=fi(n)?String(e):"",i=n[n.length-1]===`
`,r=i&&(n[n.length-2]===`
`||n===`
`),o=r?"+":i?"":"-";return t+o+`
`}function Rt(n){return n[n.length-1]===`
`?n.slice(0,-1):n}function fc(n,e){for(var t=/(\n+)([^\n]*)/g,i=function(){var c=n.indexOf(`
`);return c=c!==-1?c:n.length,t.lastIndex=c,Lt(n.slice(0,c),e)}(),r=n[0]===`
`||n[0]===" ",o,s;s=t.exec(n);){var a=s[1],l=s[2];o=l[0]===" ",i+=a+(!r&&!o&&l!==""?`
`:"")+Lt(l,e),r=o}return i}function Lt(n,e){if(n===""||n[0]===" ")return n;for(var t=/ [^ ]/g,i,r=0,o,s=0,a=0,l="";i=t.exec(n);)a=i.index,a-r>e&&(o=s>r?s:a,l+=`
`+n.slice(r,o),r=o+1),s=a;return l+=`
`,n.length-r>e&&s>r?l+=n.slice(r,s)+`
`+n.slice(s+1):l+=n.slice(r),l.slice(1)}function gc(n){for(var e="",t,i,r,o=0;o<n.length;o++){if(t=n.charCodeAt(o),t>=55296&&t<=56319&&(i=n.charCodeAt(o+1),i>=56320&&i<=57343)){e+=Mt((t-55296)*1024+i-56320+65536),o++;continue}r=G[t],e+=!r&&be(t)?n[o]:r||Mt(t)}return e}function yc(n,e,t){var i="",r=n.tag,o,s;for(o=0,s=t.length;o<s;o+=1)ce(n,e,t[o],!1,!1)&&(o!==0&&(i+=","+(n.condenseFlow?"":" ")),i+=n.dump);n.tag=r,n.dump="["+i+"]"}function _c(n,e,t,i){var r="",o=n.tag,s,a;for(s=0,a=t.length;s<a;s+=1)ce(n,e+1,t[s],!0,!0)&&((!i||s!==0)&&(r+=wn(n,e)),n.dump&&Ee===n.dump.charCodeAt(0)?r+="-":r+="- ",r+=n.dump);n.tag=o,n.dump=r||"[]"}function bc(n,e,t){var i="",r=n.tag,o=Object.keys(t),s,a,l,c,d;for(s=0,a=o.length;s<a;s+=1)d="",s!==0&&(d+=", "),n.condenseFlow&&(d+='"'),l=o[s],c=t[l],ce(n,e,l,!1,!1)&&(n.dump.length>1024&&(d+="? "),d+=n.dump+(n.condenseFlow?'"':"")+":"+(n.condenseFlow?"":" "),ce(n,e,c,!1,!1)&&(d+=n.dump,i+=d));n.tag=r,n.dump="{"+i+"}"}function vc(n,e,t,i){var r="",o=n.tag,s=Object.keys(t),a,l,c,d,h,p;if(n.sortKeys===!0)s.sort();else if(typeof n.sortKeys=="function")s.sort(n.sortKeys);else if(n.sortKeys)throw new Ne("sortKeys must be a boolean or a function");for(a=0,l=s.length;a<l;a+=1)p="",(!i||a!==0)&&(p+=wn(n,e)),c=s[a],d=t[c],ce(n,e+1,c,!0,!0,!0)&&(h=n.tag!==null&&n.tag!=="?"||n.dump&&n.dump.length>1024,h&&(n.dump&&Ee===n.dump.charCodeAt(0)?p+="?":p+="? "),p+=n.dump,h&&(p+=wn(n,e)),ce(n,e+1,d,!0,h)&&(n.dump&&Ee===n.dump.charCodeAt(0)?p+=":":p+=": ",p+=n.dump,r+=p));n.tag=o,n.dump=r||"{}"}function Ft(n,e,t){var i,r,o,s,a,l;for(r=t?n.explicitTypes:n.implicitTypes,o=0,s=r.length;o<s;o+=1)if(a=r[o],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof e=="object"&&e instanceof a.instanceOf)&&(!a.predicate||a.predicate(e))){if(n.tag=t?a.tag:"?",a.represent){if(l=n.styleMap[a.tag]||a.defaultStyle,si.call(a.represent)==="[object Function]")i=a.represent(e,l);else if(ai.call(a.represent,l))i=a.represent[l](e,l);else throw new Ne("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');n.dump=i}return!0}return!1}function ce(n,e,t,i,r,o){n.tag=null,n.dump=t,Ft(n,t,!1)||Ft(n,t,!0);var s=si.call(n.dump);i&&(i=n.flowLevel<0||n.flowLevel>e);var a=s==="[object Object]"||s==="[object Array]",l,c;if(a&&(l=n.duplicates.indexOf(t),c=l!==-1),(n.tag!==null&&n.tag!=="?"||c||n.indent!==2&&e>0)&&(r=!1),c&&n.usedDuplicates[l])n.dump="*ref_"+l;else{if(a&&c&&!n.usedDuplicates[l]&&(n.usedDuplicates[l]=!0),s==="[object Object]")i&&Object.keys(n.dump).length!==0?(vc(n,e,n.dump,r),c&&(n.dump="&ref_"+l+n.dump)):(bc(n,e,n.dump),c&&(n.dump="&ref_"+l+" "+n.dump));else if(s==="[object Array]"){var d=n.noArrayIndent&&e>0?e-1:e;i&&n.dump.length!==0?(_c(n,d,n.dump,r),c&&(n.dump="&ref_"+l+n.dump)):(yc(n,d,n.dump),c&&(n.dump="&ref_"+l+" "+n.dump))}else if(s==="[object String]")n.tag!=="?"&&mc(n,n.dump,e,o);else{if(n.skipInvalid)return!1;throw new Ne("unacceptable kind of an object to dump "+s)}n.tag!==null&&n.tag!=="?"&&(n.dump="!<"+n.tag+"> "+n.dump)}return!0}function wc(n,e){var t=[],i=[],r,o;for(kn(n,t,i),r=0,o=i.length;r<o;r+=1)e.duplicates.push(t[i[r]]);e.usedDuplicates=new Array(o)}function kn(n,e,t){var i,r,o;if(n!==null&&typeof n=="object")if(r=e.indexOf(n),r!==-1)t.indexOf(r)===-1&&t.push(r);else if(e.push(n),Array.isArray(n))for(r=0,o=n.length;r<o;r+=1)kn(n[r],e,t);else for(i=Object.keys(n),r=0,o=i.length;r<o;r+=1)kn(n[i[r]],e,t)}function vi(n,e){e=e||{};var t=new cc(e);return t.noRefs||wc(n,t),ce(t,0,n,!0,!0)?t.dump+`
`:""}function kc(n,e){return vi(n,De.extend({schema:jl},e))}Ln.dump=vi;Ln.safeDump=kc;var nn=Re,wi=Ln;function tn(n){return function(){throw new Error("Function "+n+" is deprecated and cannot be used.")}}P.Type=H;P.Schema=ve;P.FAILSAFE_SCHEMA=Sn;P.JSON_SCHEMA=Gt;P.CORE_SCHEMA=Wt;P.DEFAULT_SAFE_SCHEMA=Fe;P.DEFAULT_FULL_SCHEMA=Ze;P.load=nn.load;P.loadAll=nn.loadAll;P.safeLoad=nn.safeLoad;P.safeLoadAll=nn.safeLoadAll;P.dump=wi.dump;P.safeDump=wi.safeDump;P.YAMLException=Le;P.MINIMAL_SCHEMA=Sn;P.SAFE_SCHEMA=Fe;P.DEFAULT_SCHEMA=Ze;P.scan=tn("scan");P.parse=tn("parse");P.compose=tn("compose");P.addConstructor=tn("addConstructor");var xc=P,Cc=xc;function Tc(n){if(!n.startsWith(`---
`))return{data:{},content:n};const e=n.indexOf(`
---`,4);if(e===-1)return{data:{},content:n};const t=n.slice(4,e),i=n.slice(e+4),r=i.startsWith(`
`)?i.slice(1):i;return{data:Cc.safeLoad(t)??{},content:r}}const ki={npc:{specialNameChance:.3},missions:{boardMaxCount:8,missionTtlMs:9e5,deliveryChance:.6,deliveryBaseReward:200,deliveryRandomReward:200,supplyRewardMultiplierMin:1.15,supplyRewardMultiplierMax:1.5,supplyRequirementsMin:1,supplyRequirementsMax:2,supplyQtyMin:3,supplyQtyMax:10,deliveryDepositFraction:.2},trading:{stockCountMin:4,stockCountMax:6,stockQtyMin:5,stockQtyMax:10,stockTtlMs:12e4,stockRepCountBonusPerLevel:1,stockRepCountBonusMin:-2,stockRepCountBonusMax:3,stockRepQtyBonusPerLevel:2,stockRepQtyBonusMin:-4,stockRepQtyBonusMax:6},fuel:{pricePerLitre:10,consumptionPerLy:5,inSystemBaseConsumptionL:4},reputation:{levelUnfriendlyMin:-300,levelNeutralMin:-100,levelFriendlyMin:100,levelLikedMin:300,levelReveredMin:600,pointsMin:-600,pointsMax:1e3,missionDeltaSmall:25,missionDeltaMedium:75,missionDeltaLarge:200,missionTierMediumReward:300,missionTierLargeReward:600,tradeModifierHated:1.2,tradeModifierUnfriendly:1.1,tradeModifierNeutral:1,tradeModifierFriendly:.92,tradeModifierLiked:.85,tradeModifierRevered:.8,repPerCredit:.01,maxRepPerVisit:10},emergencyRescue:{towFee:500,fuelDropFee:800,fuelDropLitres:15},economies:{minFactor:.75,maxFactor:1.25}};function Ic(n){const e={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},balance:{...ki},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],economies:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[t,i]of Object.entries(n)){const r=t.split("/").pop()??"";if(r==="_template.md"||r===".gitkeep")continue;const{data:o,content:s}=Tc(i);/^systems\/[^/]+\.md$/.test(t)?e.systems.push(Mc(o,s)):/^destinations\/[^/]+\.md$/.test(t)?e.destinations.push(Sc(o,s)):/^factions\/[^/]+\.md$/.test(t)?e.factions.push(Ac(o,s)):/^ships\/[^/]+\.md$/.test(t)?e.ships.push(Ec(o,s)):t==="ships/components/jump-drives.md"?e.drives=Rc(o):t==="navigation/jump-routes.md"?e.routes=Lc(o):t==="commodities.md"?e.commodities=Fc(o):t==="economies.md"?e.economies=Bc(o):/^story\/[^/]+\.md$/.test(t)?e.storyBeats.push(Dc(o,s)):t==="settings/new-game.md"?e.settings=Nc(o):t==="settings/balance.md"?e.balance=Uc(o):t==="delivery-items.md"?e.deliveryItems=Oc(o):t==="npc-names.md"&&(e.npcNames=Pc(o))}return e}function rn(n){const e=[];let t=!1;for(const i of n.split(`
`)){const r=i.trim();if(!r.startsWith("#"))if(r===""){if(t)break}else t=!0,e.push(r)}return e.join(" ")}function Mc(n,e){return{id:n.id,name:n.name,starType:n.star_type,distanceFromSol:n.distance_from_sol,zone:n.zone,security:n.security,population:n.population,dangerLevel:n.danger_level,playerKnowledge:n.player_knowledge,economies:n.economies??[],majorFactions:n.major_factions??[],destinations:n.destinations??[],tags:n.tags??[],description:rn(e)}}function Sc(n,e){const t=n.amenities??{},i={trader:t.trader??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:n.id,name:n.name,system:n.system,locationType:n.location_type,type:n.type,amenities:i,npcs:n.npcs??{},minMissions:n.min_missions??0,missionChance:n.mission_chance??0,dangerLevel:n.danger_level,tags:n.tags??[],description:rn(e),owningFactionId:n.owning_faction}}function Ac(n,e){return{id:n.id,name:n.name,type:n.type,homeSystem:n.home_system,size:n.size,influence:n.influence??[],tags:n.tags??[],description:rn(e),rivals:n.rivals??[],allies:n.allies??[]}}function Ec(n,e){return{id:n.id,name:n.name,class:n.class,cost:n.cost,cargoCapacityKg:n.cargo_capacity_kg,fuelCapacityL:n.fuel_capacity_l,hullPoints:n.hull_points,defaultJumpDrive:n.default_jump_drive,fuelEfficiency:n.fuel_efficiency,tags:n.tags??[],description:rn(e)}}function Rc(n){return(n.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function Lc(n){return(n.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function Fc(n){return(n.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function Dc(n,e){return{id:n.id,title:n.title,trigger:n.trigger,type:n.type,location:n.location,skippable:n.skippable,playerKnowledge:n.player_knowledge,text:e.trim()}}function Nc(n){var e,t,i,r;return{player:{name:((e=n.player)==null?void 0:e.name)??"Captain",startingCredits:((t=n.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((i=n.starting_location)==null?void 0:i.system)??"",destination:((r=n.starting_location)==null?void 0:r.destination)??""},startingShip:n.starting_ship??""}}function Oc(n){return(n.delivery_items??[]).map(t=>({id:t.id,name:t.name,weightKg:t.weight_kg}))}function Pc(n){const e=n.npc_names??{};return{special:e.special??[],firstNames:e.first_names??[],lastNames:e.last_names??[]}}function Bc(n){return(n.economies??[]).map(t=>({id:t.id,summary:t.summary,commodities:(t.commodities??[]).map(i=>({id:i.id,factor:i.factor}))}))}function Uc(n){const e=ki,t=n.npc??{},i=n.missions??{},r=n.trading??{},o=n.fuel??{},s=n.reputation??{},a=n.emergency_rescue??{},l=n.economies??{};return{npc:{specialNameChance:t.special_name_chance??e.npc.specialNameChance},missions:{boardMaxCount:i.board_max_count??e.missions.boardMaxCount,missionTtlMs:i.mission_ttl_ms??e.missions.missionTtlMs,deliveryChance:i.delivery_chance??e.missions.deliveryChance,deliveryBaseReward:i.delivery_base_reward??e.missions.deliveryBaseReward,deliveryRandomReward:i.delivery_random_reward??e.missions.deliveryRandomReward,supplyRewardMultiplierMin:i.supply_reward_multiplier_min??e.missions.supplyRewardMultiplierMin,supplyRewardMultiplierMax:i.supply_reward_multiplier_max??e.missions.supplyRewardMultiplierMax,supplyRequirementsMin:i.supply_requirements_min??e.missions.supplyRequirementsMin,supplyRequirementsMax:i.supply_requirements_max??e.missions.supplyRequirementsMax,supplyQtyMin:i.supply_qty_min??e.missions.supplyQtyMin,supplyQtyMax:i.supply_qty_max??e.missions.supplyQtyMax,deliveryDepositFraction:i.delivery_deposit_fraction??e.missions.deliveryDepositFraction},trading:{stockCountMin:r.stock_count_min??e.trading.stockCountMin,stockCountMax:r.stock_count_max??e.trading.stockCountMax,stockQtyMin:r.stock_qty_min??e.trading.stockQtyMin,stockQtyMax:r.stock_qty_max??e.trading.stockQtyMax,stockTtlMs:r.stock_ttl_ms??e.trading.stockTtlMs,stockRepCountBonusPerLevel:r.stock_rep_count_bonus_per_level??e.trading.stockRepCountBonusPerLevel,stockRepCountBonusMin:r.stock_rep_count_bonus_min??e.trading.stockRepCountBonusMin,stockRepCountBonusMax:r.stock_rep_count_bonus_max??e.trading.stockRepCountBonusMax,stockRepQtyBonusPerLevel:r.stock_rep_qty_bonus_per_level??e.trading.stockRepQtyBonusPerLevel,stockRepQtyBonusMin:r.stock_rep_qty_bonus_min??e.trading.stockRepQtyBonusMin,stockRepQtyBonusMax:r.stock_rep_qty_bonus_max??e.trading.stockRepQtyBonusMax},fuel:{pricePerLitre:o.price_per_litre??e.fuel.pricePerLitre,consumptionPerLy:o.consumption_per_ly??e.fuel.consumptionPerLy,inSystemBaseConsumptionL:o.in_system_base_consumption_l??e.fuel.inSystemBaseConsumptionL},reputation:{levelUnfriendlyMin:s.level_unfriendly_min??e.reputation.levelUnfriendlyMin,levelNeutralMin:s.level_neutral_min??e.reputation.levelNeutralMin,levelFriendlyMin:s.level_friendly_min??e.reputation.levelFriendlyMin,levelLikedMin:s.level_liked_min??e.reputation.levelLikedMin,levelReveredMin:s.level_revered_min??e.reputation.levelReveredMin,pointsMin:s.points_min??e.reputation.pointsMin,pointsMax:s.points_max??e.reputation.pointsMax,missionDeltaSmall:s.mission_delta_small??e.reputation.missionDeltaSmall,missionDeltaMedium:s.mission_delta_medium??e.reputation.missionDeltaMedium,missionDeltaLarge:s.mission_delta_large??e.reputation.missionDeltaLarge,missionTierMediumReward:s.mission_tier_medium_reward??e.reputation.missionTierMediumReward,missionTierLargeReward:s.mission_tier_large_reward??e.reputation.missionTierLargeReward,tradeModifierHated:s.trade_modifier_hated??e.reputation.tradeModifierHated,tradeModifierUnfriendly:s.trade_modifier_unfriendly??e.reputation.tradeModifierUnfriendly,tradeModifierNeutral:s.trade_modifier_neutral??e.reputation.tradeModifierNeutral,tradeModifierFriendly:s.trade_modifier_friendly??e.reputation.tradeModifierFriendly,tradeModifierLiked:s.trade_modifier_liked??e.reputation.tradeModifierLiked,tradeModifierRevered:s.trade_modifier_revered??e.reputation.tradeModifierRevered,repPerCredit:s.rep_per_credit??e.reputation.repPerCredit,maxRepPerVisit:s.max_rep_per_visit??e.reputation.maxRepPerVisit},emergencyRescue:{towFee:a.tow_fee??e.emergencyRescue.towFee,fuelDropFee:a.fuel_drop_fee??e.emergencyRescue.fuelDropFee,fuelDropLitres:a.fuel_drop_litres??e.emergencyRescue.fuelDropLitres},economies:{minFactor:l.min_factor??e.economies.minFactor,maxFactor:l.max_factor??e.economies.maxFactor}}}function Hc(){const n=Object.assign({"/docs/world/commodities.md":Ao,"/docs/world/delivery-items.md":Eo,"/docs/world/destinations/_template.md":Ro,"/docs/world/destinations/blackwake-yard.md":Lo,"/docs/world/destinations/ceti-landfall.md":Fo,"/docs/world/destinations/drift-market.md":Do,"/docs/world/destinations/elysium-station.md":No,"/docs/world/destinations/eridani-anchorage.md":Oo,"/docs/world/destinations/foundries-platform.md":Po,"/docs/world/destinations/galileo-transfer.md":Bo,"/docs/world/destinations/hestia-ring.md":Uo,"/docs/world/destinations/keelhaul-station.md":Ho,"/docs/world/destinations/kepler-yard.md":$o,"/docs/world/destinations/mars-anchor.md":Go,"/docs/world/destinations/meridian-station.md":Wo,"/docs/world/destinations/new-horizon-port.md":jo,"/docs/world/destinations/orrery-anchorage.md":Ko,"/docs/world/destinations/redline-station.md":qo,"/docs/world/destinations/tycho-orbital.md":Yo,"/docs/world/destinations/veil-station.md":Vo,"/docs/world/destinations/waypoint-ceti.md":zo,"/docs/world/economies.md":Qo,"/docs/world/factions/_template.md":Xo,"/docs/world/factions/centauri-trade-league.md":Jo,"/docs/world/factions/eridani-colonial-council.md":Zo,"/docs/world/factions/free-captains.md":es,"/docs/world/factions/grey-market-cartel.md":ns,"/docs/world/factions/helios-directorate.md":ts,"/docs/world/factions/independent-miners-guild.md":is,"/docs/world/factions/procyon-institute.md":rs,"/docs/world/factions/terran-union.md":os,"/docs/world/galaxy-map.md":ss,"/docs/world/navigation/jump-routes.md":as,"/docs/world/npc-names.md":ls,"/docs/world/settings/balance.md":cs,"/docs/world/settings/new-game.md":ds,"/docs/world/ships/_template.md":hs,"/docs/world/ships/components/jump-drives.md":us,"/docs/world/ships/freighter.md":ps,"/docs/world/ships/hauler.md":ms,"/docs/world/ships/scout.md":fs,"/docs/world/story/_template.md":gs,"/docs/world/story/enter-wolf-359.md":ys,"/docs/world/story/first-jump.md":_s,"/docs/world/story/opening-arrival.md":bs,"/docs/world/systems/_template.md":vs,"/docs/world/systems/alpha-centauri.md":ws,"/docs/world/systems/barnards-star.md":ks,"/docs/world/systems/epsilon-eridani.md":xs,"/docs/world/systems/procyon.md":Cs,"/docs/world/systems/sirius.md":Ts,"/docs/world/systems/sol.md":Is,"/docs/world/systems/tau-ceti.md":Ms,"/docs/world/systems/wolf-359.md":Ss}),e={};for(const[t,i]of Object.entries(n)){const r=t.replace("/docs/world/","");e[r]=i}return Ic(e)}Bi(Hc());const $c=navigator.maxTouchPoints>0?"touch":"keyboard",Gc=new URLSearchParams(window.location.search).has("debug"),xi={environment:"browser",primaryInput:$c,debug:Gc},Wc=new Ai,Ci=new Fi(xi);Ci.connect();const jc=new So(Wc,Ci,xi);let Dt=0;function Ti(n){jc.tick(n-Dt),Dt=n,requestAnimationFrame(Ti)}requestAnimationFrame(Ti);
