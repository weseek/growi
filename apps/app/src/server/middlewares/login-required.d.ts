import type Crowi from '~/server/crowi';

declare module '~/server/middlewares/login-required' {
  interface LoginRequired {
    (
      crowi: Crowi,
      isGuestAllowed?: boolean,
      fallback?: null | ((req, res) => void)
    ): (req, res, next) => void;
  }

  const loginRequired: LoginRequired;
  export = loginRequired;
}
