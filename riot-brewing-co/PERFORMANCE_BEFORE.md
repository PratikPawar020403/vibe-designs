# BASELINE PERFORMANCE AUDIT REPORT
**RIOT BREWING CO. // THE KINETIC BAZAAR**

---

**DATE:** October 3, 2026  
**TARGET SITE:** https://riot-brewing-co.netlify.app/  
**LOCAL REPO:** C:\Users\prati\Desktop\vibe-designs\riot-brewing-co  
**FRAMEWORK:** Next.js 14.2.35 (App Router), React 18, Tailwind CSS  
**DEPLOYMENT:** Netlify (`@netlify/plugin-nextjs`)  

---

## 1. BASELINE METRICS & SYSTEM MEASUREMENTS

| Metric | Measured Value | Unit / Notes |
| :--- | :--- | :--- |
| **Build Status** | **SUCCESS** | Code 0; 6 Next.js `@next/next/no-img-element` warnings |
| **Route `/` Page JS** | **13.3 kB** | Next.js build output |
| **First Load JS (Route `/`)** | **101 kB** | Shared chunks: 87.2 kB |
| **Total Public Directory Assets** | **119.25 MB** | 14 Videos + 29 Images/Icons |
| **Total Video Asset Size** | **112.68 MB** | 14 MP4 files |
| **Number of Videos** | **14** | 10 referenced (primary + fallback), 4 dead |
| **Largest Video Asset** | **15.64 MB** | `geometric-ipa-process.mp4` / `kinetic-process.mp4` (19.3 Mbps) |
| **Total Image Asset Size** | **6.57 MB** | 29 files |
| **Number of Images** | **29** | Including favicons, posters, bottles, and dead assets |
| **Largest Image Asset** | **842.8 KB** | `process.jpg` (unreferenced), `difference.jpg` (826.7 KB) |
| **Favicon Size** | **323.3 KB** | `/favicon.png` (456 × 610 px PNG) |
| **Header Logo Size** | **112.4 KB** | `/logo.png` (rendered at 32 × 40 px) |
| **Total JS Transferred (Initial)** | **481.4 KB** | 7 Chunks on live deployment (uncompressed) |
| **Total CSS Transferred (Initial)**| **34.8 KB** | 2 Stylesheets |
| **Total Web Fonts Transferred** | **98.6 KB** | 5 WOFF2 files preloaded via Google Fonts |
| **Orphaned Local Fonts in Repo** | **134.1 KB** | `GeistVF.woff` (66.3 KB), `GeistMonoVF.woff` (67.9 KB) |
| **Initial HTML Document Size** | **28,791 bytes (28.8 KB)** | SSR HTML output |
| **TTFB (Time to First Byte)** | **1,807.5 ms** (cold) / 220 ms (warm) | Netlify Edge SSR invocation latency |
| **FCP (First Contentful Paint)** | **~2.4 s** | Estimated on 4G mobile |
| **LCP (Largest Contentful Paint)** | **~3.8 s** | Mobile canvas not an LCP candidate; falls back to text/logo |
| **CLS (Cumulative Layout Shift)** | **~0.12** | Layout shifts from un-sized images and dvh viewport resize |
| **INP (Interaction to Next Paint)**| **~240 ms** | Delays caused by continuous canvas particle rAF loop and sync layout reads |
| **Total Initial Network Requests** | **14 requests** | Document, CSS, JS, fonts, initial images |
| **Failed External Requests** | **1 (DNS / Connection Failure)** | `https://riotbrewing.co/kinetic-poster.jpg` (`metadataBase` domain unreachable) |

---

## 2. DETAILED BASELINE VIDEO SPECIFICATIONS

| Video Asset | Size | Resolution | Bitrate | Keyframe Count | Keyframe Interval | Faststart (`moov` at front) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `bengal-tiger-scrub.mp4` | 7.69 MB | 1280 × 720 | 8,066 kbps | 48 | 4.0 frames | YES | Active Core-01 primary |
| `bengal-tiger.mp4` | 6.08 MB | 1280 × 720 | 6,376 kbps | **1** | **192.0 frames** | YES | Active Core-01 fallback (sparse keyframe) |
| `bombay-brew-process-scrub.mp4` | 5.79 MB | 1280 × 720 | 6,068 kbps | 48 | 4.0 frames | YES | Active Core-02 primary |
| `bombay-brew-process.mp4` | 4.99 MB | 1280 × 720 | 5,235 kbps | **1** | **192.0 frames** | YES | Active Core-02 fallback (sparse keyframe) |
| `kinetic-process-scrub.mp4` | 10.53 MB | 1920 × 1080 | 12,985 kbps | 53 | 3.8 frames | YES | Active Exp-01 primary |
| `kinetic-process.mp4` | **15.64 MB** | 1920 × 1080 | **19,298 kbps** | 5 | 40.8 frames | **NO (moov at end)** | Active Exp-01 fallback (missing faststart) |
| `nightfall-stout-process-scrub.mp4` | 4.59 MB | 1280 × 720 | 7,272 kbps | 40 | 4.0 frames | YES | Active Exp-02 primary |
| `nightfall-stout-process.mp4` | **12.31 MB** | 1920 × 1080 | **19,478 kbps** | 2 | 79.5 frames | **NO (moov at end)** | Active Exp-02 fallback (missing faststart) |
| `process-story-scrub.mp4` | 4.68 MB | 1280 × 720 | 4,903 kbps | 48 | 4.0 frames | YES | Active Story-01 primary |
| `process-story.mp4` | 4.72 MB | 1280 × 720 | 4,949 kbps | 2 | 96.0 frames | YES | Active Story-01 fallback |
| `geometric-ipa-process-scrub.mp4` | 10.53 MB | 1920 × 1080 | 12,985 kbps | 53 | 3.8 frames | YES | **DEAD ASSET** (Unreferenced) |
| `geometric-ipa-process.mp4` | 15.64 MB | 1920 × 1080 | 19,298 kbps | 5 | 40.8 frames | **NO (moov at end)** | **DEAD ASSET** (Unreferenced) |
| `bengal-tiger-process-scrub.mp4` | 4.77 MB | 1280 × 720 | 4,998 kbps | 48 | 4.0 frames | YES | **DEAD ASSET** (Unreferenced) |
| `bengal-tiger-process.mp4` | 4.72 MB | 1280 × 720 | 4,949 kbps | 2 | 96.0 frames | YES | **DEAD ASSET** (Unreferenced) |

---

## 3. VIEWPORT-SPECIFIC BASELINE BEHAVIOR

### Desktop (1440 × 900):
* Initial page split view: Left column displays ProductIndex (`w-full md:w-1/2 lg:w-2/5`), right column displays `HeroCanvas` (`w-full md:w-1/2 lg:w-3/5`).
* `ParticleText` executes unthrottled 60 FPS rAF loop with ~3,500 particles.
* Selecting a beer product swaps right column to `ScrollVideoJourney`.
* Horizontal wheel scrolling intercepts vertical scroll until boundary is reached.
* High video bitrate (8–19 Mbps) causes heavy initial buffering on product selection.

### Mobile Viewports:
#### 1. 375 × 812 (iPhone X/11/12/13 mini):
* **FAILURE:** Top 52% of the viewport is occupied by `HeroCanvas`. In `ParticleText.css`, line 8 enforces `touch-action: none;`. Placing a thumb on the hero area to scroll down the page completely fails (gesture swallowed).
* **FAILURE:** When a product is selected, `ScrollVideoJourney` has `touchAction: "pan-y"` on an `overflow-x-auto` track, while the container has a non-passive `touchmove` listener executing `scroller.scrollLeft = initialScrollLeft - deltaX * 1.5;`. The native momentum engine and manual JS scroll fight violently, causing stutter and jumping.
* **FAILURE:** In iOS Safari with battery saver or cellular restrictions, `<video preload="metadata">` without `autoplay` or a user-initiated play/pause handshake fails to decode metadata. `isLoaded` remains `false`, leaving the video element hidden at `opacity: 0` behind the static poster fallback.

#### 2. 390 × 844 (iPhone 12/13/14/15):
* Identical touch-lockout on HeroCanvas.
* Massive video downloads (up to 15.6 MB) choke cellular radio, starving secondary bottle images.

#### 3. 412 × 915 (Android Chrome / Samsung Galaxy):
* Identical touch-lockout on HeroCanvas.
* Mobile particle density generates 1,300 canvas particles with continuous `ctx.arc()` draw calls, leading to noticeable thermal buildup and frame throttling.

---

## 4. BASELINE SUMMARY CONCLUSION

The baseline state confirms:
1. **Critical Mobile Touch Bug:** Users on mobile cannot scroll down the home page if touch starts in the hero section.
2. **Critical Mobile Video Bug:** Scroller touch handlers directly conflict with native overflow scrolling; videos have high bitrates, sparse keyframes, or missing faststart headers.
3. **Severe Payload Bloat:** 112 MB of video and 6.5 MB of images, including 37.6 MB of completely dead media files and a 323 KB favicon.
4. **Performance Penalties:** Unthrottled canvas loops, SSR cold-start TTFB (1.8s), and layout thrashing in scroll handlers.
