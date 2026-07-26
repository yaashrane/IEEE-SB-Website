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

// ─── CARD TILT ────────────────────────────────────────────────
class CardTilt {
  constructor(el) {
    this.el = el;
    this.maxTilt = parseFloat(el.dataset.tilt ?? 8);
    this.glare = el.dataset.tiltGlare !== undefined;
    this.glareEl = null;

    if (this.glare) {
      this.glareEl = document.createElement('div');
      this.glareEl.style.cssText = `
        position: absolute; inset: 0; border-radius: inherit;
        background: radial-gradient(ellipse at 0% 0%, rgba(255,255,255,0.15) 0%, transparent 60%);
        pointer-events: none; opacity: 0; transition: opacity 0.3s ease;
        z-index: 1;
      `;
      this.el.style.position = this.el.style.position || 'relative';
      this.el.appendChild(this.glareEl);
    }

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
    const tiltX = -dy * this.maxTilt;
    const tiltY = dx * this.maxTilt;

    this.el.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
    this.el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;

    if (this.glareEl) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      this.glareEl.style.background = `radial-gradient(ellipse at ${glareX}% ${glareY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
      this.glareEl.style.opacity = '1';
    }
  }

  onLeave() {
    this.el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.6s ease';
    this.el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    if (this.glareEl) this.glareEl.style.opacity = '0';
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
      position: absolute; width: 200px; height: 200px;
      background: radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 60%);
      border-radius: 50%; pointer-events: none; transform: translate(-50%, -50%);
      opacity: 0; transition: opacity 0.3s ease; z-index: 0;
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

// ─── INIT ──────────────────────────────────────────────────────
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(el => new MagneticButton(el));
}

function initCardTilt() {
  // Skip on touch devices
  if ('ontouchstart' in window) return;
  document.querySelectorAll('[data-tilt]').forEach(el => new CardTilt(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initMagnetic();
  initCardTilt();
  initHoverLighting();
});

window.MagneticButton = MagneticButton;
window.CardTilt = CardTilt;
