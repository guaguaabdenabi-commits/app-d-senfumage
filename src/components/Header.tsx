import React from 'react';
import { Flame, BookOpen, ClipboardCheck, Printer, Plus, FolderDown } from 'lucide-react';

interface HeaderProps {
  buildingName: string;
  onOpenGuide: () => void;
  onOpenChecklist: () => void;
  onPrint: () => void;
  onAddRoom: () => void;
  roomCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  buildingName,
  onOpenGuide,
  onOpenChecklist,
  onPrint,
  onAddRoom,
  roomCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center shadow-inner">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  Désenfumage Expert
                </span>
                <span className="text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  IT 246 · R.4216 · ICPE
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate max-w-[220px] sm:max-w-xs">
                {buildingName ? `Projet : ${buildingName}` : 'Dimensionnement Réglementaire Sécurité Incendie'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Guide réglementaire et mémento des normes"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Mémento Normes</span>
            </button>

            <button
              type="button"
              onClick={onOpenChecklist}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Fiche de contrôle et vérification périodique"
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Fiche de Contrôle</span>
            </button>

            <button
              type="button"
              onClick={onAddRoom}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
              title="Ajouter une zone ou un local"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter Local</span>
              <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.2 rounded-full font-bold">
                {roomCount}
              </span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm"
              title="Exporter ou imprimer la note technique de calculs"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Rapport PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
