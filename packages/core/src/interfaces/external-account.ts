import type { Ref } from './common';
import type { HasObjectId } from './has-object-id';
import type { IUser } from './user';

export const IExternalAuthProviderType = {
  ldap: 'ldap',
  saml: 'saml',
  oicd: 'oidc',
  google: 'google',
  github: 'github',
} as const;

export type IExternalAuthProviderType = typeof IExternalAuthProviderType[keyof typeof IExternalAuthProviderType]

export type IExternalAccount = {
  providerType: IExternalAuthProviderType,
  accountId: string,
  user: Ref<IUser>,
}

export type IExternalAccountHasId = IExternalAccount & HasObjectId
