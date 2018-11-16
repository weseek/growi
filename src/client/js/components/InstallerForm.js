import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import { translate } from 'react-i18next';

class InstallerForm extends React.Component {

  changeLanguage(locale) {
    i18next.changeLanguage(locale);
  }

  render() {
    return (
      <form role="form" action="/installer/createAdmin" method="post" id="register-form">
        <div className="input-group" id="input-group-username">
          <span className="input-group-addon"><i className="icon-user"></i></span>
          <input type="text" className="form-control" placeholder={ this.props.t('User ID') }
            name="registerForm[username]" defaultValue={this.props.userName} required />
        </div>
        <p className="help-block">
          <span id="help-block-username"></span>
        </p>

        <div className="input-group">
          <span className="input-group-addon"><i className="icon-tag"></i></span>
          <input type="text" className="form-control" placeholder={ this.props.t('Name') } name="registerForm[name]" defaultValue={ this.props.name } required />
        </div>

        <div className="input-group">
          <span className="input-group-addon"><i className="icon-envelope"></i></span>
          <input type="email" className="form-control" placeholder={ this.props.t('Email') } name="registerForm[email]" defaultValue={ this.props.email } required />
        </div>

        <div className="input-group">
          <span className="input-group-addon"><i className="icon-lock"></i></span>
          <input type="password" className="form-control" placeholder={ this.props.t('Password') } name="registerForm[password]" required />
        </div>

        <input type="hidden" name="_csrf" value={ this.props.csrf } />

        <div className="input-group m-t-20 m-b-20 mx-auto">
          <div className="radio radio-primary radio-inline">
            <input type="radio" id="radioLangEn" name="registerForm[lang]"
                   defaultChecked={ true } onClick={() => this.changeLanguage('en')} />
            <label htmlFor="radioLangEn">{ this.props.t('English') }</label>
          </div>
          <div className="radio radio-primary radio-inline">
            <input type="radio" id="radioLangJa" name="registerForm[lang]"
                   defaultChecked={ false } onClick={() => this.changeLanguage('ja')} />
            <label htmlFor="radioLangJa">{ this.props.t('Japanese') }</label>
          </div>
        </div>

        <div className="input-group m-t-30 m-b-20 d-flex justify-content-center">
          <button type="submit" className="fcbtn btn btn-success btn-1b btn-register">
            <span className="btn-label"><i className="icon-user-follow"></i></span>
            { this.props.t('Create') }
          </button>
        </div>

        <div className="input-group m-t-30 d-flex justify-content-center">
          <a href="https://growi.org" className="link-growi-org">
            <span className="growi">GROWI</span>.<span className="org">ORG</span>
          </a>
        </div>
      </form>
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
