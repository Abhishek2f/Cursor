'use client';

import { useMemo } from 'react';

/**
 * Custom SVG chart component for displaying usage trends over time
 */
export default function UsageChart({ data, title, height = 300, className = "" }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { points: [], maxValue: 1, average: 0 };
    }

    const maxValue = Math.max(...data.map(d => d.usage));
    const average = data.reduce((sum, d) => sum + d.usage, 0) / data.length;

    // Ensure maxValue is never 0 to prevent division by zero
    const safeMaxValue = Math.max(maxValue, 1);

    // Create SVG path points
    const chartWidth = 600;
    const chartHeight = height - 60; // Reserve space for labels
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - ((item.usage / safeMaxValue) * chartHeight);
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    return { points, maxValue: safeMaxValue, average, chartWidth, chartHeight };
  }, [data, height]);

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p>No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Usage Trend</span>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Max: {chartData.maxValue} | Avg: {Math.round(chartData.average)}
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${chartData.chartWidth} ${height}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1="0"
                y1={chartData.chartHeight * (1 - ratio) + 30}
                x2={chartData.chartWidth}
                y2={chartData.chartHeight * (1 - ratio) + 30}
                stroke="#e5e7eb dark:stroke-slate-600"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={chartData.chartWidth + 10}
                y={chartData.chartHeight * (1 - ratio) + 35}
                className="text-xs fill-gray-500 dark:fill-gray-400"
              >
                {Math.round(chartData.maxValue * ratio)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <path
            d={`${chartData.points} L ${chartData.chartWidth},${chartData.chartHeight + 30} L 0,${chartData.chartHeight + 30} Z`}
            fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
          />

          {/* Line */}
          <path
            d={chartData.points}
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * chartData.chartWidth;
            const safeMaxValue = Math.max(chartData.maxValue, 1); // Additional safety check
            const y = chartData.chartHeight - ((item.usage / safeMaxValue) * chartData.chartHeight) + 30;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                className="hover:r-6 transition-all duration-200"
              />
            );
          })}

          {/* X-axis labels */}
          {data.filter((_, index) => index % Math.ceil(data.length / 7) === 0).map((item, index) => {
            const x = ((index * Math.ceil(data.length / 7)) / (data.length - 1)) * chartData.chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={chartData.chartHeight + 50}
                className="text-xs fill-gray-500 dark:fill-gray-400"
                textAnchor="middle"
              >
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
