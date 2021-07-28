import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { toastSuccess, toastError } from '../util/apiNotification';

import AppContainer from '../services/AppContainer';
import { withUnstatedContainers } from './UnstatedUtils';


const PasswordResetRequestForm = (props) => {
  // TODO: apply i18n by GW-6861
  const { /* t, */ appContainer } = props;
  const [email, setEmail] = useState();

  const changeEmail = (inputValue) => {
    setEmail(inputValue);
  };

  const sendPasswordResetRequestMail = async(e) => {
    e.preventDefault();
    if (email == null) {
      toastError('err', 'Email is required.');
      return;
    }

    try {
      await appContainer.apiPost('/forgot-password', { email });
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
          Reset Password
        </button>
      </div>
      <a href="/login">
        <i className="icon-login mr-1"></i>Return to login
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
