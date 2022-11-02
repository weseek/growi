export const userActivationErrorCode = {
  TOKEN_NOT_FOUND: 'token-not-found',
  USER_REGISTRATION_ORDER_IS_NOT_APPROPRIATE: 'user-registration-order-is-not-appropriate',
} as const;

export type userActivationErrorCode = typeof userActivationErrorCode[keyof typeof userActivationErrorCode];
