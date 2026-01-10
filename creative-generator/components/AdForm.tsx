
import React, { useState } from 'react';
import { AdFormData, PLATFORMS, BLUR_STYLES, RESOLUTIONS, TEXT_STYLES, Language } from '../types';
import { InputSection, TextField, SelectField, ToggleGroup } from './InputSection';
import { t } from '../utils/translations';

interface AdFormProps {
    data: AdFormData;
    onChange: (data: AdFormData) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    language: Language;
}

// Icons for Sections
const Icons = {
    Target: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    Assets: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Visuals: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    Copy: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Layout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
};

// Layout Icons
const LayoutIcons = {
    // Subject Positions
    SubLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" className="opacity-30" /><path d="M7 16V14C7 12.8954 7.89543 12 9 12H10C11.1046 12 12 12.8954 12 14V16" /><circle cx="9.5" cy="9.5" r="1.5" /></svg>,
    SubCenter: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" className="opacity-30" /><path d="M9.5 16V14C9.5 12.8954 10.3954 12 11.5 12H12.5C13.6046 12 14.5 12.8954 14.5 14V16" /><circle cx="12" cy="9.5" r="1.5" /></svg>,
    SubRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" className="opacity-30" /><path d="M12 16V14C12 12.8954 12.8954 12 14 12H15C16.1046 12 17 12.8954 17 14V16" /><circle cx="14.5" cy="9.5" r="1.5" /></svg>,

    // Text Positions
    TxtTop: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" className="opacity-30" /><path d="M8 7H16" /><path d="M9 10H15" /></svg>,
    TxtMid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" className="opacity-30" /><path d="M8 11H16" /><path d="M9 14H15" /></svg>,
    TxtBot: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" className="opacity-30" /><path d="M8 15H16" /><path d="M9 18H15" /></svg>,
    TxtLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" className="opacity-30" /><path d="M6 10H12" /><path d="M6 13H10" /></svg>,
    TxtRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" className="opacity-30" /><path d="M12 10H18" /><path d="M14 13H18" /></svg>,
}


export const AdForm: React.FC<AdFormProps> = ({ data, onChange, isGenerating, onGenerate, language }) => {

    // State to manage which section is open (Accordion style)
    const [openSection, setOpenSection] = useState<string>('campaign');

    const handleChange = (field: keyof AdFormData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleChange('logoImage', e.target.files[0]);
        }
    };

    const handleExpertFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileArray = Array.from(e.target.files);
            handleChange('expertImages', fileArray);
        }
    };

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? '' : section);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">

            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-4">

                {/* SECTION 1: CAMPAIGN */}
                <InputSection
                    title={t(language, 'sectionCampaign')}
                    icon={<Icons.Target />}
                    isOpen={openSection === 'campaign'}
                    onToggle={() => toggleSection('campaign')}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <SelectField
                                label={t(language, 'labelPlatform')}
                                options={PLATFORMS}
                                value={data.platform}
                                onChange={(e) => handleChange('platform', e.target.value)}
                            />
                            <SelectField
                                label={t(language, 'labelResolution')}
                                options={RESOLUTIONS}
                                value={data.resolution}
                                onChange={(e) => handleChange('resolution', e.target.value)}
                            />
                        </div>
                        {/* Product and Audience fields removed as requested */}
                    </div>
                </InputSection>

                {/* SECTION 2: ASSETS */}
                <InputSection
                    title={t(language, 'sectionAssets')}
                    icon={<Icons.Assets />}
                    isOpen={openSection === 'assets'}
                    onToggle={() => toggleSection('assets')}
                >
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">{t(language, 'labelExpertPhoto')}</label>

                            <div className="relative aspect-square w-full max-w-[280px] mx-auto bg-[#09090b] rounded-xl border border-[#2A2D36] overflow-hidden group hover:border-violet-500/50 transition-all">
                                {data.expertImages.length > 0 ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={URL.createObjectURL(data.expertImages[0])}
                                            className="w-full h-full object-cover"
                                            alt="Expert Preview"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => handleChange('expertImages', [])}
                                                className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                        <svg className="w-8 h-8 mb-2 text-gray-600 group-hover:text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">{t(language, 'labelExpertPhoto')}</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleExpertFilesChange} />
                                    </label>
                                )}
                            </div>

                            {data.expertImages.length === 0 && (
                                <TextField
                                    label="Or Describe Expert"
                                    placeholder="..."
                                    value={data.expertDescription}
                                    onChange={(e) => handleChange('expertDescription', e.target.value)}
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">{t(language, 'labelLogoFile')}</label>
                            <label className="flex items-center gap-3 px-3 py-2 bg-[#09090b] border border-[#2A2D36] rounded-xl cursor-pointer hover:border-violet-500/50 transition-all group">
                                <svg className="w-4 h-4 text-gray-500 group-hover:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <span className="text-[11px] text-gray-400 truncate group-hover:text-gray-200">
                                    {data.logoImage ? data.logoImage.name : 'Choose Logo...'}
                                </span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoFileChange} />
                            </label>
                        </div>
                    </div>
                </InputSection>

                {/* SECTION 3: VISUALS */}
                <InputSection
                    title={t(language, 'sectionVisuals')}
                    icon={<Icons.Visuals />}
                    isOpen={openSection === 'visuals'}
                    onToggle={() => toggleSection('visuals')}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-5 gap-3">
                            <div className="col-span-2 group">
                                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Highlight</label>
                                <div
                                    className="w-full h-[42px] rounded-xl border border-[#2A2D36] flex items-center px-3 cursor-pointer relative hover:border-[#3F4451] bg-[#09090b] transition-colors"
                                >
                                    <span className="text-[11px] font-mono text-gray-400 group-hover:text-violet-400 transition-colors">{data.mainColor}</span>
                                    <input
                                        type="color"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        value={data.mainColor}
                                        onChange={(e) => handleChange('mainColor', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-span-3">
                                <TextField
                                    label="Brand Colors (Hex)"
                                    placeholder="#FFF, #000"
                                    value={data.brandColors}
                                    onChange={(e) => handleChange('brandColors', e.target.value)}
                                />
                            </div>
                        </div>

                        <TextField
                            label={t(language, 'labelScene')}
                            multiline
                            placeholder="Describe the environment..."
                            value={data.sceneDescription}
                            onChange={(e) => handleChange('sceneDescription', e.target.value)}
                        />
                        <TextField
                            label={t(language, 'labelObjects')}
                            placeholder="Specific items (e.g. laptop, chart)..."
                            value={data.visualObjects}
                            onChange={(e) => handleChange('visualObjects', e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <SelectField
                                label={t(language, 'labelTextStyle')}
                                options={TEXT_STYLES}
                                value={data.textStyle}
                                onChange={(e) => handleChange('textStyle', e.target.value)}
                            />
                            <SelectField
                                label={t(language, 'labelBlur')}
                                options={BLUR_STYLES}
                                value={data.blurStyle}
                                onChange={(e) => handleChange('blurStyle', e.target.value)}
                            />
                        </div>
                    </div>
                </InputSection>

                {/* SECTION 4: COPY */}
                <InputSection
                    title={t(language, 'sectionCopy')}
                    icon={<Icons.Copy />}
                    isOpen={openSection === 'copy'}
                    onToggle={() => toggleSection('copy')}
                >
                    <div className="space-y-3">
                        <TextField
                            label={t(language, 'labelHeadline')}
                            placeholder="HEADLINE GOES HERE"
                            value={data.headline}
                            onChange={(e) => handleChange('headline', e.target.value)}
                            className="font-bold text-sm"
                        />
                        <TextField
                            label={t(language, 'labelSubHeadline')}
                            multiline
                            placeholder="Subheadline text..."
                            value={data.subHeadline}
                            onChange={(e) => handleChange('subHeadline', e.target.value)}
                            className="text-xs min-h-[60px]"
                        />
                        <TextField
                            label={t(language, 'labelCTA')}
                            placeholder="BUTTON TEXT"
                            value={data.ctaText}
                            onChange={(e) => handleChange('ctaText', e.target.value)}
                            className="font-bold text-violet-400"
                        />
                    </div>
                </InputSection>

                {/* SECTION 5: LAYOUT */}
                <InputSection
                    title={t(language, 'sectionLayout')}
                    icon={<Icons.Layout />}
                    isOpen={openSection === 'layout'}
                    onToggle={() => toggleSection('layout')}
                >
                    <div className="space-y-5">
                        <ToggleGroup
                            label={t(language, 'labelSubjectPos')}
                            value={data.subjectPosition}
                            onChange={(val) => handleChange('subjectPosition', val)}
                            options={[
                                { value: 'Left Side', icon: LayoutIcons.SubLeft, label: 'Left' },
                                { value: 'Center', icon: LayoutIcons.SubCenter, label: 'Center' },
                                { value: 'Right Side', icon: LayoutIcons.SubRight, label: 'Right' },
                            ]}
                        />
                        <ToggleGroup
                            label={t(language, 'labelTextPos')}
                            value={data.textPosition}
                            onChange={(val) => handleChange('textPosition', val)}
                            options={[
                                { value: 'Center Top', icon: LayoutIcons.TxtTop },
                                { value: 'Center Middle', icon: LayoutIcons.TxtMid },
                                { value: 'Center Bottom', icon: LayoutIcons.TxtBot },
                                { value: 'Left Center', icon: LayoutIcons.TxtLeft },
                                { value: 'Right Center', icon: LayoutIcons.TxtRight },
                            ]}
                        />
                        {/* Text Background Color Input */}
                        <div className="bg-[#09090b] border border-[#2A2D36] rounded-xl p-3 flex items-center justify-between group hover:border-[#3F4451] transition-colors">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-300">
                                Text Backdrop
                            </label>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-6 h-6 rounded border border-white/10 shadow-sm cursor-pointer relative overflow-hidden"
                                    style={{ backgroundColor: data.textOverlayColor }}
                                >
                                    <input
                                        type="color"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        value={data.textOverlayColor}
                                        onChange={(e) => handleChange('textOverlayColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </InputSection>

                {/* Spacer for button */}
                <div className="h-16"></div>

            </div>

            {/* Floating Action Button */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-10">
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className={`w-full py-4 rounded-2xl text-white font-bold text-base shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border border-white/10
            ${isGenerating
                            ? 'bg-gray-800 cursor-not-allowed opacity-75'
                            : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-fuchsia-500/20'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{t(language, 'btnGenerating')}</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            <span>{t(language, 'btnGenerate')}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
