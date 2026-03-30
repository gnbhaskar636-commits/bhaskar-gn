import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, BookOpen, Users, ArrowRight, Zap, Globe, Shield, Newspaper, Activity, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface NewsPost {
  id: string;
  content: string;
  title?: string;
  summary?: string;
  createdAt: any;
}

import AIInsights from './AIInsights';

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -10, scale: 1.02 }}
    className="glass-panel p-8 rounded-[32px] group cursor-pointer relative overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-500">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-black uppercase tracking-tighter mb-3 group-hover:text-cyan-400 transition-colors">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

const Home = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  const [latestNews, setLatestNews] = useState<NewsPost[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('isAutomated', '==', true),
      where('type', '==', 'news'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map(doc => {
        const data = doc.data();
        const content = data.content || '';
        const [title, ...summaryParts] = content.replace('🚨 AI PULSE UPDATE: ', '').split('\n\n');
        return {
          id: doc.id,
          title: title || 'Neural Update',
          summary: summaryParts.join('\n\n'),
          ...data
        };
      }) as NewsPost[];
      setLatestNews(news);
      setNewsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          style={{ y: y1, rotate }}
          className="absolute top-20 -left-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          style={{ y: y2, rotate: -rotate }}
          className="absolute bottom-20 -right-20 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" 
        />

        <div className="max-w-5xl w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Sparkles size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">The Future of Intelligence</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
              <span className="block bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">Architecting</span>
              <span className="block text-cyan-500">Tomorrow</span>
            </h1>

            <p className="text-gray-500 text-lg md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              A premium ecosystem for AI creators, developers, and visionaries. 
              Build, learn, and scale with the most advanced AI tools.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link to="/ai-hub">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white text-black font-black rounded-2xl flex items-center space-x-3 shadow-2xl shadow-white/10 hover:bg-cyan-400 transition-all uppercase tracking-widest text-sm"
                >
                  <span>Enter the Hub</span>
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
                >
                  Explore Vision
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-cyan-500 to-transparent" />
          <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Scroll</span>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Cpu} 
            title="AI Hub" 
            description="Experiment with cutting-edge neural networks, image generation, and cinematic synthesis in our sandboxed environment."
            delay={0.1}
          />
          <FeatureCard 
            icon={Users} 
            title="Elite Community" 
            description="Connect with top-tier AI researchers and developers from across the globe."
            delay={0.2}
          />
          <FeatureCard 
            icon={BookOpen} 
            title="Neural Academy" 
            description="Master the complexities of machine learning through our curated, high-impact curriculum."
            delay={0.3}
          />
        </div>
      </section>

      {/* Neural Pulse - Latest News */}
      <section className="py-32 px-4 max-w-7xl mx-auto relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Activity size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Neural Pulse</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
              Daily <span className="text-cyan-500">Intelligence</span>
            </h2>
          </div>
          <Link to="/ai-news">
            <motion.button
              whileHover={{ x: 10 }}
              className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="text-xs font-black uppercase tracking-widest">View All Updates</span>
              <ArrowRight size={20} className="group-hover:text-cyan-400 transition-colors" />
            </motion.button>
          </Link>
        </div>

        {newsLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={48} className="animate-spin text-cyan-500/20" />
          </div>
        ) : latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {latestNews.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-10 rounded-[48px] group hover:border-cyan-500/30 transition-all flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="p-3 bg-white/5 rounded-2xl text-cyan-400">
                    <Newspaper size={20} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Trending</span>
                  </div>
                </div>
                <h4 className="text-xl font-black mb-6 uppercase tracking-tight leading-tight group-hover:text-cyan-400 transition-colors flex-none">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-4">
                  {item.summary}
                </p>
                <div className="pt-8 border-t border-white/5 mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">AI Synthesized</span>
                  <Zap size={14} className="text-gray-800" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-panel rounded-[48px] border-dashed border-white/5">
            <p className="text-gray-700 font-black uppercase tracking-widest">Awaiting next neural cycle...</p>
          </div>
        )}
      </section>

      {/* AI Insights Section */}
      <AIInsights />

      {/* Featured AI Art Section */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
              <Sparkles size={14} className="text-pink-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400">Neural Masterpieces</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
              Infinite <span className="text-pink-500">Imagination</span>
            </h2>
          </div>
          <Link to="/ai-art-gallery">
            <motion.button
              whileHover={{ x: 10 }}
              className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="text-xs font-black uppercase tracking-widest">Explore Gallery</span>
              <ArrowRight size={20} className="group-hover:text-pink-400 transition-colors" />
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { seed: 'cyberpunk', title: 'Neon Frontier' },
            { seed: 'abstract', title: 'Neural Flow' },
            { seed: 'nature', title: 'Bionic Bloom' },
            { seed: 'space', title: 'Cosmic Synthesis' }
          ].map((art, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-square rounded-[40px] overflow-hidden border border-white/5 hover:border-pink-500/30 transition-all shadow-2xl"
            >
              <img 
                src={`https://picsum.photos/seed/${art.seed}/800/800`} 
                alt={art.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                <h4 className="text-lg font-black uppercase tracking-tight text-white mb-2">{art.title}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-pink-400">AI Generated</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3D-ish Interactive Section */}
      <section className="py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto glass-panel rounded-[64px] p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-8">
                Unleash the <br /> <span className="text-cyan-500">Power of AI</span>
              </h2>
              <ul className="space-y-6">
                {[
                  { icon: Zap, text: "Real-time model inference" },
                  { icon: Globe, text: "Global collaborative workspace" },
                  { icon: Shield, text: "Secure enterprise-grade infrastructure" }
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center space-x-4 text-gray-400"
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-xs">{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div 
              style={{ perspective: 1000 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  rotateY: [0, 15, 0, -15, 0],
                  rotateX: [0, 10, 0, -10, 0]
                }}
                transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                className="w-full aspect-square bg-gradient-to-br from-cyan-500 to-purple-500 rounded-[40px] shadow-2xl shadow-cyan-500/20 flex items-center justify-center p-1"
              >
                <div className="w-full h-full bg-black rounded-[38px] flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/ai/800/800')] opacity-40 mix-blend-overlay grayscale" />
                  <Sparkles size={120} className="text-white relative z-10 animate-pulse" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8">Ready to <span className="text-cyan-500">Evolve?</span></h2>
          <p className="text-gray-500 text-xl mb-12">Join 10,000+ creators building the future today.</p>
          <Link to="/community">
            <button className="px-12 py-6 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/40">
              Join the Collective
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
