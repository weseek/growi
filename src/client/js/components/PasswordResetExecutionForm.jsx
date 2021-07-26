import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const PasswordResetExecutionForm = (props) => {
  // TODO: apply i18n by GW-6861
  // const { t } = props;

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-md-6 mt-5">
          <div className="text-center">
            <h1><i className="icon-lock large"></i></h1>
            <h2 className="text-center">Reset Password</h2>
            {/* TODO: show user email by GW-6778 */}
            <p>Enter a new password for foo@example.com.</p>
            <form role="form" className="form" method="post">
              <div className="form-group">
                <div className="input-group">
                  <input name="password" placeholder="New Password" className="form-control" type="password" />
                </div>
              </div>
              <div className="form-group">
                <div className="input-group">
                  <input name="password" placeholder="Confirm the new password" className="form-control" type="password" />
                </div>
              </div>
              <div className="form-group">
                <input name="reset-password-btn" className="btn btn-lg btn-primary btn-block" value="Reset Password" type="submit" />
              </div>
              <a href="/login">
                <i className="icon-login mr-1"></i>Sign in instead
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

PasswordResetExecutionForm.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(PasswordResetExecutionForm);
