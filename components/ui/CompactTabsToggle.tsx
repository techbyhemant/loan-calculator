interface CompactTabsToggleProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function CompactTabsToggle({
  label,
  value,
  onValueChange,
  options,
  className = "",
}: CompactTabsToggleProps) {
  return (
    <div className={`flex items-center gap-1 md:gap-2 ${className}`} role="group" aria-label={label}>
      {label && (
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      )}
      <div className="inline-flex border bg-emerald-50 border-emerald-300 px-1 rounded-lg gap-1 md:gap-2 items-center">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onValueChange(opt.value)}
            className={`text-xs h-7 leading-none rounded-md px-1 md:px-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              value === opt.value
                ? "font-semibold bg-emerald-700 text-white shadow-sm"
                : "font-normal text-gray-600 bg-transparent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
