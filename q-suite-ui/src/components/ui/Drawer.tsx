import React, { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}
const sizeStyles = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[480px]',
  xl: 'w-[600px]'
};
export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  position = 'right',
  size = 'md',
  children,
  footer
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };
  const positionStyles = {
    left: 'left-0',
    right: 'right-0'
  };
  const slideAnimation = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full'
  };
  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={`
          fixed inset-0 z-50 bg-bg-deep/60 backdrop-blur-sm
          transition-opacity duration-slow
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `} />


      {/* Drawer */}
      <div
        className={`
          fixed top-0 bottom-0 z-50 ${positionStyles[position]}
          ${sizeStyles[size]} max-w-[90vw]
          bg-surface-primary/95 backdrop-blur-xl
          border-l border-stroke-hairline
          shadow-xl
          transform transition-transform duration-slow ease-out
          ${slideAnimation[position]}
          flex flex-col
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-stroke-hairline shrink-0">
          <div>
            {title &&
            <h2
              id="drawer-title"
              className="text-lg font-semibold text-text-primary">

                {title}
              </h2>
            }
            {description &&
            <p className="text-sm text-text-tertiary mt-1">{description}</p>
            }
          </div>
          <button
            onClick={onClose}
            className="p-2 -m-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
            aria-label="Close drawer">

            <XIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer &&
        <div className="flex items-center justify-end gap-3 p-6 border-t border-stroke-hairline shrink-0">
            {footer}
          </div>
        }
      </div>
    </>);

}