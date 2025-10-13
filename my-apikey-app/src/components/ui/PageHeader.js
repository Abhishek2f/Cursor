'use client';

import Link from 'next/link';
import BackButton from './BackButton';

export default function PageHeader({
  title,
  description,
  showBackButton = true,
  backButtonHref = '/dashboard',
  actions = null
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        {showBackButton && <BackButton href={backButtonHref} />}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
      {description && (
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      )}
    </div>
  );
}
