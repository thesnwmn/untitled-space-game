(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const ve=40,Oe=30,yi=50,rn=24;function bi(n){return n==="&"?"&amp;":n==="<"?"&lt;":n===">"?"&gt;":n}class _i{constructor(){this.charW=0,this.charH=0,this.gridH=Oe,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(ve),this.pre.dataset.gridRows=String(Oe),document.body.appendChild(this.pre);const e=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${rn}px "Share Tech Mono"`).catch(()=>null)]).then(e),document.fonts.addEventListener("loadingdone",e),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const e=document.createElement("span");e.style.fontFamily="'Share Tech Mono', monospace",e.style.fontSize=`${rn}px`,e.style.lineHeight="1em",e.style.position="absolute",e.style.visibility="hidden",e.textContent="M",document.body.appendChild(e);const t=e.getBoundingClientRect();document.body.removeChild(e),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const e=Math.min(window.innerWidth/(ve*this.charW),window.innerHeight/(Oe*this.charH)),t=Math.max(Oe,Math.min(yi,Math.floor(window.innerHeight/(this.charH*e))));if(this.pre.style.fontSize=`${rn*e}px`,this.pre.style.width=`${ve*this.charW*e}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const r of this.resizeHandlers)r(ve,t)}}onResize(e){this.resizeHandlers.push(e)}drawBuffer(e){const t=[];for(const r of e){let i="";for(const o of r){const s=o.fg!=="transparent"?`fg-${o.fg}`:"",a=o.bg!=="transparent"?`bg-${o.bg}`:"",l=s&&a?`${s} ${a}`:s||a,c=l?` class="${l}"`:"";i+=`<span${c}>${bi(o.char)}</span>`}t.push(i)}this.pre.innerHTML=t.join(`
`)}getWidth(){return ve}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const vi={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",m:"MENU",M:"MENU",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},wi=new Set(["0","1","2","3","4","5","6","7","8","9"]),ki=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class xi{constructor(e){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=e.debug}logDebug(e){if(this.debugMode){if(this.debugLog.unshift(e),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(e){this.actionHandlers.push(e)}onTap(e){this.tapHandlers.push(e)}onCharInput(e){this.charInputHandlers.push(e)}connect(){this.keyListener=e=>{if(ki.has(e.key)&&e.preventDefault(),wi.has(e.key))for(const r of this.charInputHandlers.slice())r(e.key);if(e.key==="Backspace"||e.key==="Delete"){for(const r of this.charInputHandlers.slice())r("\b");return}const t=vi[e.key];if(t)for(const r of this.actionHandlers.slice())r(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=e=>{e.preventDefault(),this.pointerStartMap.set(e.pointerId,{startX:e.clientX,startY:e.clientY}),this.activePointers.add(e.pointerId),this.logDebug(`DOWN id=${e.pointerId} (${Math.round(e.clientX)},${Math.round(e.clientY)}) type=${e.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=e=>{const t=this.pointerStartMap.get(e.pointerId),r=this.activePointers.size;if(this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId),!t){this.logDebug(`UP id=${e.pointerId} NO START`);return}const i=e.clientX-t.startX,o=e.clientY-t.startY,s=Math.abs(i),a=Math.abs(o);if(s<20&&a<20)if(r>=2){this.logDebug(`UP id=${e.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;s>=a?l=i>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(i)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=e=>{this.logDebug(`CANCEL id=${e.pointerId}`),this.activePointers.delete(e.pointerId),this.pointerStartMap.delete(e.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const e=document.querySelector(".game-screen");if(!e)return"NO PRE";const t=e.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(e,t){const r=document.querySelector(".game-screen");if(!r)return null;const i=r.getBoundingClientRect(),o=parseInt(r.dataset.gridCols??"1"),s=parseInt(r.dataset.gridRows??"1");if(!o||!s||!i.width||!i.height)return null;const a=Math.floor((e-i.left)/(i.width/o)),l=Math.floor((t-i.top)/(i.height/s));return a<0||a>=o||l<0||l>=s?null:{col:a,row:l}}}function f(n,e,t,r,i,o){if(e<0||e>=n.length)return;const s=n[e];for(let a=0;a<r.length;a++){const l=t+a;l>=0&&l<s.length&&(s[l]={char:r[a],fg:i,bg:o})}}function M(n,e,t,r,i){if(e<0||e>=n.length)return;const o=n[e].length,s=Math.max(0,Math.floor((o-t.length)/2));f(n,e,s,t,r,i)}function ze(n,e){const t=n.split(/\s+/).filter(Boolean),r=[];let i="";for(const o of t)i.length===0?i=o:i.length+1+o.length<=e?i+=" "+o:(r.push(i),i=o);return i.length>0&&r.push(i),r}function Ce(n,e,t,r="bright-black"){f(n,e,0,"-".repeat(t),r,"black")}function At(n,e,t,r,i){const o=`${r+1}/${i}`;f(n,e,0,"|<|","white","black");const s=Math.floor((t-o.length)/2);f(n,e,s,o,"bright-black","black"),f(n,e,t-3,"|>|","white","black")}const Fn=["UNTITLED","SPACE GAME"],Ci=4,Ti=3,Ai="- An ASCII space adventure -",Ii=11,Nn=16;class On{constructor(e,t,r,i){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,i()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),e.onAction(o=>{this.activated||(o==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:o==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:o==="SELECT"&&this.items[this.cursorIdx].action())}),e.onTap&&e.onTap((o,s)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(s===Nn+a){this.cursorIdx=a,this.items[a].action();return}}})}update(e){}render(e){const t=e.length,r=t>0?e[0].length:0;for(let s=0;s<t;s++)for(let a=0;a<r;a++)e[s][a]={char:" ",fg:"black",bg:"black"};for(let s=0;s<Fn.length;s++)M(e,Ci+s*Ti,Fn[s],"bright-cyan","black");M(e,Ii,Ai,"white","black");const i=this.items.reduce((s,a)=>Math.max(s,a.label.length+2),0),o=Math.max(0,Math.floor((r-i)/2));for(let s=0;s<this.items.length;s++){const a=Nn+s;if(a>=t)continue;const l=s===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";f(e,a,o,c+this.items[s].label,h,"black")}}}let hn=null;function Si(n){hn=n}function R(){if(hn===null)throw new Error("World not initialised — call initWorld() before accessing world data");return hn}function We(n){return R().systems.find(e=>e.id===n)}function W(n){return R().destinations.find(e=>e.id===n)}function _n(n){return R().routes.filter(e=>e.from===n||e.to===n)}function It(n){return R().drives.find(e=>e.id===n)}function Mi(n){return R().storyBeats.filter(e=>e.trigger===n)}function Ei(){return R().settings}function U(){return R().balance}function un(n){return R().ships.find(e=>e.id===n)}function He(n,e){return R().routes.find(t=>t.from===n&&t.to===e||t.from===e&&t.to===n)}function Ri(n){return R().factions.find(e=>e.id===n)}function se(n){return R().commodities.find(e=>e.id===n)}function Li(){return R().commodities}function Fi(){return R().systems.filter(n=>n.playerKnowledge==="public")}function Ni(n){return n.reduce((e,t)=>{const r=se(t.commodityId);return e+t.qty*((r==null?void 0:r.weightKg)??0)},0)}const ee=3,Dn=0;function vn(n,e){return e?n-2:n}function Oi(n){return n.toLocaleString("en-US")}class Di{constructor(e,t){this.buttonRanges=null,this.footerRow=-1,this.headerWidth=-1,this.context=e,this.player=t}render(e,t){const r=e.length,i=r>0?e[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader?(this.headerWidth=i,this.renderHeaderRow0(e,i,t.systemLabel),this.renderHeaderRow1(e,i,t.destinationLabel)):this.headerWidth=-1,t.showFooter&&(this.renderFooter(e,r,i,t.navOptions),this.footerRow=r-1)}renderHeaderRow0(e,t,r){const i=r!==void 0?r??"":(()=>{const c=We(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),o="::";f(e,0,0,o,"bright-black","black"),f(e,0,o.length,i,"bright-cyan","black");const a=t-o.length-i.length-10;let l=o.length+i.length;for(let c=0;c<a;c++)e[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,f(e,0,l,"[M]","white","black"),l+=3,f(e,0,l," MENU","white","black"),l+=5,f(e,0,l,"::","bright-black","black")}renderHeaderRow1(e,t,r){const i=r!==void 0?r??"":(()=>{const h=this.player.destinationId?W(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),o=Oi(this.player.credits),s=o.length+5,a="::";f(e,1,0,a,"bright-black","black"),f(e,1,a.length,i,"cyan","black");const l=t-a.length-i.length-s;let c=a.length+i.length;for(let h=0;h<l;h++)e[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,f(e,1,c,o,"green","black"),c+=o.length,f(e,1,c," CR","white","black"),c+=3,f(e,1,c,"::","bright-black","black")}renderFooter(e,t,r,i){const o=t-1,s=[];if(i.length===0){for(let l=0;l<r;l++)e[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}f(e,o,0,"::","bright-black","black");let a=2;for(let l=0;l<i.length;l++){l>0&&(f(e,o,a,"::","bright-black","black"),a+=2);const c=i[l],h=`[${l+1}]`,d=` ${c.label}`,p=a;f(e,o,a,h,"white","black"),a+=h.length,f(e,o,a,d,"white","black"),a+=d.length,s.push({id:c.id,startCol:p,endCol:a})}for(let l=a;l<r;l++)e[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=s}hitTestNav(e,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const r of this.buttonRanges)if(e>=r.startCol&&e<r.endCol)return r.id;return null}hitTestHeader(e,t){if(this.headerWidth<0||t!==0)return null;const r=this.headerWidth-10,i=this.headerWidth-2;return e>=r&&e<i?"menu":null}}class le{constructor(e,t,r,i){this.activeTabIdx=0,this.activated=!1,this.player=r,this.chrome=new Di(t,r),this.opts=i,e.onCharInput&&e.onCharInput(o=>{this.activated||this.handleCharInput(o)}),e.onAction(o=>{if(!this.activated&&!this.preHandleAction(o)){if(o==="MENU"&&i.onMenu){i.onMenu();return}if(i.tabs){if(o==="LEFT"){const s=Math.max(0,this.activeTabIdx-1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}if(o==="RIGHT"){const s=Math.min(i.tabs.length-1,this.activeTabIdx+1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}}this.handleAction(o)}}),e.onTap&&e.onTap((o,s)=>{var l;if(this.activated||this.preHandleTap(o,s))return;const a=this.chrome.hitTestNav(o,s);if(a!==null){this.handleNavTap(a);return}if(this.chrome.hitTestHeader(o,s)==="menu"&&i.onMenu){i.onMenu();return}if(i.tabs&&i.title!==void 0){const c=i.showHeader??!0?ee:Dn,h=((l=i.summary)==null?void 0:l.length)??0,d=c+3+h;if(s===d){let p=3;for(let u=0;u<i.tabs.length;u++){const m=i.tabs[u].length+2;if(o>=p&&o<p+m){u!==this.activeTabIdx&&(this.activeTabIdx=u,this.onTabChange(u));return}p+=m+1}return}}this.handleTap(o,s)})}preHandleAction(e){return!1}preHandleTap(e,t){return!1}handleAction(e){}handleTap(e,t){}handleNavTap(e){}handleCharInput(e){}onTabChange(e){}buildChromeConfig(){return{showHeader:this.opts.showHeader??!0,showFooter:this.opts.showFooter??!0,navOptions:this.opts.navOptions}}suspend(){this.activated=!0}resume(){this.activated=!1}update(e){}render(e){var p;const t=e.length,r=t>0?e[0].length:0,i=this.opts;for(let u=0;u<t;u++)for(let m=0;m<r;m++)e[u][m]={char:" ",fg:"black",bg:"black"};const o=this.buildChromeConfig();this.chrome.render(e,o);const s=i.showHeader??!0,a=i.showFooter??!0,l=s?ee:Dn,c=((p=i.summary)==null?void 0:p.length)??0,h=vn(t,a);let d;if(i.title!==void 0){f(e,l,2,i.title,"bright-white","black"),f(e,l+1,2,"'".repeat(i.title.length),"bright-black","black");for(let u=0;u<c;u++)f(e,l+2+u,2,i.summary[u],"bright-black","black");if(i.tabs){const u=l+3+c;let m=2;u<t&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++;for(let g=0;g<i.tabs.length;g++){const b=g===this.activeTabIdx,C=` ${i.tabs[g]} `,I=b?"black":"white",v=b?"green":"black";for(const A of C)u<t&&m<r&&(e[u][m]={char:A,fg:I,bg:v}),m++;u<t&&m<r&&(e[u][m]={char:"|",fg:"bright-black",bg:"black"}),m++}d=l+5+c}else d=l+3+c}else d=l;this.renderContent(e,d,h)}}class ce extends le{constructor(e,t,r,i,o,s,a=[],l=null,c){super(i,o,s,{navOptions:r,title:e,summary:a,tabs:l!==null?l.map(d=>d.label):void 0,onMenu:c}),this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.modal=null,this.lastContentTop=0,this._staticItems=t,this.tabs=l,this.infoLines=a;const h=a.length;this.lastContentTop=l!==null?ee+5+h:ee+3+h,this.resetCursor()}get items(){var e;return this.tabs!==null?((e=this.tabs[this.activeTabIdx])==null?void 0:e.items)??[]:this._staticItems}preHandleAction(e){return this.modal!==null?(this.modal.handleAction(e),!0):!1}preHandleTap(e,t){return this.modal!==null?(this.modal.handleTap(e,t),!0):!1}handleCharInput(e){this.modal!==null&&this.modal.handleCharInput(e)}onTabChange(e){this.resetCursor()}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):e==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):e==="SELECT"?this.activateCurrent():this.handleNavAction(e)}handleTap(e,t){const r=this.rowToVisibleItemIndex(t);r!==null&&!this.items[r].disabled&&(this.cursorIdx=r,this.activateCurrent())}moveCursor(e){const t=this.items,r=t.length;if(r===0)return;const i=this.cursorIdx===-1?e>0?r-1:0:this.cursorIdx;for(let o=0;o<r;o++){const s=((i+e*(o+1))%r+r)%r;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const e=this.items[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}rowToVisibleItemIndex(e){var i,o;let t=this.lastContentTop;const r=this.items;for(let s=0;s<r.length;s++){const a=1+(((i=r[s].details)==null?void 0:i.length)??0)+(((o=r[s].detailsColored)==null?void 0:o.length)??0);if(e>=t&&e<t+a)return s;t+=a}return null}resetCursor(){const e=this.items;for(let t=0;t<e.length;t++)if(!e[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(e){}openModal(e){this.modal=e,this.activated=!1}closeModal(){this.modal=null}renderContent(e,t,r){var I,v,A,k;this.lastContentTop=t;const o=e.length>0?e[0].length:0,s=r-1,a=s-t,l=this.items,c=l.map(_=>{var y,T;return 1+(((y=_.details)==null?void 0:y.length)??0)+(((T=_.detailsColored)==null?void 0:T.length)??0)}),d=c.reduce((_,y)=>_+y,0)>a,p=d?a-1:a,u=[];let m=[],g=0;for(let _=0;_<c.length;_++)g+c[_]>p?(m.length>0&&u.push(m),m=[_],g=c[_]):(m.push(_),g+=c[_]);m.length>0&&u.push(m),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const b=u[this.pageIndex]??[];let C=t;for(const _ of b){const y=l[_],T=_===this.cursorIdx,E=y.disabled?"bright-black":T?"bright-green":y.accentFg??"white",Y=y.infoFg??E,O=o-4;if(y.icon!==void 0){const L=y.icon.length;if(f(e,C,2,T?">":" ",E,"black"),f(e,C,3,y.icon,y.iconFg??E,"black"),y.info!==void 0){const P=y.info.length,S=Math.max(0,O-1-L-2-P-1),w=y.label.length>S?y.label.slice(0,S):y.label,G=Math.max(1,O-1-L-w.length-2-P);f(e,C,3+L,w+" ",E,"black"),f(e,C,3+L+w.length+1,".".repeat(G),"bright-black","black"),f(e,C,3+L+w.length+1+G+1,y.info,Y,"black")}else f(e,C,3+L,y.label.slice(0,O-1-L),E,"black");for(let P=0;P<(((I=y.details)==null?void 0:I.length)??0);P++)C+1+P<=s&&f(e,C+1+P,2,("  "+y.details[P]).slice(0,O),y.detailsFg??"bright-black","black")}else if(y.info!==void 0){const L=T?"> ":"  ",D=Math.max(1,O-2-y.label.length-2-y.info.length);f(e,C,2,L+y.label+" ",E,"black"),f(e,C,2+L.length+y.label.length+1,".".repeat(D),"bright-black","black"),f(e,C,2+L.length+y.label.length+1+D+1,y.info,Y,"black")}else if(y.details!==void 0&&y.details.length>0){f(e,C,2,((T?"> ":"  ")+y.label).slice(0,O),E,"black");for(let D=0;D<y.details.length;D++)C+1+D<=s&&f(e,C+1+D,2,("  "+y.details[D]).slice(0,O),y.detailsFg??"bright-black","black")}else f(e,C,2,((T?"> ":"  ")+y.label).slice(0,O),E,"black");const z=((v=y.details)==null?void 0:v.length)??0;for(let L=0;L<(((A=y.detailsColored)==null?void 0:A.length)??0);L++){const D=C+1+z+L;if(D<=s){const P=y.detailsColored[L];let S=4;for(const w of P.left)f(e,D,S,w.text,w.fg,"black"),S+=w.text.length;if(P.right!==void 0){const w=O-4-P.right.text.length;f(e,D,w,P.right.text,P.right.fg,"black")}}}C+=1+z+(((k=y.detailsColored)==null?void 0:k.length)??0)}d&&At(e,s,o,this.pageIndex,this.lastPageCount),this.modal!==null&&this.modal.render(e)}}class Pn extends ce{constructor(e,t,r,i,o){const s=i.length===0?[{label:"NO OPTIONS AVAILABLE",disabled:!0,action:()=>{}}]:i.map(a=>({label:a.label,action:a.action}));super("MENU",s,[{id:"game",label:"GAME"}],e,t,r,[],null,o),this.onClose=o}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onClose())}handleNavTap(e){e==="game"&&!this.activated&&(this.activated=!0,this.onClose())}}function ye(n){return n.size==="medium"||n.size==="large"}function Te(n,e){return n>=e.reputation.levelReveredMin?3:n>=e.reputation.levelLikedMin?2:n>=e.reputation.levelFriendlyMin?1:n<e.reputation.levelUnfriendlyMin?-2:n<e.reputation.levelNeutralMin?-1:0}function St(n){switch(n){case-2:return"HATED";case-1:return"UNFRIENDLY";case 0:return"NEUTRAL";case 1:return"FRIENDLY";case 2:return"LIKED";case 3:return"REVERED";default:return"NEUTRAL"}}function je(n,e){switch(n){case-2:return e.reputation.tradeModifierHated;case-1:return e.reputation.tradeModifierUnfriendly;case 1:return e.reputation.tradeModifierFriendly;case 2:return e.reputation.tradeModifierLiked;case 3:return e.reputation.tradeModifierRevered;default:return e.reputation.tradeModifierNeutral}}function wn(n){return`${n<0?"":"+"}${n}`}function kn(n,e,t){const r=new Map;r.set(n.id,e);const i=Math.floor(e/2);for(const s of n.allies)r.set(s,i);const o=-Math.floor(e/2);for(const s of n.rivals)r.set(s,o);return r}function xn(n,e){return n.type==="delivery"?n.pickupComplete?e.destinationId===n.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":n.requirements.every(r=>{const i=e.cargoHold.find(o=>o.commodityId===r.commodityId);return i!==void 0&&i.qty>=r.qty})?"ready-to-deliver":"needs-supplies"}function Pi(n,e){return e.type==="delivery"&&n.cargoCapacity-n.cargoWeightKg<e.itemWeightKg?{ok:!1,reason:"Insufficient cargo space"}:{ok:!0}}class Ui{constructor(e){const t=un(e.shipId);if(!t)throw new Error(`Unknown ship: ${e.shipId}`);this.shipId=e.shipId,this.driveId=e.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=e.credits,this._systemId=e.systemId,this._destinationId=e.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[],this._factionReputation=new Map;for(const r of R().factions)ye(r)&&this._factionReputation.set(r.id,0)}get fuelL(){return this._fuelL}addFuel(e){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+e)}consumeFuel(e){this._fuelL=Math.max(0,this._fuelL-e)}getInSystemHopCost(){const e=un(this.shipId),t=R().balance;return Math.ceil(t.fuel.inSystemBaseConsumptionL*e.fuelEfficiency)}get credits(){return this._credits}addCredits(e){this._credits+=e}spendCredits(e){this._credits-=e}get cargoHold(){return this._cargoHold}addCargo(e,t){const r=this._cargoHold.find(i=>i.commodityId===e);r?r.qty+=t:this._cargoHold.push({commodityId:e,qty:t})}removeCargo(e,t){const r=this._cargoHold.findIndex(i=>i.commodityId===e);r<0||(t!==void 0&&t<this._cargoHold[r].qty?this._cargoHold[r].qty-=t:this._cargoHold.splice(r,1))}get missionItemsWeightKg(){return this._missionItems.reduce((e,t)=>e+t.weightKg,0)}get cargoWeightKg(){return Ni(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(e){this._destinationId=e}undock(){this._destinationId=null}jumpTo(e){this._systemId=e,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(e,t){const r={...e,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(r),e.type==="delivery"&&t&&(this._missionItems.push({missionId:e.id,itemName:e.itemName,weightKg:e.itemWeightKg}),r.pickupComplete=!0)}collectMissionItem(e){const t=this._activeMissions.find(r=>r.id===e);!t||t.type!=="delivery"||(t.pickupComplete=!0,this._missionItems.push({missionId:t.id,itemName:t.itemName,weightKg:t.itemWeightKg}))}completeMission(e){this._activeMissions=this._activeMissions.filter(t=>t.id!==e),this._missionItems=this._missionItems.filter(t=>t.missionId!==e)}cancelMission(e){this._activeMissions=this._activeMissions.filter(t=>t.id!==e),this._missionItems=this._missionItems.filter(t=>t.missionId!==e)}getMissionsForPickup(e){return this._activeMissions.filter(t=>t.type==="delivery"&&t.pickupDestinationId===e&&!t.pickupComplete)}getMissionsForDelivery(e){return this._activeMissions.filter(t=>t.deliveryDestinationId===e&&xn(t,this)==="ready-to-deliver")}getFactionReputation(e){return this._factionReputation.get(e)??0}modifyFactionReputation(e,t,r){const i=this.getFactionReputation(e),o=Math.min(r.reputation.pointsMax,Math.max(r.reputation.pointsMin,i+t));this._factionReputation.set(e,o)}}const Un=40;class pn{constructor(e){this.focus="confirm",this.confirmRect=null,this.cancelRect=null,this.opts=e}handleAction(e){var t,r;if(e==="BACK"){this.opts.onConfirm();return}if(e==="LEFT"||e==="RIGHT"||e==="TAB"){this.opts.cancelLabel!==void 0&&(this.focus=this.focus==="confirm"?"cancel":"confirm");return}e==="SELECT"&&(this.focus==="cancel"?(r=(t=this.opts).onCancel)==null||r.call(t):this.opts.onConfirm())}handleCharInput(e){}handleTap(e,t){var r,i;this.confirmRect&&t===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.opts.onConfirm():this.cancelRect&&t===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&((i=(r=this.opts).onCancel)==null||i.call(r))}render(e){const t=e.length,r=t>0?e[0].length:0,{title:i,body:o,confirmLabel:s,cancelLabel:a}=this.opts,l=Un-2,c=ze(o,l),h=c.length,d=4+h+1+1+1,p=Un,u=Math.floor((r-p)/2),m=Math.floor((t-d)/2);for(let k=0;k<d;k++)for(let _=0;_<p;_++){const y=m+k,T=u+_;y>=0&&y<t&&T>=0&&T<r&&(e[y][T]={char:" ",fg:"white",bg:"black"})}const g=(k,_,y)=>{k>=0&&k<t&&_>=0&&_<r&&(e[k][_]={char:y,fg:"white",bg:"black"})};g(m,u,"+"),g(m,u+p-1,"+");for(let k=1;k<p-1;k++)g(m,u+k,"-");g(m+d-1,u,"+"),g(m+d-1,u+p-1,"+");for(let k=1;k<p-1;k++)g(m+d-1,u+k,"-");for(let k=1;k<d-1;k++)g(m+k,u,"|"),g(m+k,u+p-1,"|");const b=i.slice(0,l),C=m+1,I=u+1+Math.floor((l-b.length)/2);f(e,C,I,b,"bright-white","black"),f(e,m+2,I,"'".repeat(b.length),"bright-black","black");for(let k=0;k<c.length;k++)f(e,m+4+k,u+1,c[k],"white","black");const v=m+4+h+1,A=`[ ${s} ]`;if(a!==void 0){const k=`[ ${a} ]`,_=2,y=A.length+_+k.length,T=Math.floor((l-y)/2),E=u+1+T,Y=E+A.length+_;this.confirmRect={col:E,row:v,width:A.length},this.cancelRect={col:Y,row:v,width:k.length};const O=this.focus==="confirm",z=this.focus==="cancel";f(e,v,E,A,O?"black":"white",O?"green":"black"),f(e,v,Y,k,z?"black":"white",z?"green":"black")}else{const k=Math.floor((l-A.length)/2),_=u+1+k;this.confirmRect={col:_,row:v,width:A.length},this.cancelRect=null,f(e,v,_,A,"black","green")}}}const Bi={delivery:"[D] ",supply:"[S] "},Hi={"pending-pickup":"PENDING PICKUP","needs-supplies":"NEEDS SUPPLIES","in-transit":"IN TRANSIT","ready-to-deliver":"READY TO DELIVER"},$i={"pending-pickup":"yellow","needs-supplies":"yellow","in-transit":"bright-black","ready-to-deliver":"bright-green"};class Gi extends ce{constructor(e,t,r,i,o){super("MISSIONS",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,t,r,[],null,o),this.onBack=i,this.onGame=o}get items(){const e=this.player.activeMissions;return e.length===0?[{label:"NO ACTIVE MISSIONS",disabled:!0,action:()=>{}}]:e.map(t=>{const r=xn(t,this.player),i=W(t.deliveryDestinationId),o=(i==null?void 0:i.name)??t.deliveryDestinationId,s=Hi[r]??r,a=$i[r]??"white";return{label:t.title,icon:Bi[t.type],iconFg:"bright-yellow",info:`${t.reward} CR`,infoFg:"bright-green",details:[`${s} → ${o}`],detailsFg:a,action:()=>this.openMissionModal(t)}})}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const t=e[this.cursorIdx];t.disabled||t.action()}openMissionModal(e){let t=e.description;if(e.giverFactionId){const r=R(),i=r.factions.find(o=>o.id===e.giverFactionId);if(i){const o=U(),s=e.reward;let a;s>=o.reputation.missionTierLargeReward?a=o.reputation.missionDeltaLarge:s>=o.reputation.missionTierMediumReward?a=o.reputation.missionDeltaMedium:a=o.reputation.missionDeltaSmall;const l=kn(i,a,r.factions),c=[];for(const[h,d]of l){const p=r.factions.find(u=>u.id===h);p&&c.push({id:h,name:p.name,delta:d})}c.sort((h,d)=>h.delta!==d.delta?d.delta-h.delta:h.name.localeCompare(d.name)),t+=`

REPUTATION IMPACT:
`;for(const h of c){const d=wn(h.delta);t+=`  ${h.name.padEnd(20)} ${d}
`}}}this.openModal(new pn({title:e.title,body:t,confirmLabel:"OKAY",cancelLabel:"CANCEL MISSION",onConfirm:()=>this.closeModal(),onCancel:()=>{this.player.cancelMission(e.id),this.closeModal();const r=this.player.activeMissions.length;r===0?this.cursorIdx=-1:this.cursorIdx>=r&&(this.cursorIdx=r-1)}}))}handleNavAction(e){e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):(e==="BACK"||e==="NAV_2")&&!this.activated&&(this.activated=!0,this.onBack())}handleNavTap(e){e==="game"&&!this.activated?(this.activated=!0,this.onGame()):e==="menu"&&!this.activated&&(this.activated=!0,this.onBack())}}const mn=20,Wi="█",ji="░";function Ki(n,e,t){return n<=e?0:n>=t?mn:Math.round((n-e)/(t-e)*mn)}const Yi={[-2]:"red",[-1]:"bright-red",0:"white",1:"bright-green",2:"bright-green",3:"bright-cyan"};class qi extends ce{constructor(e,t,r,i,o){super("REPUTATION",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],e,t,r,[],null,o),this.onBack=i,this.onGame=o}get items(){const e=U(),r=R().factions.filter(i=>ye(i));return r.sort((i,o)=>{if(i.size!==o.size){if(i.size==="large")return-1;if(o.size==="large")return 1}return i.name.localeCompare(o.name)}),r.map(i=>{const o=this.player.getFactionReputation(i.id),s=Te(o,e),a=St(s),l=Yi[s]??"white",c=Ki(o,e.reputation.pointsMin,e.reputation.levelReveredMin),h=mn-c;return{label:i.name,info:a,infoFg:l,detailsColored:[{left:[{text:Wi.repeat(c),fg:l},{text:ji.repeat(h),fg:"bright-black"}],right:{text:String(o),fg:"white"}},{left:[]}],action:()=>{}}})}activateCurrent(){}handleNavAction(e){e==="BACK"&&!this.activated?(this.activated=!0,this.onBack()):e==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):super.handleNavAction(e)}handleNavTap(e){e==="menu"&&!this.activated?(this.activated=!0,this.onBack()):e==="game"&&!this.activated&&(this.activated=!0,this.onGame())}}class Vi extends le{constructor(e,t,r,i){super(e,t,r,{navOptions:[]}),this.pageIndex=0,this.onContinue=i;const s=Mi("game-start")[0].text.split(`

`),a=s[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=s.slice(1)):(this.yearHeader="",l=s);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),p=ze(d,36);h>0&&c.push(""),c.push(...p)}this.bodyLines=c}handleAction(e){e==="SELECT"?(this.activated=!0,this.onContinue()):e==="LEFT"?this.pageIndex>0&&this.pageIndex--:e==="RIGHT"&&this.pageIndex++}handleTap(e,t){this.activated=!0,this.onContinue()}renderContent(e,t,r){const i=e.length>0?e[0].length:0;if(this.yearHeader){const m=Math.max(0,Math.floor((i-this.yearHeader.length)/2));f(e,t,m,this.yearHeader,"bright-yellow","black")}const o=t+2,s=r-1,a=s-o,l=Math.max(1,a),c=Math.max(1,Math.ceil(this.bodyLines.length/l));this.pageIndex>=c&&(this.pageIndex=c-1);const h=c>1,d=this.pageIndex*l,p=Math.min(d+l,this.bodyLines.length);let u=o;for(let m=d;m<p;m++){const g=this.bodyLines[m];g!==""&&f(e,u,2,g,"white","black"),u++}h&&At(e,s,i,this.pageIndex,c)}}const zi=30;class fn{constructor(e){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=e,this.value=Math.max(e.field.min,Math.min(e.field.max,e.field.initialValue))}handleAction(e){const{field:t}=this.formDef;if(e==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(e==="UP"){this.value=Math.min(t.max,this.value+1);return}if(e==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(e==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(e==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(e==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}e==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(e){if(this.focus!=="field")return;const{field:t}=this.formDef;if(e==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(e>="0"&&e<="9"){const r=parseInt(e,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,r)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+r)}}handleTap(e,t){this.confirmRect&&t===this.confirmRect.row&&e>=this.confirmRect.col&&e<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&e>=this.cancelRect.col&&e<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(e){const t=e.length,r=t>0?e[0].length:0,{title:i,field:o,derivedRows:s,confirmLabel:a}=this.formDef,l=s.length,c=8+l,h=zi,d=Math.floor((r-h)/2),p=Math.floor((t-c)/2);for(let w=0;w<c;w++)for(let G=0;G<h;G++){const $=p+w,Q=d+G;$>=0&&$<t&&Q>=0&&Q<r&&(e[$][Q]={char:" ",fg:"white",bg:"black"})}const u=(w,G,$)=>{w>=0&&w<t&&G>=0&&G<r&&(e[w][G]={char:$,fg:"white",bg:"black"})};u(p,d,"+"),u(p,d+h-1,"+");for(let w=1;w<h-1;w++)u(p,d+w,"-");u(p+c-1,d,"+"),u(p+c-1,d+h-1,"+");for(let w=1;w<h-1;w++)u(p+c-1,d+w,"-");for(let w=1;w<c-1;w++)u(p+w,d,"|"),u(p+w,d+h-1,"|");const m=h-2,g=p+1,b=d+1+Math.floor((m-i.length)/2);f(e,g,b,i,"bright-white","black"),f(e,p+2,b,"'".repeat(i.length),"bright-black","black");const C=[o.label,...s.map(w=>w.label)],I=Math.max(...C.map(w=>w.length)),v=d+1+I+3,A=p+4,k=this.focus==="field";f(e,A,d+1,o.label.padEnd(I)+" : ","white","black");const _=this.value.toString().padStart(5);f(e,A,v,_,k?"black":"white",k?"green":"black");for(let w=0;w<l;w++){const G=s[w],$=p+5+w,Q=G.compute(this.value);f(e,$,d+1,G.label.padEnd(I)+" : ","white","black"),f(e,$,v,Q,"white","black")}const y=p+4+l+2,T=`[ ${a} ]`,E="[ CANCEL ]",Y=3,O=T.length+Y+E.length,z=Math.floor((m-O)/2),L=d+1+z,D=L+T.length+Y;this.confirmRect={col:L,row:y,width:T.length},this.cancelRect={col:D,row:y,width:E.length};const P=this.focus==="confirm",S=this.focus==="cancel";f(e,y,L,T,P?"black":"white",P?"green":"black"),f(e,y,D,E,S?"black":"white",S?"green":"black")}}class Qi extends ce{constructor(e,t,r,i,o,s,a,l,c,h){const d=W(i),p=r.getMissionsForPickup(i),u=r.getMissionsForDelivery(i),m=p.map(S=>({label:`COLLECT: ${S.type==="delivery"?S.itemName:""}`,accentFg:"bright-yellow",action:()=>{}})),g=u.map(S=>({label:`DELIVER: ${S.title} → ${S.reward} CR`,accentFg:"bright-yellow",action:()=>{}})),b=[...m,...g],C=[];d.amenities.trader&&C.push({label:"TRADER",action:s}),d.amenities.missionBoard&&C.push({label:"MISSION BOARD",action:a});const I=U();let v=null;if(d.owningFactionId){const S=R().factions.find(w=>w.id===d.owningFactionId);S&&ye(S)&&(v=d.owningFactionId)}const A=I.fuel.pricePerLitre,k=v?je(Te(r.getFactionReputation(v),I),I):1,_=Math.round(A*k),y=r.fuelCapacityL-r.fuelL,T=Math.floor(r.credits/_),E=Math.min(y,T);let Y=null;if(d.amenities.fuel&&E>0){const S=E*_;Y=b.length+(b.length>0?1:0)+C.length,C.push({label:`BUY FUEL  +${E}L  ${S}CR`,action:()=>{}})}const O=[];b.length>0&&(O.push(...b),O.push({label:"────────────────────",disabled:!0,action:()=>{}})),O.push(...C);const z=ze(d.description,36).slice(0,3),L=`DANGER: ${d.dangerLevel.toUpperCase()}`,D=[...z,L];if(d.owningFactionId){const S=R().factions.find(w=>w.id===d.owningFactionId);S&&D.push(`OPERATED BY: ${S.name}`)}const P=d.locationType==="surface"||d.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",O,[{id:"undock",label:P}],e,t,r,D,null,h),this.onShip=c,this.onRefuel=o,this.onHub=l,this.fuelItemIdx=Y,this.eligibleFactionId=v;for(let S=0;S<p.length;S++){const w=p[S];m[S].action=()=>{this.player.collectMissionItem(w.id),this.onHub()}}for(let S=0;S<u.length;S++){const w=u[S];g[S].action=()=>{if(xn(w,this.player)!=="ready-to-deliver"){this.openModal(new pn({title:"CANNOT DELIVER",body:w.type==="delivery"?"Mission item is missing from your cargo.":"Required supplies are missing from your cargo.",confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.activated=!1}}));return}if(w.type==="supply")for(const _e of w.requirements)this.player.removeCargo(_e.commodityId,_e.qty);const $=U(),Q=R();let nn="";if(w.giverFactionId){const _e=Q.factions.find(Fe=>Fe.id===w.giverFactionId);if(_e){const Fe=w.reward;let Ne;Fe>=$.reputation.missionTierLargeReward?Ne=$.reputation.missionDeltaLarge:Fe>=$.reputation.missionTierMediumReward?Ne=$.reputation.missionDeltaMedium:Ne=$.reputation.missionDeltaSmall;const Rn=kn(_e,Ne,Q.factions);for(const[q,X]of Rn)this.player.modifyFactionReputation(q,X,$);const tn=[];for(const[q,X]of Rn){const Ln=Q.factions.find(gi=>gi.id===q);Ln&&tn.push({id:q,name:Ln.name,delta:X})}tn.sort((q,X)=>q.delta!==X.delta?X.delta-q.delta:q.name.localeCompare(X.name)),nn=`

REPUTATION:
`;for(const q of tn){const X=wn(q.delta);nn+=`  ${q.name.padEnd(20)} ${X}
`}}}this.player.completeMission(w.id),this.player.addCredits(w.reward),this.openModal(new pn({title:"MISSION COMPLETE",body:`Mission complete!

You received ${w.reward} CR.${nn}`,confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.onHub()}}))}}}effectiveFuelPrice(){const e=U(),t=e.fuel.pricePerLitre;if(!this.eligibleFactionId)return t;const r=Te(this.player.getFactionReputation(this.eligibleFactionId),e);return Math.round(t*je(r,e))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx===-1)return;const t=e[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const r=this.effectiveFuelPrice(),i=this.player.fuelCapacityL-this.player.fuelL,o=Math.floor(this.player.credits/r),s=Math.min(i,o);this.openModal(new fn({title:"BUY FUEL",field:{label:"Litres",initialValue:s,min:0,max:s},derivedRows:[{label:"Cost",compute:a=>`${a*r} CR`}],confirmLabel:"BUY",onConfirm:a=>{this.closeModal(),a>0&&this.onRefuel(a*r,a)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class Xi extends ce{constructor(e,t,r,i,o,s,a,l,c,h){var g;const d=W(i),p=((g=d.npcs.trader)==null?void 0:g.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(p,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,r,[],u,h),this.repGainedThisVisit=0,this.traderStock=o,this.onBuy=s,this.onSell=a,this.onHub=l,this.onUndock=c;const m=d.owningFactionId;if(m){const b=Ri(m);this.eligibleFactionId=b&&ye(b)?m:null}else this.eligibleFactionId=null;this.syncItems(),this.clampCursor()}currentModifier(){if(!this.eligibleFactionId)return 1;const e=U(),t=this.player.getFactionReputation(this.eligibleFactionId),r=Te(t,e);return je(r,e)}buyPrice(e){return Math.round(e*this.currentModifier())}sellPrice(e){return Math.round(e/this.currentModifier())}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(e=>{const t=se(e.commodityId);if(!t)return[];const r=this.buyPrice(t.basePrice),i=this.player.credits>=r;return[{label:`${t.name} (x${e.qty})`,info:`${r} CR`,disabled:!i,action:()=>{const o=Math.floor(this.player.credits/r),s=Math.min(e.qty,o);this.openModal(new fn({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:s,min:0,max:s},derivedRows:[{label:"Total",compute:a=>`${a*r} CR`}],confirmLabel:"BUY",onConfirm:a=>{a>0&&(this.onBuy(e.commodityId,a,r),this.accrueReputation(a*r)),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const e=this.player.cargoHold;return e.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...e].flatMap(t=>{const r=se(t.commodityId);if(!r)return[];const i=this.sellPrice(r.basePrice);return[{label:`${r.name} (x${t.qty})`,info:`${i} CR`,action:()=>{this.openModal(new fn({title:r.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:o=>`${o*i} CR`}],confirmLabel:"SELL",onConfirm:o=>{o>0&&this.onSell(t.commodityId,o,i),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}accrueReputation(e){if(!this.eligibleFactionId)return;const t=U(),r=t.reputation.maxRepPerVisit-this.repGainedThisVisit;if(r<=0)return;const i=Math.min(r,e*t.reputation.repPerCredit);i<=0||(this.repGainedThisVisit+=i,this.player.modifyFactionReputation(this.eligibleFactionId,i,t))}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const e=this.items;(this.cursorIdx<0||this.cursorIdx>=e.length||(t=e[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=e.findIndex(r=>!r.disabled))}activateCurrent(){const e=this.items;if(e.length===0||this.cursorIdx<0||this.cursorIdx>=e.length)return;const t=e[this.cursorIdx];t.disabled||t.action()}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(e){if(this.syncItems(),super.render(e),this.eligibleFactionId){const i=U(),o=this.player.getFactionReputation(this.eligibleFactionId),s=Te(o,i),a=St(s),l=je(s,i),c=`x${l.toFixed(2)}`,h=l<1?"bright-green":l>1?"yellow":"bright-black",d=`STANDING: ${a}  `;f(e,ee+2,2,d,"bright-black","black"),f(e,ee+2,2+d.length,c,h,"black")}const t=e.length,r=vn(t,!0)-2;f(e,r,2,`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,"bright-black","black")}}const Ji={delivery:"[D] ",supply:"[S] "};class Zi extends ce{constructor(e,t,r,i,o,s,a,l,c){W(i);const h=o();let d;h.length===0?d=[{label:"NO MISSIONS AVAILABLE",disabled:!0,action:()=>{}}]:d=h.map(p=>{const u=p.giverFactionId?(()=>{const m=R().factions.find(g=>g.id===p.giverFactionId);return m?[`For: ${m.name}`]:[]})():[];return{label:p.title,icon:Ji[p.type],iconFg:"bright-yellow",info:`${p.reward} CR`,infoFg:"bright-green",details:u,detailsFg:"bright-black",action:()=>s(p)}}),super("MISSION BOARD",d,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,r,[],null,c),this.onHub=a,this.onUndock=l}handleNavAction(e){(e==="BACK"||e==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):e==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(e){e==="hub"&&!this.activated?(this.activated=!0,this.onHub()):e==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}class er extends le{constructor(e,t,r,i,o,s,a){super(o,s,a,{navOptions:i,title:e}),this.cursorIdx=-1,this.lastChoicesStartRow=0,this._choices=t,this._onBack=r,this.resetCursor()}preHandleAction(e){return e==="BACK"?(this.activated=!0,this._onBack(),!0):!1}handleAction(e){e==="UP"?this.moveCursor(-1):e==="DOWN"?this.moveCursor(1):e==="SELECT"&&this.activateCurrent()}handleTap(e,t){const r=this.rowToChoiceIndex(t);r!==null&&!this._choices[r].disabled&&(this.cursorIdx=r,this.activateCurrent())}moveCursor(e){const t=this._choices,r=t.length;if(r===0)return;const i=this.cursorIdx===-1?e>0?r-1:0:this.cursorIdx;for(let o=0;o<r;o++){const s=((i+e*(o+1))%r+r)%r;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this._choices.length===0||this.cursorIdx===-1)return;const e=this._choices[this.cursorIdx];e.disabled||(this.activated=!0,e.action())}resetCursor(){const e=this._choices;for(let t=0;t<e.length;t++)if(!e[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}computeChoicesHeight(){var t;let e=0;for(const r of this._choices)e+=1+(((t=r.details)==null?void 0:t.length)??0);return e}rowToChoiceIndex(e){var r;if(e<this.lastChoicesStartRow)return null;let t=this.lastChoicesStartRow;for(let i=0;i<this._choices.length;i++){const o=1+(((r=this._choices[i].details)==null?void 0:r.length)??0);if(e>=t&&e<t+o)return i;t+=o}return null}render(e){const t=e.length,r=t>0?e[0].length:0;for(let m=0;m<t;m++)for(let g=0;g<r;g++)e[m][g]={char:" ",fg:"black",bg:"black"};const i=this.buildChromeConfig();this.chrome.render(e,i);const o=!0,s=ee,a=vn(t,o),l=this.opts.title;l!==void 0&&(f(e,s,2,l,"bright-white","black"),f(e,s+1,2,"'".repeat(l.length),"bright-black","black"));const c=s+2,h=this.computeChoicesHeight(),d=a-h-1,p=d-1;this.renderContent(e,c,p),d>=0&&d<t&&Ce(e,d,r);let u=d+1;this.lastChoicesStartRow=u;for(let m=0;m<this._choices.length;m++){const g=this._choices[m],b=m===this.cursorIdx,C=b?">":" ",I=g.disabled?"bright-black":b?"bright-green":"white";if(u<t&&(f(e,u,2,C,I,"black"),f(e,u,3,g.label,I,"black")),u++,g.details)for(const v of g.details)u<t&&f(e,u,4,v.slice(0,r-4),"bright-black","black"),u++}}}const nr={delivery:"[D]",supply:"[S]"};class tr extends er{constructor(e,t,r,i,o,s,a,l){const c=Pi(r,i),h=i.type==="delivery"&&i.pickupDestinationId===i.issuingDestinationId,d=c.ok?{label:"ACCEPT MISSION",action:()=>o(h)}:{label:"ACCEPT MISSION",disabled:!0,details:c.reason?[c.reason]:[],action:()=>{}},p={label:"BACK",action:()=>s()};super("MISSION BOARD",[d,p],s,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],e,t,r),this.spec=i,this.onHub=a,this.onUndock=l}destColor(e){if(e===this.player.destinationId)return"bright-green";const t=W(e);return t&&t.system===this.player.systemId?"bright-yellow":"white"}writeDestRow(e,t,r,i,o,s){f(e,t,2,r,"white","black"),f(e,t,2+r.length,i.slice(0,s-r.length),this.destColor(o),"black")}handleAction(e){e==="NAV_1"?(this.activated=!0,this.onUndock()):e==="NAV_2"?(this.activated=!0,this.onHub()):super.handleAction(e)}handleNavTap(e){this.activated||(e==="undock"?(this.activated=!0,this.onUndock()):e==="hub"&&(this.activated=!0,this.onHub()))}renderContent(e,t,r){this.renderDetail(e,t,r)}renderDetail(e,t,r){const o=e.length>0?e[0].length:40,s=o-4;let a=t;const l=(u,m,g)=>{u<=r&&f(e,u,2,m.slice(0,s),g,"black")};l(a,`${nr[this.spec.type]} ${this.spec.title}`,"bright-yellow"),a++;const c=R(),h=this.spec.giverFactionId?c.factions.find(u=>u.id===this.spec.giverFactionId):null,d=h?` [${h.name}]`:"";if(l(a,`    ${this.spec.giverName}${d}`,"bright-black"),a++,a++,this.spec.type==="delivery"){const u=W(this.spec.pickupDestinationId),m=W(this.spec.deliveryDestinationId);if(a<=r&&this.writeDestRow(e,a,"Pickup:  ",(u==null?void 0:u.name)??this.spec.pickupDestinationId,this.spec.pickupDestinationId,s),a++,a<=r&&this.writeDestRow(e,a,"Deliver: ",(m==null?void 0:m.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,s),a++,a<=r){const g=this.player.cargoCapacity-this.player.cargoWeightKg,b=this.spec.itemWeightKg,C=g>=b,I=`Weight:  ${b} kg  (Free: ${g} kg)`;f(e,a,2,I,"white","black");const v=C?"bright-green":"red",A=2+I.length+1;A<o&&f(e,a,A,C?"✓":"✗",v,"black")}a++}else{const u=W(this.spec.deliveryDestinationId);a<=r&&this.writeDestRow(e,a,"Deliver to: ",(u==null?void 0:u.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,s),a++;for(const m of this.spec.requirements){if(a>r)break;const g=se(m.commodityId);l(a,`  ${m.qty}x ${(g==null?void 0:g.name)??m.commodityId}`,"white"),a++}}a++;const p=ze(this.spec.description,s);for(const u of p){if(a>r)break;l(a,u,"white"),a++}if(a++,!(a>r)&&(l(a,`REWARD: ${this.spec.reward} CR`,"bright-green"),a++,this.spec.giverFactionId)){const u=c.factions.find(m=>m.id===this.spec.giverFactionId);if(u){const m=U(),g=this.spec.reward;let b;g>=m.reputation.missionTierLargeReward?b=m.reputation.missionDeltaLarge:g>=m.reputation.missionTierMediumReward?b=m.reputation.missionDeltaMedium:b=m.reputation.missionDeltaSmall;const C=kn(u,b,c.factions),I=[];for(const[v,A]of C){const k=c.factions.find(_=>_.id===v);k&&I.push({id:v,name:k.name,delta:A})}if(I.sort((v,A)=>v.delta!==A.delta?A.delta-v.delta:v.name.localeCompare(A.name)),I.length>0){if(a++,a>r)return;const v=r-1;a<=v&&(l(a,"REPUTATION IMPACT","bright-cyan"),a++);for(const A of I){if(a>v)break;const k=wn(A.delta),_=A.delta>0?"bright-green":"red",y=s-k.length-2,T=A.name.slice(0,y),E=" ".repeat(Math.max(0,s-T.length-k.length-2));l(a,`  ${T}${E}${k}`,_),a++}}}}}}const ir=[18,10,5],rr=[".","*","+"],Bn=[4e3,2e3,800],or=[9e3,5e3,2500],sr=[null,"bright-black","white"],ar=["bright-black","white","bright-white"],lr=["white","bright-white","bright-cyan"],De=3,Hn=25,Pe=2,$n=37,Gn=2*Math.PI;function cr(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}class dr{constructor(e=42){this.boundsSet=!1,this.rand=cr(e),this.stars=[];for(let t=0;t<3;t++)for(let r=0;r<ir[t];r++){const i=Pe+Math.floor(this.rand()*($n-Pe+1)),o=De+Math.floor(this.rand()*(Hn-De+1)),s=this.rand()*Gn,a=Bn[t]+this.rand()*(or[t]-Bn[t]);this.stars.push({col:i,row:o,layer:t,twinklePhase:s,twinklePeriod:a})}}update(e){for(const t of this.stars)t.twinklePhase+=Gn/t.twinklePeriod*e}render(e,t,r,i,o){if(!this.boundsSet){this.boundsSet=!0;const s=Hn-De,a=$n-Pe;{const l=(r-t)/s,c=(o-i)/a;for(const h of this.stars)h.row=Math.round(t+(h.row-De)*l),h.col=Math.round(i+(h.col-Pe)*c)}}for(const s of this.stars){const{row:a,col:l,layer:c}=s;if(a<t||a>r||l<i||l>o)continue;const h=Math.sin(s.twinklePhase);let d;h>=.5?d=lr[c]:h>=-.5?d=ar[c]:d=sr[c],d!==null&&(e[a][l]={char:rr[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const hr=6,on=6,ur=23,pr=23,sn=10,mr=0,fr=4,gr=18,yr=21,br=35,_r=39,Wn=12,vr=11,ie=13,we=27,an=28,wr=12,ln=40,jn=200,cn=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],kr="#",Kn=["green","cyan","white","yellow"],Yn=["*",".","+","x"];function qn(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function xr(n,e,t){return{col:e,row:t,char:kr,color:Kn[Math.floor(n()*Kn.length)],phase:n()*2e4,period:1e4+n()*1e4,active:n()>.2}}function ke(n,e,t,r){const i=[];for(const o of r)for(let s=e;s<=t;s++)i.push(xr(n,s,o));return i}class Cr extends le{constructor(e,t,r,i,o,s,a){super(e,t,r,{navOptions:[],onMenu:a}),this.cursorIdx=0,this.h=30,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.onTravel=i,this.onDock=o,this.onCargo=s,this.starfield=new dr(42),this.inSpace=r.destinationId===null;const l=qn(99);this.gaugeBtns=[...ke(l,mr,fr,[3,4]),...ke(l,gr,yr,[3,4]),...ke(l,br,_r,[3,4])],this.leftBtns=ke(l,0,vr,[0,1,2,3]),this.rightBtns=ke(l,an,39,[0,1,2,3]);const c=qn(77),h=3+Math.floor(c()*4);this.radarContacts=Array.from({length:h},()=>({x:c()*(we-ie-1),y:c()*4,vx:(c()-.5)*2,vy:(c()-.5)*1.5,char:Yn[Math.floor(c()*Yn.length)]}))}navCount(){return this.inSpace?1:2}handleAction(e){e==="CARGO"?(this.activated=!0,this.onCargo()):e==="UP"?this.cursorIdx=(this.cursorIdx-1+this.navCount())%this.navCount():e==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.navCount():e==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,this.onTravel()):this.inSpace||(this.activated=!0,this.onDock()))}handleTap(e,t){const r=this.h;(t===3||t===4)&&e>=on&&e<on+1+sn?(this.activated=!0,this.onCargo()):t===r-3&&e<Wn?(this.activated=!0,this.onTravel()):t===r-3&&e>=an&&!this.inSpace&&(this.activated=!0,this.onDock())}update(e){this.starfield.update(e),this.blinkPhase=(this.blinkPhase+e)%1e3;for(const i of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])i.phase+=e,i.phase>=i.period&&(i.phase-=i.period,i.active=!i.active);const t=we-ie,r=5;for(const i of this.radarContacts)i.x+=i.vx*e/1e3,i.y+=i.vy*e/1e3,i.x<0&&(i.x=-i.x,i.vx=-i.vx),i.x>t-1&&(i.x=2*(t-1)-i.x,i.vx=-i.vx),i.y<0&&(i.y=-i.y,i.vy=-i.vy),i.y>r-1&&(i.y=2*(r-1)-i.y,i.vy=-i.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-e);else for(this.tickerAccum+=e;this.tickerAccum>=jn;){this.tickerAccum-=jn,this.tickerScroll++;const i=cn[this.msgIdx];if(this.tickerScroll>=i.length+ln-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%cn.length,this.tickerPause=500,this.tickerAccum=0;break}}}renderContent(e,t,r){const i=e.length,o=i>0?e[0].length:0;this.h=i;const s=t+2,a=i-8,l=i-7,c=i-3,h=i-2;this.renderGaugeStrip(e,t),this.starfield.render(e,s,a,0,39);for(let d=0;d<o;d++)e[s][d]={char:"-",fg:"white",bg:"black"},e[a][d]={char:"-",fg:"white",bg:"black"};this.renderHUD(e,s+1),this.renderCrosshair(e,s+1,a-1),this.renderBottomPanels(e,l,c),this.renderTicker(e,h)}renderGaugeStrip(e,t){for(const s of this.gaugeBtns){const a=t+s.row-3,l=s.active?s.color:"bright-black";a>=0&&a<e.length&&(e[a][s.col]={char:s.char,fg:l,bg:"black"})}const r=this.player.fuelL/this.player.fuelCapacityL,i=this.player.cargoWeightKg/this.player.cargoCapacity,o=this.blinkPhase<500;this.renderGauge(e,t,hr,"F",r,"yellow",o),this.renderGauge(e,t+1,on,"C",i,"blue",o),this.renderGauge(e,t,ur,"S",1,"cyan",o),this.renderGauge(e,t+1,pr,"H",1,"green",o)}renderGauge(e,t,r,i,o,s,a){if(t<0||t>=e.length)return;e[t][r]={char:i,fg:s,bg:"black"};const l=Math.round(Math.min(1,Math.max(0,o))*sn),c=o<=.2;for(let h=0;h<sn;h++){const d=r+1+h;if(h<l){const p=c&&!a?"bright-black":s;e[t][d]={char:" ",fg:"black",bg:p}}else e[t][d]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(e,t){f(e,t,1,"VEL:----","bright-black","black"),f(e,t,16,"ATT:---°","bright-black","black"),f(e,t,30,"ROT:--°","bright-black","black")}renderCrosshair(e,t,r){var a;const i=Math.floor((t+r)/2),o=20;e[i][o]={char:"+",fg:"bright-green",bg:"black"};const s=[[i-3,o-5],[i-3,o+5],[i+3,o-5],[i+3,o+5]];for(const[l,c]of s){const h=((a=e[0])==null?void 0:a.length)??40;l>=t&&l<=r&&c>=0&&c<h&&(e[l][c]={char:"+",fg:"bright-green",bg:"black"})}}renderBottomPanels(e,t,r){for(let c=t;c<=r;c++)for(let h=ie;h<we;h++)e[c][h]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(e,t,r-t+1);for(const c of this.leftBtns){const h=t+c.row;if(h<r){const d=c.active?c.color:"bright-black";e[h][c.col]={char:c.char,fg:d,bg:"black"}}}for(const c of this.rightBtns){const h=t+c.row;if(h<r){const d=c.active?c.color:"bright-black";e[h][c.col]={char:c.char,fg:d,bg:"black"}}}const i=this.cursorIdx===0?"bright-yellow":"yellow";f(e,r,0,this.centerPad("TRAVEL",Wn),"black",i);let o,s;this.inSpace?(o="bright-black",s="bright-black"):(o=this.cursorIdx===1?"bright-cyan":"cyan",s="black"),f(e,r,an,this.centerPad("DOCK",wr),s,o);const a=we-ie,l="<)) "+"-".repeat(a-4);f(e,r,ie,l,"white","bright-black")}renderRadar(e,t,r){for(const i of this.radarContacts){const o=Math.min(we-ie-1,Math.max(0,Math.floor(i.x))),s=Math.min(r-1,Math.max(0,Math.floor(i.y)));e[t+s][ie+o]={char:i.char,fg:"white",bg:"bright-black"}}}renderTicker(e,t){const r=cn[this.msgIdx];for(let i=0;i<ln;i++){const o=this.tickerScroll-ln+1+i,s=o>=0&&o<r.length?r[o]:" ";e[t][i]={char:s,fg:"white",bg:"black"}}}centerPad(e,t){if(e.length>=t)return e.slice(0,t);const r=t-e.length,i=Math.floor(r/2);return" ".repeat(i)+e+" ".repeat(r-i)}}class Tr extends le{constructor(e,t,r,i,o){super(e,t,r,{title:"CARGO HOLD",tabs:["COMMODITIES","MISSION GOODS"],navOptions:[{id:"back",label:"BACK"}],onMenu:o}),this.onBack=i}handleNavTap(e){e==="back"&&(this.activated=!0,this.onBack())}handleAction(e){(e==="BACK"||e==="CARGO")&&(this.activated=!0,this.onBack())}renderContent(e,t,r){const o=e.length>0?e[0].length:0,s=this.player.cargoHold,a=this.player.missionItems,l=this.player.cargoCapacity,c=this.player.cargoWeightKg,h=r-1;this.activeTabIdx===0?this.renderCommoditiesTab(e,t,h,o,s):this.renderMissionGoodsTab(e,t,h,o,a);const d=`TOTAL: ${c}/${l}KG`;f(e,h,2,d,"bright-black","black")}renderCommoditiesTab(e,t,r,i,o){if(o.length===0){f(e,t,2,"NO COMMODITIES","bright-black","black");return}let s=t;for(const a of o){if(s>=r-1)break;const l=se(a.commodityId);if(!l)continue;const c=a.qty*l.weightKg,h=`  x${a.qty}  ${l.basePrice}CR  ${c}KG`,d=Math.max(6,i-4-h.length),p=l.name,u=p.length>d?p.slice(0,d):p;f(e,s,2,`${u}${h}`,"white","black"),s++}}renderMissionGoodsTab(e,t,r,i,o){if(o.length===0){f(e,t,2,"NO MISSION GOODS","bright-black","black");return}let s=t;for(const a of o){if(s>=r-1)break;const l=`  ${a.weightKg}KG`,c=Math.max(6,i-4-l.length),h=a.itemName.length>c?a.itemName.slice(0,c):a.itemName;f(e,s,2,`${h}${l}`,"white","black"),s++}}}class Vn extends ce{constructor(e,t,r,i,o,s,a,l,c=()=>{}){const h=We(r.systemId),d=It(r.driveId),p=r.getInSystemHopCost(),u=r.fuelL<p,m=[...h.destinations.map(v=>({label:W(v).name.toUpperCase(),disabled:v===r.destinationId||u,action:()=>i(v)})),{label:"FLY INTO SPACE",disabled:r.destinationId===null||u,action:s}],b=[..._n(r.systemId).map(v=>{const A=v.from===r.systemId?v.to:v.from,k=We(A),_=v.stability.toUpperCase(),y=Math.ceil(U().fuel.consumptionPerLy*v.distance*d.fuelEfficiency);return{label:`${k.name.toUpperCase()}  ${v.distance}LY  [${_}]`.slice(0,36),disabled:y>r.fuelL,action:()=>o(A)}}),{label:"GALAXY MAP...",action:l}],C=[`FUEL  ${p} L per hop`],I=[{label:"DESTINATIONS",items:m},{label:"JUMPS",items:b}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],e,t,r,C,I,c),this.onShip=a}handleNavAction(e){(e==="BACK"||e==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(e){e==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}function zn(n,e){if(n===e)return[n];const t=[[n]],r=new Set([n]);for(;t.length>0;){const i=t.shift(),o=i[i.length-1];for(const s of _n(o)){const a=s.from===o?s.to:s.from;if(a===e)return[...i,a];r.has(a)||(r.add(a),t.push([...i,a]))}}return null}const Ar=0,Ir=4,Sr=8,Mr=9,Qn=10,Xn=15,Er=16,Rr=2,Lr=10,Fr=12,Ue=13,Be=12,Nr=25,Or=26,Dr=10,Jn=18;function Pr(n,e){return n.length>=e?n.slice(0,e):n+" ".repeat(e-n.length)}function xe(n,e){return"["+Pr(n.toUpperCase(),e-2)+"]"}class Ur extends le{constructor(e,t,r,i,o=()=>{}){super(e,t,r,{title:"GALAXY MAP",tabs:["MAP","ROUTE"],navOptions:[{id:"back",label:"BACK"}],onMenu:o}),this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.lastTop=ee+5,this.onBack=i,this.publicSystems=Fi().sort((s,a)=>s.distanceFromSol-a.distanceFromSol),this.otherSystems=this.publicSystems.filter(s=>s.id!==r.systemId),this.mapBrowsingSystemId=r.systemId}onTabChange(e){this.searchText=""}handleCharInput(e){if(this.activeTabIdx!==0)return;const t=e.charCodeAt(0);e==="\b"||e===""?this.searchText=this.searchText.slice(0,-1):t>=32&&t<127&&(this.searchText+=e.toUpperCase(),this.mapCursorIdx=0)}handleAction(e){if(e==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}this.activeTabIdx===0?this.handleMapAction(e):this.handleRouteAction(e)}handleNavTap(e){e==="back"&&(this.searchText="",this.activated=!0,this.onBack())}handleTap(e,t){const r=this.lastTop,i=r+Qn,o=r+Xn;if(this.activeTabIdx===0&&t>=i&&t<o){const s=this.getMapNeighbors(),a=t-i;a>=0&&a<s.length&&(this.mapBrowsingSystemId=s[a].id,this.mapCursorIdx=0,this.searchText="")}else if(this.activeTabIdx===1){const s=r+3,a=r+9;if(t>=s&&t<=a){const l=t-s;l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}}}getMapNeighbors(){const t=_n(this.mapBrowsingSystemId).map(r=>{const i=r.from===this.mapBrowsingSystemId?r.to:r.from,o=this.publicSystems.find(a=>a.id===i),s=r.distance;return o?{sys:o,dist:s}:null}).filter(r=>r!==null).sort((r,i)=>r.dist-i.dist).map(r=>r.sys);return this.searchText.length===0?t:t.filter(r=>r.name.toUpperCase().includes(this.searchText))}handleMapAction(e){const t=this.getMapNeighbors(),r=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(e==="UP")this.mapCursorIdx=Math.max(0,r-1);else if(e==="DOWN")this.mapCursorIdx=Math.min(t.length-1,r+1);else if(e==="SELECT"){const i=t[r];if(!i)return;this.mapBrowsingSystemId=i.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(e){e==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):e==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const e=this.otherSystems[this.routeDestIdx];return e?zn(this.player.systemId,e.id):null}renderContent(e,t,r){this.lastTop=t;const i=e.length>0?e[0].length:0;this.activeTabIdx===0?this.renderMapTab(e,t,r,i):this.renderRouteTab(e,t,r,i)}renderMapTab(e,t,r,i){const o=this.publicSystems.find(p=>p.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!o)return;const s=t+Mr,a=t+Qn,l=t+Xn,c=t+Er;this.renderChart(e,o,t),Ce(e,s,i);const h=this.getMapNeighbors(),d=Math.min(this.mapCursorIdx,Math.max(0,h.length-1));this.renderNeighborList(e,i,o,h,d,a,l),Ce(e,l,i),this.renderInfo(e,i,o,h[d]??null,c),this.searchText.length>0&&f(e,c+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(e,t,r){var h;const i=this.getMapNeighbors(),o=r+Ar,s=r+Ir,a=r+Sr,l=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(f(e,s,Ue,xe(t.name,Be),l,"black"),t.id===this.player.systemId){const d=Ue+Be,p=((h=e[0])==null?void 0:h.length)??40;d<p&&(e[s][d]={char:"*",fg:"bright-yellow",bg:"black"})}const c=["left","right","top","bottom"];for(let d=0;d<Math.min(i.length,4);d++){const p=i[d],u=c[d],m=p.id===this.player.systemId?"bright-yellow":"white";if(u==="left")f(e,s,Rr,xe(p.name,Lr),m,"black"),e[s][Fr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="right")f(e,s,Or,xe(p.name,Dr),m,"black"),e[s][Nr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="top"){f(e,o,Ue,xe(p.name,Be),m,"black");for(let g=o+1;g<s;g++)e[g][Jn]={char:"|",fg:"bright-black",bg:"black"}}else{f(e,a,Ue,xe(p.name,Be),m,"black");for(let g=s+1;g<a;g++)e[g][Jn]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(e,t,r,i,o,s,a){for(let l=0;l<i.length&&l<a-s;l++){const c=i[l],h=s+l,d=l===o,u=c.id===this.player.systemId?"bright-yellow":d?"bright-cyan":"white",m=d?"> ":"  ",g=He(r.id,c.id),b=g?`${g.distance}LY  ${g.stability}`:"",C=t-4-b.length;f(e,h,2,m+c.name.toUpperCase().slice(0,C-2),u,"black"),b&&f(e,h,t-2-b.length,b,"bright-black","black")}}renderInfo(e,t,r,i,o){const a=r.id===this.player.systemId?"* Current location":r.name.toUpperCase();if(f(e,o,2,`Zone: ${r.zone}  Sec: ${r.security}  ${a}`.slice(0,t-4),"bright-black","black"),!i)return;const l=He(r.id,i.id);if(!l)return;const c=zn(this.player.systemId,i.id),h=c?c.length===1?"(your location)":`${c.length-1} hop${c.length-1!==1?"s":""} from you`:"(unreachable)";f(e,o+1,2,`${i.name.toUpperCase()}  ${l.distance}LY  ${h}`.slice(0,t-4),"bright-black","black")}renderRouteTab(e,t,r,i){var C,I;const o=t,s=t+2,a=t+3,l=7,c=a+l,h=c+1,d=h+6,p=this.publicSystems.find(v=>v.id===this.player.systemId);f(e,o,2,"FROM:","bright-black","black"),f(e,o,8,(p==null?void 0:p.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),f(e,s,2,"TO:","bright-black","black");const u=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-l));for(let v=0;v<l;v++){const A=u+v;if(A>=this.otherSystems.length)break;const k=this.otherSystems[A],_=A===this.routeDestIdx,y=_?"bright-cyan":"white",T=_?"> ":"  ";f(e,a+v,2,T+k.name.toUpperCase(),y,"black")}Ce(e,c,i),Ce(e,d,i);const m=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!m){f(e,h,2,"No route found","bright-red","black");return}const b=m.length-1;f(e,h,2,`Route: ${b} hop${b!==1?"s":""}`,"bright-white","black");for(let v=0;v<b;v++){const A=He(m[v],m[v+1]);if(!A)continue;const k=h+1+v;if(k>=d)break;const _=(((C=this.publicSystems.find(T=>T.id===m[v]))==null?void 0:C.name)??m[v]).toUpperCase().slice(0,9),y=(((I=this.publicSystems.find(T=>T.id===m[v+1]))==null?void 0:I.name)??m[v+1]).toUpperCase().slice(0,9);f(e,k,4,`${_} -> ${y}  ${A.distance}LY  ${A.stability}`.slice(0,i-6),"white","black")}}}class te extends le{constructor(e,t,r,i){const o={onAction:()=>{}};super(o,t,e,{navOptions:[]}),this.elapsed=0,this.arrived=!1,this.duration=r,this.onComplete=i}update(e){this.arrived||(this.elapsed+=e,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const Br=["[. . .]","[: : :]","[* * *]"],Zn=5e3;class Hr extends te{constructor(e,t,r){super(e,t,Zn,r)}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(e,t,r){const i=e.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/500)%3,a=Math.ceil((Zn-this.elapsed)/1e3),l=Math.max(1,Math.min(5,a)),c=We(this.player.systemId),h=c?c.name.toUpperCase():this.player.systemId.toUpperCase();M(e,o-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),M(e,o-1,"DESTINATION:","bright-black","black"),M(e,o,h,"bright-white","black"),M(e,o+2,Br[s],"bright-black","black"),M(e,o+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const et=2e3,$r=["[ —   ]","[  —  ]","[   — ]"];class nt extends te{constructor(e,t,r,i){super(e,t,et,r),this.targetLabel=i}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(e,t,r){const i=e.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((et-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a)),c=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const h=this.player.destinationId?W(this.player.destinationId):null;return h?h.name.toUpperCase():"UNKNOWN"})();M(e,o-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),M(e,o-1,"HEADING TO:","bright-black","black"),M(e,o,c,"bright-white","black"),M(e,o+2,$r[s],"bright-black","black"),M(e,o+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const tt=2500,Gr=["v","vv","vvv"];class Wr extends te{constructor(e,t,r){super(e,t,tt,r)}renderContent(e,t,r){const i=e.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((tt-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));M(e,o-3,"[ LANDING SEQUENCE ]","bright-green","black"),M(e,o+2,Gr[s],"bright-black","black"),M(e,o+4,`TOUCHDOWN IN ${l}S`,"bright-black","black")}}const it=2500,jr=[">",">>",">>>"];class Kr extends te{constructor(e,t,r){super(e,t,it,r)}renderContent(e,t,r){const i=e.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((it-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));M(e,o-3,"[ APPROACH LOCKED ]","bright-yellow","black"),M(e,o+2,jr[s],"bright-black","black"),M(e,o+4,`CLAMPING IN ${l}S`,"bright-black","black")}}const rt=1500,Yr=["^","^^","^^^"];class qr extends te{constructor(e,t,r){super(e,t,rt,r)}renderContent(e,t,r){const i=e.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((rt-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));M(e,o-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),M(e,o+2,Yr[s],"bright-black","black"),M(e,o+4,`CLEAR IN ${l}S`,"bright-black","black")}}const ot=1500,Vr=["<","<<","<<<"];class zr extends te{constructor(e,t,r){super(e,t,ot,r)}renderContent(e,t,r){const i=e.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((ot-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));M(e,o-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),M(e,o+2,Vr[s],"bright-black","black"),M(e,o+4,`DEPARTING IN ${l}S`,"bright-black","black")}}const st=1500,Qr=["→","→→","→→→"];class Xr extends te{constructor(e,t,r){super(e,t,st,r)}renderContent(e,t,r){const i=e.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((st-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));M(e,o-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),M(e,o+2,Qr[s],"bright-black","black"),M(e,o+4,`DOCKING IN ${l}S`,"bright-black","black")}}const at=1500,Jr=["←","←←","←←←"];class Zr extends te{constructor(e,t,r){super(e,t,at,r)}renderContent(e,t,r){const i=e.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((at-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));M(e,o-3,"[ DEPARTING BERTH ]","bright-cyan","black"),M(e,o+2,Jr[s],"bright-black","black"),M(e,o+4,`CLEAR IN ${l}S`,"bright-black","black")}}function eo(n){let e=n>>>0;return()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296)}function no(n,e){return Math.floor(n()*e)}function me(n,e){return e[no(n,e.length)]}function Mt(n,e){const{special:t,firstNames:r,lastNames:i}=e.npcNames;if(n()<U().npc.specialNameChance&&t.length>0)return{giverName:me(n,t)};const o=r.length>0?me(n,r):"Unknown",s=i.length>0?me(n,i):"Agent";return{giverName:`${o} ${s}`}}function to(n,e){return e.destinations.filter(t=>t.id!==n.id)}function io(n){return n.commodities.filter(e=>e.legal)}function ro(n,e,t,r){var m;const i=t.deliveryItems;if(i.length===0)return null;const o=to(e,t);if(o.length===0)return null;const s=me(n,i),a=me(n,o),l=Mt(n,t),{deliveryBaseReward:c,deliveryRandomReward:h}=U().missions,d=Math.floor(s.weightKg*1.5),p=c+d+Math.floor(n()*h),u=e.owningFactionId?(m=R().factions.find(g=>g.id===e.owningFactionId&&ye(g)))==null?void 0:m.id:void 0;return{...l,giverFactionId:u,id:r,type:"delivery",title:s.name,description:`A package needs transporting. Pick up the ${s.name} from ${e.name} and deliver it to ${a.name}. Handle with care.`,reward:p,issuingDestinationId:e.id,itemName:s.name,itemWeightKg:s.weightKg,pickupDestinationId:e.id,deliveryDestinationId:a.id}}function oo(n,e,t,r){var k;const i=io(t);if(i.length===0)return null;const o=e.goodsBias.map(_=>_.toLowerCase()),s=[];for(const _ of i){const y=o.some(T=>_.category.includes(T)||_.id.includes(T)||T.includes(_.category));s.push(_),y&&s.push(_)}const{supplyRequirementsMin:a,supplyRequirementsMax:l,supplyQtyMin:c,supplyQtyMax:h}=U().missions,d=a+Math.floor(n()*(l-a+1)),p=[],u=new Set;for(let _=0;_<d;_++){let y=0;for(;y<10;){const T=me(n,s);if(!u.has(T.id)){u.add(T.id);const E=c+Math.floor(n()*(h-c+1));p.push({commodityId:T.id,qty:E});break}y++}}if(p.length===0)return null;const m=p.reduce((_,y)=>{const T=t.commodities.find(E=>E.id===y.commodityId);return _+((T==null?void 0:T.basePrice)??100)*y.qty},0),{supplyRewardMargin:g,supplyRandomReward:b}=U().missions,C=Math.floor(m*g)+Math.floor(n()*b),I=Mt(n,t),v=p.map(_=>{const y=t.commodities.find(T=>T.id===_.commodityId);return`${_.qty}× ${(y==null?void 0:y.name)??_.commodityId}`}).join(", "),A=e.owningFactionId?(k=R().factions.find(_=>_.id===e.owningFactionId&&ye(_)))==null?void 0:k.id:void 0;return{...I,giverFactionId:A,id:r,type:"supply",title:e.name,description:`${e.name} needs supplies. Deliver ${v} to fulfil the contract.`,reward:C,issuingDestinationId:e.id,requirements:p,deliveryDestinationId:e.id}}function so(n,e,t){const r=eo(t),{boardCountMin:i,boardCountMax:o,deliveryChance:s}=U().missions,a=i+Math.floor(r()*(o-i+1)),l=[];for(let c=0;c<a;c++){const h=`m-${(t>>>0).toString(16)}-${c}`,p=r()<s?ro(r,n,e,h):oo(r,n,e,h);p&&l.push(p)}return l}const ao=100;class lo{constructor(e,t,r){this.sceneBeforeMenu=null,this.traderStockCache=new Map,this.missionBoardCache=new Map,this.renderer=e,this.input=t,this.context=r;const i=Ei(),o=un(i.startingShip);this.player=new Ui({shipId:i.startingShip,driveId:o.defaultJumpDrive,credits:i.player.startingCredits,systemId:i.startingLocation.system,destinationId:i.startingLocation.destination}),this.currentScene=new On(this.input,this.context,this.player,()=>this.goToStory())}tick(e){const t=Math.min(e,ao),r=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(r),this.renderer.drawBuffer(r)}makeBuffer(){const e=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:e},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(e){const t=Date.now(),r=this.traderStockCache.get(e),i=U();if(r&&t-r.generatedAt<i.trading.stockTtlMs)return r.entries;const o=Li(),{stockCountMin:s,stockCountMax:a,stockQtyMin:l,stockQtyMax:c}=i.trading,h=s+Math.floor(Math.random()*(a-s+1)),d=[...o];for(let u=d.length-1;u>0;u--){const m=Math.floor(Math.random()*(u+1));[d[u],d[m]]=[d[m],d[u]]}const p=d.slice(0,h).map(u=>({commodityId:u.id,qty:l+Math.floor(Math.random()*(c-l+1))}));return this.traderStockCache.set(e,{entries:p,generatedAt:t}),p}getOrCreateMissionBoard(e){const t=Date.now(),r=this.missionBoardCache.get(e);if(r&&t-r.generatedAt<U().missions.missionTtlMs)return r.specs;const i=W(e),o=R(),s=Math.floor(Math.random()*4294967295),a=so(i,o,s);return this.missionBoardCache.set(e,{specs:a,generatedAt:t}),a}onBuy(e,t,r,i){if(t<=0)return;const o=i.findIndex(h=>h.commodityId===e);if(o<0)return;const s=i[o];if(t>s.qty)return;const a=se(e);if(!a)return;const l=t*r;this.player.credits<l||this.player.cargoWeightKg+t*a.weightKg>this.player.cargoCapacity||(this.player.spendCredits(l),this.player.addCargo(e,t),s.qty-=t,s.qty<=0&&i.splice(o,1))}onSell(e,t,r,i){if(t<=0)return;const o=this.player.cargoHold.find(c=>c.commodityId===e);if(!o||o.qty<t||!se(e))return;const a=t*r;this.player.addCredits(a),this.player.removeCargo(e,t);const l=i.find(c=>c.commodityId===e);l?l.qty+=t:i.push({commodityId:e,qty:t})}goToMainMenu(){this.currentScene=new On(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new Vi(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new Qi(this.input,this.context,this.player,this.player.destinationId,(e,t)=>{this.player.spendCredits(e),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToLandOrDock(){var t;const e=(t=W(this.player.destinationId))==null?void 0:t.locationType;e==="surface"?this.currentScene=new Wr(this.player,this.context,()=>this.goToStation()):e==="asteroid"?this.currentScene=new Kr(this.player,this.context,()=>this.goToStation()):this.currentScene=new Xr(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const e=(t=W(this.player.destinationId))==null?void 0:t.locationType;e==="surface"?this.currentScene=new qr(this.player,this.context,()=>this.goToShip()):e==="asteroid"?this.currentScene=new zr(this.player,this.context,()=>this.goToShip()):this.currentScene=new Zr(this.player,this.context,()=>this.goToShip())}goToTrader(){const e=this.player.destinationId,t=this.getOrCreateTraderStock(e);this.currentScene=new Xi(this.input,this.context,this.player,e,t,(r,i,o)=>this.onBuy(r,i,o,t),(r,i,o)=>this.onSell(r,i,o,t),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionBoard(){const e=this.player.destinationId;this.currentScene=new Zi(this.input,this.context,this.player,e,()=>this.getOrCreateMissionBoard(e),t=>this.goToMissionDetail(t,e),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToMissionDetail(e,t){this.currentScene=new tr(this.input,this.context,this.player,e,r=>this.onMissionAccepted(e,r,t),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock())}onMissionAccepted(e,t,r){const i=this.missionBoardCache.get(r);if(i){const o=i.specs.findIndex(s=>s.id===e.id);o>=0&&i.specs.splice(o,1)}this.player.acceptMission(e,t),this.goToMissionBoard()}goToShip(){this.currentScene=new Cr(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo(),()=>this.goToGlobalMenu())}goToCargo(){this.currentScene=new Tr(this.input,this.context,this.player,()=>this.goToShip(),()=>this.goToGlobalMenu())}buildMenuEntries(){return[{label:"MISSIONS",action:()=>this.goToMissionLog()},{label:"REPUTATION",action:()=>this.goToReputation()}]}goToMissionLog(){this.currentScene=new Gi(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToReputation(){this.currentScene=new qi(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToGlobalMenuFromSubScene(){this.currentScene=new Pn(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}goToGlobalMenu(){this.sceneBeforeMenu=this.currentScene,"suspend"in this.currentScene&&this.currentScene.suspend(),this.currentScene=new Pn(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}returnFromMenu(){const e=this.sceneBeforeMenu;this.sceneBeforeMenu=null,e!==null?("resume"in e&&e.resume(),this.currentScene=e):this.goToShip()}goToTravelMenu(){this.currentScene=new Vn(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu())}goToArrival(){this.currentScene=new Vn(this.input,this.context,this.player,e=>this.onDestinationSelected(e),e=>this.onJumpSelected(e),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu())}goToGalaxyMap(){this.currentScene=new Ur(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToGlobalMenu())}goToFlyIntoSpace(){const e=this.player.getInSystemHopCost();this.player.consumeFuel(e),this.player.undock(),this.currentScene=new nt(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(e){const t=this.player.getInSystemHopCost();this.player.consumeFuel(t),this.player.dock(e),this.currentScene=new nt(this.player,this.context,()=>this.goToShip())}onJumpSelected(e){const t=He(this.player.systemId,e),r=It(this.player.driveId),i=Math.ceil(U().fuel.consumptionPerLy*t.distance*r.fuelEfficiency);this.player.consumeFuel(i),this.player.jumpTo(e),this.currentScene=new Hr(this.player,this.context,()=>this.goToArrival())}}const co=`---
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
`,Io=`---
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
`,So=`---
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
`,Vo=`---
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
`,zo=`---
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
`;var F={},Se={},K={};function Et(n){return typeof n>"u"||n===null}function cs(n){return typeof n=="object"&&n!==null}function ds(n){return Array.isArray(n)?n:Et(n)?[]:[n]}function hs(n,e){var t,r,i,o;if(e)for(o=Object.keys(e),t=0,r=o.length;t<r;t+=1)i=o[t],n[i]=e[i];return n}function us(n,e){var t="",r;for(r=0;r<e;r+=1)t+=n;return t}function ps(n){return n===0&&Number.NEGATIVE_INFINITY===1/n}K.isNothing=Et;K.isObject=cs;K.toArray=ds;K.repeat=us;K.isNegativeZero=ps;K.extend=hs;function Ae(n,e){Error.call(this),this.name="YAMLException",this.reason=n,this.mark=e,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}Ae.prototype=Object.create(Error.prototype);Ae.prototype.constructor=Ae;Ae.prototype.toString=function(e){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!e&&this.mark&&(t+=" "+this.mark.toString()),t};var Me=Ae,lt=K;function Cn(n,e,t,r,i){this.name=n,this.buffer=e,this.position=t,this.line=r,this.column=i}Cn.prototype.getSnippet=function(e,t){var r,i,o,s,a;if(!this.buffer)return null;for(e=e||4,t=t||75,r="",i=this.position;i>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(i-1))===-1;)if(i-=1,this.position-i>t/2-1){r=" ... ",i+=5;break}for(o="",s=this.position;s<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s))===-1;)if(s+=1,s-this.position>t/2-1){o=" ... ",s-=5;break}return a=this.buffer.slice(i,s),lt.repeat(" ",e)+r+a+o+`
`+lt.repeat(" ",e+this.position-i+r.length)+"^"};Cn.prototype.toString=function(e){var t,r="";return this.name&&(r+='in "'+this.name+'" '),r+="at line "+(this.line+1)+", column "+(this.column+1),e||(t=this.getSnippet(),t&&(r+=`:
`+t)),r};var ms=Cn,ct=Me,fs=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],gs=["scalar","sequence","mapping"];function ys(n){var e={};return n!==null&&Object.keys(n).forEach(function(t){n[t].forEach(function(r){e[String(r)]=t})}),e}function bs(n,e){if(e=e||{},Object.keys(e).forEach(function(t){if(fs.indexOf(t)===-1)throw new ct('Unknown option "'+t+'" is met in definition of "'+n+'" YAML type.')}),this.tag=n,this.kind=e.kind||null,this.resolve=e.resolve||function(){return!0},this.construct=e.construct||function(t){return t},this.instanceOf=e.instanceOf||null,this.predicate=e.predicate||null,this.represent=e.represent||null,this.defaultStyle=e.defaultStyle||null,this.styleAliases=ys(e.styleAliases||null),gs.indexOf(this.kind)===-1)throw new ct('Unknown kind "'+this.kind+'" is specified for "'+n+'" YAML type.')}var B=bs,dt=K,$e=Me,_s=B;function gn(n,e,t){var r=[];return n.include.forEach(function(i){t=gn(i,e,t)}),n[e].forEach(function(i){t.forEach(function(o,s){o.tag===i.tag&&o.kind===i.kind&&r.push(s)}),t.push(i)}),t.filter(function(i,o){return r.indexOf(o)===-1})}function vs(){var n={scalar:{},sequence:{},mapping:{},fallback:{}},e,t;function r(i){n[i.kind][i.tag]=n.fallback[i.tag]=i}for(e=0,t=arguments.length;e<t;e+=1)arguments[e].forEach(r);return n}function he(n){this.include=n.include||[],this.implicit=n.implicit||[],this.explicit=n.explicit||[],this.implicit.forEach(function(e){if(e.loadKind&&e.loadKind!=="scalar")throw new $e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=gn(this,"implicit",[]),this.compiledExplicit=gn(this,"explicit",[]),this.compiledTypeMap=vs(this.compiledImplicit,this.compiledExplicit)}he.DEFAULT=null;he.create=function(){var e,t;switch(arguments.length){case 1:e=he.DEFAULT,t=arguments[0];break;case 2:e=arguments[0],t=arguments[1];break;default:throw new $e("Wrong number of arguments for Schema.create function")}if(e=dt.toArray(e),t=dt.toArray(t),!e.every(function(r){return r instanceof he}))throw new $e("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(r){return r instanceof _s}))throw new $e("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new he({include:e,explicit:t})};var be=he,ws=B,ks=new ws("tag:yaml.org,2002:str",{kind:"scalar",construct:function(n){return n!==null?n:""}}),xs=B,Cs=new xs("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(n){return n!==null?n:[]}}),Ts=B,As=new Ts("tag:yaml.org,2002:map",{kind:"mapping",construct:function(n){return n!==null?n:{}}}),Is=be,Tn=new Is({explicit:[ks,Cs,As]}),Ss=B;function Ms(n){if(n===null)return!0;var e=n.length;return e===1&&n==="~"||e===4&&(n==="null"||n==="Null"||n==="NULL")}function Es(){return null}function Rs(n){return n===null}var Ls=new Ss("tag:yaml.org,2002:null",{kind:"scalar",resolve:Ms,construct:Es,predicate:Rs,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Fs=B;function Ns(n){if(n===null)return!1;var e=n.length;return e===4&&(n==="true"||n==="True"||n==="TRUE")||e===5&&(n==="false"||n==="False"||n==="FALSE")}function Os(n){return n==="true"||n==="True"||n==="TRUE"}function Ds(n){return Object.prototype.toString.call(n)==="[object Boolean]"}var Ps=new Fs("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Ns,construct:Os,predicate:Ds,represent:{lowercase:function(n){return n?"true":"false"},uppercase:function(n){return n?"TRUE":"FALSE"},camelcase:function(n){return n?"True":"False"}},defaultStyle:"lowercase"}),Us=K,Bs=B;function Hs(n){return 48<=n&&n<=57||65<=n&&n<=70||97<=n&&n<=102}function $s(n){return 48<=n&&n<=55}function Gs(n){return 48<=n&&n<=57}function Ws(n){if(n===null)return!1;var e=n.length,t=0,r=!1,i;if(!e)return!1;if(i=n[t],(i==="-"||i==="+")&&(i=n[++t]),i==="0"){if(t+1===e)return!0;if(i=n[++t],i==="b"){for(t++;t<e;t++)if(i=n[t],i!=="_"){if(i!=="0"&&i!=="1")return!1;r=!0}return r&&i!=="_"}if(i==="x"){for(t++;t<e;t++)if(i=n[t],i!=="_"){if(!Hs(n.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}for(;t<e;t++)if(i=n[t],i!=="_"){if(!$s(n.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}if(i==="_")return!1;for(;t<e;t++)if(i=n[t],i!=="_"){if(i===":")break;if(!Gs(n.charCodeAt(t)))return!1;r=!0}return!r||i==="_"?!1:i!==":"?!0:/^(:[0-5]?[0-9])+$/.test(n.slice(t))}function js(n){var e=n,t=1,r,i,o=[];return e.indexOf("_")!==-1&&(e=e.replace(/_/g,"")),r=e[0],(r==="-"||r==="+")&&(r==="-"&&(t=-1),e=e.slice(1),r=e[0]),e==="0"?0:r==="0"?e[1]==="b"?t*parseInt(e.slice(2),2):e[1]==="x"?t*parseInt(e,16):t*parseInt(e,8):e.indexOf(":")!==-1?(e.split(":").forEach(function(s){o.unshift(parseInt(s,10))}),e=0,i=1,o.forEach(function(s){e+=s*i,i*=60}),t*e):t*parseInt(e,10)}function Ks(n){return Object.prototype.toString.call(n)==="[object Number]"&&n%1===0&&!Us.isNegativeZero(n)}var Ys=new Bs("tag:yaml.org,2002:int",{kind:"scalar",resolve:Ws,construct:js,predicate:Ks,represent:{binary:function(n){return n>=0?"0b"+n.toString(2):"-0b"+n.toString(2).slice(1)},octal:function(n){return n>=0?"0"+n.toString(8):"-0"+n.toString(8).slice(1)},decimal:function(n){return n.toString(10)},hexadecimal:function(n){return n>=0?"0x"+n.toString(16).toUpperCase():"-0x"+n.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),Rt=K,qs=B,Vs=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function zs(n){return!(n===null||!Vs.test(n)||n[n.length-1]==="_")}function Qs(n){var e,t,r,i;return e=n.replace(/_/g,"").toLowerCase(),t=e[0]==="-"?-1:1,i=[],"+-".indexOf(e[0])>=0&&(e=e.slice(1)),e===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:e===".nan"?NaN:e.indexOf(":")>=0?(e.split(":").forEach(function(o){i.unshift(parseFloat(o,10))}),e=0,r=1,i.forEach(function(o){e+=o*r,r*=60}),t*e):t*parseFloat(e,10)}var Xs=/^[-+]?[0-9]+e/;function Js(n,e){var t;if(isNaN(n))switch(e){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===n)switch(e){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===n)switch(e){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(Rt.isNegativeZero(n))return"-0.0";return t=n.toString(10),Xs.test(t)?t.replace("e",".e"):t}function Zs(n){return Object.prototype.toString.call(n)==="[object Number]"&&(n%1!==0||Rt.isNegativeZero(n))}var ea=new qs("tag:yaml.org,2002:float",{kind:"scalar",resolve:zs,construct:Qs,predicate:Zs,represent:Js,defaultStyle:"lowercase"}),na=be,Lt=new na({include:[Tn],implicit:[Ls,Ps,Ys,ea]}),ta=be,Ft=new ta({include:[Lt]}),ia=B,Nt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Ot=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function ra(n){return n===null?!1:Nt.exec(n)!==null||Ot.exec(n)!==null}function oa(n){var e,t,r,i,o,s,a,l=0,c=null,h,d,p;if(e=Nt.exec(n),e===null&&(e=Ot.exec(n)),e===null)throw new Error("Date resolve error");if(t=+e[1],r=+e[2]-1,i=+e[3],!e[4])return new Date(Date.UTC(t,r,i));if(o=+e[4],s=+e[5],a=+e[6],e[7]){for(l=e[7].slice(0,3);l.length<3;)l+="0";l=+l}return e[9]&&(h=+e[10],d=+(e[11]||0),c=(h*60+d)*6e4,e[9]==="-"&&(c=-c)),p=new Date(Date.UTC(t,r,i,o,s,a,l)),c&&p.setTime(p.getTime()-c),p}function sa(n){return n.toISOString()}var aa=new ia("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:ra,construct:oa,instanceOf:Date,represent:sa}),la=B;function ca(n){return n==="<<"||n===null}var da=new la("tag:yaml.org,2002:merge",{kind:"scalar",resolve:ca});function Dt(n){throw new Error('Could not dynamically require "'+n+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var re;try{var ha=Dt;re=ha("buffer").Buffer}catch{}var ua=B,An=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function pa(n){if(n===null)return!1;var e,t,r=0,i=n.length,o=An;for(t=0;t<i;t++)if(e=o.indexOf(n.charAt(t)),!(e>64)){if(e<0)return!1;r+=6}return r%8===0}function ma(n){var e,t,r=n.replace(/[\r\n=]/g,""),i=r.length,o=An,s=0,a=[];for(e=0;e<i;e++)e%4===0&&e&&(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)),s=s<<6|o.indexOf(r.charAt(e));return t=i%4*6,t===0?(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)):t===18?(a.push(s>>10&255),a.push(s>>2&255)):t===12&&a.push(s>>4&255),re?re.from?re.from(a):new re(a):a}function fa(n){var e="",t=0,r,i,o=n.length,s=An;for(r=0;r<o;r++)r%3===0&&r&&(e+=s[t>>18&63],e+=s[t>>12&63],e+=s[t>>6&63],e+=s[t&63]),t=(t<<8)+n[r];return i=o%3,i===0?(e+=s[t>>18&63],e+=s[t>>12&63],e+=s[t>>6&63],e+=s[t&63]):i===2?(e+=s[t>>10&63],e+=s[t>>4&63],e+=s[t<<2&63],e+=s[64]):i===1&&(e+=s[t>>2&63],e+=s[t<<4&63],e+=s[64],e+=s[64]),e}function ga(n){return re&&re.isBuffer(n)}var ya=new ua("tag:yaml.org,2002:binary",{kind:"scalar",resolve:pa,construct:ma,predicate:ga,represent:fa}),ba=B,_a=Object.prototype.hasOwnProperty,va=Object.prototype.toString;function wa(n){if(n===null)return!0;var e=[],t,r,i,o,s,a=n;for(t=0,r=a.length;t<r;t+=1){if(i=a[t],s=!1,va.call(i)!=="[object Object]")return!1;for(o in i)if(_a.call(i,o))if(!s)s=!0;else return!1;if(!s)return!1;if(e.indexOf(o)===-1)e.push(o);else return!1}return!0}function ka(n){return n!==null?n:[]}var xa=new ba("tag:yaml.org,2002:omap",{kind:"sequence",resolve:wa,construct:ka}),Ca=B,Ta=Object.prototype.toString;function Aa(n){if(n===null)return!0;var e,t,r,i,o,s=n;for(o=new Array(s.length),e=0,t=s.length;e<t;e+=1){if(r=s[e],Ta.call(r)!=="[object Object]"||(i=Object.keys(r),i.length!==1))return!1;o[e]=[i[0],r[i[0]]]}return!0}function Ia(n){if(n===null)return[];var e,t,r,i,o,s=n;for(o=new Array(s.length),e=0,t=s.length;e<t;e+=1)r=s[e],i=Object.keys(r),o[e]=[i[0],r[i[0]]];return o}var Sa=new Ca("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Aa,construct:Ia}),Ma=B,Ea=Object.prototype.hasOwnProperty;function Ra(n){if(n===null)return!0;var e,t=n;for(e in t)if(Ea.call(t,e)&&t[e]!==null)return!1;return!0}function La(n){return n!==null?n:{}}var Fa=new Ma("tag:yaml.org,2002:set",{kind:"mapping",resolve:Ra,construct:La}),Na=be,Ee=new Na({include:[Ft],implicit:[aa,da],explicit:[ya,xa,Sa,Fa]}),Oa=B;function Da(){return!0}function Pa(){}function Ua(){return""}function Ba(n){return typeof n>"u"}var Ha=new Oa("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:Da,construct:Pa,predicate:Ba,represent:Ua}),$a=B;function Ga(n){if(n===null||n.length===0)return!1;var e=n,t=/\/([gim]*)$/.exec(n),r="";return!(e[0]==="/"&&(t&&(r=t[1]),r.length>3||e[e.length-r.length-1]!=="/"))}function Wa(n){var e=n,t=/\/([gim]*)$/.exec(n),r="";return e[0]==="/"&&(t&&(r=t[1]),e=e.slice(1,e.length-r.length-1)),new RegExp(e,r)}function ja(n){var e="/"+n.source+"/";return n.global&&(e+="g"),n.multiline&&(e+="m"),n.ignoreCase&&(e+="i"),e}function Ka(n){return Object.prototype.toString.call(n)==="[object RegExp]"}var Ya=new $a("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:Ga,construct:Wa,predicate:Ka,represent:ja}),Ke;try{var qa=Dt;Ke=qa("esprima")}catch{typeof window<"u"&&(Ke=window.esprima)}var Va=B;function za(n){if(n===null)return!1;try{var e="("+n+")",t=Ke.parse(e,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function Qa(n){var e="("+n+")",t=Ke.parse(e,{range:!0}),r=[],i;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(o){r.push(o.name)}),i=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(r,e.slice(i[0]+1,i[1]-1)):new Function(r,"return "+e.slice(i[0],i[1]))}function Xa(n){return n.toString()}function Ja(n){return Object.prototype.toString.call(n)==="[object Function]"}var Za=new Va("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:za,construct:Qa,predicate:Ja,represent:Xa}),ht=be,Qe=ht.DEFAULT=new ht({include:[Ee],explicit:[Ha,Ya,Za]}),J=K,Pt=Me,el=ms,Ut=Ee,nl=Qe,ne=Object.prototype.hasOwnProperty,Ye=1,Bt=2,Ht=3,qe=4,dn=1,tl=2,ut=3,il=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,rl=/[\x85\u2028\u2029]/,ol=/[,\[\]\{\}]/,$t=/^(?:!|!!|![a-z\-]+!)$/i,Gt=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function pt(n){return Object.prototype.toString.call(n)}function V(n){return n===10||n===13}function oe(n){return n===9||n===32}function j(n){return n===9||n===32||n===10||n===13}function ue(n){return n===44||n===91||n===93||n===123||n===125}function sl(n){var e;return 48<=n&&n<=57?n-48:(e=n|32,97<=e&&e<=102?e-97+10:-1)}function al(n){return n===120?2:n===117?4:n===85?8:0}function ll(n){return 48<=n&&n<=57?n-48:-1}function mt(n){return n===48?"\0":n===97?"\x07":n===98?"\b":n===116||n===9?"	":n===110?`
`:n===118?"\v":n===102?"\f":n===114?"\r":n===101?"\x1B":n===32?" ":n===34?'"':n===47?"/":n===92?"\\":n===78?"":n===95?" ":n===76?"\u2028":n===80?"\u2029":""}function cl(n){return n<=65535?String.fromCharCode(n):String.fromCharCode((n-65536>>10)+55296,(n-65536&1023)+56320)}function Wt(n,e,t){e==="__proto__"?Object.defineProperty(n,e,{configurable:!0,enumerable:!0,writable:!0,value:t}):n[e]=t}var jt=new Array(256),Kt=new Array(256);for(var de=0;de<256;de++)jt[de]=mt(de)?1:0,Kt[de]=mt(de);function dl(n,e){this.input=n,this.filename=e.filename||null,this.schema=e.schema||nl,this.onWarning=e.onWarning||null,this.legacy=e.legacy||!1,this.json=e.json||!1,this.listener=e.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=n.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function Yt(n,e){return new Pt(e,new el(n.filename,n.input,n.position,n.line,n.position-n.lineStart))}function x(n,e){throw Yt(n,e)}function Ve(n,e){n.onWarning&&n.onWarning.call(null,Yt(n,e))}var ft={YAML:function(e,t,r){var i,o,s;e.version!==null&&x(e,"duplication of %YAML directive"),r.length!==1&&x(e,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(r[0]),i===null&&x(e,"ill-formed argument of the YAML directive"),o=parseInt(i[1],10),s=parseInt(i[2],10),o!==1&&x(e,"unacceptable YAML version of the document"),e.version=r[0],e.checkLineBreaks=s<2,s!==1&&s!==2&&Ve(e,"unsupported YAML version of the document")},TAG:function(e,t,r){var i,o;r.length!==2&&x(e,"TAG directive accepts exactly two arguments"),i=r[0],o=r[1],$t.test(i)||x(e,"ill-formed tag handle (first argument) of the TAG directive"),ne.call(e.tagMap,i)&&x(e,'there is a previously declared suffix for "'+i+'" tag handle'),Gt.test(o)||x(e,"ill-formed tag prefix (second argument) of the TAG directive"),e.tagMap[i]=o}};function Z(n,e,t,r){var i,o,s,a;if(e<t){if(a=n.input.slice(e,t),r)for(i=0,o=a.length;i<o;i+=1)s=a.charCodeAt(i),s===9||32<=s&&s<=1114111||x(n,"expected valid JSON character");else il.test(a)&&x(n,"the stream contains non-printable characters");n.result+=a}}function gt(n,e,t,r){var i,o,s,a;for(J.isObject(t)||x(n,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(t),s=0,a=i.length;s<a;s+=1)o=i[s],ne.call(e,o)||(Wt(e,o,t[o]),r[o]=!0)}function pe(n,e,t,r,i,o,s,a){var l,c;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),l=0,c=i.length;l<c;l+=1)Array.isArray(i[l])&&x(n,"nested arrays are not supported inside keys"),typeof i=="object"&&pt(i[l])==="[object Object]"&&(i[l]="[object Object]");if(typeof i=="object"&&pt(i)==="[object Object]"&&(i="[object Object]"),i=String(i),e===null&&(e={}),r==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)gt(n,e,o[l],t);else gt(n,e,o,t);else!n.json&&!ne.call(t,i)&&ne.call(e,i)&&(n.line=s||n.line,n.position=a||n.position,x(n,"duplicated mapping key")),Wt(e,i,o),delete t[i];return e}function In(n){var e;e=n.input.charCodeAt(n.position),e===10?n.position++:e===13?(n.position++,n.input.charCodeAt(n.position)===10&&n.position++):x(n,"a line break is expected"),n.line+=1,n.lineStart=n.position}function N(n,e,t){for(var r=0,i=n.input.charCodeAt(n.position);i!==0;){for(;oe(i);)i=n.input.charCodeAt(++n.position);if(e&&i===35)do i=n.input.charCodeAt(++n.position);while(i!==10&&i!==13&&i!==0);if(V(i))for(In(n),i=n.input.charCodeAt(n.position),r++,n.lineIndent=0;i===32;)n.lineIndent++,i=n.input.charCodeAt(++n.position);else break}return t!==-1&&r!==0&&n.lineIndent<t&&Ve(n,"deficient indentation"),r}function Xe(n){var e=n.position,t;return t=n.input.charCodeAt(e),!!((t===45||t===46)&&t===n.input.charCodeAt(e+1)&&t===n.input.charCodeAt(e+2)&&(e+=3,t=n.input.charCodeAt(e),t===0||j(t)))}function Sn(n,e){e===1?n.result+=" ":e>1&&(n.result+=J.repeat(`
`,e-1))}function hl(n,e,t){var r,i,o,s,a,l,c,h,d=n.kind,p=n.result,u;if(u=n.input.charCodeAt(n.position),j(u)||ue(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(i=n.input.charCodeAt(n.position+1),j(i)||t&&ue(i)))return!1;for(n.kind="scalar",n.result="",o=s=n.position,a=!1;u!==0;){if(u===58){if(i=n.input.charCodeAt(n.position+1),j(i)||t&&ue(i))break}else if(u===35){if(r=n.input.charCodeAt(n.position-1),j(r))break}else{if(n.position===n.lineStart&&Xe(n)||t&&ue(u))break;if(V(u))if(l=n.line,c=n.lineStart,h=n.lineIndent,N(n,!1,-1),n.lineIndent>=e){a=!0,u=n.input.charCodeAt(n.position);continue}else{n.position=s,n.line=l,n.lineStart=c,n.lineIndent=h;break}}a&&(Z(n,o,s,!1),Sn(n,n.line-l),o=s=n.position,a=!1),oe(u)||(s=n.position+1),u=n.input.charCodeAt(++n.position)}return Z(n,o,s,!1),n.result?!0:(n.kind=d,n.result=p,!1)}function ul(n,e){var t,r,i;if(t=n.input.charCodeAt(n.position),t!==39)return!1;for(n.kind="scalar",n.result="",n.position++,r=i=n.position;(t=n.input.charCodeAt(n.position))!==0;)if(t===39)if(Z(n,r,n.position,!0),t=n.input.charCodeAt(++n.position),t===39)r=n.position,n.position++,i=n.position;else return!0;else V(t)?(Z(n,r,i,!0),Sn(n,N(n,!1,e)),r=i=n.position):n.position===n.lineStart&&Xe(n)?x(n,"unexpected end of the document within a single quoted scalar"):(n.position++,i=n.position);x(n,"unexpected end of the stream within a single quoted scalar")}function pl(n,e){var t,r,i,o,s,a;if(a=n.input.charCodeAt(n.position),a!==34)return!1;for(n.kind="scalar",n.result="",n.position++,t=r=n.position;(a=n.input.charCodeAt(n.position))!==0;){if(a===34)return Z(n,t,n.position,!0),n.position++,!0;if(a===92){if(Z(n,t,n.position,!0),a=n.input.charCodeAt(++n.position),V(a))N(n,!1,e);else if(a<256&&jt[a])n.result+=Kt[a],n.position++;else if((s=al(a))>0){for(i=s,o=0;i>0;i--)a=n.input.charCodeAt(++n.position),(s=sl(a))>=0?o=(o<<4)+s:x(n,"expected hexadecimal character");n.result+=cl(o),n.position++}else x(n,"unknown escape sequence");t=r=n.position}else V(a)?(Z(n,t,r,!0),Sn(n,N(n,!1,e)),t=r=n.position):n.position===n.lineStart&&Xe(n)?x(n,"unexpected end of the document within a double quoted scalar"):(n.position++,r=n.position)}x(n,"unexpected end of the stream within a double quoted scalar")}function ml(n,e){var t=!0,r,i=n.tag,o,s=n.anchor,a,l,c,h,d,p={},u,m,g,b;if(b=n.input.charCodeAt(n.position),b===91)l=93,d=!1,o=[];else if(b===123)l=125,d=!0,o={};else return!1;for(n.anchor!==null&&(n.anchorMap[n.anchor]=o),b=n.input.charCodeAt(++n.position);b!==0;){if(N(n,!0,e),b=n.input.charCodeAt(n.position),b===l)return n.position++,n.tag=i,n.anchor=s,n.kind=d?"mapping":"sequence",n.result=o,!0;t||x(n,"missed comma between flow collection entries"),m=u=g=null,c=h=!1,b===63&&(a=n.input.charCodeAt(n.position+1),j(a)&&(c=h=!0,n.position++,N(n,!0,e))),r=n.line,fe(n,e,Ye,!1,!0),m=n.tag,u=n.result,N(n,!0,e),b=n.input.charCodeAt(n.position),(h||n.line===r)&&b===58&&(c=!0,b=n.input.charCodeAt(++n.position),N(n,!0,e),fe(n,e,Ye,!1,!0),g=n.result),d?pe(n,o,p,m,u,g):c?o.push(pe(n,null,p,m,u,g)):o.push(u),N(n,!0,e),b=n.input.charCodeAt(n.position),b===44?(t=!0,b=n.input.charCodeAt(++n.position)):t=!1}x(n,"unexpected end of the stream within a flow collection")}function fl(n,e){var t,r,i=dn,o=!1,s=!1,a=e,l=0,c=!1,h,d;if(d=n.input.charCodeAt(n.position),d===124)r=!1;else if(d===62)r=!0;else return!1;for(n.kind="scalar",n.result="";d!==0;)if(d=n.input.charCodeAt(++n.position),d===43||d===45)dn===i?i=d===43?ut:tl:x(n,"repeat of a chomping mode identifier");else if((h=ll(d))>=0)h===0?x(n,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?x(n,"repeat of an indentation width identifier"):(a=e+h-1,s=!0);else break;if(oe(d)){do d=n.input.charCodeAt(++n.position);while(oe(d));if(d===35)do d=n.input.charCodeAt(++n.position);while(!V(d)&&d!==0)}for(;d!==0;){for(In(n),n.lineIndent=0,d=n.input.charCodeAt(n.position);(!s||n.lineIndent<a)&&d===32;)n.lineIndent++,d=n.input.charCodeAt(++n.position);if(!s&&n.lineIndent>a&&(a=n.lineIndent),V(d)){l++;continue}if(n.lineIndent<a){i===ut?n.result+=J.repeat(`
`,o?1+l:l):i===dn&&o&&(n.result+=`
`);break}for(r?oe(d)?(c=!0,n.result+=J.repeat(`
`,o?1+l:l)):c?(c=!1,n.result+=J.repeat(`
`,l+1)):l===0?o&&(n.result+=" "):n.result+=J.repeat(`
`,l):n.result+=J.repeat(`
`,o?1+l:l),o=!0,s=!0,l=0,t=n.position;!V(d)&&d!==0;)d=n.input.charCodeAt(++n.position);Z(n,t,n.position,!1)}return!0}function yt(n,e){var t,r=n.tag,i=n.anchor,o=[],s,a=!1,l;for(n.anchor!==null&&(n.anchorMap[n.anchor]=o),l=n.input.charCodeAt(n.position);l!==0&&!(l!==45||(s=n.input.charCodeAt(n.position+1),!j(s)));){if(a=!0,n.position++,N(n,!0,-1)&&n.lineIndent<=e){o.push(null),l=n.input.charCodeAt(n.position);continue}if(t=n.line,fe(n,e,Ht,!1,!0),o.push(n.result),N(n,!0,-1),l=n.input.charCodeAt(n.position),(n.line===t||n.lineIndent>e)&&l!==0)x(n,"bad indentation of a sequence entry");else if(n.lineIndent<e)break}return a?(n.tag=r,n.anchor=i,n.kind="sequence",n.result=o,!0):!1}function gl(n,e,t){var r,i,o,s,a=n.tag,l=n.anchor,c={},h={},d=null,p=null,u=null,m=!1,g=!1,b;for(n.anchor!==null&&(n.anchorMap[n.anchor]=c),b=n.input.charCodeAt(n.position);b!==0;){if(r=n.input.charCodeAt(n.position+1),o=n.line,s=n.position,(b===63||b===58)&&j(r))b===63?(m&&(pe(n,c,h,d,p,null),d=p=u=null),g=!0,m=!0,i=!0):m?(m=!1,i=!0):x(n,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),n.position+=1,b=r;else if(fe(n,t,Bt,!1,!0))if(n.line===o){for(b=n.input.charCodeAt(n.position);oe(b);)b=n.input.charCodeAt(++n.position);if(b===58)b=n.input.charCodeAt(++n.position),j(b)||x(n,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(pe(n,c,h,d,p,null),d=p=u=null),g=!0,m=!1,i=!1,d=n.tag,p=n.result;else if(g)x(n,"can not read an implicit mapping pair; a colon is missed");else return n.tag=a,n.anchor=l,!0}else if(g)x(n,"can not read a block mapping entry; a multiline key may not be an implicit key");else return n.tag=a,n.anchor=l,!0;else break;if((n.line===o||n.lineIndent>e)&&(fe(n,e,qe,!0,i)&&(m?p=n.result:u=n.result),m||(pe(n,c,h,d,p,u,o,s),d=p=u=null),N(n,!0,-1),b=n.input.charCodeAt(n.position)),n.lineIndent>e&&b!==0)x(n,"bad indentation of a mapping entry");else if(n.lineIndent<e)break}return m&&pe(n,c,h,d,p,null),g&&(n.tag=a,n.anchor=l,n.kind="mapping",n.result=c),g}function yl(n){var e,t=!1,r=!1,i,o,s;if(s=n.input.charCodeAt(n.position),s!==33)return!1;if(n.tag!==null&&x(n,"duplication of a tag property"),s=n.input.charCodeAt(++n.position),s===60?(t=!0,s=n.input.charCodeAt(++n.position)):s===33?(r=!0,i="!!",s=n.input.charCodeAt(++n.position)):i="!",e=n.position,t){do s=n.input.charCodeAt(++n.position);while(s!==0&&s!==62);n.position<n.length?(o=n.input.slice(e,n.position),s=n.input.charCodeAt(++n.position)):x(n,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!j(s);)s===33&&(r?x(n,"tag suffix cannot contain exclamation marks"):(i=n.input.slice(e-1,n.position+1),$t.test(i)||x(n,"named tag handle cannot contain such characters"),r=!0,e=n.position+1)),s=n.input.charCodeAt(++n.position);o=n.input.slice(e,n.position),ol.test(o)&&x(n,"tag suffix cannot contain flow indicator characters")}return o&&!Gt.test(o)&&x(n,"tag name cannot contain such characters: "+o),t?n.tag=o:ne.call(n.tagMap,i)?n.tag=n.tagMap[i]+o:i==="!"?n.tag="!"+o:i==="!!"?n.tag="tag:yaml.org,2002:"+o:x(n,'undeclared tag handle "'+i+'"'),!0}function bl(n){var e,t;if(t=n.input.charCodeAt(n.position),t!==38)return!1;for(n.anchor!==null&&x(n,"duplication of an anchor property"),t=n.input.charCodeAt(++n.position),e=n.position;t!==0&&!j(t)&&!ue(t);)t=n.input.charCodeAt(++n.position);return n.position===e&&x(n,"name of an anchor node must contain at least one character"),n.anchor=n.input.slice(e,n.position),!0}function _l(n){var e,t,r;if(r=n.input.charCodeAt(n.position),r!==42)return!1;for(r=n.input.charCodeAt(++n.position),e=n.position;r!==0&&!j(r)&&!ue(r);)r=n.input.charCodeAt(++n.position);return n.position===e&&x(n,"name of an alias node must contain at least one character"),t=n.input.slice(e,n.position),ne.call(n.anchorMap,t)||x(n,'unidentified alias "'+t+'"'),n.result=n.anchorMap[t],N(n,!0,-1),!0}function fe(n,e,t,r,i){var o,s,a,l=1,c=!1,h=!1,d,p,u,m,g;if(n.listener!==null&&n.listener("open",n),n.tag=null,n.anchor=null,n.kind=null,n.result=null,o=s=a=qe===t||Ht===t,r&&N(n,!0,-1)&&(c=!0,n.lineIndent>e?l=1:n.lineIndent===e?l=0:n.lineIndent<e&&(l=-1)),l===1)for(;yl(n)||bl(n);)N(n,!0,-1)?(c=!0,a=o,n.lineIndent>e?l=1:n.lineIndent===e?l=0:n.lineIndent<e&&(l=-1)):a=!1;if(a&&(a=c||i),(l===1||qe===t)&&(Ye===t||Bt===t?m=e:m=e+1,g=n.position-n.lineStart,l===1?a&&(yt(n,g)||gl(n,g,m))||ml(n,m)?h=!0:(s&&fl(n,m)||ul(n,m)||pl(n,m)?h=!0:_l(n)?(h=!0,(n.tag!==null||n.anchor!==null)&&x(n,"alias node should not have any properties")):hl(n,m,Ye===t)&&(h=!0,n.tag===null&&(n.tag="?")),n.anchor!==null&&(n.anchorMap[n.anchor]=n.result)):l===0&&(h=a&&yt(n,g))),n.tag!==null&&n.tag!=="!")if(n.tag==="?"){for(n.result!==null&&n.kind!=="scalar"&&x(n,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+n.kind+'"'),d=0,p=n.implicitTypes.length;d<p;d+=1)if(u=n.implicitTypes[d],u.resolve(n.result)){n.result=u.construct(n.result),n.tag=u.tag,n.anchor!==null&&(n.anchorMap[n.anchor]=n.result);break}}else ne.call(n.typeMap[n.kind||"fallback"],n.tag)?(u=n.typeMap[n.kind||"fallback"][n.tag],n.result!==null&&u.kind!==n.kind&&x(n,"unacceptable node kind for !<"+n.tag+'> tag; it should be "'+u.kind+'", not "'+n.kind+'"'),u.resolve(n.result)?(n.result=u.construct(n.result),n.anchor!==null&&(n.anchorMap[n.anchor]=n.result)):x(n,"cannot resolve a node with !<"+n.tag+"> explicit tag")):x(n,"unknown tag !<"+n.tag+">");return n.listener!==null&&n.listener("close",n),n.tag!==null||n.anchor!==null||h}function vl(n){var e=n.position,t,r,i,o=!1,s;for(n.version=null,n.checkLineBreaks=n.legacy,n.tagMap={},n.anchorMap={};(s=n.input.charCodeAt(n.position))!==0&&(N(n,!0,-1),s=n.input.charCodeAt(n.position),!(n.lineIndent>0||s!==37));){for(o=!0,s=n.input.charCodeAt(++n.position),t=n.position;s!==0&&!j(s);)s=n.input.charCodeAt(++n.position);for(r=n.input.slice(t,n.position),i=[],r.length<1&&x(n,"directive name must not be less than one character in length");s!==0;){for(;oe(s);)s=n.input.charCodeAt(++n.position);if(s===35){do s=n.input.charCodeAt(++n.position);while(s!==0&&!V(s));break}if(V(s))break;for(t=n.position;s!==0&&!j(s);)s=n.input.charCodeAt(++n.position);i.push(n.input.slice(t,n.position))}s!==0&&In(n),ne.call(ft,r)?ft[r](n,r,i):Ve(n,'unknown document directive "'+r+'"')}if(N(n,!0,-1),n.lineIndent===0&&n.input.charCodeAt(n.position)===45&&n.input.charCodeAt(n.position+1)===45&&n.input.charCodeAt(n.position+2)===45?(n.position+=3,N(n,!0,-1)):o&&x(n,"directives end mark is expected"),fe(n,n.lineIndent-1,qe,!1,!0),N(n,!0,-1),n.checkLineBreaks&&rl.test(n.input.slice(e,n.position))&&Ve(n,"non-ASCII line breaks are interpreted as content"),n.documents.push(n.result),n.position===n.lineStart&&Xe(n)){n.input.charCodeAt(n.position)===46&&(n.position+=3,N(n,!0,-1));return}if(n.position<n.length-1)x(n,"end of the stream or a document separator is expected");else return}function qt(n,e){n=String(n),e=e||{},n.length!==0&&(n.charCodeAt(n.length-1)!==10&&n.charCodeAt(n.length-1)!==13&&(n+=`
`),n.charCodeAt(0)===65279&&(n=n.slice(1)));var t=new dl(n,e),r=n.indexOf("\0");for(r!==-1&&(t.position=r,x(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)vl(t);return t.documents}function Vt(n,e,t){e!==null&&typeof e=="object"&&typeof t>"u"&&(t=e,e=null);var r=qt(n,t);if(typeof e!="function")return r;for(var i=0,o=r.length;i<o;i+=1)e(r[i])}function zt(n,e){var t=qt(n,e);if(t.length!==0){if(t.length===1)return t[0];throw new Pt("expected a single document in the stream, but found more")}}function wl(n,e,t){return typeof e=="object"&&e!==null&&typeof t>"u"&&(t=e,e=null),Vt(n,e,J.extend({schema:Ut},t))}function kl(n,e){return zt(n,J.extend({schema:Ut},e))}Se.loadAll=Vt;Se.load=zt;Se.safeLoadAll=wl;Se.safeLoad=kl;var Mn={},Re=K,Le=Me,xl=Qe,Cl=Ee,Qt=Object.prototype.toString,Xt=Object.prototype.hasOwnProperty,Tl=9,Ie=10,Al=13,Il=32,Sl=33,Ml=34,Jt=35,El=37,Rl=38,Ll=39,Fl=42,Zt=44,Nl=45,ei=58,Ol=61,Dl=62,Pl=63,Ul=64,ni=91,ti=93,Bl=96,ii=123,Hl=124,ri=125,H={};H[0]="\\0";H[7]="\\a";H[8]="\\b";H[9]="\\t";H[10]="\\n";H[11]="\\v";H[12]="\\f";H[13]="\\r";H[27]="\\e";H[34]='\\"';H[92]="\\\\";H[133]="\\N";H[160]="\\_";H[8232]="\\L";H[8233]="\\P";var $l=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function Gl(n,e){var t,r,i,o,s,a,l;if(e===null)return{};for(t={},r=Object.keys(e),i=0,o=r.length;i<o;i+=1)s=r[i],a=String(e[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),l=n.compiledTypeMap.fallback[s],l&&Xt.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[s]=a;return t}function bt(n){var e,t,r;if(e=n.toString(16).toUpperCase(),n<=255)t="x",r=2;else if(n<=65535)t="u",r=4;else if(n<=4294967295)t="U",r=8;else throw new Le("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+Re.repeat("0",r-e.length)+e}function Wl(n){this.schema=n.schema||xl,this.indent=Math.max(1,n.indent||2),this.noArrayIndent=n.noArrayIndent||!1,this.skipInvalid=n.skipInvalid||!1,this.flowLevel=Re.isNothing(n.flowLevel)?-1:n.flowLevel,this.styleMap=Gl(this.schema,n.styles||null),this.sortKeys=n.sortKeys||!1,this.lineWidth=n.lineWidth||80,this.noRefs=n.noRefs||!1,this.noCompatMode=n.noCompatMode||!1,this.condenseFlow=n.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function _t(n,e){for(var t=Re.repeat(" ",e),r=0,i=-1,o="",s,a=n.length;r<a;)i=n.indexOf(`
`,r),i===-1?(s=n.slice(r),r=a):(s=n.slice(r,i+1),r=i+1),s.length&&s!==`
`&&(o+=t),o+=s;return o}function yn(n,e){return`
`+Re.repeat(" ",n.indent*e)}function jl(n,e){var t,r,i;for(t=0,r=n.implicitTypes.length;t<r;t+=1)if(i=n.implicitTypes[t],i.resolve(e))return!0;return!1}function En(n){return n===Il||n===Tl}function ge(n){return 32<=n&&n<=126||161<=n&&n<=55295&&n!==8232&&n!==8233||57344<=n&&n<=65533&&n!==65279||65536<=n&&n<=1114111}function Kl(n){return ge(n)&&!En(n)&&n!==65279&&n!==Al&&n!==Ie}function vt(n,e){return ge(n)&&n!==65279&&n!==Zt&&n!==ni&&n!==ti&&n!==ii&&n!==ri&&n!==ei&&(n!==Jt||e&&Kl(e))}function Yl(n){return ge(n)&&n!==65279&&!En(n)&&n!==Nl&&n!==Pl&&n!==ei&&n!==Zt&&n!==ni&&n!==ti&&n!==ii&&n!==ri&&n!==Jt&&n!==Rl&&n!==Fl&&n!==Sl&&n!==Hl&&n!==Ol&&n!==Dl&&n!==Ll&&n!==Ml&&n!==El&&n!==Ul&&n!==Bl}function oi(n){var e=/^\n* /;return e.test(n)}var si=1,ai=2,li=3,ci=4,Ge=5;function ql(n,e,t,r,i){var o,s,a,l=!1,c=!1,h=r!==-1,d=-1,p=Yl(n.charCodeAt(0))&&!En(n.charCodeAt(n.length-1));if(e)for(o=0;o<n.length;o++){if(s=n.charCodeAt(o),!ge(s))return Ge;a=o>0?n.charCodeAt(o-1):null,p=p&&vt(s,a)}else{for(o=0;o<n.length;o++){if(s=n.charCodeAt(o),s===Ie)l=!0,h&&(c=c||o-d-1>r&&n[d+1]!==" ",d=o);else if(!ge(s))return Ge;a=o>0?n.charCodeAt(o-1):null,p=p&&vt(s,a)}c=c||h&&o-d-1>r&&n[d+1]!==" "}return!l&&!c?p&&!i(n)?si:ai:t>9&&oi(n)?Ge:c?ci:li}function Vl(n,e,t,r){n.dump=function(){if(e.length===0)return"''";if(!n.noCompatMode&&$l.indexOf(e)!==-1)return"'"+e+"'";var i=n.indent*Math.max(1,t),o=n.lineWidth===-1?-1:Math.max(Math.min(n.lineWidth,40),n.lineWidth-i),s=r||n.flowLevel>-1&&t>=n.flowLevel;function a(l){return jl(n,l)}switch(ql(e,s,n.indent,o,a)){case si:return e;case ai:return"'"+e.replace(/'/g,"''")+"'";case li:return"|"+wt(e,n.indent)+kt(_t(e,i));case ci:return">"+wt(e,n.indent)+kt(_t(zl(e,o),i));case Ge:return'"'+Ql(e)+'"';default:throw new Le("impossible error: invalid scalar style")}}()}function wt(n,e){var t=oi(n)?String(e):"",r=n[n.length-1]===`
`,i=r&&(n[n.length-2]===`
`||n===`
`),o=i?"+":r?"":"-";return t+o+`
`}function kt(n){return n[n.length-1]===`
`?n.slice(0,-1):n}function zl(n,e){for(var t=/(\n+)([^\n]*)/g,r=function(){var c=n.indexOf(`
`);return c=c!==-1?c:n.length,t.lastIndex=c,xt(n.slice(0,c),e)}(),i=n[0]===`
`||n[0]===" ",o,s;s=t.exec(n);){var a=s[1],l=s[2];o=l[0]===" ",r+=a+(!i&&!o&&l!==""?`
`:"")+xt(l,e),i=o}return r}function xt(n,e){if(n===""||n[0]===" ")return n;for(var t=/ [^ ]/g,r,i=0,o,s=0,a=0,l="";r=t.exec(n);)a=r.index,a-i>e&&(o=s>i?s:a,l+=`
`+n.slice(i,o),i=o+1),s=a;return l+=`
`,n.length-i>e&&s>i?l+=n.slice(i,s)+`
`+n.slice(s+1):l+=n.slice(i),l.slice(1)}function Ql(n){for(var e="",t,r,i,o=0;o<n.length;o++){if(t=n.charCodeAt(o),t>=55296&&t<=56319&&(r=n.charCodeAt(o+1),r>=56320&&r<=57343)){e+=bt((t-55296)*1024+r-56320+65536),o++;continue}i=H[t],e+=!i&&ge(t)?n[o]:i||bt(t)}return e}function Xl(n,e,t){var r="",i=n.tag,o,s;for(o=0,s=t.length;o<s;o+=1)ae(n,e,t[o],!1,!1)&&(o!==0&&(r+=","+(n.condenseFlow?"":" ")),r+=n.dump);n.tag=i,n.dump="["+r+"]"}function Jl(n,e,t,r){var i="",o=n.tag,s,a;for(s=0,a=t.length;s<a;s+=1)ae(n,e+1,t[s],!0,!0)&&((!r||s!==0)&&(i+=yn(n,e)),n.dump&&Ie===n.dump.charCodeAt(0)?i+="-":i+="- ",i+=n.dump);n.tag=o,n.dump=i||"[]"}function Zl(n,e,t){var r="",i=n.tag,o=Object.keys(t),s,a,l,c,h;for(s=0,a=o.length;s<a;s+=1)h="",s!==0&&(h+=", "),n.condenseFlow&&(h+='"'),l=o[s],c=t[l],ae(n,e,l,!1,!1)&&(n.dump.length>1024&&(h+="? "),h+=n.dump+(n.condenseFlow?'"':"")+":"+(n.condenseFlow?"":" "),ae(n,e,c,!1,!1)&&(h+=n.dump,r+=h));n.tag=i,n.dump="{"+r+"}"}function ec(n,e,t,r){var i="",o=n.tag,s=Object.keys(t),a,l,c,h,d,p;if(n.sortKeys===!0)s.sort();else if(typeof n.sortKeys=="function")s.sort(n.sortKeys);else if(n.sortKeys)throw new Le("sortKeys must be a boolean or a function");for(a=0,l=s.length;a<l;a+=1)p="",(!r||a!==0)&&(p+=yn(n,e)),c=s[a],h=t[c],ae(n,e+1,c,!0,!0,!0)&&(d=n.tag!==null&&n.tag!=="?"||n.dump&&n.dump.length>1024,d&&(n.dump&&Ie===n.dump.charCodeAt(0)?p+="?":p+="? "),p+=n.dump,d&&(p+=yn(n,e)),ae(n,e+1,h,!0,d)&&(n.dump&&Ie===n.dump.charCodeAt(0)?p+=":":p+=": ",p+=n.dump,i+=p));n.tag=o,n.dump=i||"{}"}function Ct(n,e,t){var r,i,o,s,a,l;for(i=t?n.explicitTypes:n.implicitTypes,o=0,s=i.length;o<s;o+=1)if(a=i[o],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof e=="object"&&e instanceof a.instanceOf)&&(!a.predicate||a.predicate(e))){if(n.tag=t?a.tag:"?",a.represent){if(l=n.styleMap[a.tag]||a.defaultStyle,Qt.call(a.represent)==="[object Function]")r=a.represent(e,l);else if(Xt.call(a.represent,l))r=a.represent[l](e,l);else throw new Le("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');n.dump=r}return!0}return!1}function ae(n,e,t,r,i,o){n.tag=null,n.dump=t,Ct(n,t,!1)||Ct(n,t,!0);var s=Qt.call(n.dump);r&&(r=n.flowLevel<0||n.flowLevel>e);var a=s==="[object Object]"||s==="[object Array]",l,c;if(a&&(l=n.duplicates.indexOf(t),c=l!==-1),(n.tag!==null&&n.tag!=="?"||c||n.indent!==2&&e>0)&&(i=!1),c&&n.usedDuplicates[l])n.dump="*ref_"+l;else{if(a&&c&&!n.usedDuplicates[l]&&(n.usedDuplicates[l]=!0),s==="[object Object]")r&&Object.keys(n.dump).length!==0?(ec(n,e,n.dump,i),c&&(n.dump="&ref_"+l+n.dump)):(Zl(n,e,n.dump),c&&(n.dump="&ref_"+l+" "+n.dump));else if(s==="[object Array]"){var h=n.noArrayIndent&&e>0?e-1:e;r&&n.dump.length!==0?(Jl(n,h,n.dump,i),c&&(n.dump="&ref_"+l+n.dump)):(Xl(n,h,n.dump),c&&(n.dump="&ref_"+l+" "+n.dump))}else if(s==="[object String]")n.tag!=="?"&&Vl(n,n.dump,e,o);else{if(n.skipInvalid)return!1;throw new Le("unacceptable kind of an object to dump "+s)}n.tag!==null&&n.tag!=="?"&&(n.dump="!<"+n.tag+"> "+n.dump)}return!0}function nc(n,e){var t=[],r=[],i,o;for(bn(n,t,r),i=0,o=r.length;i<o;i+=1)e.duplicates.push(t[r[i]]);e.usedDuplicates=new Array(o)}function bn(n,e,t){var r,i,o;if(n!==null&&typeof n=="object")if(i=e.indexOf(n),i!==-1)t.indexOf(i)===-1&&t.push(i);else if(e.push(n),Array.isArray(n))for(i=0,o=n.length;i<o;i+=1)bn(n[i],e,t);else for(r=Object.keys(n),i=0,o=r.length;i<o;i+=1)bn(n[r[i]],e,t)}function di(n,e){e=e||{};var t=new Wl(e);return t.noRefs||nc(n,t),ae(t,0,n,!0,!0)?t.dump+`
`:""}function tc(n,e){return di(n,Re.extend({schema:Cl},e))}Mn.dump=di;Mn.safeDump=tc;var Je=Se,hi=Mn;function Ze(n){return function(){throw new Error("Function "+n+" is deprecated and cannot be used.")}}F.Type=B;F.Schema=be;F.FAILSAFE_SCHEMA=Tn;F.JSON_SCHEMA=Lt;F.CORE_SCHEMA=Ft;F.DEFAULT_SAFE_SCHEMA=Ee;F.DEFAULT_FULL_SCHEMA=Qe;F.load=Je.load;F.loadAll=Je.loadAll;F.safeLoad=Je.safeLoad;F.safeLoadAll=Je.safeLoadAll;F.dump=hi.dump;F.safeDump=hi.safeDump;F.YAMLException=Me;F.MINIMAL_SCHEMA=Tn;F.SAFE_SCHEMA=Ee;F.DEFAULT_SCHEMA=Qe;F.scan=Ze("scan");F.parse=Ze("parse");F.compose=Ze("compose");F.addConstructor=Ze("addConstructor");var ic=F,rc=ic;function oc(n){if(!n.startsWith(`---
`))return{data:{},content:n};const e=n.indexOf(`
---`,4);if(e===-1)return{data:{},content:n};const t=n.slice(4,e),r=n.slice(e+4),i=r.startsWith(`
`)?r.slice(1):r;return{data:rc.safeLoad(t)??{},content:i}}const ui={npc:{specialNameChance:.3},missions:{boardCountMin:3,boardCountMax:6,missionTtlMs:9e5,deliveryChance:.6,deliveryBaseReward:200,deliveryRandomReward:200,supplyRewardMargin:.4,supplyRandomReward:150,supplyRequirementsMin:1,supplyRequirementsMax:2,supplyQtyMin:1,supplyQtyMax:4},trading:{stockCountMin:4,stockCountMax:6,stockQtyMin:1,stockQtyMax:8,stockTtlMs:12e4},fuel:{pricePerLitre:10,consumptionPerLy:5,inSystemBaseConsumptionL:4},reputation:{levelUnfriendlyMin:-300,levelNeutralMin:-100,levelFriendlyMin:100,levelLikedMin:300,levelReveredMin:600,pointsMin:-600,pointsMax:1e3,missionDeltaSmall:25,missionDeltaMedium:75,missionDeltaLarge:200,missionTierMediumReward:300,missionTierLargeReward:600,tradeModifierHated:1.2,tradeModifierUnfriendly:1.1,tradeModifierNeutral:1,tradeModifierFriendly:.92,tradeModifierLiked:.85,tradeModifierRevered:.8,repPerCredit:.01,maxRepPerVisit:10}};function sc(n){const e={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},balance:{...ui},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[t,r]of Object.entries(n)){const i=t.split("/").pop()??"";if(i==="_template.md"||i===".gitkeep")continue;const{data:o,content:s}=oc(r);/^systems\/[^/]+\.md$/.test(t)?e.systems.push(ac(o,s)):/^destinations\/[^/]+\.md$/.test(t)?e.destinations.push(lc(o,s)):/^factions\/[^/]+\.md$/.test(t)?e.factions.push(cc(o,s)):/^ships\/[^/]+\.md$/.test(t)?e.ships.push(dc(o,s)):t==="ships/components/jump-drives.md"?e.drives=hc(o):t==="navigation/jump-routes.md"?e.routes=uc(o):t==="commodities.md"?e.commodities=pc(o):/^story\/[^/]+\.md$/.test(t)?e.storyBeats.push(mc(o,s)):t==="settings/new-game.md"?e.settings=fc(o):t==="settings/balance.md"?e.balance=bc(o):t==="delivery-items.md"?e.deliveryItems=gc(o):t==="npc-names.md"&&(e.npcNames=yc(o))}return e}function en(n){const e=[];let t=!1;for(const r of n.split(`
`)){const i=r.trim();if(!i.startsWith("#"))if(i===""){if(t)break}else t=!0,e.push(i)}return e.join(" ")}function ac(n,e){return{id:n.id,name:n.name,starType:n.star_type,distanceFromSol:n.distance_from_sol,zone:n.zone,security:n.security,population:n.population,dangerLevel:n.danger_level,playerKnowledge:n.player_knowledge,economy:n.economy??[],majorFactions:n.major_factions??[],destinations:n.destinations??[],tags:n.tags??[],description:en(e)}}function lc(n,e){const t=n.amenities??{},r={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:n.id,name:n.name,system:n.system,locationType:n.location_type,type:n.type,amenities:r,npcs:n.npcs??{},goodsBias:n.goods_bias??[],dangerLevel:n.danger_level,tags:n.tags??[],description:en(e),owningFactionId:n.owning_faction}}function cc(n,e){return{id:n.id,name:n.name,type:n.type,homeSystem:n.home_system,size:n.size,influence:n.influence??[],tags:n.tags??[],description:en(e),rivals:n.rivals??[],allies:n.allies??[]}}function dc(n,e){return{id:n.id,name:n.name,class:n.class,cost:n.cost,cargoCapacityKg:n.cargo_capacity_kg,fuelCapacityL:n.fuel_capacity_l,hullPoints:n.hull_points,defaultJumpDrive:n.default_jump_drive,fuelEfficiency:n.fuel_efficiency,tags:n.tags??[],description:en(e)}}function hc(n){return(n.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function uc(n){return(n.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function pc(n){return(n.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function mc(n,e){return{id:n.id,title:n.title,trigger:n.trigger,type:n.type,location:n.location,skippable:n.skippable,playerKnowledge:n.player_knowledge,text:e.trim()}}function fc(n){var e,t,r,i;return{player:{name:((e=n.player)==null?void 0:e.name)??"Captain",startingCredits:((t=n.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((r=n.starting_location)==null?void 0:r.system)??"",destination:((i=n.starting_location)==null?void 0:i.destination)??""},startingShip:n.starting_ship??""}}function gc(n){return(n.delivery_items??[]).map(t=>({id:t.id,name:t.name,weightKg:t.weight_kg}))}function yc(n){const e=n.npc_names??{};return{special:e.special??[],firstNames:e.first_names??[],lastNames:e.last_names??[]}}function bc(n){const e=ui,t=n.npc??{},r=n.missions??{},i=n.trading??{},o=n.fuel??{},s=n.reputation??{};return{npc:{specialNameChance:t.special_name_chance??e.npc.specialNameChance},missions:{boardCountMin:r.board_count_min??e.missions.boardCountMin,boardCountMax:r.board_count_max??e.missions.boardCountMax,missionTtlMs:r.mission_ttl_ms??e.missions.missionTtlMs,deliveryChance:r.delivery_chance??e.missions.deliveryChance,deliveryBaseReward:r.delivery_base_reward??e.missions.deliveryBaseReward,deliveryRandomReward:r.delivery_random_reward??e.missions.deliveryRandomReward,supplyRewardMargin:r.supply_reward_margin??e.missions.supplyRewardMargin,supplyRandomReward:r.supply_random_reward??e.missions.supplyRandomReward,supplyRequirementsMin:r.supply_requirements_min??e.missions.supplyRequirementsMin,supplyRequirementsMax:r.supply_requirements_max??e.missions.supplyRequirementsMax,supplyQtyMin:r.supply_qty_min??e.missions.supplyQtyMin,supplyQtyMax:r.supply_qty_max??e.missions.supplyQtyMax},trading:{stockCountMin:i.stock_count_min??e.trading.stockCountMin,stockCountMax:i.stock_count_max??e.trading.stockCountMax,stockQtyMin:i.stock_qty_min??e.trading.stockQtyMin,stockQtyMax:i.stock_qty_max??e.trading.stockQtyMax,stockTtlMs:i.stock_ttl_ms??e.trading.stockTtlMs},fuel:{pricePerLitre:o.price_per_litre??e.fuel.pricePerLitre,consumptionPerLy:o.consumption_per_ly??e.fuel.consumptionPerLy,inSystemBaseConsumptionL:o.in_system_base_consumption_l??e.fuel.inSystemBaseConsumptionL},reputation:{levelUnfriendlyMin:s.level_unfriendly_min??e.reputation.levelUnfriendlyMin,levelNeutralMin:s.level_neutral_min??e.reputation.levelNeutralMin,levelFriendlyMin:s.level_friendly_min??e.reputation.levelFriendlyMin,levelLikedMin:s.level_liked_min??e.reputation.levelLikedMin,levelReveredMin:s.level_revered_min??e.reputation.levelReveredMin,pointsMin:s.points_min??e.reputation.pointsMin,pointsMax:s.points_max??e.reputation.pointsMax,missionDeltaSmall:s.mission_delta_small??e.reputation.missionDeltaSmall,missionDeltaMedium:s.mission_delta_medium??e.reputation.missionDeltaMedium,missionDeltaLarge:s.mission_delta_large??e.reputation.missionDeltaLarge,missionTierMediumReward:s.mission_tier_medium_reward??e.reputation.missionTierMediumReward,missionTierLargeReward:s.mission_tier_large_reward??e.reputation.missionTierLargeReward,tradeModifierHated:s.trade_modifier_hated??e.reputation.tradeModifierHated,tradeModifierUnfriendly:s.trade_modifier_unfriendly??e.reputation.tradeModifierUnfriendly,tradeModifierNeutral:s.trade_modifier_neutral??e.reputation.tradeModifierNeutral,tradeModifierFriendly:s.trade_modifier_friendly??e.reputation.tradeModifierFriendly,tradeModifierLiked:s.trade_modifier_liked??e.reputation.tradeModifierLiked,tradeModifierRevered:s.trade_modifier_revered??e.reputation.tradeModifierRevered,repPerCredit:s.rep_per_credit??e.reputation.repPerCredit,maxRepPerVisit:s.max_rep_per_visit??e.reputation.maxRepPerVisit}}}function _c(){const n=Object.assign({"/docs/world/commodities.md":co,"/docs/world/delivery-items.md":ho,"/docs/world/destinations/_template.md":uo,"/docs/world/destinations/blackwake-yard.md":po,"/docs/world/destinations/ceti-landfall.md":mo,"/docs/world/destinations/drift-market.md":fo,"/docs/world/destinations/elysium-station.md":go,"/docs/world/destinations/eridani-anchorage.md":yo,"/docs/world/destinations/foundries-platform.md":bo,"/docs/world/destinations/galileo-transfer.md":_o,"/docs/world/destinations/hestia-ring.md":vo,"/docs/world/destinations/keelhaul-station.md":wo,"/docs/world/destinations/kepler-yard.md":ko,"/docs/world/destinations/mars-anchor.md":xo,"/docs/world/destinations/meridian-station.md":Co,"/docs/world/destinations/new-horizon-port.md":To,"/docs/world/destinations/orrery-anchorage.md":Ao,"/docs/world/destinations/redline-station.md":Io,"/docs/world/destinations/tycho-orbital.md":So,"/docs/world/destinations/veil-station.md":Mo,"/docs/world/destinations/waypoint-ceti.md":Eo,"/docs/world/factions/_template.md":Ro,"/docs/world/factions/centauri-trade-league.md":Lo,"/docs/world/factions/eridani-colonial-council.md":Fo,"/docs/world/factions/free-captains.md":No,"/docs/world/factions/grey-market-cartel.md":Oo,"/docs/world/factions/helios-directorate.md":Do,"/docs/world/factions/independent-miners-guild.md":Po,"/docs/world/factions/procyon-institute.md":Uo,"/docs/world/factions/terran-union.md":Bo,"/docs/world/galaxy-map.md":Ho,"/docs/world/navigation/jump-routes.md":$o,"/docs/world/npc-names.md":Go,"/docs/world/settings/balance.md":Wo,"/docs/world/settings/new-game.md":jo,"/docs/world/ships/_template.md":Ko,"/docs/world/ships/components/jump-drives.md":Yo,"/docs/world/ships/freighter.md":qo,"/docs/world/ships/hauler.md":Vo,"/docs/world/ships/scout.md":zo,"/docs/world/story/_template.md":Qo,"/docs/world/story/enter-wolf-359.md":Xo,"/docs/world/story/first-jump.md":Jo,"/docs/world/story/opening-arrival.md":Zo,"/docs/world/systems/_template.md":es,"/docs/world/systems/alpha-centauri.md":ns,"/docs/world/systems/barnards-star.md":ts,"/docs/world/systems/epsilon-eridani.md":is,"/docs/world/systems/procyon.md":rs,"/docs/world/systems/sirius.md":os,"/docs/world/systems/sol.md":ss,"/docs/world/systems/tau-ceti.md":as,"/docs/world/systems/wolf-359.md":ls}),e={};for(const[t,r]of Object.entries(n)){const i=t.replace("/docs/world/","");e[i]=r}return sc(e)}Si(_c());const vc=navigator.maxTouchPoints>0?"touch":"keyboard",wc=new URLSearchParams(window.location.search).has("debug"),pi={environment:"browser",primaryInput:vc,debug:wc},kc=new _i,mi=new xi(pi);mi.connect();const xc=new lo(kc,mi,pi);let Tt=0;function fi(n){xc.tick(n-Tt),Tt=n,requestAnimationFrame(fi)}requestAnimationFrame(fi);
