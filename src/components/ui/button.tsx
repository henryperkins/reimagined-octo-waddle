import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'outline':
        return 'border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800';
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100';
      case 'ghost':
        return 'hover:bg-gray-100 dark:hover:bg-gray-800';
      case 'link':
        return 'text-blue-500 hover:underline';
      default:
        return 'bg-blue-500 text-white hover:bg-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-sm';
      case 'lg':
        return 'h-12 px-8 text-lg';
      case 'icon':
        return 'h-8 w-8';
      default:
        return 'h-10 px-4';
    }
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50';
  const classes = `${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`;

  return (
    <button
      className={classes}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';
