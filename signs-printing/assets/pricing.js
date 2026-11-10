/* ======================================================================
   PRICE LIST — TEMPORARY PRICES. Confirm every number with the shop
   before launch. Used by the designer (design.html) and checkout.
   ====================================================================== */
var PRICING = {
  currency: 'USD',
  taxRate: 0.0825,                 // Houston sales tax (confirm)
  // Base price per sign, one side, rectangle, gloss
  sizes: [
    { id: '12x18', w: 18, h: 12, price: 29 },
    { id: '18x24', w: 24, h: 18, price: 45 },
    { id: '24x24', w: 24, h: 24, price: 55 },
    { id: '24x36', w: 36, h: 24, price: 79 },
    { id: '24x48', w: 48, h: 24, price: 109 },
    { id: '48x96', w: 96, h: 48, price: 289, en: '4 × 8 ft', es: '4 × 8 pies' }
  ],
  defaultSize: '18x24',
  shapes: {                         // added per sign
    rect:    { price: 0,  en: 'Square corners',  es: 'Esquinas rectas' },
    rounded: { price: 5,  en: 'Rounded corners', es: 'Esquinas redondas' },
    oval:    { price: 15, en: 'Circle / oval',   es: 'Círculo / óvalo' }
  },
  twoSidedExtra: 0.5,               // +50% of the base price
  finishes: {                       // price per square foot
    gloss: { perSqFt: 0,    en: 'Gloss',                      es: 'Brillante' },
    matte: { perSqFt: 0,    en: 'Matte (no glare)',           es: 'Mate (sin reflejo)' },
    uv:    { perSqFt: 1.5,  en: 'UV + anti-graffiti laminate', es: 'Laminado UV antigrafiti' }
  },
  mounting: {                       // added per sign
    holes:     { price: 0,  en: 'Corner holes',         es: 'Hoyos en las esquinas' },
    none:      { price: 0,  en: 'No holes',             es: 'Sin hoyos' },
    standoffs: { price: 24, en: 'Wall standoffs (4)',   es: 'Separadores de pared (4)' },
    bracket:   { price: 18, en: 'Post bracket',         es: 'Soporte para poste' },
    post:      { price: 45, en: 'Post + bracket kit',   es: 'Kit de poste y soporte' },
    stake:     { price: 6,  en: 'H-stake (yard)',       es: 'Estaca H (jardín)' }
  },
  rush: 0.25,                       // +25% for 24-hour turnaround
  designHelp: 25,                   // one-time, per order line
  bulk: [ { min: 50, off: 0.20 }, { min: 25, off: 0.15 }, { min: 10, off: 0.10 } ],
  delivery: 25                      // local delivery, flat
};

PRICING.size = function (id) {
  return PRICING.sizes.filter(function (s) { return s.id === id; })[0] || PRICING.sizes[0];
};
PRICING.sizeName = function (id, lang) {
  var s = PRICING.size(id);
  if (s[lang || 'en']) return s[lang || 'en'];
  var p = s.id.split('x');
  return p[0] + ' × ' + p[1] + (lang === 'es' ? ' pulg' : ' in');
};
PRICING.bulkOff = function (qty) {
  for (var i = 0; i < PRICING.bulk.length; i++) if (qty >= PRICING.bulk[i].min) return PRICING.bulk[i].off;
  return 0;
};
/* opts: { size, shape, sides, finish, mounting, qty, rush, designHelp } */
PRICING.quote = function (o) {
  var s = PRICING.size(o.size);
  var sqft = (s.w * s.h) / 144;
  var base = s.price;
  var lines = [];
  var each = base;
  if (o.sides === 2) each += base * PRICING.twoSidedExtra;
  each += (PRICING.shapes[o.shape] || PRICING.shapes.rect).price;
  var fin = PRICING.finishes[o.finish] || PRICING.finishes.gloss;
  each += Math.round(fin.perSqFt * sqft * (o.sides === 2 ? 2 : 1) * 100) / 100;
  each += (PRICING.mounting[o.mounting] || PRICING.mounting.holes).price;
  if (o.rush) each *= 1 + PRICING.rush;
  each = Math.round(each * 100) / 100;
  var qty = Math.max(1, Math.min(999, o.qty | 0));
  var subtotal = each * qty;
  var off = PRICING.bulkOff(qty);
  var discount = Math.round(subtotal * off * 100) / 100;
  var help = o.designHelp ? PRICING.designHelp : 0;
  var total = Math.round((subtotal - discount + help) * 100) / 100;
  return { each: each, qty: qty, subtotal: subtotal, off: off, discount: discount, help: help, total: total, sqft: sqft };
};
PRICING.money = function (n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/* ---------- Cart (kept in this browser only — nothing is sent anywhere) ---------- */
var CART = {
  key: 'sp-cart',
  read: function () { try { return JSON.parse(localStorage.getItem(CART.key)) || []; } catch (e) { return []; } },
  write: function (items) {
    try { localStorage.setItem(CART.key, JSON.stringify(items)); }
    catch (e) {
      // storage full (big uploaded photos): keep the items but drop saved design files
      items.forEach(function (it) { delete it.design; });
      try { localStorage.setItem(CART.key, JSON.stringify(items)); } catch (e2) { return false; }
    }
    CART.badge(); return true;
  },
  add: function (item) { var c = CART.read(); item.id = 'L' + Date.now().toString(36); c.push(item); return CART.write(c); },
  count: function () { return CART.read().reduce(function (n, it) { return n + (it.opts.qty | 0); }, 0); },
  badge: function () {
    var n = CART.count();
    document.querySelectorAll('[data-cart-count]').forEach(function (b) { b.textContent = n; b.hidden = !n; });
  }
};
document.addEventListener('DOMContentLoaded', CART.badge);
