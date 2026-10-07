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
    updateSteps();
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

  /* ---------- Active nav link ---------- */
  const links = $$('.nav a:not(.nav__cta)');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['why', 'systems', 'partners', 'automation', 'contacts'].forEach((id) => sectionObserver.observe(document.getElementById(id)));

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

  /* ---------- Steps progress line ---------- */
  const steps = $('#steps');
  const stepItems = $$('.step', steps);
  function updateSteps() {
    const r = steps.getBoundingClientRect();
    const start = innerHeight * 0.75;
    const p = Math.min(1, Math.max(0, (start - r.top) / (r.height + innerHeight * 0.1)));
    steps.style.setProperty('--p', p.toFixed(3));
    stepItems.forEach((s) => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle('is-lit', sr.top + sr.height / 2 < start);
    });
  }

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
        notify('Email скопійовано ✓');
      } catch {
        notify(btn.dataset.copy);
      }
    });
  });
})();
