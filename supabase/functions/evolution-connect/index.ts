import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { adminClient, getUser, isAdmin, logFailure } from "../_shared/admin.ts";

/** Cria/conecta a instância na Evolution API e guarda o QR Code. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const user = await getUser(req);
    if (!user || !(await isAdmin(user.id))) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { instance_id } = await req.json();
    if (!instance_id) throw new Error("instance_id obrigatório");

    const apiKey = Deno.env.get("EVOLUTION_API_KEY");
    if (!apiKey) throw new Error("Chave da Evolution API não configurada");

    const admin = adminClient();
    const { data: inst } = await admin.from("whatsapp_instances").select("*").eq("id", instance_id).maybeSingle();
    if (!inst) throw new Error("instância não encontrada");

    const base = String(inst.base_url).replace(/\/$/, "");
    const webhook = `${Deno.env.get("SUPABASE_URL")}/functions/v1/evolution-webhook`;

    // Cria a instância (ignora erro se já existir) e busca o QR Code.
    await fetch(`${base}/instance/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: apiKey },
      body: JSON.stringify({
        instanceName: inst.instance_name,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        webhook: { url: webhook, byEvents: false, base64: true, events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"] },
      }),
    }).catch(() => null);

    const res = await fetch(`${base}/instance/connect/${encodeURIComponent(inst.instance_name)}`, {
      headers: { apikey: apiKey },
    });
    const data = await res.json().catch(() => ({}));

    const qr = data?.base64 ?? data?.qrcode?.base64 ?? data?.qr ?? null;
    const state = data?.instance?.state ?? (qr ? "qr" : "disconnected");

    await admin.from("whatsapp_instances").update({
      qr_code: qr, status: state === "open" ? "connected" : state, webhook_url: webhook,
      connected_at: state === "open" ? new Date().toISOString() : null,
    }).eq("id", instance_id);

    await admin.from("admin_audit_log").insert({
      admin_id: user.id, action: "whatsapp_connect", entity: "whatsapp_instances", entity_id: instance_id,
    });

    return new Response(JSON.stringify({ ok: true, status: state, message: qr ? "Leia o QR Code" : "Instância atualizada" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    await logFailure("evolution-connect", String((e as Error).message ?? e), null);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
