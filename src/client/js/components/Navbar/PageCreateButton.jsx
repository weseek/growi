import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

const PageCreateButton = (props) => {
  const { t, appContainer, isIcon } = props;

  if (isIcon) {
    return (
      <button className="btn btn-lg btn-primary rounded-circle waves-effect waves-light" type="button" onClick={appContainer.openPageCreateModal}>
        <i className="icon-pencil"></i>
      </button>
    );
  }

  return (
    <button className="nav-link create-page border-0 bg-transparent" type="button" onClick={appContainer.openPageCreateModal}>
      <i className="icon-pencil mr-2"></i>
      <span>{ t('New') }</span>
    </button>
  );
};

/**
 * Wrapper component for using unstated
 */
const PageCreateButtonWrapper = (props) => {
  return createSubscribedElement(PageCreateButton, props, [AppContainer]);
};


PageCreateButton.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isIcon: PropTypes.bool,
};

export default withTranslation()(PageCreateButtonWrapper);
