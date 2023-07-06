import { HasObjectId, Ref } from '@growi/core';

import { IUser } from '~/interfaces/user';


export type IExternalAccount = {
  providerType: string,
  accountId: string,
  user: Ref<IUser>,
}

export type IExternalAccountHasId = IExternalAccount & HasObjectId
