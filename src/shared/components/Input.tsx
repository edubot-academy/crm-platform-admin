import { useId } from 'react';

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
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const charCount = typeof value === 'string' ? value.length : 0;
  const hasValue = value !== undefined && value !== '';

  return (
    <div className="w-full">
      {label && !floating && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-edubot-dark">
          {label}
        </label>
      )}
      <div className="relative">
        {floating && (
          <label
            htmlFor={inputId}
            className={`absolute left-3 transition-all duration-200 pointer-events-none ${hasValue || props.placeholder
                ? '-top-2.5 left-3 text-xs bg-white px-1 text-primary-600'
                : 'top-3 text-sm text-edubot-muted'
              }`}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={`dashboard-field ${error ? 'border-semantic-error-500 focus:border-semantic-error-500 focus:ring-semantic-error-100 hover:border-semantic-error-400' : ''
            } ${floating ? 'pt-5' : ''} ${className}`}
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
              <p className="text-sm text-edubot-muted">{helperText}</p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p className="ml-2 text-xs text-edubot-muted/80">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
