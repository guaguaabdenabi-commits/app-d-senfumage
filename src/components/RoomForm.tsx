import React from 'react';
import { RoomInput, SpaceKind, DesenfumageMode, BuildingCategory } from '../types/desenfumage';
import { STANDARD_DENFC_CATALOG } from '../constants/regulations';
import { Ruler, Wind, Box, ShieldCheck, Flame, Sliders } from 'lucide-react';

interface RoomFormProps {
  room: RoomInput;
  onChangeRoom: (updated: RoomInput) => void;
  buildingCategory: BuildingCategory;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  room,
  onChangeRoom,
  buildingCategory,
}) => {
  const updateField = <K extends keyof RoomInput>(field: K, value: RoomInput[K]) => {
    onChangeRoom({
      ...room,
      [field]: value,
    });
  };

  // Keep area, length, width synchronized if length and width change
  const handleDimensionChange = (field: 'area' | 'length' | 'width', val: number) => {
    const safeVal = Math.max(0.1, val || 0);
    if (field === 'area') {
      const currentRatio = room.length > 0 && room.width > 0 ? room.length / room.width : 1.5;
      const newWidth = Math.sqrt(safeVal / currentRatio);
      const newLength = safeVal / newWidth;
      onChangeRoom({
        ...room,
        area: Number(safeVal.toFixed(1)),
        length: Number(newLength.toFixed(1)),
        width: Number(newWidth.toFixed(1)),
      });
    } else if (field === 'length') {
      const newArea = safeVal * (room.width || 10);
      onChangeRoom({
        ...room,
        length: Number(safeVal.toFixed(1)),
        area: Number(newArea.toFixed(1)),
      });
    } else if (field === 'width') {
      const newArea = (room.length || 10) * safeVal;
      onChangeRoom({
        ...room,
        width: Number(safeVal.toFixed(1)),
        area: Number(newArea.toFixed(1)),
      });
    }
  };

  const spaceKindOptions: { id: SpaceKind; label: string; desc: string }[] = [
    {
      id: 'local',
      label: 'Local / Salle / Volume',
      desc: 'Pièce, magasin, atelier, zone de vente, réfectoire, salle polyvalente',
    },
    {
      id: 'circulation',
      label: 'Circulation encloisonnée',
      desc: 'Couloir, dégagement horizontal, coursive fermée',
    },
    {
      id: 'escalier',
      label: 'Cage d\'escalier encloisonnée',
      desc: 'Escalier d\'évacuation encloisonné (balayage ou surpression)',
    },
    {
      id: 'cellule_stockage',
      label: 'Cellule de stockage / Entrepôt',
      desc: 'Stockage de matières combustibles (ICPE 1510 / 2662 / 2663)',
    },
    {
      id: 'parking_box',
      label: 'Parc de stationnement',
      desc: 'Parking couvert, garage collectif ou sous-sol',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            2. Paramètres de la Zone / Local
          </h2>
          <p className="text-xs text-slate-500">
            Dimensions géométriques, implantation et système de désenfumage envisagé
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={room.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
            placeholder="Nom de la zone (ex: Hall principal)"
          />
        </div>
      </div>

      {/* Type of Space Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Destination & Nature de l'espace
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {spaceKindOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => updateField('spaceKind', opt.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                room.spaceKind === opt.id
                  ? 'bg-amber-50/60 border-amber-500 text-amber-950 ring-1 ring-amber-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold">{opt.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions Grid */}
      <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Ruler className="w-4 h-4 text-amber-600" />
          <span>Dimensions Géométriques Réelles</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Surface totale (S)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={room.area}
                onChange={(e) => handleDimensionChange('area', parseFloat(e.target.value))}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 pr-7 text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-2.5 top-2 text-xs text-slate-400">m²</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Longueur (L)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={room.length}
                onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value))}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 pr-7 text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-2.5 top-2 text-xs text-slate-400">m</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Largeur (W)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={room.width}
                onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 pr-7 text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-2.5 top-2 text-xs text-slate-400">m</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Hauteur sous plafond (H)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1.8"
                max="25"
                step="0.1"
                value={room.ceilingHeight}
                onChange={(e) => updateField('ceilingHeight', parseFloat(e.target.value) || 3)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 pr-7 text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-2.5 top-2 text-xs text-slate-400">m</span>
            </div>
          </div>
        </div>

        {/* Advanced clear smoke height */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 text-[11px]">
            Volume calculé : <strong>{(room.area * room.ceilingHeight).toFixed(0)} m³</strong>
            {room.spaceKind === 'local' && room.area > 1600 && (
              <span className="ml-2 text-rose-600 font-semibold">
                (Surface &gt; 1600 m² : cantonnement requis)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600">Hauteur zone libre (H') :</span>
            <input
              type="number"
              min="1.8"
              max={room.ceilingHeight - 0.5}
              step="0.1"
              value={room.clearSmokeHeight || Math.max(1.8, Number((room.ceilingHeight / 2).toFixed(1)))}
              onChange={(e) => updateField('clearSmokeHeight', parseFloat(e.target.value))}
              className="w-20 text-xs font-semibold bg-white border border-slate-300 rounded-md p-1 text-center"
            />
            <span className="text-xs text-slate-400">m (min 1,80m ou H/2)</span>
          </div>
        </div>
      </div>

      {/* Special Situation Checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={room.isBlind}
            onChange={(e) => updateField('isBlind', e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">Local aveugle</div>
            <div className="text-[10px] text-slate-500">Sans fenêtre directe sur l'extérieur</div>
          </div>
        </label>

        <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={room.isBasement}
            onChange={(e) => updateField('isBasement', e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">Local en sous-sol</div>
            <div className="text-[10px] text-slate-500">Seuil obligatoire dès 100 m²</div>
          </div>
        </label>

        <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={!!room.isSleepingRoom}
            onChange={(e) => updateField('isSleepingRoom', e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">Locaux à sommeil</div>
            <div className="text-[10px] text-slate-500">Hôtel (O), Hôpital (U), Internat (R)</div>
          </div>
        </label>
      </div>

      {/* Mode Selection */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Mode de désenfumage envisagé
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateField('mode', 'naturel')}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              room.mode === 'naturel'
                ? 'bg-amber-50/70 border-amber-500 text-amber-950 ring-1 ring-amber-500'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Désenfumage Naturel</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                Exutoires DENFC
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Évacuation des fumées par tirage thermique naturel via des exutoires en toiture ou ouvrants de façade et amenées d'air basses.
            </p>
          </button>

          <button
            type="button"
            onClick={() => updateField('mode', 'mecanique')}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              room.mode === 'mecanique'
                ? 'bg-blue-50/70 border-blue-500 text-blue-950 ring-1 ring-blue-500'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Désenfumage Mécanique</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                Moto-ventilateurs 400°C/2h
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Extraction motorisée forcée via gaines CF/RF et ventilateurs d'extraction (Q = 1 m³/s pour 100 m²) avec amenée d'air compensatoire.
            </p>
          </button>
        </div>
      </div>

      {/* DENFC Model Selector (if natural mode) */}
      {room.mode === 'naturel' && (
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Choix du modèle d'exutoire DENFC standard (NF EN 12101-2)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {STANDARD_DENFC_CATALOG.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField('selectedDENFCId', item.id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  room.selectedDENFCId === item.id
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="text-xs font-bold">{item.name}</div>
                <div className="text-[10px] opacity-90 mt-0.5">
                  Av = {item.avM2} m² · Cv = {item.cv} · <strong>SUE = {item.sueM2} m²</strong>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Parking specific vehicles count */}
      {room.spaceKind === 'parking_box' && (
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nombre d'emplacements de véhicules dans le parking
          </label>
          <input
            type="number"
            min="1"
            value={room.vehicleCount || Math.max(10, Math.round(room.area / 25))}
            onChange={(e) => updateField('vehicleCount', parseInt(e.target.value) || 10)}
            className="w-48 text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Règle de dimensionnement secours : 600 m³/h par véhicule (Arrêté 9 mai 2006).
          </p>
        </div>
      )}
    </div>
  );
};
