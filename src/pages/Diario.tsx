import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Calendar, Save, Dumbbell, Apple, Droplets, Moon, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Navigation } from "@/components/Navigation";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

interface DiaryEntry {
  id: string;
  entry_date: string;
  notes: string;
  photos: any;
}

const Diario = () => {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [completedWorkout, setCompletedWorkout] = useState(false);
  const [completedMeal, setCompletedMeal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Hidratação
  const [waterIntake, setWaterIntake] = useState(0); // em ml
  const [waterGoal, setWaterGoal] = useState(2000); // meta padrão de 2L
  
  // Sono
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [sleepQuality, setSleepQuality] = useState<"bad" | "ok" | "good" | "">("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Função para obter a data atual no horário do Brasil (BRT/BRST)
  const getBrazilDate = () => {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return format(brazilTime, "yyyy-MM-dd");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadEntries(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const loadEntries = async (userId: string) => {
    const { data } = await (supabase as any)
      .from("food_diary")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false });

    if (data) {
      setEntries(data);
      const todayBrazil = getBrazilDate();
      const todayEntry = data.find(e => e.entry_date === selectedDate);
      
      if (todayEntry) {
        setCurrentNote(todayEntry.notes || "");
        const photos = (todayEntry.photos as any) || {};
        setCompletedWorkout(photos.completedWorkout || false);
        setCompletedMeal(photos.completedMeal || false);
        
        // Hidratação - reseta se não for o dia de hoje
        if (selectedDate === todayBrazil) {
          setWaterIntake(photos.waterIntake || 0);
          setWaterGoal(photos.waterGoal || 2000);
        } else {
          setWaterIntake(photos.waterIntake || 0);
          setWaterGoal(photos.waterGoal || 2000);
        }
        
        // Sono
        setSleepTime(photos.sleepTime || "");
        setWakeTime(photos.wakeTime || "");
        setSleepQuality(photos.sleepQuality || "");
      } else {
        // Resetar valores para nova entrada
        setWaterIntake(0);
        setWaterGoal(2000);
        setSleepTime("");
        setWakeTime("");
        setSleepQuality("");
      }
    }
  };

  const saveEntry = async () => {
    if (!user) return;
    
    setLoading(true);
    const existingEntry = entries.find(e => e.entry_date === selectedDate);

    const entryData = {
      notes: currentNote,
      photos: {
        completedWorkout,
        completedMeal,
        waterIntake,
        waterGoal,
        sleepTime,
        wakeTime,
        sleepQuality
      }
    };

    if (existingEntry) {
      const { error } = await (supabase as any)
        .from("food_diary")
        .update(entryData)
        .eq("id", existingEntry.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao atualizar entrada",
        });
      } else {
        toast({
          title: "Salvo!",
          description: "Sua entrada no diário foi atualizada",
        });
        loadEntries(user.id);
      }
    } else {
      const { error } = await (supabase as any)
        .from("food_diary")
        .insert({
          user_id: user.id,
          entry_date: selectedDate,
          ...entryData
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao criar entrada",
        });
      } else {
        toast({
          title: "Salvo!",
          description: "Sua entrada no diário foi criada",
        });
        loadEntries(user.id);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-glow">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Diário Alimentar</h1>
              <p className="text-sm opacity-90">Acompanhe suas refeições e progresso diário</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6 mb-6 bg-gradient-card shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                const entry = entries.find(ent => ent.entry_date === e.target.value);
                setCurrentNote(entry?.notes || "");
                const photos = (entry?.photos as any) || {};
                setCompletedWorkout(photos.completedWorkout || false);
                setCompletedMeal(photos.completedMeal || false);
              }}
              className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer"
            />
          </div>

          <div className="space-y-4 mb-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <Checkbox 
                id="workout"
                checked={completedWorkout}
                onCheckedChange={(checked) => setCompletedWorkout(checked as boolean)}
              />
              <label
                htmlFor="workout"
                className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1"
              >
                <Dumbbell className="h-4 w-4 text-primary" />
                Completei o treino do dia
              </label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <Checkbox 
                id="meal"
                checked={completedMeal}
                onCheckedChange={(checked) => setCompletedMeal(checked as boolean)}
              />
              <label
                htmlFor="meal"
                className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1"
              >
                <Apple className="h-4 w-4 text-secondary" />
                Segui o plano alimentar
              </label>
            </div>
          </div>

          {/* Hidratação */}
          <Card className="p-4 mb-4 bg-accent/50">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Hidratação</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{waterIntake}ml de {waterGoal}ml</span>
                <span className="text-muted-foreground">
                  {Math.round((waterIntake / waterGoal) * 100)}%
                </span>
              </div>
              
              <Progress value={(waterIntake / waterGoal) * 100} className="h-2" />
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setWaterIntake(Math.max(0, waterIntake - 250))}
                  className="flex-1"
                >
                  <Minus className="h-4 w-4 mr-1" />
                  250ml
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setWaterIntake(Math.min(waterGoal, waterIntake + 250))}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  250ml
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Meta diária:</label>
                <Input
                  type="number"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(Number(e.target.value))}
                  className="w-24 h-8 text-sm"
                  min="500"
                  max="5000"
                  step="250"
                />
                <span className="text-sm">ml</span>
              </div>
            </div>
          </Card>

          {/* Sono */}
          <Card className="p-4 mb-4 bg-accent/50">
            <div className="flex items-center gap-2 mb-3">
              <Moon className="h-5 w-5 text-indigo-500" />
              <h3 className="font-semibold">Sono e Descanso</h3>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora de dormir</label>
                  <Input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora de acordar</label>
                  <Input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Qualidade do sono</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={sleepQuality === "bad" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSleepQuality("bad")}
                    className="flex-1"
                  >
                    😴 Ruim
                  </Button>
                  <Button
                    type="button"
                    variant={sleepQuality === "ok" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSleepQuality("ok")}
                    className="flex-1"
                  >
                    😐 Ok
                  </Button>
                  <Button
                    type="button"
                    variant={sleepQuality === "good" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSleepQuality("good")}
                    className="flex-1"
                  >
                    😊 Bom
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Como me senti hoje</label>
            <Textarea
              placeholder="Descreva como foi seu dia, o que comeu, como se sentiu durante o treino..."
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <Button
            onClick={saveEntry}
            disabled={loading}
            className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Salvando..." : "Salvar Entrada"}
          </Button>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Entradas Anteriores</h2>
          {entries.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma entrada no diário ainda. Comece hoje!</p>
            </Card>
          ) : (
            entries.map((entry) => {
              const photos = (entry.photos as any) || {};
              return (
                <Card
                  key={entry.id}
                  className="p-4 hover:shadow-glow transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedDate(entry.entry_date);
                    setCurrentNote(entry.notes || "");
                    const clickedPhotos = (entry.photos as any) || {};
                    setCompletedWorkout(clickedPhotos.completedWorkout || false);
                    setCompletedMeal(clickedPhotos.completedMeal || false);
                    setWaterIntake(clickedPhotos.waterIntake || 0);
                    setWaterGoal(clickedPhotos.waterGoal || 2000);
                    setSleepTime(clickedPhotos.sleepTime || "");
                    setWakeTime(clickedPhotos.wakeTime || "");
                    setSleepQuality(clickedPhotos.sleepQuality || "");
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(new Date(entry.entry_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {photos.completedWorkout && (
                        <div className="bg-primary/10 p-1 rounded">
                          <Dumbbell className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      {photos.completedMeal && (
                        <div className="bg-secondary/10 p-1 rounded">
                          <Apple className="h-3 w-3 text-secondary" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.notes || "Sem anotações"}
                  </p>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Diario;
