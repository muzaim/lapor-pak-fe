import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 2500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification Container in Top-Right Corner */}
      <div className="fixed top-5 right-5 z-50 space-y-2.5 max-w-xs w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur-md transition-all animate-in slide-in-from-top-3 fade-in duration-200 ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-rose-100 border-rose-700/80 shadow-rose-950/30'
                : toast.type === 'info'
                ? 'bg-sky-900/90 text-sky-100 border-sky-700/80 shadow-sky-950/30'
                : 'bg-slate-900/95 text-emerald-300 border-slate-700/80 shadow-black/40'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="truncate text-slate-100 font-medium">{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white cursor-pointer shrink-0 p-0.5 rounded-md hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
