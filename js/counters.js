/* ============================================================
   COUNTERS.JS — Animated Number Counters
   IEEE SB Premium Website
   ============================================================ */

'use strict';

// ─── NUMBER COUNTER ───────────────────────────────────────────
class AnimatedCounter {
  constructor(el) {
    this.el = el;
    this.target = parseFloat(el.dataset.count ?? el.textContent);
    this.duration = parseFloat(el.dataset.duration ?? 2000);
    this.decimals = parseInt(el.dataset.decimals ?? 0);
    this.prefix = el.dataset.prefix ?? '';
    this.suffix = el.dataset.suffix ?? '';
    this.easing = el.dataset.easing ?? 'easeOut';
    this.start = 0;
    this.startTime = null;
    this.ran = false;
  }

  ease(t) {
    switch (this.easing) {
      case 'easeOut': return 1 - Math.pow(1 - t, 3);
      case 'easeIn': return t * t * t;
      case 'easeInOut': return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
      case 'linear': return t;
      default: return 1 - Math.pow(1 - t, 3);
    }
  }

  format(val) {
    const num = val.toFixed(this.decimals);
    // Add commas
    return this.prefix + parseFloat(num).toLocaleString('en-US', {
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals
    }) + this.suffix;
  }

  animate(timestamp) {
    if (!this.startTime) this.startTime = timestamp;
    const elapsed = timestamp - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const eased = this.ease(progress);
    const current = this.start + (this.target - this.start) * eased;
    this.el.textContent = this.format(current);
    if (progress < 1) {
      requestAnimationFrame((ts) => this.animate(ts));
    } else {
      this.el.textContent = this.format(this.target);
    }
  }

  run() {
    if (this.ran) return;
    this.ran = true;
    requestAnimationFrame((ts) => this.animate(ts));
  }
}

// ─── STAT COUNTER OBSERVER ────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = new AnimatedCounter(entry.target);
        counter.run();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => {
    // Set initial text
    const suffix = el.dataset.suffix ?? '';
    const prefix = el.dataset.prefix ?? '';
    el.textContent = prefix + '0' + suffix;
    observer.observe(el);
  });
}

// ─── COUNTDOWN TIMER ──────────────────────────────────────────
class CountdownTimer {
  constructor(el) {
    this.el = el;
    this.target = new Date(el.dataset.countdown);
    this.elements = {
      days: el.querySelector('[data-cd-days]'),
      hours: el.querySelector('[data-cd-hours]'),
      minutes: el.querySelector('[data-cd-mins]'),
      seconds: el.querySelector('[data-cd-secs]'),
    };
    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);
  }

  tick() {
    const now = new Date();
    const diff = this.target - now;
    if (diff <= 0) {
      clearInterval(this.interval);
      Object.values(this.elements).forEach(el => { if (el) el.textContent = '00'; });
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    if (this.elements.days) this.elements.days.textContent = String(days).padStart(2, '0');
    if (this.elements.hours) this.elements.hours.textContent = String(hours).padStart(2, '0');
    if (this.elements.minutes) this.elements.minutes.textContent = String(mins).padStart(2, '0');
    if (this.elements.seconds) this.elements.seconds.textContent = String(secs).padStart(2, '0');
  }

  destroy() { clearInterval(this.interval); }
}

function initCountdowns() {
  document.querySelectorAll('[data-countdown]').forEach(el => {
    new CountdownTimer(el);
  });
}

// ─── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCounters();
  initCountdowns();
});

window.AnimatedCounter = AnimatedCounter;
window.CountdownTimer = CountdownTimer;
