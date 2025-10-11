import { validateApiKey } from '@/lib/auth'

/**
 * POST /api/validate-api-key
 * Validates an API key and returns the key information without processing any business logic
 *
 * Authentication methods:
 * 1. Authorization header: Bearer <api_key>
 * 2. apikey header: <api_key> (for Postman API Key auth)
 * 3. Request body: { "apiKey": "<api_key>" }
 */
export async function POST(request) {
  const validationResult = await validateApiKey(request, { requireBody: true })

  if (!validationResult.success) {
    return Response.json(
      {
        error: validationResult.error,
        message: validationResult.message
      },
      { status: validationResult.status }
    )
  }

  return Response.json({
    success: true,
    message: 'API key validated successfully',
    apiKey: validationResult.apiKey
  })
}

/**
 * GET /api/validate-api-key
 * Returns information about the API key validation endpoint
 */
export async function GET() {
  return Response.json({
    name: 'API Key Validation API',
    version: '1.0.0',
    description: 'API endpoint for validating API keys only',
    authentication: {
      required: true,
      methods: [
        'Authorization: Bearer <api_key>',
        'apikey: <api_key> (header for Postman API Key auth)',
        'Request body: { "apiKey": "<api_key>" }'
      ]
    },
    endpoints: {
      POST: {
        description: 'Validate API key and return key information',
        parameters: {
          apiKey: 'Your API key (in Authorization header, apikey header, or request body)'
        }
      },
      GET: {
        description: 'Get API information and documentation',
        parameters: {}
      }
    }
  })
}
