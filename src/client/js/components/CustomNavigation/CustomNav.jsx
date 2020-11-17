import React, {
  useEffect, useState, useRef, useMemo, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
  Nav, NavItem, NavLink,
} from 'reactstrap';


export const CustomNavDropdown = (props) => {
  const {
    activeTab, navTabMapping, onNavSelected,
  } = props;

  const activeObj = navTabMapping[activeTab];

  const menuItemClickHandler = useCallback((key) => {
    if (onNavSelected != null) {
      onNavSelected(key);
    }
  }, [onNavSelected]);

  return (
    <div className="btn-group btn-block">
      <button
        className="btn btn-outline-primary btn-lg btn-block dropdown-toggle text-right"
        type="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span className="float-left">
          { activeObj != null && (
            <><activeObj.Icon /> {activeObj.i18n}</>
          ) }
        </span>
      </button>
      <div className="dropdown-menu dropdown-menu-right">
        {Object.entries(navTabMapping).map(([key, value]) => {

          const isActive = activeTab === key;
          const isLinkEnabled = value.isLinkEnabled != null ? value.isLinkEnabled(value) : true;
          const { Icon, i18n } = value;

          return (
            <button
              key={key}
              type="button"
              className={`dropdown-item px-3 py-2 ${isActive ? 'active' : ''}`}
              disabled={!isLinkEnabled}
              onClick={() => menuItemClickHandler(key)}
            >
              <Icon /> {i18n}
            </button>
          );
        })}
      </div>
    </div>
  );
};

CustomNavDropdown.propTypes = {
  activeTab: PropTypes.string.isRequired,
  navTabMapping: PropTypes.object.isRequired,
  onNavSelected: PropTypes.func,
};


export const CustomNavTab = (props) => {
  const navContainer = useRef();
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderMarginLeft, setSliderMarginLeft] = useState(0);

  const {
    activeTab, navTabMapping, onNavSelected, hideBorderBottom, breakpointToHideInactiveTabsDown,
  } = props;

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

  // determine inactive classes to hide NavItem
  const inactiveClassnames = [];
  if (breakpointToHideInactiveTabsDown != null) {
    inactiveClassnames.push('d-none');
    switch (breakpointToHideInactiveTabsDown) {
      case 'sm':
        inactiveClassnames.push('d-md-block');
        break;
      case 'md':
        inactiveClassnames.push('d-lg-block');
        break;
      case 'lg':
        inactiveClassnames.push('d-xl-block');
        break;
      case 'xl':
        inactiveClassnames.push('d-2xl-block');
        break;
    }
  }

  return (
    <>
      <div ref={navContainer}>
        <Nav className="nav-title">
          {Object.entries(navTabMapping).map(([key, value]) => {

            const isActive = activeTab === key;
            const isLinkEnabled = value.isLinkEnabled != null ? value.isLinkEnabled(value) : true;
            const { Icon, i18n } = value;

            return (
              <NavItem
                key={key}
                className={`p-0 grw-custom-navtab ${isActive ? 'active' : inactiveClassnames.join(' ')}`}
              >
                <NavLink type="button" key={key} innerRef={elm => registerNavLink(key, elm)} disabled={!isLinkEnabled} onClick={() => navLinkClickHandler(key)}>
                  <Icon /> {i18n}
                </NavLink>
              </NavItem>
            );
          })}
        </Nav>
      </div>
      <hr className="my-0 grw-nav-slide-hr border-none" style={{ width: `${sliderWidth}%`, marginLeft: `${sliderMarginLeft}%` }} />
      { !hideBorderBottom && <hr className="my-0 border-top-0 border-bottom" /> }
    </>
  );

};

CustomNavTab.propTypes = {
  activeTab: PropTypes.string.isRequired,
  navTabMapping: PropTypes.object.isRequired,
  onNavSelected: PropTypes.func,
  hideBorderBottom: PropTypes.bool,
  breakpointToHideInactiveTabsDown: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
};

CustomNavTab.defaultProps = {
  hideBorderBottom: false,
};


const CustomNav = (props) => {

  return (
    <div className="grw-custom-nav">
      <CustomNavTab {...props} />
      <CustomNavDropdown {...props} />
    </div>
  );

};

CustomNav.propTypes = {
  activeTab: PropTypes.string.isRequired,
  navTabMapping: PropTypes.object.isRequired,
  onNavSelected: PropTypes.func,
  hideBorderBottom: PropTypes.bool,
  breakpointToHideInactiveTabsDown: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  breakpointToSwitchToDropdownDown: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
};

CustomNav.defaultProps = {
  hideBorderBottom: false,
};


export default CustomNav;
