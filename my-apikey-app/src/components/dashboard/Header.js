'use client';

import Link from 'next/link';

export default function Header({ breadcrumbs, children }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {index > 0 && <span className="mx-2">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-gray-700">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{children}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
