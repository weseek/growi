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
      <div className="grw-sidebar-custom">
        <HeaderSection>
          { () => (
            <div className="grw-sidebar-header-container p-3 d-flex">
              <h3>Custom Sidebar</h3>
              <button type="button" className="btn btn-xs btn-outline-secondary ml-auto" onClick={this.reloadData}>
                <i className="icon icon-reload"></i>
              </button>
            </div>
          ) }
        </HeaderSection>
        <MenuSection>
          { () => (
            <div className="grw-sidebar-content-container p-3">
              (TBD) Under implemented
            </div>
          ) }
        </MenuSection>
      </div>
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
