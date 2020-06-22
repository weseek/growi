import React from 'react';
import PropTypes from 'prop-types';

import i18next from 'i18next';
import { withTranslation } from 'react-i18next';

import { localeMetadatas } from '../util/i18n';

class InstallerForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isValidUserName: true,
      checkedBtn: 'en_US',
    };
    this.checkUserName = this.checkUserName.bind(this);
  }

  componentWillMount() {
    this.changeLanguage('en_US');
  }

  checkUserName(event) {
    const axios = require('axios').create({
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      responseType: 'json',
    });
    axios.get('/_api/check_username', { params: { username: event.target.value } })
      .then((res) => { return this.setState({ isValidUserName: res.data.valid }) });
  }

  changeLanguage(locale) {
    i18next.changeLanguage(locale);
    this.setState({ checkedBtn: locale });
  }

  render() {
    const hasErrorClass = this.state.isValidUserName ? '' : ' has-error';
    const unavailableUserId = this.state.isValidUserName
      ? ''
      : <span><i className="icon-fw icon-ban" />{ this.props.t('installer.unavaliable_user_id') }</span>;

    const checkedBtn = this.state.checkedBtn;

    return (
      <div className={`login-dialog p-3 mx-auto${hasErrorClass}`}>
        <div className="row">
          <div className="col-md-12">
            <p className="alert alert-success">
              <strong>{ this.props.t('installer.create_initial_account') }</strong><br />
              <small>{ this.props.t('installer.initial_account_will_be_administrator_automatically') }</small>
            </p>
          </div>
        </div>
        <div className="row">
          <form role="form" action="/installer" method="post" id="register-form" className="col-md-12">
            <div className="form-group text-center">
              {
                localeMetadatas.map(meta => (
                  <div key={meta.id} className="custom-control custom-radio custom-control-inline">
                    <input
                      type="radio"
                      className="custom-control-input"
                      id={`register-form-check-${meta.id}`}
                      name="registerForm[app:globalLang]"
                      value={meta.id}
                      checked={checkedBtn === meta.id}
                      onChange={(e) => { if (e.target.checked) { this.changeLanguage(meta.id) } }}
                    />
                    <label className="custom-control-label" htmlFor={`register-form-check-${meta.id}`}>
                      {meta.displayName}
                    </label>
                  </div>
                ))
              }
            </div>

            <div className={`input-group mb-3${hasErrorClass}`}>
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="icon-user" /></span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder={this.props.t('User ID')}
                name="registerForm[username]"
                defaultValue={this.props.userName}
                onBlur={this.checkUserName}
                required
              />
            </div>
            <p className="form-text">{ unavailableUserId }</p>

            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="icon-tag" /></span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder={this.props.t('Name')}
                name="registerForm[name]"
                defaultValue={this.props.name}
                required
              />
            </div>

            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="icon-envelope" /></span>
              </div>
              <input
                type="email"
                className="form-control"
                placeholder={this.props.t('Email')}
                name="registerForm[email]"
                defaultValue={this.props.email}
                required
              />
            </div>

            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="icon-lock" /></span>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder={this.props.t('Password')}
                name="registerForm[password]"
                required
              />
            </div>

            <input type="hidden" name="_csrf" value={this.props.csrf} />

            <div className="input-group mt-4 mb-3 d-flex justify-content-center">
              <button type="submit" className="btn-fill btn btn-register" id="register">
                <div className="eff"></div>
                <span className="btn-label"><i className="icon-user-follow" /></span>
                <span className="btn-label-text">{ this.props.t('Create') }</span>
              </button>
            </div>

            <div className="input-group mt-4 d-flex justify-content-center">
              <a href="https://growi.org" className="link-growi-org">
                <span className="growi">GROWI</span>.<span className="org">ORG</span>
              </a>
            </div>
          </form>
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

export default withTranslation()(InstallerForm);
