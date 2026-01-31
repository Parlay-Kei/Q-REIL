import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { SearchIcon } from 'lucide-react';
interface InputProps extends
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'search';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  error?: string;
  label?: string;
}
const sizeStyles = {
  sm: 'h-8 text-sm px-3',
  md: 'h-10 text-base px-4',
  lg: 'h-12 text-lg px-5'
};
const iconPadding = {
  sm: 'pl-8',
  md: 'pl-10',
  lg: 'pl-12'
};
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
  {
    variant = 'default',
    size = 'md',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    error,
    label,
    className = '',
    id,
    ...props
  },
  ref) =>
  {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const Icon = variant === 'search' ? SearchIcon : LeftIcon;
    return (
      <div className="w-full">
        {label &&
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-secondary mb-1.5">

            {label}
          </label>
        }
        <div className="relative">
          {Icon &&
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
            </div>
          }
          <input
            ref={ref}
            id={inputId}
            className={`
            w-full rounded-lg
            bg-surface-primary/60 backdrop-blur-xl
            border border-stroke-hairline
            text-text-primary placeholder:text-text-quaternary
            transition-all duration-base ease-out
            hover:border-stroke-subtle hover:bg-surface-primary/80
            focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 focus:bg-surface-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-danger/50 focus:border-danger focus:ring-danger/30' : ''}
            ${sizeStyles[size]}
            ${Icon ? iconPadding[size] : ''}
            ${RightIcon ? 'pr-10' : ''}
            ${className}
          `}
            {...props} />

          {RightIcon &&
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              <RightIcon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
            </div>
          }
        </div>
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      </div>);

  }
);
Input.displayName = 'Input';