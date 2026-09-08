import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AccessGate } from "@/components/AccessGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/hooks/useAccount";
import { GOAL_LABELS } from "@/lib/brand";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Loader2, Scale, Ruler, CalendarCheck, Dumbbell, TrendingUp } from "lucide-react";

const EvolucaoContent = () => {
  const { userId, profile } = useAccount();
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [measures, setMeasures] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [weight, setWeight] = useState("");
  const [m, setM] = useState<any>({ waist_cm: "", hip_cm: "", chest_cm: "", arm_cm: "", thigh_cm: "" });
  const [loading, setLoading] = useState(true);

  const load = async (uid: string) => {
    const [w, bm, h] = await Promise.all([
      supabase.from("weight_logs").select("*").eq("user_id", uid).order("measured_at", { ascending: true }),
      supabase.from("body_measurements").select("*").eq("user_id", uid).order("measured_at", { ascending: false }).limit(20),
      supabase.from("habits_daily").select("day_completed, workout_done, entry_date").eq("user_id", uid),
    ]);
    setLogs(w.data ?? []);
    setMeasures(bm.data ?? []);
    setHabits(h.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) load(userId);
  }, [userId]);

  const addWeight = async () => {
    if (!userId || !weight) return;
    const { error } = await supabase.from("weight_logs").insert({ user_id: userId, weight_kg: parseFloat(weight) });
    if (error) return toast({ variant: "destructive", title: "Erro", description: error.message });
    setWeight("");
    toast({ title: "Peso registrado!" });
    load(userId);
  };

  const addMeasures = async () => {
    if (!userId) return;
    const payload: any = { user_id: userId };
    Object.entries(m).forEach(([k, v]) => { if (v !== "") payload[k] = parseFloat(v as string); });
    if (Object.keys(payload).length === 1) return;
    const { error } = await supabase.from("body_measurements").insert(payload);
    if (error) return toast({ variant: "destructive", title: "Erro", description: error.message });
    setM({ waist_cm: "", hip_cm: "", chest_cm: "", arm_cm: "", thigh_cm: "" });
    toast({ title: "Medidas registradas!" });
    load(userId);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const initial = Number(profile?.initial_weight_kg ?? profile?.weight_kg ?? 0);
  const current = logs.length ? Number(logs[logs.length - 1].weight_kg) : initial;
  const target = Number(profile?.target_weight_kg ?? 0);
  const goal = profile?.goal ?? "get_fit";

  // Progresso funciona para qualquer objetivo, não apenas perda de peso.
  let progress = 0;
  let progressLabel = "";
  const diff = current - initial;
  if (goal === "lose_weight" && target && initial > target) {
    progress = Math.min(Math.max(((initial - current) / (initial - target)) * 100, 0), 100);
    progressLabel = `${Math.abs(diff).toFixed(1)} kg eliminados`;
  } else if (goal === "gain_muscle" && target && target > initial) {
    progress = Math.min(Math.max(((current - initial) / (target - initial)) * 100, 0), 100);
    progressLabel = `${Math.abs(diff).toFixed(1)} kg ganhos`;
  } else if (goal === "maintain") {
    const tolerance = 2;
    progress = Math.min(Math.max((1 - Math.abs(diff) / tolerance) * 100, 0), 100);
    progressLabel = `Variação de ${Math.abs(diff).toFixed(1)} kg`;
  } else {
    const done = habits.filter((h) => h.day_completed).length;
    progress = Math.min((done / 30) * 100, 100);
    progressLabel = `${done} dias de rotina concluídos`;
  }

  const chartData = logs.map((l) => ({
    date: new Date(l.measured_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    peso: Number(l.weight_kg),
  }));

  const daysDone = habits.filter((h) => h.day_completed).length;
  const workoutsDone = habits.filter((h) => h.workout_done).length;
  const habitsDays = habits.length;

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-20">
      <Navigation />
      <header className="bg-gradient-primary text-primary-foreground px-5 pt-8 pb-10 rounded-b-[2rem]">
        <h1 className="text-2xl font-bold">Evolução</h1>
        <p className="text-sm opacity-90 mt-1">Objetivo: {GOAL_LABELS[goal] ?? "Condicionamento"}</p>
      </header>

      <main className="container mx-auto px-4 -mt-5 max-w-3xl space-y-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-5 w-5 text-primary" /><h2 className="font-semibold">Seu progresso</h2></div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">{progressLabel} · {progress.toFixed(0)}% da meta</p>
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div><p className="text-xs text-muted-foreground">Inicial</p><p className="font-bold">{initial ? `${initial} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Atual</p><p className="font-bold">{current ? `${current} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Meta</p><p className="font-bold">{target ? `${target} kg` : "—"}</p></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-4 text-center"><CalendarCheck className="h-5 w-5 mx-auto text-primary" /><p className="text-xl font-bold mt-1">{daysDone}</p><p className="text-xs text-muted-foreground">Dias concluídos</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Dumbbell className="h-5 w-5 mx-auto text-primary" /><p className="text-xl font-bold mt-1">{workoutsDone}</p><p className="text-xs text-muted-foreground">Treinos</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Scale className="h-5 w-5 mx-auto text-primary" /><p className="text-xl font-bold mt-1">{habitsDays}</p><p className="text-xs text-muted-foreground">Dias registrados</p></CardContent></Card>
        </div>

        {chartData.length > 1 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">Histórico de peso</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2"><Scale className="h-5 w-5 text-primary" /><h2 className="font-semibold">Registrar peso</h2></div>
            <div className="flex gap-2">
              <Input type="number" step="0.1" placeholder="Ex: 78.4" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <Button onClick={addWeight}>Salvar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2"><Ruler className="h-5 w-5 text-primary" /><h2 className="font-semibold">Medidas corporais (cm)</h2></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ["waist_cm", "Cintura"], ["hip_cm", "Quadril"], ["chest_cm", "Peito"],
                ["arm_cm", "Braço"], ["thigh_cm", "Coxa"],
              ].map(([key, label]) => (
                <div key={key}>
                  <Label className="text-xs">{label}</Label>
                  <Input type="number" step="0.1" value={m[key]} onChange={(e) => setM((p: any) => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <Button onClick={addMeasures} className="w-full">Salvar medidas</Button>
            {measures.length > 0 && (
              <div className="space-y-2 pt-2">
                {measures.slice(0, 5).map((x) => (
                  <div key={x.id} className="flex items-center justify-between text-sm rounded-lg border p-2">
                    <span>{new Date(x.measured_at + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {x.waist_cm && <Badge variant="secondary">cintura {x.waist_cm}</Badge>}
                      {x.hip_cm && <Badge variant="secondary">quadril {x.hip_cm}</Badge>}
                      {x.arm_cm && <Badge variant="secondary">braço {x.arm_cm}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const Evolucao = () => (<AccessGate><EvolucaoContent /></AccessGate>);
export default Evolucao;
