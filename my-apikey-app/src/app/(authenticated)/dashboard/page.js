'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Custom Hooks
import { useApiKeys } from '@/hooks/useApiKeys';
import { useToast } from '@/hooks/useToast';
import { useModal } from '@/hooks/useModal';
import { isSupabaseConfigured } from '@/lib/supabase';
import { UserService } from '@/lib/userService';

// Components
import PlanCard from '@/components/dashboard/PlanCard';
import ApiKeysTable from '@/components/dashboard/ApiKeysTable';
import ApiKeyModal from '@/components/dashboard/ApiKeyModal';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const { apiKeys, loading, createApiKey, updateApiKey, deleteApiKey } = useApiKeys(showToast);
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();

  const [editingKey, setEditingKey] = useState(null);
  const [userPlan, setUserPlan] = useState('Free');
  const [userPlanLoading, setUserPlanLoading] = useState(true);

  // State for calculated values
  const [totalUsage, setTotalUsage] = useState(0);
  const [usageLimit, setUsageLimit] = useState(100);

  // Plan limits configuration - moved inside useEffect to fix React hooks warning
  const planLimits = useMemo(() => ({
    'Free': 100,
    'Researcher': 1000,
    'Professional': 10000,
    'Enterprise': 100000
  }), []);

  // Calculate usage statistics when apiKeys or userPlan changes
  useEffect(() => {
    if (apiKeys.length > 0) {
      const total = apiKeys.reduce((sum, key) => sum + (key.usage || 0), 0);
      setTotalUsage(total);

      // Sum of all individual API key rate limits
      const totalLimit = apiKeys.reduce((sum, key) => sum + (key.rateLimit || 100), 0);
      setUsageLimit(totalLimit);

    } else {
      setTotalUsage(0);
      // If no API keys, use plan-based limit as fallback
      const limit = planLimits[userPlan] || planLimits['Free'];
      setUsageLimit(limit);
    }
  }, [apiKeys, userPlan, planLimits]);

  // Fetch user plan from database
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (session?.user?.email && status === 'authenticated') {
        try {
          const userData = await UserService.getUserByEmail(session.user.email);
          if (userData?.plan) {
            setUserPlan(userData.plan);
          }
        } catch (error) {
          console.error('Error fetching user plan:', error);
          // Keep default 'Free' plan on error
        } finally {
          setUserPlanLoading(false);
        }
      } else {
        setUserPlanLoading(false);
      }
    };

    fetchUserPlan();
  }, [session?.user?.email, status]);

  // Protect the dashboard - redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard until authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const handleCreateNew = () => {
    setEditingKey(null);
    openModal();
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    openModal();
  };

  const handleCopy = async (keyText) => {
    try {
      await navigator.clipboard.writeText(keyText);
      showToast('Copied API Key to clipboard', 'success');
    } catch (error) {
      showToast('Failed to copy API Key to clipboard', 'error');
    }
  };
  
  const handleSubmitModal = async (formData) => {
    let success = false;
    try {
      if (editingKey) {
        success = await updateApiKey(editingKey.id, formData);
      } else {
        success = await createApiKey(formData);
      }

      if (success) {
        closeModal();
        setEditingKey(null);
      }
    } catch (error) {
      console.error('Error in handleSubmitModal:', error);
      showToast('An error occurred while processing the request', 'error');
    }
  };

  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured();

  if (!supabaseConfigured) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Supabase Not Configured</h3>
          <p className="text-gray-500 mb-4">
            To use the dashboard features, you need to set up Supabase environment variables.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-600 mb-2">Add these to your <code className="bg-gray-200 px-1 rounded">.env.local</code> file:</p>
            <pre className="text-xs text-gray-800">
{`SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

⚠️ IMPORTANT: These should be set as regular environment variables (without NEXT_PUBLIC_ prefix) for security`}
            </pre>
          </div>
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-slate-600/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome back! 👋</h2>
              <p className="text-sm sm:text-base text-gray-300">Here&apos;s an overview of your API key management system.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-400">Active Keys</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{apiKeys.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-400">Total Usage</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {apiKeys.reduce((total, key) => total + (key.usage_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600/50 hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-400">Security Status</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400">Protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <PlanCard
          planName={userPlan}
          totalUsage={totalUsage}
          usageLimit={usageLimit}
        />
        <ApiKeysTable
          apiKeys={apiKeys}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteApiKey}
          onCopy={handleCopy}
          onCreate={handleCreateNew}
        />
      </div>

      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
        editingKey={editingKey}
      />
    </div>
  );
}
