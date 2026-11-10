/* ======================================================================
   SHOP SETTINGS — fill these in before launch.
   - price: dollars per sign (one side). Leave null to show "Quote by text".
   - PAY.cardLink: a Square / Stripe / Clover payment link. Leave '' and the
     button texts the shop to ask for a link instead.
   - PAY.zelle / PAY.cashapp: leave '' to hide that option.
   ====================================================================== */
var SIZES = [
  { id: '12x18', w: 18, h: 12, price: null },
  { id: '18x24', w: 24, h: 18, price: null },
  { id: '24x36', w: 36, h: 24, price: null },
  { id: '24x48', w: 48, h: 24, price: null },
  { id: '48x96', w: 96, h: 48, price: null, label: '4 × 8 ft', labelEs: '4 × 8 pies' }
];
var DEFAULT_SIZE = '18x24';
var TWO_SIDED_EXTRA = 0.5;           // +50% per sign for two sides (confirm)
var PAY = {
  cardLink: '',                       // e.g. 'https://square.link/u/XXXX'
  zelle: '',                          // e.g. '(832) 906-6869' or an email
  cashapp: ''                         // e.g. '$SignsAndPrinting'
};
var PHONE = '+18329066869';

(function () {
  var $ = function (id) { return document.getElementById(id); };
  var lang = 'en';

  // Size chips
  var sizeBox = $('sizes');
  SIZES.forEach(function (s) {
    var parts = s.id.split('x');
    var inp = document.createElement('input');
    inp.type = 'radio'; inp.name = 'size'; inp.id = 's-' + s.id; inp.value = s.id;
    if (s.id === DEFAULT_SIZE) inp.checked = true;
    var lab = document.createElement('label');
    lab.htmlFor = inp.id;
    lab.textContent = s.label || (parts[0] + ' × ' + parts[1]);
    sizeBox.appendChild(inp); sizeBox.appendChild(lab);
  });

  // Payment options
  if (PAY.cardLink) {
    $('card-btn').href = PAY.cardLink; $('card-btn').target = '_blank'; $('card-btn').rel = 'noopener';
    $('card-note').dataset.es = 'Pague seguro con tarjeta, Apple Pay o Google Pay.';
    $('card-note').textContent = 'Pay securely by card, Apple Pay or Google Pay.';
  }
  if (PAY.zelle) { $('m-zelle').hidden = false; }
  if (PAY.cashapp) {
    $('m-cashapp').hidden = false;
    $('cashapp-to').textContent = PAY.cashapp;
    $('cashapp-btn').href = 'https://cash.app/' + PAY.cashapp.replace(/^\$?/, '$');
  }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = PAY[b.dataset.copy];
      var done = function () { var t = b.textContent; b.textContent = lang === 'es' ? '¡Copiado!' : 'Copied!'; setTimeout(function () { b.textContent = t; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function () {}); else done();
    });
  });

  var T = {
    en: { size: 'Size', colour: 'Colour', sides: 'Sides', holes: 'Holes', qty: 'Quantity', one: 'One', two: 'Two', yes: 'Yes', no: 'No',
          byText: 'Quote by text', each: 'each', placeholder: 'YOUR TEXT', zelle: 'Send to ', in: 'in', payMsg: 'Hi, I would like to pay for my Metal Max order by card. Can you send me the payment link?' },
    es: { size: 'Tamaño', colour: 'Color', sides: 'Lados', holes: 'Hoyos', qty: 'Cantidad', one: 'Uno', two: 'Dos', yes: 'Sí', no: 'No',
          byText: 'Precio por texto', each: 'c/u', placeholder: 'SU TEXTO', zelle: 'Envíe a ', in: 'pulg', payMsg: 'Hola, quiero pagar mi pedido de Metal Max con tarjeta. ¿Me manda el enlace de pago?' }
  };
  var samples = { en: 'YOUR BUSINESS', es: 'SU NEGOCIO' };

  function val(name) { var c = document.querySelector('input[name="' + name + '"]:checked'); return c ? c.value : ''; }
  function money(n) { return '$' + n.toFixed(2).replace(/\.00$/, ''); }
  function draw() {
    var t = T[lang];
    var size = SIZES.filter(function (s) { return s.id === val('size'); })[0] || SIZES[0];
    var cols = val('col').split('|');
    var sides = val('sides'), holes = val('holes') === '1';
    var qty = Math.max(1, Math.min(999, parseInt($('qty').value, 10) || 1));
    var txt = $('txt').value.trim() || t.placeholder;
    var sub = $('sub').value.trim();
    var p = $('preview');

    var maxW = Math.min(560, 200 + size.w * 3.8);
    p.style.width = 'min(' + Math.round(maxW) + 'px, 92%)';
    p.style.aspectRatio = size.w + ' / ' + size.h;
    p.style.background = cols[0]; p.style.color = cols[1];
    p.classList.toggle('noholes', !holes);
    $('p-txt').textContent = txt.toUpperCase();
    $('p-sub').textContent = sub; $('p-sub').hidden = !sub;
    var sizeName = (lang === 'es' && size.labelEs) || size.label || size.id.replace('x', ' × ') + ' ' + t.in;
    $('size-tag').textContent = sizeName;
    SIZES.forEach(function (z) { if (z.label) document.querySelector('label[for="s-' + z.id + '"]').textContent = (lang === 'es' && z.labelEs) || z.label; });

    var colourName = document.querySelector('input[name="col"]:checked + label').textContent.trim();
    var rows = [[t.size, sizeName], [t.colour, colourName], [t.sides, sides === '2' ? t.two : t.one], [t.holes, holes ? t.yes : t.no], [t.qty, String(qty)]];
    $('sum').innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');

    var priceText = t.byText;
    if (typeof size.price === 'number') {
      var each = size.price * (sides === '2' ? 1 + TWO_SIDED_EXTRA : 1);
      priceText = money(each * qty) + (qty > 1 ? ' (' + money(each) + ' ' + t.each + ')' : '');
    }
    $('price').textContent = priceText;

    var msg = lang === 'es'
      ? 'Hola, quiero ' + qty + ' letrero(s) Metal Max de ' + sizeName + ', fondo ' + colourName.toLowerCase() + ', ' + (sides === '2' ? 'dos lados' : 'un lado') + (holes ? ', con hoyos' : ', sin hoyos') + '. Que diga: "' + txt + '"' + (sub ? ' / "' + sub + '"' : '') + '. ¿Cuánto sería?'
      : 'Hi, I would like ' + qty + ' Metal Max sign(s), ' + sizeName + ', ' + colourName.toLowerCase() + ' background, ' + (sides === '2' ? 'two sides' : 'one side') + (holes ? ', with holes' : ', no holes') + '. It should say: "' + txt + '"' + (sub ? ' / "' + sub + '"' : '') + '. How much would it be?';
    $('send').href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(msg);

    if (!PAY.cardLink) $('card-btn').href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(t.payMsg);
    if (PAY.zelle) $('zelle-to').textContent = t.zelle + PAY.zelle;
  }

  SP.onLang(function (l) {
    lang = l;
    if ($('txt').value === samples[l === 'es' ? 'en' : 'es']) $('txt').value = samples[l];
    draw();
  });
  $('minus').addEventListener('click', function () { $('qty').value = Math.max(1, (parseInt($('qty').value, 10) || 1) - 1); draw(); });
  $('plus').addEventListener('click', function () { $('qty').value = Math.min(999, (parseInt($('qty').value, 10) || 1) + 1); draw(); });
  $('order-form').addEventListener('input', draw);
  $('order-form').addEventListener('change', draw);
  draw();
})();
