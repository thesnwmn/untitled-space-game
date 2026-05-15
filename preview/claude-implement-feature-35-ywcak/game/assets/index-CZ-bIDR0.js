(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const oe=40,ge=30,Tt=50,Ne=24;function St(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class It{constructor(){this.charW=0,this.charH=0,this.gridH=ge,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(oe),this.pre.dataset.gridRows=String(ge),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${Ne}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${Ne}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const t=n.getBoundingClientRect();document.body.removeChild(n),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(oe*this.charW),window.innerHeight/(ge*this.charH)),t=Math.max(ge,Math.min(Tt,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${Ne*n}px`,this.pre.style.width=`${oe*this.charW*n}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const i of this.resizeHandlers)i(oe,t)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const t=[];for(const i of n){let r="";for(const o of i){const a=o.fg!=="transparent"?`fg-${o.fg}`:"",s=o.bg!=="transparent"?`bg-${o.bg}`:"",l=a&&s?`${a} ${s}`:a||s,c=l?` class="${l}"`:"";r+=`<span${c}>${St(o.char)}</span>`}t.push(r)}this.pre.innerHTML=t.join(`
`)}getWidth(){return oe}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const Et={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},Mt=new Set(["0","1","2","3","4","5","6","7","8","9"]),Lt=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class Rt{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}connect(){this.keyListener=n=>{if(Lt.has(n.key)&&n.preventDefault(),Mt.has(n.key))for(const i of this.charInputHandlers.slice())i(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const i of this.charInputHandlers.slice())i("\b");return}const t=Et[n.key];if(t)for(const i of this.actionHandlers.slice())i(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=n=>{const t=this.pointerStartMap.get(n.pointerId),i=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),!t){this.logDebug(`UP id=${n.pointerId} NO START`);return}const r=n.clientX-t.startX,o=n.clientY-t.startY,a=Math.abs(r),s=Math.abs(o);if(a<20&&s<20)if(i>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;a>=s?l=r>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(r)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=n=>{this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const t=n.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(n,t){const i=document.querySelector(".game-screen");if(!i)return null;const r=i.getBoundingClientRect(),o=parseInt(i.dataset.gridCols??"1"),a=parseInt(i.dataset.gridRows??"1");if(!o||!a||!r.width||!r.height)return null;const s=Math.floor((n-r.left)/(r.width/o)),l=Math.floor((t-r.top)/(r.height/a));return s<0||s>=o||l<0||l>=a?null:{col:s,row:l}}}function y(e,n,t,i,r,o){if(n<0||n>=e.length)return;const a=e[n];for(let s=0;s<i.length;s++){const l=t+s;l>=0&&l<a.length&&(a[l]={char:i[s],fg:r,bg:o})}}function C(e,n,t,i,r){if(n<0||n>=e.length)return;const o=e[n].length,a=Math.max(0,Math.floor((o-t.length)/2));y(e,n,a,t,i,r)}function Nn(e,n){const t=e.split(/\s+/).filter(Boolean),i=[];let r="";for(const o of t)r.length===0?r=o:r.length+1+o.length<=n?r+=" "+o:(i.push(r),r=o);return r.length>0&&i.push(r),i}const Ze=["UNTITLED","SPACE GAME"],Ft=4,Ot=3,Nt="- An ASCII space adventure -",Dt=11,en=16;class nn{constructor(n,t,i,r){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,r()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),n.onAction(o=>{this.activated||(o==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:o==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:o==="SELECT"&&this.items[this.cursorIdx].action())}),n.onTap&&n.onTap((o,a)=>{if(!this.activated){for(let s=0;s<this.items.length;s++)if(a===en+s){this.cursorIdx=s,this.items[s].action();return}}})}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let a=0;a<t;a++)for(let s=0;s<i;s++)n[a][s]={char:" ",fg:"black",bg:"black"};for(let a=0;a<Ze.length;a++)C(n,Ft+a*Ot,Ze[a],"bright-cyan","black");C(n,Dt,Nt,"white","black");const r=this.items.reduce((a,s)=>Math.max(a,s.label.length+2),0),o=Math.max(0,Math.floor((i-r)/2));for(let a=0;a<this.items.length;a++){const s=en+a;if(s>=t)continue;const l=a===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";y(n,s,o,c+this.items[a].label,h,"black")}}}let Ue=null;function Pt(e){Ue=e}function H(){if(Ue===null)throw new Error("World not initialised — call initWorld() before accessing world data");return Ue}function xe(e){return H().systems.find(n=>n.id===e)}function $(e){return H().destinations.find(n=>n.id===e)}function Ut(e){return H().routes.filter(n=>n.from===e||n.to===e)}function Dn(e){return H().drives.find(n=>n.id===e)}function Ht(e){return H().storyBeats.filter(n=>n.trigger===e)}function Bt(){return H().settings}function Pn(e){return H().ships.find(n=>n.id===e)}function $t(e,n){return H().routes.find(t=>t.from===e&&t.to===n||t.from===n&&t.to===e)}function Z(e){return H().commodities.find(n=>n.id===e)}function jt(){return H().commodities}function Gt(e){return e.reduce((n,t)=>{const i=Z(t.commodityId);return n+t.qty*((i==null?void 0:i.weightKg)??0)},0)}const W=3;function Un(e,n){return n?e-2:e}function Yt(e){return e.toLocaleString("en-US")}class Se{constructor(n,t){this.buttonRanges=null,this.footerRow=-1,this.context=n,this.player=t}render(n,t){const i=n.length,r=i>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader&&(this.renderHeaderRow0(n,r,t.systemLabel),this.renderHeaderRow1(n,r,t.destinationLabel)),t.showFooter&&(this.renderFooter(n,i,r,t.navOptions),this.footerRow=i-1)}renderHeaderRow0(n,t,i){const r=i!==void 0?i??"":(()=>{const c=xe(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),o="::";y(n,0,0,o,"bright-black","black"),y(n,0,o.length,r,"bright-cyan","black");const s=t-o.length-r.length-10;let l=o.length+r.length;for(let c=0;c<s;c++)n[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=s,y(n,0,l,"[M]","white","black"),l+=3,y(n,0,l," MENU","white","black"),l+=5,y(n,0,l,"::","bright-black","black")}renderHeaderRow1(n,t,i){const r=i!==void 0?i??"":(()=>{const h=this.player.destinationId?$(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),o=Yt(this.player.credits),a=o.length+5,s="::";y(n,1,0,s,"bright-black","black"),y(n,1,s.length,r,"cyan","black");const l=t-s.length-r.length-a;let c=s.length+r.length;for(let h=0;h<l;h++)n[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,y(n,1,c,o,"green","black"),c+=o.length,y(n,1,c," CR","white","black"),c+=3,y(n,1,c,"::","bright-black","black")}renderFooter(n,t,i,r){const o=t-1,a=[];if(r.length===0){for(let l=0;l<i;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}y(n,o,0,"::","bright-black","black");let s=2;for(let l=0;l<r.length;l++){l>0&&(y(n,o,s,"::","bright-black","black"),s+=2);const c=r[l],h=`[${l+1}]`,d=` ${c.label}`,p=s;y(n,o,s,h,"white","black"),s+=h.length,y(n,o,s,d,"white","black"),s+=d.length,a.push({id:c.id,startCol:p,endCol:s})}for(let l=s;l<i;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=a}hitTestNav(n,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const i of this.buttonRanges)if(n>=i.startCol&&n<i.endCol)return i.id;return null}}const Wt=3,tn=5;class Kt{constructor(n,t,i,r){this.activated=!1,this.pageIndex=0,this.onContinue=r,this.chrome=new Se(t,i);const a=Ht("game-start")[0].text.split(`

`),s=a[0].trim();let l;/^YEAR\s+\d{4}$/.test(s)?(this.yearHeader=s,l=a.slice(1)):(this.yearHeader="",l=a);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),p=Nn(d,36);h>0&&c.push(""),c.push(...p)}this.bodyLines=c,n.onAction(h=>{this.activated||(h==="SELECT"?(this.activated=!0,this.onContinue()):h==="LEFT"?this.pageIndex>0&&this.pageIndex--:h==="RIGHT"&&this.pageIndex++)}),n.onTap&&n.onTap((h,d)=>{this.activated||(this.activated=!0,this.onContinue())})}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let d=0;d<t;d++)for(let p=0;p<i;p++)n[d][p]={char:" ",fg:"black",bg:"black"};if(this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:[]}),this.yearHeader){const d=Math.max(0,Math.floor((i-this.yearHeader.length)/2));y(n,Wt,d,this.yearHeader,"bright-yellow","black")}const o=t-3-tn,a=Math.max(1,Math.ceil(this.bodyLines.length/o));this.pageIndex>=a&&(this.pageIndex=a-1);const s=a>1,l=this.pageIndex*o,c=Math.min(l+o,this.bodyLines.length);let h=tn;for(let d=l;d<c;d++){const p=this.bodyLines[d];p!==""&&y(n,h,2,p,"white","black"),h++}if(s){const d=`< ${this.pageIndex+1}/${a} >`,p=i-9;y(n,t-3,p,d,"bright-black","black")}}}const Hn=5,ae=10;class Ie{constructor(n,t,i,r,o,a,s=[],l=null){this.activeTabIdx=0,this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.activated=!1,this.modal=null,this.title=n,this._staticItems=t,this.tabs=l,this.context=o,this.player=a,this.chrome=new Se(o,a),this.navOptions=i,this.infoLines=s,this.itemStartRow=l!==null?W+5:W+3+s.length,r.onCharInput&&r.onCharInput(c=>{this.modal!==null&&this.modal.handleCharInput(c)}),r.onAction(c=>{if(this.modal!==null){this.modal.handleAction(c);return}this.activated||(c==="UP"?this.moveCursor(-1):c==="DOWN"?this.moveCursor(1):c==="LEFT"&&this.tabs!==null?(this.activeTabIdx=Math.max(0,this.activeTabIdx-1),this.resetCursor()):c==="RIGHT"&&this.tabs!==null?(this.activeTabIdx=Math.min(this.tabs.length-1,this.activeTabIdx+1),this.resetCursor()):c==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):c==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):c==="SELECT"?this.activateCurrent():this.handleNavAction(c))}),this.resetCursor(),r.onTap&&r.onTap((c,h)=>{if(this.modal!==null){this.modal.handleTap(c,h);return}if(this.activated)return;const d=this.chrome.hitTestNav(c,h);if(d!==null){this.handleNavTap(d);return}if(this.tabs!==null&&h===W+3){let u=3;for(let f=0;f<this.tabs.length;f++){const w=this.tabs[f].label.length+2;if(c>=u&&c<u+w){this.activeTabIdx=f,this.resetCursor();return}u+=w+1}}const p=this.rowToVisibleItemIndex(h);p!==null&&!this.items[p].disabled&&(this.cursorIdx=p,this.activateCurrent())})}get items(){var n;return this.tabs!==null?((n=this.tabs[this.activeTabIdx])==null?void 0:n.items)??[]:this._staticItems}moveCursor(n){const t=this.items,i=t.length;if(i===0)return;const r=this.cursorIdx===-1?n>0?i-1:0:this.cursorIdx;for(let o=0;o<i;o++){const a=((r+n*(o+1))%i+i)%i;if(!t[a].disabled){this.cursorIdx=a;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const n=this.items[this.cursorIdx];n.disabled||(this.activated=!0,n.action())}rowToVisibleItemIndex(n){var r;let t=this.itemStartRow;const i=this.items;for(let o=0;o<i.length;o++){const a=1+(((r=i[o].details)==null?void 0:r.length)??0);if(n>=t&&n<t+a)return o;t+=a}return null}resetCursor(){const n=this.items;for(let t=0;t<n.length;t++)if(!n[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(n){}handleNavTap(n){}openModal(n){this.modal=n}closeModal(){this.modal=null}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:this.navOptions}}update(n){}render(n){var D;const t=n.length,i=t>0?n[0].length:0;for(let v=0;v<t;v++)for(let g=0;g<i;g++)n[v][g]={char:" ",fg:"black",bg:"black"};const r=this.buildChromeConfig();this.chrome.render(n,r),y(n,W,2,this.title,"bright-white","black"),y(n,W+1,2,"'".repeat(this.title.length),"bright-black","black");for(let v=0;v<this.infoLines.length;v++)y(n,W+2+v,2,this.infoLines[v],"bright-black","black");if(this.tabs!==null){const v=W+3;let g=2;n[v][g]={char:"|",fg:"bright-black",bg:"black"},g++;for(let I=0;I<this.tabs.length;I++){const L=I===this.activeTabIdx,m=` ${this.tabs[I].label} `,A=L?"black":"white",E=L?"green":"black";for(const F of m)g<i&&(n[v][g]={char:F,fg:A,bg:E}),g++;g<i&&(n[v][g]={char:"|",fg:"bright-black",bg:"black"}),g++}}const a=Un(t,r.showFooter)-1,s=a-this.itemStartRow,l=this.items,c=l.map(v=>{var g;return 1+(((g=v.details)==null?void 0:g.length)??0)}),d=c.reduce((v,g)=>v+g,0)>s,p=d?s-1:s,u=[];let f=[],w=0;for(let v=0;v<c.length;v++)w+c[v]>p?(f.length>0&&u.push(f),f=[v],w=c[v]):(f.push(v),w+=c[v]);f.length>0&&u.push(f),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const _=u[this.pageIndex]??[];let k=this.itemStartRow;for(const v of _){const g=l[v],I=v===this.cursorIdx,L=g.disabled?"bright-black":I?"bright-green":"white",m=g.infoFg??L,A=i-4;if(g.icon!==void 0){const E=g.icon.length;if(y(n,k,2,I?">":" ",L,"black"),y(n,k,3,g.icon,g.iconFg??L,"black"),g.info!==void 0){const me=Math.max(1,A-1-E-g.label.length-2-g.info.length);y(n,k,3+E,g.label+" ",L,"black"),y(n,k,3+E+g.label.length+1,".".repeat(me),"bright-black","black"),y(n,k,3+E+g.label.length+1+me+1,g.info,m,"black")}else y(n,k,3+E,g.label.slice(0,A-1-E),L,"black")}else if(g.info!==void 0){const E=I?"> ":"  ",F=Math.max(1,A-2-g.label.length-2-g.info.length);y(n,k,2,E+g.label+" ",L,"black"),y(n,k,2+E.length+g.label.length+1,".".repeat(F),"bright-black","black"),y(n,k,2+E.length+g.label.length+1+F+1,g.info,m,"black")}else if(g.details!==void 0&&g.details.length>0){y(n,k,2,((I?"> ":"  ")+g.label).slice(0,A),L,"black");for(let F=0;F<g.details.length;F++)k+1+F<=a&&y(n,k+1+F,2,("  "+g.details[F]).slice(0,A),"bright-black","black")}else y(n,k,2,((I?"> ":"  ")+g.label).slice(0,A),L,"black");k+=1+(((D=g.details)==null?void 0:D.length)??0)}if(d){const v=`${this.pageIndex+1}/${this.lastPageCount}`,g=a;y(n,g,0,"|<|","white","black");const I=Math.floor((i-v.length)/2);y(n,g,I,v,"bright-black","black"),y(n,g,i-3,"|>|","white","black")}this.modal!==null&&this.modal.render(n)}}const qt=30;class He{constructor(n){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=n,this.value=Math.max(n.field.min,Math.min(n.field.max,n.field.initialValue))}handleAction(n){const{field:t}=this.formDef;if(n==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(n==="UP"){this.value=Math.min(t.max,this.value+1);return}if(n==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(n==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(n==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(n==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}n==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(n){if(this.focus!=="field")return;const{field:t}=this.formDef;if(n==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(n>="0"&&n<="9"){const i=parseInt(n,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,i)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+i)}}handleTap(n,t){this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(n){const t=n.length,i=t>0?n[0].length:0,{title:r,field:o,derivedRows:a,confirmLabel:s}=this.formDef,l=a.length,c=8+l,h=qt,d=Math.floor((i-h)/2),p=Math.floor((t-c)/2);for(let x=0;x<c;x++)for(let P=0;P<h;P++){const j=p+x,re=d+P;j>=0&&j<t&&re>=0&&re<i&&(n[j][re]={char:" ",fg:"white",bg:"black"})}const u=(x,P,j)=>{x>=0&&x<t&&P>=0&&P<i&&(n[x][P]={char:j,fg:"white",bg:"black"})};u(p,d,"+"),u(p,d+h-1,"+");for(let x=1;x<h-1;x++)u(p,d+x,"-");u(p+c-1,d,"+"),u(p+c-1,d+h-1,"+");for(let x=1;x<h-1;x++)u(p+c-1,d+x,"-");for(let x=1;x<c-1;x++)u(p+x,d,"|"),u(p+x,d+h-1,"|");const f=h-2,w=p+1,_=d+1+Math.floor((f-r.length)/2);y(n,w,_,r,"bright-white","black"),y(n,p+2,_,"'".repeat(r.length),"bright-black","black");const k=[o.label,...a.map(x=>x.label)],D=Math.max(...k.map(x=>x.length)),v=d+1+D+3,g=p+4,I=this.focus==="field";y(n,g,d+1,o.label.padEnd(D)+" : ","white","black");const L=this.value.toString().padStart(5);y(n,g,v,L,I?"black":"white",I?"green":"black");for(let x=0;x<l;x++){const P=a[x],j=p+5+x,re=P.compute(this.value);y(n,j,d+1,P.label.padEnd(D)+" : ","white","black"),y(n,j,v,re,"white","black")}const m=p+4+l+2,A=`[ ${s} ]`,E="[ CANCEL ]",F=3,me=A.length+F+E.length,At=Math.floor((f-me)/2),Oe=d+1+At,Je=Oe+A.length+F;this.confirmRect={col:Oe,row:m,width:A.length},this.cancelRect={col:Je,row:m,width:E.length};const Xe=this.focus==="confirm",Qe=this.focus==="cancel";y(n,m,Oe,A,Xe?"black":"white",Xe?"green":"black"),y(n,m,Je,E,Qe?"black":"white",Qe?"green":"black")}}class zt extends Ie{constructor(n,t,i,r,o,a,s,l){const c=$(r),h=[];c.amenities.trader&&h.push({label:"TRADER",action:a}),c.amenities.missionBoard&&h.push({label:"MISSION BOARD",action:s});const d=i.fuelCapacityL-i.fuelL,p=Math.floor(i.credits/ae),u=Math.min(d,p);let f=null;if(c.amenities.fuel&&u>0){const v=u*ae;f=h.length,h.push({label:`BUY FUEL  +${u}L  ${v}CR`,action:()=>{}})}const w=Nn(c.description,36).slice(0,3),_=`DANGER: ${c.dangerLevel.toUpperCase()}`,k=[...w,_],D=c.locationType==="surface"||c.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",h,[{id:"undock",label:D}],n,t,i,k),this.onShip=l,this.onRefuel=o,this.fuelItemIdx=f}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx===-1)return;const t=n[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const i=this.player.fuelCapacityL-this.player.fuelL,r=Math.floor(this.player.credits/ae),o=Math.min(i,r);this.openModal(new He({title:"BUY FUEL",field:{label:"Litres",initialValue:o,min:0,max:o},derivedRows:[{label:"Cost",compute:a=>`${a*ae} CR`}],confirmLabel:"BUY",onConfirm:a=>{this.closeModal(),a>0&&this.onRefuel(a*ae,a)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class Vt extends Ie{constructor(n,t,i,r,o,a,s,l,c){var u;const d=((u=$(r).npcs.trader)==null?void 0:u.toUpperCase())??"TRADER",p=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(d,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,i,[],p),this.traderStock=o,this.onBuy=a,this.onSell=s,this.onHub=l,this.onUndock=c,this.syncItems(),this.clampCursor()}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(n=>{const t=Z(n.commodityId);if(!t)return[];const i=this.player.credits>=t.basePrice;return[{label:`${t.name} (x${n.qty})`,info:`${t.basePrice} CR`,disabled:!i,action:()=>{const r=Math.floor(this.player.credits/t.basePrice),o=Math.min(n.qty,r);this.openModal(new He({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:o,min:0,max:o},derivedRows:[{label:"Total",compute:a=>`${a*t.basePrice} CR`}],confirmLabel:"BUY",onConfirm:a=>{a>0&&this.onBuy(n.commodityId,a),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const n=this.player.cargoHold;return n.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...n].flatMap(t=>{const i=Z(t.commodityId);return i?[{label:`${i.name} (x${t.qty})`,info:`${i.basePrice} CR`,action:()=>{this.openModal(new He({title:i.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:r=>`${r*i.basePrice} CR`}],confirmLabel:"SELL",onConfirm:r=>{r>0&&this.onSell(t.commodityId,r),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]:[]})}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const n=this.items;(this.cursorIdx<0||this.cursorIdx>=n.length||(t=n[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=n.findIndex(i=>!i.disabled))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(n){this.syncItems(),super.render(n);const t=n.length,i=`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,r=Un(t,!0)-2;y(n,r,2,i,"bright-black","black")}}const Jt=[{id:"M001",type:"rescue",title:"Find the Lost Crew",reward:500},{id:"M002",type:"delivery",title:"Deliver Fuel Core",reward:300},{id:"M003",type:"combat",title:"Clear Pirate Outpost",reward:750},{id:"M004",type:"salvage",title:"Salvage Station Debris",reward:400},{id:"M005",type:"rescue",title:"Rescue Stranded Vessel",reward:600},{id:"M006",type:"delivery",title:"Transport Supplies",reward:250},{id:"M007",type:"combat",title:"Eliminate Smugglers",reward:800}],Xt={rescue:"[R] ",delivery:"[D] ",combat:"[C] ",salvage:"[S] "};class Qt extends Ie{constructor(n,t,i,r,o,a){$(r);const s=Jt.map(l=>({label:l.title,icon:Xt[l.type],iconFg:"bright-yellow",info:`${l.reward} CR`,infoFg:"bright-green",action:()=>console.log(`[MissionBoard] Selected: ${l.title}`)}));super("MISSION BOARD",s,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,i),this.onHub=o,this.onUndock=a}activateCurrent(){if(this.items.length===0)return;const n=this.items[this.cursorIdx];n.disabled||n.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}const Zt=[18,10,5],ei=[".","*","+"],rn=[4e3,2e3,800],ni=[9e3,5e3,2500],ti=[null,"bright-black","white"],ii=["bright-black","white","bright-white"],ri=["white","bright-white","bright-cyan"],ye=3,on=25,be=2,an=37,sn=2*Math.PI;function oi(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class ai{constructor(n=42){this.boundsSet=!1,this.rand=oi(n),this.stars=[];for(let t=0;t<3;t++)for(let i=0;i<Zt[t];i++){const r=be+Math.floor(this.rand()*(an-be+1)),o=ye+Math.floor(this.rand()*(on-ye+1)),a=this.rand()*sn,s=rn[t]+this.rand()*(ni[t]-rn[t]);this.stars.push({col:r,row:o,layer:t,twinklePhase:a,twinklePeriod:s})}}update(n){for(const t of this.stars)t.twinklePhase+=sn/t.twinklePeriod*n}render(n,t,i,r,o){if(!this.boundsSet){this.boundsSet=!0;const a=on-ye,s=an-be;{const l=(i-t)/a,c=(o-r)/s;for(const h of this.stars)h.row=Math.round(t+(h.row-ye)*l),h.col=Math.round(r+(h.col-be)*c)}}for(const a of this.stars){const{row:s,col:l,layer:c}=a;if(s<t||s>i||l<r||l>o)continue;const h=Math.sin(a.twinklePhase);let d;h>=.5?d=ri[c]:h>=-.5?d=ii[c]:d=ti[c],d!==null&&(n[s][l]={char:ei[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const si=2,li=3,ci=2*Math.PI/9e3,di=2*Math.PI/12e3,hi=Math.PI/3;function ln(e,n,t){return Math.max(n,Math.min(t,e))}class ui{constructor(n,t,i,r,o){this.time=0,this.def=n,this.intRowStart=t,this.intRowEnd=i,this.intColStart=r,this.intColEnd=o,this.glyphHeight=n.glyph.rows.length,this.glyphWidth=Math.max(...n.glyph.rows.map(a=>a.length)),this.anchorRow=t+Math.floor((i-t)/2)-Math.floor(this.glyphHeight/2),this.anchorCol=r+Math.floor((o-r)*.6)-Math.floor(this.glyphWidth/2)}update(n){this.time+=n}getDisplayPosition(){const n=Math.round(si*Math.sin(this.time*ci)),t=Math.round(li*Math.sin(this.time*di+hi)),i=ln(this.anchorRow+n,this.intRowStart,this.intRowEnd-this.glyphHeight+1),r=ln(this.anchorCol+t,this.intColStart,this.intColEnd-this.glyphWidth+1);return{row:i,col:r}}render(n){const{row:t,col:i}=this.getDisplayPosition(),r=this.def.glyph.fg;for(let o=0;o<this.def.glyph.rows.length;o++){const a=this.def.glyph.rows[o];for(let s=0;s<a.length;s++){const l=a[s];if(l===" ")continue;const c=t+o,h=i+s;c>=0&&c<n.length&&h>=0&&h<n[c].length&&(n[c][h]={char:l,fg:r,bg:"black"})}}}}const se={BEACON:{name:"BEACON",glyph:{rows:["[*]"," | "],fg:"bright-yellow"}},RELAY:{name:"RELAY",glyph:{rows:[">---<"," |*|","  |"],fg:"bright-yellow"}},RING:{name:"RING",glyph:{rows:["/-\\","|O|","\\-/"],fg:"cyan"}},HUB:{name:"HUB",glyph:{rows:["  *  ","--+--"," [H] ","  |  ","  *  "],fg:"white"}}};function _e(e,n){if(e.length>=n)return e.slice(0,n);const t=n-e.length,i=Math.floor(t/2);return" ".repeat(i)+e+" ".repeat(t-i)}const pi={civilian:se.HUB,military:se.RELAY,research:se.RING,"black-market":se.BEACON};class fi{constructor(n,t,i,r,o,a){if(this.cursorIdx=0,this.activated=!1,this.h=30,this.w=40,this.station=null,this.player=i,this.context=t,this.chrome=new Se(t,i),this.starfield=new ai,this.inSpace=i.destinationId===null,i.destinationId!==null){const l=$(i.destinationId);this.stationType=pi[l.type]??se.RELAY,this.isLandingDest=l.locationType==="surface"||l.locationType==="asteroid"}else this.stationType=null,this.isLandingDest=!1;const s=()=>this.inSpace?1:2;n.onAction(l=>{this.activated||(l==="CARGO"?(this.activated=!0,a()):l==="UP"?this.cursorIdx=(this.cursorIdx-1+s())%s():l==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%s():l==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,r()):this.inSpace||(this.activated=!0,o())))}),n.onTap&&n.onTap((l,c)=>{this.activated||(c===2?l>=this.w/2&&(this.activated=!0,a()):c===this.h-1&&(l<this.w/2?(this.activated=!0,r()):this.inSpace||(this.activated=!0,o())))})}update(n){this.starfield.update(n),this.station&&this.station.update(n)}render(n){const t=n.length,i=t>0?n[0].length:0;this.h=t,this.w=i;for(let m=0;m<t;m++)for(let A=0;A<i;A++)n[m][A]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,{showHeader:!0,showFooter:!1,navOptions:[]});const r=Math.floor(i/2),o=r-3,a=2,s=3,l=4,c=t-3,h=t-2,d=t-1,p=1,u=i-2;this.stationType&&!this.station&&(this.station=new ui(this.stationType,l,c,p,u));const f=m=>({char:m,fg:"bright-black",bg:"black"}),w=_e(`FUEL:${this.player.fuelL}/${this.player.fuelCapacityL}L`,o),_=Math.round(this.player.cargoWeightKg/1e3),k=Math.round(this.player.cargoCapacity/1e3),D=_e(`CARGO: ${_}/${k}Mg`,o);n[a][1]=f("\\");for(let m=0;m<o;m++)n[a][2+m]=f(w[m]);n[a][r-1]=f("/"),n[a][r]=f("\\");for(let m=0;m<o;m++)n[a][r+1+m]=f(D[m]);n[a][r+o+1]=f("/"),n[s][1]=f("/");for(let m=0;m<o;m++)n[s][2+m]=f("¯");for(let m=0;m<o;m++)n[s][r+1+m]=f("¯");n[s][r+o+1]=f("\\");for(let m=l;m<=c;m++)n[m][0]=f("|"),n[m][i-1]=f("|");this.starfield.render(n,l,c,p,u),this.station&&this.station.render(n),y(n,c,p+1,"[C] CARGO","bright-black","black"),n[h][1]=f("\\");for(let m=0;m<o;m++)n[h][2+m]=f("_");for(let m=0;m<o;m++)n[h][r+1+m]=f("_");n[h][r+o+1]=f("/");const v="[T] TRAVEL",g=this.inSpace?"[ - ] DOCK":this.isLandingDest?"[L] LAND":"[D] DOCK";let I=_e(v,o),L=_e(g,o);this.cursorIdx===0?I=">"+I.slice(1):this.inSpace||(L=">"+L.slice(1)),n[d][1]=f("/");for(let m=0;m<o;m++){const A=I[m];n[d][2+m]={char:A,fg:A===">"?"bright-green":"bright-yellow",bg:"black"}}n[d][r-1]=f("\\"),n[d][r]=f("/");for(let m=0;m<o;m++){const A=L[m];n[d][r+1+m]={char:A,fg:A===">"?"bright-green":this.inSpace?"bright-black":"bright-yellow",bg:"black"}}n[d][r+o+1]=f("\\")}}const De="CARGO HOLD";class mi{constructor(n,t,i,r){this.activated=!1,this.player=i,n.onAction(o=>{this.activated||(o==="BACK"||o==="CARGO")&&(this.activated=!0,r())})}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let h=0;h<t;h++)for(let d=0;d<i;d++)n[h][d]={char:" ",fg:"black",bg:"black"};C(n,1,De,"bright-white","black");const r=Math.max(0,Math.floor((i-De.length)/2));y(n,2,r,"'".repeat(De.length),"bright-black","black");const o=this.player.cargoHold,a=this.player.cargoCapacity,s=this.player.cargoWeightKg;if(o.length===0)C(n,Math.floor(t/2),"CARGO HOLD EMPTY","bright-black","black");else{let h=4;for(const p of o){if(h>=t-3)break;const u=Z(p.commodityId);if(!u)continue;const f=p.qty*u.weightKg,w=`  x${p.qty}  ${u.basePrice}CR  ${f}KG`,_=Math.max(6,i-4-w.length),k=u.name,v=`${k.length>_?k.slice(0,_):k}${w}`;y(n,h,2,v,"white","black"),h++}const d=t-4;d>3&&y(n,d,2,"-".repeat(i-4),"bright-black","black")}const l=t-3,c=`TOTAL: ${s}/${a}KG`;y(n,l,2,c,"bright-black","black"),y(n,t-1,2,"[ESC] BACK","bright-black","black")}}class cn extends Ie{constructor(n,t,i,r,o,a,s){const l=xe(i.systemId),c=Dn(i.driveId),h=[...l.destinations.map(u=>({label:$(u).name.toUpperCase(),disabled:u===i.destinationId,action:()=>r(u)})),{label:"FLY INTO SPACE",disabled:i.destinationId===null,action:a}],d=Ut(i.systemId).map(u=>{const f=u.from===i.systemId?u.to:u.from,w=xe(f),_=u.stability.toUpperCase(),k=Math.ceil(Hn*u.distance*c.fuelEfficiency);return{label:`${w.name.toUpperCase()}  ${u.distance}LY  [${_}]`.slice(0,36),disabled:k>i.fuelL,action:()=>o(f)}}),p=[{label:"DESTINATIONS",items:h},{label:"JUMPS",items:d}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],n,t,i,[],p),this.onShip=s}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}class te{constructor(n,t,i,r){this.elapsed=0,this.arrived=!1,this.player=n,this.chrome=new Se(t,n),this.duration=i,this.onComplete=r}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}render(n){const t=n.length,i=t>0?n[0].length:0;for(let r=0;r<t;r++)for(let o=0;o<i;o++)n[r][o]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,this.getChromeConfig()),this.renderContent(n)}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const gi=["[. . .]","[: : :]","[* * *]"],dn=5e3;class yi extends te{constructor(n,t,i){super(n,t,dn,i)}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/500)%3,o=Math.ceil((dn-this.elapsed)/1e3),a=Math.max(1,Math.min(5,o)),s=xe(this.player.systemId),l=s?s.name.toUpperCase():this.player.systemId.toUpperCase();C(n,i-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),C(n,i-1,"DESTINATION:","bright-black","black"),C(n,i,l,"bright-white","black"),C(n,i+2,gi[r],"bright-black","black"),C(n,i+4,`ARRIVING IN ${a}S`,"bright-black","black")}}const hn=2e3,bi=["[ —   ]","[  —  ]","[   — ]"];class un extends te{constructor(n,t,i,r){super(n,t,hn,i),this.targetLabel=r}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((hn-this.elapsed)/1e3),a=Math.max(1,Math.min(2,o)),s=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const l=this.player.destinationId?$(this.player.destinationId):null;return l?l.name.toUpperCase():"UNKNOWN"})();C(n,i-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),C(n,i-1,"HEADING TO:","bright-black","black"),C(n,i,s,"bright-white","black"),C(n,i+2,bi[r],"bright-black","black"),C(n,i+4,`ARRIVING IN ${a}S`,"bright-black","black")}}const pn=2500,_i=["v","vv","vvv"];class vi extends te{constructor(n,t,i){super(n,t,pn,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/400)%3,o=Math.ceil((pn-this.elapsed)/1e3),a=Math.max(1,Math.min(3,o));C(n,i-3,"[ LANDING SEQUENCE ]","bright-green","black"),C(n,i+2,_i[r],"bright-black","black"),C(n,i+4,`TOUCHDOWN IN ${a}S`,"bright-black","black")}}const fn=2500,wi=[">",">>",">>>"];class xi extends te{constructor(n,t,i){super(n,t,fn,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/400)%3,o=Math.ceil((fn-this.elapsed)/1e3),a=Math.max(1,Math.min(3,o));C(n,i-3,"[ APPROACH LOCKED ]","bright-yellow","black"),C(n,i+2,wi[r],"bright-black","black"),C(n,i+4,`CLAMPING IN ${a}S`,"bright-black","black")}}const mn=1500,ki=["^","^^","^^^"];class Ci extends te{constructor(n,t,i){super(n,t,mn,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((mn-this.elapsed)/1e3),a=Math.max(1,Math.min(2,o));C(n,i-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),C(n,i+2,ki[r],"bright-black","black"),C(n,i+4,`CLEAR IN ${a}S`,"bright-black","black")}}const gn=1500,Ai=["<","<<","<<<"];class Ti extends te{constructor(n,t,i){super(n,t,gn,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((gn-this.elapsed)/1e3),a=Math.max(1,Math.min(2,o));C(n,i-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),C(n,i+2,Ai[r],"bright-black","black"),C(n,i+4,`DEPARTING IN ${a}S`,"bright-black","black")}}class Si{constructor(n){const t=Pn(n.shipId);if(!t)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[]}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,t){const i=this._cargoHold.find(r=>r.commodityId===n);i?i.qty+=t:this._cargoHold.push({commodityId:n,qty:t})}removeCargo(n,t){const i=this._cargoHold.findIndex(r=>r.commodityId===n);i<0||(t!==void 0&&t<this._cargoHold[i].qty?this._cargoHold[i].qty-=t:this._cargoHold.splice(i,1))}get cargoWeightKg(){return Gt(this._cargoHold)}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}}const Ii=100,Ei=2*60*1e3;class Mi{constructor(n,t,i){this.traderStockCache=new Map,this.renderer=n,this.input=t,this.context=i;const r=Bt(),o=Pn(r.startingShip);this.player=new Si({shipId:r.startingShip,driveId:o.defaultJumpDrive,credits:r.player.startingCredits,systemId:r.startingLocation.system,destinationId:r.startingLocation.destination}),this.currentScene=new nn(this.input,this.context,this.player,()=>this.goToStory())}tick(n){const t=Math.min(n,Ii),i=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(i),this.renderer.drawBuffer(i)}makeBuffer(){const n=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:n},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(n){const t=Date.now(),i=this.traderStockCache.get(n);if(i&&t-i.generatedAt<Ei)return i.entries;const r=jt(),o=4+Math.floor(Math.random()*3),a=[...r];for(let l=a.length-1;l>0;l--){const c=Math.floor(Math.random()*(l+1));[a[l],a[c]]=[a[c],a[l]]}const s=a.slice(0,o).map(l=>({commodityId:l.id,qty:1+Math.floor(Math.random()*8)}));return this.traderStockCache.set(n,{entries:s,generatedAt:t}),s}onBuy(n,t,i){if(t<=0)return;const r=i.findIndex(c=>c.commodityId===n);if(r<0)return;const o=i[r];if(t>o.qty)return;const a=Z(n);if(!a)return;const s=t*a.basePrice;this.player.credits<s||this.player.cargoWeightKg+t*a.weightKg>this.player.cargoCapacity||(this.player.spendCredits(s),this.player.addCargo(n,t),o.qty-=t,o.qty<=0&&i.splice(r,1))}onSell(n,t,i){if(t<=0)return;const r=this.player.cargoHold.find(l=>l.commodityId===n);if(!r||r.qty<t)return;const o=Z(n);if(!o)return;const a=t*o.basePrice;this.player.addCredits(a),this.player.removeCargo(n,t);const s=i.find(l=>l.commodityId===n);s?s.qty+=t:i.push({commodityId:n,qty:t})}goToMainMenu(){this.currentScene=new nn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new Kt(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new zt(this.input,this.context,this.player,this.player.destinationId,(n,t)=>{this.player.spendCredits(n),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToTakeOffOrUndock())}goToLandOrDock(){var t;const n=(t=$(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new vi(this.player,this.context,()=>this.goToStation()):n==="asteroid"?this.currentScene=new xi(this.player,this.context,()=>this.goToStation()):this.goToStation()}goToTakeOffOrUndock(){var t;const n=(t=$(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new Ci(this.player,this.context,()=>this.goToShip()):n==="asteroid"?this.currentScene=new Ti(this.player,this.context,()=>this.goToShip()):this.goToShip()}goToTrader(){const n=this.player.destinationId,t=this.getOrCreateTraderStock(n);this.currentScene=new Vt(this.input,this.context,this.player,n,t,(i,r)=>this.onBuy(i,r,t),(i,r)=>this.onSell(i,r,t),()=>this.goToStation(),()=>this.goToShip())}goToMissionBoard(){this.currentScene=new Qt(this.input,this.context,this.player,this.player.destinationId,()=>this.goToStation(),()=>this.goToShip())}goToShip(){this.currentScene=new fi(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo())}goToCargo(){this.currentScene=new mi(this.input,this.context,this.player,()=>this.goToShip())}goToTravelMenu(){this.currentScene=new cn(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip())}goToArrival(){this.currentScene=new cn(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip())}goToFlyIntoSpace(){this.player.undock(),this.currentScene=new un(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(n){this.player.dock(n),this.currentScene=new un(this.player,this.context,()=>this.goToShip())}onJumpSelected(n){const t=$t(this.player.systemId,n),i=Dn(this.player.driveId),r=Math.ceil(Hn*t.distance*i.fuelEfficiency);this.player.consumeFuel(r),this.player.jumpTo(n),this.currentScene=new yi(this.player,this.context,()=>this.goToArrival())}}const Li=`---
commodities:
  # Raw Materials — found near mining / frontier systems
  - id: iron-ore
    name: Iron Ore
    base_price: 80
    category: raw-material
    legal: true
    weight_kg: 10
    description: Unrefined iron extracted from asteroid fields and planetary crust.

  - id: rare-earth
    name: Rare Earth Elements
    base_price: 400
    category: raw-material
    legal: true
    weight_kg: 5
    description: High-value minerals essential for electronics and drive components.

  - id: deuterium
    name: Deuterium Crystals
    base_price: 200
    category: raw-material
    legal: true
    weight_kg: 3
    description: Refined hydrogen isotope used in jump drive fuel production.

  # Manufactured Goods — found near industrial / trade systems
  - id: refined-metals
    name: Refined Metals
    base_price: 220
    category: manufactured
    legal: true
    weight_kg: 8
    description: Processed alloys ready for ship construction and infrastructure work.

  - id: ship-components
    name: Ship Components
    base_price: 650
    category: manufactured
    legal: true
    weight_kg: 15
    description: Drive housings, hull panels, sensor arrays — standard replacement parts.

  - id: electronics
    name: Consumer Electronics
    base_price: 500
    category: manufactured
    legal: true
    weight_kg: 2
    description: Commercial-grade devices popular across populated stations.

  # Consumables — available at most stations
  - id: rations
    name: Ration Packs
    base_price: 60
    category: consumable
    legal: true
    weight_kg: 1
    description: Bulk-packaged food supplies for crew and colony populations.

  - id: medical-supplies
    name: Medical Supplies
    base_price: 350
    category: consumable
    legal: true
    weight_kg: 2
    description: Pharmaceuticals, surgical kits and diagnostic equipment.

  - id: fuel-cells
    name: Fuel Cells
    base_price: 180
    category: consumable
    legal: true
    weight_kg: 4
    description: Pre-charged energy cells for ship systems and surface equipment.

  # Contraband — found near lawless systems; illegal in Core Space
  - id: combat-stims
    name: Combat Stimulants
    base_price: 900
    category: contraband
    legal: false
    weight_kg: 1
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
    weight_kg: 3
    description: Unlicensed ship modifications — transponder masks, reactor overrides.
---

# Commodities

The interstellar economy runs on the movement of goods between systems
that produce them and stations that need them.

Prices listed are base values — actual trading prices shift with system
supply, demand, and the goods_bias of the local station. Contraband
commands high prices in core systems but drawing attention to yourself
is a risk all its own.
`,Ri=`---
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
`,Fi=`---
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
`,Oi=`---
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
`,Ni=`---
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
`,Di=`---
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
`,Pi=`---
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
`,Ui=`---
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
`,Hi=`---
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
`,Bi=`---
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
`,$i=`---
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
`,ji=`---
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
`,Gi=`---
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
`,Yi=`---
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
`,Wi=`---
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
`,Ki=`---
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
`,qi=`---
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
`,zi=`---
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
`,Vi=`---
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
`,Ji=`---
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
`,Xi=`---
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
`,Qi=`---
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
`,Zi=`---
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
`,er=`---
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
`,nr=`---
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
`,tr=`---
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
`,ir=`---
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
`,rr=`---
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
`,or=`---
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
`,ar=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,sr=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,lr=`---
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
---

# Jump Routes

Established navigation corridors recognised by civilian navigation systems.
All routes are bidirectional. Distances are in light years.

Route data lives entirely in the front matter above — the docs renderer and
game engine read from there. Add new routes as front matter entries only;
do not duplicate them here as tables or diagrams.

Only systems with a doc in \`docs/world/systems/\` may be referenced. No orphan
route entries.
`,cr=`---
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
`,dr=`---
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

Long range engines for faster than light travel between systems.`,hr=`---
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
`,ur=`---
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
`,pr=`---
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
`,fr=`---
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
`,mr=`---
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
`,gr=`---
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
`,yr=`---
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
`,br=`---
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
`,_r=`---
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
`,vr=`---
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
`,wr=`---
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
`,xr=`---
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
`,kr=`---
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
`,Cr=`---
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
`,Ar=`---
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
`,Tr=`---
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
`;var T={},de={},N={};function Bn(e){return typeof e>"u"||e===null}function Sr(e){return typeof e=="object"&&e!==null}function Ir(e){return Array.isArray(e)?e:Bn(e)?[]:[e]}function Er(e,n){var t,i,r,o;if(n)for(o=Object.keys(n),t=0,i=o.length;t<i;t+=1)r=o[t],e[r]=n[r];return e}function Mr(e,n){var t="",i;for(i=0;i<n;i+=1)t+=e;return t}function Lr(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}N.isNothing=Bn;N.isObject=Sr;N.toArray=Ir;N.repeat=Mr;N.isNegativeZero=Lr;N.extend=Er;function le(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}le.prototype=Object.create(Error.prototype);le.prototype.constructor=le;le.prototype.toString=function(n){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!n&&this.mark&&(t+=" "+this.mark.toString()),t};var he=le,yn=N;function Ge(e,n,t,i,r){this.name=e,this.buffer=n,this.position=t,this.line=i,this.column=r}Ge.prototype.getSnippet=function(n,t){var i,r,o,a,s;if(!this.buffer)return null;for(n=n||4,t=t||75,i="",r=this.position;r>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(r-1))===-1;)if(r-=1,this.position-r>t/2-1){i=" ... ",r+=5;break}for(o="",a=this.position;a<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(a))===-1;)if(a+=1,a-this.position>t/2-1){o=" ... ",a-=5;break}return s=this.buffer.slice(r,a),yn.repeat(" ",n)+i+s+o+`
`+yn.repeat(" ",n+this.position-r+i.length)+"^"};Ge.prototype.toString=function(n){var t,i="";return this.name&&(i+='in "'+this.name+'" '),i+="at line "+(this.line+1)+", column "+(this.column+1),n||(t=this.getSnippet(),t&&(i+=`:
`+t)),i};var Rr=Ge,bn=he,Fr=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],Or=["scalar","sequence","mapping"];function Nr(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(i){n[String(i)]=t})}),n}function Dr(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(Fr.indexOf(t)===-1)throw new bn('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=Nr(n.styleAliases||null),Or.indexOf(this.kind)===-1)throw new bn('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var M=Dr,_n=N,ve=he,Pr=M;function Be(e,n,t){var i=[];return e.include.forEach(function(r){t=Be(r,n,t)}),e[n].forEach(function(r){t.forEach(function(o,a){o.tag===r.tag&&o.kind===r.kind&&i.push(a)}),t.push(r)}),t.filter(function(r,o){return i.indexOf(o)===-1})}function Ur(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,t;function i(r){e[r.kind][r.tag]=e.fallback[r.tag]=r}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(i);return e}function J(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new ve("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=Be(this,"implicit",[]),this.compiledExplicit=Be(this,"explicit",[]),this.compiledTypeMap=Ur(this.compiledImplicit,this.compiledExplicit)}J.DEFAULT=null;J.create=function(){var n,t;switch(arguments.length){case 1:n=J.DEFAULT,t=arguments[0];break;case 2:n=arguments[0],t=arguments[1];break;default:throw new ve("Wrong number of arguments for Schema.create function")}if(n=_n.toArray(n),t=_n.toArray(t),!n.every(function(i){return i instanceof J}))throw new ve("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(i){return i instanceof Pr}))throw new ve("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new J({include:n,explicit:t})};var ie=J,Hr=M,Br=new Hr("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),$r=M,jr=new $r("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Gr=M,Yr=new Gr("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Wr=ie,Ye=new Wr({explicit:[Br,jr,Yr]}),Kr=M;function qr(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function zr(){return null}function Vr(e){return e===null}var Jr=new Kr("tag:yaml.org,2002:null",{kind:"scalar",resolve:qr,construct:zr,predicate:Vr,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Xr=M;function Qr(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function Zr(e){return e==="true"||e==="True"||e==="TRUE"}function eo(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var no=new Xr("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Qr,construct:Zr,predicate:eo,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),to=N,io=M;function ro(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function oo(e){return 48<=e&&e<=55}function ao(e){return 48<=e&&e<=57}function so(e){if(e===null)return!1;var n=e.length,t=0,i=!1,r;if(!n)return!1;if(r=e[t],(r==="-"||r==="+")&&(r=e[++t]),r==="0"){if(t+1===n)return!0;if(r=e[++t],r==="b"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(r!=="0"&&r!=="1")return!1;i=!0}return i&&r!=="_"}if(r==="x"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(!ro(e.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}for(;t<n;t++)if(r=e[t],r!=="_"){if(!oo(e.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}if(r==="_")return!1;for(;t<n;t++)if(r=e[t],r!=="_"){if(r===":")break;if(!ao(e.charCodeAt(t)))return!1;i=!0}return!i||r==="_"?!1:r!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function lo(e){var n=e,t=1,i,r,o=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),i=n[0],(i==="-"||i==="+")&&(i==="-"&&(t=-1),n=n.slice(1),i=n[0]),n==="0"?0:i==="0"?n[1]==="b"?t*parseInt(n.slice(2),2):n[1]==="x"?t*parseInt(n,16):t*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(a){o.unshift(parseInt(a,10))}),n=0,r=1,o.forEach(function(a){n+=a*r,r*=60}),t*n):t*parseInt(n,10)}function co(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!to.isNegativeZero(e)}var ho=new io("tag:yaml.org,2002:int",{kind:"scalar",resolve:so,construct:lo,predicate:co,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),$n=N,uo=M,po=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function fo(e){return!(e===null||!po.test(e)||e[e.length-1]==="_")}function mo(e){var n,t,i,r;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,r=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(o){r.unshift(parseFloat(o,10))}),n=0,i=1,r.forEach(function(o){n+=o*i,i*=60}),t*n):t*parseFloat(n,10)}var go=/^[-+]?[0-9]+e/;function yo(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if($n.isNegativeZero(e))return"-0.0";return t=e.toString(10),go.test(t)?t.replace("e",".e"):t}function bo(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||$n.isNegativeZero(e))}var _o=new uo("tag:yaml.org,2002:float",{kind:"scalar",resolve:fo,construct:mo,predicate:bo,represent:yo,defaultStyle:"lowercase"}),vo=ie,jn=new vo({include:[Ye],implicit:[Jr,no,ho,_o]}),wo=ie,Gn=new wo({include:[jn]}),xo=M,Yn=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Wn=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function ko(e){return e===null?!1:Yn.exec(e)!==null||Wn.exec(e)!==null}function Co(e){var n,t,i,r,o,a,s,l=0,c=null,h,d,p;if(n=Yn.exec(e),n===null&&(n=Wn.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],i=+n[2]-1,r=+n[3],!n[4])return new Date(Date.UTC(t,i,r));if(o=+n[4],a=+n[5],s=+n[6],n[7]){for(l=n[7].slice(0,3);l.length<3;)l+="0";l=+l}return n[9]&&(h=+n[10],d=+(n[11]||0),c=(h*60+d)*6e4,n[9]==="-"&&(c=-c)),p=new Date(Date.UTC(t,i,r,o,a,s,l)),c&&p.setTime(p.getTime()-c),p}function Ao(e){return e.toISOString()}var To=new xo("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:ko,construct:Co,instanceOf:Date,represent:Ao}),So=M;function Io(e){return e==="<<"||e===null}var Eo=new So("tag:yaml.org,2002:merge",{kind:"scalar",resolve:Io});function Kn(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var K;try{var Mo=Kn;K=Mo("buffer").Buffer}catch{}var Lo=M,We=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Ro(e){if(e===null)return!1;var n,t,i=0,r=e.length,o=We;for(t=0;t<r;t++)if(n=o.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;i+=6}return i%8===0}function Fo(e){var n,t,i=e.replace(/[\r\n=]/g,""),r=i.length,o=We,a=0,s=[];for(n=0;n<r;n++)n%4===0&&n&&(s.push(a>>16&255),s.push(a>>8&255),s.push(a&255)),a=a<<6|o.indexOf(i.charAt(n));return t=r%4*6,t===0?(s.push(a>>16&255),s.push(a>>8&255),s.push(a&255)):t===18?(s.push(a>>10&255),s.push(a>>2&255)):t===12&&s.push(a>>4&255),K?K.from?K.from(s):new K(s):s}function Oo(e){var n="",t=0,i,r,o=e.length,a=We;for(i=0;i<o;i++)i%3===0&&i&&(n+=a[t>>18&63],n+=a[t>>12&63],n+=a[t>>6&63],n+=a[t&63]),t=(t<<8)+e[i];return r=o%3,r===0?(n+=a[t>>18&63],n+=a[t>>12&63],n+=a[t>>6&63],n+=a[t&63]):r===2?(n+=a[t>>10&63],n+=a[t>>4&63],n+=a[t<<2&63],n+=a[64]):r===1&&(n+=a[t>>2&63],n+=a[t<<4&63],n+=a[64],n+=a[64]),n}function No(e){return K&&K.isBuffer(e)}var Do=new Lo("tag:yaml.org,2002:binary",{kind:"scalar",resolve:Ro,construct:Fo,predicate:No,represent:Oo}),Po=M,Uo=Object.prototype.hasOwnProperty,Ho=Object.prototype.toString;function Bo(e){if(e===null)return!0;var n=[],t,i,r,o,a,s=e;for(t=0,i=s.length;t<i;t+=1){if(r=s[t],a=!1,Ho.call(r)!=="[object Object]")return!1;for(o in r)if(Uo.call(r,o))if(!a)a=!0;else return!1;if(!a)return!1;if(n.indexOf(o)===-1)n.push(o);else return!1}return!0}function $o(e){return e!==null?e:[]}var jo=new Po("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Bo,construct:$o}),Go=M,Yo=Object.prototype.toString;function Wo(e){if(e===null)return!0;var n,t,i,r,o,a=e;for(o=new Array(a.length),n=0,t=a.length;n<t;n+=1){if(i=a[n],Yo.call(i)!=="[object Object]"||(r=Object.keys(i),r.length!==1))return!1;o[n]=[r[0],i[r[0]]]}return!0}function Ko(e){if(e===null)return[];var n,t,i,r,o,a=e;for(o=new Array(a.length),n=0,t=a.length;n<t;n+=1)i=a[n],r=Object.keys(i),o[n]=[r[0],i[r[0]]];return o}var qo=new Go("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Wo,construct:Ko}),zo=M,Vo=Object.prototype.hasOwnProperty;function Jo(e){if(e===null)return!0;var n,t=e;for(n in t)if(Vo.call(t,n)&&t[n]!==null)return!1;return!0}function Xo(e){return e!==null?e:{}}var Qo=new zo("tag:yaml.org,2002:set",{kind:"mapping",resolve:Jo,construct:Xo}),Zo=ie,ue=new Zo({include:[Gn],implicit:[To,Eo],explicit:[Do,jo,qo,Qo]}),ea=M;function na(){return!0}function ta(){}function ia(){return""}function ra(e){return typeof e>"u"}var oa=new ea("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:na,construct:ta,predicate:ra,represent:ia}),aa=M;function sa(e){if(e===null||e.length===0)return!1;var n=e,t=/\/([gim]*)$/.exec(e),i="";return!(n[0]==="/"&&(t&&(i=t[1]),i.length>3||n[n.length-i.length-1]!=="/"))}function la(e){var n=e,t=/\/([gim]*)$/.exec(e),i="";return n[0]==="/"&&(t&&(i=t[1]),n=n.slice(1,n.length-i.length-1)),new RegExp(n,i)}function ca(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function da(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var ha=new aa("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:sa,construct:la,predicate:da,represent:ca}),ke;try{var ua=Kn;ke=ua("esprima")}catch{typeof window<"u"&&(ke=window.esprima)}var pa=M;function fa(e){if(e===null)return!1;try{var n="("+e+")",t=ke.parse(n,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function ma(e){var n="("+e+")",t=ke.parse(n,{range:!0}),i=[],r;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(o){i.push(o.name)}),r=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(i,n.slice(r[0]+1,r[1]-1)):new Function(i,"return "+n.slice(r[0],r[1]))}function ga(e){return e.toString()}function ya(e){return Object.prototype.toString.call(e)==="[object Function]"}var ba=new pa("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:fa,construct:ma,predicate:ya,represent:ga}),vn=ie,Ee=vn.DEFAULT=new vn({include:[ue],explicit:[oa,ha,ba]}),B=N,qn=he,_a=Rr,zn=ue,va=Ee,Y=Object.prototype.hasOwnProperty,Ce=1,Vn=2,Jn=3,Ae=4,Pe=1,wa=2,wn=3,xa=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,ka=/[\x85\u2028\u2029]/,Ca=/[,\[\]\{\}]/,Xn=/^(?:!|!!|![a-z\-]+!)$/i,Qn=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function xn(e){return Object.prototype.toString.call(e)}function U(e){return e===10||e===13}function q(e){return e===9||e===32}function O(e){return e===9||e===32||e===10||e===13}function X(e){return e===44||e===91||e===93||e===123||e===125}function Aa(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function Ta(e){return e===120?2:e===117?4:e===85?8:0}function Sa(e){return 48<=e&&e<=57?e-48:-1}function kn(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function Ia(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function Zn(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var et=new Array(256),nt=new Array(256);for(var V=0;V<256;V++)et[V]=kn(V)?1:0,nt[V]=kn(V);function Ea(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||va,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function tt(e,n){return new qn(n,new _a(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function b(e,n){throw tt(e,n)}function Te(e,n){e.onWarning&&e.onWarning.call(null,tt(e,n))}var Cn={YAML:function(n,t,i){var r,o,a;n.version!==null&&b(n,"duplication of %YAML directive"),i.length!==1&&b(n,"YAML directive accepts exactly one argument"),r=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),r===null&&b(n,"ill-formed argument of the YAML directive"),o=parseInt(r[1],10),a=parseInt(r[2],10),o!==1&&b(n,"unacceptable YAML version of the document"),n.version=i[0],n.checkLineBreaks=a<2,a!==1&&a!==2&&Te(n,"unsupported YAML version of the document")},TAG:function(n,t,i){var r,o;i.length!==2&&b(n,"TAG directive accepts exactly two arguments"),r=i[0],o=i[1],Xn.test(r)||b(n,"ill-formed tag handle (first argument) of the TAG directive"),Y.call(n.tagMap,r)&&b(n,'there is a previously declared suffix for "'+r+'" tag handle'),Qn.test(o)||b(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[r]=o}};function G(e,n,t,i){var r,o,a,s;if(n<t){if(s=e.input.slice(n,t),i)for(r=0,o=s.length;r<o;r+=1)a=s.charCodeAt(r),a===9||32<=a&&a<=1114111||b(e,"expected valid JSON character");else xa.test(s)&&b(e,"the stream contains non-printable characters");e.result+=s}}function An(e,n,t,i){var r,o,a,s;for(B.isObject(t)||b(e,"cannot merge mappings; the provided source object is unacceptable"),r=Object.keys(t),a=0,s=r.length;a<s;a+=1)o=r[a],Y.call(n,o)||(Zn(n,o,t[o]),i[o]=!0)}function Q(e,n,t,i,r,o,a,s){var l,c;if(Array.isArray(r))for(r=Array.prototype.slice.call(r),l=0,c=r.length;l<c;l+=1)Array.isArray(r[l])&&b(e,"nested arrays are not supported inside keys"),typeof r=="object"&&xn(r[l])==="[object Object]"&&(r[l]="[object Object]");if(typeof r=="object"&&xn(r)==="[object Object]"&&(r="[object Object]"),r=String(r),n===null&&(n={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)An(e,n,o[l],t);else An(e,n,o,t);else!e.json&&!Y.call(t,r)&&Y.call(n,r)&&(e.line=a||e.line,e.position=s||e.position,b(e,"duplicated mapping key")),Zn(n,r,o),delete t[r];return n}function Ke(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):b(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function S(e,n,t){for(var i=0,r=e.input.charCodeAt(e.position);r!==0;){for(;q(r);)r=e.input.charCodeAt(++e.position);if(n&&r===35)do r=e.input.charCodeAt(++e.position);while(r!==10&&r!==13&&r!==0);if(U(r))for(Ke(e),r=e.input.charCodeAt(e.position),i++,e.lineIndent=0;r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position);else break}return t!==-1&&i!==0&&e.lineIndent<t&&Te(e,"deficient indentation"),i}function Me(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||O(t)))}function qe(e,n){n===1?e.result+=" ":n>1&&(e.result+=B.repeat(`
`,n-1))}function Ma(e,n,t){var i,r,o,a,s,l,c,h,d=e.kind,p=e.result,u;if(u=e.input.charCodeAt(e.position),O(u)||X(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(r=e.input.charCodeAt(e.position+1),O(r)||t&&X(r)))return!1;for(e.kind="scalar",e.result="",o=a=e.position,s=!1;u!==0;){if(u===58){if(r=e.input.charCodeAt(e.position+1),O(r)||t&&X(r))break}else if(u===35){if(i=e.input.charCodeAt(e.position-1),O(i))break}else{if(e.position===e.lineStart&&Me(e)||t&&X(u))break;if(U(u))if(l=e.line,c=e.lineStart,h=e.lineIndent,S(e,!1,-1),e.lineIndent>=n){s=!0,u=e.input.charCodeAt(e.position);continue}else{e.position=a,e.line=l,e.lineStart=c,e.lineIndent=h;break}}s&&(G(e,o,a,!1),qe(e,e.line-l),o=a=e.position,s=!1),q(u)||(a=e.position+1),u=e.input.charCodeAt(++e.position)}return G(e,o,a,!1),e.result?!0:(e.kind=d,e.result=p,!1)}function La(e,n){var t,i,r;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,i=r=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(G(e,i,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)i=e.position,e.position++,r=e.position;else return!0;else U(t)?(G(e,i,r,!0),qe(e,S(e,!1,n)),i=r=e.position):e.position===e.lineStart&&Me(e)?b(e,"unexpected end of the document within a single quoted scalar"):(e.position++,r=e.position);b(e,"unexpected end of the stream within a single quoted scalar")}function Ra(e,n){var t,i,r,o,a,s;if(s=e.input.charCodeAt(e.position),s!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=i=e.position;(s=e.input.charCodeAt(e.position))!==0;){if(s===34)return G(e,t,e.position,!0),e.position++,!0;if(s===92){if(G(e,t,e.position,!0),s=e.input.charCodeAt(++e.position),U(s))S(e,!1,n);else if(s<256&&et[s])e.result+=nt[s],e.position++;else if((a=Ta(s))>0){for(r=a,o=0;r>0;r--)s=e.input.charCodeAt(++e.position),(a=Aa(s))>=0?o=(o<<4)+a:b(e,"expected hexadecimal character");e.result+=Ia(o),e.position++}else b(e,"unknown escape sequence");t=i=e.position}else U(s)?(G(e,t,i,!0),qe(e,S(e,!1,n)),t=i=e.position):e.position===e.lineStart&&Me(e)?b(e,"unexpected end of the document within a double quoted scalar"):(e.position++,i=e.position)}b(e,"unexpected end of the stream within a double quoted scalar")}function Fa(e,n){var t=!0,i,r=e.tag,o,a=e.anchor,s,l,c,h,d,p={},u,f,w,_;if(_=e.input.charCodeAt(e.position),_===91)l=93,d=!1,o=[];else if(_===123)l=125,d=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),_=e.input.charCodeAt(++e.position);_!==0;){if(S(e,!0,n),_=e.input.charCodeAt(e.position),_===l)return e.position++,e.tag=r,e.anchor=a,e.kind=d?"mapping":"sequence",e.result=o,!0;t||b(e,"missed comma between flow collection entries"),f=u=w=null,c=h=!1,_===63&&(s=e.input.charCodeAt(e.position+1),O(s)&&(c=h=!0,e.position++,S(e,!0,n))),i=e.line,ee(e,n,Ce,!1,!0),f=e.tag,u=e.result,S(e,!0,n),_=e.input.charCodeAt(e.position),(h||e.line===i)&&_===58&&(c=!0,_=e.input.charCodeAt(++e.position),S(e,!0,n),ee(e,n,Ce,!1,!0),w=e.result),d?Q(e,o,p,f,u,w):c?o.push(Q(e,null,p,f,u,w)):o.push(u),S(e,!0,n),_=e.input.charCodeAt(e.position),_===44?(t=!0,_=e.input.charCodeAt(++e.position)):t=!1}b(e,"unexpected end of the stream within a flow collection")}function Oa(e,n){var t,i,r=Pe,o=!1,a=!1,s=n,l=0,c=!1,h,d;if(d=e.input.charCodeAt(e.position),d===124)i=!1;else if(d===62)i=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)Pe===r?r=d===43?wn:wa:b(e,"repeat of a chomping mode identifier");else if((h=Sa(d))>=0)h===0?b(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):a?b(e,"repeat of an indentation width identifier"):(s=n+h-1,a=!0);else break;if(q(d)){do d=e.input.charCodeAt(++e.position);while(q(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!U(d)&&d!==0)}for(;d!==0;){for(Ke(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!a||e.lineIndent<s)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!a&&e.lineIndent>s&&(s=e.lineIndent),U(d)){l++;continue}if(e.lineIndent<s){r===wn?e.result+=B.repeat(`
`,o?1+l:l):r===Pe&&o&&(e.result+=`
`);break}for(i?q(d)?(c=!0,e.result+=B.repeat(`
`,o?1+l:l)):c?(c=!1,e.result+=B.repeat(`
`,l+1)):l===0?o&&(e.result+=" "):e.result+=B.repeat(`
`,l):e.result+=B.repeat(`
`,o?1+l:l),o=!0,a=!0,l=0,t=e.position;!U(d)&&d!==0;)d=e.input.charCodeAt(++e.position);G(e,t,e.position,!1)}return!0}function Tn(e,n){var t,i=e.tag,r=e.anchor,o=[],a,s=!1,l;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),l=e.input.charCodeAt(e.position);l!==0&&!(l!==45||(a=e.input.charCodeAt(e.position+1),!O(a)));){if(s=!0,e.position++,S(e,!0,-1)&&e.lineIndent<=n){o.push(null),l=e.input.charCodeAt(e.position);continue}if(t=e.line,ee(e,n,Jn,!1,!0),o.push(e.result),S(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&l!==0)b(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return s?(e.tag=i,e.anchor=r,e.kind="sequence",e.result=o,!0):!1}function Na(e,n,t){var i,r,o,a,s=e.tag,l=e.anchor,c={},h={},d=null,p=null,u=null,f=!1,w=!1,_;for(e.anchor!==null&&(e.anchorMap[e.anchor]=c),_=e.input.charCodeAt(e.position);_!==0;){if(i=e.input.charCodeAt(e.position+1),o=e.line,a=e.position,(_===63||_===58)&&O(i))_===63?(f&&(Q(e,c,h,d,p,null),d=p=u=null),w=!0,f=!0,r=!0):f?(f=!1,r=!0):b(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,_=i;else if(ee(e,t,Vn,!1,!0))if(e.line===o){for(_=e.input.charCodeAt(e.position);q(_);)_=e.input.charCodeAt(++e.position);if(_===58)_=e.input.charCodeAt(++e.position),O(_)||b(e,"a whitespace character is expected after the key-value separator within a block mapping"),f&&(Q(e,c,h,d,p,null),d=p=u=null),w=!0,f=!1,r=!1,d=e.tag,p=e.result;else if(w)b(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=s,e.anchor=l,!0}else if(w)b(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=s,e.anchor=l,!0;else break;if((e.line===o||e.lineIndent>n)&&(ee(e,n,Ae,!0,r)&&(f?p=e.result:u=e.result),f||(Q(e,c,h,d,p,u,o,a),d=p=u=null),S(e,!0,-1),_=e.input.charCodeAt(e.position)),e.lineIndent>n&&_!==0)b(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return f&&Q(e,c,h,d,p,null),w&&(e.tag=s,e.anchor=l,e.kind="mapping",e.result=c),w}function Da(e){var n,t=!1,i=!1,r,o,a;if(a=e.input.charCodeAt(e.position),a!==33)return!1;if(e.tag!==null&&b(e,"duplication of a tag property"),a=e.input.charCodeAt(++e.position),a===60?(t=!0,a=e.input.charCodeAt(++e.position)):a===33?(i=!0,r="!!",a=e.input.charCodeAt(++e.position)):r="!",n=e.position,t){do a=e.input.charCodeAt(++e.position);while(a!==0&&a!==62);e.position<e.length?(o=e.input.slice(n,e.position),a=e.input.charCodeAt(++e.position)):b(e,"unexpected end of the stream within a verbatim tag")}else{for(;a!==0&&!O(a);)a===33&&(i?b(e,"tag suffix cannot contain exclamation marks"):(r=e.input.slice(n-1,e.position+1),Xn.test(r)||b(e,"named tag handle cannot contain such characters"),i=!0,n=e.position+1)),a=e.input.charCodeAt(++e.position);o=e.input.slice(n,e.position),Ca.test(o)&&b(e,"tag suffix cannot contain flow indicator characters")}return o&&!Qn.test(o)&&b(e,"tag name cannot contain such characters: "+o),t?e.tag=o:Y.call(e.tagMap,r)?e.tag=e.tagMap[r]+o:r==="!"?e.tag="!"+o:r==="!!"?e.tag="tag:yaml.org,2002:"+o:b(e,'undeclared tag handle "'+r+'"'),!0}function Pa(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&b(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!O(t)&&!X(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&b(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function Ua(e){var n,t,i;if(i=e.input.charCodeAt(e.position),i!==42)return!1;for(i=e.input.charCodeAt(++e.position),n=e.position;i!==0&&!O(i)&&!X(i);)i=e.input.charCodeAt(++e.position);return e.position===n&&b(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),Y.call(e.anchorMap,t)||b(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],S(e,!0,-1),!0}function ee(e,n,t,i,r){var o,a,s,l=1,c=!1,h=!1,d,p,u,f,w;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=a=s=Ae===t||Jn===t,i&&S(e,!0,-1)&&(c=!0,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)),l===1)for(;Da(e)||Pa(e);)S(e,!0,-1)?(c=!0,s=o,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)):s=!1;if(s&&(s=c||r),(l===1||Ae===t)&&(Ce===t||Vn===t?f=n:f=n+1,w=e.position-e.lineStart,l===1?s&&(Tn(e,w)||Na(e,w,f))||Fa(e,f)?h=!0:(a&&Oa(e,f)||La(e,f)||Ra(e,f)?h=!0:Ua(e)?(h=!0,(e.tag!==null||e.anchor!==null)&&b(e,"alias node should not have any properties")):Ma(e,f,Ce===t)&&(h=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(h=s&&Tn(e,w))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&b(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,p=e.implicitTypes.length;d<p;d+=1)if(u=e.implicitTypes[d],u.resolve(e.result)){e.result=u.construct(e.result),e.tag=u.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else Y.call(e.typeMap[e.kind||"fallback"],e.tag)?(u=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&u.kind!==e.kind&&b(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+u.kind+'", not "'+e.kind+'"'),u.resolve(e.result)?(e.result=u.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):b(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):b(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||h}function Ha(e){var n=e.position,t,i,r,o=!1,a;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(a=e.input.charCodeAt(e.position))!==0&&(S(e,!0,-1),a=e.input.charCodeAt(e.position),!(e.lineIndent>0||a!==37));){for(o=!0,a=e.input.charCodeAt(++e.position),t=e.position;a!==0&&!O(a);)a=e.input.charCodeAt(++e.position);for(i=e.input.slice(t,e.position),r=[],i.length<1&&b(e,"directive name must not be less than one character in length");a!==0;){for(;q(a);)a=e.input.charCodeAt(++e.position);if(a===35){do a=e.input.charCodeAt(++e.position);while(a!==0&&!U(a));break}if(U(a))break;for(t=e.position;a!==0&&!O(a);)a=e.input.charCodeAt(++e.position);r.push(e.input.slice(t,e.position))}a!==0&&Ke(e),Y.call(Cn,i)?Cn[i](e,i,r):Te(e,'unknown document directive "'+i+'"')}if(S(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,S(e,!0,-1)):o&&b(e,"directives end mark is expected"),ee(e,e.lineIndent-1,Ae,!1,!0),S(e,!0,-1),e.checkLineBreaks&&ka.test(e.input.slice(n,e.position))&&Te(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&Me(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,S(e,!0,-1));return}if(e.position<e.length-1)b(e,"end of the stream or a document separator is expected");else return}function it(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new Ea(e,n),i=e.indexOf("\0");for(i!==-1&&(t.position=i,b(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)Ha(t);return t.documents}function rt(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var i=it(e,t);if(typeof n!="function")return i;for(var r=0,o=i.length;r<o;r+=1)n(i[r])}function ot(e,n){var t=it(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new qn("expected a single document in the stream, but found more")}}function Ba(e,n,t){return typeof n=="object"&&n!==null&&typeof t>"u"&&(t=n,n=null),rt(e,n,B.extend({schema:zn},t))}function $a(e,n){return ot(e,B.extend({schema:zn},n))}de.loadAll=rt;de.load=ot;de.safeLoadAll=Ba;de.safeLoad=$a;var ze={},pe=N,fe=he,ja=Ee,Ga=ue,at=Object.prototype.toString,st=Object.prototype.hasOwnProperty,Ya=9,ce=10,Wa=13,Ka=32,qa=33,za=34,lt=35,Va=37,Ja=38,Xa=39,Qa=42,ct=44,Za=45,dt=58,es=61,ns=62,ts=63,is=64,ht=91,ut=93,rs=96,pt=123,os=124,ft=125,R={};R[0]="\\0";R[7]="\\a";R[8]="\\b";R[9]="\\t";R[10]="\\n";R[11]="\\v";R[12]="\\f";R[13]="\\r";R[27]="\\e";R[34]='\\"';R[92]="\\\\";R[133]="\\N";R[160]="\\_";R[8232]="\\L";R[8233]="\\P";var as=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function ss(e,n){var t,i,r,o,a,s,l;if(n===null)return{};for(t={},i=Object.keys(n),r=0,o=i.length;r<o;r+=1)a=i[r],s=String(n[a]),a.slice(0,2)==="!!"&&(a="tag:yaml.org,2002:"+a.slice(2)),l=e.compiledTypeMap.fallback[a],l&&st.call(l.styleAliases,s)&&(s=l.styleAliases[s]),t[a]=s;return t}function Sn(e){var n,t,i;if(n=e.toString(16).toUpperCase(),e<=255)t="x",i=2;else if(e<=65535)t="u",i=4;else if(e<=4294967295)t="U",i=8;else throw new fe("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+pe.repeat("0",i-n.length)+n}function ls(e){this.schema=e.schema||ja,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=pe.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=ss(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function In(e,n){for(var t=pe.repeat(" ",n),i=0,r=-1,o="",a,s=e.length;i<s;)r=e.indexOf(`
`,i),r===-1?(a=e.slice(i),i=s):(a=e.slice(i,r+1),i=r+1),a.length&&a!==`
`&&(o+=t),o+=a;return o}function $e(e,n){return`
`+pe.repeat(" ",e.indent*n)}function cs(e,n){var t,i,r;for(t=0,i=e.implicitTypes.length;t<i;t+=1)if(r=e.implicitTypes[t],r.resolve(n))return!0;return!1}function Ve(e){return e===Ka||e===Ya}function ne(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function ds(e){return ne(e)&&!Ve(e)&&e!==65279&&e!==Wa&&e!==ce}function En(e,n){return ne(e)&&e!==65279&&e!==ct&&e!==ht&&e!==ut&&e!==pt&&e!==ft&&e!==dt&&(e!==lt||n&&ds(n))}function hs(e){return ne(e)&&e!==65279&&!Ve(e)&&e!==Za&&e!==ts&&e!==dt&&e!==ct&&e!==ht&&e!==ut&&e!==pt&&e!==ft&&e!==lt&&e!==Ja&&e!==Qa&&e!==qa&&e!==os&&e!==es&&e!==ns&&e!==Xa&&e!==za&&e!==Va&&e!==is&&e!==rs}function mt(e){var n=/^\n* /;return n.test(e)}var gt=1,yt=2,bt=3,_t=4,we=5;function us(e,n,t,i,r){var o,a,s,l=!1,c=!1,h=i!==-1,d=-1,p=hs(e.charCodeAt(0))&&!Ve(e.charCodeAt(e.length-1));if(n)for(o=0;o<e.length;o++){if(a=e.charCodeAt(o),!ne(a))return we;s=o>0?e.charCodeAt(o-1):null,p=p&&En(a,s)}else{for(o=0;o<e.length;o++){if(a=e.charCodeAt(o),a===ce)l=!0,h&&(c=c||o-d-1>i&&e[d+1]!==" ",d=o);else if(!ne(a))return we;s=o>0?e.charCodeAt(o-1):null,p=p&&En(a,s)}c=c||h&&o-d-1>i&&e[d+1]!==" "}return!l&&!c?p&&!r(e)?gt:yt:t>9&&mt(e)?we:c?_t:bt}function ps(e,n,t,i){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&as.indexOf(n)!==-1)return"'"+n+"'";var r=e.indent*Math.max(1,t),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-r),a=i||e.flowLevel>-1&&t>=e.flowLevel;function s(l){return cs(e,l)}switch(us(n,a,e.indent,o,s)){case gt:return n;case yt:return"'"+n.replace(/'/g,"''")+"'";case bt:return"|"+Mn(n,e.indent)+Ln(In(n,r));case _t:return">"+Mn(n,e.indent)+Ln(In(fs(n,o),r));case we:return'"'+ms(n)+'"';default:throw new fe("impossible error: invalid scalar style")}}()}function Mn(e,n){var t=mt(e)?String(n):"",i=e[e.length-1]===`
`,r=i&&(e[e.length-2]===`
`||e===`
`),o=r?"+":i?"":"-";return t+o+`
`}function Ln(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function fs(e,n){for(var t=/(\n+)([^\n]*)/g,i=function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,t.lastIndex=c,Rn(e.slice(0,c),n)}(),r=e[0]===`
`||e[0]===" ",o,a;a=t.exec(e);){var s=a[1],l=a[2];o=l[0]===" ",i+=s+(!r&&!o&&l!==""?`
`:"")+Rn(l,n),r=o}return i}function Rn(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,i,r=0,o,a=0,s=0,l="";i=t.exec(e);)s=i.index,s-r>n&&(o=a>r?a:s,l+=`
`+e.slice(r,o),r=o+1),a=s;return l+=`
`,e.length-r>n&&a>r?l+=e.slice(r,a)+`
`+e.slice(a+1):l+=e.slice(r),l.slice(1)}function ms(e){for(var n="",t,i,r,o=0;o<e.length;o++){if(t=e.charCodeAt(o),t>=55296&&t<=56319&&(i=e.charCodeAt(o+1),i>=56320&&i<=57343)){n+=Sn((t-55296)*1024+i-56320+65536),o++;continue}r=R[t],n+=!r&&ne(t)?e[o]:r||Sn(t)}return n}function gs(e,n,t){var i="",r=e.tag,o,a;for(o=0,a=t.length;o<a;o+=1)z(e,n,t[o],!1,!1)&&(o!==0&&(i+=","+(e.condenseFlow?"":" ")),i+=e.dump);e.tag=r,e.dump="["+i+"]"}function ys(e,n,t,i){var r="",o=e.tag,a,s;for(a=0,s=t.length;a<s;a+=1)z(e,n+1,t[a],!0,!0)&&((!i||a!==0)&&(r+=$e(e,n)),e.dump&&ce===e.dump.charCodeAt(0)?r+="-":r+="- ",r+=e.dump);e.tag=o,e.dump=r||"[]"}function bs(e,n,t){var i="",r=e.tag,o=Object.keys(t),a,s,l,c,h;for(a=0,s=o.length;a<s;a+=1)h="",a!==0&&(h+=", "),e.condenseFlow&&(h+='"'),l=o[a],c=t[l],z(e,n,l,!1,!1)&&(e.dump.length>1024&&(h+="? "),h+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),z(e,n,c,!1,!1)&&(h+=e.dump,i+=h));e.tag=r,e.dump="{"+i+"}"}function _s(e,n,t,i){var r="",o=e.tag,a=Object.keys(t),s,l,c,h,d,p;if(e.sortKeys===!0)a.sort();else if(typeof e.sortKeys=="function")a.sort(e.sortKeys);else if(e.sortKeys)throw new fe("sortKeys must be a boolean or a function");for(s=0,l=a.length;s<l;s+=1)p="",(!i||s!==0)&&(p+=$e(e,n)),c=a[s],h=t[c],z(e,n+1,c,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&ce===e.dump.charCodeAt(0)?p+="?":p+="? "),p+=e.dump,d&&(p+=$e(e,n)),z(e,n+1,h,!0,d)&&(e.dump&&ce===e.dump.charCodeAt(0)?p+=":":p+=": ",p+=e.dump,r+=p));e.tag=o,e.dump=r||"{}"}function Fn(e,n,t){var i,r,o,a,s,l;for(r=t?e.explicitTypes:e.implicitTypes,o=0,a=r.length;o<a;o+=1)if(s=r[o],(s.instanceOf||s.predicate)&&(!s.instanceOf||typeof n=="object"&&n instanceof s.instanceOf)&&(!s.predicate||s.predicate(n))){if(e.tag=t?s.tag:"?",s.represent){if(l=e.styleMap[s.tag]||s.defaultStyle,at.call(s.represent)==="[object Function]")i=s.represent(n,l);else if(st.call(s.represent,l))i=s.represent[l](n,l);else throw new fe("!<"+s.tag+'> tag resolver accepts not "'+l+'" style');e.dump=i}return!0}return!1}function z(e,n,t,i,r,o){e.tag=null,e.dump=t,Fn(e,t,!1)||Fn(e,t,!0);var a=at.call(e.dump);i&&(i=e.flowLevel<0||e.flowLevel>n);var s=a==="[object Object]"||a==="[object Array]",l,c;if(s&&(l=e.duplicates.indexOf(t),c=l!==-1),(e.tag!==null&&e.tag!=="?"||c||e.indent!==2&&n>0)&&(r=!1),c&&e.usedDuplicates[l])e.dump="*ref_"+l;else{if(s&&c&&!e.usedDuplicates[l]&&(e.usedDuplicates[l]=!0),a==="[object Object]")i&&Object.keys(e.dump).length!==0?(_s(e,n,e.dump,r),c&&(e.dump="&ref_"+l+e.dump)):(bs(e,n,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump));else if(a==="[object Array]"){var h=e.noArrayIndent&&n>0?n-1:n;i&&e.dump.length!==0?(ys(e,h,e.dump,r),c&&(e.dump="&ref_"+l+e.dump)):(gs(e,h,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump))}else if(a==="[object String]")e.tag!=="?"&&ps(e,e.dump,n,o);else{if(e.skipInvalid)return!1;throw new fe("unacceptable kind of an object to dump "+a)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function vs(e,n){var t=[],i=[],r,o;for(je(e,t,i),r=0,o=i.length;r<o;r+=1)n.duplicates.push(t[i[r]]);n.usedDuplicates=new Array(o)}function je(e,n,t){var i,r,o;if(e!==null&&typeof e=="object")if(r=n.indexOf(e),r!==-1)t.indexOf(r)===-1&&t.push(r);else if(n.push(e),Array.isArray(e))for(r=0,o=e.length;r<o;r+=1)je(e[r],n,t);else for(i=Object.keys(e),r=0,o=i.length;r<o;r+=1)je(e[i[r]],n,t)}function vt(e,n){n=n||{};var t=new ls(n);return t.noRefs||vs(e,t),z(t,0,e,!0,!0)?t.dump+`
`:""}function ws(e,n){return vt(e,pe.extend({schema:Ga},n))}ze.dump=vt;ze.safeDump=ws;var Le=de,wt=ze;function Re(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}T.Type=M;T.Schema=ie;T.FAILSAFE_SCHEMA=Ye;T.JSON_SCHEMA=jn;T.CORE_SCHEMA=Gn;T.DEFAULT_SAFE_SCHEMA=ue;T.DEFAULT_FULL_SCHEMA=Ee;T.load=Le.load;T.loadAll=Le.loadAll;T.safeLoad=Le.safeLoad;T.safeLoadAll=Le.safeLoadAll;T.dump=wt.dump;T.safeDump=wt.safeDump;T.YAMLException=he;T.MINIMAL_SCHEMA=Ye;T.SAFE_SCHEMA=ue;T.DEFAULT_SCHEMA=Ee;T.scan=Re("scan");T.parse=Re("parse");T.compose=Re("compose");T.addConstructor=Re("addConstructor");var xs=T,ks=xs;function Cs(e){if(!e.startsWith(`---
`))return{data:{},content:e};const n=e.indexOf(`
---`,4);if(n===-1)return{data:{},content:e};const t=e.slice(4,n),i=e.slice(n+4),r=i.startsWith(`
`)?i.slice(1):i;return{data:ks.safeLoad(t)??{},content:r}}function As(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[]};for(const[t,i]of Object.entries(e)){const r=t.split("/").pop()??"";if(r==="_template.md"||r===".gitkeep")continue;const{data:o,content:a}=Cs(i);/^systems\/[^/]+\.md$/.test(t)?n.systems.push(Ts(o,a)):/^destinations\/[^/]+\.md$/.test(t)?n.destinations.push(Ss(o,a)):/^factions\/[^/]+\.md$/.test(t)?n.factions.push(Is(o,a)):/^ships\/[^/]+\.md$/.test(t)?n.ships.push(Es(o,a)):t==="ships/components/jump-drives.md"?n.drives=Ms(o):t==="navigation/jump-routes.md"?n.routes=Ls(o):t==="commodities.md"?n.commodities=Rs(o):/^story\/[^/]+\.md$/.test(t)?n.storyBeats.push(Fs(o,a)):t==="game-settings.md"&&(n.settings=Os(o))}return n}function Fe(e){const n=[];let t=!1;for(const i of e.split(`
`)){const r=i.trim();if(!r.startsWith("#"))if(r===""){if(t)break}else t=!0,n.push(r)}return n.join(" ")}function Ts(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economy:e.economy??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:Fe(n)}}function Ss(e,n){const t=e.amenities??{},i={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:i,npcs:e.npcs??{},goodsBias:e.goods_bias??[],dangerLevel:e.danger_level,tags:e.tags??[],description:Fe(n)}}function Is(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:Fe(n)}}function Es(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,tags:e.tags??[],description:Fe(n)}}function Ms(e){return(e.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function Ls(e){return(e.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function Rs(e){return(e.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function Fs(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function Os(e){var n,t,i,r;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((t=e.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((i=e.starting_location)==null?void 0:i.system)??"",destination:((r=e.starting_location)==null?void 0:r.destination)??""},startingShip:e.starting_ship??""}}function Ns(){const e=Object.assign({"/docs/world/commodities.md":Li,"/docs/world/destinations/_template.md":Ri,"/docs/world/destinations/blackwake-yard.md":Fi,"/docs/world/destinations/ceti-landfall.md":Oi,"/docs/world/destinations/drift-market.md":Ni,"/docs/world/destinations/elysium-station.md":Di,"/docs/world/destinations/eridani-anchorage.md":Pi,"/docs/world/destinations/foundries-platform.md":Ui,"/docs/world/destinations/galileo-transfer.md":Hi,"/docs/world/destinations/hestia-ring.md":Bi,"/docs/world/destinations/keelhaul-station.md":$i,"/docs/world/destinations/kepler-yard.md":ji,"/docs/world/destinations/mars-anchor.md":Gi,"/docs/world/destinations/meridian-station.md":Yi,"/docs/world/destinations/new-horizon-port.md":Wi,"/docs/world/destinations/orrery-anchorage.md":Ki,"/docs/world/destinations/redline-station.md":qi,"/docs/world/destinations/tycho-orbital.md":zi,"/docs/world/destinations/veil-station.md":Vi,"/docs/world/destinations/waypoint-ceti.md":Ji,"/docs/world/factions/_template.md":Xi,"/docs/world/factions/centauri-trade-league.md":Qi,"/docs/world/factions/eridani-colonial-council.md":Zi,"/docs/world/factions/free-captains.md":er,"/docs/world/factions/grey-market-cartel.md":nr,"/docs/world/factions/helios-directorate.md":tr,"/docs/world/factions/independent-miners-guild.md":ir,"/docs/world/factions/procyon-institute.md":rr,"/docs/world/factions/terran-union.md":or,"/docs/world/galaxy-map.md":ar,"/docs/world/game-settings.md":sr,"/docs/world/navigation/jump-routes.md":lr,"/docs/world/ships/_template.md":cr,"/docs/world/ships/components/jump-drives.md":dr,"/docs/world/ships/freighter.md":hr,"/docs/world/ships/hauler.md":ur,"/docs/world/ships/scout.md":pr,"/docs/world/story/_template.md":fr,"/docs/world/story/enter-wolf-359.md":mr,"/docs/world/story/first-jump.md":gr,"/docs/world/story/opening-arrival.md":yr,"/docs/world/systems/_template.md":br,"/docs/world/systems/alpha-centauri.md":_r,"/docs/world/systems/barnards-star.md":vr,"/docs/world/systems/epsilon-eridani.md":wr,"/docs/world/systems/procyon.md":xr,"/docs/world/systems/sirius.md":kr,"/docs/world/systems/sol.md":Cr,"/docs/world/systems/tau-ceti.md":Ar,"/docs/world/systems/wolf-359.md":Tr}),n={};for(const[t,i]of Object.entries(e)){const r=t.replace("/docs/world/","");n[r]=i}return As(n)}Pt(Ns());const Ds=navigator.maxTouchPoints>0?"touch":"keyboard",Ps=new URLSearchParams(window.location.search).has("debug"),xt={environment:"browser",primaryInput:Ds,debug:Ps},Us=new It,kt=new Rt(xt);kt.connect();const Hs=new Mi(Us,kt,xt);let On=0;function Ct(e){Hs.tick(e-On),On=e,requestAnimationFrame(Ct)}requestAnimationFrame(Ct);
