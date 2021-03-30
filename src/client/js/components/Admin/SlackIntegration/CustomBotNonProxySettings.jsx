/* eslint-disable no-console */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

function CustomBotNonProxySettings() {
  const { t } = useTranslation('admin');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');

  function updateHandler() {
    console.log(`Signing Secret: ${secret}, Bot User OAuth Token: ${token}`);
  }

  return (
    <div className="row">
      <div className="col-lg-12">
        <h2 className="admin-setting-header">{t('slack_integration.custom_bot_non_proxy_settings')}</h2>

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
            <input className="form-control" type="text" onChange={e => setSecret(e.target.value)} />
          </div>
        </div>

        <div className="form-group row mb-5">
          <label className="text-left text-md-right col-md-3 col-form-label">Bot User OAuth Token</label>
          <div className="col-md-6">
            <input className="form-control" type="text" onChange={e => setToken(e.target.value)} />
          </div>
        </div>

        <AdminUpdateButtonRow onClick={updateHandler} disabled={false} />
      </div>
    </div>
  );
}

export default CustomBotNonProxySettings;
