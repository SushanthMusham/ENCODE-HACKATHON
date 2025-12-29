import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 
import { UserPlus, Activity, ArrowRight } from "lucide-react"; 

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(""); 

    try {
      const res = await api.post("/auth/signup", { email, password });
      localStorage.setItem("token", res.data.token);
      
      setMsg("Account created successfully. Redirecting...");
      
      setTimeout(() => {
        navigate("/judge");
      }, 1000);

    } catch (err) {
      setIsLoading(false);
      setMsg(err.response?.data?.error || "Unable to create account. Please try again.");
    }
  };

  return (
    // 1. Background: Matches the System v2.4 Dashboard (#050505)
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* 2. Alive Background (Consistent across all pages) */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* 3. The Signup Card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Glass Container */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          {/* Header */}
          <div className="mb-10 text-center relative z-10">
            {/* Icon Box */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-6 text-indigo-400 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
              <UserPlus size={20} />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2 opacity-50">
              <Activity size={14} />
              <span className="text-[10px] font-mono tracking-widest uppercase">System v2.4 Registration</span>
            </div>
            
            <h1 className="text-3xl font-light tracking-tight text-white">
              Create <span className="font-semibold text-indigo-500">Account</span>
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Register for secure access to the reasoning engine.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6 relative z-10">
            
            {/* Email Input */}
            <div className="group space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                Email
              </label>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-700 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all font-sans"
                placeholder="researcher@system.ai"
              />
            </div>

            {/* Password Input */}
            <div className="group space-y-2">
               <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                Password
              </label>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-700 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all font-sans"
                placeholder="••••••••••••"
              />
            </div>

            {/* Status Message */}
            <div className={`overflow-hidden transition-all duration-300 ${msg ? "h-6 opacity-100" : "h-0 opacity-0"}`}>
              <div className={`text-xs text-center font-mono ${msg.includes("successfully") ? "text-emerald-400" : "text-rose-400"}`}>
                {">"} {msg}
              </div>
            </div>

            {/* Action Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-indigo-50 font-bold py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Activity className="animate-spin" size={18} /> Creating Account...
                </span>
              ) : (
                <>
                  Sign Up <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center relative z-10">
            <button 
              onClick={() => navigate("/login")}
              className="text-xs text-neutral-500 hover:text-white transition-colors duration-300 flex items-center justify-center gap-1 mx-auto"
            >
              Already have an account? <span className="underline decoration-indigo-500/50 underline-offset-4">Log In</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}