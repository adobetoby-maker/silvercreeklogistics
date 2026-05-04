import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _client;
}

export const adminClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getAdminClient() as unknown as Record<string, unknown>)[prop as string];
  },
});
