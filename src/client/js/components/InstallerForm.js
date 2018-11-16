import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

class InstallerForm extends React.Component {
  render() {
    return (
      <div>
        <div className="input-group" id="input-group-username">
          <span className="input-group-addon"><i className="icon-user"></i></span>
          <input type="text" className="form-control" placeholder={ this.props.t('User ID') } name="registerForm[username]" value={ this.props.userName } required />
        </div>
        <p className="help-block">
          <span id="help-block-username"></span>
        </p>

        <div className="input-group">
          <span className="input-group-addon"><i className="icon-tag"></i></span>
          <input type="text" className="form-control" placeholder={ this.props.t('Name') } name="registerForm[name]" value={ this.props.name } required />
        </div>

        <div className="input-group">
          <span className="input-group-addon"><i className="icon-envelope"></i></span>
          <input type="email" className="form-control" placeholder={ this.props.t('Email') } name="registerForm[email]" value={ this.props.email } required />
        </div>

        <div className="input-group">
          <span className="input-group-addon"><i className="icon-lock"></i></span>
          <input type="password" className="form-control" placeholder={ this.props.t('Password') } name="registerForm[password]" required />
        </div>

        <input type="hidden" name="_csrf" value={ this.props.csrf } />
        <div className="input-group m-t-30 m-b-20 d-flex justify-content-center">
          <button type="submit" className="fcbtn btn btn-success btn-1b btn-register">
            <span className="btn-label"><i className="icon-user-follow"></i></span>
            { this.props.t('Create') }
          </button>
        </div>
      </div>
    );
  }
}

InstallerForm.propTypes = {
  // i18next
  t: PropTypes.func.isRequired,
  // for input value
  userName: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  csrf: PropTypes.string,
};

export default translate()(InstallerForm);
