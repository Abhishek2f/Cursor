'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { UserService } from '@/lib/userService';

export default function Settings() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    apiAlerts: true
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        try {
          const userData = await UserService.getUserByEmail(session.user.email);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [session]);

  useEffect(() => {
    // Handle scroll offset for anchor links
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          // Offset for fixed header (adjust based on your header height)
          const offset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    // Handle initial hash on page load
    if (window.location.hash) {
      setTimeout(handleHashChange, 100);
    }

    // Update active navigation item based on scroll position
    const handleScroll = () => {
      const sections = ['profile', 'security', 'notifications', 'api', 'billing'];
      const navLinks = document.querySelectorAll('nav a');

      let current = '';

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = section;
          }
        }
      });

      // Update active state
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
          link.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:bg-gray-50', 'dark:hover:bg-slate-700');
          link.classList.add('bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400');
        } else {
          link.classList.remove('bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400');
          link.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:bg-gray-50', 'dark:hover:bg-slate-700');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <style jsx>{`
          html {
            scroll-behavior: smooth;
          }

          /* Custom scrollbar for webkit browsers */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }

          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }

          .dark ::-webkit-scrollbar-thumb {
            background: #475569;
          }

          .dark ::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        `}</style>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m8-14l-7 7 7 7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and application preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-600 p-6">
            <nav className="space-y-2">
              <a href="#profile" className="block px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md font-medium transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30">
                Profile
              </a>
              <a href="#security" className="block px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                Security
              </a>
              <a href="#notifications" className="block px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                Notifications
              </a>
              <a href="#api" className="block px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                API Settings
              </a>
              <a href="#billing" className="block px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                Billing
              </a>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Settings */}
            <div id="profile" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Profile Information</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                      <input
                        type="text"
                        value={user?.name?.split(' ')[0] || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 cursor-not-allowed opacity-75"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Middle Name</label>
                      <input
                        type="text"
                        value={user?.name?.split(' ').length > 2 ? user.name.split(' ')[1] : ''}
                        readOnly
                        placeholder="No middle name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 cursor-not-allowed opacity-75"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={user?.name?.split(' ').slice(-1)[0] || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 cursor-not-allowed opacity-75"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 cursor-not-allowed opacity-75"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan</label>
                    <input
                      type="text"
                      value={user?.plan || 'Free'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 cursor-not-allowed opacity-75 capitalize"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Member since {user?.first_login ? new Date(user.first_login).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{user?.login_count || 0} logins</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Settings */}
            <div id="notifications" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Receive important updates via email</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Get notified in your browser</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">API Alerts</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Get notified about API issues</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.apiAlerts}
                      onChange={(e) => setNotifications({...notifications, apiAlerts: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div id="security" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Security</h3>
              <div className="space-y-4">
                <button className="w-full text-left px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Change Password</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Update your account password</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                <button className="w-full text-left px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* API Settings */}
            <div id="api" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">API Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Rate Limit</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-slate-700 dark:text-gray-100">
                    <option value="100">100 requests/hour</option>
                    <option value="500">500 requests/hour</option>
                    <option value="1000">1000 requests/hour</option>
                    <option value="5000">5000 requests/hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Response Format</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="format" value="json" className="text-blue-600 dark:text-blue-400" />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">JSON</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="format" value="xml" className="text-blue-600 dark:text-blue-400" />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">XML</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Webhook URL</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Receive notifications about API events</div>
                  </div>
                  <button className="px-3 py-1 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400">
                    Configure
                  </button>
                </div>
              </div>
            </div>

            {/* Billing Settings */}
            <div id="billing" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Billing</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Current Plan</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{user?.plan || 'Free'} Plan - ${user?.plan === 'Free' ? '0' : '29'}/month</div>
                  </div>
                  <Link href="/billing" className="px-3 py-1 text-sm bg-purple-600 dark:bg-purple-500 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-400">
                    Manage
                  </Link>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Billing Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 cursor-not-allowed opacity-75"
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Billing History</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-slate-700 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-400">December 2023</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">$29.00</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-slate-700 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-400">November 2023</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">$29.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
