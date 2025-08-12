import React from "react";

interface NumericInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value: number | string;
  onChange: (value: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  alwaysFormat?: boolean;
}

function stripCommas(val: string) {
  return val.replace(/,/g, "");
}

function formatIndian(val: string | number) {
  if (val === "" || val === null || val === undefined) return "";
  const num = Number(val);
  if (isNaN(num)) return "";
  return num.toLocaleString("en-IN");
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      onChange,
      placeholder,
      min,
      max,
      step = 1,
      className = "",
      alwaysFormat = false,
      ...rest
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState(() =>
      formatIndian(value)
    );
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    // Sync local state with parent value when not focused (or always if alwaysFormat)
    React.useEffect(() => {
      if (!isFocused || alwaysFormat) {
        setInputValue(formatIndian(value));
      }
    }, [value, isFocused, alwaysFormat]);

    // On focus: strip formatting for editing (unless alwaysFormat)
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (!alwaysFormat) {
        setInputValue(stripCommas(inputValue));
      }
      if (rest.onFocus) rest.onFocus(e);
    };

    // On change: format as you type, preserve cursor (always if alwaysFormat)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/[^\d]/g, "");
      // Remove leading zeros
      val = val.replace(/^0+/, "");
      if (val === "") {
        setInputValue("");
        onChange("");
        return;
      }
      // Format as you type
      const formatted = formatIndian(val);
      setInputValue(formatted);
      // Update parent state with number
      const num = Number(val);
      if (
        (min !== undefined && num < min) ||
        (max !== undefined && num > max)
      ) {
        return;
      }
      onChange(num);
      // Try to preserve cursor position (best effort, but will jump to end)
      if (inputRef.current) {
        const pos = formatted.length;
        setTimeout(() => {
          inputRef.current?.setSelectionRange(pos, pos);
        }, 0);
      }
    };

    // On blur: format if valid, else show ''
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const raw = stripCommas(inputValue);
      if (raw === "" || isNaN(Number(raw))) {
        setInputValue("");
        onChange("");
      } else {
        setInputValue(formatIndian(raw));
      }
      if (rest.onBlur) rest.onBlur(e);
    };

    // Use forwarded ref if provided, else fallback to local ref
    const combinedRef = (node: HTMLInputElement) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
      inputRef.current = node;
    };
    return (
      <input
        ref={combinedRef}
        type="text"
        inputMode="numeric"
        value={inputValue}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={className}
        {...rest}
      />
    );
  }
);

NumericInput.displayName = "NumericInput";
export default NumericInput;
