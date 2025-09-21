// Test Supabase connection
import { supabase, isSupabaseConfigured } from './supabase.js'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  // Debug environment variables
  console.log('🌍 Current environment variables:')
  console.log('   NODE_ENV:', process.env.NODE_ENV)
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0)
  
  // Check configuration
  console.log('✅ Supabase configured:', isSupabaseConfigured())
  console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('🔑 Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured properly')
    return false
  }

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('api_keys')
      .select('count', { count: 'exact' })
    
    if (error) {
      console.error('❌ Database connection error:', error.message)
      return false
    }
    
    console.log('✅ Database connected successfully!')
    console.log('📊 Current API keys count:', data?.length || 0)
    return true
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message)
    return false
  }
}

// Auto-run test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  testSupabaseConnection()
}
