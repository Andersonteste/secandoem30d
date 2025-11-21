import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChefHat, Clock, Flame, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Recipe {
  nome: string;
  ingredientes: string[];
  modo_preparo: string[];
  tempo_preparo_minutos: number;
  calorias_por_porcao: number;
  macros: {
    proteinas: string;
    carboidratos: string;
    gorduras: string;
  };
  rendimento: string;
}

interface RecipesResponse {
  receitas: Recipe[];
}

export const RecipeAIChat = () => {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateRecipes = async () => {
    if (!ingredients.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, informe os ingredientes disponíveis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setRecipes([]);

    try {
      const { data, error } = await supabase.functions.invoke(
        'suggest-recipes-from-ingredients',
        {
          body: { ingredients: ingredients.trim() }
        }
      );

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Erro ao gerar receitas");
      }

      const recipesData = data.data as RecipesResponse;
      setRecipes(recipesData.receitas);

      toast({
        title: "Receitas geradas!",
        description: `${recipesData.receitas.length} receitas criadas com seus ingredientes`,
      });
    } catch (error: any) {
      console.error('Error generating recipes:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar as receitas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Chat de Receitas com IA
          </CardTitle>
          <CardDescription>
            Digite os ingredientes que você tem em casa e receba receitas fitness personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="ingredients" className="text-sm font-medium">
              Ingredientes Disponíveis
            </label>
            <Textarea
              id="ingredients"
              placeholder="Ex: frango, arroz integral, brócolis, tomate, alho, azeite..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={4}
              disabled={loading}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={handleGenerateRecipes} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando receitas...
              </>
            ) : (
              <>
                <ChefHat className="mr-2 h-4 w-4" />
                Gerar Receitas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {recipes.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Suas Receitas Personalizadas</h3>
          
          {recipes.map((recipe, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-xl">{recipe.nome}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {recipe.tempo_preparo_minutos} min
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {recipe.calorias_por_porcao} kcal
                  </Badge>
                  <Badge variant="secondary">
                    {recipe.rendimento}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                {/* Macros */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{recipe.macros.proteinas}</div>
                    <div className="text-xs text-muted-foreground">Proteínas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{recipe.macros.carboidratos}</div>
                    <div className="text-xs text-muted-foreground">Carboidratos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{recipe.macros.gorduras}</div>
                    <div className="text-xs text-muted-foreground">Gorduras</div>
                  </div>
                </div>

                {/* Ingredientes */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Ingredientes
                  </h4>
                  <ul className="space-y-2">
                    {recipe.ingredientes.map((ingredient, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Modo de Preparo */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    Modo de Preparo
                  </h4>
                  <ol className="space-y-3">
                    {recipe.modo_preparo.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </span>
                        <span className="text-sm pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
