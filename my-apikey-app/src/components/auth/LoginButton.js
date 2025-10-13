'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/Button"
import { DarkModeToggle } from "@/components/ui/DarkModeToggle"
import { useTheme } from "@/components/providers/ThemeProvider"

export default function LoginButton() {
  const { data: session, status } = useSession()
  const { isDark } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleSignIn = () => {
    setShowLoginModal(true)
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setShowLoginModal(false)

    try {
      // Trigger Google SSO and redirect to dashboard
      await signIn('google', {
        callbackUrl: '/dashboard'
      })
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  // Handle modal state and authentication
  useEffect(() => {
    if (!showLoginModal && isLoading) {
      // Modal was closed and we're loading - check if user is authenticated
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/auth/session')
          const sessionData = await response.json()

          if (sessionData?.user) {
            // User is authenticated, redirect to dashboard
            window.location.href = '/dashboard'
          } else {
            // Authentication failed or was cancelled
            setIsLoading(false)
          }
        } catch (error) {
          console.error('Error checking session:', error)
          setIsLoading(false)
        }
      }

      // Small delay to allow session to update
      setTimeout(checkAuth, 1500)
    }
  }, [showLoginModal, isLoading])

  const handleSignOut = async () => {
    setIsLoading(true)
    setIsDropdownOpen(false)
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Loading...</span>
      </div>
    )
  }

  if (session) {

    return (
      <div className="flex items-center gap-3">
        {/* Profile Picture with Hover/Click Dropdown */}
        <div className="relative profile-dropdown">
          {session.user?.image && !imageError ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onError={() => setImageError(true)}
              style={{ width: 'auto', height: 'auto' }}
            />
          ) : (
            /* Fallback: Show initials when no image or image fails */
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title={`Image: ${session.user?.image || 'none'}`} // Debug info
            >
              {(session.user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session.user?.email}
                </p>
              </div>

              {/* Dark Mode Toggle */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-300 ${
                      isDark
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isDark ? 'Dark' : 'Light'}
                    </span>
                  </div>
                  <DarkModeToggle />
                </div>
              </div>

              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:text-red-400 transition-colors duration-200"
              >
                {isLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          )}
        </div>

        {/* Sign Out Button (visible on mobile/small screens) */}
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="sm:hidden px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {isLoading ? '...' : 'Sign out'}
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
        aria-label="Login to GitVault Github Analyser"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Login</span>
        )}
      </button>

      {/* Custom Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-300">
          {/* Creative Background with Gradient Overlay */}
          <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm"></div>
          <div className="fixed inset-0 bg-black/30"></div>

          {/* Floating particles effect */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse delay-700"></div>
            <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-indigo-400/40 rounded-full animate-pulse delay-500"></div>
          </div>

          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
              {/* Close button */}
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  setIsLoading(false)
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100/80 transition-all duration-200 group z-10"
              >
                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="p-8">
                <div className="text-center">
                  {/* Logo/Icon */}
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome Back</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Sign in to your account to continue your journey
                  </p>

                  {/* Google Login Button */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-6 py-4 border-2 border-gray-200 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-purple-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                  >
                    <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="group-hover:text-purple-600 transition-colors duration-200">
                      {isLoading ? 'Signing you in...' : 'Continue with Google'}
                    </span>
                  </button>

                  {/* Additional Info */}
                  <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                    Secure sign-in powered by Google Authentication
                  </p>

                  {/* Cancel Button */}
                  <button
                    onClick={() => {
                      setShowLoginModal(false)
                      setIsLoading(false)
                    }}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 underline-offset-4 hover:underline"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


