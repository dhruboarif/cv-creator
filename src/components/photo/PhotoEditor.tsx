import React, { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useCVStore } from '../../store/cvStore';
import { Camera, RefreshCw, ZoomIn, ZoomOut, Save, Circle, Square, Trash2 } from 'lucide-react';

const PhotoEditor: React.FC = () => {
    const { cvData, setPhoto, currentTemplateId, templates, updateTemplate, updateCVData } = useCVStore();
    const [imageSrc, setImageSrc] = useState<string | null>(cvData.photo);
    const [zoom, setZoom] = useState(cvData.photoZoom ?? 1);
    const [rotation, setRotation] = useState(cvData.photoRotation ?? 0);
    const [position, setPosition] = useState(cvData.photoPosition || { x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [shape, setShape] = useState<'circle' | 'rectangle'>('circle');
    const [borderWidth, setBorderWidth] = useState(2);
    const [borderColor, setBorderColor] = useState('#FFFFFF');
    const [shadow, setShadow] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const activeTemplate = templates.find((t) => t.id === currentTemplateId);

    // Sync from store updates
    useEffect(() => {
        setImageSrc(cvData.photo);
    }, [cvData.photo]);

    useEffect(() => {
        if (!isDragging) {
            setPosition(cvData.photoPosition || { x: 0, y: 0 });
        }
    }, [cvData.photoPosition, isDragging]);

    useEffect(() => {
        setZoom(cvData.photoZoom ?? 1);
    }, [cvData.photoZoom]);

    useEffect(() => {
        setRotation(cvData.photoRotation ?? 0);
    }, [cvData.photoRotation]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                setImageSrc(base64);
                setPhoto(base64);
                updateCVData((draft) => {
                    draft.photoZoom = 1;
                    draft.photoRotation = 0;
                    draft.photoPosition = { x: 0, y: 0 };
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!imageSrc) return;
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
        if (!imageSrc || e.touches.length !== 1) return;
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

    const handleCropSave = () => {
        // Update active template photo settings
        if (activeTemplate) {
            updateTemplate(activeTemplate.id, {
                elements: {
                    ...activeTemplate.elements,
                    photo: {
                        ...activeTemplate.elements.photo,
                        shape,
                        borderWidth,
                        borderColor,
                    },
                },
            });
        }
    };

    return (
        <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-text">Photo Editor & Style Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: Editor preview */}
                <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[350px]">
                    {imageSrc ? (
                        <>
                            <div 
                                className="relative overflow-hidden w-64 h-64 border border-white/10 flex items-center justify-center bg-slate-900 rounded-lg select-none"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleMouseUp}
                            >
                                <img
                                    ref={(el) => {
                                        imageRef.current = el;
                                    }}
                                    src={imageSrc}
                                    alt="Upload Source"
                                    className={`max-w-none select-none cursor-grab active:cursor-grabbing ${
                                        isDragging ? '' : 'transition-transform duration-100'
                                    }`}
                                    style={{
                                        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                    }}
                                    draggable={false}
                                />
                                {/* Overlay guides */}
                                <div
                                    className={`absolute inset-4 border-2 border-dashed border-accent pointer-events-none ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                                        }`}
                                />
                            </div>
                            <span className="text-xs text-slate-400 mt-2">Drag image to position inside the frame</span>
                        </>
                    ) : (
                        <div
                            className="w-64 h-64 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-all"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera className="w-12 h-12 text-slate-400 mb-3" />
                            <span className="text-sm text-slate-300 font-semibold">Upload Photo</span>
                            <span className="text-xs text-slate-500 mt-1">PNG, JPG or JPEG</span>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    {imageSrc && (
                        <div className="flex gap-4 mt-6">
                            <button className="btn-secondary py-1.5 px-3" onClick={() => updateCVData((draft) => { draft.photoZoom = Math.max(0.5, zoom - 0.1); })} title="Zoom Out">
                                <ZoomOut size={16} />
                            </button>
                            <button className="btn-secondary py-1.5 px-3" onClick={() => updateCVData((draft) => { draft.photoZoom = Math.min(4, zoom + 0.1); })} title="Zoom In">
                                <ZoomIn size={16} />
                            </button>
                            <button className="btn-secondary py-1.5 px-3" onClick={() => updateCVData((draft) => { draft.photoRotation = (rotation + 90) % 360; })} title="Rotate">
                                <RefreshCw size={16} />
                            </button>
                            <button className="btn-secondary py-1.5 px-3 text-xs font-semibold" onClick={() => {
                                updateCVData((draft) => {
                                    draft.photoZoom = 1;
                                    draft.photoRotation = 0;
                                    draft.photoPosition = { x: 0, y: 0 };
                                });
                            }} title="Reset Position & Zoom">
                                Reset
                            </button>
                        </div>
                    )}
                </div>

                {/* Right column: Styling options */}
                <div className="glass-card p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-md font-semibold mb-4 text-slate-200">Style Settings</h3>

                        {/* Shape */}
                        <div className="mb-4">
                            <label className="input-label">Frame Shape</label>
                            <div className="flex gap-2">
                                <button
                                    className={`btn-secondary flex-1 flex items-center justify-center gap-2 ${shape === 'circle' ? '!border-accent text-accent' : ''}`}
                                    onClick={() => setShape('circle')}
                                >
                                    <Circle size={16} /> Circle
                                </button>
                                <button
                                    className={`btn-secondary flex-1 flex items-center justify-center gap-2 ${shape === 'rectangle' ? '!border-accent text-accent' : ''}`}
                                    onClick={() => setShape('rectangle')}
                                >
                                    <Square size={16} /> Rectangle
                                </button>
                            </div>
                        </div>

                        {/* Border Width */}
                        <div className="mb-4">
                            <label className="input-label">Border Width ({borderWidth}px)</label>
                            <input
                                type="range"
                                min="0"
                                max="8"
                                value={borderWidth}
                                onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                        </div>

                        {/* Border Color */}
                        <div className="mb-4">
                            <label className="input-label">Border Color</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={borderColor}
                                    onChange={(e) => setBorderColor(e.target.value)}
                                    className="w-10 h-10 border border-slate-700 rounded bg-transparent cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={borderColor}
                                    onChange={(e) => setBorderColor(e.target.value)}
                                    className="input-field flex-1"
                                />
                            </div>
                        </div>

                        {/* Shadow */}
                        <div className="mb-6 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-300">Apply Shadow Effect</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={shadow}
                                    onChange={(e) => setShadow(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all peer-checked:bg-accent"></div>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            className="btn-primary flex-1 py-2.5 justify-center"
                            onClick={handleCropSave}
                            disabled={!imageSrc}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                        {cvData.photo && (
                            <button
                                className="btn-danger p-2.5 flex items-center justify-center"
                                onClick={() => {
                                    setPhoto(null);
                                    updateCVData((draft) => {
                                        draft.photoZoom = 1;
                                        draft.photoRotation = 0;
                                        draft.photoPosition = { x: 0, y: 0 };
                                    });
                                }}
                                title="Remove Photo"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default PhotoEditor;
