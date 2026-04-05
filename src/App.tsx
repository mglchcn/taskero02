import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc, addDoc } from 'firebase/firestore';
import { 
  ShieldCheck, Key, CheckCircle, Search, Users, ChevronRight, 
  QrCode, Smartphone, Clock, AlertCircle, Settings, Crown, 
  ChevronLeft, Activity, Lock, LogOut, UserCog, Shield,
  Mail, User as UserIcon, MapPin, Briefcase, Edit2, 
  MessageCircle, Send, Trash2, Edit
} from 'lucide-react';

// --- 0. INYECCIÓN FORZADA DE TAILWIND CSS ---
if (typeof document !== 'undefined' && !document.getElementById('tailwind-cdn')) {
  const script = document.createElement('script');
  script.id = 'tailwind-cdn';
  script.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(script);
}

// --- 1. CONFIGURACIÓN DE FIREBASE DIRECTA PARA VERCEL ---
const firebaseConfig = {
  apiKey: "AIzaSyDOFa4obbtn4RU6dkgaxZSdBYXdqkMVKfQ",
  authDomain: "taskeroapp-1023a.firebaseapp.com",
  projectId: "taskeroapp-1023a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'taskeroapp-1023a';

// ==============================================================================
// COMPONENTES DE VISTA AISLADOS
// ==============================================================================

const AdminLoginView = ({ p }: { p: any }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleAdminLogin = async (e: any) => {
    e.preventDefault();
    setIsLoggingIn(true); setLoginError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (email === 'admin@taskero.com' && password === 'admin123') {
         try {
           const { user } = await createUserWithEmailAndPassword(auth, email, password);
           await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
             id: user.uid,
             role: 'superadmin',
             name: 'Dueño del Sistema',
             createdAt: Date.now()
           });
           p.setCurrentView('admin');
           return; 
         } catch (createErr: any) {
           setLoginError('Error al crear Súper Usuario: ' + createErr.message);
           setIsLoggingIn(false);
         }
      } else {
        setLoginError('Credenciales incorrectas o usuario no registrado.');
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
      <div className="w-full max-w-sm relative z-10 animate-in fade-in duration-500">
        <button onClick={() => p.setCurrentView('gate')} className="absolute -top-12 left-0 text-slate-500 hover:text-slate-300 flex items-center text-sm font-bold"><ChevronLeft size={16}/> Volver</button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-purple-500/30 bg-slate-900 shadow-[0_0_30px_rgba(168,85,247,0.15)] mb-4">
            <Shield size={28} className="text-purple-500" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Acceso Administrativo</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Portal de Súper Usuarios</p>
        </div>
        <form onSubmit={handleAdminLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label>
              <input type="email" required value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="admin@taskero.com" className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Contraseña</label>
              <input type="password" required value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-purple-500" />
            </div>
          </div>
          {loginError && <div className="mt-4 text-red-400 text-xs font-bold text-center bg-red-400/10 py-2 rounded-lg px-2">{loginError}</div>}
          <button disabled={isLoggingIn || !email || !password} type="submit" className="w-full mt-6 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
            {isLoggingIn ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

const LoginView = ({ p }: { p: any }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setIsLoggingIn(true); setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError('Correo o contraseña incorrectos.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
      <div className="w-full max-w-sm relative z-10 animate-in fade-in duration-500">
        <button onClick={() => p.setCurrentView('gate')} className="absolute -top-12 left-0 text-slate-500 hover:text-slate-300 flex items-center text-sm font-bold"><ChevronLeft size={16}/> Volver a la Puerta</button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-amber-500/30 bg-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.15)] mb-4">
            <Crown size={28} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-serif tracking-widest mb-1">BIENVENIDO</h1>
          <p className="text-xs text-amber-500/80 uppercase tracking-[0.2em] font-bold">Inicia Sesión en la Red</p>
        </div>
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label>
              <input type="email" required value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Contraseña</label>
              <input type="password" required value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-amber-500" />
            </div>
          </div>
          {loginError && <div className="mt-4 text-red-400 text-xs font-bold text-center bg-red-400/10 py-2 rounded-lg px-2">{loginError}</div>}
          <button disabled={isLoggingIn || !email || !password} type="submit" className="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
            {isLoggingIn ? 'Entrando...' : 'Ingresar a mi cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};

const GateView = ({ p }: { p: any }) => {
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleValidateCode = async (e: any) => {
    e.preventDefault();
    setIsProcessing(true); setError('');
    try {
      const codeToTest = p.inviteCodeInput.trim().toUpperCase();
      const codeRef = doc(db, 'artifacts', appId, 'public', 'data', 'invite_codes', codeToTest);
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists() && (codeSnap.data() as any).status === 'active') {
        p.setValidatedCodeData({ id: codeSnap.id, ...(codeSnap.data() as any) });
        p.setCurrentView('register'); 
      } else if (codeToTest === 'VIP-DEMO' || codeToTest === 'TSK-DEMO') {
        p.setValidatedCodeData({ id: codeToTest, type: codeToTest === 'VIP-DEMO' ? 'client_vip' : 'taskero_elite', createdBy: 'admin_master' });
        p.setCurrentView('register'); 
      } else {
        setError('Código de acceso inválido o expirado.');
      }
    } catch (err) { setError('Error de conexión con la base de datos.'); }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
      <div className="w-full max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-amber-500/30 bg-slate-900 shadow-[0_0_40px_rgba(245,158,11,0.15)] mb-6">
            <Crown size={32} className="text-amber-500" />
          </div>
          <h1 className="text-3xl font-serif tracking-widest mb-2">TASKERO</h1>
          <p className="text-xs tracking-[0.3em] text-amber-500/80 uppercase font-bold">Círculo Privado</p>
        </div>
        <form onSubmit={handleValidateCode} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Ingresa tu credencial</label>
          <div className="relative">
            <Key className="absolute left-4 top-4 text-slate-500" size={20} />
            <input type="text" value={p.inviteCodeInput} onChange={(e: any) => p.setInviteCodeInput(e.target.value)} placeholder="Ej: VIP-DEMO" className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-12 py-4 rounded-xl outline-none focus:border-amber-500 text-center font-mono text-lg tracking-widest uppercase" />
          </div>
          {error && <div className="text-red-400 text-xs font-medium text-center">{error}</div>}
          <button disabled={isProcessing || !p.inviteCodeInput} type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50">
            {isProcessing ? 'Validando...' : <>Validar Identidad <ChevronRight size={18} /></>}
          </button>

          <div className="pt-4 border-t border-slate-800 text-center mt-6">
            <button type="button" onClick={() => p.setCurrentView('login')} className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">
              ¿Ya estás en la red? Inicia Sesión
            </button>
          </div>
        </form>
      </div>
      <button onClick={() => p.setCurrentView('adminLogin')} className="absolute bottom-6 text-xs font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors flex items-center gap-2">
        <Lock size={12}/> Acceso de Personal
      </button>
    </div>
  );
};

const RegisterView = ({ p }: { p: any }) => {
  const isTaskero = p.validatedCodeData?.type === 'taskero_elite';
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', location: '', skills: ''
  });

  if (!p.validatedCodeData) {
    p.setCurrentView('gate');
    return null;
  }

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinueToOath = (e: any) => {
    e.preventDefault();
    p.setRegistrationData(formData);
    p.setCurrentView('oath');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
      <div className="w-full max-w-md relative z-10 animate-in fade-in duration-500 mt-8 mb-8">
        <button onClick={() => p.setCurrentView('gate')} className="absolute -top-10 left-0 text-slate-500 hover:text-slate-300 flex items-center text-sm font-bold"><ChevronLeft size={16}/> Volver</button>
        
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)] ${isTaskero ? 'bg-slate-900 border-amber-500/50 text-amber-500' : 'bg-slate-900 border-blue-500/50 text-blue-400'}`}>
            {isTaskero ? <Briefcase size={28} /> : <Crown size={28} />}
          </div>
          <h2 className="text-2xl font-serif tracking-widest mb-1">{isTaskero ? 'PERFIL DE GESTOR' : 'CUENTA VIP'}</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Completando Registro</p>
        </div>

        <form onSubmit={handleContinueToOath} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Nombre y Apellido</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="Ej. Ana García" className="w-full bg-slate-950 border border-slate-700 text-slate-100 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-amber-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="contacto@ejemplo.com" className="w-full bg-slate-950 border border-slate-700 text-slate-100 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-amber-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Contraseña Segura</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 text-slate-100 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-amber-500 text-sm" />
            </div>
          </div>

          {isTaskero && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Zona de Operación Principal</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input type="text" name="location" required value={formData.location} onChange={handleInputChange} placeholder="Ej. Zona Sur, Sopocachi" className="w-full bg-slate-950 border border-slate-700 text-slate-100 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-amber-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Especialidades (Separadas por coma)</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input type="text" name="skills" required value={formData.skills} onChange={handleInputChange} placeholder="Ej. Plomería, Trámites, Limpieza" className="w-full bg-slate-950 border border-slate-700 text-slate-100 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-amber-500 text-sm" />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="w-full mt-4 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2">
            Continuar al Pacto <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

const OathView = ({ p }: { p: any }) => {
  const isTaskero = p.validatedCodeData?.type === 'taskero_elite';
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  if (!p.registrationData) {
    p.setCurrentView('gate');
    return null;
  }

  const handleAcceptOath = async () => {
    setIsProcessing(true);
    try {
      const authResult = await createUserWithEmailAndPassword(auth, p.registrationData.email, p.registrationData.password);
      const newUserId = authResult.user.uid;
      
      const role = isTaskero ? 'taskero' : 'client';
      const newProfile: any = {
        id: newUserId,
        role: role,
        name: p.registrationData.name,
        email: p.registrationData.email,
        invitedBy: p.validatedCodeData?.createdBy || 'admin',
        reputationScore: 100,
        createdAt: Date.now()
      };
      
      if (isTaskero) {
        Object.assign(newProfile, {
          type: "Taskero Élite", 
          avatar: p.registrationData.name.substring(0, 2).toUpperCase(), 
          lineage: "Invitado por la Red", 
          activeNetwork: 5, 
          totalSolved: 0,
          specialties: p.registrationData.skills ? p.registrationData.skills.split(',').map((s:string) => s.trim()) : ["Gestión VIP"], 
          zones: p.registrationData.location ? p.registrationData.location.split(',').map((s:string) => s.trim()) : ["La Paz"],
          bio: "Gestor verificado de la red Taskero."
        });
      } else {
        Object.assign(newProfile, {
          avatar: p.registrationData.name.substring(0, 2).toUpperCase()
        });
      }
      
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', newUserId), newProfile);
      if (p.validatedCodeData && !p.validatedCodeData.id.includes('DEMO')) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'invite_codes', p.validatedCodeData.id), { status: 'used', usedBy: newUserId });
      }

      p.setCurrentProfile(newProfile);
      p.setCurrentView(role === 'client' ? 'clientDash' : 'taskeroDash');

    } catch (err: any) { 
      console.warn("Error registrando:", err); 
      alert("Hubo un error en tu registro: " + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-300 relative overflow-hidden">
      <button onClick={() => p.setCurrentView('register')} className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 flex items-center text-sm font-bold"><ChevronLeft size={16}/> Atrás</button>
      <div className="w-full max-w-md bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden z-10">
        <div className="p-8 text-center border-b border-slate-800/50 bg-slate-900/50">
          <ShieldCheck size={32} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-slate-100 mb-2">{isTaskero ? 'Privilegio y Honor' : 'Bienvenido al Círculo'}</h2>
          <p className="text-sm text-slate-400">Firma tu compromiso con la red, <span className="font-bold text-white">{p.registrationData.name.split(' ')[0]}</span>.</p>
        </div>
        <div className="p-8">
          <button onClick={handleAcceptOath} disabled={isProcessing} className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-4 rounded-xl transition-all active:scale-95">
            {isProcessing ? 'Registrando...' : 'Acepto el Pacto y mi Responsabilidad'}
          </button>
        </div>
      </div>
    </div>
  );
};

// VISTA: EDITAR PERFIL (CLIENTE/TASKERO)
const EditProfileView = ({ p }: { p: any }) => {
  const isTaskero = p.currentProfile?.role === 'taskero';
  const [formData, setFormData] = useState({
    name: p.currentProfile?.name || '',
    avatar: p.currentProfile?.avatar || '',
    bio: p.currentProfile?.bio || '',
    zones: p.currentProfile?.zones?.join(', ') || '',
    specialties: p.currentProfile?.specialties?.join(', ') || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates: any = {
        name: formData.name,
        avatar: formData.avatar,
      };
      if (isTaskero) {
        updates.bio = formData.bio;
        updates.zones = formData.zones.split(',').map((s: string) => s.trim());
        updates.specialties = formData.specialties.split(',').map((s: string) => s.trim());
      }
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', p.currentProfile.id), updates);
      p.setCurrentView(isTaskero ? 'taskeroDash' : 'clientDash');
    } catch (err) {
      console.warn("Error saving profile", err);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto mt-4 md:mt-10">
        <button onClick={() => p.setCurrentView(isTaskero ? 'taskeroDash' : 'clientDash')} className="text-slate-500 hover:text-slate-800 transition-colors font-bold mb-8 flex items-center"><ChevronLeft size={20}/> Volver al Panel</button>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 flex items-center gap-2"><Edit2 className="text-blue-500" /> Editar mi Perfil</h2>
        <form onSubmit={handleSave} className="space-y-6 bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre y Apellido</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Iniciales (Avatar)</label>
              <input required type="text" maxLength={2} value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value.toUpperCase()})} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-bold uppercase" />
            </div>
          </div>
          
          {isTaskero && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sobre mí (Manifiesto de Confianza)</label>
                <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all min-h-[100px] text-sm"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Zonas (Separadas por coma)</label>
                  <input type="text" value={formData.zones} onChange={e => setFormData({...formData, zones: e.target.value})} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Especialidades (Separadas por coma)</label>
                  <input type="text" value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-sm" />
                </div>
              </div>
            </>
          )}
          
          <button disabled={isSaving} type="submit" className={`w-full font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all text-white ${isTaskero ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

// VISTA: CHAT INTERNO (NUEVO MÓDULO)
const ChatView = ({ p }: { p: any }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const taskId = p.activeTask?.id;

  useEffect(() => {
    if (!taskId) return;
    const msgRef = collection(db, 'artifacts', appId, 'public', 'data', 'tasks', taskId, 'messages');
    const unsub = onSnapshot(msgRef, (snap) => {
      const msgs = snap.docs.map(d => ({id: d.id, ...(d.data() as any)}));
      setMessages(msgs.sort((a: any, b: any) => a.timestamp - b.timestamp));
    });
    return () => unsub();
  }, [taskId]);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks', taskId, 'messages'), {
        text: newMessage,
        senderId: p.currentProfile.id,
        senderName: p.currentProfile.name.split(' ')[0],
        timestamp: Date.now()
      });
      setNewMessage('');
    } catch (err) {
      console.warn("Error enviando mensaje", err);
    }
  };

  const isClient = p.currentProfile?.role === 'client';
  const otherPersonName = isClient ? p.activeTask?.taskeroName : p.activeTask?.clientName;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-2xl mx-auto md:border-x md:border-slate-200 md:shadow-xl">
      <header className="bg-slate-900 text-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button onClick={() => p.setCurrentView(isClient ? 'clientDash' : 'taskeroDash')} className="text-slate-400 hover:text-white transition-colors p-1">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="font-bold text-lg leading-tight">{otherPersonName}</h2>
          <p className="text-xs text-slate-400">Solicitud: {p.activeTask?.id.substring(0,8)}</p>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 pb-24">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10 text-sm">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
            Envía un mensaje para iniciar la coordinación.
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.senderId === p.currentProfile.id;
          return (
            <div key={msg.id} className={`max-w-[80%] rounded-2xl p-3 ${isMine ? 'bg-blue-600 text-white self-end rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 self-start rounded-tl-sm'}`}>
              {!isMine && <p className="text-[10px] font-bold text-slate-400 mb-1">{msg.senderName}</p>}
              <p className="text-sm">{msg.text}</p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="fixed bottom-0 w-full max-w-2xl bg-white border-t border-slate-200 p-3 flex gap-2">
        <input 
          type="text" 
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)} 
          placeholder="Escribe un mensaje..." 
          className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
        />
        <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

const ClientDashboardView = ({ p }: { p: any }) => {
  // Tareas activas del cliente
  const myActiveTasks = p.allTasks.filter((t: any) => t.clientId === p.currentProfile?.id && ['paid'].includes(t.status));
  
  const displayTaskeros = p.allTaskeros.length > 0 ? p.allTaskeros : [
    { id: "mock-1", name: "Carlos Mendoza", type: "Taskero Élite", reputationScore: 98, specialties: ["Mantenimiento"], zone: "Zona Sur", avatar: "CM" },
    { id: "mock-2", name: "Ana Velasco", type: "Taskero Pro", reputationScore: 95, specialties: ["Trámites"], zone: "Sopocachi", avatar: "AV" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-slate-900 shadow-lg text-white rounded-b-3xl md:rounded-b-[3rem] pb-6 md:pb-10">
        <header className="px-6 py-6 md:px-10 md:py-10 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-medium text-slate-400">Tu tranquilidad en La Paz</p>
              <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 mt-1">
                <Crown size={24} className="text-amber-400" /> Hola, {p.currentProfile?.name?.split(' ')[0] || 'Cliente VIP'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => p.setCurrentView('editProfile')} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full border border-slate-700" title="Editar Perfil"><Edit2 size={16}/></button>
              <button onClick={p.handleLogout} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full border border-slate-700" title="Cerrar Sesión"><LogOut size={16}/></button>
            </div>
          </div>
          <div className="bg-white p-1 rounded-2xl flex items-center text-slate-800 shadow-md max-w-2xl">
            <Search size={20} className="ml-3 text-slate-400" />
            <input type="text" placeholder="¿Qué problema delegamos hoy?" className="flex-1 py-3 px-2 text-sm md:text-base outline-none bg-transparent"/>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hidden md:block hover:bg-blue-700 transition mr-1">Buscar</button>
          </div>
        </header>
      </div>

      <main className="p-5 md:p-8 max-w-7xl mx-auto w-full space-y-6 mt-2">
        {/* SECCIÓN DE SOLICITUDES ACTIVAS PARA EL CLIENTE */}
        {myActiveTasks.length > 0 && (
          <section>
            <h2 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-wider mb-4">Tus Solicitudes Activas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myActiveTasks.map((t: any) => (
                <div key={t.id} className="bg-white border border-blue-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">Asignado a {t.taskeroName}</span>
                    <p className="font-bold text-slate-900 mt-1 line-clamp-1">"{t.problem}"</p>
                  </div>
                  <button onClick={() => { p.setActiveTask(t); p.setCurrentView('chat'); }} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-md transition-colors">
                    <MessageCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-wider mb-4">Gestores de Confianza</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTaskeros.map((t: any) => (
              <div key={t.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 relative hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="absolute top-0 right-0 text-[10px] font-bold px-3 py-1.5 rounded-bl-2xl bg-amber-100 text-amber-700">{t.type || 'Élite'}</div>
                <div className="flex items-start gap-4 mb-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">{t.avatar || 'TS'}</div>
                  <div>
                    <h3 className="font-bold text-slate-900 md:text-lg">{t.name}</h3>
                    <p className="text-xs md:text-sm text-slate-500">Reputación: <span className="font-bold text-amber-600">{t.reputationScore || 100}/100</span></p>
                  </div>
                </div>
                <button onClick={() => { p.setSelectedTaskero(t); p.setCurrentView('profile'); }} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors mt-auto">
                  Ver Perfil <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const ProfileView = ({ p }: { p: any }) => {
  const t = p.selectedTaskero;
  if (!t) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <header className="relative pt-6 pb-8 px-6 md:pt-12 md:pb-16 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <button onClick={() => p.setCurrentView('clientDash')} className="absolute top-6 left-4 md:top-10 md:left-10 p-2 text-slate-400 bg-slate-900/50 rounded-full hover:bg-slate-800 transition-colors"><ChevronLeft size={24}/></button>
        <div className="flex flex-col items-center mt-8 md:mt-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-800 border-2 border-amber-500/50 flex items-center justify-center text-3xl md:text-5xl font-serif text-amber-500 mb-4 shadow-xl shadow-amber-500/10">{t.avatar || 'TK'}</div>
          <h1 className="text-2xl md:text-4xl font-serif text-white tracking-wide">{t.name}</h1>
          <p className="text-amber-500 text-xs md:text-sm font-bold uppercase tracking-widest mt-2"><Crown size={14} className="inline mr-1 mb-0.5"/>{t.type || 'Gestor Élite'}</p>
        </div>
      </header>

      <main className="p-5 md:p-10 space-y-6 max-w-4xl mx-auto w-full">
        {t.bio && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
            <h3 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Manifiesto del Gestor</h3>
            <p className="text-slate-300 text-sm md:text-base italic">"{t.bio}"</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg text-center flex flex-col justify-center">
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Puntos de Prestigio</p>
            <p className="text-5xl md:text-6xl font-black text-white">{t.reputationScore || 100}</p>
            <p className="text-xs md:text-sm text-amber-500 font-bold mt-3">Excelencia Verificada</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
             <h3 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Especialidades y Zonas</h3>
             <div className="flex flex-wrap gap-2 mb-4">
              {(t.specialties || ['Gestor General', 'Emergencias']).map((spec: string, idx: number) => (
                <span key={idx} className="bg-slate-800 text-slate-300 text-xs md:text-sm font-bold px-4 py-2 rounded-xl">{spec}</span>
              ))}
             </div>
             <div className="flex items-center gap-2 text-slate-400 text-sm">
               <MapPin size={16}/> <span className="font-medium">{t.zones?.join(', ') || 'La Paz'}</span>
             </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 w-full left-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4 z-50">
        <div className="max-w-4xl mx-auto w-full">
          <button onClick={() => p.setCurrentView('contact')} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition-colors text-slate-950 font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] flex justify-center items-center gap-2 text-base md:text-lg">
            <Lock size={20} /> Delegar Problema a {t.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};

const ContactView = ({ p }: { p: any }) => {
  const [problemDesc, setProblemDesc] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!p.selectedTaskero) return;
    setIsSubmitting(true);
    const taskId = `REQ-${Date.now()}`;
    const newTask = {
      id: taskId,
      clientId: p.currentProfile?.id || 'local_client',
      clientName: p.currentProfile?.name || 'Cliente VIP',
      taskeroId: p.selectedTaskero.id,
      taskeroName: p.selectedTaskero.name,
      problem: problemDesc,
      status: 'awaiting_payment',
      createdAt: Date.now(),
      managementFee: 15
    };

    p.setActiveTask(newTask);
    p.setCurrentView('checkout');
    setIsSubmitting(false);

    if (p.authUser) {
      try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', taskId), newTask); } 
      catch (err) { console.warn("Error:", err); }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto mt-4 md:mt-10">
        <button onClick={() => p.setCurrentView('profile')} className="text-slate-500 hover:text-slate-800 transition-colors font-bold mb-8 flex items-center"><ChevronLeft size={20}/> Volver al Perfil</button>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900">¿Qué necesitas que gestione {p.selectedTaskero?.name?.split(' ')[0] || 'el Gestor'}?</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea required value={problemDesc} onChange={(e: any) => setProblemDesc(e.target.value)} placeholder="Describe tu problema con detalle..." className="w-full bg-white border border-slate-200 p-6 rounded-2xl min-h-[200px] text-base md:text-lg shadow-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"></textarea>
          <div className="bg-amber-50 text-amber-800 p-5 md:p-6 rounded-2xl text-sm md:text-base border border-amber-200 shadow-sm">
            <p className="font-bold flex items-center gap-2 mb-2 text-amber-900"><ShieldCheck size={18}/> Activación de Súper Gestor</p>
            <p>Requerimos una tarifa simbólica de Bs. 15 para notificar al gestor e iniciar la coordinación VIP. El costo del trabajo lo negociarás directamente con él.</p>
          </div>
          <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl shadow-xl active:scale-[0.98] transition-all text-lg">
            Avanzar al Pago Seguro
          </button>
        </form>
      </div>
    </div>
  );
};

const CheckoutView = ({ p }: { p: any }) => {
  const currentTaskFromDB = p.allTasks.find((t: any) => t.id === p.activeTask?.id) || p.activeTask;
  const taskStatus = currentTaskFromDB?.status;

  const handleNotifyPayment = async () => {
    if (p.activeTask) {
      p.setActiveTask({...p.activeTask, status: 'verifying'});
      if (p.authUser) {
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', p.activeTask.id), { status: 'verifying' }, { merge: true }); } 
        catch (err) {}
      }
    }
  };

  if (taskStatus === 'paid') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle size={80} className="text-emerald-500 mb-6 animate-in zoom-in" />
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">¡Pago Confirmado!</h2>
        <p className="text-slate-500 text-lg mt-3 mb-10 max-w-md">El gestor ha sido notificado y se pondrá a trabajar de inmediato.</p>
        <button onClick={() => { p.setCurrentView('chat'); }} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors flex items-center gap-2 mx-auto mb-4">
           <MessageCircle /> Abrir Chat de Coordinación
        </button>
        <button onClick={() => p.setCurrentView('clientDash')} className="text-slate-500 hover:text-slate-700 font-bold transition-colors">Volver al Inicio</button>
      </div>
    );
  }

  if (taskStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Clock size={80} className="text-blue-500 mb-6 animate-pulse" />
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Verificando Pago...</h2>
        <p className="text-slate-500 text-lg mt-3 mb-10 max-w-md">El administrador revisará el comprobante en breve y liberará la tarea al Taskero.</p>
        <button onClick={() => p.setCurrentView('clientDash')} className="text-blue-600 hover:text-blue-800 font-bold text-lg transition-colors">Ir al inicio por ahora</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 mt-4 md:mt-10">
        <div className="bg-slate-900 p-8 text-white text-center">
          <p className="text-slate-400 text-base font-medium uppercase tracking-wider mb-2">Tarifa de Gestión VIP</p>
          <h2 className="text-5xl font-black text-amber-500">Bs. 15</h2>
        </div>
        <div className="p-8 md:p-12 text-center">
          <QrCode size={200} className="mx-auto text-slate-200 mb-8"/>
          <p className="text-base md:text-lg font-bold text-slate-800 mb-6">Escanea el QR de prueba o simula el pago.</p>
          <button onClick={handleNotifyPayment} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5 rounded-2xl shadow-lg flex justify-center items-center gap-3 active:scale-[0.98] transition-all text-lg">
            <Smartphone size={24} /> Simular Comprobante Enviado
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskeroDashboardView = ({ p }: { p: any }) => {
  const myLeads = p.allTasks.filter((t: any) => t.taskeroId === p.currentProfile?.id && t.status === 'paid');

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <div className="bg-slate-950 shadow-lg text-white rounded-b-3xl md:rounded-b-[3rem] pb-8">
        <header className="px-6 py-6 md:px-10 md:py-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-amber-500 text-amber-500 font-bold text-xl">{p.currentProfile?.avatar || 'TK'}</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">{p.currentProfile?.name?.split(' ')[0]} <ShieldCheck size={20} className="text-amber-400"/></h1>
                <p className="text-sm text-emerald-400 font-bold mt-1">• Activo y esperando leads</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="bg-slate-900 rounded-2xl p-5 flex justify-between items-center border border-slate-800 min-w-[200px]">
                 <div><p className="text-sm text-slate-400 mb-1">Leads VIP</p><p className="text-3xl font-bold text-white">{myLeads.length}</p></div>
                 <Activity size={32} className="text-amber-500"/>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => p.setCurrentView('editProfile')} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full border border-slate-700" title="Editar Perfil"><Edit2 size={20}/></button>
                 <button onClick={p.handleLogout} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full border border-slate-700" title="Cerrar Sesión"><LogOut size={20}/></button>
               </div>
            </div>
          </div>
        </header>
      </div>

      <main className="p-5 md:p-8 max-w-7xl mx-auto w-full space-y-4 mt-2">
        <h2 className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-wider">Bandeja de Entrada</h2>
        {myLeads.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center text-slate-400 border border-slate-200 shadow-sm text-lg">Esperando nuevas tareas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myLeads.map((task: any) => (
              <div key={task.id} className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-200 relative flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 text-[10px] font-bold px-3 py-1.5 rounded-bl-2xl bg-emerald-100 text-emerald-700">¡Pago Confirmado!</div>
                <p className="text-sm text-slate-500 mt-2">Cliente VIP:</p>
                <p className="font-bold text-slate-800 text-base mb-3">{task.clientName}</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1 mb-4">
                  <h3 className="font-bold text-slate-900 text-lg leading-snug">"{task.problem}"</h3>
                </div>
                {/* ABRIR CHAT DESDE EL TASKERO */}
                <button onClick={() => { p.setActiveTask(task); p.setCurrentView('chat'); }} className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white py-3.5 rounded-xl font-bold text-sm shadow-md mt-auto flex items-center justify-center gap-2">
                  <MessageCircle size={18} /> Abrir Chat Cliente
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// VISTA: EDICIÓN ADMINISTRATIVA DE USUARIO (NUEVO MÓDULO)
const AdminEditUserView = ({ p }: { p: any }) => {
  const u = p.selectedUser;
  if (!u) return null;

  const [formData, setFormData] = useState({
    name: u.name || '',
    role: u.role || 'visitante',
    reputationScore: u.reputationScore || 100,
    zones: u.zones?.join(', ') || '',
    specialties: u.specialties?.join(', ') || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates: any = {
        name: formData.name,
        role: formData.role,
        reputationScore: Number(formData.reputationScore)
      };
      if (['taskero', 'superadmin'].includes(formData.role)) {
        updates.zones = formData.zones.split(',').map((s: string) => s.trim()).filter(Boolean);
        updates.specialties = formData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', u.id), updates);
      p.setCurrentView('admin');
    } catch (err) {
      console.warn("Error editando usuario", err);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto mt-4 md:mt-10">
        <button onClick={() => p.setCurrentView('admin')} className="text-slate-500 hover:text-slate-800 transition-colors font-bold mb-8 flex items-center"><ChevronLeft size={20}/> Volver a Base de Datos</button>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 flex items-center gap-2"><Edit className="text-purple-600" /> Editando Perfil (ID: {u.id.substring(0,8)})</h2>
        
        <form onSubmit={handleSave} className="space-y-6 bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-purple-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Puntos de Prestigio</label>
              <input required type="number" max={100} min={0} value={formData.reputationScore} onChange={e => setFormData({...formData, reputationScore: e.target.value})} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-purple-500 text-sm font-bold text-amber-600" />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rol del Usuario</label>
             <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-purple-500 text-sm bg-white">
                <option value="superadmin">Súper Admin</option>
                <option value="taskero">Taskero Élite</option>
                <option value="client">Cliente VIP</option>
                <option value="visitante">Visitante</option>
             </select>
          </div>
          
          {['taskero', 'superadmin'].includes(formData.role) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Zonas (Separadas por coma)</label>
                <input type="text" value={formData.zones} onChange={e => setFormData({...formData, zones: e.target.value})} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-purple-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Especialidades</label>
                <input type="text" value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-purple-500 text-sm" />
              </div>
            </div>
          )}
          
          <button disabled={isSaving} type="submit" className="w-full font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all text-white bg-purple-600 hover:bg-purple-700">
            {isSaving ? 'Guardando...' : 'Aplicar Cambios Forzados'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboardView = ({ p }: { p: any }) => {
  const [adminTab, setAdminTab] = useState<string>('ops'); 
  const isSuperAdmin = p.currentProfile?.role === 'superadmin';
  const tasksVerifying = p.allTasks.filter((t: any) => t.status === 'verifying');
  
  const handleApprove = async (taskId: string) => {
    try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', taskId), { status: 'paid' }, { merge: true }); } 
    catch (e) {}
  };

  const handleGenCode = async (type: string) => {
    const code = `${type === 'taskero_elite' ? 'TSK' : 'VIP'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'invite_codes', code), { id: code, type, status: 'active', createdBy: p.currentProfile?.id || 'admin', createdAt: Date.now() });
    } catch (e) {}
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isSuperAdmin) return;
    if (window.confirm('¿Peligro: Estás seguro de eliminar este perfil de la base de datos? Esta acción no se puede deshacer.')) {
       try {
         await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userId));
       } catch (err) {
         alert("Error al eliminar usuario.");
       }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <header className="bg-slate-950 text-white px-6 md:px-10 py-6 md:py-8 shadow-lg">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3"><Settings className="text-purple-500" size={28}/> Centro de Mando</h1>
            <p className="text-slate-400 mt-1 text-sm flex items-center gap-2">
              Conectado como: <span className="font-bold text-white uppercase tracking-wider text-xs bg-slate-800 px-2 py-0.5 rounded">{p.currentProfile?.role}</span>
            </p>
          </div>
          <button onClick={p.handleLogout} className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors border border-slate-800 bg-slate-900 px-4 py-2 rounded-lg w-fit">
            <LogOut size={14}/> Cerrar Sesión
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto w-full mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setAdminTab('ops')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${adminTab === 'ops' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
             <Activity size={16} className="inline mr-2"/> Operaciones
          </button>
          <button onClick={() => setAdminTab('users')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${adminTab === 'users' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
             <UserCog size={16} className="inline mr-2"/> Usuarios Avanzado
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full p-5 md:p-8 mt-2">
        {adminTab === 'ops' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in">
            <section>
              <h2 className="text-base md:text-lg font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-amber-500"/> Validar Pagos ({tasksVerifying.length})</h2>
              {tasksVerifying.length === 0 && <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400">Sin pagos pendientes.</div>}
              <div className="space-y-4">
                {tasksVerifying.map((t: any) => (
                  <div key={t.id} className="bg-white p-6 rounded-3xl shadow-sm border border-amber-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-900 text-lg">{t.clientName}</p>
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">Bs. {t.managementFee}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">Asignado a: <span className="font-semibold text-slate-700">{t.taskeroName}</span></p>
                    <button onClick={() => handleApprove(t.id)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors">Aprobar Pago</button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Key size={20} className="text-blue-500"/> Generar Accesos</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => handleGenCode('client_vip')} className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold py-4 rounded-2xl shadow-sm">Pase Cliente</button>
                <button onClick={() => handleGenCode('taskero_elite')} className="bg-amber-500 hover:bg-amber-400 transition-colors text-slate-900 font-bold py-4 rounded-2xl shadow-sm">Pase Taskero</button>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200"><p className="font-bold text-slate-700 text-sm">Códigos Emitidos</p></div>
                {p.allCodes.length === 0 && <p className="p-8 text-center text-slate-400">No hay códigos.</p>}
                <div className="divide-y divide-slate-100">
                  {p.allCodes.slice(0,8).map((c: any) => (
                    <div key={c.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <span className="font-mono font-bold text-slate-800">{c.id}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{c.status === 'active' ? 'Activo' : 'Usado'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* GESTIÓN AVANZADA DE USUARIOS */}
        {adminTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Users size={20} className="text-slate-500"/> Base de Datos de Usuarios</h2>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">Total: {p.allUsers.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                    <th className="p-4 font-semibold">Nombre / ID</th>
                    <th className="p-4 font-semibold">Rol Actual</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {p.allUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{user.name || 'Sin nombre'}</p>
                        <p className="text-xs text-slate-400 font-mono mt-1">{user.id.substring(0,10)}...</p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                          user.role === 'superadmin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                          user.role === 'taskero' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          user.role === 'client' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>{user.role || 'visitante'}</span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {isSuperAdmin && user.id !== p.currentProfile?.id && (
                          <>
                            {/* BOTÓN EDITAR */}
                            <button onClick={() => { p.setSelectedUser(user); p.setCurrentView('adminEditUser'); }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200" title="Modificar Campos">
                              <Edit size={16} />
                            </button>
                            {/* BOTÓN ELIMINAR */}
                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200" title="Eliminar Permanentemente">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==============================================================================
// FUNCIÓN PRINCIPAL DE LA APLICACIÓN (ENRUTADOR)
// ==============================================================================
export default function App() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [currentView, setCurrentView] = useState<string>('gate'); 
  const [loading, setLoading] = useState<boolean>(true); 
  
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allTaskeros, setAllTaskeros] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [allCodes, setAllCodes] = useState<any[]>([]);
  
  const [inviteCodeInput, setInviteCodeInput] = useState<string>('');
  const [validatedCodeData, setValidatedCodeData] = useState<any>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [selectedTaskero, setSelectedTaskero] = useState<any>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null); // Para el Admin

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (!user) {
        setCurrentProfile(null);
        setCurrentView('gate');
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authUser) return;
    try {
      const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
      const unsubUsers = onSnapshot(usersRef, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setAllUsers(usersData);
        
        const myProfile = usersData.find(u => u.id === authUser.uid);

        if (myProfile) {
          setCurrentProfile(myProfile);
          if (['superadmin', 'editor'].includes(myProfile.role)) {
            setCurrentView('admin');
          } else if (myProfile.role === 'taskero') {
            setCurrentView('taskeroDash');
          } else if (myProfile.role === 'client') {
            setCurrentView('clientDash');
          } else {
            setCurrentView('gate');
          }
        }
        setAllTaskeros(usersData.filter(u => u.role === 'taskero'));
        setLoading(false);
      });

      const tasksRef = collection(db, 'artifacts', appId, 'public', 'data', 'tasks');
      const unsubTasks = onSnapshot(tasksRef, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setAllTasks(tasksData.sort((a, b) => b.createdAt - a.createdAt));
      });

      const codesRef = collection(db, 'artifacts', appId, 'public', 'data', 'invite_codes');
      const unsubCodes = onSnapshot(codesRef, (snapshot) => {
        const codesData = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setAllCodes(codesData.sort((a, b) => b.createdAt - a.createdAt));
      });

      return () => { unsubUsers(); unsubTasks(); unsubCodes(); };
    } catch (e) {
      console.warn("Error listeners:", e);
      setLoading(false);
    }
  }, [authUser]);

  const handleLogout = async () => {
    setLoading(true);
    await signOut(auth);
    setCurrentProfile(null);
    setCurrentView('gate');
    setLoading(false);
  };

  const appProps = {
    authUser, currentProfile, currentView, setCurrentView, setCurrentProfile,
    allUsers, allTaskeros, allTasks, allCodes,
    inviteCodeInput, setInviteCodeInput,
    validatedCodeData, setValidatedCodeData,
    registrationData, setRegistrationData,
    selectedTaskero, setSelectedTaskero,
    activeTask, setActiveTask,
    selectedUser, setSelectedUser,
    handleLogout
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="relative w-full bg-slate-950 min-h-screen overflow-x-hidden font-sans text-slate-800">
      {currentView === 'gate' && <GateView p={appProps} />}
      {currentView === 'login' && <LoginView p={appProps} />}
      {currentView === 'register' && <RegisterView p={appProps} />}
      {currentView === 'editProfile' && <EditProfileView p={appProps} />}
      {currentView === 'adminLogin' && <AdminLoginView p={appProps} />}
      {currentView === 'oath' && <OathView p={appProps} />}
      {currentView === 'clientDash' && <ClientDashboardView p={appProps} />}
      {currentView === 'taskeroDash' && <TaskeroDashboardView p={appProps} />}
      {currentView === 'profile' && <ProfileView p={appProps} />}
      {currentView === 'contact' && <ContactView p={appProps} />}
      {currentView === 'checkout' && <CheckoutView p={appProps} />}
      {currentView === 'chat' && <ChatView p={appProps} />}
      {currentView === 'admin' && <AdminDashboardView p={appProps} />}
      {currentView === 'adminEditUser' && <AdminEditUserView p={appProps} />}
    </div>
  );
}
