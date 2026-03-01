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
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '24px',
                padding: '10px 28px',
                borderRadius: '9999px',
                background: 'rgba(15, 20, 40, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                pointerEvents: 'auto',
            }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                                borderRadius: '12px',
                                color: isActive ? '#818cf8' : 'rgba(255,255,255,0.4)',
                                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                            })}
                        >
                            <Icon size={20} />
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};
