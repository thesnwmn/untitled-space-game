(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const re=40,me=30,wt=50,Fe=24;function xt(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class kt{constructor(){this.charW=0,this.charH=0,this.gridH=me,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(re),this.pre.dataset.gridRows=String(me),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${Fe}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${Fe}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const t=n.getBoundingClientRect();document.body.removeChild(n),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(re*this.charW),window.innerHeight/(me*this.charH)),t=Math.max(me,Math.min(wt,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${Fe*n}px`,this.pre.style.width=`${re*this.charW*n}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const r of this.resizeHandlers)r(re,t)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const t=[];for(const r of n){let i="";for(const o of r){const a=o.fg!=="transparent"?`fg-${o.fg}`:"",s=o.bg!=="transparent"?`bg-${o.bg}`:"",l=a&&s?`${a} ${s}`:a||s,c=l?` class="${l}"`:"";i+=`<span${c}>${xt(o.char)}</span>`}t.push(i)}this.pre.innerHTML=t.join(`
`)}getWidth(){return re}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const Ct={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},At=new Set(["0","1","2","3","4","5","6","7","8","9"]),Tt=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class St{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}connect(){this.keyListener=n=>{if(Tt.has(n.key)&&n.preventDefault(),At.has(n.key))for(const r of this.charInputHandlers.slice())r(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const r of this.charInputHandlers.slice())r("\b");return}const t=Ct[n.key];if(t)for(const r of this.actionHandlers.slice())r(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=n=>{const t=this.pointerStartMap.get(n.pointerId),r=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),!t){this.logDebug(`UP id=${n.pointerId} NO START`);return}const i=n.clientX-t.startX,o=n.clientY-t.startY,a=Math.abs(i),s=Math.abs(o);if(a<20&&s<20)if(r>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;a>=s?l=i>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(i)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=n=>{this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const t=n.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(n,t){const r=document.querySelector(".game-screen");if(!r)return null;const i=r.getBoundingClientRect(),o=parseInt(r.dataset.gridCols??"1"),a=parseInt(r.dataset.gridRows??"1");if(!o||!a||!i.width||!i.height)return null;const s=Math.floor((n-i.left)/(i.width/o)),l=Math.floor((t-i.top)/(i.height/a));return s<0||s>=o||l<0||l>=a?null:{col:s,row:l}}}function y(e,n,t,r,i,o){if(n<0||n>=e.length)return;const a=e[n];for(let s=0;s<r.length;s++){const l=t+s;l>=0&&l<a.length&&(a[l]={char:r[s],fg:i,bg:o})}}function F(e,n,t,r,i){if(n<0||n>=e.length)return;const o=e[n].length,a=Math.max(0,Math.floor((o-t.length)/2));y(e,n,a,t,r,i)}function Mn(e,n){const t=e.split(/\s+/).filter(Boolean),r=[];let i="";for(const o of t)i.length===0?i=o:i.length+1+o.length<=n?i+=" "+o:(r.push(i),i=o);return i.length>0&&r.push(i),r}const Qe=["UNTITLED","SPACE GAME"],It=4,Et=3,Mt="- An ASCII space adventure -",Lt=11,Ze=16;class en{constructor(n,t,r,i){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,i()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),n.onAction(o=>{this.activated||(o==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:o==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:o==="SELECT"&&this.items[this.cursorIdx].action())}),n.onTap&&n.onTap((o,a)=>{if(!this.activated){for(let s=0;s<this.items.length;s++)if(a===Ze+s){this.cursorIdx=s,this.items[s].action();return}}})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let a=0;a<t;a++)for(let s=0;s<r;s++)n[a][s]={char:" ",fg:"black",bg:"black"};for(let a=0;a<Qe.length;a++)F(n,It+a*Et,Qe[a],"bright-cyan","black");F(n,Lt,Mt,"white","black");const i=this.items.reduce((a,s)=>Math.max(a,s.label.length+2),0),o=Math.max(0,Math.floor((r-i)/2));for(let a=0;a<this.items.length;a++){const s=Ze+a;if(s>=t)continue;const l=a===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";y(n,s,o,c+this.items[a].label,h,"black")}}}let Pe=null;function Rt(e){Pe=e}function H(){if(Pe===null)throw new Error("World not initialised — call initWorld() before accessing world data");return Pe}function we(e){return H().systems.find(n=>n.id===e)}function z(e){return H().destinations.find(n=>n.id===e)}function Ft(e){return H().routes.filter(n=>n.from===e||n.to===e)}function Ln(e){return H().drives.find(n=>n.id===e)}function Ot(e){return H().storyBeats.filter(n=>n.trigger===e)}function Nt(){return H().settings}function Rn(e){return H().ships.find(n=>n.id===e)}function Pt(e,n){return H().routes.find(t=>t.from===e&&t.to===n||t.from===n&&t.to===e)}function Z(e){return H().commodities.find(n=>n.id===e)}function Dt(){return H().commodities}function Ut(e){return e.reduce((n,t)=>{const r=Z(t.commodityId);return n+t.qty*((r==null?void 0:r.weightKg)??0)},0)}const Y=3;function Fn(e,n){return n?e-2:e}function Ht(e){return e.toLocaleString("en-US")}class $e{constructor(n,t){this.buttonRanges=null,this.footerRow=-1,this.context=n,this.player=t}render(n,t){const r=n.length,i=r>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader&&(this.renderHeaderRow0(n,i),this.renderHeaderRow1(n,i)),t.showFooter&&(this.renderFooter(n,r,i,t.navOptions),this.footerRow=r-1)}renderHeaderRow0(n,t){const r=we(this.player.systemId),i=r?r.name.toUpperCase():this.player.systemId.toUpperCase(),o="::";y(n,0,0,o,"bright-black","black"),y(n,0,o.length,i,"bright-cyan","black");const s=t-o.length-i.length-10;let l=o.length+i.length;for(let c=0;c<s;c++)n[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=s,y(n,0,l,"[M]","white","black"),l+=3,y(n,0,l," MENU","white","black"),l+=5,y(n,0,l,"::","bright-black","black")}renderHeaderRow1(n,t){const r=this.player.destinationId?z(this.player.destinationId):null,i=r?r.name.toUpperCase():"IN SPACE",o=Ht(this.player.credits),a=o.length+5,s="::";y(n,1,0,s,"bright-black","black"),y(n,1,s.length,i,"cyan","black");const l=t-s.length-i.length-a;let c=s.length+i.length;for(let h=0;h<l;h++)n[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,y(n,1,c,o,"green","black"),c+=o.length,y(n,1,c," CR","white","black"),c+=3,y(n,1,c,"::","bright-black","black")}renderFooter(n,t,r,i){const o=t-1,a=[];if(i.length===0){for(let l=0;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}y(n,o,0,"::","bright-black","black");let s=2;for(let l=0;l<i.length;l++){l>0&&(y(n,o,s,"::","bright-black","black"),s+=2);const c=i[l],h=`[${l+1}]`,d=` ${c.label}`,p=s;y(n,o,s,h,"white","black"),s+=h.length,y(n,o,s,d,"white","black"),s+=d.length,a.push({id:c.id,startCol:p,endCol:s})}for(let l=s;l<r;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=a}hitTestNav(n,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const r of this.buttonRanges)if(n>=r.startCol&&n<r.endCol)return r.id;return null}}const Bt=3,nn=5;class $t{constructor(n,t,r,i){this.activated=!1,this.pageIndex=0,this.onContinue=i,this.chrome=new $e(t,r);const a=Ot("game-start")[0].text.split(`

`),s=a[0].trim();let l;/^YEAR\s+\d{4}$/.test(s)?(this.yearHeader=s,l=a.slice(1)):(this.yearHeader="",l=a);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),p=Mn(d,36);h>0&&c.push(""),c.push(...p)}this.bodyLines=c,n.onAction(h=>{this.activated||(h==="SELECT"?(this.activated=!0,this.onContinue()):h==="LEFT"?this.pageIndex>0&&this.pageIndex--:h==="RIGHT"&&this.pageIndex++)}),n.onTap&&n.onTap((h,d)=>{this.activated||(this.activated=!0,this.onContinue())})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let d=0;d<t;d++)for(let p=0;p<r;p++)n[d][p]={char:" ",fg:"black",bg:"black"};if(this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:[]}),this.yearHeader){const d=Math.max(0,Math.floor((r-this.yearHeader.length)/2));y(n,Bt,d,this.yearHeader,"bright-yellow","black")}const o=t-3-nn,a=Math.max(1,Math.ceil(this.bodyLines.length/o));this.pageIndex>=a&&(this.pageIndex=a-1);const s=a>1,l=this.pageIndex*o,c=Math.min(l+o,this.bodyLines.length);let h=nn;for(let d=l;d<c;d++){const p=this.bodyLines[d];p!==""&&y(n,h,2,p,"white","black"),h++}if(s){const d=`< ${this.pageIndex+1}/${a} >`,p=r-9;y(n,t-3,p,d,"bright-black","black")}}}const On=5,oe=10;class Te{constructor(n,t,r,i,o,a,s=[],l=null){this.activeTabIdx=0,this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.activated=!1,this.modal=null,this.title=n,this._staticItems=t,this.tabs=l,this.context=o,this.player=a,this.chrome=new $e(o,a),this.navOptions=r,this.infoLines=s,this.itemStartRow=l!==null?Y+5:Y+3+s.length,i.onCharInput&&i.onCharInput(c=>{this.modal!==null&&this.modal.handleCharInput(c)}),i.onAction(c=>{if(this.modal!==null){this.modal.handleAction(c);return}this.activated||(c==="UP"?this.moveCursor(-1):c==="DOWN"?this.moveCursor(1):c==="LEFT"&&this.tabs!==null?(this.activeTabIdx=Math.max(0,this.activeTabIdx-1),this.resetCursor()):c==="RIGHT"&&this.tabs!==null?(this.activeTabIdx=Math.min(this.tabs.length-1,this.activeTabIdx+1),this.resetCursor()):c==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):c==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):c==="SELECT"?this.activateCurrent():this.handleNavAction(c))}),this.resetCursor(),i.onTap&&i.onTap((c,h)=>{if(this.modal!==null){this.modal.handleTap(c,h);return}if(this.activated)return;const d=this.chrome.hitTestNav(c,h);if(d!==null){this.handleNavTap(d);return}if(this.tabs!==null&&h===Y+3){let u=3;for(let f=0;f<this.tabs.length;f++){const w=this.tabs[f].label.length+2;if(c>=u&&c<u+w){this.activeTabIdx=f,this.resetCursor();return}u+=w+1}}const p=this.rowToVisibleItemIndex(h);p!==null&&!this.items[p].disabled&&(this.cursorIdx=p,this.activateCurrent())})}get items(){var n;return this.tabs!==null?((n=this.tabs[this.activeTabIdx])==null?void 0:n.items)??[]:this._staticItems}moveCursor(n){const t=this.items,r=t.length;if(r===0)return;const i=this.cursorIdx===-1?n>0?r-1:0:this.cursorIdx;for(let o=0;o<r;o++){const a=((i+n*(o+1))%r+r)%r;if(!t[a].disabled){this.cursorIdx=a;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const n=this.items[this.cursorIdx];n.disabled||(this.activated=!0,n.action())}rowToVisibleItemIndex(n){var i;let t=this.itemStartRow;const r=this.items;for(let o=0;o<r.length;o++){const a=1+(((i=r[o].details)==null?void 0:i.length)??0);if(n>=t&&n<t+a)return o;t+=a}return null}resetCursor(){const n=this.items;for(let t=0;t<n.length;t++)if(!n[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(n){}handleNavTap(n){}openModal(n){this.modal=n}closeModal(){this.modal=null}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:this.navOptions}}update(n){}render(n){var P;const t=n.length,r=t>0?n[0].length:0;for(let v=0;v<t;v++)for(let g=0;g<r;g++)n[v][g]={char:" ",fg:"black",bg:"black"};const i=this.buildChromeConfig();this.chrome.render(n,i),y(n,Y,2,this.title,"bright-white","black"),y(n,Y+1,2,"'".repeat(this.title.length),"bright-black","black");for(let v=0;v<this.infoLines.length;v++)y(n,Y+2+v,2,this.infoLines[v],"bright-black","black");if(this.tabs!==null){const v=Y+3;let g=2;n[v][g]={char:"|",fg:"bright-black",bg:"black"},g++;for(let S=0;S<this.tabs.length;S++){const M=S===this.activeTabIdx,m=` ${this.tabs[S].label} `,C=M?"black":"white",I=M?"green":"black";for(const R of m)g<r&&(n[v][g]={char:R,fg:C,bg:I}),g++;g<r&&(n[v][g]={char:"|",fg:"bright-black",bg:"black"}),g++}}const a=Fn(t,i.showFooter)-1,s=a-this.itemStartRow,l=this.items,c=l.map(v=>{var g;return 1+(((g=v.details)==null?void 0:g.length)??0)}),d=c.reduce((v,g)=>v+g,0)>s,p=d?s-1:s,u=[];let f=[],w=0;for(let v=0;v<c.length;v++)w+c[v]>p?(f.length>0&&u.push(f),f=[v],w=c[v]):(f.push(v),w+=c[v]);f.length>0&&u.push(f),this.lastPageCount=Math.max(1,u.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const _=u[this.pageIndex]??[];let k=this.itemStartRow;for(const v of _){const g=l[v],S=v===this.cursorIdx,M=g.disabled?"bright-black":S?"bright-green":"white",m=g.infoFg??M,C=r-4;if(g.icon!==void 0){const I=g.icon.length;if(y(n,k,2,S?">":" ",M,"black"),y(n,k,3,g.icon,g.iconFg??M,"black"),g.info!==void 0){const fe=Math.max(1,C-1-I-g.label.length-2-g.info.length);y(n,k,3+I,g.label+" ",M,"black"),y(n,k,3+I+g.label.length+1,".".repeat(fe),"bright-black","black"),y(n,k,3+I+g.label.length+1+fe+1,g.info,m,"black")}else y(n,k,3+I,g.label.slice(0,C-1-I),M,"black")}else if(g.info!==void 0){const I=S?"> ":"  ",R=Math.max(1,C-2-g.label.length-2-g.info.length);y(n,k,2,I+g.label+" ",M,"black"),y(n,k,2+I.length+g.label.length+1,".".repeat(R),"bright-black","black"),y(n,k,2+I.length+g.label.length+1+R+1,g.info,m,"black")}else if(g.details!==void 0&&g.details.length>0){y(n,k,2,((S?"> ":"  ")+g.label).slice(0,C),M,"black");for(let R=0;R<g.details.length;R++)k+1+R<=a&&y(n,k+1+R,2,("  "+g.details[R]).slice(0,C),"bright-black","black")}else y(n,k,2,((S?"> ":"  ")+g.label).slice(0,C),M,"black");k+=1+(((P=g.details)==null?void 0:P.length)??0)}if(d){const v=`${this.pageIndex+1}/${this.lastPageCount}`,g=a;y(n,g,0,"|<|","white","black");const S=Math.floor((r-v.length)/2);y(n,g,S,v,"bright-black","black"),y(n,g,r-3,"|>|","white","black")}this.modal!==null&&this.modal.render(n)}}const jt=30;class De{constructor(n){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=n,this.value=Math.max(n.field.min,Math.min(n.field.max,n.field.initialValue))}handleAction(n){const{field:t}=this.formDef;if(n==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(n==="UP"){this.value=Math.min(t.max,this.value+1);return}if(n==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(n==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(n==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(n==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}n==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(n){if(this.focus!=="field")return;const{field:t}=this.formDef;if(n==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(n>="0"&&n<="9"){const r=parseInt(n,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,r)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+r)}}handleTap(n,t){this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(n){const t=n.length,r=t>0?n[0].length:0,{title:i,field:o,derivedRows:a,confirmLabel:s}=this.formDef,l=a.length,c=8+l,h=jt,d=Math.floor((r-h)/2),p=Math.floor((t-c)/2);for(let x=0;x<c;x++)for(let D=0;D<h;D++){const $=p+x,ie=d+D;$>=0&&$<t&&ie>=0&&ie<r&&(n[$][ie]={char:" ",fg:"white",bg:"black"})}const u=(x,D,$)=>{x>=0&&x<t&&D>=0&&D<r&&(n[x][D]={char:$,fg:"white",bg:"black"})};u(p,d,"+"),u(p,d+h-1,"+");for(let x=1;x<h-1;x++)u(p,d+x,"-");u(p+c-1,d,"+"),u(p+c-1,d+h-1,"+");for(let x=1;x<h-1;x++)u(p+c-1,d+x,"-");for(let x=1;x<c-1;x++)u(p+x,d,"|"),u(p+x,d+h-1,"|");const f=h-2,w=p+1,_=d+1+Math.floor((f-i.length)/2);y(n,w,_,i,"bright-white","black"),y(n,p+2,_,"'".repeat(i.length),"bright-black","black");const k=[o.label,...a.map(x=>x.label)],P=Math.max(...k.map(x=>x.length)),v=d+1+P+3,g=p+4,S=this.focus==="field";y(n,g,d+1,o.label.padEnd(P)+" : ","white","black");const M=this.value.toString().padStart(5);y(n,g,v,M,S?"black":"white",S?"green":"black");for(let x=0;x<l;x++){const D=a[x],$=p+5+x,ie=D.compute(this.value);y(n,$,d+1,D.label.padEnd(P)+" : ","white","black"),y(n,$,v,ie,"white","black")}const m=p+4+l+2,C=`[ ${s} ]`,I="[ CANCEL ]",R=3,fe=C.length+R+I.length,vt=Math.floor((f-fe)/2),Re=d+1+vt,Ve=Re+C.length+R;this.confirmRect={col:Re,row:m,width:C.length},this.cancelRect={col:Ve,row:m,width:I.length};const Je=this.focus==="confirm",Xe=this.focus==="cancel";y(n,m,Re,C,Je?"black":"white",Je?"green":"black"),y(n,m,Ve,I,Xe?"black":"white",Xe?"green":"black")}}class Gt extends Te{constructor(n,t,r,i,o,a,s,l){const c=z(i),h=[];c.amenities.trader&&h.push({label:"TRADER",action:a}),c.amenities.missionBoard&&h.push({label:"MISSION BOARD",action:s});const d=r.fuelCapacityL-r.fuelL,p=Math.floor(r.credits/oe),u=Math.min(d,p);let f=null;if(c.amenities.fuel&&u>0){const P=u*oe;f=h.length,h.push({label:`BUY FUEL  +${u}L  ${P}CR`,action:()=>{}})}const w=Mn(c.description,36).slice(0,3),_=`DANGER: ${c.dangerLevel.toUpperCase()}`,k=[...w,_];super("HUB",h,[{id:"undock",label:"UNDOCK"}],n,t,r,k),this.onShip=l,this.onRefuel=o,this.fuelItemIdx=f}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx===-1)return;const t=n[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const r=this.player.fuelCapacityL-this.player.fuelL,i=Math.floor(this.player.credits/oe),o=Math.min(r,i);this.openModal(new De({title:"BUY FUEL",field:{label:"Litres",initialValue:o,min:0,max:o},derivedRows:[{label:"Cost",compute:a=>`${a*oe} CR`}],confirmLabel:"BUY",onConfirm:a=>{this.closeModal(),a>0&&this.onRefuel(a*oe,a)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class Yt extends Te{constructor(n,t,r,i,o,a,s,l,c){var u;const d=((u=z(i).npcs.trader)==null?void 0:u.toUpperCase())??"TRADER",p=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(d,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r,[],p),this.traderStock=o,this.onBuy=a,this.onSell=s,this.onHub=l,this.onUndock=c,this.syncItems(),this.clampCursor()}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(n=>{const t=Z(n.commodityId);if(!t)return[];const r=this.player.credits>=t.basePrice;return[{label:`${t.name} (x${n.qty})`,info:`${t.basePrice} CR`,disabled:!r,action:()=>{const i=Math.floor(this.player.credits/t.basePrice),o=Math.min(n.qty,i);this.openModal(new De({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:o,min:0,max:o},derivedRows:[{label:"Total",compute:a=>`${a*t.basePrice} CR`}],confirmLabel:"BUY",onConfirm:a=>{a>0&&this.onBuy(n.commodityId,a),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const n=this.player.cargoHold;return n.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...n].flatMap(t=>{const r=Z(t.commodityId);return r?[{label:`${r.name} (x${t.qty})`,info:`${r.basePrice} CR`,action:()=>{this.openModal(new De({title:r.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:i=>`${i*r.basePrice} CR`}],confirmLabel:"SELL",onConfirm:i=>{i>0&&this.onSell(t.commodityId,i),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]:[]})}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const n=this.items;(this.cursorIdx<0||this.cursorIdx>=n.length||(t=n[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=n.findIndex(r=>!r.disabled))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(n){this.syncItems(),super.render(n);const t=n.length,r=`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,i=Fn(t,!0)-2;y(n,i,2,r,"bright-black","black")}}const Wt=[{id:"M001",type:"rescue",title:"Find the Lost Crew",reward:500},{id:"M002",type:"delivery",title:"Deliver Fuel Core",reward:300},{id:"M003",type:"combat",title:"Clear Pirate Outpost",reward:750},{id:"M004",type:"salvage",title:"Salvage Station Debris",reward:400},{id:"M005",type:"rescue",title:"Rescue Stranded Vessel",reward:600},{id:"M006",type:"delivery",title:"Transport Supplies",reward:250},{id:"M007",type:"combat",title:"Eliminate Smugglers",reward:800}],Kt={rescue:"[R] ",delivery:"[D] ",combat:"[C] ",salvage:"[S] "};class qt extends Te{constructor(n,t,r,i,o,a){z(i);const s=Wt.map(l=>({label:l.title,icon:Kt[l.type],iconFg:"bright-yellow",info:`${l.reward} CR`,infoFg:"bright-green",action:()=>console.log(`[MissionBoard] Selected: ${l.title}`)}));super("MISSION BOARD",s,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,r),this.onHub=o,this.onUndock=a}activateCurrent(){if(this.items.length===0)return;const n=this.items[this.cursorIdx];n.disabled||n.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}const zt=[18,10,5],Vt=[".","*","+"],tn=[4e3,2e3,800],Jt=[9e3,5e3,2500],Xt=[null,"bright-black","white"],Qt=["bright-black","white","bright-white"],Zt=["white","bright-white","bright-cyan"],ge=3,rn=25,ye=2,on=37,an=2*Math.PI;function ei(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class ni{constructor(n=42){this.boundsSet=!1,this.rand=ei(n),this.stars=[];for(let t=0;t<3;t++)for(let r=0;r<zt[t];r++){const i=ye+Math.floor(this.rand()*(on-ye+1)),o=ge+Math.floor(this.rand()*(rn-ge+1)),a=this.rand()*an,s=tn[t]+this.rand()*(Jt[t]-tn[t]);this.stars.push({col:i,row:o,layer:t,twinklePhase:a,twinklePeriod:s})}}update(n){for(const t of this.stars)t.twinklePhase+=an/t.twinklePeriod*n}render(n,t,r,i,o){if(!this.boundsSet){this.boundsSet=!0;const a=rn-ge,s=on-ye;{const l=(r-t)/a,c=(o-i)/s;for(const h of this.stars)h.row=Math.round(t+(h.row-ge)*l),h.col=Math.round(i+(h.col-ye)*c)}}for(const a of this.stars){const{row:s,col:l,layer:c}=a;if(s<t||s>r||l<i||l>o)continue;const h=Math.sin(a.twinklePhase);let d;h>=.5?d=Zt[c]:h>=-.5?d=Qt[c]:d=Xt[c],d!==null&&(n[s][l]={char:Vt[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const ti=2,ii=3,ri=2*Math.PI/9e3,oi=2*Math.PI/12e3,ai=Math.PI/3;function sn(e,n,t){return Math.max(n,Math.min(t,e))}class si{constructor(n,t,r,i,o){this.time=0,this.def=n,this.intRowStart=t,this.intRowEnd=r,this.intColStart=i,this.intColEnd=o,this.glyphHeight=n.glyph.rows.length,this.glyphWidth=Math.max(...n.glyph.rows.map(a=>a.length)),this.anchorRow=t+Math.floor((r-t)/2)-Math.floor(this.glyphHeight/2),this.anchorCol=i+Math.floor((o-i)*.6)-Math.floor(this.glyphWidth/2)}update(n){this.time+=n}getDisplayPosition(){const n=Math.round(ti*Math.sin(this.time*ri)),t=Math.round(ii*Math.sin(this.time*oi+ai)),r=sn(this.anchorRow+n,this.intRowStart,this.intRowEnd-this.glyphHeight+1),i=sn(this.anchorCol+t,this.intColStart,this.intColEnd-this.glyphWidth+1);return{row:r,col:i}}render(n){const{row:t,col:r}=this.getDisplayPosition(),i=this.def.glyph.fg;for(let o=0;o<this.def.glyph.rows.length;o++){const a=this.def.glyph.rows[o];for(let s=0;s<a.length;s++){const l=a[s];if(l===" ")continue;const c=t+o,h=r+s;c>=0&&c<n.length&&h>=0&&h<n[c].length&&(n[c][h]={char:l,fg:i,bg:"black"})}}}}const ae={BEACON:{name:"BEACON",glyph:{rows:["[*]"," | "],fg:"bright-yellow"}},RELAY:{name:"RELAY",glyph:{rows:[">---<"," |*|","  |"],fg:"bright-yellow"}},RING:{name:"RING",glyph:{rows:["/-\\","|O|","\\-/"],fg:"cyan"}},HUB:{name:"HUB",glyph:{rows:["  *  ","--+--"," [H] ","  |  ","  *  "],fg:"white"}}};function be(e,n){if(e.length>=n)return e.slice(0,n);const t=n-e.length,r=Math.floor(t/2);return" ".repeat(r)+e+" ".repeat(t-r)}const li={civilian:ae.HUB,military:ae.RELAY,research:ae.RING,"black-market":ae.BEACON};class ci{constructor(n,t,r,i,o,a){if(this.cursorIdx=0,this.activated=!1,this.h=30,this.w=40,this.station=null,this.player=r,this.context=t,this.chrome=new $e(t,r),this.starfield=new ni,this.inSpace=r.destinationId===null,r.destinationId!==null){const l=z(r.destinationId);this.stationType=li[l.type]??ae.RELAY}else this.stationType=null;const s=()=>this.inSpace?1:2;n.onAction(l=>{this.activated||(l==="CARGO"?(this.activated=!0,a()):l==="UP"?this.cursorIdx=(this.cursorIdx-1+s())%s():l==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%s():l==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,i()):this.inSpace||(this.activated=!0,o())))}),n.onTap&&n.onTap((l,c)=>{this.activated||(c===2?l>=this.w/2&&(this.activated=!0,a()):c===this.h-1&&(l<this.w/2?(this.activated=!0,i()):this.inSpace||(this.activated=!0,o())))})}update(n){this.starfield.update(n),this.station&&this.station.update(n)}render(n){const t=n.length,r=t>0?n[0].length:0;this.h=t,this.w=r;for(let m=0;m<t;m++)for(let C=0;C<r;C++)n[m][C]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,{showHeader:!0,showFooter:!1,navOptions:[]});const i=Math.floor(r/2),o=i-3,a=2,s=3,l=4,c=t-3,h=t-2,d=t-1,p=1,u=r-2;this.stationType&&!this.station&&(this.station=new si(this.stationType,l,c,p,u));const f=m=>({char:m,fg:"bright-black",bg:"black"}),w=be(`FUEL:${this.player.fuelL}/${this.player.fuelCapacityL}L`,o),_=Math.round(this.player.cargoWeightKg/1e3),k=Math.round(this.player.cargoCapacity/1e3),P=be(`CARGO: ${_}/${k}Mg`,o);n[a][1]=f("\\");for(let m=0;m<o;m++)n[a][2+m]=f(w[m]);n[a][i-1]=f("/"),n[a][i]=f("\\");for(let m=0;m<o;m++)n[a][i+1+m]=f(P[m]);n[a][i+o+1]=f("/"),n[s][1]=f("/");for(let m=0;m<o;m++)n[s][2+m]=f("¯");for(let m=0;m<o;m++)n[s][i+1+m]=f("¯");n[s][i+o+1]=f("\\");for(let m=l;m<=c;m++)n[m][0]=f("|"),n[m][r-1]=f("|");this.starfield.render(n,l,c,p,u),this.station&&this.station.render(n),y(n,c,p+1,"[C] CARGO","bright-black","black"),n[h][1]=f("\\");for(let m=0;m<o;m++)n[h][2+m]=f("_");for(let m=0;m<o;m++)n[h][i+1+m]=f("_");n[h][i+o+1]=f("/");const v="[T] TRAVEL",g=this.inSpace?"[ - ] DOCK":"[D] DOCK";let S=be(v,o),M=be(g,o);this.cursorIdx===0?S=">"+S.slice(1):this.inSpace||(M=">"+M.slice(1)),n[d][1]=f("/");for(let m=0;m<o;m++){const C=S[m];n[d][2+m]={char:C,fg:C===">"?"bright-green":"bright-yellow",bg:"black"}}n[d][i-1]=f("\\"),n[d][i]=f("/");for(let m=0;m<o;m++){const C=M[m];n[d][i+1+m]={char:C,fg:C===">"?"bright-green":this.inSpace?"bright-black":"bright-yellow",bg:"black"}}n[d][i+o+1]=f("\\")}}const Oe="CARGO HOLD";class di{constructor(n,t,r,i){this.activated=!1,this.player=r,n.onAction(o=>{this.activated||(o==="BACK"||o==="CARGO")&&(this.activated=!0,i())})}update(n){}render(n){const t=n.length,r=t>0?n[0].length:0;for(let h=0;h<t;h++)for(let d=0;d<r;d++)n[h][d]={char:" ",fg:"black",bg:"black"};F(n,1,Oe,"bright-white","black");const i=Math.max(0,Math.floor((r-Oe.length)/2));y(n,2,i,"'".repeat(Oe.length),"bright-black","black");const o=this.player.cargoHold,a=this.player.cargoCapacity,s=this.player.cargoWeightKg;if(o.length===0)F(n,Math.floor(t/2),"CARGO HOLD EMPTY","bright-black","black");else{let h=4;for(const p of o){if(h>=t-3)break;const u=Z(p.commodityId);if(!u)continue;const f=p.qty*u.weightKg,w=`  x${p.qty}  ${u.basePrice}CR  ${f}KG`,_=Math.max(6,r-4-w.length),k=u.name,v=`${k.length>_?k.slice(0,_):k}${w}`;y(n,h,2,v,"white","black"),h++}const d=t-4;d>3&&y(n,d,2,"-".repeat(r-4),"bright-black","black")}const l=t-3,c=`TOTAL: ${s}/${a}KG`;y(n,l,2,c,"bright-black","black"),y(n,t-1,2,"[ESC] BACK","bright-black","black")}}class ln extends Te{constructor(n,t,r,i,o,a,s){const l=we(r.systemId),c=Ln(r.driveId),h=[...l.destinations.map(u=>({label:z(u).name.toUpperCase(),disabled:u===r.destinationId,action:()=>i(u)})),{label:"FLY INTO SPACE",disabled:r.destinationId===null,action:a}],d=Ft(r.systemId).map(u=>{const f=u.from===r.systemId?u.to:u.from,w=we(f),_=u.stability.toUpperCase(),k=Math.ceil(On*u.distance*c.fuelEfficiency);return{label:`${w.name.toUpperCase()}  ${u.distance}LY  [${_}]`.slice(0,36),disabled:k>r.fuelL,action:()=>o(f)}}),p=[{label:"DESTINATIONS",items:h},{label:"JUMPS",items:d}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],n,t,r,[],p),this.onShip=s}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}const hi=["[. . .]","[: : :]","[* * *]"],cn=5e3;class ui{constructor(n,t){this.elapsed=0,this.arrived=!1,this.targetSystemName=n.toUpperCase(),this.onArrival=t}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=cn&&(this.arrived=!0,this.onArrival()))}render(n){const t=n.length,r=t>0?n[0].length:0;for(let l=0;l<t;l++)for(let c=0;c<r;c++)n[l][c]={char:" ",fg:"black",bg:"black"};const i=Math.floor(t/2),o=Math.floor(this.elapsed/500)%3,a=Math.ceil((cn-this.elapsed)/1e3),s=Math.max(1,Math.min(5,a));F(n,i-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),F(n,i-1,"DESTINATION:","bright-black","black"),F(n,i,this.targetSystemName,"bright-white","black"),F(n,i+2,hi[o],"bright-black","black"),F(n,i+4,`ARRIVING IN ${s}S`,"bright-black","black")}}const dn=2e3,pi=["[ —   ]","[  —  ]","[   — ]"];class hn{constructor(n,t,r){this.elapsed=0,this.arrived=!1,this.destinationName=n.toUpperCase(),this.onArrival=t,this.footerText=r??null}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=dn&&(this.arrived=!0,this.onArrival()))}render(n){const t=n.length,r=t>0?n[0].length:0;for(let c=0;c<t;c++)for(let h=0;h<r;h++)n[c][h]={char:" ",fg:"black",bg:"black"};const i=Math.floor(t/2),o=Math.floor(this.elapsed/300)%3,a=Math.ceil((dn-this.elapsed)/1e3),s=Math.max(1,Math.min(2,a));F(n,i-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),F(n,i-1,"HEADING TO:","bright-black","black"),F(n,i,this.destinationName,"bright-white","black"),F(n,i+2,pi[o],"bright-black","black");const l=this.footerText??`ARRIVING IN ${s}S`;F(n,i+4,l,"bright-black","black")}}class fi{constructor(n){const t=Rn(n.shipId);if(!t)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[]}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,t){const r=this._cargoHold.find(i=>i.commodityId===n);r?r.qty+=t:this._cargoHold.push({commodityId:n,qty:t})}removeCargo(n,t){const r=this._cargoHold.findIndex(i=>i.commodityId===n);r<0||(t!==void 0&&t<this._cargoHold[r].qty?this._cargoHold[r].qty-=t:this._cargoHold.splice(r,1))}get cargoWeightKg(){return Ut(this._cargoHold)}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}}const mi=100,gi=2*60*1e3;class yi{constructor(n,t,r){this.traderStockCache=new Map,this.renderer=n,this.input=t,this.context=r;const i=Nt(),o=Rn(i.startingShip);this.player=new fi({shipId:i.startingShip,driveId:o.defaultJumpDrive,credits:i.player.startingCredits,systemId:i.startingLocation.system,destinationId:i.startingLocation.destination}),this.currentScene=new en(this.input,this.context,this.player,()=>this.goToStory())}tick(n){const t=Math.min(n,mi),r=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(r),this.renderer.drawBuffer(r)}makeBuffer(){const n=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:n},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(n){const t=Date.now(),r=this.traderStockCache.get(n);if(r&&t-r.generatedAt<gi)return r.entries;const i=Dt(),o=4+Math.floor(Math.random()*3),a=[...i];for(let l=a.length-1;l>0;l--){const c=Math.floor(Math.random()*(l+1));[a[l],a[c]]=[a[c],a[l]]}const s=a.slice(0,o).map(l=>({commodityId:l.id,qty:1+Math.floor(Math.random()*8)}));return this.traderStockCache.set(n,{entries:s,generatedAt:t}),s}onBuy(n,t,r){if(t<=0)return;const i=r.findIndex(c=>c.commodityId===n);if(i<0)return;const o=r[i];if(t>o.qty)return;const a=Z(n);if(!a)return;const s=t*a.basePrice;this.player.credits<s||this.player.cargoWeightKg+t*a.weightKg>this.player.cargoCapacity||(this.player.spendCredits(s),this.player.addCargo(n,t),o.qty-=t,o.qty<=0&&r.splice(i,1))}onSell(n,t,r){if(t<=0)return;const i=this.player.cargoHold.find(l=>l.commodityId===n);if(!i||i.qty<t)return;const o=Z(n);if(!o)return;const a=t*o.basePrice;this.player.addCredits(a),this.player.removeCargo(n,t);const s=r.find(l=>l.commodityId===n);s?s.qty+=t:r.push({commodityId:n,qty:t})}goToMainMenu(){this.currentScene=new en(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new $t(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new Gt(this.input,this.context,this.player,this.player.destinationId,(n,t)=>{this.player.spendCredits(n),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToShip())}goToTrader(){const n=this.player.destinationId,t=this.getOrCreateTraderStock(n);this.currentScene=new Yt(this.input,this.context,this.player,n,t,(r,i)=>this.onBuy(r,i,t),(r,i)=>this.onSell(r,i,t),()=>this.goToStation(),()=>this.goToShip())}goToMissionBoard(){this.currentScene=new qt(this.input,this.context,this.player,this.player.destinationId,()=>this.goToStation(),()=>this.goToShip())}goToShip(){this.currentScene=new ci(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToStation(),()=>this.goToCargo())}goToCargo(){this.currentScene=new di(this.input,this.context,this.player,()=>this.goToShip())}goToTravelMenu(){this.currentScene=new ln(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip())}goToArrival(){this.currentScene=new ln(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip())}goToFlyIntoSpace(){this.player.undock(),this.currentScene=new hn("OPEN SPACE",()=>this.goToShip(),"LAUNCHING...")}onDestinationSelected(n){this.player.dock(n),this.currentScene=new hn(z(n).name,()=>this.goToShip())}onJumpSelected(n){const t=Pt(this.player.systemId,n),r=Ln(this.player.driveId),i=Math.ceil(On*t.distance*r.fuelEfficiency);this.player.consumeFuel(i),this.player.jumpTo(n);const o=we(n).name;this.currentScene=new ui(o,()=>this.goToArrival())}}const bi=`---
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
`,_i=`---
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
`,vi=`---
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
`,wi=`---
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
`,xi=`---
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
`,ki=`---
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
`,Ci=`---
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
`,Ai=`---
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
`,Ti=`---
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
`,Si=`---
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
`,Ii=`---
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
`,Ei=`---
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
`,Mi=`---
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
`,Li=`---
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
`,Ri=`---
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
`,Fi=`---
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
`,Oi=`---
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
`,Ni=`---
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
`,Pi=`---
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
`,Di=`---
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
`,Ui=`---
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
`,Hi=`---
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
`,Bi=`---
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
`,$i=`---
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
`,ji=`---
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
`,Gi=`---
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
`,Yi=`---
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
`,Wi=`---
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
`,Ki=`---
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
`,qi=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,zi=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,Vi=`---
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
`,Ji=`---
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
`,Xi=`---
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

Long range engines for faster than light travel between systems.`,Qi=`---
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
`,Zi=`---
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
`,er=`---
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
`,nr=`---
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
`,tr=`---
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
`,ir=`---
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
`,rr=`---
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
`,or=`---
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
`,ar=`---
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
`,sr=`---
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
`,lr=`---
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
`,cr=`---
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
`,dr=`---
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
`,hr=`---
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
`,ur=`---
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
`,pr=`---
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
`;var A={},ce={},N={};function Nn(e){return typeof e>"u"||e===null}function fr(e){return typeof e=="object"&&e!==null}function mr(e){return Array.isArray(e)?e:Nn(e)?[]:[e]}function gr(e,n){var t,r,i,o;if(n)for(o=Object.keys(n),t=0,r=o.length;t<r;t+=1)i=o[t],e[i]=n[i];return e}function yr(e,n){var t="",r;for(r=0;r<n;r+=1)t+=e;return t}function br(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}N.isNothing=Nn;N.isObject=fr;N.toArray=mr;N.repeat=yr;N.isNegativeZero=br;N.extend=gr;function se(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}se.prototype=Object.create(Error.prototype);se.prototype.constructor=se;se.prototype.toString=function(n){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!n&&this.mark&&(t+=" "+this.mark.toString()),t};var de=se,un=N;function je(e,n,t,r,i){this.name=e,this.buffer=n,this.position=t,this.line=r,this.column=i}je.prototype.getSnippet=function(n,t){var r,i,o,a,s;if(!this.buffer)return null;for(n=n||4,t=t||75,r="",i=this.position;i>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(i-1))===-1;)if(i-=1,this.position-i>t/2-1){r=" ... ",i+=5;break}for(o="",a=this.position;a<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(a))===-1;)if(a+=1,a-this.position>t/2-1){o=" ... ",a-=5;break}return s=this.buffer.slice(i,a),un.repeat(" ",n)+r+s+o+`
`+un.repeat(" ",n+this.position-i+r.length)+"^"};je.prototype.toString=function(n){var t,r="";return this.name&&(r+='in "'+this.name+'" '),r+="at line "+(this.line+1)+", column "+(this.column+1),n||(t=this.getSnippet(),t&&(r+=`:
`+t)),r};var _r=je,pn=de,vr=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],wr=["scalar","sequence","mapping"];function xr(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(r){n[String(r)]=t})}),n}function kr(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(vr.indexOf(t)===-1)throw new pn('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=xr(n.styleAliases||null),wr.indexOf(this.kind)===-1)throw new pn('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var E=kr,fn=N,_e=de,Cr=E;function Ue(e,n,t){var r=[];return e.include.forEach(function(i){t=Ue(i,n,t)}),e[n].forEach(function(i){t.forEach(function(o,a){o.tag===i.tag&&o.kind===i.kind&&r.push(a)}),t.push(i)}),t.filter(function(i,o){return r.indexOf(o)===-1})}function Ar(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,t;function r(i){e[i.kind][i.tag]=e.fallback[i.tag]=i}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(r);return e}function J(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new _e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=Ue(this,"implicit",[]),this.compiledExplicit=Ue(this,"explicit",[]),this.compiledTypeMap=Ar(this.compiledImplicit,this.compiledExplicit)}J.DEFAULT=null;J.create=function(){var n,t;switch(arguments.length){case 1:n=J.DEFAULT,t=arguments[0];break;case 2:n=arguments[0],t=arguments[1];break;default:throw new _e("Wrong number of arguments for Schema.create function")}if(n=fn.toArray(n),t=fn.toArray(t),!n.every(function(r){return r instanceof J}))throw new _e("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(r){return r instanceof Cr}))throw new _e("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new J({include:n,explicit:t})};var te=J,Tr=E,Sr=new Tr("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),Ir=E,Er=new Ir("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Mr=E,Lr=new Mr("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Rr=te,Ge=new Rr({explicit:[Sr,Er,Lr]}),Fr=E;function Or(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function Nr(){return null}function Pr(e){return e===null}var Dr=new Fr("tag:yaml.org,2002:null",{kind:"scalar",resolve:Or,construct:Nr,predicate:Pr,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),Ur=E;function Hr(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function Br(e){return e==="true"||e==="True"||e==="TRUE"}function $r(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var jr=new Ur("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Hr,construct:Br,predicate:$r,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),Gr=N,Yr=E;function Wr(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function Kr(e){return 48<=e&&e<=55}function qr(e){return 48<=e&&e<=57}function zr(e){if(e===null)return!1;var n=e.length,t=0,r=!1,i;if(!n)return!1;if(i=e[t],(i==="-"||i==="+")&&(i=e[++t]),i==="0"){if(t+1===n)return!0;if(i=e[++t],i==="b"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(i!=="0"&&i!=="1")return!1;r=!0}return r&&i!=="_"}if(i==="x"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(!Wr(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}for(;t<n;t++)if(i=e[t],i!=="_"){if(!Kr(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}if(i==="_")return!1;for(;t<n;t++)if(i=e[t],i!=="_"){if(i===":")break;if(!qr(e.charCodeAt(t)))return!1;r=!0}return!r||i==="_"?!1:i!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function Vr(e){var n=e,t=1,r,i,o=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),r=n[0],(r==="-"||r==="+")&&(r==="-"&&(t=-1),n=n.slice(1),r=n[0]),n==="0"?0:r==="0"?n[1]==="b"?t*parseInt(n.slice(2),2):n[1]==="x"?t*parseInt(n,16):t*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(a){o.unshift(parseInt(a,10))}),n=0,i=1,o.forEach(function(a){n+=a*i,i*=60}),t*n):t*parseInt(n,10)}function Jr(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!Gr.isNegativeZero(e)}var Xr=new Yr("tag:yaml.org,2002:int",{kind:"scalar",resolve:zr,construct:Vr,predicate:Jr,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),Pn=N,Qr=E,Zr=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function eo(e){return!(e===null||!Zr.test(e)||e[e.length-1]==="_")}function no(e){var n,t,r,i;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,i=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(o){i.unshift(parseFloat(o,10))}),n=0,r=1,i.forEach(function(o){n+=o*r,r*=60}),t*n):t*parseFloat(n,10)}var to=/^[-+]?[0-9]+e/;function io(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(Pn.isNegativeZero(e))return"-0.0";return t=e.toString(10),to.test(t)?t.replace("e",".e"):t}function ro(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||Pn.isNegativeZero(e))}var oo=new Qr("tag:yaml.org,2002:float",{kind:"scalar",resolve:eo,construct:no,predicate:ro,represent:io,defaultStyle:"lowercase"}),ao=te,Dn=new ao({include:[Ge],implicit:[Dr,jr,Xr,oo]}),so=te,Un=new so({include:[Dn]}),lo=E,Hn=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Bn=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function co(e){return e===null?!1:Hn.exec(e)!==null||Bn.exec(e)!==null}function ho(e){var n,t,r,i,o,a,s,l=0,c=null,h,d,p;if(n=Hn.exec(e),n===null&&(n=Bn.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],r=+n[2]-1,i=+n[3],!n[4])return new Date(Date.UTC(t,r,i));if(o=+n[4],a=+n[5],s=+n[6],n[7]){for(l=n[7].slice(0,3);l.length<3;)l+="0";l=+l}return n[9]&&(h=+n[10],d=+(n[11]||0),c=(h*60+d)*6e4,n[9]==="-"&&(c=-c)),p=new Date(Date.UTC(t,r,i,o,a,s,l)),c&&p.setTime(p.getTime()-c),p}function uo(e){return e.toISOString()}var po=new lo("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:co,construct:ho,instanceOf:Date,represent:uo}),fo=E;function mo(e){return e==="<<"||e===null}var go=new fo("tag:yaml.org,2002:merge",{kind:"scalar",resolve:mo});function $n(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var W;try{var yo=$n;W=yo("buffer").Buffer}catch{}var bo=E,Ye=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function _o(e){if(e===null)return!1;var n,t,r=0,i=e.length,o=Ye;for(t=0;t<i;t++)if(n=o.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;r+=6}return r%8===0}function vo(e){var n,t,r=e.replace(/[\r\n=]/g,""),i=r.length,o=Ye,a=0,s=[];for(n=0;n<i;n++)n%4===0&&n&&(s.push(a>>16&255),s.push(a>>8&255),s.push(a&255)),a=a<<6|o.indexOf(r.charAt(n));return t=i%4*6,t===0?(s.push(a>>16&255),s.push(a>>8&255),s.push(a&255)):t===18?(s.push(a>>10&255),s.push(a>>2&255)):t===12&&s.push(a>>4&255),W?W.from?W.from(s):new W(s):s}function wo(e){var n="",t=0,r,i,o=e.length,a=Ye;for(r=0;r<o;r++)r%3===0&&r&&(n+=a[t>>18&63],n+=a[t>>12&63],n+=a[t>>6&63],n+=a[t&63]),t=(t<<8)+e[r];return i=o%3,i===0?(n+=a[t>>18&63],n+=a[t>>12&63],n+=a[t>>6&63],n+=a[t&63]):i===2?(n+=a[t>>10&63],n+=a[t>>4&63],n+=a[t<<2&63],n+=a[64]):i===1&&(n+=a[t>>2&63],n+=a[t<<4&63],n+=a[64],n+=a[64]),n}function xo(e){return W&&W.isBuffer(e)}var ko=new bo("tag:yaml.org,2002:binary",{kind:"scalar",resolve:_o,construct:vo,predicate:xo,represent:wo}),Co=E,Ao=Object.prototype.hasOwnProperty,To=Object.prototype.toString;function So(e){if(e===null)return!0;var n=[],t,r,i,o,a,s=e;for(t=0,r=s.length;t<r;t+=1){if(i=s[t],a=!1,To.call(i)!=="[object Object]")return!1;for(o in i)if(Ao.call(i,o))if(!a)a=!0;else return!1;if(!a)return!1;if(n.indexOf(o)===-1)n.push(o);else return!1}return!0}function Io(e){return e!==null?e:[]}var Eo=new Co("tag:yaml.org,2002:omap",{kind:"sequence",resolve:So,construct:Io}),Mo=E,Lo=Object.prototype.toString;function Ro(e){if(e===null)return!0;var n,t,r,i,o,a=e;for(o=new Array(a.length),n=0,t=a.length;n<t;n+=1){if(r=a[n],Lo.call(r)!=="[object Object]"||(i=Object.keys(r),i.length!==1))return!1;o[n]=[i[0],r[i[0]]]}return!0}function Fo(e){if(e===null)return[];var n,t,r,i,o,a=e;for(o=new Array(a.length),n=0,t=a.length;n<t;n+=1)r=a[n],i=Object.keys(r),o[n]=[i[0],r[i[0]]];return o}var Oo=new Mo("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Ro,construct:Fo}),No=E,Po=Object.prototype.hasOwnProperty;function Do(e){if(e===null)return!0;var n,t=e;for(n in t)if(Po.call(t,n)&&t[n]!==null)return!1;return!0}function Uo(e){return e!==null?e:{}}var Ho=new No("tag:yaml.org,2002:set",{kind:"mapping",resolve:Do,construct:Uo}),Bo=te,he=new Bo({include:[Un],implicit:[po,go],explicit:[ko,Eo,Oo,Ho]}),$o=E;function jo(){return!0}function Go(){}function Yo(){return""}function Wo(e){return typeof e>"u"}var Ko=new $o("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:jo,construct:Go,predicate:Wo,represent:Yo}),qo=E;function zo(e){if(e===null||e.length===0)return!1;var n=e,t=/\/([gim]*)$/.exec(e),r="";return!(n[0]==="/"&&(t&&(r=t[1]),r.length>3||n[n.length-r.length-1]!=="/"))}function Vo(e){var n=e,t=/\/([gim]*)$/.exec(e),r="";return n[0]==="/"&&(t&&(r=t[1]),n=n.slice(1,n.length-r.length-1)),new RegExp(n,r)}function Jo(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function Xo(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var Qo=new qo("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:zo,construct:Vo,predicate:Xo,represent:Jo}),xe;try{var Zo=$n;xe=Zo("esprima")}catch{typeof window<"u"&&(xe=window.esprima)}var ea=E;function na(e){if(e===null)return!1;try{var n="("+e+")",t=xe.parse(n,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function ta(e){var n="("+e+")",t=xe.parse(n,{range:!0}),r=[],i;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(o){r.push(o.name)}),i=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(r,n.slice(i[0]+1,i[1]-1)):new Function(r,"return "+n.slice(i[0],i[1]))}function ia(e){return e.toString()}function ra(e){return Object.prototype.toString.call(e)==="[object Function]"}var oa=new ea("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:na,construct:ta,predicate:ra,represent:ia}),mn=te,Se=mn.DEFAULT=new mn({include:[he],explicit:[Ko,Qo,oa]}),B=N,jn=de,aa=_r,Gn=he,sa=Se,G=Object.prototype.hasOwnProperty,ke=1,Yn=2,Wn=3,Ce=4,Ne=1,la=2,gn=3,ca=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,da=/[\x85\u2028\u2029]/,ha=/[,\[\]\{\}]/,Kn=/^(?:!|!!|![a-z\-]+!)$/i,qn=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function yn(e){return Object.prototype.toString.call(e)}function U(e){return e===10||e===13}function K(e){return e===9||e===32}function O(e){return e===9||e===32||e===10||e===13}function X(e){return e===44||e===91||e===93||e===123||e===125}function ua(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function pa(e){return e===120?2:e===117?4:e===85?8:0}function fa(e){return 48<=e&&e<=57?e-48:-1}function bn(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function ma(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function zn(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var Vn=new Array(256),Jn=new Array(256);for(var V=0;V<256;V++)Vn[V]=bn(V)?1:0,Jn[V]=bn(V);function ga(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||sa,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function Xn(e,n){return new jn(n,new aa(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function b(e,n){throw Xn(e,n)}function Ae(e,n){e.onWarning&&e.onWarning.call(null,Xn(e,n))}var _n={YAML:function(n,t,r){var i,o,a;n.version!==null&&b(n,"duplication of %YAML directive"),r.length!==1&&b(n,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(r[0]),i===null&&b(n,"ill-formed argument of the YAML directive"),o=parseInt(i[1],10),a=parseInt(i[2],10),o!==1&&b(n,"unacceptable YAML version of the document"),n.version=r[0],n.checkLineBreaks=a<2,a!==1&&a!==2&&Ae(n,"unsupported YAML version of the document")},TAG:function(n,t,r){var i,o;r.length!==2&&b(n,"TAG directive accepts exactly two arguments"),i=r[0],o=r[1],Kn.test(i)||b(n,"ill-formed tag handle (first argument) of the TAG directive"),G.call(n.tagMap,i)&&b(n,'there is a previously declared suffix for "'+i+'" tag handle'),qn.test(o)||b(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[i]=o}};function j(e,n,t,r){var i,o,a,s;if(n<t){if(s=e.input.slice(n,t),r)for(i=0,o=s.length;i<o;i+=1)a=s.charCodeAt(i),a===9||32<=a&&a<=1114111||b(e,"expected valid JSON character");else ca.test(s)&&b(e,"the stream contains non-printable characters");e.result+=s}}function vn(e,n,t,r){var i,o,a,s;for(B.isObject(t)||b(e,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(t),a=0,s=i.length;a<s;a+=1)o=i[a],G.call(n,o)||(zn(n,o,t[o]),r[o]=!0)}function Q(e,n,t,r,i,o,a,s){var l,c;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),l=0,c=i.length;l<c;l+=1)Array.isArray(i[l])&&b(e,"nested arrays are not supported inside keys"),typeof i=="object"&&yn(i[l])==="[object Object]"&&(i[l]="[object Object]");if(typeof i=="object"&&yn(i)==="[object Object]"&&(i="[object Object]"),i=String(i),n===null&&(n={}),r==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)vn(e,n,o[l],t);else vn(e,n,o,t);else!e.json&&!G.call(t,i)&&G.call(n,i)&&(e.line=a||e.line,e.position=s||e.position,b(e,"duplicated mapping key")),zn(n,i,o),delete t[i];return n}function We(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):b(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function T(e,n,t){for(var r=0,i=e.input.charCodeAt(e.position);i!==0;){for(;K(i);)i=e.input.charCodeAt(++e.position);if(n&&i===35)do i=e.input.charCodeAt(++e.position);while(i!==10&&i!==13&&i!==0);if(U(i))for(We(e),i=e.input.charCodeAt(e.position),r++,e.lineIndent=0;i===32;)e.lineIndent++,i=e.input.charCodeAt(++e.position);else break}return t!==-1&&r!==0&&e.lineIndent<t&&Ae(e,"deficient indentation"),r}function Ie(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||O(t)))}function Ke(e,n){n===1?e.result+=" ":n>1&&(e.result+=B.repeat(`
`,n-1))}function ya(e,n,t){var r,i,o,a,s,l,c,h,d=e.kind,p=e.result,u;if(u=e.input.charCodeAt(e.position),O(u)||X(u)||u===35||u===38||u===42||u===33||u===124||u===62||u===39||u===34||u===37||u===64||u===96||(u===63||u===45)&&(i=e.input.charCodeAt(e.position+1),O(i)||t&&X(i)))return!1;for(e.kind="scalar",e.result="",o=a=e.position,s=!1;u!==0;){if(u===58){if(i=e.input.charCodeAt(e.position+1),O(i)||t&&X(i))break}else if(u===35){if(r=e.input.charCodeAt(e.position-1),O(r))break}else{if(e.position===e.lineStart&&Ie(e)||t&&X(u))break;if(U(u))if(l=e.line,c=e.lineStart,h=e.lineIndent,T(e,!1,-1),e.lineIndent>=n){s=!0,u=e.input.charCodeAt(e.position);continue}else{e.position=a,e.line=l,e.lineStart=c,e.lineIndent=h;break}}s&&(j(e,o,a,!1),Ke(e,e.line-l),o=a=e.position,s=!1),K(u)||(a=e.position+1),u=e.input.charCodeAt(++e.position)}return j(e,o,a,!1),e.result?!0:(e.kind=d,e.result=p,!1)}function ba(e,n){var t,r,i;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,r=i=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(j(e,r,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)r=e.position,e.position++,i=e.position;else return!0;else U(t)?(j(e,r,i,!0),Ke(e,T(e,!1,n)),r=i=e.position):e.position===e.lineStart&&Ie(e)?b(e,"unexpected end of the document within a single quoted scalar"):(e.position++,i=e.position);b(e,"unexpected end of the stream within a single quoted scalar")}function _a(e,n){var t,r,i,o,a,s;if(s=e.input.charCodeAt(e.position),s!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=r=e.position;(s=e.input.charCodeAt(e.position))!==0;){if(s===34)return j(e,t,e.position,!0),e.position++,!0;if(s===92){if(j(e,t,e.position,!0),s=e.input.charCodeAt(++e.position),U(s))T(e,!1,n);else if(s<256&&Vn[s])e.result+=Jn[s],e.position++;else if((a=pa(s))>0){for(i=a,o=0;i>0;i--)s=e.input.charCodeAt(++e.position),(a=ua(s))>=0?o=(o<<4)+a:b(e,"expected hexadecimal character");e.result+=ma(o),e.position++}else b(e,"unknown escape sequence");t=r=e.position}else U(s)?(j(e,t,r,!0),Ke(e,T(e,!1,n)),t=r=e.position):e.position===e.lineStart&&Ie(e)?b(e,"unexpected end of the document within a double quoted scalar"):(e.position++,r=e.position)}b(e,"unexpected end of the stream within a double quoted scalar")}function va(e,n){var t=!0,r,i=e.tag,o,a=e.anchor,s,l,c,h,d,p={},u,f,w,_;if(_=e.input.charCodeAt(e.position),_===91)l=93,d=!1,o=[];else if(_===123)l=125,d=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),_=e.input.charCodeAt(++e.position);_!==0;){if(T(e,!0,n),_=e.input.charCodeAt(e.position),_===l)return e.position++,e.tag=i,e.anchor=a,e.kind=d?"mapping":"sequence",e.result=o,!0;t||b(e,"missed comma between flow collection entries"),f=u=w=null,c=h=!1,_===63&&(s=e.input.charCodeAt(e.position+1),O(s)&&(c=h=!0,e.position++,T(e,!0,n))),r=e.line,ee(e,n,ke,!1,!0),f=e.tag,u=e.result,T(e,!0,n),_=e.input.charCodeAt(e.position),(h||e.line===r)&&_===58&&(c=!0,_=e.input.charCodeAt(++e.position),T(e,!0,n),ee(e,n,ke,!1,!0),w=e.result),d?Q(e,o,p,f,u,w):c?o.push(Q(e,null,p,f,u,w)):o.push(u),T(e,!0,n),_=e.input.charCodeAt(e.position),_===44?(t=!0,_=e.input.charCodeAt(++e.position)):t=!1}b(e,"unexpected end of the stream within a flow collection")}function wa(e,n){var t,r,i=Ne,o=!1,a=!1,s=n,l=0,c=!1,h,d;if(d=e.input.charCodeAt(e.position),d===124)r=!1;else if(d===62)r=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)Ne===i?i=d===43?gn:la:b(e,"repeat of a chomping mode identifier");else if((h=fa(d))>=0)h===0?b(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):a?b(e,"repeat of an indentation width identifier"):(s=n+h-1,a=!0);else break;if(K(d)){do d=e.input.charCodeAt(++e.position);while(K(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!U(d)&&d!==0)}for(;d!==0;){for(We(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!a||e.lineIndent<s)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!a&&e.lineIndent>s&&(s=e.lineIndent),U(d)){l++;continue}if(e.lineIndent<s){i===gn?e.result+=B.repeat(`
`,o?1+l:l):i===Ne&&o&&(e.result+=`
`);break}for(r?K(d)?(c=!0,e.result+=B.repeat(`
`,o?1+l:l)):c?(c=!1,e.result+=B.repeat(`
`,l+1)):l===0?o&&(e.result+=" "):e.result+=B.repeat(`
`,l):e.result+=B.repeat(`
`,o?1+l:l),o=!0,a=!0,l=0,t=e.position;!U(d)&&d!==0;)d=e.input.charCodeAt(++e.position);j(e,t,e.position,!1)}return!0}function wn(e,n){var t,r=e.tag,i=e.anchor,o=[],a,s=!1,l;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),l=e.input.charCodeAt(e.position);l!==0&&!(l!==45||(a=e.input.charCodeAt(e.position+1),!O(a)));){if(s=!0,e.position++,T(e,!0,-1)&&e.lineIndent<=n){o.push(null),l=e.input.charCodeAt(e.position);continue}if(t=e.line,ee(e,n,Wn,!1,!0),o.push(e.result),T(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&l!==0)b(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return s?(e.tag=r,e.anchor=i,e.kind="sequence",e.result=o,!0):!1}function xa(e,n,t){var r,i,o,a,s=e.tag,l=e.anchor,c={},h={},d=null,p=null,u=null,f=!1,w=!1,_;for(e.anchor!==null&&(e.anchorMap[e.anchor]=c),_=e.input.charCodeAt(e.position);_!==0;){if(r=e.input.charCodeAt(e.position+1),o=e.line,a=e.position,(_===63||_===58)&&O(r))_===63?(f&&(Q(e,c,h,d,p,null),d=p=u=null),w=!0,f=!0,i=!0):f?(f=!1,i=!0):b(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,_=r;else if(ee(e,t,Yn,!1,!0))if(e.line===o){for(_=e.input.charCodeAt(e.position);K(_);)_=e.input.charCodeAt(++e.position);if(_===58)_=e.input.charCodeAt(++e.position),O(_)||b(e,"a whitespace character is expected after the key-value separator within a block mapping"),f&&(Q(e,c,h,d,p,null),d=p=u=null),w=!0,f=!1,i=!1,d=e.tag,p=e.result;else if(w)b(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=s,e.anchor=l,!0}else if(w)b(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=s,e.anchor=l,!0;else break;if((e.line===o||e.lineIndent>n)&&(ee(e,n,Ce,!0,i)&&(f?p=e.result:u=e.result),f||(Q(e,c,h,d,p,u,o,a),d=p=u=null),T(e,!0,-1),_=e.input.charCodeAt(e.position)),e.lineIndent>n&&_!==0)b(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return f&&Q(e,c,h,d,p,null),w&&(e.tag=s,e.anchor=l,e.kind="mapping",e.result=c),w}function ka(e){var n,t=!1,r=!1,i,o,a;if(a=e.input.charCodeAt(e.position),a!==33)return!1;if(e.tag!==null&&b(e,"duplication of a tag property"),a=e.input.charCodeAt(++e.position),a===60?(t=!0,a=e.input.charCodeAt(++e.position)):a===33?(r=!0,i="!!",a=e.input.charCodeAt(++e.position)):i="!",n=e.position,t){do a=e.input.charCodeAt(++e.position);while(a!==0&&a!==62);e.position<e.length?(o=e.input.slice(n,e.position),a=e.input.charCodeAt(++e.position)):b(e,"unexpected end of the stream within a verbatim tag")}else{for(;a!==0&&!O(a);)a===33&&(r?b(e,"tag suffix cannot contain exclamation marks"):(i=e.input.slice(n-1,e.position+1),Kn.test(i)||b(e,"named tag handle cannot contain such characters"),r=!0,n=e.position+1)),a=e.input.charCodeAt(++e.position);o=e.input.slice(n,e.position),ha.test(o)&&b(e,"tag suffix cannot contain flow indicator characters")}return o&&!qn.test(o)&&b(e,"tag name cannot contain such characters: "+o),t?e.tag=o:G.call(e.tagMap,i)?e.tag=e.tagMap[i]+o:i==="!"?e.tag="!"+o:i==="!!"?e.tag="tag:yaml.org,2002:"+o:b(e,'undeclared tag handle "'+i+'"'),!0}function Ca(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&b(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!O(t)&&!X(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&b(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function Aa(e){var n,t,r;if(r=e.input.charCodeAt(e.position),r!==42)return!1;for(r=e.input.charCodeAt(++e.position),n=e.position;r!==0&&!O(r)&&!X(r);)r=e.input.charCodeAt(++e.position);return e.position===n&&b(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),G.call(e.anchorMap,t)||b(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],T(e,!0,-1),!0}function ee(e,n,t,r,i){var o,a,s,l=1,c=!1,h=!1,d,p,u,f,w;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=a=s=Ce===t||Wn===t,r&&T(e,!0,-1)&&(c=!0,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)),l===1)for(;ka(e)||Ca(e);)T(e,!0,-1)?(c=!0,s=o,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)):s=!1;if(s&&(s=c||i),(l===1||Ce===t)&&(ke===t||Yn===t?f=n:f=n+1,w=e.position-e.lineStart,l===1?s&&(wn(e,w)||xa(e,w,f))||va(e,f)?h=!0:(a&&wa(e,f)||ba(e,f)||_a(e,f)?h=!0:Aa(e)?(h=!0,(e.tag!==null||e.anchor!==null)&&b(e,"alias node should not have any properties")):ya(e,f,ke===t)&&(h=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(h=s&&wn(e,w))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&b(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,p=e.implicitTypes.length;d<p;d+=1)if(u=e.implicitTypes[d],u.resolve(e.result)){e.result=u.construct(e.result),e.tag=u.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else G.call(e.typeMap[e.kind||"fallback"],e.tag)?(u=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&u.kind!==e.kind&&b(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+u.kind+'", not "'+e.kind+'"'),u.resolve(e.result)?(e.result=u.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):b(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):b(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||h}function Ta(e){var n=e.position,t,r,i,o=!1,a;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(a=e.input.charCodeAt(e.position))!==0&&(T(e,!0,-1),a=e.input.charCodeAt(e.position),!(e.lineIndent>0||a!==37));){for(o=!0,a=e.input.charCodeAt(++e.position),t=e.position;a!==0&&!O(a);)a=e.input.charCodeAt(++e.position);for(r=e.input.slice(t,e.position),i=[],r.length<1&&b(e,"directive name must not be less than one character in length");a!==0;){for(;K(a);)a=e.input.charCodeAt(++e.position);if(a===35){do a=e.input.charCodeAt(++e.position);while(a!==0&&!U(a));break}if(U(a))break;for(t=e.position;a!==0&&!O(a);)a=e.input.charCodeAt(++e.position);i.push(e.input.slice(t,e.position))}a!==0&&We(e),G.call(_n,r)?_n[r](e,r,i):Ae(e,'unknown document directive "'+r+'"')}if(T(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,T(e,!0,-1)):o&&b(e,"directives end mark is expected"),ee(e,e.lineIndent-1,Ce,!1,!0),T(e,!0,-1),e.checkLineBreaks&&da.test(e.input.slice(n,e.position))&&Ae(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&Ie(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,T(e,!0,-1));return}if(e.position<e.length-1)b(e,"end of the stream or a document separator is expected");else return}function Qn(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new ga(e,n),r=e.indexOf("\0");for(r!==-1&&(t.position=r,b(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)Ta(t);return t.documents}function Zn(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var r=Qn(e,t);if(typeof n!="function")return r;for(var i=0,o=r.length;i<o;i+=1)n(r[i])}function et(e,n){var t=Qn(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new jn("expected a single document in the stream, but found more")}}function Sa(e,n,t){return typeof n=="object"&&n!==null&&typeof t>"u"&&(t=n,n=null),Zn(e,n,B.extend({schema:Gn},t))}function Ia(e,n){return et(e,B.extend({schema:Gn},n))}ce.loadAll=Zn;ce.load=et;ce.safeLoadAll=Sa;ce.safeLoad=Ia;var qe={},ue=N,pe=de,Ea=Se,Ma=he,nt=Object.prototype.toString,tt=Object.prototype.hasOwnProperty,La=9,le=10,Ra=13,Fa=32,Oa=33,Na=34,it=35,Pa=37,Da=38,Ua=39,Ha=42,rt=44,Ba=45,ot=58,$a=61,ja=62,Ga=63,Ya=64,at=91,st=93,Wa=96,lt=123,Ka=124,ct=125,L={};L[0]="\\0";L[7]="\\a";L[8]="\\b";L[9]="\\t";L[10]="\\n";L[11]="\\v";L[12]="\\f";L[13]="\\r";L[27]="\\e";L[34]='\\"';L[92]="\\\\";L[133]="\\N";L[160]="\\_";L[8232]="\\L";L[8233]="\\P";var qa=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function za(e,n){var t,r,i,o,a,s,l;if(n===null)return{};for(t={},r=Object.keys(n),i=0,o=r.length;i<o;i+=1)a=r[i],s=String(n[a]),a.slice(0,2)==="!!"&&(a="tag:yaml.org,2002:"+a.slice(2)),l=e.compiledTypeMap.fallback[a],l&&tt.call(l.styleAliases,s)&&(s=l.styleAliases[s]),t[a]=s;return t}function xn(e){var n,t,r;if(n=e.toString(16).toUpperCase(),e<=255)t="x",r=2;else if(e<=65535)t="u",r=4;else if(e<=4294967295)t="U",r=8;else throw new pe("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+ue.repeat("0",r-n.length)+n}function Va(e){this.schema=e.schema||Ea,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=ue.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=za(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function kn(e,n){for(var t=ue.repeat(" ",n),r=0,i=-1,o="",a,s=e.length;r<s;)i=e.indexOf(`
`,r),i===-1?(a=e.slice(r),r=s):(a=e.slice(r,i+1),r=i+1),a.length&&a!==`
`&&(o+=t),o+=a;return o}function He(e,n){return`
`+ue.repeat(" ",e.indent*n)}function Ja(e,n){var t,r,i;for(t=0,r=e.implicitTypes.length;t<r;t+=1)if(i=e.implicitTypes[t],i.resolve(n))return!0;return!1}function ze(e){return e===Fa||e===La}function ne(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function Xa(e){return ne(e)&&!ze(e)&&e!==65279&&e!==Ra&&e!==le}function Cn(e,n){return ne(e)&&e!==65279&&e!==rt&&e!==at&&e!==st&&e!==lt&&e!==ct&&e!==ot&&(e!==it||n&&Xa(n))}function Qa(e){return ne(e)&&e!==65279&&!ze(e)&&e!==Ba&&e!==Ga&&e!==ot&&e!==rt&&e!==at&&e!==st&&e!==lt&&e!==ct&&e!==it&&e!==Da&&e!==Ha&&e!==Oa&&e!==Ka&&e!==$a&&e!==ja&&e!==Ua&&e!==Na&&e!==Pa&&e!==Ya&&e!==Wa}function dt(e){var n=/^\n* /;return n.test(e)}var ht=1,ut=2,pt=3,ft=4,ve=5;function Za(e,n,t,r,i){var o,a,s,l=!1,c=!1,h=r!==-1,d=-1,p=Qa(e.charCodeAt(0))&&!ze(e.charCodeAt(e.length-1));if(n)for(o=0;o<e.length;o++){if(a=e.charCodeAt(o),!ne(a))return ve;s=o>0?e.charCodeAt(o-1):null,p=p&&Cn(a,s)}else{for(o=0;o<e.length;o++){if(a=e.charCodeAt(o),a===le)l=!0,h&&(c=c||o-d-1>r&&e[d+1]!==" ",d=o);else if(!ne(a))return ve;s=o>0?e.charCodeAt(o-1):null,p=p&&Cn(a,s)}c=c||h&&o-d-1>r&&e[d+1]!==" "}return!l&&!c?p&&!i(e)?ht:ut:t>9&&dt(e)?ve:c?ft:pt}function es(e,n,t,r){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&qa.indexOf(n)!==-1)return"'"+n+"'";var i=e.indent*Math.max(1,t),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-i),a=r||e.flowLevel>-1&&t>=e.flowLevel;function s(l){return Ja(e,l)}switch(Za(n,a,e.indent,o,s)){case ht:return n;case ut:return"'"+n.replace(/'/g,"''")+"'";case pt:return"|"+An(n,e.indent)+Tn(kn(n,i));case ft:return">"+An(n,e.indent)+Tn(kn(ns(n,o),i));case ve:return'"'+ts(n)+'"';default:throw new pe("impossible error: invalid scalar style")}}()}function An(e,n){var t=dt(e)?String(n):"",r=e[e.length-1]===`
`,i=r&&(e[e.length-2]===`
`||e===`
`),o=i?"+":r?"":"-";return t+o+`
`}function Tn(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function ns(e,n){for(var t=/(\n+)([^\n]*)/g,r=function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,t.lastIndex=c,Sn(e.slice(0,c),n)}(),i=e[0]===`
`||e[0]===" ",o,a;a=t.exec(e);){var s=a[1],l=a[2];o=l[0]===" ",r+=s+(!i&&!o&&l!==""?`
`:"")+Sn(l,n),i=o}return r}function Sn(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,r,i=0,o,a=0,s=0,l="";r=t.exec(e);)s=r.index,s-i>n&&(o=a>i?a:s,l+=`
`+e.slice(i,o),i=o+1),a=s;return l+=`
`,e.length-i>n&&a>i?l+=e.slice(i,a)+`
`+e.slice(a+1):l+=e.slice(i),l.slice(1)}function ts(e){for(var n="",t,r,i,o=0;o<e.length;o++){if(t=e.charCodeAt(o),t>=55296&&t<=56319&&(r=e.charCodeAt(o+1),r>=56320&&r<=57343)){n+=xn((t-55296)*1024+r-56320+65536),o++;continue}i=L[t],n+=!i&&ne(t)?e[o]:i||xn(t)}return n}function is(e,n,t){var r="",i=e.tag,o,a;for(o=0,a=t.length;o<a;o+=1)q(e,n,t[o],!1,!1)&&(o!==0&&(r+=","+(e.condenseFlow?"":" ")),r+=e.dump);e.tag=i,e.dump="["+r+"]"}function rs(e,n,t,r){var i="",o=e.tag,a,s;for(a=0,s=t.length;a<s;a+=1)q(e,n+1,t[a],!0,!0)&&((!r||a!==0)&&(i+=He(e,n)),e.dump&&le===e.dump.charCodeAt(0)?i+="-":i+="- ",i+=e.dump);e.tag=o,e.dump=i||"[]"}function os(e,n,t){var r="",i=e.tag,o=Object.keys(t),a,s,l,c,h;for(a=0,s=o.length;a<s;a+=1)h="",a!==0&&(h+=", "),e.condenseFlow&&(h+='"'),l=o[a],c=t[l],q(e,n,l,!1,!1)&&(e.dump.length>1024&&(h+="? "),h+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),q(e,n,c,!1,!1)&&(h+=e.dump,r+=h));e.tag=i,e.dump="{"+r+"}"}function as(e,n,t,r){var i="",o=e.tag,a=Object.keys(t),s,l,c,h,d,p;if(e.sortKeys===!0)a.sort();else if(typeof e.sortKeys=="function")a.sort(e.sortKeys);else if(e.sortKeys)throw new pe("sortKeys must be a boolean or a function");for(s=0,l=a.length;s<l;s+=1)p="",(!r||s!==0)&&(p+=He(e,n)),c=a[s],h=t[c],q(e,n+1,c,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&le===e.dump.charCodeAt(0)?p+="?":p+="? "),p+=e.dump,d&&(p+=He(e,n)),q(e,n+1,h,!0,d)&&(e.dump&&le===e.dump.charCodeAt(0)?p+=":":p+=": ",p+=e.dump,i+=p));e.tag=o,e.dump=i||"{}"}function In(e,n,t){var r,i,o,a,s,l;for(i=t?e.explicitTypes:e.implicitTypes,o=0,a=i.length;o<a;o+=1)if(s=i[o],(s.instanceOf||s.predicate)&&(!s.instanceOf||typeof n=="object"&&n instanceof s.instanceOf)&&(!s.predicate||s.predicate(n))){if(e.tag=t?s.tag:"?",s.represent){if(l=e.styleMap[s.tag]||s.defaultStyle,nt.call(s.represent)==="[object Function]")r=s.represent(n,l);else if(tt.call(s.represent,l))r=s.represent[l](n,l);else throw new pe("!<"+s.tag+'> tag resolver accepts not "'+l+'" style');e.dump=r}return!0}return!1}function q(e,n,t,r,i,o){e.tag=null,e.dump=t,In(e,t,!1)||In(e,t,!0);var a=nt.call(e.dump);r&&(r=e.flowLevel<0||e.flowLevel>n);var s=a==="[object Object]"||a==="[object Array]",l,c;if(s&&(l=e.duplicates.indexOf(t),c=l!==-1),(e.tag!==null&&e.tag!=="?"||c||e.indent!==2&&n>0)&&(i=!1),c&&e.usedDuplicates[l])e.dump="*ref_"+l;else{if(s&&c&&!e.usedDuplicates[l]&&(e.usedDuplicates[l]=!0),a==="[object Object]")r&&Object.keys(e.dump).length!==0?(as(e,n,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(os(e,n,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump));else if(a==="[object Array]"){var h=e.noArrayIndent&&n>0?n-1:n;r&&e.dump.length!==0?(rs(e,h,e.dump,i),c&&(e.dump="&ref_"+l+e.dump)):(is(e,h,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump))}else if(a==="[object String]")e.tag!=="?"&&es(e,e.dump,n,o);else{if(e.skipInvalid)return!1;throw new pe("unacceptable kind of an object to dump "+a)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function ss(e,n){var t=[],r=[],i,o;for(Be(e,t,r),i=0,o=r.length;i<o;i+=1)n.duplicates.push(t[r[i]]);n.usedDuplicates=new Array(o)}function Be(e,n,t){var r,i,o;if(e!==null&&typeof e=="object")if(i=n.indexOf(e),i!==-1)t.indexOf(i)===-1&&t.push(i);else if(n.push(e),Array.isArray(e))for(i=0,o=e.length;i<o;i+=1)Be(e[i],n,t);else for(r=Object.keys(e),i=0,o=r.length;i<o;i+=1)Be(e[r[i]],n,t)}function mt(e,n){n=n||{};var t=new Va(n);return t.noRefs||ss(e,t),q(t,0,e,!0,!0)?t.dump+`
`:""}function ls(e,n){return mt(e,ue.extend({schema:Ma},n))}qe.dump=mt;qe.safeDump=ls;var Ee=ce,gt=qe;function Me(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}A.Type=E;A.Schema=te;A.FAILSAFE_SCHEMA=Ge;A.JSON_SCHEMA=Dn;A.CORE_SCHEMA=Un;A.DEFAULT_SAFE_SCHEMA=he;A.DEFAULT_FULL_SCHEMA=Se;A.load=Ee.load;A.loadAll=Ee.loadAll;A.safeLoad=Ee.safeLoad;A.safeLoadAll=Ee.safeLoadAll;A.dump=gt.dump;A.safeDump=gt.safeDump;A.YAMLException=de;A.MINIMAL_SCHEMA=Ge;A.SAFE_SCHEMA=he;A.DEFAULT_SCHEMA=Se;A.scan=Me("scan");A.parse=Me("parse");A.compose=Me("compose");A.addConstructor=Me("addConstructor");var cs=A,ds=cs;function hs(e){if(!e.startsWith(`---
`))return{data:{},content:e};const n=e.indexOf(`
---`,4);if(n===-1)return{data:{},content:e};const t=e.slice(4,n),r=e.slice(n+4),i=r.startsWith(`
`)?r.slice(1):r;return{data:ds.safeLoad(t)??{},content:i}}function us(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[]};for(const[t,r]of Object.entries(e)){const i=t.split("/").pop()??"";if(i==="_template.md"||i===".gitkeep")continue;const{data:o,content:a}=hs(r);/^systems\/[^/]+\.md$/.test(t)?n.systems.push(ps(o,a)):/^destinations\/[^/]+\.md$/.test(t)?n.destinations.push(fs(o,a)):/^factions\/[^/]+\.md$/.test(t)?n.factions.push(ms(o,a)):/^ships\/[^/]+\.md$/.test(t)?n.ships.push(gs(o,a)):t==="ships/components/jump-drives.md"?n.drives=ys(o):t==="navigation/jump-routes.md"?n.routes=bs(o):t==="commodities.md"?n.commodities=_s(o):/^story\/[^/]+\.md$/.test(t)?n.storyBeats.push(vs(o,a)):t==="game-settings.md"&&(n.settings=ws(o))}return n}function Le(e){const n=[];let t=!1;for(const r of e.split(`
`)){const i=r.trim();if(!i.startsWith("#"))if(i===""){if(t)break}else t=!0,n.push(i)}return n.join(" ")}function ps(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economy:e.economy??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:Le(n)}}function fs(e,n){const t=e.amenities??{},r={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:r,npcs:e.npcs??{},goodsBias:e.goods_bias??[],dangerLevel:e.danger_level,tags:e.tags??[],description:Le(n)}}function ms(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:Le(n)}}function gs(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,tags:e.tags??[],description:Le(n)}}function ys(e){return(e.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function bs(e){return(e.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function _s(e){return(e.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function vs(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function ws(e){var n,t,r,i;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((t=e.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((r=e.starting_location)==null?void 0:r.system)??"",destination:((i=e.starting_location)==null?void 0:i.destination)??""},startingShip:e.starting_ship??""}}function xs(){const e=Object.assign({"/docs/world/commodities.md":bi,"/docs/world/destinations/_template.md":_i,"/docs/world/destinations/blackwake-yard.md":vi,"/docs/world/destinations/ceti-landfall.md":wi,"/docs/world/destinations/drift-market.md":xi,"/docs/world/destinations/elysium-station.md":ki,"/docs/world/destinations/eridani-anchorage.md":Ci,"/docs/world/destinations/foundries-platform.md":Ai,"/docs/world/destinations/galileo-transfer.md":Ti,"/docs/world/destinations/hestia-ring.md":Si,"/docs/world/destinations/keelhaul-station.md":Ii,"/docs/world/destinations/kepler-yard.md":Ei,"/docs/world/destinations/mars-anchor.md":Mi,"/docs/world/destinations/meridian-station.md":Li,"/docs/world/destinations/new-horizon-port.md":Ri,"/docs/world/destinations/orrery-anchorage.md":Fi,"/docs/world/destinations/redline-station.md":Oi,"/docs/world/destinations/tycho-orbital.md":Ni,"/docs/world/destinations/veil-station.md":Pi,"/docs/world/destinations/waypoint-ceti.md":Di,"/docs/world/factions/_template.md":Ui,"/docs/world/factions/centauri-trade-league.md":Hi,"/docs/world/factions/eridani-colonial-council.md":Bi,"/docs/world/factions/free-captains.md":$i,"/docs/world/factions/grey-market-cartel.md":ji,"/docs/world/factions/helios-directorate.md":Gi,"/docs/world/factions/independent-miners-guild.md":Yi,"/docs/world/factions/procyon-institute.md":Wi,"/docs/world/factions/terran-union.md":Ki,"/docs/world/galaxy-map.md":qi,"/docs/world/game-settings.md":zi,"/docs/world/navigation/jump-routes.md":Vi,"/docs/world/ships/_template.md":Ji,"/docs/world/ships/components/jump-drives.md":Xi,"/docs/world/ships/freighter.md":Qi,"/docs/world/ships/hauler.md":Zi,"/docs/world/ships/scout.md":er,"/docs/world/story/_template.md":nr,"/docs/world/story/enter-wolf-359.md":tr,"/docs/world/story/first-jump.md":ir,"/docs/world/story/opening-arrival.md":rr,"/docs/world/systems/_template.md":or,"/docs/world/systems/alpha-centauri.md":ar,"/docs/world/systems/barnards-star.md":sr,"/docs/world/systems/epsilon-eridani.md":lr,"/docs/world/systems/procyon.md":cr,"/docs/world/systems/sirius.md":dr,"/docs/world/systems/sol.md":hr,"/docs/world/systems/tau-ceti.md":ur,"/docs/world/systems/wolf-359.md":pr}),n={};for(const[t,r]of Object.entries(e)){const i=t.replace("/docs/world/","");n[i]=r}return us(n)}Rt(xs());const ks=navigator.maxTouchPoints>0?"touch":"keyboard",Cs=new URLSearchParams(window.location.search).has("debug"),yt={environment:"browser",primaryInput:ks,debug:Cs},As=new kt,bt=new St(yt);bt.connect();const Ts=new yi(As,bt,yt);let En=0;function _t(e){Ts.tick(e-En),En=e,requestAnimationFrame(_t)}requestAnimationFrame(_t);
