import { GoogleGenAI } from "@google/genai";
import { ImageGenerationConfig } from "../types";

const extractBase64Data = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

// Helper to safely access process.env for browser environments where 'process' might not be defined
const getEnvApiKey = (): string => {
  try {
    // Check if process is defined and has env (Node.js/Bundlers)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Setup for Vite specific env usage (optional, but good for Vercel/Netlify with Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore errors in strict environments
  }
  return '';
};

// Function to validate the API Key by making a lightweight call
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Ensure no whitespace
    const cleanKey = apiKey.trim();
    if (!cleanKey) return false;

    const client = new GoogleGenAI({ apiKey: cleanKey });

    // Use 'gemini-1.5-flash-latest' for the most recent stable flash model
    await client.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: 'ping',
    });
    return true;
  } catch (error) {
    console.error("API Key Validation Error:", error);
    return false;
  }
};

export const generateImage = async (config: ImageGenerationConfig, apiKey: string): Promise<string> => {
  const MODEL_NAME = 'gemini-1.5-flash-latest'; // Most recent stable flash model

  // Fallback to window.aistudio logic if no explicit key provided (legacy support), 
  // but prioritize the passed apiKey.
  if (!apiKey && typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      try {
        await (window as any).aistudio.openSelectKey();
      } catch (e) {
        console.error("Failed to select API key", e);
        throw new Error("API Key selection failed or was cancelled.");
      }
    }
  }

  // Initialize with the provided user key (trimmed) or safely retrieved env key
  const finalKey = apiKey?.trim() || getEnvApiKey();
  const client = new GoogleGenAI({ apiKey: finalKey });

  try {
    const parts: any[] = [];
    let instructions = [];

    // --- NO TEXT CONSTRAINT (CRITICAL) ---
    instructions.push("STRICT NEGATIVE CONSTRAINT: DO NOT generate, render, or write any text, words, letters, numbers, watermarks, or typography inside the image. The image must be purely visual. If the user prompt or reference image contains text, IGNORE the text content completely and only replicate the visual style/lighting. The output must be a clean photograph/illustration without any writing.");

    // --- MASTER QUALITY INSTRUCTIONS ---
    instructions.push("QUALITY ASSURANCE: Ensure maximum fidelity, cinematic lighting, and perfect composition. The image must be deeply ambiented with realistic depth.");

    // --- CINEMATIC CAMERA SPECS ---
    instructions.push("CAMERA & LENS: Shot on Sony A7R IV, 85mm G Master lens, f/1.8 aperture (or similar high-end cinematic setup). Ultra-detailed, 8k resolution, cinematic color grading, rich dynamic range.");

    // --- MODE LOGIC ---
    let mainPrompt = "";

    if (config.mode === 'upscale' && config.upscaleImage) {
      // --- UPSCALE MODE ---
      mainPrompt = `UPSCALE & ENHANCE TASK: You are an expert image restoration AI. 
      Your task is to take the provided image and generate a higher-resolution version (${config.resolution}).
      
      CRITICAL INSTRUCTIONS:
      1. FIDELITY: Maintain the EXACT facial identity, expression, pose, and composition of the original image. Do not change the subject.
      2. ENHANCEMENT: Sharpen details, refine textures (skin, fabric, background), and improve global lighting quality.
      3. RESOLUTION: Output the image in strictly ${config.resolution} ultra-high definition.
      ${config.resolution === '8K' ? '4. 8K ULTRA-DETAIL: Apply extreme fine-grained detailing to textures (pores, fabric weave, foliage) suitable for large format printing.' : ''}
      5. DO NOT hallucinate new objects or change the color palette drastically. Keep the original aesthetic but polished.
      6. REMINDER: Do not add any text or watermarks.`;

      // Add source image
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: extractBase64Data(config.upscaleImage)
        }
      });
    } else if (config.mode === 'marketing' && config.marketing) {
      const { profession, context, sceneDescription, h1Text, h2Text } = config.marketing;

      mainPrompt = `Create a professional, cinematic marketing hero image for a ${profession}. `;
      if (context) mainPrompt += `Action/Context: ${context}. `;
      if (sceneDescription) mainPrompt += `\nSCENE VISUALS: ${sceneDescription}. `;

      // Smart Negative Space instruction based on H1/H2 presence
      if (h1Text || h2Text) {
        // We mention the text purely to define the "Negative Space", but explicitly forbid writing it.
        mainPrompt += `\nCOMPOSITION RULE: The image MUST have clean, empty negative space (background area) specifically reserved for a graphic designer to add text later. Ensure the composition balances the subject to create this empty space. DO NOT write the text "${h1Text}" or "${h2Text}" inside the image. Leave the space BLANK.`;
      }
    } else {
      mainPrompt = config.prompt?.trim() || "Generate a high-fidelity cinematic image.";
    }

    // --- 16:9 SPECIFIC RULES (Position & Blur & Orientation) ---
    // (Only apply these rules if NOT in upscale mode, as upscale should preserve original composition)
    if (config.mode !== 'upscale' && config.aspectRatio === '16:9') {
      const blurSide = config.subjectPosition === 'left' ? 'RIGHT' : 'LEFT';

      // ORIENTATION RULE FOR HERO
      instructions.push("SUBJECT ORIENTATION: The subject MUST be facing forward, making eye contact with the camera (breaking the fourth wall), positioned perfectly for a website hero section to build trust and connection.");

      if (config.subjectPosition === 'left') {
        instructions.push("Composition: Place the main subject clearly on the LEFT side of the frame.");
      } else if (config.subjectPosition === 'right') {
        instructions.push("Composition: Place the main subject clearly on the RIGHT side of the frame.");
      } else {
        instructions.push("Composition: Center the main subject in the frame.");
      }

      // Blur/Shadow Logic
      if (config.subjectPosition !== 'center' && config.blurConfig?.enabled && config.blurConfig.color !== 'none') {
        instructions.push(`ATMOSPHERE/SHADOW: On the ${blurSide} side of the image (the empty space), generate a smooth, misty ${config.blurConfig.color}-tinted blur or atmospheric gradient. This will serve as a CLEAN background for text overlay (do not write text). It should look like natural lighting or studio atmosphere, not a solid block.`);
      }
    }

    // --- SCENE ELEMENTS & EFFECTS ---
    if (config.mode !== 'upscale' && config.heroConfig && config.heroConfig.elements) {
      const { elements, effect } = config.heroConfig;
      let elemPrompt = `SCENE ELEMENTS: Incorporate the following elements into the scene naturally: "${elements}". `;

      if (effect === 'motion') {
        elemPrompt += `EFFECT: Apply DYNAMIC MOTION BLUR to these elements to create a sense of speed, energy, and movement around the subject.`;
      } else if (effect === 'bokeh') {
        elemPrompt += `EFFECT: Apply a SOFT BOKEH / DEPTH-OF-FIELD effect to these elements, keeping them out of focus in the foreground or background to create depth and aesthetic appeal.`;
      } else {
        elemPrompt += `EFFECT: Keep these elements sharp and clearly visible in the composition.`;
      }
      instructions.push(elemPrompt);
    }

    // --- MAP INSTRUCTIONS (Skip for upscale) ---
    if (config.mode !== 'upscale' && config.styleImage) {
      if (config.activeMaps.depth) instructions.push("Depth: Strictly respect the depth of field. Objects closer must be sharper, background must fade naturally.");
      if (config.activeMaps.mask) instructions.push("Shape: Follow the exact silhouette and body shape of the reference (White subject area).");
    }

    // Combine
    let finalPrompt = `${mainPrompt}\n\nSYSTEM CONSTRAINTS:\n${instructions.join('\n')}`;

    // --- IMAGE PARTS ---

    // 1. Style Reference (Only for generation modes)
    if (config.mode !== 'upscale' && config.styleImage) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: extractBase64Data(config.styleImage)
        }
      });
      finalPrompt = `(Image 1: Reference Style/Composition - IGNORE ANY TEXT IN THIS IMAGE) ${finalPrompt}`;
    }

    // 2. Character References (Multi-face) - (Skip for upscale as fidelity is handled by source)
    if (config.mode !== 'upscale' && config.characterImages && config.characterImages.length > 0) {
      config.characterImages.forEach((img, index) => {
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: extractBase64Data(img)
          }
        });
      });

      const startIdx = config.styleImage ? 2 : 1;
      const endIdx = startIdx + config.characterImages.length - 1;

      finalPrompt = `(Images ${startIdx}-${endIdx}: FACE REFERENCE) ${finalPrompt}\nIMPORTANT: The face of the generated character must be an exact likeness of the person in the provided reference images. Maintain facial structure, features, and identity across all angles.`;
    }

    // Add text prompt last
    parts.push({ text: finalPrompt });

    // Resolution mapping
    let finalRes = '1K';
    if (config.resolution === '2K') finalRes = '2K';
    if (config.resolution === '4K' || config.resolution === '8K') finalRes = '4K'; // Map 8K request to 4K API limit but use prompting for detail

    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: config.mode === 'upscale' ? undefined : config.aspectRatio,
          imageSize: finalRes
        },
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64String = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64String}`;
        }
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("Authorization failed. Please try selecting the API Key again.");
    }
    throw error;
  }
};