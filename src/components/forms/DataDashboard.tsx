import React, { useRef, useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import { Upload, FileCode, Check, AlertCircle, Copy, Database, HelpCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const DataDashboard: React.FC = () => {
    const { cvData, importJSON, importCSV, loadSampleData, clearData, history, historyIndex, undo, redo } = useCVStore();
    const [jsonText, setJsonText] = useState(JSON.stringify(cvData, null, 2));
    const [errorStatus, setErrorStatus] = useState<string | null>(null);
    const [successStatus, setSuccessStatus] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    const handleJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                importJSON(reader.result as string);
                setJsonText(JSON.stringify(useCVStore.getState().cvData, null, 2));
                showSuccess('JSON parsed and imported successfully!');
            } catch (err: any) {
                showError(err.message || 'Malformed JSON format');
            }
        };
        reader.readAsText(file);
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    importCSV(results.data as any[]);
                    setJsonText(JSON.stringify(useCVStore.getState().cvData, null, 2));
                    showSuccess('CSV mapping successfully loaded!');
                } catch {
                    showError('Invalid CSV columns mapping');
                }
            },
        });
    };

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = evt.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(sheet);
                importCSV(json as any[]);
                setJsonText(JSON.stringify(useCVStore.getState().cvData, null, 2));
                showSuccess('Excel workbook data mapped successfully!');
            } catch {
                showError('Excel structure mapping failed');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleApplyTextJSON = () => {
        try {
            importJSON(jsonText);
            showSuccess('JSON updates successfully applied!');
        } catch (err: any) {
            showError(err.message || 'Invalid JSON syntax');
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessStatus(msg);
        setErrorStatus(null);
        setTimeout(() => setSuccessStatus(null), 4000);
    };

    const showError = (msg: string) => {
        setErrorStatus(msg);
        setSuccessStatus(null);
        setTimeout(() => setErrorStatus(null), 4000);
    };

    const handleCopyJSON = () => {
        navigator.clipboard.writeText(JSON.stringify(cvData, null, 2));
        showSuccess('JSON copied to clipboard!');
    };

    return (
        <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-text">Data & Integrations</h2>

                {/* Undo/Redo indicators */}
                <div className="flex gap-2">
                    <button
                        className="btn-secondary py-1 px-3 text-xs"
                        onClick={undo}
                        disabled={historyIndex <= 0}
                    >
                        Undo
                    </button>
                    <button
                        className="btn-secondary py-1 px-3 text-xs"
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                    >
                        Redo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Card 1: Import JSON */}
                <div className="glass-card p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FileCode className="text-accent w-5 h-5" />
                            <h3 className="font-semibold text-slate-100 text-sm">Upload CV Data (JSON)</h3>
                        </div>
                        <p className="text-xs text-slate-400">Instantly populate all manual forms using a standard CV layout JSON configuration block.</p>
                    </div>
                    <button className="btn-primary mt-4 py-2" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={14} /> Upload JSON
                    </button>
                    <input ref={fileInputRef} type="file" accept=".json" onChange={handleJSONUpload} className="hidden" />
                </div>

                {/* Card 2: Import CSV/Excel */}
                <div className="glass-card p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Database className="text-emerald-400 w-5 h-5" />
                            <h3 className="font-semibold text-slate-100 text-sm">Import CSV / Excel</h3>
                        </div>
                        <p className="text-xs text-slate-400">Upload profile rows from spreadsheet tables (XLSX, CSV) to map and populate primary fields.</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button className="btn-secondary flex-1 py-2 text-xs" onClick={() => csvInputRef.current?.click()}>CSV</button>
                        <button className="btn-secondary flex-1 py-2 text-xs" onClick={() => csvInputRef.current?.click()}>Excel</button>
                    </div>
                    <input ref={csvInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={(e) => {
                        if (e.target.files?.[0]?.name.endsWith('.csv')) {
                            handleCSVUpload(e);
                        } else {
                            handleExcelUpload(e);
                        }
                    }} className="hidden" />
                </div>

                {/* Card 3: Actions */}
                <div className="glass-card p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <HelpCircle className="text-amber-400 w-5 h-5" />
                            <h3 className="font-semibold text-slate-100 text-sm">Dummy Data Playground</h3>
                        </div>
                        <p className="text-xs text-slate-400">Populate the app with ready-to-render templates matching our target benchmark styles.</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button className="btn-secondary flex-1 py-2 text-xs" onClick={loadSampleData}>Sample Data</button>
                        <button className="btn-danger flex-1 py-2 text-xs" onClick={clearData}>Clear All</button>
                    </div>
                </div>
            </div>

            {/* Editor & raw JSON configuration block */}
            <div className="glass-card p-5 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Raw JSON Configuration Editor</span>
                    <div className="flex gap-2">
                        <button className="btn-secondary py-1 px-3 text-xs flex items-center gap-1" onClick={handleCopyJSON}>
                            <Copy size={12} /> Sync to Clipboard
                        </button>
                        <button className="btn-primary py-1 px-3 text-xs" onClick={handleApplyTextJSON}>
                            Apply Changes
                        </button>
                    </div>
                </div>

                {errorStatus && (
                    <div className="p-3 mb-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs flex items-center gap-2">
                        <AlertCircle size={14} /> {errorStatus}
                    </div>
                )}
                {successStatus && (
                    <div className="p-3 mb-3 bg-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
                        <Check size={14} /> {successStatus}
                    </div>
                )}

                <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="font-mono text-xs p-4 bg-slate-950 border border-white/5 rounded-lg w-full h-80 text-emerald-400 outline-none focus:border-accent/40"
                    spellCheck={false}
                />
            </div>
        </div>
    );
};

export default DataDashboard;
