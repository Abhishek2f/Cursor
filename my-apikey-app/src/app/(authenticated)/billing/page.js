'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { UserService } from '@/lib/userService';
import { supabase } from '@/lib/supabase';

export default function Billing() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.email) {
        try {
          // Fetch user data
          const userData = await UserService.getUserByEmail(session.user.email);
          setUser(userData);

          // Fetch user's API keys
          if (userData?.id) {
            const { data: keysData, error } = await supabase
              .from('api_keys')
              .select('*')
              .eq('user_id', userData.id)
              .order('created_at', { ascending: false });

            if (error) {
              console.error('Error fetching API keys:', error);
            } else {
              setApiKeys(keysData || []);
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [session]);

  const isFreePlan = user?.plan === 'Free' || !user?.plan;
  const currentPlan = user?.plan || 'Free';

  // Calculate real usage data from API keys
  const calculateUsageData = () => {
    const totalUsage = apiKeys.reduce((sum, key) => sum + (key.usage_count || 0), 0);
    const activeKeys = apiKeys.filter(key => key.is_active !== false).length;
    const totalRateLimit = apiKeys.reduce((sum, key) => sum + (key.rate_limit || 100), 0);

    // Plan-based limits
    const planLimits = {
      'Free': { requests: 100, keys: 3, rateLimit: 100 },
      'Researcher': { requests: 1000, keys: 10, rateLimit: 500 },
      'Professional': { requests: 10000, keys: 50, rateLimit: 2000 },
      'Enterprise': { requests: 100000, keys: 100, rateLimit: 10000 }
    };

    const limits = planLimits[currentPlan] || planLimits['Free'];

    return {
      apiRequests: {
        used: totalUsage,
        limit: limits.requests,
        percentage: limits.requests > 0 ? Math.min((totalUsage / limits.requests) * 100, 100) : 0
      },
      apiKeys: {
        used: activeKeys,
        limit: limits.keys,
        percentage: limits.keys > 0 ? Math.min((activeKeys / limits.keys) * 100, 100) : 0
      },
      totalRateLimit: {
        used: totalRateLimit,
        limit: limits.rateLimit * limits.keys, // Total rate limit across all keys
        percentage: (limits.rateLimit * limits.keys) > 0 ? Math.min((totalRateLimit / (limits.rateLimit * limits.keys)) * 100, 100) : 0
      }
    };
  };

  const usageData = calculateUsageData();

  const formatUsage = (used, limit, unit = '') => {
    return `${used} / ${limit}${unit}`;
  };

  const getUsagePercentage = (used, limit) => {
    return limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-gradient-to-r from-red-500 to-red-400';
    if (percentage >= 75) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    if (percentage >= 50) return 'bg-gradient-to-r from-orange-500 to-orange-400';
    return 'bg-gradient-to-r from-green-500 to-green-400';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Unable to load billing information</div>
          <div className="text-gray-600 dark:text-gray-400">Please try refreshing the page or contact support if the issue persists.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all duration-200 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:scale-105"
              aria-label="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m8-14l-7 7 7 7" />
              </svg>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Billing & Usage
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your subscription and monitor your API usage
          </p>
        </div>

        {/* Current Plan - Dynamic based on user plan */}
        {isFreePlan ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-1">Free Plan</h2>
                      <p className="text-cyan-100 text-sm sm:text-base">Perfect for getting started</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-2xl font-bold">{usageData.apiRequests.limit}</div>
                      <div className="text-cyan-100 text-sm">API Requests</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-2xl font-bold">{usageData.apiKeys.limit}</div>
                      <div className="text-cyan-100 text-sm">API Keys</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-2xl font-bold">{Math.round(usageData.totalRateLimit.limit / usageData.apiKeys.limit)}</div>
                      <div className="text-cyan-100 text-sm">Req/Day per Key</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-end gap-4">
                  <button className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl">
                    🚀 Upgrade to Pro
                  </button>
                  <div className="text-center lg:text-right">
                    <div className="text-cyan-100 text-sm mb-1">Current Usage</div>
                    <div className="text-xl font-bold">{usageData.apiRequests.used} / {usageData.apiRequests.limit} requests</div>
                    <div className="text-sm text-cyan-200">{usageData.apiKeys.used} / {usageData.apiKeys.limit} API keys</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-1">{currentPlan} Plan</h2>
                      <p className="text-purple-100 text-sm sm:text-base">Professional-grade API access</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="text-3xl font-bold">$29</div>
                    <div className="text-purple-100">per month</div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-sm">Active subscription</span>
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-end gap-4">
                  <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20">
                    ⚙️ Manage Plan
                  </button>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-purple-100 text-sm mb-2">Next billing</div>
                    <div className="text-xl font-bold">Jan 15, 2024</div>
                    <div className="text-purple-200 text-sm">$29.00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Usage Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-600 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Usage Analytics</h3>
              </div>

              <div className="space-y-6">
                {/* API Requests */}
                <div className="group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">API Requests</span>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      {formatUsage(usageData.apiRequests.used, usageData.apiRequests.limit)}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(usageData.apiRequests.percentage)}`}
                        style={{width: `${usageData.apiRequests.percentage}%`}}
                      ></div>
                    </div>
                    {usageData.apiRequests.percentage >= 75 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* API Keys */}
                <div className="group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">API Keys</span>
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      {formatUsage(usageData.apiKeys.used, usageData.apiKeys.limit)}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(usageData.apiKeys.percentage)}`}
                        style={{width: `${usageData.apiKeys.percentage}%`}}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Rate Limit Usage */}
                <div className="group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Rate Limit Usage</span>
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      {formatUsage(usageData.totalRateLimit.used, usageData.totalRateLimit.limit, ' req/day')}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(usageData.totalRateLimit.percentage)}`}
                        style={{width: `${usageData.totalRateLimit.percentage}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-blue-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Usage Tips</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Monitor your API usage regularly to avoid hitting rate limits
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Consider upgrading if you&apos;re consistently near your request limits
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  API keys can be created and managed in your dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Each API key has its own rate limit of {usageData.totalRateLimit.limit > 0 ? Math.round(usageData.totalRateLimit.limit / usageData.apiKeys.limit) : 100} requests per day
                </li>
              </ul>
            </div>
          </div>

          {/* Billing Info & Payment */}
          <div className="space-y-6">
            {!isFreePlan && (
              <>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-600 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Next Billing
                  </h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">$29.00</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Due January 15, 2024</div>
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Active
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-600 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Method
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg text-white text-sm flex items-center justify-center font-mono">
                      ••••
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">•••• 4242</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Expires 12/24</div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                      Update
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Upgrade Card for Free Users */}
            {isFreePlan && (
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-6 text-white shadow-xl border border-purple-400">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ready to Scale?</h3>
                  <p className="text-purple-100 text-sm mb-4">Unlock unlimited potential with Pro</p>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{usageData.apiRequests.limit.toLocaleString()} API requests/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{usageData.apiKeys.limit} API keys</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{Math.round(usageData.totalRateLimit.limit / usageData.apiKeys.limit).toLocaleString()} requests/day per key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
                <button className="w-full bg-white text-purple-600 hover:bg-purple-50 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg">
                  Upgrade Now - $29/month
                </button>
              </div>
            )}

            {/* Plan Benefits */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-600 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {isFreePlan ? 'Free Plan Benefits' : 'Pro Plan Benefits'}
              </h3>
              <div className="space-y-3">
                {isFreePlan ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{usageData.apiRequests.limit.toLocaleString()} API Requests</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Perfect for testing and development</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{usageData.apiKeys.limit} API Keys</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Secure access for your applications</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{Math.round(usageData.totalRateLimit.limit / usageData.apiKeys.limit).toLocaleString()} Requests/Day per Key</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Generous rate limits included</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{usageData.apiRequests.limit.toLocaleString()} API Requests</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">High volume access for production</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{usageData.apiKeys.limit} API Keys</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Perfect for teams and multiple projects</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{Math.round(usageData.totalRateLimit.limit / usageData.apiKeys.limit).toLocaleString()} Requests/Day per Key</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Enhanced rate limits for demanding applications</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-600">
          <div className="p-6 border-b border-gray-200 dark:border-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { date: 'Dec 15, 2023', action: 'API Request', details: 'GitHub API call', amount: null },
                { date: 'Dec 14, 2023', action: 'Storage Upload', details: '2.1 MB file uploaded', amount: null },
                { date: 'Dec 13, 2023', action: 'Billing', details: 'Monthly payment processed', amount: '$29.00' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-600/50 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{activity.action}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.date}</div>
                    {activity.amount && (
                      <div className="text-sm text-green-600 font-medium">{activity.amount}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
