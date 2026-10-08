import React, { useState } from 'react';
import { X, BookOpen, FileText, CheckCircle, HelpCircle, Layers, Wind, ShieldAlert } from 'lucide-react';
import { GLOSSARY_ITEMS } from '../constants/regulations';

interface RegulatoryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegulatoryGuideModal: React.FC<RegulatoryGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'erp' | 'ert' | 'habitation' | 'icpe' | 'glossary'>('erp');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Mémento Réglementaire du Désenfumage
              </h2>
              <p className="text-xs text-slate-400">
                Synthèse des textes officiels français et européens (IT 246, Code du Travail, Habitation, ICPE)
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto text-xs">
          {[
            { id: 'erp', label: 'ERP & IT 246' },
            { id: 'ert', label: 'Code du Travail' },
            { id: 'habitation', label: 'Habitation (1986)' },
            { id: 'icpe', label: 'ICPE Entrepôts (1510)' },
            { id: 'glossary', label: 'Glossaire & Normes' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm">
          {activeTab === 'erp' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                <h3 className="font-bold text-amber-900 text-base mb-1">
                  Arrêté du 25 juin 1980 & Instruction Technique 246
                </h3>
                <p className="text-xs text-amber-800">
                  L'IT 246 (modifiée par l'arrêté du 22 mars 2004) fixe les règles applicables au désenfumage des Établissements Recevant du Public (ERP).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Seuils d'Assujettissement Obligatoire (Art. DF 3)
                  </h4>
                  <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
                    <li>Locaux en RDC ou étage de surface &gt; 300 m²</li>
                    <li>Locaux aveugles de surface &gt; 100 m²</li>
                    <li>Locaux en sous-sol de surface &gt; 100 m²</li>
                    <li>Escaliers encloisonnés (tous)</li>
                    <li>Circulations encloisonnées de plus de 30 m de longueur ou en sous-sol</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Règles de Cantonnement (IT 246 § 3.3)
                  </h4>
                  <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
                    <li>Superficie maximale d'un canton : 1600 m²</li>
                    <li>Longueur maximale d'un canton : 60 m</li>
                    <li>Écrans de cantonnement : retombée minimale de 0,5 m ou 25% de la hauteur</li>
                    <li>Matériaux incombustibles (DH 30 selon NF EN 12101-1)</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-blue-600" />
                  Méthodes de Calcul Forfaitaire
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <strong className="text-amber-800 block mb-1">Désenfumage Naturel :</strong>
                    <p className="text-slate-600">
                      Règle du 1/200ème : Surface Utile d'Évacuation (SUE) ≥ Surface au sol / 200 (soit 0,5%).
                      Amenée d'air libre ≥ SUE du plus grand canton, située en partie basse (h ≤ 1,00 m).
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <strong className="text-blue-800 block mb-1">Désenfumage Mécanique :</strong>
                    <p className="text-slate-600">
                      Débit d'extraction ≥ 1 m³/s pour 100 m² (mini absolu 1,5 m³/s par local).
                      Amenée d'air compensatoire = 0,6 × Débit d'extraction (pour maintenir une légère dépression).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ert' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                <h3 className="font-bold text-blue-900 text-base mb-1">
                  Code du Travail : Articles R. 4216-13 à R. 4216-17
                </h3>
                <p className="text-xs text-blue-800">
                  Applicable à tous les établissements assujettis au Code du Travail (bureaux, entrepôts non ICPE, ateliers industriels, laboratoires).
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-800 mb-1">Locaux Assujettis (Art. R. 4216-13) :</h4>
                  <p className="text-xs text-slate-600">
                    Sont obligatoirement désenfumés les locaux de plus de 300 m² situés en rez-de-chaussée et en étage, les locaux de plus de 100 m² aveugles ou situés en sous-sol, ainsi que tous les escaliers encloisonnés et circulations &gt; 30 m.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-800 mb-1">Dimensionnement Naturel (Arrêté 5 août 1992) :</h4>
                  <p className="text-xs text-slate-600">
                    Pour les locaux d'une surface inférieure ou égale à 1 000 m², la surface utile des évacuations de fumée doit être au moins égale à <strong>1% de la surface du local</strong> (1/100). Au-delà de 1 000 m², application des règles de l'IT 246 (1/200ème par canton).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-800 mb-1">Dimensionnement Mécanique :</h4>
                  <p className="text-xs text-slate-600">
                    Débit d'extraction minimal fixé à 1 m³/s par tranche de 100 m² de superficie de plancher (soit 36 m³/h/m²).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'habitation' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <h3 className="font-bold text-emerald-900 text-base mb-1">
                  Arrêté du 31 janvier 1986 Modifié (Bâtiments d'Habitation)
                </h3>
                <p className="text-xs text-emerald-800">
                  Régit la sécurité contre l'incendie dans les bâtiments d'habitation collective de la 1ère à la 4ème famille.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <strong className="text-slate-800 block font-bold">Escaliers Encloisonnés :</strong>
                  <p className="text-slate-600">
                    Obligation d'un exutoire en toiture de surface géométrique libre <strong>SGO ≥ 1 m²</strong>, avec dispositif de commande manuelle au rez-de-chaussée bien visible.
                  </p>
                  <p className="text-slate-600">
                    Amenée d'air en partie basse par ouvrant ou porte d'entrée. En 3e famille B et 4e famille, la mise en surpression mécanique est souvent privilégiée.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <strong className="text-slate-800 block font-bold">Circulations Protégées (3B et 4) :</strong>
                  <p className="text-slate-600">
                    <strong>Solution A :</strong> Conduits collectifs de désenfumage mécanique ou naturel desservant chaque niveau avec volets pare-flammes/coupe-feu.
                  </p>
                  <p className="text-slate-600">
                    <strong>Solution B :</strong> Balayage naturel ou mécanique avec débit minimal de 0,5 m³/s par tronçon de circulation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'icpe' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl">
                <h3 className="font-bold text-orange-900 text-base mb-1">
                  Arrêté du 11 avril 2017 : Entrepôts Couverts (ICPE 1510)
                </h3>
                <p className="text-xs text-orange-800">
                  Réglementation des installations classées pour la protection de l'environnement (stockage de matières combustibles).
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-slate-800">Exigences Spécifiques ICPE 1510 :</div>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>
                    <strong>Règle des 2% :</strong> La surface utile d'ouverture de l'ensemble des DENFC doit être au minimum égale à <strong>2% de la surface au sol de la cellule</strong> (SUE ≥ 0,02 × S).
                  </li>
                  <li>
                    <strong>Cantons de stockage :</strong> Superficie maximale d'un canton fixée à 1600 m² (ou 2600 m² selon prescriptions spécifiques).
                  </li>
                  <li>
                    <strong>Caractéristiques des DENFC :</strong> Résistance mécanique 1200 Joules (sécurité antichute), déclenchement thermique autonome à 93°C + télécommande pneumatique CO2.
                  </li>
                  <li>
                    <strong>Amenées d'air :</strong> Surface au moins égale à la surface utile des exutoires du plus grand canton.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-sm mb-2">
                Lexique & Définitions Normalisées du Désenfumage
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GLOSSARY_ITEMS.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <span className="font-bold text-slate-900 block mb-1 text-[13px]">
                      {item.term}
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Source : Journal Officiel de la République Française & Normes AFNOR
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};
