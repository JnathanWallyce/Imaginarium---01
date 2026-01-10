
import React, { useState } from 'react';
import { AdForm } from './components/AdForm';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { ResultView } from './components/ResultView';
import { RemixModal } from './components/RemixModal';
import { generateAdCreative, generateCopyIdeas } from './services/adGeniusService';
import { AdFormData, AdCopySet, INITIAL_FORM_STATE, LANGUAGES, Language } from './types';
import { t } from './utils/translations';

interface CreativeGeneratorAppProps {
    apiKey: string;
}

const CreativeGeneratorApp: React.FC<CreativeGeneratorAppProps> = ({ apiKey }) => {
    const [formData, setFormData] = useState<AdFormData>(INITIAL_FORM_STATE);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [copySets, setCopySets] = useState<AdCopySet[]>([]); // Future use
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<Language>('pt');
    const [viewMode, setViewMode] = useState<'form' | 'workflow' | 'results'>('form');
    const [isRemixOpen, setIsRemixOpen] = useState(false);

    const handleGenerate = async (overrideData?: AdFormData) => {
        setIsGenerating(true);
        setError(null);
        setGeneratedImages(null);

        // Switch to results view automatically if trigger comes from form (overrideData is usually undefined)
        // If it comes from Workflow (overrideData present), we might want to stay or switch?
        // Let's switch to results to show progress.
        // actually, workflow has inline preview.
        const isWorkflowTrigger = !!overrideData;

        // Use data from arg (workflow filtered) or state (form)
        const dataToUse = overrideData || formData;

        try {
            // Generate Images
            const images = await generateAdCreative(dataToUse, apiKey);
            setGeneratedImages(images);

            // Generate Copy (Optional/Parallel) - keeping it simple for now
            // const copy = await generateCopyIdeas(dataToUse, language, apiKey);
            // setCopySets(copy);

            // If we are in 'form' mode, we stay in 'form' mode to show results 'na lateral'
            // Only switch to 'results' if we want the full standalone gallery
            /* if (!isWorkflowTrigger) {
                setViewMode('results');
            } */
        } catch (err: any) {
            console.error(err);
            setError(err.message || t(language, 'errorGeneric'));
            if (!isWorkflowTrigger) {
                setViewMode('results'); // Show error
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRemixConfirm = (newSet: AdCopySet) => {
        // Update form with selected remix data then regenerate
        setFormData(prev => ({
            ...prev,
            headline: newSet.headline,
            subHeadline: newSet.subHeadline,
            ctaText: newSet.ctaText,
            sceneDescription: newSet.sceneSuggestion || prev.sceneDescription
        }));
        setIsRemixOpen(false);
        handleGenerate();
    };

    return (
        <div className="flex h-screen bg-[#050505] text-gray-200 font-sans overflow-hidden selection:bg-violet-500/30">

            {/* Sidebar Navigation */}
            <div className="w-20 bg-[#0F1014] border-r border-[#2A2D36] flex flex-col items-center py-6 z-20">
                <NavButton
                    active={false}
                    onClick={() => window.location.href = "/"}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>}
                    tooltip="Voltar ao Menu"
                    className="mb-8"
                />

                <div className="space-y-4 w-full px-2">
                    <NavButton
                        active={viewMode === 'workflow'}
                        onClick={() => setViewMode('workflow')}
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                        tooltip="Workflow Studio"
                    />
                    <NavButton
                        active={viewMode === 'form'}
                        onClick={() => setViewMode('form')}
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        tooltip="Form Mode"
                    />
                    <NavButton
                        active={viewMode === 'results'}
                        onClick={() => setViewMode('results')}
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        tooltip="Gallery / Results"
                    />
                </div>

                <div className="mt-auto space-y-4">
                    {/* Language Switcher */}
                    <div className="relative group">
                        <button className="w-10 h-10 rounded-xl bg-[#1A1C23] border border-[#2A2D36] flex items-center justify-center text-lg hover:border-violet-500/50 transition-colors">
                            {LANGUAGES.find(l => l.code === language)?.flag}
                        </button>
                        <div className="absolute left-12 bottom-0 bg-[#1A1C23] border border-[#2A2D36] rounded-xl p-2 w-32 hidden group-hover:block nav-tooltip z-50">
                            {LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#2A2D36] flex items-center gap-2 ${language === lang.code ? 'text-violet-400' : 'text-gray-400'}`}
                                >
                                    <span>{lang.flag}</span>
                                    <span>{lang.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* View Container */}
                <div className="flex-1 relative">

                    {/* Workflow View */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'workflow' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                        <WorkflowCanvas
                            data={formData}
                            onChange={setFormData}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                            language={language}
                            generatedImages={generatedImages}
                        />
                    </div>

                    {/* Form View (Classic) */}
                    <div className={`absolute inset-0 flex bg-[#050505] transition-opacity duration-300 ${viewMode === 'form' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                        <div className="w-full max-w-xl border-r border-[#2A2D36] bg-[#0F1014]">
                            <AdForm
                                data={formData}
                                onChange={setFormData}
                                isGenerating={isGenerating}
                                onGenerate={() => handleGenerate()}
                                language={language}
                            />
                        </div>
                        <ResultView
                            imageUrls={generatedImages}
                            isGenerating={isGenerating}
                            error={error}
                            language={language}
                            onRemix={() => setIsRemixOpen(true)}
                        />
                    </div>

                    {/* Results View (Standalone) */}
                    <div className={`absolute inset-0 bg-[#050505] transition-opacity duration-300 ${viewMode === 'results' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                        <ResultView
                            imageUrls={generatedImages}
                            isGenerating={isGenerating}
                            error={error}
                            language={language}
                            onRemix={() => setIsRemixOpen(true)}
                        />
                    </div>

                </div>
            </div>

            {/* Modals */}
            <RemixModal
                isOpen={isRemixOpen}
                onClose={() => setIsRemixOpen(false)}
                copySets={copySets}
                onConfirm={handleRemixConfirm}
            />

        </div>
    );
};

const NavButton = ({ active, onClick, icon, tooltip, className = "" }: any) => (
    <div className={`relative group flex items-center justify-center ${className}`}>
        <button
            onClick={onClick}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                ${active
                    ? 'bg-[#2A2D36] text-white shadow-lg border border-white/10'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#1A1C23] border border-transparent hover:border-white/5'
                }`}
        >
            {icon}
        </button>
        {/* Tooltip */}
        <div className="absolute left-14 bg-[#1A1C23] border border-[#2A2D36] text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {tooltip}
        </div>
    </div>
)

export default CreativeGeneratorApp;
