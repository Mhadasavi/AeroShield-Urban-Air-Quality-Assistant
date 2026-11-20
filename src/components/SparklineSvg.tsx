interface SparklineSvgProps {
  points: number[];
  strokeColor: string;
  label: string;
}

export function SparklineSvg({ points, strokeColor, label }: SparklineSvgProps) {
  if (points.length < 2) return null;
  const width = 96;
  const height = 34;
  const pad = 4;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((val, idx) => {
    const x = pad + (idx / (points.length - 1)) * (width - pad * 2);
    const y = height - pad - ((val - min) / span) * (height - pad * 2);
    return { x, y };
  });

  const pathData = coords
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');
  const last = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${label} 6-hour trend`}
      className="shrink-0 overflow-visible"
    >
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="3" fill={strokeColor} />
    </svg>
  );
}
