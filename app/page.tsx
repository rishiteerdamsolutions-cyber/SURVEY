import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <img
          src="/simple-survey-logo.png"
          alt="Simple Survey"
          className="h-16 sm:h-20 w-auto object-contain mx-auto mb-8"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Simple Survey
        </h1>
        <p className="text-base text-gray-600 mb-8">
          Create and run surveys
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            If you received a survey link, please use it to submit your response.
          </p>
          <Link
            href="/admin"
            className="inline-block px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Admin Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
