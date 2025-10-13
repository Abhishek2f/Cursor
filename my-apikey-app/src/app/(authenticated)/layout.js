'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export default function AuthenticatedLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobileOrTablet = window.innerWidth < 1024; // Mobile + Tablet breakpoint
      setIsMobile(mobileOrTablet);

      if (mobileOrTablet) { // Mobile + Tablet breakpoint
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Protect the layout - redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render layout until authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/30 to-indigo-900/20 dark:from-slate-900/50 dark:via-slate-800/60 dark:to-slate-900/50 backdrop-blur-sm"></div>

          {/* Animated floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse delay-700"></div>
            <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-indigo-400/40 rounded-full animate-pulse delay-500"></div>

            {/* Additional floating orbs for more visual interest */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-pulse delay-1500"></div>
          </div>

          {/* Glass morphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        </div>
      )}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300 ${sidebarOpen && isMobile ? 'lg:ml-0' : ''}`}>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
