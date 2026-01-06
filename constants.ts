import { AspectRatio } from "./types";

export const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: '1:1', label: 'Square', icon: 'square' },
  { value: '16:9', label: 'Landscape', icon: 'landscape' },
  { value: '9:16', label: 'Portrait', icon: 'portrait' },
  { value: '4:3', label: 'Classic', icon: 'landscape_sm' },
  { value: '3:4', label: 'Tall', icon: 'portrait_sm' },
];