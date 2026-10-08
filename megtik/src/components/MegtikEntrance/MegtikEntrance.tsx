import React, { useEffect, useRef, useState } from 'react';
import { FrameCanvasRenderer } from './frameSequence';
import { FramePreloader } from './preload';
import { useScrollSequence } from './useScrollSequence';
import './styles.css';

interface MegtikEntranceProps {
  totalFrames?: number;
  framePattern?: string;
  pinnedDistanceVh?: number;
  onSequenceComplete?: () => void;
  onPreloadProgress?: (percentage: number) => void;
  onInitialReady?: () => void;
}

export const MegtikEntrance: React.FC<MegtikEntranceProps> = ({
  totalFrames = 183,
  framePattern = '/frames/frame_%03d.webp',
  pinnedDistanceVh = 400,
  onSequenceComplete,
  onPreloadProgress,
  onInitialReady,
  }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const introUiRef = useRef<HTMLDivElement>(null);
  const interiorTextRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const preloaderRef = useRef<FramePreloader | null>(null);
  const rendererRef = useRef<FrameCanvasRenderer | null>(null);

  const [isInitialReady, setIsInitialReady] = useState<boolean>(false);

  // Initialize Preloader & Canvas Renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new FrameCanvasRenderer(canvasRef.current);
    rendererRef.current = renderer;
    renderer.resize();

    const preloader = new FramePreloader(
      totalFrames,
      framePattern,
      (progress) => {
        if (onPreloadProgress) {
          onPreloadProgress(progress.percentage);
        }
        if (progress.isInitialReady && !isInitialReady) {
          setIsInitialReady(true);
          if (onInitialReady) onInitialReady();
        }
      },
      () => {
        setIsInitialReady(true);
        if (onInitialReady) onInitialReady();
      }
    );
    preloaderRef.current = preloader;
    preloader.start();

    let resizeRaf: number | null = null;
    const handleResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (rendererRef.current) {
          rendererRef.current.resize();
        }
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      preloader.cancel();
      renderer.clear();
      preloaderRef.current = null;
      rendererRef.current = null;
    };
  }, [totalFrames, framePattern]);

  // Hook handles ScrollTrigger scrubbing and typography choreographies
  const { isReducedMotion } = useScrollSequence({
    sectionRef,
    viewportRef,
    canvasRef,
    introUiRef,
    interiorTextRef,
    progressBarRef,
    preloaderRef,
    rendererRef,
    totalFrames,
    isInitialReady,
    onSequenceComplete,
  });

  const effectiveReducedMotion = isReducedMotion;

  return (
    <section
      ref={sectionRef}
      className={`megtik-entrance-container ${effectiveReducedMotion ? 'reduced-motion' : ''}`}
      style={{
        height: effectiveReducedMotion ? '100vh' : `${pinnedDistanceVh}vh`,
      }}
      aria-label="MEGTIK Architectural Entrance"
    >
      {/* Pinned 100vh Viewport */}
      <div ref={viewportRef} className="megtik-entrance-viewport">
        {/* HTML5 Canvas Layer for 192-frame Sub-frame Interpolated Sequence */}
        <div className="megtik-canvas-layer">
          <canvas ref={canvasRef} className="megtik-canvas" />
        </div>

        {/* Ambient Radial Vignette */}
        <div className="megtik-vignette-overlay" />

        {/* =========================================================
            RESTRAINED EDITORIAL INTRO UI (0–15%)
            - Top-Left: Small brand title + Architectural subtitle
            - Top-Right: Section label
            - Bottom: Scroll indicator
            - Center: COMPLETELY CLEAR for physical architecture
            ========================================================= */}
        <div ref={introUiRef} className="intro-ui-layer">
          <footer className="intro-bottom-bar">
            <div className="intro-scroll-hint">
              <span>SCROLL TO ENTER</span>
              <span className="hint-arrow" aria-hidden="true">↓</span>
            </div>
          </footer>
        </div>

        {/* =========================================================
            FINAL INTERIOR WELCOME GREETING (88%–100%)
            Fades in gently at final camera position
            ========================================================= */}
        <div ref={interiorTextRef} className="interior-reveal-layer" aria-hidden="true">
          <h2 className="interior-title">WELCOME TO MEGTIK</h2>
          <p className="interior-subtitle">Coffee, crafted with intention.</p>
          <div className="interior-badge">STEP INSIDE</div>
        </div>

        {/* Minimal Architectural Progress Bar */}
        <div className="megtik-progress-rail" aria-hidden="true">
          <div ref={progressBarRef} className="megtik-progress-fill" />
        </div>

      </div>
    </section>
  );
};
