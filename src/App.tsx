import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { 
  ShieldCheck, Key, ArrowRight, CheckCircle, MapPin, Zap, Star, 
  BookOpen, Search, Users, ChevronRight, Briefcase, 
  QrCode, Copy, Smartphone, Clock, AlertCircle, TrendingUp, Navigation, 
  Home, X, Settings, Plus, Link as LinkIcon, Crown, ChevronLeft, Award, Activity, User as UserIcon, Lock,
  LogOut, UserCog, Shield
} from 'lucide-react';

// --- 0. INYECCIÓN FORZADA DE TAILWIND CSS ---
if (typeof document !== 'undefined' && !document.getElementById('tailwind-cdn')) {
  const script = document.createElement('script');
  script.id = 'tailwind-cdn';
  script.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(script);
}

// --- 1. CONFIGURACIÓN DE FIREBASE ---
const myFirebaseConfig = {
  apiKey: "AIzaSyDOFa4obbtn4RU6dkgaxZSdBYXdqkMVKfQ",
  authDomain: "taskeroapp-1023a.firebaseapp.com",
  projectId: "taskeroapp-1023a"
};
const firebaseConfig = typeof __firebase_config !== 'undefined' && __firebase_config ? JSON.parse(__firebase_config) : myFirebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'taskero-master';

export default function App() {
  // --- STATE MANAGEMENT ---
  const [authUser, setAuthUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [currentView, setCurrentView] = useState('gate'); // gate, adminLogin, oath, admin, clientDash, taskeroDash, profile, contact, checkout
  const [loading, setLoading] = useState(true); // Empezamos en true para evitar parpadeos
  
  // Datos de la plataforma
  const [allUsers, setAllUsers] = useState([]);
  const [allTaskeros, setAllTaskeros] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allCodes, setAllCodes] = useState([]);
  
  // Flujo activo
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [validatedCodeData, setValidatedCodeData] = useState(null);
  const [selectedTaskero, setSelectedTaskero] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  // --- INICIALIZAR AUTENTICACIÓN Y ENRUTAMIENTO AUTOMÁTICO ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setAuthUser(user);
      if (!user) {
        setCurrentProfile(null);
        setCurrentView('gate');
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // --- ESCUCHAR DATOS Y DETERMINAR ROLES ---
  useEffect(() => {
    if (!authUser) return;
    try {
      // 1. Escuchar Usuarios (Para Admin y para encontrar el perfil actual)
      const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
      const unsubUsers = onSnapshot(usersRef, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllUsers(usersData);
        
        const myProfile = usersData.find(u => u.id === authUser.uid);
        
        // Mock de superadmin si se usa la puerta trasera de demo
        if (!myProfile && authUser.email === 'admin@demo.com') {
          const demoProfile = { id: authUser.uid, role: 'superadmin', name: 'Admin Demo' };
          setCurrentProfile(demoProfile);
          setCurrentView('admin');
          setLoading(false);
          return;
        }

        if (myProfile) {
          setCurrentProfile(myProfile);
          // Enrutamiento seguro basado en el rol de la base de datos
          if (['superadmin', 'editor'].includes(myProfile.role)) {
            setCurrentView('admin');
          } else if (myProfile.role === 'taskero') {
            setCurrentView('taskeroDash');
          } else if (myProfile.role === 'client') {
            setCurrentView('clientDash');
          } else {
            setCurrentView('gate'); // Visitante o rol desconocido
          }
        }
        setAllTaskeros(usersData.filter(u => u.role === 'taskero'));
        setLoading(false);
      });

      // 2. Escuchar Tareas
      const tasksRef = collection(db, 'artifacts', appId, 'public', 'data', 'tasks');
      const unsubTasks = onSnapshot(tasksRef, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllTasks(tasksData.sort((a, b) => b.createdAt - a.createdAt));
      });

      // 3. Escuchar Códigos
      const codesRef = collection(db, 'artifacts', appId, 'public', 'data', 'invite_codes');
      const unsubCodes = onSnapshot(codesRef, (snapshot) => {
        const codesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllCodes(codesData.sort((a, b) => b.createdAt - a.createdAt));
      });

      return () => { unsubUsers(); unsubTasks(); unsubCodes(); };
    } catch (e) {
      console.warn("Error listeners:", e);
      setLoading(false);
    }
  }, [authUser]);

  // --- CERRAR SESIÓN ---
  const handleLogout = async () => {
    setLoading(true);
    await signOut(auth);
    setCurrentProfile(null);
    setCurrentView('gate');
    setLoading(false);
  };


  // ==============================================================================
  // VISTA 0: LOGIN DE ADMINISTRADORES (NUEVO)
  // ==============================================================================
  const AdminLoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleAdminLogin = async (e) => {
      e.preventDefault();
      setIsLoggingIn(true); setLoginError('');
      try {
        // Puerta trasera de demo local si no hay Firebase configurado
        if (email === 'admin@demo.com' && password === 'admin123') {
           await signInAnonymously(auth);
           // El useEffect se encargará de darle el rol de demo
           return;
        }
        await signInWithEmailAndPassword(auth, email, password);
        // El useEffect redireccionará automáticamente basado en el rol
      } catch (err) {
        setLoginError('Credenciales incorrectas o usuario no autorizado.');
        setIsLoggingIn(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
        <div className="w-full max-w-sm relative z-10 animate-in fade-in duration-500">
          <button onClick={() => setCurrentView('gate')} className="absolute -top-12 left-0 text-slate-500 hover:text-slate-300 flex items-center text-sm font-bold"><ChevronLeft size={16}/> Volver</button>
          
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
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@taskero.com" className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Contraseña</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-purple-500" />
              </div>
            </div>
            
            {loginError && <div className="mt-4 text-red-400 text-xs font-bold text-center bg-red-400/10 py-2 rounded-lg">{loginError}</div>}
            
            <button disabled={isLoggingIn || !email || !password} type="submit" className="w-full mt-6 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {isLoggingIn ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    );
  };


  // ==============================================================================
  // VISTA 1: LA PUERTA (GATE) - ACCESO VIP
  // ==============================================================================
  const GateView = () => {
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleValidateCode = async (e) => {
      e.preventDefault();
      setIsProcessing(true); setError('');
      try {
        const codeToTest = inviteCodeInput.trim().toUpperCase();
        const codeRef = doc(db, 'artifacts', appId, 'public', 'data', 'invite_codes', codeToTest);
        const codeSnap = await getDoc(codeRef);

        if (codeSnap.exists() && codeSnap.data().status === 'active') {
          setValidatedCodeData({ id: codeSnap.id, ...codeSnap.data() });
          setCurrentView('oath');
        } else if (codeToTest === 'VIP-DEMO' || codeToTest === 'TSK-DEMO') {
          setValidatedCodeData({ id: codeToTest, type: codeToTest === 'VIP-DEMO' ? 'client_vip' : 'taskero_elite', createdBy: 'admin_master' });
          setCurrentView('oath');
        } else {
          setError('Código de acceso inválido o expirado.');
        }
      } catch (err) { setError('Error de conexión.'); }
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
              <input type="text" value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value)} placeholder="Ej: VIP-LA-PAZ" className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-12 py-4 rounded-xl outline-none focus:border-amber-500 text-center font-mono text-lg tracking-widest uppercase" />
            </div>
            {error && <div className="text-red-400 text-xs font-medium text-center">{error}</div>}
            <button disabled={isProcessing || !inviteCodeInput} type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50">
              {isProcessing ? 'Validando...' : <>Validar Identidad <ChevronRight size={18} /></>}
            </button>
          </form>
        </div>

        {/* Acceso para Empleados/Admins */}
        <button onClick={() => setCurrentView('adminLogin')} className="absolute bottom-6 text-xs font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors flex items-center gap-2">
          <Lock size={12}/> Acceso de Personal
        </button>
      </div>
    );
  };

  // ==============================================================================
  // VISTA 2: EL PACTO (OATH)
  // ==============================================================================
  const OathView = () => {
    const isTaskero = validatedCodeData?.type === 'taskero_elite';
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleAcceptOath = async () => {
      setIsProcessing(true);
      try {
        // En un flujo real, aquí pediríamos email/password para registrarlo bien.
        // Por ahora lo hacemos anónimo y creamos su perfil.
        const authResult = await signInAnonymously(auth);
        const newUserId = authResult.user.uid;
        
        const role = isTaskero ? 'taskero' : 'client';
        const newProfile = {
          id: newUserId,
          role: role,
          name: isTaskero ? "Gestor Élite" : "Cliente VIP",
          invitedBy: validatedCodeData.createdBy,
          reputationScore: 100,
          createdAt: Date.now()
        };
        
        if (isTaskero) {
          Object.assign(newProfile, {
            type: "Taskero Élite", avatar: "GE", lineage: "Invitado por la Red", activeNetwork: 5, totalSolved: 0,
            specialties: ["Gestión VIP"], zones: ["La Paz"]
          });
        }
        
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', newUserId), newProfile);
        if (!validatedCodeData.id.includes('DEMO')) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'invite_codes', validatedCodeData.id), { status: 'used', usedBy: newUserId });
        }
        
        // El useEffect de AuthState escuchará el cambio y lo redirigirá.
      } catch (err) { 
        console.warn("Error firmando:", err); 
        setIsProcessing(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-300">
        <div className="w-full max-w-md bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-8 text-center border-b border-slate-800/50 bg-slate-900/50">
            <ShieldCheck size={32} className="text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-slate-100 mb-2">{isTaskero ? 'Privilegio y Honor' : 'Bienvenido al Círculo'}</h2>
            <p className="text-sm text-slate-400">Firma tu compromiso con la red.</p>
          </div>
          <div className="p-8">
            <button onClick={handleAcceptOath} disabled={isProcessing} className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-4 rounded-xl transition-all active:scale-95">
              {isProcessing ? 'Sellando pacto...' : 'Acepto el Pacto y mi Responsabilidad'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==============================================================================
  // VISTA 8: DASHBOARD ADMINISTRADOR (Gestión Completa)
  // ==============================================================================
  const AdminDashboardView = () => {
    const [adminTab, setAdminTab] = useState('ops'); // 'ops', 'users'
    const isSuperAdmin = currentProfile?.role === 'superadmin';
    const tasksVerifying = allTasks.filter(t => t.status === 'verifying');
    
    // Funciones Operativas
    const handleApprove = async (taskId) => {
      try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', taskId), { status: 'paid' }, { merge: true }); } 
      catch (e) {}
    };

    const handleGenCode = async (type) => {
      const code = `${type === 'taskero_elite' ? 'TSK' : 'VIP'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'invite_codes', code), { id: code, type, status: 'active', createdBy: currentProfile?.id || 'admin', createdAt: Date.now() });
      } catch (e) {}
    };

    // Función de Gestión de Usuarios
    const handleChangeUserRole = async (userId, newRole) => {
      if (!isSuperAdmin) return alert('Solo un Súper Administrador puede cambiar roles.');
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userId), { role: newRole });
      } catch (err) {
        console.warn('Error cambiando rol', err);
      }
    };

    return (
      <div className="min-h-screen bg-slate-100 pb-24">
        
        {/* Admin Header */}
        <header className="bg-slate-950 text-white px-6 md:px-10 py-6 md:py-8 shadow-lg">
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3"><Settings className="text-purple-500" size={28}/> Centro de Mando</h1>
              <p className="text-slate-400 mt-1 text-sm flex items-center gap-2">
                Conectado como: <span className="font-bold text-white uppercase tracking-wider text-xs bg-slate-800 px-2 py-0.5 rounded">{currentProfile?.role}</span>
              </p>
            </div>
            <button onClick={handleLogout} className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors border border-slate-800 bg-slate-900 px-4 py-2 rounded-lg w-fit">
              <LogOut size={14}/> Cerrar Sesión
            </button>
          </div>
          
          {/* Admin Tabs */}
          <div className="max-w-7xl mx-auto w-full mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setAdminTab('ops')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${adminTab === 'ops' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
               <Activity size={16} className="inline mr-2"/> Operaciones y Accesos
            </button>
            <button onClick={() => setAdminTab('users')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${adminTab === 'users' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
               <UserCog size={16} className="inline mr-2"/> Gestión de Usuarios
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto w-full p-5 md:p-8 mt-2">
          
          {/* PESTAÑA: OPERACIONES (Pagos y Códigos) */}
          {adminTab === 'ops' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in">
              <section>
                <h2 className="text-base md:text-lg font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-amber-500"/> Validar Pagos ({tasksVerifying.length})</h2>
                {tasksVerifying.length === 0 && (
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 shadow-sm">Sin pagos pendientes de revisión.</div>
                )}
                <div className="space-y-4">
                  {tasksVerifying.map(t => (
                    <div key={t.id} className="bg-white p-6 rounded-3xl shadow-sm border border-amber-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-slate-900 text-lg">{t.clientName}</p>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">Bs. {t.managementFee}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-6">Asignado a: <span className="font-semibold text-slate-700">{t.taskeroName}</span></p>
                      <button onClick={() => handleApprove(t.id)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors">Aprobar Pago (Liberar Tarea)</button>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-base md:text-lg font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Key size={20} className="text-blue-500"/> Generar Accesos</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button onClick={() => handleGenCode('client_vip')} className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold py-4 rounded-2xl shadow-sm">Pase Cliente VIP</button>
                  <button onClick={() => handleGenCode('taskero_elite')} className="bg-amber-500 hover:bg-amber-400 transition-colors text-slate-900 font-bold py-4 rounded-2xl shadow-sm">Pase Taskero Élite</button>
                </div>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b border-slate-200"><p className="font-bold text-slate-700 text-sm">Registro de Accesos Generados</p></div>
                  {allCodes.length === 0 && <p className="p-8 text-center text-slate-400">No hay códigos generados.</p>}
                  <div className="divide-y divide-slate-100">
                    {allCodes.slice(0,8).map(c => (
                      <div key={c.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <span className="font-mono font-bold text-slate-800 text-sm md:text-base">{c.id}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{c.status === 'active' ? 'Activo' : 'Usado'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* PESTAÑA: GESTIÓN DE USUARIOS */}
          {adminTab === 'users' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
              <div className="p-5 md:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Users size={20} className="text-slate-500"/> Base de Datos de Usuarios</h2>
                <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">Total: {allUsers.length}</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                      <th className="p-4 md:p-6 font-semibold">Nombre / ID</th>
                      <th className="p-4 md:p-6 font-semibold">Rol Actual</th>
                      <th className="p-4 md:p-6 font-semibold text-right">Acción (Asignar Rol)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 md:p-6">
                          <p className="font-bold text-slate-900">{user.name || 'Sin nombre'}</p>
                          <p className="text-xs text-slate-400 font-mono mt-1">{user.id.substring(0,10)}...</p>
                        </td>
                        <td className="p-4 md:p-6">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                            user.role === 'superadmin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            user.role === 'editor' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            user.role === 'taskero' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            user.role === 'client' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {user.role || 'visitante'}
                          </span>
                        </td>
                        <td className="p-4 md:p-6 text-right">
                          <select 
                            disabled={!isSuperAdmin || user.id === currentProfile?.id}
                            value={user.role || 'visitante'}
                            onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                            className="bg-white border border-slate-300 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2 ml-auto disabled:opacity-50 disabled:bg-slate-50 outline-none"
                          >
                            <option value="superadmin">Súper Admin</option>
                            <option value="editor">Editor</option>
                            <option value="taskero">Taskero Élite</option>
                            <option value="client">Cliente VIP</option>
                            <option value="visitante">Visitante</option>
                          </select>
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
  // VISTAS DEL DASHBOARD (CLIENTE Y TASKERO) - CON BOTÓN DE LOGOUT
  // ==============================================================================
  const ClientDashboardView = () => {
    const displayTaskeros = allTaskeros.length > 0 ? allTaskeros : [
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
                  <Crown size={24} className="text-amber-400" /> Hola, {currentProfile?.name || 'Cliente VIP'}
                </h1>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-white p-2" title="Cerrar Sesión"><LogOut size={20}/></button>
            </div>
            <div className="bg-white p-1 rounded-2xl flex items-center text-slate-800 shadow-md max-w-2xl">
              <Search size={20} className="ml-3 text-slate-400" />
              <input type="text" placeholder="¿Qué problema delegamos hoy?" className="flex-1 py-3 px-2 text-sm md:text-base outline-none bg-transparent"/>
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hidden md:block hover:bg-blue-700 transition mr-1">Buscar</button>
            </div>
          </header>
        </div>

        <main className="p-5 md:p-8 max-w-7xl mx-auto w-full space-y-4 mt-2">
          <h2 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-wider">Gestores de Confianza</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTaskeros.map((t) => (
              <div key={t.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 relative hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="absolute top-0 right-0 text-[10px] font-bold px-3 py-1.5 rounded-bl-2xl bg-amber-100 text-amber-700">{t.type || 'Élite'}</div>
                <div className="flex items-start gap-4 mb-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">{t.avatar || 'TS'}</div>
                  <div>
                    <h3 className="font-bold text-slate-900 md:text-lg">{t.name}</h3>
                    <p className="text-xs md:text-sm text-slate-500">Reputación: <span className="font-bold text-amber-600">{t.reputationScore || 100}/100</span></p>
                  </div>
                </div>
                <button onClick={() => { setSelectedTaskero(t); setCurrentView('profile'); }} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors mt-auto">
                  Ver Perfil <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  };

  const TaskeroDashboardView = () => {
    const myLeads = allTasks.filter(t => t.taskeroId === currentProfile?.id && t.status === 'paid');

    return (
      <div className="min-h-screen bg-slate-100 pb-24">
        <div className="bg-slate-950 shadow-lg text-white rounded-b-3xl md:rounded-b-[3rem] pb-8">
          <header className="px-6 py-6 md:px-10 md:py-10 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-amber-500 text-amber-500 font-bold text-xl">{currentProfile?.avatar || 'TK'}</div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">{currentProfile?.name} <ShieldCheck size={20} className="text-amber-400"/></h1>
                  <p className="text-sm text-emerald-400 font-bold mt-1">• Activo y esperando leads</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-white p-2" title="Cerrar Sesión"><LogOut size={20}/></button>
            </div>
            <div className="bg-slate-900 rounded-2xl p-5 flex justify-between items-center border border-slate-800 max-w-sm">
              <div><p className="text-sm text-slate-400 mb-1">Leads VIP recibidos</p><p className="text-3xl font-bold text-white">{myLeads.length}</p></div>
              <Activity size={32} className="text-amber-500"/>
            </div>
          </header>
        </div>

        <main className="p-5 md:p-8 max-w-7xl mx-auto w-full space-y-4 mt-2">
          <h2 className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-wider">Bandeja de Entrada</h2>
          {myLeads.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center text-slate-400 border border-slate-200 shadow-sm text-lg">Esperando nuevas tareas...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLeads.map(task => (
                <div key={task.id} className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-200 relative flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 text-[10px] font-bold px-3 py-1.5 rounded-bl-2xl bg-emerald-100 text-emerald-700">¡Pago Confirmado!</div>
                  <p className="text-sm text-slate-500 mt-2">Cliente VIP:</p>
                  <p className="font-bold text-slate-800 text-base mb-3">{task.clientName}</p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1 mb-4">
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">"{task.problem}"</h3>
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white py-3.5 rounded-xl font-bold text-sm shadow-md mt-auto">Contactar Cliente</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  };

  // (Vistas de Flujo de Cliente se mantienen iguales)
  const ProfileView = () => { /* ...Código de perfil... */ return (<div className="min-h-screen bg-slate-950 text-white p-10"><button onClick={()=>setCurrentView('clientDash')}><ChevronLeft/></button> <h1 className="text-3xl mt-10">Perfil de {selectedTaskero?.name}</h1><button onClick={()=>setCurrentView('contact')} className="mt-10 bg-amber-500 text-black px-6 py-3 rounded-xl font-bold">Delegar Problema</button></div>); };
  const ContactView = () => { /* ...Código de contacto... */ return (<div className="min-h-screen bg-slate-50 p-10"><button onClick={()=>setCurrentView('clientDash')}><ChevronLeft/></button> <h1 className="text-2xl mt-10 font-bold text-slate-900">Describe el problema</h1><button onClick={()=>{setActiveTask({id:`REQ-${Date.now()}`, status:'awaiting_payment', managementFee:15, clientName: currentProfile?.name, taskeroName: selectedTaskero?.name}); setCurrentView('checkout');}} className="mt-10 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">Avanzar al Pago</button></div>); };
  const CheckoutView = () => { /* ...Código de pago... */ const handlePay = async () => { if(authUser && activeTask) { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', activeTask.id), {...activeTask, status: 'verifying'}); setCurrentView('clientDash'); } }; return (<div className="min-h-screen bg-slate-50 p-10 flex flex-col items-center justify-center"><h1 className="text-2xl font-bold text-slate-900 mb-6">Pagar Tarifa (Bs. 15)</h1><button onClick={handlePay} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Smartphone/> Simular Pago Enviado</button></div>); };


  // ==============================================================================
  // PANTALLA DE CARGA GLOBAL
  // ==============================================================================
  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // ==============================================================================
  // RENDERIZADO PRINCIPAL (SIN MENÚ DEMO, ENRUTAMIENTO REAL)
  // ==============================================================================
  return (
    <div className="relative w-full bg-slate-950 min-h-screen overflow-x-hidden font-sans text-slate-800">
      
      {currentView === 'gate' && <GateView />}
      {currentView === 'adminLogin' && <AdminLoginView />}
      {currentView === 'oath' && <OathView />}
      {currentView === 'clientDash' && <ClientDashboardView />}
      {currentView === 'taskeroDash' && <TaskeroDashboardView />}
      {currentView === 'profile' && <ProfileView />}
      {currentView === 'contact' && <ContactView />}
      {currentView === 'checkout' && <CheckoutView />}
      {currentView === 'admin' && <AdminDashboardView />}

    </div>
  );
}