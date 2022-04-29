import { IUser } from '~/interfaces/user';

export type ISnapshot = {
  actionUsername: string
}

export const stringifySnapshot = (user: IUser): string => {
  return JSON.stringify({
    username: user.username,
  });
};

export const parseSnapshot = (snapshot: string): ISnapshot => {
  return JSON.parse(snapshot);
};
