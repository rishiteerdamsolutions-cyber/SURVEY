import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <img
          src="/simple-survey-logo.png"
          alt="Simple Survey"
          className="h-72 w-auto max-w-full object-contain mx-auto mb-8"
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">
          The page you’re looking for doesn’t exist or the survey link may be invalid.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
