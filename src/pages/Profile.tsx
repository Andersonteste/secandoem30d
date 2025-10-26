import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User as UserIcon, Save, RotateCcw } from "lucide-react";
import { Navigation } from "@/components/Navigation";

interface Profile {
  display_name: string;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    age: null,
    weight_kg: null,
    height_cm: null,
  });
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
      });
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