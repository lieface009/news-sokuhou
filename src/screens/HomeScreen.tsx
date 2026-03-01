import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Keyword, NewsItem } from '../db/db';
import { mockApi } from '../api/mockApi';
import { runMockFetchJob } from '../api/mockFetchJob';
import { Heart, ExternalLink, RefreshCw, X, RotateCcw, AlertTriangle, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const HomeScreen: React.FC = () => {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [topNews, setTopNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

    // Slots for Active Keywords (Max 3)
    const [activeSlots, setActiveSlots] = useState<(Keyword | null)[]>([null, null, null]);

    const navigate = useNavigate();
    const userId = localStorage.getItem('currentUserId');

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        const loadInitialData = async () => {
            const kws = await mockApi.getKeywords(userId);
            setKeywords(kws);

            const favItems = await mockApi.getFavorites(userId);
            setFavorites(new Set(favItems.map((f: NewsItem) => f.id)));

            // Load top news based on whatever is high priority initially if slots are empty
            const highPri = kws.filter(k => k.priority === 'high').slice(0, 3);
            if (highPri.length > 0) {
                const newSlots = [...activeSlots];
                highPri.forEach((k, i) => { if (i < 3) newSlots[i] = k; });
                setActiveSlots(newSlots);
                fetchFeed(highPri.map(k => k.id));
            }
        };

        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, navigate]);

    const fetchFeed = async (ids: string[]) => {
        const activeIds = ids.filter(id => id);
        if (activeIds.length > 0) {
            setLoading(true);
            try {
                const top = await mockApi.getTopNews(activeIds);
                setTopNews(top);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            setTopNews([]);
        }
    };

    const handleSlotDrop = (kw: Keyword, index: number) => {
        const newSlots = [...activeSlots];
        // If already in another slot, remove it from there
        const existingIdx = newSlots.findIndex(s => s?.id === kw.id);
        if (existingIdx !== -1) newSlots[existingIdx] = null;

        newSlots[index] = kw;
        setActiveSlots(newSlots);
        fetchFeed(newSlots.filter(s => s).map(s => s!.id));
        showToast(`${kw.text} をスロット ${index + 1} に配置しました`);
    };

    // New helper for mobile: tap card to place in first empty slot
    const handleKeywordClick = (kw: Keyword) => {
        const emptyIdx = activeSlots.findIndex(s => s === null);
        if (emptyIdx !== -1) {
            handleSlotDrop(kw, emptyIdx);
        } else {
            showToast("スロットがいっぱいです");
        }
    };

    const clearSlot = (index: number) => {
        const newSlots = [...activeSlots];
        newSlots[index] = null;
        setActiveSlots(newSlots);
        fetchFeed(newSlots.filter(s => s).map(s => s!.id));
    };

    const resetAllSlots = () => {
        setActiveSlots([null, null, null]);
        setTopNews([]);
        showToast("全スロットをクリアしました");
    };

    const toggleLike = async (e: React.MouseEvent, newsId: string) => {
        e.stopPropagation();
        if (!userId) return;
        const result = await mockApi.toggleFavorite(userId, newsId);
        const newFavs = new Set(favorites);
        if (result) newFavs.add(newsId);
        else newFavs.delete(newsId);
        setFavorites(newFavs);
        showToast(result ? "保存しました" : "削除しました");
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2000);
    };

    const forceRefresh = async () => {
        const activeIds = activeSlots.filter((s): s is Keyword => s !== null).map(s => s.id);
        if (activeIds.length === 0) {
            showToast("トピックをセットしてください");
            return;
        }
        setLoading(true);
        await runMockFetchJob();
        await fetchFeed(activeIds);
    };

    return (
        <div className="main-content relative min-h-screen pt-24 pb-12">
            <header className="flex justify-between items-start gap-4 mb-8 pt-4">
                <div className="min-w-0">
                    <h1 className="text-2xl font-black text-white font-[Outfit] tracking-tighter">インテリジェンス・フィード</h1>
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">情報の交差地点を探索する</p>
                </div>
                <button onClick={forceRefresh} className="p-2.5 flex-shrink-0 text-text-muted hover:text-white transition-all bg-white/5 rounded-full border border-white/5">
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </header>

            {/* SLOT AREA - Drag targets */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <Layers size={14} className="text-indigo-400" />
                        アクティブ・スロット
                    </h3>
                    <button onClick={resetAllSlots} className="text-[9px] font-black text-text-muted hover:text-indigo-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                        <RotateCcw size={10} /> リセット
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {activeSlots.map((slot, i) => (
                        <div
                            key={i}
                            className={`
                                relative aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden
                                ${slot ? 'border-indigo-500 bg-indigo-500/10 shadow-glow' : 'border-white/20 bg-white/[0.05] hover:border-white/40'}
                            `}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const kwJson = e.dataTransfer.getData("keyword");
                                if (kwJson) {
                                    handleSlotDrop(JSON.parse(kwJson), i);
                                }
                            }}
                        >
                            {slot ? (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-full h-full p-4 flex flex-col items-center justify-center text-center relative"
                                >
                                    <button
                                        onClick={() => clearSlot(i)}
                                        className="absolute top-2 right-2 p-1 text-white/40 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                    <span className="text-[10px] font-black text-white leading-none truncate w-full px-1">
                                        #{slot.text}
                                    </span>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-1 opacity-40">
                                    <span className="text-[10px] font-black">{i + 1}</span>
                                    <div className="text-[7px] font-bold text-text-muted uppercase tracking-widest">
                                        SLOT
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* POOL AREA - Draggable cards */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">トピック・プール（ドラッグして配置）</h3>
                    <button onClick={() => navigate('/keywords')} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:underline">トピック管理</button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none px-1">
                    {keywords.filter(k => !activeSlots.some(s => s?.id === k.id)).length === 0 && keywords.length > 0 && (
                        <div className="py-8 px-4 text-center opacity-30 text-[10px] font-bold italic">全トピックがスロットに配置されています</div>
                    )}
                    {keywords.length === 0 && (
                        <div className="py-8 px-4 text-center opacity-30 text-[10px] font-bold italic">登録済みのトピックがありません</div>
                    )}

                    {keywords.map(kw => {
                        const isInSlot = activeSlots.some(s => s?.id === kw.id);
                        if (isInSlot) return null;

                        return (
                            <div
                                key={kw.id}
                                draggable
                                onDragStart={(e: React.DragEvent) => {
                                    e.dataTransfer.setData("keyword", JSON.stringify(kw));
                                }}
                                onClick={() => handleKeywordClick(kw)}
                                className="min-w-[120px] aspect-square bg-bg-secondary border border-white/5 rounded-[2rem] p-4 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing hover:border-indigo-500/30 active:scale-95 transition-all shadow-lg shrink-0"
                            >
                                <span className="text-[10px] font-black text-white leading-none truncate w-full">
                                    #{kw.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* News Stream */}
            <section className="space-y-12">
                {loading ? (
                    <div className="space-y-8">
                        {[1].map(i => (
                            <div key={i} className="news-card border-none bg-white/5 animate-pulse rounded-[2.5rem]">
                                <div className="aspect-video bg-white/5" />
                                <div className="p-8 space-y-4">
                                    <div className="h-4 w-24 bg-white/5 rounded" />
                                    <div className="h-10 w-full bg-white/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : topNews.length === 0 ? (
                    <div className="py-24 text-center opacity-30 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
                        <Layers size={48} className="mx-auto mb-4 text-indigo-500/50" />
                        <p className="font-black text-sm uppercase tracking-[0.2em] text-white">スキャナー待機中</p>
                        <p className="text-[10px] mt-2 font-bold">プールからトピックをスロットへ<br />ドラッグして分析を開始してください</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {topNews.map((item, idx) => {
                            const isFav = favorites.has(item.news.id);
                            const keywordsMatched = item.reason.split(' + ').map((r: string) => r.replace('Keyword: ', ''));

                            return (
                                <div key={item.news.id} className="relative">
                                    <motion.div
                                        layoutId={`article-container-${item.news.id}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="news-card border-none group relative overflow-visible cursor-pointer"
                                        onClick={() => setSelectedArticle(item.news)}
                                    >
                                        <div className="relative aspect-video overflow-hidden rounded-[2.5rem] shadow-2xl">
                                            <motion.img
                                                layoutId={`img-${item.news.id}`}
                                                src={item.news.thumbnail_url || undefined}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/95 via-transparent to-transparent opacity-60" />

                                            <div className="absolute top-6 left-6 px-3 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-2xl z-10 border border-white/20">
                                                INTELLIGENCE {idx + 1}
                                            </div>

                                            <div className="absolute bottom-6 left-6 flex -space-x-2">
                                                {keywordsMatched.map((k: string) => (
                                                    <div key={k} className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-bg-primary flex items-center justify-center text-[8px] font-black text-white shadow-xl">
                                                        {k.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-8 px-2">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase">{item.news.source}</span>
                                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                                <span className="text-[10px] font-bold text-text-muted">{format(item.news.published_at, 'HH:mm')}</span>
                                            </div>
                                            <motion.h2 layoutId={`title-${item.news.id}`} className="text-xl font-bold leading-tight text-white group-hover:text-indigo-400 transition-colors mb-4 line-clamp-2">
                                                {item.news.title}
                                            </motion.h2>
                                            <p className="text-text-secondary text-sm line-clamp-2 font-medium leading-relaxed opacity-80">{item.news.excerpt}</p>
                                        </div>

                                        <div className="news-bottom-action mt-6 px-4 bg-white/[0.02] border-none rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-black text-white">{item.score}%</span>
                                                <div className="h-6 w-[1px] bg-white/10" />
                                                <div className="flex flex-wrap gap-1">
                                                    {keywordsMatched.map((k: string) => (
                                                        <span key={k} className="text-[8px] font-bold text-text-muted">#{k}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => toggleLike(e, item.news.id)}
                                                className="p-1 transition-all active:scale-150 text-text-muted hover:text-red-500"
                                            >
                                                <Heart size={22} fill={isFav ? "var(--accent-secondary)" : "none"} color={isFav ? "var(--accent-secondary)" : "currentColor"} />
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* IN-PLACE DETAIL EXPANSION */}
                                    <AnimatePresence>
                                        {selectedArticle?.id === item.news.id && (
                                            <motion.div
                                                layoutId={`article-container-${item.news.id}`}
                                                className="absolute inset-x-[-10px] top-[-5px] z-[500] bg-bg-primary rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 p-4 min-h-[110%]"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setSelectedArticle(null)}
                                                        className="absolute top-4 right-4 z-[510] p-3 rounded-full bg-white/10 backdrop-blur-md text-white shadow-xl hover:bg-white/20 transition-all"
                                                    >
                                                        <X size={24} />
                                                    </button>
                                                    {selectedArticle && (
                                                        <>
                                                            <motion.img
                                                                layoutId={`img-${selectedArticle.id}`}
                                                                src={selectedArticle.thumbnail_url || undefined}
                                                                className="w-full aspect-video rounded-[2.5rem] object-cover mb-8"
                                                            />
                                                            <div className="p-6">
                                                                <div className="flex items-center gap-3 mb-6">
                                                                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-widest">{selectedArticle.source}</span>
                                                                    <span className="text-text-muted text-xs font-bold">{format(selectedArticle.published_at, 'yyyy年MM月dd日 HH:mm')}</span>
                                                                </div>
                                                                <motion.h1
                                                                    layoutId={`title-${selectedArticle.id}`}
                                                                    className="text-2xl font-black text-white mb-8 leading-tight font-[Outfit]"
                                                                >
                                                                    {selectedArticle.title}
                                                                </motion.h1>
                                                                <div className="space-y-6 text-text-secondary leading-relaxed text-base pb-32">
                                                                    <p className="font-bold border-l-4 border-indigo-500 pl-4 bg-indigo-500/5 py-4 rounded-r-xl">{selectedArticle.excerpt}</p>
                                                                    <p>{selectedArticle.content}</p>
                                                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                                                                        <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                                                                        <p className="text-[10px] font-bold opacity-60 m-0 leading-normal">AIシミュレーションによる記事です。実際のニュースとは異なる場合があります。</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => window.open(selectedArticle.url || '#', '_blank')}
                                                                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-glow flex items-center justify-center gap-2 transform active:scale-95 transition-transform"
                                                                >
                                                                    配信元で記事を読む <ExternalLink size={18} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Notification Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[600] bg-indigo-600 text-white px-8 py-3 rounded-2xl shadow-glow font-black text-[10px] uppercase tracking-[0.3em] whitespace-nowrap border border-white/20"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
