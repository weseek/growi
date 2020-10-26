import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';


const CustomNavigation = (props) => {
  const [activeTab, setActiveTab] = useState(Object.keys(props.navTabMapping)[0]);
  const refs = useRef([]);

  Object.keys(props.navTabMapping).forEach((_, i) => {
    refs.current[i] = React.createRef();
    // console.log(`refs.current[i] = ${refs.current[i]}`);
    console.log(`JSON.stringify(refs) : ${JSON.stringify(refs.current[i])}`);
  });
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

  console.log(`JSON.stringify(refs) : ${JSON.stringify(refs)}`);
  console.log(`refs.current[0] = ${refs.current[0]}`);

  // const mounted = useRef(false);
  useEffect(() => {
    // console.log(`refs.current =${refs.current}`);
    console.log(`useEffecet ${activeTab}`);
    if (activeTab === '') {
      return;
    }

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
    console.log(`sliderWidth = ${sliderWidth}`);
    // }
    // else {
    //   // Mounted
    //   console.log(JSON.stringify(elm.current.getBoundingClientRect()));
    //   mounted.current = true;
    //   console.log(`Mounted! ${activeTab}`);
    //   setDefaultActiveTab(activeTab);
    //   setSliderWidth(activeTab.offsetWidth);
    // }

  }, [activeTab]);


  // function renderNavSlideHr() {
  //   if (defaultActiveTab === activeTab) {
  //     console.log('1st');
  //     console.log(`defaultActiveTab = ${defaultActiveTab}`);
  //     return;
  //   }
  //   console.log('2nd');
  //   return <hr className="my-0 grw-nav-slide-hr border-none" style={{ width: `${sliderWidth}%`, marginLeft: `${sliderMarginLeft}%` }} />;
  // }

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
              className={`p-0 grw-custom-navtab ${activeTab === key && 'active'} ${defaultActiveTab === key && 'default-active-tab'}`}
            >
              <NavLink key={key} ref={refs.current[key]} onClick={() => { switchActiveTab(key) }}>
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
