import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface FoodSubstitutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meals: any;
}

interface Substitution {
  nome: string;
  quantidade: string;
  motivo: string;
  calorias: string;
}

const FoodSubstitutionDialog = ({ open, onOpenChange, meals }: FoodSubstitutionDialogProps) => {
  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!food.trim() || !quantity.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o alimento e a quantidade.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSubstitutions([]);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-food-substitution', {
        body: { food: food.trim(), quantity: quantity.trim() }
      });

      if (error) throw error;

      if (data?.success && data?.data?.substituicoes) {
        setSubstitutions(data.data.substituicoes);
        toast({
          title: "Substituições geradas!",
          description: `Encontramos ${data.data.substituicoes.length} alternativas saudáveis.`,
        });
      } else {
        throw new Error("Resposta inválida da IA");
      }
    } catch (error: any) {
      console.error('Error fetching substitutions:', error);
      toast({
        title: "Erro ao buscar substituições",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFood("");
    setQuantity("");
    setSubstitutions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Substituição de Alimentos
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Encontre substituições saudáveis para seus alimentos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food">Alimento</Label>
            <Input
              id="food"
              placeholder="Ex: Arroz branco"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              disabled={loading}
              className="bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              placeholder="Ex: 100g"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
              className="bg-card"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando Substituições...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Buscar Substituição
              </>
            )}
          </Button>
        </form>

        {substitutions.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Substituições Sugeridas
            </h3>
            <div className="space-y-3">
              {substitutions.map((sub, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-2 hover:shadow-glow transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">{sub.nome}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{sub.motivo}</p>
                    </div>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {sub.calorias}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-xs">
                      {sub.quantidade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card/50 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Como funciona?
          </h4>
          <p className="text-xs text-muted-foreground">
            Digite o alimento e a quantidade que deseja substituir. 
            Nossa IA analisará e sugerirá opções com equivalência 
            nutricional (calorias e macros).
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSubstitutionDialog;
