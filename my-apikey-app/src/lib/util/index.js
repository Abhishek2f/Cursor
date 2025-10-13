/**
 * Utility functions index - centralized exports for all utilities
 * Following SOLID principles - Interface Segregation: Export only what's needed
 */

// Note: GitHub utility functions moved to SummarizerService for better encapsulation

// Rate limiting utilities
export {
  checkAndIncrementRateLimit,
  getApiKeyUsageInfo,
  checkEnhancedRateLimit
} from './rateLimitUtils.js';

// Summarization utilities
export { SummarizerService, summarizerService } from '../summarizerService.js'

// Response formatting utilities
export {
  createSuccessResponse,
  createErrorResponse,
  createRateLimitResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
  createApiDocsResponse
} from './responseUtils.js';

// Input validation utilities
export {
  validateGitHubUrl,
  validateApiKey,
  validateJsonInput,
  sanitizeString,
  validateOrigin,
  validateRequest
} from './validation.js';

// Security monitoring utilities
export {
  logSecurityEvent,
  handleSecurityError,
  validateRequestSecurity,
  withSecurityMonitoring,
  withRateLimitMonitoring
} from './security.js';