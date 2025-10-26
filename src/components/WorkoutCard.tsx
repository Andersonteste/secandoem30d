import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Dumbbell, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface Workout {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  duration_min: number;
  level: string;
}

const WorkoutCard = ({ dayNum }: { dayNum: number }) => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, [dayNum]);

  const loadWorkout = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("workouts")
      .select("*")
      .eq("seq", dayNum)
      .maybeSingle();

    setWorkout(data);
    setLoading(false);
  };

  const getVideoId = (url: string) => {
    const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match?.[1];
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Treino de Hoje</h3>
        </div>
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </Card>
    );
  }

  if (!workout) {
    return (
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Treino de Hoje</h3>
        </div>
        <p className="text-muted-foreground">Nenhum treino designado para este dia ainda.</p>
      </Card>
    );
  }

  const videoId = getVideoId(workout.youtube_url);

  return (
    <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Dumbbell className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Treino de Hoje</h3>
      </div>

      {videoId && (
        <div className="relative rounded-lg overflow-hidden mb-4 aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={workout.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      <h4 className="font-semibold text-lg mb-2">{workout.title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{workout.description}</p>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{workout.duration_min} min</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span className="capitalize">{workout.level}</span>
        </div>
      </div>
    </Card>
  );
};

export default WorkoutCard;