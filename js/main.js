/* Novaform — interactions & motion (GSAP + ScrollTrigger + Lenis, served locally) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  $$('.year').forEach(y => y.textContent = new Date().getFullYear());

  /* ---------- Split text into words (keeps inner spans like .grad / .muted) ---------- */
  const splitWords = el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  };
  $$('.fx-words, [data-highlight]').forEach(splitWords);
  // gradient text must sit on each word so the clip still works
  $$('.grad .w').forEach(w => w.classList.add('grad'));
  $$('.muted .w').forEach(w => w.style.color = 'inherit');

  /* ---------- Duplicate marquee tracks for a seamless loop ---------- */
  $$('.voices__track').forEach(t => { t.innerHTML += t.innerHTML; });

  /* ---------- Videos play only when visible ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  }), { rootMargin: '250px 0px' });
  $$('video').forEach(v => { v.muted = true; vio.observe(v); v.addEventListener('error', () => v.removeAttribute('src'), true); });

  /* ---------- Nav: scrolled state, sliding highlight, active section, drawer ---------- */
  const nav = $('.nav'), links = $('.nav__links');
  const hl = document.createElement('span'); hl.className = 'hl'; links.prepend(hl);
  const moveHl = a => { if (!a) { hl.style.opacity = 0; return; } hl.style.opacity = 1; hl.style.width = a.offsetWidth + 'px'; hl.style.transform = `translateX(${a.offsetLeft}px)`; };
  $$('a', links).forEach(a => a.addEventListener('mouseenter', () => moveHl(a)));
  links.addEventListener('mouseleave', () => moveHl($('a.is-active', links)));
  const sections = $$('a', links).map(a => $(a.getAttribute('href')));
  const setActive = () => {
    const y = innerHeight * .35; let cur = null;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < y) cur = i; });
    $$('a', links).forEach((a, i) => a.classList.toggle('is-active', i === cur));
    if (!links.matches(':hover')) moveHl($('a.is-active', links));
  };
  const bar = $('.progress');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', scrollY > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    setActive();
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const burger = $('.burger');
  const drawer = open => { document.body.classList.toggle('drawer-open', open); burger.setAttribute('aria-expanded', open); $('.drawer').setAttribute('aria-hidden', !open); };
  burger.addEventListener('click', () => drawer(!document.body.classList.contains('drawer-open')));
  $$('.drawer a').forEach(a => a.addEventListener('click', () => drawer(false)));

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    if (G) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const t = id.length > 1 ? $(id) : document.body;
    if (!t) return; e.preventDefault();
    lenis ? lenis.scrollTo(t, { offset: -90 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- Cursor spotlight + 3D tilt ---------- */
  if (fine) {
    $$('[data-spot]').forEach(el => el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
    if (!reduce) $$('.tilt').forEach(t => {
      t.addEventListener('pointermove', e => {
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        t.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(0)`;
      });
      t.addEventListener('pointerleave', () => t.style.transform = '');
    });
    // hero orbs drift with the mouse
    const orbs = $$('.hero__orb'); const hero = $('.hero');
    if (!reduce) hero.addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      orbs.forEach((o, i) => o.style.transform = `translate(${x * (i ? -60 : 60)}px, ${y * (i ? -40 : 40)}px)`);
    });
  }

  /* ---------- Hero audit form ---------- */
  const hf = $('.hero__form');
  hf.addEventListener('submit', () => {
    const i = $('input', hf), b = $('button', hf);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim())) { i.focus(); i.placeholder = 'Please enter a valid work email'; i.value = ''; return; }
    b.textContent = 'Audit requested ✓'; i.value = ''; i.placeholder = "We'll be in touch within 24h";
  });

  /* ---------- Pricing switch ---------- */
  $$('.switch__btn').forEach(b => b.addEventListener('click', () => {
    $$('.switch__btn').forEach(x => x.classList.toggle('is-on', x === b));
    const p = b.dataset.period;
    $$('.tier__price b').forEach(el => {
      const next = el.dataset[p]; if (el.textContent === next) return;
      if (G && !reduce) gsap.timeline().to(el, { y: -14, opacity: 0, duration: .2 }).add(() => el.textContent = next).fromTo(el, { y: 14 }, { y: 0, opacity: 1, duration: .35, ease: 'power3.out' });
      else el.textContent = next;
    });
  }));

  /* ---------- Accordion (one open at a time) ---------- */
  $$('.acc__q').forEach(q => q.addEventListener('click', () => {
    const item = q.parentElement, open = !item.classList.contains('is-open');
    $$('.acc__item').forEach(i => { i.classList.remove('is-open'); $('.acc__q', i).setAttribute('aria-expanded', 'false'); });
    if (open) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
  }));

  /* ---------- Contact form (front-end validation — connect to your backend/CRM) ---------- */
  const f = $('.cform');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const note = $('.cform__note', f), n = f.elements.name, m = f.elements.email;
    [n, m].forEach(x => x.classList.remove('bad'));
    let ok = true;
    if (!n.value.trim()) { n.classList.add('bad'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.value.trim())) { m.classList.add('bad'); ok = false; }
    note.classList.toggle('err', !ok);
    if (!ok) { note.textContent = 'Please add your name and a valid work email.'; return; }
    const btn = $('button[type=submit]', f); btn.disabled = true; btn.textContent = 'Booking…';
    setTimeout(() => {
      note.textContent = `Thanks ${n.value.trim().split(' ')[0]}! A strategist will email you within 24 hours.`;
      btn.textContent = 'Request sent ✓'; f.reset();
      setTimeout(() => { btn.disabled = false; btn.textContent = 'Book my free audit'; }, 4000);
    }, 800);
  });

  /* ---------- Counters ---------- */
  const count = el => {
    const end = parseFloat(el.dataset.count), d = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '';
    const fmt = v => v.toFixed(d) + suf;
    if (!G || reduce) { el.textContent = fmt(end); return; }
    const o = { v: 0 }; gsap.to(o, { v: end, duration: 1.8, ease: 'expo.out', onUpdate: () => el.textContent = fmt(o.v) });
  };
  const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } }), { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- Without GSAP or with reduced motion: static but complete ---------- */
  if (!G || reduce) {
    $$('.statement__text .w').forEach(w => w.classList.add('on'));
    $$('.ring__fg').forEach(r => r.style.strokeDashoffset = 314 * .04);
    $$('.flow__step').forEach(s => s.classList.add('is-on'));
    return;
  }

  /* =========================================================
     GSAP MOTION — blur-in words, frame opening, stacking cards
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);
  const E = 'expo.out';

  // Hidden start states (set in JS so content is visible if scripts fail)
  gsap.set('.fx-words .w', { yPercent: 60, opacity: 0, filter: 'blur(10px)' });
  gsap.set('.fx-up', { y: 24, opacity: 0, filter: 'blur(6px)' });
  gsap.set('.hero__frame', { clipPath: 'inset(18% 22% 30% 22% round 32px)', opacity: 0 });
  gsap.set('.float', { scale: .7, opacity: 0 });

  /* ---------- Hero intro ---------- */
  gsap.timeline({ defaults: { ease: E } })
    .from('.nav', { y: -30, opacity: 0, duration: 1 })
    .to('.hero .fx-up:first-child', { y: 0, opacity: 1, filter: 'blur(0px)', duration: .9 }, '-=.7')
    .to('.hero__title .w', { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: .06 }, '-=.6')
    .to('.hero .fx-up:not(:first-child)', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: .1 }, '-=.8')
    .to('.hero__frame', { clipPath: 'inset(0% 0% 0% 0% round 32px)', opacity: 1, duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, '-=.9')
    .to('.float', { scale: 1, opacity: 1, duration: .9, stagger: .12, ease: 'back.out(1.8)' }, '-=.6')
    .from('.spark path', { strokeDasharray: 200, strokeDashoffset: 200, duration: 1.4, ease: 'power2.out' }, '-=.6');

  // hero video settles & floats drift on scroll
  gsap.to('.hero__media video', { scale: 1, ease: 'none', scrollTrigger: { trigger: '.hero__frame', start: 'top 80%', end: 'bottom top', scrub: true } });
  gsap.to('.float--a', { y: -50, ease: 'none', scrollTrigger: { trigger: '.hero__frame', start: 'top 60%', end: 'bottom top', scrub: true } });
  gsap.to('.float--b', { y: 40, ease: 'none', scrollTrigger: { trigger: '.hero__frame', start: 'top 60%', end: 'bottom top', scrub: true } });

  /* ---------- Generic blur-in reveals (outside hero) ---------- */
  $$('.fx-words').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.to($$('.w', el), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: .035, ease: E, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  $$('.fx-up').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.to(el, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: E, scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* ---------- Statement lights up word by word ---------- */
  const words = $$('.statement__text .w');
  ScrollTrigger.create({
    trigger: '.statement__text', start: 'top 75%', end: 'bottom 45%', scrub: true,
    onUpdate: s => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); }
  });

  /* ---------- Services: stacking cards shrink as the next one lands ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const cards = $$('.stack__card');
    cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      gsap.to(c, {
        scale: .92 + i * .015, ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top ' + (110 + (i + 1) * 22) + 'px', scrub: true }
      });
    });
  });
  $$('.stack__media').forEach(m => gsap.from(m, { clipPath: 'inset(0 0 100% 0 round 32px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: m, start: 'top 85%' } }));

  /* ---------- Bento: tiles rise with a 3D tip ---------- */
  gsap.set('.tile', { y: 70, rotateX: -14, opacity: 0, transformOrigin: '50% 100%' });
  ScrollTrigger.batch('.tile', {
    start: 'top 88%', once: true,
    onEnter: b => gsap.to(b, { y: 0, rotateX: 0, opacity: 1, duration: 1.2, stagger: .1, ease: E, clearProps: 'transform' })
  });
  gsap.from('.bars i', { scaleY: 0, duration: 1.2, stagger: .07, ease: E, scrollTrigger: { trigger: '.bars', start: 'top 90%' } });
  gsap.to('.ring__fg', { strokeDashoffset: 314 * .04, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: '.ring', start: 'top 90%' } });
  gsap.from('.integrations span', { scale: .6, opacity: 0, duration: .6, stagger: .05, ease: 'back.out(2)', scrollTrigger: { trigger: '.tile--d', start: 'top 85%' } });

  /* ---------- Work: images unmask from below + parallax ---------- */
  $$('.case').forEach(c => {
    const box = $('.case__img', c), img = $('img', c);
    gsap.from(box, { clipPath: 'inset(100% 0 0 0 round 32px)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: c, start: 'top 85%' } });
    gsap.from([$('.case__meta', c), $('p', c)], { y: 20, opacity: 0, duration: 1, stagger: .1, delay: .4, ease: E, scrollTrigger: { trigger: c, start: 'top 85%' } });
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- Process: path draws itself, steps light up ---------- */
  const path = $('.flow__draw');
  if (path) {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    const steps = $$('.flow__step');
    gsap.to(path, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '.flow', start: 'top 75%', end: 'bottom 55%', scrub: true,
        onUpdate: s => steps.forEach((st, i) => st.classList.toggle('is-on', s.progress >= i / steps.length + .02)) }
    });
    mm.add('(max-width: 900px)', () => { ScrollTrigger.batch('.flow__step', { start: 'top 80%', onEnter: b => b.forEach(x => x.classList.add('is-on')) }); });
    gsap.from('.flow__step', { y: 40, opacity: 0, duration: 1, stagger: .12, ease: E, scrollTrigger: { trigger: '.flow__steps', start: 'top 85%' } });
  }
  gsap.fromTo('.process__video video', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.process__video', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.from('.process__over div', { y: 30, opacity: 0, duration: 1, stagger: .12, ease: E, scrollTrigger: { trigger: '.process__video', start: 'top 65%' } });

  /* ---------- Pricing, FAQ, CTA ---------- */
  gsap.from('.tier', { y: 60, opacity: 0, duration: 1.1, stagger: .12, ease: E, scrollTrigger: { trigger: '.tiers', start: 'top 85%' } });
  gsap.from('.acc__item', { x: 30, opacity: 0, duration: .9, stagger: .07, ease: E, scrollTrigger: { trigger: '.acc', start: 'top 85%' } });
  gsap.from('.cta__box', { y: 80, scale: .97, opacity: 0, duration: 1.3, ease: E, scrollTrigger: { trigger: '.cta__box', start: 'top 88%' } });
  gsap.from('.cform', { x: 40, opacity: 0, duration: 1.2, delay: .2, ease: E, scrollTrigger: { trigger: '.cta__box', start: 'top 80%' } });
  gsap.from('.footer__word', { y: 80, opacity: 0, filter: 'blur(14px)', duration: 1.6, ease: E, scrollTrigger: { trigger: '.footer__word', start: 'top 98%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
