import { useState } from 'react';
import { calculateAqiFromPm25, calculateIndoorClearanceMinutes } from '../../shared/airMath.ts';

interface ImpactSimulatorProps {
  defaultPm25: number;
}

export function ImpactSimulator({ defaultPm25 }: ImpactSimulatorProps) {
  const [roomVolumeM3, setRoomVolumeM3] = useState(48);
  const [cadrM3h, setCadrM3h] = useState(360);
  const [startingPm25, setStartingPm25] = useState(Math.max(35, Math.round(defaultPm25 * 0.65)));

  const minutesToSafe = calculateIndoorClearanceMinutes({
    roomVolumeM3,
    cadrM3h,
    currentPm25: startingPm25,
    targetPm25: 12,
  });
  const ach = Number((cadrM3h / roomVolumeM3).toFixed(1));
  const startAqi = calculateAqiFromPm25(startingPm25);

  const curvePoints = Array.from({ length: 13 }, (_, idx) => {
    const mins = idx * 5;
    const pm = Math.max(8, startingPm25 * Math.exp(-(ach * (mins / 60))));
    return { mins, pm };
  });

  const width = 420;
  const height = 132;
  const padX = 28;
  const padY = 16;
  const maxY = Math.max(startingPm25, 40);

  const path = curvePoints
    .map((pt, idx) => {
      const x = padX + (pt.mins / 60) * (width - padX * 2);
      const y = height - padY - (pt.pm / maxY) * (height - padY * 2);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const safeY = height - padY - (12 / maxY) * (height - padY * 2);

  return (
    <section id="impact-lab" aria-labelledby="impact-lab-heading" className="glass-panel rounded-2xl p-6">
      <div className="flex flex-col gap-1 border-b border-white/10 pb-4 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="impact-lab-heading" className="text-xl font-bold text-[#dae2fd]">
          Indoor Filtration Clearance Lab
        </h2>
        <span className="font-mono text-xs text-[#6bd8cb] tabular-nums">
          Target WHO Baseline: 12 µg/m³ PM2.5
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-volume" className="font-semibold text-[#bccac0]">
                Room Volume (m³)
              </label>
              <span className="font-mono font-semibold text-[#dae2fd] tabular-nums">
                {roomVolumeM3} m³
              </span>
            </div>
            <input
              id="sim-volume"
              type="range"
              min={18}
              max={160}
              step={2}
              value={roomVolumeM3}
              onChange={(e) => setRoomVolumeM3(Number(e.target.value))}
              className="mt-2 w-full accent-[#059669]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-cadr" className="font-semibold text-[#bccac0]">
                Purifier / Corsi-Rosenthal CADR (m³/h)
              </label>
              <span className="font-mono font-semibold text-[#dae2fd] tabular-nums">
                {cadrM3h} m³/h
              </span>
            </div>
            <input
              id="sim-cadr"
              type="range"
              min={80}
              max={720}
              step={20}
              value={cadrM3h}
              onChange={(e) => setCadrM3h(Number(e.target.value))}
              className="mt-2 w-full accent-[#0d9488]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-pm25" className="font-semibold text-[#bccac0]">
                Starting Indoor PM2.5 (µg/m³)
              </label>
              <span className="font-mono font-semibold text-[#dae2fd] tabular-nums">
                {startingPm25} µg/m³ (AQI {startAqi})
              </span>
            </div>
            <input
              id="sim-pm25"
              type="range"
              min={15}
              max={260}
              step={5}
              value={startingPm25}
              onChange={(e) => setStartingPm25(Number(e.target.value))}
              className="mt-2 w-full accent-[#f59e0b]"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#131b2e] p-4 lg:col-span-7">
          <div className="grid grid-cols-3 gap-4 border-b border-white/10 pb-3 font-mono tabular-nums">
            <div>
              <div className="text-[11px] text-[#87948b]">Time to Safe Air</div>
              <div className="text-2xl font-bold text-[#68dba9]">{minutesToSafe} min</div>
            </div>
            <div>
              <div className="text-[11px] text-[#87948b]">Air Changes / Hr</div>
              <div className="text-2xl font-bold text-[#6bd8cb]">{ach} ACH</div>
            </div>
            <div>
              <div className="text-[11px] text-[#87948b]">60-Min Final PM2.5</div>
              <div className="text-2xl font-bold text-[#dae2fd]">
                {Math.round(curvePoints[curvePoints.length - 1].pm)} µg/m³
              </div>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="60-minute indoor PM2.5 filtration decay curve"
            className="mt-3 h-36 w-full"
          >
            <line
              x1={padX}
              y1={safeY}
              x2={width - padX}
              y2={safeY}
              stroke="#68dba9"
              strokeDasharray="4 4"
              strokeOpacity="0.65"
            />
            <text x={width - padX - 88} y={safeY - 4} fill="#68dba9" fontSize="10" fontFamily="JetBrains Mono">
              WHO Safe (12)
            </text>
            <path d={path} fill="none" stroke="#6bd8cb" strokeWidth="2.5" strokeLinecap="round" />
            <text x={padX} y={height - 2} fill="#87948b" fontSize="10" fontFamily="JetBrains Mono">
              0 min
            </text>
            <text x={width / 2 - 14} y={height - 2} fill="#87948b" fontSize="10" fontFamily="JetBrains Mono">
              30 min
            </text>
            <text x={width - padX - 30} y={height - 2} fill="#87948b" fontSize="10" fontFamily="JetBrains Mono">
              60 min
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
