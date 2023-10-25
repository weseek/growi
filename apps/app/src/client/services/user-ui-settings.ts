// eslint-disable-next-line no-restricted-imports
import { AxiosResponse } from 'axios';
import { debounce } from 'throttle-debounce';

import { apiv3Put } from '~/client/util/apiv3-client';
import { IUserUISettings } from '~/interfaces/user-ui-settings';

let settingsForBulk: Partial<IUserUISettings> = {};
const _putUserUISettingsInBulk = (): Promise<AxiosResponse<IUserUISettings>> => {
  const result = apiv3Put<IUserUISettings>('/user-ui-settings', { settings: settingsForBulk });

  // clear partial
  settingsForBulk = {};

  return result;
};

const _putUserUISettingsInBulkDebounced = debounce(1500, _putUserUISettingsInBulk);

type ScheduleToPutFunction = (settings: Partial<IUserUISettings>) => Promise<AxiosResponse<IUserUISettings>>;
export const scheduleToPut: ScheduleToPutFunction = (settings: Partial<IUserUISettings>): Promise<AxiosResponse<IUserUISettings>> => {
  settingsForBulk = {
    ...settingsForBulk,
    ...settings,
  };

  return _putUserUISettingsInBulkDebounced();
};
