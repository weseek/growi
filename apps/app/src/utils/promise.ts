/**
 * Divide arrays into batches, and apply a given function to each batch by using Promise.all
 * Use when memory consumption can be too large by using simple Promise.all
 * @param items array to process
 * @param limit batch size
 * @param fn function to apply on each item
 * @returns result of fn applied to each item
 */
export const batchProcessPromiseAll = async<I, O>(
  items: Array<I>,
  limit: number,
  fn: (item: I, index?: number, array?: Array<I>) => Promise<O>,
): Promise<O[]> => {
  let results: O[] = [];
  for (let start = 0; start < items.length; start += limit) {
    const end = Math.min(start + limit, items.length);

    // eslint-disable-next-line no-await-in-loop
    const slicedResults = await Promise.all(items.slice(start, end).map(fn));

    results = results.concat(slicedResults);
  }

  return results;
};
