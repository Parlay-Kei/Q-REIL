import React from 'react';
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}
const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};
const statusSizes: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2'
};
const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-text-quaternary',
  busy: 'bg-danger',
  away: 'bg-warning'
};
function getInitials(name: string): string {
  return name.
  split(' ').
  map((part) => part[0]).
  join('').
  toUpperCase().
  slice(0, 2);
}
function getColorFromName(name: string): string {
  const colors = [
  'from-accent-cyan to-accent-teal',
  'from-accent-violet to-accent-cyan',
  'from-accent-teal to-success',
  'from-warning to-danger',
  'from-accent-cyan to-accent-violet'];

  const index = name.
  split('').
  reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}
export function Avatar({
  src,
  name,
  size = 'md',
  status,
  className = ''
}: AvatarProps) {
  const initials = getInitials(name);
  const gradientColor = getColorFromName(name);
  return (
    <div className={`relative inline-flex ${className}`}>
      {src ?
      <img
        src={src}
        alt={name}
        className={`
            rounded-full object-cover
            ring-1 ring-stroke-hairline
            ${sizeStyles[size]}
          `} /> :


      <div
        className={`
            rounded-full flex items-center justify-center font-semibold
            bg-gradient-to-br ${gradientColor} text-bg-deep
            ring-1 ring-white/10
            ${sizeStyles[size]}
          `}>

          {initials}
        </div>
      }
      {status &&
      <span
        className={`
            absolute bottom-0 right-0 rounded-full
            border-bg-deep
            ${statusSizes[size]}
            ${statusColors[status]}
          `} />

      }
    </div>);

}