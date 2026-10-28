/* Frauenfeld street fabric; schematic massing and illustrative material transfers. */
(() => {
  'use strict';
  const host=document.querySelector('.zurich-scene'),data=window.SEPAR_ZURICH&&SEPARCityLayout.create(window.SEPAR_ZURICH);
  if(!host||!data)return;
  const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const {width:W,height:H}=data.camera;
  const world=new SEPARCityState.City(data);
  const project=SEPARCityLayout.project;
  const center=b=>b.p.reduce((a,p)=>[a[0]+p[0]/b.p.length,a[1]+p[1]/b.p.length],[0,0]);
  const depth=SEPARCityLayout.depth;
  const clamp=t=>Math.max(0,Math.min(1,t)),smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const mix=(a,b,t)=>`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')})`;
  const terrain=document.createElement('canvas');
  // Peripheral buildings also belong to the persistent renewal stock.
  const background=[];
  let sprites=new WeakMap();
  let layers=[],dpr=1,raf=0,last=0,lastDraw=0,time=.15,inView=false,revision=-1;
  function polygon(c,p,fill,stroke,width=.55){
    if(p.length<3)return;c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));c.closePath();
    if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
  }
  function line(c,p,color,width=1){
    if(p.length<2)return;c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));c.strokeStyle=color;c.lineWidth=width;c.stroke();
  }
  function building(c,b,height=1,accent=0,opacity=1){
    if(height<=.003||opacity<=.002)return;
    const base=b.p.map(v=>project(v,(b.base||0)*height)),top=b.p.map(v=>project(v,b.h*height));
    const faces=b.p.map((v,i)=>({i,j:(i+1)%b.p.length,d:depth(v)+depth(b.p[(i+1)%b.p.length])})).sort((a,b)=>a.d-b.d);
    c.save();c.globalAlpha=opacity;
    const dark=mix([172,172,172],[88,88,205],accent),light=mix([218,218,218],[116,116,255],accent),edge=mix([148,148,148],[94,94,224],accent);
    for(const f of faces)polygon(c,[base[f.i],base[f.j],top[f.j],top[f.i]],f.i%2?dark:light,edge,.45);
    polygon(c,top,mix([244,244,244],[155,155,255],accent),edge,.58);
    if(b.roof){
      // Roof geometry follows the complete footprint and shrinks with its walls.
      const edgePoints=b.roof.edge;
      for(let i=0;i<edgePoints.length;i++){
        const a=edgePoints[i],d=edgePoints[(i+1)%edgePoints.length];
        polygon(c,[project(a,b.h*height),project(d,b.h*height),project(d,(b.h+d[2])*height),project(a,(b.h+a[2])*height)],light,edge,.45);
      }
      const roofFaces=b.roof.faces.map(p=>({p,d:p.reduce((s,v)=>s+depth(v)/p.length,0)})).sort((a,b)=>a.d-b.d);
      roofFaces.forEach((f,i)=>polygon(c,f.p.map(v=>project(v,(b.h+v[2])*height)),mix(i%2?[229,229,229]:[201,201,201],i%2?[151,151,255]:[112,112,232],accent),edge,.55));
    }else if(b.kind==='barn'){
      const ridge=[project([(b.p[0][0]+b.p[3][0])/2,(b.p[0][1]+b.p[3][1])/2],(b.h+4)*height),project([(b.p[1][0]+b.p[2][0])/2,(b.p[1][1]+b.p[2][1])/2],(b.h+4)*height)];
      polygon(c,[top[0],top[1],ridge[1],ridge[0]],mix([222,225,230],[158,158,245],accent),edge,.6);
      polygon(c,[ridge[0],ridge[1],top[2],top[3]],mix([240,241,244],[192,192,255],accent),edge,.6);
      polygon(c,[top[0],ridge[0],top[3]],light,edge,.5);polygon(c,[top[1],ridge[1],top[2]],dark,edge,.5);
    }
    if(b.spire){
      const s=b.spire;
      building(c,{p:s.p,h:b.h+s.rise,base:b.h},height,accent);
      const tip=project(center({p:s.p}),(b.h+s.peak)*height);
      const sides=s.p.map((v,i)=>({a:v,b:s.p[(i+1)%s.p.length],d:depth(v)+depth(s.p[(i+1)%s.p.length])})).sort((a,b)=>a.d-b.d);
      sides.forEach((f,i)=>polygon(c,[project(f.a,(b.h+s.rise)*height),project(f.b,(b.h+s.rise)*height),tip],i%2?dark:light,edge,.6));
    }
    if((accent>.1||b.kind==='tower')&&height>.06){
      c.globalAlpha*=b.kind==='tower'?.45:accent*.55;
      for(let z=3.1;z<b.h*height;z+=3.1)line(c,[...b.p,b.p[0]].map(v=>project(v,z)),mix([142,142,142],[85,85,183],accent),.55);
    }
    c.restore();
  }
  function river(c){
    const p=SEPARCityLayout.river,w=SEPARCityLayout.halfWidth;
    const bank=(side,extra=0)=>p.map(([x,y],i)=>{
      const a=p[Math.max(0,i-1)],b=p[Math.min(p.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1;
      return project([x-dy/length*(w+extra)*side,y+dx/length*(w+extra)*side]);
    });
    // Unfilled watercourse: the page shows through between two neutral banks.
    line(c,bank(-1),'#c8c8c8',.55);
    line(c,bank(1),'#c8c8c8',.55);
  }
  function fadedBuilding(c,b,height=1,accent=0,opacity=1){
    const a=b.atmosphere||{opacity:1};
    if(height<=.003||a.opacity*opacity<=.002)return;
    if(a.opacity>=.999){building(c,b,height,accent,opacity);return;}
    let sprite=height===1&&accent===0?sprites.get(b):null;
    if(!sprite){
      const top=b.h+(b.spire?.peak||b.roof?.rise||5),p=b.p.flatMap(p=>[project(p),project(p,top*height)]),pad=12;
      const x=Math.floor((Math.min(...p.map(p=>p[0]))-pad)*dpr)/dpr,y=Math.floor((Math.min(...p.map(p=>p[1]))-pad)*dpr)/dpr;
      const w=Math.ceil((Math.max(...p.map(p=>p[0]))-x+pad)*dpr),h=Math.ceil((Math.max(...p.map(p=>p[1]))-y+pad)*dpr);
      const image=document.createElement('canvas');image.width=w;image.height=h;
      const pen=image.getContext('2d');pen.setTransform(dpr,0,0,dpr,-x*dpr,-y*dpr);building(pen,b,height,accent);
      sprite={image,x,y,w:w/dpr,h:h/dpr};if(height===1&&accent===0)sprites.set(b,sprite);
    }
    // Fade the completed sprite as one crisp object; no optical defocus.
    c.save();c.globalAlpha=opacity*a.opacity;
    c.drawImage(sprite.image,sprite.x,sprite.y,sprite.w,sprite.h);c.restore();
  }
  function plot(c,b,active=0,opacity=1){
    c.save();c.globalAlpha=opacity;
    polygon(c,b.p.map(v=>project(v)),mix([246,246,248],[231,231,255],active),mix([206,210,216],[116,116,255],active),active?.85:.5);c.restore();
  }
  function staticLayer(items){
    const points=items.flatMap(b=>b.p.flatMap(p=>[project(p),project(p,b.h+(b.spire?.peak||b.roof?.rise||5))]));
    // Cache edges align with backing pixels, so compositing preserves each stroke.
    const x=Math.max(0,Math.floor((Math.min(...points.map(p=>p[0]))-12)*dpr)/dpr),y=Math.max(0,Math.floor((Math.min(...points.map(p=>p[1]))-12)*dpr)/dpr);
    const w=Math.min(W-x,Math.ceil((Math.max(...points.map(p=>p[0]))+12-x)*dpr)/dpr),h=Math.min(H-y,Math.ceil((Math.max(...points.map(p=>p[1]))+12-y)*dpr)/dpr);
    if(w<=0||h<=0)return null;
    const image=document.createElement('canvas');image.width=Math.ceil(w*dpr);image.height=Math.ceil(h*dpr);
    const c=image.getContext('2d');c.setTransform(dpr,0,0,dpr,-x*dpr,-y*dpr);items.forEach(b=>fadedBuilding(c,b));
    return {image,x,y,w:image.width/dpr,h:image.height/dpr};
  }
  function prepare(){
    const c=terrain.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
    const stock=[...world.live.values(),...background];
    data.roads.forEach(p=>{
      const midpoint=p[Math.floor(p.length/2)];let closest=null,nearest=Infinity;
      for(const b of stock){const d=Math.hypot(midpoint[0]-b.c[0],midpoint[1]-b.c[1]);if(d<nearest){nearest=d;closest=b;}}
      c.globalAlpha=closest?.atmosphere?.opacity??1;line(c,p.map(v=>project(v)),'#e5e5e5',1.3);
    });c.globalAlpha=1;
    river(c);
    prepareLayers();
  }
  function prepareLayers(){
    const nodes=[...background.map(b=>({b})),...[...world.live.values()].map(b=>({b})),...world.active.flatMap(e=>[...e.sources.map(b=>({b,e,kind:'source'})),...e.targets.map(b=>({b,e,kind:'target'}))])].sort((a,b)=>depth(a.b.c)-depth(b.b.c));
    layers=[];let batch=[];
    for(const n of nodes){if(n.e){if(batch.length){layers.push(staticLayer(batch));batch=[];}layers.push(n);}else batch.push(n.b);}
    if(batch.length)layers.push(staticLayer(batch));layers=layers.filter(Boolean);
    revision=world.revision;
    host.dataset.buildings=String(nodes.length);host.dataset.events=String(world.queue.length);
  }
  function dynamic(node,t,opacity=1){
    const s=SEPARCityState.appearance(node.e,node.b,node.kind,t);
    const active=node.kind==='target'&&t>=node.b.flowStart&&t<node.b.settledAt;
    if(active)plot(ctx,node.b,.55,opacity*(node.b.atmosphere?.opacity??1));
    fadedBuilding(ctx,node.b,s.height,s.accent,opacity);
  }
  function routePoint(e,route,t){
    return SEPARCityLayout.routePoint(e,route,t);
  }
  function flow(e,t){
    // A moving ray travels only between completed demolition and construction.
    for(const target of e.targets.filter(b=>!b.onSite&&t>=b.flowStart&&t<b.buildStart)){
      const progress=clamp((t-target.flowStart)/(target.buildStart-target.flowStart));
      const routes=e.kind==='merge'?e.sources.map((a,index)=>({a,b:target,index})):[{a:e.sources[0],b:target,index:e.targets.indexOf(target)}];
      const tail=Math.max(0,progress-.55);
      const opacity=smooth((t-target.flowStart)/.12)*smooth((target.buildStart-t)/.16);
      for(const route of routes){
        const start=routePoint(e,route,tail),tip=routePoint(e,route,progress);
        if(Math.hypot(tip[0]-start[0],tip[1]-start[1])<.1)continue;
        ctx.save();ctx.globalAlpha=opacity;ctx.lineCap='round';ctx.lineJoin='round';
        const gradient=ctx.createLinearGradient(...start,...tip);
        gradient.addColorStop(0,'rgba(116,116,255,0)');
        gradient.addColorStop(.45,'rgba(116,116,255,.22)');
        gradient.addColorStop(.8,'rgba(116,116,255,.65)');
        gradient.addColorStop(1,'#7474ff');
        line(ctx,Array.from({length:25},(_,i)=>routePoint(e,route,tail+(progress-tail)*i/24)),gradient,1.6);
        ctx.restore();
      }
    }
  }
  function draw(){
    const now=time;world.advance(now);
    if(revision!==world.revision)prepareLayers();
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.drawImage(terrain,0,0,terrain.width/dpr,terrain.height/dpr);
    // Cleared ground stays empty. Only an active receiving site is outlined.
    for(const l of layers){if(l.image)ctx.drawImage(l.image,l.x,l.y,l.w,l.h);else dynamic(l,now);}
    world.active.forEach(e=>flow(e,now));
    host.dataset.ready='true';host.dataset.time=now.toFixed(2);
    host.dataset.generation=String(world.generation);host.dataset.generationEnd=world.generationEnd.toFixed(2);
    host.dataset.demolished=String(world.demolished);host.dataset.built=String(world.built);
    host.dataset.constructing=String(world.active.flatMap(e=>e.targets).filter(b=>now>=b.buildStart&&now<b.settledAt).length);
    host.dataset.demolishing=String(world.active.flatMap(e=>e.sources.map(b=>({b,e}))).filter(({e})=>now<e.demolitionEnd).length);
    host.dataset.activeEpisodes=String(world.active.length);
  }
  function tick(stamp){
    raf=0;if(reduced.matches||!inView||document.hidden){last=0;return;}
    if(last)time+=Math.min((stamp-last)/1000,.12);last=stamp;
    // Keep the fractional frame remainder so a 60Hz screen stays near 30fps.
    // Resetting the clock after every draw previously skipped whole frames.
    const interval=1000/30,elapsed=stamp-lastDraw;
    if(!lastDraw||elapsed>=interval-.1){
      lastDraw=stamp-Math.max(0,elapsed%interval);draw();
    }
    raf=requestAnimationFrame(tick);
  }
  function sync(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;lastDraw=0;if(!reduced.matches&&inView&&!document.hidden)raf=requestAnimationFrame(tick);}
  function resize(){
    // Render at the displayed size with at least 2x sampling, including large screens.
    const pixels=Math.ceil(canvas.getBoundingClientRect().width*Math.max(2,Math.min(devicePixelRatio||1,3)));
    dpr=Math.max(1,pixels)/W;
    sprites=new WeakMap();
    [canvas,terrain].forEach(c=>{c.width=pixels;c.height=Math.ceil(H*dpr);});prepare();draw();
  }
  reduced.addEventListener('change',()=>{draw();sync();});document.addEventListener('visibilitychange',sync);
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.05}).observe(host);
  let oldWidth=0;new ResizeObserver(entries=>{const width=Math.round(entries[0].contentRect.width);if(width!==oldWidth){oldWidth=width;resize();}}).observe(host);
  if(reduced.matches)time=6.3;
  resize();sync();
})();
