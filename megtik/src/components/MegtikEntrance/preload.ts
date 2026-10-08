import { PreloadProgress } from './types';

/**
 * Format frame URL from index and pattern
 * e.g. index 1, pattern '/frames/frame_%03d.webp' -> '/frames/frame_001.webp'
 */
export function formatFrameUrl(index: number, pattern: string = '/frames/frame_%03d.webp'): string {
  if (pattern.includes('%03d')) {
    const num = String(index).padStart(3, '0');
    return pattern.replace('%03d', num);
  }
  if (pattern.includes('%04d')) {
    const num = String(index).padStart(4, '0');
    return pattern.replace('%04d', num);
  }
  return pattern;
}

export class FramePreloader {
  private totalFrames: number;
  private pattern: string;
  private cache: Map<number, HTMLImageElement> = new Map();
  private loadedIndices: Set<number> = new Set();
  private loadingIndices: Set<number> = new Set();
  private isCancelled: boolean = false;
  private onProgressCallback?: (progress: PreloadProgress) => void;
  private onInitialReadyCallback?: () => void;
  private initialReadyFired: boolean = false;

  constructor(
    totalFrames: number,
    pattern: string,
    onProgress?: (progress: PreloadProgress) => void,
    onInitialReady?: () => void
  ) {
    this.totalFrames = totalFrames;
    this.pattern = pattern;
    this.onProgressCallback = onProgress;
    this.onInitialReadyCallback = onInitialReady;
  }

  public getTotalFrames(): number {
    return this.totalFrames;
  }

  public start(): void {
    this.isCancelled = false;
    // Priority 1: Load frame 1 immediately (<100ms hero visual)
    this.loadFrame(1).then(() => {
      if (this.isCancelled) return;
      this.notifyProgress();

      // Priority 2: Preload initial chunk (frames 2 to 32)
      const priority2Chunk: number[] = [];
      const chunkEnd = Math.min(32, this.totalFrames);
      for (let i = 2; i <= chunkEnd; i++) {
        priority2Chunk.push(i);
      }

      Promise.all(priority2Chunk.map((idx) => this.loadFrame(idx))).then(() => {
        if (this.isCancelled) return;
        if (!this.initialReadyFired) {
          this.initialReadyFired = true;
          this.onInitialReadyCallback?.();
        }
        // Priority 3: Progressively preload the remaining sequence
        this.preloadRemaining(chunkEnd + 1);
      });
    });
  }

  public getFrame(index: number): HTMLImageElement | null {
    return this.cache.get(index) || null;
  }

  private loadFrame(index: number): Promise<HTMLImageElement> {
    if (this.cache.has(index)) {
      return Promise.resolve(this.cache.get(index)!);
    }

    if (this.loadingIndices.has(index)) {
      return new Promise((resolve) => {
        const check = () => {
          if (this.cache.has(index)) {
            resolve(this.cache.get(index)!);
          } else {
            setTimeout(check, 25);
          }
        };
        check();
      });
    }

    this.loadingIndices.add(index);
    const img = new Image();
    img.decoding = 'async';

    return new Promise((resolve) => {
      img.onload = () => {
        this.loadingIndices.delete(index);
        this.loadedIndices.add(index);
        this.cache.set(index, img);
        this.notifyProgress();
        resolve(img);
      };
      img.onerror = () => {
        this.loadingIndices.delete(index);
        console.warn(`[FramePreloader] Failed to load frame ${index}: ${formatFrameUrl(index, this.pattern)}`);
        resolve(img);
      };
      img.src = formatFrameUrl(index, this.pattern);
    });
  }

  private async preloadRemaining(startIdx: number): Promise<void> {
    const batchSize = 6;
    for (let i = startIdx; i <= this.totalFrames; i += batchSize) {
      if (this.isCancelled) return;
      const batch: Promise<HTMLImageElement>[] = [];
      for (let j = i; j < i + batchSize && j <= this.totalFrames; j++) {
        batch.push(this.loadFrame(j));
      }
      await Promise.all(batch);
      // Yield thread briefly
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  private notifyProgress(): void {
    if (!this.onProgressCallback) return;
    const loadedCount = this.loadedIndices.size;
    const percentage = Math.round((loadedCount / this.totalFrames) * 100);
    const isInitialReady = this.loadedIndices.has(1) && this.loadedIndices.size >= Math.min(15, this.totalFrames);
    const isFullyLoaded = loadedCount >= this.totalFrames;

    this.onProgressCallback({
      loadedCount,
      totalFrames: this.totalFrames,
      isInitialReady,
      isFullyLoaded,
      percentage,
    });
  }

  /**
   * Get exact frame if loaded, or find nearest available loaded frame
   */
  public getClosestFrame(targetIndex: number): HTMLImageElement | null {
    if (this.cache.has(targetIndex)) {
      return this.cache.get(targetIndex)!;
    }

    let closestIndex = -1;
    let minDiff = Infinity;

    for (const loadedIndex of this.loadedIndices) {
      const diff = Math.abs(loadedIndex - targetIndex);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = loadedIndex;
      }
    }

    if (closestIndex !== -1 && this.cache.has(closestIndex)) {
      return this.cache.get(closestIndex)!;
    }

    return null;
  }

  public getLoadedCount(): number {
    return this.loadedIndices.size;
  }

  public cancel(): void {
    this.isCancelled = true;
    this.cache.clear();
    this.loadedIndices.clear();
    this.loadingIndices.clear();
  }
}
