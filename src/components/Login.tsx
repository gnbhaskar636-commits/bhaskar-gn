import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      console.log("Initiating Google Sign-In popup...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Sign-In successful:", result.user.email);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/internal-error') {
        setError("Internal authentication error. This often happens if popups are blocked or third-party cookies are disabled in your browser.");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError("Sign-in was cancelled. Please try again.");
      } else {
        setError(`Google sign-in failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/user-not-found') {
        setError("Account not found. Would you like to register?");
        setIsRegistering(true);
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Email already in use. Please login instead.");
        setIsRegistering(false);
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden atmosphere-bg">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-panel rounded-[64px] p-12 md:p-16 text-center relative z-10 border border-white/5 shadow-2xl"
      >
        <div className="w-20 h-20 bg-white text-black rounded-[28px] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-white/10">
          <Sparkles size={40} />
        </div>

        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
          Neural Hub
        </h1>
        <p className="text-gray-500 mb-10 text-sm font-bold uppercase tracking-[0.2em]">
          Premium AI Ecosystem
        </p>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
          <div className="relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold uppercase tracking-widest focus:border-cyan-400 focus:outline-none transition-all placeholder:text-gray-700"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold uppercase tracking-widest focus:border-cyan-400 focus:outline-none transition-all placeholder:text-gray-700"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-[10px] font-black uppercase tracking-widest text-left px-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
          >
            <span className="text-xs uppercase tracking-[0.2em]">
              {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
            </span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em] text-gray-700 bg-[#050505] px-4">
            Or continue with
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 transition-all active:scale-95"
          >
            <LogIn size={20} />
            <span className="text-[10px] uppercase tracking-[0.2em]">Google Account</span>
          </button>
        </div>

        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-8 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold hover:text-white transition-colors"
        >
          {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
