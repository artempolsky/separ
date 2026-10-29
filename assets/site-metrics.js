/* First-party aggregate action counts. No visitor/session identifier or browser storage. */
(() => {
 if(location.protocol!=='https:'||!['separ.ch','www.separ.ch'].includes(location.hostname))return;
 if(navigator.doNotTrack==='1'||navigator.globalPrivacyControl)return;
 const page=location.pathname.includes('reuseconrete')?'/reuseconrete.html':'/';
 let count=0,last='';
 const send=(event,detail)=>{
  if(count>=40||last===event+':'+detail)return;
  last=event+':'+detail;count++;
  fetch('/api/metrics',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',keepalive:true,body:JSON.stringify({event,detail,page,locale:document.documentElement.lang||'en'})}).catch(()=>{});
 };
 document.addEventListener('click',event=>{
  if(!event.isTrusted)return;
  const target=event.target.closest('button,a');if(!target)return;
  if(target.matches('[data-contact]'))send('enquiry_open',target.dataset.contact||'general');
  if(target.matches('.service-tab')){const i=[...document.querySelectorAll('.service-tab')].indexOf(target);send('service_select',['inventory','portfolio','lending','territory','custom'][i]);}
  if(target.tagName==='A'){
   let url;try{url=new URL(target.href);}catch{return;}
   if(url.hostname==='demolition.separ.ch')send('outbound','demolition_map');
   else if(url.protocol==='mailto:')send('outbound','email');
   else if(url.hostname.endsWith('linkedin.com'))send('outbound','linkedin');
   else if(url.hostname.endsWith('instagram.com'))send('outbound','instagram');
   else if(url.origin===location.origin&&url.pathname.includes('reuseconrete'))send('article_open','concrete');
   else if(url.origin===location.origin&&['#solutions','#research','#demolition','#about'].includes(url.hash))send('section_open',url.hash.slice(1));
  }
 });
 document.querySelector('#address-request')?.addEventListener('submit',event=>{if(event.isTrusted&&document.querySelector('#property-address')?.value.trim())send('enquiry_open','inventory');});
 document.querySelector('#language')?.addEventListener('change',()=>send('language_change',document.querySelector('#language').value));
})();
