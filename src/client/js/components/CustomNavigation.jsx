import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';


const CustomNav = (props) => {
  const navContainer = useRef();
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderMarginLeft, setSliderMarginLeft] = useState(0);

  const { activeTab, navTabMapping } = props;

  const navTabs = {};

  Object.keys(props.navTabMapping).forEach((key) => {
    navTabs[key] = React.createRef();
  });

  function navSelectedHandler(key) {
    if (props.onNavSelected != null) {
      props.onNavSelected(key);
    }
  }

  function registerNavLink(key, elm) {
    if (elm != null) {
      navTabs[key] = elm;
    }
  }

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    return min / max * 100;
  }


  useEffect(() => {
    if (activeTab === '') {
      return;
    }

    if (navContainer == null || navTabs == null) {
      return;
    }

    let tempML = 0;

    const styles = Object.entries(navTabs).map((el) => {
      const width = getPercentage(el[1].offsetWidth, navContainer.current.offsetWidth);
      const marginLeft = tempML;
      tempML += width;
      return { width, marginLeft };
    });
    const { width, marginLeft } = styles[navTabMapping[activeTab].index];

    setSliderWidth(width);
    setSliderMarginLeft(marginLeft);

  }, [activeTab, navTabs, navTabMapping]);

  return (
    <>
      <div ref={navContainer}>
        <Nav className="nav-title grw-custom-navbar" id="grw-custom-navbar">
          {Object.entries(navTabMapping).map(([key, value]) => {
            return (
              <NavItem

                key={key}
                type="button"
                className={`p-0 grw-custom-navtab ${activeTab === key && 'active'}}`}
              >
                <NavLink key={key} innerRef={elm => registerNavLink(key, elm)} onClick={() => { navSelectedHandler(key) }}>
                  {value.icon}
                  {value.i18n}
                </NavLink>
              </NavItem>
            );
          })}
        </Nav>
      </div>
      <hr className="my-0 grw-nav-slide-hr border-none" style={{ width: `${sliderWidth}%`, marginLeft: `${sliderMarginLeft}%` }} />
    </>
  );

};

CustomNav.propTypes = {
  activeTab: PropTypes.string.isRequired,
  navTabMapping: PropTypes.object.isRequired,
  onNavSelected: PropTypes.func,
};


const CustomTabContent = (props) => {

  const { activeTab, navTabMapping } = props;

  return (
    <TabContent activeTab={activeTab} className="p-4">
      {Object.entries(navTabMapping).map(([key, value]) => {
        return (
          <TabPane key={key} tabId={key}>
            {value.tabContent}
          </TabPane>
        );
      })}
    </TabContent>
  );

};

CustomTabContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  navTabMapping: PropTypes.object.isRequired,
};


const CustomNavigation = (props) => {
  const { navTabMapping } = props;
  const [activeTab, setActiveTab] = useState(Object.keys(props.navTabMapping)[0]);

  return (
    <React.Fragment>

      <CustomNav activeTab={activeTab} navTabMapping={navTabMapping} onNavSelected={setActiveTab} />
      <CustomTabContent activeTab={activeTab} navTabMapping={navTabMapping} />

    </React.Fragment>
  );
};

CustomNavigation.propTypes = {
  navTabMapping: PropTypes.object,
};

export default CustomNavigation;
