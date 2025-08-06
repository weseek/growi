import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { IUserUISettings } from '~/interfaces/user-ui-settings';
import type { UserUISettingsDocument } from '~/server/models/user-ui-settings';
import { getModelSafely } from '~/server/util/mongoose-utils';

export type UserUISettingsProps = {
  userUISettings: IUserUISettings,
};

export const getServerSideUserUISettingsProps: GetServerSideProps<UserUISettingsProps> = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest;
  const { user } = req;

  // retrieve UserUISettings
  const UserUISettings = getModelSafely<UserUISettingsDocument>('UserUISettings');
  const userUISettings = user != null && UserUISettings != null
    ? await UserUISettings.findOne({ user: user._id }).exec()
    : req.session.uiSettings; // for guests

  return {
    props: {
      userUISettings,
    },
  };
};
