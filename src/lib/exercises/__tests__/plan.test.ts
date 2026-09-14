import { describe, expect, it } from "vitest";
import { planImport } from "../plan";

const existing = (slug: string, hash: string | null) => ({
  id: "id-" + slug,
  slug,
  name: slug,
  content_hash: hash,
});

describe("prevenção de duplicidade", () => {
  it("marca como duplicado quando o conteúdo já existe", () => {
    const plan = planImport({
      name: "Agachamento livre",
      contentHash: "abc",
      byHash: existing("agachamento-livre", "abc"),
      bySlug: null,
      takenSlugs: [],
    });
    expect(plan.action).toBe("duplicate");
  });

  it("não sobrescreve nome existente com conteúdo diferente; gera sufixo e sinaliza revisão", () => {
    const plan = planImport({
      name: "Agachamento livre",
      contentHash: "novo",
      byHash: null,
      bySlug: existing("agachamento-livre", "antigo"),
      takenSlugs: ["agachamento-livre"],
    });
    expect(plan).toEqual({ action: "create", slug: "agachamento-livre-2", needsReview: true });
  });

  it("cria normalmente quando não há conflito", () => {
    const plan = planImport({
      name: "Remada curvada",
      contentHash: "hash",
      byHash: null,
      bySlug: null,
      takenSlugs: [],
    });
    expect(plan).toEqual({ action: "create", slug: "remada-curvada", needsReview: false });
  });

  it("evita colisão entre arquivos do mesmo lote", () => {
    const taken = new Set<string>(["remada-curvada"]);
    const plan = planImport({
      name: "Remada Curvada",
      contentHash: "outro",
      byHash: null,
      bySlug: null,
      takenSlugs: taken,
    });
    expect(plan).toEqual({ action: "create", slug: "remada-curvada-2", needsReview: true });
  });
});
