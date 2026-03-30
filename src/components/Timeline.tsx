import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Code, Video, Target, Award, Sparkles } from 'lucide-react';

const Timeline = () => {
  const events = [
    {
      year: '2021',
      title: 'The Beginning',
      desc: 'Discovered the world of AI and started experimenting with early generative models.',
      icon: <Cpu className="text-cyan-400" />,
      color: 'border-cyan-500/30',
      glow: 'bg-cyan-500/10',
    },
    {
      year: '2022',
      title: 'Design Fusion',
      desc: 'Integrated AI into my design workflow, creating unique UI/UX concepts.',
      icon: <Code className="text-purple-400" />,
      color: 'border-purple-500/30',
      glow: 'bg-purple-500/10',
    },
    {
      year: '2023',
      title: 'Content Creator',
      desc: 'Launched my YouTube channel to share AI tutorials and creative processes.',
      icon: <Video className="text-pink-400" />,
      color: 'border-pink-500/30',
      glow: 'bg-pink-500/10',
    },
    {
      year: '2024',
      title: 'Football & AI',
      desc: 'Started analyzing football performance using AI-driven data insights.',
      icon: <Target className="text-green-400" />,
      color: 'border-green-500/30',
      glow: 'bg-green-500/10',
    },
    {
      year: '2025',
      title: 'AI Hub Launch',
      desc: 'Built the Bhaskar AI Hub to centralize my work and build a community.',
      icon: <Award className="text-yellow-400" />,
      color: 'border-yellow-500/30',
      glow: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="py-24 px-4 max-w-7xl mx-auto relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-32"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-bold tracking-widest uppercase mb-6">
          <Sparkles size={16} />
          <span>Evolution</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase">
          MY AI <span className="text-cyan-400">JOURNEY</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
          A timeline of growth, from a curious explorer to a dedicated AI creator and designer.
        </p>
      </motion.div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />

        <div className="space-y-32">
          {events.map((event, index) => (
            <motion.div
              key={event.year}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`relative flex flex-col md:flex-row items-center ${
                index % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Dot on line */}
              <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-black border-2 border-cyan-500 rounded-full z-10 hidden md:block shadow-[0_0_15px_rgba(34,211,238,0.5)]" />

              <div className="w-full md:w-1/2 px-4 md:px-12">
                <div className={`relative p-10 glass-panel border ${event.color} rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 group overflow-hidden`}>
                  {/* Inner Glow */}
                  <div className={`absolute -top-24 -right-24 w-48 h-48 ${event.glow} blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-5xl font-black text-white/10 group-hover:text-cyan-400/30 transition-colors duration-500">{event.year}</span>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-cyan-500/50 transition-colors duration-500">
                        {event.icon}
                      </div>
                    </div>
                    <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase group-hover:text-white transition-colors">{event.title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed group-hover:text-gray-300 transition-colors">{event.desc}</p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
