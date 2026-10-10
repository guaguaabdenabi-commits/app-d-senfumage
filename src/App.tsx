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
// 1. ÉCRAN DE CONNEXION (MAGIC LINK POUR ESSAI)
// ==========================================
const AuthScreen = ({ onLogin }: { onLogin: (username: string) => void }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'trial' | 'sms_verify' | 'free_trial'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [generatedSms, setGeneratedSms] = useState('');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    const cleanUser = username.trim().toLowerCase();
    const accounts = JSON.parse(localStorage.getItem('gpt_users') || '{}');

    // INSCRIPTION CLASSIQUE (ADMIN)
    if (mode === 'register') {
      if (!termsAccepted) return setError("Veuillez lire et accepter les conditions générales.");
      if (accounts[cleanUser]) return setError("Cet identifiant existe déjà.");
      if (password.length < 4) return setError("Le mot de passe doit contenir au moins 4 caractères.");
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(durationDays));
      accounts[cleanUser] = { password, expiresAt: expiryDate.toISOString() };
      localStorage.setItem('gpt_users', JSON.stringify(accounts));
      
      setSuccessMsg(`Compte créé ! Valide pour ${durationDays} jours.`);
      setMode('login'); setPassword(''); setTermsAccepted(false);
    } 
    // INSCRIPTION ESSAI GRATUIT (MAGIC LINK - SANS MOT DE PASSE)
    else if (mode === 'free_trial') {
      if (!termsAccepted) return setError("Veuillez lire et accepter les conditions générales.");
      if (!cleanUser.includes('@')) return setError("Veuillez entrer une adresse e-mail valide.");
      if (accounts[cleanUser]) return setError("Cet e-mail a déjà été utilisé pour un essai ou un forfait.");

      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 30); // Expire dans 30 minutes
      
      // On sauvegarde l'e-mail avec un faux mot de passe caché
      accounts[cleanUser] = { password: 'magic_link_token', expiresAt: expiryDate.toISOString(), isTrial: true };
      localStorage.setItem('gpt_users', JSON.stringify(accounts));
      
      setSuccessMsg("Lien d'accès envoyé à votre e-mail ! (Simulation : Ouverture automatique...)");
      
      // Simulation du clic sur le lien magique après 2 secondes
      setTimeout(() => {
        localStorage.setItem('gpt_current_user', cleanUser);
        onLogin(cleanUser);
      }, 2500);
    } 
    // CONNEXION NORMALE
    else if (mode === 'login') {
      if (cleanUser === 'admin' && password === 'gpt2026') {
        localStorage.setItem('gpt_current_user', cleanUser);
        return onLogin(cleanUser);
      }
      const userRecord = accounts[cleanUser];
      if (!userRecord || userRecord.password !== password) return setError("Identifiant ou mot de passe incorrect.");
      if (new Date() > new Date(userRecord.expiresAt)) return setError("Abonnement ou Essai expiré. Veuillez renouveler auprès de G.P-T.");
      
      localStorage.setItem('gpt_current_user', cleanUser);
      onLogin(cleanUser);
    }
  };

  const handleRequestSms = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!termsAccepted) return setError("Veuillez lire et accepter les conditions générales.");
    if (!phone || phone.length < 8) return setError("Numéro invalide.");
    
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedSms(code);
    setSuccessMsg(`Code de validation envoyé au ${phone} : [ CODE : ${code} ]`);
    setMode('sms_verify');
  };

  const handleVerifySms = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (smsCode === generatedSms || smsCode === "9999") {
      const trialUser = `client_sms_${phone.slice(-4)}`;
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 30);
      
      const accounts = JSON.parse(localStorage.getItem('gpt_users') || '{}');
      accounts[trialUser] = { password: 'sms_user', expiresAt: expiryDate.toISOString() };
      localStorage.setItem('gpt_users', JSON.stringify(accounts));
      localStorage.setItem('gpt_current_user', trialUser);
      onLogin(trialUser);
    } else {
      setError("Code SMS incorrect.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-white relative overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform -rotate-3 hover:rotate-0 transition-transform">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">G.P-T Bureau d'Études</h1>
          <p className="text-sm font-medium text-amber-600 mt-1 uppercase tracking-widest">
            {mode === 'register' && "Nouveau Forfait Client"}
            {mode === 'login' && "Portail Sécurisé Client"}
            {mode === 'free_trial' && "Essai Gratuit (30 Min)"}
            {mode === 'trial' && "Validation par SMS"}
            {mode === 'sms_verify' && "Vérification Code SMS"}
          </p>
        </div>

        {(mode === 'login' || mode === 'register' || mode === 'free_trial') && (
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">{error}</div>}
            {successMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">{successMsg}</div>}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                {mode === 'free_trial' ? "E-mail (Pour recevoir le lien)" : "Identifiant / Bureau"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="w-5 h-5 text-slate-400" /></div>
                <input 
                  type={mode === 'free_trial' ? "email" : "text"} 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none" 
                  placeholder={mode === 'free_trial' ? "votre@email.com" : "Ex: bet_atlas"} 
                />
              </div>
            </div>

            {/* LE MOT DE PASSE EST MASQUÉ POUR L'ESSAI GRATUIT */}
            {mode !== 'free_trial' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="w-5 h-5 text-slate-400" /></div>
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Durée du forfait</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="w-5 h-5 text-slate-400" /></div>
                  <select value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value={30}>30 jours (Mensuel)</option>
                    <option value={90}>90 jours (Trimestriel)</option>
                    <option value={365}>365 jours (Annuel)</option>
                  </select>
                </div>
              </div>
            )}
            
            {(mode === 'register' || mode === 'free_trial') && (
              <label className="flex items-start gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-amber-500 rounded bg-slate-50 border-slate-300" />
                <span className="text-xs font-medium text-slate-600 leading-tight">J'ai lu et j'accepte les <a href="#" className="text-amber-600 hover:underline">conditions générales d'utilisation</a>.</span>
              </label>
            )}

            <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-md group">
              <span>
                {mode === 'register' ? "Enregistrer" : mode === 'free_trial' ? "Recevoir mon lien d'essai" : "Se connecter"}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {mode === 'login' && (
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <button type="button" onClick={() => { setMode('free_trial'); setError(''); setSuccessMsg(''); setUsername(''); setPassword(''); setTermsAccepted(false); }} className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-3 px-4 rounded-xl transition-all text-xs">
                  <Clock className="w-4 h-4 text-emerald-600" /><span>Tester gratuitement 30 min</span>
                </button>
                <button type="button" onClick={() => { setMode('trial'); setError(''); setSuccessMsg(''); setTermsAccepted(false); }} className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold py-3 px-4 rounded-xl transition-all text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" /><span>Validation par SMS</span>
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              {mode !== 'login' ? (
                <button type="button" onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setTermsAccepted(false); }} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                  Retour à la connexion
                </button>
              ) : (
                <button type="button" onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); setTermsAccepted(false); }} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                  + Administration : Enregistrer un client
                </button>
              )}
            </div>
          </form>
        )}

        {mode === 'trial' && (
          <form onSubmit={handleRequestSms} className="p-8 space-y-5 animate-in fade-in">
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">{error}</div>}
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold">Offre de validation rapide :</p>
              <p>Obtenez votre code d'accès par SMS pour débloquer votre espace.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Numéro de Téléphone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="w-5 h-5 text-slate-400" /></div>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Ex: 06 12 34 56 78" />
              </div>
            </div>
            
            <label className="flex items-start gap-2 cursor-pointer pt-2">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-amber-500 rounded bg-slate-50 border-slate-300" />
              <span className="text-xs font-medium text-slate-600 leading-tight">J'ai lu et j'accepte les <a href="#" className="text-amber-600 hover:underline">conditions générales d'utilisation</a>.</span>
            </label>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-900 font-bold py-3.5 px-4 rounded-xl hover:bg-amber-400 transition-all shadow-md">
              <span>Recevoir le code SMS</span><ArrowRight className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => { setMode('login'); setTermsAccepted(false); }} className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 pt-2">Retour à la connexion</button>
          </form>
        )}

        {mode === 'sms_verify' && (
          <form onSubmit={handleVerifySms} className="p-8 space-y-5 animate-in fade-in">
            {successMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">{successMsg}</div>}
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">{error}</div>}
            <div className="space-y-1 text-center">
              <label className="text-xs font-bold text-slate-700 uppercase">Code reçu par SMS</label>
              <input type="text" maxLength={4} required value={smsCode} onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))} className="w-full max-w-[180px] mx-auto mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-2xl tracking-[0.4em] font-bold text-center text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="••••" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-emerald-700 transition-all shadow-md">
              <CheckCircle className="w-4 h-4" /><span>Valider et Démarrer</span>
            </button>
            <button type="button" onClick={() => setMode('login')} className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 pt-2">Annuler et retourner</button>
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

const INITIAL_ROOMS: RoomInput[] = [{ id: 'room-1', name: 'Zone Vente Principale', buildingCategory: 'erp', erpType: 'M', erpCategory: '1', spaceKind: 'local', area: 600, length: 30, width: 20, ceilingHeight: 4.5, mode: 'naturel', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-140-140' }];

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

  const [buildingName, setBuildingName] = useState('Centre Commercial Grand Ouest');
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
    setActiveRoomId(newId); setActiveMainTab('calc'); 
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

  const handleLoadTemplate = (type: string) => {
    if (type === 'erp_mall') {
      setCategory('erp'); setERPType('M'); setERPCategory('1'); setBuildingName('Centre Commercial');
      setRooms([{ id: 'r1', name: 'Galerie Marchande', buildingCategory: 'erp', erpType: 'M', erpCategory: '1', spaceKind: 'local', area: 1800, length: 90, width: 20, ceilingHeight: 5.5, mode: 'naturel', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-150-150' }]);
      setActiveRoomId('r1');
    } else if (type === 'ert_office') {
      setCategory('ert'); setBuildingName('Bureaux Horizon');
      setRooms([{ id: 'r1', name: 'Open Space', buildingCategory: 'ert', spaceKind: 'local', area: 450, length: 25, width: 18, ceilingHeight: 3.2, mode: 'mecanique', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-120-120', erpType: 'M', erpCategory:'1', habitationFamily:'3B' }]);
      setActiveRoomId('r1');
    } else if (type === 'icpe_warehouse') {
      setCategory('icpe'); setBuildingName('Plateforme Logistique');
      setRooms([{ id: 'r1', name: 'Cellule A', buildingCategory: 'icpe', spaceKind: 'cellule_stockage', area: 3200, length: 80, width: 40, ceilingHeight: 11.5, mode: 'naturel', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-150-200', erpType: 'M', erpCategory:'1', habitationFamily:'3B' }]);
      setActiveRoomId('r1');
    } else if (type === 'habitation_3b') {
      setCategory('habitation'); setHabitationFamily('3B'); setBuildingName('Résidence');
      setRooms([{ id: 'r1', name: 'Cage Escalier', buildingCategory: 'habitation', habitationFamily: '3B', spaceKind: 'escalier', area: 30, length: 6, width: 5, ceilingHeight: 21.0, mode: 'naturel', isBasement: false, isBlind: false, selectedDENFCId: 'denfc-100-100', erpType: 'M', erpCategory:'1' }]);
      setActiveRoomId('r1');
    } else if (type === 'parking') {
      setCategory('ps'); setBuildingName('Parking');
      setRooms([{ id: 'r1', name: 'Niveau -1', buildingCategory: 'ps', spaceKind: 'parking_box', area: 2000, length: 50, width: 40, ceilingHeight: 2.7, mode: 'mecanique', isBasement: true, isBlind: true, vehicleCount: 80, selectedDENFCId: 'denfc-120-120', erpType: 'M', erpCategory:'1', habitationFamily:'3B' }]);
      setActiveRoomId('r1');
    }
  };

  if (!currentUser) return <AuthScreen onLogin={(user) => setCurrentUser(user)} />;
  
  if (isPrintView) return <PrintReport rooms={rooms} buildingName={buildingName} address={address} author={author} category={category} erpType={erpType} erpCategory={erpCategory} habitationFamily={habitationFamily} onClose={() => setIsPrintView(false)} />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white relative">
      <Header buildingName={buildingName} onChangeBuildingName={setBuildingName} onOpenGuide={() => setIsGuideOpen(true)} onOpenChecklist={() => setIsChecklistOpen(true)} onPrint={() => setIsPrintView(true)} onAddRoom={handleAddRoom} roomCount={rooms.length} />
      
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex justify-between items-center">
        <span>Connecté en tant que : <strong className="text-amber-400 uppercase">{currentUser}</strong></span>
        <button onClick={() => { localStorage.removeItem('gpt_current_user'); setCurrentUser(null); }} className="text-slate-400 hover:text-white underline font-medium">Se déconnecter</button>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-800">Modèles Types Prédéfinis :</span></div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button type="button" onClick={() => handleLoadTemplate('erp_mall')} className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-medium">ERP Commerce</button>
            <button type="button" onClick={() => handleLoadTemplate('ert_office')} className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 font-medium">Bureaux ERT</button>
            <button type="button" onClick={() => handleLoadTemplate('icpe_warehouse')} className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-900 border border-orange-200 font-medium">Entrepôt ICPE</button>
            <button type="button" onClick={() => handleLoadTemplate('habitation_3b')} className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">Habitation</button>
            <button type="button" onClick={() => handleLoadTemplate('parking')} className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-900 border border-purple-200 font-medium">Parking</button>
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

      <button onClick={() => setIsHelpOpen(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center z-40">
        <HelpCircle className="w-7 h-7" />
      </button>

      {/* LA LIGNE MAGIQUE À AJOUTER EST JUSTE ICI 👇 */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

    </div>
  );
}
// FIN ABSOLUE DU FICHIER APP.TSX
