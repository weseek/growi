import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';


const CustomNavigation = (props) => {
  const [activeTab, setActiveTab] = useState(Object.keys(props.navTabMapping)[0]);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderMarginLeft, setSliderMarginLeft] = useState(0);
  const nav = useRef();
  const tabs = {};

  Object.keys(props.navTabMapping).forEach((key) => {
    tabs[key] = React.createRef();
  });


  function switchActiveTab(activeTab) {
    setActiveTab(activeTab);
  }

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    return min / max * 100;
  }

  function registerNavLink(key, elm) {
    if (elm != null) {
      tabs[key] = elm;
    }
  }

  useEffect(() => {

    const navBar = nav;
    const navTabs = tabs;

    if (activeTab === '') {
      return;
    }

    if (navBar == null || navTabs == null) {
      return;
    }

    let tempML = 0;

    const styles = Object.entries(navTabs).map((el) => {
      const width = getPercentage(el[1].offsetWidth, navBar.current.offsetWidth);
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
      <div ref={nav}>
        <Nav className="nav-title grw-custom-navbar" id="grw-custom-navbar">
          {Object.entries(props.navTabMapping).map(([key, value]) => {
            return (
              <NavItem

                key={key}
                type="button"
                className={`p-0 grw-custom-navtab ${activeTab === key && 'active'}}`}
              >
                <NavLink key={key} innerRef={elm => registerNavLink(key, elm)} onClick={() => { switchActiveTab(key) }}>
                  {value.icon}
                  {value.i18n}
                </NavLink>
              </NavItem>
            );
          })}
        </Nav>
        <hr className="my-0 grw-nav-slide-hr border-none" style={{ width: `${sliderWidth}%`, marginLeft: `${sliderMarginLeft}%` }} />
        <TabContent activeTab={activeTab} className="p-4">
          {Object.entries(props.navTabMapping).map(([key, value]) => {
            return (
              <TabPane key={key} tabId={key}>
                {value.tabContent}
              </TabPane>
            );
          })}
        </TabContent>
      </div>
    </React.Fragment>
  );
};

CustomNavigation.propTypes = {
  navTabMapping: PropTypes.object,
};

export default CustomNavigation;
