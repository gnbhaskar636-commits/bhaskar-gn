import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Twitter, Instagram, Youtube, Github } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSent(false), 5000);
    }, 2000);
  };

  const socialLinks = [
    { name: 'Twitter', icon: <Twitter size={24} />, color: 'hover:text-cyan-400' },
    { name: 'Instagram', icon: <Instagram size={24} />, color: 'hover:text-pink-400' },
    { name: 'YouTube', icon: <Youtube size={24} />, color: 'hover:text-red-500' },
    { name: 'GitHub', icon: <Github size={24} />, color: 'hover:text-white' },
  ];

  return (
    <div className="py-24 px-4 max-w-7xl mx-auto relative z-10">
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-24"
      >
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-white text-black rounded-[32px] shadow-2xl shadow-white/10">
            <Mail size={48} />
          </div>
        </div>
        <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase bg-gradient-to-b from-white to-gray-800 bg-clip-text text-transparent">
          GET IN <span className="text-cyan-400">TOUCH</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
          Have a project in mind or just want to say hi? Feel free to reach out to me through the form below or via social media.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-20 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-panel rounded-[64px] p-12 relative overflow-hidden border-white/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:border-cyan-500 focus:outline-none transition-all text-lg font-bold placeholder:text-gray-800"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:border-cyan-500 focus:outline-none transition-all text-lg font-bold placeholder:text-gray-800"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:border-cyan-500 focus:outline-none transition-all text-lg font-bold placeholder:text-gray-800 resize-none"
                placeholder="Your message here..."
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className={`w-full py-6 rounded-3xl font-black flex items-center justify-center space-x-4 transition-all shadow-2xl ${
                isSent ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-cyan-400 shadow-white/10'
              }`}
            >
              {isSubmitting ? (
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : isSent ? (
                <span className="text-sm uppercase tracking-[0.2em]">MESSAGE SENT!</span>
              ) : (
                <>
                  <span className="text-sm uppercase tracking-[0.2em]">SEND MESSAGE</span>
                  <Send size={24} />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-4xl font-black mb-12 tracking-tighter uppercase text-white">CONNECT WITH <span className="text-purple-500">ME</span></h3>
          <div className="grid grid-cols-2 gap-6 mb-16">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href="#"
                className={`flex items-center space-x-6 p-8 glass-panel border-white/5 rounded-[32px] transition-all ${link.color} hover:border-white/20 group`}
              >
                <div className="group-hover:scale-110 transition-transform">
                  {link.icon}
                </div>
                <span className="font-black text-xs uppercase tracking-[0.2em] text-white">{link.name}</span>
              </a>
            ))}
          </div>

          <div className="p-12 glass-panel border-white/5 rounded-[48px] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h4 className="text-2xl font-black mb-6 uppercase tracking-tight text-white">Location</h4>
              <p className="text-gray-500 mb-8 font-medium leading-relaxed text-lg">
                Based in the digital realm, but physically striking goals in the vibrant city of Bangalore, India.
              </p>
              <div className="flex items-center space-x-4 text-cyan-400">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
                <span className="text-sm font-black uppercase tracking-[0.2em]">Available for collaborations</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
