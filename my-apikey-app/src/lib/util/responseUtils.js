/**
 * Response formatting utilities for API endpoints
 * Following SOLID principles - Single Responsibility: Handle response creation and formatting
 */

/**
 * Creates a standardized success response for GitHub summarizer
 * @param {object} params - Response parameters
 * @param {string} params.modelUsed - The model used for processing
 * @param {string} params.readmeSource - URL of the README source
 * @param {string} params.githubSummary - The generated summary
 * @param {string[]} params.coolFacts - Array of cool facts extracted from README
 * @param {string[]} params.toolsUsed - Array of tools, languages, frameworks, databases used
 * @param {number} params.stars - GitHub repository stars count
 * @param {string} params.latestVersion - Latest version of the repository
 * @param {string} params.licenseType - License type of the repository
 * @param {string} params.websiteUrl - Website URL of the repository (from GitHub homepage or README)
 * @param {object|null} params.usage - Usage information (optional)
 * @returns {Response} Formatted success response
 */
export function createSuccessResponse({
  modelUsed,
  readmeSource,
  githubSummary,
  coolFacts = [],
  toolsUsed = [],
  stars = 0,
  latestVersion = 'N/A',
  licenseType = 'Not specified',
  websiteUrl = 'Not specified',
  usage = null
}) {
  return Response.json({
    success: true,
    message: 'Repository summarized successfully.',
    modelUsed,
    readmeSource,
    githubSummary,
    cool_facts: coolFacts,
    tools_used: toolsUsed,
    stars,
    latest_version: latestVersion,
    license_type: licenseType,
    website_url: websiteUrl,
    usage
  });
}

/**
 * Creates an error response with consistent formatting
 * @param {string} error - Error type/key
 * @param {string} message - Human-readable error message
 * @param {number} status - HTTP status code
 * @returns {Response} Formatted error response
 */
export function createErrorResponse(error, message, status) {
  return Response.json(
    {
      error,
      message
    },
    { status }
  );
}

/**
 * Creates a rate limit exceeded response
 * @param {number} usage - Current usage count
 * @param {number} limit - Rate limit
 * @returns {Response} Rate limit error response
 */
export function createRateLimitResponse(usage, limit) {
  return Response.json(
    {
      error: 'Rate limit exceeded',
      message: `API key usage limit reached. Current usage: ${usage}/${limit} requests. Please try again tomorrow or contact support to increase your limit.`,
      usage,
      limit
    },
    { status: 429 }
  );
}

/**
 * Creates a bad request response
 * @param {string} message - Error message
 * @param {string} [error='Bad Request'] - Error type (optional)
 * @returns {Response} Bad request error response
 */
export function createBadRequestResponse(message, error = 'Bad Request') {
  return Response.json(
    {
      error,
      message
    },
    { status: 400 }
  );
}

/**
 * Creates an internal server error response
 * @param {string} [message] - Custom error message (optional)
 * @param {Error} [originalError] - Original error object for logging (optional)
 * @returns {Response} Internal server error response
 */
export function createInternalErrorResponse(message = 'Unexpected error', originalError = null) {
  if (originalError) {
    console.error('Internal server error:', originalError);
  }

  return Response.json(
    {
      error: 'Internal server error',
      message: originalError?.message ?? message
    },
    { status: 500 }
  );
}

/**
 * Creates API documentation response for GET requests
 * @param {string} chatModel - LLM model being used
 * @returns {Response} API documentation response
 */
export function createApiDocsResponse(chatModel) {
  return Response.json({
    name: 'GitHub Repository Summarizer API',
    version: '2.0.0',
    description: `
      Summarize the following README.md content. Extract:
      - githubSummary: A 2-3 sentence overview.
      - cool_facts: Array of 3-5 interesting facts (e.g., key features, unique aspects).
      - tools_used: Array of tools/technologies mentioned (e.g., languages, frameworks).
      - website_url: Any website URLs mentioned in the README.
      - stars: GitHub repository star count
      - latest_version: Latest version/tag of the repository
      - license_type: License type of the repository
      - website_url: Website URL of the repository (from GitHub homepage or README)

      **README.md** content

      Output ONLY as JSON: {"githubSummary": "...", "cool_facts": [...], "tools_used": [...], "website_url": "...", "stars": ..., "latest_version": "...", "license_type": "...", "website_url": "..."}
    `,
    authentication: {
      required: true,
      methods: [
        'Authorization: Bearer <api_key>',
        'apikey: <api_key>',
        'x-api-key: <api_key>',
        'JSON body: { "apiKey": "<api_key>" }',
      ],
    },
    parameters: {
      githubUrl: 'GitHub repository URL, e.g. https://github.com/OWNER/REPO',
    },
    models: {
      llm: chatModel,
    },
  });
}
