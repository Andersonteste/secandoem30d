import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GOAL_LABELS, LEVEL_LABELS, LOCATION_LABELS } from "@/lib/brand";
import { Loader2, Search, User } from "lucide-react";

const db = supabase as any;

export const AdminAlunos = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await db.from("profiles").select("*").order("created_at", { ascending: false }).limit(500);
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  const open360 = async (p: any) => {
    setSelected(p);
    setDetail(null);
    const [ent, subs, habits, weights, convs] = await Promise.all([
      db.from("entitlements").select("*").eq("user_id", p.id),
      db.from("subscriptions").select("*, plans(name, period)").eq("user_id", p.id).order("created_at", { ascending: false }),
      db.from("habits_daily").select("*").eq("user_id", p.id).order("entry_date", { ascending: false }).limit(30),
      db.from("weight_logs").select("*").eq("user_id", p.id).order("measured_at", { ascending: false }).limit(10),
      db.from("conversations").select("id, phone, status, last_message_at").eq("user_id", p.id).limit(5),
    ]);
    setDetail({
      entitlements: ent.data ?? [], subs: subs.data ?? [], habits: habits.data ?? [],
      weights: weights.data ?? [], convs: convs.data ?? [],
    });
  };

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.display_name?.toLowerCase().includes(q) || r.phone?.includes(q);
  });

  const activeAccess = (detail?.entitlements ?? []).some(
    (e: any) => e.active && (!e.expires_at || new Date(e.expires_at) > new Date())
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Alunos</h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por nome ou telefone" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id} className="cursor-pointer hover:bg-accent/40 transition-colors" onClick={() => open360(p)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{p.display_name ?? "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground">
                    {GOAL_LABELS[p.goal] ?? "Objetivo não definido"} · {LOCATION_LABELS[p.training_location] ?? "local não definido"}
                  </p>
                </div>
                {p.onboarding_completed ? <Badge variant="secondary">onboarding ok</Badge> : <Badge variant="outline">pendente</Badge>}
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">Nenhum aluno encontrado.</p>}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Aluno 360° — {selected?.display_name ?? "Aluno"}</DialogTitle></DialogHeader>
          {!detail ? (
            <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4 text-sm">
              <Card><CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><p className="text-muted-foreground text-xs">Objetivo</p><p>{GOAL_LABELS[selected.goal] ?? "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Nível</p><p>{LEVEL_LABELS[selected.experience_level] ?? "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Local</p><p>{LOCATION_LABELS[selected.training_location] ?? "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Dias/semana</p><p>{selected.available_days ?? "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Minutos/treino</p><p>{selected.session_minutes ?? "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Telefone</p><p>{selected.phone ?? "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Peso inicial</p><p>{selected.initial_weight_kg ?? "—"} kg</p></div>
                <div><p className="text-muted-foreground text-xs">Peso atual</p><p>{detail.weights[0]?.weight_kg ?? selected.weight_kg ?? "—"} kg</p></div>
                <div><p className="text-muted-foreground text-xs">Meta</p><p>{selected.target_weight_kg ?? "—"} kg</p></div>
              </CardContent></Card>

              <Card><CardContent className="p-4">
                <p className="font-semibold mb-2">Acesso</p>
                <Badge variant={activeAccess ? "default" : "secondary"}>{activeAccess ? "liberado" : "sem assinatura ativa"}</Badge>
                <div className="mt-3 space-y-1">
                  {detail.subs.map((s: any) => (
                    <p key={s.id}>
                      {s.plans?.name ?? "Plano"} · {s.status} · início {s.started_at ? new Date(s.started_at).toLocaleDateString("pt-BR") : "—"}
                      {s.expires_at ? ` · vence ${new Date(s.expires_at).toLocaleDateString("pt-BR")}` : ""}
                    </p>
                  ))}
                  {detail.subs.length === 0 && <p className="text-muted-foreground">Nenhuma assinatura registrada.</p>}
                </div>
              </CardContent></Card>

              <Card><CardContent className="p-4">
                <p className="font-semibold mb-2">Progresso (últimos 30 registros)</p>
                <p>Dias concluídos: {detail.habits.filter((h: any) => h.day_completed).length}</p>
                <p>Treinos: {detail.habits.filter((h: any) => h.workout_done).length}</p>
                <p>Última atividade: {detail.habits[0]?.entry_date ? new Date(detail.habits[0].entry_date + "T12:00:00").toLocaleDateString("pt-BR") : "—"}</p>
              </CardContent></Card>

              <Card><CardContent className="p-4">
                <p className="font-semibold mb-2">Atendimento</p>
                {detail.convs.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma conversa vinculada.</p>
                ) : detail.convs.map((c: any) => (
                  <p key={c.id}>{c.phone} · {c.status} · {c.last_message_at ? new Date(c.last_message_at).toLocaleString("pt-BR") : "—"}</p>
                ))}
              </CardContent></Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
