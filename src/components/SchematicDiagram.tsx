import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, Wind, Plus, Trash2, MousePointer2, Move, Ruler, LocateFixed } from 'lucide-react';
import { RoomInput, CalculationResult } from '../types/desenfumage';

interface Props {
  room: RoomInput;
  calc: CalculationResult;
}

type CanvasItem = { id: string; x: number; y: number; type: 'aa' | 'ex' | 'porte' };

export const SchematicDiagram: React.FC<Props> = ({ room, calc }) => {
  const [view, setView] = useState<'plan' | 'coupe'>('plan');

  // Dimensions géométriques
  const H = room.ceilingHeight || 3;
  const L = room.length || 10;
  const W = room.width || 10;
  
  const clearH = calc?.cantonment?.clearHeightM || (H / 2);
  const smokeE = calc?.cantonment?.smokeLayerThicknessM || (H - clearH);

  // MOTEUR IT 246
  const isMech = room.mode === 'mecanique';
  const isCirc = room.spaceKind === 'circulation';
  const [isRectiligne, setIsRectiligne] = useState(true);

  const maxDistCirculation = isCirc ? (isMech ? (isRectiligne ? 15 : 10) : (isRectiligne ? 10 : 7)) : 0;
  const maxDistLocal = isMech ? (4 * H) : Math.min(30, 4 * H);
  const maxDistPorte = 5;

  // GESTION D'ÉTAT DU PLAN
  const storageKey = `gpt_layout_${room.id}`;
  
  const [items, setItems] = useState<CanvasItem[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    return [
      { id: 'aa1', x: L * 0.2, y: W / 2, type: 'aa' },
      { id: 'ex1', x: L * 0.8, y: W / 2, type: 'ex' },
      { id: 'p1', x: L / 2, y: W - 0.5, type: 'porte' }
    ];
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = items.find(i => i.id === selectedId);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = (type: 'aa' | 'ex' | 'porte') => {
    const yPos = type === 'porte' ? W - 0.5 : W / 2;
    setItems([...items, { id: `${type}-${Date.now()}`, x: L / 2, y: yPos, type }]);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setItems(items.filter(i => i.id !== selectedId));
      setSelectedId(null);
    }
  };

  // MISE À JOUR MANUELLE DE LA POSITION (X, Y)
  const updateItemPosition = (id: string, newX: number, newY: number) => {
    if (isNaN(newX) || isNaN(newY)) return;
    const x = Math.max(0.1, Math.min(newX, L - 0.1));
    const y = Math.max(0.1, Math.min(newY, W - 0.1));
    setItems(items.map(item => item.id === id ? { ...item, x, y } : item));
  };

  // MOTEUR DE DRAG & DROP CORRIGÉ (Matrice SVG Parfaite)
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingId || !svgRef.current) return;
    const svg = svgRef.current;
    
    // Création d'un point SVG pour transformer les pixels de l'écran en mètres (IT 246)
    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPt = pt.matrixTransform(CTM.inverse());
    
    // Limites des murs
    const x = Math.max(0.2, Math.min(cursorPt.x, L - 0.2));
    const y = Math.max(0.2, Math.min(cursorPt.y, W - 0.2));

    setItems(items.map(item => item.id === draggingId ? { ...item, x, y } : item));
  };

  // CALCULS DE COTATIONS ET SÉCURITÉ IT 246
  let ruleErrors: string[] = [];
  const amenees = items.filter(i => i.type === 'aa');
  const extractions = items.filter(i => i.type === 'ex');
  const portes = items.filter(i => i.type === 'porte');

  const cotations: { x1: number; y1: number; x2: number; y2: number; dist: number; isValid: boolean }[] = [];

  // Règle 1 : Portes
  portes.forEach(porte => {
    let nearest = { dist: Infinity, x: 0, y: 0 };
    [...amenees, ...extractions].forEach(bouche => {
      const dist = Math.hypot(porte.x - bouche.x, porte.y - bouche.y);
      if (dist < nearest.dist) nearest = { dist, x: bouche.x, y: bouche.y };
    });

    if (nearest.dist !== Infinity) {
      const isValid = nearest.dist <= maxDistPorte;
      cotations.push({ x1: porte.x, y1: porte.y, x2: nearest.x, y2: nearest.y, dist: nearest.dist, isValid });
      if (!isValid && !ruleErrors.includes("Porte à plus de 5m d'une bouche.")) ruleErrors.push("Porte à plus de 5m d'une bouche.");
    }
  });

  // Règle 2 : Circulations
  if (isCirc && amenees.length > 0 && extractions.length > 0) {
    extractions.forEach(ex => {
      let nearestAa = { dist: Infinity, x: 0, y: 0 };
      amenees.forEach(aa => {
        const dist = Math.hypot(ex.x - aa.x, ex.y - aa.y);
        if (dist < nearestAa.dist) nearestAa = { dist, x: aa.x, y: aa.y };
      });
      if (nearestAa.dist !== Infinity) {
        const isValid = nearestAa.dist <= maxDistCirculation;
        cotations.push({ x1: ex.x, y1: ex.y, x2: nearestAa.x, y2: nearestAa.y, dist: nearestAa.dist, isValid });
        if (!isValid && !ruleErrors.includes(`Distance max dépassée (${maxDistCirculation}m).`)) ruleErrors.push(`Distance max dépassée (${maxDistCirculation}m).`);
      }
    });
  }

  if (extractions.length === 0) ruleErrors.push("Grille d'extraction manquante.");
  if (amenees.length === 0 && !isCirc) ruleErrors.push("Amenée d'air manquante.");

  const isValid = ruleErrors.length === 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col font-sans">
      
      {/* HEADER COMPACT */}
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-amber-400" />
          <h3 className="text-white font-bold text-xs tracking-wide uppercase">Plan & Validation IT 246</h3>
        </div>
        
        <div className="flex bg-slate-900 rounded p-0.5">
          <button onClick={() => setView('plan')} className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all ${view === 'plan' ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:text-white'}`}>CAO 2D</button>
          <button onClick={() => setView('coupe')} className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all ${view === 'coupe' ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:text-white'}`}>Coupe</button>
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-slate-50">
        {view === 'coupe' && (
          <div className="p-6 flex-1 flex flex-col items-center justify-center animate-in fade-in">
            <div className="relative w-full max-w-2xl h-[300px] bg-white border border-slate-300 rounded-lg overflow-hidden shadow-inner flex flex-col">
              <div style={{ height: `${(smokeE / H) * 100}%` }} className="w-full bg-slate-700/90 border-b-[3px] border-amber-500 relative flex items-center justify-center">
                <div className="absolute top-2 left-3 text-slate-300 text-[10px] font-mono">Plafond : +{H.toFixed(2)}m</div>
                <div className="text-center">
                  <span className="text-white/80 font-bold uppercase text-xs tracking-widest">Couche de Fumées</span>
                  <div className="text-amber-400 font-mono text-[10px] mt-0.5">Ef = {smokeE.toFixed(2)} m</div>
                </div>
              </div>
              <div style={{ height: `${(clearH / H) * 100}%` }} className="w-full bg-blue-50 relative flex items-center justify-center">
                <div className="absolute top-2 left-3 text-blue-800/60 text-[10px] font-mono">Retombée : +{clearH.toFixed(2)}m</div>
                <div className="text-center">
                  <span className="text-blue-900/60 font-bold uppercase text-xs tracking-widest">Zone Libre</span>
                  <div className="text-blue-600 font-mono text-[10px] mt-0.5">H' = {clearH.toFixed(2)} m</div>
                </div>
                <div className="absolute bottom-2 left-3 text-slate-400 text-[10px] font-mono">Plancher : ±0.00m</div>
              </div>
            </div>
          </div>
        )}

        {view === 'plan' && (
          <div className="flex flex-col flex-1 h-full animate-in fade-in">
            
            {/* TOOLBAR CAO AVEC PRÉCISION ET SAISIE MANUELLE */}
            <div className="bg-white border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-3 shadow-sm z-10">
              
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-2"><Plus className="w-3 h-3 inline pb-0.5"/> Insérer</span>
                <button onClick={() => addItem('aa')} className="px-2 py-1 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 text-[10px] font-bold rounded shadow-sm transition-colors">AA</button>
                <button onClick={() => addItem('ex')} className="px-2 py-1 bg-white border border-slate-300 hover:border-rose-500 hover:text-rose-700 text-slate-700 text-[10px] font-bold rounded shadow-sm transition-colors">EX</button>
                <button onClick={() => addItem('porte')} className="px-2 py-1 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-slate-700 text-[10px] font-bold rounded shadow-sm transition-colors">Porte</button>
              </div>

              {/* PANNEAU DE COORDONNÉES EXACTES (LE VRAI OUTIL D'INGÉNIEUR) */}
              <div className="flex-1 flex items-center justify-center border-x border-slate-100 px-4 min-w-[250px]">
                {selectedItem ? (
                  <div className="flex items-center gap-3 bg-amber-50 px-3 py-1 rounded border border-amber-200 animate-in fade-in">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 uppercase"><LocateFixed className="w-3 h-3" /> Position</span>
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] font-bold text-slate-500">X:</label>
                      <input 
                        type="number" step="0.1" value={selectedItem.x.toFixed(1)} 
                        onChange={(e) => updateItemPosition(selectedItem.id, parseFloat(e.target.value), selectedItem.y)}
                        className="w-14 h-6 text-xs text-center font-mono font-bold bg-white border border-slate-300 rounded focus:border-amber-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-400">m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] font-bold text-slate-500">Y:</label>
                      <input 
                        type="number" step="0.1" value={selectedItem.y.toFixed(1)} 
                        onChange={(e) => updateItemPosition(selectedItem.id, selectedItem.x, parseFloat(e.target.value))}
                        className="w-14 h-6 text-xs text-center font-mono font-bold bg-white border border-slate-300 rounded focus:border-amber-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-400">m</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><MousePointer2 className="w-3 h-3" /> Cliquez sur un élément pour régler ses coordonnées exactes</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isCirc && (
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={isRectiligne} onChange={(e) => setIsRectiligne(e.target.checked)} className="accent-slate-700 w-3 h-3" />
                    Rectiligne
                  </label>
                )}
                <button 
                  onClick={deleteSelected} disabled={!selectedId}
                  className={`flex items-center gap-1 px-2 py-1 border text-[10px] font-bold rounded transition-colors ${selectedId ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                >
                  <Trash2 className="w-3 h-3" /> Supprimer
                 </button>
              </div>
            </div>

            {/* STATUS IT 246 (DISCRET ET EFFICACE) */}
            <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b ${isValid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
              {isValid ? (
                <><CheckCircle className="w-3.5 h-3.5" /> Conformité IT 246 Validée</>
              ) : (
                <><AlertTriangle className="w-3.5 h-3.5" /> Erreurs : {ruleErrors.join(" | ")}</>
              )}
            </div>

            {/* DESSIN CAO INTERACTIF */}
            <div className="relative w-full bg-[#f8fafc] overflow-hidden flex-1 min-h-[450px]">
              <div className="absolute inset-4 flex items-center justify-center">
                
                {/* L'ÉVÉNEMENT DE SOURIS EST MAINTENANT SUR LE SVG POUR UNE PRÉCISION ABSOLUE */}
                <svg 
                  ref={svgRef} 
                  viewBox={`0 0 ${L} ${W}`} 
                  className="w-full h-full max-h-full drop-shadow-sm cursor-crosshair" 
                  preserveAspectRatio="xMidYMid meet" 
                  style={{ overflow: 'visible' }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={() => setDraggingId(null)}
                  onMouseLeave={() => setDraggingId(null)}
                  onClick={(e) => { if (e.target === svgRef.current) setSelectedId(null); }}
                >
                  
                  {/* FOND DU LOCAL / QUADRILLAGE */}
                  <defs>
                    <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                      <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#cbd5e1" strokeWidth="0.05" strokeDasharray="0.1, 0.1"/>
                    </pattern>
                  </defs>
                  {/* Mur extérieur du local */}
                  <rect width={L} height={W} fill="url(#grid)" stroke="#64748b" strokeWidth="0.1" />

                  {/* RAYONS D'ACTION (Zone jaune discrète) */}
                  {!isCirc && extractions.map(ex => (
                    <g key={`radius-${ex.id}`} className="pointer-events-none">
                      <circle cx={ex.x} cy={ex.y} r={maxDistLocal} fill="rgba(252, 211, 77, 0.08)" stroke="#fbbf24" strokeWidth="0.04" strokeDasharray="0.2, 0.2"/>
                    </g>
                  ))}

                  {/* LIGNES DE COTES DYNAMIQUES (Style plan d'archi) */}
                  {cotations.map((cote, index) => {
                    const midX = (cote.x1 + cote.x2) / 2;
                    const midY = (cote.y1 + cote.y2) / 2;
                    const color = cote.isValid ? '#64748b' : '#f43f5e'; 
                    
                    return (
                      <g key={`cote-${index}`} className="pointer-events-none">
                        <line x1={cote.x1} y1={cote.y1} x2={cote.x2} y2={cote.y2} stroke={color} strokeWidth="0.04" strokeDasharray="0.15, 0.15" />
                        <rect x={midX - 0.5} y={midY - 0.2} width="1.0" height="0.4" fill="white" rx="0.05" opacity="0.9" />
                        <text x={midX} y={midY + 0.12} fontSize="0.28" fill={color} textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                          {cote.dist.toFixed(1)}m
                        </text>
                      </g>
                    );
                  })}

                  {/* ÉLÉMENTS DU PLAN */}
                  {items.map(item => {
                    const isSelected = item.id === selectedId;
                    
                    return (
                      <g 
                        key={item.id} 
                        transform={`translate(${item.x}, ${item.y})`} 
                        onMouseDown={(e) => { e.stopPropagation(); setDraggingId(item.id); setSelectedId(item.id); }}
                        className={`transition-transform duration-75 ease-out ${draggingId === item.id ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-110'}`}
                      >
                        {/* Halo de sélection */}
                        {isSelected && <circle cx="0" cy="0" r="0.8" fill="rgba(14, 165, 233, 0.1)" stroke="#0ea5e9" strokeWidth="0.06" strokeDasharray="0.1, 0.1" />}
                        
                        {item.type === 'porte' && (
                          <>
                            <rect x="-0.8" y="-0.15" width="1.6" height="0.3" fill={isSelected ? '#0284c7' : '#94a3b8'} rx="0.05" />
                            <text x="0" y="0.08" fontSize="0.18" fill="white" textAnchor="middle" fontWeight="bold" letterSpacing="0.05">PORTE</text>
                          </>
                        )}
                        
                        {item.type === 'aa' && (
                          <>
                            <rect x="-0.5" y="-0.5" width="1.0" height="1.0" fill={isSelected ? '#059669' : '#10b981'} rx="0.1" />
                            <text x="0" y="0.15" fontSize="0.4" fill="white" textAnchor="middle" fontWeight="bold">AA</text>
                          </>
                        )}
                        
                        {item.type === 'ex' && (
                          <>
                            <rect x="-0.5" y="-0.5" width="1.0" height="1.0" fill={isSelected ? '#e11d48' : '#f43f5e'} rx="0.1" />
                            <text x="0" y="0.15" fontSize="0.4" fill="white" textAnchor="middle" fontWeight="bold">EX</text>
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* STATUS BAR INFÉRIEURE */}
            <div className="bg-slate-100 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-slate-700 font-bold"><Ruler className="w-3 h-3"/> {L}m x {W}m</span>
                <span className="text-slate-300">|</span>
                {!isCirc ? (
                  <span className="text-amber-600 font-bold">Rayon Max EX: {maxDistLocal.toFixed(1)}m</span>
                ) : (
                  <span className="text-slate-600 font-bold">Règle IT246: {maxDistCirculation}m max</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Move className="w-3 h-3" /> Maintien clic pour glisser, ou saisie manuelle.
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
