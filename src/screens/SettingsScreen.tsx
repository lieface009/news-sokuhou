import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Database, ChevronRight, User, ShieldCheck, Languages, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsScreen: React.FC = () => {
    const [notifications, setNotifications] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (confirm('ログアウトしますか？')) {
            localStorage.removeItem('currentUserId');
            navigate('/login');
        }
    };

    const handleClearCache = () => {
        setClearing(true);
        setTimeout(() => {
            setClearing(false);
            showToast('キャッシュをクリアしました');
        }, 1500);
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    return (
        <div className="main-content">
            <header className="mb-10 pt-4">
                <h1 className="text-2xl font-black text-white font-[Outfit] tracking-tighter">システム設定</h1>
                <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">アプリの動作環境を管理する</p>
            </header>

            <div className="space-y-6">
                {/* Profile Card */}
                <div className="p-6 bg-bg-secondary rounded-[2rem] border border-white/5 flex items-center gap-5 shadow-xl">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-glow">
                        <User size={32} />
                    </div>
                    <div>
                        <p className="text-lg font-black text-white tracking-tight">ゲストオペレーター</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Secure Access ID: 49-X01</p>
                    </div>
                </div>

                {/* Interaction Settings */}
                <section className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2 mb-4">インタラクション</p>

                    <div
                        className="flex justify-between items-center p-6 bg-bg-secondary rounded-[1.8rem] border border-white/5 cursor-pointer hover:border-indigo-500/30 transition-all"
                        onClick={() => setNotifications(!notifications)}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl transition-colors ${notifications ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-text-muted'}`}>
                                <Bell size={20} />
                            </div>
                            <span className="text-sm font-bold text-white">速報プッシュ通知</span>
                        </div>
                        <div className={`toggle-switch ${notifications ? 'active' : ''}`}>
                            <div className="toggle-handle" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-6 bg-bg-secondary rounded-[1.8rem] border border-white/5 opacity-50 relative overflow-hidden">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-white/5 text-text-muted">
                                <Languages size={20} />
                            </div>
                            <span className="text-sm font-bold text-white">システム言語</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-text-muted border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest">日本語 (固定)</span>
                        </div>
                    </div>
                </section>

                {/* Data Management */}
                <section className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2 mb-4">データ管理</p>

                    <div
                        className="flex justify-between items-center p-6 bg-bg-secondary rounded-[1.8rem] border border-white/5 cursor-pointer hover:border-indigo-500/30 transition-all"
                        onClick={handleClearCache}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-white/5 text-text-muted">
                                <Database size={20} />
                            </div>
                            <span className="text-sm font-bold text-white">キャッシュの最適化</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {clearing ? (
                                <div className="w-5 h-5 border-2 border-indigo-500 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="text-xs font-bold text-text-muted">128.4 MB</span>
                                    <ChevronRight size={16} className="text-text-muted" />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-6 bg-bg-secondary rounded-[1.8rem] border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-sm font-bold text-white">エンドツーエンド暗号化</span>
                        </div>
                        <div className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/30">
                            有効
                        </div>
                    </div>
                </section>

                {/* Logout Button */}
                <div className="pt-10 space-y-8">
                    <button
                        onClick={handleLogout}
                        className="w-full py-5 rounded-[1.8rem] bg-red-500/5 border border-red-500/20 text-red-500 font-black text-sm tracking-[0.4em] hover:bg-red-500/10 hover:border-red-500/40 transition-all flex items-center justify-center gap-3"
                    >
                        <LogOut size={18} />
                        セッションを終了
                    </button>

                    <div className="text-center space-y-3 opacity-30">
                        <p className="text-[9px] font-black text-text-muted tracking-[0.5em] uppercase">
                            INTELLIGENCE PROTOCOL V6.3
                        </p>
                        <div className="flex justify-center gap-4">
                            <span className="text-[8px] font-bold">利用規約</span>
                            <span className="text-[8px] font-bold">プライバシー</span>
                            <span className="text-[8px] font-bold">法務</span>
                        </div>
                    </div>
                </div>
            </div>

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
