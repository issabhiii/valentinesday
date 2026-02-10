/**
 * Bouquet Builder - drag flowers from tray to canvas, arrange, delete via trash or double-click.
 * "That's perfect" saves summary and transitions to the after-bouquet screen.
 */
(function () {
  var canvas = document.getElementById('bouquetCanvas');
  var tray = document.getElementById('bouquetTray');
  var trash = document.getElementById('bouquetTrash');
  var clearBtn = document.getElementById('bouquetClearBtn');
  var randomBtn = document.getElementById('bouquetRandomBtn');
  var perfectBtn = document.getElementById('bouquetPerfectBtn');
  var pageBouquet = document.getElementById('pageBouquet');
  var pageAfterBouquet = document.getElementById('pageAfterBouquet');
  var coneEl = document.getElementById('bouquetCone');
  var coneColorPicker = document.getElementById('coneColorPicker');

  if (!canvas || !tray || !trash) return;

  var selectedPiece = null;
  var rotateHoldInterval = null;
  var ROTATE_CLICK_DEG = 5;
  var ROTATE_HOLD_DEG_PER_SEC = 2;
  var ROTATE_HOLD_INTERVAL_MS = 250;

  var FLOWERS = [
    { id: 'rose', name: 'Rose', image: 'rose-removebg-preview.png' },
    { id: 'tulip', name: 'Tulip', image: 'tulip-removebg-preview.png' },
    { id: 'lily', name: 'Lily', image: 'lily-removebg-preview.png' },
    { id: 'blossom', name: 'Blossom', image: 'cherryblossom-removebg-preview.png' },
    { id: 'chrysanthemum', name: 'Chrysanthemum', image: 'chrysanthemum-removebg-preview.png' },
    { id: 'hibiscus', name: 'Hibiscus', image: 'hibyscus-removebg-preview.png' },
    { id: 'leaf1', name: 'Leaf', image: 'leaf1.png' },
    { id: 'leafstem', name: 'Leaf stem', image: 'leafstem.png' }
  ];

  var placedCount = 0;
  var dragState = null;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }
  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function canvasRect() {
    return canvas.getBoundingClientRect();
  }
  function trashRect() {
    return trash.getBoundingClientRect();
  }

  var CONE_HEIGHT = 200;
  var CONE_TOP_WIDTH = 200;
  var CONE_BOTTOM = 80;

  /** Cone opening: top edge y and left/right x in canvas coords. */
  function coneGeometry() {
    var cr = canvasRect();
    var topY = cr.height - CONE_BOTTOM - CONE_HEIGHT;
    var centerX = cr.width / 2;
    return {
      topY: topY,
      leftX: centerX - CONE_TOP_WIDTH / 2,
      rightX: centerX + CONE_TOP_WIDTH / 2,
      centerX: centerX
    };
  }

  /** Bouquet zone: for random/initial placement above the cone. */
  function bouquetBounds() {
    var c = coneGeometry();
    return {
      xMin: c.leftX + 20,
      xMax: c.rightX - 20,
      yMin: Math.max(40, c.topY - 140),
      yMax: c.topY + 30
    };
  }

  function countPieces() {
    return canvas.querySelectorAll('.piece').length;
  }

  function bouquetSummary() {
    var summary = {};
    canvas.querySelectorAll('.piece').forEach(function (p) {
      var id = p.dataset.flowerId;
      summary[id] = (summary[id] || 0) + 1;
    });
    return summary;
  }

  function setTrashHot(isHot) {
    trash.classList.toggle('hot', isHot);
  }

  function renderTray() {
    tray.innerHTML = '';
    FLOWERS.forEach(function (f) {
      var btn = document.createElement('div');
      btn.className = 'flowerBtn';
      btn.setAttribute('draggable', 'false');
      btn.dataset.flowerId = f.id;
      btn.innerHTML =
        '<img class="flowerIconImg" src="' + f.image + '" alt="" /><div class="flowerName">' + f.name + '</div>';

      btn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        var piece = createPiece(f.id);
        var cr = canvasRect();
        var startX = e.clientX - cr.left;
        var startY = e.clientY - cr.top;
        placePieceAtCursor(piece, startX, startY);
        canvas.appendChild(piece);
        placedCount = countPieces();
        beginDrag(piece, e, true);
      });

      tray.appendChild(btn);
    });
  }

  function createPiece(flowerId) {
    var f = FLOWERS.find(function (x) {
      return x.id === flowerId;
    });
    if (!f) return null;
    var el = document.createElement('div');
    el.className = 'piece';
    el.dataset.flowerId = flowerId;
    el.innerHTML = '<img class="piece-flower" src="' + f.image + '" alt="" />';

    el.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      beginDrag(el, e, false);
    });

    el.addEventListener('dblclick', function () {
      if (selectedPiece === el) selectedPiece = null;
      el.remove();
      placedCount = countPieces();
    });

    return el;
  }

  function placePieceAt(el, x, y, isNew) {
    var b = bouquetBounds();
    var px = clamp(x, b.xMin, b.xMax);
    var py = clamp(y, b.yMin, b.yMax);
    var rot = randInt(-18, 18);
    var scale = rand(0.92, 1.08);

    el.style.left = px + 'px';
    el.style.top = py + 'px';
    el.style.transform =
      'translate(-50%, -65%) rotate(' + rot + 'deg) scale(' + scale + ')';
    el.style.zIndex = String(randInt(5, 60));

    if (isNew) {
      canvas.appendChild(el);
      placedCount = countPieces();
    }
  }

  /** Place a piece at exact (x,y) so it appears under the cursor when picking from tray. */
  function placePieceAtCursor(el, x, y) {
    var rot = randInt(-18, 18);
    var scale = rand(0.92, 1.08);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transform =
      'translate(-50%, -65%) rotate(' + rot + 'deg) scale(' + scale + ')';
    el.style.zIndex = '999';
  }

  function getPieceRotation(el) {
    var t = el.style.transform || '';
    var m = /rotate\(([-\d.]+)deg\)/.exec(t);
    return m ? Number(m[1]) : 0;
  }

  function setPieceRotation(el, deg) {
    var t = el.style.transform || '';
    var scale = 1;
    var scaleM = /scale\(([-\d.]+)\)/.exec(t);
    if (scaleM) scale = Number(scaleM[1]);
    el.style.transform = 'translate(-50%, -65%) rotate(' + deg + 'deg) scale(' + scale + ')';
  }

  function createRotateArrows() {}
  function updateRotateArrowsPosition() {}
  function hideRotateArrows() {}

  function beginDrag(el, e, fromTray) {
    selectedPiece = el;
    createRotateArrows();
    updateRotateArrowsPosition();
    el.setPointerCapture(e.pointerId);
    var elRect = el.getBoundingClientRect();
    var offsetX = e.clientX - (elRect.left + elRect.width / 2);
    var offsetY = e.clientY - (elRect.top + elRect.height * 0.65);

    dragState = {
      el: el,
      offsetX: offsetX,
      offsetY: offsetY,
      pointerId: e.pointerId,
      fromTray: fromTray
    };
    el.style.zIndex = '999';
  }

  function onPointerMove(e) {
    if (!dragState) return;
    var cr = canvasRect();
    var x = e.clientX - cr.left - dragState.offsetX;
    var y = e.clientY - cr.top - dragState.offsetY;
    var px = clamp(x, -80, cr.width + 80);
    var py = clamp(y, -80, cr.height + 80);
    dragState.el.style.left = px + 'px';
    dragState.el.style.top = py + 'px';
    updateRotateArrowsPosition();

    var tr = trashRect();
    var overTrash =
      e.clientX >= tr.left &&
      e.clientX <= tr.right &&
      e.clientY >= tr.top &&
      e.clientY <= tr.bottom;
    setTrashHot(overTrash);
  }

  function onPointerUp(e) {
    if (!dragState) return;

    var tr = trashRect();
    var overTrash =
      e.clientX >= tr.left &&
      e.clientX <= tr.right &&
      e.clientY >= tr.top &&
      e.clientY <= tr.bottom;

    if (overTrash) {
      if (selectedPiece === dragState.el) {
        selectedPiece = null;
        hideRotateArrows();
      }
      dragState.el.remove();
      placedCount = countPieces();
      setTrashHot(false);
      dragState = null;
      return;
    }

    var rotNudge = randInt(-6, 6);
    var current = dragState.el.style.transform || '';
    var baseRot = /rotate\(([-\d.]+)deg\)/.exec(current);
    var baseScale = /scale\(([-\d.]+)\)/.exec(current);
    var rot = (baseRot ? Number(baseRot[1]) : 0) + rotNudge;
    var scale = baseScale ? Number(baseScale[1]) : 1;
    dragState.el.style.transform =
      'translate(-50%, -65%) rotate(' + rot + 'deg) scale(' + scale + ')';
    dragState.el.style.zIndex = String(randInt(10, 100));

    selectedPiece = dragState.el;
    updateRotateArrowsPosition();
    setTrashHot(false);
    dragState = null;
  }

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      selectedPiece = null;
      hideRotateArrows();
      canvas.querySelectorAll('.piece').forEach(function (p) {
        p.remove();
      });
      placedCount = 0;
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener('click', function () {
      canvas.querySelectorAll('.piece').forEach(function (p) {
        p.remove();
      });
      var c = coneGeometry();
      var n = randInt(5, 14);
      var arcCenterY = c.topY - 50;
      var arcRadius = 75 + rand(0, 35);
      var angleSpread = 100 + rand(0, 40);
      var startAngle = -angleSpread / 2 + rand(0, 20);
      for (var i = 0; i < n; i++) {
        var f = FLOWERS[randInt(0, FLOWERS.length - 1)];
        var el = createPiece(f.id);
        if (!el) continue;
        var t = n > 1 ? i / (n - 1) : 0.5;
        var angleDeg = startAngle + t * angleSpread + rand(-8, 8);
        var angleRad = (angleDeg * Math.PI) / 180;
        var x = c.centerX + arcRadius * Math.cos(angleRad) + rand(-15, 15);
        var y = arcCenterY + arcRadius * 0.4 * Math.sin(angleRad) + rand(-10, 10);
        placePieceAt(el, x, y, true);
      }
      placedCount = countPieces();
    });
  }

  if (perfectBtn && pageBouquet && pageAfterBouquet) {
    perfectBtn.addEventListener('click', function () {
      var count = countPieces();
      if (count === 0) {
        alert('Add at least one flower first 🙂');
        return;
      }
      var summary = bouquetSummary();
      try {
        localStorage.setItem('bouquetSummary', JSON.stringify(summary));
      } catch (err) {}
      pageBouquet.classList.remove('open');
      pageBouquet.setAttribute('aria-hidden', 'true');
      pageAfterBouquet.classList.add('open');
      pageAfterBouquet.setAttribute('aria-hidden', 'false');
    });
  }

  if (coneEl && coneColorPicker) {
    coneColorPicker.addEventListener('input', function () {
      var hex = coneColorPicker.value;
      var r = parseInt(hex.slice(1, 3), 16);
      var g = parseInt(hex.slice(3, 5), 16);
      var b = parseInt(hex.slice(5, 7), 16);
      coneEl.style.setProperty('--cone-color', hex);
      coneEl.style.setProperty('--cone-color-rgb', r + ',' + g + ',' + b);
    });
    coneEl.style.setProperty('--cone-color', coneColorPicker.value);
    var hex = coneColorPicker.value;
    coneEl.style.setProperty('--cone-color-rgb',
      parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16));
  }

  renderTray();
})();
