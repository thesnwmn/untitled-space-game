(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const se=40,_e=30,Gt=50,$e=24;function Wt(e){return e==="&"?"&amp;":e==="<"?"&lt;":e===">"?"&gt;":e}class Yt{constructor(){this.charW=0,this.charH=0,this.gridH=_e,this.resizeHandlers=[],this.debounceTimer=null,this.pre=document.createElement("pre"),this.pre.className="game-screen",this.pre.dataset.gridCols=String(se),this.pre.dataset.gridRows=String(_e),document.body.appendChild(this.pre);const n=()=>{this.measureChar(),this.applyScale()};Promise.all([document.fonts.ready,document.fonts.load(`${$e}px "Share Tech Mono"`).catch(()=>null)]).then(n),document.fonts.addEventListener("loadingdone",n),window.addEventListener("resize",()=>{this.debounceTimer!==null&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.applyScale(),100)})}measureChar(){const n=document.createElement("span");n.style.fontFamily="'Share Tech Mono', monospace",n.style.fontSize=`${$e}px`,n.style.lineHeight="1em",n.style.position="absolute",n.style.visibility="hidden",n.textContent="M",document.body.appendChild(n);const t=n.getBoundingClientRect();document.body.removeChild(n),this.charW=t.width,this.charH=t.height}applyScale(){if(this.charW<=0||this.charH<=0)return;const n=Math.min(window.innerWidth/(se*this.charW),window.innerHeight/(_e*this.charH)),t=Math.max(_e,Math.min(Gt,Math.floor(window.innerHeight/(this.charH*n))));if(this.pre.style.fontSize=`${$e*n}px`,this.pre.style.width=`${se*this.charW*n}px`,t!==this.gridH){this.gridH=t,this.pre.dataset.gridRows=String(t);for(const i of this.resizeHandlers)i(se,t)}}onResize(n){this.resizeHandlers.push(n)}drawBuffer(n){const t=[];for(const i of n){let r="";for(const o of i){const s=o.fg!=="transparent"?`fg-${o.fg}`:"",a=o.bg!=="transparent"?`bg-${o.bg}`:"",l=s&&a?`${s} ${a}`:s||a,c=l?` class="${l}"`:"";r+=`<span${c}>${Wt(o.char)}</span>`}t.push(r)}this.pre.innerHTML=t.join(`
`)}getWidth(){return se}getHeight(){return this.gridH}clear(){this.pre.innerHTML=""}}const Kt={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",PageUp:"PAGE_UP",PageDown:"PAGE_DOWN","[":"PAGE_UP","]":"PAGE_DOWN",Enter:"SELECT",Escape:"BACK",Tab:"TAB",p:"PAUSE",P:"PAUSE",c:"CARGO",C:"CARGO",1:"NAV_1",2:"NAV_2",3:"NAV_3",4:"NAV_4",5:"NAV_5",6:"NAV_6",7:"NAV_7",8:"NAV_8",9:"NAV_9"},qt=new Set(["0","1","2","3","4","5","6","7","8","9"]),zt=new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageUp","PageDown","Tab"]);class Vt{constructor(n){this.actionHandlers=[],this.tapHandlers=[],this.charInputHandlers=[],this.pointerStartMap=new Map,this.activePointers=new Set,this.keyListener=null,this.pointerDownListener=null,this.pointerUpListener=null,this.pointerCancelListener=null,this.debugEl=null,this.debugLog=[],this.debugMode=n.debug}logDebug(n){if(this.debugMode){if(this.debugLog.unshift(n),this.debugLog.length>8&&(this.debugLog.length=8),!this.debugEl){const t=document.createElement("div");t.style.cssText=["position:fixed","top:0","left:0","right:0","background:rgba(0,0,0,0.85)","color:#0f0","font-family:monospace","font-size:11px","padding:4px 6px","z-index:99999","pointer-events:none","white-space:pre","line-height:1.25"].join(";"),document.body.appendChild(t),this.debugEl=t}this.debugEl.textContent=this.debugLog.join(`
`)}}onAction(n){this.actionHandlers.push(n)}onTap(n){this.tapHandlers.push(n)}onCharInput(n){this.charInputHandlers.push(n)}connect(){this.keyListener=n=>{if(zt.has(n.key)&&n.preventDefault(),qt.has(n.key))for(const i of this.charInputHandlers.slice())i(n.key);if(n.key==="Backspace"||n.key==="Delete"){for(const i of this.charInputHandlers.slice())i("\b");return}const t=Kt[n.key];if(t)for(const i of this.actionHandlers.slice())i(t)},document.addEventListener("keydown",this.keyListener),this.pointerDownListener=n=>{n.preventDefault(),this.pointerStartMap.set(n.pointerId,{startX:n.clientX,startY:n.clientY}),this.activePointers.add(n.pointerId),this.logDebug(`DOWN id=${n.pointerId} (${Math.round(n.clientX)},${Math.round(n.clientY)}) type=${n.pointerType} active=${this.activePointers.size}`)},this.pointerUpListener=n=>{const t=this.pointerStartMap.get(n.pointerId),i=this.activePointers.size;if(this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId),!t){this.logDebug(`UP id=${n.pointerId} NO START`);return}const r=n.clientX-t.startX,o=n.clientY-t.startY,s=Math.abs(r),a=Math.abs(o);if(s<20&&a<20)if(i>=2){this.logDebug(`UP id=${n.pointerId} 2-finger tap -> BACK`),this.activePointers.clear(),this.pointerStartMap.clear();for(const l of this.actionHandlers.slice())l("BACK")}else{const l=this.getRectInfo(),c=this.getGridCoords(t.startX,t.startY);if(c){this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> col=${c.col} row=${c.row} h=${this.tapHandlers.length}`);for(const h of this.tapHandlers.slice())h(c.col,c.row)}else this.logDebug(`TAP (${Math.round(t.startX)},${Math.round(t.startY)}) rect=${l} -> OOB`)}else{let l;s>=a?l=r>0?"RIGHT":"LEFT":l=o>0?"DOWN":"UP",this.logDebug(`SWIPE dx=${Math.round(r)} dy=${Math.round(o)} -> ${l}`);for(const c of this.actionHandlers.slice())c(l)}},this.pointerCancelListener=n=>{this.logDebug(`CANCEL id=${n.pointerId}`),this.activePointers.delete(n.pointerId),this.pointerStartMap.delete(n.pointerId)},window.addEventListener("pointerdown",this.pointerDownListener),window.addEventListener("pointerup",this.pointerUpListener),window.addEventListener("pointercancel",this.pointerCancelListener)}disconnect(){this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.pointerDownListener&&(window.removeEventListener("pointerdown",this.pointerDownListener),this.pointerDownListener=null),this.pointerUpListener&&(window.removeEventListener("pointerup",this.pointerUpListener),this.pointerUpListener=null),this.pointerCancelListener&&(window.removeEventListener("pointercancel",this.pointerCancelListener),this.pointerCancelListener=null),this.pointerStartMap.clear(),this.activePointers.clear()}getRectInfo(){const n=document.querySelector(".game-screen");if(!n)return"NO PRE";const t=n.getBoundingClientRect();return`L${Math.round(t.left)},T${Math.round(t.top)},R${Math.round(t.right)},B${Math.round(t.bottom)}`}getGridCoords(n,t){const i=document.querySelector(".game-screen");if(!i)return null;const r=i.getBoundingClientRect(),o=parseInt(i.dataset.gridCols??"1"),s=parseInt(i.dataset.gridRows??"1");if(!o||!s||!r.width||!r.height)return null;const a=Math.floor((n-r.left)/(r.width/o)),l=Math.floor((t-r.top)/(r.height/s));return a<0||a>=o||l<0||l>=s?null:{col:a,row:l}}}function m(e,n,t,i,r,o){if(n<0||n>=e.length)return;const s=e[n];for(let a=0;a<i.length;a++){const l=t+a;l>=0&&l<s.length&&(s[l]={char:i[a],fg:r,bg:o})}}function k(e,n,t,i,r){if(n<0||n>=e.length)return;const o=e[n].length,s=Math.max(0,Math.floor((o-t.length)/2));m(e,n,s,t,i,r)}function Qn(e,n){const t=e.split(/\s+/).filter(Boolean),i=[];let r="";for(const o of t)r.length===0?r=o:r.length+1+o.length<=n?r+=" "+o:(i.push(r),r=o);return r.length>0&&i.push(r),i}const cn=["UNTITLED","SPACE GAME"],Xt=4,Jt=3,Qt="- An ASCII space adventure -",Zt=11,hn=16;class dn{constructor(n,t,i,r){this.cursorIdx=0,this.activated=!1,this.items=[{label:"NEW GAME",action:()=>{this.activated=!0,r()}}],t.environment==="terminal"&&this.items.push({label:"QUIT",action:()=>{console.log("[MainMenu] Quitting…"),process.exit(0)}}),n.onAction(o=>{this.activated||(o==="UP"?this.cursorIdx=(this.cursorIdx-1+this.items.length)%this.items.length:o==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%this.items.length:o==="SELECT"&&this.items[this.cursorIdx].action())}),n.onTap&&n.onTap((o,s)=>{if(!this.activated){for(let a=0;a<this.items.length;a++)if(s===hn+a){this.cursorIdx=a,this.items[a].action();return}}})}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let s=0;s<t;s++)for(let a=0;a<i;a++)n[s][a]={char:" ",fg:"black",bg:"black"};for(let s=0;s<cn.length;s++)k(n,Xt+s*Jt,cn[s],"bright-cyan","black");k(n,Zt,Qt,"white","black");const r=this.items.reduce((s,a)=>Math.max(s,a.label.length+2),0),o=Math.max(0,Math.floor((i-r)/2));for(let s=0;s<this.items.length;s++){const a=hn+s;if(a>=t)continue;const l=s===this.cursorIdx,c=l?"> ":"  ",h=l?"bright-green":"white";m(n,a,o,c+this.items[s].label,h,"black")}}}let Ke=null;function ei(e){Ke=e}function U(){if(Ke===null)throw new Error("World not initialised — call initWorld() before accessing world data");return Ke}function Ee(e){return U().systems.find(n=>n.id===e)}function j(e){return U().destinations.find(n=>n.id===e)}function Je(e){return U().routes.filter(n=>n.from===e||n.to===e)}function Zn(e){return U().drives.find(n=>n.id===e)}function ni(e){return U().storyBeats.filter(n=>n.trigger===e)}function ti(){return U().settings}function et(e){return U().ships.find(n=>n.id===e)}function Ae(e,n){return U().routes.find(t=>t.from===e&&t.to===n||t.from===n&&t.to===e)}function ne(e){return U().commodities.find(n=>n.id===e)}function ii(){return U().commodities}function ri(){return U().systems.filter(e=>e.playerKnowledge==="public")}function oi(e){return e.reduce((n,t)=>{const i=ne(t.commodityId);return n+t.qty*((i==null?void 0:i.weightKg)??0)},0)}const I=3;function nt(e,n){return n?e-2:e}function si(e){return e.toLocaleString("en-US")}class ue{constructor(n,t){this.buttonRanges=null,this.footerRow=-1,this.context=n,this.player=t}render(n,t){const i=n.length,r=i>0?n[0].length:0;this.footerRow=-1,this.buttonRanges=null,t.showHeader&&(this.renderHeaderRow0(n,r,t.systemLabel),this.renderHeaderRow1(n,r,t.destinationLabel)),t.showFooter&&(this.renderFooter(n,i,r,t.navOptions),this.footerRow=i-1)}renderHeaderRow0(n,t,i){const r=i!==void 0?i??"":(()=>{const c=Ee(this.player.systemId);return c?c.name.toUpperCase():this.player.systemId.toUpperCase()})(),o="::";m(n,0,0,o,"bright-black","black"),m(n,0,o.length,r,"bright-cyan","black");const a=t-o.length-r.length-10;let l=o.length+r.length;for(let c=0;c<a;c++)n[0][l+c]={char:":",fg:"bright-black",bg:"black"};l+=a,m(n,0,l,"[M]","white","black"),l+=3,m(n,0,l," MENU","white","black"),l+=5,m(n,0,l,"::","bright-black","black")}renderHeaderRow1(n,t,i){const r=i!==void 0?i??"":(()=>{const h=this.player.destinationId?j(this.player.destinationId):null;return h?h.name.toUpperCase():"IN SPACE"})(),o=si(this.player.credits),s=o.length+5,a="::";m(n,1,0,a,"bright-black","black"),m(n,1,a.length,r,"cyan","black");const l=t-a.length-r.length-s;let c=a.length+r.length;for(let h=0;h<l;h++)n[1][c+h]={char:":",fg:"bright-black",bg:"black"};c+=l,m(n,1,c,o,"green","black"),c+=o.length,m(n,1,c," CR","white","black"),c+=3,m(n,1,c,"::","bright-black","black")}renderFooter(n,t,i,r){const o=t-1,s=[];if(r.length===0){for(let l=0;l<i;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=[];return}m(n,o,0,"::","bright-black","black");let a=2;for(let l=0;l<r.length;l++){l>0&&(m(n,o,a,"::","bright-black","black"),a+=2);const c=r[l],h=`[${l+1}]`,d=` ${c.label}`,u=a;m(n,o,a,h,"white","black"),a+=h.length,m(n,o,a,d,"white","black"),a+=d.length,s.push({id:c.id,startCol:u,endCol:a})}for(let l=a;l<i;l++)n[o][l]={char:":",fg:"bright-black",bg:"black"};this.buttonRanges=s}hitTestNav(n,t){if(this.footerRow<0||this.buttonRanges===null||t!==this.footerRow)return null;for(const i of this.buttonRanges)if(n>=i.startCol&&n<i.endCol)return i.id;return null}}const ai=3,un=5;class li{constructor(n,t,i,r){this.activated=!1,this.pageIndex=0,this.onContinue=r,this.chrome=new ue(t,i);const s=ni("game-start")[0].text.split(`

`),a=s[0].trim();let l;/^YEAR\s+\d{4}$/.test(a)?(this.yearHeader=a,l=s.slice(1)):(this.yearHeader="",l=s);const c=[];for(let h=0;h<l.length;h++){const d=l[h].replace(/\n/g," "),u=Qn(d,36);h>0&&c.push(""),c.push(...u)}this.bodyLines=c,n.onAction(h=>{this.activated||(h==="SELECT"?(this.activated=!0,this.onContinue()):h==="LEFT"?this.pageIndex>0&&this.pageIndex--:h==="RIGHT"&&this.pageIndex++)}),n.onTap&&n.onTap((h,d)=>{this.activated||(this.activated=!0,this.onContinue())})}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let d=0;d<t;d++)for(let u=0;u<i;u++)n[d][u]={char:" ",fg:"black",bg:"black"};if(this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:[]}),this.yearHeader){const d=Math.max(0,Math.floor((i-this.yearHeader.length)/2));m(n,ai,d,this.yearHeader,"bright-yellow","black")}const o=t-3-un,s=Math.max(1,Math.ceil(this.bodyLines.length/o));this.pageIndex>=s&&(this.pageIndex=s-1);const a=s>1,l=this.pageIndex*o,c=Math.min(l+o,this.bodyLines.length);let h=un;for(let d=l;d<c;d++){const u=this.bodyLines[d];u!==""&&m(n,h,2,u,"white","black"),h++}if(a){const d=`< ${this.pageIndex+1}/${s} >`,u=i-9;m(n,t-3,u,d,"bright-black","black")}}}const tt=5,ae=10;class Fe{constructor(n,t,i,r,o,s,a=[],l=null){this.activeTabIdx=0,this.cursorIdx=-1,this.pageIndex=0,this.lastPageCount=1,this.activated=!1,this.modal=null,this.title=n,this._staticItems=t,this.tabs=l,this.context=o,this.player=s,this.chrome=new ue(o,s),this.navOptions=i,this.infoLines=a,this.itemStartRow=l!==null?I+5:I+3+a.length,r.onCharInput&&r.onCharInput(c=>{this.modal!==null&&this.modal.handleCharInput(c)}),r.onAction(c=>{if(this.modal!==null){this.modal.handleAction(c);return}this.activated||(c==="UP"?this.moveCursor(-1):c==="DOWN"?this.moveCursor(1):c==="LEFT"&&this.tabs!==null?(this.activeTabIdx=Math.max(0,this.activeTabIdx-1),this.resetCursor()):c==="RIGHT"&&this.tabs!==null?(this.activeTabIdx=Math.min(this.tabs.length-1,this.activeTabIdx+1),this.resetCursor()):c==="PAGE_UP"?(this.pageIndex=(this.pageIndex-1+this.lastPageCount)%this.lastPageCount,this.resetCursor()):c==="PAGE_DOWN"?(this.pageIndex=(this.pageIndex+1)%this.lastPageCount,this.resetCursor()):c==="SELECT"?this.activateCurrent():this.handleNavAction(c))}),this.resetCursor(),r.onTap&&r.onTap((c,h)=>{if(this.modal!==null){this.modal.handleTap(c,h);return}if(this.activated)return;const d=this.chrome.hitTestNav(c,h);if(d!==null){this.handleNavTap(d);return}if(this.tabs!==null&&h===I+3){let p=3;for(let f=0;f<this.tabs.length;f++){const _=this.tabs[f].label.length+2;if(c>=p&&c<p+_){this.activeTabIdx=f,this.resetCursor();return}p+=_+1}}const u=this.rowToVisibleItemIndex(h);u!==null&&!this.items[u].disabled&&(this.cursorIdx=u,this.activateCurrent())})}get items(){var n;return this.tabs!==null?((n=this.tabs[this.activeTabIdx])==null?void 0:n.items)??[]:this._staticItems}moveCursor(n){const t=this.items,i=t.length;if(i===0)return;const r=this.cursorIdx===-1?n>0?i-1:0:this.cursorIdx;for(let o=0;o<i;o++){const s=((r+n*(o+1))%i+i)%i;if(!t[s].disabled){this.cursorIdx=s;return}}}activateCurrent(){if(this.items.length===0||this.cursorIdx===-1)return;const n=this.items[this.cursorIdx];n.disabled||(this.activated=!0,n.action())}rowToVisibleItemIndex(n){var r;let t=this.itemStartRow;const i=this.items;for(let o=0;o<i.length;o++){const s=1+(((r=i[o].details)==null?void 0:r.length)??0);if(n>=t&&n<t+s)return o;t+=s}return null}resetCursor(){const n=this.items;for(let t=0;t<n.length;t++)if(!n[t].disabled){this.cursorIdx=t;return}this.cursorIdx=-1}handleNavAction(n){}handleNavTap(n){}openModal(n){this.modal=n}closeModal(){this.modal=null}buildChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:this.navOptions}}update(n){}render(n){var M;const t=n.length,i=t>0?n[0].length:0;for(let w=0;w<t;w++)for(let g=0;g<i;g++)n[w][g]={char:" ",fg:"black",bg:"black"};const r=this.buildChromeConfig();this.chrome.render(n,r),m(n,I,2,this.title,"bright-white","black"),m(n,I+1,2,"'".repeat(this.title.length),"bright-black","black");for(let w=0;w<this.infoLines.length;w++)m(n,I+2+w,2,this.infoLines[w],"bright-black","black");if(this.tabs!==null){const w=I+3;let g=2;n[w][g]={char:"|",fg:"bright-black",bg:"black"},g++;for(let T=0;T<this.tabs.length;T++){const A=T===this.activeTabIdx,y=` ${this.tabs[T].label} `,S=A?"black":"white",R=A?"green":"black";for(const N of y)g<i&&(n[w][g]={char:N,fg:S,bg:R}),g++;g<i&&(n[w][g]={char:"|",fg:"bright-black",bg:"black"}),g++}}const s=nt(t,r.showFooter)-1,a=s-this.itemStartRow,l=this.items,c=l.map(w=>{var g;return 1+(((g=w.details)==null?void 0:g.length)??0)}),d=c.reduce((w,g)=>w+g,0)>a,u=d?a-1:a,p=[];let f=[],_=0;for(let w=0;w<c.length;w++)_+c[w]>u?(f.length>0&&p.push(f),f=[w],_=c[w]):(f.push(w),_+=c[w]);f.length>0&&p.push(f),this.lastPageCount=Math.max(1,p.length),this.pageIndex>=this.lastPageCount&&(this.pageIndex=this.lastPageCount-1);const v=p[this.pageIndex]??[];let x=this.itemStartRow;for(const w of v){const g=l[w],T=w===this.cursorIdx,A=g.disabled?"bright-black":T?"bright-green":"white",y=g.infoFg??A,S=i-4;if(g.icon!==void 0){const R=g.icon.length;if(m(n,x,2,T?">":" ",A,"black"),m(n,x,3,g.icon,g.iconFg??A,"black"),g.info!==void 0){const be=Math.max(1,S-1-R-g.label.length-2-g.info.length);m(n,x,3+R,g.label+" ",A,"black"),m(n,x,3+R+g.label.length+1,".".repeat(be),"bright-black","black"),m(n,x,3+R+g.label.length+1+be+1,g.info,y,"black")}else m(n,x,3+R,g.label.slice(0,S-1-R),A,"black")}else if(g.info!==void 0){const R=T?"> ":"  ",N=Math.max(1,S-2-g.label.length-2-g.info.length);m(n,x,2,R+g.label+" ",A,"black"),m(n,x,2+R.length+g.label.length+1,".".repeat(N),"bright-black","black"),m(n,x,2+R.length+g.label.length+1+N+1,g.info,y,"black")}else if(g.details!==void 0&&g.details.length>0){m(n,x,2,((T?"> ":"  ")+g.label).slice(0,S),A,"black");for(let N=0;N<g.details.length;N++)x+1+N<=s&&m(n,x+1+N,2,("  "+g.details[N]).slice(0,S),"bright-black","black")}else m(n,x,2,((T?"> ":"  ")+g.label).slice(0,S),A,"black");x+=1+(((M=g.details)==null?void 0:M.length)??0)}if(d){const w=`${this.pageIndex+1}/${this.lastPageCount}`,g=s;m(n,g,0,"|<|","white","black");const T=Math.floor((i-w.length)/2);m(n,g,T,w,"bright-black","black"),m(n,g,i-3,"|>|","white","black")}this.modal!==null&&this.modal.render(n)}}const ci=30;class qe{constructor(n){this.focus="field",this.replaceNextDigit=!0,this.confirmRect=null,this.cancelRect=null,this.formDef=n,this.value=Math.max(n.field.min,Math.min(n.field.max,n.field.initialValue))}handleAction(n){const{field:t}=this.formDef;if(n==="BACK"){this.formDef.onCancel();return}if(this.focus==="field"){if(n==="UP"){this.value=Math.min(t.max,this.value+1);return}if(n==="DOWN"){this.value=Math.max(t.min,this.value-1);return}if(n==="RIGHT"){this.value=Math.min(t.max,this.value+10);return}if(n==="LEFT"){this.value=Math.max(t.min,this.value-10);return}}if(n==="TAB"){this.focus==="field"?this.focus="confirm":this.focus==="confirm"?this.focus="cancel":this.focus="field";return}n==="SELECT"&&(this.focus==="cancel"?this.formDef.onCancel():this.formDef.onConfirm(this.value))}handleCharInput(n){if(this.focus!=="field")return;const{field:t}=this.formDef;if(n==="\b")this.value=Math.floor(this.value/10),this.value===0&&(this.replaceNextDigit=!0);else if(n>="0"&&n<="9"){const i=parseInt(n,10);this.replaceNextDigit?(this.value=Math.max(t.min,Math.min(t.max,i)),this.replaceNextDigit=!1):this.value=Math.min(t.max,this.value*10+i)}}handleTap(n,t){this.confirmRect&&t===this.confirmRect.row&&n>=this.confirmRect.col&&n<this.confirmRect.col+this.confirmRect.width?this.formDef.onConfirm(this.value):this.cancelRect&&t===this.cancelRect.row&&n>=this.cancelRect.col&&n<this.cancelRect.col+this.cancelRect.width&&this.formDef.onCancel()}render(n){const t=n.length,i=t>0?n[0].length:0,{title:r,field:o,derivedRows:s,confirmLabel:a}=this.formDef,l=s.length,c=8+l,h=ci,d=Math.floor((i-h)/2),u=Math.floor((t-c)/2);for(let C=0;C<c;C++)for(let H=0;H<h;H++){const G=u+C,oe=d+H;G>=0&&G<t&&oe>=0&&oe<i&&(n[G][oe]={char:" ",fg:"white",bg:"black"})}const p=(C,H,G)=>{C>=0&&C<t&&H>=0&&H<i&&(n[C][H]={char:G,fg:"white",bg:"black"})};p(u,d,"+"),p(u,d+h-1,"+");for(let C=1;C<h-1;C++)p(u,d+C,"-");p(u+c-1,d,"+"),p(u+c-1,d+h-1,"+");for(let C=1;C<h-1;C++)p(u+c-1,d+C,"-");for(let C=1;C<c-1;C++)p(u+C,d,"|"),p(u+C,d+h-1,"|");const f=h-2,_=u+1,v=d+1+Math.floor((f-r.length)/2);m(n,_,v,r,"bright-white","black"),m(n,u+2,v,"'".repeat(r.length),"bright-black","black");const x=[o.label,...s.map(C=>C.label)],M=Math.max(...x.map(C=>C.length)),w=d+1+M+3,g=u+4,T=this.focus==="field";m(n,g,d+1,o.label.padEnd(M)+" : ","white","black");const A=this.value.toString().padStart(5);m(n,g,w,A,T?"black":"white",T?"green":"black");for(let C=0;C<l;C++){const H=s[C],G=u+5+C,oe=H.compute(this.value);m(n,G,d+1,H.label.padEnd(M)+" : ","white","black"),m(n,G,w,oe,"white","black")}const y=u+4+l+2,S=`[ ${a} ]`,R="[ CANCEL ]",N=3,be=S.length+N+R.length,jt=Math.floor((f-be)/2),Be=d+1+jt,sn=Be+S.length+N;this.confirmRect={col:Be,row:y,width:S.length},this.cancelRect={col:sn,row:y,width:R.length};const an=this.focus==="confirm",ln=this.focus==="cancel";m(n,y,Be,S,an?"black":"white",an?"green":"black"),m(n,y,sn,R,ln?"black":"white",ln?"green":"black")}}class hi extends Fe{constructor(n,t,i,r,o,s,a,l){const c=j(r),h=[];c.amenities.trader&&h.push({label:"TRADER",action:s}),c.amenities.missionBoard&&h.push({label:"MISSION BOARD",action:a});const d=i.fuelCapacityL-i.fuelL,u=Math.floor(i.credits/ae),p=Math.min(d,u);let f=null;if(c.amenities.fuel&&p>0){const w=p*ae;f=h.length,h.push({label:`BUY FUEL  +${p}L  ${w}CR`,action:()=>{}})}const _=Qn(c.description,36).slice(0,3),v=`DANGER: ${c.dangerLevel.toUpperCase()}`,x=[..._,v],M=c.locationType==="surface"||c.locationType==="asteroid"?"TAKE OFF":"UNDOCK";super("HUB",h,[{id:"undock",label:M}],n,t,i,x),this.onShip=l,this.onRefuel=o,this.fuelItemIdx=f}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx===-1)return;const t=n[this.cursorIdx];if(!t.disabled){if(this.fuelItemIdx!==null&&this.cursorIdx===this.fuelItemIdx){this.activated=!0;const i=this.player.fuelCapacityL-this.player.fuelL,r=Math.floor(this.player.credits/ae),o=Math.min(i,r);this.openModal(new qe({title:"BUY FUEL",field:{label:"Litres",initialValue:o,min:0,max:o},derivedRows:[{label:"Cost",compute:s=>`${s*ae} CR`}],confirmLabel:"BUY",onConfirm:s=>{this.closeModal(),s>0&&this.onRefuel(s*ae,s)},onCancel:()=>{this.closeModal(),this.activated=!1}}));return}this.activated=!0,t.action()}}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="undock"&&!this.activated&&(this.activated=!0,this.onShip())}}class di extends Fe{constructor(n,t,i,r,o,s,a,l,c){var p;const d=((p=j(r).npcs.trader)==null?void 0:p.toUpperCase())??"TRADER",u=[{label:"BUY",items:[]},{label:"SELL",items:[]}];super(d,[],[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,i,[],u),this.traderStock=o,this.onBuy=s,this.onSell=a,this.onHub=l,this.onUndock=c,this.syncItems(),this.clampCursor()}buildBuyItems(){return this.traderStock.length===0?[{label:"NO STOCK AVAILABLE",disabled:!0,action:()=>{}}]:this.traderStock.flatMap(n=>{const t=ne(n.commodityId);if(!t)return[];const i=this.player.credits>=t.basePrice;return[{label:`${t.name} (x${n.qty})`,info:`${t.basePrice} CR`,disabled:!i,action:()=>{const r=Math.floor(this.player.credits/t.basePrice),o=Math.min(n.qty,r);this.openModal(new qe({title:t.name.toUpperCase(),field:{label:"Quantity",initialValue:o,min:0,max:o},derivedRows:[{label:"Total",compute:s=>`${s*t.basePrice} CR`}],confirmLabel:"BUY",onConfirm:s=>{s>0&&this.onBuy(n.commodityId,s),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]})}buildSellItems(){const n=this.player.cargoHold;return n.length===0?[{label:"CARGO HOLD EMPTY",disabled:!0,action:()=>{}}]:[...n].flatMap(t=>{const i=ne(t.commodityId);return i?[{label:`${i.name} (x${t.qty})`,info:`${i.basePrice} CR`,action:()=>{this.openModal(new qe({title:i.name.toUpperCase(),field:{label:"Quantity",initialValue:t.qty,min:0,max:t.qty},derivedRows:[{label:"Total",compute:r=>`${r*i.basePrice} CR`}],confirmLabel:"SELL",onConfirm:r=>{r>0&&this.onSell(t.commodityId,r),this.syncItems(),this.clampCursor(),this.closeModal()},onCancel:()=>this.closeModal()}))}}]:[]})}syncItems(){this.tabs&&(this.tabs[0].items=this.buildBuyItems(),this.tabs[1].items=this.buildSellItems())}clampCursor(){var t;const n=this.items;(this.cursorIdx<0||this.cursorIdx>=n.length||(t=n[this.cursorIdx])!=null&&t.disabled)&&(this.cursorIdx=n.findIndex(i=>!i.disabled))}activateCurrent(){const n=this.items;if(n.length===0||this.cursorIdx<0||this.cursorIdx>=n.length)return;const t=n[this.cursorIdx];t.disabled||t.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}render(n){this.syncItems(),super.render(n);const t=n.length,i=`HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`,r=nt(t,!0)-2;m(n,r,2,i,"bright-black","black")}}const ui=[{id:"M001",type:"rescue",title:"Find the Lost Crew",reward:500},{id:"M002",type:"delivery",title:"Deliver Fuel Core",reward:300},{id:"M003",type:"combat",title:"Clear Pirate Outpost",reward:750},{id:"M004",type:"salvage",title:"Salvage Station Debris",reward:400},{id:"M005",type:"rescue",title:"Rescue Stranded Vessel",reward:600},{id:"M006",type:"delivery",title:"Transport Supplies",reward:250},{id:"M007",type:"combat",title:"Eliminate Smugglers",reward:800}],pi={rescue:"[R] ",delivery:"[D] ",combat:"[C] ",salvage:"[S] "};class fi extends Fe{constructor(n,t,i,r,o,s){j(r);const a=ui.map(l=>({label:l.title,icon:pi[l.type],iconFg:"bright-yellow",info:`${l.reward} CR`,infoFg:"bright-green",action:()=>console.log(`[MissionBoard] Selected: ${l.title}`)}));super("MISSION BOARD",a,[{id:"undock",label:"UNDOCK"},{id:"hub",label:"HUB"}],n,t,i),this.onHub=o,this.onUndock=s}activateCurrent(){if(this.items.length===0)return;const n=this.items[this.cursorIdx];n.disabled||n.action()}handleNavAction(n){(n==="BACK"||n==="NAV_2")&&!this.activated?(this.activated=!0,this.onHub()):n==="NAV_1"&&!this.activated&&(this.activated=!0,this.onUndock())}handleNavTap(n){n==="hub"&&!this.activated?(this.activated=!0,this.onHub()):n==="undock"&&!this.activated&&(this.activated=!0,this.onUndock())}}const mi=[18,10,5],gi=[".","*","+"],pn=[4e3,2e3,800],yi=[9e3,5e3,2500],bi=[null,"bright-black","white"],_i=["bright-black","white","bright-white"],vi=["white","bright-white","bright-cyan"],ve=3,fn=25,we=2,mn=37,gn=2*Math.PI;function wi(e){let n=e>>>0;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}class xi{constructor(n=42){this.boundsSet=!1,this.rand=wi(n),this.stars=[];for(let t=0;t<3;t++)for(let i=0;i<mi[t];i++){const r=we+Math.floor(this.rand()*(mn-we+1)),o=ve+Math.floor(this.rand()*(fn-ve+1)),s=this.rand()*gn,a=pn[t]+this.rand()*(yi[t]-pn[t]);this.stars.push({col:r,row:o,layer:t,twinklePhase:s,twinklePeriod:a})}}update(n){for(const t of this.stars)t.twinklePhase+=gn/t.twinklePeriod*n}render(n,t,i,r,o){if(!this.boundsSet){this.boundsSet=!0;const s=fn-ve,a=mn-we;{const l=(i-t)/s,c=(o-r)/a;for(const h of this.stars)h.row=Math.round(t+(h.row-ve)*l),h.col=Math.round(r+(h.col-we)*c)}}for(const s of this.stars){const{row:a,col:l,layer:c}=s;if(a<t||a>i||l<r||l>o)continue;const h=Math.sin(s.twinklePhase);let d;h>=.5?d=vi[c]:h>=-.5?d=_i[c]:d=bi[c],d!==null&&(n[a][l]={char:gi[c],fg:d,bg:"black"})}}getStars(){return this.stars}}const ki=2,Ci=3,Ti=2*Math.PI/9e3,Ai=2*Math.PI/12e3,Si=Math.PI/3;function yn(e,n,t){return Math.max(n,Math.min(t,e))}class Ii{constructor(n,t,i,r,o){this.time=0,this.def=n,this.intRowStart=t,this.intRowEnd=i,this.intColStart=r,this.intColEnd=o,this.glyphHeight=n.glyph.rows.length,this.glyphWidth=Math.max(...n.glyph.rows.map(s=>s.length)),this.anchorRow=t+Math.floor((i-t)/2)-Math.floor(this.glyphHeight/2),this.anchorCol=r+Math.floor((o-r)*.6)-Math.floor(this.glyphWidth/2)}update(n){this.time+=n}getDisplayPosition(){const n=Math.round(ki*Math.sin(this.time*Ti)),t=Math.round(Ci*Math.sin(this.time*Ai+Si)),i=yn(this.anchorRow+n,this.intRowStart,this.intRowEnd-this.glyphHeight+1),r=yn(this.anchorCol+t,this.intColStart,this.intColEnd-this.glyphWidth+1);return{row:i,col:r}}render(n){const{row:t,col:i}=this.getDisplayPosition(),r=this.def.glyph.fg;for(let o=0;o<this.def.glyph.rows.length;o++){const s=this.def.glyph.rows[o];for(let a=0;a<s.length;a++){const l=s[a];if(l===" ")continue;const c=t+o,h=i+a;c>=0&&c<n.length&&h>=0&&h<n[c].length&&(n[c][h]={char:l,fg:r,bg:"black"})}}}}const ce={BEACON:{name:"BEACON",glyph:{rows:["[*]"," | "],fg:"bright-yellow"}},RELAY:{name:"RELAY",glyph:{rows:[">---<"," |*|","  |"],fg:"bright-yellow"}},RING:{name:"RING",glyph:{rows:["/-\\","|O|","\\-/"],fg:"cyan"}},HUB:{name:"HUB",glyph:{rows:["  *  ","--+--"," [H] ","  |  ","  *  "],fg:"white"}}};function xe(e,n){if(e.length>=n)return e.slice(0,n);const t=n-e.length,i=Math.floor(t/2);return" ".repeat(i)+e+" ".repeat(t-i)}const Ei={civilian:ce.HUB,military:ce.RELAY,research:ce.RING,"black-market":ce.BEACON};class Mi{constructor(n,t,i,r,o,s){if(this.cursorIdx=0,this.activated=!1,this.h=30,this.w=40,this.station=null,this.player=i,this.context=t,this.chrome=new ue(t,i),this.starfield=new xi,this.inSpace=i.destinationId===null,i.destinationId!==null){const l=j(i.destinationId);this.stationType=Ei[l.type]??ce.RELAY,this.isLandingDest=l.locationType==="surface"||l.locationType==="asteroid"}else this.stationType=null,this.isLandingDest=!1;const a=()=>this.inSpace?1:2;n.onAction(l=>{this.activated||(l==="CARGO"?(this.activated=!0,s()):l==="UP"?this.cursorIdx=(this.cursorIdx-1+a())%a():l==="DOWN"?this.cursorIdx=(this.cursorIdx+1)%a():l==="SELECT"&&(this.cursorIdx===0?(this.activated=!0,r()):this.inSpace||(this.activated=!0,o())))}),n.onTap&&n.onTap((l,c)=>{this.activated||(c===2?l>=this.w/2&&(this.activated=!0,s()):c===this.h-1&&(l<this.w/2?(this.activated=!0,r()):this.inSpace||(this.activated=!0,o())))})}update(n){this.starfield.update(n),this.station&&this.station.update(n)}render(n){const t=n.length,i=t>0?n[0].length:0;this.h=t,this.w=i;for(let y=0;y<t;y++)for(let S=0;S<i;S++)n[y][S]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,{showHeader:!0,showFooter:!1,navOptions:[]});const r=Math.floor(i/2),o=r-3,s=2,a=3,l=4,c=t-3,h=t-2,d=t-1,u=1,p=i-2;this.stationType&&!this.station&&(this.station=new Ii(this.stationType,l,c,u,p));const f=y=>({char:y,fg:"bright-black",bg:"black"}),_=xe(`FUEL:${this.player.fuelL}/${this.player.fuelCapacityL}L`,o),v=Math.round(this.player.cargoWeightKg/1e3),x=Math.round(this.player.cargoCapacity/1e3),M=xe(`CARGO: ${v}/${x}Mg`,o);n[s][1]=f("\\");for(let y=0;y<o;y++)n[s][2+y]=f(_[y]);n[s][r-1]=f("/"),n[s][r]=f("\\");for(let y=0;y<o;y++)n[s][r+1+y]=f(M[y]);n[s][r+o+1]=f("/"),n[a][1]=f("/");for(let y=0;y<o;y++)n[a][2+y]=f("¯");for(let y=0;y<o;y++)n[a][r+1+y]=f("¯");n[a][r+o+1]=f("\\");for(let y=l;y<=c;y++)n[y][0]=f("|"),n[y][i-1]=f("|");this.starfield.render(n,l,c,u,p),this.station&&this.station.render(n),m(n,c,u+1,"[C] CARGO","bright-black","black"),n[h][1]=f("\\");for(let y=0;y<o;y++)n[h][2+y]=f("_");for(let y=0;y<o;y++)n[h][r+1+y]=f("_");n[h][r+o+1]=f("/");const w="[T] TRAVEL",g=this.inSpace?"[ - ] DOCK":this.isLandingDest?"[L] LAND":"[D] DOCK";let T=xe(w,o),A=xe(g,o);this.cursorIdx===0?T=">"+T.slice(1):this.inSpace||(A=">"+A.slice(1)),n[d][1]=f("/");for(let y=0;y<o;y++){const S=T[y];n[d][2+y]={char:S,fg:S===">"?"bright-green":"bright-yellow",bg:"black"}}n[d][r-1]=f("\\"),n[d][r]=f("/");for(let y=0;y<o;y++){const S=A[y];n[d][r+1+y]={char:S,fg:S===">"?"bright-green":this.inSpace?"bright-black":"bright-yellow",bg:"black"}}n[d][r+o+1]=f("\\")}}const je="CARGO HOLD";class Li{constructor(n,t,i,r){this.activated=!1,this.player=i,n.onAction(o=>{this.activated||(o==="BACK"||o==="CARGO")&&(this.activated=!0,r())})}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let h=0;h<t;h++)for(let d=0;d<i;d++)n[h][d]={char:" ",fg:"black",bg:"black"};k(n,1,je,"bright-white","black");const r=Math.max(0,Math.floor((i-je.length)/2));m(n,2,r,"'".repeat(je.length),"bright-black","black");const o=this.player.cargoHold,s=this.player.cargoCapacity,a=this.player.cargoWeightKg;if(o.length===0)k(n,Math.floor(t/2),"CARGO HOLD EMPTY","bright-black","black");else{let h=4;for(const u of o){if(h>=t-3)break;const p=ne(u.commodityId);if(!p)continue;const f=u.qty*p.weightKg,_=`  x${u.qty}  ${p.basePrice}CR  ${f}KG`,v=Math.max(6,i-4-_.length),x=p.name,w=`${x.length>v?x.slice(0,v):x}${_}`;m(n,h,2,w,"white","black"),h++}const d=t-4;d>3&&m(n,d,2,"-".repeat(i-4),"bright-black","black")}const l=t-3,c=`TOTAL: ${a}/${s}KG`;m(n,l,2,c,"bright-black","black"),m(n,t-1,2,"[ESC] BACK","bright-black","black")}}class bn extends Fe{constructor(n,t,i,r,o,s,a,l){const c=Ee(i.systemId),h=Zn(i.driveId),d=[...c.destinations.map(_=>({label:j(_).name.toUpperCase(),disabled:_===i.destinationId,action:()=>r(_)})),{label:"FLY INTO SPACE",disabled:i.destinationId===null,action:s}],p=[...Je(i.systemId).map(_=>{const v=_.from===i.systemId?_.to:_.from,x=Ee(v),M=_.stability.toUpperCase(),w=Math.ceil(tt*_.distance*h.fuelEfficiency);return{label:`${x.name.toUpperCase()}  ${_.distance}LY  [${M}]`.slice(0,36),disabled:w>i.fuelL,action:()=>o(v)}}),{label:"GALAXY MAP...",action:l}],f=[{label:"DESTINATIONS",items:d},{label:"JUMPS",items:p}];super("TRAVEL",[],[{id:"ship",label:"SHIP"}],n,t,i,[],f),this.onShip=a}handleNavAction(n){(n==="BACK"||n==="NAV_1")&&!this.activated&&(this.activated=!0,this.onShip())}handleNavTap(n){n==="ship"&&!this.activated&&(this.activated=!0,this.onShip())}}function _n(e,n){if(e===n)return[e];const t=[[e]],i=new Set([e]);for(;t.length>0;){const r=t.shift(),o=r[r.length-1];for(const s of Je(o)){const a=s.from===o?s.to:s.from;if(a===n)return[...r,a];i.has(a)||(i.add(a),t.push([...r,a]))}}return null}const vn="GALAXY MAP",wn=I+3,xn=I+5,W=I+9,kn=I+13,Ri=I+14,ke=I+15,Ge=I+20,We=I+21,Oi=2,Fi=10,Ni=12,Ce=13,Te=12,Di=25,Pi=26,Ui=10,Cn=18;function Hi(e,n){return e.length>=n?e.slice(0,n):e+" ".repeat(n-e.length)}function le(e,n){return"["+Hi(e.toUpperCase(),n-2)+"]"}class Bi{constructor(n,t,i,r){this.activeTab="map",this.mapCursorIdx=0,this.routeDestIdx=0,this.searchText="",this.activated=!1,this.chrome=new ue(t,i),this.player=i,this.onBack=r,this.publicSystems=ri().sort((o,s)=>o.distanceFromSol-s.distanceFromSol),this.otherSystems=this.publicSystems.filter(o=>o.id!==i.systemId),this.mapBrowsingSystemId=i.systemId,n.onCharInput&&n.onCharInput(o=>{if(this.activated||this.activeTab!=="map")return;const s=o.charCodeAt(0);o==="\b"||o===""?this.searchText=this.searchText.slice(0,-1):s>=32&&s<127&&(this.searchText+=o.toUpperCase(),this.mapCursorIdx=0)}),n.onAction(o=>{if(!this.activated){if(o==="BACK"){if(this.searchText.length>0){this.searchText="";return}this.activated=!0,this.onBack();return}if(o==="LEFT"){this.activeTab="map",this.searchText="";return}if(o==="RIGHT"){this.activeTab="route",this.searchText="";return}this.activeTab==="map"?this.handleMapAction(o):this.handleRouteAction(o)}}),n.onTap&&n.onTap((o,s)=>{if(this.activated)return;if(this.chrome.hitTestNav(o,s)==="back"){this.searchText="",this.activated=!0,this.onBack();return}if(s===wn){o>=3&&o<=7?(this.activeTab="map",this.searchText=""):o>=9&&o<=16&&(this.activeTab="route",this.searchText="");return}if(this.activeTab==="map"&&s>=ke&&s<Ge){const l=this.getMapNeighbors(),c=s-ke;c>=0&&c<l.length&&(this.mapBrowsingSystemId=l[c].id,this.mapCursorIdx=0,this.searchText="")}if(this.activeTab==="route"&&s>=I+8&&s<=I+14){const l=s-(I+8);l>=0&&l<this.otherSystems.length&&(this.routeDestIdx=l)}})}getMapNeighbors(){const t=Je(this.mapBrowsingSystemId).map(i=>{const r=i.from===this.mapBrowsingSystemId?i.to:i.from,o=this.publicSystems.find(a=>a.id===r),s=i.distance;return o?{sys:o,dist:s}:null}).filter(i=>i!==null).sort((i,r)=>i.dist-r.dist).map(i=>i.sys);return this.searchText.length===0?t:t.filter(i=>i.name.toUpperCase().includes(this.searchText))}handleMapAction(n){const t=this.getMapNeighbors(),i=Math.min(this.mapCursorIdx,Math.max(0,t.length-1));if(n==="UP")this.mapCursorIdx=Math.max(0,i-1);else if(n==="DOWN")this.mapCursorIdx=Math.min(t.length-1,i+1);else if(n==="SELECT"){const r=t[i];if(!r)return;this.mapBrowsingSystemId=r.id,this.mapCursorIdx=0,this.searchText=""}}handleRouteAction(n){n==="UP"?this.routeDestIdx=Math.max(0,this.routeDestIdx-1):n==="DOWN"&&(this.routeDestIdx=Math.min(this.otherSystems.length-1,this.routeDestIdx+1))}computeRoute(){const n=this.otherSystems[this.routeDestIdx];return n?_n(this.player.systemId,n.id):null}update(n){}render(n){const t=n.length,i=t>0?n[0].length:0;for(let o=0;o<t;o++)for(let s=0;s<i;s++)n[o][s]={char:" ",fg:"black",bg:"black"};const r=[{id:"back",label:"BACK"}];this.chrome.render(n,{showHeader:!0,showFooter:!0,navOptions:r}),m(n,I,2,vn,"bright-white","black"),m(n,I+1,2,"'".repeat(vn.length),"bright-black","black"),this.renderTabBar(n,i),this.activeTab==="map"?this.renderMapTab(n,i):this.renderRouteTab(n,i)}renderTabBar(n,t){const i=wn;let r=2;n[i][r++]={char:"|",fg:"bright-black",bg:"black"};for(const[o,s]of[["MAP","map"],["ROUTE","route"]]){const a=this.activeTab===s,l=a?"black":"white",c=a?"green":"black";for(const h of` ${o} `)r<t&&(n[i][r]={char:h,fg:l,bg:c}),r++;r<t&&(n[i][r]={char:"|",fg:"bright-black",bg:"black"}),r++}}renderMapTab(n,t){const i=this.publicSystems.find(s=>s.id===this.mapBrowsingSystemId)??this.publicSystems[0];if(!i)return;this.renderChart(n,i),m(n,Ri,0,"-".repeat(t),"bright-black","black");const r=this.getMapNeighbors(),o=Math.min(this.mapCursorIdx,Math.max(0,r.length-1));this.renderNeighborList(n,t,i,r,o),m(n,Ge,0,"-".repeat(t),"bright-black","black"),this.renderInfo(n,t,i,r[o]??null),this.searchText.length>0&&m(n,We+4,2,`/${this.searchText}_`,"bright-yellow","black")}renderChart(n,t){const i=this.getMapNeighbors(),r=t.id===this.player.systemId?"bright-yellow":"bright-cyan";if(m(n,W,Ce,le(t.name,Te),r,"black"),t.id===this.player.systemId){const s=Ce+Te;n[W][s]={char:"*",fg:"bright-yellow",bg:"black"}}const o=["left","right","top","bottom"];for(let s=0;s<Math.min(i.length,4);s++){const a=i[s],l=o[s],c=a.id===this.player.systemId?"bright-yellow":"white";if(l==="left")m(n,W,Oi,le(a.name,Fi),c,"black"),n[W][Ni]={char:"-",fg:"bright-black",bg:"black"};else if(l==="right")m(n,W,Pi,le(a.name,Ui),c,"black"),n[W][Di]={char:"-",fg:"bright-black",bg:"black"};else if(l==="top"){m(n,xn,Ce,le(a.name,Te),c,"black");for(let h=xn+1;h<W;h++)n[h][Cn]={char:"|",fg:"bright-black",bg:"black"}}else{m(n,kn,Ce,le(a.name,Te),c,"black");for(let h=W+1;h<kn;h++)n[h][Cn]={char:"|",fg:"bright-black",bg:"black"}}}}renderNeighborList(n,t,i,r,o){for(let s=0;s<r.length&&s<Ge-ke;s++){const a=r[s],l=ke+s,c=s===o,d=a.id===this.player.systemId?"bright-yellow":c?"bright-cyan":"white",u=c?"> ":"  ",p=Ae(i.id,a.id),f=p?`${p.distance}LY  ${p.stability}`:"",_=t-4-f.length;m(n,l,2,u+a.name.toUpperCase().slice(0,_-2),d,"black"),f&&m(n,l,t-2-f.length,f,"bright-black","black")}}renderInfo(n,t,i,r){const s=i.id===this.player.systemId?"* Current location":i.name.toUpperCase();if(m(n,We,2,`Zone: ${i.zone}  Sec: ${i.security}  ${s}`.slice(0,t-4),"bright-black","black"),!r)return;const a=Ae(i.id,r.id);if(!a)return;const l=_n(this.player.systemId,r.id),c=l?l.length===1?"(your location)":`${l.length-1} hop${l.length-1!==1?"s":""} from you`:"(unreachable)";m(n,We+1,2,`${r.name.toUpperCase()}  ${a.distance}LY  ${c}`.slice(0,t-4),"bright-black","black")}renderRouteTab(n,t){var _,v;const i=I+5,r=I+7,o=I+8,s=7,a=o+s,l=a+1,c=l+6,h=this.publicSystems.find(x=>x.id===this.player.systemId);m(n,i,2,"FROM:","bright-black","black"),m(n,i,8,(h==null?void 0:h.name.toUpperCase())??this.player.systemId.toUpperCase(),"bright-yellow","black"),m(n,r,2,"TO:","bright-black","black");const d=Math.max(0,Math.min(this.routeDestIdx,this.otherSystems.length-s));for(let x=0;x<s;x++){const M=d+x;if(M>=this.otherSystems.length)break;const w=this.otherSystems[M],g=M===this.routeDestIdx,T=g?"bright-cyan":"white",A=g?"> ":"  ";m(n,o+x,2,A+w.name.toUpperCase(),T,"black")}m(n,a,0,"-".repeat(t),"bright-black","black"),m(n,c,0,"-".repeat(t),"bright-black","black");const u=this.computeRoute();if(!this.otherSystems[this.routeDestIdx])return;if(!u){m(n,l,2,"No route found","bright-red","black");return}const f=u.length-1;m(n,l,2,`Route: ${f} hop${f!==1?"s":""}`,"bright-white","black");for(let x=0;x<f;x++){const M=Ae(u[x],u[x+1]);if(!M)continue;const w=l+1+x;if(w>=c)break;const g=(((_=this.publicSystems.find(A=>A.id===u[x]))==null?void 0:_.name)??u[x]).toUpperCase().slice(0,9),T=(((v=this.publicSystems.find(A=>A.id===u[x+1]))==null?void 0:v.name)??u[x+1]).toUpperCase().slice(0,9);m(n,w,4,`${g} -> ${T}  ${M.distance}LY  ${M.stability}`.slice(0,t-6),"white","black")}}}class q{constructor(n,t,i,r){this.elapsed=0,this.arrived=!1,this.player=n,this.chrome=new ue(t,n),this.duration=i,this.onComplete=r}update(n){this.arrived||(this.elapsed+=n,this.elapsed>=this.duration&&(this.arrived=!0,this.onComplete()))}render(n){const t=n.length,i=t>0?n[0].length:0;for(let r=0;r<t;r++)for(let o=0;o<i;o++)n[r][o]={char:" ",fg:"black",bg:"black"};this.chrome.render(n,this.getChromeConfig()),this.renderContent(n)}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[]}}}const $i=["[. . .]","[: : :]","[* * *]"],Tn=5e3;class ji extends q{constructor(n,t,i){super(n,t,Tn,i)}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],systemLabel:"IN TRANSIT",destinationLabel:null}}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/500)%3,o=Math.ceil((Tn-this.elapsed)/1e3),s=Math.max(1,Math.min(5,o)),a=Ee(this.player.systemId),l=a?a.name.toUpperCase():this.player.systemId.toUpperCase();k(n,i-3,"[ JUMP DRIVE ENGAGED ]","bright-cyan","black"),k(n,i-1,"DESTINATION:","bright-black","black"),k(n,i,l,"bright-white","black"),k(n,i+2,$i[r],"bright-black","black"),k(n,i+4,`ARRIVING IN ${s}S`,"bright-black","black")}}const An=2e3,Gi=["[ —   ]","[  —  ]","[   — ]"];class Sn extends q{constructor(n,t,i,r){super(n,t,An,i),this.targetLabel=r}getChromeConfig(){return{showHeader:!0,showFooter:!0,navOptions:[],destinationLabel:"IN TRANSIT"}}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((An-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o)),a=this.targetLabel!==void 0?this.targetLabel.toUpperCase():(()=>{const l=this.player.destinationId?j(this.player.destinationId):null;return l?l.name.toUpperCase():"UNKNOWN"})();k(n,i-3,"[ THRUSTERS ENGAGED ]","bright-yellow","black"),k(n,i-1,"HEADING TO:","bright-black","black"),k(n,i,a,"bright-white","black"),k(n,i+2,Gi[r],"bright-black","black"),k(n,i+4,`ARRIVING IN ${s}S`,"bright-black","black")}}const In=2500,Wi=["v","vv","vvv"];class Yi extends q{constructor(n,t,i){super(n,t,In,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/400)%3,o=Math.ceil((In-this.elapsed)/1e3),s=Math.max(1,Math.min(3,o));k(n,i-3,"[ LANDING SEQUENCE ]","bright-green","black"),k(n,i+2,Wi[r],"bright-black","black"),k(n,i+4,`TOUCHDOWN IN ${s}S`,"bright-black","black")}}const En=2500,Ki=[">",">>",">>>"];class qi extends q{constructor(n,t,i){super(n,t,En,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/400)%3,o=Math.ceil((En-this.elapsed)/1e3),s=Math.max(1,Math.min(3,o));k(n,i-3,"[ APPROACH LOCKED ]","bright-yellow","black"),k(n,i+2,Ki[r],"bright-black","black"),k(n,i+4,`CLAMPING IN ${s}S`,"bright-black","black")}}const Mn=1500,zi=["^","^^","^^^"];class Vi extends q{constructor(n,t,i){super(n,t,Mn,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((Mn-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));k(n,i-3,"[ LIFTOFF SEQUENCE ]","bright-green","black"),k(n,i+2,zi[r],"bright-black","black"),k(n,i+4,`CLEAR IN ${s}S`,"bright-black","black")}}const Ln=1500,Xi=["<","<<","<<<"];class Ji extends q{constructor(n,t,i){super(n,t,Ln,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((Ln-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));k(n,i-3,"[ RELEASING CLAMPS ]","bright-yellow","black"),k(n,i+2,Xi[r],"bright-black","black"),k(n,i+4,`DEPARTING IN ${s}S`,"bright-black","black")}}const Rn=1500,Qi=["→","→→","→→→"];class Zi extends q{constructor(n,t,i){super(n,t,Rn,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((Rn-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));k(n,i-3,"[ DOCKING SEQUENCE ]","bright-cyan","black"),k(n,i+2,Qi[r],"bright-black","black"),k(n,i+4,`DOCKING IN ${s}S`,"bright-black","black")}}const On=1500,er=["←","←←","←←←"];class nr extends q{constructor(n,t,i){super(n,t,On,i)}renderContent(n){const t=n.length,i=Math.floor(t/2),r=Math.floor(this.elapsed/300)%3,o=Math.ceil((On-this.elapsed)/1e3),s=Math.max(1,Math.min(2,o));k(n,i-3,"[ DEPARTING BERTH ]","bright-cyan","black"),k(n,i+2,er[r],"bright-black","black"),k(n,i+4,`CLEAR IN ${s}S`,"bright-black","black")}}class tr{constructor(n){const t=et(n.shipId);if(!t)throw new Error(`Unknown ship: ${n.shipId}`);this.shipId=n.shipId,this.driveId=n.driveId,this.fuelCapacityL=t.fuelCapacityL,this.cargoCapacity=t.cargoCapacityKg,this._fuelL=t.fuelCapacityL,this._credits=n.credits,this._systemId=n.systemId,this._destinationId=n.destinationId,this._cargoHold=[]}get fuelL(){return this._fuelL}addFuel(n){this._fuelL=Math.min(this.fuelCapacityL,this._fuelL+n)}consumeFuel(n){this._fuelL=Math.max(0,this._fuelL-n)}get credits(){return this._credits}addCredits(n){this._credits+=n}spendCredits(n){this._credits-=n}get cargoHold(){return this._cargoHold}addCargo(n,t){const i=this._cargoHold.find(r=>r.commodityId===n);i?i.qty+=t:this._cargoHold.push({commodityId:n,qty:t})}removeCargo(n,t){const i=this._cargoHold.findIndex(r=>r.commodityId===n);i<0||(t!==void 0&&t<this._cargoHold[i].qty?this._cargoHold[i].qty-=t:this._cargoHold.splice(i,1))}get cargoWeightKg(){return oi(this._cargoHold)}get systemId(){return this._systemId}get destinationId(){return this._destinationId}dock(n){this._destinationId=n}undock(){this._destinationId=null}jumpTo(n){this._systemId=n,this._destinationId=null}}const ir=100,rr=2*60*1e3;class or{constructor(n,t,i){this.traderStockCache=new Map,this.renderer=n,this.input=t,this.context=i;const r=ti(),o=et(r.startingShip);this.player=new tr({shipId:r.startingShip,driveId:o.defaultJumpDrive,credits:r.player.startingCredits,systemId:r.startingLocation.system,destinationId:r.startingLocation.destination}),this.currentScene=new dn(this.input,this.context,this.player,()=>this.goToStory())}tick(n){const t=Math.min(n,ir),i=this.makeBuffer();this.currentScene.update(t),this.currentScene.render(i),this.renderer.drawBuffer(i)}makeBuffer(){const n=this.renderer.getWidth(),t=this.renderer.getHeight();return Array.from({length:t},()=>Array.from({length:n},()=>({char:" ",fg:"black",bg:"black"})))}getOrCreateTraderStock(n){const t=Date.now(),i=this.traderStockCache.get(n);if(i&&t-i.generatedAt<rr)return i.entries;const r=ii(),o=4+Math.floor(Math.random()*3),s=[...r];for(let l=s.length-1;l>0;l--){const c=Math.floor(Math.random()*(l+1));[s[l],s[c]]=[s[c],s[l]]}const a=s.slice(0,o).map(l=>({commodityId:l.id,qty:1+Math.floor(Math.random()*8)}));return this.traderStockCache.set(n,{entries:a,generatedAt:t}),a}onBuy(n,t,i){if(t<=0)return;const r=i.findIndex(c=>c.commodityId===n);if(r<0)return;const o=i[r];if(t>o.qty)return;const s=ne(n);if(!s)return;const a=t*s.basePrice;this.player.credits<a||this.player.cargoWeightKg+t*s.weightKg>this.player.cargoCapacity||(this.player.spendCredits(a),this.player.addCargo(n,t),o.qty-=t,o.qty<=0&&i.splice(r,1))}onSell(n,t,i){if(t<=0)return;const r=this.player.cargoHold.find(l=>l.commodityId===n);if(!r||r.qty<t)return;const o=ne(n);if(!o)return;const s=t*o.basePrice;this.player.addCredits(s),this.player.removeCargo(n,t);const a=i.find(l=>l.commodityId===n);a?a.qty+=t:i.push({commodityId:n,qty:t})}goToMainMenu(){this.currentScene=new dn(this.input,this.context,this.player,()=>this.goToStory())}goToStory(){this.currentScene=new li(this.input,this.context,this.player,()=>this.goToStation())}goToStation(){this.currentScene=new hi(this.input,this.context,this.player,this.player.destinationId,(n,t)=>{this.player.spendCredits(n),this.player.addFuel(t),this.goToStation()},()=>this.goToTrader(),()=>this.goToMissionBoard(),()=>this.goToTakeOffOrUndock())}goToLandOrDock(){var t;const n=(t=j(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new Yi(this.player,this.context,()=>this.goToStation()):n==="asteroid"?this.currentScene=new qi(this.player,this.context,()=>this.goToStation()):this.currentScene=new Zi(this.player,this.context,()=>this.goToStation())}goToTakeOffOrUndock(){var t;const n=(t=j(this.player.destinationId))==null?void 0:t.locationType;n==="surface"?this.currentScene=new Vi(this.player,this.context,()=>this.goToShip()):n==="asteroid"?this.currentScene=new Ji(this.player,this.context,()=>this.goToShip()):this.currentScene=new nr(this.player,this.context,()=>this.goToShip())}goToTrader(){const n=this.player.destinationId,t=this.getOrCreateTraderStock(n);this.currentScene=new di(this.input,this.context,this.player,n,t,(i,r)=>this.onBuy(i,r,t),(i,r)=>this.onSell(i,r,t),()=>this.goToStation(),()=>this.goToShip())}goToMissionBoard(){this.currentScene=new fi(this.input,this.context,this.player,this.player.destinationId,()=>this.goToStation(),()=>this.goToShip())}goToShip(){this.currentScene=new Mi(this.input,this.context,this.player,()=>this.goToTravelMenu(),()=>this.goToLandOrDock(),()=>this.goToCargo())}goToCargo(){this.currentScene=new Li(this.input,this.context,this.player,()=>this.goToShip())}goToTravelMenu(){this.currentScene=new bn(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap())}goToArrival(){this.currentScene=new bn(this.input,this.context,this.player,n=>this.onDestinationSelected(n),n=>this.onJumpSelected(n),()=>this.goToFlyIntoSpace(),()=>this.goToShip(),()=>this.goToGalaxyMap())}goToGalaxyMap(){this.currentScene=new Bi(this.input,this.context,this.player,()=>this.goToTravelMenu())}goToFlyIntoSpace(){this.player.undock(),this.currentScene=new Sn(this.player,this.context,()=>this.goToShip(),"OPEN SPACE")}onDestinationSelected(n){this.player.dock(n),this.currentScene=new Sn(this.player,this.context,()=>this.goToShip())}onJumpSelected(n){const t=Ae(this.player.systemId,n),i=Zn(this.player.driveId),r=Math.ceil(tt*t.distance*i.fuelEfficiency);this.player.consumeFuel(r),this.player.jumpTo(n),this.currentScene=new ji(this.player,this.context,()=>this.goToArrival())}}const sr=`---
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
`,ar=`---
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
`,lr=`---
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
`,cr=`---
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
`,hr=`---
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
`,dr=`---
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
`,ur=`---
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
`,pr=`---
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
`,fr=`---
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
`,mr=`---
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
`,gr=`---
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
`,yr=`---
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
`,br=`---
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
`,_r=`---
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
`,vr=`---
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
`,wr=`---
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
`,xr=`---
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
`,kr=`---
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
`,Cr=`---
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
`,Tr=`---
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
`,Ar=`---
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
`,Sr=`---
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
`,Ir=`---
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
`,Er=`---
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
`,Mr=`---
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
`,Lr=`---
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
`,Rr=`---
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
`,Or=`---
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
`,Fr=`---
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
`,Nr=`# Galaxy Map

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

Adventure here is fraught with inconsistent communications and unreliable star charts.`,Dr=`---
id: game-settings

player:
  name: Captain
  starting_credits: 5000

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
`,Pr=`---
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
`,Ur=`---
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
`,Hr=`---
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

Long range engines for faster than light travel between systems.`,Br=`---
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
`,$r=`---
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
`,jr=`---
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
`,Gr=`---
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
`,Wr=`---
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
`,Yr=`---
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
`,Kr=`---
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
`,qr=`---
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
`,zr=`---
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
`,Vr=`---
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
`,Jr=`---
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
`,Qr=`---
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
`,Zr=`---
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
`,eo=`---
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
`,no=`---
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
`;var E={},pe={},P={};function it(e){return typeof e>"u"||e===null}function to(e){return typeof e=="object"&&e!==null}function io(e){return Array.isArray(e)?e:it(e)?[]:[e]}function ro(e,n){var t,i,r,o;if(n)for(o=Object.keys(n),t=0,i=o.length;t<i;t+=1)r=o[t],e[r]=n[r];return e}function oo(e,n){var t="",i;for(i=0;i<n;i+=1)t+=e;return t}function so(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}P.isNothing=it;P.isObject=to;P.toArray=io;P.repeat=oo;P.isNegativeZero=so;P.extend=ro;function he(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=(this.reason||"(unknown reason)")+(this.mark?" "+this.mark.toString():""),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}he.prototype=Object.create(Error.prototype);he.prototype.constructor=he;he.prototype.toString=function(n){var t=this.name+": ";return t+=this.reason||"(unknown reason)",!n&&this.mark&&(t+=" "+this.mark.toString()),t};var fe=he,Fn=P;function Qe(e,n,t,i,r){this.name=e,this.buffer=n,this.position=t,this.line=i,this.column=r}Qe.prototype.getSnippet=function(n,t){var i,r,o,s,a;if(!this.buffer)return null;for(n=n||4,t=t||75,i="",r=this.position;r>0&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(r-1))===-1;)if(r-=1,this.position-r>t/2-1){i=" ... ",r+=5;break}for(o="",s=this.position;s<this.buffer.length&&`\0\r
\u2028\u2029`.indexOf(this.buffer.charAt(s))===-1;)if(s+=1,s-this.position>t/2-1){o=" ... ",s-=5;break}return a=this.buffer.slice(r,s),Fn.repeat(" ",n)+i+a+o+`
`+Fn.repeat(" ",n+this.position-r+i.length)+"^"};Qe.prototype.toString=function(n){var t,i="";return this.name&&(i+='in "'+this.name+'" '),i+="at line "+(this.line+1)+", column "+(this.column+1),n||(t=this.getSnippet(),t&&(i+=`:
`+t)),i};var ao=Qe,Nn=fe,lo=["kind","resolve","construct","instanceOf","predicate","represent","defaultStyle","styleAliases"],co=["scalar","sequence","mapping"];function ho(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(i){n[String(i)]=t})}),n}function uo(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(lo.indexOf(t)===-1)throw new Nn('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.defaultStyle=n.defaultStyle||null,this.styleAliases=ho(n.styleAliases||null),co.indexOf(this.kind)===-1)throw new Nn('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var O=uo,Dn=P,Se=fe,po=O;function ze(e,n,t){var i=[];return e.include.forEach(function(r){t=ze(r,n,t)}),e[n].forEach(function(r){t.forEach(function(o,s){o.tag===r.tag&&o.kind===r.kind&&i.push(s)}),t.push(r)}),t.filter(function(r,o){return i.indexOf(o)===-1})}function fo(){var e={scalar:{},sequence:{},mapping:{},fallback:{}},n,t;function i(r){e[r.kind][r.tag]=e.fallback[r.tag]=r}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(i);return e}function Q(e){this.include=e.include||[],this.implicit=e.implicit||[],this.explicit=e.explicit||[],this.implicit.forEach(function(n){if(n.loadKind&&n.loadKind!=="scalar")throw new Se("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.")}),this.compiledImplicit=ze(this,"implicit",[]),this.compiledExplicit=ze(this,"explicit",[]),this.compiledTypeMap=fo(this.compiledImplicit,this.compiledExplicit)}Q.DEFAULT=null;Q.create=function(){var n,t;switch(arguments.length){case 1:n=Q.DEFAULT,t=arguments[0];break;case 2:n=arguments[0],t=arguments[1];break;default:throw new Se("Wrong number of arguments for Schema.create function")}if(n=Dn.toArray(n),t=Dn.toArray(t),!n.every(function(i){return i instanceof Q}))throw new Se("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");if(!t.every(function(i){return i instanceof po}))throw new Se("Specified list of YAML types (or a single Type object) contains a non-Type object.");return new Q({include:n,explicit:t})};var re=Q,mo=O,go=new mo("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),yo=O,bo=new yo("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),_o=O,vo=new _o("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),wo=re,Ze=new wo({explicit:[go,bo,vo]}),xo=O;function ko(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function Co(){return null}function To(e){return e===null}var Ao=new xo("tag:yaml.org,2002:null",{kind:"scalar",resolve:ko,construct:Co,predicate:To,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"}},defaultStyle:"lowercase"}),So=O;function Io(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function Eo(e){return e==="true"||e==="True"||e==="TRUE"}function Mo(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var Lo=new So("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Io,construct:Eo,predicate:Mo,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"}),Ro=P,Oo=O;function Fo(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function No(e){return 48<=e&&e<=55}function Do(e){return 48<=e&&e<=57}function Po(e){if(e===null)return!1;var n=e.length,t=0,i=!1,r;if(!n)return!1;if(r=e[t],(r==="-"||r==="+")&&(r=e[++t]),r==="0"){if(t+1===n)return!0;if(r=e[++t],r==="b"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(r!=="0"&&r!=="1")return!1;i=!0}return i&&r!=="_"}if(r==="x"){for(t++;t<n;t++)if(r=e[t],r!=="_"){if(!Fo(e.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}for(;t<n;t++)if(r=e[t],r!=="_"){if(!No(e.charCodeAt(t)))return!1;i=!0}return i&&r!=="_"}if(r==="_")return!1;for(;t<n;t++)if(r=e[t],r!=="_"){if(r===":")break;if(!Do(e.charCodeAt(t)))return!1;i=!0}return!i||r==="_"?!1:r!==":"?!0:/^(:[0-5]?[0-9])+$/.test(e.slice(t))}function Uo(e){var n=e,t=1,i,r,o=[];return n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),i=n[0],(i==="-"||i==="+")&&(i==="-"&&(t=-1),n=n.slice(1),i=n[0]),n==="0"?0:i==="0"?n[1]==="b"?t*parseInt(n.slice(2),2):n[1]==="x"?t*parseInt(n,16):t*parseInt(n,8):n.indexOf(":")!==-1?(n.split(":").forEach(function(s){o.unshift(parseInt(s,10))}),n=0,r=1,o.forEach(function(s){n+=s*r,r*=60}),t*n):t*parseInt(n,10)}function Ho(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!Ro.isNegativeZero(e)}var Bo=new Oo("tag:yaml.org,2002:int",{kind:"scalar",resolve:Po,construct:Uo,predicate:Ho,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0"+e.toString(8):"-0"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),rt=P,$o=O,jo=new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Go(e){return!(e===null||!jo.test(e)||e[e.length-1]==="_")}function Wo(e){var n,t,i,r;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,r=[],"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:n.indexOf(":")>=0?(n.split(":").forEach(function(o){r.unshift(parseFloat(o,10))}),n=0,i=1,r.forEach(function(o){n+=o*i,i*=60}),t*n):t*parseFloat(n,10)}var Yo=/^[-+]?[0-9]+e/;function Ko(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(rt.isNegativeZero(e))return"-0.0";return t=e.toString(10),Yo.test(t)?t.replace("e",".e"):t}function qo(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||rt.isNegativeZero(e))}var zo=new $o("tag:yaml.org,2002:float",{kind:"scalar",resolve:Go,construct:Wo,predicate:qo,represent:Ko,defaultStyle:"lowercase"}),Vo=re,ot=new Vo({include:[Ze],implicit:[Ao,Lo,Bo,zo]}),Xo=re,st=new Xo({include:[ot]}),Jo=O,at=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),lt=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Qo(e){return e===null?!1:at.exec(e)!==null||lt.exec(e)!==null}function Zo(e){var n,t,i,r,o,s,a,l=0,c=null,h,d,u;if(n=at.exec(e),n===null&&(n=lt.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],i=+n[2]-1,r=+n[3],!n[4])return new Date(Date.UTC(t,i,r));if(o=+n[4],s=+n[5],a=+n[6],n[7]){for(l=n[7].slice(0,3);l.length<3;)l+="0";l=+l}return n[9]&&(h=+n[10],d=+(n[11]||0),c=(h*60+d)*6e4,n[9]==="-"&&(c=-c)),u=new Date(Date.UTC(t,i,r,o,s,a,l)),c&&u.setTime(u.getTime()-c),u}function es(e){return e.toISOString()}var ns=new Jo("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Qo,construct:Zo,instanceOf:Date,represent:es}),ts=O;function is(e){return e==="<<"||e===null}var rs=new ts("tag:yaml.org,2002:merge",{kind:"scalar",resolve:is});function ct(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var z;try{var os=ct;z=os("buffer").Buffer}catch{}var ss=O,en=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function as(e){if(e===null)return!1;var n,t,i=0,r=e.length,o=en;for(t=0;t<r;t++)if(n=o.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;i+=6}return i%8===0}function ls(e){var n,t,i=e.replace(/[\r\n=]/g,""),r=i.length,o=en,s=0,a=[];for(n=0;n<r;n++)n%4===0&&n&&(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)),s=s<<6|o.indexOf(i.charAt(n));return t=r%4*6,t===0?(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)):t===18?(a.push(s>>10&255),a.push(s>>2&255)):t===12&&a.push(s>>4&255),z?z.from?z.from(a):new z(a):a}function cs(e){var n="",t=0,i,r,o=e.length,s=en;for(i=0;i<o;i++)i%3===0&&i&&(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]),t=(t<<8)+e[i];return r=o%3,r===0?(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]):r===2?(n+=s[t>>10&63],n+=s[t>>4&63],n+=s[t<<2&63],n+=s[64]):r===1&&(n+=s[t>>2&63],n+=s[t<<4&63],n+=s[64],n+=s[64]),n}function hs(e){return z&&z.isBuffer(e)}var ds=new ss("tag:yaml.org,2002:binary",{kind:"scalar",resolve:as,construct:ls,predicate:hs,represent:cs}),us=O,ps=Object.prototype.hasOwnProperty,fs=Object.prototype.toString;function ms(e){if(e===null)return!0;var n=[],t,i,r,o,s,a=e;for(t=0,i=a.length;t<i;t+=1){if(r=a[t],s=!1,fs.call(r)!=="[object Object]")return!1;for(o in r)if(ps.call(r,o))if(!s)s=!0;else return!1;if(!s)return!1;if(n.indexOf(o)===-1)n.push(o);else return!1}return!0}function gs(e){return e!==null?e:[]}var ys=new us("tag:yaml.org,2002:omap",{kind:"sequence",resolve:ms,construct:gs}),bs=O,_s=Object.prototype.toString;function vs(e){if(e===null)return!0;var n,t,i,r,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1){if(i=s[n],_s.call(i)!=="[object Object]"||(r=Object.keys(i),r.length!==1))return!1;o[n]=[r[0],i[r[0]]]}return!0}function ws(e){if(e===null)return[];var n,t,i,r,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1)i=s[n],r=Object.keys(i),o[n]=[r[0],i[r[0]]];return o}var xs=new bs("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:vs,construct:ws}),ks=O,Cs=Object.prototype.hasOwnProperty;function Ts(e){if(e===null)return!0;var n,t=e;for(n in t)if(Cs.call(t,n)&&t[n]!==null)return!1;return!0}function As(e){return e!==null?e:{}}var Ss=new ks("tag:yaml.org,2002:set",{kind:"mapping",resolve:Ts,construct:As}),Is=re,me=new Is({include:[st],implicit:[ns,rs],explicit:[ds,ys,xs,Ss]}),Es=O;function Ms(){return!0}function Ls(){}function Rs(){return""}function Os(e){return typeof e>"u"}var Fs=new Es("tag:yaml.org,2002:js/undefined",{kind:"scalar",resolve:Ms,construct:Ls,predicate:Os,represent:Rs}),Ns=O;function Ds(e){if(e===null||e.length===0)return!1;var n=e,t=/\/([gim]*)$/.exec(e),i="";return!(n[0]==="/"&&(t&&(i=t[1]),i.length>3||n[n.length-i.length-1]!=="/"))}function Ps(e){var n=e,t=/\/([gim]*)$/.exec(e),i="";return n[0]==="/"&&(t&&(i=t[1]),n=n.slice(1,n.length-i.length-1)),new RegExp(n,i)}function Us(e){var n="/"+e.source+"/";return e.global&&(n+="g"),e.multiline&&(n+="m"),e.ignoreCase&&(n+="i"),n}function Hs(e){return Object.prototype.toString.call(e)==="[object RegExp]"}var Bs=new Ns("tag:yaml.org,2002:js/regexp",{kind:"scalar",resolve:Ds,construct:Ps,predicate:Hs,represent:Us}),Me;try{var $s=ct;Me=$s("esprima")}catch{typeof window<"u"&&(Me=window.esprima)}var js=O;function Gs(e){if(e===null)return!1;try{var n="("+e+")",t=Me.parse(n,{range:!0});return!(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")}catch{return!1}}function Ws(e){var n="("+e+")",t=Me.parse(n,{range:!0}),i=[],r;if(t.type!=="Program"||t.body.length!==1||t.body[0].type!=="ExpressionStatement"||t.body[0].expression.type!=="ArrowFunctionExpression"&&t.body[0].expression.type!=="FunctionExpression")throw new Error("Failed to resolve function");return t.body[0].expression.params.forEach(function(o){i.push(o.name)}),r=t.body[0].expression.body.range,t.body[0].expression.body.type==="BlockStatement"?new Function(i,n.slice(r[0]+1,r[1]-1)):new Function(i,"return "+n.slice(r[0],r[1]))}function Ys(e){return e.toString()}function Ks(e){return Object.prototype.toString.call(e)==="[object Function]"}var qs=new js("tag:yaml.org,2002:js/function",{kind:"scalar",resolve:Gs,construct:Ws,predicate:Ks,represent:Ys}),Pn=re,Ne=Pn.DEFAULT=new Pn({include:[me],explicit:[Fs,Bs,qs]}),$=P,ht=fe,zs=ao,dt=me,Vs=Ne,K=Object.prototype.hasOwnProperty,Le=1,ut=2,pt=3,Re=4,Ye=1,Xs=2,Un=3,Js=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Qs=/[\x85\u2028\u2029]/,Zs=/[,\[\]\{\}]/,ft=/^(?:!|!!|![a-z\-]+!)$/i,mt=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function Hn(e){return Object.prototype.toString.call(e)}function B(e){return e===10||e===13}function V(e){return e===9||e===32}function D(e){return e===9||e===32||e===10||e===13}function Z(e){return e===44||e===91||e===93||e===123||e===125}function ea(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function na(e){return e===120?2:e===117?4:e===85?8:0}function ta(e){return 48<=e&&e<=57?e-48:-1}function Bn(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function ia(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function gt(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var yt=new Array(256),bt=new Array(256);for(var J=0;J<256;J++)yt[J]=Bn(J)?1:0,bt[J]=Bn(J);function ra(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||Vs,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.documents=[]}function _t(e,n){return new ht(n,new zs(e.filename,e.input,e.position,e.line,e.position-e.lineStart))}function b(e,n){throw _t(e,n)}function Oe(e,n){e.onWarning&&e.onWarning.call(null,_t(e,n))}var $n={YAML:function(n,t,i){var r,o,s;n.version!==null&&b(n,"duplication of %YAML directive"),i.length!==1&&b(n,"YAML directive accepts exactly one argument"),r=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),r===null&&b(n,"ill-formed argument of the YAML directive"),o=parseInt(r[1],10),s=parseInt(r[2],10),o!==1&&b(n,"unacceptable YAML version of the document"),n.version=i[0],n.checkLineBreaks=s<2,s!==1&&s!==2&&Oe(n,"unsupported YAML version of the document")},TAG:function(n,t,i){var r,o;i.length!==2&&b(n,"TAG directive accepts exactly two arguments"),r=i[0],o=i[1],ft.test(r)||b(n,"ill-formed tag handle (first argument) of the TAG directive"),K.call(n.tagMap,r)&&b(n,'there is a previously declared suffix for "'+r+'" tag handle'),mt.test(o)||b(n,"ill-formed tag prefix (second argument) of the TAG directive"),n.tagMap[r]=o}};function Y(e,n,t,i){var r,o,s,a;if(n<t){if(a=e.input.slice(n,t),i)for(r=0,o=a.length;r<o;r+=1)s=a.charCodeAt(r),s===9||32<=s&&s<=1114111||b(e,"expected valid JSON character");else Js.test(a)&&b(e,"the stream contains non-printable characters");e.result+=a}}function jn(e,n,t,i){var r,o,s,a;for($.isObject(t)||b(e,"cannot merge mappings; the provided source object is unacceptable"),r=Object.keys(t),s=0,a=r.length;s<a;s+=1)o=r[s],K.call(n,o)||(gt(n,o,t[o]),i[o]=!0)}function ee(e,n,t,i,r,o,s,a){var l,c;if(Array.isArray(r))for(r=Array.prototype.slice.call(r),l=0,c=r.length;l<c;l+=1)Array.isArray(r[l])&&b(e,"nested arrays are not supported inside keys"),typeof r=="object"&&Hn(r[l])==="[object Object]"&&(r[l]="[object Object]");if(typeof r=="object"&&Hn(r)==="[object Object]"&&(r="[object Object]"),r=String(r),n===null&&(n={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(l=0,c=o.length;l<c;l+=1)jn(e,n,o[l],t);else jn(e,n,o,t);else!e.json&&!K.call(t,r)&&K.call(n,r)&&(e.line=s||e.line,e.position=a||e.position,b(e,"duplicated mapping key")),gt(n,r,o),delete t[r];return n}function nn(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):b(e,"a line break is expected"),e.line+=1,e.lineStart=e.position}function L(e,n,t){for(var i=0,r=e.input.charCodeAt(e.position);r!==0;){for(;V(r);)r=e.input.charCodeAt(++e.position);if(n&&r===35)do r=e.input.charCodeAt(++e.position);while(r!==10&&r!==13&&r!==0);if(B(r))for(nn(e),r=e.input.charCodeAt(e.position),i++,e.lineIndent=0;r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position);else break}return t!==-1&&i!==0&&e.lineIndent<t&&Oe(e,"deficient indentation"),i}function De(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||D(t)))}function tn(e,n){n===1?e.result+=" ":n>1&&(e.result+=$.repeat(`
`,n-1))}function oa(e,n,t){var i,r,o,s,a,l,c,h,d=e.kind,u=e.result,p;if(p=e.input.charCodeAt(e.position),D(p)||Z(p)||p===35||p===38||p===42||p===33||p===124||p===62||p===39||p===34||p===37||p===64||p===96||(p===63||p===45)&&(r=e.input.charCodeAt(e.position+1),D(r)||t&&Z(r)))return!1;for(e.kind="scalar",e.result="",o=s=e.position,a=!1;p!==0;){if(p===58){if(r=e.input.charCodeAt(e.position+1),D(r)||t&&Z(r))break}else if(p===35){if(i=e.input.charCodeAt(e.position-1),D(i))break}else{if(e.position===e.lineStart&&De(e)||t&&Z(p))break;if(B(p))if(l=e.line,c=e.lineStart,h=e.lineIndent,L(e,!1,-1),e.lineIndent>=n){a=!0,p=e.input.charCodeAt(e.position);continue}else{e.position=s,e.line=l,e.lineStart=c,e.lineIndent=h;break}}a&&(Y(e,o,s,!1),tn(e,e.line-l),o=s=e.position,a=!1),V(p)||(s=e.position+1),p=e.input.charCodeAt(++e.position)}return Y(e,o,s,!1),e.result?!0:(e.kind=d,e.result=u,!1)}function sa(e,n){var t,i,r;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,i=r=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(Y(e,i,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)i=e.position,e.position++,r=e.position;else return!0;else B(t)?(Y(e,i,r,!0),tn(e,L(e,!1,n)),i=r=e.position):e.position===e.lineStart&&De(e)?b(e,"unexpected end of the document within a single quoted scalar"):(e.position++,r=e.position);b(e,"unexpected end of the stream within a single quoted scalar")}function aa(e,n){var t,i,r,o,s,a;if(a=e.input.charCodeAt(e.position),a!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=i=e.position;(a=e.input.charCodeAt(e.position))!==0;){if(a===34)return Y(e,t,e.position,!0),e.position++,!0;if(a===92){if(Y(e,t,e.position,!0),a=e.input.charCodeAt(++e.position),B(a))L(e,!1,n);else if(a<256&&yt[a])e.result+=bt[a],e.position++;else if((s=na(a))>0){for(r=s,o=0;r>0;r--)a=e.input.charCodeAt(++e.position),(s=ea(a))>=0?o=(o<<4)+s:b(e,"expected hexadecimal character");e.result+=ia(o),e.position++}else b(e,"unknown escape sequence");t=i=e.position}else B(a)?(Y(e,t,i,!0),tn(e,L(e,!1,n)),t=i=e.position):e.position===e.lineStart&&De(e)?b(e,"unexpected end of the document within a double quoted scalar"):(e.position++,i=e.position)}b(e,"unexpected end of the stream within a double quoted scalar")}function la(e,n){var t=!0,i,r=e.tag,o,s=e.anchor,a,l,c,h,d,u={},p,f,_,v;if(v=e.input.charCodeAt(e.position),v===91)l=93,d=!1,o=[];else if(v===123)l=125,d=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),v=e.input.charCodeAt(++e.position);v!==0;){if(L(e,!0,n),v=e.input.charCodeAt(e.position),v===l)return e.position++,e.tag=r,e.anchor=s,e.kind=d?"mapping":"sequence",e.result=o,!0;t||b(e,"missed comma between flow collection entries"),f=p=_=null,c=h=!1,v===63&&(a=e.input.charCodeAt(e.position+1),D(a)&&(c=h=!0,e.position++,L(e,!0,n))),i=e.line,te(e,n,Le,!1,!0),f=e.tag,p=e.result,L(e,!0,n),v=e.input.charCodeAt(e.position),(h||e.line===i)&&v===58&&(c=!0,v=e.input.charCodeAt(++e.position),L(e,!0,n),te(e,n,Le,!1,!0),_=e.result),d?ee(e,o,u,f,p,_):c?o.push(ee(e,null,u,f,p,_)):o.push(p),L(e,!0,n),v=e.input.charCodeAt(e.position),v===44?(t=!0,v=e.input.charCodeAt(++e.position)):t=!1}b(e,"unexpected end of the stream within a flow collection")}function ca(e,n){var t,i,r=Ye,o=!1,s=!1,a=n,l=0,c=!1,h,d;if(d=e.input.charCodeAt(e.position),d===124)i=!1;else if(d===62)i=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)Ye===r?r=d===43?Un:Xs:b(e,"repeat of a chomping mode identifier");else if((h=ta(d))>=0)h===0?b(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?b(e,"repeat of an indentation width identifier"):(a=n+h-1,s=!0);else break;if(V(d)){do d=e.input.charCodeAt(++e.position);while(V(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!B(d)&&d!==0)}for(;d!==0;){for(nn(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!s||e.lineIndent<a)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>a&&(a=e.lineIndent),B(d)){l++;continue}if(e.lineIndent<a){r===Un?e.result+=$.repeat(`
`,o?1+l:l):r===Ye&&o&&(e.result+=`
`);break}for(i?V(d)?(c=!0,e.result+=$.repeat(`
`,o?1+l:l)):c?(c=!1,e.result+=$.repeat(`
`,l+1)):l===0?o&&(e.result+=" "):e.result+=$.repeat(`
`,l):e.result+=$.repeat(`
`,o?1+l:l),o=!0,s=!0,l=0,t=e.position;!B(d)&&d!==0;)d=e.input.charCodeAt(++e.position);Y(e,t,e.position,!1)}return!0}function Gn(e,n){var t,i=e.tag,r=e.anchor,o=[],s,a=!1,l;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),l=e.input.charCodeAt(e.position);l!==0&&!(l!==45||(s=e.input.charCodeAt(e.position+1),!D(s)));){if(a=!0,e.position++,L(e,!0,-1)&&e.lineIndent<=n){o.push(null),l=e.input.charCodeAt(e.position);continue}if(t=e.line,te(e,n,pt,!1,!0),o.push(e.result),L(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&l!==0)b(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return a?(e.tag=i,e.anchor=r,e.kind="sequence",e.result=o,!0):!1}function ha(e,n,t){var i,r,o,s,a=e.tag,l=e.anchor,c={},h={},d=null,u=null,p=null,f=!1,_=!1,v;for(e.anchor!==null&&(e.anchorMap[e.anchor]=c),v=e.input.charCodeAt(e.position);v!==0;){if(i=e.input.charCodeAt(e.position+1),o=e.line,s=e.position,(v===63||v===58)&&D(i))v===63?(f&&(ee(e,c,h,d,u,null),d=u=p=null),_=!0,f=!0,r=!0):f?(f=!1,r=!0):b(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,v=i;else if(te(e,t,ut,!1,!0))if(e.line===o){for(v=e.input.charCodeAt(e.position);V(v);)v=e.input.charCodeAt(++e.position);if(v===58)v=e.input.charCodeAt(++e.position),D(v)||b(e,"a whitespace character is expected after the key-value separator within a block mapping"),f&&(ee(e,c,h,d,u,null),d=u=p=null),_=!0,f=!1,r=!1,d=e.tag,u=e.result;else if(_)b(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=a,e.anchor=l,!0}else if(_)b(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=a,e.anchor=l,!0;else break;if((e.line===o||e.lineIndent>n)&&(te(e,n,Re,!0,r)&&(f?u=e.result:p=e.result),f||(ee(e,c,h,d,u,p,o,s),d=u=p=null),L(e,!0,-1),v=e.input.charCodeAt(e.position)),e.lineIndent>n&&v!==0)b(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return f&&ee(e,c,h,d,u,null),_&&(e.tag=a,e.anchor=l,e.kind="mapping",e.result=c),_}function da(e){var n,t=!1,i=!1,r,o,s;if(s=e.input.charCodeAt(e.position),s!==33)return!1;if(e.tag!==null&&b(e,"duplication of a tag property"),s=e.input.charCodeAt(++e.position),s===60?(t=!0,s=e.input.charCodeAt(++e.position)):s===33?(i=!0,r="!!",s=e.input.charCodeAt(++e.position)):r="!",n=e.position,t){do s=e.input.charCodeAt(++e.position);while(s!==0&&s!==62);e.position<e.length?(o=e.input.slice(n,e.position),s=e.input.charCodeAt(++e.position)):b(e,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!D(s);)s===33&&(i?b(e,"tag suffix cannot contain exclamation marks"):(r=e.input.slice(n-1,e.position+1),ft.test(r)||b(e,"named tag handle cannot contain such characters"),i=!0,n=e.position+1)),s=e.input.charCodeAt(++e.position);o=e.input.slice(n,e.position),Zs.test(o)&&b(e,"tag suffix cannot contain flow indicator characters")}return o&&!mt.test(o)&&b(e,"tag name cannot contain such characters: "+o),t?e.tag=o:K.call(e.tagMap,r)?e.tag=e.tagMap[r]+o:r==="!"?e.tag="!"+o:r==="!!"?e.tag="tag:yaml.org,2002:"+o:b(e,'undeclared tag handle "'+r+'"'),!0}function ua(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&b(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!D(t)&&!Z(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&b(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function pa(e){var n,t,i;if(i=e.input.charCodeAt(e.position),i!==42)return!1;for(i=e.input.charCodeAt(++e.position),n=e.position;i!==0&&!D(i)&&!Z(i);)i=e.input.charCodeAt(++e.position);return e.position===n&&b(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),K.call(e.anchorMap,t)||b(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],L(e,!0,-1),!0}function te(e,n,t,i,r){var o,s,a,l=1,c=!1,h=!1,d,u,p,f,_;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=s=a=Re===t||pt===t,i&&L(e,!0,-1)&&(c=!0,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)),l===1)for(;da(e)||ua(e);)L(e,!0,-1)?(c=!0,a=o,e.lineIndent>n?l=1:e.lineIndent===n?l=0:e.lineIndent<n&&(l=-1)):a=!1;if(a&&(a=c||r),(l===1||Re===t)&&(Le===t||ut===t?f=n:f=n+1,_=e.position-e.lineStart,l===1?a&&(Gn(e,_)||ha(e,_,f))||la(e,f)?h=!0:(s&&ca(e,f)||sa(e,f)||aa(e,f)?h=!0:pa(e)?(h=!0,(e.tag!==null||e.anchor!==null)&&b(e,"alias node should not have any properties")):oa(e,f,Le===t)&&(h=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(h=a&&Gn(e,_))),e.tag!==null&&e.tag!=="!")if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&b(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,u=e.implicitTypes.length;d<u;d+=1)if(p=e.implicitTypes[d],p.resolve(e.result)){e.result=p.construct(e.result),e.tag=p.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else K.call(e.typeMap[e.kind||"fallback"],e.tag)?(p=e.typeMap[e.kind||"fallback"][e.tag],e.result!==null&&p.kind!==e.kind&&b(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+p.kind+'", not "'+e.kind+'"'),p.resolve(e.result)?(e.result=p.construct(e.result),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):b(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")):b(e,"unknown tag !<"+e.tag+">");return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||h}function fa(e){var n=e.position,t,i,r,o=!1,s;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap={},e.anchorMap={};(s=e.input.charCodeAt(e.position))!==0&&(L(e,!0,-1),s=e.input.charCodeAt(e.position),!(e.lineIndent>0||s!==37));){for(o=!0,s=e.input.charCodeAt(++e.position),t=e.position;s!==0&&!D(s);)s=e.input.charCodeAt(++e.position);for(i=e.input.slice(t,e.position),r=[],i.length<1&&b(e,"directive name must not be less than one character in length");s!==0;){for(;V(s);)s=e.input.charCodeAt(++e.position);if(s===35){do s=e.input.charCodeAt(++e.position);while(s!==0&&!B(s));break}if(B(s))break;for(t=e.position;s!==0&&!D(s);)s=e.input.charCodeAt(++e.position);r.push(e.input.slice(t,e.position))}s!==0&&nn(e),K.call($n,i)?$n[i](e,i,r):Oe(e,'unknown document directive "'+i+'"')}if(L(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,L(e,!0,-1)):o&&b(e,"directives end mark is expected"),te(e,e.lineIndent-1,Re,!1,!0),L(e,!0,-1),e.checkLineBreaks&&Qs.test(e.input.slice(n,e.position))&&Oe(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&De(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,L(e,!0,-1));return}if(e.position<e.length-1)b(e,"end of the stream or a document separator is expected");else return}function vt(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new ra(e,n),i=e.indexOf("\0");for(i!==-1&&(t.position=i,b(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)fa(t);return t.documents}function wt(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var i=vt(e,t);if(typeof n!="function")return i;for(var r=0,o=i.length;r<o;r+=1)n(i[r])}function xt(e,n){var t=vt(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new ht("expected a single document in the stream, but found more")}}function ma(e,n,t){return typeof n=="object"&&n!==null&&typeof t>"u"&&(t=n,n=null),wt(e,n,$.extend({schema:dt},t))}function ga(e,n){return xt(e,$.extend({schema:dt},n))}pe.loadAll=wt;pe.load=xt;pe.safeLoadAll=ma;pe.safeLoad=ga;var rn={},ge=P,ye=fe,ya=Ne,ba=me,kt=Object.prototype.toString,Ct=Object.prototype.hasOwnProperty,_a=9,de=10,va=13,wa=32,xa=33,ka=34,Tt=35,Ca=37,Ta=38,Aa=39,Sa=42,At=44,Ia=45,St=58,Ea=61,Ma=62,La=63,Ra=64,It=91,Et=93,Oa=96,Mt=123,Fa=124,Lt=125,F={};F[0]="\\0";F[7]="\\a";F[8]="\\b";F[9]="\\t";F[10]="\\n";F[11]="\\v";F[12]="\\f";F[13]="\\r";F[27]="\\e";F[34]='\\"';F[92]="\\\\";F[133]="\\N";F[160]="\\_";F[8232]="\\L";F[8233]="\\P";var Na=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"];function Da(e,n){var t,i,r,o,s,a,l;if(n===null)return{};for(t={},i=Object.keys(n),r=0,o=i.length;r<o;r+=1)s=i[r],a=String(n[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),l=e.compiledTypeMap.fallback[s],l&&Ct.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[s]=a;return t}function Wn(e){var n,t,i;if(n=e.toString(16).toUpperCase(),e<=255)t="x",i=2;else if(e<=65535)t="u",i=4;else if(e<=4294967295)t="U",i=8;else throw new ye("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+ge.repeat("0",i-n.length)+n}function Pa(e){this.schema=e.schema||ya,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=ge.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=Da(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function Yn(e,n){for(var t=ge.repeat(" ",n),i=0,r=-1,o="",s,a=e.length;i<a;)r=e.indexOf(`
`,i),r===-1?(s=e.slice(i),i=a):(s=e.slice(i,r+1),i=r+1),s.length&&s!==`
`&&(o+=t),o+=s;return o}function Ve(e,n){return`
`+ge.repeat(" ",e.indent*n)}function Ua(e,n){var t,i,r;for(t=0,i=e.implicitTypes.length;t<i;t+=1)if(r=e.implicitTypes[t],r.resolve(n))return!0;return!1}function on(e){return e===wa||e===_a}function ie(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==65279||65536<=e&&e<=1114111}function Ha(e){return ie(e)&&!on(e)&&e!==65279&&e!==va&&e!==de}function Kn(e,n){return ie(e)&&e!==65279&&e!==At&&e!==It&&e!==Et&&e!==Mt&&e!==Lt&&e!==St&&(e!==Tt||n&&Ha(n))}function Ba(e){return ie(e)&&e!==65279&&!on(e)&&e!==Ia&&e!==La&&e!==St&&e!==At&&e!==It&&e!==Et&&e!==Mt&&e!==Lt&&e!==Tt&&e!==Ta&&e!==Sa&&e!==xa&&e!==Fa&&e!==Ea&&e!==Ma&&e!==Aa&&e!==ka&&e!==Ca&&e!==Ra&&e!==Oa}function Rt(e){var n=/^\n* /;return n.test(e)}var Ot=1,Ft=2,Nt=3,Dt=4,Ie=5;function $a(e,n,t,i,r){var o,s,a,l=!1,c=!1,h=i!==-1,d=-1,u=Ba(e.charCodeAt(0))&&!on(e.charCodeAt(e.length-1));if(n)for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),!ie(s))return Ie;a=o>0?e.charCodeAt(o-1):null,u=u&&Kn(s,a)}else{for(o=0;o<e.length;o++){if(s=e.charCodeAt(o),s===de)l=!0,h&&(c=c||o-d-1>i&&e[d+1]!==" ",d=o);else if(!ie(s))return Ie;a=o>0?e.charCodeAt(o-1):null,u=u&&Kn(s,a)}c=c||h&&o-d-1>i&&e[d+1]!==" "}return!l&&!c?u&&!r(e)?Ot:Ft:t>9&&Rt(e)?Ie:c?Dt:Nt}function ja(e,n,t,i){e.dump=function(){if(n.length===0)return"''";if(!e.noCompatMode&&Na.indexOf(n)!==-1)return"'"+n+"'";var r=e.indent*Math.max(1,t),o=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-r),s=i||e.flowLevel>-1&&t>=e.flowLevel;function a(l){return Ua(e,l)}switch($a(n,s,e.indent,o,a)){case Ot:return n;case Ft:return"'"+n.replace(/'/g,"''")+"'";case Nt:return"|"+qn(n,e.indent)+zn(Yn(n,r));case Dt:return">"+qn(n,e.indent)+zn(Yn(Ga(n,o),r));case Ie:return'"'+Wa(n)+'"';default:throw new ye("impossible error: invalid scalar style")}}()}function qn(e,n){var t=Rt(e)?String(n):"",i=e[e.length-1]===`
`,r=i&&(e[e.length-2]===`
`||e===`
`),o=r?"+":i?"":"-";return t+o+`
`}function zn(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function Ga(e,n){for(var t=/(\n+)([^\n]*)/g,i=function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,t.lastIndex=c,Vn(e.slice(0,c),n)}(),r=e[0]===`
`||e[0]===" ",o,s;s=t.exec(e);){var a=s[1],l=s[2];o=l[0]===" ",i+=a+(!r&&!o&&l!==""?`
`:"")+Vn(l,n),r=o}return i}function Vn(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,i,r=0,o,s=0,a=0,l="";i=t.exec(e);)a=i.index,a-r>n&&(o=s>r?s:a,l+=`
`+e.slice(r,o),r=o+1),s=a;return l+=`
`,e.length-r>n&&s>r?l+=e.slice(r,s)+`
`+e.slice(s+1):l+=e.slice(r),l.slice(1)}function Wa(e){for(var n="",t,i,r,o=0;o<e.length;o++){if(t=e.charCodeAt(o),t>=55296&&t<=56319&&(i=e.charCodeAt(o+1),i>=56320&&i<=57343)){n+=Wn((t-55296)*1024+i-56320+65536),o++;continue}r=F[t],n+=!r&&ie(t)?e[o]:r||Wn(t)}return n}function Ya(e,n,t){var i="",r=e.tag,o,s;for(o=0,s=t.length;o<s;o+=1)X(e,n,t[o],!1,!1)&&(o!==0&&(i+=","+(e.condenseFlow?"":" ")),i+=e.dump);e.tag=r,e.dump="["+i+"]"}function Ka(e,n,t,i){var r="",o=e.tag,s,a;for(s=0,a=t.length;s<a;s+=1)X(e,n+1,t[s],!0,!0)&&((!i||s!==0)&&(r+=Ve(e,n)),e.dump&&de===e.dump.charCodeAt(0)?r+="-":r+="- ",r+=e.dump);e.tag=o,e.dump=r||"[]"}function qa(e,n,t){var i="",r=e.tag,o=Object.keys(t),s,a,l,c,h;for(s=0,a=o.length;s<a;s+=1)h="",s!==0&&(h+=", "),e.condenseFlow&&(h+='"'),l=o[s],c=t[l],X(e,n,l,!1,!1)&&(e.dump.length>1024&&(h+="? "),h+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),X(e,n,c,!1,!1)&&(h+=e.dump,i+=h));e.tag=r,e.dump="{"+i+"}"}function za(e,n,t,i){var r="",o=e.tag,s=Object.keys(t),a,l,c,h,d,u;if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys=="function")s.sort(e.sortKeys);else if(e.sortKeys)throw new ye("sortKeys must be a boolean or a function");for(a=0,l=s.length;a<l;a+=1)u="",(!i||a!==0)&&(u+=Ve(e,n)),c=s[a],h=t[c],X(e,n+1,c,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&de===e.dump.charCodeAt(0)?u+="?":u+="? "),u+=e.dump,d&&(u+=Ve(e,n)),X(e,n+1,h,!0,d)&&(e.dump&&de===e.dump.charCodeAt(0)?u+=":":u+=": ",u+=e.dump,r+=u));e.tag=o,e.dump=r||"{}"}function Xn(e,n,t){var i,r,o,s,a,l;for(r=t?e.explicitTypes:e.implicitTypes,o=0,s=r.length;o<s;o+=1)if(a=r[o],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof n=="object"&&n instanceof a.instanceOf)&&(!a.predicate||a.predicate(n))){if(e.tag=t?a.tag:"?",a.represent){if(l=e.styleMap[a.tag]||a.defaultStyle,kt.call(a.represent)==="[object Function]")i=a.represent(n,l);else if(Ct.call(a.represent,l))i=a.represent[l](n,l);else throw new ye("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');e.dump=i}return!0}return!1}function X(e,n,t,i,r,o){e.tag=null,e.dump=t,Xn(e,t,!1)||Xn(e,t,!0);var s=kt.call(e.dump);i&&(i=e.flowLevel<0||e.flowLevel>n);var a=s==="[object Object]"||s==="[object Array]",l,c;if(a&&(l=e.duplicates.indexOf(t),c=l!==-1),(e.tag!==null&&e.tag!=="?"||c||e.indent!==2&&n>0)&&(r=!1),c&&e.usedDuplicates[l])e.dump="*ref_"+l;else{if(a&&c&&!e.usedDuplicates[l]&&(e.usedDuplicates[l]=!0),s==="[object Object]")i&&Object.keys(e.dump).length!==0?(za(e,n,e.dump,r),c&&(e.dump="&ref_"+l+e.dump)):(qa(e,n,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump));else if(s==="[object Array]"){var h=e.noArrayIndent&&n>0?n-1:n;i&&e.dump.length!==0?(Ka(e,h,e.dump,r),c&&(e.dump="&ref_"+l+e.dump)):(Ya(e,h,e.dump),c&&(e.dump="&ref_"+l+" "+e.dump))}else if(s==="[object String]")e.tag!=="?"&&ja(e,e.dump,n,o);else{if(e.skipInvalid)return!1;throw new ye("unacceptable kind of an object to dump "+s)}e.tag!==null&&e.tag!=="?"&&(e.dump="!<"+e.tag+"> "+e.dump)}return!0}function Va(e,n){var t=[],i=[],r,o;for(Xe(e,t,i),r=0,o=i.length;r<o;r+=1)n.duplicates.push(t[i[r]]);n.usedDuplicates=new Array(o)}function Xe(e,n,t){var i,r,o;if(e!==null&&typeof e=="object")if(r=n.indexOf(e),r!==-1)t.indexOf(r)===-1&&t.push(r);else if(n.push(e),Array.isArray(e))for(r=0,o=e.length;r<o;r+=1)Xe(e[r],n,t);else for(i=Object.keys(e),r=0,o=i.length;r<o;r+=1)Xe(e[i[r]],n,t)}function Pt(e,n){n=n||{};var t=new Pa(n);return t.noRefs||Va(e,t),X(t,0,e,!0,!0)?t.dump+`
`:""}function Xa(e,n){return Pt(e,ge.extend({schema:ba},n))}rn.dump=Pt;rn.safeDump=Xa;var Pe=pe,Ut=rn;function Ue(e){return function(){throw new Error("Function "+e+" is deprecated and cannot be used.")}}E.Type=O;E.Schema=re;E.FAILSAFE_SCHEMA=Ze;E.JSON_SCHEMA=ot;E.CORE_SCHEMA=st;E.DEFAULT_SAFE_SCHEMA=me;E.DEFAULT_FULL_SCHEMA=Ne;E.load=Pe.load;E.loadAll=Pe.loadAll;E.safeLoad=Pe.safeLoad;E.safeLoadAll=Pe.safeLoadAll;E.dump=Ut.dump;E.safeDump=Ut.safeDump;E.YAMLException=fe;E.MINIMAL_SCHEMA=Ze;E.SAFE_SCHEMA=me;E.DEFAULT_SCHEMA=Ne;E.scan=Ue("scan");E.parse=Ue("parse");E.compose=Ue("compose");E.addConstructor=Ue("addConstructor");var Ja=E,Qa=Ja;function Za(e){if(!e.startsWith(`---
`))return{data:{},content:e};const n=e.indexOf(`
---`,4);if(n===-1)return{data:{},content:e};const t=e.slice(4,n),i=e.slice(n+4),r=i.startsWith(`
`)?i.slice(1):i;return{data:Qa.safeLoad(t)??{},content:r}}function el(e){const n={settings:{player:{name:"Captain",startingCredits:0},startingLocation:{system:"",destination:""},startingShip:""},systems:[],destinations:[],routes:[],drives:[],ships:[],factions:[],commodities:[],storyBeats:[]};for(const[t,i]of Object.entries(e)){const r=t.split("/").pop()??"";if(r==="_template.md"||r===".gitkeep")continue;const{data:o,content:s}=Za(i);/^systems\/[^/]+\.md$/.test(t)?n.systems.push(nl(o,s)):/^destinations\/[^/]+\.md$/.test(t)?n.destinations.push(tl(o,s)):/^factions\/[^/]+\.md$/.test(t)?n.factions.push(il(o,s)):/^ships\/[^/]+\.md$/.test(t)?n.ships.push(rl(o,s)):t==="ships/components/jump-drives.md"?n.drives=ol(o):t==="navigation/jump-routes.md"?n.routes=sl(o):t==="commodities.md"?n.commodities=al(o):/^story\/[^/]+\.md$/.test(t)?n.storyBeats.push(ll(o,s)):t==="game-settings.md"&&(n.settings=cl(o))}return n}function He(e){const n=[];let t=!1;for(const i of e.split(`
`)){const r=i.trim();if(!r.startsWith("#"))if(r===""){if(t)break}else t=!0,n.push(r)}return n.join(" ")}function nl(e,n){return{id:e.id,name:e.name,starType:e.star_type,distanceFromSol:e.distance_from_sol,zone:e.zone,security:e.security,population:e.population,dangerLevel:e.danger_level,playerKnowledge:e.player_knowledge,economy:e.economy??[],majorFactions:e.major_factions??[],destinations:e.destinations??[],tags:e.tags??[],description:He(n)}}function tl(e,n){const t=e.amenities??{},i={trader:t.trader??!1,missionBoard:t.mission_board??!1,shipRepair:t.ship_repair??!1,fuel:t.fuel??!1,shipDealer:t.ship_dealer??!1};return{id:e.id,name:e.name,system:e.system,locationType:e.location_type,type:e.type,amenities:i,npcs:e.npcs??{},goodsBias:e.goods_bias??[],dangerLevel:e.danger_level,tags:e.tags??[],description:He(n)}}function il(e,n){return{id:e.id,name:e.name,type:e.type,homeSystem:e.home_system,size:e.size,influence:e.influence??[],tags:e.tags??[],description:He(n)}}function rl(e,n){return{id:e.id,name:e.name,class:e.class,cost:e.cost,cargoCapacityKg:e.cargo_capacity_kg,fuelCapacityL:e.fuel_capacity_l,hullPoints:e.hull_points,defaultJumpDrive:e.default_jump_drive,tags:e.tags??[],description:He(n)}}function ol(e){return(e.drives??[]).map(t=>({id:t.id,name:t.name,maxDistanceLy:t.max_distance_ly,fuelEfficiency:t.fuel_efficiency,cost:t.cost}))}function sl(e){return(e.routes??[]).map(t=>({from:t.from,to:t.to,distance:t.distance,stability:t.stability,security:t.security}))}function al(e){return(e.commodities??[]).map(t=>({id:t.id,name:t.name,basePrice:t.base_price,category:t.category,legal:t.legal,weightKg:t.weight_kg,description:t.description??""}))}function ll(e,n){return{id:e.id,title:e.title,trigger:e.trigger,type:e.type,location:e.location,skippable:e.skippable,playerKnowledge:e.player_knowledge,text:n.trim()}}function cl(e){var n,t,i,r;return{player:{name:((n=e.player)==null?void 0:n.name)??"Captain",startingCredits:((t=e.player)==null?void 0:t.starting_credits)??0},startingLocation:{system:((i=e.starting_location)==null?void 0:i.system)??"",destination:((r=e.starting_location)==null?void 0:r.destination)??""},startingShip:e.starting_ship??""}}function hl(){const e=Object.assign({"/docs/world/commodities.md":sr,"/docs/world/destinations/_template.md":ar,"/docs/world/destinations/blackwake-yard.md":lr,"/docs/world/destinations/ceti-landfall.md":cr,"/docs/world/destinations/drift-market.md":hr,"/docs/world/destinations/elysium-station.md":dr,"/docs/world/destinations/eridani-anchorage.md":ur,"/docs/world/destinations/foundries-platform.md":pr,"/docs/world/destinations/galileo-transfer.md":fr,"/docs/world/destinations/hestia-ring.md":mr,"/docs/world/destinations/keelhaul-station.md":gr,"/docs/world/destinations/kepler-yard.md":yr,"/docs/world/destinations/mars-anchor.md":br,"/docs/world/destinations/meridian-station.md":_r,"/docs/world/destinations/new-horizon-port.md":vr,"/docs/world/destinations/orrery-anchorage.md":wr,"/docs/world/destinations/redline-station.md":xr,"/docs/world/destinations/tycho-orbital.md":kr,"/docs/world/destinations/veil-station.md":Cr,"/docs/world/destinations/waypoint-ceti.md":Tr,"/docs/world/factions/_template.md":Ar,"/docs/world/factions/centauri-trade-league.md":Sr,"/docs/world/factions/eridani-colonial-council.md":Ir,"/docs/world/factions/free-captains.md":Er,"/docs/world/factions/grey-market-cartel.md":Mr,"/docs/world/factions/helios-directorate.md":Lr,"/docs/world/factions/independent-miners-guild.md":Rr,"/docs/world/factions/procyon-institute.md":Or,"/docs/world/factions/terran-union.md":Fr,"/docs/world/galaxy-map.md":Nr,"/docs/world/game-settings.md":Dr,"/docs/world/navigation/jump-routes.md":Pr,"/docs/world/ships/_template.md":Ur,"/docs/world/ships/components/jump-drives.md":Hr,"/docs/world/ships/freighter.md":Br,"/docs/world/ships/hauler.md":$r,"/docs/world/ships/scout.md":jr,"/docs/world/story/_template.md":Gr,"/docs/world/story/enter-wolf-359.md":Wr,"/docs/world/story/first-jump.md":Yr,"/docs/world/story/opening-arrival.md":Kr,"/docs/world/systems/_template.md":qr,"/docs/world/systems/alpha-centauri.md":zr,"/docs/world/systems/barnards-star.md":Vr,"/docs/world/systems/epsilon-eridani.md":Xr,"/docs/world/systems/procyon.md":Jr,"/docs/world/systems/sirius.md":Qr,"/docs/world/systems/sol.md":Zr,"/docs/world/systems/tau-ceti.md":eo,"/docs/world/systems/wolf-359.md":no}),n={};for(const[t,i]of Object.entries(e)){const r=t.replace("/docs/world/","");n[r]=i}return el(n)}ei(hl());const dl=navigator.maxTouchPoints>0?"touch":"keyboard",ul=new URLSearchParams(window.location.search).has("debug"),Ht={environment:"browser",primaryInput:dl,debug:ul},pl=new Yt,Bt=new Vt(Ht);Bt.connect();const fl=new or(pl,Bt,Ht);let Jn=0;function $t(e){fl.tick(e-Jn),Jn=e,requestAnimationFrame($t)}requestAnimationFrame($t);
