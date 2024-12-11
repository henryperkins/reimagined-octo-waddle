import React from 'react';

interface SliderProps {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  className?: string;
  id?: string;
  label?: string;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({
    value,
    min = 0,
    max = 100,
    step = 1,
    onValueChange,
    className = '',
    id,
    label = 'Slider'
  }, ref) => {
    const percentage = ((value[0] - min) / (max - min)) * 100;
    const inputId = id || `slider-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onValueChange([newValue]);
    };

    return (
      <div
        ref={ref}
        className={`relative w-full touch-none select-none ${className}`}
      >
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="absolute h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          />
        </div>
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent [-webkit-appearance:none] [-moz-appearance:none]"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[0]}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
