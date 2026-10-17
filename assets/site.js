/* urdloom.com: language, rune sheet, quiet video handling. No tracking, no cookies. */
(() => {
  const $ = (s, r) => (r || document).querySelector(s);
  const LANG = document.documentElement.lang;
  const ROOT = document.body.dataset.root || '/';
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } } };

  /* language: remember a choice; on a first visit to the English root, follow the browser */
  const sel = $('#lang');
  if (sel) sel.addEventListener('change', () => { store.set('urd.lang', sel.value); location.href = sel.selectedOptions[0].dataset.href; });
  if (LANG === 'en' && !store.get('urd.lang') && sel && location.pathname.split('/').filter(Boolean).length <= 1) {
    const want = (navigator.languages || [navigator.language || 'en']).map((l) => l.toLowerCase().replace(/^(nn|no)\b.*/, 'nb').replace(/^in\b.*/, 'id').slice(0, 2));
    const opt = Array.from(sel.options).find((o) => want[0] && o.value === want[0] && o.value !== 'en');
    if (opt) { store.set('urd.lang', opt.value); location.replace(opt.dataset.href); return; }
  }

  /* videos: play only while seen, never when motion is reduced */
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vids = Array.from(document.querySelectorAll('video'));
  if (still) vids.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
  else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { if (v.dataset.src && !v.src) { v.src = v.dataset.src; } const p = v.play(); if (p && p.catch) p.catch(() => { }); }
      else v.pause();
    }), { threshold: 0.15 });
    vids.forEach((v) => io.observe(v));
  }

  /* the rune sheet */
  const data = JSON.parse(($('#runes-data') || {}).textContent || '{}');
  const dlg = $('#rune');
  function stone(id) {
    const r = data.runes[id];
    return '<div class="st"><img src="' + ROOT + 'assets/stone' + r.v + '.webp" alt=""><svg viewBox="0 0 64 100" aria-hidden="true"><path class="g" d="' + r.d + '"/><path class="c" d="' + r.d + '"/></svg></div>';
  }
  document.querySelectorAll('.rb').forEach((b) => b.addEventListener('click', () => {
    const r = data.runes[b.dataset.id]; if (!r || !dlg) return;
    $('#rune-stone').innerHTML = stone(b.dataset.id);
    $('#rune-name').textContent = r.name;
    $('#rune-keys').textContent = r.keywords.join(' · ');
    $('#rune-means').textContent = r.means;
    $('#rune-sound').textContent = r.sound;
    const body = $('#rune-body'); body.innerHTML = '';
    const sec = (h, p) => { const H = document.createElement('h3'); H.textContent = h; const P = document.createElement('p'); P.textContent = p; body.append(H, P); };
    sec(data.t.historical, r.historical); sec(data.t.modern, r.modern); sec(data.t.reversed, r.reversible ? r.reversed : data.t.never);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }));
  if (dlg) dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
})();
