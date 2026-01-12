import { Home, Dumbbell, UtensilsCrossed, BookOpen, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const navItems = [
    { icon: Home, label: "Início", path: "/dashboard" },
    { icon: Dumbbell, label: "Treinos", path: "/treinos" },
    { icon: UtensilsCrossed, label: "Receitas", path: "/refeicoes" },
    { icon: BookOpen, label: "Diário", path: "/diario" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto">
      {/* Blur background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t md:border-t-0 md:border-b border-border/50" />
      
      <div className="relative container mx-auto px-4">
        <div className="flex justify-around md:justify-center md:gap-2 py-2 md:py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2.5 rounded-xl transition-all duration-300",
                  "hover:bg-primary/5",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute inset-0 bg-primary/10 rounded-xl" />
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-primary rounded-full md:hidden" />
                  )}
                  
                  <item.icon 
                    className={cn(
                      "relative w-5 h-5 transition-transform duration-300",
                      isActive && "scale-110"
                    )} 
                  />
                  <span 
                    className={cn(
                      "relative text-xs md:text-sm transition-all",
                      isActive && "font-semibold"
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
