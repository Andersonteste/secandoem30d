import { Home, Dumbbell, UtensilsCrossed, BookOpen, User, Moon, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
export const Navigation = () => {
  const { theme, setTheme } = useTheme();
  
  const navItems = [{
    icon: Home,
    label: "Início",
    path: "/dashboard"
  }, {
    icon: Dumbbell,
    label: "Treinos",
    path: "/treinos"
  }, {
    icon: UtensilsCrossed,
    label: "Receitas",
    path: "/refeicoes"
  }, {
    icon: BookOpen,
    label: "Diário",
    path: "/diario"
  }, {
    icon: User,
    label: "Perfil",
    path: "/profile"
  }];
  
  return <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 md:top-0 md:bottom-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-around md:justify-center md:gap-8 py-3 flex-1">
          {navItems.map(item => <NavLink key={item.path} to={item.path} className={({
          isActive
        }) => cn("flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-all", "hover:bg-accent/50", isActive ? "text-primary font-medium bg-accent" : "text-muted-foreground")}>
              <item.icon className="w-5 h-5" />
              <span className="text-xs md:text-sm text-stone-950">{item.label}</span>
            </NavLink>)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </nav>;
};