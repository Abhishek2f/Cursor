'use client';

import { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutRefs = useRef(new Map());

  const getIcon = useCallback((type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      case 'delete': return '✗';
      case 'create': return '✓';
      case 'update': return '✓';
      default: return '✓';
    }
  }, []);

  const getBgColor = useCallback((type) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info':
      case 'create':
      case 'update': return 'bg-blue-500';
      case 'delete': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();

    const newToast = {
      id,
      message,
      type,
      icon: getIcon(type),
      bgColor: getBgColor(type)
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-hide after duration
    if (duration > 0) {
      const timeout = setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
      timeoutRefs.current.set(id, timeout);
    }

    return id;
  }, [getIcon, getBgColor]);

  const hideToast = useCallback((id) => {
    // Clear timeout if it exists
    if (timeoutRefs.current.has(id)) {
      clearTimeout(timeoutRefs.current.get(id));
      timeoutRefs.current.delete(id);
    }

    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []); // Remove dependency on itself to avoid circular dependency

  const hideAll = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    setToasts([]);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    // Capture ref value to avoid stale closure issues
    const currentTimeouts = timeoutRefs.current;
    return () => {
      currentTimeouts.forEach(timeout => clearTimeout(timeout));
      currentTimeouts.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, hideAll }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
