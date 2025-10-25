import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight } from "lucide-react";

interface FoodSubstitutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meals: any;
}

const foodSubstitutions: Record<string, string[]> = {
  "arroz": ["Quinoa", "Arroz integral", "Macarrão integral", "Batata doce"],
  "frango": ["Peixe", "Carne magra", "Ovos", "Tofu"],
  "pão": ["Tapioca", "Pão integral", "Batata doce", "Crepioca"],
  "leite": ["Leite de amêndoas", "Leite de coco", "Leite de aveia", "Iogurte natural"],
  "banana": ["Maçã", "Mamão", "Pera", "Morangos"],
  "batata": ["Batata doce", "Mandioca", "Inhame", "Abóbora"],
  "carne": ["Frango", "Peixe", "Ovos", "Lentilha"],
  "queijo": ["Queijo cottage", "Ricota", "Queijo branco", "Requeijão light"],
  "açúcar": ["Mel", "Stevia", "Xilitol", "Tâmaras"],
  "óleo": ["Azeite de oliva", "Óleo de coco", "Óleo de abacate", "Manteiga ghee"],
};

const FoodSubstitutionDialog = ({ open, onOpenChange, meals }: FoodSubstitutionDialogProps) => {
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  
  const getAllFoods = (): string[] => {
    const foods: string[] = [];
    Object.values(meals || {}).forEach((meal: any) => {
      if (typeof meal === 'string') {
        foods.push(meal);
      }
    });
    return foods;
  };

  const findSubstitutions = (foodText: string): Array<{ original: string; substitutes: string[] }> => {
    const results: Array<{ original: string; substitutes: string[] }> = [];
    
    Object.entries(foodSubstitutions).forEach(([key, subs]) => {
      if (foodText.toLowerCase().includes(key.toLowerCase())) {
        results.push({ original: key, substitutes: subs });
      }
    });
    
    return results;
  };

  const allFoods = getAllFoods();
  const availableSubstitutions = allFoods.flatMap(food => 
    findSubstitutions(food).map(sub => ({ ...sub, mealText: food }))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Substituição de Alimentos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {availableSubstitutions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma substituição disponível para os alimentos de hoje.</p>
            </div>
          ) : (
            availableSubstitutions.map((sub, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-sm capitalize">
                    {sub.original}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">pode ser substituído por:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {sub.substitutes.map((substitute, subIdx) => (
                    <Badge 
                      key={subIdx}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {substitute}
                    </Badge>
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground italic mt-2">
                  Na refeição: {sub.mealText}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSubstitutionDialog;
