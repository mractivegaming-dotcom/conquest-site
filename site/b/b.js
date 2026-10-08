// Prototype B behaviour: before/after slider, class posters, chakra path, top 3, hangar list, ticker.
(function(){
const SIL={
 rifle:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,22 22,20 24,32 4,34"/><rect x="22" y="19" width="70" height="14" rx="2"/><rect x="90" y="22" width="46" height="6" rx="1"/><rect x="96" y="28" width="22" height="4"/><rect x="40" y="12" width="26" height="7" rx="1"/><rect x="88" y="15" width="4" height="7"/><polygon points="56,33 70,33 76,56 62,56"/><polygon points="80,33 91,33 93,50 85,50"/></svg>',
 launcher:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="4" y="22" width="132" height="14" rx="7"/><rect x="40" y="12" width="30" height="10" rx="3"/><rect x="46" y="8" width="8" height="5"/><polygon points="56,36 70,36 74,52 60,52"/><rect x="100" y="36" width="10" height="8"/><rect x="118" y="19" width="10" height="20" rx="3"/></svg>',
 sniper:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,24 20,20 22,34 6,36"/><rect x="20" y="21" width="62" height="12" rx="2"/><rect x="80" y="24" width="58" height="5" rx="1"/><rect x="34" y="11" width="34" height="8" rx="3"/><rect x="30" y="17" width="6" height="5"/><rect x="62" y="17" width="6" height="5"/><polygon points="52,33 62,33 64,50 54,50"/><polygon points="72,33 82,33 84,48 76,48"/><rect x="100" y="29" width="3" height="12"/><rect x="110" y="29" width="3" height="12"/></svg>',
 lmg:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,20 20,18 22,34 4,36"/><rect x="20" y="17" width="76" height="18" rx="3"/><rect x="94" y="23" width="44" height="7" rx="1"/><rect x="44" y="10" width="24" height="8" rx="1"/><rect x="48" y="35" width="26" height="18" rx="2"/><polygon points="80,35 92,35 94,52 86,52"/><rect x="104" y="30" width="3" height="16"/><rect x="118" y="30" width="3" height="16"/></svg>',
 pistol:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="30" y="14" width="90" height="16" rx="2"/><polygon points="34,30 60,30 56,58 30,58"/><rect x="60" y="30" width="10" height="8"/><rect x="112" y="18" width="12" height="8"/></svg>'};
const CLASSES=[
 {n:'01',name:'Assault',color:'#ffb347',sil:'rifle',line:'Rifles that work everywhere. The spine of every squad.',list:['AK-74','M4A1','SCAR-H','AUG A3','G36C','FAMAS']},
 {n:'02',name:'Engineer',color:'#9dff57',sil:'launcher',line:'SMGs up close and the NLAW for anything with an engine.',list:['NLAW','MP5-K','UMP45','P90','Vector','MP7']},
 {n:'03',name:'Recon',color:'#4f8dff',sil:'sniper',line:'One shot from the ridge. Downs a jet pilot through the canopy.',list:['AWM','M24','Mosin','SVD','Intervention','MK12']},
 {n:'04',name:'Support',color:'#ff5a5a',sil:'lmg',line:'Belts, bipods and suppression. Own the lane.',list:['M249','PKM','MG3','RPK','M60','Negev']},
 {n:'05',name:'Sidearms',color:'#f2f5ef',sil:'pistol',line:'Plan B for everyone. Plan A for the brave.',list:['M9','Glock 17','Desert Eagle','M1911','Five-seveN','Revolver']}];
const TIERS=[["Root","#ff4b4b",0],["Sacral","#ff9a3c",800],["Solar","#ffd93b",1000],["Heart","#5fe07a",1200],["Throat","#4f8dff",1400],["Third Eye","#ff5ad6",1700],["Crown","#f4ecff",2000]];
const VEH=[['F-14 strike jet','2 seats · AA missiles · bail-out','../img/veh-jet.jpg'],['Little Bird','4 seats · minigun · fast insert','../img/veh-heli.jpg'],['Enduro bike','1 seat · fastest on land','../img/veh-bike.jpg'],['Jetski','2 seats · water · bouncy swell','../img/veh-car.jpg'],['Humvee','4 seats · roof MG · takes two NLAW hits','../img/bg-hangar.jpg'],['Transport truck','8 seats · moves the whole team','../img/bg-hangar.jpg']];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Number(n).toLocaleString('sv-SE');
// posters
document.getElementById('posters').innerHTML=CLASSES.map(c=>`<a class="poster" href="../arsenal.html?tab=${c.name.toLowerCase()}" style="--pc:${c.color}"><span class="num">${c.n}</span><div class="sil">${SIL[c.sil]}</div><div class="list">${c.list.join('<br>')}</div><div class="name"><h3>${c.name}</h3><p>${c.line}</p></div></a>`).join('');
// chakra path
const path=document.getElementById('path');
const pts=TIERS.map((t,i)=>[6+i*(88/6), 70-Math.sin(i/6*Math.PI)*34]);
const d=pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');
path.innerHTML=`<svg class="line" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#ff4b4b"/><stop offset=".5" stop-color="#5fe07a"/><stop offset="1" stop-color="#f4ecff"/></linearGradient></defs><path d="${d}" fill="none" stroke="url(#lg)" stroke-width=".6" vector-effect="non-scaling-stroke" opacity=".8"/></svg>`+
  TIERS.map((t,i)=>`<div class="orb" style="left:${pts[i][0]}%;top:${pts[i][1]}%;--tc:${t[1]}" title="${t[0]}: ${t[2]?fmt(t[2])+' rating and up':'start tier'}">${window.orbSVG?window.orbSVG(t[1],56):''}<div><b>${t[0]}</b>${t[2]?fmt(t[2])+'+':'start'}</div></div>`).join('');
// hangar list
document.getElementById('vlist').innerHTML=VEH.map((v,i)=>`<div class="vrow"><span class="n">0${i+1}</span><h3>${esc(v[0])}</h3><span class="spec">${esc(v[1])}</span><span class="thumb" style="background-image:url(${v[2]})"></span></div>`).join('');
// before / after slider
const ba=document.getElementById('ba');
const setX=clientX=>{const r=ba.getBoundingClientRect(); const x=Math.max(6,Math.min(94,(clientX-r.left)/r.width*100)); ba.style.setProperty('--x',x.toFixed(2)+'%')};
let dragging=false;
ba.addEventListener('pointerdown',e=>{dragging=true;ba.setPointerCapture(e.pointerId);setX(e.clientX)});
ba.addEventListener('pointermove',e=>{if(dragging||e.pointerType==='mouse') setX(e.clientX)});
ba.addEventListener('pointerup',()=>dragging=false); ba.addEventListener('pointercancel',()=>dragging=false);
// idle sway until the user touches it
let touched=false; ba.addEventListener('pointerdown',()=>touched=true,{once:true});
const still=/[?&](still|t=)/.test(location.search)||matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!still){const t0=performance.now(); const sway=now=>{if(touched) return; const t=(now-t0)/1000; ba.style.setProperty('--x',(56+10*Math.sin(t*0.7)).toFixed(2)+'%'); requestAnimationFrame(sway)}; requestAnimationFrame(sway)}
// top 3 + ticker from the snapshot
window.Save6Data.snapshot.then(snap=>{
  const board=snap.boards.rating?'rating':'kills'; const list=(snap.boards[board]||[]).slice(0,3); const label=board==='rating'?'rating':'kills';
  document.getElementById('top3').innerHTML=list.map((e,i)=>`<div class="t3"><span class="rank">${i+1}</span><div class="who"><b>${esc(e.displayName||e.name)}</b><span>${board==='rating'?(TIERS.slice().reverse().find(t=>e.value>=t[2])||TIERS[0])[0]:'season '+snap.season}</span></div><span class="val">${fmt(e.value)}</span></div>`).join('');
  const live=snap.live||{}; const jets=(snap.boards.jets||[])[0]; const top=list[0];
  const items=[`<b>${fmt(live.playing??0)}</b> operators online`,`<b>${fmt(live.visits??0)}</b> visits all time`,`season 1 ends in <b>${window.Save6Data.countdown((window.SAVE6||{}).seasonEnd)}</b>`,top?`top ${label}: <b>${esc(top.displayName||top.name)}</b> ${fmt(top.value)}`:'',jets?`most jets downed: <b>${esc(jets.displayName||jets.name)}</b> ${fmt(jets.value)}`:'',`new: <b>NLAW shoulder carry</b> animation`,`new: <b>F-14 bail-out</b> crash sequence`].filter(Boolean);
  const html=items.map(s=>`<span>${s}</span>`).join('');
  document.getElementById('ticker').innerHTML=html+html;
});
})();
