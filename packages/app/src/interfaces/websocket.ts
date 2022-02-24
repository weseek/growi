export const SocketNamespace = {
  UpdateDescCount: 'UpdateDsecCount',
} as const;
export type SocketNamespace = typeof SocketNamespace[keyof typeof SocketNamespace];

export type UpdateDescCountData = {
  path: string,
  descendantCount: number,
}[];
