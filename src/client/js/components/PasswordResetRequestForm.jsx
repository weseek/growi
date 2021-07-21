import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const PasswordResetRequestForm = (props) => {
  // TODO: apply i18n by GW-6861
  // const { t } = props;

  return (
    <>
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-md-6 mt-5">
            <div className="text-center">
              <h1><i className="icon-lock large"></i></h1>
              <h2 className="text-center">Forgot Password?</h2>
              <p>You can reset your password here.</p>
              <form role="form" className="form" method="post">
                <div className="form-group">
                  <div className="input-group">
                    <input name="email" placeholder="email address" className="form-control" type="email" />
                  </div>
                </div>
                <div className="form-group">
                  <input name="reset-password-btn" className="btn btn-lg btn-primary btn-block" value="Reset Password" type="submit" />
                </div>
                <a href="/login">
                  <i className="icon-login mr-1"></i>Return to login
                </a>
              </form>
            </div>
          </div>

        </div>
      </div>

    </>
  );
};

PasswordResetRequestForm.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(PasswordResetRequestForm);
