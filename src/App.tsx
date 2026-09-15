import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Sales from "./pages/Sales";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Hoje from "./pages/Hoje";
import Habitos from "./pages/Habitos";
import Evolucao from "./pages/Evolucao";
import Biblioteca from "./pages/Biblioteca";
import Jornadas from "./pages/Jornadas";
import Planos from "./pages/Planos";
import Refeicoes from "./pages/Refeicoes";
import Bonus from "./pages/Bonus";
import Treinos from "./pages/Treinos";
import Diario from "./pages/Diario";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import ReceitasIA from "./pages/ReceitasIA";
import Loja from "./pages/Loja";
import Admin from "./pages/admin/Admin";
import AdminProdutos from "./pages/AdminProdutos";
import AdminExercicios from "./pages/admin/AdminExercicios";
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
            <Route path="/planos" element={<Planos />} />

            {/* Área do aluno */}
            <Route path="/hoje" element={<Hoje />} />
            <Route path="/dashboard" element={<Navigate to="/hoje" replace />} />
            <Route path="/treinos" element={<Treinos />} />
            <Route path="/alimentacao" element={<Refeicoes />} />
            <Route path="/refeicoes" element={<Navigate to="/alimentacao" replace />} />
            <Route path="/habitos" element={<Habitos />} />
            <Route path="/evolucao" element={<Evolucao />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/jornadas" element={<Jornadas />} />
            <Route path="/bonus" element={<Bonus />} />
            <Route path="/diario" element={<Diario />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/comunidade" element={<Community />} />
            <Route path="/receitas-ia" element={<ReceitasIA />} />
            <Route path="/loja" element={<Loja />} />

            {/* Painel administrativo */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/:module" element={<Admin />} />
            <Route path="/admin/exercicios" element={<AdminExercicios />} />
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
