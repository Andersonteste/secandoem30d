import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode, RefreshCw, Plus } from "lucide-react";

const db = supabase as any;
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

export const AdminWhatsApp = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ label: "", base_url: "", instance_name: "" });

  const load = async () => {
    const { data } = await db.from("whatsapp_instances").select("*").order("created_at", { ascending: false });
    setInstances(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const webhookUrl = `https://${PROJECT_ID}.supabase.co/functions/v1/evolution-webhook`;

  const create = async () => {
    if (!form.label || !form.base_url || !form.instance_name) {
      return toast({ variant: "destructive", title: "Preencha todos os campos" });
    }
    setBusy(true);
    const { error } = await db.from("whatsapp_instances").insert({
      ...form, provider: "evolution", status: "disconnected", webhook_url: webhookUrl, active: true,
    });
    setBusy(false);
    if (error) return toast({ variant: "destructive", title: "Erro", description: error.message });
    setForm({ label: "", base_url: "", instance_name: "" });
    load();
  };

  const connect = async (id: string) => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("evolution-connect", { body: { instance_id: id } });
    setBusy(false);
    if (error) return toast({ variant: "destructive", title: "Falha ao conectar", description: error.message });
    toast({ title: "Conexão solicitada", description: (data as any)?.message ?? "Leia o QR Code para conectar." });
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Integrações — WhatsApp</h1>
        <p className="text-sm text-muted-foreground">Conexão via Evolution API. A chave da API fica guardada com segurança no servidor.</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <p className="font-semibold">Nova instância</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><Label>Nome interno</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Atendimento principal" /></div>
            <div><Label>URL da Evolution API</Label><Input value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} placeholder="https://api.seuservidor.com" /></div>
            <div><Label>Instância</Label><Input value={form.instance_name} onChange={(e) => setForm({ ...form, instance_name: e.target.value })} placeholder="secando-em-casa" /></div>
          </div>
          <Button onClick={create} disabled={busy}><Plus className="h-4 w-4 mr-1" /> Criar instância</Button>
          <p className="text-xs text-muted-foreground break-all">
            Webhook a configurar na Evolution API: {webhookUrl}
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : instances.map((i) => (
        <Card key={i.id}>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{i.label}</p>
                <p className="text-xs text-muted-foreground break-all">{i.base_url} · {i.instance_name}</p>
              </div>
              <Badge variant={i.status === "connected" ? "default" : "secondary"}>{i.status}</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => connect(i.id)} disabled={busy}>
                <QrCode className="h-4 w-4 mr-1" /> Gerar QR Code
              </Button>
              <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-1" /> Atualizar</Button>
            </div>
            {i.qr_code && (
              <img
                src={i.qr_code.startsWith("data:") ? i.qr_code : `data:image/png;base64,${i.qr_code}`}
                alt="QR Code do WhatsApp"
                className="h-56 w-56 rounded-lg border bg-white p-2"
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
