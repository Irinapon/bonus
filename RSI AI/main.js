(() => {
  // Headline option A: open the page with ?h=a
  if (new URLSearchParams(location.search).get('h') === 'a') {
    document.querySelector('[data-headline]').innerHTML =
      'Speed and accuracy, <em>without the guesswork</em>';
  }

  // RSI Exchange cross-link — set the real URL here once the domain is confirmed
  const RSI_EXCHANGE_URL = '#';
  document.querySelectorAll('[data-rsi-exchange]').forEach((a) => { a.href = RSI_EXCHANGE_URL; });

  // Header background after scroll
  const hdr = document.getElementById('hdr');
  const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

  // Reveal on scroll
  const targets = document.querySelectorAll('.sec__title, .lede, .hang, .rows li, .art, .stat, .card, .mode, .tr, .faq, .mock');
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
      const set = lines[sel.value];
      cap.textContent = set[i % set.length];
      cap.dir = sel.value === 'ar' ? 'rtl' : 'ltr';
      cap.classList.remove('is-fading');
    }, 250);
  };
  sel.addEventListener('change', show);
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
    const r = cvs.getBoundingClientRect(), b = img.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = r.width; H = r.height;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    // image box may be larger than the hero (desktop zoom); account for its offset and object-fit: cover
    const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((v) => (v === 'right' || v === 'bottom' ? 1 : v === 'left' || v === 'top' ? 0 : parseFloat(v) / 100));
    const s = Math.max(b.width / img.naturalWidth, b.height / img.naturalHeight);
    map = { s, ox: b.left - r.left + (b.width - img.naturalWidth * s) * px, oy: b.top - r.top + (b.height - img.naturalHeight * s) * py };
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
    grad.addColorStop(0.85, 'rgba(255,160,215,.85)');
    grad.addColorStop(1, 'rgba(240,140,205,.6)');
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
    soft(PERSON, 0.95, 30);
    ctx.globalCompositeOperation = 'source-over';
  };

  let running = false, raf = 0;
  const loop = (t) => { draw(t); if (running) raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  const init = () => {
    place(); draw(0);
    let lastW = 0, lastH = 0;
    window.addEventListener('resize', () => { // ignore no-op resizes (e.g. mobile URL bar) that would reset the canvas
      const r = cvs.getBoundingClientRect();
      if (Math.abs(r.width - lastW) < 1 && Math.abs(r.height - lastH) < 1) return;
      lastW = r.width; lastH = r.height; place(); draw(performance.now());
    });
    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(cvs);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  };
  img.complete && img.naturalWidth ? init() : img.addEventListener('load', init, { once: true });
})();

// TEMP guides: content line (menu start) and 2nd menu item (press G to toggle)
(() => {
  const mk = () => { const d = document.createElement('div'); d.className = 'guide'; document.body.appendChild(d); return d; };
  const gMenu = mk(), gItem2 = mk();
  const place = () => {
    const nav = document.querySelector('.hdr__nav');
    const navR = nav.getBoundingClientRect();
    gMenu.style.display = navR.width ? '' : 'none';
    gMenu.style.left = `${navR.left}px`;
    // second guide: left edge of the 2nd menu item ("Why RSI X AI")
    const item2 = nav.querySelectorAll('a')[1];
    const r2 = item2 && item2.getBoundingClientRect();
    gItem2.style.display = r2 && r2.width ? '' : 'none';
    if (r2) gItem2.style.left = `${r2.left}px`;
  };
  window.addEventListener('load', place);
  window.addEventListener('resize', () => requestAnimationFrame(place));
  document.fonts && document.fonts.ready.then(place);
  place();
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'g' && !/input|textarea|select/i.test(e.target.tagName)) document.body.classList.toggle('no-guides');
  });
})();
