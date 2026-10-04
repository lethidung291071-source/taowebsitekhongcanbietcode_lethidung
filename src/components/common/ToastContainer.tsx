import React from 'react';
import { useEmulation } from '../../context/EmulationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useEmulation();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-200 bg-white text-slate-800 shadow-lg';
        let Icon = Info;
        let iconColor = 'text-blue-500';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-100 shadow-lg';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-200 bg-amber-50/95 text-amber-900 shadow-amber-100 shadow-lg';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600';
        } else if (toast.type === 'error') {
          borderClass = 'border-red-200 bg-red-50/95 text-red-900 shadow-red-100 shadow-lg';
          Icon = AlertCircle;
          iconColor = 'text-red-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight">{toast.title}</div>
              <div className="text-xs text-slate-600 mt-0.5 leading-snug">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors shrink-0"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
