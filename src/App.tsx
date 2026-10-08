import React, { useState } from 'react';
import { 
  BuildingCategory, 
  ERPType, 
  ERPCategory, 
  HabitationFamily, 
  RoomInput 
} from './types/desenfumage';
import { calculateRoomDesenfumage } from './services/calculator';
import { Header } from './components/Header';
import { BuildingSelector } from './components/BuildingSelector';
import { RoomForm } from './components/RoomForm';
import { ResultsView } from './components/ResultsView';
import { SchematicDiagram } from './components/SchematicDiagram';
import { ProjectSummary } from './components/ProjectSummary';
import { RegulatoryGuideModal } from './components/RegulatoryGuideModal';
import { InspectionChecklist } from './components/InspectionChecklist';
import { PrintReport } from './components/PrintReport';
import { 
  Building2, 
  Layers, 
  Sparkles, 
  Plus, 
  Flame, 
  Wind, 
  Cpu, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight,
  FileText
} from 'lucide-react';

const INITIAL_ROOMS: RoomInput[] = [
  {
    id: 'room-1',
    name: 'Zone Vente Principale (Hall)',
    buildingCategory: 'erp',
    erpType: 'M',
    erpCategory: '1',
    spaceKind: 'local',
    area: 600,
    length: 30,
    width: 20,
    ceilingHeight: 4.5,
    clearSmokeHeight: 2.2,
    mode: 'naturel',
    isBasement: false,
    isBlind: false,
    selectedDENFCId: 'denfc-140-140',
  },
  {
    id: 'room-2',
    name: 'Réserve Aveugle RDC',
    buildingCategory: 'erp',
    erpType: 'M',
    erpCategory: '1',
    spaceKind: 'local',
    area: 180,
    length: 15,
    width: 12,
    ceilingHeight: 3.5,
    clearSmokeHeight: 1.8,
    mode: 'mecanique',
    isBasement: false,
    isBlind: true,
    selectedDENFCId: 'denfc-120-120',
  },
  {
    id: 'room-3',
    name: 'Circulation Centrale R+1',
    buildingCategory: 'erp',
    erpType: 'M',
    erpCategory: '1',
    spaceKind: 'circulation',
    area: 90,
    length: 45,
    width: 2,
    ceilingHeight: 2.8,
    clearSmokeHeight: 2.0,
    mode: 'mecanique',
    isBasement: false,
    isBlind: false,
    selectedDENFCId: 'denfc-100-100',
  },
  {
    id: 'room-4',
    name: 'Cage d\'Escalier Nord',
    buildingCategory: 'erp',
    erpType: 'M',
    erpCategory: '1',
    spaceKind: 'escalier',
    area: 32,
    length: 8,
    width: 4,
    ceilingHeight: 12.0,
    clearSmokeHeight: 2.5,
    mode: 'naturel',
    isBasement: false,
    isBlind: false,
    selectedDENFCId: 'denfc-100-100',
  },
];

export default function App() {
  // Global Project States
  const [category, setCategory] = useState<BuildingCategory>('erp');
  const [erpType, setERPType] = useState<ERPType>('M');
  const [erpCategory, setERPCategory] = useState<ERPCategory>('1');
  const [habitationFamily, setHabitationFamily] = useState<HabitationFamily>('3B');

  const [buildingName, setBuildingName] = useState('Centre Commercial & Tertiaire Grand Ouest');
  const [address, setAddress] = useState('24 Avenue de la Grande Armée, 75017 Paris');
  const [author, setAuthor] = useState('Cabinet Ingénierie Sécurité Incendie');

  const [rooms, setRooms] = useState<RoomInput[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>(INITIAL_ROOMS[0].id);

  // Active view tab in main view
  const [activeMainTab, setActiveMainTab] = useState<'calc' | 'all-rooms'>('calc');

  // Modals & Print
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isPrintView, setIsPrintView] = useState(false);

  // Active room data
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const activeCalc = calculateRoomDesenfumage(activeRoom);

  // Handlers for rooms
  const handleUpdateActiveRoom = (updated: RoomInput) => {
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleAddRoom = () => {
    const newId = `room-${Date.now()}`;
    const newRoom: RoomInput = {
      id: newId,
      name: `Local #${rooms.length + 1}`,
      buildingCategory: category,
      erpType,
      erpCategory,
      habitationFamily,
      spaceKind: 'local',
      area: 250,
      length: 20,
      width: 12.5,
      ceilingHeight: 3.5,
      clearSmokeHeight: 1.8,
      mode: 'naturel',
      isBasement: false,
      isBlind: false,
      selectedDENFCId: 'denfc-120-120',
    };
    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(newId);
    setActiveMainTab('calc');
  };

  const handleDuplicateRoom = (id: string) => {
    const target = rooms.find((r) => r.id === id);
    if (!target) return;
    const newId = `room-${Date.now()}`;
    const dup: RoomInput = {
      ...target,
      id: newId,
      name: `${target.name} (Copie)`,
    };
    setRooms((prev) => [...prev, dup]);
    setActiveRoomId(newId);
  };

  const handleDeleteRoom = (id: string) => {
    if (rooms.length <= 1) return;
    const filtered = rooms.filter((r) => r.id !== id);
    setRooms(filtered);
    if (activeRoomId === id) {
      setActiveRoomId(filtered[0].id);
    }
  };

  // Presets loader
  const handleLoadTemplate = (type: 'erp_mall' | 'ert_office' | 'habitation_3b' | 'icpe_warehouse' | 'parking') => {
    if (type === 'erp_mall') {
      setCategory('erp');
      setERPType('M');
      setERPCategory('1');
      setBuildingName('Centre Commercial Les Passerelles');
      setRooms([
        {
          id: 'r1',
          name: 'Galerie Marchande Principale',
          buildingCategory: 'erp',
          erpType: 'M',
          erpCategory: '1',
          spaceKind: 'local',
          area: 1800,
          length: 90,
          width: 20,
          ceilingHeight: 5.5,
          mode: 'naturel',
          isBasement: false,
          isBlind: false,
          selectedDENFCId: 'denfc-150-150',
        },
        {
          id: 'r2',
          name: 'Supermarché / Alimentaire',
          buildingCategory: 'erp',
          erpType: 'M',
          erpCategory: '1',
          spaceKind: 'local',
          area: 1200,
          length: 40,
          width: 30,
          ceilingHeight: 4.2,
          mode: 'naturel',
          isBasement: false,
          isBlind: false,
          selectedDENFCId: 'denfc-140-140',
        },
        {
          id: 'r3',
          name: 'Circulation de Desserte Arrière',
          buildingCategory: 'erp',
          erpType: 'M',
          erpCategory: '1',
          spaceKind: 'circulation',
          area: 120,
          length: 50,
          width: 2.4,
          ceilingHeight: 3.0,
          mode: 'mecanique',
          isBasement: false,
          isBlind: true,
          selectedDENFCId: 'denfc-100-100',
        },
      ]);
      setActiveRoomId('r1');
    } else if (type === 'ert_office') {
      setCategory('ert');
      setBuildingName('Bâtiment Tertiaire & Bureaux Horizon');
      setRooms([
        {
          id: 'r1',
          name: 'Open Space & Bureaux RDC',
          buildingCategory: 'ert',
          spaceKind: 'local',
          area: 450,
          length: 25,
          width: 18,
          ceilingHeight: 3.2,
          mode: 'mecanique',
          isBasement: false,
          isBlind: false,
          selectedDENFCId: 'denfc-120-120',
        },
        {
          id: 'r2',
          name: 'Archives Techniques Sous-sol',
          buildingCategory: 'ert',
          spaceKind: 'local',
          area: 150,
          length: 15,
          width: 10,
          ceilingHeight: 2.8,
          mode: 'mecanique',
          isBasement: true,
          isBlind: true,
          selectedDENFCId: 'denfc-100-100',
        },
        {
          id: 'r3',
          name: 'Escalier d\'Évacuation Principal',
          buildingCategory: 'ert',
          spaceKind: 'escalier',
          area: 28,
          length: 7,
          width: 4,
          ceilingHeight: 9.0,
          mode: 'naturel',
          isBasement: false,
          isBlind: false,
          selectedDENFCId: 'denfc-100-100',
        },
      ]);
      setActiveRoomId('r1');
    } else if (type === 'icpe_warehouse') {
      setCategory('icpe');
      setBuildingName('Plateforme Logistique ICPE 1510');
      setRooms([
        {
          id: 'r1',
          name: 'Cellule Logistique A',
          buildingCategory: 'icpe',
          spaceKind: 'cellule_stockage',
          area: 3200,
          length: 80,
          width: 40,
          ceilingHeight: 11.5,
          mode: 'naturel',
          isBasement: false,
          isBlind: false,
          selectedDENFCId: 'denfc-150-200',
        },
        {
          id: 'r2',
          name: 'Cellule Logistique B',
          buildingCategory: 'icpe',
          spaceKind: 'cellule_stockage',
          area: 2400,
          length: 60,
          width: 40,
          ceilingHeight: 11.5,
          mode: 'naturel',
          isBasement: false,
          isBlind: false,
          selectedDENFCId: 'denfc-150-200',
        },
      ]);
      setActiveRoomId('r1');
    } else if (type === 'habitation_3b') {
      setCategory('habitation');
      setHabitationFamily('3B');
      setBuildingName('Résidence Les Lilas (R+6)');
      setRooms([
        {
          id: 'r1',
          name: 'Cage d\'Escalier Bâtiment A',
          buildingCategory: 'habitation',
          habitationFamily: '3B',
          spaceKind: 'escalier',
          area: 30,
          length: 6,
          width: 5,
          ceilingHeight: 21.0,
          mode: 'naturel',
          isBasement: false,
          isBlind: false,
          selectedDENFCId: 'denfc-100-100',
        },
        {
          id: 'r2',
          name: 'Circulation Protégée Étage 3',
          buildingCategory: 'habitation',
          habitationFamily: '3B',
          spaceKind: 'circulation',
          area: 45,
          length: 22,
          width: 2,
          ceilingHeight: 2.6,
          mode: 'mecanique',
          isBasement: false,
          isBlind: false,
          selectedDENFCId: 'denfc-100-100',
        },
      ]);
      setActiveRoomId('r1');
    } else if (type === 'parking') {
      setCategory('ps');
      setBuildingName('Parc de Stationnement Souterrain République');
      setRooms([
        {
          id: 'r1',
          name: 'Niveau -1 (80 places)',
          buildingCategory: 'ps',
          spaceKind: 'parking_box',
          area: 2000,
          length: 50,
          width: 40,
          ceilingHeight: 2.7,
          mode: 'mecanique',
          isBasement: true,
          isBlind: true,
          vehicleCount: 80,
          selectedDENFCId: 'denfc-120-120',
        },
      ]);
      setActiveRoomId('r1');
    }
  };

  // If in printable report mode
  if (isPrintView) {
    return (
      <PrintReport
        rooms={rooms}
        buildingName={buildingName}
        address={address}
        author={author}
        category={category}
        erpType={erpType}
        erpCategory={erpCategory}
        habitationFamily={habitationFamily}
        onClose={() => setIsPrintView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        buildingName={buildingName}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenChecklist={() => setIsChecklistOpen(true)}
        onPrint={() => setIsPrintView(true)}
        onAddRoom={handleAddRoom}
        roomCount={rooms.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Rapid Templates Toolbar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-slate-800">
              Modèles Types Prédéfinis :
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleLoadTemplate('erp_mall')}
              className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium transition-colors"
            >
              ERP Commerce (Type M)
            </button>
            <button
              type="button"
              onClick={() => handleLoadTemplate('ert_office')}
              className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-medium transition-colors"
            >
              Bureaux (Code du Travail)
            </button>
            <button
              type="button"
              onClick={() => handleLoadTemplate('icpe_warehouse')}
              className="px-2.5 py-1 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 font-medium transition-colors"
            >
              Entrepôt ICPE 1510
            </button>
            <button
              type="button"
              onClick={() => handleLoadTemplate('habitation_3b')}
              className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium transition-colors"
            >
              Habitation Famille 3B
            </button>
            <button
              type="button"
              onClick={() => handleLoadTemplate('parking')}
              className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-medium transition-colors"
            >
              Parking Couvert
            </button>
          </div>
        </div>

        {/* 1. Building Selector */}
        <BuildingSelector
          category={category}
          erpType={erpType}
          erpCategory={erpCategory}
          habitationFamily={habitationFamily}
          onChangeCategory={(c) => {
            setCategory(c);
            // sync active room
            handleUpdateActiveRoom({ ...activeRoom, buildingCategory: c });
          }}
          onChangeERPType={(t) => {
            setERPType(t);
            handleUpdateActiveRoom({ ...activeRoom, erpType: t });
          }}
          onChangeERPCategory={(cat) => {
            setERPCategory(cat);
            handleUpdateActiveRoom({ ...activeRoom, erpCategory: cat });
          }}
          onChangeHabitationFamily={(f) => {
            setHabitationFamily(f);
            handleUpdateActiveRoom({ ...activeRoom, habitationFamily: f });
          }}
        />

        {/* Room Navigation Pill Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap mr-1">
              Locaux étudiés :
            </span>
            {rooms.map((r, index) => {
              const isCurrent = r.id === activeRoomId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setActiveRoomId(r.id);
                    setActiveMainTab('calc');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{r.name || `Local #${index + 1}`}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isCurrent ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {r.area}m²
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab switcher: Dimensionnement vs Recap */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setActiveMainTab('calc')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeMainTab === 'calc'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calculs & Schéma
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab('all-rooms')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeMainTab === 'all-rooms'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dossier & Bilan Global
            </button>
          </div>
        </div>

        {/* View Mode 1: Individual Room Calculator & Results & Schematic */}
        {activeMainTab === 'calc' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Room Form */}
            <div className="lg:col-span-5 space-y-6">
              <RoomForm
                room={activeRoom}
                onChangeRoom={handleUpdateActiveRoom}
                buildingCategory={category}
              />
            </div>

            {/* Right Column: Calculation Results & Visual Schematic */}
            <div className="lg:col-span-7 space-y-6">
              <ResultsView room={activeRoom} calc={activeCalc} />
              <SchematicDiagram room={activeRoom} calc={activeCalc} />
            </div>
          </div>
        ) : (
          /* View Mode 2: Multi-Room Management & Bill of Quantities */
          <div>
            <ProjectSummary
              rooms={rooms}
              activeRoomId={activeRoomId}
              onSelectRoom={(id) => {
                setActiveRoomId(id);
                setActiveMainTab('calc');
              }}
              onAddRoom={handleAddRoom}
              onDuplicateRoom={handleDuplicateRoom}
              onDeleteRoom={handleDeleteRoom}
              buildingName={buildingName}
              onChangeBuildingName={setBuildingName}
              address={address}
              onChangeAddress={setAddress}
              author={author}
              onChangeAuthor={setAuthor}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-slate-700">
              Désenfumage Expert
            </span>
            <span>· Conforme aux règles IT 246, R. 4216, ICPE 1510 & NF S 61-937</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-amber-600 font-medium"
            >
              Mémento Réglementaire
            </button>
            <button
              type="button"
              onClick={() => setIsChecklistOpen(true)}
              className="hover:text-amber-600 font-medium"
            >
              Fiche de Contrôle
            </button>
            <button
              type="button"
              onClick={() => setIsPrintView(true)}
              className="hover:text-amber-600 font-medium"
            >
              Imprimer Rapport
            </button>
          </div>
        </div>
      </footer>

      {/* Regulatory Handbook Modal */}
      <RegulatoryGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Inspection & Maintenance Checklist Modal */}
      <InspectionChecklist
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        buildingName={buildingName}
      />
    </div>
  );
}
