import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateImage, validateApiKey } from './services/geminiService';
import { supabase, updateUserApiKey, getUserApiKey } from './services/supabaseClient';
import { saveImageToGallery, getGalleryImages, deleteImageFromGallery } from './services/imageStorage';
import { GeneratedImage, AspectRatio, SubjectPosition, BlurColor, ElementEffect, ImageResolution } from './types';
import { ASPECT_RATIOS } from './constants';
import {
  SparklesIcon, DownloadIcon, SquareIcon, PortraitIcon, LandscapeIcon, PhotoIcon,
  UploadIcon, UserCircleIcon, SwatchIcon, XCircleIcon, TrashIcon
} from './components/Icons';

// --- Icons ---
const RefreshIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const CameraIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const ArrowUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const GalleryIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const GridIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const LogoutIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

// --- Compare Slider Component ---
const CompareSlider = ({ before, after, labelAfter }: { before: string, after: string, labelAfter: string }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none cursor-ew-resize overflow-hidden rounded-[22px] group"
      onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
      onTouchMove={handleDrag}
      onClick={handleDrag}
    >
      <img src={after} className="absolute inset-0 w-full h-full object-contain" alt="After" draggable={false} />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={before} className="absolute inset-0 w-full h-full object-contain" alt="Before" draggable={false} />
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">ORIGINAL</div>
      </div>

      <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">{labelAfter}</div>

      {/* Slider Line */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur border border-white rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
          <svg className="w-4 h-4 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 3 4 3m8-6l4 3-4 3" /></svg>
        </div>
      </div>
    </div>
  );
};

// Auth component removed - now in Login.tsx

export default function ImaginariumCore() {
  const navigate = useNavigate();
  // Shared API Key from localStorage
  const apiKey = localStorage.getItem('imaginarium_api_key');

  // If no API key, let the router handle redirecting to /
  useEffect(() => {
    if (!apiKey) navigate('/');
  }, [apiKey, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('imaginarium_api_key');
    localStorage.removeItem('imaginarium_remember_me');
    navigate('/');
  };

  // Mode Selection
  const [mode, setMode] = useState<'free' | 'marketing' | 'upscale'>('free');

  // Inputs
  const [prompt, setPrompt] = useState('');

  // Marketing Inputs
  const [marketing, setMarketing] = useState({
    profession: '',
    context: '',
    sceneDescription: '', // New field
    h1Text: '',
    h2Text: '',
  });

  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<ImageResolution>('2K');
  const [subjectPosition, setSubjectPosition] = useState<SubjectPosition>('center');
  const [blurColor, setBlurColor] = useState<BlurColor>('none');

  // Hero Elements
  const [heroElements, setHeroElements] = useState('');
  const [elementEffect, setElementEffect] = useState<ElementEffect>('static');

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Gallery State
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GeneratedImage[]>([]);
  const [expandedImage, setExpandedImage] = useState<GeneratedImage | null>(null);

  // Load gallery on mount
  useEffect(() => {
    getGalleryImages().then(setGalleryImages).catch(console.error);
  }, []);

  const refreshGallery = () => {
    getGalleryImages().then(setGalleryImages).catch(console.error);
  };

  const handleDeleteFromGallery = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this image?')) {
      await deleteImageFromGallery(id);
      refreshGallery();
    }
  };

  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [characterImages, setCharacterImages] = useState<string[]>([]);
  const [upscaleImage, setUpscaleImage] = useState<string | null>(null); // Upscale Source

  // Advanced Visuals State
  const [visuals, setVisuals] = useState<{
    depth: string;
    mask: string;
    noise: string;
  } | null>(null);

  const [activeMaps, setActiveMaps] = useState({
    depth: true,
    mask: true,
    noise: true
  });

  const styleInputRef = useRef<HTMLInputElement>(null);
  const characterInputRef = useRef<HTMLInputElement>(null);
  const upscaleInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('imaginarium_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
        localStorage.removeItem('imaginarium_history');
      }
    }
  }, []);

  const saveToHistory = useCallback((image: GeneratedImage) => {
    setHistory(prev => {
      const updated = [image, ...prev].slice(0, 10);
      try {
        localStorage.setItem('imaginarium_history', JSON.stringify(updated));
      } catch (e) {
        console.warn("LocalStorage quota exceeded.");
      }
      return updated;
    });
  }, []);

  // --- MAP GENERATION LOGIC ---
  const generateSingleMap = (type: string, img: HTMLImageElement, ctx: CanvasRenderingContext2D, w: number, h: number): string => {
    const originalData = ctx.getImageData(0, 0, w, h);

    const getColor = (data: Uint8ClampedArray, x: number, y: number) => {
      const i = (y * w + x) * 4;
      return { r: data[i], g: data[i + 1], b: data[i + 2] };
    };

    const colorDiff = (c1: any, c2: any) => {
      return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
    };

    // 1. Calculate Average Background Color (Used for segmentation logic)
    const c1 = getColor(originalData.data, 0, 0);
    const c2 = getColor(originalData.data, w - 1, 0);
    const c3 = getColor(originalData.data, 0, h - 1);
    const c4 = getColor(originalData.data, w - 1, h - 1);

    const bgR = (c1.r + c2.r + c3.r + c4.r) / 4;
    const bgG = (c1.g + c2.g + c3.g + c4.g) / 4;
    const bgB = (c1.b + c2.b + c3.b + c4.b) / 4;
    const bgAvg = { r: bgR, g: bgG, b: bgB };
    const THRESHOLD = 60;

    if (type === 'depth') {
      const depthData = ctx.createImageData(w, h);

      for (let i = 0; i < originalData.data.length; i += 4) {
        const r = originalData.data[i];
        const g = originalData.data[i + 1];
        const b = originalData.data[i + 2];

        // Calculate difference from background (Segmentation approximation)
        const diff = colorDiff({ r, g, b }, bgAvg);

        // DEPTH CALCULATION (Heuristic Simulation)
        // 1. Segmentation Factor: Higher difference = More likely to be subject (Closer/Lighter)
        let depthVal = diff * 1.5;

        // 2. Vertical Gradient Factor: Bottom of image is usually floor (Closer) than top (Far)
        // y is current pixel row normalized 0 to 1
        const y = (i / 4) / w;
        const verticalFactor = (y / h) * 100; // Add bias to bottom pixels

        // 3. Center Bias: Objects in center are often closer
        // We add a subtle radial gradient light to the center

        depthVal += verticalFactor;

        // 4. Contrast Stretch
        // Push darks darker (background) and lights lighter (subject)
        if (depthVal < 80) {
          depthVal = depthVal * 0.4; // Push background to deep dark gray/black
        } else {
          depthVal = Math.min(255, depthVal + 40); // Pop subject to white/light gray
        }

        // Clamp
        const finalPixel = Math.min(255, Math.max(0, depthVal));

        depthData.data[i] = finalPixel;     // R
        depthData.data[i + 1] = finalPixel;   // G
        depthData.data[i + 2] = finalPixel;   // B
        depthData.data[i + 3] = 255;          // Alpha
      }

      ctx.putImageData(depthData, 0, 0);

      // 5. BLUR (Crucial for "Smooth Transition" and avoiding "Paper Cutout" look)
      // This simulates the gradual focus falloff
      ctx.filter = 'blur(4px)';
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.filter = 'none';

      return ctx.canvas.toDataURL();
    }

    if (type === 'mask') {
      // MASK: White Subject, Original Color Background
      const maskPixels = ctx.createImageData(w, h);

      for (let i = 0; i < originalData.data.length; i += 4) {
        const r = originalData.data[i];
        const g = originalData.data[i + 1];
        const b = originalData.data[i + 2];

        const diff = colorDiff({ r, g, b }, bgAvg);
        const isSubject = diff > THRESHOLD;

        if (isSubject) {
          // White Subject
          maskPixels.data[i] = 255;
          maskPixels.data[i + 1] = 255;
          maskPixels.data[i + 2] = 255;
          maskPixels.data[i + 3] = 255;
        } else {
          // Keep Original Background (Color)
          maskPixels.data[i] = r;
          maskPixels.data[i + 1] = g;
          maskPixels.data[i + 2] = b;
          maskPixels.data[i + 3] = 255;
        }
      }
      ctx.putImageData(maskPixels, 0, 0);
      return ctx.canvas.toDataURL();
    }

    if (type === 'noise') {
      // NOISE: Original Color + Grain (NOT B&W)
      const noiseImgData = ctx.createImageData(w, h);
      for (let i = 0; i < noiseImgData.data.length; i += 4) {
        const r = originalData.data[i];
        const g = originalData.data[i + 1];
        const b = originalData.data[i + 2];

        // Color Noise
        const noise = (Math.random() - 0.5) * 50;

        noiseImgData.data[i] = Math.min(255, Math.max(0, r + noise));
        noiseImgData.data[i + 1] = Math.min(255, Math.max(0, g + noise));
        noiseImgData.data[i + 2] = Math.min(255, Math.max(0, b + noise));
        noiseImgData.data[i + 3] = 255;
      }
      ctx.putImageData(noiseImgData, 0, 0);
      return ctx.canvas.toDataURL();
    }

    return "";
  }

  const generateAllVisuals = (base64Image: string) => {
    const img = new Image();
    img.src = base64Image;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const MAX_SIZE = 300;
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; }
      } else {
        if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; }
      }
      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);

      try {
        const depthUrl = generateSingleMap('depth', img, ctx, w, h);

        ctx.drawImage(img, 0, 0, w, h);
        const maskUrl = generateSingleMap('mask', img, ctx, w, h);

        ctx.drawImage(img, 0, 0, w, h);
        const noiseUrl = generateSingleMap('noise', img, ctx, w, h);

        setVisuals({ depth: depthUrl, mask: maskUrl, noise: noiseUrl });
      } catch (err) { console.error(err); }
    };
  };

  const regenerateMask = (type: string) => {
    if (!styleImage || !visuals) return;

    const img = new Image();
    img.src = styleImage;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const MAX_SIZE = 300;
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; }
      } else {
        if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; }
      }
      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);
      const newUrl = generateSingleMap(type, img, ctx, w, h);

      setVisuals(prev => prev ? ({ ...prev, [type]: newUrl }) : null);
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'style' | 'character' | 'upscale') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        if (type === 'style') {
          setStyleImage(res);
          generateAllVisuals(res);
        } else if (type === 'character') {
          setCharacterImages(prev => [...prev, res].slice(0, 3));
        } else if (type === 'upscale') {
          setUpscaleImage(res);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCharacterImage = (index: number) => {
    setCharacterImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleMap = (type: keyof typeof activeMaps) => {
    setActiveMaps(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const sendToUpscale = (img: GeneratedImage) => {
    setUpscaleImage(img.url);
    setMode('upscale');
    setResolution('4K');
  };

  const handleGenerate = async () => {
    if (!apiKey) return;

    // Validation
    if (mode === 'free' && !prompt && !styleImage && characterImages.length === 0) return;
    if (mode === 'marketing' && !marketing.profession) return;
    if (mode === 'upscale' && !upscaleImage) return;

    setIsGenerating(true);
    setError(null);
    setCurrentImage(null);

    try {
      const base64Url = await generateImage({
        mode,
        prompt: prompt.trim(),
        marketing: mode === 'marketing' ? marketing : undefined,
        aspectRatio: selectedRatio,
        resolution: resolution,
        subjectPosition: selectedRatio === '16:9' ? subjectPosition : 'center',
        blurConfig: selectedRatio === '16:9' ? { enabled: blurColor !== 'none', color: blurColor } : undefined,
        styleImage: styleImage || undefined,
        characterImages: characterImages,
        upscaleImage: upscaleImage || undefined,
        heroConfig: heroElements ? { elements: heroElements, effect: elementEffect } : undefined,
        activeMaps: activeMaps
      }, apiKey);

      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url: base64Url,
        prompt: mode === 'upscale' ? `Upscale to ${resolution}` : (mode === 'free' ? (prompt.trim() || 'Visual Reference') : `Marketing: ${marketing.profession}`),
        aspectRatio: selectedRatio,
        createdAt: Date.now(),
      };

      setCurrentImage(newImage);
      saveToHistory(newImage);
      // Save to permanent gallery
      await saveImageToGallery(newImage);
      refreshGallery(); // Update local gallery state
      // Auto-open gallery on successful generation (optional, keeping it closed for now to focus on result)
    } catch (err: any) {
      console.error("Generation failed", err);
      setError(err.message || "Something went wrong during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (img: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = img.url;
    link.download = `gemini-gen-${img.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRatioIcon = (ratio: AspectRatio) => {
    switch (ratio) {
      case '1:1': return <SquareIcon className="w-5 h-5" />;
      case '9:16': case '3:4': return <PortraitIcon className="w-5 h-5" />;
      case '16:9': case '4:3': return <LandscapeIcon className="w-5 h-5" />;
      default: return <SquareIcon className="w-5 h-5" />;
    }
  };

  // Removed dedicated Auth check - handled by App Router

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30 overflow-y-auto">
      <canvas ref={canvasRef} className="hidden" />

      {/* Back to Menu Button */}
      {apiKey && (
        <button
          onClick={() => navigate('/')}
          className="fixed top-20 left-4 z-[60] px-4 py-2 bg-black/50 text-white font-bold text-xs rounded-lg backdrop-blur-md border border-white/10 hover:bg-black/70 flex items-center gap-2 transition-all hover:pl-3 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar ao Menu
        </button>
      )}

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Imaginarium AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hidden md:block">
              Gemini 3.0 Pro
            </div>
            {/* Gallery Toggle */}
            <button
              onClick={() => setShowGallery(!showGallery)}
              className={`p-2 transition-colors rounded-lg flex items-center gap-2 ${showGallery ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-indigo-400 hover:bg-gray-800'}`}
              title="Open Gallery"
            >
              <GalleryIcon className="w-5 h-5" />
              <span className="hidden md:inline text-xs font-bold">Galeria</span>
            </button>
            {/* Update API Key Button */}
            <button
              onClick={() => {
                const newKey = window.prompt("Update your stored Gemini API Key:");
                if (newKey && newKey.trim()) {
                  validateApiKey(newKey).then(valid => {
                    if (valid) {
                      updateUserApiKey(newKey).then(() => {
                        localStorage.setItem('imaginarium_api_key', newKey);
                        alert("API Key updated successfully!");
                      }).catch(e => alert("Failed to save key: " + e.message));
                    } else {
                      alert("Invalid Key. Check and try again.");
                    }
                  });
                }
              }}
              className="p-2 text-gray-500 hover:text-indigo-400 transition-colors"
              title="Update API Key"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </button>
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Logout">
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 relative z-10">

        {/* Left Column: Controls */}
        <div className={`w-full lg:w-[28rem] flex-shrink-0 space-y-6 transition-all duration-500 ${showGallery ? 'opacity-20 pointer-events-none lg:opacity-100 lg:pointer-events-auto' : ''}`}>
          {/* ... existing controls content ... */}
          {/* This wrapper is just purely logical in this replacement block to indicate context */}


          {/* Inspiration View (Hidden in Upscale Mode) */}
          {mode !== 'upscale' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5 ml-1">
                <SwatchIcon className="w-3 h-3" /> Inspiration & Maps
              </label>
              <input
                type="file"
                accept="image/*"
                ref={styleInputRef}
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'style')}
              />

              {!styleImage ? (
                <button
                  onClick={() => styleInputRef.current?.click()}
                  className="w-full h-24 rounded-xl border border-dashed border-gray-700 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-500 transition-all flex flex-col items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <UploadIcon className="w-6 h-6 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-xs text-gray-500 group-hover:text-gray-300">Upload Style/Pose Reference</span>
                </button>
              ) : (
                <div className="bg-gray-900 rounded-xl p-2 border border-gray-800 space-y-2">
                  <div className="relative w-full h-32 rounded-lg overflow-hidden group bg-black">
                    <img src={styleImage} alt="Style" className="w-full h-full object-contain" />
                    <button
                      onClick={() => { setStyleImage(null); setVisuals(null); if (styleInputRef.current) styleInputRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors backdrop-blur-sm z-10"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {visuals && (
                    <div className="grid grid-cols-3 gap-2">
                      {[{ id: 'depth', label: 'DEPTH', src: visuals.depth }, { id: 'mask', label: 'MASK', src: visuals.mask }, { id: 'noise', label: 'NOISE', src: visuals.noise }].map((map) => (
                        <div key={map.id} className={`space-y-1 relative group ${!activeMaps[map.id as keyof typeof activeMaps] ? 'opacity-40 grayscale' : ''}`}>
                          <div className="h-20 rounded overflow-hidden border border-gray-700 bg-black relative">
                            <img src={map.src} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                              {/* INDIVIDUAL REGENERATION BUTTON */}
                              <button onClick={() => regenerateMask(map.id)} className="p-1 rounded-full bg-indigo-600 text-white scale-90 hover:bg-indigo-500 shadow-lg"><RefreshIcon className="w-4 h-4" /></button>
                              <button onClick={() => toggleMap(map.id as any)} className={`p-1 rounded-full text-white scale-90 shadow-lg ${activeMaps[map.id as keyof typeof activeMaps] ? 'bg-red-500' : 'bg-green-500'}`}>{activeMaps[map.id as keyof typeof activeMaps] ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}</button>
                            </div>
                          </div>
                          <div className="text-[9px] text-center text-gray-500 font-mono tracking-wider">{map.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Multi-Face Input (Hidden in Upscale Mode) */}
          {mode !== 'upscale' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5 ml-1">
                  <UserCircleIcon className="w-3 h-3" /> Face References ({characterImages.length}/3)
                </label>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={characterInputRef}
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'character')}
              />

              <div className="grid grid-cols-4 gap-2">
                {characterImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-indigo-500/30 group bg-black">
                    <img src={img} className="w-full h-full object-cover" />
                    <button onClick={() => removeCharacterImage(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                ))}

                {characterImages.length < 3 && (
                  <button
                    onClick={() => characterInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-gray-700 bg-gray-900/30 hover:bg-gray-800 transition-all flex items-center justify-center"
                  >
                    <span className="text-2xl text-gray-600">+</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MODE TABS */}
          <div className="bg-gray-900 p-1 rounded-xl flex gap-1">
            <button onClick={() => setMode('free')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'free' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Free Mode</button>
            <button onClick={() => setMode('marketing')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'marketing' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Marketing Mode</button>
            <button onClick={() => setMode('upscale')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'upscale' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Upscale</button>
          </div>

          {/* INPUT FIELDS BASED ON MODE */}
          {mode === 'free' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="text-sm font-medium text-gray-300 ml-1">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your image..."
                className="w-full h-24 bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          )}

          {mode === 'marketing' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Profession / Niche</label>
                  <input type="text" placeholder="e.g. Dentist, Realtor" value={marketing.profession} onChange={e => setMarketing({ ...marketing, profession: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Context / Action</label>
                  <input type="text" placeholder="e.g. Talking to client" value={marketing.context} onChange={e => setMarketing({ ...marketing, context: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Specific Scene Details (Optional)</label>
                  <textarea
                    placeholder="e.g. Modern glass office with sunset lighting, blue aesthetic..."
                    value={marketing.sceneDescription || ''}
                    onChange={e => setMarketing({ ...marketing, sceneDescription: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none resize-none h-20"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">H1 Headline (Idea)</label>
                <input type="text" placeholder="Main big text concept" value={marketing.h1Text} onChange={e => setMarketing({ ...marketing, h1Text: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">H2 Subheadline (Idea)</label>
                <input type="text" placeholder="Secondary text concept" value={marketing.h2Text} onChange={e => setMarketing({ ...marketing, h2Text: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
            </div>
          )}

          {mode === 'upscale' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="text-sm font-medium text-gray-300 ml-1">Source Image to Enhance</label>
              <input
                type="file"
                accept="image/*"
                ref={upscaleInputRef}
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'upscale')}
              />

              {!upscaleImage ? (
                <button
                  onClick={() => upscaleInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 hover:bg-gray-800 hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <ArrowUpIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-400" />
                  </div>
                  <span className="text-sm text-gray-500 group-hover:text-gray-300 font-medium">Click to Upload for 4K/8K Upscale</span>
                </button>
              ) : (
                <div className="bg-gray-900 rounded-xl p-2 border border-gray-800 relative group">
                  <img src={upscaleImage} alt="Upscale Source" className="w-full h-48 object-contain rounded-lg bg-black" />
                  <button
                    onClick={() => { setUpscaleImage(null); if (upscaleInputRef.current) upscaleInputRef.current.value = ''; }}
                    className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors backdrop-blur-sm"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-indigo-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">READY TO UPSCALE</div>
                </div>
              )}
            </div>
          )}

          {/* HERO ELEMENTS CONFIGURATION (Hidden in Upscale Mode) */}
          {mode !== 'upscale' && (
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <CameraIcon className="w-4 h-4 text-indigo-400" />
                <span>Cinematic Scene Elements</span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={heroElements}
                  onChange={(e) => setHeroElements(e.target.value)}
                  placeholder="E.g. Floating coins, neon code lines, abstract shapes..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none placeholder:text-gray-700"
                />

                <div className="flex bg-gray-950 rounded-lg p-1 border border-gray-700">
                  {[
                    { id: 'static', label: 'Static (Sharp)' },
                    { id: 'motion', label: 'Motion Blur' },
                    { id: 'bokeh', label: 'Soft Bokeh' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setElementEffect(opt.id as ElementEffect)}
                      className={`flex-1 py-1.5 text-[10px] font-medium rounded transition-all ${elementEffect === opt.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-600 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span>Camera: Sony A7R IV · 85mm f/1.8 · Cinematic Grade</span>
              </div>
            </div>
          )}

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-4">

            {/* Aspect Ratio */}
            {mode !== 'upscale' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 ml-1">Ratio</label>
                <div className="grid grid-cols-3 gap-1">
                  {ASPECT_RATIOS.slice(0, 3).map((ratio) => (
                    <button key={ratio.value} onClick={() => setSelectedRatio(ratio.value)} className={`flex items-center justify-center p-2 rounded border transition-all ${selectedRatio === ratio.value ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-900 border-gray-700 text-gray-400'}`}>
                      {getRatioIcon(ratio.value)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Selector - Visible in All Modes */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 ml-1">Output Resolution</label>
              <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700 h-[42px]">
                {['2K', '4K', '8K'].map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res as ImageResolution)}
                    className={`flex-1 text-[10px] font-medium rounded transition-all ${resolution === res
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* 16:9 Position (Hidden in Upscale) */}
            {mode !== 'upscale' && selectedRatio === '16:9' && (
              <div className="space-y-2 animate-in fade-in zoom-in duration-300 col-span-2">
                <label className="text-xs font-medium text-gray-400 ml-1">Subject Position</label>
                <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700 h-[42px]">
                  {['left', 'center', 'right'].map((pos) => (
                    <button key={pos} onClick={() => setSubjectPosition(pos as SubjectPosition)} className={`flex-1 text-[10px] font-medium uppercase rounded transition-all ${subjectPosition === pos ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 16:9 Blur Controls (Hidden in Upscale) */}
          {mode !== 'upscale' && selectedRatio === '16:9' && subjectPosition !== 'center' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-medium text-gray-400 ml-1 flex justify-between">
                <span>Text Background Blur (Shadow)</span>
                <span className="text-[10px] text-gray-500">Opposite side</span>
              </label>
              <div className="flex gap-2">
                {['none', 'black', 'white', 'blue', 'purple', 'warm'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBlurColor(color as BlurColor)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${blurColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{
                      background: color === 'none' ? '#1f2937' :
                        color === 'warm' ? 'linear-gradient(45deg, #f97316, #eab308)' : color
                    }}
                    title={color}
                  >
                    {color === 'none' && <div className="w-full h-0.5 bg-gray-500 -rotate-45 transform translate-y-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={
              isGenerating ||
              (mode === 'free' && !prompt && !styleImage && characterImages.length === 0) ||
              (mode === 'marketing' && !marketing.profession) ||
              (mode === 'upscale' && !upscaleImage)
            }
            className={`w-full py-4 rounded-2xl font-semibold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${isGenerating ||
              (mode === 'free' && !prompt && !styleImage && characterImages.length === 0) ||
              (mode === 'marketing' && !marketing.profession) ||
              (mode === 'upscale' && !upscaleImage)
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25'
              }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {mode === 'upscale' ? 'Enhancing...' : 'Generating...'}
              </>
            ) : (
              <>
                {mode === 'upscale' ? <ArrowUpIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                {mode === 'marketing' ? 'Generate Ad' : (mode === 'upscale' ? `Upscale to ${resolution}` : 'Generate Image')}
              </>
            )}
          </button>
        </div>

        {/* Right Column: Stage & History */}
        <div className="flex-1 min-h-[600px] flex flex-col gap-6">
          <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-1 relative overflow-hidden group shadow-2xl">
            {!currentImage && !isGenerating && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                <PhotoIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium opacity-50">Studio Ready</p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20 bg-gray-950/80 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
                <p className="text-gray-400 max-w-md">{error}</p>
                {error.includes("Authorization") && (
                  <button
                    onClick={handleLogout}
                    className="mt-4 px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-600/50 rounded-lg text-sm hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Update API Key
                  </button>
                )}
                <button onClick={() => setError(null)} className="mt-6 px-4 py-2 bg-gray-800 rounded-lg text-sm">Dismiss</button>
              </div>
            )}
            {(currentImage || isGenerating) && (
              <div className="relative w-full h-full min-h-[400px] bg-black/40 rounded-[22px] flex items-center justify-center overflow-hidden">
                {isGenerating && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-24 h-24 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
                    </div>
                    <p className="mt-6 text-indigo-300 font-medium animate-pulse">{mode === 'upscale' ? 'Upscaling & Refining...' : 'Rendering...'}</p>
                    <p className="text-xs text-indigo-400/60 mt-2">{mode === 'upscale' ? `Applying high-fidelity ${resolution} filters` : (mode === 'marketing' ? 'Designing Scene...' : 'Processing Prompt...')}</p>
                  </div>
                )}

                {/* Compare Slider for Upscale Mode */}
                {currentImage && mode === 'upscale' && upscaleImage ? (
                  <CompareSlider before={upscaleImage} after={currentImage.url} labelAfter={`UPSCALED ${currentImage.prompt.split(' ').pop()}`} />
                ) : (
                  currentImage && (
                    <>
                      <img src={currentImage.url} alt={currentImage.prompt} className="max-w-full max-h-full object-contain shadow-2xl" />
                      <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => downloadImage(currentImage)} className="bg-white/10 backdrop-blur-md border border-white/10 text-white p-3 rounded-full flex items-center gap-2">
                          <DownloadIcon className="w-5 h-5" /> Download
                        </button>
                      </div>
                    </>
                  )
                )}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-gray-400">Recent Creations</h3>
              <span className="text-xs text-gray-600">{history.length} items</span>
            </div>
            {history.length === 0 ? (
              <div className="h-32 border border-dashed border-gray-800 rounded-xl flex items-center justify-center text-gray-700 text-sm">No history yet</div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {history.map((img) => (
                  <div key={img.id} className={`relative flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${currentImage?.id === img.id ? 'border-indigo-500' : 'border-gray-800'}`}>
                    <img src={img.url} className="w-full h-full object-cover" loading="lazy" onClick={() => setCurrentImage(img)} />
                    {/* Quick Upscale Action */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); sendToUpscale(img); }}
                        className="bg-black/60 text-white p-1 rounded-full hover:bg-emerald-600"
                        title="Upscale this image"
                      >
                        <ArrowUpIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* GALLERY OVERLAY */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-gray-950/95 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300">
          <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10 space-y-8">
            <div className="flex items-center justify-between sticky top-0 bg-gray-950/95 backdrop-blur-xl py-4 z-20 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <GalleryIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Minha Galeria</h2>
                  <p className="text-gray-400 text-sm">{galleryImages.length} criações salvas</p>
                </div>
              </div>
              <button
                onClick={() => setShowGallery(false)}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg border border-white/5"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-1">
              {galleryImages.length === 0 ? (
                <div className="col-span-full h-96 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-3xl gap-4">
                  <PhotoIcon className="w-16 h-16 opacity-20" />
                  <p className="text-lg">Sua galeria está vazia</p>
                  <button onClick={() => setShowGallery(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">Criar Agora</button>
                </div>
              ) : (
                galleryImages.map((img) => (
                  <div key={img.id} onClick={() => setExpandedImage(img)} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer">
                    <img
                      src={img.url}
                      alt={img.prompt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Overlay Info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex flex-col gap-2">
                      <p className="text-white text-sm font-medium line-clamp-2 leading-snug">{img.prompt}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-white/10 px-2 py-0.5 rounded">{img.aspectRatio}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setCurrentImage(img); setShowGallery(false); }}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                            title="Edit / View"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadImage(img); }}
                            className="p-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white backdrop-blur-sm transition-colors"
                            title="Download"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteFromGallery(img.id, e)}
                            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white backdrop-blur-sm transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      {new Date(img.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX OVERLAY */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-all"
          >
            <XCircleIcon className="w-8 h-8" />
          </button>

          <div
            className="relative max-w-7xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={expandedImage.url}
              alt={expandedImage.prompt}
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain"
            />

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => { setCurrentImage(expandedImage); setExpandedImage(null); setShowGallery(false); }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
              >
                <SparklesIcon className="w-5 h-5" />
                Edit / Upscale
              </button>
              <button
                onClick={() => downloadImage(expandedImage)}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold border border-gray-700 flex items-center gap-2 transition-all"
              >
                <DownloadIcon className="w-5 h-5" />
                Download
              </button>
              <button
                onClick={(e) => {
                  handleDeleteFromGallery(expandedImage.id, e);
                  setExpandedImage(null);
                }}
                className="px-6 py-3 bg-black/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-full font-bold border border-red-900/30 flex items-center gap-2 transition-all"
              >
                <TrashIcon className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}