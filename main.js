(() => {
  const hdr = document.getElementById('hdr');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Шапка становится «стеклянной» после первого экрана
  const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Плавное появление блоков
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Если фото не загрузилось — оставляем тёмную подложку, без иконки «битой» картинки
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => { img.style.visibility = 'hidden'; }, { once: true });
  });

  if (reduce) return;

  // Лёгкий параллакс фона и рукописных слов
  const items = [...document.querySelectorAll('[data-parallax]')];
  const words = [...document.querySelectorAll('.el__word')];
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    items.forEach((el) => {
      const k = parseFloat(el.dataset.parallax);
      const base = el.classList.contains('hero__script') ? ' rotate(-4deg)' : '';
      el.style.transform = `translate3d(0, ${y * k}px, 0)${base}`;
    });
    const vh = window.innerHeight;
    const wide = window.innerWidth > 1000;
    words.forEach((w) => {
      const r = w.getBoundingClientRect();
      const p = Math.max(-.6, Math.min(.6, (r.top + r.height / 2 - vh / 2) / vh)); // смещение от центра экрана
      w.style.transform = `translate3d(${wide ? p * -40 : 0}px, ${p * 30}px, 0) rotate(-4deg)`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();
