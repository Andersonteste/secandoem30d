import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Apple, Coffee, Sun, Moon, Camera, AlertCircle } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import FoodSubstitutionDialog from "./FoodSubstitutionDialog";
import FoodPhotoAnalyzer from "./FoodPhotoAnalyzer";

interface DailyMeal {
  id: string;
  title: string;
  meals: any;
  task: string;
}

const MealPlanCard = ({ dayNum }: { dayNum: number }) => {
  const [mealPlan, setMealPlan] = useState<DailyMeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [substitutionOpen, setSubstitutionOpen] = useState(false);
  const [photoAnalyzerOpen, setPhotoAnalyzerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMealPlan();
  }, [dayNum]);

  const loadMealPlan = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("daily_meals")
      .select("*")
      .eq("day_num", dayNum)
      .maybeSingle();

    setMealPlan(data);
    setLoading(false);
  };

  const handleMissingFood = () => {
    setSubstitutionOpen(true);
  };

  const handleTakePhoto = () => {
    setPhotoAnalyzerOpen(true);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Apple className="h-5 w-5 text-secondary" />
          <h3 className="text-lg font-semibold">Refeições de Hoje</h3>
        </div>
        <Skeleton className="h-24 w-full mb-2" />
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }

  if (!mealPlan) {
    return (
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Apple className="h-5 w-5 text-secondary" />
          <h3 className="text-lg font-semibold">Today's Meal Plan</h3>
        </div>
        <p className="text-muted-foreground">Nenhum plano alimentar designado para este dia ainda.</p>
      </Card>
    );
  }

  const meals = mealPlan.meals || {};
  const mealTypes = [
    { key: "cafe", icon: Coffee, label: "Café da Manhã" },
    { key: "lanche_manha", icon: Apple, label: "Lanche da Manhã" },
    { key: "almoco", icon: Sun, label: "Almoço" },
    { key: "lanche_tarde", icon: Apple, label: "Lanche da Tarde" },
    { key: "jantar", icon: Moon, label: "Jantar" },
  ];

  return (
    <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-secondary/10 p-2 rounded-lg">
          <Apple className="h-5 w-5 text-secondary" />
        </div>
        <h3 className="text-lg font-semibold">Refeições de Hoje</h3>
      </div>

      {mealPlan.title && (
        <p className="text-sm font-medium text-primary mb-4">{mealPlan.title}</p>
      )}

      <div className="space-y-4">
        {mealTypes.map(({ key, icon: Icon, label }) => {
          const mealContent = meals[key];
          if (!mealContent) return null;

          return (
            <div key={key} className="border-l-2 border-primary/20 pl-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{mealContent}</p>
            </div>
          );
        })}
      </div>

      {mealPlan.task && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-medium text-accent mb-1">Desafio do Dia</p>
          <p className="text-sm">{mealPlan.task}</p>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          className="flex-1 gap-2 text-xs"
          onClick={handleMissingFood}
        >
          <AlertCircle className="h-4 w-4" />
          Não tenho esse alimento
        </Button>
        <Button
          variant="default"
          className="flex-1 gap-2 text-xs bg-gradient-primary"
          onClick={handleTakePhoto}
        >
          <Camera className="h-4 w-4" />
          Tirar Foto
        </Button>
      </div>

      <FoodSubstitutionDialog
        open={substitutionOpen}
        onOpenChange={setSubstitutionOpen}
        meals={mealPlan?.meals}
      />

      <FoodPhotoAnalyzer
        open={photoAnalyzerOpen}
        onOpenChange={setPhotoAnalyzerOpen}
      />
    </Card>
  );
};

export default MealPlanCard;