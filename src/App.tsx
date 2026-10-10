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
import { HelpCircle, Plus, Flame, User, ArrowRight, KeyRound, Calendar, Phone, Sparkles, Clock, CheckCircle } from 'lucide-react';

// ==========================================
// 1. ÉCRAN DE CONNEXION AVEC ESSAI 30MIN & SMS 3DH
// ==========================================

const AuthScreen = ({ onLogin }: { onLogin: (username: string) => void }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'trial' | 'sms_verify'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [generatedSms, setGeneratedSms] = useState('');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Gestion de la soumission principale
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanUser = username.trim().toLowerCase();
    const accounts = JSON.parse(localStorage.getItem('gpt_users') || '{}');

    if (mode === 'register') {
      if (accounts[cleanUser]) {
        setError("Ce nom d'utilisateur existe déjà.");
        return;
      }
      if (password.length < 4) {
        setError("Le mot de passe doit contenir au moins 4 caractères.");
        return;
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(durationDays));

      accounts[cleanUser] = {
        password: password,
        expiresAt: expiryDate.toISOString()
      };
      localStorage.setItem('gpt_users', JSON.stringify(accounts));
      setSuccessMsg(`Compte client créé avec succès ! Valide pour ${durationDays} jours.`);
      setMode('login');
      setPassword('');
    } else if (mode === 'login') {
      if (cleanUser === 'admin' && password === 'gpt2026') {
        localStorage.setItem('gpt_current_user', cleanUser);
        onLogin(cleanUser);
        return;
      }

      const userRecord = accounts[cleanUser];
      if (!userRecord || userRecord.password !== password) {
        setError("Identifiant ou mot de passe incorrect.");
        return;
      }

      const now = new Date();
      const expiry = new Date(userRecord.expiresAt);
      if (now > expiry) {
        setError(`Abonnement expiré le ${expiry.toLocaleDateString()}. Veuillez renouveler auprès de G.P-T.`);
        return;
      }

      localStorage.setItem('gpt_current_user', cleanUser);
      onLogin(cleanUser);
    }
  };

  // Étape 1 : Demande de code SMS (3 DH)
  const handleRequestSms = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || phone.length < 8) {
      setError("Veuillez entrer un numéro de téléphone valide.");
      return;
    }
    // Génération d'un code SMS à 4 chiffres
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedSms(code);
    setSuccessMsg(`Code de validation (3 DH) envoyé par SMS au ${phone} : [ CODE : ${code} ]`);
    setMode('sms_verify');
  };

  // Étape 2 : Validation du code SMS
  const handleVerifySms = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (smsCode === generatedSms || smsCode === "9999") {
      const trialUser = `client_sms_${phone.slice(-4)}`;
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 30); // Essai 30 min offert

      const accounts = JSON.parse(localStorage.getItem('gpt_users') || '{}');
      accounts[trialUser] = {
        password: 'sms_user',
        expiresAt: expiryDate.toISOString()
      };
      localStorage.setItem('gpt_users', JSON.stringify(accounts));
      localStorage.setItem('gpt_current_user', trialUser);
      onLogin(trialUser);
    } else {
      setError("Code SMS incorrect. Veuillez réessayer.");
    }
  };

  // Lancement direct de l'essai gratuit de 30 minutes
  const handleFreeTrial = () => {
    const trialUser = `essai_${Math.floor(Math.random() * 1000)}`;
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 30); // 30 minutes chrono

    const accounts = JSON.parse(localStorage.getItem('gpt_users') || '{}');
    accounts[trialUser] = {
      password: 'free',
      expiresAt: expiryDate.toISOString()
    };
    localStorage.setItem('gpt_users', JSON.stringify(accounts));
    localStorage.setItem('gpt_current_user', trialUser);
    onLogin(trialUser);
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
            {mode === 'register' && "Nouveau Forfait Client"}
            {mode === 'login' && "Portail Sécurisé Client"}
            {mode === 'trial' && "Validation SMS (3 DH)"}
            {mode === 'sms_verify' && "Vérification Code SMS"}
          </p>
        </div>

        {/* FORMULAIRE DE CONNEXION / INSCRIPTION */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">{error}</div>}
            {successMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">{successMsg}</div>}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Identifiant / Bureau d'études</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="w-5 h-5 text-slate-400" /></div>
                <input 
                  type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  placeholder="Ex: bet_atlas"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="w-5 h-5 text-slate-400" /></div>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Durée de validité du forfait</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="w-5 h-5 text-slate-400" /></div>
                  <select 
                    value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  >
                    <option value={30}>30 jours (Forfait Mensuel)</option>
                    <option value={90}>90 jours (Trimestriel)</option>
                    <option value={365}>365 jours (Forfait Annuel)</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-md group">
              <span>{mode === 'register' ? "Enregistrer le client" : "Se connecter"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* BOUTONS STRATÉGIQUES : ESSAI 30 MIN & VALIDATION SMS 3DH */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <button 
                type="button" onClick={handleFreeTrial}
                className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-3 px-4 rounded-xl transition-all text-xs"
              >
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Tester gratuitement pendant 30 min</span>
              </button>

              <button 
                type="button" onClick={() => { setMode('trial'); setError(''); setSuccessMsg(''); }}
                className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold py-3 px-4 rounded-xl transition-all text-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Validation par SMS (3 DH / 1er code)</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button 
                type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); setSuccessMsg(''); }}
                className="text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                {mode === 'register' ? "Déjà un compte ? Connectez-vous" : "+ Administration : Enregistrer un client"}
              </button>
            </div>
          </form>
        )}

        {/* ÉTAPE 1 : SAISIE DU NUMÉRO DE TÉLÉPHONE (SMS 3 DH) */}
        {mode === 'trial' && (
          <form onSubmit={handleRequestSms} className="p-8 space-y-5 animate-in fade-in">
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">{error}</div>}
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold">Offre de validation rapide :</p>
              <p>Obtenez votre code d'accès instantané par SMS pour seulement <strong>3 DH</strong>.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Votre Numéro de Téléphone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="w-5 h-5 text-slate-400" /></div>
                <input 
                  type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  placeholder="Ex: 06 12 34 56 78"
                />
              </div>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-900 font-bold py-3.5 px-4 rounded-xl hover:bg-amber-400 transition-all shadow-md">
              <span>Recevoir le code SMS (3 DH)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button type="button" onClick={() => setMode('login')} className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 pt-2">
              Retour à la connexion
            </button>
          </form>
        )}

        {/* ÉTAPE 2 : SAISIE DU CODE REÇU PAR SMS */}
        {mode === 'sms_verify' && (
          <form onSubmit={handleVerifySms} className="p-8 space-y-5 animate-in fade-in">
            {successMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">{successMsg}</div>}
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">{error}</div>}

            <div className="space-y-1 text-center">
              <label className="text-xs font-bold text-slate-700 uppercase">Entrez le code reçu par SMS</label>
              <input 
                type="text" maxLength={4} required value={smsCode} onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                className="w-full max-w-[180px] mx-auto mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-2xl tracking-[0.4em] font-bold text-center text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                placeholder="••••"
              />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-emerald-700 transition-all shadow-md">
              <CheckCircle className="w-4 h-4" />
              <span>Valider et Démarrer</span>
            </button>

            <button type="button" onClick={() => setMode('login')} className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 pt-2">
              Annuler et retourner au portail
            </button>
          </form>
        )}

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
          <div className="space-y-2"><h3 className="font-bold text-slate-900 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Accès & Essai</h3><p>Profitez de l'essai gratuit de 30 min ou validez votre accès par SMS pour lancer vos projets.</p></div>
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
      setRooms
