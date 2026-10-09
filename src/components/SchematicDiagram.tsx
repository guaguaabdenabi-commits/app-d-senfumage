import React, { useState, useEffect, useRef } from 'react';
import { RoomInput, CalculationResult } from '../types/desenfumage';
import { Layers, AlertTriangle, Plus, Minus, CheckCircle2, Move, Ruler, DoorOpen } from 'lucide-react';

interface SchematicDiagramProps {
  room: RoomInput;
  calc: CalculationResult;
}

type ElementType = 'ext' | 'an' | 'door';
interface SchematicElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
}

export const SchematicDiagram: React.FC<SchematicDiagramProps> = ({ room, calc }) => {
  const [viewMode, setViewMode] = useState<'section' | 'plan'>('section');
  const [showDims, setShowDims] = useState<boolean>(true);

  const { ceilingHeight, length, width, mode } = room;
  const { cantonment, natural, mechanical } = calc;

  const clearH = cantonment.clearHeightM;
  const smokeE = cantonment.smokeLayerThicknessM;
  const screenDepth = cantonment.screenDepthM;
  const needsCanton = cantonment.required;

  const defaultExtCount = mode === 'naturel' ? natural.denfcCountTotal : mechanical.suggestedExtractionGrilleCount;
  const defaultInletCount = mode === 'naturel' ? Math.max(1, Math.ceil(natural.airInletGeometricAreaM2 / 2)) : Math.max(1, Math.ceil(mechanical.airInletGrilleMinSectionM2 / 0.5));

  const [customExtCount, setCustomExtCount] = useState<number>(defaultExtCount);
  const [customInletCount, setCustomInletCount] = useState<number>(defaultInletCount);
  const [doorCount, setDoorCount] = useState<number>(1);

  // Drag & Drop State
  const svgRef = useRef<SVGSVGElement>(null);
  const [elements, setElements] = useState<SchematicElement[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const maxDrawW = 680;
  const maxDrawH = 320;
  const L = Math.max(length, 1);
  const W = Math.max(width, 1);
  const scale = Math.min(maxDrawW / L, maxDrawH / W);
  const drawW = L * scale;
  const drawH = W * scale;
  const offsetX = (800 - drawW) / 2;
  const offsetY = (450 - drawH) / 2;

  // Initialisation des positions automatiques
  useEffect(() => {
    const newElements: SchematicElement[] = [];
    const extCols = Math.max(1, Math.ceil(Math.sqrt(customExtCount * (L / W))));
    const extRows = Math.max(1, Math.ceil(customExtCount / extCols));

    // Extraction
    for (let i = 0; i < customExtCount; i++) {
      const r = Math.floor(i / extCols);
      const c = i % extCols;
      newElements.push({
        id: `ext-${i}`, type: 'ext',
        x: offsetX + (c + 0.5) * (drawW / extCols),
        y: offsetY + (r + 0.5) * (drawH / extRows)
      });
    }

    // Air Neuf
    for (let i = 0; i < customInletCount; i++) {
      newElements.push({
        id: `an-${i}`, type: 'an',
        x: offsetX + (i + 0.5) * (drawW / customInletCount),
        y: offsetY + drawH
      });
    }

    // Portes
    for (let i = 0; i < doorCount; i++) {
      newElements.push({
        id: `door-${i}`, type: 'door',
        x: offsetX + (i + 0.5) * (drawW / doorCount),
        y: offsetY
      });
    }

    setElements(newElements);
  }, [customExtCount, customInletCount, doorCount, L, W, scale, offsetX, offsetY, drawW, drawH]);

  // Logique de Glisser-Déposer (Drag & Drop)
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse());

    setElements(prev => prev.map(el => {
      if (el.id === draggingId) {
        let nx = cursor.x;
        let ny = cursor.y;

        // Limiter aux murs si c'est une porte
        if (el.type === 'door') {
          const dt = Math.abs(ny - offsetY);
          const db = Math.abs(ny - (offsetY + drawH));
          const dl = Math.abs(nx - offsetX);
          const dr = Math.abs(nx - (offsetX + drawW));
          const m = Math.min(dt, db, dl, dr);
          if (m === dt) ny = offsetY;
          else if (m === db) ny = offsetY + drawH;
          else if (m === dl) nx = offsetX;
          else nx = offsetX + drawW;
        }

        // Limiter à l'intérieur du local
        nx = Math.max(offsetX, Math.min(offsetX + drawW, nx));
        ny = Math.max(offsetY, Math.min(offsetY + drawH, ny));

        return { ...el, x: nx, y: ny };
      }
      return el;
    }));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const requiredCols = Math.ceil(length / 30);
  const requiredRows = Math.ceil(width / 30);
  const minRequiredGeometricPoints = requiredCols * requiredRows;
  const hasGeometricError = customExtCount < minRequiredGeometricPoints;

  // Variables Coupe
  const totalPx = 255;
  const safeCeilingHeight = Math.max(ceilingHeight, 1.8);
  const smokePx = (smokeE / safeCeilingHeight) * totalPx;
  const clearPx = (clearH / safeCeilingHeight) * totalPx;
  const screenPx = (screenDepth / safeCeilingHeight) * totalPx;
  const smokeTop = 105;
  const smokeBottom = 105 + smokePx;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-semibold text-slate-800">CA0 & Implantation</h3>
            {viewMode === 'plan' && (
              <span className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded animate-pulse">
                <Move className="w-3 h-3" /> Interactif
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Glissez-déposez les grilles avec votre souris pour ajuster.</p>
        </div>
        <div className="inline-flex p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
          <button type="button" onClick={() => setViewMode('section')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'section' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Coupe</button>
          <button type="button" onClick={() => setViewMode('plan')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'plan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Plan / CAO</button>
        </div>
      </div>

      {viewMode === 'plan' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-rose-700">Extraction (EXT)</span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1">
              <button onClick={() => setCustomExtCount(Math.max(1, customExtCount - 1))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Minus className="w-3 h-3" /></button>
              <span className="text-xs font-bold text-slate-800 w-6 text-center">{customExtCount}</span>
              <button onClick={() => setCustomExtCount(customExtCount + 1)} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-sky-700">Amenée d&apos;Air (AN)</span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1">
              <button onClick={() => setCustomInletCount(Math.max(1, customInletCount - 1))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Minus className="w-3 h-3" /></button>
              <span className="text-xs font-bold text-slate-800 w-6 text-center">{customInletCount}</span>
              <button onClick={() => setCustomInletCount(customInletCount + 1)} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-emerald-700">Portes (Sorties)</span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1">
              <button onClick={() => setDoorCount(Math.max(0, doorCount - 1))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Minus className="w-3 h-3" /></button>
              <span className="text-xs font-bold text-slate-800 w-6 text-center">{doorCount}</span>
              <button onClick={() => setDoorCount(doorCount + 1)} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-1 justify-end">
            <button onClick={() => setShowDims(!showDims)} className={`flex items-center justify-center gap-2 py-1.5 px-2 rounded border text-[10px] font-bold transition-colors ${showDims ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>
              <Ruler className="w-3.5 h-3.5" /> Cotations
            </button>
          </div>
        </div>
      )}

      {viewMode === 'plan' && hasGeometricError && (
        <div className="p-3 bg-rose-100 border border-rose-300 rounded-lg flex items-start gap-3 shadow-inner">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-900 uppercase">Erreur IT 246 : Espacement &gt; 30 mètres</h4>
            <p className="text-[11px] text-rose-700 mt-1">Au minimum {minRequiredGeometricPoints} point(s) d&apos;extraction requis pour couvrir cette géométrie sans zone morte.</p>
          </div>
        </div>
      )}

      {viewMode === 'plan' && !hasGeometricError && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-800">Implantation validée : Couverture optimale.</span>
        </div>
      )}

      <div className="relative w-full aspect-[16/9] max-h-[400px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-2 cursor-crosshair">
        {viewMode === 'section' ? (
          <svg viewBox="0 0 800 450" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="smokeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#334155" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#475569" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="outsideGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" /><stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="800" height="450" fill="url(#outsideGradient)" />
            <rect x="80" y="360" width="640" height="25" fill="#334155" />
            <line x1="80" y1="360" x2="720" y2="360" stroke="#94a3b8" strokeWidth="2" />
            <rect x="80" y="80" width="640" height="25" fill="#334155" />
            <line x1="80" y1="105" x2="720" y2="105" stroke="#94a3b8" strokeWidth="2" />
            <rect x="70" y="80" width="15" height="305" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <rect x="715" y="80" width="15" height="305" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <g>
              <rect x="85" y={smokeTop} width="630" height={smokePx} fill="url(#smokeGradient)" />
              <line x1="85" y1={smokeBottom} x2="715" y2={smokeBottom} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
              <text x="400" y={smokeBottom - 8} textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold">H&apos; = {clearH.toFixed(2)} m</text>
              <text x="400" y={smokeTop + smokePx / 2} textAnchor="middle" fill="#f87171" fontSize="13" fontWeight="bold">E = {smokeE.toFixed(2)} m</text>
              
              {needsCanton && [300, 500].map((xPos, idx) => (
                <g key={idx}>
                  <line x1={xPos} y1="105" x2={xPos} y2={105 + screenPx} stroke="#ef4444" strokeWidth="5" strokeLinecap="square" />
                </g>
              ))}

              <rect x="220" y="90" width="60" height="25" fill="#dc2626" stroke="#fecaca" strokeWidth="1.5" rx="2" />
              <text x="250" y="106" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">EXT</text>
              
              <rect x="70" y="295" width="15" height="55" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.5" />
              <rect x="715" y="295" width="15" height="55" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.5" />
            </g>
          </svg>
        ) : (
          <svg 
            ref={svgRef}
            viewBox="0 0 800 450" 
            className="w-full h-full select-none" 
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Dimensions Globales */}
            {showDims && (
              <>
                <line x1={offsetX} y1={offsetY - 20} x2={offsetX + drawW} y2={offsetY - 20} stroke="#94a3b8" strokeWidth="1" />
                <line x1={offsetX} y1={offsetY - 25} x2={offsetX} y2={offsetY - 15} stroke="#94a3b8" strokeWidth="2" />
                <line x1={offsetX + drawW} y1={offsetY - 25} x2={offsetX + drawW} y2={offsetY - 15} stroke="#94a3b8" strokeWidth="2" />
                <text x={offsetX + drawW / 2} y={offsetY - 25} textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="bold">L = {length.toFixed(1)} m</text>

                <line x1={offsetX - 20} y1={offsetY} x2={offsetX - 20} y2={offsetY + drawH} stroke="#94a3b8" strokeWidth="1" />
                <line x1={offsetX - 25} y1={offsetY} x2={offsetX - 15} y2={offsetY} stroke="#94a3b8" strokeWidth="2" />
                <line x1={offsetX - 25} y1={offsetY + drawH} x2={offsetX - 15} y2={offsetY + drawH} stroke="#94a3b8" strokeWidth="2" />
                <text x={offsetX - 25} y={offsetY + drawH / 2} textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="bold" writingMode="vertical-rl" transform={`rotate(180, ${offsetX - 25}, ${offsetY + drawH / 2})`}>W = {width.toFixed(1)} m</text>
              </>
            )}

            {/* Murs du local */}
            <rect x={offsetX} y={offsetY} width={drawW} height={drawH} fill="#0f172a" stroke={hasGeometricError ? "#ef4444" : "#475569"} strokeWidth={hasGeometricError ? "4" : "3"} />

            {/* Rendu des éléments (Grilles, AN, Portes) */}
            {elements.map((el) => {
              const isDragging = draggingId === el.id;
              
              return (
                <g 
                  key={el.id} 
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  {el.type === 'ext' && (
                    <>
                      <circle cx={el.x} cy={el.y} r={15 * scale} fill={hasGeometricError ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.1)"} stroke={hasGeometricError ? "#ef4444" : "#10b981"} strokeDasharray="4 4" strokeWidth="1" className="pointer-events-none" />
                      <rect x={el.x - 14} y={el.y - 14} width="28" height="28" fill="#dc2626" stroke="#ffffff" strokeWidth={isDragging ? "2" : "1"} rx="2" />
                      <text x={el.x} y={el.y + 3} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" className="pointer-events-none">EXT</text>
                    </>
                  )}
                  {el.type === 'an' && (
                    <>
                      <rect x={el.x - 15} y={el.y - 8} width="30" height="16" fill="#0284c7" stroke="#38bdf8" strokeWidth={isDragging ? "2" : "1"} rx="2" />
                      <text x={el.x} y={el.y + 3} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" className="pointer-events-none">AN</text>
                    </>
                  )}
                  {el.type === 'door' && (
                    <>
                      <rect x={el.x - 15} y={el.y - 4} width="30" height="8" fill="#16a34a" stroke="#4ade80" strokeWidth={isDragging ? "2" : "1"} rx="1" />
                      <text x={el.x} y={el.y + 15} textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="bold" className="pointer-events-none">PORTE</text>
                    </>
                  )}

                  {/* Cotations Dynamiques (si activées) */}
                  {showDims && (
                    <g className="pointer-events-none">
                      <line x1={offsetX} y1={el.y} x2={el.x - 15} y2={el.y} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                      <rect x={offsetX + (el.x - offsetX)/2 - 12} y={el.y - 6} width="24" height="12" fill="#1e293b" rx="2" />
                      <text x={offsetX + (el.x - offsetX)/2} y={el.y + 3} fill="#94a3b8" fontSize="8" textAnchor="middle">
                        {((el.x - offsetX) / scale).toFixed(1)}m
                      </text>

                      <line x1={el.x} y1={offsetY} x2={el.x} y2={el.y - 15} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                      <rect x={el.x - 12} y={offsetY + (el.y - offsetY)/2 - 6} width="24" height="12" fill="#1e293b" rx="2" />
                      <text x={el.x} y={offsetY + (el.y - offsetY)/2 + 3} fill="#94a3b8" fontSize="8" textAnchor="middle">
                        {((el.y - offsetY) / scale).toFixed(1)}m
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-600 rounded-sm" />Extraction (Rayon 15m)</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-sky-600 rounded-sm" />Amenée d&apos;Air</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-600 rounded-sm" />Porte (Sortie)</div>
        <div className="ml-auto text-slate-400"><Move className="w-3 h-3 inline mr-1" />Déplacez les éléments à la souris</div>
      </div>
    </div>
  );
};
