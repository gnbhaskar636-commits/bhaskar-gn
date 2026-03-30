import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Youtube, ExternalLink, Calendar, Play, Clock, ThumbsUp, Share2 } from 'lucide-react';

interface YouTubeLink {
  id: string;
  title: string;
  videoId: string;
  description?: string;
  createdAt: any;
}

const YouTube = () => {
  const [links, setLinks] = useState<YouTubeLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'youtubeLinks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linkList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as YouTubeLink[];
      setLinks(linkList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'youtubeLinks');
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-bold tracking-widest uppercase mb-6">
            <Youtube size={16} />
            <span>Official Channel</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase">
            VISUAL <span className="text-red-500">STORYTELLING</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Deep dives into AI workflows, creative processes, and the future of technology. 
            Subscribe to join the journey.
          </p>
          
          <motion.a
            href="https://youtube.com/@gnbhaskar"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 inline-flex items-center space-x-3 px-8 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] group"
          >
            <Youtube size={24} />
            <span className="tracking-widest uppercase">SUBSCRIBE NOW</span>
            <ExternalLink size={18} className="opacity-50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.a>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-[2rem] border border-dashed border-white/10">
            <Youtube size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">No videos found</h3>
            <p className="text-gray-600 mt-2">Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {links.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="glass-panel p-6 rounded-[2.5rem] border border-white/10 hover:border-red-500/30 transition-all duration-500 h-full flex flex-col">
                  {/* Video Thumbnail Container */}
                  <div className="relative aspect-video rounded-3xl overflow-hidden mb-8 group-hover:shadow-[0_0_40px_rgba(220,38,38,0.2)] transition-all duration-500">
                    <img
                      src={`https://img.youtube.com/vi/${link.videoId}/maxresdefault.jpg`}
                      alt={link.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                        <Play size={32} fill="currentColor" />
                      </div>
                    </div>
                    {/* Duration Badge (Mock) */}
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl text-[10px] font-bold text-white tracking-widest uppercase flex items-center space-x-1">
                      <Clock size={12} />
                      <span>12:45</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col px-2">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-red-400 transition-colors line-clamp-2">
                        {link.title}
                      </h3>
                      <a
                        href={`https://youtube.com/watch?v=${link.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/5 hover:bg-red-600 hover:text-white rounded-2xl transition-all"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                    
                    <p className="text-gray-500 text-base mb-8 line-clamp-2 leading-relaxed">
                      {link.description || 'No description provided.'}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-gray-500">
                        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest">
                          <Calendar size={14} className="text-red-500" />
                          <span>{link.createdAt?.toDate ? link.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest">
                          <ThumbsUp size={14} />
                          <span>2.4k</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                        <Share2 size={14} />
                        <span>Share</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTube;
