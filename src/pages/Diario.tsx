import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Calendar, Save, Dumbbell, Apple } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Navigation } from "@/components/Navigation";

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
  const navigate = useNavigate();
  const { toast } = useToast();

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
      const todayEntry = data.find(e => e.entry_date === selectedDate);
      if (todayEntry) {
        setCurrentNote(todayEntry.notes || "");
        // Parse photos data for checkboxes if needed
        const photos = (todayEntry.photos as any) || {};
        setCompletedWorkout(photos.completedWorkout || false);
        setCompletedMeal(photos.completedMeal || false);
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
        completedMeal
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
