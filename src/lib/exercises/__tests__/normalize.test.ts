import { describe, expect, it } from "vitest";
import {
  filenameToExerciseName,
  folderHintFromPath,
  slugify,
  stripExtension,
  uniqueSlug,
} from "../normalize";

describe("normalização de nomes", () => {
  it("remove a extensão do arquivo", () => {
    expect(stripExtension("agachamento-livre.mp4")).toBe("agachamento-livre");
    expect(stripExtension("supino.reto.v2.mp4")).toBe("supino.reto.v2");
  });

  it("transforma agachamento-livre.mp4 em 'Agachamento livre'", () => {
    expect(filenameToExerciseName("agachamento-livre.mp4")).toBe("Agachamento livre");
    expect(filenameToExerciseName("ROSCA_DIRETA.mp4")).toBe("Rosca direta");
    expect(filenameToExerciseName("elevacao   pelvica.MP4")).toBe("Elevacao pelvica");
  });

  it("gera slug sem acentos, espaços ou caracteres especiais", () => {
    expect(slugify("Elevação Pélvica (unilateral).mp4")).toBe("elevacao-pelvica-unilateral");
    expect(slugify("  Remada   Curvada!! ")).toBe("remada-curvada");
    expect(slugify("Flexão de braço — joelhos")).toBe("flexao-de-braco-joelhos");
  });

  it("adiciona sufixo numérico quando o slug já existe", () => {
    expect(uniqueSlug("agachamento livre", [])).toBe("agachamento-livre");
    expect(uniqueSlug("agachamento livre", ["agachamento-livre"])).toBe("agachamento-livre-2");
    expect(
      uniqueSlug("agachamento livre", ["agachamento-livre", "agachamento-livre-2"]),
    ).toBe("agachamento-livre-3");
  });

  it("usa a pasta apenas como sugestão de equipamento", () => {
    expect(folderHintFromPath("videos/halteres/rosca.mp4")).toBe("halteres");
    expect(folderHintFromPath("Máquinas e Cabos/puxada.mp4")).toBe("maquinas-e-cabos");
    expect(folderHintFromPath("pasta-qualquer/rosca.mp4")).toBeNull();
    expect(folderHintFromPath(undefined)).toBeNull();
  });
});
