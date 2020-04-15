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

class CustomSidebar extends React.Component {

  static propTypes = {
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
            <span>(TBD) CustomSidebar Contents</span>
          ) }
        </MenuSection>
      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const CustomSidebarWrapper = (props) => {
  return createSubscribedElement(CustomSidebar, props, [AppContainer]);
};

export default withTranslation()(CustomSidebarWrapper);
