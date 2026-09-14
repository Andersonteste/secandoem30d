import { describe, expect, it } from "vitest";
import { IMPORT_CONCURRENCY, runWithConcurrency } from "../queue";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("fila de importação", () => {
  it("nunca processa mais de três arquivos ao mesmo tempo", async () => {
    let active = 0;
    let peak = 0;
    const items = Array.from({ length: 12 }, (_, i) => i);

    await runWithConcurrency(items, IMPORT_CONCURRENCY, async () => {
      active += 1;
      peak = Math.max(peak, active);
      await sleep(10);
      active -= 1;
    });

    expect(IMPORT_CONCURRENCY).toBe(3);
    expect(peak).toBe(3);
  });

  it("uma falha não interrompe os demais itens", async () => {
    const results = await runWithConcurrency([1, 2, 3, 4], 3, async (n) => {
      if (n === 2) throw new Error("falhou");
      return n * 10;
    });

    expect(results.map((r) => r.ok)).toEqual([true, false, true, true]);
    expect(results.filter((r) => r.ok).length).toBe(3);
  });

  it("mantém a ordem dos resultados", async () => {
    const results = await runWithConcurrency([3, 1, 2], 3, async (n) => {
      await sleep(n * 5);
      return n;
    });
    expect(results.map((r) => (r.ok ? r.value : null))).toEqual([3, 1, 2]);
  });
});
