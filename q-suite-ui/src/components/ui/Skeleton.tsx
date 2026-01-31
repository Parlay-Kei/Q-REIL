import React from 'react';
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}
export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseStyles = 'skeleton-shimmer rounded';
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };
  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined)
  };
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({
          length: lines
        }).map((_, i) =>
        <div
          key={i}
          className={`${baseStyles} ${variantStyles.text}`}
          style={{
            ...style,
            width: i === lines - 1 ? '75%' : '100%'
          }} />

        )}
      </div>);

  }
  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style} />);


}
// Preset skeleton components for common use cases
export function SkeletonCard({ className = '' }: {className?: string;}) {
  return (
    <div
      className={`p-6 rounded-xl bg-surface-primary border border-stroke-hairline ${className}`}>

      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
    </div>);

}
export function SkeletonTable({
  rows = 5,
  columns = 4



}: {rows?: number;columns?: number;}) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-stroke-hairline">
        {Array.from({
          length: columns
        }).map((_, i) =>
        <Skeleton
          key={i}
          variant="text"
          width={`${100 / columns}%`}
          height={14} />

        )}
      </div>
      {/* Rows */}
      {Array.from({
        length: rows
      }).map((_, rowIndex) =>
      <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({
          length: columns
        }).map((_, colIndex) =>
        <Skeleton
          key={colIndex}
          variant="text"
          width={`${100 / columns}%`}
          height={16} />

        )}
        </div>
      )}
    </div>);

}
export function SkeletonTimeline({ items = 4 }: {items?: number;}) {
  return (
    <div className="space-y-4">
      {Array.from({
        length: items
      }).map((_, i) =>
      <div key={i} className="flex gap-4">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1">
            <Skeleton variant="text" width="70%" className="mb-2" />
            <Skeleton variant="text" width="50%" height={12} />
          </div>
        </div>
      )}
    </div>);

}