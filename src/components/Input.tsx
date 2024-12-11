import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const baseClasses = 'input';
    const errorClasses = error ? 'input-error' : '';
    const classes = [baseClasses, errorClasses, className].filter(Boolean).join(' ');

    return (
        <div className="input-container">
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={classes}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={
                    error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
                }
                {...props}
            />
            {error && (
                <span id={`${inputId}-error`} className="input-error-text">
                    {error}
                </span>
            )}
            {helperText && !error && (
                <span id={`${inputId}-helper`} className="input-helper-text">
                    {helperText}
                </span>
            )}
        </div>
    );
}
