/* Canonical language URLs and metadata, shared with the static search build. */
(() => {
 const node=document.getElementById('separ-search-config');if(!node)return;
 const config=JSON.parse(node.textContent);
 const path=(language,article=config.article)=>(language==='en'?'/':'/'+language+'/')+(article?'reuseconrete.html':'');
 window.SEPAR_SEARCH={english:config.english,path,update(language){
  const meta=config.pages[language];if(!meta)return;
  document.title=meta.title;
  for(const [selector,value,attribute] of [
   ['meta[name="description"]',meta.description,'content'],['meta[property="og:title"]',meta.title,'content'],
   ['meta[property="og:description"]',meta.description,'content'],['meta[property="og:url"]',meta.url,'content'],
   ['meta[property="og:locale"]',meta.locale,'content'],['meta[name="twitter:title"]',meta.title,'content'],
   ['meta[name="twitter:description"]',meta.description,'content'],['link[rel="canonical"]',meta.url,'href']
  ])document.querySelector(selector)?.setAttribute(attribute,value);
  document.querySelector('#separ-schema').textContent=JSON.stringify(meta.schema);
  const url=new URL(location.href);url.pathname=path(language);url.searchParams.delete('lang');
  if(/^https?:$/.test(url.protocol)&&url.href!==location.href)history.replaceState(null,'',url.pathname+url.search+url.hash);
  document.querySelectorAll('[data-preserve-lang]').forEach(link=>{
   const target=new URL(link.getAttribute('href'),location.href);
   if(target.origin!==location.origin)return;
   target.pathname=path(language,target.pathname.includes('reuseconrete'));target.searchParams.delete('lang');
   link.setAttribute('href',target.pathname+target.search+target.hash);
  });
 }};
})();
