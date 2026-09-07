import { ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAccount } from "@/hooks/useAccount";

export const AdminGate = ({ children }: { children: ReactNode }) => {
  const { loading, isAdmin } = useAccount();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
        <ShieldAlert className="h-8 w-8 text-destructive" />
        <h1 className="text-xl font-bold">Acesso restrito</h1>
        <p className="text-muted-foreground text-sm">
          Esta área é exclusiva da equipe administrativa.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
