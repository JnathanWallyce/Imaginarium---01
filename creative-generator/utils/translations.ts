
import { Language } from '../types';

type TranslationKey =
    | 'configTitle' | 'configDesc'
    | 'sectionCampaign' | 'sectionCampaignDesc'
    | 'labelPlatform' | 'labelProduct' | 'labelAudience'
    | 'sectionLayout' | 'sectionLayoutDesc'
    | 'labelSubjectPos' | 'labelTextPos'
    | 'sectionCopy' | 'sectionCopyDesc'
    | 'labelHeadline' | 'labelSubHeadline' | 'labelCTA'
    | 'sectionVisuals' | 'sectionVisualsDesc'
    | 'labelScene' | 'labelObjects' | 'labelColor' | 'labelBrandColors' | 'labelBlur' | 'labelResolution'
    | 'labelTextStyle'
    | 'sectionAssets' | 'sectionAssetsDesc'
    | 'labelExpertPhoto' | 'labelExpertDesc'
    | 'labelLogoFile' | 'labelLogoDesc'
    | 'btnGenerate' | 'btnGenerating'
    | 'previewReady' | 'previewReadyDesc'
    | 'previewDesigning' | 'previewRunning'
    | 'btnDownload' | 'errorTitle' | 'errorGeneric' | 'generatedTitle';

const translations: Record<Language, Record<TranslationKey, string>> = {
    en: {
        configTitle: 'Configuration',
        configDesc: 'Define your campaign parameters to generate high-converting creative.',
        sectionCampaign: 'Campaign Basics',
        sectionCampaignDesc: 'Targeting and placement details.',
        labelPlatform: 'Platform',
        labelProduct: 'Product Type',
        labelAudience: 'Target Audience',
        sectionLayout: 'Layout & Composition',
        sectionLayoutDesc: 'Control where elements appear in the frame.',
        labelSubjectPos: 'Subject Position',
        labelTextPos: 'Text Position',
        sectionCopy: 'Copy & Content',
        sectionCopyDesc: 'The text that will appear on the image.',
        labelHeadline: 'Main Headline (H1)',
        labelSubHeadline: 'Sub-Headline (H2)',
        labelCTA: 'Button Text (CTA)',
        sectionVisuals: 'Visual Identity',
        sectionVisualsDesc: 'Colors, setting, and specific elements.',
        labelScene: 'Scene / Background',
        labelObjects: 'Visual Objects / Elements',
        labelColor: 'Accent/Highlight Color',
        labelBrandColors: 'Brand Colors (Hex)',
        labelBlur: 'Depth & Blur Style',
        labelTextStyle: 'Typography Style',
        labelResolution: 'Output Resolution',
        sectionAssets: 'Assets (Optional)',
        sectionAssetsDesc: 'Upload reference images for higher personalization.',
        labelExpertPhoto: 'Expert Photo Reference',
        labelExpertDesc: 'Or Describe the Expert',
        labelLogoFile: 'Logo File',
        labelLogoDesc: 'Or Describe Logo Style',
        btnGenerate: 'Generate 3 Variations',
        btnGenerating: 'Generating 3 Variations...',
        previewReady: 'Ready to Generate',
        previewReadyDesc: 'Fill out the creative brief to start.',
        previewDesigning: 'Designing 3 Unique Creatives...',
        previewRunning: 'Running Gemini 3 Pro (Image Preview)',
        btnDownload: 'Download HD',
        errorTitle: 'Error:',
        errorGeneric: 'Failed to generate images. Please try again.',
        generatedTitle: 'Generated Variations'
    },
    pt: {
        configTitle: 'Configuração',
        configDesc: 'Defina os parâmetros da campanha para gerar criativos de alta conversão.',
        sectionCampaign: 'Básico da Campanha',
        sectionCampaignDesc: 'Detalhes de segmentação e posicionamento.',
        labelPlatform: 'Plataforma',
        labelProduct: 'Tipo de Produto',
        labelAudience: 'Público Alvo',
        sectionLayout: 'Layout e Composição',
        sectionLayoutDesc: 'Controle onde os elementos aparecem no quadro.',
        labelSubjectPos: 'Posição do Sujeito',
        labelTextPos: 'Posição do Texto',
        sectionCopy: 'Texto e Conteúdo',
        sectionCopyDesc: 'O texto que aparecerá na imagem.',
        labelHeadline: 'Título Principal (H1)',
        labelSubHeadline: 'Subtítulo (H2)',
        labelCTA: 'Texto do Botão (CTA)',
        sectionVisuals: 'Identidade Visual',
        sectionVisualsDesc: 'Cores, cenário e elementos específicos.',
        labelScene: 'Cenário / Fundo',
        labelObjects: 'Objetos Visuais / Elementos',
        labelColor: 'Cor de Destaque (Keyword)',
        labelBrandColors: 'Cores da Marca (Hex)',
        labelBlur: 'Estilo de Profundidade/Desfoque',
        labelTextStyle: 'Estilo da Tipografia',
        labelResolution: 'Resolução de Saída',
        sectionAssets: 'Ativos (Opcional)',
        sectionAssetsDesc: 'Envie imagens de referência para maior personalização.',
        labelExpertPhoto: 'Foto de Referência do Expert',
        labelExpertDesc: 'Ou Descreva o Expert',
        labelLogoFile: 'Arquivo de Logo',
        labelLogoDesc: 'Ou Descreva o Estilo do Logo',
        btnGenerate: 'Gerar 3 Variações',
        btnGenerating: 'Gerando 3 Variações...',
        previewReady: 'Pronto para Gerar',
        previewReadyDesc: 'Preencha o briefing criativo para começar.',
        previewDesigning: 'Projetando 3 Criativos Únicos...',
        previewRunning: 'Executando Gemini 3 Pro (Image Preview)',
        btnDownload: 'Baixar HD',
        errorTitle: 'Erro:',
        errorGeneric: 'Falha ao gerar imagens. Tente novamente.',
        generatedTitle: 'Variações Geradas'
    },
    es: {
        configTitle: 'Configuración',
        configDesc: 'Defina los parámetros de la campaña para generar creatividades de alta conversión.',
        sectionCampaign: 'Conceptos Básicos',
        sectionCampaignDesc: 'Detalles de segmentación y ubicación.',
        labelPlatform: 'Plataforma',
        labelProduct: 'Tipo de Producto',
        labelAudience: 'Público Objetivo',
        sectionLayout: 'Diseño y Composición',
        sectionLayoutDesc: 'Controla dónde aparecen los elementos en el encuadre.',
        labelSubjectPos: 'Posición del Sujeto',
        labelTextPos: 'Posición del Texto',
        sectionCopy: 'Texto y Contenido',
        sectionCopyDesc: 'El texto que aparecerá en la imagen.',
        labelHeadline: 'Título Principal (H1)',
        labelSubHeadline: 'Subtítulo (H2)',
        labelCTA: 'Texto del Botón (CTA)',
        sectionVisuals: 'Identidad Visual',
        sectionVisualsDesc: 'Colores, escenario y elementos específicos.',
        labelScene: 'Escenario / Fondo',
        labelObjects: 'Objetos Visuales / Elementos',
        labelColor: 'Color de Acento',
        labelBrandColors: 'Colores de Marca (Hex)',
        labelBlur: 'Estilo de Profundidad/Desenfoque',
        labelTextStyle: 'Estilo de Tipografía',
        labelResolution: 'Resolución de Salida',
        sectionAssets: 'Activos (Opcional)',
        sectionAssetsDesc: 'Sube imágenes de referencia para mayor personalización.',
        labelExpertPhoto: 'Foto de Referencia del Experto',
        labelExpertDesc: 'O Describe al Experto',
        labelLogoFile: 'Archivo de Logo',
        labelLogoDesc: 'O Describe el Estilo del Logo',
        btnGenerate: 'Generar 3 Variaciones',
        btnGenerating: 'Generando 3 Variaciones...',
        previewReady: 'Listo para Generar',
        previewReadyDesc: 'Completa el briefing creativo para comenzar.',
        previewDesigning: 'Diseñando 3 Creatividades Únicas...',
        previewRunning: 'Ejecutando Gemini 3 Pro (Image Preview)',
        btnDownload: 'Descargar HD',
        errorTitle: 'Error:',
        errorGeneric: 'Fallo al generar imágenes. Inténtalo de nuevo.',
        generatedTitle: 'Variaciones Generadas'
    },
};

export const t = (lang: Language, key: TranslationKey): string => {
    return translations[lang][key] || translations['en'][key] || key;
};
