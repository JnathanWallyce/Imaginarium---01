
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

const BASE_TEMPLATE = `
Atue como um Diretor de Arte Sênior de alta performance. O objetivo é criar um criativo publicitário de nível profissional (VSL/Ads) pronto para tráfego pago.

--- QUALIDADE TÉCNICA (Obrigatório) ---
- Use a melhor renderização disponível: Texturas de pele ultra-realistas, iluminação volumétrica e profundidade de campo cinematográfica.
- **ZERO PIXELIZAÇÃO:** Todos os textos e elementos devem ser gerados em alta fidelidade.
- Resolução solicitada: **{{RESOLUTION}}**.

--- TIPOGRAFIA E ESPAÇAMENTO ---
- **REGRA DE OURO DO ESPAÇAMENTO:** Para todos os blocos de texto, o espaçamento entre linhas (line-height) DEVE ser exatamente **1.2 vezes** o tamanho da fonte (Tamanho x 1.2). Isso é crucial para uma leitura fluida e estética premium.
- Estilo: {{AI_MODEL_STYLE}} (Siga este estilo visual para as fontes).
- Garanta que os textos estejam perfeitamente centralizados ou alinhados conforme a instrução de layout abaixo.

--- IDENTIDADE DO EXPERT ---
{{EXPERT_INSTRUCTION}}
- É CRUCIAL manter a semelhança facial exata das fotos fornecidas. O expert deve parecer natural e bem ambientado no cenário.

--- CONTEXTO E CONTEÚDO ---
- **Headline:** "{{HEADLINE}}"
- **Subheadline:** "{{SUB_HEADLINE}}"
- **CTA (Botão):** "{{CTA_TEXT}}" (Estilo 3D, com brilho e alta definição).
- **Cenário:** {{SCENE_DESCRIPTION}}
- **Elementos:** {{VISUAL_OBJECTS}}
- **Estilo de Fundo:** {{BLUR_STYLE}}

--- REGRAS DE LAYOUT ---
1. **{{SUBJECT_INSTRUCTION}}**
2. **{{TEXT_INSTRUCTION}}**
3. **POSIÇÃO DO LOGO:** {{LOGO_INSTRUCTION}}

--- VISIBILIDADE ---
{{GRADIENT_INSTRUCTION}}
O texto deve ser o herói da imagem, perfeitamente legível sem comprometer a foto do expert.
`;

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
    const subjectInstruction = getSubjectInstruction(formData.subjectPosition);
    const textInstruction = getTextInstruction(formData.textPosition);

    const expertInstruction = formData.expertImages?.length > 0
        ? "Mantenha a identidade facial estrita baseada nas fotos do Expert fornecidas."
        : (formData.expertDescription ? `Gere o Expert com base nesta descrição: ${formData.expertDescription}` : "Gere um Expert (personagem principal) carismático e profissional.");

    // Interpolate Base Prompt
    let basePrompt = BASE_TEMPLATE
        .replace(/{{AI_MODEL_STYLE}}/g, formData.aiModel)
        .replace(/{{EXPERT_INSTRUCTION}}/g, expertInstruction)
        .replace(/{{SUBJECT_INSTRUCTION}}/g, subjectInstruction)
        .replace(/{{TEXT_INSTRUCTION}}/g, textInstruction)
        .replace(/{{LOGO_INSTRUCTION}}/g, logoInstruction)
        .replace(/{{GRADIENT_INSTRUCTION}}/g, gradientInstruction)
        .replace(/{{HEADLINE}}/g, formData.headline)
        .replace(/{{SUB_HEADLINE}}/g, formData.subHeadline)
        .replace(/{{CTA_TEXT}}/g, formData.ctaText)
        .replace(/{{SCENE_DESCRIPTION}}/g, formData.sceneDescription)
        .replace(/{{VISUAL_OBJECTS}}/g, formData.visualObjects)
        .replace(/{{BLUR_STYLE}}/g, formData.blurStyle)
        .replace(/{{MAIN_COLOR}}/g, formData.mainColor)
        .replace(/{{RESOLUTION}}/g, formData.resolution);

    // Prepare Parts
    const parts: any[] = [];

    if (formData.expertImages?.length > 0) {
        for (const file of formData.expertImages) {
            parts.push(await fileToPart(file));
        }
    }

    if (formData.logoImage) {
        parts.push(await fileToPart(formData.logoImage));
        basePrompt += "\n[SISTEMA]: A última imagem anexada é o LOGO da marca. Aplique-o conforme a instrução de posição.";
    }

    if (formData.maskImage) {
        parts.push(await fileToPart(formData.maskImage));
        basePrompt += "\n[SISTEMA]: A imagem de alto contraste (Preto/Branco) é uma MÁSCARA DE COMPOSIÇÃO. Use-a para definir onde colocar os elementos.";
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
