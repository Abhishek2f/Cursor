'use client';

import Link from 'next/link';
import { ArrowLeft } from '@/components/icons';

export default function BackButton({ href = '/dashboard', className = '' }) {
  return (
    <Link
      href={href}
      className={`text-gray-400 hover:text-gray-600 ${className}`}
    >
      <ArrowLeft />
    </Link>
  );
}
