(() => {
  const picker = document.querySelector('.language-picker');
  if (!picker) return;
  const native = picker.querySelector('#language');
  const toggle = picker.querySelector('.language-toggle');
  const list = picker.querySelector('.language-options');
  const options = [...list.querySelectorAll('[role="option"]')];
  const selected = () => options.find(option => option.dataset.language === native.value) || options[0];
  function sync() {
    toggle.querySelector('.language-code').textContent = native.value.toUpperCase();
    toggle.setAttribute('aria-label', `${native.getAttribute('aria-label')}: ${selected().textContent.trim().replace(/\s+/g, ' ')}`);
    list.setAttribute('aria-label', native.getAttribute('aria-label'));
    options.forEach(option => option.setAttribute('aria-selected', String(option === selected())));
  }
  function close(restoreFocus = false) {
    list.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) toggle.focus();
  }
  function open(index = options.indexOf(selected())) {
    list.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    options[index].focus();
  }
  toggle.addEventListener('click', () => list.hidden ? open() : close(true));
  toggle.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      open(event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : options.indexOf(selected()));
    }
  });
  options.forEach((option, index) => {
    option.addEventListener('click', event => {
      event.preventDefault();
      native.value = option.dataset.language;
      native.dispatchEvent(new Event('change', {bubbles: true}));
      sync();
      close(true);
    });
    option.addEventListener('keydown', event => {
      let next;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % options.length;
      else if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index + options.length - 1) % options.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = options.length - 1;
      else if (event.key.length === 1 && /[a-z]/i.test(event.key)) next = options.findIndex(item => item.dataset.language.startsWith(event.key.toLowerCase()));
      if (next !== undefined && next >= 0) {event.preventDefault();options[next].focus();}
    });
  });
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !list.hidden) {event.preventDefault();event.stopPropagation();close(true);}
  });
  picker.addEventListener('focusout', event => {if (!picker.contains(event.relatedTarget)) close();});
  document.addEventListener('pointerdown', event => {if (!picker.contains(event.target)) close();});
  native.addEventListener('change', sync);
  new MutationObserver(sync).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  picker.querySelector('.language-native').hidden = true;
  toggle.hidden = false;
  sync();
})();
