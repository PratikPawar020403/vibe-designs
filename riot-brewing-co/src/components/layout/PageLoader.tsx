'use client';

import { useEffect, useRef, useState } from 'react';

export const LOADER_WORDS = ['cold', 'loud', 'citrus', 'hoppy', 'alive'] as const;

export const LOADER_COLORS = {
  paperWhite: '#FFFFFF',
  inkBlack: '#0A0A0A',
  raniPink: '#FF007F',
  electricBlue: '#0022FF',
  goldLight: '#FFD25A',
  goldMid: '#FFB000',
  goldDark: '#D77A00',
  foam: '#FFF6DC',
  bubbleFill: 'rgba(255,246,220,.9)',
} as const;

const POUR = 3200;
const HOLD = 300;
const DISS = 900;
const SESSION_STORAGE_KEY = 'riot-brewing-loader-shown';

// Tracks whether the loader has already played in the current document lifecycle.
// Resets automatically when the browser refreshes the page.
let hasPlayedInCurrentPageLoad = false;

const GRAIN_SVG_DATA_URI = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>")`;

interface Bubble {
  x: number;
  y: number;
  r: number;
  v: number;
  p: number;
}

export interface PageLoaderProps {
  isHeroReady?: boolean;
  onDissolveStart?: () => void;
  onComplete?: () => void;
}

function getDisplayFontFamily(probeEl?: HTMLElement | null): string {
  const bodyStyle = window.getComputedStyle(document.body);
  const rootStyle = window.getComputedStyle(document.documentElement);
  const clashVar = (
    bodyStyle.getPropertyValue('--font-clash') ||
    rootStyle.getPropertyValue('--font-clash')
  ).trim();

  if (clashVar) {
    return `${clashVar}, "Clash Display", "Space Grotesk", sans-serif`;
  }

  if (probeEl) {
    const computed = window.getComputedStyle(probeEl).fontFamily;
    if (computed && !computed.includes('var(')) {
      return computed;
    }
  }

  return '"Clash Display", "Space Grotesk", sans-serif';
}

export function PageLoader({
  isHeroReady = true,
  onDissolveStart,
  onComplete,
}: PageLoaderProps) {
  const [unmounted, setUnmounted] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLElement | null>(null);
  const percentRef = useRef<HTMLElement | null>(null);

  const heroReadyRef = useRef(isHeroReady);
  const onDissolveStartRef = useRef(onDissolveStart);
  const onCompleteRef = useRef(onComplete);
  // Preserved across React 18 Strict Mode simulated double-effect runs on initial mount
  const sessionAlreadySeenRef = useRef<boolean | null>(null);

  useEffect(() => {
    heroReadyRef.current = isHeroReady;
  }, [isHeroReady]);

  useEffect(() => {
    onDissolveStartRef.current = onDissolveStart;
  }, [onDissolveStart]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const ld = loaderRef.current;
    const cv = canvasRef.current;
    const lbl = labelRef.current;
    const wd = wordRef.current;
    const pc = percentRef.current;
    if (!ld || !cv || !lbl || !wd || !pc) return;

    // 1. Check reduced motion preference
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Check session state inside useEffect (avoids hydration mismatch, runs on browser refresh)
    if (sessionAlreadySeenRef.current === null) {
      let seen = hasPlayedInCurrentPageLoad;
      try {
        if (!seen) {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
        } else {
          seen = window.sessionStorage.getItem(SESSION_STORAGE_KEY) === '1';
        }
      } catch {
        // Ignore storage errors in restricted browsing modes
      }
      hasPlayedInCurrentPageLoad = true;
      sessionAlreadySeenRef.current = seen;
    }

    if (prefersReducedMotion || sessionAlreadySeenRef.current) {
      ld.classList.add('gone');
      document.documentElement.dataset.loaderState = 'done';
      onDissolveStartRef.current?.();
      onCompleteRef.current?.();
      setUnmounted(true);
      return;
    }

    const x = cv.getContext('2d');
    if (!x) {
      onDissolveStartRef.current?.();
      onCompleteRef.current?.();
      setUnmounted(true);
      return;
    }

    // Lock page scroll while loader is active
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.dataset.loaderState = 'pouring';

    let scrollUnlocked = false;
    const unlockScroll = () => {
      if (scrollUnlocked) return;
      scrollUnlocked = true;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };

    let W = 0;
    let H = 0;
    let D = 1;
    let bub: Bubble[] = [];
    let t0: number | null = null;
    let raf = 0;
    let cancelled = false;
    let finished = false;
    let dissolveStarted = false;
    let fontsReady = !(document.fonts && document.fonts.ready);
    let readySinceMs: number | null = null;
    let hiddenAt: number | null = null;
    let displayFont = getDisplayFontFamily(wd);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        fontsReady = true;
        displayFont = getDisplayFontFamily(wd);
      });
    }

    function size() {
      if (!cv || !ld) return;
      const prevD = D;
      D = Math.min(window.devicePixelRatio || 1, 2);
      const rect = ld.getBoundingClientRect();
      const cssW = rect.width || window.innerWidth;
      const cssH = rect.height || window.innerHeight;
      W = cv.width = Math.max(1, Math.round(cssW * D));
      H = cv.height = Math.max(1, Math.round(cssH * D));
      if (bub.length > 0 && prevD !== D) {
        const ratio = D / prevD;
        for (let i = 0; i < bub.length; i++) {
          bub[i].r *= ratio;
        }
      }
    }

    function seed() {
      bub = [];
      for (let i = 0; i < 80; i++) {
        bub.push({
          x: Math.random(),
          y: Math.random(),
          r: (3 + Math.random() * 13) * D,
          v: 0.04 + Math.random() * 0.09,
          p: Math.random() * 6,
        });
      }
    }

    function ease(t: number) {
      return 0.5 - Math.cos(Math.PI * t) / 2;
    }

    function wave(base: number, amp: number, ph: number) {
      if (!x) return;
      const k = 0.006 / D;
      x.beginPath();
      x.moveTo(0, H + 10);
      for (let i = 0; i <= W; i += 10) {
        x.lineTo(
          i,
          base +
            Math.sin(i * k + ph) * amp +
            Math.sin(i * k * 2.3 - ph * 1.4) * amp * 0.4
        );
      }
      x.lineTo(W, H + 10);
      x.closePath();
    }

    function draw(ms: number, q: number, diss: number) {
      if (!x) return;
      x.globalCompositeOperation = 'source-over';
      x.fillStyle = LOADER_COLORS.paperWhite;
      x.fillRect(0, 0, W, H);

      const amp0 = (10 + 26 * Math.sin(Math.PI * Math.min(q, 1))) * D;
      const s0 = ms / 1000;
      const yP0 = H * (1 - q) - amp0 * 2 * q;
      const yA0 = yP0 - (40 + 50 * Math.min(q * 3, 1)) * D;

      x.fillStyle = (function () {
        const g = x.createLinearGradient(0, yA0 - amp0, 0, yP0 + amp0);
        g.addColorStop(0, LOADER_COLORS.goldLight);
        g.addColorStop(0.55, LOADER_COLORS.goldMid);
        g.addColorStop(1, LOADER_COLORS.goldDark);
        return g;
      })();
      wave(yA0, amp0 * 0.8, s0 * 1.6 + 0.4);
      x.fill();

      x.fillStyle = LOADER_COLORS.paperWhite;
      wave(yP0, amp0, s0 * 1.6);
      x.fill();

      const fs = Math.min(W * 0.36, H * 0.5);
      x.fillStyle = LOADER_COLORS.inkBlack;
      x.font = '700 ' + fs + 'px ' + displayFont;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('RIOT', W / 2, H * 0.46);

      const amp = (10 + 26 * Math.sin(Math.PI * Math.min(q, 1))) * D;
      const s = ms / 1000;
      const yP = H * (1 - q) - amp * 2 * q;
      const yB = H * (1 - Math.max(0, q * 1.12 - 0.12)) - amp * 2 * q + 14 * D;

      x.globalCompositeOperation = 'multiply';
      x.fillStyle = LOADER_COLORS.raniPink;
      wave(yP, amp, s * 1.6);
      x.fill();

      x.fillStyle = LOADER_COLORS.electricBlue;
      wave(yB + 10 * D, amp * 0.8, -s * 1.2 + 2);
      x.fill();

      x.globalCompositeOperation = 'source-over';
      const k0 = 0.006 / D;
      const fa = amp0 * 0.8;
      const fp = s0 * 1.6 + 0.4;
      const fm = Math.min(q * 5, 1);
      const n2 = Math.ceil(W / (24 * D));

      function dc(a: number, b2: number, r: number, p: number) {
        if (!x) return;
        x.beginPath();
        x.arc(a, b2, r, 0, 7);
        if (p) {
          x.fillStyle = LOADER_COLORS.foam;
          x.fill();
        } else {
          x.lineWidth = 5 * D;
          x.strokeStyle = LOADER_COLORS.inkBlack;
          x.stroke();
        }
      }

      for (let p = 0; p < 2; p++) {
        for (let j = 0; j <= n2; j++) {
          const fx = j * 24 * D;
          const fy =
            yA0 +
            Math.sin(fx * k0 + fp) * fa +
            Math.sin(fx * k0 * 2.3 - fp * 1.4) * fa * 0.4;
          const fr =
            (15 + 9 * Math.abs(Math.sin(j * 1.7))) *
            D *
            fm *
            (1 + 0.06 * Math.sin(s0 * 3 + j));
          dc(fx, fy - fr * 0.35, fr, p);
          dc(fx + 12 * D, fy - fr * 1.15, fr * 0.65, p);
        }
      }

      for (let i = 0; i < bub.length; i++) {
        const b = bub[i];
        b.y -= b.v * 0.016 * (ms > 0 ? 1 : 0);
        if (b.y < -0.05) b.y = 1.05;
        const px = (b.x + Math.sin(s * 1.5 + b.p) * 0.012) * W;
        const py = b.y * H;
        if (py > yA0 + b.r * 0.5 + amp * 0.2) {
          x.beginPath();
          x.arc(px, py, b.r, 0, 7);
          x.fillStyle = LOADER_COLORS.bubbleFill;
          x.fill();
          x.lineWidth = 1.5 * D;
          x.strokeStyle = LOADER_COLORS.inkBlack;
          x.stroke();
        }
      }

      if (diss > 0) {
        const g = 36 * D;
        const cols = Math.ceil(W / g) + 1;
        const rows = Math.ceil(H / g) + 1;
        x.fillStyle = LOADER_COLORS.paperWhite;
        for (let a = 0; a < cols; a++) {
          for (let c = 0; c < rows; c++) {
            const dl = (a / cols + (rows - c) / rows) * 0.5;
            const r = Math.max(0, Math.min(1, (diss - dl) / 0.5));
            if (r > 0) {
              x.beginPath();
              x.arc(a * g, c * g, r * g * 0.78, 0, 7);
              x.fill();
            }
          }
        }
      }
    }

    function frame(ts: number) {
      if (cancelled || finished || !ld || !lbl || !wd || !pc) return;
      if (document.hidden) return;

      if (t0 === null) t0 = ts;
      const ms = ts - t0;
      const q = ease(Math.min(ms / POUR, 1));
      const p = Math.round(q * 100);
      let diss = 0;

      const isReady =
        (fontsReady && heroReadyRef.current) || ms > POUR + HOLD + 1500;
      if (isReady && readySinceMs === null) {
        readySinceMs = ms;
      }

      const dissolveStartMs =
        readySinceMs !== null ? Math.max(POUR + HOLD, readySinceMs) : null;
      if (dissolveStartMs !== null && ms > dissolveStartMs) {
        diss = Math.min((ms - dissolveStartMs) / DISS, 1);
      }

      draw(ms, q, diss);
      pc.textContent = ('00' + p).slice(-3);
      wd.textContent = LOADER_WORDS[Math.min(4, Math.floor(q * 5))];

      if (diss > 0) {
        ld.classList.add('out');
        lbl.style.opacity = '0';
        if (!dissolveStarted) {
          dissolveStarted = true;
          document.documentElement.dataset.loaderState = 'dissolving';
          onDissolveStartRef.current?.();
          window.dispatchEvent(new CustomEvent('riot:loader-dissolve-start'));
        }
      }

      if (diss >= 1) {
        finished = true;
        ld.classList.add('gone');
        ld.style.pointerEvents = 'none';
        ld.style.display = 'none';
        document.documentElement.dataset.loaderState = 'done';
        unlockScroll();
        onCompleteRef.current?.();
        window.dispatchEvent(new CustomEvent('riot:loader-complete'));
        setUnmounted(true);
        return;
      }

      raf = window.requestAnimationFrame(frame);
    }

    function run() {
      if (cancelled || !ld || !lbl) return;
      window.cancelAnimationFrame(raf);
      ld.classList.remove('gone', 'out');
      lbl.style.opacity = '1';
      size();
      seed();
      t0 = null;
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        finished = true;
        ld.classList.add('gone');
        ld.style.pointerEvents = 'none';
        ld.style.display = 'none';
        document.documentElement.dataset.loaderState = 'done';
        unlockScroll();
        onDissolveStartRef.current?.();
        onCompleteRef.current?.();
        setUnmounted(true);
        return;
      }
      if (!document.hidden) {
        raf = window.requestAnimationFrame(frame);
      } else {
        hiddenAt = performance.now();
      }
    }

    const handleResize = () => {
      if (!finished && ld && !ld.classList.contains('gone')) {
        size();
      }
    };

    const handleVisibilityChange = () => {
      if (finished || cancelled) return;
      if (document.hidden) {
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
        if (hiddenAt === null) {
          hiddenAt = performance.now();
        }
      } else {
        if (hiddenAt !== null) {
          const pausedDuration = performance.now() - hiddenAt;
          if (t0 !== null) {
            t0 += pausedDuration;
          }
          hiddenAt = null;
        }
        if (!raf) {
          raf = window.requestAnimationFrame(frame);
        }
      }
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(handleResize)
        : null;
    resizeObserver?.observe(ld);

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Ensure the display font is loaded before first draw
    const fontLoadPromise =
      document.fonts && document.fonts.load
        ? Promise.race([
            document.fonts.load(`700 100px ${displayFont}`).then(() => {
              displayFont = getDisplayFontFamily(wd);
            }),
            new Promise<void>((resolve) => setTimeout(resolve, 800)),
          ])
        : Promise.resolve();

    fontLoadPromise.then(() => {
      if (!cancelled) {
        displayFont = getDisplayFontFamily(wd);
        run();
      }
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unlockScroll();
    };
  }, []);

  if (unmounted) {
    return null;
  }

  return (
    <div
      ref={loaderRef}
      role="status"
      aria-live="polite"
      aria-label="Loading Riot Brewing Co."
      className="fixed inset-0 z-[100] w-full h-[100dvh] bg-paper-white text-ink-black font-mono overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          mixBlendMode: 'multiply',
          opacity: 0.35,
          backgroundImage: GRAIN_SVG_DATA_URI,
        }}
      />
      <div
        ref={labelRef}
        className="absolute bg-paper-white border border-ink-black"
        style={{
          left: 'calc(16px + env(safe-area-inset-left, 0px))',
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          padding: '10px 14px',
          minWidth: '180px',
          maxWidth:
            'calc(100vw - 32px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))',
          borderRadius: '0px',
          boxShadow: 'none',
          transition: 'opacity 0.2s',
        }}
      >
        <b
          ref={wordRef}
          className="block font-display font-bold"
          style={{
            fontSize: 'clamp(1.5rem, 6vw, 2.2rem)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontFamily:
              'var(--font-clash), "Clash Display", "Space Grotesk", sans-serif',
          }}
        >
          {LOADER_WORDS[0]}
        </b>
        <span
          className="block font-mono font-medium uppercase"
          style={{
            marginTop: '6px',
            fontSize: '0.72rem',
            letterSpacing: '0.06em',
            fontFamily:
              'var(--font-ibm-plex-mono), "IBM Plex Mono", ui-monospace, monospace',
          }}
        >
          Riot Brewing Co.
          <br />
          Poured{' '}
          <i ref={percentRef} style={{ fontStyle: 'normal' }}>
            000
          </i>
          %
        </span>
      </div>
    </div>
  );
}

export default PageLoader;
