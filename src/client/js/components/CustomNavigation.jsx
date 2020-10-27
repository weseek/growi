import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';


const CustomNavigation = (props) => {
  const [activeTab, setActiveTab] = useState(Object.keys(props.navTabMapping)[0]);
  const [sliderWidth, setSliderWidth] = useState(100);
  const [sliderMarginLeft, setSliderMarginLeft] = useState(0);
  const tabs = {};
  const nav = useRef();
  const hr = useRef();

  Object.keys(props.navTabMapping).forEach((key) => {
    tabs[key] = React.createRef();
  });

  console.log(`customNavigation ${activeTab}`);


  function switchActiveTab(activeTab) {
    setActiveTab(activeTab);
  }

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    return min / max * 100;
  }


  const navTabs = document.querySelectorAll('ul.grw-custom-navbar > li.grw-custom-navtab');
  const navBar = document.getElementById('grw-custom-navbar');

  useEffect(() => {


    console.log(`useEffecet ${activeTab}`);
    console.log('reffff', tabs);
    console.log('tabs[activeTab].current', tabs[activeTab].current);
    // console.log(`ref.current = ${nav.current}`);
    console.log('nav', nav);
    console.log('hr', hr);

    if (activeTab === '') {
      return;
    }


    if (navBar == null || navTabs == null) {
      console.log(`${navBar},${navTabs}`);
      setSliderWidth(5);
      return;
    }


    let tempML = 0;

    const styles = [].map.call(navTabs, (el) => {
      const width = getPercentage(el.offsetWidth, navBar.offsetWidth);
      const marginLeft = tempML;
      tempML += width;
      return { width, marginLeft };
    });
    const { width, marginLeft } = styles[props.navTabMapping[activeTab].index];

    setSliderWidth(width);
    setSliderMarginLeft(marginLeft);
    console.log(`sliderWidth = ${sliderWidth}`);

  }, [activeTab]);

  return (
    <React.Fragment>
      <Nav ref={nav} className="nav-title grw-custom-navbar" id="grw-custom-navbar">
        {Object.entries(props.navTabMapping).map(([key, value]) => {
          console.log(`key = ${key}, value = ${value.index}`);
          return (
            <NavItem

              key={key}
              type="button"
              className={`p-0 grw-custom-navtab ${activeTab === key && 'active'}}`}
            >
              <NavLink key={key} ref={tabs[key]} onClick={() => { switchActiveTab(key) }}>
                {value.icon}
                {value.i18n}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
      {/* {renderNavSlideHr()} */}
      <hr ref={hr} className="my-0 grw-nav-slide-hr border-none" style={{ width: `${sliderWidth}%`, marginLeft: `${sliderMarginLeft}%` }} />
      {/* <hr className="my-0 grw-nav-slide-hr border-none" style={{ width: `${sliderWidth}%`, marginLeft: `${sliderMarginLeft}%` }} /> */}
      <TabContent activeTab={activeTab} className="p-4">
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

CustomNavigation.propTypes = {
  navTabMapping: PropTypes.object,
};

export default CustomNavigation;
