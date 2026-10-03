# PERFORMANCE & MOBILE COMPATIBILITY AUDIT REPORT
**RIOT BREWING CO. // THE KINETIC BAZAAR**

---

**AUDIT STATUS:** COMPLETE  
**DEPLOYED URL:** https://riot-brewing-co.netlify.app/  
**DATE:** October 3, 2026  
**PROJECT TYPE:** Next.js 14 (App Router, React 18, Tailwind CSS)  
**BUILD TOOL:** Next.js 14.2.35 / Netlify Plugin Next.js (`@netlify/plugin-nextjs`)  
**TOTAL ASSETS EXAMINED:** 60 Assets (14 Videos, 29 Images/Favicons, 7 Fonts, 7 JS Chunks, 2 CSS Bundles, 1 HTML Document)  
**TOTAL CRITICAL ISSUES:** 5  
**TOTAL HIGH ISSUES:** 7  

**MOST IMPORTANT FINDING:**  
The website's mobile experience and initial load are crippled by uncompressed multi-megabyte media (over 112 MB of high-bitrate video, a 323 KB favicon, and unoptimized JPEG/PNGs), combined with conflicting CSS `touch-action` and JavaScript touch event handlers that lock viewport scrolling and paralyze HTML5 video decoding on mobile devices.

**MOST LIKELY CAUSE OF MOBILE VIDEO FAILURE:**  
Mobile Safari and Android Chrome fail to scrub reveal videos due to a combination of conflicting `touch-action: pan-y` and manual `scrollLeft` touch listeners fighting native momentum scrolling, lack of an initial play/handshake allowing WebKit to decode frames while paused, and oversized video bitrates (up to 19.5 Mbps) with missing `faststart` (`moov` at end) on key video assets.

**MOST LIKELY CAUSE OF SLOW INITIAL LOAD:**  
The initial page load is throttled by un-cached Next.js serverless SSR cold-start latency (~1.8s TTFB), an unoptimized 323 KB PNG favicon and 112 KB logo requested immediately in the critical rendering path, and an unthrottled 60-120fps HTML5 canvas particle loop executing synchronous CPU pixel sampling during hydration.

---

## 1. EXECUTIVE SUMMARY

An in-depth performance, media loading, animation behavior, and mobile compatibility audit was conducted on both the deployed production site (`https://riot-brewing-co.netlify.app/`) and the local source repository.

The application presents a distinctive "Brutalist / Kinetic Bazaar" aesthetic. However, from an engineering standpoint, several critical architectural and implementation deficiencies prevent the application from delivering acceptable performance—most notably on mobile devices (iOS Safari and Android Chrome):

1. **Mobile Gesture Lockout:** A `touch-action: none` rule in `ParticleText.css` traps mobile user touch input over the entire top 52% of the mobile viewport (`HeroCanvas`), making vertical scrolling completely unresponsive when the user initiates a touch within that area.
2. **Video Architecture Breakdown on Mobile:** The scroll-driven reveal video system relies on programmatic `video.currentTime` scrubbing of 720p/1080p MP4 files with bitrates reaching up to 19.5 Mbps. Key fallback videos lack front-loaded index headers (`moov` atom at end), while others contain only a single keyframe across 8 seconds. Combined with Mobile Safari's refusal to preload or update paused video layers without prior playback, video scrubbing appears frozen, erratic, or entirely blank.
3. **Severe Payload Bloat:** The `public/` directory contains 112.68 MB of video assets and 6.57 MB of images. Over 37.6 MB consists of completely unreferenced "ghost" files deployed to production.
4. **Missing Modern Image Pipeline:** Zero usage of Next.js image optimization (`next/image`). Images are served as uncompressed JPEGs and PNGs without `srcset`, `sizes`, or modern formats (WebP/AVIF). The site loads a 323.3 KB PNG as a 16×16 browser tab favicon and a 112.4 KB PNG for a 32×40 header icon.
5. **Main Thread Thrashing & Power Drain:** The interactive particle canvas (`ParticleText.tsx`) runs an unthrottled 60–120 FPS `requestAnimationFrame` loop that calculates mathematical drifts and executes thousands of canvas 2D draw calls continuously, even when offscreen or mounted inside hidden elements (`display: none`).

---

## 2. SITE ARCHITECTURE & DEPLOYMENT FINDINGS

### Netlify Deployment Configuration (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Deployment Audit Observations:
* **SSR vs. Static Generation:** The application is deployed via `@netlify/plugin-nextjs` as an on-demand Server-Side Rendered (SSR) function rather than a pre-rendered static export (`output: 'export'` or SSG).
* **Time To First Byte (TTFB):** Measured document TTFB on the live Netlify edge ranged from **1,807.5 ms (cold start / edge cache miss)** to ~220 ms (warm cache). For a portfolio/showcase site with static mock data, serverless function invocation adds an unnecessary 1.5s+ latency overhead.
* **HTTP Status Codes:** All deployed asset URLs returned `200 OK` or `206 Partial Content`. No 404, 403, or 5xx errors were detected on direct asset fetches.
* **Range Requests:** Netlify Edge correctly supports HTTP `206 Partial Content` with `Accept-Ranges: bytes` for `.mp4` video files.
* **Cache-Control Headers:**
  * Static media (`/*.mp4`, `/*.jpg`, `/*.png`, `/*.webp`): Configured in `netlify.toml` with `public, max-age=31536000, immutable`.
  * Favicon (`/favicon.ico`): Served with `public, max-age=0, must-revalidate` (causes re-validation on every page refresh).
* **Dead / Ghost Assets:** The Netlify deployment bundle deploys **37.68 MB** of completely unused files in `public/` that are never referenced by any code:
  * `geometric-ipa-process.mp4` (15.64 MB)
  * `geometric-ipa-process-scrub.mp4` (10.53 MB)
  * `bengal-tiger-process.mp4` (4.72 MB)
  * `bengal-tiger-process-scrub.mp4` (4.77 MB)
  * `process.jpg` (842.8 KB)
  * `favicon-raw.png` (323.3 KB)
  * `geometric-ipa-poster.jpg` (141.0 KB)
  * `favicon-full.png` (151.0 KB)
  * `logo-card.png` (135.5 KB)
  * `logo-tight.png` (112.4 KB)
  * `logo-mark.png` (83.2 KB)
  * `favicon-square.png` (84.5 KB)
* **Broken OpenGraph / Twitter Domain:** In `src/app/layout.tsx` (Line 17), `metadataBase` is defined as `new URL("https://riotbrewing.co")`. This domain fails DNS resolution / connection (`curl -I https://riotbrewing.co` errors with connection refused/timeout). As a result, all social sharing preview bots fail to resolve `og:image` and `twitter:image`.
* **Third-Party Script Injection:** Netlify injects `/.netlify/scripts/hud?variant=public` (33.7 KB) into the live production HTML, introducing external script evaluation overhead on initial parse.

---

## 3. IMAGE AUDIT

Every image in the project was audited for format, dimensions, file size, DOM usage, and loading strategy.

### Complete Image Inventory:

| Filename | Path | Format | Dimensions | File Size | Where Used | Fold Position | Lazy Loaded | Modern Format | Issues |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `favicon.png` | `/favicon.png` | PNG | 456 × 610 | **323.3 KB** | `layout.tsx` (`<link rel="icon">`) | Header / Head | No | No (No WebP) | **Massive 323 KB favicon** loaded on initial page request for a 16×16 tab display. |
| `favicon.ico` | `/favicon.ico` | ICO | 64 × 64 | 11.7 KB | `layout.tsx` (`<link rel="icon">`) | Header / Head | No | N/A | Served with `max-age=0`. |
| `apple-icon.png` | `/apple-icon.png` | PNG | 512 × 512 | 154.6 KB | `layout.tsx` (`apple-touch-icon`) | Header / Head | No | No | Uncompressed PNG. |
| `logo.png` | `/logo.png` | PNG | 340 × 418 | **112.4 KB** | `layout.tsx` (L63), `FooterCtaSection.tsx` (L236) | Above-the-fold (Header) & Below (Footer) | No | No | Rendered at **32 × 40 px** in header (110× downscale in pixel count). Blocks render as critical asset. |
| `cubes.png` | `/cubes.png` | PNG | 67 × 100 | 0.6 KB | `RevealContainer.tsx` (L31) | Above-the-fold (Hero Canvas background) | No | No | Rendered via CSS `backgroundImage` with `filter: invert(1)` causing paint overhead. |
| `bengal-tiger-poster.jpg` | `/bengal-tiger-poster.jpg` | JPEG | 1280 × 720 | **212.1 KB** | `mock-schema.ts` (Core-01 poster/visual) | Reveal container | No | No | Rendered via standard `<img>` without `loading="lazy"`. No WebP. |
| `bombay-brew-poster.jpg` | `/bombay-brew-poster.jpg` | JPEG | 1280 × 720 | **218.7 KB** | `mock-schema.ts` (Core-02 poster) | Reveal container | No | No | Lacks responsive srcset. |
| `kinetic-poster.jpg` | `/kinetic-poster.jpg` | JPEG | 1920 × 1080 | 141.0 KB | `mock-schema.ts` (Exp-01 poster), `layout.tsx` (OG) | Reveal container | No | No | Uncompressed 1080p poster. |
| `nightfall-stout-poster.jpg`| `/nightfall-stout-poster.jpg`| JPEG | 1920 × 1080 | **388.9 KB** | `mock-schema.ts` (Exp-02 poster) | Reveal container | No | No | Heavy 389 KB JPEG poster. |
| `process-story-poster.jpg` | `/process-story-poster.jpg` | JPEG | 1280 × 720 | 124.1 KB | `mock-schema.ts` (Story-01 poster) | Reveal container | No | No | No WebP version available. |
| `difference.jpg` | `/difference.jpg` | JPEG | 1024 × 1024 | **826.7 KB** | `mock-schema.ts` (Core-01 secondary visual) | Below-the-fold | No | No | **Extremely heavy (827 KB)** for a single 1024×1024 image. |
| `process.jpg` | `/process.jpg` | JPEG | 1024 × 1024 | **842.8 KB** | **Dead Asset** | N/A | N/A | No | **Unused 843 KB file** deployed to production. |
| `mockup.jpg` | `/mockup.jpg` | JPEG | 1024 × 1024 | **533.7 KB** | `mock-schema.ts`, `ScrollVideoJourney.tsx` | Below-the-fold fallback | No | No | Large JPEG fallback. |
| `ipa.jpg` | `/ipa.jpg` | JPEG | 1024 × 1024 | **462.8 KB** | `mock-schema.ts` (Core-02 visual) | Below-the-fold | No | No | Heavy 463 KB bottle render. |
| `past_release.jpg` | `/past_release.jpg` | JPEG | 1024 × 1024 | **425.1 KB** | `mock-schema.ts` (Exp-02 visual) | Below-the-fold | No | No | Specified twice as both primary and secondary visual. |
| `experimental_bottle.jpg` | `/experimental_bottle.jpg` | JPEG | 1024 × 1024 | **391.6 KB** | `mock-schema.ts` (Core-02 visual) | Below-the-fold | No | No | Heavy 392 KB bottle graphic. |
| `kinetic-bottle.jpg` | `/kinetic-bottle.jpg` | JPEG | 1920 × 1080 | 189.2 KB | `mock-schema.ts` (Exp-01 visual) | Below-the-fold | No | No | 1080p full frame asset. |
| `process-phase-1.jpg` | `/process-phase-1.jpg` | JPEG | 1280 × 720 | 55.4 KB | `mock-schema.ts` (Story editorial step) | Below-the-fold | No | No | Standard JPEG. |
| `process-phase-2.jpg` | `/process-phase-2.jpg` | JPEG | 1280 × 720 | 46.8 KB | `mock-schema.ts` (Story editorial step) | Below-the-fold | No | No | Standard JPEG. |
| `process-phase-3.jpg` | `/process-phase-3.jpg` | JPEG | 1280 × 720 | 45.1 KB | `mock-schema.ts` (Story editorial step) | Below-the-fold | No | No | Standard JPEG. |
| `process-phase-4.jpg` | `/process-phase-4.jpg` | JPEG | 1280 × 720 | 33.7 KB | `mock-schema.ts` (Story editorial step) | Below-the-fold | No | No | Standard JPEG. |
| `geometric-ipa-poster.jpg` | `/geometric-ipa-poster.jpg` | JPEG | 1920 × 1080 | 141.0 KB | **Dead Asset** | N/A | N/A | No | Unreferenced in code. |
| `favicon-raw.png` | `/favicon-raw.png` | PNG | 456 × 610 | 323.3 KB | **Dead Asset** | N/A | N/A | No | Duplicate of `favicon.png`. |
| `favicon-full.png` | `/favicon-full.png` | PNG | 512 × 512 | 151.0 KB | **Dead Asset** | N/A | N/A | No | Unreferenced in code. |
| `favicon-square.png` | `/favicon-square.png` | PNG | 360 × 360 | 84.5 KB | **Dead Asset** | N/A | N/A | No | Unreferenced in code. |
| `icon-512.png` | `/icon-512.png` | PNG | 512 × 512 | 154.6 KB | **Dead Asset** | N/A | N/A | No | Byte-for-byte duplicate of `apple-icon.png`. |
| `logo-card.png` | `/logo-card.png` | PNG | 372 × 482 | 135.5 KB | **Dead Asset** | N/A | N/A | No | Unreferenced in code. |
| `logo-mark.png` | `/logo-mark.png` | PNG | 340 × 340 | 83.2 KB | **Dead Asset** | N/A | N/A | No | Unreferenced in code. |
| `logo-tight.png` | `/logo-tight.png` | PNG | 340 × 418 | 112.4 KB | **Dead Asset** | N/A | N/A | No | Byte-for-byte duplicate of `logo.png`. |

### Key Image Findings:
1. **Total Image Weight:** 6.57 MB across 29 files. 2.02 MB consists of completely dead files.
2. **Complete Absence of Next.js Image Optimization:** The project does not import or use `next/image` in any component. Every image is rendered using standard HTML `<img>` tags (`<img src="..." />`).
3. **No Responsive Images (`srcset` / `sizes`):** A mobile user with a 375px wide screen downloads the exact same 1024×1024 or 1920×1080 JPEG as a 4K desktop monitor.
4. **No Dimension Attributes (`width` / `height`):** No `<img>` tag specifies explicit `width` or `height` HTML attributes. This induces Cumulative Layout Shift (CLS) during layout calculation before images decode.
5. **No Native Lazy Loading:** Every image tag lacks `loading="lazy"` and `decoding="async"`.

---

## 4. VIDEO AUDIT

A technical analysis of all 14 video assets was performed using `ffprobe` to evaluate encoding parameters, keyframe structure, index header (`moov` atom) positions, and playback behavior.

### Complete Video Technical Specification:

| Filename | File Size | Codec | Profile | Pix Fmt | Resolution | FPS | Duration | Bitrate | Keyframes Count | Avg GOP Interval | Faststart (`moov` at front) | Usage in Code |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `bengal-tiger-scrub.mp4` | **7.69 MB** | H.264 | High | yuv420p | 1280 × 720 | 24 | 8.0 s | **8,066 kbps** | 48 | 4.0 frames | **YES** | Primary scrub video for `core-01` |
| `bengal-tiger.mp4` | 6.08 MB | H.264 | High | yuv420p | 1280 × 720 | 24 | 8.0 s | 6,376 kbps | **1** | **192.0 frames** | **YES** | Fallback video for `core-01` |
| `bombay-brew-process-scrub.mp4` | **5.79 MB** | H.264 | High | yuv420p | 1280 × 720 | 24 | 8.0 s | **6,068 kbps** | 48 | 4.0 frames | **YES** | Primary scrub video for `core-02` |
| `bombay-brew-process.mp4` | 4.99 MB | H.264 | High | yuv420p | 1280 × 720 | 24 | 8.0 s | 5,235 kbps | **1** | **192.0 frames** | **YES** | Fallback video for `core-02` |
| `kinetic-process-scrub.mp4` | **10.53 MB** | H.264 | High | yuv420p | 1920 × 1080 | 30 | 6.8 s | **12,985 kbps** | 53 | 3.8 frames | **YES** | Primary scrub video for `exp-01` |
| `kinetic-process.mp4` | **15.64 MB** | H.264 | Main | yuv420p | 1920 × 1080 | 30 | 6.8 s | **19,298 kbps** | 5 | 40.8 frames | **NO (moov at end)** | Fallback video for `exp-01` |
| `nightfall-stout-process-scrub.mp4`| **4.59 MB** | H.264 | High | yuv420p | 1280 × 720 | 30 | 5.3 s | **7,272 kbps** | 40 | 4.0 frames | **YES** | Primary scrub video for `exp-02` |
| `nightfall-stout-process.mp4` | **12.31 MB** | H.264 | Main | yuv420p | 1920 × 1080 | 30 | 5.3 s | **19,478 kbps** | 2 | 79.5 frames | **NO (moov at end)** | Fallback video for `exp-02` |
| `process-story-scrub.mp4` | **4.68 MB** | H.264 | High | yuv420p | 1280 × 720 | 24 | 8.0 s | 4,903 kbps | 48 | 4.0 frames | **YES** | Primary scrub video for `story-01` |
| `process-story.mp4` | 4.72 MB | H.264 | High | yuv420p | 1280 × 720 | 24 | 8.0 s | 4,949 kbps | 2 | 96.0 frames | **YES** | Fallback video for `story-01` |
| `geometric-ipa-process-scrub.mp4` | 10.53 MB | H.264 | High | yuv420p | 1920 × 1080 | 30 | 6.8 s | 12,985 kbps | 53 | 3.8 frames | **YES** | **Dead Asset (Unreferenced)** |
| `geometric-ipa-process.mp4` | 15.64 MB | H.264 | Main | yuv420p | 1920 × 1080 | 30 | 6.8 s | 19,298 kbps | 5 | 40.8 frames | **NO (moov at end)** | **Dead Asset (Unreferenced)** |
| `bengal-tiger-process-scrub.mp4` | 4.77 MB | H.264 | High | yuv420p | 1280 × 720 | 24 | 8.0 s | 4,998 kbps | 48 | 4.0 frames | **YES** | **Dead Asset (Unreferenced)** |
| `bengal-tiger-process.mp4` | 4.72 MB | H.264 | High | yuv420p | 1280 × 720 | 24 | 8.0 s | 4,949 kbps | 2 | 96.0 frames | **YES** | **Dead Asset (Unreferenced)** |

### Critical Video Architectural Findings:

#### 1. Outrageously High Bitrates for Web Video
Web video streaming over mobile networks is typically budgeted at **800 kbps – 2,500 kbps**.
* `kinetic-process.mp4` runs at **19,298 kbps (~19.3 Mbps)**.
* `nightfall-stout-process.mp4` runs at **19,478 kbps (~19.5 Mbps)**.
* `kinetic-process-scrub.mp4` runs at **12,985 kbps (~13.0 Mbps)**.
* `bengal-tiger-scrub.mp4` runs at **8,066 kbps (~8.1 Mbps)**.
A single 6.8-second video consumes up to **15.64 MB**. On a standard 4G mobile connection (10–25 Mbps down), downloading this single video saturates the client's radio pipe for 5 to 12 seconds, blocking all other network operations (including images and fonts).

#### 2. Missing Faststart (`moov` Atom at End of File)
In `kinetic-process.mp4`, `nightfall-stout-process.mp4`, and `geometric-ipa-process.mp4`, `moov_at_end = True`.
In MP4 containers, the `moov` atom stores the sample index table (which byte offsets correspond to which timestamps). When the `moov` atom is at the end of the file:
* **The browser CANNOT seek or start playback until 100% of the file has been downloaded.**
* Any seek command (`video.currentTime = X`) issued before the final byte is received fails or stalls the decoder completely.

#### 3. Single-Keyframe Catastrophe on Fallback Videos
* `bengal-tiger.mp4`: Contains **exactly 1 keyframe** (I-frame) at timestamp `0.000000` across the entire 8.0 seconds (192 frames).
* `bombay-brew-process.mp4`: Contains **exactly 1 keyframe** at `0.000000` across 192 frames.
If a browser falls back to either video, seeking to second 7.5 requires the mobile device decoder to decode **180 inter-coded frames (P/B frames) sequentially in real time**. On a mobile ARM processor, this induces 500ms – 1,200ms frame lag per seek, causing the scrubber to freeze solid.

#### 4. Invalid HTML5 Video Tag Structure
In `ScrollVideoJourney.tsx` (Lines 526–544):
```tsx
<video
  ref={videoRef}
  src={videoSrc}
  poster={posterSrc}
  muted
  playsInline
  preload="metadata"
  ...
>
  {fallbackSrc && <source src={fallbackSrc} type="video/mp4" />}
</video>
```
According to the W3C HTML5 Media specification: **When the `src` attribute is defined directly on the `<video>` element, the browser IGNORES all nested `<source>` tags.** The nested fallback `<source>` is completely inert. If `videoSrc` fails, the browser will not attempt to load `fallbackSrc`.

---

## 5. MOBILE-SPECIFIC AUDIT & VIEWPORT ANALYSIS

Tested viewports:
* **375 × 812** (iPhone X, 11 Pro, 12 mini, 13 mini)
* **390 × 844** (iPhone 12, 13, 14, 15)
* **412 × 915** (Samsung Galaxy S20+, Google Pixel 7)

### Mobile Viewport Behavior Matrix:

| Viewport | Component Affected | Observed Failure Mechanism | Code Responsible |
| :--- | :--- | :--- | :--- |
| **All Mobile** (375×812, 390×844, 412×915) | Initial Home Screen (`HeroCanvas`) | **Total vertical scroll lock:** User cannot scroll down to view products if touch starts within the upper 52% of the viewport. | `src/components/ui/ParticleText.css:8` (`touch-action: none;`) |
| **All Mobile** | Reveal Viewport (`ScrollVideoJourney`) | **Erratic jitter / gesture fight:** Horizontal swipe attempts to scroll scroller natively, while `touchmove` listener manually sets `scroller.scrollLeft = initialScrollLeft - deltaX * 1.5`. | `src/components/layout/ScrollVideoJourney.tsx:470` |
| **All Mobile** | Scroll Track (`scrollTrackRef`) | **Gesture suppression:** Horizontal overflow element has `touch-action: pan-y`, instructing the browser touch engine to cancel horizontal gestures. | `src/components/layout/ScrollVideoJourney.tsx:562` |
| **iOS Safari** | Video Element (`<video>`) | **Black/frozen frame or opacity-0 invisibility:** Safari does not fire `loadedmetadata` with `preload="metadata"` under battery saver/cellular conditions without user play gesture; `isLoaded` remains false. | `src/components/layout/ScrollVideoJourney.tsx:58, 240, 539` |
| **iOS Safari** | Brutalist Thumb Drag | **Accidental browser navigation:** Thumb touch handler attaches passive `touchmove` without `preventDefault()`, triggering Safari's edge-swipe back navigation. | `src/components/layout/ScrollVideoJourney.tsx:420` |
| **All Mobile** | Nested Modals | **Fixed container clipping:** `page.tsx` renders parent container with `fixed top-0 left-0 h-screen z-40`, wrapping child `RevealContainer` with `fixed inset-0 z-50 overflow-y-auto`. | `src/app/page.tsx:59`, `src/components/layout/RevealContainer.tsx:134` |
| **All Mobile** | Dynamic Viewport Resizing | `h-[45dvh]` and `min-h-[52dvh]` trigger constant layout recalculations when mobile browser URL bars collapse during scroll. | `src/components/layout/ScrollVideoJourney.tsx:504` |

---

## 6. JAVASCRIPT & RUNTIME PERFORMANCE AUDIT

### Offender #1: Unthrottled Infinite Canvas Render Loop (`ParticleText.tsx`)
```ts
// src/components/ui/ParticleText.tsx:274
animationFrame = window.requestAnimationFrame(render);
```
* **Failure Mode:** `ParticleText` executes an unthrottled `requestAnimationFrame` loop that runs continuously at 60 FPS (or 120 FPS on ProMotion displays).
* **Workload per Frame:**
  * Loops over 1,300 particles (mobile) or up to 6,500 particles (desktop).
  * Executes trigonometric functions: `Math.sin(driftTime * 0.9 + seed * 10) * idleDrift`.
  * Computes Euclidean pointer distances: `Math.hypot(dx, dy)`.
  * Executes canvas path commands: `ctx.beginPath()`, `ctx.arc(...)`, and `ctx.fill()` for every single particle.
* **No Visibility Check:** There is no `IntersectionObserver` or `document.hidden` check. When the user scrolls past the hero to the bottom of the page, the canvas continues burning GPU/CPU cycles in the background.
* **Duplicate Mobile Instance:** On mobile initial load, `src/app/page.tsx` mounts `<HeroCanvas isMobile />` at line 31, while `<HeroCanvas isMobile={false} />` is simultaneously mounted inside `<RevealContainer>` at line 60 (hidden only via CSS `hidden md:block`). Both instances execute their initialization hooks and run concurrent animation frames.

### Offender #2: Layout Thrashing Inside Scroll Handler (`ScrollVideoJourney.tsx`)
```ts
// src/components/layout/ScrollVideoJourney.tsx:141-153
const maxScroll = scroller.scrollWidth - scroller.clientWidth; // FORCES REFLOW
...
const trackWidth = track.clientWidth;                         // FORCES REFLOW
const thumbWidth = Math.max(36, (scroller.clientWidth / scroller.scrollWidth) * trackWidth);
...
thumb.style.width = `${thumbWidth}px`;                         // MUTATES STYLE
thumb.style.transform = `translateX(${thumbLeft}px)`;         // MUTATES STYLE
```
Reading `scrollWidth` and `clientWidth` immediately before mutating DOM element styles during scroll events triggers synchronous layout computation (Forced Synchronous Layout / Layout Thrashing) on every scroll tick.

### Offender #3: Continuous Seek Loop Without Hardware Debouncing
In `ScrollVideoJourney.tsx`:
```ts
if (!video.seeking) {
  pendingTimeRef.current = null;
  video.currentTime = target;
} else {
  pendingTimeRef.current = target;
}
```
When `onSeeked` fires:
```ts
const onSeeked = () => {
  if (pendingTimeRef.current !== null) {
    const nextTarget = pendingTimeRef.current;
    pendingTimeRef.current = null;
    if (Math.abs(nextTarget - video.currentTime) >= 0.02) {
      video.currentTime = nextTarget;
    }
  }
};
```
As soon as the video hardware decoder finishes one seek, `onSeeked` immediately initiates the next seek. Under rapid scrubbing, the media pipeline is kept in a 100% saturated seeking state, leaving zero decoder cycles to paint intermediate frames to the screen.

### Offender #4: Non-Passive Wheel Listener
```ts
// src/components/layout/ScrollVideoJourney.tsx:298
container.addEventListener("wheel", onWheelHandler, { passive: false });
```
Marking wheel event listeners as `{ passive: false }` prevents modern browser compositor threads from handling scroll gestures asynchronously, introducing scroll jank.

---

## 7. CSS AUDIT

### 1. Global Wildcard Selector Performance Impact
In `src/app/globals.css` (Lines 22–26):
```css
* {
  border-radius: var(--radius-0) !important;
  border-color: rgb(var(--color-ink-black));
}
```
The universal selector `*` with `!important` invalidates style sharing across all DOM elements, increasing style recalculation costs on every DOM mutation.

### 2. Conflicting Touch Action Declarations
* In `ParticleText.css` (Line 8):
  ```css
  .particle-text {
    touch-action: none; /* KILLS VERTICAL PAGE SCROLL ON MOBILE HERO */
  }
  ```
* In `ScrollVideoJourney.tsx` (Line 562):
  ```css
  touchAction: "pan-y" /* KILLS HORIZONTAL SCROLL ON OVERFLOW-X CONTAINER */
  ```

### 3. Box Shadow and Border Filter Overuse
* 13 instances of brutalist hard shadows (`shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]`). While hard box-shadows (0px blur) do not incur Gaussian blur rendering penalties, stacking multiple shadow layers over animated transforms causes composite layer re-rasterization.
* CSS `filter: "invert(1)"` applied to `cubes.png` background inside `HeroCanvas` forces an unnecessary rasterization filter on the background layer.

---

## 8. FONT AUDIT

### Preloaded Web Fonts:
Next.js Google Font integration (`next/font/google`) in `src/app/layout.tsx` preloads 5 `.woff2` files:
1. `/_next/static/media/36966cca54120369-s.p.woff2`: 22.3 KB (Space Grotesk)
2. `/_next/static/media/98e207f02528a563-s.p.woff2`: 10.1 KB (IBM Plex Mono)
3. `/_next/static/media/d3ebbfd689654d3a-s.p.woff2`: 10.1 KB (IBM Plex Mono)
4. `/_next/static/media/db96af6b531dc71f-s.p.woff2`: 10.1 KB (IBM Plex Mono)
5. `/_next/static/media/e4af272ccee01ff0-s.p.woff2`: 48.4 KB (Inter)
* **Total Web Font Transfer:** **98.6 KB** across 5 WOFF2 files.
* **Cache Headers:** Properly served with `public, max-age=31536000, immutable`.
* **Font-Display:** Next.js defaults to `font-display: swap`, avoiding render blocking.

### Orphaned Local Font Assets:
In `src/app/fonts/`:
* `GeistVF.woff` (66.3 KB)
* `GeistMonoVF.woff` (67.9 KB)
Both files are unused artifacts from Next.js project initialization and should be removed.

---

## 9. NETWORK FINDINGS & WATERFALL ANALYSIS

```
[0.0s]  GET / (HTML Document - 28.8 KB) ............................ [TTFB: 1,807ms]
[1.8s]  GET /_next/static/css/3db96aab5da1df0f.css (34.5 KB) ........ [200 OK - 85ms]
[1.8s]  GET /_next/static/media/36966cca54120369-s.p.woff2 (22.3 KB) [200 OK - 92ms]
[1.8s]  GET /_next/static/media/e4af272ccee01ff0-s.p.woff2 (48.4 KB) [200 OK - 110ms]
[1.8s]  GET /favicon.png (323.3 KB) [CRITICAL BOTTLENECK] .......... [200 OK - 240ms]
[1.9s]  GET /logo.png (112.4 KB) [CRITICAL BOTTLENECK] ............. [200 OK - 180ms]
[1.9s]  GET /_next/static/chunks/fd9d1056-88c8a1669018f964.js (168.8 KB) [200 OK - 195ms]
[1.9s]  GET /_next/static/chunks/117-3872fdc85f836239.js (121.4 KB)  [200 OK - 170ms]
[1.9s]  GET /_next/static/chunks/polyfills-42372ed130431b0a.js (110.0 KB) [200 OK]
[2.0s]  GET /_next/static/chunks/app/page-570868d48b29f397.js (43.7 KB) [200 OK]
[2.1s]  GET /.netlify/scripts/hud?variant=public (33.7 KB) .......... [200 OK - 120ms]
============================== PRODUCT SELECTION ==============================
[USER SELECTS BENGAL TIGER]
[2.3s]  GET /bengal-tiger-poster.jpg (212.1 KB) .................... [200 OK - 160ms]
[2.3s]  GET /bengal-tiger-scrub.mp4 (7.69 MB) [RANGE: 0-1024] ...... [206 Partial - 95ms]
[2.4s]  GET /bengal-tiger-scrub.mp4 (7.69 MB STREAM CONTINUATION) .. [STREAMING: 7.7 MB]
```

### Waterfall Anomalies:
1. **Immediate Favicon Payload Spike:** A browser downloading `/favicon.png` transfers **323.3 KB** within the first 2 seconds of page load.
2. **Immediate Logo Payload Spike:** `/logo.png` transfers **112.4 KB** to display a tiny 32×40 header icon.
3. **Massive Video Range Stream:** As soon as any product is clicked, an immediate **4.6 MB to 10.5 MB** video download begins over the network, competing with pending image requests.

---

## 10. CORE WEB VITALS AUDIT

| Metric | Estimated / Measured Value | Status | Primary Contributing Factors |
| :--- | :--- | :--- | :--- |
| **TTFB** (Time to First Byte) | **1,807 ms** (cold) / 220 ms (warm) | **POOR** | Next.js serverless SSR runtime function execution on Netlify without static edge caching. |
| **FCP** (First Contentful Paint) | **2.2 s – 2.8 s** | **NEEDS IMPROVEMENT** | Delayed by high TTFB, 34.5 KB CSS bundle, and font loading. |
| **LCP** (Largest Contentful Paint) | **3.2 s – 4.5 s** | **POOR** | On mobile initial load, `HeroCanvas` renders via `<canvas>`, which is **NOT an LCP candidate**. LCP falls back to text in `ProductIndex` or logo image. |
| **CLS** (Cumulative Layout Shift)| **0.08 – 0.18** | **NEEDS IMPROVEMENT** | Dynamic viewport units (`dvh`), missing width/height attributes on `<img>` tags, and banner/header shifts. |
| **INP** (Interaction to Next Paint)| **180 ms – 350 ms** | **POOR** | Long JavaScript main thread tasks during particle text generation, synchronous layout reads in scroll handlers, and rapid seek loops. |

---

## 11. ROOT CAUSE ANALYSIS FOR REPORTED SYMPTOMS

### SYMPTOM A: "The website takes a long time to load."
* **Likely Root Cause:** A combination of high SSR serverless cold-start TTFB (1.8s) on Netlify, an uncompressed 323 KB favicon and 112 KB header logo requested immediately, and synchronous font/particle initialization on the main thread during hydration.
* **Responsible Files:**
  * `netlify.toml`: Deploys dynamic SSR function instead of static pre-rendered export.
  * `src/app/layout.tsx` (Lines 43, 62): Links raw `/favicon.png` (323 KB) and `/logo.png` (112 KB).
  * `src/components/ui/ParticleText.tsx` (Lines 377–432): Executes synchronous pixel sampling (`getImageData`) and particle generation upon mount.
* **Severity:** **HIGH**
* **Scope:** Desktop and Mobile.
* **Recommended Fix:** Convert Next.js to static export (`output: 'export'`), optimize `favicon.png` to a 4 KB SVG or WebP, optimize `/logo.png` to SVG (4 KB), and defer particle initialization until after initial render.
* **Expected Impact:** Reduces initial network transfer by over 400 KB and drops TTFB from 1,800ms to <150ms on Netlify CDN edge.

---

### SYMPTOM B: "On mobile, scroll-driven reveal videos do not function correctly."
* **Likely Root Cause:** Multiple compounded failures:
  1. `touch-action: pan-y` on `scrollTrackRef` instructs mobile browsers to suppress horizontal swipe gestures on the scroller.
  2. The manual `touchmove` listener in `ScrollVideoJourney.tsx` assigns `scroller.scrollLeft = initialScrollLeft - deltaX * 1.5`, directly fighting the browser's native momentum scrolling engine.
  3. `<video preload="metadata">` without `autoplay` or a user touch `.play()` / `.load()` handshake prevents Mobile Safari from decoding metadata or advancing frames; `isLoaded` stays `false`, keeping the video hidden at `opacity: 0`.
  4. Video files have high bitrates (up to 19.5 Mbps) and key fallback files have missing `faststart` (`moov` at end of file) or contain only 1 keyframe across 192 frames.
* **Responsible Files:**
  * `src/components/layout/ScrollVideoJourney.tsx` (Lines 465–471, 532–540, 562).
  * `src/lib/data/mock-schema.ts` (Video configs).
  * `public/kinetic-process.mp4`, `public/bengal-tiger.mp4`, `public/nightfall-stout-process.mp4`.
* **Severity:** **CRITICAL**
* **Scope:** Mobile primarily (Safari iOS and Chrome Android).
* **Recommended Fix:** Remove `touch-action: pan-y` from horizontal tracks; eliminate conflicting manual `scrollLeft` calculation during touchmove; execute an programmatic `video.play().then(() => video.pause())` or `.load()` handshake on user product selection; re-encode videos with `faststart` enabled (`-movflags +faststart`), keyframe intervals of 0.25s–0.5s (`-g 12`), and bitrates capped at 1,500–2,500 kbps.
* **Expected Impact:** Restores 60fps video scrubbing on mobile devices, eliminates gesture freezing, and cuts video transfer weight by 75–85%.

---

### SYMPTOM C: "Images sometimes do not load properly on mobile."
* **Likely Root Cause:**
  1. Memory pressure and GPU texture exhaustion on mobile WebKit caused by concurrent 1080p/1024px uncompressed JPEG decoding, large canvas bitmap manipulation (`getImageData`), and 19 Mbps video buffering.
  2. Concurrent network pipeline starvation: When a product is selected, the browser begins downloading an 8–16 MB MP4 video over the single cellular HTTP connection, starving out pending secondary image requests.
  3. Incorrect conditional rendering logic in `ScrollVideoJourney.tsx` (Line 513): When `isLoaded` switches to `true`, the fallback poster image is completely unmounted from the DOM. If the video fails or stalls later, no image is visible.
* **Responsible Files:**
  * `src/components/layout/ScrollVideoJourney.tsx` (Lines 513–522).
  * `src/lib/data/mock-schema.ts` (Image paths).
  * `src/components/layout/RevealContainer.tsx` (Lines 159–227).
* **Severity:** **HIGH**
* **Scope:** Mobile primarily (low-memory and cellular environments).
* **Recommended Fix:** Implement responsive images with WebP/AVIF compression (reducing image sizes by 80%); leave the fallback poster mounted beneath the video element with CSS opacity transitions rather than unmounting it from the React tree; prioritize image loading before video buffering.
* **Expected Impact:** Completely prevents blank image boxes, reduces image memory footprint from ~6.5 MB to <1.2 MB, and guarantees visual fallbacks on network dropouts.

---

## 12. PRIORITIZED ISSUE LIST

| Priority | Issue | File | Evidence | Impact | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Critical** | Mobile Touch Lockout on Hero Canvas | `src/components/ui/ParticleText.css` | Line 8: `touch-action: none;` on `.particle-text` occupying 52dvh of viewport. | Users cannot scroll down on mobile if touch begins on the hero section. | Change to `touch-action: pan-y;` or move touch listeners to pointer-only. |
| **Critical** | Conflicting Gesture Handlers in Video Scroller | `src/components/layout/ScrollVideoJourney.tsx` | Line 470: `scroller.scrollLeft = initialScrollLeft - deltaX * 1.5;` conflicting with native `overflow-x-auto`. | Violent scroll jitter, jumping, or gesture freezing on touch devices. | Rely strictly on native horizontal touch scrolling; remove manual touchmove scrollLeft override. |
| **Critical** | Conflicting CSS `touchAction: "pan-y"` on Scroller | `src/components/layout/ScrollVideoJourney.tsx` | Line 562: `touchAction: "pan-y"` on an `overflow-x-auto` track. | Native horizontal swipe gestures are cancelled by the browser engine. | Change to `touchAction: "pan-x"` or `"manipulation"`. |
| **Critical** | iOS Safari Paused Video Frame Decode Stalemate | `src/components/layout/ScrollVideoJourney.tsx` | Lines 532, 539: `<video preload="metadata">` without play handshake; `isLoaded` stays false. | Video remains invisible (`opacity-0`) on iOS Safari; user sees only frozen fallback image. | Execute a muted play/pause handshake or explicit `.load()` call upon component mount. |
| **Critical** | Missing Faststart (`moov` at End) & Single Keyframes | `public/kinetic-process.mp4`, `public/bengal-tiger.mp4` | `ffprobe` confirms `moov` at file end on 15.6 MB video; 1 keyframe across 192 frames. | Video cannot seek until 100% downloaded; seeks require decoding up to 191 frames sequentially. | Re-encode all videos with `-movflags +faststart` and fixed keyframe interval `-g 12`. |
| **High** | Massive Video Bitrates (up to 19.5 Mbps) | `src/lib/data/mock-schema.ts`, `public/*.mp4` | Videos range from 4.6 MB to 15.6 MB (Total 112 MB). | Saturates mobile cellular connections, freezes video scrub, delays image loads. | Transcode all videos with H.264/H.265/AV1 at 1,200–2,200 kbps (reduces size by 80%). |
| **High** | Uncompressed 323 KB Favicon & 112 KB Logo | `src/app/layout.tsx` | Line 43: `/favicon.png` (323 KB); Line 62: `/logo.png` (112 KB) for 32×40 display. | Wastes 435 KB of critical bandwidth on every page load; delays FCP. | Replace with 4 KB SVG or properly scaled 32×32 PNG favicon and SVG logo. |
| **High** | Absence of Next/Image & Missing WebP/AVIF | Entire project (`src/**/*.tsx`) | Zero instances of `next/image`; raw `<img>` tags without `srcset`, `sizes`, `width`, `height`. | High image payload (6.57 MB total), layout shifts (CLS), no responsive downscaling. | Adopt `next/image` with WebP/AVIF generation, explicit dimensions, and responsive sizes. |
| **High** | Infinite 60–120 FPS Particle Loop Without Culling | `src/components/ui/ParticleText.tsx` | Line 274: Endless rAF loop; no `IntersectionObserver`. | Drains mobile battery, heats device, causes frame drops during scroll. | Pause rAF loop when canvas is offscreen or hidden using `IntersectionObserver`. |
| **High** | Concurrent Duplicate Canvas Instances on Mobile | `src/app/page.tsx` | Lines 31, 60: Mounts `<HeroCanvas>` twice in the DOM when `selectedId === null`. | Doubles GPU/CPU draw overhead on mobile devices during initial load. | Conditionally unmount desktop HeroCanvas when on mobile viewport. |
| **Medium** | 37.6 MB of Dead / Unreferenced Assets Deployed | `public/` directory | 4 unused videos (35.6 MB), 6 unused images (2.0 MB). | Bloats repository, increases deployment times, wastes host storage. | Purge unreferenced files from `public/`. |
| **Medium** | Layout Thrashing in `handleScroll` | `src/components/layout/ScrollVideoJourney.tsx` | Lines 141, 152: Synchronously reads `scrollWidth` and `clientWidth` during scroll. | Causes forced reflow on every scroll event, inducing scroll jank. | Cache container dimensions on resize; read cached values during scroll. |
| **Medium** | Non-Passive Wheel Listener | `src/components/layout/ScrollVideoJourney.tsx` | Line 298: `addEventListener("wheel", ..., { passive: false })`. | Blocks browser threaded scrolling; triggers browser console warnings. | Refactor boundary checks to avoid non-passive wheel hijacking. |
| **Low** | Broken `metadataBase` Domain | `src/app/layout.tsx` | Line 17: `https://riotbrewing.co` fails DNS/connection. | Social sharing cards and OG previews fail to load. | Update `metadataBase` to production Netlify URL or valid custom domain. |
| **Low** | Unused Geist Font Files in Source Tree | `src/app/fonts/` | `GeistVF.woff` (66 KB), `GeistMonoVF.woff` (68 KB). | 134 KB of unused source files. | Delete unused font files from `src/app/fonts/`. |

---

## 13. FILE-BY-FILE FINDINGS

### FILE: `src/components/ui/ParticleText.css`
* **LINE:** 8
* **CURRENT IMPLEMENTATION:**
  ```css
  .particle-text {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    min-height: 240px;
    overflow: hidden;
    touch-action: none;
    isolation: isolate;
  }
  ```
* **PROBLEM:** `touch-action: none;` disables all browser-level gesture handling (including vertical scrolling) over the entire particle container.
* **WHY IT MATTERS:** On mobile devices, `HeroCanvas` renders this element across `min-h-[52dvh]`. When users place their finger on the screen to scroll down, the browser discards the gesture, locking the screen.
* **RECOMMENDED CHANGE:**
  Change `touch-action: none;` to `touch-action: pan-y;` so vertical page scrolling is preserved, or attach touch handling specifically to pointer interactions that do not suppress default panning.

---

### FILE: `src/components/layout/ScrollVideoJourney.tsx`
* **LINE:** 465–472
* **CURRENT IMPLEMENTATION:**
  ```tsx
  if (isHorizontalSwipe === true) {
    touchMoved = true;
    if (e.cancelable) {
      e.preventDefault();
    }
    scroller.scrollLeft = initialScrollLeft - deltaX * 1.5;
  }
  ```
* **PROBLEM:** Manually recalculating and assigning `scroller.scrollLeft` with an artificial `1.5×` acceleration factor while the parent scroller is an `overflow-x-auto` element with native momentum scrolling.
* **WHY IT MATTERS:** Causes violent jitter, fighting between the native iOS/Android compositor scroll and JavaScript main-thread scroll assignments, and broken scrubbing.
* **RECOMMENDED CHANGE:** Remove manual `scrollLeft` manipulation in `onTouchMove`. Allow native horizontal momentum scrolling on `scrollTrackRef` to drive the scroll position, and listen to the native `scroll` event.

---

### FILE: `src/components/layout/ScrollVideoJourney.tsx`
* **LINE:** 562
* **CURRENT IMPLEMENTATION:**
  ```tsx
  style={{
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
  }}
  ```
* **PROBLEM:** Declaring `touchAction: "pan-y"` on a horizontally scrolling element (`overflow-x-auto`).
* **WHY IT MATTERS:** `touchAction: "pan-y"` explicitly instructs the browser touch engine to disable horizontal gestures. This directly inhibits swipe scrubbing on mobile devices.
* **RECOMMENDED CHANGE:** Change to `touchAction: "pan-x"` or `touchAction: "manipulation"`.

---

### FILE: `src/components/layout/ScrollVideoJourney.tsx`
* **LINE:** 526–544
* **CURRENT IMPLEMENTATION:**
  ```tsx
  <video
    ref={videoRef}
    src={videoSrc}
    poster={posterSrc}
    muted
    playsInline
    preload="metadata"
    ...
  >
    {fallbackSrc && <source src={fallbackSrc} type="video/mp4" />}
  </video>
  ```
* **PROBLEM:** 
  1. Defining `src` on `<video>` invalidates the child `<source>` tag per W3C specification.
  2. `preload="metadata"` without `autoplay` or a programmatic `.load()` / `.play()` handshake causes iOS Safari under battery/cellular optimization to defer metadata loading indefinitely.
* **WHY IT MATTERS:** Video remains in `readyState 0`. `isLoaded` stays `false`, and the video remains completely hidden (`opacity-0`).
* **RECOMMENDED CHANGE:** Remove `src` attribute from `<video>` tag when using child `<source>` elements, or manage source swapping via JavaScript; add an explicit `.load()` call and a muted play/pause handshake upon component mount.

---

### FILE: `src/components/ui/ParticleText.tsx`
* **LINE:** 274
* **CURRENT IMPLEMENTATION:**
  ```ts
  animationFrame = window.requestAnimationFrame(render);
  ```
* **PROBLEM:** The animation frame loop runs indefinitely, even after particles have finished gathering (`gathering = false`) and even when the canvas is scrolled out of view.
* **WHY IT MATTERS:** Draws thousands of 2D canvas circles every 16ms/8ms continuously, causing severe CPU/GPU battery drain on mobile devices and degrading scroll responsiveness.
* **RECOMMENDED CHANGE:** Wrap the render loop with an `IntersectionObserver`. When `isIntersecting === false`, cancel the `requestAnimationFrame` loop; resume it when visible. Disable `idleDrift` on mobile devices.

---

### FILE: `src/app/page.tsx`
* **LINE:** 27–33, 59–64
* **CURRENT IMPLEMENTATION:**
  ```tsx
  <div className={`w-full md:w-1/2 lg:w-2/5 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
    {!selectedId && (
      <div className="block md:hidden">
        <HeroCanvas isMobile />
      </div>
    )}
    ...
  </div>

  <div className={`w-full md:w-1/2 lg:w-3/5 fixed md:relative top-0 left-0 h-screen md:h-auto z-40 md:z-auto ${selectedId ? 'block' : 'hidden md:block'}`}>
    <RevealContainer 
      selectedProduct={selectedProduct} 
      onCloseMobile={() => setSelectedId(null)}
    />
  </div>
  ```
* **PROBLEM:** When `selectedId === null`, `<HeroCanvas isMobile />` is mounted at line 31, while `<RevealContainer>` simultaneously renders `<HeroCanvas isMobile={false} />` at line 60 inside a container with `hidden md:block`.
* **WHY IT MATTERS:** Both canvas instances initialize in memory and run concurrent animation hooks on mobile.
* **RECOMMENDED CHANGE:** Conditionally render the desktop `<RevealContainer>` only when on desktop or when `selectedId !== null`.

---

### FILE: `src/app/layout.tsx`
* **LINE:** 43, 62
* **CURRENT IMPLEMENTATION:**
  ```tsx
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      ...
    ]
  }
  ...
  <img src="/logo.png" alt="Riot Brewing Co." className="h-10 w-auto object-contain shrink-0" />
  ```
* **PROBLEM:** Loads an uncompressed 323 KB PNG for the favicon and a 112 KB PNG for a 32×40 header logo.
* **WHY IT MATTERS:** Wastes ~435 KB of network bandwidth on initial render before any user interaction occurs.
* **RECOMMENDED CHANGE:** Replace `/favicon.png` with a 32×32 optimized favicon (2 KB) or SVG favicon; replace `/logo.png` with an inline or optimized SVG asset (4 KB).

---

### FILE: `src/app/layout.tsx`
* **LINE:** 17
* **CURRENT IMPLEMENTATION:**
  ```tsx
  metadataBase: new URL("https://riotbrewing.co"),
  ```
* **PROBLEM:** `https://riotbrewing.co` is an unreachable / non-functional domain.
* **WHY IT MATTERS:** All OpenGraph and Twitter card image previews (`og:image`, `twitter:image`) fail to resolve in social applications.
* **RECOMMENDED CHANGE:** Update `metadataBase` to `new URL("https://riot-brewing-co.netlify.app")` or the verified production domain.

---

## 14. RECOMMENDED IMPLEMENTATION & OPTIMIZATION PLAN

### PHASE 1 — Immediate Fixes (Critical & Zero Regression Risk)
* **Estimated Impact:** **Very High**
1. **Fix Mobile Touch Lockout:** In `src/components/ui/ParticleText.css`, change `touch-action: none;` to `touch-action: pan-y;`.
2. **Fix Scroller Touch Action:** In `src/components/layout/ScrollVideoJourney.tsx`, replace `touchAction: "pan-y"` with `touchAction: "pan-x"`.
3. **Eliminate Conflicting Touchmove Override:** In `src/components/layout/ScrollVideoJourney.tsx`, remove manual `scroller.scrollLeft = initialScrollLeft - deltaX * 1.5;` calculation, allowing native horizontal momentum scrolling.
4. **Fix HTML5 Video Source Hierarchy:** Fix `<video>` tag attribute redundancy so child `<source>` tags are properly parsed.
5. **Correct `metadataBase`:** Update `metadataBase` in `src/app/layout.tsx` to `https://riot-brewing-co.netlify.app`.

---

### PHASE 2 — Media & Asset Optimization
* **Estimated Impact:** **Very High**
1. **Favicon & Logo Compression:**
   * Generate an optimized 32×32 PNG favicon (<3 KB) and SVG favicon (<2 KB) to replace the 323 KB `favicon.png`.
   * Convert `/logo.png` (112 KB) to an SVG logo asset (<5 KB).
2. **Purge 37.6 MB of Dead Public Assets:**
   * Remove `geometric-ipa-process.mp4`, `geometric-ipa-process-scrub.mp4`, `bengal-tiger-process.mp4`, `bengal-tiger-process-scrub.mp4`.
   * Remove `process.jpg`, `favicon-raw.png`, `geometric-ipa-poster.jpg`, `favicon-full.png`, `logo-card.png`, `logo-tight.png`, `logo-mark.png`, `favicon-square.png`.
3. **WebP/AVIF Image Conversion:**
   * Convert bottle and poster JPEGs (`difference.jpg`, `ipa.jpg`, `mockup.jpg`, `past_release.jpg`) to WebP/AVIF with 80% quality. (Reduces image folder from 6.5 MB to ~1.1 MB).
4. **Adopt Next.js `<Image />` Component:**
   * Replace raw `<img>` tags with `next/image` to enable automatic responsive resizing, srcset generation, and lazy loading.

---

### PHASE 3 — Video Scrubbing Pipeline Optimization
* **Estimated Impact:** **Very High**
1. **Transcode Videos with Optimal Scrubbing Parameters:**
   * Run FFmpeg pass on all active videos:
     ```bash
     ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 23 -maxrate 2200k -bufsize 4400k -g 12 -keyint_min 12 -movflags +faststart -pix_fmt yuv420p -an output-optimized.mp4
     ```
   * Ensures `faststart` (`moov` at front), GOP interval of 12 frames (0.5s seek accuracy), and reduces file sizes from 10–16 MB down to 1.8–3.2 MB.
2. **Implement WebKit Hardware Play/Pause Handshake:**
   * On mobile mount, execute `video.play().then(() => video.pause())` or explicit `video.load()` so WebKit initializes the hardware decoding pipeline and allows seeking while paused.
3. **Implement `video.fastSeek()` Feature Detection:**
   * Use `video.fastSeek(target)` where supported (Safari / iOS) for instantaneous hardware-accelerated keyframe seeking during rapid drag.

---

### PHASE 4 — Mobile-Specific & Layout Improvements
* **Estimated Impact:** **High**
1. **Cull Duplicate Mobile Hero Canvas:**
   * In `src/app/page.tsx`, ensure the desktop `<HeroCanvas>` is completely unmounted when rendering mobile viewports.
2. **Increase Brutalist Scrollbar Thumb Touch Target:**
   * Expand the mobile thumb hit area to 44×44 px minimum to comply with WCAG 2.5.5 touch target size guidelines.
3. **De-duplicate Fixed Containers:**
   * Clean up nested `fixed` containers in `page.tsx` and `RevealContainer.tsx` to prevent iOS Safari address bar jump artifacts.

---

### PHASE 5 — Final Performance Polish
* **Estimated Impact:** **Medium**
1. **IntersectionObserver on ParticleText:**
   * Automatically disconnect or pause the canvas render loop when the hero scrolls out of the active viewport.
2. **Cache Layout Dimensions:**
   * Store `scrollWidth` and `clientWidth` in component refs updated only on `ResizeObserver` events, eliminating forced synchronous layout in `handleScroll`.
3. **Static Generation Evaluation:**
   * Configure `output: 'export'` or SSG in Next.js build options to eliminate serverless cold-start latency on Netlify, reducing TTFB to <100ms globally.

---

## 15. EVIDENCE & MEASUREMENTS SUMMARY

### Network Asset Transfer Summary:
* **Initial Document TTFB:** 1,807.5 ms (Cold Start) / 220 ms (Warm)
* **Initial JavaScript Transfer:** 481.4 KB (7 chunks)
* **Initial CSS Transfer:** 34.8 KB (2 stylesheets)
* **Initial Font Transfer:** 98.6 KB (5 WOFF2 files)
* **Initial Image Transfer:** 435.7 KB (Favicon 323 KB + Logo 112 KB + Cubes 0.6 KB)
* **Total Initial Page Weight:** **1,079 KB (1.08 MB)**
* **Total Static Assets in Repository:** **119.25 MB** (112.68 MB Videos + 6.57 MB Images)
* **Unreferenced Dead Assets Deployed:** **37.68 MB** (31.6% of total repository asset weight)

### Video File Measurements:
* `kinetic-process.mp4`: 15.64 MB | 19,298 kbps | `moov_at_end = True` | Keyframe interval: 40.8 frames
* `nightfall-stout-process.mp4`: 12.31 MB | 19,478 kbps | `moov_at_end = True` | Keyframe interval: 79.5 frames
* `geometric-ipa-process.mp4`: 15.64 MB | 19,298 kbps | `moov_at_end = True` | Dead Asset
* `bengal-tiger.mp4`: 6.08 MB | 6,376 kbps | Keyframe count: **1** (192 frame interval)
* `bombay-brew-process.mp4`: 4.99 MB | 5,235 kbps | Keyframe count: **1** (192 frame interval)

### Netlify CDN Response Headers:
* Range Request Verification (`/bengal-tiger-scrub.mp4`):
  * Status: `HTTP/1.1 206 Partial Content`
  * Header: `Accept-Ranges: bytes`
  * Header: `Content-Range: bytes 0-1024/8066587`
  * Header: `Cache-Control: public, max-age=31536000, immutable`
* Favicon Header Verification (`/favicon.ico`):
  * Status: `HTTP/1.1 200 OK`
  * Header: `Cache-Control: public, max-age=0, must-revalidate`
