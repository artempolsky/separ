/* Persistent urban stock: each city generation consumes only older buildings. */
(() => {
  'use strict';
  const HIGHLIGHT=.55,DEMOLITION=2.4,TRANSFER=2.2,CONSTRUCTION=2.5,SETTLE=.9,GAP=.15;
  const DURATION=HIGHLIGHT+DEMOLITION+TRANSFER+CONSTRUCTION+SETTLE,STEP=1.9,MAX_ACTIVE=4;
  const center=b=>b.p.reduce((a,p)=>[a[0]+p[0]/b.p.length,a[1]+p[1]/b.p.length],[0,0]);
  const key=b=>b.id||`egid-${b.egid}`;
  const site=b=>b.kind==='bridge'?'bridge-site':key(b);
  const mass=b=>({...b,c:center(b),id:key(b),site:site(b),roofTemplate:b.roofTemplate||b.roof||null,born:0,bornAt:-10000});
  const distance=(a,b)=>Math.hypot(a.c[0]-b.c[0],a.c[1]-b.c[1]);
  const order=b=>{let n=2166136261;for(const c of b.site)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
  class City {
    constructor(data){
      this.data=data;this.live=new Map();this.empty=new Map();this.active=[];
      this.revision=0;this.generation=0;this.demolished=0;this.built=0;this.now=0;
      this.remaining=new Set();this.demolishedSites=new Map();
      // The surrounding quarters share the same generation as the centre.
      for(const b of [...data.buildings,...(data.atmosphereBuildings||[])]){const m=mass(b);this.live.set(m.id,m);}
      for(const e of data.scenarios){
        for(const b of e.sources){const m=mass(b);this.live.set(m.id,m);}
        for(const b of e.targets){const m=mass(b);this.empty.set(m.site,m);}
      }
      // The crossing is occupied initially; its materials later reach separate housing sites.
      this.empty.delete('bridge-site');this.plan(0);
    }
    plan(start){
      if(this.remaining.size||this.active.length)throw new Error('The entire city generation must finish before replanning');
      this.generation++;this.generationStart=start;this.queue=[];this.cursor=0;
      this.remaining=new Set(this.live.keys());
      const available=new Map(this.empty),consumed=new Set(),sourceSites=new Set(),running=[];let next=start+.6;
      const previousBySite=new Map([...this.live.values(),...[...this.empty.values()].filter(b=>this.demolishedSites.has(b.site))].map(b=>[b.site,b]));
      const renewal=(proposal)=>{
        const previous=previousBySite.get(proposal.site);
        if(!previous)return proposal;
        // A reused plot receives a visibly new volume, not its former building.
        // Keep the surveyed footprint and vary height by at least a storey/30%.
        const difference=Math.max(3.1,Math.min(8,previous.h*.3));
        let height=proposal.h;
        if(Math.abs(height-previous.h)<difference){
          height=previous.h>18?previous.h-difference:previous.h+difference;
        }
        const template=proposal.roofTemplate||previous.roofTemplate||previous.roof||null;
        const roof=proposal.kind==='tower'?null:((order(previous)+this.generation)%3===0?null:template);
        return {...proposal,h:Math.round(height*10)/10,roof,roofTemplate:template,illustrativeMassing:true};
      };
      const add=(kind,sources,rawTargets)=>{
        for(const b of sources){
          if(!this.remaining.has(b.id)||consumed.has(b.id)||sourceSites.has(b.site)||b.born>=this.generation)throw new Error('A building or plot cannot be demolished twice in one generation');
          sourceSites.add(b.site);
        }
        // Overlap independent episodes, with a bounded number of active sites.
        while(running.filter(end=>end>next).length>=MAX_ACTIVE)next=Math.min(...running.filter(end=>end>next))+GAP;
        next=Math.max(next,...rawTargets.map(b=>(b.vacantAfter||start)-HIGHLIGHT-DEMOLITION-TRANSFER));
        const targets=rawTargets.map((raw,i)=>{
          const b=renewal(raw);
          const onSite=sources.some(s=>s.site===b.site),flowStart=next+HIGHLIGHT+DEMOLITION;
          const buildStart=flowStart+(onSite?.25:TRANSFER),buildEnd=buildStart+CONSTRUCTION,settledAt=buildEnd+SETTLE;
          return {...b,id:`generation-${this.generation}-${this.queue.length}-${i}`,born:this.generation,bornAt:settledAt,flowStart,buildStart,buildEnd,settledAt,onSite};
        });
        const e={kind,i:this.queue.length,start:next,demolitionStart:next+HIGHLIGHT,demolitionEnd:next+HIGHLIGHT+DEMOLITION,end:Math.max(...targets.map(b=>b.settledAt)),sources,targets,generation:this.generation};
        this.queue.push(e);running.push(e.end);while(running.length&&running[0]<=next)running.shift();next+=STEP;
        for(const b of sources){consumed.add(b.id);if(!targets.some(t=>t.site===b.site))available.set(b.site,{...b,vacantAfter:e.demolitionEnd+GAP});}
        for(const b of targets)available.delete(b.site);
      };
      const tower=slot=>({...slot,kind:'tower',roof:null,spire:null,h:42,illustrativeMassing:true});
      const neighbours=(pool,target,count)=>{
        const chosen=[];
        // Separated origins make the converging streams legible from departure.
        const angle=b=>Math.atan2(b.c[1]-target.c[1],b.c[0]-target.c[0]);
        const separation=b=>chosen.length?Math.min(...chosen.map(c=>Math.acos(Math.cos(angle(b)-angle(c))))):Math.PI;
        const options=pool.filter(b=>b.area<650&&b.kind!=='tower'&&(b.atmosphere?.opacity??1)>.65&&distance(b,target)>100&&distance(b,target)<850);
        while(options.length&&chosen.length<count){
          options.sort((a,b)=>separation(b)-separation(a)||Math.abs(distance(a,target)-420)-Math.abs(distance(b,target)-420));
          chosen.push(options.shift());
        }
        return chosen;
      };
      if(this.generation===1){
        // The opening demonstrates one large source supplying several small sites.
        const reserved=new Set(this.data.scenarios.flatMap(e=>e.sources.map(key)));
        for(const [index,scenario] of this.data.scenarios.entries()){
          const sources=scenario.sources.map(b=>this.live.get(key(b)));
          let targets=scenario.targets.map(b=>mass(b)),kind=scenario.kind;
          const count=index===1?3:index===5?5:kind==='merge'?3:1;
          if(count>1){
            const pool=[...this.live.values()].filter(b=>!reserved.has(b.id)&&!consumed.has(b.id));
            sources.push(...neighbours(pool,targets[0],count-sources.length));
            targets=[{...tower(targets[0]),h:count===5?52:40}];kind='merge';
          }
          add(kind,sources,targets);
        }
      }
      const candidates=[...this.live.values()].filter(b=>!consumed.has(b.id));
      // Later generations start with the oldest completed stock. Newly built
      // objects cannot join their own generation's demolition queue.
      candidates.sort((a,b)=>a.bornAt-b.bornAt||Math.floor((b.atmosphere?.opacity??1)*4)-Math.floor((a.atmosphere?.opacity??1)*4)||order(a)-order(b));
      while(candidates.length){
        const first=candidates.shift();
        const group=[first];
        // Mix three- and five-source consolidations with multi-site splits.
        if(first.area<650&&(available.size<4||(this.queue.length%7===3&&available.size<18))){
          const count=this.queue.length%2?5:3;
          const nearby=candidates.filter(b=>b.area<650&&distance(first,b)<850&&(b.atmosphere?.opacity??1)>.45).sort((a,b)=>Math.abs(distance(first,a)-350)-Math.abs(distance(first,b)-350)).slice(0,count-1);
          for(const b of nearby){group.push(b);candidates.splice(candidates.indexOf(b),1);}
        }
        const options=[...available.values()].filter(b=>b.kind!=='bridge');
        if(!options.length)throw new Error('City renewal requires a vacant receiving site');
        options.sort((a,b)=>group.length>1?(b.area>=300)-(a.area>=300)||Math.abs(distance(first,a)-460)-Math.abs(distance(first,b)-460):Math.abs(distance(first,a)-460)-Math.abs(distance(first,b)-460));
        const smaller=options.filter(b=>b.area<first.area*.45);
        const count=group.length===1&&first.area>=500?Math.min(first.area>=900?3:2,smaller.length,Math.max(1,available.size-2)):1;
        const slots=count>1?smaller.slice(0,count):options.slice(0,1);
        const targets=slots.map((slot,i)=>{
          if(group.length>=3)return {...tower(slot),h:group.length>=5?52:40};
          const kind=slot.kind||'building';
          const height=kind==='house'?6.2+((this.generation+i)%3)*1.5:count>1?Math.max(6,Math.min(16,first.h*.7)):kind==='tower'?38+((this.generation+i)%3)*4:kind==='barn'?8+((this.generation+i)%3):Math.max(6,Math.min(32,first.h*(.9+((this.generation+i)%4)*.07)));
          return {...slot,h:Math.round(height*10)/10,kind,roof:kind==='tower'?null:slot.roof,illustrativeMassing:true};
        });
        add(count>1?'split':group.length>1?'merge':'single',group,targets);
      }
      this.generationEnd=Math.max(...this.queue.map(e=>e.end));
      this.nextGeneration=this.generationEnd+GAP;
      this.passSize=this.queue.reduce((n,e)=>n+e.sources.length,0);
      if(this.passSize!==this.remaining.size||consumed.size!==this.remaining.size)throw new Error('Generation must cover every city building');
    }
    advance(t){
      if(t<this.now)throw new Error('City time is monotonic');
      this.now=t;
      // Process transitions in timestamp order even during a large test/time jump.
      for(;;){
        const upcoming=this.queue[this.cursor];
        const finishing=this.active.reduce((a,e)=>!a||e.end<a.end?e:a,null);
        if(upcoming&&upcoming.start<=t&&(!finishing||upcoming.start<finishing.end)){
          for(const b of upcoming.sources){
            if(!this.live.has(b.id))throw new Error('Source building is not live');
            if(b.born>=this.generation||this.demolishedSites.get(b.site)===this.generation)throw new Error('New buildings remain until the next complete city generation');
            this.demolishedSites.set(b.site,this.generation);
            this.live.delete(b.id);this.empty.set(b.site,b);
          }
          this.active.push(upcoming);this.cursor++;this.revision++;continue;
        }
        if(finishing&&finishing.end<=t){
          for(const b of finishing.sources)this.remaining.delete(b.id);
          for(const b of finishing.targets){this.live.set(b.id,b);this.empty.delete(b.site);}
          this.active.splice(this.active.indexOf(finishing),1);
          this.demolished+=finishing.sources.length;this.built+=finishing.targets.length;this.revision++;continue;
        }
        if(!upcoming&&!this.active.length&&t>=this.nextGeneration){this.plan(this.nextGeneration);continue;}
        break;
      }
    }
    get progress(){return this.cursor/this.queue.length;}
  }
  const clamp=t=>Math.max(0,Math.min(1,t)),smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  function appearance(e,b,role,t){
    if(role==='source')return {height:1-smooth((t-e.demolitionStart)/DEMOLITION),accent:smooth((t-e.start)/HIGHLIGHT)};
    return {height:smooth((t-b.buildStart)/CONSTRUCTION),accent:t<b.buildStart?0:1-smooth((t-b.buildEnd)/SETTLE)};
  }
  globalThis.SEPARCityState={City,STEP,DURATION,HIGHLIGHT,DEMOLITION,TRANSFER,CONSTRUCTION,SETTLE,GAP,MAX_ACTIVE,appearance};
})();
