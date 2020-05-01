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

  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <Provider inject={[appContainer, loginContainer]}>
        <LoginForm isRegistering={isRegistering} username={username} name={name} email={email} />
      </Provider>
    </I18nextProvider>,
    loginFormElem,
  );
}
