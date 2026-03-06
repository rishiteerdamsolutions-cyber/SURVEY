'use client';

interface Option {
  value: string;
  label: string;
}

interface QuestionCardProps {
  id: string;
  question: string;
  type: 'radio';
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function QuestionCard({
  id,
  question,
  options,
  value,
  onChange,
  required,
}: QuestionCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
      <p className="text-base sm:text-lg font-medium text-gray-800 mb-4">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      <div className="space-y-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-4 p-4 rounded-lg bg-white border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors min-h-[44px] touch-manipulation"
          >
            <input
              type="radio"
              name={id}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm sm:text-base text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
