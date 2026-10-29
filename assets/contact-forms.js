(() => {
  'use strict';
  const dialog=document.querySelector('#contact-dialog');
  const form=document.querySelector('#enquiry-form');
  if(!dialog||!form)return;
  const endpoint='/api/enquiry';
  const contexts=['general','inventory','portfolio','lending','territory','custom','advisory','research'];
  const topic=form.elements.topic, locationField=form.elements.address, message=form.elements.message;
  const submit=form.querySelector('[type="submit"]'), status=document.querySelector('#enquiry-status');
  const success=document.querySelector('#enquiry-success');
  const drafts=new Map();
  let activeRequest=null;
  let current='general',source='header',pending=false,sent=false;
  const language=()=>document.documentElement.lang;
  const copy=()=>window.SEPAR_CONTACT_COPY[language()]||window.SEPAR_CONTACT_COPY.en;
  const index=()=>contexts.indexOf(current);
  function remember(){if(!sent)drafts.set(current,{address:locationField.value,message:message.value});}
  function render(){
    const c=copy(),i=index();
    document.querySelector('#dialog-title').textContent=sent?c.enquirySent:c.titles[i];
    document.querySelector('#enquiry-lead').textContent=c.leads[i];
    document.querySelector('#enquiry-lead').hidden=sent;
    const old=topic.value;
    topic.replaceChildren(...contexts.map((id,n)=>{const option=new Option(c.topics[n],id);return option;}));
    topic.value=contexts.includes(old)?old:current;
    document.querySelector('#enquiry-location-label').textContent=current==='inventory'?c.enquiryBuilding:c.enquiryLocation;
    document.querySelector('#enquiry-message-label').textContent=current==='inventory'?c.enquiryMessageOptional:c.enquiryMessage;
    locationField.required=current==='inventory';
    message.required=current!=='inventory';
    message.placeholder=c.prompts[i];
    submit.textContent=pending?c.enquirySending:c.enquirySend;
    if(status.textContent)status.textContent=c.enquiryError;
  }
  function choose(context){
    activeRequest=null;remember();current=contexts.includes(context)?context:'general';topic.value=current;
    const draft=drafts.get(current)||{address:'',message:''};
    locationField.value=draft.address;message.value=draft.message;status.textContent='';
    render();
  }
  function open(context,where,address){
    if(!pending){
      if(sent){form.reset();drafts.clear();sent=false;}
      form.hidden=false;success.hidden=true;
      choose(context);source=where;
      if(typeof address==='string')locationField.value=address;
    }
    document.dispatchEvent(new Event('separ:contact-open'));
    render();
  }
  document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{
    open(button.dataset.contact||'general',button.dataset.enquirySource||button.dataset.contact||'header');
  }));
  topic.addEventListener('change',()=>{const target=topic.value;choose(target);});
  document.querySelector('#language')?.addEventListener('change',()=>queueMicrotask(render));
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  const addressRequest=document.querySelector('#address-request');
  addressRequest?.addEventListener('submit',event=>{
    event.preventDefault();
    const address=document.querySelector('#property-address');
    if(!address.value.trim()){address.value='';address.reportValidity();return;}
    open('inventory','address-assessment',address.value.trim());
  });
  form.addEventListener('input',event=>{activeRequest=null;event.target.setCustomValidity?.('');});
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(pending||sent)return;
    for(const field of [form.elements.name,form.elements.email,form.elements.phone,form.elements.organisation,locationField,message])field.value=field.value.trim();
    if(!form.reportValidity())return;
    if(form.elements._honey.value)return;
    pending=true;status.textContent='';submit.disabled=true;
    form.setAttribute('aria-busy','true');
    form.querySelector('fieldset').disabled=true;
    render();
    const requestId=activeRequest ||= crypto.randomUUID();
    const data={
      name:form.elements.name.value,
      email:form.elements.email.value,
      phone:form.elements.phone.value,
      organisation:form.elements.organisation.value,
      topic:current,
      address:locationField.value,
      message:message.value,
      language:language(),
      source:source,
      page:location.pathname,
      request_id:requestId,
      _honey:form.elements._honey.value
    };
    try {
      const response=await fetch(endpoint,{
        method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(data),signal:AbortSignal.timeout(25000),credentials:'same-origin',referrerPolicy:'origin'
      });
      const result=await response.json();
      if(!response.ok||!(result.success===true||result.success==='true'))throw new Error('Unconfirmed submission');
      sent=true;drafts.clear();form.reset();form.hidden=true;success.hidden=false;
      document.querySelector('#enquiry-success-text').textContent=copy().enquirySuccess;
      document.querySelector('#enquiry-success-text').focus();
    } catch {
      status.textContent=copy().enquiryError;
      status.focus();
    } finally {
      pending=false;submit.disabled=false;form.querySelector('fieldset').disabled=false;
      form.removeAttribute('aria-busy');render();
    }
  });
  document.querySelector('#enquiry-done').addEventListener('click',()=>dialog.close());
  render();
})();

