'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiKeysService, isSupabaseConfigured } from '@/lib/supabase';

const generateApiKey = () => {
  return 'kvp-' + Math.random().toString(36).substr(2, 32);
};

export function useApiKeys(showToast) {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApiKeys = useCallback(async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        console.log('Supabase not configured, using localStorage');
        const stored = localStorage.getItem('apiKeys');
        setApiKeys(stored ? JSON.parse(stored) : []);
        return;
      }

      const keys = await apiKeysService.getApiKeys();
      const transformedKeys = keys.map(key => ({
        id: key.id,
        name: key.name,
        description: key.description,
        key: key.key_value,
        created: key.created_at,
        usage: key.usage_count || 0
      }));
      setApiKeys(transformedKeys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      showToast('Failed to load API keys', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);
  
  // Effect to save to localStorage if Supabase is not configured
  useEffect(() => {
    if (!isSupabaseConfigured() && !loading) {
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    }
  }, [apiKeys, loading]);

  const createApiKey = async (formData) => {
    try {
      if (!isSupabaseConfigured()) {
        const newKey = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          key: generateApiKey(),
          created: new Date().toISOString(),
          usage: 0
        };
        setApiKeys(prev => [...prev, newKey]);
      } else {
        const newKeyData = {
          name: formData.name,
          description: formData.description,
          key: generateApiKey()
        };
        await apiKeysService.createApiKey(newKeyData);
        await loadApiKeys();
      }
      showToast('API key created successfully!', 'create');
      return true;
    } catch (error) {
      console.error('Failed to create API key:', error);
      showToast('Failed to create API key', 'error');
      return false;
    }
  };
  
  const updateApiKey = async (id, formData) => {
    try {
      if (!isSupabaseConfigured()) {
         setApiKeys(prev => prev.map(key =>
          key.id === id
            ? { ...key, name: formData.name, description: formData.description }
            : key
        ));
      } else {
        await apiKeysService.updateApiKey(id, {
          name: formData.name,
          description: formData.description
        });
        await loadApiKeys();
      }
      showToast('API key updated successfully!', 'update');
      return true;
    } catch (error) {
      console.error('Failed to update API key:', error);
      showToast('Failed to update API key', 'error');
      return false;
    }
  };

  const deleteApiKey = async (id) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      try {
        if (!isSupabaseConfigured()) {
          setApiKeys(prev => prev.filter(key => key.id !== id));
        } else {
          await apiKeysService.deleteApiKey(id);
          await loadApiKeys();
        }
        showToast('API key deleted successfully!', 'delete');
      } catch (error) {
        console.error('Failed to delete API key:', error);
        showToast('Failed to delete API key', 'error');
      }
    }
  };

  return { apiKeys, loading, createApiKey, updateApiKey, deleteApiKey };
}
