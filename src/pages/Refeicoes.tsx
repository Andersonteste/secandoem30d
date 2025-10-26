import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Search, ChefHat, Clock, Users, Flame, Fish, Salad, Apple, Coffee, UtensilsCrossed, Cookie, Droplets, Leaf } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";

interface Recipe {
  id: string;
  title: string;
  category: string;
  ingredients: any;
  steps: string;
  photo_url: string;
}

const categoryFilters = ["Tudo", "Sucos", "Doces", "Saladas", "Shake", "Low carb", "Sopas", "Pizza's fit", "Chás", "Wrap's"];

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    "Sucos": Droplets,
    "Doces": Cookie,
    "Saladas": Salad,
    "Shake": Coffee,
    "Low carb": Leaf,
    "Sopas": UtensilsCrossed,
    "Pizza's fit": UtensilsCrossed,
    "Chás": Leaf,
    "Wrap's": Fish,
  };
  return iconMap[category] || Salad;
};

const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    "Sucos": "text-cyan-400",
    "Doces": "text-pink-400",
    "Saladas": "text-green-400",
    "Shake": "text-orange-400",
    "Low carb": "text-emerald-400",
    "Sopas": "text-amber-400",
    "Pizza's fit": "text-red-400",
    "Chás": "text-lime-400",
    "Wrap's": "text-blue-400",
  };
  return colorMap[category] || "text-primary";
};

const Refeicoes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Tudo");
  const navigate = useNavigate();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const { data } = await (supabase as any)
      .from("recipes")
      .select("*")
      .order("title");

    if (data) {
      setRecipes(data);
    }
    setLoading(false);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase()) ||
      recipe.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Tudo" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCalories = (recipe: Recipe) => {
    const calories = Math.floor(Math.random() * (500 - 150) + 150);
    return calories;
  };

  const getServings = () => Math.floor(Math.random() * 2) + 2;
  const getDuration = () => Math.floor(Math.random() * 30) + 15;

  return (
    <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-glow">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Receitas Saudáveis</h1>
              <p className="text-sm opacity-90">Receitas nutritivas para sua jornada</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar receitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categoryFilters.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-gradient-primary text-white" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse-glow inline-block">
              <ChefHat className="h-12 w-12 text-primary" />
            </div>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <Card className="p-12 text-center">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma receita encontrada</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRecipes.map((recipe) => {
              const calories = getCalories(recipe);
              const servings = getServings();
              const duration = getDuration();
              const IconComponent = getCategoryIcon(recipe.category);
              const iconColor = getCategoryColor(recipe.category);
              
              return (
                <Card 
                  key={recipe.id} 
                  className="hover:shadow-glow transition-all cursor-pointer overflow-hidden"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="flex items-center gap-4 p-3">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 ${iconColor}`}>
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate">{recipe.title}</h3>
                      {recipe.category && (
                        <Badge variant="outline" className="border-primary/20 text-xs">
                          {recipe.category}
                        </Badge>
                      )}
                    </div>
                    <ChefHat className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedRecipe?.title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Prato completo rico em ômega-3 e proteínas
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecipe && (
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${getCategoryColor(selectedRecipe.category)} bg-card/50 border-2 border-border`}>
              {(() => {
                const IconComponent = getCategoryIcon(selectedRecipe.category);
                return <IconComponent className="h-10 w-10" />;
              })()}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {getDuration()} min
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {getServings()} porções
              </span>
              <Badge variant="secondary">Médio</Badge>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{getCalories(selectedRecipe)}</div>
              <div className="text-xs text-muted-foreground">calorias por porção</div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Ingredientes</h3>
              <ul className="space-y-2">
                {Array.isArray(selectedRecipe?.ingredients) && selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Modo de Preparo</h3>
              <ol className="space-y-3">
                {selectedRecipe?.steps.split('\n').filter(step => step.trim()).map((step: string, index: number) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Refeicoes;
