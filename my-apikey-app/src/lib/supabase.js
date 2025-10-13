import { createClient } from '@supabase/supabase-js'

// ⚠️ SECURITY: These environment variables should ONLY be used server-side
// Client-side code should NEVER have access to these credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Database helper functions for API keys
// NOTE: These functions are deprecated for client use. Use the REST API endpoints instead.
// They are kept here for server-side use and backward compatibility.
export const apiKeysService = {
  // Get API keys for a specific user
  async getApiKeys(userId) {
    if (!supabase) {
      console.warn('Supabase not configured. Returning empty array.')
      return []
    }

    if (!userId) {
      console.warn('User ID is required to fetch API keys')
      return []
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching API keys:', error)
      return []
    }
    
    return data
  },

  // Create new API key for a specific user
  async createApiKey(apiKeyData, userId) {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set up Supabase environment variables.')
    }

    if (!userId) {
      throw new Error('User ID is required to create API key')
    }

    const { data, error } = await supabase
      .from('api_keys')
      .insert([{
        user_id: userId,
        name: apiKeyData.name,
        description: apiKeyData.description,
        key_value: apiKeyData.key,
        usage_count: 0,
        created_at: new Date().toISOString(),
        is_active: true
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating API key:', error)
      throw error
    }
    
    return data
  },

  // Update API key (must belong to user)
  async updateApiKey(id, updates, userId) {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set up Supabase environment variables.')
    }

    if (!userId) {
      throw new Error('User ID is required to update API key')
    }

    const { data, error } = await supabase
      .from('api_keys')
      .update({
        name: updates.name,
        description: updates.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating API key:', error)
      throw error
    }
    
    return data
  },

  // Delete API key (must belong to user)
  async deleteApiKey(id, userId) {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set up Supabase environment variables.')
    }

    if (!userId) {
      throw new Error('User ID is required to delete API key')
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting API key:', error)
      throw error
    }
    
    return true
  },

  // Increment usage count (used by API key validation)
  async incrementUsage(keyValue) {
    if (!supabase) {
      console.warn('Supabase not configured. Skipping usage increment.')
      return null
    }

    // First get current usage count
    const { data: currentData, error: fetchError } = await supabase
      .from('api_keys')
      .select('usage_count')
      .eq('key_value', keyValue)
      .single()

    if (fetchError) {
      console.error('Error fetching current usage:', fetchError)
      throw fetchError
    }

    const newUsageCount = (currentData.usage_count || 0) + 1

    // Update with new count
    const { data, error } = await supabase
      .from('api_keys')
      .update({
        usage_count: newUsageCount,
        last_used: new Date().toISOString()
      })
      .eq('key_value', keyValue)
      .select()
      .single()

    if (error) {
      console.error('Error incrementing usage:', error)
      throw error
    }

    return data
  }
}
