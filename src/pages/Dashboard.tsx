import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Dumbbell, BookOpen, User as UserIcon, CheckCircle2, Circle, Sparkles, Users, Moon, Sun, Gift, Target, TrendingUp, Activity } from "lucide-react";
import { useTheme } from "next-themes";
import DaySelector from "@/components/DaySelector";
import WorkoutCard from "@/components/WorkoutCard";
import MealPlanCard from "@/components/MealPlanCard";
import { Navigation } from "@/components/Navigation";
import TipsTabs from "@/components/TipsTabs";
import { HydrationCard } from "@/components/HydrationCard";
const motivationalPhrases = ["Você está mais forte do que pensa! 💪", "Cada dia é uma nova chance de evoluir! 🌟", "Seu corpo pode fazer muito mais do que você imagina!", "A disciplina de hoje é o corpo dos seus sonhos amanhã!", "Não desista, você está fazendo incrível! 🔥", "Transformação começa com um passo de cada vez!", "Você merece a melhor versão de si mesmo! ⭐", "Persistência é a chave do sucesso! 🎯"];
interface Profile {
  goal?: string;
  target_weight_kg?: number;
  weight_kg?: number;
  experience_level?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [motivationalPhrase] = useState(() => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    theme,
    setTheme
  } = useTheme();
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();
        
        if (!profile?.onboarding_completed) {
          navigate("/onboarding");
          return;
        }
        
        setUser(session.user);
        loadProgress(session.user.id);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    };

    checkAuth();

    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();
        
        if (!profile?.onboarding_completed) {
          navigate("/onboarding");
          return;
        }
        
        setUser(session.user);
        loadProgress(session.user.id);
      } else {
        navigate("/auth");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const loadProgress = async (userId: string) => {
    const {
      data,
      error
    } = await (supabase as any).from("challenge_progress").select("day_num").eq("user_id", userId).eq("completed", true);
    if (!error && data) {
      setCompletedDays(data.map(d => d.day_num));
    }
    
    // Load profile data
    const { data: profileData } = await supabase
      .from("profiles")
      .select("goal, target_weight_kg, weight_kg, experience_level")
      .eq("id", userId)
      .single();
    
    if (profileData) {
      setProfile(profileData);
    }
  };
  const toggleDayComplete = async () => {
    if (!user) return;
    const isCompleted = completedDays.includes(selectedDay);
    if (isCompleted) {
      const {
        error
      } = await (supabase as any).from("challenge_progress").delete().eq("user_id", user.id).eq("day_num", selectedDay);
      if (error) {
        console.error("Error deleting progress:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao atualizar progresso"
        });
        return;
      }
      setCompletedDays(prev => prev.filter(d => d !== selectedDay));
      toast({
        title: "Dia desmarcado",
        description: `Dia ${selectedDay} marcado como incompleto`
      });
    } else {
      const {
        error
      } = await (supabase as any).from("challenge_progress").upsert({
        user_id: user.id,
        day_num: selectedDay,
        completed: true,
        completed_at: new Date().toISOString()
      }, {
        onConflict: "user_id,day_num"
      });
      if (error) {
        console.error("Error upserting progress:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao atualizar progresso"
        });
        return;
      }
      setCompletedDays(prev => [...prev, selectedDay]);
      toast({
        title: "Ótimo trabalho!",
        description: `Dia ${selectedDay} concluído! Continue assim!`
      });
    }
  };
  const resetChallenge = async () => {
    if (!user) return;
    const {
      error
    } = await (supabase as any).from("challenge_progress").delete().eq("user_id", user.id);
    if (error) {
      console.error("Error resetting challenge:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao resetar desafio"
      });
      return;
    }
    setCompletedDays([]);
    toast({
      title: "Desafio Resetado",
      description: "Seu progresso foi resetado com sucesso!"
    });
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Dumbbell className="h-12 w-12 text-white" />
        </div>
      </div>;
  }
  const progressPercentage = completedDays.length / 30 * 100;
  const isDayCompleted = completedDays.includes(selectedDay);
  
  const getGoalLabel = (goal?: string) => {
    const goals: Record<string, string> = {
      lose_weight: "Perder Peso",
      gain_muscle: "Ganhar Massa",
      get_fit: "Ficar em Forma",
      maintain: "Manter Peso"
    };
    return goal ? goals[goal] : "";
  };
  
  const getLevelLabel = (level?: string) => {
    const levels: Record<string, string> = {
      beginner: "Iniciante",
      intermediate: "Intermediário",
      advanced: "Avançado"
    };
    return level ? levels[level] : "";
  };
  return <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-glow">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-sm">Secando em casa</h1>
              <p className="opacity-90 text-xs">{completedDays.length} de 30 dias concluídos</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-primary-foreground hover:bg-white/20">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="text-primary-foreground hover:bg-white/20">
              <UserIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground hover:bg-white/20">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Personalized Welcome */}
        {profile && (profile.goal || profile.target_weight_kg) && (
          <Card className="p-6 mb-6 bg-gradient-card shadow-card">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Seu Programa Personalizado
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profile.goal && (
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Objetivo</p>
                    <p className="font-medium">{getGoalLabel(profile.goal)}</p>
                  </div>
                </div>
              )}
              {profile.target_weight_kg && profile.weight_kg && (
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Meta de Peso</p>
                    <p className="font-medium">
                      {profile.weight_kg}kg → {profile.target_weight_kg}kg
                    </p>
                  </div>
                </div>
              )}
              {profile.experience_level && (
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nível</p>
                    <p className="font-medium">{getLevelLabel(profile.experience_level)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Motivational Phrase */}
        <Card className="p-4 mb-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 animate-pulse-glow" />
            <p className="text-base font-medium">{motivationalPhrase}</p>
          </div>
        </Card>

        {/* Progress Overview */}
        <Card className="p-6 mb-8 bg-gradient-card shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Seu Progresso</h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {completedDays.length}/30
              </span>
              <Button variant="outline" size="sm" onClick={resetChallenge} className="text-xs">
                Resetar
              </Button>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {30 - completedDays.length} dias restantes para completar o desafio!
          </p>
        </Card>

        {/* Tips and Guidelines */}
        <TipsTabs />

        {/* Daily Progress Card */}
        <div className="mb-8">
          <HydrationCard />
        </div>

        {/* Day Selector */}
        <DaySelector selectedDay={selectedDay} completedDays={completedDays} onDaySelect={setSelectedDay} />

        {/* Day Content */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dia {selectedDay}</h2>
          <Button onClick={toggleDayComplete} variant={isDayCompleted ? "outline" : "default"} className={isDayCompleted ? "" : "bg-gradient-primary hover:opacity-90 shadow-glow"}>
            {isDayCompleted ? <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Concluído
              </> : <>
                <Circle className="mr-2 h-4 w-4" />
                Marcar Completo
              </>}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <MealPlanCard dayNum={selectedDay} />
          <WorkoutCard dayNum={selectedDay} />
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2 hover:shadow-glow transition-all" onClick={() => navigate("/comunidade")}>
            <Users className="h-6 w-6" />
            Comunidade
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 hover:shadow-glow transition-all" onClick={() => navigate("/diario")}>
            <BookOpen className="h-6 w-6" />
            Diário Alimentar
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 hover:shadow-glow transition-all" onClick={() => navigate("/bonus")}>
            <Gift className="h-6 w-6" />
            Conteúdo Bônus
          </Button>
        </div>
      </div>
    </div>;
};
export default Dashboard;