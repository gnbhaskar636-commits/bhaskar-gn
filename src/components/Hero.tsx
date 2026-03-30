import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Sparkles, Cpu, Zap } from 'lucide-react';

const FloatingElement = ({ children, delay = 0, x = 0, y = 0, rotate = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      y: [y, y - 20, y],
      rotate: [rotate, rotate + 5, rotate - 5, rotate]
    }}
    transition={{ 
      duration: 5, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut"
    }}
    style={{ x, y }}
    className="absolute z-0 pointer-events-none"
  >
    {children}
  </motion.div>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black z-10" />
        
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse delay-1000" />
        
        {/* Floating 3D-ish Shapes */}
        <FloatingElement delay={0} x="10%" y="20%" rotate={15}>
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-500/30 rounded-3xl backdrop-blur-xl rotate-12 shadow-[0_0_40px_rgba(6,182,212,0.2)]" />
        </FloatingElement>
        <FloatingElement delay={1} x="80%" y="15%" rotate={-10}>
          <div className="w-48 h-48 bg-gradient-to-tr from-purple-500/20 to-transparent border border-purple-500/30 rounded-full backdrop-blur-xl shadow-[0_0_40px_rgba(168,85,247,0.2)]" />
        </FloatingElement>
        <FloatingElement delay={2} x="15%" y="70%" rotate={45}>
          <div className="w-24 h-24 bg-gradient-to-bl from-pink-500/20 to-transparent border border-pink-500/30 rounded-2xl backdrop-blur-xl -rotate-12 shadow-[0_0_40px_rgba(236,72,153,0.2)]" />
        </FloatingElement>

        {/* Grid Pattern with Perspective */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
               backgroundSize: '100px 100px',
               transform: 'perspective(1000px) rotateX(60deg) translateY(-200px) scale(2)',
               transformOrigin: 'top'
             }} />
      </div>

      <motion.div 
        style={{ y: y1, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-8 backdrop-blur-md">
            <Sparkles size={14} />
            <span>The Future of AI Content</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85]">
            <span className="block text-white">BHASKAR</span>
            <span className="block bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent italic">AI HUB</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Pushing the boundaries of <span className="text-white font-medium">Artificial Intelligence</span> through creative design, 
            interactive experiences, and high-impact visual storytelling.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/ai-lab">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group px-10 py-5 bg-cyan-500 text-black font-black rounded-2xl flex items-center space-x-3 hover:bg-cyan-400 transition-all shadow-[0_20px_40px_rgba(6,182,212,0.3)]"
              >
                <Cpu size={22} className="group-hover:rotate-12 transition-transform" />
                <span className="uppercase tracking-widest text-sm">Enter AI Lab</span>
                <ArrowRight size={20} />
              </motion.button>
            </Link>
            <Link to="/videos">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center space-x-3 hover:bg-white/10 transition-all backdrop-blur-md"
              >
                <Play size={22} fill="currentColor" />
                <span className="uppercase tracking-widest text-sm">Watch AI Content</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats / Features */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { label: 'AI Models', value: '12+', icon: <Cpu size={16} /> },
            { label: 'Artworks', value: '500+', icon: <Sparkles size={16} /> },
            { label: 'Videos', value: '50+', icon: <Play size={16} /> },
            { label: 'Speed', value: 'Real-time', icon: <Zap size={16} /> },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="flex justify-center mb-2 text-gray-500 group-hover:text-cyan-400 transition-colors">
                {stat.icon}
              </div>
              <div className="text-3xl font-black text-white mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <div className="w-6 h-10 border-2 border-white/10 rounded-full flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-2 bg-cyan-500 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
