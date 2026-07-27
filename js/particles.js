/* ============================================================
   PARTICLES.JS — Canvas Particle System
   IEEE SB Premium Website
   ============================================================ */

'use strict';

class ParticleSystem {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.connections = [];
    this.mouse = { x: null, y: null, radius: 120 };
    this.animId = null;
    this.options = {
      count: options.count ?? 70,
      speed: options.speed ?? 0.4,
      size: options.size ?? { min: 1, max: 2.5 },
      color: options.color ?? '99, 102, 241',
      connectColor: options.connectColor ?? '99, 102, 241',
      connectDist: options.connectDist ?? 130,
      connectOpacity: options.connectOpacity ?? 0.15,
      mouseRepel: options.mouseRepel ?? false,
      mouseAttract: options.mouseAttract ?? false,
      twinkle: options.twinkle ?? true,
      ...options
    };
    this.isVisible = true;
    this.resize();
    this.initParticles();
    this.bindEvents();
    this.setupObserver();
    this.animate();
  }

  setupObserver() {
    this.isVisible = true;
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent ? parent.offsetWidth : window.innerWidth;
    this.canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    this.W = this.canvas.width;
    this.H = this.canvas.height;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.options.count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle(x, y) {
    const { size, speed, color, twinkle } = this.options;
    return {
      x: x ?? Math.random() * this.W,
      y: y ?? Math.random() * this.H,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: size.min + Math.random() * (size.max - size.min),
      color,
      opacity: 0.2 + Math.random() * 0.6,
      twinkleSpeed: twinkle ? 0.01 + Math.random() * 0.02 : 0,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      life: 1,
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initParticles();
    });
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Twinkle
      if (p.twinkleSpeed) {
        p.opacity += p.twinkleSpeed * p.twinkleDir;
        if (p.opacity >= 0.8 || p.opacity <= 0.15) p.twinkleDir *= -1;
      }

      // Mouse interaction
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          if (this.options.mouseRepel) {
            p.x += (dx / dist) * force * 2;
            p.y += (dy / dist) * force * 2;
          } else if (this.options.mouseAttract) {
            p.x -= (dx / dist) * force * 1.5;
            p.y -= (dy / dist) * force * 1.5;
          }
        }
      }

      // Boundary wrapping
      if (p.x < -10) p.x = this.W + 10;
      if (p.x > this.W + 10) p.x = -10;
      if (p.y < -10) p.y = this.H + 10;
      if (p.y > this.H + 10) p.y = -10;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.W, this.H);

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.options.connectDist) {
          const opacity = (1 - dist / this.options.connectDist) * this.options.connectOpacity;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(${this.options.connectColor}, ${opacity})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }

    // Draw particles
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      this.ctx.fill();

      // Glow
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      gradient.addColorStop(0, `rgba(${p.color}, ${p.opacity * 0.4})`);
      gradient.addColorStop(1, `rgba(${p.color}, 0)`);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });
  animate() {
    if (!this.isVisible) {
      this.animId = null;
      return;
    }
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.observer) this.observer.disconnect();
  }
}

// ─── AURORA BACKGROUND ────────────────────────────────────────
class AuroraBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.blobs = [];
    this.t = 0;
    this.resize();
    this.initBlobs();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.W = this.canvas.width;
    this.H = this.canvas.height;
  }

  initBlobs() {
    this.blobs = [
      { x: 0.3, y: 0.3, r: 0.45, colors: ['rgba(99,102,241,0.4)', 'rgba(99,102,241,0)'], speed: 0.0008, phase: 0 },
      { x: 0.7, y: 0.6, r: 0.40, colors: ['rgba(139,92,246,0.3)', 'rgba(139,92,246,0)'], speed: 0.001, phase: 2 },
      { x: 0.5, y: 0.8, r: 0.35, colors: ['rgba(6,182,212,0.25)', 'rgba(6,182,212,0)'], speed: 0.0006, phase: 4 },
      { x: 0.15, y: 0.7, r: 0.30, colors: ['rgba(236,72,153,0.2)', 'rgba(236,72,153,0)'], speed: 0.0012, phase: 1 },
    ];
  }

  animate() {
    this.t += 1;
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.blobs.forEach(blob => {
      const x = (blob.x + Math.sin(this.t * blob.speed + blob.phase) * 0.08) * this.W;
      const y = (blob.y + Math.cos(this.t * blob.speed * 1.3 + blob.phase) * 0.06) * this.H;
      const r = blob.r * Math.min(this.W, this.H);
      const grad = this.ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, blob.colors[0]);
      grad.addColorStop(1, blob.colors[1]);
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = grad;
      this.ctx.fill();
    });
    requestAnimationFrame(() => this.animate());
  }
}

window.ParticleSystem = ParticleSystem;
window.AuroraBackground = AuroraBackground;
