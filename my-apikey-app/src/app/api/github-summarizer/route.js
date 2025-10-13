import { validateApiKey } from '@/lib/auth'
import { summarizerService } from '@/lib/summarizerService'
import {
  checkEnhancedRateLimit,
  getApiKeyUsageInfo,
  createSuccessResponse,
  createErrorResponse,
  createRateLimitResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
  createApiDocsResponse,
  validateRequest,
  withSecurityMonitoring,
  withRateLimitMonitoring,
  handleSecurityError
} from '@/lib/util'

export const runtime = 'nodejs'

// SummarizerService handles model configuration

// Utility functions moved to @/lib/util for better organization and reusability

// Rate limiting logic moved to @/lib/util/rateLimitUtils.js

// Enhanced POST handler with security monitoring
const enhancedPOSTHandler = withSecurityMonitoring(withRateLimitMonitoring(async (request) => {
  try {
    // Extract API key for rate limiting check
    let apiKey
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7)
    }
    if (!apiKey) {
      const apiKeyHeader = request.headers.get('apikey')
      if (apiKeyHeader) {
        apiKey = apiKeyHeader
      }
    }

    // 1) Validate API key
    const authResult = await validateApiKey(request, { requireBody: false })
    if (!authResult.success) {
      return createErrorResponse(authResult.error, authResult.message, authResult.status)
    }

    // 2) Check enhanced rate limiting (includes IP-based protection)
    const rateLimitResult = await checkEnhancedRateLimit(request, apiKey)

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        rateLimitResult.blocked ? 'Temporarily Blocked' : 'Rate Limited',
        rateLimitResult.blockReason || 'Rate limit exceeded',
        429
      );
    }

    // 3) Initialize summarizer (will be done in the extraction function)

    // 4) Validate request with comprehensive input validation
    const validationSchema = {
      requireJson: true,
      requireBody: true,
      fields: {
        githubUrl: {
          required: true,
          type: 'url',
          sanitize: false // URL is already sanitized by validateGitHubUrl
        }
      }
    };

    const validation = await validateRequest(request, validationSchema);
    if (!validation.isValid) {
      return createErrorResponse(validation.error, validation.error, validation.status);
    }

    const { githubUrl } = validation.sanitizedBody;

    // Use the new comprehensive method that handles all GitHub API calls and summarization
    const result = await summarizerService.summarizeFromGitHubUrl(githubUrl)

    // Get current usage info for response (skip for demo key)
    let usageInfo = null
    if (apiKey !== 'Demo_API_Key') {
      usageInfo = await getApiKeyUsageInfo(apiKey)
    }

    return createSuccessResponse({
      modelUsed: result.modelUsed,
      readmeSource: result.readmeSource,
      githubSummary: result.githubSummary,
      coolFacts: result.cool_facts,
      toolsUsed: result.tools_used,
      stars: result.stars,
      latestVersion: result.latest_version,
      licenseType: result.license_type,
      websiteUrl: result.website_url,
      usage: usageInfo
    })
  } catch (error) {
    console.error('GitHub summarizer error:', error)

    // Handle rate limiting errors specifically
    if (error.message && error.message.includes('Rate limited')) {
      return createErrorResponse(
        'Rate Limited',
        'GitHub API rate limit exceeded. Please try again later or use authentication.',
        429
      )
    }

    return createInternalErrorResponse('Unexpected error', error)
  }
}));

// Export the enhanced handler
export async function POST(request) {
  return enhancedPOSTHandler(request);
}

/**
 * GET /api/github-summarizer
 */
export async function GET() {
  return createApiDocsResponse(summarizerService.getModelName())
}

// Utility functions moved to SummarizerService class for better organization and reusability
