import React, { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import useRouter from 'next/router';

import { apiv3Post } from '~/client/util/apiv3-client';

import { useCsrfToken, useCurrentUser } from '../stores/context';

export type InvitedFormProps = {
  invitedFormUsername: string,
  invitedFormName: string,
}

export const InvitedForm = (props: InvitedFormProps): JSX.Element => {
  const { t } = useTranslation();
  // const { data: csrfToken } = useCsrfToken();
  const { data: user } = useCurrentUser();
  const router = useRouter();

  const { invitedFormUsername, invitedFormName } = props;

  const [usernameForInvited, setUsernameForInvited] = useState('');
  const [userForInvited, setUserForInvited] = useState('');
  const [passwordForInvited, setPasswordForInvited] = useState('');
  const [loginErrors, setLoginErrors] = useState<Error[]>([]);

  const handleInvitedWithLocalSubmit = useCallback(async(e) => {
    e.preventDefault();

    const invitedUserInfo = {
      username: usernameForInvited,
      name: userForInvited,
      password: passwordForInvited,
    };

    try {
      const res = await apiv3Post('/invited/activateInvited', { invitedUserInfo });
      const { redirectTo } = res.data;
      router.push(redirectTo);
    }
    catch (err) {
      setLoginErrors(err);
    }
    return;

  }, [usernameForInvited, userForInvited, passwordForInvited, router]);

  if (user == null) {
    return <></>;
  }

  return (
    <div className="noLogin-dialog p-3 mx-auto" id="noLogin-dialog">
      <p className="alert alert-success">
        <strong>{ t('invited.discription_heading') }</strong><br></br>
        <small>{ t('invited.discription') }</small>
      </p>
      <form role="form" onSubmit={handleInvitedWithLocalSubmit} id="invited-form">
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
            name="invitedForm[email]"
            defaultValue={user.email}
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
            value={invitedFormUsername}
            onChange = {(e) => { setUsernameForInvited(e.target.value) }}
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
            value={invitedFormName}
            onChange = {(e) => { setUserForInvited(e.target.value) }}
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
            onChange = {(e) => { setPasswordForInvited(e.target.value) }}
            name="invitedForm[password]"
            required
          />
        </div>
        {/* Create Button */}
        <div className="input-group justify-content-center d-flex mt-5">
          {/* <input type="hidden" name="_csrf" value={csrfToken} /> */}
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
