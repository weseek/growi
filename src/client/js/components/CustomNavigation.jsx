import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';


import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';

import { withUnstatedContainers } from './UnstatedUtils';

import CustomNavigationContainer from '../services/CustomNavigationContainer';


const CustomNavigation = (props) => {
  const { customNavigationContainer } = props;
  const { switchActiveTab } = customNavigationContainer;
  const { activeTab } = customNavigationContainer.state;
  // [TODO: set default active tab by gw4079]
  const [sliderWidth, setSliderWidth] = useState(null);
  const [sliderMarginLeft, setSliderMarginLeft] = useState(null);

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    return min / max * 100;
  }

  const random = Math.random().toString(32).substring(2);

  const navTitleId = `custom-navtitle-${random}`;
  const navTabId = `custom-navtab-${random}`;

  useEffect(() => {
    if (activeTab === '') {
      return;
    }

    const navTitle = document.getElementById(navTitleId);
    const navTabs = document.querySelectorAll(`li.${navTabId}`);

    if (navTitle == null || navTabs == null) {
      return;
    }

    let tempML = 0;

    const styles = [].map.call(navTabs, (el) => {
      const width = getPercentage(el.offsetWidth, navTitle.offsetWidth);
      const marginLeft = tempML;
      tempML += width;
      return { width, marginLeft };
    });

    const { width, marginLeft } = styles[props.navTabMapping[activeTab].index];

    setSliderWidth(width);
    setSliderMarginLeft(marginLeft);

  }, [activeTab]);


  return (
    <React.Fragment>
      <Nav className="nav-title" id={navTitleId}>
        {Object.entries(props.navTabMapping).map(([key, value]) => {
          return (
            <NavItem key={key} type="button" className={`p-0 ${navTabId} ${activeTab === key && 'active'}`}>
              <NavLink onClick={() => { switchActiveTab(key) }}>
                {value.icon}
                {value.i18n}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
      <hr className="my-0 grw-nav-slide-hr border-none" style={{ width: `${sliderWidth}%`, marginLeft: `${sliderMarginLeft}%` }} />
      <TabContent activeTab={activeTab} className="p-5">
        {Object.entries(props.navTabMapping).map(([key, value]) => {
          return (
            <TabPane key={key} tabId={key}>
              {value.tabContent}
            </TabPane>
          );
        })}
      </TabContent>
    </React.Fragment>
  );
};

/**
 * Wrapper component for using unstated
 */
const CustomNavigationWrapper = withUnstatedContainers(CustomNavigation, [CustomNavigationContainer]);

CustomNavigation.propTypes = {
  customNavigationContainer: PropTypes.instanceOf(CustomNavigationContainer).isRequired,
  navTabMapping: PropTypes.object,
};

export default CustomNavigationWrapper;
