import React from 'react';
import type { CVData, TemplateConfig } from '../types';
import { useCVStore } from '../store/cvStore';

interface Props {
    data: CVData;
    template: TemplateConfig;
    scale?: number;
    pageIndex?: number;
    id?: string;
}

// ─── Helper Components ─────────────────────────────────────────────────────────

const ORANGE = '#D97706'; // Vibrant classic orange
const DARK   = '#111827';

function SectionHeading({ title, fontSize }: { title: string; fontSize: number }) {
    return (
        <div style={{ marginBottom: 6 }}>
            <div style={{ fontWeight: 'bold', fontSize: fontSize + 2, color: ORANGE, fontFamily: 'Georgia, serif' }}>
                {title}
            </div>
            {/* Double line bar matching screenshot: top orange line, bottom light blue line */}
            <div style={{ height: 2, background: ORANGE, marginTop: 3 }} />
            <div style={{ height: 1.5, background: '#93C5FD', marginTop: 1.5, marginBottom: 6 }} />
        </div>
    );
}

function ArrowRow({ label, value, fontSize }: { label: string; value: string; fontSize: number }) {
    if (!value) return null;
    return (
        <div style={{ display: 'flex', fontSize, lineHeight: 1.55, paddingBottom: 2.5 }}>
            <div style={{ width: 145, flexShrink: 0, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                <span style={{ color: ORANGE, fontWeight: 'bold', fontSize: fontSize + 1 }}>➤</span>
                <span style={{ color: DARK }}>{label}</span>
            </div>
            <div style={{ width: 15, flexShrink: 0, color: DARK }}>:</div>
            <div style={{ flex: 1, color: DARK, wordBreak: 'break-word' }}>{value}</div>
        </div>
    );
}

// ─── Main Classic CV Renderer ──────────────────────────────────────────────────

const ClassicCVRenderer: React.FC<Props> = ({ data, template, scale = 1, id = 'cv-render-target' }) => {
    const { fontSizeModifier, topSpacing } = useCVStore();
    const fs = 10.5 + fontSizeModifier;       // base font size
    const p  = data.personal;

    const isSectionVisible = (key: string, defaultVisible = true) => {
        if (data.sectionVisibility && typeof data.sectionVisibility[key] === 'boolean') {
            return data.sectionVisibility[key];
        }
        return defaultVisible;
    };

    const showPhoto = isSectionVisible('photo', true);
    const showObj   = isSectionVisible('objective', true);
    const showExp   = isSectionVisible('experience', true);
    const showDecl  = isSectionVisible('declaration', true);
    const showTrain = isSectionVisible('trainings', true);
    const showRef   = isSectionVisible('references', false);
    const showHobbies = isSectionVisible('hobbies', true);
    const showLang  = isSectionVisible('languages', true);

    const PAGE_W = template.pageSize.width;
    const PAGE_H = template.pageSize.height;
    const PAD    = 38;

    return (
        <div
            id={id}
            className="cv-page"
            style={{
                width: PAGE_W,
                height: PAGE_H,
                boxSizing: 'border-box',
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                fontFamily: `'Times New Roman', Georgia, serif`,
                color: DARK,
                fontSize: fs,
                lineHeight: 1.55,
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* ── Salmon watermark strip on left ── */}
            <div style={{
                position: 'absolute',
                left: 0, top: 0,
                width: 26,
                height: '100%',
                background: 'linear-gradient(to bottom, #FDE6D8 0%, #FEEFEE 100%)',
                zIndex: 0,
            }} />

            {/* ── All content in a padded container ── */}
            <div style={{ position: 'relative', zIndex: 1, padding: `${PAD + topSpacing}px ${PAD}px ${PAD}px ${PAD + 8}px` }}>

                {/* ─── TOP HEADER ─── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, minHeight: 90 }}>
                    
                    {/* Left: Photo / Orange Block */}
                    {showPhoto ? (
                        <div style={{
                            width: 105,
                            height: 115,
                            background: data.photo ? '#FFFFFF' : ORANGE,
                            flexShrink: 0,
                            overflow: 'hidden',
                            border: `3px solid ${ORANGE}`,
                            borderRadius: 4,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {data.photo ? (
                                <img src={data.photo} alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: ORANGE }} />
                            )}
                        </div>
                    ) : (
                        <div style={{ width: 105 }} />
                    )}

                    {/* Center: Curriculum Vitae exact Image Logo */}
                    <div style={{ textAlign: 'center', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img
                            src="./cv-logo.svg"
                            alt="Curriculum Vitae"
                            style={{ height: 65, objectFit: 'contain', display: 'block' }}
                        />
                    </div>

                    {/* Right Spacer for balance */}
                    <div style={{ width: 105 }} />
                </div>

                {/* ─── Name & Mobile ─── */}
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 'bold', fontSize: fs + 8, letterSpacing: 1.2, textTransform: 'uppercase', color: DARK, fontFamily: 'Georgia, serif' }}>
                        {p.name || 'YOUR FULL NAME'}
                    </div>
                    {p.phone && (
                        <div style={{ fontWeight: 'bold', fontSize: fs + 1.5, color: DARK, marginTop: 2 }}>
                            Mobile: {p.phone}
                        </div>
                    )}
                </div>

                {/* Top double line bar under header */}
                <div style={{ marginBottom: 12 }}>
                    <div style={{ height: 2, background: ORANGE }} />
                    <div style={{ height: 1.5, background: '#93C5FD', marginTop: 1.5 }} />
                </div>

                {/* ─── Contact Address ─── */}
                <SectionHeading title="Contact Address:" fontSize={fs} />
                <div style={{ marginBottom: 12, fontSize: fs, lineHeight: 1.6 }}>
                    {[p.address, p.permanentAddress].filter(Boolean).join(', ') ||
                        'Village: South Chartha, P.O: Cumilla-3500, P.S: Adarsha Sadar, District: Cumilla'}
                </div>

                {/* ─── Personal Profile ─── */}
                <SectionHeading title="Personal Profile" fontSize={fs} />
                <div style={{ marginBottom: 12, border: '1px solid #CBD5E1', padding: '8px 10px', borderRadius: 2 }}>
                    <ArrowRow label="Name"              value={p.name}             fontSize={fs} />
                    <ArrowRow label="Father's Name"     value={p.fatherName}       fontSize={fs} />
                    <ArrowRow label="Mother's Name"     value={p.motherName}       fontSize={fs} />
                    <ArrowRow label="Permanent Address" value={p.permanentAddress || p.address} fontSize={fs} />
                    <ArrowRow label="Nationality"       value={p.nationality}      fontSize={fs} />
                    <ArrowRow label="Marital status"    value={p.maritalStatus}    fontSize={fs} />
                    <ArrowRow label="Religion"          value={p.religion}         fontSize={fs} />
                    <ArrowRow label="Gender"            value={p.gender}           fontSize={fs} />
                    <ArrowRow label="Blood Group"       value={p.bloodGroup}       fontSize={fs} />
                    <ArrowRow label="Height"            value={p.height}           fontSize={fs} />
                    <ArrowRow label="Date of Birth"     value={p.dob}              fontSize={fs} />
                    <ArrowRow label="NID Number"        value={p.nid}              fontSize={fs} />
                    {p.email && <ArrowRow label="Email"  value={p.email}           fontSize={fs} />}
                </div>

                {/* ─── Career Objective ─── */}
                {showObj && data.careerObjective && (
                    <>
                        <SectionHeading title="Career Objective" fontSize={fs} />
                        <div style={{ fontSize: fs, marginBottom: 12, textAlign: 'justify', lineHeight: 1.65 }}>
                            {data.careerObjective}
                        </div>
                    </>
                )}

                {/* ─── Academic Qualifications ─── */}
                {data.education && data.education.length > 0 && (
                    <>
                        <SectionHeading title="Academic Qualifications" fontSize={fs} />
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fs - 0.5, marginBottom: 12, tableLayout: 'fixed' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC' }}>
                                    {['Name of Exam.', 'Passing year', 'Group', 'GPA/Division', 'Board/University'].map((h) => (
                                        <th key={h} style={{ border: '1px solid #94A3B8', padding: '5px 6px', fontWeight: 'bold', textAlign: 'center', color: DARK }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.education.map((edu, i) => (
                                    <tr key={edu.id || i}>
                                        <td style={{ border: '1px solid #94A3B8', padding: '5px 6px', textAlign: 'center' }}>{edu.degree}</td>
                                        <td style={{ border: '1px solid #94A3B8', padding: '5px 6px', textAlign: 'center' }}>{edu.passingYear}</td>
                                        <td style={{ border: '1px solid #94A3B8', padding: '5px 6px', textAlign: 'center' }}>{edu.group}</td>
                                        <td style={{ border: '1px solid #94A3B8', padding: '5px 6px', textAlign: 'center' }}>{edu.result}</td>
                                        <td style={{ border: '1px solid #94A3B8', padding: '5px 6px', textAlign: 'center' }}>{edu.board || edu.university}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {/* ─── Work Experience ─── */}
                {showExp && data.experience && data.experience.length > 0 && (
                    <>
                        <SectionHeading title="Work Experiences" fontSize={fs} />
                        <div style={{ marginBottom: 12 }}>
                            {data.experience.map((exp, i) => (
                                <div key={exp.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 4, fontSize: fs }}>
                                    <span style={{ color: ORANGE, fontWeight: 'bold', fontSize: fs + 1, flexShrink: 0 }}>➤</span>
                                    <div>
                                        <strong>{exp.title}</strong>
                                        {exp.company && <span> — {exp.company}</span>}
                                        {exp.duration && <span style={{ color: '#4B5563' }}> ({exp.duration})</span>}
                                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                                            <div style={{ marginTop: 2, textAlign: 'justify' }}>
                                                {exp.responsibilities.join('. ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ─── Trainings & Certifications ─── */}
                {showTrain && data.trainings && data.trainings.length > 0 && (
                    <>
                        <SectionHeading title="Trainings & Certifications" fontSize={fs} />
                        <div style={{ marginBottom: 12 }}>
                            {data.trainings.map((t, i) => (
                                <div key={i} style={{ display: 'flex', gap: 4, fontSize: fs, marginBottom: 3 }}>
                                    <span style={{ color: ORANGE, fontWeight: 'bold', flexShrink: 0 }}>➤</span>
                                    <div><strong>{t.name}</strong>{t.institution ? ` — ${t.institution}` : ''}{t.year ? ` (${t.year})` : ''}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ─── Languages ─── */}
                {showLang && data.languages && data.languages.length > 0 && (
                    <>
                        <SectionHeading title="Language Proficiency" fontSize={fs} />
                        <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: '4px 20px' }}>
                            {data.languages.map((lang, i) => (
                                <div key={i} style={{ fontSize: fs, display: 'flex', gap: 4 }}>
                                    <span style={{ color: ORANGE, fontWeight: 'bold' }}>➤</span>
                                    <span>{lang.name}{lang.proficiency ? ` (${lang.proficiency})` : ''}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ─── Hobbies ─── */}
                {showHobbies && data.hobbies && data.hobbies.length > 0 && (
                    <>
                        <SectionHeading title="Hobbies & Interests" fontSize={fs} />
                        <div style={{ marginBottom: 12, fontSize: fs }}>
                            {data.hobbies.map((h: any, i: number) => (
                                <span key={i}>{typeof h === 'string' ? h : h.name}{i < data.hobbies.length - 1 ? ', ' : ''}</span>
                            ))}
                        </div>
                    </>
                )}

                {/* ─── References ─── */}
                {showRef && data.references && data.references.length > 0 && (
                    <>
                        <SectionHeading title="References" fontSize={fs} />
                        <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            {data.references.map((ref, i) => (
                                <div key={i} style={{ fontSize: fs, flex: '1 1 200px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{ref.name}</div>
                                    <div>{ref.designation}</div>
                                    <div>{ref.organization}</div>
                                    {ref.phone && <div>Phone: {ref.phone}</div>}
                                    {ref.email && <div>Email: {ref.email}</div>}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ─── Declaration ─── */}
                {showDecl && (
                    <>
                        <SectionHeading title="Declaration of authenticity" fontSize={fs} />
                        <div style={{ fontSize: fs, marginBottom: 18, textAlign: 'justify', lineHeight: 1.65 }}>
                            {data.declaration ||
                                'I do hereby declare that, all information presented here is true to my knowledge. If required, I will submit all these documents for authentication.'}
                        </div>
                    </>
                )}

                {/* ─── Signature & Date ─── */}
                <div style={{ marginTop: 12, fontSize: fs }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 12 }}>
                        Signature:............................
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                        Date:...................................
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassicCVRenderer;
