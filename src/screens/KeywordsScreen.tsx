import React, { useState, useEffect } from 'react';
import type { Keyword } from '../db/db';
import { mockApi } from '../api/mockApi';
import { runMockFetchJob } from '../api/mockFetchJob';
import { Plus, Trash2, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const KeywordsScreen: React.FC = () => {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newText, setNewText] = useState('');
    const [newNote, setNewNote] = useState('');
    const [toast, setToast] = useState<string | null>(null);
    const userId = localStorage.getItem('currentUserId') || '';

    const loadKeywords = async () => {
        if (userId) {
            const kws = await mockApi.getKeywords(userId);
            setKeywords(kws);
        }
    };

    useEffect(() => {
        loadKeywords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newText.trim()) return;
        try {
            await mockApi.createKeyword(userId, newText, 'normal', newNote);
            setNewText('');
            setNewNote('');
            setIsAdding(false);
            loadKeywords();
            showToast('トピックを追加しました');
            setTimeout(runMockFetchJob, 100);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('このトピックを完全に削除しますか？')) {
            await mockApi.deleteKeyword(id);
            loadKeywords();
            showToast('削除しました');
        }
    };

    return (
        <div className="main-content">
            <header className="mb-10 pt-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-white font-[Outfit] tracking-tighter">トピック管理</h1>
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">{keywords.length}/30 登録済み</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-glow transition-transform active:scale-90"
                    >
                        <Plus size={24} />
                    </button>
                )}
            </header>

            <AnimatePresence mode="wait">
                {isAdding ? (
                    <motion.div
                        key="addForm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-bg-secondary p-8 rounded-[3rem] border border-indigo-500/30 mb-8 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-lg font-black text-white font-[Outfit] tracking-tight">トピック登録</h3>
                            <button onClick={() => setIsAdding(false)} className="p-2 text-text-muted hover:text-white transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">タイトル</label>
                                <input
                                    type="text"
                                    className="input-main h-14 text-white font-bold text-lg"
                                    placeholder="例: 半導体, iPhone, AI"
                                    value={newText}
                                    onChange={e => setNewText(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">AI への注釈 / メモ</label>
                                <textarea
                                    className="input-main min-h-[140px] resize-none text-sm font-medium leading-relaxed"
                                    placeholder="どのような視点のニュースを優先したいか入力してください..."
                                    value={newNote}
                                    onChange={e => setNewNote(e.target.value)}
                                />
                            </div>

                            <div className="pt-6 border-t border-white/5 opacity-60 flex items-start gap-2">
                                <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-text-secondary leading-normal">
                                    トピックを追加すると、ホーム画面の「トピック・プール」に自動的に保存されます。
                                </p>
                            </div>

                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm tracking-[0.3em] shadow-glow transform active:scale-[0.98] transition-all">
                                トピックを保存
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {keywords.map((kw, idx) => (
                            <motion.div
                                key={kw.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="bg-bg-secondary p-5 rounded-[2rem] border border-white/5 flex flex-col justify-between aspect-square group relative hover:border-indigo-500/30 transition-all shadow-lg"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-black text-white leading-tight truncate">#{kw.text}</h3>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, kw.id)}
                                            className="p-2 -mr-2 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Intelligence ID: {kw.id.substring(0, 8)}</span>
                                </div>
                            </motion.div>
                        ))}

                        <button
                            onClick={() => setIsAdding(true)}
                            className="border-2 border-dashed border-white/5 bg-white/[0.01] rounded-[2rem] flex flex-col items-center justify-center gap-3 text-text-muted hover:text-indigo-400 hover:border-indigo-500/20 transition-all aspect-square"
                        >
                            <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center">
                                <Plus size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">追加</span>
                        </button>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] shadow-glow z-[500] uppercase tracking-[0.3em] whitespace-nowrap border border-white/20"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
