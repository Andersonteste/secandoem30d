import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAccount } from "@/hooks/useAccount";
import { BRAND } from "@/lib/brand";

/**
 * Protege conteúdo pago. A liberação depende de autorização ativa
 * verificada no backend — nunca de URL ou dados do navegador.
 */
export const AccessGate = ({ children }: { children: ReactNode }) => {
  const { loading, userId, hasAccess } = useAccount();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-8 w-8 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Entre na sua conta</h2>
            <p className="text-muted-foreground text-sm">
              Faça login para acessar seu plano no {BRAND.name}.
            </p>
            <Button className="w-full" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-8 w-8 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Assinatura necessária</h2>
            <p className="text-muted-foreground text-sm">
              Sua conta ainda não tem uma assinatura ativa. Escolha um plano para
              liberar treinos, alimentação, hábitos e biblioteca.
            </p>
            <Button className="w-full" onClick={() => navigate("/planos")}>
              Ver planos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
