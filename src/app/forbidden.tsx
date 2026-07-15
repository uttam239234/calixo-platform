/**
 * Calixo Platform - Global 403 Boundary
 *
 * Rendered by Next.js when `forbidden()` (next/navigation) is called from a
 * Server Component — a REAL HTTP 403 response, not a client-rendered
 * "Access Denied" message with a 200 underneath. Placed at the app root
 * (not inside `platform-admin/`) because a `forbidden()` call made inside a
 * segment's own `layout.tsx` is caught by the PARENT segment's boundary,
 * the same rule `error.tsx` follows — this is the nearest one above
 * `/platform-admin`, `/internal`, and `/developer` alike.
 */
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldAlert size={28} />
      </div>
      <h1 className="text-2xl font-bold text-foreground">403 — Forbidden</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This area is restricted to Calixo Platform Owners and Platform Admins. Your account is signed in, but does not have the required platform role.
      </p>
      <Link href="/dashboard" className="btn btn-primary btn-md mt-2">
        Back to Dashboard
      </Link>
    </div>
  );
}
