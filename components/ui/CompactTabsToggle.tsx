import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className={`flex items-center gap-1 md:gap-2 ${className}`}>
      {label && (
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      )}
      <Tabs
        value={value}
        onValueChange={onValueChange}
        className="border bg-emerald-50 text-white border-emerald-300 px-1 rounded-lg"
      >
        <TabsList className="inline-flex bg-transparent p-0 gap-1 md:gap-2">
          {options.map((opt) => (
            <TabsTrigger
              key={opt.value}
              value={opt.value}
              className={`text-xs h-7 !leading-0 focus:ring-0 focus:outline-none px-1 md:px-2 ${
                value === opt.value
                  ? "font-semibold  !bg-emerald-500 "
                  : "font-normal text-gray-500"
              }`}
            >
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
