import React, { useState, useEffect } from 'react';
import { BuildingCategory, ERPType, ERPCategory, HabitationFamily, RoomInput } from './types/desenfumage';
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
import { HelpCircle, Plus, Flame, Lock, User, ArrowRight, ShieldCheck, ArrowLeft, KeyRound, UserPlus } from 'lucide-react';

// ==========================================
// 1. ÉCRAN DE CONNEXION & GESTION DES COMPTES LOCAUX
// ==========================================

const AuthScreen = ({ onLogin }: { onLogin: (username: string) => void }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Gestion de la soumission (Connexion ou Inscription)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanUser = username.trim().toLowerCase();
    const accounts = JSON.parse(localStorage.getItem('gpt_users') || '{}');

    if (isRegistering) {
      if (accounts[cleanUser]) {
        setError("Ce nom d'utilisateur existe déjà. Veuillez vous connecter.");
        return;
      }
      if (password.length < 4) {
        setError("Le mot de passe doit contenir au moins 4 caractères.");
        return;
      }
      // Enregistrement du compte
      accounts[cleanUser] = password;
      localStorage.setItem('gpt_users', JSON.stringify(accounts));
      setSuccessMsg("Compte créé avec succès ! Connectez-vous maintenant.");
      setIsRegistering(false);
      setPassword('');
    } else {
      // Vérification de la connexion (compte par défaut admin/admin inclus)
      const defaultAdminUser = 'admin';
      const defaultAdminPass = 'gpt2026';

      if ((cleanUser === defaultAdminUser && password === defaultAdminPass) || (accounts[cleanUser] && accounts[cleanUser] === password)) {
        localStorage.setItem('gpt_current_user', cleanUser);
        onLogin(cleanUser);
      } else {
        setError("Identifiant ou mot de passe incorrect.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform -rotate-3 hover:rotate-0 transition-transform">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">G.P-T Bureau d'Études</h1>
          <p className="text-sm font-medium text-amber-600 mt-1 uppercase tracking-widest">
            {isRegistering ? "Création de compte Ingénieur" : "Portail Sécurisé Client"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">
              {successMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Identifiant / Bureau d'études</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                placeholder="Ex: bureau_etudes_a"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Mot de passe personnel</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-md group">
            <span>{isRegistering ? "S'inscrire" : "Se connecter"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="text-center pt-2">
            <button 
              type="button" 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccessMsg(''); }}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              {isRegistering ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? Créer un accès"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. MODAL D'AIDE ET VARIABLES INITIALES
// ==========================================
const HelpModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-blue-50">
          <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2"><HelpCircle className="w-6 h-6 text-blue-600" />Cahier d'aide & Prise en main</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><HelpCircle className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 text-sm text-slate-700">
          <div className="space-y-2"><h3 className="font-bold text-slate-900 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Gestion des Projets</h3><p>Vos projets sont sauvegardés automatiquement dans votre espace personnel sécurisé.</p></div>
        </div>
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <button onClick={onClose} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">J'ai compris</button>
        </div>
      </div>
    </div>
  );
};

const INITIAL_ROOMS: RoomInput[] = [{ id: 'room-1', name: 'Zone Vente Principale (Hall)', buildingCategory: 'erp', erpType: 'M', erpCategory: '1', spaceKind: 'local', area: 600, length: 30, width: 20, ceilingHeight: 4.5, mode: 'naturel', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-140-140' }];

// ==========================================
// 3. APPLICATION PRINCIPALE
// ==========================================
export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Charger l'utilisateur connecté s'il existe en mémoire
  useEffect(() => {
    const savedUser = localStorage.getItem('gpt_current_user');
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  const [category, setCategory] = useState<BuildingCategory>('erp');
  const [erpType, setERPType] = useState<ERPType>('M');
  const [erpCategory, setERPCategory] = useState<ERPCategory>('1');
  const [habitationFamily, setHabitationFamily] = useState<HabitationFamily>('3B');

  const [buildingName, setBuildingName] = useState('Centre Commercial & Tertiaire Grand Ouest');
  const [address, setAddress] = useState('24 Avenue de la Grande Armée, 75017 Paris');
  const [author, setAuthor] = useState('G.P-T Bureau d\'Assistance Technique');

  const [rooms, setRooms] = useState<RoomInput[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>(INITIAL_ROOMS[0].id);

  const [activeMainTab, setActiveMainTab] = useState<'calc' | 'all-rooms'>('calc');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isPrintView, setIsPrintView] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const activeCalc = calculateRoomDesenfumage(activeRoom);

  const handleUpdateActiveRoom = (updated: RoomInput) => { setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r))); };
  
  const handleAddRoom = () => { 
    const newId = `room-${Date.now()}`; 
    setRooms((prev) => [...prev, { id: newId, name: `Local #${rooms.length + 1}`, buildingCategory: category, erpType, erpCategory, habitationFamily, spaceKind: 'local', area: 250, length: 20, width: 12.5, ceilingHeight: 3.5, mode: 'naturel', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-120-120' }]); 
    setActiveRoomId(newId); 
    setActiveMainTab('calc'); 
  };
  
  const handleDuplicateRoom = (id: string) => { 
    const target = rooms.find((r) => r.id === id); 
    if (target) { 
      const newId = `room-${Date.now()}`; 
      setRooms((prev) => [...prev, { ...target, id: newId, name: `${target.name} (Copie)` }]); 
      setActiveRoomId(newId); 
    } 
  };
  
  const handleDeleteRoom = (id: string) => { 
    if (rooms.length > 1) { 
      const filtered = rooms.filter((r) => r.id !== id); 
      setRooms(filtered); 
      if (activeRoomId === id) setActiveRoomId(filtered[0].id); 
    } 
  };

  const handleLoadTemplate = (type: 'erp_mall' | 'ert_office' | 'habitation_3b' | 'icpe_warehouse' | 'parking') => {
    if (type === 'erp_mall') {
      setCategory('erp'); setERPType('M'); setERPCategory('1'); setBuildingName('Centre Commercial Les Passerelles');
      setRooms([{ id: 'r1', name: 'Galerie Marchande Principale', buildingCategory: 'erp', erpType: 'M', erpCategory: '1', spaceKind: 'local', area: 1800, length: 90, width: 20, ceilingHeight: 5.5, mode: 'naturel', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-150-150' }]);
      setActiveRoomId('r1');
    } else if (type === 'ert_office') {
      setCategory('ert'); setBuildingName('Bâtiment Tertiaire & Bureaux Horizon');
      setRooms([{ id: 'r1', name: 'Open Space & Bureaux RDC', buildingCategory: 'ert', spaceKind: 'local', area: 450, length: 25, width: 18, ceilingHeight: 3.2, mode: 'mecanique', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-120-120' }]);
      setActiveRoomId('r1');
    } else if (type === 'icpe_warehouse') {
      setCategory('icpe'); setBuildingName('Plateforme Logistique ICPE 1510');
      setRooms([{ id: 'r1', name: 'Cellule Logistique A', buildingCategory: 'icpe', spaceKind: 'cellule_stockage', area: 3200, length: 80, width: 40, ceilingHeight: 11.5, mode: 'naturel', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-150-200' }]);
      setActiveRoomId('r1');
    } else if (type === 'habitation_3b') {
      setCategory('habitation'); setHabitationFamily('3B'); setBuildingName('Résidence Les Lilas (R+6)');
      setRooms([{ id: 'r1', name: 'Cage d\'Escalier Bâtiment A', buildingCategory: 'habitation', habitationFamily: '3B', spaceKind: 'escalier', area: 30, length: 6, width: 5, ceilingHeight: 21.0, mode: 'naturel', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-100-100' }]);
      setActiveRoomId('r1');
    } else if (type === 'parking') {
      setCategory('ps'); setBuildingName('Parc de Stationnement Souterrain République');
      setRooms([{ id: 'r1', name: 'Niveau -1 (80 places)', buildingCategory: 'ps', spaceKind: 'parking_box', area: 2000, length: 50, width: 40, ceilingHeight: 2.7, mode: 'mecanique', isBasement: true, isBlind: true, vehicleCount: 80, selectedDENFCId: 'denfc-120-120' }]);
      setActiveRoomId('r1');
    }
  };

  if (!currentUser) return <AuthScreen onLogin={(user) => setCurrentUser(user)} />;
  
  if (isPrintView) return <PrintReport rooms={rooms} buildingName={buildingName} address={address} author={author} category={category} erpType={erpType} erpCategory={erpCategory} habitationFamily={habitationFamily} onClose={() => setIsPrintView(false)} />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white relative">
      <Header 
        buildingName={buildingName} 
        onChangeBuildingName={setBuildingName} 
        onOpenGuide={() => setIsGuideOpen(true)} 
        onOpenChecklist={() => setIsChecklistOpen(true)} 
        onPrint={() => setIsPrintView(true)} 
        onAddRoom={handleAddRoom} 
        roomCount={rooms.length} 
      />
      
      {/* Barre de déconnexion rapide et info utilisateur */}
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex justify-between items-center">
        <span>Connecté en tant que : <strong className="text-amber-400 uppercase">{currentUser}</strong></span>
        <button 
          onClick={() => { localStorage.removeItem('gpt_current_user'); setCurrentUser(null); }}
          className="text-slate-400 hover:text-white underline font-medium"
        >
          Se déconnecter
        </button>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Modèles Types Prédéfinis :</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button type="button" onClick={() => handleLoadTemplate('erp_mall')} className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium">ERP Commerce</button>
            <button type="button" onClick={() => handleLoadTemplate('ert_office')} className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-medium">Bureaux ERT</button>
            <button type="button" onClick={() => handleLoadTemplate('icpe_warehouse')} className="px-2.5 py-1 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 font-medium">Entrepôt ICPE</button>
            <button type="button" onClick={() => handleLoadTemplate('habitation_3b')} className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium">Habitation</button>
            <button type="button" onClick={() => handleLoadTemplate('parking')} className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-medium">Parking</button>
          </div>
        </div>

        <BuildingSelector category={category} erpType={erpType} erpCategory={erpCategory} habitationFamily={habitationFamily} onChangeCategory={(c) => { setCategory(c); handleUpdateActiveRoom({ ...activeRoom, buildingCategory: c }); }} onChangeERPType={(t) => { setERPType(t); handleUpdateActiveRoom({ ...activeRoom, erpType: t }); }} onChangeERPCategory={(cat) => { setERPCategory(cat); handleUpdateActiveRoom({ ...activeRoom, erpCategory: cat }); }} onChangeHabitationFamily={(f) => { setHabitationFamily(f); handleUpdateActiveRoom({ ...activeRoom, habitationFamily: f }); }} />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap mr-1">Locaux étudiés :</span>
            {rooms.map((r, index) => (
              <button key={r.id} type="button" onClick={() => { setActiveRoomId(r.id); setActiveMainTab('calc'); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1.5 ${r.id === activeRoomId ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                <span>{r.name || `Local #${index + 1}`}</span><span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${r.id === activeRoomId ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200'}`}>{r.area}m²</span>
              </button>
            ))}
          </div>
          <div className="inline-flex p-1 bg-slate-100 rounded-lg shrink-0">
            <button onClick={() => setActiveMainTab('calc')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${activeMainTab === 'calc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Calculs & Schéma</button>
            <button onClick={() => setActiveMainTab('all-rooms')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${activeMainTab === 'all-rooms' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Dossier & Bilan Global</button>
          </div>
        </div>

        {activeMainTab === 'calc' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-6"><RoomForm room={activeRoom} onChangeRoom={handleUpdateActiveRoom} buildingCategory={category} /></div>
            <div className="lg:col-span-7 space-y-6"><ResultsView room={activeRoom} calc={activeCalc} /><SchematicDiagram room={activeRoom} calc={activeCalc} /></div>
          </div>
        ) : (
          <ProjectSummary rooms={rooms} activeRoomId={activeRoomId} onSelectRoom={(id) => { setActiveRoomId(id); setActiveMainTab('calc'); }} onAddRoom={handleAddRoom} onDuplicateRoom={handleDuplicateRoom} onDeleteRoom={handleDeleteRoom} buildingName={buildingName} onChangeBuildingName={setBuildingName} address={address} onChangeAddress={setAddress} author={author} onChangeAuthor={setAuthor} />
        )}
      </main>

      <button onClick={() => setIsHelpOpen(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center z-40"><HelpCircle className="w-7 h-7" /></button>
    </div>
  );
}
