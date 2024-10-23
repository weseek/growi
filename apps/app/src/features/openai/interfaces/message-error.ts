export const MessageErrorCode = {
  THREAD_ID_IS_NOT_SET: 'thread-id-is-not-set',
} as const;

export const StreamErrorCode = {
  BUDGET_EXCEEDED: 'budget-exceeded',
} as const;

export type StreamErrorCode = typeof StreamErrorCode[keyof typeof StreamErrorCode];

export const OpenaiStreamErrorMessage = {
  // eslint-disable-next-line max-len
  BUDGET_EXCEEDED: 'You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.',
} as const;
