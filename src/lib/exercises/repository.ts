/** Operações no Cloud (banco e armazenamento) usadas pelo importador de exercícios. */
import { supabase } from "@/integrations/supabase/client";

export const VIDEO_BUCKET = "exercise-videos";
export const THUMB_BUCKET = "exercise-thumbnails";

export const videoObjectPath = (id: string) => `exercises/${id}/v1/demo.mp4`;
export const thumbObjectPath = (id: string) => `exercises/${id}/cover.webp`;

const db = supabase as any;

export type ExistingExercise = {
  id: string;
  slug: string;
  name: string;
  content_hash: string | null;
};

/** Busca um exercício já cadastrado com o mesmo conteúdo. */
export const findByContentHash = async (hash: string): Promise<ExistingExercise | null> => {
  const { data, error } = await db
    .from("exercises")
    .select("id, slug, name, content_hash")
    .eq("content_hash", hash)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ExistingExercise) ?? null;
};

/** Busca um exercício já cadastrado com o mesmo slug. */
export const findBySlug = async (slug: string): Promise<ExistingExercise | null> => {
  const { data, error } = await db
    .from("exercises")
    .select("id, slug, name, content_hash")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ExistingExercise) ?? null;
};

/** Slugs existentes que começam com a raiz informada (para gerar sufixo numérico). */
export const listSlugsLike = async (root: string): Promise<string[]> => {
  const { data, error } = await db
    .from("exercises")
    .select("slug")
    .like("slug", `${root}%`);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { slug: string }) => r.slug);
};

export const uploadVideo = async (id: string, file: Blob) => {
  const path = videoObjectPath(id);
  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(path, file, { contentType: "video/mp4", upsert: false });
  if (error) throw new Error(error.message);
  return path;
};

export const uploadThumbnail = async (id: string, file: Blob) => {
  const path = thumbObjectPath(id);
  const { error } = await supabase.storage
    .from(THUMB_BUCKET)
    .upload(path, file, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(error.message);
  return path;
};

/** Remove arquivos enviados para não deixar itens órfãos. */
export const removeUploadedFiles = async (id: string) => {
  await Promise.allSettled([
    supabase.storage.from(VIDEO_BUCKET).remove([videoObjectPath(id)]),
    supabase.storage.from(THUMB_BUCKET).remove([thumbObjectPath(id)]),
  ]);
};

export type ExerciseInsert = {
  id: string;
  name: string;
  slug: string;
  original_filename: string;
  video_path: string;
  thumbnail_path: string | null;
  content_hash: string;
  equipment: string[];
  instructions: string | null;
};

export const insertExercise = async (payload: ExerciseInsert) => {
  const { error } = await db.from("exercises").insert({
    ...payload,
    review_status: "pending_review",
    is_active: true,
  });
  if (error) throw new Error(error.message);
};
