import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { adminClient, logFailure } from "../_shared/admin.ts";

/**
 * Recebe mensagens do WhatsApp (Evolution API), grava a conversa,
 * vincula ao aluno pelo telefone e responde com o atendente digital.
 * As ações feitas por mensagem atualizam os mesmos dados do aplicativo.
 */

const digits = (s: string) => (s ?? "").replace(/\D/g, "");
const today = () => new Date().toISOString().slice(0, 10);

const upsertHabits = async (admin: any, userId: string, patch: Record<string, unknown>) => {
  const { data: existing } = await admin
    .from("habits_daily").select("*").eq("user_id", userId).eq("entry_date", today()).maybeSingle();
  const payload = { ...(existing ?? {}), user_id: userId, entry_date: today(), ...patch };
  delete payload.id; delete payload.created_at; delete payload.updated_at;
  await admin.from("habits_daily").upsert(payload, { onConflict: "user_id,entry_date" });
};

/** Regras rápidas: registram dados sem depender do modelo de linguagem. */
const applyQuickActions = async (admin: any, userId: string, text: string) => {
  const t = text.toLowerCase();
  const done: string[] = [];

  const water = t.match(/(\d{2,4})\s*ml/) ?? t.match(/(\d)(?:[.,](\d))?\s*l(?:itro)?/);
  if (/água|agua|bebi/.test(t) && water) {
    const ml = t.includes("ml") ? Number(water[1]) : Math.round(parseFloat(water[0].replace(",", ".")) * 1000);
    const { data: cur } = await admin.from("habits_daily").select("water_ml").eq("user_id", userId).eq("entry_date", today()).maybeSingle();
    await upsertHabits(admin, userId, { water_ml: (cur?.water_ml ?? 0) + ml });
    done.push(`água +${ml}ml`);
  }

  const sleep = t.match(/(\d{1,2})(?:[.,](\d))?\s*h(?:oras)?/);
  if (/dormi|sono/.test(t) && sleep) {
    await upsertHabits(admin, userId, { sleep_hours: parseFloat(sleep[0].replace(",", ".")) });
    done.push("sono registrado");
  }

  const weight = t.match(/(\d{2,3})(?:[.,](\d))?\s*kg/);
  if (/peso|pesei|kg/.test(t) && weight) {
    await admin.from("weight_logs").insert({ user_id: userId, weight_kg: parseFloat(weight[0].replace("kg", "").replace(",", ".").trim()) });
    done.push("peso registrado");
  }

  if (/treinei|treino feito|fiz o treino|conclu[ií] o treino/.test(t)) {
    await upsertHabits(admin, userId, { workout_done: true });
    done.push("treino concluído");
  }

  return done;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = adminClient();
  let body: any = null;

  try {
    body = await req.json();
    const event = String(body.event ?? "").toUpperCase();
    const instanceName = body.instance ?? body.instanceName ?? null;

    const { data: inst } = await admin
      .from("whatsapp_instances").select("*").eq("instance_name", instanceName).maybeSingle();

    if (event.includes("CONNECTION")) {
      const state = body.data?.state ?? body.data?.connection ?? "unknown";
      if (inst) {
        await admin.from("whatsapp_instances").update({
          status: state === "open" ? "connected" : state,
          connected_at: state === "open" ? new Date().toISOString() : null,
          qr_code: state === "open" ? null : inst.qr_code,
        }).eq("id", inst.id);
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!event.includes("MESSAGES")) {
      return new Response(JSON.stringify({ ok: true, ignored: event }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const msg = Array.isArray(body.data) ? body.data[0] : body.data;
    if (!msg || msg.key?.fromMe) {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const externalId = msg.key?.id ?? crypto.randomUUID();
    const phone = digits(msg.key?.remoteJid ?? "").replace(/^0+/, "");
    const content = msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? "";
    const contactName = msg.pushName ?? null;
    if (!phone) throw new Error("mensagem sem telefone");

    // Ignora mensagem repetida.
    const { data: dupMsg } = await admin.from("messages").select("id").eq("external_id", externalId).maybeSingle();
    if (dupMsg) {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Vincula ao aluno pelo telefone.
    const { data: profiles } = await admin.from("profiles").select("*").not("phone", "is", null);
    const profile = (profiles ?? []).find((p: any) => digits(p.phone).endsWith(phone.slice(-8))) ?? null;

    let { data: conv } = await admin.from("conversations").select("*").eq("phone", phone).maybeSingle();
    if (!conv) {
      const { data: created } = await admin.from("conversations").insert({
        instance_id: inst?.id ?? null, user_id: profile?.id ?? null, phone,
        contact_name: contactName, channel: "whatsapp", status: "open", handled_by: "agent",
      }).select().maybeSingle();
      conv = created;
    } else if (!conv.user_id && profile) {
      await admin.from("conversations").update({ user_id: profile.id }).eq("id", conv.id);
      conv.user_id = profile.id;
    }

    await admin.from("messages").insert({
      conversation_id: conv.id, direction: "in", sender: "student",
      content, external_id: externalId, message_type: "text",
    });
    await admin.from("conversations").update({
      last_message_at: new Date().toISOString(), contact_name: contactName ?? conv.contact_name,
    }).eq("id", conv.id);

    // Atendimento humano assumido: não responder automaticamente.
    if (conv.handled_by === "human") {
      return new Response(JSON.stringify({ ok: true, handled_by: "human" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const quick = profile ? await applyQuickActions(admin, profile.id, content) : [];

    const { data: agent } = await admin.from("agents").select("*").eq("active", true).limit(1).maybeSingle();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    let reply = agent?.away_message ?? "Recebi sua mensagem! Em breve alguém do time responde.";

    if (agent && apiKey) {
      // Contexto real do aluno antes de responder.
      let context = "Aluno ainda não identificado na plataforma.";
      if (profile) {
        const [{ data: h }, { data: w }] = await Promise.all([
          admin.from("habits_daily").select("*").eq("user_id", profile.id).order("entry_date", { ascending: false }).limit(7),
          admin.from("weight_logs").select("weight_kg, measured_at").eq("user_id", profile.id).order("measured_at", { ascending: false }).limit(1),
        ]);
        context = JSON.stringify({
          nome: profile.display_name, objetivo: profile.goal, local: profile.training_location,
          nivel: profile.experience_level, dias_semana: profile.available_days,
          minutos_treino: profile.session_minutes, equipamentos: profile.equipment,
          restricoes: profile.dietary_restrictions, preferencias: profile.food_preferences,
          limitacoes: profile.physical_limitations, peso_inicial: profile.initial_weight_kg,
          peso_atual: w?.[0]?.weight_kg ?? profile.weight_kg, meta: profile.target_weight_kg,
          ultimos_registros: h,
        });
      }

      const system = [
        `Você é ${agent.name}, o atendente digital da plataforma Secando em Casa.`,
        `Tom de voz: ${agent.tone ?? "próximo e motivador"}.`,
        agent.prompt ?? "",
        `Regras: ${agent.rules ?? ""}`,
        `Objetivos: ${agent.goals ?? ""}`,
        "Nunca prometa resultados, nunca dê orientação clínica ou prescrição.",
        "Nunca invente dados do aluno. Se não souber, diga que vai transferir para o time.",
        "Responda curto, em português do Brasil, pronto para WhatsApp.",
        `Dados reais do aluno: ${context}`,
        quick.length ? `Já registrei automaticamente: ${quick.join(", ")}. Confirme isso ao aluno.` : "",
      ].join("\n");

      const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: agent.model ?? "google/gemini-2.5-flash",
          messages: [{ role: "system", content: system }, { role: "user", content }],
        }),
      });
      const aiJson = await ai.json().catch(() => null);
      reply = aiJson?.choices?.[0]?.message?.content ?? reply;
      if (profile) await admin.from("ai_usage").insert({ user_id: profile.id, function_name: "agent-reply" });
    }

    // Envia a resposta pelo WhatsApp.
    const evoKey = Deno.env.get("EVOLUTION_API_KEY");
    if (inst && evoKey) {
      const base = String(inst.base_url).replace(/\/$/, "");
      await fetch(`${base}/message/sendText/${encodeURIComponent(inst.instance_name)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: evoKey },
        body: JSON.stringify({ number: phone, text: reply }),
      }).catch(() => null);
    }

    await admin.from("messages").insert({
      conversation_id: conv.id, direction: "out", sender: "agent", content: reply,
    });

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    await logFailure("evolution-webhook", String((e as Error).message ?? e), body);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
