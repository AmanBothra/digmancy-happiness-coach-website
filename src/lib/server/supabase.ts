import { createClient } from "@supabase/supabase-js";
import { requiredEnv } from "./env";

const SUPABASE_PROJECT_URL = "https://hhzpeldnktcqcvwyhdjw.supabase.co";

export function createSupabaseAdminClient() {
  return createClient(process.env.SUPABASE_URL || SUPABASE_PROJECT_URL, requiredEnv("SUPABASE_SECRET_KEY"), {
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
