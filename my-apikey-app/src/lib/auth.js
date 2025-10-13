// This file now only contains API key validation
// NextAuth.js configuration has been moved to src/lib/nextauth.js

import { supabase, apiKeysService, isSupabaseConfigured } from '@/lib/supabase'
import { SupabaseApiKeySearchService } from '@/lib/apiKeyService'

const apiKeySearchService = isSupabaseConfigured() && supabase ? new SupabaseApiKeySearchService(supabase) : null

/**
 * Validates an API key from a request object
 * @param {Request} request - The request object
 * @param {Object} options - Optional configuration
 * @param {boolean} options.requireBody - Whether to require a valid JSON body (default: false)
 * @returns {Promise<Object>} - Object with success status and API key data or error
 */
export async function validateApiKey(request, options = {}) {
  try {
    // Check if Supabase is configured for API key validation
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Database not configured',
        message: 'API key validation requires Supabase configuration. Please set up SUPABASE_URL and SUPABASE_ANON_KEY as regular environment variables (without NEXT_PUBLIC_ prefix) for security',
        status: 503
      }
    }

    // Extract API key from request
    let apiKey

    // Try to get API key from Authorization header first
    const authHeader = request.headers.get('authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix
    }

    // Also check for generic 'apikey' header (for Postman API Key auth)
    if (!apiKey) {
      const apiKeyHeader = request.headers.get('apikey')
      if (apiKeyHeader) {
        apiKey = apiKeyHeader
      }
    }

    // If not in header, try to get from request body (only if required)
    if (!apiKey && options.requireBody !== false) {
      try {
        const body = await request.json()
        apiKey = body?.apiKey
      } catch (bodyError) {
        return {
          success: false,
          error: 'Invalid JSON in request body',
          message: 'Please ensure your request body contains valid JSON',
          status: 400
        }
      }
    }

    // Validate that API key is provided
    if (!apiKey) {
      return {
        success: false,
        error: 'API key is required',
        message: 'Please provide an API key in the Authorization header (Bearer token) or in the request body as apiKey',
        status: 400
      }
    }

    // Handle demo API key for testing purposes
    if (apiKey === 'Demo_API_Key') {
      return {
        success: true,
        apiKey: {
          id: 'demo-key-id',
          name: 'Demo API Key',
          description: 'Demo API key for testing purposes',
          usage_count: 0,
          last_used: new Date().toISOString(),
          is_active: true
        }
      }
    }

    // Validate API key using the search service
    if (!apiKeySearchService) {
      return {
        success: false,
        error: 'Service unavailable',
        message: 'API key validation service is not available',
        status: 503
      }
    }

    const apiKeyData = await apiKeySearchService.searchApiKey(apiKey)

    if (!apiKeyData) {
      return {
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key was not found or is invalid',
        status: 401
      }
    }

    // Check if API key is active
    if (!apiKeyData.is_active) {
      return {
        success: false,
        error: 'API key is inactive',
        message: 'The provided API key is currently inactive',
        status: 401
      }
    }

    // API key is valid - increment usage count (skip for demo key)
    if (apiKey !== 'Demo_API_Key' && apiKeysService && isSupabaseConfigured()) {
      try {
        await apiKeysService.incrementUsage(apiKey)
      } catch (error) {
        // Log error but don't fail the request
        console.error('Failed to increment API key usage:', error)
      }
    }

    // Return success with API key info (without exposing the key value)
    const { key_value, ...apiKeyInfo } = apiKeyData

    return {
      success: true,
      apiKey: {
        id: apiKeyInfo.id,
        name: apiKeyInfo.name,
        description: apiKeyInfo.description,
        usage_count: (apiKeyInfo.usage_count || 0) + 1,
        last_used: new Date().toISOString(),
        is_active: apiKeyInfo.is_active
      }
    }

  } catch (error) {
    console.error('Error validating API key:', error)
    return {
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request',
      status: 500
    }
  }
}
