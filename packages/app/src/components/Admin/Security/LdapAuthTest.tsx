import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:security:AdminLdapSecurityContainer');

type LdapAuthTestProps = {
  username: string,
  password: string,
  onChangeUsername: (username: string) => void,
  onChangePassword: (password: string) => void,
}

export const LdapAuthTest = (props: LdapAuthTestProps): JSX.Element => {
  const {
    username, password, onChangeUsername, onChangePassword,
  } = props;
  const { t } = useTranslation();
  const [logs, setLogs] = useState('');
  const [errorMessage, setErrorMessage] = useState();
  const [successMessage, setSuccessMessage] = useState();

  /**
   * add logs
   */
  const addLogs = (log) => {
    const newLog = `${new Date()} - ${log}\n\n`;
    setLogs(`${newLog}${logs}`);
    // this.setState({
    //   logs: `${newLog}${this.state.logs}`,
    // });
  };

  /**
   * Test ldap auth
   */
  const testLdapCredentials = async() => {
    try {
      const response = await apiPost('/login/testLdap', {
        loginForm: {
          username,
          password,
        },
      });

      // add logs
      if (response.err) {
        toastError(response.err);
        addLogs(response.err);
      }

      if (response.status === 'warning') {
        addLogs(response.message);
        setErrorMessage(response.message);
        setSuccessMessage(null);
      }

      if (response.status === 'success') {
        toastSuccess(response.message);
        setSuccessMessage(response.message);
        setErrorMessage(null);
      }

      if (response.ldapConfiguration) {
        const prettified = JSON.stringify(response.ldapConfiguration.server, undefined, 4);
        addLogs(`LDAP Configuration : ${prettified}`);
      }
      if (response.ldapAccountInfo) {
        const prettified = JSON.stringify(response.ldapAccountInfo, undefined, 4);
        addLogs(`Retrieved LDAP Account : ${prettified}`);
      }

    }
    // Catch server communication error
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  };


  return (
    <React.Fragment>
      {successMessage != null && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage != null && <div className="alert alert-warning">{errorMessage}</div>}
      <div className="form-group row">
        <label htmlFor="username" className="col-3 col-form-label">{t('username')}</label>
        <div className="col-6">
          <input
            className="form-control"
            name="username"
            value={username}
            onChange={(e) => { onChangeUsername(e.target.value) }}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="form-group row">
        <label htmlFor="password" className="col-3 col-form-label">{t('Password')}</label>
        <div className="col-6">
          <input
            className="form-control"
            type="password"
            name="password"
            value={password}
            onChange={(e) => { onChangePassword(e.target.value) }}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="form-group">
        <label><h5>Logs</h5></label>
        <textarea id="taLogs" className="col form-control" rows={4} value={logs} readOnly />
      </div>

      <div>
        <button type="button" className="btn btn-outline-secondary offset-5 col-2" onClick={testLdapCredentials}>Test</button>
      </div>
    </React.Fragment>

  );
};
