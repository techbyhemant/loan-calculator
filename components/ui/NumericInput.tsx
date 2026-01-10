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

function formatIndian(val: string | number, allowDecimals: boolean = false) {
  if (val === "" || val === null || val === undefined) return "";
  const num = Number(val);
  if (isNaN(num)) return "";
  // For decimal values, don't apply Indian number formatting (no commas)
  if (allowDecimals && num % 1 !== 0) {
    return num.toString();
  }
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
    // Determine if decimals are allowed based on step prop
    const allowDecimals = step < 1;

    const [inputValue, setInputValue] = React.useState(() =>
      formatIndian(value, allowDecimals)
    );
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    // Sync local state with parent value when not focused (or always if alwaysFormat)
    React.useEffect(() => {
      if (!isFocused || alwaysFormat) {
        setInputValue(formatIndian(value, allowDecimals));
      }
    }, [value, isFocused, alwaysFormat, allowDecimals]);

    // On focus: strip formatting for editing (unless alwaysFormat)
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (!alwaysFormat) {
        // For decimal values, just remove commas but keep decimal point
        if (allowDecimals) {
          setInputValue(inputValue.replace(/,/g, ""));
        } else {
          setInputValue(stripCommas(inputValue));
        }
      }
      if (rest.onFocus) rest.onFocus(e);
    };

    // On change: format as you type, preserve cursor (always if alwaysFormat)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      if (allowDecimals) {
        // Allow digits and one decimal point
        val = val.replace(/[^\d.]/g, "");
        // Only allow one decimal point
        const parts = val.split(".");
        if (parts.length > 2) {
          val = parts[0] + "." + parts.slice(1).join("");
        }
        // Remove leading zeros from integer part, but preserve "0" if it's "0." or "0.xxx"
        const integerPart = parts[0] || "";
        const decimalPart = parts[1] || "";
        if (integerPart.length > 1) {
          // If there's a decimal part, we want to keep at least one "0" if it's "0.xxx"
          // Otherwise remove leading zeros
          if (decimalPart && integerPart === "0") {
            // Keep "0.xxx" as is
            val = "0." + decimalPart;
          } else {
            // Remove leading zeros (e.g., "005" -> "5", "005.5" -> "5.5")
            const cleanedInteger = integerPart.replace(/^0+/, "") || "0";
            val = cleanedInteger + (decimalPart ? "." + decimalPart : "");
          }
        }
      } else {
        // For integers, only allow digits
        val = val.replace(/[^\d]/g, "");
        // Remove leading zeros
        val = val.replace(/^0+/, "");
      }

      // Handle empty or just decimal point
      if (val === "") {
        setInputValue("");
        onChange("");
        return;
      }

      // Allow "0." or "." to be typed (user is entering a decimal)
      if (val === "." || val === "0.") {
        setInputValue("0.");
        // Don't call onChange yet - wait for more input
        return;
      }

      // Format as you type (for integers only)
      const formatted = allowDecimals ? val : formatIndian(val);
      setInputValue(formatted);

      // Update parent state with number
      const num = Number(val);
      if (isNaN(num)) {
        return;
      }

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
      const raw = allowDecimals
        ? inputValue.replace(/,/g, "")
        : stripCommas(inputValue);

      if (raw === "" || raw === "." || isNaN(Number(raw))) {
        setInputValue("");
        onChange("");
      } else {
        setInputValue(formatIndian(raw, allowDecimals));
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
