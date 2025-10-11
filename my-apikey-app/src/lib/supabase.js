import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate that required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Database helper functions for API keys
export const apiKeysService = {
  // Get all API keys
  async getApiKeys() {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching API keys:', error)
      return []
    }
    
    return data
  },

  // Create new API key
  async createApiKey(apiKeyData) {
    const { data, error } = await supabase
      .from('api_keys')
      .insert([{
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

  // Update API key
  async updateApiKey(id, updates) {
    const { data, error } = await supabase
      .from('api_keys')
      .update({
        name: updates.name,
        description: updates.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating API key:', error)
      throw error
    }
    
    return data
  },

  // Delete API key
  async deleteApiKey(id) {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting API key:', error)
      throw error
    }
    
    return true
  },

  // Increment usage count
  async incrementUsage(keyValue) {
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
