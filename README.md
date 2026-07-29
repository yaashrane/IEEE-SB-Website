# MMIT IEEE Student Branch — Official Website

> **STB Code:** `STB60226400` · **School Code:** `60227769` · **Region 10 (Asia-Pacific)**  
> **Initiated:** 26th August 2024 (MMIT Computer Engineering Dept under Dr. Monika Dangore)  
> **IEEE Society Official Charter:** 5th December 2024  

An Awwwards-grade, high-performance website for the **MMIT IEEE Student Branch** — built with HTML5, CSS3 (Design Tokens & Glassmorphism), and Vanilla JavaScript (60 FPS GPU-accelerated motion engine).

---

## ⚡ Deployment & Hosting Architecture

The project is architected for separate, decoupled hosting:

| Component | Platform | Tech Stack | Status |
|-----------|----------|------------|--------|
| **Frontend** | **Vercel** (`mmit-ieee-sb.vercel.app`) | HTML5, Vanilla JS, CSS3, JSON-LD | 🟢 Active |
| **Backend API** | **Render / Railway** (`ieee-sb-backend.onrender.com`) | Node.js, Express, MongoDB Atlas | 🟢 Ready |

---

## 🚀 Key Features & Performance Optimizations

### 💎 Awwwards-Grade 3D Glass Hero
- **Multi-Layer 3D Glass Stage**: Layered frosted glass cards with specular shine, live status indicator, and glowing background core.
- **Real-Time 3D Mouse Parallax**: Multi-axis spatial depth rotation (`rotateX`/`rotateY` with `translateZ` layered offsets).
- **Floating 3D Glass Geometry**: Ambient rotating 3D orbital rings, glass cube, pyramid, and sphere shapes.
- **Interactive Mouse Spotlight**: Radial glowing background spotlight tracking cursor movement smoothly.
- **Split Word-by-Word Reveal**: Staggered typography entrance with gradient text accents.

### 🏛️ Official About Our Student Branch Section
- **Historical Milestones**: Details the journey from the *MMIT IEEE Club* (26 Aug 2024) to official *IEEE Student Branch Charter* (05 Dec 2024).
- **Official Credentials**: Highlight cards for STB Code (`STB60226400`), School Code (`60227769`), Leadership under Dr. Monika Dangore, and Region 10 status.

### ⚡ 60 FPS GPU & Reflow Optimizations
- **Zero Forced Reflows**: Layout dimensions cached on viewport resize listener to prevent main-thread layout thrashing inside `requestAnimationFrame` render loops.
- **Passive Event Handlers**: Mouse move listeners optimized with `{ passive: true }` and cached bounding rects for 3D card tilt & spotlight interactions.
- **Adaptive Canvas Particle Engine**: Dynamic node count scaling (10 to 32 nodes) to maintain smooth 60 FPS performance across low-power mobile & desktop viewports.

### 🎯 100/100 Lighthouse SEO & Accessibility
- **JSON-LD Schema Markup**: Standardized `EducationalOrganization`, `Organization`, and `EventSeries` structured data schemas.
- **Accessible Anchor Text**: Explicit `aria-label` attributes on all dynamic social links and "Learn More" call-to-action buttons.
- **Semantic HTML5 & Microformats**: Enforces WCAG 2.1 AA landmark navigation and heading structures.

### 📅 Event Calendar Export Tools
- **1-Click Google Calendar**: Direct pre-filled event synchronization link for all upcoming IEEE workshops and summits.
- **iCal (.ics) Download Engine**: Generates and downloads native `.ics` calendar files for Apple Calendar, Outlook, and Android.

### 🎨 Live Accent Color Theme Switcher
- Floating palette widget allowing real-time accent color customization (*Indigo Cyber*, *Cyan Neon*, *Emerald Pulse*, *Sunset Amber*).

### 🛠️ Interactive Capabilities & CMS Portal
- **Command Palette** (`⌘K` / `Ctrl+K`) for rapid site-wide search and navigation.
- **Command CMS Portal** (`admin.html`) with full event, member, blog, and gallery management.
- **Custom Cursor & Fluid Parallax**: Smooth tracking, magnetic buttons, and ambient glow.

---

## 📑 Official Technical Assessment Report

A comprehensive 7-page Microsoft Word technical report is generated and maintained inside the repository:

- 📄 **File Path**: [`docs/MMIT_IEEE_SB_Website_Redesign_Technical_Report.docx`](file:///d:/IEEE%20SB%20Website/docs/MMIT_IEEE_SB_Website_Redesign_Technical_Report.docx)
- 📌 **Contents**: Cover Page, Technology Rationale, Decoupled Architecture Diagram, CMS REST API Specs, Legacy vs. Redesign Comparison Matrix, Technical Audit, and Future Roadmap.

---

## 📁 Project Structure

```
IEEE-SB-Website/
├── assets/                        # Icons, logos, and favicons
├── css/
│   ├── base/
│   │   ├── globals.css            # Design tokens, reset, typography
│   │   └── animations.css         # Keyframes & motion system
│   ├── components-styles/
│   │   ├── components.css         # Reusable UI components & navigation
│   │   └── premium.css            # Glassmorphism, card tilt, and effects
│   └── pages/
│       ├── home.css               # Hero 3D glass stage & About section CSS
│       ├── events.css             # Event cards & list view
│       ├── team.css               # Leadership & member roster
│       ├── gallery.css            # Masonry grid & lightbox
│       └── admin.css              # Admin CMS portal styles
├── docs/                          # Official documentation & Word (.docx) reports
│   └── MMIT_IEEE_SB_Website_Redesign_Technical_Report.docx
├── js/
│   ├── core.js                    # Preloader, theme engine, cursor, nav, scroll
│   ├── hero-epic.js               # 3D Glass stage tilt, spotlight & word reveal
│   ├── verifier-calendar.js       # Google Calendar & iCal (.ics) exporter engine
│   ├── particles.js               # IEEEDigitalNetwork canvas particle system
│   ├── animations.js              # IntersectionObserver scroll reveal system
│   ├── counters.js                # Count-up timers & countdown engine
│   ├── magnetic.js                # Magnetic buttons & card tilt interactions
│   ├── site-config.js             # Decoupled API base URL configuration
│   └── premium-interactions.js    # Micro-interactions & ripple effects
├── backend/                       # Node.js + Express + MongoDB REST API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── index.html                     # Homepage (Hero, About, Events, Gallery, Blog)
├── events.html                    # Events page with calendar exporters
├── team.html                      # Executive committee & team members
├── gallery.html                   # Photo & event highlights gallery
├── blog.html                      # Technical blog & articles
├── blog-post.html                 # Single article view
├── admin.html                     # CMS Portal & Management Dashboard
├── vercel.json                    # Vercel frontend routing & CDN config
└── render.yaml                    # Render.com deployment manifest
```

---

## 💻 Local Setup & Development

### Running Frontend Locally
```bash
# Serve with python
python -m http.server 3000

# Or with Node npx
npx serve .
```
Open `http://localhost:3000` in your browser.

### Running Backend Locally
```bash
cd backend
cp .env.example .env
npm install
npm run seed     # Create initial admin account
npm run dev      # Runs API server on http://localhost:5000
```

---

## 📜 License & Accreditation

© 2025 **MMIT IEEE Student Branch** (`STB60226400`).  
All rights reserved. Advancing Technology for Humanity.
