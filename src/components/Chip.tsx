import React from 'react';

interface ChipProps extends React.HTMLAttributes<HTMLButtonElement> {
    label: string;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
    colorPrimary?: string;
}

export const Chip: React.FC<ChipProps> = ({
    label,
    selected = false,
    onClick,
    className = '',
    colorPrimary = 'var(--accent-primary)'
}) => {
    return (
        <button
            onClick={onClick}
            className={`relative overflow-hidden rounded-full px-4 py-2 font-medium text-sm transition-all duration-300 
        ${selected
                    ? 'text-white shadow-glow'
                    : 'text-text-secondary bg-bg-glass hover:bg-bg-glass-hover hover:text-white border border-border-glass'
                } ${className}`}
            style={{
                background: selected ? `linear-gradient(135deg, ${colorPrimary}, var(--accent-secondary))` : '',
                border: selected ? '1px solid transparent' : '',
                transform: selected ? 'scale(1.05)' : 'scale(1)',
            }}
        >
            {label}
            {selected && (
                <span
                    className="absolute inset-0 rounded-full opacity-50"
                    style={{
                        boxShadow: `inset 0 0 10px rgba(255,255,255,0.3)`
                    }}
                />
            )}
        </button>
    );
};
