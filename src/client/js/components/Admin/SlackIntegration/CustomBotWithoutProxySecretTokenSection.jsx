import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const CustomBotWithoutProxySecretTokenSection = (props) => {
  const {
    slackSigningSecret, slackSigningSecretEnv, slackBotToken, slackBotTokenEnv,
    onSigningSecretChanged, onBotTokenChanged, onUpdatedSecretToken,
  } = props;
  console.log(slackSigningSecret);
  const [inputSingingSecret, setInputSigningSecret] = useState(slackSigningSecret);
  const [inputBotToken, setBotToken] = useState(slackBotToken);

  const { t } = useTranslation();


  const updateSecretTokenHandler = (inputSingingSecret, inputBotToken) => {
    if (props.updateSecretTokenHandler != null) {
      props.updateSecretTokenHandler();
      props.onUpdatedSecretToken(inputSingingSecret, inputBotToken);
      console.log(slackSigningSecret);
    }
  };

  return (
    <div className="w-75 mx-auto">

      <h3>Signing Secret</h3>
      <div className="row">

        <div className="col-sm">
          <p>Database</p>
          <input
            className="form-control"
            type="text"
            value={inputSingingSecret || ''}
            onChange={(e) => { setInputSigningSecret(e.target.value) }}
          />
        </div>

        <div className="col-sm">
          <p>Environment variables</p>
          <input
            className="form-control"
            type="text"
            value={slackSigningSecretEnv || ''}
            readOnly
          />
          <p className="form-text text-muted">
            {/* eslint-disable-next-line react/no-danger */}
            <small dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.use_env_var_if_empty', { variable: 'SLACK_SIGNING_SECRET' }) }} />
          </p>
        </div>

      </div>

      <h3>Bot User OAuth Token</h3>
      <div className="row">

        <div className="col-sm">
          <p>Database</p>
          <input
            className="form-control"
            type="text"
            value={inputBotToken || ''}
            onChange={(e) => { setBotToken(e.target.value) }}
          />
        </div>

        <div className="col-sm">
          <p>Environment variables</p>
          <input
            className="form-control"
            type="text"
            value={slackBotTokenEnv || ''}
            readOnly
          />
          <p className="form-text text-muted">
            {/* eslint-disable-next-line react/no-danger */}
            <small dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.use_env_var_if_empty', { variable: 'SLACK_BOT_TOKEN' }) }} />
          </p>
        </div>

      </div>

      <AdminUpdateButtonRow onClick={updateSecretTokenHandler} disabled={false} />

    </div>
  );
};

CustomBotWithoutProxySecretTokenSection.propTypes = {
  updateSecretTokenHandler: PropTypes.func,
  onSigningSecretChanged: PropTypes.func,
  onBotTokenChanged: PropTypes.func,
  slackSigningSecret: PropTypes.string,
  slackSigningSecretEnv: PropTypes.string,
  slackBotToken: PropTypes.string,
  slackBotTokenEnv: PropTypes.string,
};

export default CustomBotWithoutProxySecretTokenSection;
