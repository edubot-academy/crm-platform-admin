import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Тандаңыз',
  error,
  helperText,
  disabled = false,
  className = '',
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const labelId = `${selectId}-label`;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLButtonElement[]>([]);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onChange(optionValue);
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && options[focusedIndex] && !options[focusedIndex].disabled) {
          handleSelect(options[focusedIndex].value);
        } else {
          setIsOpen(!isOpen);
          setFocusedIndex(isOpen ? -1 : 0);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => {
            const nextIndex = prev + 1;
            if (nextIndex >= options.length) return 0;
            return nextIndex;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => {
            const nextIndex = prev - 1;
            if (nextIndex < 0) return options.length - 1;
            return nextIndex;
          });
        }
        break;
      case 'Home':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(0);
        }
        break;
      case 'End':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(options.length - 1);
        }
        break;
    }
  };

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
      optionsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  return (
      <div className={`w-full ${className}`} ref={selectRef}>
      {label && (
        <label id={labelId} htmlFor={selectId} className="mb-1 block text-sm font-medium text-edubot-dark">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={selectId}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`dashboard-field flex items-center justify-between text-left ${error ? 'border-semantic-error-500 focus:border-semantic-error-500 focus:ring-semantic-error-100 hover:border-semantic-error-400' : ''
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          aria-label={label ? undefined : 'Тандау'}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        >
          <span className={selectedOption ? 'text-edubot-ink' : 'text-edubot-muted'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-edubot-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && !disabled && (
          <div
            className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-edubot-line bg-white p-1 shadow-edubot-card"
            role="listbox"
            aria-activedescendant={focusedIndex >= 0 ? `option-${focusedIndex}` : undefined}
          >
            {options.map((option, index) => (
              <button
                key={option.value}
                ref={(el) => (optionsRef.current[index] = el as HTMLButtonElement)}
                id={`option-${index}`}
                type="button"
                onClick={() => handleSelect(option.value)}
                disabled={option.disabled}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${option.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:bg-edubot-orange/10'
                  } ${value === option.value ? 'bg-primary-50 font-medium text-primary-700' : 'text-edubot-ink'} ${focusedIndex === index ? 'bg-edubot-surface' : ''}`}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-2 text-center text-sm text-edubot-muted">
                Опциялар жок
              </div>
            )}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p id={errorId} className="text-sm text-semantic-error-600">{error}</p>
          )}
          {!error && helperText && (
            <p id={helperId} className="text-sm text-edubot-muted">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}
