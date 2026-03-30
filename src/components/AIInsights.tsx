import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Globe, Zap, Shield, Sparkles } from 'lucide-react';

const AIInsights = () => {
  const insights = [
    {
      title: "Neural Networks",
      description: "Inspired by the human brain, neural networks are the backbone of modern AI, enabling machines to learn from data patterns.",
      icon: <Brain className="text-cyan-400" size={32} />,
      color: "from-cyan-500/20 to-transparent"
    },
    {
      title: "Generative AI",
      description: "The ability for AI to create new content—from stunning digital art to complex code and realistic video generation.",
      icon: <Sparkles className="text-purple-400" size={32} />,
      color: "from-purple-500/20 to-transparent"
    },
    {
      title: "Edge Computing",
      description: "Processing AI models directly on devices for faster response times and enhanced privacy without relying on the cloud.",
      icon: <Cpu className="text-pink-400" size={32} />,
      color: "from-pink-500/20 to-transparent"
    },
    {
      title: "Global Impact",
      description: "AI is revolutionizing industries from healthcare diagnostics to climate change modeling and personalized education.",
      icon: <Globe className="text-green-400" size={32} />,
      color: "from-green-500/20 to-transparent"
    }
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase"
          >
            AI <span className="text-cyan-400">INSIGHTS</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 max-w-2xl mx-auto text-lg"
          >
            Understanding the core technologies shaping our future. Explore the fundamental concepts of Artificial Intelligence.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={`p-8 rounded-3xl bg-gradient-to-br ${insight.color} border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group`}
            >
              <div className="mb-6 p-4 bg-black/40 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                {insight.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">{insight.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {insight.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 3D-ish Interactive Element */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-12 rounded-[40px] bg-white/5 border border-white/10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] -mr-32 -mt-32 group-hover:bg-cyan-500/20 transition-colors" />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-6 border border-cyan-500/20">
                <Zap size={12} />
                <span>Featured Topic</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter uppercase leading-none">
                The Ethics of <br />
                <span className="text-cyan-400">Autonomous Systems</span>
              </h3>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                As AI becomes more integrated into our daily lives, the importance of ethical frameworks and safety protocols grows. 
                We explore how to build AI that is transparent, fair, and aligned with human values.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Shield size={16} className="text-cyan-400" />
                  <span>Safety First</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Brain size={16} className="text-purple-400" />
                  <span>Human-Centric</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-black/50 border border-white/10 flex items-center justify-center relative overflow-hidden">
                {/* Mock 3D Visual */}
                <motion.div 
                  animate={{ 
                    rotateY: [0, 360],
                    rotateX: [0, 15, -15, 0]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-48 h-48 border-2 border-cyan-500/30 rounded-full flex items-center justify-center"
                >
                  <div className="w-32 h-32 border-2 border-purple-500/30 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                  </div>
                </motion.div>
                
                {/* Floating Labels */}
                <div className="absolute top-10 left-10 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Transparency
                </div>
                <div className="absolute bottom-10 right-10 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Accountability
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIInsights;
