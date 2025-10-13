'use client';

import { useState } from 'react';
import { useApiKeySearch } from '@/hooks/useApiKeySearch';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/dateUtils';
import { PageHeader, Button } from '@/components/ui';
import { Search, Send, Github } from '@/components/icons';

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

  // GitHub Summarizer state
  const [githubUrl, setGithubUrl] = useState('');
  const [requestApiKey, setRequestApiKey] = useState('');
  const [summarizerLoading, setSummarizerLoading] = useState(false);
  const [summarizerResponse, setSummarizerResponse] = useState(null);
  const [summarizerError, setSummarizerError] = useState('');
  const [retryLoading, setRetryLoading] = useState(false);

  // UI state for collapsible sections and dismissed results
  const [expandedSection, setExpandedSection] = useState(null); // 'api-key' or 'github' or null
  const [dismissedResults, setDismissedResults] = useState({
    'api-key': false,
    'github': false
  });

  // Helper functions for section management
  const toggleSection = (section) => {
    if (expandedSection === section) {
      // If this section is currently expanded, collapse it
      setExpandedSection(null);
    } else {
      // If this section is collapsed or no section is expanded, expand this section
      setExpandedSection(section);
    }
  };

  const dismissResult = (section) => {
    setDismissedResults(prev => ({ ...prev, [section]: true }));
    // Also collapse the section when dismissing
    if (expandedSection === section) {
      setExpandedSection(null);
    }
  };

  const restoreResult = (section) => {
    setDismissedResults(prev => ({ ...prev, [section]: false }));
    // Expand the section when it's restored
    setExpandedSection(section);
  };

  const isSectionExpanded = (section) => expandedSection === section;
  const shouldShowSection = (section) => true; // Always show sections, use isSectionExpanded for collapse state
  const isSectionVisible = (section) => !dismissedResults[section];

  // Animation delays for staggered entrance
  const getAnimationDelay = (section) => {
    // Always apply delays for initial entrance animation
    return section === 'api-key' ? 'delay-100' : 'delay-200';
  };

  // Computed classnames for collapsible content with enhanced animations
  const apiKeyContainerClasses =
    'bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/60 dark:border-slate-600/60 overflow-hidden ' +
    'transition-all duration-500 ease-out hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 ' +
    'animate-in fade-in slide-in-from-bottom-4 ' + getAnimationDelay('api-key') + ' ' +
    'mb-6 sm:mb-8 shadow-blue-500/20 ' +
    (dismissedResults['api-key'] ? 'opacity-50 pointer-events-none' : '');

  const apiKeyContentClasses =
    'p-4 sm:p-6 transition-all duration-500 ease-out ' +
    (isSectionExpanded('api-key')
      ? 'opacity-100 max-h-screen'
      : 'opacity-0 max-h-0 overflow-hidden pointer-events-none');

  const githubContainerClasses =
    'bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/60 dark:border-slate-600/60 ' +
    'transition-all duration-500 ease-out hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 ' +
    'animate-in fade-in slide-in-from-bottom-4 backdrop-blur-sm ' + getAnimationDelay('github') + ' ' +
    'mb-6 sm:mb-8 shadow-purple-500/20 ' +
    (dismissedResults['github'] ? 'opacity-50 pointer-events-none' : '');

  const githubContentClasses =
    'p-6 sm:p-8 transition-all duration-500 ease-out overflow-auto ' +
    (isSectionExpanded('github')
      ? 'opacity-100'
      : 'opacity-0 max-h-0 overflow-hidden pointer-events-none');

  // Handle search with toast notifications
  const handleSearch = async () => {
    try {
      // Expand API key results section and restore if previously dismissed
      setExpandedSection('api-key');
      setDismissedResults(prev => ({ ...prev, ['api-key']: false }));
      await searchApiKey();
    } catch (err) {
      // Only show toast for actual errors, not for "not found" cases
      if (!err.message.includes('not found')) {
        showToast(err.message, 'error');
      }
    }
  };

  // Handle GitHub summarizer request
  const handleSummarizerRequest = async () => {
    if (!githubUrl.trim()) {
      setSummarizerError('Please enter a GitHub URL');
      return;
    }

    // Expand GitHub results section immediately when user clicks Send Request
    // Also restore the section if it was previously dismissed
    setExpandedSection('github');
    setDismissedResults(prev => ({ ...prev, ['github']: false }));
    setSummarizerLoading(true);
    setSummarizerError('');
    setSummarizerResponse(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add API key to headers if provided
      if (requestApiKey.trim()) {
        headers['apikey'] = requestApiKey.trim();
      }

      const response = await fetch('/api/github-summarizer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          githubUrl: githubUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API key errors gracefully
        if (response.status === 401 || response.status === 403) {
          setSummarizerError('The provided API key was not found or is invalid. Please check your API key and try again.');
          showToast('Invalid API key provided', 'error');
          return;
        }

        // Handle other errors
        setSummarizerError(data.message || `HTTP error! status: ${response.status}`);
        showToast(data.message || 'An error occurred while summarizing the repository', 'error');
        return;
      }

      setSummarizerResponse(data);
      setExpandedSection('github'); // Expand GitHub results
      showToast('GitHub repository summarized successfully!', 'success');
    } catch (err) {
      console.error('GitHub summarizer error:', err);
      // Handle network errors, parsing errors, etc.
      if (err.message.includes('fetch')) {
        setSummarizerError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err.message.includes('JSON')) {
        setSummarizerError('Received an invalid response from the server. Please try again.');
      } else {
        setSummarizerError(err.message || 'An unexpected error occurred while summarizing the repository');
      }
      showToast(err.message || 'Failed to summarize repository', 'error');
    } finally {
      setSummarizerLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="animate-in fade-in slide-in-from-top-2 duration-700">
          <PageHeader
            title="GitHub Playground"
            description="Search API keys and summarize GitHub repositories with AI-powered insights"
          />
        </div>

        {/* Search Section */}
        <div className="relative bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 dark:from-slate-800 dark:via-slate-700/50 dark:to-slate-800/30 rounded-2xl shadow-lg border border-blue-200/50 dark:border-slate-600/50 p-6 sm:p-8 mb-8 sm:mb-10 animate-in fade-in slide-in-from-left-4 duration-700 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Header */}
          <div className="relative z-10 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                Search API Key
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">Enter your API key to access powerful features</p>
          </div>

          {/* Search Form */}
          <div className="relative z-10">
            <div className="flex flex-col gap-4">
              {/* Input Field */}
              <div className="relative group/input">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key (e.g., kvp-abc123...)"
                  className="relative w-full px-5 py-4 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 dark:bg-slate-800/80 text-base font-medium min-h-[56px] transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-300 hover:shadow-lg focus:shadow-xl focus:shadow-blue-500/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-focus-within/input:w-full"></div>
              </div>

              {/* Action Buttons - Right Aligned */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="px-6 py-4 min-h-[56px] text-sm font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-gray-400 dark:hover:border-slate-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  disabled={loading}
                  loading={loading}
                  className="px-8 py-4 min-h-[56px] text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:hover:scale-100 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-indigo-400/10 to-purple-400/10 rounded-full blur-xl"></div>
        </div>

        {/* Error Section */}
        {error && hasSearched && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Search Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {apiKeyData && shouldShowSection('api-key') && (
          <div className={apiKeyContainerClasses}>
            <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-slate-600/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 relative animate-in slide-in-from-top-2 duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5 animate-pulse"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex-shrink-0 ${isSectionExpanded('api-key') ? 'animate-bounce' : 'animate-pulse'}`}></div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 animate-in fade-in duration-300">API Key Found</h2>
                  <span className={`px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800/20 dark:to-emerald-800/20 text-green-800 dark:text-green-300 text-sm rounded-full font-medium border border-green-200/50 dark:border-green-700/50 transition-all duration-300 ${isSectionExpanded('api-key') ? 'animate-pulse' : ''}`}>
                    {apiKeyData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSection('api-key')}
                    className="p-2 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/20 dark:hover:to-emerald-800/20 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 border border-green-200/50 dark:border-green-700/50 hover:border-green-300 dark:hover:border-green-600"
                    title="Toggle section"
                  >
                    <svg
                      className={`w-5 h-5 text-green-600 transition-all duration-300 ${isSectionExpanded('api-key') ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => dismissResult('api-key')}
                    className="p-1.5 hover:bg-red-100 rounded-md transition-all duration-300 hover:scale-110 active:scale-95 group"
                    title="Close section"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className={apiKeyContentClasses}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Basic Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-md font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Basic Information</h3>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-md border dark:border-slate-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base break-words">
                      {apiKeyData.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-md border dark:border-slate-600 font-mono text-xs sm:text-sm text-gray-900 dark:text-gray-100 break-all">
                      {apiKeyData.key_value}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${apiKeyData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${apiKeyData.is_active ? 'text-green-700' : 'text-red-700'}`}>
                        {apiKeyData.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-md font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Usage Statistics</h3>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usage Count</label>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-md border dark:border-slate-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                      {apiKeyData.usage_count?.toLocaleString() || '0'} requests
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</label>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-md border dark:border-slate-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                      {formatDate(apiKeyData.created_at)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Updated</label>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-md border dark:border-slate-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                      {formatDate(apiKeyData.updated_at)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Used</label>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-md border dark:border-slate-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                      {formatDate(apiKeyData.last_used)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {apiKeyData.description && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-slate-600">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-md border dark:border-slate-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base break-words">
                    {apiKeyData.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GitHub Summarizer Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-600 p-4 sm:p-6 mb-6 sm:mb-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg animate-pulse">
              <Github className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">GitHub Repository Summarizer</h2>
          </div>

          <div className="space-y-4">
            {/* GitHub URL Input */}
            <div className="group">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-400 text-gray-900 dark:text-gray-100 dark:bg-slate-800/50 text-sm sm:text-base min-h-[44px] sm:min-h-0 transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-300 hover:shadow-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSummarizerRequest()}
              />
            </div>

            {/* API Key Input */}
            <div className="group">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400">
                API Key (Optional)
              </label>
              <input
                type="password"
                value={requestApiKey}
                onChange={(e) => setRequestApiKey(e.target.value)}
                placeholder="Enter your API key for authenticated requests"
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-400 text-gray-900 dark:text-gray-100 dark:bg-slate-800/50 text-sm sm:text-base min-h-[44px] sm:min-h-0 transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-300 hover:shadow-sm"
              />
            </div>

            {/* Send Request Button */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSummarizerRequest}
                disabled={summarizerLoading}
                loading={summarizerLoading}
                className="px-4 py-3 sm:px-6 sm:py-3 min-h-[44px] sm:min-h-0 text-sm sm:text-base flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Send className="w-4 h-4" />
                {summarizerLoading ? 'Summarizing...' : 'Send Request'}
              </Button>
            </div>
          </div>

          {/* Summarizer Error */}
          {summarizerError && (
            <div className="mt-6 p-6 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-900/20 dark:via-red-800/20 dark:to-red-700/20 border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-sm animate-in slide-in-from-top-2 duration-300 animate-out fade-out slide-out-to-top-2 duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-800/50 dark:to-red-700/50 rounded-full">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Error</h3>
                  <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed mb-4">{summarizerError}</p>

                  {summarizerError.includes('API key') && (
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 border border-red-200/50 dark:border-red-700/50">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Need help with your API key?</p>
                          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                            <li>• Make sure your API key is valid and active</li>
                            <li>• Check that you have the correct permissions</li>
                            <li>• Try generating a new API key if needed</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={async () => {
                        setSummarizerError('');
                        await new Promise(resolve => setTimeout(resolve, 150)); // Small delay for animation
                        setRequestApiKey('');
                        setRetryLoading(false);
                      }}
                      className="px-4 py-2 bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 text-sm font-medium rounded-lg border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 transition-all duration-200 hover:scale-105"
                    >
                      Clear Error
                    </button>
                    <button
                      onClick={async () => {
                        setSummarizerError('');
                        setRetryLoading(true);
                        try {
                          await handleSummarizerRequest();
                        } finally {
                          setRetryLoading(false);
                        }
                      }}
                      disabled={retryLoading}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-500 dark:to-rose-500 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-rose-700 dark:hover:from-red-400 dark:hover:to-rose-400 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2"
                    >
                      {retryLoading && (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {retryLoading ? 'Retrying...' : 'Try Again'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GitHub Summarizer Results */}
        {summarizerResponse && shouldShowSection('github') && (
          <div className={githubContainerClasses}>
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-6 sm:p-8 border-b border-gray-200/50 dark:border-slate-600/50 relative animate-in slide-in-from-top-2 duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 animate-pulse"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex-shrink-0 shadow-lg ${isSectionExpanded('github') ? 'animate-bounce' : 'animate-pulse'}`}></div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 animate-in fade-in duration-300">Repository Summary</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/20 dark:to-indigo-800/20 text-blue-800 dark:text-blue-200 text-sm rounded-full font-medium border border-blue-200/50 dark:border-blue-700/50 shadow-sm transition-all duration-300 hover:scale-105">
                        {summarizerResponse.modelUsed || 'AI Generated'}
                      </span>
                      {summarizerResponse.stars && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-800/20 dark:to-amber-800/20 text-yellow-800 dark:text-yellow-200 text-xs rounded-full font-medium border border-yellow-200/50 dark:border-yellow-700/50 transition-all duration-300 hover:scale-105">
                          <svg className="w-3 h-3 animate-spin" fill="currentColor" viewBox="0 0 20 20" style={{animationDuration: '3s'}}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {summarizerResponse.stars.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSection('github')}
                    className="p-2 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-800/20 dark:hover:to-indigo-800/20 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-300 dark:hover:border-purple-600"
                    title="Toggle section"
                  >
                    <svg
                      className={`w-5 h-5 text-purple-600 transition-all duration-300 ${isSectionExpanded('github') ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => dismissResult('github')}
                    className="p-1.5 hover:bg-red-100 rounded-md transition-all duration-300 hover:scale-110 active:scale-95 group"
                    title="Close section"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              {summarizerResponse.readmeSource && (
                <div className="relative mt-4 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-gray-200/50 dark:border-slate-600/50">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Source:</span>{' '}
                    <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded border dark:border-slate-600">{summarizerResponse.readmeSource}</span>
                  </p>
                </div>
              )}
            </div>

            <div className={githubContentClasses}>
              {/* Repository Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Repository Information</h3>
                  </div>

                  <div className="space-y-4">
                    {summarizerResponse.stars && (
                      <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-700/50 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-800/50 dark:to-amber-800/50 rounded-lg group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <span className="text-base font-semibold text-gray-800 dark:text-gray-200">Stars</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{summarizerResponse.stars.toLocaleString()}</span>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">GitHub Stars</div>
                        </div>
                      </div>
                    )}

                    {summarizerResponse.license_type && (
                      <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50 rounded-lg group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <span className="text-base font-semibold text-gray-800 dark:text-gray-200">License</span>
                        </div>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 text-sm font-semibold rounded-full border border-green-300/50 dark:border-green-700/50">
                          {summarizerResponse.license_type}
                        </span>
                      </div>
                    )}

                    {summarizerResponse.website_url && (
                      <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50 rounded-lg group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <span className="text-base font-semibold text-gray-800 dark:text-gray-200">Website</span>
                        </div>
                        <a
                          href={summarizerResponse.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-200 text-sm font-semibold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700/50 hover:scale-105 transition-all duration-200 border border-blue-300/50 dark:border-blue-700/50 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Visit Site
                        </a>
                      </div>
                    )}

                    {summarizerResponse.latest_version && (
                      <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800/50 dark:to-pink-800/50 rounded-lg group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-base font-semibold text-gray-800 dark:text-gray-200">Latest Version</span>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200 text-sm font-semibold rounded-full border border-purple-300/50 dark:border-purple-700/50">
                          {summarizerResponse.latest_version}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tools & Technologies */}
                {summarizerResponse.tools_used && summarizerResponse.tools_used.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Technologies Used</h3>
                    </div>

                    <div className="flex flex-wrap gap-3 min-h-[40px]">
                      {summarizerResponse.tools_used.map((tool, index) => (
                        <span
                          key={index}
                          className="group px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50 text-green-800 dark:text-green-200 text-sm font-medium rounded-full border border-green-200/50 dark:border-green-700/50 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              {summarizerResponse.githubSummary && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-800/50 dark:to-indigo-800/50 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Project Summary</h3>
                  </div>
                  <div className="relative p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 rounded-2xl"></div>
                    <div className="relative">
                      <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                        {summarizerResponse.githubSummary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cool Facts */}
              {summarizerResponse.cool_facts && summarizerResponse.cool_facts.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-800/50 dark:to-amber-800/50 rounded-lg">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Interesting Facts</h3>
                  </div>
                  <div className="space-y-4">
                    {summarizerResponse.cool_facts.map((fact, index) => (
                      <div key={index} className="group flex gap-4 p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-800/50 dark:to-amber-800/50 rounded-full flex items-center justify-center mt-1 shadow-sm group-hover:scale-110 transition-transform">
                          <span className="text-sm font-bold text-orange-800 dark:text-orange-200">{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed flex-1">{fact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage Info */}
              {summarizerResponse.usage && (
                <div className="pt-6 border-t border-gray-200/50 dark:border-slate-600/50">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg border border-gray-200/50 dark:border-slate-600/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Usage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {summarizerResponse.usage.usage || 0} / {summarizerResponse.usage.limit || 0}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">requests</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}


        {/* No Results - Generic message for other cases */}
        {hasSearched && !loading && !apiKeyData && !error && apiKey && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-600 p-8 sm:p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="text-gray-400 dark:text-gray-500 mb-4 animate-bounce">
              <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 animate-in fade-in duration-300 delay-200">No Results</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 animate-in fade-in duration-300 delay-300">No API key data found for this search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
