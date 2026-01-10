
import React from 'react';
import { Language } from '../types';
import { t } from '../utils/translations';

interface ResultViewProps {
    imageUrls: string[] | null;
    isGenerating: boolean;
    error: string | null;
    language: Language;
    onRemix: () => void; // New Prop
}

export const ResultView: React.FC<ResultViewProps> = ({ imageUrls, isGenerating, error, language, onRemix }) => {
    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pb-24 relative z-10">

                {error && (
                    <div className="max-w-3xl mx-auto w-full bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl mb-8 flex items-center gap-3 backdrop-blur-md">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div>
                            <strong className="block font-semibold">{t(language, 'errorTitle')}</strong>
                            <span className="text-sm opacity-80">{error}</span>
                        </div>
                    </div>
                )}

                {/* Placeholder State */}
                {!imageUrls && !isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center min-h-[600px]">
                        <div className="w-full max-w-md p-8 rounded-3xl border border-dashed border-[#2A2D36] bg-[#0F1014]/50 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-tr from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-xl text-white font-bold mb-3 tracking-tight">{t(language, 'previewReady')}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{t(language, 'previewReadyDesc')}</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center min-h-[600px]">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-4 border-[#2A2D36]"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-violet-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 bg-violet-400 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.6)] animate-pulse"></div>
                            </div>
                        </div>
                        <h3 className="text-2xl text-white font-bold mt-8 mb-2 tracking-tight animate-pulse">{t(language, 'previewDesigning')}</h3>
                        <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">{t(language, 'previewRunning')}</p>
                    </div>
                )}

                {/* Results Grid */}
                {imageUrls && !isGenerating && (
                    <div className="w-full max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white tracking-tight">{t(language, 'generatedTitle')}</h2>
                            <div className="h-px bg-gradient-to-r from-[#2A2D36] to-transparent flex-1 ml-8"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {imageUrls.map((url, index) => (
                                <div key={index} className="group relative">
                                    <div className="relative aspect-[4/5] bg-[#0F1014] rounded-2xl border border-white/5 shadow-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-[0_20px_50px_-12px_rgba(139,92,246,0.2)]">
                                        <img
                                            src={url}
                                            alt={`Variation ${index + 1}`}
                                            className="w-full h-full object-cover transition-opacity duration-500"
                                            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                                        />

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <a
                                                    href={url}
                                                    download={`ad-variation-${index + 1}.png`}
                                                    className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2 mb-3 shadow-lg"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    {t(language, 'btnDownload')}
                                                </a>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(url)}
                                                    className="w-full bg-black/50 backdrop-blur text-white border border-white/20 hover:bg-black/70 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                    Copy URL
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between px-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Variation 0{index + 1}</span>
                                        <span className="w-2 h-2 rounded-full bg-violet-500/50"></span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Remix Button Area */}
                        <div className="flex justify-center pb-20">
                            <button
                                onClick={onRemix}
                                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-[#15171B] border border-[#2A2D36] rounded-full hover:border-violet-500/50 hover:bg-[#1A1C23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-xl"
                            >
                                <span className="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                                <span className="relative flex items-center gap-3">
                                    <div className="p-1.5 bg-violet-500/20 rounded-full group-hover:bg-violet-500/30 transition-colors">
                                        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </div>
                                    Generate Next Batch (Remix & Expand)
                                </span>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
