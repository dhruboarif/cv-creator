import React from 'react';
import { useCVStore } from '../../store/cvStore';
import type { CVData } from '../../types';
import {
    User, Briefcase, GraduationCap, Code, Languages as LanguagesIcon, FolderOpen,
    Award, BookOpen, FileText, Heart, Shield, Users, Plus, Trash2, Target, Upload, ClipboardPaste, HandHeart
} from 'lucide-react';
import { v4 as uuid } from 'uuid';

const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'objective', label: 'Career Objective', icon: Target },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'computerSkills', label: 'Computer Skills', icon: Code },
    { id: 'technicalSkills', label: 'Key Skills', icon: Shield },
    { id: 'languages', label: 'Languages', icon: LanguagesIcon },
    { id: 'projects', label: 'Projects', icon: FolderOpen, toggleable: true, defaultOff: true },
    { id: 'certificates', label: 'Certificates', icon: Award, toggleable: true, defaultOff: true },
    { id: 'trainings', label: 'Trainings & Certs', icon: BookOpen, toggleable: true, defaultOff: false },
    { id: 'volunteering', label: 'Volunteering', icon: HandHeart, toggleable: true, defaultOff: true },
    { id: 'hobbies', label: 'Hobbies', icon: Heart, toggleable: true, defaultOff: false },
    { id: 'references', label: 'References', icon: Users, toggleable: true, defaultOff: true },
    { id: 'declaration', label: 'Declaration', icon: FileText, toggleable: true, defaultOff: false },
];

function SectionToggleHeader({
    sectionKey,
    title,
    defaultOff = true,
    data,
    onUpdate,
    onSave
}: {
    sectionKey: string;
    title: string;
    defaultOff?: boolean;
    data: any;
    onUpdate: (u: (d: any) => void) => void;
    onSave: () => void;
}) {
    const isVisible = data.sectionVisibility ? data.sectionVisibility[sectionKey] ?? !defaultOff : !defaultOff;

    const toggle = () => {
        onUpdate((d: any) => {
            if (!d.sectionVisibility) d.sectionVisibility = {};
            d.sectionVisibility[sectionKey] = !isVisible;
        });
        onSave();
    };

    return (
        <div className="flex items-center justify-between p-3.5 glass-card bg-slate-900/80 mb-5 border border-white/10 rounded-xl shadow-lg">
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-100">{title}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider ${isVisible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                        {isVisible ? 'ON (Included)' : 'OFF (Hidden)'}
                    </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                    {isVisible ? 'This section will appear on your CV.' : 'Turn ON if you want to display this section on your CV.'}
                </p>
            </div>
            <button
                onClick={toggle}
                type="button"
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${isVisible ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}
                title={isVisible ? 'Turn Section OFF' : 'Turn Section ON'}
            >
                <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
        </div>
    );
}

const CVForm: React.FC = () => {
    const { cvData, updateCVData, activeFormSection, setActiveFormSection, pushHistory } = useCVStore();

    const handleUpdate = (updater: (data: typeof cvData) => void) => {
        updateCVData(updater);
    };

    return (
        <div className="flex h-full">
            {/* Section Navigation */}
            <div className="w-52 flex-shrink-0 border-r border-white/5 p-2 overflow-y-auto">
                {sections.map((section) => {
                    const isVisible = section.toggleable
                        ? (cvData.sectionVisibility ? cvData.sectionVisibility[section.id] ?? !section.defaultOff : !section.defaultOff)
                        : true;
                    return (
                        <button
                            key={section.id}
                            className={`section-nav-item flex items-center justify-between ${activeFormSection === section.id ? 'active' : ''} ${!isVisible ? 'opacity-60' : ''}`}
                            onClick={() => setActiveFormSection(section.id)}
                        >
                            <span className="flex items-center gap-2 truncate">
                                <section.icon size={14} />
                                <span className="truncate">{section.label}</span>
                            </span>
                            {section.toggleable && (
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ml-1 shrink-0 ${isVisible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                    {isVisible ? 'ON' : 'OFF'}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-5 animate-fade-in" key={activeFormSection}>
                {activeFormSection === 'personal' && <PersonalInfoForm data={cvData} onUpdate={handleUpdate} />}
                {activeFormSection === 'objective' && <ObjectiveForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update objective')} />}
                {activeFormSection === 'experience' && <ExperienceForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update experience')} />}
                {activeFormSection === 'education' && <EducationForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update education')} />}
                {activeFormSection === 'computerSkills' && <SkillsForm data={cvData} field="computerSkills" title="Computer Skills" onUpdate={handleUpdate} onSave={() => pushHistory('Update computer skills')} />}
                {activeFormSection === 'technicalSkills' && <SkillsForm data={cvData} field="technicalSkills" title="Key / Technical Skills" onUpdate={handleUpdate} onSave={() => pushHistory('Update technical skills')} />}
                {activeFormSection === 'languages' && <LanguageForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update languages')} />}
                {activeFormSection === 'projects' && <ProjectForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update projects')} />}
                {activeFormSection === 'certificates' && <CertificateForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update certificates')} />}
                {activeFormSection === 'trainings' && <TrainingForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update trainings')} />}
                {activeFormSection === 'volunteering' && <VolunteeringForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update volunteering')} />}
                {activeFormSection === 'hobbies' && <HobbiesForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update hobbies')} />}
                {activeFormSection === 'references' && <ReferenceForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update references')} />}
                {activeFormSection === 'declaration' && <DeclarationForm data={cvData} onUpdate={handleUpdate} onSave={() => pushHistory('Update declaration')} />}
            </div>
        </div>
    );
};

// ============================================================
// Personal Info Form
// ============================================================
function PersonalInfoForm({ data, onUpdate }: { data: CVData; onUpdate: (u: (d: CVData) => void) => void }) {
    const fields: { key: keyof typeof data.personal; label: string; type?: string }[] = [
        { key: 'name', label: 'Full Name' },
        { key: 'profession', label: 'Profession / Title' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'email', label: 'Email Address', type: 'email' },
        { key: 'address', label: 'Current Address' },
        { key: 'dob', label: 'Date of Birth' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'fatherName', label: "Father's Name" },
        { key: 'motherName', label: "Mother's Name" },
        { key: 'religion', label: 'Religion' },
        { key: 'gender', label: 'Gender' },
        { key: 'maritalStatus', label: 'Marital Status' },
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'height', label: 'Height' },
        { key: 'nid', label: 'NID Number' },
        { key: 'permanentAddress', label: 'Permanent Address' },
        { key: 'website', label: 'Website' },
        { key: 'linkedin', label: 'LinkedIn' },
        { key: 'github', label: 'GitHub' },
    ];

    const { setPhoto, setActiveTab, importJSON } = useCVStore();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                importJSON(reader.result as string);
                alert('JSON imported successfully!');
            } catch (err: any) {
                alert('Malformed JSON format: ' + (err.message || ''));
            }
        };
        reader.readAsText(file);
    };

    const handleJSONPaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) {
                alert('Clipboard is empty.');
                return;
            }
            importJSON(text);
            alert('JSON copied from clipboard and applied successfully!');
        } catch (err: any) {
            alert('Failed to paste JSON: Make sure it is valid JSON and clipboard permission is granted. ' + (err.message || ''));
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            {/* JSON Quick Actions */}
            <div className="mb-6 glass-card p-4 bg-emerald-900/10 border-emerald-500/20">
                <div className="flex gap-3">
                    <button className="btn-primary py-1.5 px-3 flex items-center gap-1.5 text-xs" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={14} /> Upload JSON
                    </button>
                    <input ref={fileInputRef} type="file" accept=".json" onChange={handleJSONUpload} className="hidden" />

                    <button className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs" onClick={handleJSONPaste}>
                        <ClipboardPaste size={14} /> Paste JSON
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">Personal Information & Photo</h3>
            </div>

            {/* Quick Photo Upload Section */}
            <div className="mb-6 glass-card p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
                    {data.photo ? (
                        <img src={data.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-slate-500" />
                    )}
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Profile Photo</h4>
                    <div className="flex gap-2">
                        <label className="btn-primary py-1.5 px-3 text-xs cursor-pointer">
                            Upload Basic Photo
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        <button
                            className="btn-secondary py-1.5 px-3 text-xs"
                            onClick={() => setActiveTab('photo')}
                        >
                            Advanced Editor ✨
                        </button>
                        {data.photo && (
                            <button
                                className="btn-danger py-1.5 px-3 text-xs ml-auto"
                                onClick={() => setPhoto(null)}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div key={field.key as string} className={field.key === 'permanentAddress' ? 'col-span-2' : ''}>
                        <label className="input-label">{field.label}</label>
                        {field.key === 'permanentAddress' ? (
                            <textarea
                                className="textarea-field"
                                value={data.personal[field.key]}
                                onChange={(e) => onUpdate((d) => { d.personal[field.key] = e.target.value; })}
                                rows={2}
                            />
                        ) : (
                            <input
                                type={field.type || 'text'}
                                className="input-field"
                                value={data.personal[field.key]}
                                onChange={(e) => onUpdate((d) => { d.personal[field.key] = e.target.value; })}
                                placeholder={field.label}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// Objective Form
// ============================================================
function ObjectiveForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 gradient-text">Career Objective / Summary</h3>
            <textarea
                className="textarea-field"
                value={data.careerObjective}
                onChange={(e) => { onUpdate((d: any) => { d.careerObjective = e.target.value; }); }}
                onBlur={onSave}
                rows={6}
                placeholder="Write your career objective or professional summary..."
            />
        </div>
    );
}

// ============================================================
// Experience Form
// ============================================================
function ExperienceForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    const addExperience = () => {
        onUpdate((d: any) => {
            d.experience.push({ id: uuid(), title: '', company: '', duration: '', startDate: '', endDate: '', responsibilities: [] });
        });
        onSave();
    };

    const removeExperience = (id: string) => {
        onUpdate((d: any) => { d.experience = d.experience.filter((e: any) => e.id !== id); });
        onSave();
    };

    const addResponsibility = (expId: string) => {
        onUpdate((d: any) => {
            const exp = d.experience.find((e: any) => e.id === expId);
            if (exp) exp.responsibilities.push('');
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">Work Experience</h3>
                <button className="btn-primary" onClick={addExperience}><Plus size={14} /> Add</button>
            </div>
            {data.experience.map((exp: any, idx: number) => (
                <div key={exp.id} className="glass-card p-4 mb-4 animate-slide-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-primary">Experience #{idx + 1}</span>
                        <button className="btn-icon" onClick={() => removeExperience(exp.id)}><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="input-label">Job Title</label>
                            <input className="input-field" value={exp.title} onChange={(e) => onUpdate((d: any) => { d.experience[idx].title = e.target.value; })} />
                        </div>
                        <div>
                            <label className="input-label">Company</label>
                            <input className="input-field" value={exp.company} onChange={(e) => onUpdate((d: any) => { d.experience[idx].company = e.target.value; })} />
                        </div>
                        <div>
                            <label className="input-label">Duration</label>
                            <input className="input-field" value={exp.duration} onChange={(e) => onUpdate((d: any) => { d.experience[idx].duration = e.target.value; })} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="input-label">Responsibilities</label>
                            <button className="text-xs text-accent hover:text-accent-light" onClick={() => addResponsibility(exp.id)}>+ Add</button>
                        </div>
                        {exp.responsibilities.map((resp: string, rIdx: number) => (
                            <div key={rIdx} className="flex gap-2 mb-2">
                                <input
                                    className="input-field flex-1"
                                    value={resp}
                                    onChange={(e) => onUpdate((d: any) => { d.experience[idx].responsibilities[rIdx] = e.target.value; })}
                                    placeholder="Responsibility..."
                                />
                                <button className="btn-icon" onClick={() => onUpdate((d: any) => { d.experience[idx].responsibilities.splice(rIdx, 1); })}><Trash2 size={12} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {data.experience.length === 0 && <EmptyState text="No experience added yet" onAdd={addExperience} />}
        </div>
    );
}

// ============================================================
// Education Form
// ============================================================
function EducationForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    const addEducation = () => {
        onUpdate((d: any) => {
            d.education.push({ id: uuid(), degree: '', institution: '', board: '', university: '', group: '', session: '', passingYear: '', result: '' });
        });
        onSave();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">Education</h3>
                <button className="btn-primary" onClick={addEducation}><Plus size={14} /> Add</button>
            </div>
            {data.education.map((edu: any, idx: number) => (
                <div key={edu.id} className="glass-card p-4 mb-4 animate-slide-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-primary">Education #{idx + 1}</span>
                        <button className="btn-icon" onClick={() => { onUpdate((d: any) => { d.education = d.education.filter((e: any) => e.id !== edu.id); }); onSave(); }}><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'degree', label: 'Degree / Certificate' },
                            { key: 'institution', label: 'Institution' },
                            { key: 'board', label: 'Board' },
                            { key: 'university', label: 'University' },
                            { key: 'group', label: 'Group / Major' },
                            { key: 'session', label: 'Session' },
                            { key: 'passingYear', label: 'Passing Year' },
                            { key: 'result', label: 'Result / GPA' },
                        ].map((field) => (
                            <div key={field.key}>
                                <label className="input-label">{field.label}</label>
                                <input
                                    className="input-field"
                                    value={edu[field.key]}
                                    onChange={(e) => onUpdate((d: any) => { d.education[idx][field.key] = e.target.value; })}
                                    placeholder={field.label}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {data.education.length === 0 && <EmptyState text="No education added yet" onAdd={addEducation} />}
        </div>
    );
}

// ============================================================
// Skills Form
// ============================================================
function SkillsForm({ data, field, title, onUpdate, onSave }: { data: any; field: string; title: string; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    const addSkill = () => {
        onUpdate((d: any) => { d[field].push({ id: uuid(), name: '', level: 70 }); });
        onSave();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">{title}</h3>
                <button className="btn-primary" onClick={addSkill}><Plus size={14} /> Add</button>
            </div>
            {data[field].map((skill: any, idx: number) => (
                <div key={skill.id} className="flex items-center gap-3 mb-3 animate-slide-in">
                    <input
                        className="input-field flex-1"
                        value={skill.name}
                        onChange={(e) => onUpdate((d: any) => { d[field][idx].name = e.target.value; })}
                        placeholder="Skill name..."
                    />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.level}
                        onChange={(e) => onUpdate((d: any) => { d[field][idx].level = parseInt(e.target.value); })}
                        className="w-20"
                    />
                    <span className="text-xs text-slate-400 w-10">{skill.level}%</span>
                    <button className="btn-icon" onClick={() => { onUpdate((d: any) => { d[field] = d[field].filter((s: any) => s.id !== skill.id); }); onSave(); }}><Trash2 size={14} /></button>
                </div>
            ))}
            {data[field].length === 0 && <EmptyState text={`No ${title.toLowerCase()} added yet`} onAdd={addSkill} />}
        </div>
    );
}

// ============================================================
// Language Form
// ============================================================
function LanguageForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    const addLanguage = () => {
        onUpdate((d: any) => { d.languages.push({ id: uuid(), name: '', proficiency: '', reading: '', writing: '', speaking: '' }); });
        onSave();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">Languages</h3>
                <button className="btn-primary" onClick={addLanguage}><Plus size={14} /> Add</button>
            </div>
            {data.languages.map((lang: any, idx: number) => (
                <div key={lang.id} className="glass-card p-4 mb-4 animate-slide-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-primary">Language #{idx + 1}</span>
                        <button className="btn-icon" onClick={() => { onUpdate((d: any) => { d.languages = d.languages.filter((l: any) => l.id !== lang.id); }); onSave(); }}><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {['name', 'proficiency', 'reading', 'writing', 'speaking'].map((key) => (
                            <div key={key}>
                                <label className="input-label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input className="input-field" value={lang[key]} onChange={(e) => onUpdate((d: any) => { d.languages[idx][key] = e.target.value; })} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {data.languages.length === 0 && <EmptyState text="No languages added yet" onAdd={addLanguage} />}
        </div>
    );
}

// ============================================================
// Project Form
// ============================================================
function ProjectForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    const add = () => { onUpdate((d: any) => { d.projects.push({ id: uuid(), name: '', description: '', technologies: '', link: '' }); }); onSave(); };
    return (
        <div>
            <SectionToggleHeader sectionKey="projects" title="Projects" defaultOff={true} data={data} onUpdate={onUpdate} onSave={onSave} />
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">Projects List</h3>
                <button className="btn-primary" onClick={add}><Plus size={14} /> Add</button>
            </div>
            {data.projects.map((proj: any, idx: number) => (
                <div key={proj.id} className="glass-card p-4 mb-4 animate-slide-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-primary">Project #{idx + 1}</span>
                        <button className="btn-icon" onClick={() => { onUpdate((d: any) => { d.projects = d.projects.filter((p: any) => p.id !== proj.id); }); onSave(); }}><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[{ k: 'name', l: 'Project Name' }, { k: 'technologies', l: 'Technologies' }, { k: 'link', l: 'Link' }].map((f) => (
                            <div key={f.k}>
                                <label className="input-label">{f.l}</label>
                                <input className="input-field" value={proj[f.k]} onChange={(e) => onUpdate((d: any) => { d.projects[idx][f.k] = e.target.value; })} />
                            </div>
                        ))}
                    </div>
                    <div className="mt-3">
                        <label className="input-label">Description</label>
                        <textarea className="textarea-field" value={proj.description} onChange={(e) => onUpdate((d: any) => { d.projects[idx].description = e.target.value; })} rows={3} />
                    </div>
                </div>
            ))}
            {data.projects.length === 0 && <EmptyState text="No projects added yet" onAdd={add} />}
        </div>
    );
}

// ============================================================
// Certificate Form
// ============================================================
function CertificateForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    const add = () => { onUpdate((d: any) => { d.certificates.push({ id: uuid(), name: '', issuer: '', date: '' }); }); onSave(); };
    return (
        <div>
            <SectionToggleHeader sectionKey="certificates" title="Certificates" defaultOff={true} data={data} onUpdate={onUpdate} onSave={onSave} />
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">Certificates List</h3>
                <button className="btn-primary" onClick={add}><Plus size={14} /> Add</button>
            </div>
            {data.certificates.map((cert: any, idx: number) => (
                <div key={cert.id} className="glass-card p-4 mb-4 animate-slide-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-primary">Certificate #{idx + 1}</span>
                        <button className="btn-icon" onClick={() => { onUpdate((d: any) => { d.certificates = d.certificates.filter((c: any) => c.id !== cert.id); }); onSave(); }}><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[{ k: 'name', l: 'Certificate Name' }, { k: 'issuer', l: 'Issuer' }, { k: 'date', l: 'Date' }].map((f) => (
                            <div key={f.k}>
                                <label className="input-label">{f.l}</label>
                                <input className="input-field" value={cert[f.k]} onChange={(e) => onUpdate((d: any) => { d.certificates[idx][f.k] = e.target.value; })} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {data.certificates.length === 0 && <EmptyState text="No certificates added yet" onAdd={add} />}
        </div>
    );
}

// ============================================================
// Hobbies Form
// ============================================================
function HobbiesForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    const [newHobby, setNewHobby] = React.useState('');
    const add = () => { if (newHobby.trim()) { onUpdate((d: any) => { d.hobbies.push(newHobby.trim()); }); setNewHobby(''); onSave(); } };
    return (
        <div>
            <SectionToggleHeader sectionKey="hobbies" title="Hobbies & Interests" defaultOff={false} data={data} onUpdate={onUpdate} onSave={onSave} />
            <h3 className="text-lg font-semibold mb-4 gradient-text">Hobbies & Interests</h3>
            <div className="flex gap-2 mb-4">
                <input className="input-field flex-1" value={newHobby} onChange={(e) => setNewHobby(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add a hobby..." />
                <button className="btn-primary" onClick={add}><Plus size={14} /> Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
                {data.hobbies.map((hobby: string, idx: number) => (
                    <span key={idx} className="glass-card px-3 py-1.5 flex items-center gap-2 text-sm">
                        {hobby}
                        <button className="text-red-400 hover:text-red-300" onClick={() => { onUpdate((d: any) => { d.hobbies.splice(idx, 1); }); onSave(); }}>×</button>
                    </span>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// Reference Form
// ============================================================
function ReferenceForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    const add = () => { onUpdate((d: any) => { d.references.push({ id: uuid(), name: '', designation: '', organization: '', phone: '', email: '' }); }); onSave(); };
    return (
        <div>
            <SectionToggleHeader sectionKey="references" title="References" defaultOff={true} data={data} onUpdate={onUpdate} onSave={onSave} />
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">References List</h3>
                <button className="btn-primary" onClick={add}><Plus size={14} /> Add</button>
            </div>
            {data.references.map((ref: any, idx: number) => (
                <div key={ref.id} className="glass-card p-4 mb-4 animate-slide-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-primary">Reference #{idx + 1}</span>
                        <button className="btn-icon" onClick={() => { onUpdate((d: any) => { d.references = d.references.filter((r: any) => r.id !== ref.id); }); onSave(); }}><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[{ k: 'name', l: 'Name' }, { k: 'designation', l: 'Designation' }, { k: 'organization', l: 'Organization' }, { k: 'phone', l: 'Phone' }, { k: 'email', l: 'Email' }].map((f) => (
                            <div key={f.k}>
                                <label className="input-label">{f.l}</label>
                                <input className="input-field" value={ref[f.k]} onChange={(e) => onUpdate((d: any) => { d.references[idx][f.k] = e.target.value; })} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {data.references.length === 0 && <EmptyState text="No references added yet" onAdd={add} />}
        </div>
    );
}

// ============================================================
// Training Form
// ============================================================
function TrainingForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    const add = () => { onUpdate((d: any) => { d.trainings.push({ id: uuid(), name: '', organization: '', duration: '', date: '' }); }); onSave(); };
    return (
        <div>
            <SectionToggleHeader sectionKey="trainings" title="Trainings & Certifications" defaultOff={false} data={data} onUpdate={onUpdate} onSave={onSave} />
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">Trainings List</h3>
                <button className="btn-primary" onClick={add}><Plus size={14} /> Add</button>
            </div>
            {data.trainings.map((tr: any, idx: number) => (
                <div key={tr.id} className="glass-card p-4 mb-4 animate-slide-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-primary">Training #{idx + 1}</span>
                        <button className="btn-icon" onClick={() => { onUpdate((d: any) => { d.trainings = d.trainings.filter((t: any) => t.id !== tr.id); }); onSave(); }}><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[{ k: 'name', l: 'Training Name' }, { k: 'organization', l: 'Organization' }, { k: 'duration', l: 'Duration' }, { k: 'date', l: 'Date' }].map((f) => (
                            <div key={f.k}>
                                <label className="input-label">{f.l}</label>
                                <input className="input-field" value={tr[f.k]} onChange={(e) => onUpdate((d: any) => { d.trainings[idx][f.k] = e.target.value; })} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {data.trainings.length === 0 && <EmptyState text="No trainings added yet" onAdd={add} />}
        </div>
    );
}

// ============================================================
// Volunteering Form
// ============================================================
function VolunteeringForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    const add = () => {
        onUpdate((d: any) => {
            if (!d.volunteering) d.volunteering = [];
            d.volunteering.push({ id: uuid(), role: '', organization: '', duration: '', description: '' });
        });
        onSave();
    };
    return (
        <div>
            <SectionToggleHeader sectionKey="volunteering" title="Volunteering & Extracurricular Activities" defaultOff={true} data={data} onUpdate={onUpdate} onSave={onSave} />
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">Activities List</h3>
                <button className="btn-primary" onClick={add}><Plus size={14} /> Add</button>
            </div>
            {(data.volunteering || []).map((vol: any, idx: number) => (
                <div key={vol.id} className="glass-card p-4 mb-4 animate-slide-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-primary">Activity #{idx + 1}</span>
                        <button className="btn-icon" onClick={() => { onUpdate((d: any) => { d.volunteering = d.volunteering.filter((v: any) => v.id !== vol.id); }); onSave(); }}><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[{ k: 'role', l: 'Role / Position' }, { k: 'organization', l: 'Organization' }, { k: 'duration', l: 'Duration' }].map((f) => (
                            <div key={f.k}>
                                <label className="input-label">{f.l}</label>
                                <input className="input-field" value={vol[f.k]} onChange={(e) => onUpdate((d: any) => { d.volunteering[idx][f.k] = e.target.value; })} />
                            </div>
                        ))}
                        <div className="col-span-2">
                            <label className="input-label">Description</label>
                            <textarea className="textarea-field" rows={2} value={vol.description} onChange={(e) => onUpdate((d: any) => { d.volunteering[idx].description = e.target.value; })} onBlur={onSave} placeholder="Describe your role and impact..." />
                        </div>
                    </div>
                </div>
            ))}
            {(!data.volunteering || data.volunteering.length === 0) && <EmptyState text="No volunteering activities added yet" onAdd={add} />}
        </div>
    );
}

// ============================================================
// Declaration Form
// ============================================================
function DeclarationForm({ data, onUpdate, onSave }: { data: any; onUpdate: (u: (d: any) => void) => void; onSave: () => void }) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 gradient-text">Declaration</h3>
            <textarea
                className="textarea-field"
                value={data.declaration}
                onChange={(e) => onUpdate((d: any) => { d.declaration = e.target.value; })}
                onBlur={onSave}
                rows={4}
                placeholder="Enter your declaration statement..."
            />
            <button className="btn-secondary mt-3" onClick={() => {
                onUpdate((d: any) => { d.declaration = 'I hereby declare that all the information mentioned above is true and correct to the best of my knowledge and belief.'; });
                onSave();
            }}>
                Use Default Declaration
            </button>
        </div>
    );
}

// ============================================================
// Empty State
// ============================================================
function EmptyState({ text, onAdd }: { text: string; onAdd: () => void }) {
    return (
        <div className="text-center py-12 opacity-60">
            <p className="text-sm text-slate-400 mb-3">{text}</p>
            <button className="btn-primary" onClick={onAdd}><Plus size={14} /> Add First Item</button>
        </div>
    );
}

export default CVForm;
