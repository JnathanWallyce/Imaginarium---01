export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type SubjectPosition = 'center' | 'left' | 'right';
export type BlurColor = 'none' | 'black' | 'white' | 'blue' | 'purple' | 'warm';
export type ElementEffect = 'static' | 'motion' | 'bokeh';
export type ImageResolution = '1K' | '2K' | '4K' | '8K';

export interface ImageGenerationConfig {
  mode: 'free' | 'marketing' | 'upscale';
  prompt?: string; // Used in free mode
  
  // Marketing Mode Fields
  marketing?: {
    profession: string;
    context: string;
    sceneDescription?: string; // New field for specific scene details
    h1Text: string;
    h2Text: string;
  };

  aspectRatio: AspectRatio;
  resolution: ImageResolution;
  subjectPosition: SubjectPosition;
  
  styleImage?: string; 
  characterImages: string[]; 
  upscaleImage?: string; // Source for upscale mode
  
  // 16:9 Specific
  blurConfig?: {
    enabled: boolean;
    color: BlurColor;
  };

  // Hero / Cinematic Elements
  heroConfig?: {
    elements: string;
    effect: ElementEffect;
  };

  activeMaps: {
    depth: boolean;
    mask: boolean;
    noise: boolean;
  };
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  createdAt: number;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}