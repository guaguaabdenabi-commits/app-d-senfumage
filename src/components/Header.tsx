import React from 'react';
import { Flame, BookOpen, CheckSquare, Plus, FileText } from 'lucide-react';

interface HeaderProps {
  buildingName: string;
  onChangeBuildingName?: (name: string) => void;
  onOpenGuide: () => void;
  onOpenChecklist: () => void;
  onPrint: () => void;
  onAddRoom: () => void;
  roomCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  buildingName,
  onChangeBuildingName,
  onOpenGuide,
  onOpenChecklist,
  onPrint,
  onAddRoom,
  roomCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-sm">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight">Désenfumage Expert</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/50 text-amber-400 bg-amber-500/10 hidden sm:inline-block">
                IT 246 · R.4216 · ICPE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
            <span className="text-amber-500 font-medium">Projet :</span>
            {onChangeBuildingName ? (
              <input
                type="text"
                value={buildingName}
                onChange={(e) => onChangeBuildingName(e.target.value)}
                className="bg-transparent border-b border-dashed border-amber-500/50 text-amber-400 font-semibold focus:outline-none focus:border-amber-400 w-64 md:w-96 placeholder-amber-700/50 px-1"
                placeholder="Nom du projet..."
              />
            ) : (
              <span className="text-amber-400 font-semibold truncate max-w-[250px] md:max-w-md">{buildingName}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onOpenGuide} className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <BookOpen className="w-4 h-4" />
            Mémento Normes
          </button>
          <button onClick={onOpenChecklist} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg transition-colors">
            <CheckSquare className="w-4 h-4" />
            Fiche de Contrôle
          </button>
          
          <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>

          <button onClick={onAddRoom} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter Local</span>
            <span className="inline-block bg-amber-500/20 px-1.5 rounded">{roomCount}</span>
          </button>
          <button onClick={onPrint} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Rapport PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
