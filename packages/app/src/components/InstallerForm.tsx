import { memo, useCallback, useState } from 'react';

import i18next from 'i18next';
import { useTranslation, i18n } from 'next-i18next';

import { i18n as i18nConfig } from '^/config/next-i18next.config';

type Props = {
  userName: string,
  name: string,
  email: string,
};

const InstallerForm = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const [isValidUserName, setValidUserName] = useState(true);
  const [isSubmittingDisabled, setSubmittingDisabled] = useState(false);

  const checkUserName = useCallback(async(event) => {
    const axios = require('axios').create({
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      responseType: 'json',
    });
    const res = await axios.get('/_api/v3/check-username', { params: { username: event.target.value } });
    setValidUserName(res.data.valid);
  }, []);

  // TODO: XHRize https://redmine.weseek.co.jp/issues/105252
  const submitHandler = useCallback(() => {
    if (isSubmittingDisabled) {
      return;
    }

    setSubmittingDisabled(true);
    setTimeout(() => {
      setSubmittingDisabled(false);
    }, 3000);
  }, [isSubmittingDisabled]);

  const hasErrorClass = isValidUserName ? '' : ' has-error';
  const unavailableUserId = isValidUserName
    ? ''
    : <span><i className="icon-fw icon-ban" />{ t('installer.unavaliable_user_id') }</span>;

  return (
    <div data-testid="installerForm" className={`noLogin-dialog p-3 mx-auto${hasErrorClass}`}>
      <div className="row">
        <div className="col-md-12">
          <p className="alert alert-success">
            <strong>{ t('installer.create_initial_account') }</strong><br />
            <small>{ t('installer.initial_account_will_be_administrator_automatically') }</small>
          </p>
        </div>
      </div>
      <div className="row">
        <form role="form" action="/installer" method="post" id="register-form" className="col-md-12" onSubmit={submitHandler}>
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
                    let fixedT;
                    if (i18n != null) {
                      fixedT = i18n.getFixedT(locale);
                      i18n.loadLanguages(i18nConfig.locales);
                    }

                    return (
                      <button
                        key={locale}
                        data-testid={`dropdownLanguageMenu-${locale}`}
                        className="dropdown-item"
                        type="button"
                        onClick={() => { i18next.changeLanguage(locale) }}
                      >
                        {fixedT?.('meta.display_name')}
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
              placeholder={t('User ID')}
              name="registerForm[username]"
              defaultValue={props.userName}
              // onBlur={checkUserName} // need not to check username before installation -- 2020.07.24 Yuki Takei
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
              placeholder={t('Name')}
              name="registerForm[name]"
              defaultValue={props.name}
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
              placeholder={t('Email')}
              name="registerForm[email]"
              defaultValue={props.email}
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
              placeholder={t('Password')}
              name="registerForm[password]"
              required
            />
          </div>

          <div className="input-group mt-4 mb-3 d-flex justify-content-center">
            <button
              data-testid="btnSubmit"
              type="submit"
              className="btn-fill btn btn-register"
              id="register"
              disabled={isSubmittingDisabled}
            >
              <div className="eff"></div>
              <span className="btn-label"><i className="icon-user-follow" /></span>
              <span className="btn-label-text">{ t('Create') }</span>
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
};

export default InstallerForm;
