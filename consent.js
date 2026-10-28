// Cookie consent: a small card after the preloader. Essential cookies are always on; functional ones only
// with consent. The choice lives in localStorage under "rsix-consent" ({ v: 'all' | 'essential', t: ISO date })
// and is exposed as window.rsixConsent (+ a "rsix:consent" event) for any script that needs it later.
(() => {
  const KEY = 'rsix-consent';
  const POLICY = new URL('cookies.html', (document.currentScript && document.currentScript.src) || location.href).href; // works from /jp/ too
  const ja = document.documentElement.lang === 'ja';
  const T = ja ? {
    title: 'Cookieについて',
    text: '本サイトでは、サイトの動作に必要なCookieを使用しています。同意いただいた場合は、設定を記憶するための機能Cookieも使用します。',
    policy: 'Cookieポリシー（英語）', all: 'すべて許可', essential: '必須のみ', label: 'Cookieの設定',
  } : {
    title: 'Cookies',
    text: 'We use essential cookies to make this site work. With your consent, we\'d also use functional cookies to remember your preferences.',
    policy: 'Cookie Policy', all: 'Accept all', essential: 'Essential only', label: 'Cookie consent',
  };
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  const save = (v) => {
    const rec = { v, t: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) { /* private mode: ask again next time */ }
    window.rsixConsent = v;
    document.dispatchEvent(new CustomEvent('rsix:consent', { detail: v }));
  };
  const saved = read();
  window.rsixConsent = saved ? saved.v : null;

  let box;
  const build = () => {
    box = document.createElement('div');
    box.className = 'cc'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', T.label); box.setAttribute('aria-live', 'polite');
    box.innerHTML = `<p class="cc__t">${T.title}</p>
      <p class="cc__p">${T.text} <a href="${POLICY}">${T.policy}</a></p>
      <div class="cc__btns"><button type="button" class="cc__b cc__b--main" data-v="all">${T.all}</button><button type="button" class="cc__b" data-v="essential">${T.essential}</button></div>`;
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      save(b.dataset.v); hide();
    });
    document.body.appendChild(box);
  };
  const show = () => { if (!box) build(); requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('is-on'))); };
  const hide = () => { if (box) box.classList.remove('is-on'); };

  // "Cookie settings" in the footer reopens the card
  document.addEventListener('click', (e) => { if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); show(); } });

  if (!saved) {
    // wait for the preloader to lift (home pages), then let the intro breathe
    const ready = typeof preload !== 'undefined' && preload.done ? preload.done : Promise.resolve();
    ready.then(() => setTimeout(show, 1400));
  }
})();
