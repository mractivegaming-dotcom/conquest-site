// Arsenal page: class tabs, weapon cards, featured panel, compare mode, live search, HUD keys.
// Stats are 0 to 100 for the bars; the display string is what players read. Placeholder values until wired to the weapon config.
(function(){
const SIL={
 smg:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="2" y="20" width="6" height="11" rx="1"/><rect x="6" y="23" width="22" height="5"/><rect x="26" y="19" width="80" height="15" rx="2"/><rect x="104" y="24" width="30" height="6" rx="1"/><rect x="50" y="13" width="10" height="6"/><rect x="97" y="14" width="5" height="5"/><polygon points="62,34 76,34 79,57 65,57"/><polygon points="84,34 95,34 97,52 88,52"/></svg>',
 pdw:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="8" y="18" width="100" height="18" rx="6"/><rect x="106" y="24" width="28" height="6" rx="1"/><rect x="40" y="12" width="40" height="6" rx="2"/><polygon points="50,36 68,36 70,54 54,54"/><polygon points="78,36 90,36 92,50 84,50"/><rect x="2" y="20" width="8" height="14" rx="2"/></svg>',
 rifle:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,22 22,20 24,32 4,34"/><rect x="22" y="19" width="70" height="14" rx="2"/><rect x="90" y="22" width="46" height="6" rx="1"/><rect x="96" y="28" width="22" height="4"/><rect x="40" y="12" width="26" height="7" rx="1"/><rect x="88" y="15" width="4" height="7"/><polygon points="56,33 70,33 76,56 62,56"/><polygon points="80,33 91,33 93,50 85,50"/></svg>',
 sniper:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,24 20,20 22,34 6,36"/><rect x="20" y="21" width="62" height="12" rx="2"/><rect x="80" y="24" width="58" height="5" rx="1"/><rect x="34" y="11" width="34" height="8" rx="3"/><rect x="30" y="17" width="6" height="5"/><rect x="62" y="17" width="6" height="5"/><polygon points="52,33 62,33 64,50 54,50"/><polygon points="72,33 82,33 84,48 76,48"/><rect x="100" y="29" width="3" height="12"/><rect x="110" y="29" width="3" height="12"/></svg>',
 lmg:'<svg viewBox="0 0 140 60" fill="currentColor"><polygon points="2,20 20,18 22,34 4,36"/><rect x="20" y="17" width="76" height="18" rx="3"/><rect x="94" y="23" width="44" height="7" rx="1"/><rect x="44" y="10" width="24" height="8" rx="1"/><rect x="48" y="35" width="26" height="18" rx="2"/><polygon points="80,35 92,35 94,52 86,52"/><rect x="104" y="30" width="3" height="16"/><rect x="118" y="30" width="3" height="16"/></svg>',
 pistol:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="30" y="14" width="90" height="16" rx="2"/><polygon points="34,30 60,30 56,58 30,58"/><rect x="60" y="30" width="10" height="8"/><rect x="112" y="18" width="12" height="8"/></svg>',
 launcher:'<svg viewBox="0 0 140 60" fill="currentColor"><rect x="4" y="22" width="132" height="14" rx="7"/><rect x="40" y="12" width="30" height="10" rx="3"/><rect x="46" y="8" width="8" height="5"/><polygon points="56,36 70,36 74,52 60,52"/><rect x="100" y="36" width="10" height="8"/><rect x="118" y="19" width="10" height="20" rx="3"/></svg>'};
const W=(name,type,sil,s,lvl,desc)=>({name,type,sil,stats:s,lvl,desc});
const std=(dmg,rpm,rng,ctl,mob,rpmText)=>[['Damage',dmg,String(dmg)],['Fire rate',rpm,rpmText||Math.round(400+rpm*6)+' rpm'],['Range',rng,String(rng)],['Control',ctl,String(ctl)],['Mobility',mob,String(mob)]];
const CLASSES={
 assault:{label:'Assault',weapons:[
   W('AK-74','Assault rifle','rifle',std(78,62,60,48,62),1,'The default. Hits hard, kicks hard, works everywhere.'),
   W('M4A1','Assault rifle','rifle',std(70,74,58,66,66),4,'Faster and flatter than the AK. The all-rounder for mid range.'),
   W('SCAR-H','Battle rifle','rifle',std(88,50,70,42,54),11,'Two-shot body kills at range. Burst it or lose the fight.'),
   W('AUG A3','Assault rifle','rifle',std(72,70,62,70,60),15,'Bullpup, integrated optic, best control in class.'),
   W('G36C','Assault rifle','rifle',std(68,76,54,64,70),19,'Compact and quick. Made for the forest tree lines.'),
   W('FAMAS','Assault rifle','rifle',std(66,92,50,52,64,'1 000 rpm'),24,'Burst monster. Three rounds before the enemy blinks.')]},
 engineer:{label:'Engineer',weapons:[
   W('NLAW','Launcher','launcher',[['Damage',98,'98'],['Lock time',58,'2.4 s'],['Range',84,'800 m'],['Reload',36,'6.2 s'],['Mobility',40,'40']],12,'Fire-and-forget anti-tank launcher. Lock on, loose, forget. The shoulder-carry animation shipped this week and the aim pitch now follows the launcher head.'),
   W('MP5-K','SMG','smg',std(60,82,42,68,84),1,'Short, light, laser-accurate inside 30 metres.'),
   W('UMP45','SMG','smg',std(68,62,50,72,80),6,'Slower, heavier rounds. Forgiving recoil.'),
   W('P90','PDW','pdw',std(54,90,54,60,82),14,'50 rounds and a flat spray. Keep the trigger down.'),
   W('Vector','SMG','pdw',std(58,99,38,56,86,'1 200 rpm'),22,'Fastest gun in the game. Empty in two seconds.'),
   W('MAC-10','Machine pistol','smg',std(52,96,30,40,90),9,'Chaos in a lunchbox.'),
   W('MP7','PDW','pdw',std(56,88,52,66,84),20,'Armour-piercing rounds. Good against vehicle crews.'),
   W('PP-19','SMG','smg',std(62,74,56,64,78),16,'Helical magazine, 64 rounds, calm recoil.')]},
 recon:{label:'Recon',weapons:[
   W('AWM','Bolt-action','sniper',std(100,8,98,58,40,'40 rpm'),10,'One shot, anywhere above the knee.'),
   W('M24','Bolt-action','sniper',std(94,12,92,64,46,'48 rpm'),3,'The starter sniper. Quieter bolt, faster follow-up.'),
   W('Mosin','Bolt-action','sniper',std(96,10,88,50,44,'42 rpm'),7,'Old iron. Loud, slow, deadly.'),
   W('SVD','Marksman','sniper',std(80,30,86,56,52,'150 rpm'),13,'Semi-auto. Two fast hits beat one slow miss.'),
   W('Intervention','Bolt-action','sniper',std(100,7,100,54,36,'36 rpm'),26,'Built for the ridge above the forest. Downs a jet pilot through the canopy.'),
   W('MK12 DMR','Marksman','rifle',std(74,38,80,66,58,'200 rpm'),17,'The recon rifle for people who still want to push.')]},
 support:{label:'Support',sub:'LMG',weapons:[
   W('M249','LMG','lmg',std(70,80,66,44,36),2,'200 rounds of suppression. Deploy the bipod and own the lane.'),
   W('PKM','LMG','lmg',std(86,66,76,38,32),12,'7.62 belt. Shreds light vehicles.'),
   W('MG3','LMG','lmg',std(76,98,64,30,34,'1 150 rpm'),21,'Buzzsaw. The barrel glows before the belt ends.'),
   W('RPK','LMG','lmg',std(74,62,62,56,48),6,'The AK with a long barrel and a drum. Mobile support.'),
   W('M60','LMG','lmg',std(84,58,72,42,34),16,'Slow, heavy, and every hit matters.'),
   W('Negev','LMG','lmg',std(68,84,60,50,42),9,'Light enough to run with, mean enough to hold a point.')]},
 sidearms:{label:'Sidearms',weapons:[
   W('M9','Pistol','pistol',std(42,54,34,78,96),1,'Fifteen rounds of plan B.'),
   W('Glock 17','Pistol','pistol',std(40,60,32,80,96),2,'Fast draw, fast reload, boring and reliable.'),
   W('Desert Eagle','Pistol','pistol',std(86,24,44,36,88),18,'Two hits. Loud enough to hear across the map.'),
   W('M1911','Pistol','pistol',std(60,40,36,66,94),5,'Heavy .45. Feels like a sledgehammer.'),
   W('Five-seveN','Pistol','pistol',std(38,66,42,82,96),11,'Twenty rounds, armour-piercing.'),
   W('Revolver','Revolver','pistol',std(92,18,48,40,86),23,'Six shots. Make them count.')]}};
const VEHICLES=[
 {name:'F-14 strike jet',type:'Jet · 2 seats',img:'img/veh-jet.jpg',pos:'760px -90px',lvl:30,stats:[['Speed',100,'100'],['Armour',40,'40'],['Firepower',92,'AA missiles'],['Handling',62,'62'],['Seats',20,'2']],desc:'The fastest thing on the map. Lock a helicopter, loose two missiles, and bail out before the ground does it for you. The wreck stays where it falls.'},
 {name:'Little Bird',type:'Helicopter · 4 seats',img:'img/veh-heli.jpg',pos:'540px -110px',lvl:18,stats:[['Speed',58,'58'],['Armour',46,'46'],['Firepower',70,'Minigun'],['Handling',84,'84'],['Seats',40,'4']],desc:'Fast insert for a four-man squad. Two bench seats fire out the sides.'},
 {name:'Enduro bike',type:'Bike · 1 seat',img:'img/veh-bike.jpg',pos:'300px -190px',lvl:1,stats:[['Speed',82,'82'],['Armour',10,'10'],['Firepower',0,'none'],['Handling',90,'90'],['Seats',10,'1']],desc:'Fastest on land, zero protection. The spring is stable below 31 fps again.'},
 {name:'Jetski',type:'Water · 2 seats',img:'img/veh-car.jpg',pos:'440px -200px',lvl:1,stats:[['Speed',74,'74'],['Armour',12,'12'],['Firepower',0,'none'],['Handling',76,'76'],['Seats',20,'2']],desc:'Lake crossings and river flanks. The swell is bouncy again, as it should be.'},
 {name:'Humvee',type:'Car · 4 seats',img:'img/bg-hangar.jpg',pos:'200px -260px',lvl:8,stats:[['Speed',60,'60'],['Armour',66,'66'],['Firepower',60,'Roof MG'],['Handling',58,'58'],['Seats',40,'4']],desc:'Armoured transport with a roof gun. Takes two NLAW hits.'},
 {name:'Transport truck',type:'Truck · 8 seats',img:'img/bg-hangar.jpg',pos:'0px -260px',lvl:4,stats:[['Speed',44,'44'],['Armour',52,'52'],['Firepower',0,'none'],['Handling',40,'40'],['Seats',80,'8']],desc:'Moves a whole team. Slow, wide and worth protecting.'}];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const total=Object.values(CLASSES).reduce((a,c)=>a+c.weapons.length,0);
document.getElementById('count').textContent=total;
let cls='engineer', compareMode=false, picked=[], query='';
const params=new URLSearchParams(location.search); if(params.get('tab')==='vehicles') cls='vehicles'; else if(CLASSES[params.get('tab')]) cls=params.get('tab');
const $=id=>document.getElementById(id);
function bars(stats,cls2){return stats.map(([l,v,t])=>`<div class="statrow ${cls2||''}">${l}<div class="bar"><i style="width:0%" data-w="${v}"></i></div><b>${esc(t)}</b></div>`).join('')}
function growBars(root){requestAnimationFrame(()=>root.querySelectorAll('.bar i[data-w]').forEach(i=>{i.style.width=i.dataset.w+'%'}))}
function renderSigns(){
  const keys=[...Object.keys(CLASSES),'vehicles'];
  $('signs').innerHTML=keys.map(k=>{const c=CLASSES[k]; const label=c?c.label:'Vehicles'; return `<span class="sign ${k===cls&&!query?'on':''}" data-cls="${k}" id="${k==='vehicles'?'vehicles-tab':''}">${label}${c&&c.sub?`<span class="sub">${c.sub}</span>`:''}</span>`}).join('');
  $('signs').querySelectorAll('.sign').forEach(el=>el.onclick=()=>{cls=el.dataset.cls; query=''; $('q').value=''; render(); history.replaceState(null,'',cls==='engineer'?'arsenal.html':'arsenal.html?tab='+cls)});
}
function featureWeapon(w,clsKey){
  const f=$('featured'); f.style.backgroundImage=w.name==='NLAW'?'url(img/bg-nlaw.jpg)':'url(img/bg-armory.jpg)'; f.style.backgroundSize='cover'; f.style.backgroundPosition=w.name==='NLAW'?'62% 42%':'center 40%';
  $('bigsil').innerHTML=w.name==='NLAW'?'':SIL[w.sil]; $('bigsil').style.display=w.name==='NLAW'?'none':'block';
  $('f-tag').textContent=`${CLASSES[clsKey].label} · ${w.type}${w.name==='NLAW'?' · new animation':''}`;
  $('f-name').textContent=w.name; $('f-desc').textContent=w.desc; $('f-stats').innerHTML=bars(w.stats); $('f-unlock').textContent=`Unlock · level ${w.lvl}`;
  growBars($('f-stats'));
}
function featureVehicle(v){
  const f=$('featured'); f.style.backgroundImage='url(img/bg-hangar.jpg)'; f.style.backgroundSize='1600px auto'; f.style.backgroundPosition=v.pos; $('bigsil').style.display='none';
  $('f-tag').textContent='Vehicle · '+v.type; $('f-name').textContent=v.name; $('f-desc').textContent=v.desc; $('f-stats').innerHTML=bars(v.stats); $('f-unlock').textContent=`Unlock · level ${v.lvl}`; growBars($('f-stats'));
}
function card(w,k,i){
  return `<div class="wcard rv tilt" data-cls="${k}" data-i="${i}"><span class="pick">✓</span><span class="tag lvl">Lvl ${w.lvl}</span><div class="sil">${SIL[w.sil]}</div><h3>${esc(w.name)}</h3><div class="cls">${esc(w.type)} · ${CLASSES[k].label}</div><div class="mini"><span>DMG</span><div class="bar"><i style="width:${w.stats[0][1]}%"></i></div><span>${w.stats[1][0]==='Fire rate'?'RPM':'LCK'}</span><div class="bar"><i style="width:${w.stats[1][1]}%"></i></div><span>RNG</span><div class="bar"><i style="width:${w.stats[2][1]}%"></i></div></div></div>`;
}
function render(){
  renderSigns();
  const grid=$('grid'), veh=$('vehicles');
  if(query){
    const q=query.toLowerCase(); const hits=[]; for(const [k,c] of Object.entries(CLASSES)) c.weapons.forEach((w,i)=>{if((w.name+' '+w.type+' '+c.label).toLowerCase().includes(q)) hits.push([w,k,i])});
    grid.innerHTML=hits.length?hits.map(([w,k,i])=>card(w,k,i)).join(''):`<div class="empty">Nothing matches "${esc(query)}".</div>`; veh.innerHTML='';
    if(hits.length) featureWeapon(hits[0][0],hits[0][1]);
  } else if(cls==='vehicles'){
    grid.innerHTML=''; veh.innerHTML=`<div class="vehicles" style="margin-top:0">${VEHICLES.map((v,i)=>`<div class="vcard rv tilt" data-v="${i}" style="cursor:pointer"><div class="ph" style="background-image:url(${v.img})"></div><div class="c"><h3>${esc(v.name)}</h3><p>${esc(v.type)} · lvl ${v.lvl}</p></div></div>`).join('')}</div>`;
    veh.querySelectorAll('.vcard').forEach(el=>el.onclick=()=>{featureVehicle(VEHICLES[+el.dataset.v]); window.scrollTo({top:$('featured').getBoundingClientRect().top+window.scrollY-110,behavior:'smooth'})});
    featureVehicle(VEHICLES[0]);
  } else {
    const c=CLASSES[cls]; grid.innerHTML=c.weapons.map((w,i)=>card(w,cls,i)).join(''); veh.innerHTML=''; featureWeapon(c.weapons[0],cls); grid.querySelector('.wcard')?.classList.add('sel');
  }
  grid.querySelectorAll('.wcard').forEach(el=>el.onclick=()=>{const w=CLASSES[el.dataset.cls].weapons[+el.dataset.i];
    if(compareMode){ togglePick(el,w,el.dataset.cls); return; }
    grid.querySelectorAll('.wcard.sel').forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); featureWeapon(w,el.dataset.cls); if(window.innerWidth<860) window.scrollTo({top:$('featured').getBoundingClientRect().top+window.scrollY-110,behavior:'smooth'})});
  if(window.reveal) window.reveal(); renderCompare();
}
function togglePick(el,w,k){
  const idx=picked.findIndex(p=>p.w===w);
  if(idx>=0){picked.splice(idx,1); el.classList.remove('cmp')} else { if(picked.length===2){ const old=picked.shift(); document.querySelectorAll('.wcard.cmp').forEach(x=>{if(CLASSES[x.dataset.cls].weapons[+x.dataset.i]===old.w) x.classList.remove('cmp')}) } picked.push({w,k}); el.classList.add('cmp') }
  renderCompare();
}
function renderCompare(){
  const box=$('compare'); document.body.classList.toggle('compare-on',compareMode);
  if(!compareMode){box.classList.remove('show');return}
  box.classList.add('show');
  if(picked.length<2){box.innerHTML=`<div class="kicker">// compare</div><p class="muted" style="margin:8px 0 0">Pick two weapons in the grid. ${picked.length?`<b style="color:var(--text)">${esc(picked[0].w.name)}</b> selected, one more to go.`:''}</p>`;return}
  const [a,b]=picked; const labels=a.w.stats.map(s=>s[0]);
  const col=(x,y)=>`<div><h4>${esc(x.w.name)} <span class="cls-pill">${CLASSES[x.k].label}</span></h4>${x.w.stats.map((s,i)=>{const o=y.w.stats[i]; const win=o&&o[0]===s[0]&&s[1]>o[1]; return `<div class="statrow ${win?'win':''}">${s[0]}<div class="bar"><i style="width:0%" data-w="${s[1]}"></i></div><b>${esc(s[2])}</b></div>`}).join('')}</div>`;
  box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><span class="kicker">// compare · gold bar wins the stat</span><button class="replay" id="cmpclear" type="button">Clear</button></div><div class="cols">${col(a,b)}${col(b,a)}</div>`;
  growBars(box); $('cmpclear').onclick=()=>{picked=[]; document.querySelectorAll('.wcard.cmp').forEach(x=>x.classList.remove('cmp')); renderCompare()};
}
$('cmpbtn').onclick=()=>{compareMode=!compareMode; $('cmpbtn').classList.toggle('btn-cyan',compareMode); $('cmpbtn').classList.toggle('btn-ghost',!compareMode); $('cmpbtn').textContent=compareMode?'Comparing':'Compare'; if(!compareMode){picked=[];document.querySelectorAll('.wcard.cmp').forEach(x=>x.classList.remove('cmp'))} renderCompare(); if(compareMode&&window.toast) window.toast('Pick two weapons to compare')};
$('q').addEventListener('input',e=>{query=e.target.value.trim(); render()});
document.addEventListener('keydown',e=>{const k=document.querySelector(`.key[data-key="${e.key.toLowerCase()}"]`); if(k&&!e.target.matches('input')){k.classList.add('on'); setTimeout(()=>k.classList.remove('on'),350)}});
render();
if(location.hash==='#patch'){const el=document.getElementById('patch'); if(el) setTimeout(()=>el.scrollIntoView({block:'start'}),50)}
})();
