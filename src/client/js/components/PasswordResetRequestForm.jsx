import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const PasswordResetRequestForm = (props) => {
  // const { t } = props;

  return (
    <>
      <div className="d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3><i className="fa fa-lock fa-4x"></i></h3>
          <h2 className="text-center">Forgot Password?</h2>
          <p>You can reset your password here.</p>
          <form role="form" className="form" method="post">
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-addon">
                  <i className="glyphicon glyphicon-envelope" />
                </span>
                <input name="email" placeholder="email address" className="form-control" type="email" />
              </div>
            </div>
            <div className="form-group">
              <input name="reset-password-btn" className="btn btn-lg btn-primary btn-block" value="Reset Password" type="submit" />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

PasswordResetRequestForm.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(PasswordResetRequestForm);
