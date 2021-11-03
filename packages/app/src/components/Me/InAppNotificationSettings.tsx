import React, {
  FC, useState, useEffect, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

type Props = {
  appContainer: AppContainer,
};

type SubscribeRule = {
  name: string,
  isEnabled: boolean,
}

const defaultSubscribeRulesMenuItems = [
  {
    name: 'PAGE_CREATE',
    description: 'ページを作成したときに自動的にサブスクライブします。',
  },
];


const InAppNotificationSettings: FC<Props> = (props: Props) => {
  const { appContainer } = props;
  const { t } = useTranslation();
  const [subscribeRules, setSubscribeRules] = useState<SubscribeRule[]>([]);

  const initializeInAppNotificationSettings = useCallback(async() => {
    const { data } = await appContainer.apiv3Get('/personal-setting/in-app-notification-settings');
    const retrievedRules: SubscribeRule[] = data?.defaultSubscribeRules;

    if (retrievedRules != null && retrievedRules.length > 0) {
      setSubscribeRules(retrievedRules);
    }
    else {
      const createRulesFormList = (rule: {name: string}) => (
        {
          name: rule.name,
          isEnabled: false,
        }
      );
      const defaultSubscribeRules = defaultSubscribeRulesMenuItems.map(rule => createRulesFormList(rule));
      setSubscribeRules(defaultSubscribeRules);
    }

  }, [appContainer]);

  const isCheckedRule = () => {
    return;
  };

  const ruleCheckboxHandler = () => {
    return;
  };

  const updateSettingsHandler = async() => {


    // TODO: 80102
    // try {
    //   const res = await appContainer.apiv3Put('/personal-setting/in-app-notification-settings', { defaultSubscribeRules });
    //   console.log(res);
    // }
    // catch (err) {
    //   toastError(err);
    // }

    return;
  };

  useEffect(() => {
    initializeInAppNotificationSettings();
  }, [initializeInAppNotificationSettings]);

  return (
    <>
      <h2 className="border-bottom my-4">{t('in_app_notification_settings.in_app_notification_settings')}</h2>

      {/* <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          {defaultSubscribeRules.map(rule => (
            <div
              key={rule.name}
              className="custom-control custom-switch custom-checkbox-success"
            >
              <input
                type="checkbox"
                className="custom-control-input"
                id={rule.name}
                checked={isCheckedRule(rule.name)}
                onChange={e => ruleCheckboxHandler(e.target.checked, rule.name)}
              />
              <label className="custom-control-label" htmlFor={rule.name}>
                <strong>{rule.name}</strong>
              </label>
            </div>
          ))}
        </div>
      </div> */}

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

const InAppNotificationSettingWrapper = withUnstatedContainers(InAppNotificationSettings, [AppContainer]);
export default InAppNotificationSettingWrapper;
