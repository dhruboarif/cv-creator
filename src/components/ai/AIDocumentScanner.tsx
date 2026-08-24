import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useCVStore } from '../../store/cvStore';
import { parseDocumentsWithGemini, getAvailableModels } from '../../services/geminiService';
import type { ScanDocumentInput, ExtractedCVData, GeminiModelInfo } from '../../services/geminiService';
import {
    Sparkles, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Key,
    ExternalLink, Trash2, IdCard, FileCheck, X, ImagePlus, ClipboardPaste
} from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props {
    onClose?: () => void;
}

type DocFile = {
    id: string;
    name: string;
    base64: string;
    mimeType: string;
    previewUrl: string;
};

export default function AIDocumentScanner({ onClose }: Props) {
    const { updateCVData, pushHistory, setActiveTab } = useCVStore();

    const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
    const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('gemini_model') || 'gemini-2.0-flash');
    const [selectedDocs, setSelectedDocs] = useState<DocFile[]>([]);
    const [availableModels, setAvailableModels] = useState<GeminiModelInfo[]>([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [progressMsg, setProgressMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [extractedResult, setExtractedResult] = useState<ExtractedCVData | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    // ─── Convert File to DocFile ───────────────────────────────────────────────
    const processFile = useCallback((file: File) => {
        // Accept images and PDFs only
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'application/pdf'];
        const mimeType = file.type || 'image/jpeg';
        if (!allowed.some(t => mimeType.startsWith(t.split('/')[0]) || mimeType === t)) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setSelectedDocs((prev) => {
                // Avoid duplicates by name+size
                if (prev.some(d => d.name === file.name)) return prev;
                return [...prev, {
                    id: uuid(),
                    name: file.name || `document_${Date.now()}`,
                    base64,
                    mimeType,
                    previewUrl: mimeType.startsWith('image/') ? base64 : '',
                }];
            });
        };
        reader.readAsDataURL(file);
    }, []);

    // ─── File Input Change ─────────────────────────────────────────────────────
    const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        Array.from(e.target.files || []).forEach(processFile);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Drag & Drop Handlers ──────────────────────────────────────────────────
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragOver(true);
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragOver(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        // Only leave if leaving the dropzone itself
        if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            files.forEach(processFile);
        }
    };

    // ─── Paste from clipboard (WhatsApp screenshots) ──────────────────────────
    const handlePaste = useCallback((e: ClipboardEvent) => {
        const items = Array.from(e.clipboardData?.items || []);
        items.forEach(item => {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    // Give it a proper name
                    const pastedFile = new File([file], `pasted_image_${Date.now()}.png`, { type: item.type });
                    processFile(pastedFile);
                }
            }
        });
    }, [processFile]);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    const removeDoc = (id: string) => setSelectedDocs(prev => prev.filter(d => d.id !== id));
    const clearAll = () => { setSelectedDocs([]); setExtractedResult(null); setSuccessMsg(''); setErrorMsg(''); };

    // ─── Fetch Models Dynamically ──────────────────────────────────────────────
    useEffect(() => {
        if (apiKey.length > 20) {
            setIsFetchingModels(true);
            getAvailableModels(apiKey)
                .then(models => {
                    if (models.length > 0) {
                        setAvailableModels(models);
                        // If current selected model is not in the list, auto-select the first one
                        if (!models.some(m => m.name === selectedModel)) {
                            setSelectedModel(models[0].name);
                            localStorage.setItem('gemini_model', models[0].name);
                        }
                    }
                })
                .finally(() => setIsFetchingModels(false));
        }
    }, [apiKey]);

    // ─── API Key & Model ───────────────────────────────────────────────────────
    const handleKeyChange = (val: string) => {
        setApiKey(val);
        localStorage.setItem('gemini_api_key', val.trim());
    };

    const handleModelChange = (val: string) => {
        setSelectedModel(val);
        localStorage.setItem('gemini_model', val);
    };

    // ─── Scan with Gemini ──────────────────────────────────────────────────────
    const handleStartScan = async () => {
        if (!apiKey.trim()) { setErrorMsg('দয়া করে আপনার Gemini API Key দিন।'); return; }
        if (selectedDocs.length === 0) { setErrorMsg('অন্তত একটি ডকুমেন্ট আপলোড বা ড্র্যাগ করুন।'); return; }

        setErrorMsg(''); setSuccessMsg(''); setProgressMsg(''); setIsScanning(true);

        try {
            const docsInput: ScanDocumentInput[] = selectedDocs.map(d => ({
                fileData: d.base64, mimeType: d.mimeType, name: d.name,
            }));
            const result = await parseDocumentsWithGemini(
                docsInput,
                apiKey.trim(),
                selectedModel,
                (msg) => setProgressMsg(msg)
            );
            setExtractedResult(result);
            setProgressMsg('');
            setSuccessMsg('ডকুমেন্ট সফলভাবে বিশ্লেষণ করা হয়েছে! নিচে তথ্য দেখুন।');
        } catch (err: any) {
            setProgressMsg('');
            setErrorMsg(err.message || 'স্ক্যান করতে সমস্যা হয়েছে।');
        } finally {
            setIsScanning(false);
        }
    };

    // ─── Apply to CV ───────────────────────────────────────────────────────────
    const handleApplyToCV = () => {
        if (!extractedResult) return;
        updateCVData((draft) => {
            if (extractedResult.personal) {
                const p = extractedResult.personal;
                if (p.name) draft.personal.name = p.name;
                if (p.fatherName) draft.personal.fatherName = p.fatherName;
                if (p.motherName) draft.personal.motherName = p.motherName;
                if (p.dob) draft.personal.dob = p.dob;
                if (p.nid) draft.personal.nid = p.nid;
                if (p.nationality) draft.personal.nationality = p.nationality;
                if (p.religion) draft.personal.religion = p.religion;
                if (p.gender) draft.personal.gender = p.gender;
                if (p.maritalStatus) draft.personal.maritalStatus = p.maritalStatus;
                if (p.bloodGroup) draft.personal.bloodGroup = p.bloodGroup;
                if (p.address) draft.personal.address = p.address;
                if (p.permanentAddress) draft.personal.permanentAddress = p.permanentAddress;
            }
            if (extractedResult.education?.length) {
                const newEdus = extractedResult.education.map(e => ({
                    id: uuid(), degree: e.degree || '', institution: e.institution || '',
                    board: e.board || '', university: e.board || e.institution || '',
                    group: e.group || '', session: '', passingYear: e.passingYear || '', result: e.result || '',
                }));
                draft.education = [...newEdus, ...draft.education.filter(e => !newEdus.some(n => n.degree.toLowerCase() === e.degree.toLowerCase()))];
            }
            if (extractedResult.careerObjective) draft.careerObjective = extractedResult.careerObjective;
            if (extractedResult.experience?.length) {
                const newExps = extractedResult.experience.map(ex => ({
                    id: uuid(), title: ex.title || '', company: ex.company || '',
                    duration: ex.duration || '', startDate: '', endDate: '', responsibilities: ex.responsibilities || [],
                }));
                draft.experience = [...newExps, ...draft.experience];
            }
        });
        pushHistory('AI Document Auto-Fill');
        alert('🎉 সকল তথ্য সফলভাবে CV-তে পূরণ হয়েছে!');
        if (onClose) onClose();
        setActiveTab('form');
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-indigo-500/20 overflow-hidden max-w-4xl mx-auto">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900/80 to-violet-900/80 px-5 py-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold flex items-center gap-2">
                            AI ডকুমেন্ট দিয়ে CV অটো ফিল
                            <span className="text-[9px] bg-violet-500 text-white px-1.5 py-px rounded-full font-bold uppercase">Gemini AI</span>
                        </h2>
                        <p className="text-[11px] text-slate-300 mt-0.5">NID, জন্মনিবন্ধন, মার্কশিট দিন — AI সব তথ্য বের করে CV পূরণ করে দেবে</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition">
                        <X size={18} className="text-slate-400" />
                    </button>
                )}
            </div>

            <div className="p-5 space-y-5">

                {/* Step 1: API Key */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                            <Key size={13} />১. Gemini API Key (ফ্রি):
                        </label>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1">
                            <ExternalLink size={11} />ফ্রি Key নিন (AI Studio)
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => handleKeyChange(e.target.value)}
                            placeholder="AIzaSy... পেস্ট করুন"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition font-mono"
                        />
                        <select
                            value={selectedModel}
                            onChange={(e) => handleModelChange(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 transition cursor-pointer max-w-[150px]"
                            disabled={isFetchingModels}
                        >
                            {availableModels.length > 0 ? (
                                availableModels.map(m => (
                                    <option key={m.name} value={m.name}>{m.displayName}</option>
                                ))
                            ) : (
                                <>
                                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                </>
                            )}
                        </select>
                    </div>
                    {apiKey && (
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={12} /> API Key সেভ হয়েছে
                        </p>
                    )}
                </div>

                {/* Step 2: Drop Zone */}
                <div>
                    <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                        <IdCard size={13} className="text-indigo-400" />
                        ২. ডকুমেন্ট আপলোড করুন — Drag & Drop, ক্লিক বা Ctrl+V (Paste):
                    </p>

                    {/* Main Drop Zone */}
                    <div
                        ref={dropZoneRef}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 select-none ${
                            isDragOver
                                ? 'border-indigo-400 bg-indigo-500/20 scale-[1.01] shadow-lg shadow-indigo-500/20'
                                : 'border-slate-700 hover:border-indigo-500/60 bg-slate-950/30 hover:bg-slate-950/60'
                        }`}
                    >
                        {/* Animated upload icon */}
                        <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all ${isDragOver ? 'bg-indigo-500 scale-110' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            {isDragOver ? <ImagePlus size={26} className="text-white" /> : <Upload size={24} className="text-indigo-400" />}
                        </div>

                        {isDragOver ? (
                            <div className="text-indigo-300 font-bold text-base">এখানে ছেড়ে দিন!</div>
                        ) : (
                            <>
                                <div className="text-sm font-semibold text-slate-200 mb-1">
                                    ফাইল এখানে Drag & Drop করুন
                                </div>
                                <div className="text-xs text-slate-400 space-y-1">
                                    <p>অথবা ক্লিক করে ফাইল বেছে নিন</p>
                                    <p className="flex items-center justify-center gap-1 text-violet-400">
                                        <ClipboardPaste size={12} />
                                        WhatsApp থেকে কপি করে <kbd className="bg-slate-800 px-1.5 py-px rounded text-[10px] font-mono">Ctrl+V</kbd> Paste করুন
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                                    {['NID কার্ড', 'জন্মনিবন্ধন', 'মার্কশিট', 'সার্টিফিকেট', 'পাসপোর্ট'].map(t => (
                                        <span key={t} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">JPG, PNG, WebP, PDF সাপোর্টেড • একসাথে অনেকগুলো দেওয়া যাবে</p>
                            </>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            multiple
                            className="hidden"
                            onChange={handleFilesSelect}
                        />
                    </div>
                </div>

                {/* Selected Files Preview Grid */}
                {selectedDocs.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-300">
                                {selectedDocs.length}টি ডকুমেন্ট নির্বাচিত:
                            </span>
                            <button onClick={clearAll} className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1">
                                <Trash2 size={11} />সব রিমুভ করুন
                            </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                            {selectedDocs.map((doc) => (
                                <div key={doc.id} className="relative group bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                                    {doc.previewUrl ? (
                                        <img src={doc.previewUrl} alt={doc.name}
                                            className="w-full h-20 object-cover" />
                                    ) : (
                                        <div className="w-full h-20 flex items-center justify-center text-indigo-400 bg-slate-900">
                                            <FileText size={22} />
                                        </div>
                                    )}
                                    <div className="p-1.5">
                                        <p className="text-[10px] text-slate-400 truncate">{doc.name}</p>
                                    </div>
                                    <button
                                        onClick={() => removeDoc(doc.id)}
                                        className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <X size={11} />
                                    </button>
                                </div>
                            ))}
                            {/* Add More Button */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl h-[calc(5rem+2rem+4px)] flex flex-col items-center justify-center cursor-pointer transition text-slate-500 hover:text-indigo-400 gap-1"
                            >
                                <ImagePlus size={18} />
                                <span className="text-[10px]">আরো যোগ করুন</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error / Success */}
                {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-start gap-2">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" /><span>{errorMsg}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-start gap-2">
                        <CheckCircle2 size={15} className="shrink-0 mt-0.5" /><span>{successMsg}</span>
                    </div>
                )}

                {/* Scan Button */}
                <div className="space-y-2">
                    <button
                        onClick={handleStartScan}
                        disabled={isScanning || selectedDocs.length === 0 || !apiKey.trim()}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition shadow-lg ${
                            isScanning
                                ? 'bg-indigo-800/60 text-indigo-300 cursor-wait'
                                : selectedDocs.length === 0 || !apiKey.trim()
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/30'
                        }`}
                    >
                        {isScanning ? (
                            <>
                                <RefreshCw size={18} className="animate-spin shrink-0" />
                                <span className="text-left">{progressMsg || 'প্রস্তুত হচ্ছে...'}</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                <span>স্ক্যান করুন ও CV অটো-ফিল করুন</span>
                                {selectedDocs.length > 0 && (
                                    <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                                        {selectedDocs.length}টি ফাইল
                                    </span>
                                )}
                            </>
                        )}
                    </button>

                    {/* Progress indicator */}
                    {isScanning && (
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse w-3/4" />
                        </div>
                    )}
                </div>

                {/* Extracted Result Preview */}
                {extractedResult && (
                    <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                <FileCheck size={15} />AI দ্বারা প্রাপ্ত তথ্যের সারসংক্ষেপ
                            </h4>
                            <button
                                onClick={handleApplyToCV}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow shadow-emerald-500/20"
                            >
                                <CheckCircle2 size={13} />CV-তে Apply করুন
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {extractedResult.personal && Object.keys(extractedResult.personal).some(k => !!(extractedResult.personal as any)[k]) && (
                                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                                    <span className="font-bold text-slate-300 text-[10px] uppercase tracking-wider block mb-2">👤 ব্যক্তিগত তথ্য:</span>
                                    {extractedResult.personal.name && <div><span className="text-slate-500">নাম:</span> <span className="text-white font-medium">{extractedResult.personal.name}</span></div>}
                                    {extractedResult.personal.fatherName && <div><span className="text-slate-500">পিতা:</span> {extractedResult.personal.fatherName}</div>}
                                    {extractedResult.personal.motherName && <div><span className="text-slate-500">মাতা:</span> {extractedResult.personal.motherName}</div>}
                                    {extractedResult.personal.dob && <div><span className="text-slate-500">জন্মতারিখ:</span> {extractedResult.personal.dob}</div>}
                                    {extractedResult.personal.nid && <div><span className="text-slate-500">NID/রেজি:</span> {extractedResult.personal.nid}</div>}
                                    {extractedResult.personal.address && <div className="text-slate-400">{extractedResult.personal.address}</div>}
                                </div>
                            )}

                            {extractedResult.education && extractedResult.education.length > 0 && (
                                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                                    <span className="font-bold text-slate-300 text-[10px] uppercase tracking-wider block mb-2">🎓 শিক্ষাগত যোগ্যতা ({extractedResult.education.length}টি):</span>
                                    {extractedResult.education.map((edu, i) => (
                                        <div key={i} className="border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                                            <div className="font-semibold text-indigo-300">{edu.degree} <span className="text-slate-400 font-normal">({edu.passingYear})</span></div>
                                            <div className="text-slate-400">{edu.institution} {edu.board && `· ${edu.board}`}</div>
                                            <div className="text-emerald-400">GPA/Result: {edu.result}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
