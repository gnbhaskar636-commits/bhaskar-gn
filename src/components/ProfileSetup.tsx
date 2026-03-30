import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'framer-motion';
import { User, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

const ProfileSetup = ({ user, onComplete }: { user: FirebaseUser, onComplete: () => void }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [saving, setSaving] = useState(false);
  const [photoURL, setPhotoURL] = useState(user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}&topType=shortHair&facialHairProbability=0&mouthType=smile&clotheType=hoodie`);

  const handleComplete = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      const userCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const isDefaultAdmin = user.email === "gnbhaskar636@gmail.com";
      
      const userData = {
        displayName,
        email: user.email || '',
        photoURL,
        role: isDefaultAdmin ? 'admin' : 'user',
        points: 0,
        level: 1,
        trend: 'stable',
        userCode,
        isProfileComplete: true
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      // Create public profile for leaderboard
      await setDoc(doc(db, 'public_profiles', user.uid), {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        points: userData.points,
        level: userData.level,
        trend: userData.trend,
        userCode: userData.userCode,
        isProfileComplete: true
      });

      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    } finally {
      setSaving(false);
    }
  };

  const generateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setPhotoURL(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&topType=shortHair&facialHairProbability=0&mouthType=smile&clotheType=hoodie`);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden atmosphere-bg">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full glass-panel rounded-[64px] p-12 md:p-16 relative z-10"
      >
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl shadow-white/10">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Initialize Identity</h2>
        </div>

        <p className="text-gray-500 mb-12 text-lg font-medium leading-relaxed">
          Welcome to the Hub. Before you enter, we need to establish your digital presence.
        </p>

        <div className="flex flex-col items-center mb-12">
          <div className="relative group mb-8">
            <div className="w-40 h-40 rounded-[40px] overflow-hidden border-4 border-white bg-black/40 shadow-2xl shadow-white/10 transition-transform group-hover:scale-105 duration-500">
              <img
                src={photoURL}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={generateAvatar}
              className="absolute -bottom-4 -right-4 p-4 bg-white text-black rounded-2xl hover:bg-cyan-400 transition-all shadow-2xl shadow-white/20 group active:scale-90"
            >
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.2em] font-black">Your Identical Avatar</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Your Name</label>
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-16 py-6 text-white focus:border-cyan-500 focus:outline-none transition-all text-xl font-bold placeholder:text-gray-800"
                placeholder="How should we call you?"
              />
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={!displayName.trim() || saving}
            className="w-full py-6 bg-white text-black font-black rounded-3xl flex items-center justify-center space-x-4 hover:bg-cyan-400 transition-all shadow-2xl shadow-white/10 disabled:opacity-50 mt-10 group active:scale-95"
          >
            {saving ? (
              <RefreshCw size={28} className="animate-spin" />
            ) : (
              <>
                <span className="text-sm uppercase tracking-[0.2em]">Generate Identity Code</span>
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
