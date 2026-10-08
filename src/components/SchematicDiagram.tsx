import React, { useState } from 'react';
import { RoomInput, CalculationResult } from '../types/desenfumage';
import { Layers, Eye, Wind, ShieldAlert, ArrowUp, ArrowDown } from 'lucide-react';

interface SchematicDiagramProps {
  room: RoomInput;
  calc: CalculationResult;
}

export const SchematicDiagram: React.FC<SchematicDiagramProps> = ({ room, calc }) => {
  const [viewMode, setViewMode] = useState<'section' | 'plan'>('section');

  const { ceilingHeight, area, length, width, mode, spaceKind } = room;
  const { cantonment, natural, mechanical } = calc;

  // View parameters for cross-section
  const clearH = cantonment.clearHeightM;
  const smokeE = cantonment.smokeLayerThicknessM;
  const screenDepth = cantonment.screenDepthM;
  const needsCanton = cantonment.required;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-semibold text-slate-800">
              Schéma Technique Dynamique & Stratification
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Représentation normative conforme IT 246 / NF S 61-937
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('section')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'section'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vue en Coupe (Élévation)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('plan')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'plan'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vue en Plan (Implantation)
          </button>
        </div>
      </div>

      {viewMode === 'section' ? (
        <div>
          {/* SVG Section Diagram */}
          <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-2">
            <svg
              viewBox="0 0 800 450"
              className="w-full h-full select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Smoke gradient */}
                <linearGradient id="smokeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#334155" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#475569" stopOpacity="0.1" />
                </linearGradient>

                {/* Sky / Outside */}
                <linearGradient id="outsideGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>

                {/* Pattern for insulation / slab */}
                <pattern id="concretePattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 0 10 L 10 0 M 0 0 L 10 10" fill="none" stroke="#334155" strokeWidth="0.5" />
                </pattern>
              </defs>

              {/* Background */}
              <rect x="0" y="0" width="800" height="450" fill="url(#outsideGradient)" />

              {/* Floor slab */}
              <rect x="80" y="360" width="640" height="25" fill="#334155" />
              <line x1="80" y1="360" x2="720" y2="360" stroke="#94a3b8" strokeWidth="2" />
              <text x="85" y="378" fill="#cbd5e1" fontSize="11" fontFamily="sans-serif">
                Plancher / Niveau fini (Sol ±0.00)
              </text>

              {/* Ceiling / Roof slab */}
              <rect x="80" y="80" width="640" height="25" fill="#334155" />
              <line x1="80" y1="105" x2="720" y2="105" stroke="#94a3b8" strokeWidth="2" />
              <text x="85" y="98" fill="#cbd5e1" fontSize="11" fontFamily="sans-serif">
                Toiture / Sous-face plafond (+{ceilingHeight.toFixed(2)} m)
              </text>

              {/* Side walls */}
              <rect x="70" y="80" width="15" height="305" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <rect x="715" y="80" width="15" height="305" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

              {/* Smoke Layer Zone */}
              {/* Calculate proportional heights: Floor is 360, Ceiling is 105, total height = 255 px */}
              {(() => {
                const totalPx = 255;
                const smokePx = (smokeE / ceilingHeight) * totalPx;
                const clearPx = (clearH / ceilingHeight) * totalPx;
                const smokeTop = 105;
                const smokeBottom = 105 + smokePx;

                return (
                  <g>
                    {/* Smoke mass */}
                    <rect
                      x="85"
                      y={smokeTop}
                      width="630"
                      height={smokePx}
                      fill="url(#smokeGradient)"
                    />

                    {/* Stratification separation line (dashed) */}
                    <line
                      x1="85"
                      y1={smokeBottom}
                      x2="715"
                      y2={smokeBottom}
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    <text
                      x="400"
                      y={smokeBottom - 8}
                      textAnchor="middle"
                      fill="#fbbf24"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      Interface de fumée (H' = {clearH.toFixed(2)} m au-dessus du sol)
                    </text>

                    {/* Smoke layer text */}
                    <text
                      x="400"
                      y={smokeTop + smokePx / 2}
                      textAnchor="middle"
                      fill="#f87171"
                      fontSize="13"
                      fontWeight="bold"
                    >
                      Zone enfumée (Épaisseur E = {smokeE.toFixed(2)} m)
                    </text>

                    {/* Clear zone text */}
                    <text
                      x="400"
                      y={smokeBottom + clearPx / 2}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="13"
                      fontWeight="600"
                    >
                      Zone libre de fumée (Hauteur H' = {clearH.toFixed(2)} m)
                    </text>

                    {/* Cantonment screens (if required) */}
                    {needsCanton && (
                      <g>
                        {/* Cantonment screen at 1/3 and 2/3 */}
                        {[300, 500].map((xPos, idx) => {
                          const screenPx = (screenDepth / ceilingHeight) * totalPx;
                          return (
                            <g key={idx}>
                              <line
                                x1={xPos}
                                y1="105"
                                x2={xPos}
                                y2={105 + screenPx}
                                stroke="#ef4444"
                                strokeWidth="5"
                                strokeLinecap="square"
                              />
                              <rect
                                x={xPos - 5}
                                y={105 + screenPx - 4}
                                width="10"
                                height="8"
                                fill="#dc2626"
                                rx="2"
                              />
                              <text
                                x={xPos + 8}
                                y={105 + screenPx / 2}
                                fill="#fca5a5"
                                fontSize="10"
                                fontWeight="bold"
                              >
                                Écran de cantonnement
                              </text>
                              <text
                                x={xPos + 8}
                                y={105 + screenPx / 2 + 12}
                                fill="#fca5a5"
                                fontSize="9"
                              >
                                Retombée ≥ {screenDepth.toFixed(2)} m
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    )}

                    {/* Extraction equipment on roof or upper wall */}
                    {mode === 'naturel' ? (
                      <g>
                        {/* DENFC Vents */}
                        {[200, 400, 600].map((vx, i) => (
                          <g key={i}>
                            <rect
                              x={vx - 22}
                              y="75"
                              width="44"
                              height="30"
                              fill="#ef4444"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              rx="3"
                            />
                            {/* Open lid angle */}
                            <line
                              x1={vx - 22}
                              y1="75"
                              x2={vx + 15}
                              y2="50"
                              stroke="#ffffff"
                              strokeWidth="2.5"
                            />
                            {/* Red evacuation arrows */}
                            <path
                              d={`M ${vx} 70 L ${vx} 40 M ${vx - 5} 50 L ${vx} 40 L ${vx + 5} 50`}
                              stroke="#ef4444"
                              strokeWidth="2.5"
                              fill="none"
                            />
                            <text
                              x={vx}
                              y="30"
                              textAnchor="middle"
                              fill="#f87171"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              DENFC
                            </text>
                          </g>
                        ))}
                      </g>
                    ) : (
                      <g>
                        {/* Mechanical extraction ducts and grilles */}
                        {[220, 580].map((mx, i) => (
                          <g key={i}>
                            <rect
                              x={mx - 30}
                              y="90"
                              width="60"
                              height="25"
                              fill="#dc2626"
                              stroke="#fecaca"
                              strokeWidth="1.5"
                              rx="2"
                            />
                            {/* Grille lines */}
                            <line x1={mx - 20} y1="95" x2={mx - 20} y2="110" stroke="#fff" strokeWidth="1" />
                            <line x1={mx} y1="95" x2={mx} y2="110" stroke="#fff" strokeWidth="1" />
                            <line x1={mx + 20} y1="95" x2={mx + 20} y2="110" stroke="#fff" strokeWidth="1" />
                            {/* Fan icon / duct */}
                            <path
                              d={`M ${mx} 90 L ${mx} 45 M ${mx - 6} 58 L ${mx} 45 L ${mx + 6} 58`}
                              stroke="#ef4444"
                              strokeWidth="2.5"
                              fill="none"
                            />
                            <text
                              x={mx}
                              y="35"
                              textAnchor="middle"
                              fill="#f87171"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              Extraction 400°C/2h
                            </text>
                          </g>
                        ))}
                      </g>
                    )}

                    {/* Fresh air inlets in lower wall / floor (zone exempte de fumée) */}
                    <g>
                      {/* Left Air inlet */}
                      <rect
                        x="70"
                        y="295"
                        width="15"
                        height="55"
                        fill="#0284c7"
                        stroke="#7dd3fc"
                        strokeWidth="1.5"
                      />
                      {/* Fresh air inflow arrows */}
                      <path
                        d="M 40 320 L 115 320 M 100 312 L 115 320 L 100 328"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        fill="none"
                      />
                      <text
                        x="35"
                        y="308"
                        textAnchor="end"
                        fill="#38bdf8"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        Amenée d'air
                      </text>
                      <text
                        x="35"
                        y="335"
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize="8"
                      >
                        h ≤ 1.0 m
                      </text>

                      {/* Right Air inlet */}
                      <rect
                        x="715"
                        y="295"
                        width="15"
                        height="55"
                        fill="#0284c7"
                        stroke="#7dd3fc"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M 760 320 L 685 320 M 700 312 L 685 320 L 700 328"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    </g>

                    {/* Dimension callout on the right: Height H */}
                    <g>
                      <line x1="755" y1="105" x2="755" y2="360" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="750" y1="105" x2="760" y2="105" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="750" y1="360" x2="760" y2="360" stroke="#cbd5e1" strokeWidth="1.5" />
                      <text
                        x="768"
                        y="235"
                        fill="#e2e8f0"
                        fontSize="11"
                        fontWeight="bold"
                        writingMode="vertical-rl"
                      >
                        H = {ceilingHeight.toFixed(2)} m
                      </text>
                    </g>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Cross section metric badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Hauteur sous plafond (H)</span>
              <span className="text-sm font-semibold text-slate-800">
                {ceilingHeight.toFixed(2)} m
              </span>
            </div>
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
              <span className="text-blue-700 block">Zone libre de fumée (H')</span>
              <span className="text-sm font-semibold text-blue-900">
                {clearH.toFixed(2)} m
              </span>
              <span className="text-[10px] text-blue-600">≥ 1,80 m ou H/2</span>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
              <span className="text-amber-700 block">Épaisseur nappe fumée (E)</span>
              <span className="text-sm font-semibold text-amber-900">
                {smokeE.toFixed(2)} m
              </span>
              <span className="text-[10px] text-amber-600">E = H - H'</span>
            </div>
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg">
              <span className="text-rose-700 block">Retombée d'écran (hr)</span>
              <span className="text-sm font-semibold text-rose-900">
                {screenDepth.toFixed(2)} m
              </span>
              <span className="text-[10px] text-rose-600">
                {needsCanton ? 'Écran obligatoire' : 'Canton unique'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Top-down plan view */}
          <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-3">
            <svg
              viewBox="0 0 800 450"
              className="w-full h-full select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Outer boundary */}
              <rect x="100" y="50" width="600" height="350" fill="#0f172a" stroke="#475569" strokeWidth="3" />
              
              {/* Dimensions text */}
              <text x="400" y="35" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">
                Longueur L = {length.toFixed(1)} m
              </text>
              <text x="65" y="225" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600" writingMode="vertical-rl">
                Largeur W = {width.toFixed(1)} m
              </text>

              {/* Cantonment divisions in plan */}
              {cantonment.cantonCount > 1 ? (
                <>
                  {Array.from({ length: cantonment.cantonCount }).map((_, idx) => {
                    const count = cantonment.cantonCount;
                    const cWidth = 600 / count;
                    const xStart = 100 + idx * cWidth;
                    return (
                      <g key={idx}>
                        {idx > 0 && (
                          <line
                            x1={xStart}
                            y1="50"
                            x2={xStart}
                            y2="400"
                            stroke="#ef4444"
                            strokeWidth="3"
                            strokeDasharray="8 4"
                          />
                        )}
                        <text
                          x={xStart + cWidth / 2}
                          y="85"
                          textAnchor="middle"
                          fill="#f87171"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          Canton #{idx + 1}
                        </text>
                        <text
                          x={xStart + cWidth / 2}
                          y="105"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="10"
                        >
                          ~{cantonment.maxAreaPerCanton.toFixed(0)} m²
                        </text>

                        {/* DENFC or Grilles in each canton */}
                        {mode === 'naturel' ? (
                          Array.from({ length: Math.min(6, natural.denfcCountPerCanton) }).map((_, dIdx) => {
                            const denfcsInCanton = Math.min(6, natural.denfcCountPerCanton);
                            const dy = 160 + (dIdx % 3) * 70;
                            const dx = xStart + (cWidth / (Math.ceil(denfcsInCanton / 3) + 1)) * (Math.floor(dIdx / 3) + 1);
                            return (
                              <g key={dIdx}>
                                <rect
                                  x={dx - 16}
                                  y={dy - 16}
                                  width="32"
                                  height="32"
                                  fill="#ef4444"
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                  rx="3"
                                />
                                <line x1={dx - 10} y1={dy - 10} x2={dx + 10} y2={dy + 10} stroke="#ffffff" strokeWidth="1.5" />
                                <line x1={dx + 10} y1={dy - 10} x2={dx - 10} y2={dy + 10} stroke="#ffffff" strokeWidth="1.5" />
                              </g>
                            );
                          })
                        ) : (
                          // Mechanical grilles
                          Array.from({ length: 2 }).map((_, gIdx) => {
                            const gy = 180 + gIdx * 90;
                            const gx = xStart + cWidth / 2;
                            return (
                              <g key={gIdx}>
                                <circle cx={gx} cy={gy} r="18" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                                <text x={gx} y={gy + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                                  EXT
                                </text>
                              </g>
                            );
                          })
                        )}
                      </g>
                    );
                  })}
                </>
              ) : (
                // Single Canton
                <g>
                  <text x="400" y="85" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">
                    Canton Unique ({area.toFixed(0)} m²)
                  </text>

                  {mode === 'naturel' ? (
                    Array.from({ length: Math.min(8, natural.denfcCountTotal) }).map((_, i) => {
                      const total = Math.min(8, natural.denfcCountTotal);
                      const cols = Math.min(4, total);
                      const row = Math.floor(i / cols);
                      const col = i % cols;
                      const cx = 180 + col * (440 / Math.max(1, cols - 1 || 1));
                      const cy = 180 + row * 100;
                      return (
                        <g key={i}>
                          <rect
                            x={cx - 18}
                            y={cy - 18}
                            width="36"
                            height="36"
                            fill="#ef4444"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            rx="3"
                          />
                          <line x1={cx - 12} y1={cy - 12} x2={cx + 12} y2={cy + 12} stroke="#ffffff" strokeWidth="1.5" />
                          <line x1={cx + 12} y1={cy - 12} x2={cx - 12} y2={cy + 12} stroke="#ffffff" strokeWidth="1.5" />
                          <text x={cx} y={cy + 30} textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">
                            DENFC #{i + 1}
                          </text>
                        </g>
                      );
                    })
                  ) : (
                    // Mechanical grilles distribution
                    Array.from({ length: Math.min(4, mechanical.suggestedExtractionGrilleCount) }).map((_, i) => {
                      const total = Math.min(4, mechanical.suggestedExtractionGrilleCount);
                      const cx = 220 + i * (360 / Math.max(1, total - 1 || 1));
                      const cy = 230;
                      return (
                        <g key={i}>
                          <circle cx={cx} cy={cy} r="20" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                          <text x={cx} y={cy + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                            BOUCHE {i + 1}
                          </text>
                        </g>
                      );
                    })
                  )}
                </g>
              )}

              {/* Lower fresh air openings */}
              <rect x="250" y="392" width="100" height="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <rect x="450" y="392" width="100" height="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <text x="400" y="425" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                Amenées d'air en façade / ouvrants bas (h ≤ 1.00 m)
              </text>
            </svg>
          </div>

          {/* Plan legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-red-600 rounded-sm inline-block" />
              <span>
                {mode === 'naturel'
                  ? `Exutoires DENFC (${natural.denfcCountTotal} prévus)`
                  : 'Bouches d\'extraction 400°C/2h'}
              </span>
            </div>
            {cantonment.required && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500 inline-block" />
                <span>Écrans de cantonnement (retombée {screenDepth.toFixed(2)} m)</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-sky-600 rounded-sm inline-block" />
              <span>Amenées d'air frais réglementaires</span>
            </div>
            <div className="text-slate-400">
              Règle : distance inter-appareils ≤ 30 m · distance paroi ≤ 10 m
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
