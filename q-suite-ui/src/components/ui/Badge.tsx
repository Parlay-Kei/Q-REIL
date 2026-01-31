import React from 'react';
type BadgeVariant = 'status' | 'severity' | 'confidence' | 'default';
type BadgeColor =
'success' |
'warning' |
'danger' |
'info' |
'neutral' |
'cyan' |
'violet' |
'teal';
type BadgeSize = 'sm' | 'md';
interface BadgeProps {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}
const colorStyles: Record<BadgeColor, string> = {
  success: 'bg-success-dim text-success border-success/20',
  warning: 'bg-warning-dim text-warning border-warning/20',
  danger: 'bg-danger-dim text-danger border-danger/20',
  info: 'bg-info-dim text-info border-info/20',
  neutral: 'bg-surface-elevated text-text-secondary border-stroke-hairline',
  cyan: 'bg-accent-cyan-dim text-accent-cyan border-accent-cyan/20',
  violet: 'bg-accent-violet-dim text-accent-violet border-accent-violet/20',
  teal: 'bg-accent-teal-dim text-accent-teal border-accent-teal/20'
};
const dotColors: Record<BadgeColor, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-text-tertiary',
  cyan: 'bg-accent-cyan',
  violet: 'bg-accent-violet',
  teal: 'bg-accent-teal'
};
const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5'
};
export function Badge({
  variant = 'default',
  color = 'neutral',
  size = 'sm',
  dot = false,
  children,
  className = ''
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-md border
        ${colorStyles[color]}
        ${sizeStyles[size]}
        ${className}
      `}>

      {dot &&
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`} />
      }
      {children}
    </span>);

}