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
// The path is set in image pixels (1840×854) so it stays attached to the booth at any crop.
(() => {
  const img = document.querySelector('.hero__bg');
  const cvs = document.querySelector('.hero__wave');
  if (!img || !cvs) return;
  const ctx = cvs.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Centreline of the wave in image px: enters from the sky on the left, swells through the booth, exits right
  const PATH = [[120, 640], [420, 620], [720, 560], [980, 470], [1180, 420], [1420, 450], [1640, 430], [1840, 360]]; // from the left sky, through the booth, out to the right
  // Booth glass (image px): the wave is dimmed inside it so it reads as passing through the glass;
  // the interpreter is cut out almost completely so she stays clean
  const BOOTH = { x: 1215, y: 195, w: 625, h: 565 };
  const PERSON = { x: 1585, y: 440, w: 140, h: 290 };
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
    const r = cvs.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    map = { s, ox: (W - img.naturalWidth * s) * px, oy: (H - img.naturalHeight * s) * py };
  };

  const draw = (t) => {
    const ph = t / 1000;
    const { s, ox, oy } = map;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = 4 * s; // soft glow like the original strands
    ctx.lineWidth = Math.max(0.7, s * 1);
    const x0 = PATH[0][0], x1 = PATH[PATH.length - 1][0];
    const grad = ctx.createLinearGradient(ox + x0 * s, 0, ox + x1 * s, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.15, 'rgba(255,255,255,.7)');
    grad.addColorStop(0.5, 'rgba(240,228,255,.75)');
    grad.addColorStop(0.85, 'rgba(255,160,215,.85)');
    grad.addColorStop(1, 'rgba(240,140,205,.6)');
    ctx.strokeStyle = grad;
    for (let k = 0; k < STRANDS; k++) {
      const u = k / (STRANDS - 1) - 0.5; // -0.5 … 0.5 across the bundle
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 6) {
        const p = (x - x0) / (x1 - x0);
        const spread = 70 + 150 * Math.sin(Math.PI * Math.min(1, p * 1.05)) ** 2; // a wide ribbon, fullest mid-way      // bundle opens in the middle
        const twist = Math.sin(x / 260 - ph * 0.9 + u * 2.2);                       // strands cross over each other
        const swell = 34 * Math.sin(x / 240 - ph * 1.4) + 12 * Math.sin(x / 110 - ph * 2.1 + u * 3); // travelling wave
        const y = centre(x) + u * spread * (0.6 + 0.4 * twist) + swell * (0.4 + 0.6 * p);
        const sx = ox + x * s, sy = oy + y * s;
        x === x0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // pass "through" the booth: fade the strands behind the glass, and almost fully behind the interpreter
    ctx.globalCompositeOperation = 'destination-out';
    const soft = (r, a, f) => {
      for (let i = 0; i < 5; i++) {
        const pad = f * (1 - i / 5);
        ctx.fillStyle = `rgba(0,0,0,${a / 5})`;
        ctx.fillRect(ox + (r.x - pad) * s, oy + (r.y - pad) * s, (r.w + pad * 2) * s, (r.h + pad * 2) * s);
      }
    };
    soft(BOOTH, 0.35, 30);
    soft(PERSON, 0.95, 30);
    ctx.globalCompositeOperation = 'source-over';
  };

  let running = false, raf = 0;
  const loop = (t) => { draw(t); if (running) raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  const init = () => {
    place(); draw(0);
    window.addEventListener('resize', () => { place(); draw(performance.now()); });
    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(cvs);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  };
  img.complete && img.naturalWidth ? init() : img.addEventListener('load', init, { once: true });
})();

// TEMP guide: vertical line on the content line (menu start) (press G to toggle)
(() => {
  const mk = () => { const d = document.createElement('div'); d.className = 'guide'; document.body.appendChild(d); return d; };
  const gMenu = mk();
  const place = () => {
    const nav = document.querySelector('.hdr__nav');
    const navR = nav.getBoundingClientRect();
    gMenu.style.display = navR.width ? '' : 'none';
    gMenu.style.left = `${navR.left}px`;
  };
  window.addEventListener('load', place);
  window.addEventListener('resize', () => requestAnimationFrame(place));
  document.fonts && document.fonts.ready.then(place);
  place();
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'g' && !/input|textarea|select/i.test(e.target.tagName)) document.body.classList.toggle('no-guides');
  });
})();
