import React from 'react';

import i18next from 'i18next';
import { useTranslation, i18n } from 'next-i18next';
import PropTypes from 'prop-types';

import { i18n as i18nConfig } from '^/config/next-i18next.config';

import { useCsrfToken } from '~/stores/context';

class InstallerForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isValidUserName: true,
      isSubmittingDisabled: false,
    };
    this.checkUserName = this.checkUserName.bind(this);

    this.submitHandler = this.submitHandler.bind(this);
  }

  checkUserName(event) {
    const axios = require('axios').create({
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      responseType: 'json',
    });
    axios.get('/_api/v3/check-username', { params: { username: event.target.value } })
      .then((res) => { return this.setState({ isValidUserName: res.data.valid }) });
  }

  submitHandler() {
    if (this.state.isSubmittingDisabled) {
      return;
    }

    this.setState({ isSubmittingDisabled: true });
    setTimeout(() => {
      this.setState({ isSubmittingDisabled: false });
    }, 3000);
  }

  render() {
    const { t } = this.props;
    const hasErrorClass = this.state.isValidUserName ? '' : ' has-error';
    const unavailableUserId = this.state.isValidUserName
      ? ''
      : <span><i className="icon-fw icon-ban" />{ this.props.t('installer.unavaliable_user_id') }</span>;

    return (
      <div data-testid="installerForm" className={`noLogin-dialog p-3 mx-auto${hasErrorClass}`}>
        <div className="row">
          <div className="col-md-12">
            <p className="alert alert-success">
              <strong>{ this.props.t('installer.create_initial_account') }</strong><br />
              <small>{ this.props.t('installer.initial_account_will_be_administrator_automatically') }</small>
            </p>
          </div>
        </div>
        <div className="row">
          <form role="form" action="/installer" method="post" id="register-form" className="col-md-12" onSubmit={this.submitHandler}>
            <div className="dropdown mb-3">
              <div className="d-flex dropdown-with-icon">
                <i className="icon-bubbles border-0 rounded-0" />
                <button
                  type="button"
                  className="btn btn-secondary dropdown-toggle text-right w-100 border-0 shadow-none"
                  id="dropdownLanguage"
                  data-testid="dropdownLanguage"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="true"
                >
                  <span className="float-left">
                    {t('meta.display_name')}
                  </span>
                </button>
                <input
                  type="hidden"
                  name="registerForm[app:globalLang]"
                />
                <div className="dropdown-menu" aria-labelledby="dropdownLanguage">
                  {
                    i18nConfig.locales.map((locale) => {
                      const fixedT = i18n.getFixedT(locale);
                      i18n.loadLanguages(i18nConfig.locales);

                      return (
                        <button
                          key={locale}
                          data-testid={`dropdownLanguageMenu-${locale}`}
                          className="dropdown-item"
                          type="button"
                          onClick={() => { i18next.changeLanguage(locale) }}
                        >
                          {fixedT('meta.display_name')}
                        </button>
                      );
                    })
                  }
                </div>
              </div>
            </div>

            <div className={`input-group mb-3${hasErrorClass}`}>
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="icon-user" /></span>
              </div>
              <input
                data-testid="tiUsername"
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
                data-testid="tiName"
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
                data-testid="tiEmail"
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
                data-testid="tiPassword"
                type="password"
                className="form-control"
                placeholder={this.props.t('Password')}
                name="registerForm[password]"
                required
              />
            </div>

            <input type="hidden" name="_csrf" value={this.props.csrfToken} />

            <div className="input-group mt-4 mb-3 d-flex justify-content-center">
              <button
                data-testid="btnSubmit"
                type="submit"
                className="btn-fill btn btn-register"
                id="register"
                disabled={this.state.isSubmittingDisabled}
              >
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
  csrfToken: PropTypes.string,
};

const InstallerFormWrapperFC = (props) => {
  const { t } = useTranslation();
  const { data: csrfToken } = useCsrfToken();

  return <InstallerForm t={t} csrfToken={csrfToken} {...props} />;
};

export default InstallerFormWrapperFC;
