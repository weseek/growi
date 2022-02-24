export const SocketNamespace = {
  UpdateDescCount: 'UpdateDsecCount',
} as const;
export type SocketNamespace = typeof SocketNamespace[keyof typeof SocketNamespace];

type PagePath = string;
type DescendantCount = number;
/**
 * Data of updateDescCount when used through socket.io. Convert to UpdateDescCountData type when use with swr cache.
 */
export type UpdateDescCountRawData = Record<PagePath, DescendantCount>;
export type UpdateDescCountData = Map<PagePath, DescendantCount>;
