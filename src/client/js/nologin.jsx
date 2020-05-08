import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import { I18nextProvider } from 'react-i18next';

import i18nFactory from './util/i18n';

import InstallerForm from './components/InstallerForm';
import LoginForm from './components/LoginForm';

import AppContainer from './services/AppContainer';
import LoginContainer from './services/LoginContainer';

const appContainer = new AppContainer();

const i18n = i18nFactory();

// render InstallerForm
const installerFormElem = document.getElementById('installer-form');
if (installerFormElem) {
  const userName = installerFormElem.dataset.userName;
  const name = installerFormElem.dataset.name;
  const email = installerFormElem.dataset.email;
  const csrf = installerFormElem.dataset.csrf;
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <InstallerForm userName={userName} name={name} email={email} csrf={csrf} />
    </I18nextProvider>,
    installerFormElem,
  );
}

// render loginForm
const loginFormElem = document.getElementById('login-form');
if (loginFormElem) {
  const loginContainer = new LoginContainer(appContainer);

  const isRegistering = loginFormElem.dataset.isRegistering === 'true';
  const username = loginFormElem.dataset.username;
  const name = loginFormElem.dataset.name;
  const email = loginFormElem.dataset.email;
  // [TODO][GW-2112] An AppContainer gets csrf data
  const csrf = loginFormElem.dataset.csrf;
  const isRegistrationEnabled = loginFormElem.dataset.isRegistrationEnabled === 'true';
  const registrationMode = loginFormElem.dataset.registrationMode;
  const registrationWhiteList = loginFormElem.dataset.registrationWhiteList;
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

  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <Provider inject={[loginContainer]}>
        <LoginForm
          isRegistering={isRegistering}
          username={username}
          name={name}
          email={email}
          csrf={csrf}
          isRegistrationEnabled={isRegistrationEnabled}
          registrationMode={registrationMode}
          registrationWhiteList={registrationWhiteList}
          isLocalStrategySetup={isLocalStrategySetup}
          isLdapStrategySetup={isLdapStrategySetup}
          objOfIsExternalAuthEnableds={objOfIsExternalAuthEnableds}
        />
      </Provider>
    </I18nextProvider>,
    loginFormElem,
  );
}
