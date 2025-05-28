'use client';

import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  bordered?: boolean;
};

export function Card({
  children,
  className = '',
  padded = true,
  bordered = true,
}: CardProps) {
  const paddingClass = padded ? 'p-6' : '';
  const borderClass = bordered ? 'border border-gray-200' : '';
  
  return (
    <div className={`bg-white rounded-lg shadow-sm ${paddingClass} ${borderClass} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`pb-4 mb-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-medium text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`pt-4 mt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
} 