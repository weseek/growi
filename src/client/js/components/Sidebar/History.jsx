import React from 'react';
// import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { JiraWordmark } from '@atlaskit/logo';

import {
  HeaderSection,
  MenuSection,
  Wordmark,
} from '@atlaskit/navigation-next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

class History extends React.Component {

  propTypes = {
  };

  state = {
  };

  render() {
    return (
      <>
        <HeaderSection>
          { () => (
            <div className="grw-product-nav-header">
              <Wordmark wordmark={JiraWordmark} />
            </div>
          ) }
        </HeaderSection>
        <MenuSection>
          { () => (
            <span>(TBD) History Contents</span>
          ) }
        </MenuSection>
      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const HistoryWrapper = (props) => {
  return createSubscribedElement(History, props, [AppContainer]);
};

export default withTranslation()(HistoryWrapper);
