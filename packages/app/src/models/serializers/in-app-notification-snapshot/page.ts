import type { IPage } from '~/interfaces/page';
import type { IUser } from '~/interfaces/user';

export interface IPageSnapshot {
  path: string
  creator: IUser
}

// type guard
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isIPageSnapshot = (args: any): args is IPageSnapshot => {
  return args.path != null && args.creator != null;
};

export const stringifySnapshot = (page: IPage): string => {
  return JSON.stringify({
    path: page.path,
    creator: page.creator,
  });
};

export const parseSnapshot = (snapshot: string): IPageSnapshot => {
  return JSON.parse(snapshot);
};
