import { IUser } from './user';


export const SearchDelegatorName = {
  DEFAULT: 'FullTextSearch',
} as const;
export type SearchDelegatorName = typeof SearchDelegatorName[keyof typeof SearchDelegatorName];

export interface INamedQuery {
  name: string
  aliasOf?: string
  delegatorName?: SearchDelegatorName
  creator?: IUser
}
