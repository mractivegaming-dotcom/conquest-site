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

if(params.has('debug')){addEventListener('load',()=>{const r=s=>{const e=document.querySelector(s);if(!e)return s+': none';const b=e.getBoundingClientRect();return `${s}: x=${b.left.toFixed(0)} w=${b.width.toFixed(0)}`};const pre=document.createElement('pre');pre.id='dbg';pre.textContent=['html','body','.page','.cnav','.cnav-top','.mega','.mega-copy','#mega-title','.cta','.hud-stats','.ticker','#posters','#path','.hangar .grid2','.band'].map(r).join('\n')+'\nscrollWidth='+document.documentElement.scrollWidth+' innerWidth='+innerWidth+' innerHeight='+innerHeight+' scrollY='+scrollY+' scrollHeight='+document.documentElement.scrollHeight+' activeCls='+document.querySelectorAll('.cls.active').length+' classesTop='+document.getElementById('classes').getBoundingClientRect().top.toFixed(0)+' stickyH='+document.querySelector('#classes .sticky').offsetHeight;document.body.appendChild(pre)})}
// ---------- scroll-driven stages: classes, ranks + world list ----------
const SIL={
 rifle:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,22 22,20 24,32 4,34"/><rect x="22" y="19" width="70" height="14" rx="2"/><rect x="90" y="22" width="46" height="6" rx="1"/><rect x="96" y="28" width="22" height="4"/><rect x="40" y="12" width="26" height="7" rx="1"/><rect x="88" y="15" width="4" height="7"/><polygon points="56,33 70,33 76,56 62,56"/><polygon points="80,33 91,33 93,50 85,50"/></svg>',
 smg:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="2" y="20" width="6" height="11" rx="1"/><rect x="6" y="23" width="22" height="5"/><rect x="26" y="19" width="80" height="15" rx="2"/><rect x="104" y="24" width="30" height="6" rx="1"/><rect x="50" y="13" width="10" height="6"/><rect x="97" y="14" width="5" height="5"/><polygon points="62,34 76,34 79,57 65,57"/><polygon points="84,34 95,34 97,52 88,52"/></svg>',
 pdw:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="8" y="18" width="100" height="18" rx="6"/><rect x="106" y="24" width="28" height="6" rx="1"/><rect x="40" y="12" width="40" height="6" rx="2"/><polygon points="50,36 68,36 70,54 54,54"/><polygon points="78,36 90,36 92,50 84,50"/><rect x="2" y="20" width="8" height="14" rx="2"/></svg>',
 launcher:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="4" y="22" width="132" height="14" rx="7"/><rect x="40" y="12" width="30" height="10" rx="3"/><rect x="46" y="8" width="8" height="5"/><polygon points="56,36 70,36 74,52 60,52"/><rect x="100" y="36" width="10" height="8"/><rect x="118" y="19" width="10" height="20" rx="3"/></svg>',
 sniper:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,24 20,20 22,34 6,36"/><rect x="20" y="21" width="62" height="12" rx="2"/><rect x="80" y="24" width="58" height="5" rx="1"/><rect x="34" y="11" width="34" height="8" rx="3"/><rect x="30" y="17" width="6" height="5"/><rect x="62" y="17" width="6" height="5"/><polygon points="52,33 62,33 64,50 54,50"/><polygon points="72,33 82,33 84,48 76,48"/><rect x="100" y="29" width="3" height="12"/><rect x="110" y="29" width="3" height="12"/></svg>',
 lmg:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,20 20,18 22,34 4,36"/><rect x="20" y="17" width="76" height="18" rx="3"/><rect x="94" y="23" width="44" height="7" rx="1"/><rect x="44" y="10" width="24" height="8" rx="1"/><rect x="48" y="35" width="26" height="18" rx="2"/><polygon points="80,35 92,35 94,52 86,52"/><rect x="104" y="30" width="3" height="16"/><rect x="118" y="30" width="3" height="16"/></svg>',
 pistol:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="30" y="14" width="90" height="16" rx="2"/><polygon points="34,30 60,30 56,58 30,58"/><rect x="60" y="30" width="10" height="8"/><rect x="112" y="18" width="12" height="8"/></svg>'};
const WPN=(n,t,s,lk)=>({n,t,s,lk});
const CLASSES=[
 {n:'01',name:'Assault',color:'#ffb347',tint:'rgba(255,179,71,.14)',line:'Rifles that work everywhere. The spine of every squad.',stats:[['Damage',76],['Range',62],['Mobility',62]],weapons:[WPN('AK-74','Assault rifle','rifle','Root'),WPN('M4A1','Assault rifle','rifle','Solar'),WPN('SCAR-H','Battle rifle','rifle','Heart'),WPN('AUG A3','Assault rifle','rifle','Throat'),WPN('G36C','Assault rifle','rifle','Sacral'),WPN('FAMAS','Burst rifle','rifle','Third Eye')]},
 {n:'02',name:'Engineer',color:'#4fd1ff',tint:'rgba(79,209,255,.14)',line:'SMGs up close and the NLAW for anything with an engine.',stats:[['Damage',62],['Range',48],['Mobility',84]],weapons:[WPN('NLAW','Launcher','launcher','Throat'),WPN('MP5-K','SMG','smg','Root'),WPN('UMP45','SMG','smg','Sacral'),WPN('P90','PDW','pdw','Solar'),WPN('Vector','SMG','pdw','Throat'),WPN('MP7','PDW','pdw','Third Eye')]},
 {n:'03',name:'Recon',color:'#6c8cff',tint:'rgba(108,140,255,.14)',line:'One shot from the ridge. Downs a jet pilot through the canopy.',stats:[['Damage',96],['Range',94],['Mobility',44]],weapons:[WPN('M24','Bolt-action','sniper','Root'),WPN('Mosin','Bolt-action','sniper','Sacral'),WPN('SVD','Marksman','sniper','Heart'),WPN('MK12 DMR','Marksman','rifle','Solar'),WPN('AWM','Bolt-action','sniper','Third Eye'),WPN('Intervention','Bolt-action','sniper','Crown')]},
 {n:'04',name:'Support',color:'#ff5a5a',tint:'rgba(255,90,90,.14)',line:'Belts, bipods and suppression. Own the lane.',stats:[['Damage',78],['Range',68],['Mobility',36]],weapons:[WPN('M249','LMG','lmg','Root'),WPN('RPK','LMG','lmg','Sacral'),WPN('Negev','LMG','lmg','Solar'),WPN('PKM','LMG','lmg','Throat'),WPN('M60','LMG','lmg','Heart'),WPN('MG3','LMG','lmg','Third Eye')]},
 {n:'05',name:'Sidearms',color:'#f5f8ff',tint:'rgba(245,248,255,.10)',line:'Plan B for everyone. Plan A for the brave.',stats:[['Damage',56],['Range',38],['Mobility',94]],weapons:[WPN('M9','Pistol','pistol','Root'),WPN('Glock 17','Pistol','pistol','Sacral'),WPN('M1911','Pistol','pistol','Solar'),WPN('Five-seveN','Pistol','pistol','Heart'),WPN('Desert Eagle','Pistol','pistol','Third Eye'),WPN('Revolver','Revolver','pistol','Crown')]}];
const TIERS=[
 {name:'Root',color:'#ff4b4b',min:0,desc:'Where every operator starts. The basic kit of each class is yours from the first match.',cos:['Starter camo']},
 {name:'Sacral',color:'#ff9a3c',min:800,desc:'You have won more than you lost. Second weapons open across the wall.',cos:['Rust bike skin']},
 {name:'Solar',color:'#ffd93b',min:1000,desc:'Consistent. Mid-tier rifles, PDWs and the Negev come off the rack.',cos:['Solar nameplate']},
 {name:'Heart',color:'#5fe07a',min:1200,desc:'Top third of the server. Heavier hitters and access to the Little Bird.',cos:['Little Bird access']},
 {name:'Throat',color:'#4f8dff',min:1400,desc:'The NLAW unlocks here. Vehicles start fearing you.',cos:['NLAW decal']},
 {name:'Third Eye',color:'#ff5ad6',min:1700,desc:'Elite. The AWM, the MG3 and the F-14 seat are yours.',cos:['F-14 access','Frostbite camo']},
 {name:'Crown',color:'#f4ecff',min:2000,desc:'Top of the world list. Intervention, the Revolver, and the aura every lobby can see.',cos:['Crown aura','Season title']}];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=clamp(t,0,1);return 1-Math.pow(1-t,3)};
const isMobile=matchMedia('(max-width:860px)').matches;
// build classes stage
$('cls-stage').innerHTML=CLASSES.map((c,i)=>`<div class="cls" data-i="${i}" style="--pc:${c.color}"><div class="cls-name"><small>${c.n} · class</small><h2>${c.name}</h2><p>${c.line}</p><div class="cls-stats">${c.stats.map(s=>`<div class="statrow">${s[0]}<div class="bar"><i data-w="${s[1]}" style="width:0"></i></div><b>${s[1]}</b></div>`).join('')}</div></div><div class="cls-weapons">${c.weapons.map((w,k)=>`<div class="wpn" data-k="${k}">${SIL[w.s]}<div><b>${esc(w.n)}</b><span>${esc(w.t)}</span></div><span class="lk">${w.lk}</span></div>`).join('')}</div></div>`).join('');
$('cls-steps').innerHTML=CLASSES.map(()=>'<i></i>').join('');
// build ranks stage
$('orbs').innerHTML=TIERS.map((t,i)=>`<div class="orb" style="left:${4+i*(92/6)}%;--tc:${t.color}">${window.orbSVG?window.orbSVG(t.color,44):''}<div><b>${t.name}</b>${t.min?fmt(t.min)+'+':'start'}</div></div>`).join('');
const unlocksFor=t=>{const ws=[];CLASSES.forEach(c=>c.weapons.forEach(w=>{if(w.lk===t.name) ws.push({...w,cls:c})}));return ws};
$('tier-stage').innerHTML=TIERS.map((t,i)=>{const ws=unlocksFor(t);return `<div class="tier" data-i="${i}" style="--tc:${t.color}"><div><div class="big">${t.name}</div><div class="thr">tier ${i+1} of 7 · <b>${t.min?fmt(t.min)+'+ rating':'start'}</b></div><p>${t.desc}</p></div><div class="unlocks">${ws.map(w=>`<div class="ul" style="--pc:${w.cls.color}"><div class="sil">${SIL[w.s]}</div><b>${esc(w.n)}</b><span>${esc(w.t)} · ${w.cls.name}</span></div>`).join('')}${t.cos.map(c=>`<div class="ul"><div class="cos"><i></i></div><b>${esc(c)}</b><span>cosmetic · unlock</span></div>`).join('')}</div></div>`}).join('');
$('world').innerHTML=`<div><div class="kicker">// world list · season 1</div><h2 style="margin-top:14px">Top of the <em>world.</em></h2><p>The ten highest ratings on the planet right now, refreshed every five minutes straight from the game.</p><a class="btn btn-cyan" href="../ranks.html">Full leaderboard</a></div><div class="panel"><table class="lb"><thead><tr><th>#</th><th>Operator</th><th>Tier</th><th>Rating</th><th>Kills</th></tr></thead><tbody id="world-rows"></tbody></table></div>`;
// scrub engine
const clsEls=[...document.querySelectorAll('#cls-stage .cls')], stepEls=[...document.querySelectorAll('#cls-steps i')];
const tierEls=[...document.querySelectorAll('#tier-stage .tier')], orbEls=[...document.querySelectorAll('#orbs .orb')];
function animateClass(el,l,last){
  const enter=ease(l/0.32), exit=last?0:ease((l-0.72)/0.28);
  const name=el.querySelector('.cls-name');
  name.style.transform=`translateX(${(-55+55*enter+35*exit).toFixed(2)}vw) skewX(${(-10+10*enter).toFixed(2)}deg)`;
  name.style.opacity=(enter*(1-exit)).toFixed(3); name.style.filter=`blur(${((1-enter)*14+exit*10).toFixed(1)}px)`;
  name.querySelectorAll('.bar i').forEach(b=>{b.style.width=(parseFloat(b.dataset.w)*ease((l-0.15)/0.3)).toFixed(1)+'%'});
  el.querySelectorAll('.wpn').forEach(w=>{const k=+w.dataset.k; const e=ease((l-0.03*k)/0.3), x=last?0:ease((l-0.7-0.025*k)/0.28);
    w.style.transform=`translateX(${(70-70*e+55*x).toFixed(2)}vw) translateY(${(k*10.2).toFixed(1)}vh) rotate(${(-6+6*e).toFixed(2)}deg)`;
    w.style.opacity=(e*(1-x)).toFixed(3); w.style.filter=`blur(${((1-e)*12+x*8).toFixed(1)}px)`});
}
function pinProgress(el){const r=el.getBoundingClientRect(); const total=el.offsetHeight-innerHeight; return total>0?clamp(-r.top/total,0,1):1}
const forceStage=params.get('stage'), forceF=parseFloat(params.get('f')||'0');
if(forceStage){const hide=['.mega','.ticker','#intel','.hangar','.foot'].concat(forceStage==='classes'?['#climb']:forceStage==='ranks'?['#classes']:['#classes','#climb']); if(forceStage==='rest') hide.splice(hide.indexOf('#intel'),1), hide.splice(hide.indexOf('.hangar'),1), hide.splice(hide.indexOf('.foot'),1); hide.forEach(s=>document.querySelectorAll(s).forEach(e=>e.style.display='none'))}
function scrub(){
  if(isMobile) return;
  const pc=pinProgress($('classes')); const fN=forceStage==='classes'?forceF:pc*CLASSES.length; const ci=Math.min(CLASSES.length-1,Math.floor(fN)); const cl=Math.min(fN-ci,1);
  clsEls.forEach((el,i)=>{const on=i===ci; el.classList.toggle('active',on); if(on) animateClass(el,cl,i===CLASSES.length-1)});
  stepEls.forEach((s,i)=>{s.classList.toggle('on',i===ci);s.classList.toggle('done',i<ci)});
  $('cls-tint').style.setProperty('--tint',CLASSES[ci].tint);
  const pr=pinProgress($('climb')); const steps=TIERS.length+1; const fR=forceStage==='ranks'?forceF:pr*steps; const ri=Math.min(steps-1,Math.floor(fR));
  const tierIdx=Math.min(ri,TIERS.length-1);
  $('rail-fill').style.width=(clamp(fR/(TIERS.length-1),0,1)*100).toFixed(1)+'%';
  orbEls.forEach((o,i)=>{o.classList.toggle('on',i===ri);o.classList.toggle('lit',i<=tierIdx||ri===TIERS.length)});
  tierEls.forEach((t,i)=>t.classList.toggle('active',i===ri));
  $('world').classList.toggle('active',ri===TIERS.length);
  $('rank-tint').style.setProperty('--tint',ri===TIERS.length?'rgba(79,209,255,.14)':hexTint(TIERS[tierIdx].color));
}
function hexTint(hex){const n=parseInt(hex.slice(1),16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},.14)`}
let ticking=false; const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{scrub();ticking=false})}};
addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll); scrub();
if(isMobile){document.querySelectorAll('.cls .bar i').forEach(b=>b.style.width=b.dataset.w+'%');document.querySelectorAll('.tier').forEach(t=>t.classList.add('active'));$('world').classList.add('active');orbEls.forEach(o=>o.classList.add('lit'))}
if(params.has('scroll')){addEventListener('load',()=>{scrollTo(0,parseInt(params.get('scroll'),10));scrub()})}
const VEH=[['F-14 strike jet','2 seats · AA missiles · bail-out','../img/veh-jet.jpg'],['Little Bird','4 seats · minigun · fast insert','../img/veh-heli.jpg'],['Enduro bike','1 seat · fastest on land','../img/veh-bike.jpg'],['Jetski','2 seats · water · bouncy swell','../img/veh-car.jpg'],['Humvee','4 seats · roof MG · takes two NLAW hits','../img/bg-hangar.jpg'],['Transport truck','8 seats · moves the whole team','../img/bg-hangar.jpg']];
$('vlist').innerHTML=VEH.map((v,i)=>`<div class="vrow"><span class="n">0${i+1}</span><h3>${esc(v[0])}</h3><span class="spec">${esc(v[1])}</span><span class="thumb" style="background-image:url(${v[2]})"></span></div>`).join('');
window.Save6Data.snapshot.then(snap=>{
  const board=snap.boards.rating?'rating':'kills', list=(snap.boards[board]||[]).slice(0,3);
  const top10=(snap.boards[board]||[]).slice(0,10); const tierOf=v=>TIERS.slice().reverse().find(t=>v>=t.min)||TIERS[0];
  $('world-rows').innerHTML=top10.map(e=>{const t=tierOf(e.value); const k=(snap.boards.kills||[]).find(x=>x.userId===e.userId); return `<tr><td class="pos">${e.rank}</td><td><span class="pl"><i></i>${esc(e.displayName||e.name)}</span></td><td><span class="tier-tag" style="--tc:${t.color};display:inline-flex;align-items:center;gap:8px;font:11px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:${t.color}">${window.orbSVG?window.orbSVG(t.color,16):''}${t.name}</span></td><td class="r">${fmt(e.value)}</td><td class="n">${k?fmt(k.value):'–'}</td></tr>`}).join('');
  const live=snap.live||{}, jets=(snap.boards.jets||[])[0], top=list[0];
  const items=[`<b>${fmt(live.playing??0)}</b> operators online`,`<b>${fmt(live.visits??0)}</b> visits all time`,`season 1 ends in <b>${window.Save6Data.countdown((window.SAVE6||{}).seasonEnd)}</b>`,top?`top ${board}: <b>${esc(top.displayName||top.name)}</b> ${fmt(top.value)}`:'',jets?`most jets downed: <b>${esc(jets.displayName||jets.name)}</b> ${fmt(jets.value)}`:'',`new: <b>NLAW shoulder carry</b> animation`,`new: <b>F-14 bail-out</b> crash sequence`].filter(Boolean);
  const html=items.map(s=>`<span>${s}</span>`).join(''); $('ticker').innerHTML=html+html;
  if(window.reveal) window.reveal();
});
})();
