import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

type Props = {
  appContainer: AppContainer,
};

const InAppNotificationSetting: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const updateSettingsHandler = () => {
    // TODO: 80102
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
