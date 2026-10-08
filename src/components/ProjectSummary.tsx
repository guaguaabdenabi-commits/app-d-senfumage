import React from 'react';
import { RoomInput, CalculationResult, BuildingCategory } from '../types/desenfumage';
import { calculateRoomDesenfumage } from '../services/calculator';
import { 
  Building, 
  Trash2, 
  Copy, 
  Plus, 
  Flame, 
  Wind, 
  Cpu, 
  PackageCheck,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface ProjectSummaryProps {
  rooms: RoomInput[];
  activeRoomId: string;
  onSelectRoom: (id: string) => void;
  onAddRoom: () => void;
  onDuplicateRoom: (id: string) => void;
  onDeleteRoom: (id: string) => void;
  buildingName: string;
  onChangeBuildingName: (name: string) => void;
  address: string;
  onChangeAddress: (addr: string) => void;
  author: string;
  onChangeAuthor: (author: string) => void;
}

export const ProjectSummary: React.FC<ProjectSummaryProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  onAddRoom,
  onDuplicateRoom,
  onDeleteRoom,
  buildingName,
  onChangeBuildingName,
  address,
  onChangeAddress,
  author,
  onChangeAuthor,
}) => {
  // Compute calculations for all rooms
  const roomCalculations = rooms.map((r) => ({
    room: r,
    calc: calculateRoomDesenfumage(r),
  }));

  // Aggregate quantities
  let totalArea = 0;
  let totalDENFC = 0;
  let totalMechanicalFlowM3h = 0;
  let totalNaturalSueM2 = 0;
  let totalAirInletM2 = 0;
  let subjectRoomsCount = 0;

  const denfcCountsBySize: Record<string, number> = {};

  roomCalculations.forEach(({ room, calc }) => {
    totalArea += room.area;
    if (calc.isSubjectToDesenfumage) {
      subjectRoomsCount++;
    }

    if (room.mode === 'naturel' && calc.natural.denfcCountTotal > 0) {
      totalDENFC += calc.natural.denfcCountTotal;
      totalNaturalSueM2 += calc.natural.sueTotalM2;
      totalAirInletM2 += calc.natural.airInletGeometricAreaM2;

      const denfcName = calc.natural.selectedDENFC.name;
      denfcCountsBySize[denfcName] = (denfcCountsBySize[denfcName] || 0) + calc.natural.denfcCountTotal;
    } else if (room.mode === 'mecanique') {
      totalMechanicalFlowM3h += calc.mechanical.extractionFlowRateM3h;
    }
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
      {/* Project General Header Info */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              <span>Dossier Technique & Découpage Multi-Zones</span>
            </h2>
            <p className="text-xs text-slate-500">
              Gestion de l'ensemble des locaux et nomenclature globale du matériel incendie
            </p>
          </div>
          <button
            type="button"
            onClick={onAddRoom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Local</span>
          </button>
        </div>

        {/* Project fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Nom du Bâtiment / Opération
            </label>
            <input
              type="text"
              value={buildingName}
              onChange={(e) => onChangeBuildingName(e.target.value)}
              placeholder="ex: Centre Commercial Les Terrasses"
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Adresse / Localisation
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => onChangeAddress(e.target.value)}
              placeholder="ex: 12 avenue de la République, 75011 Paris"
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Ingénieur d'Études / BET
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => onChangeAuthor(e.target.value)}
              placeholder="ex: BET Sécurité Incendie Fluides"
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Rooms Table / Navigation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800">
            Zones & Locaux du Bâtiment ({rooms.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Cliquez pour charger et modifier les paramètres d'un local
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Zone / Local</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Surface</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Assujetti</th>
                <th className="py-2.5 px-3">Résultat Clé</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roomCalculations.map(({ room, calc }) => {
                const isActive = room.id === activeRoomId;
                return (
                  <tr
                    key={room.id}
                    onClick={() => onSelectRoom(room.id)}
                    className={`cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-amber-50/80 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        {room.name || 'Local sans nom'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {room.length}m × {room.width}m · H={room.ceilingHeight}m
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 capitalize">
                      {room.spaceKind.replace('_', ' ')}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {room.area} m²
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium ${
                        room.mode === 'naturel'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {room.mode === 'naturel' ? <Wind className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                        {room.mode === 'naturel' ? 'Naturel' : 'Mécanique'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`text-[11px] font-semibold ${
                        calc.isSubjectToDesenfumage ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        {calc.isSubjectToDesenfumage ? 'Oui (Obligatoire)' : 'Non'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {room.mode === 'naturel' ? (
                        <span>
                          <strong>{calc.natural.denfcCountTotal} DENFC</strong> (SUE {calc.natural.sueTotalM2} m²)
                        </span>
                      ) : (
                        <span>
                          <strong>{calc.mechanical.extractionFlowRateM3h.toLocaleString('fr-FR')} m³/h</strong> ({calc.mechanical.extractionFlowRateM3s} m³/s)
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDuplicateRoom(room.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteRoom(room.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill of Quantities / Equipment Summary (BOM) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Nomenclature & Bilan des Équipements de Sécurité Incendie
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            {subjectRoomsCount} local(aux) assujetti(s) / {rooms.length} analysé(s)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Surface Totale Étudiée</span>
            <span className="text-base font-bold text-slate-900">{totalArea.toFixed(0)} m²</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Total Exutoires (DENFC)</span>
            <span className="text-base font-bold text-rose-700">{totalDENFC} appareils</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">SUE {totalNaturalSueM2.toFixed(2)} m²</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Débit Extraction Mécanique</span>
            <span className="text-base font-bold text-blue-700">
              {totalMechanicalFlowM3h.toLocaleString('fr-FR')} m³/h
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {(totalMechanicalFlowM3h / 3600).toFixed(2)} m³/s
            </span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Amenées d'Air Libres</span>
            <span className="text-base font-bold text-sky-700">
              ≥ {totalAirInletM2.toFixed(2)} m²
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Partie basse h ≤ 1,0 m</span>
          </div>
        </div>

        {/* Breakdown of DENFC models if any */}
        {Object.keys(denfcCountsBySize).length > 0 && (
          <div className="pt-2 border-t border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 block mb-1">
              Répartition par modèle de DENFC :
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(denfcCountsBySize).map(([name, count]) => (
                <span
                  key={name}
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800 font-medium text-[11px]"
                >
                  <strong>{count}×</strong> {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
