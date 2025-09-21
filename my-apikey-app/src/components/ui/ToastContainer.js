'use client';

import { useToast } from '@/hooks/useToast';

export default function ToastContainer({ position = 'top-center' }) {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-center': return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-center': return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-3`}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${toast.bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in`}
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-lg font-bold">{toast.icon}</span>
            <span className="font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => hideToast(toast.id)}
            className="text-white hover:text-gray-200 text-xl leading-none ml-2"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
