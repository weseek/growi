import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';


import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';

import CustomNavbarContainer from '../services/CustomNavbarContainer';


const CustomNavbar = (props) => {
  const { t, customNavbarContainer } = props;
  const { switchActiveTab } = customNavbarContainer;
  const { activeTab } = customNavbarContainer.state;
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
                    {t(value.i18n)}
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
const CustomNavbarWrapper = withUnstatedContainers(CustomNavbar, [CustomNavbarContainer]);

CustomNavbar.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  customNavbarContainer: PropTypes.instanceOf(CustomNavbarContainer).isRequired,
  navTabMapping: PropTypes.object,
};

export default withTranslation()(CustomNavbarWrapper);
