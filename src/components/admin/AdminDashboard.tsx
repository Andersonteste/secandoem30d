import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CreditCard, MessageSquare, Activity, Loader2 } from "lucide-react";

const db = supabase as any;

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
      const [alunos, ativos, convs, atividade] = await Promise.all([
        db.from("profiles").select("id", { count: "exact", head: true }),
        db.from("entitlements").select("id", { count: "exact", head: true }).eq("active", true),
        db.from("conversations").select("id", { count: "exact", head: true }).neq("status", "closed"),
        db.from("habits_daily").select("user_id").gte("entry_date", since),
      ]);
      setStats({
        alunos: alunos.count ?? 0,
        ativos: ativos.count ?? 0,
        convs: convs.count ?? 0,
        ativosSemana: new Set((atividade.data ?? []).map((a: any) => a.user_id)).size,
      });
    })();
  }, []);

  if (!stats) {
    return <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const cards = [
    { icon: Users, label: "Alunos cadastrados", value: stats.alunos },
    { icon: CreditCard, label: "Acessos ativos", value: stats.ativos },
    { icon: MessageSquare, label: "Conversas abertas", value: stats.convs },
    { icon: Activity, label: "Ativos nos últimos 7 dias", value: stats.ativosSemana },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <c.icon className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold mt-2">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
