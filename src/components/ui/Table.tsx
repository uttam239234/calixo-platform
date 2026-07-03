import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function Table({ children, className = "", containerClassName = "" }: TableProps) {
  return (
    <div className={`table-container ${containerClassName}`}>
      <table className={`table ${className}`}>{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return <thead className={`table-header ${className}`}>{children}</thead>;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function TableRow({ children, className = "", onClick, selected = false }: TableRowProps) {
  return (
    <tr
      className={`table-row ${selected ? "bg-primary/5" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
      role={onClick ? "button" : undefined}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
}

export function TableCell({ children, className = "", header = false }: TableCellProps) {
  const Cell = header ? "th" : "td";
  return (
    <Cell className={`${header ? "table-header-cell" : "table-cell"} ${className}`}>
      {children}
    </Cell>
  );
}