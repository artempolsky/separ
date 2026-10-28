(() => {
  const timeline=document.querySelector('.development-timeline');
  if(timeline){
    const pair=[...timeline.children].slice(1,3);
    let scheduled=0;
    function alignPhotos(){
      scheduled=0;
      pair.forEach(item=>item.style.removeProperty('--photo-align-offset'));
      if(innerWidth<=1200)return;
      const bottoms=pair.map(item=>item.querySelector('.field-note-link').previousElementSibling.getBoundingClientRect().bottom);
      const baseline=Math.max(...bottoms);
      pair.forEach((item,i)=>item.style.setProperty('--photo-align-offset',Math.max(0,baseline-bottoms[i])+'px'));
    }
    function schedule(){if(!scheduled)scheduled=requestAnimationFrame(alignPhotos);}
    new ResizeObserver(schedule).observe(timeline);
    new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    document.fonts.ready.then(schedule);
  }

  const vision = document.querySelector('.vision-image');
  if (!vision) return;
  const overlay = vision.querySelector('.vision-surprise');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let entered = false;
  let generation = 0;
  vision.addEventListener('pointerenter', async event => {
    if (event.pointerType === 'touch' || reduced.matches) return;
    entered = true;
    const current = ++generation;
    try { await overlay.decode(); } catch { return; }
    if (entered && current === generation && !reduced.matches) vision.classList.add('show-surprise');
  });
  vision.addEventListener('pointerleave', () => { entered = false; generation++; });
  overlay.addEventListener('animationend', () => vision.classList.remove('show-surprise'));
  reduced.addEventListener('change', () => {
    if (reduced.matches) { generation++; vision.classList.remove('show-surprise'); }
  });
})();
