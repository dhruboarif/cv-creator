import React, { useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from 'docx';
import { FileText, Image as ImageIcon, Printer, FileDown, ArrowRight } from 'lucide-react';
import CVRenderer from '../../renderer/CVRenderer';

const ExportPanel: React.FC = () => {
    const { cvData, templates, currentTemplateId, pagesCount } = useCVStore();
    const activeTemplate = templates.find((t) => t.id === currentTemplateId) || templates[0];
    const [downloading, setDownloading] = useState(false);

    const handleExportPDF = async () => {
        setDownloading(true);
        try {
            // Wait for all web fonts to load to prevent html2canvas text scrambling/overlapping
            await document.fonts.ready;

            const a4Width = activeTemplate.pageSize.width; // 794
            const a4Height = activeTemplate.pageSize.height; // 1123

            // Generate PDF at the original intended unscaled pixel size
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
                scale: 2, // High-res internal rendering scale
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
            console.error('PDF Generation failed:', e);
            alert('Could not export PDF. Please verify parameters.');
        } finally {
            setDownloading(false);
        }
    };

    const handleExportDocx = () => {
        // Generate editable DOCX
        const personal = cvData.personal;

        const children = [
            new Paragraph({
                text: personal.name || 'YOUR NAME',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                text: personal.profession || 'Profession',
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                text: `${personal.email} | ${personal.phone} | ${personal.address}`,
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }), // spacer
        ];

        if (cvData.careerObjective) {
            children.push(
                new Paragraph({ text: 'CAREER OBJECTIVE', heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: cvData.careerObjective })
            );
        }

        if (cvData.experience.length > 0) {
            children.push(new Paragraph({ text: 'WORK EXPERIENCE', heading: HeadingLevel.HEADING_2 }));
            cvData.experience.forEach((exp) => {
                children.push(
                    new Paragraph({
                        text: `${exp.title} - ${exp.company} (${exp.duration})`,
                        heading: HeadingLevel.HEADING_3,
                    })
                );
                exp.responsibilities.forEach((resp) => {
                    children.push(new Paragraph({ text: `• ${resp}` }));
                });
            });
        }

        if (cvData.education.length > 0) {
            children.push(new Paragraph({ text: 'EDUCATION', heading: HeadingLevel.HEADING_2 }));
            cvData.education.forEach((edu) => {
                children.push(
                    new Paragraph({
                        text: `${edu.degree} (${edu.passingYear})`,
                        heading: HeadingLevel.HEADING_3,
                    }),
                    new Paragraph({ text: `${edu.institution} | GPA: ${edu.result}` })
                );
            });
        }

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children,
                },
            ],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, `${personal.name.replace(/\s+/g, '_') || 'CV'}.docx`);
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportImage = async (format: 'png' | 'jpeg') => {
        const element = document.getElementById('cv-render-target');
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2 });
        const dataUrl = canvas.toDataURL(`image/${format}`, 0.95);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${cvData.personal.name.replace(/\s+/g, '_') || 'CV'}.${format}`;
        link.click();
    };

    return (
        <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-text">Export & Download Options</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: action cards */}
                <div className="flex flex-col gap-4">
                    <div
                        className="glass-card p-5 cursor-pointer hover:border-accent/40 hover:bg-slate-900/60 transition-all flex items-center gap-4"
                        onClick={handleExportPDF}
                    >
                        <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
                            <FileDown size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-100 text-sm">Download Pixel-Perfect PDF</h3>
                            <p className="text-xs text-slate-400 mt-1">Best format for jobs apps. Matches layout config completely.</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-500" />
                    </div>

                    <div
                        className="glass-card p-5 cursor-pointer hover:border-accent/40 hover:bg-slate-900/60 transition-all flex items-center gap-4"
                        onClick={handleExportDocx}
                    >
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                            <FileText size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-100 text-sm">Download Editable DOCX</h3>
                            <p className="text-xs text-slate-400 mt-1">Generates Microsoft Word version. Fully customizable blocks.</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-500" />
                    </div>

                    <div
                        className="glass-card p-5 cursor-pointer hover:border-accent/40 hover:bg-slate-900/60 transition-all flex items-center gap-4"
                        onClick={() => handleExportImage('png')}
                    >
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                            <ImageIcon size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-100 text-sm">Save as PNG Image</h3>
                            <p className="text-xs text-slate-400 mt-1">Export high resolution image ideal for sharing on media.</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-500" />
                    </div>

                    <div
                        className="glass-card p-5 cursor-pointer hover:border-accent/40 hover:bg-slate-900/60 transition-all flex items-center gap-4"
                        onClick={handlePrint}
                    >
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                            <Printer size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-100 text-sm">Direct Print / Save</h3>
                            <p className="text-xs text-slate-400 mt-1">Opens standard OS system print dialog options directly.</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-500" />
                    </div>
                </div>

                {/* Right: Live mini review */}
                <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[300px]">
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Export Alignment Target</h4>
                    <div className="relative overflow-hidden w-64 h-96 border border-white/10 rounded-lg bg-slate-900 flex items-center justify-center p-2">
                        <div style={{ transform: 'scale(0.3)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                            <CVRenderer data={cvData} template={activeTemplate} id="mini-preview-target" />
                        </div>
                    </div>
                </div>
            </div>

            {downloading && (
                <div className="modal-overlay">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
                        <p className="text-slate-200">Executing High-Resolution Rendering Engine...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportPanel;
