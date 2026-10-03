"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { clsx } from "clsx";
import { VideoChapter } from "@/lib/data/mock-schema";

interface ScrollVideoJourneyProps {
  videoSrc: string;
  mobileSrc?: string;
  fallbackSrc?: string;
  posterSrc?: string;
  fallbackVisual?: string;
  productName: string;
  maxTime?: number;
  chapters?: VideoChapter[];
  trackLabel?: string;
  onBurst?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onStageChange?: (stageIndex: number) => void;
  jumpToProgress?: { progress: number; key: number } | null;
}

const DEFAULT_CHAPTERS: VideoChapter[] = [
  { step: "01", label: "RAW INGREDIENTS", targetProgress: 0.02 },
  { step: "02", label: "PREPARATION & BREW", targetProgress: 0.25 },
  { step: "03", label: "HOPS & WORT", targetProgress: 0.50 },
  { step: "04", label: "FERMENTATION", targetProgress: 0.72 },
  { step: "05", label: "BENGAL TIGER CAN", targetProgress: 0.98 },
];

export function ScrollVideoJourney({
  videoSrc,
  mobileSrc,
  fallbackSrc,
  posterSrc = "/bengal-tiger-poster.jpg",
  fallbackVisual,
  productName,
  maxTime,
  chapters,
  trackLabel = "TIMELINE",
  onBurst,
  onStageChange,
  jumpToProgress,
}: ScrollVideoJourneyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Scrollbar refs for direct DOM updates (60-120fps with zero React rerenders)
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const percentDisplayRef = useRef<HTMLSpanElement>(null);

  // Cached layout dimensions to prevent layout thrashing inside scroll handlers
  const layoutMetricsRef = useRef({
    maxScroll: 1,
    trackWidth: 1,
    thumbWidth: 36,
    maxThumbLeft: 1,
  });

  const stages = useMemo(() => {
    return chapters && chapters.length > 0 ? chapters : DEFAULT_CHAPTERS;
  }, [chapters]);

  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const activeStageIdxRef = useRef(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const durationRef = useRef(maxTime || 8.0);
  const targetTimeRef = useRef(0);
  const pendingTimeRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const lastSeekTimeRef = useRef(0);
  const rAFIdRef = useRef<number | null>(null);

  // Mouse drag scrubbing refs (desktop)
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Responsive mobile viewport detection without duplicate media downloads
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobileViewport(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const activeSrc = isMobileViewport && mobileSrc ? mobileSrc : videoSrc;

  // Accessibility: detect reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Viewport awareness: pause work and media when offscreen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsInViewport(entry.isIntersecting);
          if (!entry.isIntersecting && videoRef.current) {
            videoRef.current.pause();
            if (rAFIdRef.current) {
              cancelAnimationFrame(rAFIdRef.current);
              rAFIdRef.current = null;
            }
          }
        }
      },
      { rootMargin: "250px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Map progress (0 to 1) to target video time (0 to effectiveDuration)
  const calculateTargetTime = useCallback((progress: number, duration: number) => {
    const effectiveDuration = maxTime ? Math.min(duration, maxTime) : duration;
    const startHold = 0.02; // Small 2% buffer for initial scene
    const endHold = 0.86;   // Hold final can for remaining 14% scroll
    if (progress <= startHold) return 0;
    if (progress >= endHold) return Math.max(0, effectiveDuration - 0.04);
    const normalized = (progress - startHold) / (endHold - startHold);
    return Math.min(normalized * (effectiveDuration - 0.04), effectiveDuration - 0.04);
  }, [maxTime]);

  // Synchronize video currentTime via requestAnimationFrame with controlled seek throttling
  const updateVideoTime = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isInViewport) {
      rAFIdRef.current = null;
      return;
    }

    const duration = durationRef.current || video.duration || 8;
    const effectiveDuration = maxTime ? Math.min(duration, maxTime) : duration;
    const target = Math.min(Math.max(targetTimeRef.current, 0), effectiveDuration - 0.04);
    const diff = target - video.currentTime;

    if (Math.abs(diff) < 0.03 && pendingTimeRef.current === null) {
      rAFIdRef.current = null;
      return;
    }

    const now = performance.now();
    // Allow seek if not currently seeking or if 32ms has elapsed since last seek
    if (!video.seeking && !isSeekingRef.current && (now - lastSeekTimeRef.current > 32)) {
      pendingTimeRef.current = null;
      isSeekingRef.current = true;
      lastSeekTimeRef.current = now;

      // Use fastSeek on supported platforms (Safari iOS hardware acceleration)
      const anyVideo = video as unknown as { fastSeek?: (t: number) => void };
      if (typeof anyVideo.fastSeek === "function") {
        try {
          anyVideo.fastSeek(target);
        } catch {
          video.currentTime = target;
        }
      } else {
        video.currentTime = target;
      }
    } else {
      pendingTimeRef.current = target;
    }

    if (Math.abs(target - video.currentTime) >= 0.03 || pendingTimeRef.current !== null) {
      rAFIdRef.current = requestAnimationFrame(updateVideoTime);
    } else {
      rAFIdRef.current = null;
    }
  }, [isInViewport, maxTime]);

  // Schedule rAF update
  const scheduleUpdate = useCallback(() => {
    if (!rAFIdRef.current && isInViewport) {
      rAFIdRef.current = requestAnimationFrame(updateVideoTime);
    }
  }, [isInViewport, updateVideoTime]);

  // Cache layout dimensions to prevent layout thrashing on scroll
  const updateLayoutMetrics = useCallback(() => {
    const scroller = scrollTrackRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const scrollW = scroller.scrollWidth;
    const clientW = scroller.clientWidth;
    const maxScroll = Math.max(1, scrollW - clientW);
    const trackW = track.clientWidth;
    const thumbW = Math.max(36, (clientW / scrollW) * trackW);
    const maxThumbL = Math.max(1, trackW - thumbW);

    layoutMetricsRef.current = {
      maxScroll,
      trackWidth: trackW,
      thumbWidth: thumbW,
      maxThumbLeft: maxThumbL,
    };
  }, []);

  // Handle native scroll event (smooth, non-blocking, zero layout reflows)
  const handleScroll = useCallback(() => {
    const scroller = scrollTrackRef.current;
    const video = videoRef.current;
    if (!scroller || !video) return;

    const { maxScroll, maxThumbLeft, thumbWidth } = layoutMetricsRef.current;
    const progress = Math.min(Math.max(scroller.scrollLeft / maxScroll, 0), 1);
    const duration = durationRef.current || video.duration || 8;
    targetTimeRef.current = calculateTargetTime(progress, duration);

    // Update scrollbar thumb and percentage readout directly in DOM
    const thumb = thumbRef.current;
    if (thumb) {
      const thumbLeft = progress * maxThumbLeft;
      thumb.style.width = `${thumbWidth}px`;
      thumb.style.transform = `translateX(${thumbLeft}px)`;

      if (percentDisplayRef.current) {
        percentDisplayRef.current.textContent = `${Math.round(progress * 100)}%`;
      }
    }

    // Dynamic stage index determination based on chapter count and target progress
    let stageIdx = 0;
    if (stages.length > 0) {
      for (let i = stages.length - 1; i >= 0; i--) {
        const target = stages[i].targetProgress ?? (i / stages.length);
        const threshold = i === 0 ? 0 : Math.max(0, target - (1 / (stages.length * 2)));
        if (progress >= threshold) {
          stageIdx = i;
          break;
        }
      }
    }

    if (stageIdx !== activeStageIdxRef.current) {
      activeStageIdxRef.current = stageIdx;
      setActiveStageIdx(stageIdx);
      onStageChange?.(stageIdx);
    }

    if (!hasScrolled && progress > 0.01) {
      setHasScrolled(true);
    }

    scheduleUpdate();
  }, [calculateTargetTime, hasScrolled, onStageChange, scheduleUpdate, stages]);

  // Initial stage notification
  useEffect(() => {
    onStageChange?.(0);
  }, [onStageChange]);

  // Handle external jump requests
  useEffect(() => {
    if (jumpToProgress && scrollTrackRef.current) {
      const scroller = scrollTrackRef.current;
      const { maxScroll } = layoutMetricsRef.current;
      if (maxScroll > 0) {
        scroller.scrollTo({
          left: jumpToProgress.progress * maxScroll,
          behavior: "smooth",
        });
      }
    }
  }, [jumpToProgress]);

  // Attach native passive scroll listener and observe layout metrics
  useEffect(() => {
    const scroller = scrollTrackRef.current;
    if (!scroller) return;

    updateLayoutMetrics();
    scroller.addEventListener("scroll", handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateLayoutMetrics();
      handleScroll();
    });
    resizeObserver.observe(scroller);

    return () => {
      resizeObserver.disconnect();
      scroller.removeEventListener("scroll", handleScroll);
      if (rAFIdRef.current) {
        cancelAnimationFrame(rAFIdRef.current);
        rAFIdRef.current = null;
      }
    };
  }, [handleScroll, updateLayoutMetrics]);

  // Video metadata & seeked event listeners with WebKit mobile handshake
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isInViewport) return;

    const onLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        durationRef.current = maxTime ? Math.min(video.duration, maxTime) : video.duration;
      }
      setIsLoaded(true);
      handleScroll();
    };

    const onCanPlay = () => {
      setIsLoaded(true);
    };

    const onSeeked = () => {
      isSeekingRef.current = false;
      if (pendingTimeRef.current !== null) {
        const nextTarget = pendingTimeRef.current;
        pendingTimeRef.current = null;
        if (Math.abs(nextTarget - video.currentTime) >= 0.03) {
          scheduleUpdate();
        }
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", onCanPlay);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("seeked", onSeeked);

    // Explicitly load media
    video.load();

    // Mobile WebKit Handshake: Silent play/pause allows WebKit hardware pipeline to decode scrubbed frames while paused
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          video.pause();
        })
        .catch(() => {
          // Autoplay policy handled gracefully
        });
    }

    if (video.readyState >= 1) {
      onLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("loadeddata", onCanPlay);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [activeSrc, handleScroll, isInViewport, maxTime, scheduleUpdate]);

  // Desktop mouse drag-to-scrub handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const scroller = scrollTrackRef.current;
    if (!scroller) return;

    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = scroller.scrollLeft;
    hasMovedRef.current = false;

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = moveEvent.clientX - startXRef.current;
      if (Math.abs(deltaX) > 4) {
        hasMovedRef.current = true;
      }
      scroller.scrollLeft = startScrollLeftRef.current - deltaX * 1.5;
    };

    const onGlobalMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", onGlobalMouseMove);
      window.removeEventListener("mouseup", onGlobalMouseUp);

      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (!hasMovedRef.current && onBurst) {
          onBurst(upEvent as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }
    };

    window.addEventListener("mousemove", onGlobalMouseMove);
    window.addEventListener("mouseup", onGlobalMouseUp);
  };

  // Scrollbar Track Click handler
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (thumbRef.current && thumbRef.current.contains(e.target as Node)) {
      return;
    }
    const track = trackRef.current;
    const scroller = scrollTrackRef.current;
    if (!track || !scroller) return;

    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.min(Math.max(clickX / rect.width, 0), 1);
    const { maxScroll } = layoutMetricsRef.current;

    scroller.scrollTo({
      left: progress * maxScroll,
      behavior: "smooth",
    });
  };

  // Scrollbar Thumb Drag handler (Mouse)
  const handleThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const scroller = scrollTrackRef.current;
    if (!scroller) return;

    const startX = e.clientX;
    const startScrollLeft = scroller.scrollLeft;
    const { maxScroll, maxThumbLeft } = layoutMetricsRef.current;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaRatio = deltaX / maxThumbLeft;
      scroller.scrollLeft = startScrollLeft + deltaRatio * maxScroll;
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Scrollbar Thumb Drag handler (Touch)
  const handleThumbTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;

    const scroller = scrollTrackRef.current;
    if (!scroller) return;

    const startX = touch.clientX;
    const startScrollLeft = scroller.scrollLeft;
    const { maxScroll, maxThumbLeft } = layoutMetricsRef.current;

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
      const moveTouch = moveEvent.touches[0];
      if (!moveTouch) return;
      const deltaX = moveTouch.clientX - startX;
      const deltaRatio = deltaX / maxThumbLeft;
      scroller.scrollLeft = startScrollLeft + deltaRatio * maxScroll;
    };

    const onTouchEnd = () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
  };

  const currentStage = stages[activeStageIdx] || stages[0];
  const staticFallbackImage = posterSrc || fallbackVisual || "/mockup.jpg";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[45dvh] min-h-[280px] max-h-[420px] md:h-full md:min-h-[calc(100vh-4rem)] md:max-h-none flex items-center justify-center overflow-hidden select-none bg-paper-white"
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (!hasMovedRef.current && onBurst) {
          onBurst(e);
        }
      }}
    >
      {/* 
        Stage 1: Pinned Video Viewport
        Centred in the gallery frame with exact proportions of the product visual.
      */}
      <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-4 md:p-8 pb-12 sm:pb-14 pointer-events-none">
        {/* Poster preview / Fallback for error, reduced motion, or during initial load */}
        <img
          src={staticFallbackImage}
          alt={`${productName} Visual Journey`}
          className={clsx(
            "absolute max-h-[35dvh] md:max-h-[80vh] max-w-full object-contain drop-shadow-2xl transition-opacity duration-300",
            isLoaded && !prefersReducedMotion && !hasError ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        />

        {/* Scrubbable Process Video */}
        {!prefersReducedMotion && !hasError && isInViewport && (
          <video
            ref={videoRef}
            poster={posterSrc}
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            disableRemotePlayback
            onError={() => setHasError(true)}
            className={clsx(
              "max-h-[35dvh] md:max-h-[80vh] max-w-full object-contain drop-shadow-2xl",
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
          >
            <source src={activeSrc} type="video/mp4" />
            {fallbackSrc && fallbackSrc !== activeSrc && (
              <source src={fallbackSrc} type="video/mp4" />
            )}
          </video>
        )}
      </div>

      {/* 
        Stage 2: Horizontal Scroll Track (Native Momentum Scroller)
        Captures native touch swipe, trackpad horizontal swipe, shift+wheel, and drag.
        Uses touch-action: pan-x pan-y to allow smooth horizontal scrubbing AND normal vertical page scrolling.
      */}
      <div
        ref={scrollTrackRef}
        className={clsx(
          "absolute inset-0 overflow-x-auto overflow-y-hidden z-20",
          "cursor-grab active:cursor-grabbing",
          "scrollbar-none"
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x pan-y",
        }}
        tabIndex={0}
        role="region"
        aria-label={`${productName} horizontal scroll video journey`}
        onKeyDown={(e) => {
          const scroller = scrollTrackRef.current;
          if (!scroller) return;
          if (e.key === "ArrowRight") {
            scroller.scrollLeft += 150;
          } else if (e.key === "ArrowLeft") {
            scroller.scrollLeft -= 150;
          }
        }}
      >
        {/* Expanded virtual track giving generous resolution for video scrubbing */}
        <div className="h-full w-[450vw] md:w-[380vw] pointer-events-none" />
      </div>

      {/* 
        Stage 3: Brutalist Interactive Scrollbar Bar
        The single, clean, elegant controller for the brewing journey transition.
      */}
      <div className="absolute bottom-0 left-0 w-full h-11 bg-paper-white border-t border-ink-black flex items-center px-3 sm:px-6 gap-2 sm:gap-4 z-30 select-none pointer-events-auto">
        {/* Left: Active Stage Name */}
        <div className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <span className="w-2 h-2 bg-rani-pink inline-block flex-shrink-0" />
          <span className="font-bold text-ink-black">{currentStage.step}</span>
          <span className="text-ink-black/40">/</span>
          <span className="text-ink-black font-semibold text-[10px] sm:text-xs truncate max-w-[110px] sm:max-w-none">
            {currentStage.label}
          </span>
        </div>

        {/* Center: The Interactive Scrollbar Track */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative flex-1 h-3.5 bg-paper-white border border-ink-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] flex items-center"
          title="Click or drag scrollbar to scrub journey"
        >
          {/* Subtle tick marks for stage transitions */}
          {stages.slice(1).map((stage, idx) => {
            const pos =
              stage.targetProgress !== undefined
                ? `${Math.round(stage.targetProgress * 100)}%`
                : `${Math.round(((idx + 1) / stages.length) * 100)}%`;
            return (
              <div
                key={idx}
                className="absolute top-0 bottom-0 w-[1px] bg-ink-black/25 pointer-events-none"
                style={{ left: pos }}
              />
            );
          })}

          {/* Draggable Brutalist Thumb */}
          <div
            ref={thumbRef}
            onMouseDown={handleThumbMouseDown}
            onTouchStart={handleThumbTouchStart}
            className={clsx(
              "absolute top-0 bottom-0 bg-ink-black cursor-grab active:cursor-grabbing",
              "hover:bg-electric-blue active:bg-rani-pink transition-colors duration-150",
              "flex items-center justify-center border-r border-l border-ink-black",
              "before:content-[''] before:absolute before:-top-3 before:-bottom-3 before:-left-3 before:-right-3 before:z-10"
            )}
            style={{ width: "48px", transform: "translateX(0px)" }}
          >
            {/* Grip lines */}
            <div className="flex gap-0.5 pointer-events-none">
              <div className="w-[1px] h-2.5 bg-paper-white/80" />
              <div className="w-[1px] h-2.5 bg-paper-white/80" />
              <div className="w-[1px] h-2.5 bg-paper-white/80" />
            </div>
          </div>
        </div>

        {/* Right: Percentage Counter */}
        <div className="font-mono text-[11px] sm:text-xs tracking-wider text-ink-black flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <span ref={percentDisplayRef} className="font-bold w-9 sm:w-10 text-right">
            0%
          </span>
        </div>
      </div>

      {/* Initial Interaction Cue (fades out once user begins scrubbing) */}
      {!hasScrolled && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest bg-paper-white border border-ink-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] pointer-events-none animate-pulse">
          <span className="text-electric-blue mr-1">↔</span> SCROLL OR DRAG TO EXPLORE
        </div>
      )}
    </div>
  );
}
