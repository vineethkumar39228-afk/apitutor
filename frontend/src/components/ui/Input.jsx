import React from 'react';

const Input = ({
    value,
    onChange,
    placeholder = 'Enter text...',
    ariaLabel,
    disabled = false
}) => {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            aria-label={ariaLabel || placeholder}
            disabled={disabled}
            style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: disabled ? '#f8fafc' : '#ffffff',
                color: '#0f172a'
            }}
        />
    );
};

export default Input;
