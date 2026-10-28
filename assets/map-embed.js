(() => {
  const frame = document.querySelector('#demolition-map-embed');
  if (!frame) return;
  const externalLinks = document.querySelectorAll('#tools .map-external-link, #tools .map-mobile-preview');
  const mobile = window.matchMedia('(max-width: 800px)');
  let visible = false;
  let loadedUrl = '';

  // Keep the complete desktop map viewport, including the time control.
  // Its fixed initial Switzerland zoom needs a full-size virtual viewport
  // when the host illustration frame is narrower than a desktop screen.
  new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (!width) return;
    const viewport = Math.max(1440, Math.round(width));
    frame.style.width = viewport + 'px';
    frame.style.height = (viewport * 9 / 16) + 'px';
    frame.style.transformOrigin = 'top left';
    frame.style.transform = `scale(${width / viewport})`;
  }).observe(frame.parentElement);

  function sync() {
    const url = new URL(frame.dataset.mapSrc);
    url.searchParams.set('lang', document.documentElement.lang || 'en');
    externalLinks.forEach(link => { link.href = url.href; });
    if (mobile.matches) {
      if (frame.hasAttribute('src')) frame.removeAttribute('src');
      loadedUrl = '';
      return;
    }
    if (visible && loadedUrl !== url.href) {
      loadedUrl = url.href;
      frame.src = loadedUrl;
    }
  }

  sync();
  mobile.addEventListener('change', sync);
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      visible = true;
      sync();
      observer.disconnect();
    }, { rootMargin: '120px' });
    observer.observe(frame.parentElement);
  } else {
    visible = true;
    sync();
  }
})();
