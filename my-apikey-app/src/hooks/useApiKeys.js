'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const generateApiKey = () => {
  return 'kvp-' + Math.random().toString(36).substr(2, 32);
};

export function useApiKeys(showToast) {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  const loadApiKeys = useCallback(async () => {
    setLoading(true);
    try {
      // If user is not authenticated, use localStorage fallback
      if (status === 'unauthenticated' || !session) {
        console.log('User not authenticated, using localStorage');
        const stored = localStorage.getItem('apiKeys');
        setApiKeys(stored ? JSON.parse(stored) : []);
        return;
      }

      // If still loading session, wait
      if (status === 'loading') {
        return;
      }

      // Fetch API keys from REST endpoint
      const response = await fetch('/api/api-keys', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch API keys');
      }

      const { apiKeys: keys } = await response.json();
      setApiKeys(keys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      showToast(error.message || 'Failed to load API keys', 'error');
      
      // Fallback to localStorage on error
      const stored = localStorage.getItem('apiKeys');
      setApiKeys(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  }, [showToast, session, status]);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);
  
  // Effect to save to localStorage if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated' && !loading) {
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    }
  }, [apiKeys, loading, status]);

  const createApiKey = async (formData) => {
    try {
      // If user is not authenticated, use localStorage fallback
      if (status === 'unauthenticated' || !session) {
        const newKey = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          key: generateApiKey(),
          created: new Date().toISOString(),
          usage: 0
        };
        setApiKeys(prev => [...prev, newKey]);
        showToast('API key created successfully!', 'create');
        return true;
      }

      // Create API key via REST endpoint
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create API key');
      }

      await loadApiKeys();
      showToast('API key created successfully!', 'create');
      return true;
    } catch (error) {
      console.error('Failed to create API key:', error);
      showToast(error.message || 'Failed to create API key', 'error');
      return false;
    }
  };
  
  const updateApiKey = async (id, formData) => {
    try {
      // If user is not authenticated, use localStorage fallback
      if (status === 'unauthenticated' || !session) {
        setApiKeys(prev => prev.map(key =>
          key.id === id
            ? { ...key, name: formData.name, description: formData.description }
            : key
        ));
        showToast('API key updated successfully!', 'update');
        return true;
      }

      // Update API key via REST endpoint
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update API key');
      }

      await loadApiKeys();
      showToast('API key updated successfully!', 'update');
      return true;
    } catch (error) {
      console.error('Failed to update API key:', error);
      showToast(error.message || 'Failed to update API key', 'error');
      return false;
    }
  };

  const deleteApiKey = async (id) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      try {
        // If user is not authenticated, use localStorage fallback
        if (status === 'unauthenticated' || !session) {
          setApiKeys(prev => prev.filter(key => key.id !== id));
          showToast('API key deleted successfully!', 'delete');
          return;
        }

        // Delete API key via REST endpoint
        const response = await fetch(`/api/api-keys/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include session cookies
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete API key');
        }

        await loadApiKeys();
        showToast('API key deleted successfully!', 'delete');
      } catch (error) {
        console.error('Failed to delete API key:', error);
        showToast(error.message || 'Failed to delete API key', 'error');
      }
    }
  };

  return { apiKeys, loading, createApiKey, updateApiKey, deleteApiKey };
}
