"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { clsx } from "clsx";
import { VideoChapter } from "@/lib/data/mock-schema";

interface ScrollVideoJourneyProps {
  videoSrc: string;
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

  const stages = useMemo(() => {
    return chapters && chapters.length > 0 ? chapters : DEFAULT_CHAPTERS;
  }, [chapters]);

  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const activeStageIdxRef = useRef(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const durationRef = useRef(maxTime || 8.0);
  const targetTimeRef = useRef(0);
  const pendingTimeRef = useRef<number | null>(null);
  const rAFIdRef = useRef<number | null>(null);

  // Mouse drag scrubbing refs
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Accessibility: detect reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Map progress (0 to 1) to target video time (0 to effectiveDuration)
  // Strictly clamps to maxTime so unwanted trailing studio scenes are NEVER exposed.
  // Holds the final product frame from ~86% to 100% scroll.
  const calculateTargetTime = useCallback((progress: number, duration: number) => {
    const effectiveDuration = maxTime ? Math.min(duration, maxTime) : duration;
    const startHold = 0.02; // Small 2% buffer for initial scene
    const endHold = 0.86;   // Hold final can for remaining 14% scroll
    if (progress <= startHold) return 0;
    if (progress >= endHold) return Math.max(0, effectiveDuration - 0.04);
    const normalized = (progress - startHold) / (endHold - startHold);
    return Math.min(normalized * (effectiveDuration - 0.04), effectiveDuration - 0.04);
  }, [maxTime]);

  // Synchronize video currentTime via requestAnimationFrame with immediate direct scrubbing
  const updateVideoTime = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      rAFIdRef.current = null;
      return;
    }

    const duration = durationRef.current || video.duration || 8;
    const effectiveDuration = maxTime ? Math.min(duration, maxTime) : duration;
    const target = Math.min(Math.max(targetTimeRef.current, 0), effectiveDuration - 0.04);
    const diff = target - video.currentTime;

    if (Math.abs(diff) < 0.02 && pendingTimeRef.current === null) {
      rAFIdRef.current = null;
      return;
    }

    if (!video.seeking) {
      pendingTimeRef.current = null;
      video.currentTime = target;
    } else {
      // Buffer latest position while decoder completes previous seek
      pendingTimeRef.current = target;
    }

    if (Math.abs(target - video.currentTime) >= 0.02 || pendingTimeRef.current !== null) {
      rAFIdRef.current = requestAnimationFrame(updateVideoTime);
    } else {
      rAFIdRef.current = null;
    }
  }, [maxTime]);

  // Schedule rAF update
  const scheduleUpdate = useCallback(() => {
    if (!rAFIdRef.current) {
      rAFIdRef.current = requestAnimationFrame(updateVideoTime);
    }
  }, [updateVideoTime]);

  // Handle native scroll event
  const handleScroll = useCallback(() => {
    const scroller = scrollTrackRef.current;
    const video = videoRef.current;
    if (!scroller || !video) return;

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    if (maxScroll <= 0) return;

    const progress = Math.min(Math.max(scroller.scrollLeft / maxScroll, 0), 1);
    const duration = durationRef.current || video.duration || 8;
    targetTimeRef.current = calculateTargetTime(progress, duration);

    // Update scrollbar thumb and percentage readout directly in DOM
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (track && thumb) {
      const trackWidth = track.clientWidth;
      const thumbWidth = Math.max(36, (scroller.clientWidth / scroller.scrollWidth) * trackWidth);
      const maxThumbLeft = Math.max(0, trackWidth - thumbWidth);
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

  // Handle external jump requests (e.g. clicking phase cards in the story rail)
  useEffect(() => {
    if (jumpToProgress && scrollTrackRef.current) {
      const scroller = scrollTrackRef.current;
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (maxScroll > 0) {
        scroller.scrollTo({
          left: jumpToProgress.progress * maxScroll,
          behavior: "smooth"
        });
      }
    }
  }, [jumpToProgress]);

  // Attach passive scroll listener and handle initial setup
  useEffect(() => {
    const scroller = scrollTrackRef.current;
    if (!scroller) return;

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      if (rAFIdRef.current) {
        cancelAnimationFrame(rAFIdRef.current);
      }
    };
  }, [handleScroll]);

  // Resize listener to keep thumb correctly scaled
  useEffect(() => {
    const handleResize = () => handleScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleScroll]);

  // Video metadata & seeked event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        durationRef.current = maxTime ? Math.min(video.duration, maxTime) : video.duration;
      }
      setIsLoaded(true);
      video.pause();
      handleScroll();
    };

    const onSeeked = () => {
      if (pendingTimeRef.current !== null) {
        const nextTarget = pendingTimeRef.current;
        pendingTimeRef.current = null;
        if (Math.abs(nextTarget - video.currentTime) >= 0.02) {
          video.currentTime = nextTarget;
        }
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("seeked", onSeeked);

    if (video.readyState >= 1) {
      onLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [handleScroll, maxTime]);

  // Non-passive wheel event handling: enables mouse users to scrub comfortably
  // without locking or trapping them when reaching boundary limits.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheelHandler = (e: WheelEvent) => {
      const scroller = scrollTrackRef.current;
      if (!scroller) return;

      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (maxScroll <= 0) return;

      // Trackpad or shift+wheel horizontal navigation: native browser behavior
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      const delta = e.deltaY;
      const atStart = scroller.scrollLeft <= 2;
      const atEnd = scroller.scrollLeft >= maxScroll - 2;

      // Only intercept when inside the scrubbing range
      if ((delta > 0 && !atEnd) || (delta < 0 && !atStart)) {
        e.preventDefault();
        scroller.scrollLeft += delta;
      }
      // When at boundaries, let the page scroll naturally!
    };

    container.addEventListener("wheel", onWheelHandler, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheelHandler);
    };
  }, []);

  // Global mouse drag-to-scrub handlers on the viewport
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
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;

    scroller.scrollTo({
      left: progress * maxScroll,
      behavior: "smooth",
    });
  };

  // Scrollbar Thumb Drag handler (Mouse)
  const handleThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const track = trackRef.current;
    const scroller = scrollTrackRef.current;
    if (!track || !scroller) return;

    const startX = e.clientX;
    const startScrollLeft = scroller.scrollLeft;
    const trackWidth = track.clientWidth;
    const thumbWidth = Math.max(36, (scroller.clientWidth / scroller.scrollWidth) * trackWidth);
    const maxThumbLeft = Math.max(1, trackWidth - thumbWidth);
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;

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

    const track = trackRef.current;
    const scroller = scrollTrackRef.current;
    if (!track || !scroller) return;

    const startX = touch.clientX;
    const startScrollLeft = scroller.scrollLeft;
    const trackWidth = track.clientWidth;
    const thumbWidth = Math.max(36, (scroller.clientWidth / scroller.scrollWidth) * trackWidth);
    const maxThumbLeft = Math.max(1, trackWidth - thumbWidth);
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;

    const onTouchMove = (moveEvent: TouchEvent) => {
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

    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
  };

  // Touch directional disambiguation: horizontal swipe scrubs video, vertical swipe scrolls page naturally
  useEffect(() => {
    const container = containerRef.current;
    const scroller = scrollTrackRef.current;
    if (!container || !scroller) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let initialScrollLeft = 0;
    let isHorizontalSwipe: boolean | null = null;
    let touchMoved = false;

    const onTouchStart = (e: TouchEvent) => {
      if (trackRef.current && trackRef.current.contains(e.target as Node)) {
        return;
      }
      const touch = e.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      initialScrollLeft = scroller.scrollLeft;
      isHorizontalSwipe = null;
      touchMoved = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (trackRef.current && trackRef.current.contains(e.target as Node)) {
        return;
      }
      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (isHorizontalSwipe === null) {
        if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
          isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        }
      }

      if (isHorizontalSwipe === true) {
        touchMoved = true;
        if (e.cancelable) {
          e.preventDefault();
        }
        scroller.scrollLeft = initialScrollLeft - deltaX * 1.5;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchMoved && isHorizontalSwipe === null && onBurst) {
        const touch = e.changedTouches[0];
        if (touch) {
          onBurst({
            clientX: touch.clientX,
            clientY: touch.clientY,
          } as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }
      isHorizontalSwipe = null;
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [onBurst]);

  const currentStage = stages[activeStageIdx] || stages[0];
  const staticFallbackImage = posterSrc || fallbackVisual || "/mockup.jpg";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[45dvh] min-h-[280px] max-h-[420px] md:h-full md:min-h-[calc(100vh-4rem)] md:max-h-none flex items-center justify-center overflow-hidden select-none bg-paper-white"
      onMouseDown={handleMouseDown}
    >
      {/* 
        Stage 1: Pinned Video Viewport
        Centred in the gallery frame with exact proportions of the product visual.
      */}
      <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-4 md:p-8 pb-12 sm:pb-14 pointer-events-none">
        {/* Poster preview / Fallback for error, reduced motion or pre-load */}
        {(!isLoaded || prefersReducedMotion || hasError) && (
          <img
            src={staticFallbackImage}
            alt={`${productName} Visual Journey`}
            className={clsx(
              "absolute max-h-[35dvh] md:max-h-[80vh] max-w-full object-contain drop-shadow-2xl transition-opacity duration-300",
              isLoaded && !prefersReducedMotion && !hasError ? "opacity-0" : "opacity-100"
            )}
          />
        )}

        {/* Scrubbable Process Video */}
        {!prefersReducedMotion && !hasError && (
          <video
            ref={videoRef}
            src={videoSrc}
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
            {fallbackSrc && <source src={fallbackSrc} type="video/mp4" />}
          </video>
        )}
      </div>

      {/* 
        Stage 2: Horizontal Scroll Track (Invisible native scroller)
        Captures touch swipe, trackpad horizontal swipe, shift+wheel, and drag.
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
          touchAction: "pan-y",
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
          <span className="text-ink-black font-semibold text-[10px] sm:text-xs truncate max-w-[110px] sm:max-w-none">{currentStage.label}</span>
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
            const pos = stage.targetProgress !== undefined
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
          <span ref={percentDisplayRef} className="font-bold w-9 sm:w-10 text-right">0%</span>
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
