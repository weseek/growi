import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';


const CustomNavigation = (props) => {
  const [activeTab, setActiveTab] = useState(Object.keys(props.navTabMapping)[0]);
  console.log(`customNavigation ${activeTab}`);

  const [defaultActiveTab, setDefaultActiveTab] = useState('');
  const [sliderWidth, setSliderWidth] = useState(null);
  const [sliderMarginLeft, setSliderMarginLeft] = useState(0);

  function switchActiveTab(activeTab) {
    setActiveTab(activeTab);
  }

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    return min / max * 100;
  }
  const navBar = document.getElementById('grw-custom-navbar');
  const navTabs = document.querySelectorAll('ul.grw-custom-navbar > li.grw-custom-navtab');

  const mounted = useRef(false);
  useEffect(() => {
    console.log(`useEffecet ${activeTab}`);
    if (activeTab === '') {
      return;
    }

    if (mounted.current) {
      // Update時の処理
      setDefaultActiveTab('');
      console.log('Updated!');

      if (navBar == null || navTabs == null) {
        console.log(`${navBar},${navTabs}`);
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
    }
    else {
      // Mount時の処理
      mounted.current = true;
      console.log(`Mounted! ${activeTab}`);
      setDefaultActiveTab(activeTab);
      setSliderWidth(activeTab.offsetWidth);
    }

  }, [activeTab]);


  function renderNavSlideHr() {
    if (defaultActiveTab === activeTab) {
      console.log(`defaultActiveTab = ${defaultActiveTab}`);
      return;
    }
    return <hr className="my-0 grw-nav-slide-hr border-none" style={{ width: `${sliderWidth}%`, marginLeft: `${sliderMarginLeft}%` }} />;
  }


  return (
    <React.Fragment>
      <Nav className="nav-title grw-custom-navbar" id="grw-custom-navbar">
        {Object.entries(props.navTabMapping).map(([key, value]) => {
          console.log('return');
          // console.log(`sliderWidth = ${sliderWidth}% & sliderMarginLeft = ${sliderMarginLeft}%`);
          return (
            <NavItem key={key} type="button" className={`p-0 grw-custom-navtab ${activeTab === key && 'active'} ${defaultActiveTab === key && 'default-active-tab'}`}>
              <NavLink onClick={() => { switchActiveTab(key) }}>
                {value.icon}
                {value.i18n}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
      {renderNavSlideHr()}
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
