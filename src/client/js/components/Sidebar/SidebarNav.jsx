import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import EditIcon from '@atlaskit/icon/glyph/edit';
import TrayIcon from '@atlaskit/icon/glyph/tray';

import {
  GlobalNav,
} from '@atlaskit/navigation-next';
import Drawer from '@atlaskit/drawer';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

class SidebarNav extends React.Component {

  propTypes = {
  };

  state = {
    isDrawerOpen: false,
  };

  openDrawer = () => this.setState({ isDrawerOpen: true });

  closeDrawer = () => this.setState({ isDrawerOpen: false });

  render() {
    const { isDrawerOpen } = this.state;
    return (
      <>
        <GlobalNav
          primaryItems={[
            { id: 'create', icon: EditIcon, label: 'Create' },
            {
              id: 'drawer', icon: TrayIcon, label: 'Drawer', onClick: this.openDrawer,
            },
          ]}
          secondaryItems={[]}
        />
        <Drawer onClose={this.closeDrawer} isOpen={isDrawerOpen} width="wide">
          <code>Drawer contents</code>
        </Drawer>
      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SidebarNavWrapper = (props) => {
  return createSubscribedElement(SidebarNav, props, [AppContainer]);
};

export default withTranslation()(SidebarNavWrapper);
