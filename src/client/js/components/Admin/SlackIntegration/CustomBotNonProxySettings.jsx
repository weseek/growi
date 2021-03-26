/* eslint-disable no-console */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

function CustomBotNonProxySettings() {

  const { t } = useTranslation('admin');
  const [slackSigningSecret, setSlackSigningSecret] = useState('');
  const [slackBotToken, setSlackBotToken] = useState('');
  const [botType, setBotType] = useState('non-proxy');

  const requestParams = { slackSigningSecret, slackBotToken, botType };

  async function updateHandler() {
    try {
      // toastSuccess(t('toaster.update_successed'));
      const response = await AppContainer.apiv3.put('/slack-integration/custom-bot-non-proxy/', requestParams);
      console.log(response);
    }
    catch (err) {
      // toastError(err);
      console.log(err);
    }
  }

  return (
    <>
      <div className="row my-5">
        <div className="mx-auto">
          <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
            {t('slack_integration.non_proxy.create_bot')}
          </button>
        </div>
      </div>

      <div className="form-group row">
        <label className="text-left text-md-right col-md-3 col-form-label">Signing Secret</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            onChange={e => setSlackSigningSecret(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group row mb-5">
        <label className="text-left text-md-right col-md-3 col-form-label">Bot User OAuth Token</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            onChange={e => setSlackBotToken(e.target.value)}
          />
        </div>
      </div>

      <AdminUpdateButtonRow onClick={updateHandler} disabled={false} />
    </>
  );
}

export default CustomBotNonProxySettings;
