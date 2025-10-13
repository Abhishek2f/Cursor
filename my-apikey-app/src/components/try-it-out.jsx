"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"

export function TryItOut() {
  const [githubUrl, setGithubUrl] = useState("https://github.com/assafelovic/gpt-researcher")
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSendRequest = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/github-summarizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer Demo_API_Key',
        },
        body: JSON.stringify({ githubUrl }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setResponse(data)
      } else {
        setError(data.error || data.message || 'Failed to fetch repository summary')
      }
    } catch (err) {
      console.error('Request error:', err)
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="try-it-out" className="relative bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] bg-grid-16"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 dark:from-gray-100 dark:via-purple-300 dark:to-gray-100 bg-clip-text text-transparent">
              Try It Out
            </span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Test our API directly from your browser. Edit the payload and see the magic happen.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* API Request Panel */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-slate-600">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">API Request</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Edit the payload and send a request</p>
              </div>

              {/* Code Editor */}
              <div className="mb-6">
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-slate-600 font-mono text-sm">
                  <div className="text-gray-500 dark:text-gray-400">{'{'}</div>
                  <div className="ml-4 flex items-start">
                    <span className="text-purple-600 dark:text-purple-400">"githubUrl":</span>
                    <span className="ml-2 text-gray-400 dark:text-gray-500">"</span>
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="flex-1 bg-transparent text-green-600 dark:text-green-400 outline-none border-none focus:ring-0 px-0"
                      placeholder="https://github.com/username/repo"
                    />
                    <span className="text-gray-400 dark:text-gray-500">"</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">{'}'}</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSendRequest}
                  disabled={loading || !githubUrl}
                  className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 text-white border-0 text-base py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </Button>
                <Button
                  href="/docs"
                  variant="outline"
                  className="border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-base py-6 rounded-xl">
                  Documentation
                </Button>
              </div>
            </div>
          </div>

          {/* API Response Panel */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-slate-600 h-full">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">API Response</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View the response from the API</p>
              </div>

              {/* Response Display */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-slate-600 font-mono text-sm overflow-auto max-h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <svg className="animate-spin h-8 w-8 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : error ? (
                  <div className="text-red-600 dark:text-red-400 whitespace-pre-wrap">
                    <div className="text-gray-500 dark:text-gray-400">{'{'}</div>
                    <div className="ml-4">
                      <span className="text-red-600 dark:text-red-400">"error":</span> <span className="text-red-500 dark:text-red-300">"{error}"</span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">{'}'}</div>
                  </div>
                ) : response ? (
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    <div className="text-gray-500 dark:text-gray-400">{'{'}</div>
                    {response.success !== undefined && (
                      <div className="ml-4 mb-2">
                        <span className="text-purple-600 dark:text-purple-400">"success":</span> <span className="text-blue-600 dark:text-blue-400">{String(response.success)}</span>,
                      </div>
                    )}
                    {response.message && (
                      <div className="ml-4 mb-2">
                        <span className="text-purple-600 dark:text-purple-400">"message":</span> <span className="text-green-600 dark:text-green-400">"{response.message}"</span>,
                      </div>
                    )}
                    {response.modelUsed && (
                      <div className="ml-4 mb-2">
                        <span className="text-purple-600 dark:text-purple-400">"modelUsed":</span> <span className="text-green-600 dark:text-green-400">"{response.modelUsed}"</span>,
                      </div>
                    )}
                    {response.readmeSource && (
                      <div className="ml-4 mb-2">
                        <span className="text-purple-600 dark:text-purple-400">"readmeSource":</span> <span className="text-blue-600 dark:text-blue-400">"{response.readmeSource.substring(0, 60)}..."</span>,
                      </div>
                    )}
                    {response.githubSummary && (
                      <div className="ml-4 mb-2">
                        <span className="text-purple-600 dark:text-purple-400">"githubSummary":</span> <span className="text-green-600 dark:text-green-400">"{response.githubSummary.substring(0, 250)}..."</span>
                      </div>
                    )}
                    {response.summary && (
                      <div className="ml-4 mb-2">
                        <span className="text-purple-600 dark:text-purple-400">"summary":</span> <span className="text-green-600 dark:text-green-400">"{response.summary.substring(0, 250)}..."</span>
                      </div>
                    )}
                    {response.cool_facts && response.cool_facts.length > 0 && (
                      <div className="ml-4 mb-2">
                        <span className="text-purple-600 dark:text-purple-400">"cool_facts":</span> [
                        {response.cool_facts.slice(0, 2).map((fact, idx) => (
                          <div key={idx} className="ml-4 text-green-600 dark:text-green-400">"{fact.substring(0, 100)}..."</div>
                        ))}
                        {response.cool_facts.length > 2 && <div className="ml-4 text-gray-400 dark:text-gray-500">...</div>}
                        ],
                      </div>
                    )}
                    {response.recent_prs && response.recent_prs.length > 0 && (
                      <div className="ml-4 mb-2">
                        <span className="text-purple-600 dark:text-purple-400">"recent_prs":</span> [
                        {response.recent_prs.slice(0, 1).map((pr, idx) => (
                          <div key={idx} className="ml-4">
                            {'{'}<br />
                            <span className="ml-4 text-blue-600 dark:text-blue-400">"title": "{pr.title}"</span><br />
                            {'}'}
                          </div>
                        ))}
                        {response.recent_prs.length > 1 && <div className="ml-4 text-gray-400 dark:text-gray-500">...</div>}
                        ]
                      </div>
                    )}
                    <div className="text-gray-500 dark:text-gray-400">{'}'}</div>
                  </div>
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 text-center py-12">
                    No response yet. Click "Send Request" to test the API.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

