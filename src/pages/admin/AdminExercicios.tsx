import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminGate } from "@/components/AdminGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, CheckCircle2, Copy, FolderOpen, Loader2, RefreshCw, Trash2, XCircle, Clock,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { filenameToExerciseName, folderHintFromPath, slugify } from "@/lib/exercises/normalize";
import { fileSha256 } from "@/lib/exercises/hash";
import { fallbackThumbnail, generateVideoThumbnail } from "@/lib/exercises/thumbnail";
import { IMPORT_CONCURRENCY, runWithConcurrency } from "@/lib/exercises/queue";
import { planImport } from "@/lib/exercises/plan";
import {
  findByContentHash, findBySlug, insertExercise, listSlugsLike,
  removeUploadedFiles, uploadThumbnail, uploadVideo,
} from "@/lib/exercises/repository";

type ItemStatus = "waiting" | "processing" | "done" | "duplicate" | "failed";

type ImportItem = {
  key: string;
  file: File;
  name: string;
  folderHint: string | null;
  status: ItemStatus;
  progress: number;
  message?: string;
  warning?: string;
  slug?: string;
};

const STATUS_LABEL: Record<ItemStatus, string> = {
  waiting: "Aguardando",
  processing: "Processando",
  done: "Concluído",
  duplicate: "Duplicado",
  failed: "Falhou",
};

const StatusBadge = ({ status }: { status: ItemStatus }) => {
  const icon = {
    waiting: <Clock className="h-3 w-3" />,
    processing: <Loader2 className="h-3 w-3 animate-spin" />,
    done: <CheckCircle2 className="h-3 w-3" />,
    duplicate: <Copy className="h-3 w-3" />,
    failed: <XCircle className="h-3 w-3" />,
  }[status];

  const variant =
    status === "failed" ? "destructive" : status === "done" ? "default" : "secondary";

  return (
    <Badge variant={variant} className="gap-1 shrink-0">
      {icon}
      {STATUS_LABEL[status]}
    </Badge>
  );
};

const AdminExerciciosContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ImportItem[]>([]);
  const [running, setRunning] = useState(false);

  const summary = useMemo(() => {
    const count = (s: ItemStatus) => items.filter((i) => i.status === s).length;
    return {
      total: items.length,
      done: count("done"),
      duplicate: count("duplicate"),
      failed: count("failed"),
      waiting: count("waiting"),
      processing: count("processing"),
    };
  }, [items]);

  const overall = items.length
    ? Math.round(items.reduce((acc, i) => acc + i.progress, 0) / items.length)
    : 0;

  const patch = useCallback((key: string, data: Partial<ImportItem>) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...data } : i)));
  }, []);

  const onSelect = (files: FileList | null) => {
    if (!files?.length) return;
    const accepted: ImportItem[] = [];
    let rejected = 0;

    Array.from(files).forEach((file) => {
      const isMp4 = file.type === "video/mp4" && file.size > 0;
      if (!isMp4) {
        rejected += 1;
        return;
      }
      const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
      accepted.push({
        key: `${relativePath || file.name}-${file.size}-${file.lastModified}`,
        file,
        name: filenameToExerciseName(file.name),
        folderHint: folderHintFromPath(relativePath),
        status: "waiting",
        progress: 0,
      });
    });

    setItems((prev) => {
      const seen = new Set(prev.map((i) => i.key));
      return [...prev, ...accepted.filter((i) => !seen.has(i.key))];
    });

    if (rejected) {
      toast({
        title: "Alguns arquivos foram ignorados",
        description: `${rejected} arquivo(s) não são vídeos MP4 válidos.`,
      });
    }
  };

  const processItem = async (item: ImportItem, takenSlugs: Set<string>) => {
    patch(item.key, { status: "processing", progress: 5, message: undefined, warning: undefined });

    const contentHash = await fileSha256(item.file);
    patch(item.key, { progress: 20 });

    const base = slugify(item.name) || "exercicio";
    const [byHash, bySlug, dbSlugs] = await Promise.all([
      findByContentHash(contentHash),
      findBySlug(base),
      listSlugsLike(base),
    ]);
    dbSlugs.forEach((s) => takenSlugs.add(s));

    const plan = planImport({
      name: item.name,
      contentHash,
      byHash,
      bySlug,
      takenSlugs,
    });

    if (plan.action === "duplicate") {
      patch(item.key, {
        status: "duplicate",
        progress: 100,
        slug: plan.existing.slug,
        message: `Já cadastrado como "${plan.existing.name}".`,
      });
      return;
    }

    takenSlugs.add(plan.slug);
    const id = crypto.randomUUID();

    let thumbnail: Blob | null = null;
    let warning: string | undefined;
    try {
      thumbnail = await generateVideoThumbnail(item.file);
    } catch {
      warning = "Não foi possível gerar a capa do vídeo; usamos uma capa padrão.";
      try {
        thumbnail = await fallbackThumbnail();
      } catch {
        thumbnail = null;
      }
    }
    patch(item.key, { progress: 40, warning });

    const videoPath = await uploadVideo(id, item.file);
    patch(item.key, { progress: 75 });

    let thumbnailPath: string | null = null;
    if (thumbnail) {
      try {
        thumbnailPath = await uploadThumbnail(id, thumbnail);
      } catch {
        warning = "A capa não pôde ser enviada; o exercício ficou sem capa.";
        patch(item.key, { warning });
      }
    }
    patch(item.key, { progress: 90 });

    try {
      await insertExercise({
        id,
        name: item.name,
        slug: plan.slug,
        original_filename: item.file.name,
        video_path: videoPath,
        thumbnail_path: thumbnailPath,
        content_hash: contentHash,
        equipment: item.folderHint ? [item.folderHint] : [],
        instructions: null,
      });
    } catch (error) {
      // Evita arquivos órfãos quando o cadastro falha.
      await removeUploadedFiles(id);
      throw error;
    }

    patch(item.key, {
      status: "done",
      progress: 100,
      slug: plan.slug,
      message: plan.needsReview
        ? "Nome parecido já existia: sinalizado para revisão."
        : "Aguardando revisão do personal.",
      warning,
    });
  };

  const run = async (target: ImportItem[]) => {
    if (!target.length || running) return;
    setRunning(true);
    const takenSlugs = new Set<string>(items.map((i) => i.slug).filter(Boolean) as string[]);

    const results = await runWithConcurrency(target, IMPORT_CONCURRENCY, async (item) => {
      try {
        await processItem(item, takenSlugs);
      } catch (error: any) {
        patch(item.key, {
          status: "failed",
          progress: 100,
          message: error?.message ?? "Falha inesperada.",
        });
        throw error;
      }
    });

    setRunning(false);
    const failed = results.filter((r) => !r.ok).length;
    toast({
      title: "Importação finalizada",
      description: failed
        ? `${target.length - failed} enviado(s), ${failed} com falha.`
        : `${target.length} arquivo(s) processado(s).`,
      variant: failed ? "destructive" : undefined,
    });
  };

  const retryFailed = () => {
    const failed = items.filter((i) => i.status === "failed");
    setItems((prev) =>
      prev.map((i) =>
        i.status === "failed" ? { ...i, status: "waiting", progress: 0, message: undefined } : i,
      ),
    );
    run(failed);
  };

  const clearDone = () =>
    setItems((prev) => prev.filter((i) => i.status !== "done" && i.status !== "duplicate"));

  const pending = items.filter((i) => i.status === "waiting");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Painel
          </Button>
          <p className="font-bold">{BRAND.name} · Exercícios</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Importar vídeos de exercícios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione a pasta com os vídeos MP4. Cada vídeo entra na biblioteca aguardando sua
              revisão — nada é publicado automaticamente.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="video/mp4"
              multiple
              className="hidden"
              // @ts-expect-error atributos de seleção de pasta
              webkitdirectory=""
              directory=""
              onChange={(e) => {
                onSelect(e.target.files);
                e.target.value = "";
              }}
            />

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => inputRef.current?.click()} disabled={running}>
                <FolderOpen className="h-4 w-4 mr-2" /> Selecionar pasta de vídeos
              </Button>
              <Button onClick={() => run(pending)} disabled={running || !pending.length}>
                {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Enviar {pending.length ? `(${pending.length})` : ""}
              </Button>
              <Button variant="outline" onClick={retryFailed} disabled={running || !summary.failed}>
                <RefreshCw className="h-4 w-4 mr-2" /> Repetir falhas
              </Button>
              <Button
                variant="outline"
                onClick={clearDone}
                disabled={running || !(summary.done + summary.duplicate)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Limpar concluídos
              </Button>
            </div>

            {items.length > 0 && (
              <div className="space-y-2">
                <Progress value={overall} />
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Total: {summary.total}</span>
                  <span>· Concluídos: {summary.done}</span>
                  <span>· Duplicados: {summary.duplicate}</span>
                  <span>· Falhas: {summary.failed}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.key}>
              <CardContent className="py-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.file.name}
                      {item.folderHint ? ` · sugestão: ${item.folderHint}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <Progress value={item.progress} className="h-1.5" />
                {item.message && (
                  <p className="text-xs text-muted-foreground">{item.message}</p>
                )}
                {item.warning && <p className="text-xs text-amber-500">{item.warning}</p>}
              </CardContent>
            </Card>
          ))}
          {!items.length && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum vídeo selecionado ainda.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

const AdminExercicios = () => (
  <AdminGate>
    <AdminExerciciosContent />
  </AdminGate>
);

export default AdminExercicios;
