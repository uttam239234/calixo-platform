import { forwardRef, useState, useId } from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: "sm" | "md" | "lg";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, inputSize = "md", className = "", id, onFocus, onBlur, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const [focused, setFocused] = useState(false);

    const sizeClasses = {
      sm: "input-sm",
      md: "",
      lg: "input-lg",
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`input ${sizeClasses[inputSize]} ${
              error ? "input-error" : focused ? "border-ring shadow-[0_0_0_3px_rgba(79,70,229,0.1)]" : ""
            } ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1" role="alert">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };