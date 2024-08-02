import type { IUser } from '~/interfaces';

type IUserSerializedSecurely = Omit<IUser, 'password' | 'apiToken' | 'email'> & { email?: string };

export const omitInsecureAttributes = (user: IUser): IUserSerializedSecurely => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, apiToken, ...rest } = user;

  const secureUser: IUserSerializedSecurely = rest;

  // omit email
  if (!secureUser.isEmailPublished) {
    delete secureUser.email;
  }

  return secureUser;
};

export const serializeUserSecurely = (user?: IUser | null): Partial<IUser> | null | undefined => {
  // return when it is not a user object
  if (user == null || !('username' in user)) {
    return user;
  }

  return omitInsecureAttributes(user);
};
