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


