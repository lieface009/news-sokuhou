import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    glass?: boolean;
    hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    glass = true,
    hoverEffect = false,
    ...props
}) => {
    const baseClasses = glass ? 'glass-panel' : 'bg-secondary rounded-lg';
    const hoverClasses = hoverEffect ? 'transition-all duration-300 hover:shadow-glow hover:-translate-y-1' : '';

    return (
        <div
            className={`${baseClasses} p-4 ${hoverClasses} ${className}`}
            style={{
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, background 0.3s ease',
            }}
            {...props}
        >
            {children}
        </div>
    );
};
