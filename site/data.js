// Data layer: loads the snapshot from the Worker, falls back to deterministic demo data.
(function(){
  const CFG = window.SAVE6 || {};
  const NAMES=['Nordvakt','TundraWolf','HexDriver','Blixt_42','Fjallrav','StormOps','Varg_Prime','Furuvik','Isbjorn77','Ekorren','RawFish99','Kalle_K','Lappis','Granat_Gustav','Myrstack','Renko','Skogsvakt','Dimma_7','Tjader','Flinta','Oden_x','Hugin','Munin','Snoflinga','Bergsro','Kottbulle','Pansar_P','Lavin','Stenbock','Ravine'];
  function demo(){
    let s=1337>>>0; const r=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
    const mk=(top,decay)=>Array.from({length:100},(_,i)=>{const name=NAMES[i]||`Operator_${(i*37)%997}`;return {rank:i+1,userId:100000+i,name,displayName:name,avatar:null,value:Math.max(1,Math.round(top*Math.pow(decay,i)*(0.9+0.2*r())))}}).sort((a,b)=>b.value-a.value).map((e,i)=>({...e,rank:i+1}));
    return {season:CFG.season||1,source:'demo',updated:new Date().toISOString(),boards:{kills:mk(4820,0.975),wins:mk(312,0.97),jets:mk(71,0.95),rating:mk(2418,0.99)},live:{playing:1204,visits:1873302,favorites:42117}};
  }
  async function load(){
    if(!CFG.api) return demo();
    try{
      const ctl=new AbortController(); const t=setTimeout(()=>ctl.abort(),6000);
      const r=await fetch(CFG.api.replace(/\/$/,'')+'/api/snapshot',{signal:ctl.signal}); clearTimeout(t);
      if(!r.ok) throw new Error(r.status);
      const snap=await r.json(); snap.source=snap.source||'live'; return snap;
    }catch(e){ console.warn('Conquest: API unavailable, using demo data',e); const d=demo(); d.source='demo-fallback'; return d; }
  }
  async function player(name){
    if(!CFG.api){ const d=demo(); const hit=Object.entries(d.boards).map(([k,l])=>[k,l.find(e=>e.name.toLowerCase()===name.toLowerCase())]).filter(([,e])=>e); if(!hit.length) return null; return {name:hit[0][1].name,displayName:hit[0][1].displayName,avatar:null,boards:Object.fromEntries(hit.map(([k,e])=>[k,{value:e.value,rank:e.rank}]))}; }
    const r=await fetch(CFG.api.replace(/\/$/,'')+'/api/player?name='+encodeURIComponent(name)); if(r.status===404) return null; if(!r.ok) throw new Error(r.status); return r.json();
  }
  const fmt=n=>(n==null?'–':Number(n).toLocaleString('sv-SE'));
  function countdown(iso){ const ms=Date.parse(iso)-Date.now(); if(!(ms>0)) return 'ended'; const d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/36e5), m=Math.floor(ms%36e5/6e4); return d>0?`${d}d ${String(h).padStart(2,'0')}h`:`${h}h ${String(m).padStart(2,'0')}m`; }
  window.Save6Data={snapshot:load(),player,fmt,countdown};
  // generic bindings: [data-live="playing"], [data-live="visits"], [data-live="favorites"], [data-countdown], [data-source]
  document.addEventListener('DOMContentLoaded',async()=>{
    document.querySelectorAll('[data-countdown]').forEach(e=>e.textContent=countdown(CFG.seasonEnd));
    document.querySelectorAll('a[data-link="game"]').forEach(a=>a.href=CFG.gameUrl||'#');
    document.querySelectorAll('a[data-link="discord"]').forEach(a=>a.href=CFG.discordUrl||'#');
    const snap=await window.Save6Data.snapshot;
    document.querySelectorAll('[data-live]').forEach(e=>{e.textContent=fmt((snap.live||{})[e.dataset.live])});
    document.querySelectorAll('[data-board-sum]').forEach(e=>{const l=snap.boards[e.dataset.boardSum]||[];e.textContent=fmt(l.reduce((a,x)=>a+x.value,0))});
    document.querySelectorAll('[data-source]').forEach(e=>{e.textContent=snap.source==='live'?'live data · updated '+new Date(snap.updated).toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'}):'demo data'; e.classList.toggle('is-demo',snap.source!=='live')});
    document.dispatchEvent(new CustomEvent('save6:snapshot',{detail:snap}));
  });
})();
