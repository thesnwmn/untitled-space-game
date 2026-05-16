(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();const he=40,Ce=30,ni=50,je=24;function ti(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class ii{constructor(){this.charW=0,this.charH=0,this.gridH=Ce,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(he),this.pre.dataset.gridRows=String(Ce),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${je}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${je}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const t=n.getBoundingClientRect();document.body.removeChild(n),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(he*this.charW),window.innerHeight/(Ce*this.charH)),t=Math.max(Ce,Math.min(ni,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${je*n}px`,this.pre.style.width=`${he*this.charW*n}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const r of this.resizeHandlers)r(he,t)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const t=[];for(const r of n){let i="";for(const s of r){const o=s.fg!=="transparent"?`fg-${s.fg}`:"",a=s.bg!=="transparent"?`bg-${s.bg}`:"",l=o&&a?`${o} ${a}`:o||a,c=l?` class="${l}"`:"";i+=`<span${c}>${ti(s.char)}</span>`}t.push(i)}this.pre.innerHTML=t.join(`
`)}getWidth(){return he}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const ri={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},oi=new Set(["0","1","2","3","4","5","6","7","8","9"]),si=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class ai{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}connect(){this.keyListener=n=>{if(si.has(n.key)&&n.preventDefault(),oi.has(n.key))for(const r of this.charInputHandlers.slice())r(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const r of this.charInputHandlers.slice())r("\b");return}const t=ri[n.key];if(t)for(const r of this.actionHandlers.slice())r(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=n=>{const t=this.pointerStartMap.get(n.pointerId),r=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),!t){this.logDebug(`UP id=${n.pointerId} NO START`);return}const i=n.clientX-t.startX,s=n.clientY-t.startY,o=Math.abs(i),a=Math.abs(s);if(o<20&&a<20)if(r>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;o>=a?l=i>0?"RIGHT":"LEFT":l=s>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(i)} dy=${Math.round(s)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=n=>{this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const t=n.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(n,t){const r=document.querySelector(".game-screen");if(!r)return null;const i=r.getBoundingClientRect(),s=parseInt(r.dataset.gridCols??"1"),o=parseInt(r.dataset.gridRows??"1");if(!s||!o||!i.width||!i.height)return null;const a=Math.floor((n-i.left)/(i.width/s)),l=Math.floor((t-i.top)/(i.height/o));return a<0||a>=s||l<0||l>=o?null:{col:a,row:l}}}function m(e,n,t,r,i,s){if(n<0||n>=e.length)return;const o=e[n];for(let a=0;a<r.length;a++){const l=t+a;l>=0&&l<o.length&&(o[l]={char:r[a],fg:i,bg:s})}}function k(e,n,t,r,i){if(n<0||n>=e.length)return;const s=e[n].length,o=Math.max(0,Math.floor((s-t.length)/2));m(e,n,o,t,r,i)}function sn(e,n){const t=e.split(/\s+/).filter(Boolean),r=[];let i="";for(const s of t)i.length===0?i=s:i.length+1+s.length<=n?i+=" "+s:(r.push(i),i=s);return i.length>0&&r.push(i),r}const bn=["UNTITLED","SPACE GAME"],li=4,ci=3,hi="- An ASCII space adventure -",di=11,_n=16;class vn{constructor(n,t,r,i){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,i()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),n.onAction(s=>{this.activated||(s==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:s==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:s==="SELECT"&&this.items[this.cursorIdx].action())}),n.onTap&&n.onTap((s,o)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(o===_n+a){this.cursorIdx=a,this.items[a].action();return}}})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let o=0;o<t;o++)for(let a=0;a<r;a++)n[o][a]={char:" ",fg:"black",bg:"black"};for(let o=0;o<bn.length;o++)k(n,li+o*ci,bn[o],"bright-cyan","black");k(n,di,hi,"white","black");const i=this.items.reduce((o,a)=>Math.max(o,a.label.length+2),0),s=Math.max(0,Math.floor((r-i)/2));for(let o=0;o<this.items.length;o++){const a=_n+o;if(a>=t)continue;const l=o===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";m(n,a,s,c+this.items[o].label,h,"black")}}}let en=null;function ui(e){en=e}function P(){if(en===null)throw new Error("World not initialised — call initWorld() before accessing world data");return en}function Oe(e){return P().systems.find(n=>n.id===e)}function U(e){return P().destinations.find(n=>n.id===e)}function an(e){return P().routes.filter(n=>n.from===e||n.to===e)}function dt(e){return P().drives.find(n=>n.id===e)}function pi(e){return P().storyBeats.filter(n=>n.trigger===e)}function mi(){return P().settings}function ut(e){return P().ships.find(n=>n.id===e)}function Me(e,n){return P().routes.find(t=>t.from===e&&t.to===n||t.from===n&&t.to===e)}function Z(e){return P().commodities.find(n=>n.id===e)}function fi(){return P().commodities}function gi(){return P().systems.filter(e=>e.playerKnowledge==="public")}function yi(e){return e.reduce((n,t)=>{const r=Z(t.commodityId);return n+t.qty*((r==null?void 0:r.weightKg)??0)},0)}const C=3;function pt(e,n){return n?e-2:e}function bi(e){return e.toLocaleString("en-US")}class ye{constructor(n,t){this.buttonRanges=null,this.footerRow=-1,this.context=n,this.player=t}render(n,t){const r=n.length,i=r>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader&&(this.renderHeaderRow0(n,i,t.systemLabel),this.renderHeaderRow1(n,i,t.destinationLabel)),t.showFooter&&(this.renderFooter(n,r,i,t.navOptions),this.footerRow=r-1)}renderHeaderRow0(n,t,r){const i=r!==void 0?r??"":(()=>{const c=Oe(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),s="::";m(n,0,0,s,"bright-black","black"),m(n,0,s.length,i,"bright-cyan","black");const a=t-s.length-i.length-10;let l=s.length+i.length;for(let c=0;c<a;c++)n[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,m(n,0,l,"[M]","white","black"),l+=3,m(n,0,l," MENU","white","black"),l+=5,m(n,0,l,"::","bright-black","black")}renderHeaderRow1(n,t,r){const i=r!==void 0?r??"":(()=>{const h=this.player.destinationId?U(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),s=bi(this.player.credits),o=s.length+5,a="::";m(n,1,0,a,"bright-black","black"),m(n,1,a.length,i,"cyan","black");const l=t-a.length-i.length-o;let c=a.length+i.length;for(let h=0;h<l;h++)n[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,m(n,1,c,s,"green","black"),c+=s.length,m(n,1,c," CR","white","black"),c+=3,m(n,1,c,"::","bright-black","black")}renderFooter(n,t,r,i){const s=t-1,o=[];if(i.length===0){for(let l=0;l<r;l++)n[s][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}m(n,s,0,"::","bright-black","black");let a=2;for(let l=0;l<i.length;l++){l>0&&(m(n,s,a,"::","bright-black","black"),a+=2);const c=i[l],h=`[${l+1}]`,d=` ${c.label}`,u=a;m(n,s,a,h,"white","black"),a+=h.length,m(n,s,a,d,"white","black"),a+=d.length,o.push({id:c.id,startCol:u,endCol:a})}for(let l=a;l<r;l++)n[s][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=o}hitTestNav(n,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const r of this.buttonRanges)if(n>=r.startCol&&n<r.endCol)return r.id;return null}}const _i=3,wn=5;class vi{constructor(n,t,r,i){this.activated=!1,this.pageIndex=0,this.onContinue=i,this.chrome=new ye(t,r);const o=pi("game-start")[0].text.split(`

`),a=o[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=o.slice(1)):(this.yearHeader="",l=o);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),u=sn(d,36);h>0&&c.push(""),c.push(...u)}this.bodyLines=c,n.onAction(h=>{this.activated||(h==="SELECT"?(this.activated=!0,this.onContinue()):h==="LEFT"?this.pageIndex>0&&this.pageIndex--:h==="RIGHT"&&this.pageIndex++)}),n.onTap&&n.onTap((h,d)=>{this.activated||(this.activated=!0,this.onContinue())})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let d=0;d<t;d++)for(let u=0;u<r;u++)n[d][u]={char:" ",fg:"black",bg:"black"};if(this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:[]}),this.yearHeader){const d=Math.max(0,Math.floor((r-this.yearHeader.length)/2));m(n,_i,d,this.yearHeader,"bright-yellow","black")}const s=t-3-wn,o=Math.max(1,Math.ceil(this.bodyLines.length/s));this.pageIndex>=o&&(this.pageIndex=o-1);const a=o>1,l=this.pageIndex*s,c=Math.min(l+s,this.bodyLines.length);let h=wn;for(let d=l;d<c;d++){const u=this.bodyLines[d];u!==""&&m(n,h,2,u,"white","black"),h++}if(a){const d=`< ${this.pageIndex+1}/${o} >`,u=r-9;m(n,t-3,u,d,"bright-black","black")}}}const mt=5,de=10;class be{constructor(n,t,r,i,s,o,a=[],l=null){this.activeTabIdx=0,this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.activated=!1,this.modal=null,this.title=n,this._staticItems=t,this.tabs=l,this.context=s,this.player=o,this.chrome=new ye(s,o),this.navOptions=r,this.infoLines=a,this.itemStartRow=l!==null?C+5:C+3+a.length,i.onCharInput&&i.onCharInput(c=>{this.modal!==null&&this.modal.handleCharInput(c)}),i.onAction(c=>{if(this.modal!==null){this.modal.handleAction(c);return}this.activated||(c==="UP"?this.moveCursor(-1):c==="DOWN"?this.moveCursor(1):c==="LEFT"&&this.tabs!==null?(this.activeTabIdx=Math.max(0,this.activeTabIdx-1),this.resetCursor()):c==="RIGHT"&&this.tabs!==null?(this.activeTabIdx=Math.min(this.tabs.length-1,this.activeTabIdx+1),this.resetCursor()):c==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):c==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):c==="SELECT"?this.activateCurrent():this.handleNavAction(c))}),this.resetCursor(),i.onTap&&i.onTap((c,h)=>{if(this.modal!==null){this.modal.handleTap(c,h);return}if(this.activated)return;const d=this.chrome.hitTestNav(c,h);if(d!==null){this.handleNavTap(d);return}if(this.tabs!==null&&h===C+3){let p=3;for(let f=0;f<this.tabs.length;f++){const g=this.tabs[f].label.length+2;if(c>=p&&c<p+g){this.activeTabIdx=f,this.resetCursor();return}p+=g+1}}const u=this.rowToVisibleItemIndex(h);u!==null&&!this.items[u].disabled&&(this.cursorIdx=u,this.activateCurrent())})}get items(){var n;return this.tabs!==null?((n=this.tabs[this.activeTabIdx])==null?void 0:n.items)??[]:this._staticItems}moveCursor(n){const t=this.items,r=t.length;if(r===0)return;const i=this.cursorIdx===-1?n>0?r-1:0:this.cursorIdx;for(let s=0;s<r;s++){const o=((i+n*(s+1))%r+r)%r;if(!t[o].disabled){this.cursorIdx=o;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const n=this.items[this.cursorIdx];n.disabled||(this.activated=!0,n.action())}rowToVisibleItemIndex(n){var i;let t=this.itemStartRow;const r=this.items;for(let s=0;s<r.length;s++){const o=1+(((i=r[s].details)==null?void 0:i.length)??0);if(n>=t&&n<t+o)return s;t+=o}return null}resetCursor(){const n=this.items;for(let t=0;t<n.length;t++)if(!n[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(n){}handleNavTap(n){}openModal(n){this.modal=n}closeModal(){this.modal=null}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:this.navOptions}}update(n){}render(n){var A,E;const t=n.length,r=t>0?n[0].length:0;for(let w=0;w<t;w++)for(let b=0;b<r;b++)n[w][b]={char:" ",fg:"black",bg:"black"};const i=this.buildChromeConfig();this.chrome.render(n,i),m(n,C,2,this.title,"bright-white","black"),m(n,C+1,2,"'".repeat(this.title.length),"bright-black","black");for(let w=0;w<this.infoLines.length;w++)m(n,C+2+w,2,this.infoLines[w],"bright-black","black");if(this.tabs!==null){const w=C+3;let b=2;n[w][b]={char:"|",fg:"bright-black",bg:"black"},b++;for(let S=0;S<this.tabs.length;S++){const R=S===this.activeTabIdx,W=` ${this.tabs[S].label} `,F=R?"black":"white",L=R?"green":"black";for(const D of W)b<r&&(n[w][b]={char:D,fg:F,bg:L}),b++;b<r&&(n[w][b]={char:"|",fg:"bright-black",bg:"black"}),b++}}const o=pt(t,i.showFooter)-1,a=o-this.itemStartRow,l=this.items,c=l.map(w=>{var b;return 1+(((b=w.details)==null?void 0:b.length)??0)}),d=c.reduce((w,b)=>w+b,0)>a,u=d?a-1:a,p=[];let f=[],g=0;for(let w=0;w<c.length;w++)g+c[w]>u?(f.length>0&&p.push(f),f=[w],g=c[w]):(f.push(w),g+=c[w]);f.length>0&&p.push(f),this.lastPageCount=Math.max(1,p.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const y=p[this.pageIndex]??[];let v=this.itemStartRow;for(const w of y){const b=l[w],S=w===this.cursorIdx,R=b.disabled?"bright-black":S?"bright-green":"white",W=b.infoFg??R,F=r-4;if(b.icon!==void 0){const L=b.icon.length;if(m(n,v,2,S?">":" ",R,"black"),m(n,v,3,b.icon,b.iconFg??R,"black"),b.info!==void 0){const H=Math.max(1,F-1-L-b.label.length-2-b.info.length);m(n,v,3+L,b.label+" ",R,"black"),m(n,v,3+L+b.label.length+1,".".repeat(H),"bright-black","black"),m(n,v,3+L+b.label.length+1+H+1,b.info,W,"black")}else m(n,v,3+L,b.label.slice(0,F-1-L),R,"black");for(let H=0;H<(((A=b.details)==null?void 0:A.length)??0);H++)v+1+H<=o&&m(n,v+1+H,2,("  "+b.details[H]).slice(0,F),"bright-black","black")}else if(b.info!==void 0){const L=S?"> ":"  ",D=Math.max(1,F-2-b.label.length-2-b.info.length);m(n,v,2,L+b.label+" ",R,"black"),m(n,v,2+L.length+b.label.length+1,".".repeat(D),"bright-black","black"),m(n,v,2+L.length+b.label.length+1+D+1,b.info,W,"black")}else if(b.details!==void 0&&b.details.length>0){m(n,v,2,((S?"> ":"  ")+b.label).slice(0,F),R,"black");for(let D=0;D<b.details.length;D++)v+1+D<=o&&m(n,v+1+D,2,("  "+b.details[D]).slice(0,F),"bright-black","black")}else m(n,v,2,((S?"> ":"  ")+b.label).slice(0,F),R,"black");v+=1+(((E=b.details)==null?void 0:E.length)??0)}if(d){const w=`${this.pageIndex+1}/${this.lastPageCount}`,b=o;m(n,b,0,"|<|","white","black");const S=Math.floor((r-w.length)/2);m(n,b,S,w,"bright-black","black"),m(n,b,r-3,"|>|","white","black")}this.modal!==null&&this.modal.render(n)}}const wi=30;class nn{constructor(n){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=n,this.value=Math.max(n.field.min,Math.min(n.field.max,n.field.initialValue))}handleAction(n){const{field:t}=this.formDef;if(n==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(n==="UP"){this.value=Math.min(t.max,this.value+1);return}if(n==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(n==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(n==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(n==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}n==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(n){if(this.focus!=="field")return;const{field:t}=this.formDef;if(n==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(n>="0"&&n<="9"){const r=parseInt(n,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,r)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+r)}}handleTap(n,t){this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(n){const t=n.length,r=t>0?n[0].length:0,{title:i,field:s,derivedRows:o,confirmLabel:a}=this.formDef,l=o.length,c=8+l,h=wi,d=Math.floor((r-h)/2),u=Math.floor((t-c)/2);for(let x=0;x<c;x++)for(let $=0;$<h;$++){const Y=u+x,ce=d+$;Y>=0&&Y<t&&ce>=0&&ce<r&&(n[Y][ce]={char:" ",fg:"white",bg:"black"})}const p=(x,$,Y)=>{x>=0&&x<t&&$>=0&&$<r&&(n[x][$]={char:Y,fg:"white",bg:"black"})};p(u,d,"+"),p(u,d+h-1,"+");for(let x=1;x<h-1;x++)p(u,d+x,"-");p(u+c-1,d,"+"),p(u+c-1,d+h-1,"+");for(let x=1;x<h-1;x++)p(u+c-1,d+x,"-");for(let x=1;x<c-1;x++)p(u+x,d,"|"),p(u+x,d+h-1,"|");const f=h-2,g=u+1,y=d+1+Math.floor((f-i.length)/2);m(n,g,y,i,"bright-white","black"),m(n,u+2,y,"'".repeat(i.length),"bright-black","black");const v=[s.label,...o.map(x=>x.label)],A=Math.max(...v.map(x=>x.length)),E=d+1+A+3,w=u+4,b=this.focus==="field";m(n,w,d+1,s.label.padEnd(A)+" : ","white","black");const S=this.value.toString().padStart(5);m(n,w,E,S,b?"black":"white",b?"green":"black");for(let x=0;x<l;x++){const $=o[x],Y=u+5+x,ce=$.compute(this.value);m(n,Y,d+1,$.label.padEnd(A)+" : ","white","black"),m(n,Y,E,ce,"white","black")}const R=u+4+l+2,W=`[ ${a} ]`,F="[ CANCEL ]",L=3,D=W.length+L+F.length,H=Math.floor((f-D)/2),We=d+1+H,fn=We+W.length+L;this.confirmRect={col:We,row:R,width:W.length},this.cancelRect={col:fn,row:R,width:F.length};const gn=this.focus==="confirm",yn=this.focus==="cancel";m(n,R,We,W,gn?"black":"white",gn?"green":"black"),m(n,R,fn,F,yn?"black":"white",yn?"green":"black")}}class ki extends be{constructor(n,t,r,i,s,o,a,l){const c=U(i),h=[];c.amenities.trader&&h.push({label:"TRADER",action:o}),c.amenities.missionBoard&&h.push({label:"MISSION BOARD",action:a});const d=r.fuelCapacityL-r.fuelL,u=Math.floor(r.credits/de),p=Math.min(d,u);let f=null;if(c.amenities.fuel&&p>0){const E=p*de;f=h.length,h.push({label:`BUY FUEL  +${p}L  ${E}CR`,action:()=>{}})}const g=sn(c.description,36).slice(0,3),y=`DANGER: ${c.dangerLevel.toUpperCase()}`,v=[...g,y],A=c.locationType==="surface"||c.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",h,[{id:"undock",label:A}],n,t,r,v),this.onShip=l,this.onRefuel=s,this.fuelItemIdx=f}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx===-1)return;const t=n[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const r=this.player.fuelCapacityL-this.player.fuelL,i=Math.floor(this.player.credits/de),s=Math.min(r,i);this.openModal(new nn({title:"BUY FUEL",field:{label:"Litres",initialValue:s,min:0,max:s},derivedRows:[{label:"Cost",compute:o=>`${o*de} CR`}],confirmLabel:"BUY",onConfirm:o=>{this.closeModal(),o>0&&this.onRefuel(o*de,o)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class xi extends be{constructor(n,t,r,i,s,o,a,l,c){var p;const d=((p=U(i).npcs.trader)==null?void 0:p.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(d,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,[],u),this.traderStock=s,this.onBuy=o,this.onSell=a,this.onHub=l,this.onUndock=c,this.syncItems(),this.clampCursor()}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(n=>{const t=Z(n.commodityId);if(!t)return[];const r=this.player.credits>=t.basePrice;return[{label:`${t.name} (x${n.qty})`,info:`${t.basePrice} CR`,disabled:!r,action:()=>{const i=Math.floor(this.player.credits/t.basePrice),s=Math.min(n.qty,i);this.openModal(new nn({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:s,min:0,max:s},derivedRows:[{label:"Total",compute:o=>`${o*t.basePrice} CR`}],confirmLabel:"BUY",onConfirm:o=>{o>0&&this.onBuy(n.commodityId,o),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const n=this.player.cargoHold;return n.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...n].flatMap(t=>{const r=Z(t.commodityId);return r?[{label:`${r.name} (x${t.qty})`,info:`${r.basePrice} CR`,action:()=>{this.openModal(new nn({title:r.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:i=>`${i*r.basePrice} CR`}],confirmLabel:"SELL",onConfirm:i=>{i>0&&this.onSell(t.commodityId,i),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]:[]})}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const n=this.items;(this.cursorIdx<0||this.cursorIdx>=n.length||(t=n[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=n.findIndex(r=>!r.disabled))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(n){this.syncItems(),super.render(n);const t=n.length,r=`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,i=pt(t,!0)-2;m(n,i,2,r,"bright-black","black")}}const Ci={delivery:"[D] ",supply:"[S] "};class Ai extends be{constructor(n,t,r,i,s,o,a,l){U(i);const c=s();let h;c.length===0?h=[{label:"NO MISSIONS AVAILABLE",disabled:!0,action:()=>{}}]:h=c.map(d=>({label:d.title,icon:Ci[d.type],iconFg:"bright-yellow",info:`${d.reward} CR`,infoFg:"bright-green",details:[d.giverName],action:()=>o(d)})),super("MISSION BOARD",h,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r),this.onHub=a,this.onUndock=l}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}function Ti(e,n){return e.type==="delivery"?e.pickupComplete?n.destinationId===e.deliveryDestinationId?"ready-to-deliver":"in-transit":"pending-pickup":e.requirements.every(r=>{const i=n.cargoHold.find(s=>s.commodityId===r.commodityId);return i!==void 0&&i.qty>=r.qty})?"ready-to-deliver":"needs-supplies"}function Si(e,n){return n.type==="delivery"&&e.cargoCapacity-e.cargoWeightKg<n.itemWeightKg?{ok:!1,reason:"Insufficient cargo space"}:{ok:!0}}class Ii{constructor(n){const t=ut(n.shipId);if(!t)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[],this._activeMissions=[],this._missionItems=[]}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,t){const r=this._cargoHold.find(i=>i.commodityId===n);r?r.qty+=t:this._cargoHold.push({commodityId:n,qty:t})}removeCargo(n,t){const r=this._cargoHold.findIndex(i=>i.commodityId===n);r<0||(t!==void 0&&t<this._cargoHold[r].qty?this._cargoHold[r].qty-=t:this._cargoHold.splice(r,1))}get missionItemsWeightKg(){return this._missionItems.reduce((n,t)=>n+t.weightKg,0)}get cargoWeightKg(){return yi(this._cargoHold)+this.missionItemsWeightKg}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}get activeMissions(){return this._activeMissions}get missionItems(){return this._missionItems}acceptMission(n,t){const r={...n,acceptedAt:Date.now(),pickupComplete:!1};this._activeMissions.push(r),n.type==="delivery"&&t&&(this._missionItems.push({missionId:n.id,itemName:n.itemName,weightKg:n.itemWeightKg}),r.pickupComplete=!0)}collectMissionItem(n){const t=this._activeMissions.find(r=>r.id===n);!t||t.type!=="delivery"||(t.pickupComplete=!0,this._missionItems.push({missionId:t.id,itemName:t.itemName,weightKg:t.itemWeightKg}))}completeMission(n){this._activeMissions=this._activeMissions.filter(t=>t.id!==n),this._missionItems=this._missionItems.filter(t=>t.missionId!==n)}cancelMission(n){this._activeMissions=this._activeMissions.filter(t=>t.id!==n),this._missionItems=this._missionItems.filter(t=>t.missionId!==n)}getMissionsForPickup(n){return this._activeMissions.filter(t=>t.type==="delivery"&&t.pickupDestinationId===n&&!t.pickupComplete)}getMissionsForDelivery(n){return this._activeMissions.filter(t=>t.deliveryDestinationId===n&&Ti(t,this)==="ready-to-deliver")}}const Ei={delivery:"[D]",supply:"[S]"};class Mi extends be{constructor(n,t,r,i,s,o){const a=Si(r,i),l=a.ok?[{id:"accept",label:"ACCEPT"},{id:"back",label:"BACK"}]:[{id:"back",label:"BACK"}];super("MISSION BOARD",[],l,n,t,r),this.spec=i,this.onAccept=s,this.onBack=o,this.canAccept=a}computeGiveItemNow(){return this.spec.type!=="delivery"?!1:this.spec.pickupDestinationId===this.spec.issuingDestinationId}handleNavAction(n){this.activated||(n==="NAV_1"?this.canAccept.ok?(this.activated=!0,this.onAccept(this.computeGiveItemNow())):(this.activated=!0,this.onBack()):(n==="NAV_2"||n==="BACK")&&(this.activated=!0,this.onBack()))}handleNavTap(n){this.activated||(n==="accept"&&this.canAccept.ok?(this.activated=!0,this.onAccept(this.computeGiveItemNow())):n==="back"&&(this.activated=!0,this.onBack()))}render(n){super.render(n),this.renderDetail(n)}renderDetail(n){const t=n.length,r=t>0?n[0].length:40,i=r-4,s=t-1;let o=C+3;const a=`${Ei[this.spec.type]} ${this.spec.title}`.slice(0,i);m(n,o,2,a,"bright-yellow","black"),o++;const l=P(),c=this.spec.giverFactionId?l.factions.find(p=>p.id===this.spec.giverFactionId):null,h=c?` [${c.name}]`:"",d=`    ${this.spec.giverName}${h}`;if(m(n,o,2,d.slice(0,i),"bright-black","black"),o++,o++,this.spec.type==="delivery"){const p=U(this.spec.pickupDestinationId),f=U(this.spec.deliveryDestinationId);m(n,o,2,`Pickup:  ${(p==null?void 0:p.name)??this.spec.pickupDestinationId}`.slice(0,i),"white","black"),o++,m(n,o,2,`Deliver: ${(f==null?void 0:f.name)??this.spec.deliveryDestinationId}`.slice(0,i),"white","black"),o++;const g=this.player.cargoCapacity-this.player.cargoWeightKg,y=this.spec.itemWeightKg,v=g>=y,A=`Weight:  ${y} kg  (Free: ${g} kg)`;m(n,o,2,A,"white","black");const E=v?"bright-green":"red",w=2+A.length+1;w<r&&m(n,o,w,v?"✓":"✗",E,"black"),o++}else{const p=U(this.spec.deliveryDestinationId);m(n,o,2,`Deliver to: ${(p==null?void 0:p.name)??this.spec.deliveryDestinationId}`.slice(0,i),"white","black"),o++;for(const f of this.spec.requirements){if(o>=s-1)break;const g=Z(f.commodityId);m(n,o,2,`  ${f.qty}x ${(g==null?void 0:g.name)??f.commodityId}`.slice(0,i),"white","black"),o++}}o++;const u=sn(this.spec.description,i);for(const p of u){if(o>=s-2)break;m(n,o,2,p,"white","black"),o++}o++,!(o>=s-1)&&(m(n,o,2,`REWARD: ${this.spec.reward} CR`,"bright-green","black"),o++,!this.canAccept.ok&&this.canAccept.reason&&(o++,o<s&&m(n,o,2,`[!] ${this.canAccept.reason}`,"red","black")))}}const Li=[18,10,5],Ri=[".","*","+"],kn=[4e3,2e3,800],Oi=[9e3,5e3,2500],Ni=[null,"bright-black","white"],Fi=["bright-black","white","bright-white"],Di=["white","bright-white","bright-cyan"],Ae=3,xn=25,Te=2,Cn=37,An=2*Math.PI;function Pi(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class Ui{constructor(n=42){this.boundsSet=!1,this.rand=Pi(n),this.stars=[];for(let t=0;t<3;t++)for(let r=0;r<Li[t];r++){const i=Te+Math.floor(this.rand()*(Cn-Te+1)),s=Ae+Math.floor(this.rand()*(xn-Ae+1)),o=this.rand()*An,a=kn[t]+this.rand()*(Oi[t]-kn[t]);this.stars.push({col:i,row:s,layer:t,twinklePhase:o,twinklePeriod:a})}}update(n){for(const t of this.stars)t.twinklePhase+=An/t.twinklePeriod*n}render(n,t,r,i,s){if(!this.boundsSet){this.boundsSet=!0;const o=xn-Ae,a=Cn-Te;{const l=(r-t)/o,c=(s-i)/a;for(const h of this.stars)h.row=Math.round(t+(h.row-Ae)*l),h.col=Math.round(i+(h.col-Te)*c)}}for(const o of this.stars){const{row:a,col:l,layer:c}=o;if(a<t||a>r||l<i||l>s)continue;const h=Math.sin(o.twinklePhase);let d;h>=.5?d=Di[c]:h>=-.5?d=Fi[c]:d=Ni[c],d!==null&&(n[a][l]={char:Ri[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const Bi=6,Ye=6,Hi=23,$i=23,Ke=10,Gi=0,Wi=4,ji=18,Yi=21,Ki=35,qi=39,Tn=12,Vi=11,X=13,ue=27,qe=28,zi=12,Ve=40,Sn=200,ze=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],Xi="#",In=["green","cyan","white","yellow"],En=["*",".","+","x"];function Mn(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function Ji(e,n,t){return{col:n,row:t,char:Xi,color:In[Math.floor(e()*In.length)],phase:e()*2e4,period:1e4+e()*1e4,active:e()>.2}}function pe(e,n,t,r){const i=[];for(const s of r)for(let o=n;o<=t;o++)i.push(Ji(e,o,s));return i}class Qi{constructor(n,t,r,i,s,o){this.cursorIdx=0,this.activated=!1,this.h=30,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.player=r,this.chrome=new ye(t,r),this.starfield=new Ui(42),this.inSpace=r.destinationId===null;const a=Mn(99);this.gaugeBtns=[...pe(a,Gi,Wi,[3,4]),...pe(a,ji,Yi,[3,4]),...pe(a,Ki,qi,[3,4])],this.leftBtns=pe(a,0,Vi,[0,1,2,3]),this.rightBtns=pe(a,qe,39,[0,1,2,3]);const l=Mn(77),c=3+Math.floor(l()*4);this.radarContacts=Array.from({length:c},()=>({x:l()*(ue-X-1),y:l()*4,vx:(l()-.5)*2,vy:(l()-.5)*1.5,char:En[Math.floor(l()*En.length)]}));const h=()=>this.inSpace?1:2;n.onAction(d=>{this.activated||(d==="CARGO"?(this.activated=!0,o()):d==="UP"?this.cursorIdx=(this.cursorIdx-1+h())%h():d==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%h():d==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,i()):this.inSpace||(this.activated=!0,s())))}),n.onTap&&n.onTap((d,u)=>{if(this.activated)return;const p=this.h;(u===3||u===4)&&d>=Ye&&d<Ye+1+Ke?(this.activated=!0,o()):u===p-3&&d<Tn?(this.activated=!0,i()):u===p-3&&d>=qe&&!this.inSpace&&(this.activated=!0,s())})}update(n){this.starfield.update(n),this.blinkPhase=(this.blinkPhase+n)%1e3;for(const i of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])i.phase+=n,i.phase>=i.period&&(i.phase-=i.period,i.active=!i.active);const t=ue-X,r=5;for(const i of this.radarContacts)i.x+=i.vx*n/1e3,i.y+=i.vy*n/1e3,i.x<0&&(i.x=-i.x,i.vx=-i.vx),i.x>t-1&&(i.x=2*(t-1)-i.x,i.vx=-i.vx),i.y<0&&(i.y=-i.y,i.vy=-i.vy),i.y>r-1&&(i.y=2*(r-1)-i.y,i.vy=-i.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-n);else for(this.tickerAccum+=n;this.tickerAccum>=Sn;){this.tickerAccum-=Sn,this.tickerScroll++;const i=ze[this.msgIdx];if(this.tickerScroll>=i.length+Ve-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%ze.length,this.tickerPause=500,this.tickerAccum=0;break}}}render(n){const t=n.length,r=t>0?n[0].length:0;this.h=t;for(let c=0;c<t;c++)for(let h=0;h<r;h++)n[c][h]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:[]});const i=5,s=t-8,o=t-7,a=t-3,l=t-2;this.renderGaugeStrip(n),this.starfield.render(n,i,s,0,39);for(let c=0;c<r;c++)n[i][c]={char:"-",fg:"white",bg:"black"},n[s][c]={char:"-",fg:"white",bg:"black"};this.renderHUD(n,i+1),this.renderCrosshair(n,i+1,s-1),this.renderBottomPanels(n,o,a),this.renderTicker(n,l)}renderGaugeStrip(n){for(const s of this.gaugeBtns){const o=s.active?s.color:"bright-black";n[s.row][s.col]={char:s.char,fg:o,bg:"black"}}const t=this.player.fuelL/this.player.fuelCapacityL,r=this.player.cargoWeightKg/this.player.cargoCapacity,i=this.blinkPhase<500;this.renderGauge(n,3,Bi,"F",t,"yellow",i),this.renderGauge(n,4,Ye,"C",r,"blue",i),this.renderGauge(n,3,Hi,"S",1,"cyan",i),this.renderGauge(n,4,$i,"H",1,"green",i)}renderGauge(n,t,r,i,s,o,a){n[t][r]={char:i,fg:o,bg:"black"};const l=Math.round(Math.min(1,Math.max(0,s))*Ke),c=s<=.2;for(let h=0;h<Ke;h++){const d=r+1+h;if(h<l){const u=c&&!a?"bright-black":o;n[t][d]={char:" ",fg:"black",bg:u}}else n[t][d]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(n,t){m(n,t,1,"VEL:----","bright-black","black"),m(n,t,16,"ATT:---°","bright-black","black"),m(n,t,30,"ROT:--°","bright-black","black")}renderCrosshair(n,t,r){const i=Math.floor((t+r)/2),s=20;n[i][s]={char:"+",fg:"bright-green",bg:"black"};const o=[[i-3,s-5],[i-3,s+5],[i+3,s-5],[i+3,s+5]];for(const[a,l]of o)a>=t&&a<=r&&l>=0&&l<40&&(n[a][l]={char:"+",fg:"bright-green",bg:"black"})}renderBottomPanels(n,t,r){for(let c=t;c<=r;c++)for(let h=X;h<ue;h++)n[c][h]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(n,t,r-t+1);for(const c of this.leftBtns){const h=t+c.row;if(h<r){const d=c.active?c.color:"bright-black";n[h][c.col]={char:c.char,fg:d,bg:"black"}}}for(const c of this.rightBtns){const h=t+c.row;if(h<r){const d=c.active?c.color:"bright-black";n[h][c.col]={char:c.char,fg:d,bg:"black"}}}const i=this.cursorIdx===0?"bright-yellow":"yellow";m(n,r,0,this.centerPad("TRAVEL",Tn),"black",i);let s,o;this.inSpace?(s="bright-black",o="bright-black"):(s=this.cursorIdx===1?"bright-cyan":"cyan",o="black"),m(n,r,qe,this.centerPad("DOCK",zi),o,s);const a=ue-X,l="<)) "+"-".repeat(a-4);m(n,r,X,l,"white","bright-black")}renderRadar(n,t,r){for(const i of this.radarContacts){const s=Math.min(ue-X-1,Math.max(0,Math.floor(i.x))),o=Math.min(r-1,Math.max(0,Math.floor(i.y)));n[t+o][X+s]={char:i.char,fg:"white",bg:"bright-black"}}}renderTicker(n,t){const r=ze[this.msgIdx];for(let i=0;i<Ve;i++){const s=this.tickerScroll-Ve+1+i,o=s>=0&&s<r.length?r[s]:" ";n[t][i]={char:o,fg:"white",bg:"black"}}}centerPad(n,t){if(n.length>=t)return n.slice(0,t);const r=t-n.length,i=Math.floor(r/2);return" ".repeat(i)+n+" ".repeat(r-i)}}const Xe="CARGO HOLD";class Zi{constructor(n,t,r,i){this.activated=!1,this.player=r,n.onAction(s=>{this.activated||(s==="BACK"||s==="CARGO")&&(this.activated=!0,i())})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let h=0;h<t;h++)for(let d=0;d<r;d++)n[h][d]={char:" ",fg:"black",bg:"black"};k(n,1,Xe,"bright-white","black");const i=Math.max(0,Math.floor((r-Xe.length)/2));m(n,2,i,"'".repeat(Xe.length),"bright-black","black");const s=this.player.cargoHold,o=this.player.cargoCapacity,a=this.player.cargoWeightKg;if(s.length===0)k(n,Math.floor(t/2),"CARGO HOLD EMPTY","bright-black","black");else{let h=4;for(const u of s){if(h>=t-3)break;const p=Z(u.commodityId);if(!p)continue;const f=u.qty*p.weightKg,g=`  x${u.qty}  ${p.basePrice}CR  ${f}KG`,y=Math.max(6,r-4-g.length),v=p.name,E=`${v.length>y?v.slice(0,y):v}${g}`;m(n,h,2,E,"white","black"),h++}const d=t-4;d>3&&m(n,d,2,"-".repeat(r-4),"bright-black","black")}const l=t-3,c=`TOTAL: ${a}/${o}KG`;m(n,l,2,c,"bright-black","black"),m(n,t-1,2,"[ESC] BACK","bright-black","black")}}class Ln extends be{constructor(n,t,r,i,s,o,a,l){const c=Oe(r.systemId),h=dt(r.driveId),d=[...c.destinations.map(g=>({label:U(g).name.toUpperCase(),disabled:g===r.destinationId,action:()=>i(g)})),{label:"FLY INTO SPACE",disabled:r.destinationId===null,action:o}],p=[...an(r.systemId).map(g=>{const y=g.from===r.systemId?g.to:g.from,v=Oe(y),A=g.stability.toUpperCase(),E=Math.ceil(mt*g.distance*h.fuelEfficiency);return{label:`${v.name.toUpperCase()}  ${g.distance}LY  [${A}]`.slice(0,36),disabled:E>r.fuelL,action:()=>s(y)}}),{label:"GALAXY MAP...",action:l}],f=[{label:"DESTINATIONS",items:d},{label:"JUMPS",items:p}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],n,t,r,[],f),this.onShip=a}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}function Rn(e,n){if(e===n)return[e];const t=[[e]],r=new Set([e]);for(;t.length>0;){const i=t.shift(),s=i[i.length-1];for(const o of an(s)){const a=o.from===s?o.to:o.from;if(a===n)return[...i,a];r.has(a)||(r.add(a),t.push([...i,a]))}}return null}const On="GALAXY MAP",Nn=C+3,Fn=C+5,K=C+9,Dn=C+13,er=C+14,Se=C+15,Je=C+20,Qe=C+21,nr=2,tr=10,ir=12,Ie=13,Ee=12,rr=25,or=26,sr=10,Pn=18;function ar(e,n){return e.length>=n?e.slice(0,n):e+" ".repeat(n-e.length)}function me(e,n){return"["+ar(e.toUpperCase(),n-2)+"]"}class lr{constructor(n,t,r,i){this.activeTab="map",this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.activated=!1,this.chrome=new ye(t,r),this.player=r,this.onBack=i,this.publicSystems=gi().sort((s,o)=>s.distanceFromSol-o.distanceFromSol),this.otherSystems=this.publicSystems.filter(s=>s.id!==r.systemId),this.mapBrowsingSystemId=r.systemId,n.onCharInput&&n.onCharInput(s=>{if(this.activated||this.activeTab!=="map")return;const o=s.charCodeAt(0);s==="\b"||s===""?this.searchText=this.searchText.slice(0,-1):o>=32&&o<127&&(this.searchText+=s.toUpperCase(),this.mapCursorIdx=0)}),n.onAction(s=>{if(!this.activated){if(s==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}if(s==="LEFT"){this.activeTab="map",this.searchText="";return}if(s==="RIGHT"){this.activeTab="route",this.searchText="";return}this.activeTab==="map"?this.handleMapAction(s):this.handleRouteAction(s)}}),n.onTap&&n.onTap((s,o)=>{if(this.activated)return;if(this.chrome.hitTestNav(s,o)==="back"){this.searchText="",this.activated=!0,this.onBack();return}if(o===Nn){s>=3&&s<=7?(this.activeTab="map",this.searchText=""):s>=9&&s<=16&&(this.activeTab="route",this.searchText="");return}if(this.activeTab==="map"&&o>=Se&&o<Je){const l=this.getMapNeighbors(),c=o-Se;c>=0&&c<l.length&&(this.mapBrowsingSystemId=l[c].id,this.mapCursorIdx=0,this.searchText="")}if(this.activeTab==="route"&&o>=C+8&&o<=C+14){const l=o-(C+8);l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}})}getMapNeighbors(){const t=an(this.mapBrowsingSystemId).map(r=>{const i=r.from===this.mapBrowsingSystemId?r.to:r.from,s=this.publicSystems.find(a=>a.id===i),o=r.distance;return s?{sys:s,dist:o}:null}).filter(r=>r!==null).sort((r,i)=>r.dist-i.dist).map(r=>r.sys);return this.searchText.length===0?t:t.filter(r=>r.name.toUpperCase().includes(this.searchText))}handleMapAction(n){const t=this.getMapNeighbors(),r=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(n==="UP")this.mapCursorIdx=Math.max(0,r-1);else if(n==="DOWN")this.mapCursorIdx=Math.min(t.length-1,r+1);else if(n==="SELECT"){const i=t[r];if(!i)return;this.mapBrowsingSystemId=i.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(n){n==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):n==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const n=this.otherSystems[this.routeDestIdx];return n?Rn(this.player.systemId,n.id):null}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let s=0;s<t;s++)for(let o=0;o<r;o++)n[s][o]={char:" ",fg:"black",bg:"black"};const i=[{id:"back",label:"BACK"}];this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:i}),m(n,C,2,On,"bright-white","black"),m(n,C+1,2,"'".repeat(On.length),"bright-black","black"),this.renderTabBar(n,r),this.activeTab==="map"?this.renderMapTab(n,r):this.renderRouteTab(n,r)}renderTabBar(n,t){const r=Nn;let i=2;n[r][i++]={char:"|",fg:"bright-black",bg:"black"};for(const[s,o]of[["MAP","map"],["ROUTE","route"]]){const a=this.activeTab===o,l=a?"black":"white",c=a?"green":"black";for(const h of` ${s} `)i<t&&(n[r][i]={char:h,fg:l,bg:c}),i++;i<t&&(n[r][i]={char:"|",fg:"bright-black",bg:"black"}),i++}}renderMapTab(n,t){const r=this.publicSystems.find(o=>o.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!r)return;this.renderChart(n,r),m(n,er,0,"-".repeat(t),"bright-black","black");const i=this.getMapNeighbors(),s=Math.min(this.mapCursorIdx,Math.max(0,i.length-1));this.renderNeighborList(n,t,r,i,s),m(n,Je,0,"-".repeat(t),"bright-black","black"),this.renderInfo(n,t,r,i[s]??null),this.searchText.length>0&&m(n,Qe+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(n,t){const r=this.getMapNeighbors(),i=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(m(n,K,Ie,me(t.name,Ee),i,"black"),t.id===this.player.systemId){const o=Ie+Ee;n[K][o]={char:"*",fg:"bright-yellow",bg:"black"}}const s=["left","right","top","bottom"];for(let o=0;o<Math.min(r.length,4);o++){const a=r[o],l=s[o],c=a.id===this.player.systemId?"bright-yellow":"white";if(l==="left")m(n,K,nr,me(a.name,tr),c,"black"),n[K][ir]={char:"-",fg:"bright-black",bg:"black"};else if(l==="right")m(n,K,or,me(a.name,sr),c,"black"),n[K][rr]={char:"-",fg:"bright-black",bg:"black"};else if(l==="top"){m(n,Fn,Ie,me(a.name,Ee),c,"black");for(let h=Fn+1;h<K;h++)n[h][Pn]={char:"|",fg:"bright-black",bg:"black"}}else{m(n,Dn,Ie,me(a.name,Ee),c,"black");for(let h=K+1;h<Dn;h++)n[h][Pn]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(n,t,r,i,s){for(let o=0;o<i.length&&o<Je-Se;o++){const a=i[o],l=Se+o,c=o===s,d=a.id===this.player.systemId?"bright-yellow":c?"bright-cyan":"white",u=c?"> ":"  ",p=Me(r.id,a.id),f=p?`${p.distance}LY  ${p.stability}`:"",g=t-4-f.length;m(n,l,2,u+a.name.toUpperCase().slice(0,g-2),d,"black"),f&&m(n,l,t-2-f.length,f,"bright-black","black")}}renderInfo(n,t,r,i){const o=r.id===this.player.systemId?"* Current location":r.name.toUpperCase();if(m(n,Qe,2,`Zone: ${r.zone}  Sec: ${r.security}  ${o}`.slice(0,t-4),"bright-black","black"),!i)return;const a=Me(r.id,i.id);if(!a)return;const l=Rn(this.player.systemId,i.id),c=l?l.length===1?"(your location)":`${l.length-1} hop${l.length-1!==1?"s":""} from you`:"(unreachable)";m(n,Qe+1,2,`${i.name.toUpperCase()}  ${a.distance}LY  ${c}`.slice(0,t-4),"bright-black","black")}renderRouteTab(n,t){var g,y;const r=C+5,i=C+7,s=C+8,o=7,a=s+o,l=a+1,c=l+6,h=this.publicSystems.find(v=>v.id===this.player.systemId);m(n,r,2,"FROM:","bright-black","black"),m(n,r,8,(h==null?void 0:h.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),m(n,i,2,"TO:","bright-black","black");const d=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-o));for(let v=0;v<o;v++){const A=d+v;if(A>=this.otherSystems.length)break;const E=this.otherSystems[A],w=A===this.routeDestIdx,b=w?"bright-cyan":"white",S=w?"> ":"  ";m(n,s+v,2,S+E.name.toUpperCase(),b,"black")}m(n,a,0,"-".repeat(t),"bright-black","black"),m(n,c,0,"-".repeat(t),"bright-black","black");const u=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!u){m(n,l,2,"No route found","bright-red","black");return}const f=u.length-1;m(n,l,2,`Route: ${f} hop${f!==1?"s":""}`,"bright-white","black");for(let v=0;v<f;v++){const A=Me(u[v],u[v+1]);if(!A)continue;const E=l+1+v;if(E>=c)break;const w=(((g=this.publicSystems.find(S=>S.id===u[v]))==null?void 0:g.name)??u[v]).toUpperCase().slice(0,9),b=(((y=this.publicSystems.find(S=>S.id===u[v+1]))==null?void 0:y.name)??u[v+1]).toUpperCase().slice(0,9);m(n,E,4,`${w} -> ${b}  ${A.distance}LY  ${A.stability}`.slice(0,t-6),"white","black")}}}class z{constructor(n,t,r,i){this.elapsed=0,this.arrived=!1,this.player=n,this.chrome=new ye(t,n),this.duration=r,this.onComplete=i}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}render(n){const t=n.length,r=t>0?n[0].length:0;for(let i=0;i<t;i++)for(let s=0;s<r;s++)n[i][s]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,this.getChromeConfig()),this.renderContent(n)}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const cr=["[. . .]","[: : :]","[* * *]"],Un=5e3;class hr extends z{constructor(n,t,r){super(n,t,Un,r)}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/500)%3,s=Math.ceil((Un-this.elapsed)/1e3),o=Math.max(1,Math.min(5,s)),a=Oe(this.player.systemId),l=a?a.name.toUpperCase():this.player.systemId.toUpperCase();k(n,r-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),k(n,r-1,"DESTINATION:","bright-black","black"),k(n,r,l,"bright-white","black"),k(n,r+2,cr[i],"bright-black","black"),k(n,r+4,`ARRIVING IN ${o}S`,"bright-black","black")}}const Bn=2e3,dr=["[ —   ]","[  —  ]","[   — ]"];class Hn extends z{constructor(n,t,r,i){super(n,t,Bn,r),this.targetLabel=i}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/300)%3,s=Math.ceil((Bn-this.elapsed)/1e3),o=Math.max(1,Math.min(2,s)),a=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const l=this.player.destinationId?U(this.player.destinationId):null;return l?l.name.toUpperCase():"UNKNOWN"})();k(n,r-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),k(n,r-1,"HEADING TO:","bright-black","black"),k(n,r,a,"bright-white","black"),k(n,r+2,dr[i],"bright-black","black"),k(n,r+4,`ARRIVING IN ${o}S`,"bright-black","black")}}const $n=2500,ur=["v","vv","vvv"];class pr extends z{constructor(n,t,r){super(n,t,$n,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/400)%3,s=Math.ceil(($n-this.elapsed)/1e3),o=Math.max(1,Math.min(3,s));k(n,r-3,"[ LANDING SEQUENCE ]","bright-green","black"),k(n,r+2,ur[i],"bright-black","black"),k(n,r+4,`TOUCHDOWN IN ${o}S`,"bright-black","black")}}const Gn=2500,mr=[">",">>",">>>"];class fr extends z{constructor(n,t,r){super(n,t,Gn,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/400)%3,s=Math.ceil((Gn-this.elapsed)/1e3),o=Math.max(1,Math.min(3,s));k(n,r-3,"[ APPROACH LOCKED ]","bright-yellow","black"),k(n,r+2,mr[i],"bright-black","black"),k(n,r+4,`CLAMPING IN ${o}S`,"bright-black","black")}}const Wn=1500,gr=["^","^^","^^^"];class yr extends z{constructor(n,t,r){super(n,t,Wn,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/300)%3,s=Math.ceil((Wn-this.elapsed)/1e3),o=Math.max(1,Math.min(2,s));k(n,r-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),k(n,r+2,gr[i],"bright-black","black"),k(n,r+4,`CLEAR IN ${o}S`,"bright-black","black")}}const jn=1500,br=["<","<<","<<<"];class _r extends z{constructor(n,t,r){super(n,t,jn,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/300)%3,s=Math.ceil((jn-this.elapsed)/1e3),o=Math.max(1,Math.min(2,s));k(n,r-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),k(n,r+2,br[i],"bright-black","black"),k(n,r+4,`DEPARTING IN ${o}S`,"bright-black","black")}}const Yn=1500,vr=["→","→→","→→→"];class wr extends z{constructor(n,t,r){super(n,t,Yn,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/300)%3,s=Math.ceil((Yn-this.elapsed)/1e3),o=Math.max(1,Math.min(2,s));k(n,r-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),k(n,r+2,vr[i],"bright-black","black"),k(n,r+4,`DOCKING IN ${o}S`,"bright-black","black")}}const Kn=1500,kr=["←","←←","←←←"];class xr extends z{constructor(n,t,r){super(n,t,Kn,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/300)%3,s=Math.ceil((Kn-this.elapsed)/1e3),o=Math.max(1,Math.min(2,s));k(n,r-3,"[ DEPARTING BERTH ]","bright-cyan","black"),k(n,r+2,kr[i],"bright-black","black"),k(n,r+4,`CLEAR IN ${o}S`,"bright-black","black")}}function Cr(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function Ar(e,n){return Math.floor(e()*n)}function oe(e,n){return n[Ar(e,n.length)]}function ft(e,n){const{special:t,firstNames:r,lastNames:i}=n.npcNames;if(e()<.3&&t.length>0)return{giverName:oe(e,t)};const s=r.length>0?oe(e,r):"Unknown",o=i.length>0?oe(e,i):"Agent";return{giverName:`${s} ${o}`}}function Tr(e,n){return n.destinations.filter(t=>t.id!==e.id)}function Sr(e){return e.commodities.filter(n=>n.legal)}function Ir(e,n,t,r){const i=t.deliveryItems;if(i.length===0)return null;const s=Tr(n,t);if(s.length===0)return null;const o=oe(e,i),a=oe(e,s),l=ft(e,t),c=200,h=Math.floor(o.weightKg*1.5),d=c+h+Math.floor(e()*200);return{...l,id:r,type:"delivery",title:`Deliver: ${o.name}`,description:`A package needs transporting. Pick up the ${o.name} from ${n.name} and deliver it to ${a.name}. Handle with care.`,reward:d,issuingDestinationId:n.id,itemName:o.name,itemWeightKg:o.weightKg,pickupDestinationId:n.id,deliveryDestinationId:a.id}}function Er(e,n,t,r){const i=Sr(t);if(i.length===0)return null;const s=n.goodsBias.map(f=>f.toLowerCase()),o=[];for(const f of i){const g=s.some(y=>f.category.includes(y)||f.id.includes(y)||y.includes(f.category));o.push(f),g&&o.push(f)}const a=1+Math.floor(e()*2),l=[],c=new Set;for(let f=0;f<a;f++){let g=0;for(;g<10;){const y=oe(e,o);if(!c.has(y.id)){c.add(y.id);const v=1+Math.floor(e()*4);l.push({commodityId:y.id,qty:v});break}g++}}if(l.length===0)return null;const h=l.reduce((f,g)=>{const y=t.commodities.find(v=>v.id===g.commodityId);return f+((y==null?void 0:y.basePrice)??100)*g.qty},0),d=Math.floor(h*.4)+Math.floor(e()*150),u=ft(e,t),p=l.map(f=>{const g=t.commodities.find(y=>y.id===f.commodityId);return`${f.qty}× ${(g==null?void 0:g.name)??f.commodityId}`}).join(", ");return{...u,id:r,type:"supply",title:`Supply Run: ${n.name}`,description:`${n.name} needs supplies. Deliver ${p} to fulfil the contract.`,reward:d,issuingDestinationId:n.id,requirements:l,deliveryDestinationId:n.id}}function Mr(e,n,t){const r=Cr(t),i=3+Math.floor(r()*4),s=[];for(let o=0;o<i;o++){const a=`m-${(t>>>0).toString(16)}-${o}`,c=r()<.6?Ir(r,e,n,a):Er(r,e,n,a);c&&s.push(c)}return s}const Lr=100,Rr=2*60*1e3,Or=15*60*1e3;class Nr{constructor(n,t,r){this.traderStockCache=new Map,this.missionBoardCache=new Map,this.renderer=n,this.input=t,this.context=r;const i=mi(),s=ut(i.startingShip);this.player=new Ii({shipId:i.startingShip,driveId:s.defaultJumpDrive,credits:i.player.startingCredits,systemId:i.startingLocation.system,destinationId:i.startingLocation.destination}),this.currentScene=new vn(this.input,this.context,this.player,()=>this.goToStory())}tick(n){const t=Math.min(n,Lr),r=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(r),this.renderer.drawBuffer(r)}makeBuffer(){const n=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:n},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(n){const t=Date.now(),r=this.traderStockCache.get(n);if(r&&t-r.generatedAt<Rr)return r.entries;const i=fi(),s=4+Math.floor(Math.random()*3),o=[...i];for(let l=o.length-1;l>0;l--){const c=Math.floor(Math.random()*(l+1));[o[l],o[c]]=[o[c],o[l]]}const a=o.slice(0,s).map(l=>({commodityId:l.id,qty:1+Math.floor(Math.random()*8)}));return this.traderStockCache.set(n,{entries:a,generatedAt:t}),a}getOrCreateMissionBoard(n){const t=Date.now(),r=this.missionBoardCache.get(n);if(r&&t-r.generatedAt<Or)return r.specs;const i=U(n),s=P(),o=Math.floor(Math.random()*4294967295),a=Mr(i,s,o);return this.missionBoardCache.set(n,{specs:a,generatedAt:t}),a}onBuy(n,t,r){if(t<=0)return;const i=r.findIndex(c=>c.commodityId===n);if(i<0)return;const s=r[i];if(t>s.qty)return;const o=Z(n);if(!o)return;const a=t*o.basePrice;this.player.credits<a||this.player.cargoWeightKg+t*o.weightKg>this.player.cargoCapacity||(this.player.spendCredits(a),this.player.addCargo(n,t),s.qty-=t,s.qty<=0&&r.splice(i,1))}onSell(n,t,r){if(t<=0)return;const i=this.player.cargoHold.find(l=>l.commodityId===n);if(!i||i.qty<t)return;const s=Z(n);if(!s)return;const o=t*s.basePrice;this.player.addCredits(o),this.player.removeCargo(n,t);const a=r.find(l=>l.commodityId===n);a?a.qty+=t:r.push({commodityId:n,qty:t})}goToMainMenu(){this.currentScene=new vn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new vi(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new ki(this.input,this.context,this.player,this.player.destinationId,(n,t)=>{this.player.spendCredits(n),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToTakeOffOrUndock())}goToLandOrDock(){var t;const n=(t=U(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new pr(this.player,this.context,()=>this.goToStation()):n==="asteroid"?this.currentScene=new fr(this.player,this.context,()=>this.goToStation()):this.currentScene=new wr(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const n=(t=U(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new yr(this.player,this.context,()=>this.goToShip()):n==="asteroid"?this.currentScene=new _r(this.player,this.context,()=>this.goToShip()):this.currentScene=new xr(this.player,this.context,()=>this.goToShip())}goToTrader(){const n=this.player.destinationId,t=this.getOrCreateTraderStock(n);this.currentScene=new xi(this.input,this.context,this.player,n,t,(r,i)=>this.onBuy(r,i,t),(r,i)=>this.onSell(r,i,t),()=>this.goToStation(),()=>this.goToShip())}goToMissionBoard(){const n=this.player.destinationId;this.currentScene=new Ai(this.input,this.context,this.player,n,()=>this.getOrCreateMissionBoard(n),t=>this.goToMissionDetail(t,n),()=>this.goToStation(),()=>this.goToShip())}goToMissionDetail(n,t){this.currentScene=new Mi(this.input,this.context,this.player,n,r=>this.onMissionAccepted(n,r,t),()=>this.goToMissionBoard())}onMissionAccepted(n,t,r){const i=this.missionBoardCache.get(r);if(i){const s=i.specs.findIndex(o=>o.id===n.id);s>=0&&i.specs.splice(s,1)}this.player.acceptMission(n,t),this.goToMissionBoard()}goToShip(){this.currentScene=new Qi(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo())}goToCargo(){this.currentScene=new Zi(this.input,this.context,this.player,()=>this.goToShip())}goToTravelMenu(){this.currentScene=new Ln(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap())}goToArrival(){this.currentScene=new Ln(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap())}goToGalaxyMap(){this.currentScene=new lr(this.input,this.context,this.player,()=>this.goToTravelMenu())}goToFlyIntoSpace(){this.player.undock(),this.currentScene=new Hn(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(n){this.player.dock(n),this.currentScene=new Hn(this.player,this.context,()=>this.goToShip())}onJumpSelected(n){const t=Me(this.player.systemId,n),r=dt(this.player.driveId),i=Math.ceil(mt*t.distance*r.fuelEfficiency);this.player.consumeFuel(i),this.player.jumpTo(n),this.currentScene=new hr(this.player,this.context,()=>this.goToArrival())}}const Fr=`---
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
`,Dr=`---
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
`,Pr=`---
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
`,Ur=`---
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
`,Br=`---
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
`,Hr=`---
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
`,$r=`---
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
`,Gr=`---
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
`,Wr=`---
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
`,jr=`---
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
`,Yr=`---
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
`,Kr=`---
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
`,qr=`---
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
`,Vr=`---
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
`,zr=`---
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
`,Xr=`---
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
`,Jr=`---
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
`,Qr=`---
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
`,Zr=`---
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
`,eo=`---
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
`,no=`---
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
`,to=`---
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
`,io=`---
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
`,ro=`---
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
`,oo=`---
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
`,so=`---
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
`,ao=`---
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
`,lo=`---
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
`,co=`---
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
`,ho=`---
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
`,uo=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,po=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,mo=`---
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
`,fo=`---
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
`,go=`---
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
`,yo=`---
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

Long range engines for faster than light travel between systems.`,bo=`---
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
`,_o=`---
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
`,vo=`---
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
`,wo=`---
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
`,ko=`---
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
`,xo=`---
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
`,Co=`---
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
`,Ao=`---
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
`,To=`---
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
`,So=`---
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
`,Io=`---
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
`,Eo=`---
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
`,Mo=`---
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
`,Lo=`---
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
`,Ro=`---
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
`,Oo=`---
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
`;var T={},_e={},B={};function gt(e){return typeof e>"u"||e===null}function No(e){return typeof e=="object"&&e!==null}function Fo(e){return Array.isArray(e)?e:gt(e)?[]:[e]}function Do(e,n){var t,r,i,s;if(n)for(s=Object.keys(n),t=0,r=s.length;t<r;t+=1)i=s[t],e[i]=n[i];return e}function Po(e,n){var t="",r;for(r=0;r<n;r+=1)t+=e;return t}function Uo(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}B.isNothing=gt;B.isObject=No;B.toArray=Fo;B.repeat=Po;B.isNegativeZero=Uo;B.extend=Do;function fe(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}fe.prototype=Object.create(Error.prototype);fe.prototype.constructor=fe;fe.prototype.toString=function(n){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!n&&this.mark&&(t+=" "+this.mark.toString()),t};var ve=fe,qn=B;function ln(e,n,t,r,i){this.name=e,this.buffer=n,this.position=t,this.line=r,this.column=i}ln.prototype.getSnippet=function(n,t){var r,i,s,o,a;if(!this.buffer)return null;for(n=n||4,t=t||75,r="",i=this.position;i>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(i-1))===-1;)if(i-=1,this.position-i>t/2-1){r=" ... ",i+=5;break}for(s="",o=this.position;o<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(o))===-1;)if(o+=1,o-this.position>t/2-1){s=" ... ",o-=5;break}return a=this.buffer.slice(i,o),qn.repeat(" ",n)+r+a+s+`
`+qn.repeat(" ",n+this.position-i+r.length)+"^"};ln.prototype.toString=function(n){var t,r="";return this.name&&(r+='in "'+this.name+'" '),r+="at line "+(this.line+1)+", column "+(this.column+1),n||(t=this.getSnippet(),t&&(r+=`:
`+t)),r};var Bo=ln,Vn=ve,Ho=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],$o=["scalar","sequence","mapping"];function Go(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(r){n[String(r)]=t})}),n}function Wo(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(Ho.indexOf(t)===-1)throw new Vn('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=Go(n.styleAliases||null),$o.indexOf(this.kind)===-1)throw new Vn('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var M=Wo,zn=B,Le=ve,jo=M;function tn(e,n,t){var r=[];return e.include.forEach(function(i){t=tn(i,n,t)}),e[n].forEach(function(i){t.forEach(function(s,o){s.tag===i.tag&&s.kind===i.kind&&r.push(o)}),t.push(i)}),t.filter(function(i,s){return r.indexOf(s)===-1})}function Yo(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,t;function r(i){e[i.kind][i.tag]=e.fallback[i.tag]=i}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(r);return e}function te(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new Le("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=tn(this,"implicit",[]),this.compiledExplicit=tn(this,"explicit",[]),this.compiledTypeMap=Yo(this.compiledImplicit,this.compiledExplicit)}te.DEFAULT=null;te.create=function(){var n,t;switch(arguments.length){case 1:n=te.DEFAULT,t=arguments[0];break;case 2:n=arguments[0],t=arguments[1];break;default:throw new Le("Wrong number of arguments for Schema.create function")}if(n=zn.toArray(n),t=zn.toArray(t),!n.every(function(r){return r instanceof te}))throw new Le("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(r){return r instanceof jo}))throw new Le("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new te({include:n,explicit:t})};var le=te,Ko=M,qo=new Ko("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),Vo=M,zo=new Vo("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Xo=M,Jo=new Xo("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Qo=le,cn=new Qo({explicit:[qo,zo,Jo]}),Zo=M;function es(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function ns(){return null}function ts(e){return e===null}var is=new Zo("tag:yaml.org,2002:null",{kind:"scalar",resolve:es,construct:ns,predicate:ts,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),rs=M;function os(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function ss(e){return e==="true"||e==="True"||e==="TRUE"}function as(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var ls=new rs("tag:yaml.org,2002:bool",{kind:"scalar",resolve:os,construct:ss,predicate:as,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),cs=B,hs=M;function ds(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function us(e){return 48<=e&&e<=55}function ps(e){return 48<=e&&e<=57}function ms(e){if(e===null)return!1;var n=e.length,t=0,r=!1,i;if(!n)return!1;if(i=e[t],(i==="-"||i==="+")&&(i=e[++t]),i==="0"){if(t+1===n)return!0;if(i=e[++t],i==="b"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(i!=="0"&&i!=="1")return!1;r=!0}return r&&i!=="_"}if(i==="x"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(!ds(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}for(;t<n;t++)if(i=e[t],i!=="_"){if(!us(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}if(i==="_")return!1;for(;t<n;t++)if(i=e[t],i!=="_"){if(i===":")break;if(!ps(e.charCodeAt(t)))return!1;r=!0}return!r||i==="_"?!1:i!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function fs(e){var n=e,t=1,r,i,s=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),r=n[0],(r==="-"||r==="+")&&(r==="-"&&(t=-1),n=n.slice(1),r=n[0]),n==="0"?0:r==="0"?n[1]==="b"?t*parseInt(n.slice(2),2):n[1]==="x"?t*parseInt(n,16):t*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(o){s.unshift(parseInt(o,10))}),n=0,i=1,s.forEach(function(o){n+=o*i,i*=60}),t*n):t*parseInt(n,10)}function gs(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!cs.isNegativeZero(e)}var ys=new hs("tag:yaml.org,2002:int",{kind:"scalar",resolve:ms,construct:fs,predicate:gs,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),yt=B,bs=M,_s=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function vs(e){return!(e===null||!_s.test(e)||e[e.length-1]==="_")}function ws(e){var n,t,r,i;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,i=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(s){i.unshift(parseFloat(s,10))}),n=0,r=1,i.forEach(function(s){n+=s*r,r*=60}),t*n):t*parseFloat(n,10)}var ks=/^[-+]?[0-9]+e/;function xs(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(yt.isNegativeZero(e))return"-0.0";return t=e.toString(10),ks.test(t)?t.replace("e",".e"):t}function Cs(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||yt.isNegativeZero(e))}var As=new bs("tag:yaml.org,2002:float",{kind:"scalar",resolve:vs,construct:ws,predicate:Cs,represent:xs,defaultStyle:"lowercase"}),Ts=le,bt=new Ts({include:[cn],implicit:[is,ls,ys,As]}),Ss=le,_t=new Ss({include:[bt]}),Is=M,vt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),wt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Es(e){return e===null?!1:vt.exec(e)!==null||wt.exec(e)!==null}function Ms(e){var n,t,r,i,s,o,a,l=0,c=null,h,d,u;if(n=vt.exec(e),n===null&&(n=wt.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],r=+n[2]-1,i=+n[3],!n[4])return new Date(Date.UTC(t,r,i));if(s=+n[4],o=+n[5],a=+n[6],n[7]){for(l=n[7].slice(0,3);l.length<3;)l+="0";l=+l}return n[9]&&(h=+n[10],d=+(n[11]||0),c=(h*60+d)*6e4,n[9]==="-"&&(c=-c)),u=new Date(Date.UTC(t,r,i,s,o,a,l)),c&&u.setTime(u.getTime()-c),u}function Ls(e){return e.toISOString()}var Rs=new Is("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Es,construct:Ms,instanceOf:Date,represent:Ls}),Os=M;function Ns(e){return e==="<<"||e===null}var Fs=new Os("tag:yaml.org,2002:merge",{kind:"scalar",resolve:Ns});function kt(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var J;try{var Ds=kt;J=Ds("buffer").Buffer}catch{}var Ps=M,hn=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Us(e){if(e===null)return!1;var n,t,r=0,i=e.length,s=hn;for(t=0;t<i;t++)if(n=s.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;r+=6}return r%8===0}function Bs(e){var n,t,r=e.replace(/[\r\n=]/g,""),i=r.length,s=hn,o=0,a=[];for(n=0;n<i;n++)n%4===0&&n&&(a.push(o>>16&255),a.push(o>>8&255),a.push(o&255)),o=o<<6|s.indexOf(r.charAt(n));return t=i%4*6,t===0?(a.push(o>>16&255),a.push(o>>8&255),a.push(o&255)):t===18?(a.push(o>>10&255),a.push(o>>2&255)):t===12&&a.push(o>>4&255),J?J.from?J.from(a):new J(a):a}function Hs(e){var n="",t=0,r,i,s=e.length,o=hn;for(r=0;r<s;r++)r%3===0&&r&&(n+=o[t>>18&63],n+=o[t>>12&63],n+=o[t>>6&63],n+=o[t&63]),t=(t<<8)+e[r];return i=s%3,i===0?(n+=o[t>>18&63],n+=o[t>>12&63],n+=o[t>>6&63],n+=o[t&63]):i===2?(n+=o[t>>10&63],n+=o[t>>4&63],n+=o[t<<2&63],n+=o[64]):i===1&&(n+=o[t>>2&63],n+=o[t<<4&63],n+=o[64],n+=o[64]),n}function $s(e){return J&&J.isBuffer(e)}var Gs=new Ps("tag:yaml.org,2002:binary",{kind:"scalar",resolve:Us,construct:Bs,predicate:$s,represent:Hs}),Ws=M,js=Object.prototype.hasOwnProperty,Ys=Object.prototype.toString;function Ks(e){if(e===null)return!0;var n=[],t,r,i,s,o,a=e;for(t=0,r=a.length;t<r;t+=1){if(i=a[t],o=!1,Ys.call(i)!=="[object Object]")return!1;for(s in i)if(js.call(i,s))if(!o)o=!0;else return!1;if(!o)return!1;if(n.indexOf(s)===-1)n.push(s);else return!1}return!0}function qs(e){return e!==null?e:[]}var Vs=new Ws("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Ks,construct:qs}),zs=M,Xs=Object.prototype.toString;function Js(e){if(e===null)return!0;var n,t,r,i,s,o=e;for(s=new Array(o.length),n=0,t=o.length;n<t;n+=1){if(r=o[n],Xs.call(r)!=="[object Object]"||(i=Object.keys(r),i.length!==1))return!1;s[n]=[i[0],r[i[0]]]}return!0}function Qs(e){if(e===null)return[];var n,t,r,i,s,o=e;for(s=new Array(o.length),n=0,t=o.length;n<t;n+=1)r=o[n],i=Object.keys(r),s[n]=[i[0],r[i[0]]];return s}var Zs=new zs("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Js,construct:Qs}),ea=M,na=Object.prototype.hasOwnProperty;function ta(e){if(e===null)return!0;var n,t=e;for(n in t)if(na.call(t,n)&&t[n]!==null)return!1;return!0}function ia(e){return e!==null?e:{}}var ra=new ea("tag:yaml.org,2002:set",{kind:"mapping",resolve:ta,construct:ia}),oa=le,we=new oa({include:[_t],implicit:[Rs,Fs],explicit:[Gs,Vs,Zs,ra]}),sa=M;function aa(){return!0}function la(){}function ca(){return""}function ha(e){return typeof e>"u"}var da=new sa("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:aa,construct:la,predicate:ha,represent:ca}),ua=M;function pa(e){if(e===null||e.length===0)return!1;var n=e,t=/\/([gim]*)$/.exec(e),r="";return!(n[0]==="/"&&(t&&(r=t[1]),r.length>3||n[n.length-r.length-1]!=="/"))}function ma(e){var n=e,t=/\/([gim]*)$/.exec(e),r="";return n[0]==="/"&&(t&&(r=t[1]),n=n.slice(1,n.length-r.length-1)),new RegExp(n,r)}function fa(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function ga(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var ya=new ua("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:pa,construct:ma,predicate:ga,represent:fa}),Ne;try{var ba=kt;Ne=ba("esprima")}catch{typeof window<"u"&&(Ne=window.esprima)}var _a=M;function va(e){if(e===null)return!1;try{var n="("+e+")",t=Ne.parse(n,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function wa(e){var n="("+e+")",t=Ne.parse(n,{range:!0}),r=[],i;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(s){r.push(s.name)}),i=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(r,n.slice(i[0]+1,i[1]-1)):new Function(r,"return "+n.slice(i[0],i[1]))}function ka(e){return e.toString()}function xa(e){return Object.prototype.toString.call(e)==="[object Function]"}var Ca=new _a("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:va,construct:wa,predicate:xa,represent:ka}),Xn=le,Ue=Xn.DEFAULT=new Xn({include:[we],explicit:[da,ya,Ca]}),j=B,xt=ve,Aa=Bo,Ct=we,Ta=Ue,V=Object.prototype.hasOwnProperty,Fe=1,At=2,Tt=3,De=4,Ze=1,Sa=2,Jn=3,Ia=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Ea=/[\x85\u2028\u2029]/,Ma=/[,\[\]\{\}]/,St=/^(?:!|!!|![a-z\-]+!)$/i,It=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function Qn(e){return Object.prototype.toString.call(e)}function G(e){return e===10||e===13}function Q(e){return e===9||e===32}function N(e){return e===9||e===32||e===10||e===13}function ie(e){return e===44||e===91||e===93||e===123||e===125}function La(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function Ra(e){return e===120?2:e===117?4:e===85?8:0}function Oa(e){return 48<=e&&e<=57?e-48:-1}function Zn(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function Na(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function Et(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var Mt=new Array(256),Lt=new Array(256);for(var ne=0;ne<256;ne++)Mt[ne]=Zn(ne)?1:0,Lt[ne]=Zn(ne);function Fa(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||Ta,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function Rt(e,n){return new xt(n,new Aa(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function _(e,n){throw Rt(e,n)}function Pe(e,n){e.onWarning&&e.onWarning.call(null,Rt(e,n))}var et={YAML:function(n,t,r){var i,s,o;n.version!==null&&_(n,"duplication of %YAML directive"),r.length!==1&&_(n,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(r[0]),i===null&&_(n,"ill-formed argument of the YAML directive"),s=parseInt(i[1],10),o=parseInt(i[2],10),s!==1&&_(n,"unacceptable YAML version of the document"),n.version=r[0],n.checkLineBreaks=o<2,o!==1&&o!==2&&Pe(n,"unsupported YAML version of the document")},TAG:function(n,t,r){var i,s;r.length!==2&&_(n,"TAG directive accepts exactly two arguments"),i=r[0],s=r[1],St.test(i)||_(n,"ill-formed tag handle (first argument) of the TAG directive"),V.call(n.tagMap,i)&&_(n,'there is a previously declared suffix for "'+i+'" tag handle'),It.test(s)||_(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[i]=s}};function q(e,n,t,r){var i,s,o,a;if(n<t){if(a=e.input.slice(n,t),r)for(i=0,s=a.length;i<s;i+=1)o=a.charCodeAt(i),o===9||32<=o&&o<=1114111||_(e,"expected valid JSON character");else Ia.test(a)&&_(e,"the stream contains non-printable characters");e.result+=a}}function nt(e,n,t,r){var i,s,o,a;for(j.isObject(t)||_(e,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(t),o=0,a=i.length;o<a;o+=1)s=i[o],V.call(n,s)||(Et(n,s,t[s]),r[s]=!0)}function re(e,n,t,r,i,s,o,a){var l,c;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),l=0,c=i.length;l<c;l+=1)Array.isArray(i[l])&&_(e,"nested arrays are not supported inside keys"),typeof i=="object"&&Qn(i[l])==="[object Object]"&&(i[l]="[object Object]");if(typeof i=="object"&&Qn(i)==="[object Object]"&&(i="[object Object]"),i=String(i),n===null&&(n={}),r==="tag:yaml.org,2002:merge")if(Array.isArray(s))for(l=0,c=s.length;l<c;l+=1)nt(e,n,s[l],t);else nt(e,n,s,t);else!e.json&&!V.call(t,i)&&V.call(n,i)&&(e.line=o||e.line,e.position=a||e.position,_(e,"duplicated mapping key")),Et(n,i,s),delete t[i];return n}function dn(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):_(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function I(e,n,t){for(var r=0,i=e.input.charCodeAt(e.position);i!==0;){for(;Q(i);)i=e.input.charCodeAt(++e.position);if(n&&i===35)do i=e.input.charCodeAt(++e.position);while(i!==10&&i!==13&&i!==0);if(G(i))for(dn(e),i=e.input.charCodeAt(e.position),r++,e.lineIndent=0;i===32;)e.lineIndent++,i=e.input.charCodeAt(++e.position);else break}return t!==-1&&r!==0&&e.lineIndent<t&&Pe(e,"deficient indentation"),r}function Be(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||N(t)))}function un(e,n){n===1?e.result+=" ":n>1&&(e.result+=j.repeat(`
`,n-1))}function Da(e,n,t){var r,i,s,o,a,l,c,h,d=e.kind,u=e.result,p;if(p=e.input.charCodeAt(e.position),N(p)||ie(p)||p===35||p===38||p===42||p===33||p===124||p===62||p===39||p===34||p===37||p===64||p===96||(p===63||p===45)&&(i=e.input.charCodeAt(e.position+1),N(i)||t&&ie(i)))return!1;for(e.kind="scalar",e.result="",s=o=e.position,a=!1;p!==0;){if(p===58){if(i=e.input.charCodeAt(e.position+1),N(i)||t&&ie(i))break}else if(p===35){if(r=e.input.charCodeAt(e.position-1),N(r))break}else{if(e.position===e.lineStart&&Be(e)||t&&ie(p))break;if(G(p))if(l=e.line,c=e.lineStart,h=e.lineIndent,I(e,!1,-1),e.lineIndent>=n){a=!0,p=e.input.charCodeAt(e.position);continue}else{e.position=o,e.line=l,e.lineStart=c,e.lineIndent=h;break}}a&&(q(e,s,o,!1),un(e,e.line-l),s=o=e.position,a=!1),Q(p)||(o=e.position+1),p=e.input.charCodeAt(++e.position)}return q(e,s,o,!1),e.result?!0:(e.kind=d,e.result=u,!1)}function Pa(e,n){var t,r,i;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,r=i=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(q(e,r,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)r=e.position,e.position++,i=e.position;else return!0;else G(t)?(q(e,r,i,!0),un(e,I(e,!1,n)),r=i=e.position):e.position===e.lineStart&&Be(e)?_(e,"unexpected end of the document within a single quoted scalar"):(e.position++,i=e.position);_(e,"unexpected end of the stream within a single quoted scalar")}function Ua(e,n){var t,r,i,s,o,a;if(a=e.input.charCodeAt(e.position),a!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=r=e.position;(a=e.input.charCodeAt(e.position))!==0;){if(a===34)return q(e,t,e.position,!0),e.position++,!0;if(a===92){if(q(e,t,e.position,!0),a=e.input.charCodeAt(++e.position),G(a))I(e,!1,n);else if(a<256&&Mt[a])e.result+=Lt[a],e.position++;else if((o=Ra(a))>0){for(i=o,s=0;i>0;i--)a=e.input.charCodeAt(++e.position),(o=La(a))>=0?s=(s<<4)+o:_(e,"expected hexadecimal character");e.result+=Na(s),e.position++}else _(e,"unknown escape sequence");t=r=e.position}else G(a)?(q(e,t,r,!0),un(e,I(e,!1,n)),t=r=e.position):e.position===e.lineStart&&Be(e)?_(e,"unexpected end of the document within a double quoted scalar"):(e.position++,r=e.position)}_(e,"unexpected end of the stream within a double quoted scalar")}function Ba(e,n){var t=!0,r,i=e.tag,s,o=e.anchor,a,l,c,h,d,u={},p,f,g,y;if(y=e.input.charCodeAt(e.position),y===91)l=93,d=!1,s=[];else if(y===123)l=125,d=!0,s={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=s),y=e.input.charCodeAt(++e.position);y!==0;){if(I(e,!0,n),y=e.input.charCodeAt(e.position),y===l)return e.position++,e.tag=i,e.anchor=o,e.kind=d?"mapping":"sequence",e.result=s,!0;t||_(e,"missed comma between flow collection entries"),f=p=g=null,c=h=!1,y===63&&(a=e.input.charCodeAt(e.position+1),N(a)&&(c=h=!0,e.position++,I(e,!0,n))),r=e.line,se(e,n,Fe,!1,!0),f=e.tag,p=e.result,I(e,!0,n),y=e.input.charCodeAt(e.position),(h||e.line===r)&&y===58&&(c=!0,y=e.input.charCodeAt(++e.position),I(e,!0,n),se(e,n,Fe,!1,!0),g=e.result),d?re(e,s,u,f,p,g):c?s.push(re(e,null,u,f,p,g)):s.push(p),I(e,!0,n),y=e.input.charCodeAt(e.position),y===44?(t=!0,y=e.input.charCodeAt(++e.position)):t=!1}_(e,"unexpected end of the stream within a flow collection")}function Ha(e,n){var t,r,i=Ze,s=!1,o=!1,a=n,l=0,c=!1,h,d;if(d=e.input.charCodeAt(e.position),d===124)r=!1;else if(d===62)r=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)Ze===i?i=d===43?Jn:Sa:_(e,"repeat of a chomping mode identifier");else if((h=Oa(d))>=0)h===0?_(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):o?_(e,"repeat of an indentation width identifier"):(a=n+h-1,o=!0);else break;if(Q(d)){do d=e.input.charCodeAt(++e.position);while(Q(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!G(d)&&d!==0)}for(;d!==0;){for(dn(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!o||e.lineIndent<a)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!o&&e.lineIndent>a&&(a=e.lineIndent),G(d)){l++;continue}if(e.lineIndent<a){i===Jn?e.result+=j.repeat(`
`,s?1+l:l):i===Ze&&s&&(e.result+=`
`);break}for(r?Q(d)?(c=!0,e.result+=j.repeat(`
`,s?1+l:l)):c?(c=!1,e.result+=j.repeat(`
`,l+1)):l===0?s&&(e.result+=" "):e.result+=j.repeat(`
`,l):e.result+=j.repeat(`
`,s?1+l:l),s=!0,o=!0,l=0,t=e.position;!G(d)&&d!==0;)d=e.input.charCodeAt(++e.position);q(e,t,e.position,!1)}return!0}function tt(e,n){var t,r=e.tag,i=e.anchor,s=[],o,a=!1,l;for(e.anchor!==null&&(e.anchorMap[e.anchor]=s),l=e.input.charCodeAt(e.position);l!==0&&!(l!==45||(o=e.input.charCodeAt(e.position+1),!N(o)));){if(a=!0,e.position++,I(e,!0,-1)&&e.lineIndent<=n){s.push(null),l=e.input.charCodeAt(e.position);continue}if(t=e.line,se(e,n,Tt,!1,!0),s.push(e.result),I(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&l!==0)_(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return a?(e.tag=r,e.anchor=i,e.kind="sequence",e.result=s,!0):!1}function $a(e,n,t){var r,i,s,o,a=e.tag,l=e.anchor,c={},h={},d=null,u=null,p=null,f=!1,g=!1,y;for(e.anchor!==null&&(e.anchorMap[e.anchor]=c),y=e.input.charCodeAt(e.position);y!==0;){if(r=e.input.charCodeAt(e.position+1),s=e.line,o=e.position,(y===63||y===58)&&N(r))y===63?(f&&(re(e,c,h,d,u,null),d=u=p=null),g=!0,f=!0,i=!0):f?(f=!1,i=!0):_(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,y=r;else if(se(e,t,At,!1,!0))if(e.line===s){for(y=e.input.charCodeAt(e.position);Q(y);)y=e.input.charCodeAt(++e.position);if(y===58)y=e.input.charCodeAt(++e.position),N(y)||_(e,"a whitespace character is expected after the key-value separator within a block mapping"),f&&(re(e,c,h,d,u,null),d=u=p=null),g=!0,f=!1,i=!1,d=e.tag,u=e.result;else if(g)_(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=a,e.anchor=l,!0}else if(g)_(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=a,e.anchor=l,!0;else break;if((e.line===s||e.lineIndent>n)&&(se(e,n,De,!0,i)&&(f?u=e.result:p=e.result),f||(re(e,c,h,d,u,p,s,o),d=u=p=null),I(e,!0,-1),y=e.input.charCodeAt(e.position)),e.lineIndent>n&&y!==0)_(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return f&&re(e,c,h,d,u,null),g&&(e.tag=a,e.anchor=l,e.kind="mapping",e.result=c),g}function Ga(e){var n,t=!1,r=!1,i,s,o;if(o=e.input.charCodeAt(e.position),o!==33)return!1;if(e.tag!==null&&_(e,"duplication of a tag property"),o=e.input.charCodeAt(++e.position),o===60?(t=!0,o=e.input.charCodeAt(++e.position)):o===33?(r=!0,i="!!",o=e.input.charCodeAt(++e.position)):i="!",n=e.position,t){do o=e.input.charCodeAt(++e.position);while(o!==0&&o!==62);e.position<e.length?(s=e.input.slice(n,e.position),o=e.input.charCodeAt(++e.position)):_(e,"unexpected end of the stream within a verbatim tag")}else{for(;o!==0&&!N(o);)o===33&&(r?_(e,"tag suffix cannot contain exclamation marks"):(i=e.input.slice(n-1,e.position+1),St.test(i)||_(e,"named tag handle cannot contain such characters"),r=!0,n=e.position+1)),o=e.input.charCodeAt(++e.position);s=e.input.slice(n,e.position),Ma.test(s)&&_(e,"tag suffix cannot contain flow indicator characters")}return s&&!It.test(s)&&_(e,"tag name cannot contain such characters: "+s),t?e.tag=s:V.call(e.tagMap,i)?e.tag=e.tagMap[i]+s:i==="!"?e.tag="!"+s:i==="!!"?e.tag="tag:yaml.org,2002:"+s:_(e,'undeclared tag handle "'+i+'"'),!0}function Wa(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&_(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!N(t)&&!ie(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&_(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function ja(e){var n,t,r;if(r=e.input.charCodeAt(e.position),r!==42)return!1;for(r=e.input.charCodeAt(++e.position),n=e.position;r!==0&&!N(r)&&!ie(r);)r=e.input.charCodeAt(++e.position);return e.position===n&&_(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),V.call(e.anchorMap,t)||_(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],I(e,!0,-1),!0}function se(e,n,t,r,i){var s,o,a,l=1,c=!1,h=!1,d,u,p,f,g;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,s=o=a=De===t||Tt===t,r&&I(e,!0,-1)&&(c=!0,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)),l===1)for(;Ga(e)||Wa(e);)I(e,!0,-1)?(c=!0,a=s,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)):a=!1;if(a&&(a=c||i),(l===1||De===t)&&(Fe===t||At===t?f=n:f=n+1,g=e.position-e.lineStart,l===1?a&&(tt(e,g)||$a(e,g,f))||Ba(e,f)?h=!0:(o&&Ha(e,f)||Pa(e,f)||Ua(e,f)?h=!0:ja(e)?(h=!0,(e.tag!==null||e.anchor!==null)&&_(e,"alias node should not have any properties")):Da(e,f,Fe===t)&&(h=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(h=a&&tt(e,g))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&_(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,u=e.implicitTypes.length;d<u;d+=1)if(p=e.implicitTypes[d],p.resolve(e.result)){e.result=p.construct(e.result),e.tag=p.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else V.call(e.typeMap[e.kind||"fallback"],e.tag)?(p=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&p.kind!==e.kind&&_(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+p.kind+'", not "'+e.kind+'"'),p.resolve(e.result)?(e.result=p.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):_(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):_(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||h}function Ya(e){var n=e.position,t,r,i,s=!1,o;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(o=e.input.charCodeAt(e.position))!==0&&(I(e,!0,-1),o=e.input.charCodeAt(e.position),!(e.lineIndent>0||o!==37));){for(s=!0,o=e.input.charCodeAt(++e.position),t=e.position;o!==0&&!N(o);)o=e.input.charCodeAt(++e.position);for(r=e.input.slice(t,e.position),i=[],r.length<1&&_(e,"directive name must not be less than one character in length");o!==0;){for(;Q(o);)o=e.input.charCodeAt(++e.position);if(o===35){do o=e.input.charCodeAt(++e.position);while(o!==0&&!G(o));break}if(G(o))break;for(t=e.position;o!==0&&!N(o);)o=e.input.charCodeAt(++e.position);i.push(e.input.slice(t,e.position))}o!==0&&dn(e),V.call(et,r)?et[r](e,r,i):Pe(e,'unknown document directive "'+r+'"')}if(I(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,I(e,!0,-1)):s&&_(e,"directives end mark is expected"),se(e,e.lineIndent-1,De,!1,!0),I(e,!0,-1),e.checkLineBreaks&&Ea.test(e.input.slice(n,e.position))&&Pe(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&Be(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,I(e,!0,-1));return}if(e.position<e.length-1)_(e,"end of the stream or a document separator is expected");else return}function Ot(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new Fa(e,n),r=e.indexOf("\0");for(r!==-1&&(t.position=r,_(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)Ya(t);return t.documents}function Nt(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var r=Ot(e,t);if(typeof n!="function")return r;for(var i=0,s=r.length;i<s;i+=1)n(r[i])}function Ft(e,n){var t=Ot(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new xt("expected a single document in the stream, but found more")}}function Ka(e,n,t){return typeof n=="object"&&n!==null&&typeof t>"u"&&(t=n,n=null),Nt(e,n,j.extend({schema:Ct},t))}function qa(e,n){return Ft(e,j.extend({schema:Ct},n))}_e.loadAll=Nt;_e.load=Ft;_e.safeLoadAll=Ka;_e.safeLoad=qa;var pn={},ke=B,xe=ve,Va=Ue,za=we,Dt=Object.prototype.toString,Pt=Object.prototype.hasOwnProperty,Xa=9,ge=10,Ja=13,Qa=32,Za=33,el=34,Ut=35,nl=37,tl=38,il=39,rl=42,Bt=44,ol=45,Ht=58,sl=61,al=62,ll=63,cl=64,$t=91,Gt=93,hl=96,Wt=123,dl=124,jt=125,O={};O[0]="\\0";O[7]="\\a";O[8]="\\b";O[9]="\\t";O[10]="\\n";O[11]="\\v";O[12]="\\f";O[13]="\\r";O[27]="\\e";O[34]='\\"';O[92]="\\\\";O[133]="\\N";O[160]="\\_";O[8232]="\\L";O[8233]="\\P";var ul=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function pl(e,n){var t,r,i,s,o,a,l;if(n===null)return{};for(t={},r=Object.keys(n),i=0,s=r.length;i<s;i+=1)o=r[i],a=String(n[o]),o.slice(0,2)==="!!"&&(o="tag:yaml.org,2002:"+o.slice(2)),l=e.compiledTypeMap.fallback[o],l&&Pt.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[o]=a;return t}function it(e){var n,t,r;if(n=e.toString(16).toUpperCase(),e<=255)t="x",r=2;else if(e<=65535)t="u",r=4;else if(e<=4294967295)t="U",r=8;else throw new xe("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+ke.repeat("0",r-n.length)+n}function ml(e){this.schema=e.schema||Va,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=ke.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=pl(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function rt(e,n){for(var t=ke.repeat(" ",n),r=0,i=-1,s="",o,a=e.length;r<a;)i=e.indexOf(`
`,r),i===-1?(o=e.slice(r),r=a):(o=e.slice(r,i+1),r=i+1),o.length&&o!==`
`&&(s+=t),s+=o;return s}function rn(e,n){return`
`+ke.repeat(" ",e.indent*n)}function fl(e,n){var t,r,i;for(t=0,r=e.implicitTypes.length;t<r;t+=1)if(i=e.implicitTypes[t],i.resolve(n))return!0;return!1}function mn(e){return e===Qa||e===Xa}function ae(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function gl(e){return ae(e)&&!mn(e)&&e!==65279&&e!==Ja&&e!==ge}function ot(e,n){return ae(e)&&e!==65279&&e!==Bt&&e!==$t&&e!==Gt&&e!==Wt&&e!==jt&&e!==Ht&&(e!==Ut||n&&gl(n))}function yl(e){return ae(e)&&e!==65279&&!mn(e)&&e!==ol&&e!==ll&&e!==Ht&&e!==Bt&&e!==$t&&e!==Gt&&e!==Wt&&e!==jt&&e!==Ut&&e!==tl&&e!==rl&&e!==Za&&e!==dl&&e!==sl&&e!==al&&e!==il&&e!==el&&e!==nl&&e!==cl&&e!==hl}function Yt(e){var n=/^\n* /;return n.test(e)}var Kt=1,qt=2,Vt=3,zt=4,Re=5;function bl(e,n,t,r,i){var s,o,a,l=!1,c=!1,h=r!==-1,d=-1,u=yl(e.charCodeAt(0))&&!mn(e.charCodeAt(e.length-1));if(n)for(s=0;s<e.length;s++){if(o=e.charCodeAt(s),!ae(o))return Re;a=s>0?e.charCodeAt(s-1):null,u=u&&ot(o,a)}else{for(s=0;s<e.length;s++){if(o=e.charCodeAt(s),o===ge)l=!0,h&&(c=c||s-d-1>r&&e[d+1]!==" ",d=s);else if(!ae(o))return Re;a=s>0?e.charCodeAt(s-1):null,u=u&&ot(o,a)}c=c||h&&s-d-1>r&&e[d+1]!==" "}return!l&&!c?u&&!i(e)?Kt:qt:t>9&&Yt(e)?Re:c?zt:Vt}function _l(e,n,t,r){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&ul.indexOf(n)!==-1)return"'"+n+"'";var i=e.indent*Math.max(1,t),s=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-i),o=r||e.flowLevel>-1&&t>=e.flowLevel;function a(l){return fl(e,l)}switch(bl(n,o,e.indent,s,a)){case Kt:return n;case qt:return"'"+n.replace(/'/g,"''")+"'";case Vt:return"|"+st(n,e.indent)+at(rt(n,i));case zt:return">"+st(n,e.indent)+at(rt(vl(n,s),i));case Re:return'"'+wl(n)+'"';default:throw new xe("impossible error: invalid scalar style")}}()}function st(e,n){var t=Yt(e)?String(n):"",r=e[e.length-1]===`
`,i=r&&(e[e.length-2]===`
`||e===`
`),s=i?"+":r?"":"-";return t+s+`
`}function at(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function vl(e,n){for(var t=/(\n+)([^\n]*)/g,r=function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,t.lastIndex=c,lt(e.slice(0,c),n)}(),i=e[0]===`
`||e[0]===" ",s,o;o=t.exec(e);){var a=o[1],l=o[2];s=l[0]===" ",r+=a+(!i&&!s&&l!==""?`
`:"")+lt(l,n),i=s}return r}function lt(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,r,i=0,s,o=0,a=0,l="";r=t.exec(e);)a=r.index,a-i>n&&(s=o>i?o:a,l+=`
`+e.slice(i,s),i=s+1),o=a;return l+=`
`,e.length-i>n&&o>i?l+=e.slice(i,o)+`
`+e.slice(o+1):l+=e.slice(i),l.slice(1)}function wl(e){for(var n="",t,r,i,s=0;s<e.length;s++){if(t=e.charCodeAt(s),t>=55296&&t<=56319&&(r=e.charCodeAt(s+1),r>=56320&&r<=57343)){n+=it((t-55296)*1024+r-56320+65536),s++;continue}i=O[t],n+=!i&&ae(t)?e[s]:i||it(t)}return n}function kl(e,n,t){var r="",i=e.tag,s,o;for(s=0,o=t.length;s<o;s+=1)ee(e,n,t[s],!1,!1)&&(s!==0&&(r+=","+(e.condenseFlow?"":" ")),r+=e.dump);e.tag=i,e.dump="["+r+"]"}function xl(e,n,t,r){var i="",s=e.tag,o,a;for(o=0,a=t.length;o<a;o+=1)ee(e,n+1,t[o],!0,!0)&&((!r||o!==0)&&(i+=rn(e,n)),e.dump&&ge===e.dump.charCodeAt(0)?i+="-":i+="- ",i+=e.dump);e.tag=s,e.dump=i||"[]"}function Cl(e,n,t){var r="",i=e.tag,s=Object.keys(t),o,a,l,c,h;for(o=0,a=s.length;o<a;o+=1)h="",o!==0&&(h+=", "),e.condenseFlow&&(h+='"'),l=s[o],c=t[l],ee(e,n,l,!1,!1)&&(e.dump.length>1024&&(h+="? "),h+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),ee(e,n,c,!1,!1)&&(h+=e.dump,r+=h));e.tag=i,e.dump="{"+r+"}"}function Al(e,n,t,r){var i="",s=e.tag,o=Object.keys(t),a,l,c,h,d,u;if(e.sortKeys===!0)o.sort();else if(typeof e.sortKeys=="function")o.sort(e.sortKeys);else if(e.sortKeys)throw new xe("sortKeys must be a boolean or a function");for(a=0,l=o.length;a<l;a+=1)u="",(!r||a!==0)&&(u+=rn(e,n)),c=o[a],h=t[c],ee(e,n+1,c,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&ge===e.dump.charCodeAt(0)?u+="?":u+="? "),u+=e.dump,d&&(u+=rn(e,n)),ee(e,n+1,h,!0,d)&&(e.dump&&ge===e.dump.charCodeAt(0)?u+=":":u+=": ",u+=e.dump,i+=u));e.tag=s,e.dump=i||"{}"}function ct(e,n,t){var r,i,s,o,a,l;for(i=t?e.explicitTypes:e.implicitTypes,s=0,o=i.length;s<o;s+=1)if(a=i[s],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof n=="object"&&n instanceof a.instanceOf)&&(!a.predicate||a.predicate(n))){if(e.tag=t?a.tag:"?",a.represent){if(l=e.styleMap[a.tag]||a.defaultStyle,Dt.call(a.represent)==="[object Function]")r=a.represent(n,l);else if(Pt.call(a.represent,l))r=a.represent[l](n,l);else throw new xe("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');e.dump=r}return!0}return!1}function ee(e,n,t,r,i,s){e.tag=null,e.dump=t,ct(e,t,!1)||ct(e,t,!0);var o=Dt.call(e.dump);r&&(r=e.flowLevel<0||e.flowLevel>n);var a=o==="[object Object]"||o==="[object Array]",l,c;if(a&&(l=e.duplicates.indexOf(t),c=l!==-1),(e.tag!==null&&e.tag!=="?"||c||e.indent!==2&&n>0)&&(i=!1),c&&e.usedDuplicates[l])e.dump="*ref_"+l;else{if(a&&c&&!e.usedDuplicates[l]&&(e.usedDuplicates[l]=!0),o==="[object Object]")r&&Object.keys(e.dump).length!==0?(Al(e,n,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(Cl(e,n,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump));else if(o==="[object Array]"){var h=e.noArrayIndent&&n>0?n-1:n;r&&e.dump.length!==0?(xl(e,h,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(kl(e,h,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump))}else if(o==="[object String]")e.tag!=="?"&&_l(e,e.dump,n,s);else{if(e.skipInvalid)return!1;throw new xe("unacceptable kind of an object to dump "+o)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function Tl(e,n){var t=[],r=[],i,s;for(on(e,t,r),i=0,s=r.length;i<s;i+=1)n.duplicates.push(t[r[i]]);n.usedDuplicates=new Array(s)}function on(e,n,t){var r,i,s;if(e!==null&&typeof e=="object")if(i=n.indexOf(e),i!==-1)t.indexOf(i)===-1&&t.push(i);else if(n.push(e),Array.isArray(e))for(i=0,s=e.length;i<s;i+=1)on(e[i],n,t);else for(r=Object.keys(e),i=0,s=r.length;i<s;i+=1)on(e[r[i]],n,t)}function Xt(e,n){n=n||{};var t=new ml(n);return t.noRefs||Tl(e,t),ee(t,0,e,!0,!0)?t.dump+`
`:""}function Sl(e,n){return Xt(e,ke.extend({schema:za},n))}pn.dump=Xt;pn.safeDump=Sl;var He=_e,Jt=pn;function $e(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}T.Type=M;T.Schema=le;T.FAILSAFE_SCHEMA=cn;T.JSON_SCHEMA=bt;T.CORE_SCHEMA=_t;T.DEFAULT_SAFE_SCHEMA=we;T.DEFAULT_FULL_SCHEMA=Ue;T.load=He.load;T.loadAll=He.loadAll;T.safeLoad=He.safeLoad;T.safeLoadAll=He.safeLoadAll;T.dump=Jt.dump;T.safeDump=Jt.safeDump;T.YAMLException=ve;T.MINIMAL_SCHEMA=cn;T.SAFE_SCHEMA=we;T.DEFAULT_SCHEMA=Ue;T.scan=$e("scan");T.parse=$e("parse");T.compose=$e("compose");T.addConstructor=$e("addConstructor");var Il=T,El=Il;function Ml(e){if(!e.startsWith(`---
`))return{data:{},content:e};const n=e.indexOf(`
---`,4);if(n===-1)return{data:{},content:e};const t=e.slice(4,n),r=e.slice(n+4),i=r.startsWith(`
`)?r.slice(1):r;return{data:El.safeLoad(t)??{},content:i}}function Ll(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[],deliveryItems:[],npcNames:{special:[],firstNames:[],lastNames:[]}};for(const[t,r]of Object.entries(e)){const i=t.split("/").pop()??"";if(i==="_template.md"||i===".gitkeep")continue;const{data:s,content:o}=Ml(r);/^systems\/[^/]+\.md$/.test(t)?n.systems.push(Rl(s,o)):/^destinations\/[^/]+\.md$/.test(t)?n.destinations.push(Ol(s,o)):/^factions\/[^/]+\.md$/.test(t)?n.factions.push(Nl(s,o)):/^ships\/[^/]+\.md$/.test(t)?n.ships.push(Fl(s,o)):t==="ships/components/jump-drives.md"?n.drives=Dl(s):t==="navigation/jump-routes.md"?n.routes=Pl(s):t==="commodities.md"?n.commodities=Ul(s):/^story\/[^/]+\.md$/.test(t)?n.storyBeats.push(Bl(s,o)):t==="game-settings.md"?n.settings=Hl(s):t==="delivery-items.md"?n.deliveryItems=$l(s):t==="npc-names.md"&&(n.npcNames=Gl(s))}return n}function Ge(e){const n=[];let t=!1;for(const r of e.split(`
`)){const i=r.trim();if(!i.startsWith("#"))if(i===""){if(t)break}else t=!0,n.push(i)}return n.join(" ")}function Rl(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economy:e.economy??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:Ge(n)}}function Ol(e,n){const t=e.amenities??{},r={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:r,npcs:e.npcs??{},goodsBias:e.goods_bias??[],dangerLevel:e.danger_level,tags:e.tags??[],description:Ge(n)}}function Nl(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:Ge(n)}}function Fl(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,tags:e.tags??[],description:Ge(n)}}function Dl(e){return(e.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function Pl(e){return(e.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function Ul(e){return(e.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function Bl(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function Hl(e){var n,t,r,i;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((t=e.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((r=e.starting_location)==null?void 0:r.system)??"",destination:((i=e.starting_location)==null?void 0:i.destination)??""},startingShip:e.starting_ship??""}}function $l(e){return(e.delivery_items??[]).map(t=>({id:t.id,name:t.name,weightKg:t.weight_kg}))}function Gl(e){const n=e.npc_names??{};return{special:n.special??[],firstNames:n.first_names??[],lastNames:n.last_names??[]}}function Wl(){const e=Object.assign({"/docs/world/commodities.md":Fr,"/docs/world/delivery-items.md":Dr,"/docs/world/destinations/_template.md":Pr,"/docs/world/destinations/blackwake-yard.md":Ur,"/docs/world/destinations/ceti-landfall.md":Br,"/docs/world/destinations/drift-market.md":Hr,"/docs/world/destinations/elysium-station.md":$r,"/docs/world/destinations/eridani-anchorage.md":Gr,"/docs/world/destinations/foundries-platform.md":Wr,"/docs/world/destinations/galileo-transfer.md":jr,"/docs/world/destinations/hestia-ring.md":Yr,"/docs/world/destinations/keelhaul-station.md":Kr,"/docs/world/destinations/kepler-yard.md":qr,"/docs/world/destinations/mars-anchor.md":Vr,"/docs/world/destinations/meridian-station.md":zr,"/docs/world/destinations/new-horizon-port.md":Xr,"/docs/world/destinations/orrery-anchorage.md":Jr,"/docs/world/destinations/redline-station.md":Qr,"/docs/world/destinations/tycho-orbital.md":Zr,"/docs/world/destinations/veil-station.md":eo,"/docs/world/destinations/waypoint-ceti.md":no,"/docs/world/factions/_template.md":to,"/docs/world/factions/centauri-trade-league.md":io,"/docs/world/factions/eridani-colonial-council.md":ro,"/docs/world/factions/free-captains.md":oo,"/docs/world/factions/grey-market-cartel.md":so,"/docs/world/factions/helios-directorate.md":ao,"/docs/world/factions/independent-miners-guild.md":lo,"/docs/world/factions/procyon-institute.md":co,"/docs/world/factions/terran-union.md":ho,"/docs/world/galaxy-map.md":uo,"/docs/world/game-settings.md":po,"/docs/world/navigation/jump-routes.md":mo,"/docs/world/npc-names.md":fo,"/docs/world/ships/_template.md":go,"/docs/world/ships/components/jump-drives.md":yo,"/docs/world/ships/freighter.md":bo,"/docs/world/ships/hauler.md":_o,"/docs/world/ships/scout.md":vo,"/docs/world/story/_template.md":wo,"/docs/world/story/enter-wolf-359.md":ko,"/docs/world/story/first-jump.md":xo,"/docs/world/story/opening-arrival.md":Co,"/docs/world/systems/_template.md":Ao,"/docs/world/systems/alpha-centauri.md":To,"/docs/world/systems/barnards-star.md":So,"/docs/world/systems/epsilon-eridani.md":Io,"/docs/world/systems/procyon.md":Eo,"/docs/world/systems/sirius.md":Mo,"/docs/world/systems/sol.md":Lo,"/docs/world/systems/tau-ceti.md":Ro,"/docs/world/systems/wolf-359.md":Oo}),n={};for(const[t,r]of Object.entries(e)){const i=t.replace("/docs/world/","");n[i]=r}return Ll(n)}ui(Wl());const jl=navigator.maxTouchPoints>0?"touch":"keyboard",Yl=new URLSearchParams(window.location.search).has("debug"),Qt={environment:"browser",primaryInput:jl,debug:Yl},Kl=new ii,Zt=new ai(Qt);Zt.connect();const ql=new Nr(Kl,Zt,Qt);let ht=0;function ei(e){ql.tick(e-ht),ht=e,requestAnimationFrame(ei)}requestAnimationFrame(ei);
