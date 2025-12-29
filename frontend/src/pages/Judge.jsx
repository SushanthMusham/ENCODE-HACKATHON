import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ScanSearch, UserCircle, ShieldAlert, Sparkles, Activity, 
  Search, BrainCircuit, AlertTriangle, LogOut, Camera, X 
} from "lucide-react";
import api from "../api";
import { useNavigate } from "react-router-dom";

// Helper for rendering bold text
const RenderText = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => 
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export default function Judge() {
  const [ingredients, setIngredients] = useState("");
  const [persona, setPersona] = useState("");
  const [showPersona, setShowPersona] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingText, setLoadingText] = useState("Initializing...");
  
  // New States for Image Handling
  const [selectedImage, setSelectedImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();
  const resultRef = useRef(null);

  // --- NEW: Fetch User Context on Load ---
  useEffect(() => {
    const fetchContext = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // We ask the backend: "Do you have any health context for this user?"
        const res = await api.get("/judge/context", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (res.data.persona) {
          setPersona(res.data.persona);
          // Optional: We can auto-open the panel so they see it
          // setShowPersona(true); 
        }
      } catch (err) {
        console.error("Context sync failed", err);
      }
    };
    fetchContext();
  }, []);

  useEffect(() => {
    if (!loading) return;
    const steps = [
      "Identifying chemical compounds...",
      "Processing visual data...",
      "Querying toxicity databases...",
      "Simulating metabolic response...",
      "Synthesizing final verdict..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(steps[i % steps.length]);
      i++;
    }, 1200); 
    return () => clearInterval(interval);
  }, [loading]);

  // Handle Image Selection and Base64 conversion
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setBase64Image(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleJudge = async () => {
    if (!ingredients.trim() && !base64Image) return;
    setLoading(true);
    setResult(null);
    
    if (window.innerWidth < 1024) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      const res = await api.post("/judge", 
        { 
          ingredients, 
          image_url: base64Image, // Sending the base64 string
          userProfile: persona 
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTimeout(() => { 
        setResult(res.data); 
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("System Error. Please retry.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getThemeStyles = (verdict) => {
    const v = verdict?.toLowerCase() || "";
    if (v.includes("safe") || v.includes("healthy")) return { text: "text-emerald-400", badge: "bg-emerald-500 text-black" };
    if (v.includes("moderate") || v.includes("caution")) return { text: "text-amber-400", badge: "bg-amber-500 text-black" };
    return { text: "text-rose-500", badge: "bg-rose-600 text-white" };
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#050505] text-white flex flex-col lg:flex-row overflow-x-hidden font-sans selection:bg-indigo-500/30">
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] lg:w-[800px] h-[500px] lg:h-[800px] bg-indigo-900/10 rounded-full blur-[80px] lg:blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] lg:w-[800px] h-[500px] lg:h-[800px] bg-purple-900/10 rounded-full blur-[80px] lg:blur-[120px]" />
      </div>

      {/* --- LEFT PANEL --- */}
      <div className="w-full lg:w-[40%] flex-shrink-0 p-6 lg:p-10 flex flex-col justify-center z-10 relative border-b lg:border-b-0 lg:border-r border-white/5 bg-black/20 backdrop-blur-sm">
        
        <div className="space-y-6 lg:space-y-8 max-w-lg mx-auto w-full">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 opacity-50">
                <Activity size={14} />
                <span className="text-[10px] lg:text-xs font-mono tracking-widest uppercase">System v2.4 Online</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-neutral-500 hover:text-rose-400 transition-colors group">
                <LogOut size={16} />
              </button>
            </div>
            <h1 className="text-3xl lg:text-5xl font-light tracking-tight text-white">
              Ingredient <span className="text-indigo-500 font-semibold">Analyst</span>
            </h1>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-1 shadow-2xl transition-all focus-within:border-indigo-500/50 focus-within:bg-white/10">
            {/* Image Preview Area */}
            {selectedImage && (
              <div className="relative p-4 border-b border-white/5">
                <img src={selectedImage} alt="Scan preview" className="h-32 w-full object-cover rounded-xl opacity-80" />
                <button 
                  onClick={clearImage}
                  className="absolute top-6 right-6 p-1 bg-black/60 rounded-full text-white hover:bg-rose-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <textarea
              placeholder={selectedImage ? "Add notes or hit analyze..." : "Paste ingredients or upload image..."}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full h-32 lg:h-40 bg-transparent text-base lg:text-lg p-4 resize-none outline-none text-white/90 placeholder:text-neutral-700 font-mono"
            />
            
            <div className="flex items-center justify-between px-3 pb-3 pt-2 border-t border-white/5">
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowPersona(!showPersona)}
                  className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${showPersona ? 'bg-indigo-500/20 text-indigo-300' : 'text-neutral-500 hover:text-white'}`}
                >
                  <UserCircle size={14} />
                  {/* --- NEW: Visual indicator if context exists --- */}
                  {persona ? (
                    <span className="text-indigo-300 font-bold">Context Active</span>
                  ) : (
                    showPersona ? "Close Context" : "Add Context"
                  )}
                </button>

                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                  accept="image/*"
                />
                
                {/* Image Upload Trigger */}
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${selectedImage ? 'bg-emerald-500/20 text-emerald-300' : 'text-neutral-500 hover:text-white'}`}
                >
                  <Camera size={14} />
                  {selectedImage ? "Image Loaded" : "Upload Image"}
                </button>
              </div>
              <span className="text-[10px] lg:text-xs text-neutral-600 font-mono">{ingredients.length} chars</span>
            </div>
          </div>

          <AnimatePresence>
            {showPersona && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <input
                  type="text"
                  placeholder="e.g. 'I am diabetic' or 'Avoiding seed oils'"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 py-2 px-2 text-sm text-indigo-200 placeholder-neutral-700 focus:border-indigo-500 outline-none transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleJudge}
            disabled={loading || (!ingredients && !base64Image)}
            className="group w-full bg-white text-black hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed h-12 lg:h-14 rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3"
          >
            {loading ? (
              <> <Sparkles className="animate-spin" size={18} /> Processing... </>
            ) : (
              <> Analyze Ingredients <Search size={18} className="group-hover:translate-x-1 transition-transform" /> </>
            )}
          </button>
        </div>
      </div>

      {/* --- RIGHT PANEL: THE MONITOR --- */}
      <div ref={resultRef} className="w-full lg:w-[60%] flex-grow lg:h-full p-4 lg:p-6 bg-[#020202] relative z-10">
        <div className="w-full h-full min-h-[500px] bg-neutral-900/30 border border-white/10 rounded-3xl overflow-hidden relative flex flex-col shadow-2xl backdrop-blur-md">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {!loading && !result && (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-700 space-y-6 p-4 text-center">
              <BrainCircuit size={80} className="relative z-10 text-neutral-800" strokeWidth={1} />
              <p className="font-mono text-xs lg:text-sm tracking-widest uppercase opacity-50">Neural Engine Standby</p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12">
              <div className="w-full max-w-md space-y-6">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-indigo-500" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, repeat: Infinity }} />
                </div>
                <div className="font-mono text-xs lg:text-sm text-indigo-400 space-y-2">
                  <p className="opacity-50">{">"} Connection established</p>
                  <motion.p key={loadingText} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    {">"} {loadingText}
                  </motion.p>
                </div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="flex-1 overflow-y-auto p-6 lg:p-12 scrollbar-hide">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-white/10 pb-6 gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-500 mb-2 block">Analysis Result</span>
                    <h2 className={`text-3xl lg:text-5xl font-bold tracking-tight ${getThemeStyles(result.verdict).text} drop-shadow-lg`}>
                      {result.verdict}
                    </h2>
                  </div>
                  <div className={`self-start px-4 py-2 rounded-lg text-[10px] lg:text-xs font-bold uppercase tracking-wider shadow-lg ${getThemeStyles(result.verdict).badge}`}>
                    {result.ui_theme || "COMPLETE"}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                      <ScanSearch size={14} /> Summary
                    </h3>
                    <p className="text-lg lg:text-xl leading-relaxed text-white/90 font-light">
                      <RenderText text={result.short_reason} />
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-5 lg:p-6 border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:border-indigo-500/50 group cursor-default">
                      <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Detailed Logic</h3>
                      <div className="text-sm text-neutral-400 leading-relaxed space-y-2">
                        <RenderText text={result.detailed_reason} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className={`rounded-2xl p-5 lg:p-6 border transition-all duration-300 hover:scale-[1.02] ${
                          result.highlighted_ingredients?.length > 0 ? 'bg-rose-950/30 border-rose-500/20' : 'bg-white/5 border-white/5'
                        }`}>
                        <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${
                          result.highlighted_ingredients?.length > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {result.highlighted_ingredients?.length > 0 ? <AlertTriangle size={14}/> : <ShieldAlert size={14}/>}
                          Flagged Agents
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.highlighted_ingredients?.map((item, idx) => (
                            <span key={idx} className="bg-rose-600/20 text-rose-200 border border-rose-500/50 px-3 py-1.5 rounded-md text-[10px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-indigo-900/20 rounded-2xl p-5 lg:p-6 border border-indigo-500/20 flex gap-4 items-start transition-all duration-300 hover:scale-[1.02]">
                        <ShieldAlert className="text-indigo-400 shrink-0" size={18} />
                        <div className="text-xs text-indigo-200/80 leading-relaxed">
                          <strong className="block text-indigo-400 mb-1">Confidence Score: High</strong>
                          {result.uncertainty_note}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}