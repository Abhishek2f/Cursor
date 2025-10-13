import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { UserService } from '@/lib/userService'

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
 * Verify that the API key belongs to the authenticated user
 */
async function verifyApiKeyOwnership(apiKeyId, userId) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('id', apiKeyId)
    .single()

  if (error || !data) {
    return { valid: false, notFound: true }
  }

  if (data.user_id !== userId) {
    return { valid: false, notFound: false }
  }

  return { valid: true }
}

/**
 * GET /api/api-keys/[id]
 * Get a specific API key by ID (must belong to authenticated user)
 */
export async function GET(request, { params }) {
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

    // Get API key ID from params (await params in Next.js 15)
    const { id: apiKeyId } = await params

    // Verify ownership
    const ownership = await verifyApiKeyOwnership(apiKeyId, userId)
    if (!ownership.valid) {
      if (ownership.notFound) {
        return NextResponse.json(
          { error: 'Not found', message: 'API key not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to access this API key' },
        { status: 403 }
      )
    }

    // Fetch the API key
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', apiKeyId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching API key:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch API key' },
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
      isActive: data.is_active,
      lastUsed: data.last_used
    }

    return NextResponse.json({ apiKey }, { status: 200 })

  } catch (error) {
    console.error('Error in GET /api/api-keys/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/api-keys/[id]
 * Update a specific API key (must belong to authenticated user)
 */
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update API keys' },
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

    // Get API key ID from params (await params in Next.js 15)
    const { id: apiKeyId } = await params

    // Verify ownership
    const ownership = await verifyApiKeyOwnership(apiKeyId, userId)
    if (!ownership.valid) {
      if (ownership.notFound) {
        return NextResponse.json(
          { error: 'Not found', message: 'API key not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to update this API key' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, description } = body

    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Validation error', message: 'API key name must be a non-empty string' },
        { status: 400 }
      )
    }

    // Build update object
    const updates = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) {
      updates.name = name.trim()
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null
    }

    // Update API key in database
    const { data, error } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', apiKeyId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating API key:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to update API key' },
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
      isActive: data.is_active,
      lastUsed: data.last_used
    }

    return NextResponse.json({ apiKey }, { status: 200 })

  } catch (error) {
    console.error('Error in PUT /api/api-keys/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/api-keys/[id]
 * Delete a specific API key (must belong to authenticated user)
 */
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to delete API keys' },
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

    // Get API key ID from params (await params in Next.js 15)
    const { id: apiKeyId } = await params

    // Verify ownership
    const ownership = await verifyApiKeyOwnership(apiKeyId, userId)
    if (!ownership.valid) {
      if (ownership.notFound) {
        return NextResponse.json(
          { error: 'Not found', message: 'API key not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to delete this API key' },
        { status: 403 }
      )
    }

    // Delete API key from database
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', apiKeyId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting API key:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to delete API key' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'API key deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in DELETE /api/api-keys/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

