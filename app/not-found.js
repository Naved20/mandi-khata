import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</p>
        <p className="text-gray-600 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
