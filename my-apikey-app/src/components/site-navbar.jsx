"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import LoginButton from "@/components/auth/LoginButton"
import { useSession, signIn } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function SiteNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isDashboardPage = pathname === '/dashboard'
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [isSignUpLoading, setIsSignUpLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignUp = () => {
    setShowSignUpModal(true)
  }

  const handleGoogleSignUp = async () => {
    setIsSignUpLoading(true)
    setShowSignUpModal(false)

    try {
      // Trigger Google SSO and redirect to dashboard (same as login)
      await signIn('google', {
        callbackUrl: '/dashboard'
      })
    } catch (error) {
      console.error('Sign up error:', error)
      setIsSignUpLoading(false)
    }
  }

  // Handle modal state and authentication
  useEffect(() => {
    if (!showSignUpModal && isSignUpLoading) {
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
            setIsSignUpLoading(false)
          }
        } catch (error) {
          console.error('Error checking session:', error)
          setIsSignUpLoading(false)
        }
      }

      // Small delay to allow session to update
      setTimeout(checkAuth, 1500)
    }
  }, [showSignUpModal, isSignUpLoading])

  return (
    <>
      <nav className="w-full border-b border-border/50 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
        <div
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
        <Link
          href="/"
          className={cn(
            "flex items-center font-bold text-xl md:text-2xl group transition-all duration-300 ease-in-out",
            "hover:scale-105"
          )}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0 mr-3 relative overflow-hidden">
            <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 animate-pulse"></div>
          </div>
          <span className="bg-gradient-to-r from-gray-900 via-purple-700 to-gray-900 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-purple-600 transition-all duration-300">
            GitVault Github Analyser
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative p-2.5 rounded-xl md:hidden hover:bg-background/80 transition-all duration-300 group"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`w-5 h-0.5 bg-muted-foreground transition-all duration-300 ${
                  isMobileMenuOpen
                    ? 'rotate-45 translate-y-1.5 group-hover:bg-gray-800'
                    : 'rotate-0 translate-y-0 group-hover:bg-gray-800'
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-muted-foreground transition-all duration-300 mt-1 ${
                  isMobileMenuOpen
                    ? 'opacity-0 scale-0'
                    : 'opacity-100 scale-100 group-hover:bg-gray-800'
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-muted-foreground transition-all duration-300 mt-1 ${
                  isMobileMenuOpen
                    ? '-rotate-45 -translate-y-1.5 group-hover:bg-gray-800'
                    : 'rotate-0 translate-y-0 group-hover:bg-gray-800'
                }`}
              />
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isHomePage && (
              <>
                <Link
                  href="#features"
                  className="text-sm font-medium text-muted-foreground hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-200">
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm font-medium text-muted-foreground hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-200">
                  Pricing
                </Link>
              </>
            )}

            {/* Home Button - show when not on home page */}
            {!isHomePage && (
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-foreground bg-background/80 border border-border/50 rounded-full hover:bg-background hover:border-border transform hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-sm hover:shadow-md backdrop-blur-sm"
              >
                Home
              </Link>
            )}

            {/* Dashboard Button - show when user is authenticated and not on dashboard page */}
            {session && !isDashboardPage && (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                Dashboard
              </Link>
            )}

            {/* Login Button - triggers Google SSO and redirects to dashboard */}
            <LoginButton />

            {/* Sign Up Button - only show if user is not logged in */}
            {!session && (
              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={handleSignUp}
                disabled={isSignUpLoading}
                aria-label="Sign up for GitVault Github Analyser"
              >
                {isSignUpLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            {!session && (
              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={handleSignUp}
                disabled={isSignUpLoading}
                aria-label="Sign up for GitVault Github Analyser"
              >
                {isSignUpLoading ? '...' : 'Sign Up'}
              </button>
            )}
          </div>
        </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-in fade-in duration-300">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Menu panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-2xl p-6 animate-in slide-in-from-right duration-300 ease-out">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
              </div>
              <button
                className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-6 h-6 text-muted-foreground group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="space-y-2">
              {isHomePage && (
                <div className="space-y-2">
                  <Link
                    href="#features"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all duration-200 group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-purple-500 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Features
                  </Link>
                  <Link
                    href="#pricing"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all duration-200 group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-purple-500 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Pricing
                  </Link>
                </div>
              )}

              {!isHomePage && (
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:bg-background/80 hover:border hover:border-border/30 rounded-xl transition-all duration-200 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 text-purple-500 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
              )}

              {session && !isDashboardPage && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all duration-200 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 text-purple-500 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </Link>
              )}

              <div className="pt-6 border-t border-border">
                <LoginButton />
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUpModal && (
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
                  setShowSignUpModal(false)
                  setIsSignUpLoading(false)
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100/80 transition-all duration-200 group z-10"
              >
                <svg className="w-5 h-5 text-gray-500 group-hover:text-muted-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="p-8">
                <div className="text-center">
                  {/* Logo/Icon */}
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-2xl font-bold text-foreground mb-3">Welcome to the Future</h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Join thousands of developers who trust our platform for their API management needs
                  </p>

                  {/* Google Sign Up Button */}
                  <button
                    onClick={handleGoogleSignUp}
                    disabled={isSignUpLoading}
                    className="w-full flex justify-center items-center px-6 py-4 border-2 border-gray-200 rounded-xl shadow-sm text-base font-medium text-muted-foreground bg-white hover:bg-gray-50 hover:border-purple-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
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
                      {isSignUpLoading ? 'Creating your account...' : 'Continue with Google'}
                    </span>
                  </button>

                  {/* Additional Info */}
                  <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                    By signing up, you agree to our{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Privacy Policy
                    </a>
                  </p>

                  {/* Cancel Button */}
                  <button
                    onClick={() => {
                      setShowSignUpModal(false)
                      setIsSignUpLoading(false)
                    }}
                    className="mt-4 text-sm text-gray-500 hover:text-muted-foreground transition-colors duration-200 underline-offset-4 hover:underline"
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
  );
}
