import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeToast } from '../store/slices/uiSlice';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export default function ToastContainer() {
  const { toasts } = useAppSelector((s) => s.ui);
  const dispatch = useAppDispatch();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          title={t.title}
          onClose={() => dispatch(removeToast(t.id))}
        />
      ))}
    </div>
  );
}

function Toast({
  message,
  type,
  title,
  onClose,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const config = {
    success: { bg: 'bg-emerald-900/90', icon: CheckCircle, border: 'border-emerald-600' },
    error: { bg: 'bg-red-900/90', icon: AlertCircle, border: 'border-red-600' },
    info: { bg: 'bg-slate-800/90', icon: Info, border: 'border-slate-600' },
  }[type];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${config.bg} ${config.border} shadow-lg`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-white text-sm">{title}</p>}
        <p className="text-slate-200 text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
