import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { adminClient, logFailure } from "../_shared/admin.ts";

/**
 * Webhook de pagamentos recorrentes (Kiwify como primeiro provedor).
 * Cria/atualiza assinatura e autorização de acesso conforme o evento.
 * Eventos duplicados são ignorados pelo identificador externo.
 */

const APPROVED = ["order_approved", "order_paid", "subscription_renewed", "subscription_created", "paid"];
const REVOKED = ["order_refunded", "chargeback", "subscription_canceled", "subscription_late", "refunded"];

const PERIOD_DAYS: Record<string, number> = {
  monthly: 30, quarterly: 92, semiannual: 184, annual: 366,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = adminClient();
  let body: any = null;

  try {
    const expected = Deno.env.get("SUBSCRIPTION_WEBHOOK_TOKEN");
    const url = new URL(req.url);
    const provided = req.headers.get("x-webhook-token") ?? url.searchParams.get("token");
    if (!expected || provided !== expected) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    body = await req.json();

    const eventType = String(body.webhook_event_type ?? body.event ?? body.status ?? "unknown").toLowerCase();
    const externalEventId = String(body.webhook_event_id ?? body.order_id ?? body.id ?? crypto.randomUUID());
    const email = (body.Customer?.email ?? body.customer?.email ?? body.buyer_email ?? body.email ?? "").toLowerCase();
    const phone = body.Customer?.mobile ?? body.customer?.phone ?? body.buyer_phone ?? null;
    const productId = String(body.Product?.product_id ?? body.product_id ?? body.external_product_id ?? "");

    if (!email) throw new Error("evento sem e-mail do comprador");

    // Evita processar o mesmo evento duas vezes.
    const { data: dup } = await admin
      .from("subscription_events")
      .select("id")
      .eq("external_event_id", externalEventId)
      .maybeSingle();
    if (dup) {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Encontra o aluno pelo e-mail (pode ainda não ter conta), percorrendo todas as páginas.
    let user: any = null;
    for (let page = 1; page <= 50 && !user; page++) {
      const { data: users } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      const list = users?.users ?? [];
      user = list.find((u: any) => (u.email ?? "").toLowerCase() === email) ?? null;
      if (list.length < 200) break;
    }

    const { data: plan } = productId
      ? await admin.from("plans").select("*").eq("external_product_id", productId).maybeSingle()
      : { data: null as any };

    const approved = APPROVED.some((e) => eventType.includes(e));
    const revoked = REVOKED.some((e) => eventType.includes(e));
    const status = approved ? "active" : revoked ? (eventType.includes("refund") ? "refunded" : eventType.includes("charge") ? "chargeback" : "canceled") : "pending";

    const days = PERIOD_DAYS[plan?.period ?? "monthly"] ?? 30;
    const expiresAt = new Date(Date.now() + days * 864e5).toISOString();

    // Assinatura por identificador externo do provedor.
    const externalId = String(body.subscription_id ?? body.order_id ?? externalEventId);
    const { data: existing } = await admin
      .from("subscriptions")
      .select("*")
      .eq("external_id", externalId)
      .maybeSingle();

    const subPayload: any = {
      user_id: user?.id ?? null,
      plan_id: plan?.id ?? null,
      provider: "kiwify",
      external_id: externalId,
      status,
      buyer_email: email,
      buyer_phone: phone,
      started_at: approved ? new Date().toISOString() : existing?.started_at ?? null,
      expires_at: approved ? expiresAt : existing?.expires_at ?? null,
    };

    const { data: sub } = existing
      ? await admin.from("subscriptions").update(subPayload).eq("id", existing.id).select().maybeSingle()
      : await admin.from("subscriptions").insert(subPayload).select().maybeSingle();

    await admin.from("subscription_events").insert({
      subscription_id: sub?.id ?? null,
      user_id: user?.id ?? null,
      provider: "kiwify",
      external_event_id: externalEventId,
      event_type: eventType,
      payload: body,
    });

    if (user) {
      const { data: ent } = await admin
        .from("entitlements")
        .select("*")
        .eq("user_id", user.id)
        .eq("subscription_id", sub?.id ?? "")
        .maybeSingle();

      if (approved) {
        const payload = {
          user_id: user.id, subscription_id: sub?.id ?? null, source: "kiwify",
          active: true, granted_at: new Date().toISOString(), expires_at: expiresAt,
        };
        if (ent) await admin.from("entitlements").update(payload).eq("id", ent.id);
        else await admin.from("entitlements").insert(payload);
      } else if (revoked) {
        // Chargeback e reembolso cortam o acesso na hora;
        // cancelamento simples mantém até o fim do período pago.
        const immediate = eventType.includes("refund") || eventType.includes("charge");
        if (ent) {
          await admin.from("entitlements").update(
            immediate ? { active: false } : { expires_at: ent.expires_at ?? expiresAt }
          ).eq("id", ent.id);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, matched_user: !!user, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    await logFailure("subscription-webhook", String((e as Error).message ?? e), body);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
