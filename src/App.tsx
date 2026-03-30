import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home as HomeIcon, Video, Youtube, Cpu, Mail, Shield, Sparkles, Users, BookOpen, Calendar as CalendarIcon, Trophy, User as UserIcon, LogOut, Newspaper, Image as ImageIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';

// Components
import Home from './components/Home';
import Community from './components/Community';
import Classroom from './components/Classroom';
import YouTube from './components/YouTube';
import Contact from './components/Contact';
import Admin from './components/Admin';
import Timeline from './components/Timeline';
import AIHub from './components/AIHub';
import About from './components/About';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import AINews from './components/AINews';
import AIArtGallery from './components/AIArtGallery';

const Navbar = ({ user, isAdmin }: { user: FirebaseUser | null, isAdmin: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: <HomeIcon size={18} /> },
    { name: 'Community', path: '/community', icon: <Users size={18} /> },
    { name: 'Classroom', path: '/classroom', icon: <BookOpen size={18} /> },
    { name: 'YouTube', path: '/youtube', icon: <Youtube size={18} /> },
    { name: 'AI News', path: '/ai-news', icon: <Newspaper size={18} /> },
    { name: 'AI Hub', path: '/ai-hub', icon: <Cpu size={18} /> },
    { name: 'Gallery', path: '/ai-art-gallery', icon: <ImageIcon size={18} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={18} /> },
    { name: 'About', path: '/about', icon: <UserIcon size={18} /> },
    { name: 'Profile', path: '/profile', icon: <UserIcon size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter uppercase bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Bhaskar AI Hub
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    location.pathname === item.path ? 'text-cyan-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    location.pathname === '/admin' ? 'text-purple-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield size={18} />
                  <span>Admin</span>
                </Link>
              )}
              {user && (
                <button
                  onClick={() => signOut(auth)}
                  className="flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="md:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-8 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 block px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest ${
                    location.pathname === item.path ? 'text-cyan-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 block px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest ${
                    location.pathname === '/admin' ? 'text-purple-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield size={18} />
                  <span>Admin</span>
                </Link>
              )}
              {user && (
                <button
                  onClick={() => {
                    signOut(auth);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 block w-full text-left px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);

  const checkProfileStatus = async (firebaseUser: FirebaseUser, retries = 3) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
        if (userDoc.data().isProfileComplete) {
          setIsProfileComplete(true);
        } else {
          setIsProfileComplete(false);
        }
      } else {
        setIsProfileComplete(false);
      }
    } catch (error) {
      if (retries > 0 && error instanceof Error && error.message.includes('offline')) {
        console.log(`Firestore offline, retrying profile check... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return checkProfileStatus(firebaseUser, retries - 1);
      }
      handleFirestoreError(error, OperationType.GET, 'users');
      setIsProfileComplete(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await checkProfileStatus(firebaseUser);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserRole(null);
        setIsProfileComplete(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Not logged in -> Show Login
  if (!user) {
    return <Login />;
  }

  // 2. Logged in but profile not complete -> Show Profile Setup
  if (isProfileComplete === false) {
    return <ProfileSetup user={user} onComplete={() => setIsProfileComplete(true)} />;
  }

  // 3. Logged in and profile complete -> Show App
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 atmosphere-bg">
        <Navbar user={user} isAdmin={userRole === 'admin'} />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/community" element={<Community />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/ai-news" element={<AINews />} />
            <Route path="/ai-hub" element={<AIHub />} />
            <Route path="/ai-art-gallery" element={<AIArtGallery />} />
            <Route path="/youtube" element={<YouTube />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/timeline" element={<Timeline />} />
          </Routes>
        </main>
        
        <footer className="py-12 border-t border-white/10 bg-black/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Bhaskar AI Hub. All rights reserved.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">YouTube</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
