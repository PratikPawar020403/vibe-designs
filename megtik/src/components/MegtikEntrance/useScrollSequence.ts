import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FrameCanvasRenderer } from './frameSequence';
import { FramePreloader } from './preload';

gsap.registerPlugin(ScrollTrigger);

interface UseScrollSequenceOptions {
  sectionRef: React.RefObject<HTMLElement>;
  viewportRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  introUiRef: React.RefObject<HTMLDivElement>;
  interiorTextRef: React.RefObject<HTMLDivElement>;
  progressBarRef: React.RefObject<HTMLDivElement>;
  preloaderRef: React.RefObject<FramePreloader | null>;
  rendererRef: React.RefObject<FrameCanvasRenderer | null>;
  totalFrames: number;
  isInitialReady: boolean;
  onSequenceComplete?: () => void;
}

export function useScrollSequence({
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
}: UseScrollSequenceOptions) {
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const frameTrackerRef = useRef<{ frame: number }>({ frame: 1 });

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!isInitialReady || !sectionRef.current || !viewportRef.current || !canvasRef.current) {
      return;
    }

    if (isReducedMotion) {
      if (rendererRef.current && preloaderRef.current) {
        rendererRef.current.renderInterpolated(1, preloaderRef.current);
      }
      return;
    }

    const section = sectionRef.current;
    const introUi = introUiRef.current;
    const interiorText = interiorTextRef.current;
    const progressBar = progressBarRef.current;

    // Initial render of frame 1
    if (rendererRef.current && preloaderRef.current) {
      rendererRef.current.renderInterpolated(1, preloaderRef.current);
    }

    const ctx = gsap.context(() => {
      const frameObj = frameTrackerRef.current;
      frameObj.frame = 1;

      // Master scroll timeline with pinned viewport
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5, // Crisp, physical camera momentum without lag
          pin: viewportRef.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;

            // Directly render continuous sub-frame interpolated canvas
            if (rendererRef.current && preloaderRef.current) {
              rendererRef.current.renderInterpolated(frameObj.frame, preloaderRef.current);
            }

            // Minimal architectural progress bar
            if (progressBar) {
              progressBar.style.transform = `scaleX(${progress})`;
            }

            // Toggle aria-hidden on interior text without triggering React re-renders
            if (interiorText) {
              interiorText.setAttribute('aria-hidden', progress < 0.85 ? 'true' : 'false');
            }

            if (progress >= 0.98 && onSequenceComplete) {
              onSequenceComplete();
            }
          },
        },
      });

      // 1. Frame progression mapping across all 192 frames
      // 0–20%: Exterior establishing view
      // 20–40%: Gradual approach toward entrance
      // 40–55%: Entrance fills more of frame
      // 55–68%: Camera crosses architectural threshold
      // 68–85%: Interior architecture progressively revealed
      // 85–100%: Camera advances to final seating position
      tl.to(
        frameObj,
        {
          frame: totalFrames,
          ease: 'power1.inOut',
          duration: 1,
        },
        0
      );

      // 2. Introductory UI: Fades out smoothly within first 10–14% of scroll
      // Keeps the architecture and entrance completely unobstructed
      if (introUi) {
        tl.to(
          introUi,
          {
            opacity: 0,
            y: -18,
            duration: 0.12,
            ease: 'power2.out',
          },
          0.02
        );
      }

      // 3. Interior Greeting: Appears only in the final interior resting state (88%–100%)
      if (interiorText) {
        gsap.set(interiorText, { opacity: 0, y: 25 });

        tl.to(
          interiorText,
          {
            opacity: 1,
            y: 0,
            duration: 0.1,
            ease: 'power2.out',
          },
          0.88
        );
      }
    }, section);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [isInitialReady, isReducedMotion, totalFrames]);

  return {
    isReducedMotion,
  };
}
