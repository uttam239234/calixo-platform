import { forwardRef, isValidElement, cloneElement } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg";
  loading?: boolean;
  icon?: React.ReactNode;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, children, className = "", disabled, asChild = false, ...props }, ref) => {
    const baseClasses =
      "btn inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline: "btn-outline",
      ghost: "btn-ghost",
      destructive: "btn-destructive",
      success: "btn-success",
    };

    const sizeClasses = {
      xs: "btn-xs h-7 px-2.5 text-[11px]",
      sm: "btn-sm h-8.5 px-3.5 text-xs",
      md: "btn-md h-10.5 px-4.5 text-sm",
      lg: "btn-lg h-12.5 px-6 text-base",
      icon: "btn-icon h-9.5 w-9.5",
      "icon-sm": "btn-icon-sm h-8 w-8",
      "icon-lg": "btn-icon-lg h-11 w-11",
    };

    if (asChild && isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      const childClassName = child.props.className;

      return cloneElement(child, {
        className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${childClassName || ""}`.trim(),
        ...props,
      } as Record<string, unknown>);
    }

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };