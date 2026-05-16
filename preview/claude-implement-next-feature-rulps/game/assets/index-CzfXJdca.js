(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const ae=40,we=30,Zt=50,Ge=24;function ei(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class ni{constructor(){this.charW=0,this.charH=0,this.gridH=we,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(ae),this.pre.dataset.gridRows=String(we),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${Ge}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${Ge}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const t=n.getBoundingClientRect();document.body.removeChild(n),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(ae*this.charW),window.innerHeight/(we*this.charH)),t=Math.max(we,Math.min(Zt,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${Ge*n}px`,this.pre.style.width=`${ae*this.charW*n}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const r of this.resizeHandlers)r(ae,t)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const t=[];for(const r of n){let i="";for(const o of r){const s=o.fg!=="transparent"?`fg-${o.fg}`:"",a=o.bg!=="transparent"?`bg-${o.bg}`:"",l=s&&a?`${s} ${a}`:s||a,c=l?` class="${l}"`:"";i+=`<span${c}>${ei(o.char)}</span>`}t.push(i)}this.pre.innerHTML=t.join(`
`)}getWidth(){return ae}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const ti={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},ii=new Set(["0","1","2","3","4","5","6","7","8","9"]),ri=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class oi{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}connect(){this.keyListener=n=>{if(ri.has(n.key)&&n.preventDefault(),ii.has(n.key))for(const r of this.charInputHandlers.slice())r(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const r of this.charInputHandlers.slice())r("\b");return}const t=ti[n.key];if(t)for(const r of this.actionHandlers.slice())r(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=n=>{const t=this.pointerStartMap.get(n.pointerId),r=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),!t){this.logDebug(`UP id=${n.pointerId} NO START`);return}const i=n.clientX-t.startX,o=n.clientY-t.startY,s=Math.abs(i),a=Math.abs(o);if(s<20&&a<20)if(r>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;s>=a?l=i>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(i)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=n=>{this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const t=n.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(n,t){const r=document.querySelector(".game-screen");if(!r)return null;const i=r.getBoundingClientRect(),o=parseInt(r.dataset.gridCols??"1"),s=parseInt(r.dataset.gridRows??"1");if(!o||!s||!i.width||!i.height)return null;const a=Math.floor((n-i.left)/(i.width/o)),l=Math.floor((t-i.top)/(i.height/s));return a<0||a>=o||l<0||l>=s?null:{col:a,row:l}}}function f(e,n,t,r,i,o){if(n<0||n>=e.length)return;const s=e[n];for(let a=0;a<r.length;a++){const l=t+a;l>=0&&l<s.length&&(s[l]={char:r[a],fg:i,bg:o})}}function x(e,n,t,r,i){if(n<0||n>=e.length)return;const o=e[n].length,s=Math.max(0,Math.floor((o-t.length)/2));f(e,n,s,t,r,i)}function lt(e,n){const t=e.split(/\s+/).filter(Boolean),r=[];let i="";for(const o of t)i.length===0?i=o:i.length+1+o.length<=n?i+=" "+o:(r.push(i),i=o);return i.length>0&&r.push(i),r}const mn=["UNTITLED","SPACE GAME"],si=4,ai=3,li="- An ASCII space adventure -",ci=11,gn=16;class yn{constructor(n,t,r,i){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,i()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),n.onAction(o=>{this.activated||(o==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:o==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:o==="SELECT"&&this.items[this.cursorIdx].action())}),n.onTap&&n.onTap((o,s)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(s===gn+a){this.cursorIdx=a,this.items[a].action();return}}})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let s=0;s<t;s++)for(let a=0;a<r;a++)n[s][a]={char:" ",fg:"black",bg:"black"};for(let s=0;s<mn.length;s++)x(n,si+s*ai,mn[s],"bright-cyan","black");x(n,ci,li,"white","black");const i=this.items.reduce((s,a)=>Math.max(s,a.label.length+2),0),o=Math.max(0,Math.floor((r-i)/2));for(let s=0;s<this.items.length;s++){const a=gn+s;if(a>=t)continue;const l=s===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";f(n,a,o,c+this.items[s].label,h,"black")}}}let Qe=null;function hi(e){Qe=e}function P(){if(Qe===null)throw new Error("World not initialised — call initWorld() before accessing world data");return Qe}function Me(e){return P().systems.find(n=>n.id===e)}function Y(e){return P().destinations.find(n=>n.id===e)}function rn(e){return P().routes.filter(n=>n.from===e||n.to===e)}function ct(e){return P().drives.find(n=>n.id===e)}function di(e){return P().storyBeats.filter(n=>n.trigger===e)}function ui(){return P().settings}function ht(e){return P().ships.find(n=>n.id===e)}function Se(e,n){return P().routes.find(t=>t.from===e&&t.to===n||t.from===n&&t.to===e)}function te(e){return P().commodities.find(n=>n.id===e)}function pi(){return P().commodities}function fi(){return P().systems.filter(e=>e.playerKnowledge==="public")}function mi(e){return e.reduce((n,t)=>{const r=te(t.commodityId);return n+t.qty*((r==null?void 0:r.weightKg)??0)},0)}const C=3;function dt(e,n){return n?e-2:e}function gi(e){return e.toLocaleString("en-US")}class fe{constructor(n,t){this.buttonRanges=null,this.footerRow=-1,this.context=n,this.player=t}render(n,t){const r=n.length,i=r>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader&&(this.renderHeaderRow0(n,i,t.systemLabel),this.renderHeaderRow1(n,i,t.destinationLabel)),t.showFooter&&(this.renderFooter(n,r,i,t.navOptions),this.footerRow=r-1)}renderHeaderRow0(n,t,r){const i=r!==void 0?r??"":(()=>{const c=Me(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),o="::";f(n,0,0,o,"bright-black","black"),f(n,0,o.length,i,"bright-cyan","black");const a=t-o.length-i.length-10;let l=o.length+i.length;for(let c=0;c<a;c++)n[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,f(n,0,l,"[M]","white","black"),l+=3,f(n,0,l," MENU","white","black"),l+=5,f(n,0,l,"::","bright-black","black")}renderHeaderRow1(n,t,r){const i=r!==void 0?r??"":(()=>{const h=this.player.destinationId?Y(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),o=gi(this.player.credits),s=o.length+5,a="::";f(n,1,0,a,"bright-black","black"),f(n,1,a.length,i,"cyan","black");const l=t-a.length-i.length-s;let c=a.length+i.length;for(let h=0;h<l;h++)n[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,f(n,1,c,o,"green","black"),c+=o.length,f(n,1,c," CR","white","black"),c+=3,f(n,1,c,"::","bright-black","black")}renderFooter(n,t,r,i){const o=t-1,s=[];if(i.length===0){for(let l=0;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}f(n,o,0,"::","bright-black","black");let a=2;for(let l=0;l<i.length;l++){l>0&&(f(n,o,a,"::","bright-black","black"),a+=2);const c=i[l],h=`[${l+1}]`,d=` ${c.label}`,u=a;f(n,o,a,h,"white","black"),a+=h.length,f(n,o,a,d,"white","black"),a+=d.length,s.push({id:c.id,startCol:u,endCol:a})}for(let l=a;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=s}hitTestNav(n,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const r of this.buttonRanges)if(n>=r.startCol&&n<r.endCol)return r.id;return null}}const yi=3,bn=5;class bi{constructor(n,t,r,i){this.activated=!1,this.pageIndex=0,this.onContinue=i,this.chrome=new fe(t,r);const s=di("game-start")[0].text.split(`

`),a=s[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=s.slice(1)):(this.yearHeader="",l=s);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),u=lt(d,36);h>0&&c.push(""),c.push(...u)}this.bodyLines=c,n.onAction(h=>{this.activated||(h==="SELECT"?(this.activated=!0,this.onContinue()):h==="LEFT"?this.pageIndex>0&&this.pageIndex--:h==="RIGHT"&&this.pageIndex++)}),n.onTap&&n.onTap((h,d)=>{this.activated||(this.activated=!0,this.onContinue())})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let d=0;d<t;d++)for(let u=0;u<r;u++)n[d][u]={char:" ",fg:"black",bg:"black"};if(this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:[]}),this.yearHeader){const d=Math.max(0,Math.floor((r-this.yearHeader.length)/2));f(n,yi,d,this.yearHeader,"bright-yellow","black")}const o=t-3-bn,s=Math.max(1,Math.ceil(this.bodyLines.length/o));this.pageIndex>=s&&(this.pageIndex=s-1);const a=s>1,l=this.pageIndex*o,c=Math.min(l+o,this.bodyLines.length);let h=bn;for(let d=l;d<c;d++){const u=this.bodyLines[d];u!==""&&f(n,h,2,u,"white","black"),h++}if(a){const d=`< ${this.pageIndex+1}/${s} >`,u=r-9;f(n,t-3,u,d,"bright-black","black")}}}const ut=5,le=10;class Ne{constructor(n,t,r,i,o,s,a=[],l=null){this.activeTabIdx=0,this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.activated=!1,this.modal=null,this.title=n,this._staticItems=t,this.tabs=l,this.context=o,this.player=s,this.chrome=new fe(o,s),this.navOptions=r,this.infoLines=a,this.itemStartRow=l!==null?C+5:C+3+a.length,i.onCharInput&&i.onCharInput(c=>{this.modal!==null&&this.modal.handleCharInput(c)}),i.onAction(c=>{if(this.modal!==null){this.modal.handleAction(c);return}this.activated||(c==="UP"?this.moveCursor(-1):c==="DOWN"?this.moveCursor(1):c==="LEFT"&&this.tabs!==null?(this.activeTabIdx=Math.max(0,this.activeTabIdx-1),this.resetCursor()):c==="RIGHT"&&this.tabs!==null?(this.activeTabIdx=Math.min(this.tabs.length-1,this.activeTabIdx+1),this.resetCursor()):c==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):c==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):c==="SELECT"?this.activateCurrent():this.handleNavAction(c))}),this.resetCursor(),i.onTap&&i.onTap((c,h)=>{if(this.modal!==null){this.modal.handleTap(c,h);return}if(this.activated)return;const d=this.chrome.hitTestNav(c,h);if(d!==null){this.handleNavTap(d);return}if(this.tabs!==null&&h===C+3){let p=3;for(let g=0;g<this.tabs.length;g++){const b=this.tabs[g].label.length+2;if(c>=p&&c<p+b){this.activeTabIdx=g,this.resetCursor();return}p+=b+1}}const u=this.rowToVisibleItemIndex(h);u!==null&&!this.items[u].disabled&&(this.cursorIdx=u,this.activateCurrent())})}get items(){var n;return this.tabs!==null?((n=this.tabs[this.activeTabIdx])==null?void 0:n.items)??[]:this._staticItems}moveCursor(n){const t=this.items,r=t.length;if(r===0)return;const i=this.cursorIdx===-1?n>0?r-1:0:this.cursorIdx;for(let o=0;o<r;o++){const s=((i+n*(o+1))%r+r)%r;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const n=this.items[this.cursorIdx];n.disabled||(this.activated=!0,n.action())}rowToVisibleItemIndex(n){var i;let t=this.itemStartRow;const r=this.items;for(let o=0;o<r.length;o++){const s=1+(((i=r[o].details)==null?void 0:i.length)??0);if(n>=t&&n<t+s)return o;t+=s}return null}resetCursor(){const n=this.items;for(let t=0;t<n.length;t++)if(!n[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(n){}handleNavTap(n){}openModal(n){this.modal=n}closeModal(){this.modal=null}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:this.navOptions}}update(n){}render(n){var S;const t=n.length,r=t>0?n[0].length:0;for(let v=0;v<t;v++)for(let m=0;m<r;m++)n[v][m]={char:" ",fg:"black",bg:"black"};const i=this.buildChromeConfig();this.chrome.render(n,i),f(n,C,2,this.title,"bright-white","black"),f(n,C+1,2,"'".repeat(this.title.length),"bright-black","black");for(let v=0;v<this.infoLines.length;v++)f(n,C+2+v,2,this.infoLines[v],"bright-black","black");if(this.tabs!==null){const v=C+3;let m=2;n[v][m]={char:"|",fg:"bright-black",bg:"black"},m++;for(let I=0;I<this.tabs.length;I++){const E=I===this.activeTabIdx,B=` ${this.tabs[I].label} `,N=E?"black":"white",M=E?"green":"black";for(const O of B)m<r&&(n[v][m]={char:O,fg:N,bg:M}),m++;m<r&&(n[v][m]={char:"|",fg:"bright-black",bg:"black"}),m++}}const s=dt(t,i.showFooter)-1,a=s-this.itemStartRow,l=this.items,c=l.map(v=>{var m;return 1+(((m=v.details)==null?void 0:m.length)??0)}),d=c.reduce((v,m)=>v+m,0)>a,u=d?a-1:a,p=[];let g=[],b=0;for(let v=0;v<c.length;v++)b+c[v]>u?(g.length>0&&p.push(g),g=[v],b=c[v]):(g.push(v),b+=c[v]);g.length>0&&p.push(g),this.lastPageCount=Math.max(1,p.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const _=p[this.pageIndex]??[];let w=this.itemStartRow;for(const v of _){const m=l[v],I=v===this.cursorIdx,E=m.disabled?"bright-black":I?"bright-green":"white",B=m.infoFg??E,N=r-4;if(m.icon!==void 0){const M=m.icon.length;if(f(n,w,2,I?">":" ",E,"black"),f(n,w,3,m.icon,m.iconFg??E,"black"),m.info!==void 0){const ve=Math.max(1,N-1-M-m.label.length-2-m.info.length);f(n,w,3+M,m.label+" ",E,"black"),f(n,w,3+M+m.label.length+1,".".repeat(ve),"bright-black","black"),f(n,w,3+M+m.label.length+1+ve+1,m.info,B,"black")}else f(n,w,3+M,m.label.slice(0,N-1-M),E,"black")}else if(m.info!==void 0){const M=I?"> ":"  ",O=Math.max(1,N-2-m.label.length-2-m.info.length);f(n,w,2,M+m.label+" ",E,"black"),f(n,w,2+M.length+m.label.length+1,".".repeat(O),"bright-black","black"),f(n,w,2+M.length+m.label.length+1+O+1,m.info,B,"black")}else if(m.details!==void 0&&m.details.length>0){f(n,w,2,((I?"> ":"  ")+m.label).slice(0,N),E,"black");for(let O=0;O<m.details.length;O++)w+1+O<=s&&f(n,w+1+O,2,("  "+m.details[O]).slice(0,N),"bright-black","black")}else f(n,w,2,((I?"> ":"  ")+m.label).slice(0,N),E,"black");w+=1+(((S=m.details)==null?void 0:S.length)??0)}if(d){const v=`${this.pageIndex+1}/${this.lastPageCount}`,m=s;f(n,m,0,"|<|","white","black");const I=Math.floor((r-v.length)/2);f(n,m,I,v,"bright-black","black"),f(n,m,r-3,"|>|","white","black")}this.modal!==null&&this.modal.render(n)}}const _i=30;class Ze{constructor(n){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=n,this.value=Math.max(n.field.min,Math.min(n.field.max,n.field.initialValue))}handleAction(n){const{field:t}=this.formDef;if(n==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(n==="UP"){this.value=Math.min(t.max,this.value+1);return}if(n==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(n==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(n==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(n==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}n==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(n){if(this.focus!=="field")return;const{field:t}=this.formDef;if(n==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(n>="0"&&n<="9"){const r=parseInt(n,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,r)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+r)}}handleTap(n,t){this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(n){const t=n.length,r=t>0?n[0].length:0,{title:i,field:o,derivedRows:s,confirmLabel:a}=this.formDef,l=s.length,c=8+l,h=_i,d=Math.floor((r-h)/2),u=Math.floor((t-c)/2);for(let k=0;k<c;k++)for(let U=0;U<h;U++){const G=u+k,se=d+U;G>=0&&G<t&&se>=0&&se<r&&(n[G][se]={char:" ",fg:"white",bg:"black"})}const p=(k,U,G)=>{k>=0&&k<t&&U>=0&&U<r&&(n[k][U]={char:G,fg:"white",bg:"black"})};p(u,d,"+"),p(u,d+h-1,"+");for(let k=1;k<h-1;k++)p(u,d+k,"-");p(u+c-1,d,"+"),p(u+c-1,d+h-1,"+");for(let k=1;k<h-1;k++)p(u+c-1,d+k,"-");for(let k=1;k<c-1;k++)p(u+k,d,"|"),p(u+k,d+h-1,"|");const g=h-2,b=u+1,_=d+1+Math.floor((g-i.length)/2);f(n,b,_,i,"bright-white","black"),f(n,u+2,_,"'".repeat(i.length),"bright-black","black");const w=[o.label,...s.map(k=>k.label)],S=Math.max(...w.map(k=>k.length)),v=d+1+S+3,m=u+4,I=this.focus==="field";f(n,m,d+1,o.label.padEnd(S)+" : ","white","black");const E=this.value.toString().padStart(5);f(n,m,v,E,I?"black":"white",I?"green":"black");for(let k=0;k<l;k++){const U=s[k],G=u+5+k,se=U.compute(this.value);f(n,G,d+1,U.label.padEnd(S)+" : ","white","black"),f(n,G,v,se,"white","black")}const B=u+4+l+2,N=`[ ${a} ]`,M="[ CANCEL ]",O=3,ve=N.length+O+M.length,Qt=Math.floor((g-ve)/2),$e=d+1+Qt,un=$e+N.length+O;this.confirmRect={col:$e,row:B,width:N.length},this.cancelRect={col:un,row:B,width:M.length};const pn=this.focus==="confirm",fn=this.focus==="cancel";f(n,B,$e,N,pn?"black":"white",pn?"green":"black"),f(n,B,un,M,fn?"black":"white",fn?"green":"black")}}class vi extends Ne{constructor(n,t,r,i,o,s,a,l){const c=Y(i),h=[];c.amenities.trader&&h.push({label:"TRADER",action:s}),c.amenities.missionBoard&&h.push({label:"MISSION BOARD",action:a});const d=r.fuelCapacityL-r.fuelL,u=Math.floor(r.credits/le),p=Math.min(d,u);let g=null;if(c.amenities.fuel&&p>0){const v=p*le;g=h.length,h.push({label:`BUY FUEL  +${p}L  ${v}CR`,action:()=>{}})}const b=lt(c.description,36).slice(0,3),_=`DANGER: ${c.dangerLevel.toUpperCase()}`,w=[...b,_],S=c.locationType==="surface"||c.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",h,[{id:"undock",label:S}],n,t,r,w),this.onShip=l,this.onRefuel=o,this.fuelItemIdx=g}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx===-1)return;const t=n[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const r=this.player.fuelCapacityL-this.player.fuelL,i=Math.floor(this.player.credits/le),o=Math.min(r,i);this.openModal(new Ze({title:"BUY FUEL",field:{label:"Litres",initialValue:o,min:0,max:o},derivedRows:[{label:"Cost",compute:s=>`${s*le} CR`}],confirmLabel:"BUY",onConfirm:s=>{this.closeModal(),s>0&&this.onRefuel(s*le,s)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class wi extends Ne{constructor(n,t,r,i,o,s,a,l,c){var p;const d=((p=Y(i).npcs.trader)==null?void 0:p.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(d,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,[],u),this.traderStock=o,this.onBuy=s,this.onSell=a,this.onHub=l,this.onUndock=c,this.syncItems(),this.clampCursor()}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(n=>{const t=te(n.commodityId);if(!t)return[];const r=this.player.credits>=t.basePrice;return[{label:`${t.name} (x${n.qty})`,info:`${t.basePrice} CR`,disabled:!r,action:()=>{const i=Math.floor(this.player.credits/t.basePrice),o=Math.min(n.qty,i);this.openModal(new Ze({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:o,min:0,max:o},derivedRows:[{label:"Total",compute:s=>`${s*t.basePrice} CR`}],confirmLabel:"BUY",onConfirm:s=>{s>0&&this.onBuy(n.commodityId,s),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const n=this.player.cargoHold;return n.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...n].flatMap(t=>{const r=te(t.commodityId);return r?[{label:`${r.name} (x${t.qty})`,info:`${r.basePrice} CR`,action:()=>{this.openModal(new Ze({title:r.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:i=>`${i*r.basePrice} CR`}],confirmLabel:"SELL",onConfirm:i=>{i>0&&this.onSell(t.commodityId,i),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]:[]})}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const n=this.items;(this.cursorIdx<0||this.cursorIdx>=n.length||(t=n[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=n.findIndex(r=>!r.disabled))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(n){this.syncItems(),super.render(n);const t=n.length,r=`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,i=dt(t,!0)-2;f(n,i,2,r,"bright-black","black")}}const xi=[{id:"M001",type:"rescue",title:"Find the Lost Crew",reward:500},{id:"M002",type:"delivery",title:"Deliver Fuel Core",reward:300},{id:"M003",type:"combat",title:"Clear Pirate Outpost",reward:750},{id:"M004",type:"salvage",title:"Salvage Station Debris",reward:400},{id:"M005",type:"rescue",title:"Rescue Stranded Vessel",reward:600},{id:"M006",type:"delivery",title:"Transport Supplies",reward:250},{id:"M007",type:"combat",title:"Eliminate Smugglers",reward:800}],ki={rescue:"[R] ",delivery:"[D] ",combat:"[C] ",salvage:"[S] "};class Ci extends Ne{constructor(n,t,r,i,o,s){Y(i);const a=xi.map(l=>({label:l.title,icon:ki[l.type],iconFg:"bright-yellow",info:`${l.reward} CR`,infoFg:"bright-green",action:()=>console.log(`[MissionBoard] Selected: ${l.title}`)}));super("MISSION BOARD",a,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r),this.onHub=o,this.onUndock=s}activateCurrent(){if(this.items.length===0)return;const n=this.items[this.cursorIdx];n.disabled||n.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}const Ti=[18,10,5],Ai=[".","*","+"],_n=[4e3,2e3,800],Si=[9e3,5e3,2500],Ii=[null,"bright-black","white"],Ei=["bright-black","white","bright-white"],Mi=["white","bright-white","bright-cyan"],xe=3,vn=25,ke=2,wn=37,xn=2*Math.PI;function Li(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class Ri{constructor(n=42){this.boundsSet=!1,this.rand=Li(n),this.stars=[];for(let t=0;t<3;t++)for(let r=0;r<Ti[t];r++){const i=ke+Math.floor(this.rand()*(wn-ke+1)),o=xe+Math.floor(this.rand()*(vn-xe+1)),s=this.rand()*xn,a=_n[t]+this.rand()*(Si[t]-_n[t]);this.stars.push({col:i,row:o,layer:t,twinklePhase:s,twinklePeriod:a})}}update(n){for(const t of this.stars)t.twinklePhase+=xn/t.twinklePeriod*n}render(n,t,r,i,o){if(!this.boundsSet){this.boundsSet=!0;const s=vn-xe,a=wn-ke;{const l=(r-t)/s,c=(o-i)/a;for(const h of this.stars)h.row=Math.round(t+(h.row-xe)*l),h.col=Math.round(i+(h.col-ke)*c)}}for(const s of this.stars){const{row:a,col:l,layer:c}=s;if(a<t||a>r||l<i||l>o)continue;const h=Math.sin(s.twinklePhase);let d;h>=.5?d=Mi[c]:h>=-.5?d=Ei[c]:d=Ii[c],d!==null&&(n[a][l]={char:Ai[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const Oi=6,je=6,Fi=23,Ni=23,We=10,Di=0,Pi=2,Ui=17,Hi=22,Bi=37,$i=39,kn=12,Gi=11,V=13,ce=27,Ye=28,ji=12,Ke=40,Cn=200,qe=["> SYSTEM STATUS: ALL CLEAR","> DRIVE EFFICIENCY: 97%","> BEACON SIGNAL DETECTED ON 14.7 MHz","> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE","> WARNING: DEBRIS FIELD DELTA-9 ACTIVE","> COMMS RELAY SIGNAL NOMINAL","> FUEL RESERVES OPTIMAL","> SECTOR SCAN COMPLETE — NO HOSTILES","> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227","> TRANSPONDER HANDSHAKE: ACCEPTED"],Wi="#",Tn=["green","cyan","white","yellow"],An=["*",".","+","x"];function Sn(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function Yi(e,n,t){return{col:n,row:t,char:Wi,color:Tn[Math.floor(e()*Tn.length)],phase:e()*2e4,period:1e4+e()*1e4,active:e()>.2}}function he(e,n,t,r){const i=[];for(const o of r)for(let s=n;s<=t;s++)i.push(Yi(e,s,o));return i}class Ki{constructor(n,t,r,i,o,s){this.cursorIdx=0,this.activated=!1,this.h=30,this.blinkPhase=0,this.msgIdx=0,this.tickerScroll=0,this.tickerAccum=0,this.tickerPause=0,this.player=r,this.chrome=new fe(t,r),this.starfield=new Ri(42),this.inSpace=r.destinationId===null;const a=Sn(99);this.gaugeBtns=[...he(a,Di,Pi,[3,4]),...he(a,Ui,Hi,[3,4]),...he(a,Bi,$i,[3,4])],this.leftBtns=he(a,0,Gi,[0,1,2,3]),this.rightBtns=he(a,Ye,39,[0,1,2,3]);const l=Sn(77),c=3+Math.floor(l()*4);this.radarContacts=Array.from({length:c},()=>({x:l()*(ce-V-1),y:l()*4,vx:(l()-.5)*2,vy:(l()-.5)*1.5,char:An[Math.floor(l()*An.length)]}));const h=()=>this.inSpace?1:2;n.onAction(d=>{this.activated||(d==="CARGO"?(this.activated=!0,s()):d==="UP"?this.cursorIdx=(this.cursorIdx-1+h())%h():d==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%h():d==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,i()):this.inSpace||(this.activated=!0,o())))}),n.onTap&&n.onTap((d,u)=>{if(this.activated)return;const p=this.h;(u===3||u===4)&&d>=je&&d<je+1+We?(this.activated=!0,s()):u===p-3&&d<kn?(this.activated=!0,i()):u===p-3&&d>=Ye&&!this.inSpace&&(this.activated=!0,o())})}update(n){this.starfield.update(n),this.blinkPhase=(this.blinkPhase+n)%1e3;for(const i of[...this.gaugeBtns,...this.leftBtns,...this.rightBtns])i.phase+=n,i.phase>=i.period&&(i.phase-=i.period,i.active=!i.active);const t=ce-V,r=5;for(const i of this.radarContacts)i.x+=i.vx*n/1e3,i.y+=i.vy*n/1e3,i.x<0&&(i.x=-i.x,i.vx=-i.vx),i.x>t-1&&(i.x=2*(t-1)-i.x,i.vx=-i.vx),i.y<0&&(i.y=-i.y,i.vy=-i.vy),i.y>r-1&&(i.y=2*(r-1)-i.y,i.vy=-i.vy);if(this.tickerPause>0)this.tickerPause=Math.max(0,this.tickerPause-n);else for(this.tickerAccum+=n;this.tickerAccum>=Cn;){this.tickerAccum-=Cn,this.tickerScroll++;const i=qe[this.msgIdx];if(this.tickerScroll>=i.length+Ke-1){this.tickerScroll=0,this.msgIdx=(this.msgIdx+1)%qe.length,this.tickerPause=500,this.tickerAccum=0;break}}}render(n){const t=n.length,r=t>0?n[0].length:0;this.h=t;for(let c=0;c<t;c++)for(let h=0;h<r;h++)n[c][h]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:[]});const i=5,o=t-8,s=t-7,a=t-3,l=t-2;this.renderGaugeStrip(n),this.starfield.render(n,i,o,0,39);for(let c=0;c<r;c++)n[i][c]={char:"-",fg:"white",bg:"black"},n[o][c]={char:"-",fg:"white",bg:"black"};this.renderHUD(n,i+1),this.renderCrosshair(n,i+1,o-1),this.renderBottomPanels(n,s,a),this.renderTicker(n,l)}renderGaugeStrip(n){for(const o of this.gaugeBtns){const s=o.active?o.color:"bright-black";n[o.row][o.col]={char:o.char,fg:s,bg:"black"}}const t=this.player.fuelL/this.player.fuelCapacityL,r=this.player.cargoWeightKg/this.player.cargoCapacity,i=this.blinkPhase<500;this.renderGauge(n,3,Oi,"F",t,"yellow",i),this.renderGauge(n,4,je,"C",r,"blue",i),this.renderGauge(n,3,Fi,"S",1,"cyan",i),this.renderGauge(n,4,Ni,"H",1,"green",i)}renderGauge(n,t,r,i,o,s,a){n[t][r]={char:i,fg:s,bg:"black"};const l=Math.round(Math.min(1,Math.max(0,o))*We),c=o<=.2;for(let h=0;h<We;h++){const d=r+1+h;if(h<l){const u=c&&!a?"bright-black":s;n[t][d]={char:" ",fg:"black",bg:u}}else n[t][d]={char:" ",fg:"black",bg:"bright-black"}}}renderHUD(n,t){f(n,t,1,"VEL:----","bright-black","black"),f(n,t,16,"ATT:---°","bright-black","black"),f(n,t,30,"ROT:--°","bright-black","black")}renderCrosshair(n,t,r){const i=Math.floor((t+r)/2),o=20;n[i][o]={char:"+",fg:"bright-green",bg:"black"};const s=[[i-3,o-5],[i-3,o+5],[i+3,o-5],[i+3,o+5]];for(const[a,l]of s)a>=t&&a<=r&&l>=0&&l<40&&(n[a][l]={char:"+",fg:"bright-green",bg:"black"})}renderBottomPanels(n,t,r){for(let c=t;c<=r;c++)for(let h=V;h<ce;h++)n[c][h]={char:" ",fg:"black",bg:"bright-black"};this.renderRadar(n,t,r-t+1);for(const c of this.leftBtns){const h=t+c.row;if(h<r){const d=c.active?c.color:"bright-black";n[h][c.col]={char:c.char,fg:d,bg:"black"}}}for(const c of this.rightBtns){const h=t+c.row;if(h<r){const d=c.active?c.color:"bright-black";n[h][c.col]={char:c.char,fg:d,bg:"black"}}}const i=this.cursorIdx===0?"bright-yellow":"yellow";f(n,r,0,this.centerPad("TRAVEL",kn),"black",i);let o,s;this.inSpace?(o="bright-black",s="bright-black"):(o=this.cursorIdx===1?"bright-cyan":"cyan",s="black"),f(n,r,Ye,this.centerPad("DOCK",ji),s,o);const a=ce-V,l="<)) "+"-".repeat(a-4);f(n,r,V,l,"white","bright-black")}renderRadar(n,t,r){for(const i of this.radarContacts){const o=Math.min(ce-V-1,Math.max(0,Math.floor(i.x))),s=Math.min(r-1,Math.max(0,Math.floor(i.y)));n[t+s][V+o]={char:i.char,fg:"white",bg:"bright-black"}}}renderTicker(n,t){const r=qe[this.msgIdx];for(let i=0;i<Ke;i++){const o=this.tickerScroll-Ke+1+i,s=o>=0&&o<r.length?r[o]:" ";n[t][i]={char:s,fg:"white",bg:"black"}}}centerPad(n,t){if(n.length>=t)return n.slice(0,t);const r=t-n.length,i=Math.floor(r/2);return" ".repeat(i)+n+" ".repeat(r-i)}}const Ve="CARGO HOLD";class qi{constructor(n,t,r,i){this.activated=!1,this.player=r,n.onAction(o=>{this.activated||(o==="BACK"||o==="CARGO")&&(this.activated=!0,i())})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let h=0;h<t;h++)for(let d=0;d<r;d++)n[h][d]={char:" ",fg:"black",bg:"black"};x(n,1,Ve,"bright-white","black");const i=Math.max(0,Math.floor((r-Ve.length)/2));f(n,2,i,"'".repeat(Ve.length),"bright-black","black");const o=this.player.cargoHold,s=this.player.cargoCapacity,a=this.player.cargoWeightKg;if(o.length===0)x(n,Math.floor(t/2),"CARGO HOLD EMPTY","bright-black","black");else{let h=4;for(const u of o){if(h>=t-3)break;const p=te(u.commodityId);if(!p)continue;const g=u.qty*p.weightKg,b=`  x${u.qty}  ${p.basePrice}CR  ${g}KG`,_=Math.max(6,r-4-b.length),w=p.name,v=`${w.length>_?w.slice(0,_):w}${b}`;f(n,h,2,v,"white","black"),h++}const d=t-4;d>3&&f(n,d,2,"-".repeat(r-4),"bright-black","black")}const l=t-3,c=`TOTAL: ${a}/${s}KG`;f(n,l,2,c,"bright-black","black"),f(n,t-1,2,"[ESC] BACK","bright-black","black")}}class In extends Ne{constructor(n,t,r,i,o,s,a,l){const c=Me(r.systemId),h=ct(r.driveId),d=[...c.destinations.map(b=>({label:Y(b).name.toUpperCase(),disabled:b===r.destinationId,action:()=>i(b)})),{label:"FLY INTO SPACE",disabled:r.destinationId===null,action:s}],p=[...rn(r.systemId).map(b=>{const _=b.from===r.systemId?b.to:b.from,w=Me(_),S=b.stability.toUpperCase(),v=Math.ceil(ut*b.distance*h.fuelEfficiency);return{label:`${w.name.toUpperCase()}  ${b.distance}LY  [${S}]`.slice(0,36),disabled:v>r.fuelL,action:()=>o(_)}}),{label:"GALAXY MAP...",action:l}],g=[{label:"DESTINATIONS",items:d},{label:"JUMPS",items:p}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],n,t,r,[],g),this.onShip=a}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}function En(e,n){if(e===n)return[e];const t=[[e]],r=new Set([e]);for(;t.length>0;){const i=t.shift(),o=i[i.length-1];for(const s of rn(o)){const a=s.from===o?s.to:s.from;if(a===n)return[...i,a];r.has(a)||(r.add(a),t.push([...i,a]))}}return null}const Mn="GALAXY MAP",Ln=C+3,Rn=C+5,j=C+9,On=C+13,Vi=C+14,Ce=C+15,ze=C+20,Xe=C+21,zi=2,Xi=10,Ji=12,Te=13,Ae=12,Qi=25,Zi=26,er=10,Fn=18;function nr(e,n){return e.length>=n?e.slice(0,n):e+" ".repeat(n-e.length)}function de(e,n){return"["+nr(e.toUpperCase(),n-2)+"]"}class tr{constructor(n,t,r,i){this.activeTab="map",this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.activated=!1,this.chrome=new fe(t,r),this.player=r,this.onBack=i,this.publicSystems=fi().sort((o,s)=>o.distanceFromSol-s.distanceFromSol),this.otherSystems=this.publicSystems.filter(o=>o.id!==r.systemId),this.mapBrowsingSystemId=r.systemId,n.onCharInput&&n.onCharInput(o=>{if(this.activated||this.activeTab!=="map")return;const s=o.charCodeAt(0);o==="\b"||o===""?this.searchText=this.searchText.slice(0,-1):s>=32&&s<127&&(this.searchText+=o.toUpperCase(),this.mapCursorIdx=0)}),n.onAction(o=>{if(!this.activated){if(o==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}if(o==="LEFT"){this.activeTab="map",this.searchText="";return}if(o==="RIGHT"){this.activeTab="route",this.searchText="";return}this.activeTab==="map"?this.handleMapAction(o):this.handleRouteAction(o)}}),n.onTap&&n.onTap((o,s)=>{if(this.activated)return;if(this.chrome.hitTestNav(o,s)==="back"){this.searchText="",this.activated=!0,this.onBack();return}if(s===Ln){o>=3&&o<=7?(this.activeTab="map",this.searchText=""):o>=9&&o<=16&&(this.activeTab="route",this.searchText="");return}if(this.activeTab==="map"&&s>=Ce&&s<ze){const l=this.getMapNeighbors(),c=s-Ce;c>=0&&c<l.length&&(this.mapBrowsingSystemId=l[c].id,this.mapCursorIdx=0,this.searchText="")}if(this.activeTab==="route"&&s>=C+8&&s<=C+14){const l=s-(C+8);l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}})}getMapNeighbors(){const t=rn(this.mapBrowsingSystemId).map(r=>{const i=r.from===this.mapBrowsingSystemId?r.to:r.from,o=this.publicSystems.find(a=>a.id===i),s=r.distance;return o?{sys:o,dist:s}:null}).filter(r=>r!==null).sort((r,i)=>r.dist-i.dist).map(r=>r.sys);return this.searchText.length===0?t:t.filter(r=>r.name.toUpperCase().includes(this.searchText))}handleMapAction(n){const t=this.getMapNeighbors(),r=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(n==="UP")this.mapCursorIdx=Math.max(0,r-1);else if(n==="DOWN")this.mapCursorIdx=Math.min(t.length-1,r+1);else if(n==="SELECT"){const i=t[r];if(!i)return;this.mapBrowsingSystemId=i.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(n){n==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):n==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const n=this.otherSystems[this.routeDestIdx];return n?En(this.player.systemId,n.id):null}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let o=0;o<t;o++)for(let s=0;s<r;s++)n[o][s]={char:" ",fg:"black",bg:"black"};const i=[{id:"back",label:"BACK"}];this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:i}),f(n,C,2,Mn,"bright-white","black"),f(n,C+1,2,"'".repeat(Mn.length),"bright-black","black"),this.renderTabBar(n,r),this.activeTab==="map"?this.renderMapTab(n,r):this.renderRouteTab(n,r)}renderTabBar(n,t){const r=Ln;let i=2;n[r][i++]={char:"|",fg:"bright-black",bg:"black"};for(const[o,s]of[["MAP","map"],["ROUTE","route"]]){const a=this.activeTab===s,l=a?"black":"white",c=a?"green":"black";for(const h of` ${o} `)i<t&&(n[r][i]={char:h,fg:l,bg:c}),i++;i<t&&(n[r][i]={char:"|",fg:"bright-black",bg:"black"}),i++}}renderMapTab(n,t){const r=this.publicSystems.find(s=>s.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!r)return;this.renderChart(n,r),f(n,Vi,0,"-".repeat(t),"bright-black","black");const i=this.getMapNeighbors(),o=Math.min(this.mapCursorIdx,Math.max(0,i.length-1));this.renderNeighborList(n,t,r,i,o),f(n,ze,0,"-".repeat(t),"bright-black","black"),this.renderInfo(n,t,r,i[o]??null),this.searchText.length>0&&f(n,Xe+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(n,t){const r=this.getMapNeighbors(),i=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(f(n,j,Te,de(t.name,Ae),i,"black"),t.id===this.player.systemId){const s=Te+Ae;n[j][s]={char:"*",fg:"bright-yellow",bg:"black"}}const o=["left","right","top","bottom"];for(let s=0;s<Math.min(r.length,4);s++){const a=r[s],l=o[s],c=a.id===this.player.systemId?"bright-yellow":"white";if(l==="left")f(n,j,zi,de(a.name,Xi),c,"black"),n[j][Ji]={char:"-",fg:"bright-black",bg:"black"};else if(l==="right")f(n,j,Zi,de(a.name,er),c,"black"),n[j][Qi]={char:"-",fg:"bright-black",bg:"black"};else if(l==="top"){f(n,Rn,Te,de(a.name,Ae),c,"black");for(let h=Rn+1;h<j;h++)n[h][Fn]={char:"|",fg:"bright-black",bg:"black"}}else{f(n,On,Te,de(a.name,Ae),c,"black");for(let h=j+1;h<On;h++)n[h][Fn]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(n,t,r,i,o){for(let s=0;s<i.length&&s<ze-Ce;s++){const a=i[s],l=Ce+s,c=s===o,d=a.id===this.player.systemId?"bright-yellow":c?"bright-cyan":"white",u=c?"> ":"  ",p=Se(r.id,a.id),g=p?`${p.distance}LY  ${p.stability}`:"",b=t-4-g.length;f(n,l,2,u+a.name.toUpperCase().slice(0,b-2),d,"black"),g&&f(n,l,t-2-g.length,g,"bright-black","black")}}renderInfo(n,t,r,i){const s=r.id===this.player.systemId?"* Current location":r.name.toUpperCase();if(f(n,Xe,2,`Zone: ${r.zone}  Sec: ${r.security}  ${s}`.slice(0,t-4),"bright-black","black"),!i)return;const a=Se(r.id,i.id);if(!a)return;const l=En(this.player.systemId,i.id),c=l?l.length===1?"(your location)":`${l.length-1} hop${l.length-1!==1?"s":""} from you`:"(unreachable)";f(n,Xe+1,2,`${i.name.toUpperCase()}  ${a.distance}LY  ${c}`.slice(0,t-4),"bright-black","black")}renderRouteTab(n,t){var b,_;const r=C+5,i=C+7,o=C+8,s=7,a=o+s,l=a+1,c=l+6,h=this.publicSystems.find(w=>w.id===this.player.systemId);f(n,r,2,"FROM:","bright-black","black"),f(n,r,8,(h==null?void 0:h.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),f(n,i,2,"TO:","bright-black","black");const d=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-s));for(let w=0;w<s;w++){const S=d+w;if(S>=this.otherSystems.length)break;const v=this.otherSystems[S],m=S===this.routeDestIdx,I=m?"bright-cyan":"white",E=m?"> ":"  ";f(n,o+w,2,E+v.name.toUpperCase(),I,"black")}f(n,a,0,"-".repeat(t),"bright-black","black"),f(n,c,0,"-".repeat(t),"bright-black","black");const u=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!u){f(n,l,2,"No route found","bright-red","black");return}const g=u.length-1;f(n,l,2,`Route: ${g} hop${g!==1?"s":""}`,"bright-white","black");for(let w=0;w<g;w++){const S=Se(u[w],u[w+1]);if(!S)continue;const v=l+1+w;if(v>=c)break;const m=(((b=this.publicSystems.find(E=>E.id===u[w]))==null?void 0:b.name)??u[w]).toUpperCase().slice(0,9),I=(((_=this.publicSystems.find(E=>E.id===u[w+1]))==null?void 0:_.name)??u[w+1]).toUpperCase().slice(0,9);f(n,v,4,`${m} -> ${I}  ${S.distance}LY  ${S.stability}`.slice(0,t-6),"white","black")}}}class q{constructor(n,t,r,i){this.elapsed=0,this.arrived=!1,this.player=n,this.chrome=new fe(t,n),this.duration=r,this.onComplete=i}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}render(n){const t=n.length,r=t>0?n[0].length:0;for(let i=0;i<t;i++)for(let o=0;o<r;o++)n[i][o]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,this.getChromeConfig()),this.renderContent(n)}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const ir=["[. . .]","[: : :]","[* * *]"],Nn=5e3;class rr extends q{constructor(n,t,r){super(n,t,Nn,r)}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/500)%3,o=Math.ceil((Nn-this.elapsed)/1e3),s=Math.max(1,Math.min(5,o)),a=Me(this.player.systemId),l=a?a.name.toUpperCase():this.player.systemId.toUpperCase();x(n,r-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),x(n,r-1,"DESTINATION:","bright-black","black"),x(n,r,l,"bright-white","black"),x(n,r+2,ir[i],"bright-black","black"),x(n,r+4,`ARRIVING IN ${s}S`,"bright-black","black")}}const Dn=2e3,or=["[ —   ]","[  —  ]","[   — ]"];class Pn extends q{constructor(n,t,r,i){super(n,t,Dn,r),this.targetLabel=i}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/300)%3,o=Math.ceil((Dn-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o)),a=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const l=this.player.destinationId?Y(this.player.destinationId):null;return l?l.name.toUpperCase():"UNKNOWN"})();x(n,r-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),x(n,r-1,"HEADING TO:","bright-black","black"),x(n,r,a,"bright-white","black"),x(n,r+2,or[i],"bright-black","black"),x(n,r+4,`ARRIVING IN ${s}S`,"bright-black","black")}}const Un=2500,sr=["v","vv","vvv"];class ar extends q{constructor(n,t,r){super(n,t,Un,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/400)%3,o=Math.ceil((Un-this.elapsed)/1e3),s=Math.max(1,Math.min(3,o));x(n,r-3,"[ LANDING SEQUENCE ]","bright-green","black"),x(n,r+2,sr[i],"bright-black","black"),x(n,r+4,`TOUCHDOWN IN ${s}S`,"bright-black","black")}}const Hn=2500,lr=[">",">>",">>>"];class cr extends q{constructor(n,t,r){super(n,t,Hn,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/400)%3,o=Math.ceil((Hn-this.elapsed)/1e3),s=Math.max(1,Math.min(3,o));x(n,r-3,"[ APPROACH LOCKED ]","bright-yellow","black"),x(n,r+2,lr[i],"bright-black","black"),x(n,r+4,`CLAMPING IN ${s}S`,"bright-black","black")}}const Bn=1500,hr=["^","^^","^^^"];class dr extends q{constructor(n,t,r){super(n,t,Bn,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/300)%3,o=Math.ceil((Bn-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));x(n,r-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),x(n,r+2,hr[i],"bright-black","black"),x(n,r+4,`CLEAR IN ${s}S`,"bright-black","black")}}const $n=1500,ur=["<","<<","<<<"];class pr extends q{constructor(n,t,r){super(n,t,$n,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/300)%3,o=Math.ceil(($n-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));x(n,r-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),x(n,r+2,ur[i],"bright-black","black"),x(n,r+4,`DEPARTING IN ${s}S`,"bright-black","black")}}const Gn=1500,fr=["→","→→","→→→"];class mr extends q{constructor(n,t,r){super(n,t,Gn,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/300)%3,o=Math.ceil((Gn-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));x(n,r-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),x(n,r+2,fr[i],"bright-black","black"),x(n,r+4,`DOCKING IN ${s}S`,"bright-black","black")}}const jn=1500,gr=["←","←←","←←←"];class yr extends q{constructor(n,t,r){super(n,t,jn,r)}renderContent(n){const t=n.length,r=Math.floor(t/2),i=Math.floor(this.elapsed/300)%3,o=Math.ceil((jn-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));x(n,r-3,"[ DEPARTING BERTH ]","bright-cyan","black"),x(n,r+2,gr[i],"bright-black","black"),x(n,r+4,`CLEAR IN ${s}S`,"bright-black","black")}}class br{constructor(n){const t=ht(n.shipId);if(!t)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[]}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,t){const r=this._cargoHold.find(i=>i.commodityId===n);r?r.qty+=t:this._cargoHold.push({commodityId:n,qty:t})}removeCargo(n,t){const r=this._cargoHold.findIndex(i=>i.commodityId===n);r<0||(t!==void 0&&t<this._cargoHold[r].qty?this._cargoHold[r].qty-=t:this._cargoHold.splice(r,1))}get cargoWeightKg(){return mi(this._cargoHold)}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}}const _r=100,vr=2*60*1e3;class wr{constructor(n,t,r){this.traderStockCache=new Map,this.renderer=n,this.input=t,this.context=r;const i=ui(),o=ht(i.startingShip);this.player=new br({shipId:i.startingShip,driveId:o.defaultJumpDrive,credits:i.player.startingCredits,systemId:i.startingLocation.system,destinationId:i.startingLocation.destination}),this.currentScene=new yn(this.input,this.context,this.player,()=>this.goToStory())}tick(n){const t=Math.min(n,_r),r=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(r),this.renderer.drawBuffer(r)}makeBuffer(){const n=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:n},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(n){const t=Date.now(),r=this.traderStockCache.get(n);if(r&&t-r.generatedAt<vr)return r.entries;const i=pi(),o=4+Math.floor(Math.random()*3),s=[...i];for(let l=s.length-1;l>0;l--){const c=Math.floor(Math.random()*(l+1));[s[l],s[c]]=[s[c],s[l]]}const a=s.slice(0,o).map(l=>({commodityId:l.id,qty:1+Math.floor(Math.random()*8)}));return this.traderStockCache.set(n,{entries:a,generatedAt:t}),a}onBuy(n,t,r){if(t<=0)return;const i=r.findIndex(c=>c.commodityId===n);if(i<0)return;const o=r[i];if(t>o.qty)return;const s=te(n);if(!s)return;const a=t*s.basePrice;this.player.credits<a||this.player.cargoWeightKg+t*s.weightKg>this.player.cargoCapacity||(this.player.spendCredits(a),this.player.addCargo(n,t),o.qty-=t,o.qty<=0&&r.splice(i,1))}onSell(n,t,r){if(t<=0)return;const i=this.player.cargoHold.find(l=>l.commodityId===n);if(!i||i.qty<t)return;const o=te(n);if(!o)return;const s=t*o.basePrice;this.player.addCredits(s),this.player.removeCargo(n,t);const a=r.find(l=>l.commodityId===n);a?a.qty+=t:r.push({commodityId:n,qty:t})}goToMainMenu(){this.currentScene=new yn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new bi(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new vi(this.input,this.context,this.player,this.player.destinationId,(n,t)=>{this.player.spendCredits(n),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToTakeOffOrUndock())}goToLandOrDock(){var t;const n=(t=Y(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new ar(this.player,this.context,()=>this.goToStation()):n==="asteroid"?this.currentScene=new cr(this.player,this.context,()=>this.goToStation()):this.currentScene=new mr(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const n=(t=Y(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new dr(this.player,this.context,()=>this.goToShip()):n==="asteroid"?this.currentScene=new pr(this.player,this.context,()=>this.goToShip()):this.currentScene=new yr(this.player,this.context,()=>this.goToShip())}goToTrader(){const n=this.player.destinationId,t=this.getOrCreateTraderStock(n);this.currentScene=new wi(this.input,this.context,this.player,n,t,(r,i)=>this.onBuy(r,i,t),(r,i)=>this.onSell(r,i,t),()=>this.goToStation(),()=>this.goToShip())}goToMissionBoard(){this.currentScene=new Ci(this.input,this.context,this.player,this.player.destinationId,()=>this.goToStation(),()=>this.goToShip())}goToShip(){this.currentScene=new Ki(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo())}goToCargo(){this.currentScene=new qi(this.input,this.context,this.player,()=>this.goToShip())}goToTravelMenu(){this.currentScene=new In(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap())}goToArrival(){this.currentScene=new In(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap())}goToGalaxyMap(){this.currentScene=new tr(this.input,this.context,this.player,()=>this.goToTravelMenu())}goToFlyIntoSpace(){this.player.undock(),this.currentScene=new Pn(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(n){this.player.dock(n),this.currentScene=new Pn(this.player,this.context,()=>this.goToShip())}onJumpSelected(n){const t=Se(this.player.systemId,n),r=ct(this.player.driveId),i=Math.ceil(ut*t.distance*r.fuelEfficiency);this.player.consumeFuel(i),this.player.jumpTo(n),this.currentScene=new rr(this.player,this.context,()=>this.goToArrival())}}const xr=`---
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
`,kr=`---
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
`,Cr=`---
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
`,Tr=`---
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
`,Ar=`---
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
`,Sr=`---
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
`,Ir=`---
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
`,Er=`---
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
`,Mr=`---
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
`,Lr=`---
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
`,Rr=`---
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
`,Or=`---
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
`,Fr=`---
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
`,Nr=`---
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
`,Dr=`---
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
`,Pr=`---
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
`,Ur=`---
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
`,Hr=`---
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
`,Br=`---
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
`,$r=`---
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
`,Gr=`---
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
`,jr=`---
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
`,Wr=`---
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
`,Yr=`---
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
`,Kr=`---
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
`,qr=`---
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
`,Vr=`---
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
`,zr=`---
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
`,Xr=`---
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
`,Jr=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,Qr=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,Zr=`---
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
`,eo=`---
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
`,no=`---
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

Long range engines for faster than light travel between systems.`,to=`---
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
`,io=`---
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
`,ro=`---
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
`,oo=`---
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
`,so=`---
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
`,ao=`---
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
`,lo=`---
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
`,co=`---
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
`,ho=`---
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
`,uo=`---
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
`,po=`---
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
`,fo=`---
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
`,mo=`---
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
`,go=`---
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
`,yo=`---
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
`,bo=`---
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
`;var T={},me={},D={};function pt(e){return typeof e>"u"||e===null}function _o(e){return typeof e=="object"&&e!==null}function vo(e){return Array.isArray(e)?e:pt(e)?[]:[e]}function wo(e,n){var t,r,i,o;if(n)for(o=Object.keys(n),t=0,r=o.length;t<r;t+=1)i=o[t],e[i]=n[i];return e}function xo(e,n){var t="",r;for(r=0;r<n;r+=1)t+=e;return t}function ko(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}D.isNothing=pt;D.isObject=_o;D.toArray=vo;D.repeat=xo;D.isNegativeZero=ko;D.extend=wo;function ue(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}ue.prototype=Object.create(Error.prototype);ue.prototype.constructor=ue;ue.prototype.toString=function(n){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!n&&this.mark&&(t+=" "+this.mark.toString()),t};var ge=ue,Wn=D;function on(e,n,t,r,i){this.name=e,this.buffer=n,this.position=t,this.line=r,this.column=i}on.prototype.getSnippet=function(n,t){var r,i,o,s,a;if(!this.buffer)return null;for(n=n||4,t=t||75,r="",i=this.position;i>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(i-1))===-1;)if(i-=1,this.position-i>t/2-1){r=" ... ",i+=5;break}for(o="",s=this.position;s<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s))===-1;)if(s+=1,s-this.position>t/2-1){o=" ... ",s-=5;break}return a=this.buffer.slice(i,s),Wn.repeat(" ",n)+r+a+o+`
`+Wn.repeat(" ",n+this.position-i+r.length)+"^"};on.prototype.toString=function(n){var t,r="";return this.name&&(r+='in "'+this.name+'" '),r+="at line "+(this.line+1)+", column "+(this.column+1),n||(t=this.getSnippet(),t&&(r+=`:
`+t)),r};var Co=on,Yn=ge,To=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],Ao=["scalar","sequence","mapping"];function So(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(r){n[String(r)]=t})}),n}function Io(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(To.indexOf(t)===-1)throw new Yn('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=So(n.styleAliases||null),Ao.indexOf(this.kind)===-1)throw new Yn('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var L=Io,Kn=D,Ie=ge,Eo=L;function en(e,n,t){var r=[];return e.include.forEach(function(i){t=en(i,n,t)}),e[n].forEach(function(i){t.forEach(function(o,s){o.tag===i.tag&&o.kind===i.kind&&r.push(s)}),t.push(i)}),t.filter(function(i,o){return r.indexOf(o)===-1})}function Mo(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,t;function r(i){e[i.kind][i.tag]=e.fallback[i.tag]=i}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(r);return e}function Z(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new Ie("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=en(this,"implicit",[]),this.compiledExplicit=en(this,"explicit",[]),this.compiledTypeMap=Mo(this.compiledImplicit,this.compiledExplicit)}Z.DEFAULT=null;Z.create=function(){var n,t;switch(arguments.length){case 1:n=Z.DEFAULT,t=arguments[0];break;case 2:n=arguments[0],t=arguments[1];break;default:throw new Ie("Wrong number of arguments for Schema.create function")}if(n=Kn.toArray(n),t=Kn.toArray(t),!n.every(function(r){return r instanceof Z}))throw new Ie("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(r){return r instanceof Eo}))throw new Ie("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new Z({include:n,explicit:t})};var oe=Z,Lo=L,Ro=new Lo("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),Oo=L,Fo=new Oo("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),No=L,Do=new No("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Po=oe,sn=new Po({explicit:[Ro,Fo,Do]}),Uo=L;function Ho(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function Bo(){return null}function $o(e){return e===null}var Go=new Uo("tag:yaml.org,2002:null",{kind:"scalar",resolve:Ho,construct:Bo,predicate:$o,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),jo=L;function Wo(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function Yo(e){return e==="true"||e==="True"||e==="TRUE"}function Ko(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var qo=new jo("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Wo,construct:Yo,predicate:Ko,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),Vo=D,zo=L;function Xo(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function Jo(e){return 48<=e&&e<=55}function Qo(e){return 48<=e&&e<=57}function Zo(e){if(e===null)return!1;var n=e.length,t=0,r=!1,i;if(!n)return!1;if(i=e[t],(i==="-"||i==="+")&&(i=e[++t]),i==="0"){if(t+1===n)return!0;if(i=e[++t],i==="b"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(i!=="0"&&i!=="1")return!1;r=!0}return r&&i!=="_"}if(i==="x"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(!Xo(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}for(;t<n;t++)if(i=e[t],i!=="_"){if(!Jo(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}if(i==="_")return!1;for(;t<n;t++)if(i=e[t],i!=="_"){if(i===":")break;if(!Qo(e.charCodeAt(t)))return!1;r=!0}return!r||i==="_"?!1:i!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function es(e){var n=e,t=1,r,i,o=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),r=n[0],(r==="-"||r==="+")&&(r==="-"&&(t=-1),n=n.slice(1),r=n[0]),n==="0"?0:r==="0"?n[1]==="b"?t*parseInt(n.slice(2),2):n[1]==="x"?t*parseInt(n,16):t*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(s){o.unshift(parseInt(s,10))}),n=0,i=1,o.forEach(function(s){n+=s*i,i*=60}),t*n):t*parseInt(n,10)}function ns(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!Vo.isNegativeZero(e)}var ts=new zo("tag:yaml.org,2002:int",{kind:"scalar",resolve:Zo,construct:es,predicate:ns,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),ft=D,is=L,rs=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function os(e){return!(e===null||!rs.test(e)||e[e.length-1]==="_")}function ss(e){var n,t,r,i;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,i=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(o){i.unshift(parseFloat(o,10))}),n=0,r=1,i.forEach(function(o){n+=o*r,r*=60}),t*n):t*parseFloat(n,10)}var as=/^[-+]?[0-9]+e/;function ls(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(ft.isNegativeZero(e))return"-0.0";return t=e.toString(10),as.test(t)?t.replace("e",".e"):t}function cs(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||ft.isNegativeZero(e))}var hs=new is("tag:yaml.org,2002:float",{kind:"scalar",resolve:os,construct:ss,predicate:cs,represent:ls,defaultStyle:"lowercase"}),ds=oe,mt=new ds({include:[sn],implicit:[Go,qo,ts,hs]}),us=oe,gt=new us({include:[mt]}),ps=L,yt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),bt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function fs(e){return e===null?!1:yt.exec(e)!==null||bt.exec(e)!==null}function ms(e){var n,t,r,i,o,s,a,l=0,c=null,h,d,u;if(n=yt.exec(e),n===null&&(n=bt.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],r=+n[2]-1,i=+n[3],!n[4])return new Date(Date.UTC(t,r,i));if(o=+n[4],s=+n[5],a=+n[6],n[7]){for(l=n[7].slice(0,3);l.length<3;)l+="0";l=+l}return n[9]&&(h=+n[10],d=+(n[11]||0),c=(h*60+d)*6e4,n[9]==="-"&&(c=-c)),u=new Date(Date.UTC(t,r,i,o,s,a,l)),c&&u.setTime(u.getTime()-c),u}function gs(e){return e.toISOString()}var ys=new ps("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:fs,construct:ms,instanceOf:Date,represent:gs}),bs=L;function _s(e){return e==="<<"||e===null}var vs=new bs("tag:yaml.org,2002:merge",{kind:"scalar",resolve:_s});function _t(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var z;try{var ws=_t;z=ws("buffer").Buffer}catch{}var xs=L,an=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function ks(e){if(e===null)return!1;var n,t,r=0,i=e.length,o=an;for(t=0;t<i;t++)if(n=o.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;r+=6}return r%8===0}function Cs(e){var n,t,r=e.replace(/[\r\n=]/g,""),i=r.length,o=an,s=0,a=[];for(n=0;n<i;n++)n%4===0&&n&&(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)),s=s<<6|o.indexOf(r.charAt(n));return t=i%4*6,t===0?(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)):t===18?(a.push(s>>10&255),a.push(s>>2&255)):t===12&&a.push(s>>4&255),z?z.from?z.from(a):new z(a):a}function Ts(e){var n="",t=0,r,i,o=e.length,s=an;for(r=0;r<o;r++)r%3===0&&r&&(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]),t=(t<<8)+e[r];return i=o%3,i===0?(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]):i===2?(n+=s[t>>10&63],n+=s[t>>4&63],n+=s[t<<2&63],n+=s[64]):i===1&&(n+=s[t>>2&63],n+=s[t<<4&63],n+=s[64],n+=s[64]),n}function As(e){return z&&z.isBuffer(e)}var Ss=new xs("tag:yaml.org,2002:binary",{kind:"scalar",resolve:ks,construct:Cs,predicate:As,represent:Ts}),Is=L,Es=Object.prototype.hasOwnProperty,Ms=Object.prototype.toString;function Ls(e){if(e===null)return!0;var n=[],t,r,i,o,s,a=e;for(t=0,r=a.length;t<r;t+=1){if(i=a[t],s=!1,Ms.call(i)!=="[object Object]")return!1;for(o in i)if(Es.call(i,o))if(!s)s=!0;else return!1;if(!s)return!1;if(n.indexOf(o)===-1)n.push(o);else return!1}return!0}function Rs(e){return e!==null?e:[]}var Os=new Is("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Ls,construct:Rs}),Fs=L,Ns=Object.prototype.toString;function Ds(e){if(e===null)return!0;var n,t,r,i,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1){if(r=s[n],Ns.call(r)!=="[object Object]"||(i=Object.keys(r),i.length!==1))return!1;o[n]=[i[0],r[i[0]]]}return!0}function Ps(e){if(e===null)return[];var n,t,r,i,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1)r=s[n],i=Object.keys(r),o[n]=[i[0],r[i[0]]];return o}var Us=new Fs("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Ds,construct:Ps}),Hs=L,Bs=Object.prototype.hasOwnProperty;function $s(e){if(e===null)return!0;var n,t=e;for(n in t)if(Bs.call(t,n)&&t[n]!==null)return!1;return!0}function Gs(e){return e!==null?e:{}}var js=new Hs("tag:yaml.org,2002:set",{kind:"mapping",resolve:$s,construct:Gs}),Ws=oe,ye=new Ws({include:[gt],implicit:[ys,vs],explicit:[Ss,Os,Us,js]}),Ys=L;function Ks(){return!0}function qs(){}function Vs(){return""}function zs(e){return typeof e>"u"}var Xs=new Ys("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:Ks,construct:qs,predicate:zs,represent:Vs}),Js=L;function Qs(e){if(e===null||e.length===0)return!1;var n=e,t=/\/([gim]*)$/.exec(e),r="";return!(n[0]==="/"&&(t&&(r=t[1]),r.length>3||n[n.length-r.length-1]!=="/"))}function Zs(e){var n=e,t=/\/([gim]*)$/.exec(e),r="";return n[0]==="/"&&(t&&(r=t[1]),n=n.slice(1,n.length-r.length-1)),new RegExp(n,r)}function ea(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function na(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var ta=new Js("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:Qs,construct:Zs,predicate:na,represent:ea}),Le;try{var ia=_t;Le=ia("esprima")}catch{typeof window<"u"&&(Le=window.esprima)}var ra=L;function oa(e){if(e===null)return!1;try{var n="("+e+")",t=Le.parse(n,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function sa(e){var n="("+e+")",t=Le.parse(n,{range:!0}),r=[],i;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(o){r.push(o.name)}),i=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(r,n.slice(i[0]+1,i[1]-1)):new Function(r,"return "+n.slice(i[0],i[1]))}function aa(e){return e.toString()}function la(e){return Object.prototype.toString.call(e)==="[object Function]"}var ca=new ra("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:oa,construct:sa,predicate:la,represent:aa}),qn=oe,De=qn.DEFAULT=new qn({include:[ye],explicit:[Xs,ta,ca]}),$=D,vt=ge,ha=Co,wt=ye,da=De,K=Object.prototype.hasOwnProperty,Re=1,xt=2,kt=3,Oe=4,Je=1,ua=2,Vn=3,pa=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,fa=/[\x85\u2028\u2029]/,ma=/[,\[\]\{\}]/,Ct=/^(?:!|!!|![a-z\-]+!)$/i,Tt=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function zn(e){return Object.prototype.toString.call(e)}function H(e){return e===10||e===13}function X(e){return e===9||e===32}function F(e){return e===9||e===32||e===10||e===13}function ee(e){return e===44||e===91||e===93||e===123||e===125}function ga(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function ya(e){return e===120?2:e===117?4:e===85?8:0}function ba(e){return 48<=e&&e<=57?e-48:-1}function Xn(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function _a(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function At(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var St=new Array(256),It=new Array(256);for(var Q=0;Q<256;Q++)St[Q]=Xn(Q)?1:0,It[Q]=Xn(Q);function va(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||da,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function Et(e,n){return new vt(n,new ha(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function y(e,n){throw Et(e,n)}function Fe(e,n){e.onWarning&&e.onWarning.call(null,Et(e,n))}var Jn={YAML:function(n,t,r){var i,o,s;n.version!==null&&y(n,"duplication of %YAML directive"),r.length!==1&&y(n,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(r[0]),i===null&&y(n,"ill-formed argument of the YAML directive"),o=parseInt(i[1],10),s=parseInt(i[2],10),o!==1&&y(n,"unacceptable YAML version of the document"),n.version=r[0],n.checkLineBreaks=s<2,s!==1&&s!==2&&Fe(n,"unsupported YAML version of the document")},TAG:function(n,t,r){var i,o;r.length!==2&&y(n,"TAG directive accepts exactly two arguments"),i=r[0],o=r[1],Ct.test(i)||y(n,"ill-formed tag handle (first argument) of the TAG directive"),K.call(n.tagMap,i)&&y(n,'there is a previously declared suffix for "'+i+'" tag handle'),Tt.test(o)||y(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[i]=o}};function W(e,n,t,r){var i,o,s,a;if(n<t){if(a=e.input.slice(n,t),r)for(i=0,o=a.length;i<o;i+=1)s=a.charCodeAt(i),s===9||32<=s&&s<=1114111||y(e,"expected valid JSON character");else pa.test(a)&&y(e,"the stream contains non-printable characters");e.result+=a}}function Qn(e,n,t,r){var i,o,s,a;for($.isObject(t)||y(e,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(t),s=0,a=i.length;s<a;s+=1)o=i[s],K.call(n,o)||(At(n,o,t[o]),r[o]=!0)}function ne(e,n,t,r,i,o,s,a){var l,c;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),l=0,c=i.length;l<c;l+=1)Array.isArray(i[l])&&y(e,"nested arrays are not supported inside keys"),typeof i=="object"&&zn(i[l])==="[object Object]"&&(i[l]="[object Object]");if(typeof i=="object"&&zn(i)==="[object Object]"&&(i="[object Object]"),i=String(i),n===null&&(n={}),r==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)Qn(e,n,o[l],t);else Qn(e,n,o,t);else!e.json&&!K.call(t,i)&&K.call(n,i)&&(e.line=s||e.line,e.position=a||e.position,y(e,"duplicated mapping key")),At(n,i,o),delete t[i];return n}function ln(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):y(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function A(e,n,t){for(var r=0,i=e.input.charCodeAt(e.position);i!==0;){for(;X(i);)i=e.input.charCodeAt(++e.position);if(n&&i===35)do i=e.input.charCodeAt(++e.position);while(i!==10&&i!==13&&i!==0);if(H(i))for(ln(e),i=e.input.charCodeAt(e.position),r++,e.lineIndent=0;i===32;)e.lineIndent++,i=e.input.charCodeAt(++e.position);else break}return t!==-1&&r!==0&&e.lineIndent<t&&Fe(e,"deficient indentation"),r}function Pe(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||F(t)))}function cn(e,n){n===1?e.result+=" ":n>1&&(e.result+=$.repeat(`
`,n-1))}function wa(e,n,t){var r,i,o,s,a,l,c,h,d=e.kind,u=e.result,p;if(p=e.input.charCodeAt(e.position),F(p)||ee(p)||p===35||p===38||p===42||p===33||p===124||p===62||p===39||p===34||p===37||p===64||p===96||(p===63||p===45)&&(i=e.input.charCodeAt(e.position+1),F(i)||t&&ee(i)))return!1;for(e.kind="scalar",e.result="",o=s=e.position,a=!1;p!==0;){if(p===58){if(i=e.input.charCodeAt(e.position+1),F(i)||t&&ee(i))break}else if(p===35){if(r=e.input.charCodeAt(e.position-1),F(r))break}else{if(e.position===e.lineStart&&Pe(e)||t&&ee(p))break;if(H(p))if(l=e.line,c=e.lineStart,h=e.lineIndent,A(e,!1,-1),e.lineIndent>=n){a=!0,p=e.input.charCodeAt(e.position);continue}else{e.position=s,e.line=l,e.lineStart=c,e.lineIndent=h;break}}a&&(W(e,o,s,!1),cn(e,e.line-l),o=s=e.position,a=!1),X(p)||(s=e.position+1),p=e.input.charCodeAt(++e.position)}return W(e,o,s,!1),e.result?!0:(e.kind=d,e.result=u,!1)}function xa(e,n){var t,r,i;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,r=i=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(W(e,r,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)r=e.position,e.position++,i=e.position;else return!0;else H(t)?(W(e,r,i,!0),cn(e,A(e,!1,n)),r=i=e.position):e.position===e.lineStart&&Pe(e)?y(e,"unexpected end of the document within a single quoted scalar"):(e.position++,i=e.position);y(e,"unexpected end of the stream within a single quoted scalar")}function ka(e,n){var t,r,i,o,s,a;if(a=e.input.charCodeAt(e.position),a!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=r=e.position;(a=e.input.charCodeAt(e.position))!==0;){if(a===34)return W(e,t,e.position,!0),e.position++,!0;if(a===92){if(W(e,t,e.position,!0),a=e.input.charCodeAt(++e.position),H(a))A(e,!1,n);else if(a<256&&St[a])e.result+=It[a],e.position++;else if((s=ya(a))>0){for(i=s,o=0;i>0;i--)a=e.input.charCodeAt(++e.position),(s=ga(a))>=0?o=(o<<4)+s:y(e,"expected hexadecimal character");e.result+=_a(o),e.position++}else y(e,"unknown escape sequence");t=r=e.position}else H(a)?(W(e,t,r,!0),cn(e,A(e,!1,n)),t=r=e.position):e.position===e.lineStart&&Pe(e)?y(e,"unexpected end of the document within a double quoted scalar"):(e.position++,r=e.position)}y(e,"unexpected end of the stream within a double quoted scalar")}function Ca(e,n){var t=!0,r,i=e.tag,o,s=e.anchor,a,l,c,h,d,u={},p,g,b,_;if(_=e.input.charCodeAt(e.position),_===91)l=93,d=!1,o=[];else if(_===123)l=125,d=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),_=e.input.charCodeAt(++e.position);_!==0;){if(A(e,!0,n),_=e.input.charCodeAt(e.position),_===l)return e.position++,e.tag=i,e.anchor=s,e.kind=d?"mapping":"sequence",e.result=o,!0;t||y(e,"missed comma between flow collection entries"),g=p=b=null,c=h=!1,_===63&&(a=e.input.charCodeAt(e.position+1),F(a)&&(c=h=!0,e.position++,A(e,!0,n))),r=e.line,ie(e,n,Re,!1,!0),g=e.tag,p=e.result,A(e,!0,n),_=e.input.charCodeAt(e.position),(h||e.line===r)&&_===58&&(c=!0,_=e.input.charCodeAt(++e.position),A(e,!0,n),ie(e,n,Re,!1,!0),b=e.result),d?ne(e,o,u,g,p,b):c?o.push(ne(e,null,u,g,p,b)):o.push(p),A(e,!0,n),_=e.input.charCodeAt(e.position),_===44?(t=!0,_=e.input.charCodeAt(++e.position)):t=!1}y(e,"unexpected end of the stream within a flow collection")}function Ta(e,n){var t,r,i=Je,o=!1,s=!1,a=n,l=0,c=!1,h,d;if(d=e.input.charCodeAt(e.position),d===124)r=!1;else if(d===62)r=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)Je===i?i=d===43?Vn:ua:y(e,"repeat of a chomping mode identifier");else if((h=ba(d))>=0)h===0?y(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?y(e,"repeat of an indentation width identifier"):(a=n+h-1,s=!0);else break;if(X(d)){do d=e.input.charCodeAt(++e.position);while(X(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!H(d)&&d!==0)}for(;d!==0;){for(ln(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!s||e.lineIndent<a)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>a&&(a=e.lineIndent),H(d)){l++;continue}if(e.lineIndent<a){i===Vn?e.result+=$.repeat(`
`,o?1+l:l):i===Je&&o&&(e.result+=`
`);break}for(r?X(d)?(c=!0,e.result+=$.repeat(`
`,o?1+l:l)):c?(c=!1,e.result+=$.repeat(`
`,l+1)):l===0?o&&(e.result+=" "):e.result+=$.repeat(`
`,l):e.result+=$.repeat(`
`,o?1+l:l),o=!0,s=!0,l=0,t=e.position;!H(d)&&d!==0;)d=e.input.charCodeAt(++e.position);W(e,t,e.position,!1)}return!0}function Zn(e,n){var t,r=e.tag,i=e.anchor,o=[],s,a=!1,l;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),l=e.input.charCodeAt(e.position);l!==0&&!(l!==45||(s=e.input.charCodeAt(e.position+1),!F(s)));){if(a=!0,e.position++,A(e,!0,-1)&&e.lineIndent<=n){o.push(null),l=e.input.charCodeAt(e.position);continue}if(t=e.line,ie(e,n,kt,!1,!0),o.push(e.result),A(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&l!==0)y(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return a?(e.tag=r,e.anchor=i,e.kind="sequence",e.result=o,!0):!1}function Aa(e,n,t){var r,i,o,s,a=e.tag,l=e.anchor,c={},h={},d=null,u=null,p=null,g=!1,b=!1,_;for(e.anchor!==null&&(e.anchorMap[e.anchor]=c),_=e.input.charCodeAt(e.position);_!==0;){if(r=e.input.charCodeAt(e.position+1),o=e.line,s=e.position,(_===63||_===58)&&F(r))_===63?(g&&(ne(e,c,h,d,u,null),d=u=p=null),b=!0,g=!0,i=!0):g?(g=!1,i=!0):y(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,_=r;else if(ie(e,t,xt,!1,!0))if(e.line===o){for(_=e.input.charCodeAt(e.position);X(_);)_=e.input.charCodeAt(++e.position);if(_===58)_=e.input.charCodeAt(++e.position),F(_)||y(e,"a whitespace character is expected after the key-value separator within a block mapping"),g&&(ne(e,c,h,d,u,null),d=u=p=null),b=!0,g=!1,i=!1,d=e.tag,u=e.result;else if(b)y(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=a,e.anchor=l,!0}else if(b)y(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=a,e.anchor=l,!0;else break;if((e.line===o||e.lineIndent>n)&&(ie(e,n,Oe,!0,i)&&(g?u=e.result:p=e.result),g||(ne(e,c,h,d,u,p,o,s),d=u=p=null),A(e,!0,-1),_=e.input.charCodeAt(e.position)),e.lineIndent>n&&_!==0)y(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return g&&ne(e,c,h,d,u,null),b&&(e.tag=a,e.anchor=l,e.kind="mapping",e.result=c),b}function Sa(e){var n,t=!1,r=!1,i,o,s;if(s=e.input.charCodeAt(e.position),s!==33)return!1;if(e.tag!==null&&y(e,"duplication of a tag property"),s=e.input.charCodeAt(++e.position),s===60?(t=!0,s=e.input.charCodeAt(++e.position)):s===33?(r=!0,i="!!",s=e.input.charCodeAt(++e.position)):i="!",n=e.position,t){do s=e.input.charCodeAt(++e.position);while(s!==0&&s!==62);e.position<e.length?(o=e.input.slice(n,e.position),s=e.input.charCodeAt(++e.position)):y(e,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!F(s);)s===33&&(r?y(e,"tag suffix cannot contain exclamation marks"):(i=e.input.slice(n-1,e.position+1),Ct.test(i)||y(e,"named tag handle cannot contain such characters"),r=!0,n=e.position+1)),s=e.input.charCodeAt(++e.position);o=e.input.slice(n,e.position),ma.test(o)&&y(e,"tag suffix cannot contain flow indicator characters")}return o&&!Tt.test(o)&&y(e,"tag name cannot contain such characters: "+o),t?e.tag=o:K.call(e.tagMap,i)?e.tag=e.tagMap[i]+o:i==="!"?e.tag="!"+o:i==="!!"?e.tag="tag:yaml.org,2002:"+o:y(e,'undeclared tag handle "'+i+'"'),!0}function Ia(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&y(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!F(t)&&!ee(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&y(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function Ea(e){var n,t,r;if(r=e.input.charCodeAt(e.position),r!==42)return!1;for(r=e.input.charCodeAt(++e.position),n=e.position;r!==0&&!F(r)&&!ee(r);)r=e.input.charCodeAt(++e.position);return e.position===n&&y(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),K.call(e.anchorMap,t)||y(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],A(e,!0,-1),!0}function ie(e,n,t,r,i){var o,s,a,l=1,c=!1,h=!1,d,u,p,g,b;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=s=a=Oe===t||kt===t,r&&A(e,!0,-1)&&(c=!0,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)),l===1)for(;Sa(e)||Ia(e);)A(e,!0,-1)?(c=!0,a=o,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)):a=!1;if(a&&(a=c||i),(l===1||Oe===t)&&(Re===t||xt===t?g=n:g=n+1,b=e.position-e.lineStart,l===1?a&&(Zn(e,b)||Aa(e,b,g))||Ca(e,g)?h=!0:(s&&Ta(e,g)||xa(e,g)||ka(e,g)?h=!0:Ea(e)?(h=!0,(e.tag!==null||e.anchor!==null)&&y(e,"alias node should not have any properties")):wa(e,g,Re===t)&&(h=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(h=a&&Zn(e,b))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&y(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,u=e.implicitTypes.length;d<u;d+=1)if(p=e.implicitTypes[d],p.resolve(e.result)){e.result=p.construct(e.result),e.tag=p.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else K.call(e.typeMap[e.kind||"fallback"],e.tag)?(p=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&p.kind!==e.kind&&y(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+p.kind+'", not "'+e.kind+'"'),p.resolve(e.result)?(e.result=p.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):y(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):y(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||h}function Ma(e){var n=e.position,t,r,i,o=!1,s;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(s=e.input.charCodeAt(e.position))!==0&&(A(e,!0,-1),s=e.input.charCodeAt(e.position),!(e.lineIndent>0||s!==37));){for(o=!0,s=e.input.charCodeAt(++e.position),t=e.position;s!==0&&!F(s);)s=e.input.charCodeAt(++e.position);for(r=e.input.slice(t,e.position),i=[],r.length<1&&y(e,"directive name must not be less than one character in length");s!==0;){for(;X(s);)s=e.input.charCodeAt(++e.position);if(s===35){do s=e.input.charCodeAt(++e.position);while(s!==0&&!H(s));break}if(H(s))break;for(t=e.position;s!==0&&!F(s);)s=e.input.charCodeAt(++e.position);i.push(e.input.slice(t,e.position))}s!==0&&ln(e),K.call(Jn,r)?Jn[r](e,r,i):Fe(e,'unknown document directive "'+r+'"')}if(A(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,A(e,!0,-1)):o&&y(e,"directives end mark is expected"),ie(e,e.lineIndent-1,Oe,!1,!0),A(e,!0,-1),e.checkLineBreaks&&fa.test(e.input.slice(n,e.position))&&Fe(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&Pe(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,A(e,!0,-1));return}if(e.position<e.length-1)y(e,"end of the stream or a document separator is expected");else return}function Mt(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new va(e,n),r=e.indexOf("\0");for(r!==-1&&(t.position=r,y(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)Ma(t);return t.documents}function Lt(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var r=Mt(e,t);if(typeof n!="function")return r;for(var i=0,o=r.length;i<o;i+=1)n(r[i])}function Rt(e,n){var t=Mt(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new vt("expected a single document in the stream, but found more")}}function La(e,n,t){return typeof n=="object"&&n!==null&&typeof t>"u"&&(t=n,n=null),Lt(e,n,$.extend({schema:wt},t))}function Ra(e,n){return Rt(e,$.extend({schema:wt},n))}me.loadAll=Lt;me.load=Rt;me.safeLoadAll=La;me.safeLoad=Ra;var hn={},be=D,_e=ge,Oa=De,Fa=ye,Ot=Object.prototype.toString,Ft=Object.prototype.hasOwnProperty,Na=9,pe=10,Da=13,Pa=32,Ua=33,Ha=34,Nt=35,Ba=37,$a=38,Ga=39,ja=42,Dt=44,Wa=45,Pt=58,Ya=61,Ka=62,qa=63,Va=64,Ut=91,Ht=93,za=96,Bt=123,Xa=124,$t=125,R={};R[0]="\\0";R[7]="\\a";R[8]="\\b";R[9]="\\t";R[10]="\\n";R[11]="\\v";R[12]="\\f";R[13]="\\r";R[27]="\\e";R[34]='\\"';R[92]="\\\\";R[133]="\\N";R[160]="\\_";R[8232]="\\L";R[8233]="\\P";var Ja=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function Qa(e,n){var t,r,i,o,s,a,l;if(n===null)return{};for(t={},r=Object.keys(n),i=0,o=r.length;i<o;i+=1)s=r[i],a=String(n[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),l=e.compiledTypeMap.fallback[s],l&&Ft.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[s]=a;return t}function et(e){var n,t,r;if(n=e.toString(16).toUpperCase(),e<=255)t="x",r=2;else if(e<=65535)t="u",r=4;else if(e<=4294967295)t="U",r=8;else throw new _e("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+be.repeat("0",r-n.length)+n}function Za(e){this.schema=e.schema||Oa,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=be.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=Qa(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function nt(e,n){for(var t=be.repeat(" ",n),r=0,i=-1,o="",s,a=e.length;r<a;)i=e.indexOf(`
`,r),i===-1?(s=e.slice(r),r=a):(s=e.slice(r,i+1),r=i+1),s.length&&s!==`
`&&(o+=t),o+=s;return o}function nn(e,n){return`
`+be.repeat(" ",e.indent*n)}function el(e,n){var t,r,i;for(t=0,r=e.implicitTypes.length;t<r;t+=1)if(i=e.implicitTypes[t],i.resolve(n))return!0;return!1}function dn(e){return e===Pa||e===Na}function re(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function nl(e){return re(e)&&!dn(e)&&e!==65279&&e!==Da&&e!==pe}function tt(e,n){return re(e)&&e!==65279&&e!==Dt&&e!==Ut&&e!==Ht&&e!==Bt&&e!==$t&&e!==Pt&&(e!==Nt||n&&nl(n))}function tl(e){return re(e)&&e!==65279&&!dn(e)&&e!==Wa&&e!==qa&&e!==Pt&&e!==Dt&&e!==Ut&&e!==Ht&&e!==Bt&&e!==$t&&e!==Nt&&e!==$a&&e!==ja&&e!==Ua&&e!==Xa&&e!==Ya&&e!==Ka&&e!==Ga&&e!==Ha&&e!==Ba&&e!==Va&&e!==za}function Gt(e){var n=/^\n* /;return n.test(e)}var jt=1,Wt=2,Yt=3,Kt=4,Ee=5;function il(e,n,t,r,i){var o,s,a,l=!1,c=!1,h=r!==-1,d=-1,u=tl(e.charCodeAt(0))&&!dn(e.charCodeAt(e.length-1));if(n)for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),!re(s))return Ee;a=o>0?e.charCodeAt(o-1):null,u=u&&tt(s,a)}else{for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),s===pe)l=!0,h&&(c=c||o-d-1>r&&e[d+1]!==" ",d=o);else if(!re(s))return Ee;a=o>0?e.charCodeAt(o-1):null,u=u&&tt(s,a)}c=c||h&&o-d-1>r&&e[d+1]!==" "}return!l&&!c?u&&!i(e)?jt:Wt:t>9&&Gt(e)?Ee:c?Kt:Yt}function rl(e,n,t,r){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&Ja.indexOf(n)!==-1)return"'"+n+"'";var i=e.indent*Math.max(1,t),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-i),s=r||e.flowLevel>-1&&t>=e.flowLevel;function a(l){return el(e,l)}switch(il(n,s,e.indent,o,a)){case jt:return n;case Wt:return"'"+n.replace(/'/g,"''")+"'";case Yt:return"|"+it(n,e.indent)+rt(nt(n,i));case Kt:return">"+it(n,e.indent)+rt(nt(ol(n,o),i));case Ee:return'"'+sl(n)+'"';default:throw new _e("impossible error: invalid scalar style")}}()}function it(e,n){var t=Gt(e)?String(n):"",r=e[e.length-1]===`
`,i=r&&(e[e.length-2]===`
`||e===`
`),o=i?"+":r?"":"-";return t+o+`
`}function rt(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function ol(e,n){for(var t=/(\n+)([^\n]*)/g,r=function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,t.lastIndex=c,ot(e.slice(0,c),n)}(),i=e[0]===`
`||e[0]===" ",o,s;s=t.exec(e);){var a=s[1],l=s[2];o=l[0]===" ",r+=a+(!i&&!o&&l!==""?`
`:"")+ot(l,n),i=o}return r}function ot(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,r,i=0,o,s=0,a=0,l="";r=t.exec(e);)a=r.index,a-i>n&&(o=s>i?s:a,l+=`
`+e.slice(i,o),i=o+1),s=a;return l+=`
`,e.length-i>n&&s>i?l+=e.slice(i,s)+`
`+e.slice(s+1):l+=e.slice(i),l.slice(1)}function sl(e){for(var n="",t,r,i,o=0;o<e.length;o++){if(t=e.charCodeAt(o),t>=55296&&t<=56319&&(r=e.charCodeAt(o+1),r>=56320&&r<=57343)){n+=et((t-55296)*1024+r-56320+65536),o++;continue}i=R[t],n+=!i&&re(t)?e[o]:i||et(t)}return n}function al(e,n,t){var r="",i=e.tag,o,s;for(o=0,s=t.length;o<s;o+=1)J(e,n,t[o],!1,!1)&&(o!==0&&(r+=","+(e.condenseFlow?"":" ")),r+=e.dump);e.tag=i,e.dump="["+r+"]"}function ll(e,n,t,r){var i="",o=e.tag,s,a;for(s=0,a=t.length;s<a;s+=1)J(e,n+1,t[s],!0,!0)&&((!r||s!==0)&&(i+=nn(e,n)),e.dump&&pe===e.dump.charCodeAt(0)?i+="-":i+="- ",i+=e.dump);e.tag=o,e.dump=i||"[]"}function cl(e,n,t){var r="",i=e.tag,o=Object.keys(t),s,a,l,c,h;for(s=0,a=o.length;s<a;s+=1)h="",s!==0&&(h+=", "),e.condenseFlow&&(h+='"'),l=o[s],c=t[l],J(e,n,l,!1,!1)&&(e.dump.length>1024&&(h+="? "),h+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),J(e,n,c,!1,!1)&&(h+=e.dump,r+=h));e.tag=i,e.dump="{"+r+"}"}function hl(e,n,t,r){var i="",o=e.tag,s=Object.keys(t),a,l,c,h,d,u;if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys=="function")s.sort(e.sortKeys);else if(e.sortKeys)throw new _e("sortKeys must be a boolean or a function");for(a=0,l=s.length;a<l;a+=1)u="",(!r||a!==0)&&(u+=nn(e,n)),c=s[a],h=t[c],J(e,n+1,c,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&pe===e.dump.charCodeAt(0)?u+="?":u+="? "),u+=e.dump,d&&(u+=nn(e,n)),J(e,n+1,h,!0,d)&&(e.dump&&pe===e.dump.charCodeAt(0)?u+=":":u+=": ",u+=e.dump,i+=u));e.tag=o,e.dump=i||"{}"}function st(e,n,t){var r,i,o,s,a,l;for(i=t?e.explicitTypes:e.implicitTypes,o=0,s=i.length;o<s;o+=1)if(a=i[o],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof n=="object"&&n instanceof a.instanceOf)&&(!a.predicate||a.predicate(n))){if(e.tag=t?a.tag:"?",a.represent){if(l=e.styleMap[a.tag]||a.defaultStyle,Ot.call(a.represent)==="[object Function]")r=a.represent(n,l);else if(Ft.call(a.represent,l))r=a.represent[l](n,l);else throw new _e("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');e.dump=r}return!0}return!1}function J(e,n,t,r,i,o){e.tag=null,e.dump=t,st(e,t,!1)||st(e,t,!0);var s=Ot.call(e.dump);r&&(r=e.flowLevel<0||e.flowLevel>n);var a=s==="[object Object]"||s==="[object Array]",l,c;if(a&&(l=e.duplicates.indexOf(t),c=l!==-1),(e.tag!==null&&e.tag!=="?"||c||e.indent!==2&&n>0)&&(i=!1),c&&e.usedDuplicates[l])e.dump="*ref_"+l;else{if(a&&c&&!e.usedDuplicates[l]&&(e.usedDuplicates[l]=!0),s==="[object Object]")r&&Object.keys(e.dump).length!==0?(hl(e,n,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(cl(e,n,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump));else if(s==="[object Array]"){var h=e.noArrayIndent&&n>0?n-1:n;r&&e.dump.length!==0?(ll(e,h,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(al(e,h,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump))}else if(s==="[object String]")e.tag!=="?"&&rl(e,e.dump,n,o);else{if(e.skipInvalid)return!1;throw new _e("unacceptable kind of an object to dump "+s)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function dl(e,n){var t=[],r=[],i,o;for(tn(e,t,r),i=0,o=r.length;i<o;i+=1)n.duplicates.push(t[r[i]]);n.usedDuplicates=new Array(o)}function tn(e,n,t){var r,i,o;if(e!==null&&typeof e=="object")if(i=n.indexOf(e),i!==-1)t.indexOf(i)===-1&&t.push(i);else if(n.push(e),Array.isArray(e))for(i=0,o=e.length;i<o;i+=1)tn(e[i],n,t);else for(r=Object.keys(e),i=0,o=r.length;i<o;i+=1)tn(e[r[i]],n,t)}function qt(e,n){n=n||{};var t=new Za(n);return t.noRefs||dl(e,t),J(t,0,e,!0,!0)?t.dump+`
`:""}function ul(e,n){return qt(e,be.extend({schema:Fa},n))}hn.dump=qt;hn.safeDump=ul;var Ue=me,Vt=hn;function He(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}T.Type=L;T.Schema=oe;T.FAILSAFE_SCHEMA=sn;T.JSON_SCHEMA=mt;T.CORE_SCHEMA=gt;T.DEFAULT_SAFE_SCHEMA=ye;T.DEFAULT_FULL_SCHEMA=De;T.load=Ue.load;T.loadAll=Ue.loadAll;T.safeLoad=Ue.safeLoad;T.safeLoadAll=Ue.safeLoadAll;T.dump=Vt.dump;T.safeDump=Vt.safeDump;T.YAMLException=ge;T.MINIMAL_SCHEMA=sn;T.SAFE_SCHEMA=ye;T.DEFAULT_SCHEMA=De;T.scan=He("scan");T.parse=He("parse");T.compose=He("compose");T.addConstructor=He("addConstructor");var pl=T,fl=pl;function ml(e){if(!e.startsWith(`---
`))return{data:{},content:e};const n=e.indexOf(`
---`,4);if(n===-1)return{data:{},content:e};const t=e.slice(4,n),r=e.slice(n+4),i=r.startsWith(`
`)?r.slice(1):r;return{data:fl.safeLoad(t)??{},content:i}}function gl(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[]};for(const[t,r]of Object.entries(e)){const i=t.split("/").pop()??"";if(i==="_template.md"||i===".gitkeep")continue;const{data:o,content:s}=ml(r);/^systems\/[^/]+\.md$/.test(t)?n.systems.push(yl(o,s)):/^destinations\/[^/]+\.md$/.test(t)?n.destinations.push(bl(o,s)):/^factions\/[^/]+\.md$/.test(t)?n.factions.push(_l(o,s)):/^ships\/[^/]+\.md$/.test(t)?n.ships.push(vl(o,s)):t==="ships/components/jump-drives.md"?n.drives=wl(o):t==="navigation/jump-routes.md"?n.routes=xl(o):t==="commodities.md"?n.commodities=kl(o):/^story\/[^/]+\.md$/.test(t)?n.storyBeats.push(Cl(o,s)):t==="game-settings.md"&&(n.settings=Tl(o))}return n}function Be(e){const n=[];let t=!1;for(const r of e.split(`
`)){const i=r.trim();if(!i.startsWith("#"))if(i===""){if(t)break}else t=!0,n.push(i)}return n.join(" ")}function yl(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economy:e.economy??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:Be(n)}}function bl(e,n){const t=e.amenities??{},r={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:r,npcs:e.npcs??{},goodsBias:e.goods_bias??[],dangerLevel:e.danger_level,tags:e.tags??[],description:Be(n)}}function _l(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:Be(n)}}function vl(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,tags:e.tags??[],description:Be(n)}}function wl(e){return(e.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function xl(e){return(e.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function kl(e){return(e.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function Cl(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function Tl(e){var n,t,r,i;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((t=e.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((r=e.starting_location)==null?void 0:r.system)??"",destination:((i=e.starting_location)==null?void 0:i.destination)??""},startingShip:e.starting_ship??""}}function Al(){const e=Object.assign({"/docs/world/commodities.md":xr,"/docs/world/destinations/_template.md":kr,"/docs/world/destinations/blackwake-yard.md":Cr,"/docs/world/destinations/ceti-landfall.md":Tr,"/docs/world/destinations/drift-market.md":Ar,"/docs/world/destinations/elysium-station.md":Sr,"/docs/world/destinations/eridani-anchorage.md":Ir,"/docs/world/destinations/foundries-platform.md":Er,"/docs/world/destinations/galileo-transfer.md":Mr,"/docs/world/destinations/hestia-ring.md":Lr,"/docs/world/destinations/keelhaul-station.md":Rr,"/docs/world/destinations/kepler-yard.md":Or,"/docs/world/destinations/mars-anchor.md":Fr,"/docs/world/destinations/meridian-station.md":Nr,"/docs/world/destinations/new-horizon-port.md":Dr,"/docs/world/destinations/orrery-anchorage.md":Pr,"/docs/world/destinations/redline-station.md":Ur,"/docs/world/destinations/tycho-orbital.md":Hr,"/docs/world/destinations/veil-station.md":Br,"/docs/world/destinations/waypoint-ceti.md":$r,"/docs/world/factions/_template.md":Gr,"/docs/world/factions/centauri-trade-league.md":jr,"/docs/world/factions/eridani-colonial-council.md":Wr,"/docs/world/factions/free-captains.md":Yr,"/docs/world/factions/grey-market-cartel.md":Kr,"/docs/world/factions/helios-directorate.md":qr,"/docs/world/factions/independent-miners-guild.md":Vr,"/docs/world/factions/procyon-institute.md":zr,"/docs/world/factions/terran-union.md":Xr,"/docs/world/galaxy-map.md":Jr,"/docs/world/game-settings.md":Qr,"/docs/world/navigation/jump-routes.md":Zr,"/docs/world/ships/_template.md":eo,"/docs/world/ships/components/jump-drives.md":no,"/docs/world/ships/freighter.md":to,"/docs/world/ships/hauler.md":io,"/docs/world/ships/scout.md":ro,"/docs/world/story/_template.md":oo,"/docs/world/story/enter-wolf-359.md":so,"/docs/world/story/first-jump.md":ao,"/docs/world/story/opening-arrival.md":lo,"/docs/world/systems/_template.md":co,"/docs/world/systems/alpha-centauri.md":ho,"/docs/world/systems/barnards-star.md":uo,"/docs/world/systems/epsilon-eridani.md":po,"/docs/world/systems/procyon.md":fo,"/docs/world/systems/sirius.md":mo,"/docs/world/systems/sol.md":go,"/docs/world/systems/tau-ceti.md":yo,"/docs/world/systems/wolf-359.md":bo}),n={};for(const[t,r]of Object.entries(e)){const i=t.replace("/docs/world/","");n[i]=r}return gl(n)}hi(Al());const Sl=navigator.maxTouchPoints>0?"touch":"keyboard",Il=new URLSearchParams(window.location.search).has("debug"),zt={environment:"browser",primaryInput:Sl,debug:Il},El=new ni,Xt=new oi(zt);Xt.connect();const Ml=new wr(El,Xt,zt);let at=0;function Jt(e){Ml.tick(e-at),at=e,requestAnimationFrame(Jt)}requestAnimationFrame(Jt);
