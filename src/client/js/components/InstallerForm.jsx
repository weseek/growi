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
      selectedLang: {},
    };
    // this.checkUserName = this.checkUserName.bind(this);
  }

  componentWillMount() {
    this.changeLanguage(localeMetadatas[0]);
  }

  // checkUserName(event) {
  //   const axios = require('axios').create({
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'X-Requested-With': 'XMLHttpRequest',
  //     },
  //     responseType: 'json',
  //   });
  //   axios.get('/_api/check_username', { params: { username: event.target.value } })
  //     .then((res) => { return this.setState({ isValidUserName: res.data.valid }) });
  // }

  changeLanguage(meta) {
    i18next.changeLanguage(meta.id);
    this.setState({ selectedLang: meta });
  }

  render() {
    const hasErrorClass = this.state.isValidUserName ? '' : ' has-error';
    const unavailableUserId = this.state.isValidUserName
      ? ''
      : <span><i className="icon-fw icon-ban" />{ this.props.t('installer.unavaliable_user_id') }</span>;

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
            <div className="dropdown mb-3">
              <div className="d-flex dropdown-with-icon">
                <i className="icon-bubbles border-0 rounded-0" />
                <button
                  type="button"
                  className="btn btn-secondary dropdown-toggle text-right w-100 border-0 shadow-none"
                  id="dropdownLanguage"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="true"
                >
                  <span className="float-left">
                    {this.state.selectedLang.displayName}
                  </span>
                </button>
                <input
                  type="hidden"
                  value={this.state.selectedLang.id}
                  name="registerForm[app:globalLang]"
                />
                <div className="dropdown-menu" aria-labelledby="dropdownLanguage">
                  {
                  localeMetadatas.map(meta => (
                    <button key={meta.id} className="dropdown-item" type="button" onClick={() => { this.changeLanguage(meta) }}>
                      {meta.displayName}
                    </button>
                  ))
                }
                </div>
              </div>
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
                // onBlur={this.checkUserName} // need not to check username before installation -- 2020.07.24 Yuki Takei
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
