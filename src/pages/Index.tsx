import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dumbbell, TrendingUp, Apple, Target, CheckCircle2 } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);
  return <div className="min-h-screen bg-gradient-primary">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block bg-white/20 p-4 rounded-full mb-6 animate-pulse-glow">
            <Dumbbell className="h-16 w-16 text-white" />
          </div>
          <h1 className="md:text-6xl font-bold text-white mb-4 text-4xl">Secando em casa</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Transforme seu corpo e mente em apenas 30 dias com treinos personalizados, 
            planos alimentares e desafios diários.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate("/auth")} className="bg-white text-primary hover:bg-white/90 shadow-glow text-lg px-8">
              <TrendingUp className="mr-2 h-5 w-5" />
              Começar Jornada
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="border-white text-white hover:bg-white/10 text-lg px-8">
              Entrar
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white animate-scale-in">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Treinos Diários</h3>
            <p className="text-white/80">
              Rotinas de treino expertamente projetadas para todos os níveis, 
              com vídeos guiados completos.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white animate-scale-in" style={{
          animationDelay: "0.1s"
        }}>
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Apple className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Planos Alimentares</h3>
            <p className="text-white/80">
              Refeições nutritivas feitas sob medida para turbinar seus treinos 
              e apoiar sua transformação.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white animate-scale-in" style={{
          animationDelay: "0.2s"
        }}>
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Acompanhe o Progresso</h3>
            <p className="text-white/80">
              Monitore sua jornada com nosso diário alimentar e sistema de 
              acompanhamento para se manter motivado.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Como Funciona</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Cadastre-se e Defina Metas</h4>
                <p className="text-white/80">Crie sua conta e nos conte sobre seus objetivos fitness.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Siga os Planos Diários</h4>
                <p className="text-white/80">Cada dia inclui uma rotina de treino e plano alimentar projetado para seu sucesso.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Acompanhe e Complete</h4>
                <p className="text-white/80">Marque os dias como completos, registre suas refeições e veja seu progresso crescer!</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Transforme-se em 30 Dias</h4>
                <p className="text-white/80">Complete o desafio e celebre sua nova versão mais saudável!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;