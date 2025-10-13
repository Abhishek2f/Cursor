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
 * Generate time-series data for charts
 * @param {Array} apiKeys - Array of API key data
 * @param {string} period - Time period ('7d', '30d', '90d')
 * @returns {Object} Time-series analytics data
 */
function generateTimeSeriesData(apiKeys, period = '30d') {
  const now = new Date()
  const periods = {
    '7d': 7,
    '30d': 30,
    '90d': 90
  }

  const days = periods[period] || 30
  const timeSeriesData = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // Calculate total usage for this date across all keys
    const dayUsage = apiKeys.reduce((total, key) => {
      // For demo purposes, distribute usage across time period
      // In a real app, you'd track usage by date
      const avgDailyUsage = key.usage_count / Math.max(1, days)
      return total + Math.floor(avgDailyUsage * (Math.random() * 0.5 + 0.75)) // Add some randomization
    }, 0)

    timeSeriesData.push({
      date: dateStr,
      usage: dayUsage,
      requests: Math.floor(dayUsage * (Math.random() * 0.3 + 0.85)) // Simulated requests
    })
  }

  return timeSeriesData
}

/**
 * Generate key performance analytics
 * @param {Array} apiKeys - Array of API key data
 * @returns {Object} Key performance metrics
 */
function generateKeyPerformanceAnalytics(apiKeys) {
  if (apiKeys.length === 0) {
    return {
      totalKeys: 0,
      activeKeys: 0,
      totalUsage: 0,
      averageUsage: 0,
      mostUsedKey: null,
      leastUsedKey: null,
      rateLimitUtilization: 0
    }
  }

  const activeKeys = apiKeys.filter(key => key.isActive !== false)
  const totalUsage = apiKeys.reduce((sum, key) => sum + (key.usage_count || 0), 0)
  const totalRateLimit = apiKeys.reduce((sum, key) => sum + (key.rate_limit || 100), 0)
  const averageUsage = totalUsage / apiKeys.length

  // Find most and least used keys
  const sortedByUsage = [...apiKeys].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
  const mostUsedKey = sortedByUsage[0]
  const leastUsedKey = sortedByUsage[sortedByUsage.length - 1]

  return {
    totalKeys: apiKeys.length,
    activeKeys: activeKeys.length,
    totalUsage,
    averageUsage: Math.round(averageUsage * 100) / 100,
    mostUsedKey: mostUsedKey ? {
      name: mostUsedKey.name,
      usage: mostUsedKey.usage_count || 0,
      utilization: Math.round(((mostUsedKey.usage_count || 0) / (mostUsedKey.rate_limit || 100)) * 100)
    } : null,
    leastUsedKey: leastUsedKey ? {
      name: leastUsedKey.name,
      usage: leastUsedKey.usage_count || 0,
      utilization: Math.round(((leastUsedKey.usage_count || 0) / (leastUsedKey.rate_limit || 100)) * 100)
    } : null,
    rateLimitUtilization: totalRateLimit > 0 ? Math.round((totalUsage / totalRateLimit) * 100) : 0
  }
}

/**
 * Generate usage distribution data for pie chart
 * @param {Array} apiKeys - Array of API key data
 * @returns {Array} Usage distribution data
 */
function generateUsageDistribution(apiKeys) {
  return apiKeys.map(key => ({
    name: key.name || 'Unnamed Key',
    usage: key.usage_count || 0,
    utilization: Math.round(((key.usage_count || 0) / (key.rate_limit || 100)) * 100),
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)` // Random colors for demo
  })).sort((a, b) => b.usage - a.usage)
}

/**
 * GET /api/analytics
 * Get comprehensive analytics data for the authenticated user's API keys
 */
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access analytics' },
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

    // Fetch user's API keys with full data for analytics
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys for analytics:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch analytics data' },
        { status: 500 }
      )
    }

    // Generate analytics data
    const keyPerformance = generateKeyPerformanceAnalytics(apiKeys || [])
    const timeSeriesData = generateTimeSeriesData(apiKeys || [], '30d')
    const usageDistribution = generateUsageDistribution(apiKeys || [])

    // Calculate additional metrics
    const successRate = 99.2 // Simulated - in real app would calculate from actual data
    const avgResponseTime = 120 + Math.floor(Math.random() * 80) // Simulated variation

    const analyticsData = {
      overview: {
        totalRequests: keyPerformance.totalUsage,
        successRate,
        avgResponseTime,
        activeKeys: keyPerformance.activeKeys,
        totalKeys: keyPerformance.totalKeys
      },
      keyPerformance,
      timeSeriesData,
      usageDistribution,
      // Additional insights
      insights: {
        topPerformingKey: keyPerformance.mostUsedKey,
        efficiencyScore: Math.max(0, 100 - (keyPerformance.rateLimitUtilization || 0)),
        recommendations: generateRecommendations(keyPerformance, apiKeys || [])
      }
    }

    return NextResponse.json({ analytics: analyticsData }, { status: 200 })

  } catch (error) {
    console.error('Error in GET /api/analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * Generate personalized recommendations based on usage patterns
 * @param {Object} keyPerformance - Key performance metrics
 * @param {Array} apiKeys - Array of API keys
 * @returns {Array} Array of recommendation objects
 */
function generateRecommendations(keyPerformance, apiKeys) {
  const recommendations = []

  if (keyPerformance.rateLimitUtilization > 80) {
    recommendations.push({
      type: 'warning',
      title: 'High Rate Limit Usage',
      message: 'Consider upgrading your rate limits or optimizing API usage patterns.',
      action: 'Review rate limits'
    })
  }

  if (keyPerformance.activeKeys > 5) {
    recommendations.push({
      type: 'info',
      title: 'Multiple Active Keys',
      message: 'You have several active API keys. Consider consolidating unused keys for better management.',
      action: 'Clean up keys'
    })
  }

  if (keyPerformance.averageUsage < 10) {
    recommendations.push({
      type: 'tip',
      title: 'Low Usage Detected',
      message: 'Your API keys are underutilized. Consider increasing usage or reviewing your integration.',
      action: 'Increase usage'
    })
  }

  return recommendations
}
