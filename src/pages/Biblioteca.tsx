import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AccessGate } from "@/components/AccessGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SkeletonBonusCard } from "@/components/ui/skeleton";
import { BookOpen, Search, FileText, Video, ExternalLink, Loader2 } from "lucide-react";

const TYPE_ICON: Record<string, any> = { pdf: FileText, video: Video, guia: BookOpen, aula: Video, lista: FileText };

const BibliotecaContent = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState<any>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("library_items")
        .select("*")
        .eq("active", true)
        .order("order_num", { ascending: true });
      setItems(data ?? []);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))],
    [items]
  );

  const filtered = items.filter((i) => {
    const okCat = category === "all" || i.category === category;
    const q = search.toLowerCase();
    const okSearch = !q || i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q);
    return okCat && okSearch;
  });

  const openItem = async (item: any) => {
    setOpen(item);
    setSignedUrl(null);
    if (item.file_path) {
      setUrlLoading(true);
      // Arquivos pagos ficam em armazenamento privado e usam URL temporária.
      const { data } = await supabase.storage.from("library").createSignedUrl(item.file_path, 60 * 30);
      setSignedUrl(data?.signedUrl ?? null);
      setUrlLoading(false);
    } else if (item.external_url) {
      setSignedUrl(item.external_url);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-20">
      <Navigation />
      <header className="bg-gradient-primary text-primary-foreground px-5 pt-8 pb-10 rounded-b-[2rem]">
        <h1 className="text-2xl font-bold">Biblioteca</h1>
        <p className="text-sm opacity-90 mt-1">Guias, aulas, listas e materiais do seu plano.</p>
      </header>

      <main className="container mx-auto px-4 -mt-5 max-w-5xl space-y-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar material..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <Button key={c} size="sm" variant={category === c ? "default" : "outline"} className="shrink-0" onClick={() => setCategory(c)}>
                  {c === "all" ? "Todos" : c}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <SkeletonBonusCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum material disponível ainda.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const Icon = TYPE_ICON[item.item_type] ?? BookOpen;
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openItem(item)}>
                  {item.cover_url && (
                    <img src={item.cover_url} alt={item.title} loading="lazy" className="h-36 w-full object-cover" />
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.category && <Badge variant="secondary">{item.category}</Badge>}
                    </div>
                    <h3 className="font-semibold leading-tight">{item.title}</h3>
                    {item.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pr-8">
            <DialogTitle>{open?.title}</DialogTitle>
          </DialogHeader>
          {open?.native_content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{open.native_content}</div>
          ) : urlLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : signedUrl ? (
            <Button asChild className="w-full">
              <a href={signedUrl} target="_blank" rel="noreferrer">
                Abrir material <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">{open?.description}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Biblioteca = () => (<AccessGate><BibliotecaContent /></AccessGate>);
export default Biblioteca;
