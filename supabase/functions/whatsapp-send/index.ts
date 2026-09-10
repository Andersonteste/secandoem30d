import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { adminClient, getUser, isAdmin, logFailure } from "../_shared/admin.ts";

/** Envia mensagem pelo WhatsApp e registra no histórico da conversa. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const user = await getUser(req);
    if (!user || !(await isAdmin(user.id))) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { conversation_id, text } = await req.json();
    if (!conversation_id || !text || String(text).length > 4000) throw new Error("dados inválidos");

    const admin = adminClient();
    const { data: conv } = await admin.from("conversations").select("*").eq("id", conversation_id).maybeSingle();
    if (!conv) throw new Error("conversa não encontrada");

    const { data: inst } = await admin.from("whatsapp_instances").select("*").eq("id", conv.instance_id).maybeSingle();
    const apiKey = Deno.env.get("EVOLUTION_API_KEY");
    if (!inst || !apiKey) throw new Error("WhatsApp não conectado");

    const base = String(inst.base_url).replace(/\/$/, "");
    const res = await fetch(`${base}/message/sendText/${encodeURIComponent(inst.instance_name)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: apiKey },
      body: JSON.stringify({ number: conv.phone, text }),
    });
    const out = await res.json().catch(() => ({}));

    await admin.from("messages").insert({
      conversation_id, direction: "out", sender: "human", content: text,
      external_id: out?.key?.id ?? null,
    });
    await admin.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversation_id);

    return new Response(JSON.stringify({ ok: res.ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    await logFailure("whatsapp-send", String((e as Error).message ?? e), null);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
