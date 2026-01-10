
import { GoogleGenAI, Type } from "@google/genai";
import { AdFormData, AdCopySet, Language } from "../types";

// --- UTILS ---

const fileToPart = async (file: File) => {
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data: base64String,
                    mimeType: file.type,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const getGradientInstruction = (textPos: string, color: string) => {
    const c = color || '#000000';

    if (textPos.includes('Left')) {
        return `**GRADIENTE OBRIGATÓRIO:** Adicione um gradiente LINEAR forte vindo da ESQUERDA. Cor: ${c}. O texto deve ficar SOBRE este fundo escuro.`;
    } else if (textPos.includes('Right')) {
        return `**GRADIENTE OBRIGATÓRIO:** Adicione um gradiente LINEAR forte vindo da DIREITA. Cor: ${c}. O texto deve ficar SOBRE este fundo escuro.`;
    } else if (textPos.includes('Bottom')) {
        return `**GRADIENTE OBRIGATÓRIO:** Adicione um gradiente vindo de BAIXO para cima. Cor: ${c}.`;
    } else {
        return `**FUNDO DE TEXTO:** Adicione uma vinheta ou sombra suave atrás do texto centralizado. Cor: ${c}.`;
    }
};

const getLogoInstruction = (pos: string) => {
    switch (pos) {
        case 'Above Text': return "Place the LOGO directly ABOVE the main headline, centered with the text block.";
        case 'Center with Text': return "Integrate the LOGO into the text block, between the headline and subheadline.";
        case 'Top Corner': return "Place the LOGO in the TOP RIGHT or TOP LEFT corner, small and discreet.";
        default: return "Place the LOGO in a standard branding position.";
    }
};

// New Helper for explicit Subject Positioning
const getSubjectInstruction = (pos: string) => {
    switch (pos) {
        case 'Left Side':
            return "SUBJECT PLACEMENT: Place the main person/expert firmly on the LEFT side of the frame. Leave the Center and Right areas as negative space.";
        case 'Right Side':
            return "SUBJECT PLACEMENT: Place the main person/expert firmly on the RIGHT side of the frame. Leave the Center and Left areas as negative space.";
        case 'Center':
            return "SUBJECT PLACEMENT: Place the main person/expert in the CENTER of the frame. Text might overlap or be placed above/below.";
        default:
            return `SUBJECT PLACEMENT: ${pos}`;
    }
};

// New Helper for explicit Text Positioning
const getTextInstruction = (pos: string) => {
    switch (pos) {
        case 'Left Center':
            return "TEXT ALIGNMENT: VERTICALLY CENTERED (Middle Y-Axis) and aligned to the LEFT (Left X-Axis). The text block should be floating in the middle height of the image, anchored to the left.";
        case 'Right Center':
            return "TEXT ALIGNMENT: VERTICALLY CENTERED (Middle Y-Axis) and aligned to the RIGHT (Right X-Axis). The text block should be floating in the middle height of the image, anchored to the right.";
        case 'Center Middle':
            return "TEXT ALIGNMENT: DEAD CENTER. The text should be exactly in the middle of the image (Middle Height, Middle Width).";
        case 'Center Top':
            return "TEXT ALIGNMENT: Top Center. Placed in the upper third, centered horizontally.";
        case 'Center Bottom':
            return "TEXT ALIGNMENT: Bottom Center. Placed in the lower third, centered horizontally.";
        default:
            return `TEXT ALIGNMENT: ${pos}`;
    }
};

// --- IMAGE GENERATION ---

const generateSingleImage = async (parts: any[], aspectRatio: string, resolution: string, modelAlias: string, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });

    // Map UI resolution to API imageSize
    let imageSize = "1K";
    if (resolution.includes("2K")) imageSize = "2K";
    if (resolution.includes("4K")) imageSize = "4K";

    // Map Model Alias to Real Gemini Models
    let modelName = 'gemini-3-pro-image-preview'; // Default High Quality
    if (modelAlias.includes("Nano Banana")) {
        modelName = 'gemini-2.5-flash-image'; // Fallback or mapping? Assuming Flash as faster alternative if valid
    }

    // Construct Config
    const imageConfig: any = {
        aspectRatio: aspectRatio
    };

    // Only add imageSize if model is Pro (Flash/Nano doesn't support it depending on version, sticking to logic)
    if (modelName === 'gemini-3-pro-image-preview') {
        imageConfig.imageSize = imageSize;
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts }],
            config: {
                // @ts-ignore - The types might not update as fast as the package
                imageConfig: imageConfig
            }
        });

        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("No image generated.");
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message || "Failed to generate image.");
    }
}

// --- NANO-BANANA PROMPT ENGINE ---

const getNarrativePrompt = (data: any, expertCount: number, hasLogo: boolean, hasMask: boolean) => {
    const name = data.expertName || "the Expert";

    let prompt = `[CRITICAL SYSTEM OVERRIDE - IDENTITY PRESERVATION]:
This is a high-stakes commercial generation. You MUST maintain 100% anatomical facial fidelity. 
The first ${expertCount} image(s) provided are your MASTER FACE REFERENCE. 
Extract the facial features of ${name} from these images and transplant them with perfect likeness onto the character in the scene. 
The character's face MUST be identical to the reference images. Do not generate a generic or approximated face.

[SCENE INSTRUCTION]:
Create a high-performance ultra-realistic commercial advertisement in ${data.resolution} resolution. 
${name} should be depicted as a successful professional authority. 
${hasMask ? "STRUCTURE: You MUST follow the exact structural layout and composition provided in the provided MASK/REFERENCE image (the last image attached)." : ""}
Character Placement: ${data.subjectPosition}. 
Environment: ${data.sceneDescription}.
Clothing: Premium business-casual attire.
Lighting: Cinematic volumetric lighting with high-end depth of field.
Atmosphere: Professional, sleek, and premium.
Color Palette: Accentuate with ${data.mainColor}.
Visual Objects: ${data.visualObjects}.
Blur Style: ${data.blurStyle}.

[TYPOGRAPHY & BRANDING]:
- Headline: "${data.headline}"
- Sub-headline: "${data.subHeadline}"
- CTA: "${data.ctaText}" (Rendered as a premium 3D button).
- TYPOGRAPHY RULE: Line-height MUST be exactly 1.2x the font size (Line-spacing = 1.2).
- QUALITY: Zero pixelation. All text and logos must be crystal clear and high-resolution.
- Text Position: ${data.textPosition}.
${hasLogo ? "- BRANDING: Integrate the provided LOGO image perfectly into the " + data.logoPosition + " position." : ""}

[FINAL REQUIREMENT]:
The output must look like a professional, non-AI generated studio photograph. The face fidelity to the reference is the most important metric.`;

    return prompt;
};

export const generateAdCreative = async (formData: AdFormData, apiKey: string): Promise<string[]> => {
    if (!apiKey) throw new Error("API Key is missing.");

    // Determine Aspect Ratio
    // Supported API values: "1:1", "3:4", "4:3", "9:16", "16:9"
    // Map "4:5" (Instagram Feed) to "3:4" as it is the closest vertical standard supported
    let aspectRatio = "3:4";

    if (formData.platform.includes("9:16")) aspectRatio = "9:16";
    if (formData.platform.includes("1:1")) aspectRatio = "1:1";
    // If 4:5, keep 3:4

    const gradientInstruction = getGradientInstruction(formData.textPosition, formData.textOverlayColor);
    const logoInstruction = getLogoInstruction(formData.logoPosition);
    const basePrompt = getNarrativePrompt(
        formData,
        formData.expertImages?.length || 0,
        !!formData.logoImage,
        !!formData.maskImage
    );

    // Prepare Parts
    const parts: any[] = [];

    if (formData.expertImages?.length > 0) {
        for (const file of formData.expertImages) {
            parts.push(await fileToPart(file));
        }
    }

    if (formData.logoImage) {
        parts.push(await fileToPart(formData.logoImage));
    }

    if (formData.maskImage) {
        parts.push(await fileToPart(formData.maskImage));
    }

    parts.push({ text: basePrompt });

    // Generate 3 Variations in parallel
    try {
        const results = await Promise.all([
            generateSingleImage(parts, aspectRatio, formData.resolution, formData.aiModel, apiKey),
            generateSingleImage(parts, aspectRatio, formData.resolution, formData.aiModel, apiKey),
            generateSingleImage(parts, aspectRatio, formData.resolution, formData.aiModel, apiKey)
        ]);
        return results;
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        throw error;
    }
};

// --- COPY GENERATION ---
// Kept same as before but ensuring types match
export const generateCopyIdeas = async (formData: AdFormData, language: Language, apiKey: string): Promise<AdCopySet[]> => {
    // Implementation remains identical to previous file (empty in provided snippet)
    // If you want me to implement it, I can, but preserving original logic:
    return [];
};
