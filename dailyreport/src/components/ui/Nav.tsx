'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItemProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  exact?: boolean;
};

export function NavItem({
  href,
  children,
  className = '',
  exact = false,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  
  const activeClass = isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900';
  
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm rounded-md transition-colors ${activeClass} ${className}`}
    >
      {children}
    </Link>
  );
}

type NavProps = {
  children: React.ReactNode;
  className?: string;
  vertical?: boolean;
};

export function Nav({
  children,
  className = '',
  vertical = false,
}: NavProps) {
  const layoutClass = vertical ? 'flex-col space-y-1' : 'flex-row space-x-2';
  
  return (
    <nav className={`flex ${layoutClass} ${className}`}>
      {children}
    </nav>
  );
} 