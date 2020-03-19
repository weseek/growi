import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import BacklogIcon from '@atlaskit/icon/glyph/backlog';
import BoardIcon from '@atlaskit/icon/glyph/board';
import GraphLineIcon from '@atlaskit/icon/glyph/graph-line';
import ShortcutIcon from '@atlaskit/icon/glyph/shortcut';
import { JiraWordmark } from '@atlaskit/logo';

import {
  GroupHeading,
  HeaderSection,
  Item,
  LayoutManager,
  MenuSection,
  NavigationProvider,
  Separator,
  Wordmark,
  ThemeProvider, modeGenerator,
} from '@atlaskit/navigation-next';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

import SidebarNav from './Sidebar/SidebarNav';

class Sidebar extends React.Component {

  static propTypes = {
  };

  state = {
  };

  renderSidebarContents = () => (
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
          <div className="grw-product-nav-menu">
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
        ) }
      </MenuSection>
    </>
  );

  render() {
    return (
      <ThemeProvider
        theme={theme => ({
          ...theme,
          context: 'product',
          mode: modeGenerator({
            product: { text: '#ffffff', background: '#202b35' },
          }),
        })}
      >
        <NavigationProvider>
          <LayoutManager
            globalNavigation={SidebarNav}
            productNavigation={() => null}
            containerNavigation={this.renderSidebarContents}
            experimental_flyoutOnHover
            experimental_alternateFlyoutBehaviour
            experimental_fullWidthFlyout
            showContextualNavigation
          >
          </LayoutManager>
        </NavigationProvider>
      </ThemeProvider>
    );
  }

}


/**
 * Wrapper component for using unstated
 */
const SidebarWrapper = (props) => {
  return createSubscribedElement(Sidebar, props, [AppContainer]);
};

export default withTranslation()(SidebarWrapper);
