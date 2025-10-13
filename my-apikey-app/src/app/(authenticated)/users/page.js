'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Custom Hooks
import { useToast } from '@/hooks/useToast';
import { isSupabaseConfigured } from '@/lib/supabase';

// Components
import Header from '@/components/dashboard/Header';
import BackButton from '@/components/ui/BackButton';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  // Protect the page - redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          showToast('Failed to fetch users', 'error');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        showToast('Error loading users', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (isSupabaseConfigured()) {
      fetchUsers();
    } else {
      setLoading(false);
      showToast('Supabase not configured', 'warning');
    }
  }, [showToast]);

  // Filter users based on search term and filters
  useEffect(() => {
    let filtered = users;

    // Filter by search term (name or email)
    if (searchTerm) {
      filtered = filtered.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'active') return user.is_active;
        if (statusFilter === 'inactive') return !user.is_active;
        return true;
      });
    }

    // Filter by provider
    if (providerFilter !== 'all') {
      filtered = filtered.filter(user =>
        user.provider && user.provider.toLowerCase() === providerFilter.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, providerFilter]);

  // Toggle user active status
  const toggleUserStatus = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`User ${data.user.is_active ? 'activated' : 'deactivated'} successfully`, 'success');

        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? { ...user, is_active: data.user.is_active, updated_at: data.user.updated_at }
              : user
          )
        );
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to update user status', 'error');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      showToast('Error updating user status', 'error');
    } finally {
      setActionLoading(null);
    }
  };


  // Show loading state while checking authentication or loading data
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render page until authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Header>
        Users Management
      </Header>

      <main className="mt-6">

          {/* Search and Filter Controls */}
          <div className="mb-6 bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-lg border border-slate-600/50 p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Users</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Provider Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Provider</label>
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Providers</option>
                  <option value="google">Google</option>
                </select>
              </div>
            </div>
          </div>

          {!isSupabaseConfigured() ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-yellow-800">Supabase Not Configured</h3>
                  <p className="text-yellow-700 mt-1">
                    User tracking requires Supabase configuration. Please set up SUPABASE_URL and SUPABASE_ANON_KEY as regular environment variables (without NEXT_PUBLIC_ prefix) in your .env.local file for security.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-slate-600/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Registered Users</h3>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {filteredUsers.length} of {users.length} Users
                    </span>
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setProviderFilter('all');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No users have logged in yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Users will appear here after they sign in with Google.</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.881-6.123-2.334M15 19.128a9.959 9.959 0 01-3.877 1.372A9.959 9.959 0 0112 21c.34 0 .68 0 1.017-.018M9 19.128A9.959 9.959 0 0112 21c.34 0 .68 0 1.017-.018" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No users match your current filters.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setProviderFilter('all');
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700">
                      <tr>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                          Provider
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                          Login Count
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                          First Login
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                          Last Login
                        </th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-colors duration-200">
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <div className="flex items-center">
                              {user.image ? (
                                <div className="relative group">
                                  <Image
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-3 ring-2 ring-gray-200 dark:ring-gray-600 hover:ring-blue-300 dark:hover:ring-blue-500 transition-all duration-200 shadow-sm"
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    width={40}
                                    height={40}
                                    style={{ width: 'auto', height: 'auto' }}
                                  />
                                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all duration-200 pointer-events-none"></div>
                                </div>
                              ) : (
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-800 dark:to-indigo-700 flex items-center justify-center mr-2 md:mr-3 ring-2 ring-gray-200 dark:ring-gray-600 shadow-sm hover:ring-blue-300 dark:hover:ring-blue-500 transition-all duration-200">
                                  <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {user.name || 'Unknown User'}
                                </div>
                                <div className="sm:hidden text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {user.provider} • {user.login_count} logins
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.provider === 'google'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {user.provider || 'google'}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                            <div className="text-sm text-gray-900 dark:text-white font-medium">{user.login_count}</div>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 hidden lg:table-cell">
                            <div className="text-sm text-gray-900 dark:text-white">{formatDate(user.first_login)}</div>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 hidden lg:table-cell">
                            <div className="text-sm text-gray-900 dark:text-white">{formatDate(user.last_login)}</div>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.is_active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              <svg className={`w-3 h-3 mr-1 ${user.is_active ? 'text-emerald-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d={user.is_active ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" : "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"} clipRule="evenodd" />
                              </svg>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
      </main>
    </div>
  );
}
