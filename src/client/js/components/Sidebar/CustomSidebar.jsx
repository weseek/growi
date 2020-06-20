import React from 'react';
// import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
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
        <div className="grw-sidebar-content-header p-3 d-flex">
          <h3 className="mb-0">Custom Sidebar</h3>
          <button type="button" className="btn btn-sm btn-outline-secondary ml-auto" onClick={this.reloadData}>
            <i className="icon icon-reload"></i>
          </button>
        </div>
        <div className="grw-sidebar-content-header p-3">
          (TBD) Under implementation
        </div>
      </>
    );

  }

}

/**
 * Wrapper component for using unstated
 */
const CustomSidebarWrapper = withUnstatedContainers(CustomSidebar, [AppContainer]);

export default withTranslation()(CustomSidebarWrapper);
