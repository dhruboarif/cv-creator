import React, { useRef, useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import CVRenderer from '../../renderer/CVRenderer';
import { Copy, Trash2, Download, Upload, Edit2, Check, X } from 'lucide-react';

const TemplateSelector: React.FC = () => {
    const { templates, currentTemplateId, setCurrentTemplate, duplicateTemplate, deleteTemplate, importTemplate, exportTemplate, importAllTemplates, exportAllTemplates, updateTemplate, cvData } = useCVStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileInputAllRef = useRef<HTMLInputElement>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                importTemplate(reader.result as string);
            } catch {
                alert('Invalid template file');
            }
        };
        reader.readAsText(file);
    };

    const handleImportAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                importAllTemplates(reader.result as string);
                alert('Templates imported successfully');
            } catch {
                alert('Invalid templates file');
            }
        };
        reader.readAsText(file);
    };

    const handleExport = (id: string) => {
        const json = exportTemplate(id);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template-${id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportAll = () => {
        const json = exportAllTemplates();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all-templates.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const startRename = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const saveRename = (id: string) => {
        if (editName.trim()) {
            updateTemplate(id, { name: editName.trim() });
        }
        setEditingId(null);
    };

    return (
        <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-text">CV Templates</h2>
                <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} title="Import Single">
                        <Upload size={14} /> Import
                    </button>
                    <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                    
                    <button className="btn-secondary" onClick={() => fileInputAllRef.current?.click()} title="Import All">
                        <Upload size={14} /> Import All
                    </button>
                    <input ref={fileInputAllRef} type="file" accept=".json" onChange={handleImportAll} className="hidden" />

                    <button className="btn-primary flex items-center gap-1.5" onClick={handleExportAll}>
                        <Download size={14} /> Export All
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className={`template-card ${currentTemplateId === template.id ? 'selected' : ''}`}
                        onClick={() => setCurrentTemplate(template.id)}
                    >
                        {/* Preview thumbnail */}
                        <div className="relative bg-gray-100 overflow-hidden" style={{ height: 280 }}>
                            <div style={{ transform: 'scale(0.32)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                                <CVRenderer data={cvData} template={template} scale={1} />
                            </div>
                            {currentTemplateId === template.id && (
                                <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-bold">
                                    Active
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                            {editingId === template.id ? (
                                <div className="flex items-center gap-2">
                                    <input className="input-field text-sm py-1" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveRename(template.id)} autoFocus />
                                    <button className="btn-icon" onClick={() => saveRename(template.id)}><Check size={12} /></button>
                                    <button className="btn-icon" onClick={() => setEditingId(null)}><X size={12} /></button>
                                </div>
                            ) : (
                                <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                            )}
                            <p className="text-xs text-slate-400 mb-3">{template.description}</p>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5">
                                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); startRename(template.id, template.name); }} title="Rename">
                                    <Edit2 size={12} />
                                </button>
                                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); duplicateTemplate(template.id); }} title="Duplicate">
                                    <Copy size={12} />
                                </button>
                                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleExport(template.id); }} title="Export">
                                    <Download size={12} />
                                </button>
                                {templates.length > 1 && (
                                    <button
                                        className="btn-icon text-red-400 hover:text-red-300"
                                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete this template?')) deleteTemplate(template.id); }}
                                        title="Delete"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateSelector;
