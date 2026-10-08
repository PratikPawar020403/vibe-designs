import React, { useEffect, useRef } from 'react';
import './MegtikFooter.css';

export const MegtikFooter: React.FC = () => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return; // poster only

    const VIDEO_CONFIG = {
      src: '/assets/useit.mp4',
      start: 0.0,
      endHoldMs: 1200,
      fadeMs: 400,
    };

    let state: 'idle' | 'playing' | 'paused' | 'hold' | 'failed' = 'idle';
    let visible = false;
    let loaded = false;
    let holdTimer: NodeJS.Timeout | null = null;
    let fadeTimer: NodeJS.Timeout | null = null;

    function load() {
      if (loaded || !video) return;
      loaded = true;
      if (!video.getAttribute('src')) {
        video.src = VIDEO_CONFIG.src;
      }
      video.addEventListener(
        'error',
        () => {
          if (stage) stage.classList.remove('is-live');
          state = 'failed';
        },
        { once: true }
      );
    }

    function play() {
      if (state === 'failed' || !video) return;
      state = 'playing';
      if (stage) stage.classList.remove('is-fading');
      const p = video.play();
      if (p && p.catch) {
        p.catch(() => {
          state = 'idle';
        });
      }
    }

    const handlePlaying = () => {
      if (stage) stage.classList.add('is-live');
    };

    const handleEnded = () => {
      state = 'hold';
      holdTimer = setTimeout(() => {
        if (state !== 'hold') return;
        if (stage) stage.classList.add('is-fading');
        fadeTimer = setTimeout(() => {
          if (!video) return;
          video.currentTime = VIDEO_CONFIG.start;
          if (visible) {
            play();
          } else {
            state = 'idle';
          }
        }, VIDEO_CONFIG.fadeMs);
      }, VIDEO_CONFIG.endHoldMs);
    };

    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) {
          load();
          if (state === 'idle') {
            play();
          } else if (state === 'paused') {
            state = 'playing';
            video.play().catch(() => {
              state = 'idle';
            });
          }
        } else if (state === 'playing') {
          video.pause();
          state = 'paused';
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(stage);

    // Click or tap to replay
    const handleStageClick = () => {
      if (video) {
        video.currentTime = VIDEO_CONFIG.start;
        play();
      }
    };

    stage.addEventListener('click', handleStageClick);

    return () => {
      observer.disconnect();
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
      stage.removeEventListener('click', handleStageClick);
      if (holdTimer) clearTimeout(holdTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
      video.pause();
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="mk-footer" id="contact" aria-label="MEGTIK Footer">
      <div className="mk-inner">
        {/* Main Stage: Backside Video + Foreground MEGTIK Wordmark + Message */}
        <div className="mk-stage" id="mkStage" ref={stageRef} role="region" aria-label="Animated coffee mug scene">
          {/* Layer 2: Video in Backside (Full spilling animation including floor splash) */}
          <div className="mk-video-wrapper">
            <img
              className="mk-poster"
              src="/assets/useit-poster.jpg"
              alt="Megtik ceramic mug with coffee spilling across the floor"
            />
            <video
              ref={videoRef}
              className="mk-video"
              src="/assets/useit.mp4"
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          </div>

          {/* Layer 3: MEGTIK Wordmark OVERLAYING the video (in front) */}
          <div className="mk-wordmark-layer" aria-hidden="true">
            <h2 className="mk-wordmark dm-serif-display-regular-italic">MEGTIK</h2>
          </div>

          {/* Layer 4: Supporting message */}
          <div className="mk-message">
            <p className="mk-message-line1">Take your time.</p>
            <p className="mk-message-line2">We&apos;ll keep the coffee warm.</p>
          </div>
        </div>

        {/* Layer 4: Minimal Bottom Bar */}
        <div className="mk-bottom-bar">
          <p className="mk-legal">© {new Date().getFullYear()} MEGTIK</p>
          <nav className="mk-nav-links" aria-label="Footer links">
            <a href="#menu">Email Us</a>
            <span className="mk-sep" aria-hidden="true">·</span>
            <a
              href="https://instagram.com/megtikcoffee"
              target="_blank"
              rel="noopener noreferrer"
            >
              INSTAGRAM
            </a>
            <span className="mk-sep" aria-hidden="true">·</span>
            <a href="#contact">CONTACT</a>
          </nav>
          <div className="mk-top-wrap">
            <button
              type="button"
              className="mk-back-top"
              onClick={handleBackToTop}
              aria-label="Back to top of page"
            >
              BACK TO TOP ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MegtikFooter;
