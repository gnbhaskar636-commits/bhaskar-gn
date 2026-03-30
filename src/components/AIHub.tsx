import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { GoogleGenAI, Modality, LiveServerMessage, ThinkingLevel } from "@google/genai";
import { Mic, MicOff, Image as ImageIcon, Sparkles, Send, Loader2, RefreshCw, Download, Trash2, AlertCircle, Key, MessageSquare, Users, Globe, Search, Newspaper, Zap, Activity, TrendingUp, ArrowRight, Video, Music, Wand2, Play, Volume2, Info, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { collection, query, where, orderBy, limit, onSnapshot, getDocs, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

// --- Types ---
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  timestamp: string;
}

interface GenerationResult {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  prompt: string;
  createdAt: any;
}

// --- Helper for Base64 ---
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const AIHub = () => {
  const [activeTab, setActiveTab] = useState<'voice' | 'chat' | 'community' | 'news' | 'imagine' | 'cinema' | 'symphony'>('chat');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 5]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, -2]);

  return (
    <div ref={containerRef} className="py-24 px-4 max-w-7xl mx-auto relative z-10 min-h-screen overflow-hidden perspective-1000">
      {/* 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute top-20 right-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" 
        />
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute bottom-20 left-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" 
        />
        
        {/* Floating 3D-like particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 2000 - 500, 
              y: Math.random() * 2000 - 500,
              z: Math.random() * 500 - 250,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.4
            }}
            animate={{ 
              y: [null, Math.random() * -200, Math.random() * 200],
              x: [null, Math.random() * 100, Math.random() * -100],
              rotate: [0, 360],
              z: [null, Math.random() * 100, Math.random() * -100]
            }}
            transition={{ 
              duration: Math.random() * 15 + 15, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-24 relative z-10"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-block mb-6 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl shadow-2xl shadow-cyan-500/10"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 animate-pulse">Neural Frontier v3.2</span>
        </motion.div>
        <h2 className="text-7xl md:text-[12rem] font-black mb-8 tracking-tighter uppercase bg-gradient-to-b from-white via-white to-gray-800 bg-clip-text text-transparent leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          AI <span className="text-cyan-400">LAB</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto mb-16 text-xl font-medium leading-relaxed">
          The epicenter of neural experimentation. Interact with autonomous agents, synthesize sonic streams, and track the global AI pulse.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {[
            { id: 'chat', icon: <MessageSquare size={20} />, label: 'Neural Chat', color: 'cyan' },
            { id: 'imagine', icon: <ImageIcon size={20} />, label: 'Imagine', color: 'pink' },
            { id: 'cinema', icon: <Video size={20} />, label: 'Cinema', color: 'purple' },
            { id: 'symphony', icon: <Music size={20} />, label: 'Symphony', color: 'orange' },
            { id: 'news', icon: <Newspaper size={20} />, label: 'AI Pulse', color: 'blue' },
            { id: 'community', icon: <Users size={20} />, label: 'Collective', color: 'indigo' },
            { id: 'voice', icon: <Mic size={20} />, label: 'Sonic', color: 'red' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-black transition-all group relative overflow-hidden ${
                activeTab === tab.id 
                  ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.2)]' 
                  : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className={`absolute inset-0 bg-gradient-to-r from-${tab.color}-400/20 to-transparent pointer-events-none`}
                />
              )}
              <div className={activeTab === tab.id ? 'text-black' : 'group-hover:scale-110 transition-transform'}>
                {tab.icon}
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em]">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div 
        layout
        style={{ rotateX, rotateY }}
        className="glass-panel rounded-[64px] overflow-hidden min-h-[750px] flex flex-col relative z-10 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && <ChatInterface key="chat" />}
          {activeTab === 'community' && <CommunityHub key="community" />}
          {activeTab === 'voice' && <VoiceChat key="voice" />}
          {activeTab === 'news' && <AINews key="news" />}
          {activeTab === 'imagine' && <Imagine key="imagine" />}
          {activeTab === 'cinema' && <Cinema key="cinema" />}
          {activeTab === 'symphony' && <Symphony key="symphony" />}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// --- AI News Component ---
const AINews = () => {
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [historyNews, setHistoryNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pulse' | 'live'>('pulse');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'posts'),
        where('isAutomated', '==', true),
        where('type', '==', 'news'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistoryNews(history);
    } catch (err) {
      console.error("History Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const liveScan = async () => {
    setScanning(true);
    setError(null);
    setViewMode('live');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Fetch and summarize the top 5 most trending and POSITIVE AI news stories from the last 24 hours. Focus on news that is useful for people, makes good things for them, or can inspire positive change. Provide the title, a 2-sentence summary, the source name, and a placeholder URL. Format as a JSON array of objects with keys: title, summary, source, url, timestamp.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });

      const parsedNews = JSON.parse(result.text || '[]');
      setLiveNews(parsedNews);
    } catch (err: any) {
      console.error("Live Scan Error:", err);
      setError("Failed to synchronize with the neural news network.");
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-12 flex flex-col h-full space-y-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">
            AI Pulse <span className="text-cyan-400">{viewMode === 'live' ? 'LIVE' : 'HISTORY'}</span>
          </h3>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">
            {viewMode === 'live' ? 'Real-time neural trend analysis' : 'Automated daily intelligence logs'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setViewMode('pulse')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'pulse' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
            >
              Daily Pulse
            </button>
            <button 
              onClick={() => {
                setViewMode('live');
                if (liveNews.length === 0) liveScan();
              }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'live' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
            >
              Live Scan
            </button>
          </div>
          <button 
            onClick={viewMode === 'live' ? liveScan : fetchHistory}
            disabled={loading || scanning}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading || scanning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
          </button>
        </div>
      </div>

      {(loading || scanning) ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-cyan-500/20 rounded-full animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={32} className="text-cyan-400 animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
            {scanning ? 'Scanning Neural Pathways...' : 'Retrieving Historical Data...'}
          </p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle size={48} className="text-red-500/50" />
          <p className="text-gray-500 max-w-xs">{error}</p>
          <button onClick={liveScan} className="text-cyan-400 text-xs font-bold uppercase tracking-widest hover:underline">Retry Connection</button>
        </div>
      ) : viewMode === 'live' ? (
        <div className="grid gap-6">
          {liveNews.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 bg-white/5 border border-white/5 rounded-[32px] hover:border-cyan-500/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <Activity size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.source}</span>
                </div>
                <span className="text-[10px] font-mono text-gray-700">{item.timestamp || 'Just now'}</span>
              </div>
              <h4 className="text-2xl font-black mb-4 tracking-tight group-hover:text-cyan-400 transition-colors uppercase leading-tight">{item.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">{item.summary}</p>
              <div className="flex items-center justify-between">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Read Full Report</span>
                  <ArrowRight size={14} />
                </a>
                <div className="flex items-center space-x-2">
                  <TrendingUp size={14} className="text-green-500" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Trending</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {historyNews.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
              <Newspaper size={48} className="text-gray-800 mb-6" />
              <p className="text-gray-600 uppercase tracking-widest font-black">No historical pulse data detected.</p>
            </div>
          ) : (
            historyNews.map((item, i) => {
              const [title, ...summaryParts] = item.content.replace('🚨 AI PULSE UPDATE: ', '').split('\n\n');
              const summary = summaryParts.join('\n\n');
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 bg-white/5 border border-white/5 rounded-[32px] hover:border-purple-500/30 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Calendar size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.date || 'Historical'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-700">
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black mb-4 tracking-tight group-hover:text-purple-400 transition-colors uppercase leading-tight">{title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">{summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles size={14} className="text-cyan-400" />
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Daily Pulse</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap size={14} className="text-gray-800" />
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">AI Synthesized</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </motion.div>
  );
};

// --- Chat Interface Component ---
const ChatInterface = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [highThinking, setHighThinking] = useState(true);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: "gemini-3.1-pro-preview",
          config: {
            systemInstruction: "You are a friendly and intelligent AI assistant for Bhaskar's AI Hub. You excel at daily conversation, providing helpful advice, and explaining complex topics simply. You are engaging, polite, and always aim to provide accurate information.",
            thinkingConfig: highThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          },
        });
      }

      const response = await chatRef.current.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'No response.' }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: " + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-[750px]"
    >
      <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 shadow-2xl shadow-cyan-500/20">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg uppercase tracking-tight">Neural Chat</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Advanced Cognitive Agent</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Thinking Level</span>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{highThinking ? 'Maximum' : 'Standard'}</span>
          </div>
          <button
            onClick={() => setHighThinking(!highThinking)}
            className={`w-14 h-7 rounded-full transition-all relative p-1 ${highThinking ? 'bg-cyan-500' : 'bg-white/10'}`}
          >
            <motion.div 
              animate={{ x: highThinking ? 28 : 0 }}
              className="w-5 h-5 rounded-full bg-white shadow-lg" 
            />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-8 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div className="relative">
              <div className="w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl absolute inset-0 animate-pulse" />
              <Sparkles size={64} className="text-cyan-400 relative z-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black uppercase tracking-tighter">Initialize Protocol</h4>
              <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">The neural network is primed. Ask anything to begin the cognitive exchange.</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-8 rounded-[32px] relative group ${
              msg.role === 'user' 
                ? 'bg-white text-black font-bold shadow-2xl shadow-white/10' 
                : 'bg-white/5 border border-white/10 text-gray-200 backdrop-blur-xl'
            }`}>
              <div className="markdown-body text-sm leading-relaxed">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              <div className={`absolute top-4 ${msg.role === 'user' ? '-right-2' : '-left-2'} w-4 h-4 rotate-45 ${
                msg.role === 'user' ? 'bg-white' : 'bg-white/5 border-l border-t border-white/10'
              }`} />
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex items-center space-x-4 backdrop-blur-xl">
              <div className="flex space-x-1">
                {[0, 1, 2].map(d => (
                  <motion.div
                    key={d}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
                    className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                  />
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Processing Neural Pathways</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-black/40 border-t border-white/10 backdrop-blur-2xl">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="TRANSMIT MESSAGE..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-cyan-500 transition-all placeholder:text-gray-700 group-hover:bg-white/10"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Live</span>
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-5 bg-white text-black rounded-2xl hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-2xl shadow-white/10 active:scale-95"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Community Hub Component ---
const CommunityHub = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<{ uri: string, title: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const searchCommunity = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResponse(null);
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide detailed information and instructions about community groups related to: ${query}. Focus on how people can communicate and collaborate within these groups.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setResponse(result.text || 'No information found.');
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedSources = chunks
          .filter((c: any) => c.web)
          .map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
        setSources(extractedSources);
      }
    } catch (error: any) {
      console.error("Search Error:", error);
      setResponse("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-16 flex flex-col h-full space-y-12"
    >
      <div className="text-center max-w-2xl mx-auto">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative p-6 bg-blue-500/10 rounded-[32px] text-blue-400 border border-blue-500/20 shadow-2xl shadow-blue-500/20">
            <Users size={64} />
          </div>
        </div>
        <h3 className="text-5xl font-black mb-6 tracking-tighter uppercase">Collective <span className="text-blue-400">Intelligence</span></h3>
        <p className="text-gray-500 text-lg font-medium leading-relaxed">
          The neural network scans the global web to find the most active community clusters. Locate your tribe and synchronize your efforts.
        </p>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCommunity()}
            placeholder="SCAN FOR COMMUNITY NODES (e.g. AI RESEARCHERS, CRYPTO DEVS)..."
            className="w-full bg-white/5 border border-white/10 rounded-[32px] pl-16 pr-6 py-6 text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-blue-500 transition-all group-hover:bg-white/10"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
          <button
            onClick={searchCommunity}
            disabled={loading || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-blue-500 text-white rounded-2xl font-black text-[10px] tracking-widest hover:bg-blue-400 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'EXECUTE SCAN'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto w-full space-y-12"
          >
            <div className="p-12 bg-white/5 border border-white/10 rounded-[48px] backdrop-blur-xl shadow-2xl">
              <div className="markdown-body text-gray-300 leading-relaxed text-lg">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>

            {sources.length > 0 && (
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 flex items-center space-x-3">
                  <Globe size={16} />
                  <span>Verified Neural Sources</span>
                </h4>
                <div className="grid sm:grid-cols-2 gap-6">
                  {sources.map((source, i) => (
                    <motion.a
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-blue-500/50 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={14} className="text-blue-400" />
                      </div>
                      <div className="text-sm font-black text-blue-400 mb-2 line-clamp-1 group-hover:translate-x-1 transition-transform">{source.title}</div>
                      <div className="text-[10px] text-gray-600 truncate font-mono">{source.uri}</div>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Voice Chat Component ---
const VoiceChat = () => {
  const [isLive, setIsLive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  const startLive = async () => {
    try {
      setError(null);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      sessionRef.current = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setTranscript(prev => [...prev, "SYSTEM: NEURAL LINK ESTABLISHED. READY FOR SONIC INPUT."]);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const binaryString = atob(base64Audio);
              const bytes = new Int16Array(binaryString.length / 2);
              for (let i = 0; i < bytes.length; i++) {
                bytes[i] = (binaryString.charCodeAt(i * 2) | (binaryString.charCodeAt(i * 2 + 1) << 8));
              }
              audioQueue.current.push(bytes);
              playNextInQueue();
            }
            if (message.serverContent?.interrupted) {
              audioQueue.current = [];
              isPlaying.current = false;
            }
          },
          onclose: () => {
            stopLive();
            setTranscript(prev => [...prev, "SYSTEM: NEURAL LINK DISCONNECTED."]);
          },
          onerror: (err) => {
            setError("Live API Error: " + err.message);
            stopLive();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful AI assistant in Bhaskar's AI Hub. Keep responses concise and conversational.",
        },
      });

      processorRef.current.onaudioprocess = (e) => {
        if (!sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

    } catch (err: any) {
      setError("Failed to start voice chat: " + err.message);
    }
  };

  const playNextInQueue = async () => {
    if (isPlaying.current || audioQueue.current.length === 0 || !audioContextRef.current) return;
    
    isPlaying.current = true;
    const pcmData = audioQueue.current.shift()!;
    const buffer = audioContextRef.current.createBuffer(1, pcmData.length, 16000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 0x7FFF;
    }
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlaying.current = false;
      playNextInQueue();
    };
    source.start();
  };

  const stopLive = () => {
    setIsLive(false);
    sessionRef.current?.close();
    sessionRef.current = null;
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    audioContextRef.current = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-16 flex flex-col items-center justify-center h-full space-y-12"
    >
      <div className="relative">
        <motion.div 
          animate={isLive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-48 h-48 rounded-[64px] flex items-center justify-center transition-all duration-700 relative z-10 ${
            isLive 
              ? 'bg-cyan-500 shadow-[0_0_100px_rgba(6,182,212,0.4)]' 
              : 'bg-white/5 border border-white/10 backdrop-blur-xl'
          }`}
        >
          {isLive ? <Mic size={64} className="text-black" /> : <MicOff size={64} className="text-gray-500" />}
        </motion.div>
        {isLive && (
          <>
            <div className="absolute -inset-8 border-2 border-cyan-500/20 rounded-[80px] animate-[ping_3s_infinite]" />
            <div className="absolute -inset-16 border border-cyan-500/10 rounded-[100px] animate-[ping_4s_infinite]" />
          </>
        )}
      </div>

      <div className="text-center max-w-md">
        <h3 className="text-4xl font-black mb-4 tracking-tighter uppercase">{isLive ? 'Sonic Stream Active' : 'Sonic Synthesis'}</h3>
        <p className="text-gray-500 text-lg font-medium leading-relaxed">
          {isLive 
            ? 'The neural network is processing your sonic input in real-time. Speak naturally.' 
            : 'Initialize the sonic link to interact with our native voice synthesis engine.'}
        </p>
      </div>

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-500 rounded-3xl flex items-center space-x-4 backdrop-blur-xl">
          <AlertCircle size={24} />
          <span className="font-bold text-sm uppercase tracking-widest">{error}</span>
        </div>
      )}

      <button
        onClick={isLive ? stopLive : startLive}
        className={`px-16 py-6 rounded-[32px] font-black transition-all shadow-2xl active:scale-95 ${
          isLive 
            ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' 
            : 'bg-white text-black hover:bg-cyan-400 shadow-white/10'
        }`}
      >
        <span className="text-sm uppercase tracking-[0.3em]">{isLive ? 'TERMINATE LINK' : 'INITIALIZE SONIC LINK'}</span>
      </button>

      <div className="w-full max-w-3xl bg-black/40 border border-white/10 rounded-[40px] p-10 h-64 overflow-y-auto font-mono text-[10px] text-gray-600 scrollbar-hide backdrop-blur-xl">
        <div className="mb-6 text-cyan-400 font-black uppercase tracking-[0.4em] border-b border-white/5 pb-4 flex items-center justify-between">
          <span>Neural Session Logs</span>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 animate-pulse delay-75" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/20 animate-pulse delay-150" />
          </div>
        </div>
        <div className="space-y-2">
          {transcript.map((line, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start space-x-4"
            >
              <span className="text-cyan-900">[{new Date().toLocaleTimeString()}]</span>
              <span>{line}</span>
            </motion.div>
          ))}
          {transcript.length === 0 && <div className="italic opacity-30">Awaiting neural activity...</div>}
        </div>
      </div>
    </motion.div>
  );
};

// --- API Key Selection Component ---
const ApiKeySelection = ({ onKeySelected }: { onKeySelected: () => void }) => {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      if (await window.aistudio.hasSelectedApiKey()) {
        onKeySelected();
      }
      setChecking(false);
    };
    checkKey();
  }, [onKeySelected]);

  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    onKeySelected();
  };

  if (checking) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-cyan-400" /></div>;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-8">
      <div className="p-6 bg-purple-500/10 rounded-[32px] text-purple-400 border border-purple-500/20 shadow-2xl shadow-purple-500/20">
        <Key size={48} />
      </div>
      <div className="space-y-4">
        <h3 className="text-3xl font-black uppercase tracking-tighter">Neural Authorization Required</h3>
        <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
          To access advanced generative models (Veo & Lyria), you must select a paid Google Cloud API key. 
          Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-purple-400 hover:underline">Billing Docs</a> for setup.
        </p>
      </div>
      <button
        onClick={handleSelectKey}
        className="px-12 py-4 bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-purple-400 transition-all shadow-2xl shadow-purple-500/20"
      >
        Select API Key
      </button>
    </div>
  );
};

// --- Imagine Component (Image Generation) ---
const Imagine = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'generations'), where('type', '==', 'image'), orderBy('createdAt', 'desc'), limit(10));
    return onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GenerationResult)));
    });
  }, []);

  const generateImage = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setResult(imageUrl);
        await addDoc(collection(db, 'generations'), {
          type: 'image',
          url: imageUrl,
          prompt,
          createdAt: serverTimestamp(),
          userId: auth.currentUser?.uid,
          authorName: auth.currentUser?.displayName || 'Anonymous Neuralist'
        });
      }
    } catch (err) {
      console.error("Imagine Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 flex flex-col h-full space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">Imagine <span className="text-pink-400">Vision</span></h3>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Synthesize visual reality from pure thought</p>
        </div>
        <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400">
          <Wand2 size={24} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="DESCRIBE YOUR VISION..."
              className="w-full h-48 bg-white/5 border border-white/10 rounded-[32px] p-8 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-pink-500 transition-all resize-none group-hover:bg-white/10"
            />
            <button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="absolute bottom-6 right-6 px-8 py-4 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-pink-400 transition-all disabled:opacity-50 shadow-2xl shadow-pink-500/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'MANIFEST'}
            </button>
          </div>

          {result && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="aspect-square rounded-[48px] overflow-hidden border border-white/10 shadow-2xl relative group">
              <img src={result} alt="Generated" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => window.open(result, '_blank')} className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform">
                  <Download size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Neural Gallery</h4>
          <div className="grid grid-cols-2 gap-4">
            {history.map((item) => (
              <motion.div key={item.id} whileHover={{ scale: 1.05 }} className="aspect-square rounded-3xl overflow-hidden border border-white/5 relative group cursor-pointer" onClick={() => setResult(item.url)}>
                <img src={item.url} alt={item.prompt} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white line-clamp-2">{item.prompt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Cinema Component (Video Generation) ---
const Cinema = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  if (!hasKey) return <ApiKeySelection onKeySelected={() => setHasKey(true)} />;

  const generateVideo = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setVideoUrl(null);
    setStatus('Initializing Neural Render...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      while (!operation.done) {
        setStatus(`Synthesizing Frames... (${Math.floor(Math.random() * 20 + 40)}%)`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, { headers: { 'x-goog-api-key': process.env.API_KEY! } });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      }
    } catch (err) {
      console.error("Cinema Error:", err);
      setStatus('Render Failed. Neural Link Unstable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 flex flex-col h-full space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">Cinema <span className="text-purple-400">Motion</span></h3>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Animate the impossible through neural synthesis</p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
          <Video size={24} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="relative group">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="DESCRIBE THE CINEMATIC SEQUENCE..."
            className="w-full bg-white/5 border border-white/10 rounded-[32px] px-10 py-8 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-purple-500 transition-all group-hover:bg-white/10"
          />
          <button
            onClick={generateVideo}
            disabled={loading || !prompt.trim()}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-10 py-4 bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-purple-400 transition-all disabled:opacity-50 shadow-2xl shadow-purple-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'GENERATE'}
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-purple-500/20 rounded-full animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play size={48} className="text-purple-400 animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse">{status}</p>
          </div>
        )}

        {videoUrl && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="aspect-video rounded-[48px] overflow-hidden border border-white/10 shadow-2xl bg-black">
            <video src={videoUrl} controls className="w-full h-full object-contain" autoPlay loop />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// --- Symphony Component (Music Generation) ---
const Symphony = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  if (!hasKey) return <ApiKeySelection onKeySelected={() => setHasKey(true)} />;

  const generateMusic = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setAudioUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContentStream({
        model: "lyria-3-clip-preview",
        contents: prompt,
      });

      let audioBase64 = "";
      let mimeType = "audio/wav";

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
            audioBase64 += part.inlineData.data;
          }
        }
      }

      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mimeType });
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Symphony Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 flex flex-col h-full space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">Symphony <span className="text-orange-400">Audio</span></h3>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Compose neural soundscapes from textual harmonics</p>
        </div>
        <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400">
          <Music size={24} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="relative group">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="DESCRIBE THE SONIC ATMOSPHERE..."
            className="w-full bg-white/5 border border-white/10 rounded-[32px] px-10 py-8 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-orange-500 transition-all group-hover:bg-white/10"
          />
          <button
            onClick={generateMusic}
            disabled={loading || !prompt.trim()}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-10 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-400 transition-all disabled:opacity-50 shadow-2xl shadow-orange-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'COMPOSE'}
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8">
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [20, 60, 20] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                  className="w-2 bg-orange-500 rounded-full"
                />
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse">Orchestrating Sonic Waves...</p>
          </div>
        )}

        {audioUrl && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 glass-panel border-orange-500/20 rounded-[48px] flex flex-col items-center space-y-8">
            <Volume2 size={64} className="text-orange-400" />
            <audio src={audioUrl} controls className="w-full max-w-md" />
            <button onClick={() => window.open(audioUrl, '_blank')} className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors">
              <Download size={16} />
              <span>Download Composition</span>
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AIHub;
