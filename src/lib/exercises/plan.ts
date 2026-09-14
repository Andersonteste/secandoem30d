/** Decisão de importação de cada arquivo: duplicado, novo ou renomeado para revisão. */
import type { ExistingExercise } from "./repository";
import { slugify, uniqueSlug } from "./normalize";

export type ImportPlan =
  | { action: "duplicate"; existing: ExistingExercise }
  | { action: "create"; slug: string; needsReview: boolean };

export type PlanInput = {
  /** Nome legível do exercício. */
  name: string;
  /** SHA-256 do conteúdo do arquivo. */
  contentHash: string;
  /** Exercício já cadastrado com o mesmo conteúdo, se houver. */
  byHash: ExistingExercise | null;
  /** Exercício já cadastrado com o mesmo slug, se houver. */
  bySlug: ExistingExercise | null;
  /** Slugs já utilizados (banco + itens desta importação). */
  takenSlugs: Iterable<string>;
};

export const planImport = ({
  name,
  contentHash,
  byHash,
  bySlug,
  takenSlugs,
}: PlanInput): ImportPlan => {
  // Mesmo conteúdo já enviado: não envia novamente.
  if (byHash) return { action: "duplicate", existing: byHash };

  const base = slugify(name);

  // Nome já existe com conteúdo diferente: não sobrescreve, gera sufixo e sinaliza revisão.
  if (bySlug && bySlug.content_hash !== contentHash) {
    return { action: "create", slug: uniqueSlug(base, takenSlugs), needsReview: true };
  }

  const slug = uniqueSlug(base, takenSlugs);
  return { action: "create", slug, needsReview: slug !== base };
};
