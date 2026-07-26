/* ============================================================
   ANIMATIONS.JS — Scroll Reveals, Parallax, Word Reveals
   IEEE SB Premium Website
   ============================================================ */

'use strict';

// ─── INTERSECTION OBSERVER REVEAL ─────────────────────────────
const ScrollReveal = {
  observer: null,
  init() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;

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
          const delay = parseFloat(entry.target.dataset.staggerDelay ?? 80);
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            setTimeout(() => {
              child.classList.add('revealed');
            }, i * delay);
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
    words.forEach((word, i) => {
      setTimeout(() => {
        word.classList.add('revealed');
      }, 700 + i * 80);
    });
  }
};

// ─── PARALLAX ─────────────────────────────────────────────────
const Parallax = {
  els: [],
  ticking: false,
  init() {
    this.els = document.querySelectorAll('[data-parallax]');
    if (!this.els.length) return;
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.update();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });
  },
  update() {
    const scrollY = window.scrollY;
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
      const x = this.cx * depth;
      const y = this.cy * depth;
      el.style.transform = `translate(${x}px, ${y}px)`;
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
          if (entry.target === line) {
            line.classList.add('active');
          } else {
            entry.target.classList.add('revealed');
          }
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

// ─── SMOOTH SECTION TRANSITIONS ───────────────────────────────
const SectionTransitions = {
  init() {
    const sections = document.querySelectorAll('.section');
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.style.opacity = entry.isIntersecting ? '1' : '';
      });
    }, { threshold: 0.05 });
    sections.forEach(s => observer.observe(s));
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
          const width = entry.target.dataset.width;
          setTimeout(() => {
            entry.target.style.width = width + '%';
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
  SectionTransitions.init();
  ProgressBars.init();
});
