import { createClient } from "@supabase/supabase-js";
import { requiredEnv } from "./env";

export function createSupabaseAdminClient() {
  return createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_SECRET_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "x-application-name": "digmancy-seminar-registration",
      },
    },
  });
}
