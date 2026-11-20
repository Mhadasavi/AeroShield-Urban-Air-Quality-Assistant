import { X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ActionResource, CreateResourceInput, VerticalId } from '../../shared/types.ts';
import { useFocusTrap } from '../hooks/useFocusTrap.ts';
import { ResourceFormFields, type ResourceFormValues } from './ResourceFormFields.tsx';

interface ResourceModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  verticalId: VerticalId;
  initial?: ActionResource;
  onClose: () => void;
  onSubmit: (payload: CreateResourceInput) => Promise<void>;
}

const DEFAULT_VALUES: ResourceFormValues = {
  title: '',
  category: 'routine',
  priority: 'High',
  timeWindow: '12:30 – 15:00',
  description: '',
  impactSummary: '',
  pm25ReductionPct: 28,
  co2SavedKgPerMonth: 24,
  costEstimate: '$0 / month',
};

export function ResourceModal({
  open,
  mode,
  verticalId,
  initial,
  onClose,
  onSubmit,
}: ResourceModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<ResourceFormValues>(DEFAULT_VALUES);
  const [saving, setSaving] = useState(false);

  useFocusTrap(dialogRef, open, onClose);

  useEffect(() => {
    if (!open) return;
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setValues(
      initial
        ? {
            title: initial.title,
            category: initial.category,
            priority: initial.priority,
            timeWindow: initial.timeWindow,
            description: initial.description,
            impactSummary: initial.impactSummary,
            pm25ReductionPct: initial.pm25ReductionPct,
            co2SavedKgPerMonth: initial.co2SavedKgPerMonth,
            costEstimate: initial.costEstimate,
          }
        : DEFAULT_VALUES
    );
  }, [open, initial]);

  if (!open) return null;

  const handleFieldChange = <K extends keyof ResourceFormValues>(
    key: K,
    value: ResourceFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ verticalId, ...values });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1326]/80 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-modal-title"
        className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0f172a] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <h2 id="resource-modal-title" className="text-lg font-bold text-[#dae2fd]">
            {mode === 'edit' ? 'Edit Air Quality Protocol' : 'Add Air Quality Protocol'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-[#bccac0] hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <ResourceFormFields values={values} onChange={handleFieldChange} />

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-[#bccac0] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#059669] px-4 py-2 text-sm font-semibold text-white hover:bg-[#047857] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
            >
              {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Protocol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
