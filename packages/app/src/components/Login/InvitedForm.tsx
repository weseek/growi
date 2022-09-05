import React from 'react';

import { useTranslation } from 'next-i18next';
import ReactCardFlip from 'react-card-flip';

import { useCsrfToken } from '~/stores/context';

type InvitedFormProps = {
  csrfToken: string,
  isRegistering: boolean,
  isLocalOrLdapStrategiesEnabled: boolean,
  isSomeExternalAuthEnabled: boolean,
  isPasswordResetEnabled: boolean,
  isRegistrationEnabled: boolean,
}

const switchForm = () => {

};

const renderLocalOrLdapLoginForm = () => {

};

const renderExternalAuthLoginForm = () => {

};

const renderRegisterForm = () => {

};

export const InvitedForm = (props: InvitedFormProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: csrfToken } = useCsrfToken();

  const {
    isRegistering, isLocalOrLdapStrategiesEnabled, isSomeExternalAuthEnabled, isPasswordResetEnabled, isRegistrationEnabled,
  } = props;

  // TODO: i18n, checkcsrfToken
  return (
    <div className="col-md-12">
      <div className="noLogin-dialog mx-auto" id="noLogin-dialog">
        <div className="row mx-0">
          <div className="col-12">
            <ReactCardFlip isFlipped={isRegistering} flipDirection="horizontal" cardZIndex="3">
              <div className="front">
                {isLocalOrLdapStrategiesEnabled && renderLocalOrLdapLoginForm()}
                {isSomeExternalAuthEnabled && renderExternalAuthLoginForm()}
                {isLocalOrLdapStrategiesEnabled && isPasswordResetEnabled && (
                  <div className="text-right mb-2">
                    <a href="/forgot-password" className="d-block link-switch">
                      <i className="icon-key"></i> {t('forgot_password.forgot_password')}
                    </a>
                  </div>
                )}
                {isRegistrationEnabled && (
                  <div className="text-right mb-2">
                    <a href="#register" id="register" className="link-switch" onClick={() => switchForm()}>
                      <i className="ti ti-check-box"></i> {t('Sign up is here')}
                    </a>
                  </div>
                )}
              </div>
              <div className="back">
                {isRegistrationEnabled && renderRegisterForm()}
              </div>
            </ReactCardFlip>
          </div>
        </div>
        <a href="https://growi.org" className="link-growi-org pl-3">
          <span className="growi">GROWI</span>.<span className="org">ORG</span>
        </a>
      </div>
    </div>
  );
};
