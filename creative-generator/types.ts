
export type Language = 'en' | 'pt' | 'es';

export interface AdFormData {
  // Campaign
  platform: string;
  resolution: string;
  productType: string;
  targetAudience: string;
  
  // Visuals
  mainColor: string;
  brandColors: string;
  textOverlayColor: string; 
  sceneDescription: string; 
  
  // Elements
  visualObjects: string;    
  blurStyle: string;
  
  // Copy
  headline: string;     
  subHeadline: string;
  ctaText: string;
  textStyle: string;
  textPosition: string; // Center, Left, Right
  
  // Assets & Positioning
  subjectPosition: string;
  logoPosition: string; // New: Above Text, Center w/ Text, Top Corner
  
  // Files
  expertImages: File[]; 
  expertDescription: string;
  logoImage: File | null;
  maskImage: File | null; // New: Reference Mask
  
  // Generation Config
  aiModel: string; // New: Gemini, Midjourney (Sim), Flux (Sim)
}

export interface AdCopySet {
  headline: string;
  subHeadline: string;
  ctaText: string;
  sceneSuggestion: string; 
}

export interface GenerationResult {
  imageUrls: string[];
}

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export const PLATFORMS = [
  'Instagram Feed (4:5)',
  'Instagram Stories (9:16)',
  'Linkedin / Facebook (4:5)',
  'Quadrado (1:1)'
];

export const RESOLUTIONS = [
  '1K (Rápido)',
  '2K (Alta Res)',
  '4K (Ultra HD)'
];

export const AI_MODELS = [
  'Google Nano Banana (Rápido)',
  'Gemini 3 Pro (Alta Fidelidade)',
  'Flux Realism (Simulado)',
  'Midjourney v6 Style (Simulado)'
];

export const BLUR_STYLES = [
  'Profundidade de Campo (Bokeh)',
  'Desfoque de Movimento',
  'Fundo Suave (Gaussiano)',
  'Fundo Nítido (Sem Desfoque)',
  'Foco Radial'
];

export const TEXT_STYLES = [
  'Moderno Negrito (Sem Serifa)',
  'Editorial Elegante (Com Serifa)',
  'Impacto Urgente',
  'Tech Minimalista',
  'Anotações à Mão'
];

// Simplified for Node UI
export const INITIAL_FORM_STATE: AdFormData = {
  platform: 'Instagram Feed (4:5)',
  resolution: '2K (Alta Res)',
  productType: '',
  targetAudience: '',
  
  mainColor: '#FF6B00', 
  brandColors: '#FFFFFF, #000000', 
  textOverlayColor: '#000000', 
  sceneDescription: 'Escritório moderno de luxo com janelas do chão ao teto.',
  
  visualObjects: 'Gráficos de receita flutuando, notebook limpo.',
  blurStyle: 'Profundidade de Campo (Bokeh)',
  
  headline: 'ESCALE SUA AGÊNCIA',
  subHeadline: 'Para R$100k/Mês em 90 Dias',
  ctaText: 'SAIBA MAIS',
  textStyle: 'Moderno Negrito (Sem Serifa)',
  textPosition: 'Center Top',
  
  subjectPosition: 'Center',
  logoPosition: 'Top Center',
  
  expertImages: [], 
  expertDescription: '',
  logoImage: null,
  maskImage: null,
  
  aiModel: 'Gemini 3 Pro (Alta Fidelidade)'
};
