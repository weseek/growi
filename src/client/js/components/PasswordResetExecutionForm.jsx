import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const PasswordResetExecutionForm = (props) => {
  const { t } = props;

  return (
    <form role="form" className="form" method="post">
      <div className="form-group">
        <div className="input-group">
          <input name="password" placeholder={t('forgot_password.new_password')} className="form-control" type="password" />
        </div>
      </div>
      <div className="form-group">
        <div className="input-group">
          <input name="password" placeholder={t('forgot_password.confirm_new_password')} className="form-control" type="password" />
        </div>
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
