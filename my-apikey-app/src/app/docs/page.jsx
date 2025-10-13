"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function DocsPage() {
  const [showToken, setShowToken] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]')
      const scrollPosition = window.scrollY + 120

      sections.forEach(section => {
        const top = section.offsetTop
        const bottom = top + section.offsetHeight

        if (scrollPosition >= top && scrollPosition <= bottom) {
          setActiveSection(section.id)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/#try-it-out"
            className="inline-flex items-center text-purple-300 hover:text-white dark:text-purple-400 dark:hover:text-white mb-4 transition-all duration-200 hover:scale-105">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Try It Out
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            API Documentation
          </h1>
          <p className="text-lg text-gray-300 dark:text-gray-400 max-w-3xl">
            Complete guide to using the GitHub Repository Summarizer API with AI-powered insights
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-slate-600 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                Contents
              </h3>
              <nav className="space-y-1">
                <a
                  href="#overview"
                  onClick={(e) => { e.preventDefault(); scrollToSection('overview'); }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === 'overview'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  Overview
                </a>
                <a
                  href="#authentication"
                  onClick={(e) => { e.preventDefault(); scrollToSection('authentication'); }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === 'authentication'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  Authentication
                </a>
                <a
                  href="#endpoint"
                  onClick={(e) => { e.preventDefault(); scrollToSection('endpoint'); }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === 'endpoint'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  API Endpoint
                </a>
                <a
                  href="#request"
                  onClick={(e) => { e.preventDefault(); scrollToSection('request'); }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === 'request'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  Request Format
                </a>
                <a
                  href="#response"
                  onClick={(e) => { e.preventDefault(); scrollToSection('response'); }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === 'response'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  Response Format
                </a>
                <a
                  href="#examples"
                  onClick={(e) => { e.preventDefault(); scrollToSection('examples'); }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === 'examples'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  Code Examples
                </a>
                <a
                  href="#errors"
                  onClick={(e) => { e.preventDefault(); scrollToSection('errors'); }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === 'errors'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  Error Handling
                </a>
              </nav>
            </div>
          </div>

          {/* Documentation Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section id="overview" className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-600 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Overview</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                The GitHub Repository Summarizer API allows you to get comprehensive insights about any public GitHub repository.
                It provides AI-generated summaries, cool facts, recent pull requests, version information, and more.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-6 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Note:</strong> This API uses the Gemini-2.0-flash-lite model for generating intelligent summaries and insights.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-600 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Authentication</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                All API requests require authentication using a Bearer Token. Include your API key in the Authorization header.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Auth Type</h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
                    <code className="text-purple-600 dark:text-purple-400 font-mono text-lg">Bearer Token</code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">API Key</h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-slate-600 flex items-center justify-between">
                    <code className="text-gray-600 dark:text-gray-400 flex-1 font-mono">
                      {showToken ? 'your_api_key_here' : '••••••••••••••'}
                    </code>
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="ml-4 p-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showToken ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 p-6 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 dark:bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Important:</strong> The authorization header will be automatically generated when you send the request.
                        Learn more about <a href="#" className="underline hover:text-yellow-900 dark:hover:text-yellow-200">Bearer Token authorization</a>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* API Endpoint */}
            <section id="endpoint" className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-600 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API Endpoint</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Method & URL</h3>
                  <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg">
                      POST
                    </span>
                    <code className="text-purple-600 dark:text-purple-400 flex-1 font-mono text-sm break-all">
                      https://api-key-gen-delta.vercel.app/api/github-summarizer
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">200</div>
                    <div className="text-sm text-green-700 dark:text-green-300 font-medium">OK</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 text-center">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">~2.5s</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Avg Response</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 text-center">
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">~2 KB</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Response Size</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Request Format */}
            <section id="request" className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-600 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Request Format</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Headers</h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-slate-600 font-mono text-sm">
                    <div className="text-gray-700 dark:text-gray-300">Content-Type: <span className="text-blue-600 dark:text-blue-400 font-semibold">application/json</span></div>
                    <div className="text-gray-700 dark:text-gray-300">Authorization: <span className="text-blue-600 dark:text-blue-400 font-semibold">Bearer YOUR_API_KEY</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Request Body</h3>
                  <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto border border-gray-700">
                    <pre className="text-sm text-gray-100 font-mono leading-relaxed">
&#123;
  &quot;githubUrl&quot;: &quot;https://github.com/username/repository&quot;
&#125;
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Parameters</h3>
                  <div className="bg-white dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Parameter</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Required</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Description</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                          <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">githubUrl</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">string</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                Required
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Full URL of the GitHub repository to analyze</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Response Format */}
            <section id="response" className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-600 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Response Format</h2>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Success Response (200 OK)</h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono">
{`{`}
  &quot;success&quot;: true,
  &quot;message&quot;: &quot;Repository summarized successfully.&quot;,
  &quot;modelUsed&quot;: &quot;gemini-2.0-flash-lite&quot;,
  &quot;readmeSource&quot;: &quot;https://raw.githubusercontent.com/...&quot;,
  &quot;githubSummary&quot;: &quot;Based on the provided context, here is a precise and comprehensive summary...&quot;,
  &quot;summary&quot;: &quot;TinderGPT is an AI-powered dating assistant...&quot;,
  &quot;cool_facts&quot;: [
    &quot;The project uses AI technology for dating automation&quot;,
    &quot;It integrates with Tinder&apos;s platform&quot;,
    &quot;...&quot;
  ],
  &quot;tools_used&quot;: [
    &quot;JavaScript&quot;,
    &quot;React&quot;,
    &quot;Node.js&quot;,
    &quot;PostgreSQL&quot;
  ],
  &quot;stars&quot;: 1234,
  &quot;latest_version&quot;: &quot;v2.1.0&quot;,
  &quot;license_type&quot;: &quot;MIT License&quot;,
  &quot;website_url&quot;: &quot;https://example.com&quot;,
  &quot;recent_prs&quot;: [
    &#123;
      &quot;title&quot;: &quot;Feature: Add new matching algorithm&quot;,
      &quot;url&quot;: &quot;https://github.com/...&quot;,
      &quot;created_at&quot;: &quot;2024-01-15&quot;
    &#125;
  ],
  &quot;version&quot;: &quot;1.0.0&quot;,
  &quot;stars&quot;: 1234,
  &quot;forks&quot;: 56
{`}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Response Fields</h3>
                  <div className="bg-white dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Field</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Description</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                          <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">success</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">boolean</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Indicates if the request was successful</td>
                          </tr>
                          <tr className="bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">message</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">string</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Human-readable message about the request</td>
                          </tr>
                          <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">modelUsed</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">string</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">AI model used for analysis (gemini-2.0-flash-lite)</td>
                          </tr>
                          <tr className="bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">githubSummary</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">string</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Comprehensive AI-generated summary of the repository</td>
                          </tr>
                          <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">cool_facts</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">array</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Interesting facts about the repository</td>
                          </tr>
                          <tr className="bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">tools_used</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">array</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Tools, programming languages, frameworks, and databases used</td>
                          </tr>
                          <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">stars</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">number</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">GitHub repository star count</td>
                          </tr>
                          <tr className="bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">latest_version</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">string</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Latest version/tag of the repository</td>
                          </tr>
                          <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">license_type</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">string</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">License type of the repository</td>
                          </tr>
                          <tr className="bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">website_url</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">string</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Website URL of the repository (from GitHub homepage or README)</td>
                          </tr>
                          <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-purple-600 dark:text-purple-400">recent_prs</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">array</td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Recent pull requests with title, URL, and date</td>
                          </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </div>
            </section>

            {/* Code Examples */}
            <section id="examples" className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-600 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Code Examples</h2>
              </div>

              <div className="space-y-8">
                {/* JavaScript/Fetch */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                    JavaScript (Fetch API)
                  </h3>
                  <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto border border-gray-700">
                    <pre className="text-sm text-gray-100 font-mono leading-relaxed">
const response = await fetch(
  &apos;https://api-key-gen-delta.vercel.app/api/github-summarizer&apos;,
  &#123;
    method: &apos;POST&apos;,
    headers: &#123;
      &apos;Content-Type&apos;: &apos;application/json&apos;,
      &apos;Authorization&apos;: &apos;Bearer YOUR_API_KEY&apos;
    &#125;,
    body: JSON.stringify(&#123;
      githubUrl: &apos;https://github.com/username/repo&apos;
    &#125;)
  &#125;
);

const data = await response.json();
                    </pre>
                  </div>
                </div>

                {/* cURL */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                    cURL
                  </h3>
                  <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto border border-gray-700">
                    <pre className="text-sm text-gray-100 font-mono leading-relaxed">
curl -X POST https://api-key-gen-delta.vercel.app/api/github-summarizer \
  -H &quot;Content-Type: application/json&quot; \
  -H &quot;Authorization: Bearer YOUR_API_KEY&quot; \
  -d &apos;&#123;&quot;githubUrl&quot;: &quot;https://github.com/username/repo&quot;&#125;&apos;
                    </pre>
                  </div>
                </div>

                {/* Python */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                    Python (Requests)
                  </h3>
                  <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto border border-gray-700">
                    <pre className="text-sm text-gray-100 font-mono leading-relaxed">
import requests

url = &quot;https://api-key-gen-delta.vercel.app/api/github-summarizer&quot;
headers = &#123;
    &quot;Content-Type&quot;: &quot;application/json&quot;,
    &quot;Authorization&quot;: &quot;Bearer YOUR_API_KEY&quot;
&#125;
data = &#123;
    &quot;githubUrl&quot;: &quot;https://github.com/username/repo&quot;
&#125;

response = requests.post(url, headers=headers, json=data)
print(response.json())
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Error Handling */}
            <section id="errors" className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-600 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Handling</h2>
              </div>

              <div className="space-y-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  The API uses standard HTTP status codes to indicate success or failure. Here are common error responses:
                </p>

                <div className="space-y-6">
                  {/* 400 Error */}
                  <div className="border border-red-200 dark:border-red-800 rounded-xl p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                    <div className="flex items-center mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-red-600 text-white shadow-lg">
                        400
                      </span>
                      <span className="ml-3 font-semibold text-gray-900 dark:text-gray-100">Bad Request</span>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <pre className="text-sm text-gray-100 font-mono">
&#123;
  &quot;error&quot;: &quot;Missing required field: githubUrl&quot;
&#125;
                      </pre>
                    </div>
                  </div>

                  {/* 401 Error */}
                  <div className="border border-orange-200 dark:border-orange-800 rounded-xl p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                    <div className="flex items-center mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-orange-600 text-white shadow-lg">
                        401
                      </span>
                      <span className="ml-3 font-semibold text-gray-900 dark:text-gray-100">Unauthorized</span>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <pre className="text-sm text-gray-100 font-mono">
&#123;
  &quot;error&quot;: &quot;Invalid or missing API key&quot;
&#125;
                      </pre>
                    </div>
                  </div>

                  {/* 404 Error */}
                  <div className="border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                    <div className="flex items-center mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-yellow-600 text-white shadow-lg">
                        404
                      </span>
                      <span className="ml-3 font-semibold text-gray-900 dark:text-gray-100">Not Found</span>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <pre className="text-sm text-gray-100 font-mono">
&#123;
  &quot;error&quot;: &quot;Repository not found or is private&quot;
&#125;
                      </pre>
                    </div>
                  </div>

                  {/* 500 Error */}
                  <div className="border border-gray-300 dark:border-slate-600 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700">
                    <div className="flex items-center mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-gray-600 text-white shadow-lg">
                        500
                      </span>
                      <span className="ml-3 font-semibold text-gray-900 dark:text-gray-100">Internal Server Error</span>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <pre className="text-sm text-gray-100 font-mono">
&#123;
  &quot;error&quot;: &quot;Failed to process repository&quot;
&#125;
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Get Started CTA */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 dark:from-purple-700 dark:via-pink-700 dark:to-purple-900 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
                <p className="text-white/90 dark:text-purple-100 mb-8 text-lg">
                  Try out the API right now with our interactive playground
                </p>
                <Button
                  href="/#try-it-out"
                  variant="outline"
                  className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-slate-700 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-gray-800 dark:border-purple-400 hover:border-purple-500">
                  🚀 Try It Out Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

