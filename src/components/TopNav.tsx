import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Bookmark, CalendarDays, Settings } from 'lucide-react';

export const TopNav: React.FC = () => {
    const navItems = [
        { to: '/home', icon: Home, label: 'Home' },
        { to: '/keywords', icon: Search, label: 'Search' },
        { to: '/favorites', icon: Bookmark, label: 'Saved' },
        { to: '/calendar', icon: CalendarDays, label: 'History' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] px-4 pt-4 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                <div className="glass-panel flex justify-center items-center gap-6 py-3 px-6 rounded-full shadow-2xl border border-white/10 backdrop-blur-3xl">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = window.location.pathname.startsWith(item.to);
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex flex-col items-center justify-center transition-all duration-300 ${isActive
                                        ? 'text-indigo-400 scale-110'
                                        : 'text-white/40 hover:text-white/80'
                                    }`
                                }
                            >
                                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-500/10' : ''}`}>
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
