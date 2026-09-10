import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "tags" | "date";

export type Field = {
  key: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
};

type Props = {
  table: string;
  title: string;
  description?: string;
  fields: Field[];
  listFields?: string[];
  orderBy?: { column: string; ascending?: boolean };
  defaults?: Record<string, any>;
  readOnly?: boolean;
};

const db = supabase as any;

export const ResourceManager = ({
  table, title, description, fields, listFields, orderBy, defaults, readOnly,
}: Props) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = db.from(table).select("*");
    if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    const { data, error } = await q.limit(500);
    if (error) toast({ variant: "destructive", title: "Erro ao carregar", description: error.message });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [table]);

  const save = async () => {
    setSaving(true);
    const payload: any = { ...defaults };
    fields.forEach((f) => {
      let v = editing?.[f.key];
      if (f.type === "number") v = v === "" || v == null ? null : Number(v);
      if (f.type === "boolean") v = !!v;
      if (f.type === "tags") {
        v = typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v ?? null;
      }
      if (v === "") v = null;
      payload[f.key] = v;
    });

    const isNew = !editing?.id;
    const res = isNew
      ? await db.from(table).insert(payload)
      : await db.from(table).update(payload).eq("id", editing.id);

    setSaving(false);
    if (res.error) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: res.error.message });
      return;
    }
    toast({ title: isNew ? "Registro criado" : "Registro atualizado" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await db.from(table).delete().eq("id", id);
    if (error) return toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
    toast({ title: "Registro excluído" });
    load();
  };

  const cols = listFields ?? fields.slice(0, 3).map((f) => f.key);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {!readOnly && (
          <Button onClick={() => setEditing({ ...defaults })}>
            <Plus className="h-4 w-4 mr-1" /> Novo
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Nenhum registro.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id ?? r.key}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  {cols.map((c) => (
                    <p key={c} className="text-sm truncate">
                      <span className="text-muted-foreground">{fields.find((f) => f.key === c)?.label ?? c}: </span>
                      {typeof r[c] === "boolean" ? (r[c] ? "sim" : "não") : Array.isArray(r[c]) ? r[c].join(", ") : String(r[c] ?? "—")}
                    </p>
                  ))}
                  {"active" in r && <Badge variant={r.active ? "default" : "secondary"}>{r.active ? "ativo" : "inativo"}</Badge>}
                  {"status" in r && r.status && <Badge variant="secondary">{r.status}</Badge>}
                </div>
                {!readOnly && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar" : "Novo"} — {title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {fields.map((f) => {
              const value = editing?.[f.key];
              return (
                <div key={f.key} className="space-y-1.5">
                  <Label>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea rows={4} value={value ?? ""} placeholder={f.placeholder}
                      onChange={(e) => setEditing((p: any) => ({ ...p, [f.key]: e.target.value }))} />
                  ) : f.type === "boolean" ? (
                    <div className="pt-1">
                      <Switch checked={!!value} onCheckedChange={(v) => setEditing((p: any) => ({ ...p, [f.key]: v }))} />
                    </div>
                  ) : f.type === "select" ? (
                    <div className="flex flex-wrap gap-2">
                      {(f.options ?? []).map((o) => (
                        <Button key={o.value} type="button" size="sm"
                          variant={value === o.value ? "default" : "outline"}
                          onClick={() => setEditing((p: any) => ({ ...p, [f.key]: o.value }))}>
                          {o.label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={Array.isArray(value) ? value.join(", ") : value ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setEditing((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    />
                  )}
                  {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
                </div>
              );
            })}
            <Button className="w-full" onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
