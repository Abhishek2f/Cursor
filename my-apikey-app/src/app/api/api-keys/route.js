import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { UserService } from '@/lib/userService'

/**
 * Generate a unique API key
 */
function generateApiKey() {
  return 'kvp-' + Math.random().toString(36).substr(2, 32)
}

/**
 * Get authenticated user's ID from session
 */
async function getAuthenticatedUserId(session) {
  if (!session?.user?.email) {
    return null
  }

  // Get user from database by email
  const user = await UserService.getUserByEmail(session.user.email)
  return user?.id || null
}

/**
 * GET /api/api-keys
 * Get all API keys for the authenticated user
 */
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access API keys' },
        { status: 401 }
      )
    }

    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Service unavailable', message: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get user ID from session
    const userId = await getAuthenticatedUserId(session)
    if (!userId) {
      return NextResponse.json(
        { error: 'User not found', message: 'User profile not found in database' },
        { status: 404 }
      )
    }

    // Fetch user's API keys
    let query = supabase.from('api_keys').select('*').order('created_at', { ascending: false });

    // Add user_id filter if the column exists
    try {
      const { error: columnCheck } = await supabase
        .from('api_keys')
        .select('user_id')
        .limit(1);

      if (!columnCheck) {
        query = query.eq('user_id', userId);
      }
    } catch (e) {
      // user_id column doesn't exist, fetch all keys (fallback for development)
      console.warn('user_id column not found, fetching all API keys');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching API keys:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch API keys' },
        { status: 500 }
      )
    }

    // Transform data to match frontend format
    const apiKeys = data.map(key => ({
      id: key.id,
      name: key.name,
      description: key.description,
      key: key.key_value,
      created: key.created_at,
      usage: key.usage_count || 0,
      rateLimit: key.rate_limit || 100,
      isActive: key.is_active !== false, // Default to true if not set
      lastUsed: key.last_used
    }))

    return NextResponse.json({ apiKeys }, { status: 200 })

  } catch (error) {
    console.error('Error in GET /api/api-keys:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/api-keys
 * Create a new API key for the authenticated user
 */
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to create API keys' },
        { status: 401 }
      )
    }

    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Service unavailable', message: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get user ID from session
    const userId = await getAuthenticatedUserId(session)
    if (!userId) {
      return NextResponse.json(
        { error: 'User not found', message: 'User profile not found in database' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, description } = body

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'API key name is required' },
        { status: 400 }
      )
    }

    // Generate new API key
    const keyValue = generateApiKey()

    // Create API key in database
    const apiKeyData = {
      name: name.trim(),
      description: description?.trim() || null,
      key_value: keyValue,
      usage_count: 0,
      is_active: true,
      created_at: new Date().toISOString()
    };

    // Add user_id if the column exists
    try {
      const { error: columnCheck } = await supabase
        .from('api_keys')
        .select('user_id')
        .limit(1);

      if (!columnCheck) {
        apiKeyData.user_id = userId;
      }
    } catch (e) {
      // user_id column doesn't exist, skip it
    }

    // Add rate_limit if the column exists
    try {
      const { error: rateLimitCheck } = await supabase
        .from('api_keys')
        .select('rate_limit')
        .limit(1);

      if (!rateLimitCheck) {
        apiKeyData.rate_limit = 100; // Default rate limit: 100 requests per day
      }
    } catch (e) {
      // rate_limit column doesn't exist, skip it
    }

    const { data, error } = await supabase
      .from('api_keys')
      .insert([apiKeyData])
      .select()
      .single()

    if (error) {
      console.error('Error creating API key:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to create API key' },
        { status: 500 }
      )
    }

    // Transform data to match frontend format
    const apiKey = {
      id: data.id,
      name: data.name,
      description: data.description,
      key: data.key_value,
      created: data.created_at,
      usage: data.usage_count || 0,
      rateLimit: data.rate_limit || 100,
      isActive: data.is_active !== false // Default to true if not set
    }

    return NextResponse.json({ apiKey }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/api-keys:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

