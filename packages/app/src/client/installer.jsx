import React from 'react';

import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { SWRConfig } from 'swr';


import { swrGlobalConfiguration } from '~/utils/swr-utils';

import InstallerForm from '../components/InstallerForm';

import ContextExtractor from './services/ContextExtractor';
import { i18nFactory } from './util/i18n';

const i18n = i18nFactory();

const componentMappings = {};

// render InstallerForm
const installerFormContainerElem = document.getElementById('installer-form-container');
if (installerFormContainerElem) {
  const userName = installerFormContainerElem.dataset.userName;
  const name = installerFormContainerElem.dataset.name;
  const email = installerFormContainerElem.dataset.email;

  Object.assign(componentMappings, {
    'installer-form-container': <InstallerForm userName={userName} name={name} email={email} />,
  });
}

const renderMainComponents = () => {
  Object.keys(componentMappings).forEach((key) => {
    const elem = document.getElementById(key);
    if (elem) {
      ReactDOM.render(
        <I18nextProvider i18n={i18n}>
          <SWRConfig value={swrGlobalConfiguration}>
            {componentMappings[key]}
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
