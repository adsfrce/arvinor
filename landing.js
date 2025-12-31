// landing.js
(() => {
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];

  // Smooth scroll for in-page anchors (keeps /demo /app /legal clean)
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMobile();
    });
  });

  // Sticky nav subtle state
  const nav = $('#nav');
  const setNav = () => {
    const sc = window.scrollY || 0;
    nav.style.boxShadow = sc > 12 ? '0 12px 40px rgba(15,23,42,.10)' : 'none';
  };
  window.addEventListener('scroll', setNav, { passive: true });
  setNav();

  // Scroll progress bar
  const scrollFill = $('#scrollFill');
  const onScrollProgress = () => {
    const h = document.documentElement;
    const max = (h.scrollHeight - h.clientHeight) || 1;
    const p = Math.min(1, Math.max(0, (window.scrollY || 0) / max));
    scrollFill.style.width = (p * 100).toFixed(2) + '%';
  };
  window.addEventListener('scroll', onScrollProgress, { passive: true });
  onScrollProgress();

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add('in');
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  $$('.reveal').forEach(el => io.observe(el));

  // Counters
  const countEls = $$('[data-count]');
  const animateCount = (el, to) => {
    const start = 0;
    const dur = 1100 + Math.random() * 700;
    const t0 = performance.now();
    const isMoney = el.parentElement && el.parentElement.textContent.trim().startsWith('$') ? true : false;

    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      // easeOutQuint
      const eased = 1 - Math.pow(1 - p, 5);
      const val = Math.round(start + (to - start) * eased);
      el.textContent = isMoney ? val.toLocaleString() : String(val);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const countIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      const to = Number(el.getAttribute('data-count')) || 0;
      if (el.__counted) continue;
      el.__counted = true;
      animateCount(el, to);
    }
  }, { threshold: 0.35 });

  countEls.forEach(el => countIO.observe(el));

  // Button spark follow mouse (mind-blown feel)
  const setSpark = (btn, ev) => {
    const r = btn.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * 100;
    const y = ((ev.clientY - r.top) / r.height) * 100;
    btn.style.setProperty('--mx', x.toFixed(2) + '%');
    btn.style.setProperty('--my', y.toFixed(2) + '%');
  };

  $$('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (ev) => setSpark(btn, ev), { passive: true });
    btn.addEventListener('touchmove', (ev) => {
      if (!ev.touches || !ev.touches[0]) return;
      const t = ev.touches[0];
      setSpark(btn, { clientX: t.clientX, clientY: t.clientY });
    }, { passive: true });
  });

  // Magnetic buttons (strong but not nauseating)
  const magnets = $$('.magnetic');
  magnets.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      const dx = mx / r.width;
      const dy = my / r.height;
      const tX = dx * 10;
      const tY = dy * 10;
      el.style.transform = `translate3d(${tX}px, ${tY}px, 0)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate3d(0,0,0)';
    });
  });

  // Mobile nav
  const burger = $('#burger');
  const mnav = $('#mnav');
  const closeMobile = () => {
    if (!mnav) return;
    mnav.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    mnav.setAttribute('aria-hidden', 'true');
  };
  const openMobile = () => {
    if (!mnav) return;
    mnav.classList.add('is-open');
    burger?.setAttribute('aria-expanded', 'true');
    mnav.setAttribute('aria-hidden', 'false');
  };
  burger?.addEventListener('click', () => {
    const isOpen = mnav.classList.contains('is-open');
    isOpen ? closeMobile() : openMobile();
  });
  mnav?.addEventListener('click', (e) => {
    if (e.target === mnav) closeMobile();
  });
  $$('.mnav__link').forEach(a => a.addEventListener('click', closeMobile));

  // Minimal tracking hook (no network calls; just for your console / later wiring)
  $$('[data-track]').forEach(el => {
    el.addEventListener('click', () => {
      // Replace with your own tracking call later if needed.
      // Keeping it silent and safe for now.
      // console.log('TRACK', el.getAttribute('data-track'));
    });
  });
  // FAQ accordion: only one open at a time, default closed
  const faqs = $$('.qa');
  faqs.forEach(d => {
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      faqs.forEach(o => { if (o !== d) o.open = false; });
    });
  });

})();
