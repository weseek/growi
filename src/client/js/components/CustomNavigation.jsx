import React, {
  useEffect, useState, useRef, useMemo, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';


export const CustomNav = (props) => {
  const navContainer = useRef();
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderMarginLeft, setSliderMarginLeft] = useState(0);

  const { activeTab, navTabMapping, onNavSelected } = props;

  const navTabRefs = useMemo(() => {
    const obj = {};
    Object.keys(navTabMapping).forEach((key) => {
      obj[key] = React.createRef();
    });
    return obj;
  }, [navTabMapping]);

  const navLinkClickHandler = useCallback((key) => {
    if (onNavSelected != null) {
      onNavSelected(key);
    }
  }, [onNavSelected]);

  function registerNavLink(key, elm) {
    if (elm != null) {
      navTabRefs[key] = elm;
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

    if (navContainer == null) {
      return;
    }

    let tempML = 0;

    const styles = Object.entries(navTabRefs).map((el) => {
      const width = getPercentage(el[1].offsetWidth, navContainer.current.offsetWidth);
      const marginLeft = tempML;
      tempML += width;
      return { width, marginLeft };
    });
    const { width, marginLeft } = styles[navTabMapping[activeTab].index];

    setSliderWidth(width);
    setSliderMarginLeft(marginLeft);

  }, [activeTab, navTabRefs, navTabMapping]);

  return (
    <>
      <div ref={navContainer}>
        <Nav className="nav-title grw-custom-navbar" id="grw-custom-navbar">
          {Object.entries(navTabMapping).map(([key, value]) => {

            const isActive = activeTab === key;
            const isLinkEnabled = value.isLinkEnabled != null ? value.isLinkEnabled(value) : true;
            const { Icon, i18n } = value;

            return (
              <NavItem
                key={key}
                type="button"
                className={`p-0 grw-custom-navtab ${isActive && 'active'}}`}
              >
                <NavLink key={key} innerRef={elm => registerNavLink(key, elm)} disabled={!isLinkEnabled} onClick={() => navLinkClickHandler(key)}>
                  <Icon /> {i18n}
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


export const CustomTabContent = (props) => {

  const { activeTab, navTabMapping, additionalClassNames } = props;

  return (
    <TabContent activeTab={activeTab} className={additionalClassNames.join(' ')}>
      {Object.entries(navTabMapping).map(([key, value]) => {

        const { Content } = value;

        return (
          <TabPane key={key} tabId={key}>
            <Content />
          </TabPane>
        );
      })}
    </TabContent>
  );

};

CustomTabContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  navTabMapping: PropTypes.object.isRequired,
  additionalClassNames: PropTypes.arrayOf(PropTypes.string),
};
CustomTabContent.defaultProps = {
  additionalClassNames: [],
};


const CustomNavigation = (props) => {
  const { navTabMapping, defaultTabIndex, tabContentClasses } = props;
  const [activeTab, setActiveTab] = useState(Object.keys(props.navTabMapping)[defaultTabIndex || 0]);

  return (
    <React.Fragment>

      <CustomNav activeTab={activeTab} navTabMapping={navTabMapping} onNavSelected={setActiveTab} />
      <CustomTabContent activeTab={activeTab} navTabMapping={navTabMapping} additionalClassNames={tabContentClasses} />

    </React.Fragment>
  );
};

CustomNavigation.propTypes = {
  navTabMapping: PropTypes.object.isRequired,
  defaultTabIndex: PropTypes.number,
  tabContentClasses: PropTypes.arrayOf(PropTypes.string),
};
CustomNavigation.defaultProps = {
  tabContentClasses: ['p-4'],
};

export default CustomNavigation;
