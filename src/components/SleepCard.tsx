import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SleepData {
  sleepTime: string;
  wakeTime: string;
  sleepQuality: "bad" | "ok" | "good" | "";
}

export const SleepCard = () => {
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [sleepQuality, setSleepQuality] = useState<"bad" | "ok" | "good" | "">("");
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
        loadSleepData(session.user.id);
      }
    });
  }, []);

  const loadSleepData = async (uid: string) => {
    const todayBrazil = getBrazilDate();
    const { data } = await (supabase as any)
      .from("food_diary")
      .select("photos")
      .eq("user_id", uid)
      .eq("entry_date", todayBrazil)
      .single();

    if (data?.photos) {
      const photos = data.photos as any;
      setSleepTime(photos.sleepTime || "");
      setWakeTime(photos.wakeTime || "");
      setSleepQuality(photos.sleepQuality || "");
    }
  };

  const saveSleepData = async (sleep: string, wake: string, quality: string) => {
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
      sleepTime: sleep,
      wakeTime: wake,
      sleepQuality: quality,
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

    toast({
      title: "Sono registrado! 😴",
      description: "Seus dados de sono foram salvos.",
    });
  };

  const handleSleepTimeChange = (value: string) => {
    setSleepTime(value);
    saveSleepData(value, wakeTime, sleepQuality);
  };

  const handleWakeTimeChange = (value: string) => {
    setWakeTime(value);
    saveSleepData(sleepTime, value, sleepQuality);
  };

  const handleQualityChange = (quality: "bad" | "ok" | "good") => {
    setSleepQuality(quality);
    saveSleepData(sleepTime, wakeTime, quality);
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-500/10 p-2 rounded-full">
          <Moon className="h-6 w-6 text-indigo-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Sono e Descanso</h3>
          <p className="text-sm text-muted-foreground">Acompanhe sua rotina noturna</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Hora de dormir
            </label>
            <Input
              type="time"
              value={sleepTime}
              onChange={(e) => handleSleepTimeChange(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Hora de acordar
            </label>
            <Input
              type="time"
              value={wakeTime}
              onChange={(e) => handleWakeTimeChange(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Qualidade do sono
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={sleepQuality === "bad" ? "default" : "outline"}
              size="sm"
              onClick={() => handleQualityChange("bad")}
              className="flex-1"
            >
              😴 Ruim
            </Button>
            <Button
              type="button"
              variant={sleepQuality === "ok" ? "default" : "outline"}
              size="sm"
              onClick={() => handleQualityChange("ok")}
              className="flex-1"
            >
              😐 Ok
            </Button>
            <Button
              type="button"
              variant={sleepQuality === "good" ? "default" : "outline"}
              size="sm"
              onClick={() => handleQualityChange("good")}
              className="flex-1"
            >
              😊 Bom
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
