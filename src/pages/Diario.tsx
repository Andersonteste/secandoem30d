import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Save, Dumbbell, Apple, Flame, CalendarDays, ChevronLeft, ChevronRight, Moon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO, differenceInDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [completedWorkout, setCompletedWorkout] = useState(false);
  const [completedMeal, setCompletedMeal] = useState(false);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate streak
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    
    const sortedDates = entries
      .map(e => parseISO(e.entry_date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let currentStreak = 0;
    let checkDate = new Date();
    
    // Check if today has entry, if not start from yesterday
    const todayEntry = entries.find(e => e.entry_date === format(checkDate, "yyyy-MM-dd"));
    if (!todayEntry) {
      checkDate = subDays(checkDate, 1);
    }
    
    for (const date of sortedDates) {
      if (isSameDay(date, checkDate) || differenceInDays(checkDate, date) === 0) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else if (differenceInDays(checkDate, date) === 1) {
        currentStreak++;
        checkDate = date;
      } else {
        break;
      }
    }
    
    return currentStreak;
  }, [entries]);

  // Get entries for calendar display
  const entryDates = useMemo(() => {
    return new Set(entries.map(e => e.entry_date));
  }, [entries]);

  // Stats for current month
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const monthEntries = entries.filter(e => {
      const date = parseISO(e.entry_date);
      return date >= monthStart && date <= monthEnd;
    });
    
    const workoutDays = monthEntries.filter(e => (e.photos as any)?.completedWorkout).length;
    const mealDays = monthEntries.filter(e => (e.photos as any)?.completedMeal).length;
    const sleepEntries = monthEntries.filter(e => (e.photos as any)?.sleepHours != null);
    const avgSleep = sleepEntries.length > 0 
      ? (sleepEntries.reduce((acc, e) => acc + ((e.photos as any)?.sleepHours || 0), 0) / sleepEntries.length).toFixed(1)
      : null;
    
    return { total: monthEntries.length, workoutDays, mealDays, avgSleep };
  }, [entries, calendarMonth]);

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

  // Load entry for selected date
  useEffect(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const entry = entries.find(e => e.entry_date === dateStr);
    
    if (entry) {
      setCurrentNote(entry.notes || "");
      const photos = (entry.photos as any) || {};
      setCompletedWorkout(photos.completedWorkout || false);
      setCompletedMeal(photos.completedMeal || false);
      setSleepHours(photos.sleepHours ?? 7);
    } else {
      setCurrentNote("");
      setCompletedWorkout(false);
      setCompletedMeal(false);
      setSleepHours(7);
    }
  }, [selectedDate, entries]);

  const loadEntries = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("food_diary")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false });

    if (data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const saveEntry = async () => {
    if (!user) return;
    
    setSaving(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const existingEntry = entries.find(e => e.entry_date === dateStr);

    const entryData = {
      notes: currentNote,
      photos: {
        completedWorkout,
        completedMeal,
        sleepHours
      }
    };

    if (existingEntry) {
      const { error } = await supabase
        .from("food_diary")
        .update(entryData)
        .eq("id", existingEntry.id);

      if (error) {
        toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar entrada" });
      } else {
        toast({ title: "Salvo!", description: "Entrada atualizada com sucesso" });
        loadEntries(user.id);
      }
    } else {
      const { error } = await supabase
        .from("food_diary")
        .insert({ user_id: user.id, entry_date: dateStr, ...entryData });

      if (error) {
        toast({ variant: "destructive", title: "Erro", description: "Falha ao criar entrada" });
      } else {
        toast({ title: "Salvo!", description: "Nova entrada criada com sucesso" });
        loadEntries(user.id);
      }
    }
    setSaving(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const hasEntryToday = entryDates.has(selectedDateStr);

  return (
    <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-glow">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Diário Alimentar</h1>
                <p className="text-sm opacity-90">Acompanhe seu progresso diário</p>
              </div>
            </div>
            {/* Streak Badge */}
            {streak > 0 && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-300" />
                <span className="font-bold text-lg">{streak}</span>
                <span className="text-sm opacity-90">dias</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr,380px] gap-6">
            {/* Entry Form */}
            <div className="space-y-4 order-2 md:order-1">
              {/* Selected Date Card */}
              <Card className="p-5 bg-gradient-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <span className="font-semibold">
                      {isToday(selectedDate) 
                        ? "Hoje" 
                        : format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                  {hasEntryToday && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Preenchido
                    </span>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 mb-5">
                  <label
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                      completedWorkout 
                        ? "bg-primary/15 border border-primary/30" 
                        : "bg-muted/50 border border-transparent hover:bg-muted"
                    )}
                  >
                    <Checkbox 
                      id="workout"
                      checked={completedWorkout}
                      onCheckedChange={(checked) => setCompletedWorkout(checked as boolean)}
                    />
                    <Dumbbell className={cn("h-5 w-5", completedWorkout ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-medium flex-1">Completei o treino</span>
                    {completedWorkout && <span className="text-xl">💪</span>}
                  </label>

                  <label
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                      completedMeal 
                        ? "bg-green-500/15 border border-green-500/30" 
                        : "bg-muted/50 border border-transparent hover:bg-muted"
                    )}
                  >
                    <Checkbox 
                      id="meal"
                      checked={completedMeal}
                      onCheckedChange={(checked) => setCompletedMeal(checked as boolean)}
                    />
                    <Apple className={cn("h-5 w-5", completedMeal ? "text-green-500" : "text-muted-foreground")} />
                    <span className="font-medium flex-1">Segui o plano alimentar</span>
                    {completedMeal && <span className="text-xl">🥗</span>}
                  </label>

                  {/* Sleep Tracker */}
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Moon className="h-5 w-5 text-indigo-400" />
                      <span className="font-medium flex-1">Horas de sono</span>
                      <span className="text-lg font-bold text-indigo-400">
                        {sleepHours}h
                      </span>
                      {sleepHours >= 7 && <span className="text-xl">😴</span>}
                      {sleepHours < 6 && <span className="text-xl">😵</span>}
                      {sleepHours >= 6 && sleepHours < 7 && <span className="text-xl">😐</span>}
                    </div>
                    <Slider
                      value={[sleepHours]}
                      onValueChange={(value) => setSleepHours(value[0])}
                      min={0}
                      max={12}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>0h</span>
                      <span>6h</span>
                      <span>12h</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">
                    Anotações do dia
                  </label>
                  <Textarea
                    placeholder="Como foi seu dia? O que comeu? Como se sentiu?"
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <Button
                  onClick={saveEntry}
                  disabled={saving}
                  className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Salvando..." : hasEntryToday ? "Atualizar" : "Salvar"}
                </Button>
              </Card>

              {/* Recent Entries */}
              <div>
                <h3 className="font-semibold mb-3 text-muted-foreground">Últimas entradas</h3>
                {entries.length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Nenhuma entrada ainda</p>
                    <p className="text-sm text-muted-foreground">Comece registrando seu dia de hoje!</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {entries.slice(0, 5).map((entry) => {
                      const photos = (entry.photos as any) || {};
                      const isSelected = entry.entry_date === selectedDateStr;
                      return (
                        <Card
                          key={entry.id}
                          className={cn(
                            "p-3 cursor-pointer transition-all",
                            isSelected 
                              ? "ring-2 ring-primary bg-primary/5" 
                              : "hover:shadow-md hover:bg-muted/30"
                          )}
                          onClick={() => setSelectedDate(parseISO(entry.entry_date))}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg px-3 py-2 min-w-[50px]">
                              <span className="text-lg font-bold leading-none">
                                {format(parseISO(entry.entry_date), "d")}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase">
                                {format(parseISO(entry.entry_date), "MMM", { locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {entry.notes || "Sem anotações"}
                              </p>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {photos.completedWorkout && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Dumbbell className="h-3 w-3" /> Treino
                                  </span>
                                )}
                                {photos.completedMeal && (
                                  <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Apple className="h-3 w-3" /> Dieta
                                  </span>
                                )}
                                {photos.sleepHours != null && (
                                  <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Moon className="h-3 w-3" /> {photos.sleepHours}h
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Calendar Sidebar */}
            <div className="order-1 md:order-2">
              <Card className="p-4 sticky top-24">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold capitalize">
                    {format(calendarMonth, "MMMM yyyy", { locale: ptBR })}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Calendar */}
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  locale={ptBR}
                  className="w-full pointer-events-auto"
                  modifiers={{
                    hasEntry: (date) => entryDates.has(format(date, "yyyy-MM-dd")),
                    isSelected: (date) => isSameDay(date, selectedDate)
                  }}
                  modifiersStyles={{
                    hasEntry: {
                      backgroundColor: "hsl(var(--primary) / 0.15)",
                      fontWeight: "bold"
                    }
                  }}
                  disabled={(date) => date > new Date()}
                />

                {/* Month Stats */}
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Resumo de {format(calendarMonth, "MMMM", { locale: ptBR })}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <div className="text-lg font-bold">{monthStats.total}</div>
                      <div className="text-[10px] text-muted-foreground">Dias</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-primary/10">
                      <div className="text-lg font-bold text-primary">{monthStats.workoutDays}</div>
                      <div className="text-[10px] text-muted-foreground">Treinos</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-green-500/10">
                      <div className="text-lg font-bold text-green-600">{monthStats.mealDays}</div>
                      <div className="text-[10px] text-muted-foreground">Dieta</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-indigo-500/10">
                      <div className="text-lg font-bold text-indigo-400">{monthStats.avgSleep || "-"}h</div>
                      <div className="text-[10px] text-muted-foreground">Sono médio</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diario;