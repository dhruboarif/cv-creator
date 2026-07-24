// ============================================================
// CV Data Types - All data structures for CV content
// ============================================================

export interface PersonalInfo {
    name: string;
    profession: string;
    phone: string;
    email: string;
    address: string;
    dob: string;
    nationality: string;
    fatherName: string;
    motherName: string;
    religion: string;
    gender: string;
    maritalStatus: string;
    bloodGroup: string;
    height: string;
    nid: string;
    permanentAddress: string;
    website: string;
    linkedin: string;
    github: string;
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    board: string;
    university: string;
    group: string;
    session: string;
    passingYear: string;
    result: string;
}

export interface Experience {
    id: string;
    title: string;
    company: string;
    duration: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
}

export interface Skill {
    id: string;
    name: string;
    level: number; // 0-100
}

export interface Language {
    id: string;
    name: string;
    proficiency: string;
    reading: string;
    writing: string;
    speaking: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    technologies: string;
    link: string;
}

export interface Certificate {
    id: string;
    name: string;
    issuer: string;
    date: string;
}

export interface Reference {
    id: string;
    name: string;
    designation: string;
    organization: string;
    phone: string;
    email: string;
}

export interface Award {
    id: string;
    name: string;
    issuer: string;
    date: string;
    description: string;
}

export interface Training {
    id: string;
    name: string;
    organization: string;
    duration: string;
    date: string;
}

export interface Publication {
    id: string;
    title: string;
    journal: string;
    date: string;
    link: string;
}

export interface CustomSection {
    id: string;
    title: string;
    items: CustomSectionItem[];
}

export interface CustomSectionItem {
    id: string;
    content: string;
}

export interface Volunteering {
    id: string;
    role: string;
    organization: string;
    duration: string;
    description: string;
}

export interface CVData {
    personal: PersonalInfo;
    careerObjective: string;
    education: Education[];
    experience: Experience[];
    computerSkills: Skill[];
    technicalSkills: Skill[];
    languages: Language[];
    projects: Project[];
    certificates: Certificate[];
    references: Reference[];
    awards: Award[];
    trainings: Training[];
    volunteering: Volunteering[];
    publications: Publication[];
    hobbies: string[];
    declaration: string;
    sectionVisibility?: Record<string, boolean>;
    photo: string | null; // base64
    photoZoom?: number;
    photoRotation?: number;
    photoPosition?: { x: number; y: number };
}

export interface TemplateElementConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
    padding?: number;
    visible?: boolean;
    maxLines?: number;
    iconName?: string;
    iconColor?: string;
    iconSize?: number;
}

export interface TemplateSectionConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    title: TemplateElementConfig;
    items: TemplateElementConfig;
    gap: number;
    backgroundColor?: string;
    borderColor?: string;
}

export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    layoutType?: 'standard' | 'top-header' | 'top-header-alt' | 'overlap';
    educationPage?: 1 | 2 | 'split';
    thumbnail: string;
    pageSize: { width: number; height: number };
    margins: { top: number; right: number; bottom: number; left: number };
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        textLight: string;
        background: string;
        sidebarBg: string;
        sidebarText: string;
        headerBg: string;
        headerText: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    layout: {
        type: 'two-column' | 'single-column' | 'three-column';
        sidebarWidth: number;
        sidebarPosition: 'left' | 'right';
        headerHeight: number;
    };
    elements: {
        name: TemplateElementConfig;
        profession: TemplateElementConfig;
        photo: TemplateElementConfig & { shape: 'circle' | 'rectangle' | 'rounded' };
        contact: TemplateSectionConfig;
        careerObjective: TemplateSectionConfig;
        experience: TemplateSectionConfig;
        education: TemplateSectionConfig;
        computerSkills: TemplateSectionConfig;
        technicalSkills: TemplateSectionConfig;
        languages: TemplateSectionConfig;
        hobbies: TemplateSectionConfig;
        personalInfo: TemplateSectionConfig;
        declaration: TemplateSectionConfig;
        signature: TemplateSectionConfig;
        projects: TemplateSectionConfig;
        certificates: TemplateSectionConfig;
        references: TemplateSectionConfig;
        awards: TemplateSectionConfig;
        trainings: TemplateSectionConfig;
        publications: TemplateSectionConfig;
    };
    regions: TemplateRegion[];
}

export interface TemplateRegion {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    backgroundColor?: string;
    sections: string[];
}

export interface HistoryEntry {
    timestamp: number;
    data: CVData;
    description: string;
}

export interface AppState {
    currentTemplateId: string;
    cvData: CVData;
    templates: TemplateConfig[];
    history: HistoryEntry[];
    historyIndex: number;
    isDirty: boolean;
    activeTab: 'form' | 'preview' | 'editor' | 'templates';
    activeFormSection: string;
    zoom: number;
}
