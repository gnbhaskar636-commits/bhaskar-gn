import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronRight, Star, Plus } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
  isFeatured?: boolean;
}

const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(eventList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase">Calendar</h2>
        <p className="text-gray-500">Upcoming events, workshops, and meetups in the AI Hub.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            {events.length === 0 ? (
              <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-[32px]">
                No upcoming events scheduled yet.
              </div>
            ) : (
              events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`group p-8 rounded-[32px] border transition-all relative overflow-hidden ${
                    event.isFeatured ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {event.isFeatured && (
                    <div className="absolute top-0 right-0 p-6">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-cyan-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Star size={12} fill="currentColor" />
                        <span>Featured</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start space-x-6">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center p-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{event.date.split(',')[0].split(' ')[0]}</span>
                        <span className="text-2xl font-black text-white leading-none">{event.date.split(',')[0].split(' ')[1]}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                          <CalendarIcon size={12} />
                          <span>{event.category}</span>
                        </div>
                        <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-cyan-400 transition-colors uppercase">{event.title}</h3>
                        <div className="flex flex-wrap gap-6 text-sm text-gray-500 font-medium">
                          <div className="flex items-center space-x-2">
                            <Clock size={16} className="text-purple-400" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin size={16} className="text-pink-400" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users size={16} className="text-blue-400" />
                            <span>{event.attendees} attending</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center space-x-2 group-hover:border-cyan-500/50">
                      <span>RSVP</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Sidebar / Mini Calendar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px]">
              <h4 className="text-lg font-black mb-6 tracking-tighter uppercase">March 2026</h4>
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const hasEvent = events.some(e => e.date.includes(day.toString()));
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        hasEvent ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 
                        day === 25 ? 'bg-white/20 text-white' : 'text-gray-500 hover:bg-white/5'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 rounded-[32px]">
              <h4 className="text-lg font-black mb-4 tracking-tighter uppercase">Host an Event</h4>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">Have something to share with the community? Host your own workshop or talk!</p>
              <button className="w-full py-4 bg-white text-black font-black rounded-2xl text-sm hover:bg-cyan-400 transition-all">
                PROPOSE EVENT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
