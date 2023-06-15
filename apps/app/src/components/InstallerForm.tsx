import {
  FormEventHandler, memo, useCallback, useState,
} from 'react';

import { Lang, AllLang } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { i18n as i18nConfig } from '^/config/next-i18next.config';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';

const InstallerForm = memo((): JSX.Element => {
  const { t, i18n } = useTranslation();

  const router = useRouter();

  const isSupportedLang = AllLang.includes(i18n.language as Lang);

  const [isValidUserName, setValidUserName] = useState(true);
  const [isSubmittingDisabled, setSubmittingDisabled] = useState(false);
  const [currentLocale, setCurrentLocale] = useState(isSupportedLang ? i18n.language : Lang.en_US);

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

  const onClickLanguageItem = useCallback((locale) => {
    i18n.changeLanguage(locale);
    setCurrentLocale(locale);
  }, [i18n]);

  const submitHandler: FormEventHandler = useCallback(async(e: any) => {
    e.preventDefault();

    if (isSubmittingDisabled) {
      return;
    }

    setSubmittingDisabled(true);
    setTimeout(() => {
      setSubmittingDisabled(false);
    }, 3000);

    if (e.target.elements == null) {
      return;
    }

    const formData = e.target.elements;

    const {
      'registerForm[username]': { value: username },
      'registerForm[name]': { value: name },
      'registerForm[email]': { value: email },
      'registerForm[password]': { value: password },
    } = formData;

    const data = {
      registerForm: {
        username,
        name,
        email,
        password,
        'app:globalLang': currentLocale,
      },
    };

    try {
      await apiv3Post('/installer', data);
      router.push('/');
    }
    catch (errs) {
      const err = errs[0];
      const code = err.code;

      if (code === 'failed_to_login_after_install') {
        toastError(t('installer.failed_to_login_after_install'));
        setTimeout(() => { router.push('/login') }, 700); // Wait 700 ms to show toastr
      }

      toastError(t('installer.failed_to_install'));
    }
  }, [isSubmittingDisabled, currentLocale, router, t]);

  const hasErrorClass = isValidUserName ? '' : ' has-error';
  const unavailableUserId = isValidUserName
    ? ''
    : <span><i className="icon-fw icon-ban" />{ t('installer.unavaliable_user_id') }</span>;

  return (
    <div data-testid="installerForm" className={`nologin-dialog p-3 mx-auto${hasErrorClass}`}>
      <div className="row">
        <div className="col-md-12">
          <p className="alert alert-success">
            <strong>{ t('installer.create_initial_account') }</strong><br />
            <small>{ t('installer.initial_account_will_be_administrator_automatically') }</small>
          </p>
        </div>
      </div>
      <div className="row">
        <form role="form" id="register-form" className="col-md-12" onSubmit={submitHandler}>
          <div className="dropdown mb-3">
            <div className="input-group">
              <div className="input-group-prepend dropdown-with-icon">
                <i className="input-group-text icon-bubbles border-0 rounded-0" />
              </div>
              <button
                type="button"
                className="btn btn-secondary dropdown-toggle form-control text-right rounded-right"
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
                        onClick={() => { onClickLanguageItem(locale) }}
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

          <div className="input-group mt-4 d-flex justify-content-center">
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

          <div>
            <a href="https://growi.org" className="link-growi-org">
              <span className="growi">GROWI</span>.<span className="org">org</span>
            </a>
          </div>

        </form>
      </div>
    </div>
  );
});

InstallerForm.displayName = 'InstallerForm';

export default InstallerForm;
