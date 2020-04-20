import React from 'react';
// import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  HeaderSection,
  MenuSection,
} from '@atlaskit/navigation-next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

class CustomSidebar extends React.Component {

  static propTypes = {
  };

  state = {
  };

  renderHeaderWordmark() {
    return <h3>Custom Sidebar</h3>;
  }

  render() {
    return (
      <>
        <HeaderSection>
          { () => (
            <div className="grw-sidebar-header-container">
              {this.renderHeaderWordmark()}
            </div>
          ) }
        </HeaderSection>
        <MenuSection>
          { () => (
            <div className="grw-sidebar-content-container">
              <span>(TBD) CustomSidebar Contents</span>
            </div>
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
