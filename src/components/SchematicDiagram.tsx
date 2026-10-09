import React, { useState, useEffect } from 'react';
import { RoomInput, CalculationResult } from '../types/desenfumage';
import { Layers, AlertTriangle, Plus, Minus, CheckCircle2 } from 'lucide-react';

interface SchematicDiagramProps {
  room: RoomInput;
  calc: CalculationResult;
}

export const SchematicDiagram: React.FC<SchematicDiagramProps> = ({ room, calc }) => {
  const [viewMode, setViewMode] = useState<'section' | 'plan'>('section');

  const { ceilingHeight, length, width, mode } = room;
  const { cantonment, natural, mechanical } = calc;

  // Hauteurs pour la coupe
  const clearH = cantonment.clearHeightM;
  const smokeE = cantonment.smokeLayerThicknessM;
  const screenDepth = cantonment.screenDepthM;
  const needsCanton = cantonment.required;

  // Calculs par défaut pour l'implantation
  const defaultExtCount = mode === 'naturel' 
    ? natural.denfcCountTotal 
    : mechanical.suggestedExtractionGrilleCount;
    
  const defaultInletCount = mode === 'naturel' 
    ? Math.max(1, Math.ceil(natural.airInletGeometricAreaM2 / 2))
    : Math.max(1, Math.ceil(mechanical.airInletGrilleMinSectionM2 / 0.5));

  // États pour permettre au Chef de forcer / modifier le nombre de grilles
  const [customExtCount, setCustomExtCount] = useState<number>(defaultExtCount);
  const [customInletCount, setCustomInletCount] = useState<number>(defaultInletCount);

  // Synchronisation si le calcul principal change
  useEffect(() => {
    setCustomExtCount(defaultExtCount);
    setCustomInletCount(defaultInletCount);
  }, [defaultExtCount, defaultInletCount]);

  // VÉRIFICATION NORMATIVE GÉOMÉTRIQUE (IT 246 § 3.6)
  const requiredCols = Math.ceil(length / 30);
  const requiredRows = Math.ceil(width / 30);
  const minRequiredGeometricPoints = requiredCols * requiredRows;
  const hasGeometricError = customExtCount < minRequiredGeometricPoints;

  // Géométrie pour le dessin de la Vue en Plan
  const maxDrawW = 680;
  const maxDrawH = 320;
  const L = Math.max(length, 1);
  const W = Math.max(width, 1);
  const scale = Math.min(maxDrawW / L, maxDrawH / W);
  const drawW = L * scale;
  const drawH = W * scale;
  const offsetX = (800 - drawW) / 2;
  const offsetY = (450 - drawH) / 2;

  // Répartition en grille des points d'extraction
  const extCols = Math.max(1, Math.ceil(Math.sqrt(customExtCount * (L / W))));
  const extRows = Math.max(1, Math.ceil(customExtCount / extCols));

  // Variables calculées pour la vue en Coupe (Évite les fonctions imbriquées dans le JSX)
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
            <h3 className="text-base font-semibold text-slate-800">
              Schéma Technique & Implantation
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation normative des espacements IT 246
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('section')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'section' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vue en Coupe
          </button>
          <button
            type="button"
            onClick={() => setViewMode('plan')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'plan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vue en Plan / Répartition
          </button>
        </div>
      </div>

      {viewMode === 'plan' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-rose-700">Points d&apos;Extraction</span>
              <span className="text-[10px] text-slate-500">Calcul initial : {defaultExtCount}</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md p-1 shadow-sm">
              <button onClick={() => setCustomExtCount(Math.max(1, customExtCount - 1))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Minus className="w-3.5 h-3.5" /></button>
              <span className="text-xs font-bold text-slate-800 w-6 text-center">{customExtCount}</span>
              <button onClick={() => setCustomExtCount(customExtCount + 1)} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-sky-700">Grilles d&apos;Amenée d&apos;Air</span>
              <span className="text-[10px] text-slate-500">Calcul initial : {defaultInletCount}</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md p-1 shadow-sm">
              <button onClick={() => setCustomInletCount(Math.max(1, customInletCount - 1))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Minus className="w-3.5 h-3.5" /></button>
              <span className="text-xs font-bold text-slate-800 w-6 text-center">{customInletCount}</span>
              <button onClick={() => setCustomInletCount(customInletCount + 1)} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'plan' && hasGeometricError && (
        <div className="p-3 bg-rose-100 border border-rose-300 rounded-lg flex items-start gap-3 shadow-inner">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-900 uppercase">Erreur Normative IT 246 : Espacement &gt; 30 mètres</h4>
            <p className="text-[11px] text-rose-700 mt-1">
              Les dimensions du local ({length}m × {width}m) créent des zones mortes. La règle impose un point d&apos;extraction tous les 30m maximum. 
              <strong> Il faut au minimum {minRequiredGeometricPoints} point(s) d&apos;extraction</strong> pour couvrir cette géométrie, mais vous n&apos;en avez prévu que {customExtCount}.
            </p>
          </div>
        </div>
      )}

      {viewMode === 'plan' && !hasGeometricError && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-800">
            Implantation validée : Les rayons d&apos;action couvrent l&apos;intégralité du volume.
          </span>
        </div>
      )}

      <div className="relative w-full aspect-[16/9] max-h-[400px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-2">
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
            <text x="85" y="378" fill="#cbd5e1" fontSize="11">Plancher / Niveau fini (Sol ±0.00)</text>
            <rect x="80" y="80" width="640" height="25" fill="#334155" />
            <line x1="80" y1="105" x2="720" y2="105" stroke="#94a3b8" strokeWidth="2" />
            <text x="85" y="98" fill="#cbd5e1" fontSize="11">Toiture / Sous-face plafond (+{ceilingHeight.toFixed(2)} m)</text>
            <rect x="70" y="80" width="15" height="305" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <rect x="715" y="80" width="15" height="305" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

            <g>
              <rect x="85" y={smokeTop} width="630" height={smokePx} fill="url(#smokeGradient)" />
              <line x1="85" y1={smokeBottom} x2="715" y2={smokeBottom} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
              <text x="400" y={smokeBottom - 8} textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold">
                Interface de fumée (H&apos; = {clearH.toFixed(2)} m)
              </text>
              <text x="400" y={smokeTop + smokePx / 2} textAnchor="middle" fill="#f87171" fontSize="13" fontWeight="bold">
                Zone enfumée (E = {smokeE.toFixed(2)} m)
              </text>
              <text x="400" y={smokeBottom + clearPx / 2} textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="600">
                Zone libre de fumée (H&apos; = {clearH.toFixed(2)} m)
              </text>

              {needsCanton && [300, 500].map((xPos, idx) => (
                <g key={idx}>
                  <line x1={xPos} y1="105" x2={xPos} y2={105 + screenPx} stroke="#ef4444" strokeWidth="5" strokeLinecap="square" />
                  <text x={xPos + 8} y={105 + (screenPx / 2)} fill="#fca5a5" fontSize="10" fontWeight="bold">Écran (&ge; {screenDepth.toFixed(2)} m)</text>
                </g>
              ))}

              {mode === 'naturel' ? (
                [200, 400, 600].map((vx, i) => (
                  <g key={i}>
                    <rect x={vx - 22} y="75" width="44" height="30" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" rx="3" />
                    <line x1={vx - 22} y1="75" x2={vx + 15} y2="50" stroke="#ffffff" strokeWidth="2.5" />
                    <path d={`M ${vx} 70 L ${vx} 40 M ${vx - 5} 50 L ${vx} 40 L ${vx + 5} 50`} stroke="#ef4444" strokeWidth="2.5" fill="none" />
                    <text x={vx} y="30" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="bold">DENFC</text>
                  </g>
                ))
              ) : (
                [220, 580].map((mx, i) => (
                  <g key={i}>
                    <rect x={mx - 30} y="90" width="60" height="25" fill="#dc2626" stroke="#fecaca" strokeWidth="1.5" rx="2" />
                    <line x1={mx - 20} y1="95" x2={mx - 20} y2="110" stroke="#fff" strokeWidth="1" />
                    <line x1={mx + 20} y1="95" x2={mx + 20} y2="110" stroke="#fff" strokeWidth="1" />
                    <path d={`M ${mx} 90 L ${mx} 45 M ${mx - 6} 58 L ${mx} 45 L ${mx + 6} 58`} stroke="#ef4444" strokeWidth="2.5" fill="none" />
                    <text x={mx} y="35" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="bold">EXT</text>
                  </g>
                ))
              )}

              <g>
                <rect x="70" y="295" width="15" height="55" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.5" />
                <path d="M 40 320 L 115 320 M 100 312 L 115 320 L 100 328" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
                <text x="35" y="308" textAnchor="end" fill="#38bdf8" fontSize="10" fontWeight="bold">Amenée d&apos;air</text>
                <rect x="715" y="295" width="15" height="55" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.5" />
                <path d="M 760 320 L 685 320 M 700 312 L 685 320 L 700 328" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
              </g>
            </g>
          </svg>
        ) : (
          <svg viewBox="0 0 800 450" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
            <text x={offsetX + drawW / 2} y={offsetY - 15} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">
              L = {length.toFixed(1)} m
            </text>
            <text x={offsetX - 15} y={offsetY + drawH / 2} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600" writingMode="vertical-rl">
              W = {width.toFixed(1)} m
            </text>

            <rect x={offsetX} y={offsetY} width={drawW} height={drawH} fill="#0f172a" stroke={hasGeometricError ? "#ef4444" : "#475569"} strokeWidth={hasGeometricError ? "4" : "3"} />

            {Array.from({ length: customExtCount }).map((_, i) => {
              const r = Math.floor(i / extCols);
              const c = i % extCols;
              const cx = offsetX + (c + 0.5) * (drawW / extCols);
              const cy = offsetY + (r + 0.5) * (draw
