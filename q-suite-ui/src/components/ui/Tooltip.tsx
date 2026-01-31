import React, { useEffect, useState, useRef } from 'react';
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}
export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };
  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-surface-elevated border-x-transparent border-b-transparent',
    bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-b-surface-elevated border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-surface-elevated border-y-transparent border-r-transparent',
    right:
    'right-full top-1/2 -translate-y-1/2 border-r-surface-elevated border-y-transparent border-l-transparent'
  };
  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}>

      {children}
      {isVisible &&
      <div
        className={`
            absolute z-50 ${positionStyles[position]}
            px-3 py-1.5 rounded-lg
            bg-surface-elevated/95 backdrop-blur-xl
            border border-stroke-hairline
            text-sm text-text-primary
            shadow-lg
            animate-fade-in
            whitespace-nowrap
          `}
        role="tooltip">

          {content}
          <div
          className={`
              absolute w-0 h-0 border-4
              ${arrowStyles[position]}
            `} />

        </div>
      }
    </div>);

}