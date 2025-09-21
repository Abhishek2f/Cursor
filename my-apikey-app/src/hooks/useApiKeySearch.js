'use client';

import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { SupabaseApiKeySearchService } from '@/lib/apiKeyService';

export function useApiKeySearch() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeyData, setApiKeyData] = useState(null);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Create service instance
  const searchService = useMemo(() => new SupabaseApiKeySearchService(supabase), []);

  const searchApiKey = useCallback(async () => {
    if (!apiKey.trim()) {
      throw new Error('Please enter an API key to search');
    }

    setLoading(true);
    setError('');
    setApiKeyData(null);
    setHasSearched(true);

    try {
      const data = await searchService.searchApiKey(apiKey.trim());

      // Handle "not found" case gracefully - don't throw error
      if (data === null) {
        setError('The API key was not found in the database. Please check that you have entered the correct key.');
        return null;
      }

      setApiKeyData(data);
      setError(''); // Clear any previous error
      return data;
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiKey, searchService]);

  const clearSearch = useCallback(() => {
    setHasSearched(false);
    setApiKeyData(null);
    setError('');
    setApiKey('');
  }, []);

  return {
    apiKey,
    setApiKey,
    loading,
    apiKeyData,
    error,
    hasSearched,
    searchApiKey,
    clearSearch
  };
}
