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

  const onClickSendPasswordResetRequestMail = async(email) => {
    if (email == null) {
      toastError('err', 'email is required.');
      return;
    }

    try {
      const res = await appContainer.apiPost('/forgot-password', { email });
      console.log('resHOge', res);
      // const { failedToSendEmail } = res.data;
      // if (failedToSendEmail == null) {
      const msg = `Email has been sent<br>・${email}`;
      toastSuccess(msg);
      // }
      // else {
      //   const msg = { message: `email: ${failedToSendEmail.email}<br>reason: ${failedToSendEmail.reason}` };
      //   toastError(msg);
      // }
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <form role="form" className="form" method="post">
      <div className="form-group">
        <div className="input-group">
          <input name="email" placeholder="E-mail Address" className="form-control" type="email" onChange={e => changeEmail(e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <input
          name="reset-password-btn"
          className="btn btn-lg btn-primary btn-block"
          value="Reset Password"
          type="submit"
          onClick={() => { onClickSendPasswordResetRequestMail(email) }}
        />
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
