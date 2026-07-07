"use client";

/** 24ヶ月累積純削減額グラフ (初期投資控除後)。SVG直書き。 (要件定義書 6-A-3-3) */
export function CumulativeChart({
  cumulativeByMonth,
  breakEvenMonth,
}: {
  cumulativeByMonth: number[];
  breakEvenMonth: number | null;
}) {
  const width = 720;
  const height = 220;
  const paddingLeft = 8;
  const paddingRight = 8;
  const paddingTop = 26;
  const paddingBottom = 28;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minVal = Math.min(...cumulativeByMonth, 0);
  const maxVal = Math.max(...cumulativeByMonth, 0);
  const range = maxVal - minVal || 1;

  const yFor = (v: number) => paddingTop + chartHeight * (1 - (v - minVal) / range);
  const zeroY = yFor(0);
  const barWidth = chartWidth / cumulativeByMonth.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="累積純削減額推移グラフ（24ヶ月・初期投資控除後）">
      <line x1={paddingLeft} y1={zeroY} x2={width - paddingRight} y2={zeroY} stroke="#c7cad9" strokeWidth={1} />
      {cumulativeByMonth.map((v, i) => {
        const x = paddingLeft + i * barWidth + barWidth * 0.15;
        const w = barWidth * 0.7;
        const barTop = v >= 0 ? yFor(v) : zeroY;
        const barHeight = Math.max(Math.abs(yFor(v) - zeroY), 0.5);
        const isBreakEven = breakEvenMonth === i + 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y={barTop}
              width={w}
              height={barHeight}
              fill={v >= 0 ? "#10b981" : "#ef4444"}
              opacity={isBreakEven ? 1 : 0.85}
            />
            {isBreakEven ? (
              <text x={x + w / 2} y={barTop - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f1730">
                投資回収
              </text>
            ) : null}
          </g>
        );
      })}
      {cumulativeByMonth.map((_, i) =>
        (i + 1) % 3 === 0 ? (
          <text
            key={`label-${i}`}
            x={paddingLeft + i * barWidth + barWidth / 2}
            y={height - 6}
            textAnchor="middle"
            fontSize={12}
            fill="#6b7290"
          >
            {i + 1}
          </text>
        ) : null,
      )}
    </svg>
  );
}
