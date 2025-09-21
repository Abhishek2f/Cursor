'use client';

import { useApiKeySearch } from '@/hooks/useApiKeySearch';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/dateUtils';
import { PageHeader, Button } from '@/components/ui';
import { Search } from '@/components/icons';

export default function Playground() {
  const {
    apiKey,
    setApiKey,
    loading,
    apiKeyData,
    error,
    hasSearched,
    searchApiKey,
    clearSearch
  } = useApiKeySearch();

  const { showToast } = useToast();

  // Handle search with toast notifications
  const handleSearch = async () => {
    try {
      await searchApiKey();
    } catch (err) {
      // Only show toast for actual errors, not for "not found" cases
      if (!err.message.includes('not found')) {
        showToast(err.message, 'error');
      }
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PageHeader
          title="API Key Lookup"
          description="Search and view details of API keys in your database"
        />

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search API Key</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key (e.g., kvp-abc123...)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearSearch}
            >
              Clear
            </Button>
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={loading}
                loading={loading}
              >
                <Search />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </div>


        {/* Error Section */}
        {error && hasSearched && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Search Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {apiKeyData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">API Key Found</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  {apiKeyData.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border text-gray-900">
                      {apiKeyData.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border font-mono text-sm text-gray-900">
                      {apiKeyData.key_value}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${apiKeyData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${apiKeyData.is_active ? 'text-green-700' : 'text-red-700'}`}>
                        {apiKeyData.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Usage Statistics</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usage Count</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border text-gray-900">
                      {apiKeyData.usage_count?.toLocaleString() || '0'} requests
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border text-gray-900">
                      {formatDate(apiKeyData.created_at)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border text-gray-900">
                      {formatDate(apiKeyData.updated_at)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Used</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border text-gray-900">
                      {formatDate(apiKeyData.last_used)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {apiKeyData.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md border text-gray-900">
                    {apiKeyData.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Results - Generic message for other cases */}
        {hasSearched && !loading && !apiKeyData && !error && apiKey && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results</h3>
            <p className="text-gray-500">No API key data found for this search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
