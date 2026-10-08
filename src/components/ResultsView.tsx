import React from 'react';
import { CalculationResult, RoomInput } from '../types/desenfumage';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Wind, 
  Flame, 
  Layers, 
  Cpu, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Maximize2
} from 'lucide-react';

interface ResultsViewProps {
  room: RoomInput;
  calc: CalculationResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ room, calc }) => {
  const { isSubjectToDesenfumage, subjectReason, regulatoryText, mode, cantonment, natural, mechanical, overpressure, warnings, notes } = calc;

  return (
    <div className="space-y-5">
      {/* 1. Regulatory Status Card */}
      <div className={`p-4 rounded-xl border ${
        isSubjectToDesenfumage 
          ? 'bg-amber-500/10 border-amber-500/30' 
          : 'bg-emerald-500/10 border-emerald-500/30'
      }`}>
        <div className="flex items-start gap-3">
          {isSubjectToDesenfumage ? (
            <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
              <Flame className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isSubjectToDesenfumage 
                  ? 'Assujettissement Réglementaire : OBLIGATOIRE' 
                  : 'Assujettissement Réglementaire : NON OBLIGATOIRE'}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
                {regulatoryText}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 mt-1.5 font-medium">
              {subjectReason}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Cantonment Panel (if relevant) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Cantonnement de Désenfumage (IT 246 § 3.3)
            </h3>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
            cantonment.required 
              ? 'bg-indigo-100 text-indigo-800' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {cantonment.required ? `${cantonment.cantonCount} cantons requis` : 'Canton unique'}
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-3">
          {cantonment.explanation}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Nombre de cantons</span>
            <span className="text-base font-bold text-slate-900">{cantonment.cantonCount}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Surface / canton max</span>
            <span className="text-base font-bold text-slate-900">{cantonment.maxAreaPerCanton.toFixed(0)} m²</span>
            <span className="text-[10px] text-slate-400">Plafond légal 1600 m²</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Retombée d'écran (hr)</span>
            <span className="text-base font-bold text-slate-900">≥ {cantonment.screenDepthM.toFixed(2)} m</span>
            <span className="text-[10px] text-slate-400">Écrans incombustibles DH 30</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Zone libre de fumée (H')</span>
            <span className="text-base font-bold text-slate-900">{cantonment.clearHeightM.toFixed(2)} m</span>
            <span className="text-[10px] text-slate-400">Épaisseur nappe E = {cantonment.smokeLayerThicknessM.toFixed(2)} m</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Calculations Results Panel according to Mode */}
      {mode === 'naturel' ? (
        /* Natural Smoke Ventilation */
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Dimensionnement du Désenfumage Naturel
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              DENFC / Toiture & Façade
            </span>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong>Règle appliquée : </strong>{natural.ruleUsed}
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <span className="text-xs font-semibold text-amber-800 block">
                Surface Utile Totale (SUE)
              </span>
              <div className="text-2xl font-extrabold text-amber-950 mt-1">
                {natural.sueTotalM2} <span className="text-sm font-semibold text-amber-700">m²</span>
              </div>
              <div className="text-[11px] text-amber-700 mt-1">
                {cantonment.cantonCount > 1 
                  ? `Soit ${natural.suePerCantonM2.toFixed(2)} m² par canton` 
                  : 'Surface géométrique corrigée du Cv'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200">
              <span className="text-xs font-semibold text-rose-800 block">
                Nombre de DENFC Requis
              </span>
              <div className="text-2xl font-extrabold text-rose-950 mt-1">
                {natural.denfcCountTotal} <span className="text-sm font-semibold text-rose-700">unités</span>
              </div>
              <div className="text-[11px] text-rose-700 mt-1">
                {cantonment.cantonCount > 1 
                  ? `${natural.denfcCountPerCanton} DENFC / canton` 
                  : `Modèle ${natural.selectedDENFC.name}`}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200">
              <span className="text-xs font-semibold text-sky-800 block">
                Amenée d'Air Libre Nécessaire
              </span>
              <div className="text-2xl font-extrabold text-sky-950 mt-1">
                {natural.airInletGeometricAreaM2} <span className="text-sm font-semibold text-sky-700">m²</span>
              </div>
              <div className="text-[11px] text-sky-700 mt-1">
                Surface libre en partie basse (h ≤ 1,0 m)
              </div>
            </div>
          </div>

          {/* DENFC Breakdown Details */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="font-semibold text-slate-800">
              Détail de l'appareil sélectionné : {natural.selectedDENFC.name}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
              <div>Dimensions : {natural.selectedDENFC.widthCm} × {natural.selectedDENFC.heightCm} cm</div>
              <div>Surface Av : {natural.selectedDENFC.avM2} m²</div>
              <div>Coeff. aéraulique Cv : {natural.selectedDENFC.cv}</div>
              <div>SUE unitaire : {natural.selectedDENFC.sueM2} m²</div>
            </div>
          </div>

          {/* Spacing & Positioning Rules */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Règles d'implantation & Positionnement (IT 246 § 3.6) :
            </h4>
            <ul className="text-xs text-slate-600 space-y-1">
              {natural.spacingRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        /* Mechanical Smoke Ventilation */
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Dimensionnement du Désenfumage Mécanique
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Extraction Forcée & Moto-ventilateurs
            </span>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong>Règle appliquée : </strong>{mechanical.ruleUsed}
          </div>

          {/* Flow Rate Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <span className="text-xs font-semibold text-blue-800 block">
                Débit d'Extraction Requis (Qext)
              </span>
              <div className="text-2xl font-extrabold text-blue-950 mt-1">
                {mechanical.extractionFlowRateM3h.toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-semibold text-blue-700">m³/h</span>
              </div>
              <div className="text-[11px] text-blue-700 mt-1">
                Soit <strong>{mechanical.extractionFlowRateM3s} m³/s</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200">
              <span className="text-xs font-semibold text-cyan-800 block">
                Amenée d'Air Mécanique / Compensation
              </span>
              <div className="text-2xl font-extrabold text-cyan-950 mt-1">
                {mechanical.airInletFlowRateM3h.toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-semibold text-cyan-700">m³/h</span>
              </div>
              <div className="text-[11px] text-cyan-700 mt-1">
                Qamenée = 0,6 × Qext (maintien en légère dépression)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
              <span className="text-xs font-semibold text-slate-700 block">
                Spécification Ventilateur
              </span>
              <div className="text-base font-bold text-slate-900 mt-1">
                {mechanical.fanSpecifications.fireRating}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Norme européenne NF EN 12101-3
              </div>
            </div>
          </div>

          {/* Duct & Grille Aeraulic Sizing */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-blue-600" />
              <span>Dimensionnement Aéraulique des Réseaux & Bouches</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-800 mb-1">
                  Bouches & Gaines d'Extraction (V ≤ 5 m/s)
                </div>
                <div className="text-slate-600">
                  Section totale libre requise : <strong>{mechanical.extractionDuctMinSectionM2} m²</strong> ({mechanical.extractionDuctMinSectionDm2} dm²)
                </div>
                <div className="text-slate-500 mt-1">
                  Exemple : {mechanical.suggestedExtractionGrilleCount} grille(s) de dimension 500 × 500 mm ou section équivalente.
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-800 mb-1">
                  Bouches d'Amenée d'Air (V ≤ 2 m/s à 3 m/s)
                </div>
                <div className="text-slate-600">
                  Section totale libre requise : <strong>{mechanical.airInletMinSectionM2} m²</strong> ({mechanical.airInletMinSectionDm2} dm²)
                </div>
                <div className="text-slate-500 mt-1">
                  Vitesse modérée pour éviter la déstratification de la nappe de fumée chaude.
                </div>
              </div>
            </div>

            {/* Interlocks & Electrical Requirements */}
            <div className="pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">
                Asservissements & Équipements Électriques Réglementaires :
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
                {mechanical.fanSpecifications.interlocks.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. Staircase Overpressure (if applicable) */}
      {overpressure && (
        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
            <h4 className="text-sm font-bold text-purple-900">
              Mise en Surpression de la Cage d'Escalier (Solution Réglementaire)
            </h4>
          </div>
          <div className="text-xs text-purple-800 space-y-1">
            <div>
              • <strong>Plage différentielle de pression : </strong>
              {overpressure.differentialPressureRangePa}
            </div>
            <div>
              • <strong>Vitesse d'air minimale porte ouverte : </strong>
              ≥ {overpressure.airSpeedOpenDoorMs} m/s
            </div>
            <ul className="mt-2 space-y-0.5 text-purple-700 text-[11px]">
              {overpressure.recommendations.map((rec, idx) => (
                <li key={idx}>— {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 5. Warnings and Notes */}
      {(warnings.length > 0 || notes.length > 0) && (
        <div className="space-y-2">
          {warnings.map((w, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}

          {notes.map((n, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
