import React, { useState, useEffect } from 'react';
import type { NewsItem } from '../db/db';
import { mockApi } from '../api/mockApi';
import { Heart, ExternalLink, X, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const FavoritesScreen: React.FC = () => {
    const [favorites, setFavorites] = useState<NewsItem[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
    const userId = localStorage.getItem('currentUserId') || 'test_user';

    useEffect(() => {
        loadFavorites();
    }, [userId]);

    const loadFavorites = async () => {
        const items = await mockApi.getFavorites(userId);
        setFavorites(items);
    };

    const toggleLike = async (id: string) => {
        await mockApi.toggleFavorite(userId, id);
        loadFavorites();
        if (selectedArticle?.id === id) setSelectedArticle(null);
    };

    return (
        <div className="main-content">
            <header className="mb-10 pt-4">
                <h1 className="text-2xl font-black text-white font-[Outfit] tracking-tighter">ブックマーク</h1>
                <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">{favorites.length} 件の記事を保存済み</p>
            </header>

            {favorites.length === 0 ? (
                <div className="py-32 text-center opacity-30 flex flex-col items-center gap-4 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
                    <Bookmark size={48} className="text-indigo-500/50" />
                    <p className="font-black text-sm uppercase tracking-[0.2em] text-white">保存された記事はありません</p>
                    <p className="text-[10px] font-bold">興味のある記事をハートマークで<br />ブックマークに追加しましょう</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {favorites.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedArticle(item)}
                            className="bg-bg-secondary p-5 rounded-[2rem] border border-white/5 flex gap-5 cursor-pointer hover:border-indigo-500/30 transition-all overflow-hidden group shadow-lg"
                        >
                            <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden rounded-2xl">
                                <img src={item.thumbnail_url || undefined} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{item.source}</p>
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        <p className="text-[9px] font-bold text-text-muted">{format(item.published_at, 'MM/dd HH:mm')}</p>
                                    </div>
                                    <h3 className="text-sm font-black text-white leading-tight line-clamp-2">{item.title}</h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* In-place Article Detail Modal (Matched style with Home) */}
            <AnimatePresence>
                {selectedArticle && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-[500] bg-bg-primary overflow-y-auto"
                    >
                        <div className="p-4 pt-10 pb-32">
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="fixed top-8 left-8 z-[510] p-3 rounded-full bg-white/10 backdrop-blur-md text-white shadow-xl hover:bg-white/20 transition-all"
                            >
                                <X size={24} />
                            </button>

                            <img src={selectedArticle.thumbnail_url || undefined} className="w-full aspect-video rounded-[3rem] object-cover mb-10 shadow-2xl" />

                            <div className="px-6 max-w-xl mx-auto">
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-500/20">{selectedArticle.source}</span>
                                    <span className="text-text-muted text-xs font-bold">{format(selectedArticle.published_at, 'yyyy年MM月dd日 HH:mm')}</span>
                                </div>

                                <h1 className="text-2xl font-black text-white mb-10 leading-snug font-[Outfit] tracking-tight">
                                    {selectedArticle.title}
                                </h1>

                                <div className="space-y-8 text-text-secondary leading-relaxed text-lg pb-10">
                                    <p className="font-bold border-l-4 border-indigo-500 pl-6 bg-indigo-500/5 py-6 rounded-r-2xl text-white">
                                        {selectedArticle.excerpt}
                                    </p>
                                    <p className="opacity-90">{selectedArticle.content}</p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => toggleLike(selectedArticle.id)}
                                        className="flex-1 py-5 bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                                    >
                                        <Heart size={20} fill="currentColor" /> ブックマークを解除
                                    </button>
                                    <button
                                        onClick={() => window.open(selectedArticle.url, '_blank')}
                                        className="w-16 py-5 bg-white/5 border border-white/5 text-white rounded-2xl font-black flex items-center justify-center hover:bg-white/10 transition-all"
                                    >
                                        <ExternalLink size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
