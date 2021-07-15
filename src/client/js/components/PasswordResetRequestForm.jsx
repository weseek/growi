import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const PasswordResetRequestForm = (props) => {
  // const { t } = props;

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-4 col-md-offset-4">
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="text-center">
                  <h3><i className="fa fa-lock fa-4x"></i></h3>
                  <h2 className="text-center">Forgot Password?</h2>
                  <p>You can reset your password here.</p>
                  <div className="panel-body">
                    <form id="register-form" role="form" autoComplete="off" className="form" method="post">
                      <div className="form-group">
                        <div className="input-group">
                          <span className="input-group-addon"><i className="glyphicon glyphicon-envelope color-blue"></i></span>
                          <input id="email" name="email" placeholder="email address" className="form-control" type="email" />
                        </div>
                      </div>
                      <div className="form-group">
                        <input name="recover-submit" className="btn btn-lg btn-primary btn-block" value="Reset Password" type="submit" />
                      </div>
                      <input type="hidden" className="hide" name="token" id="token" value="" />
                    </form>
                  </div>
                </div>
              </div>
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
