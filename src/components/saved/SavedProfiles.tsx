import React, { useState, useRef } from 'react';
import { useCVStore } from '../../store/cvStore';
import {
    Search, Bookmark, Save, Trash2, FolderOpen, User, Calendar,
    Briefcase, Sparkles, Download, Upload, ShieldCheck,
    Cloud, RefreshCw, Key, CheckCircle2, AlertCircle, Link, ExternalLink
} from 'lucide-react';

const JSONBIN_API = 'https://api.jsonbin.io/v3';

export default function SavedProfiles() {
    const { cvData, savedProfiles, saveProfile, loadProfile, deleteProfile, setActiveTab, exportProfilesJSON, importProfilesJSON } = useCVStore();
    const defaultName = cvData.personal.name || '';
    const [profileNameInput, setProfileNameInput] = useState(defaultName);
    const [searchQuery, setSearchQuery] = useState('');
    const [successMessage, setSuccessMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'success' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // JSONBin Cloud Sync state
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('jsonbin_api_key') || '');
    const [binId, setBinId] = useState(() => localStorage.getItem('jsonbin_bin_id') || '');
    const [cloudStatus, setCloudStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
    const [showApiSetup, setShowApiSetup] = useState(false);

    React.useEffect(() => {
        if (cvData.personal.name) setProfileNameInput(cvData.personal.name);
    }, [cvData.personal.name]);

    const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
        setSuccessMessage({ text, type });
        setTimeout(() => setSuccessMessage({ text: '', type: 'success' }), 5000);
    };

    // ─── Local Save ──────────────────────────────────────────────────────────
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const autoName = cvData.personal.name?.trim() || 'My CV Profile';
        const targetName = profileNameInput.trim() || autoName;
        saveProfile(targetName);
        showMsg(`"${targetName}" নাম দিয়ে সেভ করা হয়েছে!`);
    };

    const handleQuickAutoSave = () => {
        const autoName = cvData.personal.name?.trim() || 'My CV Profile';
        saveProfile(autoName);
        showMsg(`"${autoName}" নাম দিয়ে অটোমেটিক সেভ করা হয়েছে!`);
    };

    // ─── Local Backup ─────────────────────────────────────────────────────────
    const handleExportBackup = () => {
        const jsonString = exportProfilesJSON();
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_Profiles_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMsg('সকল CV প্রোফাইল ব্যাকআপ ফাইল ডাউনলোড হয়েছে!');
    };

    const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                importProfilesJSON(content);
                showMsg('ব্যাকআপ ফাইল থেকে সফলভাবে CV প্রোফাইলসমূহ পুনরুদ্ধার করা হয়েছে!');
            } catch {
                showMsg('ভুল ফাইল! সঠিক CV Backup JSON ফাইল সিলেক্ট করুন।', 'error');
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Cloud Sync (JSONBin.io) ──────────────────────────────────────────────
    const saveApiKey = () => {
        localStorage.setItem('jsonbin_api_key', apiKey);
        localStorage.setItem('jsonbin_bin_id', binId);
        setShowApiSetup(false);
        showMsg('API Key ও Bin ID সেভ করা হয়েছে!');
    };

    const handleCloudUpload = async () => {
        if (!apiKey) { setShowApiSetup(true); return; }
        setCloudStatus('syncing');
        const profilesData = JSON.parse(exportProfilesJSON());
        try {
            if (!binId) {
                // Create new bin
                const res = await fetch(`${JSONBIN_API}/b`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Master-Key': apiKey, 'X-Bin-Name': 'cv-creator-profiles', 'X-Bin-Private': 'true' },
                    body: JSON.stringify({ profiles: profilesData }),
                });
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                const newBinId = data.metadata.id;
                setBinId(newBinId);
                localStorage.setItem('jsonbin_bin_id', newBinId);
            } else {
                // Update existing bin
                const res = await fetch(`${JSONBIN_API}/b/${binId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-Master-Key': apiKey },
                    body: JSON.stringify({ profiles: profilesData }),
                });
                if (!res.ok) throw new Error('Update failed');
            }
            setCloudStatus('done');
            showMsg(`✅ ${profilesData.length}টি CV প্রোফাইল Cloud-এ সফলভাবে সেভ হয়েছে!`);
            setTimeout(() => setCloudStatus('idle'), 3000);
        } catch (err) {
            setCloudStatus('error');
            showMsg('Cloud Upload ব্যর্থ হয়েছে! API Key ও Internet সংযোগ চেক করুন।', 'error');
            setTimeout(() => setCloudStatus('idle'), 4000);
        }
    };

    const handleCloudDownload = async () => {
        if (!apiKey || !binId) { setShowApiSetup(true); return; }
        setCloudStatus('syncing');
        try {
            const res = await fetch(`${JSONBIN_API}/b/${binId}/latest`, {
                headers: { 'X-Master-Key': apiKey },
            });
            if (!res.ok) throw new Error('Download failed');
            const data = await res.json();
            const profiles = data.record?.profiles;
            if (Array.isArray(profiles)) {
                importProfilesJSON(JSON.stringify(profiles));
                setCloudStatus('done');
                showMsg(`☁️ Cloud থেকে ${profiles.length}টি CV প্রোফাইল সফলভাবে লোড করা হয়েছে!`);
                setTimeout(() => setCloudStatus('idle'), 3000);
            } else {
                throw new Error('Invalid data');
            }
        } catch {
            setCloudStatus('error');
            showMsg('Cloud Restore ব্যর্থ হয়েছে! Bin ID ও API Key চেক করুন।', 'error');
            setTimeout(() => setCloudStatus('idle'), 4000);
        }
    };

    const filteredProfiles = savedProfiles.filter((profile) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            profile.name.toLowerCase().includes(query) ||
            profile.cvData.personal?.name?.toLowerCase().includes(query) ||
            profile.cvData.personal?.profession?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-5 overflow-y-auto h-full">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-indigo-500/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1 text-sm">
                            <Bookmark size={16} /><span>CV Manager</span>
                        </div>
                        <h2 className="text-xl font-bold">সেভ করা CV প্রোফাইল ম্যানেজার</h2>
                        <p className="text-slate-300 text-xs mt-1">নাম দিয়ে সেভ করুন ও Cloud-এ অনলাইনে Sync রাখুন — ব্রাউজার ক্লিয়ার হলেও ডাটা নিরাপদ থাকবে।</p>
                    </div>
                    <button onClick={() => setActiveTab('form')}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-lg shrink-0 text-sm">
                        <Sparkles size={16} /><span>নতুন CV তৈরি</span>
                    </button>
                </div>
            </div>

            {/* ─── Success / Error Toast ─── */}
            {successMessage.text && (
                <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${successMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {successMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{successMessage.text}</span>
                </div>
            )}

            {/* ─── Save Current CV ─── */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Save className="text-indigo-600" size={18} /><span>CV সেভ করুন</span>
                    </h3>
                    <button onClick={handleQuickAutoSave}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow shrink-0">
                        <Bookmark size={14} />
                        <span>১-ক্লিকে অটো সেভ: {cvData.personal.name || 'নাম লিখুন'}</span>
                    </button>
                </div>
                <form onSubmit={handleSave} className="flex gap-3">
                    <input type="text" value={profileNameInput} onChange={(e) => setProfileNameInput(e.target.value)}
                        placeholder="CV প্রোফাইলের নাম লিখুন..."
                        className="flex-1 pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-slate-800 text-sm font-semibold transition" />
                    <button type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow shrink-0 text-sm">
                        <Save size={16} /><span>সেভ করুন</span>
                    </button>
                </form>
            </div>

            {/* ─── Cloud Sync Card ─── */}
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl p-5 shadow-xl border border-indigo-500/30 text-white space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h3 className="font-bold text-base flex items-center gap-2 text-indigo-300">
                            <Cloud size={18} /><span>Online Cloud Sync</span>
                            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold ml-1">FREE</span>
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5">JSONBin.io ব্যবহার করে আপনার সকল CV যেকোনো ডিভাইস থেকে অ্যাক্সেস করুন।</p>
                    </div>
                    <button onClick={() => setShowApiSetup(!showApiSetup)}
                        className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition border border-white/10">
                        <Key size={13} />{apiKey ? 'API Key সেট আছে ✓' : 'API Key সেটআপ'}
                    </button>
                </div>

                {/* API Key Setup Panel */}
                {showApiSetup && (
                    <div className="bg-black/30 rounded-xl p-4 space-y-3 border border-white/10">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                            <Key size={14} />
                            <span>JSONBin.io API Key সেটআপ</span>
                            <a href="https://jsonbin.io/api-reference" target="_blank" rel="noreferrer"
                                className="ml-auto flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline">
                                <ExternalLink size={12} />Free Account নিন
                            </a>
                        </div>
                        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                            placeholder="$2b$10$... (JSONBin Master Key)"
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="text" value={binId} onChange={(e) => setBinId(e.target.value)}
                            placeholder="Bin ID (প্রথমবার খালি রাখুন — অটো তৈরি হবে)"
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500" />
                        <button onClick={saveApiKey}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5">
                            <Link size={13} />সংযোগ সেভ করুন
                        </button>
                    </div>
                )}

                {/* Cloud Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                    <button onClick={handleCloudUpload} disabled={cloudStatus === 'syncing' || savedProfiles.length === 0}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition shadow ${cloudStatus === 'syncing' ? 'bg-white/10 text-slate-400 cursor-wait' : savedProfiles.length === 0 ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                        {cloudStatus === 'syncing' ? <RefreshCw size={16} className="animate-spin" /> : <Cloud size={16} />}
                        <span>{cloudStatus === 'syncing' ? 'Uploading...' : '☁️ Cloud-এ আপলোড করুন'}</span>
                    </button>
                    <button onClick={handleCloudDownload} disabled={cloudStatus === 'syncing' || !binId}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition shadow ${cloudStatus === 'syncing' ? 'bg-white/10 text-slate-400 cursor-wait' : !binId ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}`}>
                        {cloudStatus === 'syncing' ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                        <span>{cloudStatus === 'syncing' ? 'Downloading...' : '☁️ Cloud থেকে Restore করুন'}</span>
                    </button>
                </div>

                {binId && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Link size={10} />Bin ID: <code className="text-indigo-300 ml-1 truncate">{binId}</code>
                    </p>
                )}
            </div>

            {/* ─── Local Backup ─── */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-200"><ShieldCheck size={16} className="text-indigo-400" />স্থানীয় ব্যাকআপ (Local Backup)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">সকল CV ফাইলে ডাউনলোড করুন অথবা ফাইল থেকে পুনরুদ্ধার করুন।</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <input type="file" ref={fileInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />
                    <button onClick={handleExportBackup} disabled={savedProfiles.length === 0}
                        className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition ${savedProfiles.length > 0 ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                        <Download size={14} /><span>ব্যাকআপ ডাউনলোড</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition">
                        <Upload size={14} /><span>ফাইল থেকে Restore</span>
                    </button>
                </div>
            </div>

            {/* ─── Saved Profiles List ─── */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <FolderOpen className="text-indigo-600" size={18} />
                            <span>সংরক্ষিত CV তালিকা ({savedProfiles.length})</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">নাম বা পদবী লিখে সার্চ করুন</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="CV খুঁজুন..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition" />
                    </div>
                </div>

                {filteredProfiles.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                            <Search size={20} />
                        </div>
                        <div className="text-slate-500 font-medium text-sm">
                            {searchQuery ? `"${searchQuery}" নামে কোনো CV পাওয়া যায়নি` : 'এখনো কোনো CV প্রোফাইল সেভ করা হয়নি'}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProfiles.map((profile) => (
                            <div key={profile.id}
                                className="group border border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50/50 p-4 rounded-2xl transition shadow-sm hover:shadow-md flex flex-col justify-between gap-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition flex items-center gap-1.5 text-sm">
                                            <Bookmark size={14} className="text-indigo-500 shrink-0" />
                                            <span className="line-clamp-1">{profile.name}</span>
                                        </h4>
                                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                            <Calendar size={10} />{profile.updatedAt}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                                        {profile.cvData.personal?.name && (
                                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                <User size={12} className="text-slate-400" />{profile.cvData.personal.name}
                                            </div>
                                        )}
                                        {profile.cvData.personal?.profession && (
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase size={12} className="text-slate-400" />{profile.cvData.personal.profession}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                    <button
                                        onClick={() => { loadProfile(profile.id); setActiveTab('preview'); }}
                                        className="flex-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5">
                                        <FolderOpen size={13} /><span>খুলুন ও এডিট করুন</span>
                                    </button>
                                    <button
                                        onClick={() => { if (confirm(`"${profile.name}" মুছে ফেলবেন?`)) deleteProfile(profile.id); }}
                                        className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white p-2 rounded-xl transition" title="মুছে ফেলুন">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
