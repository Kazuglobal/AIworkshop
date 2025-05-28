'use client';

import React from 'react';

type FormLabelProps = {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

export function FormLabel({
  htmlFor,
  children,
  required = false,
  className = '',
}: FormLabelProps) {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`block mb-1 text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
} 