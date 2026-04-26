import { useState } from 'react';
import { Code, Check, X } from 'lucide-react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
}

export function JsonEditor({
  value,
  onChange,
  label,
  error,
  helperText,
  placeholder = '{\n  "key": "value"\n}',
  className = '',
}: JsonEditorProps) {
  const [isValid, setIsValid] = useState(true);
  const [formattedValue, setFormattedValue] = useState(value);

  const validateJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setFormattedValue(newValue);
    const valid = validateJson(newValue);
    setIsValid(valid);
    onChange(newValue);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(formattedValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedValue(formatted);
      onChange(formatted);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <button
            type="button"
            onClick={formatJson}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
            aria-label="JSON форматтоо"
          >
            <Code className="w-3 h-3" />
            Форматтоо
          </button>
        </div>
      )}
      <div className="relative">
        <textarea
          value={formattedValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-y min-h-[120px] ${error || !isValid ? 'border-semantic-error-500 focus:ring-semantic-error-500' : 'border-gray-300'
            }`}
        />
        <div className="absolute top-2 right-2">
          {formattedValue && (
            isValid ? (
              <Check className="w-4 h-4 text-semantic-success-500" />
            ) : (
              <X className="w-4 h-4 text-semantic-error-500" />
            )
          )}
        </div>
      </div>
      {(error || helperText || !isValid) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-semantic-error-600">{error}</p>
          )}
          {!error && !isValid && (
            <p className="text-sm text-semantic-error-600">Жарактуу JSON эмес</p>
          )}
          {!error && isValid && helperText && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}
