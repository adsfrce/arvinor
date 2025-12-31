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
    nav.style.boxShadow = sc > 12 ? '0 20px 80px rgba(0,0,0,.28)' : 'none';
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

  // Canvas particle field with mouse gravity (the “mind blown” layer)
  const canvas = $('#fx');
  const ctx = canvas?.getContext('2d');
  if (canvas && ctx && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let w = 0, h = 0, dpr = 1;
    let particles = [];
    let mouse = { x: 0, y: 0, vx: 0, vy: 0, active: false };

    const resize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = canvas.clientWidth = window.innerWidth;
      h = canvas.clientHeight = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((w * h) / 26000); // scales with area
      particles = new Array(count).fill(0).map(() => makeParticle());
    };

    const rnd = (a, b) => a + Math.random() * (b - a);
    const makeParticle = () => {
      const speed = rnd(0.2, 1.0);
      const angle = rnd(0, Math.PI * 2);
      return {
        x: rnd(0, w),
        y: rnd(0, h),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: rnd(0.8, 2.2),
        a: rnd(0.08, 0.22),
        hue: rnd(195, 220) // blue family
      };
    };

    const onMove = (e) => {
      const x = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const y = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      mouse.vx = x - mouse.x;
      mouse.vy = y - mouse.y;
      mouse.x = x;
      mouse.y = y;
      mouse.active = true;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseleave', () => (mouse.active = false), { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // subtle vignette
      const g = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, Math.max(w, h));
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const mx = mouse.x, my = mouse.y;
      const influence = mouse.active ? 120 : 0;
      const pull = mouse.active ? 0.0024 : 0;

      // particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // mouse attraction
        if (mouse.active) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy) + 0.001;
          if (dist < influence) {
            const f = (influence - dist) * pull;
            p.vx += (dx / dist) * f + (mouse.vx * 0.00008);
            p.vy += (dy / dist) * f + (mouse.vy * 0.00008);
          }
        }

        // drift
        p.x += p.vx;
        p.y += p.vy;

        // soft damping
        p.vx *= 0.995;
        p.vy *= 0.995;

        // wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // draw glow dot
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // connecting lines (only near mouse for performance + wow)
      if (mouse.active) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(61,167,255,${(1 - dist/140) * 0.09})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }

        // mouse glow
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 180);
        mg.addColorStop(0, 'rgba(61,167,255,0.14)');
        mg.addColorStop(0.4, 'rgba(124,92,255,0.08)');
        mg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = mg;
        ctx.fillRect(0, 0, w, h);
      }

      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    requestAnimationFrame(draw);
  }
})();
