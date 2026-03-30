import React from 'react';
import { motion } from 'framer-motion';
import { User, Target, Rocket, Heart, Award, Code, Zap, Sparkles } from 'lucide-react';

const About = () => {
  const interests = [
    { icon: <Zap className="text-yellow-400" />, title: "AI & Innovation", desc: "Exploring the frontiers of machine learning and generative models." },
    { icon: <Code className="text-cyan-400" />, title: "Digital Design", desc: "Crafting premium user experiences with modern web technologies." },
    { icon: <Award className="text-purple-400" />, title: "Football", desc: "Passionate striker on the field, bringing team spirit to every project." },
    { icon: <Heart className="text-pink-400" />, title: "Content Creation", desc: "Sharing knowledge and creativity through videos and community." }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-24 relative z-10">
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <div className="grid md:grid-cols-2 gap-20 items-center mb-48">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="aspect-square rounded-[64px] overflow-hidden border-4 border-white/10 shadow-2xl relative z-10 group bg-gray-900">
            <img 
              src="https://storage.googleapis.com/applet-assets/ais-dev-duxvzrwm2umanqnqo6o4t4-69232621767.asia-east1.run.app/user_uploads/1743001351185.png" 
              alt="Bhaskar - Creator of AI Hub" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
              <div className="text-white">
                <div className="text-sm font-black uppercase tracking-[0.2em] mb-2">Identity</div>
                <div className="text-3xl font-black uppercase tracking-tighter">Bhaskar AI</div>
              </div>
            </div>
          </div>
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-8">
            The Creator
          </div>
          <h2 className="text-7xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-[0.85] bg-gradient-to-b from-white to-gray-800 bg-clip-text text-transparent">
            I am <br />Bhaskar
          </h2>
          <p className="text-2xl text-gray-500 mb-12 leading-relaxed font-medium italic">
            "I am Bhaskar, here to get trained. Creator of this channel. I promise that everyone who believes in me, I will do my best for them."
          </p>
          <div className="grid gap-6">
            <div className="flex items-center space-x-6 p-8 glass-panel border-white/5 rounded-[32px] hover:border-white/20 transition-all group">
              <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform">
                <Target size={28} />
              </div>
              <div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-1 text-white">My Mission</h4>
                <p className="text-sm text-gray-600 font-medium">I can instruct all people with good manner and point to them. I will surely make them good persons in AI field.</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 p-8 glass-panel border-white/5 rounded-[32px] hover:border-white/20 transition-all group">
              <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                <Rocket size={28} />
              </div>
              <div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-1 text-white">My Vision</h4>
                <p className="text-sm text-gray-600 font-medium">I will be explaining pin to pin, right in a specific topic. We are the people who can develop. Let's build, let's do, let's grow with us.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tasks Section */}
      <div className="mb-48">
        <div className="text-center mb-24">
          <h3 className="text-5xl font-black uppercase tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-700 bg-clip-text text-transparent">Three Tasks I Will Do</h3>
          <div className="w-24 h-1.5 bg-cyan-500 mx-auto rounded-full shadow-2xl shadow-cyan-500/50" />
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 glass-panel border-white/5 rounded-[48px] hover:border-cyan-500/30 transition-all group"
          >
            <div className="text-4xl font-black text-white/10 mb-6 group-hover:text-cyan-500/20 transition-colors">01</div>
            <h4 className="text-2xl font-black mb-6 uppercase tracking-tight text-white">Ethical Guidance</h4>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">I will instruct all people with good manner and point to them the right path in the AI landscape.</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 glass-panel border-white/5 rounded-[48px] hover:border-purple-500/30 transition-all group"
          >
            <div className="text-4xl font-black text-white/10 mb-6 group-hover:text-purple-500/20 transition-colors">02</div>
            <h4 className="text-2xl font-black mb-6 uppercase tracking-tight text-white">Precision Training</h4>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">I will be explaining pin to pin, right in a specific topic, ensuring deep understanding for every student.</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 glass-panel border-white/5 rounded-[48px] hover:border-pink-500/30 transition-all group"
          >
            <div className="text-4xl font-black text-white/10 mb-6 group-hover:text-pink-500/20 transition-colors">03</div>
            <h4 className="text-2xl font-black mb-6 uppercase tracking-tight text-white">Social Good</h4>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">I will do specific tasks of good and maybe good for people, using AI as a tool for positive transformation.</p>
          </motion.div>
        </div>
      </div>

      {/* Interests Grid */}
      <div className="mb-48">
        <div className="text-center mb-24">
          <h3 className="text-5xl font-black uppercase tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-700 bg-clip-text text-transparent">What Drives Me</h3>
          <div className="w-24 h-1.5 bg-purple-500 mx-auto rounded-full shadow-2xl shadow-purple-500/50" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {interests.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -15, scale: 1.02 }}
              className="p-10 glass-panel border-white/5 rounded-[40px] text-center group hover:border-white/20 transition-all"
            >
              <div className="w-20 h-20 bg-white/5 rounded-[28px] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-2xl shadow-black/40 border border-white/5">
                {item.icon}
              </div>
              <h4 className="font-black mb-4 uppercase text-lg tracking-tight text-white">{item.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed font-medium uppercase tracking-wider">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final Promise Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative p-16 glass-panel border-cyan-500/20 rounded-[64px] overflow-hidden text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
        <div className="relative z-10">
          <Sparkles className="text-cyan-400 mx-auto mb-8" size={48} />
          <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-tight">
            Let's Build. Let's Do. <br />
            <span className="text-cyan-400 italic">Let's Grow With Us.</span>
          </h3>
          <p className="text-2xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
            "I am promising that I will surely make them good persons in AI field. Everyone who believes in me, I will do my best for them. We are the people who can develop."
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-white/20">
              Bhaskar AI Creator
            </div>
            <div className="flex items-center space-x-4 text-cyan-400 font-black uppercase tracking-widest text-xs">
              <Zap size={16} />
              <span>Certified AI Instructor</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
