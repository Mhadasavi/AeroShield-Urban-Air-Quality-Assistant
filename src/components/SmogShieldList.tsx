import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { calculateMemberExposureIndex, getAqiSeverityTone } from '../../shared/airMath.ts';
import type { ShieldMember } from '../../shared/types.ts';

interface SmogShieldListProps {
  ambientAqi: number;
  shields: ShieldMember[];
  maskOverrides: Record<string, ShieldMember['maskGrade']>;
  onChangeMask: (memberId: string, maskGrade: ShieldMember['maskGrade']) => void;
}

const MASK_OPTIONS: ShieldMember['maskGrade'][] = ['None', 'KN95', 'N95', 'P100'];

export function SmogShieldList({
  ambientAqi,
  shields,
  maskOverrides,
  onChangeMask,
}: SmogShieldListProps) {
  return (
    <section
      aria-labelledby="smog-shield-heading"
      className="glass-panel flex h-full flex-col justify-between rounded-2xl p-5"
    >
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="smog-shield-heading" className="text-lg font-semibold text-[#dae2fd]">
            Smog Shield Profiles
          </h2>
          <span className="text-xs font-medium text-[#bccac0]">Personal Exposure Index</span>
        </div>

        <ul className="space-y-3">
          {shields.map((member) => {
            const activeMask = maskOverrides[member.id] ?? member.maskGrade;
            const liveIndex = calculateMemberExposureIndex({
              ambientAqi,
              sensitivity: member.sensitivity,
              outdoorMinutes: member.outdoorMinutes,
              maskGrade: activeMask,
              indoorFiltration: member.indoorFiltration,
            });
            const tone = getAqiSeverityTone(liveIndex);
            const borderTone =
              tone === 'safe'
                ? 'border-[#059669]/45'
                : tone === 'moderate'
                  ? 'border-[#f59e0b]/45'
                  : 'border-[#e11d48]/50';
            const selectId = `mask-select-${member.id}`;

            return (
              <li
                key={member.id}
                className={`rounded-xl border bg-[#131b2e]/90 p-3.5 transition-colors ${borderTone}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#dae2fd]">{member.name}</span>
                      <span aria-hidden="true" className="text-[#87948b]">·</span>
                      <span className="text-xs text-[#bccac0]">{member.sensitivity}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#87948b]">
                      {member.role} · {member.outdoorMinutes} min outdoors
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 text-right font-mono tabular-nums">
                    {tone === 'safe' ? (
                      <CheckCircle2 className="h-4 w-4 text-[#68dba9]" aria-hidden="true" />
                    ) : tone === 'moderate' ? (
                      <AlertTriangle className="h-4 w-4 text-[#f59e0b]" aria-hidden="true" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-[#ff5168]" aria-hidden="true" />
                    )}
                    <span className="text-base font-bold text-[#dae2fd]">{liveIndex}</span>
                  </div>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[#bccac0]">{member.guidance}</p>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/5 pt-2.5">
                  <label htmlFor={selectId} className="text-xs font-medium text-[#bccac0]">
                    Respirator Grade
                  </label>
                  <select
                    id={selectId}
                    aria-label={`Respirator grade for ${member.name}`}
                    value={activeMask}
                    onChange={(e) =>
                      onChangeMask(member.id, e.target.value as ShieldMember['maskGrade'])
                    }
                    className="rounded-md border border-white/15 bg-[#0b1326] px-2.5 py-1 text-xs font-medium text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
                  >
                    {MASK_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade === 'None' ? 'No Mask' : `${grade} Fitted`}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-4 text-xs text-[#87948b]">
        Exposure index recalculates live using outdoor duration, respirator filtration factor, and respiratory sensitivity.
      </p>
    </section>
  );
}
