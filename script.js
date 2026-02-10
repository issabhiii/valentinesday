// Flow: pageBha (भा circle) → page1 (heart) → red explosion → greeting → Loki → Flowers
const pageBha = document.getElementById('pageBha');
const bhaCircle = document.getElementById('bhaCircle');
const heart = document.querySelector('.btn-heart');
const page1 = document.getElementById('page1');

if (pageBha && bhaCircle && page1) {
  bhaCircle.addEventListener('click', function () {
    pageBha.classList.add('hidden');
    page1.classList.remove('heart-screen-hidden');
  });
}
const page2 = document.getElementById('page2');
const page3 = document.getElementById('page3');
const explosion = document.getElementById('explosion');
const pageGreeting = document.getElementById('pageGreeting');
const flowerScene = document.querySelector('.flower-scene');

// Background music playlist (continuous): music1 → music2 → music3 → repeat
// Browsers block autoplay until a user gesture – we only set "started" when play() actually succeeds.
(function () {
  var tracks = [
    new Audio('music1.mp3'),
    new Audio('music2.mp3'),
    new Audio('music3.mp3')
  ];
  tracks.forEach(function (a) {
    a.preload = 'auto';
    a.volume = 1;
  });

  var started = false;
  var idx = 0;

  function stopAll() {
    tracks.forEach(function (a) {
      try { a.pause(); } catch (e) {}
      try { a.currentTime = 0; } catch (e) {}
    });
  }

  function playIndex(i) {
    if (i < 0 || i >= tracks.length) return null;
    tracks.forEach(function (a, j) {
      if (j !== i) {
        try { a.pause(); } catch (e) {}
      }
    });
    idx = i;
    try {
      return tracks[i].play();
    } catch (e) {
      return null;
    }
  }

  tracks[0].addEventListener('ended', function () { playIndex(1); });
  tracks[1].addEventListener('ended', function () { playIndex(2); });
  tracks[2].addEventListener('ended', function () { playIndex(0); });

  function start() {
    if (started) return;
    stopAll();
    var p = playIndex(0);
    if (p && typeof p.then === 'function') {
      p.then(function () {
        started = true;
      }).catch(function () {});
    } else {
      started = true;
    }
  }

  window.valentinesMusic = { start: start };

  document.addEventListener('pointerdown', function () { start(); }, { once: true });
  document.addEventListener('click', function () { start(); }, { once: true });
})();

// Page 1 heart: red explosion, then show greeting
heart.addEventListener('click', function () {
  window.valentinesMusic && window.valentinesMusic.start();
  explosion.classList.add('run');
  explosion.setAttribute('aria-hidden', 'false');
  setTimeout(function () {
    page1.style.visibility = 'hidden';
    page1.style.pointerEvents = 'none';
    explosion.classList.remove('run');
    explosion.setAttribute('aria-hidden', 'true');
    pageGreeting.classList.add('visible');
    pageGreeting.setAttribute('aria-hidden', 'false');
    document.querySelector('.greeting-text').classList.add('visible');
    document.querySelector('.btn-heart--greeting').classList.add('visible');
    document.querySelector('.greeting-subtext').classList.add('visible');
  }, 900);
});

// Greeting heart: go to Loki (page 3)
const greetingHeart = document.querySelector('.btn-heart--greeting');
if (greetingHeart && page3) {
  greetingHeart.addEventListener('click', function () {
    pageGreeting.classList.remove('visible');
    pageGreeting.setAttribute('aria-hidden', 'true');
    page3.classList.add('visible');
    page3.setAttribute('aria-hidden', 'false');
    page3.classList.add('swap');
  });
}

// Greeting Back: return to page 1
const backBtnGreeting = document.querySelector('.back-btn--greeting');
if (backBtnGreeting) {
  backBtnGreeting.addEventListener('click', function () {
    pageGreeting.classList.remove('visible');
    pageGreeting.setAttribute('aria-hidden', 'true');
    page1.style.visibility = '';
    page1.style.pointerEvents = '';
    document.querySelector('.greeting-text').classList.remove('visible');
    document.querySelector('.btn-heart--greeting').classList.remove('visible');
    document.querySelector('.greeting-subtext').classList.remove('visible');
  });
}

// Loki Back: return to greeting
const backBtnPage3 = document.querySelector('.back-btn--page3');
const nextBtn3 = document.getElementById('nextBtn3');
if (backBtnPage3 && page3) {
  backBtnPage3.addEventListener('click', function () {
    page3.classList.remove('visible');
    page3.setAttribute('aria-hidden', 'true');
    page3.classList.remove('swap');
    pageGreeting.classList.add('visible');
    pageGreeting.setAttribute('aria-hidden', 'false');
  });
}

// Loki Next: go to Light Pillar page (page5)
const page5 = document.getElementById('page5');
if (nextBtn3 && page5) {
  nextBtn3.addEventListener('click', function () {
    page3.classList.remove('visible');
    page3.setAttribute('aria-hidden', 'true');
    page5.classList.add('open');
    page5.setAttribute('aria-hidden', 'false');
  });
}

// Light Pillar (page5) Back: return to Loki
const backBtnPage5 = document.querySelector('.back-btn--page5');
if (backBtnPage5 && page5) {
  backBtnPage5.addEventListener('click', function () {
    page5.classList.remove('open');
    page5.setAttribute('aria-hidden', 'true');
    page3.classList.add('visible');
    page3.setAttribute('aria-hidden', 'false');
  });
}

// Light Pillar (page5) Next: go to Flowers
const nextBtn5 = document.getElementById('nextBtn5');
if (nextBtn5 && page2) {
  nextBtn5.addEventListener('click', function () {
    page5.classList.remove('open');
    page5.setAttribute('aria-hidden', 'true');
    page2.classList.add('open');
    page2.setAttribute('aria-hidden', 'false');
    if (flowerScene && flowerScene.classList.contains('not-loaded')) {
      setTimeout(function () { flowerScene.classList.remove('not-loaded'); }, 1000);
    }
  });
}

// Flowers Back: return to Loki
const backBtnPage2 = document.querySelector('.back-btn--page2');
if (backBtnPage2 && page2) {
  backBtnPage2.addEventListener('click', function () {
    page2.classList.remove('open');
    page2.setAttribute('aria-hidden', 'true');
    page3.classList.add('visible');
    page3.setAttribute('aria-hidden', 'false');
  });
}

// Flowers Next: go to Bouquet Builder
const pageBouquet = document.getElementById('pageBouquet');
const nextBtnPage2 = document.getElementById('nextBtnPage2');
if (nextBtnPage2 && page2 && pageBouquet) {
  nextBtnPage2.addEventListener('click', function () {
    page2.classList.remove('open');
    page2.setAttribute('aria-hidden', 'true');
    pageBouquet.classList.add('open');
    pageBouquet.setAttribute('aria-hidden', 'false');
  });
}

// Bouquet Back: return to Flowers
const backBtnBouquet = document.querySelector('.back-btn--bouquet');
if (backBtnBouquet && pageBouquet && page2) {
  backBtnBouquet.addEventListener('click', function () {
    pageBouquet.classList.remove('open');
    pageBouquet.setAttribute('aria-hidden', 'true');
    page2.classList.add('open');
    page2.setAttribute('aria-hidden', 'false');
  });
}

// After-bouquet ("Of course it's beautiful"): Back to Bouquet, Next → snow (Infinite Menu)
const pageAfterBouquet = document.getElementById('pageAfterBouquet');
const backBtnAfterBouquet = document.querySelector('.back-btn--after-bouquet');
const nextBtnAfterBouquet = document.getElementById('nextBtnAfterBouquet');
const pageInfiniteMenu = document.getElementById('pageInfiniteMenu');
if (pageAfterBouquet && pageBouquet) {
  if (backBtnAfterBouquet) {
    backBtnAfterBouquet.addEventListener('click', function () {
      pageAfterBouquet.classList.remove('open');
      pageAfterBouquet.setAttribute('aria-hidden', 'true');
      pageBouquet.classList.add('open');
      pageBouquet.setAttribute('aria-hidden', 'false');
    });
  }
  // Next on this screen goes to the snow (Infinite Menu), not to the bouquet or any other screen
  if (nextBtnAfterBouquet && pageInfiniteMenu) {
    nextBtnAfterBouquet.addEventListener('click', function () {
      pageAfterBouquet.classList.remove('open');
      pageAfterBouquet.setAttribute('aria-hidden', 'true');
      pageInfiniteMenu.classList.add('open');
      pageInfiniteMenu.setAttribute('aria-hidden', 'false');
    });
  }
}

// Infinite Menu: Back to After Bouquet
var backBtnInfiniteMenu = document.getElementById('backBtnInfiniteMenu');
var nextBtnInfiniteMenu = document.getElementById('nextBtnInfiniteMenu');
if (backBtnInfiniteMenu && pageInfiniteMenu && pageAfterBouquet) {
  backBtnInfiniteMenu.addEventListener('click', function () {
    pageInfiniteMenu.classList.remove('open');
    pageInfiniteMenu.setAttribute('aria-hidden', 'true');
    pageAfterBouquet.classList.add('open');
    pageAfterBouquet.setAttribute('aria-hidden', 'false');
  });
}
// Snow screen (dedicated)
const pageSnow = document.getElementById('pageSnow');
var backBtnSnow = document.getElementById('backBtnSnow');
var nextBtnSnow = document.getElementById('nextBtnSnow');

// Infinite Menu: Next → Snow screen
if (nextBtnInfiniteMenu && pageInfiniteMenu && pageSnow) {
  nextBtnInfiniteMenu.addEventListener('click', function () {
    pageInfiniteMenu.classList.remove('open');
    pageInfiniteMenu.setAttribute('aria-hidden', 'true');
    pageSnow.classList.add('open');
    pageSnow.setAttribute('aria-hidden', 'false');
  });
}

var pageValentine = document.getElementById('pageValentine');

// Snow: Back → Infinite Menu
if (backBtnSnow && pageSnow && pageInfiniteMenu) {
  backBtnSnow.addEventListener('click', function () {
    pageSnow.classList.remove('open');
    pageSnow.setAttribute('aria-hidden', 'true');
    pageInfiniteMenu.classList.add('open');
    pageInfiniteMenu.setAttribute('aria-hidden', 'false');
  });
}

// Snow: Next → Valentine question screen
if (nextBtnSnow && pageSnow && pageValentine) {
  nextBtnSnow.addEventListener('click', function () {
    pageSnow.classList.remove('open');
    pageSnow.setAttribute('aria-hidden', 'true');
    pageValentine.classList.add('open');
    pageValentine.setAttribute('aria-hidden', 'false');
  });
}

var nextBtnSnowCenter = document.getElementById('nextBtnSnowCenter');
if (nextBtnSnowCenter && pageSnow && pageValentine) {
  nextBtnSnowCenter.addEventListener('click', function () {
    pageSnow.classList.remove('open');
    pageSnow.setAttribute('aria-hidden', 'true');
    pageValentine.classList.add('open');
    pageValentine.setAttribute('aria-hidden', 'false');
  });
}

// Valentine: Back → Snow
var backBtnValentine = document.getElementById('backBtnValentine');
if (backBtnValentine && pageValentine && pageSnow) {
  backBtnValentine.addEventListener('click', function () {
    pageValentine.classList.remove('open');
    pageValentine.setAttribute('aria-hidden', 'true');
    pageSnow.classList.add('open');
    pageSnow.setAttribute('aria-hidden', 'false');
  });
}

// Valentine: Yes → Fireworks (then Continue → After Bouquet)
var pageFireworks = document.getElementById('pageFireworks');
var valentineYes = document.getElementById('valentineYes');
if (valentineYes && pageValentine && pageFireworks) {
  valentineYes.addEventListener('click', function () {
    pageValentine.classList.remove('open');
    pageValentine.setAttribute('aria-hidden', 'true');
    pageFireworks.classList.add('open');
    pageFireworks.setAttribute('aria-hidden', 'false');
  });
}

var fireworksContinueBtn = document.getElementById('fireworksContinueBtn');
if (fireworksContinueBtn && pageFireworks && pageAfterBouquet) {
  fireworksContinueBtn.addEventListener('click', function () {
    pageFireworks.classList.remove('open');
    pageFireworks.setAttribute('aria-hidden', 'true');
    pageAfterBouquet.classList.add('open');
    pageAfterBouquet.setAttribute('aria-hidden', 'false');
  });
}

// Valentine: No button runs away inside the actions area (never leaves or disappears)
var valentineActions = document.getElementById('valentineActions');
var valentineNo = document.getElementById('valentineNo');
if (valentineNo && pageValentine && valentineActions) {
  var RUN_DISTANCE = 160;
  var PAD = 10;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function placeNoInitial() {
    if (!pageValentine.classList.contains('open')) return;
    var a = valentineActions.getBoundingClientRect();
    var b = valentineNo.getBoundingClientRect();
    var x = a.width - b.width - 90;
    var y = 10;
    valentineNo.style.left = clamp(x, PAD, a.width - b.width - PAD) + 'px';
    valentineNo.style.top = clamp(y, PAD, a.height - b.height - PAD) + 'px';
  }

  function moveNoAway(fromX, fromY) {
    var a = valentineActions.getBoundingClientRect();
    var b = valentineNo.getBoundingClientRect();
    var minX = PAD;
    var maxX = a.width - b.width - PAD;
    var minY = PAD;
    var maxY = a.height - b.height - PAD;
    var cx = fromX - a.left;
    var cy = fromY - a.top;
    var best = { x: minX, y: minY, d: -1 };
    for (var i = 0; i < 18; i++) {
      var x = Math.random() * (maxX - minX) + minX;
      var y = Math.random() * (maxY - minY) + minY;
      var dx = (x + b.width / 2) - cx;
      var dy = (y + b.height / 2) - cy;
      var d = Math.hypot(dx, dy);
      if (d > best.d) best = { x: x, y: y, d: d };
    }
    valentineNo.style.left = clamp(best.x, minX, maxX) + 'px';
    valentineNo.style.top = clamp(best.y, minY, maxY) + 'px';
  }

  valentineActions.addEventListener('mousemove', function (e) {
    if (!pageValentine.classList.contains('open')) return;
    var nb = valentineNo.getBoundingClientRect();
    var dist = Math.hypot(
      (nb.left + nb.width / 2) - e.clientX,
      (nb.top + nb.height / 2) - e.clientY
    );
    if (dist < RUN_DISTANCE) moveNoAway(e.clientX, e.clientY);
  });

  valentineNo.addEventListener('pointerenter', function (e) {
    moveNoAway(e.clientX, e.clientY);
  });
  valentineNo.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    moveNoAway(e.clientX, e.clientY);
  });

  var obs = new MutationObserver(function () {
    if (pageValentine.classList.contains('open')) {
      setTimeout(placeNoInitial, 50);
    }
  });
  obs.observe(pageValentine, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', placeNoInitial);
}

// --- Stars with facts (top 60% of screen) ---
const STAR_COUNT = 70;
const facts = [
  "Holding hands can sync heart rates.",
  "The heart symbol may come from the silphium seed.",
  "Octopuses have three hearts.",
  "Honey never spoils—edible after 3000 years.",
  "A day on Venus is longer than its year.",
  "Bananas are berries; strawberries aren't.",
  "You have a 1 in 3 chance of sharing a birthday with someone in a group of 23.",
  "Cows have best friends.",
  "Penguins propose with a pebble.",
  "Otters hold hands while sleeping.",
  "The shortest war was 38 minutes.",
  "A group of flamingos is called a flamboyance.",
  "Wombat poop is cube-shaped.",
  "Butterflies taste with their feet.",
  "A year on Mercury is 88 Earth days.",
  "The Eiffel Tower grows in summer.",
  "Your brain uses about 20% of your body's energy.",
  "There are more stars than grains of sand on Earth (visible universe).",
  "A cloud can weigh over a million pounds.",
  "Light takes 8 minutes from the Sun to Earth.",
  "The average person will walk the equivalent of 3 times around the world.",
  "Humans share about 60% of DNA with bananas.",
  "A single lightning bolt has enough energy to toast 100,000 slices of bread.",
  "The smell of chocolate increases theta waves, which trigger relaxation.",
  "Switzerland has the most chocolate consumption per capita.",
  "The first Valentine was written from a prison.",
  "Roses are related to apples and almonds.",
  "A \"jiffy\" is about 1/100th of a second.",
  "The world's oldest message in a bottle was 108 years old.",
  "Some turtles can breathe through their butts.",
  "A snail can sleep for three years.",
  "The first computer mouse was made of wood.",
  "There's a planet made of diamonds.",
  "A day on Mars is 24 hours and 37 minutes.",
  "The Moon is slowly moving away from Earth.",
  "You're more likely to be killed by a vending machine than a shark.",
  "The inventor of the Pringles can is buried in one.",
  "A single strand of spaghetti is called a spaghetto.",
  "The dot over 'i' is called a tittle.",
  "A group of crows is called a murder.",
  "The unicorn is Scotland's national animal.",
  "Strawberries have more vitamin C than oranges (by weight).",
  "The shortest scientific paper was 2 sentences.",
  "Bees can recognize human faces.",
  "A \"moment\" was once a medieval unit of time: 1/40th of an hour.",
  "The oldest known customer complaint is 4000 years old (clay tablet).",
  "There are more possible chess games than atoms in the observable universe.",
  "A bolt of lightning is 5x hotter than the Sun's surface.",
  "Humans are the only animals that blush.",
  "The first alarm clock could only ring at 4 a.m.",
  "A \"fact\" can become false; that's why we keep learning.",
];

const starsContainer = document.getElementById('starsContainer');
const starFactEl = document.getElementById('starFact');

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Shuffle and pick facts (allow reuse if needed)
const shuffledFacts = [...facts].sort(() => Math.random() - 0.5);

// Spread stars across full width and all the way down to bottom 5%
for (let i = 0; i < STAR_COUNT; i++) {
  const star = document.createElement('div');
  star.className = 'star';
  star.setAttribute('aria-label', 'Star with a fact');
  star.dataset.fact = shuffledFacts[i % shuffledFacts.length];
  star.style.left = randomBetween(2, 98) + '%';
  star.style.top = randomBetween(2, 95) + '%';
  star.style.animationDelay = randomBetween(0, 2) + 's';
  starsContainer.appendChild(star);
}

starsContainer.addEventListener('mouseover', function (e) {
  const star = e.target.closest('.star');
  if (!star) return;
  const fact = star.dataset.fact;
  starFactEl.textContent = fact;
  starFactEl.classList.add('visible');
  const rect = star.getBoundingClientRect();
  starFactEl.style.left = rect.left + rect.width / 2 + 'px';
  starFactEl.style.top = rect.top + 'px';
});

starsContainer.addEventListener('mouseout', function (e) {
  if (!e.target.closest('.star')) return;
  starFactEl.classList.remove('visible');
});

starsContainer.addEventListener('mousemove', function (e) {
  const star = e.target.closest('.star');
  if (!star) return;
  const rect = star.getBoundingClientRect();
  starFactEl.style.left = rect.left + rect.width / 2 + 'px';
  starFactEl.style.top = rect.top + 'px';
});

// --- Random shooting stars (~8° down, random origin & end) ---
function createShootingStar() {
  const startX = randomBetween(88, 112);
  const startY = randomBetween(0, 55);
  const endX = randomBetween(-95, -35);
  const angleDeg = randomBetween(5, 11);
  const angleRad = (angleDeg * Math.PI) / 180;
  const run = startX - endX;
  const drop = run * Math.tan(angleRad);

  const el = document.createElement('div');
  el.className = 'shooting-star';
  el.style.setProperty('--shoot-x', startX + 'vw');
  el.style.setProperty('--shoot-y', startY + 'vh');
  el.style.setProperty('--shoot-dx', (endX - startX) + 'vw');
  el.style.setProperty('--shoot-dy', drop + 'vw');
  el.style.setProperty('--shoot-angle', -angleDeg + 'deg');
  page2.appendChild(el);
  requestAnimationFrame(() => el.classList.add('run'));
  el.addEventListener('animationend', () => el.remove());
}

function scheduleShootingStar() {
  const delay = randomBetween(2000, 8000);
  setTimeout(() => {
    if (page2.classList.contains('open')) createShootingStar();
    scheduleShootingStar();
  }, delay);
}

scheduleShootingStar();

