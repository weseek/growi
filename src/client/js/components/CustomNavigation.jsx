import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';


const CustomNavigation = (props) => {
  const [activeTab, setActiveTab] = useState(Object.keys(props.navTabMapping)[0]);
  const refs = {};

  Object.keys(props.navTabMapping).forEach((key) => {
    refs[key] = React.createRef();
  });

  console.log(`customNavigation ${activeTab}`);

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

  JSON.stringify(refs);
  // console.log(`stringifyRefs : ${stringifyRefs}`);
  console.log('ref', refs);

  useEffect(() => {
    console.log(`useEffecet ${activeTab}`);
    if (activeTab === '') {
      return;
    }

    // setDefaultActiveTab('');

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
    console.log(`sliderWidth = ${sliderWidth}`);

  }, [activeTab]);


  return (
    <React.Fragment>
      <Nav className="nav-title grw-custom-navbar" id="grw-custom-navbar">
        {Object.entries(props.navTabMapping).map(([key, value]) => {
          console.log(`key = ${key}, value = ${value.index}`);
          // console.log(`refs.current[key] = ${refs.current[key]}`); // undefined
          return (
            <NavItem

              key={key}
              type="button"
              className={`p-0 grw-custom-navtab ${activeTab === key && 'active'}}`}
            >
              <NavLink key={key} ref={refs[key]} onClick={() => { switchActiveTab(key) }}>
                {value.icon}
                {value.i18n}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
      {/* {renderNavSlideHr()} */}
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
    </React.Fragment>
  );
};

CustomNavigation.propTypes = {
  navTabMapping: PropTypes.object,
};

export default CustomNavigation;
