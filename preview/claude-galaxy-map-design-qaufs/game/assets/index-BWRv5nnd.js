(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const le=40,xe=30,Wt=50,We=24;function Yt(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class Kt{constructor(){this.charW=0,this.charH=0,this.gridH=xe,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(le),this.pre.dataset.gridRows=String(xe),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${We}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${We}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const t=n.getBoundingClientRect();document.body.removeChild(n),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(le*this.charW),window.innerHeight/(xe*this.charH)),t=Math.max(xe,Math.min(Wt,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${We*n}px`,this.pre.style.width=`${le*this.charW*n}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const i of this.resizeHandlers)i(le,t)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const t=[];for(const i of n){let r="";for(const o of i){const s=o.fg!=="transparent"?`fg-${o.fg}`:"",a=o.bg!=="transparent"?`bg-${o.bg}`:"",l=s&&a?`${s} ${a}`:s||a,c=l?` class="${l}"`:"";r+=`<span${c}>${Yt(o.char)}</span>`}t.push(r)}this.pre.innerHTML=t.join(`
`)}getWidth(){return le}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const qt={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},zt=new Set(["0","1","2","3","4","5","6","7","8","9"]),Vt=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class Jt{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}connect(){this.keyListener=n=>{if(Vt.has(n.key)&&n.preventDefault(),zt.has(n.key))for(const i of this.charInputHandlers.slice())i(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const i of this.charInputHandlers.slice())i("\b");return}const t=qt[n.key];if(t)for(const i of this.actionHandlers.slice())i(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=n=>{const t=this.pointerStartMap.get(n.pointerId),i=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),!t){this.logDebug(`UP id=${n.pointerId} NO START`);return}const r=n.clientX-t.startX,o=n.clientY-t.startY,s=Math.abs(r),a=Math.abs(o);if(s<20&&a<20)if(i>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;s>=a?l=r>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(r)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=n=>{this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const t=n.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(n,t){const i=document.querySelector(".game-screen");if(!i)return null;const r=i.getBoundingClientRect(),o=parseInt(i.dataset.gridCols??"1"),s=parseInt(i.dataset.gridRows??"1");if(!o||!s||!r.width||!r.height)return null;const a=Math.floor((n-r.left)/(r.width/o)),l=Math.floor((t-r.top)/(r.height/s));return a<0||a>=o||l<0||l>=s?null:{col:a,row:l}}}function f(e,n,t,i,r,o){if(n<0||n>=e.length)return;const s=e[n];for(let a=0;a<i.length;a++){const l=t+a;l>=0&&l<s.length&&(s[l]={char:i[a],fg:r,bg:o})}}function x(e,n,t,i,r){if(n<0||n>=e.length)return;const o=e[n].length,s=Math.max(0,Math.floor((o-t.length)/2));f(e,n,s,t,i,r)}function nt(e,n){const t=e.split(/\s+/).filter(Boolean),i=[];let r="";for(const o of t)r.length===0?r=o:r.length+1+o.length<=n?r+=" "+o:(i.push(r),r=o);return r.length>0&&i.push(r),i}const un=["UNTITLED","SPACE GAME"],Xt=4,Qt=3,Zt="- An ASCII space adventure -",ei=11,pn=16;class fn{constructor(n,t,i,r){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,r()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),n.onAction(o=>{this.activated||(o==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:o==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:o==="SELECT"&&this.items[this.cursorIdx].action())}),n.onTap&&n.onTap((o,s)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(s===pn+a){this.cursorIdx=a,this.items[a].action();return}}})}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let s=0;s<t;s++)for(let a=0;a<i;a++)n[s][a]={char:" ",fg:"black",bg:"black"};for(let s=0;s<un.length;s++)x(n,Xt+s*Qt,un[s],"bright-cyan","black");x(n,ei,Zt,"white","black");const r=this.items.reduce((s,a)=>Math.max(s,a.label.length+2),0),o=Math.max(0,Math.floor((i-r)/2));for(let s=0;s<this.items.length;s++){const a=pn+s;if(a>=t)continue;const l=s===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";f(n,a,o,c+this.items[s].label,h,"black")}}}let ze=null;function ni(e){ze=e}function U(){if(ze===null)throw new Error("World not initialised — call initWorld() before accessing world data");return ze}function Re(e){return U().systems.find(n=>n.id===e)}function j(e){return U().destinations.find(n=>n.id===e)}function Ze(e){return U().routes.filter(n=>n.from===e||n.to===e)}function V(e){return U().drives.find(n=>n.id===e)}function ti(e){return U().storyBeats.filter(n=>n.trigger===e)}function ii(){return U().settings}function tt(e){return U().ships.find(n=>n.id===e)}function Y(e,n){return U().routes.find(t=>t.from===e&&t.to===n||t.from===n&&t.to===e)}function ie(e){return U().commodities.find(n=>n.id===e)}function ri(){return U().commodities}function oi(){return U().systems.filter(e=>e.playerKnowledge==="public")}function si(e){return e.reduce((n,t)=>{const i=ie(t.commodityId);return n+t.qty*((i==null?void 0:i.weightKg)??0)},0)}const I=3;function it(e,n){return n?e-2:e}function ai(e){return e.toLocaleString("en-US")}class me{constructor(n,t){this.buttonRanges=null,this.footerRow=-1,this.context=n,this.player=t}render(n,t){const i=n.length,r=i>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader&&(this.renderHeaderRow0(n,r,t.systemLabel),this.renderHeaderRow1(n,r,t.destinationLabel)),t.showFooter&&(this.renderFooter(n,i,r,t.navOptions),this.footerRow=i-1)}renderHeaderRow0(n,t,i){const r=i!==void 0?i??"":(()=>{const c=Re(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),o="::";f(n,0,0,o,"bright-black","black"),f(n,0,o.length,r,"bright-cyan","black");const a=t-o.length-r.length-10;let l=o.length+r.length;for(let c=0;c<a;c++)n[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,f(n,0,l,"[M]","white","black"),l+=3,f(n,0,l," MENU","white","black"),l+=5,f(n,0,l,"::","bright-black","black")}renderHeaderRow1(n,t,i){const r=i!==void 0?i??"":(()=>{const h=this.player.destinationId?j(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),o=ai(this.player.credits),s=o.length+5,a="::";f(n,1,0,a,"bright-black","black"),f(n,1,a.length,r,"cyan","black");const l=t-a.length-r.length-s;let c=a.length+r.length;for(let h=0;h<l;h++)n[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,f(n,1,c,o,"green","black"),c+=o.length,f(n,1,c," CR","white","black"),c+=3,f(n,1,c,"::","bright-black","black")}renderFooter(n,t,i,r){const o=t-1,s=[];if(r.length===0){for(let l=0;l<i;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}f(n,o,0,"::","bright-black","black");let a=2;for(let l=0;l<r.length;l++){l>0&&(f(n,o,a,"::","bright-black","black"),a+=2);const c=r[l],h=`[${l+1}]`,d=` ${c.label}`,p=a;f(n,o,a,h,"white","black"),a+=h.length,f(n,o,a,d,"white","black"),a+=d.length,s.push({id:c.id,startCol:p,endCol:a})}for(let l=a;l<i;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=s}hitTestNav(n,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const i of this.buttonRanges)if(n>=i.startCol&&n<i.endCol)return i.id;return null}}const li=3,mn=5;class ci{constructor(n,t,i,r){this.activated=!1,this.pageIndex=0,this.onContinue=r,this.chrome=new me(t,i);const s=ti("game-start")[0].text.split(`

`),a=s[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=s.slice(1)):(this.yearHeader="",l=s);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),p=nt(d,36);h>0&&c.push(""),c.push(...p)}this.bodyLines=c,n.onAction(h=>{this.activated||(h==="SELECT"?(this.activated=!0,this.onContinue()):h==="LEFT"?this.pageIndex>0&&this.pageIndex--:h==="RIGHT"&&this.pageIndex++)}),n.onTap&&n.onTap((h,d)=>{this.activated||(this.activated=!0,this.onContinue())})}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let d=0;d<t;d++)for(let p=0;p<i;p++)n[d][p]={char:" ",fg:"black",bg:"black"};if(this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:[]}),this.yearHeader){const d=Math.max(0,Math.floor((i-this.yearHeader.length)/2));f(n,li,d,this.yearHeader,"bright-yellow","black")}const o=t-3-mn,s=Math.max(1,Math.ceil(this.bodyLines.length/o));this.pageIndex>=s&&(this.pageIndex=s-1);const a=s>1,l=this.pageIndex*o,c=Math.min(l+o,this.bodyLines.length);let h=mn;for(let d=l;d<c;d++){const p=this.bodyLines[d];p!==""&&f(n,h,2,p,"white","black"),h++}if(a){const d=`< ${this.pageIndex+1}/${s} >`,p=i-9;f(n,t-3,p,d,"bright-black","black")}}}const en=5,ce=10;class Pe{constructor(n,t,i,r,o,s,a=[],l=null){this.activeTabIdx=0,this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.activated=!1,this.modal=null,this.title=n,this._staticItems=t,this.tabs=l,this.context=o,this.player=s,this.chrome=new me(o,s),this.navOptions=i,this.infoLines=a,this.itemStartRow=l!==null?I+5:I+3+a.length,r.onCharInput&&r.onCharInput(c=>{this.modal!==null&&this.modal.handleCharInput(c)}),r.onAction(c=>{if(this.modal!==null){this.modal.handleAction(c);return}this.activated||(c==="UP"?this.moveCursor(-1):c==="DOWN"?this.moveCursor(1):c==="LEFT"&&this.tabs!==null?(this.activeTabIdx=Math.max(0,this.activeTabIdx-1),this.resetCursor()):c==="RIGHT"&&this.tabs!==null?(this.activeTabIdx=Math.min(this.tabs.length-1,this.activeTabIdx+1),this.resetCursor()):c==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):c==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):c==="SELECT"?this.activateCurrent():this.handleNavAction(c))}),this.resetCursor(),r.onTap&&r.onTap((c,h)=>{if(this.modal!==null){this.modal.handleTap(c,h);return}if(this.activated)return;const d=this.chrome.hitTestNav(c,h);if(d!==null){this.handleNavTap(d);return}if(this.tabs!==null&&h===I+3){let u=3;for(let m=0;m<this.tabs.length;m++){const v=this.tabs[m].label.length+2;if(c>=u&&c<u+v){this.activeTabIdx=m,this.resetCursor();return}u+=v+1}}const p=this.rowToVisibleItemIndex(h);p!==null&&!this.items[p].disabled&&(this.cursorIdx=p,this.activateCurrent())})}get items(){var n;return this.tabs!==null?((n=this.tabs[this.activeTabIdx])==null?void 0:n.items)??[]:this._staticItems}moveCursor(n){const t=this.items,i=t.length;if(i===0)return;const r=this.cursorIdx===-1?n>0?i-1:0:this.cursorIdx;for(let o=0;o<i;o++){const s=((r+n*(o+1))%i+i)%i;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const n=this.items[this.cursorIdx];n.disabled||(this.activated=!0,n.action())}rowToVisibleItemIndex(n){var r;let t=this.itemStartRow;const i=this.items;for(let o=0;o<i.length;o++){const s=1+(((r=i[o].details)==null?void 0:r.length)??0);if(n>=t&&n<t+s)return o;t+=s}return null}resetCursor(){const n=this.items;for(let t=0;t<n.length;t++)if(!n[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(n){}handleNavTap(n){}openModal(n){this.modal=n}closeModal(){this.modal=null}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:this.navOptions}}update(n){}render(n){var O;const t=n.length,i=t>0?n[0].length:0;for(let y=0;y<t;y++)for(let g=0;g<i;g++)n[y][g]={char:" ",fg:"black",bg:"black"};const r=this.buildChromeConfig();this.chrome.render(n,r),f(n,I,2,this.title,"bright-white","black"),f(n,I+1,2,"'".repeat(this.title.length),"bright-black","black");for(let y=0;y<this.infoLines.length;y++)f(n,I+2+y,2,this.infoLines[y],"bright-black","black");if(this.tabs!==null){const y=I+3;let g=2;n[y][g]={char:"|",fg:"bright-black",bg:"black"},g++;for(let A=0;A<this.tabs.length;A++){const S=A===this.activeTabIdx,b=` ${this.tabs[A].label} `,C=S?"black":"white",L=S?"green":"black";for(const N of b)g<i&&(n[y][g]={char:N,fg:C,bg:L}),g++;g<i&&(n[y][g]={char:"|",fg:"bright-black",bg:"black"}),g++}}const s=it(t,r.showFooter)-1,a=s-this.itemStartRow,l=this.items,c=l.map(y=>{var g;return 1+(((g=y.details)==null?void 0:g.length)??0)}),d=c.reduce((y,g)=>y+g,0)>a,p=d?a-1:a,u=[];let m=[],v=0;for(let y=0;y<c.length;y++)v+c[y]>p?(m.length>0&&u.push(m),m=[y],v=c[y]):(m.push(y),v+=c[y]);m.length>0&&u.push(m),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const w=u[this.pageIndex]??[];let k=this.itemStartRow;for(const y of w){const g=l[y],A=y===this.cursorIdx,S=g.disabled?"bright-black":A?"bright-green":"white",b=g.infoFg??S,C=i-4;if(g.icon!==void 0){const L=g.icon.length;if(f(n,k,2,A?">":" ",S,"black"),f(n,k,3,g.icon,g.iconFg??S,"black"),g.info!==void 0){const we=Math.max(1,C-1-L-g.label.length-2-g.info.length);f(n,k,3+L,g.label+" ",S,"black"),f(n,k,3+L+g.label.length+1,".".repeat(we),"bright-black","black"),f(n,k,3+L+g.label.length+1+we+1,g.info,b,"black")}else f(n,k,3+L,g.label.slice(0,C-1-L),S,"black")}else if(g.info!==void 0){const L=A?"> ":"  ",N=Math.max(1,C-2-g.label.length-2-g.info.length);f(n,k,2,L+g.label+" ",S,"black"),f(n,k,2+L.length+g.label.length+1,".".repeat(N),"bright-black","black"),f(n,k,2+L.length+g.label.length+1+N+1,g.info,b,"black")}else if(g.details!==void 0&&g.details.length>0){f(n,k,2,((A?"> ":"  ")+g.label).slice(0,C),S,"black");for(let N=0;N<g.details.length;N++)k+1+N<=s&&f(n,k+1+N,2,("  "+g.details[N]).slice(0,C),"bright-black","black")}else f(n,k,2,((A?"> ":"  ")+g.label).slice(0,C),S,"black");k+=1+(((O=g.details)==null?void 0:O.length)??0)}if(d){const y=`${this.pageIndex+1}/${this.lastPageCount}`,g=s;f(n,g,0,"|<|","white","black");const A=Math.floor((i-y.length)/2);f(n,g,A,y,"bright-black","black"),f(n,g,i-3,"|>|","white","black")}this.modal!==null&&this.modal.render(n)}}const hi=30;class Ve{constructor(n){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=n,this.value=Math.max(n.field.min,Math.min(n.field.max,n.field.initialValue))}handleAction(n){const{field:t}=this.formDef;if(n==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(n==="UP"){this.value=Math.min(t.max,this.value+1);return}if(n==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(n==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(n==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(n==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}n==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(n){if(this.focus!=="field")return;const{field:t}=this.formDef;if(n==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(n>="0"&&n<="9"){const i=parseInt(n,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,i)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+i)}}handleTap(n,t){this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(n){const t=n.length,i=t>0?n[0].length:0,{title:r,field:o,derivedRows:s,confirmLabel:a}=this.formDef,l=s.length,c=8+l,h=hi,d=Math.floor((i-h)/2),p=Math.floor((t-c)/2);for(let T=0;T<c;T++)for(let H=0;H<h;H++){const G=p+T,ae=d+H;G>=0&&G<t&&ae>=0&&ae<i&&(n[G][ae]={char:" ",fg:"white",bg:"black"})}const u=(T,H,G)=>{T>=0&&T<t&&H>=0&&H<i&&(n[T][H]={char:G,fg:"white",bg:"black"})};u(p,d,"+"),u(p,d+h-1,"+");for(let T=1;T<h-1;T++)u(p,d+T,"-");u(p+c-1,d,"+"),u(p+c-1,d+h-1,"+");for(let T=1;T<h-1;T++)u(p+c-1,d+T,"-");for(let T=1;T<c-1;T++)u(p+T,d,"|"),u(p+T,d+h-1,"|");const m=h-2,v=p+1,w=d+1+Math.floor((m-r.length)/2);f(n,v,w,r,"bright-white","black"),f(n,p+2,w,"'".repeat(r.length),"bright-black","black");const k=[o.label,...s.map(T=>T.label)],O=Math.max(...k.map(T=>T.length)),y=d+1+O+3,g=p+4,A=this.focus==="field";f(n,g,d+1,o.label.padEnd(O)+" : ","white","black");const S=this.value.toString().padStart(5);f(n,g,y,S,A?"black":"white",A?"green":"black");for(let T=0;T<l;T++){const H=s[T],G=p+5+T,ae=H.compute(this.value);f(n,G,d+1,H.label.padEnd(O)+" : ","white","black"),f(n,G,y,ae,"white","black")}const b=p+4+l+2,C=`[ ${a} ]`,L="[ CANCEL ]",N=3,we=C.length+N+L.length,Gt=Math.floor((m-we)/2),Ge=d+1+Gt,cn=Ge+C.length+N;this.confirmRect={col:Ge,row:b,width:C.length},this.cancelRect={col:cn,row:b,width:L.length};const hn=this.focus==="confirm",dn=this.focus==="cancel";f(n,b,Ge,C,hn?"black":"white",hn?"green":"black"),f(n,b,cn,L,dn?"black":"white",dn?"green":"black")}}class di extends Pe{constructor(n,t,i,r,o,s,a,l){const c=j(r),h=[];c.amenities.trader&&h.push({label:"TRADER",action:s}),c.amenities.missionBoard&&h.push({label:"MISSION BOARD",action:a});const d=i.fuelCapacityL-i.fuelL,p=Math.floor(i.credits/ce),u=Math.min(d,p);let m=null;if(c.amenities.fuel&&u>0){const y=u*ce;m=h.length,h.push({label:`BUY FUEL  +${u}L  ${y}CR`,action:()=>{}})}const v=nt(c.description,36).slice(0,3),w=`DANGER: ${c.dangerLevel.toUpperCase()}`,k=[...v,w],O=c.locationType==="surface"||c.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",h,[{id:"undock",label:O}],n,t,i,k),this.onShip=l,this.onRefuel=o,this.fuelItemIdx=m}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx===-1)return;const t=n[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const i=this.player.fuelCapacityL-this.player.fuelL,r=Math.floor(this.player.credits/ce),o=Math.min(i,r);this.openModal(new Ve({title:"BUY FUEL",field:{label:"Litres",initialValue:o,min:0,max:o},derivedRows:[{label:"Cost",compute:s=>`${s*ce} CR`}],confirmLabel:"BUY",onConfirm:s=>{this.closeModal(),s>0&&this.onRefuel(s*ce,s)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class ui extends Pe{constructor(n,t,i,r,o,s,a,l,c){var u;const d=((u=j(r).npcs.trader)==null?void 0:u.toUpperCase())??"TRADER",p=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(d,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,i,[],p),this.traderStock=o,this.onBuy=s,this.onSell=a,this.onHub=l,this.onUndock=c,this.syncItems(),this.clampCursor()}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(n=>{const t=ie(n.commodityId);if(!t)return[];const i=this.player.credits>=t.basePrice;return[{label:`${t.name} (x${n.qty})`,info:`${t.basePrice} CR`,disabled:!i,action:()=>{const r=Math.floor(this.player.credits/t.basePrice),o=Math.min(n.qty,r);this.openModal(new Ve({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:o,min:0,max:o},derivedRows:[{label:"Total",compute:s=>`${s*t.basePrice} CR`}],confirmLabel:"BUY",onConfirm:s=>{s>0&&this.onBuy(n.commodityId,s),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const n=this.player.cargoHold;return n.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...n].flatMap(t=>{const i=ie(t.commodityId);return i?[{label:`${i.name} (x${t.qty})`,info:`${i.basePrice} CR`,action:()=>{this.openModal(new Ve({title:i.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:r=>`${r*i.basePrice} CR`}],confirmLabel:"SELL",onConfirm:r=>{r>0&&this.onSell(t.commodityId,r),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]:[]})}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const n=this.items;(this.cursorIdx<0||this.cursorIdx>=n.length||(t=n[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=n.findIndex(i=>!i.disabled))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(n){this.syncItems(),super.render(n);const t=n.length,i=`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,r=it(t,!0)-2;f(n,r,2,i,"bright-black","black")}}const pi=[{id:"M001",type:"rescue",title:"Find the Lost Crew",reward:500},{id:"M002",type:"delivery",title:"Deliver Fuel Core",reward:300},{id:"M003",type:"combat",title:"Clear Pirate Outpost",reward:750},{id:"M004",type:"salvage",title:"Salvage Station Debris",reward:400},{id:"M005",type:"rescue",title:"Rescue Stranded Vessel",reward:600},{id:"M006",type:"delivery",title:"Transport Supplies",reward:250},{id:"M007",type:"combat",title:"Eliminate Smugglers",reward:800}],fi={rescue:"[R] ",delivery:"[D] ",combat:"[C] ",salvage:"[S] "};class mi extends Pe{constructor(n,t,i,r,o,s){j(r);const a=pi.map(l=>({label:l.title,icon:fi[l.type],iconFg:"bright-yellow",info:`${l.reward} CR`,infoFg:"bright-green",action:()=>console.log(`[MissionBoard] Selected: ${l.title}`)}));super("MISSION BOARD",a,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,i),this.onHub=o,this.onUndock=s}activateCurrent(){if(this.items.length===0)return;const n=this.items[this.cursorIdx];n.disabled||n.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}const gi=[18,10,5],yi=[".","*","+"],gn=[4e3,2e3,800],bi=[9e3,5e3,2500],_i=[null,"bright-black","white"],vi=["bright-black","white","bright-white"],wi=["white","bright-white","bright-cyan"],ke=3,yn=25,Ce=2,bn=37,_n=2*Math.PI;function xi(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class ki{constructor(n=42){this.boundsSet=!1,this.rand=xi(n),this.stars=[];for(let t=0;t<3;t++)for(let i=0;i<gi[t];i++){const r=Ce+Math.floor(this.rand()*(bn-Ce+1)),o=ke+Math.floor(this.rand()*(yn-ke+1)),s=this.rand()*_n,a=gn[t]+this.rand()*(bi[t]-gn[t]);this.stars.push({col:r,row:o,layer:t,twinklePhase:s,twinklePeriod:a})}}update(n){for(const t of this.stars)t.twinklePhase+=_n/t.twinklePeriod*n}render(n,t,i,r,o){if(!this.boundsSet){this.boundsSet=!0;const s=yn-ke,a=bn-Ce;{const l=(i-t)/s,c=(o-r)/a;for(const h of this.stars)h.row=Math.round(t+(h.row-ke)*l),h.col=Math.round(r+(h.col-Ce)*c)}}for(const s of this.stars){const{row:a,col:l,layer:c}=s;if(a<t||a>i||l<r||l>o)continue;const h=Math.sin(s.twinklePhase);let d;h>=.5?d=wi[c]:h>=-.5?d=vi[c]:d=_i[c],d!==null&&(n[a][l]={char:yi[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const Ci=2,Ti=3,Ai=2*Math.PI/9e3,Si=2*Math.PI/12e3,Ii=Math.PI/3;function vn(e,n,t){return Math.max(n,Math.min(t,e))}class Ei{constructor(n,t,i,r,o){this.time=0,this.def=n,this.intRowStart=t,this.intRowEnd=i,this.intColStart=r,this.intColEnd=o,this.glyphHeight=n.glyph.rows.length,this.glyphWidth=Math.max(...n.glyph.rows.map(s=>s.length)),this.anchorRow=t+Math.floor((i-t)/2)-Math.floor(this.glyphHeight/2),this.anchorCol=r+Math.floor((o-r)*.6)-Math.floor(this.glyphWidth/2)}update(n){this.time+=n}getDisplayPosition(){const n=Math.round(Ci*Math.sin(this.time*Ai)),t=Math.round(Ti*Math.sin(this.time*Si+Ii)),i=vn(this.anchorRow+n,this.intRowStart,this.intRowEnd-this.glyphHeight+1),r=vn(this.anchorCol+t,this.intColStart,this.intColEnd-this.glyphWidth+1);return{row:i,col:r}}render(n){const{row:t,col:i}=this.getDisplayPosition(),r=this.def.glyph.fg;for(let o=0;o<this.def.glyph.rows.length;o++){const s=this.def.glyph.rows[o];for(let a=0;a<s.length;a++){const l=s[a];if(l===" ")continue;const c=t+o,h=i+a;c>=0&&c<n.length&&h>=0&&h<n[c].length&&(n[c][h]={char:l,fg:r,bg:"black"})}}}}const ue={BEACON:{name:"BEACON",glyph:{rows:["[*]"," | "],fg:"bright-yellow"}},RELAY:{name:"RELAY",glyph:{rows:[">---<"," |*|","  |"],fg:"bright-yellow"}},RING:{name:"RING",glyph:{rows:["/-\\","|O|","\\-/"],fg:"cyan"}},HUB:{name:"HUB",glyph:{rows:["  *  ","--+--"," [H] ","  |  ","  *  "],fg:"white"}}};function Te(e,n){if(e.length>=n)return e.slice(0,n);const t=n-e.length,i=Math.floor(t/2);return" ".repeat(i)+e+" ".repeat(t-i)}const Mi={civilian:ue.HUB,military:ue.RELAY,research:ue.RING,"black-market":ue.BEACON};class Li{constructor(n,t,i,r,o,s){if(this.cursorIdx=0,this.activated=!1,this.h=30,this.w=40,this.station=null,this.player=i,this.context=t,this.chrome=new me(t,i),this.starfield=new ki,this.inSpace=i.destinationId===null,i.destinationId!==null){const l=j(i.destinationId);this.stationType=Mi[l.type]??ue.RELAY,this.isLandingDest=l.locationType==="surface"||l.locationType==="asteroid"}else this.stationType=null,this.isLandingDest=!1;const a=()=>this.inSpace?1:2;n.onAction(l=>{this.activated||(l==="CARGO"?(this.activated=!0,s()):l==="UP"?this.cursorIdx=(this.cursorIdx-1+a())%a():l==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%a():l==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,r()):this.inSpace||(this.activated=!0,o())))}),n.onTap&&n.onTap((l,c)=>{this.activated||(c===2?l>=this.w/2&&(this.activated=!0,s()):c===this.h-1&&(l<this.w/2?(this.activated=!0,r()):this.inSpace||(this.activated=!0,o())))})}update(n){this.starfield.update(n),this.station&&this.station.update(n)}render(n){const t=n.length,i=t>0?n[0].length:0;this.h=t,this.w=i;for(let b=0;b<t;b++)for(let C=0;C<i;C++)n[b][C]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,{showHeader:!0,showFooter:!1,navOptions:[]});const r=Math.floor(i/2),o=r-3,s=2,a=3,l=4,c=t-3,h=t-2,d=t-1,p=1,u=i-2;this.stationType&&!this.station&&(this.station=new Ei(this.stationType,l,c,p,u));const m=b=>({char:b,fg:"bright-black",bg:"black"}),v=Te(`FUEL:${this.player.fuelL}/${this.player.fuelCapacityL}L`,o),w=Math.round(this.player.cargoWeightKg/1e3),k=Math.round(this.player.cargoCapacity/1e3),O=Te(`CARGO: ${w}/${k}Mg`,o);n[s][1]=m("\\");for(let b=0;b<o;b++)n[s][2+b]=m(v[b]);n[s][r-1]=m("/"),n[s][r]=m("\\");for(let b=0;b<o;b++)n[s][r+1+b]=m(O[b]);n[s][r+o+1]=m("/"),n[a][1]=m("/");for(let b=0;b<o;b++)n[a][2+b]=m("¯");for(let b=0;b<o;b++)n[a][r+1+b]=m("¯");n[a][r+o+1]=m("\\");for(let b=l;b<=c;b++)n[b][0]=m("|"),n[b][i-1]=m("|");this.starfield.render(n,l,c,p,u),this.station&&this.station.render(n),f(n,c,p+1,"[C] CARGO","bright-black","black"),n[h][1]=m("\\");for(let b=0;b<o;b++)n[h][2+b]=m("_");for(let b=0;b<o;b++)n[h][r+1+b]=m("_");n[h][r+o+1]=m("/");const y="[T] TRAVEL",g=this.inSpace?"[ - ] DOCK":this.isLandingDest?"[L] LAND":"[D] DOCK";let A=Te(y,o),S=Te(g,o);this.cursorIdx===0?A=">"+A.slice(1):this.inSpace||(S=">"+S.slice(1)),n[d][1]=m("/");for(let b=0;b<o;b++){const C=A[b];n[d][2+b]={char:C,fg:C===">"?"bright-green":"bright-yellow",bg:"black"}}n[d][r-1]=m("\\"),n[d][r]=m("/");for(let b=0;b<o;b++){const C=S[b];n[d][r+1+b]={char:C,fg:C===">"?"bright-green":this.inSpace?"bright-black":"bright-yellow",bg:"black"}}n[d][r+o+1]=m("\\")}}const Ye="CARGO HOLD";class Ri{constructor(n,t,i,r){this.activated=!1,this.player=i,n.onAction(o=>{this.activated||(o==="BACK"||o==="CARGO")&&(this.activated=!0,r())})}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let h=0;h<t;h++)for(let d=0;d<i;d++)n[h][d]={char:" ",fg:"black",bg:"black"};x(n,1,Ye,"bright-white","black");const r=Math.max(0,Math.floor((i-Ye.length)/2));f(n,2,r,"'".repeat(Ye.length),"bright-black","black");const o=this.player.cargoHold,s=this.player.cargoCapacity,a=this.player.cargoWeightKg;if(o.length===0)x(n,Math.floor(t/2),"CARGO HOLD EMPTY","bright-black","black");else{let h=4;for(const p of o){if(h>=t-3)break;const u=ie(p.commodityId);if(!u)continue;const m=p.qty*u.weightKg,v=`  x${p.qty}  ${u.basePrice}CR  ${m}KG`,w=Math.max(6,i-4-v.length),k=u.name,y=`${k.length>w?k.slice(0,w):k}${v}`;f(n,h,2,y,"white","black"),h++}const d=t-4;d>3&&f(n,d,2,"-".repeat(i-4),"bright-black","black")}const l=t-3,c=`TOTAL: ${a}/${s}KG`;f(n,l,2,c,"bright-black","black"),f(n,t-1,2,"[ESC] BACK","bright-black","black")}}class wn extends Pe{constructor(n,t,i,r,o,s,a,l){const c=Re(i.systemId),h=V(i.driveId),d=[...c.destinations.map(v=>({label:j(v).name.toUpperCase(),disabled:v===i.destinationId,action:()=>r(v)})),{label:"FLY INTO SPACE",disabled:i.destinationId===null,action:s}],u=[...Ze(i.systemId).map(v=>{const w=v.from===i.systemId?v.to:v.from,k=Re(w),O=v.stability.toUpperCase(),y=Math.ceil(en*v.distance*h.fuelEfficiency);return{label:`${k.name.toUpperCase()}  ${v.distance}LY  [${O}]`.slice(0,36),disabled:y>i.fuelL,action:()=>o(w)}}),{label:"GALAXY MAP...",action:l}],m=[{label:"DESTINATIONS",items:d},{label:"JUMPS",items:u}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],n,t,i,[],m),this.onShip=a}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}function xn(e,n){if(e===n)return[e];const t=[[e]],i=new Set([e]);for(;t.length>0;){const r=t.shift(),o=r[r.length-1];for(const s of Ze(o)){const a=s.from===o?s.to:s.from;if(a===n)return[...r,a];i.has(a)||(i.add(a),t.push([...r,a]))}}return null}const kn="GALAXY MAP",Cn=I+3,Tn=I+5,W=I+9,An=I+13,Oi=I+14,Ae=I+15,Ke=I+20,Se=I+21,Fi=2,Ni=10,Di=12,Ie=13,Ee=12,Pi=25,Ui=26,Hi=10,Sn=18;function Bi(e,n){return e.length>=n?e.slice(0,n):e+" ".repeat(n-e.length)}function he(e,n){return"["+Bi(e.toUpperCase(),n-2)+"]"}function de(e,n){return Math.ceil(en*e*n)}class $i{constructor(n,t,i,r,o,s){this.activeTab="map",this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.activated=!1,this.chrome=new me(t,i),this.player=i,this.canJump=r.canJump,this.onJump=o,this.onBack=s,this.publicSystems=oi().sort((a,l)=>a.distanceFromSol-l.distanceFromSol),this.otherSystems=this.publicSystems.filter(a=>a.id!==i.systemId),this.mapBrowsingSystemId=i.systemId,n.onCharInput&&n.onCharInput(a=>{if(this.activated||this.activeTab!=="map")return;const l=a.charCodeAt(0);a==="\b"||a===""?this.searchText=this.searchText.slice(0,-1):l>=32&&l<127&&(this.searchText+=a.toUpperCase(),this.mapCursorIdx=0)}),n.onAction(a=>{if(!this.activated){if(a==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}if(a==="LEFT"){this.activeTab="map",this.searchText="";return}if(a==="RIGHT"){this.activeTab="route",this.searchText="";return}this.activeTab==="map"?this.handleMapAction(a):this.handleRouteAction(a)}}),n.onTap&&n.onTap((a,l)=>{if(this.activated)return;if(this.chrome.hitTestNav(a,l)==="back"){this.searchText="",this.activated=!0,this.onBack();return}if(l===Cn){a>=3&&a<=7?(this.activeTab="map",this.searchText=""):a>=9&&a<=16&&(this.activeTab="route",this.searchText="");return}if(this.activeTab==="map"&&l>=Ae&&l<Ke){const h=this.getMapNeighbors(),d=l-Ae;d>=0&&d<h.length&&(this.mapCursorIdx=d)}if(this.activeTab==="route"&&l>=I+8&&l<=I+14){const h=l-(I+8);h>=0&&h<this.otherSystems.length&&(this.routeDestIdx=h)}})}getMapNeighbors(){const t=Ze(this.mapBrowsingSystemId).map(i=>{const r=i.from===this.mapBrowsingSystemId?i.to:i.from,o=this.publicSystems.find(a=>a.id===r),s=i.distance;return o?{sys:o,dist:s}:null}).filter(i=>i!==null).sort((i,r)=>i.dist-r.dist).map(i=>i.sys);return this.searchText.length===0?t:t.filter(i=>i.name.toUpperCase().includes(this.searchText))}handleMapAction(n){const t=this.getMapNeighbors(),i=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(n==="UP")this.mapCursorIdx=Math.max(0,i-1);else if(n==="DOWN")this.mapCursorIdx=Math.min(t.length-1,i+1);else if(n==="SELECT"){const r=t[i];if(!r)return;if(this.mapBrowsingSystemId===this.player.systemId&&this.canJump){const o=Y(this.player.systemId,r.id);if(o){const s=V(this.player.driveId);if((s?de(o.distance,s.fuelEfficiency):0)<=this.player.fuelL){this.activated=!0,this.onJump(r.id);return}}}this.mapBrowsingSystemId=r.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(n){if(n==="UP")this.routeDestIdx=Math.max(0,this.routeDestIdx-1);else if(n==="DOWN")this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1);else if(n==="SELECT"&&this.canJump){const t=this.computeRoute();if(t&&t.length>=2){const i=Y(t[0],t[1]);if(i){const r=V(this.player.driveId);(r?de(i.distance,r.fuelEfficiency):0)<=this.player.fuelL&&(this.activated=!0,this.onJump(t[1]))}}}}hasFuel(n){const t=Y(this.player.systemId,n);if(!t)return!1;const i=V(this.player.driveId);return i?de(t.distance,i.fuelEfficiency)<=this.player.fuelL:!1}computeRoute(){const n=this.otherSystems[this.routeDestIdx];return n?xn(this.player.systemId,n.id):null}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let o=0;o<t;o++)for(let s=0;s<i;s++)n[o][s]={char:" ",fg:"black",bg:"black"};const r=[{id:"back",label:"BACK"}];this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:r}),f(n,I,2,kn,"bright-white","black"),f(n,I+1,2,"'".repeat(kn.length),"bright-black","black"),this.renderTabBar(n,i),this.activeTab==="map"?this.renderMapTab(n,i):this.renderRouteTab(n,i)}renderTabBar(n,t){const i=Cn;let r=2;n[i][r++]={char:"|",fg:"bright-black",bg:"black"};for(const[o,s]of[["MAP","map"],["ROUTE","route"]]){const a=this.activeTab===s,l=a?"black":"white",c=a?"green":"black";for(const h of` ${o} `)r<t&&(n[i][r]={char:h,fg:l,bg:c}),r++;r<t&&(n[i][r]={char:"|",fg:"bright-black",bg:"black"}),r++}}renderMapTab(n,t){const i=this.publicSystems.find(s=>s.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!i)return;this.renderChart(n,i),f(n,Oi,0,"-".repeat(t),"bright-black","black");const r=this.getMapNeighbors(),o=Math.min(this.mapCursorIdx,Math.max(0,r.length-1));this.renderNeighborList(n,t,i,r,o),f(n,Ke,0,"-".repeat(t),"bright-black","black"),this.renderInfo(n,t,i,r[o]??null),this.searchText.length>0&&f(n,Se+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(n,t){const i=this.getMapNeighbors(),r=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(f(n,W,Ie,he(t.name,Ee),r,"black"),t.id===this.player.systemId){const s=Ie+Ee;n[W][s]={char:"*",fg:"bright-yellow",bg:"black"}}const o=["left","right","top","bottom"];for(let s=0;s<Math.min(i.length,4);s++){const a=i[s],l=o[s],c=a.id===this.player.systemId?"bright-yellow":"white";if(l==="left")f(n,W,Fi,he(a.name,Ni),c,"black"),n[W][Di]={char:"-",fg:"bright-black",bg:"black"};else if(l==="right")f(n,W,Ui,he(a.name,Hi),c,"black"),n[W][Pi]={char:"-",fg:"bright-black",bg:"black"};else if(l==="top"){f(n,Tn,Ie,he(a.name,Ee),c,"black");for(let h=Tn+1;h<W;h++)n[h][Sn]={char:"|",fg:"bright-black",bg:"black"}}else{f(n,An,Ie,he(a.name,Ee),c,"black");for(let h=W+1;h<An;h++)n[h][Sn]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(n,t,i,r,o){for(let s=0;s<r.length&&s<Ke-Ae;s++){const a=r[s],l=Ae+s,c=s===o,d=a.id===this.player.systemId?"bright-yellow":c?"bright-cyan":"white",p=c?"> ":"  ",u=Y(i.id,a.id),m=u?`${u.distance}LY  ${u.stability}`:"",v=t-4-m.length;f(n,l,2,p+a.name.toUpperCase().slice(0,v-2),d,"black"),m&&f(n,l,t-2-m.length,m,"bright-black","black")}}renderInfo(n,t,i,r){const o=i.id===this.player.systemId,s=o?"* Current location":i.name.toUpperCase();if(f(n,Se,2,`Zone: ${i.zone}  Sec: ${i.security}  ${s}`.slice(0,t-4),"bright-black","black"),!r)return;const a=Y(i.id,r.id);if(a){if(o&&this.canJump){const l=V(this.player.driveId),c=l?de(a.distance,l.fuelEfficiency):0,h=c<=this.player.fuelL,d=h?"[SELECT] jump":"Insufficient fuel",p=`${r.name.toUpperCase()}  ${c}L  ${d}`;f(n,Se+1,2,p.slice(0,t-4),h?"white":"bright-red","black")}else if(!o){const l=xn(this.player.systemId,r.id),c=l?`${l.length-1} hop${l.length-1!==1?"s":""} from your location`:"Not reachable";f(n,Se+1,2,`${r.name.toUpperCase()}  ${c}`.slice(0,t-4),"bright-black","black")}}}renderRouteTab(n,t){var k,O;const i=I+5,r=I+7,o=I+8,s=7,a=o+s,l=a+1,c=l+6,h=c+1,d=this.publicSystems.find(y=>y.id===this.player.systemId);f(n,i,2,"FROM:","bright-black","black"),f(n,i,8,(d==null?void 0:d.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),f(n,r,2,"TO:","bright-black","black");const p=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-s));for(let y=0;y<s;y++){const g=p+y;if(g>=this.otherSystems.length)break;const A=this.otherSystems[g],S=g===this.routeDestIdx,b=S?"bright-cyan":"white",C=S?"> ":"  ";f(n,o+y,2,C+A.name.toUpperCase(),b,"black")}f(n,a,0,"-".repeat(t),"bright-black","black"),f(n,c,0,"-".repeat(t),"bright-black","black");const u=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!u){f(n,l,2,"No route found","bright-red","black");return}const v=u.length-1;f(n,l,2,`Route: ${v} hop${v!==1?"s":""}`,"bright-white","black");const w=V(this.player.driveId);for(let y=0;y<v;y++){const g=Y(u[y],u[y+1]);if(!g)continue;const A=l+1+y;if(A>=c)break;const S=(((k=this.publicSystems.find(C=>C.id===u[y]))==null?void 0:k.name)??u[y]).toUpperCase().slice(0,9),b=(((O=this.publicSystems.find(C=>C.id===u[y+1]))==null?void 0:O.name)??u[y+1]).toUpperCase().slice(0,9);f(n,A,4,`${S} -> ${b}  ${g.distance}LY  ${g.stability}`.slice(0,t-6),"white","black")}if(h<n.length-1&&w){const y=Y(u[0],u[1]),g=y?de(y.distance,w.fuelEfficiency):0,A=g<=this.player.fuelL,S=this.canJump?A?"  [SELECT] jump first hop":"  Insufficient fuel":"";f(n,h,2,`First hop: ${g}L / ${this.player.fuelL}L avail${S}`.slice(0,t-4),A?"bright-black":"bright-red","black")}}}class z{constructor(n,t,i,r){this.elapsed=0,this.arrived=!1,this.player=n,this.chrome=new me(t,n),this.duration=i,this.onComplete=r}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}render(n){const t=n.length,i=t>0?n[0].length:0;for(let r=0;r<t;r++)for(let o=0;o<i;o++)n[r][o]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,this.getChromeConfig()),this.renderContent(n)}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const ji=["[. . .]","[: : :]","[* * *]"],In=5e3;class Gi extends z{constructor(n,t,i){super(n,t,In,i)}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/500)%3,o=Math.ceil((In-this.elapsed)/1e3),s=Math.max(1,Math.min(5,o)),a=Re(this.player.systemId),l=a?a.name.toUpperCase():this.player.systemId.toUpperCase();x(n,i-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),x(n,i-1,"DESTINATION:","bright-black","black"),x(n,i,l,"bright-white","black"),x(n,i+2,ji[r],"bright-black","black"),x(n,i+4,`ARRIVING IN ${s}S`,"bright-black","black")}}const En=2e3,Wi=["[ —   ]","[  —  ]","[   — ]"];class Mn extends z{constructor(n,t,i,r){super(n,t,En,i),this.targetLabel=r}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((En-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o)),a=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const l=this.player.destinationId?j(this.player.destinationId):null;return l?l.name.toUpperCase():"UNKNOWN"})();x(n,i-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),x(n,i-1,"HEADING TO:","bright-black","black"),x(n,i,a,"bright-white","black"),x(n,i+2,Wi[r],"bright-black","black"),x(n,i+4,`ARRIVING IN ${s}S`,"bright-black","black")}}const Ln=2500,Yi=["v","vv","vvv"];class Ki extends z{constructor(n,t,i){super(n,t,Ln,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/400)%3,o=Math.ceil((Ln-this.elapsed)/1e3),s=Math.max(1,Math.min(3,o));x(n,i-3,"[ LANDING SEQUENCE ]","bright-green","black"),x(n,i+2,Yi[r],"bright-black","black"),x(n,i+4,`TOUCHDOWN IN ${s}S`,"bright-black","black")}}const Rn=2500,qi=[">",">>",">>>"];class zi extends z{constructor(n,t,i){super(n,t,Rn,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/400)%3,o=Math.ceil((Rn-this.elapsed)/1e3),s=Math.max(1,Math.min(3,o));x(n,i-3,"[ APPROACH LOCKED ]","bright-yellow","black"),x(n,i+2,qi[r],"bright-black","black"),x(n,i+4,`CLAMPING IN ${s}S`,"bright-black","black")}}const On=1500,Vi=["^","^^","^^^"];class Ji extends z{constructor(n,t,i){super(n,t,On,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((On-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));x(n,i-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),x(n,i+2,Vi[r],"bright-black","black"),x(n,i+4,`CLEAR IN ${s}S`,"bright-black","black")}}const Fn=1500,Xi=["<","<<","<<<"];class Qi extends z{constructor(n,t,i){super(n,t,Fn,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((Fn-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));x(n,i-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),x(n,i+2,Xi[r],"bright-black","black"),x(n,i+4,`DEPARTING IN ${s}S`,"bright-black","black")}}const Nn=1500,Zi=["→","→→","→→→"];class er extends z{constructor(n,t,i){super(n,t,Nn,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((Nn-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));x(n,i-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),x(n,i+2,Zi[r],"bright-black","black"),x(n,i+4,`DOCKING IN ${s}S`,"bright-black","black")}}const Dn=1500,nr=["←","←←","←←←"];class tr extends z{constructor(n,t,i){super(n,t,Dn,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((Dn-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));x(n,i-3,"[ DEPARTING BERTH ]","bright-cyan","black"),x(n,i+2,nr[r],"bright-black","black"),x(n,i+4,`CLEAR IN ${s}S`,"bright-black","black")}}class ir{constructor(n){const t=tt(n.shipId);if(!t)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[]}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,t){const i=this._cargoHold.find(r=>r.commodityId===n);i?i.qty+=t:this._cargoHold.push({commodityId:n,qty:t})}removeCargo(n,t){const i=this._cargoHold.findIndex(r=>r.commodityId===n);i<0||(t!==void 0&&t<this._cargoHold[i].qty?this._cargoHold[i].qty-=t:this._cargoHold.splice(i,1))}get cargoWeightKg(){return si(this._cargoHold)}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}}const rr=100,or=2*60*1e3;class sr{constructor(n,t,i){this.traderStockCache=new Map,this.renderer=n,this.input=t,this.context=i;const r=ii(),o=tt(r.startingShip);this.player=new ir({shipId:r.startingShip,driveId:o.defaultJumpDrive,credits:r.player.startingCredits,systemId:r.startingLocation.system,destinationId:r.startingLocation.destination}),this.currentScene=new fn(this.input,this.context,this.player,()=>this.goToStory())}tick(n){const t=Math.min(n,rr),i=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(i),this.renderer.drawBuffer(i)}makeBuffer(){const n=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:n},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(n){const t=Date.now(),i=this.traderStockCache.get(n);if(i&&t-i.generatedAt<or)return i.entries;const r=ri(),o=4+Math.floor(Math.random()*3),s=[...r];for(let l=s.length-1;l>0;l--){const c=Math.floor(Math.random()*(l+1));[s[l],s[c]]=[s[c],s[l]]}const a=s.slice(0,o).map(l=>({commodityId:l.id,qty:1+Math.floor(Math.random()*8)}));return this.traderStockCache.set(n,{entries:a,generatedAt:t}),a}onBuy(n,t,i){if(t<=0)return;const r=i.findIndex(c=>c.commodityId===n);if(r<0)return;const o=i[r];if(t>o.qty)return;const s=ie(n);if(!s)return;const a=t*s.basePrice;this.player.credits<a||this.player.cargoWeightKg+t*s.weightKg>this.player.cargoCapacity||(this.player.spendCredits(a),this.player.addCargo(n,t),o.qty-=t,o.qty<=0&&i.splice(r,1))}onSell(n,t,i){if(t<=0)return;const r=this.player.cargoHold.find(l=>l.commodityId===n);if(!r||r.qty<t)return;const o=ie(n);if(!o)return;const s=t*o.basePrice;this.player.addCredits(s),this.player.removeCargo(n,t);const a=i.find(l=>l.commodityId===n);a?a.qty+=t:i.push({commodityId:n,qty:t})}goToMainMenu(){this.currentScene=new fn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new ci(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new di(this.input,this.context,this.player,this.player.destinationId,(n,t)=>{this.player.spendCredits(n),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToTakeOffOrUndock())}goToLandOrDock(){var t;const n=(t=j(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new Ki(this.player,this.context,()=>this.goToStation()):n==="asteroid"?this.currentScene=new zi(this.player,this.context,()=>this.goToStation()):this.currentScene=new er(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const n=(t=j(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new Ji(this.player,this.context,()=>this.goToShip()):n==="asteroid"?this.currentScene=new Qi(this.player,this.context,()=>this.goToShip()):this.currentScene=new tr(this.player,this.context,()=>this.goToShip())}goToTrader(){const n=this.player.destinationId,t=this.getOrCreateTraderStock(n);this.currentScene=new ui(this.input,this.context,this.player,n,t,(i,r)=>this.onBuy(i,r,t),(i,r)=>this.onSell(i,r,t),()=>this.goToStation(),()=>this.goToShip())}goToMissionBoard(){this.currentScene=new mi(this.input,this.context,this.player,this.player.destinationId,()=>this.goToStation(),()=>this.goToShip())}goToShip(){this.currentScene=new Li(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo())}goToCargo(){this.currentScene=new Ri(this.input,this.context,this.player,()=>this.goToShip())}goToTravelMenu(){this.currentScene=new wn(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap())}goToArrival(){this.currentScene=new wn(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap())}goToGalaxyMap(){this.currentScene=new $i(this.input,this.context,this.player,{canJump:!0},n=>this.onJumpSelected(n),()=>this.goToTravelMenu())}goToFlyIntoSpace(){this.player.undock(),this.currentScene=new Mn(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(n){this.player.dock(n),this.currentScene=new Mn(this.player,this.context,()=>this.goToShip())}onJumpSelected(n){const t=Y(this.player.systemId,n),i=V(this.player.driveId),r=Math.ceil(en*t.distance*i.fuelEfficiency);this.player.consumeFuel(r),this.player.jumpTo(n),this.currentScene=new Gi(this.player,this.context,()=>this.goToArrival())}}const ar=`---
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
`,lr=`---
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
`,cr=`---
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
`,hr=`---
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
`,dr=`---
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
`,ur=`---
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
`,pr=`---
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
`,fr=`---
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
`,mr=`---
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
`,gr=`---
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
`,yr=`---
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
`,br=`---
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
`,_r=`---
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
`,vr=`---
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
`,wr=`---
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
`,xr=`---
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
`,kr=`---
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
`,Cr=`---
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
`,Tr=`---
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
`,Ar=`---
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
`,Sr=`---
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
`,Ir=`---
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
`,Er=`---
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
`,Mr=`---
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
`,Lr=`---
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
`,Rr=`---
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
`,Or=`---
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
`,Fr=`---
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
`,Nr=`---
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
`,Dr=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,Pr=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,Ur=`---
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
`,Hr=`---
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
`,Br=`---
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

Long range engines for faster than light travel between systems.`,$r=`---
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
`,jr=`---
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
`,Gr=`---
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
`,Wr=`---
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
`,Yr=`---
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
`,Kr=`---
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
`,qr=`---
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
`,zr=`---
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
`,Vr=`---
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
`,Jr=`---
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
`,Xr=`---
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
`,Qr=`---
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
`,Zr=`---
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
`,eo=`---
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
`,no=`---
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
`,to=`---
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
`;var E={},ge={},P={};function rt(e){return typeof e>"u"||e===null}function io(e){return typeof e=="object"&&e!==null}function ro(e){return Array.isArray(e)?e:rt(e)?[]:[e]}function oo(e,n){var t,i,r,o;if(n)for(o=Object.keys(n),t=0,i=o.length;t<i;t+=1)r=o[t],e[r]=n[r];return e}function so(e,n){var t="",i;for(i=0;i<n;i+=1)t+=e;return t}function ao(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}P.isNothing=rt;P.isObject=io;P.toArray=ro;P.repeat=so;P.isNegativeZero=ao;P.extend=oo;function pe(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}pe.prototype=Object.create(Error.prototype);pe.prototype.constructor=pe;pe.prototype.toString=function(n){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!n&&this.mark&&(t+=" "+this.mark.toString()),t};var ye=pe,Pn=P;function nn(e,n,t,i,r){this.name=e,this.buffer=n,this.position=t,this.line=i,this.column=r}nn.prototype.getSnippet=function(n,t){var i,r,o,s,a;if(!this.buffer)return null;for(n=n||4,t=t||75,i="",r=this.position;r>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(r-1))===-1;)if(r-=1,this.position-r>t/2-1){i=" ... ",r+=5;break}for(o="",s=this.position;s<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s))===-1;)if(s+=1,s-this.position>t/2-1){o=" ... ",s-=5;break}return a=this.buffer.slice(r,s),Pn.repeat(" ",n)+i+a+o+`
`+Pn.repeat(" ",n+this.position-r+i.length)+"^"};nn.prototype.toString=function(n){var t,i="";return this.name&&(i+='in "'+this.name+'" '),i+="at line "+(this.line+1)+", column "+(this.column+1),n||(t=this.getSnippet(),t&&(i+=`:
`+t)),i};var lo=nn,Un=ye,co=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],ho=["scalar","sequence","mapping"];function uo(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(i){n[String(i)]=t})}),n}function po(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(co.indexOf(t)===-1)throw new Un('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=uo(n.styleAliases||null),ho.indexOf(this.kind)===-1)throw new Un('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var R=po,Hn=P,Me=ye,fo=R;function Je(e,n,t){var i=[];return e.include.forEach(function(r){t=Je(r,n,t)}),e[n].forEach(function(r){t.forEach(function(o,s){o.tag===r.tag&&o.kind===r.kind&&i.push(s)}),t.push(r)}),t.filter(function(r,o){return i.indexOf(o)===-1})}function mo(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,t;function i(r){e[r.kind][r.tag]=e.fallback[r.tag]=r}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(i);return e}function ee(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new Me("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=Je(this,"implicit",[]),this.compiledExplicit=Je(this,"explicit",[]),this.compiledTypeMap=mo(this.compiledImplicit,this.compiledExplicit)}ee.DEFAULT=null;ee.create=function(){var n,t;switch(arguments.length){case 1:n=ee.DEFAULT,t=arguments[0];break;case 2:n=arguments[0],t=arguments[1];break;default:throw new Me("Wrong number of arguments for Schema.create function")}if(n=Hn.toArray(n),t=Hn.toArray(t),!n.every(function(i){return i instanceof ee}))throw new Me("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(i){return i instanceof fo}))throw new Me("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new ee({include:n,explicit:t})};var se=ee,go=R,yo=new go("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),bo=R,_o=new bo("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),vo=R,wo=new vo("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),xo=se,tn=new xo({explicit:[yo,_o,wo]}),ko=R;function Co(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function To(){return null}function Ao(e){return e===null}var So=new ko("tag:yaml.org,2002:null",{kind:"scalar",resolve:Co,construct:To,predicate:Ao,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Io=R;function Eo(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function Mo(e){return e==="true"||e==="True"||e==="TRUE"}function Lo(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var Ro=new Io("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Eo,construct:Mo,predicate:Lo,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),Oo=P,Fo=R;function No(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function Do(e){return 48<=e&&e<=55}function Po(e){return 48<=e&&e<=57}function Uo(e){if(e===null)return!1;var n=e.length,t=0,i=!1,r;if(!n)return!1;if(r=e[t],(r==="-"||r==="+")&&(r=e[++t]),r==="0"){if(t+1===n)return!0;if(r=e[++t],r==="b"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(r!=="0"&&r!=="1")return!1;i=!0}return i&&r!=="_"}if(r==="x"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(!No(e.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}for(;t<n;t++)if(r=e[t],r!=="_"){if(!Do(e.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}if(r==="_")return!1;for(;t<n;t++)if(r=e[t],r!=="_"){if(r===":")break;if(!Po(e.charCodeAt(t)))return!1;i=!0}return!i||r==="_"?!1:r!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function Ho(e){var n=e,t=1,i,r,o=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),i=n[0],(i==="-"||i==="+")&&(i==="-"&&(t=-1),n=n.slice(1),i=n[0]),n==="0"?0:i==="0"?n[1]==="b"?t*parseInt(n.slice(2),2):n[1]==="x"?t*parseInt(n,16):t*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(s){o.unshift(parseInt(s,10))}),n=0,r=1,o.forEach(function(s){n+=s*r,r*=60}),t*n):t*parseInt(n,10)}function Bo(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!Oo.isNegativeZero(e)}var $o=new Fo("tag:yaml.org,2002:int",{kind:"scalar",resolve:Uo,construct:Ho,predicate:Bo,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),ot=P,jo=R,Go=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Wo(e){return!(e===null||!Go.test(e)||e[e.length-1]==="_")}function Yo(e){var n,t,i,r;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,r=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(o){r.unshift(parseFloat(o,10))}),n=0,i=1,r.forEach(function(o){n+=o*i,i*=60}),t*n):t*parseFloat(n,10)}var Ko=/^[-+]?[0-9]+e/;function qo(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(ot.isNegativeZero(e))return"-0.0";return t=e.toString(10),Ko.test(t)?t.replace("e",".e"):t}function zo(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||ot.isNegativeZero(e))}var Vo=new jo("tag:yaml.org,2002:float",{kind:"scalar",resolve:Wo,construct:Yo,predicate:zo,represent:qo,defaultStyle:"lowercase"}),Jo=se,st=new Jo({include:[tn],implicit:[So,Ro,$o,Vo]}),Xo=se,at=new Xo({include:[st]}),Qo=R,lt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),ct=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Zo(e){return e===null?!1:lt.exec(e)!==null||ct.exec(e)!==null}function es(e){var n,t,i,r,o,s,a,l=0,c=null,h,d,p;if(n=lt.exec(e),n===null&&(n=ct.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],i=+n[2]-1,r=+n[3],!n[4])return new Date(Date.UTC(t,i,r));if(o=+n[4],s=+n[5],a=+n[6],n[7]){for(l=n[7].slice(0,3);l.length<3;)l+="0";l=+l}return n[9]&&(h=+n[10],d=+(n[11]||0),c=(h*60+d)*6e4,n[9]==="-"&&(c=-c)),p=new Date(Date.UTC(t,i,r,o,s,a,l)),c&&p.setTime(p.getTime()-c),p}function ns(e){return e.toISOString()}var ts=new Qo("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Zo,construct:es,instanceOf:Date,represent:ns}),is=R;function rs(e){return e==="<<"||e===null}var os=new is("tag:yaml.org,2002:merge",{kind:"scalar",resolve:rs});function ht(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var J;try{var ss=ht;J=ss("buffer").Buffer}catch{}var as=R,rn=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function ls(e){if(e===null)return!1;var n,t,i=0,r=e.length,o=rn;for(t=0;t<r;t++)if(n=o.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;i+=6}return i%8===0}function cs(e){var n,t,i=e.replace(/[\r\n=]/g,""),r=i.length,o=rn,s=0,a=[];for(n=0;n<r;n++)n%4===0&&n&&(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)),s=s<<6|o.indexOf(i.charAt(n));return t=r%4*6,t===0?(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)):t===18?(a.push(s>>10&255),a.push(s>>2&255)):t===12&&a.push(s>>4&255),J?J.from?J.from(a):new J(a):a}function hs(e){var n="",t=0,i,r,o=e.length,s=rn;for(i=0;i<o;i++)i%3===0&&i&&(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]),t=(t<<8)+e[i];return r=o%3,r===0?(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]):r===2?(n+=s[t>>10&63],n+=s[t>>4&63],n+=s[t<<2&63],n+=s[64]):r===1&&(n+=s[t>>2&63],n+=s[t<<4&63],n+=s[64],n+=s[64]),n}function ds(e){return J&&J.isBuffer(e)}var us=new as("tag:yaml.org,2002:binary",{kind:"scalar",resolve:ls,construct:cs,predicate:ds,represent:hs}),ps=R,fs=Object.prototype.hasOwnProperty,ms=Object.prototype.toString;function gs(e){if(e===null)return!0;var n=[],t,i,r,o,s,a=e;for(t=0,i=a.length;t<i;t+=1){if(r=a[t],s=!1,ms.call(r)!=="[object Object]")return!1;for(o in r)if(fs.call(r,o))if(!s)s=!0;else return!1;if(!s)return!1;if(n.indexOf(o)===-1)n.push(o);else return!1}return!0}function ys(e){return e!==null?e:[]}var bs=new ps("tag:yaml.org,2002:omap",{kind:"sequence",resolve:gs,construct:ys}),_s=R,vs=Object.prototype.toString;function ws(e){if(e===null)return!0;var n,t,i,r,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1){if(i=s[n],vs.call(i)!=="[object Object]"||(r=Object.keys(i),r.length!==1))return!1;o[n]=[r[0],i[r[0]]]}return!0}function xs(e){if(e===null)return[];var n,t,i,r,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1)i=s[n],r=Object.keys(i),o[n]=[r[0],i[r[0]]];return o}var ks=new _s("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:ws,construct:xs}),Cs=R,Ts=Object.prototype.hasOwnProperty;function As(e){if(e===null)return!0;var n,t=e;for(n in t)if(Ts.call(t,n)&&t[n]!==null)return!1;return!0}function Ss(e){return e!==null?e:{}}var Is=new Cs("tag:yaml.org,2002:set",{kind:"mapping",resolve:As,construct:Ss}),Es=se,be=new Es({include:[at],implicit:[ts,os],explicit:[us,bs,ks,Is]}),Ms=R;function Ls(){return!0}function Rs(){}function Os(){return""}function Fs(e){return typeof e>"u"}var Ns=new Ms("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:Ls,construct:Rs,predicate:Fs,represent:Os}),Ds=R;function Ps(e){if(e===null||e.length===0)return!1;var n=e,t=/\/([gim]*)$/.exec(e),i="";return!(n[0]==="/"&&(t&&(i=t[1]),i.length>3||n[n.length-i.length-1]!=="/"))}function Us(e){var n=e,t=/\/([gim]*)$/.exec(e),i="";return n[0]==="/"&&(t&&(i=t[1]),n=n.slice(1,n.length-i.length-1)),new RegExp(n,i)}function Hs(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function Bs(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var $s=new Ds("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:Ps,construct:Us,predicate:Bs,represent:Hs}),Oe;try{var js=ht;Oe=js("esprima")}catch{typeof window<"u"&&(Oe=window.esprima)}var Gs=R;function Ws(e){if(e===null)return!1;try{var n="("+e+")",t=Oe.parse(n,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function Ys(e){var n="("+e+")",t=Oe.parse(n,{range:!0}),i=[],r;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(o){i.push(o.name)}),r=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(i,n.slice(r[0]+1,r[1]-1)):new Function(i,"return "+n.slice(r[0],r[1]))}function Ks(e){return e.toString()}function qs(e){return Object.prototype.toString.call(e)==="[object Function]"}var zs=new Gs("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:Ws,construct:Ys,predicate:qs,represent:Ks}),Bn=se,Ue=Bn.DEFAULT=new Bn({include:[be],explicit:[Ns,$s,zs]}),$=P,dt=ye,Vs=lo,ut=be,Js=Ue,q=Object.prototype.hasOwnProperty,Fe=1,pt=2,ft=3,Ne=4,qe=1,Xs=2,$n=3,Qs=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Zs=/[\x85\u2028\u2029]/,ea=/[,\[\]\{\}]/,mt=/^(?:!|!!|![a-z\-]+!)$/i,gt=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function jn(e){return Object.prototype.toString.call(e)}function B(e){return e===10||e===13}function X(e){return e===9||e===32}function D(e){return e===9||e===32||e===10||e===13}function ne(e){return e===44||e===91||e===93||e===123||e===125}function na(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function ta(e){return e===120?2:e===117?4:e===85?8:0}function ia(e){return 48<=e&&e<=57?e-48:-1}function Gn(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function ra(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function yt(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var bt=new Array(256),_t=new Array(256);for(var Z=0;Z<256;Z++)bt[Z]=Gn(Z)?1:0,_t[Z]=Gn(Z);function oa(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||Js,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function vt(e,n){return new dt(n,new Vs(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function _(e,n){throw vt(e,n)}function De(e,n){e.onWarning&&e.onWarning.call(null,vt(e,n))}var Wn={YAML:function(n,t,i){var r,o,s;n.version!==null&&_(n,"duplication of %YAML directive"),i.length!==1&&_(n,"YAML directive accepts exactly one argument"),r=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),r===null&&_(n,"ill-formed argument of the YAML directive"),o=parseInt(r[1],10),s=parseInt(r[2],10),o!==1&&_(n,"unacceptable YAML version of the document"),n.version=i[0],n.checkLineBreaks=s<2,s!==1&&s!==2&&De(n,"unsupported YAML version of the document")},TAG:function(n,t,i){var r,o;i.length!==2&&_(n,"TAG directive accepts exactly two arguments"),r=i[0],o=i[1],mt.test(r)||_(n,"ill-formed tag handle (first argument) of the TAG directive"),q.call(n.tagMap,r)&&_(n,'there is a previously declared suffix for "'+r+'" tag handle'),gt.test(o)||_(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[r]=o}};function K(e,n,t,i){var r,o,s,a;if(n<t){if(a=e.input.slice(n,t),i)for(r=0,o=a.length;r<o;r+=1)s=a.charCodeAt(r),s===9||32<=s&&s<=1114111||_(e,"expected valid JSON character");else Qs.test(a)&&_(e,"the stream contains non-printable characters");e.result+=a}}function Yn(e,n,t,i){var r,o,s,a;for($.isObject(t)||_(e,"cannot merge mappings; the provided source object is unacceptable"),r=Object.keys(t),s=0,a=r.length;s<a;s+=1)o=r[s],q.call(n,o)||(yt(n,o,t[o]),i[o]=!0)}function te(e,n,t,i,r,o,s,a){var l,c;if(Array.isArray(r))for(r=Array.prototype.slice.call(r),l=0,c=r.length;l<c;l+=1)Array.isArray(r[l])&&_(e,"nested arrays are not supported inside keys"),typeof r=="object"&&jn(r[l])==="[object Object]"&&(r[l]="[object Object]");if(typeof r=="object"&&jn(r)==="[object Object]"&&(r="[object Object]"),r=String(r),n===null&&(n={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)Yn(e,n,o[l],t);else Yn(e,n,o,t);else!e.json&&!q.call(t,r)&&q.call(n,r)&&(e.line=s||e.line,e.position=a||e.position,_(e,"duplicated mapping key")),yt(n,r,o),delete t[r];return n}function on(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):_(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function M(e,n,t){for(var i=0,r=e.input.charCodeAt(e.position);r!==0;){for(;X(r);)r=e.input.charCodeAt(++e.position);if(n&&r===35)do r=e.input.charCodeAt(++e.position);while(r!==10&&r!==13&&r!==0);if(B(r))for(on(e),r=e.input.charCodeAt(e.position),i++,e.lineIndent=0;r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position);else break}return t!==-1&&i!==0&&e.lineIndent<t&&De(e,"deficient indentation"),i}function He(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||D(t)))}function sn(e,n){n===1?e.result+=" ":n>1&&(e.result+=$.repeat(`
`,n-1))}function sa(e,n,t){var i,r,o,s,a,l,c,h,d=e.kind,p=e.result,u;if(u=e.input.charCodeAt(e.position),D(u)||ne(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(r=e.input.charCodeAt(e.position+1),D(r)||t&&ne(r)))return!1;for(e.kind="scalar",e.result="",o=s=e.position,a=!1;u!==0;){if(u===58){if(r=e.input.charCodeAt(e.position+1),D(r)||t&&ne(r))break}else if(u===35){if(i=e.input.charCodeAt(e.position-1),D(i))break}else{if(e.position===e.lineStart&&He(e)||t&&ne(u))break;if(B(u))if(l=e.line,c=e.lineStart,h=e.lineIndent,M(e,!1,-1),e.lineIndent>=n){a=!0,u=e.input.charCodeAt(e.position);continue}else{e.position=s,e.line=l,e.lineStart=c,e.lineIndent=h;break}}a&&(K(e,o,s,!1),sn(e,e.line-l),o=s=e.position,a=!1),X(u)||(s=e.position+1),u=e.input.charCodeAt(++e.position)}return K(e,o,s,!1),e.result?!0:(e.kind=d,e.result=p,!1)}function aa(e,n){var t,i,r;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,i=r=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(K(e,i,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)i=e.position,e.position++,r=e.position;else return!0;else B(t)?(K(e,i,r,!0),sn(e,M(e,!1,n)),i=r=e.position):e.position===e.lineStart&&He(e)?_(e,"unexpected end of the document within a single quoted scalar"):(e.position++,r=e.position);_(e,"unexpected end of the stream within a single quoted scalar")}function la(e,n){var t,i,r,o,s,a;if(a=e.input.charCodeAt(e.position),a!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=i=e.position;(a=e.input.charCodeAt(e.position))!==0;){if(a===34)return K(e,t,e.position,!0),e.position++,!0;if(a===92){if(K(e,t,e.position,!0),a=e.input.charCodeAt(++e.position),B(a))M(e,!1,n);else if(a<256&&bt[a])e.result+=_t[a],e.position++;else if((s=ta(a))>0){for(r=s,o=0;r>0;r--)a=e.input.charCodeAt(++e.position),(s=na(a))>=0?o=(o<<4)+s:_(e,"expected hexadecimal character");e.result+=ra(o),e.position++}else _(e,"unknown escape sequence");t=i=e.position}else B(a)?(K(e,t,i,!0),sn(e,M(e,!1,n)),t=i=e.position):e.position===e.lineStart&&He(e)?_(e,"unexpected end of the document within a double quoted scalar"):(e.position++,i=e.position)}_(e,"unexpected end of the stream within a double quoted scalar")}function ca(e,n){var t=!0,i,r=e.tag,o,s=e.anchor,a,l,c,h,d,p={},u,m,v,w;if(w=e.input.charCodeAt(e.position),w===91)l=93,d=!1,o=[];else if(w===123)l=125,d=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),w=e.input.charCodeAt(++e.position);w!==0;){if(M(e,!0,n),w=e.input.charCodeAt(e.position),w===l)return e.position++,e.tag=r,e.anchor=s,e.kind=d?"mapping":"sequence",e.result=o,!0;t||_(e,"missed comma between flow collection entries"),m=u=v=null,c=h=!1,w===63&&(a=e.input.charCodeAt(e.position+1),D(a)&&(c=h=!0,e.position++,M(e,!0,n))),i=e.line,re(e,n,Fe,!1,!0),m=e.tag,u=e.result,M(e,!0,n),w=e.input.charCodeAt(e.position),(h||e.line===i)&&w===58&&(c=!0,w=e.input.charCodeAt(++e.position),M(e,!0,n),re(e,n,Fe,!1,!0),v=e.result),d?te(e,o,p,m,u,v):c?o.push(te(e,null,p,m,u,v)):o.push(u),M(e,!0,n),w=e.input.charCodeAt(e.position),w===44?(t=!0,w=e.input.charCodeAt(++e.position)):t=!1}_(e,"unexpected end of the stream within a flow collection")}function ha(e,n){var t,i,r=qe,o=!1,s=!1,a=n,l=0,c=!1,h,d;if(d=e.input.charCodeAt(e.position),d===124)i=!1;else if(d===62)i=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)qe===r?r=d===43?$n:Xs:_(e,"repeat of a chomping mode identifier");else if((h=ia(d))>=0)h===0?_(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?_(e,"repeat of an indentation width identifier"):(a=n+h-1,s=!0);else break;if(X(d)){do d=e.input.charCodeAt(++e.position);while(X(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!B(d)&&d!==0)}for(;d!==0;){for(on(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!s||e.lineIndent<a)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>a&&(a=e.lineIndent),B(d)){l++;continue}if(e.lineIndent<a){r===$n?e.result+=$.repeat(`
`,o?1+l:l):r===qe&&o&&(e.result+=`
`);break}for(i?X(d)?(c=!0,e.result+=$.repeat(`
`,o?1+l:l)):c?(c=!1,e.result+=$.repeat(`
`,l+1)):l===0?o&&(e.result+=" "):e.result+=$.repeat(`
`,l):e.result+=$.repeat(`
`,o?1+l:l),o=!0,s=!0,l=0,t=e.position;!B(d)&&d!==0;)d=e.input.charCodeAt(++e.position);K(e,t,e.position,!1)}return!0}function Kn(e,n){var t,i=e.tag,r=e.anchor,o=[],s,a=!1,l;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),l=e.input.charCodeAt(e.position);l!==0&&!(l!==45||(s=e.input.charCodeAt(e.position+1),!D(s)));){if(a=!0,e.position++,M(e,!0,-1)&&e.lineIndent<=n){o.push(null),l=e.input.charCodeAt(e.position);continue}if(t=e.line,re(e,n,ft,!1,!0),o.push(e.result),M(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&l!==0)_(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return a?(e.tag=i,e.anchor=r,e.kind="sequence",e.result=o,!0):!1}function da(e,n,t){var i,r,o,s,a=e.tag,l=e.anchor,c={},h={},d=null,p=null,u=null,m=!1,v=!1,w;for(e.anchor!==null&&(e.anchorMap[e.anchor]=c),w=e.input.charCodeAt(e.position);w!==0;){if(i=e.input.charCodeAt(e.position+1),o=e.line,s=e.position,(w===63||w===58)&&D(i))w===63?(m&&(te(e,c,h,d,p,null),d=p=u=null),v=!0,m=!0,r=!0):m?(m=!1,r=!0):_(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,w=i;else if(re(e,t,pt,!1,!0))if(e.line===o){for(w=e.input.charCodeAt(e.position);X(w);)w=e.input.charCodeAt(++e.position);if(w===58)w=e.input.charCodeAt(++e.position),D(w)||_(e,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(te(e,c,h,d,p,null),d=p=u=null),v=!0,m=!1,r=!1,d=e.tag,p=e.result;else if(v)_(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=a,e.anchor=l,!0}else if(v)_(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=a,e.anchor=l,!0;else break;if((e.line===o||e.lineIndent>n)&&(re(e,n,Ne,!0,r)&&(m?p=e.result:u=e.result),m||(te(e,c,h,d,p,u,o,s),d=p=u=null),M(e,!0,-1),w=e.input.charCodeAt(e.position)),e.lineIndent>n&&w!==0)_(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return m&&te(e,c,h,d,p,null),v&&(e.tag=a,e.anchor=l,e.kind="mapping",e.result=c),v}function ua(e){var n,t=!1,i=!1,r,o,s;if(s=e.input.charCodeAt(e.position),s!==33)return!1;if(e.tag!==null&&_(e,"duplication of a tag property"),s=e.input.charCodeAt(++e.position),s===60?(t=!0,s=e.input.charCodeAt(++e.position)):s===33?(i=!0,r="!!",s=e.input.charCodeAt(++e.position)):r="!",n=e.position,t){do s=e.input.charCodeAt(++e.position);while(s!==0&&s!==62);e.position<e.length?(o=e.input.slice(n,e.position),s=e.input.charCodeAt(++e.position)):_(e,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!D(s);)s===33&&(i?_(e,"tag suffix cannot contain exclamation marks"):(r=e.input.slice(n-1,e.position+1),mt.test(r)||_(e,"named tag handle cannot contain such characters"),i=!0,n=e.position+1)),s=e.input.charCodeAt(++e.position);o=e.input.slice(n,e.position),ea.test(o)&&_(e,"tag suffix cannot contain flow indicator characters")}return o&&!gt.test(o)&&_(e,"tag name cannot contain such characters: "+o),t?e.tag=o:q.call(e.tagMap,r)?e.tag=e.tagMap[r]+o:r==="!"?e.tag="!"+o:r==="!!"?e.tag="tag:yaml.org,2002:"+o:_(e,'undeclared tag handle "'+r+'"'),!0}function pa(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&_(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!D(t)&&!ne(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&_(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function fa(e){var n,t,i;if(i=e.input.charCodeAt(e.position),i!==42)return!1;for(i=e.input.charCodeAt(++e.position),n=e.position;i!==0&&!D(i)&&!ne(i);)i=e.input.charCodeAt(++e.position);return e.position===n&&_(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),q.call(e.anchorMap,t)||_(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],M(e,!0,-1),!0}function re(e,n,t,i,r){var o,s,a,l=1,c=!1,h=!1,d,p,u,m,v;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=s=a=Ne===t||ft===t,i&&M(e,!0,-1)&&(c=!0,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)),l===1)for(;ua(e)||pa(e);)M(e,!0,-1)?(c=!0,a=o,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)):a=!1;if(a&&(a=c||r),(l===1||Ne===t)&&(Fe===t||pt===t?m=n:m=n+1,v=e.position-e.lineStart,l===1?a&&(Kn(e,v)||da(e,v,m))||ca(e,m)?h=!0:(s&&ha(e,m)||aa(e,m)||la(e,m)?h=!0:fa(e)?(h=!0,(e.tag!==null||e.anchor!==null)&&_(e,"alias node should not have any properties")):sa(e,m,Fe===t)&&(h=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(h=a&&Kn(e,v))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&_(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,p=e.implicitTypes.length;d<p;d+=1)if(u=e.implicitTypes[d],u.resolve(e.result)){e.result=u.construct(e.result),e.tag=u.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else q.call(e.typeMap[e.kind||"fallback"],e.tag)?(u=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&u.kind!==e.kind&&_(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+u.kind+'", not "'+e.kind+'"'),u.resolve(e.result)?(e.result=u.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):_(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):_(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||h}function ma(e){var n=e.position,t,i,r,o=!1,s;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(s=e.input.charCodeAt(e.position))!==0&&(M(e,!0,-1),s=e.input.charCodeAt(e.position),!(e.lineIndent>0||s!==37));){for(o=!0,s=e.input.charCodeAt(++e.position),t=e.position;s!==0&&!D(s);)s=e.input.charCodeAt(++e.position);for(i=e.input.slice(t,e.position),r=[],i.length<1&&_(e,"directive name must not be less than one character in length");s!==0;){for(;X(s);)s=e.input.charCodeAt(++e.position);if(s===35){do s=e.input.charCodeAt(++e.position);while(s!==0&&!B(s));break}if(B(s))break;for(t=e.position;s!==0&&!D(s);)s=e.input.charCodeAt(++e.position);r.push(e.input.slice(t,e.position))}s!==0&&on(e),q.call(Wn,i)?Wn[i](e,i,r):De(e,'unknown document directive "'+i+'"')}if(M(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,M(e,!0,-1)):o&&_(e,"directives end mark is expected"),re(e,e.lineIndent-1,Ne,!1,!0),M(e,!0,-1),e.checkLineBreaks&&Zs.test(e.input.slice(n,e.position))&&De(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&He(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,M(e,!0,-1));return}if(e.position<e.length-1)_(e,"end of the stream or a document separator is expected");else return}function wt(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new oa(e,n),i=e.indexOf("\0");for(i!==-1&&(t.position=i,_(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)ma(t);return t.documents}function xt(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var i=wt(e,t);if(typeof n!="function")return i;for(var r=0,o=i.length;r<o;r+=1)n(i[r])}function kt(e,n){var t=wt(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new dt("expected a single document in the stream, but found more")}}function ga(e,n,t){return typeof n=="object"&&n!==null&&typeof t>"u"&&(t=n,n=null),xt(e,n,$.extend({schema:ut},t))}function ya(e,n){return kt(e,$.extend({schema:ut},n))}ge.loadAll=xt;ge.load=kt;ge.safeLoadAll=ga;ge.safeLoad=ya;var an={},_e=P,ve=ye,ba=Ue,_a=be,Ct=Object.prototype.toString,Tt=Object.prototype.hasOwnProperty,va=9,fe=10,wa=13,xa=32,ka=33,Ca=34,At=35,Ta=37,Aa=38,Sa=39,Ia=42,St=44,Ea=45,It=58,Ma=61,La=62,Ra=63,Oa=64,Et=91,Mt=93,Fa=96,Lt=123,Na=124,Rt=125,F={};F[0]="\\0";F[7]="\\a";F[8]="\\b";F[9]="\\t";F[10]="\\n";F[11]="\\v";F[12]="\\f";F[13]="\\r";F[27]="\\e";F[34]='\\"';F[92]="\\\\";F[133]="\\N";F[160]="\\_";F[8232]="\\L";F[8233]="\\P";var Da=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function Pa(e,n){var t,i,r,o,s,a,l;if(n===null)return{};for(t={},i=Object.keys(n),r=0,o=i.length;r<o;r+=1)s=i[r],a=String(n[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),l=e.compiledTypeMap.fallback[s],l&&Tt.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[s]=a;return t}function qn(e){var n,t,i;if(n=e.toString(16).toUpperCase(),e<=255)t="x",i=2;else if(e<=65535)t="u",i=4;else if(e<=4294967295)t="U",i=8;else throw new ve("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+_e.repeat("0",i-n.length)+n}function Ua(e){this.schema=e.schema||ba,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=_e.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=Pa(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function zn(e,n){for(var t=_e.repeat(" ",n),i=0,r=-1,o="",s,a=e.length;i<a;)r=e.indexOf(`
`,i),r===-1?(s=e.slice(i),i=a):(s=e.slice(i,r+1),i=r+1),s.length&&s!==`
`&&(o+=t),o+=s;return o}function Xe(e,n){return`
`+_e.repeat(" ",e.indent*n)}function Ha(e,n){var t,i,r;for(t=0,i=e.implicitTypes.length;t<i;t+=1)if(r=e.implicitTypes[t],r.resolve(n))return!0;return!1}function ln(e){return e===xa||e===va}function oe(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function Ba(e){return oe(e)&&!ln(e)&&e!==65279&&e!==wa&&e!==fe}function Vn(e,n){return oe(e)&&e!==65279&&e!==St&&e!==Et&&e!==Mt&&e!==Lt&&e!==Rt&&e!==It&&(e!==At||n&&Ba(n))}function $a(e){return oe(e)&&e!==65279&&!ln(e)&&e!==Ea&&e!==Ra&&e!==It&&e!==St&&e!==Et&&e!==Mt&&e!==Lt&&e!==Rt&&e!==At&&e!==Aa&&e!==Ia&&e!==ka&&e!==Na&&e!==Ma&&e!==La&&e!==Sa&&e!==Ca&&e!==Ta&&e!==Oa&&e!==Fa}function Ot(e){var n=/^\n* /;return n.test(e)}var Ft=1,Nt=2,Dt=3,Pt=4,Le=5;function ja(e,n,t,i,r){var o,s,a,l=!1,c=!1,h=i!==-1,d=-1,p=$a(e.charCodeAt(0))&&!ln(e.charCodeAt(e.length-1));if(n)for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),!oe(s))return Le;a=o>0?e.charCodeAt(o-1):null,p=p&&Vn(s,a)}else{for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),s===fe)l=!0,h&&(c=c||o-d-1>i&&e[d+1]!==" ",d=o);else if(!oe(s))return Le;a=o>0?e.charCodeAt(o-1):null,p=p&&Vn(s,a)}c=c||h&&o-d-1>i&&e[d+1]!==" "}return!l&&!c?p&&!r(e)?Ft:Nt:t>9&&Ot(e)?Le:c?Pt:Dt}function Ga(e,n,t,i){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&Da.indexOf(n)!==-1)return"'"+n+"'";var r=e.indent*Math.max(1,t),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-r),s=i||e.flowLevel>-1&&t>=e.flowLevel;function a(l){return Ha(e,l)}switch(ja(n,s,e.indent,o,a)){case Ft:return n;case Nt:return"'"+n.replace(/'/g,"''")+"'";case Dt:return"|"+Jn(n,e.indent)+Xn(zn(n,r));case Pt:return">"+Jn(n,e.indent)+Xn(zn(Wa(n,o),r));case Le:return'"'+Ya(n)+'"';default:throw new ve("impossible error: invalid scalar style")}}()}function Jn(e,n){var t=Ot(e)?String(n):"",i=e[e.length-1]===`
`,r=i&&(e[e.length-2]===`
`||e===`
`),o=r?"+":i?"":"-";return t+o+`
`}function Xn(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function Wa(e,n){for(var t=/(\n+)([^\n]*)/g,i=function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,t.lastIndex=c,Qn(e.slice(0,c),n)}(),r=e[0]===`
`||e[0]===" ",o,s;s=t.exec(e);){var a=s[1],l=s[2];o=l[0]===" ",i+=a+(!r&&!o&&l!==""?`
`:"")+Qn(l,n),r=o}return i}function Qn(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,i,r=0,o,s=0,a=0,l="";i=t.exec(e);)a=i.index,a-r>n&&(o=s>r?s:a,l+=`
`+e.slice(r,o),r=o+1),s=a;return l+=`
`,e.length-r>n&&s>r?l+=e.slice(r,s)+`
`+e.slice(s+1):l+=e.slice(r),l.slice(1)}function Ya(e){for(var n="",t,i,r,o=0;o<e.length;o++){if(t=e.charCodeAt(o),t>=55296&&t<=56319&&(i=e.charCodeAt(o+1),i>=56320&&i<=57343)){n+=qn((t-55296)*1024+i-56320+65536),o++;continue}r=F[t],n+=!r&&oe(t)?e[o]:r||qn(t)}return n}function Ka(e,n,t){var i="",r=e.tag,o,s;for(o=0,s=t.length;o<s;o+=1)Q(e,n,t[o],!1,!1)&&(o!==0&&(i+=","+(e.condenseFlow?"":" ")),i+=e.dump);e.tag=r,e.dump="["+i+"]"}function qa(e,n,t,i){var r="",o=e.tag,s,a;for(s=0,a=t.length;s<a;s+=1)Q(e,n+1,t[s],!0,!0)&&((!i||s!==0)&&(r+=Xe(e,n)),e.dump&&fe===e.dump.charCodeAt(0)?r+="-":r+="- ",r+=e.dump);e.tag=o,e.dump=r||"[]"}function za(e,n,t){var i="",r=e.tag,o=Object.keys(t),s,a,l,c,h;for(s=0,a=o.length;s<a;s+=1)h="",s!==0&&(h+=", "),e.condenseFlow&&(h+='"'),l=o[s],c=t[l],Q(e,n,l,!1,!1)&&(e.dump.length>1024&&(h+="? "),h+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),Q(e,n,c,!1,!1)&&(h+=e.dump,i+=h));e.tag=r,e.dump="{"+i+"}"}function Va(e,n,t,i){var r="",o=e.tag,s=Object.keys(t),a,l,c,h,d,p;if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys=="function")s.sort(e.sortKeys);else if(e.sortKeys)throw new ve("sortKeys must be a boolean or a function");for(a=0,l=s.length;a<l;a+=1)p="",(!i||a!==0)&&(p+=Xe(e,n)),c=s[a],h=t[c],Q(e,n+1,c,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&fe===e.dump.charCodeAt(0)?p+="?":p+="? "),p+=e.dump,d&&(p+=Xe(e,n)),Q(e,n+1,h,!0,d)&&(e.dump&&fe===e.dump.charCodeAt(0)?p+=":":p+=": ",p+=e.dump,r+=p));e.tag=o,e.dump=r||"{}"}function Zn(e,n,t){var i,r,o,s,a,l;for(r=t?e.explicitTypes:e.implicitTypes,o=0,s=r.length;o<s;o+=1)if(a=r[o],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof n=="object"&&n instanceof a.instanceOf)&&(!a.predicate||a.predicate(n))){if(e.tag=t?a.tag:"?",a.represent){if(l=e.styleMap[a.tag]||a.defaultStyle,Ct.call(a.represent)==="[object Function]")i=a.represent(n,l);else if(Tt.call(a.represent,l))i=a.represent[l](n,l);else throw new ve("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');e.dump=i}return!0}return!1}function Q(e,n,t,i,r,o){e.tag=null,e.dump=t,Zn(e,t,!1)||Zn(e,t,!0);var s=Ct.call(e.dump);i&&(i=e.flowLevel<0||e.flowLevel>n);var a=s==="[object Object]"||s==="[object Array]",l,c;if(a&&(l=e.duplicates.indexOf(t),c=l!==-1),(e.tag!==null&&e.tag!=="?"||c||e.indent!==2&&n>0)&&(r=!1),c&&e.usedDuplicates[l])e.dump="*ref_"+l;else{if(a&&c&&!e.usedDuplicates[l]&&(e.usedDuplicates[l]=!0),s==="[object Object]")i&&Object.keys(e.dump).length!==0?(Va(e,n,e.dump,r),c&&(e.dump="&ref_"+l+e.dump)):(za(e,n,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump));else if(s==="[object Array]"){var h=e.noArrayIndent&&n>0?n-1:n;i&&e.dump.length!==0?(qa(e,h,e.dump,r),c&&(e.dump="&ref_"+l+e.dump)):(Ka(e,h,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump))}else if(s==="[object String]")e.tag!=="?"&&Ga(e,e.dump,n,o);else{if(e.skipInvalid)return!1;throw new ve("unacceptable kind of an object to dump "+s)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function Ja(e,n){var t=[],i=[],r,o;for(Qe(e,t,i),r=0,o=i.length;r<o;r+=1)n.duplicates.push(t[i[r]]);n.usedDuplicates=new Array(o)}function Qe(e,n,t){var i,r,o;if(e!==null&&typeof e=="object")if(r=n.indexOf(e),r!==-1)t.indexOf(r)===-1&&t.push(r);else if(n.push(e),Array.isArray(e))for(r=0,o=e.length;r<o;r+=1)Qe(e[r],n,t);else for(i=Object.keys(e),r=0,o=i.length;r<o;r+=1)Qe(e[i[r]],n,t)}function Ut(e,n){n=n||{};var t=new Ua(n);return t.noRefs||Ja(e,t),Q(t,0,e,!0,!0)?t.dump+`
`:""}function Xa(e,n){return Ut(e,_e.extend({schema:_a},n))}an.dump=Ut;an.safeDump=Xa;var Be=ge,Ht=an;function $e(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}E.Type=R;E.Schema=se;E.FAILSAFE_SCHEMA=tn;E.JSON_SCHEMA=st;E.CORE_SCHEMA=at;E.DEFAULT_SAFE_SCHEMA=be;E.DEFAULT_FULL_SCHEMA=Ue;E.load=Be.load;E.loadAll=Be.loadAll;E.safeLoad=Be.safeLoad;E.safeLoadAll=Be.safeLoadAll;E.dump=Ht.dump;E.safeDump=Ht.safeDump;E.YAMLException=ye;E.MINIMAL_SCHEMA=tn;E.SAFE_SCHEMA=be;E.DEFAULT_SCHEMA=Ue;E.scan=$e("scan");E.parse=$e("parse");E.compose=$e("compose");E.addConstructor=$e("addConstructor");var Qa=E,Za=Qa;function el(e){if(!e.startsWith(`---
`))return{data:{},content:e};const n=e.indexOf(`
---`,4);if(n===-1)return{data:{},content:e};const t=e.slice(4,n),i=e.slice(n+4),r=i.startsWith(`
`)?i.slice(1):i;return{data:Za.safeLoad(t)??{},content:r}}function nl(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[]};for(const[t,i]of Object.entries(e)){const r=t.split("/").pop()??"";if(r==="_template.md"||r===".gitkeep")continue;const{data:o,content:s}=el(i);/^systems\/[^/]+\.md$/.test(t)?n.systems.push(tl(o,s)):/^destinations\/[^/]+\.md$/.test(t)?n.destinations.push(il(o,s)):/^factions\/[^/]+\.md$/.test(t)?n.factions.push(rl(o,s)):/^ships\/[^/]+\.md$/.test(t)?n.ships.push(ol(o,s)):t==="ships/components/jump-drives.md"?n.drives=sl(o):t==="navigation/jump-routes.md"?n.routes=al(o):t==="commodities.md"?n.commodities=ll(o):/^story\/[^/]+\.md$/.test(t)?n.storyBeats.push(cl(o,s)):t==="game-settings.md"&&(n.settings=hl(o))}return n}function je(e){const n=[];let t=!1;for(const i of e.split(`
`)){const r=i.trim();if(!r.startsWith("#"))if(r===""){if(t)break}else t=!0,n.push(r)}return n.join(" ")}function tl(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economy:e.economy??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:je(n)}}function il(e,n){const t=e.amenities??{},i={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:i,npcs:e.npcs??{},goodsBias:e.goods_bias??[],dangerLevel:e.danger_level,tags:e.tags??[],description:je(n)}}function rl(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:je(n)}}function ol(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,tags:e.tags??[],description:je(n)}}function sl(e){return(e.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function al(e){return(e.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function ll(e){return(e.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function cl(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function hl(e){var n,t,i,r;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((t=e.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((i=e.starting_location)==null?void 0:i.system)??"",destination:((r=e.starting_location)==null?void 0:r.destination)??""},startingShip:e.starting_ship??""}}function dl(){const e=Object.assign({"/docs/world/commodities.md":ar,"/docs/world/destinations/_template.md":lr,"/docs/world/destinations/blackwake-yard.md":cr,"/docs/world/destinations/ceti-landfall.md":hr,"/docs/world/destinations/drift-market.md":dr,"/docs/world/destinations/elysium-station.md":ur,"/docs/world/destinations/eridani-anchorage.md":pr,"/docs/world/destinations/foundries-platform.md":fr,"/docs/world/destinations/galileo-transfer.md":mr,"/docs/world/destinations/hestia-ring.md":gr,"/docs/world/destinations/keelhaul-station.md":yr,"/docs/world/destinations/kepler-yard.md":br,"/docs/world/destinations/mars-anchor.md":_r,"/docs/world/destinations/meridian-station.md":vr,"/docs/world/destinations/new-horizon-port.md":wr,"/docs/world/destinations/orrery-anchorage.md":xr,"/docs/world/destinations/redline-station.md":kr,"/docs/world/destinations/tycho-orbital.md":Cr,"/docs/world/destinations/veil-station.md":Tr,"/docs/world/destinations/waypoint-ceti.md":Ar,"/docs/world/factions/_template.md":Sr,"/docs/world/factions/centauri-trade-league.md":Ir,"/docs/world/factions/eridani-colonial-council.md":Er,"/docs/world/factions/free-captains.md":Mr,"/docs/world/factions/grey-market-cartel.md":Lr,"/docs/world/factions/helios-directorate.md":Rr,"/docs/world/factions/independent-miners-guild.md":Or,"/docs/world/factions/procyon-institute.md":Fr,"/docs/world/factions/terran-union.md":Nr,"/docs/world/galaxy-map.md":Dr,"/docs/world/game-settings.md":Pr,"/docs/world/navigation/jump-routes.md":Ur,"/docs/world/ships/_template.md":Hr,"/docs/world/ships/components/jump-drives.md":Br,"/docs/world/ships/freighter.md":$r,"/docs/world/ships/hauler.md":jr,"/docs/world/ships/scout.md":Gr,"/docs/world/story/_template.md":Wr,"/docs/world/story/enter-wolf-359.md":Yr,"/docs/world/story/first-jump.md":Kr,"/docs/world/story/opening-arrival.md":qr,"/docs/world/systems/_template.md":zr,"/docs/world/systems/alpha-centauri.md":Vr,"/docs/world/systems/barnards-star.md":Jr,"/docs/world/systems/epsilon-eridani.md":Xr,"/docs/world/systems/procyon.md":Qr,"/docs/world/systems/sirius.md":Zr,"/docs/world/systems/sol.md":eo,"/docs/world/systems/tau-ceti.md":no,"/docs/world/systems/wolf-359.md":to}),n={};for(const[t,i]of Object.entries(e)){const r=t.replace("/docs/world/","");n[r]=i}return nl(n)}ni(dl());const ul=navigator.maxTouchPoints>0?"touch":"keyboard",pl=new URLSearchParams(window.location.search).has("debug"),Bt={environment:"browser",primaryInput:ul,debug:pl},fl=new Kt,$t=new Jt(Bt);$t.connect();const ml=new sr(fl,$t,Bt);let et=0;function jt(e){ml.tick(e-et),et=e,requestAnimationFrame(jt)}requestAnimationFrame(jt);
