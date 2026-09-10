import { createClient } from "npm:@supabase/supabase-js@2";

export const adminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

/** Valida o JWT recebido e devolve o usuário autenticado (ou null). */
export const getUser = async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } }
  );
  const { data } = await client.auth.getUser();
  return data.user ?? null;
};

export const isAdmin = async (userId: string) => {
  const { data } = await adminClient()
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
};

export const hasActiveAccess = async (userId: string) => {
  const admin = adminClient();
  if (await isAdmin(userId)) return true;
  const { data } = await admin
    .from("entitlements")
    .select("id, expires_at")
    .eq("user_id", userId)
    .eq("active", true);
  return (data ?? []).some((e: any) => !e.expires_at || new Date(e.expires_at) > new Date());
};

export const logFailure = async (source: string, error: string, payload: unknown) => {
  await adminClient().from("automation_failures").insert({ source, error, payload });
};
