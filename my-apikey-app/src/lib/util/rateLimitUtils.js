/**
 * Enhanced rate limiting utilities for API security and DDoS protection
 * Following SOLID principles - Single Responsibility: Handle rate limiting logic
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// In-memory cache for rate limiting (for development/performance)
const rateLimitCache = new Map();

/**
 * IP-based rate limiting configuration
 */
const IP_RATE_LIMITS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // requests per window
  blockDurationMs: 60 * 60 * 1000, // 1 hour block for abuse
};

/**
 * API key rate limiting configuration
 */
const API_KEY_LIMITS = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // requests per window per API key
};

/**
 * Rate limit check result interface
 * @typedef {{allowed: boolean, usage: number, limit: number, blocked?: boolean, blockReason?: string}} RateLimitResult
 */

/**
 * Gets client IP address from request headers
 * @param {Request} request - The request object
 * @returns {string} - Client IP address
 */
function getClientIP(request) {
  // Check for common proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  // Use the first available IP, preferring more specific headers
  if (realIP) return realIP.split(',')[0].trim();
  if (clientIP) return clientIP.split(',')[0].trim();
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  // Fallback to a default (shouldn't happen in real deployment)
  return 'unknown';
}

/**
 * Checks IP-based rate limiting
 * @param {string} ip - Client IP address
 * @returns {Promise<{allowed: boolean, blocked?: boolean, blockReason?: string}>}
 */
async function checkIPRateLimit(ip) {
  const now = Date.now();
  const cacheKey = `ip:${ip}`;

  // Check cache first
  const cached = rateLimitCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < IP_RATE_LIMITS.windowMs) {
    if (cached.blockedUntil && now < cached.blockedUntil) {
      return {
        allowed: false,
        blocked: true,
        blockReason: 'IP temporarily blocked due to excessive requests'
      };
    }

    if (cached.requestCount >= IP_RATE_LIMITS.maxRequests) {
      // Block this IP for abuse
      cached.blockedUntil = now + IP_RATE_LIMITS.blockDurationMs;
      return {
        allowed: false,
        blocked: true,
        blockReason: 'Rate limit exceeded - IP temporarily blocked'
      };
    }

    cached.requestCount++;
    return { allowed: true };
  }

  // Initialize or reset cache entry
  rateLimitCache.set(cacheKey, {
    timestamp: now,
    requestCount: 1,
    blockedUntil: null
  });

  return { allowed: true };
}

/**
 * Enhanced rate limiting that includes IP-based protection
 * @param {Request} request - The request object
 * @param {string} apiKeyValue - The API key value
 * @returns {Promise<{allowed: boolean, blocked?: boolean, blockReason?: string, usage?: number, limit?: number}>}
 */
export async function checkEnhancedRateLimit(request, apiKeyValue) {
  const clientIP = getClientIP(request);

  // First check IP-based rate limiting
  const ipCheck = await checkIPRateLimit(clientIP);
  if (!ipCheck.allowed) {
    return ipCheck;
  }

  // For demo key, skip API key rate limiting
  if (apiKeyValue === 'Demo_API_Key') {
    return { allowed: true, usage: 0, limit: 0 };
  }

  // Check API key rate limiting (existing logic)
  const apiKeyCheck = await checkAndIncrementRateLimit(apiKeyValue);

  return {
    allowed: apiKeyCheck.allowed,
    usage: apiKeyCheck.usage,
    limit: apiKeyCheck.limit,
    blocked: apiKeyCheck.allowed ? false : true,
    blockReason: apiKeyCheck.allowed ? undefined : 'API key rate limit exceeded'
  };
}

/**
 * Checks rate limit and increments usage for an API key
 * @param {string} apiKeyValue - The API key value to check
 * @param {string} [skipKey='Demo_API_Key'] - API key value to skip rate limiting for (e.g., demo key)
 * @returns {Promise<RateLimitResult>} Rate limit check result
 */
export async function checkAndIncrementRateLimit(apiKeyValue, skipKey = 'Demo_API_Key') {
  // Skip rate limiting for demo key
  if (apiKeyValue === skipKey) {
    return { allowed: true, usage: 0, limit: 0 };
  }

  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured, skipping rate limit check');
    return { allowed: true, usage: 0, limit: 0 };
  }

  try {
    // Get current API key data
    const { data: apiKeyData, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, usage_count, rate_limit, is_active')
      .eq('key_value', apiKeyValue)
      .single();

    if (fetchError || !apiKeyData) {
      console.error('Error fetching API key for rate limit:', fetchError);
      return { allowed: false, usage: 0, limit: 0 };
    }

    // Check if API key is active
    if (!apiKeyData.is_active) {
      return {
        allowed: false,
        usage: apiKeyData.usage_count,
        limit: apiKeyData.rate_limit
      };
    }

    const currentUsage = apiKeyData.usage_count || 0;
    const rateLimit = apiKeyData.rate_limit || 100; // Default to 100 if not set

    // Check if usage exceeds limit
    if (currentUsage >= rateLimit) {
      return {
        allowed: false,
        usage: currentUsage,
        limit: rateLimit
      };
    }

    // Increment usage count
    const newUsageCount = currentUsage + 1;
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({
        usage_count: newUsageCount,
        last_used: new Date().toISOString()
      })
      .eq('key_value', apiKeyValue);

    if (updateError) {
      console.error('Error updating API key usage:', updateError);
      // Don't fail the request, just log the error
    }

    return {
      allowed: true,
      usage: newUsageCount,
      limit: rateLimit
    };

  } catch (error) {
    console.error('Error in rate limit check:', error);
    // On error, allow the request but log the issue
    return { allowed: true, usage: 0, limit: 0 };
  }
}

/**
 * Gets current usage information for an API key
 * @param {string} apiKeyValue - The API key value
 * @param {string} [skipKey='Demo_API_Key'] - API key value to skip for (e.g., demo key)
 * @returns {Promise<{usage: number, limit: number, remaining: number} | null>} Usage info or null if not found
 */
export async function getApiKeyUsageInfo(apiKeyValue, skipKey = 'Demo_API_Key') {
  if (apiKeyValue === skipKey || !isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('usage_count, rate_limit')
      .eq('key_value', apiKeyValue)
      .single();

    if (!apiKeyData) {
      return null;
    }

    return {
      usage: apiKeyData.usage_count,
      limit: apiKeyData.rate_limit,
      remaining: Math.max(0, apiKeyData.rate_limit - apiKeyData.usage_count)
    };
  } catch (error) {
    console.error('Error fetching usage info:', error);
    return null;
  }
}
