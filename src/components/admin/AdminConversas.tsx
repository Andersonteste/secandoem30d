import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Send, UserCheck, Tag, StickyNote } from "lucide-react";

const db = supabase as any;
const STATUSES = [
  { value: "open", label: "Abertas" },
  { value: "waiting", label: "Aguardando atendimento" },
  { value: "closed", label: "Encerradas" },
];

export const AdminConversas = () => {
  const { toast } = useToast();
  const [convs, setConvs] = useState<any[]>([]);
  const [status, setStatus] = useState("open");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConvs = async () => {
    setLoading(true);
    const { data } = await db.from("conversations").select("*").eq("status", status)
      .order("last_message_at", { ascending: false, nullsFirst: false }).limit(200);
    setConvs(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadConvs(); /* eslint-disable-next-line */ }, [status]);

  const openConv = async (c: any) => {
    setSelected(c);
    const [m, n] = await Promise.all([
      db.from("messages").select("*").eq("conversation_id", c.id).order("created_at", { ascending: true }).limit(200),
      db.from("conversation_notes").select("*").eq("conversation_id", c.id).order("created_at", { ascending: false }),
    ]);
    setMessages(m.data ?? []);
    setNotes(n.data ?? []);
  };

  const send = async () => {
    if (!selected || !text.trim()) return;
    setSending(true);
    const { error } = await supabase.functions.invoke("whatsapp-send", {
      body: { conversation_id: selected.id, text },
    });
    setSending(false);
    if (error) return toast({ variant: "destructive", title: "Falha no envio", description: error.message });
    setText("");
    openConv(selected);
  };

  const patchConv = async (patch: any) => {
    if (!selected) return;
    const { error } = await db.from("conversations").update(patch).eq("id", selected.id);
    if (error) return toast({ variant: "destructive", title: "Erro", description: error.message });
    setSelected({ ...selected, ...patch });
    loadConvs();
  };

  const addNote = async () => {
    if (!selected || !note.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await db.from("conversation_notes").insert({
      conversation_id: selected.id, admin_id: user?.id, note,
    });
    if (error) return toast({ variant: "destructive", title: "Erro", description: error.message });
    setNote("");
    openConv(selected);
  };

  const filtered = convs.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.phone?.includes(q) || c.contact_name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Conversas</h1>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Button key={s.value} size="sm" variant={status === s.value ? "default" : "outline"} onClick={() => setStatus(s.value)}>
            {s.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar telefone ou nome" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {loading ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma conversa.</p>
          ) : filtered.map((c) => (
            <Card key={c.id} className={`cursor-pointer ${selected?.id === c.id ? "border-primary" : ""}`} onClick={() => openConv(c)}>
              <CardContent className="p-3">
                <p className="font-medium text-sm">{c.contact_name ?? c.phone}</p>
                <p className="text-xs text-muted-foreground">{c.phone} · {c.handled_by === "human" ? "humano" : "digital"}</p>
                {c.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {c.tags.map((t: string) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          {!selected ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
              Selecione uma conversa para ver o histórico.
            </CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div>
                    <p className="font-semibold">{selected.contact_name ?? selected.phone}</p>
                    <p className="text-xs text-muted-foreground">{selected.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => patchConv({ handled_by: "human", status: "open" })}>
                      <UserCheck className="h-4 w-4 mr-1" /> Assumir
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => patchConv({ status: "closed" })}>Encerrar</Button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 rounded-lg border p-3">
                  {messages.length === 0 && <p className="text-sm text-muted-foreground">Sem mensagens.</p>}
                  {messages.map((m) => (
                    <div key={m.id} className={`max-w-[80%] rounded-lg p-2 text-sm ${m.direction === "out" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input placeholder="Escreva uma mensagem..." value={text} onChange={(e) => setText(e.target.value)} />
                  <Button onClick={send} disabled={sending}><Send className="h-4 w-4" /></Button>
                </div>

                <div className="flex gap-2">
                  <Input placeholder="Adicionar tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
                  <Button variant="outline" onClick={() => {
                    if (!tagInput.trim()) return;
                    patchConv({ tags: [...(selected.tags ?? []), tagInput.trim()] });
                    setTagInput("");
                  }}><Tag className="h-4 w-4" /></Button>
                </div>

                <div className="space-y-2">
                  <Textarea rows={2} placeholder="Nota interna (não vai para o aluno)" value={note} onChange={(e) => setNote(e.target.value)} />
                  <Button size="sm" variant="outline" onClick={addNote}><StickyNote className="h-4 w-4 mr-1" /> Salvar nota</Button>
                  {notes.map((n) => (
                    <p key={n.id} className="text-xs text-muted-foreground border-l-2 pl-2">{n.note}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
