import React from 'react';

const Button = ({
    children,
    onClick,
    type = 'button',
    disabled = false,
    variant = 'primary',
    isLoading = false,
    ...rest
}) => {
    const baseStyle = {
        padding: '10px 18px',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        border: 'none',
        transition: 'all var(--transition-base)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
    };

    const variants = {
        primary: {
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
        },
        secondary: {
            backgroundColor: 'var(--surface-overlay)',
            color: 'var(--text-primary)',
            border: '1px solid var(--surface-border)',
        },
        success: {
            background: 'linear-gradient(135deg, var(--brand-success), #059669)',
            color: '#ffffff',
        },
        danger: {
            background: 'linear-gradient(135deg, var(--brand-error), #DC2626)',
            color: '#ffffff',
        },
    };

    const hoverEffects = {
        onMouseEnter: (e) => {
            if (!disabled && !isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.filter = 'brightness(1.1)';
            }
        },
        onMouseLeave: (e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.filter = 'brightness(1)';
        },
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            style={{ ...baseStyle, ...variants[variant] }}
            {...hoverEffects}
            {...rest}
        >
            {isLoading ? (
                <>
                    <span style={{
                        width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff', borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite', display: 'inline-block'
                    }} />
                    Processing...
                </>
            ) : children}
        </button>
    );
};

export default Button;
