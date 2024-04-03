import React, {
  useRef, useMemo, useCallback,
} from 'react';

import {
  Nav, NavItem, NavLink,
} from 'reactstrap';

import type { ICustomNavTabMappings } from '~/interfaces/ui';

import styles from './CustomNavButton.module.scss';

type CustomNavTabProps = {
  activeTab: string,
  navTabMapping: ICustomNavTabMappings,
  onNavSelected?: (selectedTabKey: string) => void,
};

export const CustomNavTab = (props: CustomNavTabProps): JSX.Element => {

  const {
    activeTab, navTabMapping, onNavSelected,
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

  return (
    <div className={`grw-custom-nav-tab ${styles['grw-custom-nav-tab']}`}>
      <div ref={navContainerRef} className="d-flex justify-content-between">
        <Nav className="nav-title rounded">
          {Object.entries(navTabMapping).map(([key, value]) => {

            const isActive = activeTab === key;
            const _isLinkEnabled = value.isLinkEnabled ?? true;
            const isLinkEnabled = typeof _isLinkEnabled === 'boolean' ? _isLinkEnabled : _isLinkEnabled(value);
            const { Icon, i18n } = value;

            return (
              <NavItem
                key={key}
                className={`${isActive ? 'active' : 'passive'}`}
              >
                <NavLink type="button" key={key} innerRef={elm => registerNavLink(key, elm)} disabled={!isLinkEnabled} onClick={() => navLinkClickHandler(key)}>
                  { Icon != null && <span className="me-1"><Icon /></span> } {i18n}
                </NavLink>
              </NavItem>
            );
          })}
        </Nav>
      </div>
    </div>
  );

};
