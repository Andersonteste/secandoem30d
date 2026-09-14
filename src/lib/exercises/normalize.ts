/** Utilitários de normalização de nomes e slugs da biblioteca de exercícios. */

/** Remove a extensão do arquivo, preservando pontos internos do nome. */
export const stripExtension = (filename: string): string =>
  filename.replace(/\.[^./\\]+$/, "");

/** Remove acentuação mantendo as letras base. */
export const removeDiacritics = (value: string): string =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * Converte o nome do arquivo em um nome legível.
 * "agachamento-livre.mp4" -> "Agachamento livre"
 */
export const filenameToExerciseName = (filename: string): string => {
  const base = stripExtension(filename)
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!base) return "";
  const lower = base.toLocaleLowerCase("pt-BR");
  return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
};

/** Gera slug sem acentos, espaços ou caracteres especiais. */
export const slugify = (value: string): string =>
  removeDiacritics(stripExtension(value))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

/** Gera um slug livre a partir dos slugs já utilizados, adicionando sufixo numérico. */
export const uniqueSlug = (base: string, taken: Iterable<string>): string => {
  const used = new Set(taken);
  const root = slugify(base) || "exercicio";
  if (!used.has(root)) return root;
  let i = 2;
  while (used.has(`${root}-${i}`)) i += 1;
  return `${root}-${i}`;
};

/** Pastas aceitas como sugestão de equipamento/categoria. */
export const FOLDER_EQUIPMENT_HINTS = [
  "peso-corporal",
  "halteres",
  "barras-e-anilhas",
  "maquinas-e-cabos",
  "elasticos",
  "cardio",
  "mobilidade-e-alongamento",
] as const;

export type FolderHint = (typeof FOLDER_EQUIPMENT_HINTS)[number];

/**
 * Lê o caminho relativo do arquivo (webkitRelativePath) e devolve a pasta
 * reconhecida como sugestão de equipamento, se houver.
 */
export const folderHintFromPath = (relativePath?: string): FolderHint | null => {
  if (!relativePath) return null;
  const parts = relativePath.split("/").slice(0, -1).map((p) => slugify(p));
  for (const part of parts.reverse()) {
    const match = FOLDER_EQUIPMENT_HINTS.find((h) => h === part);
    if (match) return match;
  }
  return null;
};
