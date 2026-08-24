import type { TemplateConfig } from '../types';

// ============================================================
// Template 1: Professional Dark Blue
// ============================================================
const template1: TemplateConfig = {
    id: 'template-1',
    name: 'Professional Dark Blue',
    description: 'A professional CV with dark blue sidebar featuring circle photo, contact info, and skills',
    thumbnail: '',
    pageSize: { width: 794, height: 1123 },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    colors: {
        primary: '#0C4A6E',
        secondary: '#075985',
        accent: '#0EA5E9',
        text: '#1E293B',
        textLight: '#64748B',
        background: '#FFFFFF',
        sidebarBg: '#0C4A6E',
        sidebarText: '#FFFFFF',
        headerBg: '#FFFFFF',
        headerText: '#1E293B',
    },
    fonts: { heading: 'Montserrat', body: 'Open Sans' },
    layout: { type: 'two-column', sidebarWidth: 220, sidebarPosition: 'left', headerHeight: 0 },
    elements: {
        name: { x: 235, y: 30, width: 325, height: 36, fontSize: 24, fontWeight: 'bold', color: '#0C4A6E' },
        profession: { x: 235, y: 68, width: 325, height: 20, fontSize: 12, fontWeight: 'normal', color: '#64748B' },
        photo: { x: 55, y: 25, width: 110, height: 130, shape: 'circle', borderRadius: 999, borderColor: '#FFFFFF', borderWidth: 3 },
        contact: { x: 10, y: 170, width: 200, height: 110, title: { x: 10, y: 0, width: 200, height: 20, fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' }, items: { x: 10, y: 22, width: 190, height: 18, fontSize: 10, color: '#E2E8F0' }, gap: 6 },
        careerObjective: { x: 235, y: 95, width: 325, height: 80, title: { x: 0, y: 0, width: 325, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 325, height: 55, fontSize: 10, color: '#334155' }, gap: 5 },
        experience: { x: 235, y: 180, width: 325, height: 170, title: { x: 0, y: 0, width: 325, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 325, height: 145, fontSize: 10, color: '#334155' }, gap: 5 },
        education: { x: 235, y: 360, width: 325, height: 340, title: { x: 0, y: 0, width: 325, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 325, height: 315, fontSize: 10, color: '#334155' }, gap: 5 },
        computerSkills: { x: 10, y: 295, width: 200, height: 150, title: { x: 10, y: 0, width: 200, height: 20, fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' }, items: { x: 10, y: 22, width: 190, height: 125, fontSize: 10, color: '#E2E8F0' }, gap: 4 },
        technicalSkills: { x: 10, y: 460, width: 200, height: 240, title: { x: 10, y: 0, width: 200, height: 20, fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' }, items: { x: 10, y: 22, width: 190, height: 215, fontSize: 10, color: '#E2E8F0' }, gap: 4 },
        languages: { x: 570, y: 15, width: 210, height: 110, title: { x: 0, y: 0, width: 210, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 210, height: 85, fontSize: 10, color: '#334155' }, gap: 4 },
        hobbies: { x: 570, y: 135, width: 210, height: 90, title: { x: 0, y: 0, width: 210, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 210, height: 65, fontSize: 10, color: '#334155' }, gap: 4 },
        personalInfo: { x: 570, y: 290, width: 210, height: 380, title: { x: 0, y: 0, width: 210, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 210, height: 355, fontSize: 9, color: '#334155' }, gap: 3 },
        declaration: { x: 570, y: 680, width: 210, height: 90, title: { x: 0, y: 0, width: 210, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 210, height: 65, fontSize: 9, color: '#334155' }, gap: 3 },
        signature: { x: 570, y: 230, width: 210, height: 55, title: { x: 0, y: 0, width: 210, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 210, height: 30, fontSize: 11, color: '#334155' }, gap: 3 },
        projects: { x: 235, y: 710, width: 325, height: 180, title: { x: 0, y: 0, width: 325, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 325, height: 155, fontSize: 10, color: '#334155' }, gap: 5 },
        certificates: { x: 235, y: 710, width: 325, height: 180, title: { x: 0, y: 0, width: 325, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 325, height: 155, fontSize: 10, color: '#334155' }, gap: 5 },
        references: { x: 235, y: 710, width: 325, height: 180, title: { x: 0, y: 0, width: 325, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 325, height: 155, fontSize: 10, color: '#334155' }, gap: 5 },
        awards: { x: 235, y: 710, width: 325, height: 180, title: { x: 0, y: 0, width: 325, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 325, height: 155, fontSize: 10, color: '#334155' }, gap: 5 },
        trainings: { x: 235, y: 710, width: 325, height: 180, title: { x: 0, y: 0, width: 325, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 325, height: 155, fontSize: 10, color: '#334155' }, gap: 5 },
        publications: { x: 235, y: 710, width: 325, height: 180, title: { x: 0, y: 0, width: 325, height: 20, fontSize: 12, fontWeight: 'bold', color: '#0C4A6E' }, items: { x: 0, y: 22, width: 325, height: 155, fontSize: 10, color: '#334155' }, gap: 5 },
    },
    regions: [
        { id: 'sidebar', name: 'Sidebar', x: 0, y: 0, width: 220, height: 1123, backgroundColor: '#0C4A6E', sections: ['photo', 'contact', 'computerSkills', 'technicalSkills'] },
        { id: 'main', name: 'Main Content', x: 220, y: 0, width: 350, height: 1123, sections: ['name', 'profession', 'careerObjective', 'experience', 'education'] },
        { id: 'right', name: 'Right Panel', x: 570, y: 0, width: 224, height: 1123, backgroundColor: '#F1F5F9', sections: ['languages', 'hobbies', 'signature', 'personalInfo', 'declaration'] },
    ],
};

// ============================================================
// Template 2: Light Blue Elegant
// ============================================================
const template2: TemplateConfig = {
    ...template1,
    id: 'template-2',
    name: 'Light Blue Elegant',
    description: 'An elegant CV with light blue accents and clean layout',
    colors: {
        primary: '#1E6091',
        secondary: '#2980B9',
        accent: '#3498DB',
        text: '#2C3E50',
        textLight: '#7F8C8D',
        background: '#FFFFFF',
        sidebarBg: '#D6EAF8',
        sidebarText: '#1E3A5F',
        headerBg: '#FFFFFF',
        headerText: '#2C3E50',
    },
    elements: {
        ...template1.elements,
        name: { x: 235, y: 30, width: 325, height: 36, fontSize: 24, fontWeight: 'bold', color: '#1E6091' },
        photo: { x: 55, y: 25, width: 110, height: 130, shape: 'rectangle', borderRadius: 8, borderColor: '#2980B9', borderWidth: 3 },
        contact: { ...template1.elements.contact, title: { ...template1.elements.contact.title, color: '#1E3A5F' }, items: { ...template1.elements.contact.items, color: '#2C3E50' } },
        computerSkills: { ...template1.elements.computerSkills, title: { ...template1.elements.computerSkills.title, color: '#1E3A5F' }, items: { ...template1.elements.computerSkills.items, color: '#2C3E50' } },
        technicalSkills: { ...template1.elements.technicalSkills, title: { ...template1.elements.technicalSkills.title, color: '#1E3A5F' }, items: { ...template1.elements.technicalSkills.items, color: '#2C3E50' } },
    },
    regions: [
        { id: 'sidebar', name: 'Sidebar', x: 0, y: 0, width: 220, height: 1123, backgroundColor: '#D6EAF8', sections: ['photo', 'contact', 'computerSkills', 'technicalSkills'] },
        { id: 'main', name: 'Main Content', x: 220, y: 0, width: 350, height: 1123, sections: ['name', 'profession', 'careerObjective', 'experience', 'education'] },
        { id: 'right', name: 'Right Panel', x: 570, y: 0, width: 224, height: 1123, backgroundColor: '#EBF5FB', sections: ['languages', 'hobbies', 'signature', 'personalInfo', 'declaration'] },
    ],
};

// ============================================================
// Template 3: Clean Two-Column
// ============================================================
const template3: TemplateConfig = {
    id: 'template-3',
    name: 'Clean Two-Column',
    description: 'A clean two-column layout with photo at top-right corner',
    thumbnail: '',
    pageSize: { width: 794, height: 1123 },
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    colors: {
        primary: '#0369A1',
        secondary: '#0284C7',
        accent: '#38BDF8',
        text: '#1E293B',
        textLight: '#64748B',
        background: '#FFFFFF',
        sidebarBg: '#FFFFFF',
        sidebarText: '#1E293B',
        headerBg: '#FFFFFF',
        headerText: '#1E293B',
    },
    fonts: { heading: 'Montserrat', body: 'Open Sans' },
    layout: { type: 'two-column', sidebarWidth: 397, sidebarPosition: 'left', headerHeight: 0 },
    elements: {
        name: { x: 25, y: 22, width: 300, height: 32, fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
        profession: { x: 25, y: 54, width: 300, height: 20, fontSize: 11, fontWeight: 'normal', color: '#64748B' },
        photo: { x: 330, y: 20, width: 90, height: 110, shape: 'rectangle', borderRadius: 4, borderColor: '#0369A1', borderWidth: 2 },
        contact: { x: 25, y: 68, width: 360, height: 45, title: { x: 0, y: 0, width: 360, height: 0, fontSize: 0, fontWeight: 'bold', color: 'transparent' }, items: { x: 0, y: 0, width: 360, height: 45, fontSize: 10, color: '#334155' }, gap: 4 },
        careerObjective: { x: 25, y: 105, width: 380, height: 85, title: { x: 0, y: 0, width: 380, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 380, height: 62, fontSize: 10, color: '#334155' }, gap: 5 },
        experience: { x: 25, y: 200, width: 380, height: 160, title: { x: 0, y: 0, width: 380, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 380, height: 138, fontSize: 10, color: '#334155' }, gap: 5 },
        education: { x: 25, y: 370, width: 380, height: 310, title: { x: 0, y: 0, width: 380, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 380, height: 288, fontSize: 10, color: '#334155' }, gap: 5 },
        computerSkills: { x: 420, y: 330, width: 350, height: 140, title: { x: 0, y: 0, width: 350, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 350, height: 118, fontSize: 10, color: '#334155' }, gap: 4 },
        technicalSkills: { x: 420, y: 480, width: 350, height: 170, title: { x: 0, y: 0, width: 350, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 350, height: 148, fontSize: 10, color: '#334155' }, gap: 4 },
        languages: { x: 25, y: 690, width: 380, height: 55, title: { x: 0, y: 0, width: 380, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 380, height: 32, fontSize: 10, color: '#334155' }, gap: 4 },
        hobbies: { x: 420, y: 830, width: 350, height: 55, title: { x: 0, y: 0, width: 350, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 350, height: 32, fontSize: 10, color: '#334155' }, gap: 4 },
        personalInfo: { x: 420, y: 18, width: 350, height: 290, title: { x: 0, y: 0, width: 350, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 350, height: 268, fontSize: 9, color: '#334155' }, gap: 3 },
        declaration: { x: 420, y: 660, width: 350, height: 75, title: { x: 0, y: 0, width: 350, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 350, height: 52, fontSize: 9, color: '#334155' }, gap: 3 },
        signature: { x: 25, y: 760, width: 380, height: 45, title: { x: 0, y: 0, width: 200, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 200, height: 22, fontSize: 11, color: '#334155' }, gap: 3 },
        projects: { x: 25, y: 810, width: 380, height: 180, title: { x: 0, y: 0, width: 380, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 380, height: 158, fontSize: 10, color: '#334155' }, gap: 5 },
        certificates: { x: 25, y: 810, width: 380, height: 180, title: { x: 0, y: 0, width: 380, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 380, height: 158, fontSize: 10, color: '#334155' }, gap: 5 },
        references: { x: 420, y: 750, width: 350, height: 180, title: { x: 0, y: 0, width: 350, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 350, height: 158, fontSize: 10, color: '#334155' }, gap: 5 },
        awards: { x: 25, y: 810, width: 380, height: 180, title: { x: 0, y: 0, width: 380, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 380, height: 158, fontSize: 10, color: '#334155' }, gap: 5 },
        trainings: { x: 25, y: 810, width: 380, height: 180, title: { x: 0, y: 0, width: 380, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 380, height: 158, fontSize: 10, color: '#334155' }, gap: 5 },
        publications: { x: 25, y: 810, width: 380, height: 180, title: { x: 0, y: 0, width: 380, height: 18, fontSize: 12, fontWeight: 'bold', color: '#0369A1' }, items: { x: 0, y: 20, width: 380, height: 158, fontSize: 10, color: '#334155' }, gap: 5 },
    },
    regions: [
        { id: 'left', name: 'Left Column', x: 0, y: 0, width: 415, height: 1123, backgroundColor: '#FFFFFF', sections: ['name', 'photo', 'contact', 'careerObjective', 'experience', 'education', 'languages'] },
        { id: 'right', name: 'Right Column', x: 415, y: 0, width: 379, height: 1123, backgroundColor: '#F8FAFC', sections: ['personalInfo', 'computerSkills', 'technicalSkills', 'declaration', 'hobbies', 'signature'] },
    ],
};

// ============================================================
// Template 4: Gray Professional
// ============================================================
const template4: TemplateConfig = {
    ...template1,
    id: 'template-4',
    name: 'Gray Professional',
    description: 'Professional layout with gray sidebar and clean modern look',
    colors: {
        primary: '#374151',
        secondary: '#4B5563',
        accent: '#6B7280',
        text: '#1F2937',
        textLight: '#6B7280',
        background: '#FFFFFF',
        sidebarBg: '#E5E7EB',
        sidebarText: '#1F2937',
        headerBg: '#F3F4F6',
        headerText: '#1F2937',
    },
    elements: {
        ...template1.elements,
        name: { x: 25, y: 30, width: 290, height: 36, fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
        profession: { x: 25, y: 68, width: 290, height: 20, fontSize: 12, fontWeight: 'normal', color: '#6B7280' },
        photo: { x: 345, y: 20, width: 110, height: 130, shape: 'rectangle', borderRadius: 4, borderColor: '#9CA3AF', borderWidth: 2 },
        contact: { ...template1.elements.contact, title: { ...template1.elements.contact.title, color: '#1F2937' }, items: { ...template1.elements.contact.items, color: '#374151' } },
        computerSkills: { ...template1.elements.computerSkills, title: { ...template1.elements.computerSkills.title, color: '#1F2937' }, items: { ...template1.elements.computerSkills.items, color: '#374151' } },
        technicalSkills: { ...template1.elements.technicalSkills, title: { ...template1.elements.technicalSkills.title, color: '#1F2937' }, items: { ...template1.elements.technicalSkills.items, color: '#374151' } },
    },
    regions: [
        { id: 'header', name: 'Header', x: 0, y: 0, width: 794, height: 165, backgroundColor: '#F3F4F6', sections: ['name', 'profession', 'photo'] },
        { id: 'sidebar', name: 'Sidebar', x: 0, y: 165, width: 220, height: 958, backgroundColor: '#E5E7EB', sections: ['contact', 'computerSkills', 'technicalSkills'] },
        { id: 'main', name: 'Main Content', x: 220, y: 165, width: 350, height: 958, sections: ['careerObjective', 'experience', 'education'] },
        { id: 'right', name: 'Right Panel', x: 570, y: 165, width: 224, height: 958, backgroundColor: '#F9FAFB', sections: ['languages', 'hobbies', 'signature', 'personalInfo', 'declaration'] },
    ],
};

// ============================================================
// Template 5: Dark Navy Header
// ============================================================
const template5: TemplateConfig = {
    ...template1,
    id: 'template-5',
    name: 'Dark Navy Header',
    description: 'Modern layout with dark navy header bar and clean body',
    colors: {
        primary: '#1E293B',
        secondary: '#334155',
        accent: '#0EA5E9',
        text: '#1E293B',
        textLight: '#64748B',
        background: '#FFFFFF',
        sidebarBg: '#F1F5F9',
        sidebarText: '#1E293B',
        headerBg: '#1E293B',
        headerText: '#FFFFFF',
    },
    elements: {
        ...template1.elements,
        name: { x: 235, y: 35, width: 280, height: 36, fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
        profession: { x: 235, y: 72, width: 280, height: 20, fontSize: 11, fontWeight: 'normal', color: '#94A3B8' },
        photo: { x: 55, y: 20, width: 110, height: 130, shape: 'rectangle', borderRadius: 6, borderColor: '#FFFFFF', borderWidth: 3 },
    },
    regions: [
        { id: 'header', name: 'Header', x: 0, y: 0, width: 794, height: 165, backgroundColor: '#1E293B', sections: ['name', 'profession', 'photo'] },
        { id: 'sidebar', name: 'Sidebar', x: 0, y: 165, width: 220, height: 958, backgroundColor: '#F1F5F9', sections: ['contact', 'computerSkills', 'technicalSkills'] },
        { id: 'main', name: 'Main Content', x: 220, y: 165, width: 350, height: 958, sections: ['careerObjective', 'experience', 'education'] },
        { id: 'right', name: 'Right Panel', x: 570, y: 165, width: 224, height: 958, backgroundColor: '#F8FAFC', sections: ['languages', 'hobbies', 'signature', 'personalInfo', 'declaration'] },
    ],
};

// ============================================================
// Template 6: Circle Photo Modern
// ============================================================
const template6: TemplateConfig = {
    ...template1,
    id: 'template-6',
    name: 'Circle Photo Modern',
    description: 'Modern layout with circular photo and dark sidebar accent',
    colors: {
        primary: '#374151',
        secondary: '#4B5563',
        accent: '#10B981',
        text: '#1F2937',
        textLight: '#6B7280',
        background: '#FFFFFF',
        sidebarBg: '#374151',
        sidebarText: '#FFFFFF',
        headerBg: '#FFFFFF',
        headerText: '#1F2937',
    },
    elements: {
        ...template1.elements,
        photo: { x: 55, y: 25, width: 110, height: 110, shape: 'circle', borderRadius: 999, borderColor: '#10B981', borderWidth: 4 },
        name: { x: 235, y: 30, width: 325, height: 36, fontSize: 24, fontWeight: 'bold', color: '#374151' },
    },
    regions: [
        { id: 'sidebar', name: 'Sidebar', x: 0, y: 0, width: 220, height: 1123, backgroundColor: '#374151', sections: ['photo', 'contact', 'computerSkills', 'technicalSkills'] },
        { id: 'main', name: 'Main Content', x: 220, y: 0, width: 350, height: 1123, sections: ['name', 'profession', 'careerObjective', 'experience', 'education'] },
        { id: 'right', name: 'Right Panel', x: 570, y: 0, width: 224, height: 1123, backgroundColor: '#F3F4F6', sections: ['languages', 'hobbies', 'signature', 'personalInfo', 'declaration'] },
    ],
};

// ============================================================
// Base Designs (11 unique visual styles)
// These are the SOURCE templates - variants are auto-generated below
// ============================================================
export const baseDesigns: TemplateConfig[] = [
    // 1. Creative Forest (default)
    {
        ...template1,
        id: 'base-1',
        name: 'Creative Forest',
        baseDesignId: 'base-1',
        colors: {
            primary: '#064E3B',
            secondary: '#065F46',
            accent: '#10B981',
            text: '#1F2937',
            textLight: '#4B5563',
            background: '#FFFFFF',
            sidebarBg: '#ECFDF5',
            sidebarText: '#064E3B',
            headerBg: '#FFFFFF',
            headerText: '#064E3B',
        },
        elements: {
            ...template1.elements,
            name: { x: 235, y: 30, width: 325, height: 36, fontSize: 24, fontWeight: 'bold', color: '#064E3B' },
            photo: { x: 55, y: 25, width: 110, height: 130, shape: 'circle', borderRadius: 999, borderColor: '#10B981', borderWidth: 3 },
            contact: { ...template1.elements.contact, title: { ...template1.elements.contact.title, color: '#064E3B' }, items: { ...template1.elements.contact.items, color: '#064E3B' } },
            computerSkills: { ...template1.elements.computerSkills, title: { ...template1.elements.computerSkills.title, color: '#064E3B' }, items: { ...template1.elements.computerSkills.items, color: '#064E3B' } },
            technicalSkills: { ...template1.elements.technicalSkills, title: { ...template1.elements.technicalSkills.title, color: '#064E3B' }, items: { ...template1.elements.technicalSkills.items, color: '#064E3B' } },
        },
        regions: [
            { id: 'sidebar', name: 'Sidebar', x: 0, y: 0, width: 220, height: 1123, backgroundColor: '#ECFDF5', sections: ['photo', 'contact', 'technicalSkills', 'computerSkills'] },
            { id: 'main', name: 'Main Content', x: 220, y: 0, width: 350, height: 1123, sections: ['name', 'profession', 'careerObjective', 'education', 'experience'] },
            { id: 'right', name: 'Right Panel', x: 570, y: 0, width: 224, height: 1123, backgroundColor: '#FFFFFF', sections: ['projects', 'trainings', 'volunteering', 'languages', 'hobbies', 'signature', 'personalInfo', 'declaration'] },
        ],
    },
    // 2. Right Photo
    {
        ...template1,
        id: 'base-2',
        name: 'Right Photo',
        baseDesignId: 'base-2',
        layoutType: 'top-header-alt' as const,
        colors: {
            primary: '#3F3F5A',
            secondary: '#4B5563',
            accent: '#6B7280',
            text: '#1F2937',
            textLight: '#4B5563',
            background: '#FFFFFF',
            sidebarBg: '#E5E7EB',
            sidebarText: '#1F2937',
            headerBg: '#E5E7EB',
            headerText: '#374151',
        },
        elements: {
            ...template1.elements,
            name: { x: 40, y: 30, width: 325, height: 36, fontSize: 32, fontWeight: 'bold', color: '#374151', textAlign: 'left' as const },
            photo: { x: 500, y: 20, width: 130, height: 130, shape: 'rounded' as const, borderRadius: 20, borderColor: '#3F3F5A', borderWidth: 4 },
            contact: { ...template1.elements.contact, title: { ...template1.elements.contact.title, color: '#111827' }, items: { ...template1.elements.contact.items, color: '#111827' } },
            computerSkills: { ...template1.elements.computerSkills, title: { ...template1.elements.computerSkills.title, color: '#111827' }, items: { ...template1.elements.computerSkills.items, color: '#111827' } },
            technicalSkills: { ...template1.elements.technicalSkills, title: { ...template1.elements.technicalSkills.title, color: '#111827' }, items: { ...template1.elements.technicalSkills.items, color: '#111827' } },
        },
        regions: [
            { id: 'sidebar', name: 'Sidebar', x: 0, y: 0, width: 250, height: 1123, backgroundColor: '#E5E7EB', sections: ['contact', 'computerSkills', 'technicalSkills'] },
            { id: 'main', name: 'Main Content', x: 250, y: 0, width: 544, height: 1123, sections: ['careerObjective', 'experience', 'education'] },
            { id: 'right', name: 'Right Panel', x: 570, y: 0, width: 224, height: 1123, backgroundColor: '#FFFFFF', sections: ['projects', 'trainings', 'volunteering', 'languages', 'hobbies', 'signature', 'personalInfo', 'declaration'] },
        ],
    },
    // 3. Top Header Executive
    {
        ...template1,
        id: 'base-3',
        name: 'Top Header Executive',
        baseDesignId: 'base-3',
        layoutType: 'top-header' as const,
        colors: {
            primary: '#111827',
            secondary: '#374151',
            accent: '#6B7280',
            text: '#1F2937',
            textLight: '#4B5563',
            background: '#FFFFFF',
            sidebarBg: '#D9E0E8',
            sidebarText: '#111827',
            headerBg: '#D9E0E8',
            headerText: '#111827',
        },
        elements: {
            ...template1.elements,
            name: { x: 200, y: 30, width: 325, height: 36, fontSize: 32, fontWeight: 'bold', color: '#374151', textAlign: 'left' as const },
            photo: { x: 40, y: 20, width: 130, height: 130, shape: 'circle' as const, borderRadius: 999, borderColor: '#FFFFFF', borderWidth: 4 },
            contact: { ...template1.elements.contact, title: { ...template1.elements.contact.title, color: '#111827' }, items: { ...template1.elements.contact.items, color: '#111827' } },
            computerSkills: { ...template1.elements.computerSkills, title: { ...template1.elements.computerSkills.title, color: '#111827' }, items: { ...template1.elements.computerSkills.items, color: '#111827' } },
            technicalSkills: { ...template1.elements.technicalSkills, title: { ...template1.elements.technicalSkills.title, color: '#111827' }, items: { ...template1.elements.technicalSkills.items, color: '#111827' } },
        },
        regions: [
            { id: 'sidebar', name: 'Sidebar', x: 0, y: 0, width: 250, height: 1123, backgroundColor: '#D9E0E8', sections: ['contact', 'computerSkills', 'technicalSkills'] },
            { id: 'main', name: 'Main Content', x: 250, y: 0, width: 544, height: 1123, sections: ['careerObjective', 'experience', 'education'] },
            { id: 'right', name: 'Right Panel', x: 570, y: 0, width: 224, height: 1123, backgroundColor: '#FFFFFF', sections: ['projects', 'trainings', 'volunteering', 'languages', 'hobbies', 'signature', 'personalInfo', 'declaration'] },
        ],
    },
    // 4. Professional Dark Blue
    {
        ...template1,
        id: 'base-4',
        name: 'Professional Dark Blue',
        baseDesignId: 'base-4',
    },
    // 5. Light Blue Elegant
    {
        ...template2,
        id: 'base-5',
        name: 'Light Blue Elegant',
        baseDesignId: 'base-5',
    },
    // 6. Clean Two-Column
    {
        ...template3,
        id: 'base-6',
        name: 'Clean Two-Column',
        baseDesignId: 'base-6',
    },
    // 7. Gray Professional
    {
        ...template4,
        id: 'base-7',
        name: 'Gray Professional',
        baseDesignId: 'base-7',
    },
    // 8. Dark Navy Header
    {
        ...template5,
        id: 'base-8',
        name: 'Dark Navy Header',
        baseDesignId: 'base-8',
    },
    // 9. Circle Photo Modern
    {
        ...template6,
        id: 'base-9',
        name: 'Circle Photo Modern',
        baseDesignId: 'base-9',
    },
    // 10. Modern Slate
    {
        ...template1,
        id: 'base-10',
        name: 'Modern Slate',
        baseDesignId: 'base-10',
        colors: {
            primary: '#334155',
            secondary: '#475569',
            accent: '#3B82F6',
            text: '#1F2937',
            textLight: '#4B5563',
            background: '#FFFFFF',
            sidebarBg: '#F1F5F9',
            sidebarText: '#1E293B',
            headerBg: '#FFFFFF',
            headerText: '#334155',
        },
        elements: {
            ...template1.elements,
            name: { x: 235, y: 30, width: 325, height: 36, fontSize: 24, fontWeight: 'bold', color: '#334155' },
            photo: { x: 55, y: 25, width: 110, height: 130, shape: 'square', borderRadius: 8, borderColor: '#3B82F6', borderWidth: 2 },
            contact: { ...template1.elements.contact, title: { ...template1.elements.contact.title, color: '#1E293B' }, items: { ...template1.elements.contact.items, color: '#1E293B' } },
            computerSkills: { ...template1.elements.computerSkills, title: { ...template1.elements.computerSkills.title, color: '#1E293B' }, items: { ...template1.elements.computerSkills.items, color: '#1E293B' } },
            technicalSkills: { ...template1.elements.technicalSkills, title: { ...template1.elements.technicalSkills.title, color: '#1E293B' }, items: { ...template1.elements.technicalSkills.items, color: '#1E293B' } },
        },
        regions: [
            { id: 'sidebar', name: 'Sidebar', x: 0, y: 0, width: 220, height: 1123, backgroundColor: '#F1F5F9', sections: ['photo', 'contact', 'computerSkills', 'technicalSkills'] },
            { id: 'main', name: 'Main Content', x: 220, y: 0, width: 350, height: 1123, sections: ['name', 'profession', 'careerObjective', 'education', 'projects'] },
            { id: 'right', name: 'Right Panel', x: 570, y: 0, width: 224, height: 1123, backgroundColor: '#F8FAFC', sections: ['experience', 'trainings', 'volunteering', 'languages', 'hobbies', 'signature', 'personalInfo', 'declaration'] },
        ],
    },
    // 11. Overlap Header
    {
        ...template1,
        id: 'base-11',
        name: 'Overlap Header',
        baseDesignId: 'base-11',
        layoutType: 'overlap' as const,
        colors: {
            primary: '#2C3545',
            secondary: '#4B5563',
            accent: '#6B7280',
            text: '#1F2937',
            textLight: '#4B5563',
            background: '#FFFFFF',
            sidebarBg: '#D9E0E8',
            sidebarText: '#1F2937',
            headerBg: '#2C3545',
            headerText: '#FFFFFF',
        },
        elements: {
            ...template1.elements,
            name: { x: 250, y: 30, width: 325, height: 36, fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' as const },
            photo: { x: 60, y: 20, width: 150, height: 150, shape: 'circle' as const, borderRadius: 999, borderColor: '#D9E0E8', borderWidth: 6 },
            contact: { ...template1.elements.contact, title: { ...template1.elements.contact.title, color: '#111827' }, items: { ...template1.elements.contact.items, color: '#111827' } },
            computerSkills: { ...template1.elements.computerSkills, title: { ...template1.elements.computerSkills.title, color: '#111827' }, items: { ...template1.elements.computerSkills.items, color: '#111827' } },
            technicalSkills: { ...template1.elements.technicalSkills, title: { ...template1.elements.technicalSkills.title, color: '#111827' }, items: { ...template1.elements.technicalSkills.items, color: '#111827' } },
        },
        regions: [
            { id: 'sidebar', name: 'Sidebar', x: 0, y: 0, width: 250, height: 1123, backgroundColor: '#D9E0E8', sections: ['contact', 'computerSkills', 'technicalSkills'] },
            { id: 'main', name: 'Main Content', x: 250, y: 0, width: 544, height: 1123, sections: ['careerObjective', 'experience', 'education'] },
            { id: 'right', name: 'Right Panel', x: 570, y: 0, width: 224, height: 1123, backgroundColor: '#FFFFFF', sections: ['projects', 'trainings', 'volunteering', 'languages', 'hobbies', 'signature', 'personalInfo', 'declaration'] },
        ],
    },
    // 12. Modern Blue (1-Page)
    {
        ...template1,
        id: 'base-12',
        name: 'Modern Blue (1-Page)',
        description: 'A 1-page modern layout with light blue sidebar, dark blue text, and well-organized sections.',
        baseDesignId: 'base-12',
        layoutType: 'modern-blue',
        educationPage: 1,
        colors: {
            primary: '#1E3A8A', // Dark blue text
            secondary: '#2563EB',
            accent: '#3B82F6', // Blue lines
            text: '#1F2937',
            textLight: '#4B5563',
            background: '#FFFFFF', // Right column bg
            sidebarBg: '#BFDBFE', // Light blue sidebar bg
            sidebarText: '#1E3A8A', // Sidebar text is dark blue
            headerBg: '#FFFFFF',
            headerText: '#1E3A8A',
        },
        elements: {
            ...template1.elements,
            name: { x: 30, y: 30, width: 300, height: 36, fontSize: 32, fontWeight: 'bold', color: '#1E3A8A', textAlign: 'center' },
            photo: { x: 80, y: 30, width: 140, height: 180, shape: 'rounded', borderRadius: 8, borderColor: '#FFFFFF', borderWidth: 4 },
        },
        regions: [
            { id: 'sidebar', name: 'Sidebar', x: 0, y: 0, width: 250, height: 1123, backgroundColor: '#BFDBFE', sections: ['name', 'photo', 'contact', 'languages', 'computerSkills', 'signature'] },
            { id: 'main', name: 'Main Content', x: 250, y: 0, width: 544, height: 1123, backgroundColor: '#FFFFFF', sections: ['careerObjective', 'technicalSkills', 'personalInfo', 'education', 'experience'] },
        ],
    },
];

// ============================================================
// Variant Generator: Creates Fresher, Split Education, Experienced
// ============================================================
type VariantConfig = {
    variant: 'Fresher' | 'Split Education' | 'Experienced';
    educationPage: 1 | 'split' | 2;
    idSuffix: string;
};

const VARIANTS: VariantConfig[] = [
    { variant: 'Fresher',           educationPage: 1,       idSuffix: '-fresher'    },
    { variant: 'Split Education',   educationPage: 'split', idSuffix: '-split'      },
    { variant: 'Experienced',       educationPage: 2,       idSuffix: '-experienced'},
];

export const defaultTemplates: TemplateConfig[] = baseDesigns.flatMap((base) =>
    VARIANTS.map((v) => ({
        ...base,
        id: `${base.id}${v.idSuffix}`,
        name: `${base.name} · ${v.variant}`,
        description: (() => {
            if (v.variant === 'Fresher')         return `${base.name} — Fresher version. Education on Page 1.`;
            if (v.variant === 'Split Education') return `${base.name} — Hybrid version. 1st Education on Page 1, rest on Page 2.`;
            return `${base.name} — Experienced version. Education on Page 2.`;
        })(),
        baseDesignId: base.baseDesignId,
        variant: v.variant,
        educationPage: v.educationPage,
    }))
);

export function getTemplateById(id: string): TemplateConfig | undefined {
    return defaultTemplates.find((t) => t.id === id);
}
