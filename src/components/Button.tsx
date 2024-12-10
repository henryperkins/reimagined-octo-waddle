import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'default',
    size = 'default',
    isLoading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseClasses = 'button';
    const variantClasses = {
        default: 'button-default',
        primary: 'button-primary',
        ghost: 'button-ghost'
    };
    const sizeClasses = {
        default: 'button-default-size',
        sm: 'button-sm',
        lg: 'button-lg'
    };

    const classes = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isLoading ? 'button-loading' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <span className="loading-spinner" />
            ) : icon ? (
                <span className="button-icon">{icon}</span>
            ) : null}
            {children}
        </button>
    );
};
