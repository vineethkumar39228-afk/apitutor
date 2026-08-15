import React from 'react';

const Input = ({
    value,
    onChange,
    placeholder = 'Enter text...',
    ariaLabel,
    disabled = false,
    type = 'text',
    ...rest
}) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            aria-label={ariaLabel || placeholder}
            disabled={disabled}
            style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--surface-border)',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                backgroundColor: disabled ? 'var(--surface-overlay)' : 'var(--surface-input)',
                color: 'var(--text-primary)',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            }}
            onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--surface-border)';
                e.currentTarget.style.boxShadow = 'none';
            }}
            {...rest}
        />
    );
};

export default Input;
