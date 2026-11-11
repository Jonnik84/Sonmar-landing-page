(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Header state + scroll progress ---------- */
  const header = $('#header');
  const bar = $('.progress span');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    updateFlow();
  };

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    nav.classList.toggle('is-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

  /* ---------- Language switcher ---------- */
  const lang = $('#lang');
  const langBtn = $('.lang__btn', lang);
  const setLang = (open) => {
    langBtn.setAttribute('aria-expanded', open);
    lang.classList.toggle('is-open', open);
  };
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setLang(langBtn.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('click', (e) => { if (!lang.contains(e.target)) setLang(false); });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setLang(false));

  /* ---------- Active nav link ---------- */
  const links = $$('.nav a:not(.nav__cta)');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['brand', 'systems', 'partners', 'downloads', 'contacts'].forEach((id) => sectionObserver.observe(document.getElementById(id)));

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        revealObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));


  /* ---------- "Why" flow line ---------- */
  const flow = $('#flow');
  const flowLine = $('.flow__line', flow);
  function updateFlow() {
    const r = flow.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (innerHeight * 0.5)));
    flowLine.style.setProperty('--p', p.toFixed(3));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Card spotlight ---------- */
  $$('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--x', `${e.clientX - r.left}px`);
      card.style.setProperty('--y', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Tilt + shine on hero photo ---------- */
  if (finePointer && !reduceMotion) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(1000px) rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 8}deg)`;
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    /* Magnetic buttons */
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Rising bubbles in hero ---------- */
  const canvas = $('#bubbles');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, bubbles = [];
    const make = (anyY) => ({
      x: Math.random() * w,
      y: anyY ? Math.random() * h : h + 20,
      r: 1.5 + Math.random() * 5,
      s: 0.2 + Math.random() * 0.6,
      a: Math.random() * Math.PI * 2,
      o: 0.15 + Math.random() * 0.35,
    });
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(60, w / 24));
      bubbles = Array.from({ length: n }, () => make(true));
    };
    let visible = true;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);
    const tick = () => {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        bubbles.forEach((b, i) => {
          b.y -= b.s; b.a += 0.02; b.x += Math.sin(b.a) * 0.3;
          if (b.y < -20) bubbles[i] = make(false);
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(205, 70%, 45%, ${b.o})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = `hsla(201, 80%, 70%, ${b.o * 0.35})`;
          ctx.fill();
        });
      }
      requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(tick);
  }

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  const items = $$('.gallery__item');
  let idx = 0;
  let lastFocus = null;
  const show = (i) => {
    idx = (i + items.length) % items.length;
    const img = $('img', items[idx]);
    lbImg.src = items[idx].dataset.full;
    lbImg.alt = img.alt;
  };
  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lightbox__close', lb).focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = '';
    lastFocus && lastFocus.focus();
  };
  items.forEach((it, i) => it.addEventListener('click', () => open(i)));
  $('.lightbox__close', lb).addEventListener('click', close);
  $('.lightbox__nav--prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lightbox__nav--next', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Catalog & downloads (data/catalog.json, синхронізується з Directus) ---------- */
  const brand = $('#brand');
  const dlText = $('#dlText');
  if (brand && dlText) {
    const lang = document.documentElement.lang || 'uk';
    const src = brand.dataset.catalog;
    const base = src.replace(/data\/catalog\.json$/, '');
    const t = (k) => dlText.dataset['t' + k.replace(/(^|-)(\w)/g, (m, a, c) => c.toUpperCase())] || k;
    const TYPE_KEY = {
      'Каталог': 'type-catalog', 'Листівка/буклет': 'type-leaflet', 'Технічні дані': 'type-tech',
      'Інструкція з монтажу': 'type-install', 'Інструкція з настройки': 'type-setup', 'CAD/BIM інформація': 'type-cad',
      'Схема запчастин': 'type-parts', 'Інструкція «Швидкий старт»': 'type-quick', 'video': 'type-video',
    };
    const typeLabel = (ty) => (TYPE_KEY[ty] ? t(TYPE_KEY[ty]) : ty);
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const tr = (obj) => (obj && (obj[lang] || obj.uk)) || '';
    const size = (b) => {
      if (!b) return '';
      const mb = b / 1048576;
      const fmt = (n) => n.toLocaleString(lang, { maximumFractionDigits: 1 });
      return mb >= 1 ? `${fmt(mb)} ${t('mb')}` : `${fmt(Math.max(1, Math.round(b / 1024)))} ${t('kb')}`;
    };
    const date = (d) => (d ? new Date(d).toLocaleDateString(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');
    const asset = (p) => (/^https?:/.test(p) ? p : base + p);
    const ICON_DL = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>';
    const ICON_EYE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>';

    const state = { type: 'all', family: 'all', expanded: false };
    const PAGE = 6;
    let DATA = null;

    const renderCatalog = (c) => {
      const card = $('#catalogCard');
      if (!c) return;
      $$('[data-bind="open"]', card).forEach((a) => { a.href = c.url; });
      $('[data-bind="download"]', card).href = c.download || c.url;
      const cover = $('[data-bind="cover"]', card);
      if (c.cover) cover.src = asset(c.cover);
      else cover.hidden = true;
      $('[data-bind="version"]', card).textContent = c.version || '';
      $('[data-bind="meta"]', card).textContent = [c.format, size(c.size), (c.lang || []).join(', ').toUpperCase()].filter(Boolean).join(' · ');
      card.hidden = false;
    };

    const renderFamilies = (fams) => {
      $('#families').innerHTML = fams.map((f, i) => `
        <article class="fam" style="--i:${i}">
          <div class="fam__img"><img src="${esc(asset(f.image))}" alt="SONMAR ${esc(f.code)}" loading="lazy" /></div>
          <div class="fam__body">
            <span class="fam__code">${esc(f.code)}</span>
            <h3 class="fam__title">${esc(tr(f.title))}</h3>
            <ul class="fam__specs">${(tr(f.specs) || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
            <p class="fam__feature">${esc(tr(f.feature))}</p>
            <p class="fam__models"><span>${esc(t('models'))}:</span> ${f.models.map(esc).join(' · ')}</p>
            ${f.docs ? `<a class="fam__docs" href="#downloads" data-family="${esc(f.code)}">${esc(t('docs'))} <b>${f.docs}</b> ${ICON_DL}</a>` : ''}
          </div>
        </article>`).join('');
      $$('.fam__docs').forEach((a) => a.addEventListener('click', () => {
        state.family = a.dataset.family; state.type = 'all'; state.expanded = true; renderDocs();
      }));
    };

    const chip = (key, label, n, active) =>
      `<button type="button" class="dl-chip${active ? ' is-active' : ''}" data-key="${esc(key)}" aria-pressed="${active}">${esc(label)}${n != null ? ` <span>${n}</span>` : ''}</button>`;

    const renderDocs = () => {
      const docs = DATA.documents;
      const byFamily = docs.filter((d) => state.family === 'all' || d.families.includes(state.family));
      const types = [...new Set(docs.map((d) => d.type))];
      $('#dlTypes').innerHTML = chip('all', t('all'), byFamily.length, state.type === 'all') +
        types.map((ty) => chip(ty, typeLabel(ty), byFamily.filter((d) => d.type === ty).length, state.type === ty)).join('');
      const fams = DATA.families.map((f) => f.code).filter((c) => docs.some((d) => d.families.includes(c)));
      $('#dlFamilies').innerHTML = chip('all', t('all-series'), null, state.family === 'all') +
        fams.map((c) => chip(c, c, null, state.family === c)).join('');

      const list = byFamily.filter((d) => state.type === 'all' || d.type === state.type);
      const shown = state.expanded ? list : list.slice(0, PAGE);
      $('#dlGrid').innerHTML = shown.map((d, i) => {
        const tags = d.families.filter((c) => c !== d.title);
        const meta = [d.version && `${t('version')} ${d.version}`, date(d.date), size(d.size), (d.lang || []).join(', ').toUpperCase()].filter(Boolean);
        return `
        <article class="doc" style="--i:${i}">
          <div class="doc__icon"><span>${esc(d.format)}</span></div>
          <div class="doc__body">
            <span class="doc__type">${esc(typeLabel(d.type))}</span>
            <h3 class="doc__title">${esc(d.title)}</h3>
            ${tags.length ? `<p class="doc__tags">${tags.map((c) => `<span>${esc(c)}</span>`).join('')}</p>` : ''}
            <p class="doc__meta">${meta.map(esc).join(' · ')}</p>
          </div>
          <div class="doc__actions">
            <a href="${esc(d.url)}" target="_blank" rel="noopener" aria-label="${esc(t('open'))}: ${esc(d.title)}" title="${esc(t('open'))}">${ICON_EYE}</a>
            ${d.download ? `<a href="${esc(d.download)}" class="doc__dl" aria-label="${esc(t('download'))}: ${esc(d.title)}" title="${esc(t('download'))}">${ICON_DL}</a>` : ''}
          </div>
        </article>`;
      }).join('');
      $('#dlEmpty').hidden = list.length > 0;
      const more = $('#dlMore');
      more.hidden = state.expanded || list.length <= PAGE;
      more.textContent = `${t('more')} (${list.length})`;
    };

    $('#dlTypes').addEventListener('click', (e) => {
      const b = e.target.closest('.dl-chip'); if (!b) return;
      state.type = b.dataset.key; renderDocs();
    });
    $('#dlFamilies').addEventListener('click', (e) => {
      const b = e.target.closest('.dl-chip'); if (!b) return;
      state.family = b.dataset.key; state.type = 'all'; renderDocs();
    });
    $('#dlMore').addEventListener('click', () => { state.expanded = true; renderDocs(); });

    fetch(src, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        DATA = data;
        renderCatalog(data.catalog);
        renderFamilies(data.families || []);
        renderDocs();
      })
      .catch(() => { $('#downloads').hidden = true; $('.brand__more').hidden = true; });
  }

  /* ---------- Copy email ---------- */
  const toast = $('#toast');
  let toastTimer;
  const notify = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-show'), 2200);
  };
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        notify(btn.dataset.copied);
      } catch {
        notify(btn.dataset.copy);
      }
    });
  });
})();
