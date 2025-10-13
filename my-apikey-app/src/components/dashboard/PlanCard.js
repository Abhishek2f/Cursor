'use client';

import { useRouter } from 'next/navigation';

export default function PlanCard({ planName = "Researcher", totalUsage = 24, usageLimit = 1000 }) {
  const router = useRouter();
  const usagePercentage = usageLimit > 0 ? Math.min((totalUsage / usageLimit) * 100, 100) : 0; // Cap at 100% and handle division by zero

  // Format numbers for better readability
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Get progress bar color based on usage percentage
  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-400';
    if (percentage >= 75) return 'bg-yellow-400';
    if (percentage >= 50) return 'bg-orange-400';
    return 'bg-green-400';
  };

  // Get plan name styling
  const getPlanNameColor = (plan) => {
    const colors = {
      'Free': 'text-cyan-200', // Changed from blue-200 to cyan-200 for better contrast
      'Researcher': 'text-white',
      'Professional': 'text-yellow-200',
      'Enterprise': 'text-purple-200'
    };
    return colors[plan] || 'text-white';
  };

  const handleManagePlan = () => {
    router.push('/#pricing');
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-2xl p-6 text-white mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-sm opacity-90 mb-2">CURRENT PLAN</div>
          <h2 className={`text-3xl font-bold ${getPlanNameColor(planName)}`}>{planName}</h2>
        </div>
        <button
          onClick={handleManagePlan}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          📋 Manage Plan
        </button>
      </div>
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white/90">API Usage</span>
        </div>
        <div className="bg-white/20 rounded-full h-3 mb-3 relative overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressBarColor(usagePercentage)}`}
            style={{width: `${usagePercentage}%`}}
          ></div>
          {/* Glow effect for high usage */}
          {usagePercentage >= 75 && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
              style={{width: `${usagePercentage}%`}}
            ></div>
          )}
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/90 font-medium">
            {formatNumber(totalUsage)} / {formatNumber(usageLimit)} Requests
          </span>
          <div className={`px-2 py-1 rounded-lg font-bold text-sm ${usagePercentage >= 90 ? 'bg-red-500/20 text-red-200' : usagePercentage >= 75 ? 'bg-yellow-500/20 text-yellow-200' : 'bg-green-500/20 text-green-200'}`}>
            {usagePercentage.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
