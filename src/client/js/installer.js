import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';

import i18nFactory from './i18n';

import InstallerForm    from './components/InstallerForm';

const userlang = $('body').data('userlang');
const i18n = i18nFactory(userlang);

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
    installerFormElem
  );
}
