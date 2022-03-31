export type IPagingResult<T> = {
  items: T[],
  totalCount: number,
  limit: number,
  nextPage?: number,
  prevPage?: number,
  hasNextPage?: boolean
}
