export const MessageErrorCode = {
  THREAD_ID_IS_NOT_SET: 'thread-id-is-not-set',
} as const;

export const StreamErrorCode = {
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
} as const;

export type StreamErrorCode = typeof StreamErrorCode[keyof typeof StreamErrorCode];
