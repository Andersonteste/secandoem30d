import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Dumbbell, BookOpen, User as UserIcon, CheckCircle2, Circle, Sparkles, Users, Moon, Sun, Gift, Target, TrendingUp, Activity, Camera, RefreshCw, ShoppingBag } from "lucide-react";
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
const motivationalPhrases = ["Você está mais forte do que pensa! 💪", "Cada dia é uma nova chance de evoluir! 🌟", "Seu corpo pode fazer muito mais do que você imagina!", "A disciplina de hoje é o corpo dos seus sonhos amanhã!", "Não desista, você está fazendo incrível! 🔥", "Transformação começa com um passo de cada vez!", "Você merece a melhor versão de si mesmo! ⭐", "Persistência é a chave do sucesso! 🎯"];
interface Profile {
  goal?: string;
  target_weight_kg?: number;
  weight_kg?: number;
  experience_level?: string;
  display_name?: string;
  initial_weight_kg?: number;
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

    // Load profile data
    const {
      data: profileData
    } = await supabase.from("profiles").select("goal, target_weight_kg, weight_kg, experience_level, display_name, initial_weight_kg").eq("id", userId).single();

    // Load weight logs to get current weight from latest log
    const {
      data: weightLogs
    } = await (supabase as any).from("weight_logs").select("weight_kg, measured_at").eq("user_id", userId).order("measured_at", {
      ascending: false
    }).limit(1);
    if (profileData) {
      setProfile(profileData);

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
      <header className="text-white px-4 shadow-glow relative" style={{
      paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)',
      paddingBottom: '10px',
      minHeight: '120px',
      background: 'linear-gradient(90deg, #ff8a00, #00ff88)',
      borderRadius: '0 0 18px 18px'
    }}>
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
          <div className="flex flex-col gap-1 relative z-10">
            <h1 className="font-bold text-[18px] text-white m-0 relative z-10">
              {(() => {
              const hour = new Date().getHours();
              const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
              const userName = profile?.display_name || 'Atleta';
              return `${greeting}, ${userName}!`;
            })()}
            </h1>
            <p className="text-[14px] m-0 relative z-10" style={{
            color: 'rgba(255,255,255,0.85)'
          }}>
              Você está no dia {completedDays.length > 0 ? Math.max(...completedDays) : selectedDay} do desafio. Continue firme! 💪
            </p>
            <p className="text-[13px] m-0 relative z-10" style={{
            color: '#ddd'
          }}>Desafio de 30 Dias</p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="text-white hover:bg-white/20" title="Progresso Detalhado">
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

        {/* Weight Progress */}
        {weightProgress && <Card className="p-4 sm:p-6 mb-6 shadow-glow border-primary/20" style={{
        background: 'linear-gradient(135deg, #2a1810 0%, #1a0f0a 100%)'
      }}>
            <div className="flex flex-row items-center gap-4 sm:gap-6">
              {/* Circular Progress */}
              <div className="flex-shrink-0">
                <CircularProgress percentage={weightProgress.progresso_percent} size={window.innerWidth < 640 ? 110 : 140} strokeWidth={window.innerWidth < 640 ? 12 : 14} activeColor="#ff8a00" backgroundColor="rgba(255,255,255,0.1)">
                  <div className="text-center">
                    <p className="sm:text-[28px] font-bold text-white drop-shadow-glow text-base">
                      {weightProgress.peso_atual.toFixed(1)}kg
                    </p>
                    <p className="text-[11px] sm:text-[13px] text-white/70 font-medium">Peso Atual</p>
                  </div>
                </CircularProgress>
              </div>
              
              {/* Progress Message */}
              <div className="flex-1 text-left">
                <p className="sm:text-[20px] text-white leading-relaxed font-medium text-xs">
                  {weightProgress.mensagem}
                </p>
              </div>
            </div>
          </Card>}

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

        {/* AI Recipe Chat - Featured */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate("/receitas-ia")}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                Chat de Receitas com IA
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-normal">NOVO</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Digite os ingredientes que você tem em casa e receba receitas fitness personalizadas criadas por IA especialmente para você!
              </p>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Sparkles className="mr-2 h-4 w-4" />
                Criar Receitas Agora
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2 hover:shadow-glow transition-all" onClick={() => navigate("/loja")}>
            <ShoppingBag className="h-6 w-6" />
            Loja
          </Button>
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
          <Button variant="outline" className="h-20 flex-col gap-2 hover:shadow-glow transition-all" onClick={() => setShowPhotoAnalyzer(true)}>
            <Camera className="h-6 w-6" />
            Análise Nutricional
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 hover:shadow-glow transition-all" onClick={() => setShowSubstitutionDialog(true)}>
            <RefreshCw className="h-6 w-6" />
            Substituição de Alimentos
          </Button>
        </div>
      </div>

      <FoodPhotoAnalyzer open={showPhotoAnalyzer} onOpenChange={setShowPhotoAnalyzer} />
      <FoodSubstitutionDialog open={showSubstitutionDialog} onOpenChange={setShowSubstitutionDialog} meals={[]} />
    </div>;
};
export default Dashboard;