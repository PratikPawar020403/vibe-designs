export interface FrameSequenceConfig {
  totalFrames: number;
  framePattern: string; // e.g. '/frames/frame_%03d.webp'
  pinnedDistanceVh: number; // e.g. 350
  aspectRatio: number; // 16 / 9
}

export interface PreloadProgress {
  loadedCount: number;
  totalFrames: number;
  isInitialReady: boolean; // Priority 1 + 2 ready (usable)
  isFullyLoaded: boolean;
  percentage: number;
}

export interface FrameRenderState {
  currentFrame: number;
  progress: number;
}
