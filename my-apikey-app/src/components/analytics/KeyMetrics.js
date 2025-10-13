'use client';

import { useState, useEffect } from 'react';

/**
 * Animated counter component for displaying metrics
 */
function AnimatedCounter({ value, suffix = '', className = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000; // Animation duration in ms
    const steps = 60; // Animation steps
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className={className}>
      {typeof displayValue === 'number' && displayValue % 1 !== 0
        ? displayValue.toFixed(1)
        : displayValue
      }{suffix}
    </span>
  );
}

/**
 * Progress bar component for showing utilization
 */
function ProgressBar({ value, max = 100, color = 'blue', className = '' }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full transition-all duration-1000 ease-out ${
          color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
          color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
          color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
          'bg-gray-500'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

/**
 * Metric card component
 */
function MetricCard({ title, value, suffix = '', icon, color = 'blue', trend, className = '' }) {
  return (
    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20 hover:shadow-xl transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${
          color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
          color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
          color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
          color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
          'bg-gray-100 dark:bg-slate-700'
        }`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend > 0 ? 'text-green-600' :
            trend < 0 ? 'text-red-600' :
            'text-gray-500'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {trend > 0 ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              ) : trend < 0 ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
              )}
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${
          color === 'blue' ? 'text-blue-900 dark:text-blue-100' :
          color === 'green' ? 'text-green-900 dark:text-green-100' :
          color === 'purple' ? 'text-purple-900 dark:text-purple-100' :
          color === 'orange' ? 'text-orange-900 dark:text-orange-100' :
          'text-gray-900 dark:text-gray-100'
        }`}>
          <AnimatedCounter value={value} suffix={suffix} />
        </p>
      </div>
    </div>
  );
}

/**
 * Usage distribution component
 */
function UsageDistribution({ data, className = '' }) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">API Key Usage Distribution</h3>
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">🥧</div>
            <p>No keys to display</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">API Key Usage Distribution</h3>

      <div className="space-y-4">
        {data.slice(0, 5).map((key, index) => (
          <div key={index} className="flex items-center gap-4">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: key.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{key.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{key.usage} requests</p>
              </div>
              <ProgressBar value={key.usage} max={Math.max(...data.map(k => k.usage))} />
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {key.utilization}%
            </div>
          </div>
        ))}

        {data.length > 5 && (
          <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              +{data.length - 5} more keys
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main key metrics component
 */
export default function KeyMetrics({ analytics, loading, className = '' }) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { overview, keyPerformance } = analytics;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Requests"
          value={overview.totalRequests}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="blue"
          trend={5} // Simulated positive trend
        />

        <MetricCard
          title="Success Rate"
          value={overview.successRate}
          suffix="%"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          trend={0.1} // Simulated slight increase
        />

        <MetricCard
          title="Avg Response Time"
          value={overview.avgResponseTime}
          suffix="ms"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="purple"
          trend={-8} // Simulated improvement
        />

        <MetricCard
          title="Active Keys"
          value={overview.activeKeys}
          icon={
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7 6h-2m-6 0a6 6 0 01-7-6 6 6 0 0114 0M9 7a2 2 0 012-2m0 0a2 2 0 012 2m-2-2v2a2 2 0 01-2 2 2 2 0 01-2-2V7m0 0V5a2 2 0 012-2h0a2 2 0 012 2v2M7 7a2 2 0 012-2" />
            </svg>
          }
          color="orange"
          trend={2} // Simulated growth
        />
      </div>

      {/* Usage Distribution */}
      <UsageDistribution data={analytics.usageDistribution} />
    </div>
  );
}
