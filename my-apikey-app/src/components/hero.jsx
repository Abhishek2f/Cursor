"use client"

import Link from "next/link"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { DarkModeToggle } from "@/components/ui/DarkModeToggle"
import { useState, useEffect } from 'react'

export function Hero() {
  const { data: session } = useSession()
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [isSignUpLoading, setIsSignUpLoading] = useState(false)

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
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16"></div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300 ring-1 ring-inset ring-purple-500/20 mb-6">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Now in Beta
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                GitVault
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Secure API Management
              </span>
            </h1>
          </div>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-300 mb-8">
            Securely manage your API keys with Google authentication and analyze GitHub repositories with AI-powered summarization.
            Create, monitor, and control access to your development resources with enterprise-grade security and beautiful design.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Button
              onClick={handleSignUp}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Using GitVault
            </Button>
            <Button
              href="#pricing"
              variant="outline"
              size="lg"
              className="border-purple-400/30 text-purple-300 hover:bg-purple-400/10 hover:text-white px-8 py-4 text-lg rounded-full">
              View Pricing
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-400">
            ⚡ No credit card required • 🚀 Deploy in seconds • 🎨 Beautiful by default
          </p>

          {/* Theme Toggle for Non-Logged-In Users */}
          {!session && (
            <div className="mt-8 flex items-center justify-center">
              <div className="flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <span className="text-sm font-medium text-white/80">Try Theme:</span>
                <DarkModeToggle />
              </div>
            </div>
          )}
        </div>
      </div>

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
                  <h3 className="text-2xl font-bold text-black mb-3">Welcome to the Future</h3>
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
    </section>
  );
}
