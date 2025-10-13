'use client';

import Link from 'next/link';
import { ArrowLeft } from '@/components/icons';

export default function BackButton({ href = '/dashboard', className = '' }) {
  return (
    <Link
      href={href}
      className={`text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 ${className}`}
    >
      <ArrowLeft />
    </Link>
  );
}
