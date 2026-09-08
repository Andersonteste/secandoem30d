import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AccessGate } from "@/components/AccessGate";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Route as RouteIcon, ChevronLeft } from "lucide-react";

const JornadasContent = () => {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("journeys")
        .select("*")
        .eq("active", true)
        .order("order_num", { ascending: true });
      setJourneys(data ?? []);
      setLoading(false);
    })();
  }, []);

  const open = async (j: any) => {
    setSelected(j);
    const { data } = await supabase
      .from("journey_days")
      .select("*")
      .eq("journey_id", j.id)
      .order("day_num", { ascending: true });
    setDays(data ?? []);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-20">
      <Navigation />
      <header className="bg-gradient-primary text-primary-foreground px-5 pt-8 pb-10 rounded-b-[2rem]">
        <h1 className="text-2xl font-bold">Jornadas</h1>
        <p className="text-sm opacity-90 mt-1">Programas guiados para cada momento da sua rotina.</p>
      </header>

      <main className="container mx-auto px-4 -mt-5 max-w-3xl space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : selected ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Todas as jornadas
            </Button>
            <Card>
              <CardContent className="p-5">
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
                <Badge className="mt-3">{selected.total_days} dias</Badge>
              </CardContent>
            </Card>
            {days.length === 0 ? (
              <Card><CardContent className="p-6 text-sm text-muted-foreground text-center">
                Os dias desta jornada ainda serão publicados.
              </CardContent></Card>
            ) : (
              <div className="space-y-2">
                {days.map((d) => (
                  <Card key={d.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {d.day_num}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{d.title ?? `Dia ${d.day_num}`}</p>
                          {d.focus && <p className="text-xs text-muted-foreground">{d.focus}</p>}
                        </div>
                      </div>
                      {d.task && <p className="text-sm mt-2">{d.task}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {journeys.map((j) => (
              <Card key={j.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => open(j)}>
                {j.cover_url && <img src={j.cover_url} alt={j.name} loading="lazy" className="h-32 w-full object-cover rounded-t-lg" />}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <RouteIcon className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold">{j.name}</h2>
                  </div>
                  {j.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{j.description}</p>}
                  <Badge variant="secondary" className="mt-3">{j.total_days} dias</Badge>
                </CardContent>
              </Card>
            ))}
            {journeys.length === 0 && (
              <Card><CardContent className="p-6 text-sm text-muted-foreground">Nenhuma jornada publicada.</CardContent></Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const Jornadas = () => (<AccessGate><JornadasContent /></AccessGate>);
export default Jornadas;
