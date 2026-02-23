import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    icon,
    className = '',
    ...props
}) => {
    let baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 overflow-hidden outline-none';

    // Custom Vanilla CSS classes corresponding to variants
    let variantStyles = '';
    switch (variant) {
        case 'primary':
            variantStyles = 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] shadow-md hover:shadow-glow hover:-translate-y-0.5';
            break;
        case 'secondary':
            variantStyles = 'bg-bg-glass border border-border-glass text-white hover:bg-bg-glass-hover hover:-translate-y-0.5';
            break;
        case 'danger':
            variantStyles = 'bg-[var(--danger)] text-white hover:bg-red-600 shadow-md hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]';
            break;
        case 'ghost':
            variantStyles = 'bg-transparent text-text-secondary hover:text-white hover:bg-white/5';
            break;
    }

    let sizeStyles = '';
    switch (size) {
        case 'sm': sizeStyles = 'px-3 py-1.5 text-sm'; break;
        case 'md': sizeStyles = 'px-4 py-2 text-base'; break;
        case 'lg': sizeStyles = 'px-6 py-3 text-lg'; break;
    }

    return (
        <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props}>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
            {variant === 'primary' && (
                <span className="absolute inset-0 rounded-md opacity-20 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, transparent 50%, white 100%)' }} />
            )}
        </button>
    );
};
