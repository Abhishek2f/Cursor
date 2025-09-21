import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Temporary fallback values for development (replace with your actual Supabase credentials)
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey
)

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== fallbackUrl)
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
    const { data, error } = await supabase
      .from('api_keys')
      .update({ 
        usage_count: supabase.sql`usage_count + 1`,
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
