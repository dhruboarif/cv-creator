import React, { useEffect, useRef, useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import * as fabric from 'fabric';
import { Save, Move, Type, Palette, Grid, Sliders } from 'lucide-react';

const TemplateVisualEditor: React.FC = () => {
    const { templates, currentTemplateId, updateTemplate } = useCVStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    const activeTemplate = templates.find((t) => t.id === currentTemplateId) || templates[0];
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [gridSize, setGridSize] = useState(10);
    const [activeTab, setActiveTab] = useState<'position' | 'styling' | 'structure'>('position');

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize Fabric Canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: activeTemplate.pageSize.width,
            height: activeTemplate.pageSize.height,
            backgroundColor: activeTemplate.colors.background,
        });
        fabricCanvasRef.current = canvas;

        // Draw grid if active
        if (snapToGrid) {
            drawGrid(canvas);
        }

        // Draw background regions
        activeTemplate.regions.forEach((region) => {
            const rect = new fabric.Rect({
                left: region.x,
                top: region.y,
                width: region.width,
                height: region.height,
                fill: region.backgroundColor || 'transparent',
                selectable: false,
                evented: false,
                name: `region-${region.id}`,
            });
            canvas.add(rect);
        });

        // Populate editable text blocks
        Object.entries(activeTemplate.elements).forEach(([key, element]) => {
            // Create Fabric target block
            const elementConfig = element as any;
            const text = new fabric.Text(key.toUpperCase(), {
                left: elementConfig.x,
                top: elementConfig.y,
                fontSize: elementConfig.fontSize || 12,
                fontFamily: activeTemplate.fonts.heading,
                fontWeight: elementConfig.fontWeight || 'bold',
                fill: elementConfig.color || activeTemplate.colors.primary,
                selectable: true,
                hasControls: true,
                hasBorders: true,
                borderColor: '#0EA5E9',
                cornerColor: '#0EA5E9',
                cornerSize: 8,
                lockRotation: true,
                name: key,
            });

            // Align constraints
            text.on('moving', (options) => {
                if (snapToGrid) {
                    const target = options.transform?.target;
                    if (target) {
                        target.set({
                            left: Math.round((target.left || 0) / gridSize) * gridSize,
                            top: Math.round((target.top || 0) / gridSize) * gridSize,
                        });
                    }
                }
            });

            text.on('scaling', (options) => {
                const target = options.transform?.target;
                if (target) {
                    // Adjust fontSize on scale
                    const newSize = Math.round((text.fontSize || 12) * (target.scaleX || 1));
                    target.set({
                        fontSize: newSize,
                        scaleX: 1,
                        scaleY: 1,
                    });
                }
            });

            canvas.add(text);
        });

        // Event listeners
        canvas.on('selection:created', (e) => {
            const target = e.selected?.[0];
            if (target && (target as any).name) {
                setSelectedElement((target as any).name);
            }
        });

        canvas.on('selection:updated', (e) => {
            const target = e.selected?.[0];
            if (target && (target as any).name) {
                setSelectedElement((target as any).name);
            }
        });

        canvas.on('selection:cleared', () => {
            setSelectedElement(null);
        });

        return () => {
            canvas.dispose();
            fabricCanvasRef.current = null;
        };
    }, [currentTemplateId, snapToGrid, gridSize]);

    const drawGrid = (canvas: fabric.Canvas) => {
        const width = activeTemplate.pageSize.width;
        const height = activeTemplate.pageSize.height;

        for (let i = 0; i < width / gridSize; i++) {
            canvas.add(
                new fabric.Line([i * gridSize, 0, i * gridSize, height], {
                    stroke: 'rgba(148, 163, 184, 0.1)',
                    selectable: false,
                    evented: false,
                })
            );
        }
        for (let i = 0; i < height / gridSize; i++) {
            canvas.add(
                new fabric.Line([0, i * gridSize, width, i * gridSize], {
                    stroke: 'rgba(148, 163, 184, 0.1)',
                    selectable: false,
                    evented: false,
                })
            );
        }
    };

    const handleSaveLayout = () => {
        if (!fabricCanvasRef.current) return;
        const canvas = fabricCanvasRef.current;
        const updatedElements = { ...activeTemplate.elements };

        canvas.getObjects().forEach((obj: any) => {
            if (obj.name && updatedElements[obj.name as keyof typeof activeTemplate.elements]) {
                const textObj = obj as fabric.Text;
                const currentField = (updatedElements as any)[obj.name];

                // Element positioning updates
                (updatedElements as any)[obj.name] = {
                    ...currentField,
                    x: Math.round(textObj.left || 0),
                    y: Math.round(textObj.top || 0),
                    fontSize: textObj.fontSize,
                };
            }
        });

        updateTemplate(activeTemplate.id, {
            elements: updatedElements as any,
        });

        alert('Template layout coordinates auto-saved & updated!');
    };

    // Quick style updater helper
    const handleUpdateActiveStyle = (key: string, value: any) => {
        if (!selectedElement) return;
        updateTemplate(activeTemplate.id, {
            elements: {
                ...activeTemplate.elements,
                [selectedElement]: {
                    ...(activeTemplate.elements as any)[selectedElement],
                    [key]: value,
                },
            },
        });
    };

    const handleUpdateColors = (colorKey: keyof typeof activeTemplate.colors, val: string) => {
        updateTemplate(activeTemplate.id, {
            colors: {
                ...activeTemplate.colors,
                [colorKey]: val,
            },
        });
    };

    return (
        <div className="flex h-full overflow-hidden">
            {/* Visual Canvas workspace */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-slate-950/40 p-10 flex items-center justify-center"
            >
                <div className="relative border border-slate-700/50 shadow-2xl p-1 bg-white rounded-lg">
                    <canvas ref={canvasRef} />
                </div>
            </div>

            {/* Editor controls Sidebar */}
            <div className="w-80 border-l border-white/5 flex flex-col justify-between overflow-y-auto">
                <div className="p-5 flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <span className="text-md font-bold text-slate-200">Template Customizer</span>
                        <button className="btn-primary py-1 px-3" onClick={handleSaveLayout}>
                            <Save size={13} /> Apply Coordinates
                        </button>
                    </div>

                    {/* Grid setup */}
                    <div className="glass-card p-3 mb-5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                                <Grid size={12} /> Align & Snap System
                            </span>
                            <input
                                type="checkbox"
                                checked={snapToGrid}
                                onChange={(e) => setSnapToGrid(e.target.checked)}
                                className="w-4 h-4 text-accent accent-accent rounded"
                            />
                        </div>
                        {snapToGrid && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500">Grid Size</span>
                                <input
                                    type="number"
                                    min="5"
                                    max="50"
                                    value={gridSize}
                                    onChange={(e) => setGridSize(Math.max(5, parseInt(e.target.value) || 10))}
                                    className="input-field py-0.5 text-xs text-center w-16"
                                />
                            </div>
                        )}
                    </div>

                    {/* Navigation Controls Tabs */}
                    <div className="flex border-b border-white/10 mb-4 px-1 gap-2">
                        {[
                            { id: 'position', label: 'Layout & Colors', icon: Palette },
                            { id: 'styling', label: 'Typography', icon: Type },
                            { id: 'structure', label: 'Element Style', icon: Sliders },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                className={`text-xs py-2 px-1 flex-1 text-center font-medium ${activeTab === tab.id ? 'text-accent border-b-2 border-accent' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                onClick={() => setActiveTab(tab.id as any)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* TAB 1: Positions and template theme color setup */}
                    {activeTab === 'position' && (
                        <div className="flex flex-col gap-3 animate-fade-in">
                            <span className="text-xs text-slate-400 font-semibold uppercase">Global Color Palette</span>
                            {Object.keys(activeTemplate.colors).map((ckey) => (
                                <div key={ckey} className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-white/5">
                                    <span className="text-xs text-slate-300 font-medium capitalize">{ckey.replace(/([A-Z])/g, ' $1')}</span>
                                    <div className="flex gap-1 items-center">
                                        <input
                                            type="color"
                                            value={(activeTemplate.colors as any)[ckey]}
                                            onChange={(e) => handleUpdateColors(ckey as any, e.target.value)}
                                            className="w-6 h-6 border-0 p-0 rounded-full cursor-pointer bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={(activeTemplate.colors as any)[ckey]}
                                            onChange={(e) => handleUpdateColors(ckey as any, e.target.value)}
                                            className="input-field text-xs py-0.5 px-1.5 w-20 text-center"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB 2: Typography & Spacing */}
                    {activeTab === 'styling' && (
                        <div className="flex flex-col gap-3 animate-fade-in">
                            <span className="text-xs text-slate-400 font-semibold uppercase">Select Font Family</span>
                            <div className="flex flex-col gap-2">
                                <div>
                                    <label className="input-label">Heading Font</label>
                                    <select
                                        className="input-field"
                                        value={activeTemplate.fonts.heading}
                                        onChange={(e) => updateTemplate(activeTemplate.id, { fonts: { ...activeTemplate.fonts, heading: e.target.value } })}
                                    >
                                        <option value="Montserrat">Montserrat</option>
                                        <option value="Inter">Inter</option>
                                        <option value="Open Sans">Open Sans</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Body Font</label>
                                    <select
                                        className="input-field"
                                        value={activeTemplate.fonts.body}
                                        onChange={(e) => updateTemplate(activeTemplate.id, { fonts: { ...activeTemplate.fonts, body: e.target.value } })}
                                    >
                                        <option value="Open Sans">Open Sans</option>
                                        <option value="Inter">Inter</option>
                                        <option value="Montserrat">Montserrat</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Selected elements controller */}
                    {activeTab === 'structure' && (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            {selectedElement ? (
                                <div>
                                    <h4 className="text-sm font-semibold mb-3 text-accent capitalize">{selectedElement} Settings</h4>

                                    {/* Font Weight */}
                                    <div className="mb-3">
                                        <label className="input-label">Weight</label>
                                        <select
                                            className="input-field py-1"
                                            value={(activeTemplate.elements as any)[selectedElement]?.fontWeight || 'normal'}
                                            onChange={(e) => handleUpdateActiveStyle('fontWeight', e.target.value)}
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="bold">Bold</option>
                                        </select>
                                    </div>

                                    {/* Font Color */}
                                    <div className="mb-3">
                                        <label className="input-label">Custom Typography Color</label>
                                        <input
                                            type="color"
                                            value={(activeTemplate.elements as any)[selectedElement]?.color || '#000000'}
                                            onChange={(e) => handleUpdateActiveStyle('color', e.target.value)}
                                            className="w-8 h-8 rounded border-none bg-transparent pointer"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-xs text-slate-500 font-medium">
                                    <Move className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
                                    Select any block on the Canvas to start custom positioning & alignment edits!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateVisualEditor;
