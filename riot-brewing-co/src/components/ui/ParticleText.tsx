"use client";

import { useEffect, useRef, type CSSProperties } from 'react';
import './ParticleText.css';

export interface ParticleTextLine {
  text: string;
  color?: string;
}

export interface ParticleTextProps {
  text?: string;
  lines?: ParticleTextLine[];
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: 'mount' | 'hover' | 'click';
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
}

type Rgb = { r: number; g: number; b: number };
type Target = { x: number; y: number; alpha: number; color?: string };
type Particle = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  seed: number;
  depth: number;
  delay: number;
};

const hexToRgb = (hex: string): Rgb | null => {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
};

const mixRgb = (from: Rgb, to: Rgb, amount: number): Rgb => ({
  r: Math.round(from.r + (to.r - from.r) * amount),
  g: Math.round(from.g + (to.g - from.g) * amount),
  b: Math.round(from.b + (to.b - from.b) * amount)
});

const rgbToCss = (rgb: Rgb): string => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

// Resolves font family without invalid CSS var() tokens that break canvas 2D contexts
const resolveCanvasFontFamily = (family: string, container: HTMLElement): string => {
  if (typeof window === 'undefined') return '"Space Grotesk", sans-serif';

  try {
    const probe = document.createElement('span');
    probe.style.fontFamily = family === 'inherit' ? 'inherit' : family;
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    container.appendChild(probe);
    const computed = window.getComputedStyle(probe).fontFamily;
    probe.remove();

    if (computed && !computed.includes('var(')) {
      return `${computed}, "Space Grotesk", Impact, "Arial Black", sans-serif`;
    }
  } catch {}

  return '"Space Grotesk", Impact, "Arial Black", sans-serif';
};

const resolveFontSize = (
  value: number | string,
  container: HTMLDivElement,
  fontWeight: number | string,
  fontFamily: string
): number => {
  if (typeof value === 'number') return value;

  const probe = document.createElement('span');
  probe.textContent = 'M';
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.fontSize = value;
  probe.style.fontWeight = String(fontWeight);
  probe.style.fontFamily = fontFamily;
  container.appendChild(probe);
  const computed = window.getComputedStyle(probe).fontSize;
  probe.remove();
  const size = parseFloat(computed) || 96;
  return Math.max(36, size);
};

const waitForFonts = async (font: string): Promise<void> => {
  if (typeof document === 'undefined' || !('fonts' in document)) return;

  try {
    await document.fonts.load(font);
  } catch {}

};

export const ParticleText = ({
  text = 'React Bits',
  lines,
  particleSize = 2.4,
  density = 2.8,
  color = '#0a0a0a',
  highlightColor = '#ff007f',
  scatter = 130,
  gatherDuration = 850,
  stagger = 200,
  pointerRepel = 55,
  repelRadius = 120,
  idleDrift = 0.35,
  trigger = 'mount',
  fontSize = 'clamp(3.5rem, 8vw, 7rem)',
  fontWeight = 900,
  fontFamily = 'inherit',
  glow = false,
  className = '',
  style
}: ParticleTextProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let particles: Particle[] = [];
    let animationFrame: number | null = null;
    let resizeFrame: number | null = null;
    let buildId = 0;
    let gathering = false;
    let gatherStart = 0;
    let reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isIntersecting = true;

    const pointer = {
      active: false,
      x: 0,
      y: 0,
      smoothX: 0,
      smoothY: 0
    };

    const startGather = (fromScatter = true): void => {
      if (!particles.length) return;

      const now = performance.now();
      const spread = reducedMotion ? 0 : scatter;

      particles.forEach(particle => {
        if (fromScatter) {
          const angle = particle.seed * Math.PI * 2;
          const distance = spread * (0.35 + particle.depth * 0.75);
          particle.x = particle.targetX + Math.cos(angle) * distance + (particle.depth - 0.5) * spread * 0.55;
          particle.y = particle.targetY + Math.sin(angle) * distance + (particle.seed - 0.5) * spread * 0.55;
        }

        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.delay = reducedMotion ? 0 : particle.seed * stagger;
      });

      gatherStart = now;
      gathering = true;
    };

    const drawParticle = (particle: Particle): void => {
      const size = particle.size;
      ctx.fillStyle = particle.color;

      if (size <= 2.2) {
        ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
        return;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = (now: number): void => {
      ctx.clearRect(0, 0, width, height);

      if (glow && !reducedMotion) {
        ctx.shadowBlur = Math.min(8, particleSize * 2.5);
        ctx.shadowColor = highlightColor;
      } else {
        ctx.shadowBlur = 0;
      }

      pointer.smoothX += (pointer.x - pointer.smoothX) * 0.45;
      pointer.smoothY += (pointer.y - pointer.smoothY) * 0.45;

      let complete = true;

      particles.forEach(particle => {
        let baseX = particle.targetX;
        let baseY = particle.targetY;
        let progress = 1;

        if (gathering) {
          const local = (now - gatherStart - particle.delay) / Math.max(1, reducedMotion ? 1 : gatherDuration);
          progress = clamp(local, 0, 1);
          const eased = easeOutCubic(progress);
          baseX = particle.startX + (particle.targetX - particle.startX) * eased;
          baseY = particle.startY + (particle.targetY - particle.startY) * eased;
          if (progress < 1) complete = false;
        } else if (!reducedMotion && idleDrift > 0) {
          const driftTime = now * 0.001;
          baseX += Math.sin(driftTime * 0.9 + particle.seed * 10) * idleDrift * particle.depth;
          baseY += Math.cos(driftTime * 0.75 + particle.depth * 10) * idleDrift * particle.depth;
        }

        if (pointer.active && !reducedMotion && pointerRepel > 0 && repelRadius > 0) {
          const dx = baseX - pointer.smoothX;
          const dy = baseY - pointer.smoothY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < repelRadius) {
            const force = Math.pow(1 - distance / repelRadius, 2) * pointerRepel;
            baseX += (dx / distance) * force;
            baseY += (dy / distance) * force;
          }
        }

        const follow = reducedMotion ? 1 : 0.55;
        particle.x += (baseX - particle.x) * follow;
        particle.y += (baseY - particle.y) * follow;

        ctx.globalAlpha = clamp(0.35 + progress * 0.65, 0, 1);
        drawParticle(particle);
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (gathering && complete) {
        gathering = false;
      }

      if (isIntersecting) {
        animationFrame = window.requestAnimationFrame(render);
      } else {
        animationFrame = null;
      }
    };

    const ensureRenderLoop = (): void => {
      if (animationFrame === null && isIntersecting) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const sampleText = async (): Promise<void> => {
      const currentBuild = ++buildId;
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      if (width <= 0 || height <= 0) return;

      const isMobile = width < 768;
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const resolvedFamily = resolveCanvasFontFamily(fontFamily, container);
      let resolvedSize = resolveFontSize(fontSize, container, fontWeight, resolvedFamily);
      let font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;

      await waitForFonts(font);
      if (currentBuild !== buildId) return;

      // Parse lines: if lines array provided, use it; otherwise split text by newline
      const parsedLines: ParticleTextLine[] = lines && lines.length > 0
        ? lines
        : String(text || ' ').split('\n').map(l => ({ text: l.trim() }));

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      // Fit font size to container boundaries
      const maxTextWidth = width * 0.90;
      const maxTextHeight = height * 0.82;

      // Set offscreen font for measurement
      offscreen.width = 100;
      offscreen.height = 100;
      offCtx.font = font;

      let widestLineWidth = 1;
      for (const line of parsedLines) {
        const m = offCtx.measureText(line.text);
        if (m.width > widestLineWidth) widestLineWidth = m.width;
      }

      const estimatedLineHeight = resolvedSize * 0.88;
      const totalEstimatedHeight = parsedLines.length * estimatedLineHeight;

      if (widestLineWidth > maxTextWidth || totalEstimatedHeight > maxTextHeight) {
        const scaleW = maxTextWidth / widestLineWidth;
        const scaleH = maxTextHeight / totalEstimatedHeight;
        const scale = Math.min(scaleW, scaleH);
        resolvedSize = Math.max(32, Math.floor(resolvedSize * scale));
        font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;
        await waitForFonts(font);
        if (currentBuild !== buildId) return;
      }

      const lineHeight = resolvedSize * 0.88;
      const ascent = Math.ceil(resolvedSize * 0.78);
      const padding = Math.max(20, Math.ceil(resolvedSize * 0.15));

      // Re-measure with final scaled font
      offscreen.width = 100;
      offscreen.height = 100;
      offCtx.font = font;

      widestLineWidth = 1;
      for (const line of parsedLines) {
        const m = offCtx.measureText(line.text);
        if (m.width > widestLineWidth) widestLineWidth = m.width;
      }

      const totalCanvasWidth = Math.ceil(widestLineWidth) + padding * 2;
      const totalCanvasHeight = Math.ceil(parsedLines.length * lineHeight) + padding * 2;

      // Crucial: Changing canvas dimensions resets canvas context state
      offscreen.width = totalCanvasWidth;
      offscreen.height = totalCanvasHeight;

      // Re-apply context properties AFTER setting width/height
      offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
      offCtx.font = font;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'alphabetic';

      // Draw each line centered horizontally in its specified color
      parsedLines.forEach((line, idx) => {
        offCtx.fillStyle = line.color || color;
        const yPos = padding + ascent + idx * lineHeight;
        offCtx.fillText(line.text, totalCanvasWidth / 2, yPos);
      });

      const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
      const targets: Target[] = [];
      const step = Math.max(2, Math.floor(density));

      const offsetX = Math.floor(width / 2 - offscreen.width / 2);
      const offsetY = Math.floor(height / 2 - offscreen.height / 2);

      for (let y = 0; y < offscreen.height; y += step) {
        for (let x = 0; x < offscreen.width; x += step) {
          const idx = (y * offscreen.width + x) * 4;
          const alpha = imageData.data[idx + 3];
          if (alpha > 40) {
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            targets.push({
              x: offsetX + x,
              y: offsetY + y,
              alpha: alpha / 255,
              color: `rgb(${r}, ${g}, ${b})`
            });
          }
        }
      }

      const maxParticles = isMobile
        ? Math.min(480, Math.max(240, Math.floor((width * height) / 140)))
        : Math.max(1200, Math.min(4200, Math.floor((width * height) / 85)));
      const stride = Math.max(1, Math.ceil(targets.length / maxParticles));
      const selected = targets.filter((_, index) => index % stride === 0);

      particles = selected.map((target, index) => {
        const seed = ((index * 9301 + 49297) % 233280) / 233280;
        const depth = 0.45 + (((index * 233 + 97) % 1000) / 1000) * 0.9;
        const particleColor = target.color || color;

        const angle = seed * Math.PI * 2;
        const distance = (reducedMotion ? 0 : scatter) * (0.35 + depth * 0.75);
        const startX = target.x + Math.cos(angle) * distance + (seed - 0.5) * scatter * 0.45;
        const startY = target.y + Math.sin(angle) * distance + (depth - 0.9) * scatter * 0.45;

        return {
          x: reducedMotion ? target.x : startX,
          y: reducedMotion ? target.y : startY,
          startX: reducedMotion ? target.x : startX,
          startY: reducedMotion ? target.y : startY,
          targetX: target.x,
          targetY: target.y,
          size: Math.max(1.2, particleSize * (0.8 + target.alpha * 0.4)),
          color: particleColor,
          seed,
          depth,
          delay: seed * stagger
        };
      });

      pointer.x = width / 2;
      pointer.y = height / 2;
      pointer.smoothX = pointer.x;
      pointer.smoothY = pointer.y;

      if (reducedMotion) {
        particles.forEach(particle => {
          particle.x = particle.targetX;
          particle.y = particle.targetY;
        });
        gathering = false;
      } else {
        startGather(false);
      }

      ensureRenderLoop();
    };

    let lastW = 0;
    let lastH = 0;
    const queueSample = (): void => {
      const rect = container.getBoundingClientRect();
      const curW = Math.floor(rect.width);
      const curH = Math.floor(rect.height);
      if (Math.abs(curW - lastW) > 10 || Math.abs(curH - lastH) > 10) {
        lastW = curW;
        lastH = curH;
        if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(sampleText);
      }
    };

    const handlePointerMove = (event: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = (): void => {
      pointer.active = false;
    };

    const handlePointerEnter = (event: PointerEvent): void => {
      handlePointerMove(event);
      if (trigger === 'hover') startGather(true);
    };

    const handleClick = (): void => {
      if (trigger === 'click') startGather(true);
    };

    const handleTouchStart = (event: TouchEvent): void => {
      const touch = event.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = touch.clientX - rect.left;
      pointer.y = touch.clientY - rect.top;
      pointer.active = true;
      if (trigger === 'hover' || trigger === 'click') startGather(true);
    };

    const handleTouchMove = (event: TouchEvent): void => {
      const touch = event.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = touch.clientX - rect.left;
      pointer.y = touch.clientY - rect.top;
      pointer.active = true;
    };

    const handleTouchEnd = (): void => {
      pointer.active = false;
    };

    const reduceMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handleReduceMotionChange = (event: MediaQueryListEvent): void => {
      reducedMotion = event.matches;
      void sampleText();
    };

    reduceMotionQuery?.addEventListener('change', handleReduceMotionChange);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    const resizeObserver = new ResizeObserver(queueSample);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          ensureRenderLoop();
        } else if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }
    }, { threshold: 0.05 });
    intersectionObserver.observe(container);

    void sampleText();

    return () => {
      buildId += 1;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      reduceMotionQuery?.removeEventListener('change', handleReduceMotionChange);
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);

      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
    };
  }, [
    text,
    lines,
    particleSize,
    density,
    color,
    highlightColor,
    scatter,
    gatherDuration,
    stagger,
    pointerRepel,
    repelRadius,
    idleDrift,
    trigger,
    fontSize,
    fontWeight,
    fontFamily,
    glow
  ]);

  const accessibleText = lines && lines.length > 0
    ? lines.map(l => l.text).join(' ')
    : text;

  return (
    <div ref={containerRef} className={`particle-text ${className}`} style={style} aria-label={accessibleText}>
      <canvas ref={canvasRef} className="particle-text__canvas" aria-hidden="true" />
      <span className="particle-text__sr">{accessibleText}</span>
    </div>
  );
};

export default ParticleText;
