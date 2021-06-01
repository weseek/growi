import { useRouter } from 'next/router';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Validate } from 'react-hook-form';

import { i18n, config, useTranslation } from '~/i18n';
import { ErrorV3 } from '~/models/error-v3';

import { apiv3Get, apiv3Post } from '../util/apiv3-client';

type FormValues = {
  username: string,
  name: string,
  email: string,
  password: string,
}

const LanguageDropdownMenu = (): JSX.Element => {
  const elements: JSX.Element[] = config.allLanguages.map((lang) => {
    const fixedT = i18n.getFixedT(lang);
    return (
      <button key={lang} className="dropdown-item" type="button" onClick={() => { i18n.changeLanguage(lang) }}>
        {fixedT('meta.display_name')}
      </button>
    );
  });

  return <>{elements}</>;
};

const InstallerForm = (): JSX.Element => {
  const router = useRouter();
  const { t } = useTranslation();
  const { handleSubmit, register } = useForm({ mode: 'onBlur' });

  const [isMounted, setIsMounted] = useState(false);
  const [isSubmittingDisabled, setIsSubmittingDisabled] = useState(false);
  const [isValidUserName, setIsValidUserName] = useState(true);
  const [serverErrors, setServerErrors] = useState<ErrorV3[]>([]);

  useEffect(() => setIsMounted(true), []);

  const validateUsername: Validate = async(value) => {
    try {
      const { data } = await apiv3Get('/users/exists', { username: value });
      const isExists = data.exists;

      if (isExists) {
        setIsValidUserName(false);
        setServerErrors([new ErrorV3(`Username '${value}' exists.`)]);
      }
    }
    catch (errors) {
      setServerErrors(errors);
    }

    // return true as React Hook Form validation
    return true;
  };

  const submitHandler: SubmitHandler<FormValues> = async(formValues) => {
    const { language } = i18n;
    const postData = { ...formValues, language };

    try {
      setIsSubmittingDisabled(true);

      const { data } = await apiv3Post('/install', postData);

      const { isLoggedIn } = data;

      if (isLoggedIn) {
        router.replace('/');
      }
      else {
        router.replace('/login');
      }
    }
    catch (errors) {
      setServerErrors(errors);
    }
    finally {
      setIsSubmittingDisabled(false);
    }
  };

  const hasErrorClass = isValidUserName ? '' : 'has-error';
  const unavailableUserId = isValidUserName
    ? ''
    : <span><i className="icon-fw icon-ban" />{ t('installer.unavaliable_user_id') }</span>;

  return (
    <div className={`login-dialog p-3 mx-auto ${hasErrorClass}`}>
      <div className="row">
        <div className="col-md-12">
          <p className="alert alert-success">
            <strong>{ t('installer.create_initial_account') }</strong><br />
            <small>{ t('installer.initial_account_will_be_administrator_automatically') }</small>
          </p>
        </div>
      </div>

      { serverErrors.length > 0 && (
        <div className="row">
          <div className="col-md-12">
            <div className="login-form-errors px-3">
              <div className="alert alert-danger">
                <ul className="mb-0">
                  { serverErrors.map(error => <li key={error.code}>{error.message}</li>) }
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) }

      <div className="row">
        <form role="form" className="col-md-12" onSubmit={handleSubmit(submitHandler)}>
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
                  {t('meta.display_name')}
                </span>
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownLanguage">
                { isMounted && <LanguageDropdownMenu /> }
              </div>
            </div>
          </div>

          <div className={`input-group mb-3 ${hasErrorClass}`}>
            <div className="input-group-prepend">
              <span className="input-group-text"><i className="icon-user" /></span>
            </div>
            <input
              name="username"
              className="form-control"
              placeholder={t('User ID')}
              ref={register({
                validate: async value => validateUsername(value),
              })}
            />
          </div>
          <p className="form-text">{ unavailableUserId }</p>

          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text"><i className="icon-tag" /></span>
            </div>
            <input
              name="name"
              className="form-control"
              placeholder={t('Name')}
              ref={register}
            />
          </div>

          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text"><i className="icon-envelope" /></span>
            </div>
            <input
              name="email"
              className="form-control"
              placeholder={t('Email')}
              ref={register}
            />
          </div>

          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text"><i className="icon-lock" /></span>
            </div>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder={t('Password')}
              ref={register}
            />
          </div>

          <div className="input-group mt-4 mb-3 d-flex justify-content-center">
            <button type="submit" className="btn-fill btn btn-register" disabled={isSubmittingDisabled}>
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
