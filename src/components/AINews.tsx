import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Newspaper, Calendar as CalendarIcon, Sparkles, Zap, Activity, TrendingUp, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface NewsPost {
  id: string;
  title?: string;
  content: string;
  category?: string;
  tags?: string[];
  readTime?: string;
  imageUrl?: string;
  authorName: string;
  authorPhoto: string;
  createdAt: Timestamp;
  date: string;
  type: string;
  isAutomated: boolean;
}

const AINews = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newsQuery = query(
      collection(db, 'posts'),
      where('isAutomated', '==', true),
      where('type', '==', 'news'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(newsQuery, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsPost[];
      setNews(newsData);
      setLoading(false);
    }, (err) => {
      console.error("News Fetch Error:", err);
      setError("Failed to synchronize with the neural news network.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const featuredNews = news[0];
  const otherNews = news.slice(1);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-cyan-900/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-900/10 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center space-x-2 mb-6 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full"
              >
                <Sparkles size={14} className="text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Neural Intelligence Feed</span>
              </motion.div>
              <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-[0.85] uppercase mb-8">
                AI <span className="text-cyan-500">PULSE</span>
              </h1>
              <p className="text-gray-400 text-xl md:text-2xl font-medium max-w-xl leading-relaxed">
                The world's most advanced AI-curated news stream. Synthesized daily for the future-minded.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="flex items-center space-x-12 text-right">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Active Nodes</p>
                  <p className="text-3xl font-black">1,204</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Daily Updates</p>
                  <p className="text-3xl font-black">24/7</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-48 space-y-8">
            <div className="w-16 h-16 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Decrypting Neural Streams...</p>
          </div>
        ) : error ? (
          <div className="text-center py-48">
            <AlertCircle size={64} className="text-red-500 mx-auto mb-6 opacity-50" />
            <p className="text-xl text-gray-400 mb-8">{error}</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-cyan-400 font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Retry Link</button>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-48">
            <Newspaper size={64} className="text-gray-800 mx-auto mb-8" />
            <p className="text-gray-500 uppercase tracking-widest font-black">No neural updates detected.</p>
          </div>
        ) : (
          <div className="space-y-24">
            {/* Featured Section */}
            {featuredNews && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative grid lg:grid-cols-2 gap-0 bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden hover:border-cyan-500/30 transition-all duration-700"
              >
                <div className="relative h-[400px] lg:h-full overflow-hidden">
                  <img 
                    src={featuredNews.imageUrl || `https://picsum.photos/seed/${featuredNews.id}/1200/800`} 
                    alt={featuredNews.title || 'Featured News'}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent lg:bg-gradient-to-r" />
                  <div className="absolute top-8 left-8">
                    <span className="px-4 py-1.5 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">Featured Story</span>
                  </div>
                </div>
                <div className="p-12 lg:p-20 flex flex-col justify-center">
                  <div className="flex items-center space-x-4 mb-8">
                    <span className="text-cyan-400 text-xs font-black uppercase tracking-widest">{featuredNews.category || 'Global AI'}</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                    <span className="text-gray-500 text-xs font-black uppercase tracking-widest">{featuredNews.readTime || '5 min read'}</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight uppercase">
                    {featuredNews.title || featuredNews.content.split('\n')[0].replace('🚨 AI PULSE UPDATE: ', '')}
                  </h2>
                  <p className="text-gray-400 text-xl leading-relaxed mb-12 line-clamp-4">
                    {featuredNews.title ? featuredNews.content : featuredNews.content.split('\n\n').slice(1).join('\n\n')}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-12">
                    {featuredNews.tags?.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex items-center space-x-3">
                      <img src={featuredNews.authorPhoto} alt="" className="w-10 h-10 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest">{featuredNews.authorName}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Neural Correspondent</p>
                      </div>
                    </div>
                    <button className="p-4 bg-white text-black rounded-full hover:bg-cyan-400 transition-colors">
                      <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* News Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherNews.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex flex-col bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden hover:border-cyan-500/30 transition-all duration-500"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/600`} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white">
                        {item.category || 'AI Update'}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.date}</span>
                      <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{item.readTime || '3 min'}</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-6 leading-tight uppercase group-hover:text-cyan-400 transition-colors">
                      {item.title || item.content.split('\n')[0].replace('🚨 AI PULSE UPDATE: ', '')}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 flex-1">
                      {item.title ? item.content : item.content.split('\n\n').slice(1).join('\n\n')}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center space-x-2">
                        <TrendingUp size={14} className="text-cyan-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Trending Now</span>
                      </div>
                      <ArrowRight size={18} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AINews;
