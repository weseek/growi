import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import AddIcon from '@atlaskit/icon/glyph/add';
import BacklogIcon from '@atlaskit/icon/glyph/backlog';
import BoardIcon from '@atlaskit/icon/glyph/board';
import GraphLineIcon from '@atlaskit/icon/glyph/graph-line';
import ShortcutIcon from '@atlaskit/icon/glyph/shortcut';
import SearchIcon from '@atlaskit/icon/glyph/search';
import { JiraIcon, JiraWordmark } from '@atlaskit/logo';

import {
  GlobalNav,
  GroupHeading,
  HeaderSection,
  Item,
  LayoutManager,
  MenuSection,
  NavigationProvider,
  Separator,
  Wordmark,
} from '@atlaskit/navigation-next';
import Drawer from '@atlaskit/drawer';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

class GlobalNavigation extends React.Component {

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


class Sidebar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isDrawerOpen: false,
    };

    this.renderContainerNavigation = this.renderContainerNavigation.bind(this);
  }

  renderContainerNavigation() {
    return (
      <div data-webdriver-test-key="container-navigation">
        <HeaderSection>
          { () => (
            <Wordmark wordmark={JiraWordmark} />
          ) }
        </HeaderSection>
        <MenuSection>
          {({ className }) => (
            <div className={className}>
              <Item
                before={BacklogIcon}
                text="Backlog"
                isSelected
              />
              <Item
                before={BoardIcon}
                text="Active sprints"
              />
              <Item
                before={GraphLineIcon}
                text="Reports"
              />
              <Separator />
              <GroupHeading>Shortcuts</GroupHeading>
              <Item before={ShortcutIcon} text="Project space" />
              <Item before={ShortcutIcon} text="Project repo" />
            </div>
          )}
        </MenuSection>
      </div>
    );
  }

  render() {
    return (
      <NavigationProvider>
        <LayoutManager
          globalNavigation={GlobalNavigation}
          productNavigation={() => null}
          containerNavigation={this.renderContainerNavigation}
        >
        </LayoutManager>
      </NavigationProvider>
    );
  }

}


/**
 * Wrapper component for using unstated
 */
const SidebarWrapper = (props) => {
  return createSubscribedElement(Sidebar, props, [AppContainer]);
};

Sidebar.propTypes = {
};

export default withTranslation()(SidebarWrapper);
