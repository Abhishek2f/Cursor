'use client';

import Link from 'next/link';

export default function Billing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/dashboard"
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m8-14l-7 7 7 7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
          </div>
          <p className="text-gray-600">Manage your subscription and view usage details</p>
        </div>

        {/* Current Plan */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Researcher Plan</h2>
              <p className="text-purple-100">Perfect for individual developers</p>
              <div className="mt-4">
                <div className="text-3xl font-bold">$29<span className="text-lg font-normal">/month</span></div>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Usage Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Usage</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">API Requests</span>
                    <span className="text-gray-900 font-medium">24 / 1,000</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '2.4%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Storage</span>
                    <span className="text-gray-900 font-medium">1.2 GB / 10 GB</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '12%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">API Keys</span>
                    <span className="text-gray-900 font-medium">3 / 20</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Billing</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">$29.00</div>
                <div className="text-sm text-gray-600">Due Jan 15, 2024</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-6 bg-gray-900 rounded text-white text-xs flex items-center justify-center">
                  ••••
                </div>
                <div>
                  <div className="font-medium">•••• 4242</div>
                  <div className="text-sm text-gray-600">Expires 12/24</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { date: 'Dec 15, 2023', amount: '$29.00', status: 'Paid' },
                { date: 'Nov 15, 2023', amount: '$29.00', status: 'Paid' },
                { date: 'Oct 15, 2023', amount: '$29.00', status: 'Paid' },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{invoice.date}</div>
                    <div className="text-sm text-gray-600">Monthly subscription</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{invoice.amount}</div>
                    <div className="text-sm text-green-600">{invoice.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
