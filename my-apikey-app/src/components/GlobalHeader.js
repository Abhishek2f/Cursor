'use client';

import Link from 'next/link';
import LoginButton from '@/components/auth/LoginButton';

export default function GlobalHeader() {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7 6h-2m-6 0a6 6 0 01-7-6 6 6 0 0114 0M9 7a2 2 0 012-2m0 0a2 2 0 012 2m-2-2v2a2 2 0 01-2 2 2 2 0 01-2-2V7m0 0V5a2 2 0 012-2h0a2 2 0 012 2v2M7 7a2 2 0 012-2" />
                  </svg>
                </div>
                <Link href="/" className="text-xl font-bold text-white hover:text-blue-100 transition-colors duration-200">
                  API Key Manager
                </Link>
              </div>
            </div>
          </div>

          {/* Global LoginButton in header */}
          <div className="flex items-center">
            <LoginButton />
          </div>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"></div>
    </header>
  );
}
