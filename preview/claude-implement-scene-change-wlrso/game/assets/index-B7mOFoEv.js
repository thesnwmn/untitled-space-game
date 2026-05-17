(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const pe=40,Ae=30,ni=50,Ye=24;function ti(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class ii{constructor(){this.charW=0,this.charH=0,this.gridH=Ae,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(pe),this.pre.dataset.gridRows=String(Ae),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${Ye}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${Ye}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const t=n.getBoundingClientRect();document.body.removeChild(n),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(pe*this.charW),window.innerHeight/(Ae*this.charH)),t=Math.max(Ae,Math.min(ni,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${Ye*n}px`,this.pre.style.width=`${pe*this.charW*n}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const r of this.resizeHandlers)r(pe,t)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const t=[];for(const r of n){let i="";for(const o of r){const s=o.fg!=="transparent"?`fg-${o.fg}`:"",a=o.bg!=="transparent"?`bg-${o.bg}`:"",l=s&&a?`${s} ${a}`:s||a,c=l?` class="${l}"`:"";i+=`<span${c}>${ti(o.char)}</span>`}t.push(i)}this.pre.innerHTML=t.join(`
`)}getWidth(){return pe}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const ri={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",m:"MENU",M:"MENU",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},oi=new Set(["0","1","2","3","4","5","6","7","8","9"]),si=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class ai{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}connect(){this.keyListener=n=>{if(si.has(n.key)&&n.preventDefault(),oi.has(n.key))for(const r of this.charInputHandlers.slice())r(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const r of this.charInputHandlers.slice())r("\b");return}const t=ri[n.key];if(t)for(const r of this.actionHandlers.slice())r(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=n=>{const t=this.pointerStartMap.get(n.pointerId),r=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),!t){this.logDebug(`UP id=${n.pointerId} NO START`);return}const i=n.clientX-t.startX,o=n.clientY-t.startY,s=Math.abs(i),a=Math.abs(o);if(s<20&&a<20)if(r>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const d of this.tapHandlers.slice())d(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;s>=a?l=i>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(i)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=n=>{this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const t=n.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(n,t){const r=document.querySelector(".game-screen");if(!r)return null;const i=r.getBoundingClientRect(),o=parseInt(r.dataset.gridCols??"1"),s=parseInt(r.dataset.gridRows??"1");if(!o||!s||!i.width||!i.height)return null;const a=Math.floor((n-i.left)/(i.width/o)),l=Math.floor((t-i.top)/(i.height/s));return a<0||a>=o||l<0||l>=s?null:{col:a,row:l}}}function f(e,n,t,r,i,o){if(n<0||n>=e.length)return;const s=e[n];for(let a=0;a<r.length;a++){const l=t+a;l>=0&&l<s.length&&(s[l]={char:r[a],fg:i,bg:o})}}function T(e,n,t,r,i){if(n<0||n>=e.length)return;const o=e[n].length,s=Math.max(0,Math.floor((o-t.length)/2));f(e,n,s,t,r,i)}function He(e,n){const t=e.split(/\s+/).filter(Boolean),r=[];let i="";for(const o of t)i.length===0?i=o:i.length+1+o.length<=n?i+=" "+o:(r.push(i),i=o);return i.length>0&&r.push(i),r}function Se(e,n,t,r="bright-black"){f(e,n,0,"-".repeat(t),r,"black")}function ht(e,n,t,r,i){const o=`${r+1}/${i}`;f(e,n,0,"|<|","white","black");const s=Math.floor((t-o.length)/2);f(e,n,s,o,"bright-black","black"),f(e,n,t-3,"|>|","white","black")}const gn=["UNTITLED","SPACE GAME"],li=4,ci=3,hi="- An ASCII space adventure -",di=11,yn=16;class bn{constructor(n,t,r,i){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,i()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),n.onAction(o=>{this.activated||(o==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:o==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:o==="SELECT"&&this.items[this.cursorIdx].action())}),n.onTap&&n.onTap((o,s)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(s===yn+a){this.cursorIdx=a,this.items[a].action();return}}})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let s=0;s<t;s++)for(let a=0;a<r;a++)n[s][a]={char:" ",fg:"black",bg:"black"};for(let s=0;s<gn.length;s++)T(n,li+s*ci,gn[s],"bright-cyan","black");T(n,di,hi,"white","black");const i=this.items.reduce((s,a)=>Math.max(s,a.label.length+2),0),o=Math.max(0,Math.floor((r-i)/2));for(let s=0;s<this.items.length;s++){const a=yn+s;if(a>=t)continue;const l=s===this.cursorIdx,c=l?"> ":"  ",d=l?"bright-green":"white";f(n,a,o,c+this.items[s].label,d,"black")}}}let Ze=null;function ui(e){Ze=e}function B(){if(Ze===null)throw new Error("World not initialised — call initWorld() before accessing world data");return Ze}function Fe(e){return B().systems.find(n=>n.id===e)}function P(e){return B().destinations.find(n=>n.id===e)}function sn(e){return B().routes.filter(n=>n.from===e||n.to===e)}function dt(e){return B().drives.find(n=>n.id===e)}function pi(e){return B().storyBeats.filter(n=>n.trigger===e)}function mi(){return B().settings}function ut(e){return B().ships.find(n=>n.id===e)}function Re(e,n){return B().routes.find(t=>t.from===e&&t.to===n||t.from===n&&t.to===e)}function Z(e){return B().commodities.find(n=>n.id===e)}function fi(){return B().commodities}function gi(){return B().systems.filter(e=>e.playerKnowledge==="public")}function yi(e){return e.reduce((n,t)=>{const r=Z(t.commodityId);return n+t.qty*((r==null?void 0:r.weightKg)??0)},0)}const be=3,_n=0;function pt(e,n){return n?e-2:e}function bi(e){return e.toLocaleString("en-US")}class _i{constructor(n,t){this.buttonRanges=null,this.footerRow=-1,this.headerWidth=-1,this.context=n,this.player=t}render(n,t){const r=n.length,i=r>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader?(this.headerWidth=i,this.renderHeaderRow0(n,i,t.systemLabel),this.renderHeaderRow1(n,i,t.destinationLabel)):this.headerWidth=-1,t.showFooter&&(this.renderFooter(n,r,i,t.navOptions),this.footerRow=r-1)}renderHeaderRow0(n,t,r){const i=r!==void 0?r??"":(()=>{const c=Fe(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),o="::";f(n,0,0,o,"bright-black","black"),f(n,0,o.length,i,"bright-cyan","black");const a=t-o.length-i.length-10;let l=o.length+i.length;for(let c=0;c<a;c++)n[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,f(n,0,l,"[M]","white","black"),l+=3,f(n,0,l," MENU","white","black"),l+=5,f(n,0,l,"::","bright-black","black")}renderHeaderRow1(n,t,r){const i=r!==void 0?r??"":(()=>{const d=this.player.destinationId?P(this.player.destinationId):null;return d?d.name.toUpperCase():"IN SPACE"})(),o=bi(this.player.credits),s=o.length+5,a="::";f(n,1,0,a,"bright-black","black"),f(n,1,a.length,i,"cyan","black");const l=t-a.length-i.length-s;let c=a.length+i.length;for(let d=0;d<l;d++)n[1][c+d]={char:":",fg:"bright-black",bg:"black"};c+=l,f(n,1,c,o,"green","black"),c+=o.length,f(n,1,c," CR","white","black"),c+=3,f(n,1,c,"::","bright-black","black")}renderFooter(n,t,r,i){const o=t-1,s=[];if(i.length===0){for(let l=0;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}f(n,o,0,"::","bright-black","black");let a=2;for(let l=0;l<i.length;l++){l>0&&(f(n,o,a,"::","bright-black","black"),a+=2);const c=i[l],d=`[${l+1}]`,h=` ${c.label}`,m=a;f(n,o,a,d,"white","black"),a+=d.length,f(n,o,a,h,"white","black"),a+=h.length,s.push({id:c.id,startCol:m,endCol:a})}for(let l=a;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=s}hitTestNav(n,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const r of this.buttonRanges)if(n>=r.startCol&&n<r.endCol)return r.id;return null}hitTestHeader(n,t){if(this.headerWidth<0||t!==0)return null;const r=this.headerWidth-10,i=this.headerWidth-2;return n>=r&&n<i?"menu":null}}class ce{constructor(n,t,r,i){this.activeTabIdx=0,this.activated=!1,this.player=r,this.chrome=new _i(t,r),this.opts=i,n.onCharInput&&n.onCharInput(o=>{this.activated||this.handleCharInput(o)}),n.onAction(o=>{if(!this.activated&&!this.preHandleAction(o)){if(o==="MENU"&&i.onMenu){i.onMenu();return}if(i.tabs){if(o==="LEFT"){const s=Math.max(0,this.activeTabIdx-1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}if(o==="RIGHT"){const s=Math.min(i.tabs.length-1,this.activeTabIdx+1);s!==this.activeTabIdx&&(this.activeTabIdx=s,this.onTabChange(s));return}}this.handleAction(o)}}),n.onTap&&n.onTap((o,s)=>{var l;if(this.activated||this.preHandleTap(o,s))return;const a=this.chrome.hitTestNav(o,s);if(a!==null){this.handleNavTap(a);return}if(this.chrome.hitTestHeader(o,s)==="menu"&&i.onMenu){i.onMenu();return}if(i.tabs&&i.title!==void 0){const c=i.showHeader??!0?be:_n,d=((l=i.summary)==null?void 0:l.length)??0,h=c+3+d;if(s===h){let m=3;for(let u=0;u<i.tabs.length;u++){const p=i.tabs[u].length+2;if(o>=m&&o<m+p){u!==this.activeTabIdx&&(this.activeTabIdx=u,this.onTabChange(u));return}m+=p+1}return}}this.handleTap(o,s)})}preHandleAction(n){return!1}preHandleTap(n,t){return!1}handleAction(n){}handleTap(n,t){}handleNavTap(n){}handleCharInput(n){}onTabChange(n){}buildChromeConfig(){return{showHeader:this.opts.showHeader??!0,showFooter:this.opts.showFooter??!0,navOptions:this.opts.navOptions}}suspend(){this.activated=!0}resume(){this.activated=!1}update(n){}render(n){var m;const t=n.length,r=t>0?n[0].length:0,i=this.opts;for(let u=0;u<t;u++)for(let p=0;p<r;p++)n[u][p]={char:" ",fg:"black",bg:"black"};const o=this.buildChromeConfig();this.chrome.render(n,o);const s=i.showHeader??!0,a=i.showFooter??!0,l=s?be:_n,c=((m=i.summary)==null?void 0:m.length)??0,d=pt(t,a);let h;if(i.title!==void 0){f(n,l,2,i.title,"bright-white","black"),f(n,l+1,2,"'".repeat(i.title.length),"bright-black","black");for(let u=0;u<c;u++)f(n,l+2+u,2,i.summary[u],"bright-black","black");if(i.tabs){const u=l+3+c;let p=2;u<t&&(n[u][p]={char:"|",fg:"bright-black",bg:"black"}),p++;for(let b=0;b<i.tabs.length;b++){const g=b===this.activeTabIdx,w=` ${i.tabs[b]} `,M=g?"black":"white",k=g?"green":"black";for(const v of w)u<t&&p<r&&(n[u][p]={char:v,fg:M,bg:k}),p++;u<t&&p<r&&(n[u][p]={char:"|",fg:"bright-black",bg:"black"}),p++}h=l+5+c}else h=l+3+c}else h=l;this.renderContent(n,h,d)}}class ne extends ce{constructor(n,t,r,i,o,s,a=[],l=null,c){super(i,o,s,{navOptions:r,title:n,summary:a,tabs:l!==null?l.map(h=>h.label):void 0,onMenu:c}),this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.modal=null,this.lastContentTop=0,this._staticItems=t,this.tabs=l,this.infoLines=a;const d=a.length;this.lastContentTop=l!==null?be+5+d:be+3+d,this.resetCursor()}get items(){var n;return this.tabs!==null?((n=this.tabs[this.activeTabIdx])==null?void 0:n.items)??[]:this._staticItems}preHandleAction(n){return this.modal!==null?(this.modal.handleAction(n),!0):!1}preHandleTap(n,t){return this.modal!==null?(this.modal.handleTap(n,t),!0):!1}handleCharInput(n){this.modal!==null&&this.modal.handleCharInput(n)}onTabChange(n){this.resetCursor()}handleAction(n){n==="UP"?this.moveCursor(-1):n==="DOWN"?this.moveCursor(1):n==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):n==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):n==="SELECT"?this.activateCurrent():this.handleNavAction(n)}handleTap(n,t){const r=this.rowToVisibleItemIndex(t);r!==null&&!this.items[r].disabled&&(this.cursorIdx=r,this.activateCurrent())}moveCursor(n){const t=this.items,r=t.length;if(r===0)return;const i=this.cursorIdx===-1?n>0?r-1:0:this.cursorIdx;for(let o=0;o<r;o++){const s=((i+n*(o+1))%r+r)%r;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const n=this.items[this.cursorIdx];n.disabled||(this.activated=!0,n.action())}rowToVisibleItemIndex(n){var i;let t=this.lastContentTop;const r=this.items;for(let o=0;o<r.length;o++){const s=1+(((i=r[o].details)==null?void 0:i.length)??0);if(n>=t&&n<t+s)return o;t+=s}return null}resetCursor(){const n=this.items;for(let t=0;t<n.length;t++)if(!n[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(n){}openModal(n){this.modal=n,this.activated=!1}closeModal(){this.modal=null}renderContent(n,t,r){var M,k;this.lastContentTop=t;const o=n.length>0?n[0].length:0,s=r-1,a=s-t,l=this.items,c=l.map(v=>{var y;return 1+(((y=v.details)==null?void 0:y.length)??0)}),h=c.reduce((v,y)=>v+y,0)>a,m=h?a-1:a,u=[];let p=[],b=0;for(let v=0;v<c.length;v++)b+c[v]>m?(p.length>0&&u.push(p),p=[v],b=c[v]):(p.push(v),b+=c[v]);p.length>0&&u.push(p),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const g=u[this.pageIndex]??[];let w=t;for(const v of g){const y=l[v],C=v===this.cursorIdx,S=y.disabled?"bright-black":C?"bright-green":y.accentFg??"white",L=y.infoFg??S,O=o-4;if(y.icon!==void 0){const R=y.icon.length;if(f(n,w,2,C?">":" ",S,"black"),f(n,w,3,y.icon,y.iconFg??S,"black"),y.info!==void 0){const I=y.info.length,z=Math.max(0,O-1-R-2-I-1),$=y.label.length>z?y.label.slice(0,z):y.label,de=Math.max(1,O-1-R-$.length-2-I);f(n,w,3+R,$+" ",S,"black"),f(n,w,3+R+$.length+1,".".repeat(de),"bright-black","black"),f(n,w,3+R+$.length+1+de+1,y.info,L,"black")}else f(n,w,3+R,y.label.slice(0,O-1-R),S,"black");for(let I=0;I<(((M=y.details)==null?void 0:M.length)??0);I++)w+1+I<=s&&f(n,w+1+I,2,("  "+y.details[I]).slice(0,O),y.detailsFg??"bright-black","black")}else if(y.info!==void 0){const R=C?"> ":"  ",x=Math.max(1,O-2-y.label.length-2-y.info.length);f(n,w,2,R+y.label+" ",S,"black"),f(n,w,2+R.length+y.label.length+1,".".repeat(x),"bright-black","black"),f(n,w,2+R.length+y.label.length+1+x+1,y.info,L,"black")}else if(y.details!==void 0&&y.details.length>0){f(n,w,2,((C?"> ":"  ")+y.label).slice(0,O),S,"black");for(let x=0;x<y.details.length;x++)w+1+x<=s&&f(n,w+1+x,2,("  "+y.details[x]).slice(0,O),y.detailsFg??"bright-black","black")}else f(n,w,2,((C?"> ":"  ")+y.label).slice(0,O),S,"black");w+=1+(((k=y.details)==null?void 0:k.length)??0)}h&&ht(n,s,o,this.pageIndex,this.lastPageCount),this.modal!==null&&this.modal.render(n)}}class vn extends ne{constructor(n,t,r,i,o){const s=i.length===0?[{label:"NO OPTIONS AVAILABLE",disabled:!0,action:()=>{}}]:i.map(a=>({label:a.label,action:a.action}));super("MENU",s,[{id:"game",label:"GAME"}],n,t,r,[],null,o),this.onClose=o}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onClose())}handleNavTap(n){n==="game"&&!this.activated&&(this.activated=!0,this.onClose())}}function an(e,n){return e.type==="delivery"?e.pickupComplete?n.destinationId===e.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":e.requirements.every(r=>{const i=n.cargoHold.find(o=>o.commodityId===r.commodityId);return i!==void 0&&i.qty>=r.qty})?"ready-to-deliver":"needs-supplies"}function vi(e,n){return n.type==="delivery"&&e.cargoCapacity-e.cargoWeightKg<n.itemWeightKg?{ok:!1,reason:"Insufficient cargo space"}:{ok:!0}}class wi{constructor(n){const t=ut(n.shipId);if(!t)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[]}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,t){const r=this._cargoHold.find(i=>i.commodityId===n);r?r.qty+=t:this._cargoHold.push({commodityId:n,qty:t})}removeCargo(n,t){const r=this._cargoHold.findIndex(i=>i.commodityId===n);r<0||(t!==void 0&&t<this._cargoHold[r].qty?this._cargoHold[r].qty-=t:this._cargoHold.splice(r,1))}get missionItemsWeightKg(){return this._missionItems.reduce((n,t)=>n+t.weightKg,0)}get cargoWeightKg(){return yi(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(n,t){const r={...n,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(r),n.type==="delivery"&&t&&(this._missionItems.push({missionId:n.id,itemName:n.itemName,weightKg:n.itemWeightKg}),r.pickupComplete=!0)}collectMissionItem(n){const t=this._activeMissions.find(r=>r.id===n);!t||t.type!=="delivery"||(t.pickupComplete=!0,this._missionItems.push({missionId:t.id,itemName:t.itemName,weightKg:t.itemWeightKg}))}completeMission(n){this._activeMissions=this._activeMissions.filter(t=>t.id!==n),this._missionItems=this._missionItems.filter(t=>t.missionId!==n)}cancelMission(n){this._activeMissions=this._activeMissions.filter(t=>t.id!==n),this._missionItems=this._missionItems.filter(t=>t.missionId!==n)}getMissionsForPickup(n){return this._activeMissions.filter(t=>t.type==="delivery"&&t.pickupDestinationId===n&&!t.pickupComplete)}getMissionsForDelivery(n){return this._activeMissions.filter(t=>t.deliveryDestinationId===n&&an(t,this)==="ready-to-deliver")}}const wn=40;class en{constructor(n){this.focus="confirm",this.confirmRect=null,this.cancelRect=null,this.opts=n}handleAction(n){var t,r;if(n==="BACK"){this.opts.onConfirm();return}if(n==="LEFT"||n==="RIGHT"||n==="TAB"){this.opts.cancelLabel!==void 0&&(this.focus=this.focus==="confirm"?"cancel":"confirm");return}n==="SELECT"&&(this.focus==="cancel"?(r=(t=this.opts).onCancel)==null||r.call(t):this.opts.onConfirm())}handleCharInput(n){}handleTap(n,t){var r,i;this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.opts.onConfirm():this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&((i=(r=this.opts).onCancel)==null||i.call(r))}render(n){const t=n.length,r=t>0?n[0].length:0,{title:i,body:o,confirmLabel:s,cancelLabel:a}=this.opts,l=wn-2,c=He(o,l),d=c.length,h=4+d+1+1+1,m=wn,u=Math.floor((r-m)/2),p=Math.floor((t-h)/2);for(let y=0;y<h;y++)for(let C=0;C<m;C++){const S=p+y,L=u+C;S>=0&&S<t&&L>=0&&L<r&&(n[S][L]={char:" ",fg:"white",bg:"black"})}const b=(y,C,S)=>{y>=0&&y<t&&C>=0&&C<r&&(n[y][C]={char:S,fg:"white",bg:"black"})};b(p,u,"+"),b(p,u+m-1,"+");for(let y=1;y<m-1;y++)b(p,u+y,"-");b(p+h-1,u,"+"),b(p+h-1,u+m-1,"+");for(let y=1;y<m-1;y++)b(p+h-1,u+y,"-");for(let y=1;y<h-1;y++)b(p+y,u,"|"),b(p+y,u+m-1,"|");const g=i.slice(0,l),w=p+1,M=u+1+Math.floor((l-g.length)/2);f(n,w,M,g,"bright-white","black"),f(n,p+2,M,"'".repeat(g.length),"bright-black","black");for(let y=0;y<c.length;y++)f(n,p+4+y,u+1,c[y],"white","black");const k=p+4+d+1,v=`[ ${s} ]`;if(a!==void 0){const y=`[ ${a} ]`,C=2,S=v.length+C+y.length,L=Math.floor((l-S)/2),O=u+1+L,R=O+v.length+C;this.confirmRect={col:O,row:k,width:v.length},this.cancelRect={col:R,row:k,width:y.length};const x=this.focus==="confirm",I=this.focus==="cancel";f(n,k,O,v,x?"black":"white",x?"green":"black"),f(n,k,R,y,I?"black":"white",I?"green":"black")}else{const y=Math.floor((l-v.length)/2),C=u+1+y;this.confirmRect={col:C,row:k,width:v.length},this.cancelRect=null,f(n,k,C,v,"black","green")}}}const ki={delivery:"[D] ",supply:"[S] "},xi={"pending-pickup":"PENDING PICKUP","needs-supplies":"NEEDS SUPPLIES","in-transit":"IN TRANSIT","ready-to-deliver":"READY TO DELIVER"},Ci={"pending-pickup":"yellow","needs-supplies":"yellow","in-transit":"bright-black","ready-to-deliver":"bright-green"};class Ti extends ne{constructor(n,t,r,i,o){super("MISSIONS",[],[{id:"game",label:"GAME"},{id:"menu",label:"MENU"}],n,t,r,[],null,o),this.onBack=i,this.onGame=o}get items(){const n=this.player.activeMissions;return n.length===0?[{label:"NO ACTIVE MISSIONS",disabled:!0,action:()=>{}}]:n.map(t=>{const r=an(t,this.player),i=P(t.deliveryDestinationId),o=(i==null?void 0:i.name)??t.deliveryDestinationId,s=xi[r]??r,a=Ci[r]??"white";return{label:t.title,icon:ki[t.type],iconFg:"bright-yellow",info:`${t.reward} CR`,infoFg:"bright-green",details:[`${s} → ${o}`],detailsFg:a,action:()=>this.openMissionModal(t)}})}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}openMissionModal(n){this.openModal(new en({title:n.title,body:n.description,confirmLabel:"OKAY",cancelLabel:"CANCEL MISSION",onConfirm:()=>this.closeModal(),onCancel:()=>{this.player.cancelMission(n.id),this.closeModal();const t=this.player.activeMissions.length;t===0?this.cursorIdx=-1:this.cursorIdx>=t&&(this.cursorIdx=t-1)}}))}handleNavAction(n){n==="NAV_1"&&!this.activated?(this.activated=!0,this.onGame()):(n==="BACK"||n==="NAV_2")&&!this.activated&&(this.activated=!0,this.onBack())}handleNavTap(n){n==="game"&&!this.activated?(this.activated=!0,this.onGame()):n==="menu"&&!this.activated&&(this.activated=!0,this.onBack())}}class Ai extends ce{constructor(n,t,r,i){super(n,t,r,{navOptions:[]}),this.pageIndex=0,this.onContinue=i;const s=pi("game-start")[0].text.split(`

`),a=s[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=s.slice(1)):(this.yearHeader="",l=s);const c=[];for(let d=0;d<l.length;d++){const h=l[d].replace(/\n/g," "),m=He(h,36);d>0&&c.push(""),c.push(...m)}this.bodyLines=c}handleAction(n){n==="SELECT"?(this.activated=!0,this.onContinue()):n==="LEFT"?this.pageIndex>0&&this.pageIndex--:n==="RIGHT"&&this.pageIndex++}handleTap(n,t){this.activated=!0,this.onContinue()}renderContent(n,t,r){const i=n.length>0?n[0].length:0;if(this.yearHeader){const p=Math.max(0,Math.floor((i-this.yearHeader.length)/2));f(n,t,p,this.yearHeader,"bright-yellow","black")}const o=t+2,s=r-1,a=s-o,l=Math.max(1,a),c=Math.max(1,Math.ceil(this.bodyLines.length/l));this.pageIndex>=c&&(this.pageIndex=c-1);const d=c>1,h=this.pageIndex*l,m=Math.min(h+l,this.bodyLines.length);let u=o;for(let p=h;p<m;p++){const b=this.bodyLines[p];b!==""&&f(n,u,2,b,"white","black"),u++}d&&ht(n,s,i,this.pageIndex,c)}}const mt=5,me=10,Si=30;class nn{constructor(n){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=n,this.value=Math.max(n.field.min,Math.min(n.field.max,n.field.initialValue))}handleAction(n){const{field:t}=this.formDef;if(n==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(n==="UP"){this.value=Math.min(t.max,this.value+1);return}if(n==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(n==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(n==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(n==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}n==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(n){if(this.focus!=="field")return;const{field:t}=this.formDef;if(n==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(n>="0"&&n<="9"){const r=parseInt(n,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,r)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+r)}}handleTap(n,t){this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(n){const t=n.length,r=t>0?n[0].length:0,{title:i,field:o,derivedRows:s,confirmLabel:a}=this.formDef,l=s.length,c=8+l,d=Si,h=Math.floor((r-d)/2),m=Math.floor((t-c)/2);for(let A=0;A<c;A++)for(let G=0;G<d;G++){const K=m+A,ue=h+G;K>=0&&K<t&&ue>=0&&ue<r&&(n[K][ue]={char:" ",fg:"white",bg:"black"})}const u=(A,G,K)=>{A>=0&&A<t&&G>=0&&G<r&&(n[A][G]={char:K,fg:"white",bg:"black"})};u(m,h,"+"),u(m,h+d-1,"+");for(let A=1;A<d-1;A++)u(m,h+A,"-");u(m+c-1,h,"+"),u(m+c-1,h+d-1,"+");for(let A=1;A<d-1;A++)u(m+c-1,h+A,"-");for(let A=1;A<c-1;A++)u(m+A,h,"|"),u(m+A,h+d-1,"|");const p=d-2,b=m+1,g=h+1+Math.floor((p-i.length)/2);f(n,b,g,i,"bright-white","black"),f(n,m+2,g,"'".repeat(i.length),"bright-black","black");const w=[o.label,...s.map(A=>A.label)],M=Math.max(...w.map(A=>A.length)),k=h+1+M+3,v=m+4,y=this.focus==="field";f(n,v,h+1,o.label.padEnd(M)+" : ","white","black");const C=this.value.toString().padStart(5);f(n,v,k,C,y?"black":"white",y?"green":"black");for(let A=0;A<l;A++){const G=s[A],K=m+5+A,ue=G.compute(this.value);f(n,K,h+1,G.label.padEnd(M)+" : ","white","black"),f(n,K,k,ue,"white","black")}const S=m+4+l+2,L=`[ ${a} ]`,O="[ CANCEL ]",R=3,x=L.length+R+O.length,I=Math.floor((p-x)/2),z=h+1+I,$=z+L.length+R;this.confirmRect={col:z,row:S,width:L.length},this.cancelRect={col:$,row:S,width:O.length};const de=this.focus==="confirm",fn=this.focus==="cancel";f(n,S,z,L,de?"black":"white",de?"green":"black"),f(n,S,$,O,fn?"black":"white",fn?"green":"black")}}class Ii extends ne{constructor(n,t,r,i,o,s,a,l,c,d){const h=P(i),m=r.getMissionsForPickup(i),u=r.getMissionsForDelivery(i),p=m.map(x=>({label:`COLLECT: ${x.type==="delivery"?x.itemName:""}`,accentFg:"bright-yellow",action:()=>{}})),b=u.map(x=>({label:`DELIVER: ${x.title} → ${x.reward} CR`,accentFg:"bright-yellow",action:()=>{}})),g=[...p,...b],w=[];h.amenities.trader&&w.push({label:"TRADER",action:s}),h.amenities.missionBoard&&w.push({label:"MISSION BOARD",action:a});const M=r.fuelCapacityL-r.fuelL,k=Math.floor(r.credits/me),v=Math.min(M,k);let y=null;if(h.amenities.fuel&&v>0){const x=v*me;y=g.length+(g.length>0?1:0)+w.length,w.push({label:`BUY FUEL  +${v}L  ${x}CR`,action:()=>{}})}const C=[];g.length>0&&(C.push(...g),C.push({label:"────────────────────",disabled:!0,action:()=>{}})),C.push(...w);const S=He(h.description,36).slice(0,3),L=`DANGER: ${h.dangerLevel.toUpperCase()}`,O=[...S,L],R=h.locationType==="surface"||h.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",C,[{id:"undock",label:R}],n,t,r,O,null,d),this.onShip=c,this.onRefuel=o,this.onHub=l,this.fuelItemIdx=y;for(let x=0;x<m.length;x++){const I=m[x];p[x].action=()=>{this.player.collectMissionItem(I.id),this.onHub()}}for(let x=0;x<u.length;x++){const I=u[x];b[x].action=()=>{if(an(I,this.player)!=="ready-to-deliver"){this.openModal(new en({title:"CANNOT DELIVER",body:I.type==="delivery"?"Mission item is missing from your cargo.":"Required supplies are missing from your cargo.",confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.activated=!1}}));return}if(I.type==="supply")for(const $ of I.requirements)this.player.removeCargo($.commodityId,$.qty);this.player.completeMission(I.id),this.player.addCredits(I.reward),this.openModal(new en({title:"MISSION COMPLETE",body:`Mission complete!

You received ${I.reward} CR.`,confirmLabel:"OKAY",onConfirm:()=>{this.closeModal(),this.onHub()}}))}}}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx===-1)return;const t=n[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const r=this.player.fuelCapacityL-this.player.fuelL,i=Math.floor(this.player.credits/me),o=Math.min(r,i);this.openModal(new nn({title:"BUY FUEL",field:{label:"Litres",initialValue:o,min:0,max:o},derivedRows:[{label:"Cost",compute:s=>`${s*me} CR`}],confirmLabel:"BUY",onConfirm:s=>{this.closeModal(),s>0&&this.onRefuel(s*me,s)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class Ei extends ne{constructor(n,t,r,i,o,s,a,l,c,d){var p;const m=((p=P(i).npcs.trader)==null?void 0:p.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(m,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,[],u,d),this.traderStock=o,this.onBuy=s,this.onSell=a,this.onHub=l,this.onUndock=c,this.syncItems(),this.clampCursor()}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(n=>{const t=Z(n.commodityId);if(!t)return[];const r=this.player.credits>=t.basePrice;return[{label:`${t.name} (x${n.qty})`,info:`${t.basePrice} CR`,disabled:!r,action:()=>{const i=Math.floor(this.player.credits/t.basePrice),o=Math.min(n.qty,i);this.openModal(new nn({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:o,min:0,max:o},derivedRows:[{label:"Total",compute:s=>`${s*t.basePrice} CR`}],confirmLabel:"BUY",onConfirm:s=>{s>0&&this.onBuy(n.commodityId,s),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const n=this.player.cargoHold;return n.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...n].flatMap(t=>{const r=Z(t.commodityId);return r?[{label:`${r.name} (x${t.qty})`,info:`${r.basePrice} CR`,action:()=>{this.openModal(new nn({title:r.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:i=>`${i*r.basePrice} CR`}],confirmLabel:"SELL",onConfirm:i=>{i>0&&this.onSell(t.commodityId,i),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]:[]})}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const n=this.items;(this.cursorIdx<0||this.cursorIdx>=n.length||(t=n[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=n.findIndex(r=>!r.disabled))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(n){this.syncItems(),super.render(n);const t=n.length,r=`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,i=pt(t,!0)-2;f(n,i,2,r,"bright-black","black")}}const Mi={delivery:"[D] ",supply:"[S] "};class Li extends ne{constructor(n,t,r,i,o,s,a,l,c){P(i);const d=o();let h;d.length===0?h=[{label:"NO MISSIONS AVAILABLE",disabled:!0,action:()=>{}}]:h=d.map(m=>({label:m.title,icon:Mi[m.type],iconFg:"bright-yellow",info:`${m.reward} CR`,infoFg:"bright-green",action:()=>s(m)})),super("MISSION BOARD",h,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,[],null,c),this.onHub=a,this.onUndock=l}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}const Ri={delivery:"[D]",supply:"[S]"},kn=16;class Ni extends ne{constructor(n,t,r,i,o,s,a,l){const c=vi(r,i),d=i.type==="delivery"&&i.pickupDestinationId===i.issuingDestinationId,h=c.ok?{label:"ACCEPT MISSION",action:()=>o(d)}:{label:"ACCEPT MISSION",disabled:!0,details:c.reason?[c.reason]:[],action:()=>{}},m={label:"BACK",action:()=>s()},u=Array.from({length:kn},()=>"");super("MISSION BOARD",[h,m],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,u),this.spec=i,this.onBack=s,this.onHub=a,this.onUndock=l}destColor(n){if(n===this.player.destinationId)return"bright-green";const t=P(n);return t&&t.system===this.player.systemId?"bright-yellow":"white"}writeDestRow(n,t,r,i,o,s){f(n,t,2,r,"white","black"),f(n,t,2+r.length,i.slice(0,s-r.length),this.destColor(o),"black")}handleNavAction(n){this.activated||(n==="NAV_1"?(this.activated=!0,this.onUndock()):n==="NAV_2"?(this.activated=!0,this.onHub()):n==="BACK"&&(this.activated=!0,this.onBack()))}handleNavTap(n){this.activated||(n==="undock"?(this.activated=!0,this.onUndock()):n==="hub"&&(this.activated=!0,this.onHub()))}renderContent(n,t,r){super.renderContent(n,t,r),this.renderDetail(n,t-kn)}renderDetail(n,t){const i=n.length>0?n[0].length:40,o=i-4,s=this.lastContentTop-1;let a=t;const l=(u,p,b)=>{u<=s&&f(n,u,2,p.slice(0,o),b,"black")};l(a,`${Ri[this.spec.type]} ${this.spec.title}`,"bright-yellow"),a++;const c=B(),d=this.spec.giverFactionId?c.factions.find(u=>u.id===this.spec.giverFactionId):null,h=d?` [${d.name}]`:"";if(l(a,`    ${this.spec.giverName}${h}`,"bright-black"),a++,a++,this.spec.type==="delivery"){const u=P(this.spec.pickupDestinationId),p=P(this.spec.deliveryDestinationId);if(a<=s&&this.writeDestRow(n,a,"Pickup:  ",(u==null?void 0:u.name)??this.spec.pickupDestinationId,this.spec.pickupDestinationId,o),a++,a<=s&&this.writeDestRow(n,a,"Deliver: ",(p==null?void 0:p.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++,a<=s){const b=this.player.cargoCapacity-this.player.cargoWeightKg,g=this.spec.itemWeightKg,w=b>=g,M=`Weight:  ${g} kg  (Free: ${b} kg)`;f(n,a,2,M,"white","black");const k=w?"bright-green":"red",v=2+M.length+1;v<i&&f(n,a,v,w?"✓":"✗",k,"black")}a++}else{const u=P(this.spec.deliveryDestinationId);a<=s&&this.writeDestRow(n,a,"Deliver to: ",(u==null?void 0:u.name)??this.spec.deliveryDestinationId,this.spec.deliveryDestinationId,o),a++;for(const p of this.spec.requirements){if(a>s)break;const b=Z(p.commodityId);l(a,`  ${p.qty}x ${(b==null?void 0:b.name)??p.commodityId}`,"white"),a++}}a++;const m=He(this.spec.description,o);for(const u of m){if(a>s)break;l(a,u,"white"),a++}a++,!(a>s)&&l(a,`REWARD: ${this.spec.reward} CR`,"bright-green")}}const Oi=[18,10,5],Fi=[".","*","+"],xn=[4e3,2e3,800],Di=[9e3,5e3,2500],Pi=[null,"bright-black","white"],Ui=["bright-black","white","bright-white"],Bi=["white","bright-white","bright-cyan"],Ie=3,Cn=25,Ee=2,Tn=37,An=2*Math.PI;function Hi(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class $i{constructor(n=42){this.boundsSet=!1,this.rand=Hi(n),this.stars=[];for(let t=0;t<3;t++)for(let r=0;r<Oi[t];r++){const i=Ee+Math.floor(this.rand()*(Tn-Ee+1)),o=Ie+Math.floor(this.rand()*(Cn-Ie+1)),s=this.rand()*An,a=xn[t]+this.rand()*(Di[t]-xn[t]);this.stars.push({col:i,row:o,layer:t,twinklePhase:s,twinklePeriod:a})}}update(n){for(const t of this.stars)t.twinklePhase+=An/t.twinklePeriod*n}render(n,t,r,i,o){if(!this.boundsSet){this.boundsSet=!0;const s=Cn-Ie,a=Tn-Ee;{const l=(r-t)/s,c=(o-i)/a;for(const d of this.stars)d.row=Math.round(t+(d.row-Ie)*l),d.col=Math.round(i+(d.col-Ee)*c)}}for(const s of this.stars){const{row:a,col:l,layer:c}=s;if(a<t||a>r||l<i||l>o)continue;const d=Math.sin(s.twinklePhase);let h;d>=.5?h=Bi[c]:d>=-.5?h=Ui[c]:h=Pi[c],h!==null&&(n[a][l]={char:Fi[c],fg:h,bg:"black"})}}getStars(){return this.stars}}const Gi=6,qe=6,Wi=23,ji=23,Ve=10,Ki=0,Yi=4,qi=18,Vi=21,zi=35,Xi=39,Sn=12,Ji=11,X=13,fe=27,ze=28,Qi=12,Xe=40,In=200,Je=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],Zi="#",En=["green","cyan","white","yellow"],Mn=["*",".","+","x"];function Ln(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function er(e,n,t){return{col:n,row:t,char:Zi,color:En[Math.floor(e()*En.length)],phase:e()*2e4,period:1e4+e()*1e4,active:e()>.2}}function ge(e,n,t,r){const i=[];for(const o of r)for(let s=n;s<=t;s++)i.push(er(e,s,o));return i}class nr extends ce{constructor(n,t,r,i,o,s,a){super(n,t,r,{navOptions:[],onMenu:a}),this.cursorIdx=0,this.h=30,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.onTravel=i,this.onDock=o,this.onCargo=s,this.starfield=new $i(42),this.inSpace=r.destinationId===null;const l=Ln(99);this.gaugeBtns=[...ge(l,Ki,Yi,[3,4]),...ge(l,qi,Vi,[3,4]),...ge(l,zi,Xi,[3,4])],this.leftBtns=ge(l,0,Ji,[0,1,2,3]),this.rightBtns=ge(l,ze,39,[0,1,2,3]);const c=Ln(77),d=3+Math.floor(c()*4);this.radarContacts=Array.from({length:d},()=>({x:c()*(fe-X-1),y:c()*4,vx:(c()-.5)*2,vy:(c()-.5)*1.5,char:Mn[Math.floor(c()*Mn.length)]}))}navCount(){return this.inSpace?1:2}handleAction(n){n==="CARGO"?(this.activated=!0,this.onCargo()):n==="UP"?this.cursorIdx=(this.cursorIdx-1+this.navCount())%this.navCount():n==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.navCount():n==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,this.onTravel()):this.inSpace||(this.activated=!0,this.onDock()))}handleTap(n,t){const r=this.h;(t===3||t===4)&&n>=qe&&n<qe+1+Ve?(this.activated=!0,this.onCargo()):t===r-3&&n<Sn?(this.activated=!0,this.onTravel()):t===r-3&&n>=ze&&!this.inSpace&&(this.activated=!0,this.onDock())}update(n){this.starfield.update(n),this.blinkPhase=(this.blinkPhase+n)%1e3;for(const i of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])i.phase+=n,i.phase>=i.period&&(i.phase-=i.period,i.active=!i.active);const t=fe-X,r=5;for(const i of this.radarContacts)i.x+=i.vx*n/1e3,i.y+=i.vy*n/1e3,i.x<0&&(i.x=-i.x,i.vx=-i.vx),i.x>t-1&&(i.x=2*(t-1)-i.x,i.vx=-i.vx),i.y<0&&(i.y=-i.y,i.vy=-i.vy),i.y>r-1&&(i.y=2*(r-1)-i.y,i.vy=-i.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-n);else for(this.tickerAccum+=n;this.tickerAccum>=In;){this.tickerAccum-=In,this.tickerScroll++;const i=Je[this.msgIdx];if(this.tickerScroll>=i.length+Xe-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%Je.length,this.tickerPause=500,this.tickerAccum=0;break}}}renderContent(n,t,r){const i=n.length,o=i>0?n[0].length:0;this.h=i;const s=t+2,a=i-8,l=i-7,c=i-3,d=i-2;this.renderGaugeStrip(n,t),this.starfield.render(n,s,a,0,39);for(let h=0;h<o;h++)n[s][h]={char:"-",fg:"white",bg:"black"},n[a][h]={char:"-",fg:"white",bg:"black"};this.renderHUD(n,s+1),this.renderCrosshair(n,s+1,a-1),this.renderBottomPanels(n,l,c),this.renderTicker(n,d)}renderGaugeStrip(n,t){for(const s of this.gaugeBtns){const a=t+s.row-3,l=s.active?s.color:"bright-black";a>=0&&a<n.length&&(n[a][s.col]={char:s.char,fg:l,bg:"black"})}const r=this.player.fuelL/this.player.fuelCapacityL,i=this.player.cargoWeightKg/this.player.cargoCapacity,o=this.blinkPhase<500;this.renderGauge(n,t,Gi,"F",r,"yellow",o),this.renderGauge(n,t+1,qe,"C",i,"blue",o),this.renderGauge(n,t,Wi,"S",1,"cyan",o),this.renderGauge(n,t+1,ji,"H",1,"green",o)}renderGauge(n,t,r,i,o,s,a){if(t<0||t>=n.length)return;n[t][r]={char:i,fg:s,bg:"black"};const l=Math.round(Math.min(1,Math.max(0,o))*Ve),c=o<=.2;for(let d=0;d<Ve;d++){const h=r+1+d;if(d<l){const m=c&&!a?"bright-black":s;n[t][h]={char:" ",fg:"black",bg:m}}else n[t][h]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(n,t){f(n,t,1,"VEL:----","bright-black","black"),f(n,t,16,"ATT:---°","bright-black","black"),f(n,t,30,"ROT:--°","bright-black","black")}renderCrosshair(n,t,r){var a;const i=Math.floor((t+r)/2),o=20;n[i][o]={char:"+",fg:"bright-green",bg:"black"};const s=[[i-3,o-5],[i-3,o+5],[i+3,o-5],[i+3,o+5]];for(const[l,c]of s){const d=((a=n[0])==null?void 0:a.length)??40;l>=t&&l<=r&&c>=0&&c<d&&(n[l][c]={char:"+",fg:"bright-green",bg:"black"})}}renderBottomPanels(n,t,r){for(let c=t;c<=r;c++)for(let d=X;d<fe;d++)n[c][d]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(n,t,r-t+1);for(const c of this.leftBtns){const d=t+c.row;if(d<r){const h=c.active?c.color:"bright-black";n[d][c.col]={char:c.char,fg:h,bg:"black"}}}for(const c of this.rightBtns){const d=t+c.row;if(d<r){const h=c.active?c.color:"bright-black";n[d][c.col]={char:c.char,fg:h,bg:"black"}}}const i=this.cursorIdx===0?"bright-yellow":"yellow";f(n,r,0,this.centerPad("TRAVEL",Sn),"black",i);let o,s;this.inSpace?(o="bright-black",s="bright-black"):(o=this.cursorIdx===1?"bright-cyan":"cyan",s="black"),f(n,r,ze,this.centerPad("DOCK",Qi),s,o);const a=fe-X,l="<)) "+"-".repeat(a-4);f(n,r,X,l,"white","bright-black")}renderRadar(n,t,r){for(const i of this.radarContacts){const o=Math.min(fe-X-1,Math.max(0,Math.floor(i.x))),s=Math.min(r-1,Math.max(0,Math.floor(i.y)));n[t+s][X+o]={char:i.char,fg:"white",bg:"bright-black"}}}renderTicker(n,t){const r=Je[this.msgIdx];for(let i=0;i<Xe;i++){const o=this.tickerScroll-Xe+1+i,s=o>=0&&o<r.length?r[o]:" ";n[t][i]={char:s,fg:"white",bg:"black"}}}centerPad(n,t){if(n.length>=t)return n.slice(0,t);const r=t-n.length,i=Math.floor(r/2);return" ".repeat(i)+n+" ".repeat(r-i)}}class tr extends ce{constructor(n,t,r,i,o){super(n,t,r,{title:"CARGO HOLD",tabs:["COMMODITIES","MISSION GOODS"],navOptions:[{id:"back",label:"BACK"}],onMenu:o}),this.onBack=i}handleNavTap(n){n==="back"&&(this.activated=!0,this.onBack())}handleAction(n){(n==="BACK"||n==="CARGO")&&(this.activated=!0,this.onBack())}renderContent(n,t,r){const o=n.length>0?n[0].length:0,s=this.player.cargoHold,a=this.player.missionItems,l=this.player.cargoCapacity,c=this.player.cargoWeightKg,d=r-1;this.activeTabIdx===0?this.renderCommoditiesTab(n,t,d,o,s):this.renderMissionGoodsTab(n,t,d,o,a);const h=`TOTAL: ${c}/${l}KG`;f(n,d,2,h,"bright-black","black")}renderCommoditiesTab(n,t,r,i,o){if(o.length===0){f(n,t,2,"NO COMMODITIES","bright-black","black");return}let s=t;for(const a of o){if(s>=r-1)break;const l=Z(a.commodityId);if(!l)continue;const c=a.qty*l.weightKg,d=`  x${a.qty}  ${l.basePrice}CR  ${c}KG`,h=Math.max(6,i-4-d.length),m=l.name,u=m.length>h?m.slice(0,h):m;f(n,s,2,`${u}${d}`,"white","black"),s++}}renderMissionGoodsTab(n,t,r,i,o){if(o.length===0){f(n,t,2,"NO MISSION GOODS","bright-black","black");return}let s=t;for(const a of o){if(s>=r-1)break;const l=`  ${a.weightKg}KG`,c=Math.max(6,i-4-l.length),d=a.itemName.length>c?a.itemName.slice(0,c):a.itemName;f(n,s,2,`${d}${l}`,"white","black"),s++}}}class Rn extends ne{constructor(n,t,r,i,o,s,a,l,c=()=>{}){const d=Fe(r.systemId),h=dt(r.driveId),m=[...d.destinations.map(g=>({label:P(g).name.toUpperCase(),disabled:g===r.destinationId,action:()=>i(g)})),{label:"FLY INTO SPACE",disabled:r.destinationId===null,action:s}],p=[...sn(r.systemId).map(g=>{const w=g.from===r.systemId?g.to:g.from,M=Fe(w),k=g.stability.toUpperCase(),v=Math.ceil(mt*g.distance*h.fuelEfficiency);return{label:`${M.name.toUpperCase()}  ${g.distance}LY  [${k}]`.slice(0,36),disabled:v>r.fuelL,action:()=>o(w)}}),{label:"GALAXY MAP...",action:l}],b=[{label:"DESTINATIONS",items:m},{label:"JUMPS",items:p}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],n,t,r,[],b,c),this.onShip=a}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}function Nn(e,n){if(e===n)return[e];const t=[[e]],r=new Set([e]);for(;t.length>0;){const i=t.shift(),o=i[i.length-1];for(const s of sn(o)){const a=s.from===o?s.to:s.from;if(a===n)return[...i,a];r.has(a)||(r.add(a),t.push([...i,a]))}}return null}const ir=0,rr=4,or=8,sr=9,On=10,Fn=15,ar=16,lr=2,cr=10,hr=12,Me=13,Le=12,dr=25,ur=26,pr=10,Dn=18;function mr(e,n){return e.length>=n?e.slice(0,n):e+" ".repeat(n-e.length)}function ye(e,n){return"["+mr(e.toUpperCase(),n-2)+"]"}class fr extends ce{constructor(n,t,r,i,o=()=>{}){super(n,t,r,{title:"GALAXY MAP",tabs:["MAP","ROUTE"],navOptions:[{id:"back",label:"BACK"}],onMenu:o}),this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.lastTop=be+5,this.onBack=i,this.publicSystems=gi().sort((s,a)=>s.distanceFromSol-a.distanceFromSol),this.otherSystems=this.publicSystems.filter(s=>s.id!==r.systemId),this.mapBrowsingSystemId=r.systemId}onTabChange(n){this.searchText=""}handleCharInput(n){if(this.activeTabIdx!==0)return;const t=n.charCodeAt(0);n==="\b"||n===""?this.searchText=this.searchText.slice(0,-1):t>=32&&t<127&&(this.searchText+=n.toUpperCase(),this.mapCursorIdx=0)}handleAction(n){if(n==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}this.activeTabIdx===0?this.handleMapAction(n):this.handleRouteAction(n)}handleNavTap(n){n==="back"&&(this.searchText="",this.activated=!0,this.onBack())}handleTap(n,t){const r=this.lastTop,i=r+On,o=r+Fn;if(this.activeTabIdx===0&&t>=i&&t<o){const s=this.getMapNeighbors(),a=t-i;a>=0&&a<s.length&&(this.mapBrowsingSystemId=s[a].id,this.mapCursorIdx=0,this.searchText="")}else if(this.activeTabIdx===1){const s=r+3,a=r+9;if(t>=s&&t<=a){const l=t-s;l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}}}getMapNeighbors(){const t=sn(this.mapBrowsingSystemId).map(r=>{const i=r.from===this.mapBrowsingSystemId?r.to:r.from,o=this.publicSystems.find(a=>a.id===i),s=r.distance;return o?{sys:o,dist:s}:null}).filter(r=>r!==null).sort((r,i)=>r.dist-i.dist).map(r=>r.sys);return this.searchText.length===0?t:t.filter(r=>r.name.toUpperCase().includes(this.searchText))}handleMapAction(n){const t=this.getMapNeighbors(),r=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(n==="UP")this.mapCursorIdx=Math.max(0,r-1);else if(n==="DOWN")this.mapCursorIdx=Math.min(t.length-1,r+1);else if(n==="SELECT"){const i=t[r];if(!i)return;this.mapBrowsingSystemId=i.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(n){n==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):n==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const n=this.otherSystems[this.routeDestIdx];return n?Nn(this.player.systemId,n.id):null}renderContent(n,t,r){this.lastTop=t;const i=n.length>0?n[0].length:0;this.activeTabIdx===0?this.renderMapTab(n,t,r,i):this.renderRouteTab(n,t,r,i)}renderMapTab(n,t,r,i){const o=this.publicSystems.find(m=>m.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!o)return;const s=t+sr,a=t+On,l=t+Fn,c=t+ar;this.renderChart(n,o,t),Se(n,s,i);const d=this.getMapNeighbors(),h=Math.min(this.mapCursorIdx,Math.max(0,d.length-1));this.renderNeighborList(n,i,o,d,h,a,l),Se(n,l,i),this.renderInfo(n,i,o,d[h]??null,c),this.searchText.length>0&&f(n,c+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(n,t,r){var d;const i=this.getMapNeighbors(),o=r+ir,s=r+rr,a=r+or,l=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(f(n,s,Me,ye(t.name,Le),l,"black"),t.id===this.player.systemId){const h=Me+Le,m=((d=n[0])==null?void 0:d.length)??40;h<m&&(n[s][h]={char:"*",fg:"bright-yellow",bg:"black"})}const c=["left","right","top","bottom"];for(let h=0;h<Math.min(i.length,4);h++){const m=i[h],u=c[h],p=m.id===this.player.systemId?"bright-yellow":"white";if(u==="left")f(n,s,lr,ye(m.name,cr),p,"black"),n[s][hr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="right")f(n,s,ur,ye(m.name,pr),p,"black"),n[s][dr]={char:"-",fg:"bright-black",bg:"black"};else if(u==="top"){f(n,o,Me,ye(m.name,Le),p,"black");for(let b=o+1;b<s;b++)n[b][Dn]={char:"|",fg:"bright-black",bg:"black"}}else{f(n,a,Me,ye(m.name,Le),p,"black");for(let b=s+1;b<a;b++)n[b][Dn]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(n,t,r,i,o,s,a){for(let l=0;l<i.length&&l<a-s;l++){const c=i[l],d=s+l,h=l===o,u=c.id===this.player.systemId?"bright-yellow":h?"bright-cyan":"white",p=h?"> ":"  ",b=Re(r.id,c.id),g=b?`${b.distance}LY  ${b.stability}`:"",w=t-4-g.length;f(n,d,2,p+c.name.toUpperCase().slice(0,w-2),u,"black"),g&&f(n,d,t-2-g.length,g,"bright-black","black")}}renderInfo(n,t,r,i,o){const a=r.id===this.player.systemId?"* Current location":r.name.toUpperCase();if(f(n,o,2,`Zone: ${r.zone}  Sec: ${r.security}  ${a}`.slice(0,t-4),"bright-black","black"),!i)return;const l=Re(r.id,i.id);if(!l)return;const c=Nn(this.player.systemId,i.id),d=c?c.length===1?"(your location)":`${c.length-1} hop${c.length-1!==1?"s":""} from you`:"(unreachable)";f(n,o+1,2,`${i.name.toUpperCase()}  ${l.distance}LY  ${d}`.slice(0,t-4),"bright-black","black")}renderRouteTab(n,t,r,i){var w,M;const o=t,s=t+2,a=t+3,l=7,c=a+l,d=c+1,h=d+6,m=this.publicSystems.find(k=>k.id===this.player.systemId);f(n,o,2,"FROM:","bright-black","black"),f(n,o,8,(m==null?void 0:m.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),f(n,s,2,"TO:","bright-black","black");const u=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-l));for(let k=0;k<l;k++){const v=u+k;if(v>=this.otherSystems.length)break;const y=this.otherSystems[v],C=v===this.routeDestIdx,S=C?"bright-cyan":"white",L=C?"> ":"  ";f(n,a+k,2,L+y.name.toUpperCase(),S,"black")}Se(n,c,i),Se(n,h,i);const p=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!p){f(n,d,2,"No route found","bright-red","black");return}const g=p.length-1;f(n,d,2,`Route: ${g} hop${g!==1?"s":""}`,"bright-white","black");for(let k=0;k<g;k++){const v=Re(p[k],p[k+1]);if(!v)continue;const y=d+1+k;if(y>=h)break;const C=(((w=this.publicSystems.find(L=>L.id===p[k]))==null?void 0:w.name)??p[k]).toUpperCase().slice(0,9),S=(((M=this.publicSystems.find(L=>L.id===p[k+1]))==null?void 0:M.name)??p[k+1]).toUpperCase().slice(0,9);f(n,y,4,`${C} -> ${S}  ${v.distance}LY  ${v.stability}`.slice(0,i-6),"white","black")}}}class V extends ce{constructor(n,t,r,i){const o={onAction:()=>{}};super(o,t,n,{navOptions:[]}),this.elapsed=0,this.arrived=!1,this.duration=r,this.onComplete=i}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const gr=["[. . .]","[: : :]","[* * *]"],Pn=5e3;class yr extends V{constructor(n,t,r){super(n,t,Pn,r)}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/500)%3,a=Math.ceil((Pn-this.elapsed)/1e3),l=Math.max(1,Math.min(5,a)),c=Fe(this.player.systemId),d=c?c.name.toUpperCase():this.player.systemId.toUpperCase();T(n,o-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),T(n,o-1,"DESTINATION:","bright-black","black"),T(n,o,d,"bright-white","black"),T(n,o+2,gr[s],"bright-black","black"),T(n,o+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const Un=2e3,br=["[ —   ]","[  —  ]","[   — ]"];class Bn extends V{constructor(n,t,r,i){super(n,t,Un,r),this.targetLabel=i}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((Un-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a)),c=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const d=this.player.destinationId?P(this.player.destinationId):null;return d?d.name.toUpperCase():"UNKNOWN"})();T(n,o-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),T(n,o-1,"HEADING TO:","bright-black","black"),T(n,o,c,"bright-white","black"),T(n,o+2,br[s],"bright-black","black"),T(n,o+4,`ARRIVING IN ${l}S`,"bright-black","black")}}const Hn=2500,_r=["v","vv","vvv"];class vr extends V{constructor(n,t,r){super(n,t,Hn,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil((Hn-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));T(n,o-3,"[ LANDING SEQUENCE ]","bright-green","black"),T(n,o+2,_r[s],"bright-black","black"),T(n,o+4,`TOUCHDOWN IN ${l}S`,"bright-black","black")}}const $n=2500,wr=[">",">>",">>>"];class kr extends V{constructor(n,t,r){super(n,t,$n,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/400)%3,a=Math.ceil(($n-this.elapsed)/1e3),l=Math.max(1,Math.min(3,a));T(n,o-3,"[ APPROACH LOCKED ]","bright-yellow","black"),T(n,o+2,wr[s],"bright-black","black"),T(n,o+4,`CLAMPING IN ${l}S`,"bright-black","black")}}const Gn=1500,xr=["^","^^","^^^"];class Cr extends V{constructor(n,t,r){super(n,t,Gn,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((Gn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));T(n,o-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),T(n,o+2,xr[s],"bright-black","black"),T(n,o+4,`CLEAR IN ${l}S`,"bright-black","black")}}const Wn=1500,Tr=["<","<<","<<<"];class Ar extends V{constructor(n,t,r){super(n,t,Wn,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((Wn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));T(n,o-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),T(n,o+2,Tr[s],"bright-black","black"),T(n,o+4,`DEPARTING IN ${l}S`,"bright-black","black")}}const jn=1500,Sr=["→","→→","→→→"];class Ir extends V{constructor(n,t,r){super(n,t,jn,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((jn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));T(n,o-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),T(n,o+2,Sr[s],"bright-black","black"),T(n,o+4,`DOCKING IN ${l}S`,"bright-black","black")}}const Kn=1500,Er=["←","←←","←←←"];class Mr extends V{constructor(n,t,r){super(n,t,Kn,r)}renderContent(n,t,r){const i=n.length,o=Math.floor(i/2),s=Math.floor(this.elapsed/300)%3,a=Math.ceil((Kn-this.elapsed)/1e3),l=Math.max(1,Math.min(2,a));T(n,o-3,"[ DEPARTING BERTH ]","bright-cyan","black"),T(n,o+2,Er[s],"bright-black","black"),T(n,o+4,`CLEAR IN ${l}S`,"bright-black","black")}}function Lr(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function Rr(e,n){return Math.floor(e()*n)}function se(e,n){return n[Rr(e,n.length)]}function ft(e,n){const{special:t,firstNames:r,lastNames:i}=n.npcNames;if(e()<.3&&t.length>0)return{giverName:se(e,t)};const o=r.length>0?se(e,r):"Unknown",s=i.length>0?se(e,i):"Agent";return{giverName:`${o} ${s}`}}function Nr(e,n){return n.destinations.filter(t=>t.id!==e.id)}function Or(e){return e.commodities.filter(n=>n.legal)}function Fr(e,n,t,r){const i=t.deliveryItems;if(i.length===0)return null;const o=Nr(n,t);if(o.length===0)return null;const s=se(e,i),a=se(e,o),l=ft(e,t),c=200,d=Math.floor(s.weightKg*1.5),h=c+d+Math.floor(e()*200);return{...l,id:r,type:"delivery",title:s.name,description:`A package needs transporting. Pick up the ${s.name} from ${n.name} and deliver it to ${a.name}. Handle with care.`,reward:h,issuingDestinationId:n.id,itemName:s.name,itemWeightKg:s.weightKg,pickupDestinationId:n.id,deliveryDestinationId:a.id}}function Dr(e,n,t,r){const i=Or(t);if(i.length===0)return null;const o=n.goodsBias.map(p=>p.toLowerCase()),s=[];for(const p of i){const b=o.some(g=>p.category.includes(g)||p.id.includes(g)||g.includes(p.category));s.push(p),b&&s.push(p)}const a=1+Math.floor(e()*2),l=[],c=new Set;for(let p=0;p<a;p++){let b=0;for(;b<10;){const g=se(e,s);if(!c.has(g.id)){c.add(g.id);const w=1+Math.floor(e()*4);l.push({commodityId:g.id,qty:w});break}b++}}if(l.length===0)return null;const d=l.reduce((p,b)=>{const g=t.commodities.find(w=>w.id===b.commodityId);return p+((g==null?void 0:g.basePrice)??100)*b.qty},0),h=Math.floor(d*.4)+Math.floor(e()*150),m=ft(e,t),u=l.map(p=>{const b=t.commodities.find(g=>g.id===p.commodityId);return`${p.qty}× ${(b==null?void 0:b.name)??p.commodityId}`}).join(", ");return{...m,id:r,type:"supply",title:n.name,description:`${n.name} needs supplies. Deliver ${u} to fulfil the contract.`,reward:h,issuingDestinationId:n.id,requirements:l,deliveryDestinationId:n.id}}function Pr(e,n,t){const r=Lr(t),i=3+Math.floor(r()*4),o=[];for(let s=0;s<i;s++){const a=`m-${(t>>>0).toString(16)}-${s}`,c=r()<.6?Fr(r,e,n,a):Dr(r,e,n,a);c&&o.push(c)}return o}const Ur=100,Br=2*60*1e3,Hr=15*60*1e3;class $r{constructor(n,t,r){this.sceneBeforeMenu=null,this.traderStockCache=new Map,this.missionBoardCache=new Map,this.renderer=n,this.input=t,this.context=r;const i=mi(),o=ut(i.startingShip);this.player=new wi({shipId:i.startingShip,driveId:o.defaultJumpDrive,credits:i.player.startingCredits,systemId:i.startingLocation.system,destinationId:i.startingLocation.destination}),this.currentScene=new bn(this.input,this.context,this.player,()=>this.goToStory())}tick(n){const t=Math.min(n,Ur),r=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(r),this.renderer.drawBuffer(r)}makeBuffer(){const n=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:n},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(n){const t=Date.now(),r=this.traderStockCache.get(n);if(r&&t-r.generatedAt<Br)return r.entries;const i=fi(),o=4+Math.floor(Math.random()*3),s=[...i];for(let l=s.length-1;l>0;l--){const c=Math.floor(Math.random()*(l+1));[s[l],s[c]]=[s[c],s[l]]}const a=s.slice(0,o).map(l=>({commodityId:l.id,qty:1+Math.floor(Math.random()*8)}));return this.traderStockCache.set(n,{entries:a,generatedAt:t}),a}getOrCreateMissionBoard(n){const t=Date.now(),r=this.missionBoardCache.get(n);if(r&&t-r.generatedAt<Hr)return r.specs;const i=P(n),o=B(),s=Math.floor(Math.random()*4294967295),a=Pr(i,o,s);return this.missionBoardCache.set(n,{specs:a,generatedAt:t}),a}onBuy(n,t,r){if(t<=0)return;const i=r.findIndex(c=>c.commodityId===n);if(i<0)return;const o=r[i];if(t>o.qty)return;const s=Z(n);if(!s)return;const a=t*s.basePrice;this.player.credits<a||this.player.cargoWeightKg+t*s.weightKg>this.player.cargoCapacity||(this.player.spendCredits(a),this.player.addCargo(n,t),o.qty-=t,o.qty<=0&&r.splice(i,1))}onSell(n,t,r){if(t<=0)return;const i=this.player.cargoHold.find(l=>l.commodityId===n);if(!i||i.qty<t)return;const o=Z(n);if(!o)return;const s=t*o.basePrice;this.player.addCredits(s),this.player.removeCargo(n,t);const a=r.find(l=>l.commodityId===n);a?a.qty+=t:r.push({commodityId:n,qty:t})}goToMainMenu(){this.currentScene=new bn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new Ai(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new Ii(this.input,this.context,this.player,this.player.destinationId,(n,t)=>{this.player.spendCredits(n),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToTakeOffOrUndock(),()=>this.goToGlobalMenu())}goToLandOrDock(){var t;const n=(t=P(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new vr(this.player,this.context,()=>this.goToStation()):n==="asteroid"?this.currentScene=new kr(this.player,this.context,()=>this.goToStation()):this.currentScene=new Ir(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const n=(t=P(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new Cr(this.player,this.context,()=>this.goToShip()):n==="asteroid"?this.currentScene=new Ar(this.player,this.context,()=>this.goToShip()):this.currentScene=new Mr(this.player,this.context,()=>this.goToShip())}goToTrader(){const n=this.player.destinationId,t=this.getOrCreateTraderStock(n);this.currentScene=new Ei(this.input,this.context,this.player,n,t,(r,i)=>this.onBuy(r,i,t),(r,i)=>this.onSell(r,i,t),()=>this.goToStation(),()=>this.goToShip(),()=>this.goToGlobalMenu())}goToMissionBoard(){const n=this.player.destinationId;this.currentScene=new Li(this.input,this.context,this.player,n,()=>this.getOrCreateMissionBoard(n),t=>this.goToMissionDetail(t,n),()=>this.goToStation(),()=>this.goToShip(),()=>this.goToGlobalMenu())}goToMissionDetail(n,t){this.currentScene=new Ni(this.input,this.context,this.player,n,r=>this.onMissionAccepted(n,r,t),()=>this.goToMissionBoard(),()=>this.goToStation(),()=>this.goToShip())}onMissionAccepted(n,t,r){const i=this.missionBoardCache.get(r);if(i){const o=i.specs.findIndex(s=>s.id===n.id);o>=0&&i.specs.splice(o,1)}this.player.acceptMission(n,t),this.goToMissionBoard()}goToShip(){this.currentScene=new nr(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo(),()=>this.goToGlobalMenu())}goToCargo(){this.currentScene=new tr(this.input,this.context,this.player,()=>this.goToShip(),()=>this.goToGlobalMenu())}buildMenuEntries(){return[{label:"MISSIONS",action:()=>this.goToMissionLog()}]}goToMissionLog(){this.currentScene=new Ti(this.input,this.context,this.player,()=>this.goToGlobalMenuFromSubScene(),()=>this.returnFromMenu())}goToGlobalMenuFromSubScene(){this.currentScene=new vn(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}goToGlobalMenu(){this.sceneBeforeMenu=this.currentScene,"suspend"in this.currentScene&&this.currentScene.suspend(),this.currentScene=new vn(this.input,this.context,this.player,this.buildMenuEntries(),()=>this.returnFromMenu())}returnFromMenu(){const n=this.sceneBeforeMenu;this.sceneBeforeMenu=null,n!==null?("resume"in n&&n.resume(),this.currentScene=n):this.goToShip()}goToTravelMenu(){this.currentScene=new Rn(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu())}goToArrival(){this.currentScene=new Rn(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap(),()=>this.goToGlobalMenu())}goToGalaxyMap(){this.currentScene=new fr(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToGlobalMenu())}goToFlyIntoSpace(){this.player.undock(),this.currentScene=new Bn(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(n){this.player.dock(n),this.currentScene=new Bn(this.player,this.context,()=>this.goToShip())}onJumpSelected(n){const t=Re(this.player.systemId,n),r=dt(this.player.driveId),i=Math.ceil(mt*t.distance*r.fuelEfficiency);this.player.consumeFuel(i),this.player.jumpTo(n),this.currentScene=new yr(this.player,this.context,()=>this.goToArrival())}}const Gr=`---
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
`,Wr=`---
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
`,jr=`---
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
`,Kr=`---
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
`,Yr=`---
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
`,qr=`---
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
`,Vr=`---
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
`,zr=`---
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
`,Xr=`---
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
`,Jr=`---
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
`,Qr=`---
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
`,Zr=`---
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
`,eo=`---
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
`,no=`---
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
`,to=`---
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
`,io=`---
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
`,ro=`---
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
`,oo=`---
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
`,so=`---
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
`,ao=`---
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
`,lo=`---
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
`,co=`---
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
`,ho=`---
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
`,uo=`---
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
`,po=`---
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
`,mo=`---
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
`,fo=`---
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
`,go=`---
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
`,yo=`---
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
`,bo=`---
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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,vo=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,wo=`---
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
`,ko=`---
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
`,Ao=`---
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
`,So=`---
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
`,Io=`---
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
`,Eo=`---
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
`,Mo=`---
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
`,Lo=`---
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
`,Ro=`---
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
`,No=`---
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
`,Oo=`---
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
`,Fo=`---
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
`,Do=`---
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
`,Uo=`---
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
`,Bo=`---
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
`,Ho=`---
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
`;var E={},we={},H={};function gt(e){return typeof e>"u"||e===null}function $o(e){return typeof e=="object"&&e!==null}function Go(e){return Array.isArray(e)?e:gt(e)?[]:[e]}function Wo(e,n){var t,r,i,o;if(n)for(o=Object.keys(n),t=0,r=o.length;t<r;t+=1)i=o[t],e[i]=n[i];return e}function jo(e,n){var t="",r;for(r=0;r<n;r+=1)t+=e;return t}function Ko(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}H.isNothing=gt;H.isObject=$o;H.toArray=Go;H.repeat=jo;H.isNegativeZero=Ko;H.extend=Wo;function _e(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}_e.prototype=Object.create(Error.prototype);_e.prototype.constructor=_e;_e.prototype.toString=function(n){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!n&&this.mark&&(t+=" "+this.mark.toString()),t};var ke=_e,Yn=H;function ln(e,n,t,r,i){this.name=e,this.buffer=n,this.position=t,this.line=r,this.column=i}ln.prototype.getSnippet=function(n,t){var r,i,o,s,a;if(!this.buffer)return null;for(n=n||4,t=t||75,r="",i=this.position;i>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(i-1))===-1;)if(i-=1,this.position-i>t/2-1){r=" ... ",i+=5;break}for(o="",s=this.position;s<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s))===-1;)if(s+=1,s-this.position>t/2-1){o=" ... ",s-=5;break}return a=this.buffer.slice(i,s),Yn.repeat(" ",n)+r+a+o+`
`+Yn.repeat(" ",n+this.position-i+r.length)+"^"};ln.prototype.toString=function(n){var t,r="";return this.name&&(r+='in "'+this.name+'" '),r+="at line "+(this.line+1)+", column "+(this.column+1),n||(t=this.getSnippet(),t&&(r+=`:
`+t)),r};var Yo=ln,qn=ke,qo=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],Vo=["scalar","sequence","mapping"];function zo(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(r){n[String(r)]=t})}),n}function Xo(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(qo.indexOf(t)===-1)throw new qn('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=zo(n.styleAliases||null),Vo.indexOf(this.kind)===-1)throw new qn('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var F=Xo,Vn=H,Ne=ke,Jo=F;function tn(e,n,t){var r=[];return e.include.forEach(function(i){t=tn(i,n,t)}),e[n].forEach(function(i){t.forEach(function(o,s){o.tag===i.tag&&o.kind===i.kind&&r.push(s)}),t.push(i)}),t.filter(function(i,o){return r.indexOf(o)===-1})}function Qo(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,t;function r(i){e[i.kind][i.tag]=e.fallback[i.tag]=i}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(r);return e}function ie(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new Ne("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=tn(this,"implicit",[]),this.compiledExplicit=tn(this,"explicit",[]),this.compiledTypeMap=Qo(this.compiledImplicit,this.compiledExplicit)}ie.DEFAULT=null;ie.create=function(){var n,t;switch(arguments.length){case 1:n=ie.DEFAULT,t=arguments[0];break;case 2:n=arguments[0],t=arguments[1];break;default:throw new Ne("Wrong number of arguments for Schema.create function")}if(n=Vn.toArray(n),t=Vn.toArray(t),!n.every(function(r){return r instanceof ie}))throw new Ne("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(r){return r instanceof Jo}))throw new Ne("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new ie({include:n,explicit:t})};var he=ie,Zo=F,es=new Zo("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),ns=F,ts=new ns("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),is=F,rs=new is("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),os=he,cn=new os({explicit:[es,ts,rs]}),ss=F;function as(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function ls(){return null}function cs(e){return e===null}var hs=new ss("tag:yaml.org,2002:null",{kind:"scalar",resolve:as,construct:ls,predicate:cs,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),ds=F;function us(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function ps(e){return e==="true"||e==="True"||e==="TRUE"}function ms(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var fs=new ds("tag:yaml.org,2002:bool",{kind:"scalar",resolve:us,construct:ps,predicate:ms,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),gs=H,ys=F;function bs(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function _s(e){return 48<=e&&e<=55}function vs(e){return 48<=e&&e<=57}function ws(e){if(e===null)return!1;var n=e.length,t=0,r=!1,i;if(!n)return!1;if(i=e[t],(i==="-"||i==="+")&&(i=e[++t]),i==="0"){if(t+1===n)return!0;if(i=e[++t],i==="b"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(i!=="0"&&i!=="1")return!1;r=!0}return r&&i!=="_"}if(i==="x"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(!bs(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}for(;t<n;t++)if(i=e[t],i!=="_"){if(!_s(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}if(i==="_")return!1;for(;t<n;t++)if(i=e[t],i!=="_"){if(i===":")break;if(!vs(e.charCodeAt(t)))return!1;r=!0}return!r||i==="_"?!1:i!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function ks(e){var n=e,t=1,r,i,o=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),r=n[0],(r==="-"||r==="+")&&(r==="-"&&(t=-1),n=n.slice(1),r=n[0]),n==="0"?0:r==="0"?n[1]==="b"?t*parseInt(n.slice(2),2):n[1]==="x"?t*parseInt(n,16):t*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(s){o.unshift(parseInt(s,10))}),n=0,i=1,o.forEach(function(s){n+=s*i,i*=60}),t*n):t*parseInt(n,10)}function xs(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!gs.isNegativeZero(e)}var Cs=new ys("tag:yaml.org,2002:int",{kind:"scalar",resolve:ws,construct:ks,predicate:xs,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),yt=H,Ts=F,As=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Ss(e){return!(e===null||!As.test(e)||e[e.length-1]==="_")}function Is(e){var n,t,r,i;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,i=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(o){i.unshift(parseFloat(o,10))}),n=0,r=1,i.forEach(function(o){n+=o*r,r*=60}),t*n):t*parseFloat(n,10)}var Es=/^[-+]?[0-9]+e/;function Ms(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(yt.isNegativeZero(e))return"-0.0";return t=e.toString(10),Es.test(t)?t.replace("e",".e"):t}function Ls(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||yt.isNegativeZero(e))}var Rs=new Ts("tag:yaml.org,2002:float",{kind:"scalar",resolve:Ss,construct:Is,predicate:Ls,represent:Ms,defaultStyle:"lowercase"}),Ns=he,bt=new Ns({include:[cn],implicit:[hs,fs,Cs,Rs]}),Os=he,_t=new Os({include:[bt]}),Fs=F,vt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),wt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Ds(e){return e===null?!1:vt.exec(e)!==null||wt.exec(e)!==null}function Ps(e){var n,t,r,i,o,s,a,l=0,c=null,d,h,m;if(n=vt.exec(e),n===null&&(n=wt.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],r=+n[2]-1,i=+n[3],!n[4])return new Date(Date.UTC(t,r,i));if(o=+n[4],s=+n[5],a=+n[6],n[7]){for(l=n[7].slice(0,3);l.length<3;)l+="0";l=+l}return n[9]&&(d=+n[10],h=+(n[11]||0),c=(d*60+h)*6e4,n[9]==="-"&&(c=-c)),m=new Date(Date.UTC(t,r,i,o,s,a,l)),c&&m.setTime(m.getTime()-c),m}function Us(e){return e.toISOString()}var Bs=new Fs("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Ds,construct:Ps,instanceOf:Date,represent:Us}),Hs=F;function $s(e){return e==="<<"||e===null}var Gs=new Hs("tag:yaml.org,2002:merge",{kind:"scalar",resolve:$s});function kt(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var J;try{var Ws=kt;J=Ws("buffer").Buffer}catch{}var js=F,hn=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Ks(e){if(e===null)return!1;var n,t,r=0,i=e.length,o=hn;for(t=0;t<i;t++)if(n=o.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;r+=6}return r%8===0}function Ys(e){var n,t,r=e.replace(/[\r\n=]/g,""),i=r.length,o=hn,s=0,a=[];for(n=0;n<i;n++)n%4===0&&n&&(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)),s=s<<6|o.indexOf(r.charAt(n));return t=i%4*6,t===0?(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)):t===18?(a.push(s>>10&255),a.push(s>>2&255)):t===12&&a.push(s>>4&255),J?J.from?J.from(a):new J(a):a}function qs(e){var n="",t=0,r,i,o=e.length,s=hn;for(r=0;r<o;r++)r%3===0&&r&&(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]),t=(t<<8)+e[r];return i=o%3,i===0?(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]):i===2?(n+=s[t>>10&63],n+=s[t>>4&63],n+=s[t<<2&63],n+=s[64]):i===1&&(n+=s[t>>2&63],n+=s[t<<4&63],n+=s[64],n+=s[64]),n}function Vs(e){return J&&J.isBuffer(e)}var zs=new js("tag:yaml.org,2002:binary",{kind:"scalar",resolve:Ks,construct:Ys,predicate:Vs,represent:qs}),Xs=F,Js=Object.prototype.hasOwnProperty,Qs=Object.prototype.toString;function Zs(e){if(e===null)return!0;var n=[],t,r,i,o,s,a=e;for(t=0,r=a.length;t<r;t+=1){if(i=a[t],s=!1,Qs.call(i)!=="[object Object]")return!1;for(o in i)if(Js.call(i,o))if(!s)s=!0;else return!1;if(!s)return!1;if(n.indexOf(o)===-1)n.push(o);else return!1}return!0}function ea(e){return e!==null?e:[]}var na=new Xs("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Zs,construct:ea}),ta=F,ia=Object.prototype.toString;function ra(e){if(e===null)return!0;var n,t,r,i,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1){if(r=s[n],ia.call(r)!=="[object Object]"||(i=Object.keys(r),i.length!==1))return!1;o[n]=[i[0],r[i[0]]]}return!0}function oa(e){if(e===null)return[];var n,t,r,i,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1)r=s[n],i=Object.keys(r),o[n]=[i[0],r[i[0]]];return o}var sa=new ta("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:ra,construct:oa}),aa=F,la=Object.prototype.hasOwnProperty;function ca(e){if(e===null)return!0;var n,t=e;for(n in t)if(la.call(t,n)&&t[n]!==null)return!1;return!0}function ha(e){return e!==null?e:{}}var da=new aa("tag:yaml.org,2002:set",{kind:"mapping",resolve:ca,construct:ha}),ua=he,xe=new ua({include:[_t],implicit:[Bs,Gs],explicit:[zs,na,sa,da]}),pa=F;function ma(){return!0}function fa(){}function ga(){return""}function ya(e){return typeof e>"u"}var ba=new pa("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:ma,construct:fa,predicate:ya,represent:ga}),_a=F;function va(e){if(e===null||e.length===0)return!1;var n=e,t=/\/([gim]*)$/.exec(e),r="";return!(n[0]==="/"&&(t&&(r=t[1]),r.length>3||n[n.length-r.length-1]!=="/"))}function wa(e){var n=e,t=/\/([gim]*)$/.exec(e),r="";return n[0]==="/"&&(t&&(r=t[1]),n=n.slice(1,n.length-r.length-1)),new RegExp(n,r)}function ka(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function xa(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var Ca=new _a("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:va,construct:wa,predicate:xa,represent:ka}),De;try{var Ta=kt;De=Ta("esprima")}catch{typeof window<"u"&&(De=window.esprima)}var Aa=F;function Sa(e){if(e===null)return!1;try{var n="("+e+")",t=De.parse(n,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function Ia(e){var n="("+e+")",t=De.parse(n,{range:!0}),r=[],i;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(o){r.push(o.name)}),i=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(r,n.slice(i[0]+1,i[1]-1)):new Function(r,"return "+n.slice(i[0],i[1]))}function Ea(e){return e.toString()}function Ma(e){return Object.prototype.toString.call(e)==="[object Function]"}var La=new Aa("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:Sa,construct:Ia,predicate:Ma,represent:Ea}),zn=he,$e=zn.DEFAULT=new zn({include:[xe],explicit:[ba,Ca,La]}),j=H,xt=ke,Ra=Yo,Ct=xe,Na=$e,q=Object.prototype.hasOwnProperty,Pe=1,Tt=2,At=3,Ue=4,Qe=1,Oa=2,Xn=3,Fa=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Da=/[\x85\u2028\u2029]/,Pa=/[,\[\]\{\}]/,St=/^(?:!|!!|![a-z\-]+!)$/i,It=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function Jn(e){return Object.prototype.toString.call(e)}function W(e){return e===10||e===13}function Q(e){return e===9||e===32}function U(e){return e===9||e===32||e===10||e===13}function re(e){return e===44||e===91||e===93||e===123||e===125}function Ua(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function Ba(e){return e===120?2:e===117?4:e===85?8:0}function Ha(e){return 48<=e&&e<=57?e-48:-1}function Qn(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function $a(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function Et(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var Mt=new Array(256),Lt=new Array(256);for(var te=0;te<256;te++)Mt[te]=Qn(te)?1:0,Lt[te]=Qn(te);function Ga(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||Na,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function Rt(e,n){return new xt(n,new Ra(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function _(e,n){throw Rt(e,n)}function Be(e,n){e.onWarning&&e.onWarning.call(null,Rt(e,n))}var Zn={YAML:function(n,t,r){var i,o,s;n.version!==null&&_(n,"duplication of %YAML directive"),r.length!==1&&_(n,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(r[0]),i===null&&_(n,"ill-formed argument of the YAML directive"),o=parseInt(i[1],10),s=parseInt(i[2],10),o!==1&&_(n,"unacceptable YAML version of the document"),n.version=r[0],n.checkLineBreaks=s<2,s!==1&&s!==2&&Be(n,"unsupported YAML version of the document")},TAG:function(n,t,r){var i,o;r.length!==2&&_(n,"TAG directive accepts exactly two arguments"),i=r[0],o=r[1],St.test(i)||_(n,"ill-formed tag handle (first argument) of the TAG directive"),q.call(n.tagMap,i)&&_(n,'there is a previously declared suffix for "'+i+'" tag handle'),It.test(o)||_(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[i]=o}};function Y(e,n,t,r){var i,o,s,a;if(n<t){if(a=e.input.slice(n,t),r)for(i=0,o=a.length;i<o;i+=1)s=a.charCodeAt(i),s===9||32<=s&&s<=1114111||_(e,"expected valid JSON character");else Fa.test(a)&&_(e,"the stream contains non-printable characters");e.result+=a}}function et(e,n,t,r){var i,o,s,a;for(j.isObject(t)||_(e,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(t),s=0,a=i.length;s<a;s+=1)o=i[s],q.call(n,o)||(Et(n,o,t[o]),r[o]=!0)}function oe(e,n,t,r,i,o,s,a){var l,c;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),l=0,c=i.length;l<c;l+=1)Array.isArray(i[l])&&_(e,"nested arrays are not supported inside keys"),typeof i=="object"&&Jn(i[l])==="[object Object]"&&(i[l]="[object Object]");if(typeof i=="object"&&Jn(i)==="[object Object]"&&(i="[object Object]"),i=String(i),n===null&&(n={}),r==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)et(e,n,o[l],t);else et(e,n,o,t);else!e.json&&!q.call(t,i)&&q.call(n,i)&&(e.line=s||e.line,e.position=a||e.position,_(e,"duplicated mapping key")),Et(n,i,o),delete t[i];return n}function dn(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):_(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function N(e,n,t){for(var r=0,i=e.input.charCodeAt(e.position);i!==0;){for(;Q(i);)i=e.input.charCodeAt(++e.position);if(n&&i===35)do i=e.input.charCodeAt(++e.position);while(i!==10&&i!==13&&i!==0);if(W(i))for(dn(e),i=e.input.charCodeAt(e.position),r++,e.lineIndent=0;i===32;)e.lineIndent++,i=e.input.charCodeAt(++e.position);else break}return t!==-1&&r!==0&&e.lineIndent<t&&Be(e,"deficient indentation"),r}function Ge(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||U(t)))}function un(e,n){n===1?e.result+=" ":n>1&&(e.result+=j.repeat(`
`,n-1))}function Wa(e,n,t){var r,i,o,s,a,l,c,d,h=e.kind,m=e.result,u;if(u=e.input.charCodeAt(e.position),U(u)||re(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(i=e.input.charCodeAt(e.position+1),U(i)||t&&re(i)))return!1;for(e.kind="scalar",e.result="",o=s=e.position,a=!1;u!==0;){if(u===58){if(i=e.input.charCodeAt(e.position+1),U(i)||t&&re(i))break}else if(u===35){if(r=e.input.charCodeAt(e.position-1),U(r))break}else{if(e.position===e.lineStart&&Ge(e)||t&&re(u))break;if(W(u))if(l=e.line,c=e.lineStart,d=e.lineIndent,N(e,!1,-1),e.lineIndent>=n){a=!0,u=e.input.charCodeAt(e.position);continue}else{e.position=s,e.line=l,e.lineStart=c,e.lineIndent=d;break}}a&&(Y(e,o,s,!1),un(e,e.line-l),o=s=e.position,a=!1),Q(u)||(s=e.position+1),u=e.input.charCodeAt(++e.position)}return Y(e,o,s,!1),e.result?!0:(e.kind=h,e.result=m,!1)}function ja(e,n){var t,r,i;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,r=i=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(Y(e,r,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)r=e.position,e.position++,i=e.position;else return!0;else W(t)?(Y(e,r,i,!0),un(e,N(e,!1,n)),r=i=e.position):e.position===e.lineStart&&Ge(e)?_(e,"unexpected end of the document within a single quoted scalar"):(e.position++,i=e.position);_(e,"unexpected end of the stream within a single quoted scalar")}function Ka(e,n){var t,r,i,o,s,a;if(a=e.input.charCodeAt(e.position),a!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=r=e.position;(a=e.input.charCodeAt(e.position))!==0;){if(a===34)return Y(e,t,e.position,!0),e.position++,!0;if(a===92){if(Y(e,t,e.position,!0),a=e.input.charCodeAt(++e.position),W(a))N(e,!1,n);else if(a<256&&Mt[a])e.result+=Lt[a],e.position++;else if((s=Ba(a))>0){for(i=s,o=0;i>0;i--)a=e.input.charCodeAt(++e.position),(s=Ua(a))>=0?o=(o<<4)+s:_(e,"expected hexadecimal character");e.result+=$a(o),e.position++}else _(e,"unknown escape sequence");t=r=e.position}else W(a)?(Y(e,t,r,!0),un(e,N(e,!1,n)),t=r=e.position):e.position===e.lineStart&&Ge(e)?_(e,"unexpected end of the document within a double quoted scalar"):(e.position++,r=e.position)}_(e,"unexpected end of the stream within a double quoted scalar")}function Ya(e,n){var t=!0,r,i=e.tag,o,s=e.anchor,a,l,c,d,h,m={},u,p,b,g;if(g=e.input.charCodeAt(e.position),g===91)l=93,h=!1,o=[];else if(g===123)l=125,h=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),g=e.input.charCodeAt(++e.position);g!==0;){if(N(e,!0,n),g=e.input.charCodeAt(e.position),g===l)return e.position++,e.tag=i,e.anchor=s,e.kind=h?"mapping":"sequence",e.result=o,!0;t||_(e,"missed comma between flow collection entries"),p=u=b=null,c=d=!1,g===63&&(a=e.input.charCodeAt(e.position+1),U(a)&&(c=d=!0,e.position++,N(e,!0,n))),r=e.line,ae(e,n,Pe,!1,!0),p=e.tag,u=e.result,N(e,!0,n),g=e.input.charCodeAt(e.position),(d||e.line===r)&&g===58&&(c=!0,g=e.input.charCodeAt(++e.position),N(e,!0,n),ae(e,n,Pe,!1,!0),b=e.result),h?oe(e,o,m,p,u,b):c?o.push(oe(e,null,m,p,u,b)):o.push(u),N(e,!0,n),g=e.input.charCodeAt(e.position),g===44?(t=!0,g=e.input.charCodeAt(++e.position)):t=!1}_(e,"unexpected end of the stream within a flow collection")}function qa(e,n){var t,r,i=Qe,o=!1,s=!1,a=n,l=0,c=!1,d,h;if(h=e.input.charCodeAt(e.position),h===124)r=!1;else if(h===62)r=!0;else return!1;for(e.kind="scalar",e.result="";h!==0;)if(h=e.input.charCodeAt(++e.position),h===43||h===45)Qe===i?i=h===43?Xn:Oa:_(e,"repeat of a chomping mode identifier");else if((d=Ha(h))>=0)d===0?_(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?_(e,"repeat of an indentation width identifier"):(a=n+d-1,s=!0);else break;if(Q(h)){do h=e.input.charCodeAt(++e.position);while(Q(h));if(h===35)do h=e.input.charCodeAt(++e.position);while(!W(h)&&h!==0)}for(;h!==0;){for(dn(e),e.lineIndent=0,h=e.input.charCodeAt(e.position);(!s||e.lineIndent<a)&&h===32;)e.lineIndent++,h=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>a&&(a=e.lineIndent),W(h)){l++;continue}if(e.lineIndent<a){i===Xn?e.result+=j.repeat(`
`,o?1+l:l):i===Qe&&o&&(e.result+=`
`);break}for(r?Q(h)?(c=!0,e.result+=j.repeat(`
`,o?1+l:l)):c?(c=!1,e.result+=j.repeat(`
`,l+1)):l===0?o&&(e.result+=" "):e.result+=j.repeat(`
`,l):e.result+=j.repeat(`
`,o?1+l:l),o=!0,s=!0,l=0,t=e.position;!W(h)&&h!==0;)h=e.input.charCodeAt(++e.position);Y(e,t,e.position,!1)}return!0}function nt(e,n){var t,r=e.tag,i=e.anchor,o=[],s,a=!1,l;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),l=e.input.charCodeAt(e.position);l!==0&&!(l!==45||(s=e.input.charCodeAt(e.position+1),!U(s)));){if(a=!0,e.position++,N(e,!0,-1)&&e.lineIndent<=n){o.push(null),l=e.input.charCodeAt(e.position);continue}if(t=e.line,ae(e,n,At,!1,!0),o.push(e.result),N(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&l!==0)_(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return a?(e.tag=r,e.anchor=i,e.kind="sequence",e.result=o,!0):!1}function Va(e,n,t){var r,i,o,s,a=e.tag,l=e.anchor,c={},d={},h=null,m=null,u=null,p=!1,b=!1,g;for(e.anchor!==null&&(e.anchorMap[e.anchor]=c),g=e.input.charCodeAt(e.position);g!==0;){if(r=e.input.charCodeAt(e.position+1),o=e.line,s=e.position,(g===63||g===58)&&U(r))g===63?(p&&(oe(e,c,d,h,m,null),h=m=u=null),b=!0,p=!0,i=!0):p?(p=!1,i=!0):_(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,g=r;else if(ae(e,t,Tt,!1,!0))if(e.line===o){for(g=e.input.charCodeAt(e.position);Q(g);)g=e.input.charCodeAt(++e.position);if(g===58)g=e.input.charCodeAt(++e.position),U(g)||_(e,"a whitespace character is expected after the key-value separator within a block mapping"),p&&(oe(e,c,d,h,m,null),h=m=u=null),b=!0,p=!1,i=!1,h=e.tag,m=e.result;else if(b)_(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=a,e.anchor=l,!0}else if(b)_(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=a,e.anchor=l,!0;else break;if((e.line===o||e.lineIndent>n)&&(ae(e,n,Ue,!0,i)&&(p?m=e.result:u=e.result),p||(oe(e,c,d,h,m,u,o,s),h=m=u=null),N(e,!0,-1),g=e.input.charCodeAt(e.position)),e.lineIndent>n&&g!==0)_(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return p&&oe(e,c,d,h,m,null),b&&(e.tag=a,e.anchor=l,e.kind="mapping",e.result=c),b}function za(e){var n,t=!1,r=!1,i,o,s;if(s=e.input.charCodeAt(e.position),s!==33)return!1;if(e.tag!==null&&_(e,"duplication of a tag property"),s=e.input.charCodeAt(++e.position),s===60?(t=!0,s=e.input.charCodeAt(++e.position)):s===33?(r=!0,i="!!",s=e.input.charCodeAt(++e.position)):i="!",n=e.position,t){do s=e.input.charCodeAt(++e.position);while(s!==0&&s!==62);e.position<e.length?(o=e.input.slice(n,e.position),s=e.input.charCodeAt(++e.position)):_(e,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!U(s);)s===33&&(r?_(e,"tag suffix cannot contain exclamation marks"):(i=e.input.slice(n-1,e.position+1),St.test(i)||_(e,"named tag handle cannot contain such characters"),r=!0,n=e.position+1)),s=e.input.charCodeAt(++e.position);o=e.input.slice(n,e.position),Pa.test(o)&&_(e,"tag suffix cannot contain flow indicator characters")}return o&&!It.test(o)&&_(e,"tag name cannot contain such characters: "+o),t?e.tag=o:q.call(e.tagMap,i)?e.tag=e.tagMap[i]+o:i==="!"?e.tag="!"+o:i==="!!"?e.tag="tag:yaml.org,2002:"+o:_(e,'undeclared tag handle "'+i+'"'),!0}function Xa(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&_(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!U(t)&&!re(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&_(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function Ja(e){var n,t,r;if(r=e.input.charCodeAt(e.position),r!==42)return!1;for(r=e.input.charCodeAt(++e.position),n=e.position;r!==0&&!U(r)&&!re(r);)r=e.input.charCodeAt(++e.position);return e.position===n&&_(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),q.call(e.anchorMap,t)||_(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],N(e,!0,-1),!0}function ae(e,n,t,r,i){var o,s,a,l=1,c=!1,d=!1,h,m,u,p,b;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=s=a=Ue===t||At===t,r&&N(e,!0,-1)&&(c=!0,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)),l===1)for(;za(e)||Xa(e);)N(e,!0,-1)?(c=!0,a=o,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)):a=!1;if(a&&(a=c||i),(l===1||Ue===t)&&(Pe===t||Tt===t?p=n:p=n+1,b=e.position-e.lineStart,l===1?a&&(nt(e,b)||Va(e,b,p))||Ya(e,p)?d=!0:(s&&qa(e,p)||ja(e,p)||Ka(e,p)?d=!0:Ja(e)?(d=!0,(e.tag!==null||e.anchor!==null)&&_(e,"alias node should not have any properties")):Wa(e,p,Pe===t)&&(d=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(d=a&&nt(e,b))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&_(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),h=0,m=e.implicitTypes.length;h<m;h+=1)if(u=e.implicitTypes[h],u.resolve(e.result)){e.result=u.construct(e.result),e.tag=u.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else q.call(e.typeMap[e.kind||"fallback"],e.tag)?(u=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&u.kind!==e.kind&&_(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+u.kind+'", not "'+e.kind+'"'),u.resolve(e.result)?(e.result=u.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):_(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):_(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||d}function Qa(e){var n=e.position,t,r,i,o=!1,s;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(s=e.input.charCodeAt(e.position))!==0&&(N(e,!0,-1),s=e.input.charCodeAt(e.position),!(e.lineIndent>0||s!==37));){for(o=!0,s=e.input.charCodeAt(++e.position),t=e.position;s!==0&&!U(s);)s=e.input.charCodeAt(++e.position);for(r=e.input.slice(t,e.position),i=[],r.length<1&&_(e,"directive name must not be less than one character in length");s!==0;){for(;Q(s);)s=e.input.charCodeAt(++e.position);if(s===35){do s=e.input.charCodeAt(++e.position);while(s!==0&&!W(s));break}if(W(s))break;for(t=e.position;s!==0&&!U(s);)s=e.input.charCodeAt(++e.position);i.push(e.input.slice(t,e.position))}s!==0&&dn(e),q.call(Zn,r)?Zn[r](e,r,i):Be(e,'unknown document directive "'+r+'"')}if(N(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,N(e,!0,-1)):o&&_(e,"directives end mark is expected"),ae(e,e.lineIndent-1,Ue,!1,!0),N(e,!0,-1),e.checkLineBreaks&&Da.test(e.input.slice(n,e.position))&&Be(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&Ge(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,N(e,!0,-1));return}if(e.position<e.length-1)_(e,"end of the stream or a document separator is expected");else return}function Nt(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new Ga(e,n),r=e.indexOf("\0");for(r!==-1&&(t.position=r,_(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)Qa(t);return t.documents}function Ot(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var r=Nt(e,t);if(typeof n!="function")return r;for(var i=0,o=r.length;i<o;i+=1)n(r[i])}function Ft(e,n){var t=Nt(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new xt("expected a single document in the stream, but found more")}}function Za(e,n,t){return typeof n=="object"&&n!==null&&typeof t>"u"&&(t=n,n=null),Ot(e,n,j.extend({schema:Ct},t))}function el(e,n){return Ft(e,j.extend({schema:Ct},n))}we.loadAll=Ot;we.load=Ft;we.safeLoadAll=Za;we.safeLoad=el;var pn={},Ce=H,Te=ke,nl=$e,tl=xe,Dt=Object.prototype.toString,Pt=Object.prototype.hasOwnProperty,il=9,ve=10,rl=13,ol=32,sl=33,al=34,Ut=35,ll=37,cl=38,hl=39,dl=42,Bt=44,ul=45,Ht=58,pl=61,ml=62,fl=63,gl=64,$t=91,Gt=93,yl=96,Wt=123,bl=124,jt=125,D={};D[0]="\\0";D[7]="\\a";D[8]="\\b";D[9]="\\t";D[10]="\\n";D[11]="\\v";D[12]="\\f";D[13]="\\r";D[27]="\\e";D[34]='\\"';D[92]="\\\\";D[133]="\\N";D[160]="\\_";D[8232]="\\L";D[8233]="\\P";var _l=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function vl(e,n){var t,r,i,o,s,a,l;if(n===null)return{};for(t={},r=Object.keys(n),i=0,o=r.length;i<o;i+=1)s=r[i],a=String(n[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),l=e.compiledTypeMap.fallback[s],l&&Pt.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[s]=a;return t}function tt(e){var n,t,r;if(n=e.toString(16).toUpperCase(),e<=255)t="x",r=2;else if(e<=65535)t="u",r=4;else if(e<=4294967295)t="U",r=8;else throw new Te("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+Ce.repeat("0",r-n.length)+n}function wl(e){this.schema=e.schema||nl,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=Ce.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=vl(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function it(e,n){for(var t=Ce.repeat(" ",n),r=0,i=-1,o="",s,a=e.length;r<a;)i=e.indexOf(`
`,r),i===-1?(s=e.slice(r),r=a):(s=e.slice(r,i+1),r=i+1),s.length&&s!==`
`&&(o+=t),o+=s;return o}function rn(e,n){return`
`+Ce.repeat(" ",e.indent*n)}function kl(e,n){var t,r,i;for(t=0,r=e.implicitTypes.length;t<r;t+=1)if(i=e.implicitTypes[t],i.resolve(n))return!0;return!1}function mn(e){return e===ol||e===il}function le(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function xl(e){return le(e)&&!mn(e)&&e!==65279&&e!==rl&&e!==ve}function rt(e,n){return le(e)&&e!==65279&&e!==Bt&&e!==$t&&e!==Gt&&e!==Wt&&e!==jt&&e!==Ht&&(e!==Ut||n&&xl(n))}function Cl(e){return le(e)&&e!==65279&&!mn(e)&&e!==ul&&e!==fl&&e!==Ht&&e!==Bt&&e!==$t&&e!==Gt&&e!==Wt&&e!==jt&&e!==Ut&&e!==cl&&e!==dl&&e!==sl&&e!==bl&&e!==pl&&e!==ml&&e!==hl&&e!==al&&e!==ll&&e!==gl&&e!==yl}function Kt(e){var n=/^\n* /;return n.test(e)}var Yt=1,qt=2,Vt=3,zt=4,Oe=5;function Tl(e,n,t,r,i){var o,s,a,l=!1,c=!1,d=r!==-1,h=-1,m=Cl(e.charCodeAt(0))&&!mn(e.charCodeAt(e.length-1));if(n)for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),!le(s))return Oe;a=o>0?e.charCodeAt(o-1):null,m=m&&rt(s,a)}else{for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),s===ve)l=!0,d&&(c=c||o-h-1>r&&e[h+1]!==" ",h=o);else if(!le(s))return Oe;a=o>0?e.charCodeAt(o-1):null,m=m&&rt(s,a)}c=c||d&&o-h-1>r&&e[h+1]!==" "}return!l&&!c?m&&!i(e)?Yt:qt:t>9&&Kt(e)?Oe:c?zt:Vt}function Al(e,n,t,r){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&_l.indexOf(n)!==-1)return"'"+n+"'";var i=e.indent*Math.max(1,t),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-i),s=r||e.flowLevel>-1&&t>=e.flowLevel;function a(l){return kl(e,l)}switch(Tl(n,s,e.indent,o,a)){case Yt:return n;case qt:return"'"+n.replace(/'/g,"''")+"'";case Vt:return"|"+ot(n,e.indent)+st(it(n,i));case zt:return">"+ot(n,e.indent)+st(it(Sl(n,o),i));case Oe:return'"'+Il(n)+'"';default:throw new Te("impossible error: invalid scalar style")}}()}function ot(e,n){var t=Kt(e)?String(n):"",r=e[e.length-1]===`
`,i=r&&(e[e.length-2]===`
`||e===`
`),o=i?"+":r?"":"-";return t+o+`
`}function st(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function Sl(e,n){for(var t=/(\n+)([^\n]*)/g,r=function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,t.lastIndex=c,at(e.slice(0,c),n)}(),i=e[0]===`
`||e[0]===" ",o,s;s=t.exec(e);){var a=s[1],l=s[2];o=l[0]===" ",r+=a+(!i&&!o&&l!==""?`
`:"")+at(l,n),i=o}return r}function at(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,r,i=0,o,s=0,a=0,l="";r=t.exec(e);)a=r.index,a-i>n&&(o=s>i?s:a,l+=`
`+e.slice(i,o),i=o+1),s=a;return l+=`
`,e.length-i>n&&s>i?l+=e.slice(i,s)+`
`+e.slice(s+1):l+=e.slice(i),l.slice(1)}function Il(e){for(var n="",t,r,i,o=0;o<e.length;o++){if(t=e.charCodeAt(o),t>=55296&&t<=56319&&(r=e.charCodeAt(o+1),r>=56320&&r<=57343)){n+=tt((t-55296)*1024+r-56320+65536),o++;continue}i=D[t],n+=!i&&le(t)?e[o]:i||tt(t)}return n}function El(e,n,t){var r="",i=e.tag,o,s;for(o=0,s=t.length;o<s;o+=1)ee(e,n,t[o],!1,!1)&&(o!==0&&(r+=","+(e.condenseFlow?"":" ")),r+=e.dump);e.tag=i,e.dump="["+r+"]"}function Ml(e,n,t,r){var i="",o=e.tag,s,a;for(s=0,a=t.length;s<a;s+=1)ee(e,n+1,t[s],!0,!0)&&((!r||s!==0)&&(i+=rn(e,n)),e.dump&&ve===e.dump.charCodeAt(0)?i+="-":i+="- ",i+=e.dump);e.tag=o,e.dump=i||"[]"}function Ll(e,n,t){var r="",i=e.tag,o=Object.keys(t),s,a,l,c,d;for(s=0,a=o.length;s<a;s+=1)d="",s!==0&&(d+=", "),e.condenseFlow&&(d+='"'),l=o[s],c=t[l],ee(e,n,l,!1,!1)&&(e.dump.length>1024&&(d+="? "),d+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),ee(e,n,c,!1,!1)&&(d+=e.dump,r+=d));e.tag=i,e.dump="{"+r+"}"}function Rl(e,n,t,r){var i="",o=e.tag,s=Object.keys(t),a,l,c,d,h,m;if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys=="function")s.sort(e.sortKeys);else if(e.sortKeys)throw new Te("sortKeys must be a boolean or a function");for(a=0,l=s.length;a<l;a+=1)m="",(!r||a!==0)&&(m+=rn(e,n)),c=s[a],d=t[c],ee(e,n+1,c,!0,!0,!0)&&(h=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,h&&(e.dump&&ve===e.dump.charCodeAt(0)?m+="?":m+="? "),m+=e.dump,h&&(m+=rn(e,n)),ee(e,n+1,d,!0,h)&&(e.dump&&ve===e.dump.charCodeAt(0)?m+=":":m+=": ",m+=e.dump,i+=m));e.tag=o,e.dump=i||"{}"}function lt(e,n,t){var r,i,o,s,a,l;for(i=t?e.explicitTypes:e.implicitTypes,o=0,s=i.length;o<s;o+=1)if(a=i[o],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof n=="object"&&n instanceof a.instanceOf)&&(!a.predicate||a.predicate(n))){if(e.tag=t?a.tag:"?",a.represent){if(l=e.styleMap[a.tag]||a.defaultStyle,Dt.call(a.represent)==="[object Function]")r=a.represent(n,l);else if(Pt.call(a.represent,l))r=a.represent[l](n,l);else throw new Te("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');e.dump=r}return!0}return!1}function ee(e,n,t,r,i,o){e.tag=null,e.dump=t,lt(e,t,!1)||lt(e,t,!0);var s=Dt.call(e.dump);r&&(r=e.flowLevel<0||e.flowLevel>n);var a=s==="[object Object]"||s==="[object Array]",l,c;if(a&&(l=e.duplicates.indexOf(t),c=l!==-1),(e.tag!==null&&e.tag!=="?"||c||e.indent!==2&&n>0)&&(i=!1),c&&e.usedDuplicates[l])e.dump="*ref_"+l;else{if(a&&c&&!e.usedDuplicates[l]&&(e.usedDuplicates[l]=!0),s==="[object Object]")r&&Object.keys(e.dump).length!==0?(Rl(e,n,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(Ll(e,n,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump));else if(s==="[object Array]"){var d=e.noArrayIndent&&n>0?n-1:n;r&&e.dump.length!==0?(Ml(e,d,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(El(e,d,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump))}else if(s==="[object String]")e.tag!=="?"&&Al(e,e.dump,n,o);else{if(e.skipInvalid)return!1;throw new Te("unacceptable kind of an object to dump "+s)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function Nl(e,n){var t=[],r=[],i,o;for(on(e,t,r),i=0,o=r.length;i<o;i+=1)n.duplicates.push(t[r[i]]);n.usedDuplicates=new Array(o)}function on(e,n,t){var r,i,o;if(e!==null&&typeof e=="object")if(i=n.indexOf(e),i!==-1)t.indexOf(i)===-1&&t.push(i);else if(n.push(e),Array.isArray(e))for(i=0,o=e.length;i<o;i+=1)on(e[i],n,t);else for(r=Object.keys(e),i=0,o=r.length;i<o;i+=1)on(e[r[i]],n,t)}function Xt(e,n){n=n||{};var t=new wl(n);return t.noRefs||Nl(e,t),ee(t,0,e,!0,!0)?t.dump+`
`:""}function Ol(e,n){return Xt(e,Ce.extend({schema:tl},n))}pn.dump=Xt;pn.safeDump=Ol;var We=we,Jt=pn;function je(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}E.Type=F;E.Schema=he;E.FAILSAFE_SCHEMA=cn;E.JSON_SCHEMA=bt;E.CORE_SCHEMA=_t;E.DEFAULT_SAFE_SCHEMA=xe;E.DEFAULT_FULL_SCHEMA=$e;E.load=We.load;E.loadAll=We.loadAll;E.safeLoad=We.safeLoad;E.safeLoadAll=We.safeLoadAll;E.dump=Jt.dump;E.safeDump=Jt.safeDump;E.YAMLException=ke;E.MINIMAL_SCHEMA=cn;E.SAFE_SCHEMA=xe;E.DEFAULT_SCHEMA=$e;E.scan=je("scan");E.parse=je("parse");E.compose=je("compose");E.addConstructor=je("addConstructor");var Fl=E,Dl=Fl;function Pl(e){if(!e.startsWith(`---
`))return{data:{},content:e};const n=e.indexOf(`
---`,4);if(n===-1)return{data:{},content:e};const t=e.slice(4,n),r=e.slice(n+4),i=r.startsWith(`
`)?r.slice(1):r;return{data:Dl.safeLoad(t)??{},content:i}}function Ul(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[t,r]of Object.entries(e)){const i=t.split("/").pop()??"";if(i==="_template.md"||i===".gitkeep")continue;const{data:o,content:s}=Pl(r);/^systems\/[^/]+\.md$/.test(t)?n.systems.push(Bl(o,s)):/^destinations\/[^/]+\.md$/.test(t)?n.destinations.push(Hl(o,s)):/^factions\/[^/]+\.md$/.test(t)?n.factions.push($l(o,s)):/^ships\/[^/]+\.md$/.test(t)?n.ships.push(Gl(o,s)):t==="ships/components/jump-drives.md"?n.drives=Wl(o):t==="navigation/jump-routes.md"?n.routes=jl(o):t==="commodities.md"?n.commodities=Kl(o):/^story\/[^/]+\.md$/.test(t)?n.storyBeats.push(Yl(o,s)):t==="game-settings.md"?n.settings=ql(o):t==="delivery-items.md"?n.deliveryItems=Vl(o):t==="npc-names.md"&&(n.npcNames=zl(o))}return n}function Ke(e){const n=[];let t=!1;for(const r of e.split(`
`)){const i=r.trim();if(!i.startsWith("#"))if(i===""){if(t)break}else t=!0,n.push(i)}return n.join(" ")}function Bl(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economy:e.economy??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:Ke(n)}}function Hl(e,n){const t=e.amenities??{},r={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:r,npcs:e.npcs??{},goodsBias:e.goods_bias??[],dangerLevel:e.danger_level,tags:e.tags??[],description:Ke(n)}}function $l(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:Ke(n)}}function Gl(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,tags:e.tags??[],description:Ke(n)}}function Wl(e){return(e.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function jl(e){return(e.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function Kl(e){return(e.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function Yl(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function ql(e){var n,t,r,i;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((t=e.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((r=e.starting_location)==null?void 0:r.system)??"",destination:((i=e.starting_location)==null?void 0:i.destination)??""},startingShip:e.starting_ship??""}}function Vl(e){return(e.delivery_items??[]).map(t=>({id:t.id,name:t.name,weightKg:t.weight_kg}))}function zl(e){const n=e.npc_names??{};return{special:n.special??[],firstNames:n.first_names??[],lastNames:n.last_names??[]}}function Xl(){const e=Object.assign({"/docs/world/commodities.md":Gr,"/docs/world/delivery-items.md":Wr,"/docs/world/destinations/_template.md":jr,"/docs/world/destinations/blackwake-yard.md":Kr,"/docs/world/destinations/ceti-landfall.md":Yr,"/docs/world/destinations/drift-market.md":qr,"/docs/world/destinations/elysium-station.md":Vr,"/docs/world/destinations/eridani-anchorage.md":zr,"/docs/world/destinations/foundries-platform.md":Xr,"/docs/world/destinations/galileo-transfer.md":Jr,"/docs/world/destinations/hestia-ring.md":Qr,"/docs/world/destinations/keelhaul-station.md":Zr,"/docs/world/destinations/kepler-yard.md":eo,"/docs/world/destinations/mars-anchor.md":no,"/docs/world/destinations/meridian-station.md":to,"/docs/world/destinations/new-horizon-port.md":io,"/docs/world/destinations/orrery-anchorage.md":ro,"/docs/world/destinations/redline-station.md":oo,"/docs/world/destinations/tycho-orbital.md":so,"/docs/world/destinations/veil-station.md":ao,"/docs/world/destinations/waypoint-ceti.md":lo,"/docs/world/factions/_template.md":co,"/docs/world/factions/centauri-trade-league.md":ho,"/docs/world/factions/eridani-colonial-council.md":uo,"/docs/world/factions/free-captains.md":po,"/docs/world/factions/grey-market-cartel.md":mo,"/docs/world/factions/helios-directorate.md":fo,"/docs/world/factions/independent-miners-guild.md":go,"/docs/world/factions/procyon-institute.md":yo,"/docs/world/factions/terran-union.md":bo,"/docs/world/galaxy-map.md":_o,"/docs/world/game-settings.md":vo,"/docs/world/navigation/jump-routes.md":wo,"/docs/world/npc-names.md":ko,"/docs/world/ships/_template.md":xo,"/docs/world/ships/components/jump-drives.md":Co,"/docs/world/ships/freighter.md":To,"/docs/world/ships/hauler.md":Ao,"/docs/world/ships/scout.md":So,"/docs/world/story/_template.md":Io,"/docs/world/story/enter-wolf-359.md":Eo,"/docs/world/story/first-jump.md":Mo,"/docs/world/story/opening-arrival.md":Lo,"/docs/world/systems/_template.md":Ro,"/docs/world/systems/alpha-centauri.md":No,"/docs/world/systems/barnards-star.md":Oo,"/docs/world/systems/epsilon-eridani.md":Fo,"/docs/world/systems/procyon.md":Do,"/docs/world/systems/sirius.md":Po,"/docs/world/systems/sol.md":Uo,"/docs/world/systems/tau-ceti.md":Bo,"/docs/world/systems/wolf-359.md":Ho}),n={};for(const[t,r]of Object.entries(e)){const i=t.replace("/docs/world/","");n[i]=r}return Ul(n)}ui(Xl());const Jl=navigator.maxTouchPoints>0?"touch":"keyboard",Ql=new URLSearchParams(window.location.search).has("debug"),Qt={environment:"browser",primaryInput:Jl,debug:Ql},Zl=new ii,Zt=new ai(Qt);Zt.connect();const ec=new $r(Zl,Zt,Qt);let ct=0;function ei(e){ec.tick(e-ct),ct=e,requestAnimationFrame(ei)}requestAnimationFrame(ei);
