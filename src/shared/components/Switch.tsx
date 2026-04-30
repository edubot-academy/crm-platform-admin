interface SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  className = '',
}: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-edubot-orange' : 'bg-slate-300'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-90'} ${className}`}
      aria-label={ariaLabel}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}
