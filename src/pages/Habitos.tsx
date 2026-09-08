import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AccessGate } from "@/components/AccessGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/hooks/useAccount";
import { Droplets, Moon, Dumbbell, UtensilsCrossed, Footprints, BatteryCharging, Loader2, Plus, Minus } from "lucide-react";

const todayISO = () => new Date().toISOString().slice(0, 10);
const QUALITIES = [
  { value: "ruim", label: "Ruim" },
  { value: "regular", label: "Regular" },
  { value: "boa", label: "Boa" },
  { value: "otima", label: "Ótima" },
];

const HabitosContent = () => {
  const { userId } = useAccount();
  const { toast } = useToast();
  const [entry, setEntry] = useState<any>({
    water_ml: 0, water_goal_ml: 2500, sleep_hours: 8, sleep_goal_hours: 8,
    sleep_quality: "boa", sleep_start: "", sleep_end: "",
    workout_done: false, meals_ok: false, steps: "", energy: 3, notes: "",
  });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    (async () => {
      const [t, r] = await Promise.all([
        supabase.from("habits_daily").select("*").eq("user_id", userId).eq("entry_date", todayISO()).maybeSingle(),
        supabase.from("habits_daily").select("*").eq("user_id", userId).order("entry_date", { ascending: false }).limit(14),
      ]);
      if (!mounted) return;
      if (t.data) setEntry({ ...t.data, steps: t.data.steps ?? "", notes: t.data.notes ?? "" });
      setRecent(r.data ?? []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [userId]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    const payload: any = {
      user_id: userId,
      entry_date: todayISO(),
      water_ml: Number(entry.water_ml) || 0,
      water_goal_ml: Number(entry.water_goal_ml) || 2500,
      sleep_hours: entry.sleep_hours === "" ? null : Number(entry.sleep_hours),
      sleep_goal_hours: Number(entry.sleep_goal_hours) || 8,
      sleep_quality: entry.sleep_quality || null,
      sleep_start: entry.sleep_start || null,
      sleep_end: entry.sleep_end || null,
      workout_done: !!entry.workout_done,
      meals_ok: !!entry.meals_ok,
      steps: entry.steps === "" ? null : Number(entry.steps),
      energy: Number(entry.energy) || null,
      notes: entry.notes || null,
      day_completed: entry.day_completed ?? false,
    };
    const { data, error } = await supabase
      .from("habits_daily")
      .upsert(payload, { onConflict: "user_id,entry_date" })
      .select()
      .maybeSingle();
    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
      return;
    }
    toast({ title: "Registro salvo!", description: "Seus hábitos de hoje foram atualizados." });
    setRecent((prev) => [data, ...prev.filter((p) => p.entry_date !== data.entry_date)]);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const waterPct = Math.min((Number(entry.water_ml) / (Number(entry.water_goal_ml) || 2500)) * 100, 100);

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-20">
      <Navigation />
      <header className="bg-gradient-primary text-primary-foreground px-5 pt-8 pb-10 rounded-b-[2rem]">
        <h1 className="text-2xl font-bold">Hábitos</h1>
        <p className="text-sm opacity-90 mt-1">Registre sua rotina de hoje: água, sono, treino, refeições e energia.</p>
      </header>

      <main className="container mx-auto px-4 -mt-5 max-w-3xl space-y-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2"><Droplets className="h-5 w-5 text-primary" /><h2 className="font-semibold">Água</h2></div>
            <p className="text-2xl font-bold">{(Number(entry.water_ml) / 1000).toFixed(2)}L</p>
            <Progress value={waterPct} className="h-2" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEntry((e: any) => ({ ...e, water_ml: Math.max(0, Number(e.water_ml) - 250) }))}><Minus className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setEntry((e: any) => ({ ...e, water_ml: Number(e.water_ml) + 250 }))}><Plus className="h-4 w-4 mr-1" />250 ml</Button>
              <div className="w-32">
                <Input type="number" value={entry.water_goal_ml} onChange={(ev) => setEntry((e: any) => ({ ...e, water_goal_ml: ev.target.value }))} placeholder="Meta (ml)" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2"><Moon className="h-5 w-5 text-primary" /><h2 className="font-semibold">Sono</h2></div>
            <div>
              <Label>Horas dormidas: {entry.sleep_hours ?? 0}h</Label>
              <Slider className="mt-3" min={0} max={12} step={0.5} value={[Number(entry.sleep_hours) || 0]} onValueChange={([v]) => setEntry((e: any) => ({ ...e, sleep_hours: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Deitou às</Label><Input type="time" value={entry.sleep_start ?? ""} onChange={(ev) => setEntry((e: any) => ({ ...e, sleep_start: ev.target.value }))} /></div>
              <div><Label>Acordou às</Label><Input type="time" value={entry.sleep_end ?? ""} onChange={(ev) => setEntry((e: any) => ({ ...e, sleep_end: ev.target.value }))} /></div>
            </div>
            <div>
              <Label>Qualidade</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {QUALITIES.map((q) => (
                  <Button key={q.value} size="sm" variant={entry.sleep_quality === q.value ? "default" : "outline"} onClick={() => setEntry((e: any) => ({ ...e, sleep_quality: q.value }))}>{q.label}</Button>
                ))}
              </div>
            </div>
            <div><Label>Meta de sono (h)</Label><Input type="number" step="0.5" value={entry.sleep_goal_hours ?? 8} onChange={(ev) => setEntry((e: any) => ({ ...e, sleep_goal_hours: ev.target.value }))} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold">Rotina</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant={entry.workout_done ? "default" : "outline"} onClick={() => setEntry((e: any) => ({ ...e, workout_done: !e.workout_done }))}>
                <Dumbbell className="h-4 w-4 mr-2" /> Treinei
              </Button>
              <Button variant={entry.meals_ok ? "default" : "outline"} onClick={() => setEntry((e: any) => ({ ...e, meals_ok: !e.meals_ok }))}>
                <UtensilsCrossed className="h-4 w-4 mr-2" /> Refeições ok
              </Button>
            </div>
            <div>
              <Label className="flex items-center gap-2"><Footprints className="h-4 w-4" /> Passos / atividade</Label>
              <Input type="number" placeholder="Ex: 7000" value={entry.steps ?? ""} onChange={(ev) => setEntry((e: any) => ({ ...e, steps: ev.target.value }))} />
            </div>
            <div>
              <Label className="flex items-center gap-2"><BatteryCharging className="h-4 w-4" /> Energia: {entry.energy}/5</Label>
              <Slider className="mt-3" min={1} max={5} step={1} value={[Number(entry.energy) || 3]} onValueChange={([v]) => setEntry((e: any) => ({ ...e, energy: v }))} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea rows={3} value={entry.notes ?? ""} onChange={(ev) => setEntry((e: any) => ({ ...e, notes: ev.target.value }))} placeholder="Como foi o seu dia?" />
            </div>
            <Button className="w-full" onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Salvar registro de hoje"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="font-semibold mb-3">Últimos registros</h2>
            {recent.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>}
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span>{new Date(r.entry_date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    <Badge variant="secondary">{((r.water_ml ?? 0) / 1000).toFixed(1)}L</Badge>
                    {r.sleep_hours != null && <Badge variant="secondary">{r.sleep_hours}h sono</Badge>}
                    {r.workout_done && <Badge>treino</Badge>}
                    {r.day_completed && <Badge>dia ✓</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const Habitos = () => (
  <AccessGate><HabitosContent /></AccessGate>
);

export default Habitos;
