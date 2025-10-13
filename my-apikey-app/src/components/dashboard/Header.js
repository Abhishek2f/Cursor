'use client';

import Link from 'next/link';

export default function Header({ breadcrumbs = [], children, description }) {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-b border-blue-100 dark:border-slate-600 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          {breadcrumbs.length > 0 && (
            <div className="flex flex-wrap items-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 mb-2">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <span className="mx-1 sm:mx-2">•</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors truncate">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium truncate">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{children}</h1>
              {description && <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{description}</p>}
            </div>
            <div className="flex items-center sm:flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-blue-100 dark:border-slate-600">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
