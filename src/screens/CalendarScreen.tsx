import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CalendarScreen: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

    // Mock data for activity
    const entries = [
        { date: format(new Date(), 'yyyy-MM-dd'), topics: ['AI', '半導体'] },
        { date: format(new Date(), 'yyyy-MM-05'), topics: ['iPhone'] },
    ];

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const selectedEntry = entries.find(e => e.date === format(selectedDate, 'yyyy-MM-dd'));

    // Helper to group days into weeks for table rendering
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    calendarDays.forEach((day) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    return (
        <div className="main-content">
            <header className="mb-10 pt-4">
                <h1 className="text-2xl font-black text-white font-[Outfit] tracking-tighter">インテリジェンス・シート</h1>
                <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">情報の蓄積を俯瞰する</p>
            </header>

            {/* ROBUST TABLE-BASED CALENDAR (Happy Lilac Inspired) */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl text-bg-primary overflow-hidden max-w-md mx-auto">
                <div className="flex items-center justify-between mb-8 px-2">
                    <button onClick={prevMonth} className="p-2 transition-colors hover:bg-black/5 rounded-full text-bg-primary">
                        <ChevronLeft size={24} strokeWidth={3} />
                    </button>
                    <h2 className="text-xl font-black tracking-tighter text-bg-primary">
                        {format(currentMonth, 'yyyy年 M月')}
                    </h2>
                    <button onClick={nextMonth} className="p-2 transition-colors hover:bg-black/5 rounded-full text-bg-primary">
                        <ChevronRight size={24} strokeWidth={3} />
                    </button>
                </div>

                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black/5">
                            {weekDays.map((day, i) => (
                                <th key={day} className="pb-4 text-center text-[10px] font-black uppercase tracking-widest" style={{ color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : 'rgba(0,0,0,0.4)' }}>
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((week, wIdx) => (
                            <tr key={wIdx}>
                                {week.map((day, dIdx) => {
                                    const isCurrentInMonth = isSameMonth(day, monthStart);
                                    const isToday = isSameDay(day, new Date());
                                    const isSelected = isSameDay(day, selectedDate);
                                    const hasData = entries.some(e => e.date === format(day, 'yyyy-MM-dd'));

                                    return (
                                        <td key={dIdx} className="p-1">
                                            <button
                                                onClick={() => setSelectedDate(day)}
                                                className={`
                                                    w-full aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative
                                                    ${isCurrentInMonth ? '' : 'opacity-0 pointer-events-none'}
                                                    ${isSelected ? 'bg-indigo-600 text-white shadow-glow scale-105 z-10' : 'hover:bg-black/5 text-bg-primary'}
                                                    ${isToday && !isSelected ? 'ring-2 ring-indigo-600/20' : ''}
                                                `}
                                            >
                                                <span className="text-sm font-black" style={{ color: !isSelected && isCurrentInMonth ? (dIdx === 0 ? '#ef4444' : dIdx === 6 ? '#3b82f6' : '#0a0c10') : 'inherit' }}>
                                                    {format(day, 'd')}
                                                </span>
                                                {hasData && (
                                                    <div className={`
                                                        absolute bottom-1 w-1 h-1 rounded-full 
                                                        ${isSelected ? 'bg-white' : 'bg-indigo-600'}
                                                    `} />
                                                )}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Daily Summary */}
            <div className="mt-12 space-y-6">
                <div className="flex items-center gap-2 px-2">
                    <CalendarIcon size={18} className="text-indigo-400" />
                    <h3 className="text-sm font-black text-white">{format(selectedDate, 'M月 d日のログ', { locale: ja })}</h3>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedDate.toISOString()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-6 bg-bg-secondary rounded-[2rem] border border-white/5"
                    >
                        {selectedEntry ? (
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">注目トピック</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedEntry.topics.map(t => (
                                        <span key={t} className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-1.5">
                                            <Hash size={10} /> {t}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                                    この日のニュースフィードは、上記のトピックを中心としたインテリジェンス分析が実行されました。
                                </p>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-text-muted opacity-50 italic text-xs font-medium">
                                この日の記録はありません。
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
