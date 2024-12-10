import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const baseClasses = 'textarea';
    const errorClasses = error ? 'textarea-error' : '';
    const classes = [baseClasses, errorClasses, className].filter(Boolean).join(' ');

    return (
        <div className="textarea-container">
            {label && (
                <label htmlFor={textareaId} className="textarea-label">
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                className={classes}
                aria-invalid={!!error}
                aria-describedby={
                    error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
                }
                {...props}
            />
            {error && (
                <span id={`${textareaId}-error`} className="textarea-error-text">
                    {error}
                </span>
            )}
            {helperText && !error && (
                <span id={`${textareaId}-helper`} className="textarea-helper-text">
                    {helperText}
                </span>
            )}
        </div>
    );
};
