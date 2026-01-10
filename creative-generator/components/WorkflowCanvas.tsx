
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AdFormData, Language, PLATFORMS, RESOLUTIONS, BLUR_STYLES, AI_MODELS } from '../types';
import { TextField, SelectField } from './InputSection';

interface WorkflowCanvasProps {
    data: AdFormData;
    onChange: (data: AdFormData) => void;
    onGenerate: (data?: AdFormData) => void;
    isGenerating: boolean;
    language: Language;
    generatedImages?: string[] | null;
}

// --- Dynamic Node System Types ---
type NodeType = 'expert' | 'mask' | 'logo' | 'copy' | 'visuals' | 'elements' | 'generation';

interface NodeData {
    id: string;
    type: NodeType;
    x: number;
    y: number;
}

interface Connection {
    id: string;
    fromNode: string;
    toNode: string;
}

// --- Icons ---
const Icons = {
    Image: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Mask: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeDasharray="2 2" /></svg>,
    Logo: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Copy: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Visuals: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    Elements: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Gen: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
};

// --- Drag & Drop Zone Component ---
const FileDropZone = ({ onFileSelect, files, label, icon, accept = "image/*" }: any) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (files && files.length > 0) {
            const url = URL.createObjectURL(files[0]);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreview(null);
        }
    }, [files]);

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-0 border-2 border-dashed rounded-xl transition-all duration-200 group overflow-hidden h-40 ${isDragOver ? 'border-violet-500 bg-violet-500/10 scale-[1.02]' : 'border-[#2A2D36] bg-[#09090b] hover:border-gray-500'}`}
        >
            {preview ? (
                <div className="absolute inset-0 w-full h-full">
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[10px] text-white font-bold mb-1 shadow-sm">Alterar Imagem</p>
                        {icon}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-6 w-full h-full">
                    <div className={`mb-2 transition-colors ${isDragOver ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-300'}`}>{icon}</div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</p>
                    <span className="text-[10px] text-gray-600">Arraste ou Clique</span>
                </div>
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept={accept} multiple onChange={(e) => e.target.files && onFileSelect(Array.from(e.target.files))} />
        </div>
    )
}

// --- Node Wrapper Component ---
interface NodeWrapperProps {
    id: string; title: string; color: string; x: number; y: number; children: React.ReactNode;
    onDragStart: (e: React.MouseEvent, id: string) => void;
    onDelete: () => void;
    onSocketMouseDown: (e: React.MouseEvent, id: string, type: 'input' | 'output') => void;
    onSocketMouseUp: (e: React.MouseEvent, id: string, type: 'input' | 'output') => void;
    hasInput?: boolean; hasOutput?: boolean;
}

const NodeWrapper: React.FC<NodeWrapperProps> = ({ id, title, color, x, y, children, onDragStart, onDelete, onSocketMouseDown, onSocketMouseUp, hasInput = true, hasOutput = true }) => {
    return (
        <div
            className="absolute flex flex-col rounded-2xl shadow-2xl border border-white/10 bg-[#121212] backdrop-blur-xl animate-in fade-in zoom-in duration-200"
            style={{ left: x, top: y, width: 300, zIndex: 10 }}
            onMouseDown={(e) => onDragStart(e, id)}
        >
            {hasInput && (
                <div
                    className="absolute -left-3 top-10 w-6 h-6 bg-[#121212] border-2 border-gray-600 rounded-full flex items-center justify-center cursor-crosshair hover:border-white hover:scale-110 transition-all z-50 group shadow-lg"
                    onMouseDown={(e) => { e.stopPropagation(); onSocketMouseDown(e, id, 'input'); }}
                    onMouseUp={(e) => { e.stopPropagation(); onSocketMouseUp(e, id, 'input'); }}
                ><div className="w-2 h-2 bg-gray-500 rounded-full group-hover:bg-white transition-colors"></div></div>
            )}
            {hasOutput && (
                <div
                    className="absolute -right-3 top-10 w-6 h-6 bg-[#121212] border-2 border-gray-600 rounded-full flex items-center justify-center cursor-crosshair hover:border-white hover:scale-110 transition-all z-50 group shadow-lg"
                    onMouseDown={(e) => { e.stopPropagation(); onSocketMouseDown(e, id, 'output'); }}
                    onMouseUp={(e) => { e.stopPropagation(); onSocketMouseUp(e, id, 'output'); }}
                ><div className="w-2 h-2 bg-gray-500 rounded-full group-hover:bg-white transition-colors"></div></div>
            )}
            <div className="h-1 rounded-t-2xl w-full" style={{ backgroundColor: color }}></div>
            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-[#1A1A1A] rounded-t-lg cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
                    <span className="font-bold text-[10px] uppercase tracking-widest text-gray-300">{title}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-600 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-500/10 group">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="p-4 space-y-3 cursor-default" onMouseDown={(e) => e.stopPropagation()}>{children}</div>
        </div>
    );
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ data, onChange, onGenerate, isGenerating, language, generatedImages }) => {
    const [nodes, setNodes] = useState<NodeData[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [activePathIds, setActivePathIds] = useState<Set<string>>(new Set());
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [dragNodeId, setDragNodeId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleChange = (field: keyof AdFormData, value: any) => { onChange({ ...data, [field]: value }); };

    const handleAddNode = (type: NodeType) => {
        const id = `${type}_${Date.now()}`;
        let containerWidth = window.innerWidth;
        let containerHeight = window.innerHeight;
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            containerWidth = rect.width;
            containerHeight = rect.height;
        }
        const centerX = (-pan.x + containerWidth / 2) - 150;
        const centerY = (-pan.y + containerHeight / 2) - 150;
        const spreadX = nodes.length === 0 ? 0 : Math.random() * 60 - 30;
        const spreadY = nodes.length === 0 ? 0 : Math.random() * 60 - 30;
        setNodes(prev => [...prev, { id, type, x: centerX + spreadX, y: centerY + spreadY }]);
    };

    const handleDeleteNode = (id: string) => {
        setNodes(prev => prev.filter(n => n.id !== id));
        setConnections(prev => prev.filter(c => c.fromNode !== id && c.toNode !== id));
    };

    const triggerGenerationFromNode = (genNodeId: string) => {
        const upstreamNodeIds = new Set<string>();
        const stack = [genNodeId];
        while (stack.length > 0) {
            const currentId = stack.pop()!;
            upstreamNodeIds.add(currentId);
            const inputs = connections.filter(c => c.toNode === currentId).map(c => c.fromNode);
            inputs.forEach(id => { if (!upstreamNodeIds.has(id)) stack.push(id); });
        }
        const activeTypes = new Set<NodeType>();
        nodes.forEach(n => { if (upstreamNodeIds.has(n.id)) activeTypes.add(n.type); });

        const cleanData: AdFormData = {
            ...data,
            expertImages: activeTypes.has('expert') ? data.expertImages : [],
            expertDescription: activeTypes.has('expert') ? data.expertDescription : '',
            headline: activeTypes.has('copy') ? data.headline : '',
            subHeadline: activeTypes.has('copy') ? data.subHeadline : '',
            ctaText: activeTypes.has('copy') ? data.ctaText : '',
            logoImage: activeTypes.has('logo') ? data.logoImage : null,
            maskImage: activeTypes.has('mask') ? data.maskImage : null,
            sceneDescription: activeTypes.has('visuals') ? data.sceneDescription : '',
            visualObjects: activeTypes.has('elements') ? data.visualObjects : '',
        };

        const connectionIds = new Set<string>();
        connections.forEach(c => { if (upstreamNodeIds.has(c.fromNode) && upstreamNodeIds.has(c.toNode)) connectionIds.add(c.id); });
        setActivePathIds(connectionIds);
        setTimeout(() => { setActivePathIds(new Set()); onGenerate(cleanData); }, 500);
    };

    const handleWheel = (e: React.WheelEvent) => { setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY })); };
    const handleNodeDragStart = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const node = nodes.find(n => n.id === id);
        if (node) { setDragNodeId(id); setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y }); }
    };
    const handleSocketMouseDown = (_: React.MouseEvent, id: string, type: 'input' | 'output') => { if (type === 'output') setConnectingNodeId(id); };
    const handleSocketMouseUp = (_: React.MouseEvent, id: string, type: 'input' | 'output') => {
        if (connectingNodeId && type === 'input' && connectingNodeId !== id) {
            setConnections(prev => [...prev, { id: `${connectingNodeId}-${id}`, fromNode: connectingNodeId, toNode: id }]);
            setConnectingNodeId(null);
        }
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragNodeId) {
            setNodes(prev => prev.map(n => n.id === dragNodeId ? { ...n, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : n));
        }
        if (connectingNodeId) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) setMousePos({ x: e.clientX - rect.left - pan.x, y: e.clientY - rect.top - pan.y });
        }
    };
    const handleMouseUp = () => { setDragNodeId(null); setConnectingNodeId(null); };

    const renderConnections = () => {
        return (
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0">
                <defs>
                    <style>{`@keyframes flowAnimation { 0% { stroke-dashoffset: 20; } 100% { stroke-dashoffset: 0; } } .flow-line { animation: flowAnimation 1s linear infinite; } @keyframes pulsePath { 0% { stroke: #8B5CF6; stroke-width: 2px; } 50% { stroke: #ffffff; stroke-width: 4px; filter: drop-shadow(0 0 5px #fff); } 100% { stroke: #8B5CF6; stroke-width: 2px; } } .active-path { animation: pulsePath 0.5s ease-out; }`}</style>
                </defs>
                {connections.map(conn => {
                    const from = nodes.find(n => n.id === conn.fromNode);
                    const to = nodes.find(n => n.id === conn.toNode);
                    if (!from || !to) return null;
                    const startX = from.x + 300, startY = from.y + 52, endX = to.x, endY = to.y + 52;
                    const dist = Math.abs(endX - startX);
                    const path = `M ${startX} ${startY} C ${startX + dist / 2} ${startY}, ${endX - dist / 2} ${endY}, ${endX} ${endY}`;
                    const isActive = activePathIds.has(conn.id);
                    return (
                        <g key={conn.id}>
                            <path d={path} stroke="#2A2D36" strokeWidth="4" fill="none" />
                            {isActive && <path d={path} stroke="#ffffff" strokeWidth="4" fill="none" className="active-path" />}
                            <path d={path} stroke={isActive ? "#ffffff" : "#8B5CF6"} strokeWidth="2" fill="none" strokeDasharray="10, 10" className="flow-line opacity-80" />
                        </g>
                    );
                })}
                {connectingNodeId && (() => {
                    const from = nodes.find(n => n.id === connectingNodeId);
                    if (!from) return null;
                    const startX = from.x + 300, startY = from.y + 52;
                    const path = `M ${startX} ${startY} C ${startX + 100} ${startY}, ${mousePos.x - 100} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`;
                    return <path d={path} stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5,5" fill="none" className="opacity-50" />;
                })()}
            </svg>
        )
    }

    const renderNodeContent = (node: NodeData) => {
        switch (node.type) {
            case 'expert': return (<><div className="space-y-4"><div className="border-b border-white/5 pb-2 mb-2"><h3 className="text-white font-bold text-sm">Expert / Media</h3><p className="text-[10px] text-gray-500">Source: Upload Main Photo</p></div><FileDropZone label="Foto Principal / Expert" icon={Icons.Image} onFileSelect={(files: File[]) => handleChange('expertImages', files)} files={data.expertImages} /><div className="pt-1"><label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Posição do Personagem</label><div className="flex bg-[#09090b] p-1 rounded-lg border border-[#2A2D36]">{[{ val: 'Left Side', label: 'Esq' }, { val: 'Center', label: 'Centro' }, { val: 'Right Side', label: 'Dir' }].map(opt => (<button key={opt.val} onClick={() => handleChange('subjectPosition', opt.val)} className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all ${data.subjectPosition === opt.val ? 'bg-[#2A2D36] text-white shadow-sm ring-1 ring-white/5' : 'text-gray-500 hover:text-gray-300'}`}>{opt.label}</button>))}</div></div></div></>);
            case 'mask': return (<><div className="space-y-4"><div className="border-b border-white/5 pb-2 mb-2"><h3 className="text-white font-bold text-sm">Mask / Reference</h3><p className="text-[10px] text-gray-500">Process: Define Composition</p></div><FileDropZone label="Máscara (Opcional)" icon={Icons.Mask} onFileSelect={(files: File[]) => handleChange('maskImage', files[0])} files={data.maskImage ? [data.maskImage] : []} /></div></>);
            case 'logo': return (<div className="space-y-4"><div className="border-b border-white/5 pb-2 mb-2"><h3 className="text-white font-bold text-sm">Brand Logo</h3><p className="text-[10px] text-gray-500">Source: Identity</p></div><FileDropZone label="Arquivo de Logo (PNG)" icon={Icons.Logo} onFileSelect={(files: File[]) => handleChange('logoImage', files[0])} files={data.logoImage ? [data.logoImage] : []} /><select className="w-full bg-[#09090b] border border-[#2A2D36] rounded-lg px-2 py-2 text-[10px] text-gray-300" value={data.logoPosition} onChange={(e) => handleChange('logoPosition', e.target.value)}><option value="Above Text">Acima do Texto</option><option value="Center with Text">Centro junto ao Texto</option><option value="Top Corner">Canto Superior</option></select></div>);
            case 'copy': return (<div className="space-y-3"><div className="border-b border-white/5 pb-2 mb-2"><h3 className="text-white font-bold text-sm">Copywriting</h3><p className="text-[10px] text-gray-500">Process: Text Overlay</p></div><TextField label="Headline (H1)" value={data.headline} onChange={(e) => handleChange('headline', e.target.value)} /><TextField label="Subheadline (H2)" value={data.subHeadline} onChange={(e) => handleChange('subHeadline', e.target.value)} multiline /><TextField label="CTA Button" value={data.ctaText} onChange={(e) => handleChange('ctaText', e.target.value)} className="text-violet-400 font-bold" /><div className="pt-2"><label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Alinhamento</label><div className="flex bg-[#09090b] p-1 rounded-lg border border-[#2A2D36]">{['Left Center', 'Center Middle', 'Right Center'].map(pos => (<button key={pos} onClick={() => handleChange('textPosition', pos)} className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all ${data.textPosition === pos ? 'bg-[#2A2D36] text-white' : 'text-gray-500 hover:text-gray-300'}`}>{pos.split(' ')[0]}</button>))}</div></div></div>);
            case 'visuals': return (<div className="space-y-3"><div className="border-b border-white/5 pb-2 mb-2"><h3 className="text-white font-bold text-sm">Visual Engine</h3><p className="text-[10px] text-gray-500">Process: Style</p></div><TextField label="Descrição do Cenário" value={data.sceneDescription} onChange={(e) => handleChange('sceneDescription', e.target.value)} multiline /><div className="grid grid-cols-2 gap-2"><div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Cor Principal</label><div className="h-8 w-full bg-[#09090b] border border-[#2A2D36] rounded-lg relative overflow-hidden flex items-center px-2"><div className="w-full h-4 rounded" style={{ backgroundColor: data.mainColor }}></div><input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={data.mainColor} onChange={(e) => handleChange('mainColor', e.target.value)} /></div></div><div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Fundo Texto</label><div className="h-8 w-full bg-[#09090b] border border-[#2A2D36] rounded-lg relative overflow-hidden flex items-center px-2"><div className="w-full h-4 rounded" style={{ backgroundColor: data.textOverlayColor }}></div><input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={data.textOverlayColor} onChange={(e) => handleChange('textOverlayColor', e.target.value)} /></div></div></div></div>);
            case 'elements': return (<div className="space-y-3"><div className="border-b border-white/5 pb-2 mb-2"><h3 className="text-white font-bold text-sm">Elements</h3><p className="text-[10px] text-gray-500">Process: Details</p></div><TextField label="Objetos / Elementos Visuais" value={data.visualObjects} onChange={(e) => handleChange('visualObjects', e.target.value)} placeholder="Ex: Notebook, gráficos..." /><SelectField label="Estilo de Profundidade (Blur)" options={BLUR_STYLES} value={data.blurStyle} onChange={(e) => handleChange('blurStyle', e.target.value)} /></div>);
            case 'generation': return (<div className="space-y-4"><div className="border-b border-white/5 pb-2 mb-2"><h3 className="text-white font-bold text-sm">Renderer</h3><p className="text-[10px] text-gray-500">Destination: Output</p></div><div className="grid grid-cols-2 gap-2"><SelectField label="Plataforma" options={PLATFORMS} value={data.platform} onChange={(e) => handleChange('platform', e.target.value)} /><SelectField label="Resolução" options={RESOLUTIONS} value={data.resolution} onChange={(e) => handleChange('resolution', e.target.value)} /></div><div className="border-t border-white/5 pt-2"><label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Modelo de IA</label><select className="w-full bg-[#09090b] border border-[#2A2D36] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500" value={data.aiModel} onChange={(e) => handleChange('aiModel', e.target.value)}>{AI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}</select></div><button onClick={() => triggerGenerationFromNode(node.id)} disabled={isGenerating} className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${isGenerating ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-violet-500/20'}`}>{isGenerating ? 'Gerando...' : 'GERAR IMAGEM'}</button><div className="w-full aspect-[4/5] bg-black rounded-xl border border-[#2A2D36] relative overflow-hidden group">{generatedImages && generatedImages.length > 0 ? (<img src={generatedImages[generatedImages.length - 1]} alt="Generated" className="w-full h-full object-cover animate-in fade-in duration-700" />) : (<div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"><svg className="w-8 h-8 text-gray-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p className="text-[10px] text-gray-600">A imagem gerada aparecerá aqui</p></div>)}{isGenerating && (<div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>)}</div></div>);
            default: return null;
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-[#050505] overflow-hidden relative select-none" onWheel={handleWheel} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#4B5563 1px, transparent 1px)', backgroundSize: '24px 24px', transform: `translate(${pan.x % 24}px, ${pan.y % 24}px)` }}></div>
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-[#050505]/90 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                    <div className="text-center mb-10"><h1 className="text-3xl font-bold text-white mb-2">Seu espaço está pronto</h1><p className="text-gray-400">Escolha seu primeiro nó e comece a criar</p></div>
                    <div className="flex gap-4">
                        <button onClick={() => handleAddNode('expert')} className="w-40 h-48 bg-[#0F1014] border border-[#272A34] rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-[#1A1C23] hover:border-[#8B5CF6]/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all group"><div className="p-3 bg-[#1A1C23] rounded-xl text-gray-400 group-hover:text-white group-hover:bg-[#8B5CF6]/20 transition-all">{Icons.Image}</div><span className="font-semibold text-gray-300 group-hover:text-white">Expert / Mídia</span></button>
                        <button onClick={() => handleAddNode('mask')} className="w-40 h-48 bg-[#0F1014] border border-[#272A34] rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-[#1A1C23] hover:border-[#2DD4BF]/50 hover:shadow-[0_0_30px_rgba(45,212,191,0.1)] transition-all group"><div className="p-3 bg-[#1A1C23] rounded-xl text-gray-400 group-hover:text-white group-hover:bg-[#2DD4BF]/20 transition-all">{Icons.Mask}</div><span className="font-semibold text-gray-300 group-hover:text-white">Máscara / Ref</span></button>
                        <button onClick={() => handleAddNode('logo')} className="w-40 h-48 bg-[#0F1014] border border-[#272A34] rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-[#1A1C23] hover:border-[#EC4899]/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] transition-all group"><div className="p-3 bg-[#1A1C23] rounded-xl text-gray-400 group-hover:text-white group-hover:bg-[#EC4899]/20 transition-all">{Icons.Logo}</div><span className="font-semibold text-gray-300 group-hover:text-white">Logo</span></button>
                        <button onClick={() => handleAddNode('copy')} className="w-40 h-48 bg-[#0F1014] border border-[#272A34] rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-[#1A1C23] hover:border-[#10B981]/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all group"><div className="p-3 bg-[#1A1C23] rounded-xl text-gray-400 group-hover:text-white group-hover:bg-[#10B981]/20 transition-all">{Icons.Copy}</div><span className="font-semibold text-gray-300 group-hover:text-white">Texto</span></button>
                        <button onClick={() => handleAddNode('generation')} className="w-40 h-48 bg-[#0F1014] border border-[#272A34] rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-[#1A1C23] hover:border-[#F59E0B]/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all group"><div className="p-3 bg-[#1A1C23] rounded-xl text-gray-400 group-hover:text-white group-hover:bg-[#F59E0B]/20 transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div><span className="font-semibold text-gray-300 group-hover:text-white">Gerar imagem</span></button>
                    </div>
                </div>
            )}
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }} className="w-full h-full absolute top-0 left-0">
                {renderConnections()}
                {nodes.map(node => (
                    <NodeWrapper key={node.id} id={node.id} x={node.x} y={node.y}
                        title={node.type === 'expert' ? 'Expert / Mídia' : node.type === 'mask' ? 'Máscara / Ref' : node.type === 'logo' ? 'Branding / Logo' : node.type === 'copy' ? 'Texto / Copy' : node.type === 'visuals' ? 'Assistente Visual' : node.type === 'elements' ? 'Elementos & Blur' : 'Gerador Final'}
                        color={node.type === 'expert' ? '#EC4899' : node.type === 'mask' ? '#2DD4BF' : node.type === 'logo' ? '#DB2777' : node.type === 'copy' ? '#10B981' : node.type === 'visuals' ? '#3B82F6' : node.type === 'elements' ? '#8B5CF6' : '#F59E0B'}
                        hasInput={node.type !== 'expert'} hasOutput={node.type !== 'generation'}
                        onDragStart={handleNodeDragStart} onDelete={() => handleDeleteNode(node.id)} onSocketMouseDown={handleSocketMouseDown} onSocketMouseUp={handleSocketMouseUp}
                    >{renderNodeContent(node)}</NodeWrapper>
                ))}
            </div>
            {nodes.length > 0 && (<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#0F1014]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500"><ToolbarButton icon={Icons.Image} label="Expert" onClick={() => handleAddNode('expert')} color="hover:text-pink-400" /><ToolbarButton icon={Icons.Mask} label="Máscara" onClick={() => handleAddNode('mask')} color="hover:text-teal-400" /><ToolbarButton icon={Icons.Logo} label="Logo" onClick={() => handleAddNode('logo')} color="hover:text-pink-600" /><ToolbarButton icon={Icons.Copy} label="Texto" onClick={() => handleAddNode('copy')} color="hover:text-emerald-400" /><ToolbarButton icon={Icons.Visuals} label="Visual" onClick={() => handleAddNode('visuals')} color="hover:text-blue-400" /><ToolbarButton icon={Icons.Elements} label="Elementos" onClick={() => handleAddNode('elements')} color="hover:text-violet-400" /><div className="w-px h-8 bg-white/10 mx-2"></div><ToolbarButton icon={Icons.Gen} label="Gerador" onClick={() => handleAddNode('generation')} color="hover:text-amber-400" /></div>)}
            {nodes.length > 0 && (<div className="absolute top-4 left-4 text-[10px] text-gray-500 pointer-events-none font-mono z-50">WORKFLOW STUDIO v3.2<br />PAN: {Math.round(pan.x)}, {Math.round(pan.y)}</div>)}
        </div>
    );
};
const ToolbarButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, color: string }> = ({ icon, label, onClick, color }) => (<button onClick={onClick} className={`flex flex-col items-center gap-1 group transition-transform hover:scale-110 active:scale-95 ${color}`}><div className="p-2 rounded-lg bg-[#1A1C23] border border-white/5 group-hover:border-current transition-colors text-gray-400 group-hover:text-inherit">{icon}</div><span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-200">{label}</span></button>);
