"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Features() {
  return (
    <section id="features" className="relative bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] bg-grid-16"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 dark:from-gray-100 dark:via-purple-300 dark:to-gray-100 bg-clip-text text-transparent">
              Everything you need
            </span>
            <br />
            <span className="text-gray-700 dark:text-gray-300">for secure API management</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            GitVault provides enterprise-grade API key management with Google authentication,
            usage tracking, and beautiful design for developers and teams.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Smart Summary */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <Card className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  Secure Key Management
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Create and manage API keys with enterprise-grade security, rate limiting, and access controls.
              </CardContent>
            </Card>
          </div>

          {/* Stars & Momentum */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <Card className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Monitor API key usage, track request patterns, and get insights into your application's API consumption.
              </CardContent>
            </Card>
          </div>

          {/* Cool Facts */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <Card className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  Google Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Secure OAuth integration with Google for seamless user authentication and account management.
              </CardContent>
            </Card>
          </div>

          {/* Important PRs */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <Card className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                  Rate Limiting
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Built-in rate limiting prevents abuse and ensures fair usage across all API keys with customizable limits.
              </CardContent>
            </Card>
          </div>

          {/* Version Updates */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <Card className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  Team Management
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Manage team access with role-based permissions, multiple API keys per user, and centralized user administration.
              </CardContent>
            </Card>
          </div>

          {/* Fast & Shareable */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <Card className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
                  Beautiful Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Modern, responsive interface with dark mode support, real-time updates, and intuitive navigation for all your API management needs.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
