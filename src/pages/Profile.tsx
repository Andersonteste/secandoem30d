import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User as UserIcon, Save, RotateCcw, Scale, TrendingDown, Calendar } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Profile {
  display_name: string;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  created_at: string | null;
}

interface WeightLog {
  id: string;
  weight_kg: number;
  measured_at: string;
  created_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    age: null,
    weight_kg: null,
    height_cm: null,
    created_at: null,
  });
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [newWeight, setNewWeight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      setProfile({
        display_name: data.display_name || "",
        age: data.age,
        weight_kg: data.weight_kg,
        height_cm: data.height_cm,
        created_at: data.created_at,
      });
    }

    // Load weight logs
    const { data: logs } = await (supabase as any)
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("measured_at", { ascending: false });

    if (logs) {
      setWeightLogs(logs);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await (supabase as any)
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar perfil",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado",
      });
    }
    setLoading(false);
  };

  const addWeightLog = async () => {
    if (!user || !newWeight) return;

    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um peso válido",
      });
      return;
    }

    setLoading(true);
    const { error } = await (supabase as any)
      .from("weight_logs")
      .insert({
        user_id: user.id,
        weight_kg: weight,
        measured_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao registrar pesagem",
      });
    } else {
      toast({
        title: "Pesagem Registrada!",
        description: `Peso registrado: ${weight}kg`,
      });
      setNewWeight("");
      loadProfile(user.id);
    }
    setLoading(false);
  };

  const deleteWeightLog = async (logId: string) => {
    if (!user) return;

    setLoading(true);
    const { error } = await (supabase as any)
      .from("weight_logs")
      .delete()
      .eq("id", logId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao deletar pesagem",
      });
    } else {
      toast({
        title: "Pesagem Deletada",
        description: "Registro removido com sucesso",
      });
      loadProfile(user.id);
    }
    setLoading(false);
  };

  const resetChallenge = async () => {
    if (!user) return;
    
    const confirmed = window.confirm("Tem certeza que deseja resetar todo o desafio? Esta ação não pode ser desfeita.");
    if (!confirmed) return;

    setLoading(true);
    const { error } = await (supabase as any)
      .from("challenge_progress")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao resetar desafio",
      });
    } else {
      toast({
        title: "Desafio Resetado!",
        description: "Você pode começar novamente do zero",
      });
    }
    setLoading(false);
  };

  const getNextWeighInDate = () => {
    if (!profile.created_at) return null;
    
    const profileCreated = new Date(profile.created_at);
    const today = new Date();
    const daysSinceCreation = differenceInDays(today, profileCreated);
    
    // Calculate next 7-day interval
    const nextInterval = Math.ceil((daysSinceCreation + 1) / 7) * 7;
    return addDays(profileCreated, nextInterval);
  };

  const getWeightProgress = () => {
    if (weightLogs.length < 2) return null;
    
    const latest = weightLogs[0].weight_kg;
    const oldest = weightLogs[weightLogs.length - 1].weight_kg;
    const diff = oldest - latest;
    
    return {
      diff: diff,
      percentage: ((diff / oldest) * 100).toFixed(1)
    };
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-glow">
        <div className="max-w-2xl mx-auto">
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
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Seu Perfil</h1>
              <p className="text-sm opacity-90">Gerencie suas informações pessoais</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-6 bg-gradient-card shadow-card mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Nome</Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email não pode ser alterado</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ""}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || null })}
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={profile.weight_kg || ""}
                  onChange={(e) => setProfile({ ...profile, weight_kg: parseFloat(e.target.value) || null })}
                  placeholder="70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height_cm || ""}
                  onChange={(e) => setProfile({ ...profile, height_cm: parseInt(e.target.value) || null })}
                  placeholder="170"
                />
              </div>
            </div>

            <Button
              onClick={saveProfile}
              disabled={loading}
              className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvando..." : "Salvar Perfil"}
            </Button>
          </div>
        </Card>

        {/* Weight Tracking Section */}
        <Card className="p-6 bg-gradient-card shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/20 p-2 rounded-full">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Controle de Peso</h3>
              <p className="text-sm text-muted-foreground">Registre seu peso a cada 7 dias</p>
            </div>
          </div>

          {/* Next Weigh-In Date */}
          {profile.created_at && (
            <div className="bg-primary/10 p-3 rounded-lg mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Próxima pesagem: {getNextWeighInDate() ? format(getNextWeighInDate()!, "dd 'de' MMMM", { locale: ptBR }) : "Não definido"}
              </span>
            </div>
          )}

          {/* Weight Progress */}
          {getWeightProgress() && (
            <div className="bg-gradient-primary/10 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Progresso Total</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-500">
                    {getWeightProgress()!.diff > 0 ? '-' : '+'}{Math.abs(getWeightProgress()!.diff).toFixed(1)}kg
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getWeightProgress()!.percentage}% do peso inicial
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add New Weight */}
          <div className="space-y-3 mb-4">
            <Label htmlFor="new_weight">Registrar Nova Pesagem</Label>
            <div className="flex gap-2">
              <Input
                id="new_weight"
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Ex: 70.5"
                className="flex-1"
              />
              <Button
                onClick={addWeightLog}
                disabled={loading || !newWeight}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>

          {/* Weight History */}
          {weightLogs.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-3">Histórico de Pesagens</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {weightLogs.map((log, index) => {
                  const previousWeight = weightLogs[index + 1]?.weight_kg;
                  const diff = previousWeight ? previousWeight - log.weight_kg : 0;
                  
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{log.weight_kg}kg</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(log.measured_at), "dd/MM/yyyy 'às' HH:mm")}
                        </div>
                      </div>
                      {diff !== 0 && (
                        <div className={`text-sm font-medium px-2 py-1 rounded ${
                          diff > 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                        }`}>
                          {diff > 0 ? '-' : '+'}{Math.abs(diff).toFixed(1)}kg
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWeightLog(log.id)}
                        className="ml-2 text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {weightLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma pesagem registrada ainda</p>
              <p className="text-xs">Registre seu peso para acompanhar seu progresso</p>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-gradient-card shadow-card border-destructive/50">
          <h3 className="text-lg font-semibold mb-2 text-destructive">Zona de Perigo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Resetar o desafio irá apagar todo o seu progresso atual. Esta ação não pode ser desfeita.
          </p>
          <Button
            onClick={resetChallenge}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {loading ? "Resetando..." : "Resetar Desafio"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Profile;