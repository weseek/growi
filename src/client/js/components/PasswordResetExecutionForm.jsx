import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { toastSuccess, toastError } from '../util/apiNotification';


const PasswordResetExecutionForm = (props) => {
  const { t /* appContainer, personalContainer */ } = props;

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [validationErrorI18n, setValidationErrorI18n] = useState('');

  // TODO: delete the following comments by GW-6778
  // console.log(newPassword);
  // console.log(newPasswordConfirm);

  const changePassword = async(e) => {
    e.preventDefault();

    if (newPassword === '' || newPasswordConfirm === '') {
      setValidationErrorI18n('personal_settings.password_is_not_set');
      toastError('err', t('personal_settings.password_is_not_set'));
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setValidationErrorI18n('forgot_password.password_and_confirm_password_does_not_match');
      toastError('err', t('forgot_password.password_and_confirm_password_does_not_match'));
      return;
    }

    try {
      /*
      * TODO: hit an api to change password by GW-6778
      * the following code is just a reference
      */

      // await appContainer.apiv3Put('/personal-setting/password', {
      //   oldPassword, newPassword, newPasswordConfirm,
      // });

      setNewPassword('');
      setNewPasswordConfirm('');

      toastSuccess(t('toaster.update_successed', { target: t('Password') }));
    }
    catch (err) {
      toastError(err);
    }

  };

  return (
    <form role="form" onSubmit={changePassword}>
      <div className="form-group">
        <div className="input-group">
          <input
            name="password"
            placeholder={t('forgot_password.new_password')}
            className="form-control"
            type="password"
            onChange={e => setNewPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <div className="input-group">
          <input
            name="password"
            placeholder={t('forgot_password.confirm_new_password')}
            className="form-control"
            type="password"
            onChange={e => setNewPasswordConfirm(e.target.value)}
          />
        </div>
        {validationErrorI18n !== '' && (
          <div>
            <p>{t(validationErrorI18n)}</p>
          </div>
        )}
      </div>
      <div className="form-group">
        <input name="reset-password-btn" className="btn btn-lg btn-primary btn-block" value={t('forgot_password.reset_password')} type="submit" />
      </div>
      <a href="/login">
        <i className="icon-login mr-1"></i>{t('forgot_password.sign_in_instead')}
      </a>
    </form>
  );
};

PasswordResetExecutionForm.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(PasswordResetExecutionForm);
