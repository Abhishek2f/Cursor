/**
 * Input validation utilities for API security
 * Following SOLID principles - Single Responsibility: Handle input validation
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Validates and sanitizes a GitHub URL
 * @param {string} url - The GitHub URL to validate
 * @returns {Object} - Validation result with sanitized URL or error
 */
export function validateGitHubUrl(url) {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'GitHub URL is required and must be a string',
      sanitized: null
    };
  }

  // Basic URL validation
  try {
    const parsedUrl = new URL(url);

    // Must be HTTPS for security
    if (parsedUrl.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'GitHub URL must use HTTPS protocol',
        sanitized: null
      };
    }

    // Must be github.com domain
    if (!parsedUrl.hostname.endsWith('github.com')) {
      return {
        isValid: false,
        error: 'URL must be from github.com domain',
        sanitized: null
      };
    }

    // Must follow GitHub repository pattern: /owner/repo
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      return {
        isValid: false,
        error: 'GitHub URL must be in format: https://github.com/owner/repository',
        sanitized: null
      };
    }

    // Sanitize the URL
    const sanitizedUrl = `https://github.com/${pathParts[0]}/${pathParts[1]}`;

    return {
      isValid: true,
      error: null,
      sanitized: sanitizedUrl
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format',
      sanitized: null
    };
  }
}

/**
 * Validates and sanitizes API key input
 * @param {string} apiKey - The API key to validate
 * @returns {Object} - Validation result
 */
export function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return {
      isValid: false,
      error: 'API key is required and must be a string',
      sanitized: null
    };
  }

  // Remove any whitespace
  const sanitized = apiKey.trim();

  // Check minimum length (adjust based on your API key format)
  if (sanitized.length < 10) {
    return {
      isValid: false,
      error: 'API key must be at least 10 characters long',
      sanitized: null
    };
  }

  // Check for suspicious patterns
  if (/[<>'"\\]/.test(sanitized)) {
    return {
      isValid: false,
      error: 'API key contains invalid characters',
      sanitized: null
    };
  }

  return {
    isValid: true,
    error: null,
    sanitized: sanitized
  };
}

/**
 * Validates and sanitizes JSON input
 * @param {any} data - The data to validate
 * @returns {Object} - Validation result
 */
export function validateJsonInput(data) {
  if (data === null || data === undefined) {
    return {
      isValid: false,
      error: 'Request body is required',
      sanitized: null
    };
  }

  // Check if it's an object
  if (typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      error: 'Request body must be a JSON object',
      sanitized: null
    };
  }

  // Validate object size to prevent DoS attacks
  const jsonString = JSON.stringify(data);
  if (jsonString.length > 1024 * 1024) { // 1MB limit
    return {
      isValid: false,
      error: 'Request body is too large (max 1MB)',
      sanitized: null
    };
  }

  return {
    isValid: true,
    error: null,
    sanitized: data
  };
}

/**
 * Sanitizes string input to prevent XSS attacks
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Use DOMPurify for HTML sanitization if available
  try {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  } catch (error) {
    // Fallback to basic sanitization
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
}

/**
 * Validates request origin for CSRF protection
 * @param {Request} request - The request object
 * @param {string[]} allowedOrigins - Array of allowed origins
 * @returns {boolean} - Whether the origin is allowed
 */
export function validateOrigin(request, allowedOrigins = []) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // If no origin header (same-origin request), allow it
  if (!origin) {
    return true;
  }

  // Check against allowed origins
  if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    return false;
  }

  // Additional check with referer header for extra security
  if (referer && !referer.startsWith(origin)) {
    return false;
  }

  return true;
}

/**
 * Comprehensive input validation for API requests
 * @param {Request} request - The request object
 * @param {Object} schema - Validation schema
 * @returns {Promise<Object>} - Validation result
 */
export async function validateRequest(request, schema = {}) {
  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (schema.requireJson && (!contentType || !contentType.includes('application/json'))) {
      return {
        isValid: false,
        error: 'Content-Type must be application/json',
        status: 400
      };
    }

    // Validate origin if specified
    if (schema.allowedOrigins && schema.allowedOrigins.length > 0) {
      if (!validateOrigin(request, schema.allowedOrigins)) {
        return {
          isValid: false,
          error: 'Origin not allowed',
          status: 403
        };
      }
    }

    // Parse and validate JSON body if required
    if (schema.requireBody) {
      let body;
      try {
        body = await request.json();
      } catch (error) {
        return {
          isValid: false,
          error: 'Invalid JSON in request body',
          status: 400
        };
      }

      const bodyValidation = validateJsonInput(body);
      if (!bodyValidation.isValid) {
        return {
          isValid: false,
          error: bodyValidation.error,
          status: 400
        };
      }

      // Validate specific fields if schema provided
      if (schema.fields) {
        for (const [fieldName, fieldRules] of Object.entries(schema.fields)) {
          if (fieldRules.required && (!body[fieldName] || body[fieldName] === '')) {
            return {
              isValid: false,
              error: `Field '${fieldName}' is required`,
              status: 400
            };
          }

          if (body[fieldName] && fieldRules.type === 'url') {
            const urlValidation = validateGitHubUrl(body[fieldName]);
            if (!urlValidation.isValid) {
              return {
                isValid: false,
                error: urlValidation.error,
                status: 400
              };
            }
            body[fieldName] = urlValidation.sanitized;
          }

          if (body[fieldName] && fieldRules.sanitize) {
            body[fieldName] = sanitizeString(body[fieldName]);
          }
        }
      }

      return {
        isValid: true,
        error: null,
        sanitizedBody: body,
        status: 200
      };
    }

    return {
      isValid: true,
      error: null,
      status: 200
    };

  } catch (error) {
    return {
      isValid: false,
      error: 'Request validation failed',
      status: 400
    };
  }
}
