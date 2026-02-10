/**
 * Fireworks canvas – starts when #pageFireworks is shown (after Yes click).
 * 5x intensity: more particles, more auto-launches, more click-launches.
 * Cursor targeting: mousedown launches fireworks at mouse position.
 */
(function () {
  var wrap = document.getElementById('pageFireworks');
  var canvas = document.getElementById('fireworksCanvas');
  if (!wrap || !canvas) return;

  var ctx = canvas.getContext('2d');
  var cw, ch;
  var fireworks = [];
  var particles = [];
  var hue = 120;
  var limiterTotal = 1;
  var limiterTick = 0;
  var timerTotal = 16;
  var timerTick = 0;
  var mousedown = false;
  var mx, my;
  var animId = null;

  window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (cb) { return window.setTimeout(cb, 1000 / 60); };
  })();

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function calculateDistance(p1x, p1y, p2x, p2y) {
    var dx = p1x - p2x, dy = p1y - p2y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function Firework(sx, sy, tx, ty) {
    this.x = sx;
    this.y = sy;
    this.sx = sx;
    this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;
    this.coordinates = [];
    var coordCount = 3;
    while (coordCount--) this.coordinates.push([this.x, this.y]);
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = random(50, 70);
    this.targetRadius = 1;
  }

  Firework.prototype.update = function (index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    if (this.targetRadius < 8) this.targetRadius += 0.3;
    else this.targetRadius = 1;
    this.speed *= this.acceleration;
    var vx = Math.cos(this.angle) * this.speed;
    var vy = Math.sin(this.angle) * this.speed;
    this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);
    if (this.distanceTraveled >= this.distanceToTarget) {
      createParticles(this.tx, this.ty);
      fireworks.splice(index, 1);
    } else {
      this.x += vx;
      this.y += vy;
    }
  };

  Firework.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
    ctx.stroke();
  };

  function Particle(x, y) {
    this.x = x;
    this.y = y;
    this.coordinates = [];
    var coordCount = 5;
    while (coordCount--) this.coordinates.push([this.x, this.y]);
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);
    this.friction = 0.95;
    this.gravity = 1;
    this.hue = random(hue - 50, hue + 50);
    this.brightness = random(50, 80);
    this.alpha = 1;
    this.decay = random(0.015, 0.03);
  }

  Particle.prototype.update = function (index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;
    if (this.alpha <= this.decay) particles.splice(index, 1);
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
    ctx.stroke();
  };

  function createParticles(x, y) {
    var particleCount = 150;
    while (particleCount--) particles.push(new Particle(x, y));
  }

  function resize() {
    cw = canvas.width = wrap.offsetWidth || window.innerWidth;
    ch = canvas.height = wrap.offsetHeight || window.innerHeight;
  }

  function loop() {
    if (!wrap.classList.contains('open')) return;
    animId = requestAnimFrame(loop);
    hue = random(0, 360);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'lighter';

    var i = fireworks.length;
    while (i--) {
      fireworks[i].draw();
      fireworks[i].update(i);
    }
    i = particles.length;
    while (i--) {
      particles[i].draw();
      particles[i].update(i);
    }

    if (timerTick >= timerTotal) {
      if (!mousedown) {
        fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
        timerTick = 0;
      }
    } else timerTick++;

    if (limiterTick >= limiterTotal) {
      if (mousedown) {
        fireworks.push(new Firework(cw / 2, ch, mx, my));
        limiterTick = 0;
      }
    } else limiterTick++;
  }

  function start() {
    fireworks = [];
    particles = [];
    resize();
    if (!animId) loop();
  }

  function stop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  });

  canvas.addEventListener('mousedown', function (e) {
    e.preventDefault();
    mousedown = true;
  });

  canvas.addEventListener('mouseup', function (e) {
    e.preventDefault();
    mousedown = false;
  });

  canvas.addEventListener('mouseleave', function () {
    mousedown = false;
  });

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'class') {
        if (wrap.classList.contains('open')) start();
        else stop();
      }
    });
  });
  observer.observe(wrap, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', function () {
    if (wrap.classList.contains('open')) resize();
  });

  if (wrap.classList.contains('open')) start();
})();
