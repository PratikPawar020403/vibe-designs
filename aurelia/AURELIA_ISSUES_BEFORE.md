# Aurelia Issues Before Inspection Report

**Date & Time**: 2026-10-04T01:42:00+05:30  
**Project**: Aurelia Private Residences  
**Location**: `C:\Users\prati\Desktop\vibe-designs\aurelia`  
**Deployed URL**: https://aurelia-vibe.netlify.app/  

---

## 1. Framework & Build Tool

- **Framework**: Vanilla JavaScript (ES Modules, modern Web APIs)
- **Build Tool**: Vite 6.2.0 (`vite build`, `vite preview`, `vite dev`)
- **Animation / Physics Library**: GSAP 3.15.0 with `ScrollTrigger` plugin
- **CSS Architecture**: Inline `<style>` inside `index.html` with CSS custom properties (variables), media queries, SVG clip paths, and responsive clamp typography.

---

## 2. Relevant Components & Source Files

- **Entry HTML & Core Styling**: [`index.html`](file:///C:/Users/prati/Desktop/vibe-designs/aurelia/index.html)
  - Theme variables (`:root`, `@media (prefers-color-scheme: dark)`, `:root[data-theme="dark"]`, art direction overrides at line 524)
  - Navigation header (`#intro`, `#dn`, `.enter-cta`)
  - Hero dual-canvas aperture section (`#hero`, `#stage`, `#heroViewport`, `#heroAperture`)
  - Tectonic materials horizontal scroll monograph (`#mats`, `#ms`, `#mt`, `.mp`)
  - Amenities experience section (`#have`, `#have-stage`, `.have-head`, `.am`, `#am`)
  - Inquiry folio contact card (`#touch`, `#env`, `.letter`)
  - Shared cinematic tour modal (`#tour`, `#tourScroller`, `#tourTrack`, `#tourCanvas`, `#tourCaptions`)
  - Monograph footer (`#footer`, SVG botanical branch)
- **Application Logic & Animation Controllers**: [`src/main.js`](file:///C:/Users/prati/Desktop/vibe-designs/aurelia/src/main.js)
  - Blossom loader lifecycle (`AureliaLoader`)
  - Dual 60fps canvas hero engine (`drawHeroFrame`, `heroTick`, `updateHeroFrameProgress`)
  - Day/Night alternate opening handler (`dnBtn.onclick`)
  - Tectonic materials GSAP ScrollTrigger timeline (`matsTL`, `updateMatsIndicator`)
  - Amenities card renderer and 3D curve physics (`updateAmenityCurve`)
  - Tour modal scrubber engine (`createScrubber`, `openTour`, `closeTour`)
  - Word stagger text animations (`initTypography`)
  - Inquiry submission interaction (`sendBtn.addEventListener`)

---

## 3. Relevant Data Files & Assets

- **Amenities Data**:
  - `AMENITIES` array in [`src/main.js`](file:///C:/Users/prati/Desktop/vibe-designs/aurelia/src/main.js#L743-L799)
  - `A_META` array in [`src/main.js`](file:///C:/Users/prati/Desktop/vibe-designs/aurelia/src/main.js#L802-L808)
- **Image Assets**:
  - `public/amenity-01-pool.jpg` (526 KB)
  - `public/amenity-02-garden.jpg` (471 KB)
  - `public/amenity-03-gym.jpg` (217 KB)
  - `public/amenity-04-sunset.jpg` (426 KB)
  - `public/amenity-05-observatory.jpg` (272 KB)
  - `public/material-01..07.jpg` (Travertine, Wood, Glass, Concrete, Bronze, Plaster, Botanical)
- **Frame Sequences**:
  - `public/frames/` (Hero day frames `frame_0001.webp` .. `frame_0192.webp`)
  - `public/frames-night/` (Hero night frames `frame_0001.webp` .. `frame_0192.webp`)
  - `public/frames/pool/` (192 WebP frames)
  - `public/frames/garden/` (192 WebP frames)
  - `public/frames/gym/` (192 WebP frames)
  - `public/frames/sunset/` (192 WebP frames)
  - `public/frames/observatory/` (192 WebP frames)
- **Video Assets**:
  - `public/videos/pool.mp4`, `garden.mp4`, `gym.mp4`, `sunset.mp4`, `observatory.mp4`
  - `public/entrance-light.mp4`, `entrance-night.mp4`

---

## 4. Current Problems Found

### A. Dark Mode / Theme Catastrophic Root Cause
1. **White Text on White Background**:
   - At line 41 of `index.html`, `--bg`, `--paper`, `--card`, `--ink` are initialized.
   - At lines 62–63, dark mode updates `--bg: #15110d`, `--ink: #fbf9f6`, `--card: #211b15`.
   - **Crucial defect**: At line 524, a second `:root` block re-declares `--paper: #fbf9f6` and line 525 sets `body { background: var(--paper); }`.
   - Sections `#stage`, `#craft`, `#stats`, `#touch`, and `#ms` all use `background: var(--paper)`.
   - Because `--paper` was never overridden in `@media (prefers-color-scheme: dark)` or `:root[data-theme="dark"]`, it remains light cream (`#fbf9f6`).
   - Consequently, when system dark mode is active, `--ink` becomes `#fbf9f6` (cream/white) while `--paper` remains `#fbf9f6` (cream/white).
   - **Result**: All headings, body copy, stats, and text are rendered white-on-white (100% invisible) on mobile devices running in dark mode.
2. **Day/Night Toggle `#dn` Disconnected from Document Theme**:
   - In `src/main.js` (`dnBtn.onclick`), clicking the Day/Night button toggles `.is-night` on `#stage` and `#dn`, and toggles `heroOpeningMode`.
   - It **never** sets `data-theme="dark"` or `data-theme="light"` on `document.documentElement` (`:root`).
   - The document theme never changes when clicking the toggle.
   - Theme choice is not persisted in `localStorage`. Reloading always resets the state.
3. **Hard-coded Light Header on Scroll**:
   - `#intro.scrolled` has `background: rgba(251, 249, 246, 0.92); color: var(--ink);`.
   - In dark mode, `--ink` is `#fbf9f6`, causing white text on cream background.
4. **Card & Form Theming Gaps**:
   - `.m-index-card` and `#env` have dark styles scoped only to `:root[data-theme="dark"]` and `body.dark-theme`, omitting `@media (prefers-color-scheme: dark)`.
   - Input text and placeholders in `#env` become unreadable in system dark mode.
5. **Broken CSS Sibling Selector for Dark Mode Hint**:
   - `#stage.is-night ~ #have .am-scroll-hint` fails because `#stage` is nested inside `#hero` and is not a sibling of `#have`.

### B. Amenities & Frame Scrubbing Inconsistencies
1. **Split Data Structures (Index Drift Risk)**:
   - Amenities metadata is split across `AMENITIES` and `A_META` in `src/main.js`.
   - No single source of truth connects IDs, titles, subtitles, technical details, cards, images, and frame directories.
2. **Broken CSS Specificity on Amenities Cards**:
   - In `index.html` lines 233–242: `.am-col:nth-child(1), .am-item:nth-child(1) { ... }`.
   - Because `.am-item` is always the first child of `.am-col`, the top-level selector `.am-item:nth-child(1)` erroneously matches every `.am-item` (items 1–5), causing styles and border radii to leak.
3. **Lack of Active State Determination in `#have`**:
   - While scrolling `#have`, no active card is calculated or signaled.
   - On mobile, `#have-stage` was disabled with `position: static!important` and `height: auto!important`, completely removing the scroll-driven storytelling.
4. **Frame Scrubbing Synchronization & Sequential Starvation in Tour**:
   - `createScrubber.preloadRest()` greedily loads frames sequentially from 1 to 191.
   - When the user scrolls quickly to 50% or 80%, frames for that position are not yet requested.
   - `nearest(idx)` falls back to whatever early frames happened to finish, causing erratic frame jumping or showing stale frames.
   - On mobile Safari/Chrome, dynamic address bar resize changes viewport height; `createScrubber` uses a static `track.offsetHeight` captured at initialization, causing progress calculation drift (`range = th - scroller.clientHeight`).
   - Using synchronous `getBoundingClientRect()` on both `track` and `scroller` causes layout thrashing during scroll ticks.

---

## 5. Files That Will Need Changes

1. [`index.html`](file:///C:/Users/prati/Desktop/vibe-designs/aurelia/index.html):
   - Unify and repair `:root` theme tokens for both Day and Night modes: `--bg`, `--paper`, `--card`, `--ink`, `--ink-soft`, `--line`, `--brass`, `--bronze`, `--pink`, `--rose`.
   - Support both `:root[data-theme="dark"]` / `:root[data-theme="light"]` and `@media (prefers-color-scheme: dark)`.
   - Fix `#intro.scrolled` background and border in dark mode.
   - Fix `.m-index-card` and `#env` styling across all theme combinations.
   - Fix broken CSS selectors (`.am-item:nth-child(1)` and `#stage.is-night ~ #have`).
   - Retain full visual fidelity, clamp typography, and editorial luxury aesthetics.
2. [`src/main.js`](file:///C:/Users/prati/Desktop/vibe-designs/aurelia/src/main.js):
   - Connect Day/Night button `#dn` to canonical theme state: toggles `data-theme` on `document.documentElement`, syncs hero canvas, and persists preference to `localStorage`.
   - Check and respect system `prefers-color-scheme: dark` on initial load when no manual override is saved.
   - Unify amenities into a single canonical source of truth (`AMENITIES_DATA`).
   - Implement deterministic active card tracking in `#have` on both desktop and mobile.
   - Upgrade `createScrubber` with prioritized lookahead loading around current scroll position and robust `scroller.scrollTop` progress calculation immune to dynamic mobile address bar changes.
   - Add proper animation cleanup on tour close.
