(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const ve=40,Ne=30,bi=50,rn=24;function _i(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class vi{constructor(){this.charW=0,this.charH=0,this.gridH=Ne,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(ve),this.pre.dataset.gridRows=String(Ne),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${rn}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${rn}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const t=n.getBoundingClientRect();document.body.removeChild(n),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(ve*this.charW),window.innerHeight/(Ne*this.charH)),t=Math.max(Ne,Math.min(bi,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${rn*n}px`,this.pre.style.width=`${ve*this.charW*n}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const r of this.resizeHandlers)r(ve,t)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const t=[];for(const r of n){let i="";for(const o of r){const s=o.fg!=="transparent"?`fg-${o.fg}`:"",a=o.bg!=="transparent"?`bg-${o.bg}`:"",l=s&&a?`${s} ${a}`:s||a,c=l?` class="${l}"`:"";i+=`<span${c}>${_i(o.char)}</span>`}t.push(i)}this.pre.innerHTML=t.join(`
`)}getWidth(){return ve}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const wi={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",m:"MENU",M:"MENU",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},ki=new Set(["0","1","2","3","4","5","6","7","8","9"]),xi=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class Ci{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}connect(){this.keyListener=n=>{if(xi.has(n.key)&&n.preventDefault(),ki.has(n.key))for(const r of this.charInputHandlers.slice())r(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const r of this.charInputHandlers.slice())r("\b");return}const t=wi[n.key];if(t)for(const r of this.actionHandlers.slice())r(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=n=>{const t=this.pointerStartMap.get(n.pointerId),r=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),!t){this.logDebug(`UP id=${n.pointerId} NO START`);return}const i=n.clientX-t.startX,o=n.clientY-t.startY,s=Math.abs(i),a=Math.abs(o);if(s<20&&a<20)if(r>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;s>=a?l=i>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(i)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=n=>{this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const t=n.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(n,t){const r=document.querySelector(".game-screen");if(!r)return null;const i=r.getBoundingClientRect(),o=parseInt(r.dataset.gridCols??"1"),s=parseInt(r.dataset.gridRows??"1");if(!o||!s||!i.width||!i.height)return null;const a=Math.floor((n-i.left)/(i.width/o)),l=Math.floor((t-i.top)/(i.height/s));return a<0||a>=o||l<0||l>=s?null:{col:a,row:l}}}function f(e,n,t,r,i,o){if(n<0||n>=e.length)return;const s=e[n];for(let a=0;a<r.length;a++){const l=t+a;l>=0&&l<s.length&&(s[l]={char:r[a],fg:i,bg:o})}}function M(e,n,t,r,i){if(n<0||n>=e.length)return;const o=e[n].length,s=Math.max(0,Math.floor((o-t.length)/2));f(e,n,s,t,r,i)}function ze(e,n){const t=e.split(/\s+/).filter(Boolean),r=[];let i="";for(const o of t)i.length===0?i=o:i.length+1+o.length<=n?i+=" "+o:(r.push(i),i=o);return i.length>0&&r.push(i),r}function Oe(e,n,t,r="bright-black"){f(e,n,0,"-".repeat(t),r,"black")}function Tt(e,n,t,r,i){const o=`${r+1}/${i}`;f(e,n,0,"|<|","white","black");const s=Math.floor((t-o.length)/2);f(e,n,s,o,"bright-black","black"),f(e,n,t-3,"|>|","white","black")}const Rn=["UNTITLED","SPACE GAME"],Ti=4,Ai=3,Si="- An ASCII space adventure -",Ii=11,Ln=16;class Fn{constructor(n,t,r,i){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,i()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),n.onAction(o=>{this.activated||(o==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:o==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:o==="SELECT"&&this.items[this.cursorIdx].action())}),n.onTap&&n.onTap((o,s)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(s===Ln+a){this.cursorIdx=a,this.items[a].action();return}}})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let s=0;s<t;s++)for(let a=0;a<r;a++)n[s][a]={char:" ",fg:"black",bg:"black"};for(let s=0;s<Rn.length;s++)M(n,Ti+s*Ai,Rn[s],"bright-cyan","black");M(n,Ii,Si,"white","black");const i=this.items.reduce((s,a)=>Math.max(s,a.label.length+2),0),o=Math.max(0,Math.floor((r-i)/2));for(let s=0;s<this.items.length;s++){const a=Ln+s;if(a>=t)continue;const l=s===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";f(n,a,o,c+this.items[s].label,h,"black")}}}let hn=null;function Mi(e){hn=e}function L(){if(hn===null)throw new Error("World not initialised — call initWorld() before accessing world data");return hn}function We(e){return L().systems.find(n=>n.id===e)}function W(e){return L().destinations.find(n=>n.id===e)}function bn(e){return L().routes.filter(n=>n.from===e||n.to===e)}function At(e){return L().drives.find(n=>n.id===e)}function Ei(e){return L().storyBeats.filter(n=>n.trigger===e)}function Ri(){return L().settings}function U(){return L().balance}function St(e){return L().ships.find(n=>n.id===e)}function He(e,n){return L().routes.find(t=>t.from===e&&t.to===n||t.from===n&&t.to===e)}function Li(e){return L().factions.find(n=>n.id===e)}function se(e){return L().commodities.find(n=>n.id===e)}function Fi(){return L().commodities}function Ni(){return L().systems.filter(e=>e.playerKnowledge==="public")}function Oi(e){return e.reduce((n,t)=>{const r=se(t.commodityId);return n+t.qty*((r==null?void 0:r.weightKg)??0)},0)}const ae=3,Nn=0;function It(e,n){return n?e-2:e}function Di(e){return e.toLocaleString("en-US")}class Pi{constructor(n,t){this.buttonRanges=null,this.footerRow=-1,this.headerWidth=-1,this.context=n,this.player=t}render(n,t){const r=n.length,i=r>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader?(this.headerWidth=i,this.renderHeaderRow0(n,i,t.systemLabel),this.renderHeaderRow1(n,i,t.destinationLabel)):this.headerWidth=-1,t.showFooter&&(this.renderFooter(n,r,i,t.navOptions),this.footerRow=r-1)}renderHeaderRow0(n,t,r){const i=r!==void 0?r??"":(()=>{const c=We(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),o="::";f(n,0,0,o,"bright-black","black"),f(n,0,o.length,i,"bright-cyan","black");const a=t-o.length-i.length-10;let l=o.length+i.length;for(let c=0;c<a;c++)n[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,f(n,0,l,"[M]","white","black"),l+=3,f(n,0,l," MENU","white","black"),l+=5,f(n,0,l,"::","bright-black","black")}renderHeaderRow1(n,t,r){const i=r!==void 0?r??"":(()=>{const h=this.player.destinationId?W(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),o=Di(this.player.credits),s=o.length+5,a="::";f(n,1,0,a,"bright-black","black"),f(n,1,a.length,i,"cyan","black");const l=t-a.length-i.length-s;let c=a.length+i.length;for(let h=0;h<l;h++)n[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,f(n,1,c,o,"green","black"),c+=o.length,f(n,1,c," CR","white","black"),c+=3,f(n,1,c,"::","bright-black","black")}renderFooter(n,t,r,i){const o=t-1,s=[];if(i.length===0){for(let l=0;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}f(n,o,0,"::","bright-black","black");let a=2;for(let l=0;l<i.length;l++){l>0&&(f(n,o,a,"::","bright-black","black"),a+=2);const c=i[l],h=`[${l+1}]`,d=` ${c.label}`,p=a;f(n,o,a,h,"white","black"),a+=h.length,f(n,o,a,d,"white","black"),a+=d.length,s.push({id:c.id,startCol:p,endCol:a})}for(let l=a;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=s}hitTestNav(n,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const r of this.buttonRanges)if(n>=r.startCol&&n<r.endCol)return r.id;return null}hitTestHeader(n,t){if(this.headerWidth<0||t!==0)return null;const r=this.headerWidth-10,i=this.headerWidth-2;return n>=r&&n<i?"menu":null}}class ge{constructor(n,t,r,i){this.activeTabIdx=0,this.activated=!1,this.player=r,this.chrome=new Pi(t,r),this.opts=i,n.onCharInput&&n.onCharInput(o=>{this.activated||this.handleCharInput(o)}),n.onAction(o=>{if(!this.activated&&!this.preHandleAction(o)){if(o==="MENU"&&i.onMenu){i.onMenu();return}if(i.tabs){if(o==="LEFT"){const s=Math.max(0,this.activeTabIdx-1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}if(o==="RIGHT"){const s=Math.min(i.tabs.length-1,this.activeTabIdx+1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}}this.handleAction(o)}}),n.onTap&&n.onTap((o,s)=>{var l;if(this.activated||this.preHandleTap(o,s))return;const a=this.chrome.hitTestNav(o,s);if(a!==null){this.handleNavTap(a);return}if(this.chrome.hitTestHeader(o,s)==="menu"&&i.onMenu){i.onMenu();return}if(i.tabs&&i.title!==void 0){const c=i.showHeader??!0?ae:Nn,h=((l=i.summary)==null?void 0:l.length)??0,d=c+3+h;if(s===d){let p=3;for(let u=0;u<i.tabs.length;u++){const m=i.tabs[u].length+2;if(o>=p&&o<p+m){u!==this.activeTabIdx&&(this.activeTabIdx=u,this.onTabChange(u));return}p+=m+1}return}}this.handleTap(o,s)})}preHandleAction(n){return!1}preHandleTap(n,t){return!1}handleAction(n){}handleTap(n,t){}handleNavTap(n){}handleCharInput(n){}onTabChange(n){}buildChromeConfig(){return{showHeader:this.opts.showHeader??!0,showFooter:this.opts.showFooter??!0,navOptions:this.opts.navOptions}}suspend(){this.activated=!0}resume(){this.activated=!1}update(n){}render(n){var p;const t=n.length,r=t>0?n[0].length:0,i=this.opts;for(let u=0;u<t;u++)for(let m=0;m<r;m++)n[u][m]={char:" ",fg:"black",bg:"black"};const o=this.buildChromeConfig();this.chrome.render(n,o);const s=i.showHeader??!0,a=i.showFooter??!0,l=s?ae:Nn,c=((p=i.summary)==null?void 0:p.length)??0,h=It(t,a);let d;if(i.title!==void 0){f(n,l,2,i.title,"bright-white","black"),f(n,l+1,2,"'".repeat(i.title.length),"bright-black","black");for(let u=0;u<c;u++)f(n,l+2+u,2,i.summary[u],"bright-black","black");if(i.tabs){const u=l+3+c;let m=2;u<t&&(n[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++;for(let g=0;g<i.tabs.length;g++){const y=g===this.activeTabIdx,C=` ${i.tabs[g]} `,I=y?"black":"white",k=y?"green":"black";for(const A of C)u<t&&m<r&&(n[u][m]={char:A,fg:I,bg:k}),m++;u<t&&m<r&&(n[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++}d=l+5+c}else d=l+3+c}else d=l;this.renderContent(n,d,h)}}class ne extends ge{constructor(n,t,r,i,o,s,a=[],l=null,c){super(i,o,s,{navOptions:r,title:n,summary:a,tabs:l!==null?l.map(d=>d.label):void 0,onMenu:c}),this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.modal=null,this.lastContentTop=0,this._staticItems=t,this.tabs=l,this.infoLines=a;const h=a.length;this.lastContentTop=l!==null?ae+5+h:ae+3+h,this.resetCursor()}get items(){var n;return this.tabs!==null?((n=this.tabs[this.activeTabIdx])==null?void 0:n.items)??[]:this._staticItems}preHandleAction(n){return this.modal!==null?(this.modal.handleAction(n),!0):!1}preHandleTap(n,t){return this.modal!==null?(this.modal.handleTap(n,t),!0):!1}handleCharInput(n){this.modal!==null&&this.modal.handleCharInput(n)}onTabChange(n){this.resetCursor()}handleAction(n){n==="UP"?this.moveCursor(-1):n==="DOWN"?this.moveCursor(1):n==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):n==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):n==="SELECT"?this.activateCurrent():this.handleNavAction(n)}handleTap(n,t){const r=this.rowToVisibleItemIndex(t);r!==null&&!this.items[r].disabled&&(this.cursorIdx=r,this.activateCurrent())}moveCursor(n){const t=this.items,r=t.length;if(r===0)return;const i=this.cursorIdx===-1?n>0?r-1:0:this.cursorIdx;for(let o=0;o<r;o++){const s=((i+n*(o+1))%r+r)%r;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const n=this.items[this.cursorIdx];n.disabled||(this.activated=!0,n.action())}rowToVisibleItemIndex(n){var i,o;let t=this.lastContentTop;const r=this.items;for(let s=0;s<r.length;s++){const a=1+(((i=r[s].details)==null?void 0:i.length)??0)+(((o=r[s].detailsColored)==null?void 0:o.length)??0);if(n>=t&&n<t+a)return s;t+=a}return null}resetCursor(){const n=this.items;for(let t=0;t<n.length;t++)if(!n[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(n){}openModal(n){this.modal=n,this.activated=!1}closeModal(){this.modal=null}renderContent(n,t,r){var I,k,A,w;this.lastContentTop=t;const o=n.length>0?n[0].length:0,s=r-1,a=s-t,l=this.items,c=l.map(_=>{var b,T;return 1+(((b=_.details)==null?void 0:b.length)??0)+(((T=_.detailsColored)==null?void 0:T.length)??0)}),d=c.reduce((_,b)=>_+b,0)>a,p=d?a-1:a,u=[];let m=[],g=0;for(let _=0;_<c.length;_++)g+c[_]>p?(m.length>0&&u.push(m),m=[_],g=c[_]):(m.push(_),g+=c[_]);m.length>0&&u.push(m),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const y=u[this.pageIndex]??[];let C=t;for(const _ of y){const b=l[_],T=_===this.cursorIdx,E=b.disabled?"bright-black":T?"bright-green":b.accentFg??"white",Y=b.infoFg??E,O=o-4;if(b.icon!==void 0){const R=b.icon.length;if(f(n,C,2,T?">":" ",E,"black"),f(n,C,3,b.icon,b.iconFg??E,"black"),b.info!==void 0){const P=b.info.length,S=Math.max(0,O-1-R-2-P-1),v=b.label.length>S?b.label.slice(0,S):b.label,G=Math.max(1,O-1-R-v.length-2-P);f(n,C,3+R,v+" ",E,"black"),f(n,C,3+R+v.length+1,".".repeat(G),"bright-black","black"),f(n,C,3+R+v.length+1+G+1,b.info,Y,"black")}else f(n,C,3+R,b.label.slice(0,O-1-R),E,"black");for(let P=0;P<(((I=b.details)==null?void 0:I.length)??0);P++)C+1+P<=s&&f(n,C+1+P,2,("  "+b.details[P]).slice(0,O),b.detailsFg??"bright-black","black")}else if(b.info!==void 0){const R=T?"> ":"  ",D=Math.max(1,O-2-b.label.length-2-b.info.length);f(n,C,2,R+b.label+" ",E,"black"),f(n,C,2+R.length+b.label.length+1,".".repeat(D),"bright-black","black"),f(n,C,2+R.length+b.label.length+1+D+1,b.info,Y,"black")}else if(b.details!==void 0&&b.details.length>0){f(n,C,2,((T?"> ":"  ")+b.label).slice(0,O),E,"black");for(let D=0;D<b.details.length;D++)C+1+D<=s&&f(n,C+1+D,2,("  "+b.details[D]).slice(0,O),b.detailsFg??"bright-black","black")}else f(n,C,2,((T?"> ":"  ")+b.label).slice(0,O),E,"black");const z=((k=b.details)==null?void 0:k.length)??0;for(let R=0;R<(((A=b.detailsColored)==null?void 0:A.length)??0);R++){const D=C+1+z+R;if(D<=s){const P=b.detailsColored[R];let S=4;for(const v of P.left)f(n,D,S,v.text,v.fg,"black"),S+=v.text.length;if(P.right!==void 0){const v=O-4-P.right.text.length;f(n,D,v,P.right.text,P.right.fg,"black")}}}C+=1+z+(((w=b.detailsColored)==null?void 0:w.length)??0)}d&&Tt(n,s,o,this.pageIndex,this.lastPageCount),this.modal!==null&&this.modal.render(n)}}class On extends ne{constructor(n,t,r,i,o){const s=i.length===0?[{label:"NO OPTIONS AVAILABLE",disabled:!0,action:()=>{}}]:i.map(a=>({label:a.label,action:a.action}));super("MENU",s,[{id:"game",label:"GAME"}],n,t,r,[],null,o),this.onClose=o}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onClose())}handleNavTap(n){n==="game"&&!this.activated&&(this.activated=!0,this.onClose())}}function ye(e){return e.size==="medium"||e.size==="large"}function Ce(e,n){return e>=n.reputation.levelReveredMin?3:e>=n.reputation.levelLikedMin?2:e>=n.reputation.levelFriendlyMin?1:e<n.reputation.levelUnfriendlyMin?-2:e<n.reputation.levelNeutralMin?-1:0}function Mt(e){switch(e){case-2:return"HATED";case-1:return"UNFRIENDLY";case 0:return"NEUTRAL";case 1:return"FRIENDLY";case 2:return"LIKED";case 3:return"REVERED";default:return"NEUTRAL"}}function je(e,n){switch(e){case-2:return n.reputation.tradeModifierHated;case-1:return n.reputation.tradeModifierUnfriendly;case 1:return n.reputation.tradeModifierFriendly;case 2:return n.reputation.tradeModifierLiked;case 3:return n.reputation.tradeModifierRevered;default:return n.reputation.tradeModifierNeutral}}function _n(e,n){const t=Math.abs(e),r=e<0?"-":"+";return t<=50?`${r}SMALL`:t<=150?`${r}MEDIUM`:`${r}LARGE`}function vn(e,n,t){const r=new Map;r.set(e.id,n);const i=Math.floor(n/2);for(const s of e.allies)r.set(s,i);const o=-Math.floor(n/2);for(const s of e.rivals)r.set(s,o);return r}function wn(e,n){return e.type==="delivery"?e.pickupComplete?n.destinationId===e.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":e.requirements.every(r=>{const i=n.cargoHold.find(o=>o.commodityId===r.commodityId);return i!==void 0&&i.qty>=r.qty})?"ready-to-deliver":"needs-supplies"}function Ui(e,n){return n.type==="delivery"&&e.cargoCapacity-e.cargoWeightKg<n.itemWeightKg?{ok:!1,reason:"Insufficient cargo space"}:{ok:!0}}class Bi{constructor(n){const t=St(n.shipId);if(!t)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[],this._factionReputation=new Map;for(const r of L().factions)ye(r)&&this._factionReputation.set(r.id,0)}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,t){const r=this._cargoHold.find(i=>i.commodityId===n);r?r.qty+=t:this._cargoHold.push({commodityId:n,qty:t})}removeCargo(n,t){const r=this._cargoHold.findIndex(i=>i.commodityId===n);r<0||(t!==void 0&&t<this._cargoHold[r].qty?this._cargoHold[r].qty-=t:this._cargoHold.splice(r,1))}get missionItemsWeightKg(){return this._missionItems.reduce((n,t)=>n+t.weightKg,0)}get cargoWeightKg(){return Oi(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(n,t){const r={...n,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(r),n.type==="delivery"&&t&&(this._missionItems.push({missionId:n.id,itemName:n.itemName,weightKg:n.itemWeightKg}),r.pickupComplete=!0)}collectMissionItem(n){const t=this._activeMissions.find(r=>r.id===n);!t||t.type!=="delivery"||(t.pickupComplete=!0,this._missionItems.push({missionId:t.id,itemName:t.itemName,weightKg:t.itemWeightKg}))}completeMission(n){this._activeMissions=this._activeMissions.filter(t=>t.id!==n),this._missionItems=this._missionItems.filter(t=>t.missionId!==n)}cancelMission(n){this._activeMissions=this._activeMissions.filter(t=>t.id!==n),this._missionItems=this._missionItems.filter(t=>t.missionId!==n)}getMissionsForPickup(n){return this._activeMissions.filter(t=>t.type==="delivery"&&t.pickupDestinationId===n&&!t.pickupComplete)}getMissionsForDelivery(n){return this._activeMissions.filter(t=>t.deliveryDestinationId===n&&wn(t,this)==="ready-to-deliver")}getFactionReputation(n){return this._factionReputation.get(n)??0}modifyFactionReputation(n,t,r){const i=this.getFactionReputation(n),o=Math.min(r.reputation.pointsMax,Math.max(r.reputation.pointsMin,i+t));this._factionReputation.set(n,o)}}const Dn=40;class un{constructor(n){this.focus="confirm",this.confirmRect=null,this.cancelRect=null,this.opts=n}handleAction(n){var t,r;if(n==="BACK"){this.opts.onConfirm();return}if(n==="LEFT"||n==="RIGHT"||n==="TAB"){this.opts.cancelLabel!==void 0&&(this.focus=this.focus==="confirm"?"cancel":"confirm");return}n==="SELECT"&&(this.focus==="cancel"?(r=(t=this.opts).onCancel)==null||r.call(t):this.opts.onConfirm())}handleCharInput(n){}handleTap(n,t){var r,i;this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.opts.onConfirm():this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&((i=(r=this.opts).onCancel)==null||i.call(r))}render(n){const t=n.length,r=t>0?n[0].length:0,{title:i,body:o,confirmLabel:s,cancelLabel:a}=this.opts,l=Dn-2,c=ze(o,l),h=c.length,d=4+h+1+1+1,p=Dn,u=Math.floor((r-p)/2),m=Math.floor((t-d)/2);for(let w=0;w<d;w++)for(let _=0;_<p;_++){const b=m+w,T=u+_;b>=0&&b<t&&T>=0&&T<r&&(n[b][T]={char:" ",fg:"white",bg:"black"})}const g=(w,_,b)=>{w>=0&&w<t&&_>=0&&_<r&&(n[w][_]={char:b,fg:"white",bg:"black"})};g(m,u,"+"),g(m,u+p-1,"+");for(let w=1;w<p-1;w++)g(m,u+w,"-");g(m+d-1,u,"+"),g(m+d-1,u+p-1,"+");for(let w=1;w<p-1;w++)g(m+d-1,u+w,"-");for(let w=1;w<d-1;w++)g(m+w,u,"|"),g(m+w,u+p-1,"|");const y=i.slice(0,l),C=m+1,I=u+1+Math.floor((l-y.length)/2);f(n,C,I,y,"bright-white","black"),f(n,m+2,I,"'".repeat(y.length),"bright-black","black");for(let w=0;w<c.length;w++)f(n,m+4+w,u+1,c[w],"white","black");const k=m+4+h+1,A=`[ ${s} ]`;if(a!==void 0){const w=`[ ${a} ]`,_=2,b=A.length+_+w.length,T=Math.floor((l-b)/2),E=u+1+T,Y=E+A.length+_;this.confirmRect={col:E,row:k,width:A.length},this.cancelRect={col:Y,row:k,width:w.length};const O=this.focus==="confirm",z=this.focus==="cancel";f(n,k,E,A,O?"black":"white",O?"green":"black"),f(n,k,Y,w,z?"black":"white",z?"green":"black")}else{const w=Math.floor((l-A.length)/2),_=u+1+w;this.confirmRect={col:_,row:k,width:A.length},this.cancelRect=null,f(n,k,_,A,"black","green")}}}const Hi={delivery:"[D] ",supply:"[S] "},$i={"pending-pickup":"PENDING PICKUP","needs-supplies":"NEEDS SUPPLIES","in-transit":"IN TRANSIT","ready-to-deliver":"READY TO DELIVER"},Gi={"pending-pickup":"yellow","needs-supplies":"yellow","in-transit":"bright-black","ready-to-deliver":"bright-green"};class Wi extends ne{constructor(n,t,r,i,o){super("MISSIONS",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],n,t,r,[],null,o),this.onBack=i,this.onGame=o}get items(){const n=this.player.activeMissions;return n.length===0?[{label:"NO ACTIVE MISSIONS",disabled:!0,action:()=>{}}]:n.map(t=>{const r=wn(t,this.player),i=W(t.deliveryDestinationId),o=(i==null?void 0:i.name)??t.deliveryDestinationId,s=$i[r]??r,a=Gi[r]??"white";return{label:t.title,icon:Hi[t.type],iconFg:"bright-yellow",info:`${t.reward} CR`,infoFg:"bright-green",details:[`${s} → ${o}`],detailsFg:a,action:()=>this.openMissionModal(t)}})}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}openMissionModal(n){let t=n.description;if(n.giverFactionId){const r=L(),i=r.factions.find(o=>o.id===n.giverFactionId);if(i){const o=U(),s=n.reward;let a;s>=o.reputation.missionTierLargeReward?a=o.reputation.missionDeltaLarge:s>=o.reputation.missionTierMediumReward?a=o.reputation.missionDeltaMedium:a=o.reputation.missionDeltaSmall;const l=vn(i,a,r.factions),c=[];for(const[h,d]of l){const p=r.factions.find(u=>u.id===h);p&&c.push({id:h,name:p.name,delta:d})}c.sort((h,d)=>h.delta!==d.delta?d.delta-h.delta:h.name.localeCompare(d.name)),t+=`

REPUTATION IMPACT:
`;for(const h of c){const d=_n(h.delta);t+=`  ${h.name.padEnd(20)} ${d}
`}}}this.openModal(new un({title:n.title,body:t,confirmLabel:"OKAY",cancelLabel:"CANCEL MISSION",onConfirm:()=>this.closeModal(),onCancel:()=>{this.player.cancelMission(n.id),this.closeModal();const r=this.player.activeMissions.length;r===0?this.cursorIdx=-1:this.cursorIdx>=r&&(this.cursorIdx=r-1)}}))}handleNavAction(n){n==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):(n==="BACK"||n==="NAV_2")&&!this.activated&&(this.activated=!0,this.onBack())}handleNavTap(n){n==="game"&&!this.activated?(this.activated=!0,this.onGame()):n==="menu"&&!this.activated&&(this.activated=!0,this.onBack())}}const pn=20,ji="█",Ki="░";function Yi(e,n,t){return e<=n?0:e>=t?pn:Math.round((e-n)/(t-n)*pn)}const qi={[-2]:"red",[-1]:"bright-red",0:"white",1:"bright-green",2:"bright-green",3:"bright-cyan"};class Vi extends ne{constructor(n,t,r,i,o){super("REPUTATION",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],n,t,r,[],null,o),this.onBack=i,this.onGame=o}get items(){const n=U(),r=L().factions.filter(i=>ye(i));return r.sort((i,o)=>{if(i.size!==o.size){if(i.size==="large")return-1;if(o.size==="large")return 1}return i.name.localeCompare(o.name)}),r.map(i=>{const o=this.player.getFactionReputation(i.id),s=Ce(o,n),a=Mt(s),l=qi[s]??"white",c=Yi(o,n.reputation.pointsMin,n.reputation.levelReveredMin),h=pn-c;return{label:i.name,info:a,infoFg:l,detailsColored:[{left:[{text:ji.repeat(c),fg:l},{text:Ki.repeat(h),fg:"bright-black"}],right:{text:String(o),fg:"white"}},{left:[]}],action:()=>{}}})}activateCurrent(){}handleNavAction(n){n==="BACK"&&!this.activated?(this.activated=!0,this.onBack()):n==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):super.handleNavAction(n)}handleNavTap(n){n==="menu"&&!this.activated?(this.activated=!0,this.onBack()):n==="game"&&!this.activated&&(this.activated=!0,this.onGame())}}class zi extends ge{constructor(n,t,r,i){super(n,t,r,{navOptions:[]}),this.pageIndex=0,this.onContinue=i;const s=Ei("game-start")[0].text.split(`

`),a=s[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=s.slice(1)):(this.yearHeader="",l=s);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),p=ze(d,36);h>0&&c.push(""),c.push(...p)}this.bodyLines=c}handleAction(n){n==="SELECT"?(this.activated=!0,this.onContinue()):n==="LEFT"?this.pageIndex>0&&this.pageIndex--:n==="RIGHT"&&this.pageIndex++}handleTap(n,t){this.activated=!0,this.onContinue()}renderContent(n,t,r){const i=n.length>0?n[0].length:0;if(this.yearHeader){const m=Math.max(0,Math.floor((i-this.yearHeader.length)/2));f(n,t,m,this.yearHeader,"bright-yellow","black")}const o=t+2,s=r-1,a=s-o,l=Math.max(1,a),c=Math.max(1,Math.ceil(this.bodyLines.length/l));this.pageIndex>=c&&(this.pageIndex=c-1);const h=c>1,d=this.pageIndex*l,p=Math.min(d+l,this.bodyLines.length);let u=o;for(let m=d;m<p;m++){const g=this.bodyLines[m];g!==""&&f(n,u,2,g,"white","black"),u++}h&&Tt(n,s,i,this.pageIndex,c)}}const Qi=30;class mn{constructor(n){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=n,this.value=Math.max(n.field.min,Math.min(n.field.max,n.field.initialValue))}handleAction(n){const{field:t}=this.formDef;if(n==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(n==="UP"){this.value=Math.min(t.max,this.value+1);return}if(n==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(n==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(n==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(n==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}n==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(n){if(this.focus!=="field")return;const{field:t}=this.formDef;if(n==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(n>="0"&&n<="9"){const r=parseInt(n,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,r)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+r)}}handleTap(n,t){this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(n){const t=n.length,r=t>0?n[0].length:0,{title:i,field:o,derivedRows:s,confirmLabel:a}=this.formDef,l=s.length,c=8+l,h=Qi,d=Math.floor((r-h)/2),p=Math.floor((t-c)/2);for(let v=0;v<c;v++)for(let G=0;G<h;G++){const $=p+v,Q=d+G;$>=0&&$<t&&Q>=0&&Q<r&&(n[$][Q]={char:" ",fg:"white",bg:"black"})}const u=(v,G,$)=>{v>=0&&v<t&&G>=0&&G<r&&(n[v][G]={char:$,fg:"white",bg:"black"})};u(p,d,"+"),u(p,d+h-1,"+");for(let v=1;v<h-1;v++)u(p,d+v,"-");u(p+c-1,d,"+"),u(p+c-1,d+h-1,"+");for(let v=1;v<h-1;v++)u(p+c-1,d+v,"-");for(let v=1;v<c-1;v++)u(p+v,d,"|"),u(p+v,d+h-1,"|");const m=h-2,g=p+1,y=d+1+Math.floor((m-i.length)/2);f(n,g,y,i,"bright-white","black"),f(n,p+2,y,"'".repeat(i.length),"bright-black","black");const C=[o.label,...s.map(v=>v.label)],I=Math.max(...C.map(v=>v.length)),k=d+1+I+3,A=p+4,w=this.focus==="field";f(n,A,d+1,o.label.padEnd(I)+" : ","white","black");const _=this.value.toString().padStart(5);f(n,A,k,_,w?"black":"white",w?"green":"black");for(let v=0;v<l;v++){const G=s[v],$=p+5+v,Q=G.compute(this.value);f(n,$,d+1,G.label.padEnd(I)+" : ","white","black"),f(n,$,k,Q,"white","black")}const b=p+4+l+2,T=`[ ${a} ]`,E="[ CANCEL ]",Y=3,O=T.length+Y+E.length,z=Math.floor((m-O)/2),R=d+1+z,D=R+T.length+Y;this.confirmRect={col:R,row:b,width:T.length},this.cancelRect={col:D,row:b,width:E.length};const P=this.focus==="confirm",S=this.focus==="cancel";f(n,b,R,T,P?"black":"white",P?"green":"black"),f(n,b,D,E,S?"black":"white",S?"green":"black")}}class Xi extends ne{constructor(n,t,r,i,o,s,a,l,c,h){const d=W(i),p=r.getMissionsForPickup(i),u=r.getMissionsForDelivery(i),m=p.map(S=>({label:`COLLECT: ${S.type==="delivery"?S.itemName:""}`,accentFg:"bright-yellow",action:()=>{}})),g=u.map(S=>({label:`DELIVER: ${S.title} → ${S.reward} CR`,accentFg:"bright-yellow",action:()=>{}})),y=[...m,...g],C=[];d.amenities.trader&&C.push({label:"TRADER",action:s}),d.amenities.missionBoard&&C.push({label:"MISSION BOARD",action:a});const I=U();let k=null;if(d.owningFactionId){const S=L().factions.find(v=>v.id===d.owningFactionId);S&&ye(S)&&(k=d.owningFactionId)}const A=I.fuel.pricePerLitre,w=k?je(Ce(r.getFactionReputation(k),I),I):1,_=Math.round(A*w),b=r.fuelCapacityL-r.fuelL,T=Math.floor(r.credits/_),E=Math.min(b,T);let Y=null;if(d.amenities.fuel&&E>0){const S=E*_;Y=y.length+(y.length>0?1:0)+C.length,C.push({label:`BUY FUEL  +${E}L  ${S}CR`,action:()=>{}})}const O=[];y.length>0&&(O.push(...y),O.push({label:"────────────────────",disabled:!0,action:()=>{}})),O.push(...C);const z=ze(d.description,36).slice(0,3),R=`DANGER: ${d.dangerLevel.toUpperCase()}`,D=[...z,R];if(d.owningFactionId){const S=L().factions.find(v=>v.id===d.owningFactionId);S&&D.push(`OPERATED BY: ${S.name}`)}const P=d.locationType==="surface"||d.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",O,[{id:"undock",label:P}],n,t,r,D,null,h),this.onShip=c,this.onRefuel=o,this.onHub=l,this.fuelItemIdx=Y,this.eligibleFactionId=k;for(let S=0;S<p.length;S++){const v=p[S];m[S].action=()=>{this.player.collectMissionItem(v.id),this.onHub()}}for(let S=0;S<u.length;S++){const v=u[S];g[S].action=()=>{if(wn(v,this.player)!=="ready-to-deliver"){this.openModal(new un({title:"CANNOT DELIVER",body:v.type==="delivery"?"Mission item is missing from your cargo.":"Required supplies are missing from your cargo.",confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.activated=!1}}));return}if(v.type==="supply")for(const _e of v.requirements)this.player.removeCargo(_e.commodityId,_e.qty);const $=U(),Q=L();let nn="";if(v.giverFactionId){const _e=Q.factions.find(Le=>Le.id===v.giverFactionId);if(_e){const Le=v.reward;let Fe;Le>=$.reputation.missionTierLargeReward?Fe=$.reputation.missionDeltaLarge:Le>=$.reputation.missionTierMediumReward?Fe=$.reputation.missionDeltaMedium:Fe=$.reputation.missionDeltaSmall;const Mn=vn(_e,Fe,Q.factions);for(const[q,X]of Mn)this.player.modifyFactionReputation(q,X,$);const tn=[];for(const[q,X]of Mn){const En=Q.factions.find(yi=>yi.id===q);En&&tn.push({id:q,name:En.name,delta:X})}tn.sort((q,X)=>q.delta!==X.delta?X.delta-q.delta:q.name.localeCompare(X.name)),nn=`

REPUTATION:
`;for(const q of tn){const X=_n(q.delta);nn+=`  ${q.name.padEnd(20)} ${X}
`}}}this.player.completeMission(v.id),this.player.addCredits(v.reward),this.openModal(new un({title:"MISSION COMPLETE",body:`Mission complete!

You received ${v.reward} CR.${nn}`,confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.onHub()}}))}}}effectiveFuelPrice(){const n=U(),t=n.fuel.pricePerLitre;if(!this.eligibleFactionId)return t;const r=Ce(this.player.getFactionReputation(this.eligibleFactionId),n);return Math.round(t*je(r,n))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx===-1)return;const t=n[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const r=this.effectiveFuelPrice(),i=this.player.fuelCapacityL-this.player.fuelL,o=Math.floor(this.player.credits/r),s=Math.min(i,o);this.openModal(new mn({title:"BUY FUEL",field:{label:"Litres",initialValue:s,min:0,max:s},derivedRows:[{label:"Cost",compute:a=>`${a*r} CR`}],confirmLabel:"BUY",onConfirm:a=>{this.closeModal(),a>0&&this.onRefuel(a*r,a)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class Ji extends ne{constructor(n,t,r,i,o,s,a,l,c,h){var g;const d=W(i),p=((g=d.npcs.trader)==null?void 0:g.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(p,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,[],u,h),this.repGainedThisVisit=0,this.traderStock=o,this.onBuy=s,this.onSell=a,this.onHub=l,this.onUndock=c;const m=d.owningFactionId;if(m){const y=Li(m);this.eligibleFactionId=y&&ye(y)?m:null}else this.eligibleFactionId=null;this.syncItems(),this.clampCursor()}currentModifier(){if(!this.eligibleFactionId)return 1;const n=U(),t=this.player.getFactionReputation(this.eligibleFactionId),r=Ce(t,n);return je(r,n)}buyPrice(n){return Math.round(n*this.currentModifier())}sellPrice(n){return Math.round(n/this.currentModifier())}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(n=>{const t=se(n.commodityId);if(!t)return[];const r=this.buyPrice(t.basePrice),i=this.player.credits>=r;return[{label:`${t.name} (x${n.qty})`,info:`${r} CR`,disabled:!i,action:()=>{const o=Math.floor(this.player.credits/r),s=Math.min(n.qty,o);this.openModal(new mn({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:s,min:0,max:s},derivedRows:[{label:"Total",compute:a=>`${a*r} CR`}],confirmLabel:"BUY",onConfirm:a=>{a>0&&(this.onBuy(n.commodityId,a,r),this.accrueReputation(a*r)),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const n=this.player.cargoHold;return n.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...n].flatMap(t=>{const r=se(t.commodityId);if(!r)return[];const i=this.sellPrice(r.basePrice);return[{label:`${r.name} (x${t.qty})`,info:`${i} CR`,action:()=>{this.openModal(new mn({title:r.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:o=>`${o*i} CR`}],confirmLabel:"SELL",onConfirm:o=>{o>0&&this.onSell(t.commodityId,o,i),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}accrueReputation(n){if(!this.eligibleFactionId)return;const t=U(),r=t.reputation.maxRepPerVisit-this.repGainedThisVisit;if(r<=0)return;const i=Math.min(r,n*t.reputation.repPerCredit);i<=0||(this.repGainedThisVisit+=i,this.player.modifyFactionReputation(this.eligibleFactionId,i,t))}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const n=this.items;(this.cursorIdx<0||this.cursorIdx>=n.length||(t=n[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=n.findIndex(r=>!r.disabled))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(n){if(this.syncItems(),super.render(n),this.eligibleFactionId){const i=U(),o=this.player.getFactionReputation(this.eligibleFactionId),s=Ce(o,i),a=Mt(s),l=je(s,i),c=`x${l.toFixed(2)}`,h=l<1?"bright-green":l>1?"yellow":"bright-black",d=`STANDING: ${a}  `;f(n,ae+2,2,d,"bright-black","black"),f(n,ae+2,2+d.length,c,h,"black")}const t=n.length,r=It(t,!0)-2;f(n,r,2,`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,"bright-black","black")}}const Zi={delivery:"[D] ",supply:"[S] "};class er extends ne{constructor(n,t,r,i,o,s,a,l,c){W(i);const h=o();let d;h.length===0?d=[{label:"NO MISSIONS AVAILABLE",disabled:!0,action:()=>{}}]:d=h.map(p=>{const u=p.giverFactionId?(()=>{const m=L().factions.find(g=>g.id===p.giverFactionId);return m?[`For: ${m.name}`]:[]})():[];return{label:p.title,icon:Zi[p.type],iconFg:"bright-yellow",info:`${p.reward} CR`,infoFg:"bright-green",details:u,detailsFg:"bright-black",action:()=>s(p)}}),super("MISSION BOARD",d,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,[],null,c),this.onHub=a,this.onUndock=l}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}const nr={delivery:"[D]",supply:"[S]"},Pn=16;class tr extends ne{constructor(n,t,r,i,o,s,a,l){const c=Ui(r,i),h=i.type==="delivery"&&i.pickupDestinationId===i.issuingDestinationId,d=c.ok?{label:"ACCEPT MISSION",action:()=>o(h)}:{label:"ACCEPT MISSION",disabled:!0,details:c.reason?[c.reason]:[],action:()=>{}},p={label:"BACK",action:()=>s()},u=Array.from({length:Pn},()=>"");super("MISSION BOARD",[d,p],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,u),this.spec=i,this.onBack=s,this.onHub=a,this.onUndock=l}destColor(n){if(n===this.player.destinationId)return"bright-green";const t=W(n);return t&&t.system===this.player.systemId?"bright-yellow":"white"}writeDestRow(n,t,r,i,o,s){f(n,t,2,r,"white","black"),f(n,t,2+r.length,i.slice(0,s-r.length),this.destColor(o),"black")}handleNavAction(n){this.activated||(n==="NAV_1"?(this.activated=!0,this.onUndock()):n==="NAV_2"?(this.activated=!0,this.onHub()):n==="BACK"&&(this.activated=!0,this.onBack()))}handleNavTap(n){this.activated||(n==="undock"?(this.activated=!0,this.onUndock()):n==="hub"&&(this.activated=!0,this.onHub()))}renderContent(n,t,r){super.renderContent(n,t,r),this.renderDetail(n,t-Pn)}renderDetail(n,t){const i=n.length>0?n[0].length:40,o=i-4,s=this.lastContentTop-1;let a=t;const l=(u,m,g)=>{u<=s&&f(n,u,2,m.slice(0,o),g,"black")};l(a,`${nr[this.spec.type]} ${this.spec.title}`,"bright-yellow"),a++;const c=L(),h=this.spec.giverFactionId?c.factions.find(u=>u.id===this.spec.giverFactionId):null,d=h?` [${h.name}]`:"";if(l(a,`    ${this.spec.giverName}${d}`,"bright-black"),a++,a++,this.spec.type==="delivery"){const u=W(this.spec.pickupDestinationId),m=W(this.spec.deliveryDestinationId);if(a<=s&&this.writeDestRow(n,a,"Pickup:  ",(u==null?void 0:u.name)??this.spec.pickupDestinationId,this.spec.pickupDestinationId,o),a++,a<=s&&this.writeDestRow(n,a,"Deliver: ",(m==null?void 0:m.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++,a<=s){const g=this.player.cargoCapacity-this.player.cargoWeightKg,y=this.spec.itemWeightKg,C=g>=y,I=`Weight:  ${y} kg  (Free: ${g} kg)`;f(n,a,2,I,"white","black");const k=C?"bright-green":"red",A=2+I.length+1;A<i&&f(n,a,A,C?"✓":"✗",k,"black")}a++}else{const u=W(this.spec.deliveryDestinationId);a<=s&&this.writeDestRow(n,a,"Deliver to: ",(u==null?void 0:u.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++;for(const m of this.spec.requirements){if(a>s)break;const g=se(m.commodityId);l(a,`  ${m.qty}x ${(g==null?void 0:g.name)??m.commodityId}`,"white"),a++}}a++;const p=ze(this.spec.description,o);for(const u of p){if(a>s)break;l(a,u,"white"),a++}if(a++,!(a>s)&&(l(a,`REWARD: ${this.spec.reward} CR`,"bright-green"),a++,this.spec.giverFactionId)){const u=c.factions.find(m=>m.id===this.spec.giverFactionId);if(u){const m=U(),g=this.spec.reward;let y;g>=m.reputation.missionTierLargeReward?y=m.reputation.missionDeltaLarge:g>=m.reputation.missionTierMediumReward?y=m.reputation.missionDeltaMedium:y=m.reputation.missionDeltaSmall;const C=vn(u,y,c.factions),I=[];for(const[k,A]of C){const w=c.factions.find(_=>_.id===k);w&&I.push({id:k,name:w.name,delta:A})}if(I.sort((k,A)=>k.delta!==A.delta?A.delta-k.delta:k.name.localeCompare(A.name)),I.length>0){if(a++,a>s)return;const k=s-1;a<=k&&(l(a,"REPUTATION IMPACT","bright-cyan"),a++);for(const A of I){if(a>k)break;const w=_n(A.delta),_=A.delta>0?"bright-green":"red",b=o-w.length-2,T=A.name.slice(0,b),E=" ".repeat(Math.max(0,o-T.length-w.length));l(a,`  ${T}${E}${w}`,_),a++}}}}}}const ir=[18,10,5],rr=[".","*","+"],Un=[4e3,2e3,800],or=[9e3,5e3,2500],sr=[null,"bright-black","white"],ar=["bright-black","white","bright-white"],lr=["white","bright-white","bright-cyan"],De=3,Bn=25,Pe=2,Hn=37,$n=2*Math.PI;function cr(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class dr{constructor(n=42){this.boundsSet=!1,this.rand=cr(n),this.stars=[];for(let t=0;t<3;t++)for(let r=0;r<ir[t];r++){const i=Pe+Math.floor(this.rand()*(Hn-Pe+1)),o=De+Math.floor(this.rand()*(Bn-De+1)),s=this.rand()*$n,a=Un[t]+this.rand()*(or[t]-Un[t]);this.stars.push({col:i,row:o,layer:t,twinklePhase:s,twinklePeriod:a})}}update(n){for(const t of this.stars)t.twinklePhase+=$n/t.twinklePeriod*n}render(n,t,r,i,o){if(!this.boundsSet){this.boundsSet=!0;const s=Bn-De,a=Hn-Pe;{const l=(r-t)/s,c=(o-i)/a;for(const h of this.stars)h.row=Math.round(t+(h.row-De)*l),h.col=Math.round(i+(h.col-Pe)*c)}}for(const s of this.stars){const{row:a,col:l,layer:c}=s;if(a<t||a>r||l<i||l>o)continue;const h=Math.sin(s.twinklePhase);let d;h>=.5?d=lr[c]:h>=-.5?d=ar[c]:d=sr[c],d!==null&&(n[a][l]={char:rr[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const hr=6,on=6,ur=23,pr=23,sn=10,mr=0,fr=4,gr=18,yr=21,br=35,_r=39,Gn=12,vr=11,ie=13,we=27,an=28,wr=12,ln=40,Wn=200,cn=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],kr="#",jn=["green","cyan","white","yellow"],Kn=["*",".","+","x"];function Yn(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function xr(e,n,t){return{col:n,row:t,char:kr,color:jn[Math.floor(e()*jn.length)],phase:e()*2e4,period:1e4+e()*1e4,active:e()>.2}}function ke(e,n,t,r){const i=[];for(const o of r)for(let s=n;s<=t;s++)i.push(xr(e,s,o));return i}class Cr extends ge{constructor(n,t,r,i,o,s,a){super(n,t,r,{navOptions:[],onMenu:a}),this.cursorIdx=0,this.h=30,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.onTravel=i,this.onDock=o,this.onCargo=s,this.starfield=new dr(42),this.inSpace=r.destinationId===null;const l=Yn(99);this.gaugeBtns=[...ke(l,mr,fr,[3,4]),...ke(l,gr,yr,[3,4]),...ke(l,br,_r,[3,4])],this.leftBtns=ke(l,0,vr,[0,1,2,3]),this.rightBtns=ke(l,an,39,[0,1,2,3]);const c=Yn(77),h=3+Math.floor(c()*4);this.radarContacts=Array.from({length:h},()=>({x:c()*(we-ie-1),y:c()*4,vx:(c()-.5)*2,vy:(c()-.5)*1.5,char:Kn[Math.floor(c()*Kn.length)]}))}navCount(){return this.inSpace?1:2}handleAction(n){n==="CARGO"?(this.activated=!0,this.onCargo()):n==="UP"?this.cursorIdx=(this.cursorIdx-1+this.navCount())%this.navCount():n==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.navCount():n==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,this.onTravel()):this.inSpace||(this.activated=!0,this.onDock()))}handleTap(n,t){const r=this.h;(t===3||t===4)&&n>=on&&n<on+1+sn?(this.activated=!0,this.onCargo()):t===r-3&&n<Gn?(this.activated=!0,this.onTravel()):t===r-3&&n>=an&&!this.inSpace&&(this.activated=!0,this.onDock())}update(n){this.starfield.update(n),this.blinkPhase=(this.blinkPhase+n)%1e3;for(const i of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])i.phase+=n,i.phase>=i.period&&(i.phase-=i.period,i.active=!i.active);const t=we-ie,r=5;for(const i of this.radarContacts)i.x+=i.vx*n/1e3,i.y+=i.vy*n/1e3,i.x<0&&(i.x=-i.x,i.vx=-i.vx),i.x>t-1&&(i.x=2*(t-1)-i.x,i.vx=-i.vx),i.y<0&&(i.y=-i.y,i.vy=-i.vy),i.y>r-1&&(i.y=2*(r-1)-i.y,i.vy=-i.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-n);else for(this.tickerAccum+=n;this.tickerAccum>=Wn;){this.tickerAccum-=Wn,this.tickerScroll++;const i=cn[this.msgIdx];if(this.tickerScroll>=i.length+ln-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%cn.length,this.tickerPause=500,this.tickerAccum=0;break}}}renderContent(n,t,r){const i=n.length,o=i>0?n[0].length:0;this.h=i;const s=t+2,a=i-8,l=i-7,c=i-3,h=i-2;this.renderGaugeStrip(n,t),this.starfield.render(n,s,a,0,39);for(let d=0;d<o;d++)n[s][d]={char:"-",fg:"white",bg:"black"},n[a][d]={char:"-",fg:"white",bg:"black"};this.renderHUD(n,s+1),this.renderCrosshair(n,s+1,a-1),this.renderBottomPanels(n,l,c),this.renderTicker(n,h)}renderGaugeStrip(n,t){for(const s of this.gaugeBtns){const a=t+s.row-3,l=s.active?s.color:"bright-black";a>=0&&a<n.length&&(n[a][s.col]={char:s.char,fg:l,bg:"black"})}const r=this.player.fuelL/this.player.fuelCapacityL,i=this.player.cargoWeightKg/this.player.cargoCapacity,o=this.blinkPhase<500;this.renderGauge(n,t,hr,"F",r,"yellow",o),this.renderGauge(n,t+1,on,"C",i,"blue",o),this.renderGauge(n,t,ur,"S",1,"cyan",o),this.renderGauge(n,t+1,pr,"H",1,"green",o)}renderGauge(n,t,r,i,o,s,a){if(t<0||t>=n.length)return;n[t][r]={char:i,fg:s,bg:"black"};const l=Math.round(Math.min(1,Math.max(0,o))*sn),c=o<=.2;for(let h=0;h<sn;h++){const d=r+1+h;if(h<l){const p=c&&!a?"bright-black":s;n[t][d]={char:" ",fg:"black",bg:p}}else n[t][d]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(n,t){f(n,t,1,"VEL:----","bright-black","black"),f(n,t,16,"ATT:---°","bright-black","black"),f(n,t,30,"ROT:--°","bright-black","black")}renderCrosshair(n,t,r){var a;const i=Math.floor((t+r)/2),o=20;n[i][o]={char:"+",fg:"bright-green",bg:"black"};const s=[[i-3,o-5],[i-3,o+5],[i+3,o-5],[i+3,o+5]];for(const[l,c]of s){const h=((a=n[0])==null?void 0:a.length)??40;l>=t&&l<=r&&c>=0&&c<h&&(n[l][c]={char:"+",fg:"bright-green",bg:"black"})}}renderBottomPanels(n,t,r){for(let c=t;c<=r;c++)for(let h=ie;h<we;h++)n[c][h]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(n,t,r-t+1);for(const c of this.leftBtns){const h=t+c.row;if(h<r){const d=c.active?c.color:"bright-black";n[h][c.col]={char:c.char,fg:d,bg:"black"}}}for(const c of this.rightBtns){const h=t+c.row;if(h<r){const d=c.active?c.color:"bright-black";n[h][c.col]={char:c.char,fg:d,bg:"black"}}}const i=this.cursorIdx===0?"bright-yellow":"yellow";f(n,r,0,this.centerPad("TRAVEL",Gn),"black",i);let o,s;this.inSpace?(o="bright-black",s="bright-black"):(o=this.cursorIdx===1?"bright-cyan":"cyan",s="black"),f(n,r,an,this.centerPad("DOCK",wr),s,o);const a=we-ie,l="<)) "+"-".repeat(a-4);f(n,r,ie,l,"white","bright-black")}renderRadar(n,t,r){for(const i of this.radarContacts){const o=Math.min(we-ie-1,Math.max(0,Math.floor(i.x))),s=Math.min(r-1,Math.max(0,Math.floor(i.y)));n[t+s][ie+o]={char:i.char,fg:"white",bg:"bright-black"}}}renderTicker(n,t){const r=cn[this.msgIdx];for(let i=0;i<ln;i++){const o=this.tickerScroll-ln+1+i,s=o>=0&&o<r.length?r[o]:" ";n[t][i]={char:s,fg:"white",bg:"black"}}}centerPad(n,t){if(n.length>=t)return n.slice(0,t);const r=t-n.length,i=Math.floor(r/2);return" ".repeat(i)+n+" ".repeat(r-i)}}class Tr extends ge{constructor(n,t,r,i,o){super(n,t,r,{title:"CARGO HOLD",tabs:["COMMODITIES","MISSION GOODS"],navOptions:[{id:"back",label:"BACK"}],onMenu:o}),this.onBack=i}handleNavTap(n){n==="back"&&(this.activated=!0,this.onBack())}handleAction(n){(n==="BACK"||n==="CARGO")&&(this.activated=!0,this.onBack())}renderContent(n,t,r){const o=n.length>0?n[0].length:0,s=this.player.cargoHold,a=this.player.missionItems,l=this.player.cargoCapacity,c=this.player.cargoWeightKg,h=r-1;this.activeTabIdx===0?this.renderCommoditiesTab(n,t,h,o,s):this.renderMissionGoodsTab(n,t,h,o,a);const d=`TOTAL: ${c}/${l}KG`;f(n,h,2,d,"bright-black","black")}renderCommoditiesTab(n,t,r,i,o){if(o.length===0){f(n,t,2,"NO COMMODITIES","bright-black","black");return}let s=t;for(const a of o){if(s>=r-1)break;const l=se(a.commodityId);if(!l)continue;const c=a.qty*l.weightKg,h=`  x${a.qty}  ${l.basePrice}CR  ${c}KG`,d=Math.max(6,i-4-h.length),p=l.name,u=p.length>d?p.slice(0,d):p;f(n,s,2,`${u}${h}`,"white","black"),s++}}renderMissionGoodsTab(n,t,r,i,o){if(o.length===0){f(n,t,2,"NO MISSION GOODS","bright-black","black");return}let s=t;for(const a of o){if(s>=r-1)break;const l=`  ${a.weightKg}KG`,c=Math.max(6,i-4-l.length),h=a.itemName.length>c?a.itemName.slice(0,c):a.itemName;f(n,s,2,`${h}${l}`,"white","black"),s++}}}class qn extends ne{constructor(n,t,r,i,o,s,a,l,c=()=>{}){const h=We(r.systemId),d=At(r.driveId),p=[...h.destinations.map(y=>({label:W(y).name.toUpperCase(),disabled:y===r.destinationId,action:()=>i(y)})),{label:"FLY INTO SPACE",disabled:r.destinationId===null,action:s}],m=[...bn(r.systemId).map(y=>{const C=y.from===r.systemId?y.to:y.from,I=We(C),k=y.stability.toUpperCase(),A=Math.ceil(U().fuel.consumptionPerLy*y.distance*d.fuelEfficiency);return{label:`${I.name.toUpperCase()}  ${y.distance}LY  [${k}]`.slice(0,36),disabled:A>r.fuelL,action:()=>o(C)}}),{label:"GALAXY MAP...",action:l}],g=[{label:"DESTINATIONS",items:p},{label:"JUMPS",items:m}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],n,t,r,[],g,c),this.onShip=a}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}function Vn(e,n){if(e===n)return[e];const t=[[e]],r=new Set([e]);for(;t.length>0;){const i=t.shift(),o=i[i.length-1];for(const s of bn(o)){const a=s.from===o?s.to:s.from;if(a===n)return[...i,a];r.has(a)||(r.add(a),t.push([...i,a]))}}return null}const Ar=0,Sr=4,Ir=8,Mr=9,zn=10,Qn=15,Er=16,Rr=2,Lr=10,Fr=12,Ue=13,Be=12,Nr=25,Or=26,Dr=10,Xn=18;function Pr(e,n){return e.length>=n?e.slice(0,n):e+" ".repeat(n-e.length)}function xe(e,n){return"["+Pr(e.toUpperCase(),n-2)+"]"}class Ur extends ge{constructor(n,t,r,i,o=()=>{}){super(n,t,r,{title:"GALAXY MAP",tabs:["MAP","ROUTE"],navOptions:[{id:"back",label:"BACK"}],onMenu:o}),this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.lastTop=ae+5,this.onBack=i,this.publicSystems=Ni().sort((s,a)=>s.distanceFromSol-a.distanceFromSol),this.otherSystems=this.publicSystems.filter(s=>s.id!==r.systemId),this.mapBrowsingSystemId=r.systemId}onTabChange(n){this.searchText=""}handleCharInput(n){if(this.activeTabIdx!==0)return;const t=n.charCodeAt(0);n==="\b"||n===""?this.searchText=this.searchText.slice(0,-1):t>=32&&t<127&&(this.searchText+=n.toUpperCase(),this.mapCursorIdx=0)}handleAction(n){if(n==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}this.activeTabIdx===0?this.handleMapAction(n):this.handleRouteAction(n)}handleNavTap(n){n==="back"&&(this.searchText="",this.activated=!0,this.onBack())}handleTap(n,t){const r=this.lastTop,i=r+zn,o=r+Qn;if(this.activeTabIdx===0&&t>=i&&t<o){const s=this.getMapNeighbors(),a=t-i;a>=0&&a<s.length&&(this.mapBrowsingSystemId=s[a].id,this.mapCursorIdx=0,this.searchText="")}else if(this.activeTabIdx===1){const s=r+3,a=r+9;if(t>=s&&t<=a){const l=t-s;l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}}}getMapNeighbors(){const t=bn(this.mapBrowsingSystemId).map(r=>{const i=r.from===this.mapBrowsingSystemId?r.to:r.from,o=this.publicSystems.find(a=>a.id===i),s=r.distance;return o?{sys:o,dist:s}:null}).filter(r=>r!==null).sort((r,i)=>r.dist-i.dist).map(r=>r.sys);return this.searchText.length===0?t:t.filter(r=>r.name.toUpperCase().includes(this.searchText))}handleMapAction(n){const t=this.getMapNeighbors(),r=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(n==="UP")this.mapCursorIdx=Math.max(0,r-1);else if(n==="DOWN")this.mapCursorIdx=Math.min(t.length-1,r+1);else if(n==="SELECT"){const i=t[r];if(!i)return;this.mapBrowsingSystemId=i.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(n){n==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):n==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const n=this.otherSystems[this.routeDestIdx];return n?Vn(this.player.systemId,n.id):null}renderContent(n,t,r){this.lastTop=t;const i=n.length>0?n[0].length:0;this.activeTabIdx===0?this.renderMapTab(n,t,r,i):this.renderRouteTab(n,t,r,i)}renderMapTab(n,t,r,i){const o=this.publicSystems.find(p=>p.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!o)return;const s=t+Mr,a=t+zn,l=t+Qn,c=t+Er;this.renderChart(n,o,t),Oe(n,s,i);const h=this.getMapNeighbors(),d=Math.min(this.mapCursorIdx,Math.max(0,h.length-1));this.renderNeighborList(n,i,o,h,d,a,l),Oe(n,l,i),this.renderInfo(n,i,o,h[d]??null,c),this.searchText.length>0&&f(n,c+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(n,t,r){var h;const i=this.getMapNeighbors(),o=r+Ar,s=r+Sr,a=r+Ir,l=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(f(n,s,Ue,xe(t.name,Be),l,"black"),t.id===this.player.systemId){const d=Ue+Be,p=((h=n[0])==null?void 0:h.length)??40;d<p&&(n[s][d]={char:"*",fg:"bright-yellow",bg:"black"})}const c=["left","right","top","bottom"];for(let d=0;d<Math.min(i.length,4);d++){const p=i[d],u=c[d],m=p.id===this.player.systemId?"bright-yellow":"white";if(u==="left")f(n,s,Rr,xe(p.name,Lr),m,"black"),n[s][Fr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="right")f(n,s,Or,xe(p.name,Dr),m,"black"),n[s][Nr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="top"){f(n,o,Ue,xe(p.name,Be),m,"black");for(let g=o+1;g<s;g++)n[g][Xn]={char:"|",fg:"bright-black",bg:"black"}}else{f(n,a,Ue,xe(p.name,Be),m,"black");for(let g=s+1;g<a;g++)n[g][Xn]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(n,t,r,i,o,s,a){for(let l=0;l<i.length&&l<a-s;l++){const c=i[l],h=s+l,d=l===o,u=c.id===this.player.systemId?"bright-yellow":d?"bright-cyan":"white",m=d?"> ":"  ",g=He(r.id,c.id),y=g?`${g.distance}LY  ${g.stability}`:"",C=t-4-y.length;f(n,h,2,m+c.name.toUpperCase().slice(0,C-2),u,"black"),y&&f(n,h,t-2-y.length,y,"bright-black","black")}}renderInfo(n,t,r,i,o){const a=r.id===this.player.systemId?"* Current location":r.name.toUpperCase();if(f(n,o,2,`Zone: ${r.zone}  Sec: ${r.security}  ${a}`.slice(0,t-4),"bright-black","black"),!i)return;const l=He(r.id,i.id);if(!l)return;const c=Vn(this.player.systemId,i.id),h=c?c.length===1?"(your location)":`${c.length-1} hop${c.length-1!==1?"s":""} from you`:"(unreachable)";f(n,o+1,2,`${i.name.toUpperCase()}  ${l.distance}LY  ${h}`.slice(0,t-4),"bright-black","black")}renderRouteTab(n,t,r,i){var C,I;const o=t,s=t+2,a=t+3,l=7,c=a+l,h=c+1,d=h+6,p=this.publicSystems.find(k=>k.id===this.player.systemId);f(n,o,2,"FROM:","bright-black","black"),f(n,o,8,(p==null?void 0:p.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),f(n,s,2,"TO:","bright-black","black");const u=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-l));for(let k=0;k<l;k++){const A=u+k;if(A>=this.otherSystems.length)break;const w=this.otherSystems[A],_=A===this.routeDestIdx,b=_?"bright-cyan":"white",T=_?"> ":"  ";f(n,a+k,2,T+w.name.toUpperCase(),b,"black")}Oe(n,c,i),Oe(n,d,i);const m=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!m){f(n,h,2,"No route found","bright-red","black");return}const y=m.length-1;f(n,h,2,`Route: ${y} hop${y!==1?"s":""}`,"bright-white","black");for(let k=0;k<y;k++){const A=He(m[k],m[k+1]);if(!A)continue;const w=h+1+k;if(w>=d)break;const _=(((C=this.publicSystems.find(T=>T.id===m[k]))==null?void 0:C.name)??m[k]).toUpperCase().slice(0,9),b=(((I=this.publicSystems.find(T=>T.id===m[k+1]))==null?void 0:I.name)??m[k+1]).toUpperCase().slice(0,9);f(n,w,4,`${_} -> ${b}  ${A.distance}LY  ${A.stability}`.slice(0,i-6),"white","black")}}}class te extends ge{constructor(n,t,r,i){const o={onAction:()=>{}};super(o,t,n,{navOptions:[]}),this.elapsed=0,this.arrived=!1,this.duration=r,this.onComplete=i}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const Br=["[. . .]","[: : :]","[* * *]"],Jn=5e3;class Hr extends te{constructor(n,t,r){super(n,t,Jn,r)}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/500)%3,a=Math.ceil((Jn-this.elapsed)/1e3),l=Math.max(1,Math.min(5,a)),c=We(this.player.systemId),h=c?c.name.toUpperCase():this.player.systemId.toUpperCase();M(n,o-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),M(n,o-1,"DESTINATION:","bright-black","black"),M(n,o,h,"bright-white","black"),M(n,o+2,Br[s],"bright-black","black"),M(n,o+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const Zn=2e3,$r=["[ —   ]","[  —  ]","[   — ]"];class et extends te{constructor(n,t,r,i){super(n,t,Zn,r),this.targetLabel=i}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((Zn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a)),c=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const h=this.player.destinationId?W(this.player.destinationId):null;return h?h.name.toUpperCase():"UNKNOWN"})();M(n,o-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),M(n,o-1,"HEADING TO:","bright-black","black"),M(n,o,c,"bright-white","black"),M(n,o+2,$r[s],"bright-black","black"),M(n,o+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const nt=2500,Gr=["v","vv","vvv"];class Wr extends te{constructor(n,t,r){super(n,t,nt,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((nt-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));M(n,o-3,"[ LANDING SEQUENCE ]","bright-green","black"),M(n,o+2,Gr[s],"bright-black","black"),M(n,o+4,`TOUCHDOWN IN ${l}S`,"bright-black","black")}}const tt=2500,jr=[">",">>",">>>"];class Kr extends te{constructor(n,t,r){super(n,t,tt,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((tt-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));M(n,o-3,"[ APPROACH LOCKED ]","bright-yellow","black"),M(n,o+2,jr[s],"bright-black","black"),M(n,o+4,`CLAMPING IN ${l}S`,"bright-black","black")}}const it=1500,Yr=["^","^^","^^^"];class qr extends te{constructor(n,t,r){super(n,t,it,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((it-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));M(n,o-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),M(n,o+2,Yr[s],"bright-black","black"),M(n,o+4,`CLEAR IN ${l}S`,"bright-black","black")}}const rt=1500,Vr=["<","<<","<<<"];class zr extends te{constructor(n,t,r){super(n,t,rt,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((rt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));M(n,o-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),M(n,o+2,Vr[s],"bright-black","black"),M(n,o+4,`DEPARTING IN ${l}S`,"bright-black","black")}}const ot=1500,Qr=["→","→→","→→→"];class Xr extends te{constructor(n,t,r){super(n,t,ot,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((ot-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));M(n,o-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),M(n,o+2,Qr[s],"bright-black","black"),M(n,o+4,`DOCKING IN ${l}S`,"bright-black","black")}}const st=1500,Jr=["←","←←","←←←"];class Zr extends te{constructor(n,t,r){super(n,t,st,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((st-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));M(n,o-3,"[ DEPARTING BERTH ]","bright-cyan","black"),M(n,o+2,Jr[s],"bright-black","black"),M(n,o+4,`CLEAR IN ${l}S`,"bright-black","black")}}function eo(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function no(e,n){return Math.floor(e()*n)}function pe(e,n){return n[no(e,n.length)]}function Et(e,n){const{special:t,firstNames:r,lastNames:i}=n.npcNames;if(e()<U().npc.specialNameChance&&t.length>0)return{giverName:pe(e,t)};const o=r.length>0?pe(e,r):"Unknown",s=i.length>0?pe(e,i):"Agent";return{giverName:`${o} ${s}`}}function to(e,n){return n.destinations.filter(t=>t.id!==e.id)}function io(e){return e.commodities.filter(n=>n.legal)}function ro(e,n,t,r){var m;const i=t.deliveryItems;if(i.length===0)return null;const o=to(n,t);if(o.length===0)return null;const s=pe(e,i),a=pe(e,o),l=Et(e,t),{deliveryBaseReward:c,deliveryRandomReward:h}=U().missions,d=Math.floor(s.weightKg*1.5),p=c+d+Math.floor(e()*h),u=n.owningFactionId?(m=L().factions.find(g=>g.id===n.owningFactionId&&ye(g)))==null?void 0:m.id:void 0;return{...l,giverFactionId:u,id:r,type:"delivery",title:s.name,description:`A package needs transporting. Pick up the ${s.name} from ${n.name} and deliver it to ${a.name}. Handle with care.`,reward:p,issuingDestinationId:n.id,itemName:s.name,itemWeightKg:s.weightKg,pickupDestinationId:n.id,deliveryDestinationId:a.id}}function oo(e,n,t,r){var w;const i=io(t);if(i.length===0)return null;const o=n.goodsBias.map(_=>_.toLowerCase()),s=[];for(const _ of i){const b=o.some(T=>_.category.includes(T)||_.id.includes(T)||T.includes(_.category));s.push(_),b&&s.push(_)}const{supplyRequirementsMin:a,supplyRequirementsMax:l,supplyQtyMin:c,supplyQtyMax:h}=U().missions,d=a+Math.floor(e()*(l-a+1)),p=[],u=new Set;for(let _=0;_<d;_++){let b=0;for(;b<10;){const T=pe(e,s);if(!u.has(T.id)){u.add(T.id);const E=c+Math.floor(e()*(h-c+1));p.push({commodityId:T.id,qty:E});break}b++}}if(p.length===0)return null;const m=p.reduce((_,b)=>{const T=t.commodities.find(E=>E.id===b.commodityId);return _+((T==null?void 0:T.basePrice)??100)*b.qty},0),{supplyRewardMargin:g,supplyRandomReward:y}=U().missions,C=Math.floor(m*g)+Math.floor(e()*y),I=Et(e,t),k=p.map(_=>{const b=t.commodities.find(T=>T.id===_.commodityId);return`${_.qty}× ${(b==null?void 0:b.name)??_.commodityId}`}).join(", "),A=n.owningFactionId?(w=L().factions.find(_=>_.id===n.owningFactionId&&ye(_)))==null?void 0:w.id:void 0;return{...I,giverFactionId:A,id:r,type:"supply",title:n.name,description:`${n.name} needs supplies. Deliver ${k} to fulfil the contract.`,reward:C,issuingDestinationId:n.id,requirements:p,deliveryDestinationId:n.id}}function so(e,n,t){const r=eo(t),{boardCountMin:i,boardCountMax:o,deliveryChance:s}=U().missions,a=i+Math.floor(r()*(o-i+1)),l=[];for(let c=0;c<a;c++){const h=`m-${(t>>>0).toString(16)}-${c}`,p=r()<s?ro(r,e,n,h):oo(r,e,n,h);p&&l.push(p)}return l}const ao=100;class lo{constructor(n,t,r){this.sceneBeforeMenu=null,this.traderStockCache=new Map,this.missionBoardCache=new Map,this.renderer=n,this.input=t,this.context=r;const i=Ri(),o=St(i.startingShip);this.player=new Bi({shipId:i.startingShip,driveId:o.defaultJumpDrive,credits:i.player.startingCredits,systemId:i.startingLocation.system,destinationId:i.startingLocation.destination}),this.currentScene=new Fn(this.input,this.context,this.player,()=>this.goToStory())}tick(n){const t=Math.min(n,ao),r=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(r),this.renderer.drawBuffer(r)}makeBuffer(){const n=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:n},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(n){const t=Date.now(),r=this.traderStockCache.get(n),i=U();if(r&&t-r.generatedAt<i.trading.stockTtlMs)return r.entries;const o=Fi(),{stockCountMin:s,stockCountMax:a,stockQtyMin:l,stockQtyMax:c}=i.trading,h=s+Math.floor(Math.random()*(a-s+1)),d=[...o];for(let u=d.length-1;u>0;u--){const m=Math.floor(Math.random()*(u+1));[d[u],d[m]]=[d[m],d[u]]}const p=d.slice(0,h).map(u=>({commodityId:u.id,qty:l+Math.floor(Math.random()*(c-l+1))}));return this.traderStockCache.set(n,{entries:p,generatedAt:t}),p}getOrCreateMissionBoard(n){const t=Date.now(),r=this.missionBoardCache.get(n);if(r&&t-r.generatedAt<U().missions.missionTtlMs)return r.specs;const i=W(n),o=L(),s=Math.floor(Math.random()*4294967295),a=so(i,o,s);return this.missionBoardCache.set(n,{specs:a,generatedAt:t}),a}onBuy(n,t,r,i){if(t<=0)return;const o=i.findIndex(h=>h.commodityId===n);if(o<0)return;const s=i[o];if(t>s.qty)return;const a=se(n);if(!a)return;const l=t*r;this.player.credits<l||this.player.cargoWeightKg+t*a.weightKg>this.player.cargoCapacity||(this.player.spendCredits(l),this.player.addCargo(n,t),s.qty-=t,s.qty<=0&&i.splice(o,1))}onSell(n,t,r,i){if(t<=0)return;const o=this.player.cargoHold.find(c=>c.commodityId===n);if(!o||o.qty<t||!se(n))return;const a=t*r;this.player.addCredits(a),this.player.removeCargo(n,t);const l=i.find(c=>c.commodityId===n);l?l.qty+=t:i.push({commodityId:n,qty:t})}goToMainMenu(){this.currentScene=new Fn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new zi(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new Xi(this.input,this.context,this.player,this.player.destinationId,(n,t)=>{this.player.spendCredits(n),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToLandOrDock(){var t;const n=(t=W(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new Wr(this.player,this.context,()=>this.goToStation()):n==="asteroid"?this.currentScene=new Kr(this.player,this.context,()=>this.goToStation()):this.currentScene=new Xr(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const n=(t=W(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new qr(this.player,this.context,()=>this.goToShip()):n==="asteroid"?this.currentScene=new zr(this.player,this.context,()=>this.goToShip()):this.currentScene=new Zr(this.player,this.context,()=>this.goToShip())}goToTrader(){const n=this.player.destinationId,t=this.getOrCreateTraderStock(n);this.currentScene=new Ji(this.input,this.context,this.player,n,t,(r,i,o)=>this.onBuy(r,i,o,t),(r,i,o)=>this.onSell(r,i,o,t),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionBoard(){const n=this.player.destinationId;this.currentScene=new er(this.input,this.context,this.player,n,()=>this.getOrCreateMissionBoard(n),t=>this.goToMissionDetail(t,n),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionDetail(n,t){this.currentScene=new tr(this.input,this.context,this.player,n,r=>this.onMissionAccepted(n,r,t),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock())}onMissionAccepted(n,t,r){const i=this.missionBoardCache.get(r);if(i){const o=i.specs.findIndex(s=>s.id===n.id);o>=0&&i.specs.splice(o,1)}this.player.acceptMission(n,t),this.goToMissionBoard()}goToShip(){this.currentScene=new Cr(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo(),()=>this.goToGlobalMenu())}goToCargo(){this.currentScene=new Tr(this.input,this.context,this.player,()=>this.goToShip(),()=>this.goToGlobalMenu())}buildMenuEntries(){return[{label:"MISSIONS",action:()=>this.goToMissionLog()},{label:"REPUTATION",action:()=>this.goToReputation()}]}goToMissionLog(){this.currentScene=new Wi(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToReputation(){this.currentScene=new Vi(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToGlobalMenuFromSubScene(){this.currentScene=new On(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}goToGlobalMenu(){this.sceneBeforeMenu=this.currentScene,"suspend"in this.currentScene&&this.currentScene.suspend(),this.currentScene=new On(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}returnFromMenu(){const n=this.sceneBeforeMenu;this.sceneBeforeMenu=null,n!==null?("resume"in n&&n.resume(),this.currentScene=n):this.goToShip()}goToTravelMenu(){this.currentScene=new qn(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu())}goToArrival(){this.currentScene=new qn(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu())}goToGalaxyMap(){this.currentScene=new Ur(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToGlobalMenu())}goToFlyIntoSpace(){this.player.undock(),this.currentScene=new et(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(n){this.player.dock(n),this.currentScene=new et(this.player,this.context,()=>this.goToShip())}onJumpSelected(n){const t=He(this.player.systemId,n),r=At(this.player.driveId),i=Math.ceil(U().fuel.consumptionPerLy*t.distance*r.fuelEfficiency);this.player.consumeFuel(i),this.player.jumpTo(n),this.currentScene=new Hr(this.player,this.context,()=>this.goToArrival())}}const co=`---
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
`,ho=`---
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
`,uo=`---
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
`,po=`---
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
`,mo=`---
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
`,fo=`---
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
`,go=`---
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
`,yo=`---
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
`,bo=`---
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
`,_o=`---
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
`,vo=`---
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
`,wo=`---
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
`,ko=`---
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
`,xo=`---
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
`,Co=`---
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
`,To=`---
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
`,Ao=`---
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
`,So=`---
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
`,Io=`---
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
`,Mo=`---
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
`,Eo=`---
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
`,Ro=`---
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
`,Lo=`---
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
`,Fo=`---
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
`,No=`---
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
`,Oo=`---
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
`,Po=`---
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
`,Uo=`---
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
`,Bo=`---
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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,$o=`---
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
`,Go=`---
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
`,Wo=`---
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
`,jo=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,Ko=`---
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

Long range engines for faster than light travel between systems.`,qo=`---
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
`,Vo=`---
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
`,zo=`---
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
`,Qo=`---
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
`,Xo=`---
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
`,Jo=`---
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
`,Zo=`---
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
`,es=`---
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
`,ns=`---
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
`,ts=`---
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
`,is=`---
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
`,rs=`---
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
`,os=`---
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
`,ss=`---
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
`,as=`---
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
`,ls=`---
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
`;var F={},Se={},K={};function Rt(e){return typeof e>"u"||e===null}function cs(e){return typeof e=="object"&&e!==null}function ds(e){return Array.isArray(e)?e:Rt(e)?[]:[e]}function hs(e,n){var t,r,i,o;if(n)for(o=Object.keys(n),t=0,r=o.length;t<r;t+=1)i=o[t],e[i]=n[i];return e}function us(e,n){var t="",r;for(r=0;r<n;r+=1)t+=e;return t}function ps(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}K.isNothing=Rt;K.isObject=cs;K.toArray=ds;K.repeat=us;K.isNegativeZero=ps;K.extend=hs;function Te(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}Te.prototype=Object.create(Error.prototype);Te.prototype.constructor=Te;Te.prototype.toString=function(n){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!n&&this.mark&&(t+=" "+this.mark.toString()),t};var Ie=Te,at=K;function kn(e,n,t,r,i){this.name=e,this.buffer=n,this.position=t,this.line=r,this.column=i}kn.prototype.getSnippet=function(n,t){var r,i,o,s,a;if(!this.buffer)return null;for(n=n||4,t=t||75,r="",i=this.position;i>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(i-1))===-1;)if(i-=1,this.position-i>t/2-1){r=" ... ",i+=5;break}for(o="",s=this.position;s<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s))===-1;)if(s+=1,s-this.position>t/2-1){o=" ... ",s-=5;break}return a=this.buffer.slice(i,s),at.repeat(" ",n)+r+a+o+`
`+at.repeat(" ",n+this.position-i+r.length)+"^"};kn.prototype.toString=function(n){var t,r="";return this.name&&(r+='in "'+this.name+'" '),r+="at line "+(this.line+1)+", column "+(this.column+1),n||(t=this.getSnippet(),t&&(r+=`:
`+t)),r};var ms=kn,lt=Ie,fs=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],gs=["scalar","sequence","mapping"];function ys(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(r){n[String(r)]=t})}),n}function bs(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(fs.indexOf(t)===-1)throw new lt('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=ys(n.styleAliases||null),gs.indexOf(this.kind)===-1)throw new lt('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var B=bs,ct=K,$e=Ie,_s=B;function fn(e,n,t){var r=[];return e.include.forEach(function(i){t=fn(i,n,t)}),e[n].forEach(function(i){t.forEach(function(o,s){o.tag===i.tag&&o.kind===i.kind&&r.push(s)}),t.push(i)}),t.filter(function(i,o){return r.indexOf(o)===-1})}function vs(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,t;function r(i){e[i.kind][i.tag]=e.fallback[i.tag]=i}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(r);return e}function de(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new $e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=fn(this,"implicit",[]),this.compiledExplicit=fn(this,"explicit",[]),this.compiledTypeMap=vs(this.compiledImplicit,this.compiledExplicit)}de.DEFAULT=null;de.create=function(){var n,t;switch(arguments.length){case 1:n=de.DEFAULT,t=arguments[0];break;case 2:n=arguments[0],t=arguments[1];break;default:throw new $e("Wrong number of arguments for Schema.create function")}if(n=ct.toArray(n),t=ct.toArray(t),!n.every(function(r){return r instanceof de}))throw new $e("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(r){return r instanceof _s}))throw new $e("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new de({include:n,explicit:t})};var be=de,ws=B,ks=new ws("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),xs=B,Cs=new xs("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Ts=B,As=new Ts("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Ss=be,xn=new Ss({explicit:[ks,Cs,As]}),Is=B;function Ms(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function Es(){return null}function Rs(e){return e===null}var Ls=new Is("tag:yaml.org,2002:null",{kind:"scalar",resolve:Ms,construct:Es,predicate:Rs,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Fs=B;function Ns(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function Os(e){return e==="true"||e==="True"||e==="TRUE"}function Ds(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var Ps=new Fs("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Ns,construct:Os,predicate:Ds,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),Us=K,Bs=B;function Hs(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function $s(e){return 48<=e&&e<=55}function Gs(e){return 48<=e&&e<=57}function Ws(e){if(e===null)return!1;var n=e.length,t=0,r=!1,i;if(!n)return!1;if(i=e[t],(i==="-"||i==="+")&&(i=e[++t]),i==="0"){if(t+1===n)return!0;if(i=e[++t],i==="b"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(i!=="0"&&i!=="1")return!1;r=!0}return r&&i!=="_"}if(i==="x"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(!Hs(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}for(;t<n;t++)if(i=e[t],i!=="_"){if(!$s(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}if(i==="_")return!1;for(;t<n;t++)if(i=e[t],i!=="_"){if(i===":")break;if(!Gs(e.charCodeAt(t)))return!1;r=!0}return!r||i==="_"?!1:i!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function js(e){var n=e,t=1,r,i,o=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),r=n[0],(r==="-"||r==="+")&&(r==="-"&&(t=-1),n=n.slice(1),r=n[0]),n==="0"?0:r==="0"?n[1]==="b"?t*parseInt(n.slice(2),2):n[1]==="x"?t*parseInt(n,16):t*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(s){o.unshift(parseInt(s,10))}),n=0,i=1,o.forEach(function(s){n+=s*i,i*=60}),t*n):t*parseInt(n,10)}function Ks(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!Us.isNegativeZero(e)}var Ys=new Bs("tag:yaml.org,2002:int",{kind:"scalar",resolve:Ws,construct:js,predicate:Ks,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),Lt=K,qs=B,Vs=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function zs(e){return!(e===null||!Vs.test(e)||e[e.length-1]==="_")}function Qs(e){var n,t,r,i;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,i=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(o){i.unshift(parseFloat(o,10))}),n=0,r=1,i.forEach(function(o){n+=o*r,r*=60}),t*n):t*parseFloat(n,10)}var Xs=/^[-+]?[0-9]+e/;function Js(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(Lt.isNegativeZero(e))return"-0.0";return t=e.toString(10),Xs.test(t)?t.replace("e",".e"):t}function Zs(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||Lt.isNegativeZero(e))}var ea=new qs("tag:yaml.org,2002:float",{kind:"scalar",resolve:zs,construct:Qs,predicate:Zs,represent:Js,defaultStyle:"lowercase"}),na=be,Ft=new na({include:[xn],implicit:[Ls,Ps,Ys,ea]}),ta=be,Nt=new ta({include:[Ft]}),ia=B,Ot=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Dt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function ra(e){return e===null?!1:Ot.exec(e)!==null||Dt.exec(e)!==null}function oa(e){var n,t,r,i,o,s,a,l=0,c=null,h,d,p;if(n=Ot.exec(e),n===null&&(n=Dt.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],r=+n[2]-1,i=+n[3],!n[4])return new Date(Date.UTC(t,r,i));if(o=+n[4],s=+n[5],a=+n[6],n[7]){for(l=n[7].slice(0,3);l.length<3;)l+="0";l=+l}return n[9]&&(h=+n[10],d=+(n[11]||0),c=(h*60+d)*6e4,n[9]==="-"&&(c=-c)),p=new Date(Date.UTC(t,r,i,o,s,a,l)),c&&p.setTime(p.getTime()-c),p}function sa(e){return e.toISOString()}var aa=new ia("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:ra,construct:oa,instanceOf:Date,represent:sa}),la=B;function ca(e){return e==="<<"||e===null}var da=new la("tag:yaml.org,2002:merge",{kind:"scalar",resolve:ca});function Pt(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var re;try{var ha=Pt;re=ha("buffer").Buffer}catch{}var ua=B,Cn=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function pa(e){if(e===null)return!1;var n,t,r=0,i=e.length,o=Cn;for(t=0;t<i;t++)if(n=o.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;r+=6}return r%8===0}function ma(e){var n,t,r=e.replace(/[\r\n=]/g,""),i=r.length,o=Cn,s=0,a=[];for(n=0;n<i;n++)n%4===0&&n&&(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)),s=s<<6|o.indexOf(r.charAt(n));return t=i%4*6,t===0?(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)):t===18?(a.push(s>>10&255),a.push(s>>2&255)):t===12&&a.push(s>>4&255),re?re.from?re.from(a):new re(a):a}function fa(e){var n="",t=0,r,i,o=e.length,s=Cn;for(r=0;r<o;r++)r%3===0&&r&&(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]),t=(t<<8)+e[r];return i=o%3,i===0?(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]):i===2?(n+=s[t>>10&63],n+=s[t>>4&63],n+=s[t<<2&63],n+=s[64]):i===1&&(n+=s[t>>2&63],n+=s[t<<4&63],n+=s[64],n+=s[64]),n}function ga(e){return re&&re.isBuffer(e)}var ya=new ua("tag:yaml.org,2002:binary",{kind:"scalar",resolve:pa,construct:ma,predicate:ga,represent:fa}),ba=B,_a=Object.prototype.hasOwnProperty,va=Object.prototype.toString;function wa(e){if(e===null)return!0;var n=[],t,r,i,o,s,a=e;for(t=0,r=a.length;t<r;t+=1){if(i=a[t],s=!1,va.call(i)!=="[object Object]")return!1;for(o in i)if(_a.call(i,o))if(!s)s=!0;else return!1;if(!s)return!1;if(n.indexOf(o)===-1)n.push(o);else return!1}return!0}function ka(e){return e!==null?e:[]}var xa=new ba("tag:yaml.org,2002:omap",{kind:"sequence",resolve:wa,construct:ka}),Ca=B,Ta=Object.prototype.toString;function Aa(e){if(e===null)return!0;var n,t,r,i,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1){if(r=s[n],Ta.call(r)!=="[object Object]"||(i=Object.keys(r),i.length!==1))return!1;o[n]=[i[0],r[i[0]]]}return!0}function Sa(e){if(e===null)return[];var n,t,r,i,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1)r=s[n],i=Object.keys(r),o[n]=[i[0],r[i[0]]];return o}var Ia=new Ca("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Aa,construct:Sa}),Ma=B,Ea=Object.prototype.hasOwnProperty;function Ra(e){if(e===null)return!0;var n,t=e;for(n in t)if(Ea.call(t,n)&&t[n]!==null)return!1;return!0}function La(e){return e!==null?e:{}}var Fa=new Ma("tag:yaml.org,2002:set",{kind:"mapping",resolve:Ra,construct:La}),Na=be,Me=new Na({include:[Nt],implicit:[aa,da],explicit:[ya,xa,Ia,Fa]}),Oa=B;function Da(){return!0}function Pa(){}function Ua(){return""}function Ba(e){return typeof e>"u"}var Ha=new Oa("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:Da,construct:Pa,predicate:Ba,represent:Ua}),$a=B;function Ga(e){if(e===null||e.length===0)return!1;var n=e,t=/\/([gim]*)$/.exec(e),r="";return!(n[0]==="/"&&(t&&(r=t[1]),r.length>3||n[n.length-r.length-1]!=="/"))}function Wa(e){var n=e,t=/\/([gim]*)$/.exec(e),r="";return n[0]==="/"&&(t&&(r=t[1]),n=n.slice(1,n.length-r.length-1)),new RegExp(n,r)}function ja(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function Ka(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var Ya=new $a("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:Ga,construct:Wa,predicate:Ka,represent:ja}),Ke;try{var qa=Pt;Ke=qa("esprima")}catch{typeof window<"u"&&(Ke=window.esprima)}var Va=B;function za(e){if(e===null)return!1;try{var n="("+e+")",t=Ke.parse(n,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function Qa(e){var n="("+e+")",t=Ke.parse(n,{range:!0}),r=[],i;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(o){r.push(o.name)}),i=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(r,n.slice(i[0]+1,i[1]-1)):new Function(r,"return "+n.slice(i[0],i[1]))}function Xa(e){return e.toString()}function Ja(e){return Object.prototype.toString.call(e)==="[object Function]"}var Za=new Va("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:za,construct:Qa,predicate:Ja,represent:Xa}),dt=be,Qe=dt.DEFAULT=new dt({include:[Me],explicit:[Ha,Ya,Za]}),J=K,Ut=Ie,el=ms,Bt=Me,nl=Qe,ee=Object.prototype.hasOwnProperty,Ye=1,Ht=2,$t=3,qe=4,dn=1,tl=2,ht=3,il=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,rl=/[\x85\u2028\u2029]/,ol=/[,\[\]\{\}]/,Gt=/^(?:!|!!|![a-z\-]+!)$/i,Wt=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function ut(e){return Object.prototype.toString.call(e)}function V(e){return e===10||e===13}function oe(e){return e===9||e===32}function j(e){return e===9||e===32||e===10||e===13}function he(e){return e===44||e===91||e===93||e===123||e===125}function sl(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function al(e){return e===120?2:e===117?4:e===85?8:0}function ll(e){return 48<=e&&e<=57?e-48:-1}function pt(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function cl(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function jt(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var Kt=new Array(256),Yt=new Array(256);for(var ce=0;ce<256;ce++)Kt[ce]=pt(ce)?1:0,Yt[ce]=pt(ce);function dl(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||nl,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function qt(e,n){return new Ut(n,new el(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function x(e,n){throw qt(e,n)}function Ve(e,n){e.onWarning&&e.onWarning.call(null,qt(e,n))}var mt={YAML:function(n,t,r){var i,o,s;n.version!==null&&x(n,"duplication of %YAML directive"),r.length!==1&&x(n,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(r[0]),i===null&&x(n,"ill-formed argument of the YAML directive"),o=parseInt(i[1],10),s=parseInt(i[2],10),o!==1&&x(n,"unacceptable YAML version of the document"),n.version=r[0],n.checkLineBreaks=s<2,s!==1&&s!==2&&Ve(n,"unsupported YAML version of the document")},TAG:function(n,t,r){var i,o;r.length!==2&&x(n,"TAG directive accepts exactly two arguments"),i=r[0],o=r[1],Gt.test(i)||x(n,"ill-formed tag handle (first argument) of the TAG directive"),ee.call(n.tagMap,i)&&x(n,'there is a previously declared suffix for "'+i+'" tag handle'),Wt.test(o)||x(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[i]=o}};function Z(e,n,t,r){var i,o,s,a;if(n<t){if(a=e.input.slice(n,t),r)for(i=0,o=a.length;i<o;i+=1)s=a.charCodeAt(i),s===9||32<=s&&s<=1114111||x(e,"expected valid JSON character");else il.test(a)&&x(e,"the stream contains non-printable characters");e.result+=a}}function ft(e,n,t,r){var i,o,s,a;for(J.isObject(t)||x(e,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(t),s=0,a=i.length;s<a;s+=1)o=i[s],ee.call(n,o)||(jt(n,o,t[o]),r[o]=!0)}function ue(e,n,t,r,i,o,s,a){var l,c;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),l=0,c=i.length;l<c;l+=1)Array.isArray(i[l])&&x(e,"nested arrays are not supported inside keys"),typeof i=="object"&&ut(i[l])==="[object Object]"&&(i[l]="[object Object]");if(typeof i=="object"&&ut(i)==="[object Object]"&&(i="[object Object]"),i=String(i),n===null&&(n={}),r==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)ft(e,n,o[l],t);else ft(e,n,o,t);else!e.json&&!ee.call(t,i)&&ee.call(n,i)&&(e.line=s||e.line,e.position=a||e.position,x(e,"duplicated mapping key")),jt(n,i,o),delete t[i];return n}function Tn(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):x(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function N(e,n,t){for(var r=0,i=e.input.charCodeAt(e.position);i!==0;){for(;oe(i);)i=e.input.charCodeAt(++e.position);if(n&&i===35)do i=e.input.charCodeAt(++e.position);while(i!==10&&i!==13&&i!==0);if(V(i))for(Tn(e),i=e.input.charCodeAt(e.position),r++,e.lineIndent=0;i===32;)e.lineIndent++,i=e.input.charCodeAt(++e.position);else break}return t!==-1&&r!==0&&e.lineIndent<t&&Ve(e,"deficient indentation"),r}function Xe(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||j(t)))}function An(e,n){n===1?e.result+=" ":n>1&&(e.result+=J.repeat(`
`,n-1))}function hl(e,n,t){var r,i,o,s,a,l,c,h,d=e.kind,p=e.result,u;if(u=e.input.charCodeAt(e.position),j(u)||he(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(i=e.input.charCodeAt(e.position+1),j(i)||t&&he(i)))return!1;for(e.kind="scalar",e.result="",o=s=e.position,a=!1;u!==0;){if(u===58){if(i=e.input.charCodeAt(e.position+1),j(i)||t&&he(i))break}else if(u===35){if(r=e.input.charCodeAt(e.position-1),j(r))break}else{if(e.position===e.lineStart&&Xe(e)||t&&he(u))break;if(V(u))if(l=e.line,c=e.lineStart,h=e.lineIndent,N(e,!1,-1),e.lineIndent>=n){a=!0,u=e.input.charCodeAt(e.position);continue}else{e.position=s,e.line=l,e.lineStart=c,e.lineIndent=h;break}}a&&(Z(e,o,s,!1),An(e,e.line-l),o=s=e.position,a=!1),oe(u)||(s=e.position+1),u=e.input.charCodeAt(++e.position)}return Z(e,o,s,!1),e.result?!0:(e.kind=d,e.result=p,!1)}function ul(e,n){var t,r,i;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,r=i=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(Z(e,r,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)r=e.position,e.position++,i=e.position;else return!0;else V(t)?(Z(e,r,i,!0),An(e,N(e,!1,n)),r=i=e.position):e.position===e.lineStart&&Xe(e)?x(e,"unexpected end of the document within a single quoted scalar"):(e.position++,i=e.position);x(e,"unexpected end of the stream within a single quoted scalar")}function pl(e,n){var t,r,i,o,s,a;if(a=e.input.charCodeAt(e.position),a!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=r=e.position;(a=e.input.charCodeAt(e.position))!==0;){if(a===34)return Z(e,t,e.position,!0),e.position++,!0;if(a===92){if(Z(e,t,e.position,!0),a=e.input.charCodeAt(++e.position),V(a))N(e,!1,n);else if(a<256&&Kt[a])e.result+=Yt[a],e.position++;else if((s=al(a))>0){for(i=s,o=0;i>0;i--)a=e.input.charCodeAt(++e.position),(s=sl(a))>=0?o=(o<<4)+s:x(e,"expected hexadecimal character");e.result+=cl(o),e.position++}else x(e,"unknown escape sequence");t=r=e.position}else V(a)?(Z(e,t,r,!0),An(e,N(e,!1,n)),t=r=e.position):e.position===e.lineStart&&Xe(e)?x(e,"unexpected end of the document within a double quoted scalar"):(e.position++,r=e.position)}x(e,"unexpected end of the stream within a double quoted scalar")}function ml(e,n){var t=!0,r,i=e.tag,o,s=e.anchor,a,l,c,h,d,p={},u,m,g,y;if(y=e.input.charCodeAt(e.position),y===91)l=93,d=!1,o=[];else if(y===123)l=125,d=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),y=e.input.charCodeAt(++e.position);y!==0;){if(N(e,!0,n),y=e.input.charCodeAt(e.position),y===l)return e.position++,e.tag=i,e.anchor=s,e.kind=d?"mapping":"sequence",e.result=o,!0;t||x(e,"missed comma between flow collection entries"),m=u=g=null,c=h=!1,y===63&&(a=e.input.charCodeAt(e.position+1),j(a)&&(c=h=!0,e.position++,N(e,!0,n))),r=e.line,me(e,n,Ye,!1,!0),m=e.tag,u=e.result,N(e,!0,n),y=e.input.charCodeAt(e.position),(h||e.line===r)&&y===58&&(c=!0,y=e.input.charCodeAt(++e.position),N(e,!0,n),me(e,n,Ye,!1,!0),g=e.result),d?ue(e,o,p,m,u,g):c?o.push(ue(e,null,p,m,u,g)):o.push(u),N(e,!0,n),y=e.input.charCodeAt(e.position),y===44?(t=!0,y=e.input.charCodeAt(++e.position)):t=!1}x(e,"unexpected end of the stream within a flow collection")}function fl(e,n){var t,r,i=dn,o=!1,s=!1,a=n,l=0,c=!1,h,d;if(d=e.input.charCodeAt(e.position),d===124)r=!1;else if(d===62)r=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)dn===i?i=d===43?ht:tl:x(e,"repeat of a chomping mode identifier");else if((h=ll(d))>=0)h===0?x(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?x(e,"repeat of an indentation width identifier"):(a=n+h-1,s=!0);else break;if(oe(d)){do d=e.input.charCodeAt(++e.position);while(oe(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!V(d)&&d!==0)}for(;d!==0;){for(Tn(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!s||e.lineIndent<a)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>a&&(a=e.lineIndent),V(d)){l++;continue}if(e.lineIndent<a){i===ht?e.result+=J.repeat(`
`,o?1+l:l):i===dn&&o&&(e.result+=`
`);break}for(r?oe(d)?(c=!0,e.result+=J.repeat(`
`,o?1+l:l)):c?(c=!1,e.result+=J.repeat(`
`,l+1)):l===0?o&&(e.result+=" "):e.result+=J.repeat(`
`,l):e.result+=J.repeat(`
`,o?1+l:l),o=!0,s=!0,l=0,t=e.position;!V(d)&&d!==0;)d=e.input.charCodeAt(++e.position);Z(e,t,e.position,!1)}return!0}function gt(e,n){var t,r=e.tag,i=e.anchor,o=[],s,a=!1,l;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),l=e.input.charCodeAt(e.position);l!==0&&!(l!==45||(s=e.input.charCodeAt(e.position+1),!j(s)));){if(a=!0,e.position++,N(e,!0,-1)&&e.lineIndent<=n){o.push(null),l=e.input.charCodeAt(e.position);continue}if(t=e.line,me(e,n,$t,!1,!0),o.push(e.result),N(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&l!==0)x(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return a?(e.tag=r,e.anchor=i,e.kind="sequence",e.result=o,!0):!1}function gl(e,n,t){var r,i,o,s,a=e.tag,l=e.anchor,c={},h={},d=null,p=null,u=null,m=!1,g=!1,y;for(e.anchor!==null&&(e.anchorMap[e.anchor]=c),y=e.input.charCodeAt(e.position);y!==0;){if(r=e.input.charCodeAt(e.position+1),o=e.line,s=e.position,(y===63||y===58)&&j(r))y===63?(m&&(ue(e,c,h,d,p,null),d=p=u=null),g=!0,m=!0,i=!0):m?(m=!1,i=!0):x(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,y=r;else if(me(e,t,Ht,!1,!0))if(e.line===o){for(y=e.input.charCodeAt(e.position);oe(y);)y=e.input.charCodeAt(++e.position);if(y===58)y=e.input.charCodeAt(++e.position),j(y)||x(e,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(ue(e,c,h,d,p,null),d=p=u=null),g=!0,m=!1,i=!1,d=e.tag,p=e.result;else if(g)x(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=a,e.anchor=l,!0}else if(g)x(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=a,e.anchor=l,!0;else break;if((e.line===o||e.lineIndent>n)&&(me(e,n,qe,!0,i)&&(m?p=e.result:u=e.result),m||(ue(e,c,h,d,p,u,o,s),d=p=u=null),N(e,!0,-1),y=e.input.charCodeAt(e.position)),e.lineIndent>n&&y!==0)x(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return m&&ue(e,c,h,d,p,null),g&&(e.tag=a,e.anchor=l,e.kind="mapping",e.result=c),g}function yl(e){var n,t=!1,r=!1,i,o,s;if(s=e.input.charCodeAt(e.position),s!==33)return!1;if(e.tag!==null&&x(e,"duplication of a tag property"),s=e.input.charCodeAt(++e.position),s===60?(t=!0,s=e.input.charCodeAt(++e.position)):s===33?(r=!0,i="!!",s=e.input.charCodeAt(++e.position)):i="!",n=e.position,t){do s=e.input.charCodeAt(++e.position);while(s!==0&&s!==62);e.position<e.length?(o=e.input.slice(n,e.position),s=e.input.charCodeAt(++e.position)):x(e,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!j(s);)s===33&&(r?x(e,"tag suffix cannot contain exclamation marks"):(i=e.input.slice(n-1,e.position+1),Gt.test(i)||x(e,"named tag handle cannot contain such characters"),r=!0,n=e.position+1)),s=e.input.charCodeAt(++e.position);o=e.input.slice(n,e.position),ol.test(o)&&x(e,"tag suffix cannot contain flow indicator characters")}return o&&!Wt.test(o)&&x(e,"tag name cannot contain such characters: "+o),t?e.tag=o:ee.call(e.tagMap,i)?e.tag=e.tagMap[i]+o:i==="!"?e.tag="!"+o:i==="!!"?e.tag="tag:yaml.org,2002:"+o:x(e,'undeclared tag handle "'+i+'"'),!0}function bl(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&x(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!j(t)&&!he(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&x(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function _l(e){var n,t,r;if(r=e.input.charCodeAt(e.position),r!==42)return!1;for(r=e.input.charCodeAt(++e.position),n=e.position;r!==0&&!j(r)&&!he(r);)r=e.input.charCodeAt(++e.position);return e.position===n&&x(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),ee.call(e.anchorMap,t)||x(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],N(e,!0,-1),!0}function me(e,n,t,r,i){var o,s,a,l=1,c=!1,h=!1,d,p,u,m,g;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=s=a=qe===t||$t===t,r&&N(e,!0,-1)&&(c=!0,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)),l===1)for(;yl(e)||bl(e);)N(e,!0,-1)?(c=!0,a=o,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)):a=!1;if(a&&(a=c||i),(l===1||qe===t)&&(Ye===t||Ht===t?m=n:m=n+1,g=e.position-e.lineStart,l===1?a&&(gt(e,g)||gl(e,g,m))||ml(e,m)?h=!0:(s&&fl(e,m)||ul(e,m)||pl(e,m)?h=!0:_l(e)?(h=!0,(e.tag!==null||e.anchor!==null)&&x(e,"alias node should not have any properties")):hl(e,m,Ye===t)&&(h=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(h=a&&gt(e,g))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&x(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,p=e.implicitTypes.length;d<p;d+=1)if(u=e.implicitTypes[d],u.resolve(e.result)){e.result=u.construct(e.result),e.tag=u.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else ee.call(e.typeMap[e.kind||"fallback"],e.tag)?(u=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&u.kind!==e.kind&&x(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+u.kind+'", not "'+e.kind+'"'),u.resolve(e.result)?(e.result=u.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):x(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):x(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||h}function vl(e){var n=e.position,t,r,i,o=!1,s;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(s=e.input.charCodeAt(e.position))!==0&&(N(e,!0,-1),s=e.input.charCodeAt(e.position),!(e.lineIndent>0||s!==37));){for(o=!0,s=e.input.charCodeAt(++e.position),t=e.position;s!==0&&!j(s);)s=e.input.charCodeAt(++e.position);for(r=e.input.slice(t,e.position),i=[],r.length<1&&x(e,"directive name must not be less than one character in length");s!==0;){for(;oe(s);)s=e.input.charCodeAt(++e.position);if(s===35){do s=e.input.charCodeAt(++e.position);while(s!==0&&!V(s));break}if(V(s))break;for(t=e.position;s!==0&&!j(s);)s=e.input.charCodeAt(++e.position);i.push(e.input.slice(t,e.position))}s!==0&&Tn(e),ee.call(mt,r)?mt[r](e,r,i):Ve(e,'unknown document directive "'+r+'"')}if(N(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,N(e,!0,-1)):o&&x(e,"directives end mark is expected"),me(e,e.lineIndent-1,qe,!1,!0),N(e,!0,-1),e.checkLineBreaks&&rl.test(e.input.slice(n,e.position))&&Ve(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&Xe(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,N(e,!0,-1));return}if(e.position<e.length-1)x(e,"end of the stream or a document separator is expected");else return}function Vt(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new dl(e,n),r=e.indexOf("\0");for(r!==-1&&(t.position=r,x(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)vl(t);return t.documents}function zt(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var r=Vt(e,t);if(typeof n!="function")return r;for(var i=0,o=r.length;i<o;i+=1)n(r[i])}function Qt(e,n){var t=Vt(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new Ut("expected a single document in the stream, but found more")}}function wl(e,n,t){return typeof n=="object"&&n!==null&&typeof t>"u"&&(t=n,n=null),zt(e,n,J.extend({schema:Bt},t))}function kl(e,n){return Qt(e,J.extend({schema:Bt},n))}Se.loadAll=zt;Se.load=Qt;Se.safeLoadAll=wl;Se.safeLoad=kl;var Sn={},Ee=K,Re=Ie,xl=Qe,Cl=Me,Xt=Object.prototype.toString,Jt=Object.prototype.hasOwnProperty,Tl=9,Ae=10,Al=13,Sl=32,Il=33,Ml=34,Zt=35,El=37,Rl=38,Ll=39,Fl=42,ei=44,Nl=45,ni=58,Ol=61,Dl=62,Pl=63,Ul=64,ti=91,ii=93,Bl=96,ri=123,Hl=124,oi=125,H={};H[0]="\\0";H[7]="\\a";H[8]="\\b";H[9]="\\t";H[10]="\\n";H[11]="\\v";H[12]="\\f";H[13]="\\r";H[27]="\\e";H[34]='\\"';H[92]="\\\\";H[133]="\\N";H[160]="\\_";H[8232]="\\L";H[8233]="\\P";var $l=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function Gl(e,n){var t,r,i,o,s,a,l;if(n===null)return{};for(t={},r=Object.keys(n),i=0,o=r.length;i<o;i+=1)s=r[i],a=String(n[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),l=e.compiledTypeMap.fallback[s],l&&Jt.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[s]=a;return t}function yt(e){var n,t,r;if(n=e.toString(16).toUpperCase(),e<=255)t="x",r=2;else if(e<=65535)t="u",r=4;else if(e<=4294967295)t="U",r=8;else throw new Re("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+Ee.repeat("0",r-n.length)+n}function Wl(e){this.schema=e.schema||xl,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=Ee.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=Gl(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function bt(e,n){for(var t=Ee.repeat(" ",n),r=0,i=-1,o="",s,a=e.length;r<a;)i=e.indexOf(`
`,r),i===-1?(s=e.slice(r),r=a):(s=e.slice(r,i+1),r=i+1),s.length&&s!==`
`&&(o+=t),o+=s;return o}function gn(e,n){return`
`+Ee.repeat(" ",e.indent*n)}function jl(e,n){var t,r,i;for(t=0,r=e.implicitTypes.length;t<r;t+=1)if(i=e.implicitTypes[t],i.resolve(n))return!0;return!1}function In(e){return e===Sl||e===Tl}function fe(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function Kl(e){return fe(e)&&!In(e)&&e!==65279&&e!==Al&&e!==Ae}function _t(e,n){return fe(e)&&e!==65279&&e!==ei&&e!==ti&&e!==ii&&e!==ri&&e!==oi&&e!==ni&&(e!==Zt||n&&Kl(n))}function Yl(e){return fe(e)&&e!==65279&&!In(e)&&e!==Nl&&e!==Pl&&e!==ni&&e!==ei&&e!==ti&&e!==ii&&e!==ri&&e!==oi&&e!==Zt&&e!==Rl&&e!==Fl&&e!==Il&&e!==Hl&&e!==Ol&&e!==Dl&&e!==Ll&&e!==Ml&&e!==El&&e!==Ul&&e!==Bl}function si(e){var n=/^\n* /;return n.test(e)}var ai=1,li=2,ci=3,di=4,Ge=5;function ql(e,n,t,r,i){var o,s,a,l=!1,c=!1,h=r!==-1,d=-1,p=Yl(e.charCodeAt(0))&&!In(e.charCodeAt(e.length-1));if(n)for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),!fe(s))return Ge;a=o>0?e.charCodeAt(o-1):null,p=p&&_t(s,a)}else{for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),s===Ae)l=!0,h&&(c=c||o-d-1>r&&e[d+1]!==" ",d=o);else if(!fe(s))return Ge;a=o>0?e.charCodeAt(o-1):null,p=p&&_t(s,a)}c=c||h&&o-d-1>r&&e[d+1]!==" "}return!l&&!c?p&&!i(e)?ai:li:t>9&&si(e)?Ge:c?di:ci}function Vl(e,n,t,r){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&$l.indexOf(n)!==-1)return"'"+n+"'";var i=e.indent*Math.max(1,t),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-i),s=r||e.flowLevel>-1&&t>=e.flowLevel;function a(l){return jl(e,l)}switch(ql(n,s,e.indent,o,a)){case ai:return n;case li:return"'"+n.replace(/'/g,"''")+"'";case ci:return"|"+vt(n,e.indent)+wt(bt(n,i));case di:return">"+vt(n,e.indent)+wt(bt(zl(n,o),i));case Ge:return'"'+Ql(n)+'"';default:throw new Re("impossible error: invalid scalar style")}}()}function vt(e,n){var t=si(e)?String(n):"",r=e[e.length-1]===`
`,i=r&&(e[e.length-2]===`
`||e===`
`),o=i?"+":r?"":"-";return t+o+`
`}function wt(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function zl(e,n){for(var t=/(\n+)([^\n]*)/g,r=function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,t.lastIndex=c,kt(e.slice(0,c),n)}(),i=e[0]===`
`||e[0]===" ",o,s;s=t.exec(e);){var a=s[1],l=s[2];o=l[0]===" ",r+=a+(!i&&!o&&l!==""?`
`:"")+kt(l,n),i=o}return r}function kt(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,r,i=0,o,s=0,a=0,l="";r=t.exec(e);)a=r.index,a-i>n&&(o=s>i?s:a,l+=`
`+e.slice(i,o),i=o+1),s=a;return l+=`
`,e.length-i>n&&s>i?l+=e.slice(i,s)+`
`+e.slice(s+1):l+=e.slice(i),l.slice(1)}function Ql(e){for(var n="",t,r,i,o=0;o<e.length;o++){if(t=e.charCodeAt(o),t>=55296&&t<=56319&&(r=e.charCodeAt(o+1),r>=56320&&r<=57343)){n+=yt((t-55296)*1024+r-56320+65536),o++;continue}i=H[t],n+=!i&&fe(t)?e[o]:i||yt(t)}return n}function Xl(e,n,t){var r="",i=e.tag,o,s;for(o=0,s=t.length;o<s;o+=1)le(e,n,t[o],!1,!1)&&(o!==0&&(r+=","+(e.condenseFlow?"":" ")),r+=e.dump);e.tag=i,e.dump="["+r+"]"}function Jl(e,n,t,r){var i="",o=e.tag,s,a;for(s=0,a=t.length;s<a;s+=1)le(e,n+1,t[s],!0,!0)&&((!r||s!==0)&&(i+=gn(e,n)),e.dump&&Ae===e.dump.charCodeAt(0)?i+="-":i+="- ",i+=e.dump);e.tag=o,e.dump=i||"[]"}function Zl(e,n,t){var r="",i=e.tag,o=Object.keys(t),s,a,l,c,h;for(s=0,a=o.length;s<a;s+=1)h="",s!==0&&(h+=", "),e.condenseFlow&&(h+='"'),l=o[s],c=t[l],le(e,n,l,!1,!1)&&(e.dump.length>1024&&(h+="? "),h+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),le(e,n,c,!1,!1)&&(h+=e.dump,r+=h));e.tag=i,e.dump="{"+r+"}"}function ec(e,n,t,r){var i="",o=e.tag,s=Object.keys(t),a,l,c,h,d,p;if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys=="function")s.sort(e.sortKeys);else if(e.sortKeys)throw new Re("sortKeys must be a boolean or a function");for(a=0,l=s.length;a<l;a+=1)p="",(!r||a!==0)&&(p+=gn(e,n)),c=s[a],h=t[c],le(e,n+1,c,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&Ae===e.dump.charCodeAt(0)?p+="?":p+="? "),p+=e.dump,d&&(p+=gn(e,n)),le(e,n+1,h,!0,d)&&(e.dump&&Ae===e.dump.charCodeAt(0)?p+=":":p+=": ",p+=e.dump,i+=p));e.tag=o,e.dump=i||"{}"}function xt(e,n,t){var r,i,o,s,a,l;for(i=t?e.explicitTypes:e.implicitTypes,o=0,s=i.length;o<s;o+=1)if(a=i[o],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof n=="object"&&n instanceof a.instanceOf)&&(!a.predicate||a.predicate(n))){if(e.tag=t?a.tag:"?",a.represent){if(l=e.styleMap[a.tag]||a.defaultStyle,Xt.call(a.represent)==="[object Function]")r=a.represent(n,l);else if(Jt.call(a.represent,l))r=a.represent[l](n,l);else throw new Re("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');e.dump=r}return!0}return!1}function le(e,n,t,r,i,o){e.tag=null,e.dump=t,xt(e,t,!1)||xt(e,t,!0);var s=Xt.call(e.dump);r&&(r=e.flowLevel<0||e.flowLevel>n);var a=s==="[object Object]"||s==="[object Array]",l,c;if(a&&(l=e.duplicates.indexOf(t),c=l!==-1),(e.tag!==null&&e.tag!=="?"||c||e.indent!==2&&n>0)&&(i=!1),c&&e.usedDuplicates[l])e.dump="*ref_"+l;else{if(a&&c&&!e.usedDuplicates[l]&&(e.usedDuplicates[l]=!0),s==="[object Object]")r&&Object.keys(e.dump).length!==0?(ec(e,n,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(Zl(e,n,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump));else if(s==="[object Array]"){var h=e.noArrayIndent&&n>0?n-1:n;r&&e.dump.length!==0?(Jl(e,h,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(Xl(e,h,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump))}else if(s==="[object String]")e.tag!=="?"&&Vl(e,e.dump,n,o);else{if(e.skipInvalid)return!1;throw new Re("unacceptable kind of an object to dump "+s)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function nc(e,n){var t=[],r=[],i,o;for(yn(e,t,r),i=0,o=r.length;i<o;i+=1)n.duplicates.push(t[r[i]]);n.usedDuplicates=new Array(o)}function yn(e,n,t){var r,i,o;if(e!==null&&typeof e=="object")if(i=n.indexOf(e),i!==-1)t.indexOf(i)===-1&&t.push(i);else if(n.push(e),Array.isArray(e))for(i=0,o=e.length;i<o;i+=1)yn(e[i],n,t);else for(r=Object.keys(e),i=0,o=r.length;i<o;i+=1)yn(e[r[i]],n,t)}function hi(e,n){n=n||{};var t=new Wl(n);return t.noRefs||nc(e,t),le(t,0,e,!0,!0)?t.dump+`
`:""}function tc(e,n){return hi(e,Ee.extend({schema:Cl},n))}Sn.dump=hi;Sn.safeDump=tc;var Je=Se,ui=Sn;function Ze(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}F.Type=B;F.Schema=be;F.FAILSAFE_SCHEMA=xn;F.JSON_SCHEMA=Ft;F.CORE_SCHEMA=Nt;F.DEFAULT_SAFE_SCHEMA=Me;F.DEFAULT_FULL_SCHEMA=Qe;F.load=Je.load;F.loadAll=Je.loadAll;F.safeLoad=Je.safeLoad;F.safeLoadAll=Je.safeLoadAll;F.dump=ui.dump;F.safeDump=ui.safeDump;F.YAMLException=Ie;F.MINIMAL_SCHEMA=xn;F.SAFE_SCHEMA=Me;F.DEFAULT_SCHEMA=Qe;F.scan=Ze("scan");F.parse=Ze("parse");F.compose=Ze("compose");F.addConstructor=Ze("addConstructor");var ic=F,rc=ic;function oc(e){if(!e.startsWith(`---
`))return{data:{},content:e};const n=e.indexOf(`
---`,4);if(n===-1)return{data:{},content:e};const t=e.slice(4,n),r=e.slice(n+4),i=r.startsWith(`
`)?r.slice(1):r;return{data:rc.safeLoad(t)??{},content:i}}const pi={npc:{specialNameChance:.3},missions:{boardCountMin:3,boardCountMax:6,missionTtlMs:9e5,deliveryChance:.6,deliveryBaseReward:200,deliveryRandomReward:200,supplyRewardMargin:.4,supplyRandomReward:150,supplyRequirementsMin:1,supplyRequirementsMax:2,supplyQtyMin:1,supplyQtyMax:4},trading:{stockCountMin:4,stockCountMax:6,stockQtyMin:1,stockQtyMax:8,stockTtlMs:12e4},fuel:{pricePerLitre:10,consumptionPerLy:5},reputation:{levelUnfriendlyMin:-300,levelNeutralMin:-100,levelFriendlyMin:100,levelLikedMin:300,levelReveredMin:600,pointsMin:-600,pointsMax:1e3,missionDeltaSmall:25,missionDeltaMedium:75,missionDeltaLarge:200,missionTierMediumReward:300,missionTierLargeReward:600,tradeModifierHated:1.2,tradeModifierUnfriendly:1.1,tradeModifierNeutral:1,tradeModifierFriendly:.92,tradeModifierLiked:.85,tradeModifierRevered:.8,repPerCredit:.01,maxRepPerVisit:10}};function sc(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},balance:{...pi},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[t,r]of Object.entries(e)){const i=t.split("/").pop()??"";if(i==="_template.md"||i===".gitkeep")continue;const{data:o,content:s}=oc(r);/^systems\/[^/]+\.md$/.test(t)?n.systems.push(ac(o,s)):/^destinations\/[^/]+\.md$/.test(t)?n.destinations.push(lc(o,s)):/^factions\/[^/]+\.md$/.test(t)?n.factions.push(cc(o,s)):/^ships\/[^/]+\.md$/.test(t)?n.ships.push(dc(o,s)):t==="ships/components/jump-drives.md"?n.drives=hc(o):t==="navigation/jump-routes.md"?n.routes=uc(o):t==="commodities.md"?n.commodities=pc(o):/^story\/[^/]+\.md$/.test(t)?n.storyBeats.push(mc(o,s)):t==="settings/new-game.md"?n.settings=fc(o):t==="settings/balance.md"?n.balance=bc(o):t==="delivery-items.md"?n.deliveryItems=gc(o):t==="npc-names.md"&&(n.npcNames=yc(o))}return n}function en(e){const n=[];let t=!1;for(const r of e.split(`
`)){const i=r.trim();if(!i.startsWith("#"))if(i===""){if(t)break}else t=!0,n.push(i)}return n.join(" ")}function ac(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economy:e.economy??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:en(n)}}function lc(e,n){const t=e.amenities??{},r={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:r,npcs:e.npcs??{},goodsBias:e.goods_bias??[],dangerLevel:e.danger_level,tags:e.tags??[],description:en(n),owningFactionId:e.owning_faction}}function cc(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:en(n),rivals:e.rivals??[],allies:e.allies??[]}}function dc(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,tags:e.tags??[],description:en(n)}}function hc(e){return(e.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function uc(e){return(e.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function pc(e){return(e.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function mc(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function fc(e){var n,t,r,i;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((t=e.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((r=e.starting_location)==null?void 0:r.system)??"",destination:((i=e.starting_location)==null?void 0:i.destination)??""},startingShip:e.starting_ship??""}}function gc(e){return(e.delivery_items??[]).map(t=>({id:t.id,name:t.name,weightKg:t.weight_kg}))}function yc(e){const n=e.npc_names??{};return{special:n.special??[],firstNames:n.first_names??[],lastNames:n.last_names??[]}}function bc(e){const n=pi,t=e.npc??{},r=e.missions??{},i=e.trading??{},o=e.fuel??{},s=e.reputation??{};return{npc:{specialNameChance:t.special_name_chance??n.npc.specialNameChance},missions:{boardCountMin:r.board_count_min??n.missions.boardCountMin,boardCountMax:r.board_count_max??n.missions.boardCountMax,missionTtlMs:r.mission_ttl_ms??n.missions.missionTtlMs,deliveryChance:r.delivery_chance??n.missions.deliveryChance,deliveryBaseReward:r.delivery_base_reward??n.missions.deliveryBaseReward,deliveryRandomReward:r.delivery_random_reward??n.missions.deliveryRandomReward,supplyRewardMargin:r.supply_reward_margin??n.missions.supplyRewardMargin,supplyRandomReward:r.supply_random_reward??n.missions.supplyRandomReward,supplyRequirementsMin:r.supply_requirements_min??n.missions.supplyRequirementsMin,supplyRequirementsMax:r.supply_requirements_max??n.missions.supplyRequirementsMax,supplyQtyMin:r.supply_qty_min??n.missions.supplyQtyMin,supplyQtyMax:r.supply_qty_max??n.missions.supplyQtyMax},trading:{stockCountMin:i.stock_count_min??n.trading.stockCountMin,stockCountMax:i.stock_count_max??n.trading.stockCountMax,stockQtyMin:i.stock_qty_min??n.trading.stockQtyMin,stockQtyMax:i.stock_qty_max??n.trading.stockQtyMax,stockTtlMs:i.stock_ttl_ms??n.trading.stockTtlMs},fuel:{pricePerLitre:o.price_per_litre??n.fuel.pricePerLitre,consumptionPerLy:o.consumption_per_ly??n.fuel.consumptionPerLy},reputation:{levelUnfriendlyMin:s.level_unfriendly_min??n.reputation.levelUnfriendlyMin,levelNeutralMin:s.level_neutral_min??n.reputation.levelNeutralMin,levelFriendlyMin:s.level_friendly_min??n.reputation.levelFriendlyMin,levelLikedMin:s.level_liked_min??n.reputation.levelLikedMin,levelReveredMin:s.level_revered_min??n.reputation.levelReveredMin,pointsMin:s.points_min??n.reputation.pointsMin,pointsMax:s.points_max??n.reputation.pointsMax,missionDeltaSmall:s.mission_delta_small??n.reputation.missionDeltaSmall,missionDeltaMedium:s.mission_delta_medium??n.reputation.missionDeltaMedium,missionDeltaLarge:s.mission_delta_large??n.reputation.missionDeltaLarge,missionTierMediumReward:s.mission_tier_medium_reward??n.reputation.missionTierMediumReward,missionTierLargeReward:s.mission_tier_large_reward??n.reputation.missionTierLargeReward,tradeModifierHated:s.trade_modifier_hated??n.reputation.tradeModifierHated,tradeModifierUnfriendly:s.trade_modifier_unfriendly??n.reputation.tradeModifierUnfriendly,tradeModifierNeutral:s.trade_modifier_neutral??n.reputation.tradeModifierNeutral,tradeModifierFriendly:s.trade_modifier_friendly??n.reputation.tradeModifierFriendly,tradeModifierLiked:s.trade_modifier_liked??n.reputation.tradeModifierLiked,tradeModifierRevered:s.trade_modifier_revered??n.reputation.tradeModifierRevered,repPerCredit:s.rep_per_credit??n.reputation.repPerCredit,maxRepPerVisit:s.max_rep_per_visit??n.reputation.maxRepPerVisit}}}function _c(){const e=Object.assign({"/docs/world/commodities.md":co,"/docs/world/delivery-items.md":ho,"/docs/world/destinations/_template.md":uo,"/docs/world/destinations/blackwake-yard.md":po,"/docs/world/destinations/ceti-landfall.md":mo,"/docs/world/destinations/drift-market.md":fo,"/docs/world/destinations/elysium-station.md":go,"/docs/world/destinations/eridani-anchorage.md":yo,"/docs/world/destinations/foundries-platform.md":bo,"/docs/world/destinations/galileo-transfer.md":_o,"/docs/world/destinations/hestia-ring.md":vo,"/docs/world/destinations/keelhaul-station.md":wo,"/docs/world/destinations/kepler-yard.md":ko,"/docs/world/destinations/mars-anchor.md":xo,"/docs/world/destinations/meridian-station.md":Co,"/docs/world/destinations/new-horizon-port.md":To,"/docs/world/destinations/orrery-anchorage.md":Ao,"/docs/world/destinations/redline-station.md":So,"/docs/world/destinations/tycho-orbital.md":Io,"/docs/world/destinations/veil-station.md":Mo,"/docs/world/destinations/waypoint-ceti.md":Eo,"/docs/world/factions/_template.md":Ro,"/docs/world/factions/centauri-trade-league.md":Lo,"/docs/world/factions/eridani-colonial-council.md":Fo,"/docs/world/factions/free-captains.md":No,"/docs/world/factions/grey-market-cartel.md":Oo,"/docs/world/factions/helios-directorate.md":Do,"/docs/world/factions/independent-miners-guild.md":Po,"/docs/world/factions/procyon-institute.md":Uo,"/docs/world/factions/terran-union.md":Bo,"/docs/world/galaxy-map.md":Ho,"/docs/world/navigation/jump-routes.md":$o,"/docs/world/npc-names.md":Go,"/docs/world/settings/balance.md":Wo,"/docs/world/settings/new-game.md":jo,"/docs/world/ships/_template.md":Ko,"/docs/world/ships/components/jump-drives.md":Yo,"/docs/world/ships/freighter.md":qo,"/docs/world/ships/hauler.md":Vo,"/docs/world/ships/scout.md":zo,"/docs/world/story/_template.md":Qo,"/docs/world/story/enter-wolf-359.md":Xo,"/docs/world/story/first-jump.md":Jo,"/docs/world/story/opening-arrival.md":Zo,"/docs/world/systems/_template.md":es,"/docs/world/systems/alpha-centauri.md":ns,"/docs/world/systems/barnards-star.md":ts,"/docs/world/systems/epsilon-eridani.md":is,"/docs/world/systems/procyon.md":rs,"/docs/world/systems/sirius.md":os,"/docs/world/systems/sol.md":ss,"/docs/world/systems/tau-ceti.md":as,"/docs/world/systems/wolf-359.md":ls}),n={};for(const[t,r]of Object.entries(e)){const i=t.replace("/docs/world/","");n[i]=r}return sc(n)}Mi(_c());const vc=navigator.maxTouchPoints>0?"touch":"keyboard",wc=new URLSearchParams(window.location.search).has("debug"),mi={environment:"browser",primaryInput:vc,debug:wc},kc=new vi,fi=new Ci(mi);fi.connect();const xc=new lo(kc,fi,mi);let Ct=0;function gi(e){xc.tick(e-Ct),Ct=e,requestAnimationFrame(gi)}requestAnimationFrame(gi);
