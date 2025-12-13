import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { 
  ArrowLeft, Download, Type, Square, Circle, Image as ImageIcon, 
  Layers, Trash2, Move, RotateCw, Copy, ChevronUp, ChevronDown,
  LayoutTemplate, ZoomIn, ZoomOut, Lock, Unlock, ArrowUp, ArrowDown,
  Palette, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Monitor, Smartphone, Check, RefreshCw, Sparkles, Loader, X, Upload,
  Smile, Aperture, Undo, Redo
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { ThumbnailTemplate, ThumbnailState, Layer, LayerType, LayerStyle } from '../types';
import { generateThumbnailDesign, generateLogo } from '../services/geminiService';

// --- HELPERS ---

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const createTextLayer = (id: string, text: string, x: number, y: number, style: any = {}): Layer => ({
  id, type: 'text', name: 'Text Layer', x, y, width: 0, height: 0, rotation: 0, content: text,
  style: {
    fontFamily: 'Inter', fontSize: 60, fontWeight: 'bold', color: '#ffffff', textAlign: 'center',
    ...style
  }
});

const createShapeLayer = (id: string, type: 'rect' | 'circle', x: number, y: number, width: number, height: number, color: string): Layer => ({
  id, type: 'shape', name: type === 'rect' ? 'Rectangle' : 'Circle', x, y, width, height, rotation: 0, content: type,
  style: { backgroundColor: color, borderRadius: type === 'circle' ? 9999 : 0 }
});

const EMOJI_CATEGORIES = {
  'Professional': ['🚀', '📈', '💼', '📊', '🤝', '💡', '🏆', '🎯', '🗓️', '✅'],
  'Tech & Modern': ['💻', '📱', '📷', '🎥', '🎧', '🎙️', '🤖', '👾', '🎮', '⌚'],
  'Reactions': ['🔥', '😱', '🤯', '😍', '😭', '😡', '👀', '✨', '💀', '🤡'],
  'Hands': ['👍', '👎', '👋', '✌️', '🤞', '🙏', '👈', '👉', '👆', '👇'],
  'Finance & Biz': ['💰', '💎', '💳', '🏦', '🪙', '💵', '🛒', '🛍️', '🔖', '🏷️'],
  'Symbols': ['❓', '❗️', '❌', '💯', '💢', '💥', '💫', '🚫', '⚠️', '➡️']
};

// --- TEMPLATES ---
const TEMPLATES: ThumbnailTemplate[] = [
  {
    id: 'A',
    name: 'Red Bold Reaction',
    description: 'High impact for YouTube',
    previewColor: 'bg-red-600',
    thumbnailState: {
      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      selectedLayerId: null,
      layers: [
        createShapeLayer('l1', 'circle', 700, 60, 500, 500, '#ffffff20'),
        createTextLayer('l2', 'OMG!!!', 50, 150, { fontSize: 180, fontFamily: 'Oswald', textTransform: 'uppercase', color: '#ffffff', textShadow: '10px 10px 0px #000000' }),
        createTextLayer('l3', 'IT HAPPENED', 60, 400, { fontSize: 80, fontFamily: 'Inter', fontWeight: '800', backgroundColor: '#facc15', color: '#000000', padding: 20 }),
      ]
    }
  },
  {
    id: 'B',
    name: 'Clean Minimal',
    description: 'Modern & Aesthetic',
    previewColor: 'bg-slate-100',
    thumbnailState: {
      background: '#ffffff',
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      selectedLayerId: null,
      layers: [
        createShapeLayer('l1', 'circle', -50, -50, 500, 500, '#fce7f3'), 
        createShapeLayer('l2', 'circle', 850, 350, 400, 400, '#e0f2fe'), 
        createTextLayer('l3', 'Minimalist', 390, 260, { fontSize: 100, fontFamily: 'Playfair Display', color: '#334155', fontWeight: '600' }),
        createTextLayer('l4', 'Design Guide', 460, 400, { fontSize: 40, fontFamily: 'Inter', color: '#94a3b8', fontWeight: '400', letterSpacing: '4px' }),
      ]
    }
  },
  {
    id: 'C',
    name: 'Gaming Neon',
    description: 'Glow & Energy',
    previewColor: 'bg-slate-900',
    thumbnailState: {
      background: '#0f172a',
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      selectedLayerId: null,
      layers: [
        createShapeLayer('l1', 'rect', 0, 0, 1280, 720, 'linear-gradient(45deg, #0f172a 0%, #1e1b4b 100%)'),
        createTextLayer('l2', 'GAMER', 380, 200, { 
          fontSize: 150, fontFamily: 'Orbitron', color: '#4ade80', 
          textShadow: '0 0 20px #4ade80'
        }),
        createTextLayer('l3', 'UNLEASHED', 400, 380, { 
          fontSize: 80, fontFamily: 'Orbitron', color: '#22d3ee', 
          textShadow: '0 0 15px #22d3ee'
        }),
      ]
    }
  },
  {
    id: 'D',
    name: 'Elegant Gold',
    description: 'Luxury & Finance',
    previewColor: 'bg-black',
    thumbnailState: {
      background: '#000000',
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      selectedLayerId: null,
      layers: [
        createShapeLayer('lborder', 'rect', 40, 40, 1200, 640, 'transparent'),
        createTextLayer('l1', 'The Luxury', 410, 240, { fontSize: 90, fontFamily: 'Playfair Display', fontStyle: 'italic', color: '#fbbf24' }),
        createTextLayer('l2', 'Lifestyle', 440, 380, { fontSize: 110, fontFamily: 'Oswald', color: '#ffffff', letterSpacing: '2px' }),
      ]
    }
  },
  {
    id: 'E',
    name: 'Insta Reel',
    description: 'Trendy Gradient',
    previewColor: 'bg-gradient-to-tr from-purple-400 to-pink-400',
    thumbnailState: {
      background: 'linear-gradient(to top right, #c084fc, #f472b6, #fbbf24)',
      width: 1080,
      height: 1920,
      selectedLayerId: null,
      layers: [
        createShapeLayer('l1', 'rect', 140, 800, 800, 320, '#ffffff'),
        createTextLayer('l2', 'AESTHETIC', 290, 860, { fontSize: 90, fontFamily: 'Inter', fontWeight: '900', color: '#000000' }),
        createTextLayer('l3', 'VLOG', 415, 980, { fontSize: 90, fontFamily: 'Inter', fontWeight: '900', color: '#db2777' }),
      ]
    }
  }
];

// Apply specific border style for Template D
TEMPLATES[3].thumbnailState.layers[0].style.borderColor = '#fbbf24';
TEMPLATES[3].thumbnailState.layers[0].style.borderWidth = 4;

// --- MEMOIZED LAYER COMPONENT ---
const LayerItem = memo(({ 
    layer, 
    isSelected, 
    onStart 
}: { 
    layer: Layer, 
    isSelected: boolean, 
    onStart: (e: React.MouseEvent | React.TouchEvent, id: string) => void 
}) => {
    const isImage = layer.type === 'image';
    const wrapperStyle = isImage 
        ? { ...layer.style, borderRadius: 0, backgroundColor: 'transparent', boxShadow: 'none' }
        : layer.style;

    const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        onStart(e, layer.id);
    };

    return (
        <div
            onMouseDown={handleDown}
            onTouchStart={handleDown}
            className={`absolute select-none cursor-move group ${layer.isLocked ? 'cursor-not-allowed' : ''}`}
            style={{
                left: layer.x,
                top: layer.y,
                width: layer.width || 'auto',
                height: layer.height || 'auto',
                transform: `rotate(${layer.rotation}deg)`,
                zIndex: isSelected ? 100 : undefined,
                ...wrapperStyle
            }}
        >
            {isSelected && (
                <div className="absolute -inset-1 border-2 border-indigo-500 pointer-events-none z-50 rounded-sm export-exclude">
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-500 rounded-full" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-500 rounded-full" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-500 rounded-full" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-500 rounded-full" />
                </div>
            )}
            
            {layer.type === 'text' ? (
                <div className="whitespace-pre-wrap">{layer.content}</div>
            ) : layer.type === 'image' ? (
                <img 
                    src={layer.content} 
                    alt="Layer"
                    className="w-full h-full object-cover pointer-events-none block" 
                    style={{ 
                        borderRadius: layer.style.borderRadius, 
                        opacity: layer.style.opacity 
                    }} 
                />
            ) : (
                <div className="w-full h-full" />
            )}
        </div>
    );
}, (prev, next) => {
    return (
        prev.isSelected === next.isSelected && 
        prev.layer === next.layer
    );
});


interface ThumbnailMakerProps {
  onBack: () => void;
}

const ThumbnailMaker: React.FC<ThumbnailMakerProps> = ({ onBack }) => {
  const [state, setState] = useState<ThumbnailState>(TEMPLATES[0].thumbnailState);
  
  // --- HISTORY STATE ---
  const [history, setHistory] = useState<ThumbnailState[]>([TEMPLATES[0].thumbnailState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [zoom, setZoom] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'templates' | 'layers' | 'add' | 'upload' | 'ai' | 'emoji' | null>(null);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  
  // Panning State
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMode, setAiMode] = useState<'layout' | 'logo'>('layout');
  
  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageShape, setPendingImageShape] = useState<'rect' | 'circle'>('rect');

  const canvasRef = useRef<HTMLDivElement>(null);

  // --- HISTORY MANAGEMENT ---

  const addToHistory = useCallback((newState: ThumbnailState) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      // Optional: limit history size
      if (newHistory.length > 50) newHistory.shift();
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setState(newState);
  }, [history, historyIndex]);

  const undo = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setState(history[newIndex]);
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setState(history[newIndex]);
      }
  };

  const snapshotToHistory = () => {
      addToHistory(state);
  };

  // --- RESPONSIVE ZOOM ---
  const fitToScreen = useCallback((targetWidth: number, targetHeight: number) => {
    if (typeof window === 'undefined') return;
    const availableWidth = window.innerWidth - (window.innerWidth >= 768 ? 400 : 32); 
    const availableHeight = window.innerHeight - 200; 
    const scaleX = availableWidth / targetWidth;
    const scaleY = availableHeight / targetHeight;
    const newZoom = Math.min(scaleX, scaleY, 0.65);
    setZoom(Math.max(newZoom, 0.15));
  }, []);

  useEffect(() => {
    fitToScreen(state.width, state.height);
    const handleResize = () => {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
        fitToScreen(state.width, state.height);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.width, state.height, fitToScreen]);

  // --- KEYBOARD SUPPORT ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!state.selectedLayerId) return;
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        // Undo/Redo Shortcuts
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            return;
        }

        const shift = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        if (e.key === 'ArrowUp') dy = -shift;
        else if (e.key === 'ArrowDown') dy = shift;
        else if (e.key === 'ArrowLeft') dx = -shift;
        else if (e.key === 'ArrowRight') dx = shift;
        else return;

        e.preventDefault();
        
        // This is a "rapid" update, so we should probably throttle history or 
        // just update state. For simplicity, we update state and let user
        // trigger history save manually or accept no history for arrow keys
        // (or add debounce). For now: update state only.
        setState(prev => ({
            ...prev,
            layers: prev.layers.map(l => 
                l.id === prev.selectedLayerId 
                ? { ...l, x: l.x + dx, y: l.y + dy }
                : l
            )
        }));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedLayerId, history, historyIndex]); // Add history deps for undo/redo


  // --- ACTIONS ---

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent, layerId?: string) => {
     let clientX: number, clientY: number;
     if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
     } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
     }

     if (layerId) {
        setState(prev => {
            const layer = prev.layers.find(l => l.id === layerId);
            if (!layer || layer.isLocked) return prev;

            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const x = (clientX - rect.left) / zoom;
                const y = (clientY - rect.top) / zoom;
                setDragOffset({ x: x - layer.x, y: y - layer.y });
            }
            
            setIsDragging(true);
            return { ...prev, selectedLayerId: layerId };
        });
     } else {
        setIsPanning(true);
        setLastPanPoint({ x: clientX, y: clientY });
     }
  }, [zoom]);

  const handleMove = (clientX: number, clientY: number) => {
    if (isDragging && state.selectedLayerId) {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (clientX - rect.left) / zoom;
        const y = (clientY - rect.top) / zoom;

        // Direct state update for performance (60fps)
        updateLayerVisualOnly(state.selectedLayerId, {
            x: x - dragOffset.x,
            y: y - dragOffset.y
        });
    }

    if (isPanning && scrollContainerRef.current) {
        const dx = clientX - lastPanPoint.x;
        const dy = clientY - lastPanPoint.y;
        scrollContainerRef.current.scrollLeft -= dx;
        scrollContainerRef.current.scrollTop -= dy;
        setLastPanPoint({ x: clientX, y: clientY });
    }
  };

  const handleEnd = () => {
    if (isDragging) {
        // Drag finished, save snapshot to history
        addToHistory(state);
    }
    setIsDragging(false);
    setIsPanning(false);
  };

  const handleLayerSelect = (id: string | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setState(prev => ({ ...prev, selectedLayerId: id }));
  };

  // Updates state only (no history) - use for fast updates like dragging/sliders
  const updateLayerVisualOnly = (id: string, updates: Partial<Layer>) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  // Updates state and commits to history - use for buttons/toggles
  const updateLayerAndCommit = (id: string, updates: Partial<Layer>) => {
    const newState = {
        ...state,
        layers: state.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    };
    addToHistory(newState);
  };

   const updateLayerStyleAndCommit = (id: string, styleUpdates: any) => {
    const newState = {
        ...state,
        layers: state.layers.map(l => l.id === id ? { ...l, style: { ...l.style, ...styleUpdates } } : l)
    };
    addToHistory(newState);
  };

  // Helper for inputs to just update visual, commit on blur
  const updateLayerStyleVisual = (id: string, styleUpdates: any) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, style: { ...l.style, ...styleUpdates } } : l)
    }));
  };

  const addLayer = (type: LayerType, content: string = '') => {
    const id = Date.now().toString();
    const centerX = state.width / 2;
    const centerY = state.height / 2;
    
    let newLayer: Layer;
    
    if (type === 'text') {
      newLayer = createTextLayer(id, content || 'New Text', centerX - 120, centerY - 30); 
    } else if (type === 'shape') {
      newLayer = createShapeLayer(id, 'rect', centerX - 100, centerY - 100, 200, 200, '#3b82f6');
    } else {
       newLayer = createShapeLayer(id, 'rect', centerX, centerY, 100, 100, '#000');
    }
    
    const newState = {
      ...state,
      layers: [...state.layers, newLayer],
      selectedLayerId: id
    };
    addToHistory(newState);
  };

  const triggerImageUpload = (shape: 'rect' | 'circle') => {
    setPendingImageShape(shape);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const id = Date.now().toString();
        const centerX = state.width / 2;
        const centerY = state.height / 2;
        const size = 300;

        const newLayer: Layer = {
            id,
            type: 'image',
            name: 'Image',
            x: centerX - (size / 2),
            y: centerY - (size / 2),
            width: size,
            height: size,
            rotation: 0,
            content: result,
            style: {
                backgroundColor: 'transparent',
                borderRadius: pendingImageShape === 'circle' ? 9999 : 0
            }
        };

        const newState = {
            ...state,
            layers: [...state.layers, newLayer],
            selectedLayerId: id
        };
        addToHistory(newState);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };


  const deleteLayer = (id: string) => {
    const newState = {
      ...state,
      layers: state.layers.filter(l => l.id !== id),
      selectedLayerId: null
    };
    addToHistory(newState);
  };

  const reorderLayer = (id: string, direction: 'up' | 'down') => {
      const index = state.layers.findIndex(l => l.id === id);
      if (index === -1) return;
      if (direction === 'up' && index === state.layers.length - 1) return;
      if (direction === 'down' && index === 0) return;
      
      const newLayers = [...state.layers];
      const swapIndex = direction === 'up' ? index + 1 : index - 1;
      [newLayers[index], newLayers[swapIndex]] = [newLayers[swapIndex], newLayers[index]];
      
      addToHistory({ ...state, layers: newLayers });
  };

  const loadTemplate = (template: ThumbnailTemplate) => {
    // Removed confirm dialog as we now have Undo functionality
    const newState = JSON.parse(JSON.stringify(template.thumbnailState));
    // Ensure no layer is selected when loading a new template to prevent property panel issues
    newState.selectedLayerId = null; 
    
    addToHistory(newState);
    fitToScreen(newState.width, newState.height);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    try {
        const dataUrl = await toPng(canvasRef.current, {
            quality: 1.0,
            pixelRatio: 1,
            width: state.width,
            height: state.height,
            style: { transform: 'none', transformOrigin: 'top left' },
            filter: (node) => !node.classList?.contains('export-exclude')
        });
        const link = document.createElement('a');
        link.download = `creo-thumbnail-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        setShowExportSuccess(true);
        setTimeout(() => setShowExportSuccess(false), 3000);
    } catch (error) {
        console.error('Export failed:', error);
        alert("Could not export image. Please try again.");
    }
  };

  // --- AI GENERATION ---

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      if (aiMode === 'layout') {
        const designModel = await generateThumbnailDesign(aiPrompt);
        if (designModel && designModel.canvas && designModel.layers) {
          const canvasW = parseInt(designModel.canvas.width) || 1280;
          const canvasH = parseInt(designModel.canvas.height) || 720;
          const centerX = canvasW / 2;
          const centerY = canvasH / 2;

          const newLayers: Layer[] = designModel.layers.map((l: any, idx: number) => {
            const type = l.type === 'shape' ? 'shape' : 'text';
            const content = l.content || (type === 'text' ? 'Text' : 'rect');
            let safeX = parseInt(l.position?.x) || 0;
            let safeY = parseInt(l.position?.y) || 0;
            const w = parseInt(l.size?.width) || (type === 'text' ? 0 : 100);
            const h = parseInt(l.size?.height) || (type === 'text' ? 0 : 100);

            if (safeX < 5 && safeY < 5) {
              safeX = centerX - (w / 2);
              safeY = centerY - (h / 2) + (idx * 50);
            }

            return {
              id: `ai-layer-${Date.now()}-${idx}`,
              type: type,
              name: type === 'text' ? 'Text' : 'Shape',
              x: safeX,
              y: safeY,
              width: w,
              height: h,
              rotation: parseInt(l.rotation) || 0,
              content: content,
              style: {
                ...l.style,
                fontSize: parseInt(l.style?.fontSize) || 40,
                color: l.style?.color || '#000',
                backgroundColor: l.style?.backgroundColor || 'transparent'
              }
            };
          });

          const newState = {
            background: designModel.canvas.background?.value || '#ffffff',
            width: canvasW,
            height: canvasH,
            layers: newLayers,
            selectedLayerId: null
          };
          addToHistory(newState);
          fitToScreen(canvasW, canvasH);
        }
      } else {
        const logoDataUrl = await generateLogo(aiPrompt);
        const id = Date.now().toString();
        const centerX = state.width / 2;
        const centerY = state.height / 2;
        const size = 400;

        const newLayer: Layer = {
            id,
            type: 'image',
            name: 'AI Logo',
            x: centerX - (size / 2),
            y: centerY - (size / 2),
            width: size,
            height: size,
            rotation: 0,
            content: logoDataUrl,
            style: { backgroundColor: 'transparent', borderRadius: 0 }
        };

        const newState = {
            ...state,
            layers: [...state.layers, newLayer],
            selectedLayerId: id
        };
        addToHistory(newState);
      }
      setAiPrompt('');
    } catch (e) {
      alert("Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- RENDER ---

  const selectedLayer = state.layers.find(l => l.id === state.selectedLayerId);
  const scaledWidth = state.width * zoom;
  const scaledHeight = state.height * zoom;

  return (
    <div 
        className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden font-sans fixed inset-0"
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onTouchMove={(e) => { 
           if (isDragging || isPanning) e.preventDefault();
           handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handleEnd}
        onClick={() => handleLayerSelect(null)}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* TOOLBAR SIDEBAR - Mobile: Fixed Bottom, Desktop: Left Sidebar */}
       <aside 
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex flex-row items-center justify-around z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:relative md:h-full md:w-20 md:flex-col md:justify-start md:py-4 md:border-t-0 md:border-r md:shadow-none md:inset-auto order-last md:order-1"
      >
         <button onClick={onBack} className="p-3 md:mb-6 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors md:block hidden" aria-label="Back">
            <ArrowLeft size={24} />
         </button>
         
         <div className="flex flex-row md:flex-col gap-1 md:gap-4 w-full px-2 justify-around md:justify-center">
            <button onClick={onBack} className="flex flex-col items-center gap-1 p-2 md:hidden text-slate-500"><ArrowLeft size={20} /><span className="text-[10px] font-medium">Back</span></button>

            <button onClick={(e) => { e.stopPropagation(); setActiveTab(activeTab === 'add' ? null : 'add'); }} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${activeTab === 'add' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <LayoutTemplate size={24} />
                <span className="text-[10px] font-medium">Create</span>
            </button>
             <button onClick={(e) => { e.stopPropagation(); setActiveTab(activeTab === 'upload' ? null : 'upload'); }} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${activeTab === 'upload' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Upload size={24} />
                <span className="text-[10px] font-medium">Upload</span>
            </button>
             <button onClick={(e) => { e.stopPropagation(); setActiveTab(activeTab === 'emoji' ? null : 'emoji'); }} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${activeTab === 'emoji' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Smile size={24} />
                <span className="text-[10px] font-medium">Emojis</span>
            </button>
             <button onClick={(e) => { e.stopPropagation(); setActiveTab(activeTab === 'ai' ? null : 'ai'); }} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${activeTab === 'ai' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Sparkles size={24} />
                <span className="text-[10px] font-medium">Magic AI</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setActiveTab(activeTab === 'templates' ? null : 'templates'); }} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${activeTab === 'templates' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Monitor size={24} />
                <span className="text-[10px] font-medium">Templates</span>
            </button>
             <button onClick={(e) => { e.stopPropagation(); setActiveTab(activeTab === 'layers' ? null : 'layers'); }} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${activeTab === 'layers' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Layers size={24} />
                <span className="text-[10px] font-medium">Layers</span>
            </button>
        </div>
      </aside>

      {/* MAIN EDITOR AREA */}
      <div className="flex-1 flex flex-col relative bg-slate-100 min-w-0 order-1 md:order-2 h-full pb-16 md:pb-0">
        
        {/* Toolbar - Top */}
        <div 
            onClick={(e) => e.stopPropagation()}
            className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 z-20 relative"
        >
             <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 border-r border-slate-200 pr-3 mr-1">
                     <button 
                        onClick={undo} 
                        disabled={historyIndex === 0}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Undo (Ctrl+Z)"
                     >
                         <Undo size={18} />
                     </button>
                     <button 
                        onClick={redo} 
                        disabled={historyIndex === history.length - 1}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Redo (Ctrl+Shift+Z)"
                     >
                         <Redo size={18} />
                     </button>
                 </div>

                 <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" aria-label="Zoom Out"><ZoomOut size={18} /></button>
                 <span className="text-xs font-medium text-slate-600 w-12 text-center hidden sm:block">{Math.round(zoom * 100)}%</span>
                 <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" aria-label="Zoom In"><ZoomIn size={18} /></button>
             </div>
             
             <div className="flex items-center gap-2">
                 {selectedLayer && (
                     <>
                        <button onClick={() => reorderLayer(selectedLayer.id, 'up')} title="Bring Forward" className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hidden md:block"><ArrowUp size={18} /></button>
                        <button onClick={() => reorderLayer(selectedLayer.id, 'down')} title="Send Backward" className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hidden md:block"><ArrowDown size={18} /></button>
                        <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block" />
                        <button onClick={() => updateLayerAndCommit(selectedLayer.id, { isLocked: !selectedLayer.isLocked })} className={`p-2 rounded-lg ${selectedLayer.isLocked ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100 text-slate-600'}`}>
                            {selectedLayer.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                        <button onClick={() => deleteLayer(selectedLayer.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={18} /></button>
                     </>
                 )}
             </div>

             <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
             >
                 {showExportSuccess ? <Check size={18} /> : <Download size={18} />}
                 <span className="text-sm font-medium hidden sm:inline">{showExportSuccess ? 'Saved!' : 'Export'}</span>
             </button>
        </div>

        {/* MIDDLE CONTENT AREA */}
        <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
            
            {/* LEFT SIDEBAR - CONTEXT */}
            {activeTab && (
                <div 
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="bg-white border-slate-200 flex flex-col z-30 shadow-xl absolute bottom-16 md:bottom-0 left-0 right-0 h-[50vh] w-full rounded-t-2xl border-t md:relative md:w-80 md:h-full md:border-r md:rounded-none md:shadow-none md:top-0 animate-in slide-in-from-bottom md:slide-in-from-left duration-200"
                >
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 md:hidden flex-shrink-0" />
                    <button onClick={() => setActiveTab(null)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 z-10">
                        <X size={16} />
                    </button>

                    {activeTab === 'add' && (
                        <div className="p-4 overflow-y-auto">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Add Element</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => addLayer('text')} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors gap-2 group">
                                    <Type size={24} className="text-slate-600 group-hover:text-indigo-600" />
                                    <span className="text-xs font-medium text-slate-600">Text</span>
                                </button>
                                <button onClick={() => addLayer('shape')} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors gap-2 group">
                                    <Square size={24} className="text-slate-600 group-hover:text-indigo-600" />
                                    <span className="text-xs font-medium text-slate-600">Shape</span>
                                </button>
                            </div>
                            
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mt-8 mb-4">Canvas</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-2">Background Color</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['#ffffff', '#000000', '#dc2626', '#2563eb', '#16a34a', '#db2777'].map(c => (
                                            <button 
                                                key={c} 
                                                onClick={() => addToHistory({ ...state, background: c })}
                                                className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="p-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Add from Gallery</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => triggerImageUpload('rect')} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors gap-2 group">
                                    <ImageIcon size={24} className="text-slate-600 group-hover:text-indigo-600" />
                                    <span className="text-xs font-medium text-slate-600">Square</span>
                                </button>
                                <button onClick={() => triggerImageUpload('circle')} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors gap-2 group">
                                    <Circle size={24} className="text-slate-600 group-hover:text-indigo-600" />
                                    <span className="text-xs font-medium text-slate-600">Circle</span>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'emoji' && (
                        <div className="p-4 overflow-y-auto flex-1">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Emojis</h3>
                            {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                                <div key={category} className="mb-6">
                                    <h4 className="text-xs font-semibold text-slate-500 mb-2">{category}</h4>
                                    <div className="grid grid-cols-5 gap-2">
                                        {emojis.map(emoji => (
                                            <button 
                                                key={emoji}
                                                onClick={() => addLayer('text', emoji)}
                                                className="text-2xl p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="p-4 flex flex-col h-full">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Sparkles size={16} className="text-indigo-500" />
                                Magic AI
                            </h3>
                            <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                                <button onClick={() => setAiMode('layout')} className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${aiMode === 'layout' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Layout Generator</button>
                                <button onClick={() => setAiMode('logo')} className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${aiMode === 'logo' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Logo Generator</button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <textarea 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder={aiMode === 'layout' ? "Describe layout..." : "Enter Brand Name..."}
                                    className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none mb-4"
                                />
                                <button 
                                    onClick={handleAiGenerate}
                                    disabled={isGenerating || !aiPrompt.trim()}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-all"
                                >
                                    {isGenerating ? <Loader size={18} className="animate-spin" /> : aiMode === 'layout' ? <Sparkles size={18} /> : <Aperture size={18} />}
                                    {isGenerating ? 'Generating...' : aiMode === 'layout' ? 'Generate Layout' : 'Generate Logo'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Templates</h3>
                            <div className="space-y-4 pb-20 md:pb-0">
                                {TEMPLATES.map(t => (
                                    <button key={t.id} onClick={(e) => { e.stopPropagation(); loadTemplate(t); }} className="w-full group text-left cursor-pointer">
                                        <div className={`w-full aspect-video rounded-lg mb-2 shadow-sm border border-slate-200 overflow-hidden relative ${t.previewColor}`}>
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                        </div>
                                        <div className="font-medium text-slate-800 text-sm">{t.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'layers' && (
                        <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Layers</h3>
                            <div className="space-y-2 pb-20 md:pb-0">
                                {[...state.layers].reverse().map((layer) => (
                                    <div 
                                        key={layer.id}
                                        onClick={(e) => handleLayerSelect(layer.id, e)}
                                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                                            state.selectedLayerId === layer.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'
                                        }`}
                                    >
                                        {layer.type === 'text' ? <Type size={14} /> : layer.type === 'image' ? <ImageIcon size={14} /> : <Square size={14} />}
                                        <span className="text-xs font-medium truncate flex-1">{layer.name || 'Layer'}</span>
                                        <div className="flex items-center">
                                            <button onClick={() => updateLayerAndCommit(layer.id, { isLocked: !layer.isLocked })} className="p-1 text-slate-400 hover:text-slate-600">
                                                {layer.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                                            </button>
                                            <button onClick={() => deleteLayer(layer.id)} className="p-1 text-slate-400 hover:text-red-600">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CANVAS SCROLL AREA */}
            <div 
                ref={scrollContainerRef}
                className={`flex-1 overflow-auto bg-checkerboard relative z-0 touch-none pb-32 md:pb-12 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={(e) => handleStart(e)}
                onTouchStart={(e) => handleStart(e)}
            >
                <div className="min-w-full min-h-full flex items-start md:items-center justify-center p-4 pt-10 md:p-12 md:pt-12 pb-40 md:pb-12">
                    <div style={{ width: scaledWidth, height: scaledHeight, position: 'relative', flexShrink: 0, boxShadow: '0 0 40px rgba(0,0,0,0.1)' }}>
                        <div 
                            ref={canvasRef}
                            className="absolute top-0 left-0 origin-top-left overflow-hidden bg-white"
                            style={{ 
                                width: state.width, 
                                height: state.height, 
                                transform: `scale(${zoom})`,
                                background: state.background 
                            }}
                            onClick={(e) => e.stopPropagation()} 
                        >
                            {state.layers.map((layer) => (
                                <LayerItem 
                                    key={layer.id} 
                                    layer={layer} 
                                    isSelected={state.selectedLayerId === layer.id} 
                                    onStart={handleStart} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* PROPERTIES SIDEBAR */}
            {selectedLayer && !selectedLayer.isLocked && (
                <aside 
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="bg-white border-slate-200 flex flex-col z-30 shadow-xl overflow-y-auto absolute bottom-16 md:bottom-0 left-0 right-0 h-[40vh] w-full rounded-t-2xl border-t md:relative md:w-64 md:h-full md:border-l md:rounded-none md:shadow-none md:top-0 animate-in slide-in-from-bottom md:slide-in-from-right duration-200"
                >
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-2 md:hidden flex-shrink-0" />
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Properties</h3>
                        <button onClick={() => handleLayerSelect(null)} className="md:hidden p-1 text-slate-400"><X size={16} /></button>
                    </div>

                    <div className="p-4 space-y-6 pb-20 md:pb-4">
                        {selectedLayer.type === 'text' && (
                            <div>
                                <label className="text-xs text-slate-500 block mb-2">Content</label>
                                <textarea 
                                    value={selectedLayer.content}
                                    onChange={(e) => updateLayerVisualOnly(selectedLayer.id, { content: e.target.value })}
                                    onBlur={() => snapshotToHistory()}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    rows={2}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {selectedLayer.type !== 'text' && (
                                <>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Width</label>
                                        <input type="number" value={selectedLayer.width} onChange={(e) => updateLayerVisualOnly(selectedLayer.id, { width: parseInt(e.target.value) })} onBlur={snapshotToHistory} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Height</label>
                                        <input type="number" value={selectedLayer.height} onChange={(e) => updateLayerVisualOnly(selectedLayer.id, { height: parseInt(e.target.value) })} onBlur={snapshotToHistory} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                                    </div>
                                </>
                            )}
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 block mb-1">Rotation</label>
                                <input 
                                    type="range" min="0" max="360" 
                                    value={selectedLayer.rotation} 
                                    onChange={(e) => updateLayerVisualOnly(selectedLayer.id, { rotation: parseInt(e.target.value) })} 
                                    onMouseUp={snapshotToHistory}
                                    onTouchEnd={snapshotToHistory}
                                    className="w-full accent-indigo-600" 
                                />
                            </div>
                        </div>

                        {selectedLayer.type !== 'image' && (
                            <div>
                                <label className="text-xs text-slate-500 block mb-2">Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['#ffffff', '#000000', '#1e293b', '#dc2626', '#2563eb', '#facc15', '#4ade80'].map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => updateLayerStyleAndCommit(selectedLayer.id, selectedLayer.type === 'text' ? { color: c } : { backgroundColor: c })}
                                            className="w-6 h-6 rounded-full border border-slate-200"
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input 
                                        type="color" 
                                        value={selectedLayer.type === 'text' ? selectedLayer.style.color : selectedLayer.style.backgroundColor}
                                        onChange={(e) => updateLayerStyleVisual(selectedLayer.id, selectedLayer.type === 'text' ? { color: e.target.value } : { backgroundColor: e.target.value })}
                                        onBlur={snapshotToHistory}
                                        className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden"
                                    />
                                </div>
                            </div>
                        )}

                        {selectedLayer.type === 'text' && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">Font Family</label>
                                    <select 
                                        value={selectedLayer.style.fontFamily} 
                                        onChange={(e) => updateLayerStyleAndCommit(selectedLayer.id, { fontFamily: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="Inter">Inter (Modern)</option>
                                        <option value="Oswald">Oswald (Bold)</option>
                                        <option value="Playfair Display">Playfair (Elegant)</option>
                                        <option value="Orbitron">Orbitron (Gaming)</option>
                                        <option value="Permanent Marker">Marker (Handwritten)</option>
                                    </select>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button onClick={() => updateLayerStyleAndCommit(selectedLayer.id, { fontWeight: selectedLayer.style.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`flex-1 p-2 rounded border ${selectedLayer.style.fontWeight === 'bold' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200'}`}><Bold size={16} className="mx-auto"/></button>
                                    <button onClick={() => updateLayerStyleAndCommit(selectedLayer.id, { fontStyle: selectedLayer.style.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`flex-1 p-2 rounded border ${selectedLayer.style.fontStyle === 'italic' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200'}`}><Italic size={16} className="mx-auto"/></button>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">Size: {selectedLayer.style.fontSize}px</label>
                                    <input 
                                        type="range" min="12" max="300" 
                                        value={selectedLayer.style.fontSize} 
                                        onChange={(e) => updateLayerStyleVisual(selectedLayer.id, { fontSize: parseInt(e.target.value) })} 
                                        onMouseUp={snapshotToHistory}
                                        onTouchEnd={snapshotToHistory}
                                        className="w-full accent-indigo-600" 
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">Opacity</label>
                                    <input 
                                        type="range" min="0" max="1" step="0.1"
                                        value={selectedLayer.style.opacity ?? 1} 
                                        onChange={(e) => updateLayerStyleVisual(selectedLayer.id, { opacity: parseFloat(e.target.value) })} 
                                        onMouseUp={snapshotToHistory}
                                        onTouchEnd={snapshotToHistory}
                                        className="w-full accent-indigo-600" 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            )}
        </div>
      </div>
    </div>
  );
};

export default ThumbnailMaker;