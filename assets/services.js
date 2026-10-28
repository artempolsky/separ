(() => {
  const tabs=[...document.querySelectorAll('.service-tab')];
  if(!tabs.length)return;
  function select(tab,focus=false){
    tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;const panel=document.getElementById(t.getAttribute('aria-controls'));panel.hidden=!active;panel.inert=!active;const visual=document.getElementById(t.getAttribute('aria-controls').replace('service-panel-','service-visual-'));if(visual){visual.hidden=!active;visual.inert=!active;}});
    if(focus)tab.focus();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(tab));
    tab.addEventListener('keydown',e=>{
      let n=i;if(['ArrowDown','ArrowRight'].includes(e.key))n=(i+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;
      e.preventDefault();select(tabs[n],true);
    });
  });
  select(tabs.find(t=>t.getAttribute('aria-selected')==='true')||tabs[0]);
  const orientation=matchMedia('(max-width:1100px)');
  const updateOrientation=()=>tabs[0].closest('[role="tablist"]').setAttribute('aria-orientation',orientation.matches?'horizontal':'vertical');
  orientation.addEventListener('change',updateOrientation);updateOrientation();
  const panels=document.querySelector('.service-panels');
  let measuring=false;
  function alignRows(){
    if(measuring)return;measuring=true;
    panels.style.removeProperty('--service-copy-height');
    if(panels.closest('.audit-service-depth')){
      // Measure all left-hand cases at the current width so a tab switch keeps
      // the report frame stable. Hidden panels are restored synchronously.
      const panelStyle=getComputedStyle(panels);
      const width=panels.getBoundingClientRect().width-parseFloat(panelStyle.paddingLeft)-parseFloat(panelStyle.paddingRight);
      const heights=[...panels.querySelectorAll('.service-panel')].map(panel=>{
        const hidden=panel.hidden,style=panel.getAttribute('style');
        panel.hidden=false;
        panel.style.cssText=`position:absolute;visibility:hidden;width:${width}px;pointer-events:none`;
        const height=panel.getBoundingClientRect().height;
        panel.hidden=hidden;
        if(style===null)panel.removeAttribute('style');else panel.setAttribute('style',style);
        return height;
      });
      const target=Math.ceil(Math.max(...heights))+'px';
      if(panels.style.getPropertyValue('--service-panel-height')!==target)panels.style.setProperty('--service-panel-height',target);
      const catalogue=panels.closest('.audit-service-depth');
      const reports=catalogue.querySelector('.service-visual-panels');
      const reportWidth=reports.getBoundingClientRect().width;
      const reportHeights=[...reports.querySelectorAll('.service-visual')].map(report=>{
        const hidden=report.hidden,style=report.getAttribute('style');
        report.hidden=false;
        report.style.cssText=`position:absolute;visibility:hidden;width:${reportWidth}px;height:auto;min-height:0;pointer-events:none`;
        const height=report.getBoundingClientRect().height;
        report.hidden=hidden;
        if(style===null)report.removeAttribute('style');else report.setAttribute('style',style);
        return height;
      });
      const menuHeight=catalogue.querySelector('.service-menu').getBoundingClientRect().height+26;
      const leftHeight=window.innerWidth>900?menuHeight+Math.max(...heights):0;
      const productCards=catalogue.classList.contains('product-cards-v2');
      const minimum=productCards?600:(catalogue.classList.contains('audit-simplified')?680:(window.innerWidth>=1800?890:840));
      const reportTarget=Math.ceil(Math.max(...reportHeights,productCards?0:leftHeight,minimum))+'px';
      if(reports.style.getPropertyValue('--service-report-height')!==reportTarget)reports.style.setProperty('--service-report-height',reportTarget);
    }else{
      const height=Math.max(...[...panels.querySelectorAll('.service-copy')].map(e=>e.getBoundingClientRect().height));
      panels.style.setProperty('--service-copy-height',Math.ceil(height)+'px');
    }
    measuring=false;
  }
  new ResizeObserver(alignRows).observe(panels);
  new MutationObserver(alignRows).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.fonts.ready.then(alignRows);
  const request=document.querySelector('#address-request');
  const address=document.querySelector('#property-address');
  const summary=document.querySelector('#address-summary');
  const mail=document.querySelector('#contact-dialog a[href^="mailto:"]');
  let requestedAddress='';
  function updateAddress(){
    if(!requestedAddress)return;
    summary.querySelector('p').textContent=requestedAddress;
    summary.hidden=false;
    const label=summary.querySelector('[data-i18n]').textContent.trim();
    mail.href='mailto:separ@separ.ch?body='+encodeURIComponent(label+': '+requestedAddress+'\n\n');
  }
  if(request&&address&&summary&&mail){
    address.addEventListener('input',()=>address.setCustomValidity(''));
    request.addEventListener('submit',event=>{
      event.preventDefault();
      if(!address.value.trim()){
        address.setCustomValidity(request.querySelector('label').textContent);
        address.reportValidity();return;
      }
      requestedAddress=address.value.trim();updateAddress();
      document.querySelector('.header-contact[data-contact]').click();
    });
    document.querySelector('#language').addEventListener('change',()=>queueMicrotask(updateAddress));
  }
})();
