import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "@/hooks/useAccount";
import { BRAND } from "@/lib/brand";
import { Check, Loader2, ArrowLeft } from "lucide-react";

const PERIOD_LABELS: Record<string, string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};

const Planos = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasAccess, email } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("plans")
        .select("*")
        .eq("active", true)
        .order("order_num", { ascending: true });
      setPlans(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-primary text-primary-foreground px-5 pt-8 pb-12">
        <Button variant="ghost" size="sm" className="mb-3 text-primary-foreground hover:bg-white/10" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">Planos {BRAND.name}</h1>
        <p className="text-sm opacity-90 mt-1">{BRAND.tagline}</p>
      </header>

      <main className="container mx-auto px-4 -mt-6 max-w-4xl pb-16">
        {hasAccess && (
          <Card className="mb-4 border-primary">
            <CardContent className="p-4 text-sm">
              Sua assinatura está ativa. Bom treino!
              <Button size="sm" className="ml-3" onClick={() => navigate("/hoje")}>Ir para Hoje</Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : plans.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum plano publicado ainda. Cadastre os planos no painel administrativo.
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => (
              <Card key={p.id} className={p.highlight ? "border-primary shadow-lg" : ""}>
                <CardContent className="p-5 flex flex-col h-full">
                  {p.highlight && <Badge className="w-fit mb-2">Mais escolhido</Badge>}
                  <h2 className="font-bold text-lg">{p.name}</h2>
                  <p className="text-xs text-muted-foreground">{PERIOD_LABELS[p.period] ?? p.period}</p>
                  <p className="text-2xl font-bold mt-3">{p.price_label ?? (p.price_cents ? `R$ ${(p.price_cents / 100).toFixed(2)}` : "—")}</p>
                  {p.description && <p className="text-sm text-muted-foreground mt-2 flex-1">{p.description}</p>}
                  <Button
                    className="w-full mt-4"
                    disabled={!p.checkout_url}
                    onClick={() => {
                      const url = new URL(p.checkout_url);
                      if (email) url.searchParams.set("email", email);
                      window.open(url.toString(), "_blank");
                    }}
                  >
                    Assinar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-6">
          <CardContent className="p-5 text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">O que está incluído</p>
            {["Treinos em casa e na academia", "Alimentação e receitas", "Hábitos, água e sono",
              "Evolução com peso e medidas", "Comunidade", "Biblioteca de materiais",
              "Atendimento pelo WhatsApp", "Orientação personalizada pelo seu perfil"].map((f) => (
              <p key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {f}</p>
            ))}
            <p className="pt-2 text-xs">
              Os resultados variam de pessoa para pessoa. O conteúdo é educativo e não substitui
              avaliação médica ou nutricional individual.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Planos;
