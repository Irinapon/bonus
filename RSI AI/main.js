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

  // Keep the header menu 20px left of the roof in the hero render.
  // Must match .hero__bg in styles.css: height 132%, object-position 56% top.
  // Roof's leftmost point sits at x=864 in the 1942×809 image.
  const hero = document.querySelector('.hero');
  const IMG_W = 1942, IMG_H = 809, ROOF_X = 864, POS_X = 0.56, BOX_H = 1.32, GAP = 20;
  const placeNav = () => {
    if (window.innerWidth <= 960) { hdr.style.removeProperty('--nav-right'); return; }
    const boxW = hero.clientWidth, boxH = hero.clientHeight * BOX_H;
    const scale = Math.max(boxW / IMG_W, boxH / IMG_H);
    const roof = ROOF_X * scale - (IMG_W * scale - boxW) * POS_X;
    // On narrower screens the roof comes too close to "Contact us": keep the menu clear of it instead
    const contactRight = document.querySelector('.hdr__contact').getBoundingClientRect().right;
    const navW = document.querySelector('.hdr__nav').offsetWidth;
    const navRightEdge = Math.max(roof - GAP, contactRight + 12 + navW);
    hdr.style.setProperty('--nav-right', `${Math.round(boxW - navRightEdge)}px`);
  };
  placeNav();
  window.addEventListener('resize', placeNav);

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

// TEMP guides: vertical lines at the menu's right edge and the contact link's left edge (press G to toggle)
(() => {
  const mk = () => { const d = document.createElement('div'); d.className = 'guide'; document.body.appendChild(d); return d; };
  const gMenu = mk(), gContact = mk();
  const place = () => {
    const nav = document.querySelector('.hdr__nav'), contact = document.querySelector('.hdr__contact');
    const navR = nav.getBoundingClientRect();
    gMenu.style.display = navR.width ? '' : 'none';
    gMenu.style.left = `${navR.right}px`;
    gContact.style.left = `${contact.getBoundingClientRect().left}px`;
  };
  window.addEventListener('load', place);
  window.addEventListener('resize', () => requestAnimationFrame(place));
  document.fonts && document.fonts.ready.then(place);
  place();
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'g' && !/input|textarea|select/i.test(e.target.tagName)) document.body.classList.toggle('no-guides');
  });
})();
