import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const CustomBotWithoutProxySecretTokenSection = (props) => {
  const { t } = useTranslation();

  const onChangeSigningSecretHandler = (signingSecretInput) => {
    if (props.onChangeSigningSecretHandler != null) {
      props.onChangeSigningSecretHandler(signingSecretInput);
    }
  };

  const onChangeBotTokenHandler = (botTokenInput) => {
    if (props.onChangeBotTokenHandler != null) {
      props.onChangeBotTokenHandler(botTokenInput);
    }
  };

  const updateSecretTokenHandler = () => {
    if (props.updateSecretTokenHandler != null) {
      props.updateSecretTokenHandler();
    }
  };

  return (
    <div className="card-body">
      <table className="table settings-table">
        <colgroup>
          <col className="item-name" />
          <col className="from-db" />
          <col className="from-env-vars" />
        </colgroup>
        <thead>
          <tr><th className="border-top-0"></th><th className="border-top-0">Database</th><th className="border-top-0">Environment variables</th></tr>
        </thead>
        <tbody>
          <tr>
            <th>Signing Secret</th>
            <td>
              <input
                className="form-control"
                type="text"
                value={props.slackSigningSecret || ''}
                onChange={e => onChangeSigningSecretHandler(e.target.value)}
              />
            </td>
            <td>
              <input
                className="form-control"
                type="text"
                value={props.slackSigningSecretEnv || ''}
                readOnly
              />
              <p className="form-text text-muted">
                {/* eslint-disable-next-line react/no-danger */}
                <small dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.use_env_var_if_empty', { variable: 'SLACK_SIGNING_SECRET' }) }} />
              </p>
            </td>
          </tr>
          <tr>
            <th>Bot User OAuth Token</th>
            <td>
              <input
                className="form-control"
                type="text"
                value={props.slackBotToken || ''}
                onChange={e => onChangeBotTokenHandler(e.target.value)}
              />
            </td>
            <td>
              <input
                className="form-control"
                type="text"
                value={props.slackBotTokenEnv || ''}
                readOnly
              />
              <p className="form-text text-muted">
                {/* eslint-disable-next-line react/no-danger */}
                <small dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.use_env_var_if_empty', { variable: 'SLACK_BOT_TOKEN' }) }} />
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <AdminUpdateButtonRow onClick={updateSecretTokenHandler} disabled={false} />
    </div>
  );
};

CustomBotWithoutProxySecretTokenSection.propTypes = {
  updateSecretTokenHandler: PropTypes.func,
  onChangeSigningSecretHandler: PropTypes.func,
  onChangeBotTokenHandler: PropTypes.func,
  slackSigningSecret: PropTypes.string,
  slackSigningSecretEnv: PropTypes.string,
  slackBotToken: PropTypes.string,
  slackBotTokenEnv: PropTypes.string,

};

export default CustomBotWithoutProxySecretTokenSection;
