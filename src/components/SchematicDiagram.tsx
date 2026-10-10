import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, Wind, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { RoomInput, CalculationResult } from '../types/desenfumage';

interface Props {
  room: RoomInput;
  calc: CalculationResult;
}

export const SchematicDiagram: React.FC<Props> = ({ room, calc }) => {
  const [view, setView] = useState<'plan' | 'coupe'>('coupe');

  // Sécurisation des valeurs géométriques (Correction des NaN)
  const H = room.ceilingHeight || 3;
  const L = room.length || 10;
  const W = room.width || 10;
  
  // Extraction sécurisée des calculs
  const clearH = calc?.cantonment?.clearHeightM || (H / 2);
  const smokeE = calc?.cantonment?.smokeLayerThicknessM || (H - clearH);

  // MOTEUR DE RÈGLES IT 246 (Issu du PDF - Figures 4, 5, 6)
  const isMech = room.mode === 'mecanique';
  const isCirc = room.spaceKind === 'circulation';
  
  let maxDistanceRule = 0;
  let ruleReference = "";

  if (isCirc) {
    // Règles pour les circulations (Couloirs)
    maxDistanceRule = isMech ? 15 : 10;
    ruleReference = `Distance max entre Amenée et Extraction : ${maxDistanceRule}m (IT 246 - Art. ${isMech ? '6.2' : '6.1'})`;
  } else {
    // Règles pour les locaux
    maxDistanceRule = isMech ? (4 * H) : Math.min(30, 4 * H);
    ruleReference = `Distance max d'un point à l'extraction : ${maxDistanceRule.toFixed(1)}m (IT 246 - Art. ${isMech ? '7.2.2' : '7.1.3'})`;
  }

  // ÉTAT DU PLAN INTERACTIF (Positions des grilles en mètres)
  const [posAmenee, setPosAmenee] = useState({ x: 2, y: W / 2 });
  const [posExtraction, setPosExtraction] = useState({ x: L - 2, y: W / 2 });
  
  // Calcul de la distance en temps réel par théorème de Pythagore
  const currentDistance = Math.sqrt(Math.pow(posExtraction.x - posAmenee.x, 2) + Math.pow(posExtraction.y - posAmenee.y, 2));
  const isDistanceValid = currentDistance <= maxDistanceRule;

  // Gestion du Glisser-Déposer (Drag & Drop) simple sur le plan
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingItem, setDraggingItem] = useState<'amenee' | 'extraction' | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingItem || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    // Conversion des pixels de la souris en mètres dans la pièce
    let x = ((e.clientX - rect.left) / rect.width) * L;
    let y = ((e.clientY - rect.top) / rect.height) * W;

    // Limiter aux bords de la pièce
    x = Math.max(0.5, Math.min(x, L - 0.5));
    y = Math.max(0.5, Math.min(y, W - 0.5));

    if (draggingItem === 'amenee') setPosAmenee({ x, y });
    if (draggingItem === 'extraction') setPosExtraction({ x, y });
  };

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
        
        {/* BOUTONS DE BASCULE PLAN / COUPE */}
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setView('coupe')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'coupe' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-300 hover:text-white'}`}
          >
            Vue en Coupe
          </button>
          <button 
            onClick={() => setView('plan')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'plan' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-300 hover:text-white'}`}
          >
            Vue en Plan (Interactif)
          </button>
        </div>
      </div>

      {/* ZONE DE DESSIN */}
      <div className="p-6 bg-slate-50 relative">
        
        {view === 'coupe' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-700">Coupe de principe - Hauteurs réglementaires</span>
            </div>

            <div className="relative w-full h-[300px] bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-inner flex flex-col">
              {/* COUCHE DE FUMÉE (HAUT) */}
              <div 
                style={{ height: `${(smokeE / H) * 100}%` }}
                className="w-full bg-slate-700 opacity-90 border-b-4 border-amber-500 relative flex items-center justify-center transition-all duration-500"
              >
                <div className="absolute top-2 left-4 text-slate-300 text-xs font-bold font-mono">Plafond : +{H.toFixed(2)}m</div>
                <div className="text-center">
                  <span className="text-white font-black tracking-widest uppercase text-sm sm:text-lg opacity-80">Couche de Fumées</span>
                  <div className="text-amber-400 font-mono font-bold text-xs mt-1">Épaisseur (Ef) = {smokeE.toFixed(2)} m</div>
                </div>
                
                {/* ICONES D'ÉVACUATION */}
                <div className="absolute top-0 right-1/4 w-12 h-4 bg-rose-500 rounded-b-md flex items-center justify-center shadow-lg">
                  <ArrowUpFromLine className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* ZONE LIBRE (BAS) */}
              <div 
                style={{ height: `${(clearH / H) * 100}%` }}
                className="w-full bg-blue-50/50 relative flex items-center justify-center transition-all duration-500"
              >
                <div className="absolute top-2 left-4 text-blue-800 text-xs font-bold font-mono">Retombée : +{clearH.toFixed(2)}m</div>
                <div className="text-center">
                  <span className="text-blue-900 font-black tracking-widest uppercase text-sm sm:text-lg opacity-80">Zone Libre (Air Frais)</span>
                  <div className="text-blue-600 font-mono font-bold text-xs mt-1">Hauteur Libre (H') = {clearH.toFixed(2)} m</div>
                </div>

                {/* ICONE AMENÉE D'AIR */}
                <div className="absolute bottom-0 left-1/4 w-4 h-12 bg-emerald-500 rounded-t-md flex items-center justify-center shadow-lg">
                  <ArrowUpFromLine className="w-3 h-3 text-white" />
                </div>
                <div className="absolute bottom-2 left-4 text-slate-500 text-xs font-bold font-mono">Plancher : ±0.00m</div>
              </div>
            </div>
          </div>
        )}

        {view === 'plan' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* PANNEAU D'ALERTE IT 246 */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-colors ${isDistanceValid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="flex items-start gap-3">
                {isDistanceValid ? <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />}
                <div>
                  <h4 className={`font-bold text-sm ${isDistanceValid ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {isDistanceValid ? 'Implantation Validée IT 246' : 'Non-Conformité IT 246 Détectée !'}
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDistanceValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {ruleReference}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">Distance Actuelle</div>
                <div className={`text-2xl font-black font-mono ${isDistanceValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {currentDistance.toFixed(1)} m
                </div>
              </div>
            </div>

            {/* DESSIN CAO INTERACTIF */}
            <div className="text-xs text-slate-500 italic text-center mb-2 flex items-center justify-center gap-2">
              <Info className="w-4 h-4" /> Cliquez et glissez les grilles pour tester l'implantation.
            </div>

            <div 
              className="relative w-full bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-inner cursor-crosshair"
              style={{ aspectRatio: L / W, maxHeight: '500px' }}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setDraggingItem(null)}
              onMouseLeave={() => setDraggingItem(null)}
            >
              <svg 
                ref={svgRef}
                viewBox={`0 0 ${L} ${W}`} 
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {/* GRILLE DE FOND */}
                <defs>
                  <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                    <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#e2e8f0" strokeWidth="0.05"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* LIGNE DE DISTANCE */}
                <line 
                  x1={posAmenee.x} y1={posAmenee.y} 
                  x2={posExtraction.x} y2={posExtraction.y} 
                  stroke={isDistanceValid ? '#10b981' : '#f43f5e'} 
                  strokeWidth="0.1" 
                  strokeDasharray="0.3, 0.3"
                />

                {/* CERCLE DE COUVERTURE (EXTRACTION) */}
                {!isCirc && (
                  <circle 
                    cx={posExtraction.x} cy={posExtraction.y} 
                    r={maxDistanceRule} 
                    fill="none" 
                    stroke={isDistanceValid ? '#fcd34d' : '#f43f5e'} 
                    strokeWidth="0.05"
                    strokeDasharray="0.2, 0.2"
                  />
                )}

                {/* ÉLÉMENT : AMENÉE D'AIR */}
                <g 
                  transform={`translate(${posAmenee.x}, ${posAmenee.y})`}
                  onMouseDown={() => setDraggingItem('amenee')}
                  className="cursor-grab hover:scale-110 transition-transform"
                >
                  <rect x="-0.6" y="-0.6" width="1.2" height="1.2" fill="#10b981" rx="0.2" />
                  <text x="0" y="0.2" fontSize="0.5" fill="white" textAnchor="middle" fontWeight="bold">AA</text>
                </g>

                {/* ÉLÉMENT : EXTRACTION */}
                <g 
                  transform={`translate(${posExtraction.x}, ${posExtraction.y})`}
                  onMouseDown={() => setDraggingItem('extraction')}
                  className="cursor-grab hover:scale-110 transition-transform"
                >
                  <rect x="-0.6" y="-0.6" width="1.2" height="1.2" fill="#f43f5e" rx="0.2" />
                  <text x="0" y="0.2" fontSize="0.5" fill="white" textAnchor="middle" fontWeight="bold">EX</text>
                </g>
              </svg>

              {/* DIMENSIONS */}
              <div className="absolute bottom-2 right-4 bg-white/80 px-2 py-1 rounded text-[10px] font-bold text-slate-500 border border-slate-200">
                Pièce : {L}m x {W}m
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
