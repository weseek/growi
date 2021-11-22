import { IUser } from './user';

export interface INamedQuery {
  name: string
  aliasOf?: string
  resolverName?: string
  creator?: IUser
}
