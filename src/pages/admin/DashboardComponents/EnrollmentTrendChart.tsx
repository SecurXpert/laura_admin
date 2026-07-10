import React from "react";
import { EnrollmentChartItem } from "./types";

interface EnrollmentTrendChartProps {
  enrollmentData: EnrollmentChartItem[];
}

const EnrollmentTrendChart: React.FC<EnrollmentTrendChartProps> = ({
  enrollmentData,
}) => {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#ECEEF2]/60 w-full min-w-0 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg md:text-[20px] font-semibold text-gray-800 truncate">
            Enrollment Trend
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Last 6 months
          </p>
        </div>
        {/* <div className="flex items-center gap-1 text-[#10B981] text-xs sm:text-sm font-semibold whitespace-nowrap">
          <span>↑</span>
          <span>+18.2%</span>
        </div> */}
      </div>

      {(() => {
        let monthlyTotals: Record<string, number> = {};

        enrollmentData.forEach((item) => {
          if (!monthlyTotals[item.month]) {
            monthlyTotals[item.month] = 0;
          }
          monthlyTotals[item.month] += item.students;
        });

        // Return early if no data
        if (Object.keys(monthlyTotals).length === 0) {
          return (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 mt-8">
              <p>No enrollment data available</p>
            </div>
          );
        }

        const months = Object.keys(monthlyTotals);
        const values = Object.values(monthlyTotals) as number[];

        // Calculate dynamic max scale (minimum scale of 12 for multiples of 3 ticks)
        const maxVal = Math.max(...values, 0);
        const maxScale = Math.max(Math.ceil(maxVal / 12) * 12, 12);

        // Map points to custom SVG grid coordinates
        // Chart area starts at x=55, ends at x=505 (width = 450)
        // Chart area starts at y=20, ends at y=180 (height = 160)
        const pointsList = values.map((val, i) => {
          const x = 55 + i * 90;
          const y = 180 - (val / maxScale) * 160;
          return { x, y };
        });

        // Build smooth Bezier Curve
        let pathD = `M ${pointsList[0].x} ${pointsList[0].y}`;
        for (let i = 1; i < pointsList.length; i++) {
          const p0 = pointsList[i - 1];
          const p1 = pointsList[i];
          const dx = (p1.x - p0.x) / 3;
          pathD += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`;
        }

        const fillD = `${pathD} L ${pointsList[pointsList.length - 1].x} 180 L ${pointsList[0].x} 180 Z`;

        return (
          <div className="w-full mt-auto">
            <div className="w-full aspect-[540/220] relative">
              <svg
                viewBox="0 0 540 220"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full overflow-visible"
              >
                {/* Horizontal Gridlines */}
                {[20, 60, 100, 140].map((yVal, idx) => (
                  <line
                    key={idx}
                    x1="55"
                    y1={yVal}
                    x2="515"
                    y2={yVal}
                    stroke="#E5E7EB"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                ))}

                {/* Vertical Gridlines */}
                {pointsList.map((p, idx) => (
                  <line
                    key={idx}
                    x1={p.x}
                    y1="20"
                    x2={p.x}
                    y2="180"
                    stroke="#E5E7EB"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                ))}

                {/* Y-Axis Line */}
                <line x1="55" y1="20" x2="55" y2="180" stroke="#D1D5DB" strokeWidth="1" />

                {/* X-Axis Line */}
                <line x1="55" y1="180" x2="515" y2="180" stroke="#D1D5DB" strokeWidth="1" />

                {/* Y-Axis Ticks */}
                {[20, 60, 100, 140, 180].map((yVal, idx) => (
                  <line key={idx} x1="50" y1={yVal} x2="55" y2={yVal} stroke="#D1D5DB" strokeWidth="1" />
                ))}

                {/* X-Axis Ticks */}
                {pointsList.map((p, idx) => (
                  <line key={idx} x1={p.x} y1="180" x2={p.x} y2="185" stroke="#D1D5DB" strokeWidth="1" />
                ))}

                {/* Y-Axis Labels */}
                <text x="45" y="24" textAnchor="end" className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans">{maxScale}</text>
                <text x="45" y="64" textAnchor="end" className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans">{maxScale * 0.75}</text>
                <text x="45" y="104" textAnchor="end" className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans">{maxScale * 0.5}</text>
                <text x="45" y="144" textAnchor="end" className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans">{maxScale * 0.25}</text>
                <text x="45" y="184" textAnchor="end" className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans">0</text>

                {/* X-Axis Labels */}
                {months.map((m, idx) => (
                  <text
                    key={m}
                    x={pointsList[idx].x}
                    y="204"
                    textAnchor="middle"
                    className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans"
                  >
                    {m}
                  </text>
                ))}

                {/* Area Gradient Fill */}
                <path d={fillD} fill="url(#enrollmentTrendAreaGradient)" />

                {/* Smooth Trend Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Dots and Labels at Data Points */}
                {pointsList.map((p, idx) => {
                  const val = values[idx];
                  return (
                    <g key={`point-group-${idx}`}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill="#6366F1"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        className="drop-shadow-sm"
                      />
                      {val > 0 && (
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          className="text-[11px] font-bold fill-[#4F46E5] font-sans"
                        >
                          {val}
                        </text>
                      )}
                    </g>
                  );
                })}

                <defs>
                  <linearGradient id="enrollmentTrendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default EnrollmentTrendChart;
