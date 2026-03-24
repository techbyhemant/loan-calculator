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
    const allowDecimals = step < 1;

    const [inputValue, setInputValue] = React.useState(() =>
      formatIndian(value, allowDecimals)
    );
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
      if (!isFocused || alwaysFormat) {
        setInputValue(formatIndian(value, allowDecimals));
      }
    }, [value, isFocused, alwaysFormat, allowDecimals]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (!alwaysFormat) {
        // On focus, show raw number for easy editing
        const raw = stripCommas(inputValue);
        setInputValue(raw);
      }
      if (rest.onFocus) rest.onFocus(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      if (allowDecimals) {
        // Allow digits and one decimal point
        val = val.replace(/[^\d.]/g, "");

        // Only allow one decimal point
        const dotIndex = val.indexOf(".");
        if (dotIndex !== -1) {
          val = val.slice(0, dotIndex + 1) + val.slice(dotIndex + 1).replace(/\./g, "");
        }

        // Remove leading zeros (but keep "0." and "0.x")
        if (val.length > 1 && val[0] === "0" && val[1] !== ".") {
          val = val.replace(/^0+/, "") || "0";
        }
      } else {
        // Integer only: strip everything except digits
        val = val.replace(/[^\d]/g, "");
        val = val.replace(/^0+/, "");
      }

      // Empty input
      if (val === "") {
        setInputValue("");
        onChange("");
        return;
      }

      // User is typing a decimal — show it but don't fire onChange yet
      if (val === "." || val === "0.") {
        setInputValue("0.");
        return;
      }

      // If val ends with "." (e.g. "8."), show it but fire onChange with the integer part
      if (val.endsWith(".")) {
        setInputValue(val);
        const num = Number(val.slice(0, -1));
        if (!isNaN(num)) {
          if ((min !== undefined && num < min) || (max !== undefined && num > max)) return;
          onChange(num);
        }
        return;
      }

      // Normal value
      const formatted = allowDecimals ? val : formatIndian(val);
      setInputValue(formatted);

      const num = Number(val);
      if (isNaN(num)) return;
      if ((min !== undefined && num < min) || (max !== undefined && num > max)) return;
      onChange(num);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const raw = stripCommas(inputValue).replace(/\.+$/, "");

      if (raw === "" || raw === "." || isNaN(Number(raw))) {
        setInputValue("");
        onChange("");
      } else {
        setInputValue(formatIndian(raw, allowDecimals));
      }
      if (rest.onBlur) rest.onBlur(e);
    };

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
        inputMode={allowDecimals ? "decimal" : "numeric"}
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
