import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  onClick?: () => void;
  gradient?: boolean;
}

export function Card({ children, className = "", padding = "md", hoverable = false, onClick, gradient = false }: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`card ${
        gradient ? "bg-gradient-to-br from-card via-card to-primary/[0.02]" : ""
      } ${paddingClasses[padding]} ${hoverable ? "card-interactive" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? "Click to interact" : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className = "" }: CardHeaderProps) {
  return (
    <div className={`mb-5 flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h3 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`text-sm text-foreground ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return <div className={`mt-5 flex items-center justify-between gap-4 pt-4 border-t border-border/50 ${className}`}>{children}</div>;
}