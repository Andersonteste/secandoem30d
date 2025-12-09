import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Search, ChefHat, Clock, Users, Heart, Share2, Droplets, Cookie, Salad, Coffee, UtensilsCrossed, Leaf, Fish } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  title: string;
  category: string;
  ingredients: any;
  steps: string;
  photo_url: string;
  prep_time_min?: number;
  servings?: number;
  calories?: number;
  difficulty?: string;
  description?: string;
}

const categoryFilters = ["Tudo", "Cafe", "Almoco", "Jantar", "Lanche", "Sucos", "Chás", "Doces", "Salgados"];

const categoryLabels: Record<string, string> = {
  "Cafe": "Café da manhã",
  "Almoco": "Almoço",
  "Jantar": "Jantar",
  "Lanche": "Lanches",
  "Sucos": "Sucos",
  "Chás": "Chás",
  "Doces": "Doces",
  "Salgados": "Salgados",
};

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    "Cafe": Coffee,
    "Almoco": UtensilsCrossed,
    "Jantar": UtensilsCrossed,
    "Lanche": Cookie,
    "Sucos": Droplets,
    "Chás": Leaf,
    "Doces": Cookie,
    "Salgados": Fish,
  };
  return iconMap[category] || Salad;
};

const Refeicoes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Tudo");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);

    const [recipesRes, favoritesRes] = await Promise.all([
      supabase.from("recipes").select("*").order("title"),
      user ? supabase.from("user_favorite_recipes").select("recipe_id").eq("user_id", user.id) : Promise.resolve({ data: [] })
    ]);

    if (recipesRes.data) {
      setRecipes(recipesRes.data);
    }
    if (favoritesRes.data) {
      setFavorites(new Set(favoritesRes.data.map((f: any) => f.recipe_id)));
    }
    setLoading(false);
  };

  const toggleFavorite = async (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userId) {
      toast({
        title: "Faça login",
        description: "Entre na sua conta para salvar favoritos",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = favorites.has(recipeId);
    
    if (isFavorite) {
      await supabase
        .from("user_favorite_recipes")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", recipeId);
      
      setFavorites(prev => {
        const next = new Set(prev);
        next.delete(recipeId);
        return next;
      });
      
      toast({ title: "Removido dos favoritos" });
    } else {
      await supabase
        .from("user_favorite_recipes")
        .insert({ user_id: userId, recipe_id: recipeId });
      
      setFavorites(prev => new Set(prev).add(recipeId));
      
      toast({ title: "Adicionado aos favoritos", description: "Receita salva com sucesso!" });
    }
  };

  const shareRecipe = async (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareData = {
      title: recipe.title,
      text: `Confira esta receita: ${recipe.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${recipe.title} - ${window.location.href}`);
      toast({ title: "Link copiado!", description: "Compartilhe onde quiser" });
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase()) ||
      recipe.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Tudo" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const RecipeSkeleton = () => (
    <Card className="p-3">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-glow">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <ChefHat className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Receitas Saudáveis</h1>
              <p className="text-sm opacity-90">
                {recipes.length} receitas nutritivas para sua jornada
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar receitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categoryFilters.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap ${selectedCategory === category ? "bg-gradient-primary text-primary-foreground" : ""}`}
              >
                {category === "Tudo" ? "Tudo" : categoryLabels[category] || category}
              </Button>
            ))}
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-muted-foreground">
              {filteredRecipes.length} {filteredRecipes.length === 1 ? "receita encontrada" : "receitas encontradas"}
            </p>
          )}
        </div>

        {/* Recipe List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <RecipeSkeleton key={i} />)}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Nenhuma receita encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">Tente buscar por outro termo</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRecipes.map((recipe) => {
              const IconComponent = getCategoryIcon(recipe.category);
              const isFavorite = favorites.has(recipe.id);
              
              return (
                <Card 
                  key={recipe.id} 
                  className="hover:shadow-glow transition-all cursor-pointer overflow-hidden group"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="flex items-center gap-4 p-3">
                    {recipe.photo_url ? (
                      <img 
                        src={recipe.photo_url} 
                        alt={recipe.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                        <IconComponent className="h-7 w-7" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate">{recipe.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {recipe.category && (
                          <Badge variant="outline" className="border-primary/30 text-xs">
                            {recipe.category}
                          </Badge>
                        )}
                        {recipe.prep_time_min && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recipe.prep_time_min}min
                          </span>
                        )}
                        {recipe.calories && (
                          <span className="text-xs text-muted-foreground">
                            {recipe.calories} kcal
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={(e) => toggleFavorite(recipe.id, e)}
                      >
                        <Heart 
                          className={`h-5 w-5 transition-colors ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} 
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={(e) => shareRecipe(recipe, e)}
                      >
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{selectedRecipe?.title}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {selectedRecipe?.description || selectedRecipe?.category || "Receita saudável"}
                </DialogDescription>
              </div>
              {selectedRecipe && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={(e) => toggleFavorite(selectedRecipe.id, e)}
                >
                  <Heart 
                    className={`h-6 w-6 ${favorites.has(selectedRecipe.id) ? "fill-destructive text-destructive" : ""}`} 
                  />
                </Button>
              )}
            </div>
          </DialogHeader>
          
          {selectedRecipe && (
            <>
              {selectedRecipe.photo_url ? (
                <img 
                  src={selectedRecipe.photo_url} 
                  alt={selectedRecipe.title}
                  className="w-full h-52 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {(() => {
                    const IconComponent = getCategoryIcon(selectedRecipe.category);
                    return <IconComponent className="h-16 w-16 text-primary/50" />;
                  })()}
                </div>
              )}

              <div className="space-y-6 mt-4">
                {/* Info badges - only show if data exists */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {selectedRecipe.prep_time_min && (
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{selectedRecipe.prep_time_min} min</span>
                    </div>
                  )}
                  {selectedRecipe.servings && (
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{selectedRecipe.servings} porções</span>
                    </div>
                  )}
                  {selectedRecipe.difficulty && (
                    <Badge variant="secondary">{selectedRecipe.difficulty}</Badge>
                  )}
                </div>

                {/* Calories - only show if exists */}
                {selectedRecipe.calories && (
                  <div className="text-center py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl">
                    <div className="text-4xl font-bold text-primary">{selectedRecipe.calories}</div>
                    <div className="text-xs text-muted-foreground">calorias por porção</div>
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Ingredientes
                  </h3>
                  <ul className="space-y-2 bg-muted/30 p-4 rounded-xl">
                    {Array.isArray(selectedRecipe.ingredients) && selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Steps */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Modo de Preparo
                  </h3>
                  <ol className="space-y-4">
                    {selectedRecipe.steps?.split('\n').filter(step => step.trim()).map((step: string, index: number) => (
                      <li key={index} className="flex gap-4 text-sm">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="flex-1 pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Share button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => shareRecipe(selectedRecipe, e)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar Receita
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Refeicoes;