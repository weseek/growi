import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';

import i18nFactory from './util/i18n';

import InstallerForm from './components/InstallerForm';
import LoginForm from './components/LoginForm';

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
  const username = loginFormElem.dataset.username;
  const name = loginFormElem.dataset.name;
  const email = loginFormElem.dataset.email;
  // [TODO][GW-1913] An AppContainer gets csrf data
  const csrf = loginFormElem.dataset.csrf;

  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <LoginForm
        username={username}
        name={name}
        email={email}
        csrf={csrf}
      />
    </I18nextProvider>,
    loginFormElem,
  );
}
