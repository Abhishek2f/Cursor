'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Custom Hooks
import { useApiKeys } from '@/hooks/useApiKeys';
import { useToast } from '@/hooks/useToast';
import { useModal } from '@/hooks/useModal';

// Components
import { Button, LoadingSpinner } from '@/components/ui';
import ApiKeysTable from '@/components/dashboard/ApiKeysTable';
import ApiKeyModal from '@/components/dashboard/ApiKeyModal';

export default function ApiKeys() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const { apiKeys, loading, createApiKey, updateApiKey, deleteApiKey } = useApiKeys(showToast);
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();

  const [editingKey, setEditingKey] = useState(null);

  // Protect the page - redirect if not authenticated
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
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render page until authenticated
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

  // Calculate statistics
  const totalUsage = apiKeys.reduce((total, key) => total + (key.usage || 0), 0);
  const activeKeys = apiKeys.filter(key => key.isActive !== false).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m8-14l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">API Keys Management</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Create, manage, and monitor your API keys for secure authentication</p>
      </div>

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-slate-600/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">API Keys Overview</h2>
                <p className="text-sm sm:text-base text-gray-300">
                  Manage your API keys for secure authentication across all your applications and services.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7 6h-2m-6 0a6 6 0 01-7-6 6 6 0 0114 0M9 7a2 2 0 012-2m0 0a2 2 0 012 2m-2-2v2a2 2 0 01-2 2 2 2 0 01-2-2V7m0 0V5a2 2 0 012-2h0a2 2 0 012 2v2M7 7a2 2 0 012-2" />
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
                <p className="text-xl sm:text-2xl font-bold text-white">{activeKeys}</p>
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
                <p className="text-xl sm:text-2xl font-bold text-white">{totalUsage}</p>
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
        {loading ? (
          <div className="text-center p-12">
            <LoadingSpinner text="Loading API keys..." />
          </div>
        ) : (
          <ApiKeysTable
            apiKeys={apiKeys}
            loading={loading}
            onEdit={handleEdit}
            onDelete={deleteApiKey}
            onCopy={handleCopy}
            onCreate={handleCreateNew}
          />
        )}
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
