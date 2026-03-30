import React, { useState, useEffect } from 'react';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'framer-motion';
import { User, Save, RefreshCw, Copy, Check, LogOut } from 'lucide-react';

const Profile = ({ user }: { user: FirebaseUser | null }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // If user doesn't have a code yet, generate one
          if (!data.userCode) {
            const userCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            await updateDoc(doc(db, 'users', user.uid), { userCode });
            await updateDoc(doc(db, 'public_profiles', user.uid), { userCode });
            data.userCode = userCode;
          }
          setUserData(data);
          setDisplayName(data.displayName || '');
          setPhotoURL(data.photoURL || '');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates = {
        displayName,
        photoURL
      };
      await updateDoc(doc(db, 'users', user.uid), updates);
      await updateDoc(doc(db, 'public_profiles', user.uid), updates);
      setUserData({ ...userData, ...updates });
      alert('Profile updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const generateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    // Using avataaars with specific settings for a young male look
    // topType: short hair, no facial hair, youthful clothes
    setPhotoURL(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&topType=shortHair&facialHairProbability=0&mouthType=smile&clotheType=hoodie`);
  };

  const copyCode = () => {
    if (userData?.userCode) {
      navigator.clipboard.writeText(userData.userCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <User size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please log in to view your profile</h2>
        <p className="text-gray-400">You need to be authenticated to manage your user code and identity.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 relative z-10">
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[64px] p-8 md:p-16 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 mb-16 relative z-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[48px] overflow-hidden border-4 border-white bg-black/40 shadow-2xl shadow-white/10 transition-transform group-hover:scale-105 duration-500">
              <img
                src={photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.displayName}&topType=shortHair&facialHairProbability=0&mouthType=smile&clotheType=hoodie`}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={generateAvatar}
              className="absolute -bottom-4 -right-4 p-4 bg-white text-black rounded-2xl hover:bg-cyan-400 transition-all shadow-2xl shadow-white/20 group active:scale-90"
              title="Generate Random Avatar"
            >
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">User Identity</h2>
            <p className="text-gray-500 mb-10 text-lg font-medium">Manage your unique code and public profile information.</p>
            
            <div className="inline-flex items-center space-x-4 bg-white/5 border border-white/10 rounded-3xl px-8 py-4 shadow-2xl shadow-black/20">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Your Code:</span>
              <span className="text-2xl font-mono font-black text-cyan-400 tracking-wider">{userData?.userCode}</span>
              <button
                onClick={copyCode}
                className="p-3 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white group"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="group-hover:scale-110 transition-transform" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:border-cyan-500 focus:outline-none transition-all text-lg font-bold placeholder:text-gray-800"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Profile Image URL</label>
              <input
                type="text"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:border-cyan-500 focus:outline-none transition-all text-lg font-bold placeholder:text-gray-800"
                placeholder="https://..."
              />
              <p className="mt-4 text-[10px] text-gray-700 uppercase tracking-[0.2em] font-black">
                Tip: Use the refresh button above to generate a unique random avatar.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-[48px] p-10 flex flex-col justify-center border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-gray-600">Profile Preview</h4>
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-[24px] overflow-hidden border-2 border-white/10 shadow-2xl shadow-black/40">
                <img
                  src={photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&topType=shortHair&facialHairProbability=0&mouthType=smile&clotheType=hoodie`}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="font-black text-2xl uppercase tracking-tight">{displayName || 'Anonymous'}</div>
                <div className="text-sm text-cyan-500 font-mono font-black mt-1">#{userData?.userCode}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-12 border-t border-white/5 flex flex-col md:flex-row gap-6 relative z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-12 py-6 bg-white text-black font-black rounded-3xl flex items-center justify-center space-x-4 hover:bg-cyan-400 transition-all shadow-2xl shadow-white/10 disabled:opacity-50 active:scale-95 group"
          >
            {saving ? (
              <RefreshCw size={24} className="animate-spin" />
            ) : (
              <Save size={24} className="group-hover:scale-110 transition-transform" />
            )}
            <span className="text-sm uppercase tracking-[0.2em]">Save Profile Changes</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="px-10 py-6 bg-red-500/10 text-red-500 border border-red-500/20 font-black rounded-3xl flex items-center justify-center space-x-4 hover:bg-red-500 hover:text-white transition-all active:scale-95 group"
          >
            <LogOut size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm uppercase tracking-[0.2em]">Logout</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
