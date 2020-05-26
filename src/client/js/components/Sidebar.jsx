import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  withNavigationUIController,
  LayoutManager,
  NavigationProvider,
  ThemeProvider,
} from '@atlaskit/navigation-next';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

import SidebarNav from './Sidebar/SidebarNav';
import RecentChanges from './Sidebar/RecentChanges';
import CustomSidebar from './Sidebar/CustomSidebar';


const sidebarDefaultWidth = 240;

class Sidebar extends React.Component {

  static propTypes = {
    appContainer: PropTypes.instanceOf(AppContainer).isRequired,
    navigationUIController: PropTypes.any.isRequired,
  };

  state = {
    currentContentsId: 'recent',
  };

  componentWillMount() {
    this.initBreakpointEvents();
  }

  initBreakpointEvents() {
    const { appContainer, navigationUIController } = this.props;

    const mdOrAvobeHandler = (mql) => {
      // sm -> md
      if (mql.matches) {
        appContainer.setState({ isDrawerOpened: false });
        navigationUIController.enableResize();

        // restore width
        if (this.sidebarWidthCached != null) {
          navigationUIController.setState({ productNavWidth: this.sidebarWidthCached });
        }
      }
      // md -> sm
      else {
        // cache width
        this.sidebarWidthCached = navigationUIController.state.productNavWidth;

        appContainer.setState({ isDrawerOpened: false });
        navigationUIController.disableResize();
        navigationUIController.expand();

        // fix width
        navigationUIController.setState({ productNavWidth: sidebarDefaultWidth });
      }
    };

    appContainer.addBreakpointEvents('md', mdOrAvobeHandler, true);
  }

  backdropClickedHandler = () => {
    const { appContainer } = this.props;
    appContainer.setState({ isDrawerOpened: false });
  }

  itemSelectedHandler = (contentsId) => {
    const { navigationUIController } = this.props;
    const { currentContentsId } = this.state;

    // already selected
    if (currentContentsId === contentsId) {
      navigationUIController.toggleCollapse();
    }
    // switch and expand
    else {
      this.setState({ currentContentsId: contentsId });
      navigationUIController.expand();
    }
  }

  renderGlobalNavigation = () => (
    <SidebarNav currentContentsId={this.state.currentContentsId} onItemSelected={this.itemSelectedHandler} />
  );

  renderSidebarContents = () => {
    let contents = <CustomSidebar />;

    switch (this.state.currentContentsId) {
      case 'recent':
        contents = <RecentChanges />;
        break;
    }

    return contents;
  }

  render() {
    const { isDrawerOpened } = this.props.appContainer.state;

    return (
      <>
        <div className={`grw-sidebar ${isDrawerOpened ? 'open' : ''}`}>
          <ThemeProvider
            theme={theme => ({
              ...theme,
              context: 'product',
            })}
          >
            <LayoutManager
              globalNavigation={this.renderGlobalNavigation}
              productNavigation={() => null}
              containerNavigation={this.renderSidebarContents}
              experimental_hideNavVisuallyOnCollapse
              experimental_flyoutOnHover
              experimental_alternateFlyoutBehaviour
              // experimental_fullWidthFlyout
              shouldHideGlobalNavShadow
              showContextualNavigation
            >
            </LayoutManager>
          </ThemeProvider>
        </div>

        { isDrawerOpened && (
          <div className="grw-sidebar-backdrop modal-backdrop show" onClick={this.backdropClickedHandler}></div>
        ) }
      </>
    );
  }

}

const SidebarWithNavigationUI = withNavigationUIController(Sidebar);
const SidebarWithNavigationUIAndTranslation = withTranslation()(SidebarWithNavigationUI);

/**
 * Wrapper component for using unstated
 */
const SidebarWrapper = (props) => {
  return createSubscribedElement(SidebarWithNavigationUIAndTranslation, props, [AppContainer]);
};

export default () => (
  <NavigationProvider><SidebarWrapper /></NavigationProvider>
);
