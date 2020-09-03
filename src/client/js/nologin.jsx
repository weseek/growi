import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';

import AppContainer from './services/AppContainer';

import InstallerForm from './components/InstallerForm';
import LoginForm from './components/LoginForm';

// render InstallerForm
const installerFormElem = document.getElementById('installer-form');
if (installerFormElem) {
  const userName = installerFormElem.dataset.userName;
  const name = installerFormElem.dataset.name;
  const email = installerFormElem.dataset.email;
  const csrf = installerFormElem.dataset.csrf;
  ReactDOM.render(
    <InstallerForm userName={userName} name={name} email={email} csrf={csrf} />,
    installerFormElem,
  );
}

// render loginForm
const loginFormElem = document.getElementById('login-form');
if (loginFormElem) {
  const appContainer = new AppContainer();
  appContainer.initApp();

  const username = loginFormElem.dataset.username;
  const name = loginFormElem.dataset.name;
  const email = loginFormElem.dataset.email;
  const isRegistrationEnabled = loginFormElem.dataset.isRegistrationEnabled === 'true';
  const registrationMode = loginFormElem.dataset.registrationMode;


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

  ReactDOM.render(
    <Provider inject={[appContainer]}>
      <LoginForm
        username={username}
        name={name}
        email={email}
        isRegistrationEnabled={isRegistrationEnabled}
        registrationMode={registrationMode}
        registrationWhiteList={registrationWhiteList}
        isLocalStrategySetup={isLocalStrategySetup}
        isLdapStrategySetup={isLdapStrategySetup}
        objOfIsExternalAuthEnableds={objOfIsExternalAuthEnableds}
      />
    </Provider>,
    loginFormElem,
  );
}
