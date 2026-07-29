import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side Supabase client using the service role key.
 * Bypasses RLS — use ONLY in server-side code (route handlers, server
 * components, server actions) where auth is already verified by Clerk
 * and we need to read/write on behalf of users.
 */
let serverClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serverClient;
}
