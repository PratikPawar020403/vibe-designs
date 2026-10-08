import { FramePreloader } from './preload';

export interface CanvasDimensions {
  displayWidth: number;
  displayHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  dpr: number;
}

export class FrameCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastRenderedIndexA: number = -1;
  private lastRenderedIndexB: number = -1;
  private lastRenderedAlpha: number = 0;
  private lastRenderedImage: HTMLImageElement | null = null;
  private currentDpr: number = 1;

  public getDpr(): number {
    return this.currentDpr;
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!context) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Resize canvas buffer to match physical device pixels (High-DPI support, clamped to 2)
   */
  public resize(): CanvasDimensions {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.currentDpr = dpr;

    const displayWidth = Math.round(rect.width);
    const displayHeight = Math.round(rect.height);
    const pixelWidth = Math.round(displayWidth * dpr);
    const pixelHeight = Math.round(displayHeight * dpr);

    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }

    if (this.lastRenderedImage) {
      this.drawImageCover(this.lastRenderedImage);
    }

    return { displayWidth, displayHeight, pixelWidth, pixelHeight, dpr };
  }

  /**
   * Draw image with exact object-fit: cover equivalent logic, keeping architecture centered
   */
  public drawImageCover(img: HTMLImageElement): void {
    if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
      return;
    }

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    if (cw === 0 || ch === 0) return;

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const canvasAspect = cw / ch;
    const imgAspect = nw / nh;

    let sx = 0;
    let sy = 0;
    let sWidth = nw;
    let sHeight = nh;

    // Focal point: center horizontally (0.5), subtle vertical entrance focal bias (0.48)
    const focalX = 0.5;
    const focalY = 0.48;

    if (canvasAspect > imgAspect) {
      // Widescreen viewport: crop top/bottom evenly
      sWidth = nw;
      sHeight = nw / canvasAspect;
      sx = 0;
      sy = Math.max(0, Math.min(nh - sHeight, (nh - sHeight) * focalY));
    } else {
      // Portrait / mobile viewport: crop left/right evenly, entrance remains locked center
      sHeight = nh;
      sWidth = nh * canvasAspect;
      sy = 0;
      sx = Math.max(0, Math.min(nw - sWidth, (nw - sWidth) * focalX));
    }

    this.ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, cw, ch);
  }

  /**
   * Render continuous sub-frame interpolated camera motion
   * Seamlessly blends between frameA and frameB to eliminate any spatial jumping
   */
  public renderInterpolated(frameFloat: number, preloader: FramePreloader): boolean {
    const total = preloader.getTotalFrames();
    const clampedFloat = Math.max(1, Math.min(total, frameFloat));

    const frameA = Math.floor(clampedFloat);
    const frameB = Math.min(total, frameA + 1);
    const alpha = clampedFloat - frameA;

    // If practically on a keyframe or last frame, draw single frame directly
    if (alpha < 0.05 || frameA === frameB) {
      if (this.lastRenderedIndexA === frameA && this.lastRenderedAlpha === 0) {
        return true;
      }
      const imgA = preloader.getClosestFrame(frameA);
      if (!imgA) return false;

      this.ctx.globalAlpha = 1.0;
      this.drawImageCover(imgA);
      this.lastRenderedImage = imgA;
      this.lastRenderedIndexA = frameA;
      this.lastRenderedIndexB = frameA;
      this.lastRenderedAlpha = 0;
      return true;
    }

    // Sub-frame crossfade between adjacent frames
    if (
      this.lastRenderedIndexA === frameA &&
      this.lastRenderedIndexB === frameB &&
      Math.abs(this.lastRenderedAlpha - alpha) < 0.01
    ) {
      return true;
    }

    const imgA = preloader.getClosestFrame(frameA);
    const imgB = preloader.getFrame(frameB) || preloader.getClosestFrame(frameB);

    if (!imgA) return false;

    // Draw base frame A
    this.ctx.globalAlpha = 1.0;
    this.drawImageCover(imgA);
    this.lastRenderedImage = imgA;

    // Blend frame B on top if available
    if (imgB && imgB !== imgA) {
      this.ctx.globalAlpha = alpha;
      this.drawImageCover(imgB);
      this.ctx.globalAlpha = 1.0;
    }

    this.lastRenderedIndexA = frameA;
    this.lastRenderedIndexB = frameB;
    this.lastRenderedAlpha = alpha;
    return true;
  }

  /**
   * Render a discrete frame index
   */
  public renderFrame(frameIndex: number, preloader: FramePreloader): boolean {
    return this.renderInterpolated(frameIndex, preloader);
  }

  public clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.lastRenderedIndexA = -1;
    this.lastRenderedIndexB = -1;
    this.lastRenderedAlpha = 0;
    this.lastRenderedImage = null;
  }
}
