import React, { useEffect, useState } from 'react';

import { useTranslation, i18n } from 'next-i18next';

import { i18n as i18nConfig } from '^/config/next-i18next.config';

import { apiv3Get } from '~/client/util/apiv3-client';
import { usePersonalSettings } from '~/stores/personal-settings';

import { useCsrfToken, useCurrentUser } from '../../stores/context';
// import { toastError, toastSuccess } from '../client/util/apiNotification';


type InvitedFormProps = {
  // csrfToken: string,
  // isEmailAuthenticationEnabled: boolean,
  username: string,
  // isRegistering: boolean,
  name: string,
  // email: string,
  // user: any,
  // isMailerSetup: boolean,

  // isLocalOrLdapStrategiesEnabled: boolean,
  // isSomeExternalAuthEnabled: boolean,
  // isPasswordResetEnabled: boolean,
  // isRegistrationEnabled: boolean,
}

export const InvitedForm = (props: InvitedFormProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: csrfToken } = useCsrfToken();
  const { data: user } = useCurrentUser();
  const {
    data: personalSettingsInfo, mutate: mutatePersonalSettings, sync, updateBasicInfo, error,
  } = usePersonalSettings();

  const {
    username, name,
  } = props;

  if (user == null) {
    return <></>;
  }

  const submitHandler = async() => {
    try {
      await updateBasicInfo();
      sync();
      // toastSuccess(t('toaster.update_successed', { target: t('Basic Info') }));
    }
    catch (err) {
      // toastError(err);
    }
  };

  const changePersonalSettingsHandler = (updateData) => {
    if (personalSettingsInfo == null) {
      return;
    }
    mutatePersonalSettings({ ...personalSettingsInfo, ...updateData });
  };

  // TODO: check flow
  // TODO: check noLoing-dialog
  // TODO: Check loginForm[app:globalLang]
  return (
    <div className="noLogin-dialog p-3 mx-auto" id="noLogin-dialog">
      <p className="alert alert-success">
        <strong>{ t('invited.discription_heading') }</strong><br></br>
        <small>{ t('invited.discription') }</small>
      </p>
      <form role="form" action="/login/activateInvited" method="post" id="invited-form">
        {/* Language Menu */}
        <div className="dropdown mb-3">
          <div className="d-flex dropdown-with-icon">
            <i className="icon-bubbles border-0 rounded-0"></i>
            <button
              type="button"
              className="btn btn-secondary dropdown-toggle text-right w-100 border-0 shadow-none"
              id="dropdownLanguage"
              data-testid="dropdownLanguage"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="true"
            >
              <span className="float-left">{t('meta.display_name')}</span>
            </button>
            <input type="hidden" name="loginForm[app:globalLang]" />
            <div className="dropdown-menu" aria-labelledby="dropdownLanguage">
              { i18nConfig.locales.map((locale) => {
                const fixedT = i18n.getFixedT(locale);

                return (
                  <button
                    key={locale}
                    data-testid={`dropdownLanguageMenu-${locale}`}
                    className="dropdown-item"
                    type="button"
                    onClick={() => changePersonalSettingsHandler({ lang: locale })}
                  >
                    {fixedT('meta.display_name')}
                  </button>
                );
              }) }
            </div>
          </div>
        </div>
        <div className="row my-3">
          <div className="offset-4 col-5">
            <button
              data-testid="grw-besic-info-settings-update-button"
              type="button"
              className="btn btn-primary"
              onClick={submitHandler}
              disabled={error != null}
            >
              {t('Update')}
            </button>
          </div>
        </div>
        {/* Email Form */}
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-envelope"></i>
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            disabled
            placeholder={t('Email')}
            name="invitedForm[email]" // ?
            defaultValue={user.email} // value = user.email
            required
          />
        </div>
        {/* UserID Form */}
        <div className="input-group" id="input-group-username">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-user"></i>
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder={t('User ID')}
            name="invitedForm[username]"
            defaultValue={username} // value =req.body.invitedForm.username
            required
          />
        </div>
        {/* Name Form */}
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-tag"></i>
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder={t('Name')}
            name="invitedForm[name]"
            defaultValue={name} // value = req.body.invitedForm.name
            required
          />
        </div>
        {/* Password Form */}
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="icon-lock"></i>
            </span>
          </div>
          <input
            type="password"
            className="form-control"
            placeholder={t('Password')}
            name="invitedForm[password]"
            required
          />
        </div>
        {/* Create Button */}
        <div className="input-group justify-content-center d-flex mt-5">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <button type="submit" className="btn btn-fill" id="register">
            <div className="eff"></div>
            <span className="btn-label"><i className="icon-user-follow"></i></span>
            <span className="btn-label-text">{t('Create')}</span>
          </button>
        </div>
      </form>
      <div className="input-group mt-5 d-flex justify-content-center">
        <a href="https://growi.org" className="link-growi-org">
          <span className="growi">GROWI</span>.<span className="org">ORG</span>
        </a>
      </div>
    </div>
  );
};
