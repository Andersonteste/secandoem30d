import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, Heart, MessageCircle, Share2, Award, Trophy, TrendingUp } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";

interface Testimonial {
  id: string;
  name: string;
  date: string;
  badge: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Maria Silva",
    date: "há 2 dias",
    badge: "Primeira vez HIIT",
    content: "Consegui completar meu primeiro treino HIIT completo! 🔥 A sensação é INCRÍVEL! Obrigada por todo o apoio!",
    likes: 12,
    comments: 5,
  },
  {
    id: "2",
    name: "João Pedro",
    date: "há 3 dias",
    badge: "Finalizado",
    content: "Hoje foi dia de preparar uma refeição super saudável! 🥗 Quem disse que comida fitness não pode ser focada na alimentação? 🥘",
    image: "healthy-meal",
    likes: 8,
    comments: 3,
  },
  {
    id: "3",
    name: "Ana Costa",
    date: "há 5 dias",
    badge: "3 dias Realizados",
    content: "Pessoal, consegui bater minha meta de 2L de água pelo 7º dia seguido! 💧💦 Pele tá super melhorando!",
    likes: 15,
    comments: 7,
  },
  {
    id: "4",
    name: "Carlos Mendes",
    date: "há 1 semana",
    badge: "Desafio Completo",
    content: "FINALIZEI O DESAFIO 30 dias de transformação completa! Obrigada a todos pela jornada! 💪🏆 Perdi 6kg e me sinto incrível! 🎉💕",
    likes: 28,
    comments: 12,
  },
];

const Community = () => {
  const navigate = useNavigate();
  const [groupUrl] = useState("https://chat.whatsapp.com/example-group-link");

  return (
    <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-glow">
        <div className="max-w-6xl mx-auto">
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
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Comunidade Fit</h1>
              <p className="text-sm opacity-90">Conecte-se com outras pessoas no desafio</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Community Stats */}
        <Card className="p-6 mb-8 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">Nossa Comunidade</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">1.2k</div>
              <div className="text-xs text-muted-foreground">Membros</div>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">245</div>
              <div className="text-xs text-muted-foreground">Posts Hoje</div>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">89%</div>
              <div className="text-xs text-muted-foreground">Taxa Sucesso</div>
            </div>
          </div>
        </Card>

        {/* CTA Card */}
        <Card className="p-6 mb-8 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-full">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Compartilhe sua experiência com o desafio...</h3>
              <Button 
                variant="secondary" 
                size="sm"
                className="mt-2"
              >
                Publicar
              </Button>
            </div>
          </div>
        </Card>

        {/* Feed Title */}
        <h2 className="text-xl font-bold mb-4">Feed da Comunidade</h2>

        {/* Testimonials Feed */}
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-4 bg-card border-border">
              {/* User Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <span className="text-xs text-muted-foreground">{testimonial.date}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {testimonial.badge === "Finalizado" ? (
                      <><Trophy className="h-3 w-3 mr-1" />{testimonial.badge}</>
                    ) : testimonial.badge === "Desafio Completo" ? (
                      <><Award className="h-3 w-3 mr-1" />{testimonial.badge}</>
                    ) : (
                      <><TrendingUp className="h-3 w-3 mr-1" />{testimonial.badge}</>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm mb-3">{testimonial.content}</p>

              {/* Image placeholder if exists */}
              {testimonial.image && (
                <div className="w-full h-48 rounded-lg bg-muted mb-3 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Imagem: {testimonial.image}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Heart className="h-4 w-4" />
                  <span>{testimonial.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>{testimonial.comments}</span>
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Group CTA Footer */}
        <Card className="mt-8 p-6 bg-gradient-primary text-primary-foreground text-center shadow-glow">
          <MessageCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Chat com Grupo Real</h3>
          <p className="text-sm opacity-90 mb-4">
            Entre no grupo VIP para conversar ao vivo com outros participantes!
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="font-semibold"
            onClick={() => window.open(groupUrl, "_blank")}
          >
            Entrar no Grupo
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Community;
