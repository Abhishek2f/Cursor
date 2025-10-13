import { UserService } from '@/lib/userService'
import { validateApiKey } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * GET /api/users
 * Get all users who have logged in
 * Supports both API key authentication and session authentication for admin access
 */
export async function GET(request) {
  try {
    // Try session authentication first (for web interface)
    const headersList = headers()
    const cookie = headersList.get('cookie') || ''
    const hasSession = cookie.includes('next-auth.session-token')

    // If no session cookie, try API key authentication
    if (!hasSession) {
      const authResult = await validateApiKey(request)
      if (!authResult.success) {
        return Response.json(
          {
            error: authResult.error,
            message: authResult.message
          },
          { status: authResult.status }
        )
      }
    }

    // Get all users
    const users = await UserService.getAllUsers()

    return Response.json({
      success: true,
      users: users || [],
      total: users?.length || 0,
      message: `Found ${users?.length || 0} users`
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch users',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/[id]
 * Update user status (toggle active/inactive)
 */
export async function PATCH(request) {
  try {
    const url = new URL(request.url)
    const userId = url.pathname.split('/').pop()

    if (!userId) {
      return Response.json(
        {
          error: 'User ID is required',
          message: 'Please provide a valid user ID'
        },
        { status: 400 }
      )
    }

    // Try session authentication first (for web interface)
    const headersList = headers()
    const cookie = headersList.get('cookie') || ''
    const hasSession = cookie.includes('next-auth.session-token')

    // If no session cookie, try API key authentication
    if (!hasSession) {
      const authResult = await validateApiKey(request)
      if (!authResult.success) {
        return Response.json(
          {
            error: authResult.error,
            message: authResult.message
          },
          { status: authResult.status }
        )
      }
    }

    const { is_active } = await request.json()

    if (typeof is_active !== 'boolean') {
      return Response.json(
        {
          error: 'Invalid request',
          message: 'is_active must be a boolean value'
        },
        { status: 400 }
      )
    }

    // Update user status using UserService
    const updatedUser = await UserService.updateUserById(userId, { is_active })

    if (!updatedUser) {
      return Response.json(
        {
          error: 'User not found',
          message: 'Unable to find user with the specified ID'
        },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      user: updatedUser,
      message: `User status updated to ${is_active ? 'active' : 'inactive'}`
    })

  } catch (error) {
    console.error('Error updating user status:', error)
    return Response.json(
      {
        error: 'Internal server error',
        message: 'Failed to update user status',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/users
 * Returns API information for this endpoint
 */
export async function OPTIONS() {
  return Response.json({
    name: 'Users API',
    version: '1.0.0',
    description: 'API endpoint for managing user data and login tracking',
    authentication: {
      required: true,
      methods: [
        'Authorization: Bearer <api_key>',
        'apikey: <api_key> (header for Postman API Key auth)',
        'Request body: { "apiKey": "<api_key>" }'
      ]
    },
    endpoints: {
      GET: {
        description: 'Get all users who have logged in',
        parameters: {},
        response: {
          success: true,
          users: [
            {
              id: 'uuid',
              email: 'user@example.com',
              name: 'User Name',
              image: 'https://...',
              provider: 'google',
              provider_id: 'google-user-id',
              last_login: '2025-01-01T00:00:00Z',
              first_login: '2025-01-01T00:00:00Z',
              login_count: 5,
              is_active: true,
              created_at: '2025-01-01T00:00:00Z',
              updated_at: '2025-01-01T00:00:00Z'
            }
          ],
          total: 1
        }
      },
      PATCH: {
        description: 'Update user status (toggle active/inactive)',
        parameters: {
          userId: 'uuid (in URL path)',
          is_active: 'boolean (in request body)'
        },
        response: {
          success: true,
          user: {
            id: 'uuid',
            email: 'user@example.com',
            is_active: false,
            updated_at: '2025-01-01T00:00:00Z'
          },
          message: 'User status updated to inactive'
        }
      }
    }
  })
}
