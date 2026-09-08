import { useState } from "react";
import {
  Sun, Dumbbell, UtensilsCrossed, Sparkles, LayoutGrid, TrendingUp, Users,
  BookOpen, ShoppingBag, User, Route as RouteIcon, Bot, ShieldCheck,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAccount } from "@/hooks/useAccount";

const primary = [
  { icon: Sun, label: "Hoje", path: "/hoje" },
  { icon: Dumbbell, label: "Treinos", path: "/treinos" },
  { icon: UtensilsCrossed, label: "Alimentação", path: "/alimentacao" },
  { icon: Sparkles, label: "Hábitos", path: "/habitos" },
];

const more = [
  { icon: TrendingUp, label: "Evolução", path: "/evolucao" },
  { icon: Users, label: "Comunidade", path: "/comunidade" },
  { icon: BookOpen, label: "Biblioteca", path: "/biblioteca" },
  { icon: RouteIcon, label: "Jornadas", path: "/jornadas" },
  { icon: ShoppingBag, label: "Loja", path: "/loja" },
  { icon: Bot, label: "Receitas com IA", path: "/receitas-ia" },
  { icon: User, label: "Perfil", path: "/profile" },
];

export const Navigation = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAccount();

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t md:border-t-0 md:border-b border-border/50" />

      <div className="relative container mx-auto px-2">
        <div className="flex justify-around md:justify-center md:gap-2 py-2 md:py-3">
          {primary.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-primary/5",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-0 bg-primary/10 rounded-xl" />}
                  <item.icon className={cn("relative w-5 h-5 transition-transform", isActive && "scale-110")} />
                  <span className={cn("relative text-[11px] md:text-sm", isActive && "font-semibold")}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="relative flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all">
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[11px] md:text-sm">Mais</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Explorar</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-4">
                {more.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-primary/5 transition-colors"
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="text-xs text-center leading-tight">{item.label}</span>
                  </button>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => go("/admin")}
                    className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-primary/5 transition-colors"
                  >
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="text-xs text-center leading-tight">Painel</span>
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
