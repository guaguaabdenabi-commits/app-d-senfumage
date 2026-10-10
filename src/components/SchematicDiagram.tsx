import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, Wind, Plus, Trash2 } from 'lucide-react';
import { RoomInput, CalculationResult } from '../types/desenfumage';

interface Props {
  room: RoomInput;
  calc: CalculationResult;
}

type CanvasItem = { id: string; x: number; y: number; type: 'aa' | 'ex' | 'porte' };

export const SchematicDiagram: React.FC<Props> = ({ room, calc }) => {
  const [view, setView] = useState<'plan' | 'coupe'>('plan');

  // Dimensions
  const H = room.ceilingHeight || 3;
  const L = room.length || 10;
  const W = room.width || 10;
  
  const clearH = calc?.cantonment?.clearHeightM || (H / 2);
  const smokeE = calc?.cantonment?.smokeLayerThicknessM || (H - clearH);

  // MOTEUR IT 246
  const isMech = room.mode === 'mecanique';
  const isCirc = room.spaceKind === 'circulation';
  const maxDistCirculation = isCirc ? (isMech ? 15 : 10) : 0;
  const maxDistLocal = isMech ? (4 * H) : Math.min(30, 4 * H);
  const maxDistPorte = 5;

  // GESTION DES ÉLÉMENTS (Sauvegardés)
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

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  // AJOUT ET SUPPRESSION SIMPLES
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

  // MOTEUR DE DRAG & DROP SANS SAUTS (Méthode Pourcentage)
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !wrapperRef.current) return;
    
    const rect = wrapperRef.current.getBoundingClientRect();
    const percentX = (e.clientX - rect.left) / rect.width;
    const percentY = (e.clientY - rect.top) / rect.height;
    
    let x = percentX * L;
    let y = percentY * W;

    x = Math.max(0.5, Math.min(x, L - 0.5));
    y = Math.max(0.5, Math.min(y, W - 0.5));

    setItems(items.map(item => item.id === draggingId ? { ...item, x, y } : item));
  };

  // CALCULS IT 246 ET COTATIONS
  let ruleErrors: string[] = [];
  const amenees = items.filter(i => i.type === 'aa');
  const extractions = items.filter(i => i.type === 'ex');
  const portes = items.filter(i => i.type === 'porte');

  const cotations: { x1: number; y1: number; x2: number; y2: number; dist: number; isValid: boolean }[] = [];

  // Règle 1 : Portes (Max 5m)
  portes.forEach(porte => {
    let nearest = { dist: Infinity, x: 0, y: 0 };
    [...amenees, ...extractions].forEach(bouche => {
      const dist = Math.hypot(porte.x - bouche.x, porte.y - bouche.y);
      if (dist < nearest.dist) nearest = { dist, x: bouche.x, y: bouche.y };
    });

    if (nearest.dist !== Infinity) {
      const isValid = nearest.dist <= maxDistPorte;
      cotations.push({ x1: porte.x, y1: porte.y, x2: nearest.x, y2: nearest.y, dist: nearest.dist, isValid });
      if (!isValid && !ruleErrors.includes("Une porte est à plus de 5m d'une bouche (Règle IT 246).")) {
        ruleErrors.push("Une porte est à plus de 5m d'une bouche (Règle IT 246).");
      }
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
        if (!isValid && !ruleErrors.includes(`Distance entre grilles trop grande (Max: ${maxDistCirculation}m).`)) {
          ruleErrors.push(`Distance entre grilles trop grande (Max: ${maxDistCirculation}m).`);
        }
      }
    });
  }

  if (extractions.length === 0) ruleErrors.push("Il manque au moins une grille d'extraction.");
  if (amenees.length === 0 && !isCirc) ruleErrors.push("Il manque au moins une amenée d'air.");

  const isValid = ruleErrors.length === 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      
      {/* HEADER NOIR (FORT ET LISIBLE) */}
      <div className="bg-slate-900 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Wind className="w-5 h-5 text-amber-400" />
            Module CAO & Validation IT 246
          </h3>
          <p className="text-slate-400 text-xs mt-1">Conception Géométrique et Aéraulique</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setView('plan')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'plan' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-300 hover:text-white'}`}>
            Vue en Plan
          </button>
          <button onClick={() => setView('coupe')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'coupe' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-300 hover:text-white'}`}>
            Vue en Coupe
          </button>
        </div>
      </div>

      <div className="p-6 bg-slate-50 relative flex-1 flex flex-col">
        {view === 'coupe' && (
          <div className="space-y-4 animate-in fade-in duration-300 w-full">
            <div className="flex items-center gap-2 mb-4"><Info className="w-4 h-4 text-blue-600" /><span className="text-sm font-bold text-slate-700">Coupe de principe - Hauteurs réglementaires</span></div>
            <div className="relative w-full h-[300px] bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-inner flex flex-col">
              <div style={{ height: `${(smokeE / H) * 100}%` }} className="w-full bg-slate-700 opacity-90 border-b-4 border-amber-500 relative flex items-center justify-center transition-all duration-500">
                <div className="absolute top-2 left-4 text-slate-300 text-xs font-bold font-mono">Plafond : +{H.toFixed(2)}m</div>
                <div className="text-center">
                  <span className="text-white font-black tracking-widest uppercase text-sm sm:text-lg opacity-80">Couche de Fumées</span>
                  <div className="text-amber-400 font-mono font-bold text-xs mt-1">Épaisseur (Ef) = {smokeE.toFixed(2)} m</div>
                </div>
              </div>
              <div style={{ height: `${(clearH / H) * 100}%` }} className="w-full bg-blue-50/50 relative flex items-center justify-center transition-all duration-500">
                <div className="absolute top-2 left-4 text-blue-800 text-xs font-bold font-mono">Retombée : +{clearH.toFixed(2)}m</div>
                <div className="text-center">
                  <span className="text-blue-900 font-black tracking-widest uppercase text-sm sm:text-lg opacity-80">Zone Libre (Air Frais)</span>
                  <div className="text-blue-600 font-mono font-bold text-xs mt-1">Hauteur Libre (H') = {clearH.toFixed(2)} m</div>
                </div>
                <div className="absolute bottom-2 left-4 text-slate-500 text-xs font-bold font-mono">Plancher : ±0.00m</div>
              </div>
            </div>
          </div>
        )}

        {view === 'plan' && (
          <div className="flex flex-col h-full animate-in fade-in duration-300 gap-4">
            
            {/* PANNEAU D'ALERTE (GRAND ET CLAIR) */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-colors ${isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="flex items-start gap-3">
                {isValid ? <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />}
                <div>
                  <h4 className={`font-bold text-sm ${isValid ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {isValid ? 'Implantation Validée (Conforme IT 246)' : 'Non-Conformité IT 246 Détectée !'}
                  </h4>
                  {isValid ? (
                    <p className="text-xs mt-0.5 text-emerald-700">Toutes les distances de sécurité (Grilles et Portes) sont respectées.</p>
                  ) : (
                    <ul className="text-xs mt-1 text-rose-700 list-disc pl-4">
                      {ruleErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* BARRE D'OUTILS (SIMPLE ET FORTE) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 mr-2">Ajouter :</span>
                <button onClick={() => addItem('aa')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition-colors border border-emerald-200">
                  <Plus className="w-3 h-3" /> Amenée d'air (AA)
                </button>
                <button onClick={() => addItem('ex')} className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-lg transition-colors border border-rose-200">
                  <Plus className="w-3 h-3" /> Extraction (EX)
                </button>
                <button onClick={() => addItem('porte')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold rounded-lg transition-colors border border-blue-200">
                  <Plus className="w-3 h-3" /> Porte
                </button>
              </div>

              {/* BOUTON SUPPRIMER CLAIR */}
              <div className="flex items-center">
                {selectedId ? (
                  <button onClick={deleteSelected} className="flex items-center gap-1 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors">
                    <Trash2 className="w-4 h-4" /> Supprimer la sélection
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    Cliquez sur un élément sur le plan pour le supprimer
                  </span>
                )}
              </div>
            </div>

            {/* DESSIN CAO INTERACTIF (BLOC FIXE) */}
            <div 
              ref={wrapperRef}
              className="relative w-full h-[500px] bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-inner cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseUp={() => setDraggingId(null)}
              onMouseLeave={() => setDraggingId(null)}
              onClick={(e) => { 
                if (e.target === wrapperRef.current || (e.target as any).tagName === 'svg' || (e.target as any).tagName === 'rect') setSelectedId(null); 
              }}
            >
              <svg viewBox={`0 0 ${L} ${W}`} className="w-full h-full" preserveAspectRatio="none">
                
                {/* QUADRILLAGE */}
                <defs>
                  <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                    <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#e2e8f0" strokeWidth="0.05"/>
                  </pattern>
                </defs>
                <rect width={L} height={W} fill="url(#grid)" />

                {/* RAYONS D'ACTION (Zone jaune pour Locaux) */}
                {!isCirc && extractions.map(ex => (
                  <g key={`radius-${ex.id}`} className="pointer-events-none">
                    <circle cx={ex.x} cy={ex.y} r={maxDistLocal} fill="rgba(252, 211, 77, 0.15)" stroke="#fbbf24" strokeWidth="0.05" strokeDasharray="0.2, 0.2"/>
                  </g>
                ))}

                {/* LIGNES DE COTES IT 246 */}
                {cotations.map((cote, index) => {
                  const midX = (cote.x1 + cote.x2) / 2;
                  const midY = (cote.y1 + cote.y2) / 2;
                  const color = cote.isValid ? '#10b981' : '#f43f5e';
                  
                  return (
                    <g key={`cote-${index}`} className="pointer-events-none">
                      <line x1={cote.x1} y1={cote.y1} x2={cote.x2} y2={cote.y2} stroke={color} strokeWidth="0.06" strokeDasharray="0.2, 0.2" />
                      <rect x={midX - 0.7} y={midY - 0.3} width="1.4" height="0.6" fill="white" rx="0.1" opacity="0.9" />
                      <text x={midX} y={midY + 0.15} fontSize="0.35" fill={color} textAnchor="middle" fontWeight="bold">
                        {cote.dist.toFixed(1)} m
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
                      className={`transition-transform duration-75 ${draggingId === item.id ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-110'}`}
                    >
                      {/* Halo de sélection */}
                      {isSelected && <circle cx="0" cy="0" r="1.2" fill="none" stroke="#3b82f6" strokeWidth="0.1" strokeDasharray="0.2, 0.2" className="animate-[spin_4s_linear_infinite]" />}
                      
                      {item.type === 'porte' && (
                        <>
                          <rect x="-0.8" y="-0.2" width="1.6" height="0.4" fill={isSelected ? '#2563eb' : '#3b82f6'} rx="0.1" />
                          <text x="0" y="0.1" fontSize="0.25" fill="white" textAnchor="middle" fontWeight="bold">PORTE</text>
                        </>
                      )}
                      
                      {item.type === 'aa' && (
                        <>
                          <rect x="-0.6" y="-0.6" width="1.2" height="1.2" fill={isSelected ? '#059669' : '#10b981'} rx="0.2" />
                          <text x="0" y="0.2" fontSize="0.5" fill="white" textAnchor="middle" fontWeight="bold">AA</text>
                        </>
                      )}
                      
                      {item.type === 'ex' && (
                        <>
                          <rect x="-0.6" y="-0.6" width="1.2" height="1.2" fill={isSelected ? '#e11d48' : '#f43f5e'} rx="0.2" />
                          <text x="0" y="0.2" fontSize="0.5" fill="white" textAnchor="middle" fontWeight="bold">EX</text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* LA LÉGENDE EST MAINTENANT TOTALEMENT SÉPARÉE (EN DESSOUS DU DESSIN) */}
            <div className="bg-white border-2 border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between text-xs font-bold shadow-sm">
              <span className="text-slate-600 uppercase tracking-wider">Dimensions : {L}m x {W}m</span>
              {!isCirc ? (
                <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded border border-amber-200">
                  Rayon d'action EX (4H) : {maxDistLocal.toFixed(1)}m
                </span>
              ) : (
                <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded border border-amber-200">
                  Distance max entre grilles : {maxDistCirculation}m
                </span>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};
