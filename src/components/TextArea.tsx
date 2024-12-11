import React, { useEffect, useRef } from 'react';
import { cn } from '@lib/utils';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  maxHeight?: number;
  error?: boolean;
  helperText?: string;
  label?: string;
  containerClassName?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  autoResize = true,
  maxHeight = 400,
  error = false,
  helperText,
  label,
  className,
  containerClassName,
  onChange,
  ...props
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    if (autoResize) {
      adjustHeight();
    }
  }, [props.value, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      adjustHeight();
    }
    onChange?.(e);
  };

  return (
    <div className={cn("relative", containerClassName)}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium mb-1 text-foreground"
        >
          {label}
        </label>
      )}
      <textarea
        ref={(node) => {
          // Handle both refs
          textareaRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          autoResize && "overflow-hidden",
          className
        )}
        onChange={handleChange}
        {...props}
      />
      {helperText && (
        <p 
          className={cn(
            "mt-1 text-sm",
            error ? "text-destructive" : "text-muted-foreground"
          )}>
          {helperText}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export { TextArea, type TextAreaProps };

// Markdown-enabled TextArea component
export const MarkdownTextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  className,
  ...props
}, ref) => {
  return (
    <TextArea
      ref={ref}
      className={cn(
        "font-mono",
        className
      )}
      {...props}
    />
  );
});
