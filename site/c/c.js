// Prototype C: storm intro (flash, shockwave, shake, embers, shards, smoke, title slam), then A's hero and B's sections.
(function(){
const $=id=>document.getElementById(id);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const params=new URLSearchParams(location.search);
const freeze=params.has('t')?parseFloat(params.get('t')):null;
const still=params.has('still');
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Number(n).toLocaleString('sv-SE');

// ---------- particles ----------
const cv=$('fx'), ctx=cv.getContext('2d');
let W=0,H=0,DPR=1;
function resize(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)}
resize(); addEventListener('resize',resize);
const sprite=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,232,190,.9)');gr.addColorStop(.6,'rgba(255,150,70,.35)');gr.addColorStop(1,'rgba(255,110,50,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return c})();
const cyanSprite=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(180,240,255,.9)');gr.addColorStop(.65,'rgba(79,209,255,.3)');gr.addColorStop(1,'rgba(79,209,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return c})();
const smokeSprite=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(140,150,165,.6)');gr.addColorStop(.5,'rgba(100,108,120,.28)');gr.addColorStop(1,'rgba(70,76,86,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);return c})();
let embers=[],shards=[],smoke=[],ambient=false,ambientAcc=0;
const R=rng(4242);
function burst(cx,cy){
  for(let i=0;i<300;i++){const a=R()*Math.PI*2,s=120+R()*1100;embers.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-140,life:0,max:1.1+R()*1.8,size:1.5+R()*3.5,w:R()*6,cyan:R()<.3})}
  for(let i=0;i<60;i++){const a=R()*Math.PI*2,s=350+R()*1400,n=3+Math.floor(R()*3);const pts=[];for(let k=0;k<n;k++){const r=6+R()*24,t=k/n*Math.PI*2+R()*.6;pts.push([Math.cos(t)*r,Math.sin(t)*r])}shards.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-220,rot:R()*6,vr:(R()-.5)*14,life:0,max:1.2+R()*.9,pts})}
  for(let i=0;i<20;i++){const a=R()*Math.PI*2,s=60+R()*280;smoke.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-40,r:60+R()*90,life:0,max:2+R()*1.3})}
}
function spawnAmbient(dt){ambientAcc+=dt*12;while(ambientAcc>1){ambientAcc-=1;embers.push({x:R()*W,y:H+10,vx:(R()-.5)*30,vy:-30-R()*90,life:0,max:4+R()*4,size:1+R()*2.2,w:R()*6,amb:true,cyan:R()<.5})}}
function step(dt){
  for(const p of embers){p.life+=dt;if(!p.amb){p.vx*=Math.pow(.2,dt);p.vy=p.vy*Math.pow(.25,dt)-70*dt}p.x+=p.vx*dt+Math.sin(p.life*3+p.w)*18*dt;p.y+=p.vy*dt}
  embers=embers.filter(p=>p.life<p.max&&p.y>-20);
  for(const s of shards){s.life+=dt;s.vy+=1500*dt;s.vx*=Math.pow(.5,dt);s.x+=s.vx*dt;s.y+=s.vy*dt;s.rot+=s.vr*dt}
  shards=shards.filter(s=>s.life<s.max&&s.y<H+60);
  for(const m of smoke){m.life+=dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.vx*=Math.pow(.4,dt);m.vy*=Math.pow(.4,dt);m.r+=90*dt}
  smoke=smoke.filter(m=>m.life<m.max);
  if(ambient) spawnAmbient(dt);
}
function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.globalCompositeOperation='source-over';
  for(const m of smoke){ctx.globalAlpha=Math.max(0,(1-m.life/m.max)*.9);ctx.drawImage(smokeSprite,m.x-m.r,m.y-m.r,m.r*2,m.r*2)}
  for(const s of shards){const a=1-Math.max(0,(s.life-.6)/(s.max-.6));ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);ctx.globalAlpha=Math.max(0,a);ctx.fillStyle='#2a323d';ctx.strokeStyle='rgba(79,209,255,.5)';ctx.lineWidth=1;ctx.beginPath();s.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
  ctx.globalCompositeOperation='lighter';
  for(const p of embers){const t=p.life/p.max,a=(1-t)*(p.amb?.5:1),sz=p.size*(p.amb?3:4)*(1-t*.5);ctx.globalAlpha=Math.max(0,a);ctx.drawImage(p.cyan?cyanSprite:sprite,p.x-sz,p.y-sz,sz*2,sz*2)}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}

// ---------- intro timeline ----------
const BOOM=0.95, OUT=2.45, END=3.4;
const intro=$('intro'), page=$('page'), radio=[...$('radio').children];
function shakeAt(t){
  if(t<0||t>1.3){page.style.transform='';intro.style.transform='';return}
  const amp=28*Math.exp(-t*3.4), r=rng(Math.floor(t*60)+7);
  const tr=`translate(${((r()-.5)*2*amp).toFixed(1)}px,${((r()-.5)*2*amp).toFixed(1)}px) rotate(${((r()-.5)*amp*.08).toFixed(2)}deg)`;
  page.style.transform=tr; intro.style.transform=tr;
}
function stateAt(t){
  radio.forEach((d,i)=>{const show=t>0.15+i*0.26;d.classList.toggle('show',show);d.classList.toggle('last',show&&(i===radio.length-1||t<=0.15+(i+1)*0.26))});
  intro.classList.toggle('boom',t>=BOOM);
  intro.classList.toggle('out',t>=OUT);
  document.documentElement.classList.toggle('revealed',t>=OUT+0.05);
  shakeAt(t-BOOM);
}
let finished=false;
function finish(){
  if(finished) return; finished=true;
  intro.classList.add('boom','out','done'); document.documentElement.classList.add('revealed');
  page.style.transform=''; cv.classList.add('ambient'); ambient=true;
  
  let last=performance.now();
  const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;step(dt);draw();cv.style.opacity=String(Math.max(0,1-scrollY/(innerHeight*.9)));if(cv.style.opacity!=='0') requestAnimationFrame(loop); else {cv.style.opacity='0'; const back=()=>{if(scrollY<innerHeight*.9){removeEventListener('scroll',back);last=performance.now();requestAnimationFrame(loop)}}; addEventListener('scroll',back)}};
  if(!still) requestAnimationFrame(loop);
}
$('skip').addEventListener('click',e=>{e.stopPropagation();finish()});
intro.addEventListener('click',()=>{if(!finished&&intro.classList.contains('boom')) finish()});
if(reduced){ intro.classList.add('done'); document.documentElement.classList.add('nointro'); }
else if(still){ document.documentElement.classList.add('still'); finished=true; intro.classList.add('done'); document.documentElement.classList.add('nointro'); cv.classList.add('ambient'); ambient=true; for(let i=0;i<120;i++) step(1/30); draw(); }
else if(freeze!=null){
  stateAt(freeze);
  intro.style.setProperty('--ad',(-(Math.max(0,freeze-BOOM))).toFixed(3)+'s'); intro.style.setProperty('--ps','paused');
  if(freeze>=BOOM){burst(innerWidth/2,innerHeight/2); const n=Math.round((freeze-BOOM)*60); for(let i=0;i<n;i++) step(1/60)}
  draw();
}
else {
  let t0=null,last=null,boomed=false;
  const frame=now=>{ if(t0==null){t0=now;last=now} const t=(now-t0)/1000, dt=Math.min(.05,(now-last)/1000); last=now;
    if(finished) return; stateAt(t); if(t>=BOOM&&!boomed){boomed=true;burst(W/2,H/2)} step(dt); draw();
    if(t>=END) finish(); else requestAnimationFrame(frame) };
  requestAnimationFrame(frame);
}

// ---------- mega hero: parallax + stage switcher ----------
const hero=$('hero');
if(hero&&matchMedia('(hover:hover)').matches&&!reduced){addEventListener('mousemove',e=>{hero.style.setProperty('--mx',((e.clientX/innerWidth)-.5).toFixed(3));hero.style.setProperty('--my',((e.clientY/innerHeight)-.5).toFixed(3))})}
const STAGES=[
 {k:'// stage 01 · avatar.rbxm',t:'Your avatar<br>as it arrives',s:'R6 rig, blocky parts, default face. This is what every operator starts as.'},
 {k:'// stage 02 · rig rewrite',t:'Bones<br>remapped',s:'Fifteen joints, inverse kinematics for the launcher carry, a spine that can actually lean.'},
 {k:'// stage 03 · shader compile',t:'Shaders<br>compiling',s:'Camo, helmet and night vision materials compile while the hologram shows the target.'},
 {k:'// season 1 · live on roblox',t:'Reprogram<br>your avatar',s:'Five classes. Jets, helicopters, bikes. An NLAW that actually locks on. Free on Roblox.'}];
let cur=3;
function showStage(i){cur=(i+4)%4; hero.querySelectorAll('.stagefig').forEach((f,k)=>f.classList.toggle('on',k===cur)); $('mega-kicker').textContent=STAGES[cur].k; $('mega-title').innerHTML=STAGES[cur].t; $('mega-sub').textContent=STAGES[cur].s; $('dots').innerHTML=STAGES.map((_,k)=>`<i class="${k===cur?'on':''}" data-i="${k}"></i>`).join(''); $('dots').querySelectorAll('i').forEach(d=>d.onclick=()=>showStage(+d.dataset.i)); if(!reduced){hero.classList.remove('glitch');void hero.offsetWidth;hero.classList.add('glitch')}}
$('prev').onclick=()=>showStage(cur-1); $('next').onclick=()=>showStage(cur+1);
addEventListener('keydown',e=>{if(e.key==='ArrowLeft') showStage(cur-1); if(e.key==='ArrowRight') showStage(cur+1)});
showStage(3); hero.classList.remove('glitch');

if(params.has('debug')){addEventListener('load',()=>{const r=s=>{const e=document.querySelector(s);if(!e)return s+': none';const b=e.getBoundingClientRect();return `${s}: x=${b.left.toFixed(0)} w=${b.width.toFixed(0)}`};const pre=document.createElement('pre');pre.id='dbg';pre.textContent=['html','body','.page','.cnav','.cnav-top','.mega','.mega-copy','#mega-title','.cta','.hud-stats','.ticker','#posters','#path','.hangar .grid2','.band'].map(r).join('\n')+'\nscrollWidth='+document.documentElement.scrollWidth+' innerWidth='+innerWidth;document.body.appendChild(pre)})}
// ---------- sections (layout from B, look of A) ----------
const SIL={
 rifle:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,22 22,20 24,32 4,34"/><rect x="22" y="19" width="70" height="14" rx="2"/><rect x="90" y="22" width="46" height="6" rx="1"/><rect x="96" y="28" width="22" height="4"/><rect x="40" y="12" width="26" height="7" rx="1"/><rect x="88" y="15" width="4" height="7"/><polygon points="56,33 70,33 76,56 62,56"/><polygon points="80,33 91,33 93,50 85,50"/></svg>',
 launcher:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="4" y="22" width="132" height="14" rx="7"/><rect x="40" y="12" width="30" height="10" rx="3"/><rect x="46" y="8" width="8" height="5"/><polygon points="56,36 70,36 74,52 60,52"/><rect x="100" y="36" width="10" height="8"/><rect x="118" y="19" width="10" height="20" rx="3"/></svg>',
 sniper:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,24 20,20 22,34 6,36"/><rect x="20" y="21" width="62" height="12" rx="2"/><rect x="80" y="24" width="58" height="5" rx="1"/><rect x="34" y="11" width="34" height="8" rx="3"/><rect x="30" y="17" width="6" height="5"/><rect x="62" y="17" width="6" height="5"/><polygon points="52,33 62,33 64,50 54,50"/><polygon points="72,33 82,33 84,48 76,48"/><rect x="100" y="29" width="3" height="12"/><rect x="110" y="29" width="3" height="12"/></svg>',
 lmg:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,20 20,18 22,34 4,36"/><rect x="20" y="17" width="76" height="18" rx="3"/><rect x="94" y="23" width="44" height="7" rx="1"/><rect x="44" y="10" width="24" height="8" rx="1"/><rect x="48" y="35" width="26" height="18" rx="2"/><polygon points="80,35 92,35 94,52 86,52"/><rect x="104" y="30" width="3" height="16"/><rect x="118" y="30" width="3" height="16"/></svg>',
 pistol:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="30" y="14" width="90" height="16" rx="2"/><polygon points="34,30 60,30 56,58 30,58"/><rect x="60" y="30" width="10" height="8"/><rect x="112" y="18" width="12" height="8"/></svg>'};
const CLASSES=[
 {n:'01',name:'Assault',color:'#ffb347',sil:'rifle',line:'Rifles that work everywhere. The spine of every squad.',list:['AK-74','M4A1','SCAR-H','AUG A3','G36C','FAMAS']},
 {n:'02',name:'Engineer',color:'#4fd1ff',sil:'launcher',line:'SMGs up close and the NLAW for anything with an engine.',list:['NLAW','MP5-K','UMP45','P90','Vector','MP7']},
 {n:'03',name:'Recon',color:'#6c8cff',sil:'sniper',line:'One shot from the ridge. Downs a jet pilot through the canopy.',list:['AWM','M24','Mosin','SVD','Intervention','MK12']},
 {n:'04',name:'Support',color:'#ff5a5a',sil:'lmg',line:'Belts, bipods and suppression. Own the lane.',list:['M249','PKM','MG3','RPK','M60','Negev']},
 {n:'05',name:'Sidearms',color:'#f5f8ff',sil:'pistol',line:'Plan B for everyone. Plan A for the brave.',list:['M9','Glock 17','Desert Eagle','M1911','Five-seveN','Revolver']}];
const TIERS=[["Root","#ff4b4b",0],["Sacral","#ff9a3c",800],["Solar","#ffd93b",1000],["Heart","#5fe07a",1200],["Throat","#4f8dff",1400],["Third Eye","#ff5ad6",1700],["Crown","#f4ecff",2000]];
const VEH=[['F-14 strike jet','2 seats · AA missiles · bail-out','../img/veh-jet.jpg'],['Little Bird','4 seats · minigun · fast insert','../img/veh-heli.jpg'],['Enduro bike','1 seat · fastest on land','../img/veh-bike.jpg'],['Jetski','2 seats · water · bouncy swell','../img/veh-car.jpg'],['Humvee','4 seats · roof MG · takes two NLAW hits','../img/bg-hangar.jpg'],['Transport truck','8 seats · moves the whole team','../img/bg-hangar.jpg']];
$('posters').innerHTML=CLASSES.map(c=>`<a class="poster" href="../arsenal.html?tab=${c.name.toLowerCase()}" style="--pc:${c.color}"><span class="num">${c.n}</span><div class="sil">${SIL[c.sil]}</div><div class="list">${c.list.join('<br>')}</div><div class="sign-lite"><h3>${c.name}</h3><p>${c.line}</p></div></a>`).join('');
const pts=TIERS.map((t,i)=>[6+i*(88/6), 70-Math.sin(i/6*Math.PI)*34]);
$('path').innerHTML=`<svg class="line" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#ff4b4b"/><stop offset=".5" stop-color="#5fe07a"/><stop offset="1" stop-color="#f4ecff"/></linearGradient></defs><path d="${pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ')}" fill="none" stroke="url(#lg)" stroke-width=".6" vector-effect="non-scaling-stroke" opacity=".8"/></svg>`+TIERS.map((t,i)=>`<div class="orb" style="left:${pts[i][0]}%;top:${pts[i][1]}%;--tc:${t[1]}" title="${t[0]}: ${t[2]?fmt(t[2])+' rating and up':'start tier'}">${window.orbSVG?window.orbSVG(t[1],52):''}<div><b>${t[0]}</b>${t[2]?fmt(t[2])+'+':'start'}</div></div>`).join('');
$('vlist').innerHTML=VEH.map((v,i)=>`<div class="vrow"><span class="n">0${i+1}</span><h3>${esc(v[0])}</h3><span class="spec">${esc(v[1])}</span><span class="thumb" style="background-image:url(${v[2]})"></span></div>`).join('');
window.Save6Data.snapshot.then(snap=>{
  const board=snap.boards.rating?'rating':'kills', list=(snap.boards[board]||[]).slice(0,3);
  $('top3').innerHTML=list.map((e,i)=>`<div class="t3 tilt"><span class="rank">${i+1}</span><div class="who"><b>${esc(e.displayName||e.name)}</b><span>${board==='rating'?(TIERS.slice().reverse().find(t=>e.value>=t[2])||TIERS[0])[0]:'season '+snap.season}</span></div><span class="val">${fmt(e.value)}</span></div>`).join('');
  const live=snap.live||{}, jets=(snap.boards.jets||[])[0], top=list[0];
  const items=[`<b>${fmt(live.playing??0)}</b> operators online`,`<b>${fmt(live.visits??0)}</b> visits all time`,`season 1 ends in <b>${window.Save6Data.countdown((window.SAVE6||{}).seasonEnd)}</b>`,top?`top ${board}: <b>${esc(top.displayName||top.name)}</b> ${fmt(top.value)}`:'',jets?`most jets downed: <b>${esc(jets.displayName||jets.name)}</b> ${fmt(jets.value)}`:'',`new: <b>NLAW shoulder carry</b> animation`,`new: <b>F-14 bail-out</b> crash sequence`].filter(Boolean);
  const html=items.map(s=>`<span>${s}</span>`).join(''); $('ticker').innerHTML=html+html;
  if(window.reveal) window.reveal();
});
})();
