import { IUser } from '~/interfaces/user';

export interface IPageSnapshot {
  path: string
  creator: IUser
}

export const stringifyPageModel = (page: IPageSnapshot): string => {
  return JSON.stringify({
    path: page.path,
    creator: page.creator,
  });
};

export const getSnapshotPagePath = (snapshot: string): string => {
  return JSON.parse(snapshot).path;
};
