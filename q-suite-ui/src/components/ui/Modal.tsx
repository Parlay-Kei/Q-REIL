import React, { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}
const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  showCloseButton = true
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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
  if (!isOpen) return null;
  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}>

      <div
        ref={contentRef}
        className={`
          w-full ${sizeStyles[size]}
          bg-surface-primary/95 backdrop-blur-xl
          border border-stroke-hairline
          rounded-2xl shadow-xl
          animate-scale-in
          aurora-edge
        `}>

        {/* Header */}
        {(title || showCloseButton) &&
        <div className="flex items-start justify-between p-6 border-b border-stroke-hairline">
            <div>
              {title &&
            <h2
              id="modal-title"
              className="text-lg font-semibold text-text-primary">

                  {title}
                </h2>
            }
              {description &&
            <p className="text-sm text-text-tertiary mt-1">{description}</p>
            }
            </div>
            {showCloseButton &&
          <button
            onClick={onClose}
            className="p-2 -m-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
            aria-label="Close modal">

                <XIcon size={20} />
              </button>
          }
          </div>
        }

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer &&
        <div className="flex items-center justify-end gap-3 p-6 border-t border-stroke-hairline">
            {footer}
          </div>
        }
      </div>
    </div>);

}