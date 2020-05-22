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
import History from './Sidebar/History';
import CustomSidebar from './Sidebar/CustomSidebar';


const sidebarDefaultWidth = 240;

class Sidebar extends React.Component {

  static propTypes = {
    appContainer: PropTypes.instanceOf(AppContainer).isRequired,
    navigationUIController: PropTypes.any.isRequired,
  };

  state = {
    currentContentsId: 'custom',
  };

  componentWillMount() {
    this.initBreakpointEvents();
  }

  initBreakpointEvents() {
    const { appContainer, navigationUIController } = this.props;

    document.addEventListener('DOMContentLoaded', () => {
      // get the value of '--breakpoint-*'
      // const breakpointSm = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-sm'), 10);
      const breakpointMd = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-md'), 10);

      const smHandler = (mql) => {
        if (mql.matches) {
          // cache width
          this.sidebarWidthCached = navigationUIController.state.productNavWidth;

          appContainer.setState({ isDrawerOpened: false });
          navigationUIController.disableResize();
          navigationUIController.expand();

          // fix width
          navigationUIController.setState({ productNavWidth: sidebarDefaultWidth });
        }
        else {
          appContainer.setState({ isDrawerOpened: false });
          navigationUIController.enableResize();

          // restore width
          if (this.sidebarWidthCached != null) {
            navigationUIController.setState({ productNavWidth: this.sidebarWidthCached });
          }
        }
      };

      // const mediaQueryForXs = window.matchMedia(`(max-width: ${breakpointSm}px)`);
      const mediaQueryForSm = window.matchMedia(`(max-width: ${breakpointMd}px)`);

      // add event listener
      // mediaQueryForXs.addListener(xsHandler);
      mediaQueryForSm.addListener(smHandler);
      // initialize
      // xsHandler(mediaQueryForXs);
      smHandler(mediaQueryForSm);
    });
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
    let contents = <CustomSidebar></CustomSidebar>;

    switch (this.state.currentContentsId) {
      case 'history':
        contents = <History></History>;
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
