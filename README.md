# Vibe Designs

A curated showcase of award-level, high-craft interactive digital experiences and creative frontend architectures.

## Projects

### 1. [Aurelia — Private Residences](./aurelia)
An Awwwards-caliber interactive luxury villa architectural digital experience built with:
- **Dual-Canvas 60fps Lookahead Frame Scrubbers** (Day & Night atmospheric moods)
- **GSAP 3.12 & ScrollTrigger** synchronized motion choreography
- **7-Panel Tectonic Materials Monograph** with bespoke SVG clip-path silhouettes
- **5 Sculptural Interactive Amenities** with real-time parabolic curve responsiveness and full-screen cinematic tour viewers
- **Agentic AI Web Accessibility** with full `llms.txt` and `llms-full.txt` specifications

#### Running Aurelia Locally:
```bash
cd aurelia
npm install
npm run dev
```

### 2. [Riot Brewing Co. — The Kinetic Bazaar](./riot-brewing-co)
A brutalist, high-energy interactive craft beer brand showcase and motion experience built with:
- **Horizontal Scroll Video Journey** with multi-chapter scrub interactions
- **Interactive Canvas Particle Typography** with physics cursor repulsion & return velocity
- **Brutalist Grid & Typography Architecture** (Next.js 14 App Router, Tailwind CSS, TypeScript)
- **Interactive Ticket Module & Spec Panels**

#### Running Riot Brewing Co. Locally:
```bash
cd riot-brewing-co
npm install
npm run dev
```

### 3. [Aurfee — Precision Espresso Engineering](./aur-fee)
An Awwwards-caliber interactive luxury espresso machine showcase and Veloce OS digital experience built with:
- **Aurfee Boot Sequence Preloader** with dynamic telemetry warming, brewing, and extraction transitions
- **Interactive Scrollytelling Hero** with scroll-linked camera zoom and live tactile hotspot telemetry tooltips
- **Veloce OS Scrollytelling Suite** cycling PID brew temp (93.5°C), 24.2s extraction timer, 9 BAR rotary pump, and live yield curves
- **Pinned Horizontal Engineering Gallery** showcasing brass portafilter, tactile dials, and steam wand
- **Technical Architecture Monograph** with split-screen sticky hardware blueprints

#### Running Aurfee Locally:
```bash
cd aur-fee
npm install
npm run dev
```

### 4. [LABELIT — Precision Bottle Labeling](./labelit)
An Awwwards-caliber interactive luxury bottle packaging digital experience showcasing high-precision labeling, vessel architecture, and tactile brand engineering:
- **120-Frame Canvas Scrollytelling Journey**: Synchronized scroll engine scrubbing through the complete transformation from blank glass vessel to fully labeled, 24K gold foil finished bottle.
- **Dynamic Per-Frame Bottle Centering**: Portrait-friendly mobile framing tracking bottle centers in real-time coordinates.
- **3D Curved Vessel Architecture Gallery**: Built with WebGL & OGL (`ogl.mjs`), featuring smooth drag, wheel, touch, and full keyboard arrow/A-D navigation.
- **Methodology Pipeline**: Interactive 5-step accordion rail with ARIA APG compliance and arrow key navigation.
- **Idle GPU/CPU Optimization**: `IntersectionObserver` auto-pauses WebGL and canvas animation loops when sections are out of the viewport.
- **Agentic AI Web Accessibility**: Includes comprehensive `llms.txt` and `llms-full.txt` specifications.

#### Running LABELIT Locally:
```bash
cd labelit
npm install
npm run dev
# or: python -m http.server 8080
```

### 5. [MEGTIK — Coffee House & Architectural Experience](./megtik)
An Awwwards-caliber cinematic specialty coffee and brutalist architectural digital experience built with:
- **192-Frame Sub-frame Interpolated Canvas Entrance**: Continuous scroll-scrubbed camera traversal through architectural coffee sanctuary
- **Physical 3D FlipCard Menu Architecture**: Powered by Motion & pointer physics with tactile front/back exploration
- **Cinematic Process Film Studio**: Integrated archival 1080p process sequence with stage telemetry and idle GPU viewport pausing
- **Curated Combos Engine**: Decoupled dual-card complementary arc animation with interrupt-safe GSAP transitions
- **Atmospheric Dusk Editorial Footer**: Featuring foreground editorial typography and physical coffee spill animation seamlessly blended into studio ground

#### Running MEGTIK Locally:
```bash
cd megtik
npm install
npm run dev
```

## Netlify Deployment Guide

This repository contains multiple high-craft web experiences configured for Netlify monorepo deployment:

### Deploying Riot Brewing Co. (`riot-brewing-co`)
1. Create a new site in **Netlify** and connect this repository: `PratikPawar020403/vibe-designs`.
2. In **Build Settings**:
   - **Base directory**: `riot-brewing-co`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
3. Netlify will automatically detect Next.js 14 and use `riot-brewing-co/netlify.toml`.

### Deploying Aurelia (`aurelia`)
1. In Netlify Build Settings:
   - **Base directory**: `aurelia`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Deploying Aurfee (`aur-fee`)
1. In Netlify Build Settings:
   - **Base directory**: `aur-fee`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
2. Netlify will automatically detect Vite and use `aur-fee/netlify.toml`.

### Deploying LABELIT (`labelit`)
1. In Netlify Build Settings:
   - **Base directory**: `labelit`
   - **Publish directory**: `.`
2. Netlify will serve the static experience and use `labelit/netlify.toml`.

### Deploying MEGTIK (`megtik`)
1. In Netlify Build Settings:
   - **Base directory**: `megtik`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
2. Netlify will automatically detect Vite and use `megtik/netlify.toml`.


