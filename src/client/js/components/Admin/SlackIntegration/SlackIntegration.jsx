import React from 'react';
import { useTranslation } from 'react-i18next';

import AccessTokenSettings from './AccessTokenSettings';
import CustomBotNonProxySettings from './CustomBotNonProxySettings';

function SlackIntegration() {

  const { t } = useTranslation('admin');
  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">Access Token</h2>
          <AccessTokenSettings />
        </div>
      </div>

      <div className="row mx-auto my-5 btn-group btn-group-toggle" data-toggle="buttons">
        <label className="btn btn-secondary active">
          <input type="radio" name="options" id="option1" checked /> Official Bot
        </label>
        <label className="btn btn-secondary">
          <input type="radio" name="options" id="option2" /> Custom Bot (Non-Proxy)
        </label>
        <label className="btn btn-secondary">
          <input type="radio" name="options" id="option3" /> Custom Bot (With-Proxy)
        </label>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">{t('slack_integration.custom_bot_non_proxy_settings')}</h2>
          <CustomBotNonProxySettings />
        </div>
      </div>
    </>
  );
}

export default SlackIntegration;
