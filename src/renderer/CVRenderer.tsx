import React, { useState, useEffect } from 'react';
import type { CVData, TemplateConfig } from '../types';
import { Phone, Mail, MapPin, Globe, User } from 'lucide-react';
import { useCVStore } from '../store/cvStore';

interface CVRendererProps {
    data: CVData;
    template: TemplateConfig;
    scale?: number;
    pageIndex?: number;
    id?: string;
}

const CVRenderer: React.FC<CVRendererProps> = ({ data, template, scale = 1, pageIndex = 1, id = 'cv-render-target' }) => {
    const { pageSize, fonts } = template;
    const { fontSizeModifier, topSpacing, bottomSpacing, updateCVData } = useCVStore();

    // Resolve template colors dynamically with defaults
    const primaryColor = template.colors.primary || '#0C4A6E';
    const sidebarBg = template.colors.sidebarBg || '#E9ECEF';
    const sidebarTextColor = template.colors.sidebarText || '#1E293B';
    const mainBg = template.colors.background || '#FFFFFF';
    const textColor = template.colors.text || '#000000';
    const lineColor = template.colors.accent || '#A0AEC0';

    const isSectionVisible = (key: string, defaultVisible: boolean = true) => {
        if (data.sectionVisibility && typeof data.sectionVisibility[key] === 'boolean') {
            return data.sectionVisibility[key];
        }
        return defaultVisible;
    };

    const sidebarWidth = 270;

    // Draggable photo positioning states
    const [position, setPosition] = useState(data.photoPosition || { x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Sync position state from store updates
    useEffect(() => {
        if (!isDragging) {
            setPosition(data.photoPosition || { x: 0, y: 0 });
        }
    }, [data.photoPosition, isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!data.photo) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            updateCVData((draft) => {
                draft.photoPosition = position;
            });
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!data.photo || e.touches.length !== 1) return;
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        setPosition({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y,
        });
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!data.photo) return;
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 0.05 : -0.05;
        const currentZoom = data.photoZoom || 1;
        const newZoom = Math.min(4, Math.max(0.2, currentZoom + zoomDelta));
        updateCVData((draft) => {
            draft.photoZoom = newZoom;
        });
    };

    const iconMap: Record<string, React.ReactNode> = {
        phone: <Phone size={10} />,
        email: <Mail size={10} />,
        address: <MapPin size={10} />,
        website: <Globe size={10} />,
        linkedin: (
            <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
            </svg>
        ),
        github: (
            <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
        ),
    };

    if (template.layoutType === 'modern-blue') {
        return (
            <div
                className="cv-page"
                id={id}
                style={{
                    width: pageSize.width,
                    height: pageSize.height,
                    boxSizing: 'border-box',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    fontFamily: `'${fonts.body}', sans-serif`,
                    color: textColor,
                    fontSize: 10 + fontSizeModifier,
                    lineHeight: 1.5,
                    display: 'flex',
                    flexDirection: 'row',
                    backgroundColor: mainBg,
                    overflow: 'hidden',
                }}
            >
                {/* ── LEFT SIDEBAR ── */}
                <div style={{
                    width: sidebarWidth + 20, // slightly wider for modern blue
                    backgroundColor: sidebarBg,
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    height: '100%',
                    boxSizing: 'border-box',
                    padding: `${25 + topSpacing}px 25px ${25 + bottomSpacing}px 25px`,
                }}>
                    {/* Name */}
                    <div style={{
                        fontSize: 26 + fontSizeModifier,
                        fontWeight: 800,
                        color: template.colors.primary,
                        fontFamily: `'${fonts.heading}', sans-serif`,
                        textAlign: 'center',
                        marginBottom: 20,
                        lineHeight: 1.2
                    }}>
                        {data.personal.name || 'YOUR NAME'}
                    </div>

                    {/* Photo */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
                        {data.photo ? (
                            <div
                                style={{
                                    width: 140,
                                    height: 160,
                                    borderRadius: 8,
                                    border: '4px solid #FFFFFF',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    backgroundColor: '#0F172A',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    userSelect: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleMouseUp}
                                onWheel={handleWheel}
                            >
                                <img
                                    src={data.photo}
                                    alt="Profile"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        transform: `translate(${position.x}px, ${position.y}px) rotate(${data.photoRotation || 0}deg) scale(${data.photoZoom || 1})`,
                                        pointerEvents: 'none',
                                        display: 'block',
                                    }}
                                    draggable={false}
                                />
                            </div>
                        ) : (
                            <div style={{
                                width: 140,
                                height: 160,
                                borderRadius: 8,
                                border: `4px dashed ${template.colors.primary}`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: template.colors.primary,
                                opacity: 0.8,
                            }}>
                                <User size={28} />
                                <span style={{ fontSize: 10, marginTop: 4 }}>No Photo</span>
                            </div>
                        )}
                    </div>

                    {/* Contact */}
                    {(data.personal.phone || data.personal.email || data.personal.address) && (
                        <div style={{ marginBottom: 20 }}>
                            <SectionTitle text="Contact" fonts={fonts} lineColor={template.colors.accent} color={template.colors.primary} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: '#1E293B', fontWeight: 500 }}>
                                {data.personal.address && (
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: 11 + fontSizeModifier }}>Present Address:</div>
                                        <div style={{ lineHeight: 1.3 }}>{data.personal.address}</div>
                                    </div>
                                )}
                                {data.personal.phone && (
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: 11 + fontSizeModifier }}>Phone:</div>
                                        <div>{data.personal.phone}</div>
                                    </div>
                                )}
                                {data.personal.email && (
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: 11 + fontSizeModifier }}>Email:</div>
                                        <div style={{ textDecoration: 'underline' }}>{data.personal.email}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {data.languages.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <SectionTitle text="Languages" fonts={fonts} lineColor={template.colors.accent} color={template.colors.primary} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#1E293B' }}>
                                Have good skills of reading, writing & speaking in:
                                {data.languages.map((lang) => (
                                    <div key={lang.id} style={{ fontWeight: 500 }}>
                                        • {lang.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Computer Skills */}
                    {data.computerSkills.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <SectionTitle text="Computer Skills" fonts={fonts} lineColor={template.colors.accent} color={template.colors.primary} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#1E293B', fontWeight: 500 }}>
                                {data.computerSkills.map((skill) => (
                                    <div key={skill.id} style={{ display: 'flex', gap: 6 }}>
                                        <span>•</span>
                                        <span>{skill.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Signature */}
                    <div style={{ marginTop: 'auto', paddingTop: 30 }}>
                        <div style={{ width: '120px', height: '1px', backgroundColor: '#1E293B', marginBottom: 4 }} />
                        <div style={{ color: '#1E293B', fontSize: 11 + fontSizeModifier }}>Signature</div>
                        <div style={{ color: '#1E293B', fontSize: 11 + fontSizeModifier, marginTop: 2 }}>Date:</div>
                    </div>
                </div>

                {/* ── RIGHT MAIN ── */}
                <div style={{
                    flex: 1,
                    backgroundColor: mainBg,
                    padding: `${25 + topSpacing}px 30px ${25 + bottomSpacing}px 30px`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    color: textColor,
                    boxSizing: 'border-box',
                }}>
                    {/* Career Objective */}
                    {data.careerObjective && (
                        <div>
                            <SectionTitle text="Career Objective" fonts={fonts} lineColor={template.colors.accent} color={template.colors.primary} />
                            <div style={{ textAlign: 'justify', lineHeight: 1.6, color: '#1E293B' }}>
                                {data.careerObjective}
                            </div>
                        </div>
                    )}

                    {/* Skill Highlights (Technical Skills) */}
                    {data.technicalSkills.length > 0 && (
                        <div>
                            <SectionTitle text="Skill Highlights" fonts={fonts} lineColor={template.colors.accent} color={template.colors.primary} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', color: '#1E293B', fontWeight: 500 }}>
                                {data.technicalSkills.map((skill) => (
                                    <div key={skill.id} style={{ display: 'flex', gap: 6 }}>
                                        <span>•</span>
                                        <span>{skill.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Personal Information */}
                    {(() => {
                        const infoItems: [string, string][] = [
                            ['Name', data.personal.name],
                            ['Father\'s Name', data.personal.fatherName],
                            ['Mother\'s Name', data.personal.motherName],
                            ['Date of Birth', data.personal.dob],
                            ['Permanent Address', data.personal.permanentAddress],
                            ['Religion', data.personal.religion],
                            ['Nationality', data.personal.nationality],
                            ['Marital Status', data.personal.maritalStatus],
                            ['Blood Group', data.personal.bloodGroup],
                            ['NID Number', data.personal.nid],
                        ].filter(([, val]) => val) as [string, string][];

                        if (infoItems.length === 0) return null;

                        return (
                            <div>
                                <SectionTitle text="Personal Information" fonts={fonts} lineColor={template.colors.accent} color={template.colors.primary} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#1E293B' }}>
                                    {infoItems.map(([label, value], idx) => (
                                        <div key={idx} style={{ display: 'flex' }}>
                                            <div style={{ width: 140, flexShrink: 0 }}>{label}</div>
                                            <div style={{ marginRight: 8 }}>:</div>
                                            <div style={{ flex: 1 }}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Education */}
                    {data.education.length > 0 && (
                        <div>
                            <SectionTitle text="Education" fonts={fonts} lineColor={template.colors.accent} color={template.colors.primary} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#1E293B' }}>
                                {data.education.map((edu) => (
                                    <div key={edu.id}>
                                        <div style={{ fontWeight: 'bold', fontSize: 11 + fontSizeModifier }}>
                                            {edu.degree} {edu.passingYear ? `on ${edu.passingYear}` : ''}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 16, marginTop: 2 }}>
                                            {edu.result && (
                                                <div style={{ display: 'flex' }}>
                                                    <div style={{ width: 60, flexShrink: 0 }}>Result</div>
                                                    <div style={{ marginRight: 8 }}>:</div>
                                                    <div>{edu.result}</div>
                                                </div>
                                            )}
                                            {edu.group && (
                                                <div style={{ display: 'flex' }}>
                                                    <div style={{ width: 60, flexShrink: 0 }}>Group</div>
                                                    <div style={{ marginRight: 8 }}>:</div>
                                                    <div>{edu.group}</div>
                                                </div>
                                            )}
                                            {edu.board && (
                                                <div style={{ display: 'flex' }}>
                                                    <div style={{ width: 60, flexShrink: 0 }}>Board</div>
                                                    <div style={{ marginRight: 8 }}>:</div>
                                                    <div>{edu.board}</div>
                                                </div>
                                            )}
                                            {edu.institution && (
                                                <div style={{ display: 'flex' }}>
                                                    <div style={{ width: 60, flexShrink: 0 }}>Institution</div>
                                                    <div style={{ marginRight: 8 }}>:</div>
                                                    <div>{edu.institution}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {data.experience.length > 0 && (
                        <div>
                            <SectionTitle text="Experience" fonts={fonts} lineColor={template.colors.accent} color={template.colors.primary} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#1E293B' }}>
                                {data.experience.map((exp) => (
                                    <div key={exp.id} style={{ display: 'flex', gap: 6 }}>
                                        <div style={{ marginTop: 2 }}>•</div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            {exp.company && (
                                                <div style={{ display: 'flex' }}>
                                                    <div style={{ width: 80, flexShrink: 0 }}>Company</div>
                                                    <div style={{ marginRight: 8 }}>:</div>
                                                    <div>{exp.company}</div>
                                                </div>
                                            )}
                                            {exp.title && (
                                                <div style={{ display: 'flex' }}>
                                                    <div style={{ width: 80, flexShrink: 0 }}>Designation</div>
                                                    <div style={{ marginRight: 8 }}>:</div>
                                                    <div>{exp.title}</div>
                                                </div>
                                            )}
                                            {exp.duration && (
                                                <div style={{ display: 'flex' }}>
                                                    <div style={{ width: 80, flexShrink: 0 }}>Duration</div>
                                                    <div style={{ marginRight: 8 }}>:</div>
                                                    <div>{exp.duration}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className="cv-page"
            id={id}
            style={{
                width: pageSize.width,
                height: pageSize.height,
                boxSizing: 'border-box',
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                fontFamily: `'${fonts.body}', sans-serif`,
                color: textColor,
                fontSize: 10 + fontSizeModifier,
                lineHeight: 1.5,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: mainBg,
                overflow: 'hidden',
            }}
        >
            {/* ── Conditional Top Header ── */}
            {template.layoutType === 'top-header' && pageIndex === 1 && (
                <div style={{
                    padding: `${20 + topSpacing}px 0 20px 40px`,
                    width: '100%',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    backgroundColor: template.colors.background,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: template.colors.headerBg,
                        borderTopLeftRadius: 100,
                        borderBottomLeftRadius: 100,
                        height: 120,
                        marginLeft: 40,
                        boxSizing: 'border-box',
                        position: 'relative',
                    }}>
                        {/* Photo */}
                        {data.photo ? (
                            <div
                                style={{
                                    width: 150,
                                    height: 150,
                                    borderRadius: template.elements.photo?.shape === 'rectangle' ? '8px' : '50%',
                                    border: `8px solid ${template.colors.background}`,
                                    overflow: 'hidden',
                                    position: 'absolute',
                                    left: -50,
                                    top: -15,
                                    backgroundColor: '#0F172A',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    userSelect: 'none',
                                    flexShrink: 0,
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleMouseUp}
                                onWheel={handleWheel}
                                title="Drag to reposition, mouse wheel scroll to zoom"
                            >
                                <img
                                    src={data.photo}
                                    alt="Profile"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        transform: `translate(${position.x}px, ${position.y}px) rotate(${data.photoRotation || 0}deg) scale(${data.photoZoom || 1})`,
                                        pointerEvents: 'none',
                                        display: 'block',
                                    }}
                                    draggable={false}
                                />
                            </div>
                        ) : (
                            <div style={{
                                width: 150,
                                height: 150,
                                borderRadius: '50%',
                                border: `8px solid ${template.colors.background}`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: template.colors.headerText,
                                backgroundColor: template.colors.headerBg,
                                opacity: 0.8,
                                gap: 6,
                                flexShrink: 0,
                                position: 'absolute',
                                left: -50,
                                top: -15,
                            }}>
                                <User size={28} />
                            </div>
                        )}
                        
                        {/* Name & Profession */}
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', marginLeft: 120 }}>
                            <div style={{
                                fontSize: 32 + fontSizeModifier,
                                fontWeight: 800,
                                color: template.colors.headerText,
                                fontFamily: `'${fonts.heading}', sans-serif`,
                                textTransform: 'uppercase',
                                lineHeight: 1.1,
                                letterSpacing: '2px',
                            }}>
                                {data.personal.name || 'YOUR NAME'}
                            </div>
                            {data.personal.profession && (
                                <div style={{
                                    fontSize: 14 + fontSizeModifier,
                                    color: template.colors.headerText,
                                    opacity: 0.85,
                                    marginTop: 6,
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                }}>
                                    {data.personal.profession}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Conditional Top Header Alt (Right Photo) ── */}
            {template.layoutType === 'top-header-alt' && pageIndex === 1 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${20 + topSpacing}px 40px 20px 0`,
                    width: '100%',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    backgroundColor: template.colors.background,
                }}>
                    {/* Name Block */}
                    <div style={{
                        backgroundColor: template.colors.headerBg,
                        padding: '24px 40px',
                        borderTopRightRadius: 20,
                        borderBottomRightRadius: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        flex: 1,
                        marginRight: 40,
                    }}>
                        <div style={{
                            fontSize: 32 + fontSizeModifier,
                            fontWeight: 800,
                            color: template.colors.headerText,
                            fontFamily: `'${fonts.heading}', sans-serif`,
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            lineHeight: 1.1,
                        }}>
                            {data.personal.name || 'YOUR NAME'}
                        </div>
                        {data.personal.profession && (
                            <div style={{
                                fontSize: 14 + fontSizeModifier,
                                color: template.colors.headerText,
                                opacity: 0.85,
                                marginTop: 6,
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}>
                                {data.personal.profession}
                            </div>
                        )}
                    </div>
                    
                    {/* Photo */}
                    {data.photo ? (
                        <div
                            style={{
                                width: 140,
                                height: 140,
                                borderRadius: template.elements.photo?.borderRadius || 20,
                                border: `4px solid ${template.colors.primary}`,
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundColor: '#0F172A',
                                cursor: isDragging ? 'grabbing' : 'grab',
                                userSelect: 'none',
                                flexShrink: 0,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                            onWheel={handleWheel}
                            title="Drag to reposition, mouse wheel scroll to zoom"
                        >
                            <img
                                src={data.photo}
                                alt="Profile"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    transform: `translate(${position.x}px, ${position.y}px) rotate(${data.photoRotation || 0}deg) scale(${data.photoZoom || 1})`,
                                    pointerEvents: 'none',
                                    display: 'block',
                                }}
                                draggable={false}
                            />
                        </div>
                    ) : (
                        <div style={{
                            width: 140,
                            height: 140,
                            borderRadius: template.elements.photo?.borderRadius || 20,
                            border: `4px dashed ${template.colors.primary}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: template.colors.primary,
                            backgroundColor: template.colors.background,
                            opacity: 0.8,
                            gap: 6,
                            flexShrink: 0,
                        }}>
                            <User size={28} />
                        </div>
                    )}
                </div>
            )}

            {/* ── Conditional Overlap Header ── */}
            {template.layoutType === 'overlap' && pageIndex === 1 && (
                <div style={{
                    width: '100%',
                    height: 180,
                    backgroundColor: template.colors.headerBg,
                    display: 'flex',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 10,
                }}>
                    {/* Name & Profession */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingLeft: sidebarWidth + 30, paddingRight: 30, paddingTop: 25 }}>
                        <div style={{
                            fontSize: 32 + fontSizeModifier,
                            fontWeight: 800,
                            color: template.colors.headerText,
                            fontFamily: `'${fonts.heading}', sans-serif`,
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                        }}>
                            {data.personal.name || 'YOUR NAME'}
                        </div>
                        {data.personal.profession && (
                            <div style={{
                                fontSize: 14 + fontSizeModifier,
                                color: template.colors.headerText,
                                opacity: 0.85,
                                marginTop: 6,
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}>
                                {data.personal.profession}
                            </div>
                        )}
                    </div>
                    
                    {/* Overlapping Photo */}
                    <div style={{
                        position: 'absolute',
                        left: (sidebarWidth - 150) / 2,
                        top: 180 - 75,
                        zIndex: 20,
                    }}>
                        {data.photo ? (
                            <div
                                style={{
                                    width: 150,
                                    height: 150,
                                    borderRadius: '50%',
                                    border: `6px solid ${template.colors.background}`,
                                    overflow: 'hidden',
                                    backgroundColor: '#0F172A',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    userSelect: 'none',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleMouseUp}
                                onWheel={handleWheel}
                                title="Drag to reposition, mouse wheel scroll to zoom"
                            >
                                <img
                                    src={data.photo}
                                    alt="Profile"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        transform: `translate(${position.x}px, ${position.y}px) rotate(${data.photoRotation || 0}deg) scale(${data.photoZoom || 1})`,
                                        pointerEvents: 'none',
                                        display: 'block',
                                    }}
                                    draggable={false}
                                />
                            </div>
                        ) : (
                            <div style={{
                                width: 150,
                                height: 150,
                                borderRadius: '50%',
                                border: `6px dashed ${template.colors.background}`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: template.colors.background,
                                backgroundColor: template.colors.headerBg,
                                opacity: 0.8,
                            }}>
                                <User size={28} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Two-column body: sidebar LEFT, main RIGHT ── */}
            <div style={{ display: 'flex', flex: 1, height: (template.layoutType === 'top-header' || template.layoutType === 'top-header-alt' || template.layoutType === 'overlap') && pageIndex === 1 ? 'auto' : pageSize.height, overflow: 'hidden' }}>

                {/* ── LEFT SIDEBAR ── */}
                <div style={{
                    width: sidebarWidth,
                    backgroundColor: sidebarBg,
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    height: '100%',
                    boxSizing: 'border-box',
                    borderTopRightRadius: template.layoutType === 'top-header' && pageIndex === 1 ? 60 : (template.layoutType === 'top-header-alt' && pageIndex === 1 ? 20 : 0),
                    borderBottomRightRadius: template.layoutType === 'top-header-alt' ? 20 : 0,
                    paddingTop: template.layoutType === 'overlap' && pageIndex === 1 ? 95 : 0,
                }}>
                    {pageIndex === 1 ? (
                        <>
                            {/* Photo slot — styled header boundary */}
                            {(template.layoutType !== 'top-header' && template.layoutType !== 'top-header-alt' && template.layoutType !== 'overlap') && (
                                <div style={{
                                    backgroundColor: primaryColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: `${24 + topSpacing}px 0 24px 0`,
                                    flexShrink: 0,
                                }}>
                                    {data.photo ? (
                                        <div
                                            style={{
                                                width: 190,
                                                height: 190,
                                                borderRadius: template.elements.photo?.shape === 'rectangle' ? '8px' : '50%',
                                                border: '4px solid #FFFFFF',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                backgroundColor: '#0F172A',
                                                cursor: isDragging ? 'grabbing' : 'grab',
                                                userSelect: 'none',
                                            }}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseUp}
                                            onTouchStart={handleTouchStart}
                                            onTouchMove={handleTouchMove}
                                            onTouchEnd={handleMouseUp}
                                            onWheel={handleWheel}
                                            title="Drag to reposition, mouse wheel scroll to zoom"
                                        >
                                            <img
                                                src={data.photo}
                                                alt="Profile"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    transform: `translate(${position.x}px, ${position.y}px) rotate(${data.photoRotation || 0}deg) scale(${data.photoZoom || 1})`,
                                                    pointerEvents: 'none',
                                                    display: 'block',
                                                }}
                                                draggable={false}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: 190,
                                            height: 190,
                                            borderRadius: '50%',
                                            border: '4px dashed rgba(255,255,255,0.6)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#FFFFFF',
                                            opacity: 0.8,
                                            gap: 6,
                                        }}>
                                            <User size={28} />
                                            <span style={{ fontSize: 11 + fontSizeModifier, fontWeight: 'bold' }}>No Photo Uploaded</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sidebar content */}
                            <div style={{
                                padding: `20px 22px ${20 + bottomSpacing}px 22px`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 18,
                                flex: 1,
                                color: sidebarTextColor,
                                boxSizing: 'border-box',
                            }}>
                                {/* Contact Section */}
                                {(data.personal.phone || data.personal.email || data.personal.address || data.personal.website) && (
                                    <div>
                                        <SectionTitle text="CONTACT" fonts={fonts} lineColor={sidebarTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : lineColor} color={sidebarTextColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                            {data.personal.phone && <ContactItem icon={iconMap.phone} text={data.personal.phone} color={sidebarTextColor} />}
                                            {data.personal.email && <ContactItem icon={iconMap.email} text={data.personal.email} color={sidebarTextColor} />}
                                            {data.personal.address && <ContactItem icon={iconMap.address} text={data.personal.address} color={sidebarTextColor} />}
                                            {data.personal.website && <ContactItem icon={iconMap.website} text={data.personal.website} color={sidebarTextColor} />}
                                        </div>
                                    </div>
                                )}

                                {/* Computer Skills */}
                                {data.computerSkills.length > 0 && (
                                    <div>
                                        <SectionTitle text="COMPUTER SKILLS" fonts={fonts} lineColor={sidebarTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : lineColor} color={sidebarTextColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {data.computerSkills.map((skill) => (
                                                <BulletItem key={skill.id} text={skill.name} color={sidebarTextColor} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Technical / Key Skills */}
                                {data.technicalSkills.length > 0 && (
                                    <div>
                                        <SectionTitle text="KEY SKILLS" fonts={fonts} lineColor={sidebarTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : lineColor} color={sidebarTextColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {data.technicalSkills.map((skill) => (
                                                <BulletItem key={skill.id} text={skill.name} color={sidebarTextColor} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // PAGE 2 SIDEBAR CONTENT
                        <div style={{
                            padding: `${24 + topSpacing}px 22px ${24 + bottomSpacing}px 22px`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                            flex: 1,
                            color: sidebarTextColor,
                            height: '100%',
                            boxSizing: 'border-box',
                        }}>
                            {/* Languages */}
                            {data.languages.length > 0 && (
                                <div>
                                    <SectionTitle text="LANGUAGE SKILLS" fonts={fonts} lineColor={sidebarTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : lineColor} color={sidebarTextColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {data.languages.map((lang) => {
                                            const profStr = [lang.reading && 'Reading', lang.writing && 'Writing', lang.speaking && 'Speaking'].filter(Boolean).join(', ');
                                            return (
                                                <div key={lang.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <BulletItem text={<span>{lang.name} — {lang.proficiency}</span>} color={sidebarTextColor} />
                                                    {profStr && (
                                                        <div style={{ paddingLeft: 12, fontSize: 9, opacity: 0.85, color: sidebarTextColor }}>({profStr})</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Hobbies */}
                            {isSectionVisible('hobbies', true) && data.hobbies.length > 0 && (
                                <div>
                                    <SectionTitle text="HOBBIES" fonts={fonts} lineColor={sidebarTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : lineColor} color={sidebarTextColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {data.hobbies.map((hobby, idx) => (
                                            <BulletItem key={idx} text={hobby} color={sidebarTextColor} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trainings & Certifications */}
                            {isSectionVisible('trainings', true) && data.trainings && data.trainings.length > 0 && (
                                <div>
                                    <SectionTitle text="TRAININGS & CERTIFICATIONS" fonts={fonts} lineColor={sidebarTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : lineColor} color={sidebarTextColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {data.trainings.map((tr: any) => (
                                            <div key={tr.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <BulletItem text={<span style={{ fontWeight: 700 }}>{tr.name}</span>} color={sidebarTextColor} />
                                                {tr.organization && <div style={{ paddingLeft: 14, fontSize: 9, opacity: 0.85, color: sidebarTextColor }}>{tr.organization}{tr.duration ? ` · ${tr.duration}` : ''}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Certificates */}
                            {isSectionVisible('certificates', false) && data.certificates && data.certificates.length > 0 && (
                                <div>
                                    <SectionTitle text="CERTIFICATES" fonts={fonts} lineColor={sidebarTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : lineColor} color={sidebarTextColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {data.certificates.map((cert: any) => (
                                            <div key={cert.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <BulletItem text={<span style={{ fontWeight: 700 }}>{cert.name}</span>} color={sidebarTextColor} />
                                                {cert.issuer && <div style={{ paddingLeft: 14, fontSize: 9, opacity: 0.85, color: sidebarTextColor }}>{cert.issuer}{cert.date ? ` · ${cert.date}` : ''}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Signature */}
                            <div style={{ marginTop: 'auto', marginBottom: 20 }}>
                                <div style={{
                                    height: 1.5,
                                    backgroundColor: sidebarTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : (sidebarTextColor === '#000000' ? '#000000' : '#4B5563'),
                                    width: '90%',
                                    marginBottom: 6,
                                }} />
                                <div style={{
                                    fontSize: 12 + fontSizeModifier,
                                    fontWeight: 800,
                                    color: sidebarTextColor,
                                    fontFamily: `'${fonts.heading}', sans-serif`,
                                    textTransform: 'uppercase',
                                }}>
                                    SIGNATURE
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: 11 + fontSizeModifier, marginTop: 4, color: sidebarTextColor, textTransform: 'uppercase' }}>
                                    {data.personal.name}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Main Content */}
                <div style={{
                    flex: 1,
                    backgroundColor: mainBg,
                    padding: `${25 + topSpacing}px 30px ${25 + bottomSpacing}px 30px`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 18,
                    color: textColor,
                    height: '100%',
                    boxSizing: 'border-box',
                }}>
                    {pageIndex === 1 ? (
                        <>
                            {/* Name & Profession header */}
                            {(template.layoutType !== 'top-header' && template.layoutType !== 'top-header-alt' && template.layoutType !== 'overlap') && (
                                <div style={{
                                    borderBottom: `3px solid ${primaryColor}`,
                                    paddingBottom: 16,
                                    marginBottom: 4,
                                }}>
                                    <div style={{
                                        fontSize: 26 + fontSizeModifier,
                                        fontWeight: 800,
                                        color: primaryColor,
                                        fontFamily: `'${fonts.heading}', sans-serif`,
                                        textTransform: 'uppercase',
                                        lineHeight: 1.2,
                                    }}>
                                        {data.personal.name || 'YOUR NAME'}
                                    </div>
                                    {data.personal.profession && (
                                        <div style={{
                                            fontSize: 12 + fontSizeModifier,
                                            color: '#64748B',
                                            marginTop: 4,
                                            fontWeight: 500,
                                        }}>
                                            {data.personal.profession}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Career Summary */}
                            {data.careerObjective && (
                                <div>
                                    <SectionTitle text="CAREER SUMMARY" fonts={fonts} lineColor={lineColor} color={primaryColor} />
                                    <div style={{ textAlign: 'justify', lineHeight: 1.5 }}>
                                        {data.careerObjective}
                                    </div>
                                </div>
                            )}

                            {/* Work Experience */}
                            {isSectionVisible('experience', true) && data.experience.length > 0 && (
                                <div>
                                    <SectionTitle text="WORK EXPERIENCE" fonts={fonts} lineColor={lineColor} color={primaryColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                                        {data.experience.map((exp) => (
                                            <div key={exp.id}>
                                                <div style={{ fontWeight: 'bold', fontSize: 11 + fontSizeModifier }}>{exp.title}</div>
                                                <div style={{ fontSize: 10 + fontSizeModifier }}>{exp.company}</div>
                                                {exp.duration && <div style={{ fontSize: 9 + fontSizeModifier }}>Duration: {exp.duration}</div>}

                                                {exp.responsibilities.length > 0 && (
                                                    <div style={{ marginTop: 6 }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: 9 + fontSizeModifier, marginBottom: 4 }}>Responsibilities:</div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                            {exp.responsibilities.map((resp, idx) => (
                                                                <BulletItem key={idx} text={resp} color={textColor} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education (on Page 1 if template.educationPage is not 2) */}
                            {template.educationPage !== 2 && data.education.length > 0 && (
                                <div>
                                    <SectionTitle text="EDUCATIONAL QUALIFICATIONS" fonts={fonts} lineColor={lineColor} color={primaryColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {(template.educationPage === 'split' ? data.education.slice(0, 1) : data.education).map((edu) => {
                                            const isJustMain = isSectionVisible('educationJustMain', false);
                                            const details: string[] = [];
                                            if (!isJustMain) {
                                                if (edu.institution) details.push(`Institution: ${edu.institution}`);
                                                if (edu.university) details.push(`University: ${edu.university}`);
                                                if (edu.board) details.push(`Board: ${edu.board}`);
                                            }
                                            if (edu.group) details.push(`Group: ${edu.group}`);
                                            if (!isJustMain) {
                                                if (edu.session) details.push(`Session: ${edu.session}`);
                                            }
                                            if (edu.passingYear) details.push(`Passing Year: ${edu.passingYear}`);
                                            if (edu.result) details.push(`Result: ${edu.result}`);

                                            return (
                                                <div key={edu.id}>
                                                    <div style={{ fontWeight: 700, fontSize: 11 + fontSizeModifier, marginBottom: 4 }}>{edu.degree}</div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                        {details.map((detail, idx) => (
                                                            <BulletItem key={idx} text={detail} color={textColor} />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // PAGE 2 RIGHT COLUMN CONTENT
                        <>
                            {/* Education (on Page 2 if template.educationPage === 2 or split) */}
                            {((template.educationPage === 2 && data.education.length > 0) || (template.educationPage === 'split' && data.education.length > 1)) && (
                                <div>
                                    <SectionTitle text={template.educationPage === 'split' ? "EDUCATIONAL QUALIFICATIONS (CONT.)" : "EDUCATIONAL QUALIFICATIONS"} fonts={fonts} lineColor={lineColor} color={primaryColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {(template.educationPage === 'split' ? data.education.slice(1) : data.education).map((edu) => {
                                            const isJustMain = isSectionVisible('educationJustMain', false);
                                            const details: string[] = [];
                                            if (!isJustMain) {
                                                if (edu.institution) details.push(`Institution: ${edu.institution}`);
                                                if (edu.university) details.push(`University: ${edu.university}`);
                                                if (edu.board) details.push(`Board: ${edu.board}`);
                                            }
                                            if (edu.group) details.push(`Group: ${edu.group}`);
                                            if (!isJustMain) {
                                                if (edu.session) details.push(`Session: ${edu.session}`);
                                            }
                                            if (edu.passingYear) details.push(`Passing Year: ${edu.passingYear}`);
                                            if (edu.result) details.push(`Result: ${edu.result}`);

                                            return (
                                                <div key={edu.id}>
                                                    <div style={{ fontWeight: 700, fontSize: 11 + fontSizeModifier, marginBottom: 4 }}>{edu.degree}</div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                        {details.map((detail, idx) => (
                                                            <BulletItem key={idx} text={detail} color={textColor} />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* Personal Information */}
                            {(() => {
                                const infoItems: [string, string][] = [
                                    ['Father\'s Name', data.personal.fatherName],
                                    ['Mother\'s Name', data.personal.motherName],
                                    ['Date of Birth', data.personal.dob],
                                    ['Nationality', data.personal.nationality],
                                    ['Religion', data.personal.religion],
                                    ['Gender', data.personal.gender],
                                    ['Marital Status', data.personal.maritalStatus],
                                    ['Blood Group', data.personal.bloodGroup],
                                    ['Height', data.personal.height],
                                    ['Weight', (data.personal as any).weight],
                                    ['NID', data.personal.nid],
                                ].filter(([, val]) => val) as [string, string][];

                                if (infoItems.length === 0 && !data.personal.permanentAddress) return null;

                                return (
                                    <div>
                                        <SectionTitle text="PERSONAL INFORMATION" fonts={fonts} lineColor={lineColor} color={primaryColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {infoItems.map(([label, value], idx) => (
                                                <BulletItem key={idx} text={<span>{label}: {value}</span>} color={textColor} />
                                            ))}
                                            {data.personal.permanentAddress && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <BulletItem text={<span style={{ fontWeight: 'bold' }}>Permanent Address:</span>} color={textColor} />
                                                    {data.personal.permanentAddress.split(',').map((part, idx) => (
                                                        <div key={idx} style={{ paddingLeft: 12 }}>
                                                            <BulletItem text={part.trim()} color={textColor} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Projects */}
                            {isSectionVisible('projects', false) && data.projects.length > 0 && (
                                <div>
                                    <SectionTitle text="PROJECTS" fonts={fonts} lineColor={lineColor} color={primaryColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {data.projects.map((proj) => (
                                            <div key={proj.id}>
                                                <div style={{ fontWeight: 'bold', fontSize: 11 + fontSizeModifier }}>{proj.name}</div>
                                                <div style={{ marginTop: 2, textAlign: 'justify' }}>{proj.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Volunteering & Extracurricular */}
                            {isSectionVisible('volunteering', false) && data.volunteering && data.volunteering.length > 0 && (
                                <div>
                                    <SectionTitle text="VOLUNTEERING & ACTIVITIES" fonts={fonts} lineColor={lineColor} color={primaryColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {data.volunteering.map((vol: any) => (
                                            <div key={vol.id}>
                                                <div style={{ fontWeight: 'bold', fontSize: 11 + fontSizeModifier }}>{vol.role}</div>
                                                <div style={{ fontSize: 10 + fontSizeModifier }}>{vol.organization}{vol.duration ? ` · ${vol.duration}` : ''}</div>
                                                {vol.description && <div style={{ marginTop: 4, textAlign: 'justify', lineHeight: 1.4 }}>{vol.description}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* References */}
                            {isSectionVisible('references', false) && data.references && data.references.length > 0 && (
                                <div>
                                    <SectionTitle text="REFERENCES" fonts={fonts} lineColor={lineColor} color={primaryColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {data.references.map((ref: any) => (
                                            <div key={ref.id}>
                                                <div style={{ fontWeight: 'bold', fontSize: 11 + fontSizeModifier }}>{ref.name}</div>
                                                {ref.designation && <div style={{ fontSize: 10 + fontSizeModifier }}>{ref.designation}</div>}
                                                {ref.organization && <div style={{ fontSize: 10 + fontSizeModifier }}>{ref.organization}</div>}
                                                {ref.phone && <div style={{ fontSize: 9 + fontSizeModifier }}>📞 {ref.phone}</div>}
                                                {ref.email && <div style={{ fontSize: 9 + fontSizeModifier }}>✉ {ref.email}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Declaration */}
                            {isSectionVisible('declaration', true) && data.declaration && (
                                <div style={{ marginTop: 10 }}>
                                    <SectionTitle text="DECLARATION" fonts={fonts} lineColor={lineColor} color={primaryColor} />
                                    <div style={{ textAlign: 'justify', lineHeight: 1.5 }}>
                                        {data.declaration}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================
// Reusable sub-components
// ============================================================

function SectionTitle({ text, fonts, lineColor, color }: { text: string; fonts: { heading: string }; lineColor: string; color?: string }) {
    const { fontSizeModifier } = useCVStore();
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{
                fontSize: 13 + fontSizeModifier,
                fontWeight: 800,
                color: color || '#000000',
                fontFamily: `'${fonts.heading}', sans-serif`,
                textTransform: 'uppercase',
            }}>
                {text}
            </div>
            <div style={{ width: '100%', height: '1px', backgroundColor: lineColor, marginTop: 5 }} />
        </div>
    );
}

function ContactItem({ icon, text, color }: { icon: React.ReactNode; text: string; color?: string }) {
    const { fontSizeModifier } = useCVStore();
    const fontSize = 10 + fontSizeModifier;
    return (
        <div style={{ display: 'table', width: '100%', fontSize, lineHeight: 1.5, color: color || 'inherit' }}>
            <div style={{ display: 'table-cell', width: 22, verticalAlign: 'top', paddingTop: 1, color: color || 'inherit' }}>
                {icon}
            </div>
            <div style={{ display: 'table-cell', verticalAlign: 'top', wordBreak: 'break-word' }}>
                {text}
            </div>
        </div>
    );
}

function BulletItem({ text, color }: { text: React.ReactNode; color?: string }) {
    const { fontSizeModifier } = useCVStore();
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 10 + fontSizeModifier, lineHeight: 1.5, color: color || 'inherit' }}>
            <span style={{ flexShrink: 0, marginTop: 2, fontSize: 8, paddingLeft: 2, color: color || 'inherit' }}>•</span>
            <span style={{ wordBreak: 'break-word', flex: 1 }}>{text}</span>
        </div>
    );
}

export default CVRenderer;
