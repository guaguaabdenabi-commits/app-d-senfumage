import React from 'react';
import { BuildingCategory, ERPType, ERPCategory, HabitationFamily } from '../types/desenfumage';
import { BUILDING_CATEGORIES_INFO, ERP_TYPES_INFO } from '../constants/regulations';
import { Building2, Briefcase, Home, Factory, Car, Landmark, Info } from 'lucide-react';

interface BuildingSelectorProps {
  category: BuildingCategory;
  erpType: ERPType;
  erpCategory: ERPCategory;
  habitationFamily: HabitationFamily;
  onChangeCategory: (cat: BuildingCategory) => void;
  onChangeERPType: (type: ERPType) => void;
  onChangeERPCategory: (cat: ERPCategory) => void;
  onChangeHabitationFamily: (fam: HabitationFamily) => void;
}

export const BuildingSelector: React.FC<BuildingSelectorProps> = ({
  category,
  erpType,
  erpCategory,
  habitationFamily,
  onChangeCategory,
  onChangeERPType,
  onChangeERPCategory,
  onChangeHabitationFamily,
}) => {
  const categoriesList: { id: BuildingCategory; label: string; icon: React.ReactNode; short: string }[] = [
    {
      id: 'erp',
      label: 'ERP (Recevant du Public)',
      short: 'ERP',
      icon: <Building2 className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'ert',
      label: 'Code du Travail (ERT)',
      short: 'Travail',
      icon: <Briefcase className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'habitation',
      label: 'Habitation Collective',
      short: 'Habitation',
      icon: <Home className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'icpe',
      label: 'ICPE Entrepôts (1510)',
      short: 'ICPE',
      icon: <Factory className="w-5 h-5 text-orange-600" />,
    },
    {
      id: 'ps',
      label: 'Parcs de Stationnement',
      short: 'Parking',
      icon: <Car className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 'igh',
      label: 'IGH (Grande Hauteur)',
      short: 'IGH',
      icon: <Landmark className="w-5 h-5 text-rose-600" />,
    },
  ];

  const currentInfo = BUILDING_CATEGORIES_INFO[category];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            1. Typologie & Classification Réglementaire
          </h2>
          <p className="text-xs text-slate-500">
            Détermine les textes de référence, seuils d'assujettissement et ratios de dimensionnement
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
          {currentInfo.badge}
        </span>
      </div>

      {/* Category Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {categoriesList.map((item) => {
          const isSelected = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeCategory(item.id)}
              className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="mb-2 p-1.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                {item.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {item.short}
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Specific Sub-options */}
      {category === 'erp' && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Type d'ERP (Activité de l'établissement)
            </label>
            <select
              value={erpType}
              onChange={(e) => onChangeERPType(e.target.value as ERPType)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {Object.entries(ERP_TYPES_INFO).map(([key, info]) => (
                <option key={key} value={key}>
                  Type {info.code} — {info.label} ({info.example})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catégorie de l'établissement (Capacité d'accueil)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['1', '2', '3', '4', '5'] as ERPCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onChangeERPCategory(cat)}
                  className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                    erpCategory === cat
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                  <span className="block text-[9px] font-normal text-opacity-80">
                    {cat === '5' ? 'Petits ERP' : '1er groupe'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {category === 'habitation' && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Famille de bâtiment d'habitation (Arrêté du 31 janvier 1986)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: '1', title: '1ère Famille', desc: 'Individuel isolé / R+1' },
              { id: '2', title: '2ème Famille', desc: 'Collectif R+3 max' },
              { id: '3A', title: '3ème Famille A', desc: 'R+7 max, distance escalier ≤ 7m' },
              { id: '3B', title: '3ème Famille B', desc: 'R+7 max, distance > 7m ou autres' },
              { id: '4', title: '4ème Famille', desc: 'H > 28m et ≤ 50m' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChangeHabitationFamily(f.id as HabitationFamily)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  habitationFamily === f.id
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="block text-xs font-bold">{f.title}</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">{f.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Regulatory Reminder Box */}
      <div className="mt-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">
            Texte d'application :{' '}
          </span>
          <span className="text-slate-600">{currentInfo.regulatoryReference}</span>
          <div className="text-slate-500 mt-1">
            <strong>Règle clé : </strong>
            {currentInfo.keyRule}
          </div>
        </div>
      </div>
    </div>
  );
};
