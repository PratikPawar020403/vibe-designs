# Aurelia — Private Residences

> *A place to return to.*

An Awwwards-caliber interactive architectural digital experience showcasing the Aurelia private residential estate on the Mediterranean coast. Built with precision frontend craftsmanship: **Vite + Canvas 60fps Frame Scrubbing + GSAP 3.12 + Modular CSS + Semantic HTML5**.

---

## 1. Tech Stack & Architecture

- **Build Tool**: [Vite](https://vitejs.dev/) (fast HMR, asset hashing, rollup bundling)
- **Animation & Motion**: [GSAP 3.12](https://greensock.com/gsap/) & [ScrollTrigger](https://greensock.com/scrolltrigger/)
- **Visual Engine**: Dual HTML5 Canvas 60fps frame decoders with asynchronous lookahead buffer
- **Typography**: Google Fonts (*Cinzel*, *Cormorant Garamond*, *Inter*) with preconnect optimization
- **Responsive Architecture**: Fluid clamps, object-bounding-box SVG clip paths, and safe-area insets
- **Accessibility**: Full `prefers-reduced-motion` fallbacks, ARIA modal dialogs, visible focus states, and keyboard navigation

---

## 2. Key Subsystems

### 1. Blossom Loader
- Bespoke hand-inked botanical sprig (stem, six pen-drawn leaves, three blooming blossoms, drifting petals, and AURELIA wordmark).
- Asynchronous decoding synchronization: holds until hero frame 1 is decoded and ready, with an 8s slow-network fallback.
- Smooth release animation: expands directly into the centered 16:9 hero window (`clip-path: inset(46% 41% 46% 41% round 8px)` to `0% 0% 0% 0% round 8px`) while easing the initial frame from `scale(1.07)` to `scale(1)`.
- Self-cleaning: completely removes loader DOM elements and kills active GSAP tweens on `aurelia:loader-done`.

### 2. Dual Canvas Hero Engine (Day & Night)
- 60fps hardware-accelerated HTML5 Canvas renderers (`#heroCanvasLight` and `#heroCanvasNight`).
- 192 lossless WebP frames per mode with dynamic lookahead decoding (`decodeAhead`) and velocity-based frame interpolation.
- Alternate mood switch (☾ NIGHT · DAY ☀): seamless instant toggle with crossfading and scroll progress preservation.
- Reduced-motion fallback: automatically switches to native 1080p MP4 video elements (`entrance-light.mp4` / `entrance-night.mp4`) for users with motion sensitivity.

### 3. Tectonic Materials Monograph
- 8-panel horizontal pinning sequence scrubbed via GSAP ScrollTrigger.
- Asymmetrical architectural clip paths (`clipPathUnits="objectBoundingBox"`).
- Persistent architectural indicator tracking active material plate, title, and progress hairline.

### 4. Sculptural Amenities with Individual Scroll Hints
- 5 distinctive organic architectural silhouettes with custom aspect ratios and organic border radii.
- Real-time 3D parabolic curvature (`updateAmenityCurve`) translating and rotating cards in unison as the user scrolls.
- Individual **"Scroll to view ↓"** editorial indicators beneath each card, featuring animated bouncing arrows and hover color shifts.
- Mobile vertical stacking with preserved individual labels and clean negative space.

### 5. Cinematic Amenity Frame Scrubbers
- Fullscreen modal tour viewer (`#tour`) mounting an isolated 60fps frame scrubber instance per amenity.
- Dynamic caption timing synchronized to frame progress with subtle vertical translation.
- Floating `Scroll to view ↓` tour hint that gently dissolves as user scrubs into the sequence.
- Accessible dialog semantics (`role="dialog"`, `aria-modal="true"`, `Esc` key to exit, focus restoration).

### 6. Architectural Inquiry Folio & Botanical Footer
- Minimalist concierge inquiry form with smooth response state.
- Scalable vector botanical branch aligned to bottom viewport border.
- Smooth "Return to Beginning ↑" navigation button.

---

## 3. Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` (comes with Node.js)

### Installation
```bash
npm install
```

### Local Development Server
```bash
npm run dev
```
Starts Vite dev server at `http://localhost:5173/`.

### Production Build
```bash
npm run build
```
Generates a minified, tree-shaken, and optimized production bundle in the `dist/` directory.

### Production Preview
```bash
npm run preview
```
Serves the built `dist/` directory locally at `http://localhost:4173/` for production verification.

---

## 4. Repository Structure

```text
├── index.html               # Main production entry point
├── package.json             # Scripts & dependencies (includes local GSAP)
├── vite.config.js           # Vite build & preview configuration with caching headers
├── vercel.json              # Vercel immutable caching configuration
├── .gitignore               # Production git exclusion rules
├── .env.example             # Environment variable template
├── README.md                # Project documentation
│
├── src/
│   └── main.js              # Bundled JavaScript entry point (GSAP, ScrollTrigger, Blossom Loader, Canvas engines)
│
├── public/                  # Static production assets (served at root and copied to dist)
│   ├── _headers             # Netlify & Cloudflare Pages immutable caching directives
│   ├── favicon.svg          # Botanical luxury SVG favicon
│   ├── favicon.ico          # Fallback ICO favicon
│   ├── apple-touch-icon.png # iOS touch icon (180x180)
│   ├── robots.txt           # Production search crawler instructions
│   ├── amenity-01..05.jpg   # Architectural photography for amenities
│   ├── material-01..07.jpg  # Material monograph plate images
│   ├── entrance-*.jpg       # Hero resting stills
│   ├── entrance-*.mp4       # Hero reduced-motion video fallbacks
│   ├── frames/              # WebP frame sequences (Hero Day + 5 Amenities)
│   ├── frames-night/        # WebP frame sequences (Hero Night)
│   └── videos/              # Amenity reduced-motion MP4 video journeys
│
├── dist/                    # Self-contained production build output (ready for deploy)
└── archive/                 # Historical prototypes, raw video masters, and backups
    ├── legacy_html/         # Archived prototype iterations
    ├── masters/             # Original uncompressed video & graphic masters
    └── prototypes/          # Experimental prototypes (scroll-video, old_src)
```

---

## 5. Deployment Guide

The `dist/` folder produced by `npm run build` is 100% self-contained and ready for zero-configuration static deployment on any modern platform:

### Deploy to Netlify
```bash
npx netlify deploy --prod --dir=dist
```
Or connect your Git repository and set:
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Deploy to Vercel
```bash
npx vercel --prod
```
Or connect your Git repository and set:
- **Framework Preset**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`

### Deploy to Cloudflare Pages / AWS S3 / GitHub Pages
Upload the contents of the `dist/` folder directly to the root of your bucket or repository branch.

---

## 6. Performance & Quality Standards

- **Frame Rate**: Continuous 60fps across canvas rendering, ScrollTrigger pinning, and catenary curve physics.
- **Console Errors**: 0 errors, 0 warnings.
- **Network Efficiency**: Zero 404s; image preloading and asynchronous frame decoding pipeline.
- **Viewports Tested**:
  - Desktop: 1440×900, 1920×1080, 2560×1440 (Ultrawide)
  - Mobile: 390×844 (iPhone 14/15), 430×932 (iPhone Pro Max), landscape orientation
- **Motion Safety**: Respects `prefers-reduced-motion` at all levels with native video fallbacks.

---

## 7. License

Private & Confidential — Aurelia Residences. All rights reserved.
