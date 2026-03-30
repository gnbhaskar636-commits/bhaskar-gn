import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { MessageSquare, ThumbsUp, Share2, Send, User, Image as ImageIcon, Loader2, Sparkles, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Post {
  id: string;
  authorName: string;
  authorPhoto: string;
  authorEmail?: string;
  authorCode?: string;
  content: string;
  createdAt: any;
  likes: number;
  comments: number;
  isAutomated?: boolean;
}

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<{[key: string]: any[]}>({});
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const [currentUserCode, setCurrentUserCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserCode = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setCurrentUserCode(userDoc.data().userCode);
        }
      }
    };
    fetchUserCode();

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorName: auth.currentUser!.displayName!,
        authorPhoto: auth.currentUser!.photoURL || null,
        authorEmail: auth.currentUser!.email,
        authorUid: auth.currentUser!.uid,
        authorCode: currentUserCode,
        content: newPost,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0
      });
      setNewPost('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'posts');
    } finally {
      setIsPosting(false);
    }
  };

  const toggleComments = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    setExpandedPost(postId);
    
    // Fetch comments for this post
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    onSnapshot(q, (snapshot) => {
      const commentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(prev => ({ ...prev, [postId]: commentList }));
    });
  };

  const handleAddComment = async (postId: string) => {
    const text = newComment[postId];
    if (!text?.trim()) return;

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        authorName: auth.currentUser!.displayName!,
        authorPhoto: auth.currentUser!.photoURL || null,
        authorUid: auth.currentUser!.uid,
        authorCode: currentUserCode,
        content: text,
        createdAt: serverTimestamp()
      });
      
      // Update comment count on the post
      await updateDoc(doc(db, 'posts', postId), {
        comments: increment(1)
      });
      
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${postId}/comments`);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 relative z-10">
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="mb-24 text-center">
        <div className="inline-flex p-6 bg-white text-black rounded-[32px] mb-8 shadow-2xl shadow-white/10">
          <MessageSquare size={48} />
        </div>
        <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase bg-gradient-to-b from-white to-gray-800 bg-clip-text text-transparent">Community</h2>
        <p className="text-gray-500 text-lg font-medium">Share your AI discoveries and connect with other creators.</p>
      </div>

      {/* Create Post - Available for all */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[48px] p-10 mb-24 relative overflow-hidden group border-white/10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="flex space-x-8 relative z-10">
          <div className="w-20 h-20 rounded-[24px] bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
            {auth.currentUser?.photoURL ? (
              <img src={auth.currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-cyan-400" />
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind, creator?"
              className="w-full bg-transparent border-none focus:ring-0 text-2xl font-bold resize-none h-40 placeholder:text-gray-800 text-white"
            />
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/5">
              <div className="flex space-x-8">
                <button className="text-gray-600 hover:text-cyan-400 transition-all hover:scale-110 group/btn">
                  <ImageIcon size={24} className="group-hover/btn:rotate-12 transition-transform" />
                </button>
              </div>
              <button
                onClick={handlePost}
                disabled={!newPost.trim() || isPosting}
                className="px-10 py-5 bg-white text-black font-black rounded-3xl hover:bg-cyan-400 transition-all disabled:opacity-50 flex items-center space-x-4 active:scale-95 group/post"
              >
                {isPosting ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} className="group-hover/post:translate-x-1 group-hover/post:-translate-y-1 transition-transform" />}
                <span className="text-sm uppercase tracking-[0.2em]">Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feed */}
      <div className="space-y-16">
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 size={48} className="animate-spin text-cyan-400" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32 text-gray-700 border-2 border-dashed border-white/5 rounded-[64px] font-black uppercase tracking-[0.2em]">
            The feed is empty. Start the conversation.
          </div>
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-[56px] p-12 hover:border-white/20 transition-all relative group/card overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover/card:from-cyan-500/5 group-hover/card:to-purple-500/5 transition-all duration-700" />
              
              <div className="flex items-center space-x-6 mb-10 relative z-10">
                <div className="w-16 h-16 rounded-[20px] bg-white/5 border border-white/10 overflow-hidden shadow-2xl shadow-black/40 group-hover/card:scale-105 transition-transform duration-500 flex items-center justify-center">
                  {post.isAutomated ? (
                    <Sparkles size={32} className="text-cyan-400 animate-pulse" />
                  ) : (
                    <img src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}&topType=shortHair&facialHairProbability=0&mouthType=smile&clotheType=hoodie`} alt={post.authorName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-4">
                    <h4 className="font-black text-2xl uppercase tracking-tight text-white">
                      {post.isAutomated ? 'AI Pulse' : post.authorName}
                    </h4>
                    {post.isAutomated ? (
                      <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-xl border border-cyan-500/30 uppercase tracking-[0.2em] flex items-center space-x-2">
                        <Sparkles size={10} />
                        <span>Automated News</span>
                      </span>
                    ) : post.authorEmail === 'gnbhaskar636@gmail.com' ? (
                      <span className="text-[10px] font-black bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-xl border border-purple-500/30 uppercase tracking-[0.2em] flex items-center space-x-2">
                        <Zap size={10} />
                        <span>Creator</span>
                      </span>
                    ) : post.authorCode && (
                      <span className="text-[10px] font-black bg-white/5 text-cyan-400 px-3 py-1.5 rounded-xl border border-white/10 uppercase tracking-[0.2em]">
                        #{post.authorCode}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-700 uppercase font-black tracking-[0.2em] mt-2">
                    {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Just now'}
                  </p>
                </div>
              </div>
              
              <div className="markdown-body text-gray-400 mb-12 leading-relaxed text-xl font-medium relative z-10 px-2">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              <div className="flex items-center space-x-12 pt-10 border-t border-white/5 relative z-10">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-cyan-400 transition-all group/action"
                >
                  <ThumbsUp size={22} className="group-hover/action:scale-125 transition-transform" />
                  <span className="text-lg font-black font-mono">{post.likes || 0}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center space-x-3 transition-all group/action ${expandedPost === post.id ? 'text-purple-400' : 'text-gray-600 hover:text-purple-400'}`}
                >
                  <MessageSquare size={22} className="group-hover/action:scale-125 transition-transform" />
                  <span className="text-lg font-black font-mono">{post.comments || 0}</span>
                </button>
                <button className="flex items-center space-x-3 text-gray-600 hover:text-pink-400 transition-all group/action">
                  <Share2 size={22} className="group-hover/action:scale-125 transition-transform" />
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {expandedPost === post.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-10 pt-10 border-t border-white/5 overflow-hidden relative z-10"
                  >
                    <div className="space-y-6 mb-10">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex space-x-5">
                          <div className="w-12 h-12 rounded-[14px] bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 shadow-2xl">
                            <img src={comment.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName}&topType=shortHair&facialHairProbability=0&mouthType=smile&clotheType=hoodie`} alt={comment.authorName} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 glass-panel border-white/5 rounded-[24px] p-6">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="text-sm font-black text-white uppercase tracking-tight">{comment.authorName}</h5>
                              {comment.authorCode && (
                                <span className="text-[8px] font-black text-cyan-500/60 uppercase tracking-widest">#{comment.authorCode}</span>
                              )}
                            </div>
                            <p className="text-gray-400 font-medium leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-5 items-center">
                      <div className="w-12 h-12 rounded-[14px] bg-cyan-500/10 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                        {auth.currentUser?.photoURL ? (
                          <img src={auth.currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} className="text-cyan-400" />
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="w-full bg-white/5 border border-white/10 rounded-[20px] px-8 py-4 text-white focus:border-cyan-500 focus:outline-none pr-16 font-bold"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-400 transition-all active:scale-90"
                        >
                          <Send size={24} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const RefreshCw = ({ size, className }: { size: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default Community;
