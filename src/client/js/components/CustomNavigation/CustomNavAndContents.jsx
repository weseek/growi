import React, { useState } from 'react';
import PropTypes from 'prop-types';

import CustomNav, { CustomNavTab, CustomNavDropdown } from './CustomNav';
import CustomTabContent from './CustomTabContent';


const CustomNavAndContents = (props) => {
  const {
    navTabMapping, defaultTabIndex, navigationMode, tabContentClasses, breakpointToHideInactiveTabsDown,
  } = props;
  const [activeTab, setActiveTab] = useState(Object.keys(props.navTabMapping)[defaultTabIndex || 0]);

  let SelectedNav;
  switch (navigationMode) {
    case 'tab':
      SelectedNav = CustomNavTab;
      break;
    case 'dropdown':
      SelectedNav = CustomNavDropdown;
      break;
    case 'both':
      SelectedNav = CustomNav;
      break;
  }

  return (
    <>
      <SelectedNav
        activeTab={activeTab}
        navTabMapping={navTabMapping}
        onNavSelected={setActiveTab}
        breakpointToHideInactiveTabsDown={breakpointToHideInactiveTabsDown}
      />
      <CustomTabContent activeTab={activeTab} navTabMapping={navTabMapping} additionalClassNames={tabContentClasses} />
    </>
  );
};

CustomNavAndContents.propTypes = {
  navTabMapping: PropTypes.object.isRequired,
  defaultTabIndex: PropTypes.number,
  navigationMode: PropTypes.oneOf(['both', 'tab', 'dropdown']),
  tabContentClasses: PropTypes.arrayOf(PropTypes.string),
  breakpointToHideInactiveTabsDown: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
};
CustomNavAndContents.defaultProps = {
  navigationMode: 'tab',
  tabContentClasses: ['p-4'],
};

export default CustomNavAndContents;
