import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as FirebaseUser, signInWithPopup, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { LogIn, LogOut, Video, Youtube, Cpu, Plus, Trash2, Upload, CheckCircle, AlertCircle, Shield, Users, BookOpen, Calendar as CalendarIcon, RefreshCw, Activity } from 'lucide-react';

interface AdminProps {
  user: FirebaseUser | null;
}

const Admin = ({ user }: AdminProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'youtube' | 'ai' | 'community' | 'classroom' | 'system'>('community');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ coll: string, id: string } | null>(null);

  // Form states
  const [videoForm, setVideoForm] = useState({ title: '', description: '', videoFile: null as File | null, thumbnailFile: null as File | null });
  const [youtubeForm, setYoutubeForm] = useState({ title: '', videoId: '', description: '' });
  const [aiForm, setAiForm] = useState({ title: '', description: '', imageFile: null as File | null, category: 'AI Art' });
  const [communityForm, setCommunityForm] = useState({ content: '' });
  const [classroomForm, setClassroomForm] = useState({ title: '', description: '', thumbnailFile: null as File | null, lessons: 0, duration: '', category: 'Foundations' });

  const [automationSecret, setAutomationSecret] = useState('');

  // List states
  const [videos, setVideos] = useState<any[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<any[]>([]);
  const [aiContent, setAiContent] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.email === "gnbhaskar636@gmail.com");
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      const unsubVideos = onSnapshot(query(collection(db, 'videos'), orderBy('createdAt', 'desc')), (s) => setVideos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      const unsubYoutube = onSnapshot(query(collection(db, 'youtubeLinks'), orderBy('createdAt', 'desc')), (s) => setYoutubeLinks(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      const unsubAI = onSnapshot(query(collection(db, 'aiContent'), orderBy('createdAt', 'desc')), (s) => setAiContent(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      const unsubPosts = onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')), (s) => setPosts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      const unsubCourses = onSnapshot(query(collection(db, 'courses'), orderBy('createdAt', 'desc')), (s) => setCourses(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      
      return () => { 
        unsubVideos(); unsubYoutube(); unsubAI(); unsubPosts(); unsubCourses();
      };
    }
  }, [isAdmin]);

  const handleLogin = async () => {
    setError('');
    try {
      console.log("Initiating Admin Google Sign-In popup...");
      await signInWithPopup(auth, googleProvider);
      console.log("Admin Sign-In successful");
    } catch (err: any) {
      console.error('Admin Login failed:', err);
      if (err.code === 'auth/internal-error') {
        setError("Internal authentication error. This often happens if popups are blocked or third-party cookies are disabled.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked. Please allow popups for this site.");
      } else {
        setError(`Login failed: ${err.message || "Please try again."}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError('Logout failed.');
    }
  };

  const uploadFile = async (file: File, path: string, onProgress?: (progress: number) => void) => {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    return new Promise<string>((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        }, 
        reject, 
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.videoFile) return setError('Video file is required');
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    try {
      const videoUrl = await uploadFile(videoForm.videoFile, 'videos', (progress) => {
        setUploadProgress(progress);
      });
      let thumbnailUrl = '';
      if (videoForm.thumbnailFile) {
        thumbnailUrl = await uploadFile(videoForm.thumbnailFile, 'thumbnails');
      }
      await addDoc(collection(db, 'videos'), {
        title: videoForm.title,
        description: videoForm.description,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        createdAt: serverTimestamp(),
        authorUid: user?.uid
      });
      setSuccess('Video added successfully!');
      setVideoForm({ title: '', description: '', videoFile: null, thumbnailFile: null });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'videos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'youtubeLinks'), {
        ...youtubeForm,
        createdAt: serverTimestamp()
      });
      setSuccess('YouTube link added!');
      setYoutubeForm({ title: '', videoId: '', description: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'youtubeLinks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiForm.imageFile) return setError('Image file is required');
    setLoading(true);
    setError(null);
    try {
      const imageUrl = await uploadFile(aiForm.imageFile, 'ai-content');
      await addDoc(collection(db, 'aiContent'), {
        title: aiForm.title,
        description: aiForm.description,
        imageUrl,
        category: aiForm.category,
        createdAt: serverTimestamp()
      });
      setSuccess('AI content added!');
      setAiForm({ title: '', description: '', imageFile: null, category: 'AI Art' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'aiContent');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityForm.content.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        content: communityForm.content,
        authorName: user?.displayName || 'Bhaskar',
        authorPhoto: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bhaskar',
        authorUid: user?.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0
      });
      setSuccess('Post published!');
      setCommunityForm({ content: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'posts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomForm.thumbnailFile) return setError('Thumbnail is required');
    setLoading(true);
    try {
      const thumbnail = await uploadFile(classroomForm.thumbnailFile, 'courses');
      const { thumbnailFile, ...courseData } = classroomForm;
      await addDoc(collection(db, 'courses'), {
        ...courseData,
        thumbnail,
        authorUid: user?.uid,
        authorName: user?.displayName || 'Bhaskar',
        createdAt: serverTimestamp()
      });
      setSuccess('Course added!');
      setClassroomForm({ title: '', description: '', thumbnailFile: null, lessons: 0, duration: '', category: 'Foundations' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    setItemToDelete({ coll, id });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, itemToDelete.coll, itemToDelete.id));
      setSuccess('Item deleted successfully.');
      setShowConfirm(false);
      setItemToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, itemToDelete.coll);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 rounded-[3rem] text-center max-w-md w-full relative z-10"
        >
          <div className="w-24 h-24 bg-cyan-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-cyan-400 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <Shield size={48} />
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">ADMIN LOGIN</h2>
          <p className="text-gray-500 mb-10 text-sm font-medium leading-relaxed uppercase tracking-widest">Authorized Personnel Only</p>
          <button
            onClick={handleLogin}
            className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-cyan-400 transition-all shadow-2xl shadow-white/10 group active:scale-95"
          >
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-xs uppercase tracking-[0.2em]">Login with Google</span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 rounded-[3rem] text-center max-w-md w-full relative z-10 border-red-500/20"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">ACCESS DENIED</h2>
          <p className="text-gray-500 mb-10 text-sm font-medium leading-relaxed uppercase tracking-widest">Insufficient Privileges</p>
          <button 
            onClick={handleLogout} 
            className="w-full py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
          >
            Logout & Switch Account
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-bold tracking-widest uppercase mb-4">
              <Shield size={16} />
              <span>Control Center</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
              ADMIN <span className="text-cyan-400">DASHBOARD</span>
            </h2>
            <p className="text-gray-500 mt-2">Manage your portfolio content and AI platform ecosystem.</p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 glass-panel rounded-2xl text-gray-400 hover:text-white hover:border-red-500/50 transition-all group"
          >
            <LogOut size={18} className="group-hover:text-red-500 transition-colors" />
            <span className="font-bold uppercase tracking-widest text-sm">Logout</span>
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar / Tabs */}
          <div className="lg:col-span-1 space-y-4">
            {[
              { id: 'community', label: 'Community', icon: <Users size={20} /> },
              { id: 'classroom', label: 'Academy', icon: <BookOpen size={20} /> },
              { id: 'videos', label: 'Videos', icon: <Video size={20} /> },
              { id: 'youtube', label: 'YouTube', icon: <Youtube size={20} /> },
              { id: 'ai', label: 'AI Lab', icon: <Cpu size={20} /> },
              { id: 'system', label: 'System', icon: <Shield size={20} /> },
            ].map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-4 p-5 rounded-2xl border transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                    : 'glass-panel border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                <div className={`${activeTab === tab.id ? 'text-cyan-400' : 'text-gray-500'}`}>{tab.icon}</div>
                <span className="font-black uppercase tracking-widest text-xs">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }} 
                  className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-2xl flex items-center space-x-3 backdrop-blur-md"
                >
                  <AlertCircle size={20} />
                  <span className="text-sm font-bold uppercase tracking-wide">{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }} 
                  className="p-4 bg-green-500/10 border border-green-500/50 text-green-500 rounded-2xl flex items-center space-x-3 backdrop-blur-md"
                >
                  <CheckCircle size={20} />
                  <span className="text-sm font-bold uppercase tracking-wide">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            <motion.div 
              layout
              className="glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] rounded-full" />
              
              <h3 className="text-2xl font-black mb-10 tracking-tighter uppercase flex items-center space-x-4">
                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                  <Plus size={24} />
                </div>
                <span>Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
              </h3>

              {activeTab === 'community' && (
                <form onSubmit={handleAddPost} className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Post Content</label>
                    <textarea 
                      rows={5} 
                      value={communityForm.content} 
                      onChange={e => setCommunityForm({content: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none resize-none transition-all placeholder:text-gray-700" 
                      placeholder="What's the latest update, Bhaskar?" 
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading} 
                    className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-50"
                  >
                    {loading ? <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div> : <><Plus size={20} /><span className="tracking-[0.1em]">PUBLISH POST</span></>}
                  </motion.button>
                </form>
              )}

              {activeTab === 'classroom' && (
                <form onSubmit={handleAddCourse} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Course Title</label>
                      <input type="text" required value={classroomForm.title} onChange={e => setClassroomForm({...classroomForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Category</label>
                      <select value={classroomForm.category} onChange={e => setClassroomForm({...classroomForm, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all appearance-none cursor-pointer">
                        <option value="Foundations">Foundations</option>
                        <option value="Creative">Creative</option>
                        <option value="Technical">Technical</option>
                        <option value="Strategy">Strategy</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Lessons Count</label>
                      <input type="number" required value={classroomForm.lessons} onChange={e => setClassroomForm({...classroomForm, lessons: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Duration (e.g. 4h 30m)</label>
                      <input type="text" required value={classroomForm.duration} onChange={e => setClassroomForm({...classroomForm, duration: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Thumbnail Image</label>
                    <div className="relative group">
                      <input type="file" accept="image/*" required onChange={e => setClassroomForm({...classroomForm, thumbnailFile: e.target.files?.[0] || null})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl px-6 py-8 text-center group-hover:border-cyan-500/50 transition-all">
                        <Upload size={24} className="mx-auto mb-2 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                          {classroomForm.thumbnailFile ? classroomForm.thumbnailFile.name : 'Select Thumbnail'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Description</label>
                    <textarea rows={3} value={classroomForm.description} onChange={e => setClassroomForm({...classroomForm, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none resize-none transition-all" />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading} 
                    className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-50"
                  >
                    {loading ? <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div> : <><Plus size={20} /><span className="tracking-[0.1em]">ADD COURSE</span></>}
                  </motion.button>
                </form>
              )}

              {activeTab === 'videos' && (
                <form onSubmit={handleAddVideo} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Video Title</label>
                      <input type="text" required value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Video File</label>
                      <div className="relative group">
                        <input type="file" accept="video/*" required onChange={e => setVideoForm({...videoForm, videoFile: e.target.files?.[0] || null})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl px-6 py-4 text-center group-hover:border-cyan-500/50 transition-all">
                          <Video size={20} className="mx-auto mb-1 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            {videoForm.videoFile ? videoForm.videoFile.name : 'Select Video'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Description</label>
                    <textarea rows={3} value={videoForm.description} onChange={e => setVideoForm({...videoForm, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none resize-none transition-all" />
                  </div>
                  
                  {loading && uploadProgress > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-gray-500">Uploading Data...</span>
                        <span className="text-cyan-400">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="bg-cyan-500 h-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                        />
                      </div>
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading} 
                    className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-50"
                  >
                    {loading ? <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div> : <><Upload size={20} /><span className="tracking-[0.1em]">UPLOAD VIDEO</span></>}
                  </motion.button>
                </form>
              )}

              {activeTab === 'youtube' && (
                <form onSubmit={handleAddYoutube} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Video Title</label>
                      <input type="text" required value={youtubeForm.title} onChange={e => setYoutubeForm({...youtubeForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">YouTube Video ID</label>
                      <input type="text" required value={youtubeForm.videoId} onChange={e => setYoutubeForm({...youtubeForm, videoId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all" placeholder="e.g. dQw4w9WgXcQ" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Description</label>
                    <textarea rows={3} value={youtubeForm.description} onChange={e => setYoutubeForm({...youtubeForm, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none resize-none transition-all" />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading} 
                    className="w-full py-5 bg-red-600 text-white font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-red-700 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] disabled:opacity-50"
                  >
                    {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <><Plus size={20} /><span className="tracking-[0.1em]">ADD LINK</span></>}
                  </motion.button>
                </form>
              )}

              {activeTab === 'ai' && (
                <form onSubmit={handleAddAI} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Content Title</label>
                      <input type="text" required value={aiForm.title} onChange={e => setAiForm({...aiForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Category</label>
                      <select value={aiForm.category} onChange={e => setAiForm({...aiForm, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all appearance-none cursor-pointer">
                        <option value="AI Art">AI Art</option>
                        <option value="AI Tools">AI Tools</option>
                        <option value="AI Knowledge">AI Knowledge</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Content Image</label>
                    <div className="relative group">
                      <input type="file" accept="image/*" required onChange={e => setAiForm({...aiForm, imageFile: e.target.files?.[0] || null})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl px-6 py-8 text-center group-hover:border-purple-500/50 transition-all">
                        <Upload size={24} className="mx-auto mb-2 text-gray-500 group-hover:text-purple-400 transition-colors" />
                        <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                          {aiForm.imageFile ? aiForm.imageFile.name : 'Select Image'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Description</label>
                    <textarea rows={3} value={aiForm.description} onChange={e => setAiForm({...aiForm, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none resize-none transition-all" />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading} 
                    className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-purple-700 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50"
                  >
                    {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <><Upload size={20} /><span className="tracking-[0.1em]">UPLOAD CONTENT</span></>}
                  </motion.button>
                </form>
              )}

              {activeTab === 'system' && (
                <div className="space-y-12">
                  <div className="p-8 bg-cyan-500/5 border border-cyan-500/20 rounded-[2rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Cpu size={120} />
                    </div>
                    <h4 className="text-xl font-black mb-4 tracking-tight uppercase">AI Automation Engine</h4>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-xl">
                      The AI Pulse automation is scheduled to run daily at 8:25 PM PDT (03:25 UTC). 
                      It fetches trending AI news, generates tool recommendations, and updates the community feed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative group">
                        <input
                          type="password"
                          value={automationSecret}
                          onChange={(e) => setAutomationSecret(e.target.value)}
                          placeholder="ENTER AUTOMATION SECRET..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-cyan-500 transition-all placeholder:text-gray-700"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading || !automationSecret}
                        onClick={async () => {
                          setLoading(true);
                          setError(null);
                          try {
                            const res = await fetch(`/api/automation/run?secret=${automationSecret}`);
                            const data = await res.json();
                            if (data.status === 'success') {
                              setSuccess('AI Automation triggered successfully!');
                            } else {
                              setError(data.message || 'Automation failed');
                            }
                          } catch (err) {
                            setError('Failed to connect to automation server');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="px-8 py-4 bg-cyan-500 text-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><RefreshCw size={18} /><span className="text-xs uppercase tracking-widest">Trigger Pulse Now</span></>}
                      </motion.button>
                      <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scheduler Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] flex items-center space-x-3">
                      <Activity size={16} className="text-cyan-400" />
                      <span>System Health</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Gemini API', status: 'Operational', color: 'text-green-400' },
                        { label: 'Firestore', status: 'Operational', color: 'text-green-400' },
                        { label: 'Storage', status: 'Operational', color: 'text-green-400' },
                      ].map((stat, i) => (
                        <div key={i} className="p-6 glass-panel border-white/5 rounded-2xl">
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">{stat.label}</p>
                          <p className={`text-xs font-bold uppercase tracking-widest ${stat.color}`}>{stat.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Lists */}
            <div className="space-y-8">
              <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center space-x-4">
                <div className="p-2 bg-white/5 rounded-xl text-gray-400">
                  <BookOpen size={24} />
                </div>
                <span>Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
              </h3>

              <div className="grid gap-6">
                {activeTab === 'community' && posts.map((post, idx) => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-panel p-8 rounded-3xl border-white/10 flex justify-between items-start group hover:border-white/20 transition-all"
                  >
                    <div className="space-y-3">
                      <p className="text-white text-lg line-clamp-2 leading-relaxed">{post.content}</p>
                      <div className="flex items-center space-x-3">
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {post.createdAt?.toDate().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete('posts', post.id)} 
                      className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}

                {activeTab === 'classroom' && courses.map((course, idx) => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-panel p-6 rounded-3xl border-white/10 flex justify-between items-center group hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase tracking-wider text-lg">{course.title}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{course.category}</span>
                          <span className="w-1 h-1 bg-gray-700 rounded-full" />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{course.lessons} Lessons</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete('courses', course.id)} 
                      className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}

                {activeTab === 'videos' && videos.map((video, idx) => (
                  <motion.div 
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-panel p-6 rounded-3xl border-white/10 flex justify-between items-center group hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="relative w-24 h-16 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                        <Video size={24} className="text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase tracking-wider text-lg">{video.title}</h4>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Video Content</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete('videos', video.id)} 
                      className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}

                {activeTab === 'youtube' && youtubeLinks.map((link, idx) => (
                  <motion.div 
                    key={link.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-panel p-6 rounded-3xl border-white/10 flex justify-between items-center group hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden">
                        <img src={`https://img.youtube.com/vi/${link.videoId}/default.jpg`} alt={link.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-red-600/10" />
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase tracking-wider text-lg">{link.title}</h4>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">YouTube Link</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete('youtubeLinks', link.id)} 
                      className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}

                {activeTab === 'ai' && aiContent.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-panel p-6 rounded-3xl border-white/10 flex justify-between items-center group hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-purple-600/10" />
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase tracking-wider text-lg">{item.title}</h4>
                        <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mt-1">{item.category}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete('aiContent', item.id)} 
                      className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}

                {((activeTab === 'community' && posts.length === 0) ||
                  (activeTab === 'classroom' && courses.length === 0) ||
                  (activeTab === 'videos' && videos.length === 0) ||
                  (activeTab === 'youtube' && youtubeLinks.length === 0) ||
                  (activeTab === 'ai' && aiContent.length === 0)) && (
                  <div className="text-center py-20 text-gray-600 border border-dashed border-white/10 rounded-[2.5rem] font-black uppercase tracking-widest text-sm">
                    No items found in this sector.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-black text-center mb-2 tracking-tighter uppercase">ARE YOU SURE?</h3>
              <p className="text-gray-500 text-center mb-8">This action cannot be undone. The item will be permanently removed.</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => { setShowConfirm(false); setItemToDelete(null); }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'DELETE'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
