'use strict';

window.initScrollEngine = function() {
  const scrollSection = document.querySelector('.labelit-scroll');
  const stickyStage = document.querySelector('.labelit-sticky-stage');
  const bottleContainer = document.querySelector('.labelit-bottle-container');
  const canvas = document.querySelector('.labelit-bottle-canvas');
  
  if (!scrollSection || !stickyStage || !bottleContainer || !canvas) return;
  
  const ctx = canvas.getContext('2d');
  const TOTAL_FRAMES = 120;
  const frames = [];
  let loadedCount = 0;
  let allLoaded = false;
  
  // Precomputed bottle horizontal centers inside 1280x720 source frames (0 to 119)
  const BOTTLE_CENTERS = [
    937.0, 937.0, 937.0, 937.0, 937.0, 937.0, 937.0, 937.0, 937.0, 937.0,
    937.0, 937.0, 937.0, 936.5, 936.0, 934.0, 931.5, 927.5, 923.0, 917.0,
    910.0, 902.0, 893.0, 883.0, 872.5, 861.5, 849.5, 837.5, 824.0, 810.5,
    796.5, 782.5, 767.5, 753.5, 737.5, 722.5, 707.5, 692.5, 676.5, 661.5,
    645.5, 630.5, 615.5, 600.5, 585.5, 570.5, 555.5, 541.0, 540.5, 538.5,
    530.0, 522.5, 501.5, 472.5, 448.0, 426.5, 399.0, 384.5, 367.0, 352.5,
    338.0, 325.0, 312.5, 301.5, 299.0, 290.0, 276.5, 277.5, 273.5, 271.0,
    270.0, 269.5, 269.5, 269.5, 269.0, 270.0, 272.5, 279.5, 289.5, 303.0,
    320.0, 321.0, 360.5, 385.5, 391.0, 419.5, 450.0, 481.0, 513.0, 547.0,
    581.0, 615.0, 649.5, 683.0, 716.0, 747.5, 777.5, 805.5, 831.0, 854.5,
    875.5, 894.5, 909.0, 921.0, 930.0, 934.5, 936.5, 936.5, 936.0, 936.0,
    936.0, 936.0, 936.0, 936.0, 936.0, 936.0, 936.0, 936.0, 936.5, 936.5
  ];
  
  // Helper
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
  
  // Detect mobile
  let isMobile = window.innerWidth < 768;
  
  // Preload all 120 frames
  const framePromises = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    const padded = String(i).padStart(3, '0');
    img.src = `assets/frames/frame_${padded}.jpg`;
    frames[i] = img;
    framePromises.push(new Promise((resolve) => {
      img.onload = () => {
        loadedCount++;
        window.dispatchEvent(new CustomEvent('frameProgress', { detail: { loaded: loadedCount, total: TOTAL_FRAMES }}));
        resolve();
      };
      img.onerror = resolve; // Don't block on errors
    }));
  }
  
  Promise.all(framePromises).then(() => {
    allLoaded = true;
    window.dispatchEvent(new CustomEvent('framesReady'));
    drawFrame(0);
  });
  
  let currentBottleScreenX = window.innerWidth / 2;

  // Draw frame on canvas
  function drawFrame(index) {
    const idx = clamp(Math.round(index), 0, TOTAL_FRAMES - 1);
    const img = frames[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (isMobile) {
      // Mobile portrait-friendly framing:
      // Dynamic per-frame crop centered on the bottle's CURRENT horizontal position
      const bottleCenter = BOTTLE_CENTERS[idx] || 640;
      const sHeight = 720;
      const sWidth = Math.min(1280, Math.round(sHeight * (canvas.width / canvas.height)));
      const sx = clamp(bottleCenter - sWidth / 2, 0, 1280 - sWidth);
      ctx.drawImage(img, sx, 0, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

      // Dynamically track bottle's CURRENT rendered horizontal center in viewport coordinates
      const bottleInCrop = bottleCenter - sx;
      currentBottleScreenX = (bottleInCrop / sWidth) * window.innerWidth;
    } else {
      // Desktop: preserve original 16:9 composition completely
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }
  
  // ============================================================
  // SAFE VIEWPORT & BOTTLE FRAMING CONSTRAINT
  // ============================================================
  function updateSafeDimensions() {
    isMobile = window.innerWidth < 768;
    const nav = document.querySelector('.nav');
    const navHeight = nav ? nav.offsetHeight : 72;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    
    const orbitContainer = document.querySelector('.orbit-badges');
    
    if (isMobile) {
      // MOBILE PORTRAIT-FRIENDLY VISUAL FRAME
      // Target: bottle height roughly 45-50% of viewport height (approx 360-420px)
      // Since bottle is 590/720 (81.9%) of frame height,
      // canvas display height should be: targetBottleHeight / (590 / 720)
      const targetBottleHeight = clamp(vh * 0.46, 320, 420);
      const canvasDisplayH = Math.round(targetBottleHeight / (590 / 720)); // ~390px - 512px
      const canvasDisplayW = vw; // Full width of mobile screen
      
      // Set canvas drawing buffer resolution
      canvas.height = 720;
      canvas.width = Math.round(720 * (canvasDisplayW / canvasDisplayH));
      
      // Style canvas element
      canvas.style.width = '100%';
      canvas.style.height = `${canvasDisplayH}px`;
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = `${canvasDisplayH}px`;
      canvas.style.aspectRatio = `${canvasDisplayW} / ${canvasDisplayH}`;

      if (orbitContainer) {
        const bottomOffset = clamp(vh * 0.06, 40, 64);
        const bottleCenterY = Math.round(bottomOffset + canvasDisplayH * 0.5);
        orbitContainer.style.top = 'auto';
        orbitContainer.style.bottom = `${bottleCenterY}px`;
        orbitContainer.style.left = `${Math.round(currentBottleScreenX)}px`;
        orbitContainer.style.transform = 'translate(-50%, 0)';
      }
    } else {
      if (orbitContainer) {
        orbitContainer.style.top = '50%';
        orbitContainer.style.bottom = 'auto';
        orbitContainer.style.left = '50%';
        orbitContainer.style.transform = 'translate(-50%, -50%)';
      }

      // DESKTOP: Native 16:9 widescreen composition (UNTOUCHED!)
      canvas.width = 1280;
      canvas.height = 720;
      
      const safePadding = 18; // Breathing room padding in pixels
      const safeTop = navHeight + safePadding;
      const safeBottom = vh - safePadding;
      const maxSafeHeight = Math.max(120, safeBottom - safeTop);
      const maxSafeWidth = Math.max(120, vw - safePadding * 2);
      
      // Fit 16:9 native canvas inside safe region
      let canvasH = maxSafeHeight;
      let canvasW = canvasH * (16 / 9);
      
      if (canvasW > maxSafeWidth) {
        canvasW = maxSafeWidth;
        canvasH = canvasW * (9 / 16);
      }
      
      canvas.style.width = `${Math.round(canvasW)}px`;
      canvas.style.height = `${Math.round(canvasH)}px`;
      canvas.style.maxWidth = `${Math.round(maxSafeWidth)}px`;
      canvas.style.maxHeight = `${Math.round(maxSafeHeight)}px`;
      canvas.style.aspectRatio = '16 / 9';
    }
  }
  
  window.addEventListener('resize', () => {
    updateSafeDimensions();
    if (allLoaded) {
      drawFrame(currentFrame);
    }
  }, { passive: true });
  updateSafeDimensions();
  
  // ============================================================
  // PHASE ELEMENTS & SYNCHRONIZATION
  // ============================================================
  const phaseElements = {
    hero: document.querySelector('.phase--hero'),
    p01: document.querySelector('.phase--01'),
    p02: document.querySelector('.phase--02'),
    p03: document.querySelector('.phase--03')
  };
  
  function setPhaseState(el, opacity) {
    if (!el) return;
    const op = clamp(opacity, 0, 1);
    el.style.opacity = op;
    el.style.visibility = op > 0.01 ? 'visible' : 'hidden';
    el.style.pointerEvents = op > 0.15 ? 'auto' : 'none';
    el.classList.toggle('is-active', op > 0.1);
  }
  
  function updatePhases(prog) {
    if (isMobile) {
      // MOBILE: Clean sequential transitions in the shared Top Zone (no cross-fade text overlap)
      // Hero (0.00 - 0.07)
      let heroOp = 0;
      if (prog <= 0.03) {
        heroOp = 1.0;
      } else if (prog <= 0.07) {
        heroOp = 1.0 - (prog - 0.03) / 0.04;
      }
      setPhaseState(phaseElements.hero, heroOp);
      
      // Stage 1: Blank Canvas (0.07 - 0.31)
      let p01Op = 0;
      if (prog >= 0.07 && prog <= 0.31) {
        if (prog < 0.11) {
          p01Op = (prog - 0.07) / 0.04;
        } else if (prog <= 0.27) {
          p01Op = 1.0;
        } else {
          p01Op = 1.0 - (prog - 0.27) / 0.04;
        }
      }
      setPhaseState(phaseElements.p01, p01Op);
      
      // Stage 2: Apply Identity (0.32 - 0.65)
      let p02Op = 0;
      if (prog >= 0.32 && prog <= 0.65) {
        if (prog < 0.36) {
          p02Op = (prog - 0.32) / 0.04;
        } else if (prog <= 0.61) {
          p02Op = 1.0;
        } else {
          p02Op = 1.0 - (prog - 0.61) / 0.04;
        }
      }
      setPhaseState(phaseElements.p02, p02Op);
      
      // Stage 3: Ready To Be Seen (0.66 - 1.00)
      let p03Op = 0;
      if (prog >= 0.66) {
        if (prog <= 0.70) {
          p03Op = (prog - 0.66) / 0.04;
        } else {
          p03Op = 1.0;
        }
      }
      setPhaseState(phaseElements.p03, p03Op);
    } else {
      // DESKTOP: Original staggered cross-fade (UNTOUCHED!)
      // Phase 0: Hero (0.00 - 0.08)
      let heroOp = 0;
      if (prog <= 0.03) {
        heroOp = 1.0;
      } else if (prog <= 0.08) {
        heroOp = 1.0 - (prog - 0.03) / 0.05;
      }
      setPhaseState(phaseElements.hero, heroOp);
      
      // Stage 1: Blank Canvas (0.00 - 0.33)
      let p01Op = 0;
      if (prog >= 0.03 && prog <= 0.36) {
        if (prog < 0.08) {
          p01Op = (prog - 0.03) / 0.05;
        } else if (prog <= 0.30) {
          p01Op = 1.0;
        } else {
          p01Op = 1.0 - (prog - 0.30) / 0.06;
        }
      }
      setPhaseState(phaseElements.p01, p01Op);
      
      // Stage 2: Apply Identity / Labeling in Progress (0.33 - 0.66)
      let p02Op = 0;
      if (prog >= 0.30 && prog <= 0.69) {
        if (prog < 0.36) {
          p02Op = (prog - 0.30) / 0.06;
        } else if (prog <= 0.63) {
          p02Op = 1.0;
        } else {
          p02Op = 1.0 - (prog - 0.63) / 0.06;
        }
      }
      setPhaseState(phaseElements.p02, p02Op);
      
      // Stage 3: Ready To Be Seen / Finished Product (0.66 - 1.00)
      let p03Op = 0;
      if (prog >= 0.63) {
        if (prog <= 0.69) {
          p03Op = (prog - 0.63) / 0.06;
        } else {
          p03Op = 1.0;
        }
      }
      setPhaseState(phaseElements.p03, p03Op);
    }
  }
  
  // ============================================================
  // ORBIT BADGES (Active during Stage 2 labeling process)
  // ============================================================
  const orbitBadges = document.querySelectorAll('.orbit-badge');
  function updateOrbitBadges(prog) {
    const badgeStart = 0.30;
    const badgeFullIn = 0.36;
    const badgeFadeStart = 0.63;
    const badgeEnd = 0.69;
    
    let baseOpacity = 0;
    if (prog >= badgeStart && prog <= badgeEnd) {
      if (prog < badgeFullIn) {
        baseOpacity = (prog - badgeStart) / (badgeFullIn - badgeStart);
      } else if (prog > badgeFadeStart) {
        baseOpacity = 1 - (prog - badgeFadeStart) / (badgeEnd - badgeFadeStart);
      } else {
        baseOpacity = 1;
      }
    }
    
    if (isMobile) {
      // MOBILE: Dynamic positioning relative to bottle's CURRENT rendered center
      // Preferred arrangement:
      //      [24K FOIL] (idx 3)    [±0.1mm] (idx 0)
      //               BOTTLE
      //      [ZERO BUBBLE] (idx 2) [99.98%] (idx 1)
      const mobileOffsets = [
        { x:  125, y: -45 }, // Badge 0: ±0.1mm (Top Right)
        { x:  125, y:  65 }, // Badge 1: 99.98% (Bottom Right)
        { x: -125, y:  65 }, // Badge 2: Zero Bubble (Bottom Left)
        { x: -125, y: -45 }  // Badge 3: 24K Foil (Top Left)
      ];
      
      const orbitContainer = document.querySelector('.orbit-badges');
      if (orbitContainer) {
        orbitContainer.style.left = `${Math.round(currentBottleScreenX)}px`;
      }
      
      const floatPhase = (prog - badgeStart) * 4;
      
      orbitBadges.forEach((badge, i) => {
        const offset = mobileOffsets[i] || { x: 0, y: 0 };
        const floatY = Math.sin(floatPhase + i * 1.5) * 4;
        const bx = offset.x;
        const by = offset.y + floatY;
        
        badge.style.opacity = clamp(baseOpacity, 0, 1);
        badge.style.visibility = baseOpacity > 0.01 ? 'visible' : 'hidden';
        badge.style.transform = `translate(calc(-50% + ${bx}px), calc(-50% + ${by}px)) scale(${0.88 + baseOpacity * 0.12})`;
      });
    } else {
      // DESKTOP: Original 200px orbital rotation around center (UNTOUCHED!)
      orbitBadges.forEach((badge, i) => {
        const radius = 200;
        const baseAngle = (i * 90) - 45;
        const scrollRotation = (prog - badgeStart) * 180;
        const orbitAngle = baseAngle + scrollRotation;
        
        const rad = orbitAngle * (Math.PI / 180);
        const bx = Math.cos(rad) * radius;
        const by = Math.sin(rad) * radius;
        
        badge.style.opacity = clamp(baseOpacity, 0, 1);
        badge.style.visibility = baseOpacity > 0.01 ? 'visible' : 'hidden';
        badge.style.transform = `translate(${bx}px, ${by}px) scale(${0.85 + baseOpacity * 0.15})`;
      });
    }
  }
  
  // ============================================================
  // TRANSFORMATION COUNTER (0% -> 100% in Stage 2)
  // ============================================================
  const counterValue = document.querySelector('[data-counter]');
  const counterBarFill = document.querySelector('.counter-bar-fill');
  const transformCounter = document.querySelector('.transform-counter');
  
  function updateCounter(prog) {
    if (!counterValue || !transformCounter) return;
    
    const counterStart = 0.28;
    const counterFullIn = 0.34;
    const counterFadeStart = 0.88;
    const counterEnd = 0.96;
    
    let opacity = 0;
    if (prog >= counterStart && prog <= counterEnd) {
      if (prog < counterFullIn) {
        opacity = (prog - counterStart) / (counterFullIn - counterStart);
      } else if (prog > counterFadeStart) {
        opacity = 1 - (prog - counterFadeStart) / (counterEnd - counterFadeStart);
      } else {
        opacity = 1;
      }
    }
    
    transformCounter.style.opacity = clamp(opacity, 0, 1);
    transformCounter.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
    
    let percent = 0;
    if (prog <= 0.33) {
      percent = 0;
    } else if (prog >= 0.66) {
      percent = 100;
    } else {
      percent = Math.round(((prog - 0.33) / (0.66 - 0.33)) * 100);
    }
    percent = clamp(percent, 0, 100);
    counterValue.textContent = String(percent).padStart(3, '0');
    
    if (counterBarFill) {
      counterBarFill.style.width = percent + '%';
    }
  }
  
  // ============================================================
  // MASTER RENDER LOOP
  // ============================================================
  let currentFrame = 0;
  let running = true;
  let isVisible = true;
  let rafId = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && running && !rafId) {
        rafId = requestAnimationFrame(render);
      }
    });
  }, { rootMargin: '150px 0px 150px 0px' });
  observer.observe(scrollSection);

  function render() {
    rafId = null;
    if (!running || !isVisible) return;
    
    // Calculate ONE single normalized master progress: 0.0 -> 1.0
    const rect = scrollSection.getBoundingClientRect();
    const scrollHeight = scrollSection.offsetHeight - window.innerHeight;
    
    let progress = 0;
    if (scrollHeight > 0) {
      progress = clamp(-rect.top / scrollHeight, 0, 1);
    }
    
    // Deterministic frame mapping across all 120 frames (0 to 119)
    const targetFrame = clamp(Math.round(progress * (TOTAL_FRAMES - 1)), 0, TOTAL_FRAMES - 1);
    
    // Smooth interpolation for fluid scrubbing in both forward and backward scroll
    if (prefersReducedMotion) {
      currentFrame = targetFrame;
    } else {
      currentFrame += (targetFrame - currentFrame) * 0.2;
    }
    
    if (allLoaded) {
      drawFrame(currentFrame);
    }
    
    // Container positioning: desktop uses translate(-50%, -50%); mobile uses CSS bottom layout
    if (isMobile) {
      bottleContainer.style.transform = 'none';
    } else {
      bottleContainer.style.transform = 'translate(-50%, -50%)';
    }
    
    // Update narrative phases based on master progress
    updatePhases(progress);
    
    // Update orbit badges based on master progress
    updateOrbitBadges(progress);
    
    // Update transformation counter based on master progress
    updateCounter(progress);
    
    if (isVisible && running) {
      rafId = requestAnimationFrame(render);
    }
  }
  
  rafId = requestAnimationFrame(render);
  
  return () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    observer.disconnect();
  };
};
