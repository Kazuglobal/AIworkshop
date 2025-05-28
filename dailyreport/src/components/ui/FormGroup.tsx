'use client';

import React from 'react';

type FormGroupProps = {
  children: React.ReactNode;
  className?: string;
};

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
} 