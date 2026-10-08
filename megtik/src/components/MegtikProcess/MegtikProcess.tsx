import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import './MegtikProcess.css';

interface ProcessStage {
  id: string;
  step: string;
  label: string;
  startSec: number;
}

const PROCESS_STAGES: ProcessStage[] = [
  { id: 'origin', step: '01', label: 'ORIGIN', startSec: 0 },
  { id: 'select', step: '02', label: 'SELECT', startSec: 1.6 },
  { id: 'roast', step: '03', label: 'ROAST', startSec: 3.3 },
  { id: 'grind', step: '04', label: 'GRIND', startSec: 5.0 },
  { id: 'craft', step: '05', label: 'CRAFT', startSec: 6.6 },
  { id: 'cup', step: '06', label: 'CUP', startSec: 8.3 },
];

export const MegtikProcess: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>('00:00');

  // Autoplay video when entering viewport via IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                // Browser policy fallback (e.g. if unmuted)
                video.muted = true;
                setIsMuted(true);
                video.play().catch(() => {});
              });
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Update active stage, progress bar, and counter as video plays
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime;
    const duration = video.duration && !isNaN(video.duration) ? video.duration : 10;
    setProgressPercent(Math.min(100, Math.max(0, (time / duration) * 100)));

    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    setCurrentTimeFormatted(
      `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    );

    // Determine active process stage
    for (let i = PROCESS_STAGES.length - 1; i >= 0; i--) {
      if (time >= PROCESS_STAGES[i].startSec) {
        setActiveStageIndex(i);
        break;
      }
    }
  }, []);

  // Toggle Play / Pause
  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Toggle Sound
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Jump to specific process stage
  const jumpToStage = (stage: ProcessStage) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = stage.startSec;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const currentStage = PROCESS_STAGES[activeStageIndex];

  return (
    <section
      ref={sectionRef}
      className="megtik-process-section"
      aria-label="MEGTIK Coffee Process Film"
    >
      {/* Editorial Continuity Marker */}
      <div className="process-continuity-rule" aria-hidden="true" />

      {/* Editorial Section Header */}
      <header className="process-header-block">
        <span className="process-section-label">03 — FROM BEAN TO CUP</span>
        <h2 className="process-section-title">FROM ORIGIN TO MEGTIK</h2>
        <p className="process-section-subtitle">Every cup follows a journey.</p>
      </header>

      {/* Cinematic Editorial Film Window (Physical Warm Frame) */}
      <div
        className="process-film-window"
        onClick={togglePlayPause}
        role="region"
        aria-label="Cinematic Coffee Process Film Window"
      >
        <div className="film-screen-inner">
          <video
            ref={videoRef}
            src="/videos/process.mp4"
            className="film-video-player"
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            aria-label="Making of MEGTIK coffee process film"
          />

          {/* Frame Specular Highlight */}
          <div className="film-frame-sheen" aria-hidden="true" />

          {/* Minimal Editorial Video Controls Overlay */}
          <div className={`film-controls-overlay ${!isPlaying ? 'is-paused' : ''}`}>
            {/* Top Bar: Archival Tag & Sound Toggle */}
            <div className="controls-top-row">
              <span className="film-vintage-tag">ARCHIVAL FILM • 1080P CINEMATIC</span>

              <button
                type="button"
                className="film-sound-toggle"
                onClick={toggleSound}
                aria-label={isMuted ? 'Turn sound on' : 'Mute sound'}
              >
                {isMuted ? (
                  <>
                    <VolumeX size={12} aria-hidden="true" />
                    <span>↗ SOUND ON</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={12} aria-hidden="true" />
                    <span>MUTE</span>
                  </>
                )}
              </button>
            </div>

            {/* Center Play/Pause Graphic Cue */}
            <div
              className="controls-center-play"
              aria-label={isPlaying ? 'Pause film' : 'Play film'}
            >
              {isPlaying ? (
                <Pause size={20} fill="#f6efe6" strokeWidth={0} />
              ) : (
                <Play size={20} fill="#f6efe6" strokeWidth={0} style={{ marginLeft: 3 }} />
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="controls-bottom-row">
              <span className="film-stage-live">
                STAGE {currentStage.step} — {currentStage.label}
              </span>
              <span className="film-time-counter">{currentTimeFormatted} / 00:10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Process Film Chapter Index (Continuous Editorial Rail) */}
      <nav
        className="process-film-timeline"
        aria-label="Coffee Crafting Chapters"
      >
        <div className="timeline-track-rail">
          <div
            className="timeline-track-progress"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="timeline-nodes-row">
          {PROCESS_STAGES.map((stage, idx) => {
            const isActive = idx === activeStageIndex;
            const isPassed = idx < activeStageIndex;

            return (
              <button
                key={stage.id}
                type="button"
                className={`timeline-chapter-node ${isActive ? 'is-active' : ''} ${isPassed ? 'is-passed' : ''}`}
                onClick={() => jumpToStage(stage)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Jump to stage ${stage.step}: ${stage.label}`}
              >
                <span className="chapter-node-dot" aria-hidden="true" />
                <div className="chapter-node-label">
                  <span className="chapter-node-num">{stage.step}</span>
                  <span className="chapter-node-name">{stage.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </section>
  );
};

export default MegtikProcess;
