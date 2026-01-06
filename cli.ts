
import { generateImage } from './services/geminiService.js';
import { ImageGenerationConfig } from './types.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

// Parse arguments
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

if (help || args.length === 0) {
    console.log(`
Usage:
  npx tsx cli.ts --prompt "Your image description" [options]

Options:
  --prompt <text>       Description of the image to generate
  --apikey <key>        Gemini API Key (or set GEMINI_API_KEY env var)
  --output <path>       Output file path (default: generated.png)
  --mode <mode>         marketing | upscale | generate (default: generate)
  --ratio <ratio>       1:1 | 16:9 | 9:16 | 4:3 | 3:4 (default: 16:9)
  
Examples:
  npx tsx cli.ts --prompt "A futuristic city" --apikey "YOUR_KEY"
  `);
    process.exit(0);
}

const getArg = (flag: string) => {
    const index = args.indexOf(flag);
    return index !== -1 && args[index + 1] ? args[index + 1] : undefined;
};

async function main() {
    const prompt = getArg('--prompt');
    const apiKey = getArg('--apikey') || process.env.GEMINI_API_KEY;
    const output = getArg('--output') || 'generated.png';
    const mode = (getArg('--mode') || 'generate') as 'marketing' | 'upscale' | 'generate'; // Cast to specific string types
    const ratio = (getArg('--ratio') || '16:9') as '1:1' | '16:9' | '9:16' | '4:3' | '3:4'; // Cast to AspectRatio

    if (!prompt && mode !== 'upscale') {
        console.error('Error: --prompt is required for generation mode.');
        process.exit(1);
    }

    if (!apiKey) {
        console.error('Error: API Key is required. Pass --apikey or set GEMINI_API_KEY env var.');
        process.exit(1);
    }

    console.log(`Generating image for prompt: "${prompt}"...`);

    const validMode = mode === 'generate' ? 'free' : mode;

    const config: ImageGenerationConfig = {
        mode: validMode,
        prompt: prompt || '',
        aspectRatio: ratio,
        resolution: '4K',
        activeMaps: { depth: false, mask: false, noise: false },
        marketing: undefined,
        subjectPosition: 'center',
        blurConfig: { enabled: false, color: 'none' },
        heroConfig: { elements: '', effect: 'static' },
        characterImages: []
    };

    try {
        const dataUrl = await generateImage(config, apiKey as string);
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const outputPath = path.resolve(process.cwd(), output);
        fs.writeFileSync(outputPath, buffer);
        console.log(`Success! Image saved to: ${outputPath}`);
    } catch (error: any) {
        console.error('Generation failed:', error.message);
        process.exit(1);
    }
}

main();
