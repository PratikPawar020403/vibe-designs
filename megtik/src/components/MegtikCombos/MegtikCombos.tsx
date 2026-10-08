import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react';
import { gsap } from 'gsap';
import { COMBOS_DATA, ComboItem } from './types';
import './MegtikCombos.css';

// Global speed constant: every transition duration and delay is multiplied by SPEED.
// Higher value = slower / calmer. Lower value = faster / snappier.
const SPEED = 1;

interface MegtikCombosProps {
  combos?: ComboItem[];
}

interface SlotConfig {
  rest: { x: number; y: number; rotation: number; scale: number };
  dx: number;
  dy: number;
  dr: number;
  stagger: number;
}

// Slot pose dynamics:
// Coffee exits left & up, enters from right & down
const COFFEE_SLOT: SlotConfig = {
  rest: { x: 0, y: -4, rotation: -1.5, scale: 1 },
  dx: 90,
  dy: 26,
  dr: 3,
  stagger: 0,
};

// Bite exits right & down, enters from left & up (passing along complementary arcs)
const BITE_SLOT: SlotConfig = {
  rest: { x: 0, y: 6, rotation: 1.8, scale: 1 },
  dx: -90,
  dy: -26,
  dr: -3,
  stagger: 0.07,
};

// Index-derived pose function: deterministic spatial resting poses
const POSE = (k: number, active: number, slot: SlotConfig) => {
  const d = k - active;
  if (d === 0) return slot.rest;
  const s = Math.sign(d);
  return {
    x: s * slot.dx,
    y: slot.rest.y + s * slot.dy,
    rotation: slot.rest.rotation + s * slot.dr,
    scale: 0.96,
  };
};

export const MegtikCombos: React.FC<MegtikCombosProps> = ({
  combos = COMBOS_DATA,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const total = combos.length;

  // DOM References
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const coffeeSlotRef = useRef<HTMLDivElement | null>(null);
  const biteSlotRef = useRef<HTMLDivElement | null>(null);
  const centerContentRef = useRef<HTMLDivElement | null>(null);

  // Stacked Card & Layer References
  const coffeeCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const biteCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const textLayersRef = useRef<(HTMLDivElement | null)[]>([]);

  // Navigation references
  const navRef = useRef<HTMLElement | null>(null);
  const travelingLineRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const hasEnteredRef = useRef<boolean>(false);

  // ---------------------------------------------------------------------------
  // 1. Image Pre-decoding on Mount (Eliminates first-run decode jank)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    combos.forEach((c) => {
      if (c.coffeeImg) {
        const img = new Image();
        img.src = c.coffeeImg;
        if (img.decode) img.decode().catch(() => {});
      }
      if (c.biteImg) {
        const img = new Image();
        img.src = c.biteImg;
        if (img.decode) img.decode().catch(() => {});
      }
    });
  }, [combos]);

  // ---------------------------------------------------------------------------
  // 2. Traveling Marker Tracker (x + scaleX, Zero Layout Triggers)
  // ---------------------------------------------------------------------------
  const updateCursor = useCallback(
    (nextIndex: number, animate = true) => {
      if (typeof window !== 'undefined' && window.innerWidth <= 960) return;

      const nav = navRef.current;
      const activeCard = cardRefs.current[nextIndex];
      const marker = travelingLineRef.current;
      if (!nav || !activeCard || !marker) return;

      const navRect = nav.getBoundingClientRect();
      const cardRect = activeCard.getBoundingClientRect();

      const baseW = 44; // base width from CSS
      const targetW = Math.max(36, Math.min(54, cardRect.width * 0.35));
      const targetX =
        cardRect.left - navRect.left + (cardRect.width - targetW) / 2;
      const targetY = cardRect.top - navRect.top;

      if (animate) {
        gsap.to(marker, {
          x: targetX,
          y: targetY,
          scaleX: targetW / baseW,
          duration: 0.90 * SPEED,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      } else {
        gsap.set(marker, {
          x: targetX,
          y: targetY,
          scaleX: targetW / baseW,
        });
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // 3. Initial Static Pose Initialization on Mount
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    const slots = [
      { refList: coffeeCardsRef.current, config: COFFEE_SLOT },
      { refList: biteCardsRef.current, config: BITE_SLOT },
    ];

    slots.forEach((slot) => {
      slot.refList.forEach((el, k) => {
        if (!el) return;
        const pose = POSE(k, 0, slot.config);
        const isInitial = k === 0;
        gsap.set(el, {
          x: pose.x,
          y: pose.y,
          rotation: pose.rotation,
          scale: pose.scale,
          opacity: isInitial ? 1 : 0,
        });
        el.style.zIndex = isInitial ? '2' : '1';
      });
    });

    textLayersRef.current.forEach((el, k) => {
      if (!el) return;
      const isInitial = k === 0;
      gsap.set(el, {
        opacity: isInitial ? 1 : 0,
      });
      el.style.zIndex = isInitial ? '2' : '1';

      const lines = el.querySelectorAll('.combo-line-inner');
      gsap.set(lines, {
        y: isInitial ? 0 : 16,
        opacity: isInitial ? 1 : 0,
      });
    });
  }, []);

  // ---------------------------------------------------------------------------
  // 4. Index-Derived Transition Engine: go(next)
  // Tween from CURRENT values with overwrite: 'auto' (Never snaps mid-flight)
  // ---------------------------------------------------------------------------
  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= total || next === activeIndex) return;

      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const slots = [
        { refList: coffeeCardsRef.current, config: COFFEE_SLOT, isCoffee: true },
        { refList: biteCardsRef.current, config: BITE_SLOT, isCoffee: false },
      ];

      // Reduced motion fallback: gentle 200ms opacity cross-fade
      if (prefersReduced) {
        slots.forEach((slot) => {
          slot.refList.forEach((el, k) => {
            if (!el) return;
            const isIn = k === next;
            gsap.to(el, {
              opacity: isIn ? 1 : 0,
              duration: 0.2,
              overwrite: 'auto',
            });
            el.style.zIndex = isIn ? '2' : '1';
          });
        });

        textLayersRef.current.forEach((el, k) => {
          if (!el) return;
          const isIn = k === next;
          gsap.to(el, {
            opacity: isIn ? 1 : 0,
            duration: 0.2,
            overwrite: 'auto',
          });
          el.style.zIndex = isIn ? '2' : '1';
        });

        setActiveIndex(next);
        updateCursor(next, false);
        return;
      }

      // A. Photos: Tween from current coordinates to new index pose
      slots.forEach((slot) => {
        const isCoffee = slot.isCoffee;
        slot.refList.forEach((el, k) => {
          if (!el) return;
          const isIn = k === next;
          const targetPose = POSE(k, next, slot.config);

          // Motion tween: from CURRENT values (never set mid-flight)
          gsap.to(el, {
            x: targetPose.x,
            y: targetPose.y,
            rotation: targetPose.rotation,
            scale: targetPose.scale,
            duration: isIn
              ? (isCoffee ? 1.1 : 1.2) * SPEED
              : 0.70 * SPEED,
            ease: isIn ? 'power3.out' : 'sine.inOut',
            delay: isIn
              ? (isCoffee ? 0.10 : 0.22) * SPEED
              : 0,
            overwrite: 'auto',
          });

          // Opacity tween: incoming card fades in, outgoing card fades out after delay
          gsap.to(el, {
            opacity: isIn ? 1 : 0,
            duration: isIn ? 0.45 * SPEED : 0.50 * SPEED,
            delay: isIn
              ? (isCoffee ? 0.10 : 0.22) * SPEED
              : 0.28 * SPEED,
            ease: 'sine.inOut',
            overwrite: 'auto',
          });

          el.style.zIndex = isIn ? '2' : '1';
        });
      });

      // B. Editorial Text: Clean masked line reveals for incoming; quick flat fade for outgoing
      textLayersRef.current.forEach((layerEl, k) => {
        if (!layerEl) return;
        const isIn = k === next;
        layerEl.style.zIndex = isIn ? '2' : '1';

        if (isIn) {
          const lines = layerEl.querySelectorAll('.combo-line-inner');
          gsap.fromTo(
            lines,
            { y: 16, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85 * SPEED,
              stagger: 0.07 * SPEED,
              ease: 'power3.out',
              delay: 0.30 * SPEED,
              overwrite: 'auto',
            }
          );
          gsap.to(layerEl, {
            opacity: 1,
            duration: 0.35 * SPEED,
            ease: 'sine.inOut',
            delay: 0.25 * SPEED,
            overwrite: 'auto',
          });
        } else {
          // Outgoing text fades quietly with no travel
          gsap.to(layerEl, {
            opacity: 0,
            duration: 0.35 * SPEED,
            ease: 'sine.inOut',
            overwrite: 'auto',
          });
        }
      });

      setActiveIndex(next);
      updateCursor(next, true);
    },
    [activeIndex, total, updateCursor]
  );

  // ---------------------------------------------------------------------------
  // 5. Keyboard Navigation (Arrows with e.repeat guard)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore key repeat to prevent flooding
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))
        return;

      if (e.key === 'ArrowRight') {
        go(activeIndex === total - 1 ? 0 : activeIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        go(activeIndex === 0 ? total - 1 : activeIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, total, go]);

  // Window resize to lock marker position
  useEffect(() => {
    const handleResize = () => {
      updateCursor(activeIndex, false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, updateCursor]);

  // ---------------------------------------------------------------------------
  // 6. Section Entrance Sequence
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasEnteredRef.current) {
          hasEnteredRef.current = true;
          observer.disconnect();

          const prefersReduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches;

          if (prefersReduced) {
            gsap.set(
              [
                headerRef.current,
                coffeeSlotRef.current,
                biteSlotRef.current,
                centerContentRef.current,
                navRef.current,
              ],
              { opacity: 1, y: 0, scale: 1 }
            );
            updateCursor(0, false);
            return;
          }

          const initTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

          initTl
            .fromTo(
              headerRef.current,
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: 0.45 }
            )
            .fromTo(
              [coffeeSlotRef.current, biteSlotRef.current],
              { opacity: 0, y: 18, scale: 0.98 },
              { opacity: 1, y: 0, scale: 1, duration: 0.52, stagger: 0.08 },
              '-=0.25'
            )
            .fromTo(
              centerContentRef.current,
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.45 },
              '-=0.3'
            )
            .fromTo(
              navRef.current,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.45 },
              '-=0.25'
            )
            .add(() => {
              updateCursor(0, true);
            }, '-=0.2');
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [updateCursor]);

  // ---------------------------------------------------------------------------
  // 7. Render Photo Card (4 stacked per slot, static GPU shadow child)
  // ---------------------------------------------------------------------------
  const renderPhotoCard = (
    combo: ComboItem,
    k: number,
    type: 'coffee' | 'bite'
  ) => {
    const imgSrc = type === 'coffee' ? combo.coffeeImg : combo.biteImg;
    const name = type === 'coffee' ? combo.coffeeName : combo.biteName;
    const badgeText = type === 'coffee' ? '01 • DRINK' : '02 • BITE';

    return (
      <div
        key={combo.id}
        ref={(el) => {
          if (type === 'coffee') {
            coffeeCardsRef.current[k] = el;
          } else {
            biteCardsRef.current[k] = el;
          }
        }}
        className={`combo-photo-card ${
          k === activeIndex ? 'is-active is-resting' : ''
        }`}
        aria-hidden={k !== activeIndex ? 'true' : undefined}
      >
        {/* Hardware-accelerated static shadow: animated only via scale/opacity on hover */}
        <div className="combo-card-shadow" aria-hidden="true" />

        {imgSrc ? (
          <div className="combo-photo-wrapper">
            <img
              src={imgSrc}
              alt={name}
              className="combo-real-photo"
              loading="eager"
            />
            <div className="combo-photo-overlay" aria-hidden="true" />
            <div className="combo-photo-badge">{badgeText}</div>
            <div className="combo-photo-label">{name}</div>
          </div>
        ) : (
          <div className="empty-frame-surface">
            <div className="empty-frame-shadow" aria-hidden="true" />
            <div className="empty-frame-grain" aria-hidden="true" />
            <div className="empty-frame-top">
              <span className="empty-frame-badge">{badgeText}</span>
              <span className="empty-frame-ratio">
                {type === 'coffee' ? '4:5' : '1:1'}
              </span>
            </div>
            <div className="empty-frame-bottom">
              <span className="empty-frame-title">{name}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // 8. Render Editorial Text Layer (Masked line reveal inner wrappers)
  // ---------------------------------------------------------------------------
  const renderTextLayer = (combo: ComboItem, k: number) => {
    return (
      <div
        key={combo.id}
        ref={(el) => {
          textLayersRef.current[k] = el;
        }}
        className={`combo-text-layer ${k === activeIndex ? 'is-active' : ''}`}
        aria-hidden={k !== activeIndex ? 'true' : undefined}
      >
        <div className="combo-line-mask">
          <div className="combo-line-inner">
            <span className="combo-num-pill">
              {combo.num} — {combo.tag || 'CURATED PAIRING'}
            </span>
          </div>
        </div>

        <div className="combo-line-mask">
          <div className="combo-line-inner">
            <h3 className="combo-hero-title">{combo.name}</h3>
          </div>
        </div>

        <div className="combo-line-mask">
          <div className="combo-line-inner">
            <div className="combo-pair-line">
              <span>{combo.coffeeName}</span>
              <span className="combo-amp">+</span>
              <span>{combo.biteName}</span>
            </div>
          </div>
        </div>

        <div className="combo-line-mask">
          <div className="combo-line-inner">
            <p className="combo-feeling-quote">“{combo.description}”</p>
          </div>
        </div>

        <div className="combo-line-mask">
          <div className="combo-line-inner">
            <div className="combo-action-row">
              <span className="combo-price">{combo.price}</span>
              <button
                type="button"
                className="combo-pill-btn"
                aria-label={`Order ${combo.name}`}
              >
                <span>PAIRING SPECIAL</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="combos"
      ref={sectionRef}
      className="megtik-combos-section"
      aria-label="MEGTIK Combos People Love"
    >
      {/* Ambient Lighting & Texture Overlay (Static Tabletop) */}
      <div className="combos-ambient-overlay" aria-hidden="true" />

      {/* Continuity Architectural Rule */}
      <div className="combos-continuity-rule" aria-hidden="true" />

      {/* 1. Header Block */}
      <header ref={headerRef} className="combos-header-block">
        <span className="combos-section-label">04 — COMBOS PEOPLE LOVE</span>
        <h2 className="combos-section-title">THE PAIRINGS WE'D RECOMMEND.</h2>
      </header>

      {/* 2. Hero Featured Combo Stage (Invisible Tabletop) */}
      <div
        ref={stageRef}
        className="combos-hero-stage"
        role="region"
        aria-label={`Featured Pairing: ${combos[activeIndex]?.name}`}
      >
        {/* COFFEE PHOTO SLOT (Depth z-index: 4) */}
        <div
          ref={coffeeSlotRef}
          className="combo-photo-slot is-coffee"
          aria-label={`Coffee Pairing: ${combos[activeIndex]?.coffeeName}`}
        >
          {combos.map((combo, k) => renderPhotoCard(combo, k, 'coffee'))}
        </div>

        {/* CENTER EDITORIAL PAIRING DETAILS (Depth z-index: 3) */}
        <div ref={centerContentRef} className="combo-center-content">
          {combos.map((combo, k) => renderTextLayer(combo, k))}
        </div>

        {/* BITE PHOTO SLOT (Depth z-index: 2) */}
        <div
          ref={biteSlotRef}
          className="combo-photo-slot is-bite"
          aria-label={`Bite Pairing: ${combos[activeIndex]?.biteName}`}
        >
          {combos.map((combo, k) => renderPhotoCard(combo, k, 'bite'))}
        </div>
      </div>

      {/* 3. Clickable Editorial Combo Selector */}
      <nav
        ref={navRef}
        className="combos-index-nav"
        aria-label="Select from our curated pairings"
      >
        {/* Traveling Editorial Indicator Line (ScaleX Only) */}
        <div
          ref={travelingLineRef}
          className="combo-traveling-line"
          aria-hidden="true"
        />

        {combos.map((combo, idx) => {
          const isActive = idx === activeIndex;

          return (
            <button
              key={combo.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              type="button"
              className={`combo-nav-card ${isActive ? 'is-active' : ''}`}
              onClick={() => go(idx)}
              aria-pressed={isActive}
              aria-label={`Show combo ${combo.num}: ${combo.name}`}
            >
              <div className="combo-nav-top">
                <span className="combo-nav-num">{combo.num}</span>
                <span className="combo-nav-dot-anchor" aria-hidden="true" />
              </div>
              <span className="combo-nav-name">{combo.name}</span>
              <span className="combo-nav-pair-sub">
                {combo.coffeeName} + {combo.biteName}
              </span>
            </button>
          );
        })}
      </nav>
    </section>
  );
};

export default MegtikCombos;
