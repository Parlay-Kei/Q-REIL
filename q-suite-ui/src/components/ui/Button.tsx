import React from 'react';
import type { LucideIcon } from 'lucide-react';
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  isLoading?: boolean;
  children: React.ReactNode;
}
const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-accent-cyan to-[#38B8E0] text-bg-deep font-semibold
    hover:shadow-glow-cyan hover:brightness-110
    active:brightness-95
  `,
  secondary: `
    bg-surface-elevated/80 backdrop-blur-xl text-text-primary border border-stroke-hairline
    hover:bg-surface-hover hover:border-stroke-subtle
    active:bg-surface-primary
  `,
  ghost: `
    bg-transparent text-text-secondary
    hover:bg-surface-primary hover:text-text-primary
    active:bg-surface-elevated
  `,
  danger: `
    bg-danger/10 text-danger border border-danger/20
    hover:bg-danger/20 hover:border-danger/30
    active:bg-danger/25
  `
};
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-base gap-2 rounded-lg',
  lg: 'h-12 px-6 text-lg gap-2.5 rounded-lg'
};
const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18
};
export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-base ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-deep
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={isDisabled}
      {...props}>

      {isLoading ?
      <svg
        className="animate-spin"
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 24 24"
        fill="none">

          <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3" />

          <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />

        </svg> :
      LeftIcon ?
      <LeftIcon size={iconSizes[size]} /> :
      null}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon size={iconSizes[size]} />}
    </button>);

}