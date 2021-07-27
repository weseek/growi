import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


const PasswordResetRequestForm = (props) => {
  // TODO: apply i18n by GW-6861
  // const { t } = props;
  const [email, setEmail] = useState();

  const changeEmail = (inputValue) => {
    setEmail(inputValue);
  };

  return (
    <form role="form" className="form" method="post">
      <div className="form-group">
        <div className="input-group">
          <input name="email" placeholder="E-mail Address" className="form-control" type="email" onChange={e => changeEmail(e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <input name="reset-password-btn" className="btn btn-lg btn-primary btn-block" value="Reset Password" type="submit" />
      </div>
      <a href="/login">
        <i className="icon-login mr-1"></i>Return to login
      </a>
    </form>
  );
};

PasswordResetRequestForm.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(PasswordResetRequestForm);
