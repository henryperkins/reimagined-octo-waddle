import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm
          placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50
          dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100
          dark:placeholder:text-gray-400 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
