# RIOT BREWING CO. — THE KINETIC BAZAAR

A brutalist, high-performance web experience designed for **Riot Brewing Co.** Built with Next.js 14, TypeScript, Tailwind CSS, and custom interactive HTML5 canvas and video-scrubbing engines.

---

## Brand Architecture & Aesthetic

- **Design System**: Brutalist White Cube aesthetic — high-contrast monochrome grid (`#0a0a0a` / `#ffffff`), sharp zero-radius geometry, 1px technical borders, hard offset drop shadows (`4px 4px 0px`), and vibrant kinetic accents (`#ff007f` Rani Pink and `#0022ff` Electric Blue).
- **Typography**: 
  - Display: Clash Display (`font-display`)
  - Monospace / Technical: IBM Plex Mono (`font-mono`)
  - Body: Switzer / Inter (`font-body`)
- **Key Concepts**:
  - `05 BEERS / 05 WORLDS`: 5 distinct brews spanning Core, Experimental, and Editorial narratives.
  - Interactive Canvas Particles: High-density interactive particle physics text rendering.
  - Horizontal Scrubbed Video Journeys: Touch and wheel synchronized micro-scrubbed video journeys through beer origins.
  - Brutalist Technical Spec Sheets: Formatted brewery batches, ABV/IBU telemetry, and ingredients index.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict type safety)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) + PostCSS
- **State & Animation**: Custom React hooks (`requestAnimationFrame`, Web Audio API, Canvas 2D)
- **Code Quality**: ESLint (`next/core-web-vitals`), Prettier-compliant code formatting

---

## Getting Started

### Prerequisites

- Node.js 18.17+ or higher
- npm 9+ (or pnpm / yarn)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/riotbrewing/brand-site.git
cd brand-site
npm install
```

### Development Server

Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Typecheck & Linting

```bash
# Run TypeScript validation
npx tsc --noEmit

# Run ESLint validation
npm run lint
```

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run start
```

---

## Project Structure

```text
├── public/                     # Static assets (images, posters, optimized web-scrub MP4 videos, logo)
├── src/
│   ├── app/
│   │   ├── favicon.ico         # Generated favicon
│   │   ├── globals.css         # Tailwind base, utilities, brutalist cursor styles, animations
│   │   ├── layout.tsx          # Root layout, persistent header, brand metadata & viewport
│   │   └── page.tsx            # Main page composition (hero, catalog, CTA, background)
│   ├── components/
│   │   ├── effects/
│   │   │   └── CubeBackground.tsx   # Ambient wireframe background canvas
│   │   └── layout/
│   │       ├── EditorialJourney.tsx   # Multi-stage process story component
│   │       ├── FooterCtaSection.tsx   # Brutalist newsletter & store locator
│   │       ├── ParticleText.tsx       # Physics-based canvas text simulation
│   │       ├── ProductIndex.tsx       # Interactive product index selector
│   │       ├── RevealContainer.tsx    # Responsive product showcase & mobile drawer
│   │       ├── ScrollVideoJourney.tsx # Frame-accurate video scrubber & audio effects
│   │       └── SpecSheetModal.tsx     # Brutalist beer spec ticket
│   └── lib/
│       ├── data/
│       │   └── mock-schema.ts   # Product interface, video configs, canonical 5-beer dataset
│       └── utils.ts            # Utility functions (cn, clsx merger)
├── .eslintrc.json              # ESLint configuration
├── tailwind.config.ts          # Brutalist color tokens, shadows, animations, and typography
└── tsconfig.json               # TypeScript compiler configuration
```

---

## Responsive & Device Support

The layout is tested and validated across:
- **Mobile**: 320px, 375px, 414px, 480px (iOS Safari & Android Chrome)
- **Tablet**: 768px, 834px (iPad / Portrait & Landscape)
- **Desktop**: 1024px, 1280px, 1440px, 1920px (Mac & Windows browsers)
- **Touch**: Full touch scrub gestures on mobile/tablet video journeys with hardware acceleration.

---

## License

Private / Confidential. Copyright © Riot Brewing Co. All rights reserved.
