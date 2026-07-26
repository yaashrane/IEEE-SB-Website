# IEEE Student Branch — Official Website

A premium, fully responsive website for the IEEE Student Branch — built with pure HTML, CSS, and Vanilla JavaScript. No frameworks. No dependencies.

---

## Live Preview

> Run locally with:
> ```bash
> python -m http.server 3000
> ```
> Then open `http://localhost:3000`

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, stats, events preview, chapters, timeline, gallery teaser, blog preview |
| Events | `events.html` | Featured event, countdown timer, card & list view, filters |
| Team | `team.html` | Leadership board, member grid, chapter filter |
| Gallery | `gallery.html` | Masonry grid, lightbox, category filter |
| Blog | `blog.html` | Article listing, search, category filter, sidebar |
| Blog Post | `blog-post.html` | Full article, reading progress, TOC, related posts |
| Admin | `admin.html` | Dashboard, analytics, members, events, blog, gallery management |

---

## Project Structure

```
IEEE-SB-Website/
├── assets/                        # Images, icons (future use)
├── css/
│   ├── base/
│   │   ├── globals.css            # Design tokens, reset, typography
│   │   └── animations.css         # Keyframes & motion system
│   ├── components-styles/
│   │   ├── components.css         # Reusable UI components
│   │   └── premium.css            # Premium interactions & effects
│   └── pages/
│       ├── home.css
│       ├── events.css
│       ├── team.css
│       ├── gallery.css
│       ├── blog.css
│       └── admin.css
├── js/
│   ├── core.js                    # Preloader, theme, cursor, nav, scroll
│   ├── animations.js              # Scroll reveal, parallax, stagger
│   ├── counters.js                # Animated number counters & countdown
│   ├── magnetic.js                # Magnetic buttons, card tilt, hover lighting
│   ├── particles.js               # Canvas particle system & aurora background
│   └── premium-interactions.js    # Premium UI enhancements
├── docs/                          # Documentation & guides
├── index.html
├── events.html
├── team.html
├── gallery.html
├── blog.html
├── blog-post.html
├── admin.html
└── render.yaml                    # Render.com deployment config
```

---

## Features

### UI & Design
- Dark / Light mode toggle
- Glassmorphic floating navbar with scroll hide/show
- Custom animated cursor with glow trail
- Scroll progress bar
- Premium loading screen (preloader)
- Command palette (`Ctrl+K` / `⌘K`)
- Toast notifications
- Back to top button

### Animations & Interactions
- Scroll-triggered reveal animations
- Staggered card entrance animations
- Mouse parallax & scroll parallax
- Magnetic buttons with spring physics
- 3D card tilt effect
- Hover lighting (mouse-position radial glow)
- Animated number counters (count-up on scroll)
- Live countdown timers
- Canvas particle system (hero background)
- Aurora blob background animations

### Sections (Home)
- Hero with particle canvas
- Stats bar with animated counters
- Marquee ticker
- Events preview with countdown
- Achievements grid
- Research & Innovation with animated SVG
- IEEE Chapters grid
- Timeline
- Gallery teaser
- Blog preview
- Newsletter signup
- Footer

### Other Pages
- **Events** — card/list view toggle, category filters, featured event countdown
- **Team** — leadership cards with animated border ring, member grid with chapter filter
- **Gallery** — masonry layout, lightbox with keyboard navigation, category filter
- **Blog** — search, category filter, sticky sidebar, trending posts
- **Blog Post** — reading progress bar, table of contents, related articles
- **Admin** — full dashboard with charts, member/event/blog/gallery management

---

## Tech Stack

| Technology | Usage |
|------------|-------|
| HTML5 | Semantic markup, accessibility |
| CSS3 | Custom properties, Grid, Flexbox, animations |
| Vanilla JavaScript | All interactivity, no frameworks |
| Canvas API | Particle system, analytics chart |
| Intersection Observer | Scroll reveals, lazy loading |
| Google Fonts | Inter + JetBrains Mono |

---

## Design System

- **Primary Font** — Inter
- **Mono Font** — JetBrains Mono
- **Accent Colors** — Indigo `#6366f1` · Violet `#8b5cf6` · Cyan `#06b6d4` · Pink `#ec4899` · Emerald `#10b981`
- **Background** — `#020205` (dark) / `#fafafa` (light)
- **Border Radius** — 6px → 48px scale
- **Transitions** — Spring & cubic-bezier easing throughout

---

## Deployment

This project is configured for **Render.com** via `render.yaml`.

To deploy on any static host (Netlify, Vercel, GitHub Pages):
1. Push this repo to GitHub
2. Connect the repo to your hosting platform
3. Set publish directory to `/` (root)
4. No build step required

---

## License

© 2025 IEEE Student Branch. All rights reserved.
