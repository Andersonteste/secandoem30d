import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLink, ShoppingBag, Star, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  nome: string;
  descricao: string | null;
  imagem_url: string | null;
  preco_exibicao: string | null;
  link_afiliado: string;
  categoria: string;
  destaque: boolean;
  ordem: number;
}

const Loja = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();

  const categories = [
    { value: "todos", label: "Todos" },
    { value: "suplementos", label: "Suplementos" },
    { value: "equipamentos", label: "Equipamentos" },
    { value: "roupas", label: "Roupas" },
    { value: "acessorios", label: "Acessórios" },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos_loja')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackAndOpenProduct = async (product: Product) => {
    try {
      // Track the click
      await supabase.functions.invoke('track-affiliate-click', {
        body: { produto_id: product.id }
      });
    } catch (error) {
      console.error('Error tracking click:', error);
      // Continue even if tracking fails
    }

    // Open affiliate link in new tab
    window.open(product.link_afiliado, '_blank');
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "todos" || product.categoria === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      product.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredProducts = products.filter(p => p.destaque);

  return (
    <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Loja de Produtos
          </h1>
          <p className="text-muted-foreground">
            Produtos recomendados para sua jornada fitness
          </p>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-primary fill-primary" />
              Produtos em Destaque
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all border-primary/20">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {product.imagem_url ? (
                      <img 
                        src={product.imagem_url} 
                        alt={product.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-primary">
                      Destaque
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>{product.nome}</CardTitle>
                    {product.preco_exibicao && (
                      <div className="text-2xl font-bold text-primary">
                        {product.preco_exibicao}
                      </div>
                    )}
                    {product.descricao && (
                      <CardDescription>{product.descricao}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full bg-gradient-primary hover:opacity-90"
                      onClick={() => trackAndOpenProduct(product)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver Produto
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Category Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="inline-flex h-auto flex-wrap justify-start gap-1 w-full">
              {categories.map(cat => (
                <TabsTrigger key={cat.value} value={cat.value} className="flex-shrink-0">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              Não há produtos nesta categoria ainda. Volte em breve!
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {product.imagem_url ? (
                    <img 
                      src={product.imagem_url} 
                      alt={product.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{product.nome}</CardTitle>
                  {product.preco_exibicao && (
                    <div className="text-xl font-bold text-primary">
                      {product.preco_exibicao}
                    </div>
                  )}
                  {product.descricao && (
                    <CardDescription className="line-clamp-2">
                      {product.descricao}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => trackAndOpenProduct(product)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver Produto
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Loja;
