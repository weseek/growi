import React from 'react';

import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { SWRConfig } from 'swr';
import { Provider } from 'unstated';


import AppContainer from '~/client/services/AppContainer';
import CompleteUserRegistrationForm from '~/components/CompleteUserRegistrationForm';
import { swrGlobalConfiguration } from '~/utils/swr-utils';

import LoginForm from '../components/LoginForm';
import PasswordResetExecutionForm from '../components/PasswordResetExecutionForm';
import PasswordResetRequestForm from '../components/PasswordResetRequestForm';

import ContextExtractor from './services/ContextExtractor';
import { i18nFactory } from './util/i18n';

const i18n = i18nFactory();


const componentMappings = {};

const appContainer = new AppContainer();
appContainer.initApp();

// render loginForm
const loginFormElem = document.getElementById('login-form');
if (loginFormElem) {
  const username = loginFormElem.dataset.username;
  const name = loginFormElem.dataset.name;
  const email = loginFormElem.dataset.email;
  const isRegistrationEnabled = loginFormElem.dataset.isRegistrationEnabled === 'true';
  const isEmailAuthenticationEnabled = loginFormElem.dataset.isEmailAuthenticationEnabled === 'true';
  const registrationMode = loginFormElem.dataset.registrationMode;
  const isPasswordResetEnabled = loginFormElem.dataset.isPasswordResetEnabled === 'true';


  let registrationWhiteList = loginFormElem.dataset.registrationWhiteList;
  registrationWhiteList = registrationWhiteList.length > 0
    ? registrationWhiteList = loginFormElem.dataset.registrationWhiteList.split(',')
    : registrationWhiteList = [];


  const isLocalStrategySetup = loginFormElem.dataset.isLocalStrategySetup === 'true';
  const isLdapStrategySetup = loginFormElem.dataset.isLdapStrategySetup === 'true';
  const objOfIsExternalAuthEnableds = {
    google: loginFormElem.dataset.isGoogleAuthEnabled === 'true',
    github: loginFormElem.dataset.isGithubAuthEnabled === 'true',
    facebook: loginFormElem.dataset.isFacebookAuthEnabled === 'true',
    twitter: loginFormElem.dataset.isTwitterAuthEnabled === 'true',
    saml: loginFormElem.dataset.isSamlAuthEnabled === 'true',
    oidc: loginFormElem.dataset.isOidcAuthEnabled === 'true',
    basic: loginFormElem.dataset.isBasicAuthEnabled === 'true',
  };

  Object.assign(componentMappings, {
    [loginFormElem.id]: (
      <LoginForm
        username={username}
        name={name}
        email={email}
        isRegistrationEnabled={isRegistrationEnabled}
        isEmailAuthenticationEnabled={isEmailAuthenticationEnabled}
        registrationMode={registrationMode}
        registrationWhiteList={registrationWhiteList}
        isPasswordResetEnabled={isPasswordResetEnabled}
        isLocalStrategySetup={isLocalStrategySetup}
        isLdapStrategySetup={isLdapStrategySetup}
        objOfIsExternalAuthEnableds={objOfIsExternalAuthEnableds}
      />
    ),
  });
}

// render PasswordResetRequestForm
const passwordResetRequestFormElem = document.getElementById('password-reset-request-form');
if (passwordResetRequestFormElem) {
  Object.assign(componentMappings, {
    [passwordResetRequestFormElem.id]: <PasswordResetRequestForm />,
  });
}

// render PasswordResetExecutionForm
const passwordResetExecutionFormElem = document.getElementById('password-reset-execution-form');
if (passwordResetExecutionFormElem) {
  Object.assign(componentMappings, {
    [passwordResetExecutionFormElem.id]: <PasswordResetExecutionForm />,
  });
}

// render UserActivationForm
const UserActivationForm = document.getElementById('user-activation-form');
if (UserActivationForm) {
  const messageErrors = UserActivationForm.dataset.messageErrors;
  const inputs = UserActivationForm.dataset.inputs;
  const email = UserActivationForm.dataset.email;
  const token = UserActivationForm.dataset.token;

  Object.assign(componentMappings, {
    [UserActivationForm.id]: (
      <CompleteUserRegistrationForm
        messageErrors={messageErrors}
        inputs={inputs}
        email={email}
        token={token}
      />
    ),
  });
}

const renderMainComponents = () => {
  Object.keys(componentMappings).forEach((key) => {
    const elem = document.getElementById(key);
    if (elem) {
      ReactDOM.render(
        <I18nextProvider i18n={i18n}>
          <SWRConfig value={swrGlobalConfiguration}>
            <Provider inject={[appContainer]}>
              {componentMappings[key]}
            </Provider>
          </SWRConfig>
        </I18nextProvider>,
        elem,
      );
    }
  });
};

// extract context before rendering main components
const elem = document.getElementById('growi-context-extractor');
if (elem != null) {
  ReactDOM.render(
    <SWRConfig value={swrGlobalConfiguration}>
      <ContextExtractor></ContextExtractor>
    </SWRConfig>,
    elem,
    renderMainComponents,
  );
}
else {
  renderMainComponents();
}
