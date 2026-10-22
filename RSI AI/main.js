// Resize only when the canvas box really changed (the mobile URL bar fires resize on every scroll)
const onBoxResize = (el, fn) => {
  let w = el.clientWidth, h = el.clientHeight;
  window.addEventListener('resize', () => {
    if (Math.abs(el.clientWidth - w) < 1 && Math.abs(el.clientHeight - h) < 1) return;
    w = el.clientWidth; h = el.clientHeight; fn();
  });
};

(() => {
  // Headline option A: open the page with ?h=a
  if (new URLSearchParams(location.search).get('h') === 'a') {
    document.querySelector('[data-headline]').innerHTML =
      'Speed and accuracy, <em>without the guesswork</em>';
  }

  // RSI Exchange cross-link — set the real URL here once the domain is confirmed
  const RSI_EXCHANGE_URL = 'https://rsiexchange.com/';
  document.querySelectorAll('[data-rsi-exchange]').forEach((a) => { a.href = RSI_EXCHANGE_URL; a.target = '_blank'; a.rel = 'noopener'; });

  // Header background after scroll
  const hdr = document.getElementById('hdr');
  const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile burger menu
  const burger = document.querySelector('.hdr__burger');
  const setMenu = (open) => {
    hdr.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!hdr.classList.contains('is-open')));
  document.querySelectorAll('.hdr__nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Hanging indents and row offsets line up with the 2nd header menu item ("Why RSI X AI"):
  // --indent = distance from the content line (menu start) to that item
  const setIndent = () => {
    const nav = document.querySelector('.hdr__nav'), items = nav.querySelectorAll('a');
    if (window.innerWidth <= 960 || items.length < 2) { document.documentElement.style.removeProperty('--indent'); return; }
    const d = items[1].getBoundingClientRect().left - nav.getBoundingClientRect().left;
    document.documentElement.style.setProperty('--indent', `${Math.round(d)}px`);
  };
  setIndent();
  window.addEventListener('resize', setIndent);
  document.fonts && document.fonts.ready.then(setIndent);

  // FAQ accordion: smooth open/close, only one answer open at a time
  const qas = [...document.querySelectorAll('.qa')];
  const D = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
  const animate = (el, from, to, done) => {
    if (!D) { done && done(); return; }
    const a = el.animate([{ height: `${from}px`, opacity: from ? 1 : 0 }, { height: `${to}px`, opacity: to ? 1 : 0 }], { duration: D, easing: 'cubic-bezier(.65,0,.35,1)' });
    a.onfinish = () => done && done();
  };
  const close = (d) => {
    const body = d.querySelector('.qa__a');
    d.classList.add('is-closing');
    animate(body, body.offsetHeight, 0, () => { d.open = false; d.classList.remove('is-closing'); });
  };
  const open = (d) => {
    d.open = true;
    const body = d.querySelector('.qa__a');
    animate(body, 0, body.offsetHeight);
  };
  qas.forEach((d) => {
    d.querySelector('summary').addEventListener('click', (e) => {
      e.preventDefault();
      if (d.classList.contains('is-closing')) return;
      if (d.open) { close(d); return; }
      qas.forEach((o) => { if (o !== d && o.open) close(o); });
      open(d);
    });
  });

  // Word-by-word reveal for the hero and every heading
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const splitWords = (el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = p; inner.style.setProperty('--i', i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches('.sec__title > span:not(.sec__t), br, svg')) walk(n);
      });
    };
    walk(el);
  };
  const heads = [...document.querySelectorAll('.eyebrow, .hero__title, .hero__lead, .hero__stat strong, .hero__stat p, .hdr__nav a, .sec__title, .lede, .cta__copy h2, .perf__title, .rw__cap, .faq__card-t')];
  // section titles are flex rows (title + number): keep the title words in one flex item
  document.querySelectorAll('.sec__title').forEach((t) => {
    const wrap = document.createElement('span'); wrap.className = 'sec__t';
    [...t.childNodes].forEach((n) => { if (!(n.nodeType === 1 && n.tagName === 'SPAN')) wrap.appendChild(n); });
    t.prepend(wrap);
  });
  if (!reduceMotion) {
    heads.forEach(splitWords);
    // hero: play on load as an orchestrated intro
    const hero = document.querySelector('.hero');
    document.documentElement.classList.add('js-intro');
    // timeline for every text on the first screen (start delay, per-word step)
    const seq = [
      ['.hdr__nav a', 150, 30], ['.eyebrow', 200, 45], ['.hero__title', 300, 60],
      ['.hero__lead', 800, 12], ['.hero__stat strong', 1150, 80], ['.hero__stat p', 1250, 25],
    ];
    seq.forEach(([sel, d, step]) => document.querySelectorAll(sel).forEach((el, k) => {
      el.style.setProperty('--d', `${d + k * (sel === '.hdr__nav a' ? 60 : 120)}ms`);
      el.style.setProperty('--step', `${step}ms`);
    }));
    const play = () => requestAnimationFrame(() => {
      document.documentElement.classList.add('is-loaded');
      seq.forEach(([sel]) => document.querySelectorAll(sel).forEach((h) => h.classList.add('is-in')));
    });
    const bg = hero.querySelector('.hero__bg');
    (bg.complete ? Promise.resolve() : new Promise((r) => { bg.addEventListener('load', r, { once: true }); setTimeout(r, 1200); }))
      .then(() => (document.fonts ? document.fonts.ready : null)).then(play);
    // other headings: on scroll
    const hio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); hio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    heads.filter((h) => !h.closest('.hero, .hdr')).forEach((h) => hio.observe(h));
  }

  // Reveal on scroll
  const targets = document.querySelectorAll('.hang, .rows li, .art, .stat, .card, .mode, .tr, .qa, .faq__card, .mock, .perf__row, .flow__step, .rw__panel');
  targets.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach((el) => io.observe(el));

  // Caption mock: one language at a time, switched from the dropdown
  const lines = {
    en: ["Thank you all for joining. Let's begin with the regional outlook for the next quarter.", "Our priority this year is resilience across every supply route.", "I'll now hand over to our colleagues in Nairobi."],
    fr: ["Merci à tous d'être présents. Commençons par les perspectives régionales du prochain trimestre.", "Notre priorité cette année est la résilience de chaque chaîne d'approvisionnement.", "Je passe maintenant la parole à nos collègues de Nairobi."],
    es: ["Gracias a todos por acompañarnos. Empecemos con las perspectivas regionales del próximo trimestre.", "Nuestra prioridad este año es la resiliencia en cada ruta de suministro.", "Ahora cedo la palabra a nuestros colegas de Nairobi."],
    de: ["Vielen Dank, dass Sie dabei sind. Beginnen wir mit dem regionalen Ausblick für das nächste Quartal.", "Unsere Priorität in diesem Jahr ist die Widerstandsfähigkeit jeder Lieferroute.", "Ich übergebe nun an unsere Kollegen in Nairobi."],
    ar: ["شكرًا لكم جميعًا على الحضور. لنبدأ بالتوقعات الإقليمية للربع القادم.", "أولويتنا هذا العام هي المرونة في جميع طرق الإمداد.", "أعطي الكلمة الآن لزملائنا في نيروبي."],
    ja: ["ご参加いただきありがとうございます。まず次の四半期の地域見通しから始めます。", "今年の優先課題は、すべての供給ルートの強靭性です。", "それでは、ナイロビの同僚にバトンを渡します。"],
  };
  const sel = document.getElementById('lang');
  const cap = document.getElementById('cap');
  let i = 0;
  const show = () => {
    cap.classList.add('is-fading');
    setTimeout(() => {
      const v = sel.dataset.value, set = lines[v];
      cap.textContent = set[i % set.length];
      cap.dir = v === 'ar' ? 'rtl' : 'ltr';
      cap.classList.remove('is-fading');
    }, 250);
  };

  // macOS-style popup menu (a native <select> renders differently in every browser and OS)
  const btn = sel.querySelector('.msel__btn'), menu = sel.querySelector('.msel__menu');
  const opts = [...menu.querySelectorAll('[role="option"]')];
  let hi = 0;
  const highlight = (n) => { hi = (n + opts.length) % opts.length; opts.forEach((o, k) => o.classList.toggle('is-hi', k === hi)); };
  const openMenu = () => {
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); sel.classList.add('is-open');
    highlight(opts.findIndex((o) => o.dataset.value === sel.dataset.value)); menu.focus();
  };
  const closeMenu = (refocus) => {
    menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); sel.classList.remove('is-open');
    if (refocus) btn.focus();
  };
  const pick = (o) => {
    opts.forEach((x) => x.setAttribute('aria-selected', String(x === o)));
    sel.dataset.value = o.dataset.value;
    sel.querySelector('.msel__val').textContent = o.textContent;
    btn.setAttribute('aria-label', 'Listening language: ' + o.textContent);
    closeMenu(true); show();
  };
  btn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu(); } });
  opts.forEach((o, k) => {
    o.addEventListener('mouseenter', () => highlight(k));
    o.addEventListener('click', () => pick(o));
  });
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') highlight(hi + 1);
    else if (e.key === 'ArrowUp') highlight(hi - 1);
    else if (e.key === 'Home') highlight(0);
    else if (e.key === 'End') highlight(opts.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') pick(opts[hi]);
    else if (e.key === 'Escape' || e.key === 'Tab') { closeMenu(e.key === 'Escape'); return; }
    else return;
    e.preventDefault();
  });
  document.addEventListener('click', (e) => { if (!sel.contains(e.target) && !menu.hidden) closeMenu(); });
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => { i += 1; show(); }, 3800);
  }

  // Contact form (front-end only until a backend/email endpoint is connected)
  const form = document.getElementById('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    document.getElementById('formOk').hidden = false;
    form.reset();
  });
})();

// Hero sound wave: a bundle of thin glowing strands drawn over the clean photo and animated.
// The path is set in image pixels (2000×1185) so it stays attached to the booth at any crop.
(() => {
  const img = document.querySelector('.hero__bg');
  const cvs = document.querySelector('.hero__wave');
  if (!img || !cvs) return;
  const ctx = cvs.getContext('2d');
  const vid = document.querySelector('.hero__video'); // optional video preview layer
  const onVideo = () => vid && vid.videoWidth > 0 && getComputedStyle(vid).display !== 'none';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Centreline of the wave in image px: enters from the sky on the left, swells through the booth, exits right
  const PATH = [[150, 880], [500, 850], [850, 770], [1130, 650], [1380, 575], [1620, 545], [1840, 525], [2000, 470]]; // from the left sky, through the booth, out to the right
  // Booth glass (image px): the wave is dimmed inside it so it reads as passing through the glass;
  // the interpreter is cut out almost completely so she stays clean
  const BOOTH = { x: 1135, y: 265, w: 865, h: 790 };
  const PERSON = { x: 1640, y: 610, w: 190, h: 380 };
  const STRANDS = 60;
  let map = { s: 1, ox: 0, oy: 0 }, W = 0, H = 0, dpr = 1;

  const centre = (x) => { // linear interpolation along PATH, smoothed by a cosine ease
    for (let i = 1; i < PATH.length; i++) {
      const [x0, y0] = PATH[i - 1], [x1, y1] = PATH[i];
      if (x <= x1) { const t = (x - x0) / (x1 - x0), e = (1 - Math.cos(Math.PI * t)) / 2; return y0 + (y1 - y0) * e; }
    }
    return PATH[PATH.length - 1][1];
  };

  const place = () => {
    // layout boxes (not getBoundingClientRect): the intro zoom transform must not skew the mapping
    const b = { left: img.offsetLeft - cvs.offsetLeft, top: img.offsetTop - cvs.offsetTop, width: img.offsetWidth, height: img.offsetHeight };
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    // image box may be larger than the hero (desktop zoom); account for its offset and object-fit: cover
    const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((v) => (v === 'right' || v === 'bottom' ? 1 : v === 'left' || v === 'top' ? 0 : parseFloat(v) / 100));
    const s = Math.max(b.width / img.naturalWidth, b.height / img.naturalHeight);
    map = { s, ox: b.left + (b.width - img.naturalWidth * s) * px, oy: b.top + (b.height - img.naturalHeight * s) * py };
    if (onVideo()) { // video layer under the wave: same box, its own frame size; the clip keeps the photo's full width (16:9 crop)
      const vw = vid.videoWidth, vh = vid.videoHeight, k = vw / img.naturalWidth, dy = (img.naturalHeight * k - vh) / 2;
      const sv = Math.max(b.width / vw, b.height / vh);
      map = { s: sv * k, ox: b.left + (b.width - vw * sv) * px, oy: b.top + (b.height - vh * sv) * py - dy * sv };
    }
  };

  const draw = (t) => {
    const ph = t / 1000;
    const { s, ox, oy } = map;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    const x0 = PATH[0][0], x1 = PATH[PATH.length - 1][0];
    const grad = ctx.createLinearGradient(ox + x0 * s, 0, ox + x1 * s, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.15, 'rgba(255,255,255,.7)');
    grad.addColorStop(0.5, 'rgba(240,228,255,.75)');
    grad.addColorStop(0.85, 'rgba(219,98,178,.85)');
    grad.addColorStop(1, 'rgba(219,98,178,.6)');
    ctx.strokeStyle = grad;
    ctx.lineJoin = 'round';
    // Every strand goes into ONE path, stroked twice (soft halo + crisp line).
    // No shadowBlur and one stroke call per pass keeps the animation at a steady frame rate.
    ctx.beginPath();
    for (let k = 0; k < STRANDS; k++) {
      const u = k / (STRANDS - 1) - 0.5; // -0.5 … 0.5 across the bundle
      let px = 0, py = 0;
      for (let x = x0; x <= x1; x += 12) {
        const p = (x - x0) / (x1 - x0);
        const spread = 90 + 190 * Math.sin(Math.PI * Math.min(1, p * 1.05)) ** 2; // wide ribbon, fullest mid-way
        const twist = Math.sin(x / 260 - ph * 0.55 + u * 2.2);                     // strands cross over each other
        const swell = 42 * Math.sin(x / 290 - ph * 0.85) + 12 * Math.sin(x / 130 - ph * 1.3 + u * 3); // travelling wave
        const y = centre(x) + u * spread * (0.6 + 0.4 * twist) + swell * (0.4 + 0.6 * p);
        const sx = ox + x * s, sy = oy + y * s;
        if (x === x0) ctx.moveTo(sx, sy);
        else ctx.quadraticCurveTo(px, py, (px + sx) / 2, (py + sy) / 2); // smooth curve through the samples
        px = sx; py = sy;
      }
      ctx.lineTo(px, py);
    }
    ctx.globalAlpha = 0.18; ctx.lineWidth = Math.max(2, s * 3); ctx.stroke();      // halo
    ctx.globalAlpha = 1;    ctx.lineWidth = Math.max(0.7, s * 0.9); ctx.stroke();  // strands
    // pass "through" the booth: fade the strands behind the glass, and almost fully behind the interpreter
    ctx.globalCompositeOperation = 'destination-out';
    const soft = (r, a, f) => {
      for (let i = 0; i < 5; i++) {
        const pad = f * (1 - i / 5);
        ctx.fillStyle = `rgba(0,0,0,${a / 5})`;
        ctx.fillRect(ox + (r.x - pad) * s, oy + (r.y - pad) * s, (r.w + pad * 2) * s, (r.h + pad * 2) * s);
      }
    };
    // booth glass itself is a separate image layered above the wave (img/rsi-hero-booth.webp)
    if (vid) soft(BOOTH, 0.35, 40); // no booth overlay over a video: dim the strands behind the glass instead
    soft(PERSON, 0.95, 30);
    if (vid) rings(ph, soft);
    ctx.globalCompositeOperation = 'source-over';
  };

  // Broadcast: wide perspective rings leave the booth one after another, without a gap, and fade towards the horizon
  const HUB = [1560, 640], RINGS = 9;
  const rings = (ph, soft) => {
    const { s: k, ox, oy } = map;
    const cx = ox + HUB[0] * k, cy = oy + HUB[1] * k;
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < RINGS; i++) {
      const p = (ph * 0.16 + i / RINGS) % 1;            // 0 at the booth → 1 at the horizon
      const rx = (120 + p * 1700) * k, ry = rx * (0.22 + 0.06 * Math.sin(ph * 0.7 + i));
      const a = Math.min(1, p * 8) * (1 - p) ** 1.6;      // soft birth, long fade
      ctx.strokeStyle = i % 3 === 1 ? `rgba(255,255,255,${0.55 * a})` : `rgba(219,98,178,${0.6 * a})`;
      ctx.lineWidth = Math.max(0.8, k * (2.2 - p * 1.4));
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, -0.08, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'destination-out';
    soft(PERSON, 0.9, 20);                                 // keep her clear of the rings too
    ctx.globalCompositeOperation = 'source-over';
  };

  let running = false, raf = 0;
  const loop = (t) => { draw(t); if (running) raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  const init = () => {
    place(); draw(0);
    if (vid) vid.addEventListener('loadedmetadata', () => { place(); draw(performance.now()); });
    let lastW = cvs.clientWidth, lastH = cvs.clientHeight;
    window.addEventListener('resize', () => { // ignore no-op resizes (e.g. mobile URL bar) that would reset the canvas
        const w = cvs.clientWidth, h = cvs.clientHeight;
      if (Math.abs(w - lastW) < 1 && Math.abs(h - lastH) < 1) return;
      lastW = w; lastH = h; place(); draw(performance.now());
    });
    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(cvs);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  };
  img.complete && img.naturalWidth ? init() : img.addEventListener('load', init, { once: true });
})();

// Band (global event render): signals run along arcs between participants and the hub; the hub's light ring breathes.
// Coordinates are in image pixels (1774×887); the canvas maps them through object-fit: cover, centred.
(() => {
  const img = document.querySelector('.band img');
  const cvs = document.querySelector('.band__fx');
  if (!img || !cvs) return;
  const ctx = cvs.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IW = 1774, IH = 887;
  const HUB_L = [425, 300], HUB_R = [1360, 300];
  const CARDS = [
    [95, 312], [232, 294], [335, 365], [198, 390], [259, 475], [105, 533], [371, 505],
    [1568, 320], [1688, 338], [1454, 408], [1462, 506], [1589, 510],
  ];
  // each route: card → nearest hub side, arched upward; every 3rd runs outward (translated output)
  const routes = CARDS.map(([x, y], i) => {
    const [hx, hy] = x < IW / 2 ? HUB_L : HUB_R;
    const out = i % 3 === 2;
    const a = out ? [hx, hy] : [x, y], b = out ? [x, y] : [hx, hy];
    return { a, b, c: [(x + hx) / 2, Math.min(y, hy) - 110 - (i % 4) * 25], out, dur: 2600 + (i * 370) % 1700, off: (i * 811) % 3000 };
  });
  const RING = { x: 887, y: 246, rx: 210, ry: 18 }, REFL = { x: 887, y: 689, rx: 130, ry: 24 };

  let W = 0, H = 0, dpr = 1, s = 1, ox = 0, oy = 0;
  const place = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    s = Math.max(W / IW, H / IH); ox = (W - IW * s) / 2; oy = (H - IH * s) / 2;
  };
  const P = (x, y) => [ox + x * s, oy + y * s];
  const bez = (r, t) => {
    const u = 1 - t;
    return [u * u * r.a[0] + 2 * u * t * r.c[0] + t * t * r.b[0], u * u * r.a[1] + 2 * u * t * r.c[1] + t * t * r.b[1]];
  };
  const glowEllipse = (e, alpha) => {
    const [cx, cy] = P(e.x, e.y);
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(1, e.ry / e.rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, e.rx * s * 1.25);
    g.addColorStop(0, `rgba(255,236,220,${alpha})`);
    g.addColorStop(0.6, `rgba(255,214,235,${alpha * 0.55})`);
    g.addColorStop(1, 'rgba(255,214,235,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, e.rx * s * 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  const draw = (t) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    // 3 · breathing light ring in the hub ceiling and its reflection on the bridge
    const breath = 0.5 + 0.5 * Math.sin(t / 900);
    glowEllipse(RING, 0.12 + 0.28 * breath);
    glowEllipse(REFL, 0.06 + 0.16 * breath);
    // 1 · signals: a bright head with a fading tail along each arc
    routes.forEach((r) => {
      const lin = ((t + r.off) % r.dur) / r.dur, p = lin < .5 ? 4 * lin ** 3 : 1 - (-2 * lin + 2) ** 3 / 2; // ease-in-out along the arc
      const fade = Math.min(1, p * 6, (1 - p) * 6);
      for (let k = 0; k < 9; k++) {
        const tt = p - k * 0.018;
        if (tt < 0) break;
        const [x, y] = P(...bez(r, tt));
        const a = fade * (1 - k / 9) * (k ? 0.45 : 1);
        ctx.fillStyle = r.out ? `rgba(219,98,178,${a})` : `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(x, y, Math.max(1.5, s * (k ? 2.6 : 4.2)), 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalCompositeOperation = 'source-over';
  };

  let running = false, raf = 0;
  const loop = (t) => { draw(t); if (running) raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const init = () => {
    place(); draw(1200);
    onBoxResize(cvs, () => { place(); draw(performance.now()); });
    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(cvs);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  };
  img.complete && img.naturalWidth ? init() : img.addEventListener('load', init, { once: true });
})();

// Final CTA render: one speaker's caption lines light up, the signal crosses the glass column,
// then the other screen fills in — alternating direction each cycle. Image px: 1942×809.
(() => {
  const img = document.querySelector('.cta__bg');
  const cvs = document.querySelector('.cta__fx');
  if (!img || !cvs) return;
  const ctx = cvs.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IW = 1942, IH = 809;
  const ROWS = [339, 351, 365, 378, 392];
  const SCREENS = [{ x0: 1117, x1: 1218, box: [1099, 317, 142, 95] }, { x0: 1484, x1: 1582, box: [1460, 317, 140, 95] }];
  const LINK = { y: 385, x0: 1240, x1: 1460 };
  const T_FILL = 2200, T_CROSS = 900, T_HOLD = 700, CYCLE = (T_FILL + T_CROSS) * 2 + T_HOLD;
  let W = 0, H = 0, dpr = 1, s = 1, ox = 0, oy = 0;
  const place = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((v) => (v === 'right' || v === 'bottom' ? 1 : v === 'left' || v === 'top' ? 0 : parseFloat(v) / 100));
    s = Math.max(W / IW, H / IH); ox = (W - IW * s) * px; oy = (H - IH * s) * py;
  };
  const X = (x) => ox + x * s, Y = (y) => oy + y * s;
  const easeIO = (u) => (u < .5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2);
  const fillLines = (scr, p) => { // p: 0…1 progress of "typing" across the 5 lines
    ROWS.forEach((y, i) => {
      const lp = Math.min(1, Math.max(0, p * ROWS.length - i));
      if (!lp) return;
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = 6 * s;
      ctx.fillRect(X(scr.x0), Y(y - 2.2), (scr.x1 - scr.x0) * lp * s, 4.4 * s);
    });
    ctx.shadowBlur = 0;
  };
  const glowBox = (scr, a) => {
    const [x, y, w, h] = scr.box;
    ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = Math.max(1, 1.5 * s);
    ctx.strokeRect(X(x), Y(y), w * s, h * s);
  };
  const pulse = (p, dir) => {
    const x = dir > 0 ? LINK.x0 + (LINK.x1 - LINK.x0) * p : LINK.x1 - (LINK.x1 - LINK.x0) * p;
    const g = ctx.createRadialGradient(X(x), Y(LINK.y), 0, X(x), Y(LINK.y), 34 * s);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.35, 'rgba(219,98,178,.5)'); g.addColorStop(1, 'rgba(219,98,178,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X(x), Y(LINK.y), 34 * s, 0, Math.PI * 2); ctx.fill();
  };
  const draw = (t) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const c = t % CYCLE;
    // two legs per cycle: left→right, then right→left
    const leg = c < T_FILL + T_CROSS ? 0 : 1;
    const lc = leg ? c - (T_FILL + T_CROSS) : c;
    const from = SCREENS[leg], to = SCREENS[1 - leg];
    if (lc < T_FILL) { glowBox(from, .5); fillLines(from, easeIO(lc / T_FILL)); }
    else if (lc < T_FILL + T_CROSS) {
      const p = easeIO((lc - T_FILL) / T_CROSS);
      fillLines(from, 1 - p); pulse(p, leg ? -1 : 1); fillLines(to, p * 0.25); glowBox(to, .5 * p);
    } else { glowBox(to, .5); fillLines(to, 1); }
    ctx.globalCompositeOperation = 'source-over';
  };
  let running = false, raf = 0;
  const loop = (t) => { draw(t); if (running) raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const init = () => {
    place();
    onBoxResize(cvs, () => { place(); if (!running) draw(performance.now()); });
    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(cvs);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  };
  img.complete && img.naturalWidth ? init() : img.addEventListener('load', init, { once: true });
})();

// Images can't be dragged out of the page
document.querySelectorAll('img').forEach((im) => { im.draggable = false; });
document.addEventListener('dragstart', (e) => { if (e.target.closest && e.target.closest('img, picture, canvas')) e.preventDefault(); });

// Voice & captions render: a light pulse runs along the beam through the three glass panels,
// each ghost of the sphere lights up as it passes, the sphere itself breathes. Image px: 1200×1200.
(() => {
  const fig = document.querySelector('#captions .art--photo');
  const cvs = fig && fig.querySelector('.art__fx');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IW = 1200, BEAM_Y = 557, X0 = 380, X1 = 1200;
  const SPHERE = { x: 287, y: 558, r: 93 };
  const GHOSTS = [{ x: 448, r: 72 }, { x: 538, r: 60 }, { x: 612, r: 80 }, { x: 786, r: 74 }];
  const PERIOD = 2600, PULSES = 2; // two pulses always on the beam: the flow never stops
  let W = 0, H = 0, dpr = 1, s = 1, ox = 0, oy = 0;
  const place = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    s = Math.max(W / IW, H / IW); ox = (W - IW * s) / 2; oy = (H - IW * s) / 2;
  };
  const glow = (x, y, r, a, c) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  };
  const draw = (t) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const X = (x) => ox + x * s, Y = (y) => oy + y * s;
    // sphere breathes
    const br = 0.5 + 0.5 * Math.sin(t / 1100);
    glow(X(SPHERE.x), Y(SPHERE.y), SPHERE.r * s * (1.4 + 0.18 * br), 0.18 + 0.22 * br, '255,150,120');
    // pulses along the beam
    const heads = [];
    for (let k = 0; k < PULSES; k++) {
      const p = ((t / PERIOD) + k / PULSES) % 1;
      const x = X0 + (X1 - X0) * p, fade = Math.min(1, p * 10, (1 - p) * 4);
      heads.push(x);
      const g = ctx.createLinearGradient(X(x - 160), 0, X(x + 14), 0);
      g.addColorStop(0, 'rgba(255,190,170,0)'); g.addColorStop(1, `rgba(255,236,226,${0.85 * fade})`);
      ctx.fillStyle = g; ctx.fillRect(X(x - 160), Y(BEAM_Y) - 2 * s - 0.6, 174 * s, 4 * s + 1.2);
      glow(X(x), Y(BEAM_Y), 46 * s, 0.9 * fade, '255,225,210');
    }
    // ghosts in the panels light up as a pulse passes
    GHOSTS.forEach((gh) => {
      const a = heads.reduce((m, x) => Math.max(m, Math.exp(-(((x - gh.x) / 70) ** 2))), 0);
      if (a > 0.02) glow(X(gh.x), Y(BEAM_Y), gh.r * s * 1.35, 0.6 * a, '255,160,190');
    });
    ctx.globalCompositeOperation = 'source-over';
  };
  let running = false, raf = 0;
  const loop = (t) => { draw(t); if (running) raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  place();
  onBoxResize(cvs, () => { place(); draw(performance.now()); });
  new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(cvs);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();

// Ultra-light panel: a live audio track at 160 Kbps — a fine mirrored waveform streaming left,
// played part in navy, upcoming part in lavender, a pink playhead between them
(() => {
  const cvs = document.querySelector('.rw__wave');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEP = 4, BAR = 2, SPEED = 26; // px between bars, bar width, px per second
  let W = 0, H = 0, dpr = 1;
  const place = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
  };
  // speech-like amplitude for sample n: syllables inside words, short pauses between words
  const amp = (n) => {
    const word = 0.5 + 0.5 * Math.sin(n * 0.045) * Math.sin(n * 0.017 + 1.3);
    const syll = 0.55 + 0.45 * Math.abs(Math.sin(n * 0.21 + Math.sin(n * 0.05) * 2));
    const grain = 0.82 + 0.18 * Math.sin(n * 1.7) * Math.sin(n * 0.63);
    return Math.max(0.06, Math.min(1, (0.15 + 0.85 * word ** 1.4) * syll * grain));
  };
  const rr = (x, y, w, h) => { const r = w / 2; ctx.beginPath(); ctx.moveTo(x, y + r); ctx.arc(x + r, y + r, r, Math.PI, 0); ctx.lineTo(x + w, y + h - r); ctx.arc(x + r, y + h - r, r, 0, Math.PI); ctx.closePath(); ctx.fill(); };
  const draw = (t) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const off = (t / 1000) * SPEED, head = W * 0.62, mid = H / 2;
    const first = Math.floor(off / STEP);
    for (let k = 0; k * STEP < W + STEP; k++) {
      const n = first + k, x = n * STEP - off;
      const h = Math.max(BAR, amp(n) * (H - 4));
      ctx.fillStyle = x < head ? '#0d1430' : '#c9cdea';
      rr(x, mid - h / 2, BAR, h);
    }
    // playhead
    ctx.fillStyle = '#db62b2';
    ctx.fillRect(head - 0.75, 0, 1.5, H);
    ctx.beginPath(); ctx.arc(head, 3, 3, 0, Math.PI * 2); ctx.fill();
  };
  let running = false, raf = 0;
  const loop = (t) => { draw(t); if (running) raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  place(); draw(0);
  onBoxResize(cvs, () => { place(); draw(performance.now()); });
  new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(cvs);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();

// Hero video (desktop only): a clip without matching start/end frames loops seamlessly by cross-fading
// two players; the hero switches to it only once it really plays, otherwise the photo + wave remain
(() => {
  const box = document.querySelector('.hero__clip');
  if (!box || getComputedStyle(box).display === 'none') return;
  const hero = box.closest('.hero');
  const [a, b] = box.querySelectorAll('video');
  const FROM = +box.dataset.from || 0, FADE = box.dataset.fade === undefined ? 1.2 : +box.dataset.fade, RATE = +box.dataset.rate || 1;
  box.style.setProperty('--fade', FADE + 's');
  // a bare path gets the best format this browser plays; the file itself is already a seamless loop
  const src = /\.(mp4|webm)(\?|$)/.test(box.dataset.src) ? box.dataset.src : box.dataset.src + (a.canPlayType('video/webm; codecs="vp9"') ? '.webm' : '.mp4');
  if (!FADE) { // seamless file: one native looping player is enough
    a.muted = true; a.loop = true; a.src = src; a.classList.add('is-on'); b.remove();
    a.addEventListener('playing', () => hero.classList.add('has-video'), { once: true });
    a.play().catch(() => {});
    return;
  }
  [a, b].forEach((v) => { v.muted = true; v.src = src; v.defaultPlaybackRate = RATE; });
  let cur = a, next = b, busy = false;
  const startAt = (v) => { try { v.currentTime = FROM; } catch (e) { /* not seekable yet */ } v.playbackRate = RATE; return v.play().catch(() => {}); };
  a.addEventListener('loadedmetadata', () => { startAt(a); a.classList.add('is-on'); }, { once: true });
  a.addEventListener('playing', () => hero.classList.add('has-video'), { once: true });
  const tick = () => {
    if (!busy && cur.duration && cur.currentTime >= cur.duration - FADE * RATE - 0.05) {
      busy = true;
      startAt(next);
      next.classList.add('is-fading'); box.appendChild(next); // the incoming clip sits on top and fades in
      requestAnimationFrame(() => next.classList.add('is-on'));
      setTimeout(() => {
        cur.classList.remove('is-on', 'is-fading'); cur.pause();
        [cur, next] = [next, cur]; busy = false;
      }, FADE * 1000 + 60);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
