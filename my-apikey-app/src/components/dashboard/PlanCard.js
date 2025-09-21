'use client';

export default function PlanCard({ planName = "Researcher", totalUsage = 24, usageLimit = 1000 }) {
  const usagePercentage = (totalUsage / usageLimit) * 100;

  return (
    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-2xl p-6 text-white mb-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-sm opacity-90 mb-2">CURRENT PLAN</div>
          <h2 className="text-3xl font-bold">{planName}</h2>
        </div>
        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          📋 Manage Plan
        </button>
      </div>
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium">API Limit</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="bg-white/20 rounded-full h-2 mb-2">
          <div className="bg-white rounded-full h-2" style={{width: `${usagePercentage}%`}}></div>
        </div>
        <div className="text-sm opacity-90">{totalUsage}/{usageLimit.toLocaleString()} Requests</div>
      </div>
    </div>
  );
}
