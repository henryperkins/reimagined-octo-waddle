import React from 'react';

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'role' | 'onClick' | 'aria-checked'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className = '', ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked ? "true" : "false"}
        data-state={checked ? 'checked' : 'unchecked'}
        onClick={() => onCheckedChange(!checked)}
        ref={ref}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
          transition-colors duration-200 ease-in-out focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-blue-500
          ${checked ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}
          ${className}
        `}
        {...props}
      >
        <span className="sr-only">Toggle switch</span>
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow-lg ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';
