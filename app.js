(() => {
  "use strict";
  const dictionaries = window.SEPAR_TRANSLATIONS;

  // Verified language versions. Single-language articles retain their exact source URL.
  const externalLanguages = [
  {
    "host": "www.innovaud.ch",
    "urls": {
      "en": "https://www.innovaud.ch/en/",
      "de": "https://www.innovaud.ch/en/",
      "fr": "https://www.innovaud.ch/fr/",
      "it": "https://www.innovaud.ch/en/"
    },
    "language": {"de": "en", "it": "en"}
  },
  {
    "host": "www.innosuisse.admin.ch",
    "paths": [
      "/en/innovation-cheque",
      "/de/innovationsscheck",
      "/fr/cheque-dinnovation",
      "/it/assegno-per-linnovazione"
    ],
    "urls": {
      "en": "https://www.innosuisse.admin.ch/en/innovation-cheque",
      "de": "https://www.innosuisse.admin.ch/de/innovationsscheck",
      "fr": "https://www.innosuisse.admin.ch/fr/cheque-dinnovation",
      "it": "https://www.innosuisse.admin.ch/it/assegno-per-linnovazione"
    }
  },
  {
    "host": "www.innosuisse.admin.ch",
    "paths": [
      "/en/innovation-mentoring",
      "/de/innovationsmentoring",
      "/fr/mentoring-en-innovation",
      "/it/mentoring-per-linnovazione"
    ],
    "urls": {
      "en": "https://www.innosuisse.admin.ch/en/innovation-mentoring",
      "de": "https://www.innosuisse.admin.ch/de/innovationsmentoring",
      "fr": "https://www.innosuisse.admin.ch/fr/mentoring-en-innovation",
      "it": "https://www.innosuisse.admin.ch/it/mentoring-per-linnovazione"
    }
  },
  {
    "host": "www.innosuisse.admin.ch",
    "paths": [
      "/en/innovation-project-with-implementation-partner",
      "/de/innovationsprojekte-mit-umsetzungspartner",
      "/fr/projet-dinnovation-avec-partenaire-de-mise-en-oeuvre",
      "/it/progetti-dinnovazione-con-partner-attuatore"
    ],
    "urls": {
      "en": "https://www.innosuisse.admin.ch/en/innovation-project-with-implementation-partner",
      "de": "https://www.innosuisse.admin.ch/de/innovationsprojekte-mit-umsetzungspartner",
      "fr": "https://www.innosuisse.admin.ch/fr/projet-dinnovation-avec-partenaire-de-mise-en-oeuvre",
      "it": "https://www.innosuisse.admin.ch/it/progetti-dinnovazione-con-partner-attuatore"
    }
  },
  {
    "host": "www.innosuisse.admin.ch",
    "paths": [
      "",
      "/en",
      "/de",
      "/fr",
      "/it"
    ],
    "urls": {
      "en": "https://www.innosuisse.admin.ch/en",
      "de": "https://www.innosuisse.admin.ch/de",
      "fr": "https://www.innosuisse.admin.ch/fr",
      "it": "https://www.innosuisse.admin.ch/it"
    }
  },
  {
    "host": "www.empa.ch",
    "urls": {
      "en": "https://www.empa.ch/web/empa",
      "de": "https://www.empa.ch/de/",
      "fr": "https://www.empa.ch/fr/",
      "it": "https://www.empa.ch/web/empa"
    },
    "language": {
      "it": "en"
    }
  },
  {
    "host": "www.bfh.ch",
    "urls": {
      "en": "https://www.bfh.ch/en/",
      "de": "https://www.bfh.ch/de/",
      "fr": "https://www.bfh.ch/fr/",
      "it": "https://www.bfh.ch/en/"
    },
    "language": {
      "it": "en"
    }
  },
  {
    "host": "www.hevs.ch",
    "urls": {
      "en": "https://www.hevs.ch/en",
      "de": "https://www.hevs.ch/de",
      "fr": "https://www.hevs.ch/fr",
      "it": "https://www.hevs.ch/en"
    },
    "language": {
      "it": "en"
    }
  },
  {
    "host": "implenia.com",
    "urls": {
      "en": "https://implenia.com/en/",
      "de": "https://implenia.com/",
      "fr": "https://implenia.com/fr/",
      "it": "https://implenia.com/it/"
    }
  },
  {
    "host": "energylivinglab.com",
    "urls": {
      "en": "https://energylivinglab.com/projects/innovation-booster/",
      "de": "https://energylivinglab.com/de/projects/innovation-booster/",
      "fr": "https://energylivinglab.com/fr/projects/innovation-booster/",
      "it": "https://energylivinglab.com/projects/innovation-booster/"
    },
    "language": {
      "it": "en"
    }
  },
  {
    "host": "sps.swiss",
    "urls": {
      "en": "https://sps.swiss/en/group/home",
      "de": "https://sps.swiss/de/gruppe/home",
      "fr": "https://sps.swiss/en/group/home",
      "it": "https://sps.swiss/en/group/home"
    },
    "language": {
      "fr": "en",
      "it": "en"
    }
  },
  {
    "host": "www.losinger-marazzi.ch",
    "urls": {
      "en": "https://www.losinger-marazzi.ch/fr",
      "de": "https://www.losinger-marazzi.ch/de",
      "fr": "https://www.losinger-marazzi.ch/fr",
      "it": "https://www.losinger-marazzi.ch/fr"
    },
    "language": {
      "en": "fr",
      "it": "fr"
    }
  },
  {
    "host": "www.wsp.com",
    "urls": {
      "en": "https://www.wsp.com/en-gl/",
      "de": "https://www.wsp.com/de-ch/",
      "fr": "https://www.wsp.com/fr-ch/",
      "it": "https://www.wsp.com/en-gl/"
    },
    "language": {
      "it": "en"
    }
  }
];
  function localizeExternalLinks(language) {
    for (const link of document.querySelectorAll('a[href^="https://"]')) {
      const url = new URL(link.href);
      const rule = externalLanguages.find(r => r.host === url.hostname && (!r.paths || r.paths.includes(url.pathname.replace(/\/$/, ''))));
      if (!rule) continue;
      link.href = rule.urls[language] || rule.urls.en;
      link.dataset.linkLanguage = rule.language?.[language] || language;
      if (url.hostname === 'www.empa.ch') link.title = {
        en: 'Empa — Swiss Federal Laboratories for Materials Science and Technology',
        de: 'Empa — Eidgenössische Materialprüfungs- und Forschungsanstalt',
        fr: 'Empa — Laboratoire fédéral d’essai des matériaux et de recherche',
        it: 'Empa — Laboratorio federale di prova dei materiali e di ricerca (English)'
      }[language];
    }
  }

  const defaults = {};
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    defaults[el.dataset.i18n] = el.innerHTML;
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    defaults[el.dataset.i18nAlt] = el.alt;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    defaults[el.dataset.i18nAria] = el.getAttribute("aria-label");
  });
  Object.assign(defaults, {
    copied: "Email address copied.",
    copyFailed: "Please select and copy: separ@separ.ch",
    closeMenu: "Close menu",
    pageTitle: document.title,
    metaDescription: document.querySelector('meta[name="description"]').content,
  });
  Object.assign(defaults, window.SEPAR_SEARCH?.english || {});
  dictionaries.en = defaults;
  let currentLanguage = "en";
  const languageSelect = document.querySelector("#language");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector("#mobile-nav");
  const translate = (key) =>
    dictionaries[currentLanguage][key] ?? defaults[key] ?? key;

  function setLanguage(language) {
    if (!Object.hasOwn(dictionaries, language)) language = "en";
    currentLanguage = language;
    document.documentElement.lang = language;
    languageSelect.value = language;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.innerHTML = translate(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      el.alt = translate(el.dataset.i18nAlt);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", translate(el.dataset.i18nAria));
    });
    languageSelect.setAttribute("aria-label", translate("language"));
    menuButton.setAttribute(
      "aria-label",
      translate(
        menuButton.getAttribute("aria-expanded") === "true"
          ? "closeMenu"
          : "openMenu",
      ),
    );
    const articlePage = document.body.dataset.page === 'field-article';
    const pageTitle = articlePage ? translate('articleTitle') + ' — SEPAR' : translate('pageTitle');
    const description = articlePage ? translate('articleLead') : translate('metaDescription');
    document.title = pageTitle;
    document.querySelector('meta[name="description"]').content =
      description;
    document.querySelector('meta[property="og:title"]').content =
      pageTitle;
    document.querySelector('meta[property="og:description"]').content =
      description;

    document.querySelectorAll('[data-preserve-lang]').forEach((link) => {
      const url = new URL(link.getAttribute('href'), location.href);
      url.searchParams.set('lang', language);
      link.setAttribute('href', url.href);
    });
    localizeExternalLinks(language);
    window.SEPAR_SEARCH?.update(language);
    try {
      localStorage.setItem("separ-language", language);
    } catch {
      /* Private/file browsing may restrict storage. */
    }
  }
  let initialLanguage = "en";
  try {
    initialLanguage = localStorage.getItem("separ-language") || "en";
  } catch {}
  const queryLanguage = new URLSearchParams(location.search).get("lang");
  const routeLanguage = location.pathname.match(/^\/(de|fr|it)(?:\/|$)/)?.[1] || 'en';
  setLanguage(queryLanguage || (window.SEPAR_SEARCH && location.protocol!=='file:' ? routeLanguage : initialLanguage));
  languageSelect.addEventListener("change", (e) => setLanguage(e.target.value));

  // Shared disclosure behaviour for TRL and publication-status controls.
  const hints = [...document.querySelectorAll('.trl-hint,.preview-hint')];
  const parts = hint => ({button:hint.querySelector('button'),note:hint.querySelector('[role="tooltip"]')});
  function showHint(hint,open,pinned=false){
    const {button,note}=parts(hint);note.hidden=!open;button.setAttribute('aria-expanded',String(open));hint.dataset.pinned=String(open&&pinned);
  }
  function openHint(hint,pinned=false){hints.forEach(other=>{if(other!==hint)showHint(other,false);});showHint(hint,true,pinned);}
  for(const hint of hints){
    const {button}=parts(hint);
    hint.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')openHint(hint,hint.dataset.pinned==='true');});
    hint.addEventListener('pointerleave',()=>{if(hint.dataset.pinned!=='true'&&!hint.contains(document.activeElement))showHint(hint,false);});
    button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))openHint(hint);});
    button.addEventListener('click',()=>{if(hint.dataset.pinned==='true')showHint(hint,false);else openHint(hint,true);});
    hint.addEventListener('focusout',e=>{if(!hint.contains(e.relatedTarget))showHint(hint,false);});
  }
  document.addEventListener('pointerdown',e=>hints.forEach(hint=>{if(!hint.contains(e.target))showHint(hint,false);}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hints.forEach(hint=>showHint(hint,false));});

  function toggleMenu(open) {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      translate(open ? "closeMenu" : "openMenu"),
    );
    mobileNav.hidden = !open;
  }
  menuButton.addEventListener("click", () => toggleMenu(mobileNav.hidden));
  mobileNav
    .querySelectorAll("a,button")
    .forEach((el) => el.addEventListener("click", () => toggleMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !mobileNav.hidden) {
      toggleMenu(false);
      menuButton.focus();
    }
  });
  const desktopQuery = matchMedia("(min-width: 801px)");
  desktopQuery.addEventListener("change", (e) => {
    if (e.matches) toggleMenu(false);
  });

  const contactDialog = document.querySelector("#contact-dialog");
  const privacyDialog = document.querySelector("#privacy-dialog");
  let previousOverflow = "";
  let dialogScrollLocked = false;
  function openDialog(dialog) {
    if (dialog.open) return;
    if (!dialogScrollLocked) previousOverflow = document.body.style.overflow;
    dialogScrollLocked = true;
    document.body.style.overflow = "hidden";
    dialog.showModal();
  }
  document.addEventListener('separ:contact-open', () => openDialog(contactDialog));
  document
    .querySelectorAll("[data-privacy]")
    .forEach((el) =>
      el.addEventListener("click", () => openDialog(privacyDialog)),
    );
  for (const dialog of [contactDialog, privacyDialog]) {
    dialog
      .querySelector(".dialog-close")
      .addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
      if (e.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      )
        dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (!document.querySelector('dialog[open]')) {
        document.body.style.overflow = previousOverflow;
        dialogScrollLocked = false;
      }
    });
  }

})();
