/* ============================================================
   CORE.JS — App Init, Theme, Cursor, Preloader, Nav, Back-to-Top
   Command Palette, Smooth Scroll, Ripple Effects
   IEEE SB Premium Website
   ============================================================ */

'use strict';

// ─── PRELOADER ────────────────────────────────────────────────
const Preloader = {
  el: null,
  init() {
    this.el = document.getElementById('preloader');
    if (!this.el) return;
    window.addEventListener('load', () => {
      setTimeout(() => this.hide(), 1600);
    });
    // Fallback: hide after 3s no matter what
    setTimeout(() => this.hide(), 3000);
  },
  hide() {
    if (!this.el || this.el.classList.contains('hidden')) return;
    this.el.classList.add('hidden');
    setTimeout(() => {
      this.el.style.display = 'none';
      document.body.style.overflow = '';
    }, 700);
  }
};

// ─── THEME ────────────────────────────────────────────────────
const Theme = {
  key: 'ieee-theme',
  toggle: null,
  init() {
    const saved = localStorage.getItem(this.key) || 'dark';
    this.apply(saved);
    this.toggle = document.querySelectorAll('[data-theme-toggle]');
    this.toggle.forEach(btn => {
      btn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        this.apply(next);
        localStorage.setItem(this.key, next);
      });
    });
  },
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    });
  }
};

// ─── CUSTOM CURSOR ────────────────────────────────────────────
const Cursor = {
  dot: null,
  ring: null,
  glow: null,
  trail: [],
  trailMax: 8,
  mx: 0, my: 0,
  rx: 0, ry: 0,
  init() {
    if (window.matchMedia('(max-width: 480px)').matches || 'ontouchstart' in window) return;
    this.dot = document.getElementById('cursor-dot');
    this.ring = document.getElementById('cursor-ring');
    this.glow = document.getElementById('cursor-glow');
    if (!this.dot) return;

    // Create trail elements
    for (let i = 0; i < this.trailMax; i++) {
      const t = document.createElement('div');
      t.className = 'cursor-trail';
      t.style.cssText = `opacity:${(1 - i / this.trailMax) * 0.35};width:${6 - i * 0.5}px;height:${6 - i * 0.5}px`;
      document.body.appendChild(t);
      this.trail.push({ el: t, x: 0, y: 0 });
    }

    document.addEventListener('mousemove', (e) => {
      this.mx = e.clientX;
      this.my = e.clientY;
      if (this.dot) {
        this.dot.style.left = this.mx + 'px';
        this.dot.style.top = this.my + 'px';
      }
    });
    this.animate();

    // Click ripple
    document.addEventListener('click', (e) => this.spawnRipple(e.clientX, e.clientY));

    // Cursor states
    document.querySelectorAll('a, button, [role="button"], label, .cursor-pointer').forEach(el => {
      el.addEventListener('mouseenter', () => this.setHover(true));
      el.addEventListener('mouseleave', () => this.setHover(false));
    });

    document.addEventListener('mouseleave', () => {
      if (this.dot) this.dot.style.opacity = '0';
      if (this.ring) this.ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      if (this.dot) this.dot.style.opacity = '1';
      if (this.ring) this.ring.style.opacity = '1';
    });
  },
  animate() {
    // Fast, responsive lerp (0.38) so ring & glow track cursor in tight sync
    this.rx += (this.mx - this.rx) * 0.38;
    this.ry += (this.my - this.ry) * 0.38;
    
    if (this.ring) {
      this.ring.style.left = this.rx + 'px';
      this.ring.style.top = this.ry + 'px';
    }
    if (this.glow) {
      this.glow.style.left = this.rx + 'px';
      this.glow.style.top = this.ry + 'px';
    }
    // Trail interpolation locked to smoothed coordinates
    let px = this.rx, py = this.ry;
    this.trail.forEach((t, i) => {
      const lag = 0.35 - i * 0.02;
      t.x += (px - t.x) * Math.max(0.1, lag);
      t.y += (py - t.y) * Math.max(0.1, lag);
      t.el.style.left = t.x + 'px';
      t.el.style.top = t.y + 'px';
      px = t.x; py = t.y;
    });
    requestAnimationFrame(() => this.animate());
  },
  setHover(on) {
    if (this.dot) {
      this.dot.style.transform = on ? 'translate(-50%,-50%) scale(2.5)' : 'translate(-50%,-50%) scale(1)';
      this.dot.style.opacity = on ? '0.3' : '1';
    }
    if (this.ring) {
      this.ring.style.width = on ? '60px' : '36px';
      this.ring.style.height = on ? '60px' : '36px';
      this.ring.style.borderColor = on ? 'rgba(99,102,241,1)' : 'rgba(99,102,241,0.6)';
    }
  },
  spawnRipple(x, y) {
    const r = document.createElement('div');
    r.className = 'cursor-click-ripple';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }
};

// ─── NAVIGATION ───────────────────────────────────────────────
const Nav = {
  nav: null,
  hamburger: null,
  mobileMenu: null,
  init() {
    this.nav = document.querySelector('.nav');
    this.hamburger = document.querySelector('.nav__hamburger');
    this.mobileMenu = document.querySelector('.nav__mobile-menu');
    if (!this.nav) return;

    // Scroll effect
    window.addEventListener('scroll', () => {
      this.nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // Mobile menu
    if (this.hamburger && this.mobileMenu) {
      this.hamburger.addEventListener('click', () => {
        const open = this.hamburger.classList.toggle('open');
        this.mobileMenu.classList.toggle('open', open);
      });
    }

    // Active link
    const links = document.querySelectorAll('.nav__link');
    const current = location.pathname.split('/').pop() || 'index.html';
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });

    // Close mobile on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        this.hamburger?.classList.remove('open');
        this.mobileMenu?.classList.remove('open');
      });
    });
  }
};

// ─── SCROLL PROGRESS ──────────────────────────────────────────
const ScrollProgress = {
  bar: null,
  init() {
    this.bar = document.getElementById('scroll-progress');
    if (!this.bar) return;
    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const pct = (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100;
      this.bar.style.width = pct + '%';
    }, { passive: true });
  }
};

// ─── BACK TO TOP ──────────────────────────────────────────────
const BackToTop = {
  btn: null,
  init() {
    this.btn = document.getElementById('back-to-top');
    if (!this.btn) return;
    window.addEventListener('scroll', () => {
      this.btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    this.btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};

// ─── COMMAND PALETTE ──────────────────────────────────────────
const CommandPalette = {
  el: null,
  input: null,
  items: [],
  selectedIndex: 0,
  commands: [
    { name: 'Home', desc: 'Go to homepage', icon: '🏠', href: 'index.html', kbd: 'G H' },
    { name: 'Team', desc: 'Meet the team', icon: '👥', href: 'team.html', kbd: 'G T' },
    { name: 'Events', desc: 'Upcoming events', icon: '📅', href: 'events.html', kbd: 'G E' },
    { name: 'Gallery', desc: 'Photo gallery', icon: '🖼️', href: 'gallery.html', kbd: 'G G' },
    { name: 'Blog', desc: 'Read our articles', icon: '✍️', href: 'blog.html', kbd: 'G B' },
    { name: 'Admin', desc: 'Admin dashboard', icon: '⚙️', href: 'admin.html', kbd: 'G A' },
    { name: 'Toggle Theme', desc: 'Switch dark/light mode', icon: '🌓', action: 'theme', kbd: 'T' },
    { name: 'Scroll to Top', desc: 'Go back to top', icon: '⬆️', action: 'top', kbd: 'T T' },
    { name: 'IEEE Website', desc: 'ieee.org', icon: '🔗', href: 'https://ieee.org', external: true },
  ],
  init() {
    this.el = document.getElementById('cmd-palette');
    if (!this.el) return;
    this.input = this.el.querySelector('.cmd-palette__input');
    this.results = this.el.querySelector('.cmd-palette__results');

    // Keyboard shortcut to open
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.el.classList.contains('open')) {
        this.close();
      }
      if (this.el.classList.contains('open')) {
        if (e.key === 'ArrowDown') { e.preventDefault(); this.navigate(1); }
        if (e.key === 'ArrowUp') { e.preventDefault(); this.navigate(-1); }
        if (e.key === 'Enter') { this.execute(); }
      }
    });

    // Open buttons
    document.querySelectorAll('[data-cmd-open]').forEach(btn => {
      btn.addEventListener('click', () => this.open());
    });

    // Backdrop close
    this.el.querySelector('.cmd-palette__backdrop')?.addEventListener('click', () => this.close());

    // Input filter
    this.input?.addEventListener('input', (e) => this.filter(e.target.value));

    this.render(this.commands);
  },
  open() {
    this.el.classList.add('open');
    this.input?.focus();
    this.filter('');
  },
  close() {
    this.el.classList.remove('open');
    if (this.input) this.input.value = '';
  },
  toggle() {
    this.el.classList.contains('open') ? this.close() : this.open();
  },
  filter(q) {
    const query = q.toLowerCase();
    const filtered = query
      ? this.commands.filter(c => c.name.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query))
      : this.commands;
    this.render(filtered);
  },
  render(cmds) {
    if (!this.results) return;
    this.selectedIndex = 0;
    this.items = cmds;
    this.results.innerHTML = cmds.length === 0
      ? `<div class="cmd-palette__item" style="color:var(--text-muted)"><span>No results found</span></div>`
      : cmds.map((cmd, i) => `
        <div class="cmd-palette__item ${i === 0 ? 'selected' : ''}" data-index="${i}">
          <div class="cmd-palette__item-icon">${cmd.icon}</div>
          <div>
            <div class="cmd-palette__item-name">${cmd.name}</div>
            <div class="cmd-palette__item-desc">${cmd.desc}</div>
          </div>
          ${cmd.kbd ? `<span class="cmd-palette__item-kbd">${cmd.kbd}</span>` : ''}
        </div>
      `).join('');

    this.results.querySelectorAll('.cmd-palette__item').forEach((el, i) => {
      el.addEventListener('click', () => { this.selectedIndex = i; this.execute(); });
    });
  },
  navigate(dir) {
    const els = this.results?.querySelectorAll('.cmd-palette__item');
    if (!els || els.length === 0) return;
    els[this.selectedIndex]?.classList.remove('selected');
    this.selectedIndex = Math.max(0, Math.min(els.length - 1, this.selectedIndex + dir));
    els[this.selectedIndex]?.classList.add('selected');
    els[this.selectedIndex]?.scrollIntoView({ block: 'nearest' });
  },
  execute() {
    const cmd = this.items[this.selectedIndex];
    if (!cmd) return;
    this.close();
    if (cmd.action === 'theme') {
      Theme.apply(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    } else if (cmd.action === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (cmd.href) {
      if (cmd.external) window.open(cmd.href, '_blank');
      else window.location.href = cmd.href;
    }
  }
};

// ─── RIPPLE EFFECT ─────────────────────────────────────────────
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size/2}px;
        top: ${e.clientY - rect.top - size/2}px;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ─── TOAST ────────────────────────────────────────────────────
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { info: 'ℹ️', success: '✅', error: '❌' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast__icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// ─── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.overflow = 'hidden'; // Lock during preloader
  Preloader.init();
  Theme.init();
  Cursor.init();
  Nav.init();
  ScrollProgress.init();
  BackToTop.init();
  CommandPalette.init();
  initRipple();
});
