/* ============================================================
   MAGNETIC.JS — Magnetic Buttons & Card Tilt Effects
   IEEE SB Premium Website
   ============================================================ */

'use strict';

// ─── MAGNETIC BUTTONS ─────────────────────────────────────────
class MagneticButton {
  constructor(el) {
    this.el = el;
    this.inner = el.querySelector('.magnetic-inner') || el;
    this.strength = parseFloat(el.dataset.magnetic ?? 0.35);
    this.bound = {
      enter: this.onEnter.bind(this),
      move: this.onMove.bind(this),
      leave: this.onLeave.bind(this),
    };
    this.el.addEventListener('mouseenter', this.bound.enter);
    this.el.addEventListener('mousemove', this.bound.move);
    this.el.addEventListener('mouseleave', this.bound.leave);
  }

  getCenter() {
    const rect = this.el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      w: rect.width,
      h: rect.height,
    };
  }

  onEnter() {
    this.inner.style.transition = 'transform 0.1s ease';
  }

  onMove(e) {
    const c = this.getCenter();
    const dx = (e.clientX - c.x) * this.strength;
    const dy = (e.clientY - c.y) * this.strength;
    this.inner.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  onLeave() {
    this.inner.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    this.inner.style.transform = 'translate(0, 0)';
  }

  destroy() {
    this.el.removeEventListener('mouseenter', this.bound.enter);
    this.el.removeEventListener('mousemove', this.bound.move);
    this.el.removeEventListener('mouseleave', this.bound.leave);
  }
}

// ─── CARD TILT (3D SPATIAL & MAGNETIC SNAP ENGINE) ───────────
class CardTilt {
  constructor(el) {
    this.el = el;
    this.maxTilt = parseFloat(el.dataset.tilt ?? 12);
    this.perspective = parseFloat(el.dataset.perspective ?? 1000);
    this.innerElements = el.querySelectorAll('.event-card__image, .event-card__title, .achievement-card__icon, .chapter-card__icon, .badge');

    // Create 3D Specular Glare Overlay
    this.glareEl = document.createElement('div');
    this.glareEl.className = 'tilt-glare-overlay';
    this.glareEl.style.cssText = `
      position: absolute; inset: 0; border-radius: inherit;
      background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22) 0%, rgba(99,102,241,0.12) 40%, transparent 75%);
      pointer-events: none; opacity: 0; transition: opacity 0.3s ease, background 0.1s ease;
      z-index: 10; mix-blend-mode: overlay;
    `;
    this.el.style.position = this.el.style.position || 'relative';
    this.el.style.transformStyle = 'preserve-3d';
    this.el.appendChild(this.glareEl);

    this.bound = {
      move: this.onMove.bind(this),
      leave: this.onLeave.bind(this),
    };
    this.el.addEventListener('mousemove', this.bound.move);
    this.el.addEventListener('mouseleave', this.bound.leave);
  }

  onMove(e) {
    const rect = this.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    
    // Calculate 3D Spatial Angles
    const tiltX = -dy * this.maxTilt;
    const tiltY = dx * this.maxTilt;

    // Apply 3D Perspective Transformation & Magnetic Lift
    this.el.style.transition = 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease';
    this.el.style.transform = `perspective(${this.perspective}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(16px) scale3d(1.03, 1.03, 1.03)`;
    this.el.style.boxShadow = `0 25px 50px -12px rgba(0, 0, 0, 0.6), ${-tiltY * 3}px ${tiltX * 3}px 35px rgba(99, 102, 241, 0.35)`;

    // 3D Layer Elevation (Depth Lift for Child Elements)
    this.innerElements.forEach(item => {
      item.style.transition = 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)';
      item.style.transform = `translateZ(25px)`;
    });

    // Dynamic Specular Reflection Light Tracker
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;
    this.glareEl.style.opacity = '1';
    this.glareEl.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255,255,255,0.28) 0%, rgba(6,182,212,0.15) 35%, transparent 70%)`;
  }

  onLeave() {
    this.el.style.transition = 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.65s ease';
    this.el.style.transform = `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)`;
    this.el.style.boxShadow = '';
    
    this.innerElements.forEach(item => {
      item.style.transition = 'transform 0.65s ease';
      item.style.transform = 'translateZ(0px)';
    });

    this.glareEl.style.opacity = '0';
  }

  destroy() {
    this.el.removeEventListener('mousemove', this.bound.move);
    this.el.removeEventListener('mouseleave', this.bound.leave);
    if (this.glareEl) this.glareEl.remove();
  }
}

// ─── HOVER LIGHTING ───────────────────────────────────────────
function initHoverLighting() {
  document.querySelectorAll('[data-hover-light]').forEach(el => {
    el.style.position = el.style.position || 'relative';
    el.style.overflow = el.style.overflow || 'hidden';

    const light = document.createElement('div');
    light.style.cssText = `
      position:absolute;width:280px;height:280px;
      background:radial-gradient(ellipse,rgba(255,255,255,0.09) 0%,transparent 65%);
      border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);
      opacity:0;transition:opacity 0.3s ease;z-index:0;will-change:transform;
    `;
    el.appendChild(light);

    el.addEventListener('mouseenter', () => { light.style.opacity = '1'; });
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      light.style.left = (e.clientX - rect.left) + 'px';
      light.style.top = (e.clientY - rect.top) + 'px';
    });
    el.addEventListener('mouseleave', () => { light.style.opacity = '0'; });
  });
}

// ─── CARD SPOTLIGHT ───────────────────────────────────────────
function initCardSpotlight() {
  document.querySelectorAll('.chapter-card, .achievement-card, .blog-card, .event-card').forEach(card => {
    card.style.position = card.style.position || 'relative';
    const spot = document.createElement('div');
    spot.className = 'card-spotlight';
    card.appendChild(spot);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spot.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(99,102,241,0.12) 0%, transparent 60%)`;
      spot.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => { spot.style.opacity = '0'; });
  });
}

// ─── INIT ──────────────────────────────────────────────────────
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(el => new MagneticButton(el));
}

function initCardTilt() {
  // Skip on touch devices
  if ('ontouchstart' in window) return;
  document.querySelectorAll('[data-tilt]').forEach(el => new CardTilt(el));
}

function bootMagnetic() {
  initMagnetic();
  initCardTilt();
  initHoverLighting();
  initCardSpotlight();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  bootMagnetic();
} else {
  document.addEventListener('DOMContentLoaded', bootMagnetic);
}

window.MagneticButton = MagneticButton;
window.CardTilt = CardTilt;
