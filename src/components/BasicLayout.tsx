import dynamic from 'next/dynamic';
import React, { ReactNode, useCallback } from 'react';

import {
  withNavigationUIController,
  GlobalNavigationSkeleton,
  LayoutManager,
  NavigationProvider,
  ThemeProvider,
} from '@atlaskit/navigation-next';


import { withUnstatedContainers } from '~/client/js/components/UnstatedUtils';
import GrowiNavbar from '~/client/js/components/Navbar/GrowiNavbar';
import GrowiNavbarBottom from '~/client/js/components/Navbar/GrowiNavbarBottom';
import SidebarNav from '~/client/js/components//Sidebar/SidebarNav';
import NavigationContainer from '~/client/js/services/NavigationContainer';

import RawLayout from './RawLayout';


type GlobalNavigationProps = {
  navigationContainer: NavigationContainer,
  navigationUIController: any, // UIController from @atlaskit/navigation-next
}

const GlobalNavigation = withUnstatedContainers(withNavigationUIController((props: GlobalNavigationProps): JSX.Element => {

  if (!process.browser) {
    return <SidebarNav />;
  }

  const itemSelectedHandler = (contentsId) => {
    const { navigationContainer, navigationUIController } = props;
    const { sidebarContentsId } = navigationContainer.state;

    // already selected
    if (sidebarContentsId === contentsId) {
      navigationUIController.toggleCollapse();
    }
    // switch and expand
    else {
      navigationUIController.expand();
    }
  };

  return <SidebarNav onItemSelected={itemSelectedHandler} />;
}), [NavigationContainer]);


const SidebarContents = () => {
  const scrollTargetSelector = '#grw-sidebar-contents-scroll-target';

  const StickyStretchableScroller = dynamic(() => import('~/client/js/components/StickyStretchableScroller'), { ssr: false });
  const DrawerToggler = dynamic(() => import('~/client/js/components/Navbar/DrawerToggler'), { ssr: false });
  const SidebarContents = dynamic(() => import('~/client/js/components/Sidebar/SidebarContents'), { ssr: false });

  const calcViewHeight = useCallback(() => {
    const scrollTargetElem = document.querySelector('#grw-sidebar-contents-scroll-target');
    return scrollTargetElem != null
      ? window.innerHeight - scrollTargetElem?.getBoundingClientRect().top
      : window.innerHeight;
  }, []);

  return (
    <>
      {/* <StickyStretchableScroller
        scrollTargetSelector={scrollTargetSelector}
        contentsElemSelector="#grw-sidebar-content-container"
        stickyElemSelector=".grw-sidebar"
        calcViewHeightFunc={calcViewHeight}
      /> */}

      <div id="grw-sidebar-contents-scroll-target">
        <div id="grw-sidebar-content-container">
          {/* TODO: set isSharedUser
          <SidebarContents
            isSharedUser={this.props.appContainer.isSharedUser}
          />
          */}
          <SidebarContents />
        </div>
      </div>

      <DrawerToggler iconClass="icon-arrow-left" />
    </>
  );
};

type Props = {
  title: string
  children?: ReactNode
}

const BasicLayout = ({ children, title }: Props): JSX.Element => {

  const HotkeysManager = dynamic(() => import('../client/js/components/Hotkeys/HotkeysManager'), { ssr: false });
  const PageCreateModal = dynamic(() => import('../client/js/components/PageCreateModal'), { ssr: false });

  return (
    <div className="grw-basic-layout">
      <RawLayout title={title}>
        <GrowiNavbar />

        <div className="page-wrapper d-print-block">
          <NavigationProvider>
            <ThemeProvider
              theme={theme => ({
                ...theme,
                context: 'product',
              })}
            >
              <LayoutManager
                globalNavigation={GlobalNavigation}
                productNavigation={() => null}
                containerNavigation={SidebarContents}
                experimental_hideNavVisuallyOnCollapse
                experimental_flyoutOnHover
                experimental_alternateFlyoutBehaviour
                experimental_fullWidthFlyout
                shouldHideGlobalNavShadow
                showContextualNavigation
              >
                {children}
              </LayoutManager>
            </ThemeProvider>
          </NavigationProvider>
        </div>

        <GrowiNavbarBottom />
      </RawLayout>

      <PageCreateModal />
      <HotkeysManager />
    </div>
  );
};

export default BasicLayout;
