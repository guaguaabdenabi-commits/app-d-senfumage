import React from 'react';
import { CalculationResult, RoomInput } from '../types/desenfumage';
import { CheckCircle2, AlertTriangle, Wind, Flame, Layers, Cpu, Info, ShieldCheck, Maximize2 } from 'lucide-react';

interface ResultsViewProps {
  room: RoomInput;
  calc: CalculationResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ room, calc }) => {
  const { isSubjectToDesenfumage, subjectReason, regulatoryText, mode, cantonment, natural, mechanical, overpressure, warnings, notes } = calc;

  return (
    <div className="space-y-5">
      {/* 1. Regulatory Status Card */}
      <div className={`p-4 rounded-xl border ${isSubjectToDesenfumage ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
        <div className="flex items-start gap-3">
          {isSubjectToDesenfumage ? (
            <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5"><Flame className="w-5 h-5" /></div>
          ) : (
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5"><CheckCircle2 className="w-5 h-5" /></div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isSubjectToDesenfumage ? 'Assujettissement Réglementaire : OBLIGATOIRE' : 'Assujettissement Réglementaire : NON OBLIGATOIRE'}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">{regulatoryText}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-1.5 font-medium">{subjectReason}</p>
          </div>
        </div>
      </div>

      {/* 2. Cantonment Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Cantonnement de Désenfumage (IT 246 § 3.3)</h3>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${cantonment.required ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
            {cantonment.required ? `${cantonment.cantonCount} cantons requis` : 'Canton unique'}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Nombre de cantons</span>
            <span className="text-base font-bold text-slate-900">{cantonment.cantonCount}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Surface / canton max</span>
            <span className="text-base font-bold text-slate-900">{cantonment.maxAreaPerCanton.toFixed(0)} m²</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Retombée d'écran (hr)</span>
            <span className="text-base font-bold text-slate-900">≥ {cantonment.screenDepthM.toFixed(2)} m</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Zone libre de fumée (H')</span>
            <span className="text-base font-bold text-slate-900">{cantonment.clearHeightM.toFixed(2)} m</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Calculations Results */}
      {mode === 'naturel' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Dimensionnement du Désenfumage Naturel</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">DENFC</span>
          </div>
          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong>Règle appliquée : </strong>{natural.ruleUsed}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <span className="text-xs font-semibold text-amber-800 block">Surface Utile Totale (SUE)</span>
              <div className="text-2xl font-extrabold text-amber-950 mt-1">
                {natural.sueTotalM2} <span className="text-sm font-semibold text-amber-700">m²</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200">
              <span className="text-xs font-semibold text-rose-800 block">Nombre de DENFC Requis</span>
              <div className="text-2xl font-extrabold text-rose-950 mt-1">
                {natural.denfcCountTotal} <span className="text-sm font-semibold text-rose-700">unités</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200">
              <span className="text-xs font-semibold text-sky-800 block">Amenée d'Air Libre Nécessaire</span>
              <div className="text-2xl font-extrabold text-sky-950 mt-1">
                {natural.airInletGeometricAreaM2} <span className="text-sm font-semibold text-sky-700">m²</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Dimensionnement du Désenfumage Mécanique</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">Extraction Forcée</span>
          </div>
          
          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong>Règle appliquée : </strong>{mechanical.ruleUsed}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <span className="text-xs font-semibold text-blue-800 block">Débit d'Extraction (Qext)</span>
              <div className="text-2xl font-extrabold text-blue-950 mt-1">
                {mechanical.extractionFlowRateM3h.toLocaleString('fr-FR')} <span className="text-sm font-semibold text-blue-700">m³/h</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200">
              <span className="text-xs font-semibold text-cyan-800 block">Amenée d'Air Mécanique</span>
              <div className="text-2xl font-extrabold text-cyan-950 mt-1">
                {mechanical.airInletFlowRateM3h.toLocaleString('fr-FR')} <span className="text-sm font-semibold text-cyan-700">m³/h</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
              <span className="text-xs font-semibold text-slate-700 block">Spécification Ventilateur</span>
              <div className="text-base font-bold text-slate-900 mt-1">{mechanical.fanSpecifications.fireRating}</div>
            </div>
          </div>

          {/* Dimensionnement Aéraulique G.P-T Modifiable */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-blue-600" />
              <span>Dimensionnement Aéraulique des Réseaux & Bouches</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-1">
                  Réseau d'Extraction des fumées
                </div>
                <div className="text-slate-600 mb-1 flex justify-between items-center">
                  <span>Section Gaines (V = {mechanical.velocitiesUsed.extractionDuct} m/s) :</span> 
                  <strong className="text-sm bg-blue-50 px-2 py-0.5 rounded">{mechanical.extractionDuctMinSectionM2.toFixed(3)} m²</strong>
                </div>
                <div className="text-slate-600 mb-2 flex justify-between items-center">
                  <span>Section Grilles (V = {mechanical.velocitiesUsed.extractionGrille} m/s) :</span> 
                  <strong className="text-sm bg-blue-50 px-2 py-0.5 rounded">{mechanical.extractionGrilleMinSectionM2.toFixed(3)} m²</strong>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-1">
                  Réseau d'Amenée d'air (Compensation)
                </div>
                <div className="text-slate-600 mb-1 flex justify-between items-center">
                  <span>Section Gaines (V = {mechanical.velocitiesUsed.inletDuct} m/s) :</span> 
                  <strong className="text-sm bg-blue-50 px-2 py-0.5 rounded">{mechanical.airInletDuctMinSectionM2.toFixed(3)} m²</strong>
                </div>
                <div className="text-slate-600 mb-2 flex justify-between items-center">
                  <span>Section Grilles (V = {mechanical.velocitiesUsed.inletGrille} m/s) :</span> 
                  <strong className="text-sm bg-blue-50 px-2 py-0.5 rounded">{mechanical.airInletGrilleMinSectionM2.toFixed(3)} m²</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {overpressure && (
        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
            <h4 className="text-sm font-bold text-purple-900">Mise en Surpression</h4>
          </div>
          <div className="text-xs text-purple-800 space-y-1">
            <div>• <strong>Plage différentielle : </strong>{overpressure.differentialPressureRangePa}</div>
          </div>
        </div>
      )}
    </div>
  );
};
