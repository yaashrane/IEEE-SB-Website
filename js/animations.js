/* ============================================================
   ANIMATIONS.JS — Scroll Reveals, Parallax, Word Reveals
   IEEE SB Premium Website
   ============================================================ */

'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── INTERSECTION OBSERVER REVEAL ─────────────────────────────
const ScrollReveal = {
  observer: null,
  init() {
    const els = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-mask, .reveal-rotate'
    );
    if (!els.length) return;

    if (reducedMotion) {
      els.forEach(el => el.classList.add('revealed'));
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => this.observer.observe(el));
  }
};

// ─── STAGGER CHILDREN ─────────────────────────────────────────
const StaggerReveal = {
  observer: null,
  init() {
    const groups = document.querySelectorAll('[data-stagger]');
    if (!groups.length) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = reducedMotion ? 0 : parseFloat(entry.target.dataset.staggerDelay ?? 80);
          Array.from(entry.target.children).forEach((child, i) => {
            setTimeout(() => child.classList.add('revealed'), i * delay);
          });
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    groups.forEach(group => {
      Array.from(group.children).forEach(child => {
        if (!child.classList.contains('reveal')) child.classList.add('reveal');
      });
      this.observer.observe(group);
    });
  }
};

// ─── HERO WORD REVEAL ─────────────────────────────────────────
const HeroReveal = {
  init() {
    const words = document.querySelectorAll('.hero__headline-word');
    if (!words.length) return;

    if (reducedMotion) {
      words.forEach(w => w.classList.add('revealed'));
      return;
    }

    words.forEach((word, i) => {
      setTimeout(() => word.classList.add('revealed'), 700 + i * 100);
    });

    const tagline = document.querySelector('.hero__tagline');
    if (tagline) {
      tagline.style.cssText = 'opacity:0;transform:translateY(20px);filter:blur(8px);transition:opacity 0.9s cubic-bezier(0.16,1,0.3,1),transform 0.9s cubic-bezier(0.16,1,0.3,1),filter 0.9s ease';
      setTimeout(() => {
        tagline.style.opacity = '1';
        tagline.style.transform = 'translateY(0)';
        tagline.style.filter = 'blur(0)';
      }, 1300);
    }
  }
};

// ─── PARALLAX ─────────────────────────────────────────────────
const Parallax = {
  els: [],
  hero: null,
  heroContent: null,
  ticking: false,
  init() {
    if (reducedMotion) return;
    this.els = document.querySelectorAll('[data-parallax]');
    this.hero = document.querySelector('.hero');
    this.heroContent = document.querySelector('.hero__content');
    if (!this.els.length && !this.hero) return;
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => { this.update(); this.ticking = false; });
        this.ticking = true;
      }
    }, { passive: true });
  },
  update() {
    const scrollY = window.scrollY;
    if (this.hero) {
      const heroH = this.hero.offsetHeight;
      const p = Math.min(scrollY / heroH, 1);
      this.hero.style.opacity = String(1 - p * 0.65);
      if (this.heroContent) {
        this.heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
      }
    }
    this.els.forEach(el => {
      const speed = parseFloat(el.dataset.parallax ?? 0.3);
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2 + scrollY;
      const offset = (scrollY - centerY + window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }
};

// ─── MOUSE PARALLAX ───────────────────────────────────────────
const MouseParallax = {
  layers: [],
  mx: 0, my: 0,
  cx: 0, cy: 0,
  animating: false,
  init() {
    if (reducedMotion) return;
    this.layers = document.querySelectorAll('[data-mouse-parallax]');
    if (!this.layers.length) return;
    document.addEventListener('mousemove', (e) => {
      this.mx = (e.clientX / window.innerWidth - 0.5) * 2;
      this.my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!this.animating) {
        this.animating = true;
        requestAnimationFrame(() => this.update());
      }
    });
  },
  update() {
    this.cx += (this.mx - this.cx) * 0.08;
    this.cy += (this.my - this.cy) * 0.08;
    this.layers.forEach(el => {
      const depth = parseFloat(el.dataset.mouseParallax ?? 15);
      el.style.transform = `translate(${this.cx * depth}px, ${this.cy * depth}px)`;
    });
    this.animating = false;
  }
};

// ─── TIMELINE DRAW ────────────────────────────────────────────
const Timeline = {
  init() {
    const line = document.querySelector('.timeline__line');
    const items = document.querySelectorAll('.timeline-item');
    if (!line && !items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === line) line.classList.add('active');
          else entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (line) observer.observe(line);
    items.forEach(item => observer.observe(item));
  }
};

// ─── MASONRY REVEAL ───────────────────────────────────────────
const MasonryReveal = {
  init() {
    const items = document.querySelectorAll('.masonry-item');
    if (!items.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('revealed'), 50);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    items.forEach(item => observer.observe(item));
  }
};

// ─── CINEMATIC SCROLL DEPTH ───────────────────────────────────
const CinematicScroll = {
  sections: [],
  ticking: false,
  init() {
    if (reducedMotion) return;
    this.sections = document.querySelectorAll('.section');
    if (!this.sections.length) return;
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => { this.update(); this.ticking = false; });
        this.ticking = true;
      }
    }, { passive: true });
  },
  update() {
    const vh = window.innerHeight;
    this.sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top > vh * 0.05 && rect.top < vh) {
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));
        section.style.opacity = Math.min(1, progress * 2);
        section.style.transform = `scale(${0.97 + progress * 0.03})`;
      } else {
        section.style.opacity = '';
        section.style.transform = '';
      }
    });
  }
};

// ─── PROGRESS BARS ────────────────────────────────────────────
const ProgressBars = {
  init() {
    const bars = document.querySelectorAll('.progress-bar__fill[data-width]');
    if (!bars.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.width = entry.target.dataset.width + '%';
          }, 200);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(bar => observer.observe(bar));
  }
};

// ─── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ScrollReveal.init();
  StaggerReveal.init();
  HeroReveal.init();
  Parallax.init();
  MouseParallax.init();
  Timeline.init();
  MasonryReveal.init();
  ProgressBars.init();
  CinematicScroll.init();
});
