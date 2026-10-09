import React, { useState } from 'react';
import { RoomInput, CalculationResult } from '../types/desenfumage';
import { AlertTriangle, CheckCircle2, Wind, ShieldAlert, Settings2, Box, Circle, Fan, FlameKindling } from 'lucide-react';

interface ResultsViewProps {
  room: RoomInput;
  calc: CalculationResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ room, calc }) => {
  const { mode } = room;
  const { cantonment, natural, mechanical } = calc;

  // ==========================================
  // ÉTATS DU MODULE AÉRAULIQUE (Mode Mécanique)
  // ==========================================
  const [ductVelocity, setDuctVelocity] = useState<number>(8); // Vitesse max recommandée en extraction (m/s)
  const [ductType, setDuctType] = useState<'circulaire' | 'rectangulaire'>('circulaire');
  const [rectWidth, setRectWidth] = useState<number>(600); // Largeur imposée pour gaine rectangulaire (mm)
  const [voletType, setVoletType] = useState<'tunnel' | 'portillon'>('tunnel');
  const [hasCCF, setHasCCF] = useState<boolean>(false);
  const [hasPareFlamme, setHasPareFlamme] = useState<boolean>(false);

  // ==========================================
  // CALCULS AÉRAULIQUES EN TEMPS RÉEL
  // ==========================================
  const flowRateM3H = mode === 'mecanique' && mechanical ? mechanical.totalExtractionFlowRateM3H : 0;
  
  // Section (m²) = Débit (m³/h) / (3600 * Vitesse (m/s))
  const sectionM2 = flowRateM3H / (3600 * ductVelocity);
  
  // Circulaire : Calcul du Diamètre Nominal (DN) standard
  const theoreticalDiameterMm = Math.sqrt((4 * sectionM2) / Math.PI) * 1000;
  const STANDARD_DN = [160, 200, 250, 315, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1120, 1250];
  const recommendedDN = STANDARD_DN.find(dn => dn >= theoreticalDiameterMm) || STANDARD_DN[STANDARD_DN.length - 1];

  // Rectangulaire : Calcul de la Hauteur minimum (H) en fonction de la Largeur (L)
  const rectHeightMm = (sectionM2 / (rectWidth / 1000)) * 1000;
  const recommendedRectHeight = Math.ceil(rectHeightMm / 50) * 50; // Arrondi au 50mm supérieur

  return (
    <div className="space-y-6">
      
      {/* 1. ASSUJETTISSEMENT */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-amber-500" /> Assujettissement Réglementaire
        </h3>
        {calc.isRequired ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">Désenfumage OBLIGATOIRE</p>
              <p className="text-xs text-amber-700 mt-1">{calc.requirementReason}</p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Désenfumage NON OBLIGATOIRE</p>
              <p className="text-xs text-emerald-700 mt-1">{calc.requirementReason}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. CANTONNEMENT */}
      {calc.isRequired && cantonment.required && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Cantonnement (IT 246)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Nombre de cantons</p>
              <p className="text-lg font-bold text-slate-800">{cantonment.cantonCount}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Surface max / canton</p>
              <p className="text-lg font-bold text-slate-800">{cantonment.maxCantonAreaM2} <span className="text-xs font-normal">m²</span></p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-700 mb-1">Retombée d'écran</p>
              <p className="text-lg font-bold text-amber-900">≥ {cantonment.screenDepthM.toFixed(2)} <span className="text-xs font-normal">m</span></p>
            </div>
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
              <p className="text-xs text-sky-700 mb-1">Zone libre (H')</p>
              <p className="text-lg font-bold text-sky-900">{cantonment.clearHeightM.toFixed(2)} <span className="text-xs font-normal">m</span></p>
            </div>
          </div>
        </div>
      )}

      {/* 3. RÉSULTATS PRINCIPAUX (Naturel ou Mécanique) */}
      {calc.isRequired && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-500" /> Bilan {mode === 'naturel' ? 'Naturel' : 'Mécanique'}
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600">
              {mode === 'naturel' ? 'Règle de Surface (SUE)' : 'Règle de Débit (m³/h)'}
            </span>
          </div>

          <div className="p-5">
            {mode === 'naturel' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                  <p className="text-xs font-bold text-rose-800 uppercase mb-1">Extraction (Exutoires)</p>
                  <p className="text-3xl font-black text-rose-600">{natural.denfcCountTotal} <span className="text-sm font-semibold text-rose-800">DENFC</span></p>
                  <p className="text-xs text-rose-700 mt-2">Surface Utile (SUE) requise : <strong>{natural.requiredSUE.toFixed(2)} m²</strong></p>
                </div>
                <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl">
                  <p className="text-xs font-bold text-sky-800 uppercase mb-1">Amenée d'Air Libre</p>
                  <p className="text-3xl font-black text-sky-600">{natural.airInletGeometricAreaM2.toFixed(2)} <span className="text-sm font-semibold text-sky-800">m²</span></p>
                  <p className="text-xs text-sky-700 mt-2">Répartition équitable en façade basse</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                  <p className="text-xs font-bold text-rose-800 uppercase mb-1">Débit d'Extraction</p>
                  <p className="text-3xl font-black text-rose-600">{mechanical.totalExtractionFlowRateM3H.toLocaleString()} <span className="text-sm font-semibold text-rose-800">m³/h</span></p>
                  <p className="text-xs text-rose-700 mt-2">Soit {mechanical.totalExtractionFlowRateM3S.toFixed(2)} m³/s</p>
                </div>
                <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl">
                  <p className="text-xs font-bold text-sky-800 uppercase mb-1">Amenée d'Air (Naturelle)</p>
                  <p className="text-3xl font-black text-sky-600">{mechanical.totalAirInletFlowRateM3H ? mechanical.totalAirInletFlowRateM3H.toLocaleString() + ' m³/h' : mechanical.airInletGrilleMinSectionM2.toFixed(2) + ' m²'}</p>
                  <p className="text-xs text-sky-700 mt-2">Vitesse max passage : &le; 5 m/s</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. LE NOUVEAU MODULE AÉRAULIQUE (Uniquement si Mécanique) */}
      {calc.isRequired && mode === 'mecanique' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-400" /> Ingénierie Aéraulique & Équipements
            </h3>
          </div>
          
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Colonne 1 : Dimensionnement Réseau */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">Réseau de Gaines</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-slate-300">Vitesse de l'air cible</label>
                  <span className="text-xs font-bold text-amber-400">{ductVelocity} m/s</span>
                </div>
                <input 
                  type="range" min="4" max="12" step="0.5" 
                  value={ductVelocity} onChange={(e) => setDuctVelocity(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex bg-slate-800 rounded-lg p-1">
                <button onClick={() => setDuctType('circulaire')} className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${ductType === 'circulaire' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                  <Circle className="w-3.5 h-3.5" /> Circulaire
                </button>
                <button onClick={() => setDuctType('rectangulaire')} className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${ductType === 'rectangulaire' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                  <Box className="w-3.5 h-3.5" /> Rectangulaire
                </button>
              </div>

              {ductType === 'circulaire' ? (
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                  <p className="text-xs text-slate-400 mb-1">Diamètre recommandé (Standard)</p>
                  <p className="text-2xl font-black text-white">DN {recommendedDN}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Section int. : {(Math.PI * Math.pow(recommendedDN/2000, 2)).toFixed(2)} m²</p>
                </div>
              ) : (
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Largeur imposée (L)</span>
                    <input type="number" value={rectWidth} onChange={(e) => setRectWidth(Number(e.target.value) || 100)} step="50" className="w-20 bg-slate-900 border border-slate-600 rounded text-xs text-white px-2 py-1 text-center" />
                    <span className="text-xs text-slate-400">mm</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Hauteur mini. requise (H)</span>
                    <span className="text-lg font-bold text-white">{recommendedRectHeight} mm</span>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">Gaine suggérée : {rectWidth} x {recommendedRectHeight} mm</p>
                </div>
              )}
            </div>

            {/* Colonne 2 : Équipements de Sécurité */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">Équipements & Sécurité</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-200">Type de Volet</span>
                  </div>
                  <select 
                    value={voletType} onChange={(e) => setVoletType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-600 text-xs text-white rounded px-2 py-1 outline-none focus:border-amber-500"
                  >
                    <option value="tunnel">Volet Tunnel</option>
                    <option value="portillon">Volet à Portillon</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-4 h-4 ${hasCCF ? 'text-rose-500' : 'text-slate-400'}`} />
                    <span className="text-xs font-medium text-slate-200">Clapets Coupe-Feu (CCF)</span>
                  </div>
                  <input type="checkbox" checked={hasCCF} onChange={(e) => setHasCCF(e.target.checked)} className="w-4 h-4 accent-amber-500 rounded bg-slate-900 border-slate-600" />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors">
                  <div className="flex items-center gap-2">
                    <FlameKindling className={`w-4 h-4 ${hasPareFlamme ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className="text-xs font-medium text-slate-200">Cartouches Pare-Flamme</span>
                  </div>
                  <input type="checkbox" checked={hasPareFlamme} onChange={(e) => setHasPareFlamme(e.target.checked)} className="w-4 h-4 accent-amber-500 rounded bg-slate-900 border-slate-600" />
                </label>
              </div>

              <div className="mt-4 p-3 bg-indigo-900/40 border border-indigo-500/30 rounded-lg">
                <h5 className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 mb-1"><Fan className="w-3.5 h-3.5" /> Recommandation Ventilateur</h5>
                <p className="text-[10px] text-indigo-200/80 leading-relaxed">
                  Caisson ou Tourelle de désenfumage classé <strong className="text-white">F400-120</strong> (400°C pendant 2h). 
                  Débit cible : <strong className="text-white">{flowRateM3H.toLocaleString()} m³/h</strong>. 
                  Prévoir variateur de fréquence et pressostat de contrôle.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
