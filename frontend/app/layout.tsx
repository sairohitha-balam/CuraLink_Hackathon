import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // <-- This line imports Tailwind

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CuraLink - Connect to Health',
  description:
    'Connecting patients and researchers to discover clinical trials, publications, and health experts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <main>{children}</main>
      </body>
    </html>
  );
}