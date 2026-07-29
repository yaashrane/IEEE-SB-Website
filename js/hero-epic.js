/* ============================================================
   HERO EPIC ENGINE — Awwwards-Grade Hero Interactions
   MMIT IEEE Student Branch
   ============================================================ */

'use strict';

function initHeroEpic() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const spotlight = document.getElementById('hero-spotlight');
  const visualStage = document.querySelector('.hero__glass-stage');
  const scrollIndicator = document.querySelector('.hero__scroll-indicator');

  // 1. Mouse Spotlight & 3D Glass Stage Tilt
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  let heroW = hero.offsetWidth || window.innerWidth;
  let heroH = hero.offsetHeight || window.innerHeight;

  window.addEventListener('resize', () => {
    heroW = hero.offsetWidth || window.innerWidth;
    heroH = hero.offsetHeight || window.innerHeight;
  }, { passive: true });

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }, { passive: true });

  function animateHero() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    // Update Mouse Spotlight
    if (spotlight) {
      spotlight.style.transform = `translate3d(${currentX - 250}px, ${currentY - 250}px, 0)`;
    }

    // 3D Glass Stage Tilt & Spatial Depth (Desktop only)
    if (visualStage && window.innerWidth > 992) {
      const centerX = heroW / 2;
      const centerY = heroH / 2;
      const tiltX = (currentY - centerY) / centerY * -14;
      const tiltY = (currentX - centerX) / centerX * 14;
      visualStage.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;

      // Multi-layer 3D Parallax offset for inner elements
      const frontPrism = visualStage.querySelector('.glass-prism');
      const backPrism = visualStage.querySelector('.glass-prism-back');
      if (frontPrism) {
        frontPrism.style.transform = `translate3d(${tiltY * 0.8}px, ${-tiltX * 0.8}px, 30px)`;
      }
      if (backPrism) {
        backPrism.style.transform = `translate3d(${-tiltY * 0.6}px, ${tiltX * 0.6}px, -40px) rotate(-6deg)`;
      }
    }

    requestAnimationFrame(animateHero);
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    animateHero();
  }

  // 2. Scroll Indicator Fade Out
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 120) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.opacity = `${1 - scrollY / 120}`;
        scrollIndicator.style.pointerEvents = 'auto';
      }
    }, { passive: true });
  }

  // 3. Stagger Word Reveal Animation
  const words = hero.querySelectorAll('.hero__word');
  words.forEach((word, idx) => {
    setTimeout(() => {
      word.classList.add('is-visible');
    }, 180 + idx * 110);
  });
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initHeroEpic();
} else {
  document.addEventListener('DOMContentLoaded', initHeroEpic);
}
