import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Flame, Mail, Lock, User, TrendingUp } from "lucide-react";
import logoImage from "@/assets/logo-secando.png";
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.onboarding_completed) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }
    };

    checkSession();

    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.onboarding_completed) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso."
        });
      } else {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: displayName || email.split("@")[0]
            }
          }
        });
        if (error) throw error;
        toast({
          title: "Conta criada!",
          description: "Bem-vindo ao seu desafio de 30 dias."
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-glow p-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={logoImage} 
              alt="Secando em Casa Logo" 
              className="w-64 h-auto"
            />
          </div>
          <p className="text-center text-muted-foreground mb-8">
            {isLogin ? "Bem-vindo de volta! Vamos continuar sua jornada." : "Comece sua transformação hoje"}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome
                </Label>
                <Input id="displayName" type="text" placeholder="Seu nome" value={displayName} onChange={e => setDisplayName(e.target.value)} className="transition-all focus:shadow-glow" />
              </div>}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="transition-all focus:shadow-glow" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha
              </Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="transition-all focus:shadow-glow" />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary hover:opacity-90 transition-all shadow-glow">
              {loading ? "Carregando..." : isLogin ? <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Entrar
                </> : <>
                  <Flame className="mr-2 h-4 w-4" />
                  Iniciar Desafio
                </>}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default Auth;