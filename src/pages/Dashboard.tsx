import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Dumbbell, BookOpen, CheckCircle2, Circle, Sparkles, Users, Moon, Sun, Gift, TrendingUp, Camera, RefreshCw, ShoppingBag, ChefHat } from "lucide-react";
import { useTheme } from "next-themes";
import DaySelector from "@/components/DaySelector";
import WorkoutCard from "@/components/WorkoutCard";
import MealPlanCard from "@/components/MealPlanCard";
import { Navigation } from "@/components/Navigation";
import TipsTabs from "@/components/TipsTabs";
import { HydrationCard } from "@/components/HydrationCard";
import { BannerCarousel } from "@/components/BannerCarousel";
import { CircularProgress } from "@/components/CircularProgress";
import FoodPhotoAnalyzer from "@/components/FoodPhotoAnalyzer";
import FoodSubstitutionDialog from "@/components/FoodSubstitutionDialog";
import AppTour from "@/components/AppTour";
const motivationalPhrases = ["Você está mais forte do que pensa! 💪", "Cada dia é uma nova chance de evoluir! 🌟", "Seu corpo pode fazer muito mais do que você imagina!", "A disciplina de hoje é o corpo dos seus sonhos amanhã!", "Não desista, você está fazendo incrível! 🔥", "Transformação começa com um passo de cada vez!", "Você merece a melhor versão de si mesmo! ⭐", "Persistência é a chave do sucesso! 🎯"];
interface Profile {
  goal?: string;
  target_weight_kg?: number;
  weight_kg?: number;
  experience_level?: string;
  display_name?: string;
  initial_weight_kg?: number;
  tour_completed?: boolean;
}
interface WeightProgress {
  peso_inicial: number;
  peso_atual: number;
  peso_meta: number;
  peso_perdido: number;
  progresso_percent: number;
  mensagem: string;
}
const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [motivationalPhrase] = useState(() => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]);
  const [weightProgress, setWeightProgress] = useState<WeightProgress | null>(null);
  const [showPhotoAnalyzer, setShowPhotoAnalyzer] = useState(false);
  const [showSubstitutionDialog, setShowSubstitutionDialog] = useState(false);
  const [runTour, setRunTour] = useState(false);
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
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if onboarding is completed
        const {
          data: profile
        } = await supabase.from("profiles").select("onboarding_completed").eq("id", session.user.id).single();
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
        const {
          data: profile
        } = await supabase.from("profiles").select("onboarding_completed").eq("id", session.user.id).single();
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

    // Load profile data including tour_completed
    const {
      data: profileData
    } = await (supabase as any).from("profiles").select("goal, target_weight_kg, weight_kg, experience_level, display_name, initial_weight_kg, tour_completed").eq("id", userId).single();

    // Load weight logs to get current weight from latest log
    const {
      data: weightLogs
    } = await (supabase as any).from("weight_logs").select("weight_kg, measured_at").eq("user_id", userId).order("measured_at", {
      ascending: false
    }).limit(1);
    if (profileData) {
      setProfile(profileData);
      
      // Start tour if not completed
      if (!profileData.tour_completed) {
        setTimeout(() => setRunTour(true), 1000);
      }

      // Initial weight: use initial_weight_kg (saved only once)
      const inicial = Number(profileData.initial_weight_kg || 0);

      // Current weight: get from latest weight_log if available, otherwise from profile
      const atual = weightLogs && weightLogs.length > 0 ? Number(weightLogs[0].weight_kg) : Number(profileData.weight_kg || inicial);
      const meta = Number(profileData.target_weight_kg || 0);

      // If no initial weight but has current weight, set initial weight
      if (!inicial && atual > 0) {
        await supabase.from("profiles").update({
          initial_weight_kg: atual
        }).eq("id", userId);
      }
      const pesoPerdido = inicial - atual;
      const totalParaPerder = inicial - meta;
      let mensagem = "";
      if (pesoPerdido > 0) {
        const percentAtingido = totalParaPerder > 0 ? (pesoPerdido / totalParaPerder * 100).toFixed(0) : 0;
        mensagem = `Você já perdeu ${pesoPerdido.toFixed(1)}kg (${percentAtingido}% do objetivo de ${inicial}kg → ${meta}kg)`;
      } else if (pesoPerdido === 0) {
        mensagem = "Ainda não há perda registrada. Continue firme no seu objetivo!";
      } else {
        mensagem = `Você ganhou ${Math.abs(pesoPerdido).toFixed(1)}kg desde o início. Continue focado!`;
      }
      const progresso_percent = totalParaPerder <= 0 ? 100 : Math.max(0, Math.min(100, pesoPerdido / totalParaPerder * 100));
      if (inicial > 0 || atual > 0) {
        setWeightProgress({
          peso_inicial: inicial || atual,
          peso_atual: atual,
          peso_meta: meta,
          peso_perdido: pesoPerdido,
          progresso_percent,
          mensagem
        });
      }
    }
  };
  
  const handleTourComplete = async () => {
    setRunTour(false);
    if (user) {
      await supabase.from("profiles").update({ tour_completed: true }).eq("id", user.id);
      toast({
        title: "Tour concluído! 🎉",
        description: "Agora você conhece todas as funcionalidades. Bom desafio!"
      });
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
  return <div className="min-h-screen bg-gradient-surface pb-24 md:pt-20">
      <Navigation />
      {/* App Tour */}
      <AppTour run={runTour} onComplete={handleTourComplete} />
      
      {/* Header */}
      <header data-tour="header" className="relative overflow-hidden" style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)',
        paddingBottom: '24px',
        minHeight: '140px',
      }}>
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-hero" />
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-xl text-white drop-shadow-sm">
              {(() => {
                const hour = new Date().getHours();
                const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
                const userName = profile?.display_name || 'Atleta';
                return `${greeting}, ${userName}!`;
              })()}
            </h1>
            <p className="text-sm text-white/90">
              Dia {completedDays.length > 0 ? Math.max(...completedDays) : selectedDay} do desafio. Continue firme! 💪
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                🔥 Desafio de 30 Dias
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="text-white hover:bg-white/20 rounded-xl" title="Progresso Detalhado">
              <TrendingUp className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-white hover:bg-white/20 rounded-xl">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-white/20 rounded-xl">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-surface" style={{ borderRadius: '100% 100% 0 0' }} />
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Weight Progress */}
        {weightProgress && <Card data-tour="weight-progress" className="p-5 sm:p-6 mb-6 shadow-elevated border-0 overflow-hidden relative" style={{
        background: 'linear-gradient(135deg, hsl(20, 30%, 12%) 0%, hsl(20, 25%, 8%) 100%)'
      }}>
            {/* Decorative glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            
            <div className="relative flex flex-row items-center gap-4 sm:gap-6">
              {/* Circular Progress */}
              <div className="flex-shrink-0">
                <CircularProgress percentage={weightProgress.progresso_percent} size={window.innerWidth < 640 ? 110 : 130} strokeWidth={window.innerWidth < 640 ? 10 : 12} activeColor="hsl(25, 95%, 55%)" backgroundColor="rgba(255,255,255,0.08)">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-white">
                      {weightProgress.peso_atual.toFixed(1)}kg
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 font-medium">Peso Atual</p>
                  </div>
                </CircularProgress>
              </div>
              
              {/* Progress Message */}
              <div className="flex-1 text-left">
                <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium">
                  {weightProgress.mensagem}
                </p>
              </div>
            </div>
          </Card>}

        {/* Progress Overview */}
        <Card data-tour="challenge-progress" className="p-6 mb-8 shadow-card border-0 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Seu Progresso</h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gradient">
                {completedDays.length}/30
              </span>
              <Button variant="ghost" size="sm" onClick={resetChallenge} className="text-xs text-muted-foreground hover:text-destructive">
                Resetar
              </Button>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2.5" />
          <p className="text-sm text-muted-foreground mt-3">
            {30 - completedDays.length > 0 
              ? `${30 - completedDays.length} dias restantes para completar o desafio!`
              : "🎉 Parabéns! Você completou o desafio!"}
          </p>
        </Card>

        {/* Tips and Guidelines */}
        <div data-tour="tips">
          <TipsTabs />
        </div>

        {/* Daily Progress Card */}
        <div data-tour="hydration" className="mb-8">
          <HydrationCard />
        </div>

        {/* Day Selector */}
        <div data-tour="day-selector">
          <DaySelector selectedDay={selectedDay} completedDays={completedDays} onDaySelect={setSelectedDay} />
        </div>

        {/* Day Content */}
        <div data-tour="daily-content" className="mb-6 flex items-center justify-between">
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

        {/* Quick Actions - Premium Section */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ferramentas Exclusivas
          </h2>
          
          {/* AI Tools - Featured */}
          <div data-tour="ai-tools" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card 
              className="group p-5 cursor-pointer border-0 shadow-card bg-gradient-to-br from-primary/15 via-card to-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => navigate("/receitas-ia")}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-gradient-primary text-white shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <ChefHat className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    Receitas com IA
                    <span className="text-[10px] bg-gradient-primary text-white px-2 py-0.5 rounded-full animate-pulse-soft">NOVO</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Receitas personalizadas com seus ingredientes</p>
                </div>
              </div>
            </Card>
            
            <Card 
              className="group p-5 cursor-pointer border-0 shadow-card bg-gradient-to-br from-secondary/15 via-card to-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => setShowPhotoAnalyzer(true)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-gradient-secondary text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Análise Nutricional</h3>
                  <p className="text-xs text-muted-foreground">Escaneie seu prato e saiba os nutrientes</p>
                </div>
              </div>
            </Card>
            
            <Card 
              className="group p-5 cursor-pointer border-0 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => setShowSubstitutionDialog(true)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors duration-300">
                  <RefreshCw className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Substituir Alimentos</h3>
                  <p className="text-xs text-muted-foreground">Encontre alternativas saudáveis</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary Actions */}
          <div data-tour="quick-actions" className="grid grid-cols-4 gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              className="h-20 sm:h-24 flex-col gap-2 bg-card shadow-subtle hover:shadow-card hover:bg-primary/5 rounded-2xl border-0 transition-all duration-300" 
              onClick={() => navigate("/bonus")}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium">Bônus</span>
            </Button>
            <Button 
              variant="ghost" 
              className="h-20 sm:h-24 flex-col gap-2 bg-card shadow-subtle hover:shadow-card hover:bg-secondary/5 rounded-2xl border-0 transition-all duration-300" 
              onClick={() => navigate("/comunidade")}
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <span className="text-xs font-medium">Comunidade</span>
            </Button>
            <Button 
              variant="ghost" 
              className="h-20 sm:h-24 flex-col gap-2 bg-card shadow-subtle hover:shadow-card hover:bg-primary/5 rounded-2xl border-0 transition-all duration-300" 
              onClick={() => navigate("/diario")}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium">Diário</span>
            </Button>
            <Button 
              variant="ghost" 
              className="h-20 sm:h-24 flex-col gap-2 bg-card shadow-subtle hover:shadow-card hover:bg-secondary/5 rounded-2xl border-0 transition-all duration-300" 
              onClick={() => navigate("/loja")}
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-secondary" />
              </div>
              <span className="text-xs font-medium">Loja</span>
            </Button>
          </div>
        </section>
      </div>

      <FoodPhotoAnalyzer open={showPhotoAnalyzer} onOpenChange={setShowPhotoAnalyzer} />
      <FoodSubstitutionDialog open={showSubstitutionDialog} onOpenChange={setShowSubstitutionDialog} meals={[]} />
    </div>;
};
export default Dashboard;