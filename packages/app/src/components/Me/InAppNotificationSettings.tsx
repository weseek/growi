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
    description: 'in_app_notification_settings.subscribe_rules.page_create',
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

  const isCheckedRule = (ruleName: string) => (
    subscribeRules.find(stateRule => (
      stateRule.name === ruleName
    ))?.isEnabled || false
  );

  const ruleCheckboxHandler = (isChecked: boolean, ruleName: string) => {
    setSubscribeRules(prevState => (
      prevState.filter(rule => rule.name !== ruleName).concat({ name: ruleName, isEnabled: isChecked })
    ));
  };

  const updateSettingsHandler = async() => {
    try {
      const res = await appContainer.apiv3Put('/personal-setting/in-app-notification-settings', { defaultSubscribeRules: subscribeRules });
      console.log(res);
    }
    catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    initializeInAppNotificationSettings();
  }, [initializeInAppNotificationSettings]);

  return (
    <>
      <h2 className="border-bottom my-4">{t('in_app_notification_settings.subscribe_settings')}</h2>

      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          {defaultSubscribeRulesMenuItems.map(rule => (
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
              <p className="form-text text-muted small">
                {t(rule.description)}
              </p>
            </div>
          ))}
        </div>
      </div>

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
