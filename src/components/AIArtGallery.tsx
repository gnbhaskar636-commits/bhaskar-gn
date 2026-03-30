import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ImageIcon, Sparkles, Download, Share2, Heart, Maximize2, X, Loader2, Filter, Zap } from 'lucide-react';

interface ArtPiece {
  id: string;
  url: string;
  prompt: string;
  authorName?: string;
  createdAt: any;
  likes?: number;
  category?: string;
}

const AIArtGallery = () => {
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArt, setSelectedArt] = useState<ArtPiece | null>(null);
  const [filter, setFilter] = useState<'all' | 'cinematic' | 'abstract' | 'portrait'>('all');

  useEffect(() => {
    // We'll fetch from a collection called 'ai_generations' or similar
    // For now, let's assume 'posts' with type 'image' or a dedicated 'generations' collection
    const q = query(
      collection(db, 'generations'),
      where('type', '==', 'image'),
      orderBy('createdAt', 'desc'),
      limit(24)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pieces = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ArtPiece[];
      setArtPieces(pieces);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'generations');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredArt = filter === 'all' 
    ? artPieces 
    : artPieces.filter(p => p.category?.toLowerCase() === filter);

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 max-w-7xl mx-auto relative z-10">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="text-center mb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <Sparkles size={14} className="text-pink-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Neural Synthesis Gallery</span>
        </motion.div>
        
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
          <span className="block bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">Infinite</span>
          <span className="block text-pink-500">Imagination</span>
        </h1>
        
        <p className="text-gray-500 text-xl max-w-2xl mx-auto mb-16 font-medium">
          A curated collection of neural masterpieces synthesized by the Bhaskar AI Collective.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4">
          {['all', 'cinematic', 'abstract', 'portrait'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f 
                  ? 'bg-white text-black shadow-2xl shadow-white/10' 
                  : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 space-y-6">
          <Loader2 size={64} className="animate-spin text-pink-500/20" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Synchronizing Neural Assets...</p>
        </div>
      ) : artPieces.length === 0 ? (
        <div className="text-center py-48 glass-panel rounded-[64px] border-dashed border-white/5">
          <ImageIcon size={64} className="text-gray-800 mx-auto mb-8" />
          <p className="text-gray-600 font-black uppercase tracking-widest">The canvas is currently void. Start imagining in the AI Hub.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 relative z-10">
          {filteredArt.map((art, i) => (
            <motion.div
              key={art.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative glass-panel rounded-[40px] overflow-hidden cursor-pointer border-white/5 hover:border-pink-500/30 transition-all shadow-2xl break-inside-avoid"
              onClick={() => setSelectedArt(art)}
            >
              <img
                src={art.url}
                alt={art.prompt}
                className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap size={14} className="text-pink-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Neural Masterpiece</span>
                </div>
                <p className="text-white text-sm font-bold line-clamp-2 mb-6 uppercase tracking-tight leading-tight">
                  {art.prompt}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <ImageIcon size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {art.authorName || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-pink-400 transition-colors">
                      <Heart size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-cyan-400 transition-colors">
                      <Maximize2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedArt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-2xl"
            onClick={() => setSelectedArt(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl h-full flex flex-col md:flex-row bg-black rounded-[48px] overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedArt(null)}
                className="absolute top-8 right-8 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-white/10 transition-colors border border-white/10"
              >
                <X size={24} />
              </button>

              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                <img
                  src={selectedArt.url}
                  alt={selectedArt.prompt}
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full md:w-[400px] p-12 flex flex-col bg-white/5 border-l border-white/10 backdrop-blur-3xl overflow-y-auto">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-[10px] font-bold uppercase tracking-widest mb-8 border border-pink-500/20 w-fit">
                  <Sparkles size={12} />
                  <span>AI Generation</span>
                </div>

                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Neural Prompt</h3>
                <p className="text-xl font-black text-white leading-tight uppercase tracking-tight mb-12">
                  {selectedArt.prompt}
                </p>

                <div className="space-y-8 mb-12">
                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                        <ImageIcon size={24} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Creator</div>
                        <div className="font-bold text-white">{selectedArt.authorName || 'Anonymous'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <Zap size={24} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Model</div>
                        <div className="font-bold text-white">Gemini 2.5 Flash</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <button className="flex items-center justify-center space-x-3 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-400 transition-all">
                    <Download size={18} />
                    <span>Save</span>
                  </button>
                  <button className="flex items-center justify-center space-x-3 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                    <Share2 size={18} />
                    <span>Share</span>
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

export default AIArtGallery;
