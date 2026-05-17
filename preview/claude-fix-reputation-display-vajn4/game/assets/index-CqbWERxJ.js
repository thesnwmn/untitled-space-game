(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const ye=40,Me=30,hi=50,Xe=24;function ui(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class pi{constructor(){this.charW=0,this.charH=0,this.gridH=Me,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(ye),this.pre.dataset.gridRows=String(Me),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${Xe}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${Xe}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const t=n.getBoundingClientRect();document.body.removeChild(n),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(ye*this.charW),window.innerHeight/(Me*this.charH)),t=Math.max(Me,Math.min(hi,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${Xe*n}px`,this.pre.style.width=`${ye*this.charW*n}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const r of this.resizeHandlers)r(ye,t)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const t=[];for(const r of n){let i="";for(const o of r){const s=o.fg!=="transparent"?`fg-${o.fg}`:"",a=o.bg!=="transparent"?`bg-${o.bg}`:"",l=s&&a?`${s} ${a}`:s||a,c=l?` class="${l}"`:"";i+=`<span${c}>${ui(o.char)}</span>`}t.push(i)}this.pre.innerHTML=t.join(`
`)}getWidth(){return ye}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const mi={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",m:"MENU",M:"MENU",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},fi=new Set(["0","1","2","3","4","5","6","7","8","9"]),gi=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class yi{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}connect(){this.keyListener=n=>{if(gi.has(n.key)&&n.preventDefault(),fi.has(n.key))for(const r of this.charInputHandlers.slice())r(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const r of this.charInputHandlers.slice())r("\b");return}const t=mi[n.key];if(t)for(const r of this.actionHandlers.slice())r(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=n=>{const t=this.pointerStartMap.get(n.pointerId),r=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),!t){this.logDebug(`UP id=${n.pointerId} NO START`);return}const i=n.clientX-t.startX,o=n.clientY-t.startY,s=Math.abs(i),a=Math.abs(o);if(s<20&&a<20)if(r>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;s>=a?l=i>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(i)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=n=>{this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const t=n.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(n,t){const r=document.querySelector(".game-screen");if(!r)return null;const i=r.getBoundingClientRect(),o=parseInt(r.dataset.gridCols??"1"),s=parseInt(r.dataset.gridRows??"1");if(!o||!s||!i.width||!i.height)return null;const a=Math.floor((n-i.left)/(i.width/o)),l=Math.floor((t-i.top)/(i.height/s));return a<0||a>=o||l<0||l>=s?null:{col:a,row:l}}}function f(e,n,t,r,i,o){if(n<0||n>=e.length)return;const s=e[n];for(let a=0;a<r.length;a++){const l=t+a;l>=0&&l<s.length&&(s[l]={char:r[a],fg:i,bg:o})}}function I(e,n,t,r,i){if(n<0||n>=e.length)return;const o=e[n].length,s=Math.max(0,Math.floor((o-t.length)/2));f(e,n,s,t,r,i)}function We(e,n){const t=e.split(/\s+/).filter(Boolean),r=[];let i="";for(const o of t)i.length===0?i=o:i.length+1+o.length<=n?i+=" "+o:(r.push(i),i=o);return i.length>0&&r.push(i),r}function Ee(e,n,t,r="bright-black"){f(e,n,0,"-".repeat(t),r,"black")}function _t(e,n,t,r,i){const o=`${r+1}/${i}`;f(e,n,0,"|<|","white","black");const s=Math.floor((t-o.length)/2);f(e,n,s,o,"bright-black","black"),f(e,n,t-3,"|>|","white","black")}const Tn=["UNTITLED","SPACE GAME"],bi=4,_i=3,vi="- An ASCII space adventure -",wi=11,An=16;class Sn{constructor(n,t,r,i){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,i()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),n.onAction(o=>{this.activated||(o==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:o==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:o==="SELECT"&&this.items[this.cursorIdx].action())}),n.onTap&&n.onTap((o,s)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(s===An+a){this.cursorIdx=a,this.items[a].action();return}}})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let s=0;s<t;s++)for(let a=0;a<r;a++)n[s][a]={char:" ",fg:"black",bg:"black"};for(let s=0;s<Tn.length;s++)I(n,bi+s*_i,Tn[s],"bright-cyan","black");I(n,wi,vi,"white","black");const i=this.items.reduce((s,a)=>Math.max(s,a.label.length+2),0),o=Math.max(0,Math.floor((r-i)/2));for(let s=0;s<this.items.length;s++){const a=An+s;if(a>=t)continue;const l=s===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";f(n,a,o,c+this.items[s].label,h,"black")}}}let on=null;function ki(e){on=e}function N(){if(on===null)throw new Error("World not initialised — call initWorld() before accessing world data");return on}function Ue(e){return N().systems.find(n=>n.id===e)}function G(e){return N().destinations.find(n=>n.id===e)}function un(e){return N().routes.filter(n=>n.from===e||n.to===e)}function vt(e){return N().drives.find(n=>n.id===e)}function xi(e){return N().storyBeats.filter(n=>n.trigger===e)}function Ci(){return N().settings}function $(){return N().balance}function wt(e){return N().ships.find(n=>n.id===e)}function Oe(e,n){return N().routes.find(t=>t.from===e&&t.to===n||t.from===n&&t.to===e)}function se(e){return N().commodities.find(n=>n.id===e)}function Ti(){return N().commodities}function Ai(){return N().systems.filter(e=>e.playerKnowledge==="public")}function Si(e){return e.reduce((n,t)=>{const r=se(t.commodityId);return n+t.qty*((r==null?void 0:r.weightKg)??0)},0)}const we=3,In=0;function kt(e,n){return n?e-2:e}function Ii(e){return e.toLocaleString("en-US")}class Mi{constructor(n,t){this.buttonRanges=null,this.footerRow=-1,this.headerWidth=-1,this.context=n,this.player=t}render(n,t){const r=n.length,i=r>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader?(this.headerWidth=i,this.renderHeaderRow0(n,i,t.systemLabel),this.renderHeaderRow1(n,i,t.destinationLabel)):this.headerWidth=-1,t.showFooter&&(this.renderFooter(n,r,i,t.navOptions),this.footerRow=r-1)}renderHeaderRow0(n,t,r){const i=r!==void 0?r??"":(()=>{const c=Ue(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),o="::";f(n,0,0,o,"bright-black","black"),f(n,0,o.length,i,"bright-cyan","black");const a=t-o.length-i.length-10;let l=o.length+i.length;for(let c=0;c<a;c++)n[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,f(n,0,l,"[M]","white","black"),l+=3,f(n,0,l," MENU","white","black"),l+=5,f(n,0,l,"::","bright-black","black")}renderHeaderRow1(n,t,r){const i=r!==void 0?r??"":(()=>{const h=this.player.destinationId?G(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),o=Ii(this.player.credits),s=o.length+5,a="::";f(n,1,0,a,"bright-black","black"),f(n,1,a.length,i,"cyan","black");const l=t-a.length-i.length-s;let c=a.length+i.length;for(let h=0;h<l;h++)n[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,f(n,1,c,o,"green","black"),c+=o.length,f(n,1,c," CR","white","black"),c+=3,f(n,1,c,"::","bright-black","black")}renderFooter(n,t,r,i){const o=t-1,s=[];if(i.length===0){for(let l=0;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}f(n,o,0,"::","bright-black","black");let a=2;for(let l=0;l<i.length;l++){l>0&&(f(n,o,a,"::","bright-black","black"),a+=2);const c=i[l],h=`[${l+1}]`,d=` ${c.label}`,p=a;f(n,o,a,h,"white","black"),a+=h.length,f(n,o,a,d,"white","black"),a+=d.length,s.push({id:c.id,startCol:p,endCol:a})}for(let l=a;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=s}hitTestNav(n,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const r of this.buttonRanges)if(n>=r.startCol&&n<r.endCol)return r.id;return null}hitTestHeader(n,t){if(this.headerWidth<0||t!==0)return null;const r=this.headerWidth-10,i=this.headerWidth-2;return n>=r&&n<i?"menu":null}}class fe{constructor(n,t,r,i){this.activeTabIdx=0,this.activated=!1,this.player=r,this.chrome=new Mi(t,r),this.opts=i,n.onCharInput&&n.onCharInput(o=>{this.activated||this.handleCharInput(o)}),n.onAction(o=>{if(!this.activated&&!this.preHandleAction(o)){if(o==="MENU"&&i.onMenu){i.onMenu();return}if(i.tabs){if(o==="LEFT"){const s=Math.max(0,this.activeTabIdx-1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}if(o==="RIGHT"){const s=Math.min(i.tabs.length-1,this.activeTabIdx+1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}}this.handleAction(o)}}),n.onTap&&n.onTap((o,s)=>{var l;if(this.activated||this.preHandleTap(o,s))return;const a=this.chrome.hitTestNav(o,s);if(a!==null){this.handleNavTap(a);return}if(this.chrome.hitTestHeader(o,s)==="menu"&&i.onMenu){i.onMenu();return}if(i.tabs&&i.title!==void 0){const c=i.showHeader??!0?we:In,h=((l=i.summary)==null?void 0:l.length)??0,d=c+3+h;if(s===d){let p=3;for(let u=0;u<i.tabs.length;u++){const m=i.tabs[u].length+2;if(o>=p&&o<p+m){u!==this.activeTabIdx&&(this.activeTabIdx=u,this.onTabChange(u));return}p+=m+1}return}}this.handleTap(o,s)})}preHandleAction(n){return!1}preHandleTap(n,t){return!1}handleAction(n){}handleTap(n,t){}handleNavTap(n){}handleCharInput(n){}onTabChange(n){}buildChromeConfig(){return{showHeader:this.opts.showHeader??!0,showFooter:this.opts.showFooter??!0,navOptions:this.opts.navOptions}}suspend(){this.activated=!0}resume(){this.activated=!1}update(n){}render(n){var p;const t=n.length,r=t>0?n[0].length:0,i=this.opts;for(let u=0;u<t;u++)for(let m=0;m<r;m++)n[u][m]={char:" ",fg:"black",bg:"black"};const o=this.buildChromeConfig();this.chrome.render(n,o);const s=i.showHeader??!0,a=i.showFooter??!0,l=s?we:In,c=((p=i.summary)==null?void 0:p.length)??0,h=kt(t,a);let d;if(i.title!==void 0){f(n,l,2,i.title,"bright-white","black"),f(n,l+1,2,"'".repeat(i.title.length),"bright-black","black");for(let u=0;u<c;u++)f(n,l+2+u,2,i.summary[u],"bright-black","black");if(i.tabs){const u=l+3+c;let m=2;u<t&&(n[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++;for(let g=0;g<i.tabs.length;g++){const y=g===this.activeTabIdx,x=` ${i.tabs[g]} `,M=y?"black":"white",k=y?"green":"black";for(const A of x)u<t&&m<r&&(n[u][m]={char:A,fg:M,bg:k}),m++;u<t&&m<r&&(n[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++}d=l+5+c}else d=l+3+c}else d=l;this.renderContent(n,d,h)}}class ne extends fe{constructor(n,t,r,i,o,s,a=[],l=null,c){super(i,o,s,{navOptions:r,title:n,summary:a,tabs:l!==null?l.map(d=>d.label):void 0,onMenu:c}),this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.modal=null,this.lastContentTop=0,this._staticItems=t,this.tabs=l,this.infoLines=a;const h=a.length;this.lastContentTop=l!==null?we+5+h:we+3+h,this.resetCursor()}get items(){var n;return this.tabs!==null?((n=this.tabs[this.activeTabIdx])==null?void 0:n.items)??[]:this._staticItems}preHandleAction(n){return this.modal!==null?(this.modal.handleAction(n),!0):!1}preHandleTap(n,t){return this.modal!==null?(this.modal.handleTap(n,t),!0):!1}handleCharInput(n){this.modal!==null&&this.modal.handleCharInput(n)}onTabChange(n){this.resetCursor()}handleAction(n){n==="UP"?this.moveCursor(-1):n==="DOWN"?this.moveCursor(1):n==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):n==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):n==="SELECT"?this.activateCurrent():this.handleNavAction(n)}handleTap(n,t){const r=this.rowToVisibleItemIndex(t);r!==null&&!this.items[r].disabled&&(this.cursorIdx=r,this.activateCurrent())}moveCursor(n){const t=this.items,r=t.length;if(r===0)return;const i=this.cursorIdx===-1?n>0?r-1:0:this.cursorIdx;for(let o=0;o<r;o++){const s=((i+n*(o+1))%r+r)%r;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const n=this.items[this.cursorIdx];n.disabled||(this.activated=!0,n.action())}rowToVisibleItemIndex(n){var i,o;let t=this.lastContentTop;const r=this.items;for(let s=0;s<r.length;s++){const a=1+(((i=r[s].details)==null?void 0:i.length)??0)+(((o=r[s].detailsColored)==null?void 0:o.length)??0);if(n>=t&&n<t+a)return s;t+=a}return null}resetCursor(){const n=this.items;for(let t=0;t<n.length;t++)if(!n[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(n){}openModal(n){this.modal=n,this.activated=!1}closeModal(){this.modal=null}renderContent(n,t,r){var M,k,A,v;this.lastContentTop=t;const o=n.length>0?n[0].length:0,s=r-1,a=s-t,l=this.items,c=l.map(_=>{var b,C;return 1+(((b=_.details)==null?void 0:b.length)??0)+(((C=_.detailsColored)==null?void 0:C.length)??0)}),d=c.reduce((_,b)=>_+b,0)>a,p=d?a-1:a,u=[];let m=[],g=0;for(let _=0;_<c.length;_++)g+c[_]>p?(m.length>0&&u.push(m),m=[_],g=c[_]):(m.push(_),g+=c[_]);m.length>0&&u.push(m),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const y=u[this.pageIndex]??[];let x=t;for(const _ of y){const b=l[_],C=_===this.cursorIdx,R=b.disabled?"bright-black":C?"bright-green":b.accentFg??"white",q=b.infoFg??R,B=o-4;if(b.icon!==void 0){const S=b.icon.length;if(f(n,x,2,C?">":" ",R,"black"),f(n,x,3,b.icon,b.iconFg??R,"black"),b.info!==void 0){const L=b.info.length,K=Math.max(0,B-1-S-2-L-1),T=b.label.length>K?b.label.slice(0,K):b.label,D=Math.max(1,B-1-S-T.length-2-L);f(n,x,3+S,T+" ",R,"black"),f(n,x,3+S+T.length+1,".".repeat(D),"bright-black","black"),f(n,x,3+S+T.length+1+D+1,b.info,q,"black")}else f(n,x,3+S,b.label.slice(0,B-1-S),R,"black");for(let L=0;L<(((M=b.details)==null?void 0:M.length)??0);L++)x+1+L<=s&&f(n,x+1+L,2,("  "+b.details[L]).slice(0,B),b.detailsFg??"bright-black","black")}else if(b.info!==void 0){const S=C?"> ":"  ",U=Math.max(1,B-2-b.label.length-2-b.info.length);f(n,x,2,S+b.label+" ",R,"black"),f(n,x,2+S.length+b.label.length+1,".".repeat(U),"bright-black","black"),f(n,x,2+S.length+b.label.length+1+U+1,b.info,q,"black")}else if(b.details!==void 0&&b.details.length>0){f(n,x,2,((C?"> ":"  ")+b.label).slice(0,B),R,"black");for(let U=0;U<b.details.length;U++)x+1+U<=s&&f(n,x+1+U,2,("  "+b.details[U]).slice(0,B),b.detailsFg??"bright-black","black")}else f(n,x,2,((C?"> ":"  ")+b.label).slice(0,B),R,"black");const E=((k=b.details)==null?void 0:k.length)??0;for(let S=0;S<(((A=b.detailsColored)==null?void 0:A.length)??0);S++){const U=x+1+E+S;if(U<=s){const L=b.detailsColored[S];let K=4;for(const T of L.left)f(n,U,K,T.text,T.fg,"black"),K+=T.text.length;if(L.right!==void 0){const T=B-L.right.text.length;f(n,U,T,L.right.text,L.right.fg,"black")}}}x+=1+E+(((v=b.detailsColored)==null?void 0:v.length)??0)}d&&_t(n,s,o,this.pageIndex,this.lastPageCount),this.modal!==null&&this.modal.render(n)}}class Mn extends ne{constructor(n,t,r,i,o){const s=i.length===0?[{label:"NO OPTIONS AVAILABLE",disabled:!0,action:()=>{}}]:i.map(a=>({label:a.label,action:a.action}));super("MENU",s,[{id:"game",label:"GAME"}],n,t,r,[],null,o),this.onClose=o}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onClose())}handleNavTap(n){n==="game"&&!this.activated&&(this.activated=!0,this.onClose())}}function je(e){return e.size==="medium"||e.size==="large"}function Ei(e,n){return e>=n.reputation.levelReveredMin?3:e>=n.reputation.levelLikedMin?2:e>=n.reputation.levelFriendlyMin?1:e<n.reputation.levelUnfriendlyMin?-2:e<n.reputation.levelNeutralMin?-1:0}function Ri(e){switch(e){case-2:return"HATED";case-1:return"UNFRIENDLY";case 0:return"NEUTRAL";case 1:return"FRIENDLY";case 2:return"LIKED";case 3:return"REVERED";default:return"NEUTRAL"}}function pn(e,n){const t=Math.abs(e),r=e<0?"-":"+";return t<=50?`${r}SMALL`:t<=150?`${r}MEDIUM`:`${r}LARGE`}function mn(e,n,t){const r=new Map;r.set(e.id,n);const i=Math.floor(n/2);for(const s of e.allies)r.set(s,i);const o=-Math.floor(n/2);for(const s of e.rivals)r.set(s,o);return r}function fn(e,n){return e.type==="delivery"?e.pickupComplete?n.destinationId===e.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":e.requirements.every(r=>{const i=n.cargoHold.find(o=>o.commodityId===r.commodityId);return i!==void 0&&i.qty>=r.qty})?"ready-to-deliver":"needs-supplies"}function Li(e,n){return n.type==="delivery"&&e.cargoCapacity-e.cargoWeightKg<n.itemWeightKg?{ok:!1,reason:"Insufficient cargo space"}:{ok:!0}}class Ni{constructor(n){const t=wt(n.shipId);if(!t)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[],this._factionReputation=new Map;for(const r of N().factions)je(r)&&this._factionReputation.set(r.id,0)}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,t){const r=this._cargoHold.find(i=>i.commodityId===n);r?r.qty+=t:this._cargoHold.push({commodityId:n,qty:t})}removeCargo(n,t){const r=this._cargoHold.findIndex(i=>i.commodityId===n);r<0||(t!==void 0&&t<this._cargoHold[r].qty?this._cargoHold[r].qty-=t:this._cargoHold.splice(r,1))}get missionItemsWeightKg(){return this._missionItems.reduce((n,t)=>n+t.weightKg,0)}get cargoWeightKg(){return Si(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(n,t){const r={...n,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(r),n.type==="delivery"&&t&&(this._missionItems.push({missionId:n.id,itemName:n.itemName,weightKg:n.itemWeightKg}),r.pickupComplete=!0)}collectMissionItem(n){const t=this._activeMissions.find(r=>r.id===n);!t||t.type!=="delivery"||(t.pickupComplete=!0,this._missionItems.push({missionId:t.id,itemName:t.itemName,weightKg:t.itemWeightKg}))}completeMission(n){this._activeMissions=this._activeMissions.filter(t=>t.id!==n),this._missionItems=this._missionItems.filter(t=>t.missionId!==n)}cancelMission(n){this._activeMissions=this._activeMissions.filter(t=>t.id!==n),this._missionItems=this._missionItems.filter(t=>t.missionId!==n)}getMissionsForPickup(n){return this._activeMissions.filter(t=>t.type==="delivery"&&t.pickupDestinationId===n&&!t.pickupComplete)}getMissionsForDelivery(n){return this._activeMissions.filter(t=>t.deliveryDestinationId===n&&fn(t,this)==="ready-to-deliver")}getFactionReputation(n){return this._factionReputation.get(n)??0}modifyFactionReputation(n,t,r){const i=this.getFactionReputation(n),o=Math.min(r.reputation.pointsMax,Math.max(r.reputation.pointsMin,i+t));this._factionReputation.set(n,o)}}const En=40;class sn{constructor(n){this.focus="confirm",this.confirmRect=null,this.cancelRect=null,this.opts=n}handleAction(n){var t,r;if(n==="BACK"){this.opts.onConfirm();return}if(n==="LEFT"||n==="RIGHT"||n==="TAB"){this.opts.cancelLabel!==void 0&&(this.focus=this.focus==="confirm"?"cancel":"confirm");return}n==="SELECT"&&(this.focus==="cancel"?(r=(t=this.opts).onCancel)==null||r.call(t):this.opts.onConfirm())}handleCharInput(n){}handleTap(n,t){var r,i;this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.opts.onConfirm():this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&((i=(r=this.opts).onCancel)==null||i.call(r))}render(n){const t=n.length,r=t>0?n[0].length:0,{title:i,body:o,confirmLabel:s,cancelLabel:a}=this.opts,l=En-2,c=We(o,l),h=c.length,d=4+h+1+1+1,p=En,u=Math.floor((r-p)/2),m=Math.floor((t-d)/2);for(let v=0;v<d;v++)for(let _=0;_<p;_++){const b=m+v,C=u+_;b>=0&&b<t&&C>=0&&C<r&&(n[b][C]={char:" ",fg:"white",bg:"black"})}const g=(v,_,b)=>{v>=0&&v<t&&_>=0&&_<r&&(n[v][_]={char:b,fg:"white",bg:"black"})};g(m,u,"+"),g(m,u+p-1,"+");for(let v=1;v<p-1;v++)g(m,u+v,"-");g(m+d-1,u,"+"),g(m+d-1,u+p-1,"+");for(let v=1;v<p-1;v++)g(m+d-1,u+v,"-");for(let v=1;v<d-1;v++)g(m+v,u,"|"),g(m+v,u+p-1,"|");const y=i.slice(0,l),x=m+1,M=u+1+Math.floor((l-y.length)/2);f(n,x,M,y,"bright-white","black"),f(n,m+2,M,"'".repeat(y.length),"bright-black","black");for(let v=0;v<c.length;v++)f(n,m+4+v,u+1,c[v],"white","black");const k=m+4+h+1,A=`[ ${s} ]`;if(a!==void 0){const v=`[ ${a} ]`,_=2,b=A.length+_+v.length,C=Math.floor((l-b)/2),R=u+1+C,q=R+A.length+_;this.confirmRect={col:R,row:k,width:A.length},this.cancelRect={col:q,row:k,width:v.length};const B=this.focus==="confirm",E=this.focus==="cancel";f(n,k,R,A,B?"black":"white",B?"green":"black"),f(n,k,q,v,E?"black":"white",E?"green":"black")}else{const v=Math.floor((l-A.length)/2),_=u+1+v;this.confirmRect={col:_,row:k,width:A.length},this.cancelRect=null,f(n,k,_,A,"black","green")}}}const Fi={delivery:"[D] ",supply:"[S] "},Oi={"pending-pickup":"PENDING PICKUP","needs-supplies":"NEEDS SUPPLIES","in-transit":"IN TRANSIT","ready-to-deliver":"READY TO DELIVER"},Di={"pending-pickup":"yellow","needs-supplies":"yellow","in-transit":"bright-black","ready-to-deliver":"bright-green"};class Pi extends ne{constructor(n,t,r,i,o){super("MISSIONS",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],n,t,r,[],null,o),this.onBack=i,this.onGame=o}get items(){const n=this.player.activeMissions;return n.length===0?[{label:"NO ACTIVE MISSIONS",disabled:!0,action:()=>{}}]:n.map(t=>{const r=fn(t,this.player),i=G(t.deliveryDestinationId),o=(i==null?void 0:i.name)??t.deliveryDestinationId,s=Oi[r]??r,a=Di[r]??"white";return{label:t.title,icon:Fi[t.type],iconFg:"bright-yellow",info:`${t.reward} CR`,infoFg:"bright-green",details:[`${s} → ${o}`],detailsFg:a,action:()=>this.openMissionModal(t)}})}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}openMissionModal(n){let t=n.description;if(n.giverFactionId){const r=N(),i=r.factions.find(o=>o.id===n.giverFactionId);if(i){const o=$(),s=n.reward;let a;s>=o.reputation.missionTierLargeReward?a=o.reputation.missionDeltaLarge:s>=o.reputation.missionTierMediumReward?a=o.reputation.missionDeltaMedium:a=o.reputation.missionDeltaSmall;const l=mn(i,a,r.factions),c=[];for(const[h,d]of l){const p=r.factions.find(u=>u.id===h);p&&c.push({id:h,name:p.name,delta:d})}c.sort((h,d)=>h.delta!==d.delta?d.delta-h.delta:h.name.localeCompare(d.name)),t+=`

REPUTATION IMPACT:
`;for(const h of c){const d=pn(h.delta);t+=`  ${h.name.padEnd(20)} ${d}
`}}}this.openModal(new sn({title:n.title,body:t,confirmLabel:"OKAY",cancelLabel:"CANCEL MISSION",onConfirm:()=>this.closeModal(),onCancel:()=>{this.player.cancelMission(n.id),this.closeModal();const r=this.player.activeMissions.length;r===0?this.cursorIdx=-1:this.cursorIdx>=r&&(this.cursorIdx=r-1)}}))}handleNavAction(n){n==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):(n==="BACK"||n==="NAV_2")&&!this.activated&&(this.activated=!0,this.onBack())}handleNavTap(n){n==="game"&&!this.activated?(this.activated=!0,this.onGame()):n==="menu"&&!this.activated&&(this.activated=!0,this.onBack())}}const an=20,Ui="█",Bi="░";function Hi(e,n,t){return e<=n?0:e>=t?an:Math.round((e-n)/(t-n)*an)}const $i={[-2]:"red",[-1]:"bright-red",0:"white",1:"bright-green",2:"bright-green",3:"bright-cyan"};class Gi extends ne{constructor(n,t,r,i,o){super("REPUTATION",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],n,t,r,[],null,o),this.onBack=i,this.onGame=o}get items(){const n=$(),r=N().factions.filter(i=>je(i));return r.sort((i,o)=>{if(i.size!==o.size){if(i.size==="large")return-1;if(o.size==="large")return 1}return i.name.localeCompare(o.name)}),r.map(i=>{const o=this.player.getFactionReputation(i.id),s=Ei(o,n),a=Ri(s),l=$i[s]??"white",c=Hi(o,n.reputation.pointsMin,n.reputation.levelReveredMin),h=an-c;return{label:i.name,info:a,infoFg:l,detailsColored:[{left:[{text:Ui.repeat(c),fg:l},{text:Bi.repeat(h),fg:"bright-black"}],right:{text:String(o),fg:"bright-white"}},{left:[]}],action:()=>{}}})}activateCurrent(){}handleNavAction(n){n==="BACK"&&!this.activated?(this.activated=!0,this.onBack()):n==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):super.handleNavAction(n)}handleNavTap(n){n==="menu"&&!this.activated?(this.activated=!0,this.onBack()):n==="game"&&!this.activated&&(this.activated=!0,this.onGame())}}class Wi extends fe{constructor(n,t,r,i){super(n,t,r,{navOptions:[]}),this.pageIndex=0,this.onContinue=i;const s=xi("game-start")[0].text.split(`

`),a=s[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=s.slice(1)):(this.yearHeader="",l=s);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),p=We(d,36);h>0&&c.push(""),c.push(...p)}this.bodyLines=c}handleAction(n){n==="SELECT"?(this.activated=!0,this.onContinue()):n==="LEFT"?this.pageIndex>0&&this.pageIndex--:n==="RIGHT"&&this.pageIndex++}handleTap(n,t){this.activated=!0,this.onContinue()}renderContent(n,t,r){const i=n.length>0?n[0].length:0;if(this.yearHeader){const m=Math.max(0,Math.floor((i-this.yearHeader.length)/2));f(n,t,m,this.yearHeader,"bright-yellow","black")}const o=t+2,s=r-1,a=s-o,l=Math.max(1,a),c=Math.max(1,Math.ceil(this.bodyLines.length/l));this.pageIndex>=c&&(this.pageIndex=c-1);const h=c>1,d=this.pageIndex*l,p=Math.min(d+l,this.bodyLines.length);let u=o;for(let m=d;m<p;m++){const g=this.bodyLines[m];g!==""&&f(n,u,2,g,"white","black"),u++}h&&_t(n,s,i,this.pageIndex,c)}}const ji=30;class ln{constructor(n){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=n,this.value=Math.max(n.field.min,Math.min(n.field.max,n.field.initialValue))}handleAction(n){const{field:t}=this.formDef;if(n==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(n==="UP"){this.value=Math.min(t.max,this.value+1);return}if(n==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(n==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(n==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(n==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}n==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(n){if(this.focus!=="field")return;const{field:t}=this.formDef;if(n==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(n>="0"&&n<="9"){const r=parseInt(n,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,r)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+r)}}handleTap(n,t){this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(n){const t=n.length,r=t>0?n[0].length:0,{title:i,field:o,derivedRows:s,confirmLabel:a}=this.formDef,l=s.length,c=8+l,h=ji,d=Math.floor((r-h)/2),p=Math.floor((t-c)/2);for(let T=0;T<c;T++)for(let D=0;D<h;D++){const j=p+T,z=d+D;j>=0&&j<t&&z>=0&&z<r&&(n[j][z]={char:" ",fg:"white",bg:"black"})}const u=(T,D,j)=>{T>=0&&T<t&&D>=0&&D<r&&(n[T][D]={char:j,fg:"white",bg:"black"})};u(p,d,"+"),u(p,d+h-1,"+");for(let T=1;T<h-1;T++)u(p,d+T,"-");u(p+c-1,d,"+"),u(p+c-1,d+h-1,"+");for(let T=1;T<h-1;T++)u(p+c-1,d+T,"-");for(let T=1;T<c-1;T++)u(p+T,d,"|"),u(p+T,d+h-1,"|");const m=h-2,g=p+1,y=d+1+Math.floor((m-i.length)/2);f(n,g,y,i,"bright-white","black"),f(n,p+2,y,"'".repeat(i.length),"bright-black","black");const x=[o.label,...s.map(T=>T.label)],M=Math.max(...x.map(T=>T.length)),k=d+1+M+3,A=p+4,v=this.focus==="field";f(n,A,d+1,o.label.padEnd(M)+" : ","white","black");const _=this.value.toString().padStart(5);f(n,A,k,_,v?"black":"white",v?"green":"black");for(let T=0;T<l;T++){const D=s[T],j=p+5+T,z=D.compute(this.value);f(n,j,d+1,D.label.padEnd(M)+" : ","white","black"),f(n,j,k,z,"white","black")}const b=p+4+l+2,C=`[ ${a} ]`,R="[ CANCEL ]",q=3,B=C.length+q+R.length,E=Math.floor((m-B)/2),S=d+1+E,U=S+C.length+q;this.confirmRect={col:S,row:b,width:C.length},this.cancelRect={col:U,row:b,width:R.length};const L=this.focus==="confirm",K=this.focus==="cancel";f(n,b,S,C,L?"black":"white",L?"green":"black"),f(n,b,U,R,K?"black":"white",K?"green":"black")}}class Ki extends ne{constructor(n,t,r,i,o,s,a,l,c,h){const d=G(i),p=r.getMissionsForPickup(i),u=r.getMissionsForDelivery(i),m=p.map(E=>({label:`COLLECT: ${E.type==="delivery"?E.itemName:""}`,accentFg:"bright-yellow",action:()=>{}})),g=u.map(E=>({label:`DELIVER: ${E.title} → ${E.reward} CR`,accentFg:"bright-yellow",action:()=>{}})),y=[...m,...g],x=[];d.amenities.trader&&x.push({label:"TRADER",action:s}),d.amenities.missionBoard&&x.push({label:"MISSION BOARD",action:a});const M=$().fuel.pricePerLitre,k=r.fuelCapacityL-r.fuelL,A=Math.floor(r.credits/M),v=Math.min(k,A);let _=null;if(d.amenities.fuel&&v>0){const E=v*M;_=y.length+(y.length>0?1:0)+x.length,x.push({label:`BUY FUEL  +${v}L  ${E}CR`,action:()=>{}})}const b=[];y.length>0&&(b.push(...y),b.push({label:"────────────────────",disabled:!0,action:()=>{}})),b.push(...x);const C=We(d.description,36).slice(0,3),R=`DANGER: ${d.dangerLevel.toUpperCase()}`,q=[...C,R];if(d.owningFactionId){const E=N().factions.find(S=>S.id===d.owningFactionId);E&&q.push(`OPERATED BY: ${E.name}`)}const B=d.locationType==="surface"||d.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",b,[{id:"undock",label:B}],n,t,r,q,null,h),this.onShip=c,this.onRefuel=o,this.onHub=l,this.fuelItemIdx=_;for(let E=0;E<p.length;E++){const S=p[E];m[E].action=()=>{this.player.collectMissionItem(S.id),this.onHub()}}for(let E=0;E<u.length;E++){const S=u[E];g[E].action=()=>{if(fn(S,this.player)!=="ready-to-deliver"){this.openModal(new sn({title:"CANNOT DELIVER",body:S.type==="delivery"?"Mission item is missing from your cargo.":"Required supplies are missing from your cargo.",confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.activated=!1}}));return}if(S.type==="supply")for(const D of S.requirements)this.player.removeCargo(D.commodityId,D.qty);const L=$(),K=N();let T="";if(S.giverFactionId){const D=K.factions.find(j=>j.id===S.giverFactionId);if(D){const j=S.reward;let z;j>=L.reputation.missionTierLargeReward?z=L.reputation.missionDeltaLarge:j>=L.reputation.missionTierMediumReward?z=L.reputation.missionDeltaMedium:z=L.reputation.missionDeltaSmall;const xn=mn(D,z,K.factions);for(const[V,X]of xn)this.player.modifyFactionReputation(V,X,L);const Qe=[];for(const[V,X]of xn){const Cn=K.factions.find(di=>di.id===V);Cn&&Qe.push({id:V,name:Cn.name,delta:X})}Qe.sort((V,X)=>V.delta!==X.delta?X.delta-V.delta:V.name.localeCompare(X.name)),T=`

REPUTATION:
`;for(const V of Qe){const X=pn(V.delta);T+=`  ${V.name.padEnd(20)} ${X}
`}}}this.player.completeMission(S.id),this.player.addCredits(S.reward),this.openModal(new sn({title:"MISSION COMPLETE",body:`Mission complete!

You received ${S.reward} CR.${T}`,confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.onHub()}}))}}}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx===-1)return;const t=n[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const r=$().fuel.pricePerLitre,i=this.player.fuelCapacityL-this.player.fuelL,o=Math.floor(this.player.credits/r),s=Math.min(i,o);this.openModal(new ln({title:"BUY FUEL",field:{label:"Litres",initialValue:s,min:0,max:s},derivedRows:[{label:"Cost",compute:a=>`${a*r} CR`}],confirmLabel:"BUY",onConfirm:a=>{this.closeModal(),a>0&&this.onRefuel(a*r,a)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class Yi extends ne{constructor(n,t,r,i,o,s,a,l,c,h){var m;const p=((m=G(i).npcs.trader)==null?void 0:m.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(p,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,[],u,h),this.traderStock=o,this.onBuy=s,this.onSell=a,this.onHub=l,this.onUndock=c,this.syncItems(),this.clampCursor()}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(n=>{const t=se(n.commodityId);if(!t)return[];const r=this.player.credits>=t.basePrice;return[{label:`${t.name} (x${n.qty})`,info:`${t.basePrice} CR`,disabled:!r,action:()=>{const i=Math.floor(this.player.credits/t.basePrice),o=Math.min(n.qty,i);this.openModal(new ln({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:o,min:0,max:o},derivedRows:[{label:"Total",compute:s=>`${s*t.basePrice} CR`}],confirmLabel:"BUY",onConfirm:s=>{s>0&&this.onBuy(n.commodityId,s),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const n=this.player.cargoHold;return n.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...n].flatMap(t=>{const r=se(t.commodityId);return r?[{label:`${r.name} (x${t.qty})`,info:`${r.basePrice} CR`,action:()=>{this.openModal(new ln({title:r.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:i=>`${i*r.basePrice} CR`}],confirmLabel:"SELL",onConfirm:i=>{i>0&&this.onSell(t.commodityId,i),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]:[]})}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const n=this.items;(this.cursorIdx<0||this.cursorIdx>=n.length||(t=n[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=n.findIndex(r=>!r.disabled))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(n){this.syncItems(),super.render(n);const t=n.length,r=`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,i=kt(t,!0)-2;f(n,i,2,r,"bright-black","black")}}const qi={delivery:"[D] ",supply:"[S] "};class Vi extends ne{constructor(n,t,r,i,o,s,a,l,c){G(i);const h=o();let d;h.length===0?d=[{label:"NO MISSIONS AVAILABLE",disabled:!0,action:()=>{}}]:d=h.map(p=>{const u=p.giverFactionId?(()=>{const m=N().factions.find(g=>g.id===p.giverFactionId);return m?[`For: ${m.name}`]:[]})():[];return{label:p.title,icon:qi[p.type],iconFg:"bright-yellow",info:`${p.reward} CR`,infoFg:"bright-green",details:u,detailsFg:"bright-black",action:()=>s(p)}}),super("MISSION BOARD",d,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,[],null,c),this.onHub=a,this.onUndock=l}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}const zi={delivery:"[D]",supply:"[S]"},Rn=16;class Qi extends ne{constructor(n,t,r,i,o,s,a,l){const c=Li(r,i),h=i.type==="delivery"&&i.pickupDestinationId===i.issuingDestinationId,d=c.ok?{label:"ACCEPT MISSION",action:()=>o(h)}:{label:"ACCEPT MISSION",disabled:!0,details:c.reason?[c.reason]:[],action:()=>{}},p={label:"BACK",action:()=>s()},u=Array.from({length:Rn},()=>"");super("MISSION BOARD",[d,p],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,u),this.spec=i,this.onBack=s,this.onHub=a,this.onUndock=l}destColor(n){if(n===this.player.destinationId)return"bright-green";const t=G(n);return t&&t.system===this.player.systemId?"bright-yellow":"white"}writeDestRow(n,t,r,i,o,s){f(n,t,2,r,"white","black"),f(n,t,2+r.length,i.slice(0,s-r.length),this.destColor(o),"black")}handleNavAction(n){this.activated||(n==="NAV_1"?(this.activated=!0,this.onUndock()):n==="NAV_2"?(this.activated=!0,this.onHub()):n==="BACK"&&(this.activated=!0,this.onBack()))}handleNavTap(n){this.activated||(n==="undock"?(this.activated=!0,this.onUndock()):n==="hub"&&(this.activated=!0,this.onHub()))}renderContent(n,t,r){super.renderContent(n,t,r),this.renderDetail(n,t-Rn)}renderDetail(n,t){const i=n.length>0?n[0].length:40,o=i-4,s=this.lastContentTop-1;let a=t;const l=(u,m,g)=>{u<=s&&f(n,u,2,m.slice(0,o),g,"black")};l(a,`${zi[this.spec.type]} ${this.spec.title}`,"bright-yellow"),a++;const c=N(),h=this.spec.giverFactionId?c.factions.find(u=>u.id===this.spec.giverFactionId):null,d=h?` [${h.name}]`:"";if(l(a,`    ${this.spec.giverName}${d}`,"bright-black"),a++,a++,this.spec.type==="delivery"){const u=G(this.spec.pickupDestinationId),m=G(this.spec.deliveryDestinationId);if(a<=s&&this.writeDestRow(n,a,"Pickup:  ",(u==null?void 0:u.name)??this.spec.pickupDestinationId,this.spec.pickupDestinationId,o),a++,a<=s&&this.writeDestRow(n,a,"Deliver: ",(m==null?void 0:m.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++,a<=s){const g=this.player.cargoCapacity-this.player.cargoWeightKg,y=this.spec.itemWeightKg,x=g>=y,M=`Weight:  ${y} kg  (Free: ${g} kg)`;f(n,a,2,M,"white","black");const k=x?"bright-green":"red",A=2+M.length+1;A<i&&f(n,a,A,x?"✓":"✗",k,"black")}a++}else{const u=G(this.spec.deliveryDestinationId);a<=s&&this.writeDestRow(n,a,"Deliver to: ",(u==null?void 0:u.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++;for(const m of this.spec.requirements){if(a>s)break;const g=se(m.commodityId);l(a,`  ${m.qty}x ${(g==null?void 0:g.name)??m.commodityId}`,"white"),a++}}a++;const p=We(this.spec.description,o);for(const u of p){if(a>s)break;l(a,u,"white"),a++}if(a++,!(a>s)&&(l(a,`REWARD: ${this.spec.reward} CR`,"bright-green"),a++,this.spec.giverFactionId)){const u=c.factions.find(m=>m.id===this.spec.giverFactionId);if(u){const m=$(),g=this.spec.reward;let y;g>=m.reputation.missionTierLargeReward?y=m.reputation.missionDeltaLarge:g>=m.reputation.missionTierMediumReward?y=m.reputation.missionDeltaMedium:y=m.reputation.missionDeltaSmall;const x=mn(u,y,c.factions),M=[];for(const[k,A]of x){const v=c.factions.find(_=>_.id===k);v&&M.push({id:k,name:v.name,delta:A})}if(M.sort((k,A)=>k.delta!==A.delta?A.delta-k.delta:k.name.localeCompare(A.name)),M.length>0){if(a++,a>s)return;const k=s-1;a<=k&&(l(a,"REPUTATION IMPACT","bright-cyan"),a++);for(const A of M){if(a>k)break;const v=pn(A.delta),_=A.delta>0?"bright-green":"red",b=o-v.length-2,C=A.name.slice(0,b),R=" ".repeat(Math.max(0,o-C.length-v.length));l(a,`  ${C}${R}${v}`,_),a++}}}}}}const Xi=[18,10,5],Ji=[".","*","+"],Ln=[4e3,2e3,800],Zi=[9e3,5e3,2500],er=[null,"bright-black","white"],nr=["bright-black","white","bright-white"],tr=["white","bright-white","bright-cyan"],Re=3,Nn=25,Le=2,Fn=37,On=2*Math.PI;function ir(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class rr{constructor(n=42){this.boundsSet=!1,this.rand=ir(n),this.stars=[];for(let t=0;t<3;t++)for(let r=0;r<Xi[t];r++){const i=Le+Math.floor(this.rand()*(Fn-Le+1)),o=Re+Math.floor(this.rand()*(Nn-Re+1)),s=this.rand()*On,a=Ln[t]+this.rand()*(Zi[t]-Ln[t]);this.stars.push({col:i,row:o,layer:t,twinklePhase:s,twinklePeriod:a})}}update(n){for(const t of this.stars)t.twinklePhase+=On/t.twinklePeriod*n}render(n,t,r,i,o){if(!this.boundsSet){this.boundsSet=!0;const s=Nn-Re,a=Fn-Le;{const l=(r-t)/s,c=(o-i)/a;for(const h of this.stars)h.row=Math.round(t+(h.row-Re)*l),h.col=Math.round(i+(h.col-Le)*c)}}for(const s of this.stars){const{row:a,col:l,layer:c}=s;if(a<t||a>r||l<i||l>o)continue;const h=Math.sin(s.twinklePhase);let d;h>=.5?d=tr[c]:h>=-.5?d=nr[c]:d=er[c],d!==null&&(n[a][l]={char:Ji[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const or=6,Je=6,sr=23,ar=23,Ze=10,lr=0,cr=4,dr=18,hr=21,ur=35,pr=39,Dn=12,mr=11,ie=13,be=27,en=28,fr=12,nn=40,Pn=200,tn=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],gr="#",Un=["green","cyan","white","yellow"],Bn=["*",".","+","x"];function Hn(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function yr(e,n,t){return{col:n,row:t,char:gr,color:Un[Math.floor(e()*Un.length)],phase:e()*2e4,period:1e4+e()*1e4,active:e()>.2}}function _e(e,n,t,r){const i=[];for(const o of r)for(let s=n;s<=t;s++)i.push(yr(e,s,o));return i}class br extends fe{constructor(n,t,r,i,o,s,a){super(n,t,r,{navOptions:[],onMenu:a}),this.cursorIdx=0,this.h=30,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.onTravel=i,this.onDock=o,this.onCargo=s,this.starfield=new rr(42),this.inSpace=r.destinationId===null;const l=Hn(99);this.gaugeBtns=[..._e(l,lr,cr,[3,4]),..._e(l,dr,hr,[3,4]),..._e(l,ur,pr,[3,4])],this.leftBtns=_e(l,0,mr,[0,1,2,3]),this.rightBtns=_e(l,en,39,[0,1,2,3]);const c=Hn(77),h=3+Math.floor(c()*4);this.radarContacts=Array.from({length:h},()=>({x:c()*(be-ie-1),y:c()*4,vx:(c()-.5)*2,vy:(c()-.5)*1.5,char:Bn[Math.floor(c()*Bn.length)]}))}navCount(){return this.inSpace?1:2}handleAction(n){n==="CARGO"?(this.activated=!0,this.onCargo()):n==="UP"?this.cursorIdx=(this.cursorIdx-1+this.navCount())%this.navCount():n==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.navCount():n==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,this.onTravel()):this.inSpace||(this.activated=!0,this.onDock()))}handleTap(n,t){const r=this.h;(t===3||t===4)&&n>=Je&&n<Je+1+Ze?(this.activated=!0,this.onCargo()):t===r-3&&n<Dn?(this.activated=!0,this.onTravel()):t===r-3&&n>=en&&!this.inSpace&&(this.activated=!0,this.onDock())}update(n){this.starfield.update(n),this.blinkPhase=(this.blinkPhase+n)%1e3;for(const i of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])i.phase+=n,i.phase>=i.period&&(i.phase-=i.period,i.active=!i.active);const t=be-ie,r=5;for(const i of this.radarContacts)i.x+=i.vx*n/1e3,i.y+=i.vy*n/1e3,i.x<0&&(i.x=-i.x,i.vx=-i.vx),i.x>t-1&&(i.x=2*(t-1)-i.x,i.vx=-i.vx),i.y<0&&(i.y=-i.y,i.vy=-i.vy),i.y>r-1&&(i.y=2*(r-1)-i.y,i.vy=-i.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-n);else for(this.tickerAccum+=n;this.tickerAccum>=Pn;){this.tickerAccum-=Pn,this.tickerScroll++;const i=tn[this.msgIdx];if(this.tickerScroll>=i.length+nn-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%tn.length,this.tickerPause=500,this.tickerAccum=0;break}}}renderContent(n,t,r){const i=n.length,o=i>0?n[0].length:0;this.h=i;const s=t+2,a=i-8,l=i-7,c=i-3,h=i-2;this.renderGaugeStrip(n,t),this.starfield.render(n,s,a,0,39);for(let d=0;d<o;d++)n[s][d]={char:"-",fg:"white",bg:"black"},n[a][d]={char:"-",fg:"white",bg:"black"};this.renderHUD(n,s+1),this.renderCrosshair(n,s+1,a-1),this.renderBottomPanels(n,l,c),this.renderTicker(n,h)}renderGaugeStrip(n,t){for(const s of this.gaugeBtns){const a=t+s.row-3,l=s.active?s.color:"bright-black";a>=0&&a<n.length&&(n[a][s.col]={char:s.char,fg:l,bg:"black"})}const r=this.player.fuelL/this.player.fuelCapacityL,i=this.player.cargoWeightKg/this.player.cargoCapacity,o=this.blinkPhase<500;this.renderGauge(n,t,or,"F",r,"yellow",o),this.renderGauge(n,t+1,Je,"C",i,"blue",o),this.renderGauge(n,t,sr,"S",1,"cyan",o),this.renderGauge(n,t+1,ar,"H",1,"green",o)}renderGauge(n,t,r,i,o,s,a){if(t<0||t>=n.length)return;n[t][r]={char:i,fg:s,bg:"black"};const l=Math.round(Math.min(1,Math.max(0,o))*Ze),c=o<=.2;for(let h=0;h<Ze;h++){const d=r+1+h;if(h<l){const p=c&&!a?"bright-black":s;n[t][d]={char:" ",fg:"black",bg:p}}else n[t][d]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(n,t){f(n,t,1,"VEL:----","bright-black","black"),f(n,t,16,"ATT:---°","bright-black","black"),f(n,t,30,"ROT:--°","bright-black","black")}renderCrosshair(n,t,r){var a;const i=Math.floor((t+r)/2),o=20;n[i][o]={char:"+",fg:"bright-green",bg:"black"};const s=[[i-3,o-5],[i-3,o+5],[i+3,o-5],[i+3,o+5]];for(const[l,c]of s){const h=((a=n[0])==null?void 0:a.length)??40;l>=t&&l<=r&&c>=0&&c<h&&(n[l][c]={char:"+",fg:"bright-green",bg:"black"})}}renderBottomPanels(n,t,r){for(let c=t;c<=r;c++)for(let h=ie;h<be;h++)n[c][h]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(n,t,r-t+1);for(const c of this.leftBtns){const h=t+c.row;if(h<r){const d=c.active?c.color:"bright-black";n[h][c.col]={char:c.char,fg:d,bg:"black"}}}for(const c of this.rightBtns){const h=t+c.row;if(h<r){const d=c.active?c.color:"bright-black";n[h][c.col]={char:c.char,fg:d,bg:"black"}}}const i=this.cursorIdx===0?"bright-yellow":"yellow";f(n,r,0,this.centerPad("TRAVEL",Dn),"black",i);let o,s;this.inSpace?(o="bright-black",s="bright-black"):(o=this.cursorIdx===1?"bright-cyan":"cyan",s="black"),f(n,r,en,this.centerPad("DOCK",fr),s,o);const a=be-ie,l="<)) "+"-".repeat(a-4);f(n,r,ie,l,"white","bright-black")}renderRadar(n,t,r){for(const i of this.radarContacts){const o=Math.min(be-ie-1,Math.max(0,Math.floor(i.x))),s=Math.min(r-1,Math.max(0,Math.floor(i.y)));n[t+s][ie+o]={char:i.char,fg:"white",bg:"bright-black"}}}renderTicker(n,t){const r=tn[this.msgIdx];for(let i=0;i<nn;i++){const o=this.tickerScroll-nn+1+i,s=o>=0&&o<r.length?r[o]:" ";n[t][i]={char:s,fg:"white",bg:"black"}}}centerPad(n,t){if(n.length>=t)return n.slice(0,t);const r=t-n.length,i=Math.floor(r/2);return" ".repeat(i)+n+" ".repeat(r-i)}}class _r extends fe{constructor(n,t,r,i,o){super(n,t,r,{title:"CARGO HOLD",tabs:["COMMODITIES","MISSION GOODS"],navOptions:[{id:"back",label:"BACK"}],onMenu:o}),this.onBack=i}handleNavTap(n){n==="back"&&(this.activated=!0,this.onBack())}handleAction(n){(n==="BACK"||n==="CARGO")&&(this.activated=!0,this.onBack())}renderContent(n,t,r){const o=n.length>0?n[0].length:0,s=this.player.cargoHold,a=this.player.missionItems,l=this.player.cargoCapacity,c=this.player.cargoWeightKg,h=r-1;this.activeTabIdx===0?this.renderCommoditiesTab(n,t,h,o,s):this.renderMissionGoodsTab(n,t,h,o,a);const d=`TOTAL: ${c}/${l}KG`;f(n,h,2,d,"bright-black","black")}renderCommoditiesTab(n,t,r,i,o){if(o.length===0){f(n,t,2,"NO COMMODITIES","bright-black","black");return}let s=t;for(const a of o){if(s>=r-1)break;const l=se(a.commodityId);if(!l)continue;const c=a.qty*l.weightKg,h=`  x${a.qty}  ${l.basePrice}CR  ${c}KG`,d=Math.max(6,i-4-h.length),p=l.name,u=p.length>d?p.slice(0,d):p;f(n,s,2,`${u}${h}`,"white","black"),s++}}renderMissionGoodsTab(n,t,r,i,o){if(o.length===0){f(n,t,2,"NO MISSION GOODS","bright-black","black");return}let s=t;for(const a of o){if(s>=r-1)break;const l=`  ${a.weightKg}KG`,c=Math.max(6,i-4-l.length),h=a.itemName.length>c?a.itemName.slice(0,c):a.itemName;f(n,s,2,`${h}${l}`,"white","black"),s++}}}class $n extends ne{constructor(n,t,r,i,o,s,a,l,c=()=>{}){const h=Ue(r.systemId),d=vt(r.driveId),p=[...h.destinations.map(y=>({label:G(y).name.toUpperCase(),disabled:y===r.destinationId,action:()=>i(y)})),{label:"FLY INTO SPACE",disabled:r.destinationId===null,action:s}],m=[...un(r.systemId).map(y=>{const x=y.from===r.systemId?y.to:y.from,M=Ue(x),k=y.stability.toUpperCase(),A=Math.ceil($().fuel.consumptionPerLy*y.distance*d.fuelEfficiency);return{label:`${M.name.toUpperCase()}  ${y.distance}LY  [${k}]`.slice(0,36),disabled:A>r.fuelL,action:()=>o(x)}}),{label:"GALAXY MAP...",action:l}],g=[{label:"DESTINATIONS",items:p},{label:"JUMPS",items:m}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],n,t,r,[],g,c),this.onShip=a}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}function Gn(e,n){if(e===n)return[e];const t=[[e]],r=new Set([e]);for(;t.length>0;){const i=t.shift(),o=i[i.length-1];for(const s of un(o)){const a=s.from===o?s.to:s.from;if(a===n)return[...i,a];r.has(a)||(r.add(a),t.push([...i,a]))}}return null}const vr=0,wr=4,kr=8,xr=9,Wn=10,jn=15,Cr=16,Tr=2,Ar=10,Sr=12,Ne=13,Fe=12,Ir=25,Mr=26,Er=10,Kn=18;function Rr(e,n){return e.length>=n?e.slice(0,n):e+" ".repeat(n-e.length)}function ve(e,n){return"["+Rr(e.toUpperCase(),n-2)+"]"}class Lr extends fe{constructor(n,t,r,i,o=()=>{}){super(n,t,r,{title:"GALAXY MAP",tabs:["MAP","ROUTE"],navOptions:[{id:"back",label:"BACK"}],onMenu:o}),this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.lastTop=we+5,this.onBack=i,this.publicSystems=Ai().sort((s,a)=>s.distanceFromSol-a.distanceFromSol),this.otherSystems=this.publicSystems.filter(s=>s.id!==r.systemId),this.mapBrowsingSystemId=r.systemId}onTabChange(n){this.searchText=""}handleCharInput(n){if(this.activeTabIdx!==0)return;const t=n.charCodeAt(0);n==="\b"||n===""?this.searchText=this.searchText.slice(0,-1):t>=32&&t<127&&(this.searchText+=n.toUpperCase(),this.mapCursorIdx=0)}handleAction(n){if(n==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}this.activeTabIdx===0?this.handleMapAction(n):this.handleRouteAction(n)}handleNavTap(n){n==="back"&&(this.searchText="",this.activated=!0,this.onBack())}handleTap(n,t){const r=this.lastTop,i=r+Wn,o=r+jn;if(this.activeTabIdx===0&&t>=i&&t<o){const s=this.getMapNeighbors(),a=t-i;a>=0&&a<s.length&&(this.mapBrowsingSystemId=s[a].id,this.mapCursorIdx=0,this.searchText="")}else if(this.activeTabIdx===1){const s=r+3,a=r+9;if(t>=s&&t<=a){const l=t-s;l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}}}getMapNeighbors(){const t=un(this.mapBrowsingSystemId).map(r=>{const i=r.from===this.mapBrowsingSystemId?r.to:r.from,o=this.publicSystems.find(a=>a.id===i),s=r.distance;return o?{sys:o,dist:s}:null}).filter(r=>r!==null).sort((r,i)=>r.dist-i.dist).map(r=>r.sys);return this.searchText.length===0?t:t.filter(r=>r.name.toUpperCase().includes(this.searchText))}handleMapAction(n){const t=this.getMapNeighbors(),r=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(n==="UP")this.mapCursorIdx=Math.max(0,r-1);else if(n==="DOWN")this.mapCursorIdx=Math.min(t.length-1,r+1);else if(n==="SELECT"){const i=t[r];if(!i)return;this.mapBrowsingSystemId=i.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(n){n==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):n==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const n=this.otherSystems[this.routeDestIdx];return n?Gn(this.player.systemId,n.id):null}renderContent(n,t,r){this.lastTop=t;const i=n.length>0?n[0].length:0;this.activeTabIdx===0?this.renderMapTab(n,t,r,i):this.renderRouteTab(n,t,r,i)}renderMapTab(n,t,r,i){const o=this.publicSystems.find(p=>p.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!o)return;const s=t+xr,a=t+Wn,l=t+jn,c=t+Cr;this.renderChart(n,o,t),Ee(n,s,i);const h=this.getMapNeighbors(),d=Math.min(this.mapCursorIdx,Math.max(0,h.length-1));this.renderNeighborList(n,i,o,h,d,a,l),Ee(n,l,i),this.renderInfo(n,i,o,h[d]??null,c),this.searchText.length>0&&f(n,c+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(n,t,r){var h;const i=this.getMapNeighbors(),o=r+vr,s=r+wr,a=r+kr,l=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(f(n,s,Ne,ve(t.name,Fe),l,"black"),t.id===this.player.systemId){const d=Ne+Fe,p=((h=n[0])==null?void 0:h.length)??40;d<p&&(n[s][d]={char:"*",fg:"bright-yellow",bg:"black"})}const c=["left","right","top","bottom"];for(let d=0;d<Math.min(i.length,4);d++){const p=i[d],u=c[d],m=p.id===this.player.systemId?"bright-yellow":"white";if(u==="left")f(n,s,Tr,ve(p.name,Ar),m,"black"),n[s][Sr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="right")f(n,s,Mr,ve(p.name,Er),m,"black"),n[s][Ir]={char:"-",fg:"bright-black",bg:"black"};else if(u==="top"){f(n,o,Ne,ve(p.name,Fe),m,"black");for(let g=o+1;g<s;g++)n[g][Kn]={char:"|",fg:"bright-black",bg:"black"}}else{f(n,a,Ne,ve(p.name,Fe),m,"black");for(let g=s+1;g<a;g++)n[g][Kn]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(n,t,r,i,o,s,a){for(let l=0;l<i.length&&l<a-s;l++){const c=i[l],h=s+l,d=l===o,u=c.id===this.player.systemId?"bright-yellow":d?"bright-cyan":"white",m=d?"> ":"  ",g=Oe(r.id,c.id),y=g?`${g.distance}LY  ${g.stability}`:"",x=t-4-y.length;f(n,h,2,m+c.name.toUpperCase().slice(0,x-2),u,"black"),y&&f(n,h,t-2-y.length,y,"bright-black","black")}}renderInfo(n,t,r,i,o){const a=r.id===this.player.systemId?"* Current location":r.name.toUpperCase();if(f(n,o,2,`Zone: ${r.zone}  Sec: ${r.security}  ${a}`.slice(0,t-4),"bright-black","black"),!i)return;const l=Oe(r.id,i.id);if(!l)return;const c=Gn(this.player.systemId,i.id),h=c?c.length===1?"(your location)":`${c.length-1} hop${c.length-1!==1?"s":""} from you`:"(unreachable)";f(n,o+1,2,`${i.name.toUpperCase()}  ${l.distance}LY  ${h}`.slice(0,t-4),"bright-black","black")}renderRouteTab(n,t,r,i){var x,M;const o=t,s=t+2,a=t+3,l=7,c=a+l,h=c+1,d=h+6,p=this.publicSystems.find(k=>k.id===this.player.systemId);f(n,o,2,"FROM:","bright-black","black"),f(n,o,8,(p==null?void 0:p.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),f(n,s,2,"TO:","bright-black","black");const u=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-l));for(let k=0;k<l;k++){const A=u+k;if(A>=this.otherSystems.length)break;const v=this.otherSystems[A],_=A===this.routeDestIdx,b=_?"bright-cyan":"white",C=_?"> ":"  ";f(n,a+k,2,C+v.name.toUpperCase(),b,"black")}Ee(n,c,i),Ee(n,d,i);const m=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!m){f(n,h,2,"No route found","bright-red","black");return}const y=m.length-1;f(n,h,2,`Route: ${y} hop${y!==1?"s":""}`,"bright-white","black");for(let k=0;k<y;k++){const A=Oe(m[k],m[k+1]);if(!A)continue;const v=h+1+k;if(v>=d)break;const _=(((x=this.publicSystems.find(C=>C.id===m[k]))==null?void 0:x.name)??m[k]).toUpperCase().slice(0,9),b=(((M=this.publicSystems.find(C=>C.id===m[k+1]))==null?void 0:M.name)??m[k+1]).toUpperCase().slice(0,9);f(n,v,4,`${_} -> ${b}  ${A.distance}LY  ${A.stability}`.slice(0,i-6),"white","black")}}}class te extends fe{constructor(n,t,r,i){const o={onAction:()=>{}};super(o,t,n,{navOptions:[]}),this.elapsed=0,this.arrived=!1,this.duration=r,this.onComplete=i}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const Nr=["[. . .]","[: : :]","[* * *]"],Yn=5e3;class Fr extends te{constructor(n,t,r){super(n,t,Yn,r)}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/500)%3,a=Math.ceil((Yn-this.elapsed)/1e3),l=Math.max(1,Math.min(5,a)),c=Ue(this.player.systemId),h=c?c.name.toUpperCase():this.player.systemId.toUpperCase();I(n,o-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),I(n,o-1,"DESTINATION:","bright-black","black"),I(n,o,h,"bright-white","black"),I(n,o+2,Nr[s],"bright-black","black"),I(n,o+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const qn=2e3,Or=["[ —   ]","[  —  ]","[   — ]"];class Vn extends te{constructor(n,t,r,i){super(n,t,qn,r),this.targetLabel=i}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((qn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a)),c=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const h=this.player.destinationId?G(this.player.destinationId):null;return h?h.name.toUpperCase():"UNKNOWN"})();I(n,o-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),I(n,o-1,"HEADING TO:","bright-black","black"),I(n,o,c,"bright-white","black"),I(n,o+2,Or[s],"bright-black","black"),I(n,o+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const zn=2500,Dr=["v","vv","vvv"];class Pr extends te{constructor(n,t,r){super(n,t,zn,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((zn-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));I(n,o-3,"[ LANDING SEQUENCE ]","bright-green","black"),I(n,o+2,Dr[s],"bright-black","black"),I(n,o+4,`TOUCHDOWN IN ${l}S`,"bright-black","black")}}const Qn=2500,Ur=[">",">>",">>>"];class Br extends te{constructor(n,t,r){super(n,t,Qn,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((Qn-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));I(n,o-3,"[ APPROACH LOCKED ]","bright-yellow","black"),I(n,o+2,Ur[s],"bright-black","black"),I(n,o+4,`CLAMPING IN ${l}S`,"bright-black","black")}}const Xn=1500,Hr=["^","^^","^^^"];class $r extends te{constructor(n,t,r){super(n,t,Xn,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((Xn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));I(n,o-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),I(n,o+2,Hr[s],"bright-black","black"),I(n,o+4,`CLEAR IN ${l}S`,"bright-black","black")}}const Jn=1500,Gr=["<","<<","<<<"];class Wr extends te{constructor(n,t,r){super(n,t,Jn,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((Jn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));I(n,o-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),I(n,o+2,Gr[s],"bright-black","black"),I(n,o+4,`DEPARTING IN ${l}S`,"bright-black","black")}}const Zn=1500,jr=["→","→→","→→→"];class Kr extends te{constructor(n,t,r){super(n,t,Zn,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((Zn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));I(n,o-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),I(n,o+2,jr[s],"bright-black","black"),I(n,o+4,`DOCKING IN ${l}S`,"bright-black","black")}}const et=1500,Yr=["←","←←","←←←"];class qr extends te{constructor(n,t,r){super(n,t,et,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((et-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));I(n,o-3,"[ DEPARTING BERTH ]","bright-cyan","black"),I(n,o+2,Yr[s],"bright-black","black"),I(n,o+4,`CLEAR IN ${l}S`,"bright-black","black")}}function Vr(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function zr(e,n){return Math.floor(e()*n)}function ue(e,n){return n[zr(e,n.length)]}function xt(e,n){const{special:t,firstNames:r,lastNames:i}=n.npcNames;if(e()<$().npc.specialNameChance&&t.length>0)return{giverName:ue(e,t)};const o=r.length>0?ue(e,r):"Unknown",s=i.length>0?ue(e,i):"Agent";return{giverName:`${o} ${s}`}}function Qr(e,n){return n.destinations.filter(t=>t.id!==e.id)}function Xr(e){return e.commodities.filter(n=>n.legal)}function Jr(e,n,t,r){var m;const i=t.deliveryItems;if(i.length===0)return null;const o=Qr(n,t);if(o.length===0)return null;const s=ue(e,i),a=ue(e,o),l=xt(e,t),{deliveryBaseReward:c,deliveryRandomReward:h}=$().missions,d=Math.floor(s.weightKg*1.5),p=c+d+Math.floor(e()*h),u=n.owningFactionId?(m=N().factions.find(g=>g.id===n.owningFactionId&&je(g)))==null?void 0:m.id:void 0;return{...l,giverFactionId:u,id:r,type:"delivery",title:s.name,description:`A package needs transporting. Pick up the ${s.name} from ${n.name} and deliver it to ${a.name}. Handle with care.`,reward:p,issuingDestinationId:n.id,itemName:s.name,itemWeightKg:s.weightKg,pickupDestinationId:n.id,deliveryDestinationId:a.id}}function Zr(e,n,t,r){var v;const i=Xr(t);if(i.length===0)return null;const o=n.goodsBias.map(_=>_.toLowerCase()),s=[];for(const _ of i){const b=o.some(C=>_.category.includes(C)||_.id.includes(C)||C.includes(_.category));s.push(_),b&&s.push(_)}const{supplyRequirementsMin:a,supplyRequirementsMax:l,supplyQtyMin:c,supplyQtyMax:h}=$().missions,d=a+Math.floor(e()*(l-a+1)),p=[],u=new Set;for(let _=0;_<d;_++){let b=0;for(;b<10;){const C=ue(e,s);if(!u.has(C.id)){u.add(C.id);const R=c+Math.floor(e()*(h-c+1));p.push({commodityId:C.id,qty:R});break}b++}}if(p.length===0)return null;const m=p.reduce((_,b)=>{const C=t.commodities.find(R=>R.id===b.commodityId);return _+((C==null?void 0:C.basePrice)??100)*b.qty},0),{supplyRewardMargin:g,supplyRandomReward:y}=$().missions,x=Math.floor(m*g)+Math.floor(e()*y),M=xt(e,t),k=p.map(_=>{const b=t.commodities.find(C=>C.id===_.commodityId);return`${_.qty}× ${(b==null?void 0:b.name)??_.commodityId}`}).join(", "),A=n.owningFactionId?(v=N().factions.find(_=>_.id===n.owningFactionId&&je(_)))==null?void 0:v.id:void 0;return{...M,giverFactionId:A,id:r,type:"supply",title:n.name,description:`${n.name} needs supplies. Deliver ${k} to fulfil the contract.`,reward:x,issuingDestinationId:n.id,requirements:p,deliveryDestinationId:n.id}}function eo(e,n,t){const r=Vr(t),{boardCountMin:i,boardCountMax:o,deliveryChance:s}=$().missions,a=i+Math.floor(r()*(o-i+1)),l=[];for(let c=0;c<a;c++){const h=`m-${(t>>>0).toString(16)}-${c}`,p=r()<s?Jr(r,e,n,h):Zr(r,e,n,h);p&&l.push(p)}return l}const no=100;class to{constructor(n,t,r){this.sceneBeforeMenu=null,this.traderStockCache=new Map,this.missionBoardCache=new Map,this.renderer=n,this.input=t,this.context=r;const i=Ci(),o=wt(i.startingShip);this.player=new Ni({shipId:i.startingShip,driveId:o.defaultJumpDrive,credits:i.player.startingCredits,systemId:i.startingLocation.system,destinationId:i.startingLocation.destination}),this.currentScene=new Sn(this.input,this.context,this.player,()=>this.goToStory())}tick(n){const t=Math.min(n,no),r=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(r),this.renderer.drawBuffer(r)}makeBuffer(){const n=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:n},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(n){const t=Date.now(),r=this.traderStockCache.get(n),i=$();if(r&&t-r.generatedAt<i.trading.stockTtlMs)return r.entries;const o=Ti(),{stockCountMin:s,stockCountMax:a,stockQtyMin:l,stockQtyMax:c}=i.trading,h=s+Math.floor(Math.random()*(a-s+1)),d=[...o];for(let u=d.length-1;u>0;u--){const m=Math.floor(Math.random()*(u+1));[d[u],d[m]]=[d[m],d[u]]}const p=d.slice(0,h).map(u=>({commodityId:u.id,qty:l+Math.floor(Math.random()*(c-l+1))}));return this.traderStockCache.set(n,{entries:p,generatedAt:t}),p}getOrCreateMissionBoard(n){const t=Date.now(),r=this.missionBoardCache.get(n);if(r&&t-r.generatedAt<$().missions.missionTtlMs)return r.specs;const i=G(n),o=N(),s=Math.floor(Math.random()*4294967295),a=eo(i,o,s);return this.missionBoardCache.set(n,{specs:a,generatedAt:t}),a}onBuy(n,t,r){if(t<=0)return;const i=r.findIndex(c=>c.commodityId===n);if(i<0)return;const o=r[i];if(t>o.qty)return;const s=se(n);if(!s)return;const a=t*s.basePrice;this.player.credits<a||this.player.cargoWeightKg+t*s.weightKg>this.player.cargoCapacity||(this.player.spendCredits(a),this.player.addCargo(n,t),o.qty-=t,o.qty<=0&&r.splice(i,1))}onSell(n,t,r){if(t<=0)return;const i=this.player.cargoHold.find(l=>l.commodityId===n);if(!i||i.qty<t)return;const o=se(n);if(!o)return;const s=t*o.basePrice;this.player.addCredits(s),this.player.removeCargo(n,t);const a=r.find(l=>l.commodityId===n);a?a.qty+=t:r.push({commodityId:n,qty:t})}goToMainMenu(){this.currentScene=new Sn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new Wi(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new Ki(this.input,this.context,this.player,this.player.destinationId,(n,t)=>{this.player.spendCredits(n),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToLandOrDock(){var t;const n=(t=G(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new Pr(this.player,this.context,()=>this.goToStation()):n==="asteroid"?this.currentScene=new Br(this.player,this.context,()=>this.goToStation()):this.currentScene=new Kr(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const n=(t=G(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new $r(this.player,this.context,()=>this.goToShip()):n==="asteroid"?this.currentScene=new Wr(this.player,this.context,()=>this.goToShip()):this.currentScene=new qr(this.player,this.context,()=>this.goToShip())}goToTrader(){const n=this.player.destinationId,t=this.getOrCreateTraderStock(n);this.currentScene=new Yi(this.input,this.context,this.player,n,t,(r,i)=>this.onBuy(r,i,t),(r,i)=>this.onSell(r,i,t),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionBoard(){const n=this.player.destinationId;this.currentScene=new Vi(this.input,this.context,this.player,n,()=>this.getOrCreateMissionBoard(n),t=>this.goToMissionDetail(t,n),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionDetail(n,t){this.currentScene=new Qi(this.input,this.context,this.player,n,r=>this.onMissionAccepted(n,r,t),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock())}onMissionAccepted(n,t,r){const i=this.missionBoardCache.get(r);if(i){const o=i.specs.findIndex(s=>s.id===n.id);o>=0&&i.specs.splice(o,1)}this.player.acceptMission(n,t),this.goToMissionBoard()}goToShip(){this.currentScene=new br(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo(),()=>this.goToGlobalMenu())}goToCargo(){this.currentScene=new _r(this.input,this.context,this.player,()=>this.goToShip(),()=>this.goToGlobalMenu())}buildMenuEntries(){return[{label:"MISSIONS",action:()=>this.goToMissionLog()},{label:"REPUTATION",action:()=>this.goToReputation()}]}goToMissionLog(){this.currentScene=new Pi(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToReputation(){this.currentScene=new Gi(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToGlobalMenuFromSubScene(){this.currentScene=new Mn(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}goToGlobalMenu(){this.sceneBeforeMenu=this.currentScene,"suspend"in this.currentScene&&this.currentScene.suspend(),this.currentScene=new Mn(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}returnFromMenu(){const n=this.sceneBeforeMenu;this.sceneBeforeMenu=null,n!==null?("resume"in n&&n.resume(),this.currentScene=n):this.goToShip()}goToTravelMenu(){this.currentScene=new $n(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu())}goToArrival(){this.currentScene=new $n(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu())}goToGalaxyMap(){this.currentScene=new Lr(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToGlobalMenu())}goToFlyIntoSpace(){this.player.undock(),this.currentScene=new Vn(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(n){this.player.dock(n),this.currentScene=new Vn(this.player,this.context,()=>this.goToShip())}onJumpSelected(n){const t=Oe(this.player.systemId,n),r=vt(this.player.driveId),i=Math.ceil($().fuel.consumptionPerLy*t.distance*r.fuelEfficiency);this.player.consumeFuel(i),this.player.jumpTo(n),this.currentScene=new Fr(this.player,this.context,()=>this.goToArrival())}}const io=`---
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
`,ro=`---
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
`,oo=`---
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
`,so=`---
id: blackwake-yard
name: Blackwake Yard
system: wolf-359
location_type: orbital
type: black-market
owning_faction: grey-market-cartel

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
`,ao=`---
id: ceti-landfall
name: Ceti Landfall
system: tau-ceti
location_type: surface
type: civilian
owning_faction: eridani-colonial-council

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
`,lo=`---
id: drift-market
name: Drift Market
system: wolf-359
location_type: orbital
type: black-market
owning_faction: grey-market-cartel

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
`,co=`---
id: elysium-station
name: Elysium Station
system: sol
location_type: orbital
type: civilian
owning_faction: helios-directorate

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
`,ho=`---
id: eridani-anchorage
name: Eridani Anchorage
system: epsilon-eridani
location_type: asteroid
type: civilian
owning_faction: eridani-colonial-council

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
`,uo=`---
id: foundries-platform
name: Foundries Platform
system: sirius
location_type: asteroid
type: civilian
owning_faction: helios-directorate

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
`,po=`---
id: galileo-transfer
name: Galileo Transfer Hub
system: sol
location_type: orbital
type: civilian
owning_faction: terran-union

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
`,mo=`---
id: hestia-ring
name: Hestia Ring
system: alpha-centauri
location_type: orbital
type: civilian
owning_faction: centauri-trade-league

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
`,fo=`---
id: keelhaul-station
name: Keelhaul Station
system: epsilon-eridani
location_type: orbital
type: military
owning_faction: eridani-colonial-council

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
`,go=`---
id: kepler-yard
name: Kepler Yard
system: barnards-star
location_type: orbital
type: civilian
owning_faction: independent-miners-guild

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
`,yo=`---
id: mars-anchor
name: Mars Anchor
system: sol
location_type: orbital
type: civilian
owning_faction: helios-directorate

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
`,bo=`---
id: meridian-station
name: Meridian Station
system: sirius
location_type: orbital
type: civilian
owning_faction: centauri-trade-league

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
`,_o=`---
id: new-horizon-port
name: New Horizon Port
system: alpha-centauri
location_type: orbital
type: civilian
owning_faction: centauri-trade-league

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
`,vo=`---
id: orrery-anchorage
name: Orrery Anchorage
system: procyon
location_type: deep-space
type: civilian
owning_faction: procyon-institute

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
`,wo=`---
id: redline-station
name: Redline Station
system: barnards-star
location_type: orbital
type: civilian
owning_faction: free-captains

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
`,ko=`---
id: tycho-orbital
name: Tycho Orbital
system: sol
location_type: orbital
type: military
owning_faction: terran-union

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
`,xo=`---
id: veil-station
name: Veil Station
system: procyon
location_type: orbital
type: research
owning_faction: procyon-institute

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
`,Co=`---
id: waypoint-ceti
name: Waypoint Ceti
system: tau-ceti
location_type: orbital
type: civilian
owning_faction: eridani-colonial-council

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
`,To=`---
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
`,Ao=`---
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
`,So=`---
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
`,Io=`---
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
`,Mo=`---
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
`,Ro=`---
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
`,Lo=`---
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
`,No=`---
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
`,Fo=`# Galaxy Map

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
`,Do=`---
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
`,Po=`---
id: balance

npc:
  special_name_chance: 0.3

missions:
  board_count_min: 3
  board_count_max: 6
  mission_ttl_ms: 900000
  delivery_chance: 0.6
  delivery_base_reward: 200
  delivery_random_reward: 200
  supply_reward_margin: 0.4
  supply_random_reward: 150
  supply_requirements_min: 1
  supply_requirements_max: 2
  supply_qty_min: 1
  supply_qty_max: 4

trading:
  stock_count_min: 4
  stock_count_max: 6
  stock_qty_min: 1
  stock_qty_max: 8
  stock_ttl_ms: 120000

fuel:
  price_per_litre: 10
  consumption_per_ly: 5

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
---
`,Uo=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,Bo=`---
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
`,Ho=`---
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
`,Go=`---
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
`,Wo=`---
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
`,Ko=`---
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
`,Yo=`---
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
`,qo=`---
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
`,Vo=`---
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
`,zo=`---
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
`,Xo=`---
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
`,Jo=`---
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
`,Zo=`---
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
`,es=`---
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
`,ns=`---
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
`,ts=`---
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
`;var F={},Ce={},Y={};function Ct(e){return typeof e>"u"||e===null}function is(e){return typeof e=="object"&&e!==null}function rs(e){return Array.isArray(e)?e:Ct(e)?[]:[e]}function os(e,n){var t,r,i,o;if(n)for(o=Object.keys(n),t=0,r=o.length;t<r;t+=1)i=o[t],e[i]=n[i];return e}function ss(e,n){var t="",r;for(r=0;r<n;r+=1)t+=e;return t}function as(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}Y.isNothing=Ct;Y.isObject=is;Y.toArray=rs;Y.repeat=ss;Y.isNegativeZero=as;Y.extend=os;function ke(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}ke.prototype=Object.create(Error.prototype);ke.prototype.constructor=ke;ke.prototype.toString=function(n){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!n&&this.mark&&(t+=" "+this.mark.toString()),t};var Te=ke,nt=Y;function gn(e,n,t,r,i){this.name=e,this.buffer=n,this.position=t,this.line=r,this.column=i}gn.prototype.getSnippet=function(n,t){var r,i,o,s,a;if(!this.buffer)return null;for(n=n||4,t=t||75,r="",i=this.position;i>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(i-1))===-1;)if(i-=1,this.position-i>t/2-1){r=" ... ",i+=5;break}for(o="",s=this.position;s<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s))===-1;)if(s+=1,s-this.position>t/2-1){o=" ... ",s-=5;break}return a=this.buffer.slice(i,s),nt.repeat(" ",n)+r+a+o+`
`+nt.repeat(" ",n+this.position-i+r.length)+"^"};gn.prototype.toString=function(n){var t,r="";return this.name&&(r+='in "'+this.name+'" '),r+="at line "+(this.line+1)+", column "+(this.column+1),n||(t=this.getSnippet(),t&&(r+=`:
`+t)),r};var ls=gn,tt=Te,cs=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],ds=["scalar","sequence","mapping"];function hs(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(r){n[String(r)]=t})}),n}function us(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(cs.indexOf(t)===-1)throw new tt('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=hs(n.styleAliases||null),ds.indexOf(this.kind)===-1)throw new tt('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var P=us,it=Y,De=Te,ps=P;function cn(e,n,t){var r=[];return e.include.forEach(function(i){t=cn(i,n,t)}),e[n].forEach(function(i){t.forEach(function(o,s){o.tag===i.tag&&o.kind===i.kind&&r.push(s)}),t.push(i)}),t.filter(function(i,o){return r.indexOf(o)===-1})}function ms(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,t;function r(i){e[i.kind][i.tag]=e.fallback[i.tag]=i}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(r);return e}function ce(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new De("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=cn(this,"implicit",[]),this.compiledExplicit=cn(this,"explicit",[]),this.compiledTypeMap=ms(this.compiledImplicit,this.compiledExplicit)}ce.DEFAULT=null;ce.create=function(){var n,t;switch(arguments.length){case 1:n=ce.DEFAULT,t=arguments[0];break;case 2:n=arguments[0],t=arguments[1];break;default:throw new De("Wrong number of arguments for Schema.create function")}if(n=it.toArray(n),t=it.toArray(t),!n.every(function(r){return r instanceof ce}))throw new De("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(r){return r instanceof ps}))throw new De("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new ce({include:n,explicit:t})};var ge=ce,fs=P,gs=new fs("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),ys=P,bs=new ys("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),_s=P,vs=new _s("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),ws=ge,yn=new ws({explicit:[gs,bs,vs]}),ks=P;function xs(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function Cs(){return null}function Ts(e){return e===null}var As=new ks("tag:yaml.org,2002:null",{kind:"scalar",resolve:xs,construct:Cs,predicate:Ts,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Ss=P;function Is(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function Ms(e){return e==="true"||e==="True"||e==="TRUE"}function Es(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var Rs=new Ss("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Is,construct:Ms,predicate:Es,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),Ls=Y,Ns=P;function Fs(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function Os(e){return 48<=e&&e<=55}function Ds(e){return 48<=e&&e<=57}function Ps(e){if(e===null)return!1;var n=e.length,t=0,r=!1,i;if(!n)return!1;if(i=e[t],(i==="-"||i==="+")&&(i=e[++t]),i==="0"){if(t+1===n)return!0;if(i=e[++t],i==="b"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(i!=="0"&&i!=="1")return!1;r=!0}return r&&i!=="_"}if(i==="x"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(!Fs(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}for(;t<n;t++)if(i=e[t],i!=="_"){if(!Os(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}if(i==="_")return!1;for(;t<n;t++)if(i=e[t],i!=="_"){if(i===":")break;if(!Ds(e.charCodeAt(t)))return!1;r=!0}return!r||i==="_"?!1:i!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function Us(e){var n=e,t=1,r,i,o=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),r=n[0],(r==="-"||r==="+")&&(r==="-"&&(t=-1),n=n.slice(1),r=n[0]),n==="0"?0:r==="0"?n[1]==="b"?t*parseInt(n.slice(2),2):n[1]==="x"?t*parseInt(n,16):t*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(s){o.unshift(parseInt(s,10))}),n=0,i=1,o.forEach(function(s){n+=s*i,i*=60}),t*n):t*parseInt(n,10)}function Bs(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!Ls.isNegativeZero(e)}var Hs=new Ns("tag:yaml.org,2002:int",{kind:"scalar",resolve:Ps,construct:Us,predicate:Bs,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),Tt=Y,$s=P,Gs=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Ws(e){return!(e===null||!Gs.test(e)||e[e.length-1]==="_")}function js(e){var n,t,r,i;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,i=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(o){i.unshift(parseFloat(o,10))}),n=0,r=1,i.forEach(function(o){n+=o*r,r*=60}),t*n):t*parseFloat(n,10)}var Ks=/^[-+]?[0-9]+e/;function Ys(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(Tt.isNegativeZero(e))return"-0.0";return t=e.toString(10),Ks.test(t)?t.replace("e",".e"):t}function qs(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||Tt.isNegativeZero(e))}var Vs=new $s("tag:yaml.org,2002:float",{kind:"scalar",resolve:Ws,construct:js,predicate:qs,represent:Ys,defaultStyle:"lowercase"}),zs=ge,At=new zs({include:[yn],implicit:[As,Rs,Hs,Vs]}),Qs=ge,St=new Qs({include:[At]}),Xs=P,It=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Mt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Js(e){return e===null?!1:It.exec(e)!==null||Mt.exec(e)!==null}function Zs(e){var n,t,r,i,o,s,a,l=0,c=null,h,d,p;if(n=It.exec(e),n===null&&(n=Mt.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],r=+n[2]-1,i=+n[3],!n[4])return new Date(Date.UTC(t,r,i));if(o=+n[4],s=+n[5],a=+n[6],n[7]){for(l=n[7].slice(0,3);l.length<3;)l+="0";l=+l}return n[9]&&(h=+n[10],d=+(n[11]||0),c=(h*60+d)*6e4,n[9]==="-"&&(c=-c)),p=new Date(Date.UTC(t,r,i,o,s,a,l)),c&&p.setTime(p.getTime()-c),p}function ea(e){return e.toISOString()}var na=new Xs("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Js,construct:Zs,instanceOf:Date,represent:ea}),ta=P;function ia(e){return e==="<<"||e===null}var ra=new ta("tag:yaml.org,2002:merge",{kind:"scalar",resolve:ia});function Et(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var re;try{var oa=Et;re=oa("buffer").Buffer}catch{}var sa=P,bn=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function aa(e){if(e===null)return!1;var n,t,r=0,i=e.length,o=bn;for(t=0;t<i;t++)if(n=o.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;r+=6}return r%8===0}function la(e){var n,t,r=e.replace(/[\r\n=]/g,""),i=r.length,o=bn,s=0,a=[];for(n=0;n<i;n++)n%4===0&&n&&(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)),s=s<<6|o.indexOf(r.charAt(n));return t=i%4*6,t===0?(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)):t===18?(a.push(s>>10&255),a.push(s>>2&255)):t===12&&a.push(s>>4&255),re?re.from?re.from(a):new re(a):a}function ca(e){var n="",t=0,r,i,o=e.length,s=bn;for(r=0;r<o;r++)r%3===0&&r&&(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]),t=(t<<8)+e[r];return i=o%3,i===0?(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]):i===2?(n+=s[t>>10&63],n+=s[t>>4&63],n+=s[t<<2&63],n+=s[64]):i===1&&(n+=s[t>>2&63],n+=s[t<<4&63],n+=s[64],n+=s[64]),n}function da(e){return re&&re.isBuffer(e)}var ha=new sa("tag:yaml.org,2002:binary",{kind:"scalar",resolve:aa,construct:la,predicate:da,represent:ca}),ua=P,pa=Object.prototype.hasOwnProperty,ma=Object.prototype.toString;function fa(e){if(e===null)return!0;var n=[],t,r,i,o,s,a=e;for(t=0,r=a.length;t<r;t+=1){if(i=a[t],s=!1,ma.call(i)!=="[object Object]")return!1;for(o in i)if(pa.call(i,o))if(!s)s=!0;else return!1;if(!s)return!1;if(n.indexOf(o)===-1)n.push(o);else return!1}return!0}function ga(e){return e!==null?e:[]}var ya=new ua("tag:yaml.org,2002:omap",{kind:"sequence",resolve:fa,construct:ga}),ba=P,_a=Object.prototype.toString;function va(e){if(e===null)return!0;var n,t,r,i,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1){if(r=s[n],_a.call(r)!=="[object Object]"||(i=Object.keys(r),i.length!==1))return!1;o[n]=[i[0],r[i[0]]]}return!0}function wa(e){if(e===null)return[];var n,t,r,i,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1)r=s[n],i=Object.keys(r),o[n]=[i[0],r[i[0]]];return o}var ka=new ba("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:va,construct:wa}),xa=P,Ca=Object.prototype.hasOwnProperty;function Ta(e){if(e===null)return!0;var n,t=e;for(n in t)if(Ca.call(t,n)&&t[n]!==null)return!1;return!0}function Aa(e){return e!==null?e:{}}var Sa=new xa("tag:yaml.org,2002:set",{kind:"mapping",resolve:Ta,construct:Aa}),Ia=ge,Ae=new Ia({include:[St],implicit:[na,ra],explicit:[ha,ya,ka,Sa]}),Ma=P;function Ea(){return!0}function Ra(){}function La(){return""}function Na(e){return typeof e>"u"}var Fa=new Ma("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:Ea,construct:Ra,predicate:Na,represent:La}),Oa=P;function Da(e){if(e===null||e.length===0)return!1;var n=e,t=/\/([gim]*)$/.exec(e),r="";return!(n[0]==="/"&&(t&&(r=t[1]),r.length>3||n[n.length-r.length-1]!=="/"))}function Pa(e){var n=e,t=/\/([gim]*)$/.exec(e),r="";return n[0]==="/"&&(t&&(r=t[1]),n=n.slice(1,n.length-r.length-1)),new RegExp(n,r)}function Ua(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function Ba(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var Ha=new Oa("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:Da,construct:Pa,predicate:Ba,represent:Ua}),Be;try{var $a=Et;Be=$a("esprima")}catch{typeof window<"u"&&(Be=window.esprima)}var Ga=P;function Wa(e){if(e===null)return!1;try{var n="("+e+")",t=Be.parse(n,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function ja(e){var n="("+e+")",t=Be.parse(n,{range:!0}),r=[],i;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(o){r.push(o.name)}),i=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(r,n.slice(i[0]+1,i[1]-1)):new Function(r,"return "+n.slice(i[0],i[1]))}function Ka(e){return e.toString()}function Ya(e){return Object.prototype.toString.call(e)==="[object Function]"}var qa=new Ga("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:Wa,construct:ja,predicate:Ya,represent:Ka}),rt=ge,Ke=rt.DEFAULT=new rt({include:[Ae],explicit:[Fa,Ha,qa]}),J=Y,Rt=Te,Va=ls,Lt=Ae,za=Ke,ee=Object.prototype.hasOwnProperty,He=1,Nt=2,Ft=3,$e=4,rn=1,Qa=2,ot=3,Xa=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Ja=/[\x85\u2028\u2029]/,Za=/[,\[\]\{\}]/,Ot=/^(?:!|!!|![a-z\-]+!)$/i,Dt=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function st(e){return Object.prototype.toString.call(e)}function Q(e){return e===10||e===13}function oe(e){return e===9||e===32}function W(e){return e===9||e===32||e===10||e===13}function de(e){return e===44||e===91||e===93||e===123||e===125}function el(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function nl(e){return e===120?2:e===117?4:e===85?8:0}function tl(e){return 48<=e&&e<=57?e-48:-1}function at(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function il(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function Pt(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var Ut=new Array(256),Bt=new Array(256);for(var le=0;le<256;le++)Ut[le]=at(le)?1:0,Bt[le]=at(le);function rl(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||za,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function Ht(e,n){return new Rt(n,new Va(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function w(e,n){throw Ht(e,n)}function Ge(e,n){e.onWarning&&e.onWarning.call(null,Ht(e,n))}var lt={YAML:function(n,t,r){var i,o,s;n.version!==null&&w(n,"duplication of %YAML directive"),r.length!==1&&w(n,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(r[0]),i===null&&w(n,"ill-formed argument of the YAML directive"),o=parseInt(i[1],10),s=parseInt(i[2],10),o!==1&&w(n,"unacceptable YAML version of the document"),n.version=r[0],n.checkLineBreaks=s<2,s!==1&&s!==2&&Ge(n,"unsupported YAML version of the document")},TAG:function(n,t,r){var i,o;r.length!==2&&w(n,"TAG directive accepts exactly two arguments"),i=r[0],o=r[1],Ot.test(i)||w(n,"ill-formed tag handle (first argument) of the TAG directive"),ee.call(n.tagMap,i)&&w(n,'there is a previously declared suffix for "'+i+'" tag handle'),Dt.test(o)||w(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[i]=o}};function Z(e,n,t,r){var i,o,s,a;if(n<t){if(a=e.input.slice(n,t),r)for(i=0,o=a.length;i<o;i+=1)s=a.charCodeAt(i),s===9||32<=s&&s<=1114111||w(e,"expected valid JSON character");else Xa.test(a)&&w(e,"the stream contains non-printable characters");e.result+=a}}function ct(e,n,t,r){var i,o,s,a;for(J.isObject(t)||w(e,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(t),s=0,a=i.length;s<a;s+=1)o=i[s],ee.call(n,o)||(Pt(n,o,t[o]),r[o]=!0)}function he(e,n,t,r,i,o,s,a){var l,c;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),l=0,c=i.length;l<c;l+=1)Array.isArray(i[l])&&w(e,"nested arrays are not supported inside keys"),typeof i=="object"&&st(i[l])==="[object Object]"&&(i[l]="[object Object]");if(typeof i=="object"&&st(i)==="[object Object]"&&(i="[object Object]"),i=String(i),n===null&&(n={}),r==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)ct(e,n,o[l],t);else ct(e,n,o,t);else!e.json&&!ee.call(t,i)&&ee.call(n,i)&&(e.line=s||e.line,e.position=a||e.position,w(e,"duplicated mapping key")),Pt(n,i,o),delete t[i];return n}function _n(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):w(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function O(e,n,t){for(var r=0,i=e.input.charCodeAt(e.position);i!==0;){for(;oe(i);)i=e.input.charCodeAt(++e.position);if(n&&i===35)do i=e.input.charCodeAt(++e.position);while(i!==10&&i!==13&&i!==0);if(Q(i))for(_n(e),i=e.input.charCodeAt(e.position),r++,e.lineIndent=0;i===32;)e.lineIndent++,i=e.input.charCodeAt(++e.position);else break}return t!==-1&&r!==0&&e.lineIndent<t&&Ge(e,"deficient indentation"),r}function Ye(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||W(t)))}function vn(e,n){n===1?e.result+=" ":n>1&&(e.result+=J.repeat(`
`,n-1))}function ol(e,n,t){var r,i,o,s,a,l,c,h,d=e.kind,p=e.result,u;if(u=e.input.charCodeAt(e.position),W(u)||de(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(i=e.input.charCodeAt(e.position+1),W(i)||t&&de(i)))return!1;for(e.kind="scalar",e.result="",o=s=e.position,a=!1;u!==0;){if(u===58){if(i=e.input.charCodeAt(e.position+1),W(i)||t&&de(i))break}else if(u===35){if(r=e.input.charCodeAt(e.position-1),W(r))break}else{if(e.position===e.lineStart&&Ye(e)||t&&de(u))break;if(Q(u))if(l=e.line,c=e.lineStart,h=e.lineIndent,O(e,!1,-1),e.lineIndent>=n){a=!0,u=e.input.charCodeAt(e.position);continue}else{e.position=s,e.line=l,e.lineStart=c,e.lineIndent=h;break}}a&&(Z(e,o,s,!1),vn(e,e.line-l),o=s=e.position,a=!1),oe(u)||(s=e.position+1),u=e.input.charCodeAt(++e.position)}return Z(e,o,s,!1),e.result?!0:(e.kind=d,e.result=p,!1)}function sl(e,n){var t,r,i;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,r=i=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(Z(e,r,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)r=e.position,e.position++,i=e.position;else return!0;else Q(t)?(Z(e,r,i,!0),vn(e,O(e,!1,n)),r=i=e.position):e.position===e.lineStart&&Ye(e)?w(e,"unexpected end of the document within a single quoted scalar"):(e.position++,i=e.position);w(e,"unexpected end of the stream within a single quoted scalar")}function al(e,n){var t,r,i,o,s,a;if(a=e.input.charCodeAt(e.position),a!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=r=e.position;(a=e.input.charCodeAt(e.position))!==0;){if(a===34)return Z(e,t,e.position,!0),e.position++,!0;if(a===92){if(Z(e,t,e.position,!0),a=e.input.charCodeAt(++e.position),Q(a))O(e,!1,n);else if(a<256&&Ut[a])e.result+=Bt[a],e.position++;else if((s=nl(a))>0){for(i=s,o=0;i>0;i--)a=e.input.charCodeAt(++e.position),(s=el(a))>=0?o=(o<<4)+s:w(e,"expected hexadecimal character");e.result+=il(o),e.position++}else w(e,"unknown escape sequence");t=r=e.position}else Q(a)?(Z(e,t,r,!0),vn(e,O(e,!1,n)),t=r=e.position):e.position===e.lineStart&&Ye(e)?w(e,"unexpected end of the document within a double quoted scalar"):(e.position++,r=e.position)}w(e,"unexpected end of the stream within a double quoted scalar")}function ll(e,n){var t=!0,r,i=e.tag,o,s=e.anchor,a,l,c,h,d,p={},u,m,g,y;if(y=e.input.charCodeAt(e.position),y===91)l=93,d=!1,o=[];else if(y===123)l=125,d=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),y=e.input.charCodeAt(++e.position);y!==0;){if(O(e,!0,n),y=e.input.charCodeAt(e.position),y===l)return e.position++,e.tag=i,e.anchor=s,e.kind=d?"mapping":"sequence",e.result=o,!0;t||w(e,"missed comma between flow collection entries"),m=u=g=null,c=h=!1,y===63&&(a=e.input.charCodeAt(e.position+1),W(a)&&(c=h=!0,e.position++,O(e,!0,n))),r=e.line,pe(e,n,He,!1,!0),m=e.tag,u=e.result,O(e,!0,n),y=e.input.charCodeAt(e.position),(h||e.line===r)&&y===58&&(c=!0,y=e.input.charCodeAt(++e.position),O(e,!0,n),pe(e,n,He,!1,!0),g=e.result),d?he(e,o,p,m,u,g):c?o.push(he(e,null,p,m,u,g)):o.push(u),O(e,!0,n),y=e.input.charCodeAt(e.position),y===44?(t=!0,y=e.input.charCodeAt(++e.position)):t=!1}w(e,"unexpected end of the stream within a flow collection")}function cl(e,n){var t,r,i=rn,o=!1,s=!1,a=n,l=0,c=!1,h,d;if(d=e.input.charCodeAt(e.position),d===124)r=!1;else if(d===62)r=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)rn===i?i=d===43?ot:Qa:w(e,"repeat of a chomping mode identifier");else if((h=tl(d))>=0)h===0?w(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?w(e,"repeat of an indentation width identifier"):(a=n+h-1,s=!0);else break;if(oe(d)){do d=e.input.charCodeAt(++e.position);while(oe(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!Q(d)&&d!==0)}for(;d!==0;){for(_n(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!s||e.lineIndent<a)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>a&&(a=e.lineIndent),Q(d)){l++;continue}if(e.lineIndent<a){i===ot?e.result+=J.repeat(`
`,o?1+l:l):i===rn&&o&&(e.result+=`
`);break}for(r?oe(d)?(c=!0,e.result+=J.repeat(`
`,o?1+l:l)):c?(c=!1,e.result+=J.repeat(`
`,l+1)):l===0?o&&(e.result+=" "):e.result+=J.repeat(`
`,l):e.result+=J.repeat(`
`,o?1+l:l),o=!0,s=!0,l=0,t=e.position;!Q(d)&&d!==0;)d=e.input.charCodeAt(++e.position);Z(e,t,e.position,!1)}return!0}function dt(e,n){var t,r=e.tag,i=e.anchor,o=[],s,a=!1,l;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),l=e.input.charCodeAt(e.position);l!==0&&!(l!==45||(s=e.input.charCodeAt(e.position+1),!W(s)));){if(a=!0,e.position++,O(e,!0,-1)&&e.lineIndent<=n){o.push(null),l=e.input.charCodeAt(e.position);continue}if(t=e.line,pe(e,n,Ft,!1,!0),o.push(e.result),O(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&l!==0)w(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return a?(e.tag=r,e.anchor=i,e.kind="sequence",e.result=o,!0):!1}function dl(e,n,t){var r,i,o,s,a=e.tag,l=e.anchor,c={},h={},d=null,p=null,u=null,m=!1,g=!1,y;for(e.anchor!==null&&(e.anchorMap[e.anchor]=c),y=e.input.charCodeAt(e.position);y!==0;){if(r=e.input.charCodeAt(e.position+1),o=e.line,s=e.position,(y===63||y===58)&&W(r))y===63?(m&&(he(e,c,h,d,p,null),d=p=u=null),g=!0,m=!0,i=!0):m?(m=!1,i=!0):w(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,y=r;else if(pe(e,t,Nt,!1,!0))if(e.line===o){for(y=e.input.charCodeAt(e.position);oe(y);)y=e.input.charCodeAt(++e.position);if(y===58)y=e.input.charCodeAt(++e.position),W(y)||w(e,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(he(e,c,h,d,p,null),d=p=u=null),g=!0,m=!1,i=!1,d=e.tag,p=e.result;else if(g)w(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=a,e.anchor=l,!0}else if(g)w(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=a,e.anchor=l,!0;else break;if((e.line===o||e.lineIndent>n)&&(pe(e,n,$e,!0,i)&&(m?p=e.result:u=e.result),m||(he(e,c,h,d,p,u,o,s),d=p=u=null),O(e,!0,-1),y=e.input.charCodeAt(e.position)),e.lineIndent>n&&y!==0)w(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return m&&he(e,c,h,d,p,null),g&&(e.tag=a,e.anchor=l,e.kind="mapping",e.result=c),g}function hl(e){var n,t=!1,r=!1,i,o,s;if(s=e.input.charCodeAt(e.position),s!==33)return!1;if(e.tag!==null&&w(e,"duplication of a tag property"),s=e.input.charCodeAt(++e.position),s===60?(t=!0,s=e.input.charCodeAt(++e.position)):s===33?(r=!0,i="!!",s=e.input.charCodeAt(++e.position)):i="!",n=e.position,t){do s=e.input.charCodeAt(++e.position);while(s!==0&&s!==62);e.position<e.length?(o=e.input.slice(n,e.position),s=e.input.charCodeAt(++e.position)):w(e,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!W(s);)s===33&&(r?w(e,"tag suffix cannot contain exclamation marks"):(i=e.input.slice(n-1,e.position+1),Ot.test(i)||w(e,"named tag handle cannot contain such characters"),r=!0,n=e.position+1)),s=e.input.charCodeAt(++e.position);o=e.input.slice(n,e.position),Za.test(o)&&w(e,"tag suffix cannot contain flow indicator characters")}return o&&!Dt.test(o)&&w(e,"tag name cannot contain such characters: "+o),t?e.tag=o:ee.call(e.tagMap,i)?e.tag=e.tagMap[i]+o:i==="!"?e.tag="!"+o:i==="!!"?e.tag="tag:yaml.org,2002:"+o:w(e,'undeclared tag handle "'+i+'"'),!0}function ul(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&w(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!W(t)&&!de(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&w(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function pl(e){var n,t,r;if(r=e.input.charCodeAt(e.position),r!==42)return!1;for(r=e.input.charCodeAt(++e.position),n=e.position;r!==0&&!W(r)&&!de(r);)r=e.input.charCodeAt(++e.position);return e.position===n&&w(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),ee.call(e.anchorMap,t)||w(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],O(e,!0,-1),!0}function pe(e,n,t,r,i){var o,s,a,l=1,c=!1,h=!1,d,p,u,m,g;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=s=a=$e===t||Ft===t,r&&O(e,!0,-1)&&(c=!0,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)),l===1)for(;hl(e)||ul(e);)O(e,!0,-1)?(c=!0,a=o,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)):a=!1;if(a&&(a=c||i),(l===1||$e===t)&&(He===t||Nt===t?m=n:m=n+1,g=e.position-e.lineStart,l===1?a&&(dt(e,g)||dl(e,g,m))||ll(e,m)?h=!0:(s&&cl(e,m)||sl(e,m)||al(e,m)?h=!0:pl(e)?(h=!0,(e.tag!==null||e.anchor!==null)&&w(e,"alias node should not have any properties")):ol(e,m,He===t)&&(h=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(h=a&&dt(e,g))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&w(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,p=e.implicitTypes.length;d<p;d+=1)if(u=e.implicitTypes[d],u.resolve(e.result)){e.result=u.construct(e.result),e.tag=u.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else ee.call(e.typeMap[e.kind||"fallback"],e.tag)?(u=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&u.kind!==e.kind&&w(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+u.kind+'", not "'+e.kind+'"'),u.resolve(e.result)?(e.result=u.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):w(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):w(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||h}function ml(e){var n=e.position,t,r,i,o=!1,s;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(s=e.input.charCodeAt(e.position))!==0&&(O(e,!0,-1),s=e.input.charCodeAt(e.position),!(e.lineIndent>0||s!==37));){for(o=!0,s=e.input.charCodeAt(++e.position),t=e.position;s!==0&&!W(s);)s=e.input.charCodeAt(++e.position);for(r=e.input.slice(t,e.position),i=[],r.length<1&&w(e,"directive name must not be less than one character in length");s!==0;){for(;oe(s);)s=e.input.charCodeAt(++e.position);if(s===35){do s=e.input.charCodeAt(++e.position);while(s!==0&&!Q(s));break}if(Q(s))break;for(t=e.position;s!==0&&!W(s);)s=e.input.charCodeAt(++e.position);i.push(e.input.slice(t,e.position))}s!==0&&_n(e),ee.call(lt,r)?lt[r](e,r,i):Ge(e,'unknown document directive "'+r+'"')}if(O(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,O(e,!0,-1)):o&&w(e,"directives end mark is expected"),pe(e,e.lineIndent-1,$e,!1,!0),O(e,!0,-1),e.checkLineBreaks&&Ja.test(e.input.slice(n,e.position))&&Ge(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&Ye(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,O(e,!0,-1));return}if(e.position<e.length-1)w(e,"end of the stream or a document separator is expected");else return}function $t(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new rl(e,n),r=e.indexOf("\0");for(r!==-1&&(t.position=r,w(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)ml(t);return t.documents}function Gt(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var r=$t(e,t);if(typeof n!="function")return r;for(var i=0,o=r.length;i<o;i+=1)n(r[i])}function Wt(e,n){var t=$t(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new Rt("expected a single document in the stream, but found more")}}function fl(e,n,t){return typeof n=="object"&&n!==null&&typeof t>"u"&&(t=n,n=null),Gt(e,n,J.extend({schema:Lt},t))}function gl(e,n){return Wt(e,J.extend({schema:Lt},n))}Ce.loadAll=Gt;Ce.load=Wt;Ce.safeLoadAll=fl;Ce.safeLoad=gl;var wn={},Se=Y,Ie=Te,yl=Ke,bl=Ae,jt=Object.prototype.toString,Kt=Object.prototype.hasOwnProperty,_l=9,xe=10,vl=13,wl=32,kl=33,xl=34,Yt=35,Cl=37,Tl=38,Al=39,Sl=42,qt=44,Il=45,Vt=58,Ml=61,El=62,Rl=63,Ll=64,zt=91,Qt=93,Nl=96,Xt=123,Fl=124,Jt=125,H={};H[0]="\\0";H[7]="\\a";H[8]="\\b";H[9]="\\t";H[10]="\\n";H[11]="\\v";H[12]="\\f";H[13]="\\r";H[27]="\\e";H[34]='\\"';H[92]="\\\\";H[133]="\\N";H[160]="\\_";H[8232]="\\L";H[8233]="\\P";var Ol=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function Dl(e,n){var t,r,i,o,s,a,l;if(n===null)return{};for(t={},r=Object.keys(n),i=0,o=r.length;i<o;i+=1)s=r[i],a=String(n[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),l=e.compiledTypeMap.fallback[s],l&&Kt.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[s]=a;return t}function ht(e){var n,t,r;if(n=e.toString(16).toUpperCase(),e<=255)t="x",r=2;else if(e<=65535)t="u",r=4;else if(e<=4294967295)t="U",r=8;else throw new Ie("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+Se.repeat("0",r-n.length)+n}function Pl(e){this.schema=e.schema||yl,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=Se.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=Dl(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function ut(e,n){for(var t=Se.repeat(" ",n),r=0,i=-1,o="",s,a=e.length;r<a;)i=e.indexOf(`
`,r),i===-1?(s=e.slice(r),r=a):(s=e.slice(r,i+1),r=i+1),s.length&&s!==`
`&&(o+=t),o+=s;return o}function dn(e,n){return`
`+Se.repeat(" ",e.indent*n)}function Ul(e,n){var t,r,i;for(t=0,r=e.implicitTypes.length;t<r;t+=1)if(i=e.implicitTypes[t],i.resolve(n))return!0;return!1}function kn(e){return e===wl||e===_l}function me(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function Bl(e){return me(e)&&!kn(e)&&e!==65279&&e!==vl&&e!==xe}function pt(e,n){return me(e)&&e!==65279&&e!==qt&&e!==zt&&e!==Qt&&e!==Xt&&e!==Jt&&e!==Vt&&(e!==Yt||n&&Bl(n))}function Hl(e){return me(e)&&e!==65279&&!kn(e)&&e!==Il&&e!==Rl&&e!==Vt&&e!==qt&&e!==zt&&e!==Qt&&e!==Xt&&e!==Jt&&e!==Yt&&e!==Tl&&e!==Sl&&e!==kl&&e!==Fl&&e!==Ml&&e!==El&&e!==Al&&e!==xl&&e!==Cl&&e!==Ll&&e!==Nl}function Zt(e){var n=/^\n* /;return n.test(e)}var ei=1,ni=2,ti=3,ii=4,Pe=5;function $l(e,n,t,r,i){var o,s,a,l=!1,c=!1,h=r!==-1,d=-1,p=Hl(e.charCodeAt(0))&&!kn(e.charCodeAt(e.length-1));if(n)for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),!me(s))return Pe;a=o>0?e.charCodeAt(o-1):null,p=p&&pt(s,a)}else{for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),s===xe)l=!0,h&&(c=c||o-d-1>r&&e[d+1]!==" ",d=o);else if(!me(s))return Pe;a=o>0?e.charCodeAt(o-1):null,p=p&&pt(s,a)}c=c||h&&o-d-1>r&&e[d+1]!==" "}return!l&&!c?p&&!i(e)?ei:ni:t>9&&Zt(e)?Pe:c?ii:ti}function Gl(e,n,t,r){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&Ol.indexOf(n)!==-1)return"'"+n+"'";var i=e.indent*Math.max(1,t),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-i),s=r||e.flowLevel>-1&&t>=e.flowLevel;function a(l){return Ul(e,l)}switch($l(n,s,e.indent,o,a)){case ei:return n;case ni:return"'"+n.replace(/'/g,"''")+"'";case ti:return"|"+mt(n,e.indent)+ft(ut(n,i));case ii:return">"+mt(n,e.indent)+ft(ut(Wl(n,o),i));case Pe:return'"'+jl(n)+'"';default:throw new Ie("impossible error: invalid scalar style")}}()}function mt(e,n){var t=Zt(e)?String(n):"",r=e[e.length-1]===`
`,i=r&&(e[e.length-2]===`
`||e===`
`),o=i?"+":r?"":"-";return t+o+`
`}function ft(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function Wl(e,n){for(var t=/(\n+)([^\n]*)/g,r=function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,t.lastIndex=c,gt(e.slice(0,c),n)}(),i=e[0]===`
`||e[0]===" ",o,s;s=t.exec(e);){var a=s[1],l=s[2];o=l[0]===" ",r+=a+(!i&&!o&&l!==""?`
`:"")+gt(l,n),i=o}return r}function gt(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,r,i=0,o,s=0,a=0,l="";r=t.exec(e);)a=r.index,a-i>n&&(o=s>i?s:a,l+=`
`+e.slice(i,o),i=o+1),s=a;return l+=`
`,e.length-i>n&&s>i?l+=e.slice(i,s)+`
`+e.slice(s+1):l+=e.slice(i),l.slice(1)}function jl(e){for(var n="",t,r,i,o=0;o<e.length;o++){if(t=e.charCodeAt(o),t>=55296&&t<=56319&&(r=e.charCodeAt(o+1),r>=56320&&r<=57343)){n+=ht((t-55296)*1024+r-56320+65536),o++;continue}i=H[t],n+=!i&&me(t)?e[o]:i||ht(t)}return n}function Kl(e,n,t){var r="",i=e.tag,o,s;for(o=0,s=t.length;o<s;o+=1)ae(e,n,t[o],!1,!1)&&(o!==0&&(r+=","+(e.condenseFlow?"":" ")),r+=e.dump);e.tag=i,e.dump="["+r+"]"}function Yl(e,n,t,r){var i="",o=e.tag,s,a;for(s=0,a=t.length;s<a;s+=1)ae(e,n+1,t[s],!0,!0)&&((!r||s!==0)&&(i+=dn(e,n)),e.dump&&xe===e.dump.charCodeAt(0)?i+="-":i+="- ",i+=e.dump);e.tag=o,e.dump=i||"[]"}function ql(e,n,t){var r="",i=e.tag,o=Object.keys(t),s,a,l,c,h;for(s=0,a=o.length;s<a;s+=1)h="",s!==0&&(h+=", "),e.condenseFlow&&(h+='"'),l=o[s],c=t[l],ae(e,n,l,!1,!1)&&(e.dump.length>1024&&(h+="? "),h+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),ae(e,n,c,!1,!1)&&(h+=e.dump,r+=h));e.tag=i,e.dump="{"+r+"}"}function Vl(e,n,t,r){var i="",o=e.tag,s=Object.keys(t),a,l,c,h,d,p;if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys=="function")s.sort(e.sortKeys);else if(e.sortKeys)throw new Ie("sortKeys must be a boolean or a function");for(a=0,l=s.length;a<l;a+=1)p="",(!r||a!==0)&&(p+=dn(e,n)),c=s[a],h=t[c],ae(e,n+1,c,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&xe===e.dump.charCodeAt(0)?p+="?":p+="? "),p+=e.dump,d&&(p+=dn(e,n)),ae(e,n+1,h,!0,d)&&(e.dump&&xe===e.dump.charCodeAt(0)?p+=":":p+=": ",p+=e.dump,i+=p));e.tag=o,e.dump=i||"{}"}function yt(e,n,t){var r,i,o,s,a,l;for(i=t?e.explicitTypes:e.implicitTypes,o=0,s=i.length;o<s;o+=1)if(a=i[o],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof n=="object"&&n instanceof a.instanceOf)&&(!a.predicate||a.predicate(n))){if(e.tag=t?a.tag:"?",a.represent){if(l=e.styleMap[a.tag]||a.defaultStyle,jt.call(a.represent)==="[object Function]")r=a.represent(n,l);else if(Kt.call(a.represent,l))r=a.represent[l](n,l);else throw new Ie("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');e.dump=r}return!0}return!1}function ae(e,n,t,r,i,o){e.tag=null,e.dump=t,yt(e,t,!1)||yt(e,t,!0);var s=jt.call(e.dump);r&&(r=e.flowLevel<0||e.flowLevel>n);var a=s==="[object Object]"||s==="[object Array]",l,c;if(a&&(l=e.duplicates.indexOf(t),c=l!==-1),(e.tag!==null&&e.tag!=="?"||c||e.indent!==2&&n>0)&&(i=!1),c&&e.usedDuplicates[l])e.dump="*ref_"+l;else{if(a&&c&&!e.usedDuplicates[l]&&(e.usedDuplicates[l]=!0),s==="[object Object]")r&&Object.keys(e.dump).length!==0?(Vl(e,n,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(ql(e,n,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump));else if(s==="[object Array]"){var h=e.noArrayIndent&&n>0?n-1:n;r&&e.dump.length!==0?(Yl(e,h,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(Kl(e,h,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump))}else if(s==="[object String]")e.tag!=="?"&&Gl(e,e.dump,n,o);else{if(e.skipInvalid)return!1;throw new Ie("unacceptable kind of an object to dump "+s)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function zl(e,n){var t=[],r=[],i,o;for(hn(e,t,r),i=0,o=r.length;i<o;i+=1)n.duplicates.push(t[r[i]]);n.usedDuplicates=new Array(o)}function hn(e,n,t){var r,i,o;if(e!==null&&typeof e=="object")if(i=n.indexOf(e),i!==-1)t.indexOf(i)===-1&&t.push(i);else if(n.push(e),Array.isArray(e))for(i=0,o=e.length;i<o;i+=1)hn(e[i],n,t);else for(r=Object.keys(e),i=0,o=r.length;i<o;i+=1)hn(e[r[i]],n,t)}function ri(e,n){n=n||{};var t=new Pl(n);return t.noRefs||zl(e,t),ae(t,0,e,!0,!0)?t.dump+`
`:""}function Ql(e,n){return ri(e,Se.extend({schema:bl},n))}wn.dump=ri;wn.safeDump=Ql;var qe=Ce,oi=wn;function Ve(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}F.Type=P;F.Schema=ge;F.FAILSAFE_SCHEMA=yn;F.JSON_SCHEMA=At;F.CORE_SCHEMA=St;F.DEFAULT_SAFE_SCHEMA=Ae;F.DEFAULT_FULL_SCHEMA=Ke;F.load=qe.load;F.loadAll=qe.loadAll;F.safeLoad=qe.safeLoad;F.safeLoadAll=qe.safeLoadAll;F.dump=oi.dump;F.safeDump=oi.safeDump;F.YAMLException=Te;F.MINIMAL_SCHEMA=yn;F.SAFE_SCHEMA=Ae;F.DEFAULT_SCHEMA=Ke;F.scan=Ve("scan");F.parse=Ve("parse");F.compose=Ve("compose");F.addConstructor=Ve("addConstructor");var Xl=F,Jl=Xl;function Zl(e){if(!e.startsWith(`---
`))return{data:{},content:e};const n=e.indexOf(`
---`,4);if(n===-1)return{data:{},content:e};const t=e.slice(4,n),r=e.slice(n+4),i=r.startsWith(`
`)?r.slice(1):r;return{data:Jl.safeLoad(t)??{},content:i}}const si={npc:{specialNameChance:.3},missions:{boardCountMin:3,boardCountMax:6,missionTtlMs:9e5,deliveryChance:.6,deliveryBaseReward:200,deliveryRandomReward:200,supplyRewardMargin:.4,supplyRandomReward:150,supplyRequirementsMin:1,supplyRequirementsMax:2,supplyQtyMin:1,supplyQtyMax:4},trading:{stockCountMin:4,stockCountMax:6,stockQtyMin:1,stockQtyMax:8,stockTtlMs:12e4},fuel:{pricePerLitre:10,consumptionPerLy:5},reputation:{levelUnfriendlyMin:-300,levelNeutralMin:-100,levelFriendlyMin:100,levelLikedMin:300,levelReveredMin:600,pointsMin:-600,pointsMax:1e3,missionDeltaSmall:25,missionDeltaMedium:75,missionDeltaLarge:200,missionTierMediumReward:300,missionTierLargeReward:600,tradeModifierHated:1.2,tradeModifierUnfriendly:1.1,tradeModifierNeutral:1,tradeModifierFriendly:.92,tradeModifierLiked:.85,tradeModifierRevered:.8,repPerCredit:.01,maxRepPerVisit:10}};function ec(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},balance:{...si},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[t,r]of Object.entries(e)){const i=t.split("/").pop()??"";if(i==="_template.md"||i===".gitkeep")continue;const{data:o,content:s}=Zl(r);/^systems\/[^/]+\.md$/.test(t)?n.systems.push(nc(o,s)):/^destinations\/[^/]+\.md$/.test(t)?n.destinations.push(tc(o,s)):/^factions\/[^/]+\.md$/.test(t)?n.factions.push(ic(o,s)):/^ships\/[^/]+\.md$/.test(t)?n.ships.push(rc(o,s)):t==="ships/components/jump-drives.md"?n.drives=oc(o):t==="navigation/jump-routes.md"?n.routes=sc(o):t==="commodities.md"?n.commodities=ac(o):/^story\/[^/]+\.md$/.test(t)?n.storyBeats.push(lc(o,s)):t==="settings/new-game.md"?n.settings=cc(o):t==="settings/balance.md"?n.balance=uc(o):t==="delivery-items.md"?n.deliveryItems=dc(o):t==="npc-names.md"&&(n.npcNames=hc(o))}return n}function ze(e){const n=[];let t=!1;for(const r of e.split(`
`)){const i=r.trim();if(!i.startsWith("#"))if(i===""){if(t)break}else t=!0,n.push(i)}return n.join(" ")}function nc(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economy:e.economy??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:ze(n)}}function tc(e,n){const t=e.amenities??{},r={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:r,npcs:e.npcs??{},goodsBias:e.goods_bias??[],dangerLevel:e.danger_level,tags:e.tags??[],description:ze(n),owningFactionId:e.owning_faction}}function ic(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:ze(n),rivals:e.rivals??[],allies:e.allies??[]}}function rc(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,tags:e.tags??[],description:ze(n)}}function oc(e){return(e.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function sc(e){return(e.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function ac(e){return(e.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function lc(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function cc(e){var n,t,r,i;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((t=e.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((r=e.starting_location)==null?void 0:r.system)??"",destination:((i=e.starting_location)==null?void 0:i.destination)??""},startingShip:e.starting_ship??""}}function dc(e){return(e.delivery_items??[]).map(t=>({id:t.id,name:t.name,weightKg:t.weight_kg}))}function hc(e){const n=e.npc_names??{};return{special:n.special??[],firstNames:n.first_names??[],lastNames:n.last_names??[]}}function uc(e){const n=si,t=e.npc??{},r=e.missions??{},i=e.trading??{},o=e.fuel??{},s=e.reputation??{};return{npc:{specialNameChance:t.special_name_chance??n.npc.specialNameChance},missions:{boardCountMin:r.board_count_min??n.missions.boardCountMin,boardCountMax:r.board_count_max??n.missions.boardCountMax,missionTtlMs:r.mission_ttl_ms??n.missions.missionTtlMs,deliveryChance:r.delivery_chance??n.missions.deliveryChance,deliveryBaseReward:r.delivery_base_reward??n.missions.deliveryBaseReward,deliveryRandomReward:r.delivery_random_reward??n.missions.deliveryRandomReward,supplyRewardMargin:r.supply_reward_margin??n.missions.supplyRewardMargin,supplyRandomReward:r.supply_random_reward??n.missions.supplyRandomReward,supplyRequirementsMin:r.supply_requirements_min??n.missions.supplyRequirementsMin,supplyRequirementsMax:r.supply_requirements_max??n.missions.supplyRequirementsMax,supplyQtyMin:r.supply_qty_min??n.missions.supplyQtyMin,supplyQtyMax:r.supply_qty_max??n.missions.supplyQtyMax},trading:{stockCountMin:i.stock_count_min??n.trading.stockCountMin,stockCountMax:i.stock_count_max??n.trading.stockCountMax,stockQtyMin:i.stock_qty_min??n.trading.stockQtyMin,stockQtyMax:i.stock_qty_max??n.trading.stockQtyMax,stockTtlMs:i.stock_ttl_ms??n.trading.stockTtlMs},fuel:{pricePerLitre:o.price_per_litre??n.fuel.pricePerLitre,consumptionPerLy:o.consumption_per_ly??n.fuel.consumptionPerLy},reputation:{levelUnfriendlyMin:s.level_unfriendly_min??n.reputation.levelUnfriendlyMin,levelNeutralMin:s.level_neutral_min??n.reputation.levelNeutralMin,levelFriendlyMin:s.level_friendly_min??n.reputation.levelFriendlyMin,levelLikedMin:s.level_liked_min??n.reputation.levelLikedMin,levelReveredMin:s.level_revered_min??n.reputation.levelReveredMin,pointsMin:s.points_min??n.reputation.pointsMin,pointsMax:s.points_max??n.reputation.pointsMax,missionDeltaSmall:s.mission_delta_small??n.reputation.missionDeltaSmall,missionDeltaMedium:s.mission_delta_medium??n.reputation.missionDeltaMedium,missionDeltaLarge:s.mission_delta_large??n.reputation.missionDeltaLarge,missionTierMediumReward:s.mission_tier_medium_reward??n.reputation.missionTierMediumReward,missionTierLargeReward:s.mission_tier_large_reward??n.reputation.missionTierLargeReward,tradeModifierHated:s.trade_modifier_hated??n.reputation.tradeModifierHated,tradeModifierUnfriendly:s.trade_modifier_unfriendly??n.reputation.tradeModifierUnfriendly,tradeModifierNeutral:s.trade_modifier_neutral??n.reputation.tradeModifierNeutral,tradeModifierFriendly:s.trade_modifier_friendly??n.reputation.tradeModifierFriendly,tradeModifierLiked:s.trade_modifier_liked??n.reputation.tradeModifierLiked,tradeModifierRevered:s.trade_modifier_revered??n.reputation.tradeModifierRevered,repPerCredit:s.rep_per_credit??n.reputation.repPerCredit,maxRepPerVisit:s.max_rep_per_visit??n.reputation.maxRepPerVisit}}}function pc(){const e=Object.assign({"/docs/world/commodities.md":io,"/docs/world/delivery-items.md":ro,"/docs/world/destinations/_template.md":oo,"/docs/world/destinations/blackwake-yard.md":so,"/docs/world/destinations/ceti-landfall.md":ao,"/docs/world/destinations/drift-market.md":lo,"/docs/world/destinations/elysium-station.md":co,"/docs/world/destinations/eridani-anchorage.md":ho,"/docs/world/destinations/foundries-platform.md":uo,"/docs/world/destinations/galileo-transfer.md":po,"/docs/world/destinations/hestia-ring.md":mo,"/docs/world/destinations/keelhaul-station.md":fo,"/docs/world/destinations/kepler-yard.md":go,"/docs/world/destinations/mars-anchor.md":yo,"/docs/world/destinations/meridian-station.md":bo,"/docs/world/destinations/new-horizon-port.md":_o,"/docs/world/destinations/orrery-anchorage.md":vo,"/docs/world/destinations/redline-station.md":wo,"/docs/world/destinations/tycho-orbital.md":ko,"/docs/world/destinations/veil-station.md":xo,"/docs/world/destinations/waypoint-ceti.md":Co,"/docs/world/factions/_template.md":To,"/docs/world/factions/centauri-trade-league.md":Ao,"/docs/world/factions/eridani-colonial-council.md":So,"/docs/world/factions/free-captains.md":Io,"/docs/world/factions/grey-market-cartel.md":Mo,"/docs/world/factions/helios-directorate.md":Eo,"/docs/world/factions/independent-miners-guild.md":Ro,"/docs/world/factions/procyon-institute.md":Lo,"/docs/world/factions/terran-union.md":No,"/docs/world/galaxy-map.md":Fo,"/docs/world/navigation/jump-routes.md":Oo,"/docs/world/npc-names.md":Do,"/docs/world/settings/balance.md":Po,"/docs/world/settings/new-game.md":Uo,"/docs/world/ships/_template.md":Bo,"/docs/world/ships/components/jump-drives.md":Ho,"/docs/world/ships/freighter.md":$o,"/docs/world/ships/hauler.md":Go,"/docs/world/ships/scout.md":Wo,"/docs/world/story/_template.md":jo,"/docs/world/story/enter-wolf-359.md":Ko,"/docs/world/story/first-jump.md":Yo,"/docs/world/story/opening-arrival.md":qo,"/docs/world/systems/_template.md":Vo,"/docs/world/systems/alpha-centauri.md":zo,"/docs/world/systems/barnards-star.md":Qo,"/docs/world/systems/epsilon-eridani.md":Xo,"/docs/world/systems/procyon.md":Jo,"/docs/world/systems/sirius.md":Zo,"/docs/world/systems/sol.md":es,"/docs/world/systems/tau-ceti.md":ns,"/docs/world/systems/wolf-359.md":ts}),n={};for(const[t,r]of Object.entries(e)){const i=t.replace("/docs/world/","");n[i]=r}return ec(n)}ki(pc());const mc=navigator.maxTouchPoints>0?"touch":"keyboard",fc=new URLSearchParams(window.location.search).has("debug"),ai={environment:"browser",primaryInput:mc,debug:fc},gc=new pi,li=new yi(ai);li.connect();const yc=new to(gc,li,ai);let bt=0;function ci(e){yc.tick(e-bt),bt=e,requestAnimationFrame(ci)}requestAnimationFrame(ci);
