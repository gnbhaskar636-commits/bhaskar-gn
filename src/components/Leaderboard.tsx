import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, User, ChevronUp, TrendingUp, TrendingDown, Crown, Loader2 } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface Member {
  id: string;
  name: string;
  points: number;
  level: number;
  avatar: string;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

const Leaderboard = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'public_profiles'), orderBy('points', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memberList = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        name: doc.data().displayName,
        avatar: doc.data().photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.data().displayName}`,
        ...doc.data()
      })) as Member[];
      setMembers(memberList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'public_profiles');
    });

    return () => unsubscribe();
  }, []);

  const topThree = members.slice(0, 3);
  const rest = members.slice(3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 relative z-10">
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="mb-24 text-center">
        <div className="inline-flex p-6 bg-white text-black rounded-[32px] mb-8 shadow-2xl shadow-white/10">
          <Trophy size={48} />
        </div>
        <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase bg-gradient-to-b from-white to-gray-800 bg-clip-text text-transparent">Leaderboard</h2>
        <p className="text-gray-500 text-lg font-medium">Top community contributors and AI explorers.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 size={48} className="animate-spin text-cyan-400" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-32 text-gray-700 border-2 border-dashed border-white/5 rounded-[64px] font-black uppercase tracking-[0.2em]">
          No members on the leaderboard yet.
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="grid grid-cols-3 gap-8 items-end mb-24 max-w-3xl mx-auto px-4">
            {/* 2nd Place */}
            {topThree[1] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-[32px] bg-white/5 border-2 border-slate-400 p-1 mb-6 relative shadow-2xl shadow-slate-400/10">
                  <img src={topThree[1].avatar} alt={topThree[1].name} className="w-full h-full rounded-[28px] object-cover" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-400 rounded-2xl flex items-center justify-center text-black font-black text-sm shadow-xl">2</div>
                </div>
                <div className="text-center">
                  <h4 className="font-black text-sm mb-1 uppercase tracking-tight">{topThree[1].name}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{topThree[1].points} pts</p>
                </div>
                <div className="w-full h-32 bg-gradient-to-t from-slate-400/10 to-transparent rounded-t-[32px] mt-6 border-t border-slate-400/20" />
              </motion.div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-32 h-32 rounded-[40px] bg-white/5 border-4 border-yellow-500 p-1 mb-6 relative shadow-2xl shadow-yellow-500/20">
                  <img src={topThree[0].avatar} alt={topThree[0].name} className="w-full h-full rounded-[36px] object-cover" />
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-2xl shadow-yellow-500/50">1</div>
                </div>
                <div className="text-center">
                  <h4 className="font-black text-xl mb-1 uppercase tracking-tighter">{topThree[0].name}</h4>
                  <p className="text-xs text-yellow-500 font-black uppercase tracking-[0.2em]">{topThree[0].points} pts</p>
                </div>
                <div className="w-full h-48 bg-gradient-to-t from-yellow-500/10 to-transparent rounded-t-[40px] mt-6 border-t border-yellow-500/20" />
              </motion.div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-[32px] bg-white/5 border-2 border-amber-700 p-1 mb-6 relative shadow-2xl shadow-amber-700/10">
                  <img src={topThree[2].avatar} alt={topThree[2].name} className="w-full h-full rounded-[28px] object-cover" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-700 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl">3</div>
                </div>
                <div className="text-center">
                  <h4 className="font-black text-sm mb-1 uppercase tracking-tight">{topThree[2].name}</h4>
                  <p className="text-[10px] text-amber-700 font-black uppercase tracking-[0.2em]">{topThree[2].points} pts</p>
                </div>
                <div className="w-full h-24 bg-gradient-to-t from-amber-700/10 to-transparent rounded-t-[32px] mt-6 border-t border-amber-700/20" />
              </motion.div>
            )}
          </div>

          {/* List */}
          <div className="space-y-6">
            {rest.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-8 rounded-[40px] glass-panel border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center space-x-8">
                  <div className="w-10 text-center font-mono font-black text-gray-700 text-lg">{member.rank}</div>
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl shadow-black/40 group-hover:scale-105 transition-transform">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xl uppercase tracking-tight">{member.name}</h4>
                    <div className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.2em] text-gray-600 font-black mt-1">
                      <Star size={12} className="text-yellow-500" />
                      <span>Level {member.level}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-12">
                  <div className="text-right">
                    <div className="text-2xl font-black text-white font-mono tracking-tighter">{member.points.toLocaleString()}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gray-700 font-black">Total Points</div>
                  </div>
                  <div className={`p-4 rounded-2xl transition-all ${
                    member.trend === 'up' ? 'text-green-500 bg-green-500/5 border border-green-500/10' : 
                    member.trend === 'down' ? 'text-red-500 bg-red-500/5 border border-red-500/10' : 
                    'text-gray-700 bg-white/5 border border-white/5'
                  }`}>
                    {member.trend === 'up' ? <TrendingUp size={24} /> : member.trend === 'down' ? <TrendingDown size={24} /> : <ChevronUp size={24} className="rotate-90" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
