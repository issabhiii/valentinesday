/**
 * Dot Grid - vanilla port of React Bits DotGrid.
 * Inertia phase simulated in requestAnimationFrame (no InertiaPlugin).
 */
(function () {
  var wrap = document.getElementById('dot-grid-wrap');
  var pageGreeting = document.getElementById('pageGreeting');
  if (!wrap || !pageGreeting) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'dot-grid__canvas';
  wrap.appendChild(canvas);

  var dots = [];
  var inertiaDots = []; // { dot, targetX, targetY } during "push" phase
  var pointer = { x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0, lastTime: 0 };
  var rafId = null;
  var boundThrottledMove = null;

  var settings = {
    dotSize: 12,
    gap: 16,
    baseColor: '#a51212',
    activeColor: '#ff29f8',
    proximity: 65,
    speedTrigger: 160,
    shockRadius: 180,
    shockStrength: 4,
    maxSpeed: 5000,
    resistance: 950,
    returnDuration: 1.5,
    movePushScale: 0.32,
    clickPushScale: 0.85
  };

  function hexToRgb(hex) {
    var m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16)
    };
  }

  var baseRgb = hexToRgb(settings.baseColor);
  var activeRgb = hexToRgb(settings.activeColor);
  var proxSq = settings.proximity * settings.proximity;

  // Resistance -> lerp factor per frame (~60fps). Higher resistance = faster settle, stiffer feel.
  var inertiaFactor = 1 - Math.exp(-(settings.resistance / 3200));

  function buildGrid() {
    var width = wrap.clientWidth;
    var height = wrap.clientHeight;
    if (width === 0 || height === 0) return;

    inertiaDots = [];
    var dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    var cols = Math.floor((width + settings.gap) / (settings.dotSize + settings.gap));
    var rows = Math.floor((height + settings.gap) / (settings.dotSize + settings.gap));
    var cell = settings.dotSize + settings.gap;
    var gridW = cell * cols - settings.gap;
    var gridH = cell * rows - settings.gap;
    var extraX = width - gridW;
    var extraY = height - gridH;
    var startX = extraX / 2 + settings.dotSize / 2;
    var startY = extraY / 2 + settings.dotSize / 2;

    dots = [];
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        dots.push({
          cx: startX + x * cell,
          cy: startY + y * cell,
          xOffset: 0,
          yOffset: 0,
          _inertiaApplied: false
        });
      }
    }
  }

  function runInertiaPhase() {
    var i = 0;
    var threshold = 0.5;
    while (i < inertiaDots.length) {
      var item = inertiaDots[i];
      var d = item.dot;
      var tx = item.targetX;
      var ty = item.targetY;
      d.xOffset += (tx - d.xOffset) * inertiaFactor;
      d.yOffset += (ty - d.yOffset) * inertiaFactor;
      var dx = Math.abs(d.xOffset - tx);
      var dy = Math.abs(d.yOffset - ty);
      if (dx < threshold && dy < threshold) {
        inertiaDots.splice(i, 1);
        d.xOffset = tx;
        d.yOffset = ty;
        if (typeof gsap !== 'undefined') {
          gsap.killTweensOf(d);
          gsap.to(d, {
            xOffset: 0,
            yOffset: 0,
            duration: settings.returnDuration,
            ease: 'elastic.out(1, 0.75)',
            onComplete: function () {
              d._inertiaApplied = false;
            }
          });
        } else {
          d.xOffset = 0;
          d.yOffset = 0;
          d._inertiaApplied = false;
        }
      } else {
        i++;
      }
    }
  }

  function draw() {
    if (!canvas.getContext) return;
    runInertiaPhase();

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    var px = pointer.x;
    var py = pointer.y;

    for (var i = 0; i < dots.length; i++) {
      var dot = dots[i];
      var ox = dot.cx + dot.xOffset;
      var oy = dot.cy + dot.yOffset;
      var dx = dot.cx - px;
      var dy = dot.cy - py;
      var dsq = dx * dx + dy * dy;

      var color = settings.baseColor;
      if (dsq <= proxSq) {
        var dist = Math.sqrt(dsq);
        var t = 1 - dist / settings.proximity;
        var r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
        var g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
        var b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
        color = 'rgb(' + r + ',' + g + ',' + b + ')';
      }

      ctx.beginPath();
      ctx.arc(ox, oy, settings.dotSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  function throttle(fn, limit) {
    var last = 0;
    return function () {
      var now = performance.now();
      if (now - last >= limit) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  function onMove(e) {
    var now = performance.now();
    var dt = pointer.lastTime ? now - pointer.lastTime : 16;
    var dx = e.clientX - pointer.lastX;
    var dy = e.clientY - pointer.lastY;
    var vx = (dx / dt) * 1000;
    var vy = (dy / dt) * 1000;
    var speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > settings.maxSpeed) {
      var scale = settings.maxSpeed / speed;
      vx *= scale;
      vy *= scale;
      speed = settings.maxSpeed;
    }
    pointer.lastTime = now;
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;
    pointer.vx = vx;
    pointer.vy = vy;

    var rect = wrap.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;

    if (speed <= settings.speedTrigger) return;

    for (var i = 0; i < dots.length; i++) {
      var dot = dots[i];
      var dist = Math.sqrt((dot.cx - pointer.x) * (dot.cx - pointer.x) + (dot.cy - pointer.y) * (dot.cy - pointer.y));
      if (dist < settings.proximity && !dot._inertiaApplied) {
        dot._inertiaApplied = true;
        if (typeof gsap !== 'undefined') gsap.killTweensOf(dot);
        var pushX = (dot.cx - pointer.x + vx * 0.005) * settings.movePushScale;
        var pushY = (dot.cy - pointer.y + vy * 0.005) * settings.movePushScale;
        inertiaDots.push({ dot: dot, targetX: pushX, targetY: pushY });
      }
    }
  }

  function onClick(e) {
    var rect = wrap.getBoundingClientRect();
    var cx = e.clientX - rect.left;
    var cy = e.clientY - rect.top;

    for (var i = 0; i < dots.length; i++) {
      var dot = dots[i];
      var dist = Math.sqrt((dot.cx - cx) * (dot.cx - cx) + (dot.cy - cy) * (dot.cy - cy));
      if (dist < settings.shockRadius && !dot._inertiaApplied) {
        dot._inertiaApplied = true;
        if (typeof gsap !== 'undefined') gsap.killTweensOf(dot);
        var falloff = Math.max(0, 1 - dist / settings.shockRadius);
        var pushX = (dot.cx - cx) * settings.shockStrength * falloff * settings.clickPushScale;
        var pushY = (dot.cy - cy) * settings.shockStrength * falloff * settings.clickPushScale;
        inertiaDots.push({ dot: dot, targetX: pushX, targetY: pushY });
      }
    }
  }

  function start() {
    if (!pageGreeting.classList.contains('visible')) return;
    buildGrid();
    draw();
    boundThrottledMove = throttle(onMove, 50);
    pageGreeting.addEventListener('mousemove', boundThrottledMove, { passive: true });
    pageGreeting.addEventListener('click', onClick);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    inertiaDots = [];
    if (boundThrottledMove) {
      pageGreeting.removeEventListener('mousemove', boundThrottledMove);
      boundThrottledMove = null;
    }
    pageGreeting.removeEventListener('click', onClick);
  }

  var resizeTimeout;
  function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      buildGrid();
    }, 150);
  }

  var observer = new MutationObserver(function () {
    if (pageGreeting.classList.contains('visible')) {
      start();
      window.addEventListener('resize', onResize);
    } else {
      stop();
      window.removeEventListener('resize', onResize);
    }
  });
  observer.observe(pageGreeting, { attributes: true, attributeFilter: ['class'] });

  if (pageGreeting.classList.contains('visible')) {
    start();
    window.addEventListener('resize', onResize);
  }
})();
