export type SlotConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type FrameDecoration = {
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type FrameBackground =
  | { color: string }
  | { image: string };

export type FrameConfig = {
  id: string;
  name: string;
  thumbnail: string;
  overlay: string;
  output: { width: number; height: number };
  slots: SlotConfig[];
  background?: FrameBackground;
  decorations?: FrameDecoration[];
  revealAnimation?: 'polaroid-develop' | 'strip-print' | 'fade-in' | string;
  className?: string;
};

export type SlotTransform = {
  offsetX: number;
  offsetY: number;
  scale: number;
};

export type SlotImage = {
  image: HTMLImageElement;
  sourceUrl: string;
  transform: SlotTransform;
};

export type AppStep = 'home' | 'capture' | 'adjust' | 'preview' | 'gallery';

export type AppState = {
  step: AppStep;
  frameId: string | null;
  slotImages: (SlotImage | null)[];
  activeSlot: number;
};

export type SavedPhoto = {
  id: string;
  createdAt: number;
  frameId: string;
  frameName: string;
  blob: Blob;
  thumbnail: Blob;
};
