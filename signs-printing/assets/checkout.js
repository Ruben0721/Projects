/* Checkout (preview): reads the cart from this browser, collects details,
   and shows a confirmation. Nothing is sent or charged yet.
   ====================================================================== */
var PAY = {
  zelle: '',        // e.g. '(832) 906-6869' or an email: shows a Zelle option
  cashapp: ''       // e.g. '$SignsAndPrinting': shows a Cash App option
};
var SHOP_PHONE = '+18329066869';

(function () {
  var $ = function (id) { return document.getElementById(id); };
  var lang = 'en', M = PRICING.money;
  var W = {
    en: { each: 'each', qty: 'Qty', remove: 'Remove', items: 'Signs', bulk: 'Bulk discount', help: 'Design help', delivery: 'Local delivery', pickup: 'Pickup', free: 'Free',
          tax: 'Sales tax (8.25%)', need: 'Please fill in: ', name: 'name', phone: 'phone', addr: 'delivery address', empty: 'Your cart is empty.', order: 'Order',
          says: 'Says', pay: { card: 'Card (payment link by text)', shop: 'Pay in the shop', zelle: 'Zelle', cashapp: 'Cash App' } },
    es: { each: 'c/u', qty: 'Cant.', remove: 'Quitar', items: 'Letreros', bulk: 'Descuento por cantidad', help: 'Ayuda con el diseño', delivery: 'Entrega local', pickup: 'Recoger', free: 'Gratis',
          tax: 'Impuesto (8.25%)', need: 'Por favor llene: ', name: 'nombre', phone: 'teléfono', addr: 'dirección de entrega', empty: 'Su carrito está vacío.', order: 'Pedido',
          says: 'Dice', pay: { card: 'Tarjeta (enlace de pago por texto)', shop: 'Pagar en la tienda', zelle: 'Zelle', cashapp: 'Cash App' } }
  };
  function w(k) { return W[lang][k]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function summary(it) {
    var o = it.opts, parts = [PRICING.sizeName(o.size, lang), PRICING.shapes[o.shape][lang], o.sides === 2 ? (lang === 'es' ? 'Dos lados' : 'Two sides') : (lang === 'es' ? 'Un lado' : 'One side'), PRICING.finishes[o.finish][lang], PRICING.mounting[o.mounting][lang]];
    if (o.rush) parts.push(lang === 'es' ? 'Urgente 24 h' : '24-hour rush');
    if (o.designHelp) parts.push(w('help'));
    return parts.join(' · ');
  }
  function totals(items) {
    var signs = 0, disc = 0, help = 0;
    items.forEach(function (it) { var q = PRICING.quote(it.opts); signs += q.subtotal; disc += q.discount; help += q.help; });
    var delivery = getMode() === 'delivery' && items.length ? PRICING.delivery : 0;
    var taxable = signs - disc + help + delivery;
    var tax = Math.round(taxable * PRICING.taxRate * 100) / 100;
    return { signs: signs, disc: disc, help: help, delivery: delivery, tax: tax, total: Math.round((taxable + tax) * 100) / 100 };
  }
  function getMode() { var c = document.querySelector('input[name="get"]:checked'); return c ? c.value : 'pickup'; }
  function getPay() { var c = document.querySelector('input[name="pay"]:checked'); return c ? c.value : 'card'; }

  function render() {
    var items = CART.read(), list = $('cart-list');
    $('cart-empty').hidden = items.length > 0;
    $('place').disabled = !items.length;
    list.innerHTML = items.map(function (it, i) {
      var q = PRICING.quote(it.opts);
      return '<li class="ci" data-i="' + i + '">' +
        '<img src="' + it.thumb + '" alt="">' +
        '<div class="ci-body"><b>Metal Max · ' + esc(PRICING.sizeName(it.opts.size, lang)) + '</b>' +
        '<span class="mute">' + esc(summary(it)) + '</span>' +
        (it.words ? '<span class="ci-words">' + w('says') + ': “' + esc(it.words.slice(0, 90)) + '”</span>' : '') +
        '<div class="ci-row"><div class="qty"><button type="button" data-act="minus" aria-label="Less">−</button><input type="number" min="1" max="999" value="' + q.qty + '" aria-label="' + w('qty') + '"><button type="button" data-act="plus" aria-label="More">+</button></div>' +
        '<button type="button" class="mini-btn danger" data-act="remove">' + w('remove') + '</button></div></div>' +
        '<div class="ci-price"><strong>' + M(q.total) + '</strong><small>' + M(q.each) + ' ' + w('each') + (q.discount ? ' · −' + Math.round(q.off * 100) + '%' : '') + '</small></div></li>';
    }).join('');
    var t = totals(items), rows = [[w('items') + ' (' + CART.count() + ')', M(t.signs)]];
    if (t.disc) rows.push([w('bulk'), '−' + M(t.disc)]);
    if (t.help) rows.push([w('help'), M(t.help)]);
    rows.push([getMode() === 'delivery' ? w('delivery') : w('pickup'), t.delivery ? M(t.delivery) : w('free')]);
    rows.push([w('tax'), M(t.tax)]);
    $('sum-rows').innerHTML = rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');
    $('sum-total').textContent = M(t.total);
    $('del-price').textContent = '+' + M(PRICING.delivery);
  }

  function setQty(i, v) {
    var items = CART.read(); if (!items[i]) return;
    items[i].opts.qty = Math.max(1, Math.min(999, v | 0 || 1));
    CART.write(items); render();
  }
  $('cart-list').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var li = b.closest('.ci'), i = +li.dataset.i, items = CART.read();
    if (b.dataset.act === 'remove') { items.splice(i, 1); CART.write(items); render(); return; }
    setQty(i, items[i].opts.qty + (b.dataset.act === 'plus' ? 1 : -1));
  });
  $('cart-list').addEventListener('change', function (e) {
    if (e.target.matches('input[type=number]')) setQty(+e.target.closest('.ci').dataset.i, parseInt(e.target.value, 10));
  });
  document.querySelectorAll('input[name="get"]').forEach(function (r) { r.addEventListener('change', function () { $('addr').hidden = getMode() !== 'delivery'; render(); }); });
  document.querySelectorAll('input[name="pay"]').forEach(function (r) { r.addEventListener('change', function () { $('card-fields').hidden = getPay() !== 'card'; }); });

  if (PAY.zelle) { $('po-zelle').hidden = false; $('zelle-to').textContent = PAY.zelle; }
  if (PAY.cashapp) { $('po-cashapp').hidden = false; $('cashapp-to').textContent = PAY.cashapp; }

  $('co-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var miss = [], f = function (id) { return $(id).value.trim(); };
    document.querySelectorAll('.fld.bad').forEach(function (n) { n.classList.remove('bad'); });
    function need(id, label) { if (!f(id)) { miss.push(label); $(id).closest('.fld').classList.add('bad'); } }
    need('f-name', w('name'));
    if (f('f-phone').replace(/\D/g, '').length < 10) { miss.push(w('phone')); $('f-phone').closest('.fld').classList.add('bad'); }
    if (getMode() === 'delivery') { need('f-street', w('addr')); need('f-city', w('addr')); need('f-zip', w('addr')); }
    miss = miss.filter(function (m, i) { return miss.indexOf(m) === i; });
    if (miss.length) { $('co-err').hidden = false; $('co-err').textContent = w('need') + miss.join(', ') + '.'; return; }
    $('co-err').hidden = true;
    confirmOrder();
  });

  function confirmOrder() {
    var items = CART.read(), t = totals(items);
    var num = 'SP-' + Date.now().toString(36).toUpperCase().slice(-6);
    var lines = items.map(function (it, i) {
      var q = PRICING.quote(it.opts);
      return (i + 1) + ') ' + q.qty + ' × Metal Max ' + summary(it) + (it.words ? ' — "' + it.words.slice(0, 80) + '"' : '') + ' — ' + M(q.total);
    });
    var who = $('f-name').value.trim() + ' · ' + $('f-phone').value.trim() + ($('f-email').value.trim() ? ' · ' + $('f-email').value.trim() : '');
    var where = getMode() === 'delivery' ? w('delivery') + ': ' + [$('f-street').value, $('f-city').value, $('f-zip').value].join(', ') : w('pickup') + ': 4528 Hwy 6 N';
    var msg = (lang === 'es' ? 'Hola, quiero hacer este pedido (' : 'Hi, I would like to place this order (') + num + '):\n' + lines.join('\n') +
      '\n' + (lang === 'es' ? 'Total estimado: ' : 'Estimated total: ') + M(t.total) + '\n' + who + '\n' + where + '\n' + W[lang].pay[getPay()] +
      ($('f-notes').value.trim() ? '\n' + $('f-notes').value.trim() : '');
    $('done-num').textContent = w('order') + ' ' + num;
    $('done-list').innerHTML = items.map(function (it) { var q = PRICING.quote(it.opts); return '<li><img src="' + it.thumb + '" alt=""><span><b>' + q.qty + ' × Metal Max</b><small>' + esc(summary(it)) + '</small></span><strong>' + M(q.total) + '</strong></li>'; }).join('') +
      '<li class="dl-total"><span>' + esc(who) + '<small>' + esc(where) + ' · ' + esc(W[lang].pay[getPay()]) + '</small></span><strong>' + M(t.total) + '</strong></li>';
    $('done-sms').href = 'sms:' + SHOP_PHONE + '?&body=' + encodeURIComponent(msg);
    try { localStorage.setItem('sp-last-order', JSON.stringify({ num: num, msg: msg, when: Date.now() })); } catch (e) {}
    CART.write([]);
    $('co').hidden = true; document.querySelector('.d-head').hidden = true;
    $('done').hidden = false; window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $('done-print').addEventListener('click', function () { window.print(); });

  SP.onLang(function (l) { lang = l; render(); });
  render();
})();
