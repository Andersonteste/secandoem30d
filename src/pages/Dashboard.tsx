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
import { BannerCarousel } from "@/components/BannerCarousel";
import { CircularProgress } from "@/components/CircularProgress";
const motivationalPhrases = ["Você está mais forte do que pensa! 💪", "Cada dia é uma nova chance de evoluir! 🌟", "Seu corpo pode fazer muito mais do que você imagina!", "A disciplina de hoje é o corpo dos seus sonhos amanhã!", "Não desista, você está fazendo incrível! 🔥", "Transformação começa com um passo de cada vez!", "Você merece a melhor versão de si mesmo! ⭐", "Persistência é a chave do sucesso! 🎯"];
interface Profile {
  goal?: string;
  target_weight_kg?: number;
  weight_kg?: number;
  experience_level?: string;
  display_name?: string;
}

interface WeightProgress {
  peso_inicial: number;
  peso_atual: number;
  peso_meta: number;
  peso_perdido: number;
  progresso_percent: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [motivationalPhrase] = useState(() => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]);
  const [weightProgress, setWeightProgress] = useState<WeightProgress | null>(null);
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
      .select("goal, target_weight_kg, weight_kg, experience_level, display_name")
      .eq("id", userId)
      .single();
    
    if (profileData) {
      setProfile(profileData);
      
      // Load weight progress - get first weight log for initial weight
      const { data: firstWeightLog } = await supabase
        .from("weight_logs")
        .select("weight_kg")
        .eq("user_id", userId)
        .order("measured_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      
      // Initial weight: first log or profile weight
      const peso_inicial = firstWeightLog 
        ? Number(firstWeightLog.weight_kg) 
        : Number(profileData.weight_kg || 0);
      
      // Current weight: profile weight (updated regularly)
      const peso_atual = Number(profileData.weight_kg || peso_inicial);
      const peso_meta = Number(profileData.target_weight_kg || 0);
      
      if (peso_meta > 0 && peso_inicial > 0) {
        const peso_perdido = peso_inicial - peso_atual;
        const total_para_perder = peso_inicial - peso_meta;
        const progresso_percent = total_para_perder <= 0 
          ? 100 
          : Math.max(0, Math.min(100, (peso_perdido / total_para_perder) * 100));
        
        setWeightProgress({
          peso_inicial,
          peso_atual,
          peso_meta,
          peso_perdido,
          progresso_percent
        });
      }
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
      <header 
        className="text-white px-4 shadow-glow relative"
        style={{
          height: '140px',
          background: 'linear-gradient(90deg, #ff8a00, #00ff88)',
          borderRadius: '0 0 18px 18px'
        }}
      >
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-[18px] text-white">
              {(() => {
                const hour = new Date().getHours();
                const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
                const userName = profile?.display_name || 'Atleta';
                return `${greeting}, ${userName}!`;
              })()}
            </h1>
            <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Você está no dia {completedDays.length > 0 ? Math.max(...completedDays) : selectedDay} do desafio. Continue firme! 💪
            </p>
            <p className="text-[13px]" style={{ color: '#ddd' }}>Desafio de 30 Dias</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/profile")} 
              className="text-white hover:bg-white/20"
              title="Progresso Detalhado"
            >
              <TrendingUp className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-white hover:bg-white/20">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-white/20">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Personalized Welcome with Weight Progress */}
        {profile && (profile.goal || profile.target_weight_kg || weightProgress) && (
          <Card className="p-6 mb-6 bg-gradient-card shadow-glow border-primary/20">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {/* Coluna 1: Peso e Progresso */}
              {weightProgress && (
                <div className="flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-6 flex flex-col items-center justify-center border border-primary/10 shadow-lg">
                  <CircularProgress
                    percentage={weightProgress.progresso_percent}
                    size={120}
                    strokeWidth={12}
                    activeColor="#00ff88"
                    backgroundColor="rgba(255,255,255,0.08)"
                  >
                    <div className="text-center">
                      <p className="text-[24px] font-bold text-foreground drop-shadow-glow">
                        {weightProgress.peso_atual.toFixed(1)}kg
                      </p>
                      <p className="text-[12px] text-muted-foreground font-medium">Peso Atual</p>
                    </div>
                  </CircularProgress>
                  
                  <div className="text-center mt-4 px-2">
                    {weightProgress.peso_perdido > 0 ? (
                      <p className="text-[13px] text-foreground leading-relaxed">
                        Você já perdeu <span className="font-bold text-primary drop-shadow-glow">
                          {weightProgress.peso_perdido.toFixed(1)}kg
                        </span> do seu objetivo de <span className="font-semibold">{weightProgress.peso_inicial.toFixed(1)}kg → {weightProgress.peso_meta.toFixed(1)}kg!</span>
                      </p>
                    ) : weightProgress.peso_perdido === 0 ? (
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        Ainda não há perda registrada. Continue firme no seu objetivo!
                      </p>
                    ) : (
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        Você ganhou {Math.abs(weightProgress.peso_perdido).toFixed(1)}kg desde o início. Foque novamente!
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Coluna 2: Programa Personalizado */}
              <div className="flex-1 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-xl p-6 border border-primary/10 shadow-lg">
                <h3 className="text-[17px] font-bold mb-4 flex items-center gap-2 text-foreground">
                  <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Seu Programa Personalizado
                </h3>
                <div className="flex flex-col gap-4">
                  {profile.goal && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-all">
                      <div className="bg-gradient-primary p-2.5 rounded-full shadow-md">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Objetivo</p>
                        <p className="font-semibold text-[14px] text-foreground">{getGoalLabel(profile.goal)}</p>
                      </div>
                    </div>
                  )}
                  {profile.target_weight_kg && profile.weight_kg && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-all">
                      <div className="bg-gradient-primary p-2.5 rounded-full shadow-md">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Meta de Peso</p>
                        <p className="font-semibold text-[14px] text-foreground">
                          {profile.weight_kg}kg → {profile.target_weight_kg}kg
                        </p>
                      </div>
                    </div>
                  )}
                  {profile.experience_level && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-all">
                      <div className="bg-gradient-primary p-2.5 rounded-full shadow-md">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Nível</p>
                        <p className="font-semibold text-[14px] text-foreground">{getLevelLabel(profile.experience_level)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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