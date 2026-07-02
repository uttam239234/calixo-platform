import { cn } from "@/lib/utils";

interface MetricSparklineProps {
  values: number[];
  className?: string;
  strokeClassName?: string;
}

export default function MetricSparkline({
  values,
  className,
  strokeClassName = "stroke-cyan-400",
}: MetricSparklineProps) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - ((value - min) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={cn("mt-3 h-12 w-full", className)}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <polyline
          fill="none"
          strokeWidth="3"
          points={points}
          className={cn("transition-all duration-300", strokeClassName)}
        />
      </svg>
    </div>
  );
}
