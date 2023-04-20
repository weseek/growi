import React, {
  useEffect, useState, useRef, useMemo, useCallback,
} from 'react';

import { Breakpoint } from '@growi/ui/dist/interfaces/breakpoints';
import Nav from 'reactstrap/es/Nav';
import NavItem from 'reactstrap/es/NavItem';
import NavLink from 'reactstrap/es/NavLink';

import { ICustomNavTabMappings } from '~/interfaces/ui';

import styles from './CustomNav.module.scss';


function getBreakpointOneLevelLarger(breakpoint: Breakpoint): Omit<Breakpoint, 'xs' | 'sm'> {
  switch (breakpoint) {
    case 'xs':
      return 'sm';
    case 'sm':
      return 'md';
    case 'md':
      return 'lg';
    case 'lg':
      return 'xl';
    case 'xl':
    default:
      return 'xxl';
  }
}


type CustomNavDropdownProps = {
  navTabMapping: ICustomNavTabMappings,
  activeTab: string,
  onNavSelected?: (selectedTabKey: string) => void,
};

export const CustomNavDropdown = (props: CustomNavDropdownProps): JSX.Element => {
  const {
    activeTab, navTabMapping, onNavSelected,
  } = props;

  const { Icon, i18n } = navTabMapping[activeTab];

  const menuItemClickHandler = useCallback((key) => {
    if (onNavSelected != null) {
      onNavSelected(key);
    }
  }, [onNavSelected]);

  return (
    <div className="grw-custom-nav-dropdown btn-group btn-block">
      <button
        className="btn btn-outline-primary btn-lg btn-block dropdown-toggle text-right"
        type="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span className="float-left">
          { Icon != null && <Icon /> } {i18n}
        </span>
      </button>
      <div className="dropdown-menu dropdown-menu-right">
        {Object.entries(navTabMapping).map(([key, value]) => {

          const isActive = activeTab === key;
          const _isLinkEnabled = value.isLinkEnabled ?? true;
          const isLinkEnabled = typeof _isLinkEnabled === 'boolean' ? _isLinkEnabled : _isLinkEnabled(value);
          const { Icon, i18n } = value;

          return (
            <button
              key={key}
              type="button"
              className={`dropdown-item px-3 py-2 ${isActive ? 'active' : ''}`}
              disabled={!isLinkEnabled}
              onClick={() => menuItemClickHandler(key)}
            >
              { Icon != null && <Icon /> } {i18n}
            </button>
          );
        })}
      </div>
    </div>
  );
};


type CustomNavTabProps = {
  activeTab: string,
  navTabMapping: ICustomNavTabMappings,
  onNavSelected?: (selectedTabKey: string) => void,
  hideBorderBottom?: boolean,
  breakpointToHideInactiveTabsDown?: Breakpoint,
  navRightElement?: JSX.Element,
};

export const CustomNavTab = (props: CustomNavTabProps): JSX.Element => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderMarginLeft, setSliderMarginLeft] = useState(0);

  const {
    activeTab, navTabMapping, onNavSelected,
    hideBorderBottom,
    breakpointToHideInactiveTabsDown, navRightElement,
  } = props;

  const navContainerRef = useRef<HTMLDivElement>(null);

  const navTabRefs: { [key: string]: HTMLAnchorElement } = useMemo(() => {
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

  function registerNavLink(key: string, anchorElem: HTMLAnchorElement | null) {
    if (anchorElem != null) {
      navTabRefs[key] = anchorElem;
    }
  }

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    return min / max * 100;
  }

  useEffect(() => {
    if (activeTab == null || activeTab === '') {
      return;
    }

    if (navContainerRef.current == null) {
      return;
    }

    const navContainer = navContainerRef.current;

    let marginLeft = 0;
    for (const [key, anchorElem] of Object.entries(navTabRefs)) {
      const width = getPercentage(anchorElem.offsetWidth, navContainer.offsetWidth);

      if (key === activeTab) {
        setSliderWidth(width);
        setSliderMarginLeft(marginLeft);
        break;
      }

      marginLeft += width;
    }
  }, [activeTab, navTabRefs, navTabMapping]);

  // determine inactive classes to hide NavItem
  const inactiveClassnames: string[] = [];
  if (breakpointToHideInactiveTabsDown != null) {
    const breakpointOneLevelLarger = getBreakpointOneLevelLarger(breakpointToHideInactiveTabsDown);
    inactiveClassnames.push('d-none');
    inactiveClassnames.push(`d-${breakpointOneLevelLarger}-block`);
  }

  return (
    <div className={`grw-custom-nav-tab ${styles['grw-custom-nav-tab']}`}>
      <div ref={navContainerRef} className="d-flex justify-content-between">
        <Nav className="nav-title">
          {Object.entries(navTabMapping).map(([key, value]) => {

            const isActive = activeTab === key;
            const _isLinkEnabled = value.isLinkEnabled ?? true;
            const isLinkEnabled = typeof _isLinkEnabled === 'boolean' ? _isLinkEnabled : _isLinkEnabled(value);
            const { Icon, i18n } = value;

            return (
              <NavItem
                key={key}
                className={`p-0 ${isActive ? 'active' : inactiveClassnames.join(' ')}`}
              >
                <NavLink type="button" key={key} innerRef={elm => registerNavLink(key, elm)} disabled={!isLinkEnabled} onClick={() => navLinkClickHandler(key)}>
                  { Icon != null && <Icon /> } {i18n}
                </NavLink>
              </NavItem>
            );
          })}
        </Nav>
        {navRightElement}
      </div>
      <hr className="my-0 grw-nav-slide-hr border-none" style={{ width: `${sliderWidth}%`, marginLeft: `${sliderMarginLeft}%` }} />
      { !hideBorderBottom && <hr className="my-0 border-top-0 border-bottom" /> }
    </div>
  );

};


type CustomNavProps = {
  activeTab: string,
  navTabMapping: ICustomNavTabMappings,
  onNavSelected?: (selectedTabKey: string) => void,
  hideBorderBottom?: boolean,
  breakpointToHideInactiveTabsDown?: Breakpoint,
  breakpointToSwitchDropdownDown?: Breakpoint,
};

const CustomNav = (props: CustomNavProps): JSX.Element => {

  const tabClassnames = ['d-none'];
  const dropdownClassnames = ['d-block'];

  // determine classes to show/hide
  const breakpointOneLevelLarger = getBreakpointOneLevelLarger(props.breakpointToSwitchDropdownDown ?? 'sm');
  tabClassnames.push(`d-${breakpointOneLevelLarger}-block`);
  dropdownClassnames.push(`d-${breakpointOneLevelLarger}-none`);

  return (
    <div className="grw-custom-nav">
      <div className={tabClassnames.join(' ')}>
        <CustomNavTab {...props} />
      </div>
      <div className={dropdownClassnames.join(' ')}>
        <CustomNavDropdown {...props} />
      </div>
    </div>
  );

};

export default CustomNav;
