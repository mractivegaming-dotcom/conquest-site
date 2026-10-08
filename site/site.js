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
