'use client';

import { useState } from 'react';
import { Button, LoadingSpinner } from '@/components/ui';
import { Plus, Eye, EyeOff, Copy, Edit, Delete } from '@/components/icons';

function ApiKeyRow({ apiKey, onEdit, onDelete, onCopy }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="px-4 md:px-6 py-4 hover:bg-gray-50 overflow-hidden">
      {/* --- Mobile Layout: STACKED --- */}
      <div className="sm:hidden">
        {/* Row 1: Name and Usage */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <div className="text-sm font-medium text-gray-900 truncate">{apiKey.name}</div>
            {apiKey.description && (
              <div className="text-xs text-gray-500 mt-1 truncate">{apiKey.description}</div>
            )}
          </div>
          <div className="text-xs text-gray-500 flex-shrink-0">
            Usage: {apiKey.usage || 0}
          </div>
        </div>
        
        {/* Row 2: Key */}
        <div className="mb-3">
          <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-900 block truncate w-full">
            {isVisible
              ? apiKey.key
              : `${apiKey.key.substring(0, 4)}${'*'.repeat(apiKey.key.length - 4)}`
            }
          </code>
        </div>

        {/* Row 3: Options Buttons */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="p-2 h-10 w-10 flex-shrink-0"
              title={isVisible ? "Hide Key" : "Show Key"}
            >
              {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(apiKey.key)}
              className="p-2 h-10 w-10 flex-shrink-0"
              title="Copy Key"
            >
              <Copy className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(apiKey)}
              className="p-2 h-10 w-10 flex-shrink-0"
              title="Edit"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(apiKey.id)}
              className="p-2 h-10 w-10 flex-shrink-0 text-red-600 hover:text-red-700"
              title="Delete"
            >
              <Delete className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* --- Desktop Layout: GRID --- */}
      <div className="hidden sm:grid grid-cols-12 gap-2 md:gap-4 items-center">
        <div className="col-span-3 md:col-span-3 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{apiKey.name}</div>
          {apiKey.description && (
            <div className="text-xs text-gray-500 mt-1 truncate">{apiKey.description}</div>
          )}
        </div>
        <div className="col-span-1 md:col-span-2 min-w-0">
          <div className="text-sm text-gray-900">{apiKey.usage || 0}</div>
        </div>
        <div className="col-span-4 md:col-span-4 min-w-0">
          <code className="bg-gray-100 px-2 md:px-3 py-1 rounded text-sm font-mono text-gray-900 block truncate">
            {isVisible
              ? apiKey.key
              : `${apiKey.key.substring(0, 4)}${'*'.repeat(apiKey.key.length - 4)}`
          }
          </code>
        </div>
        <div className="col-span-4 md:col-span-3 min-w-0">
          <div className="flex items-center gap-0.5 md:gap-1 lg:gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="p-1 md:p-1.5 lg:p-2 h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 flex-shrink-0"
              title={isVisible ? "Hide Key" : "Show Key"}
            >
              {isVisible ? <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" /> : <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(apiKey.key)}
              className="p-1 md:p-1.5 lg:p-2 h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 flex-shrink-0"
              title="Copy Key"
            >
              <Copy className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(apiKey)}
              className="p-1 md:p-1.5 lg:p-2 h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 flex-shrink-0"
              title="Edit"
            >
              <Edit className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(apiKey.id)}
              className="p-1 md:p-1.5 lg:p-2 h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 flex-shrink-0 text-red-600 hover:text-red-700"
              title="Delete"
            >
              <Delete className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
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
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreate}
              className="p-2"
            >
              <Plus />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          The key is used to authenticate your requests to the{' '}
          <span className="text-blue-600">Research API</span>. To learn more, see the{' '}
          <span className="text-blue-600">documentation</span> page.
        </p>
      </div>
      
      {apiKeys.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
          <p className="text-gray-500 mb-4">Create your first API key to get started</p>
          <Button
            variant="primary"
            onClick={onCreate}
          >
            Create your first API key
          </Button>
        </div>
      ) : (
        <div>
          <div className="px-4 md:px-6 py-3 bg-gray-50 border-b border-gray-200">
            {/* Mobile Header: Hidden */}
            <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">NAME</div>
              <div className="col-span-2">USAGE</div>
              <div className="col-span-4">KEY</div>
              <div className="col-span-3 text-right">OPTIONS</div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {apiKeys.map((key) => (
              <ApiKeyRow key={key.id} apiKey={key} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
