// Shared helpers for the Conquest site (internal project name Save6). Deterministic so screenshots are reproducible.
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

// Blocky avatar (classic R6 proportions) drawn in isometric projection.
function blockyAvatarSVG(size){
  // Oblique 3/4 view: x = width (screen right), y = up, z = depth (recedes up-left). Visible faces: front, top, left.
  const u=size/5.75;
  const P=(x,y,z)=>[(x-z*0.5)*u,(-y-z*0.3)*u];
  const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g=(n>>8)&255,b=n&255;r=Math.min(255,Math.round(r*f));g=Math.min(255,Math.round(g*f));b=Math.min(255,Math.round(b*f));return `rgb(${r},${g},${b})`};
  const box=(x0,y0,z0,w,h,d,c)=>{
    const p=(x,y,z)=>P(x,y,z).join(',');
    const front=[p(x0,y0,z0),p(x0+w,y0,z0),p(x0+w,y0+h,z0),p(x0,y0+h,z0)].join(' ');
    const top=[p(x0,y0+h,z0),p(x0+w,y0+h,z0),p(x0+w,y0+h,z0+d),p(x0,y0+h,z0+d)].join(' ');
    const left=[p(x0,y0,z0),p(x0,y0+h,z0),p(x0,y0+h,z0+d),p(x0,y0,z0+d)].join(' ');
    return `<polygon points="${left}" fill="${shade(c,0.72)}"/><polygon points="${top}" fill="${shade(c,1.2)}"/><polygon points="${front}" fill="${c}"/>`;
  };
  const Y='#f2cf35',B='#2167d2',G='#63a832';
  let s='';
  s+=box(2,2,0,1,2,1,Y);              // right arm (its left face hides behind the torso, so draw it first)
  s+=box(0,0,0,1,2,1,G);              // left leg
  s+=box(1,0,0,1,2,1,G);              // right leg
  s+=box(0,2,0,2,2,1,B);              // torso
  s+=box(-1,2,0,1,2,1,Y);             // left arm
  s+=box(0.4,4.05,-0.1,1.2,1.2,1.2,Y); // head
  const z=-0.1, e1=P(0.74,4.88,z), e2=P(1.26,4.88,z), m0=P(0.66,4.5,z), m1=P(1.0,4.28,z), m2=P(1.34,4.5,z);
  s+=`<circle cx="${e1[0]}" cy="${e1[1]}" r="${u*0.075}" fill="#111"/><circle cx="${e2[0]}" cy="${e2[1]}" r="${u*0.075}" fill="#111"/>`;
  s+=`<path d="M${m0[0]},${m0[1]} Q${m1[0]},${m1[1]} ${m2[0]},${m2[1]}" stroke="#111" stroke-width="${u*0.08}" fill="none" stroke-linecap="round"/>`;
  const xs=[],ys=[];for(const x of [-1,3])for(const y of [0,5.25])for(const zz of [-0.1,1.2]){const q=P(x,y,zz);xs.push(q[0]);ys.push(q[1])}
  const minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minx-2} ${miny-2} ${maxx-minx+4} ${maxy-miny+4}" width="${(maxx-minx+4)}" height="${(maxy-miny+4)}">${s}</svg>`;
}

// Chakra orb: glowing sphere with a spiral, used for rank tiers.
let _orbN=0;
function orbSVG(color,size){
  size=size||18; let d=''; const turns=2.6, steps=96;
  for(let i=0;i<=steps;i++){const t=i/steps,a=t*turns*2*Math.PI,r=1+t*7.6;d+=(i?'L':'M')+(12+r*Math.cos(a)).toFixed(2)+' '+(12+r*Math.sin(a)).toFixed(2)}
  const id='orb'+(_orbN++);
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="color:${color}"><defs><radialGradient id="${id}"><stop offset="0" stop-color="#fff"/><stop offset=".42" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity=".12"/></radialGradient></defs><circle cx="12" cy="12" r="11.5" fill="url(#${id})"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.1" stroke-linecap="round"/></svg>`;
}
window.orbSVG=orbSVG;
function particles(el,seed,count,xmin,xmax){
  const r=rng(seed);let h='';
  for(let i=0;i<count;i++){
    const x=xmin+(xmax-xmin)*r(), y=8+84*r(), s=3+8*r(), o=.25+.75*r(), d=(r()*3).toFixed(2);
    h+=`<i style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;opacity:${o.toFixed(2)};animation-delay:-${d}s"></i>`;
  }
  el.innerHTML=h;
}
function hexNoise(el,seed,lines){
  const r=rng(seed);let h='';
  for(let i=0;i<lines;i++){let l='';for(let j=0;j<8;j++)l+=Math.floor(r()*65536).toString(16).padStart(4,'0')+' ';h+=l.trim()+'\n'}
  el.textContent=h;
}
function sparkline(el,seed,n){
  const r=rng(seed);let h='';
  for(let i=0;i<n;i++){const v=20+80*r();h+=`<i style="height:${v.toFixed(0)}%"></i>`}
  el.innerHTML=h;
}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-blocky]').forEach(e=>{const svg=blockyAvatarSVG(parseInt(e.dataset.blocky,10));e.innerHTML=`<div class="b">${svg}</div><div class="g g1">${svg}</div><div class="g g2">${svg}</div>`});
  document.querySelectorAll('[data-particles]').forEach(e=>{const [seed,count,a,b]=e.dataset.particles.split(',').map(Number);particles(e,seed,count,a,b)});
  document.querySelectorAll('[data-hex]').forEach(e=>{const [seed,lines]=e.dataset.hex.split(',').map(Number);hexNoise(e,seed,lines)});
  document.querySelectorAll('[data-spark]').forEach(e=>{const [seed,n]=e.dataset.spark.split(',').map(Number);sparkline(e,seed,n)});
});

// ===== interactivity (all pages) =====
(function(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // mobile menu
  document.addEventListener('DOMContentLoaded',()=>{
    const b=document.getElementById('burger'), m=document.getElementById('menu');
    if(b&&m){ b.addEventListener('click',()=>{const open=m.classList.toggle('open'); b.setAttribute('aria-expanded',String(open))}); m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{m.classList.remove('open');b.setAttribute('aria-expanded','false')})); }
    // reveal on scroll
    const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'}):null;
    const still=/[?&](still|t=)/.test(location.search);
    window.reveal=(root)=>{(root||document).querySelectorAll('.rv:not(.in)').forEach(el=>{if(io&&!reduced&&!still) io.observe(el); else el.classList.add('in')})};
    window.reveal();
    // tilt on hover (pointer devices only)
    if(matchMedia('(hover:hover)').matches&&!reduced){
      document.addEventListener('mousemove',e=>{const t=e.target.closest&&e.target.closest('.tilt'); if(!t) return; const r=t.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; t.style.transform=`perspective(900px) rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg) translateY(-3px)`;});
      document.addEventListener('mouseout',e=>{const t=e.target.closest&&e.target.closest('.tilt'); if(t&&!t.contains(e.relatedTarget)) t.style.transform='';});
    }
  });
  // count-up numbers
  window.countUp=function(el,target,opts){
    opts=opts||{}; const fmt=opts.fmt||(n=>Math.round(n).toLocaleString('sv-SE'));
    if(reduced||!(target>0)||/[?&](still|t=)/.test(location.search)){el.textContent=fmt(target);return}
    const dur=opts.dur||900, t0=performance.now();
    const step=now=>{const p=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-p,3); el.textContent=fmt(target*e); if(p<1) requestAnimationFrame(step)};
    requestAnimationFrame(step);
  };
  window.toast=function(msg){let t=document.querySelector('.toast'); if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)} t.textContent=msg; t.classList.add('show'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),2200)};
})();

// ===== hero: reprogramming sequence timeline =====
(function(){
  document.addEventListener('DOMContentLoaded',()=>{
    const stage=document.querySelector('.stage'); if(!stage) return;
    const figs=[...stage.querySelectorAll('.fig')], beam=stage.querySelector('.beam'), dust=stage.querySelector('.dust'), prog=stage.querySelector('.prog'), pbar=stage.querySelector('.pbar b');
    const lines=[...document.querySelectorAll('.term .ln')], flash=stage.querySelector('.flash');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const params=new URLSearchParams(location.search); const freeze=params.has('t')?parseFloat(params.get('t')):null;
    const STAGE_X=[12.5,37.5,62.5,87.5], STATUS=['decompiled','ok','78%','deploy'], IDLE=['waiting','waiting','waiting','waiting'];
    const DUR=10.5, MOVE0=0.6, MOVE1=8.6, LINE_AT=[4,20,40,60,92];
    stage.classList.add('anim');
    const setState=(t)=>{
      const p=Math.max(0,Math.min(1,(t-MOVE0)/(MOVE1-MOVE0)));
      const x=2+96*p;
      if(beam) beam.style.left=x+'%';
      if(dust) dust.style.transform=`translateX(${(x-72).toFixed(2)}%)`;
      const pct=Math.round(x>=98?100:x);
      if(prog) prog.firstChild.nodeValue=pct+'% ';
      if(pbar) pbar.style.width=pct+'%';
      figs.forEach((f,i)=>{const on=x>=STAGE_X[i]-2; if(on!==f.classList.contains('active')){f.classList.toggle('active',on); const s=f.querySelector('figcaption span'); if(s) s.textContent=on?STATUS[i]:IDLE[i]; if(on&&flash&&!reduced&&t>0.2){flash.classList.remove('go');void flash.offsetWidth;flash.classList.add('go')}}});
      lines.forEach((l,i)=>{const show=pct>=LINE_AT[i]; l.classList.toggle('show',show); l.classList.toggle('last',show&&(i===lines.length-1||pct<LINE_AT[i+1]))});
      const last=lines[lines.length-1]; if(last){const v=last.querySelector('.v'); if(v) v.textContent=pct>=99?'OK':'queued'; if(v) v.className='v '+(pct>=99?'ok':'q')}
    };
    if(freeze!=null){ setState(freeze); return; }
    if(reduced){ setState(MOVE1+1); return; }
    let start=performance.now(), paused=false, pauseAt=0;
    const tick=now=>{ if(!paused){ let t=((now-start)/1000)%DUR; setState(t); } requestAnimationFrame(tick) };
    requestAnimationFrame(tick);
    figs.forEach(f=>{f.addEventListener('mouseenter',()=>{paused=true;pauseAt=performance.now()}); f.addEventListener('mouseleave',()=>{if(paused){start+=performance.now()-pauseAt;paused=false}})});
    const rb=stage.querySelector('.replay'); if(rb) rb.addEventListener('click',()=>{start=performance.now();paused=false});
  });
})();
