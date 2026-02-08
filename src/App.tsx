import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Sales from "./pages/Sales";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Refeicoes from "./pages/Refeicoes";
import Bonus from "./pages/Bonus";
import Treinos from "./pages/Treinos";
import Diario from "./pages/Diario";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import ReceitasIA from "./pages/ReceitasIA";
import Loja from "./pages/Loja";
import AdminProdutos from "./pages/AdminProdutos";
import AdminReceitas from "./pages/AdminReceitas";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Sales />} />
            <Route path="/app" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/refeicoes" element={<Refeicoes />} />
            <Route path="/bonus" element={<Bonus />} />
            <Route path="/treinos" element={<Treinos />} />
            <Route path="/diario" element={<Diario />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/comunidade" element={<Community />} />
            <Route path="/receitas-ia" element={<ReceitasIA />} />
            <Route path="/loja" element={<Loja />} />
            <Route path="/admin/produtos" element={<AdminProdutos />} />
            <Route path="/admin/receitas" element={<AdminReceitas />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
