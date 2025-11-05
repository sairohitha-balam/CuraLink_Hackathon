import Link from 'next/link';
import React from 'react';

// This is a layout component that will wrap our auth pages
// It takes other components as "children"
export default function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50">
      <div className="mx-auto w-full max-w-md px-8 py-12">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-gray-900">
            CuraLink
          </Link>
        </div>

        {/* Title (e.g., "Log in to your account") */}
        <h2 className="mt-8 text-center text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h2>

        {/* The Form will go here */}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}