export const MessageErrorCode = {
  THREAD_ID_IS_NOT_SET: 'thread-id-is-not-set',
} as const;

export const StreamErrorCode = {
  BUDGET_EXCEEDED: 'budget-exceeded',
} as const;

export type StreamErrorCode =
  | 'PREREQUISITE_FAILED'
  | 'UNSUPPORTED_MODEL'
  | 'CONTEXT_LENGTH_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'INVALID_RESPONSE_FORMAT'; // JSON解析エラー用に追加
