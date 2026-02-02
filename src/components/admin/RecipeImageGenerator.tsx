import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ImagePlus, CheckCircle2, AlertCircle, ChefHat, Wand2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Recipe {
  id: string;
  title: string;
  category: string;
  ingredients: any;
  photo_url: string | null;
}

export const RecipeImageGenerator = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("id, title, category, ingredients, photo_url")
      .order("category, title");

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as receitas",
        variant: "destructive",
      });
      return;
    }

    setRecipes(data || []);
    setLoading(false);
  };

  const generateImage = async (recipe: Recipe) => {
    setGenerating(recipe.id);

    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe-image", {
        body: {
          recipeId: recipe.id,
          recipeName: recipe.title,
          recipeCategory: recipe.category,
          recipeIngredients: recipe.ingredients,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Erro ao gerar imagem");
      }

      // Update local state
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipe.id ? { ...r, photo_url: data.imageUrl } : r
        )
      );

      setGeneratedCount((prev) => prev + 1);

      toast({
        title: "Imagem gerada!",
        description: `Imagem para "${recipe.title}" criada com sucesso`,
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar a imagem",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const generateBatchImages = async (category?: string) => {
    setBatchGenerating(true);
    setProgress(0);

    const recipesToGenerate = category
      ? recipes.filter((r) => r.category === category)
      : recipes;

    const total = recipesToGenerate.length;
    let completed = 0;

    for (const recipe of recipesToGenerate) {
      try {
        await generateImage(recipe);
        completed++;
        setProgress(Math.round((completed / total) * 100));
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error generating image for ${recipe.title}:`, error);
      }
    }

    setBatchGenerating(false);
    toast({
      title: "Geração em lote concluída!",
      description: `${completed} de ${total} imagens geradas`,
    });
  };

  const categories = [...new Set(recipes.map((r) => r.category))].sort();

  const getRecipesWithoutAIImages = () => {
    return recipes.filter(
      (r) =>
        !r.photo_url ||
        r.photo_url.includes("unsplash") ||
        r.photo_url.includes("encrypted-tbn0") ||
        r.photo_url.includes("images.tcdn") ||
        r.photo_url.includes("guiadacozinha") ||
        r.photo_url.includes("centralblogs") ||
        r.photo_url.includes("ciclovivo") ||
        r.photo_url.includes("static.tvgazeta") ||
        r.photo_url.includes("segs.com.br") ||
        r.photo_url.includes("img.cybercook")
    );
  };

  const recipesNeedingImages = getRecipesWithoutAIImages();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{recipes.length}</div>
            <div className="text-sm text-muted-foreground">Total de Receitas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-destructive">{recipesNeedingImages.length}</div>
            <div className="text-sm text-muted-foreground">Precisam de Imagem IA</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {recipes.length - recipesNeedingImages.length}
            </div>
            <div className="text-sm text-muted-foreground">Com Imagem IA</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-secondary-foreground">{generatedCount}</div>
            <div className="text-sm text-muted-foreground">Geradas Agora</div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Geração em Lote
          </CardTitle>
          <CardDescription>
            Gere imagens de IA para várias receitas de uma vez
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {batchGenerating && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Gerando imagens... {progress}%
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => generateBatchImages()}
              disabled={batchGenerating || recipesNeedingImages.length === 0}
            >
              {batchGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Gerar Todas ({recipesNeedingImages.length})
                </>
              )}
            </Button>

            {categories.map((category) => {
              const count = recipesNeedingImages.filter(
                (r) => r.category === category
              ).length;
              if (count === 0) return null;
              return (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  onClick={() => generateBatchImages(category)}
                  disabled={batchGenerating}
                >
                  {category} ({count})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recipes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Receitas
          </CardTitle>
          <CardDescription>
            Clique em uma receita para gerar sua imagem individualmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {recipes.map((recipe) => {
                const needsImage = recipesNeedingImages.some(
                  (r) => r.id === recipe.id
                );
                const isGenerating = generating === recipe.id;

                return (
                  <div
                    key={recipe.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {recipe.photo_url ? (
                      <img
                        src={recipe.photo_url}
                        alt={recipe.title}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <ChefHat className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{recipe.title}</span>
                        {needsImage ? (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Precisa IA
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{recipe.category}</div>
                    </div>

                    <Button
                      size="sm"
                      variant={needsImage ? "default" : "outline"}
                      onClick={() => generateImage(recipe)}
                      disabled={isGenerating || batchGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
