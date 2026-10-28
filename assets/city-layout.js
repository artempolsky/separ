/* A narrow watercourse follows the surveyed Murg alignment. */
(() => {
  const river=window.SEPAR_ZURICH.river;
  const halfWidth=5.5,clearance=10;
  function distance(p){
    let nearest=Infinity;
    for(let i=1;i<river.length;i++){
      const a=river[i-1],b=river[i],dx=b[0]-a[0],dy=b[1]-a[1];
      const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));
      nearest=Math.min(nearest,Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t));
    }
    return nearest;
  }
  function samples(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/8));return Array.from({length:n+1},(_,i)=>[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]);}
  function dry(b){return b.kind!=='bridge'&&b.p.every((p,i)=>samples(p,b.p[(i+1)%b.p.length]).every(p=>Math.abs(distance(p))>clearance));}
  function create(raw){
    const scenarios=raw.scenarios.filter(e=>e.kind!=='bridge'&&[...e.sources,...e.targets].every(dry));
    const activeSources=new Set(scenarios.flatMap(e=>e.sources.map(b=>b.id||`egid-${b.egid}`)));
    const stock=new Map(raw.buildings.filter(dry).map(b=>[b.id||`egid-${b.egid}`,b]));
    // Sites from omitted demonstration events remain ordinary stock on dry land.
    for(const e of raw.scenarios)for(const b of e.sources){const id=b.id||`egid-${b.egid}`;if(dry(b)&&!activeSources.has(id))stock.set(id,b);}
    const roads=[];
    for(const road of raw.roads){let run=[];for(let i=1;i<road.length;i++)for(const p of samples(road[i-1],road[i])){
      if(Math.abs(distance(p))>halfWidth+7)run.push(p);else{if(run.length>1)roads.push(run);run=[];}
    }if(run.length>1)roads.push(run);}
    return {...raw,buildings:[...stock.values()],scenarios,roads};
  }
  const camera=window.SEPAR_ZURICH.camera,angle=(camera.rotation||0)*Math.PI/180;
  const cos=Math.cos(angle),sin=Math.sin(angle);
  // Military perspective: the ground plan keeps its angles and equal XY scale;
  // every height projects straight up, with no horizontal displacement.
  const depth=p=>p[0]*sin+p[1]*cos;
  const project=(p,z=0)=>[camera.x+(p[0]*cos-p[1]*sin)*camera.scale,camera.y+(depth(p)-z*camera.heightScale)*camera.scale];
  function routePoint(e,route,t){
    // A shallow arc links the cleared source and receiving site.
    const a=project(route.a.c,1),b=project(route.b.c,1);
    const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
    if(length<.001)return a;
    const side=dx>=0?-1:1,bend=4*t*(1-t)*Math.min(24,length*.12)*side;
    return [a[0]+dx*t-dy/length*bend,a[1]+dy*t+dx/length*bend];
  }
  globalThis.SEPARCityLayout={create,river,distance,halfWidth,clearance,dry,project,depth,routePoint};
})();
