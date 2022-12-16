import { IUserUISettings } from '~/interfaces/user-ui-settings';
import loggerFactory from '~/utils/logger';

import UserUISettings from '../models/user-ui-settings';

const logger = loggerFactory('growi:middleware:inject-user-ui-settings-to-localvars');

async function getSettings(userId: string): Promise<IUserUISettings | null> {
  const doc = await UserUISettings.findOne({ user: userId }).exec();

  let userUISettings: IUserUISettings | null = null;
  if (doc != null) {
    const obj = doc.toObject();
    // omit user property
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userUISettings = (({ user, ...rest }) => rest)(obj);
  }

  return userUISettings;
}

module.exports = () => {
  return async(req, res, next) => {
    if (req.user == null) {
      return next();
    }

    try {
      res.locals.userUISettings = await getSettings(req.user._id);
    }
    catch (err: unknown) {
      logger.error(err);
    }

    next();
  };
};
