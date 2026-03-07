export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <img
          src="/simple-survey-logo.png"
          alt="Simple Survey"
          className="h-72 sm:h-80 w-auto max-w-full object-contain mx-auto mb-8"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Thank you for sharing your experience.
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Your response helps us understand real-world problems around informal
          lending and delayed payments.
        </p>
      </div>
    </div>
  );
}
