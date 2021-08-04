import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { toastSuccess, toastError } from '../util/apiNotification';

import AppContainer from '../services/AppContainer';
import { withUnstatedContainers } from './UnstatedUtils';


const PasswordResetRequestForm = (props) => {
  const { t, appContainer } = props;
  const [email, setEmail] = useState('');

  const changeEmail = (inputValue) => {
    setEmail(inputValue);
  };

  const sendPasswordResetRequestMail = async(e) => {
    e.preventDefault();
    if (email === '') {
      toastError('err', t('forgot_password.email_is_required'));
      return;
    }

    try {
      await appContainer.apiPost('/forgot-password', { email });
      toastSuccess(t('forgot_password.success_to_send_email'));
    }
    catch (err) {
      toastError('err', err);
    }
  };

  return (
    <form onSubmit={sendPasswordResetRequestMail}>
      <div className="form-group">
        <div className="input-group">
          <input name="email" placeholder="E-mail Address" className="form-control" type="email" onChange={e => changeEmail(e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <button
          className="btn btn-lg btn-primary btn-block"
          type="submit"
        >
          {t('forgot_password.send')}
        </button>
      </div>
      <a href="/login">
        <i className="icon-login mr-1"></i>{t('forgot_password.return_to_login')}
      </a>
    </form>
  );
};

/**
 * Wrapper component for using unstated
 */
const PasswordResetRequestFormWrapper = withUnstatedContainers(PasswordResetRequestForm, [AppContainer]);

PasswordResetRequestForm.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(PasswordResetRequestFormWrapper);
