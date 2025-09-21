'use client';

import { useState } from 'react';
import Link from 'next/link';

function NavLink({ href, title, isActive, sidebarOpen, children }) {
  const activeClasses = 'bg-gray-100 text-gray-900';
  const inactiveClasses = 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';

  return (
    <Link
      href={href}
      className={`${isActive ? activeClasses : inactiveClasses} flex items-center px-3 py-2 text-sm font-medium rounded-md`}
      title={title}
    >
      {children}
      {sidebarOpen && <span className="ml-3">{title}</span>}
    </Link>
  );
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  // In a real app, you'd get this from a router hook like usePathname
  const currentPage = '/dashboard';

  const navItems = [
    { href: '/dashboard', title: 'Overview', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { href: '/api-keys', title: 'API Keys', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7 6h-2m-6 0a6 6 0 01-7-6 6 6 0 0114 0M9 7a2 2 0 012-2m0 0a2 2 0 012 2m-2-2v2a2 2 0 01-2 2 2 2 0 01-2-2V7m0 0V5a2 2 0 012-2h0a2 2 0 012 2v2M7 7a2 2 0 012-2" /></svg> },
    { href: '/analytics', title: 'Analytics', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { href: '/playground', title: 'API Playground', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
    { href: '/billing', title: 'Billing', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { href: '/settings', title: 'Settings', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-sm border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      <div className="p-4 flex items-center justify-between">
        {sidebarOpen && <h1 className="text-xl font-bold text-gray-900">KeyVault Pro</h1>}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>
      <nav className="mt-4 flex-1">
        <div className="px-3">
          <div className="space-y-1">
            {navItems.map(item => (
              <NavLink 
                key={item.href}
                href={item.href}
                title={item.title}
                isActive={currentPage === item.href}
                sidebarOpen={sidebarOpen}
              >
                {item.icon}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
