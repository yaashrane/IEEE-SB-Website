/* ============================================================
   IEEEDigitalNetwork — Interactive Digital Network Engine
   IEEE SB Premium Creative Developer Edition
   ============================================================ */

'use strict';

class IEEEDigitalNetwork {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Palette: Electric Blue, Cyan, Soft Purple
    this.colors = {
      blue: '99, 102, 241',
      cyan: '6, 182, 212',
      purple: '139, 92, 246',
      emerald: '16, 185, 129'
    };

    this.options = {
      maxConnectDist: 110,
      mouseRadius: 150,
      ...options
    };

    this.nodes = [];
    this.packets = [];
    this.bursts = [];
    this.mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };
    this.animId = null;
    this.lastTime = performance.now();
    this.grid = new Map();
    this.cellSize = this.options.maxConnectDist;

    this.resize();
    this.initNetwork();
    this.bindEvents();

    if (!this.reducedMotion) {
      this.start();
    } else {
      this.drawStatic();
    }
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.W = this.canvas.width = parent ? parent.offsetWidth : window.innerWidth;
    this.H = this.canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    this.cellSize = this.options.maxConnectDist;
  }

  initNetwork() {
    this.nodes = [];
    this.packets = [];
    this.bursts = [];

    // Adaptive Node Count based on screen size (Optimized for 60 FPS)
    const area = this.W * this.H;
    let baseCount = Math.floor(area / 35000);
    if (this.W <= 480) baseCount = Math.min(12, baseCount);
    else if (this.W <= 768) baseCount = Math.min(20, baseCount);
    else baseCount = Math.min(32, baseCount);

    // Ensure a minimal count so it still looks active
    baseCount = Math.max(10, baseCount);

    // 3 Parallax Layers: 0 (Bg), 1 (Mid), 2 (Fg) - Ultra smooth, slow ambient movement
    const layerDefs = [
      { layer: 0, speed: 0.08, sizeMin: 1.0, sizeMax: 1.8, opacity: 0.20, colorKey: 'purple' },
      { layer: 1, speed: 0.15, sizeMin: 1.8, sizeMax: 2.8, opacity: 0.40, colorKey: 'blue' },
      { layer: 2, speed: 0.25, sizeMin: 2.5, sizeMax: 3.5, opacity: 0.60, colorKey: 'cyan' }
    ];

    for (let i = 0; i < baseCount; i++) {
      const layerIdx = i % 3;
      const def = layerDefs[layerIdx];
      const color = this.colors[def.colorKey];
      
      this.nodes.push({
        id: i,
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        baseX: 0,
        baseY: 0,
        vx: (Math.random() - 0.5) * def.speed,
        vy: (Math.random() - 0.5) * def.speed,
        size: def.sizeMin + Math.random() * (def.sizeMax - def.sizeMin),
        layer: def.layer,
        color,
        baseOpacity: def.opacity,
        opacity: def.opacity,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.01,
        neighbors: []
      });
    }

    // Packets disabled per user request for clean background
    this.packets = [];
  }

  spawnPacket(sourceNode = null, targetNode = null) {
    if (this.nodes.length < 2) return;
    const start = sourceNode || this.nodes[Math.floor(Math.random() * this.nodes.length)];
    let end = targetNode;

    if (!end) {
      // Pick a neighbor or random nearby node
      const candidates = this.nodes.filter(n => n.id !== start.id && this.dist(start, n) < this.options.maxConnectDist * 1.3);
      if (candidates.length > 0) {
        end = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        end = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      }
    }

    if (start && end && start.id !== end.id) {
      this.packets.push({
        from: start,
        to: end,
        progress: 0,
        speed: 0.008 + Math.random() * 0.018,
        size: 1.8 + Math.random() * 1.5,
        color: Math.random() > 0.4 ? this.colors.cyan : this.colors.blue,
        trail: []
      });
    }
  }

  dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initNetwork();
    }, { passive: true });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.targetX = e.clientX - rect.left;
      this.mouse.targetY = e.clientY - rect.top;
      this.mouse.active = true;
    }, { passive: true });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.active = false;
      this.mouse.targetX = -1000;
      this.mouse.targetY = -1000;
    }, { passive: true });

    // Page visibility check for GPU conservation
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else if (!this.reducedMotion) {
        this.start();
      }
    });
  }

  updateGrid() {
    this.grid.clear();
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      const gx = Math.floor(n.x / this.cellSize);
      const gy = Math.floor(n.y / this.cellSize);
      const key = `${gx},${gy}`;
      if (!this.grid.has(key)) this.grid.set(key, []);
      this.grid.get(key).push(n);
    }
  }

  getNearbyNodes(node) {
    const gx = Math.floor(node.x / this.cellSize);
    const gy = Math.floor(node.y / this.cellSize);
    const nearby = [];

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const key = `${gx + x},${gy + y}`;
        if (this.grid.has(key)) {
          const cellNodes = this.grid.get(key);
          for (let i = 0; i < cellNodes.length; i++) {
            if (cellNodes[i].id !== node.id) {
              nearby.push(cellNodes[i]);
            }
          }
        }
      }
    }
    return nearby;
  }

  update() {
    // Smooth mouse coordinates interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.1;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.1;

    // Update Nodes
    this.nodes.forEach(n => {
      // Gently breathe & drift
      n.x += n.vx;
      n.y += n.vy;

      // Wrap boundaries smoothly
      if (n.x < -20) n.x = this.W + 20;
      if (n.x > this.W + 20) n.x = -20;
      if (n.y < -20) n.y = this.H + 20;
      if (n.y > this.H + 20) n.y = -20;

      // Pulse breathing
      n.pulsePhase += n.pulseSpeed;
      const pulseFactor = 0.25 * Math.sin(n.pulsePhase);
      n.opacity = Math.max(0.15, Math.min(1, n.baseOpacity + pulseFactor));

      // Subtle mouse glow expansion without pushing/pulling nodes
      if (this.mouse.active) {
        const d = this.dist(n, this.mouse);
        if (d < this.options.mouseRadius) {
          const factor = (1 - d / this.options.mouseRadius);
          n.opacity = Math.min(1, n.opacity + factor * 0.3);
        }
      }
    });

    // Spatial partitioning lookup for node connections
    this.updateGrid();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.W, this.H);

    // Draw Lines & Connections by Depth Layers
    this.nodes.forEach(n => {
      const nearby = this.getNearbyNodes(n);

      nearby.forEach(target => {
        const d = this.dist(n, target);
        if (d < this.options.maxConnectDist) {
          let alpha = (1 - d / this.options.maxConnectDist) * 0.16 * ((n.opacity + target.opacity) / 2);
          
          // Mouse line illumination
          if (this.mouse.active) {
            const midX = (n.x + target.x) / 2;
            const midY = (n.y + target.y) / 2;
            const mouseDist = Math.hypot(midX - this.mouse.x, midY - this.mouse.y);
            if (mouseDist < this.options.mouseRadius) {
              const mouseGlow = (1 - mouseDist / this.options.mouseRadius);
              alpha += mouseGlow * 0.35;
            }
          }

          this.ctx.beginPath();
          this.ctx.moveTo(n.x, n.y);
          this.ctx.lineTo(target.x, target.y);
          this.ctx.strokeStyle = `rgba(${n.color}, ${Math.min(0.7, alpha)})`;
          this.ctx.lineWidth = n.layer === 2 ? 1.2 : 0.7;
          this.ctx.stroke();
        }
      });
    });



    // Draw Nodes
    this.nodes.forEach(n => {
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${n.color}, ${n.opacity})`;
      this.ctx.fill();

      // Specular Radial Node Bloom
      if (n.layer >= 1) {
        const glowR = n.size * (n.layer === 2 ? 3.5 : 2.5);
        const grad = this.ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        grad.addColorStop(0, `rgba(${n.color}, ${n.opacity * 0.35})`);
        grad.addColorStop(1, `rgba(${n.color}, 0)`);
        this.ctx.beginPath();
        this.ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        this.ctx.fillStyle = grad;
        this.ctx.fill();
      }
    });
  }

  drawStatic() {
    this.update();
    this.draw();
  }

  start() {
    if (this.animId) return;
    const loop = () => {
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  destroy() {
    this.stop();
  }
}

// Backward compatibility aliases
class ParticleSystem extends IEEEDigitalNetwork {
  constructor(canvasId, options = {}) {
    super(canvasId, options);
  }
}

window.IEEEDigitalNetwork = IEEEDigitalNetwork;
window.ParticleSystem = ParticleSystem;

