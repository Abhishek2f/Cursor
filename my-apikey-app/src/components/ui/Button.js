'use client';

import Link from 'next/link';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  href = null,
  onClick = null,
  className = '',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-3 text-base gap-2',
    lg: 'px-6 py-4 text-lg gap-3'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
    disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'
  } ${className}`;

  if (loading) {
    children = (
      <>
        <LoadingSpinner size="sm" className="text-white" />
        {children}
      </>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

function LoadingSpinner({ size = 'sm', className = '' }) {
  const sizeClasses = {
    sm: 'h-3 w-3 border-2',
    md: 'h-4 w-4 border-2',
    lg: 'h-5 w-5 border-2'
  };

  return (
    <div className={`animate-spin rounded-full border-white border-t-transparent ${sizeClasses[size]} ${className}`}></div>
  );
}
