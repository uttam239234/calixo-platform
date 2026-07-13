"use client";

import { Lock } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <Lock size={24} />
      </div>
      <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
      <p className="max-w-sm text-sm text-muted-foreground">This area is restricted to Calixo staff. Your account does not have access to the Plan Management Console.</p>
    </div>
  );
}
