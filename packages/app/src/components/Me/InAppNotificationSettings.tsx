import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

type Props = {
  appContainer: AppContainer,
};

const InAppNotificationSetting: FC<Props> = (props: Props) => {
  const { appContainer } = props;
  const { t } = useTranslation();

  const updateSettingsHandler = async() => {

    const defaultSubscribeRules = [
      { name: 'PAGE_CREATE', isEnabled: true },
    ];

    // TODO: 80102
    try {
      const res = await appContainer.apiv3Put('/personal-setting/in-app-notification-settings', { defaultSubscribeRules });
      console.log(res);
      toastSuccess('yoyoyo!');
    }
    catch (err) {
      toastError(err);
    }

    return;
  };

  return (
    <>
      <h2 className="border-bottom my-4">{t('in_app_notification_settings.in_app_notification_settings')}</h2>

      <div className="row my-3">
        <div className="offset-4 col-5">
          <button
            type="button"
            className="btn btn-primary"
            onClick={updateSettingsHandler}
          >
            {t('Update')}
          </button>
        </div>
      </div>
    </>
  );
};

const InAppNotificationSettingWrapper = withUnstatedContainers(InAppNotificationSetting, [AppContainer]);
export default InAppNotificationSettingWrapper;
