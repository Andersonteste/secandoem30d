import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Dumbbell, Clock, TrendingUp } from "lucide-react";
import { Navigation } from "@/components/Navigation";

interface Workout {
  id: string;
  seq: number;
  title: string;
  description: string;
  youtube_url: string;
  duration_min: number;
  level: string;
}

const Treinos = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const { data } = await (supabase as any)
      .from("workouts")
      .select("*")
      .order("seq");

    if (data) {
      setWorkouts(data);
    }
    setLoading(false);
  };

  const getVideoId = (url: string) => {
    const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match?.[1];
  };

  const getLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
      iniciante: 'Iniciante',
      intermediario: 'Intermediário',
      avancado: 'Avançado',
    };
    return levels[level] || level;
  };

  return (
    <div className="min-h-screen bg-gradient-surface pb-24 md:pt-20">
      <Navigation />
      <header className="relative overflow-hidden py-6 px-4">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-white hover:bg-white/20 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Biblioteca de Treinos</h1>
              <p className="text-sm text-white/80">Todos os treinos do desafio</p>
            </div>
          </div>
        </div>
        
        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-surface" style={{ borderRadius: '100% 100% 0 0' }} />
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse-glow inline-block">
              <Dumbbell className="h-12 w-12 text-primary" />
            </div>
          </div>
        ) : workouts.length === 0 ? (
          <Card className="p-12 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum treino disponível ainda</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => {
              const videoId = getVideoId(workout.youtube_url);
              
              return (
                <Card 
                  key={workout.id} 
                  className="p-5 shadow-subtle hover:shadow-card transition-all duration-300 cursor-pointer border-0 bg-card group"
                  onClick={() => setSelectedWorkout(workout)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dia {workout.seq}</p>
                        <h3 className="font-semibold">{workout.title}</h3>
                      </div>
                    </div>
                  </div>

                  {videoId && (
                    <div className="relative rounded-lg overflow-hidden mb-4 aspect-video bg-muted">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt={workout.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{workout.description}</p>

                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{workout.duration_min} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>{getLevelLabel(workout.level)}</span>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-primary hover:opacity-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorkout(workout);
                    }}
                  >
                    Ver Detalhes
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Workout Detail Dialog */}
      <Dialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-2xl">{selectedWorkout?.title}</DialogTitle>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                Dia {selectedWorkout?.seq}
              </span>
            </div>
          </DialogHeader>
          
          {selectedWorkout && getVideoId(selectedWorkout.youtube_url) && (
            <div className="relative rounded-lg overflow-hidden aspect-video mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${getVideoId(selectedWorkout.youtube_url)}`}
                title={selectedWorkout.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{selectedWorkout?.duration_min} minutos</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>{selectedWorkout && getLevelLabel(selectedWorkout.level)}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Descrição</h3>
              <p className="text-muted-foreground whitespace-pre-line">{selectedWorkout?.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Treinos;
