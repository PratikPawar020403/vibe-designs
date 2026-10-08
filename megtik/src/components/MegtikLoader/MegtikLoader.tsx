import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './MegtikLoader.css';

interface MegtikLoaderProps {
  isReady: boolean;
  progressPercentage?: number;
  onComplete?: () => void;
}

const WAVE = 'M-100 0q25-6 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0';
const BOT = 198;
const TOP = 96;
const IN_PATH = 'M56 86H164V170Q164 199 135 199H85Q56 199 56 170Z';
const BODY_PATH = 'M50 80H170V170Q170 205 135 205H85Q50 205 50 170Z';

const lines: [number, string][] = [
  [0, 'Warming the cup…'],
  [28, 'Pouring slowly…'],
  [65, 'Nearly there…'],
  [96, 'Take your time.'],
];

const getLine = (p: number) => {
  const match = lines.filter((l) => p >= l[0]).pop();
  return match ? match[1] : lines[0][1];
};

const renderFace = (c: string) => (
  <g>
    <g className="calm eyes">
      <circle cx="97" cy="136" r="4.5" fill={c} />
      <circle cx="123" cy="136" r="4.5" fill={c} />
    </g>
    <g className="happy">
      <path
        d="M91 139Q97 130 103 139M117 139Q123 130 129 139"
        fill="none"
        stroke={c}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </g>
    <circle cx="84" cy="148" r="6" fill="#e69a48" opacity="0.55" />
    <circle cx="136" cy="148" r="6" fill="#e69a48" opacity="0.55" />
    <path
      className="calm"
      d="M102 148Q110 155 118 148"
      fill="none"
      stroke={c}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      className="happy"
      d="M100 146Q110 163 120 146Z"
      fill={c}
      stroke={c}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </g>
);

const WaveSVG = () => (
  <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
    <path d="M0 80V40Q180 0 360 40T720 40T1080 40T1440 40V80Z" fill="#2b1d16" />
    <path
      d="M0 40Q180 0 360 40T720 40T1080 40T1440 40"
      fill="none"
      stroke="#d9a066"
      strokeWidth="4"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export const MegtikLoader: React.FC<MegtikLoaderProps> = ({
  isReady,
  progressPercentage = 0,
  onComplete,
}) => {
  const [hasExited, setHasExited] = useState<boolean>(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const mugRef = useRef<SVGSVGElement>(null);
  const lvlRef = useRef<SVGGElement>(null);
  const cfrRef = useRef<SVGRectElement>(null);
  const streamRef = useRef<SVGRectElement>(null);
  const steamRef = useRef<SVGGElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  const exitingRef = useRef<boolean>(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const rafRef = useRef<number | null>(null);

  const isReadyRef = useRef<boolean>(isReady);
  isReadyRef.current = isReady;

  const progressRef = useRef<number>(progressPercentage);
  progressRef.current = progressPercentage;

  useEffect(() => {
    // Lock scrolling during preloader
    document.documentElement.style.overflow = 'hidden';

    const SEEN = 'megtik-mug-seen';
    const hasSeen = sessionStorage.getItem(SEEN) !== null;
    const MIN = hasSeen ? 750 : 1350; // Minimum time to enjoy coffee ritual
    const MAX = 4000; // Safety ceiling
    const t0 = performance.now();
    let shown = 0;

    const end = () => {
      sessionStorage.setItem(SEEN, '1');
      document.documentElement.style.overflow = '';
      setHasExited(true);
      if (onComplete) onComplete();
    };

    const exit = () => {
      if (streamRef.current) streamRef.current.setAttribute('height', '0');
      if (capRef.current) capRef.current.textContent = 'Take your time.';
      if (steamRef.current) steamRef.current.classList.add('on');
      if (mugRef.current) mugRef.current.classList.add('joy');

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        if (rootRef.current) {
          gsap.to(rootRef.current, {
            opacity: 0,
            duration: 0.5,
            delay: 0.3,
            onComplete: end,
          });
        }
        return;
      }

      const vh = window.innerHeight;
      const total = 80 + vh * 1.6 + 80;
      if (bandRef.current) {
        gsap.set(bandRef.current, { y: 0 });
      }

      const tl = gsap.timeline({ onComplete: end });
      tlRef.current = tl;

      if (mugRef.current) {
        tl.to(mugRef.current, { scaleY: 0.9, scaleX: 1.07, duration: 0.14, ease: 'power2.out' })
          .to(mugRef.current, { y: -26, scaleY: 1.08, scaleX: 0.95, duration: 0.26, ease: 'power2.out' })
          .to(mugRef.current, { y: 0, scaleY: 0.92, scaleX: 1.06, duration: 0.22, ease: 'power2.in' })
          .to(mugRef.current, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      }

      if (bandRef.current) {
        tl.to(bandRef.current, { y: -(total + vh), duration: 1.5, ease: 'power2.inOut' }, '-=0.3');
      }

      if (sceneRef.current) {
        tl.set(sceneRef.current, { opacity: 0 }, '>-0.75');
      }
    };

    const tick = (now: number) => {
      const el = now - t0;
      // Real progress accounts for frame preloader progress and readiness
      const realDur = 3500;
      const realTarget = isReadyRef.current
        ? 100
        : Math.max(progressRef.current, Math.min(100, (el / realDur) * 100));

      const timeTarget = Math.min(100, (el / MIN) * 100);
      const target = el >= MAX ? 100 : Math.min(realTarget, timeTarget);

      shown += (target - shown) * 0.1;
      if (target - shown < 0.15 && (target >= 100 || (isReadyRef.current && el >= MIN))) {
        shown = target;
      }

      const y = BOT - (BOT - TOP) * (shown / 100);

      if (lvlRef.current) {
        lvlRef.current.setAttribute('transform', `translate(0 ${y})`);
      }
      if (cfrRef.current) {
        cfrRef.current.setAttribute('y', String(y));
      }
      if (streamRef.current) {
        if (shown < 99) {
          streamRef.current.setAttribute('y', '-90');
          streamRef.current.setAttribute('height', String(y + 90));
        } else {
          streamRef.current.setAttribute('height', '0');
        }
      }
      if (steamRef.current && shown > 22) {
        steamRef.current.classList.add('on');
      }
      if (pctRef.current) {
        pctRef.current.textContent = String(Math.round(shown));
      }
      if (capRef.current && !exitingRef.current) {
        capRef.current.textContent = getLine(shown);
      }

      if (!exitingRef.current && shown >= 100) {
        exitingRef.current = true;
        exit();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (tlRef.current) tlRef.current.kill();
      document.documentElement.style.overflow = '';
    };
  }, [onComplete]);

  if (hasExited) return null;

  return (
    <div className="mkl" ref={rootRef} role="status" aria-live="polite">
      <span
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
        }}
      >
        Loading Megtik
      </span>

      <div className="scene" ref={sceneRef}>
        <div className="brand" aria-hidden="true">
          MEGTIK
        </div>

        <svg
          className="mug"
          ref={mugRef}
          viewBox="0 -100 240 340"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="vg" gradientUnits="userSpaceOnUse" x1="0" y1="64" x2="0" y2="-40">
              <stop offset="0" stopColor="#6b5546" stopOpacity="0" />
              <stop offset="0.22" stopColor="#6b5546" stopOpacity="0.8" />
              <stop offset="0.65" stopColor="#6b5546" stopOpacity="0.5" />
              <stop offset="1" stopColor="#6b5546" stopOpacity="0" />
            </linearGradient>

            <filter id="vb" x="-20%" y="-10%" width="140%" height="120%">
              <feGaussianBlur stdDeviation="0.7" />
            </filter>

            <clipPath id="in">
              <path d={IN_PATH} />
            </clipPath>

            <clipPath id="cf">
              <rect id="cfr" ref={cfrRef} x="50" y="198" width="120" height="120" />
            </clipPath>

            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5a341f" stopOpacity="0" />
              <stop offset="0.25" stopColor="#5a341f" />
            </linearGradient>
          </defs>

          {/* Saucer */}
          <ellipse
            cx="110"
            cy="214"
            rx="90"
            ry="10"
            fill="rgba(255,255,255,0.35)"
            stroke="#3a281c"
            strokeWidth="4"
          />

          {/* Mug Handle */}
          <path
            d="M170 104H190Q216 104 216 136Q216 168 190 168H168"
            fill="none"
            stroke="#3a281c"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M170 116H188Q203 116 203 136Q203 156 188 156H168"
            fill="none"
            stroke="#3a281c"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Mug Body Translucent Fill */}
          <path d={BODY_PATH} fill="rgba(255,255,255,0.3)" />

          {/* Liquid Rising Wave */}
          <g clipPath="url(#in)">
            <g id="lvl" ref={lvlRef} transform="translate(0 198)">
              <g className="wv">
                <path d={`${WAVE}V200H-100Z`} fill="#5a341f" />
                <path
                  d={WAVE}
                  fill="none"
                  stroke="#d9a066"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>

          {/* Dark Face Layer */}
          <g clipPath="url(#in)">{renderFace('#3a281c')}</g>

          {/* Light Face Layer (revealed when submerged in coffee) */}
          <g clipPath="url(#in)">
            <g clipPath="url(#cf)">{renderFace('#f5efe6')}</g>
          </g>

          {/* Pouring Stream from above */}
          <rect
            id="stream"
            ref={streamRef}
            className="stream"
            x="107"
            y="-90"
            width="6"
            height="0"
            rx="3"
            fill="url(#sg)"
          />

          {/* Outer Rim & Contour */}
          <path
            d={BODY_PATH}
            fill="none"
            stroke="#3a281c"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M62 100V160"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.75"
          />
          <rect x="42" y="72" width="136" height="12" rx="6" fill="#3a281c" />
          <path
            d="M52 76H168"
            stroke="#d9a066"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Steam Wisps */}
          <g className="steam" id="steam" ref={steamRef} filter="url(#vb)">
            <path
              d="M61.0 64.0C61.2 62.5 62.1 58.1 62.2 55.1C62.3 52.2 62.0 49.2 61.4 46.3C60.9 43.3 59.6 40.4 58.7 37.4C57.9 34.5 56.7 31.5 56.4 28.6C56.2 25.6 56.5 22.7 57.2 19.7C58.0 16.8 59.8 13.8 61.1 10.9C62.3 7.9 64.1 3.5 64.7 2.0"
              pathLength="100"
              style={{ animationDelay: '0.3s', animationDuration: '4.6s' }}
            />
            <path
              d="M78.0 64.0C78.4 61.6 80.0 54.5 80.6 49.7C81.2 45.0 81.7 40.2 81.4 35.4C81.1 30.7 80.0 25.9 78.8 21.1C77.6 16.4 75.4 11.6 74.3 6.9C73.3 2.1 72.2 -2.7 72.4 -7.4C72.7 -12.2 74.2 -17.0 75.8 -21.7C77.4 -26.5 81.1 -33.6 82.1 -36.0"
              pathLength="100"
              style={{ animationDelay: '0s', animationDuration: '5.4s' }}
            />
            <path
              d="M92.8 64.0C93.1 62.4 93.9 57.7 94.5 54.6C95.2 51.4 96.2 48.3 96.5 45.1C96.9 42.0 97.0 38.9 96.5 35.7C96.0 32.6 94.8 29.4 93.8 26.3C92.8 23.1 91.1 20.0 90.5 16.9C89.8 13.7 89.5 10.6 90.0 7.4C90.5 4.3 92.9 -0.4 93.4 -2.0"
              pathLength="100"
              style={{ animationDelay: '1.8s', animationDuration: '4.8s' }}
            />
            <path
              d="M127.3 64.0C127.4 62.4 128.2 57.7 128.2 54.6C128.1 51.4 127.6 48.3 127.0 45.1C126.3 42.0 124.9 38.9 124.2 35.7C123.4 32.6 122.4 29.4 122.4 26.3C122.3 23.1 123.0 20.0 123.9 16.9C124.8 13.7 126.8 10.6 127.9 7.4C129.1 4.3 130.4 -0.4 130.9 -2.0"
              pathLength="100"
              style={{ animationDelay: '1.1s', animationDuration: '5.0s' }}
            />
            <path
              d="M141.9 64.0C142.3 61.6 143.9 54.5 144.5 49.7C145.1 45.0 145.8 40.2 145.5 35.4C145.2 30.7 144.1 25.9 143.0 21.1C141.8 16.4 139.6 11.6 138.5 6.9C137.4 2.1 136.2 -2.7 136.4 -7.4C136.6 -12.2 137.9 -17.0 139.5 -21.7C141.1 -26.5 144.8 -33.6 145.9 -36.0"
              pathLength="100"
              style={{ animationDelay: '2.4s', animationDuration: '5.6s' }}
            />
            <path
              d="M158.4 64.0C158.6 62.5 159.1 58.1 159.7 55.1C160.3 52.2 161.4 49.2 162.0 46.3C162.5 43.3 163.2 40.4 163.0 37.4C162.9 34.5 162.1 31.5 161.2 28.6C160.3 25.6 158.5 22.7 157.5 19.7C156.6 16.8 155.5 13.8 155.5 10.9C155.5 7.9 157.2 3.5 157.5 2.0"
              pathLength="100"
              style={{ animationDelay: '3.0s', animationDuration: '4.7s' }}
            />
          </g>
        </svg>

        {/* Dynamic hand-lettered caption */}
        <div className="cap" ref={capRef} aria-hidden="true">
          Warming the cup…
        </div>

        {/* Tabular numeric percentage counter */}
        <div className="pct" ref={pctRef} aria-hidden="true">
          0
        </div>
      </div>

      {/* Sweeping espresso wave band exit curtain */}
      <div className="band" ref={bandRef}>
        <WaveSVG />
        <div className="body" />
        <div className="flip">
          <WaveSVG />
        </div>
      </div>
    </div>
  );
};

export default MegtikLoader;
