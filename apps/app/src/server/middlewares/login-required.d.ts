import type Crowi from '~/server/crowi';

declare module '~/server/middlewares/login-required' {
  interface LoginRequired {
    (
      crowi: Crowi,
      isGuestAllowed?: boolean,
      fallback?: null | ((req, res) => void)
    ): (req: any, res: any, next: any) => void;
  }

  const loginRequired: LoginRequired;
  export = loginRequired;
}
