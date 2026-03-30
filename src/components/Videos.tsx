import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Play, X, Calendar, User } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  createdAt: any;
  authorUid: string;
}

const Videos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Video[];
      setVideos(videoList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    });

    return () => unsubscribe();
  }, []);

  const featuredVideos = [
    {
      id: 'f1',
      title: "The Future of Generative AI",
      videoId: "L_Guz73e6fw",
      description: "Exploring how generative AI is transforming creativity and industry.",
      thumbnail: "https://img.youtube.com/vi/L_Guz73e6fw/maxresdefault.jpg"
    },
    {
      id: 'f2',
      title: "AI and the Human Brain",
      videoId: "2ePf9rue1Ao",
      description: "A deep dive into the connection between neural networks and biological intelligence.",
      thumbnail: "https://img.youtube.com/vi/2ePf9rue1Ao/maxresdefault.jpg"
    },
    {
      id: 'f3',
      title: "The Rise of Autonomous Agents",
      videoId: "O5xeyo79GE4",
      description: "How AI agents are beginning to navigate the world and solve complex tasks independently.",
      thumbnail: "https://img.youtube.com/vi/O5xeyo79GE4/maxresdefault.jpg"
    }
  ];

  return (
    <div className="py-24 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter uppercase">
          AI <span className="text-cyan-400">CONTENT</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Explore curated AI documentaries, tutorials, and insights alongside my personal video creations.
        </p>
      </motion.div>

      {/* Featured AI Content */}
      <div className="mb-24">
        <div className="flex items-center space-x-4 mb-10">
          <div className="h-px flex-1 bg-white/10" />
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">Featured AI Insights</h3>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer"
              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 group-hover:bg-cyan-500 transition-colors">
                  <Play size={20} className="text-white group-hover:text-black transition-colors" fill="currentColor" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{video.title}</h4>
                <p className="text-xs text-gray-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {video.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-10">
        <div className="h-px flex-1 bg-white/10" />
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400">My Uploads</h3>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
          No videos uploaded yet. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <img
                  src={video.thumbnailUrl || `https://picsum.photos/seed/${video.id}/640/360`}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-black shadow-lg shadow-cyan-500/50">
                    <Play size={32} fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{video.title}</h3>
                <div className="flex items-center space-x-4 text-xs text-gray-500 uppercase tracking-widest">
                  <span className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{video.createdAt?.toDate ? video.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="aspect-video w-full bg-black">
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              </div>
              
              <div className="p-8">
                <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase">{selectedVideo.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  {selectedVideo.description || 'No description provided.'}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-cyan-400" />
                    <span>{selectedVideo.createdAt?.toDate ? selectedVideo.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-purple-400" />
                    <span>Bhaskar</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Videos;
