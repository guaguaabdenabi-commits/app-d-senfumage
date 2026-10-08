import React, { useState } from 'react';
import { X, ClipboardCheck, CheckSquare, Square, Printer, AlertCircle } from 'lucide-react';

interface InspectionChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  buildingName: string;
}

interface CheckItem {
  id: string;
  category: string;
  label: string;
  standard: string;
  checked: boolean;
  comment: string;
}

export const InspectionChecklist: React.FC<InspectionChecklistProps> = ({
  isOpen,
  onClose,
  buildingName,
}) => {
  const [items, setItems] = useState<CheckItem[]>([
    {
      id: '1',
      category: 'Exutoires & DENFC',
      label: 'Vérification visuelle de l\'état général des appareils (lanterneaux, dômes, joints, bavettes d\'étanchéité)',
      standard: 'NF S 61-933 § 7.1',
      checked: true,
      comment: 'Bon état général',
    },
    {
      id: '2',
      category: 'Exutoires & DENFC',
      label: 'Contrôle d\'ouverture complète et de fermeture de chaque DENFC en commande manuelle',
      standard: 'NF S 61-937-1',
      checked: true,
      comment: 'Ouverture nominale à 140° constatée',
    },
    {
      id: '3',
      category: 'Exutoires & DENFC',
      label: 'Contrôle de l\'état des cartouches de CO2 (pesée unitaire, vérification de la tare et de la date limite)',
      standard: 'NF S 61-938',
      checked: false,
      comment: 'Poids conforme à la tare gravée',
    },
    {
      id: '4',
      category: 'Exutoires & DENFC',
      label: 'Vérification du fusible thermique d\'autodéclenchement (tarage 93°C ou 70°C)',
      standard: 'NF EN 12101-2',
      checked: true,
      comment: 'Fusibles propres et non corrodés',
    },
    {
      id: '5',
      category: 'Désenfumage Mécanique',
      label: 'Essai de démarrage et rotation du ventilateur d\'extraction (classe F400 120)',
      standard: 'NF EN 12101-3',
      checked: true,
      comment: 'Démarrage en moins de 30 secondes',
    },
    {
      id: '6',
      category: 'Désenfumage Mécanique',
      label: 'Contrôle du pressostat différentiel (détection de débit effectif et report de signal au CMSI)',
      standard: 'NF S 61-932',
      checked: false,
      comment: 'Voyant de débit au CMSI fonctionnel',
    },
    {
      id: '7',
      category: 'Désenfumage Mécanique',
      label: 'Vérification de l\'ouverture synchronisée des volets et clapets coupe-feu d\'extraction',
      standard: 'NF S 61-937-2',
      checked: true,
      comment: 'Déclenchement DAS opérationnel',
    },
    {
      id: '8',
      category: 'Amenées d\'Air',
      label: 'Contrôle du déverrouillage des ouvrants de façade ou grilles motorisées d\'amenée d\'air frais',
      standard: 'IT 246 § 3.5',
      checked: true,
      comment: 'Section libre dégagée sans obstruction',
    },
    {
      id: '9',
      category: 'Écrans de Cantonnement',
      label: 'Contrôle de l\'intégrité des toiles incombustibles DH 30 et hauteur de retombée',
      standard: 'NF EN 12101-1',
      checked: true,
      comment: 'Retombée conforme aux calculs',
    },
    {
      id: '10',
      category: 'Commandes & Sécurité',
      label: 'Contrôle des boîtiers de commande manuelle DCM / DAC et signalisation sur le CMSI',
      standard: 'NF S 61-931',
      checked: true,
      comment: 'Plombage et vitre intacts',
    },
  ]);

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  const updateComment = (id: string, comment: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, comment } : it))
    );
  };

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Fiche de Contrôle & Essais Périodiques de Désenfumage
              </h2>
              <p className="text-xs text-slate-400">
                {buildingName ? `Bâtiment : ${buildingName} · ` : ''}Conforme NF S 61-933 & Règle APSAD R17
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Progression du contrôle :</span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {checkedCount} / {items.length} points validés
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer la Fiche</span>
          </button>
        </div>

        {/* Items List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {items.map((it) => (
            <div
              key={it.id}
              className={`p-3.5 rounded-xl border transition-all text-xs ${
                it.checked
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleCheck(it.id)}
                  className="mt-0.5 shrink-0 text-slate-700 hover:text-emerald-600 focus:outline-hidden"
                >
                  {it.checked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {it.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {it.standard}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Obs / Mesure :</span>
                    <input
                      type="text"
                      value={it.comment}
                      onChange={(e) => updateComment(it.id, e.target.value)}
                      placeholder="Commentaire ou valeur mesurée..."
                      className="flex-1 text-xs font-medium bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Périodicité minimale obligatoire : Annuelle (ou semestrielle en ERP 1ère catégorie).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
