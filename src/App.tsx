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
  FileText,
  HelpCircle,
  X,
  Trash2,
  Copy
} from 'lucide-react';

// Composant interne pour le Cahier d'aide
const HelpModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-blue-50">
          <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Cahier d'aide & Prise en main
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 text-sm text-slate-700">
          
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> 
              Comment ajouter une nouvelle zone ?
            </h3>
            <p>Il y a deux façons d'ajouter un nouveau local à étudier :</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Cliquez sur le bouton <strong>"Dossier & Bilan Global"</strong> (en haut à droite des zones), puis descendez pour cliquer sur <strong>"Ajouter un nouveau local"</strong>.</li>
              <li>Ou utilisez simplement le bouton <strong>"+ Ajouter Local"</strong> tout en haut à droite de l'écran principal.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" /> 
              Comment naviguer entre les zones ?
            </h3>
            <p>Juste au-dessus des calculs, vous avez une barre contenant toutes vos zones <strong>(Locaux étudiés)</strong>. Cliquez simplement sur le nom de la zone que vous souhaitez afficher ou modifier. La zone active est encadrée en noir.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Copy className="w-5 h-5 text-blue-500" /> 
              Comment dupliquer une zone ?
            </h3>
            <p>Si vous avez plusieurs locaux identiques (ex: plusieurs réserves), cliquez sur le bouton <strong>"Dossier & Bilan Global"</strong>, trouvez la zone dans le tableau récapitulatif, et cliquez sur l'icône de duplication bleue. Vous n'aurez plus qu'à ajuster le nom.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" /> 
              Comment supprimer une zone ?
            </h3>
            <p>Pour supprimer un local qui ne vous sert plus :</p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600">
              <li>Allez dans l'onglet <strong>"Dossier & Bilan Global"</strong>.</li>
              <li>Dans le grand tableau récapitulatif, cliquez sur la <strong>corbeille rouge</strong> à droite de la ligne correspondante.</li>
              <li className="text-red-600 font-medium italic">Note : L'application vous empêchera de supprimer s'il ne reste qu'une seule zone. Il faut toujours au moins un local.</li>
            </ol>
          </div>

        </div>
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <button onClick={onClose} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [isHelpOpen, setIsHelpOpen] = useState(false); // NOUVEAU: Etat pour le cahier d'aide

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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white relative">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
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
            setHabitation
