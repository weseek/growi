export const LoginErrorCode = {
  PROVIDER_DUPLICATED_USERNAME_EXCEPTION: 'ProviderDuplicatedUsernameException',
} as const;

export type LoginErrorCode = typeof LoginErrorCode[keyof typeof LoginErrorCode];
