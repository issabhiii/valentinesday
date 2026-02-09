// Heart click: expand circle into midnight blue screen
const heart = document.querySelector('.btn-heart');
const page2 = document.getElementById('page2');

const flowerScene = document.querySelector('.flower-scene');
const nextBtn = document.getElementById('nextBtn');

heart.addEventListener('click', function () {
  page2.classList.add('open');
  page2.setAttribute('aria-hidden', 'false');
  if (flowerScene && flowerScene.classList.contains('not-loaded')) {
    setTimeout(function () { flowerScene.classList.remove('not-loaded'); }, 1000);
  }
});

// Back button: collapse back to page 1
document.querySelector('.back-btn').addEventListener('click', function () {
  page2.classList.remove('open');
  page2.setAttribute('aria-hidden', 'true');
});

// Next button: show page 3 (Loki screen)
const page3 = document.getElementById('page3');
let page3SwapTimeoutId = null;
if (nextBtn && page3) {
  nextBtn.addEventListener('click', function () {
    page3.classList.add('visible');
    page3.setAttribute('aria-hidden', 'false');
    page3.classList.remove('swap');
    if (page3SwapTimeoutId) clearTimeout(page3SwapTimeoutId);
    page3SwapTimeoutId = setTimeout(function () {
      page3.classList.add('swap');
      page3SwapTimeoutId = null;
    }, 1400);
  });
}

// Back on page 3: return to page 2
const backBtnPage3 = document.querySelector('.back-btn--page3');
const nextBtn3 = document.getElementById('nextBtn3');
if (backBtnPage3 && page3) {
  backBtnPage3.addEventListener('click', function () {
    page3.classList.remove('visible');
    page3.setAttribute('aria-hidden', 'true');
    page3.classList.remove('swap');
    if (page3SwapTimeoutId) {
      clearTimeout(page3SwapTimeoutId);
      page3SwapTimeoutId = null;
    }
  });
}

// Page 3 next button (hook for future screens)
if (nextBtn3) {
  nextBtn3.addEventListener('click', function () {
    // TODO: add page4 when you're ready
  });
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

