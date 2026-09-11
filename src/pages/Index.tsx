import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Apple, Target, CheckCircle2, Camera, Sparkles, Droplets, BookOpen, Gift, Users, ChefHat, Flame } from "lucide-react";
import logoImage from "@/assets/logo-desafio.png";
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
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8 animate-fade-in">
            <img src={logoImage} alt="Secando em Casa" className="w-96 h-auto mx-auto mb-8" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Sua Transformação Começa Aqui
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Desafio completo de 30 dias com treinos, nutrição inteligente, 
              análise de alimentos por IA e suporte comunitário
            </p>
            <div className="flex gap-4 justify-center flex-col sm:flex-row items-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-glow text-lg px-8 h-14 w-full sm:w-auto">
                <TrendingUp className="mr-2 h-5 w-5" />
                Começar Agora
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 h-14 w-full sm:w-auto">
                Já Tenho Conta
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Tudo que Você Precisa em Um Só Lugar
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Uma plataforma completa com tecnologia de ponta para garantir sua transformação
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground">
                  <Flame className="h-6 w-6" />
                </div>
                <CardTitle>Treinos Diários em Vídeo</CardTitle>
                <CardDescription>
                  30 dias de treinos progressivos com vídeos completos do YouTube, 
                  adaptados para treinar em casa
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground">
                  <ChefHat className="h-6 w-6" />
                </div>
                <CardTitle>Cardápios Completos</CardTitle>
                <CardDescription>
                  Planos alimentares completos para cada dia, com receitas detalhadas 
                  e lista de tipos de vegetais
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground">
                  <Camera className="h-6 w-6" />
                </div>
                <CardTitle>Análise por IA</CardTitle>
                <CardDescription>
                  Tire foto dos seus alimentos e receba análise nutricional instantânea 
                  com calorias, proteínas e macros
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle>Substituições Inteligentes</CardTitle>
                <CardDescription>
                  IA sugere alternativas saudáveis para os alimentos do seu cardápio, 
                  respeitando suas preferências
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground">
                  <Droplets className="h-6 w-6" />
                </div>
                <CardTitle>Controle de Hidratação</CardTitle>
                <CardDescription>
                  Acompanhe sua ingestão diária de água com metas personalizadas 
                  e lembretes inteligentes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle>Diário Alimentar</CardTitle>
                <CardDescription>
                  Registre todas suas refeições, veja histórico completo e 
                  acompanhe sua evolução nutricional
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle>Acompanhamento de Progresso</CardTitle>
                <CardDescription>
                  Sistema visual de progresso dos 30 dias, marque dias completos e 
                  veja sua evolução em tempo real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground">
                  <Gift className="h-6 w-6" />
                </div>
                <CardTitle>Conteúdo Bônus</CardTitle>
                <CardDescription>
                  Receitas extras, guias de jejum intermitente e dicas exclusivas 
                  para potencializar resultados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Comunidade Ativa</CardTitle>
                <CardDescription>
                  Conecte-se com outros participantes, compartilhe experiências e 
                  mantenha-se motivado junto
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* How it Works */}
        <Card className="p-8 mb-16 bg-gradient-card shadow-card">
          <h2 className="text-3xl font-bold mb-8 text-center">Como Funciona</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                1
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Crie Sua Conta </h4>
                <p className="text-muted-foreground">
                  Cadastre-se em segundos e tenha acesso imediato a todo o conteúdo do desafio
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-gradient-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                2
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Escolha Seu Dia</h4>
                <p className="text-muted-foreground">
                  Navegue pelos 30 dias e acesse treinos em vídeo e cardápios completos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-gradient-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                3
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Treine e Registre</h4>
                <p className="text-muted-foreground">
                  Execute os treinos, fotografe suas refeições e use a IA para análise nutricional
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-gradient-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                4
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Acompanhe Resultados</h4>
                <p className="text-muted-foreground">
                  Marque dias completos, monitore hidratação e veja seu progresso crescer
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-primary rounded-3xl p-12 text-center text-primary-foreground shadow-glow">
          <Sparkles className="h-16 w-16 mx-auto mb-6 animate-pulse-glow" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto Para Transformar Seu Corpo?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já estão transformando suas vidas. 
            É gratuito e você começa agora mesmo!
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-glow text-xl px-12 h-16">
            <CheckCircle2 className="mr-2 h-6 w-6" />
            Começar Minha Jornada Agora
          </Button>
        </div>
      </div>
    </div>;
};
export default Index;