import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, User as UserIcon, Save, RotateCcw, Scale, TrendingDown, 
  Calendar, Target, LogOut, Trophy, Flame, Moon, Dumbbell, Apple,
  Medal, Star, Zap, Award, Crown, Edit2, Camera, Loader2
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { format, differenceInDays, addDays, parseISO, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CircularProgress } from "@/components/CircularProgress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface Profile {
  display_name: string;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  created_at: string | null;
  goal: string | null;
  target_weight_kg: number | null;
  experience_level: string | null;
  available_days: number | null;
  dietary_restrictions: string[] | null;
  initial_weight_kg?: number | null;
  avatar_url?: string | null;
}

interface WeightLog {
  id: string;
  weight_kg: number;
  measured_at: string;
  created_at: string;
}

interface DiaryEntry {
  entry_date: string;
  photos: any;
}

interface Achievement {
  id: string;
  icon: any;
  title: string;
  description: string;
  unlocked: boolean;
  color: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    age: null,
    weight_kg: null,
    height_cm: null,
    created_at: null,
    goal: null,
    target_weight_kg: null,
    experience_level: null,
    available_days: null,
    dietary_restrictions: null,
    avatar_url: null,
  });
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [newWeight, setNewWeight] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [completedDays, setCompletedDays] = useState(0);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [tempGoal, setTempGoal] = useState({ goal: "", target_weight_kg: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Diary stats
  const diaryStats = useMemo(() => {
    if (diaryEntries.length === 0) return { streak: 0, avgSleep: null, workoutDays: 0, dietDays: 0 };
    
    // Calculate streak
    const sortedDates = diaryEntries
      .map(e => parseISO(e.entry_date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    let checkDate = new Date();
    const todayEntry = diaryEntries.find(e => e.entry_date === format(checkDate, "yyyy-MM-dd"));
    if (!todayEntry) checkDate = subDays(checkDate, 1);
    
    for (const date of sortedDates) {
      if (isSameDay(date, checkDate) || differenceInDays(checkDate, date) === 0) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else if (differenceInDays(checkDate, date) === 1) {
        streak++;
        checkDate = date;
      } else {
        break;
      }
    }

    // Sleep average
    const sleepEntries = diaryEntries.filter(e => (e.photos as any)?.sleepHours != null);
    const avgSleep = sleepEntries.length > 0 
      ? (sleepEntries.reduce((acc, e) => acc + ((e.photos as any)?.sleepHours || 0), 0) / sleepEntries.length).toFixed(1)
      : null;

    // Workout and diet days
    const workoutDays = diaryEntries.filter(e => (e.photos as any)?.completedWorkout).length;
    const dietDays = diaryEntries.filter(e => (e.photos as any)?.completedMeal).length;

    return { streak, avgSleep, workoutDays, dietDays };
  }, [diaryEntries]);

  // Achievements
  const achievements = useMemo<Achievement[]>(() => {
    const weightProgress = profile.initial_weight_kg && weightLogs.length > 0 
      ? profile.initial_weight_kg - weightLogs[0].weight_kg 
      : 0;

    return [
      { id: "first_day", icon: Star, title: "Primeiro Passo", description: "Completou o primeiro dia", unlocked: completedDays >= 1, color: "text-yellow-500" },
      { id: "week_1", icon: Zap, title: "Semana 1", description: "7 dias de desafio", unlocked: completedDays >= 7, color: "text-blue-500" },
      { id: "week_2", icon: Medal, title: "Semana 2", description: "14 dias de desafio", unlocked: completedDays >= 14, color: "text-purple-500" },
      { id: "week_3", icon: Award, title: "Semana 3", description: "21 dias de desafio", unlocked: completedDays >= 21, color: "text-orange-500" },
      { id: "champion", icon: Crown, title: "Campeão", description: "Completou os 30 dias!", unlocked: completedDays >= 30, color: "text-amber-500" },
      { id: "first_kg", icon: Scale, title: "Primeiro Kg", description: "Perdeu 1kg", unlocked: weightProgress >= 1, color: "text-green-500" },
      { id: "streak_7", icon: Flame, title: "Em Chamas", description: "7 dias de streak no diário", unlocked: diaryStats.streak >= 7, color: "text-red-500" },
      { id: "early_bird", icon: Moon, title: "Bom Dormidor", description: "Média de 7h+ de sono", unlocked: diaryStats.avgSleep !== null && parseFloat(diaryStats.avgSleep) >= 7, color: "text-indigo-500" },
    ];
  }, [completedDays, profile.initial_weight_kg, weightLogs, diaryStats]);

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadAllData(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const loadAllData = async (userId: string) => {
    setLoading(true);
    
    const [profileRes, logsRes, progressRes, diaryRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("weight_logs").select("*").eq("user_id", userId).order("measured_at", { ascending: false }),
      supabase.from("challenge_progress").select("day_num").eq("user_id", userId).eq("completed", true),
      supabase.from("food_diary").select("entry_date, photos").eq("user_id", userId)
    ]);

    if (profileRes.data) {
      setProfile({
        display_name: profileRes.data.display_name || "",
        age: profileRes.data.age,
        weight_kg: profileRes.data.weight_kg,
        height_cm: profileRes.data.height_cm,
        created_at: profileRes.data.created_at,
        goal: profileRes.data.goal,
        target_weight_kg: profileRes.data.target_weight_kg,
        experience_level: profileRes.data.experience_level,
        available_days: profileRes.data.available_days,
        dietary_restrictions: profileRes.data.dietary_restrictions,
        initial_weight_kg: profileRes.data.initial_weight_kg,
        avatar_url: profileRes.data.avatar_url,
      });
      setTempGoal({ 
        goal: profileRes.data.goal || "", 
        target_weight_kg: profileRes.data.target_weight_kg?.toString() || "" 
      });
    }
    if (logsRes.data) setWeightLogs(logsRes.data);
    if (progressRes.data) setCompletedDays(progressRes.data.length);
    if (diaryRes.data) setDiaryEntries(diaryRes.data);
    
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar perfil" });
    } else {
      toast({ title: "Sucesso!", description: "Perfil atualizado" });
    }
    setSaving(false);
  };

  const saveGoal = async () => {
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({ 
        goal: tempGoal.goal, 
        target_weight_kg: parseFloat(tempGoal.target_weight_kg) || null 
      })
      .eq("id", user.id);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar meta" });
    } else {
      toast({ title: "Meta atualizada!" });
      setProfile(prev => ({ 
        ...prev, 
        goal: tempGoal.goal, 
        target_weight_kg: parseFloat(tempGoal.target_weight_kg) || null 
      }));
      setEditGoalOpen(false);
    }
    setSaving(false);
  };

  const addWeightLog = async () => {
    if (!user || !newWeight) return;
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      toast({ variant: "destructive", title: "Erro", description: "Digite um peso válido" });
      return;
    }

    setSaving(true);
    
    const updateData: any = { weight_kg: weight };
    if (!profile.initial_weight_kg) updateData.initial_weight_kg = weight;
    
    await supabase.from("profiles").update(updateData).eq("id", user.id);
    
    const { error } = await supabase
      .from("weight_logs")
      .insert({ user_id: user.id, weight_kg: weight, measured_at: new Date().toISOString() });

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao registrar pesagem" });
    } else {
      toast({ title: "Pesagem Registrada!", description: `${weight}kg` });
      setNewWeight("");
      loadAllData(user.id);
    }
    setSaving(false);
  };

  const deleteWeightLog = async (logId: string) => {
    if (!user) return;
    const { error } = await supabase.from("weight_logs").delete().eq("id", logId);
    if (!error) {
      toast({ title: "Pesagem removida" });
      loadAllData(user.id);
    }
  };

  const resetChallenge = async () => {
    if (!user || !window.confirm("Tem certeza que deseja resetar todo o desafio?")) return;
    
    const { error } = await supabase.from("challenge_progress").delete().eq("user_id", user.id);
    if (!error) {
      toast({ title: "Desafio Resetado!" });
      setCompletedDays(0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione uma imagem válida" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Erro", description: "A imagem deve ter no máximo 2MB" });
      return;
    }

    setUploadingAvatar(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "Foto atualizada!", description: "Sua foto de perfil foi salva" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao enviar foto" });
      console.error(error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getWeightProgress = () => {
    if (!profile.initial_weight_kg || weightLogs.length === 0) return null;
    const diff = profile.initial_weight_kg - weightLogs[0].weight_kg;
    return { diff, percentage: ((diff / profile.initial_weight_kg) * 100).toFixed(1) };
  };

  const calculateBMI = () => {
    if (!profile.weight_kg || !profile.height_cm) return null;
    return (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Abaixo", color: "text-blue-500" };
    if (bmi < 25) return { label: "Normal", color: "text-green-500" };
    if (bmi < 30) return { label: "Sobrepeso", color: "text-yellow-500" };
    return { label: "Obesidade", color: "text-red-500" };
  };

  const goalLabels: Record<string, string> = {
    lose_weight: "Perder Peso", gain_muscle: "Ganhar Massa", 
    get_fit: "Ficar em Forma", maintain: "Manter Peso"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pt-20">
        <Navigation />
        <header className="bg-gradient-primary text-primary-foreground py-6 px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-4 bg-white/20" />
            <Skeleton className="h-10 w-48 bg-white/20" />
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[150px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-glow">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-primary-foreground hover:bg-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-white/20">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
          <div className="flex items-center gap-4">
            {/* Avatar with upload */}
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={uploadAvatar}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all cursor-pointer"
              >
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-10 w-10" />
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6" />
                  )}
                </div>
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.display_name || "Seu Perfil"}</h1>
              <p className="text-sm opacity-90">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{completedDays}</div>
            <div className="text-xs text-muted-foreground">Dias Completos</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-1">
              <Flame className="h-5 w-5" />{diaryStats.streak}
            </div>
            <div className="text-xs text-muted-foreground">Streak Diário</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-indigo-400">{diaryStats.avgSleep || "-"}h</div>
            <div className="text-xs text-muted-foreground">Média de Sono</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{unlockedAchievements.length}</div>
            <div className="text-xs text-muted-foreground">Conquistas</div>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" /> Conquistas
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={achievement.id} 
                  className={cn(
                    "flex flex-col items-center text-center p-3 rounded-xl transition-all",
                    achievement.unlocked 
                      ? "bg-gradient-to-b from-primary/10 to-transparent" 
                      : "opacity-40 grayscale"
                  )}
                  title={achievement.description}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                    achievement.unlocked ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Icon className={cn("h-6 w-6", achievement.unlocked ? achievement.color : "text-muted-foreground")} />
                  </div>
                  <span className="text-[10px] font-medium leading-tight">{achievement.title}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Progress + Goal Row */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Challenge Progress */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Progresso do Desafio
            </h3>
            <div className="flex items-center justify-center">
              <CircularProgress
                percentage={(completedDays / 30) * 100}
                size={140}
                strokeWidth={10}
                activeColor="#00ff88"
                backgroundColor="rgba(255,255,255,0.1)"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">{completedDays}/30</div>
                  <div className="text-xs text-muted-foreground">dias</div>
                </div>
              </CircularProgress>
            </div>
          </Card>

          {/* Goal Card */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Sua Meta
              </h3>
              <Dialog open={editGoalOpen} onOpenChange={setEditGoalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Meta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Objetivo</Label>
                      <Select value={tempGoal.goal} onValueChange={(v) => setTempGoal(p => ({ ...p, goal: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lose_weight">Perder Peso</SelectItem>
                          <SelectItem value="gain_muscle">Ganhar Massa</SelectItem>
                          <SelectItem value="get_fit">Ficar em Forma</SelectItem>
                          <SelectItem value="maintain">Manter Peso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Peso Meta (kg)</Label>
                      <Input 
                        type="number" 
                        value={tempGoal.target_weight_kg} 
                        onChange={(e) => setTempGoal(p => ({ ...p, target_weight_kg: e.target.value }))}
                        placeholder="65"
                      />
                    </div>
                    <Button onClick={saveGoal} disabled={saving} className="w-full bg-gradient-primary">
                      {saving ? "Salvando..." : "Salvar Meta"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Objetivo</span>
                <span className="font-semibold">{goalLabels[profile.goal || ""] || "Não definido"}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Peso Meta</span>
                <span className="font-semibold">{profile.target_weight_kg ? `${profile.target_weight_kg}kg` : "Não definido"}</span>
              </div>
              {getWeightProgress() && (
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-green-500" /> Progresso
                    </span>
                    <span className="font-bold text-green-500">
                      {getWeightProgress()!.diff > 0 ? '-' : '+'}{Math.abs(getWeightProgress()!.diff).toFixed(1)}kg
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Stats Row */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Estatísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {calculateBMI() && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{calculateBMI()}</div>
                <div className={`text-xs font-medium ${getBMICategory(parseFloat(calculateBMI()!)).color}`}>
                  IMC • {getBMICategory(parseFloat(calculateBMI()!)).label}
                </div>
              </div>
            )}
            {weightLogs.length > 0 && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{weightLogs[0].weight_kg}kg</div>
                <div className="text-xs text-muted-foreground">Peso Atual</div>
              </div>
            )}
            {profile.initial_weight_kg && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{profile.initial_weight_kg}kg</div>
                <div className="text-xs text-muted-foreground">Peso Inicial</div>
              </div>
            )}
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{diaryStats.workoutDays}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Dumbbell className="h-3 w-3" /> Treinos
              </div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{diaryStats.dietDays}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Apple className="h-3 w-3" /> Dieta
              </div>
            </div>
          </div>
        </Card>

        {/* Weight Registration */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" /> Registrar Peso
          </h3>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Ex: 70.5"
              className="flex-1"
            />
            <Button onClick={addWeightLog} disabled={saving || !newWeight} className="bg-gradient-primary">
              <Save className="mr-2 h-4 w-4" /> Registrar
            </Button>
          </div>
        </Card>

        {/* Weight Chart */}
        {weightLogs.length > 1 && (
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Evolução do Peso</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart 
                data={[...weightLogs].reverse().map(log => ({
                  data: format(new Date(log.measured_at), "dd/MM"),
                  peso: log.weight_kg
                }))}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="data" stroke="currentColor" style={{ fontSize: '12px' }} />
                <YAxis stroke="currentColor" style={{ fontSize: '12px' }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="peso" stroke="#00ff88" strokeWidth={3} dot={{ fill: '#00ff88', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Personal Info */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Informações Pessoais</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} placeholder="Seu nome" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Idade</Label>
                <Input type="number" value={profile.age || ""} onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || null })} placeholder="25" />
              </div>
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input type="number" step="0.1" value={profile.weight_kg || ""} onChange={(e) => setProfile({ ...profile, weight_kg: parseFloat(e.target.value) || null })} placeholder="70" />
              </div>
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input type="number" value={profile.height_cm || ""} onChange={(e) => setProfile({ ...profile, height_cm: parseInt(e.target.value) || null })} placeholder="170" />
              </div>
            </div>
            <Button onClick={saveProfile} disabled={saving} className="w-full bg-gradient-primary">
              <Save className="mr-2 h-4 w-4" /> {saving ? "Salvando..." : "Salvar Perfil"}
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-5 border-destructive/30">
          <h3 className="font-semibold mb-2 text-destructive">Zona de Perigo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Resetar o desafio irá apagar todo o seu progresso. Esta ação não pode ser desfeita.
          </p>
          <Button onClick={resetChallenge} variant="destructive" className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" /> Resetar Desafio
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Profile;