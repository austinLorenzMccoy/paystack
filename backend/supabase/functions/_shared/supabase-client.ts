import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getServiceClient(headers: HeadersInit | undefined = undefined) {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) {
    throw new Error("Missing Supabase service credentials");
  }

  return createClient(url, key, {
    global: headers ? { headers } : undefined,
  });
}

export function getAnonClient(headers: HeadersInit | undefined = undefined) {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!url || !key) {
    throw new Error("Missing Supabase anon credentials");
  }

  return createClient(url, key, {
    global: headers ? { headers } : undefined,
  });
}
