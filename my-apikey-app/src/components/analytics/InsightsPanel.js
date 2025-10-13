'use client';

/**
 * Insight card component for displaying recommendations and insights
 */
function InsightCard({ insight, className = '' }) {
  const getIcon = () => {
    switch (insight.type) {
      case 'warning':
        return (
          <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'tip':
        return (
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBgColor = () => {
    switch (insight.type) {
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'tip':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'info':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} ${className}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{insight.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{insight.message}</p>
          <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            {insight.action} →
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Performance summary component
 */
function PerformanceSummary({ analytics, className = '' }) {
  if (!analytics || !analytics.keyPerformance) {
    return null;
  }

  const { keyPerformance } = analytics;

  return (
    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rate Limit Utilization</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{keyPerformance.rateLimitUtilization}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                  keyPerformance.rateLimitUtilization > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  keyPerformance.rateLimitUtilization > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${keyPerformance.rateLimitUtilization}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{keyPerformance.totalKeys}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Keys</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{keyPerformance.activeKeys}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Keys</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {keyPerformance.mostUsedKey && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🏆 Top Performer</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{keyPerformance.mostUsedKey.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{keyPerformance.mostUsedKey.usage}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">requests</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{keyPerformance.mostUsedKey.utilization}% utilized</span>
              </div>
            </div>
          )}

          {keyPerformance.leastUsedKey && keyPerformance.leastUsedKey.usage > 0 && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-700">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">⚡ Most Efficient</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{keyPerformance.leastUsedKey.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{keyPerformance.leastUsedKey.usage}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">requests</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{keyPerformance.leastUsedKey.utilization}% utilized</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main insights panel component
 */
export default function InsightsPanel({ analytics, className = '' }) {
  if (!analytics || !analytics.insights) {
    return null;
  }

  const { insights } = analytics;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Summary */}
      <PerformanceSummary analytics={analytics} />

      {/* Insights and Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Insights & Recommendations</h3>

          <div className="space-y-3">
            {insights.recommendations.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Efficiency Score */}
      {insights.efficiencyScore !== undefined && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">API Efficiency Score</h3>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{insights.efficiencyScore}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Excellent</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                insights.efficiencyScore > 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                insights.efficiencyScore > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${insights.efficiencyScore}%` }}
            />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your API usage is highly efficient! This score reflects optimal rate limit utilization and balanced key distribution.
          </p>
        </div>
      )}
    </div>
  );
}
