import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, Wind, ArrowUpFromLine, Plus } from 'lucide-react';
import { RoomInput, CalculationResult } from '../types/desenfumage';

interface Props {
  room: RoomInput;
  calc: CalculationResult;
}

type CanvasItem = { id: string; x: number; y: number };

export const SchematicDiagram: React.FC<Props> = ({ room, calc }) => {
  const [view, setView] = useState<'plan' | 'coupe'>('plan'); // Vue plan par défaut maintenant

  // Dimensions
  const H = room.ceilingHeight || 3;
  const L = room.length || 10;
  const W = room.width || 10;
  
  const clearH = calc?.cantonment?.clearHeightM || (H / 2);
  const smokeE = calc?.cantonment?.smokeLayerThicknessM || (H - clearH);

  // MOTEUR DE RÈGLES IT 246
  const isMech = room.mode === 'mecanique';
  const isCirc = room.spaceKind === 'circulation';
  const maxDistanceRule = isCirc ? (isMech ? 15 : 10) : (isMech ? (4 * H) : Math.min(30, 4 * H));

  // ÉTAT DU PLAN INTERACTIF (Tableaux dynamiques pour ajouter autant d'éléments que l'on veut)
  const [amenees, setAmenees] = useState<CanvasItem[]>([{ id: 'aa1', x: 2, y: W / 2 }]);
  const [extractions, setExtractions] = useState<CanvasItem[]>([{ id: 'ex1', x: L - 2, y: W / 2 }]);
  const [portes, setPortes] = useState<CanvasItem[]>([{ id: 'p1', x: L / 2, y: W - 0.5 }]);

  // OUTILS D'AJOUT
  const addAmenee = () => setAmenees([...amenees, { id: `aa-${Date.now()}`, x: L / 2, y: W / 2 }]);
  const addExtraction = () => setExtractions([...extractions, { id: `ex-${Date.now()}`, x: L / 2 + 1, y: W / 2 }]);
  const addPorte = () => setPortes([...portes, { id: `p-${Date.now()}`, x: L / 2, y: W - 0.5 }]);

  // OUTILS DE SUPPRESSION (Double-clic)
  const removeAmenee = (id: string) => setAmenees(amenees.filter(a => a.id !== id));
  const removeExtraction = (id: string) => setExtractions(extractions.filter(e => e.id !== id));
  const removePorte = (id: string) => setPortes(portes.filter(p => p.id !== id));

  // GESTION DU GLISSER-DÉPOSER
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{ type: 'aa' | 'ex' | 'porte'; id: string } | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * L;
    let y = ((e.clientY - rect.top) / rect.height) * W;
    x = Math.max(0.5, Math.min(x, L - 0.5));
    y = Math.max(0.5, Math.min(y, W - 0.5));

    if (dragging.type === 'aa') setAmenees(prev => prev.map(item => item.id === dragging.id ? { ...item, x, y } : item));
    if (dragging.type === 'ex') setExtractions(prev => prev.map(item => item.id === dragging.id ? { ...item, x, y } : item));
    if (dragging.type === 'porte') setPortes(prev => prev.map(item => item.id === dragging.id ? { ...item, x, y } : item));
  };

  // CALCULS DE SÉCURITÉ IT 246 (Temps réel)
  let ruleErrors: string[] = [];
  
  // 1. Règle des 5 mètres (Portes)
  portes.forEach(porte => {
    let minDist = Infinity;
    amenees.forEach(a => minDist = Math.min(minDist, Math.hypot(porte.x - a.x, porte.y - a.y)));
    extractions.forEach(e => minDist = Math.min(minDist, Math.hypot(porte.x - e.x, porte.y - e.y)));
    if (minDist > 5) {
      if (!ruleErrors.includes("Une porte est à plus de 5m d'une bouche (Règle IT 246 non respectée).")) {
        ruleErrors.push("Une porte est à plus de 5m d'une bouche (Règle IT 246 non respectée).");
      }
    }
  });

  // 2. Règle de distance maximale entre grilles
  let distanceMaxObservee = 0;
  extractions.forEach(ex => {
    let minDistToAa = Infinity;
    amenees.forEach(aa => minDistToAa = Math.min(minDistToAa, Math.hypot(ex.x - aa.x, ex.y - aa.y)));
    if (minDistToAa !== Infinity) distanceMaxObservee = Math.max(distanceMaxObservee, minDistToAa);
  });

  if (distanceMaxObservee > maxDistanceRule) {
    ruleErrors.push(`Distance entre grilles trop grande : ${distanceMaxObservee.toFixed(1)}m (Max autorisé : ${maxDistanceRule}m).`);
  }
  if (extractions.length === 0) ruleErrors.push("Il manque au moins une grille d'extraction.");
  if (amenees.length === 0) ruleErrors.push("Il manque au moins une amenée d'air.");

  const isValid = ruleErrors.length === 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* EN-TÊTE DU MODULE */}
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
            Vue en Plan (Interactif)
          </button>
          <button onClick={() => setView('coupe')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'coupe' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-300 hover:text-white'}`}>
            Vue en Coupe
          </button>
        </div>
      </div>

      <div className="p-6 bg-slate-50 relative">
        {view === 'coupe' && (
          <div className="space-y-4 animate-in fade-in duration-300">
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
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* PANNEAU D'ALERTE */}
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

            {/* CASIER / BOÎTE À OUTILS */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-700">Ajouter :</span>
              <button onClick={addAmenee} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition-colors border border-emerald-200">
                <Plus className="w-3 h-3" /> Amenée d'air (AA)
              </button>
              <button onClick={addExtraction} className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-lg transition-colors border border-rose-200">
                <Plus className="w-3 h-3" /> Extraction (EX)
              </button>
              <button onClick={addPorte} className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold rounded-lg transition-colors border border-blue-200">
                <Plus className="w-3 h-3" /> Porte
              </button>
              <span className="text-[10px] text-slate-400 italic ml-auto hidden sm:block">Double-clic sur un élément pour le supprimer.</span>
            </div>

            {/* DESSIN CAO INTERACTIF */}
            <div 
              className="relative w-full bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-inner cursor-crosshair"
              style={{ aspectRatio: L / W, maxHeight: '500px' }}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setDragging(null)}
              onMouseLeave={() => setDragging(null)}
            >
              <svg ref={svgRef} viewBox={`0 0 ${L} ${W}`} className="w-full h-full" preserveAspectRatio="none">
                <defs><pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M 1 0 L 0 0 0 1" fill="none" stroke="#e2e8f0" strokeWidth="0.05"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* DESSIN DES PORTES (Bleu) */}
                {portes.map(p => (
                  <g key={p.id} transform={`translate(${p.x}, ${p.y})`} onMouseDown={() => setDragging({ type: 'porte', id: p.id })} onDoubleClick={() => removePorte(p.id)} className="cursor-grab hover:scale-110 transition-transform">
                    <rect x="-0.8" y="-0.2" width="1.6" height="0.4" fill="#3b82f6" rx="0.1" />
                    <text x="0" y="0.1" fontSize="0.3" fill="white" textAnchor="middle" fontWeight="bold">PORTE</text>
                  </g>
                ))}

                {/* DESSIN AMENÉES D'AIR (Vert) */}
                {amenees.map(aa => (
                  <g key={aa.id} transform={`translate(${aa.x}, ${aa.y})`} onMouseDown={() => setDragging({ type: 'aa', id: aa.id })} onDoubleClick={() => removeAmenee(aa.id)} className="cursor-grab hover:scale-110 transition-transform">
                    <rect x="-0.6" y="-0.6" width="1.2" height="1.2" fill="#10b981" rx="0.2" />
                    <text x="0" y="0.2" fontSize="0.5" fill="white" textAnchor="middle" fontWeight="bold">AA</text>
                  </g>
                ))}

                {/* DESSIN EXTRACTIONS (Rouge) */}
                {extractions.map(ex => (
                  <g key={ex.id} transform={`translate(${ex.x}, ${ex.y})`} onMouseDown={() => setDragging({ type: 'ex', id: ex.id })} onDoubleClick={() => removeExtraction(ex.id)} className="cursor-grab hover:scale-110 transition-transform">
                    <circle cx="0" cy="0" r={maxDistanceRule} fill="none" stroke={isValid ? '#fcd34d' : '#f43f5e'} strokeWidth="0.05" strokeDasharray="0.2, 0.2" opacity="0.5"/>
                    <rect x="-0.6" y="-0.6" width="1.2" height="1.2" fill="#f43f5e" rx="0.2" />
                    <text x="0" y="0.2" fontSize="0.5" fill="white" textAnchor="middle" fontWeight="bold">EX</text>
                  </g>
                ))}
              </svg>

              <div className="absolute bottom-2 right-4 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-slate-600 border border-slate-200">
                Pièce : {L}m x {W}m
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
