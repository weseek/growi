import React, {
  FC, useState, useEffect, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';

import { pullAllBy } from 'lodash';
import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

type SubscribeRule = {
  name: string,
  isEnabled: boolean,
}

enum SubscribeRuleName {
  PAGE_CREATE = 'PAGE_CREATE',
}

enum SubscribeDescription {
  PAGE_CREATE = 'in_app_notification_settings.default_subscribe_rules.page_create',
}

const subscribeRulesMenuItems = [
  {
    name: SubscribeRuleName.PAGE_CREATE,
    description: SubscribeDescription.PAGE_CREATE,
  },
];

const isCheckedRule = (ruleName: string, subscribeRules: SubscribeRule[]) => (
  subscribeRules.find(stateRule => (
    stateRule.name === ruleName
  ))?.isEnabled || false
);

const updateIsEnabled = (subscribeRules: SubscribeRule[], ruleName: string, isChecked: boolean) => {
  const target = [{ name: ruleName, isEnabled: isChecked }];
  return pullAllBy(subscribeRules, target, 'name').concat(target);
};


const InAppNotificationSettings: FC = () => {
  const { t } = useTranslation();
  const [subscribeRules, setSubscribeRules] = useState<SubscribeRule[]>([]);

  const initializeInAppNotificationSettings = useCallback(async() => {
    const { data } = await apiv3Get('/personal-setting/in-app-notification-settings');
    const retrievedRules: SubscribeRule[] = data?.subscribeRules;

    if (retrievedRules != null && retrievedRules.length > 0) {
      setSubscribeRules(retrievedRules);
    }
  }, []);

  const ruleCheckboxHandler = (ruleName: string, isChecked: boolean) => {
    setSubscribeRules(prevState => updateIsEnabled(prevState, ruleName, isChecked));
  };

  const updateSettingsHandler = useCallback(async() => {
    try {
      const { data } = await apiv3Put('/personal-setting/in-app-notification-settings', { subscribeRules });
      setSubscribeRules(data.subscribeRules);
      toastSuccess(t('toaster.update_successed', { target: 'InAppNotification Settings' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [subscribeRules, setSubscribeRules, t]);

  useEffect(() => {
    initializeInAppNotificationSettings();
  }, [initializeInAppNotificationSettings]);

  return (
    <>
      <h2 className="border-bottom my-4">{t('in_app_notification_settings.subscribe_settings')}</h2>

      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">
          {subscribeRulesMenuItems.map(rule => (
            <div
              key={rule.name}
              className="custom-control custom-switch custom-checkbox-success"
            >
              <input
                type="checkbox"
                className="custom-control-input"
                id={rule.name}
                checked={isCheckedRule(rule.name, subscribeRules)}
                onChange={e => ruleCheckboxHandler(rule.name, e.target.checked)}
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

export default InAppNotificationSettings;
