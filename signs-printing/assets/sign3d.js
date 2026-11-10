/* Live 3D preview of a Metal Max panel (three.js r147).
   Sizes are in inches; 1 scene unit = 1 inch. */
(function () {
  var T = window.THREE;
  if (!T) return;

  var THICK = 0.16;                 // 3 mm panel, a touch thicker so the edge reads
  var S = {};                       // state
  var el, renderer, scene, camera, controls, pmrem;
  var group = new T.Group();        // everything that turns with the sign
  var signGroup = new T.Group();    // the panel itself (flips)
  var setGroup = new T.Group();     // scene props (wall, post, fence, floor)
  var frontMat, backPrintMat, backMetalMat, edgeMat, chromeMat, capMat;
  var frontTex = null;
  var running = false, visible = false, flipTo = 0;

  /* ---------- procedural textures ---------- */
  function canvasTex(w, h, draw, repeat) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = 8;
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    return t;
  }
  function brushed() {
    return canvasTex(512, 512, function (g, w, h) {
      g.fillStyle = '#c9ccd2'; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 2600; i++) {
        var y = Math.random() * h, a = Math.random() * 0.09;
        g.strokeStyle = (Math.random() > .5 ? 'rgba(255,255,255,' : 'rgba(60,64,72,') + a + ')';
        g.lineWidth = Math.random() * 1.4;
        g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (Math.random() - .5) * 2); g.stroke();
      }
    });
  }
  function brick() {
    return canvasTex(1024, 1024, function (g, w, h) {
      g.fillStyle = '#cfc4b6'; g.fillRect(0, 0, w, h);
      var bw = 120, bh = 52, gap = 8;
      for (var r = 0; r * (bh + gap) < h; r++) {
        for (var x = (r % 2 ? -(bw + gap) / 2 : 0); x < w; x += bw + gap) {
          var v = Math.random();
          g.fillStyle = 'hsl(' + (12 + v * 8) + ',' + (45 + v * 15) + '%,' + (28 + v * 11) + '%)';
          g.fillRect(x, r * (bh + gap) + gap / 2, bw, bh);
          g.fillStyle = 'rgba(0,0,0,' + (Math.random() * .12) + ')';
          g.fillRect(x, r * (bh + gap) + gap / 2 + bh * .6, bw, bh * .4);
        }
      }
    }, [3, 3]);
  }
  function chainlink() {
    var t = canvasTex(256, 256, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      g.strokeStyle = '#9aa0a8'; g.lineWidth = 7; g.lineCap = 'round';
      g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.stroke();
    }, [14, 8]);
    return t;
  }
  function grass() {
    return canvasTex(512, 512, function (g, w, h) {
      g.fillStyle = '#3f7a2a'; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 9000; i++) {
        g.fillStyle = 'hsla(' + (90 + Math.random() * 30) + ',55%,' + (22 + Math.random() * 26) + '%,.9)';
        g.fillRect(Math.random() * w, Math.random() * h, 1.5, 3 + Math.random() * 5);
      }
    }, [8, 8]);
  }
  function concrete() {
    return canvasTex(512, 512, function (g, w, h) {
      g.fillStyle = '#8b8d90'; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 14000; i++) {
        var l = 40 + Math.random() * 30;
        g.fillStyle = 'hsla(30,4%,' + l + '%,.35)';
        g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
    }, [6, 6]);
  }

  /* ---------- panel geometry ---------- */
  function outline(w, h, shape) {
    var s = new T.Shape(), x = -w / 2, y = -h / 2;
    if (shape === 'oval') {
      s.absellipse(0, 0, w / 2, h / 2, 0, Math.PI * 2, false, 0);
      return s;
    }
    var r = shape === 'rounded' ? Math.min(w, h) * 0.08 : 0.12;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  function holeSpots(w, h, shape, mounting) {
    if (mounting === 'none' || mounting === 'stake') return [];
    var i = Math.max(0.7, Math.min(w, h) * 0.045);
    if (mounting === 'bracket' || mounting === 'post' || shape === 'oval') return [[0, h / 2 - i * 1.2], [0, -h / 2 + i * 1.2]];
    return [[-w / 2 + i, h / 2 - i], [w / 2 - i, h / 2 - i], [-w / 2 + i, -h / 2 + i], [w / 2 - i, -h / 2 + i]];
  }
  function planarUV(geo, w, h) {
    var p = geo.attributes.position, uv = geo.attributes.uv;
    for (var i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
    uv.needsUpdate = true;
  }

  function buildSign() {
    while (signGroup.children.length) { var c = signGroup.children.pop(); if (c.geometry) c.geometry.dispose(); }
    var w = S.w, h = S.h;
    var shp = outline(w, h, S.shape);
    var spots = holeSpots(w, h, S.shape, S.mounting);
    var hr = Math.max(0.16, Math.min(w, h) * 0.008);
    spots.forEach(function (p) { var hp = new T.Path(); hp.absarc(p[0], p[1], hr, 0, Math.PI * 2, true); shp.holes.push(hp); });

    var edge = new T.Mesh(new T.ExtrudeGeometry(shp, { depth: THICK, bevelEnabled: false, curveSegments: 48 }), [capMat, edgeMat]);
    edge.castShadow = true; edge.receiveShadow = true;
    edge.position.z = -THICK / 2;
    signGroup.add(edge);

    var fg = new T.ShapeGeometry(shp, 48); planarUV(fg, w, h);
    var front = new T.Mesh(fg, frontMat); front.position.z = THICK / 2 + 0.012; front.castShadow = true;
    signGroup.add(front);

    var bg = new T.ShapeGeometry(shp, 48); planarUV(bg, w, h);
    var back = new T.Mesh(bg, S.sides === 2 ? frontMat : backMetalMat);
    back.rotation.y = Math.PI; back.position.z = -THICK / 2 - 0.012;
    signGroup.add(back);

    // hardware
    spots.forEach(function (p) {
      if (S.mounting === 'standoffs') {
        var cap = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.5, 32), chromeMat);
        cap.rotation.x = Math.PI / 2; cap.position.set(p[0], p[1], THICK / 2 + 0.25); cap.castShadow = true;
        var barrel = new T.Mesh(new T.CylinderGeometry(0.36, 0.36, 1.1, 32), chromeMat);
        barrel.rotation.x = Math.PI / 2; barrel.position.set(p[0], p[1], -THICK / 2 - 0.55); barrel.castShadow = true;
        signGroup.add(cap, barrel);
      } else if (S.scene !== 'studio') {
        var head = new T.Mesh(new T.CylinderGeometry(hr * 1.9, hr * 1.9, 0.08, 24), chromeMat);
        head.rotation.x = Math.PI / 2; head.position.set(p[0], p[1], THICK / 2 + 0.04);
        signGroup.add(head);
      }
    });
    if (S.mounting === 'stake' && S.scene !== 'wall') {
      [-w * 0.22, w * 0.22].forEach(function (x) {
        var wire = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 14, 12), chromeMat);
        wire.position.set(x, -h / 2 - 5, 0); signGroup.add(wire);
      });
    }
  }

  /* ---------- scenes ---------- */
  function clearSet() {
    while (setGroup.children.length) { var c = setGroup.children.pop(); if (c.geometry) c.geometry.dispose(); }
  }
  function buildSet() {
    clearSet();
    var w = S.w, h = S.h, big = Math.max(w, h);
    var floorY = -h / 2 - big * 0.35;
    signGroup.position.set(0, 0, 0);
    if (S.scene === 'studio') {
      scene.background = new T.Color('#0b0b0d');
      scene.fog = null;
      var floor = new T.Mesh(new T.PlaneGeometry(big * 12, big * 12), new T.ShadowMaterial({ opacity: 0.45 }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = floorY; floor.receiveShadow = true;
      setGroup.add(floor);
    } else if (S.scene === 'wall') {
      scene.background = new T.Color('#16161a');
      var bt = brick(); bt.repeat.set(big * 4 / 64, big * 3 / 64);
      var wall = new T.Mesh(new T.PlaneGeometry(big * 4, big * 3), new T.MeshStandardMaterial({ map: bt, roughness: 0.92 }));
      wall.position.z = S.mounting === 'standoffs' ? -1.25 : -THICK / 2 - 0.01;
      wall.receiveShadow = true; setGroup.add(wall);
    } else if (S.scene === 'post') {
      scene.background = new T.Color('#9ec9ee');
      var gy = -h / 2 - Math.max(30, h * 1.1);
      var g = new T.Mesh(new T.PlaneGeometry(big * 20, big * 20), new T.MeshStandardMaterial({ map: grass(), roughness: 1 }));
      g.rotation.x = -Math.PI / 2; g.position.y = gy; g.receiveShadow = true; setGroup.add(g);
      if (S.mounting === 'stake') {
        signGroup.position.y = 0; g.position.y = -h / 2 - 9;
      } else {
        var top = h / 2 + 1.5, len = top - gy;
        var post = new T.Mesh(new T.BoxGeometry(2.5, len, 2.5), new T.MeshStandardMaterial({ color: '#8d9199', metalness: 0.85, roughness: 0.35 }));
        post.position.set(0, gy + len / 2, -THICK / 2 - 1.4); post.castShadow = true; post.receiveShadow = true; setGroup.add(post);
      }
      scene.fog = new T.Fog('#9ec9ee', big * 4, big * 14);
    } else if (S.scene === 'fence') {
      scene.background = new T.Color('#f2c98a');
      var fy = -h / 2 - big * 0.5;
      var ct = chainlink(); ct.repeat.set(big / 3, big / 4);
      var mesh = new T.Mesh(new T.PlaneGeometry(big * 5, big * 2.2), new T.MeshStandardMaterial({ map: ct, transparent: true, alphaTest: 0.3, metalness: 0.6, roughness: 0.4, side: T.DoubleSide }));
      mesh.position.set(0, fy + big * 1.1, -THICK / 2 - 0.15); setGroup.add(mesh);
      [-big * 1.1, big * 1.1].forEach(function (x) {
        var p = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, big * 2.3, 20), new T.MeshStandardMaterial({ color: '#7d8189', metalness: .9, roughness: .3 }));
        p.position.set(x, fy + big * 1.15, -THICK / 2 - 0.6); p.castShadow = true; setGroup.add(p);
      });
      var dirt = new T.Mesh(new T.PlaneGeometry(big * 20, big * 20), new T.MeshStandardMaterial({ map: concrete(), color: '#b8986a', roughness: 1 }));
      dirt.rotation.x = -Math.PI / 2; dirt.position.y = fy; dirt.receiveShadow = true; setGroup.add(dirt);
      scene.fog = new T.Fog('#f2c98a', big * 4, big * 12);
    }
    frame();
  }

  function frame() {
    var big = Math.max(S.w, S.h);
    var tan = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
    var pad = S.scene === 'studio' ? 1.5 : 1.75;
    var dist = Math.max((S.h * pad / 2) / tan, (S.w * pad / 2) / (tan * camera.aspect));
    camera.near = Math.max(0.5, big * 0.02); camera.far = big * 60; camera.updateProjectionMatrix();
    camera.position.set(big * 0.28, S.h * 0.08, dist);
    controls.target.set(0, 0, 0);
    controls.minDistance = big * 0.35; controls.maxDistance = big * 4;
    var key = scene.getObjectByName('key');
    key.position.set(big * 0.8, big * 1.4, big * 1.6);
    var sc = key.shadow.camera; sc.left = sc.bottom = -big * 1.5; sc.right = sc.top = big * 1.5; sc.far = big * 8; sc.updateProjectionMatrix();
    controls.update();
  }

  /* ---------- setup ---------- */
  function init(container) {
    el = container;
    renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.NoToneMapping;           // keep printed colours true
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    scene = new T.Scene();
    pmrem = new T.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new T.RoomEnvironment(), 0.04).texture;

    camera = new T.PerspectiveCamera(32, 1, 0.1, 5000);
    controls = new T.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.autoRotate = true; controls.autoRotateSpeed = 1.2;
    controls.minPolarAngle = 0.25; controls.maxPolarAngle = Math.PI * 0.62;
    controls.enablePan = false;
    controls.addEventListener('start', function () { controls.autoRotate = false; sync(); });

    scene.add(new T.HemisphereLight('#ffffff', '#444455', 0.35));
    var key = new T.DirectionalLight('#ffffff', 1.1); key.name = 'key';
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004;
    scene.add(key);
    var pink = new T.PointLight('#ff0a9c', 0.6, 0, 2); pink.position.set(-60, 20, -40); scene.add(pink);
    var cyan = new T.PointLight('#00aeef', 0.6, 0, 2); cyan.position.set(60, -10, -40); scene.add(cyan);

    frontMat = new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.32, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.15, envMapIntensity: 0.35, emissive: '#ffffff', emissiveIntensity: 0.12 });
    backMetalMat = new T.MeshStandardMaterial({ map: brushed(), metalness: 0.95, roughness: 0.32, envMapIntensity: 1.2 });
    edgeMat = new T.MeshStandardMaterial({ color: '#b9bcc2', metalness: 0.9, roughness: 0.28 });
    capMat = new T.MeshBasicMaterial({ color: '#2a2a30' });   // hidden behind the printed faces
    chromeMat = new T.MeshStandardMaterial({ color: '#e4e6ea', metalness: 1, roughness: 0.12 });

    group.add(signGroup); scene.add(group); scene.add(setGroup);

    S = { w: 24, h: 18, shape: 'rect', sides: 1, mounting: 'holes', finish: 'gloss', scene: 'studio' };
    buildSign(); buildSet();

    new ResizeObserver(resize).observe(el); resize();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) loop(); }).observe(el);
    } else { visible = true; loop(); }
  }
  function resize() {
    var w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    var changed = Math.abs(camera.aspect - w / h) > 0.01;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (changed && S.w) frame();
  }
  function loop() {
    if (running) return; running = true;
    (function tick() {
      if (!visible || document.hidden || !el.offsetParent) { running = false; return; }
      signGroup.rotation.y += (flipTo - signGroup.rotation.y) * 0.08;
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    })();
  }
  var syncCb = function () {};
  function sync() { syncCb({ autoRotate: controls.autoRotate, scene: S.scene }); }

  /* ---------- public ---------- */
  window.Sign3D = {
    init: init,
    onState: function (fn) { syncCb = fn; },
    update: function (o) {
      var rebuild = false, reset = false;
      ['w', 'h', 'shape', 'sides', 'mounting'].forEach(function (k) { if (o[k] !== undefined && o[k] !== S[k]) { S[k] = o[k]; rebuild = true; } });
      if (o.w !== undefined || o.h !== undefined) reset = true;
      if (o.finish && o.finish !== S.finish) {
        S.finish = o.finish;
        frontMat.roughness = o.finish === 'matte' ? 0.78 : 0.3;
        frontMat.clearcoat = o.finish === 'matte' ? 0 : (o.finish === 'uv' ? 1 : 0.6);
        frontMat.needsUpdate = true;
      }
      if (rebuild) { buildSign(); if (reset) buildSet(); else if (o.mounting !== undefined) buildSet(); }
      loop();
    },
    setDesign: function (canvas) {
      if (frontTex) frontTex.dispose();
      frontTex = new T.CanvasTexture(canvas);
      frontTex.encoding = T.sRGBEncoding; frontTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      frontMat.map = frontTex; frontMat.emissiveMap = frontTex; frontMat.needsUpdate = true;
      loop();
    },
    setScene: function (name) { S.scene = name; buildSign(); buildSet(); sync(); loop(); },
    toggleRotate: function () { controls.autoRotate = !controls.autoRotate; sync(); loop(); },
    flip: function () { flipTo = flipTo ? 0 : Math.PI; loop(); },
    reset: function () { flipTo = 0; frame(); controls.autoRotate = true; sync(); loop(); },
    snapshot: function () { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/jpeg', 0.85); },
    wake: function () { resize(); loop(); }
  };
})();
