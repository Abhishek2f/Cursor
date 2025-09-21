'use client';

import Link from 'next/link';

export default function ApiKeys() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/dashboard"
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m8-14l-7 7 7 7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">API Keys Management</h1>
          </div>
          <p className="text-gray-600">Manage your API keys for secure authentication</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Keys Management</h2>
            <p className="text-gray-600 mb-6">
              Create, manage, and monitor your API keys for secure authentication across all your applications.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7 6h-2m-6 0a6 6 0 01-7-6 6 6 0 0114 0M9 7a2 2 0 012-2m0 0a2 2 0 012 2m-2-2v2a2 2 0 01-2 2 2 2 0 01-2-2V7m0 0V5a2 2 0 012-2h0a2 2 0 012 2v2M7 7a2 2 0 012-2" />
              </svg>
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
