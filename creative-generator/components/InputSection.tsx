
import React from 'react';

interface InputSectionProps {
    title: string;
    icon?: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export const InputSection: React.FC<InputSectionProps> = ({ title, icon, isOpen, onToggle, children }) => {
    return (
        <div className={`border rounded-2xl transition-all duration-300 overflow-hidden ${isOpen ? 'bg-[#15171B] border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'bg-[#0F1014]/50 border-[#2A2D36] hover:border-[#3F4451]'}`}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none group"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-violet-500/20 text-violet-300' : 'bg-[#1A1C23] text-gray-500 group-hover:text-gray-300'}`}>
                        {icon}
                    </div>
                    <span className={`text-sm font-bold tracking-wide transition-colors ${isOpen ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {title}
                    </span>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-violet-400' : 'text-gray-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </button>

            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-4 pt-0 space-y-5 border-t border-white/5 mt-1">
                    <div className="pt-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label: string;
    multiline?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({ label, multiline, className, ...props }) => {
    const baseClasses = "w-full bg-[#09090b] border border-[#2A2D36] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all hover:border-[#3F4451]";

    return (
        <div className="group">
            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-violet-400 transition-colors">{label}</label>
            {multiline ? (
                <textarea
                    className={`${baseClasses} min-h-[80px] resize-y leading-relaxed custom-scrollbar ${className}`}
                    {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                />
            ) : (
                <input
                    className={`${baseClasses} ${className}`}
                    {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                />
            )}
        </div>
    );
};

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: string[];
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, options, ...props }) => {
    return (
        <div className="group">
            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-violet-400 transition-colors">{label}</label>
            <div className="relative">
                <select
                    className="w-full bg-[#09090b] border border-[#2A2D36] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all appearance-none cursor-pointer hover:border-[#3F4451]"
                    {...props}
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    );
};

export interface ToggleOption {
    value: string;
    label?: string;
    icon?: React.ReactNode;
    tooltip?: string;
}

interface ToggleGroupProps {
    label: string;
    options: ToggleOption[];
    value: string;
    onChange: (value: string) => void;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({ label, options, value, onChange }) => {
    return (
        <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">{label}</label>
            <div className="flex bg-[#09090b] p-1 rounded-xl border border-[#2A2D36]">
                {options.map((option) => {
                    const isSelected = option.value === value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => onChange(option.value)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all duration-200 ${isSelected
                                    ? 'bg-[#2A2D36] text-white shadow-sm ring-1 ring-white/10'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#1F2229]'
                                }`}
                            title={option.tooltip || option.label}
                            type="button"
                        >
                            {option.icon && <span className={`${isSelected ? 'text-violet-400' : 'text-current'}`}>{option.icon}</span>}
                            {option.label && <span>{option.label}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
