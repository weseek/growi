import React, { useState } from 'react';
import PropTypes from 'prop-types';

import CustomNav from './CustomNav';
import CustomTabContent from './CustomTabContent';

const CustomNavigation = (props) => {
  const {
    navTabMapping, defaultTabIndex, tabContentClasses, breakpointToHideInactiveTabsDown,
  } = props;
  const [activeTab, setActiveTab] = useState(Object.keys(props.navTabMapping)[defaultTabIndex || 0]);

  return (
    <React.Fragment>

      <CustomNav
        activeTab={activeTab}
        navTabMapping={navTabMapping}
        onNavSelected={setActiveTab}
        breakpointToHideInactiveTabsDown={breakpointToHideInactiveTabsDown}
      />
      <CustomTabContent activeTab={activeTab} navTabMapping={navTabMapping} additionalClassNames={tabContentClasses} />

    </React.Fragment>
  );
};

CustomNavigation.propTypes = {
  navTabMapping: PropTypes.object.isRequired,
  defaultTabIndex: PropTypes.number,
  tabContentClasses: PropTypes.arrayOf(PropTypes.string),
  breakpointToHideInactiveTabsDown: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
};
CustomNavigation.defaultProps = {
  tabContentClasses: ['p-4'],
};

export default CustomNavigation;
