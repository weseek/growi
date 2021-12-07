import { IUser } from '~/interfaces/user';

export interface IPageSnapshot {
  path: string
  creator: IUser
}

export const stringifySnapshot = (page: IPageSnapshot): string => {
  return JSON.stringify({
    path: page.path,
    creator: page.creator,
  });
};

export const parseSnapshot = (snapshot: string): IPageSnapshot => {
  return JSON.parse(snapshot);
};
