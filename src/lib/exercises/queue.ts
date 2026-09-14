/** Fila com limite de execuções simultâneas. Uma falha não interrompe as demais. */

export type QueueResult<T> = { ok: true; value: T } | { ok: false; error: unknown };

export const runWithConcurrency = async <I, T>(
  items: I[],
  limit: number,
  worker: (item: I, index: number) => Promise<T>,
): Promise<QueueResult<T>[]> => {
  const max = Math.max(1, Math.floor(limit));
  const results: QueueResult<T>[] = new Array(items.length);
  let cursor = 0;

  const runner = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = { ok: true, value: await worker(items[index], index) };
      } catch (error) {
        results[index] = { ok: false, error };
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(max, items.length) }, runner));
  return results;
};

/** Concorrência padrão do importador de exercícios. */
export const IMPORT_CONCURRENCY = 3;
