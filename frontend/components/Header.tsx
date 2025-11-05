import Link from 'next/link';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 w-full p-4">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          CuraLink
        </Link>

        {/* Navigation Links */}
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}