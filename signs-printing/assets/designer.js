/* Metal Max sign designer: fabric.js editor + live 3D preview + live price. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lang = 'en';
  var W = 1200;                     // design width in canvas units (height follows the size)
  var H = 900;

  /* ---------- words ---------- */
  var TXT = {
    en: { heading: 'YOUR BUSINESS', sub: 'Your tagline here', small: '(832) 555-0100', each: 'each', sign: 'sign', signs: 'signs',
          base: 'Sign', twoSided: 'Two sides', shape: 'Shape', finish: 'Finish', mount: 'Mounting', rush: '24-hour rush', bulk: 'Bulk discount',
          help: 'Design help', subtotal: 'Subtotal', total: 'Total', added: 'Added to your cart!', goCheckout: 'Go to checkout', keep: 'Keep designing',
          upload: 'Only images, please (JPG, PNG, WebP).', full: 'Your cart is full. Remove a big photo or check out first.',
          confirmClear: 'Start over with a blank sign?', saved: 'Saved', one: 'One side', two: 'Two sides', tmp: 'Temporary prices' },
    es: { heading: 'SU NEGOCIO', sub: 'Su eslogan aquí', small: '(832) 555-0100', each: 'c/u', sign: 'letrero', signs: 'letreros',
          base: 'Letrero', twoSided: 'Dos lados', shape: 'Forma', finish: 'Acabado', mount: 'Montaje', rush: 'Urgente 24 horas', bulk: 'Descuento por cantidad',
          help: 'Ayuda con el diseño', subtotal: 'Subtotal', total: 'Total', added: '¡Agregado a su carrito!', goCheckout: 'Ir a pagar', keep: 'Seguir diseñando',
          upload: 'Solo imágenes, por favor (JPG, PNG, WebP).', full: 'Su carrito está lleno. Quite una foto grande o pague primero.',
          confirmClear: '¿Empezar de nuevo con un letrero en blanco?', saved: 'Guardado', one: 'Un lado', two: 'Dos lados', tmp: 'Precios temporales' }
  };
  function t(k) { return TXT[lang][k]; }

  /* ---------- palette, fonts, icons ---------- */
  var PALETTE = ['#ffffff', '#0b0b0d', '#ffd400', '#ee1c25', '#ff7a00', '#3fc31c', '#00aeef', '#1d4fd8', '#ff0a9c', '#7b1fb8', '#14144a', '#8d9199'];
  var GRADS = {
    rainbow: ['#ff0a9c', '#ee1c25', '#ff7a00', '#ffd400', '#3fc31c', '#00aeef', '#1d4fd8', '#7b1fb8'],
    sunset: ['#ff0a9c', '#ff7a00', '#ffd400'],
    ocean: ['#14144a', '#1d4fd8', '#00aeef'],
    lime: ['#3fc31c', '#ffd400'],
    night: ['#0b0b0d', '#14144a', '#7b1fb8']
  };
  var FONTS = [
    { f: 'Overpass', w: 900, i: 'italic', label: 'Overpass Heavy' },
    { f: 'Anton', w: 400, label: 'Anton' },
    { f: 'Bebas Neue', w: 400, label: 'Bebas Neue' },
    { f: 'Oswald', w: 700, label: 'Oswald' },
    { f: 'Archivo Black', w: 400, label: 'Archivo Black' },
    { f: 'Alfa Slab One', w: 400, label: 'Alfa Slab' },
    { f: 'Roboto Slab', w: 700, label: 'Roboto Slab' },
    { f: 'Permanent Marker', w: 400, label: 'Marker' },
    { f: 'Pacifico', w: 400, label: 'Pacifico' }
  ];
  var ICONS = {
    phone: 'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z',
    pin: 'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z',
    arrow: 'M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4z',
    check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
    star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
    no: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 0 1 6.3 12.9L7.1 5.7A8 8 0 0 1 12 4zm0 16a8 8 0 0 1-6.3-12.9l11.2 11.2A8 8 0 0 1 12 20z',
    warn: 'M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    heart: 'M12 21s-7.5-4.6-10-9.3C.4 8.3 2.4 4 6.3 4c2.2 0 3.7 1.3 4.7 2.7C12 5.3 13.5 4 15.7 4 19.6 4 21.6 8.3 20 11.7 17.5 16.4 12 21 12 21z'
  };

  /* ---------- state ---------- */
  var opts = { size: PRICING.defaultSize, shape: 'rect', sides: 1, finish: 'gloss', mounting: 'holes', qty: 1, rush: false, designHelp: false };
  var bg = { type: 'solid', color: '#ffffff', grad: 'rainbow', angle: 0 };
  var border = { width: 0, color: '#0b0b0d' };
  var canvas, exporting = false, history = [], hIndex = -1, restoring = false, uploads = [];

  /* ---------- canvas ---------- */
  function sizeHeight() { var s = PRICING.size(opts.size); return Math.round(W * s.h / s.w); }

  function fitView() {
    var wrap = $('canvas-wrap'), cs = getComputedStyle(wrap);
    var maxW = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 12, maxH = Math.max(260, Math.min(window.innerHeight * 0.62, 640));
    var z = Math.min(maxW / W, maxH / H);
    canvas.setDimensions({ width: Math.round(W * z), height: Math.round(H * z) });
    canvas.setZoom(z);
    canvas.requestRenderAll();
  }

  function makeClip() {
    var common = { left: 0, top: 0, absolutePositioned: true, originX: 'left', originY: 'top' };
    if (opts.shape === 'oval') return new fabric.Ellipse(Object.assign({ rx: W / 2, ry: H / 2 }, common));
    var r = opts.shape === 'rounded' ? Math.min(W, H) * 0.08 : 0;
    return new fabric.Rect(Object.assign({ width: W, height: H, rx: r, ry: r }, common));
  }

  function bgFill() {
    if (bg.type === 'grad') {
      var cols = GRADS[bg.grad];
      return new fabric.Gradient({
        type: 'linear', gradientUnits: 'pixels',
        coords: bg.angle ? { x1: 0, y1: 0, x2: 0, y2: H } : { x1: 0, y1: 0, x2: W, y2: 0 },
        colorStops: cols.map(function (c, i) { return { offset: i / (cols.length - 1), color: c }; })
      });
    }
    return bg.type === 'metal' ? '#c9ccd2' : bg.color;
  }
  function special(name) { return canvas.getObjects().filter(function (o) { return o.name === name; })[0]; }
  function lockProps() { return { selectable: false, evented: false, hasControls: false, excludeFromLayers: true, hoverCursor: 'default' }; }

  function paintBackground() {
    var r = special('bg');
    if (!r) { r = new fabric.Rect(Object.assign({ name: 'bg', left: 0, top: 0, originX: 'left', originY: 'top' }, lockProps())); canvas.insertAt(r, 0); }
    r.set({ width: W, height: H, fill: bgFill() });
    if (bg.type === 'metal') {
      r.set('fill', new fabric.Pattern({ source: metalTile(), repeat: 'repeat' }));
    }
    var b = special('border');
    if (border.width > 0) {
      var inset = border.width / 2 + Math.min(W, H) * 0.035;
      var common = Object.assign({ name: 'border', fill: 'transparent', stroke: border.color, strokeWidth: border.width, originX: 'center', originY: 'center', left: W / 2, top: H / 2 }, lockProps());
      var shapeNow = opts.shape === 'oval' ? 'oval' : 'rect';
      if (b && b.shapeKind !== shapeNow) { canvas.remove(b); b = null; }
      if (!b) {
        b = shapeNow === 'oval' ? new fabric.Ellipse(common) : new fabric.Rect(common);
        b.shapeKind = shapeNow; canvas.insertAt(b, 1);
      }
      if (shapeNow === 'oval') b.set({ rx: W / 2 - inset, ry: H / 2 - inset });
      else { var rr = opts.shape === 'rounded' ? Math.min(W, H) * 0.06 : Math.min(W, H) * 0.012; b.set({ width: W - inset * 2, height: H - inset * 2, rx: rr, ry: rr }); }
      b.set({ stroke: border.color, strokeWidth: border.width });
    } else if (b) { canvas.remove(b); }
    canvas.clipPath = makeClip();
    canvas.requestRenderAll();
  }
  var _metal;
  function metalTile() {
    if (_metal) return _metal;
    var c = document.createElement('canvas'); c.width = 400; c.height = 400; var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 400, 400); gr.addColorStop(0, '#dfe1e5'); gr.addColorStop(.5, '#b5b8be'); gr.addColorStop(1, '#e8eaed');
    g.fillStyle = gr; g.fillRect(0, 0, 400, 400);
    for (var i = 0; i < 1400; i++) { g.strokeStyle = 'rgba(' + (Math.random() > .5 ? '255,255,255' : '70,74,82') + ',' + Math.random() * .12 + ')'; g.beginPath(); var y = Math.random() * 400; g.moveTo(0, y); g.lineTo(400, y); g.stroke(); }
    return (_metal = c);
  }

  /* holes + safe area overlay (never printed, never exported) */
  function holeSpots() {
    if (opts.mounting === 'none' || opts.mounting === 'stake') return [];
    var s = PRICING.size(opts.size), pxPerIn = W / s.w;
    var i = Math.max(0.7, Math.min(s.w, s.h) * 0.045) * pxPerIn;
    if (opts.mounting === 'bracket' || opts.mounting === 'post' || opts.shape === 'oval') return [[W / 2, i * 1.2], [W / 2, H - i * 1.2]];
    return [[i, i], [W - i, i], [i, H - i], [W - i, H - i]];
  }
  function drawOverlay(e) {
    if (exporting) return;
    var ctx = e.ctx, z = canvas.getZoom(), s = PRICING.size(opts.size), pxPerIn = W / s.w;
    ctx.save();
    setVT(ctx);
    var hr = Math.max(0.16, Math.min(s.w, s.h) * 0.008) * pxPerIn;
    holeSpots().forEach(function (p) {
      ctx.beginPath(); ctx.arc(p[0], p[1], hr * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = '#16161a'; ctx.fill(); ctx.lineWidth = 3 / z; ctx.strokeStyle = '#9aa0a8'; ctx.stroke();
    });
    if (showGuides) {
      var m = Math.min(W, H) * 0.05;
      ctx.setLineDash([10 / z, 8 / z]); ctx.lineWidth = 1.5 / z; ctx.strokeStyle = 'rgba(0,174,239,.85)';
      if (opts.shape === 'oval') { ctx.beginPath(); ctx.ellipse(W / 2, H / 2, W / 2 - m, H / 2 - m, 0, 0, Math.PI * 2); ctx.stroke(); }
      else ctx.strokeRect(m, m, W - m * 2, H - m * 2);
    }
    ctx.restore();
  }
  var showGuides = true;
  function setVT(ctx) {            // viewport transform, including the high-density screen scale
    var r = exporting ? 1 : canvas.getRetinaScaling(), v = canvas.viewportTransform;
    ctx.setTransform(v[0] * r, 0, 0, v[3] * r, v[4] * r, v[5] * r);
  }

  /* snapping to centre */
  function snap(e) {
    var o = e.target, c = o.getCenterPoint(), tol = 14 / canvas.getZoom();
    var sx = Math.abs(c.x - W / 2) < tol, sy = Math.abs(c.y - H / 2) < tol;
    if (sx || sy) o.setPositionByOrigin(new fabric.Point(sx ? W / 2 : c.x, sy ? H / 2 : c.y), 'center', 'center');
    guide = { x: sx, y: sy };
  }
  var guide = { x: false, y: false };
  function drawSnap(e) {
    if (exporting || (!guide.x && !guide.y)) return;
    var ctx = e.ctx; ctx.save();
    setVT(ctx);
    ctx.strokeStyle = '#ff0a9c'; ctx.lineWidth = 2 / canvas.getZoom();
    if (guide.x) { ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); }
    if (guide.y) { ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke(); }
    ctx.restore();
  }

  /* ---------- export ---------- */
  function exportCanvas(px) {
    exporting = true;
    var prev = canvas.getActiveObject();
    var el = canvas.toCanvasElement(px / canvas.getWidth());
    exporting = false;
    canvas.requestRenderAll();
    return el;
  }
  var t3d;
  function push3D() {
    clearTimeout(t3d);
    t3d = setTimeout(function () { if (window.Sign3D) Sign3D.setDesign(exportCanvas(2048)); }, 120);
  }

  /* ---------- history ---------- */
  var KEEP = ['name', 'selectable', 'evented', 'hasControls', 'excludeFromLayers', 'hoverCursor', 'shapeKind', 'kind', 'iconName'];
  function snapshot() {
    if (restoring) return;
    var state = JSON.stringify({ c: canvas.toJSON(KEEP), opts: opts, bg: bg, border: border });
    if (history[hIndex] === state) return;
    history = history.slice(0, hIndex + 1); history.push(state);
    if (history.length > 40) history.shift();
    hIndex = history.length - 1;
    updateUndo(); autosave(state); push3D(); renderLayers();
  }
  function restore(state, cb) {
    restoring = true;
    var s = JSON.parse(state);
    Object.assign(opts, s.opts); Object.assign(bg, s.bg); Object.assign(border, s.border);
    H = sizeHeight();
    canvas.loadFromJSON(s.c, function () {
      canvas.clipPath = makeClip();
      fitView(); paintBackground(); restoring = false;
      syncOptionsUI(); renderLayers(); updatePrice(); push3D(); updateUndo();
      if (window.Sign3D) Sign3D.update(signSpec());
      cb && cb();
    });
  }
  function updateUndo() { $('undo').disabled = hIndex <= 0; $('redo').disabled = hIndex >= history.length - 1; }
  var tSave;
  function autosave(state) {
    clearTimeout(tSave);
    tSave = setTimeout(function () { try { localStorage.setItem('sp-design', state); } catch (e) {} }, 400);
  }

  /* ---------- adding things ---------- */
  function center(o, y) { o.set({ originX: 'center', originY: 'center', left: W / 2, top: y != null ? y : H / 2 }); return o; }
  function fitWidth(o, max) { var m = (max || 0.86) * W; if (o.getScaledWidth() > m) o.scale(o.scaleX * m / o.getScaledWidth()); }
  function addObj(o, keepSel) {
    canvas.add(o);
    if (!keepSel) canvas.setActiveObject(o);
    canvas.requestRenderAll();
  }
  function loadFont(f, w, cb) {
    if (!document.fonts || !document.fonts.load) return cb();
    document.fonts.load((w || 400) + ' 40px "' + f + '"').then(function () { cb(); }, cb);
  }
  function addText(text, size, o) {
    o = o || {};
    var font = FONTS.filter(function (f) { return f.f === (o.font || 'Overpass'); })[0] || FONTS[0];
    loadFont(font.f, font.w, function () {
      var tx = new fabric.IText(text, {
        fontFamily: font.f, fontWeight: o.weight || font.w, fontStyle: o.italic === false ? 'normal' : (o.italic || font.i || 'normal'),
        fontSize: size, fill: o.fill || contrastText(), textAlign: 'center', charSpacing: o.spacing || 0,
        stroke: o.stroke || null, strokeWidth: o.sw || 0, paintFirst: 'stroke', strokeLineJoin: 'round', kind: 'text'
      });
      center(tx, o.y != null ? o.y * H : H / 2);
      if (o.x != null) tx.set('left', o.x * W);
      fitWidth(tx, o.max);
      if (o.shadow) tx.set('shadow', new fabric.Shadow({ color: 'rgba(0,0,0,.45)', blur: 12, offsetX: 4, offsetY: 6 }));
      addObj(tx, o.noSelect);
      if (!o.batch) snapshot();
      o.done && o.done(tx);
    });
  }
  function contrastText() {
    if (bg.type !== 'solid') return '#0b0b0d';
    var c = bg.color.replace('#', ''), r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#0b0b0d' : '#ffffff';
  }
  function addShape(kind, o) {
    o = o || {};
    var m = Math.min(W, H), fill = o.fill || '#ffd400', s;
    if (kind === 'rect') s = new fabric.Rect({ width: m * 0.4, height: m * 0.28, fill: fill });
    else if (kind === 'rounded') s = new fabric.Rect({ width: m * 0.4, height: m * 0.28, rx: m * 0.05, ry: m * 0.05, fill: fill });
    else if (kind === 'circle') s = new fabric.Circle({ radius: m * 0.16, fill: fill });
    else if (kind === 'triangle') s = new fabric.Triangle({ width: m * 0.34, height: m * 0.3, fill: fill });
    else if (kind === 'star') s = new fabric.Polygon(starPts(5, m * 0.17, m * 0.075), { fill: fill });
    else if (kind === 'burst') s = new fabric.Polygon(starPts(16, m * 0.19, m * 0.15), { fill: fill });
    else if (kind === 'line') s = new fabric.Rect({ width: W * 0.6, height: Math.max(6, H * 0.012), rx: 4, ry: 4, fill: fill });
    else if (kind === 'rainbow') s = new fabric.Rect({ width: W * 0.6, height: Math.max(10, H * 0.02), rx: 6, ry: 6, fill: new fabric.Gradient({ type: 'linear', gradientUnits: 'percentage', coords: { x1: 0, y1: 0, x2: 1, y2: 0 }, colorStops: GRADS.rainbow.map(function (c, i) { return { offset: i / 7, color: c }; }) }) });
    else if (kind === 'arrowshape') s = new fabric.Path(ICONS.arrow, { fill: fill, scaleX: m * 0.012, scaleY: m * 0.012 });
    s.set({ kind: 'shape' });
    if (o.w) s.set({ width: o.w * W });
    if (o.h) s.set({ height: o.h * H });
    if (o.rx) s.set({ rx: o.rx * Math.min(W, H), ry: o.rx * Math.min(W, H) });
    center(s, o.y != null ? o.y * H : H / 2);
    if (o.x != null) s.set('left', o.x * W);
    if (o.stroke) s.set({ stroke: o.stroke, strokeWidth: o.sw || 6 });
    addObj(s, o.noSelect);
    if (!o.batch) snapshot();
    return s;
  }
  function starPts(n, R, r) {
    var pts = [];
    for (var i = 0; i < n * 2; i++) { var a = Math.PI / n * i - Math.PI / 2, rad = i % 2 ? r : R; pts.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad }); }
    return pts;
  }
  function addIcon(name, o) {
    o = o || {};
    var size = (o.size || 0.22) * Math.min(W, H);
    var p = new fabric.Path(ICONS[name], { fill: o.fill || contrastText(), kind: 'icon', iconName: name });
    p.scale(size / 24);
    center(p, o.y != null ? o.y * H : H / 2);
    if (o.x != null) p.set('left', o.x * W);
    addObj(p, o.noSelect);
    if (!o.batch) snapshot();
    return p;
  }
  function addImage(url, o) {
    o = o || {};
    fabric.Image.fromURL(url, function (img) {
      var m = Math.min(W, H) * (o.size || 0.55);
      img.scale(Math.min(m / img.width, m / img.height));
      img.set({ kind: 'image' });
      center(img, o.y != null ? o.y * H : H / 2);
      addObj(img);
      snapshot();
    });
  }

  /* ---------- templates ---------- */
  var TEMPLATES = {
    business: function () {
      setBg({ type: 'solid', color: '#0b0b0d' }, true); setBorder(0);
      addText(lang === 'es' ? 'SU NEGOCIO' : 'YOUR BUSINESS', H * 0.2, { y: 0.36, fill: '#ffd400', batch: 1, noSelect: 1 });
      addShape('rainbow', { y: 0.55, batch: 1, noSelect: 1 });
      addText('(832) 555-0100', H * 0.1, { y: 0.7, fill: '#ffffff', font: 'Oswald', italic: false, batch: 1, noSelect: 1, done: finish });
    },
    forsale: function () {
      setBg({ type: 'solid', color: '#ee1c25' }, true); setBorder(Math.min(W, H) * 0.02, '#ffffff');
      addText(lang === 'es' ? 'SE VENDE' : 'FOR SALE', H * 0.3, { y: 0.4, fill: '#ffffff', font: 'Anton', batch: 1, noSelect: 1 });
      addText(lang === 'es' ? 'Llame hoy · (832) 555-0100' : 'Call today · (832) 555-0100', H * 0.09, { y: 0.72, fill: '#ffffff', font: 'Oswald', italic: false, batch: 1, noSelect: 1, done: finish });
    },
    open: function () {
      setBg({ type: 'grad', grad: 'sunset' }, true); setBorder(0);
      addText(lang === 'es' ? '¡ABIERTO!' : "WE'RE OPEN", H * 0.26, { y: 0.42, fill: '#ffffff', font: 'Overpass', stroke: '#14144a', sw: 12, shadow: 1, batch: 1, noSelect: 1 });
      addText(lang === 'es' ? 'Lun–Sáb · 9 am – 6 pm' : 'Mon–Sat · 9 am – 6 pm', H * 0.09, { y: 0.72, fill: '#14144a', font: 'Oswald', italic: false, batch: 1, noSelect: 1, done: finish });
    },
    parking: function () {
      setBg({ type: 'solid', color: '#ffffff' }, true); setBorder(Math.min(W, H) * 0.025, '#1d4fd8');
      var sq = addShape('rounded', { w: 0.001, y: 0.3, fill: '#1d4fd8', batch: 1, noSelect: 1 });
      sq.set({ width: H * 0.3, height: H * 0.3, rx: H * 0.04, ry: H * 0.04 });
      addText('P', H * 0.26, { y: 0.31, fill: '#ffffff', font: 'Overpass', italic: 'normal', batch: 1, noSelect: 1 });
      addText(lang === 'es' ? 'SOLO CLIENTES' : 'CUSTOMERS ONLY', H * 0.15, { y: 0.63, fill: '#1d4fd8', font: 'Overpass', batch: 1, noSelect: 1 });
      addText(lang === 'es' ? 'Los demás vehículos serán remolcados' : 'All others will be towed', H * 0.065, { y: 0.8, fill: '#0b0b0d', font: 'Oswald', italic: false, batch: 1, noSelect: 1, done: finish });
    },
    jobsite: function () {
      setBg({ type: 'solid', color: '#ffd400' }, true); setBorder(Math.min(W, H) * 0.02, '#14144a');
      addText(lang === 'es' ? 'CONSTRUCCIONES\nRAMÍREZ' : 'RAMÍREZ\nROOFING', H * 0.17, { y: 0.38, fill: '#14144a', font: 'Archivo Black', italic: 'normal', batch: 1, noSelect: 1 });
      addShape('line', { y: 0.64, fill: '#14144a', batch: 1, noSelect: 1 });
      addText(lang === 'es' ? 'Con licencia y seguro · (832) 555-0100' : 'Licensed & insured · (832) 555-0100', H * 0.07, { y: 0.76, fill: '#14144a', font: 'Oswald', italic: false, batch: 1, noSelect: 1, done: finish });
    },
    ranch: function () {
      setBg({ type: 'metal' }, true); setBorder(Math.min(W, H) * 0.02, '#0b0b0d');
      addText('RANCHO', H * 0.16, { y: 0.32, fill: '#0b0b0d', font: 'Alfa Slab One', italic: 'normal', batch: 1, noSelect: 1 });
      addText('LOS PINOS', H * 0.2, { y: 0.56, fill: '#0b0b0d', font: 'Alfa Slab One', italic: 'normal', batch: 1, noSelect: 1 });
      addIcon('star', { y: 0.81, size: 0.13, fill: '#0b0b0d', batch: 1, noSelect: 1 }); finish();
    },
    menu: function () {
      setBg({ type: 'solid', color: '#7b1fb8' }, true); setBorder(0);
      addText('MENU', H * 0.16, { y: 0.15, fill: '#ffffff', batch: 1, noSelect: 1 });
      addShape('line', { y: 0.27, fill: '#ffd400', batch: 1, noSelect: 1 });
      addText('Tacos .............. $2.50\nQuesadillas ...... $8.00\nTortas ............. $9.00\nAguas frescas ... $3.00', H * 0.075, { y: 0.6, fill: '#ffffff', font: 'Oswald', italic: false, batch: 1, noSelect: 1, done: finish });
    },
    blank: function () { setBg({ type: 'solid', color: '#ffffff' }, true); setBorder(0); finish(); }
  };
  function finish() { canvas.discardActiveObject(); canvas.requestRenderAll(); snapshot(); }
  function applyTemplate(name) {
    restoring = true;
    canvas.getObjects().slice().forEach(function (o) { if (o.name !== 'bg' && o.name !== 'border') canvas.remove(o); });
    restoring = false;
    TEMPLATES[name]();
    clearTimeout(tTpl); tTpl = setTimeout(finish, 250);   // after async text has landed
  }
  var tTpl;

  function setBg(o, quiet) {
    Object.assign(bg, o); paintBackground();
    $$('#bg-swatches button, #bg-grads button, #bg-metal').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    if (!quiet) snapshot();
  }
  function setBorder(w, c) { border.width = w; if (c) border.color = c; paintBackground(); }

  /* ---------- selection bar ---------- */
  function sel() { return canvas.getActiveObject(); }
  function isText(o) { return o && (o.type === 'i-text' || o.type === 'textbox' || o.type === 'text'); }
  function refreshSel() {
    var o = sel(), bar = $('selbar');
    bar.hidden = !o;
    $('canvas-hint').hidden = !!o;
    if (!o) { renderLayers(); return; }
    var text = isText(o);
    $$('[data-for="text"]').forEach(function (n) { n.hidden = !text; });
    $$('[data-for="image"]').forEach(function (n) { n.hidden = o.type !== 'image'; });
    $$('[data-for="fill"]').forEach(function (n) { n.hidden = o.type === 'image' || o.type === 'activeSelection'; });
    if (text) {
      $('s-font').value = o.fontFamily;
      $('s-size').value = Math.round(o.fontSize * o.scaleY);
      $('s-text').value = o.text;
      $('s-bold').setAttribute('aria-pressed', String(o.fontWeight >= 700 && o.fontFamily === 'Overpass'));
      $('s-italic').setAttribute('aria-pressed', String(o.fontStyle === 'italic'));
      $('s-stroke').value = toHex(o.stroke || '#14144a');
      $('s-sw').value = o.strokeWidth || 0;
      $('s-spacing').value = o.charSpacing || 0;
      $('s-shadow').setAttribute('aria-pressed', String(!!o.shadow));
      $$('[data-align]').forEach(function (b) { b.setAttribute('aria-pressed', String(o.textAlign === b.dataset.align)); });
    }
    if (o.type === 'image') $('s-knock').setAttribute('aria-pressed', String(!!(o.filters && o.filters.length)));
    var f = o.fill; $('s-fill').value = typeof f === 'string' ? toHex(f) : '#ffd400';
    $('s-opacity').value = Math.round((o.opacity == null ? 1 : o.opacity) * 100);
    renderLayers();
  }
  function toHex(c) {
    if (!c || typeof c !== 'string') return '#000000';
    if (c[0] === '#' && c.length === 7) return c;
    try { return '#' + new fabric.Color(c).toHex(); } catch (e) { return '#000000'; }
  }
  function each(fn) {
    var o = sel(); if (!o) return;
    (o.type === 'activeSelection' ? o.getObjects() : [o]).forEach(fn);
    canvas.requestRenderAll();
  }
  function setOnSel(props, commit) {
    each(function (o) { o.set(props); if (o.initDimensions) o.initDimensions(); o.setCoords(); });
    if (commit !== false) snapshot();
  }

  /* ---------- layers list ---------- */
  function renderLayers() {
    var list = $('ly-list'); if (!list) return;
    var objs = canvas.getObjects().filter(function (o) { return !o.excludeFromLayers; }).reverse();
    var active = canvas.getActiveObjects();
    list.innerHTML = '';
    if (!objs.length) { list.innerHTML = '<li class="empty">' + (lang === 'es' ? 'Todavía no hay nada. Escoja una plantilla o agregue texto.' : 'Nothing here yet. Pick a template or add some text.') + '</li>'; return; }
    objs.forEach(function (o) {
      var li = document.createElement('li');
      var b = document.createElement('button'); b.type = 'button';
      var label = isText(o) ? '“' + o.text.split('\n')[0].slice(0, 22) + '”' : o.type === 'image' ? (lang === 'es' ? 'Foto' : 'Photo') : o.kind === 'icon' ? (lang === 'es' ? 'Ícono' : 'Icon') : (lang === 'es' ? 'Figura' : 'Shape');
      b.innerHTML = '<span class="ly-ico" style="background:' + (typeof o.fill === 'string' ? o.fill : '#888') + '"></span><span>' + label.replace(/</g, '&lt;') + '</span>';
      if (active.indexOf(o) > -1) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { canvas.setActiveObject(o); canvas.requestRenderAll(); refreshSel(); });
      li.appendChild(b); list.appendChild(li);
    });
  }

  /* ---------- options + price ---------- */
  function signSpec() { var s = PRICING.size(opts.size); return { w: s.w, h: s.h, shape: opts.shape, sides: opts.sides, mounting: opts.mounting, finish: opts.finish }; }
  function setSize(id) {
    var oldH = H; opts.size = id; H = sizeHeight();
    if (oldH !== H) canvas.getObjects().forEach(function (o) { if (!o.excludeFromLayers) { o.set('top', o.top * H / oldH); o.setCoords(); } });
    fitView(); paintBackground();
    if (window.Sign3D) Sign3D.update(signSpec());
  }
  function syncOptionsUI() {
    $$('input[name="o-size"]').forEach(function (i) { i.checked = i.value === opts.size; });
    $$('input[name="o-shape"]').forEach(function (i) { i.checked = i.value === opts.shape; });
    $$('input[name="o-sides"]').forEach(function (i) { i.checked = +i.value === opts.sides; });
    $$('input[name="o-finish"]').forEach(function (i) { i.checked = i.value === opts.finish; });
    $('o-mount').value = opts.mounting;
    $('o-qty').value = opts.qty;
    $('o-rush').checked = opts.rush; $('o-help').checked = opts.designHelp;
    $('b-width').value = border.width ? Math.round(border.width / Math.min(W, H) * 1000) : 0;
    $('b-color').value = toHex(border.color);
  }
  function updatePrice() {
    var q = PRICING.quote(opts), s = PRICING.size(opts.size), M = PRICING.money;
    var rows = [];
    rows.push([PRICING.sizeName(opts.size, lang) + ' · ' + (opts.sides === 2 ? t('two') : t('one')), M(q.each) + ' ' + t('each')]);
    rows.push([q.qty + ' × ' + M(q.each), M(q.subtotal)]);
    if (q.discount) rows.push([t('bulk') + ' (−' + Math.round(q.off * 100) + '%)', '−' + M(q.discount)]);
    if (q.help) rows.push([t('help'), M(q.help)]);
    $('price-rows').innerHTML = rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');
    $('price-total').textContent = M(q.total);
    $('wb-size').textContent = PRICING.sizeName(opts.size, lang) + ' · ' + PRICING.shapes[opts.shape][lang];
    $('price-sticky').textContent = M(q.total);
    // bulk hint
    var next = PRICING.bulk.slice().reverse().filter(function (b) { return q.qty < b.min; })[0];
    $('bulk-hint').textContent = next ? (lang === 'es' ? 'Pida ' + next.min + ' o más y ahorre ' + Math.round(next.off * 100) + '%.' : 'Order ' + next.min + '+ and save ' + Math.round(next.off * 100) + '%.') : '';
    // per-option price tags
    $$('[data-price-size]').forEach(function (n) { n.textContent = M(PRICING.size(n.dataset.priceSize).price); });
    $$('[data-price-shape]').forEach(function (n) { var p = PRICING.shapes[n.dataset.priceShape].price; n.textContent = p ? '+' + M(p) : ''; });
    $$('[data-price-finish]').forEach(function (n) { var f = PRICING.finishes[n.dataset.priceFinish]; n.textContent = f.perSqFt ? '+' + M(Math.round(f.perSqFt * q.sqft * opts.sides * 100) / 100) : ''; });
    $('two-price').textContent = '+' + M(s.price * PRICING.twoSidedExtra);
    $$('#o-mount option').forEach(function (op) { var m = PRICING.mounting[op.value]; op.textContent = m[lang] + (m.price ? ' (+' + M(m.price) + ')' : ''); });
  }

  /* ---------- cart ---------- */
  function summaryText() {
    var parts = [PRICING.sizeName(opts.size, lang), PRICING.shapes[opts.shape][lang], opts.sides === 2 ? t('two') : t('one'), PRICING.finishes[opts.finish][lang], PRICING.mounting[opts.mounting][lang]];
    if (opts.rush) parts.push(t('rush'));
    if (opts.designHelp) parts.push(t('help'));
    return parts.join(' · ');
  }
  function addToCart() {
    canvas.discardActiveObject(); canvas.requestRenderAll();
    var thumb = exportCanvas(520).toDataURL('image/jpeg', 0.82);
    var words = canvas.getObjects().filter(isText).map(function (o) { return o.text.replace(/\n/g, ' '); }).join(' / ');
    var item = { opts: Object.assign({}, opts), thumb: thumb, words: words, summary: summaryText(), design: history[hIndex], when: Date.now() };
    if (!CART.add(item)) { alert(t('full')); return; }
    $('added-thumb').src = thumb;
    $('added-sum').textContent = summaryText();
    $('added').hidden = false; $('added').classList.add('show');
    $('added-go').focus();
  }
  function downloadProof() {
    canvas.discardActiveObject(); canvas.requestRenderAll();
    var url = exportCanvas(2400).toDataURL('image/png');
    var a = document.createElement('a'); a.href = url; a.download = 'metal-max-proof-' + opts.size + '.png';
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- uploads ---------- */
  function handleFiles(files) {
    Array.prototype.forEach.call(files, function (f) {
      if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(f.type)) { alert(t('upload')); return; }
      var r = new FileReader();
      r.onload = function () { shrink(r.result, function (url) { uploads.unshift(url); renderUploads(); addImage(url); }); };
      r.readAsDataURL(f);
    });
  }
  function shrink(url, cb) {                 // keep big phone photos manageable
    var img = new Image();
    img.onload = function () {
      var max = 1800, s = Math.min(1, max / Math.max(img.width, img.height));
      if (s === 1 && url.length < 2.5e6) return cb(url);
      var c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL(/png|gif|svg/.test(url.slice(0, 30)) ? 'image/png' : 'image/jpeg', 0.88));
    };
    img.onerror = function () { cb(url); };
    img.src = url;
  }
  function renderUploads() {
    var box = $('uploads');
    box.innerHTML = '';
    uploads.slice(0, 8).forEach(function (u) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'up-thumb';
      b.innerHTML = '<img alt="">'; b.firstChild.src = u;
      b.addEventListener('click', function () { addImage(u); });
      box.appendChild(b);
    });
  }

  /* ---------- build the UI ---------- */
  function buildUI() {
    // sizes
    $('o-sizes').innerHTML = PRICING.sizes.map(function (s) {
      var p = s.id.split('x');
      return '<input type="radio" name="o-size" id="os-' + s.id + '" value="' + s.id + '"><label for="os-' + s.id + '"><b>' + (s.en ? '4 × 8 ft' : p[0] + ' × ' + p[1]) + '</b><small data-price-size="' + s.id + '"></small></label>';
    }).join('');
    // fonts
    $('font-list').innerHTML = FONTS.map(function (f) {
      return '<button type="button" class="font-btn" data-font="' + f.f + '" style="font-family:\'' + f.f + '\';font-weight:' + f.w + ';font-style:' + (f.i || 'normal') + '">' + f.label + '</button>';
    }).join('');
    $('s-font').innerHTML = FONTS.map(function (f) { return '<option value="' + f.f + '">' + f.label + '</option>'; }).join('');
    // swatches
    var sw = PALETTE.map(function (c) { return '<button type="button" class="sw" data-c="' + c + '" style="--c:' + c + '" aria-label="' + c + '"></button>'; }).join('');
    $('bg-swatches').innerHTML = sw; $('fill-swatches').innerHTML = sw;
    $('bg-grads').innerHTML = Object.keys(GRADS).map(function (g) {
      return '<button type="button" class="grad" data-g="' + g + '" style="background:linear-gradient(90deg,' + GRADS[g].join(',') + ')" aria-label="' + g + '"></button>';
    }).join('');
    // icons
    $('icon-list').innerHTML = Object.keys(ICONS).map(function (k) {
      return '<button type="button" class="ico-btn" data-icon="' + k + '" aria-label="' + k + '"><svg viewBox="0 0 24 24"><path d="' + ICONS[k] + '" fill="currentColor"/></svg></button>';
    }).join('');
    // templates
    $$('.tpl').forEach(function (b) { b.addEventListener('click', function () { applyTemplate(b.dataset.tpl); }); });
  }

  function wire() {
    // tool tabs
    $$('.tool-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.tool-tabs button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
        $$('.tool-panel').forEach(function (p) { p.hidden = p.id !== b.getAttribute('aria-controls'); });
      });
    });
    // text tools
    $('add-heading').addEventListener('click', function () { addText(t('heading'), H * 0.18); });
    $('add-sub').addEventListener('click', function () { addText(t('sub'), H * 0.09, { font: 'Oswald', italic: false }); });
    $('add-small').addEventListener('click', function () { addText(t('small'), H * 0.06, { font: 'Overpass', italic: false, weight: 800 }); });
    $('font-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-font]'); if (!b) return;
      var f = FONTS.filter(function (x) { return x.f === b.dataset.font; })[0];
      var o = sel();
      if (isText(o)) loadFont(f.f, f.w, function () { setOnSel({ fontFamily: f.f, fontWeight: f.w, fontStyle: f.i || 'normal' }); refreshSel(); });
      else addText(t('heading'), H * 0.16, { font: f.f });
    });
    // shapes + icons
    $$('[data-shape]').forEach(function (b) { b.addEventListener('click', function () { addShape(b.dataset.shape); }); });
    $('icon-list').addEventListener('click', function (e) { var b = e.target.closest('[data-icon]'); if (b) addIcon(b.dataset.icon); });
    // uploads
    $('file').addEventListener('change', function () { handleFiles(this.files); this.value = ''; });
    var drop = $('drop');
    ['dragenter', 'dragover'].forEach(function (ev) { document.addEventListener(ev, function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') > -1) { e.preventDefault(); drop.classList.add('over'); $('canvas-wrap').classList.add('over'); } }); });
    ['dragleave', 'drop'].forEach(function (ev) { document.addEventListener(ev, function (e) { if (ev === 'drop' || !e.relatedTarget) { drop.classList.remove('over'); $('canvas-wrap').classList.remove('over'); } }); });
    document.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files.length) { e.preventDefault(); handleFiles(e.dataTransfer.files); } });
    document.addEventListener('paste', function (e) {
      if (/input|textarea/i.test(document.activeElement.tagName) || (sel() && sel().isEditing)) return;
      var items = e.clipboardData && e.clipboardData.files; if (items && items.length) handleFiles(items);
    });
    // background
    $('bg-swatches').addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (b) { setBg({ type: 'solid', color: b.dataset.c }); b.setAttribute('aria-pressed', 'true'); } });
    $('bg-custom').addEventListener('input', function () { setBg({ type: 'solid', color: this.value }, true); });
    $('bg-custom').addEventListener('change', function () { snapshot(); });
    $('bg-grads').addEventListener('click', function (e) { var b = e.target.closest('[data-g]'); if (b) { setBg({ type: 'grad', grad: b.dataset.g }); b.setAttribute('aria-pressed', 'true'); } });
    $('bg-turn').addEventListener('click', function () { if (bg.type === 'grad') setBg({ angle: bg.angle ? 0 : 90 }); });
    $('bg-metal').addEventListener('click', function () { setBg({ type: 'metal' }); this.setAttribute('aria-pressed', 'true'); });
    $('b-width').addEventListener('input', function () { setBorder(this.value / 1000 * Math.min(W, H)); });
    $('b-width').addEventListener('change', snapshot);
    $('b-color').addEventListener('input', function () { setBorder(border.width, this.value); });
    $('b-color').addEventListener('change', snapshot);

    // selection bar
    $('s-text').addEventListener('input', function () { var o = sel(); if (isText(o)) { o.set('text', this.value); o.initDimensions(); o.setCoords(); canvas.requestRenderAll(); } });
    $('s-text').addEventListener('change', snapshot);
    $('s-font').addEventListener('change', function () { var f = FONTS.filter(function (x) { return x.f === $('s-font').value; })[0]; loadFont(f.f, f.w, function () { setOnSel({ fontFamily: f.f, fontWeight: f.w, fontStyle: f.i || 'normal' }); }); });
    $('s-size').addEventListener('input', function () { var o = sel(); if (isText(o) && this.value > 4) { o.set({ fontSize: this.value / o.scaleY }); o.setCoords(); canvas.requestRenderAll(); } });
    $('s-size').addEventListener('change', snapshot);
    $('s-bold').addEventListener('click', function () { var o = sel(); if (!isText(o)) return; var f = FONTS.filter(function (x) { return x.f === o.fontFamily; })[0]; if (o.fontFamily !== 'Overpass') return; setOnSel({ fontWeight: o.fontWeight >= 900 ? 600 : 900 }); refreshSel(); });
    $('s-italic').addEventListener('click', function () { var o = sel(); if (isText(o)) { setOnSel({ fontStyle: o.fontStyle === 'italic' ? 'normal' : 'italic' }); refreshSel(); } });
    $$('[data-align]').forEach(function (b) { b.addEventListener('click', function () { setOnSel({ textAlign: b.dataset.align }); refreshSel(); }); });
    $('s-stroke').addEventListener('input', function () { setOnSel({ stroke: this.value, strokeWidth: Math.max(+$('s-sw').value, 4) }, false); $('s-sw').value = Math.max(+$('s-sw').value, 4); });
    $('s-stroke').addEventListener('change', snapshot);
    $('s-sw').addEventListener('input', function () { setOnSel({ strokeWidth: +this.value, stroke: $('s-stroke').value }, false); });
    $('s-sw').addEventListener('change', snapshot);
    $('s-spacing').addEventListener('input', function () { setOnSel({ charSpacing: +this.value }, false); });
    $('s-spacing').addEventListener('change', snapshot);
    $('s-shadow').addEventListener('click', function () { var o = sel(); if (!o) return; setOnSel({ shadow: o.shadow ? null : new fabric.Shadow({ color: 'rgba(0,0,0,.45)', blur: 12, offsetX: 4, offsetY: 6 }) }); refreshSel(); });
    $('s-fill').addEventListener('input', function () { setOnSel({ fill: this.value }, false); });
    $('s-fill').addEventListener('change', snapshot);
    $('fill-swatches').addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (b) { setOnSel({ fill: b.dataset.c }); refreshSel(); } });
    $('s-opacity').addEventListener('input', function () { setOnSel({ opacity: this.value / 100 }, false); });
    $('s-opacity').addEventListener('change', snapshot);
    $('s-knock').addEventListener('click', function () {
      var o = sel(); if (!o || o.type !== 'image') return;
      o.filters = o.filters && o.filters.length ? [] : [new fabric.Image.filters.RemoveColor({ color: '#ffffff', distance: 0.14 })];
      o.applyFilters(); canvas.requestRenderAll(); snapshot(); refreshSel();
    });
    $('s-front').addEventListener('click', function () { each(function (o) { canvas.bringForward(o); }); snapshot(); });
    $('s-back').addEventListener('click', function () { each(function (o) { var i = canvas.getObjects().indexOf(o); var floor = special('border') ? 2 : 1; if (i > floor) canvas.sendBackwards(o); }); snapshot(); });
    $('s-center').addEventListener('click', function () { var o = sel(); if (o) { o.setPositionByOrigin(new fabric.Point(W / 2, o.getCenterPoint().y), 'center', 'center'); o.setCoords(); canvas.requestRenderAll(); snapshot(); } });
    $('s-middle').addEventListener('click', function () { var o = sel(); if (o) { o.setPositionByOrigin(new fabric.Point(o.getCenterPoint().x, H / 2), 'center', 'center'); o.setCoords(); canvas.requestRenderAll(); snapshot(); } });
    $('s-dup').addEventListener('click', duplicate);
    $('s-del').addEventListener('click', removeSel);

    // history + misc
    $('undo').addEventListener('click', function () { if (hIndex > 0) { hIndex--; restore(history[hIndex]); } });
    $('redo').addEventListener('click', function () { if (hIndex < history.length - 1) { hIndex++; restore(history[hIndex]); } });
    $('clear').addEventListener('click', function () { if (confirm(t('confirmClear'))) applyTemplate('blank'); });
    $('guides').addEventListener('click', function () { showGuides = !showGuides; this.setAttribute('aria-pressed', String(showGuides)); canvas.requestRenderAll(); });
    document.addEventListener('keydown', function (e) {
      var o = sel(), typing = /input|textarea|select/i.test(document.activeElement.tagName) || (o && o.isEditing);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { if (typing) return; e.preventDefault(); $(e.shiftKey ? 'redo' : 'undo').click(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && o && !typing) { e.preventDefault(); duplicate(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && o && !typing) { e.preventDefault(); removeSel(); }
      else if (o && !typing && /^Arrow/.test(e.key)) {
        e.preventDefault(); var d = e.shiftKey ? 20 : 4;
        each(function (x) { x.set({ left: x.left + (e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0), top: x.top + (e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0) }); x.setCoords(); });
        clearTimeout(tKey); tKey = setTimeout(snapshot, 300);
      }
    });

    // options
    $('o-sizes').addEventListener('change', function (e) { setSize(e.target.value); after(); });
    $$('input[name="o-shape"]').forEach(function (i) { i.addEventListener('change', function () { opts.shape = this.value; paintBackground(); Sign3D && Sign3D.update(signSpec()); after(); }); });
    $$('input[name="o-sides"]').forEach(function (i) { i.addEventListener('change', function () { opts.sides = +this.value; Sign3D && Sign3D.update(signSpec()); after(); }); });
    $$('input[name="o-finish"]').forEach(function (i) { i.addEventListener('change', function () { opts.finish = this.value; Sign3D && Sign3D.update(signSpec()); after(); }); });
    $('o-mount').addEventListener('change', function () { opts.mounting = this.value; canvas.requestRenderAll(); Sign3D && Sign3D.update(signSpec()); if (this.value === 'stake' || this.value === 'post' || this.value === 'bracket') pickScene('post'); else if (this.value === 'standoffs') pickScene('wall'); after(); });
    $('o-qty').addEventListener('input', function () { var v = parseInt(this.value, 10); if (v > 999) this.value = v = 999; if (v >= 1) { opts.qty = v; updatePrice(); } });
    $('o-qty').addEventListener('change', function () { var v = Math.max(1, Math.min(999, parseInt(this.value, 10) || 1)); this.value = opts.qty = v; after(); });
    $('q-minus').addEventListener('click', function () { opts.qty = Math.max(1, opts.qty - 1); $('o-qty').value = opts.qty; after(); });
    $('q-plus').addEventListener('click', function () { opts.qty = Math.min(999, opts.qty + 1); $('o-qty').value = opts.qty; after(); });
    $('o-rush').addEventListener('change', function () { opts.rush = this.checked; after(); });
    $('o-help').addEventListener('change', function () { opts.designHelp = this.checked; after(); });

    $('add-cart').addEventListener('click', addToCart);
    $('add-cart-2').addEventListener('click', addToCart);
    $('proof').addEventListener('click', downloadProof);
    $('added-close').addEventListener('click', function () { $('added').classList.remove('show'); $('added').hidden = true; });
    $('added').addEventListener('click', function (e) { if (e.target === this) $('added-close').click(); });

    // 3D controls
    $$('[data-scene]').forEach(function (b) { b.addEventListener('click', function () { pickScene(b.dataset.scene); }); });
    $('v-rotate').addEventListener('click', function () { Sign3D.toggleRotate(); });
    $('v-flip').addEventListener('click', function () { Sign3D.flip(); });
    $('v-reset').addEventListener('click', function () { Sign3D.reset(); });
    $('v-big').addEventListener('click', function () {
      var on = !$('studio').classList.contains('big3d');
      $('studio').classList.toggle('big3d', on); this.setAttribute('aria-pressed', String(on));
      setTimeout(function () { Sign3D.wake(); fitView(); }, 30);
      if (on) $('view3d').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    window.addEventListener('resize', function () { clearTimeout(tRes); tRes = setTimeout(fitView, 120); });
  }
  var tKey, tRes;
  function after() { updatePrice(); snapshot(); }
  function pickScene(name) {
    $$('[data-scene]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.scene === name)); });
    if (window.Sign3D) Sign3D.setScene(name);
  }
  function duplicate() {
    var o = sel(); if (!o) return;
    o.clone(function (c) {
      canvas.discardActiveObject();
      c.set({ left: c.left + 30, top: c.top + 30, evented: true });
      if (c.type === 'activeSelection') { c.canvas = canvas; c.forEachObject(function (x) { canvas.add(x); }); c.setCoords(); }
      else canvas.add(c);
      canvas.setActiveObject(c); canvas.requestRenderAll(); snapshot();
    }, KEEP);
  }
  function removeSel() {
    var o = sel(); if (!o || o.isEditing) return;
    (o.type === 'activeSelection' ? o.getObjects() : [o]).forEach(function (x) { canvas.remove(x); });
    canvas.discardActiveObject(); canvas.requestRenderAll(); snapshot(); refreshSel();
  }

  /* ---------- start ---------- */
  function start() {
    fabric.Object.prototype.set({
      transparentCorners: false, cornerColor: '#ffd400', cornerStrokeColor: '#14144a', borderColor: '#ff0a9c',
      cornerStyle: 'circle', cornerSize: 14, padding: 6, borderScaleFactor: 2
    });
    fabric.Object.prototype.objectCaching = true;
    H = sizeHeight();
    canvas = new fabric.Canvas('design', { preserveObjectStacking: true, selection: true, backgroundColor: 'transparent', enableRetinaScaling: true, controlsAboveOverlay: true });
    canvas.on('after:render', drawOverlay);
    canvas.on('after:render', drawSnap);
    canvas.on('object:moving', snap);
    canvas.on('mouse:up', function () { if (guide.x || guide.y) { guide = { x: false, y: false }; canvas.requestRenderAll(); } });
    canvas.on('object:modified', function () { snapshot(); refreshSel(); });
    canvas.on('text:changed', function (e) { if (sel() === e.target) $('s-text').value = e.target.text; push3D(); });
    canvas.on('text:editing:exited', snapshot);
    canvas.on('selection:created', refreshSel);
    canvas.on('selection:updated', refreshSel);
    canvas.on('selection:cleared', refreshSel);

    buildUI(); wire();
    fitView();

    var el3d = $('view3d-canvas');
    if (window.Sign3D) {
      try { Sign3D.init(el3d); Sign3D.update(signSpec()); }
      catch (e) { el3d.innerHTML = '<p class="no3d">' + (lang === 'es' ? 'Su navegador no puede mostrar la vista 3D.' : 'Your browser can\'t show the 3D view.') + '</p>'; }
      Sign3D.onState && Sign3D.onState(function (s) { $('v-rotate').setAttribute('aria-pressed', String(s.autoRotate)); });
    }

    var saved = null;
    try { saved = localStorage.getItem('sp-design'); } catch (e) {}
    // preload fonts so templates draw with the right letters
    Promise.all(FONTS.map(function (f) { return document.fonts ? document.fonts.load(f.w + ' 40px "' + f.f + '"').catch(function () {}) : null; })).then(function () {
      if (saved) { try { history = [saved]; hIndex = 0; restore(saved); return; } catch (e) {} }
      paintBackground(); syncOptionsUI(); updatePrice();
      applyTemplate('business');
    });

    SP.onLang(function (l) {
      lang = l; updatePrice(); renderLayers();
      $('canvas-hint').hidden = !!sel();
    });
  }

  if (window.fabric) start();
  else document.getElementById('canvas-wrap').innerHTML = '<p class="no3d">The designer could not load. Please refresh the page.</p>';
})();
