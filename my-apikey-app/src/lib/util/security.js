/**
 * Security monitoring and logging utilities
 * Following SOLID principles - Single Responsibility: Handle security monitoring
 */

/**
 * Security event types for logging
 */
const SECURITY_EVENTS = {
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_FAILURE: 'AUTHENTICATION_FAILURE',
  INVALID_INPUT: 'INVALID_INPUT',
  BLOCKED_REQUEST: 'BLOCKED_REQUEST',
  API_ABUSE: 'API_ABUSE'
};

/**
 * Logs a security event
 * @param {string} eventType - Type of security event
 * @param {Object} details - Event details
 * @param {Request} request - The request object (optional)
 */
export function logSecurityEvent(eventType, details, request = null) {
  const timestamp = new Date().toISOString();
  const clientIP = request ? getClientIP(request) : 'unknown';
  const userAgent = request ? request.headers.get('user-agent') : 'unknown';

  const logEntry = {
    timestamp,
    eventType,
    clientIP,
    userAgent,
    details,
    severity: getSeverityLevel(eventType)
  };

  // In production, this would be sent to a proper logging service
  // For now, we'll use console with structured logging
  console.warn(`[SECURITY] ${eventType}:`, JSON.stringify(logEntry, null, 2));

  // TODO: In production, implement:
  // - Send to security monitoring service (e.g., Datadog, CloudWatch)
  // - Store in security events database
  // - Trigger alerts for high-severity events
  // - IP reputation checking
}

/**
 * Gets severity level for security events
 * @param {string} eventType - Type of security event
 * @returns {string} - Severity level (low, medium, high, critical)
 */
function getSeverityLevel(eventType) {
  const severityMap = {
    [SECURITY_EVENTS.SUSPICIOUS_ACTIVITY]: 'medium',
    [SECURITY_EVENTS.RATE_LIMIT_EXCEEDED]: 'medium',
    [SECURITY_EVENTS.AUTHENTICATION_FAILURE]: 'high',
    [SECURITY_EVENTS.INVALID_INPUT]: 'low',
    [SECURITY_EVENTS.BLOCKED_REQUEST]: 'medium',
    [SECURITY_EVENTS.API_ABUSE]: 'high'
  };

  return severityMap[eventType] || 'medium';
}

/**
 * Gets client IP address from request headers
 * @param {Request} request - The request object
 * @returns {string} - Client IP address
 */
function getClientIP(request) {
  if (!request) return 'unknown';

  // Check for common proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  // Use the first available IP, preferring more specific headers
  if (realIP) return realIP.split(',')[0].trim();
  if (clientIP) return clientIP.split(',')[0].trim();
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return 'unknown';
}

/**
 * Enhanced error handler with security monitoring
 * @param {Error} error - The error that occurred
 * @param {Request} request - The request object (optional)
 * @param {Object} context - Additional context information
 * @returns {Object} - Sanitized error response
 */
export function handleSecurityError(error, request = null, context = {}) {
  const clientIP = getClientIP(request);

  // Determine if this is a security-related error
  const isSecurityError = isSecurityRelatedError(error);

  if (isSecurityError) {
    logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
      error: error.message,
      stack: error.stack,
      context,
      clientIP
    }, request);
  }

  // Return sanitized error response (never expose internal details)
  return {
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.',
    status: 500,
    // In development, include more details for debugging
    ...(process.env.NODE_ENV === 'development' && {
      devError: error.message,
      devStack: error.stack
    })
  };
}

/**
 * Determines if an error is security-related
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is security-related
 */
function isSecurityRelatedError(error) {
  const securityKeywords = [
    'unauthorized',
    'forbidden',
    'invalid token',
    'authentication failed',
    'access denied',
    'rate limit',
    'blocked',
    'suspicious',
    'malicious',
    'xss',
    'csrf',
    'injection'
  ];

  const errorMessage = error.message?.toLowerCase() || '';
  return securityKeywords.some(keyword => errorMessage.includes(keyword));
}

/**
 * Validates request for common attack patterns
 * @param {Request} request - The request object
 * @returns {Object} - Validation result
 */
export function validateRequestSecurity(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';

  // Check for suspicious user agents
  const suspiciousUserAgents = [
    'sqlmap',
    'nmap',
    'nikto',
    'dirbuster',
    'gobuster',
    'masscan',
    'zgrab',
    'masscan',
    'acunetix',
    'nessus',
    'openvas',
    'qualysguard',
    'rapid7',
    'tenable'
  ];

  const lowerUserAgent = userAgent.toLowerCase();
  const suspiciousUA = suspiciousUserAgents.find(agent =>
    lowerUserAgent.includes(agent.toLowerCase())
  );

  if (suspiciousUA) {
    logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
      reason: 'Suspicious user agent detected',
      userAgent,
      suspiciousAgent: suspiciousUA
    }, request);

    return {
      isValid: false,
      error: 'Request blocked due to security policy',
      status: 403
    };
  }

  // Check for missing or suspicious referer (basic CSRF protection)
  if (!referer && request.method !== 'GET') {
    // For non-GET requests, require a referer (basic CSRF protection)
    // Note: This is basic protection - proper CSRF tokens should be implemented
    logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
      reason: 'Missing referer header on non-GET request',
      method: request.method
    }, request);

    return {
      isValid: false,
      error: 'Request blocked due to security policy',
      status: 403
    };
  }

  return { isValid: true };
}

/**
 * Middleware function to add security monitoring to API routes
 * @param {Function} handler - The API route handler
 * @returns {Function} - Enhanced handler with security monitoring
 */
export function withSecurityMonitoring(handler) {
  return async (request, ...args) => {
    try {
      // Validate request security
      const securityValidation = validateRequestSecurity(request);
      if (!securityValidation.isValid) {
        return Response.json(securityValidation, { status: securityValidation.status });
      }

      // Execute the original handler
      const response = await handler(request, ...args);

      // Log successful requests for monitoring (optional)
      // This could be useful for analytics and detecting patterns

      return response;

    } catch (error) {
      // Handle errors with security monitoring
      const errorResponse = handleSecurityError(error, request);

      // Log the error if it's security-related
      if (errorResponse.status >= 400) {
        logSecurityEvent(SECURITY_EVENTS.AUTHENTICATION_FAILURE, {
          error: error.message,
          status: errorResponse.status,
          url: request.url,
          method: request.method
        }, request);
      }

      return Response.json(errorResponse, { status: errorResponse.status });
    }
  };
}

/**
 * Rate limiting middleware with security monitoring
 * @param {Function} handler - The API route handler
 * @returns {Function} - Enhanced handler with rate limiting
 */
export function withRateLimitMonitoring(handler) {
  return async (request, ...args) => {
    const startTime = Date.now();

    try {
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;

      // Log slow requests (potential DoS attempts)
      if (duration > 5000) { // 5 seconds
        logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
          reason: 'Unusually slow request',
          duration,
          url: request.url,
          method: request.method
        }, request);
      }

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Log errors with timing information
      handleSecurityError(error, request, { duration, url: request.url });

      throw error;
    }
  };
}
