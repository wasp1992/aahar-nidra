import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, Sun, Utensils, Activity, ChevronLeft, ChevronRight, 
  Plus, Save, Trash2, PieChart, BarChart2, Info, Droplet,
  Sparkles, X, Smartphone, Share2, Search, AlertTriangle, WifiOff
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
// Removed Analytics to ensure stability
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot
} from 'firebase/firestore';

// --- Expanded Indian Food Database ---
const INDIAN_FOOD_DB = [
  { name: 'Roti (Whole Wheat)', calories: 104, protein: 3, carbs: 22, fat: 0.5, fiber: 2.5, vitA: 0, vitC: 0, iron: 6, calcium: 2 },
  { name: 'Plain Rice (1 cup)', calories: 205, protein: 4, carbs: 45, fat: 0.5, fiber: 0.5, vitA: 0, vitC: 0, iron: 2, calcium: 1 },
  { name: 'Brown Rice (1 cup)', calories: 215, protein: 5, carbs: 44, fat: 1.5, fiber: 3.5, vitA: 0, vitC: 0, iron: 5, calcium: 2 },
  { name: 'Paratha (Plain)', calories: 260, protein: 6, carbs: 34, fat: 12, fiber: 3, vitA: 2, vitC: 0, iron: 6, calcium: 3 },
  { name: 'Naan (Butter)', calories: 320, protein: 8, carbs: 48, fat: 10, fiber: 2, vitA: 4, vitC: 0, iron: 8, calcium: 4 },
  { name: 'Poha (1 plate)', calories: 250, protein: 5, carbs: 46, fat: 8, fiber: 2, vitA: 8, vitC: 15, iron: 25, calcium: 2 },
  { name: 'Upma (1 bowl)', calories: 220, protein: 6, carbs: 35, fat: 8, fiber: 4, vitA: 5, vitC: 4, iron: 8, calcium: 3 },
  { name: 'Dhokla (2 pcs)', calories: 150, protein: 6, carbs: 22, fat: 4, fiber: 2, vitA: 2, vitC: 2, iron: 6, calcium: 4 },
  { name: 'Vada Pav (1 pc)', calories: 300, protein: 8, carbs: 45, fat: 14, fiber: 3, vitA: 4, vitC: 8, iron: 10, calcium: 5 },
  { name: 'Idli (2 pcs)', calories: 120, protein: 4, carbs: 24, fat: 0.5, fiber: 2, vitA: 0, vitC: 0, iron: 4, calcium: 3 },
  { name: 'Dosa (Plain)', calories: 180, protein: 4, carbs: 28, fat: 6, fiber: 1, vitA: 0, vitC: 0, iron: 4, calcium: 2 },
  { name: 'Masala Dosa', calories: 350, protein: 8, carbs: 45, fat: 16, fiber: 5, vitA: 8, vitC: 6, iron: 12, calcium: 6 },
  { name: 'Samosa (1 pc)', calories: 260, protein: 4, carbs: 24, fat: 18, fiber: 2, vitA: 2, vitC: 4, iron: 4, calcium: 2 },
  { name: 'Pakora (Mixed, 4 pcs)', calories: 280, protein: 6, carbs: 20, fat: 20, fiber: 3, vitA: 6, vitC: 5, iron: 5, calcium: 4 },
  { name: 'Bhel Puri (1 plate)', calories: 220, protein: 6, carbs: 40, fat: 5, fiber: 4, vitA: 10, vitC: 12, iron: 15, calcium: 4 },
  { name: 'Pani Puri (6 pcs)', calories: 220, protein: 4, carbs: 32, fat: 8, fiber: 2, vitA: 4, vitC: 8, iron: 8, calcium: 4 },
  { name: 'Sabudana Khichdi (1 bowl)', calories: 350, protein: 3, carbs: 60, fat: 14, fiber: 2, vitA: 2, vitC: 0, iron: 4, calcium: 4 },
  { name: 'Dal Tadka (1 bowl)', calories: 260, protein: 14, carbs: 32, fat: 9, fiber: 8, vitA: 10, vitC: 5, iron: 15, calcium: 6 },
  { name: 'Dal Makhani (1 bowl)', calories: 350, protein: 14, carbs: 28, fat: 22, fiber: 7, vitA: 12, vitC: 2, iron: 10, calcium: 12 },
  { name: 'Aloo Gobi (1 bowl)', calories: 180, protein: 5, carbs: 24, fat: 8, fiber: 6, vitA: 8, vitC: 60, iron: 10, calcium: 8 },
  { name: 'Bhindi Masala (1 bowl)', calories: 160, protein: 4, carbs: 14, fat: 10, fiber: 6, vitA: 15, vitC: 30, iron: 8, calcium: 10 },
  { name: 'Baingan Bharta', calories: 140, protein: 3, carbs: 12, fat: 9, fiber: 7, vitA: 4, vitC: 10, iron: 6, calcium: 5 },
  { name: 'Palak Paneer (1 bowl)', calories: 340, protein: 18, carbs: 12, fat: 24, fiber: 6, vitA: 80, vitC: 40, iron: 30, calcium: 25 },
  { name: 'Paneer Butter Masala', calories: 400, protein: 16, carbs: 14, fat: 32, fiber: 2, vitA: 20, vitC: 15, iron: 5, calcium: 20 },
  { name: 'Chole (Chickpeas)', calories: 280, protein: 12, carbs: 40, fat: 8, fiber: 10, vitA: 8, vitC: 15, iron: 20, calcium: 8 },
  { name: 'Rajma Masala', calories: 260, protein: 14, carbs: 38, fat: 7, fiber: 12, vitA: 6, vitC: 8, iron: 22, calcium: 10 },
  { name: 'Mix Veg Curry', calories: 210, protein: 6, carbs: 18, fat: 12, fiber: 5, vitA: 25, vitC: 20, iron: 8, calcium: 8 },
  { name: 'Curd/Yogurt (1 cup)', calories: 100, protein: 8, carbs: 10, fat: 4, fiber: 0, vitA: 4, vitC: 0, iron: 0, calcium: 30 },
  { name: 'Milk (1 glass)', calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0, vitA: 10, vitC: 0, iron: 0, calcium: 35 },
  { name: 'Masala Chai (1 cup)', calories: 120, protein: 3, carbs: 14, fat: 5, fiber: 0, vitA: 2, vitC: 0, iron: 0, calcium: 10 },
  { name: 'Lassi (Sweet)', calories: 250, protein: 9, carbs: 35, fat: 10, fiber: 0, vitA: 6, vitC: 2, iron: 1, calcium: 35 },
  { name: 'Buttermilk (Chaas)', calories: 45, protein: 2, carbs: 3, fat: 2, fiber: 0, vitA: 2, vitC: 2, iron: 0, calcium: 10 },
  { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3, vitA: 2, vitC: 15, iron: 2, calcium: 1 },
  { name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, vitA: 2, vitC: 14, iron: 1, calcium: 1 },
  { name: 'Mango (1 cup)', calories: 99, protein: 1.4, carbs: 25, fat: 0.6, fiber: 2.6, vitA: 20, vitC: 60, iron: 1, calcium: 1 },
];

// --- Firebase Config & Init ---
const firebaseConfig = {
  apiKey: "AIzaSyBFqn43hvOz8ELljdFZNBurYorKXkKI1sc",
  authDomain: "aahar-nidra.firebaseapp.com",
  projectId: "aahar-nidra",
  storageBucket: "aahar-nidra.firebasestorage.app",
  messagingSenderId: "862812230906",
  appId: "1:862812230906:web:6b3f433091bea5308fe543",
  measurementId: "G-RGT4NKE8VY"
};

// Initialize Firebase with safety check
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const appId = firebaseConfig.projectId; 

// --- Gemini API Helper ---
const apiKey = ""; 
const callGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate response.";
  } catch (error) {
    return "Connection error. Please try again later.";
  }
};

// --- Helper Functions ---
const getTodayStr = () => new Date().toISOString().split('T')[0];
const calculateSleepDuration = (start, end) => {
  if (!start || !end) return 0;
  let [h1, m1] = start.split(':').map(Number);
  let [h2, m2] = end.split(':').map(Number);
  let startMin = h1 * 60 + m1;
  let endMin = h2 * 60 + m2;
  if (endMin < startMin) endMin += 24 * 60; 
  return parseFloat(((endMin - startMin) / 60).toFixed(2));
};

const defaultDailyData = { sleep: { bedtime: '', waketime: '', quality: 3, duration: 0 }, food: [] };

// --- Components ---
const AIModal = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[80vh]">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><Sparkles size={18} className="text-yellow-300" /> {title}</h3>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto text-gray-700 leading-relaxed">
          {isLoading ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-gray-500 animate-pulse">Consulting Gemini...</p>
            </div>
          ) : (
            <div className="prose prose-sm text-sm">{content.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}</div>
          )}
        </div>
        {!isLoading && <div className="p-4 bg-gray-50 border-t border-gray-100 text-center"><button onClick={onClose} className="text-indigo-600 font-semibold text-sm">Close</button></div>}
      </div>
    </div>
  );
};

const DeployInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Smartphone size={20} className="text-indigo-600"/> Install on Mobile</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <p>To use this app on your Android/iOS device:</p>
          <ol className="list-decimal pl-4 space-y-2">
            <li><strong>Deploy:</strong> Use a free service like <strong>Vercel</strong> or <strong>Firebase Hosting</strong> to host this code.</li>
            <li><strong>Open Link:</strong> Open your new website link on your mobile browser (Chrome/Safari).</li>
            <li><strong>Add to Home:</strong> Tap the browser menu (3 dots) &rarr; Select <strong>"Add to Home Screen"</strong>.</li>
          </ol>
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-2">
            <p className="text-xs text-indigo-700 font-medium">💡 This makes it look and feel exactly like a real app!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SleepChart = ({ history }) => {
  const data = [...history].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  if (data.length === 0) return <div className="text-gray-500 text-sm p-4 text-center italic">Start tracking sleep to see trends</div>;
  const maxHours = Math.max(...data.map(d => d.sleep?.duration || 0), 10);
  const height = 150; const width = 300; const barWidth = 20; const gap = (width - (data.length * barWidth)) / (data.length + 1);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {[0, 4, 8, 12].map(h => {
        const y = height - (h / maxHours) * height;
        return <g key={h}><line x1="0" y1={y} x2={width} y2={y} stroke="#e5e7eb" strokeWidth="1" /><text x="-10" y={y + 4} fontSize="10" fill="#9ca3af" textAnchor="end">{h}h</text></g>;
      })}
      {data.map((d, i) => {
        const h = (d.sleep?.duration || 0);
        const barHeight = (h / maxHours) * height;
        const x = gap + i * (barWidth + gap);
        const y = height - barHeight;
        return (
          <g key={d.date}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={h >= 7 ? "#8b5cf6" : "#f87171"} rx="4"/>
            <text x={x + barWidth/2} y={height + 15} fontSize="10" fill="#6b7280" textAnchor="middle">{d.date.slice(5)}</text>
          </g>
        );
      })}
    </svg>
  );
};

const NutrientBar = ({ label, current, target, color }) => {
  const percent = Math.min(100, (current / target) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1 text-gray-600"><span>{label}</span><span>{Math.round(current)} / {target}</span></div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }}/></div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [logs, setLogs] = useState({});
  const [sleepForm, setSleepForm] = useState({ bedtime: '23:00', waketime: '07:00', quality: 3 });
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [aiModal, setAiModal] = useState({ open: false, title: '', content: '', loading: false });
  const [showDeployInfo, setShowDeployInfo] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (!auth) {
        setAuthError("Firebase unavailable.");
        return;
      }
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.warn("Auth failed, enabling Guest Mode", error);
        setAuthError(error.message);
      }
    };
    
    // Try to load from local storage if firebase fails or just for cache
    const savedLogs = localStorage.getItem('aahar_logs');
    if (savedLogs) {
      try { setLogs(JSON.parse(savedLogs)); } catch(e){}
    }

    initAuth();
    if(auth) return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    // Load data from Firestore if User exists
    if (!user || !db || isGuest) return;
    
    const collectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'daily_logs');
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const newLogs = {};
      snapshot.forEach(doc => newLogs[doc.id] = doc.data());
      setLogs(newLogs);
      // Backup to localstorage
      localStorage.setItem('aahar_logs', JSON.stringify(newLogs));
    }, (error) => {
       console.error("Error fetching logs:", error);
       setIsGuest(true); // Fallback to guest if permission denied
    });
    return () => unsubscribe();
  }, [user, isGuest]);

  const handleGuestLogin = () => {
    setUser({ uid: 'guest_user', isAnonymous: true });
    setIsGuest(true);
    setAuthError(null);
  };

  const updateLogs = async (newData) => {
    // Update State
    const newLogs = { ...logs, [selectedDate]: newData };
    setLogs(newLogs);
    
    // Update Local Storage (Always)
    localStorage.setItem('aahar_logs', JSON.stringify(newLogs));

    // Update Firestore (If connected)
    if (user && !isGuest && db) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'daily_logs', selectedDate), newData);
      } catch(e) {
        console.warn("Save to cloud failed, saved locally.");
      }
    }
  };

  const currentLog = useMemo(() => logs[selectedDate] || defaultDailyData, [logs, selectedDate]);
  
  const dailyNutrition = useMemo(() => {
    return (currentLog.food || []).reduce((acc, item) => {
      const multiplier = item.quantity;
      const info = INDIAN_FOOD_DB.find(f => f.name === item.name);
      if (!info) return acc;
      ['calories', 'protein', 'carbs', 'fat', 'vitA', 'vitC', 'iron', 'calcium'].forEach(k => acc[k] += info[k] * multiplier);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, vitA: 0, vitC: 0, iron: 0, calcium: 0 });
  }, [currentLog]);

  const historyList = useMemo(() => Object.keys(logs).map(date => ({ date, ...logs[date] })), [logs]);

  const saveSleep = async () => {
    const duration = calculateSleepDuration(sleepForm.bedtime, sleepForm.waketime);
    const newData = { ...currentLog, sleep: { ...sleepForm, duration } };
    await updateLogs(newData);
    setActiveTab('dashboard');
  };

  const addFood = async () => {
    if (!selectedFood) return;
    const newFoodItem = { name: selectedFood.name, quantity: foodQuantity, timestamp: new Date().toISOString() };
    const newData = { ...currentLog, food: [...(currentLog.food || []), newFoodItem] };
    await updateLogs(newData);
    setSelectedFood(null); setFoodQuantity(1); setFoodSearch('');
  };

  const removeFood = async (index) => {
    const newFoodList = [...(currentLog.food || [])];
    newFoodList.splice(index, 1);
    await updateLogs({ ...currentLog, food: newFoodList });
  };

  const handleSleepAnalysis = async () => {
    setAiModal({ open: true, title: 'Sleep Coach', content: '', loading: true });
    const sleepData = historyList.slice(-7).map(h => ({ date: h.date, hours: h.sleep?.duration, quality: h.sleep?.quality }));
    const prompt = `You are a sleep expert. Analyze this sleep data for an Indian user: ${JSON.stringify(sleepData)}. Provide 3 specific, encouraging tips. Keep concise.`;
    const advice = await callGemini(prompt);
    setAiModal({ open: true, title: 'Sleep Coach', content: advice, loading: false });
  };

  const handleFoodSuggestion = async () => {
    setAiModal({ open: true, title: 'Meal Suggestion', content: '', loading: true });
    const eaten = (currentLog.food || []).map(f => `${f.quantity}x ${f.name}`).join(', ');
    const stats = `Calories: ${Math.round(dailyNutrition.calories)}, Protein: ${Math.round(dailyNutrition.protein)}g`;
    const prompt = `You are an Indian nutritionist. I have eaten: [${eaten || "Nothing yet"}]. Stats: ${stats}. Suggest ONE healthy, vegetarian Indian snack or meal to balance my day. Brief reason.`;
    const suggestion = await callGemini(prompt);
    setAiModal({ open: true, title: 'Meal Suggestion', content: suggestion, loading: false });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-indigo-50 p-6">
        {authError ? (
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
             <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle size={32} />
             </div>
             <h2 className="text-lg font-bold text-gray-800 mb-2">Database Connection Failed</h2>
             <p className="text-sm text-gray-500 mb-6">
               We couldn't connect to Firebase. This usually means "Anonymous Auth" is disabled in the console.
             </p>
             
             <button 
               onClick={handleGuestLogin}
               className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
             >
               <WifiOff size={18} /> Continue Offline
             </button>
             <p className="text-xs text-gray-400 mt-4">Data will be saved to this device only.</p>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col">
      <AIModal isOpen={aiModal.open} title={aiModal.title} content={aiModal.content} isLoading={aiModal.loading} onClose={() => setAiModal({ ...aiModal, open: false })} />
      <DeployInfoModal isOpen={showDeployInfo} onClose={() => setShowDeployInfo(false)} />

      <header className="bg-indigo-600 text-white p-6 pb-12 rounded-b-[30px] shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity size={24} /> Aahar & Nidra</h1>
          <button onClick={() => setShowDeployInfo(true)} className="text-xs bg-indigo-500 hover:bg-indigo-400 transition-colors px-2 py-1 rounded flex items-center gap-1">
             <Smartphone size={14} /> Install App
          </button>
        </div>
        <div className="flex items-center justify-between bg-indigo-500/50 rounded-lg p-2">
          <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="p-1 hover:bg-indigo-400 rounded"><ChevronLeft size={20} /></button>
          <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} {selectedDate === getTodayStr() && " (Today)"}</span>
          <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="p-1 hover:bg-indigo-400 rounded"><ChevronRight size={20} /></button>
        </div>
        {isGuest && <div className="absolute top-full left-0 w-full bg-orange-100 text-orange-800 text-xs py-1 text-center z-0">Offline Mode (Guest)</div>}
      </header>

      <main className="flex-1 overflow-y-auto p-4 -mt-6 relative z-20 pb-24">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <button onClick={handleSleepAnalysis} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-lg"><Sparkles size={20} className="text-yellow-300" /></div><div className="text-left"><div className="font-bold text-sm">Nidra Guru AI</div><div className="text-xs text-violet-100">Analyze my sleep habits</div></div></div><ChevronRight size={20} className="text-white/70" />
            </button>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-gray-700 flex items-center gap-2"><Moon size={18} className="text-indigo-500" /> Sleep</h3><button onClick={() => setActiveTab('sleep')} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-medium">{currentLog.sleep?.duration > 0 ? 'Edit' : 'Log Sleep'}</button></div>
              {currentLog.sleep?.duration > 0 ? <div className="flex items-end gap-4"><div><span className="text-4xl font-bold text-indigo-600">{currentLog.sleep.duration}</span><span className="text-gray-500 ml-1">hrs</span></div><div className="text-sm text-gray-500 mb-1 flex-1">Quality: {['Poor', 'Fair', 'Good', 'Excellent', 'Perfect'][currentLog.sleep.quality - 1]}</div></div> : <div className="text-gray-400 text-sm text-center py-4">No sleep logged for this date</div>}
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-gray-700 flex items-center gap-2"><Utensils size={18} className="text-orange-500" /> Nutrition</h3><button onClick={() => setActiveTab('food')} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded font-medium">Add Food</button></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-orange-50 p-3 rounded-xl"><div className="text-xs text-orange-400 font-medium">Calories</div><div className="text-xl font-bold text-orange-700">{Math.round(dailyNutrition.calories)}</div><div className="text-[10px] text-orange-400">kcal</div></div>
                <div className="bg-blue-50 p-3 rounded-xl"><div className="text-xs text-blue-400 font-medium">Protein</div><div className="text-xl font-bold text-blue-700">{Math.round(dailyNutrition.protein)}</div><div className="text-[10px] text-blue-400">grams</div></div>
              </div>
              <NutrientBar label="Carbs" current={dailyNutrition.carbs} target={300} color="bg-green-500" />
              <NutrientBar label="Fats" current={dailyNutrition.fat} target={70} color="bg-yellow-500" />
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"><h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><BarChart2 size={18} className="text-gray-400"/> Weekly Sleep</h3><SleepChart history={historyList} /></div>
          </div>
        )}

        {activeTab === 'sleep' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><button onClick={() => setActiveTab('dashboard')} className="text-gray-400 hover:text-gray-600"><ChevronLeft /></button>Log Sleep</h2>
            <div className="space-y-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Bedtime</label><input type="time" value={sleepForm.bedtime} onChange={(e) => setSleepForm({...sleepForm, bedtime: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Wake Time</label><input type="time" value={sleepForm.waketime} onChange={(e) => setSleepForm({...sleepForm, waketime: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-3">Quality (1-5)</label><div className="flex justify-between">{[1, 2, 3, 4, 5].map(q => (<button key={q} onClick={() => setSleepForm({...sleepForm, quality: q})} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${sleepForm.quality === q ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{q}</button>))}</div><div className="flex justify-between text-xs text-gray-400 mt-2 px-2"><span>Poor</span><span>Excellent</span></div></div>
              <div className="pt-6"><button onClick={saveSleep} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"><Save size={20} /> Save Sleep Log</button></div>
            </div>
          </div>
        )}

        {activeTab === 'food' && (
          <div className="space-y-4 h-full flex flex-col">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4"><button onClick={() => setActiveTab('dashboard')} className="text-gray-400 hover:text-gray-600"><ChevronLeft /></button><h2 className="text-xl font-bold">Add Food</h2></div>
              <button onClick={handleFoodSuggestion} className="w-full mb-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white p-3 rounded-xl shadow flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity"><Sparkles size={16} className="text-yellow-200" /> Suggest Next Meal (AI)</button>
              <div className="relative mb-4"><input type="text" placeholder="Search (e.g. Poha, Bhindi, Tea)..." value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10"/><Search className="absolute left-3 top-3.5 text-gray-400" size={18} /></div>
              {foodSearch && (
                <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl mb-4">
                  {INDIAN_FOOD_DB.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase())).map(food => (
                    <button key={food.name} onClick={() => { setSelectedFood(food); setFoodSearch(''); }} className="w-full text-left p-3 hover:bg-orange-50 border-b border-gray-50 last:border-0 transition-colors"><div className="font-medium text-gray-800">{food.name}</div><div className="text-xs text-gray-500">{food.calories} kcal | P: {food.protein}g</div></button>
                  ))}
                  {INDIAN_FOOD_DB.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase())).length === 0 && <div className="p-3 text-center text-gray-400 text-sm">No matches found</div>}
                </div>
              )}
              {selectedFood && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4 animate-fade-in">
                  <div className="flex justify-between items-start mb-3"><div><h4 className="font-bold text-orange-900">{selectedFood.name}</h4><div className="text-xs text-orange-700">{selectedFood.calories} kcal per unit</div></div><button onClick={() => setSelectedFood(null)} className="text-orange-400 hover:text-orange-600"><Trash2 size={16} /></button></div>
                  <div className="flex items-center gap-3 mb-3"><button onClick={() => setFoodQuantity(Math.max(0.5, foodQuantity - 0.5))} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-orange-600 font-bold">-</button><span className="font-medium text-lg w-12 text-center">{foodQuantity}</span><button onClick={() => setFoodQuantity(foodQuantity + 0.5)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-orange-600 font-bold">+</button></div>
                  <button onClick={addFood} className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold shadow hover:bg-orange-600 transition-colors">Add to Log</button>
                </div>
              )}
            </div>
            <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
               <h3 className="font-semibold text-gray-700 mb-3">Today's Meals</h3>
               {(currentLog.food || []).length === 0 ? <div className="text-center py-8 text-gray-400 text-sm"><div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2"><Utensils size={20} /></div>Nothing eaten yet?</div> : <div className="space-y-2">{(currentLog.food || []).map((item, idx) => { const info = INDIAN_FOOD_DB.find(f => f.name === item.name); const cals = info ? info.calories * item.quantity : 0; return (<div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group"><div><div className="font-medium text-gray-800">{item.name}</div><div className="text-xs text-gray-500">x{item.quantity} • {cals} kcal</div></div><button onClick={() => removeFood(idx)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={16} /></button></div>);})}</div>}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <h2 className="font-bold text-lg mb-4 text-gray-800 flex justify-between items-center">Nutrient Breakdown <Info size={16} className="text-gray-400" /></h2>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-green-50 p-4 rounded-xl"><div className="flex items-center gap-2 text-green-700 font-semibold mb-2"><Droplet size={16}/> Vitamins</div><div className="space-y-2"><div><div className="flex justify-between text-xs text-gray-600 mb-1"><span>Vit A</span> <span>{Math.round(dailyNutrition.vitA)}%</span></div><div className="h-1.5 bg-green-200 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{width: `${Math.min(100, dailyNutrition.vitA)}%`}}></div></div></div><div><div className="flex justify-between text-xs text-gray-600 mb-1"><span>Vit C</span> <span>{Math.round(dailyNutrition.vitC)}%</span></div><div className="h-1.5 bg-green-200 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{width: `${Math.min(100, dailyNutrition.vitC)}%`}}></div></div></div></div></div>
                 <div className="bg-purple-50 p-4 rounded-xl"><div className="flex items-center gap-2 text-purple-700 font-semibold mb-2"><Activity size={16}/> Minerals</div><div className="space-y-2"><div><div className="flex justify-between text-xs text-gray-600 mb-1"><span>Iron</span> <span>{Math.round(dailyNutrition.iron)}%</span></div><div className="h-1.5 bg-purple-200 rounded-full overflow-hidden"><div className="h-full bg-purple-500" style={{width: `${Math.min(100, dailyNutrition.iron)}%`}}></div></div></div><div><div className="flex justify-between text-xs text-gray-600 mb-1"><span>Calcium</span> <span>{Math.round(dailyNutrition.calcium)}%</span></div><div className="h-1.5 bg-purple-200 rounded-full overflow-hidden"><div className="h-full bg-purple-500" style={{width: `${Math.min(100, dailyNutrition.calcium)}%`}}></div></div></div></div></div>
               </div>
             </div>
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg text-gray-800">7-Day Sleep Trend</h2><button onClick={handleSleepAnalysis} className="text-xs bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-violet-200 transition-colors"><Sparkles size={12} /> Ask Guru</button></div>
               <SleepChart history={historyList} />
             </div>
          </div>
        )}
      </main>

      <nav className="bg-white border-t border-gray-200 p-2 pb-4 fixed bottom-0 w-full max-w-md z-50 flex justify-around">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}><Activity size={24} /><span className="text-[10px] font-medium">Overview</span></button>
        <button onClick={() => setActiveTab('sleep')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${activeTab === 'sleep' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}><Moon size={24} /><span className="text-[10px] font-medium">Sleep</span></button>
        <button onClick={() => setActiveTab('food')} className={`relative p-2 -mt-6 bg-orange-500 text-white rounded-full shadow-lg border-4 border-gray-50 flex flex-col items-center justify-center w-14 h-14 hover:bg-orange-600 transition-transform active:scale-95`}><Plus size={28} /></button>
        <button onClick={() => setActiveTab('analysis')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${activeTab === 'analysis' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}><PieChart size={24} /><span className="text-[10px] font-medium">Analysis</span></button>
        <button onClick={() => setShowDeployInfo(true)} className={`p-2 rounded-xl flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600`}><Smartphone size={24} /><span className="text-[10px] font-medium">Install</span></button>
      </nav>
    </div>
  );
}
