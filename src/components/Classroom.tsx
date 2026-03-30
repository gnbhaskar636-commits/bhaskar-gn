import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { Play, BookOpen, Clock, ChevronRight, X, User, Plus, Upload, Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: number;
  duration: string;
  category: string;
}

const Classroom = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    thumbnail: '',
    lessons: 1,
    duration: '',
    category: 'Foundations'
  });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courseList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(courseList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    });

    return () => {
      unsubscribe();
      unsubAuth();
    };
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'courses'), {
        ...newCourse,
        createdAt: serverTimestamp(),
        authorUid: user?.uid || 'guest',
        authorName: user?.displayName || 'Anonymous'
      });
      setShowAddModal(false);
      setNewCourse({ title: '', description: '', thumbnail: '', lessons: 1, duration: '', category: 'Foundations' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'courses');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-32 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter uppercase bg-gradient-to-b from-white to-gray-800 bg-clip-text text-transparent leading-none">
            Neural <br /> <span className="text-cyan-400">Academy</span>
          </h2>
          <p className="text-gray-500 text-xl font-medium leading-relaxed max-w-xl">
            Structured neural pathways to master the architecture of Artificial Intelligence.
          </p>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex justify-center py-48">
          <Loader2 size={64} className="animate-spin text-cyan-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group glass-panel rounded-[64px] overflow-hidden hover:border-white/20 transition-all cursor-pointer flex flex-col border-white/5 shadow-2xl"
              onClick={() => setSelectedCourse(course)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-black shadow-2xl shadow-white/20 scale-90 group-hover:scale-100 transition-transform duration-500">
                    <Play size={40} fill="currentColor" />
                  </div>
                </div>
                <div className="absolute top-8 left-8 px-6 py-3 bg-black/60 backdrop-blur-xl rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 border border-white/10 shadow-2xl">
                  {course.category}
                </div>
              </div>
              <div className="p-12 flex-1 flex flex-col">
                <h3 className="text-3xl font-black mb-6 group-hover:text-cyan-400 transition-colors tracking-tighter uppercase leading-none">{course.title}</h3>
                <p className="text-gray-500 text-lg mb-10 line-clamp-2 leading-relaxed font-medium">{course.description}</p>
                <div className="flex items-center justify-between pt-10 border-t border-white/5 mt-auto">
                  <div className="flex items-center space-x-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center space-x-3">
                      <BookOpen size={20} />
                      <span>{course.lessons} Units</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock size={20} />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-cyan-400/50 transition-colors">
                    <ChevronRight size={24} className="text-gray-800 group-hover:text-cyan-400 transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedCourse(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="grid lg:grid-cols-2">
                <div className="aspect-video lg:aspect-square w-full bg-black relative">
                  <img
                    src={selectedCourse.thumbnail}
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover opacity-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center text-black shadow-2xl shadow-cyan-500/50 hover:scale-110 transition-transform">
                      <Play size={48} fill="currentColor" />
                    </button>
                  </div>
                </div>
                
                <div className="p-12 flex flex-col justify-center">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
                    <BookOpen size={16} />
                    <span>{selectedCourse.category}</span>
                  </div>
                  <h3 className="text-4xl font-black mb-6 tracking-tighter uppercase leading-none">{selectedCourse.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed mb-10">
                    {selectedCourse.description}
                  </p>
                  
                  <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-colors">
                          <Play size={20} />
                        </div>
                        <span className="font-bold text-sm">1. Introduction to AI</span>
                      </div>
                      <span className="text-xs text-gray-600 font-mono">12:45</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-colors">
                          <Play size={20} />
                        </div>
                        <span className="font-bold text-sm">2. Neural Network Architectures</span>
                      </div>
                      <span className="text-xs text-gray-600 font-mono">24:12</span>
                    </div>
                  </div>

                  <button className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl flex items-center justify-center space-x-3 hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20">
                    <span>START LEARNING</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Classroom;
