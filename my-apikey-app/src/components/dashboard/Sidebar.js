'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function NavLink({ href, title, isActive, sidebarOpen, children, onClick, isMobile }) {
  const baseClasses = 'group relative flex items-center px-2 sm:px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out min-h-[48px] overflow-hidden touch-manipulation active:scale-95';
  const activeClasses = 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50';
  const inactiveClasses = 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md active:bg-gray-200 dark:active:bg-slate-700';

  const handleClick = () => {
    if (isMobile && onClick) {
      onClick();
    }
  };

  return (
    <Link
      href={href}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      title={!sidebarOpen ? title : undefined}
      onClick={handleClick}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl animate-pulse"></div>
      )}

      <div className={`relative z-10 flex items-center justify-center ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'} transition-colors flex-shrink-0 w-5 h-5`}>
        {children}
      </div>

      {sidebarOpen && (
        <span className={`relative z-10 ml-3 truncate transition-all duration-200 ${isActive ? 'font-semibold text-white' : 'text-gray-700 dark:text-gray-300'}`}>
          {title}
        </span>
      )}

      {/* Hover effect */}
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/0 via-gray-50/50 to-gray-50/0 dark:from-slate-800/0 dark:via-slate-700/50 dark:to-slate-800/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
    </Link>
  );
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, isMobile }) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      title: 'Dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5a2 2 0 012-2h4a2 2 0 012 2v0" />
        </svg>
      )
    },
    {
      href: '/api-keys',
      title: 'API Keys',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7 6h-2m-6 0a6 6 0 01-7-6 6 6 0 0114 0M9 7a2 2 0 012-2m0 0a2 2 0 012 2m-2-2v2a2 2 0 01-2 2 2 2 0 01-2-2V7m0 0V5a2 2 0 012-2h0a2 2 0 012 2v2M7 7a2 2 0 012-2" />
        </svg>
      )
    },
    {
      href: '/users',
      title: 'Users',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      href: '/analytics',
      title: 'Analytics',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      href: '/playground',
      title: 'GitHub Playground',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    },
    {
      href: '/billing',
      title: 'Billing',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      href: '/settings',
      title: 'Settings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-xl border-r border-slate-200/50 dark:border-slate-700/50 transition-all duration-500 ease-in-out flex flex-col backdrop-blur-sm ${isMobile && sidebarOpen ? 'fixed left-0 top-0 z-50 lg:relative lg:shadow-none' : 'relative'}`}>
      {/* Header */}
      <div className="p-3 sm:p-6 flex items-center border-b border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
        {sidebarOpen && (
          <div className="flex items-center justify-center min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">GitVault</h1>
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 active:bg-gray-200 dark:active:bg-slate-700 transition-all duration-200 group flex-shrink-0 min-h-[48px] min-w-[48px] hover:shadow-md touch-manipulation"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4">
        <div className="space-y-1 sm:space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.href}
              href={item.href}
              title={item.title}
              isActive={pathname === item.href}
              sidebarOpen={sidebarOpen}
              onClick={() => setSidebarOpen(false)}
              isMobile={isMobile}
            >
              {item.icon}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="p-3 sm:p-4 border-t border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center font-medium">
            © 2025 GitVault
          </div>
        </div>
      )}
    </div>
  );
}
