import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import AddIcon from '@atlaskit/icon/glyph/add';
import SearchIcon from '@atlaskit/icon/glyph/search';
import { JiraIcon } from '@atlaskit/logo';

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
      <div>
        <GlobalNav
          primaryItems={[
            {
              id: 'jira',
              icon: () => <JiraIcon size="medium" label="Jira" />,
              label: 'Jira',
            },
            {
              id: 'search',
              icon: SearchIcon,
              label: 'Search',
              onClick: this.openDrawer,
            },
            { id: 'create', icon: AddIcon, label: 'Add' },
          ]}
          secondaryItems={[]}
        />
        <Drawer onClose={this.closeDrawer} isOpen={isDrawerOpen} width="wide">
          <code>Drawer contents</code>
        </Drawer>
      </div>
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
