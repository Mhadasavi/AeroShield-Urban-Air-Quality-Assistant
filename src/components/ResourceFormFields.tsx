import type { ResourceCategory, ResourcePriority } from '../../shared/types.ts';

export interface ResourceFormValues {
  title: string;
  category: ResourceCategory;
  priority: ResourcePriority;
  timeWindow: string;
  description: string;
  impactSummary: string;
  pm25ReductionPct: number;
  co2SavedKgPerMonth: number;
  costEstimate: string;
}

interface ResourceFormFieldsProps {
  values: ResourceFormValues;
  onChange: <K extends keyof ResourceFormValues>(key: K, value: ResourceFormValues[K]) => void;
}

const INPUT_CLASS =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-[#131b2e] px-3 py-2 text-sm text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]';

export function ResourceFormFields({ values, onChange }: ResourceFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="modal-title" className="block text-xs font-semibold text-[#bccac0]">
          Protocol Title
        </label>
        <input
          id="modal-title"
          type="text"
          required
          maxLength={120}
          value={values.title}
          onChange={(e) => onChange('title', e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="modal-category" className="block text-xs font-semibold text-[#bccac0]">
            Category
          </label>
          <select
            id="modal-category"
            value={values.category}
            onChange={(e) => onChange('category', e.target.value as ResourceCategory)}
            className={INPUT_CLASS}
          >
            <option value="routine">Low-Emission Routine</option>
            <option value="indoor-hack">Indoor Air Hack</option>
            <option value="sustainable-alt">Sustainable Alternative</option>
          </select>
        </div>
        <div>
          <label htmlFor="modal-priority" className="block text-xs font-semibold text-[#bccac0]">
            Priority
          </label>
          <select
            id="modal-priority"
            value={values.priority}
            onChange={(e) => onChange('priority', e.target.value as ResourcePriority)}
            className={INPUT_CLASS}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <label htmlFor="modal-window" className="block text-xs font-semibold text-[#bccac0]">
            Time Window
          </label>
          <input
            id="modal-window"
            type="text"
            required
            maxLength={60}
            value={values.timeWindow}
            onChange={(e) => onChange('timeWindow', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor="modal-desc" className="block text-xs font-semibold text-[#bccac0]">
          Action Steps
        </label>
        <textarea
          id="modal-desc"
          rows={2}
          required
          maxLength={600}
          value={values.description}
          onChange={(e) => onChange('description', e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="modal-impact" className="block text-xs font-semibold text-[#bccac0]">
          Direct Impact Explanation
        </label>
        <input
          id="modal-impact"
          type="text"
          required
          maxLength={300}
          value={values.impactSummary}
          onChange={(e) => onChange('impactSummary', e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="modal-pm25" className="block text-xs font-semibold text-[#bccac0]">
            PM2.5 Cut (%)
          </label>
          <input
            id="modal-pm25"
            type="number"
            min={0}
            max={80}
            value={values.pm25ReductionPct}
            onChange={(e) => onChange('pm25ReductionPct', Number(e.target.value))}
            className={`${INPUT_CLASS} font-mono tabular-nums`}
          />
        </div>
        <div>
          <label htmlFor="modal-co2" className="block text-xs font-semibold text-[#bccac0]">
            CO2 Saved (kg/mo)
          </label>
          <input
            id="modal-co2"
            type="number"
            min={0}
            max={2000}
            value={values.co2SavedKgPerMonth}
            onChange={(e) => onChange('co2SavedKgPerMonth', Number(e.target.value))}
            className={`${INPUT_CLASS} font-mono tabular-nums`}
          />
        </div>
        <div>
          <label htmlFor="modal-cost" className="block text-xs font-semibold text-[#bccac0]">
            Cost Estimate
          </label>
          <input
            id="modal-cost"
            type="text"
            maxLength={48}
            value={values.costEstimate}
            onChange={(e) => onChange('costEstimate', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
}
