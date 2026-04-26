interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  floating?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

export function Input({
  label,
  error,
  helperText,
  floating = false,
  showCharCount = false,
  maxLength,
  className = '',
  value,
  ...props
}: InputProps) {
  const charCount = typeof value === 'string' ? value.length : 0;
  const hasValue = value !== undefined && value !== '';

  return (
    <div className="w-full">
      {label && !floating && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {floating && (
          <label
            className={`absolute left-3 transition-all duration-200 pointer-events-none ${hasValue || props.placeholder
                ? '-top-2.5 left-2 text-xs bg-white px-1 text-primary-600'
                : 'top-2 text-sm text-gray-500'
              }`}
          >
            {label}
          </label>
        )}
        <input
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${error ? 'border-semantic-error-500 focus:ring-semantic-error-500' : ''
            } ${floating ? 'pt-3' : ''} ${className}`}
          value={value}
          maxLength={maxLength}
          {...props}
        />
      </div>
      {(error || helperText || (showCharCount && maxLength)) && (
        <div className="mt-1 flex items-center justify-between">
          <div className="flex-1">
            {error && (
              <p className="text-sm text-semantic-error-600">{error}</p>
            )}
            {!error && helperText && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p className="text-xs text-gray-400 ml-2">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
