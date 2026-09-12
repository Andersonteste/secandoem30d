import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AccessGate } from "@/components/AccessGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/hooks/useAccount";
import { BRAND, GOAL_LABELS, LEVEL_LABELS, LOCATION_LABELS } from "@/lib/brand";
import {
  Dumbbell, UtensilsCrossed, Droplets, Moon, Sparkles, CheckCircle2,
  Loader2, Plus, ChevronRight, Flame,
} from "lucide-react";

const HABITS_OF_DAY = [
  "Beba um copo de água ao acordar",
  "Caminhe 10 minutos depois de uma refeição",
  "Durma sem o celular na mão",
  "Coma uma fruta no lugar do doce",
  "Prepare a marmita do dia seguinte",
  "Alongue 5 minutos antes de dormir",
  "Inclua uma proteína em cada refeição",
];

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Liga o objetivo do aluno ao objetivo cadastrado nos treinos. */
const GOAL_TO_WORKOUT_GOAL: Record<string, string> = {
  lose_weight: "emagrecimento",
  gain_muscle: "hipertrofia",
  maintain: "emagrecimento",
  get_fit: "condicionamento",
};

const HojeContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, userId } = useAccount();
  const [workout, setWorkout] = useState<any>(null);
  const [recipe, setRecipe] = useState<any>(null);
  const [today, setToday] = useState<any>(null);
  const [weekDone, setWeekDone] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const habitOfDay = useMemo(
    () => HABITS_OF_DAY[new Date().getDay() % HABITS_OF_DAY.length],
    []
  );

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    const load = async () => {
      const location = profile?.training_location ?? "casa";
      const level = profile?.experience_level ?? null;
      const goal = profile?.goal ?? null;
      const restrictions: string[] = profile?.dietary_restrictions ?? [];

      let wQuery = supabase.from("workouts").select("*").limit(20);
      if (location !== "ambos") {
        wQuery = wQuery.or(`location.eq.${location},location.eq.ambos,location.is.null`);
      }
      const [wRes, rRes, hRes, weekRes] = await Promise.all([
        wQuery,
        supabase.from("recipes").select("*").limit(30),
        supabase.from("habits_daily").select("*").eq("user_id", userId).eq("entry_date", todayISO()).maybeSingle(),
        supabase
          .from("habits_daily")
          .select("day_completed, entry_date")
          .eq("user_id", userId)
          .gte("entry_date", new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10)),
      ]);

      if (!mounted) return;

      const workouts = (wRes.data ?? []).filter((w: any) => w.active !== false);
      const byLevel = level ? workouts.filter((w: any) => !w.level || w.level === level) : workouts;
      const wantedGoal = goal ? GOAL_TO_WORKOUT_GOAL[goal] : null;
      const byGoal = wantedGoal ? byLevel.filter((w: any) => !w.goal || w.goal === wantedGoal) : byLevel;
      const pool = byGoal.length ? byGoal : byLevel.length ? byLevel : workouts;
      setWorkout(pool[new Date().getDate() % Math.max(pool.length, 1)] ?? null);

      const recipes = (rRes.data ?? []).filter((r: any) => {
        const tags: string[] = r.diet_tags ?? [];
        if (!restrictions.length) return true;
        return restrictions.every((res) => !tags.length || tags.includes(res) || res === "none");
      });
      const rPool = recipes.length ? recipes : rRes.data ?? [];
      setRecipe(rPool[new Date().getDate() % Math.max(rPool.length, 1)] ?? null);

      setToday(hRes.data ?? null);
      setWeekDone((weekRes.data ?? []).filter((d: any) => d.day_completed).length);
      setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, [userId, profile]);

  const upsertToday = async (patch: Record<string, any>) => {
    if (!userId) return;
    setSaving(true);
    const payload = { user_id: userId, entry_date: todayISO(), ...today, ...patch };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;
    const { data, error } = await supabase
      .from("habits_daily")
      .upsert(payload, { onConflict: "user_id,entry_date" })
      .select()
      .maybeSingle();
    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Não foi possível salvar", description: error.message });
      return;
    }
    setToday(data);
  };

  const waterMl = today?.water_ml ?? 0;
  const waterGoal = today?.water_goal_ml ?? 2500;
  const sleepHours = today?.sleep_hours ?? null;
  const sleepGoal = today?.sleep_goal_hours ?? 8;
  const firstName = (profile?.display_name ?? "").split(" ")[0] || "atleta";
  const goalLabel = GOAL_LABELS[profile?.goal] ?? "sua evolução";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-20">
      <Navigation />

      <header className="bg-gradient-primary text-primary-foreground px-5 pt-8 pb-10 rounded-b-[2rem]">
        <p className="text-sm opacity-90">{BRAND.shortTagline}</p>
        <h1 className="text-2xl font-bold mt-1">Bom te ver, {firstName}!</h1>
        <p className="text-sm opacity-90 mt-1">
          Seu foco de hoje: {goalLabel.toLowerCase()} · {LOCATION_LABELS[profile?.training_location] ?? "Em casa"}
        </p>
        <div className="mt-5">
          <div className="flex justify-between text-xs mb-2 opacity-90">
            <span>Progresso da semana</span>
            <span>{weekDone}/7 dias</span>
          </div>
          <Progress value={(weekDone / 7) * 100} className="h-2" />
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-5 space-y-4 max-w-3xl">
        {/* Treino recomendado */}
        <Card className="shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Treino recomendado</h2>
            </div>
            {workout ? (
              <>
                <p className="font-medium">{workout.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{workout.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {workout.duration_min && <Badge variant="secondary">{workout.duration_min} min</Badge>}
                  {workout.level && <Badge variant="secondary">{LEVEL_LABELS[workout.level] ?? workout.level}</Badge>}
                  {workout.location && <Badge variant="secondary">{LOCATION_LABELS[workout.location] ?? workout.location}</Badge>}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum treino cadastrado ainda.</p>
            )}
            <div className="flex gap-2 mt-4">
              <Button className="flex-1" onClick={() => navigate("/treinos")}>
                Ver treinos <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant={today?.workout_done ? "default" : "outline"}
                onClick={() => upsertToday({ workout_done: !today?.workout_done })}
                disabled={saving}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {today?.workout_done ? "Feito" : "Concluir"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alimentação do dia */}
        <Card className="shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Orientação alimentar de hoje</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Monte suas refeições com proteína, vegetais e um carboidrato de qualidade.
              Beba água entre as refeições e evite líquidos açucarados.
            </p>
            {recipe && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border p-3">
                {recipe.photo_url && (
                  <img src={recipe.photo_url} alt={recipe.title} loading="lazy" className="h-14 w-14 rounded-lg object-cover" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Sugestão do dia</p>
                  <p className="font-medium truncate">{recipe.title}</p>
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/alimentacao")}>
                Alimentação
              </Button>
              <Button
                variant={today?.meals_ok ? "default" : "outline"}
                onClick={() => upsertToday({ meals_ok: !today?.meals_ok })}
                disabled={saving}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {today?.meals_ok ? "Feito" : "Segui hoje"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Água e sono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Água</h2>
              </div>
              <p className="text-2xl font-bold">{(waterMl / 1000).toFixed(1)}L</p>
              <p className="text-xs text-muted-foreground">Meta {(waterGoal / 1000).toFixed(1)}L</p>
              <Progress value={Math.min((waterMl / waterGoal) * 100, 100)} className="h-2 mt-3" />
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full"
                disabled={saving}
                onClick={() => upsertToday({ water_ml: waterMl + 250, water_goal_ml: waterGoal })}
              >
                <Plus className="h-4 w-4 mr-1" /> 250 ml
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Sono</h2>
              </div>
              <p className="text-2xl font-bold">{sleepHours ? `${sleepHours}h` : "—"}</p>
              <p className="text-xs text-muted-foreground">Meta {sleepGoal}h</p>
              <Progress value={sleepHours ? Math.min((sleepHours / sleepGoal) * 100, 100) : 0} className="h-2 mt-3" />
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => navigate("/habitos")}>
                Registrar sono
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hábito do dia */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Hábito do dia</h2>
            </div>
            <p className="text-sm">{habitOfDay}</p>
          </CardContent>
        </Card>

        {/* Concluir o dia */}
        <Button
          size="lg"
          className="w-full"
          disabled={saving}
          variant={today?.day_completed ? "secondary" : "default"}
          onClick={() => upsertToday({ day_completed: !today?.day_completed })}
        >
          <Flame className="h-5 w-5 mr-2" />
          {today?.day_completed ? "Dia concluído ✓" : "Concluir o dia"}
        </Button>
      </main>
    </div>
  );
};

const Hoje = () => (
  <AccessGate>
    <HojeContent />
  </AccessGate>
);

export default Hoje;
