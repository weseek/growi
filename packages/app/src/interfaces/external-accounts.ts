import { Ref } from '~/interfaces/common';
import { IUser } from '~/interfaces/user';


export type IExternalAccount<ID = string> = {
  _id: ID,
  providerType: string,
  accountId: string,
  user: Ref<IUser>,
}
