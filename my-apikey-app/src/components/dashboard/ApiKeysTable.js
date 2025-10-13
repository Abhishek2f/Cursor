'use client';

import { useState } from 'react';
import { Button, LoadingSpinner } from '@/components/ui';
import { Plus, Eye, EyeOff, Copy, Edit, Delete } from '@/components/icons';

function ApiKeyRow({ apiKey, onEdit, onDelete, onCopy }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200 group">
      {/* --- Mobile Layout: STACKED --- */}
      <div className="block sm:hidden">
        {/* Row 1: Name and Badge */}
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="text-sm sm:text-base font-semibold text-foreground break-words">{apiKey.name}</div>
            </div>
            {apiKey.description && (
              <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{apiKey.description}</div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {apiKey.usage || 0} uses
            </span>
          </div>
        </div>

        {/* Row 2: Key */}
        <div className="mb-3 sm:mb-4">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border/50">
            <code className="text-xs sm:text-sm font-mono text-black block break-all leading-relaxed">
              {isVisible
                ? apiKey.key
                : `${apiKey.key.substring(0, 3)}${'*'.repeat(Math.max(apiKey.key.length - 3, 4))}`
              }
            </code>
          </div>
        </div>

        {/* Row 3: Options Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground font-medium">
            Created {new Date(apiKey.created).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9 border-border hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              title={isVisible ? "Hide Key" : "Show Key"}
            >
              {isVisible ? <EyeOff className="h-4 w-4 sm:h-4 sm:w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 sm:h-4 sm:w-4 text-muted-foreground" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(apiKey.key)}
              className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9 border-border hover:border-green-300 hover:bg-green-50 transition-all duration-200"
              title="Copy Key"
            >
              <Copy className="h-4 w-4 sm:h-4 sm:w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(apiKey)}
              className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9 border-border hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200"
              title="Edit"
            >
              <Edit className="h-4 w-4 sm:h-4 sm:w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(apiKey.id)}
              className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
              title="Delete"
            >
              <Delete className="h-4 w-4 sm:h-4 sm:w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* --- Tablet Layout: GRID --- */}
      <div className="hidden md:grid lg:hidden grid-cols-12 gap-2 items-center">
        <div className="col-span-4 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-sm font-semibold text-foreground break-words">{apiKey.name}</div>
          </div>
          {apiKey.description && (
            <div className="text-xs text-muted-foreground leading-relaxed break-words">{apiKey.description}</div>
          )}
        </div>
        <div className="col-span-1 min-w-0 text-center">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {apiKey.usage || 0}
          </span>
        </div>
        <div className="col-span-4 min-w-0">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-2 rounded-lg border border-border/50">
            <code className="text-xs font-mono text-black block break-all leading-relaxed">
              {isVisible
                ? apiKey.key.substring(0, 18) + '...'
                : `${apiKey.key.substring(0, 3)}${'*'.repeat(Math.max(apiKey.key.length - 3, 4))}`
              }
            </code>
          </div>
        </div>
        <div className="col-span-3 min-w-0">
          <div className="flex items-center justify-center">
            {/* Eye and Copy buttons - Top row */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisible(!isVisible)}
                className="p-1.5 h-8 w-8 border-border hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                title={isVisible ? "Hide Key" : "Show Key"}
              >
                {isVisible ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(apiKey.key)}
                className="p-1.5 h-8 w-8 border-border hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                title="Copy Key"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            {/* Edit and Delete buttons - Bottom row */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(apiKey)}
                className="p-1.5 h-8 w-8 border-border hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200"
                title="Edit"
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(apiKey.id)}
                className="p-1.5 h-8 w-8 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                title="Delete"
              >
                <Delete className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Desktop Layout: GRID --- */}
      <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
        <div className="col-span-4 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-base font-semibold text-foreground break-words">{apiKey.name}</div>
          </div>
          {apiKey.description && (
            <div className="text-sm text-muted-foreground leading-relaxed break-words pl-5">{apiKey.description}</div>
          )}
          <div className="text-xs text-muted-foreground mt-1 pl-5">
            Created {new Date(apiKey.created).toLocaleDateString()}
          </div>
        </div>
        <div className="col-span-2 min-w-0 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {apiKey.usage || 0} uses
          </span>
        </div>
        <div className="col-span-4 min-w-0">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-xl border border-border/50">
            <code className="text-sm font-mono text-black block break-all leading-relaxed">
              {isVisible
                ? apiKey.key
                : `${apiKey.key.substring(0, 3)}${'*'.repeat(Math.max(apiKey.key.length - 3, 4))}`
              }
            </code>
          </div>
        </div>
        <div className="col-span-2 min-w-0">
          <div className="flex items-center gap-1 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="p-2 h-9 w-9 border-border hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              title={isVisible ? "Hide Key" : "Show Key"}
            >
              {isVisible ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(apiKey.key)}
              className="p-2 h-9 w-9 border-border hover:border-green-300 hover:bg-green-50 transition-all duration-200"
              title="Copy Key"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(apiKey)}
              className="p-2 h-9 w-9 border-border hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200"
              title="Edit"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(apiKey.id)}
              className="p-2 h-9 w-9 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
              title="Delete"
            >
              <Delete className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApiKeysTable({ apiKeys, onEdit, onDelete, onCopy, onCreate, loading }) {
  if (loading) {
    return (
      <div className="text-center p-12">
        <LoadingSpinner text="Loading API keys..." />
      </div>
    );
  }
  
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-lg flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">API Keys</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreate}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 p-1.5 sm:p-2 h-8 w-8 sm:h-10 sm:w-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-5" />
            </Button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
          Securely authenticate your requests to the{' '}
          <span className="text-blue-600 font-medium hover:text-blue-700 transition-colors cursor-pointer">Research API</span>.
          Manage your keys with confidence.{' '}
          <span className="text-blue-600 font-medium hover:text-blue-700 transition-colors cursor-pointer">Learn more</span>.
        </p>
      </div>
      
      {apiKeys.length === 0 ? (
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3">No API keys yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
            Start your journey by creating your first API key. It&apos;s quick, secure, and ready to use.
          </p>
          <Button
            variant="primary"
            onClick={onCreate}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-medium text-sm sm:text-base"
          >
            <Plus className="w-4 w-4 sm:w-5 sm:h-5 mr-2" />
            Create your first API key
          </Button>
        </div>
      ) : (
        <div>
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-b border-border/50 backdrop-blur-sm">
            {/* Tablet Header */}
            <div className="hidden md:grid lg:hidden grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-4 flex items-center">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">API Key Details</span>
              </div>
              <div className="col-span-1 text-center flex items-center justify-center">
                <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md text-xs font-medium">Usage</span>
              </div>
              <div className="col-span-4 flex items-center">
                <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-md text-xs font-medium">Key Value</span>
              </div>
              <div className="col-span-3 text-center flex items-center justify-center">
                <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-md text-xs font-medium">Actions</span>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-4 flex items-center">
                <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium">API Key Details</span>
              </div>
              <div className="col-span-2 text-center flex items-center justify-center">
                <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium">Usage</span>
              </div>
              <div className="col-span-4 flex items-center">
                <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium">Key Value</span>
              </div>
              <div className="col-span-2 text-center flex items-center justify-center">
                <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-lg text-sm font-medium">Actions</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border/50">
            {apiKeys.map((key) => (
              <ApiKeyRow key={key.id} apiKey={key} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
