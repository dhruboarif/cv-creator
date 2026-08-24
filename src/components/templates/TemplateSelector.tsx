import React, { useRef, useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import CVRenderer from '../../renderer/CVRenderer';
import { Download, Upload, Edit2, Check, X, Users, BookOpen, Briefcase } from 'lucide-react';
import { baseDesigns } from '../../templates/templateConfigs';
import type { TemplateConfig } from '../../types';

const VARIANT_LABELS: { key: 'Fresher' | 'Split Education' | 'Experienced'; label: string; icon: React.ReactNode; idSuffix: string }[] = [
    { key: 'Fresher',         label: 'Fresher',    icon: <BookOpen size={12} />,   idSuffix: '-fresher'     },
    { key: 'Split Education', label: 'Split Edu',  icon: <Users size={12} />,      idSuffix: '-split'       },
    { key: 'Experienced',     label: 'Experienced',icon: <Briefcase size={12} />,  idSuffix: '-experienced' },
];

const TemplateSelector: React.FC = () => {
    const { templates, currentTemplateId, setCurrentTemplate, importAllTemplates, exportAllTemplates, importTemplate, exportTemplate, updateTemplate, cvData } = useCVStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileInputAllRef = useRef<HTMLInputElement>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Track which variant is "active" per base design (for the tab switcher)
    const [selectedVariant, setSelectedVariant] = useState<Record<string, 'Fresher' | 'Split Education' | 'Experienced'>>({});

    const getVariantForBase = (baseId: string) => selectedVariant[baseId] ?? 'Fresher';

    const getTemplateForBase = (baseId: string): TemplateConfig | undefined => {
        const variant = getVariantForBase(baseId);
        const suffix = VARIANT_LABELS.find(v => v.key === variant)?.idSuffix ?? '-fresher';
        const id = `${baseId}${suffix}`;
        return templates.find(t => t.id === id);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try { importTemplate(reader.result as string); }
            catch { alert('Invalid template file'); }
        };
        reader.readAsText(file);
    };

    const handleImportAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try { importAllTemplates(reader.result as string); alert('Templates imported successfully'); }
            catch { alert('Invalid templates file'); }
        };
        reader.readAsText(file);
    };

    const handleExportAll = () => {
        const json = exportAllTemplates();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all-templates.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportTemplate = (id: string) => {
        const json = exportTemplate(id);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template-${id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const saveRename = (id: string) => {
        if (editName.trim()) updateTemplate(id, { name: editName.trim() });
        setEditingId(null);
    };

    return (
        <div className="p-5 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold gradient-text">CV Templates</h2>
                <div className="flex gap-2 flex-wrap">
                    <button className="btn-secondary text-xs" onClick={() => fileInputRef.current?.click()} title="Import single template">
                        <Upload size={12} /> Import
                    </button>
                    <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                    <button className="btn-secondary text-xs" onClick={() => fileInputAllRef.current?.click()} title="Import all templates">
                        <Upload size={12} /> Import All
                    </button>
                    <input ref={fileInputAllRef} type="file" accept=".json" onChange={handleImportAll} className="hidden" />
                    <button className="btn-primary flex items-center gap-1.5 text-xs" onClick={handleExportAll}>
                        <Download size={12} /> Export All
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><BookOpen size={11} className="text-blue-400" /> Fresher — Education on Page 1</span>
                <span className="flex items-center gap-1"><Users size={11} className="text-purple-400" /> Split Edu — Hybrid layout</span>
                <span className="flex items-center gap-1"><Briefcase size={11} className="text-emerald-400" /> Experienced — Education on Page 2</span>
            </div>

            {/* Template groups — one card per base design */}
            <div className="grid grid-cols-2 gap-5">
                {baseDesigns.map((base) => {
                    const activeVariantKey = getVariantForBase(base.id);
                    const activeTemplate = getTemplateForBase(base.id);
                    const isGroupActive = activeTemplate ? currentTemplateId === activeTemplate.id : false;

                    return (
                        <div
                            key={base.id}
                            className={`template-card rounded-xl overflow-hidden border transition-all ${isGroupActive ? 'border-accent shadow-lg shadow-accent/20' : 'border-white/10'}`}
                        >
                            {/* Preview */}
                            <div
                                className="relative bg-gray-100 overflow-hidden cursor-pointer"
                                style={{ height: 240 }}
                                onClick={() => activeTemplate && setCurrentTemplate(activeTemplate.id)}
                            >
                                <div style={{ transform: 'scale(0.30)', transformOrigin: 'top left', pointerEvents: 'none', width: '794px' }}>
                                    {activeTemplate ? (
                                        <CVRenderer data={cvData} template={activeTemplate} scale={1} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">No template</div>
                                    )}
                                </div>
                                {isGroupActive && (
                                    <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-bold">Active</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3 bg-slate-900/80">
                                <h3 className="font-semibold text-sm mb-0.5 text-white">{base.name}</h3>

                                {/* Variant tabs */}
                                <div className="flex items-center gap-1 mt-2 mb-3">
                                    {VARIANT_LABELS.map((v) => {
                                        const tplId = `${base.id}${v.idSuffix}`;
                                        const isActive = activeVariantKey === v.key;
                                        const isCurrentSelected = currentTemplateId === tplId;
                                        return (
                                            <button
                                                key={v.key}
                                                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all border ${
                                                    isActive
                                                        ? isCurrentSelected
                                                            ? 'bg-accent text-white border-accent'
                                                            : 'bg-slate-700 text-white border-slate-600'
                                                        : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedVariant(prev => ({ ...prev, [base.id]: v.key }));
                                                    setCurrentTemplate(tplId);
                                                }}
                                            >
                                                {v.icon} {v.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5">
                                    {editingId === activeTemplate?.id ? (
                                        <>
                                            <input className="input-field text-xs py-0.5 flex-1" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveRename(activeTemplate.id)} autoFocus />
                                            <button className="btn-icon" onClick={() => saveRename(activeTemplate!.id)}><Check size={11} /></button>
                                            <button className="btn-icon" onClick={() => setEditingId(null)}><X size={11} /></button>
                                        </>
                                    ) : (
                                        <>
                                            {activeTemplate && (
                                                <button className="btn-icon" title="Rename" onClick={(e) => { e.stopPropagation(); setEditingId(activeTemplate.id); setEditName(activeTemplate.name); }}>
                                                    <Edit2 size={11} />
                                                </button>
                                            )}
                                            {activeTemplate && (
                                                <button className="btn-icon" title="Export this variant" onClick={(e) => { e.stopPropagation(); handleExportTemplate(activeTemplate.id); }}>
                                                    <Download size={11} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TemplateSelector;
