import React from 'react';
import { Button as ShadcnButton } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'default',
  size = 'default',
  isLoading = false,
  loadingText,
  icon,
  className = '',
  disabled,
  ...props
}, ref) => {
  return (
    <ShadcnButton
      ref={ref}
      variant={variant}
      size={size}
      disabled={isLoading || disabled}
      className={`relative ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </ShadcnButton>
  );
});

Button.displayName = 'Button';

export { Button, type ButtonProps };
