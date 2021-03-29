/* eslint-disable no-console */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import PropTypes from 'prop-types';

import AppContainer from '../../../services/AppContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';


import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:appSettings');

function CustomBotNonProxySettings(props) {
  const { appContainer } = props;
  const { t } = useTranslation('admin');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [secretEnv, setSecretEnv] = useState('');
  const [tokenEnv, setTokenEnv] = useState('');


  function updateHandler() {
    console.log(`Signing Secret: ${secret}, Bot User OAuth Token: ${token}`);
  }


  const getSlackBotSettingParams = useCallback(async() => {
    try {
      const response = await appContainer.apiv3.get('/slack-integration');
      setSecretEnv(response.data.slackBotSettingParams.cusotmBotNonProxySettings.slackSigningSecretEnvVars);
      setTokenEnv(response.data.slackBotSettingParams.cusotmBotNonProxySettings.slackBotTokenEnvVars);
    }
    catch (err) {
      logger.error(err);
    }
  }, [appContainer]);

  useEffect(() => {
    getSlackBotSettingParams();
  }, [getSlackBotSettingParams]);

  return (
    <>
      <div className="row my-5">
        <div className="mx-auto">
          <button
            type="button"
            className="btn btn-primary text-nowrap mx-1"
            onClick={() => window.open('https://api.slack.com/apps', '_blank')}
          >
            {t('slack_integration.non_proxy.create_bot')}
          </button>
        </div>
      </div>

      <div className="form-group row">
        <label className="text-left text-md-right col-md-3 col-form-label">Signing Secret</label>
        <div className="col-md-6">
          <input
            defaultValue={secretEnv || null}
            className="form-control"
            type="text"
            onChange={e => setSecret(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group row mb-5">
        <label className="text-left text-md-right col-md-3 col-form-label">Bot User OAuth Token</label>
        <div className="col-md-6">
          <input
            defaultValue={tokenEnv || null}
            className="form-control"
            type="text"
            onChange={e => setToken(e.target.value)}
          />
        </div>
      </div>

      <AdminUpdateButtonRow onClick={updateHandler} disabled={false} />
    </>
  );
}

const CustomBotNonProxySettingsWrapper = withUnstatedContainers(CustomBotNonProxySettings, [AppContainer]);

CustomBotNonProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default CustomBotNonProxySettingsWrapper;
