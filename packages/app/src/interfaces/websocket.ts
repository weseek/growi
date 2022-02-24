export const SocketNamespace = {
  UpdateDescCount: 'UpdateDsecCount',
} as const;
export type SocketNamespace = typeof SocketNamespace[keyof typeof SocketNamespace];

type PagePath = string;
type DescendantCount = number;
export type UpdateDescCountData = Map<PagePath, DescendantCount>;
