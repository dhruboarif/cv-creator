import React, { useEffect, useState } from 'react';
import { useCVStore } from './store/cvStore';
import CVForm from './components/forms/CVForm';
import CVRenderer from './renderer/CVRenderer';
import TemplateSelector from './components/templates/TemplateSelector';
import TemplateVisualEditor from './components/editor/TemplateVisualEditor';
import PhotoEditor from './components/photo/PhotoEditor';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ExportPanel from './components/export/ExportPanel';
import DataDashboard from './components/forms/DataDashboard';
import SavedProfiles from './components/saved/SavedProfiles';
import AIDocumentScanner from './components/ai/AIDocumentScanner';
import {
  FileText, Palette, Settings, Image as ImageIcon, Download,
  RotateCcw, RotateCw, Database, Sparkles, CheckCircle, RefreshCcw, Bookmark, ScanLine
} from 'lucide-react';

const App: React.FC = () => {
  const {
    cvData,
    currentTemplateId,
    templates,
    activeTab,
    setActiveTab,
    undo,
    redo,
    historyIndex,
    history,
    loadSampleData,
    updateCVData,
    fontSizeModifier,
    setFontSizeModifier,
    pagesCount,
    setPagesCount,
    topSpacing,
    bottomSpacing,
    setTopSpacing,
    setBottomSpacing
  } = useCVStore();

  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  const activeTemplate = templates.find((t) => t.id === currentTemplateId) || templates[0];

  const [isExporting, setIsExporting] = useState(false);

  const handleQuickExport = async () => {
    setIsExporting(true);
    try {
      await document.fonts.ready;

      const a4Width = activeTemplate.pageSize.width; // 794
      const a4Height = activeTemplate.pageSize.height; // 1123

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [a4Width, a4Height],
      });

      // Page 1
      const page1El = document.getElementById('cv-render-page-1');
      if (!page1El) {
        alert('Page 1 render target not found.');
        return;
      }
      const canvas1 = await html2canvas(page1El, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: activeTemplate.colors.background,
      });
      const imgData1 = canvas1.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData1, 'JPEG', 0, 0, a4Width, a4Height);

      // Page 2
      if (pagesCount === 2) {
        const page2El = document.getElementById('cv-render-page-2');
        if (page2El) {
          pdf.addPage([a4Width, a4Height], 'portrait');
          const canvas2 = await html2canvas(page2El, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: activeTemplate.colors.background,
          });
          const imgData2 = canvas2.toDataURL('image/jpeg', 1.0);
          pdf.addImage(imgData2, 'JPEG', 0, 0, a4Width, a4Height);
        }
      }

      pdf.save(`${cvData.personal.name.replace(/\s+/g, '_') || 'CV'}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Quick export failed. Check console.');
    } finally {
      setIsExporting(false);
    }
  };

  // Autosave simulation
  useEffect(() => {
    setAutosaveStatus('dirty');
    const timer = setTimeout(() => {
      setAutosaveStatus('saving');
      setTimeout(() => {
        setAutosaveStatus('saved');
      }, 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [cvData, currentTemplateId]);

  // Load sample data on initial load if none exists
  useEffect(() => {
    if (!cvData.personal.name) {
      loadSampleData();
    }
  }, []);

  // Patch: always ensure default samples exist for hobbies, projects, and volunteering if empty
  useEffect(() => {
    updateCVData((d) => {
      if (!d.hobbies || d.hobbies.length === 0) {
        d.hobbies = ['Playing Sports', 'Reading', 'Travelling', 'Writing'];
      }
      if (!d.projects || d.projects.length === 0) {
        d.projects = [
          {
            id: 'p-1',
            name: 'Sales & Inventory Management System',
            description: 'Developed a basic tracking tool for daily sales entries, product inventory records, and automated monthly sales summary reports.',
            technologies: 'MS Excel, MS Access',
            link: '',
          },
          {
            id: 'p-2',
            name: 'Customer Relationship & Field Survey Tracker',
            description: 'Designed a structured database and reporting sheet to collect field feedback and log customer visits across regional markets.',
            technologies: 'MS Excel, Data Entry Tools',
            link: '',
          },
        ];
      }
      if (!d.volunteering || d.volunteering.length === 0) {
        d.volunteering = [
          {
            id: 'v-1',
            role: 'Volunteer Organizer',
            organization: 'Blood Donors Club, Rajshahi',
            duration: '2022 - 2023',
            description: 'Organized campus blood donation camps and coordinated emergency donor contacts for local hospital patients.',
          },
          {
            id: 'v-2',
            role: 'Event Coordinator',
            organization: 'Youth Sports & Cultural Club',
            duration: '2021 - 2022',
            description: 'Assisted in managing annual sports tournaments and distributing prizes among regional participants.',
          },
        ];
      }
      if (!d.sectionVisibility) {
        d.sectionVisibility = {};
      }
      d.sectionVisibility.certificates = false;
    });
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Dynamic Modern Glass Header */}
      <header className="h-16 border-b border-white/10 bg-slate-950/90 backdrop-blur-md flex items-center justify-between px-5 z-50 flex-shrink-0">
        <div
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          onClick={() => {
            setActiveTab('form');
            useCVStore.getState().setActiveFormSection('personal');
          }}
          title="Go to Homepage / Personal Info"
        >
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
            <Sparkles size={18} />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-slate-100 whitespace-nowrap tracking-tight">
              CV Creator Pro <span className="text-indigo-400 font-medium text-xs">by Dhrubo Computers</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Desktop Production Suite</p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {[
            { id: 'templates', label: 'Template Selector', icon: Palette },
            { id: 'form', label: 'CV Content Form', icon: FileText },
            { id: 'ai-scan', label: 'AI Auto Fill', icon: ScanLine, special: true },
            { id: 'saved', label: 'Saved CVs', icon: Bookmark },
            { id: 'editor', label: 'Template Editor', icon: Settings },
            { id: 'photo', label: 'Photo & Shape', icon: ImageIcon },
            { id: 'data', label: 'Spreadsheets & CSV', icon: Database },
            { id: 'export', label: 'Export CV', icon: Download },
          ].map((tab: any) => (
            <button
              key={tab.id}
              className={`tab-item px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : tab.special
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-violet-300 hover:from-violet-600/50 hover:to-indigo-600/50 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.special && <span className="text-[9px] bg-violet-500 text-white px-1 py-px rounded font-bold">AI</span>}
            </button>
          ))}
        </div>

        {/* Global Autosave Sync & History Info */}
        <div className="flex items-center gap-4">
          {/* Page switch controls in header */}
          <div className="flex gap-1 bg-slate-900 p-0.5 border border-white/10 rounded-lg h-8 mr-2">
            <button
              className={`px-3 h-full rounded-md text-[10px] uppercase font-bold transition-all ${pagesCount === 1 ? 'bg-accent text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => {
                setPagesCount(1);
                setTimeout(() => {
                  const container = document.getElementById('preview-container');
                  if (container) {
                    container.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }, 50);
              }}
            >
              Page 1
            </button>
            <button
              className={`px-3 h-full rounded-md text-[10px] uppercase font-bold transition-all ${pagesCount === 2 ? 'bg-accent text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => {
                setPagesCount(2);
                setTimeout(() => {
                  const container = document.getElementById('preview-container');
                  const page2 = document.getElementById('cv-render-page-2');
                  if (container && page2) {
                    container.scrollTo({ top: page2.offsetTop - 120, behavior: 'smooth' });
                  }
                }, 50);
              }}
            >
              Page 2
            </button>
          </div>
          {/* Quick Save CV in header */}
          <button
            className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] uppercase font-bold flex items-center gap-1.5 shadow-md transition"
            onClick={() => {
              const name = useCVStore.getState().cvData.personal.name || 'My CV Profile';
              useCVStore.getState().saveProfile();
              alert(`"${name}" নাম দিয়ে CV টি সফলভাবে সেভ করা হয়েছে!`);
            }}
            title="Personal Name দিয়ে এক ক্লিকে সেভ করুন"
          >
            <Bookmark size={12} />
            Save CV
          </button>
          {/* Quick PDF Export in header */}
          <button
            className="btn-primary h-8 px-3 rounded-lg text-[10px] uppercase font-bold flex items-center gap-1.5 mr-2"
            onClick={handleQuickExport}
            disabled={isExporting}
          >
            <Download size={12} />
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            {autosaveStatus === 'dirty' && (
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Edited</span>
            )}
            {autosaveStatus === 'saving' && (
              <span className="flex items-center gap-1"><RefreshCcw className="w-3 h-3 animate-spin text-accent" /> Autosaving...</span>
            )}
            {autosaveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Workspace Synced</span>
            )}
          </div>

          <div className="flex gap-1">
            <button
              className="btn-icon w-8 h-8"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo Action"
            >
              <RotateCcw size={12} />
            </button>
            <button
              className="btn-icon w-8 h-8"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo Action"
            >
              <RotateCw size={12} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace split panel layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: Form controllers or Editor panels */}
        <div className="w-1/2 flex flex-col border-r border-white/5 bg-slate-900/60 overflow-hidden">
          <div className="flex-1 overflow-hidden overflow-y-auto">
            {activeTab === 'templates' && <TemplateSelector />}
            {activeTab === 'form' && <CVForm />}
            {activeTab === 'ai-scan' && (
              <div className="p-4">
                <AIDocumentScanner onClose={() => setActiveTab('form')} />
              </div>
            )}
            {activeTab === 'saved' && <SavedProfiles />}
            {activeTab === 'editor' && <TemplateVisualEditor />}
            {activeTab === 'photo' && <PhotoEditor />}
            {activeTab === 'data' && <DataDashboard />}
            {activeTab === 'export' && <ExportPanel />}
          </div>
        </div>

        {/* Right Column: High-fidelity print-preview simulator */}
        <div id="preview-container" className="w-1/2 bg-slate-950/60 overflow-y-auto px-8 pb-8 pt-0 flex flex-col items-center gap-6">
          <div className="w-full max-w-[794px] glass-card p-4 flex flex-col xl:flex-row items-center justify-between gap-4 border-x border-b border-white/10 rounded-b-xl bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
            <div className="flex flex-col gap-1 items-start w-full xl:w-auto">
              <span className="text-xs text-accent font-bold uppercase tracking-wider">Output Preview Settings</span>
              <span className="text-[10px] text-slate-400">Live adjustments and quick export</span>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap justify-start xl:justify-end w-full xl:w-auto">
              {/* Font Size controls */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Font Size</span>
                <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-slate-950 h-9" title="Adjust Base Font Size">
                  <button
                    className="w-8 h-full flex items-center justify-center hover:bg-white/5 text-slate-300 font-bold border-r border-white/5 active:bg-white/10 transition-colors"
                    onClick={() => setFontSizeModifier(fontSizeModifier - 1)}
                  >
                    A-
                  </button>
                  <span className="px-3 text-xs select-none text-slate-300 font-semibold font-mono min-w-[75px] text-center">
                    {10 + fontSizeModifier}px
                  </span>
                  <button
                    className="w-8 h-full flex items-center justify-center hover:bg-white/5 text-slate-300 font-bold border-l border-white/5 active:bg-white/10 transition-colors"
                    onClick={() => setFontSizeModifier(fontSizeModifier + 1)}
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Top Spacing Spacers */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Top Margin</span>
                <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-slate-950 h-9" title="Move Content Down (Top Spacing)">
                  <button
                    className="w-8 h-full flex items-center justify-center hover:bg-white/5 text-slate-300 font-bold border-r border-white/5 active:bg-white/10 transition-colors"
                    onClick={() => setTopSpacing(Math.max(0, topSpacing - 5))}
                  >
                    T-
                  </button>
                  <span className="px-3 text-xs select-none text-slate-300 font-semibold font-mono min-w-[70px] text-center">
                    {topSpacing}px
                  </span>
                  <button
                    className="w-8 h-full flex items-center justify-center hover:bg-white/5 text-slate-300 font-bold border-l border-white/5 active:bg-white/10 transition-colors"
                    onClick={() => setTopSpacing(Math.min(150, topSpacing + 5))}
                  >
                    T+
                  </button>
                </div>
              </div>

              {/* Bottom Spacing Spacers */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Bottom Margin</span>
                <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-slate-950 h-9" title="Move Content Up (Bottom Spacing)">
                  <button
                    className="w-8 h-full flex items-center justify-center hover:bg-white/5 text-slate-300 font-bold border-r border-white/5 active:bg-white/10 transition-colors"
                    onClick={() => setBottomSpacing(Math.max(0, bottomSpacing - 5))}
                  >
                    B-
                  </button>
                  <span className="px-3 text-xs select-none text-slate-300 font-semibold font-mono min-w-[70px] text-center">
                    {bottomSpacing}px
                  </span>
                  <button
                    className="w-8 h-full flex items-center justify-center hover:bg-white/5 text-slate-300 font-bold border-l border-white/5 active:bg-white/10 transition-colors"
                    onClick={() => setBottomSpacing(Math.min(150, bottomSpacing + 5))}
                  >
                    B+
                  </button>
                </div>
              </div>


            </div>
          </div>
          <div className="flex flex-col gap-6 select-none shadow-2xl items-center pb-12">
            {/* Page 1 */}
            <div
              className="border border-white/10 rounded-lg overflow-hidden bg-white relative"
              style={{
                height: activeTemplate.pageSize.height,
                width: activeTemplate.pageSize.width,
              }}
            >
              <CVRenderer data={cvData} template={activeTemplate} pageIndex={1} id="cv-render-page-1" />
            </div>

            {/* Page 2 */}
            {pagesCount === 2 && (
              <div
                className="border border-white/10 rounded-lg overflow-hidden bg-white relative animate-fade-in"
                style={{
                  height: activeTemplate.pageSize.height,
                  width: activeTemplate.pageSize.width,
                }}
              >
                <CVRenderer data={cvData} template={activeTemplate} pageIndex={2} id="cv-render-page-2" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
