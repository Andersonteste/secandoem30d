import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Droplets, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface HydrationData {
  waterIntake: number;
  waterGoal: number;
}

export const HydrationCard = () => {
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const getBrazilDate = () => {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return format(brazilTime, "yyyy-MM-dd");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadHydrationData(session.user.id);
      }
    });
  }, []);

  const loadHydrationData = async (uid: string) => {
    const todayBrazil = getBrazilDate();
    const { data } = await (supabase as any)
      .from("food_diary")
      .select("photos")
      .eq("user_id", uid)
      .eq("entry_date", todayBrazil)
      .single();

    if (data?.photos) {
      const photos = data.photos as any;
      setWaterIntake(photos.waterIntake || 0);
      setWaterGoal(photos.waterGoal || 2000);
    }
  };

  const saveHydrationData = async (newIntake: number, newGoal: number) => {
    if (!userId) return;

    const todayBrazil = getBrazilDate();
    const { data: existing } = await (supabase as any)
      .from("food_diary")
      .select("*")
      .eq("user_id", userId)
      .eq("entry_date", todayBrazil)
      .single();

    const photos = (existing?.photos as any) || {};
    const updatedPhotos = {
      ...photos,
      waterIntake: newIntake,
      waterGoal: newGoal,
    };

    if (existing) {
      await (supabase as any)
        .from("food_diary")
        .update({ photos: updatedPhotos })
        .eq("id", existing.id);
    } else {
      await (supabase as any)
        .from("food_diary")
        .insert({
          user_id: userId,
          entry_date: todayBrazil,
          photos: updatedPhotos,
          notes: "",
        });
    }
  };

  const handleAddWater = async () => {
    const newIntake = Math.min(waterGoal, waterIntake + 250);
    setWaterIntake(newIntake);
    await saveHydrationData(newIntake, waterGoal);
    
    if (newIntake >= waterGoal) {
      toast({
        title: "Meta alcançada! 💧",
        description: "Parabéns! Você atingiu sua meta de hidratação hoje!",
      });
    }
  };

  const handleRemoveWater = async () => {
    const newIntake = Math.max(0, waterIntake - 250);
    setWaterIntake(newIntake);
    await saveHydrationData(newIntake, waterGoal);
  };

  const handleGoalChange = async (newGoal: number) => {
    setWaterGoal(newGoal);
    await saveHydrationData(waterIntake, newGoal);
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-500/10 p-2 rounded-full">
          <Droplets className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Hidratação</h3>
          <p className="text-sm text-muted-foreground">Meta diária de água</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{waterIntake}ml de {waterGoal}ml</span>
          <span className="text-muted-foreground font-semibold">
            {Math.round((waterIntake / waterGoal) * 100)}%
          </span>
        </div>

        <Progress value={(waterIntake / waterGoal) * 100} className="h-3" />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveWater}
            className="flex-1"
          >
            <Minus className="h-4 w-4 mr-1" />
            250ml
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAddWater}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-1" />
            250ml
          </Button>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <label className="text-sm text-muted-foreground">Meta:</label>
          <Input
            type="number"
            value={waterGoal}
            onChange={(e) => handleGoalChange(Number(e.target.value))}
            className="w-24 h-8 text-sm"
            min="500"
            max="5000"
            step="250"
          />
          <span className="text-sm">ml</span>
        </div>
      </div>
    </Card>
  );
};
