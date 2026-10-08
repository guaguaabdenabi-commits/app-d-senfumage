import React from 'react';
import { RoomInput, BuildingCategory, ERPType, ERPCategory, HabitationFamily } from '../types/desenfumage';
import { calculateRoomDesenfumage } from '../services/calculator';
import { BUILDING_CATEGORIES_INFO, ERP_TYPES_INFO } from '../constants/regulations';
import { Flame, Printer, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PrintReportProps {
  rooms: RoomInput[];
  buildingName: string;
  address: string;
  author: string;
  category: BuildingCategory;
  erpType: ERPType;
  erpCategory: ERPCategory;
  habitationFamily: HabitationFamily;
  onClose: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  rooms,
  buildingName,
  address,
  author,
  category,
  erpType,
  erpCategory,
  habitationFamily,
  onClose,
}) => {
  const calculations = rooms.map((r) => ({
    room: r,
    calc: calculateRoomDesenfumage(r),
  }));

  const catInfo = BUILDING_CATEGORIES_INFO[category];
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white">
      {/* Top action bar (hidden in print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-xs hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'application</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Enregistrer en PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-xl shadow-lg p-8 sm:p-12 print:border-none print:shadow-none print:p-0 text-slate-800 text-xs">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded bg-rose-600 text-white flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                Note de Calculs de Désenfumage
              </h1>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Dimensionnement réglementaire sécurité incendie · Conforme IT 246 / R.4216 / ICPE
            </p>
          </div>

          <div className="text-right text-xs text-slate-600">
            <div>Date : <strong>{currentDate}</strong></div>
            <div>Dossier : <strong>DSF-{(buildingName || 'PROJ').substring(0, 8).toUpperCase()}-2026</strong></div>
            <div>Auteur : <strong>{author || 'Bureau d\'Études Incendie'}</strong></div>
          </div>
        </div>

        {/* Project & Building Metadata */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              Informations Bâtiment
            </span>
            <div className="font-bold text-slate-900 text-sm">{buildingName || 'Bâtiment non nommé'}</div>
            <div className="text-slate-600 mt-0.5">{address || 'Adresse non renseignée'}</div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              Classement Réglementaire
            </span>
            <div className="font-bold text-slate-900 text-sm">
              {category === 'erp'
                ? `ERP Type ${erpType} — ${erpCategory}ère/e Catégorie`
                : category === 'habitation'
                ? `Habitation Collective — Famille ${habitationFamily}`
                : catInfo.label}
            </div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              Texte de référence : {catInfo.regulatoryReference}
            </div>
          </div>
        </div>

        {/* Summary Table of all spaces */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase mb-2 border-b border-slate-200 pb-1">
            1. Récapitulatif Global des Zones & Ratios
          </h2>

          <table className="w-full text-left text-[11px] border border-slate-200">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-2 border-b border-slate-200">Zone / Local</th>
                <th className="p-2 border-b border-slate-200">Surface (S)</th>
                <th className="p-2 border-b border-slate-200">Mode</th>
                <th className="p-2 border-b border-slate-200">Assujetti</th>
                <th className="p-2 border-b border-slate-200">Cantons</th>
                <th className="p-2 border-b border-slate-200">SUE (m²) / Débit (m³/h)</th>
                <th className="p-2 border-b border-slate-200">Appareils</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculations.map(({ room, calc }) => (
                <tr key={room.id}>
                  <td className="p-2 font-semibold text-slate-900">
                    {room.name || 'Local'}
                    <span className="block text-[10px] text-slate-500 font-normal">
                      {room.length}m × {room.width}m · H={room.ceilingHeight}m
                    </span>
                  </td>
                  <td className="p-2">{room.area} m²</td>
                  <td className="p-2 capitalize">{room.mode}</td>
                  <td className="p-2">
                    {calc.isSubjectToDesenfumage ? 'Oui' : 'Non'}
                  </td>
                  <td className="p-2">
                    {calc.cantonment.cantonCount} ({calc.cantonment.maxAreaPerCanton.toFixed(0)} m²)
                  </td>
                  <td className="p-2 font-mono font-bold">
                    {room.mode === 'naturel'
                      ? `${calc.natural.sueTotalM2} m²`
                      : `${calc.mechanical.extractionFlowRateM3h.toLocaleString('fr-FR')} m³/h`}
                  </td>
                  <td className="p-2 font-semibold">
                    {room.mode === 'naturel'
                      ? `${calc.natural.denfcCountTotal}× ${calc.natural.selectedDENFC.name}`
                      : `${calc.mechanical.extractionFlowRateM3s} m³/s (F400 120)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Zone Calculations */}
        <div className="mb-6 space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-200 pb-1">
            2. Justifications Détaillées par Local
          </h2>

          {calculations.map(({ room, calc }, idx) => (
            <div key={room.id} className="p-4 border border-slate-200 rounded-lg space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  Zone #{idx + 1} : {room.name || 'Local'} ({room.spaceKind.replace('_', ' ')})
                </span>
                <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {room.mode === 'naturel' ? 'Désenfumage Naturel' : 'Désenfumage Mécanique'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                <div>Surface : <strong>{room.area} m²</strong></div>
                <div>Hauteur sous plafond : <strong>{room.ceilingHeight} m</strong></div>
                <div>Hauteur libre H' : <strong>{calc.cantonment.clearHeightM} m</strong></div>
                <div>Épaisseur fumée E : <strong>{calc.cantonment.smokeLayerThicknessM} m</strong></div>
              </div>

              <div className="text-[11px] bg-slate-50 p-2.5 rounded">
                <strong>Fondement réglementaire : </strong> {calc.regulatoryText} — {calc.subjectReason}
              </div>

              {room.mode === 'naturel' ? (
                <div className="space-y-1.5 text-[11px]">
                  <div className="font-semibold text-slate-800">
                    Règle de dimensionnement naturel : {calc.natural.ruleUsed}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2 border border-slate-200 rounded">
                      SUE Totale : <strong>{calc.natural.sueTotalM2} m²</strong>
                    </div>
                    <div className="p-2 border border-slate-200 rounded">
                      Quantité DENFC : <strong>{calc.natural.denfcCountTotal} exutoire(s)</strong>
                    </div>
                    <div className="p-2 border border-slate-200 rounded">
                      Amenée d'air libre : <strong>≥ {calc.natural.airInletGeometricAreaM2} m²</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-[11px]">
                  <div className="font-semibold text-slate-800">
                    Règle de dimensionnement mécanique : {calc.mechanical.ruleUsed}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2 border border-slate-200 rounded">
                      Débit Extraction : <strong>{calc.mechanical.extractionFlowRateM3h.toLocaleString('fr-FR')} m³/h</strong> ({calc.mechanical.extractionFlowRateM3s} m³/s)
                    </div>
                    <div className="p-2 border border-slate-200 rounded">
                      Amenée d'air (0,6) : <strong>{calc.mechanical.airInletFlowRateM3h.toLocaleString('fr-FR')} m³/h</strong>
                    </div>
                    <div className="p-2 border border-slate-200 rounded">
                      Section gaine (5 m/s) : <strong>{calc.mechanical.extractionDuctMinSectionM2} m²</strong> ({calc.mechanical.extractionDuctMinSectionDm2} dm²)
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Validation & Signatures */}
        <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-2 gap-6 text-[11px]">
          <div className="p-4 border border-slate-200 rounded-lg h-32 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 block">L'Ingénieur d'Études / Bureau d'Études :</span>
              <span className="text-slate-500 text-[10px]">{author || 'BET Fluides & Sécurité'}</span>
            </div>
            <div className="text-[10px] text-slate-400">Date, visa et signature :</div>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg h-32 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Le Contrôleur Technique / Bureau de Contrôle :</span>
              <span className="text-slate-500 text-[10px]">Visa de conformité sécurité incendie</span>
            </div>
            <div className="text-[10px] text-slate-400">Date, visa et signature :</div>
          </div>
        </div>
      </div>
    </div>
  );
};
