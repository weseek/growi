import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';

import i18nFactory from './util/i18n';

import LoginForm from './components/LoginForm';

const i18n = i18nFactory();

// render loginForm
const loginFormElem = document.getElementById('login-form');
if (loginFormElem) {
  const isRegistering = loginFormElem.dataset.isRegistering === 'true';
  const isLdapStrategySetup = loginFormElem.dataset.isLdapStrategySetup === 'true';
  const isLocalStrategySetup = loginFormElem.dataset.isLocalStrategySetup === 'true';
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <LoginForm isRegistering={isRegistering} isLdapStrategySetup={isLdapStrategySetup} isLocalStrategySetup={isLocalStrategySetup} />
    </I18nextProvider>,
    loginFormElem,
  );
}
