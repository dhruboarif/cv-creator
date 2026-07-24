import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import type { CVData, TemplateConfig, HistoryEntry } from '../types';
import { defaultCVData, sampleCVData } from '../utils/defaultData';
import { defaultTemplates } from '../templates/templateConfigs';
import { v4 as uuid } from 'uuid';

const MAX_HISTORY = 50;

interface CVStore {
    // Data
    cvData: CVData;
    currentTemplateId: string;
    templates: TemplateConfig[];

    // History
    history: HistoryEntry[];
    historyIndex: number;

    // UI State
    activeTab: 'form' | 'preview' | 'editor' | 'templates' | 'photo' | 'data' | 'export';
    activeFormSection: string;
    zoom: number;
    fontSizeModifier: number;
    pagesCount: number;
    topSpacing: number;
    bottomSpacing: number;
    isDirty: boolean;
    showSampleData: boolean;

    // Actions - CV Data
    setCVData: (data: CVData) => void;
    updateCVData: (updater: (data: CVData) => void) => void;
    loadSampleData: () => void;
    clearData: () => void;
    importJSON: (json: string) => void;
    importCSV: (csvData: Record<string, string>[]) => void;

    // Actions - Photo
    setPhoto: (photo: string | null) => void;

    // Actions - Template
    setCurrentTemplate: (id: string) => void;
    addTemplate: (template: TemplateConfig) => void;
    updateTemplate: (id: string, updates: Partial<TemplateConfig>) => void;
    deleteTemplate: (id: string) => void;
    duplicateTemplate: (id: string) => void;
    importTemplate: (json: string) => void;
    exportTemplate: (id: string) => string;
    importAllTemplates: (json: string) => void;
    exportAllTemplates: () => string;

    // Actions - History
    pushHistory: (description: string) => void;
    undo: () => void;
    redo: () => void;

    // Actions - UI
    setActiveTab: (tab: 'form' | 'preview' | 'editor' | 'templates' | 'photo' | 'data' | 'export') => void;
    setActiveFormSection: (section: string) => void;
    setZoom: (zoom: number) => void;
    setFontSizeModifier: (modifier: number) => void;
    setPagesCount: (count: number) => void;
    setTopSpacing: (spacing: number) => void;
    setBottomSpacing: (spacing: number) => void;
}

export const useCVStore = create<CVStore>()(
    persist(
        (set, get) => ({
            // Initial State
            cvData: defaultCVData,
            currentTemplateId: 'template-1',
            templates: defaultTemplates,
            history: [],
            historyIndex: -1,
            activeTab: 'form',
            activeFormSection: 'personal',
            zoom: 100,
            fontSizeModifier: 1,
            pagesCount: 2,
            topSpacing: 55,
            bottomSpacing: 0,
            isDirty: false,
            showSampleData: false,

            // CV Data Actions
            setCVData: (data) => {
                set({ cvData: data, isDirty: true });
                get().pushHistory('Update CV data');
            },

            updateCVData: (updater) => {
                set((state) => ({
                    cvData: produce(state.cvData, updater),
                    isDirty: true,
                }));
            },

            loadSampleData: () => {
                set({ cvData: sampleCVData, showSampleData: true, isDirty: true });
                get().pushHistory('Load sample data');
            },

            clearData: () => {
                set({ cvData: defaultCVData, showSampleData: false, isDirty: true });
                get().pushHistory('Clear all data');
            },

            importJSON: (json) => {
                try {
                    const parsed = JSON.parse(json);
                    const cvData = mapImportedJSON(parsed);
                    // Preserve existing photo if not present in the imported JSON
                    if (!cvData.photo && get().cvData.photo) {
                        cvData.photo = get().cvData.photo;
                    }
                    // Preserve Experience if empty in imported JSON
                    if (!cvData.experience || cvData.experience.length === 0) {
                        cvData.experience = defaultCVData.experience;
                    }
                    // Preserve Computer Skills and Key (Technical) Skills from the active store state
                    cvData.computerSkills = get().cvData.computerSkills && get().cvData.computerSkills.length > 0
                        ? get().cvData.computerSkills
                        : sampleCVData.computerSkills;
                    cvData.technicalSkills = get().cvData.technicalSkills && get().cvData.technicalSkills.length > 0
                        ? get().cvData.technicalSkills
                        : sampleCVData.technicalSkills;

                    set({ cvData, isDirty: true });
                    get().pushHistory('Import JSON data');
                } catch (e) {
                    console.error('Failed to parse JSON:', e);
                    throw new Error('Invalid JSON format');
                }
            },

            importCSV: (csvData) => {
                try {
                    const cvData = mapCSVData(csvData);
                    // Preserve existing photo if not present in the CSV
                    if (!cvData.photo && get().cvData.photo) {
                        cvData.photo = get().cvData.photo;
                    }
                    // Preserve Experience if empty in imported CSV
                    if (!cvData.experience || cvData.experience.length === 0) {
                        cvData.experience = defaultCVData.experience;
                    }
                    // Preserve Computer Skills and Key (Technical) Skills from the active store state
                    cvData.computerSkills = get().cvData.computerSkills && get().cvData.computerSkills.length > 0
                        ? get().cvData.computerSkills
                        : sampleCVData.computerSkills;
                    cvData.technicalSkills = get().cvData.technicalSkills && get().cvData.technicalSkills.length > 0
                        ? get().cvData.technicalSkills
                        : sampleCVData.technicalSkills;

                    set({ cvData, isDirty: true });
                    get().pushHistory('Import CSV data');
                } catch (e) {
                    console.error('Failed to parse CSV:', e);
                    throw new Error('Invalid CSV format');
                }
            },

            // Photo Actions
            setPhoto: (photo) => {
                set((state) => ({
                    cvData: { ...state.cvData, photo },
                    isDirty: true,
                }));
            },

            // Template Actions
            setCurrentTemplate: (id) => set({ currentTemplateId: id }),

            addTemplate: (template) => {
                set((state) => ({
                    templates: [...state.templates, template],
                }));
            },

            updateTemplate: (id, updates) => {
                set((state) => ({
                    templates: state.templates.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                }));
            },

            deleteTemplate: (id) => {
                const state = get();
                if (state.templates.length <= 1) return;
                set((state) => ({
                    templates: state.templates.filter((t) => t.id !== id),
                    currentTemplateId:
                        state.currentTemplateId === id
                            ? state.templates[0].id
                            : state.currentTemplateId,
                }));
            },

            duplicateTemplate: (id) => {
                const state = get();
                const template = state.templates.find((t) => t.id === id);
                if (!template) return;
                const newTemplate: TemplateConfig = {
                    ...JSON.parse(JSON.stringify(template)),
                    id: `template-${uuid()}`,
                    name: `${template.name} (Copy)`,
                };
                set((state) => ({
                    templates: [...state.templates, newTemplate],
                }));
            },

            importTemplate: (json) => {
                try {
                    const template = JSON.parse(json) as TemplateConfig;
                    template.id = `template-${uuid()}`;
                    set((state) => ({
                        templates: [...state.templates, template],
                    }));
                } catch {
                    throw new Error('Invalid template JSON');
                }
            },

            exportTemplate: (id) => {
                const template = get().templates.find((t) => t.id === id);
                if (!template) throw new Error('Template not found');
                return JSON.stringify(template, null, 2);
            },

            importAllTemplates: (json) => {
                try {
                    const parsed = JSON.parse(json);
                    if (!Array.isArray(parsed)) throw new Error('Expected array of templates');
                    const imported = parsed.map((t) => ({ ...t, id: `template-${uuid()}` }));
                    set((state) => ({
                        templates: [...state.templates, ...imported],
                    }));
                } catch {
                    throw new Error('Invalid templates JSON array');
                }
            },

            exportAllTemplates: () => {
                const templates = get().templates;
                return JSON.stringify(templates, null, 2);
            },

            // History Actions
            pushHistory: (description) => {
                set((state) => {
                    const newEntry: HistoryEntry = {
                        timestamp: Date.now(),
                        data: JSON.parse(JSON.stringify(state.cvData)),
                        description,
                    };
                    const history = state.history.slice(0, state.historyIndex + 1);
                    history.push(newEntry);
                    if (history.length > MAX_HISTORY) history.shift();
                    return {
                        history,
                        historyIndex: history.length - 1,
                    };
                });
            },

            undo: () => {
                set((state) => {
                    if (state.historyIndex <= 0) return state;
                    const newIndex = state.historyIndex - 1;
                    return {
                        cvData: JSON.parse(JSON.stringify(state.history[newIndex].data)),
                        historyIndex: newIndex,
                        isDirty: true,
                    };
                });
            },

            redo: () => {
                set((state) => {
                    if (state.historyIndex >= state.history.length - 1) return state;
                    const newIndex = state.historyIndex + 1;
                    return {
                        cvData: JSON.parse(JSON.stringify(state.history[newIndex].data)),
                        historyIndex: newIndex,
                        isDirty: true,
                    };
                });
            },

            // UI Actions
            setActiveTab: (tab) => set({ activeTab: tab }),
            setActiveFormSection: (section) => set({ activeFormSection: section }),
            setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
            setFontSizeModifier: (modifier) => set({ fontSizeModifier: Math.max(-5, Math.min(10, modifier)) }),
            setPagesCount: (count) => set({ pagesCount: Math.max(1, Math.min(5, count)) }),
            setTopSpacing: (spacing) => set({ topSpacing: Math.max(0, Math.min(150, spacing)) }),
            setBottomSpacing: (spacing) => set({ bottomSpacing: Math.max(0, Math.min(150, spacing)) }),
        }),
        {
            name: 'cv-creator-store',
            partialize: (state) => ({
                cvData: state.cvData,
                currentTemplateId: state.currentTemplateId,
                templates: state.templates,
                fontSizeModifier: state.fontSizeModifier,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    if (state.cvData && (!state.cvData.hobbies || state.cvData.hobbies.length === 0)) {
                        state.cvData.hobbies = defaultCVData.hobbies;
                    }
                    if (state.cvData && !state.cvData.languages) {
                        state.cvData.languages = [];
                    }
                    if (state.templates && Array.isArray(state.templates)) {
                        // Ensure all default templates are present in templates list
                        defaultTemplates.forEach((dt) => {
                            const existingIdx = state.templates.findIndex((t) => t.id === dt.id);
                            if (existingIdx === -1) {
                                state.templates.push(dt);
                            } else {
                                // Update system default templates definition
                                state.templates[existingIdx] = { ...dt, ...state.templates[existingIdx], educationPage: dt.educationPage };
                            }
                        });
                    }
                }
            },
        }
    )
);

// ============================================================
// Helper: Map imported JSON to CVData
// ============================================================
function mapImportedJSON(json: Record<string, unknown>): CVData {
    const personal = (json.personal || json.personalInfo || {}) as Record<string, string>;
    return {
        personal: {
            name: personal.name || '',
            profession: personal.profession || personal.title || '',
            phone: personal.phone || personal.mobile || '',
            email: personal.email || '',
            address: personal.address || '',
            dob: personal.dob || personal.dateOfBirth || '',
            nationality: personal.nationality || '',
            fatherName: personal.fatherName || '',
            motherName: personal.motherName || '',
            religion: personal.religion || '',
            gender: personal.gender || '',
            maritalStatus: personal.maritalStatus || '',
            bloodGroup: personal.bloodGroup || '',
            height: personal.height || '',
            nid: personal.nid || '',
            permanentAddress: personal.permanentAddress || '',
            website: personal.website || '',
            linkedin: personal.linkedin || '',
            github: personal.github || '',
        },
        careerObjective: (json.careerObjective || json.objective || json.summary || '') as string,
        education: mapArray(json.education as unknown[]).map((e: Record<string, string>) => ({
            id: uuid(), degree: e.degree || e.title || '', institution: e.institution || e.school || '',
            board: e.board || '', university: e.university || '', group: e.group || e.major || '',
            session: e.session || '', passingYear: e.passingYear || e.year || '', result: e.result || e.gpa || '',
        })),
        experience: mapArray(json.experience as unknown[]).map((e: Record<string, string | string[]>) => ({
            id: uuid(), title: (e.title || e.position || '') as string, company: (e.company || e.organization || '') as string,
            duration: (e.duration || '') as string, startDate: (e.startDate || '') as string, endDate: (e.endDate || '') as string,
            responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities : [],
        })),
        computerSkills: (() => {
            const parsed = mapSkills(json.computerSkills as unknown[] || json.computer_skills as unknown[]);
            return parsed.length > 0 ? parsed : defaultCVData.computerSkills;
        })(),
        technicalSkills: (() => {
            const parsed = mapSkills(json.technicalSkills as unknown[] || json.technical_skills as unknown[] || json.keySkills as unknown[]);
            return parsed.length > 0 ? parsed : defaultCVData.technicalSkills;
        })(),
        languages: mapArray(json.languages as unknown[]).map((l: Record<string, string>) => ({
            id: uuid(), name: l.name || l.language || '', proficiency: l.proficiency || l.level || '',
            reading: l.reading || '', writing: l.writing || '', speaking: l.speaking || '',
        })),
        projects: mapArray(json.projects as unknown[]).map((p: Record<string, string>) => ({
            id: uuid(), name: p.name || p.title || '', description: p.description || '',
            technologies: p.technologies || p.tech || '', link: p.link || p.url || '',
        })),
        certificates: mapArray(json.certificates as unknown[]).map((c: Record<string, string>) => ({
            id: uuid(), name: c.name || c.title || '', issuer: c.issuer || c.organization || '', date: c.date || '',
        })),
        references: mapArray(json.references as unknown[]).map((r: Record<string, string>) => ({
            id: uuid(), name: r.name || '', designation: r.designation || r.title || '',
            organization: r.organization || r.company || '', phone: r.phone || '', email: r.email || '',
        })),
        awards: mapArray(json.awards as unknown[]).map((a: Record<string, string>) => ({
            id: uuid(), name: a.name || a.title || '', issuer: a.issuer || '', date: a.date || '', description: a.description || '',
        })),
        trainings: mapArray(json.trainings as unknown[]).map((t: Record<string, string>) => ({
            id: uuid(), name: t.name || t.title || '', organization: t.organization || '',
            duration: t.duration || '', date: t.date || '',
        })),
        publications: mapArray(json.publications as unknown[]).map((p: Record<string, string>) => ({
            id: uuid(), title: p.title || '', journal: p.journal || '', date: p.date || '', link: p.link || '',
        })),
        hobbies: Array.isArray(json.hobbies) ? json.hobbies : [],
        declaration: (json.declaration || '') as string,
        customSections: [],
        photo: (json.photo || json.photoUrl || null) as string | null,
    };
}

function mapArray(arr: unknown[] | undefined | null): any[] {
    if (!Array.isArray(arr)) return [];
    return arr as any[];
}

function mapSkills(skills: unknown[] | undefined | null): { id: string; name: string; level: number }[] {
    if (!Array.isArray(skills)) return [];
    return skills.map((s: unknown) => {
        if (typeof s === 'string') return { id: uuid(), name: s, level: 70 };
        const skill = s as Record<string, unknown>;
        return { id: uuid(), name: (skill.name || '') as string, level: (skill.level as number) || 70 };
    });
}

function mapCSVData(rows: Record<string, string>[]): CVData {
    const data = { ...defaultCVData };
    if (rows.length > 0) {
        const row = rows[0];
        data.personal = {
            ...data.personal,
            name: row.name || row.Name || '',
            phone: row.phone || row.Phone || '',
            email: row.email || row.Email || '',
            address: row.address || row.Address || '',
            profession: row.profession || row.Profession || '',
            dob: row.dob || row.DOB || '',
            nationality: row.nationality || row.Nationality || '',
            fatherName: row.fatherName || '',
            motherName: row.motherName || '',
            religion: row.religion || '',
            gender: row.gender || '',
            maritalStatus: row.maritalStatus || '',
            bloodGroup: row.bloodGroup || '',
            height: row.height || '',
            nid: row.nid || '',
            permanentAddress: row.permanentAddress || '',
            website: row.website || '',
            linkedin: row.linkedin || '',
            github: row.github || '',
        };
    }
    return data;
}
