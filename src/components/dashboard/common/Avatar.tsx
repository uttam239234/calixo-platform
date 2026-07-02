import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  initials?: string;
  className?: string;
}

export default function Avatar({ name, initials, className }: AvatarProps) {
  const fallbackInitials = initials ?? name.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn("flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-200", className)}
      aria-label={name}
    >
      {fallbackInitials}
    </div>
  );
}
