import { isPopulated, type Ref } from '../../interfaces/common';
import type { IUser } from '../../interfaces/user';

export type IUserSerializedSecurely = Omit<IUser, 'password' | 'apiToken' | 'email'> & { email?: string };

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

export const serializeUserSecurely = (user?: Ref<IUser>): Ref<IUserSerializedSecurely> | undefined => {
  // return when it is not a user object
  if (user == null || !isPopulated(user)) {
    return user;
  }

  return {
    _id: user._id,
    ...omitInsecureAttributes(user),
  };
};
