import React from 'react';

const Button = ({
    children,
    onClick,
    type = 'button',
    disabled = false,
    variant = 'primary',
    isLoading = false
}) => {
    // Base styles applied to all buttons
    const baseStyle = {
        padding: '8px 16px',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.7 : 1,
        border: 'none',
        transition: 'all 0.2s ease',
    };

    // Variant-specific styles
    const variants = {
        primary: {
            backgroundColor: '#0ea5e9',
            color: '#ffffff',
        },
        secondary: {
            backgroundColor: '#e2e8f0',
            color: '#334155',
        },
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            style={{ ...baseStyle, ...variants[variant] }}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};

export default Button;
