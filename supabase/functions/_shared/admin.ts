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

/**
 * Exige aluno autenticado com acesso ativo e respeita o limite diário de IA.
 * Devolve o usuário quando pode seguir, ou uma resposta pronta de erro.
 */
export const guardAi = async (
  req: Request,
  functionName: string,
  headers: Record<string, string>,
): Promise<{ user: { id: string }; deny?: undefined } | { user?: undefined; deny: Response }> => {
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

  const user = await getUser(req);
  if (!user) return { deny: json({ error: "Faça login para usar esta função." }, 401) };
  if (!(await hasActiveAccess(user.id))) {
    return { deny: json({ error: "Assinatura ativa necessária para usar esta função." }, 403) };
  }

  const admin = adminClient();
  const { data: allowed } = await admin.rpc("check_ai_limit", { _user_id: user.id });
  if (allowed === false) {
    return { deny: json({ error: "Você atingiu o limite de uso de hoje. Tente novamente amanhã." }, 429) };
  }

  await admin.from("ai_usage").insert({ user_id: user.id, function_name: functionName });
  return { user };
};
