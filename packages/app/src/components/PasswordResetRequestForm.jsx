import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';


const PasswordResetRequestForm = (props) => {
  const { t } = useTranslation();
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
      await apiv3Post('/forgot-password', { email });
      toastSuccess(t('forgot_password.success_to_send_email'));
    }
    catch (err) {
      toastError(err);
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

PasswordResetRequestForm.propTypes = {
};

export default PasswordResetRequestForm;
