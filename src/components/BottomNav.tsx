import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Bookmark, CalendarDays, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
    const navItems = [
        { to: '/home', icon: Home, label: 'Home' },
        { to: '/keywords', icon: Search, label: 'Search' },
        { to: '/favorites', icon: Bookmark, label: 'Saved' },
        { to: '/calendar', icon: CalendarDays, label: 'History' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-8 pointer-events-none">
            <div className="max-w-[500px] mx-auto pointer-events-auto">
                <div className="glass-panel flex justify-around items-center py-4 px-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-3xl">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${isActive
                                        ? 'text-indigo-400 scale-110'
                                        : 'text-text-muted hover:text-text-secondary'
                                    }`
                                }
                            >
                                <div className={`p-2 rounded-xl transition-all duration-300 ${window.location.pathname.startsWith(item.to) ? 'bg-indigo-500/10' : ''}`}>
                                    <Icon size={24} strokeWidth={window.location.pathname.startsWith(item.to) ? 2.5 : 2} />
                                </div>
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
