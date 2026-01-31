import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon } from
'lucide-react';
type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}
interface ToastProps extends Toast {
  onDismiss: (id: string) => void;
}
const toastConfig: Record<
  ToastType,
  {
    icon: typeof CheckCircleIcon;
    color: string;
    bgColor: string;
  }> =
{
  success: {
    icon: CheckCircleIcon,
    color: 'text-success',
    bgColor: 'bg-success-dim border-success/20'
  },
  error: {
    icon: XCircleIcon,
    color: 'text-danger',
    bgColor: 'bg-danger-dim border-danger/20'
  },
  warning: {
    icon: AlertTriangleIcon,
    color: 'text-warning',
    bgColor: 'bg-warning-dim border-warning/20'
  },
  info: {
    icon: InfoIcon,
    color: 'text-info',
    bgColor: 'bg-info-dim border-info/20'
  }
};
function ToastItem({
  id,
  type,
  title,
  description,
  duration = 5000,
  onDismiss
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const config = toastConfig[type];
  const Icon = config.icon;
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(id), 200);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onDismiss]);
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 200);
  };
  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl
        bg-surface-elevated/95 backdrop-blur-xl
        border border-stroke-hairline
        shadow-lg
        transition-all duration-base
        ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-slide-in-right'}
      `}
      role="alert">

      <div className={`p-1 rounded-lg ${config.bgColor}`}>
        <Icon size={16} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description &&
        <p className="text-sm text-text-tertiary mt-0.5">{description}</p>
        }
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors duration-fast"
        aria-label="Dismiss">

        <XIcon size={14} />
      </button>
    </div>);

}
// Toast container and context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
const ToastContext = createContext<ToastContextType | null>(null);
export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [
    ...prev,
    {
      ...toast,
      id
    }]
    );
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast
      }}>

      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>);

}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
function ToastContainer({
  toasts,
  onDismiss



}: {toasts: Toast[];onDismiss: (id: string) => void;}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) =>
      <ToastItem key={toast.id} {...toast} onDismiss={onDismiss} />
      )}
    </div>);

}