/* ============================================================
   PREMIUM-INTERACTIONS.JS — Advanced Interactions & Effects
   IEEE SB Premium Website - All Premium Enhancements
   ============================================================ */

'use strict';

// ─── NAVBAR SMOOTH HIDE/SHOW ON SCROLL ──────────────────────
const NavbarHideShow = {
  lastScrollY: 0,
  navElement: null,
  ticking: false,
  scrollThreshold: 10,

  init() {
    this.navElement = document.querySelector('.nav');
    if (!this.navElement) return;

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
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - this.lastScrollY;

    // Hide navbar when scrolling down, show when scrolling up
    if (scrollDelta > this.scrollThreshold && currentScrollY > 100) {
      this.navElement?.classList.add('hide');
    } else if (scrollDelta < -this.scrollThreshold || currentScrollY < 100) {
      this.navElement?.classList.remove('hide');
    }

    this.lastScrollY = currentScrollY;
  }
};

// ─── MOUSE LIGHTING EFFECT ──────────────────────────────────
const MouseLighting = {
  light: null,
  mouseX: 0,
  mouseY: 0,
  currentX: 0,
  currentY: 0,
  ticking: false,

  init() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    this.light = document.createElement('div');
    this.light.className = 'mouse-light';
    this.light.style.cssText = `
      position: fixed; top: 0; left: 0; width: 450px; height: 450px;
      background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(6,182,212,0.08) 45%, transparent 70%);
      border-radius: 50%; pointer-events: none; z-index: 1;
      mix-blend-mode: screen; will-change: transform; transition: opacity 0.4s ease;
    `;
    document.body.appendChild(this.light);

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      document.body.classList.add('mouse-active');
    }, { passive: true });

    document.addEventListener('mouseleave', () => document.body.classList.remove('mouse-active'));
    document.addEventListener('mouseenter', () => document.body.classList.add('mouse-active'));

    this.animateLight();
  },

  animateLight() {
    this.currentX += (this.mouseX - this.currentX) * 0.08;
    this.currentY += (this.mouseY - this.currentY) * 0.08;
    if (this.light) {
      this.light.style.transform = `translate(calc(${this.currentX}px - 50%), calc(${this.currentY}px - 50%))`;
    }
    requestAnimationFrame(() => this.animateLight());
  }
};

// ─── PAGE TRANSITION EFFECT ─────────────────────────────────
const PageTransition = {
  activeTransition: null,

  init() {
    // Add transition element
    const transition = document.createElement('div');
    transition.className = 'page-transition';
    document.body.appendChild(transition);
    this.activeTransition = transition;

    // Intercept link clicks
    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Skip external links, anchors, and JavaScript links
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || 
            link.target === '_blank' || link.hasAttribute('download')) {
          return;
        }

        // Check if it's same domain
        try {
          const url = new URL(href, window.location.origin);
          if (url.origin !== window.location.origin) return;
        } catch {
          return;
        }

        e.preventDefault();
        this.transitionTo(href);
      });
    });
  },

  transitionTo(href) {
    if (!this.activeTransition) return;

    // Fade out
    this.activeTransition.classList.add('active');

    setTimeout(() => {
      window.location.href = href;
    }, 150);
  },

  onPageLoad() {
    if (!this.activeTransition) return;
    this.activeTransition.classList.remove('active');
  }
};

// ─── DEPTH PARALLAX BACKGROUND ──────────────────────────────
const DepthParallax = {
  depthLayer: null,
  parallaxStrength: 0.5,
  ticking: false,

  init() {
    // Skip on mobile
    if (window.matchMedia('(max-width: 768px)').matches) return;

    // Find or create depth layer
    this.depthLayer = document.querySelector('.depth-layer');
    if (!this.depthLayer) {
      this.depthLayer = document.createElement('div');
      this.depthLayer.className = 'depth-layer';
      document.body.insertBefore(this.depthLayer, document.body.firstChild);

      // Add floating particles
      for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        this.depthLayer.appendChild(particle);
      }
    }

    // Mouse parallax for depth layer elements
    document.addEventListener('mousemove', (e) => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateParallax(e);
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });
  },

  updateParallax(e) {
    if (!this.depthLayer) return;
    const particles = this.depthLayer.querySelectorAll('.floating-particle');
    
    particles.forEach((particle, i) => {
      const strength = (i + 1) * this.parallaxStrength;
      const moveX = (e.clientX / window.innerWidth - 0.5) * 40 * strength;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 40 * strength;
      
      particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }
};

// ─── SECTION ANIMATIONS ON SCROLL ───────────────────────────
const SectionAnimations = {
  observer: null,

  init() {
    const sections = document.querySelectorAll('.section');
    if (!sections.length) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
          
          // Stagger children
          const children = entry.target.querySelectorAll('[class*="reveal"]');
          children.forEach((child, i) => {
            child.style.animationDelay = (i * 0.1 + 0.2) + 's';
          });
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    sections.forEach(section => this.observer.observe(section));
  }
};

// ─── ENHANCED CARD INTERACTIONS ──────────────────────────────
const PremiumCards = {
  init() {
    // Dynamic shadow on hover
    const cards = document.querySelectorAll('.premium-card, .event-card, .team-card, .gallery-item');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tiltX = (y - rect.height / 2) / rect.height * 5;
        const tiltY = (x - rect.width / 2) / rect.width * -5;
        const shadowX = (x / rect.width - 0.5) * 20;
        const shadowY = (y / rect.height - 0.5) * 20;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        card.style.boxShadow = `${shadowX}px ${shadowY + 20}px 60px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.1)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        card.style.boxShadow = '';
      });
    });
  }
};

// ─── SMOOTH SCROLL BEHAVIOR ─────────────────────────────────
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

// ─── READING PROGRESS BAR ────────────────────────────────────
const ReadingProgress = {
  bar: null,

  init() {
    this.bar = document.querySelector('.reading-progress');
    if (!this.bar) return;

    window.addEventListener('scroll', () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = window.scrollY;
      const progress = windowHeight > 0 ? (scrolled / windowHeight) * 100 : 0;
      this.bar.style.width = progress + '%';
    }, { passive: true });
  }
};

// ─── BLOG INTERACTIONS ───────────────────────────────────────
const BlogInteractions = {
  init() {
    // Bookmark button
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    bookmarkBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('bookmarked');
        const isBookmarked = btn.classList.contains('bookmarked');
        btn.innerHTML = isBookmarked ? '❤️' : '🔖';
      });
    });

    // Share buttons
    const shareBtns = document.querySelectorAll('.share-btn');
    shareBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const shareType = btn.dataset.share;
        const title = document.title;
        const url = window.location.href;
        const text = `Check this out: ${title}`;

        if (navigator.share) {
          navigator.share({ title, url, text });
        } else {
          showToast(`Share: ${shareType}`, 'info');
        }
      });
    });
  }
};

// ─── GALLERY LIGHTBOX ────────────────────────────────────────
const GalleryLightbox = {
  lightbox: null,

  init() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Create lightbox
    this.lightbox = document.createElement('div');
    this.lightbox.className = 'lightbox';
    this.lightbox.innerHTML = `
      <img class="lightbox__image" src="" alt="" />
      <button class="lightbox__close">✕</button>
    `;
    document.body.appendChild(this.lightbox);

    const image = this.lightbox.querySelector('img');
    const closeBtn = this.lightbox.querySelector('.lightbox__close');

    // Open lightbox on item click
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
          image.src = img.src;
          image.alt = img.alt;
          this.lightbox.classList.add('open');
        }
      });
    });

    // Close lightbox
    closeBtn.addEventListener('click', () => this.lightbox.classList.remove('open'));
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.lightbox.classList.remove('open');
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.lightbox.classList.contains('open')) {
        this.lightbox.classList.remove('open');
      }
    });
  }
};

// ─── INIT ALL PREMIUM INTERACTIONS ──────────────────────────
function bootPremiumInteractions() {
  NavbarHideShow.init();
  MouseLighting.init();
  PageTransition.init();
  DepthParallax.init();
  SectionAnimations.init();
  PremiumCards.init();
  SmoothScroll.init();
  ReadingProgress.init();
  BlogInteractions.init();
  GalleryLightbox.init();

  if (document.readyState === 'complete') {
    PageTransition.onPageLoad();
  } else {
    window.addEventListener('load', () => PageTransition.onPageLoad());
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  bootPremiumInteractions();
} else {
  document.addEventListener('DOMContentLoaded', bootPremiumInteractions);
}
