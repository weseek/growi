import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const CustomBotWithoutProxySecretTokenSection = (props) => {
  const {
    slackSigningSecret, slackSigningSecretEnv, slackBotToken, slackBotTokenEnv,
    onSigningSecretChanged, onBotTokenChanged,
  } = props;
  const { t } = useTranslation();

  const signingSecretChanged = (signingSecretInput) => {
    if (onSigningSecretChanged != null) {
      onSigningSecretChanged(signingSecretInput);
    }
  };

  const botTokenChanged = (botTokenInput) => {
    if (onBotTokenChanged != null) {
      onBotTokenChanged(botTokenInput);
    }
  };

  const updateSecretTokenHandler = () => {
    if (props.updateSecretTokenHandler != null) {
      props.updateSecretTokenHandler();
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
            value={slackSigningSecret || ''}
            onChange={e => signingSecretChanged(e.target.value)}
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
            value={slackBotToken || ''}
            onChange={e => botTokenChanged(e.target.value)}
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
