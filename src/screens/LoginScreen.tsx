import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Lock, Mail, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginScreen: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('メールアドレスとパスワードを入力してください');
            return;
        }

        setLoading(true);

        try {
            // Simulate network delay
            await new Promise(r => setTimeout(r, 600));

            if (isLogin) {
                const user = await db.users.where('email').equals(email).first();
                if (!user || user.password_hash !== btoa(password)) {
                    throw new Error('パスワードが間違っているか、アカウントが存在しません。');
                }
                localStorage.setItem('currentUserId', user.id);
                navigate('/home');
            } else {
                const existing = await db.users.where('email').equals(email).first();
                if (existing) throw new Error('このメールアドレスは既に登録されています');

                const newUser = {
                    id: uuidv4(),
                    email,
                    password_hash: btoa(password),
                    oauth_provider: null,
                    notification_enabled: true,
                    fetch_interval_min: 15,
                    language_pref: 'ja',
                    created_at: Date.now()
                };
                await db.users.add(newUser);
                localStorage.setItem('currentUserId', newUser.id);
                navigate('/home');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[100vh] p-6 relative overflow-hidden bg-bg-primary">
            {/* Dynamic Background decorations */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px] mix-blend-screen pointer-events-none"
            />
            <motion.div
                animate={{ scale: [1, 1.5, 1], rotate: [0, -45, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-pink-600/10 blur-[100px] mix-blend-screen pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="z-10 w-full text-center mb-10 mt-[-5vh]"
            >
                <div className="inline-flex items-center justify-center p-5 bg-white/5 backdrop-blur-xl rounded-[2rem] mb-6 shadow-glow border border-white/10 relative">
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400" size={20} />
                    <Newspaper size={56} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
                <h1 className="text-5xl font-black mb-3 font-[Outfit] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-100">
                    NEWS速報くん
                </h1>
                <p className="text-indigo-200/80 text-sm font-medium tracking-wide">
                    あなただけのパーソナライズ記事を、最速で。
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-full max-w-sm relative z-10"
            >
                <Card className="p-8 backdrop-blur-2xl bg-bg-secondary/40 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-[2rem]">
                    <h2 className="text-2xl font-bold mb-8 text-center text-white font-[Outfit]">
                        {isLogin ? 'おかえりなさい' : 'アカウントを作成'}
                    </h2>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm mb-6 flex items-start gap-2 shadow-inner"
                            >
                                <div className="mt-0.5"><Lock size={14} className="text-red-400" /></div>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-2 relative group">
                            <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider pl-1 block transition-colors group-focus-within:text-indigo-400">
                                メールアドレス
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-indigo-400" size={20} />
                                <input
                                    type="email"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-lg placeholder-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                    placeholder="news@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative group">
                            <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider pl-1 block transition-colors group-focus-within:text-indigo-400">
                                パスワード
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-indigo-400" size={20} />
                                <input
                                    type="password"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-lg placeholder-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-8 py-4 font-bold text-lg rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all shadow-glow group relative overflow-hidden"
                            disabled={loading}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? '処理中...' : isLogin ? 'ログインする' : '登録する'}
                                {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-sm font-medium text-text-muted hover:text-white transition-colors border-b border-transparent hover:border-white/50 pb-0.5"
                        >
                            {isLogin ? '初めての方はこちらから登録' : '既にアカウントをお持ちの方はこちら'}
                        </button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};
