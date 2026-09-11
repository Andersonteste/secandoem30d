import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BRAND, EQUIPMENT_OPTIONS } from "@/lib/brand";
import {
  Target, Activity, Calendar, Apple, TrendingUp, ChevronRight, ChevronLeft,
  Loader2, Home, Moon, HeartPulse, Dumbbell,
} from "lucide-react";

const goalOptions = [
  { value: "lose_weight", label: "Emagrecer", icon: TrendingUp },
  { value: "gain_muscle", label: "Ganhar massa", icon: Dumbbell },
  { value: "maintain", label: "Manter peso", icon: Target },
  { value: "get_fit", label: "Melhorar condicionamento", icon: Activity },
];

const locationOptions = [
  { value: "casa", label: "Em casa", desc: "Treinos sem depender de academia" },
  { value: "academia", label: "Na academia", desc: "Acesso a máquinas e pesos" },
  { value: "ambos", label: "Casa e academia", desc: "Quero as duas opções" },
];

const experienceOptions = [
  { value: "beginner", label: "Iniciante", desc: "Pouca ou nenhuma experiência" },
  { value: "intermediate", label: "Intermediário", desc: "Alguma experiência com treinos" },
  { value: "advanced", label: "Avançado", desc: "Experiência significativa" },
];

const sessionOptions = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min ou mais" },
];

const dietaryOptions = [
  { value: "vegetarian", label: "Vegetariano" },
  { value: "vegan", label: "Vegano" },
  { value: "lactose_free", label: "Intolerante à lactose" },
  { value: "gluten_free", label: "Sem glúten" },
];

const sleepOptions = [
  { value: "ruim", label: "Ruim" },
  { value: "regular", label: "Regular" },
  { value: "boa", label: "Boa" },
  { value: "otima", label: "Ótima" },
];

const TOTAL_STEPS = 7;

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [trainingLocation, setTrainingLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [availableDays, setAvailableDays] = useState("");
  const [sessionMinutes, setSessionMinutes] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [foodPreferences, setFoodPreferences] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [limitations, setLimitations] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!user) {
          navigate("/auth", { replace: true });
          return;
        }
        setName(((user.user_metadata as any)?.display_name ?? user.email?.split("@")[0] ?? "") as string);

        const { data: profile } = await supabase
          .from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle();
        if (!isMounted) return;
        if (profile?.onboarding_completed === true) {
          navigate("/hoje", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    })();
    return () => { isMounted = false; };
  }, [navigate]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const invalid = () => {
    if (step === 1 && (!name || !age || !weight || !height)) return "Preencha nome, idade, peso e altura.";
    if (step === 2 && !goal) return "Escolha seu objetivo principal.";
    if (step === 3 && !targetWeight) return "Defina sua meta de peso.";
    if (step === 4 && !trainingLocation) return "Informe onde você vai treinar.";
    if (step === 5 && (!experienceLevel || !availableDays || !sessionMinutes)) return "Complete nível, dias e tempo de treino.";
    return null;
  };

  const handleNext = () => {
    const err = invalid();
    if (err) {
      toast({ variant: "destructive", title: "Falta preencher", description: err });
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      const weightValue = parseFloat(weight);
      const payload = {
        id: user.id,
        display_name: name,
        age: parseInt(age),
        weight_kg: weightValue,
        height_cm: parseInt(height),
        target_weight_kg: parseFloat(targetWeight),
        goal,
        training_location: trainingLocation,
        experience_level: experienceLevel,
        available_days: parseInt(availableDays),
        session_minutes: parseInt(sessionMinutes),
        equipment: equipment.length ? equipment : null,
        dietary_restrictions: dietaryRestrictions.length ? dietaryRestrictions : null,
        food_preferences: foodPreferences ? foodPreferences.split(",").map((s) => s.trim()).filter(Boolean) : null,
        sleep_quality: sleepQuality || null,
        physical_limitations: limitations || null,
        phone: phone || null,
        onboarding_completed: true,
        initial_weight_kg: weightValue,
      };

      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (error) throw error;

      supabase.from("weight_logs").insert({ user_id: user.id, weight_kg: weightValue })
        .then(({ error: e }) => { if (e) console.warn("weight log:", e.message); });

      toast({ title: "Tudo pronto!", description: "Seu plano personalizado já está disponível." });
      navigate("/hoje", { replace: true });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-fade-in">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Vamos montar seu plano</h1>
            <p className="text-muted-foreground text-sm">{BRAND.tagline}</p>
            <p className="text-muted-foreground text-sm mt-2">Passo {step} de {TOTAL_STEPS}</p>
            <Progress value={(step / TOTAL_STEPS) * 100} className="mt-3" />
          </div>

          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Seus dados</h2></div>
              <div className="space-y-2"><Label>Como podemos te chamar?</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" /></div>
              <div className="space-y-2"><Label>Idade</Label>
                <Input type="number" min="15" max="100" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex: 32" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Peso atual (kg)</Label>
                  <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Ex: 78.5" /></div>
                <div className="space-y-2"><Label>Altura (cm)</Label>
                  <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Ex: 172" /></div>
              </div>
              <div className="space-y-2"><Label>WhatsApp (opcional)</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 71999999999" />
                <p className="text-xs text-muted-foreground">Usado para ligar seu atendimento ao seu plano.</p></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Seu objetivo</h2></div>
              <RadioGroup value={goal} onValueChange={setGoal}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goalOptions.map((o) => (
                    <Label key={o.value} htmlFor={`goal-${o.value}`}
                      className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-all ${goal === o.value ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                      <RadioGroupItem value={o.value} id={`goal-${o.value}`} />
                      <o.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{o.label}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Sua meta</h2></div>
              <div className="space-y-2"><Label>Peso ou meta desejada (kg)</Label>
                <Input type="number" step="0.1" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="Ex: 70" />
                <p className="text-sm text-muted-foreground">
                  Peso atual: {weight || "—"} kg · Diferença: {weight && targetWeight ? Math.abs(parseFloat(weight) - parseFloat(targetWeight)).toFixed(1) : "0"} kg
                </p></div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2"><Home className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Onde você vai treinar</h2></div>
              <RadioGroup value={trainingLocation} onValueChange={setTrainingLocation}>
                <div className="space-y-3">
                  {locationOptions.map((o) => (
                    <Label key={o.value} htmlFor={`loc-${o.value}`}
                      className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-all ${trainingLocation === o.value ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                      <RadioGroupItem value={o.value} id={`loc-${o.value}`} className="mt-1" />
                      <div><div className="font-medium">{o.label}</div><div className="text-sm text-muted-foreground">{o.desc}</div></div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
              <div className="space-y-2">
                <Label>Equipamentos disponíveis</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EQUIPMENT_OPTIONS.map((o) => (
                    <div key={o.value} className="flex items-center gap-2">
                      <Checkbox id={`eq-${o.value}`} checked={equipment.includes(o.value)}
                        onCheckedChange={() => toggle(equipment, setEquipment, o.value)} />
                      <Label htmlFor={`eq-${o.value}`} className="cursor-pointer text-sm">{o.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Sua rotina de treino</h2></div>
              <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel}>
                <div className="space-y-3">
                  {experienceOptions.map((o) => (
                    <Label key={o.value} htmlFor={`lvl-${o.value}`}
                      className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-all ${experienceLevel === o.value ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                      <RadioGroupItem value={o.value} id={`lvl-${o.value}`} className="mt-1" />
                      <div><div className="font-medium">{o.label}</div><div className="text-sm text-muted-foreground">{o.desc}</div></div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
              <div className="space-y-2"><Label>Dias disponíveis por semana</Label>
                <Input type="number" min="1" max="7" value={availableDays} onChange={(e) => setAvailableDays(e.target.value)} placeholder="Ex: 4" /></div>
              <div className="space-y-2"><Label>Tempo por treino</Label>
                <div className="flex flex-wrap gap-2">
                  {sessionOptions.map((o) => (
                    <Button key={o.value} type="button" size="sm"
                      variant={sessionMinutes === o.value ? "default" : "outline"}
                      onClick={() => setSessionMinutes(o.value)}>{o.label}</Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2"><Apple className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Alimentação</h2></div>
              <div className="space-y-2">
                <Label>Restrições alimentares</Label>
                {dietaryOptions.map((o) => (
                  <div key={o.value} className="flex items-center gap-2">
                    <Checkbox id={`diet-${o.value}`} checked={dietaryRestrictions.includes(o.value)}
                      onCheckedChange={() => toggle(dietaryRestrictions, setDietaryRestrictions, o.value)} />
                    <Label htmlFor={`diet-${o.value}`} className="cursor-pointer">{o.label}</Label>
                  </div>
                ))}
              </div>
              <div className="space-y-2"><Label>Preferências alimentares</Label>
                <Input value={foodPreferences} onChange={(e) => setFoodPreferences(e.target.value)} placeholder="Ex: frango, ovos, marmita, comida rápida" />
                <p className="text-xs text-muted-foreground">Separe por vírgula. Usamos para sugerir receitas.</p></div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2"><Moon className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Sono e cuidados</h2></div>
              <div className="space-y-2"><Label>Como está seu sono hoje?</Label>
                <div className="flex flex-wrap gap-2">
                  {sleepOptions.map((o) => (
                    <Button key={o.value} type="button" size="sm"
                      variant={sleepQuality === o.value ? "default" : "outline"}
                      onClick={() => setSleepQuality(o.value)}>{o.label}</Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" /> Limitações físicas ou dores</Label>
                <Textarea rows={3} value={limitations} onChange={(e) => setLimitations(e.target.value)}
                  placeholder="Ex: dor no joelho direito, hérnia lombar, nenhuma" />
                <p className="text-xs text-muted-foreground">
                  Usamos essa informação para evitar exercícios inadequados. Não substitui avaliação profissional.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
              </Button>
            )}
            {step < TOTAL_STEPS ? (
              <Button onClick={handleNext} className="ml-auto bg-gradient-primary">
                Próximo <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading} className="ml-auto bg-gradient-primary">
                {loading ? "Montando seu plano..." : "Começar"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
