import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastMessage } from '../state/appReducer.ts';

interface ToastRegionProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function ToastRegion({ toast, onDismiss }: ToastRegionProps) {
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-2"
    >
      {toast && (
        <div
          className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-md ${
            toast.tone === 'error'
              ? 'border-[#e11d48]/50 bg-[#1e293b]/95 text-[#ffdada]'
              : toast.tone === 'info'
                ? 'border-[#0d9488]/50 bg-[#1e293b]/95 text-[#dae2fd]'
                : 'border-[#059669]/50 bg-[#1e293b]/95 text-[#dae2fd]'
          }`}
        >
          {toast.tone === 'error' ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5168]" aria-hidden="true" />
          ) : toast.tone === 'info' ? (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#6bd8cb]" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#68dba9]" aria-hidden="true" />
          )}
          <span className="flex-1 leading-snug">{toast.text}</span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="rounded p-0.5 text-[#bccac0] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
