/* Shared by every page: reveal-on-scroll and the English / Spanish switch. */
(function () {
  document.documentElement.classList.add('js');
  var hero = document.querySelector('.hero, .page-head');
  if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('ready'); }); });

  var secs = document.querySelectorAll('main > section, .foot');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  } else { secs.forEach(function (s) { s.classList.add('in'); }); }

  var listeners = [];
  var SP = window.SP = { lang: 'en', onLang: function (fn) { listeners.push(fn); } };

  function setLang(l) {
    SP.lang = l;
    document.querySelectorAll('[data-es]').forEach(function (n) {
      if (n.dataset.en === undefined) n.dataset.en = n.innerHTML;
      n.innerHTML = l === 'es' ? n.dataset.es : n.dataset.en;
    });
    document.documentElement.lang = l;
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === l)); });
    try { localStorage.setItem('sp-lang', l); } catch (e) {}
    listeners.forEach(function (fn) { fn(l); });
  }
  SP.setLang = setLang;
  document.querySelectorAll('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });

  // Run after page scripts have registered their listeners
  document.addEventListener('DOMContentLoaded', function () {
    var saved = null;
    try { saved = localStorage.getItem('sp-lang'); } catch (e) {}
    setLang(saved === 'es' ? 'es' : 'en');
  });
})();
